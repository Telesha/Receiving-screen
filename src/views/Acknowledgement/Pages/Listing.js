import React, { useState, useEffect, Fragment, createContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Tooltip
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder'
import { LoadingComponent } from './../../../utils/newLoader';
import { AgriGenERPEnum } from './../../Common/AgriGenERPEnum/AgriGenERPEnum';
import MaterialTable from "material-table";
import { useAlert } from 'react-alert';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    avatar: {
        marginRight: theme.spacing(2)
    },
    row: {
        marginTop: '1rem'
    }
}));

const screenCode = 'ACKNOWLEDGEMENT';

export default function AcknowledgementListing() {
    const [title, setTitle] = useState("Acknowledgement");
    const agriGenERPEnum = new AgriGenERPEnum();
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [FactoryList, setFactoryList] = useState([]);
    const [acknowledgementDetail, setAcknowledgementDetail] = useState({
        groupID: 0,
        factoryID: 0,
        invoiceNo: ""
    });
    const [acknowledgementDetailList, setAcknowledgementDetailList] = useState([]);
    const [statusList, setStatusList] = useState();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [selectedRow, setSelectedRow] = useState(null);
    const navigate = useNavigate();
    const alert = useAlert();
    let encrypted = "";
    const handleClickEdit = (teaProductDispatchID) => {
        encrypted = btoa(teaProductDispatchID);
        navigate('/app/acknowledgement/addEdit/' + encrypted);
    }
    useEffect(() => {
        trackPromise(
            getPermission());
        trackPromise(
            getGroupsForDropdown());
    }, []);

    useEffect(() => {
        trackPromise(
            getFactoriesForDropdown());
        trackPromise(
            getStatusForDropdown());
    }, [acknowledgementDetail.groupID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWACKNOWLEDGEMENT');
        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        });
        setAcknowledgementDetail({
            ...acknowledgementDetail,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.GetAllGroups();
        setGroupList(groups);
    }

    async function getStatusForDropdown() {
        const status = await services.GetAllStatus();
        setStatusList(status);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.GetFactoryByGroupID(acknowledgementDetail.groupID);
        setFactoryList(factories);
    }

    async function GetAcknowladgementDetails() {
        const response = await services.GetAcknowladgementDetails(acknowledgementDetail.groupID, acknowledgementDetail.factoryID, acknowledgementDetail.invoiceNo);

        if (response.statusCode == "Success" && response.data != null) {
            let data = response.data;
            data.map(x => {
                x.dateofDispatched = x.dateofDispatched.split('T')[0];
                x.statusName = statusList[x.status];
            });

            setAcknowledgementDetailList(data);
            if (response.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error(response.message);
        }
    }

    function getStatusColor(value) {
        if (agriGenERPEnum.InvoiceStatus.Pending == value)
            return "#91e876";
        else
            return "#ebb5c9";
    }


    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items;
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setAcknowledgementDetail({
            ...acknowledgementDetail,
            [e.target.name]: value
        });
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        )
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: acknowledgementDetail.groupID,
                            factoryID: acknowledgementDetail.factoryID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                            })
                        }
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader title={cardTitle(title)} />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgementDetail.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(GroupList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgementDetail.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            size='small'
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(FactoryList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={8}>
                                                        <InputLabel shrink id="invoiceNo">
                                                            Invoice Number
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="invoiceNo"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={acknowledgementDetail.invoiceNo}
                                                            size='small'
                                                            variant="outlined" >
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Box display="flex" flexDirection="row-reverse" p={2} >
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        onClick={() => trackPromise(GetAcknowladgementDetails())}
                                                        size='small'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                            <Box minWidth={1050}>
                                                {acknowledgementDetailList.length > 0 ?
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Dispatch Date', field: 'dateofDispatched' },
                                                            { title: 'Invoice No', field: 'invoiceNo' },
                                                            { title: 'Grade', field: 'gradeName' },
                                                            { title: 'Selling Mark', field: 'sellingMarkName' },
                                                            { title: 'Broker', field: 'brokerName' },
                                                            {
                                                                title: 'Status',
                                                                field: 'statusName',
                                                                lookup: { ...statusList },
                                                                render: rowData => {
                                                                    if (getStatusColor(rowData.status)) {
                                                                        return <div style={{ backgroundColor: getStatusColor(rowData.status), padding: "1px", borderRadius: "45px" }}>
                                                                            <Tooltip title={rowData.statusName}>
                                                                                <span >{statusList[rowData.status]}</span>
                                                                            </Tooltip></div>
                                                                    } else {
                                                                        return statusList[rowData.status]
                                                                    }
                                                                },
                                                            }
                                                        ]}
                                                        data={acknowledgementDetailList}
                                                        onRowClick={((evt, rowData) => setSelectedRow(rowData.teaProductDispatchID))}
                                                        options={{
                                                            rowStyle: rowData => ({
                                                                backgroundColor: (selectedRow === rowData.teaProductDispatchID) ? '#EEE' : '#FFF'
                                                            }),
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "center", height: '1%', backgroundColor: '#EEE', marginRight: '8%' },
                                                            cellStyle: { textAlign: "center" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 10,
                                                            search: false
                                                        }}
                                                        actions={[{
                                                            icon: 'edit',
                                                            tooltip: 'Edit',
                                                            onClick: (event, rowData) => handleClickEdit(rowData.teaProductDispatchID)
                                                        }]}
                                                    />
                                                    : null}
                                            </Box>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    );
}

import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    avatar: {
        marginRight: theme.spacing(2)
    }
}));

const screenCode = 'REQUISITION';

export default function RequisitionListing(props) {

    const classes = useStyles();
    const navigate = useNavigate();

    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [isShowTable, setIsShowTable] = useState(false);
    const [requisitionSearchDetails, setRequisitionSearchDetails] = useState({
        groupID: '0',
        factoryID: '0',
    });
    const rows = [
        createData("2022-11-13", "Fertilizer", "Urea - 50Kg", "Agriculture"),
        createData("2022-11-10", "Chemical", "Diuron - 2L", "Agriculture"),
        createData("2022-11-08", "Hardware", "Moniter - Dell P2217H IPS (Full HD)", "IT"),
        createData("2022-11-03", "Printing", "Paper - A4 (100 Bundle)", "HR"),
        createData("2022-10-30", "Fertilizer", "Compost - 50Kg", "Agriculture"),
        createData("2022-10-28", "Stationary", "Blue Pen", "HR"),
        createData("2022-10-22", "Fertilizer", "Potassium - 50Kg", "Agriculture"),
        createData("2022-10-20", "Stationary", "Paper - Legal (100 Bundle)", "Sale"),
        createData("2022-10-15", "Chemical", "Herbicides - 2.5L", "Agriculture"),
        createData("2022-10-10", "Chemical", "Folicur Tebuconazole - 250g", "Agriculture"),
        createData("2022-10-08", "Hardware", "Printer - Canon Pixma MX922", "IT"),
        createData("2022-10-06", "Fertilizer", "Sulphate Of Amonia - 50Kg", "Agriculture"),
    ];

    const handleClick = () => {
        navigate('/app/requisition/addEdit');
    }

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropdown());
    }, [requisitionSearchDetails.groupID]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWREQUISITION');

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

        setRequisitionSearchDetails({
            ...requisitionSearchDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    function createData(estimatedDate, itemCategory, itemName, department) {
        return { estimatedDate, itemCategory, itemName, department };
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getAllFactoriesByGroupID(requisitionSearchDetails.groupID);
        setFactories(factories);
    }

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setRequisitionSearchDetails({
            ...requisitionSearchDetails,
            [e.target.name]: value
        });
        setIsShowTable(false);
    }

    async function getData() {
        setIsShowTable(true);
    }

    async function callQuatation() {
        navigate('/app/requisition/quotationInquiry');
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClick}
                        isEdit={true}
                        toolTiptitle={"Add Requisition"}
                    />
                </Grid>
            </Grid>
        )
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page
                className={classes.root}
                title="View Requisition"
            >
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: requisitionSearchDetails.groupID,
                            factoryID: requisitionSearchDetails.factoryID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory required').min("1", 'Factory is required')
                            })
                        }
                        onSubmit={() => trackPromise(getData())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            touched,
                            values,
                            props
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle("View Requisition")}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent style={{ marginBottom: "2rem" }}>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            helperText={touched.groupID && errors.groupID}
                                                            fullWidth
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={requisitionSearchDetails.groupID}
                                                            variant="outlined"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            fullWidth
                                                            name="factoryID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={requisitionSearchDetails.factoryID}
                                                            variant="outlined"
                                                            size="small"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                            {isShowTable ?
                                                <Box minWidth={1050}>
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Estimated Date', field: 'estimatedDate' },
                                                            { title: 'Item Category', field: 'itemCategory' },
                                                            { title: 'Item', field: 'itemName' },
                                                            { title: 'Department', field: 'department' }
                                                        ]}
                                                        data={rows}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 10
                                                        }}
                                                        actions={[
                                                            {
                                                                icon: 'schedule',
                                                                tooltip: 'Call quatation',
                                                                onClick: (event, rowData) => { trackPromise(callQuatation()) }
                                                            },
                                                        ]}
                                                    />
                                                </Box>
                                                : null}
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page >
        </Fragment>
    )
}
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
//import { useParams } from 'react-router-dom';


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

const screenCode = 'FIXEDDEDUCTIONMASTER';

export default function FixedDeductionMasterListing(props) {

    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [deductionTypes, setDeductionTypes] = useState([]);
    const [fixedDeductionsViewData, setFixedDeductionsViewData] = useState([]);
    const [IDDataForDeduction, setIsIDDataForDeduction] = useState(null);
    const [defaultLoad, setDefaultLoad] = useState(false);
    const [fixedDeductionsViewDetails, setFixedDeductionsViewDetails] = useState({
        groupID: 0,
        estateID: 0,
        fixedDeductionTypeID: 0,
    });
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/fixedDeductionMaster/addEdit/' + encrypted);
    }

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        trackPromise(getGroupsForDropdown());
    }, []);

    useEffect(() => {
        if (fixedDeductionsViewDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [fixedDeductionsViewDetails.groupID]);

    useEffect(() => {
        getDeductionTypes();
    }, [fixedDeductionsViewDetails.estateID]);

    useEffect(() => {
        if(defaultLoad){
        setFixedDeductionsViewDetails({
            ...fixedDeductionsViewDetails,
            fixedDeductionTypeID: '0'
        });
    }
    }, [fixedDeductionsViewDetails.estateID, defaultLoad]);

    useEffect(() => {
        const IDdata = JSON.parse(
            sessionStorage.getItem('fixedDeduction-listing-page-search-parameters-id')
        );
        getPermissions(IDdata);
    }, []);

    useEffect(() => {
        sessionStorage.removeItem(
            'fixedDeduction-listing-page-search-parameters-id'
        );
    }, []);

    useEffect(() => {
        if(IDDataForDeduction !== null){
            getData()
        }
    }, [IDDataForDeduction]);

    async function getPermissions(IDdata) {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFIXEDDEDUCTIONMASTER');

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

    const initialValues = IDdata === null;
        if (initialValues) {
            setFixedDeductionsViewDetails({
                ...fixedDeductionsViewDetails,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken())
            })
            setDefaultLoad(true)
        }
        else {
            setFixedDeductionsViewDetails({
                ...fixedDeductionsViewDetails,
                groupID: parseInt(IDdata.groupID),
                estateID: parseInt(IDdata.estateID),
                fixedDeductionTypeID: parseInt(IDdata.fixedDeductionTypeID)   
            })
            setIsIDDataForDeduction(IDdata)
            setDefaultLoad(false)
        }
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(fixedDeductionsViewDetails.groupID);
        setEstates(response);
    };

    async function getDeductionTypes() {
        var response = await services.getDeductionTypes();
        setDeductionTypes(response);
    };

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
        setFixedDeductionsViewDetails({
            ...fixedDeductionsViewDetails,
            [e.target.name]: value
        });
        setFixedDeductionsViewData([]);
    }

    async function getData() {
        let model = {
            groupID: parseInt(fixedDeductionsViewDetails.groupID),
            estateID: parseInt(fixedDeductionsViewDetails.estateID),
            fixedDeductionTypeID: parseInt(fixedDeductionsViewDetails.fixedDeductionTypeID)
        }
        let response = await services.GetFixedDeductionDetail(model);
        if (response.statusCode == "Success" && response.data.length != 0) {
            getSelectedDropdownValuesForReport(model);
            setFixedDeductionsViewData(response.data)
        }
        else {
            alert.error("NO RECORDS TO DISPLAY!")
            clearFields();
        }
    }

    const handleClickEdit = (fixedDeductionMasterID) => {
        encrypted = btoa(fixedDeductionMasterID);
        let modelID = {
            groupID: parseInt(fixedDeductionsViewDetails.groupID),
            estateID: parseInt(fixedDeductionsViewDetails.estateID),
            fixedDeductionTypeID: parseInt(fixedDeductionsViewDetails.fixedDeductionTypeID),
        };
        sessionStorage.setItem(
            'fixedDeduction-listing-page-search-parameters-id',
            JSON.stringify(modelID)
        );
        navigate('/app/fixedDeductionMaster/addEdit/' + encrypted);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
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
                        toolTiptitle={"Add fixed Deduction"}
                    />
                </Grid>
            </Grid>
        )
    }

    function clearFields() {
        setFixedDeductionsViewDetails({
            ...fixedDeductionsViewDetails,
            fixedDeductionTypeID: 0,
        });
        setFixedDeductionsViewData([]);
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page
                className={classes.root}
                title="Fixed Deduction Master"
            >
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: fixedDeductionsViewDetails.groupID,
                            estateID: fixedDeductionsViewDetails.estateID,
                            fixedDeductionTypeID: fixedDeductionsViewDetails.fixedDeductionTypeID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Factory required').min("1", 'Factory is required'),
                            })
                        }
                        onSubmit={() => trackPromise(getData())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched,
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle("Fixed Deduction Master")}
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
                                                            value={fixedDeductionsViewDetails.groupID}
                                                            variant="outlined"
                                                            size="small"
                                                            onBlur={handleBlur}
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="estateID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.estateID && errors.estateID)}
                                                            fullWidth
                                                            helperText={touched.estateID && errors.estateID}
                                                            name="estateID"
                                                            placeholder='--Select Estate--'
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={fixedDeductionsViewDetails.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value={0}>--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estates)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="fixedDeductionTypeID">
                                                            Deduction Type
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="fixedDeductionTypeID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={fixedDeductionsViewDetails.fixedDeductionTypeID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value={0}>--Select Deduction Type--</MenuItem>
                                                            {generateDropDownMenu(deductionTypes)}
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

                                            <Box minWidth={1050}>
                                                {fixedDeductionsViewData.length > 0 ? (
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            {
                                                                title: 'Fixed Deduction Type', field: 'fixedDeductionTypeName',
                                                                headerStyle: { alignContent: 'center' }
                                                            },
                                                            {
                                                                title: 'Food Deduction Type', field: 'foodDeductionName',
                                                                render: rowData => rowData.foodDeductionName == null ? '-' : rowData.foodDeductionName,
                                                            },
                                                            {
                                                                title: 'Union Deduction Type', field: 'unionName',
                                                                headerStyle: { alignContent: 'center' },
                                                                render: rowData => rowData.unionName == null ? '-' : rowData.unionName,
                                                            },
                                                            {
                                                                title: 'Deduction Rate',
                                                                field: 'deductionRate',
                                                                render: rowData => rowData.deductionRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                                                                cellStyle: {
                                                                    textAlign: 'right',
                                                                    paddingRight: '250px',
                                                                },
                                                            },
                                                        ]}
                                                        data={fixedDeductionsViewData}
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
                                                                icon: 'edit',
                                                                tooltip: 'Edit',
                                                                onClick: (event, fixedDeductionsViewData) => handleClickEdit(fixedDeductionsViewData.fixedDeductionMasterID)
                                                            },
                                                        ]}
                                                    />
                                                ) : null}
                                            </Box>
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
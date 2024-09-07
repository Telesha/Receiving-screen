import React, { useState, useEffect } from 'react';
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
import moment from 'moment';

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

const screenCode = 'LEAVEREQUEST';;
export default function LeaveRequestListing() {
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [divisions, setDivisions] = useState();
    const [leaveTypes, setLeaveTypes] = useState();
    const [isTableHide, setIsTableHide] = useState(false);
    const [employeeLeaveRequestListingData, setEmployeeLeaveRequestListingData] = useState([]);
    const [IDDataForLeaveMark, setIsIDDataForLeaveMark] = useState(null);
    const [leaveFormData, setleaveFormData] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        leaveTypeID: '0',
        fromDate: new Date().toISOString().substring(0, 10),
        toDate: new Date().toISOString().substring(0, 10),
    })

    const [selectedSearchReportValues, setSelectedSearchReportValues] = useState({
        groupName: '',
        estateName: '',
        divisionName: '',
        leaveTypeID: '',
        fromDate: "",
        toDate: ""
    });

    const navigate = useNavigate();
    let encrypted = "";
    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/leaverequest/addEdit/' + encrypted);
    }

    const handleClickEdit = (employeeLeaveMasterID) => {
        encrypted = btoa(employeeLeaveMasterID.toString());
        let modelID = {
            groupID: parseInt(leaveFormData.groupID),
            estateID: parseInt(leaveFormData.estateID),
            divisionID: parseInt(leaveFormData.divisionID),
            leaveTypeID: parseInt(leaveFormData.leaveTypeID)
        };
        sessionStorage.setItem(
            'fixedDeductionSetup-listing-page-search-parameters-id',
            JSON.stringify(modelID)
        );
        navigate('/app/leaverequest/addEdit/' + encrypted);
    }

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const alert = useAlert();

    useEffect(() => {
        getGroupsForDropdown();
    }, []);

    useEffect(() => {
        GetLeaveRequestType();
    }, []);

    useEffect(() => {
        const IDdata = JSON.parse(
            sessionStorage.getItem('fixedDeductionSetup-listing-page-search-parameters-id')
        );
        getPermissions(IDdata);
    }, []);

    useEffect(() => {
        sessionStorage.removeItem(
            'fixedDeductionSetup-listing-page-search-parameters-id'
        );
    }, []);

    useEffect(() => {
        if (leaveFormData.groupID > 0) {
            trackPromise(getFactoriesForDropdown());
        }
    }, [leaveFormData.groupID]);

    useEffect(() => {
        trackPromise(
            getDivisionDetailsByEstateID(leaveFormData.estateID)
        )
    }, [leaveFormData.estateID]);

    useEffect(() => {
        trackPromise(GetLeaveRequestType(leaveFormData.employeeLeaveTypeID));
    }, [leaveFormData.divisionID]);

    useEffect(() => {
        setIsTableHide(false);
    }, [leaveFormData.divisionID, leaveFormData.leaveTypeID, leaveFormData.fromDate, leaveFormData.toDate]);

    useEffect(() => {
        if (IDDataForLeaveMark !== null) {
            getEmployeeLeaveDetails();
        }
    }, [IDDataForLeaveMark]);

    async function getPermissions(IDdata) {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLEAVEREQUESTSCREEN');

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
            setleaveFormData({
                ...leaveFormData,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken()),
            })
        }
        else {
            setleaveFormData({
                ...leaveFormData,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken()),
                divisionID: IDdata.divisionID,
                leaveTypeID: parseInt(IDdata.leaveTypeID)
            })
            setIsIDDataForLeaveMark(IDdata)
        }
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getEstateDetailsByGroupID(leaveFormData.groupID);
        setFactories(factories);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(leaveFormData.estateID);
        setDivisions(response);
    };

    async function GetLeaveRequestType() {
        var response = await services.GetLeaveRequestType(leaveFormData.leaveTypeID);
        setLeaveTypes(response);
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

    async function getEmployeeLeaveDetails() {
        let model = {
            groupID: parseInt(leaveFormData.groupID),
            estateID: parseInt(leaveFormData.estateID),
            divisionID: parseInt(leaveFormData.divisionID),
            leaveTypeID: parseInt(leaveFormData.leaveTypeID),
            fromDate: (leaveFormData.fromDate),
            toDate: (leaveFormData.toDate),
        };

        let response = await services.getAllEmployeeLeaveDetailsForListing(model);
        if (response.statusCode === 'Success' && response.data.length !== 0) {
            setEmployeeLeaveRequestListingData(response.data);
            setIsTableHide(true);
        } else {
            alert.error('No records to display');
        }
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchReportValues({
            ...selectedSearchReportValues,
            groupName: groups[searchForm.groupID],
            estateName: factories[searchForm.estateID],
            divisionName: divisions[searchForm.divisionID],
            leaveTypeID: leaveTypes[searchForm.leaveTypeID],
            startDate: searchForm.startDate,
            endDate: searchForm.endDate
        });
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setleaveFormData({
            ...leaveFormData,
            [e.target.name]: value
        });
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
                        toolTiptitle={"Add Leave Request"}
                    />
                </Grid>
            </Grid>
        )
    }

    return (

        <Page
            className={classes.root}
            title="Leave Request Listing"
        >
            <LoadingComponent />
            <Container maxWidth={false}>

                <Formik
                    initialValues={{
                        groupID: leaveFormData.groupID,
                        estateID: leaveFormData.estateID,
                        divisionID: leaveFormData.divisionID,
                        leaveTypeID: leaveFormData.leaveTypeID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                            estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                            divisionID: Yup.number().required('Division is required').min("1", 'Division is required')
                        })
                    }
                    onSubmit={() => trackPromise(getEmployeeLeaveDetails())}
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
                                    <CardHeader
                                        title={cardTitle("Leave Mark")}
                                    />
                                    <Divider />
                                    <PerfectScrollbar>
                                        <CardContent style={{ marginBottom: "2rem" }}>
                                            <Grid container spacing={3}>
                                                <Grid item md={4} xs={12}>
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
                                                        value={leaveFormData.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled ? true : false
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
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={leaveFormData.estateID}
                                                        variant="outlined"
                                                        id="estateID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Division--</MenuItem>
                                                        {generateDropDownMenu(factories)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="divisionID">
                                                        Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.divisionID && errors.divisionID)}
                                                        fullWidth
                                                        helperText={touched.divisionID && errors.divisionID}
                                                        name="divisionID"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                        }}
                                                        value={leaveFormData.divisionID}
                                                        variant="outlined"
                                                        id="divisionID"
                                                    >
                                                        <MenuItem value={0}>--Select Division--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="leaveTypeID">
                                                        Leave Type
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.leaveTypeID && errors.leaveTypeID)}
                                                        fullWidth
                                                        helperText={touched.leaveTypeID && errors.leaveTypeID}
                                                        name="leaveTypeID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={leaveFormData.leaveTypeID}
                                                        variant="outlined"
                                                        id="leaveTypeID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Leave Type--</MenuItem>
                                                        {generateDropDownMenu(leaveTypes)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="fromDate">
                                                        From Date *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.fromDate && errors.fromDate)}
                                                        fullWidth
                                                        helperText={touched.fromDate && errors.fromDate}
                                                        name="fromDate"
                                                        type='date'
                                                        onChange={(e) => handleChange(e)}
                                                        value={leaveFormData.fromDate}
                                                        variant="outlined"
                                                        id="fromDate"
                                                        size='small'
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="toDate">
                                                        To Date *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.toDate && errors.toDate)}
                                                        fullWidth
                                                        helperText={touched.toDate && errors.toDate}
                                                        name="toDate"
                                                        type='date'
                                                        onChange={(e) => handleChange(e)}
                                                        value={leaveFormData.toDate}
                                                        variant="outlined"
                                                        id="toDate"
                                                        size='small'
                                                        inputProps={{ min: leaveFormData.fromDate }}
                                                    />
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

                                            <Box minWidth={1050}>
                                                {/* {employeeLeaveRequestListingData.length > 0 && isTableHide ? ( */}
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Emp No', field: 'employeeNumber' },
                                                            { title: 'Emp Name', field: 'employeeName' },
                                                            { title: 'Leave Type', field: 'employeeLeaveTypeName' },
                                                            { title: 'Start Date', field: 'startDate', render: rowData => moment(rowData.startDate).format().split('T')[0] },
                                                            { title: 'End Date', field: 'endDate', render: rowData => moment(rowData.endDate).format().split('T')[0] },
                                                            {
                                                                title: 'No of Days', field: 'noOfDays', cellStyle: {
                                                                    textAlign: 'right',
                                                                    paddingRight: '180px',
                                                                },
                                                            }
                                                        ]}
                                                        data={employeeLeaveRequestListingData}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1
                                                        }}
                                                        actions={[
                                                            {
                                                                icon: 'mode',
                                                                tooltip: 'Edit Job',
                                                                onClick: (event, rowData) => { handleClickEdit(rowData.employeeLeaveRequestID) }
                                                            },
                                                        ]}
                                                    />
                                                {/* // ) : null} */}
                                            </Box>
                                        </CardContent>
                                    </PerfectScrollbar>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
        </Page>
    );
};

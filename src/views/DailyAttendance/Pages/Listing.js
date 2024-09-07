import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import * as Yup from "yup";
import { Formik, validateYupSchema } from 'formik';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

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

const screenCode = 'DAILYATTENDANCE';
export default function DailyAttendanceListing() {
    const classes = useStyles();
    const alert = useAlert();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [selectedDailyAttendanceID, setselectedDailyAttendanceID] = useState(0);
    const [dailyAttendanceData, setdailyAttendanceData] = useState([]);
    const [FormDetails, setFormDetails] = useState({
        groupID: 0,
        estateID: 0,
        regNo: '',
        fromDate: new Date().toISOString().substring(0, 10),
        toDate: new Date().toISOString().substring(0, 10)
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    useEffect(() => {
        trackPromise(
            getPermissions(),
            getGroupsForDropdown(),
        );
    }, []);

    useEffect(() => {
        if (FormDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [FormDetails.groupID]);

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
        setFormDetails({
            ...FormDetails,
            [e.target.name]: value,
            fromDate: new Date().toISOString().substring(0, 10),
            toDate: new Date().toISOString().substring(0, 10)
        });
        setdailyAttendanceData([]);
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
                        toolTiptitle={"Daily Attendance"}
                    />
                </Grid>
            </Grid>
        )
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYATTENDANCE');

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

        setFormDetails({
            ...FormDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken()),
        })
    }

    async function SearchDaiyAttendance() {
        let model = {
            groupID: parseInt(FormDetails.groupID),
            estateID: parseInt(FormDetails.estateID),
            regNo: FormDetails.regNo,
            fromDate: FormDetails.fromDate,
            toDate: FormDetails.toDate
        };

        let item = await services.GetDailyAttendanceDetails(model);
        if (item.data.length !== 0 && item.statusCode === 'Success') {
            setdailyAttendanceData(item.data);
        } else {
            setdailyAttendanceData(item.data);
            alert.error("No Records To Display")
        }
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(FormDetails.groupID);
        setEstates(response);
    }
    async function handleClickDelete(dailyAttendanceID) {
        setselectedDailyAttendanceID(dailyAttendanceID);
        setDeleteConfirmationOpen(true);
    }

    const handleClickEdit = (dailyAttendanceID) => {
        encrypted = btoa(dailyAttendanceID);
        navigate('/app/DailyAttendance/addEdit/' + encrypted);
    }

    const handleConfirmDelete = async (attendanceData) => {
        setDeleteConfirmationOpen(false);
        let model = {
            dailyAttendanceID: selectedDailyAttendanceID,
            modifiedBy: parseInt(tokenService.getUserIDFromToken())
        }
        const res = await services.DeleteDailyAttendance(model);
        if (res.statusCode == "Success") {
            alert.success(res.message)
            trackPromise(SearchDaiyAttendance())
        }
        else {
            alert.error(res.message)
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false);
    };

    const navigate = useNavigate();
    let encrypted = "";

    const handleClick = () => {
        encrypted = btoa('0');
        navigate('/app/DailyAttendance/addEdit/' + encrypted);
    }

    return (
        <Page
            className={classes.root}
            title="Daily Attendance"
        >
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: FormDetails.groupID,
                        estateID: FormDetails.estateID,
                        fromDate: FormDetails.fromDate,
                        toDate: FormDetails.toDate
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                            estateID: Yup.number().min(1, "Please Select a Estate").required('Estate is required'),
                            fromDate: Yup.string(),
                            toDate: Yup.string(),
                        })
                    }
                    onSubmit={() => trackPromise(SearchDaiyAttendance())}
                    enableReinitialize
                >
                    {({ errors, handleBlur, handleSubmit, touched }) => (
                        <form onSubmit={handleSubmit}>
                            <Box mt={0}>
                                <Card>
                                    <CardHeader
                                        title={cardTitle("Daily Attendance")}
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
                                                        fullWidth
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={FormDetails.groupID}
                                                        variant="outlined"
                                                        size='small'
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
                                                        fullWidth
                                                        error={Boolean(touched.estateID && errors.estateID)}
                                                        helperText={touched.estateID && errors.estateID}
                                                        name="estateID"
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={FormDetails.estateID}
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
                                                    <InputLabel shrink id="fromDate">
                                                        From Date *
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        name="fromDate"
                                                        type='date'
                                                        onChange={(e) => handleChange(e)}
                                                        value={FormDetails.fromDate}
                                                        variant="outlined"
                                                        id="fromDate"
                                                        size='small'
                                                        inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="toDate">
                                                        To Date *
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        name="toDate"
                                                        type='date'
                                                        onChange={(e) => handleChange(e)}
                                                        value={FormDetails.toDate}
                                                        variant="outlined"
                                                        id="toDate"
                                                        size='small'
                                                        inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="regNo">
                                                        Employee Number
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        name="regNo"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={FormDetails.regNo}
                                                        variant="outlined"
                                                    />
                                                </Grid>
                                                <Grid item md={12} xs={12}>
                                                    <Box style={{ display: 'flex', justifyContent: 'end', paddingTop: '2vh' }}>
                                                        <Button
                                                            size="small"
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                        >
                                                            Search
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                        <Box minWidth={1050}>
                                            {dailyAttendanceData.length != 0 ? (
                                                < MaterialTable
                                                    title="Multiple Actions Preview"
                                                    columns={[
                                                        { title: 'Date', field: 'date', render: rowData => moment(rowData.Date).format().split('T')[0] },
                                                        { title: 'Employee Number', field: 'registrationNumber' },
                                                        { title: 'Employee Name', field: 'employeeName' },
                                                        {
                                                            title: 'Clock In Time',
                                                            field: 'clockInTime',
                                                            render: rowData => moment(rowData.clockInTime).format('hh:mm A')
                                                        },
                                                        {
                                                            title: 'Clock Out Time',
                                                            field: 'clockOutTime',
                                                            render: rowData => rowData.clockOutTime ? moment(rowData.clockOutTime).format('hh:mm A') : '-'
                                                        },
                                                        { title: 'Worked Hours', field: 'workedHours' },
                                                    ]}
                                                    data={dailyAttendanceData}
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
                                                        rowData => ({
                                                            icon: 'schedule',
                                                            tooltip: 'Edit Daily Attendance',
                                                            onClick: (event, attendanceData) => {
                                                                if (!attendanceData.clockOutTime) {
                                                                    handleClickEdit(attendanceData.dailyAttendanceID)
                                                                }
                                                            },
                                                            disabled: rowData.clockOutTime
                                                        }),
                                                        {
                                                            icon: 'delete',
                                                            tooltip: 'Delete',
                                                            onClick: (event, attendanceData) => handleClickDelete(attendanceData.dailyAttendanceID)
                                                        }
                                                    ]}
                                                />
                                            ) : null}
                                        </Box>
                                        <Dialog open={deleteConfirmationOpen} onClose={handleCancelDelete}>
                                            <DialogTitle>Delete Confirmation</DialogTitle>
                                            <DialogContent>
                                                <p>Are you sure you want to delete this record ?</p>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button
                                                    onClick={handleConfirmDelete} color="primary">
                                                    Delete
                                                </Button>
                                                <Button onClick={handleCancelDelete} color="primary">
                                                    Cancel
                                                </Button>
                                            </DialogActions>
                                        </Dialog>

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


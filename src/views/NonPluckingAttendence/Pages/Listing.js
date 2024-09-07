import React, { useState, useEffect, Fragment } from 'react';
import {
    Box,
    Card,
    makeStyles,
    Container,
    Divider,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    InputLabel,
    CardHeader,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
import PerfectScrollbar from 'react-perfect-scrollbar';
import MaterialTable from "material-table";
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";
import PageHeader from 'src/views/Common/PageHeader';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Formik } from 'formik';
import * as Yup from "yup";

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
    succes: {
        backgroundColor: "#fce3b6",
        marginLeft: "15px",
        marginBottom: "5px"
    }
}));

const screenCode = 'ATTENDENCENONPLUCKING';

export default function SundryAttendancesListing() {
    const [title, setTitle] = useState("Attendance - Sundry");
    const classes = useStyles();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [attendenceList, setAttendenceList] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: 0,
        empNO: ''
    })
    const [groups, setGroups] = useState([]);
    const [estate, setEstate] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [fromDate, handleFromDate] = useState(new Date());
    const [toDate, handleToDate] = useState(new Date());
    const [attendenceDetailsList, setAttendenceDetailsList] = useState([])
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [dailySundryAttendanceDetailID, setDailySundryAttendanceDetailID] = useState(null)
    const [employeeAttendanceID, setEmployeeAttendanceID] = useState(null)
    const [musterChitRow, setMusterChitRow] = useState(0)
    const navigate = useNavigate();
    const alert = useAlert();

    let encryptedID = "";

    const handleClick = () => {
        encryptedID = btoa('0');
        navigate('/app/attendenceSundry/addEdit/' + encryptedID)
    }

    const handleClickEdit = (dailySundryAttendanceDetailID) => {
        encryptedID = btoa(dailySundryAttendanceDetailID.toString());
        navigate('/app/attendenceSundry/addEdit/' + encryptedID);
    }

    useEffect(() => {
        trackPromise(
            getPermission()
        );
    }, []);

    useEffect(() => {
        trackPromise(
            getEstatesForDropDown()
        );
    }, [attendenceList.groupID]);

    useEffect(() => {
        if (attendenceList.estateID != '0') {
            trackPromise(
                getDivisionDetailsByEstateID()
            )
        }
    }, [attendenceList.estateID]);

    useEffect(() => {
        if (attendenceList.divisionID != 0) {
            setAttendenceDetailsList([]);
        }
    }, [attendenceList.divisionID, fromDate, toDate, attendenceList.empNO])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWATTENDENCENONPLUCKING');

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

        setAttendenceList({
            ...attendenceList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        });
        trackPromise(
            getGroupsForDropdown())
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getEstatesForDropDown() {
        const estates = await services.getEstatesByGroupID(attendenceList.groupID);
        setEstate(estates);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(attendenceList.estateID);
        setDivisions(response);
    };

    async function GetDetails() {
        const model = {
            groupID: parseInt(attendenceList.groupID),
            estateID: parseInt(attendenceList.estateID),
            divisionID: parseInt(attendenceList.divisionID),
            empNO: attendenceList.empNO,
            startDate: fromDate.toLocaleDateString(),
            endDate: toDate.toLocaleDateString()
        }
        const response = await services.getAllNonPluckingAttendeceDetails(model);
        if (response.data.length == 0) {
            alert.error("No records to display");
        } else {
            setAttendenceDetailsList(response.data)
        }
    }

    async function handleClickDelete(dailySundryAttendanceDetailID, employeeAttendanceID, musterChitValue) {
        setDailySundryAttendanceDetailID(dailySundryAttendanceDetailID);
        setEmployeeAttendanceID(employeeAttendanceID);
        setMusterChitRow(musterChitValue)
        setDeleteConfirmationOpen(true);
    }

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false)
    }

    async function handleClickDeleteConfirm() {
        setDeleteConfirmationOpen(false);

        const response = await services.deleteNonPluckingAttendence(dailySundryAttendanceDetailID, employeeAttendanceID, tokenDecoder.getUserIDFromToken())
        if (response.statusCode == "Success") {
            setEmployeeAttendanceID(employeeAttendanceID);
            var result = await services.IncreaseTheMusterChitEmployeeCount(musterChitRow, employeeAttendanceID, tokenDecoder.getUserIDFromToken());
            if (result == 1) {
                alert.success(response.message);
                setAttendenceDetailsList([])
                trackPromise(GetDetails());
            }
        } else {
            alert.error(response.message);
        }
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
        setAttendenceList({
            ...attendenceList,
            [e.target.name]: value
        });
    }

    const handleKeyDownChange = (e) => {
        if (e.key === 'Enter') e.preventDefault();
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
                        toolTiptitle={"Add Attendance Sundry"}
                    />
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
                            groupID: attendenceList.groupID,
                            estateID: attendenceList.estateID,
                            divisionID: attendenceList.divisionID,
                            empNO: attendenceList.empNO
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                divisionID: Yup.number().required('Division is required').min("1", 'Division is required'),
                            })
                        }
                        onSubmit={() => trackPromise(GetDetails())}
                        enableReinitialize
                    >

                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched
                        }) => (
                            <form onSubmit={handleSubmit} onKeyDown={handleKeyDownChange}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={2}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group   *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            size='small'
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={attendenceList.groupID}
                                                            variant="outlined"
                                                            id="groupID"
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
                                                            size='small'
                                                            name="estateID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={attendenceList.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estate)}
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
                                                            size='small'
                                                            name="divisionID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={attendenceList.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                        >
                                                            <MenuItem value="0">--Select Divisions--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="empNO">
                                                            Emp No
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.empNO && errors.empNO)}
                                                            fullWidth
                                                            helperText={touched.empNO && errors.empNO}
                                                            name="empNO"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={attendenceList.empNO}
                                                            variant="outlined"
                                                            id="empNO"
                                                            type="text"
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="fromDate" style={{ marginBottom: '-8px' }}>
                                                            From Date *
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                autoOk
                                                                fullWidth
                                                                inputVariant="outlined"
                                                                format="MM/dd/yyyy"
                                                                margin="dense"
                                                                id="fromDate"
                                                                value={fromDate}
                                                                maxDate={toDate}
                                                                onChange={(e) => {
                                                                    handleFromDate(e);
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="toDate" style={{ marginBottom: '-8px' }}>
                                                            To Date *
                                                        </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                autoOk
                                                                fullWidth
                                                                inputVariant="outlined"
                                                                format="MM/dd/yyyy"
                                                                margin="dense"
                                                                id="toDate"
                                                                value={toDate}
                                                                minDate={fromDate}
                                                                maxDate={new Date()}
                                                                onChange={(e) => {
                                                                    handleToDate(e);
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>
                                                <br />
                                                <Grid container justify="flex-end">
                                                    <Box pr={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                        >
                                                            Search
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </CardContent>

                                            {attendenceDetailsList.length != 0 ?
                                                <Box>
                                                    <MaterialTable
                                                        title={"Attendance - Sundry"}
                                                        columns={[
                                                            { title: 'Date', field: 'attendenceDate', render: rowData => rowData.attendenceDate.split(' ')[0] },
                                                            { title: 'Emp No.', field: 'registrationNumber' },
                                                            { title: 'Field', field: 'fieldName', render: rowData => rowData.fieldName == null ? '-' : rowData.fieldName },
                                                            { title: 'Job', field: 'jobName' },
                                                            { title: 'Normal OT', field: 'dayOT', render: rowData => rowData.dayOT.toFixed(1) },
                                                            { title: 'Night OT', field: 'nightOT', render: rowData => rowData.nightOT.toFixed(1) },
                                                            { title: 'Sunday OT', field: 'doubleOT', render: rowData => rowData.doubleOT.toFixed(1) },
                                                            { title: 'Cash Job', field: 'isCashJob', render: rowData => rowData.isCashJob == true ? 'Yes' : 'No' },
                                                            { title: 'Man - Days', field: 'dayType', render: rowData => rowData.manDays.toFixed(2) },
                                                        ]}
                                                        data={attendenceDetailsList}
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
                                                                icon: 'edit',
                                                                tooltip: 'Edit Attendance',
                                                                onClick: (event, rowData) => handleClickEdit(rowData.dailySundryAttendanceDetailID)
                                                            },
                                                            {
                                                                icon: 'delete',
                                                                tooltip: 'Delete Attendance',
                                                                onClick: (event, rowData) => handleClickDelete(rowData.dailySundryAttendanceDetailID, rowData.employeeAttendanceID, rowData.musterChitID)
                                                            }
                                                        ]}
                                                    />
                                                </Box> : null}
                                            <Dialog
                                                open={deleteConfirmationOpen}
                                                onClose={handleCancelDelete}
                                                aria-labelledby="alert-dialog-slide-title"
                                                aria-describedby="alert-dialog-slide-description"
                                            >
                                                <DialogTitle id="alert-dialog-slide-title">
                                                    <Typography
                                                        color="textSecondary"
                                                        gutterBottom
                                                        variant="h3">
                                                        <Box textAlign="center">
                                                            Confirmation Deleting
                                                        </Box>
                                                    </Typography>
                                                </DialogTitle>
                                                <DialogContent>
                                                    <DialogContentText id="alert-dialog-slide-description">
                                                        <Typography variant="h4">Are you sure you want to delete this record ?</Typography>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        <br /><br />
                                                    </DialogContentText>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={handleClickDeleteConfirm} color="primary" autoFocus>
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
        </Fragment >
    )
}

import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel,
    CardHeader, MenuItem, TableCell, TableRow, TableContainer, TableBody, Table, TableHead
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
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

const screenCode = 'DAILYATTENDANCE';
export default function DailyAttendanceAdd() {
    const [title, setTitle] = useState("Add Daily Attendance")
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const classes = useStyles();
    const [groups, setGroups] = useState()
    const [estates, setEstates] = useState([]);
    const [ArrayField, setArrayField] = useState([]);
    const [registrationNumberError, setRegistrationNumberError] = useState("");
    const [shiftEndConfirmationOpen, setShiftEndConfirmationOpen] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [deleteRowIndex, setDeleteRowIndex] = useState(null);
    const [months, setMonths] = useState({
        startMonth: new Date().toISOString().substring(0, 7)
    });

    const [attendanceDetails, setattendanceDetails] = useState({
        groupID: 0,
        estateID: 0,
        regNo: '',
        employeeName: '',
        date: new Date().toISOString().substring(0, 10),
        clockInTime: formatAMPM(new Date()),
        clockOutTime: formatAMPM(new Date()),
        workedHours: ''
    });

    const { DailyAttendanceID } = useParams();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/app/DailyAttendance/listing');
    }
    const alert = useAlert();
    let decrypted = 0;
    const handleDelete = (row, index) => {
        setDeleteConfirmationOpen(true);
        setDeleteRowIndex(index);
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        decrypted = atob(DailyAttendanceID.toString());
        if (parseInt(decrypted) > 0) {
            setIsUpdate(true);
            getDetailsByDailyAttendanceID(decrypted);
        }
    }, []);

    useEffect(() => {
        getEstateDetailsByGroupID();
    }, [attendanceDetails.groupID]);

    useEffect(() => {
        if (attendanceDetails.regNo !== "") {
            if (!isUpdate) {
                getEmployeeNameByRegNo()
            }
        }
    }, [attendanceDetails.regNo]);

    useEffect(() => {
        if (isUpdate) {
            const inTime = new Date(attendanceDetails.clockInTime);
            const outTime = new Date(attendanceDetails.clockOutTime);
            const differenceInMilliseconds = outTime.getTime() - inTime.getTime();
            const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
            const decimalHours = differenceInMilliseconds / (1000 * 60 * 60);

            setattendanceDetails({
                ...attendanceDetails,
                workedHours: decimalHours
            });
        }
    }, [attendanceDetails.clockInTime, attendanceDetails.clockOutTime, isUpdate]);

    useEffect(() => {
        setattendanceDetails({
            ...attendanceDetails,
            startMonth: new Date().toISOString().substring(0, 10),
        })
        setMonths({
            ...months,
            startMonth: new Date().toISOString().substring(0, 7)
        })
    }, [attendanceDetails.divisionID]);

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
            }
        }
        return items
    }

    function handleChange1(e) {
        const target = e.target;
        const value = target.value;
        setattendanceDetails({
            ...attendanceDetails,
            [e.target.name]: value
        });
    }
    function formatAMPM(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedTime = hours + ' : ' + minutes + ' : ' + ampm;
        return formattedTime;
    }

    function handleChangeForRegNumber(e) {
        const target = e.target;
        let value = target.value;

        if (/^[0-9]*$/.test(value)) {
            setRegistrationNumberError("");
            setattendanceDetails({
                ...attendanceDetails,
                [target.name]: value
            });
        } else {
            setRegistrationNumberError("Invalid input. Please enter a valid Registration number.");
        }
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
                    />
                </Grid>
            </Grid>
        )
    }

    function handlePopupConfirmation() {
        handleConfirmEndShift()
        setShiftEndConfirmationOpen(true)
    }

    function handleSaveOnclick() {
        SaveAttendanceDetails()
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDDAILYATTENDANCE');

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

        if (decrypted == 0) {
            setattendanceDetails({
                ...attendanceDetails,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                estateID: parseInt(tokenService.getFactoryIDFromToken())
            })
        }
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    };

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(attendanceDetails.groupID);
        setEstates(response);
    };

    async function getEmployeeNameByRegNo() {
        let empNameResponse = await services.getEmployeeNameByRegNo(attendanceDetails.estateID, attendanceDetails.regNo);
        if (empNameResponse !== null) {
            setattendanceDetails({
                ...attendanceDetails,
                employeeName: empNameResponse.firstName,
            })
        }
    }

    async function getDetailsByDailyAttendanceID(DailyAttendanceID) {
        setTitle("Edit Daily Attendance")
        const attendanceDetails = await services.GetDetailsByDailyAttendanceID(DailyAttendanceID);
        setIsUpdate(true);
        const date = new Date(attendanceDetails.date);
        setattendanceDetails({
            ...attendanceDetails,
            groupID: attendanceDetails.groupID,
            estateID: attendanceDetails.estateID,
            date: new Date().toISOString().substring(0, 10).split('T', 1),
            regNo: attendanceDetails.regNo,
            employeeName: attendanceDetails.employeeName,
            clockInTime: attendanceDetails.clockInTime

        });
    }

    async function AddFieldData() {
        const isMatch = ArrayField.some(x =>
            x.regNo === attendanceDetails.regNo
        );

        if (isMatch) {
            alert.error("The record already exists!")
        } else {
            var array1 = [...ArrayField];
            array1.push({
                groupID: parseInt(attendanceDetails.groupID),
                estateID: parseInt(attendanceDetails.estateID),
                date: attendanceDetails.date,
                regNo: attendanceDetails.regNo,
                employeeName: attendanceDetails.employeeName,
                clockInTime: attendanceDetails.clockInTime,
                createdBy: parseInt(tokenService.getUserIDFromToken())
            });
            setArrayField(array1);

            let dataModel = {
                regNo: attendanceDetails.regNo,
                employeeName: attendanceDetails.firstName,
                date: attendanceDetails.date
            }
        }
    }

    async function SaveAttendanceDetails() {
        if (isUpdate == true) {
            setIsUpdate(true);
            setIsDisableButton(true);
            let model = {
                dailyAttendanceID: attendanceDetails.dailyAttendanceID,
                workedHours: parseFloat(attendanceDetails.workedHours),
                clockOutTime: attendanceDetails.clockOutTime,
                modifiedBy: parseInt(tokenService.getUserIDFromToken()),
                modifiedDate: new Date().toISOString()
            }
            let response = await services.UpdateDailyAttendance(model);
            if (response.statusCode == "Success") {
                setShiftEndConfirmationOpen(false)
                alert.success(response.message);
                setArrayField([]);
                navigate('/app/DailyAttendance/listing');

            }
            else {
                setShiftEndConfirmationOpen(false)
                alert.error(response.message);
            }
        } else {

            let response = await services.SaveAttendanceDetails(ArrayField);

            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(false);
                setArrayField([]);
                navigate('/app/DailyAttendance/listing');
                setIsDisableButton(true);
            }
            else {
                alert.error(response.message);
            }
        }
    }

    const handleConfirmDelete = () => {
        InactivDetails(deleteRowIndex);
        setDeleteConfirmationOpen(false);
    };

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false);
    };

    const InactivDetails = (index) => {
        const dataDelete = [...ArrayField];
        const remove = index;
        dataDelete.splice(remove, 1);
        setArrayField([...dataDelete]);
    };

    const handleStartShift = () => {

        const currentTime = new Date().toLocaleString();
        setattendanceDetails(prevState => ({
            ...prevState,
            clockInTime: currentTime
        }));
    };

    const handleConfirmEndShift = () => {
        const currentTime = new Date().toLocaleString();
        setattendanceDetails(prevState => ({
            ...prevState,
            clockOutTime: currentTime
        }));
    };

    const handleCancelShift = () => {
        setShiftEndConfirmationOpen(false);
    };

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: attendanceDetails.groupID,
                            estateID: attendanceDetails.estateID,
                            regNo: attendanceDetails.regNo,
                            employeeName: attendanceDetails.employeeName,
                            date: attendanceDetails.date,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                                estateID: Yup.number().required('Estate required').min("1", 'Estate required'),
                                regNo: Yup.string().max(30).required('Employee Number required').typeError('Invalid employee number'),
                            })
                        }
                        onSubmit={AddFieldData}
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
                                            title={cardTitle(title)}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
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
                                                            onChange={(e) => handleChange1(e)}
                                                            size='small'
                                                            value={attendanceDetails.groupID}
                                                            variant="outlined"
                                                            id="groupID"
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
                                                            size='small'
                                                            onChange={(e) => handleChange1(e)}
                                                            value={attendanceDetails.estateID}
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

                                                    {isUpdate ?
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="date">
                                                                Date *
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="date"
                                                                onChange={(e) => handleChange1(e)}
                                                                value={attendanceDetails.date}
                                                                variant="outlined"
                                                                id="date"
                                                                size='small'
                                                                disabled
                                                            />
                                                        </Grid>
                                                        :
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="date">
                                                                Date *
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="date"
                                                                type='date'
                                                                onChange={(e) => handleChange1(e)}
                                                                value={attendanceDetails.date}
                                                                variant="outlined"
                                                                id="date"
                                                                size='small'
                                                            />
                                                        </Grid>
                                                    }
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="regNo">
                                                            Employee Number *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.regNo && errors.regNo) || Boolean(registrationNumberError)}
                                                            fullWidth
                                                            helperText={touched.regNo && errors.regNo ? errors.regNo : registrationNumberError}
                                                            name="regNo"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChangeForRegNumber(e)}
                                                            value={attendanceDetails.regNo}
                                                            size='small'
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: isUpdate
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="employeeName">
                                                            Employee Name *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.employeeName && errors.employeeName)}
                                                            fullWidth
                                                            helperText={touched.employeeName && errors.employeeName}
                                                            name="employeeName"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={attendanceDetails.employeeName}
                                                            size='small'
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: isUpdate
                                                            }}
                                                        />
                                                    </Grid>
                                                    {isUpdate ?
                                                        <Grid item md={4} xs={12}>
                                                            <InputLabel shrink id="clockInTime">
                                                                Clock In Time *
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="clockInTime"
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChange1(e)}
                                                                value={attendanceDetails.clockInTime}
                                                                size='small'
                                                                variant="outlined"
                                                                disabled={isUpdate}
                                                                InputProps={{
                                                                    readOnly: isUpdate
                                                                }}
                                                            />
                                                        </Grid>
                                                        : null}
                                                </Grid>
                                                {!isUpdate ?
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button onClick={handleStartShift}
                                                            color="primary"
                                                            size='small'
                                                            type="submit"
                                                            variant="contained"
                                                            disabled={isDisableButton}>
                                                            Clock In
                                                        </Button>
                                                    </Box>
                                                    : null}
                                                {isUpdate && (
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button
                                                            onClick={() => {
                                                                handlePopupConfirmation()
                                                            }}
                                                            color="primary"
                                                            size="small"
                                                            variant="contained"
                                                            disabled={isDisableButton}
                                                        >
                                                            Clock Out
                                                        </Button>
                                                    </Box>
                                                )}
                                            </CardContent>
                                            {ArrayField.length > 0 && !isUpdate ? (
                                                <Grid item xs={12}>
                                                    <TableContainer>
                                                        <Table className={classes.table} aria-label="caption table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center"><b>Employee Number</b></TableCell>
                                                                    <TableCell align="center"><b>Employee Name</b></TableCell>
                                                                    <TableCell align="center"><b>Clock In Time</b></TableCell>
                                                                    <TableCell align="center"><b>Action</b></TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {ArrayField.map((row, index) => {
                                                                    return <TableRow key={index}>
                                                                        <TableCell align="center" >{row.regNo}
                                                                        </TableCell>
                                                                        <TableCell align="center" >{row.employeeName}
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            {moment(row.clockInTime).format('hh:mm A')}
                                                                        </TableCell>
                                                                        <TableCell align='center' scope="row" style={{ borderBottom: "none" }}>
                                                                            <DeleteIcon
                                                                                style={{
                                                                                    marginBottom: "-1rem",
                                                                                    marginTop: "0rem",
                                                                                    cursor: "pointer"
                                                                                }}
                                                                                size="small"
                                                                                onClick={() => handleDelete(row, index)}
                                                                            >
                                                                            </DeleteIcon>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Grid>
                                            )
                                                : null}
                                            {!isUpdate && ArrayField.length > 0 && (
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        onClick={() => SaveAttendanceDetails()}
                                                        color="primary"
                                                        size="small"
                                                        type="button"
                                                        variant="contained"
                                                        disabled={isDisableButton}
                                                    >
                                                        Save
                                                    </Button>
                                                </Box>
                                            )}
                                            <Dialog open={deleteConfirmationOpen} onClose={handleCancelDelete}>
                                                <DialogTitle>Delete Confirmation</DialogTitle>
                                                <DialogContent>
                                                    <p>Are you sure you want to delete this record?</p>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={handleConfirmDelete} color="primary">
                                                        Delete
                                                    </Button>
                                                    <Button onClick={handleCancelDelete} color="primary">
                                                        Cancel
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                            <Dialog open={shiftEndConfirmationOpen} onClose={handleCancelShift}>
                                                <DialogTitle>Shift End Confirmation</DialogTitle>
                                                <DialogContent>
                                                    <p>Are you sure you want to end your shift?</p>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={handleSaveOnclick} color="primary">
                                                        Confirm
                                                    </Button>
                                                    <Button onClick={handleCancelShift} color="primary">
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
        </Fragment>
    );
};

import React, { useState, useEffect, Fragment } from 'react';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    makeStyles,
    Container,
    CardContent,
    Divider,
    MenuItem,
    Grid,
    InputLabel,
    TextField,
    CardHeader,
    Button,
    Paper,
    Typography
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

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
    table: {
        minWidth: 550,
    },

}));

const screenCode = "STAFFATTENDANCE"

export default function MarkStaffAttendance(props) {

    const classes = useStyles();
    const navigate = useNavigate();
    const [title, setTitle] = useState("Add Staff Attendance")

    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [attendanceAray, setAttendanceArray] = useState([]);
    const [isSearch, setIsSearch] = useState(false);
    const [attendanceYear, setAttendanceYear] = useState();
    const [attendanceMonth, setAttendanceMonth] = useState();
    const [attendanceMonthLastDay, setAttendanceMonthLastDay] = useState();
    const [workingDays, setWorkingDays] = useState([]);
    const [toDate, setToDate] = useState();

    const [staffAttendace, setStaffAttendance] = useState({
        groupID: '0',
        factoryID: '0',
        regNo: '',
        attendanceDate: Date.now(),
        empName: '',
        nic: '',
        employeeID: '0',
        epfNo: ''

    })

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const handleClick = () => {
        navigate('/app/StaffAttendance/listing');
    }
    const alert = useAlert();

    useEffect(() => {
        trackPromise(
            getPermission(),
            getGroupsForDropdown());
    }, []);

    useEffect(() => {
        trackPromise(
            getFactoriesForDropDown(staffAttendace.groupID)
        );
    }, [staffAttendace.groupID]);

    useEffect(() => {
        generateAttendenceTable();
        setIsSearch(false);
    }, [staffAttendace.attendanceDate]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'MARKSTAFFATTENDANCE');

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

        setStaffAttendance({
            ...staffAttendace,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown(groupID) {
        const factory = await services.getAllFactoriesByGroupID(groupID);
        setFactories(factory);
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

    function generateAttendenceTable() {
        var now = new Date(staffAttendace.attendanceDate);

        setAttendanceYear(now.toISOString().toString().split('T')[0].split('-')[0])
        setAttendanceMonth(now.toISOString().toString().split('T')[0].split('-')[1])

        var noDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        setAttendanceMonthLastDay(noDays);
        let tempArray = [];
        let tempryArray = [];
        let tempModel;
        for (let i = 1; i <= noDays; i++) {
            tempArray.push(i);
            tempModel = {
                dayNo: i
            }
            tempryArray.push(tempModel);
        }
        setAttendanceArray(tempryArray);
    }

    async function getStaffDetails() {
        let tempModel = {
            groupID: parseInt(staffAttendace.groupID),
            factoryID: parseInt(staffAttendace.factoryID),
            registrationNumber: staffAttendace.regNo
        }
        const response = await services.getStaffEmployeeDetailsByRegNo(tempModel);
        if (response.statusCode != "Success") {
            setIsSearch(false);
            alert.error(response.message);
        }
        else {
            setIsSearch(true);
            let tempModel = {
                groupID: parseInt(staffAttendace.groupID),
                factoryID: parseInt(staffAttendace.factoryID),
                employeeID: parseInt(response.data.employeeID),
                attendanceStartDate: (attendanceYear + "-" + attendanceMonth + "-" + "01"),
                attendanceEndDate: (attendanceYear + "-" + attendanceMonth + "-" + attendanceMonthLastDay)
            }
            const attendenceResponse = await services.getStaffEmployeeAttendanceDetailsByMonthEmployeeID(tempModel);
            const toDate = new Date().getDate()
            setToDate(toDate);
            setWorkingDays(attendenceResponse);
            if (attendenceResponse != null) {
                let tempAttendenceModel;
                let tempAttendenceArray = [];

                for (let i = 1; i <= attendanceAray.length; i++) {
                    var attendenceData = attendenceResponse.filter(dayNo => dayNo.dayNo == attendanceAray[i - 1].dayNo);
                    if (attendenceData.length > 0) {

                        tempAttendenceModel = {
                            startTime: attendenceData[0].startTime,
                            endTime: attendenceData[0].endTime,
                            dayNo: attendenceData[0].dayNo,
                            attendanceDate: attendenceData[0].attendanceDate,
                            status: 0
                        }
                    } else {
                        tempAttendenceModel = {
                            dayNo: i
                        }
                    }
                    tempAttendenceArray.push(tempAttendenceModel);
                }
                setAttendanceArray(tempAttendenceArray)
            }
            setStaffAttendance({
                ...staffAttendace,
                empName: response.data.fullName,
                nic: response.data.nicNumber,
                employeeID: response.data.employeeID
            })
        }
    }

    async function saveEmployeeAttendances() {

        let tempModel = {
            employeeID: parseInt(staffAttendace.employeeID),
            groupID: parseInt(staffAttendace.groupID),
            factoryID: parseInt(staffAttendace.factoryID),
            attendanceList: attendanceAray,
            createdBy: parseInt(tokenService.getUserIDFromToken())
        }
        let response = await services.saveStaffEmployeeAttendances(tempModel);
        if (response !== null && response.statusCode == "Success") {
            alert.success(response.message);
            setIsSearch(false);
        }
        else {
            alert.error(response.message);
            setIsSearch(true);
        }
    }

    function handleChangeForm(e) {
        const target = e.target;
        const value = target.value

        setStaffAttendance({
            ...staffAttendace,
            [e.target.name]: value
        });
    }

    function handleDateChange(date) {
        setStaffAttendance({
            ...staffAttendace,
            attendanceDate: date
        })
    }

    function hadleAllChanges(e, index, field) {

        var value = e.target.value;
        const newArr = [...attendanceAray];
        var idx = newArr.findIndex(e => e.dayNo == parseInt(index));

        newArr[idx] = {
            ...newArr[idx],
            [field]: value == "" ? 0 : value,
            "attendanceDate": (attendanceYear + "-" + attendanceMonth + "-" + index),
            "status": 1
        };
        setAttendanceArray(newArr);
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

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: staffAttendace.groupID,
                            factoryID: staffAttendace.factoryID,
                            regNo: staffAttendace.regNo,
                            attendanceDate: staffAttendace.attendanceDate
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                                regNo: Yup.string().required('Reg number required')
                            })
                        }
                        onSubmit={() => trackPromise(getStaffDetails())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleChange,
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
                                            title={cardTitle(title)}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChangeForm(e)}
                                                            value={staffAttendace.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChangeForm(e)}
                                                            value={staffAttendace.factoryID}
                                                            variant="outlined"
                                                            size='small'
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="regNo">
                                                            Reg No *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.regNo && errors.regNo)}
                                                            fullWidth
                                                            helperText={touched.regNo && errors.regNo}
                                                            name="regNo"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChangeForm(e)}
                                                            value={staffAttendace.regNo}
                                                            variant="outlined"
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year", "month"]}
                                                                label="Year and Month"
                                                                helperText="Select month *"
                                                                name='attendanceDate'
                                                                size='small'
                                                                value={staffAttendace.attendanceDate}
                                                                onChange={(date) => handleDateChange(date)}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>
                                                <Box display="flex" justifyContent="flex-end" p={2} >
                                                    <Button
                                                        color="primary"
                                                        disabled={isSubmitting}
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                    <Formik
                        initialValues={{
                            groupID: staffAttendace.groupID,
                            factoryID: staffAttendace.factoryID,
                            regNo: staffAttendace.regNo,
                            attendanceDate: staffAttendace.attendanceDate
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                                regNo: Yup.string().required('Reg number required')
                            })
                        }
                        onSubmit={() => trackPromise(saveEmployeeAttendances())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            handleChange,
                            isSubmitting,
                            touched,
                            values,
                            props
                        }) => (
                            <form onSubmit={handleSubmit}>
                                {isSearch ?
                                    <Box mt={0}>
                                        <Card>
                                            <Grid container spacing={3} style={{ padding: 10 }}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="empName">
                                                        Employee Name
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        name="empName"
                                                        onBlur={handleBlur}
                                                        value={staffAttendace.empName}
                                                        variant="outlined"
                                                        InputProps={{
                                                            readOnly: true
                                                        }}
                                                        size='small'
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="nic">
                                                        NIC
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        name="nic"
                                                        onBlur={handleBlur}
                                                        value={staffAttendace.nic}
                                                        variant="outlined"
                                                        InputProps={{
                                                            readOnly: true
                                                        }}
                                                        size='small'
                                                    />
                                                </Grid>
                                            </Grid>
                                            <br />
                                            <br />
                                            <Box mt={0}>
                                                <Card style={{ padding: 10 }}>
                                                    <Grid container spacing={3} style={{ padding: 10 }}>

                                                        <Grid item md={2} xs={12}>
                                                            <Typography style={{ fontSize: '16px' }} align="left"><b>No Of Working Days: </b> {workingDays.length}</Typography>

                                                        </Grid>

                                                    </Grid>
                                                </Card>
                                            </Box>

                                            <br />
                                            <br />
                                            <TableContainer component={Paper}>
                                                <Table className={classes.table} size="small" aria-label="simple table">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Date</TableCell>
                                                            <TableCell align="center">Start Time</TableCell>
                                                            <TableCell align="center">End Time</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {attendanceAray.map((row, index) => {
                                                            let ID = index + 1;
                                                            return (
                                                                <TableRow key={index}>
                                                                    <TableCell component="th" scope="row">{ID}</TableCell>
                                                                    <TableCell align="center" style={{ textAlign: "center" }} >
                                                                        <Grid >
                                                                            <TextField
                                                                                id="time"
                                                                                type="time"
                                                                                value={row.startTime}
                                                                                onChange={(e) => hadleAllChanges(e, ID, "startTime")}
                                                                                InputLabelProps={{
                                                                                    shrink: true,
                                                                                }}
                                                                                disabled={toDate < ID ? true : false}
                                                                            />
                                                                        </Grid>
                                                                    </TableCell>
                                                                    <TableCell align="center" style={{ textAlign: "center" }}>
                                                                        <Grid >
                                                                            <TextField
                                                                                id="time"
                                                                                type="time"
                                                                                value={row.endTime}
                                                                                onChange={(e) => hadleAllChanges(e, ID, "endTime")}
                                                                                InputLabelProps={{
                                                                                    shrink: true,
                                                                                }}
                                                                                disabled={toDate < ID ? true : false}
                                                                            />
                                                                        </Grid>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                >
                                                    Mark Attendance
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Box>
                                    : null}
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    )
}
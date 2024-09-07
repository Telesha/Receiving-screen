import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Typography, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Paper, CardHeader, MenuItem
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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { withStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

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

const RedRadio = withStyles({
  root: {
    color: "default",
    '&$checked': {
      color: red[600],
    },
  },
  checked: {},
})((props) => <Radio color="default" {...props} />);

const screenCode = 'EMPLOYEEATTENDANCES';

export default function EmployeeAttendancesAddEdit(props) {
  const [title, setTitle] = useState("Add Labour Attendance")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isHideField, setIsHideField] = useState(true);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [isSearchButton, setIsSearchButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [attendanceYear, setAttendanceYear] = useState();
  const [attendanceMonth, setAttendanceMonth] = useState();
  const [attendanceMonthLastDay, setAttendanceMonthLastDay] = useState();
  const [isSearch, setIsSearch] = useState(false);
  const [attendanceAray, setAttendanceArray] = useState([]);
  const [employeeShift, setEmployeeShift] = useState();
  const [workingDays, setWorkingDays] = useState([]);
  const [leaveDays, setLeaveDays] = useState([]);
  const [dayOTHours, setDayOTHours] = useState();
  const [nightOTHours, setNightOTHours] = useState();
  const [doubleOTHours, setDoubleOTHours] = useState();
  const [toDate, setToDate] = useState();

  const [attendances, setAttendances] = useState({
    groupID: '0',
    factoryID: '0',
    regNo: '',
    epfNo: '',
    empName: '',
    nic: '',
    attendanceDate: Date.now(),
    days: '',
    dayOT: '0',
    nightOT: 0,
    doubleOT: 0,
    dayType:0,
    employeeID: "",
    employeeAttendanceID: 0,
    dayOT: 0
  });

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/employeeAttendances/listing');
  }
  const alert = useAlert();
  const { employeeAttendancesID } = useParams();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    decrypted = atob(employeeAttendancesID);
    if (decrypted != 0) {
      trackPromise(getUpdateEmployeeAttendanceDetails(decrypted));
    }
    trackPromise(getPermissions(), getGroupsForDropdown(), getEmployeeAllShift());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown())
  }, [attendances.groupID]);

  useEffect(() => {
    trackPromise(getEmployeeDayWiseData())
  }, [attendances.attendanceDate]);

  useEffect(() => {
    generateAttendenceTable();
    setIsSearch(false);
  }, [attendances.attendanceDate]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }
  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(attendances.groupID);
    setFactories(factories);
  }
  async function getEmployeeAllShift() {
    const res = await services.GetEmployeeAllShift();
    setEmployeeShift(res);
  }

  function generateAttendenceTable() {
    var now = new Date(attendances.attendanceDate);

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

  async function getUpdateEmployeeAttendanceDetails(employeeAttendanceID) {
    let response = await services.GetUpdateEmployeeAttendanceDetailsByEmployeeAttendanceID(employeeAttendanceID);
    setTitle("Edit Attendance");
    setAttendances({
      ...attendances,
      groupID: response.groupID,
      factoryID: response.operationEntityID,
      regNo: response.registrationNumber,
      epfNo: response.epfNumber,
      empName: response.fullName,
      nic: response.nicNumber,
      attendanceDate: response.attendanceDate.split('T')[0],
      days: response.dayType,
      dayOT: response.dayOT,
      nightOT: response.nightOT,
      employeeAttendanceID: response.employeeAttendanceID,
      employeeID: response.employeeID,
      doubleOT: response.doubleOT
    })
    setIsSearchButton(true)
    setIsHideField(false);
    setIsUpdate(true);
  }
  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITEMPLOYEEATTENDANCES');

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
      setAttendances({
        ...attendances,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
  }

  async function getEmployeeDayWiseData() {
    let model = {
      startDate: attendances.attendanceDate,
      employeeID: attendances.employeeID
    }
    decrypted = atob(employeeAttendancesID);
    const result = await services.GetEmployeeDayWiseData(model);

    if (result != null) {
      if (decrypted == 0) {
        setAttendances({
          ...attendances,
          employeeAttendanceID: result.employeeAttendanceID,
          days: result.dayType,
          dayOT: result.dayOT,
          nightOT: result.nightOT,
        })
        setIsSearchButton(true);
        setIsUpdate(true);
      }
      else {
        setAttendances({
          ...attendances,
          employeeAttendanceID: result.employeeAttendanceID,
          days: result.dayType,
          dayOT: result.dayOT,
          nightOT: result.nightOT,
        });
        setIsUpdate(true);
        setIsDisableButton(false);
      }
    }
    else {
      if (decrypted == 0) {
        setIsUpdate(false);
        setAttendances({
          ...attendances,
          days: 1,
          dayOT: 0,
          nightOT: 0,
        });
        setIsSearchButton(false);
      }
      else {
        setAttendances({
          ...attendances,
          days: 1,
          dayOT: 0,
          nightOT: 0,
        });
        alert.error("EMPLOYEE NOT ATTEND");
        setIsDisableButton(true);
      }
    }
  }

  async function getEmployeDetails() {
    const response = await services.getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber(attendances.groupID, attendances.factoryID, attendances.regNo, attendances.epfNo);
    if (response.statusCode != "Success") {
      setIsHideField(true)
      setIsSearch(false);
      alert.error(response.message);
    }
    else {
      setIsSearch(true);
      setIsDisableButton(false);
      setIsHideField(false)
      let tempModel = {
        groupID: parseInt(attendances.groupID),
        factoryID: parseInt(attendances.factoryID),
        employeeID: parseInt(response.data.employeeID),
        attendanceStartDate: (attendanceYear + "-" + attendanceMonth + "-" + "01"),
        attendanceEndDate: (attendanceYear + "-" + attendanceMonth + "-" + attendanceMonthLastDay)
      }
      const attendenceResponse = await services.GetEmployeeAttendanceDetailsByMonthEmployeeID(tempModel);
      const leaveDays = attendenceResponse.filter(x => x.isLeave == true)
      const workingDays = attendenceResponse.filter(x => x.isLeave == false)
      const dayOTHours = workingDays.reduce((dayOT, item) => dayOT + item.dayOT, 0)
      const nightOTHours = workingDays.reduce((nightOT, item) => nightOT + item.nightOT, 0)
      const doubleOTHours = workingDays.reduce((doubleOT, item) => doubleOT + item.doubleOT, 0)
      const toDate = new Date().getDate()
      setToDate(toDate);
      setLeaveDays(leaveDays);
      setWorkingDays(workingDays);
      setDayOTHours(dayOTHours);
      setNightOTHours(nightOTHours);
      setDoubleOTHours(doubleOTHours);
      if (attendenceResponse != null) {
        let tempAttendenceModel;
        let tempAttendenceArray = [];

        for (let i = 1; i <= attendanceAray.length; i++) {
          var attendenceData = attendenceResponse.filter(dayNo => dayNo.dayNo == attendanceAray[i - 1].dayNo);
          if (attendenceData.length > 0) {

            tempAttendenceModel = {
              isFullDay: attendenceData[0].isFullDay,
              isHalfDay: attendenceData[0].isHalfDay,
              isLeave: attendenceData[0].isLeave,
              dayOT: attendenceData[0].dayOT,
              nightOT: attendenceData[0].nightOT,
              doubleOT: attendenceData[0].doubleOT,
              dayNo: attendenceData[0].dayNo,
              attendanceDate: attendenceData[0].attendanceDate,
              shiftID: attendenceData[0].shiftID,
              dayType:attendenceData[0].dayType,
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
      setAttendances({
        ...attendances,
        empName: response.data.fullName,
        nic: response.data.nicNumber,
        employeeID: response.data.employeeID
      })
    }
  }

  async function saveUpdateEmployeeAttendances() {

    if (isUpdate == true) {

      let updateModel = {
        days: parseInt(attendances.days),
        dayOT: parseInt(attendances.dayOT),
        nightOT: parseInt(attendances.nightOT),
        doubleOT: parseInt(attendances.doubleOT),
        employeeAttendanceID: parseInt(attendances.employeeAttendanceID)
      }
      let response = await services.updateEmployeeAttendances(updateModel);     
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
      }
      else {
        alert.error(response.message);
      }
    } else {
      let tempModel = {
        employeeID: attendances.employeeID,
        groupID: attendances.groupID,
        factoryID: attendances.factoryID,
        attendanceList: attendanceAray,
        createdBy: tokenService.getUserIDFromToken()
      }
      let response = await services.saveEmployeeAttendances(tempModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        setIsSearch(false);
      }
      else {
        alert.error(response.message);
        setIsSearch(true);
      }
    }
  }

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
    const value = target.value
    setAttendances({
      ...attendances,
      [e.target.name]: value
    });
  }

  function hadleAllChanges(e, index, field) {

    var value = e.target.value;
    const newArr = [...attendanceAray];
    var idx = newArr.findIndex(e => e.dayNo == parseInt(index));

    if (field == "isFullDay") {
      newArr[idx] = {
        ...newArr[idx],
        [field]: value == "" ? false : true,
        "isHalfDay": false,
        "isLeave": false,
        "dayType" :0,
        "attendanceDate": (attendanceYear + "-" + attendanceMonth + "-" + index),
        "status": 1
      };
    }
    else if (field == "isHalfDay") {
      newArr[idx] = {
        ...newArr[idx],
        [field]: value == "" ? false : true,
        "isFullDay": false,
        "isLeave": false,
        "dayType" :0,
        "attendanceDate": (attendanceYear + "-" + attendanceMonth + "-" + index),
        "status": 1
      };
    }
    else if (field == "isLeave") {
      newArr[idx] = {
        ...newArr[idx],
        [field]: value == "" ? false : true,
        "isFullDay": false,
        "isHalfDay": false,
        "dayType" :0,
        "attendanceDate": (attendanceYear + "-" + attendanceMonth + "-" + index),
        "dayOT": 0,
        "nightOT": 0,
        "doubleOT": 0,
        "shiftID": 0,
        "status": 1
      };
    }
    else {
      if (value > 12 || value < 0) {
        alert.error("Please add valid hours");
      }
      else {
        newArr[idx] = {
          ...newArr[idx],
          [field]: value == "" ? parseInt(0) : parseInt(value),
          "attendanceDate": (attendanceYear + "-" + attendanceMonth + "-" + index),
          "status": 1
        };
      }
    }
    setAttendanceArray(newArr);
  }

  function handleDateChange(date) {
    setAttendances({
      ...attendances,
      attendanceDate: date
    })
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

  function checkEmpDayType(dayType, radioButtonName){
    if ((dayType==1 && radioButtonName==="isFullDay") )
    {
      return true;
    }
    if ((dayType==2 && radioButtonName==="isHalfDay")  )
    {
      return true;
    } 
    if ((dayType==3 && radioButtonName==="isLeave"))
    {
      return true;
  }
}

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: attendances.groupID,
              factoryID: attendances.factoryID,
              regNo: attendances.regNo,
              attendanceDate: attendances.attendanceDate
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                regNo: Yup.string().required('Reg number required')
              })
            }
            onSubmit={() => trackPromise(getEmployeDetails())}
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
                              onChange={(e) => handleChange1(e)}
                              value={attendances.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                              }}
                              size='small'
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
                              onChange={(e) => handleChange1(e)}
                              value={attendances.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                              size='small'
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
                              onChange={(e) => handleChange1(e)}
                              value={attendances.regNo}
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
                                helperText="Select applicable month *"
                                value={attendances.attendanceDate}
                                onChange={(date) => handleDateChange(date)}
                                size='small'
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Box display="flex" justifyContent="flex-end" p={2} >
                          <Button
                            color="primary"
                            disabled={isSubmitting || isSearchButton}
                            type="submit"
                            variant="contained"
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <CardContent hidden={isHideField}>
                      </CardContent>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
          <Formik
            initialValues={{
              groupID: attendances.groupID,
              factoryID: attendances.factoryID,
              regNo: attendances.regNo,
              epfNo: attendances.epfNo,
              attendanceDate: attendances.attendanceDate,
              days: attendances.days,
              dayOT: attendances.dayOT,
              nightOT: attendances.nightOT,
              doubleOT: attendances.doubleOT
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                regNo: Yup.string().required('Reg number is required'),
                epfNo: Yup.string(),
                attendanceDate: Yup.string(),
                days: Yup.number(),
                dayOT: Yup.number(),
                nightOT: Yup.number()
              })
            }
            onSubmit={() => trackPromise(saveUpdateEmployeeAttendances())}
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
                            error={Boolean(touched.empName && errors.empName)}
                            fullWidth
                            helperText={touched.empName && errors.empName}
                            name="empName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={attendances.empName}
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
                            error={Boolean(touched.nic && errors.nic)}
                            fullWidth
                            helperText={touched.nic && errors.nic}
                            name="nic"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={attendances.nic}
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
                        <Card style={{ padding: 30 }}>
                          <Grid container spacing={3}>
                            <Grid item md={2} xs={12}>
                              <Typography style={{ fontSize: '16px' }} align="left"><b>No Of Working Days: </b> {workingDays.length}</Typography>

                            </Grid>
                            <Grid item md={2} xs={12}>
                              <Typography style={{ fontSize: '16px' }} align="left"><b>No Of Leave Days: </b> {leaveDays.length}</Typography>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <Typography style={{ fontSize: '16px' }} align="left"><b>Day OT Hours: </b> {dayOTHours}</Typography>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <Typography style={{ fontSize: '16px' }} align="left"><b>Night OT Hours: </b> {nightOTHours}</Typography>

                            </Grid>
                            <Grid item md={2} xs={12}>
                              <Typography style={{ fontSize: '16px' }} align="left"><b>Double OT Hours: </b> {doubleOTHours}</Typography>
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
                              <TableCell align="center">Shift</TableCell>
                              <TableCell align="center">F  &nbsp; &nbsp; &nbsp; &nbsp; H &nbsp; &nbsp; &nbsp; &nbsp; L </TableCell>
                              <TableCell align="center">Day OT</TableCell>
                              <TableCell align="center">Night OT</TableCell>
                              <TableCell align="center">Double OT</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {attendanceAray.map((row, index) => {
                              let ID = index + 1;
                              return (
                                <TableRow key={index}>
                                  <TableCell component="th" scope="row">{index + 1}</TableCell>
                                  <TableCell align="center" style={{ textAlign: "center", width: "180px" }} >
                                    <Grid >
                                      <TextField select
                                        fullWidth
                                        name={"shiftID" + ID}
                                        onBlur={handleBlur}
                                        onChange={(e) => hadleAllChanges(e, ID, 'shiftID')}
                                        value={parseInt(row.shiftID) > 0 ? parseInt(row.shiftID) : 0}
                                        variant="outlined"
                                        id={ID}
                                        defaultValue={0}
                                        disabled={row.isLeave || (toDate < ID ? true : false)}
                                        size='small'
                                      >
                                        <MenuItem value={0}>--Select Shift--</MenuItem>
                                        {generateDropDownMenu(employeeShift)}
                                      </TextField>
                                    </Grid>
                                  </TableCell>
                                  <TableCell align="center" style={{ textAlign: "center", width: "180px" }}>
                                    <RadioGroup row name="shipSpeed" defaultSelected="not_light" key={ID} style={{ marginLeft: "10px" }} >
                                      <Radio
                                        checked={checkEmpDayType(row.dayType,"isFullDay") }
                                        onChange={(e) => hadleAllChanges(e, ID, 'isFullDay')}
                                        value={"isFullDay" + ID}
                                        name={"radio-button-demo" + ID}
                                        inputProps={{ 'aria-label': 'A' }}
                                        disabled={(toDate < ID ? true : false)}
                                      />
                                      <Radio
                                        checked={checkEmpDayType(row.dayType,"isHalfDay") }
                                        onChange={(e) => hadleAllChanges(e, ID, 'isHalfDay')}
                                        value={"isHalfDay" + ID}
                                        name={"radio-button-demo" + ID}
                                        inputProps={{ 'aria-label': 'B' }}
                                        disabled={(toDate < ID ? true : false)}
                                      />
                                      <RedRadio
                                        checked={checkEmpDayType(row.dayType,"isLeave") }
                                        onChange={(e) => hadleAllChanges(e, ID, 'isLeave')}
                                        value={"isLeave" + ID}
                                        name={"radio-button-demo" + ID}
                                        inputProps={{ 'aria-label': 'C' }}
                                        disabled={(toDate < ID ? true : false)}
                                      />
                                    </RadioGroup>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Grid width={20} style={{ marginLeft: '10px' }}>
                                      <TextField
                                        style={{ width: '70px' }}
                                        size='small'
                                        id="outlined-size-small"
                                        name={ID}
                                        onChange={(e) => hadleAllChanges(e, ID, 'dayOT')}
                                        value={row.isLeave ? 0 : row.dayOT}
                                        variant="outlined"
                                        type="number"
                                        disabled={row.isLeave || (toDate < ID ? true : false)}
                                      />
                                    </Grid>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Grid width={20} style={{ marginLeft: '10px', padding: "0" }}>
                                      <TextField
                                        style={{ width: '70px' }}
                                        size='small'
                                        id="outlined-size-small"
                                        name={ID}
                                        onChange={(e) => hadleAllChanges(e, ID, 'nightOT')}
                                        value={row.isLeave ? 0 : row.nightOT}
                                        variant="outlined"
                                        type="number"
                                        disabled={row.isLeave || (toDate < ID ? true : false)}
                                      />
                                    </Grid>
                                  </TableCell>
                                  <TableCell align='center'>
                                    <Grid width={20} style={{ marginLeft: '10px', padding: "0" }}>
                                      <TextField
                                        style={{ width: '70px' }}
                                        size='small'
                                        id="outlined-size-small"
                                        name={ID}
                                        onChange={(e) => hadleAllChanges(e, ID, 'doubleOT')}
                                        value={row.isLeave ? 0 : row.doubleOT}
                                        disabled={row.isLeave || (toDate < ID ? true : false)}
                                        variant="outlined"
                                        type="number"
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
                          disabled={isSubmitting || isDisableButton}
                          type="submit"
                          variant="contained"
                        >
                          Mark Attendence
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
  );
};

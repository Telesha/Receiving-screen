import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Button,
  makeStyles,
  Container,
  Divider,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  Switch,
  Tooltip,
  IconButton
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import { useAlert } from "react-alert";
import PageHeader from 'src/views/Common/PageHeader';
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';
import moment from 'moment';
import ReactToPrint from "react-to-print";
//import CreatePdf from './createPdf';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import MaterialTable from "material-table";
import Chip from '@material-ui/core/Chip';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';

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
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecordAndNew: {
    backgroundColor: "#FFBE00"
  },
  colorRecord: {
    backgroundColor: "green",
  },
  colorReject: {
    backgroundColor: "red",
  },
  colorApprove: {
    backgroundColor: "green",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
}));

const screenCode = 'EMPLOYEELEAVEFORM';

export default function EmployeeLeaveFormAddEdit() {
  const agriGenERPEnum = new AgriGenERPEnum();
  const componentRef = useRef([]);
  const [title, setTitle] = useState("Employee Leave Form")
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [division, setDivisions] = useState();
  const [leaveTypes, setLeaveTypes] = useState();
  const [leaveTypesOne, setLeaveTypesOne] = useState([]);
  const [employeeVerified, setEmployeeVerified] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [remainingLeave, setRemainingLeave] = useState(0);
  const [refNo, setRefNo] = useState(0);
  const [allocatedDays, setAllocatedDays] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [isPlucking, setIsPlucking] = useState(true)
  const [reportData, setReportData] = useState([]);
  const [isDisable, setIsDisable] = useState(true);
  const [employeeListArray, setEmployeeListArray] = useState([]);
  const [pdfData, setpdfData] = useState({
    daysEnjoyed: 0,
    fromDate: '',
    toDate: ''
  });
  const [open, setOpen] = useState(false);
  const [leaveRequestData, setLeaveRequestData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isPDF, setIsPDF] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    groupID: 0,
    factoryID: 0,
    divisionID: 0,
    leaveTypeID: 0,
    isPayment: false,
    regNo: '',
    employeeID: 0,
    fromDate: '',
    toDate: '',
    date: '',
    coveringPerson: '',
    noOfDays: 0,
    isCoveringPerson: false,
    applyForID: 1,
    timeFrom: '',
    timeTo: '',
    reason: '',
    halfID: 0,
    employeeRequestStatusID: 0,
    pendingLeave: 0,
    isTrue: false,
    divisionName: '',
    employeeName: ''
  })
  const [isCleared, setIsCleared] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isLeaveRequestApproveReject: false
  });
  let decryptedID = 0;
  const { leaveRefNo } = useParams();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app/employeeLeaveForm/listing');
  }

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const alert = useAlert();

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    decryptedID = atob(leaveRefNo.toString());
    if (decryptedID != 0) {
      trackPromise(getEmployeeLeaveFormDetailsByEmployeeLeaveRequestID(decryptedID));
      trackPromise(getEmployeeLeaveFormDetailsByLeaveRefNo(decryptedID));
    }
  }, []);

  useEffect(() => {
    if (leaveFormData.groupID != 0) {
      trackPromise(getFactoriesForDropDown());
    }
  }, [leaveFormData.groupID]);

  useEffect(() => {
    if (leaveFormData.regNo != '') {
      getEmployeeAvailability();
    }
  }, [leaveFormData.regNo]);

  useEffect(() => {
    if (!isUpdate) {
      if (leaveFormData.employeeID !== 0 && leaveFormData.leaveTypeID !== 0) {
        getEmployeeRemainingLeaveValue(parseInt(leaveFormData.leaveTypeID), leaveFormData.regNo)
      }
    }
  }, [leaveFormData.employeeID, leaveFormData.leaveTypeID]);

  useEffect(() => {
    if (!isUpdate) {
      if (leaveFormData.employeeID !== 0 && leaveFormData.leaveTypeID !== 0) {
        getAllocatedDays(parseInt(leaveFormData.leaveTypeID), parseInt(leaveFormData.employeeID))
      }
    }
  }, [leaveFormData.employeeID, leaveFormData.leaveTypeID]);

  useEffect(() => {
    if (leaveFormData.factoryID != '') {
      trackPromise(getleaveTypesForDropDown());
    }
  }, [leaveFormData.factoryID]);

  useEffect(() => {
    if (leaveFormData.toDate != '' && leaveFormData.toDate != '') {
      handleDateDifference();
    }
  }, [leaveFormData.toDate]);

  useEffect(() => {
    if (leaveFormData.toDate != '' && leaveFormData.toDate != '') {
      handleDateDifference();
    }
  }, [leaveFormData.fromDate]);

  useEffect(() => {
    if (leaveFormData.halfID == 1) {
      setLeaveFormData({
        ...leaveFormData,
        timeFrom: agriGenERPEnum.EmployeeLeaveFormMorningHalf.TimeFrom,
        timeTo: agriGenERPEnum.EmployeeLeaveFormMorningHalf.TimeTo
      })
    }
    else {
      setLeaveFormData({
        ...leaveFormData,
        timeFrom: agriGenERPEnum.EmployeeLeaveFormEveningHalf.TimeFrom,
        timeTo: agriGenERPEnum.EmployeeLeaveFormEveningHalf.TimeTo
      })
    }
  }, [leaveFormData.halfID]);

  useEffect(() => {
    setIsCleared(!isCleared);
  }, [leaveFormData.groupID]);

  useEffect(() => {
    setIsCleared(!isCleared);
  }, [leaveFormData.factoryID]);

  useEffect(() => {
    trackPromise(getCostCenterDetailsByGardenID());
  }, [leaveFormData.factoryID]);

  useEffect(() => {
    if (leaveFormData.regNo) {
      FindEmployeeFromEmployeeArray()
    }
  }, [leaveFormData.regNo]);

  useEffect(() => {
    if (leaveFormData.groupID !== 0 && leaveFormData.factoryID !== 0) {
      trackPromise(getEmployeesByEstateID());
    }
  }, [leaveFormData.groupID, leaveFormData.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITEMPLOYEELEAVEFORM');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isLeaveRequestApproveReject = permissions.find(p => p.permissionCode === 'VIEWLEAVEREQUESTAPPROVEREJECT');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isLeaveRequestApproveReject: isLeaveRequestApproveReject !== undefined
    });

    setLeaveFormData({
      ...leaveFormData,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(leaveFormData.groupID);
    setFactories(factory);
  }

  async function getCostCenterDetailsByGardenID() {
    var response = await services.getDivisionDetailsByEstateID(leaveFormData.factoryID);
    var generated = generateDropDownMenu(response)
    if (generated.length > 0) {
      setLeaveFormData((attendanceDataList) => ({
        ...attendanceDataList,
        divisionID: generated[0].props.value,
      }));
    }
    setDivisions(response);
  };

  async function getleaveTypesForDropDown() {
    const leaveTypes = await services.getleaveTypes();
    let leaveTypeArray = []
    for (let item of Object.entries(leaveTypes)) {
      leaveTypeArray[item[1]["employeeLeaveTypeID"]] = item[1]["employeeLeaveTypeName"]
    }
    setLeaveTypesOne(leaveTypes)
    setLeaveTypes(leaveTypeArray)
  }

  async function getEmployeeAvailability() {
    if (leaveFormData.groupID != 0 && leaveFormData.factoryID != 0 && leaveFormData.regNo != "") {
      const verify = await services.getEmployeeAvailability(leaveFormData.groupID, leaveFormData.factoryID, leaveFormData.regNo);
      if (verify.statusCode == "Success") {
        setEmployeeVerified(true);
        setLeaveFormData({
          ...leaveFormData,
          employeeID: verify.data.employeeID
        })
      }
      else {
        setEmployeeVerified(false);
      }
    }
  }

  async function getEmployeeLeaveFormDetailsByEmployeeLeaveRequestID(leaveRefNo) {
    let response = await services.getEmployeeLeaveFormDetailsByEmployeeLeaveRequestID(leaveRefNo);
    setTitle("Edit Employee Leave Form");
    let model = {
      groupID: response.groupID,
      factoryID: response.factoryID,
      leaveTypeID: response.leaveTypeID,
      isPayment: response.isPayment,
      regNo: response.registrationNumber,
      applyForID: response.applyForID,
      fromDate: new Date(response.fromDate).toISOString().slice(0, 10),
      toDate: new Date(response.toDate).toISOString().slice(0, 10),
      noOfDays: response.noOfDays,
      reason: response.reason,
      isCoveringPerson: response.isCoveringPerson,
      coveringPerson: response.coveringPerson,
      timeFrom: response.timeFrom,
      timeTo: response.timeTo,
      date: new Date(response.date).toISOString().slice(0, 10),
      halfID: response.halfID,
      isPlucking: response.isPlucking,
      employeeRequestStatusID: response.employeeLeaveRequestStatusID,
      pendingLeave: response.pendingLeave > 0 ? true : false,
      daysEnjoyed: 0,
      isTrue: response.isTrue,
      divisionID: response.divisionID,
      employeeName: response.employeeName
    }
    setIsPlucking(response.isPlucking)
    setLeaveFormData(model);
    setIsUpdate(true);
    setEmployeeVerified(false);
    setReportData([response]);
    setRemainingLeave(response.remainingQuntity);
    getEmployeeRemainingLeaveValue(parseInt(model.leaveTypeID), model.regNo);
    getAllocatedDays(parseInt(model.leaveTypeID), parseInt(leaveFormData.employeeID));
  }

  async function getEmployeeLeaveFormDetailsByLeaveRefNo(LeaveRefNo) {
    let response = await services.getEmployeeLeaveFormDetailsByLeaveRefNo(LeaveRefNo);
    response.data.forEach((x, i) => {
      x.index = i
    })
    setLeaveRequestData(response.data)
  }

  async function getEmployeeRemainingLeaveValue(leaveTypeID, regNo) {
    let remaining = await services.getEmployeeRemainingLeaveValue(leaveTypeID, regNo)
    if (remaining.statusCode == "Success") {
      setRemainingLeave(remaining.data.remainingLeaveValue)
    }
  }

  async function getAllocatedDays(leaveTypeID, regNo) {
    let allocatedDays = await services.getAllocatedDays(leaveTypeID, regNo)
    if (allocatedDays.data === null) {
      setAllocatedDays(0)
    }
    else {
      setAllocatedDays(allocatedDays.data.allocatedDays)
    }
  }

  async function submitApplication() {
    let pass = false;
    let model = {
      groupID: parseInt(leaveFormData.groupID),
      factoryID: parseInt(leaveFormData.factoryID),
      registrationNumber: leaveFormData.regNo,
      employeeID: parseInt(leaveFormData.employeeID),
      leaveTypeID: parseInt(leaveFormData.leaveTypeID),
      applyForID: parseInt(leaveFormData.applyForID),
      fromDate: leaveFormData.fromDate,
      toDate: leaveFormData.toDate,
      noOfDays: parseInt(leaveFormData.noOfDays),
      reason: leaveFormData.reason,
      isCoveringPerson: leaveFormData.isCoveringPerson,
      coveringPerson: leaveFormData.isCoveringPerson ? leaveFormData.coveringPerson : "",
      timeFrom: leaveFormData.timeFrom.toString(),
      timeTo: leaveFormData.timeTo.toString(),
      date: leaveFormData.date.toString(),
      halfID: parseInt(leaveFormData.halfID),
      CreatedBy: parseInt(tokenService.getUserIDFromToken()),
      isPlucking: isPlucking,
      leaveRefNo: generateLeaveRefNo()
    }

    const found = leaveTypesOne.find(x => x.employeeLeaveTypeID == leaveFormData.leaveTypeID).isPayment
    const leaveTypeCode = leaveTypesOne.find(x => x.employeeLeaveTypeID == leaveFormData.leaveTypeID).leaveTypeCode
    if (allocatedDays == 0 && (leaveTypeCode !== "LWW")) {
      setLeaveFormData({
        ...leaveFormData,
        leaveTypeID: 0
      });
      alert.error("This Employee has no leaves allocated");
      pass = false
    }
    else if (found == true) {
      if (remainingLeave < leaveFormData.noOfDays) {
        alert.error("Exceeds remaining number of leaves");
        pass = false
      }
      else {
        pass = true
      }
    }
    else {
      pass = true
    }
    if (pass == true) {
      const response = await services.SaveLeaveFormDetails(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        clearData();
        navigate('/app/employeeLeaveForm/listing');
      }
      else {
        alert.error(response.message);
      }
    }
  }

  function generateLeaveRefNo() {
    const currentDate = new Date();

    const no = Math.floor(1000000 + Math.random() * 9000000);
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const leaveRefNoInt = `${no}${seconds}`;
    const leaveRefNo = parseInt(leaveRefNoInt);


    return leaveRefNo;
  }

  async function updateEmployeeLeaveDetails() {
    let model = {
      groupID: parseInt(leaveFormData.groupID),
      factoryID: parseInt(leaveFormData.factoryID),
      registrationNumber: leaveFormData.regNo,
      employeeID: parseInt(leaveFormData.employeeID),
      leaveTypeID: parseInt(leaveFormData.leaveTypeID),
      applyForID: parseInt(leaveFormData.applyForID),
      fromDate: leaveFormData.applyForID == 2 ? null : leaveFormData.fromDate,
      toDate: leaveFormData.applyForID == 2 ? null : leaveFormData.toDate,
      noOfDays: parseInt(leaveFormData.noOfDays),
      reason: leaveFormData.reason,
      isCoveringPerson: leaveFormData.isCoveringPerson,
      coveringPerson: leaveFormData.isCoveringPerson ? leaveFormData.coveringPerson : "",
      timeFrom: leaveFormData.timeFrom.toString(),
      timeTo: leaveFormData.timeTo.toString(),
      date: leaveFormData.applyForID == 1 ? null : leaveFormData.date,
      CreatedBy: parseInt(tokenService.getUserIDFromToken()),
      isPlucking: isPlucking
    }

    if (leaveFormData.isPayment == true) {
      if (remainingLeave < leaveFormData.noOfDays) {
        alert.error("Exceeds remaining number of leaves");
      }
    }
    else {
      const response = await services.updateLeaveFormDetails(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        clearData();
        navigate('/app/employeeLeaveForm/listing');
      }
      else {
        alert.error(response.message);
      }
    }
  }

  const handleReject = async () => {
    const selectedRowsData = selectedRows.map(row => ({
      employeeLeaveRequestID: row.employeeLeaveRequestID,
      registrationNumber: row.registrationNumber,
      ModifiedBy: parseInt(tokenService.getUserIDFromToken())
    }));
    var model = selectedRowsData[0]
    const response = await services.SaveRejectedLeaveRequest(model);
    if (response.statusCode === "Success") {

      decryptedID = atob(leaveRefNo);

      if (decryptedID !== 0) {
        const updatedData = leaveRequestData.map(row => {
          if (selectedRowsData.some(selectedRow => selectedRow.employeeLeaveRequestID === row.employeeLeaveRequestID)) {
            return { ...row, employeeLeaveRequestStatusID: 3 };
          }
          return row;
        });

        setLeaveRequestData(updatedData);

        trackPromise(getEmployeeLeaveFormDetailsByEmployeeLeaveRequestID(decryptedID), getEmployeeLeaveFormDetailsByLeaveRefNo(decryptedID));
      }
      alert.success(response.message);
      setSelectedRows([]);
    } else {
      alert.error(response.message);
      setSelectedRows([]);
    }
    setOpen(false);
    setIsDisable(true)
  };

  async function handleApproveClick() {
    const selectedRowsData = selectedRows.map(row => ({
      employeeLeaveRequestID: row.employeeLeaveRequestID,
      registrationNumber: row.registrationNumber,
      employeeID: row.employeeID,
      noOfDays: row.noOfDays,
      leaveTypeID: row.leaveTypeID,
      isPayment: row.isPayment,
      fromDate: row.fromDate,
      toDate: row.toDate,
      ModifiedBy: parseInt(tokenService.getUserIDFromToken())
    }));

    const daysEnjoyed = selectedRowsData.length;
    let model = {
      approve: selectedRowsData
    }

    const response = await services.SaveApprovedLeaveRequest(model);
    if (response.statusCode == "Success") {
      selectedRowsData.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));
      const FromDate = selectedRowsData[0].fromDate;
      const ToDate = selectedRowsData[selectedRowsData.length - 1].fromDate;
      setpdfData({
        ...pdfData,
        daysEnjoyed: daysEnjoyed,
        fromDate: FromDate.split('T')[0],
        toDate: ToDate.split('T')[0]
      })
      setIsPDF(true)
      decryptedID = atob(leaveRefNo);
      if (decryptedID != 0) {
        if (decryptedID !== 0) {
          const updatedData = leaveRequestData.map(row => {
            if (selectedRowsData.some(selectedRow => selectedRow.employeeLeaveRequestID === row.employeeLeaveRequestID)) {
              return { ...row, employeeLeaveRequestStatusID: 2 };
            }
            return row;
          });
          setLeaveRequestData(updatedData);
          trackPromise(getEmployeeLeaveFormDetailsByEmployeeLeaveRequestID(decryptedID),
            getEmployeeLeaveFormDetailsByLeaveRefNo(decryptedID));
        }
        setSelectedRows([]);
      }
      alert.success(response.message);
    }
    else {
      alert.error(response.message);
      setSelectedRows([]);
    }
    setIsDisable(true)
  }

  function submitForm() {
    if (isUpdate == true) {
      trackPromise(updateEmployeeLeaveDetails());
    } else {
      trackPromise(submitApplication());
    }
  };

  async function getEmployeesByEstateID() {
    const employees = await services.getEmployeesByEstateID(leaveFormData.factoryID);
    setEmployeeListArray(employees);
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

  function FindEmployeeFromEmployeeArray() {
    var employee = employeeListArray.find(x => x.regNo === leaveFormData.regNo);
    if (employee) {
      setLeaveFormData({
        ...leaveFormData,
        employeeID: employee.employeeID
      })
      setEmployeeName(employee.employeeName)
    } else {
      setLeaveFormData({
        ...leaveFormData,
        employeeID: 0
      })
      setEmployeeName('')
    }
  }

  function handleDateDifference() {
    const oneDay = 24 * 60 * 60 * 1000;
    const startTimestamp = new Date(leaveFormData.fromDate).getTime();
    const endTimestamp = new Date(leaveFormData.toDate).getTime();

    const diffInDays = Math.round(Math.abs(((startTimestamp - endTimestamp) / oneDay)) + 1);

    setLeaveFormData({
      ...leaveFormData,
      noOfDays: diffInDays
    })
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setLeaveFormData({
      ...leaveFormData,
      [e.target.name]: value
    });
  }

  function handleFromDateChange(value) {
    setLeaveFormData({
      ...leaveFormData,
      fromDate: moment(value).format('YYYY-MM-DD')
    });
  }

  function handleToDateChange(value) {
    setLeaveFormData({
      ...leaveFormData,
      toDate: moment(value).format('YYYY-MM-DD')
    });
  }

  function isCoveringPersonHandleChange(e) {
    const target = e.target;
    const value = target.name === 'isCoveringPerson' ? target.checked : target.value

    setLeaveFormData({
      ...leaveFormData,
      [e.target.name]: value
    });
  };

  function clearData() {
    setLeaveFormData({
      ...leaveFormData,
      regNo: '',
      employeeID: 0,
      leaveTypeID: 0,
      fromDate: '',
      toDate: '',
      timeFrom: '',
      timeTo: '',
      date: '',
      noOfDays: 0,
      isCoveringPerson: false,
      coveringPerson: '',
      reason: '',
      applyForID: 0
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: leaveFormData.groupID,
              factoryID: leaveFormData.factoryID,
              regNo: leaveFormData.regNo,
              leaveTypeID: leaveFormData.leaveTypeID,
              applyForID: leaveFormData.applyForID,
              fromDate: leaveFormData.fromDate,
              toDate: leaveFormData.toDate,
              date: leaveFormData.date,
              noOfDays: leaveFormData.noOfDays,
              timeTo: leaveFormData.timeTo,
              timeFrom: leaveFormData.timeFrom,
              reason: leaveFormData.reason,
              isCoveringPerson: leaveFormData.isCoveringPerson,
              coveringPerson: leaveFormData.coveringPerson,
              halfID: leaveFormData.halfID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                leaveTypeID: Yup.number().required('Leave Type is required').min("1", 'Leave Type is required'),
                applyForID: Yup.number().required('Applying for is required').min("1", 'Applying for is required'),
                fromDate: Yup.date().when('applyForID', { is: 1, then: Yup.date().required('From Date is required') }),
                toDate: Yup.date().when('applyForID', { is: 1, then: Yup.date().required('To Date is required') }),
                noOfDays: Yup.number()
                  .when('applyForID', {
                    is: 1,
                    then: Yup.number().min(1, 'No of days must be greater than zero').required('No of days is required'),
                    otherwise: Yup.number()
                  }),
                regNo: Yup.string().required('Registration No is required'),
                halfID: Yup.number().when('applyForID', { is: 2, then: Yup.number().required('Half type is required').min(1, 'Half type is required') }),
              })
            }
            onSubmit={submitForm}
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
                        <Card style={{ padding: 30, marginTop: 20, marginBottom: 20 }}>
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="groupID">
                                Group *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.groupID && errors.groupID)}
                                fullWidth
                                helperText={touched.groupID && errors.groupID}
                                size='small'
                                name="groupID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={leaveFormData.groupID}
                                variant="outlined"
                                id="groupID"
                                InputProps={{
                                  readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                                }}
                              >
                                <MenuItem value="0">--Select Group--</MenuItem>
                                {generateDropDownMenu(groups)}
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="factoryID">
                                Estate *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.factoryID && errors.factoryID)}
                                fullWidth
                                helperText={touched.factoryID && errors.factoryID}
                                size='small'
                                name="factoryID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={leaveFormData.factoryID}
                                variant="outlined"
                                id="factoryID"
                                InputProps={{
                                  readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                                }}
                              >
                                <MenuItem value="0">--Select Estate--</MenuItem>
                                {generateDropDownMenu(factories)}
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="regNo">
                                Registration Number *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.regNo && errors.regNo)}
                                fullWidth
                                helperText={touched.regNo && errors.regNo}
                                size='small'
                                name="regNo"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={leaveFormData.regNo}
                                variant="outlined"
                                id="regNo"
                                InputProps={{
                                  readOnly: isUpdate ? true : false
                                }}
                              >
                              </TextField>
                            </Grid>
                          </Grid>
                          <Grid container spacing={3} style={{ marginBottom: 20 }}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="employeeName">
                                Employee Name
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.employeeName && errors.employeeName)}
                                fullWidth
                                helperText={touched.employeeName && errors.employeeName}
                                name="employeeName"
                                onBlur={handleBlur}
                                size='small'
                                value={isUpdate ? leaveFormData.employeeName : employeeName}
                                variant="outlined"
                                id="employeeName"
                                type="text"
                                inputProps={{
                                  readOnly: true
                                }}
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12} >
                              <InputLabel shrink id="leaveTypeID">
                                Leave Type *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.leaveTypeID && errors.leaveTypeID)}
                                fullWidth
                                helperText={touched.leaveTypeID && errors.leaveTypeID}
                                size='small'
                                name="leaveTypeID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={leaveFormData.leaveTypeID}
                                disabled={!employeeVerified || (leaveFormData.employeeRequestStatusID == 2 || leaveFormData.employeeRequestStatusID == 3)}
                                variant="outlined"
                                id="leaveTypeID"
                                InputProps={{
                                  readOnly: isUpdate
                                }}
                              >
                                <MenuItem value="0">--Select Leave Type--</MenuItem>
                                {generateDropDownMenu(leaveTypes)}
                              </TextField>
                            </Grid>
                            <Grid item md={4} xs={12} >
                              <InputLabel shrink id="applyForID">
                                Apply For *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.applyForID && errors.applyForID)}
                                fullWidth
                                helperText={touched.applyForID && errors.applyForID}
                                size='small'
                                name="applyForID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={leaveFormData.applyForID}
                                disabled={!employeeVerified || (leaveFormData.employeeRequestStatusID == 2 || leaveFormData.employeeRequestStatusID == 3)}
                                variant="outlined"
                                id="applyForID"
                                InputProps={{
                                  readOnly: true
                                }}
                              >
                                <MenuItem value="0">--Select Apply For--</MenuItem>
                                <MenuItem value="1">Full Day</MenuItem>
                              </TextField>
                            </Grid>
                            {leaveFormData.applyForID == 2 ?
                              <Grid item md={4} xs={12} >
                                <InputLabel shrink id="halfID">
                                  Half Type *
                                </InputLabel>
                                <TextField select
                                  error={Boolean(touched.halfID && errors.halfID)}
                                  fullWidth
                                  helperText={touched.halfID && errors.halfID}
                                  size='small'
                                  name="halfID"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={leaveFormData.halfID}
                                  disabled={!employeeVerified}
                                  variant="outlined"
                                  id="halfID"
                                >
                                  <MenuItem value="0">--Select Half --</MenuItem>
                                  <MenuItem value="1">Morning Half</MenuItem>
                                  <MenuItem value="2">Evening Half</MenuItem>
                                </TextField>
                              </Grid>
                              : null}
                          </Grid>
                          <Divider />
                          <Grid container spacing={3}>
                            {leaveFormData.applyForID == 2 ?
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="timeFrom" style={{ marginBottom: '-8px' }}>
                                  Time From
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.timeFrom && errors.timeFrom)}
                                  helperText={touched.timeFrom && errors.timeFrom}
                                  id="timeFrom"
                                  type="time"
                                  name="timeFrom"
                                  size='small'
                                  inputVariant="outlined"
                                  className={classes.textField}
                                  disabled={!employeeVerified}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  inputProps={{
                                    step: 300, // 5 min
                                    readOnly: true
                                  }}
                                  onChange={(e) => handleChange(e)}
                                  value={leaveFormData.timeFrom}
                                />
                              </Grid>
                              : null}
                            {leaveFormData.applyForID == 2 ?
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="timeTo" style={{ marginBottom: '-8px' }}>
                                  Time To
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.timeTo && errors.timeTo)}
                                  helperText={touched.timeTo && errors.timeTo}
                                  id="timeTo"
                                  type="time"
                                  name="timeTo"
                                  size='small'
                                  inputVariant="outlined"
                                  className={classes.textField}
                                  disabled={!employeeVerified}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  inputProps={{
                                    step: 300, // 5 min
                                    readOnly: true
                                  }}
                                  onChange={(e) => handleChange(e)}
                                  value={leaveFormData.timeTo}
                                />
                              </Grid>
                              : null}
                            {leaveFormData.applyForID != 2 ?
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="fromDate" >
                                  From Date *
                                </InputLabel>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                  <KeyboardDatePicker
                                    disableCloseOnSelect
                                    error={Boolean(touched.fromDate && errors.fromDate)}
                                    autoOk
                                    format="yyyy-MM-dd"
                                    fullWidth
                                    helperText={touched.fromDate && errors.fromDate}
                                    size='small'
                                    name="fromDate"
                                    maxDate={leaveFormData.toDate}
                                    onChange={(e) => handleFromDateChange(e)}
                                    value={leaveFormData.fromDate}
                                    disabled={!employeeVerified || (leaveFormData.employeeRequestStatusID == 2 || leaveFormData.employeeRequestStatusID == 3)}
                                    inputVariant="outlined"
                                    id="fromDate"
                                    inputProps={{
                                      readOnly: isUpdate
                                    }}
                                    KeyboardButtonProps={{
                                      'aria-label': 'change date',
                                    }}
                                  />
                                </MuiPickersUtilsProvider>
                              </Grid>
                              : null}
                            {leaveFormData.applyForID != 2 ?
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="toDate" >
                                  To Date *
                                </InputLabel>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                  <KeyboardDatePicker
                                    disableCloseOnSelect
                                    error={Boolean(touched.toDate && errors.toDate)}
                                    autoOk
                                    format="yyyy-MM-dd"
                                    fullWidth
                                    helperText={touched.toDate && errors.toDate}
                                    size='small'
                                    name="toDate"
                                    minDate={leaveFormData.fromDate}
                                    onChange={(e) => handleToDateChange(e)}
                                    value={leaveFormData.toDate}
                                    disabled={!employeeVerified ||
                                      (leaveFormData.employeeRequestStatusID == 2 || leaveFormData.employeeRequestStatusID == 3)}
                                    inputVariant="outlined"
                                    id="toDate"
                                    inputProps={{
                                      readOnly: isUpdate
                                    }}
                                    KeyboardButtonProps={{
                                      'aria-label': 'change date',
                                    }} />
                                </MuiPickersUtilsProvider>
                              </Grid>
                              : null}
                            {leaveFormData.applyForID == 0 || leaveFormData.applyForID == 1 ?
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="noOfDays">
                                  No Of Days *
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.noOfDays && errors.noOfDays)}
                                  fullWidth
                                  helperText={touched.noOfDays && errors.noOfDays}
                                  size='small'
                                  name="noOfDays"
                                  type='number'
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={leaveFormData.noOfDays}
                                  disabled
                                  variant="outlined"
                                  id="noOfDays"
                                >
                                </TextField>
                              </Grid>
                              :
                              <Grid item md={4} xs={12} >
                                <InputLabel shrink id="date">
                                  Date *
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  size='small'
                                  name="date"
                                  type="date"
                                  onChange={(e) => handleChange(e)}
                                  value={leaveFormData.date}
                                  disabled={!employeeVerified}
                                  variant="outlined"
                                  id="date"
                                />
                              </Grid>}
                          </Grid>
                          <Grid container spacing={2} >
                            <Grid item md={8} xs={12}>
                              <InputLabel shrink id="reason">
                                Reason
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="reason"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={leaveFormData.reason}
                                disabled={!employeeVerified ||
                                  (leaveFormData.employeeRequestStatusID == 2 || leaveFormData.employeeRequestStatusID == 3)}
                                variant="outlined"
                                id="reason"
                                InputProps={{
                                  readOnly: isUpdate
                                }}
                                multiline
                                rows={3}
                              >
                              </TextField>
                            </Grid>
                          </Grid>
                          <Grid container spacing={3} >
                            <Grid item md={4} xs={12} >
                              <InputLabel shrink id="isCoveringPerson">
                                Is Recover Person
                              </InputLabel>
                              <Switch
                                checked={leaveFormData.isCoveringPerson}
                                size='small'
                                onChange={(e) => isCoveringPersonHandleChange(e)}
                                name="isCoveringPerson"
                                value={leaveFormData.isCoveringPerson}
                                disabled={!employeeVerified || (leaveFormData.employeeRequestStatusID == 2 || leaveFormData.employeeRequestStatusID == 3 || isUpdate)}
                              />
                            </Grid>
                          </Grid>
                          <Grid container spacing={3} style={{ marginTop: '2%' }}>
                            {leaveFormData.isCoveringPerson === true ?
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="coveringPerson">
                                  Recovering Person
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  size='small'
                                  name="coveringPerson"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={leaveFormData.coveringPerson}
                                  disabled={!employeeVerified}
                                  variant="outlined"
                                  id="coveringPerson"
                                  InputProps={{
                                    readOnly: isUpdate
                                  }}
                                >
                                </TextField>
                              </Grid>
                              : null}
                          </Grid>
                          {permissionList.isLeaveRequestApproveReject && isUpdate ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="remainingLeave">
                                Remaining Leave Count
                              </InputLabel>
                              <TextField
                                size='small'
                                name="remainingLeave"
                                type='number'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={remainingLeave}
                                disabled={!employeeVerified}
                                variant="outlined"
                                id="remainingLeave"
                                inputProps={{
                                  readOnly: true
                                }}
                              >
                              </TextField>
                            </Grid> : null}
                          {permissionList.isLeaveRequestApproveReject && isUpdate ?
                            <Grid item md={4} xs={12} >
                              <InputLabel shrink id="refNo">
                                Ref No
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="refNo"
                                type='number'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={refNo}
                                disabled={!employeeVerified}
                                variant="outlined"
                                id="refNo"
                                inputProps={{
                                  readOnly: true
                                }}
                              >
                              </TextField>
                            </Grid> : null}
                        </Card>
                      </CardContent>
                      {leaveRequestData.length > 0 ?
                        <Box minWidth={1000}>
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Emp.ID', field: 'registrationNumber' },
                              { title: 'Emp.Name', field: 'employeeName' },
                              { title: 'Type', field: 'employeeLeaveTypeName' },
                              {
                                title: 'Apply For', field: 'applyForID',
                                render: rowData => {
                                  if (rowData.applyForID == 1)
                                    return "Full Day"
                                  else if (rowData.applyForID == 2)
                                    return 'Half Day'
                                  else
                                    return '-'
                                }
                              },
                              { title: 'F.Date', field: 'fromDate', render: rowData => rowData.fromDate.split('T')[0] },
                              { title: 'F.Date', field: 'toDate', render: rowData => rowData.toDate.split('T')[0] },
                              {
                                title: 'Status',
                                field: 'employeeLeaveRequestStatusID',
                                render: rowData => {
                                  let label, color;

                                  switch (rowData.employeeLeaveRequestStatusID) {
                                    case 1:
                                      label = 'Pending';
                                      color = 'default';
                                      break;
                                    case 2:
                                      label = 'Approved';
                                      color = 'success';
                                      break;
                                    default:
                                      label = 'Rejected';
                                      color = 'error';
                                      break;
                                  }

                                  return <Chip variant="outlined" label={label} color={color} />;
                                }
                              },
                              {
                                title: 'Action',
                                field: 'selected',
                                render: rowData => {
                                  if (rowData.employeeLeaveRequestStatusID === 1) {
                                    return (
                                      <Checkbox
                                        checked={rowData.tableData.checked === true}
                                        onChange={() => {
                                          const updatedData = [...leaveRequestData];
                                          const index = updatedData.findIndex(item => item.tableData.id === rowData.tableData.id);
                                          updatedData[index].tableData.checked = !updatedData[index].tableData.checked;
                                          const selected = updatedData.filter(item => item.tableData.checked);
                                          setSelectedRows(selected);
                                          setIsDisable(!updatedData[index].tableData.checked);
                                          setLeaveRequestData(updatedData);
                                        }}
                                        disabled={rowData.employeeLeaveRequestStatusID === 1 ? false : true}
                                      />
                                    );
                                  } else {
                                    return (
                                      <Checkbox
                                        checked={true}
                                        disabled={rowData.employeeLeaveRequestStatusID === 1 ? false : true}
                                      />
                                    );
                                  }
                                },
                              },
                              // {
                              //   title: 'PDF',
                              //   field: 'button',
                              //   render: rowData => {
                              //     componentRef.current[rowData.index] = componentRef.current[rowData.index]
                              //     return (
                              //       rowData.employeeLeaveRequestStatusID === 2 ? (
                              //         <>
                              //           <ReactToPrint
                              //             documentTitle={'Leave Entry Form'}
                              //             trigger={() => (
                              //               <Tooltip title="PDF">
                              //                 <IconButton
                              //                   aria-label="delete" >
                              //                   <PictureAsPdfIcon />
                              //                 </IconButton>
                              //               </Tooltip>
                              //             )}
                              //             content={() => componentRef.current[rowData.index]}
                              //           />

                              //         </>
                              //       ) : null
                              //     )
                              //   }
                              // },
                            ]}
                            data={leaveRequestData}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1
                            }}
                          />
                        </Box>
                        : null}
                      <Box display="flex" justifyContent="flex-end" p={2}>

                        {(leaveFormData.employeeRequestStatusID == 0 || leaveFormData.employeeRequestStatusID == 1) && isUpdate != true ?
                          <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            disabled={!employeeVerified}
                            style={{ marginLeft: 10 }}
                          >
                            {"Send To Approve"}
                          </Button>
                          : null}
                        {permissionList.isLeaveRequestApproveReject && isUpdate && selectedRows.length > 0 ?
                          <Button
                            color="primary"
                            variant="contained"
                            style={{ marginLeft: 10 }}
                            className={classes.colorApprove}
                            onClick={() => trackPromise(handleApproveClick())}
                          >
                            Approve
                          </Button>
                          : null}
                        {permissionList.isLeaveRequestApproveReject && isUpdate && selectedRows.length > 0 ?
                          <Button
                            color="primary"
                            variant="contained"
                            style={{ marginRight: '1rem', marginLeft: 10 }}
                            className={classes.colorReject}
                            onClick={() => handleOpenDialog()}
                          >
                            Reject
                          </Button>
                          : null}
                        <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                          <DialogTitle>Confirm Reject</DialogTitle>
                          <DialogContent>
                            <DialogContentText style={{ fontSize: '18px' }}>
                              Are you sure you want to reject this request?
                            </DialogContentText>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={() => trackPromise(handleReject())} color="primary" autoFocus>
                              Yes
                            </Button>
                            <Button onClick={handleCloseDialog} color="primary">
                              No
                            </Button>
                          </DialogActions>
                        </Dialog>
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
  )
}
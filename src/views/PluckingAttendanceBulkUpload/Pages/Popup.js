import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Button,
  makeStyles,
  Container,
  Divider,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  Typography,
  DialogContent,
  DialogContentText,
} from '@material-ui/core';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import moment from 'moment';
import Slide from '@material-ui/core/Slide';

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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const Popup = ({ dialogbox, setDialogbox, closeDialogbox,
  gridData, setGridData, attendenceRowData, updateConfirmation,
  lentEstateID, normDetails, employeeDetails, initialMusterChitJobType, isHolidayValue }) => {
  const alert = useAlert();
  const handleClose = () => {
    setDialogbox(false);
  };
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [divisions, setDivisions] = useState();
  const [musterChitList, setMusterChitList] = useState([]);
  const [JobTypes, setJobTypes] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [lentEstateName, setLentEstateName] = useState()
  const [fieldsForDropdown, setFieldsForDropDown] = useState([]);
  const [gangs, setGangs] = useState([]);
  const [dayOT, setDayOT] = useState(0);
  const [initialJobType, setInitialJobType] = useState(0);
  const [changedJobTypeID, setChangedJobTypeID] = useState(0);
  const [dayType, setDayType] = useState('0');
  const [manDays, setManDays] = useState();
  const [operators, setOperators] = useState([]);
  const [amount, setAmount] = useState(0);
  const [isUpdate, setIsUpdate] = useState(true);

  const [FormDetails, setFormDetails] = useState({
    groupID: '0',
    estateID: '0',
    mainDivisionID: '0',
    divisionID: '0',
    collectedDate: new Date().toISOString().substring(0, 10),
    jobTypeID: '0',
    employeeTypeID: '0',
    employeeNumber: null,
    workTypeID: '0',
    fieldID: '0',
    gangID: '0',
    sessionID: '0',
    amount: 0,
    days: '0',
    noam: 0,
    minNoam: 0,
    isActive: false,
    isHoliday: false,
    musterChitID: '0',
    operatorID: '0',
    employeeName: "",
    lentEstateID: '0',
    dayType: 0,
    dayOT: 0,
    nightOT: 0,
    createdBy: '',
    manDays: 0,

  });
  useEffect(() => {
    getGroupsForDropdown();
    getEmployeeTypesForDropdown();
    getOperatorsForDropdown();
    getFactoriesForDropDown();
    getDivisionsForDropDown();
    getJobTypesForDropDown();
  }, [gridData]);

  useEffect(() => {
    setInitialJobType(attendenceRowData.jobTypeID);
    setFormDetails({
      ...FormDetails,
      groupID: parseInt(attendenceRowData.groupID),
      estateID: parseInt(attendenceRowData.estateID),
      mainDivisionID: parseInt(attendenceRowData.mainDivisionID),
      divisionID: parseInt(attendenceRowData.divisionID),
      collectedDate: (attendenceRowData.collectedDate),
      employeeTypeID: attendenceRowData.employeeTypeID,
      employeeNumber: attendenceRowData.employeeNumber,
      workTypeID: parseInt(attendenceRowData.workTypeID),
      fieldID: attendenceRowData.fieldID,
      gangID: attendenceRowData.gangID,
      sessionID: attendenceRowData.sessionID,
      amount: attendenceRowData.amount,
      noam: attendenceRowData.noam,
      isActive: attendenceRowData.isActive,
      isHoliday: attendenceRowData.isHoliday,
      musterChitID: parseInt(attendenceRowData.musterChitID),
      operatorID: attendenceRowData.operatorID,
      employeeName: attendenceRowData.employeeName,
      dayType: attendenceRowData.dayType,
      dayOT: attendenceRowData.dayOT,
      nightOT: attendenceRowData.nightOT,
      createdBy: attendenceRowData.createdBy,
      manDays: attendenceRowData.manDays,
      jobTypeID: attendenceRowData.jobTypeID,
      lentEstateID: lentEstateID,
      minNoam: attendenceRowData.minNorm
    })
    setAmount(attendenceRowData.amount);
    setDayType(attendenceRowData.dayType);
    setDayOT(attendenceRowData.dayOT);
    setManDays(attendenceRowData.manDays);
  }, [FormDetails.groupID]);

  useEffect(() => {
    if (FormDetails.divisionID > 0) {
      trackPromise(
        getGangDetailsByDivisionID(),
        getFieldDetailsByDivisionIDForDropdown());
    };
  }, [FormDetails.divisionID]);

  useEffect(() => {
    calDayTypeAndOverKilo()
  }, [amount]);

  useEffect(() => {
    calDayTypeAndOverKiloForHoliday()
  }, [FormDetails.isHoliday]);

  useEffect(() => {
    if (parseInt(FormDetails.mainDivisionID) > 0) {
      trackPromise(getMusterChitForDropDown());
    };

  }, [FormDetails.mainDivisionID, FormDetails.collectedDate]);

  useEffect(() => {

    if (FormDetails.lentEstateID > 0) {
      getLentEstateNameByLentEstateID();
    }
  }, [FormDetails.lentEstateID])

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    var factory = await services.getAllFactory();
    setFactories(factory);
  };

  async function getDivisionsForDropDown() {
    const divisions = await services.getAllDivisionDetails();
    setDivisions(divisions);
  }

  async function getMusterChitForDropDown() {
    var responseAll = await services.getMusterChitDetailsByDateDivisionIDUpdate(FormDetails.mainDivisionID, moment(FormDetails.collectedDate).format("YYYY-MM-DD"), isUpdate);
    if (responseAll.length > 0) {
      setMusterChitList(responseAll)
    }
  }

  async function getEmployeeTypesForDropdown() {
    const result = await services.GetEmployeeTypesData();
    setEmployeeTypes(result);
  }

  async function getLentEstateNameByLentEstateID() {
    const result = await services.getLentEstateNameByLentEstateID(FormDetails.lentEstateID)
    setLentEstateName(result);
  }

  async function getFieldDetailsByDivisionIDForDropdown() {
    var response = await services.getFieldDetailsByDivisionIDForDropdown(FormDetails.divisionID);
    setFieldsForDropDown(response);
  };

  async function getGangDetailsByDivisionID() {
    var response = await services.getGangDetailsByDivisionID(FormDetails.divisionID);
    setGangs(response);
  };

  async function getJobTypesForDropDown() {
    var response = await services.GetJobTypesForDropDown();
    setJobTypes(response);
  };

  async function getOperatorsForDropdown() {
    const result = await services.getOperatorsForDropdown();
    setOperators(result);
  }

  function handleChangeOne(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      [e.target.name]: value
    });
    setAmount(value)
  }

  function savePluckingAttendance(values) {
    const updatedTableData = gridData.map((rowData, index) => {
      if (index === attendenceRowData.tableData.id) {
        return {
          ...rowData,
          amount: amount,
          dayType: dayType,
          dayOT: parseInt(dayOT),
          manDays: manDays,
          operatorID: FormDetails.operatorID,
          jobTypeID: changedJobTypeID,
          isHoliday: FormDetails.isHoliday
        };
      } else {
        return rowData;
      }
    });

    setGridData(updatedTableData);
    setDialogbox(false);

    updateConfirmation()
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

  function checkDayType(amount, minNorm, norm) {
    let day = 0;
    let daysValue = 0;
    if (parseFloat(amount) >= minNorm && parseFloat(amount) <= norm) {
      daysValue = "1"
    }
    else if (parseFloat(amount) >= norm) {
      if (parseFloat(amount) == 0 && norm == 0) {
        daysValue = "0"
        day = 0
      } else {
        daysValue = "1"
      }
    } else if (parseFloat(amount) >= norm / 2 && parseFloat(amount) < norm) {
      daysValue = "2"
    } else if (parseFloat(amount) == 0 && norm == 0) {
      daysValue = "0"
      day = 0
    } else if (parseFloat(amount) < (norm / 2)) {
      daysValue = "3"
      day = 0
    } else {
      if (amount == '' || amount == 0) {
        daysValue = "0"
        day = 0
      } else {
        daysValue = "2"
      }
    }
    return [day, daysValue]
  }

  function calOverKilo(daysValue, norm, amount) {
    let day = 0;
    let overKilo = 0;
    if (FormDetails.isHoliday === true) {
      if (daysValue == '1' && (parseFloat(norm) < parseFloat(amount))) {
        overKilo = parseFloat(amount) - parseFloat(norm);
        day = 1.5
      }
      else if (daysValue == '2' && (parseFloat(norm) / 2 < parseFloat(amount))) {
        overKilo = (parseFloat(amount) - (parseFloat(norm) / 2));
        day = 0.75
      } else if (daysValue == '3' && (parseFloat(norm) / 2 > parseFloat(amount))) {
        overKilo = 0
        day = 0
      }
      else {
        if (daysValue == '1') {
          overKilo = 0
          day = 1.5
        } else if (daysValue == '2') {
          overKilo = 0
          day = 0.75
        }
        else {
          overKilo = 0
          day = 0
        }
      }
    } else {
      if (daysValue == '1' && (parseFloat(norm) < parseFloat(amount))) {
        overKilo = parseFloat(amount) - parseFloat(norm);
        day = 1
      }
      else if (daysValue == '2' && (parseFloat(norm) / 2 < parseFloat(amount))) {
        overKilo = (parseFloat(amount) - (parseFloat(norm) / 2));
        day = 0.5
      } else if (daysValue == '3' && (parseFloat(norm) / 2 > parseFloat(amount))) {
        overKilo = 0
        day = 0
      }
      else {
        if (daysValue == '1') {
          overKilo = 0
          day = 1
        } else if (daysValue == '2') {
          overKilo = 0
          day = 0.5
        }
        else {
          overKilo = 0
          day = 0
        }
      }
    }
    return [day, overKilo]
  }

  function calDayTypeAndOverKilo() {
    if ((changedJobTypeID == 5 && isHolidayValue) || (changedJobTypeID == 7 && isHolidayValue)) {
      if (parseFloat(attendenceRowData.noam) / 2 <= parseFloat(amount)) {
        setFormDetails({
          ...FormDetails,
          isHoliday: true
        })
      }
      else {
        setFormDetails({
          ...FormDetails,
          isHoliday: false
        })
      }
    }
    else if ((changedJobTypeID != 5 && isHolidayValue) && (changedJobTypeID != 7 && isHolidayValue) && changedJobTypeID != 0) {
      if (parseFloat(attendenceRowData.noam) / 2 <= parseFloat(amount)) {
        setFormDetails({
          ...FormDetails,
          isHoliday: true
        })
      }
      else {
        setFormDetails({
          ...FormDetails,
          isHoliday: false
        })
      }
    }
    //Get employee data
    const empData = employeeDetails.find((x) => x.registrationNumber == attendenceRowData.employeeNumber)

    //Get employee wise norm data
    const newnormData = normDetails.filter((x) => x.jobTypeID == initialMusterChitJobType);
    const normData = newnormData.find((x) => x.genderID == empData.genderID)
    let normValue = normData == null ? 0 : parseFloat(normData.normValue)
    let minNormValue = normData == null ? 0 : parseFloat(normData.minNormValue)

    //Check day type
    const dayTypeX = checkDayType(FormDetails.amount, minNormValue, normValue)
    let days = dayTypeX[0]
    const daysValue = normData == null ? 3 : dayTypeX[1]

    //cal over kilo
    const calOverKiloX = calOverKilo(daysValue, normValue, FormDetails.amount)
    days = calOverKiloX[0]
    const overKilo = calOverKiloX[1]

    const jobTypeX = DecideJobType(normValue, FormDetails.amount)
    let jobTypeId = jobTypeX[0]

    setChangedJobTypeID(jobTypeId)
    setDayType(parseFloat(daysValue))
    if (jobTypeId == 5) {
      setDayOT(parseInt(0))
    }
    else if (jobTypeId == 7) {
      setDayOT(parseInt(0))
    }
    else {
      setDayOT(parseInt(overKilo))
    }
    if (jobTypeId == 5) {
      setManDays(parseInt(0))
    }
    else if (jobTypeId == 7) {
      setManDays(parseInt(0))
    }
    else {
      setManDays(parseFloat(days))
    }
  }

  function calDayTypeAndOverKiloForHoliday() {

    //Get employee data
    const empData = employeeDetails.find((x) => x.registrationNumber == attendenceRowData.employeeNumber)

    //Get employee wise norm data
    const newnormData = normDetails.filter((x) => x.jobTypeID == initialMusterChitJobType);
    const normData = newnormData.find((x) => x.genderID == empData.genderID)
    let normValue = normData == null ? 0 : parseFloat(normData.normValue)
    let minNormValue = normData == null ? 0 : parseFloat(normData.minNormValue)

    //Check day type
    const dayTypeX = checkDayType(FormDetails.amount, minNormValue, normValue)
    let days = dayTypeX[0]
    const daysValue = normData == null ? 3 : dayTypeX[1]

    //cal over kilo
    const calOverKiloX = calOverKilo(daysValue, normValue, FormDetails.amount)
    days = calOverKiloX[0]
    const overKilo = calOverKiloX[1]

    const jobTypeX = DecideJobType(normValue, FormDetails.amount)
    let jobTypeId = jobTypeX[0]

    setChangedJobTypeID(jobTypeId)
    setDayType(parseFloat(daysValue))
    if (jobTypeId == 5) {
      setDayOT(parseInt(0))
    }
    else if (jobTypeId == 7) {
      setDayOT(parseInt(0))
    }
    else {
      setDayOT(parseInt(overKilo))
    }
    if (jobTypeId == 5) {
      setManDays(parseInt(0))
    }
    else if (jobTypeId == 7) {
      setManDays(parseInt(0))
    }
    else {
      setManDays(parseFloat(days))
    }
  }

  function DecideJobType(noam, amount) {
    let jobTypeID = 0;
    if (initialJobType !== 5 && initialJobType !== 7) {
      if (initialMusterChitJobType == 3) {
        if ((noam / 2) > amount) {
          jobTypeID = 5;
        }
        else {
          jobTypeID = 3;
        }
      }
      else if (initialMusterChitJobType == 6) {
        if ((noam / 2) > amount) {
          jobTypeID = 7;
        }
        else {
          jobTypeID = 6;
        }
      }
      else if (initialMusterChitJobType == 8) {
        if ((noam / 2) > amount) {
          jobTypeID = 5;
        }
        else {
          jobTypeID = 8;
        }
      }
    }
    else {
      if (initialMusterChitJobType == 3) {
        if ((noam / 2) > amount) {
          jobTypeID = 5;
        }
        else {
          jobTypeID = 3;
        }
      }
      else if (initialMusterChitJobType == 6) {
        if ((noam / 2) > amount) {
          jobTypeID = 7;
        }
        else {
          jobTypeID = 6;
        }
      }
      else {
        jobTypeID = initialJobType
      }
    }
    return [jobTypeID]
  }

  return (
    <div>
      <Dialog
        fullWidth={true}
        maxWidth="lg"
        open={dialogbox}
        onBackdropClick="false"
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          <Typography
            color="textSecondary"
            gutterBottom
            variant="h3"
          >
            <Box textAlign="left" >
              Update Plucking Attendance
            </Box>
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Container>
              <Formik
                initialValues={{
                  groupID: FormDetails.groupID,
                  estateID: FormDetails.estateID,
                  divisionID: FormDetails.divisionID,
                  attendanceDate: FormDetails.attendanceDate,
                  jobTypeID: changedJobTypeID,
                  employeeTypeID: FormDetails.employeeTypeID,
                  employeeNumber: FormDetails.employeeNumber,
                  workTypeID: FormDetails.workTypeID,
                  fieldID: FormDetails.fieldID,
                  gangID: FormDetails.gangID,
                  norm: FormDetails.noam,
                  sessionID: FormDetails.sessionID,
                  amount: FormDetails.amount,
                  days: FormDetails.days,
                  collectedDate: FormDetails.collectedDate,
                  isHoliday: FormDetails.isHoliday,
                  mainDivisionID: FormDetails.mainDivisionID,
                  musterChitID: FormDetails.musterChitID,
                  employeeName: FormDetails.employeeName,
                  lentEstateID: FormDetails.lentEstateID
                }}
                validationSchema={
                  Yup.object().shape({
                    groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                    estateID: Yup.number().min(1, "Please Select a Estate").required('Estate is required'),
                    divisionID: Yup.number().when('lentEstateID', {
                      is: (lentEstateID) => lentEstateID > 0,
                      then: Yup.number().min(1, "Please Select a Division").required('Division is required'),
                      otherwise: Yup.number().nullable(),
                    }),
                    mainDivisionID: Yup.number().min(1, "Please Select a Division").required('Division is required'),
                    musterChitID: Yup.number().min(1, "Please Select a Muster Chit").required('Muster Chit is required'),
                    jobTypeID: Yup.number().min(1, "Please Select a Job Type").required('Job Type is required'),
                    employeeTypeID: Yup.number().min(1, "Please Select a Employee Type").required('Employee Type is required'),
                    employeeNumber: Yup.string().required('Employee Number is required').typeError('Employee Number is required'),
                    workTypeID: Yup.number().min(1, "Please Select a labour Type").required('Labour Type is required'),
                    days: Yup.number(),
                    attendanceDate: Yup.string(),
                    fieldID: Yup.number().when('lentstateID', {
                      is: (lentstateID) => lentstateID > 0,
                      then: Yup.number().required('Field is required').min(1, 'Field is required').typeError('Field is required'),
                      otherwise: Yup.number().nullable(),
                    }),
                    amount: Yup.number()
                      .integer('Please enter a valid integer amount')
                      .moreThan(0, 'Amount must be greater than zero')
                      .required('Amount is required'),
                    collectedDate: Yup.date().required('Collected date is required').typeError('Invalid date'),
                  })
                }
                onSubmit={(values) => savePluckingAttendance(values)}
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
                                onChange={(e) => {
                                  handleChange(e)
                                }}
                                value={FormDetails.groupID}
                                variant="outlined"
                                size='small'
                                id="groupID"
                                InputProps={{
                                  readOnly: true
                                }}
                              >
                                <MenuItem value={'0'}>--Select Group--</MenuItem>
                                {generateDropDownMenu(groups)}
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
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
                                value={FormDetails.estateID}
                                variant="outlined"
                                id="estateID"
                                InputProps={{
                                  readOnly: true
                                }}
                              >
                                <MenuItem value={0}>--Select Estate--</MenuItem>
                                {generateDropDownMenu(factories)}
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="mainDivisionID">
                                Division *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.mainDivisionID && errors.mainDivisionID)}
                                fullWidth
                                helperText={touched.mainDivisionID && errors.mainDivisionID}
                                name="mainDivisionID"
                                onBlur={handleBlur}
                                size='small'
                                onChange={(e) => {
                                  handleChange(e)
                                }}
                                value={FormDetails.mainDivisionID}
                                variant="outlined"
                                id="mainDivisionID"
                                inputProps={{
                                  readOnly: true
                                }}
                              >
                                <MenuItem value={0}>--Select Division--</MenuItem>
                                {generateDropDownMenu(divisions)}
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="collectedDate">
                                Collected Date *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.collectedDate && errors.collectedDate)}
                                helperText={touched.collectedDate && errors.collectedDate}
                                fullWidth
                                size='small'
                                name="collectedDate"
                                type="date"
                                onChange={(e) => handleChange(e)}
                                value={FormDetails.collectedDate}
                                variant="outlined"
                                id="collectedDate"
                                disabled={true}
                                inputProps={{
                                  max: new Date().toISOString().split('T')[0],
                                  readOnly: true
                                }}
                              />
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="musterChitID">
                                Muster Chit *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.musterChitID && errors.musterChitID)}
                                fullWidth
                                helperText={touched.musterChitID && errors.musterChitID}
                                name="musterChitID"
                                onBlur={handleBlur}
                                size='small'
                                onChange={(e) => {
                                  handleChange(e)
                                }}
                                value={FormDetails.musterChitID}
                                variant="outlined"
                                id="musterChitID"
                                inputProps={
                                  { readOnly: true }
                                }
                              >
                                <MenuItem value={0}>--Select Muster Chit--</MenuItem>
                                {generateDropDownMenu(musterChitList)}
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="employeeNumber">
                                Employee No*
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.employeeNumber && errors.employeeNumber)}
                                fullWidth
                                helperText={touched.employeeNumber && errors.employeeNumber}
                                name="employeeNumber"
                                placeholder='--Select Employee No'
                                onBlur={handleBlur}
                                size='small'
                                InputProps={{
                                  readOnly: true
                                }}
                                value={FormDetails.employeeNumber}
                                variant="outlined"
                                id="employeeNumber"
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="employeeName">
                                Emp Name *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.employeeName && errors.employeeName)}
                                fullWidth
                                helperText={touched.employeeName && errors.employeeName}
                                name="employeeName"
                                onBlur={handleBlur}
                                size='small'
                                placeholder='--Employee Name--'
                                onChange={(e) => handleChange(e)}
                                value={FormDetails.employeeName}
                                variant="outlined"
                                id="employeeName"
                                type="text"
                                inputProps={{
                                  readOnly: true
                                }}
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="employeeTypeID">
                                Employee Type
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.employeeTypeID && errors.employeeTypeID)}
                                fullWidth
                                helperText={touched.employeeTypeID && errors.employeeTypeID}
                                name="employeeTypeID"
                                onBlur={handleBlur}
                                size='small'
                                inputProps={
                                  { readOnly: true, }
                                }
                                onChange={(e) => {
                                  handleChange(e)
                                }}
                                InputProps={{
                                  readOnly: true
                                }}
                                value={FormDetails.employeeTypeID}
                                variant="outlined"
                                id="employeeTypeID"
                              >
                                <MenuItem value={'0'} >--Select Employee Type</MenuItem>
                                {generateDropDownMenu(employeeTypes)}
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="workTypeID">
                                Labour Type *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.workTypeID && errors.workTypeID)}
                                fullWidth
                                helperText={touched.workTypeID && errors.workTypeID}
                                name="workTypeID"
                                onBlur={handleBlur}
                                size='small' value={FormDetails.workTypeID}
                                onChange={(e) => { handleChange(e) }}
                                variant="outlined"
                                id="workTypeID"
                                InputProps={{ readOnly: true }}
                              >
                                <MenuItem value={'0'} >--Select Labour Type--</MenuItem>
                                <MenuItem value={'1'} >Division Labour</MenuItem>
                                <MenuItem value={'2'} >Lent Labour</MenuItem>
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="lentEstateID">
                                Lent Estate *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.lentEstateID && errors.lentEstateID)}
                                fullWidth
                                helperText={touched.lentEstateID && errors.lentEstateID}
                                name="lentEstateID"
                                size='small'
                                onBlur={handleBlur}
                                onChange={(e) => {
                                  handleChange(e);
                                }}
                                value={FormDetails.lentEstateID}
                                variant="outlined"
                                id="lentEstateID"
                                inputProps={{
                                  readOnly: true
                                }}
                              >
                                <MenuItem value={0}>--Select Division--</MenuItem>
                                {generateDropDownMenu(lentEstateName)}
                              </TextField>
                            </Grid>
                          </Grid>
                          <Grid container spacing={3}>
                            <Grid item md={3} xs={12}>
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
                                value={FormDetails.divisionID}
                                variant="outlined"
                                id="divisionID"
                                InputProps={{
                                  readOnly: true
                                }}
                              >
                                <MenuItem value={0}>--Select Division--</MenuItem>
                                {generateDropDownMenu(divisions)}
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="fieldID">
                                Field *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.fieldID && errors.fieldID)}
                                fullWidth
                                helperText={touched.fieldID && errors.fieldID}
                                name="fieldID"
                                onBlur={handleBlur}
                                size='small'
                                onChange={(e) => {
                                  handleChange(e)
                                }}
                                value={FormDetails.fieldID}
                                variant="outlined"
                                id="fieldID"
                                InputProps={{
                                  readOnly: true
                                }}
                              >
                                <MenuItem value={'0'}>--Select Field--</MenuItem>
                                {generateDropDownMenu(fieldsForDropdown)}
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="jobTypeID">
                                Job Type *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.jobTypeID && errors.jobTypeID)}
                                fullWidth
                                helperText={touched.jobTypeID && errors.jobTypeID}
                                name="jobTypeID"
                                onBlur={handleBlur}
                                size='small'
                                onChange={(e) => {
                                  handleChange(e)
                                }}
                                value={changedJobTypeID}
                                variant="outlined"
                                id="jobTypeID"
                                InputProps={{ readOnly: true }}
                              >
                                <MenuItem value={'0'} >--Select Job Type--</MenuItem>
                                {generateDropDownMenu(JobTypes)}
                              </TextField>
                            </Grid>
                          </Grid>
                          <br />
                          <br />
                          <Card>
                            <CardContent>
                              <Grid container spacing={3}>
                                <Grid item md={3} xs={12}>
                                  <InputLabel shrink id="sessionID">
                                    Session
                                  </InputLabel>
                                  <TextField select
                                    error={Boolean(touched.sessionID && errors.sessionID)}
                                    fullWidth
                                    helperText={touched.sessionID && errors.sessionID}
                                    name="sessionID"
                                    onBlur={handleBlur}
                                    size='small'
                                    onChange={(e) => {
                                      handleChange(e)
                                    }}
                                    value={'4'}
                                    variant="outlined"
                                    id="sessionID"
                                    InputProps={{
                                      readOnly: true
                                    }}
                                  >
                                    <MenuItem value={'0'} >--Select Session--</MenuItem>
                                    <MenuItem value={'1'} >Morning Session</MenuItem>
                                    <MenuItem value={'2'} >Noon Session</MenuItem>
                                    <MenuItem value={'3'} >Evening Session</MenuItem>
                                    <MenuItem value={'4'} >All Sessions</MenuItem>
                                  </TextField>
                                </Grid>
                                <Grid item md={3} xs={12}>
                                  <InputLabel shrink id="gangID">
                                    Gang
                                  </InputLabel>
                                  <TextField select
                                    error={Boolean(touched.gangID && errors.gangID)}
                                    fullWidth
                                    helperText={touched.gangID && errors.gangID}
                                    name="gangID"
                                    onBlur={handleBlur}
                                    size='small'
                                    onChange={(e) => {
                                      handleChange(e)
                                    }}
                                    value={FormDetails.gangID}
                                    variant="outlined"
                                    id="gangID"
                                    InputProps={{
                                      readOnly: true
                                    }}
                                  >
                                    <MenuItem value={'0'}>--Select Gang--</MenuItem>
                                    {generateDropDownMenu(gangs)}
                                  </TextField>
                                </Grid>
                                <Grid item md={3} xs={12}>
                                  <InputLabel shrink id="amount">
                                    Amount(Kg) *
                                  </InputLabel>
                                  <TextField
                                    error={Boolean(touched.amount && errors.amount)}
                                    fullWidth
                                    helperText={touched.amount && errors.amount}
                                    name="amount"
                                    onBlur={handleBlur}
                                    size='small'
                                    onChange={(e) => {
                                      handleChangeOne(e)
                                    }}
                                    value={amount}
                                    variant="outlined"
                                    id="amount"
                                  >
                                  </TextField>
                                </Grid>
                                <Grid item md={3} xs={12}>
                                  <InputLabel shrink id="operatorID">
                                    Operator
                                  </InputLabel>
                                  <TextField select
                                    error={Boolean(touched.operatorID && errors.operatorID)}
                                    fullWidth
                                    helperText={touched.operatorID && errors.operatorID}
                                    name="operatorID"
                                    onBlur={handleBlur}
                                    value={FormDetails.operatorID}
                                    variant="outlined"
                                    size='small'
                                    id="operatorID"
                                    onChange={(e) => handleChangeOne(e)}
                                  >
                                    <MenuItem value={'0'}>--Select Operator--</MenuItem>
                                    {generateDropDownMenu(operators)}
                                  </TextField>
                                </Grid>
                                <Grid item md={3} xs={12}>
                                  <FormControlLabel
                                    style={{ marginTop: '25px' }}
                                    control={
                                      <Switch
                                        checked={FormDetails.isHoliday}
                                        onChange={(e) => handleChange(e)}
                                        name="isHoliday"
                                        disabled={true}
                                      />
                                    }
                                    label="Is Holiday"
                                  />
                                </Grid>
                              </Grid>
                              {changedJobTypeID != 5 && changedJobTypeID != 7 ? (
                                <Grid container spacing={3}>
                                  <Grid item md={3} xs={12}>
                                    <InputLabel shrink id="norm">
                                      Norm(Kg)
                                    </InputLabel>
                                    <TextField
                                      error={Boolean(touched.noam && errors.norm)}
                                      fullWidth
                                      helperText={touched.noam && errors.norm}
                                      name="norm"
                                      onBlur={handleBlur}
                                      size='small'
                                      onChange={(e) => {
                                        handleChange(e)
                                      }}
                                      value={FormDetails.noam}
                                      variant="outlined"
                                      id="norm"
                                      InputProps={{
                                        readOnly: true
                                      }}
                                    >
                                    </TextField>
                                  </Grid>
                                </Grid>
                              ) :
                                null}
                            </CardContent>
                          </Card>
                          <br />
                          {(changedJobTypeID != '5' && changedJobTypeID != 7) && (changedJobTypeID != '7' && changedJobTypeID != 7) ?
                            <CardContent>
                              <Grid container spacing={4}>
                                <>
                                  <Grid item md={3} xs={12}>
                                    <InputLabel shrink id="gangID">
                                      Full/Half/Cash *
                                    </InputLabel>
                                    <TextField select
                                      error={Boolean(touched.days && errors.days)}
                                      fullWidth
                                      helperText={touched.days && errors.days}
                                      name="days"
                                      onBlur={handleBlur}
                                      onChange={(e) => handleChangeOne(e)}
                                      size='small'
                                      value={dayType}
                                      variant="outlined"
                                      disabled={true}
                                      InputProps={{
                                        readOnly: true
                                      }}
                                    >
                                      <MenuItem value='0'>--Select Full/Half/Cash--</MenuItem>
                                      <MenuItem value="1">Full Day</MenuItem>
                                      <MenuItem value="2">Half Day</MenuItem>
                                      <MenuItem value="3">Cash</MenuItem>
                                    </TextField>
                                  </Grid>
                                  <Grid item md={3} xs={12}>
                                    <Typography variant="h5" style={{ marginTop: '35px' }} color="text.secondary" gutterBottom>
                                      Full Day :{manDays}
                                    </Typography>
                                  </Grid>
                                  <Grid item md={3} xs={12}>
                                    <Typography variant="h5" style={{ marginTop: '35px' }} color="text.secondary" gutterBottom>
                                      Over Kilo : {dayOT.toFixed(2)}
                                    </Typography>
                                  </Grid>
                                </>
                              </Grid>
                            </CardContent> : null}
                        </CardContent>
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            type="button"
                            variant="outlined"
                            onClick={() => { closeDialogbox(); handleClose(); }}
                          >
                            Close
                          </Button>
                          &nbsp;
                          &nbsp;
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Update
                          </Button>
                        </Box>
                      </PerfectScrollbar>
                    </Box>
                  </form>
                )}
              </Formik>
            </Container>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
}

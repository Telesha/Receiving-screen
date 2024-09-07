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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from 'yup';
import { LoadingComponent } from 'src/utils/newLoader';
import { Form, Formik, validateYupSchema } from 'formik';
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from 'react-alert';
import tokenDecoder from '../../../utils/tokenDecoder';
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

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
    backgroundColor: 'red',
  },
  colorRecordAndNew: {
    backgroundColor: '#FFBE00'
  },
  colorRecord: {
    backgroundColor: 'green',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
}));

const screenCode = 'FACTORYENTERING';

export default function FactoryEnteringAddEdit(props) {
  const [title, setTitle] = useState("Add Bought Leaf Receiving")
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [employees, setEmployees] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState();
  const [isUpdate, setIsUpdate] = useState(false);
  const [factoryEnteringInput, setFactoryEnteringInput] = useState({
    groupID: '0',
    factoryID: '0',
    routeID: '0',
    date: null,
    officerID: 0,
    helperID: 0,
    driverID: 0,
    vehicleNumber: 0,
    leafTransporterID: '',
    time: (new Date(Date.now()).getHours() + ':' + new Date(Date.now()).getMinutes()).toString(),
    rainfallInmm: '',
    courceLeaf: '',
    boiledLeaf: '',
    leafCondition: '',
    fieldGrossWeight: '',
    factoryGrossWeight: '',
    lossOrExcess: '',
    fieldBag: '',
    factoryBag: '',
    comment: '',
    factoryWater: '',
    fieldWater: '',
    fieldCouseLeaf: '',
    factoryCouseLeaf: '',
    fieldNetWeight: '',
    factoryNetWeight: '',
    isTemporyHelper: false,
    isTemporyDriver: false,
    isTemporyVehicleNo: false,
    temporyHelper: '',
    temporyDriver: '',
    temporyVehicleNo: '',
    isActive: true
  })
  const [selectedFactoryDate, handleFactoryDateChange] = useState();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const { greenLeafReceivingID } = useParams();
  let decrypted = 0;
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/factoryEntering/listing')
  };

  const [isDisableButton, setIsDisableButton] = useState(false);
  const alert = useAlert();
  const componentRef = useRef();
  const [MinMonth, setMinMonth] = useState(new Date());

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown())

  }, []);
  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [factoryEnteringInput.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID()
    );
    trackPromise(
      getEmployeesForDropdown()
    );
    trackPromise(
      getVehiclesForDropdown()
    )
  }, [factoryEnteringInput.factoryID]);

  useEffect(() => {
    decrypted = atob(greenLeafReceivingID.toString());
    if (decrypted != 0) {
      trackPromise(
        getGreenLeafDetails(decrypted),
      )
    }

  }, []);

  useEffect(() => {
    trackPromise(getRoutesByFactoryID(), getIsBalancePaymetStatusChek());
  }, [factoryEnteringInput.factoryID]);


  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITFACTORYENTERING');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setFactoryEnteringInput({
      ...factoryEnteringInput,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }
  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(factoryEnteringInput.groupID);
    setFactories(factory);
  }

  async function getRoutesByFactoryID() {
    const route = await services.getRoutesForDropDown(factoryEnteringInput.factoryID);
    setRoutes(route);
  }

  async function getEmployeesForDropdown() {
    const employees = await services.getEmployeesForDropdown(factoryEnteringInput.groupID, factoryEnteringInput.factoryID);
    setEmployees(employees);
  }

  async function getVehiclesForDropdown() {
    const vehicles = await services.GetVehicleList(factoryEnteringInput.groupID, factoryEnteringInput.factoryID);
    setVehicles(vehicles);
  }

  async function getGreenLeafDetails(greenLeafReceivingID) {
    let response = await services.GetGreenLeafReceivingDetailsByID(greenLeafReceivingID);
    let data = {
      greenLeafReceivingID: response.greenLeafReceivingID,
      groupID: response.groupID,
      factoryID: response.factoryID,
      routeID: response.routeID,
      date: response.leafReceivedDate.split('T')[0],
      time: response.factoryInTime,
      officerID: response.officerID,
      helperID: response.helperID,
      temporyHelper: response.temporyHelper,
      driverID: response.driverID,
      temporyDriver: response.temporyDriver,
      vehicleNumber: response.vehicleNumber,
      temporyVehicleNo: response.temporyVehicleNumber,
      leafTransporterID: response.leafTransporterID,
      rainfallInmm: response.rainfallIn,
      courceLeaf: response.courseLeafAmount,
      leafCondition: response.leafCondition,
      boiledLeaf: response.boiledLeaf,
      fieldGrossWeight: response.fieldGrossWeight,
      fieldBag: response.fieldBagAmount,
      fieldWater: response.fieldWater,
      fieldCouseLeaf: response.fieldCouseLeaf,
      fieldNetWeight: response.fieldNetWeight,
      factoryGrossWeight: response.factoryGrossWeight,
      factoryBag: response.factoryBagAmount,
      factoryWater: response.factoryWaterAmount,
      factoryCouseLeaf: response.factoryCouseLeaf,
      factoryNetWeight: response.factoryNetWeight,
      comment: response.comment,
      lossOrExcess: response.lossOrExcess,
      isTemporyHelper: response.isTemporyHelper,
      isTemporyDriver: response.isTemporyDriver,
      isTemporyVehicleNo: response.isTemporyVehicleNumber,

    };

    setTitle("Edit Bought Leaf Receiving");
    setFactoryEnteringInput(data);
    setIsUpdate(true);
  }

  async function saveGreenLeaf() {


    let model = {
      greenLeafReceivingID: atob(greenLeafReceivingID.toString()),
      groupID: parseInt(factoryEnteringInput.groupID),
      factoryID: parseInt(factoryEnteringInput.factoryID),
      routeID: parseInt(factoryEnteringInput.routeID),
      date: factoryEnteringInput.date,
      factoryInTime: factoryEnteringInput.time,
      officerID: factoryEnteringInput.officerID,
      helperID: factoryEnteringInput.helperID,
      driverID: factoryEnteringInput.driverID,
      vehicleNumber: factoryEnteringInput.vehicleNumber,
      temporyHelper: factoryEnteringInput.temporyHelper,
      temporyDriver: factoryEnteringInput.temporyDriver,
      temporyVehicleNo: factoryEnteringInput.temporyVehicleNo,
      leafTransporterID: factoryEnteringInput.leafTransporterID,
      rainfallIn: parseFloat(factoryEnteringInput.rainfallInmm),
      courseLeafAmount: parseFloat(factoryEnteringInput.courceLeaf),
      leafCondition: factoryEnteringInput.leafCondition,
      boiledLeaf: parseFloat(factoryEnteringInput.boiledLeaf),
      fieldGrossWeight: parseFloat(factoryEnteringInput.fieldGrossWeight),
      fieldBagAmount: parseFloat(factoryEnteringInput.fieldBag),
      fieldWater: parseFloat(factoryEnteringInput.fieldWater),
      fieldCouseLeaf: parseFloat(factoryEnteringInput.fieldCouseLeaf),
      fieldNetWeight: parseFloat(factoryEnteringInput.fieldNetWeight),
      factoryGrossWeight: parseFloat(factoryEnteringInput.factoryGrossWeight),
      factoryBagAmount: parseFloat(factoryEnteringInput.factoryBag),
      factoryWaterAmount: parseFloat(factoryEnteringInput.factoryWater),
      factoryCouseLeaf: parseFloat(factoryEnteringInput.factoryCouseLeaf),
      factoryNetWeight: parseFloat(factoryEnteringInput.factoryNetWeight),
      isActive: true,
      createdBy: tokenDecoder.getUserIDFromToken(),
      createdDate: new Date().toISOString(),
      comment: factoryEnteringInput.comment,
      lossOrExcess: parseFloat(factoryEnteringInput.lossOrExcess),
      isTemporyHelper: factoryEnteringInput.isTemporyHelper,
      isTemporyDriver: factoryEnteringInput.isTemporyDriver,
      isTemporyVehicleNo: factoryEnteringInput.isTemporyVehicleNo,
    }
    if (isUpdate == true) {

      let response = await services.UpdateGreenLeafReceiving(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/factoryEntering/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveGreenLeafReceiving(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/factoryEntering/listing');
      }
      else {
        alert.error(response.message);
      }
    }

  }
  async function getIsBalancePaymetStatusChek() {
    const result = await services.getCurrentBalancePaymnetDetail(factoryEnteringInput.groupID, factoryEnteringInput.factoryID);
    checkIsMonthValid(result);
  }

  async function checkIsMonthValid(result) {
    var convertedDate = new Date();
    let tempMonth;
    if (result.lastBalancePaymentSchedule !== null) {
      tempMonth = result.lastBalancePaymentSchedule.split('/');
      convertedDate.setMonth(tempMonth[1]);

      setMinMonth(moment(new Date(convertedDate.getFullYear(), convertedDate.getMonth(), 1)));
    }
    else if (result.firstTransactionDate !== null) {
      tempMonth = result.firstTransactionDate.split('/');
      convertedDate.setMonth(--tempMonth[1]);
      setMinMonth(moment(new Date(convertedDate.getFullYear(), convertedDate.getMonth(), 1)));
    }
    else {
      setMinMonth(moment(new Date(convertedDate.getFullYear(), convertedDate.getMonth(), 1)));
    }
  }



  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setFactoryEnteringInput({
      ...factoryEnteringInput,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setFactoryEnteringInput({
      ...factoryEnteringInput,
      date: value
    });
  }

  function HelperEnabledHandleChange(e) {

    const target = e.target;
    const value = target.name === 'isTemporyHelper' ? target.checked : target.value

    setFactoryEnteringInput({
      ...factoryEnteringInput,
      helperID: 0,
      [e.target.name]: value
    });
  };

  function DriverEnabledHandleChange() {
    setFactoryEnteringInput({
      ...factoryEnteringInput,
      driverID: 0,
      isTemporyDriver: !factoryEnteringInput.isTemporyDriver
    });
  };

  function VehicleNoEnabledHandleChange() {
    setFactoryEnteringInput({
      ...factoryEnteringInput,
      vehicleNumber: 0,
      isTemporyVehicleNo: !factoryEnteringInput.isTemporyVehicleNo
    });
  };

  function clearData() {
    setFactoryEnteringInput({
      ...factoryEnteringInput,
      routeID: '0', date: null, officerID: '0', helperID: '', driverID: '', vehicleNumber: '', leafTransporterID: '',
      time: (new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()).toString(),
      rainfallInmm: '', courceLeaf: '', boiledLeaf: '', leafCondition: '', fieldGrossWeight: '', factoryGrossWeight: '',
      lossOrExcess: '', fieldBag: '', factoryBag: '', comment: '', factoryWater: '', fieldWater: '', fieldCouseLeaf: '',
      factoryCouseLeaf: '', fieldNetWeight: '', factoryNetWeight: '', temporyDriver: '', temporyHelper: '', temporyVehicleNo: '',
      isTemporyDriver: false, isTemporyHelper: false, isTemporyVehicleNo: false
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: factoryEnteringInput.groupID,
              factoryID: factoryEnteringInput.factoryID,
              routeID: factoryEnteringInput.routeID,
              time: factoryEnteringInput.time,
              date: factoryEnteringInput.date,
              officerID: factoryEnteringInput.officerID,
              helperID: factoryEnteringInput.helperID,
              driverID: factoryEnteringInput.driverID,
              vehicleNumber: factoryEnteringInput.vehicleNumber,
              leafTransporterID: factoryEnteringInput.leafTransporterID,
              rainfallInmm: factoryEnteringInput.rainfallInmm,
              courceLeaf: factoryEnteringInput.courceLeaf,
              boiledLeaf: factoryEnteringInput.boiledLeaf,
              leafCondition: factoryEnteringInput.leafCondition,
              fieldGrossWeight: factoryEnteringInput.fieldGrossWeight,
              factoryGrossWeight: factoryEnteringInput.factoryGrossWeight,
              lossOrExcess: factoryEnteringInput.lossOrExcess,
              fieldBag: factoryEnteringInput.fieldBag,
              factoryBag: factoryEnteringInput.factoryBag,
              comment: factoryEnteringInput.comment,
              factoryWater: factoryEnteringInput.factoryWater,
              fieldWater: factoryEnteringInput.fieldWater,
              fieldCouseLeaf: factoryEnteringInput.fieldCouseLeaf,
              factoryCouseLeaf: factoryEnteringInput.factoryCouseLeaf,
              fieldNetWeight: factoryEnteringInput.fieldNetWeight,
              factoryNetWeight: factoryEnteringInput.factoryNetWeight,
              temporyHelper: factoryEnteringInput.temporyHelper,
              temporyDriver: factoryEnteringInput.temporyDriver,
              temporyVehicleNo: factoryEnteringInput.temporyVehicleNo,
              isTemporyHelper: factoryEnteringInput.isTemporyHelper,
              isTemporyDriver: factoryEnteringInput.isTemporyDriver,
              isTemporyVehicleNo: factoryEnteringInput.isTemporyVehicleNo
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                routeID: Yup.number().required('Route is required').min("1", 'Route is required'),
                date: Yup.date().required('Date is required').typeError('Invalid date'),
                driverID: Yup.number().when('isTemporyDriver', {
                  is: false,
                  then: Yup.number().required('Driver is required').min("1", 'Driver is required'),
                }
                ),
                temporyDriver: Yup.string().when('isTemporyDriver', {
                  is: true,
                  then: Yup.string().required('Tempory Driver is required').min("1", 'Tempory Driver is required'),
                }
                ),
                vehicleNumber: Yup.number().when('isTemporyVehicleNo', {
                  is: false,
                  then: Yup.number().required('Vehicle Number is required').min("1", 'Vehicle Number is required'),
                }
                ),
                temporyVehicleNo: Yup.string().when('isTemporyVehicleNo', {
                  is: true,
                  then: Yup.string().required('Tempory Vehicle Number is required').min("1", 'Tempory Vehicle Number is required'),
                }
                ),
                courceLeaf: Yup.number()
                  .required('Cource Leaf required')
                  .max(100, 'Enter a percentage of at most 100%'),
                boiledLeaf: Yup.number()
                  .required('Boiled Leaf required')
                  .max(100, 'Enter a percentage of at most 100%'),
                fieldGrossWeight: Yup.string()
                  .required('Field Gross Weight required')
                  .min("1", 'Field Gross Weight required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),

                factoryGrossWeight: Yup.string()
                  .required('Factory Gross Weight required')
                  .min("1", 'Factory Gross Weight required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),
                fieldNetWeight: Yup.string()
                  .required('Field Net Weight ')
                  .min("1", 'Field Net Weight required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),
                factoryNetWeight: Yup.string()
                  .required('Factory Net Weight')
                  .min("1", 'Factory Net Weight required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),
                lossOrExcess: Yup.string()
                  .required('Loss Or Excess required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),
                fieldBag: Yup.string()
                  .required('Field Bag required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),
                factoryBag: Yup.string()
                  .required('Factory Bag required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),
                factoryWater: Yup.string()
                  .required('Factory Water required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),
                fieldWater: Yup.string()
                  .required('Field Water required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),
                fieldCouseLeaf: Yup.string()
                  .required('Field Couse Leaf required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),
                factoryCouseLeaf: Yup.string()
                  .required('Factory Couse Leaf required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),
                fieldNetWeight: Yup.string()
                  .required('Field Net Weight required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),
                factoryNetWeight: Yup.string()
                  .required('Factory Net Weight required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Allow only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.'),
                leafCondition: Yup.string()
                  .required('Leaf Condition required'),
                officerID: Yup.number()
                  .required('Officer required')
                  .min("1", 'Officer  is required'),


              })
            }
            onSubmit={(event) => trackPromise(saveGreenLeaf(event))}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              isSubmitting,
              values
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
                          <Grid item md={3} xs={8}>
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
                              value={factoryEnteringInput.groupID}
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

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              size='small'
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={factoryEnteringInput.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="routeID">
                              Route *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.routeID && errors.routeID)}
                              fullWidth
                              helperText={touched.routeID && errors.routeID}
                              size='small'
                              name="routeID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={factoryEnteringInput.routeID}
                              variant="outlined"
                              id="routeID"


                            >
                              <MenuItem value="0">--Select Routes--</MenuItem>
                              {generateDropDownMenu(routes)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="date">
                              Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.date && errors.date)}
                                helperText={touched.date && errors.date}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="date"
                                name="date"
                                value={factoryEnteringInput.date}
                                onChange={(e) => handleDateChange(e)}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Card style={{ padding: 30, marginTop: 20, backgroundColor: "#f5f5f5" }}>
                          <CardHeader style={{ marginLeft: '-1rem', marginTop: '-1rem', marginBottom: '2rem' }} titleTypographyProps={{ variant: 'h6' }}
                            title="General Information"
                          />
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="time">
                                Factory In Time *
                              </InputLabel>

                              <TextField
                                id="time"
                                type="time"
                                name="time"
                                size='small'
                                className={classes.textField}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{
                                  step: 300, // 5 min
                                }}
                                onChange={(e) => handleChange(e)}
                                value={factoryEnteringInput.time}
                              />

                            </Grid>
                          </Grid>
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12} ></Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="isTemporyHelper">
                                Is Tempory
                              </InputLabel>
                              <Switch
                                checked={values.isTemporyHelper}
                                onChange={(e) => HelperEnabledHandleChange(e)}
                                size='small'
                                name="isTemporyHelper"
                                value={factoryEnteringInput.isTemporyHelper}
                              />
                            </Grid>
                            <Grid item md={4} xs={12} >
                              <InputLabel shrink id="isTemporyDriver">
                                Is Tempory
                              </InputLabel>
                              <Switch
                                checked={values.isTemporyDriver}
                                size='small'
                                onChange={DriverEnabledHandleChange}
                                name="isTemporyDriver"
                                value={factoryEnteringInput.isTemporyDriver}
                              />
                            </Grid>

                          </Grid>

                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12} >
                              <InputLabel shrink id="officerID">
                                Officer *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.officerID && errors.officerID)}
                                fullWidth
                                helperText={touched.officerID && errors.officerID}
                                size='small'
                                name="officerID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={factoryEnteringInput.officerID}
                                variant="outlined"
                                id="officerID"

                              >
                                <MenuItem value="0">--Select Officer--</MenuItem>
                                {generateDropDownMenu(employees)}
                              </TextField>
                            </Grid>

                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="helperID">

                                Helper
                              </InputLabel>
                              {factoryEnteringInput.isTemporyHelper === false ?
                                <TextField select
                                  fullWidth
                                  size='small'
                                  name="helperID"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={factoryEnteringInput.helperID}
                                  variant="outlined"
                                  id="helperID"

                                >
                                  <MenuItem value="0">--Select Helper--</MenuItem>
                                  {generateDropDownMenu(employees)}
                                </TextField> : <TextField
                                  fullWidth
                                  size='small'
                                  name="temporyHelper"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={factoryEnteringInput.temporyHelper}
                                  variant="outlined"
                                  id="temporyHelper"
                                >
                                </TextField>}
                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="driverID">

                                Driver *
                              </InputLabel>
                              {factoryEnteringInput.isTemporyDriver === false ?
                                <TextField select
                                  error={Boolean(touched.driverID && errors.driverID)}
                                  fullWidth
                                  helperText={touched.driverID && errors.driverID}
                                  size='small'
                                  name="driverID"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={factoryEnteringInput.driverID}
                                  variant="outlined"
                                  id="driverID"

                                >
                                  <MenuItem value="0">--Select Driver--</MenuItem>
                                  {generateDropDownMenu(employees)}
                                </TextField> : <TextField
                                  fullWidth
                                  error={Boolean(touched.temporyDriver && errors.temporyDriver)}
                                  helperText={touched.temporyDriver && errors.temporyDriver}
                                  size='small'
                                  name="temporyDriver"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={factoryEnteringInput.temporyDriver}
                                  variant="outlined"
                                  id="temporyDriver"
                                >
                                </TextField>}

                            </Grid>

                          </Grid>
                          <Grid container spacing={3} >
                            <Grid item md={4} xs={12} >
                              <InputLabel shrink id="isTemporyVehicleNo">
                                Is Tempory
                              </InputLabel>
                              <Switch
                                checked={values.isTemporyVehicleNo}
                                size='small'
                                onChange={VehicleNoEnabledHandleChange}
                                name="isTemporyVehicleNo"
                                value={factoryEnteringInput.isTemporyVehicleNo}
                              />
                            </Grid>

                          </Grid>

                          <Grid container spacing={3} >
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="vehicleNumber">

                                Vehicle Number *
                              </InputLabel>
                              {factoryEnteringInput.isTemporyVehicleNo === false ?
                                <TextField select
                                  error={Boolean(touched.vehicleNumber && errors.vehicleNumber)}
                                  fullWidth
                                  helperText={touched.vehicleNumber && errors.vehicleNumber}
                                  size='small'
                                  name="vehicleNumber"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={factoryEnteringInput.vehicleNumber}
                                  variant="outlined"
                                  id="vehicleNumber"

                                >
                                  <MenuItem value="0">--Select Vehicle Number--</MenuItem>
                                  {generateDropDownMenu(vehicles)}
                                </TextField> : <TextField
                                  fullWidth
                                  error={Boolean(touched.temporyVehicleNo && errors.temporyVehicleNo)}
                                  helperText={touched.temporyVehicleNo && errors.temporyVehicleNo}
                                  size='small'
                                  name="temporyVehicleNo"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={factoryEnteringInput.temporyVehicleNo}
                                  variant="outlined"
                                  id="temporyVehicleNo"
                                >
                                </TextField>}

                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="leafTransporterID">
                                Leaf Trasporter
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="leafTransporterID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={factoryEnteringInput.leafTransporterID}
                                variant="outlined"
                                id="leafTransporterID"
                              >
                              </TextField>
                            </Grid>

                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="rainfallInmm">
                                Rainfall In mm
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="rainfallInmm"
                                type='number'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={factoryEnteringInput.rainfallInmm}
                                variant="outlined"
                                id="rainfallInmm"
                              >
                              </TextField>
                            </Grid>
                          </Grid>



                        </Card>
                        <Card style={{ padding: 20, marginTop: 20, backgroundColor: "#f5f5f5" }}>
                          <CardHeader style={{ marginLeft: '-1rem', marginTop: '-1rem', marginBottom: '2rem' }} titleTypographyProps={{ variant: 'h6' }}
                            title="Crop Information"
                          />
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="courceLeaf">
                                Cource Leaf (%) *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.courceLeaf && errors.courceLeaf)}
                                helperText={touched.courceLeaf && errors.courceLeaf}
                                size='small'
                                fullWidth
                                name="courceLeaf"
                                type='number'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={factoryEnteringInput.courceLeaf}
                                variant="outlined"
                                id="courceLeaf"
                              >
                              </TextField>
                            </Grid>



                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="boiledLeaf">
                                Boiled Leaf (%) *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.boiledLeaf && errors.boiledLeaf)}
                                helperText={touched.boiledLeaf && errors.boiledLeaf}
                                size='small'
                                fullWidth
                                name="boiledLeaf"
                                type='number'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={factoryEnteringInput.boiledLeaf}
                                variant="outlined"
                                id="boiledLeaf"
                              >
                              </TextField>
                            </Grid>

                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="leafCondition">
                                Leaf Condition *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.leafCondition && errors.leafCondition)}
                                helperText={touched.leafCondition && errors.leafCondition}
                                size='small'
                                fullWidth
                                name="leafCondition"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={factoryEnteringInput.leafCondition}
                                variant="outlined"
                                id="leafCondition"
                              >
                              </TextField>
                            </Grid>

                            <TableContainer >
                              <Table className={classes.table} aria-label="caption table">
                                <TableHead>
                                  <TableRow>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow >
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <Grid container >
                                        <Grid alignContent={'center'}  >
                                          <InputLabel shrink id="fieldGrossWeight" align={'left'}>
                                            Field Gross Weight (KG) *
                                          </InputLabel>
                                          <TextField
                                            error={Boolean(touched.fieldGrossWeight && errors.fieldGrossWeight)}
                                            fullWidth
                                            helperText={touched.fieldGrossWeight && errors.fieldGrossWeight}
                                            size='small'
                                            name="fieldGrossWeight"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={(e) => handleChange(e)}
                                            value={factoryEnteringInput.fieldGrossWeight}
                                            variant="outlined"
                                            id="fieldGrossWeight"
                                          >
                                          </TextField>

                                        </Grid>
                                      </Grid>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <Grid container >
                                        <Grid alignContent={'center'}  >
                                          <InputLabel shrink id="factoryGrossWeight" align={'left'}>
                                            Factory Gross Weight (KG) *
                                          </InputLabel>
                                          <TextField
                                            error={Boolean(touched.factoryGrossWeight && errors.factoryGrossWeight)}
                                            fullWidth
                                            helperText={touched.factoryGrossWeight && errors.factoryGrossWeight}
                                            size='small'
                                            name="factoryGrossWeight"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={(e) => handleChange(e)}
                                            value={factoryEnteringInput.factoryGrossWeight}
                                            variant="outlined"
                                            id="factoryGrossWeight"
                                          >
                                          </TextField>

                                        </Grid>
                                      </Grid>
                                    </TableCell>
                                    <TableCell align={'center'} alignContent={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <Grid container >
                                        <Grid alignContent={'center'}  >
                                          <InputLabel shrink id="lossOrExcess" align={'left'}>
                                            Loss / Excess (KG) *
                                          </InputLabel>
                                          <TextField
                                            error={Boolean(touched.lossOrExcess && errors.lossOrExcess)}
                                            helperText={touched.lossOrExcess && errors.lossOrExcess}
                                            size='small'
                                            fullWidth
                                            name="lossOrExcess"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={(e) => handleChange(e)}
                                            value={factoryEnteringInput.lossOrExcess}
                                            variant="outlined"
                                            id="lossOrExcess"
                                          >
                                          </TextField>

                                        </Grid>
                                      </Grid>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow >
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <Grid container >
                                        <Grid alignContent={'center'}  >
                                          <InputLabel shrink id="fieldBag" align={'left'}>
                                            Bag (KG) *
                                          </InputLabel>
                                          <TextField
                                            error={Boolean(touched.fieldBag && errors.fieldBag)}
                                            helperText={touched.fieldBag && errors.fieldBag}
                                            size='small'
                                            fullWidth
                                            name="fieldBag"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={(e) => handleChange(e)}
                                            value={factoryEnteringInput.fieldBag}
                                            variant="outlined"
                                            id="fieldBag"
                                          >
                                          </TextField>

                                        </Grid>
                                      </Grid>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <Grid container >
                                        <Grid alignContent={'center'}  >
                                          <InputLabel shrink id="factoryBag" align={'left'}>
                                            Bag (KG) *
                                          </InputLabel>
                                          <TextField
                                            error={Boolean(touched.factoryBag && errors.factoryBag)}
                                            helperText={touched.factoryBag && errors.factoryBag}
                                            size='small'
                                            fullWidth
                                            name="factoryBag"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={(e) => handleChange(e)}
                                            value={factoryEnteringInput.factoryBag}
                                            variant="outlined"
                                            id="factoryBag"
                                          >
                                          </TextField>

                                        </Grid>
                                      </Grid>
                                    </TableCell>
                                    <TableCell align={'center'} alignContent={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <Grid container >
                                        <Grid alignContent={'center'}  >
                                          <InputLabel shrink id="comment" align={'left'}>
                                            Comment
                                          </InputLabel>
                                          <TextField
                                            fullWidth
                                            size='small'
                                            name="comment"
                                            onBlur={handleBlur}
                                            onChange={(e) => handleChange(e)}
                                            value={factoryEnteringInput.comment}
                                            variant="outlined"
                                            id="comment"
                                          >
                                          </TextField>

                                        </Grid>
                                      </Grid>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow >
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <Grid container >
                                        <Grid alignContent={'center'}  >
                                          <InputLabel shrink id="fieldWater" align={'left'}>
                                            Water (KG) *
                                          </InputLabel>
                                          <TextField
                                            error={Boolean(touched.fieldWater && errors.fieldWater)}
                                            helperText={touched.fieldWater && errors.fieldWater}
                                            size='small'
                                            fullWidth
                                            name="fieldWater"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={(e) => handleChange(e)}
                                            value={factoryEnteringInput.fieldWater}
                                            variant="outlined"
                                            id="fieldWater"
                                          >
                                          </TextField>

                                        </Grid>
                                      </Grid>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <Grid container >
                                        <Grid alignContent={'center'}  >
                                          <InputLabel shrink id="factoryWater" align={'left'}>
                                            Water (KG) *
                                          </InputLabel>
                                          <TextField
                                            error={Boolean(touched.factoryWater && errors.factoryWater)}
                                            helperText={touched.factoryWater && errors.factoryWater}
                                            size='small'
                                            fullWidth
                                            name="factoryWater"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={(e) => handleChange(e)}
                                            value={factoryEnteringInput.factoryWater}
                                            variant="outlined"
                                            id="factoryWater"
                                          >
                                          </TextField>

                                        </Grid>
                                      </Grid>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow >
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <Grid container >
                                        <Grid alignContent={'center'}  >
                                          <InputLabel shrink id="fieldCouseLeaf" align={'left'}>
                                            Couse Leaf (KG) *
                                          </InputLabel>
                                          <TextField
                                            error={Boolean(touched.fieldCouseLeaf && errors.fieldCouseLeaf)}
                                            helperText={touched.fieldCouseLeaf && errors.fieldCouseLeaf}
                                            size='small'
                                            fullWidth
                                            name="fieldCouseLeaf"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={(e) => handleChange(e)}
                                            value={factoryEnteringInput.fieldCouseLeaf}
                                            variant="outlined"
                                            id="fieldCouseLeaf"
                                          >
                                          </TextField>

                                        </Grid>
                                      </Grid>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <Grid container >
                                        <Grid alignContent={'center'}  >
                                          <InputLabel shrink id="factoryCouseLeaf" align={'left'}>
                                            Couse Leaf (KG) *
                                          </InputLabel>
                                          <TextField
                                            error={Boolean(touched.factoryCouseLeaf && errors.factoryCouseLeaf)}
                                            helperText={touched.factoryCouseLeaf && errors.factoryCouseLeaf}
                                            size='small'
                                            fullWidth
                                            name="factoryCouseLeaf"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={(e) => handleChange(e)}
                                            value={factoryEnteringInput.factoryCouseLeaf}
                                            variant="outlined"
                                            id="factoryCouseLeaf"
                                          >
                                          </TextField>

                                        </Grid>
                                      </Grid>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow >
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <Grid container >
                                        <Grid alignContent={'center'}  >
                                          <InputLabel shrink id="fieldNetWeight" align={'left'}>
                                            Field Net Weight (KG) *
                                          </InputLabel>
                                          <TextField
                                            error={Boolean(touched.fieldNetWeight && errors.fieldNetWeight)}
                                            fullWidth
                                            helperText={touched.fieldNetWeight && errors.fieldNetWeight}
                                            size='small'
                                            name="fieldNetWeight"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={(e) => handleChange(e)}
                                            value={factoryEnteringInput.fieldNetWeight}
                                            variant="outlined"
                                            id="fieldNetWeight"
                                          >
                                          </TextField>

                                        </Grid>
                                      </Grid>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <Grid container >
                                        <Grid alignContent={'center'}  >
                                          <InputLabel shrink id="factoryNetWeight" align={'left'}>
                                            Factory Net Weight (KG) *
                                          </InputLabel>
                                          <TextField
                                            error={Boolean(touched.factoryNetWeight && errors.factoryNetWeight)}
                                            fullWidth
                                            helperText={touched.factoryNetWeight && errors.factoryNetWeight}
                                            size='small'
                                            name="factoryNetWeight"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={(e) => handleChange(e)}
                                            value={factoryEnteringInput.factoryNetWeight}
                                            variant="outlined"
                                            id="factoryNetWeight"
                                          >
                                          </TextField>
                                        </Grid>
                                      </Grid>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                        </Card>
                        <br />
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="reset"
                          variant="outlined"
                          onClick={() => clearData()}
                        >
                          Cancel
                        </Button>
                        <div>&nbsp;</div>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          variant="contained"
                          type="submit"
                          style={{ marginRight: '1rem' }}
                        >
                          {isUpdate == true ? "Update" : "Save"}
                        </Button>
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
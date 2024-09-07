import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
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
  InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { KeyboardDatePicker } from "@material-ui/pickers";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import moment from 'moment';
import Typography from '@material-ui/core/Typography';
import { AlertDialog } from './../../../views/Common/AlertDialog';
import MaterialTable from "material-table";
import tokenDecoder from '../../../utils/tokenDecoder';
import _ from 'lodash';

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

const screenCode = 'MANUALLEAFUPLOAD';

export default function LeafUploadAddEdit(props) {
  const alert = useAlert();
  const classes = useStyles();
  const date = new Date();
  const [selectedDate, handleDateChange] = useState();
  const [message, setMessage] = useState("Upload Confirmation");
  const [EnableConfirmMessage, setEnableConfirmMessage] = useState(false);
  const [FormDetails, setFormDetails] = useState({
    groupID: 0,
    factoryID: 0,
    collectedRouteID: 0,
    regNo: '',
    leafType: 0,
    amount: '',
  });
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [RouteList, setRouteList] = useState([]);
  const [LeafTypeList, setLeafTypeList] = useState([]);
  const [ScreenConfigurationSettings, setScreenConfigurationSettings] = useState()
  const [LatestManualLeafRecord, setLatestManualLeafRecord] = useState({
    routeName: '',
    cropCollectedDate: '0',
    collectedRouteID: '0',
    collectionTypeID: '0',
    collectionTypeName: '',
    netWeight: '0',
    registrationNumber: ''
  });

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [CropUploadDetailsList, setCropUploadDetailsList] = useState([])

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/dashboard');
  };

  const [MinMonth, setMinMonth] = useState(new Date());

  useEffect(() => {
    trackPromise(
      getPermission()
    )
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoryByGroupID(FormDetails.groupID)
    )
  }, [FormDetails.groupID]);

  useEffect(() => {
    trackPromise(getRouteByFactoryID(FormDetails.factoryID))
    trackPromise(getCollectionTypeByFactoryID(FormDetails.factoryID))
  }, [FormDetails.factoryID]);

  useEffect(() => {
    getCustomerJoiningDate();
  }, [FormDetails.regNo]);

  useEffect(() => {
    validateDates();
  }, [MinMonth]);

  useEffect(() => {
    if (selectedDate == undefined) {
      trackPromise(getLatestManualLeafUpload(FormDetails.groupID, FormDetails.factoryID, FormDetails.collectedRouteID, moment(date).format()))
    }
    else {
      trackPromise(getLatestManualLeafUpload(FormDetails.groupID, FormDetails.factoryID, FormDetails.collectedRouteID, moment(selectedDate).format()));
    }
  }, [FormDetails.groupID, FormDetails.factoryID, FormDetails.collectedRouteID, selectedDate]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITMANUALLEAFUPLOAD');

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

    let screenConfiguration = await services.getScreenConfiguration(screenCode);
    setScreenConfigurationSettings(screenConfiguration);

    setFormDetails({
      ...FormDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken()),
      leafType: screenConfiguration.collectionTypeCode
    })
    getAllGroups();
  }

  async function getCustomerJoiningDate() {
    const result = await services.getCustomerJoiningDate(FormDetails.groupID, FormDetails.factoryID, FormDetails.collectedRouteID, FormDetails.regNo);
    checkIsMonthValid(result);
  }

  async function checkIsMonthValid(result) {
    let tempMonth;
    if (result !== null) {
      tempMonth = result.split('T');
      setMinMonth(moment(new Date(tempMonth[0])));
    }
    else {
      setMinMonth();
    }
  }

  async function validateDates() {
    if (MinMonth != null || MinMonth != undefined) {
      if (moment(selectedDate).isBefore(MinMonth)) {
        alert.error("can't upload crop details before the joining date");
      }
    }
  }

  async function uploadLeafAmountDetails() {
    let selectedCollectDate = "";
    let object = {
      registrationNumber: FormDetails.regNo,
      netWeight: parseFloat(FormDetails.amount),
      grossWeight: 0,
      collectionTypeCode: FormDetails.leafType,
      weightReadTime: selectedDate === undefined ? moment(date).format() : moment(selectedDate).format(),
      manualUpload: true,
      transportRateApplied: true,
      collectedRouteID: parseInt(FormDetails.collectedRouteID),
      createdBy: tokenDecoder.getUserIDFromToken(),
    };

    if (selectedDate === undefined) {
      selectedCollectDate = moment(new Date()).format('YYYY-MM-DD');
    }
    else {
      selectedCollectDate = moment(selectedDate).format('YYYY-MM-DD');
    }

    let lastCropDetailObject = CropUploadDetailsList[0]

    if (
      EnableConfirmMessage === false
      && lastCropDetailObject !== undefined
      && CropUploadDetailsList.length > 0
      && selectedCollectDate === lastCropDetailObject.cropCollectedDate.split('T')[0]
      && object.collectedRouteID === parseInt(lastCropDetailObject.collectedRouteID)
      && object.registrationNumber === lastCropDetailObject.registrationNumber
    ) {
      setEnableConfirmMessage(true);
      return;
    }

    if (object.netWeight > 0) {
      var response = await services.uploadLeafDetails(object);
      if (response.statusCode == "Success") {
        alert.success(response.message);

        if (selectedDate == undefined) {
          trackPromise(getLatestManualLeafUpload(FormDetails.groupID, FormDetails.factoryID, FormDetails.collectedRouteID, moment(date).format()));
        }
        else {
          trackPromise(getLatestManualLeafUpload(FormDetails.groupID, FormDetails.factoryID, FormDetails.collectedRouteID, moment(selectedDate).format()));
        }

      }
      else {
        alert.error(response.message);
      }

      resetFormFieldsAfterUpload();
      setFocusToTextBox();
    }


  };

  function resetFormFieldsAfterUpload() {
    setFormDetails({
      ...FormDetails,
      regNo: '',
      leafType: ScreenConfigurationSettings.collectionTypeCode,
      amount: ''
    });
  }

  function confirmData(y) {
    if (y) {
      trackPromise(uploadLeafAmountDetails())
    }
  }

  async function getAllGroups() {
    var response = await services.getAllGroups();
    setGroupList(response);
  };

  async function getFactoryByGroupID(groupID) {
    var response = await services.getFactoryByGroupID(groupID);
    setFactoryList(response);
  };

  async function getRouteByFactoryID(factoryID) {
    var response = await services.getRouteByFactoryID(factoryID);
    setRouteList(response);
  };

  async function getCollectionTypeByFactoryID(factoryID) {
    var response = await services.getCollectionTypeByFactoryID(factoryID);
    setLeafTypeList(response);
  };

  async function getLatestManualLeafUpload(groupID, factoryID, routeID, formattedDate) {
    var response = await services.getLatestManualLeafUpload(groupID, factoryID, routeID, formattedDate);
    if (response.length > 0) {
      var res = [...response]
      res.forEach(x => {
        x.cropCollectedDate = x.cropCollectedDate.split('T')[0]
      })
      setCropUploadDetailsList(res)
    }
    else {
      setCropUploadDetailsList([])
    }
  }

  function clearData() {
    setFormDetails({
      ...FormDetails,
      collectedRouteID: 0,
      regNo: '',
      leafType: 0,
      amount: ''
    });
    handleDateChange();
  }

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      groupID: value,
      factoryID: 0,
      collectedRouteID: 0,
      regNo: '',
      leafType: 0,
      amount: '',
    });
  }

  function handleFactoryChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      factoryID: value,
      collectedRouteID: 0,
      regNo: '',
      leafType: 0,
      amount: '',
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      [e.target.name]: value
    });
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
      </Grid>
    )
  }

  function setFocusToTextBox() {
    document.getElementById("regNo").focus();
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={"Manual Leaf Upload"}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: FormDetails.groupID,
              factoryID: FormDetails.factoryID,
              collectedRouteID: FormDetails.collectedRouteID,
              regNo: FormDetails.regNo,
              leafType: FormDetails.leafType,
              amount: FormDetails.amount,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                factoryID: Yup.number().min(1, "Please Select a Factory").required('Factory is required'),
                collectedRouteID: Yup.number().min(1, "Please select a collected route").required('Collected route is required'),
               // regNo: Yup.string().required('Registration number is required'),
                //.typeError('Please enter valid registration number').matches(/^[0-9]{0,15}$/, 'Please enter valid registration number'),
                regNo: Yup.string().required('Registration number is required').matches(/^(?! )[a-zA-Z0-9]{0,15}$/, 'Please enter valid registration number'),

                leafType: Yup.number().min(1, "Please Select a Leaf Type").required('Collection Type is required'),
                amount: Yup.string().required('Leaf weight is required')
                  .matches(/^\d{1,5}(\.\d+)?$/, 'Please enter valid leaf weight')
                  .matches(/^\d{1,5}(\.\d{1})?$/, 'Please enter one decimal value for leaf weight')
                  .test('amount', "Please provide valid leaf amount", val => val > 0),
              })
            }
            onSubmit={() => trackPromise(uploadLeafAmountDetails())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle("Manual Leaf Upload")}
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
                              size='small'
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleGroupChange(e)
                              }}
                              value={FormDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value={'0'} disabled={true}>
                                --Select Group--
                              </MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              size='small'
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleFactoryChange(e)
                              }}
                              value={FormDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled,
                              }}
                            >
                              <MenuItem value={0} disabled={true}>
                                --Select Factory--
                              </MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="applicableMonth" style={{ marginBottom: '-8px' }}>
                              Collected Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                size='small'
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="date-picker-inline"
                                value={selectedDate}
                                maxDate={new Date()}
                                minDate={MinMonth}
                                onChange={(e) => {
                                  handleDateChange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="collectedRouteID">
                              Collected Route *
                            </InputLabel>
                            <TextField select
                              size='small'
                              error={Boolean(touched.collectedRouteID && errors.collectedRouteID)}
                              fullWidth
                              helperText={touched.collectedRouteID && errors.collectedRouteID}
                              name="collectedRouteID"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.collectedRouteID}
                              variant="outlined"
                              id="collectedRouteID"
                            >
                              <MenuItem value={0} disabled={true}>
                                --Please select a collected route--
                              </MenuItem>
                              {generateDropDownMenu(RouteList)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <br />
                        <Card>
                          <CardContent>
                            <Grid container spacing={3}>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="regNoLbl">
                                  Registration Number *
                                </InputLabel>
                                <TextField
                                  size='small'
                                  error={Boolean(touched.regNo && errors.regNo)}
                                  fullWidth
                                  helperText={touched.regNo && errors.regNo}
                                  name="regNo"
                                  onBlur={handleBlur}
                                  onChange={(e) => {
                                    handleChange(e)
                                  }}
                                  value={FormDetails.regNo}
                                  variant="outlined"
                                  id="regNo"
                                >
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="leafType">
                                  Collection Type *
                                </InputLabel>
                                <TextField select
                                  size='small'
                                  error={Boolean(touched.leafType && errors.leafType)}
                                  fullWidth
                                  helperText={touched.leafType && errors.leafType}
                                  name="leafType"
                                  onBlur={handleBlur}
                                  onChange={(e) => {
                                    handleChange(e)
                                  }}
                                  value={FormDetails.leafType}
                                  variant="outlined"
                                  id="leafType"
                                >
                                  <MenuItem value={0} disabled={true}>
                                    --Select Collection Type--
                                  </MenuItem>
                                  {generateDropDownMenu(LeafTypeList)}
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="amount">
                                  Leaf Weight (Kg) *
                                </InputLabel>
                                <TextField
                                  size='small'
                                  error={Boolean(touched.amount && errors.amount)}
                                  fullWidth
                                  helperText={touched.amount && errors.amount}
                                  name="amount"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange(e)}
                                  value={FormDetails.amount}
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <Grid container spacing={3}>
                                  <Box display="flex" justifyContent="flex-end" p={2} mt={2.5}>
                                    <Button
                                      size='small'
                                      color="primary"
                                      type="reset"
                                      variant="outlined"
                                      onClick={() => clearData()}
                                    >
                                      Clear
                                    </Button>
                                    <div>&nbsp;</div>
                                    <Button
                                      size='small'
                                      color="primary"
                                      type="submit"
                                      variant="contained"
                                    >
                                      Upload
                                    </Button>
                                    <div hidden={true}>
                                      <Grid item>
                                        <AlertDialog confirmData={confirmData} headerMessage={message} viewPopup={EnableConfirmMessage}
                                          discription={"Are you sure want to Confirm Upload"} setViewPopup={setEnableConfirmMessage} />
                                      </Grid>
                                    </div>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                        <br />
                        {
                          CropUploadDetailsList.length <= 0 ?
                            <>
                              <Grid container className={classes.row} spacing={1}>
                                <Grid item md={4} xs={12}>
                                  <Typography style={{ marginLeft: "1rem", fontWeight: 'bold', fontSize: '17px' }} align="left">No Previous Records</Typography>
                                </Grid>
                              </Grid>
                            </> :
                            <>
                              <Card>
                                <Grid container className={classes.row} spacing={1}>
                                  <Grid item md={4} xs={12}>
                                    <Typography style={{ marginLeft: "1rem", fontWeight: 'bold', fontSize: '17px' }} align="left">Latest Uploaded Records</Typography>
                                  </Grid>
                                  <Grid item md={4} xs={12}>
                                    <Typography style={{ marginLeft: "1rem", fontSize: '17px' }} align="left">{"Total Leaf Amount (KG) : " + CropUploadDetailsList.reduce((previousValue, current) => previousValue + current.netWeight, 0)}</Typography>
                                  </Grid>
                                  <Grid item md={4} xs={12}>
                                    <Typography style={{ marginLeft: "1rem", fontSize: '17px' }} align="left">{"No of Records : " + CropUploadDetailsList.length}</Typography>
                                  </Grid>
                                </Grid>
                                <br />
                                <Box minWidth={1050}>
                                  {CropUploadDetailsList.length > 0 ?
                                    <MaterialTable
                                      title="Multiple Actions Preview"
                                      columns={[
                                        { title: 'Route Name', field: 'routeName' },
                                        { title: 'Registration Number', field: 'registrationNumber' },
                                        { title: 'Collected Net Weight(Kg)', field: 'netWeight' },
                                        { title: 'Leaf Type', field: 'collectionTypeName' },
                                        { title: 'Collected Date', field: 'cropCollectedDate' },

                                      ]}
                                      data={CropUploadDetailsList}
                                      options={{
                                        exportButton: false,
                                        showTitle: false,
                                        headerStyle: { textAlign: "left", height: '1%' },
                                        cellStyle: { textAlign: "left" },
                                        columnResizable: false,
                                        actionsColumnIndex: -1,
                                        pageSize: 5
                                      }}
                                    />
                                    : null}
                                </Box>
                              </Card>
                            </>
                        }
                      </CardContent>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>)
}

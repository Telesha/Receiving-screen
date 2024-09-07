import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  InputLabel,
  Switch,
  CardHeader,
  MenuItem,
  AppBar,
  Tabs,
  Tab
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, FormikProvider, useFormik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent, ManualLoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import NumberFormat from 'react-number-format';
import PropTypes from 'prop-types';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { TabPanel } from './TabPanel';
import MaterialTable from "material-table";


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
  formControlLabel: {
    color: "grey",
    fontFamily: "Roboto",
    fontSize: 13
  }

}));
var screenCode = "ROUTE"

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      decimalScale={2}
      isNumericString

    />
  );
}

NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function RouteAddEdit(props) {
  const [title, setTitle] = useState("Add Route")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [products, setProducts] = useState();
  const [groups, setGroups] = useState();
  const [route, setRoute] = useState({
    groupID: '0',
    factoryID: '0',
    routeName: '',
    routeCode: '',
    routeLocation: '',
    transportRate: '',
    targetCrop: '',
    productID: '0',
    isActive: true,
    exPayRate: '',
  });
  const [routeIsActive, setRouteIsActive] = useState(true);
  const navigate = useNavigate();
  const handleClick = () => {

    navigate('/app/routes/listing');

  }
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const alert = useAlert();
  const { routeID } = useParams();
  const [tranRateApplyFromDate, setTranRateApplyFromDate] = useState(new Date());
  const [tranRateApplyToDate, setTranRateApplyToDate] = useState(new Date());
  const [minDate, setMinDate] = useState(new Date());
  const [value, setValue] = React.useState(0);

  const [customerTransportDeductionsList, setCustomerTransportDeductionsList] = useState([]);
  const [selectedCustomerTransportDeductionsList, setSelectedCustomerTransportDeductionsList] = useState([])
  const [isTranSelected, setIsTranSelected] = useState(false)
  const [deductionUpdateInProgress, setDeductionUpdateInProgress] = useState(false)


  let decrypted = 0;
  const schemageneral =
    Yup.object().shape({
      groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
      factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
      routeName: Yup.string().required('Route Name is required'),
      routeCode: Yup.string().max(2, "RouteCode must be at most 2 characters").required('Route Code is required').matches(/^[0-9\b]+$/, 'Only allow numbers'),
      routeLocation: Yup.string().max(255).matches(/^[a-zA-Z\d\s\,\.\/]+$/, 'Special Characters and Numbers Not Allowed').required('Route Location is required'),
      transportRate: Yup.string().required('Transport Rate is required').matches(/^\s*(?=.*[0-9])\d*(?:\.\d{1,2})?\s*$/, 'Transport Rate allow Only 2 decimals'),
      targetCrop: Yup.string().required('Monthly Target Crop is required')
        .matches(/^[1-9][0-9]*(\.\d+)?$/, 'Monthly Target Crop must be a positive number and cannot start with zero')
        .matches(/^[1-9][0-9]*$/, 'Monthly Target Crop must not be decimal values'),
      productID: Yup.number().required('Product is required').min("1", 'Product is required'),
      exPayRate: Yup.string().matches(/^\s*(?=.*[0-9])\d*(?:\.\d{1,2})?\s*$/, 'ExPay Rate allow Only 2 decimals'),
    });
  const formik = useFormik({
    initialValues: {
      groupID: route.groupID,
      factoryID: route.factoryID,
      routeName: route.routeName,
      routeCode: route.routeCode,
      routeLocation: route.routeLocation,
      transportRate: route.transportRate,
      targetCrop: route.targetCrop,
      productID: route.productID,
      isActive: route.isActive,
      exPayRate: route.exPayRate
    },
    validationSchema: schemageneral,
    onSubmit: (values) => {
      saveRoute(values);
    },
  });

  useEffect(() => {
    getPermissions();
    getGroupsForDropdown();
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown()
    );
  }, [formik.values.groupID]);

  useEffect(() => {
    decrypted = atob(routeID.toString());
    if (decrypted != 0) {
      trackPromise(
        getGroupDetails(decrypted)
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getProductsForDropDown()
    );
  }, [formik.values.factoryID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITROUTE');

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

    setValues({
      ...values,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })

  }
  const {
    errors,
    setValues,
    touched,
    handleBlur,
    handleSubmit,
    handleChange,
    isSubmitting,
    getFieldProps,
    values
  } = formik;

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(formik.values.groupID);
    setFactories(factory);
  }

  async function getProductsForDropDown() {
    const product = await services.getProductsByFactoryID(formik.values.factoryID);
    setProducts(product);
  }

  async function getGroupDetails(routeID) {
    let response = await services.getRouteDetailsByID(routeID);
    let data = response[0];
    setTitle("Update Route");
    data.transportRate = data.transportRate.toFixed(2)
    data.exPayRate = data.exPayRate.toFixed(2)
    setIsUpdate(true);
    setRouteIsActive(response[0]);
    setValues(data);
    getMinDate(data.groupID, data.factoryID);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function saveRoute(values) {

    if (isUpdate == true) {
      let updateModel = {
        routeID: atob(routeID.toString()),
        routeCode: formik.values.routeCode,
        routeName: formik.values.routeName,
        routeLocation: formik.values.routeLocation,
        transportRate: formik.values.transportRate,
        targetCrop: formik.values.targetCrop,
        productID: formik.values.productID,
        isActive: formik.values.isActive,
        factoryID: formik.values.factoryID,
        groupID: formik.values.groupID,
        exPayRate: formik.values.exPayRate
      }
      let response = await services.updateRoute(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        setValues(updateModel);
        navigate('/app/routes/listing');
      }
      else {
        setRoute({
          ...route,
          isActive: routeIsActive
        });
        alert.error(response.message);
      }
    }

    else {
      let response = await services.saveRoute(values);

      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(false);
        setValues(values);
        navigate('/app/routes/listing');
      }
      else {
        alert.error(response.message);
      }
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

  function handleFromDateChange(date) {
    if (date > tranRateApplyToDate) {
      alert.error("From date can not be greater than To date");
      return;
    }
    setTranRateApplyFromDate(date)
  }

  function handleToDateChange(date) {
    if (date < tranRateApplyFromDate) {
      alert.error("To date can not be less than From date");
      return;
    }
    setTranRateApplyToDate(date)
  }

  async function getMinDate(groupID, FactoryID) {

    let response = await services.GetBalancepaymentDetails(groupID, FactoryID);
    setMinDate(response.currentYear + "-" + response.currentMonth + "-01");
  }

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  async function GetCustomerTransportDeductionsByRoute() {

    let TransportDeductoinSearchModel = {
      routeID: parseInt(atob(routeID.toString())),
      tranRateApplyFromDate: tranRateApplyFromDate.toISOString(),
      tranRateApplyToDate: tranRateApplyToDate.toISOString()
    }


    let response = await trackPromise(services.GetCustomerTransportDeductionsByRoute(TransportDeductoinSearchModel));

    if (response.data.length > 0) {
      setCustomerTransportDeductionsList(response.data)
    } else {
      (response.statusCode == 'Success') ? alert.success("No records found") : alert.error(response.message);

      setCustomerTransportDeductionsList([])
    }

  }

  async function RefreCustomerTransportDeductionsByRoute() {

    let TransportDeductoinSearchModel = {
      routeID: parseInt(atob(routeID.toString())),
      tranRateApplyFromDate: tranRateApplyFromDate.toISOString(),
      tranRateApplyToDate: tranRateApplyToDate.toISOString()
    }

    let response = await trackPromise(services.GetCustomerTransportDeductionsByRoute(TransportDeductoinSearchModel));

    if (response.data.length > 0) {
      setCustomerTransportDeductionsList(response.data)
    } else {
      setCustomerTransportDeductionsList([])
    }

  }

  function handleTranUpdateClick(index) {
    setDeductionUpdateInProgress(true);

    var model = selectedCustomerTransportDeductionsList[index]

    let customerTransportDeductionModel = {
      amount: model.amount,
      customerAccountID: model.customerAccountID,
      customerID: model.customerID,
      customerTransactionID: model.customerTransactionID,
      modifiedBy: tokenService.getUserIDFromToken(),
      modifiedDate: new Date(),
      netWeight: model.netWeight,
      transactionTypeID: model.transactionTypeID,
      transportRate: model.transportRate
    }

    services.UpdateTransportDeductionByTransactionID(customerTransportDeductionModel).then((response) => {
      if (response.statusCode != "Success") {
        alert.error(response.message);
        setDeductionUpdateInProgress(false);
        return;
      }

      if (selectedCustomerTransportDeductionsList.length > index + 1) {
        index = index + 1
        handleTranUpdateClick(index);
      } else {
        setDeductionUpdateInProgress(false);
        index = index + 1
        RefreCustomerTransportDeductionsByRoute();
      }

    })
      .catch(error => {
        setDeductionUpdateInProgress(false);
      })

  }

  async function UpdateTransportDeductionByTransactionID(customerTransportDeductionModel) {

    var response = await services.UpdateTransportDeductionByTransactionID(customerTransportDeductionModel)

    return response;
  }

  function handleRecordSelectionFromTable(rowData) {
    setSelectedCustomerTransportDeductionsList(rowData)
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
      <ManualLoadingComponent inProgress={deductionUpdateInProgress} />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <FormikProvider value={formik}>
            <Form
              autoComplete="off"
              disabled={!(formik.isValid && formik.dirty)}
              noValidate
              onSubmit={handleSubmit}
            >
              <Box mt={0}>
                <Card>
                  <CardHeader
                    title={cardTitle(title)}
                  />
                  <Grid className={classes.root1} item xs={12}>
                    <AppBar position="static">
                      <Tabs value={value} onChange={handleTabChange} variant={'fullWidth'} classes={{ indicator: classes.indicator }}
                        aria-label="simple tabs example" style={{ backgroundColor: "white" }}>
                        <Tab label="General" {...a11yProps(0)} style={{ color: "black" }} />
                        {isUpdate ? <Tab label="Update Transport deductions" {...a11yProps(1)} style={{ color: "black" }} /> : null}
                      </Tabs>
                    </AppBar>
                  </Grid>
                  <TabPanel value={value} index={0} >
                    <PerfectScrollbar>
                      <CardContent>
                        <Card>
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
                                  onChange={formik.handleChange}
                                  {...getFieldProps('groupID')}
                                  value={formik.values.groupID}
                                  variant="outlined"
                                  id="groupID"
                                  size="small"
                                  InputProps={{
                                    readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
                                  }}
                                >
                                  <MenuItem value="0">--Select Group--</MenuItem>
                                  {generateDropDownMenu(groups)}
                                </TextField>
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="factoryID">
                                  Factory *
                                </InputLabel>
                                <TextField select
                                  error={Boolean(touched.factoryID && errors.factoryID)}
                                  fullWidth
                                  helperText={touched.factoryID && errors.factoryID}
                                  name="factoryID"
                                  onBlur={handleBlur}
                                  onChange={formik.handleChange}
                                  {...getFieldProps('factoryID')}
                                  value={formik.values.factoryID}
                                  variant="outlined"
                                  id="factoryID"
                                  size="small"
                                  InputProps={{
                                    readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false,
                                  }}
                                >
                                  <MenuItem value="0">--Select Factory--</MenuItem>
                                  {generateDropDownMenu(factories)}
                                </TextField>
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="productID">
                                  Product *
                                </InputLabel>
                                <TextField select
                                  error={Boolean(touched.productID && errors.productID)}
                                  fullWidth
                                  helperText={touched.productID && errors.productID}
                                  name="productID"
                                  onBlur={handleBlur}
                                  onChange={formik.handleChange}
                                  {...getFieldProps('productID')}
                                  value={formik.values.productID}
                                  variant="outlined"
                                  id="productID"
                                  size="small"
                                  InputProps={{
                                    readOnly: isUpdate ? true : false,
                                  }}
                                >
                                  <MenuItem value="0">--Select Product--</MenuItem>
                                  {generateDropDownMenu(products)}
                                </TextField>
                              </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="routeCode">
                                  Route Code *
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.routeCode && errors.routeCode)}
                                  fullWidth
                                  helperText={touched.routeCode && errors.routeCode}
                                  name="routeCode"
                                  onBlur={handleBlur}
                                  onChange={formik.handleChange}
                                  {...getFieldProps('routeCode')}
                                  value={formik.values.routeCode}
                                  variant="outlined"
                                  disabled={isDisableButton}
                                  size="small"
                                  onInput={(e) => {
                                    e.target.value = e.target.value.slice(0, 2)
                                  }}
                                  InputProps={{
                                    readOnly: isUpdate ? true : false,
                                  }}
                                />
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="routeName">
                                  Route Name *
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.routeName && errors.routeName)}
                                  fullWidth
                                  helperText={touched.routeName && errors.routeName}
                                  name="routeName"
                                  onBlur={handleBlur}
                                  onChange={formik.handleChange}
                                  {...getFieldProps('routeName')}
                                  value={formik.values.routeName}
                                  variant="outlined"
                                  disabled={isDisableButton}
                                  size="small"
                                  inputProps={{ maxLength: 20 }}
                                />
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="routeLocation">
                                  Route Location *
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.routeLocation && errors.routeLocation)}
                                  fullWidth
                                  helperText={touched.routeLocation && errors.routeLocation}
                                  name="routeLocation"
                                  onBlur={handleBlur}
                                  onChange={formik.handleChange}
                                  {...getFieldProps('routeLocation')}
                                  value={formik.values.routeLocation}
                                  variant="outlined"
                                  disabled={isDisableButton}
                                  size="small"
                                  inputProps={{ maxLength: 30 }}
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                        <br />
                        <Card>
                          <CardContent>
                            <Grid container spacing={3}>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="targetCrop">
                                  Monthly Target Crop(KG) *
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.targetCrop && errors.targetCrop)}
                                  fullWidth
                                  helperText={touched.targetCrop && errors.targetCrop}
                                  name="targetCrop"
                                  onBlur={handleBlur}
                                  onChange={formik.handleChange}
                                  {...getFieldProps('targetCrop')}
                                  value={formik.values.targetCrop}
                                  variant="outlined"
                                  disabled={isDisableButton}
                                  size="small"
                                />
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="transportRate">
                                  Transport Rate(Rs.) *
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.transportRate && errors.transportRate)}
                                  fullWidth
                                  helperText={touched.transportRate && errors.transportRate}
                                  name="transportRate"
                                  onBlur={handleBlur}
                                  onChange={formik.handleChange}
                                  {...getFieldProps('transportRate')}
                                  value={formik.values.transportRate}
                                  variant="outlined"
                                  size="small"
                                  disabled={isDisableButton}
                                />
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="targetCrop">
                                  Expay Rate
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.exPayRate && errors.exPayRate)}
                                  fullWidth
                                  helperText={touched.exPayRate && errors.exPayRate}
                                  name="exPayRate"
                                  onBlur={handleBlur}
                                  onChange={formik.handleChange}
                                  {...getFieldProps('exPayRate')}
                                  value={formik.values.exPayRate}
                                  variant="outlined"
                                  disabled={isDisableButton}
                                  size="small"
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                        <br />
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="isActive">
                              Active
                            </InputLabel>
                            <Switch
                              checked={formik.values.isActive}
                              onChange={formik.handleChange}
                              name="isActive"
                              disabled={isDisableButton}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={/* isSubmitting || */ isDisableButton}
                          type="submit"
                          variant="contained"
                        >
                          {isUpdate == true ? "Update" : "Save"}
                        </Button>
                      </Box>
                    </PerfectScrollbar>
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    <Card>
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12} >
                            <InputLabel shrink id="tranRateApplyFromDate" style={{ marginBottom: '-8px' }}>
                              From Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                size='small'
                                autoOk
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="tranRateApplyFromDate"
                                value={tranRateApplyFromDate}
                                maxDate={new Date()}
                                minDate={new Date(minDate)}
                                onChange={(e) => {
                                  handleFromDateChange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <Grid item md={4} xs={12} >
                            <InputLabel shrink id="tranRateApplyToDate" style={{ marginBottom: '-8px' }}>
                              To Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                size='small'
                                autoOk
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="tranRateApplyToDate"
                                value={tranRateApplyToDate}
                                maxDate={new Date()}
                                minDate={new Date(minDate)}
                                onChange={(e) => {
                                  handleToDateChange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          type="button"
                          variant="contained"
                          onClick={GetCustomerTransportDeductionsByRoute}
                        >
                          Search
                        </Button>
                      </Box>
                    </Card>
                    <br />
                    {customerTransportDeductionsList.length > 0 ?
                      <div>
                        <Grid container spacing={2}>
                          <Grid item md={12} xs={12}>
                            <MaterialTable
                              title="Multiple Actions Preview"
                              columns={[
                                // { title: 'CustomerID', field: 'customerID' },
                                // { title: 'CustomerAccountID', field: 'customerAccountID' },
                                { title: 'RegistrationNumber', field: 'registrationNumber' },
                                { title: 'Amount (Rs)', field: 'amount' },
                                { title: 'TransportRate', field: 'transportRate' },
                                { title: 'NetWeight', field: 'netWeight' },
                              ]}
                              data={customerTransportDeductionsList}
                              options={{
                                exportButton: false,
                                showTitle: false,
                                headerStyle: { textAlign: "left", height: '1%' },
                                cellStyle: { textAlign: "left" },
                                columnResizable: false,
                                selection: isTranSelected === false ? true : false,
                                // selectionProps: rowData => ({
                                //   disabled: rowData.isLedgerTransactionCompleted === true,
                                //   color: 'primary'
                                // }),
                                pageSize: 10,
                                actionsColumnIndex: -1,
                              }}
                              onSelectionChange={(rows) => handleRecordSelectionFromTable(rows)}

                            />
                          </Grid>

                        </Grid>
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            disabled={isSubmitting || isDisableButton}
                            type="button"
                            variant="contained"
                            onClick={() => handleTranUpdateClick(0)}
                          >
                            Update
                          </Button>
                        </Box>
                      </div>
                      : null}
                  </TabPanel>


                </Card>
              </Box>
            </Form>
          </FormikProvider>
        </Container>
      </Page>
    </Fragment>
  );
};

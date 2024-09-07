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
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  Tooltip,
  Chip
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from 'yup';
import CSVReader from 'react-csv-reader';
import { confirmAlert } from 'react-confirm-alert';
import MaterialTable from 'material-table';
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import tokenDecoder from '../../../utils/tokenDecoder';
import { useAlert } from 'react-alert';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
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

const screenCode = 'CUSTOMERBULKUPLOAD';
export default function CutomerBulkUpload(props) {
  const [title, setTitle] = useState('Customer Bulk Upload');
  const classes = useStyles();
  const alert = useAlert();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [routes, setRoutes] = useState();
  const [customerData, setcustomerData] = useState([]);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [IsUploadingFinished, setIsUploadingFinished] = useState(false);
  const [customerBulkUpload, setCustomerBulkUpload] = useState({
    groupID: '0',
    factoryID: '0',
    routeID: '0'
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [ErrorCustomerCount, setErrorCustomerCount] = useState([])
  const handleClose = () => {
    setIsDisableButton(false);
    setOpen(false);
  };
  const [open, setOpen] = React.useState(true);
  const papaparseOptions = {
    header: true,
    dynamicTyping: false,
    quoteChar: '"',
    skipEmptyLines: true,
    parseNumbers: true,
    transformHeader: header =>
      header
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '')
  };
  const navigate = useNavigate();

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [customerBulkUpload.groupID]);

  useEffect(() => {
    trackPromise(getRoutesByFactoryID());
  }, [customerBulkUpload.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWCUSTOMERBULKUPLOAD'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setCustomerBulkUpload({
      ...customerBulkUpload,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }
  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(
      customerBulkUpload.groupID
    );
    setFactories(factory);
  }

  async function getRoutesByFactoryID() {
    const route = await services.getRoutesForDropDown(
      customerBulkUpload.factoryID
    );
    setRoutes(route);
  }

  const handleForce = (data, fileInfo) => {
    if (fileInfo.type !== 'text/csv') {
      alert.error('Wrong file format');
      clearScreen();
      return;
    }

    const eqSet = (xs, ys) =>
      xs.size === ys.size && [...xs].every(x => ys.has(x));

    const columnDetails = new Set(
      data.reduce((keys, object) => keys.concat(Object.keys(object)), [])
    );
    const concreteModel = new Set([
      'customerCode',
      'registrationNumber',
      'nic',
      'firstName',
      'lastName',
      'address',
      'addresstwo',
      'addressthree',
      'mobile',
      'home',
      'paymentTypeID',
      'accountHolderName',
      'bankID',
      'branchID',
      'accountNumber',
      'accountTypeID',
      'dob',
      'gender',
      'title',
      'joiningDate'
    ]);

    if (!eqSet(columnDetails, concreteModel)) {
      alert.error('Please upload only customer details document');
      clearScreen();
      return;
    }

    if (customerBulkUpload.routeID <= 0) {
      alert.error('Please select a route');
      clearScreen();
      return;
    } else {
      if (customerData.length > 0) {
        confirmAlert({
          title: 'Confirmation Message',
          message:
            'Are you sure to browse a new file without uploading existing file.',
          buttons: [
            {
              label: 'Yes',
              onClick: () => confirmUpload(data, fileInfo)
            },
            {
              label: 'No',
              onClick: () => handleClose()
            }
          ],
          closeOnEscape: true,
          closeOnClickOutside: true
        });
      } else {
        confirmUpload(data, fileInfo);
      }
    }
  };

  function confirmUpload(data, fileInfo) {
    setIsUploadingFinished(false);
    let details = data;
    data.forEach(x => {
      x.paymentTypeID = parseInt(x.paymentTypeID);
    });

    let accountDetailsErrorCustomer = data.filter((customer) => {
      if (customer.paymentTypeID === 1 && (customer.bankID === "" || customer.branchID === "" || customer.accountNumber === "" || customer.accountHolderName === "")) {
        return customer;
      }
    })
    if (accountDetailsErrorCustomer.length > 0) {
      alert.error("If the Customer Payment type is Account, Please enter other Bank Account Details")
    }

    const filteredArray = data.filter((customer) => {
      return (
        customer.customerCode !== "\n"
      );
    });
    setcustomerData(filteredArray);
  }

  async function saveCustomer() {

    let errorCustomerList = [];
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    let count = 0;
    customerData.forEach(async data => {
      ++count;
      var regnumberDuplicateCount = customerData.filter(a => a.registrationNumber === data.registrationNumber).length;
      if (regnumberDuplicateCount > 1) {
        errorCustomerList.push(data);
        return;
      }
      else if (isNaN(data.paymentTypeID) || data.paymentTypeID > 3 || data.paymentTypeID < 1) {
        errorCustomerList.push(data);
        return;
      }
      else if (data.customerCode === "") {
        errorCustomerList.push(data);
        return;
      }
      else if (
        data.registrationNumber.length === 0 ||
        format.test(data.registrationNumber)) {
        errorCustomerList.push(data);
        return;
      }
      else if (
        data.nic.length < 10 ||
        data.nic.length == 11 ||
        data.nic.length > 12
      ) {
        errorCustomerList.push(data);
        return;
      }
      else if (data.firstName === "") {
        errorCustomerList.push(data);
        return;
      }

      //Creating Data Object
      let saveModel = {
        customerID: 0,
        groupID: parseInt(customerBulkUpload.groupID),
        factoryID: parseInt(customerBulkUpload.factoryID),
        routeID: parseInt(customerBulkUpload.routeID),
        customerCode: data.customerCode,
        dob: data.dob === "" ? null : moment(new Date(data.dob)).format('YYYY-MM-DD'),
        firstName: data.firstName,
        home: data.home,
        lastName: data.lastName,
        mobile: data.mobile,
        nic: data.nic,
        title: parseInt(data.title === '' ? '0' : data.title),
        gender: parseInt(data.gender === '' ? '0' : data.gender),
        address: data.address,
        addresstwo: data.addresstwo,
        addressthree: data.addressthree,
        customerBulkUploadCropBookModels: {
          customerAccountID: 0,
          routeID: customerBulkUpload.routeID,
          accountTypeID: data.accountTypeID === '' ? '0' : data.accountTypeID,
          registrationNumber: data.registrationNumber,
          isDefault: true,
          isActive: true,
          createdBy: tokenDecoder.getUserIDFromToken(),
          createdDate: new Date().toISOString(),
          modifiedBy: 0,
          modifiedDate: new Date().toISOString(),
          customerPaymentMethodID: 0,
          disbursmentType: parseInt(data.paymentTypeID),
          bankID: parseInt(data.bankID === '' ? '0' : data.bankID),
          branchID: parseInt(data.branchID === '' ? '0' : data.branchID),
          accountNumber: data.accountNumber,
          isActive: true,
          createdBy: tokenDecoder.getUserIDFromToken(),
          createdDate: new Date().toISOString(),
          modifiedBy: 0,
          modifiedDate: new Date().toISOString(),
          accountHolderName: data.accountHolderName
        },
        createdBy: tokenDecoder.getUserIDFromToken(),
        createdDate: new Date().toISOString(),
        modifiedBy: 0,
        modifiedDate: new Date().toISOString(),
        isActive: true,
        joiningDate: moment(new Date(data.joiningDate)).format('YYYY-MM-DD'),
        standingFunds: []
      };

      // Calling Save Service 
      let response = await saveCustomerBulk(saveModel);
      if (response.statusCode == 'Success') {
      } else {
        errorCustomerList.push(data);
        return;
      }
    });

    let totalCustomerDetailsCount = customerData.length;
    let totalFailedCustomerDetailsCount = errorCustomerList.length;
    let totalSubmitedCustomerDetailsCount = totalCustomerDetailsCount - totalFailedCustomerDetailsCount

    setErrorCustomerCount(errorCustomerList);
    setcustomerData(errorCustomerList);
    setIsUploadingFinished(true);
    if (errorCustomerList.length === 0) {
      clearScreen()
      clearData();
      alert.success('All Customer details uploaded successfully');
    } else {
      document.querySelector('.csv-input').value = '';
      alert.info(totalSubmitedCustomerDetailsCount + ' record(s) uploaded successfully and ' + totalFailedCustomerDetailsCount + ' record(s) failed')
    }
  }

  async function saveCustomerBulk(saveModel) {
    let response = await services.saveCustomer(saveModel);
    if (response.statusCode != 'Success') {
      alert.error(response.message);
    }
    return response;
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
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
      </Grid>
    );
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setCustomerBulkUpload({
      ...customerBulkUpload,
      [e.target.name]: value
    });
    clearScreen();
  }

  function clearScreen() {
    setcustomerData([]);
    document.querySelector('.csv-input').value = '';
  }

  function clearData() {
    setIsUploadingFinished(false);
    setCustomerBulkUpload({
      ...customerBulkUpload,
      routeID: '0'
    });
    setcustomerData([]);
  }

  async function clearForm() {
    await saveCustomer();
  }
  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: customerBulkUpload.groupID,
              factoryID: customerBulkUpload.factoryID,
              routeID: customerBulkUpload.routeID
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Factory is required')
                .min('1', 'Factory is required'),
              routeID: Yup.number()
                .required('Route is required')
                .min('1', 'Route is required')
            })}
            enableReinitialize
          >
            {({ errors, handleBlur, handleSubmit, touched }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              size="small"
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={customerBulkUpload.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled
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
                            <TextField
                              select
                              error={Boolean(
                                touched.factoryID && errors.factoryID
                              )}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              size="small"
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={customerBulkUpload.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled
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
                            <TextField
                              select
                              error={Boolean(touched.routeID && errors.routeID)}
                              fullWidth
                              helperText={touched.routeID && errors.routeID}
                              size="small"
                              name="routeID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={customerBulkUpload.routeID}
                              variant="outlined"
                              id="routeID"
                            >
                              <MenuItem value="0">--Select Routes--</MenuItem>
                              {generateDropDownMenu(routes)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink>Select File *</InputLabel>
                            <CSVReader
                              cssClass="react-csv-input"
                              onFileLoaded={handleForce}
                              parserOptions={papaparseOptions}
                              inputId="react-csv-reader-input"
                            />
                          </Grid>
                        </Grid>

                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            type="reset"
                            variant="outlined"
                            onClick={() => clearData()}
                            size="small"
                          >
                            Clear
                          </Button>
                        </Box>
                        {customerData.length > 0 &&
                          IsUploadingFinished === true ? (
                          <>
                            <Chip variant="outlined" style={{ color: "red" }} size="small" label={"Failed Records : " + ErrorCustomerCount.length} />
                          </>
                        ) : null}
                        <br />
                        <Box minWidth={1050}>
                          {customerData.length > 0 ? (
                            <MaterialTable
                              title="Multiple Actions Preview"
                              columns={[
                                {
                                  title: 'Customer Code',
                                  field: 'customerCode',
                                  render: rowData => {
                                    if (rowData.customerCode === "") {
                                      return (
                                        <div
                                          style={{
                                            backgroundColor: '#ffcdd2',
                                            padding: '10px',
                                            borderRadius: '5px'
                                          }}
                                        >
                                          <Tooltip
                                            title={'Customer Code is Required'}
                                          >
                                            <span>
                                              {'Customer Code is Required'}
                                            </span>
                                          </Tooltip>
                                        </div>
                                      );
                                    }
                                    else if (
                                      rowData.customerCode.length !=
                                      rowData.customerCode.length
                                    ) {
                                      return (
                                        <div
                                          style={{
                                            backgroundColor: '#ffcdd2',
                                            padding: '10px',
                                            borderRadius: '5px'
                                          }}
                                        >
                                          <Tooltip
                                            title={'Invalid Customer Code.'}
                                          >
                                            <span>
                                              {'Invalid Customer Code.'}
                                            </span>
                                          </Tooltip>
                                        </div>
                                      );
                                    } else {
                                      return rowData.customerCode;
                                    }
                                  }
                                },

                                {
                                  title: 'First Name',
                                  field: 'firstName',
                                  render: rowData => {
                                    if (rowData.firstName === "") {
                                      return (
                                        <div
                                          style={{
                                            backgroundColor: '#ffcdd2',
                                            padding: '10px',
                                            borderRadius: '5px'
                                          }}
                                        >
                                          <Tooltip title={'Name is Required'}>
                                            <span>{'Name is Required'}</span>
                                          </Tooltip>
                                        </div>
                                      );
                                    } else {
                                      return rowData.firstName;
                                    }
                                  }
                                },
                                {
                                  title: 'NIC',
                                  field: 'nic',
                                  render: rowData => {
                                    var result = customerData.filter(
                                      a => a.nic === rowData.nic
                                    );

                                    if (
                                      rowData.nic.length < 10 ||
                                      rowData.nic.length == 11 ||
                                      rowData.nic.length > 12
                                    ) {
                                      return (
                                        <div
                                          style={{
                                            backgroundColor: '#ffcdd2',
                                            padding: '10px',
                                            borderRadius: '5px'
                                          }}
                                        >
                                          <Tooltip title={'Invalid NIC.'}>
                                            <span>{'Invalid NIC.'}</span>
                                          </Tooltip>
                                        </div>
                                      );
                                    } else if (result.length > 1) {
                                      return (
                                        <div
                                          style={{
                                            backgroundColor: '#ffcdd2',
                                            padding: '10px',
                                            borderRadius: '5px'
                                          }}
                                        >
                                          <Tooltip title={'Duplicate NIC.'}>
                                            <span>{'Duplicate NIC.'}</span>
                                          </Tooltip>
                                        </div>
                                      );
                                    } else {
                                      return rowData.nic;
                                    }
                                  }
                                },
                                {
                                  title: 'Registration Number',
                                  field: 'registrationNumber',
                                  render: rowData => {
                                    var result = customerData.filter(
                                      a =>
                                        a.registrationNumber ===
                                        rowData.registrationNumber
                                    );
                                    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
                                    if (result.length > 1) {
                                      return (
                                        <div
                                          style={{
                                            backgroundColor: '#ffcdd2',
                                            padding: '10px',
                                            borderRadius: '5px'
                                          }}
                                        >
                                          <Tooltip
                                            title={
                                              'Duplicate Registration Number.'
                                            }
                                          >
                                            <span>
                                              {'Duplicate Registration Number.'}
                                            </span>
                                          </Tooltip>
                                        </div>
                                      );
                                    } else if (
                                      rowData.registrationNumber.length === 0 ||
                                      format.test(rowData.registrationNumber)
                                    ) {
                                      return (
                                        <div
                                          style={{
                                            backgroundColor: '#ffcdd2',
                                            padding: '10px',
                                            borderRadius: '5px'
                                          }}
                                        >
                                          <Tooltip
                                            title={
                                              'Invalid Registration Number.'
                                            }
                                          >
                                            <span>
                                              {'Invalid Registration Number.'}
                                            </span>
                                          </Tooltip>
                                        </div>
                                      );
                                    } else {
                                      return rowData.registrationNumber;
                                    }
                                  }
                                },
                                {
                                  title: 'Payment Type',
                                  field: 'paymentTypeID',
                                  render: rowData => {
                                    if (isNaN(rowData.paymentTypeID)) {
                                      return (
                                        <div
                                          style={{
                                            backgroundColor: '#ffcdd2',
                                            padding: '10px',
                                            borderRadius: '5px'
                                          }}
                                        >
                                          <Tooltip
                                            title={'Payment Type is Required.'}
                                          >
                                            <span>
                                              {'Payment Type is Required.'}
                                            </span>
                                          </Tooltip>
                                        </div>
                                      );
                                    }
                                    else if (
                                      rowData.paymentTypeID > 3 ||
                                      rowData.paymentTypeID == 0
                                    ) {
                                      return (
                                        <div
                                          style={{
                                            backgroundColor: '#ffcdd2',
                                            padding: '10px',
                                            borderRadius: '5px'
                                          }}
                                        >
                                          <Tooltip
                                            title={'Invalid Payment Type.'}
                                          >
                                            <span>
                                              {'Invalid Payment Type.'}
                                            </span>
                                          </Tooltip>
                                        </div>
                                      );
                                    } else {
                                      if (rowData.paymentTypeID == 1) {
                                        return (
                                          <div>
                                            <Tooltip title={'Account'}>
                                              <span>{'Account'}</span>
                                            </Tooltip>
                                          </div>
                                        );
                                      } else if (rowData.paymentTypeID == 2) {
                                        return (
                                          <div>
                                            <Tooltip title={'Cheque'}>
                                              <span>{'Cheque'}</span>
                                            </Tooltip>
                                          </div>
                                        );
                                      } else if (rowData.paymentTypeID == 3) {
                                        return (
                                          <div>
                                            <span>{'Cash'}</span>
                                          </div>
                                        );
                                      }
                                    }
                                  }
                                }
                              ]}
                              data={customerData}
                              options={{
                                exportButton: false,
                                showTitle: false,
                                headerStyle: {
                                  textAlign: 'left',
                                  height: '1%'
                                },
                                cellStyle: { textAlign: 'left' },
                                columnResizable: false,
                                actionsColumnIndex: -1,
                                pageSize: 10
                              }}
                              actions={[]}
                            />
                          ) : null}
                        </Box>
                        {customerData.length > 0 ? (
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              color="primary"
                              type="submit"
                              variant="contained"
                              onClick={() => trackPromise(clearForm())}
                            >
                              Upload
                            </Button>
                          </Box>
                        ) : null}
                      </CardContent>
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
}

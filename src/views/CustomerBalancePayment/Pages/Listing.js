import React, { useState, useEffect, } from 'react';
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
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import Autocomplete from '@material-ui/lab/Autocomplete';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import MaterialTable from "material-table";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { Formik } from 'formik';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
}));

const screenCode = 'CUSTOMERBALANCEPAYMENT'
export default function CustomerBalancePaymentListing() {
  const [title, setTitle] = useState("Cash/Cheque Customer Balance Payment")
  const classes = useStyles();
  const [balancePaymentData, setBalancePaymentData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [routes, setRoutes] = useState();
  const [customers, setCustomers] = useState();
  const [customerList, setCustomerList] = useState();
  const [isViewTable, setIsViewTable] = useState(true);
  const BalancePaymentEnum = Object.freeze({ "Pending": 1, "Execution_Started": 2, "Complete": 3, });
  const [selectedDate, handleDateChange] = useState(new Date());
  const [customerBalanceList, setCustomerBalanceList] = useState({
    groupID: '0',
    factoryID: '0',
    routeID: '0',
    customerID: '0',
    applicableMonth: '',
    registrationNumber: ''
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [customer, setCustomer] = useState(false);
  const navigate = useNavigate();
  let encrypted = "";

  const handleClickViewTemp = (customerBalancePaymentID) => {
    encrypted = btoa(customerBalancePaymentID.toString());
    navigate('/app/customerBalancePayment/viewPayment/' + encrypted);
  }

  useEffect(() => {
    trackPromise(
      getPermissions(),
      getGroupsForDropdown()
    );
  }, []);
  useEffect(() => {
    trackPromise(
      getFactoriesByGroupID(customerBalanceList.groupID),
    )
  }, [customerBalanceList.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesForDropDown(customerBalanceList.factoryID),
    )
  }, [customerBalanceList.factoryID]);

  useEffect(() => {
    if (customerBalanceList.groupID != 0 && customerBalanceList.factoryID != 0) {
      trackPromise(
        getCustomersListForDropDown(customerBalanceList.groupID, customerBalanceList.factoryID,
          customerBalanceList.routeID),
      )
    }

  }, [customerBalanceList.groupID, customerBalanceList.factoryID, customerBalanceList.routeID]);

  useEffect(() => {
    checkDisbursement();
  }, [selectedDate]);

  useEffect(() => {
      getCustomerBalancePaymentDetailsByRegistrationNumber(customerBalanceList.groupID, customerBalanceList.factoryID,
        customerBalanceList.routeID, selectedDate, customerBalanceList.customerID, customerBalanceList.registrationNumber)
  }, [customerBalanceList.registrationNumber]);

  useEffect(() => {
    if (customerBalanceList.customerID != 0) {
      trackPromise(
        getCustomerBalancePaymentDetailsByApplicable(customerBalanceList.groupID, customerBalanceList.factoryID, customerBalanceList.routeID, selectedDate, customerBalanceList.customerID, customerBalanceList.registrationNumber)
      );
    }
    else {
      trackPromise(
        getCustomerBalancePaymentDetailsByRegistrationNumber(customerBalanceList.groupID, customerBalanceList.factoryID,
          customerBalanceList.routeID, selectedDate, customerBalanceList.customerID, customerBalanceList.registrationNumber)
      );
    }
    checkDisbursement();
  }, [customerBalanceList.customerID]);


  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCUSTOMERBALANCEPAYMENT');

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

    setCustomerBalanceList({
      ...customerBalanceList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }
  async function getCustomerBalancePaymentDetailsByRegistrationNumber(groupID, factoryID, routeID, selectedDate, customerID, registrationNumber) {
    const customer = await services.getCustomerBalancePaymentDetailsByRegistrationNumber(groupID, factoryID, routeID, selectedDate.toLocaleString(), customerID, registrationNumber);
    setBalancePaymentData(customer);
  }

  async function getCustomerBalancePaymentDetailsByApplicable(groupID, factoryID, routeID, selectedDate, customerID, registrationNumber) {
    const customer = await services.getCustomerBalancePaymentDetailsByApplicable(groupID, factoryID, routeID, selectedDate.toLocaleString(), customerID, registrationNumber);
    setBalancePaymentData(customer);
  }

  async function getFactoriesByGroupID(groupID) {
    const fac = await services.getFactoriesByGroupID(groupID);
    setFactories(fac);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getRoutesForDropDown(factoryID) {
    const routeList = await services.getRoutesForDropDown(factoryID);
    setRoutes(routeList);
  }

  async function getCustomersListForDropDown(groupID, factoryID, routeID) {
    const customerL = await services.getCustomersListForDropDown(groupID, factoryID, routeID);
    setCustomerList(customerL);
  }

  function checkDisbursement() {
    if (customerBalanceList.customerID === '0') {
      setIsViewTable(true);
    }
    else {
      setIsViewTable(false);
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

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setCustomerBalanceList({
      ...customerBalanceList,
      groupID: parseInt(value),
      factoryID: 0,
    });
  }

  function handleFactoryChange(e) {
    const target = e.target;
    const value = target.value
    setCustomerBalanceList({
      ...customerBalanceList,
      factoryID: parseInt(value),
      routeID: 0
    });
  }

  function handleRouteChange(e) {
    const target = e.target;
    const value = target.value
    setCustomerBalanceList({
      ...customerBalanceList,
      routeID: parseInt(value),
      customerID: ''
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setCustomerBalanceList({
      ...customerBalanceList,
      [e.target.name]: value
    });
  }

  function handleSearchDropdownChange(data, e) {

    if (data === undefined || data === null) {
      setCustomerBalanceList({
        ...customerBalanceList,
        customerID: '0'
      });
      return;
    } else {
      var nameV = "customerID";
      var valueV = data["customerID"];

      setCustomerBalanceList({
        ...customerBalanceList,
        customerID: valueV.toString()
      });
    }

  }
  function clearData() {
    setCustomerBalanceList({
      ...customerBalanceList,
      groupID: customerBalanceList.groupID,
      factoryID: customerBalanceList.factoryID,
      routeID: '0',
      applicableMonth: '',
      registrationNumber: '',
      customerID: ''
    });
    setCustomer(true);
    setBalancePaymentData([]);

  }
  async function handleSearch() {
    const customer = await services.getCustomerBalancePaymentDetailsByApplicable(customerBalanceList.groupID, customerBalanceList.factoryID, customerBalanceList.routeID, selectedDate.toLocaleString(), customerBalanceList.customerID, customerBalanceList.registrationNumber);
    setBalancePaymentData(customer);
  }

  return (
    <Page
      className={classes.root}
      title="Cash/Cheque Customer Balance Payment"
    >
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: customerBalanceList.groupID,
            factoryID: customerBalanceList.factoryID,
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Group is required').min("1", 'Select a Group'),
              factoryID: Yup.number().required('Factory is required').min("1", 'Select a Factory'),
            })
          }
          onSubmit={() => trackPromise(handleSearch())}
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
                    title={title}
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent style={{ marginBottom: "2rem" }}>
                      <Grid container spacing={3}>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group  *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            name="groupID"
                            onChange={(e) => handleGroupChange(e)}
                            value={customerBalanceList.groupID}
                            variant="outlined"
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
                            fullWidth
                            size='small'
                            name="factoryID"
                            onChange={(e) => handleFactoryChange(e)}
                            value={customerBalanceList.factoryID}
                            variant="outlined"
                            id="factoryID"
                            InputProps={{
                              readOnly: !permissionList.isFactoryFilterEnabled,
                            }}
                          >
                            <MenuItem value="0">--Select Factory--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="routeID">
                            Route
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            name="routeID"
                            onChange={(e) => handleRouteChange(e)}
                            value={customerBalanceList.routeID}
                            variant="outlined"
                            id="routeID"
                          >
                            <MenuItem value="0">--Select Route--</MenuItem>
                            {generateDropDownMenu(routes)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="applicableMonth">
                            Applicable Month and Year
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              autoOk
                              fullWidth
                              size='small'
                              variant="inline"
                              openTo="month"
                              views={["year", "month"]}
                              id="date-picker-inline"
                              value={selectedDate}
                              onChange={(e) => {
                                handleDateChange(e)
                              }}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="customerID">
                            Customer
                          </InputLabel>
                          <Autocomplete
                            key={customer}
                            size='small'
                            id="customerID"
                            options={customerList}
                            getOptionLabel={(option) => option.firstName.toString()}
                            onChange={(e, value) => handleSearchDropdownChange(value, e)}
                            defaultValue={null}
                            renderInput={(params) =>
                              <TextField {...params}
                                variant="outlined"
                                name="customerID"
                                placeholder='--Select Customer--'
                                fullWidth
                                size='small'
                                value={customerBalanceList.customerID}
                                getOptionDisabled={true}
                              />
                            }
                          />
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="registrationNumber">
                            Registration Number
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="registrationNumber"
                            onChange={(e) => handleChange(e)}
                            value={customerBalanceList.registrationNumber}
                            variant="outlined"
                            id="registrationNumber"
                          >
                          </TextField>
                        </Grid>
                      </Grid>
                      <Box display="flex" flexDirection="row-reverse" p={2} >
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                        >
                          Search
                        </Button>
                        <div>&nbsp;</div>
                        <Button
                          color="primary"
                          type="reset"
                          variant="outlined"
                          onClick={() => clearData()}
                        >
                          Clear
                        </Button>
                      </Box>
                    </CardContent>
                    <Box minWidth={1000}>
                      <MaterialTable
                        title="Multiple Actions Preview"
                        columns={[
                          { title: 'Customer Name', field: 'customerName' },
                          { title: 'Applicable Month', field: 'applicableMonth' },
                          { title: 'Applicable Year', field: 'applicableYear' },
                          { title: 'Amount', field: 'amount' },
                          {
                            title: 'Payment Status', field: 'paymentStatus', lookup: {
                              1: 'Pending',
                              2: 'Issued',
                            }
                          },
                        ]}
                        data={balancePaymentData}
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
                            icon: () => <VisibilityIcon />,
                            tooltip: 'View',
                            onClick: (event, balancePaymentData) => handleClickViewTemp(balancePaymentData.customerBalancePaymentID)
                          }
                        ]}

                        components={{
                          Action: props => (
                            <Button
                              onClick={(event) => props.action.onClick(event, props.data)}
                              color="primary"
                              variant="contained"
                              style={{ textTransform: 'none' }}
                              size="small"
                            >
                              Pay
                            </Button>
                          ),
                        }}
                      />
                    </Box>
                  </PerfectScrollbar>
                </Card>
              </Box>
            </form>
          )}
        </Formik>
      </Container>
    </Page>
  );
};

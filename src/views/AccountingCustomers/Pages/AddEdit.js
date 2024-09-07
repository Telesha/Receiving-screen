import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, Grid, makeStyles, Container, Button, CardContent, Divider, CardHeader, Tabs, Tab, AppBar, MenuItem, InputLabel, TextField, Switch } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { TabPanel } from './tabPanel';
import { Payments } from './TabPages/Payments';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../utils/newLoader';
import { CustomerGeneral } from './TabPages/General';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';

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
  root1: {
    flexGrow: 4
  },
}));

const screenCode = 'ACCOUNTINGCUSTOMERS'
export default function AccountingCustomersAddEdit() {
  const [title, setTitle] = useState("Add Customer Details")
  const classes = useStyles();
  const [customerPaymentArray, setCustomerPaymentArray] = useState([]);
  const [customerGeneralArray, setCustomerGeneralArray] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/accountingCustomers/listing');
  }
  const alert = useAlert();
  const [value, setValue] = React.useState(0);
  const [btnDisable, setBtnDisable] = useState(false);
  const { customerID } = useParams();
  const [isUpdate, setIsUpdate] = useState(false);
  const [customer, setCustomer] = useState({
    groupID: '0',
    factoryID: '0',
    isActive: true
  });
  let decryptedID = 0;
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    decryptedID = atob(customerID.toString());
    if (decryptedID != 0) {
      setIsUpdate(true);
      setTitle("Edit Customers Details");
      trackPromise(getItemCustomersByCustomerID(decryptedID));
      trackPromise(getCustomerPaymentMethodsByFactoryItemCustomerID(decryptedID));
    }
  }, []);

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());

  }, [customer.groupID]);

  useEffect(() => {
    setGeneralValues();
  }, [customerGeneralArray]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWADDEDITACCOUNTINGCUSTOMERS');

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
    if (parseInt(atob(customerID.toString())) === 0) {
      setCustomer({
        ...customer,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
  }

  async function setGeneralValues() {
    if (Object.keys(customerGeneralArray).length > 0 && isUpdate) {
      setCustomer({
        ...customer,
        groupID: customerGeneralArray.groupID,
        factoryID: customerGeneralArray.factoryID,
        isActive: customerGeneralArray.isActive,
      });
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factoryList = await services.getFactoryByGroupID(customer.groupID);
    setFactories(factoryList);
  }

  async function getCustomerPaymentMethodsByFactoryItemCustomerID(customerID) {
    let responsePayment = await services.getCustomerPaymentMethodsByFactoryItemCustomerID(customerID);
    for (var i = 0; i < responsePayment.length; i++) {
      var newPaymentArray = customerPaymentArray;
      newPaymentArray.push(responsePayment[i]);
      setCustomerPaymentArray(newPaymentArray);
    }
  }

  async function getItemCustomersByCustomerID(customerID) {
    let customerGeneral = await services.getItemCustomersByCustomerID(customerID);
    setCustomerGeneralArray({ ...customerGeneral });
  }
  async function saveAccountingCustomer() {
    if
      (
      customerPaymentArray.length <= 0 || customerGeneralArray.length <= 0) {
      alert.error('Please fill all tabs');
    }
    else {
      if (!isUpdate) {
        let saveModel = {
          groupID: customer.groupID,
          factoryID: customer.factoryID,
          isActive: customer.isActive,
          customerName: customerGeneralArray.customerName,
          taxNumber: customerGeneralArray.taxNumber,
          address3: customerGeneralArray.address3,
          address1: customerGeneralArray.address1,
          address2: customerGeneralArray.address2,
          zipCode: customerGeneralArray.zipCode,
          country: customerGeneralArray.country,
          officePhoneNumber: customerGeneralArray.officePhoneNumber,
          mobile: customerGeneralArray.mobile,
          email: customerGeneralArray.email,
          isCreditCustomer: customerGeneralArray.isCreditCustomer,
          customerPaymentArray: customerPaymentArray,
          nicBRNumber: customerGeneralArray.nicBRNumber
        }
        let response = await services.saveAccountingCustomer(saveModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          setBtnDisable(true);
          navigate('/app/accountingCustomers/listing');
        }
        else {
          alert.error(response.message);
        }
      } else {
        let updateModel = {
          customerID: parseInt(atob(customerID.toString())),
          groupID: customer.groupID,
          factoryID: customer.factoryID,
          isActive: customer.isActive,
          customerName: customerGeneralArray.customerName,
          taxNumber: customerGeneralArray.taxNumber,
          address3: customerGeneralArray.address3,
          address1: customerGeneralArray.address1,
          address2: customerGeneralArray.address2,
          zipCode: customerGeneralArray.zipCode,
          country: customerGeneralArray.country,
          officePhoneNumber: customerGeneralArray.officePhoneNumber,
          mobile: customerGeneralArray.mobile,
          email: customerGeneralArray.email,
          isCreditcustomer: customerGeneralArray.isCreditcustomer,
          customerPaymentArray: customerPaymentArray,
          nicBRNumber: customerGeneralArray.nicBRNumber
        }

        let response = await services.updateFactoryItemCustomer(updateModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          setBtnDisable(true);
          navigate('/app/accountingCustomers/listing');
        }
        else {
          alert.error(response.message);
        }
      }
    }
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

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.name === 'isActive' ? target.checked : target.value;
    setCustomer({
      ...customer,
      [e.target.name]: value
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: customer.groupID,
              factoryID: customer.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min(1, 'Please select a group'),
                factoryID: Yup.number().required('Factory is required').min(1, 'Please select a factory'),
              })
            }
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
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
                              value={customer.groupID}
                              variant="outlined"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
                              }}
                              size='small'
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
                              onChange={(e) => handleChange1(e)}
                              value={customer.factoryID}
                              variant="outlined"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false,
                              }}
                              size='small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid className={classes.root1} item xs={12}>
                            <AppBar position="static">
                              <Tabs value={value} onChange={handleTabChange} variant={'fullWidth'} classes={{ indicator: classes.indicator }}
                                aria-label="simple tabs example" style={{ backgroundColor: "white" }}>
                                <Tab label="General Details" {...a11yProps(0)} style={{ color: "black" }} />
                                <Tab label="Payment Details" {...a11yProps(2)} style={{ color: "black" }} />
                              </Tabs>
                            </AppBar>
                            <TabPanel value={value} index={0} >
                              <CustomerGeneral customerGeneralArray={customerGeneralArray} setCustomerGeneralArray={setCustomerGeneralArray} isUpdate={isUpdate} />
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                              <Payments customerPaymentArray={customerPaymentArray} setCustomerPaymentArray={setCustomerPaymentArray} />
                            </TabPanel>
                          </Grid>
                        </Grid>

                        <Grid container spacing={0} >

                          <Grid item md={1} xs={12} style={{ marginLeft: '6rem' }}>
                            <Switch
                              checked={customer.isActive}
                              onChange={(e) => handleChange1(e)}
                              name="isActive"
                              size='small'
                            />
                          </Grid>
                          <Grid item md={1} xs={12} style={{ marginLeft: '-1rem', marginTop: '0.6rem' }}>
                            <InputLabel id="isActive">
                              Active
                            </InputLabel>
                          </Grid>
                        </Grid>
                        <Box display="flex" justifyContent="flex-end">
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            onClick={() => saveAccountingCustomer()}
                            style={{ marginTop: '-2rem' }}
                          >
                            {isUpdate ? "Update" : "Save"}
                          </Button>
                        </Box>
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
};

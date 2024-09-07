import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
  MenuItem,
  Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';

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
  multilineColor: {
    color: '#8A2BE2'
  }

}));

export default function AdvancePaymentRequestView(props) {
  const [title, setTitle] = useState("Add FactoryItem Adjustment");
  const [isView, setIsView] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [availableQuantity, setAvailableQuantity] = useState();
  const [groups, setGroups] = useState();
  const [routes, setRoutes] = useState();
  const [customers, setCustomers] = useState();
  const [registrationNumbers, setRegistrationNumbers] = useState();
  const ApprovalEnum = Object.freeze({ "Pending": 1, "Approve": 2, "Reject": 3, })
  const [paymentRequest, setPaymentRequest] = useState({
    groupID: '0',
    factoryID: '0',
    customerID: '0',
    requestedAmount: '',
    routeID: '0',
    isActive: true,
    registrationNumber: '',
    approvedAmount: ''

  });
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/advancePaymentRequest/listing');
  }
  const alert = useAlert();
  const { advancePaymentRequestID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    getPermissions();
    getGroupsForDropdown();
  }, []);

  useEffect(() => {
    decrypted = atob(advancePaymentRequestID.toString());
    if (decrypted != 0) {
      trackPromise(
        getAdvancePaymentRequestDetails(decrypted)
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown()
    );
  }, [paymentRequest.groupID]);

  useEffect(() => {
    trackPromise(
      getavailableQuantity()
    )
  }, [paymentRequest.customerID]);

  useEffect(() => {
    trackPromise(
      getRoutesForDropDown(),
    )
  }, [paymentRequest.factoryID]);

  useEffect(() => {
    trackPromise(
      getCustomersForDropDown()
    );
  }, [paymentRequest.routeID]);

  useEffect(() => {
    trackPromise(
      getRegistrationNumbersForDropDown()
    );
  }, [paymentRequest.customerID]);

  async function getRegistrationNumbersForDropDown() {
    const registrationNList = await services.getRegistrationNumbersForDropDown(paymentRequest.customerID);
    setRegistrationNumbers(registrationNList);
  }

  async function getCustomersForDropDown() {
    const customerList = await services.getCustomersForDropDown(paymentRequest.routeID);
    setCustomers(customerList);
  }

  async function getRoutesForDropDown() {
    const routeList = await services.getRoutesForDropDown(paymentRequest.factoryID);
    setRoutes(routeList);
  }

  async function getavailableQuantity() {
    const requestedAmount = await services.getavailableQuantity(paymentRequest.customerID);
    setAvailableQuantity(requestedAmount == null ? "" : requestedAmount.availableQuantity);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(paymentRequest.groupID);
    setFactories(factory);
  }

  async function getAdvancePaymentRequestDetails(advancePaymentRequestID) {
    let response = await services.getAdvancePaymentRequestDetails(advancePaymentRequestID);
    let data = response[0];
    setPaymentRequest(data);
    setIsView(true);
    setTitle("View Advance Payment");


  }
  async function getPermissions() {
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setPaymentRequest({
      ...paymentRequest,
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
              factoryID: paymentRequest.factoryID,
              groupID: paymentRequest.groupID,
              customerID: paymentRequest.customerID,
              routeID: paymentRequest.routeID,
              requestedAmount: paymentRequest.requestedAmount,
              isActive: paymentRequest.isActive,
              registrationNumber: paymentRequest.registrationNumber,
              approvedAmount: paymentRequest.approvedAmount

            }}
            validationSchema={
              Yup.object().shape({
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                customerID: Yup.number().required('Customer required').min("1", 'Customer required'),
                requestedAmount: Yup.string().required('Amount required').matches(/^[0-9\b]/, 'Only allow numbers'),
                routeID: Yup.number().required('Route required').min("1", 'Route required'),
              })
            }
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
                                value={values.groupID}
                                variant="outlined"
                                id="groupID"
                                InputProps={{
                                  readOnly: isView ? true : false,
                                  disableUnderline: isView ? true : false,
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
                                onChange={(e) => handleChange1(e)}
                                value={values.factoryID}
                                variant="outlined"
                                id="factoryID"
                                InputProps={{
                                  readOnly: isView ? true : false,
                                  disableUnderline: isView ? true : false,
                                }}
                              >
                                <MenuItem value="0">--Select Factory--</MenuItem>
                                {generateDropDownMenu(factories)}
                              </TextField>
                            </Grid>

                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="factoryID">
                                Route *
                            </InputLabel>
                              <TextField select
                                error={Boolean(touched.routeID && errors.routeID)}
                                fullWidth
                                helperText={touched.routeID && errors.routeID}
                                name="routeID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={values.routeID}
                                variant="outlined"
                                id="routeID"
                                InputProps={{
                                  readOnly: isView ? true : false,
                                  disableUnderline: isView ? true : false,
                                }}
                              >
                                <MenuItem value="0">--Select Route--</MenuItem>
                                {generateDropDownMenu(routes)}
                              </TextField>
                            </Grid>
                          </Grid>
                          <CardHeader style={{ marginLeft: '-1rem', marginTop: '1rem' }} titleTypographyProps={{ variant: 'h6' }}
                            title="Customer Account Details"
                          />
                          <Grid container spacing={3}>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="customerID">
                                Customer *
                            </InputLabel>
                              <TextField select
                                error={Boolean(touched.customerID && errors.customerID)}
                                fullWidth
                                helperText={touched.customerID && errors.customerID}
                                name="customerID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={values.customerID}
                                variant="outlined"
                                id="customerID"
                                InputProps={{
                                  readOnly: isView ? true : false,
                                  disableUnderline: isView ? true : false,
                                }}
                              >
                                <MenuItem value="0">--Select Customer--</MenuItem>
                                {generateDropDownMenu(customers)}
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="registrationNumber">
                                Registration Number *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                                fullWidth
                                helperText={touched.registrationNumber && errors.registrationNumber}
                                name="registrationNumber"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={values.registrationNumber}
                                variant="outlined"
                                id="registrationNumber"
                                InputProps={{
                                  readOnly: isView ? true : false,
                                  disableUnderline: isView ? true : false,
                                }}
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="requestedAmount">
                                Requested Amount *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.requestedAmount && errors.requestedAmount)}
                                fullWidth
                                helperText={touched.requestedAmount && errors.requestedAmount}
                                name="requestedAmount"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={values.requestedAmount}
                                variant="outlined"
                                InputProps={{
                                  readOnly: isView ? true : false,
                                  disableUnderline: isView ? true : false,
                                }}
                              />
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="approvedAmount">
                                Approved Amount *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.approvedAmount && errors.approvedAmount)}
                                fullWidth
                                helperText={touched.approvedAmount && errors.approvedAmount}
                                name="approvedAmount"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={values.approvedAmount}
                                variant="outlined"
                                InputProps={{
                                  readOnly: isView ? true : false,
                                  disableUnderline: isView ? true : false,
                                }}
                              />
                            </Grid>
                          </Grid>
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

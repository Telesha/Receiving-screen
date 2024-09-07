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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import Autocomplete from '@material-ui/lab/Autocomplete';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  TextManagement: {
    fontSize: "20px",
    fontStyle: "bold"
  },
  TextManagementCollection: {
    fontSize: "15px"
  }
}));

export default function CustomerBalancePaymentAddEdit(props) {
  const [title, setTitle] = useState("Add Route")
  const [isView, setIsView] = useState(false);
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [groups, setGroups] = useState();
  const [routes, setRoutes] = useState();
  const [customerList, setCustomerList] = useState();
  const [customers, setCustomers] = useState();
  const [balancePayment, setBalancePayment] = useState([]);
  const [collectionTypeDetails, setCollectionTypeDetails] = useState([]);
  const [customerAccountID, setCustomerAccountID] = useState();
  const [totalAmount, setTotalAmount] = useState();
  const [collectionTypeTotal, setCollectionTypeTotal] = useState();
  const [leafTotal, setLeafTotal] = useState();
  const [advancePaymentDetails, setAdvancePaymentDetails] = useState([]);
  const TransactionTypeEnum = Object.freeze({"Leaf": 1, "Advance_Payment": 2,"Factory_Item": 3, "Advance_Payment_Return": 4, "Balance_Credit": 5, "Balance_Payment": 6, "Transport_Rate": 7});
  const BalancePaymentEnum = Object.freeze({ "Pending": 1, "Execution_Started": 2, "Complete": 3, });
  const EntryTypeEnum = Object.freeze({ "Cr": 1, "Dr": 2 });
  const CollectionTypeEnum = Object.freeze({ "SuperLeaf": 2, "NormalLeaf": 3 });
  const [customerBalancePayment, setCustomerBalancePayment] = useState({

    factoryID: '0',
    groupID: '0',
    routeID: '0',
    customerID: '0',
    applicableMonth: '',
    applicableYear: '',
    isActive: true,
  });

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/customerBalancePayment/listing');
  }
  const { customerBalancePaymentID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    getPermissions();
    getGroupsForDropdown();
  }, []);

  useEffect(() => {
    decrypted = atob(customerBalancePaymentID.toString());
    if (decrypted != 0) {
      trackPromise(
        getCustomerBalancePaymentDetails(decrypted),
        getbalancePaymentDetails(decrypted),
        getCollectionTypeDetails(decrypted),
        getAdvancePaymentDetails(decrypted)
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown(),
    );
  }, [customerBalancePayment.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesForDropDown()
    )
  }, [customerBalancePayment.factoryID]);

  useEffect(() => {
    trackPromise(
      getCustomersForDropDown(),
      getCustomersListForDropDown(),
     
    );
  }, [customerBalancePayment.routeID]);

  useEffect(() => {
      calculateTotalAmount();
  }, [balancePayment]);

  useEffect(() => {
    calculateLeafTotal();
    calculateCollectionTypeTotal();
}, [collectionTypeDetails]);

  async function getAdvancePaymentDetails(customerBalancePaymentID) {
    let advancepay = await services.getAdvancePaymentDetails(customerBalancePaymentID);
    setAdvancePaymentDetails(advancepay);
  }

  async function getCollectionTypeDetails(customerBalancePaymentID) {
    let collectionDetails = await services.getCollectionTypeDetails(customerBalancePaymentID);
    setCollectionTypeDetails(collectionDetails);
  }

  async function getbalancePaymentDetails(customerBalancePaymentID) {
    let balancePaymentLi = await services.getbalancePaymentDetails(customerBalancePaymentID);
    setBalancePayment(balancePaymentLi);
  }

  async function getCustomersListForDropDown() {
    const customerL = await services.getCustomersListForDropDown(customerBalancePayment.routeID);
    setCustomerList(customerL);
  }

  async function getCustomersForDropDown() {
    const customerList = await services.getCustomersForDropDown(customerBalancePayment.routeID);
    setCustomers(customerList);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getAllFactories();
    setFactories(factory);
  }

  async function getRoutesForDropDown() {
    const routeList = await services.getRoutesForDropDown(customerBalancePayment.factoryID);
    setRoutes(routeList);
  }

  async function getCustomerBalancePaymentDetails(customerBalancePaymentID) {
    let response = await services.getCustomerBalancePaymentDetailsByID(customerBalancePaymentID);
    let data = response[0];
    setTitle("View Customer Balance Payment");
    setCustomerBalancePayment(data);
    setIsView(true);
    setCustomerAccountID(data.customerAccountID);
  }
  async function getPermissions() {
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
    const value = target.value
    setCustomerBalancePayment({
      ...customerBalancePayment,
      [e.target.name]: value
    });
  }

  function handleSearchDropdownChange(data) {
    if (data === undefined || data === null)
      return;
    var nameV = "customerID";
    var valueV = data["customerID"];

    setCustomerBalancePayment({
      ...customerBalancePayment,
      customerID: valueV.toString()
    });
  }

  function chechStatus(data) {
    if (data == BalancePaymentEnum.Pending) {
      return "Pending";
    }
    else if (data == BalancePaymentEnum.Execution_Started) {
      return "Execution Start";
    }
    else if (data == BalancePaymentEnum.Complete) {
      return "Complete";
    }
    else {
      return null;
    }
  }

  function checkTransactionType(data) {
    if (data == TransactionTypeEnum.Leaf) {
      return "Leaf";
    }
    else if (data == TransactionTypeEnum.Advance_Payment) {
      return "Advance Payment";
    }
    else if (data == TransactionTypeEnum.Advance_Payment_Return) {
      return "Advance Payment Return";
    }
    else if (data == TransactionTypeEnum.Balance_Credit) {
      return "Balance Credit";
    }
    else if (data == TransactionTypeEnum.Transport_Rate) {
      return "Transaport Rate";
    }
    else if (data == TransactionTypeEnum.Factory_Item) {
      return "Factory Item";
    }
    else if (data == TransactionTypeEnum.Balance_Payment) {
      return "Balance Payment";
    }
    else {
      return null;
    }
  }

  function checkEntryType(data) {
    if (data == EntryTypeEnum.Cr) {
      return "Cr";
    }
    else if (data == EntryTypeEnum.Dr) {
      return "Dr";
    }
    else {
      return null;
    }
  }

  function checkCollectionType(data) {
    if (data == CollectionTypeEnum.SuperLeaf) {
      return "Super Leaf";
    }
    else if (data == CollectionTypeEnum.NormalLeaf) {
      return "Normal Leaf";
    }
  }

  function calculateTotalAmount() {
    var total = 0;
    balancePayment.forEach(element => {
      total = total + element.customerTransactionAmount;
    });
    setTotalAmount(total);
  }

  function calculateLeafTotal() {
    var total = 0;
    collectionTypeDetails.forEach(element => {
      total = total + element.cropAmount;
    });
    setLeafTotal(total);
  }

  function calculateCollectionTypeTotal() {
    var total = 0;
    collectionTypeDetails.forEach(element => {
      total = total + (element.cropAmount * element.rate);
    });
    setCollectionTypeTotal(total);
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>

          <PageHeader
            onClick={handleClick}
          />
          <Formik
            initialValues={{
              groupID: customerBalancePayment.groupID,
              factoryID: customerBalancePayment.factoryID,
              routeID: customerBalancePayment.routeID,
              customerID: customerBalancePayment.customerID,
              applicableMonth: customerBalancePayment.applicableMonth,
              applicableYear: customerBalancePayment.applicableYear,
              isActive: customerBalancePayment.isActive,

            }}
            validationSchema={
              Yup.object().shape({

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
                  <Box mt={3}>
                    <Card>
                      <CardHeader
                        title={title}
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
                                size='small'
                                name="groupID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={customerBalancePayment.groupID}
                                id="groupID"
                                InputProps={{
                                  readOnly: isView ? true : false,
                                  disableUnderline: isView ? true : false,
                                  textAlign: 'center',
                                  alignContent: 'center',
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
                                size='small'
                                name="factoryID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={customerBalancePayment.factoryID}
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
                                onChange={(e) => handleChange1(e)}
                                value={customerBalancePayment.routeID}
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
                          <CardHeader style={{ marginLeft: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                            title="Customer Account Details"
                          />
                          <Grid container spacing={3}>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="customerID">
                                Customer *
                              </InputLabel>
                              {isView == false ?
                                <Autocomplete
                                  id="customerID"
                                  options={customerList}
                                  getOptionLabel={(option) => option.firstName.toString()}
                                  onChange={(e, value) => handleSearchDropdownChange(value)}
                                  renderInput={(params) =>
                                    <TextField {...params}
                                      variant="outlined"
                                      name="customerID"
                                      size='small'
                                      onBlur={handleBlur}
                                      helperText={touched.customerID && errors.customerID}
                                      fullWidth
                                      error={Boolean(touched.customerID && errors.customerID)}
                                      value={customerBalancePayment.customerID}
                                      getOptionDisabled={true}
                                    />
                                  }
                                /> :
                                <TextField select
                                  error={Boolean(touched.customerID && errors.customerID)}
                                  fullWidth
                                  helperText={touched.customerID && errors.customerID}
                                  size='small'
                                  name="customerID"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange1(e)}
                                  value={customerBalancePayment.customerID}
                                  id="customerID"
                                  InputProps={{
                                    readOnly: isView ? true : false,
                                    disableUnderline: isView ? true : false,
                                  }}
                                >
                                  <MenuItem value="0">--Select Customer--</MenuItem>
                                  {generateDropDownMenu(customers)}
                                </TextField>
                              }
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="applicableMonth">
                                Applicable Month *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.applicableMonth && errors.applicableMonth)}
                                fullWidth
                                helperText={touched.applicableMonth && errors.applicableMonth}
                                size='small'
                                name="applicableMonth"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={customerBalancePayment.applicableMonth}
                                id="applicableMonth"
                                InputProps={{
                                  readOnly: isView ? true : false,
                                  disableUnderline: isView ? true : false,
                                }}
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="applicableYear">
                                Applicable Year *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.applicableYear && errors.applicableYear)}
                                fullWidth
                                size='small'
                                helperText={touched.applicableYear && errors.applicableYear}
                                name="applicableYear"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={customerBalancePayment.applicableYear}
                                id="applicableYear"
                                InputProps={{
                                  readOnly: isView ? true : false,
                                  disableUnderline: isView ? true : false,
                                }}
                              >
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="amount">
                                Balance *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.amount && errors.amount)}
                                fullWidth
                                size='small'
                                helperText={touched.amount && errors.amount}
                                name="amount"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={customerBalancePayment.amount}
                                id="amount"
                                InputProps={{
                                  readOnly: isView ? true : false,
                                  disableUnderline: isView ? true : false,
                                }}
                              >
                              </TextField>
                            </Grid>
                          </Grid>
                          <Divider style={{ marginTop: "1rem" }} />
                          <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                              <CardHeader style={{ marginLeft: '8rem' }} titleTypographyProps={{ variant: 'h6' }}
                                title="Collection Type Details"
                              />
                              <Box maxWidth={550}>
                                {collectionTypeDetails.length > 0 ?
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>
                                          Collection Type
                                        </TableCell>
                                        <TableCell>
                                          Amount(Kg)
                                        </TableCell>
                                        <TableCell>
                                          Rate(Rs)
                                        </TableCell>
                                        <TableCell>
                                          Total(Rs)
                                        </TableCell>
                                        <TableCell>
                                          Created Date
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {collectionTypeDetails.map((data) => (
                                        <TableRow>
                                          <TableCell>
                                            {checkCollectionType(data.collectionTypeID)}
                                          </TableCell>
                                          <TableCell>
                                            {data.cropAmount}
                                          </TableCell>
                                          <TableCell>
                                            {data.rate}
                                          </TableCell>
                                          <TableCell>
                                            {data.rate * data.cropAmount}
                                          </TableCell>
                                          <TableCell>
                                            {data.createdDate.split("T")[0]}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table> : null}
                              </Box>
                              <Divider orientation="horizontal" light="false" variant="inset" />
                              <Box display="flex" justifyContent="left" >
                                <InputLabel className={classes.TextManagementCollection}
                                  style={{ marginTop: "0.5rem", marginLeft: "1rem" }}>Leaf Amount</InputLabel>
                                <TextField
                                  name="balance"
                                  onChange={handleChange}
                                  value={leafTotal}
                                  InputProps={{
                                    readOnly: isView ? true : false,
                                    disableUnderline: true,
                                  }}
                                  style={{ marginLeft: "3rem" }}
                                  className={classes.TextManagement}
                                />
                                <InputLabel className={classes.TextManagementCollection}
                                  style={{ marginTop: "0.5rem" }}> Total Balance</InputLabel>
                                <TextField
                                  name="balance"
                                  onChange={handleChange}
                                  value={collectionTypeTotal}
                                  InputProps={{
                                    readOnly: isView ? true : false,
                                    disableUnderline: true,
                                  }}
                                  style={{ marginLeft: "5rem" }}
                                  className={classes.TextManagement}
                                />
                              </Box>
                            </Grid>
                            <Grid item md={6} xs={12}>
                              <CardHeader style={{ marginLeft: '8rem' }} titleTypographyProps={{ variant: 'h6' }}
                                title="Advance Details"
                              />
                              <Box maxWidth={550}>
                                {advancePaymentDetails.length > 0 ?
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>
                                          Amount(Rs)
                                        </TableCell>
                                        <TableCell>
                                          Created Date
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {advancePaymentDetails.map((data) => (
                                        <TableRow>
                                          <TableCell>
                                            {data.advanceAmount}
                                          </TableCell>
                                          <TableCell>
                                            {data.createdDate.split("T")[0]}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table> : null}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                        <Box minWidth={1050}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>
                                  Transaction Type
                                </TableCell>
                                <TableCell>
                                  Entry Type
                                </TableCell>
                                <TableCell>
                                  Amount
                                </TableCell>
                                <TableCell>
                                  Payment Status
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {balancePayment.map((data) => (
                                <TableRow>
                                  <TableCell>
                                    {checkTransactionType(data.transactionTypeID)}
                                  </TableCell>
                                  <TableCell>
                                    {checkEntryType(data.entryType)}
                                  </TableCell>
                                  <TableCell>
                                    {data.customerTransactionAmount}
                                  </TableCell>
                                  <TableCell>
                                    {chechStatus(data.paymentStatus)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                        <Box display="flex" justifyContent="left" >
                          <InputLabel className={classes.TextManagement} style={{ marginTop: "0.5rem",marginLeft:"1rem" }}>Total Amount</InputLabel>
                          <TextField

                            name="balance"
                            onChange={handleChange}
                            value={totalAmount}
                            InputProps={{
                              readOnly: isView ? true : false,
                              disableUnderline: true,

                            }}
                            style={{ marginLeft: "36rem" }}
                            className={classes.TextManagement}
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
    </Fragment>
  );
};

import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Collapse, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { useAlert } from "react-alert";
import Autocomplete from '@material-ui/lab/Autocomplete';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  root1: {
    height: 180,
  },
  container: {
    display: 'flex',
  },
  paper: {
    margin: theme.spacing(1),
    display: 'inline-block',
    backgroundColor: 'white',
    width: 1000
  },
  svg: {
    width: 'fullWidth',
    height: 100,
  },
  polygon: {
    fill: theme.palette.common.white,
    stroke: theme.palette.divider,
    strokeWidth: 1,
  },
  table: {
    minWidth: 150,
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  }
}));

export function EmployeePayments({ paymentMethodArray, setPaymentMethodArray, setIsMainButtonEnable }) {
  const classes = useStyles();
  const [payment, setPayment] = useState({
    paymentTypeID: '0',
    bankID: '0',
    branchID: '0',
    accountNumber: '',
    accountHolderName: ''
  });
  const [banks, setBanks] = useState();
  const [branches, setBranches] = useState();
  const [branchList, setBranchList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [employeePaymentMethodID, setEmployeePaymentMethodID] = useState(0);
  const alert = useAlert();

  useEffect(() => {
    trackPromise(getBanksForDropdown(),
      trackPromise(branchService()),
      trackPromise(getEmployeePaymentDetailsByEmployeeID()));
  }, []);

  useEffect(() => {
    trackPromise(getBranchesForDropdown())
  }, [payment.bankID]);

  useEffect(() => {
    checkDisbursement();
  }, [payment.paymentTypeID]);

  function checkDisbursement() {
    if (isEdit && payment.paymentTypeID != 1) {
      setPayment({
        ...payment,
        bankID: '0',
        branchID: '0',
        accountNumber: '',
        accountHolderName: ''
      });
    }
  }

  async function getBanksForDropdown() {
    const bank = await services.getBanksForTable();
    setBanks(bank);
    const tableBank = await services.getBanksForDropdown();
    setBankList(tableBank);
  }

  async function getBranchesForDropdown() {
    const branch = await services.getBranchesByBankIDForTable(parseInt(payment.bankID));
    setBranches(branch);
  }

  async function getEmployeePaymentDetailsByEmployeeID() {
    const response = await services.getEmployeePaymentDetailsByEmployeeID();
  }

  async function savePaymentMethods(values) {   
    if (paymentMethodArray.length <= 0 || values.paymentTypeID > 0) {
      setIsEdit(false);
      let paymentDetails = {
        paymentTypeID: parseInt(values.paymentTypeID),
        bankID: values.bankID === undefined ? null : parseInt(values.bankID),
        branchID: values.branchID === undefined ? null : parseInt(values.branchID),
        accountNumber: values.accountNumber === undefined ? null : values.accountNumber,
        employeePaymentMethodID: employeePaymentMethodID,
        accountHolderName: values.accountHolderName,
        status: 1
      };     
      setPaymentMethodArray(paymentMethodArray => [...paymentMethodArray, paymentDetails]);
      setPayment({
        ...payment, paymentTypeID: '0', bankID: '0', branchID: '0', accountNumber: '', accountHolderName: ''
      });
      alert.success("Payment method added.");
      setIsMainButtonEnable(true);
    }
    else {
      alert.error('Allow only 1 payment method');
      return;
    }
  }

  function DeleteItem(index) {
    setIsEdit(true);
    var element = paymentMethodArray[index];
    if (element > 0) {
      alert.error('Error occured in item delete');
    }
    else {
      alert.success('Payment Method Deleted Successfully');
      setEmployeePaymentMethodID(element.employeePaymentMethodID);
    }
    paymentMethodArray.splice(index, 1);
  }

  async function branchService() {
    const branches = await services.getAllBranches();
    setBranchList(branches);
  }

  function settingPaymentType(data) {
    if (data == 1) {
      return 'Account';
    }
    else if (data == 2) {
      return 'Cheque';
    }
    else {
      return 'Cash';
    }
  }

  function settingBranches(data) {
    if (data == 0 || data == undefined) {
      return '---';
    } else {
      let branch = branchList.filter((branch => branch.branchID == parseInt(data)));
      var branchName = branch.map(branch => branch.branchName);
      return branchName;
    }
  }

  function settingBanks(data) {
    if (data == 0 || data == undefined) {
      return '---';
    }
    else {
      let bank = bankList.filter((item, index) => index == data);
      return bank;
    }
  }

  function settingAccountNumber(data) {
    if (data == undefined || data == null || data == "") {
      return '---';
    }
    else {
      return data;
    }
  }

  function handleSearchDropdownChange(data, e) {
    if (data === undefined || data === null) {
      setPayment({
        ...payment,
        branchID: '0'
      });
      return;
    } else {
      var nameV = "branchID";
      var valueV = data["branchID"];
      setPayment({
        ...payment,
        branchID: valueV.toString()
      });
    }
  }

  function handleChangePaymentMethod(e) {
    const target = e.target;
    const value = target.value;
    setPayment({
      ...payment,
      [e.target.name]: value
    });
  }

  function handleSearchDropdownChangeBank(data, e) {
    if (data === undefined || data === null) {
      setPayment({
        ...payment,
        bankID: '0',
        branchID: '0'
      });
      return;
    } else {
      var nameV = "bankID";
      var valueV = data["bankID"];
      setPayment({
        ...payment,
        bankID: valueV.toString(),
        branchID: ''
      });
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Employee Payment Methods Add Edit">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              paymentTypeID: payment.paymentTypeID,
              bankID: payment.bankID,
              branchID: payment.branchID,
              accountNumber: payment.accountNumber,
              accountHolderName: payment.accountHolderName
            }}
            validationSchema={
              Yup.object().shape({
                paymentTypeID: Yup.number().max(255).required('Payment type is required').min("1", 'Select a payment type'),
                bankID: Yup.number().when("paymentTypeID",
                  {
                    is: val => val === 1,
                    then: Yup.number().min('1', 'Select a bank'),
                  }),
                branchID: Yup.number().when("bankID",
                  {
                    is: val => val > 0,
                    then: Yup.number().min('1', 'Select a branch'),
                  }),
                accountNumber: Yup.string().when("branchID",
                  {
                    is: val => val > 0,
                    then: Yup.string().required('Please enter account number').matches(/^[0-9\b]+$/, 'Only allow numbers'),
                  }),
                accountHolderName: Yup.string().when("branchID",
                  {
                    is: val => val > 0,
                    then: Yup.string().max(75, "Account holder name must be at most 75 characters")
                      .required('Please enter account holder name').matches(/^[aA-zZ\s\.]+$/, "Only alphabets are allowed for this field"),
                  }),
              })
            }
            onSubmit={(event) => trackPromise(savePaymentMethods(event))}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              isSubmitting,
              touched,
              values,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={3}>
                  <Card className={classes.cardContent}>
                    <CardHeader
                      title="Payment Method"
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="paymentTypeID">
                              Payment Type *
                            </InputLabel>
                            <TextField select fullWidth
                              error={Boolean(touched.paymentTypeID && errors.paymentTypeID)}
                              helperText={touched.paymentTypeID && errors.paymentTypeID}
                              size='small'
                              onBlur={handleBlur}
                              id="paymentTypeID"
                              name="paymentTypeID"
                              value={payment.paymentTypeID}
                              type="text"
                              variant="outlined"
                              onChange={(e) => handleChangePaymentMethod(e)}>
                              <MenuItem value="0">--Select Payment Type--</MenuItem>
                              <MenuItem value="1">Account</MenuItem>
                              <MenuItem value="2">Cheque</MenuItem>
                              <MenuItem value="3">Cash</MenuItem>
                            </TextField>
                          </Grid>
                          {payment.paymentTypeID == 1 ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="bankID">
                                Bank *
                              </InputLabel>
                              <Autocomplete
                                id="bankID"
                                options={banks}
                                getOptionLabel={(option) => option.bankName.toString()}
                                onChange={(e, value) => handleSearchDropdownChangeBank(value, e)}
                                defaultValue={null}
                                key={isSubmitting}
                                renderInput={(params) =>
                                  <TextField {...params}
                                    variant="outlined"
                                    name="bankID"
                                    fullWidth
                                    size='small'
                                    value={payment.bankID}
                                    getOptionDisabled={true}
                                    helperText={touched.bankID && errors.bankID}
                                    onBlur={handleBlur}
                                    error={Boolean(touched.bankID && errors.bankID)}
                                    disabled={(payment.paymentTypeID != 1 ? true : false)}
                                  />
                                }
                              />
                            </Grid>
                            : null}
                          {payment.paymentTypeID == 1 ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="branchID">
                                Branch *
                              </InputLabel>
                              <Autocomplete
                                id="branchID"
                                options={branches}
                                getOptionLabel={(option) => option.branchName.toString()}
                                onChange={(e, value) => handleSearchDropdownChange(value, e)}
                                defaultValue={null}
                                key={payment.bankID}
                                renderInput={(params) =>
                                  <TextField {...params}
                                    variant="outlined"
                                    name="branchID"
                                    fullWidth
                                    size='small'
                                    value={payment.branchID}
                                    getOptionDisabled={true}
                                    error={Boolean(touched.branchID && errors.branchID)}
                                    helperText={touched.branchID && errors.branchID}
                                    onBlur={handleBlur}
                                    disabled={(payment.paymentTypeID != 1 ? true : false)}
                                  />
                                }
                              />
                            </Grid>
                            : null}
                        </Grid>
                        <Grid container spacing={3}>
                          {payment.paymentTypeID == 1 ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="accountNumber">
                                Account Number *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.accountNumber && errors.accountNumber)}
                                fullWidth
                                helperText={touched.accountNumber && errors.accountNumber}
                                size='small'
                                name="accountNumber"
                                onBlur={handleBlur}
                                onChange={(e) => handleChangePaymentMethod(e)}
                                value={payment.accountNumber}
                                variant="outlined"
                                disabled={(payment.paymentTypeID != 1 ? true : false)}
                              />
                            </Grid>
                            : null}
                          {payment.paymentTypeID == 1 ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="accountHolderName">
                                Account Holder Name *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.accountHolderName && errors.accountHolderName)}
                                fullWidth
                                helperText={touched.accountHolderName && errors.accountHolderName}
                                size='small'
                                name="accountHolderName"
                                onBlur={handleBlur}
                                onChange={(e) => handleChangePaymentMethod(e)}
                                value={payment.accountHolderName}
                                variant="outlined"
                                disabled={(payment.paymentTypeID != 1 ? true : false)}
                              />
                            </Grid>
                            : null}
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          disabled={isSubmitting || (paymentMethodArray.length <= 0) ? false : true}
                          variant="contained"
                        >
                          Add
                        </Button>
                      </Box>
                      <Divider />
                      <CardContent>
                        <Grid item md={12} xs={12}>
                          <Grid className={classes.container}>
                            <Collapse in={true}>
                              <Paper elevation={0} className={classes.paper}>
                                <Grid container spacing={2}>
                                  {(paymentMethodArray.length > 0) ?
                                    <Grid item xs={12}>
                                      <TableContainer >
                                        <Table className={classes.table} aria-label="caption table">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>Payment Type</TableCell>
                                              <TableCell>Bank</TableCell>
                                              <TableCell>Branch</TableCell>
                                              <TableCell>Account Number</TableCell>
                                              <TableCell>Account Holder name</TableCell>
                                              <TableCell >Actions</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {paymentMethodArray.map((rowData, index) => (
                                              <TableRow key={index}>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {settingPaymentType(rowData.paymentTypeID)}
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {settingBanks(rowData.bankID)}
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {settingBranches(rowData.branchID)}
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {settingAccountNumber(rowData.accountNumber)}
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {settingAccountNumber(rowData.accountHolderName)}
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  <DeleteIcon
                                                    style={{
                                                      color: "red",
                                                      marginBottom: "-1rem",
                                                      marginTop: "0rem",
                                                      cursor: "pointer"
                                                    }}
                                                    size="small"
                                                    onClick={() => DeleteItem(index)}
                                                  >
                                                  </DeleteIcon>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    </Grid>
                                    : null}
                                </Grid>
                              </Paper>
                            </Collapse>
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

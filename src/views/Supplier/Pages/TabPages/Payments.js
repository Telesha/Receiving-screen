import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import MenuItem from '@material-ui/core/MenuItem';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { useAlert } from "react-alert";
import DeleteIcon from '@material-ui/icons/Delete';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { AlertDialogWithoutButton } from '../../../Common/AlertDialogWithoutButton';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  container: {
    display: 'flex',
  },
}));

export function Payments({ paymentArray, setPaymentArray }) {
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
  const [tableIndex, setTableIndex] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [dialogbox, setDialogbox] = useState(false);
  const [customerPaymentMethodID, setCustomerPaymentMethodID] = useState();
  const alert = useAlert();

  useEffect(() => {
    trackPromise(
      getBanksForDropdown());
    trackPromise(
      setPaymentValues());
    trackPromise(branchService());
  }, []);

  useEffect(() => {
    getBranchesForDropdown()
  }, [payment.bankID]);

  useEffect(() => {
    checkDisbursement();
  }, [payment.paymentTypeID]);

  function checkDisbursement() {
    if (isEdit && payment.paymentTypeID !== '1') {
      setPayment({
        ...payment,
        bankID: '0',
        branchID: '0',
        accountNumber: '',
        accountHolderName: ''
      });
    }
  }

  async function setPaymentValues() {
    if (Object.keys(paymentArray).length > 0) {
      setCustomerPaymentMethodID(paymentArray[0].customerPaymentMethodID);
    }
  }

   async function getBanksForDropdown() {
     const bank = await services.getBanksForTable();
     setBanks(bank);
     const tableBank = await services.getBanksForDropdown();
     setBankList(tableBank);
   }

  async function getBranchesForDropdown() {
    const Branches = await services.getBranchesByBankIDForTable(payment.bankID);
    setBranches(Branches);
  }

  async function savePaymentMethods(values) {

    setIsEdit(false);
    var paymentDetails = paymentArray;

    let items = paymentArray.filter((x => x.paymentTypeID == parseInt(values.paymentTypeID)));
    var duplicate = items.map(x => x.paymentTypeID);

    if (duplicate.length > 0) {
      alert.error("Payment type already exists");
    } else {
      paymentDetails.push({
        paymentTypeID: parseInt(values.paymentTypeID), bankID: payment.bankID === undefined ? null : parseInt(payment.bankID),
        branchID: payment.branchID === undefined ? null : parseInt(payment.branchID), accountNumber: values.accountNumber === undefined ? null : values.accountNumber,
        accountHolderName: values.accountHolderName === undefined ? null : values.accountHolderName
      });
      setPaymentArray(paymentDetails);
      alert.success('Payment type added successfully');
      setPayment({
        ...payment, paymentTypeID: '0', bankID: '0', branchID: '0', accountNumber: '', accountHolderName: ''
      });
    }
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value;

    setPayment({
      ...payment,
      [e.target.name]: value
    });
  }

  async function handleClickRemove(index) {
    setDialogbox(true);
    setTableIndex(index)
    
  }
  async function confirmData() {

    if (paymentArray[tableIndex].factoryItemSupplierPaymentID != undefined || paymentArray[tableIndex].factoryItemSupplierPaymentID != null) {
      const res = await services.DeActivateSupplierPaymentMethod(paymentArray[tableIndex].factoryItemSupplierPaymentID);
      setPaymentArray(current => current.filter((img, i) => i != tableIndex));
      if (res == 1) {
        alert.success('PAYMENT TYPE DELETED SUCCESSFULLY');
        setDialogbox(false);

      } else {
        alert.error('Error occured in payment type removing');
        setDialogbox(false);
      }
    }
    else {
      for (var i = 0; i < paymentArray.length; i++) {
        setPayment({
          ...payment,
          paymentTypeID: paymentArray[i].paymentTypeID,
          bankID: paymentArray[i].bankID,
          branchID: paymentArray[i].branchID,
          accountNumber: paymentArray[i].accountNumber,
          accountHolderName: paymentArray[i].accountHolderName
        })
      }
      paymentArray.splice(tableIndex, 1);
      alert.success('PAYMENT TYPE DELETED SUCCESSFULLY');
      setDialogbox(false);
      setPayment({
        ...payment, paymentTypeID: '0', bankID: '0', branchID: '0', accountNumber: '', accountHolderName: ''
      });

    }

  }

  async function cancelData() {
      setDialogbox(false);
  }


  async function branchService() {
    const branches = await services.getAllBranches();
    setBranchList(branches);
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

  function settingAccountNumber(data) {

    if (data == undefined || data == null || data == "") {
      return '---';
    }
    else {
      return data;
    }
  }

  function handleSearchDropdownChangeBank(data, e) {
    
    if (data === undefined || data === null) {
      setPayment({
        ...payment,
        bankID: '0'
      });
      return;
    } else {
      var nameV = "bankID";
      var valueV = data["bankID"];

      setPayment({
        ...payment,
        bankID: valueV.toString()
      });
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

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Factory Item Supplier Payments Add Edit">
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
                paymentTypeID: Yup.number().max(255).required('Payment type is required').min("1", 'Payment type is required'),
                bankID: Yup.number().max(255).when("paymentTypeID",
                  {
                    is: val => val == 1,
                    then: Yup.number().required('Bank is required').min('1', 'Bank is required'),
                  }),
                branchID: Yup.number().when("bankID",
                  {
                    is: val => val > 0,
                    then: Yup.number().required('Branch is required').min('1', 'Branch is required'),
                  }),
                accountNumber: Yup.string().when("branchID",
                  {
                    is: val => val > 0,
                    then: Yup.string().required('Account number is required').max(20, "Maximum allow 20 digits").matches(/^[0-9\b]+$/, 'Only allow numbers').min('1', 'Account number is required'),
                  }),
                accountHolderName: Yup.string().when("branchID",
                  {
                    is: val => val > 0,
                    then: Yup.string().required('Account holder name is required').max(20, "Maximum allow 20 digits").min('1', 'Account holder name is required'),
                  }),
              })
            }
            onSubmit={(values) => trackPromise(savePaymentMethods(values))}
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
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={3}>
                  <Card>
                    <CardHeader
                      title="Payment Details"
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
                              onBlur={handleBlur}
                              id="paymentTypeID"
                              name="paymentTypeID"
                              value={payment.paymentTypeID}
                              type="text"
                              variant="outlined"
                              size='small'
                              disabled={(paymentArray.length <= 0) ? false : true}
                              onChange={(e) => handleChange1(e)}>
                              <MenuItem value="0">--Select Payment Type--</MenuItem>
                              <MenuItem value="1">Account</MenuItem>
                              <MenuItem value="2">Cheque</MenuItem>
                              <MenuItem value="3">Cash</MenuItem>
                            </TextField>
                          </Grid>
                          {payment.paymentTypeID === "1" ?
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
                              renderInput={(params) =>
                                <TextField {...params}
                                  variant="outlined"
                                  name="bankID"
                                  fullWidth
                                  size='small'
                                  value={values.bankID}
                                  getOptionDisabled={true}
                                  disabled={(payment.paymentTypeID != '1' ? true : false)}
                                  helperText={touched.bankID && errors.bankID}
                                  onBlur={handleBlur}
                                  error={Boolean(touched.bankID && errors.bankID)}
                                />
                              }
                            />   
                            </Grid> : null}
                          {payment.paymentTypeID === "1" ?
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
                              renderInput={(params) =>
                                <TextField {...params}
                                  variant="outlined"
                                  name="branchID"
                                  fullWidth
                                  size='small'
                                  value={values.branchID}
                                  getOptionDisabled={true}
                                  disabled={(payment.paymentTypeID != '1' ? true : false)}
                                  error={Boolean(touched.branchID && errors.branchID)}
                                  helperText={touched.branchID && errors.branchID}
                                  onBlur={handleBlur}
                                />
                              }
                            /> 
                            </Grid> : null}
                          {payment.paymentTypeID === "1" ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="accountHolderName">
                                Account Holder Name *
                                </InputLabel>
                              <TextField
                                error={Boolean(touched.accountHolderName && errors.accountHolderName)}
                                fullWidth
                                helperText={touched.accountHolderName && errors.accountHolderName}
                                name="accountHolderName"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.accountHolderName}
                                variant="outlined"
                                disabled={(payment.paymentTypeID != '1' ? true : false)}
                                size='small'
                              />
                            </Grid> : null}
                          {payment.paymentTypeID === "1" ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="accountNumber">
                                Account Number *
                                </InputLabel>
                              <TextField
                                error={Boolean(touched.accountNumber && errors.accountNumber)}
                                fullWidth
                                helperText={touched.accountNumber && errors.accountNumber}
                                name="accountNumber"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.accountNumber}
                                variant="outlined"
                                disabled={(payment.paymentTypeID != '1' ? true : false)}
                                size='small'
                              />
                            </Grid>
                            : null}
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          disabled={isSubmitting || (paymentArray.length <= 0) ? false : true}
                        >
                          Add
                        </Button>
                      </Box>
                      <CardContent>
                        {(paymentArray.length > 0) ?
                          <PerfectScrollbar>
                            <Box minWidth={1050}>
                              <TableContainer >
                                <Table className={classes.table} aria-label="caption table">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Payment Type</TableCell>
                                      <TableCell>Bank</TableCell>
                                      <TableCell>Branch</TableCell>
                                      <TableCell>Account Holder Name</TableCell>
                                      <TableCell>Account Numbers</TableCell>
                                      <TableCell >Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {paymentArray.map((rowData, index) => (
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
                                          {settingAccountNumber(rowData.accountHolderName)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {settingAccountNumber(rowData.accountNumber)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          <DeleteIcon
                                            style={{
                                              color: "red",
                                              cursor: "pointer"
                                            }}
                                            fontSize="small"
                                            onClick={() => handleClickRemove(index)}
                                          >
                                          </DeleteIcon>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                            {dialogbox ?
                          <AlertDialogWithoutButton confirmData={confirmData} cancelData={cancelData}
                            IconTitle={"Delete"}
                            headerMessage={"Delete"}
                            discription={"Are you sure you want to delete?"} />
                          : null
                        }
                          </PerfectScrollbar>
                          : null}
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

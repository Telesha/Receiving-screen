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
  Divider,
  InputLabel,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import MenuItem from '@material-ui/core/MenuItem';
import DeleteIcon from '@material-ui/icons/Delete';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import IconButton from '@material-ui/core/IconButton';
import Autocomplete from '@material-ui/lab/Autocomplete';

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
    width: 1400
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
    minWidth: 850,
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  }
}));

export function EmployeeStandingOrdersFunds({ standingOrdersArray, setStandingOrdersArray, standingFundsArray,
  setStandingFundsArray, onChangefactoryID, setIsMainButtonEnable }) {
  const classes = useStyles();
  const [standingOrder, setstandingOrder] = useState({
    bankID: '0',
    accountNumber: '',
    standingOrderName: '',
    amount: '',
    branchID: '0',
    cropbookID: '0'
  });
  const [standingFund, setstandingFund] = useState({
    fundMasterID: '0'
  });
  const alert = useAlert();
  const [banks, setBanks] = useState();
  const [bankList, setBankList] = useState([]);
  const [branches, setBranches] = useState();
  const [branchList, setBranchList] = useState([]);
  const [Funds, setFunds] = useState();
  const [FundList, setFundList] = useState([]);
  const [FundDetails, setFundDetails] = useState([]);
  const [cropBookData, setCropBookData] = useState([]);
  const [standingOrderChange, setStandingOrderChange] = useState(false);
  const [isViewScreen, setIsViewScreen] = useState(false);
  const [value, setValue] = useState(null);
  const [branchValue, setBranchValue] = useState(null);
  useEffect(() => {
    trackPromise(
      getFundsForDropdown(),
      setOrdersValues(),
      setFundsValues(),
      getFundsForTable(),
      branchService(),
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getBanksForDropdown()
    );
  }, []);

  useEffect(() => {
    if(standingOrder.bankID>0){
      trackPromise(
        getBranchesForDropdown()
      );
    }
    setBranchValue(null);
  }, [standingOrder.bankID]);

  async function branchService() {
    const branches = await services.getAllBranches();
    setBranchList(branches);
  }

  async function setOrdersValues() {
    if (Object.keys(standingOrdersArray).length > 0) {
      setstandingOrder({
        ...standingOrder,
        bankID: standingOrdersArray.bankID,
        branchID: standingOrdersArray.branchID,
        accountNumber: standingOrdersArray.accountNumber,
        standingOrderName: standingOrdersArray.standingOrderName,
        amount: standingOrdersArray.amount,
      });
    }
  }
  async function setFundsValues() {
    if (Object.keys(standingFundsArray).length > 0) {
      setstandingFund({
        ...standingFund,
        fundMasterID: standingFundsArray.fundMasterID,
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
    const Branches = await services.getBranchesByBankIDForTable(standingOrder.bankID);
    setBranches(Branches);
  }
  async function getFundsForDropdown() {
    const Funds = await services.getFundsForDropdown(onChangefactoryID);
    setFunds(Funds);
    setFundList(Funds);
  }
  async function getFundsForTable() {
    const FundSetails = await services.getFundAmountWithFundID();
    setFundDetails(FundSetails);
  }

  async function saveStandingOrder(values) {

    var resDuplicate = standingOrdersArray.find(x =>
      x.bankID === parseInt(values.bankID) &&
      x.branchID === parseInt(values.branchID) &&
      x.accountNumber === values.accountNumber.trim() &&
      x.standingOrderName === values.standingOrderName.trim() &&
      x.amount === values.amount.trim() &&
      x.cropRegNo === cropBookData[standingOrder.cropbookID]
    )

    if (resDuplicate) {
      alert.error('Duplicate standing order.');
    } else {
      var sampleStandingOrder = standingOrdersArray;
      sampleStandingOrder.push({
        bankID: parseInt(values.bankID),
        branchID: parseInt(values.branchID),
        accountNumber: values.accountNumber.trim(),
        standingOrderName: values.standingOrderName.trim(),
        amount: values.amount.trim(),
        IsViewEnable: false,
        status: 1
      });
      setStandingOrdersArray(sampleStandingOrder);
      setIsMainButtonEnable(true);
      clearOrderData();
      setValue(null);
      setBranches([]);
      setBranchValue(null);
      alert.success("Standing order added.");
    }
  }

  async function saveStandingFund(values) {

    var isDuplicate = standingFundsArray.find(x => x.fundMasterID === parseInt(values.fundMasterID) && x.cropRegNo === cropBookData[standingFund.cropbookID]);

    if (isDuplicate) {
      alert.error('Entered fund type are already exists');
    }
    else {

      let amount = FundDetails.filter(x => x.fundMasterID == parseInt(values.fundMasterID));
      var x = amount.map(y => y.amount);
      var y = amount.map(x => x.fundMasterID);
      var sampleStandingFund = standingFundsArray;

      sampleStandingFund.push(
        {
          standingOrderID: 0,
          fundMasterID: parseInt(y),
          fundAmount: parseFloat(x),
          bpPercentage: parseFloat(values.bpPercentage),
          cropRegNo: cropBookData[standingFund.cropbookID],
          status: 1
        }
      );
      setStandingFundsArray(sampleStandingFund);
      setIsMainButtonEnable(true);
      clearFundData();
      alert.success("Saving and Fund Added");
    }
  }

  function clearOrderData() {
    setValue(null);
    setBranchValue(null);
    setBranches([]);
    setstandingOrder({ ...standingOrder, cropbookID: '0', bankID: '0', branchID: '0', accountNumber: '', standingOrderName: '', amount: '' });
  }

  function clearFundData() {
    setstandingFund({ ...standingFund, fundMasterID: '0' });
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

  function handleChange2(e) {
    const target = e.target;
    const value = target.value
    setstandingFund({
      ...standingFund,
      [e.target.name]: value
    });
    setstandingOrder({
      ...standingOrder,
      [e.target.name]: value
    });
  }

  async function DeleteItem(index) {
    if (standingOrdersArray[index].standingOrderID !== undefined) {
      const res = await services.DeleteEmployeeStandingOrderItem(standingOrdersArray[index].standingOrderID);
      var standingOrdersResult = standingOrdersArray.filter((img, i) => i !== index);

      setStandingOrdersArray(standingOrdersResult);

      if (res === 1) {
        alert.success('Standing Order Deleted Successfully');

      } else {
        alert.error('Error occured in item delete');
      }

    } else {
      var result = standingOrdersArray.filter((x, i) => i !== index);
      setStandingOrdersArray(result);
      alert.success('Standing Order Deleted Successfully');
    }
  }

  async function DeleteEmployeeFundItem(index) {
    if (standingFundsArray[index].fundID !== undefined) {
      const res = await services.DeleteEmployeeStandingFundItem(standingFundsArray[index].fundID);

      var standingFundsResult = standingFundsArray.filter((img, i) => i !== index);

      setStandingFundsArray(standingFundsResult);

      if (res === 1) {
        alert.success('Saving and Fund Deleted Successfully');
      } else {
        alert.error('Error occured in item delete');
      }

    } else {
      var result = standingFundsArray.filter((x, i) => i !== index);
      setStandingFundsArray(result);
      alert.success('Saving and Fund Deleted Successfully');
    }
  }

  function settingBanks(data) {
    let bank = bankList.filter((item, index) => index == data);
    return bank;
  }
  function settingBranches(data) {
    let branchName = branchList.filter((item, index) => index == data - 1);
    var iteam = branchName.map(x => x.branchName)
    return iteam;
  }
  function settingFunds(data) {
    let fund = FundList.filter((item, index) => index == data);
    return fund;
  }

  function handleSearchDropdownChangeBank(data, e) {

    if (data === undefined || data === null) {
      setstandingOrder({
        ...standingOrder,
        bankID: null
      });
      return;
    } else {
      var nameV = "bankID";
      var valueV = data["bankID"];
      setstandingOrder({
        ...standingOrder,
        bankID: valueV.toString()
      });
    }
    setValue(data);

  }

  function handleSearchDropdownChange(data, e) {

    if (data === undefined || data === null) {
      setstandingOrder({
        ...standingOrder,
        branchID: '0'
      });
      return;
    } else {
      var nameV = "branchID";
      var valueV = data["branchID"];

      setstandingOrder({
        ...standingOrder,
        branchID: valueV.toString()
      });
    }
    setBranchValue(data);

  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Employee Saving & Fund Add Edit">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              cropbookID: standingOrder.cropbookID,
              bankID: standingOrder.bankID,
              branchID: standingOrder.branchID,
              accountNumber: standingOrder.accountNumber,
              standingOrderName: standingOrder.standingOrderName,
              amount: standingOrder.amount
            }}
            validationSchema={
              Yup.object().shape({
                bankID: Yup.number().required('Bank is required').min("1", 'Select a Bank'),
                branchID: Yup.number().required('Branch is required').min("1", 'Select a Branch'),
                accountNumber: Yup.string().required('Account number is required').matches(/^[\d -]+$/, "Enter valid account number"),
                amount: Yup.string().required('Amount required').matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Enter valid amount.'),
                standingOrderName: Yup.string().required('Account Holder Name is required')
              })
            }
            onSubmit={(event) => trackPromise(saveStandingOrder(event))}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              handleReset,
              isSubmitting,
              touched,
              values,
            }) => (
              <form onSubmit={handleSubmit} onReset={handleReset}>
                <Box mt={3}>
                  <Card className={classes.cardContent}>
                    <CardHeader
                      title="Standing Orders"
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <br></br>
                      <CardContent>
                        <Grid container spacing={4}>
                        </Grid>
                        <Grid container spacing={4}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="bankID">
                              Bank *
                            </InputLabel>
                            <Autocomplete
                              id="bankID"
                              options={banks}
                              value={value}
                              getOptionLabel={(option) => option.bankName.toString()}
                              onChange={(e, value) => handleSearchDropdownChangeBank(value, e)}
                              defaultValue={null}
                              renderInput={(params) =>
                                <TextField {...params}
                                  variant="outlined"
                                  name="bankID"
                                  fullWidth
                                  size='small'
                                  value={standingOrder.bankID}
                                  getOptionDisabled={true}
                                  helperText={touched.bankID && errors.bankID}
                                  onBlur={handleBlur}
                                  error={Boolean(touched.bankID && errors.bankID)}
                                />
                              }
                            />
                          </Grid>
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
                              value={branchValue}
                              renderInput={(params) =>
                                <TextField {...params}
                                  variant="outlined"
                                  name="branchID"
                                  fullWidth
                                  size='small'
                                  value={standingOrder.branchID}
                                  getOptionDisabled={true}
                                  error={Boolean(touched.branchID && errors.branchID)}
                                  helperText={touched.branchID && errors.branchID}
                                  onBlur={handleBlur}
                                />
                              }
                            />
                          </Grid>
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
                              onChange={(e) => handleChange2(e)}
                              disabled={isViewScreen}
                              value={standingOrder.accountNumber}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="amount">
                              Amount (Rs.) *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.amount && errors.amount)}
                              fullWidth
                              helperText={touched.amount && errors.amount}
                              size='small'
                              name="amount"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange2(e)}
                              disabled={isViewScreen}
                              value={standingOrder.amount}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="standingOrderName">
                              Account Holder Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.standingOrderName && errors.standingOrderName)}
                              fullWidth
                              helperText={touched.standingOrderName && errors.standingOrderName}
                              size='small'
                              name="standingOrderName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange2(e)}
                              disabled={isViewScreen}
                              value={standingOrder.standingOrderName}
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={4}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          disabled={isViewScreen}
                        >
                          Add
                        </Button>
                        <div>&nbsp;</div>
                        <Button
                          color="primary"
                          type="reset"
                          variant="contained"
                          onClick={() => clearOrderData()}
                          disabled={isViewScreen}
                        >
                          Clear
                        </Button>
                      </Box>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={2}>
                          {(standingOrdersArray.length > 0) ?
                            <Grid item xs={12}>
                              <TableContainer >
                                <Table className={classes.table} aria-label="caption table">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Bank</TableCell>
                                      <TableCell>Branch</TableCell>
                                      <TableCell>Account Holder Name</TableCell>
                                      <TableCell>Account Number</TableCell>
                                      <TableCell>Amount (Rs.)</TableCell>
                                      <TableCell>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {standingOrdersArray.map((rowData, index) => (
                                      <TableRow key={index}>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {settingBanks(rowData.bankID)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {settingBranches(rowData.branchID)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {rowData.standingOrderName}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {rowData.accountNumber}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {rowData.amount}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          <IconButton aria-label="delete" disabled={rowData.IsViewEnable} onClick={() => DeleteItem(index)}>
                                            <DeleteIcon
                                              style={{
                                                color: "red"
                                              }}
                                              size="small"
                                            >
                                            </DeleteIcon>
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                            : null}
                        </Grid>
                      </CardContent>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              fundMasterID: standingFund.fundMasterID
            }}
            validationSchema={
              Yup.object().shape({
                fundMasterID: Yup.number().required('Fund Type is required').min("1", 'Select a Fund Type'),
              })
            }
            onSubmit={saveStandingFund}
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
                      title="Funds"
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={4}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fundMasterID">
                              Fund Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.fundMasterID && errors.fundMasterID)}
                              fullWidth
                              helperText={touched.fundMasterID && errors.fundMasterID}
                              size='small'
                              name="fundMasterID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange2(e)}
                              value={standingFund.fundMasterID}
                              variant="outlined"
                              InputProps={{
                                readOnly: standingOrderChange ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Fund Type--</MenuItem>
                              {generateDropDownMenu(Funds)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Add
                          </Button>
                          <div>&nbsp;</div>
                          <Button
                            color="primary"
                            type="reset"
                            variant="contained"
                            onClick={() => clearFundData()}
                          >
                            Clear
                          </Button>
                        </Box>
                      </CardContent>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={2}>
                          {(standingFundsArray.length > 0) ?
                            <Grid item xs={12}>
                              <TableContainer >
                                <Table className={classes.table} aria-label="caption table">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Fund Type</TableCell>
                                      <TableCell>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {standingFundsArray.map((rowData, index) => (
                                      <TableRow key={index}>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {settingFunds(rowData.fundMasterID)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          <IconButton aria-label="delete" onClick={() => DeleteEmployeeFundItem(index)}>
                                            <DeleteIcon
                                              style={{
                                                color: "red"
                                              }}
                                              size="small"
                                            >
                                            </DeleteIcon>
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                            : null}
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

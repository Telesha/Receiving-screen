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

export function CustomerStandingOrdersFunds({ standingOrdersArray, setStandingOrdersArray, standingFundsArray,
  setStandingFundsArray, cropBookArray, onChangefactoryID, setSavingsArray, SavingsArray, setIsFormValid, setIsMainButtonEnable }) {
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
    fundMasterID: '0',
    fundAmount: '',
    cropbookID: '0',
    bpPercentage: '100'
  });
  const [Savings, setSavings] = useState([]);
  const [SavingsForms, setSavingsForms] = useState({
    cusKgPerRate: '0',
    cusfixRate: '0',
    accKgPerRate: '0',
    accfixRate: '0',
    cropbookID2: '0'
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
  const [standingOrderChange, setStandingOrderChange] = useState();
  const [isViewScreen, setIsViewScreen] = useState(false);
  const [isAccount, setIsAccount] = useState(false);
  const [isFixRate, setIsFixRate] = useState(false);
  const [isPerKgRate, setIsPerKgRate] = useState(false);
  const [addAccountID, setAccountID] = useState(null);
  const [selectedBranch, setselectedBranch] = useState();
  const [selectedBank, setselectedBank] = useState();
  var tempArray = [];
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
    trackPromise(
      getBranchesForDropdown()
    );
  }, [standingOrder.bankID]);

  useEffect(() => {
    setCropBookDropdownData();
  }, [cropBookArray]);

  useEffect(() => {
    let temObject = {};
    tempArray = SavingsArray;

    for (const objectIterator of cropBookData) {
      if (objectIterator !== undefined) {
        var testtt = tempArray.find(x => x.customerAccountID.toString() === objectIterator.toString())
        if (testtt === null || testtt === undefined) {
          temObject = {
            cusKgPerRate: '0',
            cusfixRate: '0',
            accKgPerRate: '0',
            accfixRate: '0',
            cropbookID2: objectIterator,
            isDisabled: false
          };
        } else {
          temObject = {
            cusKgPerRate: '0',
            cusfixRate: '0',
            accKgPerRate: testtt.savingMode === 2 ? testtt.amount : 0,
            accfixRate: testtt.savingMode === 1 ? testtt.amount : 0,
            cropbookID2: objectIterator,
            isDisabled: false
          };
        }
        Savings.push(temObject)
      }
    }
  }, [cropBookData]);

  useEffect(() => {
    setSavingsValues();
  }, []);

  function setCropBookDropdownData() {
    var array = [];
    var count = 1;

    for (let item of Object.entries(cropBookArray)) {
      array[count] = item[1]["registrationNumber"];
      count++;
    }
    setCropBookData(array);
  }

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
        fundAmount: standingFundsArray.fundAmount,
      });
    }
  }
  async function setSavingsValues() {
    for (let i = 0; i < SavingsArray.length; i++) {
      if (SavingsArray[i].customerAccountID == 0) {
        if (SavingsArray[i].savingMode == 1) {
          setSavingsForms({
            ...SavingsForms,
            cusfixRate: SavingsArray[i].amount,
          });
        } else {
          setSavingsForms({
            ...SavingsForms,
            cusKgPerRate: SavingsArray[i].amount,
          });
        }
      }
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
        cropRegNo: cropBookData[standingOrder.cropbookID],
        status: 1
      });
      setStandingOrdersArray(sampleStandingOrder);
      setIsMainButtonEnable(true);
      clearOrderData();
      setIsFormValid(true);
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
      setIsMainButtonEnable(true)
      clearFundData();
      setIsFormValid(true);
      alert.success("Saving and Fund Added");
    }
  }
  async function saveSavings(values) {
    var sampleSaving = SavingsArray;

    if (values == 0) {
      if (parseFloat(SavingsForms.accfixRate) > 0) {
        sampleSaving.push({
          CustomerAccountID: parseInt(addAccountID),
          Amount: parseFloat(SavingsForms.accfixRate),
          SavingMode: 1,//fix rate
          status: 1
        });
        for (let j = 0; j < Savings.length; j++) {
          let accountID = Savings[j].cropbookID2;
          if (accountID == addAccountID) {
            Savings[j].accfixRate = SavingsForms.accfixRate;
            Savings[j].accKgPerRate = 0;
          }
        }
      }
      else {
        sampleSaving.push({
          CustomerAccountID: parseInt(addAccountID),
          Amount: parseFloat(SavingsForms.accKgPerRate),
          SavingMode: 2,//per kg rate
          status: 1
        });
        for (let j = 0; j < Savings.length; j++) {
          let accountID = Savings[j].cropbookID2;
          if (accountID == addAccountID) {
            Savings[j].accfixRate = 0;
            Savings[j].accKgPerRate = SavingsForms.accKgPerRate;
          }
        }
      }
    }
    else {
      if (parseFloat(SavingsForms.cusfixRate) > 0) {
        sampleSaving.push({
          CustomerAccountID: 0,
          Amount: parseFloat(SavingsForms.cusfixRate),
          SavingMode: 1,
          status: 1
        });
      }
      else {
        sampleSaving.push({
          CustomerAccountID: 0,
          Amount: parseFloat(SavingsForms.cusKgPerRate),
          SavingMode: 2,
          status: 1
        });
      }
    }
    setSavingsArray(sampleSaving);
    setIsFormValid(true);
    setIsMainButtonEnable(true)
    alert.success("Welfare added.");
  }
  function clearOrderData() {
    clear()
    setstandingOrder({ ...standingOrder, cropbookID: '0', bankID: '0', branchID: '0', accountNumber: '', standingOrderName: '', amount: '' });
    setselectedBranch([]);
  }
  function clearFundData() {
    setstandingFund({ ...standingFund, cropbookID: '0', fundMasterID: '0', fundAmount: '', bpPercentage: '', });
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
    setstandingOrder({
      ...standingOrder,
      [e.target.name]: value
    });
  }

  function handleChange2(e) {
    const target = e.target;
    const value = target.value
    setstandingFund({
      ...standingFund,
      [e.target.name]: value
    });
  }
  async function DeleteItem(index) {
    if (standingOrdersArray[index].standingOrderID !== undefined) {
      const res = await services.DeleteStandingOrderItem(standingOrdersArray[index].standingOrderID);

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
  async function DeleteFundItem(index) {
    if (standingFundsArray[index].fundID !== undefined) {
      const res = await services.DeleteStandingFundItem(standingFundsArray[index].fundID);

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
  function clear() {
    handleSearchDropdownChangeBank(null, null)
  }
  function handleSearchDropdownChangeBank(data, e) {
    if (data === undefined || data === null) {
      setselectedBank(null);
      setstandingOrder((cur) => ({
        ...cur,
        bankID: null
      }));
      return;
    } else {
      var valueV = data["bankID"];
      setselectedBank(data);
      setstandingOrder({
        ...standingOrder,
        bankID: valueV.toString()
      });
    }
  }

  function handleSearchDropdownChange(data, e) {
    if (data === undefined || data === null) {
      setselectedBranch(data);
      setstandingOrder((cur) => ({
        ...cur,
        branchID: null
      }));
      return;
    } else {
      var valueV = data["branchID"];
      setselectedBranch(data);
      setstandingOrder({
        ...standingOrder,
        branchID: valueV.toString()
      });
    }
  }
  function handleAccFixRateChange(e) {

    const fieldName = e.target.getAttribute("name");
    const fieldValue = e.target.value;
    SavingsForms.accKgPerRate = 0;

    if (fieldValue == 0 || fieldValue == "") {
      setIsFixRate(false);
    }
    else {
      setIsFixRate(true);
    }
    const newSavingData = { ...SavingsForms };
    newSavingData[fieldName] = fieldValue;
    setSavingsForms(newSavingData);
  }

  function handleAccKgRateChange(e) {

    const fieldName = e.target.getAttribute("name");
    const fieldValue = e.target.value;
    SavingsForms.accfixRate = 0;

    if (fieldValue == 0 || fieldValue == "") {
      setIsPerKgRate(false);
    }
    else {
      setIsPerKgRate(true);
    }

    const newSavingData = { ...SavingsForms };
    newSavingData[fieldName] = fieldValue;

    setSavingsForms(newSavingData);
  }

  function handleAddSavings(e, rowData) {
    setAccountID(rowData.cropbookID2);

    const formValues = { ...SavingsForms };
    formValues.accfixRate = rowData.accfixRate;
    formValues.accKgPerRate = rowData.accKgPerRate;

    setSavingsForms(formValues);
  }

  function handleCusFixRate(e) {
    const fieldName = e.target.getAttribute("name");
    const fieldValue = e.target.value;

    SavingsForms.cusKgPerRate = 0;

    const newSavingData = { ...SavingsForms };
    newSavingData[fieldName] = fieldValue;

    setSavingsForms(newSavingData);

    if (fieldValue == 0 || fieldValue == "") {
      setIsFixRate(false);
    }
    else {
      setIsFixRate(true);
    }
  }

  function handleCusKgRate(e) {
    const fieldName = e.target.getAttribute("name");
    const fieldValue = e.target.value;

    SavingsForms.cusfixRate = 0;

    const newSavingData = { ...SavingsForms };
    newSavingData[fieldName] = fieldValue;

    setSavingsForms(newSavingData);

    if (fieldValue == 0 || fieldValue == "") {
      setIsPerKgRate(false);
    }
    else {
      setIsPerKgRate(true);
    }
  }
  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Standing Orders Add Edit">
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
                cropbookID: Yup.number().required('Customer Account is required').min("1", 'Customer Account is required'),
                bankID: Yup.number().required('Bank is required').min("1", 'Bank is required'),
                branchID: Yup.number().required('Branch is required').min("1", 'Branch is required'),
                accountNumber: Yup.string().required('Account number is required').matches(/^[\d -]+$/, "Enter valid account number"),
                standingOrderName: Yup.string().max(255).required('Account holder name is required').matches(/^[a-zA-Z ]*$/, 'Enter valid account holder name.'),
                amount: Yup.string().required('Amount is required').matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Enter valid amount.')
              })
            }
            onSubmit={saveStandingOrder}
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
                      <CardContent>
                        <Grid container spacing={4}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="cropbookID">
                              Customer Account *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.cropbookID && errors.cropbookID)}
                              fullWidth
                              helperText={touched.cropbookID && errors.cropbookID}
                              size='small'
                              name="cropbookID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={standingOrder.cropbookID}
                              disabled={isViewScreen}
                              variant="outlined"
                              InputProps={{
                                readOnly: standingOrderChange ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Customer Account--</MenuItem>
                              {generateDropDownMenu(cropBookData)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={4}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="bankID">
                              Bank *
                            </InputLabel>
                            <Autocomplete
                              id="bankID"
                              options={banks}
                              getOptionLabel={(option) => option.bankName ?? ""}
                              onChange={(e, value) => handleSearchDropdownChangeBank(value, e)}
                              defaultValue={null}
                              clearText={standingOrder.bankID === 0}
                              value={selectedBank ?? null}
                              renderInput={(params) =>
                                <TextField {...params}
                                  variant="outlined"
                                  name="bankID"
                                  fullWidth
                                  size='small'
                                  getOptionDisabled={true}
                                  helperText={touched.bankID && errors.bankID}
                                  onBlur={handleBlur}
                                  error={Boolean(touched.bankID && errors.bankID)}
                                >
                                </TextField>
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
                              getOptionLabel={(option) => option.branchName ?? ""}
                              onChange={(e, value) => handleSearchDropdownChange(value, e)}
                              defaultValue={null}
                              clearText={standingOrder.branchID === 0}
                              value={selectedBranch ?? null}
                              renderInput={(params) =>
                                <TextField {...params}
                                  variant="outlined"
                                  name="branchID"
                                  fullWidth
                                  size='small'
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
                              onChange={handleChange}
                              disabled={isViewScreen}
                              value={values.accountNumber}
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
                              onChange={handleChange}
                              disabled={isViewScreen}
                              value={values.amount}
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
                              onChange={handleChange}
                              disabled={isViewScreen}
                              value={values.standingOrderName}
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
                          type="Button"
                          variant="contained"
                          onClick={() => clearOrderData()}
                          disabled={isViewScreen}>

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
                                      <TableCell>Customer Account Reg No</TableCell>
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
                                          {rowData.cropRegNo}
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
              fundMasterID: standingFund.fundMasterID,
              cropbookID: standingFund.cropbookID,
              bpPercentage: standingFund.bpPercentage
            }}
            validationSchema={
              Yup.object().shape({
                fundMasterID: Yup.number().required('Fund Type is required').min("1", 'Fund Type is required'),
                cropbookID: Yup.number().required('Customer Account is required').min("1", 'Customer Account is required'),
                bpPercentage: Yup.number().required('BP Percentage is required').max('100', 'Cannot exceed maximum percentage'),
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
                      title="Savings & Funds"
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>

                        <Grid container spacing={4}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="cropbookID">
                              Customer Account *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.cropbookID && errors.cropbookID)}
                              fullWidth
                              helperText={touched.cropbookID && errors.cropbookID}
                              size='small'
                              name="cropbookID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange2(e)}
                              value={standingFund.cropbookID}
                              disabled={isViewScreen}
                              variant="outlined"
                              InputProps={{
                                readOnly: standingOrderChange ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Customer Account--</MenuItem>
                              {generateDropDownMenu(cropBookData)}
                            </TextField>
                          </Grid>
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

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="bpPercentage">
                              BP Percentage *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.bpPercentage && errors.bpPercentage)}
                              fullWidth
                              helperText={touched.bpPercentage && errors.bpPercentage}
                              size='small'
                              name="bpPercentage"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange2(e)}
                              value={standingFund.bpPercentage}
                              variant="outlined"
                            />
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
                                      <TableCell>Customer Account Reg No</TableCell>
                                      <TableCell>Amount</TableCell>
                                      <TableCell>BP Percentage</TableCell>
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
                                          {rowData.cropRegNo}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {rowData.fundAmount}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {rowData.bpPercentage}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          <IconButton aria-label="delete" onClick={() => DeleteFundItem(index)}>
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
            }}
            validationSchema={
              Yup.object().shape({
                fixRate: Yup.string().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Enter valid amount.'),
                kgPerRate: Yup.string().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Enter valid amount.')
              })
            }
            onSubmit={saveSavings}
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
                      title="Welfare"
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        {(isAccount) ?
                          <form onSubmit={handleSubmit} onReset={handleReset}>
                            <Grid container spacing={4}>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="cusfixRate">
                                  Fix Rate
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.cusfixRate && errors.cusfixRate)}
                                  fullWidth
                                  helperText={touched.cusfixRate && errors.cusfixRate}
                                  size='small'
                                  name="cusfixRate"
                                  onBlur={handleBlur}
                                  onChange={handleCusFixRate}
                                  disabled={isPerKgRate}
                                  value={SavingsForms.cusfixRate}
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="cusKgPerRate">
                                  1kg Per rate
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.cusKgPerRate && errors.cusKgPerRate)}
                                  fullWidth
                                  helperText={touched.cusKgPerRate && errors.cusKgPerRate}
                                  size='small'
                                  name="cusKgPerRate"
                                  onBlur={handleBlur}
                                  onChange={handleCusKgRate}
                                  disabled={isFixRate}
                                  value={SavingsForms.cusKgPerRate}
                                  variant="outlined"
                                />
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
                              >
                                Clear
                              </Button>
                            </Box>
                          </form>
                          :
                          <CardContent>
                            <Grid container spacing={2}>
                              {(cropBookArray.length > 0 && !isAccount) ?
                                <Grid item xs={12}>
                                  <TableContainer >
                                    <Table className={classes.table} aria-label="caption table">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Account</TableCell>
                                          <TableCell>1kg per rate</TableCell>
                                          <TableCell>Fix rate</TableCell>
                                          <TableCell>Action</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {Savings.map((rowData, index) => (
                                          <Fragment>
                                            {addAccountID == rowData.cropbookID2 ? (
                                              <TableRow >
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {rowData.cropbookID2}
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  <Grid item md={4} xs={12}>
                                                    <TextField
                                                      fullWidth
                                                      type='number'
                                                      variant="outlined"
                                                      size={"small"}
                                                      name="accKgPerRate"
                                                      onBlur={handleBlur}
                                                      onChange={handleAccKgRateChange}
                                                      value={SavingsForms.accKgPerRate}
                                                      disabled={isFixRate}
                                                      InputProps={{
                                                        readOnly: rowData.isDisabled,
                                                      }}
                                                    />
                                                  </Grid>
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  <Grid item md={4} xs={12}>
                                                    <TextField
                                                      fullWidth
                                                      type='number'
                                                      variant="outlined"
                                                      size={"small"}
                                                      name={"accfixRate"}
                                                      onBlur={handleBlur}
                                                      onChange={handleAccFixRateChange}
                                                      value={SavingsForms.accfixRate}
                                                      disabled={isPerKgRate}
                                                      InputProps={{
                                                        readOnly: rowData.isDisabled,
                                                      }}
                                                    />
                                                  </Grid>
                                                </TableCell>
                                                <TableCell style={{ borderBottom: "none" }}>
                                                  <Button
                                                    color="primary"
                                                    onClick={(e) => saveSavings(0)}
                                                    variant="contained"
                                                    disabled={isViewScreen}
                                                  >
                                                    Save
                                                  </Button>
                                                </TableCell>
                                              </TableRow>
                                            ) :
                                              (
                                                <TableRow key={index}>
                                                  <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    {rowData.cropbookID2}
                                                  </TableCell>
                                                  <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    {rowData.accKgPerRate}
                                                  </TableCell>
                                                  <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    {rowData.accfixRate}
                                                  </TableCell>
                                                  <TableCell style={{ borderBottom: "none" }}>
                                                    <Button
                                                      color="primary"
                                                      onClick={(e) => handleAddSavings(e, rowData)}
                                                      variant="contained"
                                                      disabled={isViewScreen}
                                                    >
                                                      Edit
                                                    </Button>
                                                  </TableCell>
                                                </TableRow>
                                              )}
                                          </Fragment>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Grid>
                                : <p>No accounts to display</p>}
                            </Grid>
                          </CardContent>
                        }
                      </CardContent>
                      <Divider />
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

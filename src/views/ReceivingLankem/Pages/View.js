import React, { useRef, useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
  Hidden,
  FormControlLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import Autocomplete from '@material-ui/lab/Autocomplete';
import ReceiptPDF from './ReceiptPDF';
import ReactToPrint from 'react-to-print';

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
}));

var screenCode = "LANKEMRECEIVING"
export default function LankemReceivingView(props) {

  const { accountID, startDate, endDate, referenceNumber, IsGuestNavigation } = useParams();
  const componentRef = useRef();
  const { groupID } = useParams();
  const { factoryID } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("Receiving")
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [transactionTypes, setTransactionTypes] = useState();
  const [payVoucherCode, setPayVoucherCode] = useState();
  const [groups, setGroups] = useState();
  const [selectedDate, handleDateChange] = useState(new Date().toISOString());
  const [selectedDueDate, handleDueDateChange] = useState(new Date().toISOString());
  const [journalData, setJournalData] = useState([]);
  const [accountTypeNames, setAccountTypeNames] = useState();
  const [creditTotal, setCreditTotal] = useState(0);
  const [debitTotal, setDebitTotal] = useState(0);
  const [transactionModeCode, setTransactionModeCode] = useState();
  const [voucherTypes, setVoucherTypes] = useState([]);
  const [transactionModes, setTransactionModes] = useState([]);
  const [tranLedgerList, setTranLedgerList] = useState([]);
  const [interEstateButtonEnable, setInterEstateButtonEnable] = useState(false);
  const [customers, setCustomers] = useState();
  const [customerCommon, setCustomerCommon] = useState(false);
  const [refNo, setRefNo] = useState();
  const [customersPaymentID, setCustomersPaymentID] = useState({
    paymentTypeID: '0',
  });
  const [receiptBankData, setReceiptBankData] = useState();

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [generalJournal, setGeneralJournal] = useState({
    groupID: '0',
    factoryID: '0',
    transactionTypeID: '0',
    referenceNumber: '',
    description: '',
    payModeID: '0',
    chequeNumber: '',
    isActive: true,
    preparedBy: '',
    updatedBy: '',
    checkedBy: '',
    voucherType: '0',
    voucherCode: '',
    tranLedgerAccountID: '0',
    transactionMode: '0',
    recipientName: '',
    address: '',
    isInterEstate: false,
    interEstateID: '0',
    customerID: '0',
    payee: '',
  });
  const [QuaryParamDetails, setQuaryParamDetails] = useState({
    groupID: "",
    factoryID: "",
    accountID: "",
    startDate: "",
    endDate: "",
    referenceNumber: "",
    IsGuestNavigation: "0"
  });

  let decrypted = 0;

  const handleClickBack = () => {
    if (QuaryParamDetails.IsGuestNavigation === '1') {
      const encryptedGroupID = btoa(QuaryParamDetails.groupID.toString())
      const encryptedFactoryID = btoa(QuaryParamDetails.factoryID.toString())
      const encryptedStartDate = btoa(QuaryParamDetails.startDate.toString())
      const encryptedEndDate = btoa(QuaryParamDetails.endDate.toString())
      const encryptedAccountID = btoa(QuaryParamDetails.accountID.toString())

      navigate('/app/inquiryRegistry/' + encryptedGroupID + '/' + encryptedFactoryID + '/' + encryptedAccountID + '/' + encryptedStartDate + '/' + encryptedEndDate + '/' + btoa("1"));
    } else {
      navigate('/app/LankemReceiving/listing');
    }
  }

  const [printDate, setPrintDate] = useState('');
  const [customerID, setCustomerID] = useState(0);
  const [customerNamePDF, setCustomerNamePDF] = useState("Unknown Customer");
  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();
    setPrintDate(formattedDate);
  }, []);

  const [totalValues, setTotalValues] = useState({
    totalAmount: 0
  });

  useEffect(() => {
    trackPromise(getPermissions());
    trackPromise(getGroupsForDropdown());
    getPayVoucherCode();
  }, []);

  useEffect(() => {
    trackPromise(getfactoriesForDropDown());
  }, [generalJournal.groupID]);

  useEffect(() => {
    trackPromise(getAccountTypeNames(generalJournal.groupID, generalJournal.factoryID));
    trackPromise(getTransactionTypes());
    trackPromise(getVoucherTypeList());
    trackPromise(getTransactionModeList());
    trackPromise(getTranLedgerList());
  }, [generalJournal.factoryID]);

  useEffect(() => {
    decrypted = atob(referenceNumber.toString());
    const decrypedGroupID = atob(groupID.toString())
    const decrypedFactoryID = atob(factoryID.toString())
    const decrypedAccountID = atob(accountID.toString())
    const decrypedStartDate = atob(startDate.toString())
    const decrypedEndDate = atob(endDate.toString())
    const decrypedIsGuestNavigation = atob(IsGuestNavigation.toString())
    setQuaryParamDetails({
      groupID: decrypedGroupID,
      factoryID: decrypedFactoryID,
      accountID: decrypedAccountID,
      startDate: decrypedStartDate,
      endDate: decrypedEndDate,
      referenceNumber: decrypted,
      IsGuestNavigation: decrypedIsGuestNavigation
    })

    if (decrypted != 0) {
      trackPromise(getGeneralJournalDetails(decrypted, decrypedGroupID, decrypedFactoryID))
    }
  }, []);

  useEffect(() => {
    if (generalJournal.transactionTypeID != 0) {
      trackPromise(getReferenceNumber());
    }
  }, [generalJournal.transactionTypeID]);

  useEffect(() => {
    if (generalJournal.isInterEstate == true) {
      setInterEstateButtonEnable(true)
    } else {
      setInterEstateButtonEnable(false)
    }
  }, [generalJournal.isInterEstate]);

  useEffect(() => {
    if (payVoucherCode) {
      trackPromise(getReferenceNumber());
    }
  }, [generalJournal.tranLedgerAccountID]);

  useEffect(() => {
    if (generalJournal.factoryID.toString() !== '0') {
      trackPromise(getCustomersForDropDown());
    }
  }, [generalJournal.factoryID]);

  useEffect(() => {
    if (generalJournal.customerID.toString() !== '0') {
      trackPromise(getCustomersPaymentID());
    }
  }, [generalJournal.customerID]);

  useEffect(() => {
    if (journalData.length != 0) {
      calculateTotal()
    }
  }, [journalData]);


  async function getCustomersForDropDown() {
    const customer = await services.getCustomersForDropDown(
      generalJournal.groupID
    );
    setCustomers(customer);
  }


  // async function getReferenceNumber() {
  //   if (generalJournal.referenceNumber < 1 || generalJournal.referenceNumberk == "" || generalJournal.referenceNumber == undefined) {
  //     let refModel = {
  //       groupID: generalJournal.groupID,
  //       factoryID: generalJournal.factoryID,
  //       transactionTypeID: generalJournal.transactionTypeID,
  //       isActive: true,
  //     }
  //     const ref = await services.getReferenceNumber(refModel);
  //     setGeneralJournal({ ...generalJournal, referenceNumber: ref });
  //   }
  // }

  async function getReferenceNumber() {
    let refModel = {
      groupID: generalJournal.groupID,
      factoryID: generalJournal.factoryID,
      date: selectedDate.toISOString().split('-')[0],
      voucherCode: payVoucherCode.voucherCode
    };
    const ref = await services.getReferenceNumber(refModel);
    setRefNo(ref.data);
  }

  async function getTransactionTypes() {
    const transaction = await services.getTransactionTypeNamesForDropdown();
    setTransactionTypes(transaction);
  }

  async function getAccountTypeNames(groupID, factoryID) {
    const accounts = await services.getLedgerAccountNamesForDatagrid(groupID, factoryID);
    setAccountTypeNames(accounts);
    return accounts;
  }

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITLANKEMRECEIVING');

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

    setGeneralJournal({
      ...generalJournal,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(generalJournal.groupID);
    setFactories(factory);
  }

  async function getPayVoucherCode() {
    const payVoucherCodes = await services.getPayVoucherCode(
      generalJournal.groupID
    );
    setPayVoucherCode(payVoucherCodes);
  }

  async function getCustomersPaymentID() {
    const result = await services.getCustomersPaymentID(
      generalJournal.groupID,
    );
    result.forEach(item => {
      setCustomersPaymentID(customersPaymentID => ({
        ...customersPaymentID,
        paymentTypeID: item.paymentTypeID
      }));
    });
    setReceiptBankData(result);
  }



  async function getGeneralJournalDetails(referenceNumber, groupID, factoryID) {
    let response = await services.getGeneralJournalDetailsByReferenceNumber(referenceNumber, groupID, factoryID);
    let data = response;
    setTitle("View Receiving");
    setCustomerID(data[0].customerID);
    setGeneralJournal({
      ...generalJournal,
      groupID: data[0].groupID,
      factoryID: data[0].factoryID,
      transactionTypeID: data[0].transactionTypeID,
      description: data[0].description == null ? "" : data[0].description,
      payModeID: data[0].payModeID,
      chequeNumber: data[0].chequeNumber == null ? "" : data[0].chequeNumber,
      preparedBy: data[0].preparedBy,
      updatedBy: data[0].updatedBy,
      referenceNumber: data[0].referenceNumber,
      recipientName: data[0].recipientName,
      transactionMode: data[0].transactionModeID,
      voucherType: data[0].voucherTypeID,
      chequeNumber: data[0].chequeNumber == null ? "" : data[0].chequeNumber,
      checkedBy: data[0].checkedBy,
      isInterEstate: data[0].isInterEstate,
      interEstateID: data[0].interEstateID,
      customerID: data[0].customerID,
      tranLedgerAccountID: data[0].tranLedgerAccountID,
    });
    handleDateChange(new Date(data[0].date).toISOString())
    const customer = await services.getCustomersForDropDown(
      parseInt(data[0].factoryID)
    );
    if ((data[0].customerID > 0) && (customer[data[0].customerID].code == 'COMMON')) {
      setCustomerCommon(true);
      setCustomerNamePDF(data[0].receiver);
    } else {
      setCustomerCommon(false);
      setCustomerNamePDF(customer[data[0].customerID].name);
    }
    //   let copyArray = data;

    //   let accountNameList = await getAccountTypeNames(data[0].groupID, data[0].factoryID);
    //   let TransactionModeList = await getTransactionModeList();
    //   const result = TransactionModeList.filter((x) => x.transactionModeID == data[0].transactionModeID);
    //   setTransactionModeCode(result != undefined ? result[0].transactionModeCode : '');
    //   let tempArray = [...journalData]

    //   copyArray.forEach(element => {
    //     let reuslt = GetAll(element.accountTypeName, accountNameList);
    //     tempArray.push(
    //       {
    //         accountTypeName: element.accountTypeName,
    //         description: element.description,
    //         credit: element.credit,
    //         debit: element.debit,
    //         ledgerTransactionID: element.ledgerTransactionID,
    //         rowID: 0,
    //         selected: reuslt
    //       }
    //     )
    //   });
    //   setJournalData(tempArray)
    // }
    let tranLedgerAccountID = data[0].tranLedgerAccountID
    let copyArray = data;
    let accountNameList = await getAccountTypeNames(data[0].groupID, data[0].factoryID);
    let tempArray = [...journalData]
    var filteredArray = copyArray.filter((x) => x.accountTypeName !== tranLedgerAccountID);
    filteredArray.forEach(element => {
      let reuslt = GetAll(element.accountTypeName, accountNameList);
      tempArray.push(
        {
          accountTypeName: element.accountTypeName,
          description: element.description,
          credit: element.credit,
          debit: element.debit,
          ledgerTransactionID: element.ledgerTransactionID,
          rowID: 0,
          selected: reuslt
        }
      )
    });
    setJournalData(tempArray)
  }


  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }


  async function getTransactionModeList() {
    const transactionModes = await services.getTransactionModeList();
    setTransactionModes(transactionModes);
    return transactionModes
  }

  async function getVoucherTypeList() {
    const voucherTypes = await services.getVoucherTypeList();
    setVoucherTypes(voucherTypes);
    return voucherTypes;
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

  function calculateTotal() {

    const totalAmount = journalData.reduce((accumulator, current) => {
      const progressFraction = current.credit;
      return accumulator + progressFraction;
    }, 0);

    setTotalValues({
      ...totalValues,
      totalAmount: totalAmount
    });
  }

  async function getTranLedgerList() {
    const transaction = await services.getTranLedgerListForDropdown(generalJournal.factoryID);
    setTranLedgerList(transaction);
  }


  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setGeneralJournal({
      ...generalJournal,
      [e.target.name]: value
    });
  }

  function generateDropDownMenuWithTwoValues(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value.name}</MenuItem>);
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
            onClick={handleClickBack}
          />
        </Grid>
      </Grid>
    )
  }

  function generateDropDownMenuForInterEstate(data, selectedValue) {
    selectedValue = selectedValue.toString()
    if (generalJournal.factoryID != 0) {
      let items = [];
      if (data != null) {
        for (const [key, value] of Object.entries(data)) {
          items.push(
            <MenuItem key={key} value={key} disabled={key === selectedValue}>
              {value}
            </MenuItem>
          );
        }
      }
      return items;
    }
  }

  function calDebitTotal() {
    let sum = 0;
    journalData.forEach(element => {
      sum += parseFloat(element.debit)
    });
    setDebitTotal(sum.toFixed(2));
    return sum.toFixed(2);
  }

  function calCreditTotal() {
    let sum = 0;
    journalData.forEach(element => {
      sum += parseFloat(element.credit);
    });
    setCreditTotal(sum.toFixed(2));
    return sum.toFixed(2);
  }

  function calOutOfBalance() {
    return (parseFloat(creditTotal) - parseFloat(debitTotal)).toFixed(2);
  }

  function generateDropownForVoucherList(dataList) {
    let items = []
    if (dataList != null) {
      voucherTypes.forEach(x => {
        items.push(<MenuItem key={x.voucherTypeID} value={x.voucherTypeID}>{x.voucherTypeName}</MenuItem>)
      });

    }
    return items

  }

  function generateDropownForTransactionModeList(dataList) {
    let items = []
    if (dataList != null) {
      transactionModes.forEach(x => {
        items.push(<MenuItem key={x.transactionModeID} value={x.transactionModeID}>{x.transactionModeName}</MenuItem>)
      });
    }
    return items

  }

  function GetAll(ledgerAccountID, accountTypeNames) {
    const result = accountTypeNames.filter((a) => a.ledgerAccountID.toString() === ledgerAccountID.toString())
    return result;
  }

  function isInterEstatehandleChange(e) {
    const target = e.target
    const value = target.name === 'isInterEstate' ? target.checked : target.value
    setGeneralJournal({
      ...generalJournal,
      [e.target.name]: value
    })
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: generalJournal.groupID,
              factoryID: generalJournal.factoryID,
              transactionTypeID: generalJournal.transactionTypeID,
              referenceNumber: generalJournal.referenceNumber,
              description: generalJournal.description,
              payModeID: generalJournal.payModeID,
              chequeNumber: generalJournal.chequeNumber,
              isActive: generalJournal.isActive,
              tranLedgerAccountID: generalJournal.tranLedgerAccountID,
              customerID: generalJournal.customerID,
              receiver: generalJournal.receiver
            }}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              values,
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
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={values.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: true,
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={generalJournal.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: true,
                              }}
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="date" style={{ marginBottom: '-8px' }}>
                              Date *
                            </InputLabel>

                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="date-picker-inline"
                                value={selectedDate}
                                onChange={(e) => {
                                  handleDateChange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                                disabled="true"
                                InputProps={{
                                  readOnly: true
                                }}
                              />
                            </MuiPickersUtilsProvider>

                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          {Hidden == true ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="voucherType">
                                Voucher Type *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.voucherType && errors.voucherType)}
                                fullWidth
                                helperText={touched.voucherType && errors.voucherType}
                                name="voucherType"
                                size='small'
                                onBlur={handleBlur}
                                value={generalJournal.voucherType}
                                variant="outlined"
                                id="voucherType"
                                InputProps={{
                                  readOnly: true,
                                }}

                              >
                                <MenuItem value="0">--Select Voucher Type--</MenuItem>
                                {generateDropownForVoucherList(voucherTypes)}
                              </TextField>
                            </Grid> : null}
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="tranLedgerAccountID">
                              Bank Account *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.tranLedgerAccountID &&
                                errors.tranLedgerAccountID
                              )}
                              fullWidth
                              helperText={
                                touched.tranLedgerAccountID &&
                                errors.tranLedgerAccountID
                              }
                              name="tranLedgerAccountID"
                              size="small"
                              onBlur={handleBlur}
                              value={generalJournal.tranLedgerAccountID}
                              variant="outlined"
                              id="tranLedgerAccountID"
                              InputProps={{
                                readOnly: true
                              }}
                            >
                              <MenuItem value="0">
                                --Select Ledger Account--
                              </MenuItem>
                              {generateDropDownMenu(
                                tranLedgerList
                              )}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="referenceNumber">
                              Voucher Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.referenceNumber && errors.referenceNumber)}
                              fullWidth
                              helperText={touched.referenceNumber && errors.referenceNumber}
                              name="referenceNumber"
                              size='small'
                              onBlur={handleBlur}
                              value={generalJournal.referenceNumber}
                              variant="outlined"
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="supplierID">
                              Customer *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.customerID && errors.customerID
                              )}
                              fullWidth
                              helperText={touched.customerID && errors.customerID}
                              name="customerID"
                              size="small"
                              onBlur={handleBlur}
                              value={generalJournal.customerID}
                              variant="outlined"
                              id="customerID"
                              InputProps={{
                                readOnly:
                                  true
                              }}
                            >
                              <MenuItem value="0">--Select Customer--</MenuItem>
                              {generateDropDownMenuWithTwoValues(customers)}
                            </TextField>
                          </Grid>
                          {customerCommon ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="payee">
                              Receiver *
                              </InputLabel>
                              <TextField
                                error={Boolean(
                                  touched.receiver && errors.receiver
                                )}
                                fullWidth
                                helperText={
                                  touched.receiver && errors.receiver
                                }
                                name="receiver"
                                size="small"
                                onBlur={handleBlur}
                                value={generalJournal.receiver}
                                variant="outlined"
                                id="receiver"
                                InputProps={{
                                  readOnly:
                                    true
                                }}
                              />
                            </Grid>
                            : null}
                          {transactionModeCode == 'CH' ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="chequeNumber" style={{ marginBottom: '-8px' }}>
                                Due Date
                              </InputLabel>
                              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                  fullWidth
                                  inputVariant="outlined"
                                  format="dd/MM/yyyy"
                                  margin="dense"
                                  id="date-picker-inline"
                                  value={selectedDueDate}
                                  KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                  }}
                                  autoOk

                                />
                              </MuiPickersUtilsProvider>

                            </Grid> : null}
                        </Grid>
                        {transactionModeCode == 'CH' ?
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="chequeNumber">
                                Cheque Number
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.chequeNumber && errors.chequeNumber)}
                                fullWidth
                                helperText={touched.chequeNumber && errors.chequeNumber}
                                name="chequeNumber"
                                size='small'
                                onBlur={handleBlur}
                                value={generalJournal.chequeNumber}
                                variant="outlined"
                                InputProps={{
                                  readOnly: true,
                                }}

                              />
                            </Grid>

                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="recipientName">
                                Recipient Name
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.recipientName && errors.recipientName)}
                                fullWidth
                                helperText={touched.recipientName && errors.recipientName}
                                name="recipientName"
                                size='small'
                                onBlur={handleBlur}
                                value={generalJournal.recipientName}
                                variant="outlined"
                                InputProps={{
                                  readOnly: true,
                                }}

                              />
                            </Grid>
                          </Grid> : null}
                      </CardContent>
                      <CardContent height="auto">

                        <Box style={{ border: "1px solid gray" }}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Account Name</TableCell>
                                <TableCell>Description</TableCell>
                                {/* <TableCell>Debit</TableCell> */}
                                <TableCell>Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {
                                journalData.map((object) => {
                                  let ID = object.rowID
                                  return (
                                    <TableRow>
                                      <TableCell style={{ padding: "16px", width: "20rem" }}>
                                        {/* <Autocomplete
                                          id={ID.toString()}
                                          options={accountTypeNames}
                                          size={"small"}
                                          style={{ width: "20rem" }}
                                          disabled={true}
                                          getOptionLabel={(option) => option.ledgerAccountName}
                                          value={object.selected !== undefined ? object.selected[0] : null}
                                          renderInput={(params) => (
                                            <TextField {...params} fullWidth autoFocus variant="outlined" placeholder="--Select Account--" />
                                          )}
                                        /> */}
                                        <Autocomplete
                                          id={ID.toString()}
                                          options={accountTypeNames}
                                          size={"small"}
                                          style={{ width: "20rem" }}
                                          disabled={true}
                                          getOptionLabel={(option) => option.ledgerAccountName}
                                          value={object.selected !== undefined ? object.selected[0] : null}
                                          renderInput={(params) => (
                                            <TextField {...params} fullWidth autoFocus variant="outlined" placeholder="--Select Account--" />
                                          )}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <TextField
                                          variant="outlined"
                                          size={"small"}
                                          name={ID}
                                          value={object.description}
                                          fullWidth
                                          disabled={true}
                                        />
                                      </TableCell>
                                      {/* <TableCell>
                                        <TextField
                                          variant="outlined"
                                          size={"small"}
                                          name={ID}
                                          fullWidth
                                          value={object.debit}
                                          disabled={true}
                                        />
                                      </TableCell> */}
                                      <TableCell>
                                        <TextField
                                          variant="outlined"
                                          size={"small"}
                                          name={ID}
                                          onBlur={handleBlur}
                                          value={object.credit}
                                          fullWidth
                                          disabled={true}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  )
                                })
                              }
                            </TableBody>
                          </Table>
                        </Box>
                      </CardContent>
                      {/* <CardContent>
                        <Box border={1} borderColor="#626964" >
                          <Grid container md={12} spacing={2} style={{ marginTop: '1rem' }}>
                            <Grid item md={2} xs={12} style={{ marginLeft: '10px' }}>
                              <InputLabel><b>Total Debit (Rs)</b></InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel > {": " + calCreditTotal()} </InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel ><b>Total Credit (Rs)</b></InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel >{": " + calCreditTotal()}</InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel ><b>Out Of Balance (Rs)</b></InputLabel>
                            </Grid>
                            <Grid item md={1} xs={12}>
                              <InputLabel >{": " + calOutOfBalance()}</InputLabel>
                            </Grid>
                          </Grid>
                          <br />
                          <Grid container md={12} spacing={2} >
                            <Grid item md={2} xs={12} style={{ marginLeft: '10px' }}>
                              <InputLabel ><b>Prepared By</b></InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel >{generalJournal.preparedBy == null || generalJournal.preparedBy == "" ? "" : ": " + generalJournal.preparedBy}</InputLabel>
                            </Grid>

                            <Grid item md={2} xs={12}>
                              <InputLabel ><b>Updated By</b></InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel >{generalJournal.updatedBy == null || generalJournal.updatedBy == "" ? "" : ": " + generalJournal.updatedBy}</InputLabel>
                            </Grid>

                            <Grid item md={2} xs={12}>
                              <InputLabel ><b>Checked By</b></InputLabel>
                            </Grid>
                            <Grid item md={1} xs={12}>
                              <InputLabel >{generalJournal.checkedBy == null || generalJournal.checkedBy == "" ? "" : ": " + generalJournal.checkedBy}</InputLabel>
                            </Grid>
                          </Grid>
                          <br />
                        </Box>
                      </CardContent> */}
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <div>&nbsp;</div>
                        {<ReactToPrint
                          documentTitle={generalJournal.referenceNumber + ' - Receiving Receipt'}
                          trigger={() => (
                            <Button
                              color="primary"
                              id="btnRecord"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                              size="small"
                            >
                              PDF
                            </Button>
                          )}
                          content={() => componentRef.current}
                        />}
                        {<div hidden={true}>
                          <ReceiptPDF
                            ref={componentRef}
                            generalJournal={generalJournal}
                            // suppliersPaymentID={suppliersPaymentID}
                            selectedDate={selectedDate}
                            journalData={journalData}
                            customers={customers}
                            customersPaymentID={customersPaymentID}
                            receiptBankData={receiptBankData}
                            totalValues={totalValues}
                            customerNamePDF={customerNamePDF}
                          />
                        </div>}
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

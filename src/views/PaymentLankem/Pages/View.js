import React, { useState, useEffect, useRef, Fragment } from 'react';
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
import PaymentVoucherPDF from './PaymentVoucherPDF';
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

var screenCode = "LANKEMPAYMENT"
export default function LankemPaymentView(props) {

  const { accountID, startDate, endDate, referenceNumber, IsGuestNavigation } = useParams();
  const componentRef = useRef();
  const { groupID } = useParams();
  const { factoryID } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("Payment")
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [transactionTypes, setTransactionTypes] = useState();
  const [groups, setGroups] = useState([]);
  const [selectedDate, handleDateChange] = useState(new Date().toISOString());
  const [selectedDueDate, handleDueDateChange] = useState(new Date().toISOString());
  const [journalData, setJournalData] = useState([]);
  const [accountTypeNames, setAccountTypeNames] = useState();
  const [creditTotal, setCreditTotal] = useState(0);
  const [debitTotal, setDebitTotal] = useState(0);
  const [voucherTypes, setVoucherTypes] = useState([]);
  const [transactionModeCode, setTransactionModeCode] = useState();
  const [transactionModes, setTransactionModes] = useState([]);
  const [interEstateButtonEnable, setInterEstateButtonEnable] = useState(false);
  const [tranLedgerList, setTranLedgerList] = useState([]);
  const [suppliers, setSuppliers] = useState();
  const [supplierCommon, setSupplierCommon] = useState(false);
  const [suppliersPaymentID, setSuppliersPaymentID] = useState({
    paymentTypeID: '0',
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [generalJournal, setGeneralJournal] = useState({
    groupID: '0',
    groupName: '',
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
    transactionMode: '0',
    recipientName: '',
    address: '',
    isInterEstate: false,
    interEstateID: '0',
    tranLedgerAccountID: '0',
    supplierID: '0',
    payee: '',
    modeoftransactionID: '0',
    modeoftransactionNumber: '',
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

  const [totalValues, setTotalValues] = useState({
    totalAmount: 0
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
      navigate('/app/LankemPayment/listing');
    }
  }
  const [printDate, setPrintDate] = useState('');
  const [supplierID, setSupplierID] = useState(0);
  const [supplierNamePDF, setSupplierNamePDF] = useState("Unknown Customer");
  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();
    setPrintDate(formattedDate);
  }, []);

  useEffect(() => {
    trackPromise(getPermissions());
    trackPromise(getGroupsForDropdown());
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
    if (generalJournal.factoryID.toString() !== '0') {
      trackPromise(getSuppliersForDropDown());
      trackPromise(getSuppliersPaymentID());
    }
  }, [generalJournal.factoryID]);

  useEffect(() => {
    if (journalData.length != 0) {
      calculateTotal()
    }
  }, [journalData]);

  async function getReferenceNumber() {
    if (generalJournal.referenceNumber < 1 || generalJournal.referenceNumberk == "" || generalJournal.referenceNumber == undefined) {
      let refModel = {
        groupID: generalJournal.groupID,
        factoryID: generalJournal.factoryID,
        transactionTypeID: generalJournal.transactionTypeID,
        isActive: true,
      }
      const ref = await services.getReferenceNumber(refModel);
      setGeneralJournal({ ...generalJournal, referenceNumber: ref });
    }
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
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITLANKEMPAYMENT');

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

  async function getSuppliersPaymentID() {
    const result = await services.getSuppliersPaymentID(
      generalJournal.groupID
    );
    result.forEach(item => {
      setSuppliersPaymentID(suppliersPaymentID => ({
        ...suppliersPaymentID,
        paymentTypeID: item.paymentTypeID
      }));
    });
  }

  async function getGeneralJournalDetails(referenceNumber, groupID, factoryID) {
    let response = await services.getGeneralJournalDetailsByReferenceNumber(referenceNumber, groupID, factoryID);
    let data = response;
    setTitle("View Payment");
    setSupplierID(data[0].supplierID);
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
      supplierID: data[0].supplierID,
      tranLedgerAccountID: data[0].tranLedgerAccountID,
      groupName: data[0].groupName,
      estateName: data[0].estateName,
      modeoftransactionNumber: data[0].modeoftransactionNumber,
      modeoftransactionID: data[0].modeoftransactionID,
      payee: data[0].payee,

    });
    handleDateChange(new Date(data[0].date).toISOString())
    const supplier = await services.getSuppliersForDropDown(
      parseInt(data[0].factoryID)
    );
    if ((data[0].supplierID > 0) && (supplier[data[0].supplierID].code == 'COMMON')) {
      setSupplierCommon(true);
      setSupplierNamePDF(data[0].payee);
    } else {
      setSupplierCommon(false);
      setSupplierNamePDF(supplier[data[0].supplierID].name);
    }
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
          ledgerAccountCode: element.ledgerAccountCode,
          ledgerAccountName: element.ledgerAccountName,
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

  async function getTranLedgerList() {
    const transaction = await services.getTranLedgerListForDropdown(generalJournal.factoryID);
    setTranLedgerList(transaction);
  }

  async function getSuppliersForDropDown() {
    const supplier = await services.getSuppliersForDropDown(
      generalJournal.factoryID
    );
    setSuppliers(supplier);
  }

  function calculateTotal() {

    const totalAmount = journalData.reduce((accumulator, current) => {
      const progressFraction = current.debit;
      return accumulator + progressFraction;
    }, 0);

    setTotalValues({
      ...totalValues,
      totalAmount: totalAmount
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

  function generateDropDownMenuWithTwoValues(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value.name}</MenuItem>);
      }
    }
    return items
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setGeneralJournal({
      ...generalJournal,
      [e.target.name]: value
    });
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

  function GetAll(ledgerAccountID, accountTypeNames) {
    const result = accountTypeNames.filter((a) => a.ledgerAccountID.toString() === ledgerAccountID.toString())
    return result;
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
              supplierID: generalJournal.supplierID,
              payee: generalJournal.payee

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
                              Supplier *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.supplierID && errors.supplierID
                              )}
                              fullWidth
                              helperText={touched.supplierID && errors.supplierID}
                              name="supplierID"
                              size="small"
                              onBlur={handleBlur}
                              value={generalJournal.supplierID}
                              variant="outlined"
                              id="supplierID"
                              InputProps={{
                                readOnly:
                                  true
                              }}
                            >
                              <MenuItem value="0">--Select Supplier--</MenuItem>
                              {generateDropDownMenuWithTwoValues(suppliers)}
                            </TextField>
                          </Grid>
                          {supplierCommon ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="payee">
                                Payee *
                              </InputLabel>
                              <TextField
                                error={Boolean(
                                  touched.payee && errors.payee
                                )}
                                fullWidth
                                helperText={
                                  touched.payee && errors.payee
                                }
                                name="payee"
                                size="small"
                                onBlur={handleBlur}
                                value={generalJournal.payee}
                                variant="outlined"
                                id="payee"
                                InputProps={{
                                  readOnly:
                                    true
                                }}
                              />
                            </Grid>
                            : null}
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="modeoftransactionID">
                              Mode of transaction
                            </InputLabel>
                            <TextField
                              select
                              name="modeoftransactionID"
                              size="small"
                              fullWidth
                              onBlur={handleBlur}
                              onChange={e => { handleChange1(e); }}
                              value={generalJournal.modeoftransactionID}
                              variant="outlined"
                              id="modeoftransactionID"
                              InputProps={{
                                readOnly: true
                              }}
                            >
                              <MenuItem value="0">--Select Transaction Mode--</MenuItem>
                              <MenuItem value="1"> Cheque </MenuItem>
                              <MenuItem value="2"> Fund Transfer </MenuItem>
                              <MenuItem value="3"> Cash </MenuItem>
                            </TextField>
                          </Grid>
                          {generalJournal.modeoftransactionID > 0 && generalJournal.modeoftransactionID != 3 ?
                            <Grid item md={4} xs={12}>
                              {generalJournal.modeoftransactionID == 1 ?
                                <InputLabel shrink id="modeoftransactionNumber">
                                  Cheque Number
                                </InputLabel> :
                                <InputLabel shrink id="modeoftransactionNumber">
                                  Fund Transfer Number
                                </InputLabel>}
                              <TextField
                                error={Boolean(touched.modeoftransactionNumber && errors.modeoftransactionNumber)}
                                fullWidth
                                helperText={touched.modeoftransactionNumber && errors.modeoftransactionNumber}
                                name="modeoftransactionNumber"
                                size="small"
                                onBlur={handleBlur}
                                onChange={e => handleChange1(e)}
                                value={generalJournal.modeoftransactionNumber}
                                variant="outlined"
                                InputProps={{
                                  readOnly: true
                                }}
                              />
                            </Grid> : null}
                        </Grid>
                      </CardContent>
                      <CardContent height="auto">
                        <Box style={{ border: "1px solid gray" }}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Account Name</TableCell>
                                <TableCell>Description</TableCell>
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
                                      <TableCell>
                                        <TextField
                                          variant="outlined"
                                          size={"small"}
                                          name={ID}
                                          fullWidth
                                          value={object.debit}
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

                      <CardContent>
                        {/* <Box border={1} borderColor="#626964" >
                          <Grid container md={12} spacing={2} style={{ marginTop: '1rem' }}>
                            <Grid item md={2} xs={12} style={{ marginLeft: '10px' }}>
                              <InputLabel><b>Total Debit (Rs)</b></InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel > {": " + calDebitTotal()} </InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel ><b>Total Credit (Rs)</b></InputLabel>
                            </Grid>
                            <Grid item md={2} xs={12}>
                              <InputLabel >{": " + calDebitTotal()}</InputLabel>
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
                        </Box> */}
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <div>&nbsp;</div>
                        {<ReactToPrint
                          documentTitle={generalJournal.referenceNumber + ' - Payment Voucher'}
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
                          <PaymentVoucherPDF
                            ref={componentRef}
                            generalJournal={generalJournal}
                            suppliersPaymentID={suppliersPaymentID}
                            selectedDate={selectedDate}
                            journalData={journalData}
                            suppliers={suppliers}
                            printDate={printDate}
                            totalValues={totalValues}
                            supplierNamePDF={supplierNamePDF}
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

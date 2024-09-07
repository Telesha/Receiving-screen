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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TableRow,
  InputLabel,
  Paper,
  CardHeader,
  MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import Autocomplete from '@material-ui/lab/Autocomplete';
import tokenService from 'src/utils/tokenDecoder';
import authService from 'src/utils/permissionAuth';
import _ from 'lodash';

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
  colorReject: {
    backgroundColor: "red",
  },
  colorSendToApprove: {
    backgroundColor: "#FFBE00"
  },
  colorApprove: {
    backgroundColor: "green",
  },
}));

var screenCode = "CREDITNOTE"
export default function CreditNoteAddEdit(props) {

  let decryptedVoucherNumber = 0;
  let decryptedGroupID = 0;
  let decryptedFactoryID = 0;
  const alert = useAlert();
  const classes = useStyles();
  const navigate = useNavigate();
  const { groupID, factoryID, voucherNumber } = useParams();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [title, setTitle] = useState("Credit Note Registry")
  const [TransactionDetailsList, setTransactionDetailsList] = useState([]);
  const [PreviousCreditDebitNoteDetails, setPreviousCreditDebitNoteDetails] = useState([])
  const [journalData, setJournalData] = useState([]);
  const [JournalDataTempCopy, setJournalDataTempCopy] = useState([])
  const [IsEditablePage, setIsEditablePage] = useState(false)
  const [accountTypeNames, setAccountTypeNames] = useState();
  const [creditTotal, setCreditTotal] = useState(0);
  const [debitTotal, setDebitTotal] = useState(0);
  const [CreditNoteDetails, setCreditNoteDetails] = useState({
    groupID: '0',
    factoryID: '0',
    voucherNumber: '',
    creditNoteReferenceNumber: '',
    creditNoteStatus: 0,
    creditNoteID: 0,
    creditNoteDate: new Date()
  });
  const [IsApprovedCreditNote, setIsApprovedCreditNote] = useState(false)
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isApproveCreditNoteEnabled: false
  });

  const handleClick = () => {
    navigate('/app/creditNote/listing');
  }

  useEffect(() => {
    decryptedVoucherNumber = atob(voucherNumber.toString());
    decryptedFactoryID = atob(factoryID.toString());
    decryptedGroupID = atob(groupID.toString());

    setCreditNoteDetails({
      ...CreditNoteDetails,
      groupID: parseInt(decryptedGroupID.toString()),
      factoryID: parseInt(decryptedFactoryID.toString()),
      voucherNumber: decryptedVoucherNumber === "0" ? '' : decryptedVoucherNumber
    })

    trackPromise(getPermissions())
    trackPromise(getGroupsForDropdown())

    if (decryptedVoucherNumber === "0") {
      setIsEditablePage(false)
    } else {
      setIsEditablePage(true)
      trackPromise(GetCreditNoteDetailsForEditProcessByVoucherID(decryptedGroupID, decryptedFactoryID, decryptedVoucherNumber));
    }
  }, [])

  useEffect(() => {
    trackPromise(getFactoriesByGroupID());
  }, [CreditNoteDetails.groupID]);

  useEffect(() => {
    if (CreditNoteDetails.groupID !== "0" && CreditNoteDetails.factoryID !== "0") {
      trackPromise(getAccountTypeNames(CreditNoteDetails.groupID, CreditNoteDetails.factoryID))
    }
  }, [CreditNoteDetails.groupID, CreditNoteDetails.factoryID])


  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCREDITNOTE');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isApproveCreditNoteEnabled = permissions.find(p => p.permissionCode == 'APPROVECREDITNOTE');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isApproveCreditNoteEnabled: isApproveCreditNoteEnabled !== undefined
    });

    if (decryptedGroupID !== '0' && decryptedFactoryID !== '0' && decryptedVoucherNumber !== '0') {
      setCreditNoteDetails({
        ...CreditNoteDetails,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroupList(groups);
  }

  async function getFactoriesByGroupID() {
    const factories = await services.getFactoriesByGroupID(CreditNoteDetails.groupID);
    setFactoryList(factories);
  }

  async function getAccountTypeNames(groupID, factoryID) {
    const accounts = await services.getLedgerAccountNamesForDatagrid(groupID, factoryID);
    setAccountTypeNames(accounts);
    return accounts;
  }

  async function SearchDetails(values) {
    trackPromise(GetAllTransactionAndPreviousCreditNoteDetails(CreditNoteDetails.groupID, CreditNoteDetails.factoryID, CreditNoteDetails.voucherNumber));
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setCreditNoteDetails({
      ...CreditNoteDetails,
      [e.target.name]: value
    });
  }

  function ClearData() {
    setCreditNoteDetails({
      ...CreditNoteDetails,
      voucherNumber: '',
      creditNoteStatus: '0',
      creditNoteReferenceNumber: ''
    });
    setTransactionDetailsList([]);
    setPreviousCreditDebitNoteDetails([]);
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

  function handleSearchDropdownChange(e, data, rowID) {
    if (data === undefined || data === null)
      return;
    let valueV = data["ledgerAccountID"];
    const newArr = [...journalData];
    var idx = newArr.findIndex(e => e.rowID == parseInt(rowID));
    let reuslt = GetAll(valueV, accountTypeNames);
    const existingRecords = newArr.filter(record => record.AccountTypeName == valueV);
    if (newArr[idx].accountTypeName !== parseInt(valueV)) {
      newArr[idx] = {
        ...newArr[idx],
        accountTypeName: parseInt(valueV),
        selected: reuslt,
        disableCreditField: existingRecords.length > 0 ? existingRecords[0].disableCreditField : false,
        disableDebitField: existingRecords.length > 0 ? existingRecords[0].disableDebitField : false,
        debit: 0,
        credit: 0,
        description: ""
      };
    } else {
      newArr[idx] = {
        ...newArr[idx],
        accountTypeName: parseInt(valueV),
        selected: reuslt
      };
    }
    setJournalData(newArr)
  }

  function GetAll(ledgerAccountID, accountTypeNames) {
    const result = accountTypeNames.filter((a) => a.ledgerAccountID.toString() === ledgerAccountID.toString())
    return result;
  }

  function changeText(e, rowID, inputType) {
    const target = e.target;
    const value = target.value

    const newArr = [...journalData];
    var idx = newArr.findIndex(e => e.rowID == parseInt(rowID));
    const AccountTypeName = newArr[idx].accountTypeName;
    for (let i = 0; i < newArr.length; i++) {
      if (i !== idx && newArr[i].accountTypeName === AccountTypeName) {
        if (inputType === 'credit' && parseInt(newArr[i].debit) !== 0) {
          alert.error('No Credit amounts are allowed for this Account.');
          return;
        }
        else if (inputType === 'debit' && parseInt(newArr[i].credit) !== 0) {
          alert.error('No Debit amounts are allowed for this Account.');
          return;
        }
      }
    }
    if (inputType === "description") {
      newArr[idx] = { ...newArr[idx], description: value };
    } else if (inputType === "credit") {

      let debitBool = false
      let creditBool = false
      if (parseFloat(value.toString()) > 0) {
        debitBool = true;
        creditBool = false
      }
      newArr[idx] = { ...newArr[idx], credit: (value === "" ? 0 : parseFloat(value)), disableCreditField: creditBool, disableDebitField: debitBool };
    } else {

      let debitBool = false
      let creditBool = false
      if (parseFloat(value.toString()) > 0) {
        debitBool = false;
        creditBool = true
      }
      newArr[idx] = { ...newArr[idx], debit: (value === "" ? 0 : parseFloat(value)), disableCreditField: creditBool, disableDebitField: debitBool };
    }
    setJournalData(newArr)
  }


  function GenerateRandomID() {
    const d = new Date();
    let ms = d.valueOf();
    let rendomValue = ((ms + Math.floor(Math.random() * 10000)) - 12) + ((ms - 128) + (ms * 512))
    return rendomValue;
  }


  function onKeyDown(e, id, data) {
    if (e.key === "Tab") {
      if (data.credit != 0 || data.debit != 0) {
        if (journalData[journalData.length - 1].rowID.toString() === id.toString()) {
          let ID = GenerateRandomID()
          const temp = [...journalData];
          journalData.push({ accountTypeName: 0, credit: 0, debit: 0, creditNoteDetailsID: 0, rowID: ID, selected: [] })
          setJournalData(journalData)
        }
      }
      else {
        alert.error("please enter Debit/Credit Values");
      }
    }
  };

  function calDebitTotal() {
    let sum = 0;
    journalData.forEach(x => {
      sum += parseFloat(x.debit);
      x.debit = parseFloat(x.debit);
      x.creditNoteDetailsID = parseFloat(x.creditNoteDetailsID);
      x.description = x.description;

    });
    setDebitTotal(sum.toFixed(2));
    return sum.toFixed(2);
  }

  function calCreditTotal() {
    let sum = 0;
    journalData.forEach(x => {
      sum += parseFloat(x.credit);

    });
    setCreditTotal(sum.toFixed(2));
    return sum.toFixed(2);
  }

  function calOutOfBalance() {
    return (parseFloat(creditTotal) - parseFloat(debitTotal)).toFixed(2);
  }

  async function GetAllTransactionAndPreviousCreditNoteDetails(groupID, factoryID, voucherNumber) {
    let resuestModel = {
      groupID: parseInt(groupID.toString()),
      factoryID: parseInt(factoryID.toString()),
      VoucherNumber: (voucherNumber.toString())
    }

    const response = await services.GetAllTransactionAndPreviousCreditNoteDetails(resuestModel)

    if (response.statusCode === "Success") {
      let ID = GenerateRandomID()
      let tempDetails = []
      tempDetails.push({ accountTypeName: 0, credit: 0, debit: 0, creditNoteDetailsID: 0, rowID: ID, selected: [] })
      setJournalData(tempDetails)
      const data = response.data;
      setTransactionDetailsList(data.creditNoteTransactionDetailsReturnModels)
      setPreviousCreditDebitNoteDetails(data.creditNotePreviousDetailsReturnModels)

    } else {
      alert.error(response.message)
      setTransactionDetailsList([])
      setPreviousCreditDebitNoteDetails([])
    }
  }


  async function GetCreditNoteDetailsForEditProcessByVoucherID(groupID, factoryID, voucherNumber) {
    let resuestModel = {
      groupID: parseInt(groupID.toString()),
      factoryID: parseInt(factoryID.toString()),
      VoucherNumber: (voucherNumber.toString())
    }

    const response = await services.GetCreditNoteDetailsForEditProcessByVoucherID(resuestModel)
    if (response.statusCode === "Success") {
      const data = response.data;

      setIsApprovedCreditNote(data.creditDebitNoteBasicDetailsReturnModel.statusID === 2)

      setCreditNoteDetails({
        ...CreditNoteDetails,
        groupID: parseInt(data.creditDebitNoteBasicDetailsReturnModel.groupID),
        factoryID: parseInt(data.creditDebitNoteBasicDetailsReturnModel.factoryID),
        voucherNumber: (data.creditDebitNoteBasicDetailsReturnModel.originalVoucherNo),
        creditNoteStatus: parseInt(data.creditDebitNoteBasicDetailsReturnModel.statusID),
        creditNoteID: parseInt(data.creditDebitNoteBasicDetailsReturnModel.creditNoteID),
        creditNoteReferenceNumber: data.creditDebitNoteBasicDetailsReturnModel.creditNoteReferenceNumber
      });
      setTransactionDetailsList(data.creditNoteTransactionDetailsReturnModels)
      setPreviousCreditDebitNoteDetails(data.creditNotePreviousDetailsReturnModels)

      let accountNameList = await getAccountTypeNames(data.creditDebitNoteBasicDetailsReturnModel.groupID, data.creditDebitNoteBasicDetailsReturnModel.factoryID);
      let temp = data.creditNotePreviousPendingDetailsReturnModels
      const sd = []
      for (const iterator of temp) {
        let reuslt = GetAll(iterator.ledgerAccountID, accountNameList);
        sd.push(
          {
            accountTypeName: iterator.ledgerAccountID,
            credit: iterator.creditAmount,
            debit: iterator.debitAmount,
            description: iterator.description,
            creditNoteDetailsID: iterator.creditNoteNumber,
            disableDebitField: parseFloat(iterator.creditAmount.toString()) > 0 ? true : false,
            disableCreditField: parseFloat(iterator.debitAmount.toString()) > 0 ? true : false,
            rowID: GenerateRandomID(),
            selected: reuslt
          }
        )
      }
      setJournalData(sd)
      setJournalDataTempCopy(sd)
      return true;

    } else {
      alert.error(response.message)
      setTransactionDetailsList([])
      setPreviousCreditDebitNoteDetails([])
      return false;
    }
  }

  async function SendToApproveCreditNoteDetails() {

    var reg = new RegExp('^[0-9]*$');

    if (reg.test(CreditNoteDetails.creditNoteReferenceNumber) == false) {
      alert.error("Debit Note Reference Number Allow Only Numbers")
      return;
    }

    if (CreditNoteDetails.creditNoteReferenceNumber === "") {
      alert.error("Credit Note Reference Number is Required")
      return;
    }

    if (calOutOfBalance() != 0) {
      alert.error("Ledger Account Amount are not balanced, Please check");
      return;
    }

    const journalDataConverted = journalData.map(({ credit, debit, description, creditNoteDetailsID, accountTypeName }) => {
      return { credit, debit, description, creditNoteDetailsID, accountTypeName };
    });

    const journalDataCopyConverted = JournalDataTempCopy.map(({ credit, debit, description, creditNoteDetailsID, accountTypeName }) => {
      return { credit, debit, description, creditNoteDetailsID, accountTypeName };
    });

    var result2 = _.differenceWith(journalDataConverted, journalDataCopyConverted, _.isEqual);

    let requestModel = {
      groupID: parseInt(CreditNoteDetails.groupID.toString()),
      factoryID: parseInt(CreditNoteDetails.factoryID.toString()),
      creditNoteID: parseInt(CreditNoteDetails.creditNoteID.toString()),
      voucherNumber: CreditNoteDetails.voucherNumber,
      ledgerAccountDetails: result2,
      creditNoteReferenceNumber: CreditNoteDetails.creditNoteReferenceNumber,
      createdBy: tokenService.getUserIDFromToken(),
      creditNoteCreatedDate: CreditNoteDetails.creditNoteDate.toISOString()
    }

    const response = await services.SendToApproveCreditNoteDetails(requestModel)

    if (response.statusCode === "Success") {
      alert.success(response.message)
      navigate('/app/creditNote/listing');
    } else {
      alert.error(response.message)
      setTransactionDetailsList([])
      setPreviousCreditDebitNoteDetails([])
    }
  }

  async function ApproveCreditNoteDetails() {

    if (journalData[0].credit != 0 || journalData[0].debit != 0) {
      let index = journalData.findIndex(x => x.accountTypeName === 0);
      if (index >= 0) {
        alert.error('Account name is required, please check');
        journalData.splice(index, 1);
        return;
      }
      var reg = new RegExp('^[0-9]*$');

      if (reg.test(CreditNoteDetails.creditNoteReferenceNumber) == false) {
        alert.error("Debit Note Reference Number Allow Only Numbers")
        return;
      }

      if (CreditNoteDetails.creditNoteReferenceNumber === "") {
        alert.error("Credit Note Reference Number is Required")
        return;
      }

      if (calOutOfBalance() != 0) {
        alert.error("Credit and Debit Records Should be Balanced");
        return;
      }
      const journalDataConverted = journalData.map(({ credit, debit, description, creditNoteDetailsID, accountTypeName }) => {
        return { credit, debit, description, creditNoteDetailsID, accountTypeName };
      });

      const journalDataCopyConverted = JournalDataTempCopy.map(({ credit, debit, description, creditNoteDetailsID, accountTypeName }) => {
        return { credit, debit, description, creditNoteDetailsID, accountTypeName };
      });

      var finalArray = journalData.filter(e => e.accountTypeName !== 0)

      let requestModel = {
        groupID: parseInt(CreditNoteDetails.groupID.toString()),
        factoryID: parseInt(CreditNoteDetails.factoryID.toString()),
        creditNoteID: parseInt(CreditNoteDetails.creditNoteID.toString()),
        voucherNumber: CreditNoteDetails.voucherNumber,
        ledgerAccountDetails: finalArray,
        creditNoteReferenceNumber: CreditNoteDetails.creditNoteReferenceNumber,
        createdBy: tokenService.getUserIDFromToken(),
        creditNoteCreatedDate: CreditNoteDetails.creditNoteDate.toISOString()
      }

      const response = await services.ApproveCreditNoteDetails(requestModel)
      if (response.statusCode === "Success") {
        alert.success(response.message)
        navigate('/app/creditNote/listing');

      } else {
        alert.error(response.message)
        setTransactionDetailsList([])
        setPreviousCreditDebitNoteDetails([])
      }
    }
    else {
      alert.error("please enter Debit/Credit Values");
    }
  }

  async function RejectCreditNote() {
    let requestModel = {
      creditNoteID: parseInt(CreditNoteDetails.creditNoteID.toString()),
      createdBy: tokenService.getUserIDFromToken()
    }

    const response = await services.RejectCreditNoteDetails(requestModel)

    if (response.statusCode === "Success") {
      alert.success(response.message)
      navigate('/app/creditNote/listing');
    } else {
      alert.error(response.message)
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: CreditNoteDetails.groupID,
              factoryID: CreditNoteDetails.factoryID,
              voucherNumber: CreditNoteDetails.voucherNumber,
              creditNoteReferenceNumber: CreditNoteDetails.creditNoteReferenceNumber
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                voucherNumber: Yup.string().max(255).required('Voucher code is required'),
              })
            }
            onSubmit={() => trackPromise(SearchDetails())}
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

                      <CardContent>
                        <Grid container spacing={3} >
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onChange={(e) => handleChange(e)}
                              value={values.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              disabled={!permissionList.isGroupFilterEnabled || IsEditablePage}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
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
                              onChange={(e) => handleChange(e)}
                              value={values.factoryID}
                              variant="outlined"
                              id="factoryID"
                              size='small'
                              disabled={!permissionList.isFactoryFilterEnabled || IsEditablePage}
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="voucherNumber">
                              Voucher Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.voucherNumber && errors.voucherNumber)}
                              fullWidth
                              helperText={touched.voucherNumber && errors.voucherNumber}
                              name="voucherNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={values.voucherNumber}
                              variant="outlined"
                              size='small'
                              disabled={IsEditablePage}
                            />
                          </Grid>
                        </Grid>

                        <Grid container spacing={3} >
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="creditNoteReferenceNumber">
                              Credit Note Reference Number
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.creditNoteReferenceNumber && errors.creditNoteReferenceNumber)}
                              fullWidth
                              helperText={touched.creditNoteReferenceNumber && errors.creditNoteReferenceNumber}
                              name="creditNoteReferenceNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={values.creditNoteReferenceNumber}
                              variant="outlined"
                              size='small'
                              disabled={IsEditablePage}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      {
                        IsEditablePage === false ?
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              color="primary"
                              type="submit"
                              variant="contained"
                              size='small'
                            >
                              Search
                            </Button>
                          </Box>
                          :
                          null
                      }

                      {
                        PreviousCreditDebitNoteDetails.length > 0 || TransactionDetailsList.length > 0 ?
                          <>
                            <Box mt={0}>
                              <Card>
                                <PerfectScrollbar>
                                  <Divider />
                                  <CardContent>
                                    <Card>
                                      <CardHeader>

                                      </CardHeader>
                                      <CardContent>
                                        {
                                          TransactionDetailsList.length > 0 ?
                                            <Box minWidth={1000} height="auto" >
                                              <br /><label style={{ fontWeight: "bold" }}>Transaction Details</label>       <br />
                                              <TableContainer style={{ marginTop: "10px", maxHeight: "200px" }} component={Paper} className={classes.tableContainer}>
                                                <Table size="small">
                                                  <TableHead>
                                                    <TableRow >
                                                      <TableCell>Voucher Code</TableCell>
                                                      <TableCell>Transaction Date</TableCell>
                                                      <TableCell>Account Name</TableCell>
                                                      <TableCell>Credit Amount</TableCell>
                                                      <TableCell>Debit Amount</TableCell>
                                                    </TableRow>
                                                  </TableHead>
                                                  <TableBody>
                                                    {TransactionDetailsList.map((data, index) => (
                                                      <TableRow key={data.creditNoteDetailsID}>
                                                        <TableCell>{data.voucherNumber}</TableCell>
                                                        <TableCell>{data.transactionDate.split('T')[0]}</TableCell>
                                                        <TableCell>{data.ledgerAccountName}</TableCell>
                                                        <TableCell>{data.creditAmount.toFixed(2)}</TableCell>
                                                        <TableCell>{data.debitAmount.toFixed(2)}</TableCell>
                                                      </TableRow>
                                                    ))}
                                                  </TableBody>
                                                </Table>
                                              </TableContainer>
                                            </Box> : null
                                        }

                                        {
                                          PreviousCreditDebitNoteDetails.length > 0 ?
                                            <Box minWidth={1000} height="auto" >
                                              <br /><label style={{ fontWeight: "bold" }}>Previous Credit Note Details</label>     <br />
                                              <TableContainer style={{ marginTop: "10px", maxHeight: "200px" }} component={Paper} className={classes.tableContainer}>
                                                <Table size="small">
                                                  <TableHead>
                                                    <TableRow >
                                                      <TableCell>CN No &ensp;&ensp;&ensp;&ensp;&nbsp;</TableCell>
                                                      <TableCell>Voucher Code &ensp;&ensp;&ensp;&nbsp;&nbsp;&nbsp;&nbsp;</TableCell>
                                                      <TableCell>Account Name</TableCell>
                                                      <TableCell>Credit Amount</TableCell>
                                                      <TableCell>Debit Amount</TableCell>

                                                    </TableRow>
                                                  </TableHead>
                                                  <TableBody>
                                                    {PreviousCreditDebitNoteDetails.map((data, index) => (
                                                      <TableRow>
                                                        <TableCell>{data.creditNoteNumber}</TableCell>
                                                        <TableCell>{data.voucherNumber}</TableCell>
                                                        <TableCell>{data.ledgerAccountName}</TableCell>
                                                        <TableCell>{data.creditAmount.toFixed(2)}</TableCell>
                                                        <TableCell>{data.debitAmount.toFixed(2)}</TableCell>
                                                      </TableRow>
                                                    ))}
                                                  </TableBody>
                                                </Table>
                                              </TableContainer>
                                            </Box> : null
                                        }
                                      </CardContent>
                                    </Card>
                                  </CardContent>
                                </PerfectScrollbar>
                              </Card>
                            </Box>

                            {
                              journalData.length > 0 ?
                                <CardContent height="auto">
                                  <Box style={{ border: "1px solid gray" }}>

                                    <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Account Name</TableCell>
                                          <TableCell>Description</TableCell>
                                          <TableCell>Credit</TableCell>
                                          <TableCell>Debit</TableCell>
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
                                                    autoFocus
                                                    id={ID.toString()}
                                                    options={accountTypeNames}
                                                    size={"small"}
                                                    style={{ width: "20rem" }}
                                                    getOptionLabel={(option) => option.ledgerAccountName}
                                                    onChange={(e, value) => handleSearchDropdownChange("accountName", value, ID)}
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
                                                    onBlur={handleBlur}
                                                    onChange={(e) => changeText(e, ID, "description")}
                                                    value={object.description}
                                                    fullWidth />
                                                </TableCell>
                                                <TableCell>
                                                  <TextField
                                                    variant="outlined"
                                                    size={"small"}
                                                    name={ID}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => changeText(e, ID, "credit")}
                                                    value={object.credit}
                                                    fullWidth
                                                    inputProps={{ readOnly: object.disableCreditField }}

                                                  />
                                                </TableCell>
                                                <TableCell>
                                                  <TextField
                                                    variant="outlined"
                                                    size={"small"}
                                                    name={ID}
                                                    onBlur={handleBlur}
                                                    fullWidth
                                                    onChange={(e) => changeText(e, ID, "debit")}
                                                    value={object.debit}
                                                    onKeyDown={(e) => onKeyDown(e, ID, object)}
                                                    inputProps={{ readOnly: object.disableDebitField }}
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
                                : null
                            }

                            {
                              CreditNoteDetails.creditNoteStatus !== 2 && IsApprovedCreditNote === false ?
                                <CardContent>
                                  <Box paddingLeft={2} border={1} borderColor="#626964" >
                                    <Grid container md={12} spacing={2} style={{ marginTop: '1rem' }}>

                                      <Grid item md={2} xs={12}>
                                        <InputLabel><b> Total Debit (Rs)</b></InputLabel>
                                      </Grid>
                                      <Grid item md={2} xs={12}>
                                        <InputLabel > {": " + calDebitTotal()} </InputLabel>
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
                                      <Grid item md={2} xs={12}>
                                        <InputLabel >{": " + calOutOfBalance()}</InputLabel>
                                      </Grid>
                                    </Grid>
                                    <br />
                                    {/* <Grid container md={12} spacing={2} >
                                  <Grid item md={2} xs={12}>
                                    <InputLabel ><b>Prepared By</b></InputLabel>
                                  </Grid>
                                  <Grid item md={2} xs={12}>
                                    <InputLabel >{isUpdate ? ": " + generalJournal.preparedBy : ": " + findLoginUser()}</InputLabel>
                                  </Grid>
                                  {isUpdate ?
                                    <Grid item md={2} xs={12}>
                                      <InputLabel ><b>Updated By</b></InputLabel>
                                    </Grid> : null}
                                  {isUpdate ?
                                    <Grid item md={2} xs={12}>
                                      <InputLabel >{": " + findLoginUser()}</InputLabel>
                                    </Grid> : null}
                                </Grid> */}
                                    {/* //Still not configured the requirment */}
                                    <br />
                                  </Box>
                                </CardContent>
                                : null
                            }

                            <Box display="flex" justifyContent="flex-end" p={2}>
                              {
                                CreditNoteDetails.creditNoteStatus !== 2 && IsApprovedCreditNote === false ?
                                  <>
                                    <Button
                                      color="primary"
                                      variant="outlined"
                                      onClick={() => ClearData()}
                                      size='small'
                                    >
                                      Cancel
                                    </Button>
                                    <div>&nbsp;</div>
                                  </> : null
                              }
                              {
                                CreditNoteDetails.creditNoteStatus !== 3 && CreditNoteDetails.creditNoteStatus !== 2 && IsEditablePage === true && IsApprovedCreditNote === false ?
                                  <>
                                    <Button
                                      color="primary"
                                      variant="contained"
                                      className={classes.colorReject}
                                      onClick={() => trackPromise(RejectCreditNote())}
                                      size='small'
                                    >
                                      Reject
                                    </Button>
                                    <div>&nbsp;</div>
                                  </>
                                  : null
                              }
                              {
                                CreditNoteDetails.creditNoteStatus !== 2 && IsApprovedCreditNote === false ?
                                  <>
                                    <Button
                                      color="primary"
                                      onClick={() => trackPromise(SendToApproveCreditNoteDetails())}
                                      variant="contained"
                                      className={classes.colorSendToApprove}
                                      size='small'
                                    >
                                      Send to Approve
                                    </Button>
                                    <div>&nbsp;</div>
                                  </>
                                  : null
                              }
                              {
                                permissionList.isApproveCreditNoteEnabled && CreditNoteDetails.creditNoteStatus !== 2 && IsApprovedCreditNote === false ?
                                  <>
                                    <Button
                                      color="primary"
                                      variant="contained"
                                      onClick={() => trackPromise(ApproveCreditNoteDetails())}
                                      className={classes.colorApprove}
                                      size='small'
                                    >
                                      Approve
                                    </Button>

                                    <div>&nbsp;</div>
                                  </>
                                  : null
                              }
                            </Box>
                          </>
                          : null
                      }
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment >
  );
};

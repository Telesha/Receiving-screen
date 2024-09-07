import React, { useState, useEffect, Fragment } from 'react';
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
import { Formik } from 'formik';
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import tokenDecoder from '../../../utils/tokenDecoder';
import { confirmAlert } from 'react-confirm-alert';
import Autocomplete from '@material-ui/lab/Autocomplete';

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
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecordAndNew: {
    backgroundColor: "#FFBE00"
  },
  colorRecord: {
    backgroundColor: "green",
  },
}));

var screenCode = "LANKEMPAYMENT"
export default function LankemPaymentApprove(props) {

  const { referenceNumber } = useParams();
  const { groupID } = useParams();
  const { factoryID } = useParams();
  const [title, setTitle] = useState("Payment")
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [transactionTypes, setTransactionTypes] = useState();
  const [groups, setGroups] = useState();
  const [open, setOpen] = useState(true);
  const [refNo, setRefNo] = useState();
  const [interEstateButtonEnable, setInterEstateButtonEnable] = useState(false);
  const [referenceNumberInter, setReferenceNumberInter] = useState();
  const [generalJournal, setGeneralJournal] = useState({
    groupID: '0',
    factoryID: '0',
    transactionTypeID: '0',
    referenceNumber: '',
    referenceNumberInter: '',
    description: '',
    payModeID: '0',
    chequeNumber: '',
    isActive: true,
    preparedBy: '',
    updatedBy: '',
    voucherType: '0',
    voucherCode: '',
    transactionMode: '0',
    recipientName: '',
    address: '',
    isInterEstate: false,
    interEstateID: '0',
    date: '',
    tranLedgerAccountID: '0',
    supplierID: '0'
  });
  const [selectedDate, handleDateChange] = useState(new Date().toISOString());
  const [selectedDueDate, handleDueDateChange] = useState(new Date().toISOString());
  const [journalData, setJournalData] = useState([]);
  const [journalData1, setJournalData1] = useState([]);
  const [accountTypeNames, setAccountTypeNames] = useState();
  const [creditTotal, setCreditTotal] = useState(0);
  const [debitTotal, setDebitTotal] = useState(0);
  const [status, setStatus] = useState(0);
  const [transactionModeCode, setTransactionModeCode] = useState();
  const alert = useAlert();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/LankemPayment/listing');
  }
  const [voucherTypes, setVoucherTypes] = useState([]);
  const [transactionModes, setTransactionModes] = useState([]);
  const [tranLedgerList, setTranLedgerList] = useState([]);
  const [suppliers, setSuppliers] = useState();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [RejectRemark, setRejectRemark] = useState("")

  const handleClose = () => {
    setOpen(false);
  };

  let decrypted = 0;
  let decryptedfactoryID = 0;
  let decryptedgroupID = 0

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
    decryptedgroupID = atob(groupID.toString());
    decryptedfactoryID = atob(factoryID.toString());
    if (decrypted != 0) {
      trackPromise(getGeneralJournalDetails(decrypted, decryptedgroupID, decryptedfactoryID))
    } else {
      setJournalData([
        {
          accountTypeName: 0,
          credit: 0,
          debit: 0,
          description: undefined,
          ledgerTransactionID: 0,
          rowID: GenerateRandomID()
        }
      ])
    }
  }, []);


  useEffect(() => {
    if (generalJournal.factoryID.toString() !== '0') {
      trackPromise(getSuppliersForDropDown());
    }
  }, [generalJournal.factoryID]);

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
    if (generalJournal.voucherCode !== '') {
      trackPromise(getReferenceNumberInter());
    }
  }, [generalJournal.voucherCode]);


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
      setRefNo(ref.data);
    }
  }

  async function getReferenceNumberInter() {
    if (parseInt(generalJournal.interEstateID) > 0) {
      let refModel = {
        groupID: generalJournal.groupID,
        factoryID: generalJournal.interEstateID,
        date: new Date(generalJournal.date).toISOString().split('-')[0],
        voucherCode: generalJournal.voucherCode
      };
      const ref = await services.getReferenceNumber(refModel);
      setReferenceNumberInter(ref.data)
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

  async function getGeneralJournalDetails(referenceNumber, groupID, factoryID) {
    let response = await services.getGeneralJournalDetailsByReferenceNumber(referenceNumber, groupID, factoryID);
    let data = response;
    setTitle("Approve Payment");
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
      isInterEstate: data[0].isInterEstate,
      interEstateID: data[0].interEstateID,
      voucherCode: data[0].voucherCode,
      isMain: data[0].isMain,
      date: data[0].date,
      supplierID: data[0].supplierID,
      tranLedgerAccountID: data[0].tranLedgerAccountID
    });
    setStatus(data[0].status);
    setRefNo(data[0].referenceNumber);
    let tranLedgerAccountID = data[0].tranLedgerAccountID
    let copyArray = data;

    let accountNameList = await getAccountTypeNames(data[0].groupID, data[0].factoryID);
    let tempArray = [...journalData]
    let tempArray1 = [...journalData]
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

    copyArray.forEach(element => {
      let reuslt = GetAll(element.accountTypeName, accountNameList);
      tempArray1.push(
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
    setJournalData1(tempArray1)
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function ApproveGeneralGournal() {
    let approveModel = {
      groupID: generalJournal.groupID,
      factoryID: generalJournal.factoryID,
      transactionTypeID: generalJournal.transactionTypeID,
      referenceNumber: generalJournal.referenceNumber,
      referenceNumberInter: referenceNumberInter,
      chequeNumber: generalJournal.chequeNumber,
      voucherType: generalJournal.voucherType,
      transactionMode: generalJournal.transactionMode,
      voucherCode: generalJournal.voucherCode,
      recipientName: generalJournal.recipientName,
      isActive: true,
      journalData: journalData1,
      date: selectedDate,
      dueDate: selectedDueDate,
      interEstateID: generalJournal.interEstateID,
      isInterEstate: generalJournal.isInterEstate,
      isMain: generalJournal.isMain
    };


    confirmAlert({
      title: 'Confirm To Approve',
      message: 'Are you sure you want to approve this?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => Approve(approveModel)
        },
        {
          label: 'No',
          onClick: () => handleClose()
        }
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
    });

  }

  async function Approve(approveModel) {
    let response = await services.approveGeneralJournal(approveModel);
    if (response.statusCode == "Success") {
      alert.success('Payment approved successfully');
      navigate('/app/LankemPayment/listing');
    }
    else {
      alert.error(response.message);
    }
  }

  async function getVoucherTypeList() {
    const voucherTypes = await services.getVoucherTypeList();
    setVoucherTypes(voucherTypes);
    return voucherTypes;
  }

  async function getTransactionModeList() {
    const transactionModes = await services.getTransactionModeList();
    setTransactionModes(transactionModes);
    return transactionModes
  }

  async function getTranLedgerList() {
    const transaction = await services.getTranLedgerListForDropdown(generalJournal.factoryID);
    setTranLedgerList(transaction);
  }

  async function getSuppliersForDropDown() {
    const supplier = await services.getSuppliersForDropDown(
      generalJournal.groupID
    );
    setSuppliers(supplier);
  }

  async function RejectGeneralJournalTransaction() {

    if (RejectRemark === "") {
      alert.error("Rejecting Remark is required");
      return;
    }

    confirmAlert({
      title: 'Confirm To Reject',
      message: 'Are you sure you want to reject this?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => trackPromise(Reject())
        },
        {
          label: 'No',
          onClick: () => handleClose()
        }
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
    });


  }
  async function Reject() {
    let rejectModel = {
      groupID: parseInt(generalJournal.groupID.toString()),
      factoryID: parseInt(generalJournal.factoryID.toString()),
      referenceNumber: generalJournal.referenceNumber.toString(),
      rejectRemark: "Rejecting Remark :- " + RejectRemark.toString(),
    }
    const response = await services.ReJectLedgerTransaction(rejectModel)
    if (response.statusCode == "Success") {
      alert.success(response.message);
      navigate('/app/LankemPayment/listing');
    }
    else {
      alert.error(response.message);
    }
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

  function GetAll(ledgerAccountID, accountTypeNames) {
    const result = accountTypeNames.filter((a) => a.ledgerAccountID.toString() === ledgerAccountID.toString())
    return result;
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setGeneralJournal({
      ...generalJournal,
      [e.target.name]: value
    });
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
          journalData.push({ accountTypeName: 0, credit: 0, debit: 0, ledgerTransactionID: 0, rowID: ID, selected: [] })
          var result = refNo == undefined ? 0 : refNo.substring(0, 3);
          setJournalData(journalData)
          if (result == 'CHP') {
            getChequeNumber(data)
          }
        }
      }
      else {
        alert.error("please enter Debit/Credit Values");
      }
    }
  };

  async function getChequeNumber(data) {
    let response = await services.getChequeNumber(data.accountTypeName);
    if (response.data == null) {
      alert.error(response.message);
    }
    else {
      setGeneralJournal({
        ...generalJournal,
        chequeNumber: response.data
      });
    }
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

  function findLoginUser() {
    return tokenDecoder.getUserNameFromToken();
  }

  function Cancel() {
    navigate('/app/LankemPayment/listing');
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

  function handleChange2(e) {
    const target = e.target;
    const value = target.value

    setGeneralJournal({
      ...generalJournal,
      [e.target.name]: value
    });

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
              supplierID: generalJournal.supplierID
            }}

            onSubmit={(event) => ApproveGeneralGournal(event)}
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
                                onChange={(e) => handleChange1(e)}
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
                          {/* <Grid item md={4} xs={12}>
                            <InputLabel shrink id="transactionMode">
                              Transaction Mode *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.transactionMode && errors.transactionMode)}
                              fullWidth
                              helperText={touched.transactionMode && errors.transactionMode}
                              name="transactionMode"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange2(e)}
                              value={generalJournal.transactionMode}
                              variant="outlined"
                              id="transactionMode"
                              InputProps={{
                                readOnly: true,
                              }}
                            >
                              <MenuItem value="0">--Select Transaction Mode--</MenuItem>
                              {generateDropownForTransactionModeList(transactionModes)}
                            </TextField>
                          </Grid> */}
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
                              onChange={(e) => handleChange1(e)}
                              value={generalJournal.referenceNumber}
                              variant="outlined"
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          </Grid>
                          {/* <Grid item md={4} xs={12}>
                            <FormControlLabel
                              style={{ marginTop: '25px' }}
                              control={
                                <Switch
                                  checked={generalJournal.isInterEstate}
                                  onChange={(e) => isInterEstatehandleChange(e)}
                                  name="isInterEstate"
                                  disabled={true}
                                />
                              }
                              label="Is Inter Estate"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="interEstateID">
                              Inter Estate *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.interEstateID && errors.interEstateID
                              )}
                              fullWidth
                              helperText={touched.interEstateID && errors.interEstateID}
                              name="interEstateID"
                              size="small"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={generalJournal.interEstateID}
                              variant="outlined"
                              id="factoryID"
                              disabled={true}
                            >
                              <MenuItem value="0">--Select Inter Estate--</MenuItem>
                              {generateDropDownMenuForInterEstate(factories, generalJournal.factoryID)}
                            </TextField>
                          </Grid> */}
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
                                  onChange={(e) => {
                                    handleDueDateChange(e)
                                  }}
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
                                onChange={(e) => handleChange1(e)}
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
                                onChange={(e) => handleChange1(e)}
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
                                <TableCell>Amount</TableCell>
                                {/* <TableCell>Credit</TableCell> */}
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
                                          // onKeyDown={(e) => onKeyDown(e, ID, object)}
                                          disabled={true}
                                        />
                                      </TableCell>
                                      {/* <TableCell>
                                        <TextField
                                          variant="outlined"
                                          size={"small"}
                                          name={ID}
                                          onBlur={handleBlur}
                                          value={object.credit}
                                          fullWidth
                                          disabled={true}
                                        />
                                      </TableCell> */}
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
                          <Grid container md={12} spacing={2} style={{ marginTop: '1rem', marginLeft: '1rem' }}>

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
                          <Grid container md={12} spacing={2} style={{ marginLeft: '1rem' }}>
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
                              <InputLabel >{": " + findLoginUser()}</InputLabel>
                            </Grid>
                          </Grid>
                          <br />
                        </Box> */}
                        {status != 2 ?
                          <>
                            <Grid container spacing={3} style={{ marginTop: "0.5rem" }}>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="rejectRemark">
                                  Rejecting Remark *
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  size='small'
                                  name="rejectRemark"
                                  onBlur={handleBlur}
                                  onChange={(e) => setRejectRemark(e.target.value.toString())}
                                  value={RejectRemark}
                                  variant="outlined"
                                  id="rejectRemark"
                                />
                              </Grid>
                            </Grid>
                          </>
                          : null}
                      </CardContent>

                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          variant="outlined"
                          color="primary"
                          id="btnCancel"
                          style={{ marginRight: '1rem' }}
                          onClick={() => Cancel()}
                        >
                          Cancel
                        </Button>
                        {status != 2 ?
                          <>
                            <Button
                              color="primary"
                              id="btnReject"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                              onClick={() => RejectGeneralJournalTransaction()}
                            >
                              Reject
                            </Button>
                            <Button
                              color="primary"
                              id="btnRecord"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorRecord}
                              type="submit"
                            >
                              Approve
                            </Button>
                          </>
                          : null}

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



import React, { useState, useEffect, Fragment, useRef } from 'react';
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
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
  Hidden,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from 'yup';
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from 'react-alert';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from '@material-ui/pickers';
import tokenDecoder from '../../../utils/tokenDecoder';
import Autocomplete from '@material-ui/lab/Autocomplete';

const useStyles = makeStyles(theme => ({
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
    backgroundColor: 'red'
  },
  colorRecordAndNew: {
    backgroundColor: '#FFBE00'
  },
  colorRecord: {
    backgroundColor: 'green'
  }
}));

var screenCode = 'LANKEMPAYMENT';
export default function LankemPaymentAddEdit(props) {
  const navigate = useNavigate();
  const alert = useAlert();
  const { referenceNumber } = useParams();
  const { groupID } = useParams();
  const { factoryID } = useParams();
  const [title, setTitle] = useState('Payment');
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [suppliers, setSuppliers] = useState();
  const [suppliersAuto, setSuppliersAuto] = useState();
  const [payVoucherCode, setPayVoucherCode] = useState();
  const [groups, setGroups] = useState();
  const [voucherTypes, setVoucherTypes] = useState([]);
  const [transactionModes, setTransactionModes] = useState([]);
  const [newarrayfromsave, setNewarrayfromsave] = useState([]);
  const [tranLedgerList, setTranLedgerList] = useState([]);
  const [tranLedgerListAuto, setTranLedgerListAuto] = useState([]);
  const [ledgerAccountTRCode, setledgerAccountTRCode] = useState([]);
  const [refNo, setRefNo] = useState("");
  const [refNoInter, setRefNoInter] = useState();
  const [voucherCode, setVoucherCode] = useState();
  const [voucherCodeRef, setVoucherCodeRef] = useState();
  const [selectedDate, handleDateChange] = useState(new Date());
  const [selectedDueDate, handleDueDateChange] = useState(new Date().toISOString());
  const [financialYearStartDate, setFinancialYearStartDate] = useState();
  const [financialYearEndDate, setFinancialYearEndDate] = useState();
  const [dateDisable, setDateDisable] = useState(false);
  const [journalData, setJournalData] = useState([]);
  const [accountTypeNames, setAccountTypeNames] = useState();
  const [debitTotal, setDebitTotal] = useState(0);
  const [approveButtonEnabled, setApproveButtonEnabled] = useState(false);
  const [transactionModeCode, setTransactionModeCode] = useState();
  const [status, setStatus] = useState(0);
  const [recordAndNewBtnEnable, setRecordAndNewBtnEnable] = useState();
  const [interEstateButtonEnable, setInterEstateButtonEnable] = useState(false);
  const [isInterStatus, setIsInterStatus] = useState(false);
  const [supplierCommon, setSupplierCommon] = useState(false);
  const [accountDescriptions, setAccountDescriptions] = useState({});
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isApproveButtonEnabled: false
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
    voucherType: '0',
    voucherCode: '',
    transactionMode: '0',
    recipientName: '',
    address: '',
    isInterEstate: false,
    interEstateID: '0',
    tranLedgerAccountID: '0',
    supplierID: '0',
    ledgerAccountTRCode: '',
    modeoftransaction: '0',
    modeoftransactionNumber: '',
    payee: ''
  });

  const maxDate = new Date();
  const handleClick = () => {
    navigate('/app/LankemPayment/listing');
  };

  let decrypted = 0;
  let decryptedfactoryID = 0;
  let decryptedgroupID = 0;

  useEffect(() => {
    getPermissions();
    getGroupsForDropdown();
    getPayVoucherCode();
  }, []);

  useEffect(() => {
    if (generalJournal.groupID.toString() !== '0') {
      trackPromise(getfactoriesForDropDown());
    }
  }, [generalJournal.groupID]);
  useEffect(() => {
    if (generalJournal.isInterEstate && parseInt(generalJournal.interEstateID) !== 0) {
      trackPromise(getReferenceNumberInter());
    }
  }, [voucherCodeRef, generalJournal.isInterEstate, generalJournal.interEstateID]);

  useEffect(() => {
    if (generalJournal.factoryID.toString() !== '0') {
      trackPromise(
        getAccountTypeNames(generalJournal.groupID, generalJournal.factoryID)
      );
      trackPromise(getTranLedgerList(), getTranLedgerListAuto());
      trackPromise(getLedgerAccountTRCode());
      trackPromise(getVoucherTypeList());
      trackPromise(getTransactionModeList());
      trackPromise(getFinancialYearStartEndDate());
    }
  }, [generalJournal.factoryID]);

  useEffect(() => {
    decrypted = atob(referenceNumber.toString());
    decryptedgroupID = atob(groupID.toString());
    decryptedfactoryID = atob(factoryID.toString());
    if (decrypted != 0) {
      trackPromise(
        getGeneralJournalDetails(
          decrypted,
          decryptedgroupID,
          decryptedfactoryID
        )
      );
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
      ]);
    }
  }, []);

  useEffect(() => {
    if (generalJournal.isInterEstate == true) {
      setInterEstateButtonEnable(true)
    } else {
      setInterEstateButtonEnable(false)
    }
  }, [generalJournal.isInterEstate]);

  useEffect(() => {
    if (generalJournal.factoryID.toString() !== '0') {
      trackPromise(getSuppliersForDropDown(), getSuppliersForDropDownAuto());
    }
  }, [generalJournal.factoryID]);

  useEffect(() => {
    if (generalJournal.tranLedgerAccountID.toString() !== '0') {
      var listedone = ledgerAccountTRCode.find(x => x.ledgerAccountID === parseFloat(generalJournal.tranLedgerAccountID)).ledgerAccountTRCode
      setGeneralJournal({
        ...generalJournal,
        ledgerAccountTRCode: listedone === undefined ? '' : listedone
      })
    }
  }, [generalJournal.tranLedgerAccountID]);

  useEffect(() => {
    if (generalJournal.factoryID) {
      setRefNo("");
    }
  }, [generalJournal.factoryID]);

  useEffect(() => {
    if (payVoucherCode && generalJournal.ledgerAccountTRCode !== "" && generalJournal.factoryID !== '0' && generalJournal.tranLedgerAccountID !== '0') {
      trackPromise(getReferenceNumber());
    }
  }, [generalJournal.ledgerAccountTRCode]);


  async function getAccountDescriptions() {
    const response = await services.getAccountDescriptions(generalJournal.tranLedgerAccountID);
    setAccountDescriptions(response);
  }


  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);


    var isAuthorized = permissions.find(
      p => p.permissionCode == 'ADDEDITLANKEMPAYMENT'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );
    var isApproveButtonEnabled = permissions.find(
      p => p.permissionCode == 'LANKEMPAYMENTAPPROVEBUTTONENABLED'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isApproveButtonEnabled: isApproveButtonEnabled !== undefined
    });

    setGeneralJournal({
      ...generalJournal,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getReferenceNumber() {
    let refModel = {
      groupID: generalJournal.groupID,
      factoryID: generalJournal.factoryID,
      date: selectedDate.toISOString().split('-')[0],
      voucherCode: payVoucherCode.voucherCode,
      ledgerAccountTRCode: generalJournal.ledgerAccountTRCode
    };
    const ref = await services.getReferenceNumber(refModel);
    setRefNo(ref.data);
  }

  async function getReferenceNumberInter() {
    if (generalJournal.isInterEstate) {
      let refModel = {
        groupID: generalJournal.groupID,
        factoryID: generalJournal.interEstateID,
        date: selectedDate.toISOString().split('-')[0],
        voucherCode: voucherCodeRef
      };
      const ref = await services.getReferenceNumber(refModel);
      setRefNoInter(ref.data);
    }
  }

  async function getLedgerAccountTRCode() {
    const trCode = await services.getLedgerAccountTRCode(generalJournal.factoryID);
    setledgerAccountTRCode(trCode);
  }

  async function getTranLedgerList() {
    const transaction = await services.getTranLedgerListForDropdown(generalJournal.factoryID);
    setTranLedgerList(transaction);
  }

  async function getTranLedgerListAuto() {
    const transaction = await services.getTranLedgerListForAutoDropdown(generalJournal.factoryID);
    setTranLedgerListAuto(transaction);
  }

  async function getAccountTypeNames(groupID, factoryID) {
    const accounts = await services.getLedgerAccountNamesForDatagrid(
      groupID,
      factoryID
    );
    setAccountTypeNames(accounts);
    return accounts;
  }

  async function getFinancialYearStartEndDate() {
    const yearDate = await services.getFinancialYearStartDateByGroupIDFactoryID(
      generalJournal.groupID,
      generalJournal.factoryID
    );
    if (yearDate !== null) {
      setFinancialYearStartDate(yearDate.financialYearStartDate);
      setFinancialYearEndDate(yearDate.financialYearEndDate);
      setDateDisable(false);
    } else {
      alert.error('Please Config the Financial Year');
      setDateDisable(true);
      setFinancialYearStartDate(new Date());
      setFinancialYearEndDate(new Date());
    }
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(
      generalJournal.groupID
    );
    setFactories(factory);
  }

  async function getSuppliersForDropDown() {
    const supplierResult = await services.getSuppliersForDropDown(
      generalJournal.factoryID
    );
    setSuppliers(supplierResult);
  }

  async function getSuppliersForDropDownAuto() {
    const supplierResult = await services.getSuppliersForDropDownAuto(
      generalJournal.factoryID
    );
    setSuppliersAuto(supplierResult);
  }

  async function getPayVoucherCode() {
    const payVoucherCodes = await services.getPayVoucherCode(
      generalJournal.groupID
    );
    setPayVoucherCode(payVoucherCodes);
  }

  async function getGeneralJournalDetails(referenceNumber, groupID, factoryID) {
    let response = await services.getGeneralJournalDetailsByReferenceNumber(
      referenceNumber,
      groupID,
      factoryID
    );
    let data = response;

    setTitle('Update Payment');
    setIsUpdate(true);
    setGeneralJournal({
      ...generalJournal,
      groupID: data[0].groupID,
      factoryID: data[0].factoryID,
      transactionTypeID: data[0].transactionTypeID,
      referenceNumber: data[0].referenceNumber,
      description: data[0].description,
      descriptionID: data[0].descriptionID,
      recipientName: data[0].recipientName,
      transactionMode: data[0].transactionModeID,
      voucherType: data[0].voucherTypeID,
      payModeID: data[0].payModeID,
      chequeNumber: data[0].chequeNumber == null ? '' : data[0].chequeNumber,
      preparedBy: data[0].preparedBy,
      isInterEstate: data[0].isInterEstate,
      interEstateID: data[0].interEstateID,
      supplierID: data[0].supplierID,
      tranLedgerAccountID: data[0].tranLedgerAccountID
    });
    setStatus(data[0].status);
    setRefNo(data[0].referenceNumber);
    setIsInterStatus(data[0].isInterEstate)
    handleDateChange(data[0].date)
    let copyArray = data;

    let accountNameList = await getAccountTypeNames(
      data[0].groupID,
      data[0].factoryID
    );
    let TransactionModeList = await getTransactionModeList();
    const result = TransactionModeList.filter(
      x => x.transactionModeID == data[0].transactionModeID
    );
    setTransactionModeCode(
      result != undefined ? result[0].transactionModeCode : ''
    );

    let tempArray = [...journalData];

    copyArray.forEach(element => {
      let reuslt = GetAll(element.accountTypeName, accountNameList);
      tempArray.push({
        accountTypeName: element.accountTypeName,
        description: element.description,
        descriptionID: element.descriptionID,
        credit: element.credit,
        debit: element.debit,
        ledgerTransactionID: element.ledgerTransactionID,
        disableDebitField:
          parseFloat(element.credit.toString()) > 0 ? true : false,
        disableCreditField:
          parseFloat(element.debit.toString()) > 0 ? true : false,
        rowID: GenerateRandomID(),
        selected: reuslt
      });
    });
    setJournalData(tempArray);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getVoucherTypeList() {
    const voucherTypes = await services.getVoucherTypeList();
    setVoucherTypes(voucherTypes);
    decrypted = atob(referenceNumber.toString());
    if (decrypted == 0) {
      voucherTypes.forEach(x => {
        if (x.screenCode == 'PAYMENT') {
          setGeneralJournal({
            ...generalJournal,
            voucherType: parseInt(x.voucherTypeID)
          });
        }
      });
    }
    return voucherTypes;
  }

  async function getTransactionModeList() {
    const transactionModes = await services.getTransactionModeList();
    setTransactionModes(transactionModes);
    return transactionModes;
  }

  async function SaveGeneralJournal() {
    let newArray = []
    let index = journalData.findIndex(x => x.accountTypeName === 0);
    if (index >= 0) {
      alert.error('Account name is required, please check');
      if (index > 0) {
        journalData.splice(index, 1);
      }
      return;
    }

    var findZeroRecords = journalData.filter(x => parseFloat(x.debit) == 0)
    if (findZeroRecords.length !== 0) {
      alert.error('Amount Should be more than 0');
      return;
    }

    var sameBankAccount = journalData.filter(x => x.accountTypeName == generalJournal.tranLedgerAccountID)
    if (sameBankAccount.length > 0) {
      alert.error('Same Debit and Credit Accounts Not Allowed');
      return;
    }

    let sumCredit = 0
    journalData.forEach(X => {
      sumCredit += parseFloat(X.debit)
    });
    let credit = {
      accountTypeName: generalJournal.tranLedgerAccountID,
      credit: sumCredit,
      debit: 0,
      description: journalData[0].description,
      descriptionID: journalData[0].descriptionID,
      disableCreditField: false,
      disableDebitField: true,
      ledgerTransactionID: 0,
      rowID: journalData[0].rowID,
    }
    journalData.push(credit)

    newArray.push(journalData)
    setNewarrayfromsave(newArray)
    index = journalData.findIndex(x => x.accountTypeName === 0);
    if (index >= 0) {
      alert.error('Account name is required, please check');
      journalData.splice(index, 1);
      return;
    }
    journalData.forEach(function (part, index) {
      journalData[index].accountTypeName = parseInt(part.accountTypeName);
      journalData[index].debit = parseFloat(part.debit);
      journalData[index].description = part.description;
      journalData[index].descriptionID = part.descriptionID;
    });
    setJournalData(journalData)

    var finalArray = journalData.filter(e => e.accountTypeName !== 0);
    if (!isUpdate) {
      let saveModel = {
        groupID: generalJournal.groupID,
        factoryID: generalJournal.factoryID,
        transactionTypeID: generalJournal.transactionTypeID,
        referenceNumber: refNo,
        referenceNumberInter: refNoInter,
        chequeNumber: generalJournal.chequeNumber,
        voucherType: generalJournal.voucherType,
        transactionMode: generalJournal.transactionMode,
        voucherCode: voucherCode,
        recipientName: generalJournal.recipientName,
        isActive: true,
        journalData: finalArray,
        date: selectedDate,
        dueDate: selectedDueDate,
        interEstateID: generalJournal.interEstateID,
        isInterEstate: generalJournal.isInterEstate,
        supplierID: generalJournal.supplierID,
        tranLedgerAccountID: generalJournal.tranLedgerAccountID,
        status: approveButtonEnabled == true ? parseInt(2) : parseInt(1),
        modeoftransaction: generalJournal.modeoftransaction,
        modeoftransactionNumber: generalJournal.modeoftransactionNumber,
        payee: generalJournal.payee,
      };

      if (recordAndNewBtnEnable) {
        let response = await services.saveGeneralJournal(saveModel);

        if (response.statusCode == 'Success') {
          alert.success('Payment saved successfully');
          clearData();
          navigate('/app/LankemPayment/listing');
        } else {
          journalData.splice(index, 1);
          alert.error(response.message);
        }
      } else {
        let response = await services.saveGeneralJournal(saveModel);

        if (response.statusCode == 'Success') {
          alert.success('Payment saved successfully');
          clearData();
          navigate('/app/LankemPayment/listing');
        } else {
          journalData.splice(index, 1);
          alert.error(response.message);
        }
      }
    } else {
      let updateModel = {
        groupID: generalJournal.groupID,
        factoryID: generalJournal.factoryID,
        transactionTypeID: generalJournal.transactionTypeID,
        referenceNumber: generalJournal.referenceNumber,
        voucherType: generalJournal.voucherType,
        transactionMode: generalJournal.transactionMode,
        recipientName: generalJournal.recipientName,
        chequeNumber: generalJournal.chequeNumber,
        isActive: true,
        journalData: finalArray,
        date: selectedDate,
        dueDate: selectedDueDate,
        voucherCode: generalJournal.voucherCode
      };

      let response = await services.updateGeneralJournal(updateModel);
      if (response.statusCode == 'Success') {
        alert.success('Payment updated successfully');
        clearData();
        navigate('/app/LankemPayment/listing');
      } else {
        alert.error(response.message);
      }
    }

  }

  function GetAll(ledgerAccountID, accountTypeNames) {
    const result = accountTypeNames.filter(
      a => a.ledgerAccountID.toString() === ledgerAccountID.toString()
    );
    return result;
  }

  function generateDropownForVoucherList(dataList) {
    let items = [];
    if (dataList != null) {
      voucherTypes.forEach(x => {
        if (x.screenCode == 'LANKEMPAYMENT') {
          items.push(
            <MenuItem key={x.voucherTypeID} value={x.voucherTypeID}>
              {x.voucherTypeName}
            </MenuItem>
          );
        }
      });
    }
    return items;
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
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

  function handleChangeForm(e) {
    const target = e.target;
    const value = target.value;
    setGeneralJournal({
      ...generalJournal,
      [e.target.name]: value
    });
  }

  function handleChangeSupplier(e) {
    const target = e.target;
    const value = target.value;
    setGeneralJournal({
      ...generalJournal,
      [e.target.name]: value
    });
    if ((value > 0) && (suppliers[value].code == 'COMMON')) {
      setSupplierCommon(true);
    } else {
      setSupplierCommon(false);
    }
  }

  function handleSearchDropdownChangeFields(data, e) {
    if (data === undefined || data === null) {
      setGeneralJournal({
        ...generalJournal,
        tranLedgerAccountID: '0'
      });
      return;
    } else {
      var valueV = data["ledgerAccountID"];
      setGeneralJournal({
        ...generalJournal,
        tranLedgerAccountID: valueV
      });
    }
  }

  function handleSearchDropdownChangeFieldsSupplier(data, e) {
    if (data === undefined || data === null) {
      setGeneralJournal({
        ...generalJournal,
        supplierID: '0'
      });
      return;
    } else {
      var valueV = data["supplierID"];
      var valueC = data["supplierCode"];
      setGeneralJournal({
        ...generalJournal,
        supplierID: valueV
      });

      if ((parseInt(valueV) > 0) && (valueC == 'COMMON')) {
        setSupplierCommon(true);
      } else {
        setSupplierCommon(false);
      }
    }
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader onClick={handleClick} />
        </Grid>
      </Grid>
    );
  }

  function calDebitTotal() {
    let sum = 0;
    journalData.forEach(x => {
      sum += parseFloat(x.debit);
      x.debit = parseFloat(x.debit);
      x.ledgerTransactionID = parseFloat(x.ledgerTransactionID);
      x.description = x.description;
      x.descriptionID = x.descriptionID;
    });
    setDebitTotal(sum.toFixed(2));
    return sum.toFixed(2);
  }

  function findLoginUser() {
    return tokenDecoder.getUserNameFromToken();
  }

  function Cancel() {
    navigate('/app/LankemPayment/listing');
  }

  const RecordAndNew = () => {
    setRecordAndNewBtnEnable(true);
    setApproveButtonEnabled(false);
  };

  const RecordClick = () => {
    setRecordAndNewBtnEnable(false);
    setApproveButtonEnabled(false);
  };

  const ApproveClick = () => {
    setRecordAndNewBtnEnable(false);
    setApproveButtonEnabled(true);
  };

  function clearData() {
    setGeneralJournal({
      ...generalJournal,
      transactionTypeID: '0',
      referenceNumber: '',
      description: '',
      descriptionID: '',
      payModeID: '0',
      chequeNumber: '',
      isActive: true,
      preparedBy: '',
      updatedBy: '',
      voucherCode: '',
      transactionMode: '0',
      recipientName: '',
      tranLedgerAccountID: '0',
      supplierID: '0'
    });
    setJournalData([
      {
        accountTypeName: 0,
        credit: 0,
        debit: 0,
        description: '',
        descriptionID: '',
        ledgerTransactionID: 0,
        rowID: GenerateRandomID()
      }
    ]);
    handleDateChange(new Date());
    handleDueDateChange(new Date().toISOString());
    setRefNo('');
    setVoucherCode('');
  }

  async function handleSearchDropdownChange(e, data, rowID) {
    if (data === undefined || data === null) return;
    let valueV = data['ledgerAccountID'];
    const newArr = [...journalData];
    var idx = newArr.findIndex(e => e.rowID == parseInt(rowID));

    const descriptions = await services.getAccountDescriptions(valueV);
    const newDesc = { ...accountDescriptions };
    delete newDesc[rowID];
    if (descriptions.length > 0) {
      newDesc[rowID] = descriptions;
    }
    setAccountDescriptions(newDesc);

    let reuslt = GetAll(valueV, accountTypeNames);
    const existingRecords = newArr.filter(record => record.AccountTypeName == valueV);
    if (newArr[idx].accountTypeName !== parseInt(valueV)) {
      newArr[idx] = {
        ...newArr[idx],
        accountTypeName: parseInt(valueV),
        selected: reuslt,
        disableCreditField: existingRecords.length > 0 ? existingRecords[0].disableCreditField : false,
        disableDebitField: existingRecords.length > 0 ? existingRecords[0].disableDebitField : false,
        //debit: 0,
        //credit: 0,
        description: "",
        descriptionID: 0
      };
    } else {
      newArr[idx] = {
        ...newArr[idx],
        accountTypeName: parseInt(valueV),
        selected: reuslt,
        description: "",
        descriptionID: 0
      };
    }
    setJournalData(newArr);
  }

  function changeText(e, rowID, inputType, IDvalue = 0, desc = null) {
    let target = ''
    let value = ''
    if (inputType !== 'description') {
      const target = e.target;
      const value = target.value
    }
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

    if (inputType.includes('description')) {
      newArr[idx] = { ...newArr[idx], description: desc, descriptionID: IDvalue };
    }
    else if (inputType === 'credit') {
      var reg = new RegExp('^[.0-9]*$');

      if (reg.test(value) == false) {
        alert.error('Allow Only Numbers');
        return;
      }

      let debitBool = false;
      let creditBool = false;
      if (parseFloat(value.toString()) > 0) {
        debitBool = true;
        creditBool = false;
      }
      if (value.toString().length > 18) {
        alert.error('Allow Only 18 Numbers');
        return;
      }

      newArr[idx] = {
        ...newArr[idx],
        credit: value === '' ? 0 : value,
        disableCreditField: creditBool,
        disableDebitField: debitBool
      };
    } else {
      var reg = new RegExp('^[.0-9]*$');

      if (reg.test(value) == false) {
        alert.error('Allow Only Numbers');
        return;
      }

      let debitBool = false;
      let creditBool = false;
      if (parseFloat(value.toString()) > 0) {
        debitBool = false;
        creditBool = true;
      }
      if (value.toString().length > 20) {
        alert.error('Allow Only 20 Numbers');
        return;
      }
      newArr[idx] = {
        ...newArr[idx],
        debit: IDvalue === '' ? 0 : IDvalue,
        disableCreditField: creditBool,
        disableDebitField: debitBool
      };
    }
    setJournalData(newArr);
  }

  function GenerateRandomID() {
    const d = new Date();
    let ms = d.valueOf();

    let rendomValue =
      ms + Math.floor(Math.random() * 10000) - 12 + (ms - 128 + ms * 512);
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
        alert.error("please enter amount");
      }
    }
  };

  async function getChequeNumber(data) {
    let response = await services.getChequeNumber(data.accountTypeName);
    if (response.data == null) {
      alert.error(response.message);
    } else {
      setGeneralJournal({
        ...generalJournal,
        chequeNumber: response.data
      });
    }
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
              referenceNumber: referenceNumber,
              recipientName: generalJournal.recipientName,
              description: generalJournal.description,
              descriptionID: generalJournal.descriptionID,
              voucherType: generalJournal.voucherType,
              transactionMode: generalJournal.transactionMode,
              chequeNumber: generalJournal.chequeNumber,
              isActive: generalJournal.isActive,
              isInterEstate: generalJournal.isInterEstate,
              interEstateID: generalJournal.interEstateID,
              tranLedgerAccountID: generalJournal.tranLedgerAccountID,
              supplierID: generalJournal.supplierID,
              modeoftransaction: generalJournal.modeoftransaction,
              modeoftransactionNumber: generalJournal.modeoftransactionNumber,
              payee: generalJournal.payee,
              supplierCommon: supplierCommon
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number().required('Group required').min('1', 'Group required'),
              factoryID: Yup.number().required('Factory required').min('1', 'Factory required'),
              referenceNumber: Yup.string().required('Reference number required'),
              // voucherType: Yup.number()
              //   .required('Voucher Type required')
              //   .min('1', 'Voucher Type required'),
              // transactionMode: Yup.number()
              //   .required('Transaction Mode required')
              //   .min('1', 'Transaction Mode required'),
              // chequeNumber: Yup.string().when('payModeID', {
              //   is: val => val == '2',
              //   then: Yup.string().required('Cheque number required')
              // }),
              // interEstateID: Yup.number().when('isInterEstate', {
              //   is: true,
              //   then: Yup.number()
              //     .required('Inter Estate required')
              //     .min(1, 'Inter Estate required'),

              // }),
              tranLedgerAccountID: Yup.number().required('Ledger Account is required').min('1', 'Ledger Account is required'),
              supplierID: Yup.number().required('Supplier required').min('1', 'Supplier required'),
              modeoftransaction: Yup.number().required('Mode of transaction required').min("1", 'Select Mode of transaction'),
              modeoftransactionNumber: Yup.string().when('modeoftransaction', {
                is: (areaType) => areaType > 0 && areaType == 1,
                then: Yup.string().required('Number is required').matches(/^\d+$/, 'Enter valid Number.').nullable()
              }),
              supplierID: Yup.number()
                .required('Supplier required')
                .min('1', 'Supplier required'),
              supplierCommon: Yup.bool(),
              payee: Yup.string().when('supplierCommon', {
                is: (supplierCommon) => supplierCommon == true,
                then: Yup.string()
                  .required('Payee required').matches(/^[a-zA-Z\.][a-zA-Z\s\.]*$/, 'Special characters are not allowed'),
                otherwise: Yup.string().nullable(),
              }),
            })}
            onSubmit={event => trackPromise(SaveGeneralJournal(event))}
            enableReinitialize
          >
            {({ errors, handleBlur, handleSubmit, touched, values }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              size="small"
                              onBlur={handleBlur}
                              onChange={e => handleChangeForm(e)}
                              value={values.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={isInterStatus}
                              InputProps={{
                                readOnly:
                                  isUpdate ||
                                    !permissionList.isGroupFilterEnabled
                                    ? true
                                    : false
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
                            <TextField
                              select
                              error={Boolean(
                                touched.factoryID && errors.factoryID
                              )}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              size="small"
                              onBlur={handleBlur}
                              onChange={e => handleChangeForm(e)}
                              value={generalJournal.factoryID}
                              disabled={isInterStatus}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly:
                                  isUpdate ||
                                    !permissionList.isFactoryFilterEnabled
                                    ? true
                                    : false
                              }}
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel
                              shrink
                              id="date"
                              style={{ marginBottom: '-8px' }}
                            >
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
                                minDate={financialYearStartDate}
                                maxDate={maxDate}
                                disabled={dateDisable || isInterStatus}
                                onChange={e => {
                                  handleDateChange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date'
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          {Hidden == true ? (
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="voucherType">
                                Voucher Type *
                              </InputLabel>
                              <TextField
                                select
                                error={Boolean(
                                  touched.voucherType && errors.voucherType
                                )}
                                fullWidth
                                helperText={
                                  touched.voucherType && errors.voucherType
                                }
                                name="voucherType"
                                size="small"
                                onBlur={handleBlur}
                                onChange={e => handleChangeForm(e)}
                                value={generalJournal.voucherType}
                                variant="outlined"
                                id="voucherType"
                                disabled={isInterStatus}
                                InputProps={{
                                  readOnly: isUpdate ? true : false
                                }}
                              >
                                <MenuItem value="0">
                                  --Select Voucher Type--
                                </MenuItem>
                                {generateDropownForVoucherList(voucherTypes)}
                              </TextField>
                            </Grid>
                          ) : null}
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="tranLedgerAccountID">
                              Bank Account *
                            </InputLabel>
                            <Autocomplete
                              id="tranLedgerAccountID"
                              options={tranLedgerListAuto}
                              getOptionLabel={(option) => option.ledgerAccountName != null ? option.ledgerAccountName.toString() : null}
                              onChange={(e, value) => handleSearchDropdownChangeFields(value, e)}
                              defaultValue={null}
                              renderInput={(params) =>
                                <TextField {...params}
                                  variant="outlined"
                                  name="tranLedgerAccountID"
                                  fullWidth
                                  size='small'
                                  placeholder='--Select Ledger Account--'
                                  value={generalJournal.tranLedgerAccountID}
                                  getOptionDisabled={true}
                                  helperText={touched.tranLedgerAccountID && errors.tranLedgerAccountID}
                                  onBlur={handleBlur}
                                  error={Boolean(touched.tranLedgerAccountID && errors.tranLedgerAccountID)}
                                >
                                  <MenuItem value={'0'} >--Select Ledger Account--</MenuItem>
                                </TextField>
                              }
                            />
                          </Grid>
                          {/* <Grid item md={4} xs={12}>
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
                              onChange={e => {
                                handleChangeForm(e);
                              }}
                              value={generalJournal.tranLedgerAccountID}
                              variant="outlined"
                              id="tranLedgerAccountID"
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                            >
                              <MenuItem value="0">
                                --Select Ledger Account--
                              </MenuItem>
                              {generateDropDownMenu(
                                tranLedgerList
                              )}
                            </TextField>
                          </Grid> */}
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="referenceNumber">
                              Voucher Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(
                                touched.referenceNumber &&
                                errors.referenceNumber
                              )}
                              fullWidth
                              helperText={
                                touched.referenceNumber &&
                                errors.referenceNumber
                              }
                              name="referenceNumber"
                              size="small"
                              onBlur={handleBlur}
                              onChange={e => handleChangeForm(e)}
                              value={refNo}
                              variant="outlined"
                              InputProps={{
                                readOnly: true
                              }}
                              disabled={isInterStatus}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="modeoftransaction">
                              Mode of transaction *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.modeoftransaction && errors.modeoftransaction)}
                              fullWidth
                              helperText={touched.modeoftransaction && errors.modeoftransaction}
                              name="modeoftransaction"
                              size="small"
                              onBlur={handleBlur}
                              onChange={e => { handleChangeForm(e); }}
                              value={generalJournal.modeoftransaction}
                              variant="outlined"
                              id="modeoftransaction"
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Transaction Mode--</MenuItem>
                              <MenuItem value="1"> Cheque </MenuItem>
                              <MenuItem value="2"> Fund Transfer </MenuItem>
                              <MenuItem value="3"> Cash </MenuItem>
                            </TextField>
                          </Grid>
                          {generalJournal.modeoftransaction > 0 && generalJournal.modeoftransaction != 3 ?
                            <Grid item md={4} xs={12}>
                              {generalJournal.modeoftransaction == 1 ?
                                <InputLabel shrink id="modeoftransactionNumber">
                                  Cheque Number *
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
                                onChange={e => handleChangeForm(e)}
                                value={generalJournal.modeoftransactionNumber}
                                variant="outlined"
                              />
                              {generalJournal.modeoftransaction == 1 ?
                                <typography style={{ fontSize: '12px', fontFamily: "Roboto" }}>
                                  Please Enter : [ Cheque Number_Bank Code_Branch Code ]
                                </typography> : null}
                            </Grid> : null}
                          {/* <Grid item md={4} xs={12}>
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
                              onChange={e => handleChangeSupplier(e)}
                              value={generalJournal.supplierID}
                              disabled={isInterStatus}
                              variant="outlined"
                              id="supplierID"
                            >
                              <MenuItem value="0">--Select Supplier--</MenuItem>
                              {generateDropDownMenuWithTwoValues(suppliers)}
                            </TextField>
                          </Grid> */}
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="supplierID">
                              Supplier *
                            </InputLabel>
                            <Autocomplete
                              id="supplierID"
                              options={suppliersAuto}
                              getOptionLabel={(option) => option.supplierName != null ? option.supplierName.toString() : null}
                              onChange={(e, value) => handleSearchDropdownChangeFieldsSupplier(value, e)}
                              defaultValue={null}
                              renderInput={(params) =>
                                <TextField {...params}
                                  variant="outlined"
                                  name="supplierID"
                                  fullWidth
                                  size='small'
                                  placeholder='--Select Supplier--'
                                  value={generalJournal.supplierID}
                                  getOptionDisabled={true}
                                  helperText={touched.supplierID && errors.supplierID}
                                  onBlur={handleBlur}
                                  error={Boolean(touched.supplierID && errors.supplierID)}
                                >
                                  <MenuItem value={'0'} >--Select Supplier--</MenuItem>
                                </TextField>
                              }
                            />
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
                                onChange={e => handleChangeForm(e)}
                                value={generalJournal.payee}
                                variant="outlined"
                                disabled={isDisableButton}
                                id="payee"
                              />
                            </Grid>
                            : null}
                          {transactionModeCode == 'CH' ? (
                            <Grid item md={4} xs={12}>
                              <InputLabel
                                shrink
                                id="chequeNumber"
                                style={{ marginBottom: '-8px' }}
                              >
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
                                  disabled={isInterStatus}
                                  onChange={e => {
                                    handleDueDateChange(e);
                                  }}
                                  KeyboardButtonProps={{
                                    'aria-label': 'change date'
                                  }}
                                  autoOk
                                />
                              </MuiPickersUtilsProvider>
                            </Grid>
                          ) : null}
                        </Grid>
                        {transactionModeCode == 'CH' ? (
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="chequeNumber">
                                Cheque Number
                              </InputLabel>
                              <TextField
                                error={Boolean(
                                  touched.chequeNumber && errors.chequeNumber
                                )}
                                fullWidth
                                helperText={
                                  touched.chequeNumber && errors.chequeNumber
                                }
                                name="chequeNumber"
                                size="small"
                                onBlur={handleBlur}
                                onChange={e => handleChangeForm(e)}
                                value={generalJournal.chequeNumber}
                                variant="outlined"
                                disabled={isDisableButton}
                              />
                            </Grid>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="recipientName">
                                Recipient Name
                              </InputLabel>
                              <TextField
                                error={Boolean(
                                  touched.recipientName && errors.recipientName
                                )}
                                fullWidth
                                helperText={
                                  touched.recipientName && errors.recipientName
                                }
                                name="recipientName"
                                size="small"
                                onBlur={handleBlur}
                                onChange={e => handleChangeForm(e)}
                                value={generalJournal.recipientName}
                                variant="outlined"
                                disabled={isDisableButton}
                              />
                            </Grid>
                          </Grid>
                        ) : null}
                      </CardContent>
                      <CardContent height="auto">
                        <Box style={{ border: '1px solid gray' }}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Account Name *</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Amount *</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {journalData.map(object => {
                                let ID = object.rowID;
                                return (
                                  <TableRow>
                                    <TableCell
                                      style={{
                                        padding: '16px',
                                        width: '20rem', verticalAlign: "top"
                                      }}
                                    >
                                      <Autocomplete
                                        id={ID.toString()}
                                        options={accountTypeNames}
                                        size={'small'}
                                        disabled={isInterStatus}
                                        style={{ width: '20rem' }}
                                        getOptionLabel={option =>
                                          option.ledgerAccountName
                                        }
                                        onChange={(e, value) =>
                                          handleSearchDropdownChange(
                                            'accountName',
                                            value,
                                            ID
                                          )
                                        }
                                        value={
                                          object.selected !== undefined
                                            ? object.selected[0]
                                            : null
                                        }
                                        renderInput={params => (
                                          <TextField
                                            {...params}
                                            fullWidth
                                            autoFocus
                                            disabled={isInterStatus}
                                            variant="outlined"
                                            placeholder="--Select Account--"
                                          />
                                        )}
                                      />
                                    </TableCell>
                                    <TableCell style={{ verticalAlign: "top", width: '50%' }}>
                                      {/*<TextField
                                        variant="outlined"
                                        size={"small"}
                                        name={ID}
                                        onBlur={handleBlur}
                                        onChange={(e) => changeText(e, ID, "description")}
                                        value={object.description}
                                        disabled={isInterStatus}
                                        fullWidth
                                        multiline
                                        maxRows={2}
                                      />*/}
                                      <Autocomplete
                                        id={ID.toString()}
                                        key={object.descriptionID}
                                        options={accountDescriptions?.[ID] ?? []}
                                        size="small"
                                        disabled={isInterStatus}
                                        freeSolo={!accountDescriptions?.[ID]}
                                        getOptionLabel={option =>
                                          typeof option === 'string' ? option : option.accountDescription
                                        }
                                        onChange={(e, value) => {
                                          if (value && value.accountDescriptionTypeID !== undefined) {

                                            changeText(e, ID, 'description', value.accountDescriptionTypeID, value.accountDescription);

                                          }
                                        }}
                                        onInputChange={(e, value) => {

                                          if (!accountDescriptions?.[ID] && typeof value === 'string') {
                                            changeText(e, ID, 'description', 0, value);
                                          }
                                        }}
                                        clearOnBlur
                                        disableClearable={!accountDescriptions?.[ID]}
                                        value={object.description}
                                        renderInput={params => (
                                          <TextField
                                            {...params}
                                            fullWidth
                                            autoFocus
                                            disabled={isInterStatus}
                                            variant="outlined"
                                            placeholder={accountDescriptions?.[ID] ? "--Select Description--" : "--Enter Description--"}
                                          />
                                        )}
                                      />
                                    </TableCell>
                                    <TableCell style={{ verticalAlign: "top", width: '50%' }}>
                                      <TextField
                                        variant="outlined"
                                        size={'small'}
                                        name={ID}
                                        onBlur={handleBlur}
                                        fullWidth
                                        onChange={e =>
                                          changeText(e, ID, 'debit', e.target.value)
                                        }
                                        value={object.debit}
                                        onKeyDown={(e) => onKeyDown(e, ID, object)}
                                        inputProps={{
                                          readOnly: object.disableDebitField
                                        }}
                                        disabled={isInterStatus}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </Box>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          id="btnCancel"
                          variant="contained"
                          style={{ marginRight: '1rem' }}
                          className={classes.colorCancel}
                          disabled={isInterStatus}
                          onClick={() => Cancel()}
                        >
                          Cancel
                        </Button>
                        {permissionList.isApproveButtonEnabled == false && !isUpdate ? (
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={RecordClick}
                          >
                            Record
                          </Button>) : null}
                        {permissionList.isApproveButtonEnabled == true && !isUpdate ?
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={ApproveClick}
                          >
                            Approve
                          </Button>
                          : null}
                        {isUpdate && status != 2 ? (
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            disabled={isInterStatus}
                          >
                            Update
                          </Button>
                        ) : null}
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
}

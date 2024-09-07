import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Typography, Box, Card, makeStyles, Container, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, CardHeader, Button, Chip } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { useAlert } from "react-alert";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import tokenDecoder from '../../../utils/tokenDecoder';
import { LoadingComponent } from '../../../utils/newLoader';
import { UserStatisticsComponent } from '../../UserStatistics/UserStatisticsExportComponent';
import { AlertDialog } from '../../Common/AlertDialog';
import paymentServices from './../../Common/CustomerPaymentDetails/Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { CustomerPaymentDetailsNewComponent } from './../../Common/CustomerPaymentDetailsNewComponent/CustomerPaymentDetailsNewComponenet';
import AdvancePaymentReceiptComponent from './../../Common/AdvancedPaymentPrintReceipt/AdvancePaymentReceiptComponent';
import ReactToPrint from "react-to-print";
import { addMonths } from 'date-fns';
import { AutoGLComponent } from './../../Common/AutoGLSelectionComponent/AutoGLSelectorComponent';
import { AgriGenERPEnum } from './../../Common/AgriGenERPEnum/AgriGenERPEnum';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  textcolor: {
    color: 'blue',
    textcolor: 'blue'
  },
  fontSizer: {
    fontWeight: "bold",
    fontSize: "30px"
  },
  colorApprove: {
    backgroundColor: "green",
  },
  multilineColor: {
    color: 'red'
  }
}));

const screenCode = 'ADVANCEPAYMENT';
export default function AdvancePaymentListing() {
  const agriGenERPEnum = new AgriGenERPEnum()
  const classes = useStyles();
  const componentRef = useRef();
  const [title, setTitle] = useState("Advance Payment");
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [totalAmount, setTotalAmount] = useState();
  const [customer, setCustomer] = useState();
  const alert = useAlert();
  const [finalModel, setFinalModel] = useState([]);
  const [disableOverAdvanceBTN, setDisableOverAdvanceBTN] = useState(true);
  const [AdvanceTypeSelection, setAdvanceTypeSelection] = useState(agriGenERPEnum.TransactionType.Advance_Payment)

  //Balance Component Required Hooks
  const [cropDetails, setCropDetails] = useState([]);
  const [currentCropDetails, setCurrentCropDetails] = useState([]);
  const [advanceTotal, setAdvanceTotal] = useState();
  const [factoryItemTotal, setFactoryItemTotal] = useState();
  const [loanTotal, setLoanTotal] = useState();
  const [transportTotal, setTransportTotal] = useState();
  const [currentTransportTotal, setCurrentTransportTotal] = useState();
  const [customerBalancePaymentAmount, setCustomerBalancePaymentAmount] = useState(0);
  const [currentAdvanceTotal, setCurrentAdvanceTotal] = useState(0);
  const [currentFactoryItemTotal, setCurentFactoryItemTotal] = useState(0);
  const [currentLoanTotal, setCurrentLoanTotal] = useState(0);
  const [previouseAvailableBalance, setPreviouseAvailableBalance] = useState(0);
  const [currentAvailableBalance, setCurrentAvailableBalance] = useState(0);
  const [newRates, setNewRates] = useState([]);
  const [IsBalancePaymetDone, setIsBalancePaymetDone] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [runningBalance, setRunningBalance] = useState(0);
  const [iconTitle, setIconTitle] = useState("Issue");
  const [message, setMessage] = useState("  Are you sure you want to confirm?");
  const [discription, setDiscription] = useState();
  const [previouseColorChange, setPreviouseColorChange] = useState(false);
  const [previousMonthLoanInterestDebit, setPreviousMonthLoanInterestDebit] = useState(0);
  const [previousMonthLoanPrincipalDebit, setPreviousMonthLoanPrincipalDebit] = useState(0);
  const [monthLoanInterestDebit, setMonthLoanInterestDebit] = useState(0);
  const [monthLoanPrincipalDebit, setMonthLoanPrincipalDebit] = useState(0);
  const [monthLoanArrearsFine, setMonthLoanArrearsFine] = useState(0);
  const [monthLoanArrearsInterest, setMonthLoanArrearsInterest] = useState(0);
  const [previouseMonthLoanArrearsFine, setPreviouseMonthLoanArrearsFine] = useState(0);
  const [previouseMonthLoanArrearsInterest, setPreviouseMonthLoanArrearsInterest] = useState(0);
  const [PreviousMonthBalanceBroughtForwardAmount, setPreviousMonthBalanceBroughtForwardAmount] = useState(0);
  const [PreviousMonthBalanceCarriedForwardAmount, setPreviousMonthBalanceCarriedForwardAmount] = useState(0);
  const [BalanceCarriedForwardAmount, setBalanceCarriedForwardAmount] = useState(0)
  const [BalanceBroughtForwardAmount, setBalanceBroughtForwardAmount] = useState(0)
  const [PreviousMonthDeductionDetailsList, setPreviousMonthDeductionDetailsList] = useState([])
  const [CurrentMonthDeductionDetailsList, setCurrentMonthDeductionDetailsList] = useState([])
  const [EnableConfirmMessage, setEnableConfirmMessage] = useState(false);
  const [isHideButton, setIsHideButton] = useState(false);
  const [IsBalancePaymetCompletedStatus, setIsBalancePaymetCompletedStatus] = useState(false);
  const [IsLoad, setIsLoad] = useState(false);
  const [IsJoiningDateValidateStatus, setIsJoiningDateValidateStaus] = useState(false)
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    routeName: ""
  });

  //Balance Component Required Hooks
  const [approveList, setApproveList] = useState({
    groupID: '0',
    factoryID: '0',
    nic: '',
    regNumber: '',
    effectiveDate: new Date(),
    previouseMonthAmount: 0,
    currentMonthAmount: 0
  });
  const [userBasicDetails, setUserBasicDetails] = useState({
    FactoryID: '0',
    GroupID: '0',
    NIC: null,
    CustomerRegistrationNumber: ''
  });

  const currentProps1 = {
    border: 1,
    style: { height: 'auto', marginLeft: '1rem', marginRight: '1rem', marginBottom: '1rem' }
  };

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAdvancePaymentChangeEnabled: false,
    isAdvanceRateChangeEnabled: false,
    isMonthlyBalanceChangeEnabled: false,
    isSendToOverAdvanceEnabled: false,
    isIssuePermissionEnabled: false,
    isIssuingDateEnabled: false,
    isViewTotalAmount: false,
    isViewAvailableAmount: false
  });

  //Payment Receipt changes
  const previous = new Date();
  previous.setMonth(previous.getMonth() - 1);
  const current = new Date();
  current.setMonth(current.getMonth());
  const [IsPrintButtonDisabled, setIsPrintButtonDisabled] = useState(true);
  const [AdvancePaymentReciptDetails, setAdvancePaymentReciptDetails] = useState({
    receiptDate: new Date().toISOString().split('T', 1),
    factoryName: '',
    payeeName: '',
    payeeAddress: '',
    payeeAddressTwo: '',
    payeeAddressThree: '',
    previousMonthName: '',
    currentMonthName: '',
    previousMonthAmount: 0,
    currentMonthAmount: 0,
    isOverAdvance: false
  })
  //Payment Receipt changes

  const [IsCurrentMonthValid, setIsCurrentMonthValid] = useState(true);
  const [CurrentMonthAmountValidationText, setCurrentMonthAmountValidationText] = useState("")
  const [IsPreviousMonthValid, setIsPreviousMonthValid] = useState(true);
  const [PreviousMonthAmountValidationText, setPreviousMonthAmountValidationText] = useState("")
  const [IsAmountFieldsValid, setIsAmountFieldsValid] = useState(true)
  const [AutoGLRequestDetailsModel, setAutoGLRequestDetailsModel] = useState({
    groupID: '0',
    factoryID: '0',
    transactionTypeID: parseInt(agriGenERPEnum.TransactionType.Advance_Payment.toString())
  })
  const [SelectedAccountDetails, setSelectedAccountDetails] = useState({
    creditAccountID: 0,
    debitAccountID: 0,
    isGLSetup: false,
    isMonthlyAccountsEnabledCredit: false,
    isMonthlyAccountsEnabledDebit: false
  })
  const [EffectiveDate, setEffectiveDate] = useState();

  const navigate = useNavigate();
  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getfactoriesForDropDown());
  }, [approveList.groupID]);

  useEffect(() => {
    calculateCurrentBalance(); calculateCurrentBalance();
  }, [currentCropDetails]);

  useEffect(() => {
    calculateCurrentBalance(); setPreAvailableBalance();
  }, [cropDetails]);

  useEffect(() => {
    setPreAvailableBalance(); calculateCurrentBalance();
  }, [newRates]);

  useEffect(() => {
    calculateTotalBalance();
  }, [previouseAvailableBalance]);

  useEffect(() => {
    calculateTotalBalance();
  }, [currentAvailableBalance]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance();
  }, [currentAdvanceTotal]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance();
  }, [currentFactoryItemTotal]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance();
  }, [currentLoanTotal]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance();
  }, [currentTransportTotal]);

  useEffect(() => {
    createMonthAmount();
  }, [totalBalance]);

  useEffect(() => {
    createTotalAmount();
  }, [approveList]);

  useEffect(() => {
    checkValidations()
  }, [totalAmount]);

  useEffect(() => {
    trackPromise(
      getCustomerAccountBalance(),
    )
  }, [customer]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  }, [monthLoanInterestDebit]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  }, [monthLoanPrincipalDebit]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  }, [monthLoanArrearsFine]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  }, [monthLoanArrearsInterest]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  }, [previousMonthLoanInterestDebit, previousMonthLoanPrincipalDebit, previouseMonthLoanArrearsFine, previouseMonthLoanArrearsInterest]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  }, [BalanceCarriedForwardAmount]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  }, [PreviousMonthBalanceBroughtForwardAmount]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  }, [PreviousMonthBalanceCarriedForwardAmount]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  }, [CurrentMonthTotalExpensesAmount, PreviousMonthTotalExpensesAmount])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWADVANCEPAYMENT');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isAdvancePaymentChangeEnabled = permissions.find(p => p.permissionCode === 'ADVANCEPAYMENTPERMISSION');
    var isAdvanceRateChangeEnabled = permissions.find(p => p.permissionCode == "ADVANCERATECHANGEPERMISSION");
    var isMonthlyBalanceChangeEnabled = permissions.find(p => p.permissionCode == "MONTHLYBALANCECHANGINGPERMISSION");
    var isSendToOverAdvanceEnabled = permissions.find(p => p.permissionCode == "SENDTOOVERADVANCEPERMISSION");
    var isIssuePermissionEnabled = permissions.find(p => p.permissionCode == "ADVANCEISSUEPERMISSION");
    var isIssuingDateEnabled = permissions.find(p => p.permissionCode == "ISSUINGDATECHANGEPERMISSION");
    var isViewTotalAmount = permissions.find(p => p.permissionCode == "VIEWTOTALAMOUNT");
    var isViewAvailableAmount = permissions.find(p => p.permissionCode == "VIEWAVAILABLEAMOUNT");

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isAdvancePaymentChangeEnabled: isAdvancePaymentChangeEnabled !== undefined,
      isAdvanceRateChangeEnabled: isAdvanceRateChangeEnabled !== undefined,
      isMonthlyBalanceChangeEnabled: isMonthlyBalanceChangeEnabled !== undefined,
      isSendToOverAdvanceEnabled: isSendToOverAdvanceEnabled !== undefined,
      isIssuePermissionEnabled: isIssuePermissionEnabled !== undefined,
      isIssuingDateEnabled: isIssuingDateEnabled !== undefined,
      isViewTotalAmount: isViewTotalAmount !== undefined,
      isViewAvailableAmount: isViewAvailableAmount !== undefined
    });

    setApproveList({
      ...approveList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  const handleRadioChange = (event) => {
    var tranTypeID = parseInt(event.target.value.toString());
    setAdvanceTypeSelection(tranTypeID);

    setAutoGLRequestDetailsModel({
      ...AutoGLRequestDetailsModel,
      transactionTypeID: tranTypeID
    })

  };

  function userData(x) {
    if (x) {
      if (totalAmount <= 0) {
        alert.error('Total amount cannot be less than or equal 0');
      }
      else {
        sendToOverAdvance(totalAmount);
      }
    }
    else {
      alert.error('Please enter valid amount');
      return;
    }
  }

  function confirmData(y) {
    if (y) {
      payAdvancePayment();
    }
  }

  async function PreviousMonthTotalExpensesAmount() {
    let creditAmount = 0;
    let debitAmount = 0;
    PreviousMonthDeductionDetailsList.forEach((object) => {
      if (object.entryType === 2) {
        creditAmount += object.totalAmount
      }
      else if (object.entryType === 1) {
        debitAmount += object.totalAmount
      }
    })
    return parseFloat(creditAmount - debitAmount)
  }

  async function CurrentMonthTotalExpensesAmount() {
    let creditAmount = 0;
    let debitAmount = 0;
    CurrentMonthDeductionDetailsList.forEach((object) => {
      if (object.entryType === 2) {
        creditAmount += object.totalAmount
      }
      else if (object.entryType === 1) {
        debitAmount += object.totalAmount
      }
    })
    return parseFloat(creditAmount - debitAmount)
  }

  function checkValidations() {
    if (totalAmount > totalBalance) {
      setDisableOverAdvanceBTN(false);
    }
    else {
      setDisableOverAdvanceBTN(true);
    }
  }
  async function createTotalAmount() {
    var total = parseFloat(approveList.currentMonthAmount == "" ? 0 : approveList.currentMonthAmount) + parseFloat(approveList.previouseMonthAmount == '' ? 0 : approveList.previouseMonthAmount);
    setTotalAmount(isNaN(total) ? 0 : parseFloat(total).toFixed(2));
  }

  async function createMonthAmount() {
    setApproveList({ ...approveList, currentMonthAmount: '', previouseMonthAmount: '' });
  }

  async function calculateTotalBalance() {
    const total = currentAvailableBalance + previouseAvailableBalance;
    isNaN(total) ? setTotalBalance(0) : setTotalBalance(total);
  }

  async function calculateCurrentBalance() {
    var total = 0;
    for (var i = 0; i < currentCropDetails.length; i++) {
      total = total + parseFloat(currentCropDetails[i].totalCrop) * parseFloat(currentCropDetails[i].minRate);
    }
    var currentBalance = total - (await CurrentMonthTotalExpensesAmount() + BalanceCarriedForwardAmount);
    isNaN(currentBalance) ? setCurrentAvailableBalance(0) : setCurrentAvailableBalance(parseFloat(currentBalance));
  }

  async function setPreAvailableBalance() {
    var total = 0;
    for (var i = 0; i < cropDetails.length; i++) {
      total = total + parseFloat(cropDetails[i].totalCrop) * parseFloat(cropDetails[i].minRate);
    }
    total += PreviousMonthBalanceBroughtForwardAmount;
    var previouseBalance = customerBalancePaymentAmount == "-1" ? total - (await PreviousMonthTotalExpensesAmount() + PreviousMonthBalanceCarriedForwardAmount) : 0;
    isNaN(previouseBalance) || previouseBalance == 0 ? setPreviouseAvailableBalance(0) : setPreviouseAvailableBalance(parseFloat(previouseBalance));
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(approveList.groupID);
    setFactories(factory);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
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
    setApproveList({
      ...approveList,
      [e.target.name]: value
    });
  }

  function handleEffectiveDate(e) {
    setApproveList({
      ...approveList,
      effectiveDate: e
    })

  }

  async function searchCustomerBalanceDetails() {
    setIsLoad(false)
    setIsPrintButtonDisabled(true)
    var validate = /^[1-9]\d*$/;

    if (EffectiveDate === null || EffectiveDate === "") {
      alert.error("Issuing Date is mandatory");
      return;
    }

    if (approveList.groupID == null || approveList.groupID == "0" || approveList.groupID == undefined) {
      alert.error('Please select a Group');
    }
    else if (approveList.factoryID == null || approveList.factoryID == "0" || approveList.factoryID == undefined) {
      alert.error('Please select a Factory');
    }
    else if (approveList.regNumber == "") {
      alert.error('Please enter registration number');
    }
    // else if (!validate.test(approveList.regNumber)) {
    //   ClearData();
    //   return;
    // }
    else {
      var found = await getCustomerDetailsByRegNumber();
      if (found.data != null) {

        getCustomerDetailsNameAndRouteName(approveList.groupID, approveList.factoryID, approveList.regNumber);

        setAutoGLRequestDetailsModel({
          ...AutoGLRequestDetailsModel,
          groupID: parseInt(approveList.groupID.toString()),
          factoryID: parseInt(approveList.factoryID.toString())
        })

        var active = await checkCustomerIsActive();

        if (active) {

          //Common Min And Max Rates 
          const newRate = await paymentServices.getCurrentMinMaxRateByApplicableMonthAndYear(approveList.factoryID);
          setNewRates(newRate);

          //For Previous Month
          const IsPreviousMonthAdvanceIssueDisable = await paymentServices.IsPreviousMonthAdvanceIssueDisabled(approveList);

          setIsBalancePaymetCompletedStatus(
            IsPreviousMonthAdvanceIssueDisable === null
              || IsPreviousMonthAdvanceIssueDisable.balancePaymentValidationStatus === false
              || IsPreviousMonthAdvanceIssueDisable === NaN ?
              false : IsPreviousMonthAdvanceIssueDisable.balancePaymentValidationStatus
          );
          setIsJoiningDateValidateStaus(
            IsPreviousMonthAdvanceIssueDisable === null
              || IsPreviousMonthAdvanceIssueDisable.joiningDateValidationStatus === false
              || IsPreviousMonthAdvanceIssueDisable === NaN ?
              false : IsPreviousMonthAdvanceIssueDisable.joiningDateValidationStatus
          );

          const previousDetails = await paymentServices.getCustomerPreviousMonthPaymentFullDetails(approveList);

          setTransportTotal(previousDetails.previouseTransport == null ? 0 : previousDetails.previouseTransport);
          setCustomerBalancePaymentAmount(previousDetails.customerBalancePayemtStatus == false ? -1 : previousDetails.previouseBalancePayment);
          setLoanTotal(previousDetails.previousMonthLoanDetailsModel == null ? 0 : previousDetails.previousMonthLoanDetailsModel.loanTotal);
          setFactoryItemTotal(previousDetails.previouseFactoryItem == null ? 0 : previousDetails.previouseFactoryItem);
          setAdvanceTotal(previousDetails.previouseAdvancedPayment == null ? 0 : previousDetails.previouseAdvancedPayment);
          setCropDetails(previousDetails.previouseCropDetailsModel);
          setIsBalancePaymetDone(previousDetails.customerBalancePayemtStatus);
          setPreviousMonthLoanInterestDebit(previousDetails.previouseMonthLoanInterestDebit == null ? 0 : previousDetails.previouseMonthLoanInterestDebit);
          setPreviousMonthLoanPrincipalDebit(previousDetails.previouseMonthLoanPrincipalDebit == null ? 0 : previousDetails.previouseMonthLoanPrincipalDebit);
          setPreviouseMonthLoanArrearsFine(previousDetails.previouseMonthLoanArrearsFine == null ? 0 : previousDetails.previouseMonthLoanArrearsFine);
          setPreviouseMonthLoanArrearsInterest(previousDetails.previouseMonthLoanArrearsInterest == null ? 0 : previousDetails.previouseMonthLoanArrearsInterest);
          setPreviousMonthBalanceBroughtForwardAmount(previousDetails.previouseBalanceBroughtForward == null ? 0 : previousDetails.previouseBalanceBroughtForward);
          setPreviousMonthBalanceCarriedForwardAmount(previousDetails.previouseBalanceCarryForward == null ? 0 : previousDetails.previouseBalanceCarryForward)
          setPreviousMonthDeductionDetailsList(previousDetails.deductionDetaiList)
          //for current month
          const currentDetails = await paymentServices.getCustomerCurrentMonthPaymentFullDetails(approveList);

          setCurrentTransportTotal(currentDetails.transport == null ? 0 : currentDetails.transport);
          setCurrentLoanTotal(currentDetails.loanDetailsModel == null ? 0 : currentDetails.loanDetailsModel.loanTotal);
          setCurentFactoryItemTotal(currentDetails.factoryItem == null ? 0 : currentDetails.factoryItem);
          setCurrentAdvanceTotal(currentDetails.advancedPayment == null ? 0 : currentDetails.advancedPayment);
          setCurrentCropDetails(currentDetails.cropDetailsModel);
          setMonthLoanInterestDebit(currentDetails.monthLoanInterestDebit);
          setMonthLoanPrincipalDebit(currentDetails.monthLoanPrincipalDebit);
          setMonthLoanArrearsFine(currentDetails.monthLoanArrearsFine);
          setMonthLoanArrearsInterest(currentDetails.monthLoanArrearsInterest);
          setBalanceCarriedForwardAmount(currentDetails.balanceCarryForward == null ? 0 : currentDetails.balanceCarryForward);
          setBalanceBroughtForwardAmount(currentDetails.balanceBroughtForward == null ? 0 : currentDetails.balanceBroughtForward)
          setCurrentMonthDeductionDetailsList(currentDetails.deductionDetaiList)
          setUserBasicDetails({
            ...userBasicDetails, GroupID: approveList.groupID, FactoryID: approveList.factoryID, CustomerRegistrationNumber: approveList.regNumber
          });
        }
        else {
          alert.error('Customer is InActive');
          setRunningBalance(0);
          ClearData();
        }
        setIsLoad(true)
      }
      else {
        alert.error('INVALID CUSTOMER REGISTRATION NUMBER');
        setRunningBalance(0);
        ClearData();
      }
    }
  }

  async function getCustomerDetailsByRegNumber() {
    const cus = await services.getCustomerDetails(approveList.groupID, approveList.factoryID, approveList.regNumber);
    setCustomer(cus.data);
    return cus;
  }

  async function checkCustomerIsActive() {
    const response = await services.CheckCustomerISActive(approveList.regNumber, approveList.factoryID);
    return response;
  }

  async function getCustomerAccountBalance() {
    const accountBalance = await services.getCustomerAccountBalanceByRedis(parseInt(customer.customerID), parseInt(customer.customerAccountID));
    setRunningBalance(accountBalance);
  }

  function SetAdvanceDetailsForReceipt(data) {
    setAdvancePaymentReciptDetails({
      ...AdvancePaymentReciptDetails,
      receiptDate: new Date().toISOString().split('T', 1),
      factoryName: '',
      payeeName: '',
      payeeAddress: '',
      payeeAddressTwo: '',
      payeeAddressThree: '',
      previousMonthName: '',
      currentMonthName: '',
      previousMonthAmount: 0,
      currentMonthAmount: 0,
      isOverAdvance: false
    });

    let currentMonthName = "";
    let previousMonthName = "";

    if (data.currentMonthAmount > 0 && data.previouseMonthAmount > 0) {
      previousMonthName = data.monthOne
      currentMonthName = data.monthTwo
    } else if (data.currentMonthAmount > 0) {
      currentMonthName = data.monthOne
    } else {
      previousMonthName = data.monthOne
    }

    setAdvancePaymentReciptDetails({
      ...AdvancePaymentReciptDetails,
      currentMonthAmount: data.currentMonthAmount,
      previousMonthAmount: data.previouseMonthAmount,
      payeeAddress: data.address,
      payeeAddressTwo: data.addressTwo,
      payeeAddressThree: data.addressThree,
      factoryName: data.factoryName,
      payeeName: data.customerName,
      previousMonthName: previousMonthName,
      currentMonthName: currentMonthName,
      isOverAdvance: false
    });

  }

  async function confirmAdvancePayment() {

    let previousMonthDate = ((addMonths(new Date(), -1)).toISOString()).split('T')[0];
    let currentMonthDate = ((addMonths(new Date(), 0)).toISOString()).split('T')[0];

    let currentMonth = (currentMonthDate.split('-')[1]).toString().padStart(2, '0');
    let currentYear = (currentMonthDate.split('-')[0]).toString();

    let previousMonth = (previousMonthDate.split('-')[1]).toString().padStart(2, '0');
    let previousYear = (previousMonthDate.split('-')[0]).toString();

    let previouse = {
      customerID: customer.customerID,
      requestedAmount: approveList.previouseMonthAmount === "" ? 0 : parseFloat(approveList.previouseMonthAmount),
      createdBy: tokenDecoder.getUserIDFromToken(),
      createdDate: new Date().toISOString(),
      registrationNumber: approveList.regNumber,
      isDirectPayment: true,
      advancePaymentRequestID: 0,
      applicableMonth: previousMonth,
      applicableYear: previousYear,
      customerAccountID: customer.customerAccountID,
      groupID: parseInt(approveList.groupID),
      factoryID: parseInt(approveList.factoryID),
      ledgerSelectedDetails: SelectedAccountDetails,
      isCurrentMonth: false,
      issuingDate: approveList.effectiveDate,
      advanceType: parseInt(AdvanceTypeSelection.toString())
    }
    let current = {
      customerID: customer.customerID,
      requestedAmount: approveList.currentMonthAmount === "" ? 0 : parseFloat(approveList.currentMonthAmount),
      createdBy: tokenDecoder.getUserIDFromToken(),
      createdDate: new Date().toISOString(),
      registrationNumber: approveList.regNumber,
      isDirectPayment: true,
      advancePaymentRequestID: 0,
      applicableMonth: currentMonth,
      applicableYear: currentYear,
      customerAccountID: customer.customerAccountID,
      groupID: parseInt(approveList.groupID),
      factoryID: parseInt(approveList.factoryID),
      ledgerSelectedDetails: SelectedAccountDetails,
      isCurrentMonth: true,
      issuingDate: approveList.effectiveDate,
      advanceType: parseInt(AdvanceTypeSelection.toString())
    }
    finalModel.push(previouse);
    finalModel.push(current);
    const response = await services.saveAdvancePaymentDetails(finalModel);

    const data = response.data
    if (response.statusCode == "Success") {
      SetAdvanceDetailsForReceipt(data);
      navigate('/app/advancePayment/listing');
      setAdvancePaymentReciptDetails({
        ...AdvancePaymentReciptDetails,
        receiptDate: new Date().toISOString().split('T', 1),
        factoryName: '',
        payeeName: '',
        payeeAddress: '',
        payeeAddressTwo: '',
        payeeAddressThree: '',
        previousMonthName: previous.toLocaleString('default', { month: 'long' }),
        currentMonthName: current.toLocaleString('default', { month: 'long' }),
        previousMonthAmount: 0,
        currentMonthAmount: 0,
        isOverAdvance: false
      })
      setCustomerDetails({
        customerName: "",
        routeName: ""
      });
      setIsLoad(false);
      alert.success(response.message);
      ClearData();
      window.location.reload(false);
    }
    else {
      setIsPrintButtonDisabled(true)
      setAdvancePaymentReciptDetails({
        ...AdvancePaymentReciptDetails,
        receiptDate: new Date().toISOString().split('T', 1),
        factoryName: '',
        payeeName: '',
        payeeAddress: '',
        payeeAddressTwo: '',
        payeeAddressThree: '',
        previousMonthName: previous.toLocaleString('default', { month: 'long' }),
        currentMonthName: current.toLocaleString('default', { month: 'long' }),
        previousMonthAmount: 0,
        currentMonthAmount: 0,
        isOverAdvance: false
      })
      alert.error(response.message);
      navigate('/app/advancePayment/listing');
    }
    setFinalModel([]);
  }

  async function payAdvancePayment() {
    if (totalAmount === 0 || totalAmount === null || totalAmount === undefined || parseFloat(totalAmount) === 0.00) {
      alert.error('Total amount required');
    }
    else if (totalAmount > totalBalance) {
      alert.error('Total amount cannot be greaterthan total balance');
      setDisableOverAdvanceBTN(false);
    }
    else if (totalAmount < 0) {
      alert.error('Total amount cannot be less than 0');
    }
    else if (parseFloat(approveList.previouseMonthAmount) > 0 && parseFloat(previouseAvailableBalance) < parseFloat(approveList.previouseMonthAmount)) {
      alert.error('Previouse month amount cannot be greater than previouse month balance');
      setPreviouseColorChange(true);
    }
    else if (parseFloat(approveList.currentMonthAmount) > 0 && parseFloat(currentAvailableBalance) < parseFloat(approveList.currentMonthAmount)) {
      alert.error('Current month amount cannot be greater than current month balance');
    }
    else if (SelectedAccountDetails.isGLSetup === true && SelectedAccountDetails.isMonthlyAccountsEnabledCredit === false && SelectedAccountDetails.creditAccountID === 0 || SelectedAccountDetails.creditAccountID === '0') {
      alert.error('Credit Account Selection Is Required');
      return;
    }
    else if (SelectedAccountDetails.isGLSetup === true && SelectedAccountDetails.isMonthlyAccountsEnabledDebit === false && SelectedAccountDetails.debitAccountID === 0 || SelectedAccountDetails.debitAccountID === '0') {
      alert.error('Debit Account Selection Is Required');
      return;
    }
    else if (EffectiveDate === null || EffectiveDate === "") {
      alert.error("Issuing Date is mandatory");
      return;
    }
    else {
      trackPromise(confirmAdvancePayment());
    }
  }

  async function ClearData() {
    setApproveList({
      ...approveList, regNumber: '', currentMonthAmount: '', previouseMonthAmount: '', effectiveDate: moment(new Date()).format('YYYY-MM-DD')
    });
    setCropDetails([]);
    setCurrentCropDetails([]);
    setAdvanceTotal(0);
    setFactoryItemTotal(0);
    setLoanTotal(0);
    setTransportTotal(0);
    setCustomerBalancePaymentAmount(0);
    setCurrentLoanTotal(0);
    setCurrentTransportTotal(0);
    setCurentFactoryItemTotal(0);
    setCurrentAdvanceTotal(0);
    setTotalBalance(0);
    setRunningBalance(0);
    setCurrentAvailableBalance(0);
    setPreviouseAvailableBalance(0);
    setIsBalancePaymetDone(false);
    setPreviousMonthLoanInterestDebit(0);
    setPreviousMonthLoanPrincipalDebit(0);
    setMonthLoanInterestDebit(0);
    setMonthLoanPrincipalDebit(0);
    setMonthLoanArrearsFine(0);
    setMonthLoanArrearsInterest(0);
    setPreviouseMonthLoanArrearsFine(0);
    setPreviouseMonthLoanArrearsInterest(0);
    setPreviousMonthDeductionDetailsList([]);
    setCurrentMonthDeductionDetailsList([]);
    setIsPrintButtonDisabled(true);
    setIsBalancePaymetCompletedStatus(false);
    setIsJoiningDateValidateStaus(false);
  }


  async function sendToOverAdvance(x) {

    let overAdvanceModel = {
      customerID: customer.customerID,
      requestedAmount: parseFloat(x),
      createdBy: tokenDecoder.getUserIDFromToken(),
      createdDate: new Date().toISOString(),
      issuingDate: approveList.effectiveDate,
      registrationNumber: approveList.regNumber,
      isDirectPayment: false,
      advancePaymentRequestID: 0,
      groupID: parseInt(approveList.groupID),
      factoryID: parseInt(approveList.factoryID),
      customerAccountID: customer.customerAccountID,
      advanceType: parseInt(AdvanceTypeSelection.toString())

    }

    const response = await services.sendToOverAdvancePayment(overAdvanceModel);
    if (response.statusCode == "Success") {
      ClearData();
      setCustomerDetails({
        customerName: "",
        routeName: ""
      });
      setIsLoad(false);
      alert.success(response.message);
    }
    else {
      alert.error(response.message);
    }
  }

  async function getCustomerDetailsNameAndRouteName(groupID, factoryID, registrationNumber) {
    var response = await services.getCustomerDetailsNameAndRouteName(groupID, factoryID, registrationNumber);
    if (response.statusCode == "Success" && response.data != null) {
      var data = response.data;
      setCustomerDetails({
        ...customerDetails,
        customerName: data.customerName,
        routeName: data.routeName
      });
    }

  }

  function ValidateFields(e) {
    const df = new RegExp('^[0-9]+$');
    const target = e.target;
    const name = target.name;
    const value = target.value

    if (value < 0 || !df.test(value)) {
      setIsAmountFieldsValid(false)
      setIsHideButton(false);
      if (name === "currentMonthAmount") {
        setIsCurrentMonthValid(false);
        setCurrentMonthAmountValidationText("Only allow positive number without decimals")
      } else {
        setIsPreviousMonthValid(false);
        setPreviousMonthAmountValidationText("Only allow positive number without decimals")
      }
    } else {
      if (name === "currentMonthAmount") {
        setIsCurrentMonthValid(true);
        setCurrentMonthAmountValidationText("")
        setIsAmountFieldsValid(true)
      } else {
        setIsPreviousMonthValid(true);
        setPreviousMonthAmountValidationText("")
        setIsAmountFieldsValid(true)
      }
      setIsHideButton(true);
    }
  }


  return (
    <Fragment>
      <LoadingComponent />
      <Page
        className={classes.root}
        title="Advance Payment">
        <Container maxWidth={false}>

          <Formik
            initialValues={{
              previouseMonthAmount: approveList.previouseMonthAmount,
              currentMonthAmount: approveList.currentMonthAmount,
              groupID: approveList.groupID,
              factoryID: approveList.factoryID,
              nic: approveList.nic,
              regNumber: approveList.regNumber,

            }}
            validationSchema={
              Yup.object().shape({
                previouseMonthAmount: Yup.string().min(0, 'previouse month amount should greater than 0').matches(/^\s*(?=.*[0-9])\d*(?:\.\d{1,2})?\s*$/, 'Only allow positive number with 2 decimals'),
                currentMonthAmount: Yup.string().min(0, 'Current month amount should greater than 0').matches(/^\s*(?=.*[0-9])\d*(?:\.\d{1,2})?\s*$/, 'Only allow positive number with 2 decimals'),
               // regNumber: Yup.string().required('Registration number is required').typeError('Enter valid registration number').matches(/^[0-9]{0,15}$/, 'Please enter valid registration number'),
                regNumber: Yup.string().required('Registration number is required').matches(/^(?! )[a-zA-Z0-9]{0,15}$/, 'Please enter valid registration number'),

              })
            }
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              isSubmitting,
              touched,
              values,
              props,
              isValid
            }) => (
              <form onSubmit={handleSubmit}>

                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={title} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group  *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="groupID"
                              onChange={(e) => handleChange(e)}
                              value={approveList.groupID}
                              variant="outlined"
                              size="small"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="factoryID"
                              onChange={(e) => handleChange(e)}
                              value={approveList.factoryID}
                              variant="outlined"
                              id="factoryID"
                              size="small"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled,
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="effectiveDate" style={{ marginBottom: '-8px' }}>
                              Issuing Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                disabled={!permissionList.isIssuingDateEnabled}
                                size='smal'
                                autoOk
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="effectiveDate"
                                value={approveList.effectiveDate}
                                maxDate={new Date()}
                                onChange={(e) => {
                                  handleEffectiveDate(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="regNumber">
                              Customer Reg Number *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="regNumber"
                              onChange={(e) => handleChange(e)}
                              value={approveList.regNumber}
                              variant="outlined"
                              id="regNumber"
                              size="small"
                              error={Boolean(touched.regNumber && errors.regNumber)}
                              helperText={touched.regNumber && errors.regNumber}
                              onBlur={handleBlur}
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            onClick={() => trackPromise(searchCustomerBalanceDetails())}
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      {customerDetails.customerName != "" ? (

                        <Grid container spacing={2}>
                          <Grid item md={5} xs={12}>
                            <Typography style={{ fontSize: '16px' }} align="left"><b>Customer Name: </b> {customerDetails.customerName}</Typography>

                          </Grid>
                          <Grid item md={5} xs={12}>
                            <Typography style={{ fontSize: '16px' }} align="left"><b>Route Name: </b> {customerDetails.routeName}</Typography>
                          </Grid>


                          <Grid container spacing={3}>
                            <Grid item md={12} xs={12}>
                              <Card>
                                <CardContent>
                                  <CustomerPaymentDetailsNewComponent
                                    cropDetails={cropDetails}
                                    advanceTotal={advanceTotal}
                                    factoryItemTotal={factoryItemTotal}
                                    loanTotal={loanTotal}
                                    transportTotal={transportTotal}
                                    customerBalancePaymentAmount={customerBalancePaymentAmount}
                                    previouseAvailableBalance={previouseAvailableBalance}
                                    currentCropDetails={currentCropDetails}
                                    currentAdvanceTotal={currentAdvanceTotal}
                                    currentFactoryItemTotal={currentFactoryItemTotal}
                                    currentLoanTotal={currentLoanTotal}
                                    currentTransportTotal={currentTransportTotal}
                                    currentAvailableBalance={currentAvailableBalance}
                                    isBalancePaymetDone={IsBalancePaymetDone}
                                    permissionList={permissionList}
                                    setCropDetails={setCropDetails}
                                    setCurrentCropDetails={setCurrentCropDetails}
                                    TotalBalance={parseFloat(totalBalance)}
                                    RunningBalance={runningBalance}
                                    previousMonthLoanInterestDebit={previousMonthLoanInterestDebit}
                                    previousMonthLoanPrincipalDebit={previousMonthLoanPrincipalDebit}
                                    monthLoanInterestDebit={monthLoanInterestDebit}
                                    monthLoanPrincipalDebit={monthLoanPrincipalDebit}
                                    monthLoanArrearsFine={monthLoanArrearsFine}
                                    monthLoanArrearsInterest={monthLoanArrearsInterest}
                                    previouseMonthLoanArrearsFine={previouseMonthLoanArrearsFine}
                                    previouseMonthLoanArrearsInterest={previouseMonthLoanArrearsInterest}
                                    PreviousMonthBalanceBroughtForwardAmount={PreviousMonthBalanceBroughtForwardAmount}
                                    PreviousMonthBalanceCarriedForwardAmount={PreviousMonthBalanceCarriedForwardAmount}
                                    BalanceCarriedForwardAmount={BalanceCarriedForwardAmount}
                                    BalanceBroughtForwardAmount={BalanceBroughtForwardAmount}
                                    PreviousMonthDeductionDetailsList={PreviousMonthDeductionDetailsList}
                                    CurrentMonthDeductionDetailsList={CurrentMonthDeductionDetailsList}
                                  />
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                        </Grid>
                      ) : null}

                      <Grid container spacing={0}>
                        <Grid item md={12} xs={12}>
                          {IsLoad ?
                            //approveList.regNumber != "" ? //for later use
                            <UserStatisticsComponent
                              UserDetails={userBasicDetails}
                            />
                            : null}
                        </Grid>
                      </Grid>

                      {IsLoad == true ? (
                        <Grid container spacing={2} style={{ marginLeft: "15px", marginTop: "10px" }} >
                          <Grid item md={12} xs={12}>
                            <RadioGroup row name="advanceType" value={AdvanceTypeSelection} onChange={handleRadioChange}>
                              <FormControlLabel
                                value={agriGenERPEnum.TransactionType.Advance_Payment}
                                control={<Radio color="primary" />}
                                label="Cash"
                              />
                              <FormControlLabel
                                value={agriGenERPEnum.TransactionType.Advance_Cheque}
                                control={<Radio color="primary" />}
                                label="Cheque"
                              />
                              <FormControlLabel
                                value={agriGenERPEnum.TransactionType.Advance_Payment_Bank}
                                control={<Radio color="primary" />}
                                label="Bank"
                              />
                            </RadioGroup>
                          </Grid>
                        </Grid>

                      ) : null}
                      {IsLoad ?
                        <AutoGLComponent
                          AutoGLRequestDetailsModel={AutoGLRequestDetailsModel}
                          SetSelectedAccountDetails={setSelectedAccountDetails}
                        /> : null
                      }
                      {
                        IsLoad == true ? (
                          <Grid container md={12} xs={12}>
                            <Grid item md={12} xs={12}>
                              <Box border={1} borderRadius={8} borderColor="green" {...currentProps1}>
                                <Grid container md={12} xs={12}>
                                  <Grid container md={6} xs={12}>
                                    {
                                      IsBalancePaymetCompletedStatus || IsJoiningDateValidateStatus ?
                                        <>
                                          <Grid item md={11} xs={6} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                            {
                                              IsBalancePaymetCompletedStatus && IsJoiningDateValidateStatus ?
                                                <Chip variant="outlined" style={{ color: "red" }} size="small" label="Balance payment completed and transaction is not permited" />
                                                :
                                                IsBalancePaymetCompletedStatus ?
                                                  <Chip variant="outlined" style={{ color: "red" }} size="small" label="Previous month balance payment completed" />
                                                  :
                                                  <Chip variant="outlined" style={{ color: "red" }} size="small" label="Transaction is not permited" />
                                            }
                                          </Grid>
                                        </>
                                        :
                                        <>
                                          <Grid item md={5} xs={6} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                            <InputLabel shrink id="previouseMonthAmount">Previous Month Amount</InputLabel>
                                          </Grid>
                                          <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <TextField
                                              error={Boolean(touched.previouseMonthAmount && errors.previouseMonthAmount) || (!IsPreviousMonthValid)}
                                              helperText={touched.previouseMonthAmount && errors.previouseMonthAmount || PreviousMonthAmountValidationText}
                                              onBlur={handleBlur}
                                              fullWidth
                                              name="previouseMonthAmount"
                                              variant="outlined"
                                              value={approveList.previouseMonthAmount}
                                              // inputProps={{ readOnly: IsBalancePaymetDone || previouseAvailableBalance <= 0 }}
                                              inputProps={{
                                                readOnly: IsBalancePaymetDone || (previouseAvailableBalance == 0 && cropDetails.filter(x => x.totalCrop == 0).length == cropDetails.length) ? true : false
                                              }}
                                              onChange={(e) => {
                                                handleChange(e);
                                                ValidateFields(e);
                                              }}
                                              size="small"
                                            />
                                          </Grid>
                                        </>
                                    }

                                    <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                      <InputLabel shrink id="currentMonthAmount">Current Month Amount</InputLabel>
                                    </Grid>
                                    <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                      <TextField
                                        // error={Boolean(touched.currentMonthAmount && errors.currentMonthAmount)}
                                        error={Boolean(touched.currentMonthAmount && errors.currentMonthAmount) || (!IsCurrentMonthValid)}
                                        helperText={touched.currentMonthAmount && errors.currentMonthAmount || CurrentMonthAmountValidationText}
                                        onBlur={handleBlur}
                                        fullWidth
                                        name="currentMonthAmount"
                                        variant="outlined"
                                        value={approveList.currentMonthAmount}
                                        onChange={(e) => {
                                          handleChange(e)
                                          ValidateFields(e)
                                        }}
                                        size="small"
                                      />
                                    </Grid>
                                  </Grid>
                                  <Grid container md={6} xs={12} alignContent="center">
                                    <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                      <InputLabel shrink id="totalAmount">Total Amount</InputLabel>
                                    </Grid>
                                    <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                      <TextField
                                        fullWidth
                                        name="totalAmount"
                                        variant="outlined"
                                        value={totalAmount}
                                        size="small"
                                        InputProps={{ readOnly: true }}
                                      />
                                    </Grid>
                                  </Grid>
                                </Grid>

                                <Box display="flex" justifyContent="flex-end" p={1} >
                                  <Grid container justify="flex-end"  >
                                    <Grid item md={5}></Grid>

                                    <Grid item md={3}>

                                    </Grid>
                                    {permissionList.isSendToOverAdvanceEnabled && !disableOverAdvanceBTN ?
                                      <Grid item md={3} style={{ marginRight: '-5rem', marginLeft: '5rem' }} >
                                        <AlertDialog confirmData={userData} IconTitle={'Request Over Advance'} headerMessage={'Are you sure you want to request over advance'} discription={'Total Amount ' + totalAmount} isValid={isValid && IsAmountFieldsValid} viewPopup={EnableConfirmMessage} setViewPopup={setEnableConfirmMessage} />
                                      </Grid>
                                      : null}
                                    {
                                      disableOverAdvanceBTN && !IsPrintButtonDisabled ?
                                        <div>
                                          <ReactToPrint
                                            documentTitle={"Advance Payment Receipt"}
                                            trigger={() =>
                                              <Button
                                                color="primary"
                                                type="submit"
                                                variant="contained"
                                                size="medium"
                                                style={{ marginRight: '0.5rem' }}
                                              >
                                                Print Receipt
                                              </Button>
                                            }
                                            content={() => componentRef.current}
                                            onAfterPrint={() => ClearData()}
                                          />
                                          <div hidden={true}>
                                            <AdvancePaymentReceiptComponent ref={componentRef} data={AdvancePaymentReciptDetails} />
                                          </div>
                                        </div>
                                        :
                                        <>
                                          {permissionList.isIssuePermissionEnabled && disableOverAdvanceBTN && isHideButton ?
                                            <Grid item >
                                              <AlertDialog confirmData={confirmData} IconTitle={iconTitle} headerMessage={message} discription={discription} isValid={isValid && IsAmountFieldsValid} viewPopup={EnableConfirmMessage} setViewPopup={setEnableConfirmMessage} />
                                            </Grid>
                                            : null}
                                        </>
                                    }
                                  </Grid>
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>

                        ) : null
                      }

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


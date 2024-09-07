import React, { useState, useEffect, Fragment, useRef } from 'react';
import {
  Box, Card, makeStyles, Container, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, CardHeader,
  Button, Chip, Typography
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { useAlert } from "react-alert";
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import { LoadingComponent } from '../../../utils/newLoader';
import tokenService from '../../../utils/tokenDecoder';
import { UserStatisticsComponent } from '../../UserStatistics/UserStatisticsExportComponent';
import PageHeader from 'src/views/Common/PageHeader';
import paymentServices from './../../Common/CustomerPaymentDetails/Services';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Formik } from 'formik';
import * as Yup from "yup";
import { CustomerPaymentDetailsNewComponent } from 'src/views/Common/CustomerPaymentDetailsNewComponent/CustomerPaymentDetailsNewComponenet';
import AdvancePaymentReceiptComponent from './../../Common/AdvancedPaymentPrintReceipt/AdvancePaymentReceiptComponent';
import ReactToPrint from "react-to-print";
import { AutoGLComponent } from './../../Common/AutoGLSelectionComponent/AutoGLSelectorComponent';
import { AgriGenERPEnum } from './../../Common/AgriGenERPEnum/AgriGenERPEnum';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { AlertDialogWithoutButton } from '../../Common/AlertDialogWithoutButton';

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
  chip: {
    minWidth: "20%",
  },
  colorReject: {
    backgroundColor: "red",
  },
  colorApprove: {
    backgroundColor: "green",
  },
  colorAuthorize: {
    backgroundColor: "#FFBE00"
  },
}));
const screenCode = 'OVERADVANCEPAYMENTREQUEST';
export default function OverAdvanceCreate() {
  const agriGenERPEnum = new AgriGenERPEnum()
  const classes = useStyles();
  const componentRef = useRef();
  const [title, setTitle] = useState("Add Over Advance");
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [newRates, setNewRates] = useState([]);
  const [cropDetails, setCropDetails] = useState([]);
  const [currentCropDetails, setCurrentCropDetails] = useState([]);
  const [advanceTotal, setAdvanceTotal] = useState(0);
  const [factoryItemTotal, setFactoryItemTotal] = useState(0);
  const [loanTotal, setLoanTotal] = useState(0);
  const [customerBalancePaymentAmount, setCustomerBalancePaymentAmount] = useState(0);
  const [currentAdvanceTotal, setCurrentAdvanceTotal] = useState(0);
  const [currentFactoryItemTotal, setCurentFactoryItemTotal] = useState(0);
  const [currentLoanTotal, setCurrentLoanTotal] = useState(0);
  const [transportTotal, setTransportTotal] = useState(0);
  const [currentTransportTotal, setCurrentTransportTotal] = useState(0);
  const [previouseAvailableBalance, setPreviouseAvailableBalance] = useState(0);
  const [currentAvailableBalance, setCurrentAvailableBalance] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalAmount, setTotalAmount] = useState();
  const [customer, setCustomer] = useState();
  const alert = useAlert();
  const [isDisable, setIsDisable] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [reqAmount, setReqAmount] = useState();
  const ApprovalEnum = Object.freeze({ "Pending": 1, "Approve": 2, "Reject": 3, });
  const [inPending, setInPending] = useState(true);
  const [newlyCreated, setNewlyCreated] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);
  const [newAdvancePaymentRequestID, setNewAdvancePaymentRequestID] = useState(0);
  const [runningBalance, setRunningBalance] = useState(0);
  const [IsBalancePaymetDone, setIsBalancePaymetDone] = useState(false);
  const [open, setOpen] = React.useState(true);
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
  const [PreviousMonthDeductionDetailsList, setPreviousMonthDeductionDetailsList] = useState([]);
  const [CurrentMonthDeductionDetailsList, setCurrentMonthDeductionDetailsList] = useState([]);
  const [IsBalancePaymetCompletedStatus, setIsBalancePaymetCompletedStatus] = useState(false);
  const [IsJoiningDateValidateStatus, setIsJoiningDateValidateStaus] = useState(false);
  const [IsLoad, setIsLoad] = useState(false);
  const [issuedate, setissuedate] = useState('');
  const [foundData, setFoundData] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [authorizePaymentDetails, setAuthorizePaymentDetails] = useState([])
  const [approveList, setApproveList] = useState({
    groupID: '0',
    factoryID: '0',
    nic: '',
    regNumber: '',
    previouseMonthAmount: '',
    currentMonthAmount: ''
  });
  const [approveDetails, setApproveDetails] = useState([]);
  const currentProps1 = {
    border: 1,
    style: { height: 'auto', marginLeft: '1rem', marginBottom: '1rem' }
  };

  const { advancePaymentRequestID } = useParams();
  const navigate = useNavigate();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAuthorizeChangeEnabled: false,
    isIssueChangeEnabled: false,
    isAdvanceRateChangeEnabled: false,
    isIssuingDateEnabled: false,
    isViewTotalAmount: false,
    isViewAvailableAmount: false
  });

  const [userBasicDetails, setUserBasicDetails] = useState({
    FactoryID: '0',
    GroupID: '0',
    NIC: null,
    CustomerRegistrationNumber: ''
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
    isOverAdvance: true
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
  });
  const [SelectedAccountDetails, setSelectedAccountDetails] = useState({
    creditAccountID: 0,
    debitAccountID: 0,
    isGLSetup: false,
    isMonthlyAccountsEnabledCredit: false,
    isMonthlyAccountsEnabledDebit: false
  });
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    routeName: ""
  });
  const [EffectiveDate, handleEffectiveDate] = useState(new Date());
  const [AdvanceTypeSelection, setAdvanceTypeSelection] = useState(agriGenERPEnum.TransactionType.Advance_Payment)

  const handleRadioChange = (event) => {
    var tranTypeID = parseInt(event.target.value.toString());
    setAdvanceTypeSelection(tranTypeID);
    if (newlyCreated) {
      setAutoGLRequestDetailsModel({
        ...AutoGLRequestDetailsModel,
        transactionTypeID: tranTypeID
      })
    }
  };

  const handleClick = () => {
    navigate('/app/advancePaymentRequest/listing');
  }

  const handleClose = () => {
    setIsDisableButton(false);
    setOpen(false);
  };
  const [btnName, setBtnName] = useState("Cancel");

  useEffect(() => {
    decrypted = atob(advancePaymentRequestID.toString());
    if (parseInt(decrypted) > 0) {
      setIsUpdate(true)
      setNewlyCreated(false);
      trackPromise(
        getApproveDetails(decrypted),
        setBtnName("Reject")
      )
    }
    setInPending(false);
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
      getPermission()
    );
  }, []);

  useEffect(() => {
    if (approveList.groupID > 0) {
      trackPromise(
        getfactoriesForDropDown(),
        // atob(advancePaymentRequestID.toString()) > 0 ? searchCustomerBalanceDetails(approveList) : null,
      );
    }
  }, [approveList.groupID]);

  useEffect(() => {
    trackPromise(
      getCustomerAccountBalance(),
    )
  }, [customer]);

  useEffect(() => {
    trackPromise(
      setCurAvailableBalance(),
      calculateCurrentBalance(),
    );
  }, [currentCropDetails]);

  useEffect(() => {
    trackPromise(
      calculateCurrentBalance(),
      setPreAvailableBalance()
    );
  }, [cropDetails]);

  useEffect(() => {
    trackPromise(
      setPreAvailableBalance(),
      setCurAvailableBalance(),
    );
  }, [newRates]);

  useEffect(() => {
    trackPromise(
      calculateTotalBalance(),
    )
  }, [previouseAvailableBalance]);

  useEffect(() => {
    trackPromise(
      calculateTotalBalance(),
    )
  }, [currentAvailableBalance]);

  useEffect(() => {
    trackPromise(
      calculateTotalBalance(),
      calculateCurrentBalance()
    )
  }, [currentAdvanceTotal]);

  useEffect(() => {
    trackPromise(
      calculateTotalBalance(),
      calculateCurrentBalance()
    )
  }, [currentFactoryItemTotal]);

  useEffect(() => {
    trackPromise(
      calculateTotalBalance(),
      calculateCurrentBalance()
    )
  }, [currentLoanTotal]);

  useEffect(() => {
    createTotalAmount()
  }, [approveList]);

  useEffect(() => {
    calculateTotalBalance(); calculateCurrentBalance();
  }, [currentTransportTotal]);

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
  }, [CurrentMonthTotalExpensesAmount, PreviousMonthTotalExpensesAmount])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITOVERADVANCEPAYMENTREQUEST');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isAuthorizeChangeEnabled = permissions.find(p => p.permissionCode === 'OVERADVANCEAUTHORIZE');
    var isIssueChangeEnabled = permissions.find(p => p.permissionCode == "OVERADVANCEISSUE");
    var isAdvanceRateChangeEnabled = permissions.find(p => p.permissionCode == "ADVANCERATECHANGEPERMISSION");
    var isIssuingDateEnabled = permissions.find(p => p.permissionCode == "ISSUINGDATECHANGEPERMISSION");
    var isViewTotalAmount = permissions.find(p => p.permissionCode == "VIEWTOTALAMOUNT");
    var isViewAvailableAmount = permissions.find(p => p.permissionCode == "VIEWAVAILABLEAMOUNT");


    setPermissions({
      ...permissionList,
      isAuthorizeChangeEnabled: isAuthorizeChangeEnabled !== undefined,
      isIssueChangeEnabled: isIssueChangeEnabled !== undefined,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isAdvanceRateChangeEnabled: isAdvanceRateChangeEnabled !== undefined,
      isIssuingDateEnabled: isIssuingDateEnabled !== undefined,
      isViewTotalAmount: isViewTotalAmount !== undefined,
      isViewAvailableAmount: isViewAvailableAmount !== undefined
    });

    if (atob(advancePaymentRequestID.toString()) == 0) {
      setApproveList({
        ...approveList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      });
    }
  }

  async function getApproveDetails(advancePaymentRequestID) {
    let response = await services.getApprovedDetailsByID(advancePaymentRequestID);
    setApproveDetails(response);
    let data = response[0];
    setAdvanceTypeSelection(data.transactionTypeID)
    setApproveList({
      ...approveList,
      groupID: data.groupID,
      factoryID: data.factoryID,
      regNumber: data.registrationNumber,
      previouseMonthAmount: parseFloat(data.previouseMonthAmount),
      currentMonthAmount: parseFloat(data.currentMonthAmount)
    });
    setissuedate(data.issuingDate)
    setReqAmount(data.requestedAmount)
    setTitle("Edit Over Advance");

    data.statusID == ApprovalEnum.Pending ? setInPending(true) : setInPending(false);

    setUserBasicDetails({
      ...userBasicDetails,
      GroupID: data.groupID,
      FactoryID: data.factoryID,
      CustomerRegistrationNumber: data.registrationNumber
    });

    let model = {
      regNumber: data.registrationNumber,
      groupID: data.groupID,
      factoryID: data.factoryID,
      nic: null,
      transactionTypeID: parseInt(data.transactionTypeID.toString())
    }

    trackPromise(searchCustomerBalanceDetails(model));
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

  async function createTotalAmount() {
    var total = parseFloat(approveList.currentMonthAmount == "" ? 0 : approveList.currentMonthAmount) + parseFloat(approveList.previouseMonthAmount == '' ? 0 : approveList.previouseMonthAmount);
    setTotalAmount(isNaN(total) ? 0 : parseFloat(total).toFixed(2));
    setIsDisable(total != 0 ? false : true);
  }

  async function createMonthAmount() {
    setApproveList({ ...approveList, currentMonthAmount: 0, previouseMonthAmount: 0 });
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

  async function setCurAvailableBalance() {
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

  async function ClearData() {
    setApproveList({
      ...approveList, regNumber: '', currentMonthAmount: '0', previouseMonthAmount: '0'
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

  async function searchCustomerBalanceDetails(model) {
    setIsLoad(false)
    if (EffectiveDate === null || EffectiveDate === "") {
      alert.error("Issuing Date is mandatory");
      return;
    } else if (model.regNumber == "") {
      alert.error('Please enter registration number');
    }

    if (model.transactionTypeID === null || model.transactionTypeID === undefined) {
      setAutoGLRequestDetailsModel({
        ...AutoGLRequestDetailsModel,
        groupID: parseInt(model.groupID.toString()),
        factoryID: parseInt(model.factoryID.toString()),
        transactionTypeID: parseInt(agriGenERPEnum.TransactionType.Advance_Payment.toString())
      })
    } else {
      setAutoGLRequestDetailsModel({
        ...AutoGLRequestDetailsModel,
        groupID: parseInt(model.groupID.toString()),
        factoryID: parseInt(model.factoryID.toString()),
        transactionTypeID: parseInt(model.transactionTypeID.toString())
      })
    }


    //Common Min And Max Rates

    const newRate = await paymentServices.getCurrentMinMaxRateByApplicableMonthAndYear(model.factoryID);
    setNewRates(newRate);

    const IsPreviousMonthAdvanceIssueDisable = await paymentServices.IsPreviousMonthAdvanceIssueDisabled(model);

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

    //For Previous Month
    const previousDetails = await paymentServices.getCustomerPreviousMonthPaymentFullDetails(model);
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
    const currentDetails = await paymentServices.getCustomerCurrentMonthPaymentFullDetails(model);
    setCurrentTransportTotal(currentDetails.transport == null ? 0 : currentDetails.transport);
    setCurrentLoanTotal(currentDetails.loanDetailsModel == null ? 0 : currentDetails.loanDetailsModel.loanTotal);
    setCurentFactoryItemTotal(currentDetails.factoryItem == null ? 0 : currentDetails.factoryItem);
    setCurrentAdvanceTotal(currentDetails.advancedPayment == null ? 0 : currentDetails.advancedPayment);
    setCurrentCropDetails(currentDetails.cropDetailsModel);
    setMonthLoanInterestDebit(currentDetails.monthLoanInterestDebit);
    setMonthLoanPrincipalDebit(currentDetails.monthLoanPrincipalDebit);
    setMonthLoanArrearsFine(currentDetails.monthLoanArrearsFine);
    setMonthLoanArrearsInterest(currentDetails.monthLoanArrearsInterest);
    setBalanceCarriedForwardAmount(currentDetails.balanceCarryForward == null ? 0 : currentDetails.balanceCarryForward)
    setBalanceBroughtForwardAmount(currentDetails.balanceBroughtForward == null ? 0 : currentDetails.balanceBroughtForward)
    setCurrentMonthDeductionDetailsList(currentDetails.deductionDetaiList)

    setUserBasicDetails({
      ...userBasicDetails, GroupID: approveList.groupID, FactoryID: approveList.factoryID, CustomerRegistrationNumber: approveList.regNumber
    });

    atob(advancePaymentRequestID.toString()) > 0 ? setUserBasicDetails({
      ...userBasicDetails, GroupID: model.groupID, FactoryID: model.factoryID, CustomerRegistrationNumber: model.regNumber
    }) : setUserBasicDetails({
      ...userBasicDetails, GroupID: approveList.groupID, FactoryID: approveList.factoryID, CustomerRegistrationNumber: approveList.regNumber
    });
    var found = await getCustomerDetailsByRegNumber(model);
    setFoundData(found);

    if (atob(advancePaymentRequestID.toString()) == 0) {
      var validate = /^[1-9]\d*$/;
      // if (!validate.test(approveList.regNumber)) {
      //   ClearData();
      //  setRunningBalance(0);
      //   return;
      // }

      if (found.data === null) {
        alert.error('INVALID CUSTOMER REGISTRATION NUMBER');
        setRunningBalance(0);
        ClearData();
        setIsLoad(false)
      } else {
        trackPromise(getCustomerDetailsNameAndRouteName(approveList.groupID, approveList.factoryID, approveList.regNumber));
        var active = await checkCustomerIsActive();
        if (!active) {
          alert.error('Customer is InActive');
          setRunningBalance(0);
          ClearData();
        }
        setIsLoad(true)
      }


    }

  }

  async function checkCustomerIsActive() {
    const response = await services.CheckCustomerISActive(approveList.regNumber, approveList.factoryID);
    return response;
  }

  async function getCustomerDetailsByRegNumber(model) {
    if (atob(advancePaymentRequestID.toString()) > 0) {
      const cus = await services.getCustomerDetails(model.groupID, model.factoryID, model.regNumber)
      setCustomer(cus.data);
    } else {
      const cus = await services.getCustomerDetails(approveList.groupID, approveList.factoryID, approveList.regNumber);
      setCustomer(cus.data);
      return cus;
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

  async function getCustomerAccountBalance() {
    const accountBalance = await services.getCustomerAccountBalanceByRedis(parseInt(customer.customerID), parseInt(customer.customerAccountID));
    setRunningBalance(accountBalance);
  }

  async function IssueAdvancePayment() {

    let approveModel = {
      advancePaymentRequestID: newlyCreated ? newAdvancePaymentRequestID : atob(advancePaymentRequestID.toString()),
      requestedAmount: newlyCreated ? totalAmount : reqAmount,
      approvedAmount: parseFloat(totalAmount),
      previouseBalance: approveList.previouseMonthAmount === "" ? 0 : parseFloat(approveList.previouseMonthAmount),
      currentBalance: approveList.currentMonthAmount === "" ? 0 : parseFloat(approveList.currentMonthAmount)
    }

    if (totalAmount <= 0 || totalAmount == null || totalAmount == undefined) {
      alert.error("Please enter valid total amount");
    }
    else if (atob(advancePaymentRequestID.toString()) > 0) {
      reqAmount < totalAmount ? alert.error('Total amount is greater than requested amount') : confirmPayment(approveModel);
    }
    else {
      confirmPayment(approveModel);
    }
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
      isOverAdvance: true
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
      isOverAdvance: true
    });

  }

  async function Approve(approveModel) {
    let response = await services.ApproveAdvancePayment(approveModel);
    let data = response.data
    if (response.statusCode == "Success") {
      SetAdvanceDetailsForReceipt(data)
      setIsPrintButtonDisabled(false)
      alert.success(response.message);
      // ClearData();
      navigate('/app/advancePaymentRequest/listing');
    }
    else {
      setIsPrintButtonDisabled(true)
      alert.error(response.message);
    }
  }

  function confirmPayment(approveModel) {
    confirmAlert({
      title: 'Confirm To Approve',
      message: 'Are you sure to do this.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => trackPromise(Approve(approveModel))
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

  async function Authorize(authorizeModel) {
    if (atob(advancePaymentRequestID.toString()) > 0) {
      let response = await services.UpdateOverAdvanceRequest(authorizeModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setInPending(false);
        navigate('/app/advancePaymentRequest/listing');
        setNewAdvancePaymentRequestID(response.data);
      }
      else {
        setIsDisableButton(false);
        alert.error(response.message);
        setInPending(true)
      }
    }
    else {
      let response = await services.AuthorizeAdvancePayment(authorizeModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setInPending(false);
        navigate('/app/advancePaymentRequest/listing');
        setNewAdvancePaymentRequestID(response.data);

      }
      else {
        setIsDisableButton(false);
        alert.error(response.message);
        setInPending(true)
      }
    }
  }

  function AuthorizePayment(authorizeModel) {
    setDialog(true);
    setAuthorizePaymentDetails(authorizeModel);
  }

  async function Reject(rejectModel) {
    let response = await services.RejectAdvancePayment(rejectModel);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      navigate('/app/advancePaymentRequest/listing');
    }
    else {
      setIsDisableButton(false);
      alert.error(response.message);
    }
  }

  function RejectPayment(rejectModel) {
    confirmAlert({
      title: 'Confirm To Reject ',
      message: 'Are you sure to do this.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => Reject(rejectModel)
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

  async function RejectAdvancePayment() {
    let rejectModel = {
      advancePaymentRequestID: atob(advancePaymentRequestID.toString()),
    }
    if (atob(advancePaymentRequestID.toString()) > 0) {
      setIsDisableButton(true);
      RejectPayment(rejectModel);
    }
    else {
      navigate('/app/advancePaymentRequest/listing');
    }
  }

  async function AuthorizeAdvancePayment() {
    if (atob(advancePaymentRequestID.toString()) > 0) {
      if (!newlyCreated) {
        if (parseFloat(approveList.previouseMonthAmount) + parseFloat(approveList.currentMonthAmount) < totalAmount) {
          alert.error('previouse and current month sum is not equal to total amount');
        }
        else if (reqAmount < totalAmount) {
          alert.error('Total amount is greater than requested amount');
        }
        else if (totalAmount <= 0) {
          alert.error('Enter a valid amount');
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
          setIsDisableButton(true);
          let response = await services.getApprovedDetailsByID(atob(advancePaymentRequestID.toString()));
          let data = response[0];

          let authorizeModel = {
            advancePaymentRequestID: atob(advancePaymentRequestID.toString()),
            requestedAmount: reqAmount,
            customerID: data.customerID,
            customerAccountID: data.customerAccountID,
            factoryID: approveList.factoryID,
            groupID: approveList.groupID,
            approvedAmount: parseFloat(totalAmount),
            previouseBalance: approveList.previouseMonthAmount === "" ? 0 : parseFloat(approveList.previouseMonthAmount),
            currentBalance: approveList.currentMonthAmount === "" ? 0 : parseFloat(approveList.currentMonthAmount),
            ledgerSelectedDetails: SelectedAccountDetails,
            customerAccountID: customer.customerAccountID,
            issuingDate: EffectiveDate.toISOString(),
            registrationNumber: approveList.regNumber,
            advanceType: AdvanceTypeSelection
          }
          AuthorizePayment(authorizeModel)
        }
      }
    }
    else {
      if (totalAmount <= 0) {
        alert.error('Enter a valid amount');
      } else if (SelectedAccountDetails.isGLSetup === true && SelectedAccountDetails.isMonthlyAccountsEnabledCredit === false && SelectedAccountDetails.creditAccountID === 0 || SelectedAccountDetails.creditAccountID === '0') {
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
        let authorizeModel = {
          advancePaymentRequestID: 0,
          requestedAmount: totalAmount,
          approvedAmount: totalAmount,
          registrationNumber: approveList.regNumber,
          factoryID: approveList.factoryID,
          groupID: approveList.groupID,
          previouseBalance: approveList.previouseMonthAmount === "" ? 0 : parseFloat(approveList.previouseMonthAmount),
          currentBalance: approveList.currentMonthAmount === "" ? 0 : parseFloat(approveList.currentMonthAmount),
          ledgerSelectedDetails: SelectedAccountDetails,
          customerAccountID: customer.customerAccountID,
          issuingDate: EffectiveDate.toISOString(),
          registrationNumber: approveList.regNumber,
          advanceType: AdvanceTypeSelection
        }
        AuthorizePayment(authorizeModel)
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
          <PageHeader
            onClick={handleClick}
            isEdit={false}
          />
        </Grid>
      </Grid>
    )
  }

  function ValidateFields(e) {
    const df = new RegExp('^[0-9]+$');
    const target = e.target;
    const name = target.name;
    const value = target.value

    if (value < 0 || !df.test(value)) {
      setIsAmountFieldsValid(false)
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
    }
  }

  function AfterPrint() {
    ClearData();
    navigate('/app/advancePaymentRequest/listing');
  }

  async function cancelRequest() {
    setDialog(false);
  }

  async function confirmRequest() {
    Authorize(authorizePaymentDetails);
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page
        className={classes.root}
        title="Add Over Advance"
      >
        <Container maxWidth={true}>
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
                //regNumber: Yup.string().required('Registration number is required').typeError('Enter valid Registration number').matches(/^[0-9]{0,15}$/, 'Please enter valid registration number'),
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
                      title={cardTitle(title)}
                    />

                    <Divider />
                    <CardContent style={{ marginBottom: "0.1rem" }}>
                      <Grid container spacing={3}>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="groupID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.groupID}
                            variant="outlined"
                            size="small"
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isGroupFilterEnabled }}
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
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isFactoryFilterEnabled }}
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
                              disabled={!newlyCreated || !permissionList.isIssuingDateEnabled}
                              size='small'
                              autoOk
                              fullWidth
                              inputVariant="outlined"
                              format="dd/MM/yyyy"
                              margin="dense"
                              id="EffectiveDate"
                              value={newlyCreated ? EffectiveDate : issuedate}
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
                            InputProps={{ readOnly: !newlyCreated }}
                            error={Boolean(touched.regNumber && errors.regNumber)}
                            helperText={touched.regNumber && errors.regNumber}
                            onBlur={handleBlur}
                          >
                          </TextField>
                        </Grid>
                      </Grid>

                      {!newlyCreated ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <InputLabel shrink id="nic">
                            Requested Amount *
                          </InputLabel>
                          <Chip
                            label={reqAmount}
                            color="secondary"
                            size="medium"
                            className={classes.chip}
                          />
                        </Box>
                        : null}

                      {newlyCreated ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            onClick={() => trackPromise(searchCustomerBalanceDetails(approveList))}
                            size="small"
                          >
                            Search
                          </Button>
                        </Box>
                        : null}
                    </CardContent>
                    {customerDetails.customerName != "" || approveDetails.length > 0 ? (

                      <Grid container spacing={2}>
                        <Grid item md={5} xs={12}>
                          <Typography style={{ fontSize: '16px', paddingLeft: '1rem' }} align="left"><b>Customer Name: </b> {customerDetails.customerName}</Typography>
                        </Grid>

                        <Grid item md={5} xs={12}>
                          <Typography style={{ fontSize: '16px' }} align="left"><b>Route Name: </b> {customerDetails.routeName}</Typography>
                        </Grid>


                        <br />

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

                    <Grid container spacing={2}>
                      <Grid item md={12} xs={12}>
                        {(IsLoad == true && foundData.data !== null) || inPending == true ?
                          <UserStatisticsComponent
                            UserDetails={userBasicDetails}
                          />
                          : null}
                      </Grid>
                    </Grid>
                    {IsLoad == true ? (
                      <Grid container spacing={2} style={{ padding: "15px" }} >
                        <Grid item md={12} xs={12}>
                          <RadioGroup row name="advanceType" value={AdvanceTypeSelection} onChange={handleRadioChange}>
                            <FormControlLabel
                              value={agriGenERPEnum.TransactionType.Advance_Payment}
                              control={<Radio color="primary" />}
                              label="Cash"
                              disabled={!newlyCreated}
                            />
                            <FormControlLabel
                              value={agriGenERPEnum.TransactionType.Advance_Cheque}
                              control={<Radio color="primary" />}
                              label="Cheque"
                              disabled={!newlyCreated}
                            />
                            <FormControlLabel
                              value={agriGenERPEnum.TransactionType.Advance_Payment_Bank}
                              control={<Radio color="primary" />}
                              label="Bank"
                              disabled={!newlyCreated}
                            />
                          </RadioGroup>
                        </Grid>
                      </Grid>

                    ) : null}
                    {inPending ?
                      <AutoGLComponent
                        AutoGLRequestDetailsModel={AutoGLRequestDetailsModel}
                        SetSelectedAccountDetails={setSelectedAccountDetails}
                      /> : null
                    }
                    <Grid container spacing={1} justify="flex-end">
                      <Grid item md={2} xs={12} style={{ marginTop: "1.5rem", marginBottom: '1rem' }}>
                        {!newlyCreated ?
                          <InputLabel shrink id="nic">
                            Requested Amount *
                          </InputLabel> : null}
                      </Grid>

                      <Grid item md={3} xs={12} style={{ marginTop: "1rem", }}>
                        {!newlyCreated ?
                          <Chip
                            label={reqAmount}
                            color="secondary"
                            size="medium"
                            className={classes.chip}
                          /> : null}
                      </Grid>
                    </Grid>
                    {
                      IsLoad == true || approveDetails.length > 0 ? (
                        <Grid container md={12} xs={12} spacing={2}>
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
                                            fullWidth
                                            error={Boolean(touched.previouseMonthAmount && errors.previouseMonthAmount) || (!IsPreviousMonthValid)}
                                            helperText={touched.previouseMonthAmount && errors.previouseMonthAmount || PreviousMonthAmountValidationText}
                                            name="previouseMonthAmount"
                                            variant="outlined"
                                            value={approveList.previouseMonthAmount}
                                            onChange={(e) => {
                                              handleChange(e)
                                              ValidateFields(e)
                                            }}
                                            size="small"
                                            // InputProps={{ readOnly: IsPreviousMonthFieldDisable || previouseAvailableBalance <= 0 }}
                                            onBlur={handleBlur}
                                            // inputProps={{ readOnly: !inPending || IsBalancePaymetDone || previouseAvailableBalance <= 0 }}
                                            inputProps={{
                                              readOnly: (permissionList.isIssueChangeEnabled && isUpdate && !inPending) || IsBalancePaymetDone || (previouseAvailableBalance == 0 && cropDetails.filter(x => x.totalCrop == 0).length == cropDetails.length) ? true : false
                                            }}
                                          />
                                        </Grid>
                                      </>
                                  }
                                  <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                    <InputLabel shrink id="currentMonthAmount">Current Month Amount</InputLabel>
                                  </Grid>
                                  <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                    <TextField
                                      fullWidth
                                      error={Boolean(touched.currentMonthAmount && errors.currentMonthAmount) || (!IsCurrentMonthValid)}
                                      helperText={touched.currentMonthAmount && errors.currentMonthAmount || CurrentMonthAmountValidationText}
                                      name="currentMonthAmount"
                                      variant="outlined"
                                      value={approveList.currentMonthAmount}
                                      onChange={(e) => {
                                        handleChange(e)
                                        ValidateFields(e)
                                      }}
                                      size="small"
                                      inputProps={{ readOnly: permissionList.isIssueChangeEnabled && isUpdate && !inPending }}
                                      onBlur={handleBlur}
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
                                      inputProps={{ readOnly: true }}
                                    />
                                  </Grid>
                                </Grid>
                              </Grid>
                              <Box display="flex" justifyContent="flex-end" p={2}>
                                {(permissionList.isAuthorizeChangeEnabled && !inPending && !isUpdate) || (permissionList.isAuthorizeChangeEnabled && inPending && isUpdate) ?

                                  <Button
                                    color="secondary"
                                    variant="contained"
                                    disabled={isDisableButton}
                                    style={{
                                      marginRight: "1rem",
                                    }}
                                    className={classes.colorReject}
                                    onClick={() => RejectAdvancePayment()}
                                  >
                                    {btnName}
                                  </Button> : null}

                                {(permissionList.isAuthorizeChangeEnabled && !inPending && !isUpdate) || (permissionList.isAuthorizeChangeEnabled && inPending && isUpdate) ?
                                  <Button
                                    color="secondary"
                                    variant="contained"
                                    disabled={isDisableButton || !isValid || !IsAmountFieldsValid}
                                    style={{
                                      marginRight: "1rem",
                                    }}
                                    className={classes.colorAuthorize}
                                    onClick={() => AuthorizeAdvancePayment()}
                                  >
                                    Authorize
                                  </Button> : null}
                                {!IsPrintButtonDisabled ?
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
                                      onAfterPrint={() => AfterPrint()}
                                    />
                                    <div hidden={true}>
                                      <AdvancePaymentReceiptComponent ref={componentRef} data={AdvancePaymentReciptDetails} />
                                    </div>
                                  </div>
                                  :
                                  <>
                                    {permissionList.isIssueChangeEnabled && isUpdate && !inPending ?
                                      <Button
                                        color="primary"
                                        type="submit"
                                        variant="contained"
                                        className={classes.colorApprove}
                                        disabled={!isValid}
                                        onClick={() => IssueAdvancePayment()}
                                      >
                                        Issue
                                      </Button> : null}
                                  </>}
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      ) : null
                    }
                  </Card>
                </Box>
                {dialog ?
                  <AlertDialogWithoutButton confirmData={confirmRequest} cancelData={cancelRequest}
                    headerMessage={"Confirm To Authorize"}
                    discription={"Are you sure to do this?"} />
                  : null
                }
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
};


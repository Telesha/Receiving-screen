import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Button,
  makeStyles,
  Container,
  Divider,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  Switch,
  Typography,
  TableRow,
  Chip,
  Grid,
  TextField,
  MenuItem,
  InputLabel
} from '@material-ui/core';
import { useAlert } from "react-alert";
import { useNavigate, useParams } from 'react-router-dom';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { LoadingComponent } from 'src/utils/newLoader';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { UserStatisticsComponent } from './../../UserStatistics/UserStatisticsExportComponent';
import { Formik } from 'formik';
import * as Yup from "yup";
import tokenService from '../../../utils/tokenDecoder';
import CountUp from 'react-countup';
import moment from 'moment';
import { CustomerPaymentDetailsNewComponent } from './../../Common/CustomerPaymentDetailsNewComponent/CustomerPaymentDetailsNewComponenet';
import { AutoGLComponent } from './../../Common/AutoGLSelectionComponent/AutoGLSelectorComponent';
import { AgriGenERPEnum } from './../../Common/AgriGenERPEnum/AgriGenERPEnum';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  btnReject: {
    backgroundColor: "red",
    marginRight: "1rem",
  },
  btnSendToDel: {
    backgroundColor: "#FF9800",
    marginRight: "1rem",
  },
  btnIssue: {
    backgroundColor: "green",
  },
  btnSearch: {
    marginRight: "1rem",
  }

}));
const screenCode = 'FACTORYITEMISSUE';

export default function FactoryItemDirectIssue() {

  const ApprovalEnum = Object.freeze({ "Pending": 1, "Approve": 2, "Reject": 3, "Delivered": 4 })

  const { factoryItemRequestID } = useParams();
  const agriGenERPEnum = new AgriGenERPEnum();
  const componentRef = useRef();
  const classes = useStyles();
  const alert = useAlert();
  const navigate = useNavigate();
  //Balance Component Required Hooks
  const [cropDetails, setCropDetails] = useState([]);
  const [currentCropDetails, setCurrentCropDetails] = useState([]);
  const [advanceTotal, setAdvanceTotal] = useState(0);
  const [factoryItemTotal, setFactoryItemTotal] = useState(0);
  const [loanTotal, setLoanTotal] = useState(0);
  const [transportTotal, setTransportTotal] = useState(0);
  const [currentTransportTotal, setCurrentTransportTotal] = useState(0);
  const [customerBalancePaymentAmount, setCustomerBalancePaymentAmount] = useState(0);
  const [currentAdvanceTotal, setCurrentAdvanceTotal] = useState(0);
  const [currentFactoryItemTotal, setCurentFactoryItemTotal] = useState(0);
  const [currentLoanTotal, setCurrentLoanTotal] = useState(0);
  const [previouseAvailableBalance, setPreviouseAvailableBalance] = useState(0);
  const [currentAvailableBalance, setCurrentAvailableBalance] = useState(0);
  const [newRates, setNewRates] = useState([]);
  const [IsBalancePaymetDone, setIsBalancePaymetDone] = useState(false);
  const [TotalBalance, setTotalBalance] = useState(0);
  const [RunningBalance, setRunningBalance] = useState(0);
  const [PreviousMonthBalanceBroughtForwardAmount, setPreviousMonthBalanceBroughtForwardAmount] = useState(0);
  const [PreviousMonthBalanceCarriedForwardAmount, setPreviousMonthBalanceCarriedForwardAmount] = useState(0);
  const [BalanceCarriedForwardAmount, setBalanceCarriedForwardAmount] = useState(0)
  const [BalanceBroughtForwardAmount, setBalanceBroughtForwardAmount] = useState(0)
  //Balance Component Required Hooks
  //FactoryItemIssue 
  const [PreviousMonthAllowedAmount, setPreviousMonthAllowedAmount] = useState(0);
  const [CurrentMonthAllowedAmount, setCurrentMonthAllowedAmount] = useState(0);
  const [ApprovedTotalAmount, setApprovedTotalAmount] = useState(0);
  const [factoryItemGrnArray, setFactoryItemGrnArray] = useState([]);
  const [sortArray, setSortArray] = useState();
  const [finalTotal, setFinalTotal] = useState(0);
  const [TotalItemQuantity, setTotalItemQuantity] = useState(0)
  const [FactoryItemList, setFactoryItemList] = useState();
  const [SupplierList, setSupplierList] = useState();
  const [PaymentEfectedDate, setPaymentEfectedDate] = useState(new Date());
  const [FactoryItemGRNList, setFactoryItemGRNList] = useState([])
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [IsUserFieldsDisabled, setIsUserFieldsDisabled] = useState(true);
  const [HideCardsInNewItemPage, setHideCardsInNewItemPage] = useState(true);
  const [IsMobileRequest, setIsMobileRequest] = useState(false);
  const [SubmitButtonStatue, setSubmitButtonStatue] = useState();
  const [userDetails, setUserDetails] = useState({});
  const [isFieldsEnabled, setIsFieldsEnabled] = useState(false);
  const [ItemCategoryList, setItemCategoryList] = useState();
  const [ItemCategoryID, setItemCategoryID] = useState(0);
  const [MinMonth, setMinMonth] = useState(new Date());
  const [finalModel, setFinalModel] = useState([]);
  const [ItemLength, setItemLength] = useState(false);
  const [balancePaymentData, setBalancePaymentData] = useState({
    lastBalancePaymentSchedule: '',
    firstTransactionDate: ''
  });
  const [PrtialyHideUserDetails, setPrtialyHideUserDetails] = useState(false)
  const [permissionList, setPermissions] = useState({
    isFactoryItemChangeEnabled: true,
    isAdvanceRateChangeEnabled: true,
    isMonthlyBalanceChangeEnabled: true,
    isViewTotalAmount: false,
    isViewAvailableAmount: false
  });
  const [approveList, setApproveList] = useState({
    groupID: '0',
    factoryID: '0',
    nic: '',
    regNumber: '',
    previouseMonthAmount: 0,
    currentMonthAmount: 0
  });
  const [UserBasicDetails, setUserBasicDetails] = useState({
    FactoryItemRequestID: 0,
    FactoryID: 0,
    GroupID: 0,
    NIC: null,
    CustomerRegistrationNumber: '',
  });
  const [PreviousGroupFactoryDetails, setPreviousGroupFactoryDetails] = useState({
    FactoryID: 0,
    GroupID: 0,
  })
  const [FactoryItemIssueObject, setFactoryItemIssueObject] = useState({
    factoryItemID: 0,
    supplierID: 0,
    enableInstalments: false,
    noOfInstalments: 0,
    paymentEffectedDate: new Date(),
    factoryItemGRNID: 0,
    factoryItemGRNQuantity: '',
    sellingPrice: 0
  });
  const [FormDetails, setFormDetails] = useState({
    groupID: '0',
    factoryID: '0',
    registrationNumber: ''
  });
  const [AutoGLRequestDetailsModel, setAutoGLRequestDetailsModel] = useState({
    groupID: '0',
    factoryID: '0',
    transactionTypeID: parseInt(agriGenERPEnum.TransactionType.Factory_Item.toString())
  });
  const [SelectedAccountDetails, setSelectedAccountDetails] = useState({
    creditAccountID: 0,
    debitAccountID: 0,
    isGLSetup: false,
    isMonthlyAccountsEnabledCredit: false,
    isMonthlyAccountsEnabledDebit: false
  });
  const [RequestedFactoryItemDetails, setRequestedFactoryItemDetails] = useState({
    itemName: '',
    itemQuantity: ''
  })
  const [IsReceiptClick, setIsReceiptClick] = useState(false)
  const [EffectiveDate, handleEffectiveDate] = useState(new Date());
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    routeName: ""
  });

  const [IsUserDetailsFetched, setIsUserDetailsFetched] = useState(false)
  //FactoryITEm Issue

  //Payment Receipt changes
  const previous = new Date();
  previous.setMonth(previous.getMonth() - 1);
  const current = new Date();
  current.setMonth(current.getMonth());
  const [IsPrintButtonDisabled, setIsPrintButtonDisabled] = useState(true);
  const [FactoryItemPaymentReciptDetails, setFactoryItemPaymentReciptDetails] = useState({
    receiptDate: new Date().toISOString().split('T', 1),
    factoryName: '',
    payeeName: '',
    payeeAddress: '',
    payeeAddressTwo: '',
    payeeAddressThree: '',
    itemName: '',
    itemQuantity: 0,
    itemAmount: 0,
    itemTotalAmount: 0,
    applicableMonth: '',
    noOfInstalments: 0
  })
  //Payment Receipt changes

  const handleClick = () => { navigate('/app/factoryItemApproval/listing'); };
  const handleItemCategoryChange = (event) => {
    setItemCategoryID(event.target.value);
    setFactoryItemIssueObject({
      ...FactoryItemIssueObject, factoryItemID: 0, supplierID: 0, factoryItemGRNID: 0, factoryItemGRNQuantity: 0});
  };
  
  const [previousMonthLoanInterestDebit, setPreviousMonthLoanInterestDebit] = useState(0);
  const [previousMonthLoanPrincipalDebit, setPreviousMonthLoanPrincipalDebit] = useState(0);
  const [monthLoanInterestDebit, setMonthLoanInterestDebit] = useState(0);
  const [monthLoanPrincipalDebit, setMonthLoanPrincipalDebit] = useState(0);
  const [monthLoanArrearsFine, setMonthLoanArrearsFine] = useState(0);
  const [monthLoanArrearsInterest, setMonthLoanArrearsInterest] = useState(0);
  const [previouseMonthLoanArrearsFine, setPreviouseMonthLoanArrearsFine] = useState(0);
  const [previouseMonthLoanArrearsInterest, setPreviouseMonthLoanArrearsInterest] = useState(0);
  const [PreviousMonthDeductionDetailsList, setPreviousMonthDeductionDetailsList] = useState([])
  const [CurrentMonthDeductionDetailsList, setCurrentMonthDeductionDetailsList] = useState([]);
  const [IsActionFieldsDisable, setIsActionFieldsDisable] = useState(false)
  const [NewFactoryItemList, setNewFActoryItemList] = useState([]);
  const [itemsupplirs, setItemsupplirs] = useState([]);

  useEffect(() => {
    let decryptedFactoryItemRequestID = atob(factoryItemRequestID.toString());
    trackPromise(InitialGroupFactoryLoad());
    trackPromise(getPermission());
    trackPromise(getAllActiveItemCategory());
    if (parseInt(decryptedFactoryItemRequestID) === 0) {
      setIsUserFieldsDisabled(false);
      setIsMobileRequest(false);
    } else {
      setIsMobileRequest(true);
      setHideCardsInNewItemPage(false)
    }

  }, []);

  useEffect(() => {
    CalculateCurrentMonthAvailableBalance();
    CalculatePreviousMonthAvailableBalance();
  }, [currentCropDetails]);

  useEffect(() => {
    CalculatePreviousMonthAvailableBalance();
  }, [cropDetails]);

  useEffect(() => {
    CalculatePreviousMonthAvailableBalance();
    CalculateCurrentMonthAvailableBalance();
  }, [newRates]);

  useEffect(() => {
    calculateTotalBalance();
  }, [previouseAvailableBalance,
    currentAvailableBalance,
    currentAdvanceTotal,
    currentFactoryItemTotal,
    currentLoanTotal]
  );

  useEffect(() => {
    createMonthAmount()
  }, [TotalBalance]);

  useEffect(() => {
    trackPromise(GetIsBalancePaymetStatusChek());
  }, [FormDetails.groupID, FormDetails.factoryID]);

  useEffect(() => {
    calculateApprovedTotalAmount();
  }, [PreviousMonthAllowedAmount, CurrentMonthAllowedAmount]);

  useEffect(() => {
    sortFactoryItemGRNObject();
  }, [FactoryItemIssueObject.factoryItemGRNID]);

  useEffect(() => {
    GetAllFactoryByGroupID(FormDetails.groupID);
  }, [FormDetails.groupID]);

  useEffect(() => {
    if (FactoryItemIssueObject.supplierID > 0 && FactoryItemIssueObject.factoryItemID > 0) {
      GetFactoryItemGRNListByFactoryIDAndSupplierID(FactoryItemIssueObject.factoryItemID, FactoryItemIssueObject.supplierID)
    }
  }, [FactoryItemIssueObject.supplierID, FactoryItemIssueObject.factoryItemID])

  useEffect(() => {
    getFactorySupplierList(FactoryItemIssueObject.factoryItemID)
  }, [FactoryItemIssueObject.factoryItemID])

  useEffect(() => {
    if (IsMobileRequest === false) {
      GetAllFactoryByItemCategoryID();
    }
  }, [ItemCategoryID])

  useEffect(() => {
    calculateTotalBalance(); CalculateCurrentMonthAvailableBalance(); CalculatePreviousMonthAvailableBalance();
  }, [monthLoanInterestDebit]);

  useEffect(() => {
    calculateTotalBalance(); CalculateCurrentMonthAvailableBalance(); CalculatePreviousMonthAvailableBalance();
  }, [monthLoanPrincipalDebit]);

  useEffect(() => {
    calculateTotalBalance(); CalculateCurrentMonthAvailableBalance(); CalculatePreviousMonthAvailableBalance();
  }, [monthLoanArrearsFine]);

  useEffect(() => {
    calculateTotalBalance(); CalculateCurrentMonthAvailableBalance(); CalculatePreviousMonthAvailableBalance();
  }, [monthLoanArrearsInterest]);

  useEffect(() => {
    calculateTotalBalance(); CalculateCurrentMonthAvailableBalance(); CalculatePreviousMonthAvailableBalance();
  }, [previousMonthLoanInterestDebit, previousMonthLoanPrincipalDebit, previouseMonthLoanArrearsFine, previouseMonthLoanArrearsInterest]);

  useEffect(() => {
    calculateTotalBalance(); CalculateCurrentMonthAvailableBalance(); CalculatePreviousMonthAvailableBalance();
  }, [BalanceCarriedForwardAmount]);

  useEffect(() => {
    calculateTotalBalance(); CalculateCurrentMonthAvailableBalance(); CalculatePreviousMonthAvailableBalance();
  }, [PreviousMonthBalanceBroughtForwardAmount]);

  useEffect(() => {
    calculateTotalBalance(); CalculateCurrentMonthAvailableBalance(); CalculatePreviousMonthAvailableBalance();
  }, [CurrentMonthTotalExpensesAmount, PreviousMonthTotalExpensesAmount])

  useEffect(() => {
    if (FactoryItemIssueObject.enableInstalments === false) {
      setFactoryItemIssueObject({
        ...FactoryItemIssueObject,
        noOfInstalments: 0
      })
    }
  }, [FactoryItemIssueObject.enableInstalments])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORYITEMISSUE');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isFactoryItemChangeEnabled = permissions.find(p => p.permissionCode === 'FACTORYITEMPERMISSION');
    var isAdvanceRateChangeEnabled = permissions.find(p => p.permissionCode == "ADVANCERATECHANGEPERMISSION");
    var isMonthlyBalanceChangeEnabled = permissions.find(p => p.permissionCode == "MONTHLYBALANCECHANGINGPERMISSION");
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isViewTotalAmount = permissions.find(p => p.permissionCode == "VIEWTOTALAMOUNT");
    var isViewAvailableAmount = permissions.find(p => p.permissionCode == "VIEWAVAILABLEAMOUNT");

    setPermissions({
      ...permissionList,
      isFactoryItemChangeEnabled: isFactoryItemChangeEnabled !== undefined,
      isAdvanceRateChangeEnabled: isAdvanceRateChangeEnabled !== undefined,
      isMonthlyBalanceChangeEnabled: isMonthlyBalanceChangeEnabled !== undefined,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isViewTotalAmount: isViewTotalAmount !== undefined,
      isViewAvailableAmount: isViewAvailableAmount !== undefined
    });

    setFormDetails({
      ...FormDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getAllActiveItemCategory() {
    const result = await services.getAllActiveItemCategory();
    setItemCategoryList(result);
  }

  async function InitialGroupFactoryLoad() {
    trackPromise(GetAllGroups());
    trackPromise(GetAllFactoryByGroupID(FormDetails.groupID));
  }

  async function GetIsBalancePaymetStatusChek() {
    const result = await services.getCurrentBalancePaymnetDetail(FormDetails.groupID, FormDetails.factoryID);
    setBalancePaymentData(result);
    setMinMonth(checkIsMonthValid());
  }

  function checkIsMonthValid() {
    var convertedDate = new Date();
    let tempMonth;

    if (balancePaymentData.lastBalancePaymentSchedule !== null) {
      tempMonth = balancePaymentData.lastBalancePaymentSchedule.split('/');
      convertedDate.setMonth(tempMonth[1])
      convertedDate.setFullYear(tempMonth[0])
      return moment(convertedDate).format();
    }
    else {
      var prevMonth = convertedDate.setMonth(convertedDate.getMonth() - 1)
      return moment(prevMonth).format();
    }
  }

  async function GetAllGroups() {
    const response = await services.getGroupsForDropdown();
    setGroupList(response);
  }

  async function GetAllFactoryByGroupID(groupID) {
    const response = await services.getFactoryByGroupID(groupID);
    setFactoryList(response);
  }

  async function GetAllFactoryByItemCategoryID() {
    const response = await services.getfactoryItemsByItemCategoryID(ItemCategoryID, FormDetails.groupID, FormDetails.factoryID);
    setFactoryItemList(response);
  }

  async function calculateTotalPrice() {
    var total = 0;
    var totalItemQuantity = 0
    factoryItemGrnArray.forEach(element => {
      total += element.price;
      totalItemQuantity += element.itemQuantity
    });
    setFinalTotal(total);
    setTotalItemQuantity(totalItemQuantity);
  }

  async function DeleteItem(index, data) {

    await RemoveItemsFromFactoryItemList(data)
    if (factoryItemGrnArray[index].grnNumber != undefined) {
      setFactoryItemGrnArray(current => current.filter((img, i) => i != index));
      factoryItemGrnArray.splice(index, 1);
      calculateTotalPrice();
      resetGRNarray(data);
    }

  };

  async function RemoveItemsFromFactoryItemList(data) {
    const factoryItemIndex = NewFactoryItemList.findIndex((element) => element.factoryItemID === data.itemID);
    const grnList = NewFactoryItemList[factoryItemIndex].factoryItemDetailsList
    const grnItemIndex = grnList.findIndex((element) => (element.factoryItemGRNID === data.factoryItemGRNID && element.supplierID === data.supplierID));
    NewFactoryItemList[factoryItemIndex].factoryItemDetailsList.splice(grnItemIndex, 1)
    if (NewFactoryItemList[factoryItemIndex].factoryItemDetailsList.length === 0) {
      NewFactoryItemList.splice(factoryItemIndex, 1)
    }
  }

  async function resetGRNarray(data) {
    if (data != null) {
      var reset = data.factoryItemGRNID;
      var copyOfFactoryItemGRNList = FactoryItemGRNList;
      copyOfFactoryItemGRNList.map((rowData, index) => {
        if (rowData.factoryItemGRNID == data.factoryItemGRNID) {
          rowData.availableQuantity = rowData.availableQuantity + parseFloat(data.itemQuantity)
        }
      });
      setFactoryItemGRNList(copyOfFactoryItemGRNList);
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

  //Balance Component Required functions
  async function CalculateCurrentMonthAvailableBalance() {
    var total = 0;
    for (var i = 0; i < currentCropDetails.length; i++) {
      total = total + parseFloat(currentCropDetails[i].totalCrop) * parseFloat(currentCropDetails[i].minRate);
    }
    var currentBalance = total - (await CurrentMonthTotalExpensesAmount() + BalanceCarriedForwardAmount);
    isNaN(currentBalance) ? setCurrentAvailableBalance(0) : setCurrentAvailableBalance(currentBalance);
  };

  async function CalculatePreviousMonthAvailableBalance() {
    var total = 0;
    for (var i = 0; i < cropDetails.length; i++) {
      if (IsBalancePaymetDone) {
        total = total + parseFloat(cropDetails[i].totalCrop) * parseFloat(cropDetails[i].rate);
      } else {
        total = total + parseFloat(cropDetails[i].totalCrop) * parseFloat(cropDetails[i].minRate);
      }
    }

    total += PreviousMonthBalanceBroughtForwardAmount

    var previouseBalance = customerBalancePaymentAmount == -1 ? total - (await PreviousMonthTotalExpensesAmount() + PreviousMonthBalanceCarriedForwardAmount) : 0;
    isNaN(previouseBalance) || previouseBalance == 0 ? setPreviouseAvailableBalance(0) : setPreviouseAvailableBalance(previouseBalance);
  };

  async function calculateTotalBalance() {
    const total = currentAvailableBalance + previouseAvailableBalance;
    isNaN(total) ? setTotalBalance(0) : setTotalBalance(total);
  }

  async function createMonthAmount() {
    setApproveList({ ...approveList, currentMonthAmount: currentAvailableBalance, previouseMonthAmount: previouseAvailableBalance });
  }

  async function searchCustomerBalanceDetails(model) {
    trackPromise(GetIsBalancePaymetStatusChek())
    //Common Min And Max Rates
    const newRate = await services.getCurrentMinMaxRateByApplicableMonthAndYear(model.factoryID);
    setNewRates(newRate);

    //For Previous Month
    const previousDetails = await services.getCustomerPreviousMonthPaymentFullDetails(model);
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
    const currentDetails = await services.getCustomerCurrentMonthPaymentFullDetails(model);
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

    const response = await services.GetCustomerAccountBalanceByIDs(model.factoryID, model.groupID, model.registrationNumber);

    setAutoGLRequestDetailsModel({
      ...AutoGLRequestDetailsModel,
      groupID: model.groupID,
      factoryID: model.factoryID
    })

  }
  //Balance Component Required functions

  const SendToDeliveryBtnStaus = () => {
    setSubmitButtonStatue(true)
  }

  const IssueBtnStaus = () => {
    setSubmitButtonStatue(false)
  }

  function SetFactoryItemReceipt(dataList) {
    setFactoryItemPaymentReciptDetails([{
      ...FactoryItemPaymentReciptDetails,
      receiptDate: new Date().toISOString().split('T', 1),
      factoryName: '',
      payeeName: '',
      payeeAddress: '',
      payeeAddressTwo: '',
      payeeAddressThree: '',
      itemName: '',
      itemQuantity: 0,
      itemAmount: 0,
      itemTotalAmount: 0,
      applicableMonth: '',
      noOfInstalments: 0
    }])

    let resultArray = [];

    for (const data of dataList) {
      resultArray.push({
        receiptDate: new Date().toISOString().split('T', 1),
        factoryName: data.factoryName,
        payeeName: data.customerName,
        payeeAddress: data.address,
        payeeAddressTwo: data.addressTwo,
        payeeAddressThree: data.addressThree,
        itemName: data.itemName,
        itemQuantity: data.approvedQuantity.toFixed(1),
        itemAmount: data.totalPrice,
        itemTotalAmount: data.totalPrice,
        applicableMonth: data.paymentEffectedMonth,
        noOfInstalments: data.noOfInstallments
      })
    };

    setFactoryItemPaymentReciptDetails(resultArray);
    setIsPrintButtonDisabled(false);
  }

  async function submitFactoryItemFrom(values) {

    if (FactoryItemIssueObject.enableInstalments === true && parseInt(FactoryItemIssueObject.noOfInstalments.toString()) < 1) {
      alert.error("Please add more than one installment");
      return;
    }
    if (FormDetails.registrationNumber === '' || FormDetails.registrationNumber === "") {
      alert.error("Please Select the user");
      return;
    }

    if (EffectiveDate === null || EffectiveDate === "") {
      alert.error("Issuing Date is mandatory");
      return;
    }

    if (IsUserDetailsFetched === false) {
      alert.error("Please search user details");
      return;
    }

    if (IsReceiptClick === false) {
      //Validation Insufficent Balanece code segemet removed from here to avoid a blocker '2021-06-26'
      let decryptedFactoryItemRequestID = atob(factoryItemRequestID.toString());
      if (factoryItemGrnArray.length > 0) {
        if (FactoryItemIssueObject.enableInstalments === true && parseInt(FactoryItemIssueObject.noOfInstalments) === 1) {
          alert.error("Please add more than one installment");
        }
        else {
          setIsActionFieldsDisable(true);

          let approveModel = {
            factoryItemID: FactoryItemIssueObject.factoryItemID,
            factoryItemRequestID: 0,
            customerID: userDetails.customerID,
            noOfInstalments: parseInt(FactoryItemIssueObject.noOfInstalments),
            paymentEffectiveDate: PaymentEfectedDate.toISOString(),
            isMobileRequest: IsMobileRequest,
            requestedItemTotalQuantity: TotalItemQuantity,
            createdBy: tokenService.getUserIDFromToken(),
            factoryItemGRNList: factoryItemGrnArray,
            requestedItemTotalPrice: finalTotal,
            customerRegistrationNumber: FormDetails.registrationNumber,
            creatededDate: new Date().toISOString(),
            groupID: parseInt(FormDetails.groupID),
            factoryID: parseInt(FormDetails.factoryID),
            factoryItemDetailsList: NewFactoryItemList,
            ledgerSelectedDetails: SelectedAccountDetails,
            isCurrentMonth: true,
            selectedeffectiveDate: EffectiveDate.toISOString(),
            supplierID: FactoryItemIssueObject.supplierID,
          }

          if (SubmitButtonStatue === true) {
            if (SelectedAccountDetails.isGLSetup === true && SelectedAccountDetails.isMonthlyAccountsEnabledCredit === false && SelectedAccountDetails.creditAccountID === 0 || SelectedAccountDetails.creditAccountID === '0') {
              alert.error('Credit Account Selection Is Required');
              setIsActionFieldsDisable(false);
              return;
            }
            else if (SelectedAccountDetails.isGLSetup === true && SelectedAccountDetails.isMonthlyAccountsEnabledDebit === false && SelectedAccountDetails.debitAccountID === 0 || SelectedAccountDetails.debitAccountID === '0') {
              alert.error('Debit Account Selection Is Required');
              setIsActionFieldsDisable(false);
              return;
            }
            approveModel.statusTypeID = 4;
            try {
              const response = await services.FactoryItemRequestApproval(approveModel);
              if (response.statusCode == "Success") {
                alert.success("Factory Item Request send to delivery Successfully");
                setFactoryItemGrnArray([]);
                setIsActionFieldsDisable(false);
                setFormDetails({
                  ...FormDetails,
                  registrationNumber: ''
                });
                setFinalTotal(0);
                setTotalItemQuantity(0);
                setFactoryItemIssueObject({
                  ...FactoryItemIssueObject,
                  factoryItemGRNQuantity: 0,
                });
                setRequestedFactoryItemDetails({
                  ...RequestedFactoryItemDetails,
                  itemName: '',
                  itemQuantity: ''
                })
                setNewFActoryItemList([])
                //clearData();
                setPrtialyHideUserDetails(true)
                if (parseInt(decryptedFactoryItemRequestID) !== 0) {
                  navigate('/app/factoryItemApproval/listing/');
                }
                RefreshClearData();
              }
              else {
                alert.error("Error Occured in Factory  Item Request send to delivery"); 
                setIsActionFieldsDisable(false);
              }
            } catch (error) {
              setIsActionFieldsDisable(false);
            }
            setIsUserDetailsFetched(false);
          } else {
            if (SelectedAccountDetails.isGLSetup === true && SelectedAccountDetails.isMonthlyAccountsEnabledCredit === false && SelectedAccountDetails.creditAccountID === 0 || SelectedAccountDetails.creditAccountID === '0') {
              alert.error('Credit Account Selection Is Required');
              setIsActionFieldsDisable(false);
              return;
            }
            else if (SelectedAccountDetails.isGLSetup === true && SelectedAccountDetails.isMonthlyAccountsEnabledDebit === false && SelectedAccountDetails.debitAccountID === 0 || SelectedAccountDetails.debitAccountID === '0') {
              alert.error('Debit Account Selection Is Required');
              setIsActionFieldsDisable(false);
              return;
            }
            approveModel.statusTypeID = 2;

            try {

              const response = await services.FactoryItemRequestApproval(approveModel);
              if (response.statusCode == "Success") {
                SetFactoryItemReceipt(response.data)
                alert.success("Factory Item Request Issued Successfully");
                setFactoryItemGrnArray([]);
                setIsActionFieldsDisable(false);
                setFormDetails({
                  ...FormDetails,
                  registrationNumber: ''
                });
                setFinalTotal(0);
                setTotalItemQuantity(0);
                setFactoryItemIssueObject({
                  ...FactoryItemIssueObject,
                  factoryItemGRNQuantity: 0
                });
                setRequestedFactoryItemDetails({
                  ...RequestedFactoryItemDetails,
                  itemName: '',
                  itemQuantity: ''
                })
                setNewFActoryItemList([])
                if (parseInt(decryptedFactoryItemRequestID) !== 0) {
                  navigate('/app/factoryItemApproval/listing/');
                }
                setPrtialyHideUserDetails(true)
                RefreshClearData();
              }
              else {
                setIsPrintButtonDisabled(true);
                alert.error("Error Occured in Factory Item Request Issue");
                setIsActionFieldsDisable(false);
              }

            } catch (error) {
              setIsActionFieldsDisable(false);
            }
            setIsUserDetailsFetched(false);
          }
        }
      } else {
        alert.error("Please add atleast one item");
        setIsActionFieldsDisable(false);
      }

      setFinalModel([]);
    }
  }

  function RefreshClearData() {
    setNewRates([]);
    setIsPrintButtonDisabled(true);
    setIsReceiptClick(false);
    setTransportTotal(0);
    setCustomerBalancePaymentAmount(0);
    setLoanTotal(0);
    setFactoryItemTotal(0);
    setAdvanceTotal(0);
    setCropDetails([]);
    setIsBalancePaymetDone(false);
    setCurrentTransportTotal(0);
    setCurrentLoanTotal(0);
    setCurentFactoryItemTotal(0);
    setCurrentAdvanceTotal(0);
    setCurrentCropDetails([]);
    setRunningBalance(0);
    setItemCategoryID(0)
    setHideCardsInNewItemPage(true);
    setFactoryItemGrnArray([]);
    setFinalTotal(0);
    setTotalItemQuantity(0);
    restrictOnlyOneItemInDirectIssue();
    setNewFActoryItemList([])
    setFactoryItemGRNList([])
    setFactoryItemIssueObject({
      ...FactoryItemIssueObject,
      factoryItemID: 0,
      supplierID: 0,
      enableInstalments: false,
      noOfInstalments: 0,
      paymentEffectedDate: new Date(),
      factoryItemGRNID: 0,
      factoryItemGRNQuantity: ''
    });

    setFactoryItemPaymentReciptDetails({
      ...FactoryItemPaymentReciptDetails,
      receiptDate: new Date().toISOString().split('T', 1),
      factoryName: '',
      payeeName: '',
      payeeAddress: '',
      payeeAddressTwo: '',
      payeeAddressThree: '',
      itemName: '',
      itemQuantity: 0,
      itemAmount: 0,
      itemTotalAmount: 0,
      applicableMonth: '',
      noOfInstalments: 0
    })
  }

  function clearData() {
    setNewRates([]);
    setIsPrintButtonDisabled(true);
    setIsReceiptClick(false);
    setTransportTotal(0);
    setCustomerBalancePaymentAmount(0);
    setLoanTotal(0);
    setFactoryItemTotal(0);
    setAdvanceTotal(0);
    setCropDetails([]);
    setIsBalancePaymetDone(false);
    setCurrentTransportTotal(0);
    setCurrentLoanTotal(0);
    setCurentFactoryItemTotal(0);
    setCurrentAdvanceTotal(0);
    setCurrentCropDetails([]);
    setRunningBalance(0);
    setItemCategoryID(0)
    setHideCardsInNewItemPage(true);
    setFactoryItemGrnArray([]);
    setFinalTotal(0);
    setTotalItemQuantity(0);
    restrictOnlyOneItemInDirectIssue();
    setNewFActoryItemList([])

    setUserBasicDetails({
      ...UserBasicDetails,
      FactoryItemRequestID: 0,
      FactoryID: 0,
      GroupID: 0,
      NIC: null,
      CustomerRegistrationNumber: ''
    });

    setFactoryItemIssueObject({
      ...FactoryItemIssueObject,
      factoryItemID: 0,
      supplierID: 0,
      enableInstalments: false,
      noOfInstalments: 0,
      paymentEffectedDate: new Date(),
      factoryItemGRNID: 0,
      factoryItemGRNQuantity: ''
    });

    setFormDetails({
      ...FormDetails,
      registrationNumber: ''
    })

    setFactoryItemPaymentReciptDetails({
      ...FactoryItemPaymentReciptDetails,
      receiptDate: new Date().toISOString().split('T', 1),
      factoryName: '',
      payeeName: '',
      payeeAddress: '',
      payeeAddressTwo: '',
      payeeAddressThree: '',
      itemName: '',
      itemQuantity: 0,
      itemAmount: 0,
      itemTotalAmount: 0,
      applicableMonth: '',
      noOfInstalments: 0
    })

    setCustomerDetails({
      customerName: "",
      routeName: ""
    })
  }

  function calculateApprovedTotalAmount() {
    let totalAmount = parseFloat(CurrentMonthAllowedAmount) + parseFloat(PreviousMonthAllowedAmount);
    isNaN(totalAmount) || totalAmount == 0 ? setApprovedTotalAmount(0) : setApprovedTotalAmount(totalAmount);
  }

  async function searchUserBasicDetails() {

    if (EffectiveDate === null || EffectiveDate === "") {
      alert.error("Issuing Date is mandatory");
      return;
    }

    setFactoryItemPaymentReciptDetails({
      ...FactoryItemPaymentReciptDetails,
      receiptDate: new Date().toISOString().split('T', 1),
      factoryName: '',
      payeeName: '',
      payeeAddress: '',
      payeeAddressTwo: '',
      payeeAddressThree: '',
      itemName: '',
      itemQuantity: 0,
      itemAmount: 0,
      itemTotalAmount: 0,
      applicableMonth: '',
      noOfInstalments: 0
    })

    // setIsPrintButtonDisabled(true);

    //  var validate = /^[1-9]\d*$/;
    // if (!validate.test(FormDetails.registrationNumber)) {
    //   setHideCardsInNewItemPage(true)
    //   return;
    // }

    if (parseInt(FormDetails.groupID.toString()) !== parseInt(PreviousGroupFactoryDetails.GroupID.toString()) || parseInt(FormDetails.factoryID.toString()) !== parseInt(PreviousGroupFactoryDetails.FactoryID.toString())) {
      RefreshClearData();
    }

    if (FormDetails.registrationNumber !== null && FormDetails.registrationNumber.length !== 0 &&
      FormDetails.groupID !== 0 && FormDetails.factoryID !== 0) {
      let model = {
        regNumber: FormDetails.registrationNumber,
        groupID: parseInt(FormDetails.groupID),
        factoryID: parseInt(FormDetails.factoryID),
        nic: null
      }
      trackPromise(searchCustomerBalanceDetails(model));
      trackPromise(GetCustomerAccountDetails(model.factoryID, model.groupID, model.regNumber))
      setUserBasicDetails({
        FactoryID: parseInt(FormDetails.factoryID),
        GroupID: parseInt(FormDetails.groupID),
        CustomerRegistrationNumber: FormDetails.registrationNumber,
        NIC: null
      });
      setPreviousGroupFactoryDetails({
        ...PreviousGroupFactoryDetails,
        GroupID: parseInt(FormDetails.groupID),
        FactoryID: parseInt(FormDetails.factoryID)
      })
      setIsUserDetailsFetched(true);
      setPrtialyHideUserDetails(false);
    } else {
      alert.error("Mandatory fields are required")
    }

    RefreshClearData();
  }

  async function checkCustomerIsActive() {
    const response = await services.CheckCustomerISActive(FormDetails.registrationNumber, FormDetails.factoryID);
    return response;
  }

  async function GetCustomerAccountDetails(factoryID, groupID, registrationNumber) {

    const response = await services.GetCustomerAccountBalanceByIDs(factoryID, groupID, registrationNumber);
    let customerAccountBalance;
    var validate = /^[1-9]\d*$/;
    if (response === null) {
      setHideCardsInNewItemPage(true)
      alert.error("INVALID CUSTOMER REGISTRATION NUMBER");
    }
    // else if (!validate.test(FormDetails.registrationNumber)) {
    //   setHideCardsInNewItemPage(true)
    //   return;
    // } 
    else {
      var active = await checkCustomerIsActive();

      if (active) {

        customerAccountBalance = await services.getCustomerAccountBalance(response.customerID, response.customerAccountID);
        setHideCardsInNewItemPage(false)
        setIsActionFieldsDisable(false);
        getCustomerDetailsNameAndRouteName(FormDetails.groupID, FormDetails.factoryID, FormDetails.registrationNumber);

      }
      else {
        setHideCardsInNewItemPage(true)
        setIsActionFieldsDisable(true);
        alert.error('Customer is InActive');
      }
    }
    setUserDetails(response);
    setRunningBalance(response === null ? 0 : customerAccountBalance.balance);
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        {
          IsUserFieldsDisabled === true ?
            <Grid item md={2} xs={12}>
              <PageHeader
                onClick={handleClick}
              />
            </Grid> : null
        }
      </Grid>
    )
  }

  async function getFactorySupplierList(factoryItemID) {
    var supplierList = await services.GetSupplierDetailsByFactoryItemID(factoryItemID);
    setSupplierList(supplierList);
  }

  function generateDropDownItemListDropDown(data) {
    let items = [];
    if (data != null || data != undefined) {
      data.map((item) => {
        items.push(
          <MenuItem key={item.id} value={item.id}>
            {item.name}
          </MenuItem >
        );
      });
    }
    return items;
  }

  function generateFactoryItemDRNDropDownItelList(data) {
    let items = [];
    if (data != null || data != undefined) {
      data.map((item, index) => {
        items.push(
          <MenuItem key={index} value={item.factoryItemGRNID}>
            <Chip size='small' label={"Date : " + new Date(item.createdDate).toLocaleDateString()} />
            <Chip size='small' label={" Supplier Name : " + item.supplierName} />
            <Chip size='small' label={" Unit Price Rs : " + item.unitPrice} />
            <Chip size='small' label={" Available Quantity : " + item.availableQuantity} />
          </MenuItem >
        );
      });
    }
    return items;
  }

  async function GetFactoryItemGRNListByFactoryIDAndSupplierID(factoryItemID, supplierID) {
    const response = await services.GetFactoryItemGRNListByFactoryItemIDAndSupplierID(factoryItemID, supplierID);
    setFactoryItemGRNList(response);
  }

  function handleChangeFactoryItemIssue(e) {
    const target = e.target;
    const value = target.name === 'enableInstalments' ? target.checked : target.value
    if (target.name === 'factoryItemGRNQuantity' && (value * 10) % 1 !== 0) {
      alert.error("Allow only one decimal point");
      return;
    }
    setFactoryItemIssueObject({
      ...FactoryItemIssueObject,
      [e.target.name]: value
    });
  }

  function handleChangeFormDetails(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      [e.target.name]: value
    });
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

  async function sortFactoryItemGRNObject() {
    var filteredObject = FactoryItemGRNList.find(x => x.factoryItemGRNID == FactoryItemIssueObject.factoryItemGRNID);
    setSortArray(filteredObject);
    setFactoryItemIssueObject({
      ...FactoryItemIssueObject,
      sellingPrice: filteredObject == undefined ? 0 : filteredObject.unitPrice
    });
  }

  async function AddItems(values) {
    if (FactoryItemIssueObject.supplierID > 0 && FactoryItemIssueObject.factoryItemID > 0) {
      setItemLength(true);
    }
    if (FactoryItemIssueObject.factoryItemGRNID > 0 && FactoryItemIssueObject.factoryItemGRNQuantity > 0 && FactoryItemIssueObject.supplierID > 0 && FactoryItemIssueObject.factoryItemID > 0) {

      var totalQuantity = TotalItemQuantity + parseFloat(FactoryItemIssueObject.factoryItemGRNQuantity);

      var factoryGrnRemainQty = FactoryItemGRNList.find(x => x.factoryItemGRNID === values.factoryItemGRNID)

      if (factoryGrnRemainQty === undefined || factoryGrnRemainQty === null) {
        alert.error("Mandatory fields are required");
        return;
      }

      if (parseFloat(factoryGrnRemainQty.availableQuantity) < parseFloat(values.factoryItemGRNQuantity)) {
        alert.error("Grn Quantity exceed");
      } else if (totalQuantity > RequestedFactoryItemDetails.itemQuantity && IsMobileRequest === true) {
        alert.error("Quantity exceed");
      } else {

        var supDetail = SupplierList.find(x => x.id === sortArray.supplierID);

        let model = {
          grnNumber: sortArray.factoryItemGRNNumber,
          itemQuantity: parseFloat(FactoryItemIssueObject.factoryItemGRNQuantity),
          price: parseFloat(FactoryItemIssueObject.factoryItemGRNQuantity * FactoryItemIssueObject.sellingPrice),
          factoryItemGRNID: sortArray.factoryItemGRNID,
          supplierID: sortArray.supplierID,
          supplierName: supDetail.name,
          itemID: values.factoryItemID
        };

        let grnDetailsModel = {
          factoryItemGRNID: values.factoryItemGRNID,
          supplierID: values.supplierID,
          GRNQuantity: parseFloat(values.factoryItemGRNQuantity),
        }

        let factoryItemModel = {
          factoryItemID: values.factoryItemID,
          factoryItemDetailsList: [grnDetailsModel],
          factoryItemTotalPrice: parseFloat(FactoryItemIssueObject.factoryItemGRNQuantity * FactoryItemIssueObject.sellingPrice)
        }

        await InsertFactoryItemsDetials(factoryItemModel)
        const index = factoryItemGrnArray.findIndex((element) => element.factoryItemGRNID === model.factoryItemGRNID);

        if (index >= 0) {
          factoryItemGrnArray[index]["price"] += model.price;
          factoryItemGrnArray[index]["itemQuantity"] += model.itemQuantity;
        } else {
          factoryItemGrnArray.push(model)
        }
        setItemCategoryID(0);
        setFactoryItemIssueObject({ ...FactoryItemIssueObject, factoryItemID: 0, supplierID: 0, factoryItemGRNID: 0, factoryItemGRNQuantity: 0 });
        var copyOfFactoryItemGRNList = FactoryItemGRNList;
        var res = copyOfFactoryItemGRNList.find(x => x.factoryItemGRNID === values.factoryItemGRNID);

        res.availableQuantity = parseFloat(res.availableQuantity) - parseFloat(values.factoryItemGRNQuantity);
        setFactoryItemGRNList(copyOfFactoryItemGRNList);
      }
    } else {
      alert.error("Mandatory fields are required");
    }
    calculateTotalPrice();
  }

  async function InsertFactoryItemsDetials(factoryItem) {
    const factoryItemIndex = NewFactoryItemList.findIndex((element) => element.factoryItemID === factoryItem.factoryItemID);

    if (factoryItemIndex < 0) {
      NewFactoryItemList.push(factoryItem);
    } else {
      NewFactoryItemList[factoryItemIndex]["factoryItemTotalPrice"] += factoryItem.factoryItemTotalPrice

      let temp = NewFactoryItemList[factoryItemIndex];
      let factoryItemDetailsIndex = temp.factoryItemDetailsList.findIndex((element) =>
        (element.factoryItemGRNID === factoryItem.factoryItemDetailsList[0].factoryItemGRNID && element.supplierID === factoryItem.factoryItemDetailsList[0].supplierID)
      )

      if (factoryItemDetailsIndex < 0) {
        NewFactoryItemList[factoryItemIndex].factoryItemDetailsList.push(factoryItem.factoryItemDetailsList[0])
      } else {
        NewFactoryItemList[factoryItemIndex].factoryItemDetailsList[factoryItemDetailsIndex]["GRNQuantity"] += factoryItem.factoryItemDetailsList[0].GRNQuantity
      }
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

  function restrictOnlyOneItemInDirectIssue() {
    if (IsMobileRequest === true) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={"Item Issue"}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: FormDetails.groupID,
              factoryID: FormDetails.factoryID,
              registrationNumber: FormDetails.registrationNumber,
              effectiveDate: EffectiveDate,
            }}
            validationSchema={
              Yup.object().shape({
              //  registrationNumber: Yup.string().required('registration number is required').typeError('Enter valid registration number').matches(/^[0-9]{0,15}$/, 'Please enter valid registration number'),
              registrationNumber: Yup.string().required('Registration number is required').matches(/^(?! )[a-zA-Z0-9]{0,15}$/, 'Please enter valid registration number'),
                effectiveDate: Yup.string().required('Issuing Date required')
              })
            }
            enableReinitialize
          >
            {({
              handleSubmit,
              errors,
              handleBlur,
              touched,
            }) => (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item md={12} xs={12}>
                    <Card>
                      <CardHeader
                        title={cardTitle("Item Issue")}
                      />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              size='small'
                              fullWidth
                              name="groupID"
                              value={FormDetails.groupID}
                              variant="outlined"
                              disabled={IsUserFieldsDisabled}
                              onChange={(e) => {
                                handleChangeFormDetails(e)
                              }}
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              size='small'
                              fullWidth
                              name="factoryID"
                              value={FormDetails.factoryID}
                              variant="outlined"
                              disabled={IsUserFieldsDisabled}
                              onChange={(e) => {
                                handleChangeFormDetails(e)
                              }}
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled,
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="effectiveDate" style={{ marginBottom: '-8px' }}>
                              Issuing Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                size='smal'
                                autoOk
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="EffectiveDate"
                                value={EffectiveDate}
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
                            <InputLabel shrink id="registrationNumber">
                              Registration Number *
                            </InputLabel>
                            <TextField
                              size='small'
                              fullWidth
                              name="registrationNumber"
                              value={FormDetails.registrationNumber}
                              variant="outlined"
                              disabled={IsUserFieldsDisabled}
                              onChange={(e) => {
                                handleChangeFormDetails(e)
                              }}
                              error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              onBlur={handleBlur}
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                        {
                          IsUserFieldsDisabled === false ? <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              size='small'
                              color="secondary"
                              type="submit"
                              variant="contained"
                              className={classes.btnSearch}
                              onClick={() => trackPromise(searchUserBasicDetails())}
                            >
                              Search
                            </Button>
                          </Box> : null
                        }
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>

          <Formik
            initialValues={{
              factoryItemID: FactoryItemIssueObject.factoryItemID,
              supplierID: FactoryItemIssueObject.supplierID,
              paymetEffectedMonth: PaymentEfectedDate,
              noOfInstalments: FactoryItemIssueObject.noOfInstalments,
              enableInstalments: FactoryItemIssueObject.enableInstalments,
              factoryItemGRNID: FactoryItemIssueObject.factoryItemGRNID,
              factoryItemGRNQuantity: FactoryItemIssueObject.factoryItemGRNQuantity,
              sellingPrice: FactoryItemIssueObject.sellingPrice,
            }}
            validationSchema={
              Yup.object().shape({
                factoryItemID: ItemLength === false ? Yup.number().min(1, "Please Select a Factory Item").required('Factory Item is required') : Yup.number().notRequired(),
                supplierID: ItemLength === false ? Yup.number().min(1, "Please Select a Supplier").required('Supplier is required') : Yup.number().notRequired(),
                paymetEffectedMonth: Yup.date().required("Please Provide the Date"),
                noOfInstalments: Yup.string().matches(/^(?!(?:1)$)\d+/, "Need more than one instalment").matches(/^[^\.]+$/, "Please enter a valid value for instalments"),
                factoryItemGRNQuantity: Yup.string().matches(/^[0-9]*(\.[0-9]{0,1})?$/, 'Only allow numbers with one decimal place'),
                sellingPrice: Yup.string().matches(/^[0-9]*(\.[0-9]{0,1})?$/, 'Only allow numbers with one decimal place')
              })
            }
            onSubmit={(event) => trackPromise(submitFactoryItemFrom(event))}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              values,
              handleChange,
              formikProps
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <PerfectScrollbar>
                    <Box mt={0}>
                      <Card>
                        <Divider />
                        <CardContent>
                          {
                            HideCardsInNewItemPage === false && PrtialyHideUserDetails === false ?
                              <>
                                {customerDetails.customerName != "" ? (
                                  <Grid container spacing={2}>
                                    <Grid item md={5} xs={12}>
                                      <Typography style={{ fontSize: '16px' }} align="left"><b>Customer Name: </b> {customerDetails.customerName}</Typography>
                                    </Grid>
                                    <Grid item md={5} xs={12}>
                                      <Typography style={{ fontSize: '16px' }} align="left"><b>Route Name: </b> {customerDetails.routeName}</Typography>
                                    </Grid>
                                  </Grid>
                                ) : null}
                              </> : null
                          }

                          {
                            HideCardsInNewItemPage === false && PrtialyHideUserDetails === false ? <>
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
                                        TotalBalance={parseFloat(TotalBalance)}
                                        RunningBalance={RunningBalance}
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
                            </> : null}
                          {
                            HideCardsInNewItemPage === false && PrtialyHideUserDetails === false ?
                              <>
                                <Grid container spacing={3}>
                                  <Grid item md={12} xs={12}>
                                    <UserStatisticsComponent
                                      UserDetails={UserBasicDetails}
                                    />
                                  </Grid>
                                </Grid>
                              </>
                              : null
                          }
                          {
                            HideCardsInNewItemPage === false ? <>
                              <Grid container spacing={3}>
                                <Grid item md={12} xs={12}>
                                  <Card>
                                    <CardContent>
                                      <Grid container spacing={3}>
                                        <Grid item md={4} xs={12}>
                                          <InputLabel shrink id="itemCategoryID">
                                            Item Category
                                          </InputLabel>
                                          <TextField select
                                            size='small'
                                            fullWidth
                                            name="itemCategoryID"
                                            onChange={(e) => handleItemCategoryChange(e)}
                                            disabled={IsUserFieldsDisabled || restrictOnlyOneItemInDirectIssue() || isFieldsEnabled}
                                            value={ItemCategoryID}
                                            variant="outlined" >
                                            <MenuItem value={0} disabled={true}>--Select Item Category--</MenuItem>
                                            {generateDropDownMenu(ItemCategoryList)}
                                          </TextField>
                                        </Grid>
                                        <Grid item md={4} xs={12}>
                                          <InputLabel shrink id="factoryItemID">
                                            Factory Item *
                                          </InputLabel>
                                          <TextField select
                                            size='small'
                                            error={Boolean(touched.factoryItemID && errors.factoryItemID)}
                                            fullWidth
                                            helperText={touched.factoryItemID && errors.factoryItemID}
                                            name="factoryItemID"
                                            disabled={IsUserFieldsDisabled || restrictOnlyOneItemInDirectIssue() || isFieldsEnabled}
                                            onChange={(e) => {
                                              handleChangeFactoryItemIssue(e)
                                            }}
                                            value={values.factoryItemID}
                                            variant="outlined"
                                            id="factoryItemID"
                                          >
                                            <MenuItem value="0">--Select Factory Item--</MenuItem>
                                            {generateDropDownItemListDropDown(FactoryItemList)}
                                          </TextField>
                                        </Grid>
                                        <Grid item md={4} xs={12}>
                                          <InputLabel shrink id="supplierID">
                                            Supplier *
                                          </InputLabel>
                                          <TextField select
                                            size='small'
                                            error={Boolean(touched.supplierID && errors.supplierID)}
                                            fullWidth
                                            helperText={touched.supplierID && errors.supplierID}
                                            name="supplierID"
                                            onChange={(e) => {
                                              handleChangeFactoryItemIssue(e)
                                            }}
                                            value={values.supplierID}
                                            variant="outlined"
                                            id="supplierID"
                                            disabled={IsUserFieldsDisabled || isFieldsEnabled}
                                          >
                                            <MenuItem value="0">--Select Supplier--</MenuItem>
                                            {generateDropDownItemListDropDown(SupplierList)}
                                          </TextField>
                                        </Grid>
                                      </Grid>
                                      <br />
                                      <Grid container spacing={3}>
                                        <Grid item md={7} xs={12}>
                                          <InputLabel shrink id="factoryItemGRNID">
                                            GRN List *
                                          </InputLabel>
                                          <TextField select
                                            size='small'
                                            error={Boolean(touched.factoryItemGRNID && errors.factoryItemGRNID)}
                                            fullWidth
                                            helperText={touched.factoryItemGRNID && errors.factoryItemGRNID}
                                            name="factoryItemGRNID"
                                            disabled={isFieldsEnabled}
                                            onChange={(event) => handleChangeFactoryItemIssue(event)}
                                            value={values.factoryItemGRNID}
                                            variant="outlined"
                                            id="factoryItemGRNID"
                                            inputProps={{ style: { fontSize: 5 } }} // font size of input text
                                          >
                                            <MenuItem value="0">--Select Factory Item GRN--</MenuItem>
                                            {generateFactoryItemDRNDropDownItelList(FactoryItemGRNList)}
                                          </TextField>
                                        </Grid>
                                        <Grid item md={2} xs={12}>
                                          <InputLabel shrink id="sellingPrice">
                                            Selling Price *
                                          </InputLabel>
                                          <TextField
                                            size='small'
                                            type="number"
                                            error={Boolean(touched.sellingPrice && errors.sellingPrice)}
                                            fullWidth
                                            disabled={isFieldsEnabled}
                                            helperText={touched.sellingPrice && errors.sellingPrice}
                                            name="sellingPrice"
                                            onChange={(e) => handleChangeFactoryItemIssue(e)}
                                            value={FactoryItemIssueObject.sellingPrice}
                                            variant="outlined"
                                            InputProps={{
                                              inputProps: {
                                                min: 0
                                              }
                                            }}
                                          />
                                        </Grid>
                                        <Grid item md={2} xs={12}>
                                          <InputLabel shrink id="factoryItemGRNQuantity">
                                            Quantity *
                                          </InputLabel>
                                          <TextField
                                            size='small'
                                            type="number"
                                            error={Boolean(touched.factoryItemGRNQuantity && errors.factoryItemGRNQuantity)}
                                            fullWidth
                                            disabled={isFieldsEnabled}
                                            helperText={touched.factoryItemGRNQuantity && errors.factoryItemGRNQuantity}
                                            name="factoryItemGRNQuantity"
                                            onChange={(e) => handleChangeFactoryItemIssue(e)}
                                            value={FactoryItemIssueObject.factoryItemGRNQuantity}
                                            variant="outlined"
                                            InputProps={{
                                              inputProps: {
                                                min: 0
                                              }
                                            }}
                                          />
                                        </Grid>

                                        <Box  >
                                          <Button
                                            color="primary"
                                            variant="contained"
                                            size="small"
                                            disabled={isFieldsEnabled}
                                            style={{ marginTop: '2rem', marginLeft: '1rem' }}
                                            onClick={() => AddItems(values)}
                                          >
                                            <AddIcon />
                                          </Button>
                                        </Box>
                                      </Grid>
                                      {
                                        factoryItemGrnArray.length > 0 ?
                                          <div maxheight={'10rem'} style={{ marginTop: "1rem" }}>
                                            <PerfectScrollbar>
                                              <Box minWidth={1050} style={{ border: "2px #00000021 solid" }}>
                                                <Table>
                                                  <TableHead>
                                                    <TableRow>
                                                      <TableCell align={'center'} >Supplier Name</TableCell>
                                                      <TableCell align={'center'} >GRN Number</TableCell>
                                                      <TableCell align={'center'} >Quantity</TableCell>
                                                      <TableCell align={'center'} >Price</TableCell>
                                                      <TableCell align={'center'} >Action</TableCell>
                                                    </TableRow>
                                                  </TableHead>
                                                  <TableBody>
                                                    {factoryItemGrnArray.map((rowData, index) => (
                                                      <TableRow key={index}>
                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", maxHeight: "1rem" }}>
                                                          {rowData.supplierName}
                                                        </TableCell>
                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", maxHeight: "1rem" }}>
                                                          {rowData.grnNumber}
                                                        </TableCell>
                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", maxHeight: "1rem" }}>
                                                          {rowData.itemQuantity}
                                                        </TableCell>
                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", maxHeight: "1rem" }}>
                                                          <CountUp decimals={2} separator=',' start={rowData.price} end={rowData.price} duration={0} />
                                                        </TableCell>
                                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", maxHeight: "1rem" }}>
                                                          <Button onClick={() => DeleteItem(index, rowData)}>
                                                            <DeleteIcon
                                                              style={{
                                                                color: "red"
                                                              }}
                                                            >
                                                            </DeleteIcon>
                                                          </Button>
                                                        </TableCell>
                                                      </TableRow>
                                                    ))}
                                                  </TableBody>
                                                </Table>
                                              </Box>
                                            </PerfectScrollbar>

                                            <Box display="flex" justifyContent="flex-end" >
                                              <Grid container md={6} xs={12}>
                                                <Grid item md={4} xs={6} style={{ marginTop: "1rem" }}>
                                                  <InputLabel style={{ marginTop: '0.1rem', textAlign: 'right', fontSize: '1.3rem', fontWeight: 'bold' }}> Total Quantity</InputLabel>
                                                </Grid>
                                                <Grid item md={2} xs={12} style={{ marginTop: '0.7rem' }}>
                                                  <InputLabel style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                                    <CountUp decimals={1} start={TotalItemQuantity} end={TotalItemQuantity} duration={1} />
                                                  </InputLabel>
                                                </Grid>

                                                <Grid item md={3} xs={6} style={{ marginTop: "1rem" }}>
                                                  <InputLabel style={{ marginTop: '0.1rem', textAlign: 'right', fontSize: '1.3rem', fontWeight: 'bold' }}> Total Price</InputLabel>
                                                </Grid>
                                                <Grid item md={3} xs={12} style={{ marginTop: '0.7rem' }}>
                                                  <InputLabel style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                                    <CountUp decimals={2} separator=',' end={finalTotal} duration={1} />
                                                  </InputLabel>
                                                </Grid>
                                              </Grid>
                                            </Box>
                                          </div>
                                          : null
                                      }
                                    </CardContent>
                                  </Card>
                                </Grid>
                              </Grid> </>
                              : null
                          }

                          {
                            HideCardsInNewItemPage === false ?
                              <>
                                <Grid container spacing={3}>
                                  <Grid item md={12} xs={12}>
                                    <Card>
                                      <CardContent>
                                        <Grid container spacing={3}>
                                          <Grid item md={3} xs={12}>
                                            <InputLabel shrink id="enableInstalments">
                                              Enable Instalments
                                            </InputLabel>
                                            <Switch
                                              size='small'
                                              checked={values.enableInstalments}
                                              onChange={(e) => handleChangeFactoryItemIssue(e)}
                                              disabled={isFieldsEnabled}
                                              name="enableInstalments"
                                            />
                                          </Grid>

                                          {
                                            FactoryItemIssueObject.enableInstalments ?
                                              <Grid item md={3} xs={12}>
                                                <InputLabel shrink id="noOfInstalments">
                                                  No of Instalments{
                                                    FactoryItemIssueObject.isInstalmentsDisabled
                                                  }
                                                </InputLabel>
                                                <TextField
                                                  size='small'
                                                  type="number"
                                                  error={Boolean(touched.noOfInstalments && errors.noOfInstalments)}
                                                  fullWidth
                                                  helperText={touched.noOfInstalments && errors.noOfInstalments}
                                                  name="noOfInstalments"
                                                  onBlur={handleBlur}
                                                  onChange={(e) => handleChangeFactoryItemIssue(e)}
                                                  value={values.noOfInstalments}
                                                  variant="outlined"

                                                />
                                              </Grid> : null
                                          }

                                          <Grid item md={6} xs={12}>
                                            <InputLabel shrink id="paymetEffectedMonth">
                                              Payment Effective Month *
                                            </InputLabel>
                                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                              <KeyboardDatePicker
                                                size='small'
                                                error={Boolean(touched.paymetEffectedMonth && errors.paymetEffectedMonth)}
                                                fullWidth
                                                minDate={MinMonth}
                                                helperText={touched.paymetEffectedMonth && errors.paymetEffectedMonth}
                                                inputVariant="outlined"
                                                openTo="month"
                                                views={["year", "month"]}
                                                id="paymetEffectedMonth"
                                                disabled={isFieldsEnabled}
                                                value={PaymentEfectedDate}
                                                onChange={(e) => {
                                                  setPaymentEfectedDate(e)
                                                }}
                                                KeyboardButtonProps={{
                                                  'aria-label': 'change date',
                                                }}
                                                name="paymetEffectedMonth"
                                              />
                                            </MuiPickersUtilsProvider>
                                          </Grid>
                                        </Grid>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                </Grid>
                              </>
                              : null
                          }
                          {
                            HideCardsInNewItemPage === false ?
                              <>
                                <AutoGLComponent
                                  AutoGLRequestDetailsModel={AutoGLRequestDetailsModel}
                                  SetSelectedAccountDetails={setSelectedAccountDetails}
                                />
                              </> : null
                          }
                        </CardContent>

                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                            className={classes.btnSendToDel}
                            onClick={SendToDeliveryBtnStaus}
                            disabled={HideCardsInNewItemPage || IsActionFieldsDisable}
                          >
                            Send To Delivery
                          </Button>
                          
                          <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                            className={classes.btnIssue}
                            onClick={IssueBtnStaus}
                            disabled={HideCardsInNewItemPage || IsActionFieldsDisable}
                          >
                            Issue
                          </Button>
                        </Box>
                      </Card>
                    </Box>
                  </PerfectScrollbar>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page >
    </Fragment >
  )
}

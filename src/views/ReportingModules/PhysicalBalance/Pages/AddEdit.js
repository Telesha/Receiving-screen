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
import authService from '../../../../utils/permissionAuth';
import { LoadingComponent } from '../../../../utils/newLoader';
import tokenService from '../../../../utils/tokenDecoder';
import { UserStatisticsComponent } from '../../../UserStatistics/UserStatisticsExportComponent';
import PageHeader from 'src/views/Common/PageHeader';
import { CustomerPaymentDetailsComponent } from './../../../Common/CustomerPaymentDetails/CustomerPaymentDetailsComponent';
import paymentServices from './../../../Common/CustomerPaymentDetails/Services';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { CustomerPaymentDetailsNewComponent } from 'src/views/Common/CustomerPaymentDetailsNewComponent/CustomerPaymentDetailsNewComponenet';
import AdvancePaymentReceiptComponent from './../../../Common/AdvancedPaymentPrintReceipt/AdvancePaymentReceiptComponent';
import ReactToPrint from "react-to-print";

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
    minWidth: "50%",
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
const screenCode = 'PHYSICALBALANCE';
export default function PhysicalBalanceAddEdit() {
  const classes = useStyles();
  const componentRef = useRef();
  const [title, setTitle] = useState("Physical Balance");
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
  const [newPhysicalbalanceID, setNewPhysicalbalanceID] = useState(0);
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
  const [PreviousMonthDeductionDetailsList, setPreviousMonthDeductionDetailsList] = useState([])
  const [CurrentMonthDeductionDetailsList, setCurrentMonthDeductionDetailsList] = useState([])
  const [approveList, setApproveList] = useState({
    groupID: '0',
    factoryID: '0',
    nic: '',
    regNumber: '',
    previouseMonthAmount: 0,
    currentMonthAmount: 0,
    grade:'0',
    gradetypeID:'0',
    Location:'0',
    sellingmarkID:'0',
    StockDate:'0'
  });

  const currentProps1 = {
    border: 1,
    style: { height: 'auto', marginLeft: '1rem', marginBottom: '1rem' }
  };

  const { physicalbalanceID } = useParams();
  const navigate = useNavigate();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAuthorizeChangeEnabled: false,
    isIssueChangeEnabled: false,
    isAdvanceRateChangeEnabled: false
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

  const handleClick = () => {
    navigate('/app/physicalbalance/listing');
  }

  const handleClose = () => {
    setIsDisableButton(false);
    setOpen(false);
  };
  const [btnName, setBtnName] = useState("Cancel");

  useEffect(() => {
    decrypted = atob(physicalbalanceID.toString());
    if (parseInt(decrypted) > 0) {
      setNewlyCreated(false);
      trackPromise(
        getApproveDetails(decrypted),
        setBtnName("Reject")
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
      getPermission()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown(),
      atob(physicalbalanceID.toString()) > 0 ? searchCustomerBalanceDetails(approveList) : null,

    );
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

  // useEffect(() => {
  //   trackPromise(
  //     calculateCurrentBalance(),
  //     setPreAvailableBalance()
  //   );
  // }, [cropDetails]);

  // useEffect(() => {
  //   trackPromise(
  //     setPreAvailableBalance(),
  //     setCurAvailableBalance(),
  //   );
  // }, [newRates]);

  // useEffect(() => {
  //   trackPromise(
  //     calculateTotalBalance(),
  //   )
  // }, [previouseAvailableBalance]);

  // useEffect(() => {
  //   trackPromise(
  //     calculateTotalBalance(),
  //   )
  // }, [currentAvailableBalance]);

  // useEffect(() => {
  //   trackPromise(
  //     calculateTotalBalance(),
  //     calculateCurrentBalance()
  //   )
  // }, [currentAdvanceTotal]);

  // useEffect(() => {
  //   trackPromise(
  //     calculateTotalBalance(),
  //     calculateCurrentBalance()
  //   )
  // }, [currentFactoryItemTotal]);

  // useEffect(() => {
  //   trackPromise(
  //     calculateTotalBalance(),
  //     calculateCurrentBalance()
  //   )
  // }, [currentLoanTotal]);

  // useEffect(() => {
  //   trackPromise(
  //     createTotalAmount(),
  //   )
  // }, [approveList]);

  // useEffect(() => {
  //   calculateTotalBalance(); calculateCurrentBalance();
  // }, [currentTransportTotal]);

  // useEffect(() => {
  //   calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  // }, [monthLoanInterestDebit]);

  // useEffect(() => {
  //   calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  // }, [monthLoanPrincipalDebit]);

  // useEffect(() => {
  //   calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  // }, [monthLoanArrearsFine]);

  // useEffect(() => {
  //   calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  // }, [monthLoanArrearsInterest]);

  // useEffect(() => {
  //   calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  // }, [previousMonthLoanInterestDebit, previousMonthLoanPrincipalDebit, previouseMonthLoanArrearsFine, previouseMonthLoanArrearsInterest]);

  // useEffect(() => {
  //   calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  // }, [BalanceCarriedForwardAmount]);

  // useEffect(() => {
  //   calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  // }, [PreviousMonthBalanceBroughtForwardAmount]);

  // useEffect(() => {
  //   calculateTotalBalance(); calculateCurrentBalance(); setPreAvailableBalance();
  // }, [CurrentMonthTotalExpensesAmount, PreviousMonthTotalExpensesAmount])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITPHYSICALBALANCE');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isAuthorizeChangeEnabled = permissions.find(p => p.permissionCode === 'OVERADVANCEAUTHORIZE');
    var isIssueChangeEnabled = permissions.find(p => p.permissionCode == "OVERADVANCEISSUE");
    var isAdvanceRateChangeEnabled = permissions.find(p => p.permissionCode == "ADVANCERATECHANGEPERMISSION");

    setPermissions({
      ...permissionList,
      isAuthorizeChangeEnabled: isAuthorizeChangeEnabled !== undefined,
      isIssueChangeEnabled: isIssueChangeEnabled !== undefined,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isAdvanceRateChangeEnabled: isAdvanceRateChangeEnabled !== undefined,
    });

    if (atob(physicalbalanceID.toString()) == 0) {
      setApproveList({
        ...approveList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      });
    }
  }

  async function getApproveDetails(physicalbalanceID) {
    let response = await services.getApprovedDetailsByID(physicalbalanceID);
    let data = response[0];
    setApproveList({
      ...approveList,
      groupID: data.groupID,
      factoryID: data.factoryID,
      regNumber: data.registrationNumber,
      previouseMonthAmount: parseFloat(data.previouseMonthAmount),
      currentMonthAmount: parseFloat(data.currentMonthAmount)
    });
    setReqAmount(data.requestedAmount)
    setTitle("Physical Balance");


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
      nic: null
    }

    trackPromise(searchCustomerBalanceDetails(model));
  }

  async function PreviousMonthTotalExpensesAmount() {
    let amount = 0;
    PreviousMonthDeductionDetailsList.forEach((object) => {
      if (object.entryType === 2) {
        amount += object.totalAmount
      }
    })
    return parseFloat(amount)
  }

  async function CurrentMonthTotalExpensesAmount() {
    let amount = 0
    CurrentMonthDeductionDetailsList.forEach((object) => {
      if (object.entryType === 2) {
        amount += object.totalAmount
      }
    })
    return parseFloat(amount)
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

    total += PreviousMonthBalanceBroughtForwardAmount
    var previouseBalance = customerBalancePaymentAmount == -1 ? total - (await PreviousMonthTotalExpensesAmount() + PreviousMonthBalanceCarriedForwardAmount) : 0;
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
    setIsPrintButtonDisabled(true)
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
    //Common Min And Max Rates

    const newRate = await paymentServices.getCurrentMinMaxRateByApplicableMonthAndYear(model.factoryID);
    setNewRates(newRate);

    setUserBasicDetails({
      ...userBasicDetails, GroupID: approveList.groupID, FactoryID: approveList.factoryID, CustomerRegistrationNumber: approveList.regNumber
    });

    atob(physicalbalanceID.toString()) > 0 ? setUserBasicDetails({
      ...userBasicDetails, GroupID: model.groupID, FactoryID: model.factoryID, CustomerRegistrationNumber: model.regNumber
    }) : setUserBasicDetails({
      ...userBasicDetails, GroupID: approveList.groupID, FactoryID: approveList.factoryID, CustomerRegistrationNumber: approveList.regNumber
    });
    var found = await getCustomerDetailsByRegNumber(model);

    if (atob(physicalbalanceID.toString()) == 0) {
      var validate = /^[1-9]\d*$/;
      if (!validate.test(approveList.regNumber)) {
        ClearData();
        setRunningBalance(0);
        return;
      }

      if (found.data === null) {
        alert.error('INVALID CUSTOMER REGISTRATION NUMBER');
        setRunningBalance(0);
        ClearData();
      } else {
        var active = await checkCustomerIsActive();
        if (!active) {
          alert.error('Customer is InActive');
          setRunningBalance(0);
          ClearData();
        }
      }

    }
  }

  async function checkCustomerIsActive() {
    const response = await services.CheckCustomerISActive(approveList.regNumber, approveList.factoryID);
    return response;
  }

  async function getCustomerDetailsByRegNumber(model) {
    if (atob(physicalbalanceID.toString()) > 0) {
      const cus = await services.getCustomerDetails(model.groupID, model.factoryID, model.regNumber);
      setCustomer(cus.data);
    } else {
      const cus = await services.getCustomerDetails(approveList.groupID, approveList.factoryID, approveList.regNumber);
      setCustomer(cus.data);
      return cus;
    }

  }

  async function getCustomerAccountBalance() {
    const accountBalance = await services.getCustomerAccountBalanceByRedis(parseInt(customer.customerID), parseInt(customer.customerAccountID));
    setRunningBalance(accountBalance);
  }

  async function IssueAdvancePayment() {

    let approveModel = {
      physicalbalanceID: newlyCreated ? newPhysicalbalanceID : atob(physicalbalanceID.toString()),
      requestedAmount: newlyCreated ? totalAmount : reqAmount,
      approvedAmount: parseFloat(totalAmount),
      previouseBalance: approveList.previouseMonthAmount === "" ? 0 : parseFloat(approveList.previouseMonthAmount),
      currentBalance: approveList.currentMonthAmount === "" ? 0 : parseFloat(approveList.currentMonthAmount)
    }

    if (totalAmount <= 0 || totalAmount == null || totalAmount == undefined) {
      alert.error("Please enter valid total amount");
    }
    else if (atob(physicalbalanceID.toString()) > 0) {
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
      // navigate('/app/advancePaymentRequest/listing');
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
    if (atob(physicalbalanceID.toString()) > 0) {
      let response = await services.UpdateOverAdvanceRequest(authorizeModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setInPending(false);
        navigate('/app/physicalbalance/listing');
        setNewPhysicalbalanceID(response.data);
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
        navigate('/app/physicalbalance/listing');
        setNewPhysicalbalanceID(response.data);

      }
      else {
        setIsDisableButton(false);
        alert.error(response.message);
        setInPending(true)
      }
    }
  }

  function AuthorizePayment(authorizeModel) {
    confirmAlert({
      title: <h6>Confirm To Authorize</h6>,
      message: 'Are you sure to do this?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => Authorize(authorizeModel)
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

  async function Reject(rejectModel) {
    let response = await services.RejectAdvancePayment(rejectModel);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      navigate('/app/physicalbalance/listing');
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
      physicalbalanceID: atob(physicalbalanceID.toString()),
    }
    if (atob(physicalbalanceID.toString()) > 0) {
      setIsDisableButton(true);
      RejectPayment(rejectModel);
    }
    else {
      navigate('/app/physicalbalance/listing');
    }
  }

  async function AuthorizeAdvancePayment() {
    if (atob(physicalbalanceID.toString()) > 0) {
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
        else {
          setIsDisableButton(true);
          let response = await services.getApprovedDetailsByID(atob(physicalbalanceID.toString()));
          let data = response[0];

          let authorizeModel = {
            physicalbalanceID: atob(physicalbalanceID.toString()),
            requestedAmount: reqAmount,
            customerID: data.customerID,
            customerAccountID: data.customerAccountID,
            approvedAmount: parseFloat(totalAmount),
            previouseBalance: approveList.previouseMonthAmount === "" ? 0 : parseFloat(approveList.previouseMonthAmount),
            currentBalance: approveList.currentMonthAmount === "" ? 0 : parseFloat(approveList.currentMonthAmount)
          }
          AuthorizePayment(authorizeModel);
        }
      }
    }
    else {
      if (totalAmount <= 0) {
        alert.error('Enter a valid amount');
      } else {
        let authorizeModel = {
          physicalbalanceID: 0,
          requestedAmount: totalAmount,
          approvedAmount: totalAmount,
          registrationNumber: approveList.regNumber,
          factoryID: approveList.factoryID,
          groupID: approveList.groupID,
          previouseBalance: approveList.previouseMonthAmount === "" ? 0 : parseFloat(approveList.previouseMonthAmount),
          currentBalance: approveList.currentMonthAmount === "" ? 0 : parseFloat(approveList.currentMonthAmount)
        }
        AuthorizePayment(authorizeModel);
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
    const df = /^\s*(?=.*[0-9])\d*(?:\.\d{1,2})?\s*$/
    const target = e.target;
    const name = target.name;
    const value = target.value

    if (value < 0 || !df.test(value)) {
      setIsAmountFieldsValid(false)
      if (name === "currentMonthAmount") {
        setIsCurrentMonthValid(false);
        setCurrentMonthAmountValidationText("Only allow positive number with 2 decimals")
      } else {
        setIsPreviousMonthValid(false);
        setPreviousMonthAmountValidationText("Only allow positive number with 2 decimals")
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
    navigate('/app/physicalbalance/listing');
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page
        className={classes.root}
        title="Physical Balance"
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
                regNumber: Yup.string().required('registration number is required').typeError('Enter valid registration number').matches(/^[0-9]{0,15}$/, 'Please enter valid registration number'),
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
                    <CardContent style={{ marginBottom: "2rem" }}>
                      <Grid container spacing={2}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group  *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="groupID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.groupID}
                            variant="outlined"
                            size = 'small'
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isGroupFilterEnabled }}
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryID">
                            Factory *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="factoryID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.factoryID}
                            size = 'small'
                            variant="outlined"
                            id="factoryID"
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isFactoryFilterEnabled }}
                          >
                            <MenuItem value="0">--Select Factory--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                      </Grid>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="StockDate">
                            Stock Date
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="StockDate"
                            onChange={(e) => handleChange(e)}
                            value={approveList.StockDate}
                            size = 'small'
                            variant="outlined"
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isFactoryFilterEnabled }}
                          >
                            <MenuItem value="0">--Select Stock Date--</MenuItem>
                            <MenuItem value="1">31/08/2021</MenuItem>
                            <MenuItem value="2">30/09/2022</MenuItem>
                            <MenuItem value="3">31/10/2021</MenuItem>
                            <MenuItem value="4">30/11/2021</MenuItem>
                            <MenuItem value="5">31/12/2021</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="Location">
                            Location
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="Location"
                            onChange={(e) => handleChange(e)}
                            variant="outlined"
                            size = 'small'
                            value={approveList.Location}
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isFactoryFilterEnabled }}
                          >
                            <MenuItem value="0">--Select Location--</MenuItem>
                            <MenuItem value="1">Maskeliya Plantation</MenuItem>
                            <MenuItem value="2">Horana Plantation</MenuItem>
                            <MenuItem value="3">Demodara Estate</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="sellingmarkID">
                            Selling Mark
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="sellingmarkID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.sellingmarkID}
                            size = 'small'
                            variant="outlined"
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isFactoryFilterEnabled }}
                          >
                            <MenuItem value="0">--Select Selling Mark--</MenuItem>
                            <MenuItem value="1">GOLDEN GARDEN</MenuItem>
                            <MenuItem value="2">GOLDEN BREW</MenuItem>
                          </TextField>
                        </Grid>

                      </Grid>
                      <Grid container spacing={2}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="gradetypeID">
                            Grade Type
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="gradetypeID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.gradetypeID}
                            size = 'small'
                            variant="outlined"
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isFactoryFilterEnabled }}
                          >
                            <MenuItem value="0">--Select Grade Type--</MenuItem>
                            <MenuItem value="1">Premier</MenuItem>
                            <MenuItem value="2">Small Leafy</MenuItem>
                            <MenuItem value="3">Off Grade</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="grade">
                            Grade
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="grade"
                            onChange={(e) => handleChange(e)}
                            value={approveList.grade}
                            size = 'small'
                            variant="outlined"
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isFactoryFilterEnabled }}
                          >
                            <MenuItem value="0">--Select Grade--</MenuItem>
                            <MenuItem value="1">BOPF EX SP1</MenuItem>
                            <MenuItem value="2">BOPA</MenuItem>
                            <MenuItem value="3">BT</MenuItem>
                          </TextField>
                        </Grid>


                      </Grid>
                      <Grid container spacing={3}>

                        <Grid item md={4} xs={12}>
                        <InputLabel shrink id="regNumber">
                        Made Tea Qty(Kg)
                            </InputLabel>
                          <TextField
                            fullWidth
                            onChange={(e) => handleChange(e)}
                            variant="outlined"
                            type="text"
                            size = 'small'
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                        <InputLabel shrink id="regNumber">
                        Avarage(Rs)
                            </InputLabel>
                          <TextField
                            fullWidth
                            onChange={(e) => handleChange(e)}
                            variant="outlined"
                            type="text"
                            size = 'small'
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                        <InputLabel shrink id="regNumber">
                        Amount(Rs)
                            </InputLabel>
                          <TextField
                            fullWidth
                            onChange={(e) => handleChange(e)}
                            variant="outlined"
                            type="text"
                            size = 'small'
                          >
                          </TextField>
                        </Grid>
                      </Grid>
                      {newlyCreated ?
                        <Box display="flex" justifyContent="flex-end" mt={2}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            onClick={() => trackPromise(searchCustomerBalanceDetails(approveList))}
                            size = 'small'
                          >
                            Save
                          </Button>
                        </Box> : null}

                    </CardContent>
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

                    <Grid container spacing={2}>
                      <Grid item md={12} xs={12}>
                        {approveList.regNumber != "" && inPending ?
                          <UserStatisticsComponent
                            UserDetails={userBasicDetails}
                          />
                          : null}
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} justify="flex-end">
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

                    <Grid container md={12} xs={12} spacing={2}>
                      <Grid item md={12} xs={12}>

                        <Box display="flex" justifyContent="flex-end" p={2}>
                          {permissionList.isAuthorizeChangeEnabled && inPending ?
                            <Button
                              color="secondary"
                              variant="contained"
                              disabled={isDisableButton}
                              style={{
                                marginRight: "1rem",
                              }}
                              className={classes.colorReject}
                              onClick={() => RejectAdvancePayment()}
                              size = 'small'
                            >
                              {btnName}
                            </Button> : null}

                          {permissionList.isAuthorizeChangeEnabled && inPending ?
                            <Button
                              color="secondary"
                              variant="contained"
                              disabled={isDisableButton || !isValid || !IsAmountFieldsValid}
                              style={{
                                marginRight: "1rem",
                              }}
                              className={classes.colorAuthorize}
                              onClick={() => AuthorizeAdvancePayment()}
                              size = 'small'
                            >
                              Authorize
                            </Button> : null}
                          {
                            !IsPrintButtonDisabled ?
                              <div>
                                <ReactToPrint
                                  documentTitle={"Advance Payment Receipt"}
                                  trigger={() =>
                                    <Button
                                      color="primary"
                                      type="submit"
                                      variant="contained"
                                      size="small"
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
                                {permissionList.isIssueChangeEnabled && !inPending ?
                                  <Button
                                    color="primary"
                                    type="submit"
                                    variant="contained"
                                    className={classes.colorApprove}
                                    disabled={!isValid}
                                    onClick={() => IssueAdvancePayment()}
                                    size = 'small'
                                  >
                                    Issue
                                  </Button> : null}
                              </>
                          }
                        </Box>
                      </Grid>
                    </Grid>
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


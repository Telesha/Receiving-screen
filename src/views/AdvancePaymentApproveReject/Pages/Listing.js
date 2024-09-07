import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, CardHeader, Button, Chip } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { useAlert } from "react-alert";
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import PageHeader from 'src/views/Common/PageHeader';
import { LoadingComponent } from '../../../utils/newLoader';
import { UserStatisticsComponent } from '../../UserStatistics/UserStatisticsExportComponent';
import { CustomerPaymentDetailsComponent } from './../../Common/CustomerPaymentDetails/CustomerPaymentDetailsComponent';
import paymentServices from './../../Common/CustomerPaymentDetails/Services';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { CustomerPaymentDetailsNewComponent } from './../../Common/CustomerPaymentDetailsNewComponent/CustomerPaymentDetailsNewComponenet';

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
  colorIssue: {
    backgroundColor: "green",
  },
  colorSendToDeliver: {
    backgroundColor: "#F6BE00",
  },
}));
const screenCode = 'ADVANCEPAYMENTREQUESTAPPROVAL';
export default function AdvancePaymentApproveRejectListing() {
  const classes = useStyles();
  const [title, setTitle] = useState("Mobile Advance Autherized & Issue");
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [totalAmount, setTotalAmount] = useState();
  const [customer, setCustomer] = useState();
  const alert = useAlert();
  const [isDisable, setIsDisable] = useState(false);
  const [reqAmount, setReqAmount] = useState();
  const ApprovalEnum = Object.freeze({ "Pending": 1, "Approve": 2, "Reject": 3, });
  const [inPending, setInPending] = useState(false);
  //Balance Component Required Hooks
  const [cropDetails, setCropDetails] = useState([]);
  const [currentCropDetails, setCurrentCropDetails] = useState([]);
  const [advanceTotal, setAdvanceTotal] = useState();
  const [factoryItemTotal, setFactoryItemTotal] = useState();
  const [loanTotal, setLoanTotal] = useState();
  const [transportTotal, setTransportTotal] = useState();
  const [currentTransportTotal, setCurrentTransportTotal] = useState();
  const [customerBalancePaymentAmount, setCustomerBalancePaymentAmount] = useState();
  const [currentAdvanceTotal, setCurrentAdvanceTotal] = useState(0);
  const [currentFactoryItemTotal, setCurentFactoryItemTotal] = useState(0);
  const [currentLoanTotal, setCurrentLoanTotal] = useState(0);
  const [previouseAvailableBalance, setPreviouseAvailableBalance] = useState(0);
  const [currentAvailableBalance, setCurrentAvailableBalance] = useState(0);
  const [newRates, setNewRates] = useState([]);
  const [IsBalancePaymetDone, setIsBalancePaymetDone] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [runningBalance, setRunningBalance] = useState(0);
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
  //Balance Component Required Hooks
  const [approveList, setApproveList] = useState({
    groupID: '0',
    factoryID: '0',
    nic: '',
    regNumber: '',
    previouseMonthAmount: 0,
    currentMonthAmount: 0
  });

  const [userBasicDetails, setUserBasicDetails] = useState({
    FactoryID: parseInt(approveList.factoryID),
    GroupID: parseInt(approveList.groupID),
    NIC: null,
    CustomerRegistrationNumber: approveList.regNumber
  })

  const currentProps = {
    border: 1,
    style: { height: 'auto', marginLeft: '1rem', marginRight: '1rem', marginTop: '-2.5rem' }
  };

  const currentProps1 = {
    border: 1,
    style: { height: 'auto', marginLeft: '1rem', marginRight: '1rem', marginBottom: '1rem' }
  };

  const { advancePaymentRequestID } = useParams();
  const navigate = useNavigate();
  let decrypted = 0;

  const handleClose = () => {
    setOpen(false);
  };

  const [permissionList, setPermissions] = useState({
    isAdvancePaymentChangeEnabled: false,
    isAdvanceRateChangeEnabled: false,
    isApproveRejectEnabled: false,
    isSendToDeliverEnabled: false
  });

  useEffect(() => {
    trackPromise(getPermission());

    trackPromise(getGroupsForDropdown());

    decrypted = atob(advancePaymentRequestID.toString());
    if (decrypted != 0) {
      trackPromise(getApproveDetails(decrypted));
    }

  }, []);

  useEffect(() => {
    trackPromise(getfactoriesForDropDown());
  }, [approveList.groupID]);

  useEffect(() => {
    trackPromise(getCustomerDetailsByRegNumber(),);
  }, [approveList.regNumber]);

  useEffect(() => {
    trackPromise(getCustomerAccountBalance());
  }, [customer]);

  useEffect(() => {
    trackPromise(setCurAvailableBalance()); trackPromise(calculateCurrentBalance());
  }, [currentCropDetails]);

  useEffect(() => {
    trackPromise(calculateCurrentBalance()); trackPromise(setPreAvailableBalance());
  }, [cropDetails]);

  useEffect(() => {
    trackPromise(setPreAvailableBalance()); trackPromise(setCurAvailableBalance());
  }, [newRates]);

  useEffect(() => {
    calculateTotalBalance();
  }, [previouseAvailableBalance]);

  useEffect(() => {
    calculateTotalBalance();
  }, [currentAvailableBalance]);

  useEffect(() => {
    trackPromise(calculateTotalBalance()); trackPromise(calculateCurrentBalance());
  }, [currentAdvanceTotal]);

  useEffect(() => {
    trackPromise(calculateTotalBalance()); trackPromise(calculateCurrentBalance());
  }, [currentFactoryItemTotal]);

  useEffect(() => {
    trackPromise(calculateTotalBalance()); trackPromise(calculateCurrentBalance());
  }, [currentLoanTotal]);

  useEffect(() => {
    trackPromise(createMonthAmount());
  }, [totalBalance]);

  useEffect(() => {
    createTotalAmount();
  }, [approveList]);

  useEffect(() => {
    trackPromise(setCurAvailableBalance());
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
    var isAuthorized = permissions.find(p => p.permissionCode == 'APPROVEADVANCEPAYMENTREQUEST');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isAdvancePaymentChangeEnabled = permissions.find(p => p.permissionCode === 'ADVANCEPAYMENTPERMISSION');
    var isAdvanceRateChangeEnabled = permissions.find(p => p.permissionCode == "MOBILEADVANCERATECHANGEPERMISSION");
    var isApproveRejectPermission = permissions.find(p => p.permissionCode === "MOBILEADVANCEREJECTISSUE");
    var isSendToDeliverPermission = permissions.find(p => p.permissionCode === "MOBILEADVANCESENDTODELIVERY");
    setPermissions({
      ...permissionList,
      isAdvancePaymentChangeEnabled: isAdvancePaymentChangeEnabled !== undefined,
      isAdvanceRateChangeEnabled: isAdvanceRateChangeEnabled !== undefined,
      isApproveRejectEnabled: isApproveRejectPermission !== undefined,
      isSendToDeliverEnabled: isSendToDeliverPermission !== undefined
    });

  }

  async function getApproveDetails(advancePaymentRequestID) {
    let response = await services.getApprovedDetailsByID(advancePaymentRequestID);
    let data = response[0];
    setApproveList({
      ...approveList,
      groupID: data.groupID,
      factoryID: data.factoryID,
      regNumber: data.registrationNumber
    });
    setReqAmount(data.requestedAmount)
    setTitle("Mobile Advance Autherized & Issue");

    data.statusID == ApprovalEnum.Pending ? setInPending(true) : setInPending(false);
    setUserBasicDetails({
      ...userBasicDetails,
      GroupID: data.groupID,
      FactoryID: data.factoryID,
      CustomerRegistrationNumber: data.registrationNumber
    })

    let model = {
      regNumber: data.registrationNumber,
      groupID: data.groupID,
      factoryID: data.factoryID,
      nic: null
    }

    trackPromise(searchCustomerBalanceDetails(model));
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
  }

  async function getCustomerDetailsByRegNumber() {
    const cus = await services.getCustomerDetails(approveList.groupID, approveList.factoryID, approveList.regNumber);
    setCustomer(cus.data);
  }
  async function getCustomerAccountBalance() {
    const accountBalance = await services.getCustomerAccountBalanceByRedis(parseInt(customer.customerID), parseInt(customer.customerAccountID));
    setRunningBalance(accountBalance);
  }

  async function IssueAdvancePayment() {
    let response = await services.getApprovedDetailsByID(atob(advancePaymentRequestID.toString()));
    let data = response[0];
    let approveModel = {
      advancePaymentRequestID: atob(advancePaymentRequestID.toString()),
      requestedAmount: reqAmount,
      customerID: data.customerID,
      customerAccountID: data.customerAccountID,
      approvedAmount: parseFloat(totalAmount),
      previouseBalance: approveList.previouseMonthAmount === "" ? 0 : parseFloat(approveList.previouseMonthAmount),
      currentBalance: approveList.currentMonthAmount === "" ? 0 : parseFloat(approveList.currentMonthAmount),
      groupID: approveList.groupID,
      factoryID: approveList.factoryID
    }


    if (totalAmount <= 0 || totalAmount == null || totalAmount == undefined || parseFloat(totalAmount) === 0.00) {
      alert.error("Enter a valid total amount");
    }
    else if (totalAmount > totalBalance) {
      alert.error('Total amount cannot be greater than total balance');
    }
    else if (reqAmount < totalAmount) {
      alert.error('Total amount is greater than requested amount');
    }
    else if (parseFloat(approveList.previouseMonthAmount) > 0 && parseFloat(previouseAvailableBalance) < parseFloat(approveList.previouseMonthAmount)) {
      alert.error('Previouse month amount cannot be greater than previouse month balance');
    }
    else if (parseFloat(approveList.currentMonthAmount) > 0 && parseFloat(currentAvailableBalance) < parseFloat(approveList.currentMonthAmount)) {
      alert.error('Current month amount cannot be greater than current month balance');
    }
    else {
      confirmPayment(approveModel);
    }
  }

  function confirm(approveModel) {

    confirmAlert({
      title: 'Confirm To Approve',
      message: 'Are you sure to do this.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => confirmed(approveModel)
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

  async function confirmed(approveModel) {
    let response = await services.IssueAdvancePayment(approveModel);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      navigate('/app/advancePaymentApproval/listing');
    }
    else {
      alert.error(response.message);
    }
  }
  async function confirmPayment(approveModel) {
    confirm(approveModel);
  }

  async function SendToDeliverAdvancePayment() {
    let response = await services.getApprovedDetailsByID(atob(advancePaymentRequestID.toString()));
    let data = response[0];
    let approveModel = {
      advancePaymentRequestID: atob(advancePaymentRequestID.toString()),
      requestedAmount: reqAmount,
      customerID: data.customerID,
      customerAccountID: data.customerAccountID,
      approvedAmount: parseFloat(totalAmount),
      previouseBalance: approveList.previouseMonthAmount === "" ? 0 : parseFloat(approveList.previouseMonthAmount),
      currentBalance: approveList.currentMonthAmount === "" ? 0 : parseFloat(approveList.currentMonthAmount),
      groupID: approveList.groupID,
      factoryID: approveList.factoryID
    }

    if (totalAmount <= 0 || totalAmount == null || totalAmount == undefined) {
      alert.error("Enter valid total amount");
    }
    else if (totalAmount > totalBalance) {
      alert.error('Total amount cannot be greaterthan total balance');
    }
    else if (reqAmount < totalAmount) {
      alert.error('Total amount is greater than requested amount');
    }
    else if (parseFloat(approveList.previouseMonthAmount) > 0 && parseFloat(previouseAvailableBalance) < parseFloat(approveList.previouseMonthAmount)) {
      alert.error('Previouse month amount cannot be greater than previouse month balance');
    }
    else if (parseFloat(approveList.currentMonthAmount) > 0 && parseFloat(currentAvailableBalance) < parseFloat(approveList.currentMonthAmount)) {
      alert.error('Current month amount cannot be greater than current month balance');
    }
    else {
      sendToDeliver(approveModel);
    }
  }
  async function deliver(approveModel) {
    let response = await services.SendToDeliverAdvancePayment(approveModel);
    if (response.statusCode == "Success") {
      setIsDisable(true);
      alert.success(response.message);
      navigate('/app/advancePaymentApproval/listing');
    }
    else {
      alert.error(response.message);
    }
  }

  function sendToDeliverpayment(approveModel) {
    confirmAlert({
      title: 'Confirm To SendToDeliver ',
      message: 'Are you sure to do this.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => deliver(approveModel)
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

  async function sendToDeliver(approveModel) {
    sendToDeliverpayment(approveModel);
  }

  async function Reject(rejectModel) {
    let response = await services.RejectAdvancePayment(rejectModel);
    if (response.statusCode == "Success") {
      setIsDisable(true);
      alert.success(response.message);
      navigate('/app/advancePaymentApproval/listing');
    }
    else {
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
    RejectPayment(rejectModel);
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

  const handleClick = () => {
    navigate('/app/advancePaymentApproval/listing');
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page
        className={classes.root}
        title="Mobile Advance Autherized & Issue"
      >
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
                currentMonthAmount: Yup.string().min(0, 'Current month amount should greater than 0').matches(/^\s*(?=.*[0-9])\d*(?:\.\d{1,2})?\s*$/, 'Only allow positive number with 2 decimals')
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
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent style={{ marginBottom: "2rem" }}>
                        <Grid container spacing={3}>
                          <Grid item md={2} xs={12}>
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
                              InputProps={{ readOnly: true }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={2} xs={12}>
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
                              InputProps={{ readOnly: true }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="regNumber">
                              Reg Number *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="regNumber"
                              onChange={(e) => handleChange(e)}
                              value={approveList.regNumber}
                              variant="outlined"
                              id="regNumber"
                              size="small"
                              InputProps={{ readOnly: true }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={2} xs={12} style={{ marginTop: "1.5rem" }}>
                            <InputLabel shrink id="nic">
                              Requested Amount *
                            </InputLabel>
                          </Grid>
                          <Grid item md={3} xs={12} style={{ marginTop: "1rem" }}>
                            <Chip
                              label={reqAmount}
                              color="secondary"
                              size="medium"
                              className={classes.chip}
                            />
                          </Grid>
                        </Grid>

                        <Grid container spacing={2}>
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
                            <UserStatisticsComponent
                              UserDetails={userBasicDetails}
                            />
                          </Grid>
                        </Grid>

                        <Grid container spacing={1} justify="flex-end">
                          <Grid item md={2} xs={12} style={{ marginTop: "1.5rem", marginBottom: '1rem' }}>
                            <InputLabel shrink id="nic">
                              Requested Amount *
                            </InputLabel>
                          </Grid>

                          <Grid item md={3} xs={12} style={{ marginTop: "1rem", }}>

                            <Chip
                              label={reqAmount}
                              color="secondary"
                              size="medium"
                              className={classes.chip}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>

                      <Grid container md={12} xs={12}>
                        <Grid item md={12} xs={12}>
                          <Box border={1} borderRadius={8} borderColor="green" {...currentProps1}>
                            <Grid container md={12} xs={12}>
                              <Grid container md={6} xs={12}>
                                <Grid item md={5} xs={6} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                  <InputLabel shrink id="previouseMonthAmount">Previous Month Amount</InputLabel>
                                </Grid>
                                <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                  <TextField
                                    fullWidth
                                    name="previouseMonthAmount"
                                    variant="outlined"
                                    value={approveList.previouseMonthAmount}
                                    onChange={(e) => handleChange(e)}
                                    size="small"
                                    InputProps={{ readOnly: previouseAvailableBalance <= 0 || IsBalancePaymetDone }}
                                    error={Boolean(touched.previouseMonthAmount && errors.previouseMonthAmount)}
                                    helperText={touched.previouseMonthAmount && errors.previouseMonthAmount}
                                    onBlur={handleBlur}
                                  />
                                </Grid>

                                <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                  <InputLabel shrink id="currentMonthAmount">Current Month Amount</InputLabel>
                                </Grid>
                                <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                  <TextField
                                    fullWidth
                                    name="currentMonthAmount"
                                    variant="outlined"
                                    value={approveList.currentMonthAmount}
                                    onChange={(e) => handleChange(e)}
                                    size="small"
                                    error={Boolean(touched.currentMonthAmount && errors.currentMonthAmount)}
                                    helperText={touched.currentMonthAmount && errors.currentMonthAmount}
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
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Box display="flex" justifyContent="flex-end" p={2}>
                              {inPending === true && permissionList.isApproveRejectEnabled ?
                                <Button
                                  color="secondary"
                                  variant="contained"
                                  style={{
                                    marginRight: "1rem",
                                  }}
                                  className={classes.colorReject}
                                  onClick={() => RejectAdvancePayment()}
                                >
                                  Reject
                                </Button>
                                : null}
                              {inPending === true && permissionList.isApproveRejectEnabled && !isDisable ?
                                <Button
                                  color="primary"
                                  type="submit"
                                  variant="contained"
                                  style={{
                                    marginRight: "1rem",
                                  }}
                                  className={classes.colorIssue}
                                  onClick={() => IssueAdvancePayment()}
                                  disabled={!isValid}
                                >
                                  Issue
                                </Button>
                                : null}
                              {inPending === true && permissionList.isSendToDeliverEnabled && !isDisable ?
                                <Button
                                  color="primary"
                                  type="submit"
                                  variant="contained"
                                  className={classes.colorSendToDeliver}
                                  onClick={() => SendToDeliverAdvancePayment()}
                                  disabled={!isValid}
                                >
                                  Send To Deliver
                                </Button>
                                : null}
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
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


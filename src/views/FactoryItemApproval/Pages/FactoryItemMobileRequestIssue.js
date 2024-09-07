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
import Chip from '@material-ui/core/Chip';
import AddIcon from '@material-ui/icons/Add';
import { LoadingComponent } from 'src/utils/newLoader';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { UserStatisticsComponent } from './../../UserStatistics/UserStatisticsExportComponent';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { CustomerPaymentDetailsComponent } from './../../Common/CustomerPaymentDetails/CustomerPaymentDetailsComponent';
import tokenService from '../../../utils/tokenDecoder';
import CountUp from 'react-countup';
import { fi, tr } from 'date-fns/locale';
import moment from 'moment';
import { CustomerPaymentDetailsNewComponent } from './../../Common/CustomerPaymentDetailsNewComponent/CustomerPaymentDetailsNewComponenet';
import FactoryItemIndividualReceipt from './../../Common/FactoryItemReceipt/FactoryItemIndividualReceipt';
import ReactToPrint from "react-to-print";
import MaterialTable from "material-table";

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
const screenCode = 'FACTORYITEMREQUESTAPPROVAL';

export default function FactoryItemMobileRequestIssue() {
    let factoryID = 0;
    let groupID = 0;
    let customerID = 0;
    let customerAccountID = 0;
    let customerRegistrationNumber = '';
    let customerNic = '';
    const ApprovalEnum = Object.freeze({ "Pending": 1, "Approve": 2, "Reject": 3, "Delivered": 4 })

    const { factoryItemRequestID } = useParams();
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
    const [ApprovedQuantity, setApprovedQuantity] = useState(0);
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
    const [IsActionFieldsDisable, setIsActionFieldsDisable] = useState(false)
    const [HideCardsInNewItemPage, setHideCardsInNewItemPage] = useState(true);
    const [IsMobileRequest, setIsMobileRequest] = useState(true);
    const [SubmitButtonStatue, setSubmitButtonStatue] = useState();
    const [userDetails, setUserDetails] = useState({});
    const [isFieldsEnabled, setIsFieldsEnabled] = useState(false);
    const [ItemCategoryList, setItemCategoryList] = useState();
    const [ItemCategoryID, setItemCategoryID] = useState(0);
    const [MinMonth, setMinMonth] = useState(new Date());
    const [balancePaymentData, setBalancePaymentData] = useState({
        lastBalancePaymentSchedule: '',
        firstTransactionDate: ''
    });
    const [FactoryItemDetails, setFactoryItemDetails] = useState({
        factoryItemRequestID: '',
        customerID: 0,
        customerAccountID: 0,
        factoryID: '0',
        itemCode: '',
        itemName: '',
        customerName: '',
        requestedQuantity: '',
        createdDate: '',
        approvedQuantity: '',
        reason: '',
        isActive: true,
        balance: '',
        registrationNumber: '',
        unitPrice: '',
        groupName: '',
        factoryName: ''
    });
    const [CustomerGeneralDetails, setCustomerGeneralDetails] = useState();
    const [permissionList, setPermissions] = useState({
        isFactoryItemChangeEnabled: true,
        isAdvanceRateChangeEnabled: true,
        isMonthlyBalanceChangeEnabled: true
    });
    const [approveList, setApproveList] = useState({
        groupID: '0',
        factoryID: '0',
        nic: '',
        regNumber: '',
        previouseMonthAmount: 0,
        currentMonthAmount: 0
    });
    const [factoryRequest, setFactoryRequest] = useState({
        groupID: '0',
        factoryID: '0',
        factoryItem: '0',
        quantity: '',
        routeID: '0',
        customerID: '0',
        registrationNumber: '0',
        isActive: true,
        grnID: '0',
        grnListID: '0',
        grnQuantity: 0
    });
    const [UserBasicDetails, setUserBasicDetails] = useState({
        FactoryItemRequestID: 0,
        FactoryID: 0,
        GroupID: 0,
        NIC: null,
        CustomerRegistrationNumber: '',
    });
    const [FactoryItemIssueObject, setFactoryItemIssueObject] = useState({
        factoryItemID: 0,
        supplierID: 0,
        enableInstalments: false,
        noOfInstalments: 0,
        paymentEffectedDate: new Date(),
        factoryItemGRNID: 0,
        factoryItemGRNQuantity: 0
    });
    const [FormDetails, setFormDetails] = useState({
        groupID: '0',
        factoryID: '0',
        registrationNumber: ''
    });

    const [RequestedFactoryItemDetails, setRequestedFactoryItemDetails] = useState({
        itemName: '',
        itemQuantity: ''
    })
    const [IsReceiptClick, setIsReceiptClick] = useState(false)
    const [NewFactoryItemList, setNewFActoryItemList] = useState([]);

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
    const [CurrentMonthDeductionDetailsList, setCurrentMonthDeductionDetailsList] = useState([])
    const [FactoryItemMobileRequestDetails, setFactoryItemMobileRequestDetails] = useState({
        balance: 0,
        customerAccountID: 0,
        customerID: 0,
        factoryID: 0,
        groupID: 0,
        nic: "0",
        registrationNumber: "0",
        routeID: 0,
        factoryItemDetailsList: []
    })
    const [DecryptedRequestID, setDecryptedRequestID] = useState("0")
    useEffect(() => {
        let decryptedFactoryItemRequestID = atob(factoryItemRequestID.toString());
        trackPromise(InitialGroupFactoryLoad());
        trackPromise(getPermission());
        trackPromise(getAllActiveItemCategory());
        if (parseInt(decryptedFactoryItemRequestID) === 0) {
            setIsUserFieldsDisabled(false);
            setIsMobileRequest(false);
        } else {
            setDecryptedRequestID(decryptedFactoryItemRequestID);
            setIsMobileRequest(true);
            setHideCardsInNewItemPage(false)
            trackPromise(getApproveDetailsByItemRequestID(decryptedFactoryItemRequestID));
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
        trackPromise(GetAllFactoryByItemCategoryID())
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

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'APPROVEFACTORYITEMREQUESTAPPROVAL');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isFactoryItemChangeEnabled = permissions.find(p => p.permissionCode === 'FACTORYITEMPERMISSION');
        var isAdvanceRateChangeEnabled = permissions.find(p => p.permissionCode == "ADVANCERATECHANGEPERMISSION");
        var isMonthlyBalanceChangeEnabled = permissions.find(p => p.permissionCode == "MONTHLYBALANCECHANGINGPERMISSION");
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isFactoryItemChangeEnabled: isFactoryItemChangeEnabled !== undefined,
            isAdvanceRateChangeEnabled: isAdvanceRateChangeEnabled !== undefined,
            isMonthlyBalanceChangeEnabled: isMonthlyBalanceChangeEnabled !== undefined,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
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
            convertedDate.setMonth(tempMonth[1]);
            convertedDate.setFullYear(tempMonth[0]);
            return moment(convertedDate).format();
        }
        //  else if (balancePaymentData.firstTransactionDate !== null) {
        //     tempMonth = balancePaymentData.firstTransactionDate.split('/');
        //     convertedDate.setMonth(--tempMonth[1])
        //     return moment(convertedDate).format();
        // } 
        else {
            return moment(convertedDate).format();
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
        const res = response.filter((el) => {
            return FactoryItemMobileRequestDetails.factoryItemDetailsList.some((f) => {
                return el.id === f.factoryItemID;
            });
        });
        setFactoryItemList(res);
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
    }
    //Balance Component Required functions

    async function getApproveDetailsByItemRequestID(factoryItemRequestID) {
        let resposne = await services.GetMobileRequestDetailsByOrderNo(factoryItemRequestID);
        let data = resposne[0];

        let customerAccountBalance = await services.getCustomerAccountBalance(data.customerID, data.customerAccountID);
        let customerBalance = customerAccountBalance.balance;

        let approveItemDetails = {
            balance: customerBalance,
            customerAccountID: data.customerAccountID,
            customerID: data.customerID,
            factoryID: data.factoryID,
            groupID: data.groupID,
            nic: data.nic,
            registrationNumber: data.registrationNumber,
            routeID: data.routeID,
            factoryItemDetailsList: resposne.map((object) => ({
                "factoryItemID": object.factoryItemID,
                "requestedQuantity": object.requestedQuantity,
                "itemName": object.itemName,
                "itemCode": object.itemCode
            })),
        }

        setFactoryItemMobileRequestDetails(approveItemDetails)
        setRunningBalance(approveItemDetails.balance);

        let customerGeneralResponse = await services.getCustomerGeneralDetails(approveItemDetails.customerID);
        setCustomerGeneralDetails(customerGeneralResponse.data[0]);

        setUserBasicDetails({
            FactoryID: approveItemDetails.factoryID,
            GroupID: approveItemDetails.groupID,
            CustomerRegistrationNumber: approveItemDetails.registrationNumber,
            NIC: approveItemDetails.nic
        });

        let model = {
            regNumber: approveItemDetails.registrationNumber,
            groupID: approveItemDetails.groupID,
            factoryID: approveItemDetails.factoryID,
            nic: null
        }

        trackPromise(searchCustomerBalanceDetails(model));

        setFormDetails({
            ...FormDetails,
            groupID: approveItemDetails.groupID,
            factoryID: approveItemDetails.factoryID,
            registrationNumber: approveItemDetails.registrationNumber
        });

        setApproveList({
            ...approveList,
            regNumber: approveItemDetails.registrationNumber,
            groupID: approveItemDetails.groupID,
            factoryID: approveItemDetails.factoryID,
            nic: approveItemDetails.nic
        });

        const cusResponse = await services.GetCustomerAccountBalanceByIDs(approveItemDetails.factoryID, approveItemDetails.groupID, approveItemDetails.registrationNumber);
        setUserDetails(cusResponse);

    }

    function chechStatus(data) {
        if (data == ApprovalEnum.Approve || data == ApprovalEnum.Reject || data == ApprovalEnum.Delivered) {
            setIsFieldsEnabled(true);
        }
    }

    const SendToDeliveryBtnStaus = () => {
        setSubmitButtonStatue(true);
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
        if (IsReceiptClick === false) {
            //Validation Insufficent Balanece code segemet removed from here to avoid a blocker '2021-06-26'
            let decryptedFactoryItemRequestID = atob(factoryItemRequestID.toString());
            if (factoryItemGrnArray.length > 0) {
                if (FactoryItemIssueObject.enableInstalments === true && parseInt(FactoryItemIssueObject.noOfInstalments) === 1) {
                    alert.error("Please add more than one instalment");
                }
                else {
                    setIsActionFieldsDisable(true);
                    let approveModel = {
                        factoryItemID: FactoryItemIssueObject.factoryItemID,
                        factoryItemRequestID:
                            FactoryItemDetails.factoryItemRequestID.length === 0 ? 0 : FactoryItemDetails.factoryItemRequestID,
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
                        orderNo: parseInt(decryptedFactoryItemRequestID)
                    }

                    if (SubmitButtonStatue === true) {
                        approveModel.statusTypeID = 4;
                        const response = await services.FactoryItemRequestApproval(approveModel);
                        if (response.statusCode == "Success") {
                            alert.success("Factory Item Request send to delivery Successfully");
                            clearData();
                            navigate("/app/factoryItemApproval/listing");
                        }
                        else {
                            alert.error("Error Occured in Factory  Item Request send to delivery");
                            setIsActionFieldsDisable(false);
                        }
                    } else {
                        approveModel.statusTypeID = 2;
                        const response = await services.FactoryItemRequestApproval(approveModel);
                        if (response.statusCode == "Success") {
                            SetFactoryItemReceipt(response.data)
                            alert.success("Factory Item Request Issued Successfully");
                            // clearData();
                            //navigate("/app/factoryItemApproval/listing");
                        }
                        else {
                            setIsPrintButtonDisabled(true);
                            alert.error("Error Occured in Factory Item Request Issue");
                            setIsActionFieldsDisable(false);
                        }
                    }
                }
            } else {
                alert.error("Please add atleast one item");
                setIsActionFieldsDisable(false);
            }
        }
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

        setUserBasicDetails({
            ...UserBasicDetails,
            FactoryItemRequestID: 0,
            FactoryID: 0,
            GroupID: 0,
            NIC: null,
            CustomerRegistrationNumber: ''
        });

        setHideCardsInNewItemPage(true);
        setFactoryItemGrnArray([]);
        setFinalTotal(0);
        setTotalItemQuantity(0);

        setFactoryItemIssueObject({
            ...factoryItemGrnArray,
            factoryItemID: 0,
            supplierID: 0,
            enableInstalments: false,
            noOfInstalments: 0,
            paymentEffectedDate: new Date(),
            factoryItemGRNID: 0,
            factoryItemGRNQuantity: 0
        });

        setFormDetails({
            ...FormDetails,
            registrationNumber: ''
        })
    }

    async function rejectButtonClick() {
        setIsActionFieldsDisable(true);
        let dataModel = {
            OrderNO: parseInt(DecryptedRequestID),
            GroupID: parseInt(FormDetails.groupID),
            FactoryID: parseInt(FormDetails.factoryID),
            ModifiedBy: tokenService.getUserIDFromToken(),
        }
        let response = await services.RejectFactoryItemMobileRequestByOrderID(dataModel)
        if (response.statusCode == "Success") {
            alert.success("Factory Item Request Rejected Successfully");
            setTimeout(function () {
                navigate('/app/factoryItemApproval/listing');
            }, 2000);
        }
        else {
            alert.error("Error Occured in Factory Item Request Reject");
            setIsActionFieldsDisable(true);
        }
    }

    function calculateApprovedTotalAmount() {
        let totalAmount = parseFloat(CurrentMonthAllowedAmount) + parseFloat(PreviousMonthAllowedAmount);
        isNaN(totalAmount) || totalAmount == 0 ? setApprovedTotalAmount(0) : setApprovedTotalAmount(totalAmount);
    }

    async function searchUserBasicDetails() {
        setIsReceiptClick(false);
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

        setIsPrintButtonDisabled(true);

        var validate = /^[1-9]\d*$/;
        if (!validate.test(FormDetails.registrationNumber)) {
            setHideCardsInNewItemPage(true)
            return;
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
        } else {
            alert.error("Mandatory fields are required")
        }

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
        else if (!validate.test(FormDetails.registrationNumber)) {
            setHideCardsInNewItemPage(true)
            return;
        } else {
            var active = await checkCustomerIsActive();

            if (active) {

                customerAccountBalance = await services.getCustomerAccountBalance(response.customerID, response.customerAccountID);
                setHideCardsInNewItemPage(false)
            }
            else {
                setHideCardsInNewItemPage(true)
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
                        <Chip label={"Date : " + new Date(item.createdDate).toLocaleDateString()} />
                        <Chip label={" Supplier Name : " + item.supplierName} />
                        <Chip label={" Unit Ptice Rs : " + item.unitPrice} />
                        <Chip label={" Available Quantity : " + item.availableQuantity} />
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

    async function sortFactoryItemGRNObject() {
        var filteredObject = FactoryItemGRNList.find(x => x.factoryItemGRNID == FactoryItemIssueObject.factoryItemGRNID);
        setSortArray(filteredObject);
    }

    async function AddItems(values) {
        if (FactoryItemIssueObject.factoryItemGRNID > 0 && FactoryItemIssueObject.factoryItemGRNQuantity > 0) {

            parseFloat(FactoryItemIssueObject.factoryItemGRNQuantity)
            var totalQuantity = TotalItemQuantity + parseFloat(FactoryItemIssueObject.factoryItemGRNQuantity);
            let factoryItemObject = FactoryItemMobileRequestDetails.factoryItemDetailsList.find(x => x.factoryItemID === FactoryItemIssueObject.factoryItemID)
            var factoryGrnRemainQty = FactoryItemGRNList.find(x => x.factoryItemGRNID === values.factoryItemGRNID)

            if (parseFloat(factoryItemObject.requestedQuantity) < parseFloat(values.factoryItemGRNQuantity)) {
                alert.error("Quantity exceed");
                return;
            } else if (parseFloat(factoryGrnRemainQty.availableQuantity) < parseFloat(values.factoryItemGRNQuantity)) {
                alert.error("Grn Quantity exceed");
                return;
            } else {

                var supDetail = SupplierList.find(x => x.id === sortArray.supplierID);

                let model = {
                    grnNumber: sortArray.factoryItemGRNNumber,
                    itemQuantity: parseFloat(FactoryItemIssueObject.factoryItemGRNQuantity),
                    price: parseFloat(FactoryItemIssueObject.factoryItemGRNQuantity * sortArray.unitPrice),
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
                    factoryItemTotalPrice: parseFloat(FactoryItemIssueObject.factoryItemGRNQuantity * sortArray.unitPrice)
                }

                await InsertFactoryItemsDetials(factoryItemModel)

                const index = factoryItemGrnArray.findIndex((element) => element.factoryItemGRNID === model.factoryItemGRNID);

                if (index >= 0) {
                    factoryItemGrnArray[index]["price"] += model.price;
                    factoryItemGrnArray[index]["itemQuantity"] += model.itemQuantity;
                } else {
                    factoryItemGrnArray.push(model)
                }

                setFactoryItemIssueObject({ ...FactoryItemIssueObject, factoryItemGRNID: 0, factoryItemGRNQuantity: 0 });

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
                        }}
                        validationSchema={
                            Yup.object().shape({
                                registrationNumber: Yup.string().required('registration number is required').typeError('Enter valid registration number').matches(/^[0-9]{0,15}$/, 'Please enter valid registration number'),
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
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="groupID"
                                                            size='small'
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
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="factoryID"
                                                            size='small'
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
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="registrationNumber">
                                                            Registration Number *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="registrationNumber"
                                                            size='small'
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
                        }}
                        validationSchema={
                            Yup.object().shape({
                                factoryItemID: Yup.number().min(1, "Please Select a Factory Item").required('Factory Item is required'),
                                supplierID: Yup.number().min(1, "Please Select a Supplier").required('Supplier is required'),
                                paymetEffectedMonth: Yup.date().required("Please Provide the Date"),
                                noOfInstalments: Yup.string().matches(/^(?!(?:1)$)\d+/, "Need more than one instalment").matches(/^[^\.]+$/, "Please enter a valid value for instalments"),
                                factoryItemGRNQuantity: Yup.string().matches(/^[0-9]*(\.[0-9]{0,1})?$/, 'Only allow numbers with one decimal place')
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
                                                        HideCardsInNewItemPage === false ? <>
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

                                                            <Grid container spacing={3}>
                                                                <Grid item md={12} xs={12}>
                                                                    <UserStatisticsComponent
                                                                        UserDetails={UserBasicDetails}
                                                                    />
                                                                </Grid>
                                                            </Grid>

                                                            <Grid container spacing={3}>
                                                                <Grid item md={12} xs={12}>
                                                                    <Box>
                                                                        <MaterialTable
                                                                            title="Multiple Actions Preview"
                                                                            columns={[
                                                                                { title: 'Item Code', field: 'itemCode' },
                                                                                { title: 'Item Name', field: 'itemName' },
                                                                                { title: 'Item Quantity', field: 'requestedQuantity' }
                                                                            ]}
                                                                            data={FactoryItemMobileRequestDetails.factoryItemDetailsList}
                                                                            options={{
                                                                                exportButton: false,
                                                                                showTitle: false,
                                                                                search: false,
                                                                                headerStyle: { textAlign: "left", height: 10 },
                                                                                cellStyle: { textAlign: "left" },
                                                                                columnResizable: false,
                                                                                actionsColumnIndex: -1,
                                                                                maxBodyHeight: 200
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                </Grid>
                                                            </Grid>

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
                                                                                        fullWidth
                                                                                        name="itemCategoryID"
                                                                                        onChange={(e) => handleItemCategoryChange(e)}
                                                                                        value={ItemCategoryID}
                                                                                        variant="outlined" >
                                                                                        <MenuItem value={0} disabled={true}>--Select Item Category--</MenuItem>
                                                                                        {generateDropDownMenu(ItemCategoryList)}
                                                                                    </TextField>
                                                                                </Grid>
                                                                                <Grid item md={4} xs={12}>
                                                                                    <InputLabel shrink id="factoryItemID">
                                                                                        Factory Item*
                                                                                    </InputLabel>
                                                                                    <TextField select
                                                                                        error={Boolean(touched.factoryItemID && errors.factoryItemID)}
                                                                                        fullWidth
                                                                                        helperText={touched.factoryItemID && errors.factoryItemID}
                                                                                        name="factoryItemID"
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
                                                                                        Supplier*
                                                                                    </InputLabel>
                                                                                    <TextField select
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
                                                                                    >
                                                                                        <MenuItem value="0">--Select Supplier--</MenuItem>
                                                                                        {generateDropDownItemListDropDown(SupplierList)}
                                                                                    </TextField>
                                                                                </Grid>
                                                                            </Grid>
                                                                            <br />
                                                                            <Grid container spacing={3}>
                                                                                <Grid item md={9} xs={12}>
                                                                                    <InputLabel shrink id="factoryItemGRNID">
                                                                                        GRN List *
                                                                                    </InputLabel>
                                                                                    <TextField select
                                                                                        error={Boolean(touched.factoryItemGRNID && errors.factoryItemGRNID)}
                                                                                        fullWidth
                                                                                        helperText={touched.factoryItemGRNID && errors.factoryItemGRNID}
                                                                                        name="factoryItemGRNID"
                                                                                        onChange={(event) => handleChangeFactoryItemIssue(event)}
                                                                                        value={values.factoryItemGRNID}
                                                                                        variant="outlined"
                                                                                        id="factoryItemGRNID"
                                                                                    >
                                                                                        <MenuItem value="0">--Select Factory Item GRN--</MenuItem>
                                                                                        {generateFactoryItemDRNDropDownItelList(FactoryItemGRNList)}
                                                                                    </TextField>
                                                                                </Grid>

                                                                                <Grid item md={2} xs={12}>
                                                                                    <InputLabel shrink id="factoryItemGRNQuantity">
                                                                                        Quantity *
                                                                                    </InputLabel>
                                                                                    <TextField
                                                                                        type="number"
                                                                                        error={Boolean(touched.factoryItemGRNQuantity && errors.factoryItemGRNQuantity)}
                                                                                        fullWidth
                                                                                        helperText={touched.factoryItemGRNQuantity && errors.factoryItemGRNQuantity}
                                                                                        name="factoryItemGRNQuantity"
                                                                                        onChange={(e) => handleChangeFactoryItemIssue(e)}
                                                                                        value={values.factoryItemGRNQuantity}
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
                                                                                        style={{ marginTop: '2.5rem', marginLeft: '1rem' }}
                                                                                        onClick={() => AddItems(values)}
                                                                                    >
                                                                                        <AddIcon />
                                                                                    </Button>
                                                                                </Box>
                                                                            </Grid>
                                                                            <CardContent>
                                                                                {
                                                                                    factoryItemGrnArray.length > 0 ?
                                                                                        <div maxheight={'10rem'}>
                                                                                            <PerfectScrollbar>
                                                                                                <Box minWidth={1050} border={2}>
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
                                                                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                                                        {rowData.supplierName}
                                                                                                                    </TableCell>
                                                                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                                                        {rowData.grnNumber}
                                                                                                                    </TableCell>
                                                                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                                                        {rowData.itemQuantity}
                                                                                                                    </TableCell>
                                                                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                                                        <CountUp decimals={2} separator=',' start={rowData.price} end={rowData.price} duration={0} />
                                                                                                                    </TableCell>
                                                                                                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
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

                                                                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                                                                {
                                                                                                    factoryItemGrnArray.length > 0 ? <>
                                                                                                        <Grid container md={6} xs={12}>
                                                                                                            <Grid item md={4} xs={6} style={{ marginTop: "1.3rem" }}>
                                                                                                                <InputLabel style={{ marginTop: '0.1rem', textAlign: 'right', fontSize: '1.3rem', fontWeight: 'bold' }}> Total Quantity</InputLabel>
                                                                                                            </Grid>
                                                                                                            <Grid item md={2} xs={12} style={{ marginTop: '1rem' }}>
                                                                                                                <InputLabel style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                                                                                                    <CountUp decimals={1} start={TotalItemQuantity} end={TotalItemQuantity} duration={1} />
                                                                                                                </InputLabel>
                                                                                                            </Grid>

                                                                                                            <Grid item md={3} xs={6} style={{ marginTop: "1.3rem" }}>
                                                                                                                <InputLabel style={{ marginTop: '0.1rem', textAlign: 'right', fontSize: '1.3rem', fontWeight: 'bold' }}> Total Price</InputLabel>
                                                                                                            </Grid>
                                                                                                            <Grid item md={3} xs={12} style={{ marginTop: '1rem' }}>
                                                                                                                <InputLabel style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                                                                                                    <CountUp decimals={2} separator=',' end={finalTotal} duration={1} />
                                                                                                                </InputLabel>
                                                                                                            </Grid>
                                                                                                        </Grid></>
                                                                                                        : null
                                                                                                }
                                                                                            </Box>
                                                                                        </div>
                                                                                        :
                                                                                        null
                                                                                }
                                                                            </CardContent>
                                                                            <Grid container spacing={3}>
                                                                                <Grid item md={3} xs={12}>
                                                                                    <InputLabel shrink id="enableInstalments">
                                                                                        Enable Instalments
                                                                                    </InputLabel>
                                                                                    <Switch
                                                                                        checked={values.enableInstalments}
                                                                                        onChange={(e) => handleChangeFactoryItemIssue(e)}
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
                                                                                        Payment Effective Month*
                                                                                    </InputLabel>
                                                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                                                        <KeyboardDatePicker
                                                                                            error={Boolean(touched.paymetEffectedMonth && errors.paymetEffectedMonth)}
                                                                                            fullWidth
                                                                                            minDate={MinMonth}
                                                                                            helperText={touched.paymetEffectedMonth && errors.paymetEffectedMonth}
                                                                                            variant="inline"
                                                                                            openTo="month"
                                                                                            views={["year", "month"]}
                                                                                            id="paymetEffectedMonth"
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
                                                        </> : null}
                                                </CardContent>
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    {IsPrintButtonDisabled ?
                                                        <>
                                                            <Button
                                                                color="secondary"
                                                                variant="contained"
                                                                onClick={() => rejectButtonClick()}
                                                                className={classes.btnReject}
                                                                disabled={IsActionFieldsDisable}
                                                            >
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                type="submit"
                                                                color="primary"
                                                                variant="contained"
                                                                className={classes.btnSendToDel}
                                                                onClick={SendToDeliveryBtnStaus}
                                                                disabled={IsActionFieldsDisable}
                                                            >
                                                                Send To Delivery
                                                            </Button>
                                                        </> : null
                                                    }
                                                    {!IsPrintButtonDisabled ?
                                                        <div>
                                                            <ReactToPrint
                                                                documentTitle={"Factory Item Payment Receipt"}
                                                                trigger={() =>
                                                                    <Button
                                                                        color="primary"
                                                                        type="submit"
                                                                        variant="contained"
                                                                        size="medium"
                                                                        style={{ marginRight: '0.5rem' }}
                                                                        onClick={setIsReceiptClick(true)}
                                                                    >
                                                                        Print Receipt
                                                                    </Button>
                                                                }
                                                                content={() => componentRef.current}
                                                                onAfterPrint={() => navigate("/app/factoryItemApproval/listing")}
                                                            />
                                                            <div hidden={true}>
                                                                <FactoryItemIndividualReceipt ref={componentRef} data={FactoryItemPaymentReciptDetails} />
                                                            </div>
                                                        </div> : null
                                                    }
                                                    {IsPrintButtonDisabled ?

                                                        <Button
                                                            type="submit"
                                                            color="primary"
                                                            variant="contained"
                                                            className={classes.btnIssue}
                                                            onClick={IssueBtnStaus}
                                                            disabled={IsActionFieldsDisable}
                                                        >
                                                            Issue
                                                        </Button> : null
                                                    }
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

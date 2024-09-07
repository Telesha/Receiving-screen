import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
 Box, Card, Grid, Button,InputLabel, TextField, MenuItem, makeStyles,  Switch, Container, CardHeader, CardContent, Divider} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import tokenDecoder from 'src/utils/tokenDecoder';
import { Formik } from 'formik';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import authService from 'src/utils/permissionAuth';
import { useAlert } from "react-alert";
const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    btnApprove: {
        backgroundColor: "green",
        marginLeft: "1rem",
    },
    btnReject: {
        backgroundColor: "red",
        marginLeft: "1rem",
    },
}));


const screenCode = 'GLMAPPINGLISTING';
export default function GLMappingApproveReject(props) {

    const alert = useAlert();
    const { transactionTypeID, groupID, factoryID } = useParams();
    const navigate = useNavigate();
    const classes = useStyles();
    const [IsNewRequest, setIsNewRequest] = useState(true)
    const [GroupList, setGroupList] = useState();
    const [FactoryList, setFactoryList] = useState();
    const [TransactionTypeList, setTransactionTypeList] = useState()
    const [PageTitle, setPageTitle] = useState("GL Mapping Request")
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: true,
        isFactoryFilterEnabled: true
    });
    const [FormDetails, setFormDetails] = useState({ 
        groupID: 0,
        factoryID: 0, 
        isActive: true,
        isMonthlyAccountsEnabledCredit: false,
        isMonthlyAccountsEnabledDebit: false, 
        debitMappingType: 0,
        debitAccountTypeID:0,
        debitParentHeaderID:0,
        debitChildHeaderID:0, 
        creditMappingType: 0, 
        creditAccountTypeID:0,
        creditParentHeaderID:0,
        creditChildHeaderID:0,
        debitLedgerAccountID:0,
        creditLedgerAccountID:0,
        debitLedgerAccountName:'',
        creditLedgerAccountName:'',
        transactionTypeID: 0
    });

    const [InitialEditDetails,setInitialEditDetails] = useState({
        groupID: 0,
        factoryID: 0,
        transactionTypeID: 0,
        isActive: true,
        isMonthlyAccountsEnabledCredit: false,
        isMonthlyAccountsEnabledDebit: false, 
        debitMappingType: 0,
        debitAccountTypeID:0,
        debitParentHeaderID:0,
        debitChildHeaderID:0, 
        creditMappingType: 0, 
        creditAccountTypeID:0,
        creditParentHeaderID:0,
        creditChildHeaderID:0,
        debitLedgerAccountID:0,
        creditLedgerAccountID:0,
        ebitLedgerAccountName:'',
        creditLedgerAccountName:'',
        monthlyDebitAccountList:[],
        monthlyCreditAccountList:[]
    });
    const [CreditAccountList, setCreditAccountList] = useState([]);
    const [DebitAccountList, setDebitAccountList] = useState([]);
    const [AllLedgerAccountList, setAllLedgerAccountList] = useState([]); 
    const [IsButtonDisabled, setIsButtonDisabled] = useState(false)
    const [Remarks, setRemarks] = useState(); 
    const [ApplicableYear, setApplicableYear] = useState()
    const [SelectedCreditAccount, setSelectedCreditAccount] = useState({});
    const [SelectedDebitAccount, setSelectedDebitAccount] = useState({});
    const [TempCreditAcc, setTempCreditAcc] = useState();
    const [TempDebittAcc, setTempDebittAcc] = useState();

    const [debitAccountTypeDetailNames, setDebitAccountTypeDetailNames] = useState();    
    const [debitParentHeaderDetailNames, setDebitParentHeaderDetailNames] = useState();
    const [debitChildHeaderDetailNames, setDebitChildHeaderDetailNames] = useState();

    const [debitAccountTypeNames, setDebitAccountTypeNames] = useState();    
    const [debitParentHeaderNames, setDebitParentHeaderNames] = useState();
    const [debitChildHeaderNames, setDebitChildHeaderNames] = useState();

    const [creditAccountTypeDetailNames, setCreditAccountTypeDetailNames] = useState();
    const [creditParentHeaderDetailNames, setCreditParentHeaderDetailNames] = useState();
    const [creditChildHeaderDetailNames, setCreditChildHeaderDetailNames] = useState();
    const [DebitAllLedgerAccountList, setDebitAllLedgerAccountList] = useState([]);
    const [CreditAllLedgerAccountList, setCreditAllLedgerAccountList] = useState([]);
    
    const [creditAccountTypeNames, setCreditAccountTypeNames] = useState();
    const [creditParentHeaderNames, setCreditParentHeaderNames] = useState();
    const [creditChildHeaderNames, setCreditChildHeaderNames] = useState();

    let monthlyLedgerAccountTemplate = [
        { monthNumber: 1, monthName: 'January', creditAccount: 0, debitAccount: 0 },
        { monthNumber: 2, monthName: 'February', creditAccount: 0, debitAccount: 0 },
        { monthNumber: 3, monthName: 'March', creditAccount: 0, debitAccount: 0 },
        { monthNumber: 4, monthName: 'April', creditAccount: 0, debitAccount: 0 },
        { monthNumber: 5, monthName: 'May', creditAccount: 0, debitAccount: 0 },
        { monthNumber: 6, monthName: 'June', creditAccount: 0, debitAccount: 0 },
        { monthNumber: 7, monthName: 'July', creditAccount: 0, debitAccount: 0 },
        { monthNumber: 8, monthName: 'August', creditAccount: 0, debitAccount: 0 },
        { monthNumber: 9, monthName: 'September', creditAccount: 0, debitAccount: 0 },
        { monthNumber: 10, monthName: 'October', creditAccount: 0, debitAccount: 0 },
        { monthNumber: 11, monthName: 'November', creditAccount: 0, debitAccount: 0 },
        { monthNumber: 12, monthName: 'December', creditAccount: 0, debitAccount: 0 }
    ];
    let months = [
        { monthNumber: 1, monthName: 'January'},
        { monthNumber: 2, monthName: 'February'},
        { monthNumber: 3, monthName: 'March'},
        { monthNumber: 4, monthName: 'April'},
        { monthNumber: 5, monthName: 'May'},
        { monthNumber: 6, monthName: 'June'},
        { monthNumber: 7, monthName: 'July'},
        { monthNumber: 8, monthName: 'August'},
        { monthNumber: 9, monthName: 'September'},
        { monthNumber: 10, monthName: 'October'},
        { monthNumber: 11, monthName: 'November'},
        { monthNumber: 12, monthName: 'December'}
    ]

    const [debitMonthlyAccountDetails, setDebitMonthlyAccountDetails] = useState(monthlyLedgerAccountTemplate)
    const [creditMonthlyAccountDetails, setCreditMonthlyAccountDetails] = useState(monthlyLedgerAccountTemplate)
    const [SelectedCreditLedgerAccountCode, setSelectedCreditLedgerAccountCode] = useState();
    const [SelectedDebitLedgerAccountCode, setSelectedDebitLedgerAccountCode] = useState();

    let decryptedTransactionTypeID = 0;
    let decryptedGroupID = 0;
    let decryptedFactoryID = 0;
    let AccountList = [];

    const handleClick = () => {
        navigate('/app/glmapping/listing');
    }
    const loadFactory = (event) => {
        trackPromise(getFactoryByGroupID(event.target.value));
    };
    const loadLedgerAccounts = (event) => {
        trackPromise(GetApprovedLedgerAccountDetails(FormDetails.groupID, event.target.value));
    };
    const HandleApproveGLMappingDetails = (value) => {
        setIsButtonDisabled(true);
        trackPromise(ApproveGLMappingDetails(value));
    }
    const HandleRejectGLMappingDetails = (value) => {
        if (Remarks === '' || Remarks === undefined) {
            alert.error("Please provide a remark");
            return;
        }
        setIsButtonDisabled(true);
        trackPromise(RejectGLMappingDetails(value));
    }

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getAllGroups());
        trackPromise(getFactoryByGroupID(tokenDecoder.getGroupIDFromToken()));
        trackPromise(GetTransactionTypeList());
        trackPromise(GetApprovedLedgerAccountDetails(tokenDecoder.getGroupIDFromToken(), tokenDecoder.getFactoryIDFromToken()));

        decryptedTransactionTypeID = atob(transactionTypeID.toString());
        decryptedGroupID = atob(groupID.toString());
        decryptedFactoryID = atob(factoryID.toString());

        if (decryptedTransactionTypeID != 0) {
            setFormDetails({
                ...FormDetails,
                groupID: parseInt(decryptedGroupID),
                factoryID: parseInt(decryptedFactoryID)
            });
            setIsNewRequest(false);
            trackPromise(GetGLMappingAccountDetailsByTransactionTypeID(decryptedTransactionTypeID, decryptedGroupID, decryptedFactoryID));
        }

    }, []);

    useEffect(() => {  
        if(!IsNewRequest){
               setFormDetails({
                   ...FormDetails,
                   debitAccountTypeID:InitialEditDetails.debitAccountTypeID,
                   debitParentHeaderID:InitialEditDetails.debitParentHeaderID,
                   debitChildHeaderID:InitialEditDetails.debitChildHeaderID,
                   creditAccountTypeID:InitialEditDetails.creditAccountTypeID,
                   creditParentHeaderID:InitialEditDetails.creditParentHeaderID,
                   creditChildHeaderID:InitialEditDetails.creditChildHeaderID,
                   debitLedgerAccountID:InitialEditDetails.debitLedgerAccountID,
                   creditLedgerAccountID:InitialEditDetails.creditLedgerAccountID,
                   debitLedgerAccountName:InitialEditDetails.debitLedgerAccountName,
                   creditLedgerAccountName:InitialEditDetails.creditLedgerAccountName,
                   isMonthlyAccountsEnabledCredit:InitialEditDetails.isMonthlyAccountsEnabledCredit,
                   isMonthlyAccountsEnabledDebit:InitialEditDetails.isMonthlyAccountsEnabledDebit
               }) 
            
               if(InitialEditDetails.monthlyDebitAccountList.length>0){
                   let debitAccountListArray = [];
                   var debitIndex = 1;  
                   InitialEditDetails.monthlyDebitAccountList.forEach((element) => { 
                      debitAccountListArray.push({
                           monthNumber: debitIndex++,
                           monthName: months.find(x=>x.monthNumber==parseInt(element.applicableMonth)).monthName,
                           debitAccount: element.ledgerAccountID,
                           creditAccount: 0
                       });
                   });  
                   setDebitMonthlyAccountDetails(debitAccountListArray);
               }

               if(InitialEditDetails.monthlyCreditAccountList.length>0){
                let creditAccountListArray = [];
                var creditIndex = 1;  
                InitialEditDetails.monthlyCreditAccountList.forEach((element) => {
                   creditAccountListArray.push({
                        monthNumber: creditIndex++,
                        monthName: months.find(x=>x.monthNumber==parseInt(element.applicableMonth)).monthName,
                        debitAccount: 0,
                        creditAccount: element.ledgerAccountID
                    });
                });  
                setCreditMonthlyAccountDetails(creditAccountListArray);
               }
        } 
   }, [InitialEditDetails])

   //Debit Section
   useEffect(() => {  
    if(FormDetails.debitMappingType>0){
        ClearDebitLedgerSectionFields(); 
        trackPromise(getDebitAccountTypeNamesForDropdown())  
    }     
}, [FormDetails.debitMappingType])

useEffect(() => {        
    if (parseInt(FormDetails.debitMappingType) !== 1) { 
        trackPromise(getDebitParentHeadersByAccountTypeID(FormDetails.debitAccountTypeID))
    }
}, [FormDetails.debitAccountTypeID])

useEffect(() => {        
    if (parseInt(FormDetails.debitMappingType) !== 2) {  
        trackPromise(getDebitChildHeadersByParentTypeID(FormDetails.debitParentHeaderID))
    }
}, [FormDetails.debitParentHeaderID])

useEffect(() => {  
    if(FormDetails.debitChildHeaderID>0){
        trackPromise(GetApprovedLedgerAccountDetailsDebit())
    }
}, [FormDetails.debitChildHeaderID]) 

useEffect(() => { 
    if(FormDetails.isMonthlyAccountsEnabledDebit === true){ 
        setSelectedDebitAccount({})
        setSelectedDebitLedgerAccountCode({})
    }else{
         setDebitMonthlyAccountDetails(monthlyLedgerAccountTemplate)
    }
}, [FormDetails.isMonthlyAccountsEnabledDebit])   

//Credit Section
useEffect(() => {  
    if(FormDetails.creditMappingType>0){
        ClearCreditLedgerSectionFields()
        trackPromise(getCreditAccountTypeNamesForDropdown()) 
    } 
}, [FormDetails.creditMappingType])

useEffect(() => {   
    if (parseInt(FormDetails.creditMappingType) !== 1) { 
        trackPromise(getCreditParentHeadersByAccountTypeID(FormDetails.creditAccountTypeID))
    }
}, [FormDetails.creditAccountTypeID])

useEffect(() => {         
    if (parseInt(FormDetails.creditMappingType) !== 2) {  
        trackPromise(getCreditChildHeadersByParentTypeID(FormDetails.creditParentHeaderID))
    }
}, [FormDetails.creditParentHeaderID])

useEffect(() => { 
    if(FormDetails.creditChildHeaderID>0){
        trackPromise(GetApprovedLedgerAccountDetailsCredit())  
    }
}, [FormDetails.creditChildHeaderID])  

useEffect(() => { 
    if(FormDetails.isMonthlyAccountsEnabledCredit === true){ 
        setSelectedCreditAccount({})
        setSelectedCreditLedgerAccountCode({})
    }else{
         setCreditMonthlyAccountDetails(monthlyLedgerAccountTemplate)
    }
}, [FormDetails.isMonthlyAccountsEnabledCredit]) 

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode === 'APPROVEREJECTGLMAPPINGREQUEST');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });
    }

    async function GetTransactionTypeList() {
        const result = await services.GetTransactionTypeDetails();
        setTransactionTypeList(result);
    }

    async function getAllGroups() {
        var response = await services.GetAllGroups();
        setGroupList(response);
    };

    async function getFactoryByGroupID(groupID) {
        var response = await services.GetFactoryByGroupID(groupID);
        setFactoryList(response);
    };

    async function RejectGLMappingDetails(value) {

        let rejectModel = {
            factoryID: FormDetails.factoryID,
            groupID: FormDetails.groupID,
            transactionTypeID: FormDetails.transactionTypeID,
            modifiedBy: tokenDecoder.getUserIDFromToken(),
            remarks: Remarks,
            isApproved: false,
            applicableYear: ApplicableYear
        }

        const response = await services.RejectGLMappingRequest(rejectModel);

        if (response.statusCode == "Success") {
            alert.success(response.message);
            setTimeout(() => { navigate('/app/glmapping/listing'); }, 1000)
        }
        else {
            alert.error(response.message);
            setIsButtonDisabled(false)
        }

    }

    async function ApproveGLMappingDetails(value) {

        let approveModel = {
            factoryID: FormDetails.factoryID,
            groupID: FormDetails.groupID,
            transactionTypeID: FormDetails.transactionTypeID,
            modifiedBy: tokenDecoder.getUserIDFromToken(),
            remarks: Remarks,
            isApproved: true,
            applicableYear: ApplicableYear
        }

        const response = await services.ApproveGLMappingRequest(approveModel);

        if (response.statusCode == "Success") {
            alert.success(response.message);
            setTimeout(() => { navigate('/app/glmapping/listing'); }, 1000)
        }
        else {
            alert.error(response.message);
            setIsButtonDisabled(false);
        }

    }

    async function GetApprovedLedgerAccountDetails(groupID, factoryID) {
        const response = await services.GetApproedLedgerAccountNameAndIDForDropdown(groupID, factoryID);

        let array = ["Select Account "]
        for (let item of Object.entries(response)) {
            array[item[1]["ledgerAccountID"]] = item[1]["accountName"]
        }

        setTempCreditAcc(array)

        setCreditAccountList(response);
        setDebitAccountList(response);
        setAllLedgerAccountList(response);
        AccountList = response
        return response
    }

    async function GetApprovedLedgerAccountDetailsDebit() {
        const response = await services.getApprovedLedgerAoountNamesByFilter(FormDetails.groupID, FormDetails.factoryID,FormDetails.debitChildHeaderID); 
        let array = ["Select Account "]
        for (let item of Object.entries(response)) {
            array[item[1]["ledgerAccountID"]] = item[1]["accountName"]
        }
        setTempDebittAcc(array) 
        setDebitAccountList(response);
        setDebitAllLedgerAccountList(response);
        //AccountList = response
        return response
    }

    async function GetApprovedLedgerAccountDetailsCredit() {
        const response = await services.getApprovedLedgerAoountNamesByFilter(FormDetails.groupID, FormDetails.factoryID,FormDetails.creditChildHeaderID);

        let array = ["Select Account "]
        for (let item of Object.entries(response)) {
            array[item[1]["ledgerAccountID"]] = item[1]["accountName"]
        }

        setTempCreditAcc(array)
        setCreditAccountList(response); 
        setCreditAllLedgerAccountList(response);
        return response
    }

    async function GetGLMappingAccountDetailsByTransactionTypeID(transactionTypeID, groupID, factoryID) {
        const response = await services.GetGLMappingAccountDetailsByTransactionTypeID(transactionTypeID, groupID, factoryID) 
        setFormDetails({
            ...FormDetails,
            groupID: response.groupID,
            factoryID: response.factoryID,
            transactionTypeID: response.transactionTypeID,
            isActive: response.isActive, 
            creditMappingType: response.creditMappingType,
            debitMappingType: response.debitMappingType,           
            isActive:true
        })
        
        setInitialEditDetails({
            ...InitialEditDetails,
            groupID: response.groupID,
            factoryID: response.factoryID,
            transactionTypeID: response.transactionTypeID,
            isActive: response.isActive, 
            creditMappingType: response.creditMappingType,
            debitMappingType: response.debitMappingType,            
            debitAccountTypeID:response.debitAccountTypeID,
            debitParentHeaderID:response.debitParentHeaderID,
            debitChildHeaderID:response.debitChildHeaderID, 
            creditAccountTypeID:response.creditAccountTypeID,
            creditParentHeaderID:response.creditParentHeaderID,
            creditChildHeaderID:response.creditChildHeaderID,           
            debitLedgerAccountID: response.debitLedgerAccountID,
            creditLedgerAccountID: response.creditLedgerAccountID,
            debitLedgerAccountName: response.debitLedgerAccountName,
            creditLedgerAccountName: response.creditLedgerAccountName,
            monthlyDebitAccountList:response.monthlyDebitAccountList,
            monthlyCreditAccountList:response.monthlyCreditAccountList,
            isMonthlyAccountsEnabledDebit:response.isMonthlyAccountsEnabledDebit,
            isMonthlyAccountsEnabledCredit:response.isMonthlyAccountsEnabledCredit
        })
         
        setSelectedCreditLedgerAccountCode(response.creditLedgerAccountCode);
        setSelectedDebitLedgerAccountCode(response.debitLedgerAccountCode);  
        
    }

    function fieldHandleChange(e) {
        const target = e.target;
        const value = target.value;
        setFormDetails({
            ...FormDetails,
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
                        isEdit={false}
                        onClick={handleClick}
                    />
                </Grid>
            </Grid>
        )
    }
    function generateDropDownMenu(data) {
        let items = [];
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items;
    }
    function generateTransactionTypeDropDownMenu(data) {
        let items = [];
        if (data != null) {
            for (const object of data) {
                items.push(<MenuItem key={object.transactionTypeID} value={object.transactionTypeID}>{object.transactionTypeName}</MenuItem>);
            }
        }
        return items;
    }

    //Debit Section
    async function getDebitAccountTypeNamesForDropdown() {
        const accounts = await services.getAccountTypeNamesForDropdown(FormDetails.groupID, FormDetails.factoryID);         
        setDebitAccountTypeDetailNames(accounts.data)
        let array = []
        for (let item of Object.entries(accounts.data)) {
            array[item[1]["accountTypeID"]] = item[1]["accountTypeName"]
        }
        setDebitAccountTypeNames(array);
    }

    async function getDebitParentHeadersByAccountTypeID(id) {
        const parent = await services.getParentHeadersByAccountTypeID(id);
        setDebitParentHeaderDetailNames(parent.data)
        let array = []
        for (let item of Object.entries(parent.data)) {
        array[item[1]["parentHeaderID"]] = item[1]["parentHeaderName"]
        }
        setDebitParentHeaderNames(array);
    }

    async function getDebitChildHeadersByParentTypeID(id) {
        const child = await services.getChildHeadersByParentTypeID(id);
        setDebitChildHeaderDetailNames(child.data)
        let array = []
        for (let item of Object.entries(child.data)) {
            array[item[1]["childHeaderID"]] = item[1]["childHeaderName"]
        }
        setDebitChildHeaderNames(array);
    }
    
    //Credit Section
    async function getCreditAccountTypeNamesForDropdown() {  
        const accounts = await services.getAccountTypeNamesForDropdown(FormDetails.groupID, FormDetails.factoryID);  
        setCreditAccountTypeDetailNames(accounts.data)
        let array = []
        for (let item of Object.entries(accounts.data)) {
            array[item[1]["accountTypeID"]] = item[1]["accountTypeName"]
        } 
        setCreditAccountTypeNames(array);
    }    
    
    async function getCreditParentHeadersByAccountTypeID(id) {
        const parent = await services.getParentHeadersByAccountTypeID(id);
        setCreditParentHeaderDetailNames(parent.data)
        let array = []
        for (let item of Object.entries(parent.data)) {
        array[item[1]["parentHeaderID"]] = item[1]["parentHeaderName"]
        } 
        setCreditParentHeaderNames(array);
    }

    async function getCreditChildHeadersByParentTypeID(id) {
        const child = await services.getChildHeadersByParentTypeID(id);
        setCreditChildHeaderDetailNames(child.data)
        let array = []
        for (let item of Object.entries(child.data)) {
            array[item[1]["childHeaderID"]] = item[1]["childHeaderName"]
        }  
        setCreditChildHeaderNames(array);
    }

    function handleNewRemarksField(e) {
        const target = e.target;
        const value = target.value;
        var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        if (!format.test(value)) {
            setRemarks(value)
        }
    }
    async function accountTypeSelection(e,entryType) { 
        fieldHandleChange(e) 
        if(entryType === 'debit' && FormDetails.debitMappingType == 1){
            let filteredData = debitAccountTypeDetailNames.filter(x => {return x.accountTypeID == e.target.value;}); 
            if(filteredData.length>0)setSelectedDebitLedgerAccountCode(filteredData[0].accountTypeCode);
        }else if(entryType === 'credit' && FormDetails.creditMappingType == 1){
            let filteredData = creditAccountTypeDetailNames.filter(x => {return x.accountTypeID == e.target.value;});
            if(filteredData.length>0)setSelectedCreditLedgerAccountCode(filteredData[0].accountTypeCode);
        }
    };

    async function handleParentHeaderSelection(e,entryType) { 
        fieldHandleChange(e)
        if(entryType === 'debit' && FormDetails.debitMappingType == 2){
            let filteredData = debitParentHeaderDetailNames.filter(x => {return x.parentHeaderID == e.target.value;}); 
            if(filteredData.length>0)setSelectedDebitLedgerAccountCode(filteredData[0].parentHeaderCode);
        }else if(entryType === 'credit' && FormDetails.creditMappingType == 2){
            let filteredData = creditParentHeaderDetailNames.filter(x => {return x.parentHeaderID == e.target.value;});
            if(filteredData.length>0)setSelectedCreditLedgerAccountCode(filteredData[0].parentHeaderCode);     
        } 
    };

    async function handleChildHeaderSelection(e,entryType) { 
        fieldHandleChange(e)
        if(entryType === 'debit' && FormDetails.debitMappingType == 3){
            let filteredData = debitChildHeaderDetailNames.filter(x => {return x.childHeaderID == e.target.value;}); 
            if(filteredData.length>0)setSelectedDebitLedgerAccountCode(filteredData[0].childHeaderCode);            
        }else if(entryType === 'credit' && FormDetails.creditMappingType == 3){
            let filteredData = creditChildHeaderDetailNames.filter(x => {return x.childHeaderID == e.target.value;});         
            if(filteredData.length>0)setSelectedCreditLedgerAccountCode(filteredData[0].childHeaderCode)
        } 
    }; 
    function ClearDebitLedgerSectionFields() {  
        setFormDetails({
            ...FormDetails,
            debitAccountTypeID: 0,
            debitParentHeaderID: 0,
            debitChildHeaderID:0,
            isMonthlyAccountsEnabledDebit:false,
            isActive:true
        }); 

        setSelectedDebitAccount({});
        setSelectedDebitLedgerAccountCode();
        setDebitMonthlyAccountDetails(monthlyLedgerAccountTemplate);
    }

    function ClearCreditLedgerSectionFields() { 
        setFormDetails({
            ...FormDetails,
            creditAccountTypeID:0,
            creditParentHeaderID:0,
            creditChildHeaderID:0,
            isMonthlyAccountsEnabledCredit:false,
            isActive:true
        }) 

        setSelectedCreditAccount({})
        setSelectedCreditLedgerAccountCode()
        setCreditMonthlyAccountDetails(monthlyLedgerAccountTemplate);
    }
    const MonthlyEnabledHandleChangeCredit = () => {
        setFormDetails({
            ...FormDetails,
            isMonthlyAccountsEnabledCredit: !FormDetails.isMonthlyAccountsEnabledCredit
        })
    }
    const MonthlyEnabledHandleChangeDebit = () => {
        setFormDetails({
            ...FormDetails,
            isMonthlyAccountsEnabledDebit: !FormDetails.isMonthlyAccountsEnabledDebit
        })
    }
    const handleOnchangeCreditAccount = (val) => {
        if (val !== null) {
            let tempArray = [...CreditAllLedgerAccountList]
            let filteredAccountList = tempArray.find(item=>item.ledgerAccountID=val.target.value);
            setFormDetails({
                ...FormDetails,
                creditLedgerAccountID:filteredAccountList.ledgerAccountID, 
                creditLedgerAccountName:filteredAccountList.accountName
            })
            //setSelectedCreditAccount(val)
            setCreditAccountList(filteredAccountList); 
            setSelectedCreditLedgerAccountCode(filteredAccountList.ledgerAccountCode);
        } else {
            setSelectedCreditAccount({})
            setCreditAccountList(CreditAllLedgerAccountList);
        }
    }

    const handleOnchangeDebitAccount = (val) => {  
        if (val !== null) {
            let tempArray = [...DebitAllLedgerAccountList]
            let filteredAccountList = tempArray.find(item=>item.ledgerAccountID=val.target.value); 
            setFormDetails({
                ...FormDetails,
                debitLedgerAccountID:filteredAccountList.ledgerAccountID, 
                debitLedgerAccountName:filteredAccountList.accountName
            })
            //setSelectedDebitAccount(val) 
            setDebitAccountList(filteredAccountList);
            setSelectedDebitLedgerAccountCode(filteredAccountList.ledgerAccountCode);
        } else {
            setSelectedDebitAccount({})
            setDebitAccountList(DebitAllLedgerAccountList)
        } 
    }
    function generateDebitLedgerAccountSection() { 
        let  monthlyAccountsEnable = <Grid item md={6} xs={12}>
                    <InputLabel shrink id="isMonthlyAccountsEnabledDebit">
                        Monthly Accounts Enabled
                    </InputLabel>
                    <Switch
                        checked={FormDetails.isMonthlyAccountsEnabledDebit}
                        onChange={MonthlyEnabledHandleChangeDebit}
                        name="isMonthlyAccountsEnabledDebit"
                        value={FormDetails.isMonthlyAccountsEnabledDebit}
                        disabled={IsNewRequest === false}
                        size='small'
                    />
                </Grid>
        if(FormDetails.isMonthlyAccountsEnabledDebit === false)
        {
            return(
                <Grid container spacing={1}>
                    {monthlyAccountsEnable}
                    <Grid item md={8} xs={12}>
                        <InputLabel shrink id="debitAccount">
                            Debit Account*
                        </InputLabel>
                        <TextField
                            select
                            name="debitAccount"
                            onChange={e => handleOnchangeDebitAccount(e)}
                            value={FormDetails.debitLedgerAccountID}
                            variant="outlined"
                            id="debitAccount"
                            fullWidth
                            disabled={IsNewRequest === false}
                            size='small'
                        >
                             <MenuItem value="0"> --Select Debit Account-- </MenuItem> 
                            {generateDropDownMenu(TempDebittAcc)}
                        </TextField> 
                    </Grid>
                </Grid>
            )
        }else{
            return(
                <Grid container spacing={1}>
                    {monthlyAccountsEnable}
                    <Grid item md={11} xs={12}  >
                        <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                                { title: 'Month', field: 'monthName' },
                                { title: 'Debit Account', field: 'debitAccount', lookup: { ...TempDebittAcc } }
                            ]}
                            data={debitMonthlyAccountDetails}
                            options={{
                                exportButton: false,
                                showTitle: false,
                                headerStyle: { textAlign: "left", },
                                cellStyle: { textAlign: "left" },
                                columnResizable: false,
                                actionsColumnIndex: -1,
                                search: false,
                                paging: false
                            }} 
                        />
                    </Grid>
                </Grid>
            )
        }
 
    }

    function generateDebitledgerTypeSections(){
        return (
            <Grid className={classes.ledgerMappingSection}>
                {parseInt(FormDetails.debitMappingType) === 1   ||parseInt(FormDetails.debitMappingType) === 2
                  ||parseInt(FormDetails.debitMappingType) === 3 ||parseInt(FormDetails.debitMappingType) === 4 ?
                    <Grid item md={8} xs={12}>
                        <InputLabel shrink id="accountTypeID" hidden={true}>
                            Account Type Name *
                        </InputLabel>

                        <TextField
                            select
                            name="debitAccountTypeID"
                            onChange={e => accountTypeSelection(e,'debit')}
                            value={FormDetails.debitAccountTypeID}
                            variant="outlined"
                            id="debitAccountTypeID"
                            fullWidth
                            disabled={IsNewRequest === false}
                            size='small'
                        >
                            <MenuItem value="0">
                                --Select Account Type Name--
                            </MenuItem>
                            {generateDropDownMenu(debitAccountTypeNames)}
                        </TextField>
                    </Grid> : null}
                {parseInt(FormDetails.debitMappingType) === 2 || parseInt(FormDetails.debitMappingType) === 3 
                  || parseInt(FormDetails.debitMappingType) === 4 ?
                    <Grid item md={8} xs={12}>
                        <InputLabel shrink id="debitParentHeaderID">
                            Parent Header *
                        </InputLabel>

                        <TextField select
                            fullWidth
                            name="debitParentHeaderID"
                            onChange={(e) => { handleParentHeaderSelection(e,'debit') }}
                            value={FormDetails.debitParentHeaderID}
                            variant="outlined"
                            id="debitParentHeaderID"
                            disabled={IsNewRequest === false}
                            size='small'
                        >
                            <MenuItem value={'0'} disabled={true}>
                                --Select Parent Header--
                            </MenuItem>
                            {generateDropDownMenu(debitParentHeaderNames)}
                        </TextField>
                    </Grid>  : null}
                    {parseInt(FormDetails.debitMappingType) === 3  || parseInt(FormDetails.debitMappingType) === 4 ?
                    <Grid item md={8} xs={12}   >
                        <InputLabel shrink id="debitChildHeaderID">
                            Child Header *
                        </InputLabel>

                        <TextField
                            select
                            name="debitChildHeaderID"
                            onChange={e => handleChildHeaderSelection(e,'debit')}
                            value={FormDetails.debitChildHeaderID}
                            variant="outlined"
                            id="debitChildHeaderID"
                            fullWidth
                            disabled={IsNewRequest === false}
                            size='small'
                        >
                            <MenuItem value="0">--Select Child Header--</MenuItem>
                            {generateDropDownMenu(debitChildHeaderNames)}
                        </TextField>
                    </Grid>  : null}
                    {parseInt(FormDetails.debitMappingType) === 4 ?  generateDebitLedgerAccountSection()  : null}
            </Grid>
        )        
    }

    function generateCreditLedgerAccountSection() { 
        let monthlyAccountsEnable =  <Grid item md={6} xs={12}>
                        <InputLabel shrink id="isMonthlyAccountsEnabledCredit">
                            Monthly Accounts Enabled
                        </InputLabel>
                        <Switch
                            checked={FormDetails.isMonthlyAccountsEnabledCredit}
                            onChange={MonthlyEnabledHandleChangeCredit}
                            name="MonthlyEnabledHandleChangeCredit"
                            value={FormDetails.isMonthlyAccountsEnabledCredit}
                            disabled={IsNewRequest === false}
                            size='small'
                        />
                    </Grid> 
        if(FormDetails.isMonthlyAccountsEnabledCredit === false)
        {
            return(
                <Grid container spacing={1} >
                    {monthlyAccountsEnable}
                    <Grid item md={8} xs={12}>
                        <InputLabel shrink id="creditAccount">
                            Credit Account *
                        </InputLabel>
                        <TextField
                            select
                            name="creditAccount"
                            onChange={e => handleOnchangeCreditAccount(e)}
                            value={FormDetails.creditLedgerAccountID}
                            variant="outlined"
                            id="creditAccount"
                            fullWidth
                            disabled={IsNewRequest === false}
                            size='small'
                        >
                             <MenuItem value="0"> --Select Debit Account-- </MenuItem> 
                            {generateDropDownMenu(TempCreditAcc)}
                        </TextField> 
                    </Grid>
                </Grid>
            )
        }else{
            return(
                <Grid container spacing={1} >
                    {monthlyAccountsEnable}
                    <Grid item md={11} xs={12}>
                        <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                                { title: 'Month', field: 'monthName' },
                                { title: 'Credit Account', field: 'creditAccount', lookup: { ...TempCreditAcc } }
                            ]}
                            data={creditMonthlyAccountDetails}
                            options={{
                                exportButton: false,
                                showTitle: false,
                                headerStyle: { textAlign: "left", },
                                cellStyle: { textAlign: "left" },
                                columnResizable: false,
                                actionsColumnIndex: -1,
                                search: false,
                                paging: false
                            }} 
                        />
                    </Grid>
                </Grid>
            )
        }         
    }

    function generateCreditledgerTypeSections(){ 
        return ( 
            <Grid  className={classes.ledgerMappingSection} >
                {parseInt(FormDetails.creditMappingType) === 1  || parseInt(FormDetails.creditMappingType) === 2
                    || parseInt(FormDetails.creditMappingType) === 3  || parseInt(FormDetails.creditMappingType) === 4 ?
                    <Grid item md={8} xs={12}>
                        <InputLabel shrink id="accountTypeID">
                            Account Type Name *
                        </InputLabel>

                        <TextField
                            select
                            name="creditAccountTypeID"
                            onChange={e => accountTypeSelection(e,'credit')}
                            value={FormDetails.creditAccountTypeID}
                            variant="outlined"
                            id="creditAccountTypeID"
                            fullWidth
                            disabled={IsNewRequest === false}
                            size='small'
                        >
                            <MenuItem value="0">
                                --Select Account Type Name--
                            </MenuItem>
                            {generateDropDownMenu(creditAccountTypeNames)}
                        </TextField>
                    </Grid>  : null}
                {parseInt(FormDetails.creditMappingType) === 2 || parseInt(FormDetails.creditMappingType) === 3 
                  || parseInt(FormDetails.creditMappingType) === 4 ?
                <Grid item md={8} xs={12}>
                    <InputLabel shrink id="creditParentHeaderID">
                        Parent Header *
                    </InputLabel>

                    <TextField select
                        fullWidth
                        name="creditParentHeaderID"
                        onChange={(e) => { handleParentHeaderSelection(e,'credit')}}
                        value={FormDetails.creditParentHeaderID}
                        variant="outlined"
                        id="creditParentHeaderID"
                        disabled={IsNewRequest === false}
                        size='small'
                    >
                        <MenuItem value={'0'} disabled={true}>
                            --Select Parent Header--
                        </MenuItem>
                        {generateDropDownMenu(creditParentHeaderNames)}
                    </TextField>
                </Grid>  :null}
                {parseInt(FormDetails.creditMappingType) === 3  || parseInt(FormDetails.creditMappingType) === 4 ?
                <Grid item  md={8}  xs={12}   >
                        <InputLabel shrink id="debitChildHeaderID">
                          Child Header *
                        </InputLabel>

                        <TextField
                          select 
                          name="creditChildHeaderID"
                          onChange={e => handleChildHeaderSelection(e,'credit')}
                          value={FormDetails.creditChildHeaderID}
                          variant="outlined"
                          id="creditChildHeaderID" 
                          fullWidth
                          disabled={IsNewRequest === false}
                          size='small'
                        >
                          <MenuItem value="0">--Select Child Header--</MenuItem>
                          {generateDropDownMenu(creditChildHeaderNames)}
                        </TextField>
                </Grid>  :null}
                { parseInt(FormDetails.creditMappingType) === 4 ?  generateCreditLedgerAccountSection() :null}
            </Grid>
            
        )        
    }

    return (
        <Page
            className={classes.root}
            title={PageTitle}
        >
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: FormDetails.groupID,
                        factoryID: FormDetails.factoryID,
                        isActive: FormDetails.isActive,
                        transactionTypeID: FormDetails.transactionTypeID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                            factoryID: Yup.number().min(1, "Please Select a Estate").required('Estate is required'),
                            transactionTypeID: Yup.number().min(1, "Please Select a Transaction Type").required('Transaction Type is required')
                        })
                    }
                    enableReinitialize
                >
                    {({
                        errors,
                        handleBlur,
                        handleSubmit,
                        handleChange,
                        touched,
                        values,
                        isSubmitting
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <Box mt={0}>
                                <Card>
                                    <CardHeader
                                        title={cardTitle(PageTitle)}
                                    />
                                    <PerfectScrollbar>
                                        <Divider />
                                        <CardContent>
                                            <Grid container spacing={1}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Group *
                                                    </InputLabel>

                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        onChange={(e) => {
                                                            fieldHandleChange(e)
                                                            loadFactory(e)
                                                        }}
                                                        value={FormDetails.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        disabled={true}
                                                        size='small'
                                                    >
                                                        <MenuItem value={'0'} disabled={true}>
                                                            --Select Group--
                                                        </MenuItem>
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
                                                        onChange={(e) => {
                                                            fieldHandleChange(e)
                                                            loadLedgerAccounts(e)
                                                        }}
                                                        value={FormDetails.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        disabled={true}
                                                        size='small'
                                                    >
                                                        <MenuItem value={'0'} disabled={true}>
                                                            --Select Estate--
                                                        </MenuItem>
                                                        {generateDropDownMenu(FactoryList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="transactionTypeID">
                                                        Transaction Type *
                                                    </InputLabel>

                                                    <TextField select
                                                        error={Boolean(touched.transactionTypeID && errors.transactionTypeID)}
                                                        fullWidth
                                                        helperText={touched.transactionTypeID && errors.transactionTypeID}
                                                        name="transactionTypeID"
                                                        onChange={(e) => {
                                                            fieldHandleChange(e)
                                                        }}
                                                        value={FormDetails.transactionTypeID}
                                                        variant="outlined"
                                                        id="transactionTypeID"
                                                        disabled={true}
                                                        size='small'
                                                    >
                                                        <MenuItem value={'0'} disabled={true}>
                                                            --Select Transaction Type--
                                                        </MenuItem>
                                                        {generateTransactionTypeDropDownMenu(TransactionTypeList)}
                                                    </TextField>
                                                </Grid>

                                            </Grid>
                                            <br/>
                                            <Grid container spacing={1}>
                                                        <Grid item md={6} xs={12} style={{ borderRight: "1px solid grey" }} >
                                                            <Grid item md={12} xs={12}>
                                                                <InputLabel shrink id="transactionTypeID">
                                                                    Debit GL Mapping Type *
                                                                </InputLabel> 
                                                                <TextField select
                                                                    error={Boolean(touched.debitMappingType && errors.debitMappingType)}
                                                                    fullWidth
                                                                    helperText={touched.debitMappingType && errors.debitMappingType}
                                                                    name="debitMappingType"
                                                                    onChange={(e) => {
                                                                        fieldHandleChange(e)
                                                                    }}
                                                                    value={FormDetails.debitMappingType}
                                                                    variant="outlined"
                                                                    id="debitMappingType"
                                                                    disabled={IsNewRequest === false}
                                                                    size='small'
                                                                >
                                                                    <MenuItem value={'0'} disabled={true}> --Select Mapping Type-- </MenuItem>
                                                                    <MenuItem value={'1'} >  Account Type </MenuItem>
                                                                    <MenuItem value={'2'} >  Parent Header </MenuItem>
                                                                    <MenuItem value={'3'} >  Chlild Header </MenuItem>
                                                                    <MenuItem value={'4'} >  Ledger Account </MenuItem>
                                                                </TextField>
                                                            </Grid>
                                                            <br /> 
                                                            {generateDebitledgerTypeSections()}          
                                                        </Grid>
                                                        <Grid item md={6} xs={12} spacing={1} >
                                                            <Grid item md={12} xs={12}  >
                                                                <InputLabel shrink id="transactionTypeID">
                                                                    Credit GL Mapping Type *
                                                                </InputLabel> 
                                                                <TextField select
                                                                    error={Boolean(touched.creditMappingType && errors.creditMappingType)}
                                                                    fullWidth
                                                                    helperText={touched.creditMappingType && errors.creditMappingType}
                                                                    name="creditMappingType"
                                                                    onChange={(e) => {
                                                                        fieldHandleChange(e)
                                                                    }}
                                                                    value={FormDetails.creditMappingType}
                                                                    variant="outlined"
                                                                    id="creditMappingType"
                                                                    disabled={IsNewRequest === false}
                                                                    size='small'
                                                                >
                                                                    <MenuItem value={'0'} disabled={true}> --Select Mapping Type-- </MenuItem>
                                                                    <MenuItem value={'1'} >  Account Type </MenuItem>
                                                                    <MenuItem value={'2'} >  Parent Header </MenuItem>
                                                                    <MenuItem value={'3'} >  Chlild Header </MenuItem>
                                                                    <MenuItem value={'4'} >  Ledger Account </MenuItem>
                                                                </TextField>
                                                            </Grid>
                                                            <br /> 
                                                            {generateCreditledgerTypeSections()}
                                                        </Grid>
                                                    </Grid>
                                            <Grid container spacing={2}>
                                                <Grid item md={12} xs={12}>
                                                    <InputLabel shrink id="remarksView">
                                                        Remarks
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        onChange={handleNewRemarksField}
                                                        rows={4}
                                                        value={Remarks}
                                                        variant="outlined"
                                                        id="remarksView"
                                                        size='small'
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="secondary"
                                                    variant="contained"
                                                    className={classes.btnReject}
                                                    onClick={HandleRejectGLMappingDetails}
                                                    disabled={IsButtonDisabled}
                                                >
                                                    Reject
                                                </Button>

                                                <Button
                                                    color="primary"
                                                    variant="contained"
                                                    className={classes.btnApprove}
                                                    onClick={HandleApproveGLMappingDetails}
                                                    disabled={IsButtonDisabled}
                                                >
                                                    Approve
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </PerfectScrollbar>
                                </Card>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Container>
        </Page>
    )

}

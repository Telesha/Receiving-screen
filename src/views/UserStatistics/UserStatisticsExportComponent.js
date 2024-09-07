import React, { useState, useEffect } from 'react'
import {
    makeStyles,
} from '@material-ui/core';
import services from './Services'
import { trackPromise } from 'react-promise-tracker';
import {
    startOfMonth,
    endOfMonth,
    addMonths,
} from 'date-fns';

import { UserStatisticsExportComponentContainer } from './TabPages/UserStatisticsExportComponent';
import moment from 'moment';
import { getDate } from 'date-fns';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
    grid_first_row: {
        maxHeight: '10rem'
    },
    grid_second_row: {
        maxHeight: 'auto'
    },
    grid_third_row: {
        maxHeight: '30rem'
    }
}));

export const UserStatisticsComponent = ({ UserDetails, ExportUserGeneralDetails }) => {
    const classes = useStyles();
    const [SelectedTransactionType, setSelectedTransactionType] = useState('0')
    const [AdvancedTakenData, setAdvancedTakenData] = useState();
    const [TotalLeafCountComponentData, setTotalLeafCountComponentData] = useState();
    const [AverageMonthlyIncomeComponetData, setAverageMonthlyIncomeComponetData] = useState();
    const [CustomerOverAllViewComponentData, setCustomerOverAllViewComponentData] = useState();
    const [TotalLeaftChartComponentData, setTotalLeaftChartComponentData] = useState();
    const [IsCorrectUser, setIsCorrectUser] = useState(false);
    const [IsDefaultAccount, setIsDefaultAccount] = useState(false)
    const [CustomerRelatedAccountList, setCustomerRelatedAccountList] = useState([]);
    const [customerHistoryData, setCustomerHistoryData] = useState([]);
    const [TransactionTypes, setTransactionTypes] = useState([]);
    const [SelectedAccountNumber, setSelectedAccountNumber] = useState(null);
    const [SelectedMonth, setSelectedMonth] = useState('Last_6_months');
    const [NumberOfLeafCollectedDays, setNumberOfLeafCollectedDays] = useState(0);
    const [TotalLeafBarChartComponentData, setTotalLeafBarChartComponentData] = useState();
    const [PastCropDetailsComponentData, setPastCropDetailsComponentData] = useState([]);
    const [UserBiometricDetails, setUserBiometricDetails] = useState({
        customerBiometricData: '',
        customerID: 0,
        firstName: '',
        lastName: '',
        nic: '',
        registrationNumber: '',
        secondName: '',
    });
    const [CoveredArea, setCoveredArea] = useState({
        area: 0.0,
        areaType: 0
    });
    const [TestObjec, setTestObjec] = useState({
        CustomerRegistrationNumber: "",
        NIC: "",
        startDate: "",
        endDate: ""
    });

    useEffect(() => {
        trackPromise(GetAllTransactionsTypes());
        setTestObjec(UserDetails);
        trackPromise(LoadLoanStatistics(UserDetails));
        selectRadiobuttonByGivenDate(UserDetails);
        trackPromise(GetPastCropWeightDetails(UserDetails))
    }, [UserDetails])

    useEffect(() => {
        trackPromise(LoadUserDataByDates(SelectedMonth));
    }, [SelectedMonth])

    //Set Radio Button By the Given Date Range
    function selectRadiobuttonByGivenDate(UserDetails) {
        if (UserDetails.startDate !== undefined && UserDetails.endDate !== undefined) {
            let userStartDate = UserDetails.startDate.toString().split('T')[0];
            let userEndDate = UserDetails.endDate.toString().split('T')[0];

            if (userStartDate === moment(startOfMonth(addMonths(new Date(), -5))).format().split('T')[0] && userEndDate === moment(endOfMonth(addMonths(new Date(), 0))).format().split('T')[0]) {
                setSelectedMonth('Last_6_months');
                return;
            } else if (userStartDate === moment(startOfMonth(addMonths(new Date(), -2))).format().split('T')[0] && userEndDate === moment(endOfMonth(new Date())).format().split('T')[0]) {
                setSelectedMonth('Last_3_Months');
                return;
            } else if (userStartDate === moment(startOfMonth(addMonths(new Date(), -1))).format().split('T')[0] && userEndDate === moment(endOfMonth(addMonths(new Date(), -1))).format().split('T')[0]) {
                setSelectedMonth('Previous_Month');
                return;
            } else if (userStartDate === moment(startOfMonth(new Date())).format().split('T')[0] && userEndDate === moment(endOfMonth(new Date())).format().split('T')[0]) {
                setSelectedMonth('Current_Month');
                return;
            } else {
                setSelectedMonth('');
            }
        } else {
            setSelectedMonth('Last_6_months');
        }
    }

    //get currecnt date
    const currentDate = new Date();

    //Initial Component data loading (FirstLoad), begins
    async function LoadLoanStatistics(TestObjec) {

        if (TestObjec.CustomerRegistrationNumber === "" && TestObjec.NIC === null) {
            return
        }

        setIsCorrectUser(false);
        // let userDetailsObject = {
        //     groupID: parseInt(TestObjec.GroupID),
        //     factoryID: parseInt(TestObjec.FactoryID),
        //     customerNIC: TestObjec.NIC,
        //     customerRegistrationNumber: TestObjec.CustomerRegistrationNumber,
        //     startDate: TestObjec.startDate === undefined ? moment(startOfMonth(addMonths(new Date(), -5))).format() : TestObjec.startDate,
        //     endDate: TestObjec.endDate === undefined ? moment(endOfMonth(addMonths(new Date(), 0))).format() : TestObjec.endDate,
        //     transactionTypeID: parseInt(SelectedTransactionType)
        // };

        let userDetailsObject = {
            groupID: parseInt(TestObjec.GroupID),
            factoryID: parseInt(TestObjec.FactoryID),
            customerNIC: TestObjec.NIC,
            customerRegistrationNumber: TestObjec.CustomerRegistrationNumber,
            startDate: TestObjec.startDate === undefined ?
                (moment(startOfMonth(addMonths(new Date(), -5))).format()).toString().split('T')[0] :
                (TestObjec.startDate).toString().split('T')[0],
            endDate: TestObjec.endDate === undefined ?
                (moment(endOfMonth(addMonths(new Date(), 0))).format()).toString().split('T')[0] :
                (TestObjec.endDate).toString().split('T')[0],
            transactionTypeID: parseInt(SelectedTransactionType)
        };

        let relatedAccountDetailsList = [];
        relatedAccountDetailsList = await GetCustomerRelatedAccountDetails(userDetailsObject);
        trackPromise(GetCustomerOverallDetailsByUser(userDetailsObject));
        trackPromise(GetUserGeneralDetails(userDetailsObject));
        trackPromise(GetAdvancedTakenDetailsByUser(userDetailsObject));
        trackPromise(GetCustomerMonthlyIncomeDetailsByUser(userDetailsObject));
        trackPromise(GetCustomerLeafCountDetailsByUser(userDetailsObject));
        trackPromise(GetCustomerHistoryDetailViewDetails(userDetailsObject));
        trackPromise(GetCustomerCovedArea(userDetailsObject));
        trackPromise(GetNumberOfLeafCollectedDays(userDetailsObject));
        trackPromise(GetCustomerLeafCountDetailsByUserForBarChart(userDetailsObject));
        trackPromise(GetPastCropWeightDetails(userDetailsObject));

        setIsCorrectUser(true);

        let defaultRegNumber;
        relatedAccountDetailsList.map((object) => {
            if (object.isDefault === true) {
                defaultRegNumber = object.registrationNumber
            }
        })

        setSelectedAccountNumber(UserDetails.CustomerRegistrationNumber)
        defaultRegNumber === UserDetails.CustomerRegistrationNumber ? setIsDefaultAccount(true) : setIsDefaultAccount(false);

        if (UserDetails.NIC !== null) {
            relatedAccountDetailsList.map((object) => {
                if (object.isDefault === true) {
                    setSelectedAccountNumber(object.registrationNumber);
                    setIsDefaultAccount(object.isDefault)
                }
            })
        }
    }
    //Initial Component data loading (FirstLoad), end

    //Component data loading acording to customer selecing account from the dropdown, begins
    const getUserDetails = (event) => {
        if (IsCorrectUser) {

            let startString = TestObjec.startDate === undefined ?
                (moment(startOfMonth(addMonths(new Date(), -5))).format()).toString().split('T')[0] :
                (TestObjec.startDate).toString().split('T')[0];
            let endString = TestObjec.endDate === undefined ?
                (moment(endOfMonth(addMonths(new Date(), 0))).format()).toString().split('T')[0] :
                (TestObjec.endDate).toString().split('T')[0]

            // let userDetailsObject = {
            //     groupID: parseInt(UserDetails.GroupID),
            //     factoryID: parseInt(UserDetails.FactoryID),
            //     customerNIC: UserDetails.NIC,
            //     customerRegistrationNumber: event,
            //     startDate: TestObjec.startDate === undefined ?
            //         moment(startOfMonth(addMonths(new Date(), -5))).format() :
            //         TestObjec.startDate,
            //     endDate: TestObjec.endDate === undefined ?
            //         moment(endOfMonth(addMonths(new Date(), 0))).format() :
            //         TestObjec.endDate,
            //     transactionTypeID: parseInt(SelectedTransactionType)
            // };

            let userDetailsObject = {
                groupID: parseInt(UserDetails.GroupID),
                factoryID: parseInt(UserDetails.FactoryID),
                customerNIC: UserDetails.NIC,
                customerRegistrationNumber: event,
                startDate: startString,
                endDate: endString,
                transactionTypeID: parseInt(SelectedTransactionType)
            };

            setTestObjec({
                ...TestObjec,
                CustomerRegistrationNumber: event
            })

            trackPromise(GetUserGeneralDetails(userDetailsObject));
            trackPromise(GetAdvancedTakenDetailsByUser(userDetailsObject));
            trackPromise(GetCustomerMonthlyIncomeDetailsByUser(userDetailsObject));
            trackPromise(GetCustomerOverallDetailsByUser(userDetailsObject));
            trackPromise(GetCustomerLeafCountDetailsByUser(userDetailsObject));
            trackPromise(GetCustomerRelatedAccountDetails(userDetailsObject));
            trackPromise(GetCustomerHistoryDetailViewDetails(userDetailsObject));
            trackPromise(GetCustomerCovedArea(userDetailsObject));
            trackPromise(GetNumberOfLeafCollectedDays(userDetailsObject));
            trackPromise(GetCustomerLeafCountDetailsByUserForBarChart(userDetailsObject));
            trackPromise(GetPastCropWeightDetails(userDetailsObject));


            CustomerRelatedAccountList.map((object) => {
                if (object.registrationNumber === event) {
                    setIsDefaultAccount(object.isDefault)
                }
            })
        }
    }
    //Component data loading acording to customer selecing account from the dropdown, end

    //Component data loading acording to transaction Type, begins
    const getTransactionDetailsByType = (typeID) => {
        if (IsCorrectUser) {
            // let userDetailsObjectNew = {
            //     groupID: parseInt(UserDetails.GroupID),
            //     factoryID: parseInt(UserDetails.FactoryID),
            //     customerNIC: UserDetails.NIC,
            //     customerRegistrationNumber: TestObjec.CustomerRegistrationNumber,
            //     startDate: TestObjec.startDate === undefined ?
            //         moment(startOfMonth(addMonths(new Date(), -5))).format() :
            //         TestObjec.startDate,
            //     endDate: TestObjec.endDate === undefined ?
            //         moment(endOfMonth(addMonths(new Date(), 0))).format() :
            //         TestObjec.endDate,
            //     transactionTypeID: parseInt(typeID)
            // };

            let userDetailsObjectNew = {
                groupID: parseInt(UserDetails.GroupID),
                factoryID: parseInt(UserDetails.FactoryID),
                customerNIC: UserDetails.NIC,
                customerRegistrationNumber: TestObjec.CustomerRegistrationNumber,
                startDate: TestObjec.startDate === undefined ?
                    (moment(startOfMonth(addMonths(new Date(), -5))).format()).toString().split('T')[0] :
                    (TestObjec.startDate).toString().split('T')[0],
                endDate: TestObjec.endDate === undefined ?
                    (moment(endOfMonth(addMonths(new Date(), 0))).format()).toString().split('T')[0] :
                    (TestObjec.endDate).toString().split('T')[0],
                transactionTypeID: parseInt(typeID)
            };



            trackPromise(GetCustomerHistoryDetailViewDetails(userDetailsObjectNew))
        }
    }
    //Component data loading acording to transaction Type, end

    //Component data loading acording to the 4 radio buttons date, begins
    async function LoadUserDataByDates(dateRange) {
        if (IsCorrectUser) {

            let startRange;
            let endRange;

            if (dateRange === 'Last_12_months') {
                startRange = moment(startOfMonth(addMonths(new Date(), -11))).format();
                endRange = moment(endOfMonth(addMonths(new Date(), 0))).format();
            } else if (dateRange === 'Last_6_months') {
                startRange = moment(startOfMonth(addMonths(new Date(), -5))).format();
                endRange = moment(endOfMonth(addMonths(new Date(), 0))).format();
            } else if (dateRange === 'Last_3_Months') {
                startRange = moment(startOfMonth(addMonths(new Date(), -2))).format();
                endRange = moment(endOfMonth(new Date())).format();
            } else if (dateRange === 'Previous_Month') {
                startRange = moment(startOfMonth(addMonths(new Date(), -1))).format();
                endRange = moment(endOfMonth(addMonths(new Date(), -1))).format();
            } else {
                startRange = moment(startOfMonth(new Date())).format();
                endRange = moment(endOfMonth(new Date())).format();
            }

            setTestObjec({
                ...TestObjec,
                startDate: startRange,
                endDate: endRange
            })

            let userDetailsObject = {
                groupID: parseInt(UserDetails.GroupID),
                factoryID: parseInt(UserDetails.FactoryID),
                customerNIC: TestObjec.NIC,
                customerRegistrationNumber: TestObjec.CustomerRegistrationNumber,
                startDate: startRange.toString().split('T')[0],
                endDate: endRange.toString().split('T')[0],
                transactionTypeID: parseInt(SelectedTransactionType)
            };

            trackPromise(GetCustomerOverallDetailsByUser(userDetailsObject));
            trackPromise(GetUserGeneralDetails(userDetailsObject));
            trackPromise(GetAdvancedTakenDetailsByUser(userDetailsObject));
            trackPromise(GetCustomerMonthlyIncomeDetailsByUser(userDetailsObject));
            trackPromise(GetCustomerLeafCountDetailsByUser(userDetailsObject));
            trackPromise(GetCustomerHistoryDetailViewDetails(userDetailsObject));
            trackPromise(GetCustomerCovedArea(userDetailsObject));
            trackPromise(GetNumberOfLeafCollectedDays(userDetailsObject));
            trackPromise(GetCustomerLeafCountDetailsByUserForBarChart(userDetailsObject));
            trackPromise(GetPastCropWeightDetails(userDetailsObject));

            setIsCorrectUser(true);
        }
    }
    //Component data loading acording to the 4 radio buttons date, end

    //Function for the all component data Fetching begins
    async function GetUserGeneralDetails(customerDetails) {
        const result = await services.GetCustomerBiomatricDetails(customerDetails)
        if (result.statusCode === "Error") {
            setIsCorrectUser(false)
            return false;
        } else {
            setIsCorrectUser(true)
            setUserBiometricDetails(result.data);
            ExportUserGeneralDetails(result.data);
            return true
        }
    }

    async function GetCustomerCovedArea(customerDetails) {
        const response = await services.GetCustomeCoveredAreaDetails(customerDetails);
        response !== null ? setCoveredArea(response) : setCoveredArea({
            area: 0.0,
            areaType: 0
        })
    }

    async function GetAdvancedTakenDetailsByUser(customerDetails) {
        const response = await services.GetAdvancedTakenDetails(customerDetails);
        setAdvancedTakenData(response.totalAdvancedPaymentAmount);
    }

    async function GetCustomerOverallDetailsByUser(customerDetails) {
        const result = await services.GetCustomerOverallDetails(customerDetails)
        result.labels.length > 0 ?
            setCustomerOverAllViewComponentData(result) :
            setCustomerOverAllViewComponentData(null);
    }

    async function GetCustomerLeafCountDetailsByUser(customerDetails) {
        const result = await services.GetCustomerLeafCountDetails(customerDetails)
        setTotalLeafCountComponentData(result.totalLeafCount);
        setTotalLeaftChartComponentData(result.leafData);
    }

    async function GetCustomerLeafCountDetailsByUserForBarChart(customerDetails) {
        const result = await services.GetCustomerLeafCountDetailsForBarChart(customerDetails)
        // setTotalLeafBarChartComponentData(100);
        setTotalLeafBarChartComponentData(result.leafData);
    }

    async function GetCustomerMonthlyIncomeDetailsByUser(customerDetails) {
        const result = await services.GetCustomerMonthlyIncomeDetails(customerDetails)
        setAverageMonthlyIncomeComponetData(result === null ? 0 : result.totalIncome)
    }

    async function GetCustomerRelatedAccountDetails(customerDetails) {
        const result = await services.GetCustomeRelatedAccountDetails(customerDetails);
        setCustomerRelatedAccountList(result);
        return result;
    }

    async function GetCustomerHistoryDetailViewDetails(customerDetails) {
        const result = await services.GetCustomerHistoryDetails(customerDetails);
        result.length > 0 ? setCustomerHistoryData(result) : setCustomerHistoryData(null)
    };

    async function GetAllTransactionsTypes() {
        const result = await services.GetAllTransactionsTypes();
        result.length > 0 ? setTransactionTypes(result) : setTransactionTypes(null)
    };

    async function GetNumberOfLeafCollectedDays(customerDetails) {
        const result = await services.GetTotalNumberOfLeafColelctedDays(customerDetails)
        setNumberOfLeafCollectedDays(result === null ? 0 : result.numberOfLeafCollectedDays)
    }

    async function GetPastCropWeightDetails(customerDetails) {
        const result = await services.GetPastCropWeightDetails(customerDetails);
        if (result.length > 0) {
            setPastCropDetailsComponentData(result)
        }
    }


    //Function for the all component data Fetching end

    return (
        <>
            <UserStatisticsExportComponentContainer
                AdvancedTakenData={AdvancedTakenData}
                TotalLeafCountComponentData={TotalLeafCountComponentData}
                AverageMonthlyIncomeComponetData={AverageMonthlyIncomeComponetData}
                UserBiometricDetailss={UserBiometricDetails}
                CustomerOverAllViewComponentData={CustomerOverAllViewComponentData}
                TotalLeaftChartComponentData={TotalLeaftChartComponentData}
                CustomerRelatedAccountList={CustomerRelatedAccountList}
                getUserAccountDetails={getUserDetails}
                DefaultSelectAccount={SelectedAccountNumber}
                customerHistoryData={customerHistoryData}
                GetTransactionDetailsByType={getTransactionDetailsByType}
                IsDefaultAccount={IsDefaultAccount}
                SelectedMonth={SelectedMonth}
                setSelectedMonth={setSelectedMonth}
                CoveredArea={CoveredArea}
                SelectedTransactionType={SelectedTransactionType}
                setSelectedTransactionType={setSelectedTransactionType}
                TransactionTypes={TransactionTypes}
                NumberOfLeafCollectedDays={NumberOfLeafCollectedDays}
                TotalLeafBarChartComponentData={TotalLeafBarChartComponentData}
                PastCropDetailsComponentData={PastCropDetailsComponentData}
            />
        </>
    )
}
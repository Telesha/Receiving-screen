import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';
import Loadash from 'lodash';

import {
    startOfMonth,
    addMonths,
} from 'date-fns';
import moment from 'moment';

export default {
    GetAdvancedTakenDetails,
    GetCustomerOverallDetails,
    GetCustomerLeafCountDetails,
    GetCustomerMonthlyIncomeDetails,
    GetCustomerBiomatricDetails,
    GetCustomeRelatedAccountDetails,
    GetCustomerHistoryDetails,
    GetCustomeCoveredAreaDetails,
    GetAllTransactionsTypes,
    GetTotalNumberOfLeafColelctedDays,
    GetCustomerLeafCountDetailsForBarChart,
    GetPastCropWeightDetails,
};

async function GetCustomerBiomatricDetails(customerDetails) {
    let response = await CommonPost('/api/UserStatistics/GetCustomerBiometricDetails', null, customerDetails);
    let object = {
        customerBiometricData: response.data.customerBiometricData,
        customerID: response.data.customerID,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        nic: response.data.nic,
        registrationNumber: response.data.registrationNumber,
        secondName: response.data.secondName,
    };
    return response;
}

async function GetAdvancedTakenDetails(customerDetails) {
    let response = await CommonPost('/api/UserStatistics/GetCustomerAdvancedTakenDetails', null, customerDetails);
    return response.data;
}

async function GetCustomerOverallDetails(customerDetails) {

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const sorter = (a, b) => {
        if (a.ySort !== b.ySort) {
            return a.ySort - b.ySort;
        } else {
            return months.indexOf(a.mSort) - months.indexOf(b.mSort);
        };
    };

    let response = await CommonPost('/api/UserStatistics/GetCustomerOverallTransactionDetails', null, customerDetails);

    let CreditDetailsArray = response.data.creditDetails;
    let DebitDetailsArray = response.data.debitDetails;

    const MergedDetailsArray = Loadash.merge(Loadash.keyBy(CreditDetailsArray, 'monthNumber'), Loadash.keyBy(DebitDetailsArray, 'monthNumber'));
    var array = Loadash.values(MergedDetailsArray)
    let sortedArray = array.sort(sorter);

    var monthArray = [];
    var creditAmount = [];
    var debitAmount = [];

    for (let item of Object.entries(sortedArray)) {
        monthArray.push(item[1].month);
        item[1]["creditAmount"] != undefined ?
            creditAmount.push(item[1]["creditAmount"]) :
            creditAmount.push(0);

        item[1]["totalAmount"] != undefined ?
            debitAmount.push(item[1]["totalAmount"]) :
            debitAmount.push(0)
    };

    let object = {
        datasets: [
            {
                backgroundColor: 'rgba(121, 255, 122, 0.8)',
                data: creditAmount,
                label: 'Credit'
            },
            {
                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                data: debitAmount,
                label: 'Debit'
            }
        ],
        labels: monthArray
    };

    return object;
}

async function GetCustomerLeafCountDetails(customerDetails) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; //Month Names For the Sorting
    const colorArray = [
        { background: "rgba(121, 255, 122, 0.3)", border: "rgba(121, 255, 122, 1)" },
        { background: "rgba(72, 69, 255, 0.3)", border: "rgba(72, 69, 255, 1)" },
        { background: "rgba(135, 0, 226, 0.3)", border: "rgba(135, 0, 226, 1)" },
        { background: "rgba(255, 156, 0, 0.3)", border: "rgba(255, 156, 0, 1)" },
        { background: "rgba(255, 0, 0, 0.3)", border: "rgba(255, 0, 0, 1)" },
        { background: "rgba(100, 0, 0, 0.3)", border: "rgba(100, 0, 0, 1)" },
        { background: "rgba(124, 179, 66, 0.3)", border: "rgba(124, 179, 66, 1)" },
        { background: "rgba(0, 229, 255, 0.3)", border: "rgba(0, 229, 255, 1)" },
        { background: "rgba(236, 64, 122, 0.3)", border: "rgba(236, 64, 122, 1))" },
        { background: "rgba(0, 137, 123, 0.3)", border: "rgba(0, 137, 123, 1)" }
    ]; //Colors For the line chart '{background : having opasity color, border : having full color}'

    const sorter = (a, b) => {
        if (a.ySort !== b.ySort) {
            return a.ySort - b.ySort;
        } else {
            return months.indexOf(a.mSort) - months.indexOf(b.mSort);
        };
    }; //Sorting acording to the month

    const response = await CommonPost('/api/UserStatistics/GetCustomerLeafCountDetails', null, customerDetails);
    let dataArray = response.data;

    let totalLeafCount = 0;
    let renamedArray = []
    let collectionTypeNamesArray = [];
    let mergedArray = []
    let dataSetArray = []
    let finalDataListArray = []
    let monthNameArray = [];

    for (let index = 0; index < dataArray.length; index++) {

        let collectionTypeName = dataArray[index].collectionTypeName
        collectionTypeNamesArray.push(collectionTypeName)
        let temp = dataArray[index].normalLeafCollection

        finalDataListArray.push({
            name: collectionTypeName,
            object: []
        });

        const newArray = temp.map(item => {
            return { mSort: item.mSort, month: item.month, monthNumber: item.monthNumber, [collectionTypeName]: item.normalLeafAmount, ySort: item.ySort };
        });

        renamedArray.push(newArray);
    }

    for (let index = 0; index < renamedArray.length; index++) {
        mergedArray = Loadash.merge(Loadash.keyBy(mergedArray, 'monthNumber'), Loadash.keyBy(renamedArray[index], 'monthNumber'));
    } // Merge objects in array by 'monthNumber' key

    let array = Loadash.values(mergedArray) // Converting loadash merged array in to array.
    let sortedArray = array.sort(sorter); //Sorting array acording to the month-year

    for (let sortedObject of Object.entries(sortedArray)) {
        monthNameArray.push(sortedObject[1].month);
        for (let collectionTypeName of collectionTypeNamesArray) {
            for (let finalDataObject of finalDataListArray) {
                if (finalDataObject.name === collectionTypeName) {
                    if (sortedObject[1][collectionTypeName] != undefined) {
                        finalDataObject.object.push(sortedObject[1][collectionTypeName]);
                        totalLeafCount += sortedObject[1][collectionTypeName]
                    } else {
                        finalDataObject.object.push(0);
                    }
                }
            }
        }
    }; //Iterating sorted array -> selecting the correct collection type -> if collection type has value push it else push 0

    for (let i = 0; i < finalDataListArray.length; i++) {
        dataSetArray.push({
            label: finalDataListArray[i].name,
            data: finalDataListArray[i].object,
            fill: true,
            backgroundColor: colorArray[i]["background"],
            borderColor: colorArray[i]["border"]
        })
    } //Adding filterd , sorted, merged month details and values to the chart dataSet array

    let returnModel = {
        leafData: {
            labels: monthNameArray,
            datasets: dataSetArray
        },
        totalLeafCount: totalLeafCount
    }; //Create final data object for the chart

    return returnModel;
}

async function GetCustomerMonthlyIncomeDetails(customerDetails) {
    let response = await CommonPost('/api/UserStatistics/GetCustomerMonthlyIncomeDetails', null, customerDetails);
    return response.data;
}

async function GetCustomerHistoryDetails(customerDetails) {
    let response = await CommonPost('/api/CustomerHistory/GetCustomerTransactionDetailsByRegAndNIC', null, customerDetails);
    return response.data;
}

async function GetCustomeRelatedAccountDetails(customerDetails) {
    let response = await CommonPost('/api/UserStatistics/GetCustomerRelatedAccountDetails', null, customerDetails);
    return response.data;
}

async function GetCustomeCoveredAreaDetails(customerDetails) {
    let response = await CommonPost('/api/UserStatistics/GetCustomerCoveredArea', null, customerDetails);
    return response.data;
}

async function GetAllTransactionsTypes() {
    let response = await CommonGet('/api/UserStatistics/GetAllTransactionType', null);
    let transactionTypeArray = [];
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] === true) {
            transactionTypeArray[item[1]["transactionTypeID"]] = item[1]["transactionTypeName"] + " - " + item[1]["transactionTypeCode"];
        }
    }
    return transactionTypeArray;
}

async function GetTotalNumberOfLeafColelctedDays(customerDetails) {
    let response = await CommonPost('/api/UserStatistics/GetCustomerTeafCollectedNumberOfDays', null, customerDetails);
    return response.data;
}

async function GetPastCropWeightDetails(customerDetails) {
    let response = await CommonPost('/api/UserStatistics/GetPastCropWeightDetails', null, customerDetails)
    return response.data;
}

async function GetCustomerLeafCountDetailsForBarChart(customerDetails) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; //Month Names For the Sorting
    const colorArray = [
        { background: "rgba(121, 255, 122, 0.8)", border: "rgba(121, 255, 122, 1)" },
        { background: "rgba(72, 69, 255, 0.8)", border: "rgba(72, 69, 255, 1)" },
        { background: "rgba(135, 0, 226, 0.8)", border: "rgba(135, 0, 226, 1)" },
        { background: "rgba(255, 156, 0, 0.8)", border: "rgba(255, 156, 0, 1)" },
        { background: "rgba(255, 0, 0, 0.8)", border: "rgba(255, 0, 0, 1)" },
        { background: "rgba(100, 0, 0, 0.8)", border: "rgba(100, 0, 0, 1)" },
        { background: "rgba(124, 179, 66, 0.8)", border: "rgba(124, 179, 66, 1)" },
        { background: "rgba(0, 229, 255, 0.8)", border: "rgba(0, 229, 255, 1)" },
        { background: "rgba(236, 64, 122, 0.8)", border: "rgba(236, 64, 122, 1))" },
        { background: "rgba(0, 137, 123, 0.8)", border: "rgba(0, 137, 123, 1)" }

    ];

    let startString = (moment(startOfMonth(addMonths(new Date(), -1))).format()).toString().split('T')[0]

    let newCustomerDetails = {
        groupID: customerDetails.groupID,
        factoryID: customerDetails.factoryID,
        customerNIC: customerDetails.customerNIC,
        customerRegistrationNumber: customerDetails.customerRegistrationNumber,
        startDate: startString,
        endDate: customerDetails.endDate,
        transactionTypeID: customerDetails.transactionTypeID
    };

    const response = await CommonPost('/api/UserStatistics/GetCustomerTotalLeafCountDetailsForBarChart', null, newCustomerDetails);
    let dataArray = response.data;

    let renamedArray = []
    let collectionTypeNamesArray = [];
    let mergedArray = []
    let dataSetArray = []
    let finalDataListArray = []
    let monthNameArray = [];

    for (let index = 0; index < dataArray.length; index++) {

        let collectionTypeName = dataArray[index].collectionTypeName
        collectionTypeNamesArray.push(collectionTypeName)
        let temp = dataArray[index].leafCollection

        finalDataListArray.push({
            name: collectionTypeName,
            object: []
        });

        const newArray = temp.map(item => {
            return {
                mSort: item.mSort,
                month: item.month,
                dSort: item.dSort,
                monthNumber: item.monthNumber,
                [collectionTypeName]: item.leafAmount,
                ySort: item.ySort
            };
        });

        renamedArray.push(newArray);
    }

    for (let index = 0; index < renamedArray.length; index++) {
        mergedArray = Loadash.merge(Loadash.keyBy(mergedArray, 'dSort'), Loadash.keyBy(renamedArray[index], 'dSort'));
    }

    let array = Loadash.values(mergedArray);

    let sortedArray2 = array.sort(function compare(a, b) {
        var dateA = new Date(a.dSort);
        var dateB = new Date(b.dSort);
        return dateA - dateB;
    });

    for (let sortedObject of Object.entries(sortedArray2)) {
        let month = months[(sortedObject[1].dSort.split('/')[0] - 1)]
        let date = sortedObject[1].dSort.split('/')[1]
        monthNameArray.push(month + ' ' + date);
        for (let collectionTypeName of collectionTypeNamesArray) {
            for (let finalDataObject of finalDataListArray) {
                if (finalDataObject.name === collectionTypeName) {
                    if (sortedObject[1][collectionTypeName] != undefined) {
                        finalDataObject.object.push(sortedObject[1][collectionTypeName]);

                    } else {
                        finalDataObject.object.push(0);
                    }
                }
            }
        }
    };
    for (let i = 0; i < finalDataListArray.length; i++) {
        dataSetArray.push({
            label: finalDataListArray[i].name,
            data: finalDataListArray[i].object,
            backgroundColor: colorArray[i]["background"]
        })
    }
    let returnModel = {
        leafData: {
            labels: monthNameArray,
            datasets: dataSetArray
        }

    };

    return returnModel;
}

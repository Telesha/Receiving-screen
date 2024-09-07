import { CommonGet, CommonPost } from '../../../src/helpers/HttpClient';
export default {
    GetAllGroups,
    GetFactoryByGroupID,
    GetCustomerNameByRegNumber,
    UploadTransactionDetails,
    GetTransactionTypeDetailsByFilter,
    GetCurrentBalancePaymnetDetail
}

async function GetAllGroups() {
    let response = await CommonGet('/api/Group/GetAllGroups');
    let groupArray = [];
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] === true) {
            groupArray[item[1]["groupID"]] = item[1]["groupName"];
        }
    }
    return groupArray;
};

async function GetFactoryByGroupID(groupID) {
    let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
    let factoryArray = [];
    for (let item of Object.entries(response.data)) {
        factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
    }
    return factoryArray;
};



async function GetCustomerNameByRegNumber(groupID, factoryID, registrationNumber) {
    let response = await CommonGet('/api/Customer/GetCustomerNameByRegNumber', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&registrationNumber=" + parseInt(registrationNumber));
    return response.data;
};

async function UploadTransactionDetails(transactionDetails) {
    let response = await CommonPost('/api/ManualUploadTransaction/UploadTransactionDetails', null, transactionDetails);
    return response;
};

async function GetCurrentBalancePaymnetDetail(groupID, factoryID) {
    let response = await CommonGet('/api/BalancePayment/CheckISBalancePaymentCompleted', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
    return response.data;
}

async function GetTransactionTypeDetailsByFilter() {
    let responsed = await CommonPost('/api/ManualUploadTransaction/GetFilteredManualTransactionTypes', null)
    let tempArray = responsed.data;
    return tempArray;
}
import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    GetCustomerBiomatricDetails,
    GetAllGroups,
    GetFactoryByGroupID,
    GetAllLoanDetails,
    GetLoanDetailsByLoanID,
    GetLoanTypeDetails,
    SaveLoanRequest,
    ApproveLoanRequest,
    RejectLoanRequest,
    IssueLoanRequest,
    GetLoanTransactionDetailsByLoanID,
    GetLoanArrearsDetailsByLoanID,
    GetCustomerRelatedRegNumbers,
    SaveLoanReshedulementRequest,
    SaveLoanHoldRequest,
    SaveLoanSettlementFine,
    getCustomerDetailsNameAndRouteName,
    getCurrentBalancePaymnetDetail
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

async function GetCustomerBiomatricDetails(customerDetails) {
    let response = await CommonPost('/api/UserStatistics/GetCustomerBiometricDetails', null, customerDetails);
    return response;
}

async function GetAllLoanDetails(loanDetails) {
    let response = await CommonPost('/api/Loan/GetAllLoanRequests', null, loanDetails);
    return response.data;
}

async function GetLoanDetailsByLoanID(customerloanID) {
    let response = await CommonGet('/api/Loan/GetCustomerLoanApprovalDetails', "customerLoanID=" + parseInt(customerloanID));
    return response.data;
}

async function GetLoanTypeDetails() {
    let response = await CommonGet('/api/Loan/GetLoanTypeDetails');

    let LoanTypeArray = [];
    for (let item of Object.entries(response.data)) {
        LoanTypeArray.push({
            key: item[1]["loanTypeID"], name: item[1]["name"], price: item[1]["annualInterestRate"]
        });
    }
    return LoanTypeArray;
}

async function SaveLoanRequest(loanDetails) {
    let response = await CommonPost('/api/Loan/SaveLoanRequest', null, loanDetails);
    return response;
}

async function ApproveLoanRequest(loanDetails) {
    let response = await CommonPost('/api/Loan/ApproveLoanRequest', null, loanDetails);
    return response;
}

async function IssueLoanRequest(loanDetails) {
    let response = await CommonPost('/api/Loan/IssueLoanRequest', null, loanDetails);
    return response;
}

async function RejectLoanRequest(loanDetails) {
    let response = await CommonPost('/api/Loan/RejectLoanRequest', null, loanDetails);
    return response;
}

async function GetLoanTransactionDetailsByLoanID(customerloanID) {
    let response = await CommonGet('/api/Loan/GetCustomerLoanTransactionDetails', "customerLoanID=" + parseInt(customerloanID));
    return response.data;
}

async function GetLoanArrearsDetailsByLoanID(customerloanID) {
    let response = await CommonGet('/api/Loan/GetCustomerLoanArrearsDetails', "customerLoanID=" + parseInt(customerloanID));
    return response.data;
}

async function GetCustomerRelatedRegNumbers(customerDetails) {
    let response = await CommonPost('/api/UserStatistics/GetCustomerRelatedAccountDetails', null, customerDetails);
    return response.data;
}

async function SaveLoanReshedulementRequest(loanDetails) {
    let response = await CommonPost('/api/Loan/SaveLoanReshedulementRequest', null, loanDetails);
    return response;
}

async function SaveLoanHoldRequest(loanDetails) {
    let response = await CommonPost('/api/Loan/SaveLoanHoldRequest', null, loanDetails);
    return response;
}

async function SaveLoanSettlementFine(settlementDetails) {
    let response = await CommonPost('/api/Loan/SaveLoanSettlementRequest', null, settlementDetails);
    return response;
}

async function getCustomerDetailsNameAndRouteName(groupID, factoryID, registrationNumber) {
    let response = await CommonGet('/api/Customer/GetCustomerDetailsNameAndRouteName', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&registrationNumber=" + registrationNumber);
    return response;
}

async function getCurrentBalancePaymnetDetail(factoryID) {
    let response = await CommonGet('/api/Loan/CheckISBalancePaymentFinished', "factoryID=" + parseInt(factoryID));
    return response.data;
}
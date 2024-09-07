import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import Loadash from 'lodash';

export default {
    GetEmployeeBiometricDetails,
    GetAllGroups,
    GetFactoryByGroupID,
    getDivisionDetailsByEstateID,
    GetAllEmployeeLoanRequests,
    GetEmployeeLoanApprovalDetails,
    GetLoanTypeDetails,
    SaveEmployeeLoanRequest,
    ApproveEmployeeLoanRequest,
    RejectEmployeeLoanRequest,
    IssueEmployeeLoanRequests,
    GetEmployeeLoanTransactionDetails,
    GetEmployeeLoanArrearsDetails,
    GetCustomerRelatedRegNumbers,
    SaveEmployeeLoanReshedulementRequest,
    SaveEmployeeLoanHoldRequest,
    SaveEmployeeLoanSettlementRequest,
    getEmployeeDetailsNameAndDivisionName
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

async function getDivisionDetailsByEstateID(estateID) {
    let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
    let divisionArray = [];
    for (let item of Object.entries(response.data)) {
        divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
    }
    return divisionArray;
};

async function GetEmployeeBiometricDetails(customerDetails) {
    let response = await CommonPost('/api/EmployeeLoan/GetEmployeeBiometricDetails', null, customerDetails);
    console.log('response', response)
    return response;
}

async function GetAllEmployeeLoanRequests(loanDetails) {
    let response = await CommonPost('/api/EmployeeLoan/GetAllEmployeeLoanRequests', null, loanDetails);
    console.log('response', response)
    return response.data;
}

async function GetEmployeeLoanApprovalDetails(employeeLoanID) {
    let response = await CommonGet('/api/EmployeeLoan/GetEmployeeLoanApprovalDetails', "employeeLoanID=" + parseInt(employeeLoanID));
    return response.data;
}

async function GetLoanTypeDetails() {
    let response = await CommonGet('/api/EmployeeLoan/GetEmployeeLoanTypeDetails');

    let LoanTypeArray = [];
    for (let item of Object.entries(response.data)) {
        LoanTypeArray.push({
            key: item[1]["loanTypeID"], name: item[1]["name"], price: item[1]["annualInterestRate"]
        });
    }
    return LoanTypeArray;
}

async function SaveEmployeeLoanRequest(loanDetails) {
    let response = await CommonPost('/api/EmployeeLoan/SaveEmployeeLoanRequest', null, loanDetails);
    return response;
}

async function ApproveEmployeeLoanRequest(loanDetails) {
    let response = await CommonPost('/api/EmployeeLoan/ApproveEmployeeLoanRequest', null, loanDetails);
    return response;
}

async function IssueEmployeeLoanRequests(loanDetails) {
    let response = await CommonPost('/api/EmployeeLoan/IssueEmployeeLoanRequests', null, loanDetails);
    return response;
}

async function RejectEmployeeLoanRequest(loanDetails) {
    let response = await CommonPost('/api/EmployeeLoan/RejectEmployeeLoanRequest', null, loanDetails);
    return response;
}

async function GetEmployeeLoanTransactionDetails(employeeLoanID) {
    let response = await CommonGet('/api/EmployeeLoan/GetEmployeeLoanTransactionDetails', "employeeLoanID=" + parseInt(employeeLoanID));
    return response.data;
}

async function GetEmployeeLoanArrearsDetails(employeeLoanID) {
    let response = await CommonGet('/api/EmployeeLoan/GetEmployeeLoanArrearsDetails', "employeeLoanID=" + parseInt(employeeLoanID));
    return response.data;
}

async function GetCustomerRelatedRegNumbers(customerDetails) {
    let response = await CommonPost('/api/UserStatistics/GetCustomerRelatedAccountDetails', null, customerDetails);
    return response.data;
}

async function SaveEmployeeLoanReshedulementRequest(loanDetails) {
    let response = await CommonPost('/api/EmployeeLoan/SaveEmployeeLoanReshedulementRequest', null, loanDetails);
    return response;
}

async function SaveEmployeeLoanHoldRequest(loanDetails) {
    let response = await CommonPost('/api/EmployeeLoan/SaveEmployeeLoanHoldRequest', null, loanDetails);
    return response;
}

async function SaveEmployeeLoanSettlementRequest(settlementDetails) {
    let response = await CommonPost('/api/EmployeeLoan/SaveEmployeeLoanSettlementRequest', null, settlementDetails);
    return response;
}

async function getEmployeeDetailsNameAndDivisionName(factoryID, divisionID, registrationNumber) {
    let response = await CommonGet('/api/EmployeeLoan/GetEmployeeDetailsNameAndDivisionName', "factoryID=" + parseInt(factoryID) + "&divisionID=" + parseInt(divisionID) + "&registrationNumber=" + registrationNumber);
    return response;
}
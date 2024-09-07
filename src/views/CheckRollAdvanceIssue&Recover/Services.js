import { mode } from 'crypto-js';
import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';
import moment from 'moment';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getCustomerCurrentMonthPaymentFullDetails,
  getDivisionDetailsByEstateID,
  saveAdvanceAmount,
  GetAdvanceAmountDetails,
  DeleteAdvanceDetails,
  getDetailsByAdvanceIssueID,
  updateAdvanceAmount,
  GetEmpNamebyRegNo,
  GetEmployeeSalaryAndAttendenceDetailsForCommonCard
};

async function getAllGroups() {
  let response = await CommonGet('/api/Group/GetAllGroups');
  let groupArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"];
    }
  }
  return groupArray;
};

async function getFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return factoryArray;
};

async function getDivisionDetailsByEstateID(factoryID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(factoryID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getCustomerCurrentMonthPaymentFullDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentMonthPaymentFullDetails', null, newModel)
  return response.data;
}

async function saveAdvanceAmount(advanceIssue) {
  let saveModel = {
    groupID: parseInt(advanceIssue.groupID),
    factoryID: parseInt(advanceIssue.factoryID),
    divisionID: parseInt(advanceIssue.divisionID),
    registrationNumber: advanceIssue.registrationNumber,
    date: advanceIssue.date,
    advance: advanceIssue.advance,
    createdBy: parseInt(tokenDecoder.getUserIDFromToken())
  }
  const response = await CommonPost('/api/AdvanceIssueRecover/SaveAdvanceAmount', null, saveModel)
  return response;
}

async function GetAdvanceAmountDetails(model) {
  let response = await CommonPost('/api/AdvanceIssueRecover/GetAdvanceDetails', null, model)
  return response;
}

async function DeleteAdvanceDetails(advanceIssueID) {
  let model = {
    advanceIssueID: advanceIssueID,
    modifiedBy: parseInt(tokenDecoder.getUserIDFromToken())
  }
  const response = await CommonPost('/api/AdvanceIssueRecover/DeleteLoanDetails', null, model)
  return response;
}

async function getDetailsByAdvanceIssueID(advanceIssueID) {
  let response = await CommonPost('/api/AdvanceIssueRecover/GetDetailsByAdvanceIssueID', "advanceIssueID=" + parseInt(advanceIssueID))
  return response.data;
}

async function updateAdvanceAmount(model) {
  const response = await CommonPost('/api/AdvanceIssueRecover/UpdateAdvanceAmount', null, model);
  return response;
}

async function GetEmpNamebyRegNo(groupID, factoryID, divisionID, registrationNumber) {
  const response = await CommonGet('/api/AdvanceIssueRecover/GetEmpNamebyRegNo', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&divisionID=" + parseInt(divisionID) + "&registrationNumber=" + registrationNumber);
  return response;
}

async function GetEmployeeSalaryAndAttendenceDetailsForCommonCard(registrationNumber, date, divisionID) {
  const response = await CommonGet('/api/Employee/GetEmployeeSalaryAndAttendenceDetailsForCommonCard', "registrationNumber=" + registrationNumber + "&date=" + moment(date).format("YYYY-MM-DD") + "&divisionID=" + parseInt(divisionID))
  return response.data;
}


import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  saveAdvancePayment,
  getAdvancePaymentRequestDetails,
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getRoutesForDropDown,
  updateAdvancePayment,
  getCustomersForDropDown,
  getCustomersListForDropDown,
  getRegistrationNumbersForDropDown,
  getCustomerAccountNo,
  getCustomerAccountBalance,
  getCustomerAdavanceDetails,
  getMinMaxRateByApplicableMonthAndYear,
  getCollectionTypeDetailsByID,
  getCustomerAdavancePaymentDetails,
  getCustomerFactoryItemTotalDetails,
  getCustomerLoanTotalDetails,
  getCustomerBalancePaymentDetails,
  getCustomerCurrentAdvancePaymentDetails,
  getCurrentMinMaxRateByApplicableMonthAndYear,
  getCustomerCurrentAdavanceDetails,
  getCustomerCurrentFactoryItemTotalDetails,
  getCustomerCurrentLoanTotalDetails,
  getBalanceMinMaxRateByApplicableMonthAndYear,
  getCustomerAccountBalanceByRedis,
  getCustomerDetails,
  approveAdvancePaymentDetails,
  getApprovedDetailsByID,
  IssueAdvancePayment,
  RejectAdvancePayment,
  getCustomerTransportTotalDetails,
  getCustomerCurrentTransportTotalDetails,
  GetCustomerPreviouseAllDetails,
  GetCustomerCurrentAllDetails,
  SendToDeliverAdvancePayment

};

async function SendToDeliverAdvancePayment(data) {
  let approveModel = {
    advancePaymentRequestID: parseInt(data.advancePaymentRequestID),
    requestedAmount: parseFloat(data.requestedAmount),
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
    customerID: data.customerID,
    customerAccountID: data.customerAccountID,
    approvedAmount: parseFloat(data.approvedAmount),
    previouseAvailableBalance: data.previouseBalance,
    currentAvailableBalance: data.currentBalance,
    groupID: parseInt(data.groupID),
    factoryID: parseInt(data.factoryID)
  }
  const response = await CommonPost('/api/AdvancePaymentApproval/SendToDeliverAdvancePayment', null, approveModel);
  return response;
}

async function approveAdvancePaymentDetails(finalModel) {
  const response = await CommonPost('/api/AdvancePayment/approveAdvancePaymentDetails', null, finalModel);
  return response;
}

async function getCustomerDetails(groupID, factoryID, regNo) {
  const response = await CommonGet('/api/Customer/GetCustomerDetailsForAdvancePayment', 'groupID=' + groupID + '&factoryID=' + factoryID + '&registrationNumber=' + regNo);
  return response;
}

async function getCustomerAccountBalanceByRedis(customerID, customerAccountID) {
  const response = await CommonGet('/api/Customer/GetCustomerAccountBalance', 'customerID=' + customerID + '&customerAccountID=' + customerAccountID);
  return response.balance;
}

async function getBalanceMinMaxRateByApplicableMonthAndYear(factoryID) {
  const response = await CommonGet('/api/AdvancePayment/GetBalanceMinMaxRateByApplicableMonthAndYear', 'factoryID=' + factoryID)
  return response.data;
}

async function getCustomerCurrentLoanTotalDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentLoanTotalDetails', null, newModel)
  return response.data;
}

async function getCustomerCurrentFactoryItemTotalDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentFactoryItemTotalDetails', null, newModel)
  return response.data;
}

async function getCustomerCurrentAdavanceDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentAdavanceDetails', null, newModel)
  return response.data;
}

async function getCurrentMinMaxRateByApplicableMonthAndYear(factoryID) {
  const response = await CommonGet('/api/AdvancePayment/GetCurrentMinMaxRateByApplicableMonthAndYear', 'factoryID=' + factoryID)
  return response.data;
}

async function getCustomerCurrentAdvancePaymentDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentAdvancePaymentDetails', null, newModel)
  return response.data;
}

async function getCustomerBalancePaymentDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber,
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerBalancePaymentDetails', null, newModel)
  return response.data;
}

async function getCustomerLoanTotalDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerLoanTotalDetails', null, newModel)
  return response.data;
}

async function getCustomerFactoryItemTotalDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerFactoryItemTotalDetails', null, newModel)
  return response.data;
}

async function getCustomerAdavancePaymentDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerAdavancePaymentDetails', null, newModel)
  return response.data;
}

async function getCollectionTypeDetailsByID(collectionTypeID) {
  const response = await CommonGet('/api/CollectionType/getCollectionTypeDetailsByID', 'collectionTypeID=' + collectionTypeID)
  return response.data;
}

async function getMinMaxRateByApplicableMonthAndYear(factoryID) {
  const response = await CommonGet('/api/AdvancePayment/GetMinMaxRateByApplicableMonthAndYear', 'factoryID=' + factoryID);
  return response.data;
}

async function getCustomerAdavanceDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerAdavanceDetails', null, newModel)
  return response.data;
}

async function getCustomerAccountBalance(customerID, customerAccountNo) {
  const response = await CommonGet('/api/Customer/GetCustomerAccountBalance', 'customerID=' + customerID + "&customerAccountID=" + customerAccountNo)
  return response;
}

async function getCustomerAccountNo(customerID, registrationNumber) {
  const response = await CommonGet('/api/Customer/GetCustomerAccountNo', 'customerID=' + customerID + "&registrationNumber=" + registrationNumber)
  return response.data;
}

async function getRegistrationNumbersForDropDown(customerID) {
  const response = await CommonGet('/api/Customer/GetRegistrationNumbersByCustomerID', 'customerID=' + customerID)
  return response.data;
}

async function getCustomersListForDropDown(routeID) {
  const response = await CommonGet('/api/Customer/GetCustomersByRouteID', 'routeID=' + routeID)
  return response.data;
}

async function getCustomersForDropDown(routeID) {
  var customerArray = [];
  const response = await CommonGet('/api/Customer/GetCustomersByRouteID', 'routeID=' + routeID)
  for (let item of Object.entries(response.data)) {
    customerArray[item[1]["customerID"]] = item[1]["firstName"]
  }
  return customerArray;
}

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function getfactoriesForDropDown(groupID) {
  var factoryArray = [];

  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}
async function getGroupsForDropdown() {
  var groupArray = [];
  const response = await CommonGet('/api/Group/GetAllGroups', null)
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"]
    }
  }
  return groupArray;
}

async function saveAdvancePayment(Apayment) {
  let saveModel = {
    advancePaymentRequestID: 0,
    customerID: parseInt(Apayment.customerID),
    requestedAmount: parseFloat(Apayment.requestedAmount),
    statusID: Apayment.statusID,
    isActive: Apayment.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    registrationNumber: Apayment.registrationNumber

  }
  const response = await CommonPost('/api/AdvancePayment/SaveAdvancePayment', null, saveModel);
  return response;
}

async function getAdvancePaymentRequestDetails(advancePaymentRequestID) {
  const response = await CommonGet('/api/AdvancePayment/GetAdvancePaymentRequestDetails', "advancePaymentRequestID=" + parseInt(advancePaymentRequestID));
  return response.data;
}

async function updateAdvancePayment(Apayment) {
  let updateModel = {
    advancePaymentRequestID: parseInt(Apayment.advancePaymentRequestID),
    requestedAmount: Apayment.requestedAmount,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/AdvancePayment/UpdateAdvancePayment', null, updateModel);
  return response;
}

async function getApprovedDetailsByID(advancePaymentRequestID) {
  const response = await CommonGet('/api/AdvancePaymentApproval/GetAdvancePaymentApprovedDetailsByID', "advancePaymentRequestID=" + parseInt(advancePaymentRequestID));
  return response.data;
}

async function IssueAdvancePayment(data) {
  let approveModel = {
    advancePaymentRequestID: parseInt(data.advancePaymentRequestID),
    requestedAmount: parseFloat(data.requestedAmount),
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
    customerID: data.customerID,
    customerAccountID: data.customerAccountID,
    approvedAmount: parseFloat(data.approvedAmount),
    previouseAvailableBalance: data.previouseBalance,
    currentAvailableBalance: data.currentBalance,
    groupID: parseInt(data.groupID),
    factoryID: parseInt(data.factoryID)
  }
  const response = await CommonPost('/api/AdvancePaymentApproval/ApproveAdvancePayment', null, approveModel);
  return response;
}

async function RejectAdvancePayment(data) {
  let rejectModel = {
    advancePaymentRequestID: parseInt(data.advancePaymentRequestID),
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/AdvancePaymentApproval/RejectAdvancePayment', null, rejectModel);
  return response;
}

async function getCustomerTransportTotalDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerTransportTotalDetails', null, newModel)
  return response.data;
}

async function getCustomerCurrentTransportTotalDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentTransportTotalDetails', null, newModel)
  return response.data;
}


async function GetCustomerPreviouseAllDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerPreviouseAllDetails', null, newModel)
  return response.data;
}

async function GetCustomerCurrentAllDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentAllDetails', null, newModel)
  return response.data;
}

import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getApprovedDetailsByID,
  getGroupsForDropdown,
  getRoutesByFactoryID,
  getFactoryByGroupID,
  getRouteForDropdown,
  getAdvancePaymentRequest,
  RejectAdvancePayment,
  ApproveAdvancePayment,
  getCustomerAccountBalance,
  getCustomersListForDropDown,
  getApprovalDetailsBNyRegNumberDetails
};

async function getApprovalDetailsBNyRegNumberDetails(groupID, factoryID, regNo) {
  const response = await CommonGet('/api/AdvancePaymentApproval/GetApprovalDetailsBNyRegNumberDetails', 'groupID=' + groupID + '&factoryID=' + factoryID + '&registrationNumber=' + regNo);
  return response.data;
}

async function getCustomersListForDropDown(routeID) {
  const response = await CommonGet('/api/Customer/GetCustomersByRouteID', 'routeID=' + routeID)
  return response.data;
}

async function getAdvancePaymentRequest(groupID, factoryID, routeID) {
  const response = await CommonGet('/api/AdvancePaymentApproval/GetAdvancePaymentRequest', "groupID=" + parseInt(groupID) + '&factoryID=' + factoryID + "&routeID=" + parseInt(routeID));
  return response.data;
}

async function getRoutesByFactoryID(factoryID) {
  const response = await CommonGet('/api/Route/GetRoutesByFactoryID', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function getRouteForDropdown(factoryID) {
  var routeArray = [];
  const response = await CommonGet('/api/Route/GetRoutesByFactoryID', "factoryID=" + parseInt(factoryID));
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      routeArray[item[1]["routeID"]] = item[1]["routeName"]
    }
  }
  return routeArray;
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

async function getApprovedDetailsByID(advancePaymentRequestID) {
  const response = await CommonGet('/api/AdvancePaymentApproval/GetAdvancePaymentApprovedDetailsByID', "advancePaymentRequestID=" + parseInt(advancePaymentRequestID));
  return response.data;
}

async function getFactoryByGroupID(groupID) {
  var factoryArray = [];

  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
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

async function ApproveAdvancePayment(data) {
  let approveModel = {
    advancePaymentRequestID: parseInt(data.advancePaymentRequestID),
    requestedAmount: parseFloat(data.requestedAmount),
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
    customerID: data.customerID,
    customerAccountID: data.customerAccountID,
  }
  const response = await CommonPost('/api/AdvancePaymentApproval/ApproveAdvancePayment', null, approveModel);
  return response;
}

async function getCustomerAccountBalance(customerID, customerAccountID) {
  const response = await CommonGet('/api/Customer/GetCustomerAccountBalance', "customerID=" + parseInt(customerID) + "&customerAccountID=" + parseInt(customerAccountID));
  return response;
}

import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';
import Loadash from 'lodash';
import { func } from 'prop-types';

export default {
  getApprovedDetailsByID,
  getGroupsForDropdown,
  getRoutesByFactoryID,
  getFactoryByGroupID,
  getRouteForDropdown,
  getFactoryItemrequest,
  getFactoryItemrequestByCustomerIDandRouteID,
  RejectfactoryItem,
  ApproveFactoryItem,
  getCustomerAccountBalance,
  getCustomerGeneralDetails,
  rejectFactoryItemRequest,

  getCurrentMinMaxRateByApplicableMonthAndYear,
  getCustomerPreviousMonthPaymentFullDetails,
  getCustomerCurrentMonthPaymentFullDetails,

  GetFactoryItemList,
  GetSupplierDetailsByFactoryItemID,
  GetFactoryItemGRNListByFactoryItemIDAndSupplierID,
  FactoryItemDirectIssue,
  GetCustomerAccountBalanceByIDs,
  FactoryItemRequestApproval,
  getAllActiveItemCategory,
  getfactoryItemsByItemCategoryID,
  getCurrentBalancePaymnetDetail,
  CheckCustomerISActive,
  GetMobileRequestDetailsByOrderNo,
  RejectFactoryItemMobileRequestByOrderID,
  getCustomerDetailsNameAndRouteName
};

async function CheckCustomerISActive(regNo, factoryID) {
  const response = await CommonGet('/api/Customer/CheckCustomerISActive', 'registrationNumber=' + regNo + '&factoryID=' + factoryID);
  return response;
}
async function getFactoryItemrequestByCustomerIDandRouteID(routeID, customerID) {
  const response = await CommonGet('/api/FactoryItemApproval/GetFactoryItemrequestByCustomerIDandRouteID', "routeID=" + parseInt(routeID) + "&customerID=" + parseInt(customerID));
  return response.data;
}

async function getFactoryItemrequest(routeID) {
  const response = await CommonGet('/api/FactoryItemApproval/GetFactoryItemrequest', "routeID=" + parseInt(routeID));
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

async function getApprovedDetailsByID(factoryItemRequestID) {
  const response = await CommonGet('/api/FactoryItemApproval/GetApprovedDetailsByID', "factoryItemRequestID=" + parseInt(factoryItemRequestID));
  return response.data;
}

async function GetMobileRequestDetailsByOrderNo(orderID) {
  const response = await CommonGet('/api/FactoryItemApproval/GetFactoryItemRequestDetailsByOrderID', "orderID=" + parseInt(orderID));
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

async function RejectfactoryItem(data) {
  let rejectModel = {
    factoryItemRequestID: parseInt(data.factoryItemRequestID),
    reason: data.reason,
    approvedQuantity: parseFloat(data.approvedQuantity),
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/FactoryItemApproval/RejectfactoryItem', null, rejectModel);
  return response;
}

async function ApproveFactoryItem(data) {

  let approveModel = {
    factoryItemRequestID: parseInt(data.factoryItemRequestID),
    reason: data.reason,
    approvedQuantity: parseFloat(data.approvedQuantity),
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
    customerID: data.customerID,
    customerAccountID: data.customerAccountID,
    unitPrice: parseFloat(data.unitPrice),
    totalPrice: parseFloat(data.totalPrice),
    approvedAmount: parseFloat(data.approvedAmount),
    previouseAvailableBalance: parseFloat(data.previouseAvailableBalance),
    currentAvailableBalance: parseFloat(data.currentAvailableBalance),
    factoryItemGRNList: data.factoryItemGRNList
  };

  const response = await CommonPost('/api/FactoryItemApproval/ApproveFactoryItem', null, approveModel);
  return response;
}

async function getCustomerAccountBalance(customerID, customerAccountID) {
  const response = await CommonGet('/api/Customer/GetCustomerAccountBalance', "customerID=" + parseInt(customerID) + "&customerAccountID=" + parseInt(customerAccountID));
  return response;
}

async function getCustomerGeneralDetails(customerID) {
  const response = await CommonGet('/api/Customer/GetCustomerGeneralDetailsByCustomerID', "customerID=" + parseInt(customerID));
  return response;
}

async function rejectFactoryItemRequest(factoryItemRequestID, modifiedBy) {
  const response = await CommonGet('/api/FactoryItemApproval/UpdateFactoryRequestItemStatus', "factoryItemRequestID=" + parseInt(factoryItemRequestID) + "&modifiedBy=" + parseInt(tokenDecoder.getUserIDFromToken()));
  return response;
}

//Balance Component Required functions
async function getCurrentMinMaxRateByApplicableMonthAndYear(factoryID) {
  const response = await CommonGet('/api/AdvancePayment/GetCurrentMinMaxRateByApplicableMonthAndYear', 'factoryID=' + factoryID)
  return response.data;
}

async function getCustomerPreviousMonthPaymentFullDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerPreviousMonthPaymentFullDetails', null, newModel)
  return response.data;
}

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

async function GetCustomerAccountBalanceByIDs(factoryID, groupID, registrationNumber) {
  const response = await CommonGet('/api/Customer/GetCustomerDetailsForAdvancePayment', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID) + '&registrationNumber=' + registrationNumber);
  return response.data;
}
//Balance Component Required functions

//Factory Isseu chnages
async function GetFactoryItemList(groupID, factoryID) {
  const response = await CommonGet('/api/FactoryItemIssue/GetActiveFactoryItemDetailsByGroupIDFactoryID', 'factoryID=' + parseInt(factoryID) + '&groupID=' + parseInt(groupID));
  return response.data;
}

async function GetSupplierDetailsByFactoryItemID(factoryItemID) {
  const response = await CommonGet('/api/FactoryItemIssue/GetSupplierDetailsWithEnableGRNByFactoryItemID', 'factoryItemID=' + parseInt(factoryItemID));
  return response.data;
}

async function GetFactoryItemGRNListByFactoryItemIDAndSupplierID(factoryItemID, supplierID) {
  const response = await CommonGet('/api/FactoryItemGrn/GetGRNListByFactoryItemIDandSupplierID', 'factoryItemID=' + parseInt(factoryItemID) + '&supplierID=' + parseInt(supplierID));
  return response.data;
}

async function FactoryItemDirectIssue(itemDetails) {
  const response = await CommonPost('/api/FactoryItemIssue/FactoryItemDirectIssue', null, itemDetails)
 
  return response;
}

async function FactoryItemRequestApproval(itemDetails) {
  const response = await CommonPost('/api/FactoryItemIssue/FactoryItemRequestApproval', null, itemDetails);
  return response;
}

async function getAllActiveItemCategory() {
  const response = await CommonGet('/api/ItemCategory/GetAllActiveItemCategory', null);

  let factoryArray = []
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["itemCategoryID"]] = item[1]["categoryName"]
  }

  return factoryArray;
}

async function getfactoryItemsByItemCategoryID(itemCategoryID, groupID, factoryID) {
  var itemsArray = [];

  const response = await CommonGet('/api/FactoryItem/GetFactoryItemDetailsByItemCategoryID', 'groupID=' + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + '&itemCategoryID=' + parseInt(itemCategoryID))
  for (let item of Object.entries(response.data)) {
    let obj = {
      id: item[1]["factoryItemID"],
      name: item[1]["itemName"]
    };
    itemsArray.push(obj)
  }
  return itemsArray;
}

async function getCurrentBalancePaymnetDetail(groupID, factoryID) {
  let response = await CommonGet('/api/BalancePayment/CheckISBalancePaymentCompleted', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}

async function RejectFactoryItemMobileRequestByOrderID(dataModel) {
  const response = await CommonPost('/api/FactoryItemApproval/RejectFactoryItemRequestByOrderNo', null, dataModel);
  return response;
}

async function getCustomerDetailsNameAndRouteName(groupID, factoryID, registrationNumber) {
  let response = await CommonGet('/api/Customer/GetCustomerDetailsNameAndRouteName', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&registrationNumber=" + registrationNumber);
  return response;
}
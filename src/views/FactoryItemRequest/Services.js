import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  saveFactoryRequest,
  getFactoryrequestDetails,
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getAdjustmentsByFactoryID,
  getavailableQuantity,
  getFactoryItemsByFactoryID,
  getRequestsByFactoryItemIDANDRouteID,
  getRoutesForDropDown,
  getCustomersForDropDown,
  getfactoryItemRequestByRouteID,
  getRegistrationNumbersForDropDown,
  getCustomersListForDropDown,
  getCustomerAccountNo,
  getUnitPriceByFactoryItemID,
  getCustomerAccountBalance,
  getAvailableGrnByFactoryItem,
  getGRNListByFactoryItem,
  GetViewFactoryItemRequestDetails
};

async function getAvailableGrnByFactoryItem(factoryItem) {
  var grnArray = [];

  const response = await CommonGet('/api/FactoryAdjustment/GetAvailableGrnByFactoryItem', 'factoryItem=' + factoryItem)
  for (let item of Object.entries(response.data)) {
    grnArray[item[1]["factoryItemGRNID"]] = item[1]["grnNumber"]
  }
  return grnArray;
}

async function getCustomerAccountBalance(customerID,customerAccountID) {
  const response = await CommonGet('/api/Customer/GetCustomerAccountBalance', "customerID=" + parseInt(customerID)+"&customerAccountID="+parseInt(customerAccountID));
  return response;
}

async function getUnitPriceByFactoryItemID(grnID) {
  const response = await CommonGet('/api/FactoryItem/GetFactoryItemDetailsByID', "factoryItemGRNID=" + parseInt(grnID))
  return response.data;
}

async function getCustomerAccountNo(customerID,registrationNumber) {
  const response = await CommonGet('/api/Customer/GetCustomerAccountNo', 'customerID=' + customerID+'&registrationNumber='+registrationNumber)
  return response.data;
}

async function getCustomersListForDropDown(routeID) {
  const response = await CommonGet('/api/Customer/GetCustomersByRouteID', 'routeID=' + routeID)
  return response.data;
}

async function getRegistrationNumbersForDropDown(customerID) {
  const response = await CommonGet('/api/Customer/GetRegistrationNumbersByCustomerID', 'customerID=' + customerID)
  return response.data;
}

async function getfactoryItemRequestByRouteID(routeID) {
  const response = await CommonGet('/api/FactoryItemRequest/GetfactoryItemRequestByRouteID', "routeID=" + parseInt(routeID));
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

async function getRequestsByFactoryItemIDANDRouteID(factoryItemID, routeID) {
  const response = await CommonGet('/api/FactoryItemRequest/GetRequestsByFactoryItemIDANDRouteID', "factoryItemID=" + parseInt(factoryItemID) + "&routeID=" + parseInt(routeID));
  return response.data;
}

async function getFactoryItemsByFactoryID(factoryID) {
  var factoryItemArray = [];
  const response = await CommonGet('/api/FactoryAdjustment/GetFactoryItemsByFactoryID', "factoryID=" + parseInt(factoryID));
  if (response.data != null) {
    for (let item of Object.entries(response.data)) {
      factoryItemArray[item[1]["factoryItemID"]] = item[1]["itemName"]
    }
    return factoryItemArray;
  } else {
    return;
  }
}

async function getavailableQuantity(grnID) {
  const response = await CommonGet('/api/FactoryAdjustment/GetavailableQuantity', "factoryItemGRNID=" + parseInt(grnID));
  return response.data;
}

async function getAdjustmentsByFactoryID(factoryID) {
  const response = await CommonGet('/api/FactoryAdjustment/GetAdjustmentsByFactoryID', "factoryID=" + parseInt(factoryID));
  return response.data;
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

async function saveFactoryRequest(request) {
  let saveModel = {
    FactoryItemRequestID: 0,
    factoryItemID: parseInt(request.factoryItem),
    requestedQuantity: parseFloat(request.quantity),
    statusID: parseInt(request.statusID),
    customerID: parseInt(request.customerID),
    routeID: parseInt(request.routeID),
    isActive: request.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    registrationNumber: request.registrationNumber,

  }
  const response = await CommonPost('/api/FactoryItemRequest/SaveFactoryItemRequest', null, saveModel);
  return response;
}

async function getFactoryrequestDetails(factoryItemRequestID) {
  const response = await CommonGet('/api/FactoryItemRequest/GetFactoryItemRequestDetails', "factoryItemRequestID=" + parseInt(factoryItemRequestID));
  return response.data;
}

async function getGRNListByFactoryItem(factoryItem) {
  const response = await CommonGet('/api/FactoryItemGrn/GetGRNListByFactoryItem', 'factoryItem=' + factoryItem);
  return response.data;
}

async function GetViewFactoryItemRequestDetails(factoryItemRequestInputModel) {
  
  let response = await CommonPost('/api/FactoryItemRequest/GetViewFactoryItemRequestDetails', null, factoryItemRequestInputModel);
  return response;
}
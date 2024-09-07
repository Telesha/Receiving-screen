import { CommonGet, CommonGetAxios, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  GetAllRoutes,
  saveRoute,
  getCustomerBalancePaymentDetailsByID,
  updateRoute,
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getRoutesByFactoryID,
  getFactoriesByGroupID,
  getAllFactories,
  getRoutesForDropDown,
  getCustomersListForDropDown,
  getCustomerBalancePaymentDetails,
  getCustomersForDropDown,
  getCustomerBalancePaymentDetailsByApplicable,
  getbalancePaymentDetails,
  getCollectionTypeDetails,
  getAdvancePaymentDetails,
  getCustomerBalancePaymentDetailsByPaymantID,
  getCustomerBalancePaymentDetailsByRegistrationNumber,
  IssueCustomerBalancePayment,
  GetCustomerBalancePayementTemeplateName
};

async function GetCustomerBalancePayementTemeplateName(groupID, factoryID) {
  const response = await CommonGet('/api/CustomerBalancePayment/GetCustomerBalancePaymentReceiptTemplateName', "GroupID=" + parseInt(groupID) + "&FactoryID=" + parseInt(factoryID));
  return response;
}

async function getAdvancePaymentDetails(customerBalancePaymentID) {
  const response = await CommonGet('/api/CustomerBalancePayment/GetAdvancePaymentDetails', "customerBalancePaymentID=" + parseInt(customerBalancePaymentID));
  return response.data;
}

async function getCollectionTypeDetails(customerBalancePaymentID) {
  const response = await CommonGet('/api/CustomerBalancePayment/GetCollectionTypeDetails', "customerBalancePaymentID=" + parseInt(customerBalancePaymentID));
  return response.data;
}

async function getbalancePaymentDetails(customerBalancePaymentID) {
  const response = await CommonGet('/api/CustomerBalancePayment/GetbalancePaymentDetails', "customerBalancePaymentID=" + parseInt(customerBalancePaymentID));
  return response.data;
}

async function getCustomerBalancePaymentDetailsByApplicable(groupID, factoryID, routeID, monthYear, customerID, registrationNumber) {
  const response = await CommonGet('/api/CustomerBalancePayment/getCustomerBalancePaymentDetailsByApplicable',
    "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&routeID=" + parseInt(routeID) + "&monthYear=" + monthYear + "&customerID=" + parseInt(customerID) + "&registrationNumber=" + registrationNumber);
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


async function getCustomerBalancePaymentDetails(groupID, factoryID, routeID, customerID) {
  const response = await CommonGet('/api/CustomerBalancePayment/GetCustomerBalancePaymentDetails',
    "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&routeID=" + parseInt(routeID) + "&customerID=" + parseInt(customerID));
  return response.data;
}

async function getCustomersListForDropDown( groupID, factoryID, routeID) {
  const response = await CommonGet('/api/Customer/GetCustomersByID', '&groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID) + '&routeID=' + parseInt(routeID))
  return response.data;
}

async function getAllFactories() {
  var factoryArray = [];
  const response = await CommonGet('/api/Factory/GetAllFactories', null);
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
}

async function getFactoriesByGroupID(groupID) {
  var factoryArray = [];
  const response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
}


async function getRoutesByFactoryID(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function getfactoriesForDropDown() {

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

async function GetAllRoutes() {
  const response = await CommonGet('/api/Route/GetAllRoutes', null);
  return response.data;
}

async function saveRoute(route) {
  let saveModel = {
    routeID: 0,
    routeName: route.routeName,
    routeCode: route.routeCode,
    factoryID: parseInt(route.factoryID),
    routeLocation: route.routeLocation,
    transportRate: parseFloat(route.transportRate),
    targetCrop: route.targetCrop,
    isActive: route.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/Route/SaveRoute', null, saveModel);
  return response;
}
async function updateRoute(route) {
  let updateModel = {
    routeID: parseInt(route.routeID),
    routeName: route.routeName,
    routeCode: route.routeCode,
    factoryID: parseInt(route.factoryID),
    routeLocation: route.routeLocation,
    transportRate: parseFloat(route.transportRate),
    targetCrop: route.targetCrop,
    isActive: route.isActive,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/Route/UpdateRoute', null, updateModel);
  return response;
}

async function getCustomerBalancePaymentDetailsByID(customerBalancePaymentID) {

  const response = await CommonGet('/api/CustomerBalancePayment/getCustomerBalancePaymentDetailsByID', "customerBalancePaymentID=" + parseInt(customerBalancePaymentID));
  return response.data;
}

async function getCustomerBalancePaymentDetailsByPaymantID(customerBalancePaymentID) {
  const response = await CommonGetAxios('/api/CustomerBalancePayment/GetCustomerBalancePaymentDetailsByBalancePaymentID', "customerBalancePaymentID=" + parseInt(customerBalancePaymentID));

  let balancePaymentDetails = {
    statusCode: response.statusCode,
    customerBalancePaymentDetailsModelSingleCall: response.data.customerBalancePaymentDetailsModelSingleCall,
    customerBasicDetailsModel: response.data.customerBasicDetailsModel,
    customerCropDetailsModels: response.data.customerCropDetailsModels,
    customerFactoryItemDetailModel: response.data.customerFactoryItemDetailModel,
    customerLoanDetailModel: response.data.customerLoanDetailModel,
    creditDetailsList: [],
    debitDetailsList: [],
    customerBalancePaymentCutoffAmount: response.data.customerBalancePaymentCutoffAmount
  }

  response.data.customerDeductionDetails.forEach(element => {
    element.entryType === 1 ?
      balancePaymentDetails.creditDetailsList.push(element) :
      balancePaymentDetails.debitDetailsList.push(element)
  });
  return balancePaymentDetails;
}

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}


async function getCustomerBalancePaymentDetailsByRegistrationNumber(groupID, factoryID, routeID, monthYear, customerID, registrationNumber) {
  const response = await CommonGet('/api/CustomerBalancePayment/GetCustomerBalancePaymentDetailsWithRegistrationNumber',
    "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&routeID=" + parseInt(routeID) + "&monthYear=" + monthYear + "&customerID=" + parseInt(customerID) + "&registrationNumber=" + registrationNumber);
  return response.data;
}

async function IssueCustomerBalancePayment(requestModel) {
  const response = await CommonPost('/api/CustomerBalancePayment/IssueCustomerBalancePayment', null, requestModel);
  return response;
}

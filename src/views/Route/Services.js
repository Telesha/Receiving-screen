import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  GetAllRoutes,
  saveRoute,
  getRouteDetailsByID,
  updateRoute,
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getRoutesByFactoryID,
  getFactoriesByGroupID,
  getAllFactories,
  getProductsByFactoryID,
  GetBalancepaymentDetails,
  GetCustomerTransportDeductionsByRoute,
  UpdateTransportDeductionByTransactionID
};

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
    if (item[1]["isActive"] == true) {
      factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
    }
  }
  return factoryArray;
}


async function getRoutesByFactoryID(factoryID) {
  const response = await CommonGet('/api/Route/GetRoutesByFactoryID', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function getfactoriesForDropDown(groupID) {
  var factoryArray = [];

  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] == true) {
      factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
    }
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
    groupID: parseInt(route.groupID),
    routeLocation: route.routeLocation,
    transportRate: parseFloat(parseFloat(route.transportRate).toFixed(2).toString()),
    targetCrop: route.targetCrop,
    productID: parseInt(route.productID),
    isActive: route.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    exPayRate: route.exPayRate == '' ? parseFloat(0) : parseFloat(parseFloat(route.exPayRate).toFixed(2).toString())
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
    groupID: parseInt(route.groupID),
    routeLocation: route.routeLocation,
    transportRate: parseFloat(parseFloat(route.transportRate).toFixed(2).toString()),
    targetCrop: route.targetCrop,
    productID: parseInt(route.productID),
    isActive: route.isActive,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
    exPayRate: route.exPayRate == '' ? parseFloat(0) : parseFloat(parseFloat(route.exPayRate).toFixed(2).toString())

  }
  const response = await CommonPost('/api/Route/UpdateRoute', null, updateModel);
  return response;
}

async function getRouteDetailsByID(routeID) {
  const response = await CommonGet('/api/Route/GetRouteDetailsByID', "routeID=" + parseInt(routeID));
  return response.data;
}

async function getProductsByFactoryID(factoryID) {
  let response = await CommonGet('/api/Product/GetProductsByFactoryID', "factoryID=" + parseInt(factoryID));
  let productArray = []
  for (let item of Object.entries(response.data)) {
    productArray[item[1]["productID"]] = item[1]["productName"]
  }
  return productArray;
}

async function GetBalancepaymentDetails(groupID, factoryID) {
  const response = await CommonGet('/api/BalancePayment/GetBalancepaymentDetails', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}

async function GetCustomerTransportDeductionsByRoute(transportDeductoinSearchModel) {
  const response = await CommonPost('/api/Route/GetCustomerTransportDeductionsByRoute', null, transportDeductoinSearchModel);
  return response;
}

function UpdateTransportDeductionByTransactionID(customerTransportDeductionModel) {

  const response = CommonPost('/api/Route/UpdateTransportDeductionByTransactionID', null, customerTransportDeductionModel);
  return response;

}

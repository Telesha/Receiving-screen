import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';
export default {
  GetAllRoutes,
  saveDivision,
  getRouteDetailsByID,
  updateRoute,
  getfactoriesForDropDown,
  getGroupsForDropdown,
  GetDivisionDetailsByEstateIDForListing,
  getFactoriesByGroupID,
  getAllFactories,
  getProductsByFactoryID,
  getDivisionDetailsByDivisionID,
  GetDivisionDetailsByDivisionIDForUpdate,
  updatedivision,
  GetFieldDetailsByDivisionID,
  SetInactiveFieldDetailsByID,
  getEstateDetailsByGroupID,
  GetAllSuppliersByGroupID,
  saveSupplierEstateMapping,
  GetSuppliersForListing
};

async function getAllFactories() {
  var factoryArray = [];
  const response = await CommonGet('/api/Factory/GetAllFactories', null);
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
}

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function getFactoriesByGroupID(groupID) {

  const response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', "groupID=" + parseInt(groupID));
  return response.data;
}


async function GetDivisionDetailsByEstateIDForListing(factoryID, statusID) {
  const response = await CommonGet('/api/Division/GetDivisionDetailsByEstateIDForListing', 'estateID=' + factoryID + '&statusID=' + statusID);
  return response.data;
}

async function GetSuppliersForListing(groupID, factoryID) {
  const response = await CommonGet('/api/SupplierEstateMapping/GetSuppliersForListing', 'groupID=' + groupID + '&factoryID=' + factoryID);
  return response.data;
}

async function saveSupplierEstateMapping(data) {
  const response = await CommonPost('/api/SupplierEstateMapping/SaveSupplierEstate', null, data);
  return response;
}


async function getfactoriesForDropDown(groupID) {
  var factoryArray = [];

  const response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', "groupID=" + parseInt(groupID));
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
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

async function saveDivision(division, fieldDataList) {
  let saveModel = {
    divisionName: division.divisionName,
    divisionCode: division.divisionCode,
    estateID: parseInt(division.estateID),
    groupID: parseInt(division.groupID),
    divisionLocation: division.divisionLocation,
    transportRate: parseFloat(parseFloat(division.transportRate).toFixed(2).toString()),
    targetCrop: parseFloat(division.targetCrop),
    productID: parseInt(division.productID),
    isActive: division.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    fieldDataList: fieldDataList
  }
  const response = await CommonPost('/api/Division/SaveDivision', null, saveModel);
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
  }
  const response = await CommonPost('/api/Route/UpdateRoute', null, updateModel);
  return response;
}

async function getRouteDetailsByID(routeID) {
  const response = await CommonGet('/api/Route/GetRouteDetailsByID', "routeID=" + parseInt(routeID));
  return response.data;
}

async function updatedivision(division, fieldDataList) {
  let updateModel = {
    divisionName: division.divisionName,
    divisionLocation: division.divisionLocation,
    transportRate: parseFloat(parseFloat(division.transportRate).toFixed(2).toString()),
    targetCrop: parseFloat(division.targetCrop),
    divisionID: parseInt(division.divisionID),
    isActive: division.isActive,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    fieldDataList: fieldDataList,
  }
  const response = await CommonPost('/api/division/UpdateDivision', null, updateModel);
  return response;
}

async function getDivisionDetailsByDivisionID(divisionID) {
  const response = await CommonGet('/api/Division/getDivisionDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
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

async function GetDivisionDetailsByDivisionIDForUpdate(divisionID) {
  const response = await CommonGet('/api/Division/GetDivisionDetailsByDivisionIDForUpdate', "divisionID=" + parseInt(divisionID));
  return response.data;
}

async function GetFieldDetailsByDivisionID(divisionID) {
  const response = await CommonGet('/api/Division/GetFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  return response.data;
}

async function SetInactiveFieldDetailsByID(fiedID) {
  const response = await CommonGet('/api/Division/SetInactiveFieldDetailsByID', "fiedID=" + parseInt(fiedID));
  return response;
}

async function GetAllSuppliersByGroupID(groupID) {
  const response = await CommonGet('/api/SupplierEstateMapping/GetAllSuppliersByGroupID', 'groupID=' + groupID);
  return response.data;
}

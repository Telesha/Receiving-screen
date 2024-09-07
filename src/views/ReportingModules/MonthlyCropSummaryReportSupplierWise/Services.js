import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroupsForDropDown,
  getOperationEntityForDropDown,
  getCollectionPointForDropDown,
  getLeafTypeForDropDown,
  getSupplierReportDetails
}

async function getAllGroupsForDropDown() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = [];
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
}

async function getOperationEntityForDropDown(groupID) {
  let response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', 'groupID=' + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}

async function getCollectionPointForDropDown(factoryID) {
  let response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + parseInt(factoryID));
  let routeArray = [];
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function getLeafTypeForDropDown(factoryID) {
  let response = await CommonGet('/api/GreenLeafRouteDetails/GetAllLeafTypes', 'factoryID=' + parseInt(factoryID));
  let collectionArray = [];
  for (let item of Object.entries(response.data)) {
    collectionArray[item[1]["collectionTypeID"]] = item[1]["collectionTypeName"]
  }
  return collectionArray;
}

async function getSupplierReportDetails(groupID, factoryID, year, collectionTypeID, collectionPointID) {
  let response = await CommonGet('/api/GreenLeafSupplierDetails/GetGreenLeafSupplierDetails', 'groupID=' + groupID 
    + '&factoryID=' + factoryID  + '&Year=' + year + '&collectionTypeID=' + collectionTypeID + '&CollectionPointID=' + collectionPointID);
  return response;
}
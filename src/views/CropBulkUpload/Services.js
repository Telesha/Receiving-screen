import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  uploadLeafDetails,
  getAllGroups,
  getFactoryByGroupID,
  getRouteByFactoryID,
  getCustomersByRouteID,
  getRegNoByCustomerID,
  getCollectionTypeByFactoryID,
  uploadBulkData,
  getCurrentBalancePaymnetDetail
}

async function uploadLeafDetails(leafDetails) {
  var response = await CommonPost('/api/Crop/UploadCropDetails', null, leafDetails);
  return response;
}

async function uploadBulkData(data) {
  var response = await CommonPost('/api/Crop/BulkUploadCropDetails', null, data);
  return response;
}

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
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
};

async function getRouteByFactoryID(factoryID) {
  let response = await CommonGet('/api/Route/GetRoutesByFactoryID', "factoryID=" + parseInt(factoryID));
  let routesArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      routesArray[item[1]["routeCode"]] = item[1]["routeName"];
    }
  }
  return routesArray;
};

async function getCustomersByRouteID(routeID) {
  let response = await CommonGet('/api/Customer/GetCustomersByRouteID', "routeID=" + parseInt(routeID));
  let customerArray = [];
  for (let item of Object.entries(response.data)) {
    customerArray[item[1]["customerID"]] = item[1]["firstName"];
  }
  return customerArray;
};

async function getRegNoByCustomerID(customerID) {
  let response = await CommonGet('/api/Customer/GetRegistrationNumbersByCustomerID', "customerID=" + parseInt(customerID));
  let regNoArray = [];
  for (let item of Object.entries(response.data)) {
    regNoArray[item[1]["registrationNumber"]] = item[1]["registrationNumber"];
  }
  return regNoArray;
};

async function getCollectionTypeByFactoryID(factoryID) {
  let response = await CommonGet('/api/CollectionType/GetCollectionTypeDetailsByFactoryID', "factoryID=" + parseInt(factoryID));
  let collectionTypeArray = [];
  for (let item of Object.entries(response.data)) {
    collectionTypeArray[item[1]["collectionTypeCode"]] = item[1]["collectionTypeName"];
  }
  return collectionTypeArray;
};

async function getCurrentBalancePaymnetDetail(groupID, factoryID) {
  let response = await CommonGet('/api/BalancePayment/CheckISBalancePaymentCompleted', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}

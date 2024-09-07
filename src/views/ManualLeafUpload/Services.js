import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';
import { CommonScreenConfigurationFetcher } from './../../helpers/ScreenConfigService';

export default {
  uploadLeafDetails,
  getAllGroups,
  getFactoryByGroupID,
  getRouteByFactoryID,
  getCustomersByRouteID,
  getRegNoByCustomerID,
  getCollectionTypeByFactoryID,
  getCustomerJoiningDate,
  getLatestManualLeafUpload,
  getScreenConfiguration,
  getCustomerDetailsNameAndRouteName
}

async function uploadLeafDetails(leafDetails) {
  var response = await CommonPost('/api/Crop/UploadCropDetails', null, leafDetails);
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
      routesArray[item[1]["routeID"]] = item[1]["routeName"];
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

async function getCustomerJoiningDate(groupID, factoryID, collectedRouteID, regNo) {
  let response = await CommonGet('/api/Customer/GetCustomerJoiningDate', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&routeID=" + parseInt(collectedRouteID) + "&registrationNumber=" + regNo);
  return response.data;
}

async function getScreenConfiguration(screenCode) {
  let response = await CommonScreenConfigurationFetcher(screenCode)[0];

  let returnModel = {
    collectionTypeCode: response.defaultCollectionTypeID
  }

  return returnModel;
}

async function getLatestManualLeafUpload(groupID, factoryID, routeID, formattedDate) {
  var finalDate = formattedDate.split('T')[0];
  let response = await CommonGet('/api/Crop/GetLatestManualLeafUpload', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&routeID=" + parseInt(routeID) + "&date=" + finalDate.toString());
  return response.data;
}

async function getCustomerDetailsNameAndRouteName(groupID, factoryID, registrationNumber) {
  let response = await CommonGet('/api/Customer/GetCustomerDetailsNameAndRouteName', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&registrationNumber=" + registrationNumber);
  return response;
}
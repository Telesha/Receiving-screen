import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getGroupsForDropdown,
  getFactoriesByGroupID,
  GetAllParentMenuDetails,
  SaveParentMenuDetails,
  GetAllMenuDetails,
  SaveMenuDetails,
  GetAllScreenDetails,
  SaveScreenDetails,
  SaveScreenPermissionDetails
};

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

async function getFactoriesByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
}

async function GetAllParentMenuDetails() {
  const response = await CommonGet('/api/ParentMenu/GetAllParentMenuDetails', null)
  return response;
}

async function SaveParentMenuDetails(requestModel) {
  const response = await CommonPost('/api/ParentMenu/SaveParentMenuDetails', null, requestModel)
  return response;
}

async function GetAllMenuDetails() {
  const response = await CommonGet('/api/Menu/GetAllMenuDetails', null)
  return response;
}

async function SaveMenuDetails(requestModel) {
  const response = await CommonPost('/api/Menu/SaveMenuDetails', null, requestModel)
  return response;
}

async function GetAllScreenDetails() {
  const response = await CommonGet('/api/Screen/GetAllScreenDetails', null)
  return response;
}

async function SaveScreenDetails(requestModel) {
  const response = await CommonPost('/api/Screen/SaveScreenDetails', null, requestModel)
  return response;
}

async function SaveScreenPermissionDetails(requestModel) {
  const response = await CommonPost('/api/Permission/SaveScreenPermissionDetails', null, requestModel)
  return response;
}

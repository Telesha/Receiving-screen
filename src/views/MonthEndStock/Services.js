import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getRoleDetailsByID,
  getAllGroups,
  getAllFactoriesByGroupID,
  getRoleDetailsByGroupIDFactoryID,
  getRoleLevelsByToken
};


async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
          groupArray[item[1]["groupID"]] = item[1]["groupName"]
  } 
  return groupArray;
}

async function getAllFactoriesByGroupID(groupID) {
  let response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', 'groupID=' + parseInt(groupID));
  let factoryArray = []
  for (let item of Object.entries(response.data)) {
          factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  } 
  return factoryArray;
}

async function getRoleDetailsByGroupIDFactoryID(groupID,factoryID) {
  const response = await CommonGet('/api/Role/GetRoleDetailsByGroupIDFactoryID', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}

async function getRoleDetailsByID(roleID) {
  const response = await CommonGet('/api/Role/GetRoleDetailsByID', "roleID=" + parseInt(roleID));
  return response.data;
}

async function getRoleLevelsByToken(roleLevelID) {
  let response = await CommonGet('/api/Role/GetRoleLevelsByToken', 'roleLevelID=' + parseInt(roleLevelID));
  let roleLevelArray = []
  for (let item of Object.entries(response.data)) {
      roleLevelArray[item[1]["roleLevelID"]] = item[1]["roleLevelName"]
  } 
  return roleLevelArray;
}
import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  saveRole,
  getRoleDetailsByID,
  updateRole,
  getAllGroups,
  getAllFactoriesByGroupID,
  getRoleDetailsByGroupIDFactoryID,
  getRoleLevelsByToken
};

async function saveRole(role) {
  let saveModel = {
    roleID: 0,
    roleLevelID: parseInt(role.roleLevelID),
    roleName: role.roleName,
    groupID: parseInt(role.groupID),
    factoryID: parseInt(role.factoryID),
    isActive: role.isActive,
    createdBy: 0,
    createdDate: new Date().toISOString()
  }

  const response = await CommonPost('/api/Role/SaveRole', null, saveModel);
  return response;
}

async function updateRole(role) {
  role.modifiedBy = parseInt(tokenDecoder.getUserIDFromToken());
  role.modifiedDate = new Date().toISOString();
  role.roleID = parseInt(role.roleID);
  
  const response = await CommonPost('/api/Role/UpdateRole', null, role);
  return response;
}

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
import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllUsers,
  saveUser,
  getAllGroups,
  getAllFactoriesByGroupID,
  getUserDetailsByGroupIDFactoryID,
  getRolesbyRoleLevel,
  getUserDetailsByID,
  updateUser,
  ResetPassword,
  GetUserDetailsByUserID,
  ChangePassword,
  getRolesbyRoleLevelForListing
};

async function ResetPassword(user) {
  let ResetPasswordModel = {
    userID: parseInt(user.userID),
    newPassword: user.newPassword,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString()
  }
  const response = await CommonPost('/api/auth/ResetPassword', null, ResetPasswordModel);
  return response;
}

async function getUserDetailsByID(userID) {
  const response = await CommonGet('/api/User/getUserDetailsByID', "userID=" + parseInt(userID));
  return response.data;
}

async function getAllUsers() {
  const response = await CommonGet('/api/User/GetAllUsers', null);
  return response.data;
}

async function saveUser(user) {

  let saveModel = {
    groupID: parseInt(user.groupID),
    factoryID: parseInt(user.factoryID),
    userName: user.userName,
    firstName: user.firstName,
    lastName: user.lastName,
    roleID: parseInt(user.roleID),
    password: user.password,
    isActive: user.isActive,
    isLock: user.isLock,
    createdBy: 0,
    createdDate: new Date().toISOString()
  }

  const response = await CommonPost('/api/auth/Register', null, saveModel);
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

async function getUserDetailsByGroupIDFactoryID(groupID, factoryID) {
  const response = await CommonGet('/api/User/GetUserDetailsByGroupIDFactoryID', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}

async function getRolesbyRoleLevel(factoryID) {
  let response = await CommonGet('/api/User/GetRolesByFactoryID', 'factoryID=' + parseInt(factoryID));
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["roleID"]] = item[1]["roleName"]
  }
  return array;
}

async function getRolesbyRoleLevelForListing(factoryID) {
  let response = await CommonGet('/api/User/GetRolesByFactoryID', 'factoryID=' + parseInt(factoryID));
  return response.data;
}

async function updateUser(user) {

  let updateModel = {
    groupID: user.groupID,
    factoryID: user.factoryID,
    userID: parseInt(user.userID),
    firstName: user.firstName,
    lastName: user.lastName,
    roleID: parseInt(user.roleID),
    isActive: user.isActive,
    isLock: user.isLock,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString()
  }
  const response = await CommonPost('/api/auth/UpdateUser', null, updateModel);
  return response;
}

async function GetUserDetailsByUserID(userID) {
  const response = await CommonGet('/api/User/getUserDetailsByUserID', "userID=" + parseInt(userID));
  return response.data;
}

async function ChangePassword(changeModel) {
  const response = await CommonPost('/api/auth/changeUserPassword', null, changeModel);
  return response;
}
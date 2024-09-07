import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getChequeRegisterReport,
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getBankDetailsForDropdown
};

async function getAllGroups() {
  let response = await CommonGet('/api/Group/GetAllGroups');
  let groupArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]['isActive'] === true) {
      groupArray[item[1]['groupID']] = item[1]['groupName'];
    }
  }
  return groupArray;
}

async function getFactoryByGroupID(groupID) {
  let response = await CommonGet(
    '/api/Group/GetFactoryByGroupID',
    'groupID=' + parseInt(groupID)
  );
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]['factoryID']] = item[1]['factoryName'];
  }
  return factoryArray;
}

async function getChequeRegisterReport(chequeRegisterModel) {
  let response = await CommonPost(
    '/api/ChequeRegister/GetChequeRegisterReport',
    null,
    chequeRegisterModel
  );
  return response;
}

async function getfactoriesForDropDown(groupID) {
  var factoryArray = [];

  const response = await CommonGet(
    '/api/Group/GetFactoryByGroupID',
    'groupID=' + groupID
  );
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]['factoryID']] = item[1]['factoryName'];
  }
  return factoryArray;
}

async function getGroupsForDropdown() {
  var groupArray = [];
  const response = await CommonGet('/api/Group/GetAllGroups', null);
  for (let item of Object.entries(response.data)) {
    if (item[1]['isActive'] === true) {
      groupArray[item[1]['groupID']] = item[1]['groupName'];
    }
  }
  return groupArray;
}

async function getBankDetailsForDropdown(groupID, factoryID) {
  const response = await CommonGet(
    '/api/ChequeRegister/GetBankDetailsForDropdown',
    'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID)
  );

  let array = [];
  for (let item of Object.entries(response.data)) {
    array[item[1]['ledgerAccountID']] = item[1]['ledgerAccountNameCode'];
  }
  return array;
}

import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  GetAccountDetails,
  getAccountTypeNamesForDropdown,
  getParentHeadersByAccountTypeID,
  getChildHeadersByParentTypeID,
  updateOpeningBalance,
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

async function getAccountTypeNamesForDropdown(groupID, factoryID) {
  const response = await CommonGet('/api/AccountType/GetAccountTypeNamesForDropdown',
    "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));

  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["accountTypeID"]] = item[1]["accountTypeName"]
  }
  return array;
}

async function getParentHeadersByAccountTypeID(accountTypeID) {
  const response = await CommonGet('/api/ParentHeader/GetParentHeadersByAccountTypeID',
    "accountTypeID=" + parseInt(accountTypeID));

  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["parentHeaderID"]] = item[1]["parentHeaderName"]
  }
  return array;
}

async function getChildHeadersByParentTypeID(parentHeaderID) {
  const response = await CommonGet('/api/ChildHeader/GetChildHeadersByParentTypeID',
    "parentHeaderID=" + parseInt(parentHeaderID));

  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["childHeaderID"]] = item[1]["childHeaderName"]
  }
  return array;
}


async function GetAccountDetails(searchParamList) {

  let searchModel = {
    groupID: parseInt(searchParamList.groupID),
    factoryID: parseInt(searchParamList.factoryID),
    accountTypeID: parseInt(searchParamList.accountTypeID),
    parentHeaderID: parseInt(searchParamList.parentHeaderID),
    childHeaderID: parseInt(searchParamList.childHeaderID),
    getAllAccounts: searchParamList.getAllAccounts
  }
  let response = await CommonPost('/api/OpeningBalance/GetLedgerAccounts', null, searchModel);
  return response;
}

async function updateOpeningBalance(model) {
  const response = await CommonPost('/api/OpeningBalance/UpdateOpeningBalance', null, model);
  return response;
}

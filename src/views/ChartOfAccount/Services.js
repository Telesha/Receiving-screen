import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  GetAllGroups,
  GetFactoryByGroupID,
  GetChartOfAccountDetailsByGroupIDAndFactoryID,
  getLatestAccountTypeCode,
  saveAccountType,
  getAccountTypeNamesForDropdown,
  getLatestParentHeaderCode,
  SaveParentHeader,
  getLatestChildHeaderCode,
  getParentHeaderNamesForDropdown,
  SaveChildHeader,
  getAccountTypeCode,
  getParentHeaderCode,
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getParentHeadersByAccountTypeID,
  getChildHeadersByParentTypeID,
  saveLedgerAccount,
  getLatestLedgerAccountCode,
  getChildHeaderCode,
  GetAllAccountAccountTypes,
  getBanksForDropdown,
  getBranchesByBankID,
  GetUniqueAccountTypeCode,
  GetLedgerTrasactionDetailsByLedgerAccountID,
  UpdateAccountTypeStatusByAccountTypeID,
  UpdateParentHeaderStatusByParentHeaderID,
  UpdateChildHeaderStatusByChildHeaderID,
  UpdateLedgerAccountStatusByLedgerAccountID,
  GetChildHeaderByAccountTypeID,
  getChildHeaderTypes,
  getLedgerAccountTypes
}

async function GetAllGroups() {
  let response = await CommonGet('/api/Group/GetAllGroups');
  let groupArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"];
    }
  }
  return groupArray;
};

async function GetFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
};

async function GetChartOfAccountDetailsByGroupIDAndFactoryID(groupID, factoryID) {
  const response = await CommonGet("/api/ChartOfAccount/GetAllChartOfAccountDetails", "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data
}

async function getLatestAccountTypeCode(groupID, factoryID) {
  let response = await CommonGet('/api/AccountType/GetLatestAccountTypeCode', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}
async function saveAccountType(accountModel) {

  let saveModel = {
    accountTypeID: 0,
    groupID: parseInt(accountModel.groupID),
    factoryID: parseInt(accountModel.factoryID),
    accountTypeName: accountModel.accountTypeName,
    accountTypeCode: accountModel.accountTypeCode,
    entryType: null,//parseInt(accountModel.entryType),
    isActive: true,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    orderNo: parseInt(accountModel.orderNo),
    accountTypeCodeID: parseInt(accountModel.accountTypeCodeID),
  }

  const response = await CommonPost('/api/AccountType/SaveAccountType', null, saveModel);
  return response;
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

async function getLatestParentHeaderCode(accountTypeID) {
  let response = await CommonGet('/api/ParentHeader/GetLatestParentHeaderCode', "accountTypeID=" + parseInt(accountTypeID));
  return response.data;
}

async function SaveParentHeader(parentModel) {

  let saveModel = {
    parentHeaderID: 0,
    groupID: parseInt(parentModel.groupID),
    factoryID: parseInt(parentModel.factoryID),
    parentHeaderCode: parentModel.parentHeaderCode,
    parentHeaderName: parentModel.parentHeaderName,
    parentHeaderOrder: parseInt(parentModel.parentHeaderOrder),
    accountTypeID: parseInt(parentModel.accountTypeID),
    isActive: true,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),

  }

  const response = await CommonPost('/api/ParentHeader/SaveParentHeader', null, saveModel);
  return response;
}

async function getLatestChildHeaderCode(parentHeaderID) {
  let response = await CommonGet('/api/ChildHeader/GetLatestChildHeaderCode', "parentHeaderID=" + parseInt(parentHeaderID));
  return response.data;
}

async function getParentHeaderNamesForDropdown(groupID, factoryID) {
  const response = await CommonGet('/api/ParentHeader/GetParentHeaderNamesForDropdown',
    "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));

  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["parentHeaderID"]] = item[1]["parentHeaderName"]
  }
  return array;
}

async function SaveChildHeader(childModel) {

  let saveModel = {
    parentHeaderID: parseInt(childModel.parentHeaderID),
    groupID: parseInt(childModel.groupID),
    factoryID: parseInt(childModel.factoryID),
    childHeaderCode: childModel.childHeaderCode,
    childHeaderName: childModel.childHeaderName,
    isActive: true,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    childHeaderID: 0,
    childHeaderTypeID: parseInt(childModel.childHeaderTypeID)
  }

  const response = await CommonPost('/api/ChildHeader/SaveChildHeader', null, saveModel);
  return response;
}

async function getAccountTypeCode(accountTypeID) {
  let response = await CommonGet('/api/AccountType/GetAccountTypeCode', "accountTypeID=" + parseInt(accountTypeID));
  return response.data;
}

async function getParentHeaderCode(parentHeaderID) {
  let response = await CommonGet('/api/ParentHeader/GetParentHeaderCode', "parentHeaderID=" + parseInt(parentHeaderID));
  return response.data;
}

async function getfactoriesForDropDown(groupID) {
  var factoryArray = [];

  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
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

async function saveLedgerAccount(ledgerModel) {
  let saveModel = {
    groupID: parseInt(ledgerModel.groupID),
    factoryID: parseInt(ledgerModel.factoryID),
    parentHeaderID: parseInt(ledgerModel.parentHeaderID),
    childHeaderID: parseInt(ledgerModel.childHeaderID),
    ledgerAccountName: ledgerModel.ledgerAccountName,
    ledgerAccountCode: ledgerModel.ledgerAccountCode,
    ledgerAccountDescription: ledgerModel.description,
    accountNo: ledgerModel.accountNumber,
    chequeNo: ledgerModel.chequeNumber,
    balance: ledgerModel.balance,
    balanceAsOFDate: new Date(ledgerModel.asOf),
    maximumAmount: ledgerModel.maximumAmount,
    accountTypeID: parseInt(ledgerModel.accountTypeID),
    isActive: true,
    isBank: ledgerModel.isBank,
    bankID: parseInt(ledgerModel.bankID),
    branchID: parseInt(ledgerModel.branchID),
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    ledgerAccountID: 0,
    balanceEntryTypeID: parseInt(ledgerModel.balanceEntryTypeID),
    ledgerAccountTypeID: parseInt(ledgerModel.ledgerAccountTypeID)
  }

  const response = await CommonPost('/api/LedgerAccount/SaveLedgerAccount', null, saveModel);
  return response;
}

async function getLatestLedgerAccountCode(childHeaderID) {
  let response = await CommonGet('/api/LedgerAccount/GetLatestLedgerAccountCode', "childHeaderID=" + parseInt(childHeaderID));
  return response.data;
}

async function getChildHeaderCode(childHeaderID) {
  let response = await CommonGet('/api/ChildHeader/GetChildHeaderCode', "childHeaderID=" + parseInt(childHeaderID));
  return response.data;
}

async function GetAllAccountAccountTypes(groupID, factoryID) {
  let accountTypes = [];

  const response = await CommonGet("/api/ChartOfAccount/GetAllAccountTypeDetails", "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));

  accountTypes.push("All Accounts")

  for (const object of response.data) {
    accountTypes.push(object.accountTypeName)
  }

  return accountTypes
}

async function getBanksForDropdown() {
  var bankArray = [];
  const response = await CommonGet('/api/Bank/GetAllBanks', null);
  for (let item of Object.entries(response.data)) {
    bankArray[item[1]["bankID"]] = item[1]["bankName"];
  }
  return bankArray;
}

async function getBranchesByBankID(bankID) {
  var branchArray = [];
  const response = await CommonGet('/api/Branch/GetBranchesByBankID', 'bankID=' + bankID);
  for (let item of Object.entries(response.data)) {
    branchArray[item[1]["branchID"]] = item[1]["branchName"];
  }
  return branchArray;
}

async function GetUniqueAccountTypeCode() {
  var uniqueAccountTypeCodeArray = [];
  const response = await CommonGet('/api/AccountType/GetUniqueAccountTypeCode');

  for (let item of Object.entries(response.data)) {
    uniqueAccountTypeCodeArray[item[1]["accountTypeCodeID"]] = item[1]["accountTypeCode"];
  }
  return uniqueAccountTypeCodeArray;
}

async function GetLedgerTrasactionDetailsByLedgerAccountID(ledgerAccountID) {
  const response = await CommonGet("/api/ChartOfAccount/GetLedgerTrasactionDetailsByLedgerAccountID", "ledgerAccountID=" + parseInt(ledgerAccountID));
  return response
}

async function UpdateAccountTypeStatusByAccountTypeID(AccountTypeID) {
  const response = await CommonGet("/api/ChartOfAccount/UpdateAccountTypeStatusByAccountTypeID", "AccountTypeID=" + parseInt(AccountTypeID));
  return response
}

async function UpdateParentHeaderStatusByParentHeaderID(parentHeaderID) {
  const response = await CommonGet("/api/ChartOfAccount/UpdateParentHeaderStatusByParentHeaderID", "parentHeaderID=" + parseInt(parentHeaderID));
  return response
}

async function UpdateChildHeaderStatusByChildHeaderID(childHeaderID) {
  const response = await CommonGet("/api/ChartOfAccount/UpdateChildHeaderStatusByChildtHeaderID", "childHeaderID=" + parseInt(childHeaderID));
  return response
}

async function UpdateLedgerAccountStatusByLedgerAccountID(ledgerAccountID) {
  const response = await CommonGet("/api/ChartOfAccount/UpdateLedgerAccountStatusByLedgerAccountID", "ledgerAccountID=" + parseInt(ledgerAccountID));
  return response
}

async function GetChildHeaderByAccountTypeID(accountTypeID) {
  const response = await CommonGet('/api/ChartOfAccount/GetChildHeaderByAccountTypeID', "accountTypeID=" + parseInt(accountTypeID));
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["childHeaderID"]] = item[1]["childHeaderName"]
  }
  return array;
}

async function getChildHeaderTypes(groupID) {
  const response = await CommonGet('/api/ChildHeader/GetChildHeaderTypes',
    "groupID=" + parseInt(groupID));

  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["childHeaderTypeID"]] = item[1]["childHeaderTypeName"]
  }
  return array;
}

async function getLedgerAccountTypes(groupID) {
  const response = await CommonGet('/api/LedgerAccount/GetLedgerAccountTypes',
    "groupID=" + parseInt(groupID));

  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["ledgerAccountTypeID"]] = item[1]["ledgerAccountTypeName"]
  }
  return array;
}

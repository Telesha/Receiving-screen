import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getRoutesForDropDown,
  getBanksForDropdown,
  getBankDetailsForDropdown,
  GetBankReconciliationData,
  UpdateRealizedCheque
};

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

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function getBanksForDropdown(factoryID) {
  var bankArray = [];
  const response = await CommonGet('/api/BankIssuance/GetBankByFactoryID', 'factoryID=' + factoryID);
  for (let item of Object.entries(response.data)) {
    bankArray[item[1]["bankID"]] = item[1]["bankName"];
  }
  return bankArray;
}

async function getBankDetailsForDropdown(groupID, factoryID) {
  const response = await CommonGet('/api/ChequeRegister/GetBankDetailsForDropdown', 'groupID=' + parseInt(groupID)
    + '&factoryID=' + parseInt(factoryID));
  let array = [];
  for (let item of Object.entries(response.data)) {
    array[item[1]['ledgerAccountID']] = item[1]['ledgerAccountNameCode'];
  }
  return array;
}

async function GetBankReconciliationData(bankReconciliationData) {
  let response = await CommonPost('/api/BankReconciliation/GetBankReconciliationData', null, bankReconciliationData)
  return response;
}

async function UpdateRealizedCheque(realizedChequeData) {
  let response = await CommonPost('/api/BankReconciliation/UpdateRealizedCheque', null, realizedChequeData);
  return response;
}


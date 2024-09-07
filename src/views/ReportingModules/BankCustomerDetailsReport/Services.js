import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getRoutesForDropDown,
  getBanksForDropdown,
  getBranchesByBankID,
  GetBankCustomerDetails,
  CheckISBalancePaymentCompleted,
  GetBalancePaymentYearMonth
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

async function getBanksForDropdown() {
  const response = await CommonGet('/api/Bank/GetAllActiveBanks', null);
  return response.data;
}

async function getBranchesByBankID(bankID) {
  const response = await CommonGet('/api/Branch/GetBranchesByBankID', 'bankID=' + bankID);
  return response.data;
}

async function GetBankCustomerDetails(bankCustomerReportInputModel) {

  let response = await CommonPost('/api/BankCustomerDetails/GetBankCustomerDetails', null, bankCustomerReportInputModel);
  return response;
}

async function CheckISBalancePaymentCompleted(groupID, factoryID) {
  const response = await CommonGet('/api/BalancePayment/CheckISBalancePaymentCompleted', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response;
}

async function GetBalancePaymentYearMonth(groupID, factoryID) {
  let response = await CommonGet('/api/BalancePaymentYearMonth/GetBalancePaymentYearMonth', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
};
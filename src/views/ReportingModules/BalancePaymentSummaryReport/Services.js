import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  GetBalancePaymentSummary,
  GetBalancePaymentDetailedData,
  GetRoutewiseBalancepayment,
  GetBalancePaymentEstimatedLedger,
  GetAllPaymentDetailedData,
  GetBalancePaymentYearMonth
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

async function GetBalancePaymentSummary(balancePaymentSummaryRequestModel) {

  let response = await CommonPost('/api/BalancePaymentSummery/GetBalancePaymentSummary', null, balancePaymentSummaryRequestModel);
  return response;
}

async function GetBalancePaymentDetailedData(balancePaymentSummaryRequestModel) {

  let response = await CommonPost('/api/BalancePaymentSummery/GetBalancePaymentDetailedData', null, balancePaymentSummaryRequestModel);
  return response;
}

async function GetAllPaymentDetailedData(balancePaymentSummaryRequestModel) {
  let response = await CommonPost('/api/BalancePaymentSummery/GetAllPaymentDetailedData', null, balancePaymentSummaryRequestModel);
  return response;
}

async function GetBalancePaymentEstimatedLedger(balancePaymentSummaryRequestModel) {
  let response = await CommonPost('/api/BalancePaymentSummery/GetBalancePaymentEstimatedLedger', null, balancePaymentSummaryRequestModel);
  return response;
}


async function GetRoutewiseBalancepayment(balancePaymentSummaryRequestModel) {

  let response = await CommonPost('/api/BalancePaymentSummery/GetRoutewiseBalancepayment', null, balancePaymentSummaryRequestModel);
  return response;
}

async function GetBalancePaymentYearMonth(groupID, factoryID) {
  let response = await CommonGet('/api/BalancePaymentYearMonth/GetBalancePaymentYearMonth', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
};

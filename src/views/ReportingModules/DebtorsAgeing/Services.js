import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getRoutesForDropDown,
  GetDebtorsAgeingSectionDetails,
  GetAllLedgerAccountDetailsByFilters,
  SaveDebtorsAgeingSetupDetails,
  GetDebtorsAgeingSectionSetupConfigurationDetails,
  GetBalanceSheetDetails,
  GetNetProfitAndLossForGivenPeriod,
  GetDebtorsAgeingDetails
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

async function GetDebtorsAgeingSectionDetails(groupID, factoryID) {
  var sectionArray = [];

  const response = await CommonGet('/api/BalanceSheet/GetBalanaceSheetSectionDetails', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID))

  for (let item of Object.entries(response.data)) {
    sectionArray[item[1]["balanceSheetSectionID"]] = item[1]["balanceSheetSectionName"]
  }
  return sectionArray;
}


async function GetAllLedgerAccountDetailsByFilters(requestModel) {
  let response = await CommonPost('/api/BalanceSheet/GetAllLedgerAccountDetailsByFilters', null, requestModel);
  return response.data;
}

async function SaveDebtorsAgeingSetupDetails(requestModel) {
  let response = await CommonPost('/api/DebtorsAgeing/SaveDebtorsAgeingSaveRequestModel', null, requestModel);
  return response;
}

async function GetDebtorsAgeingSectionSetupConfigurationDetails(groupID, factoryID) {
  const response = await CommonGet('/api/DebtorsAgeing/GetDebtorsAgeingSectionSetupConfigurationDetails', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID))
  return response;
}

async function GetBalanceSheetDetails(requestModel) {
  const response = await CommonPost('/api/BalanceSheet/GetBalanaceSheetDetails', null, requestModel)
  return response;
}

async function GetNetProfitAndLossForGivenPeriod(requestModel) {
  const response = await CommonPost('/api/profitAndLossReport/GetNetProfitAndLossForGivenPeriod', null, requestModel)
  return response;
}

async function GetDebtorsAgeingDetails(requestModel) {
  const response = await CommonPost('/api/DebtorsAgeing/GetDebtorsAgeingReportDetails', null, requestModel)
  return response.data;
}


import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getRoutesForDropDown,
  GetProfitAndLossSecctionDetails,
  GetAllLedgerAccountDetailsByFilters,
  SaveProfitAndLossReportSetupDetails,
  GetSetupConfigurationDetails,
  GetProfitAndLossReportDetails,
  GetParentSectionDetails,
  SaveSubSectionCreation,
  GetProfitAndLossCreatedSecctionDetails,
  InActiveProfitAndLossSections
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

async function GetProfitAndLossSecctionDetails(groupID, factoryID, parentSectionID) {
  var sectionArray = [];

  const response = await CommonGet('/api/profitAndLossReport/GetProfitAndLossSectionDetails', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&parentSectionID=" + parseInt(parentSectionID))
  for (let item of Object.entries(response.data)) {
    sectionArray[item[1]["profitAndLossSectionID"]] = item[1]["profitAndLossSectionName"]
  }
  return sectionArray;
}


async function GetAllLedgerAccountDetailsByFilters(requestModel) {
  let response = await CommonPost('/api/profitAndLossReport/GetAllLedgerAccountDetailsByFilters', null, requestModel);
  return response.data;
}

async function SaveProfitAndLossReportSetupDetails(requestModel) {
  let response = await CommonPost('/api/profitAndLossReport/SaveProfitAndLossSaveRequestModel', null, requestModel);
  return response;
}

async function GetSetupConfigurationDetails(groupID, factoryID, profitAndLossSectionID) {
  const response = await CommonGet('/api/profitAndLossReport/GetProfitAndLossSectionSetupConfigurationDetails', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&profitAndLossSectionID=" + parseInt(profitAndLossSectionID))
  return response;
}

async function GetProfitAndLossReportDetails(requestModel) {
  const response = await CommonPost('/api/profitAndLossReport/GetProfitAndLossDetails', null, requestModel)
  return response;
}

async function GetParentSectionDetails(groupID, factoryID) {
  
  var parentSectionList = [];

  const response = await CommonGet('/api/profitAndLossReport/GetParentSectionList', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID))

  for (let item of Object.entries(response.data)) {
    parentSectionList[item[1]["profitAndLossParentSectionID"]] = item[1]["profitAndLossParentSectionName"]
  }
  return parentSectionList;
}

async function SaveSubSectionCreation(requestModel) {
  let response = await CommonPost('/api/profitAndLossReport/SaveSectionNames', null, requestModel);
  return response;
}

async function GetProfitAndLossCreatedSecctionDetails(parentSectionID, groupID, factoryID) {
  const response = await CommonGet('/api/profitAndLossReport/GetCreatedSectionNameDetails', "parentSectionID=" + parseInt(parentSectionID) + "&groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID))
  return response;
}

async function InActiveProfitAndLossSections(requestModel) {
  let response = await CommonPost('/api/profitAndLossReport/SetInactiveSectionNames', null, requestModel);
  return response;
}







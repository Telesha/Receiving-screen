import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getRoutesForDropDown,
  GetCashFlowCreatedSectionDetailsWithGroupFactoryParentSectionID,
  GetAllLedgerAccountDetailsByFilters,
  SaveCashFlowConfiguration,
  GetSetupConfigurationDetails,
  GetParentSectionDetails,
  ChildSectionCreation,
  CashFlowCreatedSectionDetails,
  InActiveCashFlowChildSections,
  SaveNewParentSection,
  GetCashFlowReport,
  InActiveCashFlowParentSections,
  GetChildSectionNames
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

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet(
    '/api/Group/GetRouteByFactoryID',
    'factoryID=' + factoryID
  );
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]['routeID']] = item[1]['routeName'];
  }
  return routeArray;
}

async function GetCashFlowCreatedSectionDetailsWithGroupFactoryParentSectionID(
  groupID,
  factoryID,
  cashFlowParentSectionID
) {
  var sectionArray = [];

  const response = await CommonGet(
    '/api/CashFlowReport/GetCashFlowSections',
    'groupID=' +
    parseInt(groupID) +
    '&factoryID=' +
    parseInt(factoryID) +
    '&parentSectionID=' +
    parseInt(cashFlowParentSectionID)
  );

  for (let item of Object.entries(response.data)) {
    sectionArray[item[1]['cashFlowChildSectionID']] = item[1]['cashFlowChildSectionName'];
  }
  return sectionArray;
}

async function GetAllLedgerAccountDetailsByFilters(requestModel) {
  let response = await CommonPost(
    '/api/CashFlowReport/GetAllLedgerAccountDetailsByFilters',
    null,
    requestModel
  );
  return response.data;
}

async function SaveCashFlowConfiguration(requestModel) {
  let response = await CommonPost(
    '/api/CashFlowReport/SaveCashFlowConfiguration1',
    null,
    requestModel
  );
  return response;
}

async function GetSetupConfigurationDetails(groupID, factoryID, cashFlowSectionID) {
  const response = await CommonGet(
    '/api/CashFlowReport/GetCashFlowSectionSetupConfigurationDetails',
    'groupID=' +
    parseInt(groupID) +
    '&factoryID=' +
    parseInt(factoryID) +
    '&cashFlowSectionID=' +
    parseInt(cashFlowSectionID)
  );
  return response;
}

async function GetParentSectionDetails(groupID, factoryID) {
  let response = await CommonGet(
    '/api/CashFlowReport/GetParentSectionList',
    'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID)
  );
  return response.data;
}

async function ChildSectionCreation(requestModel) {
  let response = await CommonPost(
    '/api/CashFlowReport/SaveSectionNames',
    null,
    requestModel
  );
  return response;
}
async function SaveNewParentSection(requestModel) {
  let response = await CommonPost(
    '/api/CashFlowReport/SaveNewParentSection',
    null,
    requestModel
  );
  return response;
}

async function CashFlowCreatedSectionDetails(parentSectionID) {
  const response = await CommonGet(
    '/api/CashFlowReport/GetCreatedSectionNameDetails',
    'parentSectionID=' + parseInt(parentSectionID)
  );
  return response;
}

async function InActiveCashFlowChildSections(requestModel) {
  let response = await CommonPost(
    '/api/CashFlowReport/SetInactiveSectionNames',
    null,
    requestModel
  );
  return response;
}

async function InActiveCashFlowParentSections(requestModel) {
  let response = await CommonPost(
    '/api/CashFlowReport/SetInactiveParentSectionNames',
    null,
    requestModel
  );
  return response;
}

async function GetCashFlowReport(model) {
  let response = await CommonPost('/api/CashFlowReport/GetCOPReport', null, model);
  return response;
}

async function GetChildSectionNames(groupID, factoryID, cashFlowParentSectionID) {

  const response = await CommonGet('/api/CashFlowReport/GetCashFlowSections', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID) + '&parentSectionID=' + parseInt(cashFlowParentSectionID)
  );
  return response;
}

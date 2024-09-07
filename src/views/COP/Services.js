import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getRoutesForDropDown,
  GetCOPCreatedSectionDetailsWithGroupFactoryParentSectionID,
  GetAllLedgerAccountDetailsByFilters,
  SaveCOPConfiguration,
  GetSetupConfigurationDetails,
  GetParentSectionDetails,
  ChildSectionCreation,
  COPCreatedSectionDetails,
  InActiveCOPChildSections,
  SaveNewParentSection,
  GetCOPReport,
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

async function GetCOPCreatedSectionDetailsWithGroupFactoryParentSectionID(
  groupID,
  factoryID,
  copParentSectionID
) {
  var sectionArray = [];

  const response = await CommonGet(
    '/api/COPReport/GetCOPSections',
    'groupID=' +
    (groupID) +
    '&factoryID=' +
    (factoryID) +
    '&parentSectionID=' +
    parseInt(copParentSectionID)
  );

  for (let item of Object.entries(response.data)) {
    sectionArray[item[1]['copChildSectionID']] = item[1]['copChildSectionName'];
  }
  return sectionArray;
}

async function GetAllLedgerAccountDetailsByFilters(requestModel) {
  let response = await CommonPost(
    '/api/COPReport/GetAllLedgerAccountDetailsByFilters',
    null,
    requestModel
  );
  return response.data;
}

async function SaveCOPConfiguration(requestModel) {
  let response = await CommonPost(
    '/api/COPReport/SaveCOPConfiguration',
    null,
    requestModel
  );
  return response;
}

async function GetSetupConfigurationDetails(groupID, factoryID, copSectionID) {
  const response = await CommonGet(
    '/api/COPReport/GetCOPSectionSetupConfigurationDetails',
    'groupID=' +
    parseInt(groupID) +
    '&factoryID=' +
    parseInt(factoryID) +
    '&COPSectionID=' +
    parseInt(copSectionID)
  );
  return response;
}

async function GetParentSectionDetails(groupID, factoryID) {
  var parentSectionList = [];

  const response = await CommonGet(
    '/api/COPReport/GetParentSectionList',
    'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID)
  );
  return response;
}

async function ChildSectionCreation(requestModel) {
  let response = await CommonPost(
    '/api/COPReport/SaveSectionNames',
    null,
    requestModel
  );
  return response;
}
async function SaveNewParentSection(requestModel) {
  let response = await CommonPost(
    '/api/COPReport/SaveNewParentSection',
    null,
    requestModel
  );
  return response;
}

async function COPCreatedSectionDetails(parentSectionID) {
  const response = await CommonGet(
    '/api/COPReport/GetCreatedSectionNameDetails',
    'parentSectionID=' + parseInt(parentSectionID)
  );
  return response;
}

async function InActiveCOPChildSections(requestModel) {
  let response = await CommonPost(
    '/api/COPReport/SetInactiveSectionNames',
    null,
    requestModel
  );
  return response;
}

async function GetCOPReport(model) {
  let response = await CommonPost('/api/COPReport/GetCOPReport', null, model);
  return response;
}

async function GetChildSectionNames(groupID, factoryID, copParentSectionID) {
  const response = await CommonGet('/api/COPReport/GetCOPSections', 'groupID=' + (groupID) + '&factoryID=' + (factoryID) + '&parentSectionID=' + parseInt(copParentSectionID));
  return response;
}

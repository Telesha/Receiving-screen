import { CommonGet, CommonPost } from '../../../helpers/HttpClient';


export default {
  getAllGroups,
  getFactoryByGroupID,
  GetAuditReport,
  getParentHeadersByAccountTypeID,
  getChildHeadersByParentTypeID,
  getAccountTypeNamesForDropdown,
  getfactoriesForDropDown,
  getGroupsForDropdown
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


async function GetAuditReport(auditReportModel) {
  let response = await CommonPost('/api/AuditReport/GetAuditReport', null, auditReportModel);
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
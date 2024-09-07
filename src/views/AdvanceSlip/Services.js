import { CommonGet, CommonPost } from 'src/helpers/HttpClient';

export default {
  getFactoryByGroupID,
  getAllFactories,
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getAdvanceSlipDetail,
  SelectedAdvanceSlipDetail,
  GetGeneratedAdvanceSlipDetail
};

async function getAllFactories() {
  var factoryArray = [];
  const response = await CommonGet('/api/Factory/GetAllFactories', null);
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
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
async function getAdvanceSlipDetail(groupID, factoryID) {
  const response = await CommonGet('/api/AdvanceSlipGeneration/GetAdvanceSlipDetail', 'groupID=' + parseInt(groupID.toString()) + '&factoryID=' + parseInt(factoryID.toString()));
  return response;
}

async function getFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
}

async function SelectedAdvanceSlipDetail(AdvanceSlipGenerateModel) {
  let response = await CommonPost('/api/AdvanceSlipGeneration/GenerateAdvanceSlip', null, AdvanceSlipGenerateModel);
  return response;
}
async function GetGeneratedAdvanceSlipDetail(groupID, factoryID) {
  const response = await CommonGet('/api/AdvanceSlipGeneration/GetGeneratedAdvanceSlipDetail', 'groupID=' + parseInt(groupID.toString()) + '&factoryID=' + parseInt(factoryID.toString()));
  return response;
}

import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  saveDetails,
  getFieldDetailsByDivisionIDForDropdown,
  getHarvestingJobType,
  GetNormConfigurationViewDetail,
  UpdateNormConfigurationDetails,
  GetDetailsByConfigurationDetailID,
  getFieldDetailsByDivisionID
}


async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
}

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getFieldDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function getHarvestingJobType() {
  let response = await CommonGet('/api/HarvestingJobType/GetHarvestingJobTypeDetails', null);
  let harvestingJobTypeArray = [];
  for (let item of Object.entries(response.data)) {
    harvestingJobTypeArray[item[1]["harvestingJobTypeID"]] = item[1]["harvestingJobTypeName"];
  }
  return harvestingJobTypeArray;
};

async function getFieldDetailsByDivisionIDForDropdown(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  return response.data;
};

async function GetNormConfigurationViewDetail(model) {
  const response = await CommonPost('/api/NormConfiguration/GetNormConfigurationDetails', null, model);
  return response;
};

async function saveDetails(norm) {
  const response = await CommonPost('/api/NormConfiguration/SaveNormConfiguration', null, norm);
  return response;
};

async function GetDetailsByConfigurationDetailID(configurationDetailID) {
  let response = await CommonPost('/api/NormConfiguration/GetDetailsByConfigurationDetailID', "configurationDetailID=" + parseInt(configurationDetailID))
  return response.data;
}

async function UpdateNormConfigurationDetails(norm) {
  const response = await CommonPost('/api/NormConfiguration/UpdateNormConfiguration', null, norm);
  return response;
}
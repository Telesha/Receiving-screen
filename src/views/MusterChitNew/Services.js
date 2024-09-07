import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getFieldDetailsByDivisionID,
  getFieldDetailsByDivisionIDSectionTypeID,
  saveMusterChitDetails,
  getFieldDetailsByLentDivisionID,
  GetPluckingJobTypesByJobCategoryID,
  GetSundryJobTypesByJobCategoryID,
  getAllSectionTypes,
  getMusterChitDetails
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

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  return response;
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

async function getFieldDetailsByLentDivisionID(lentdivisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(lentdivisionID));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function saveMusterChitDetails(fieldDataList) {
  const response = await CommonPost('/api/MusterChit/SaveMusterChitDetails', null, fieldDataList);
  return response;
}

async function GetPluckingJobTypesByJobCategoryID() {
  let response = await CommonGet('/api/HarvestingJobType/GetAllHarvestingJobTypeDetails', null);
  let harvestingJobTypeArray = [];
  for (let item of Object.entries(response.data)) {
    harvestingJobTypeArray[item[1]["harvestingJobTypeID"]] = item[1]["harvestingJobTypeName"];
  }
  return harvestingJobTypeArray;
}

async function GetSundryJobTypesByJobCategoryID(estateID) {
  let response = await CommonGet('/api/JobWiseAreaCovered/GetSundryJobTypesByJobCategory', "estateID=" + parseInt(estateID));
  return response.data;
}

async function getAllSectionTypes() {
  let response = await CommonGet('/api/MusterChit/GetAllSectionTypes', null);
  let sectionTypeArray = []
  for (let item of Object.entries(response.data)) {
    sectionTypeArray[item[1]["sectionTypeID"]] = item[1]["sectionTypeName"]
  }
  return sectionTypeArray;
}

async function getFieldDetailsByDivisionIDSectionTypeID(sectionTypeID, divisionID) {
  let response = await CommonGet('/api/MusterChit/GetFieldDetailsByDivisionIDSectionTypeID', "sectionTypeID=" + encodeURIComponent(parseInt(sectionTypeID)) + "&divisionID=" + encodeURIComponent(parseInt(divisionID)));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function getMusterChitDetails(model) {
  const response = await CommonPost('/api/MusterChit/getMusterChitDetails', null, model);
  return response;
}
import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  saveField,
  getFieldDetailsByID,
  updateField,
  getFieldDetailsByGroupIDEstateIDDivisionID,
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getAllSectionTypes
};

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

async function getAllSectionTypes() {
  let response = await CommonGet('/api/SectionType/GetAllSectionTypes', null);
  let sectionTypeArray = []
  for (let item of Object.entries(response.data)) {
    sectionTypeArray[item[1]["sectionTypeID"]] = item[1]["sectionTypeName"]
  }
  return sectionTypeArray;
}

async function saveField(saveModel) {
  const response = await CommonPost('/api/Field/SaveField', null, saveModel);
  return response;
}

async function updateField(field) {
  field.fieldID = parseInt(field.fieldID);
  if (field.typesOfPlant != 3) {
    field.clone = 0;
    field.seedling = 0;
  }

  const response = await CommonPost('/api/Field/UpdateField', null, field);
  return response;
}

async function getFieldDetailsByID(fieldID) {
  const response = await CommonGet('/api/Field/GetFieldDetailsByFieldID', "fieldID=" + parseInt(fieldID));
  return response.data;
}

async function getFieldDetailsByGroupIDEstateIDDivisionID(groupID, estateID, divisionID) {
  const response = await CommonGet('/api/Field/GetFieldDetailsByGroupIDEstateIDDivisionID', 'groupID=' + parseInt(groupID) + "&estateID=" + parseInt(estateID) + '&divisionID=' + parseInt(divisionID))
  return response.data;
}







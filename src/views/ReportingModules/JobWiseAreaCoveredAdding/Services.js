import { CommonGet, CommonPost } from '../../../helpers/HttpClient';
export default {
  GetAllGroups,
  GetEstateDetailsByGroupID,
  GetDivisionDetailsByEstateID,
  GetFieldDetailsByDivisionID,
  GetFieldDetailsByDivisionID,
  SaveJobWiseAreaCoverdDetails,
  GetJobWiseAreaCovererdDetails,
  UpdateJobWiseAreaCoverdDetail,
  InActiveJobWiseAreaCoverdDetails,
  GetPluckingJobTypesByJobCategoryID,
  GetSundryJobTypesByJobCategoryID
};

async function GetAllGroups() {
  let response = await CommonGet('/api/Group/GetAllGroups');
  let groupArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"];
    }
  }
  return groupArray;
};

async function GetEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function GetDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function GetFieldDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function SaveJobWiseAreaCoverdDetails(dataModel) {
  const response = await CommonPost('/api/JobWiseAreaCovered/SaveJobWiseAreaCoverdDetails', null, dataModel);
  return response;
}

async function GetJobWiseAreaCovererdDetails(JobWiseAreaCoverdID) {
  let response = await CommonGet('/api/JobWiseAreaCovered/GetAllJobWiseAreaCoverdDetails', "JobWiseAreaCoverdID=" + parseInt(JobWiseAreaCoverdID));
  return response.data;
}

async function UpdateJobWiseAreaCoverdDetail(updateModel) {
  let response = await CommonPost('/api/JobWiseAreaCovered/UpdateJobWiseAreaCoverdDetails', null, updateModel);
  return response;
}

async function InActiveJobWiseAreaCoverdDetails(groupID) {
  let response = await CommonGet('/api/JobWiseAreaCovered/InActiveJobWiseAreaCoverdDetailsByID', 'JobWiseAreaCoverdID=' + groupID);
  return response;
}

async function GetPluckingJobTypesByJobCategoryID() {
  let response = await CommonGet('/api/JobWiseAreaCovered/GetPluckingJobTypesByJobCategory');
  let pluckingJobTypesArray = [];
  for (let item of Object.entries(response.data)) {
    pluckingJobTypesArray[item[1]["jobTypeID"]] = item[1]["jobTypeName"];
  }
  return pluckingJobTypesArray;
}

async function GetSundryJobTypesByJobCategoryID() {
  let response = await CommonGet('/api/JobWiseAreaCovered/GetSundryJobTypesByJobCategory');
  let sundryJobTypesArray = [];
  for (let item of Object.entries(response.data)) {
    sundryJobTypesArray[item[1]["jobTypeID"]] = item[1]["jobTypeName"];
  }
  return sundryJobTypesArray;
}


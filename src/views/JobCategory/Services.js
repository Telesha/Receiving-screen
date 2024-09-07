import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  saveJobCategory,
  getJobCategoryDetailsJobCategoryID,
  updateJobCategory,
  getJobCategoryByGroupIDEstateIDJobCategoryID,
  getAllGroups,
  getEstateDetailsByGroupID,
  getEstateForUpdate
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
  return response.data;
};

async function getEstateForUpdate(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function saveJobCategory(saveModel) {
  const response = await CommonPost('/api/JobCategory/SaveJobCategories', null, saveModel);
  return response;
}

async function updateJobCategory(model) {
  const response = await CommonPost('/api/JobCategory/UpdateJobCategory', null, model);
  return response;
}

async function getJobCategoryDetailsJobCategoryID(jobCategoryID) {
  const response = await CommonGet('/api/JobCategory/GetJobCategoryDetailsJobCategoryID', "jobCategoryID=" + parseInt(jobCategoryID));
  return response.data;
}

async function getJobCategoryByGroupIDEstateIDJobCategoryID(groupID, estateID) {
  const response = await CommonGet('/api/JobCategory/GetJobCategoryDetailsByGroupIDEstateID', 'groupID=' + parseInt(groupID) + "&estateID=" + estateID)
  return response.data;
}







import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  SaveJobs,
  getJobDetailsJobID,
  updateJob,
  getJobCategoryByGroupIDEstateIDJobCategoryID,
  getAllGroups,
  getEstateDetailsByGroupID,
  getJobCategoryDetailsByEstateID,
  getJobCategoryByGroupIDEstateIDsJobCategoryID,
  getEstateDetailByGroupID,
  getJobCategoryDetailsByEstateIDs
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

async function getEstateDetailByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function getJobCategoryDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/JobCategory/GetJobCategoryDetailsByEstateID', "estateID=" + parseInt(estateID));
  let jobCategoryArray = [];
  for (let item of Object.entries(response.data)) {
    jobCategoryArray[item[1]["jobCategoryID"]] = item[1]["jobCategoryName"];
  }
  return jobCategoryArray;
};

async function SaveJobs(saveModel) {
  const response = await CommonPost('/api/Job/SaveJobs', null, saveModel);
  return response;
}

async function updateJob(gang) {
  const response = await CommonPost('/api/Job/UpdateJobs', null, gang);
  return response;
}

async function getJobDetailsJobID(jobID) {
  const response = await CommonGet('/api/Job/GetJobDetailsJobID', "jobID=" + parseInt(jobID));
  return response.data;
}

async function getJobCategoryByGroupIDEstateIDJobCategoryID(groupID, estateID, jobCategoryID) {
  const response = await CommonGet('/api/Job/GetJobDetailsByGroupIDEstateIDJobCategoryID', 'groupID=' + parseInt(groupID) + "&estateID=" + parseInt(estateID) + '&jobCategoryID=' + parseInt(jobCategoryID))
  return response.data;

}


async function getJobCategoryByGroupIDEstateIDsJobCategoryID(groupID, estateID, jobCategoryCode) {
  const response = await CommonGet('/api/Job/GetJobDetailsByGroupIDEstateIDsJobCategoryID', 'groupID=' + parseInt(groupID) + "&estateID=" + estateID + '&jobCategoryCode=' + jobCategoryCode)
  return response.data;

}


async function getJobCategoryDetailsByEstateIDs(estateID) {

  let response = await CommonGet('/api/JobCategory/GetJobCategoryDetailsByEstateIDs', "estateID=" + estateID);
  let jobCategoryArray = [];
  for (let item of Object.entries(response.data)) {
    jobCategoryArray[item[1]["jobCategoryCode"]] = item[1]["jobCategoryName"];
  }
  return jobCategoryArray;
};



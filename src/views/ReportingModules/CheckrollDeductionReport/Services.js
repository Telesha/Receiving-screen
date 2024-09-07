import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getDeductionTypes,
  getCheckRollDeductionReportDetail
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

async function getDeductionTypes() {
  let response = await CommonGet('/api/DeductionType/GetAllDeductionTypes', null);
  let deductionTypesArray = [];
  for (let item of Object.entries(response.data)) {
    deductionTypesArray[item[1]["deductionTypeID"]] = item[1]["deductionTypeName"];
  }
  return deductionTypesArray;
};

async function getCheckRollDeductionReportDetail(model) {
  const response = await CommonPost('/api/CheckRollDeductionReport/GetCheckRollDeductionReportDetail', null, model);
  return response;
};


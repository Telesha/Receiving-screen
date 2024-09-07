import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getOtherEarningType,
  getEmployeeNumberByEmployeeName,
  GetDetailsByCheckRollOtherEarningID,
  UpdateOtherEarning,
  saveOtherEarning,
  GetcheckRollOtherEarningViewDetails,
  getAllOtherEarningDetails,
  DeleteOtherEarning,
  getAttendanceExecutionDate
};

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
};

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function getOtherEarningType(estateID) {
  let response = await CommonGet('/api/OtherEarning/GetAllOtherEarnings', null);
  let OtherEarningTypeArray = [];
  for (let item of Object.entries(response.data)) {
    OtherEarningTypeArray[item[1]["otherEarningTypeID"]] = item[1]["otherEarningTypeName"];
  }
  return OtherEarningTypeArray;
};

async function getAllOtherEarningDetails(model) {
  const response = await CommonPost('/api/OtherEarning/GetDetailsOfOtherEarning', null, model);
  return response;
}

async function getEmployeeNumberByEmployeeName(regNo, divisionID) {
  let response = await CommonGet('/api/OtherEarning/GetEmployeeNumberByEmployeeName', "empNO=" + regNo + "&divsionID=" + parseInt(divisionID));
  return response.data;
};

async function GetDetailsByCheckRollOtherEarningID(checkRollOtherEarningID) {
  let response = await CommonGet('/api/OtherEarning/GetDetailsByCheckRollOtherEarningID', "checkRollOtherEarningID=" + parseInt(checkRollOtherEarningID))
  return response.data;
};

async function UpdateOtherEarning(otherearning) {
  const response = await CommonPost('/api/OtherEarning/UpdateOtherEarning', null, otherearning);
  return response;
}

async function GetcheckRollOtherEarningViewDetails(model) {
  const response = await CommonPost('/api/OtherEarning/GetcheckRollOtherEarningViewDetails', null, model);
  return response;
};

async function saveOtherEarning(ArrayField) {
  const response = await CommonPost('/api/OtherEarning/SaveOtherEarning', null, ArrayField);
  return response;
};

async function DeleteOtherEarning(model) {
  const response = await CommonPost('/api/OtherEarning/DeleteOtherEarning', null, model)
  return response;
}

async function getAttendanceExecutionDate(groupID, factoryID, divisionID) {
  let model = {
    groupID: parseInt(groupID),
    estateID: parseInt(factoryID),
    divisionID: parseInt(divisionID)
  }
  const response = await CommonPost('/api/DailyCheckroll/GetAttendanceExecutionDate', null, model);
  return response.data;
}
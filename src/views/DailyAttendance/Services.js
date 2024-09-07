import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getEmployeeNameByRegNo,
  GetDetailsByDailyAttendanceID,
  UpdateDailyAttendance,
  SaveAttendanceDetails,
  GetDailyAttendanceDetails,
  DeleteDailyAttendance
};

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
};

async function getEmployeeNameByRegNo(estateID, employeeNumber) {
  let response = await CommonGet('/api/DailyAttendance/GetEmployeeNameByRegNo', "estateID=" + parseInt(estateID) + "&employeeNumber=" + employeeNumber)
  return response.data
}

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function GetDailyAttendanceDetails(model) {
  const response = await CommonPost('/api/DailyAttendance/GetDailyAttendanceDetails', null, model);
  return response;
}

async function GetDetailsByDailyAttendanceID(DailyAttendanceID) {
  let response = await CommonGet('/api/DailyAttendance/GetDetailsByDailyAttendanceID', "DailyAttendanceID=" + parseInt(DailyAttendanceID))
  return response.data;
};

async function UpdateDailyAttendance(DailyAttendance) {
  const response = await CommonPost('/api/DailyAttendance/UpdateDailyAttendance', null, DailyAttendance);
  return response;
}

async function SaveAttendanceDetails(ArrayField) {
  const response = await CommonPost('/api/DailyAttendance/SaveAttendanceDetails', null, ArrayField);
  return response;
};

async function DeleteDailyAttendance(model) {
  const response = await CommonPost('/api/DailyAttendance/DeleteDailyAttendance', null, model)
  return response;
}

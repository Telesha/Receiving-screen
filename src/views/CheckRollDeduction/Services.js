import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';
import moment from 'moment';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  saveDetails,
  GetCheckRollDeductionViewDetail,
  DeleteCheckRollDeduction,
  getDeductionTypes,
  GetDetailsByCheckRollDeductionID,
  UpdateCheckRollDeduction,
  validateRegNo,
  GetEmployeeByRegNo,
  getAttendanceExecutionDate
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

async function saveDetails(fieldDataList) {
  const response = await CommonPost('/api/CheckRollDeduction/SaveCheckRollDeduction', null, fieldDataList);
  return response;
};

async function validateRegNo(division, regNo, deductionType, date, OperationEntityID) {
  const response = await CommonPost('/api/CheckRollDeduction/ValidateRegNo', "division=" + parseInt(division) + "&regNo=" + regNo + "&deductionType=" + parseInt(deductionType) + "&date=" + moment(date).format("YYYY-MM-DD") + "&OperationEntityID=" + OperationEntityID);
  return response;
};

async function GetCheckRollDeductionViewDetail(model) {
  const response = await CommonPost('/api/CheckRollDeduction/GetCheckRollDeductionDetail', null, model);
  return response;
};

async function DeleteCheckRollDeduction(model) {
  const response = await CommonPost('/api/CheckRollDeduction/DeleteCheckRollDeductionDetails', null, model)
  return response;
}

async function GetDetailsByCheckRollDeductionID(checkRollDeductionID) {
  let response = await CommonPost('/api/CheckRollDeduction/GetDetailsByCheckRollDeductionID', "checkRollDeductionID=" + parseInt(checkRollDeductionID))
  return response.data;

}

async function UpdateCheckRollDeduction(checkRollDetails) {
  const response = await CommonPost('/api/CheckRollDeduction/UpdateCheckRollDeduction', null, checkRollDetails);
  return response;
}

async function GetEmployeeByRegNo(regNo, divisionID) {
  let response = await CommonPost('/api/CheckRollDeduction/GetEmployeeByRegNo', "divisionID=" + parseInt(divisionID) + "&regNo=" + regNo)

  return response.data;

}

async function getAttendanceExecutionDate(groupID, estateID, division) {
  let model = {
    groupID: parseInt(groupID),
    estateID: parseInt(estateID),
    divisionID: parseInt(division)
  }
  const response = await CommonPost('/api/DailyCheckroll/GetAttendanceExecutionDate', null, model);
  return response.data;
}
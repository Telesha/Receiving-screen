import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import moment from 'moment';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getFieldDetailsByDivisionID,
  getGangDetailsByDivisionID,
  saveDailyCheckroll,
  getDailyCheckRollDetail,
  saveCheckrollAttendance,
  getFieldAllDetailsByDivisionID,
  getDailyCheckRollEmptypeDetail,
  GetEmployeeDetailsByEmployeeID,
  getNormValueByEstateID,
  getAttendanceDetails,
  getPluckingAttendanceDetailsByAttendanceID,
  getFieldDetailsByDivisionIDForDropdown,
  updateDailyCheckroll,
  DeleteDailyCheckroll,
  getMusterChitDetailsByDateDivisionID,
  getMusterchitDetailsByMusterchitID,
  GetJobTypesForDropDown,
  CheckIsholidayValidationSundry,
  getOperatorsForDropdown,
  GetEmployeeTypesData,
  getEmployeeNameByRegNo,
  DecreaseTheMusterChitEmployeeCount,
  IncreaseTheMusterChitEmployeeCount,
  ValidateTheJobsWithJobType,
  GetMusterChitCountByMusterID,
  GetEmployeeNoForStaffEmployee,
  GetRegisterNoValidateByMainDivision,
  CheckAttendanceSundryPlucking,
  getLentEstateNameByLentEstateID,
  getAttendanceExecutionDate
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
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function getMusterchitDetailsByMusterchitID(musterChitID) {
  let response = await CommonGet('/api/MusterChit/GetMusterchitDetailsByMusterchitID', "musterChitID=" + parseInt(musterChitID));

  return response.data;
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
  return response.data;
};

async function getMusterChitDetailsByDateDivisionID(mainDivisionID, collectedDate, isUpdate) {
  let response = await CommonGet('/api/MusterChit/GetMusterChitDetailsByDateDivisionID', "divisionID=" + parseInt(mainDivisionID) + "&collectedDate=" + moment(collectedDate).format("YYYY-MM-DD") + "&isUpdate=" + isUpdate);
  let musterChitArray = [];
  for (let item of Object.entries(response.data)) {
    musterChitArray[item[1]["musterChitID"]] = item[1]["musterChitNumber"];
  }
  return musterChitArray;
};

async function getFieldDetailsByDivisionIDForDropdown(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function getFieldAllDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  return response.data;
};

async function getGangDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let gangArray = [];
  for (let item of Object.entries(response.data)) {
    gangArray[item[1]["gangID"]] = item[1]["gangName"];
  }
  return gangArray;
};

async function saveDailyCheckroll(updateModel) {
  const response = await CommonPost('/api/DailyCheckroll/SaveDailyCheckroll', null, updateModel);
  return response;
}
async function updateDailyCheckroll(updateModel) {
  const response = await CommonPost('/api/DailyCheckroll/updateDailyCheckroll', null, updateModel);
  return response;
}

async function DeleteDailyCheckroll(updateModel) {
  const response = await CommonPost('/api/DailyCheckroll/DeleteDailyCheckroll', null, updateModel);
  return response;
}


async function getDailyCheckRollDetail(divisionID, employeeNumber, collectedDate) {
  let inputmodel = {
    divisionID: parseInt(divisionID),
    employeeNumber: employeeNumber,
    collectedDate: collectedDate
  }
  const response = await CommonPost('/api/DailyCheckroll/getDailyCheckRollDetail', null, inputmodel);
  return response.data;
}

async function getDailyCheckRollEmptypeDetail(employeeNumber, mainDivisionID) {
  const response = await CommonGet('/api/DailyCheckroll/GetDailyCheckRollEmptypeDetail', "employeeNumber=" + employeeNumber + "&divisionID=" + parseInt(mainDivisionID));
  return response.data;
}

async function saveCheckrollAttendance(updateModel) {
  const response = await CommonPost('/api/DailyCheckroll/SaveCheckrollAttendance', null, updateModel);
  return response;
}

async function GetEmployeeDetailsByEmployeeID(employeeNumber) {
  const response = await CommonPost('/api/Employee/GetEmployeeDetailsByEmployeeID', null, employeeNumber);
  return response;
}

async function getNormValueByEstateID(model) {
  const response = await CommonPost('/api/DailyCheckroll/GetNormValueByEstateID', null, model);
  return response;
}

async function getAttendanceDetails(model) {
  const response = await CommonPost('/api/DailyCheckroll/GetCheckrollDetails', null, model);
  return response.data;
}

async function getPluckingAttendanceDetailsByAttendanceID(employeeAttendanceID) {
  const response = await CommonGet('/api/DailyCheckroll/GetPluckingAttendanceDetailsByAttendanceID', "employeeAttendanceID=" + parseInt(employeeAttendanceID));
  return response.data;
}

async function GetJobTypesForDropDown() {
  let response = await CommonGet('/api/HarvestingJobType/GetAllHarvestingJobTypeDetails', null);
  let harvestingJobTypeArray = [];
  for (let item of Object.entries(response.data)) {
    harvestingJobTypeArray[item[1]["harvestingJobTypeID"]] = item[1]["harvestingJobTypeName"];
  }
  return harvestingJobTypeArray;
};

async function CheckIsholidayValidationSundry(date) {
  let response = await CommonGet('/api/EmployeeSundryAttendance/CheckIsholidayValidationSundry', "date=" + date)
  return response.data
}

async function getOperatorsForDropdown() {
  const response = await CommonGet('/api/Operator/GetAllOperators', null)
  let operatorArray = [];
  for (let item of Object.entries(response.data)) {
    operatorArray[item[1]["operatorID"]] = item[1]["operatorName"]
  }
  return operatorArray
}

async function GetEmployeeTypesData() {
  var response = await CommonGet('/api/Employee/GetAllEmployeeType', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"]
  }
  return array;
}

async function getEmployeeNameByRegNo(employeeNumber, mainDivisionID) {
  let response = await CommonGet('/api/DailyCheckroll/GetEmployeeNameByRegNo', "employeeNumber=" + employeeNumber + "&divisionID=" + parseInt(mainDivisionID))
  return response.data
}

async function DecreaseTheMusterChitEmployeeCount(musterChitID, attendenceID, modifiedBy) {
  let response = await CommonGet('/api/EmployeeSundryAttendance/DecreseMusterChitEmployeeCount', "musterChitID=" + parseInt(musterChitID) + "&attendenceID=" + parseInt(attendenceID) + '&modifiedBy=' + parseInt(modifiedBy))
  return response;
}

async function IncreaseTheMusterChitEmployeeCount(musterChitID, attendenceID, modifiedBy) {
  let response = await CommonGet('/api/EmployeeSundryAttendance/IncreaseMusterChitEmployeeCount', "musterChitID=" + parseInt(musterChitID) + "&attendenceID=" + parseInt(attendenceID) + '&modifiedBy=' + parseInt(modifiedBy))
  return response.data
}

async function ValidateTheJobsWithJobType(empNo, date, employeeID, jobTypeID) {
  let response = await CommonGet('/api/DailyCheckroll/ValidateTheJobsWithJobType', 'empNo=' + empNo + '&date=' + date + '&empID=' + employeeID + '&jobTypeID=' + jobTypeID)
  return response;
}

async function GetMusterChitCountByMusterID(musterChitID) {
  let response = await CommonGet('/api/EmployeeSundryAttendance/GetMusterChitCountByMusterID', 'musterChitID=' + parseInt(musterChitID));
  return response.data;
}

async function GetEmployeeNoForStaffEmployee(empNo, employeeID) {
  let response = await CommonGet('/api/EmployeeSundryAttendance/GetEmployeeNoForStaffEmployee', 'empNo=' + empNo + '&empID=' + employeeID);
  return response;
}

async function GetRegisterNoValidateByMainDivision(mainDivisionID, empNo, employeeID) {
  let response = await CommonGet('/api/EmployeeSundryAttendance/GetRegisterNoValidateByMainDivision', 'mainDivisionID=' + mainDivisionID + '&empNo=' + empNo + '&empID=' + parseInt(employeeID));
  return response;
}

async function CheckAttendanceSundryPlucking(empNo, date, jobTypeID, employeeID) {
  let response = await CommonGet('/api/DailyCheckroll/CheckAttendanceSundryPluckingWithJobType', 'empNo=' + empNo + '&date=' + date + '&jobTypeID=' + parseInt(jobTypeID) + '&empID=' + parseInt(employeeID))
  return response;
}

async function getLentEstateNameByLentEstateID(lentEstateID) {
  let response = await CommonGet('/api/EmployeeSundryAttendance/GetLentEstateNameByLentEstateID', 'lentEstateID=' + lentEstateID);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["estateID"]] = item[1]["estateName"]
  }
  return array;
}

async function getAttendanceExecutionDate(groupID, estateID, divisionID) {
  let model = {
    groupID: parseInt(groupID),
    estateID: parseInt(estateID),
    divisionID: parseInt(divisionID)
  }
  const response = await CommonPost('/api/DailyCheckroll/GetAttendanceExecutionDate', null, model);
  return response.data;
}
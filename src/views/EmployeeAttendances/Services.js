import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  saveEmployeeAttendances,
  GetUpdateEmployeeAttendanceDetailsByEmployeeAttendanceID,
  updateEmployeeAttendances,
  getAllGroups,
  getAllFactoriesByGroupID,
  getFactoryItemDetailsByGroupIDFactoryID,
  getAllActiveItemCategory,
  GetEmployeeAttendanceDetailsByDateEPFNumber,
  getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber,
  GetEmployeeDayWiseData,
  GetEmployeeAttendanceDetailsByMonthEmployeeID,
  GetEmployeeAttendanceDetailsByDate,
  GetEmployeeAllShift
};

async function saveEmployeeAttendances(attendances) {
  let saveModel = {
    groupID: parseInt(attendances.groupID),
    factoryID: parseInt(attendances.factoryID),
    employeeID: parseInt(attendances.employeeID),
    attendanceList: attendances.attendanceList,
    createdBy: parseInt(attendances.createdBy)   
    }    
  const response = await CommonPost('/api/EmployeeAttendance/SaveEmployeeAttendance', null, saveModel);
  return response;
}

async function updateEmployeeAttendances(updateModel) {
  updateModel.createdBy = parseInt(tokenDecoder.getUserIDFromToken());
  const response = await CommonPost('/api/EmployeeAttendance/UpdateEmployeeAttendance', null, updateModel);
  return response;
}

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
}

async function getAllFactoriesByGroupID(groupID) {
  let response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', 'groupID=' + parseInt(groupID));
  let factoryArray = []
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}

async function getFactoryItemDetailsByGroupIDFactoryID(groupID, factoryID) {
  const response = await CommonGet('/api/FactoryItem/GetFactoryItemDetailsByGroupIDFactoryID', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}

async function GetUpdateEmployeeAttendanceDetailsByEmployeeAttendanceID(employeeAttendanceID) {
  const response = await CommonGet('/api/EmployeeAttendance/GetUpdateEmployeeAttendanceDetailsByEmployeeAttendanceID', "employeeAttendanceID=" + parseInt(employeeAttendanceID));
  return response.data;
}

async function getAllActiveItemCategory() {
  const response = await CommonGet('/api/ItemCategory/GetAllActiveItemCategory', null);

  let factoryArray = []
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["itemCategoryID"]] = item[1]["categoryName"]
  }

  return factoryArray;
}

async function GetEmployeeAttendanceDetailsByDateEPFNumber(model) {
  const response = await CommonPost('/api/EmployeeAttendance/GetEmployeeAttendanceDetailsByDateEPFNumber', null, model)
  return response.data;
}

async function GetEmployeeDayWiseData(model) {
  const response = await CommonPost('/api/EmployeeAttendance/GetEmployeeDayWiseData', null, model)
  return response.data;
}

async function getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber(groupID, factoryID, regNo, epfNo) {
  const response = await CommonGet('/api/EmployeeAttendance/GetEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID) + "&regNo=" + regNo + '&epfNo=' + epfNo)
  return response;
}

async function GetEmployeeAttendanceDetailsByMonthEmployeeID(model) {
  const response = await CommonPost('/api/EmployeeAttendance/GetEmployeeAttendanceDetailsByMonthEmployeeID', null, model)
  return response.data;
}

async function GetEmployeeAttendanceDetailsByDate(model) { 
  const response = await CommonPost('/api/EmployeeAttendance/GetEmployeeAttendanceDetailsByDate', null, model)
  return response.data;
}

async function GetEmployeeAllShift() {
  const response = await CommonGet('/api/EmployeeAttendance/GetEmployeeAllShift', null)
  let shiftArray = []
  for (let item of Object.entries(response.data)) {
    shiftArray[item[1]["shiftID"]] = item[1]["shiftName"]
  }
  return shiftArray;
}


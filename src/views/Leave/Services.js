import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  saveEmployeeLeaveDetails,
  getAllGroups,
  getAllFactoriesByGroupID,
  GetEmployeeLeaveDetailsByGroupFactoryRegistrationNo,
  getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber,
  getEmployeeLeaveType,
  getLeaveDetailsByEmployeeLeaveDetailsID,
  UpdateLeaveDetails
};

async function saveEmployeeLeaveDetails(leaveDetails, userID) {
  let saveModel = {
    groupID: parseInt(leaveDetails.groupID),
    operationEntityID: parseInt(leaveDetails.factoryID),
    employeeID: parseInt(leaveDetails.employeeID),
    employeeName: leaveDetails.empName,
    leaveType: parseInt(leaveDetails.leaveType),
    nicNumber: leaveDetails.nic,
    allocatedDays: parseFloat(leaveDetails.noOfDays),
    registrationNumber: leaveDetails.regNo,
    createdBy: parseInt(userID),
  }
  const response = await CommonPost('/api/Leave/SaveLeaveDetails', null, saveModel);
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

async function GetEmployeeLeaveDetailsByGroupFactoryRegistrationNo(groupID, operationEntityID, registrationNumber) {
  const response = await CommonGet('/api/Leave/GetLeaveDetailsByGroupOperationEntityRegNo', "groupID=" + parseInt(groupID) + "&operationEntityID=" + parseInt(operationEntityID) + "&registrationNumber=" + registrationNumber);
  return response;
}

async function getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber(factoryID, regNo, epfNo) {
  const response = await CommonGet('/api/EmployeeAttendance/GetEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber', 'factoryID=' + parseInt(factoryID) + "&regNo=" + regNo + "&epfNo=" + epfNo);
  return response;
}

async function getEmployeeLeaveType() {
  let response = await CommonGet('/api/Employee/GetEmployeeLeaveType', null);
  let leaveTypeArray = []
  for (let item of Object.entries(response.data)) {
    leaveTypeArray[item[1]["employeeLeaveTypeID"]] = item[1]["employeeLeaveTypeName"]
  }
  return leaveTypeArray;
}

async function getLeaveDetailsByEmployeeLeaveDetailsID(employeeLeaveDetailsID) {
  const response = await CommonGet('/api/Leave/GetLeaveDetailsByEmployeeID', "employeeLeaveDetailsID=" + parseInt(employeeLeaveDetailsID));
  return response;
}

async function UpdateLeaveDetails(leaveDetails, userID) {
  let updateModel = {
    employeeLeaveDetailsID: parseInt(leaveDetails.employeeLeaveDetailsID),
    allocatedDays: parseFloat(leaveDetails.noOfDays),
    modifiedBy: parseInt(userID),
  }
  const response = await CommonPost('/api/Leave/UpdateEmployeeLeaveDetails', null, updateModel);
  return response;
}

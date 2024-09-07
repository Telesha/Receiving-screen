import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getleaveTypes,
  getEmployeesForDropdown,
  SaveLeaveFormDetails,
  getEmployeeAvailability,
  getAllLeaveRequestDetailsByGroupFactory,
  getEmployeeLeaveFormDetailsByEmployeeLeaveRequestID,
  updateLeaveFormDetails,
  getEmployeeRemainingLeaveValue,
  SaveRejectedLeaveRequest,
  SaveApprovedLeaveRequest,
  getDivisionDetailsByEstateID,
  getAllocatedDays,
  getEmployeeLeaveFormDetailsByLeaveRefNo,
  getEmployeesByEstateID
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

async function getFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
};

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getleaveTypes() {
  let response = await CommonGet('/api/EmployeeLeaveRequest/GetAllEmployeeLeaveTypes', null);
  return response.data;
}

async function getEmployeesForDropdown(groupID, factoryID) {
  var employeeArray = [];
  const response = await CommonGet('/api/Manufacturing/GetEmployees', 'groupID=' + groupID + "&operationEntityID=" + factoryID)
  for (let item of Object.entries(response.data)) {
    employeeArray[item[1]["employeeID"]] = item[1]["fullName"]
  }
  return employeeArray;
}

async function SaveLeaveFormDetails(model) {
  const response = await CommonPost('/api/LeaveRequest/SaveLeaveRequestDetails', null, model);
  return response;
}

async function updateLeaveFormDetails(model) {
  const response = await CommonPost('/api/LeaveRequest/UpdateLeaveFormDetails', null, model);
  return response;
}

async function getEmployeeAvailability(groupID, factoryID, regNo) {
  const response = await CommonGet('/api/LeaveRequest/GetEmployeeAvailability', 'groupID=' + groupID + "&factoryID=" + factoryID + "&registrationNumber=" + regNo);
  return response;
}

async function getAllLeaveRequestDetailsByGroupFactory(model) {
  const response = await CommonPost('/api/LeaveRequest/GetAllLeaveRequestDetailsByGroupFactory', null, model);
  return response;
}

async function getEmployeeLeaveFormDetailsByEmployeeLeaveRequestID(LeaveRefNo) {
  const response = await CommonGet('/api/LeaveRequest/GetLeaveRequestDetailsByEmployeeLeaveRequestID', 'LeaveRefNo=' + parseInt(LeaveRefNo));
  return response.data;
}

async function getEmployeeRemainingLeaveValue(leaveTypeID, regNo) {
  let model = {
    LeaveTypeID: leaveTypeID,
    RegistrationNumber: regNo
  }
  const response = await CommonPost('/api/LeaveRequest/GetRemaingingLeaveBalance', null, model);
  return response;
}

async function SaveRejectedLeaveRequest(model) {
  const response = await CommonPost('/api/LeaveRequest/SaveRejectedLeaveRequest', null, model);
  return response;
}

async function SaveApprovedLeaveRequest(model) {
  const response = await CommonPost('/api/LeaveRequest/SaveApproveLeaveRequest', null, model);
  return response;
}

async function getAllocatedDays(leaveTypeID, regNo) {
  let model = {
    LeaveTypeID: leaveTypeID,
    RegistrationNumber: regNo
  }
  const response = await CommonPost('/api/LeaveRequest/GetAllocatedDays', null, model);
  return response;
}

async function getEmployeeLeaveFormDetailsByLeaveRefNo(LeaveRefNo) {
  const response = await CommonGet('/api/LeaveRequest/GetEmployeeLeaveFormDetailsByLeaveRefNo', 'LeaveRefNo=' + parseInt(LeaveRefNo));
  return response;
}

async function getEmployeesByEstateID(estateID) {
  let response = await CommonGet('/api/AttendanceMark/GetEmployeesListByEstateID', 'estateID=' + estateID);
  return response.data;
}
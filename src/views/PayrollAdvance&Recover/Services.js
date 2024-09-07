import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import moment from 'moment';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  saveDetails,
  GetPayRollAdvanceViewDetail,
  DeletePayRollAdvance,
  GetDetailsByPayRollAdvanceID,
  UpdatePayrollAdvance,
  validateempNo,
  GetEmpNameByEmpNo,
  getDesignationsForDropdownByEstateID,
  getEmployeesByEstateID
}

async function saveDetails(model) {
  const response = await CommonPost('/api/PayRollAdvance/SavePayrollAdvance', null, model);
  return response;
};

async function GetPayRollAdvanceViewDetail(model) {
  const response = await CommonPost('/api/PayRollAdvance/GetPayRollAdvanceViewDetail', null, model);
  return response;
};

async function DeletePayRollAdvance(model) {
  const response = await CommonPost('/api/PayRollAdvance/DeletePayRollAdvanceDetails', null, model)
  return response;
}

async function GetDetailsByPayRollAdvanceID(advanceIssueID) {
  let response = await CommonPost('/api/PayRollAdvance/GetDetailsByPayRollAdvanceID', "payRollAdvanceID=" + parseInt(advanceIssueID))
  return response.data;

}

async function UpdatePayrollAdvance(payRollDetails) {
  const response = await CommonPost('/api/PayRollAdvance/UpdatePayrollAdvance', null, payRollDetails);
  return response;
}

async function validateempNo(empNo, date, OperationEntityID) {
  const response = await CommonPost('/api/PayRollAdvance/ValidateEmpNo', "&empNo=" + empNo + "&date=" + moment(date).format("YYYY-MM-DD") + "&OperationEntityID=" + OperationEntityID);
  return response;
};

async function GetEmpNameByEmpNo(empNo) {
  let response = await CommonGet('/api/PayRollAdvance/GetEmpNameByEmpNo', 'empNo=' + empNo);
  return response.data;
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

async function getEmployeesByEstateID(estateID) {
  let response = await CommonGet('/api/AttendanceMark/GetEmployeesListByEstateID', 'estateID=' + estateID);
  return response.data;
}

async function getDesignationsForDropdownByEstateID(estateID) {
  var designationArray = [];
  let response = await CommonGet('/api/Designation/GetEmployeeDesignationByEstateID', 'estateID=' + parseInt(estateID));
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      designationArray[item[1]["designationID"]] = item[1]["designation"]
    }
  }
  return designationArray;
}







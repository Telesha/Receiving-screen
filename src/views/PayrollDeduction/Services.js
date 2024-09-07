import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDesignationsByFactoryID,
  saveDetails,
  GetPayRollDeductionViewDetail,
  DeletePayRollDeduction,
  GetDetailsByPayRollDeductionID,
  UpdatePayRollDeduction,
  getEmployeeNumberByEmployeeName,
  GetAllPayrollDeductionTypes,
}

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
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

async function getDesignationsByFactoryID(factoryID) {
  let response = await CommonGet('/api/PayRollDeduction/GetDesignationsByFactoryID', "factoryID=" + parseInt(factoryID));
  let designationArray = [];
  for (let item of Object.entries(response.data)) {
    designationArray[item[1]["designationID"]] = item[1]["designationName"];
  }
  return designationArray;
};

async function GetAllPayrollDeductionTypes() {
  let response = await CommonGet('/api/PayRollDeduction/GetAllPayrollDeductionTypes', null);
  let deductionTypesArray = [];
  for (let item of Object.entries(response.data)) {
    deductionTypesArray[item[1]["payRollDeductionTypeID"]] = item[1]["payRollDeductionTypeName"];
  }
  return deductionTypesArray;
};

async function saveDetails(fieldDataList) {
  const response = await CommonPost('/api/PayRollDeduction/SavePayRollDeduction', null, fieldDataList);
  return response;
};

async function GetPayRollDeductionViewDetail(model) {
  const response = await CommonPost('/api/PayRollDeduction/GetPayRollDeductionDetail', null, model);
  return response;
};

async function DeletePayRollDeduction(model) {
  const response = await CommonPost('/api/PayRollDeduction/DeletePayRollDeductionDetails', null, model)
  return response;
};

async function GetDetailsByPayRollDeductionID(payrollDeductionID) {
  let response = await CommonPost('/api/PayRollDeduction/GetDetailsByPayRollDeductionID', "PayRollDeductionID=" + parseInt(payrollDeductionID))
  return response.data;
};

async function UpdatePayRollDeduction(PayRollDetails) {
  const response = await CommonPost('/api/PayRollDeduction/UpdatePayRollDeduction', null, PayRollDetails);
  return response;
};

async function getEmployeeNumberByEmployeeName(regNo,estateID) {
  let response = await CommonGet('/api/PayRollDeduction/GetEmployeeNameByEmployeeID' , "&estateID=" + parseInt(estateID) + "&regNo=" + regNo)
  return response.data;
}



import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDesignationsByFactoryID,
  getAllPayrollEarningTypes,
  getEmployeeNumberByEmployeeName,
  GetDetailsByPayRollOtherEarningID,
  UpdateOtherEarning,
  saveOtherEarning,
  getAllOtherEarningDetails,
  DeleteOtherEarning,
  CheckPayrollOtherEarning
};

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
    let response = await CommonGet('/api/Employee/GetEmployeeDesignationByfactoryIDOnlyStaff', "factoryID=" + parseInt(factoryID));
    let designationArray = [];
    for (let item of Object.entries(response.data)) {
      designationArray[item[1]["designationID"]] = item[1]["designationName"];
    }
    return designationArray;
  };

async function getAllPayrollEarningTypes() {
  let response = await CommonGet('/api/PayrollOtherEarnings/GetAllPayrollEarningTypes', null);
  let OtherEarningTypeArray = []; 
  for (let item of Object.entries(response.data)) {
    OtherEarningTypeArray[item[1]["payrollEarningTypeID"]] = item[1]["payrollEarningTypeName"];
  }
  return OtherEarningTypeArray;
};

async function getAllOtherEarningDetails(model) {
  const response = await CommonPost('/api/PayrollOtherEarnings/GetDetailsOfPayrollOtherEarning', null, model);
  return response;
}

async function getEmployeeNumberByEmployeeName(regNo) {
  let response = await CommonGet('/api/PayrollOtherEarnings/GetEmployeeNameByEmployeeID', "empNO=" + regNo);
  return response.data;
};

async function GetDetailsByPayRollOtherEarningID(payRollOtherEarningID) {
  let response = await CommonGet('/api/PayrollOtherEarnings/GetDetailsByPayRollOtherEarningID', "payRollOtherEarningID=" + parseInt(payRollOtherEarningID))
  return response.data;
};

async function UpdateOtherEarning(otherearning) {
  const response = await CommonPost('/api/PayrollOtherEarnings/UpdatePayrollOtherEarning', null, otherearning);
  return response;
}

async function saveOtherEarning(ArrayField) {
  const response = await CommonPost('/api/PayrollOtherEarnings/SavePayrollOtherEarning', null, ArrayField);
  return response;
};

async function DeleteOtherEarning(model) {
  const response = await CommonPost('/api/PayrollOtherEarnings/DeletePayrollOtherEarning', null, model)
  return response;
}

async function CheckPayrollOtherEarning(model) {
  const response = await CommonPost('/api/PayrollOtherEarnings/CheckPayrollOtherEarning', null, model)
  return response;
}

import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  saveSalaryAdditionsDeductions,
  getAllGroups,
  getAllFactoriesByGroupID,
  getFactoryItemDetailsByGroupIDFactoryID,
  GetEmployeeSalaryAditionsDeductionsDetailsByGroupFactoryDate,
  getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber,
  GetEmployeeDayWiseData
};

async function saveSalaryAdditionsDeductions(salaryDetails, userID, fromDate) {
  let saveModel = {
    groupID: parseInt(salaryDetails.groupID),
    factoryID: parseInt(salaryDetails.factoryID),
    employeeID: parseInt(salaryDetails.employeeID),
    amount: parseFloat(salaryDetails.amount),
    reason: salaryDetails.reason,
    transactionType: parseInt(salaryDetails.transactionType),
    date: fromDate,
    createdBy: parseInt(userID),

  }
  const response = await CommonPost('/api/SalaryAdditionsDeductions/SaveSalaryAdditionsDeductions', null, saveModel);
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

async function GetEmployeeSalaryAditionsDeductionsDetailsByGroupFactoryDate(model) {
  const response = await CommonPost('/api/SalaryAdditionsDeductions/GetSalaryAdditionsDeductionsByGroupFactoryDate', null, model)
  return response.data;
}

async function GetEmployeeDayWiseData(model) {
  const response = await CommonPost('/api/EmployeeAttendance/GetEmployeeDayWiseData', null, model)
  return response.data;
}

async function getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber(factoryID, regNo, epfNo) {
  const response = await CommonGet('/api/EmployeeAttendance/GetEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber', 'factoryID=' + parseInt(factoryID) + "&regNo=" + regNo + "&epfNo=" + epfNo)
  return response.data;
}

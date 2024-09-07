
import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getAllEmployees,
  getEmployeeSalary,
  savePrintReceipt

};

async function getfactoriesForDropDown(groupID) {
  var factoryArray = [];

  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}
async function getGroupsForDropdown() {
  var groupArray = [];
  const response = await CommonGet('/api/Group/GetAllGroups', null)
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"]
    }
  }
  return groupArray;
}


async function getAllEmployees(model) {
  const response = await CommonPost('/api/HRSalaryCalculation/GetAllEmployees', null, model);
  return response;
}

async function getEmployeeSalary(employeeID, createdDate) {
  let response = await CommonGet('/api/HRSalaryCalculation/GetEmployeeCheckroleSalaryByEmployeeID', 'employeeID=' + parseInt(employeeID) + '&CreatedDate=' + createdDate);
  return response;
}

async function savePrintReceipt(model) {
  let response = await CommonPost('/api/InvoiceReceiptPrint/SaveInvoiceReceiptPrint', null, model);
  return response
}
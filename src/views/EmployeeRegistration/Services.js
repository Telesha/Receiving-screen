import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getEmployeeDetailsByFactoryIDGroupID,
  getGroupsForDropdown,
  getFactoryByGroupID,
  getRoutesForDropDown,
  getAllRoutesForDropDown,
  getBanksForDropdown,
  saveEmployee,
  getEmployeeGeneralDetailsByEmployeeID,
  getEmployeePaymentDetailsByEmployeeID,
  getEmployeeSupplimentaryDetailsByEmployeeID,
  getEmployeeStandingOrderDetailsByEmployeeID,
  getEmployeeFundsDetailsByEmployeeID,
  getEmployeeBioMetricsDetailsByEmployeeID,
  updateEmployee,
  DeleteEmployeeBiometricItem,
  DeleteSupplierBiometricItem,
  getBranchesByBankID,
  getAllBranches,
  getFundsForDropdown,
  getFundAmountWithFundID,
  getStandingFundsByCustomerID,
  getStandingOrdersByCustomerID,
  DeleteEmployeeStandingOrderItem,
  DeleteEmployeeStandingFundItem,
  getBanksForTable,
  getBranchesByBankIDForTable,
  DeleteEmployeeSupplimentary,
  GetEmployeeTypesData,
  GetEmployeeCategoriesData,
  GetEmployeeSubCategoriesData,
  GetEemployeeDesignationsData,
  DeleteEmployeeSupplimentary,
  getDivisionDetailsByEstateID,
  GetUnionTypesData,
  getEmployeeBasicSalaryByDesignationID,
  getAllowanceTypesForDropDown,
  getAllowanceTypesArray,
  getEmployeeReimbursementDetailsByEmployeeID
};

async function getAllBranches() {
  const response = await CommonGet('/api/Branch/GetAllBranches');
  return response.data;
}

async function getBranchesByBankID(bankID) {
  const response = await CommonGet('/api/Branch/GetBranchesByBankID', 'bankID=' + bankID);
  var branchArray = [];
  for (let item of Object.entries(response.data)) {
    branchArray[item[1]["branchID"]] = item[1]["branchName"];
  }
  return branchArray;

}
async function getBranchesByBankIDForTable(bankID) {
  const response = await CommonGet('/api/Branch/GetBranchesByBankID', 'bankID=' + bankID);
  return response.data;

}

async function getEmployeeDetailsByFactoryIDGroupID(model) {
  let response = await CommonPost('/api/Employee/GetEmployeeDetails', null, model);
  return response;
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

async function getFactoryByGroupID(groupID) {
  var factoryArray = [];
  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function GetEmployeeTypesData() {
  var response = await CommonGet('/api/Employee/GetAllEmployeeType', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"]
  }
  return array;
}

async function GetUnionTypesData() {
  var response = await CommonGet('/api/Employee/GetAllUnionType', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["unionID"]] = item[1]["unionName"]
  }
  return array;
}

async function GetEmployeeCategoriesData() {
  var response = await CommonGet('/api/Employee/GetAllEmployeeCategory', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeCategoryID"]] = item[1]["employeeCategoryName"]
  }
  return array;
}

async function GetEmployeeSubCategoriesData() {
  var response = await CommonGet('/api/Employee/GetAllEmployeeSubCategory', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeSubCategoryID"]] = item[1]["employeeSubCategoryName"]
  }
  return array;
}

async function GetEemployeeDesignationsData(groupID, employeeCategoryID) {
  var array = [];
  var response = await CommonGet('/api/Statutory/GetDesignationByEmployeeCategoryID', 'groupID=' + groupID + '&employeeCategoryID=' + employeeCategoryID);
  for (let item of Object.entries(response.data)) {
    array[item[1]["designationID"]] = item[1]["designationName"];
  
    }
  return array;
}

async function getAllRoutesForDropDown() {
  var routeArray = [];

  const response = await CommonGet('/api/Route/GetAllRoutes', null)
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      routeArray[item[1]["routeID"]] = item[1]["routeName"]
    }
  }
  return routeArray;
}

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};


async function getBanksForTable() {
  const response = await CommonGet('/api/Bank/GetAllBanks', null);
  return response.data;
}

async function getBanksForDropdown() {
  var bankArray = [];
  const response = await CommonGet('/api/Bank/GetAllBanks', null);
  for (let item of Object.entries(response.data)) {
    bankArray[item[1]["bankID"]] = item[1]["bankName"];
  }
  return bankArray;
}

async function getFundsForDropdown(factoryID) {
  var fundArray = [];
  const response = await CommonGet('/api/Customer/GetAllActiveFunds', null);
  for (let item of Object.entries(response.data)) {
    if (parseInt(item[1]["factoryID"]) === parseInt(factoryID)) {
      fundArray[item[1]["fundMasterID"]] = item[1]["fundName"];
    }
  }
  return fundArray;
}

async function getFundAmountWithFundID() {
  const response = await CommonGet('/api/Customer/GetFundAmountWithFundID', null);
  return response.data;
}


async function saveEmployee(data) {

  let saveModel = {
    employeeID: 0,
    groupID: parseInt(data.employeeGeneralArray.groupID),
    operationEntityID: parseInt(data.employeeGeneralArray.factoryID),
    employeeTypeID: parseInt(data.employeeGeneralArray.employeeTypeID),
    employeeCategoryID: parseInt(data.employeeGeneralArray.employeeCategoryID),
    employeeSubCategoryID: parseInt(data.employeeGeneralArray.employeeSubCategoryID),
    employeeDivisionID: parseInt(data.employeeGeneralArray.employeeDivisionID),
    designationID: parseInt(data.employeeGeneralArray.designationID),
    basicMonthlySalary: parseFloat(data.employeeGeneralArray.basicMonthlySalary),
    basicDailySalary: parseFloat(data.employeeGeneralArray.basicDailySalary),
    SpecialAllowance: parseFloat(data.employeeGeneralArray.specialAllowance),
    OtherAllowance: parseFloat(data.employeeGeneralArray.otherAllowance),
    dateOfBirth: data.employeeGeneralArray.dob,
    joiningDate: data.employeeGeneralArray.joiningDate == "" ? null : data.employeeGeneralArray.joiningDate,
    FirstName: data.employeeGeneralArray.firstName,
    secondName: data.employeeGeneralArray.secondName,
    lastName: data.employeeGeneralArray.lastName,
    nICNumber: data.employeeGeneralArray.nICNumber,
    city: data.employeeGeneralArray.city,
    address1: data.employeeGeneralArray.address,
    address2: data.employeeGeneralArray.addresstwo,
    address3: data.employeeGeneralArray.addressthree,
    registrationNumber: data.employeeGeneralArray.registrationNumber,
    isEPFEnable: parseInt(data.employeeGeneralArray.isEPFEnable),
    ePFNumber: data.employeeGeneralArray.epfNumber,
    email: data.employeeGeneralArray.email,
    genderID: parseInt(data.employeeGeneralArray.genderID),
    homeNumber: data.employeeGeneralArray.homeNumber,
    religion: data.employeeGeneralArray.religion,
    raise: data.employeeGeneralArray.raise,
    mobileNumber: data.employeeGeneralArray.mobileNumber,
    titleID: parseInt(data.employeeGeneralArray.titleID),
    areaType: parseInt(data.employeeGeneralArray.areaType),
    area: parseFloat(data.employeeGeneralArray.area),
    isActive: data.employeeGeneralArray.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    employeeCode: data.employeeGeneralArray.employeeCode,
    biometricModel: data.employeeBiometricArray,
    paymentMethodModel: data.paymentMethodArray[0],
    supplimentaryModel: data.supplimentaryArray,
    standingOrders: data.standingOrdersArray,
    standingFunds: data.standingFundsArray,
    isBCardStatus: data.employeeGeneralArray.isBCardStatus,
    unionID: data.employeeGeneralArray.unionID,
    reimbursementArray: data.reimbursementArray
  }
  const response = await CommonPost('/api/Employee/SaveEmployee', null, saveModel);
  return response;
}

async function getEmployeeGeneralDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}

async function getEmployeePaymentDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetPaymentsDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}

async function getEmployeeSupplimentaryDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeSupplimentaryDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}

async function getEmployeeStandingOrderDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeStandingOrderDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));

  return response.data;
}

async function getEmployeeFundsDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeFundsDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}

async function getEmployeeReimbursementDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeReimbursementDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}

async function getEmployeeBioMetricsDetailsByEmployeeID(employeeID) {
  const response = await CommonGet('/api/Employee/GetEmployeeBioMetricsDetailsByEmployeeID', "employeeID=" + parseInt(employeeID));
  return response.data;
}

async function getEmployeeBasicSalaryByDesignationID(designationID, estateID) {
  const response = await CommonGet('/api/Employee/GetEmployeeBasicSalaryByDesignationID', "designationID=" + parseInt(designationID) + "&estateID=" + parseInt(estateID));
  return response.data;
}

async function updateEmployee(data) {

  let updateModel = {
    employeeID: parseInt(data.employeeID),
    groupID: parseInt(data.employeeGeneralArray.groupID),
    operationEntityID: parseInt(data.employeeGeneralArray.factoryID),
    registrationNumber: data.employeeGeneralArray.registrationNumber,
    dateOfBirth: data.employeeGeneralArray.dob,
    joiningDate: data.employeeGeneralArray.joiningDate == "" ? null : data.employeeGeneralArray.joiningDate,
    employeeTypeID: parseInt(data.employeeGeneralArray.employeeTypeID),
    employeeCategoryID: parseInt(data.employeeGeneralArray.employeeCategoryID),
    employeeSubCategoryID: parseInt(data.employeeGeneralArray.employeeSubCategoryID),
    employeeDivisionID: parseInt(data.employeeGeneralArray.employeeDivisionID),
    designationID: parseInt(data.employeeGeneralArray.designationID),
    basicMonthlySalary: parseFloat(data.employeeGeneralArray.basicMonthlySalary),
    basicDailySalary: parseFloat(data.employeeGeneralArray.basicDailySalary),
    SpecialAllowance: parseFloat(data.employeeGeneralArray.specialAllowance),
    OtherAllowance: parseFloat(data.employeeGeneralArray.otherAllowance),
    FirstName: data.employeeGeneralArray.firstName,
    secondName: data.employeeGeneralArray.secondName,
    lastName: data.employeeGeneralArray.lastName,
    nICNumber: data.employeeGeneralArray.nICNumber,
    city: data.employeeGeneralArray.city,
    address1: data.employeeGeneralArray.address,
    address2: data.employeeGeneralArray.addresstwo,
    address3: data.employeeGeneralArray.addressthree,
    isEPFEnable: parseInt(data.employeeGeneralArray.isEPFEnable),
    ePFNumber: data.employeeGeneralArray.epfNumber,
    email: data.employeeGeneralArray.email,
    genderID: parseInt(data.employeeGeneralArray.genderID),
    homeNumber: data.employeeGeneralArray.homeNumber,
    religion: data.employeeGeneralArray.religion,
    raise: data.employeeGeneralArray.raise,
    mobileNumber: data.employeeGeneralArray.mobileNumber,
    titleID: parseInt(data.employeeGeneralArray.titleID),
    areaType: parseInt(data.employeeGeneralArray.areaType),
    area: parseFloat(data.employeeGeneralArray.area),
    isActive: data.employeeGeneralArray.isActive.isActiveResult == undefined ? data.employeeGeneralArray.isActive : data.employeeGeneralArray.isActive.isActiveResult,
    employeeCode: data.employeeGeneralArray.employeeCode,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
    BiometricUpdateModel: data.employeeBiometricArray,
    PaymentMethodUpdateModel: data.paymentMethodArray[0],
    SupplimentaryUpdateModel: data.supplimentaryArray,
    standingFunds: data.standingFundsArray,
    StandingOrdersUpdate: data.standingOrdersArray,
    isBCardStatus: data.employeeGeneralArray.isBCardStatus,
    unionID: data.employeeGeneralArray.unionID,
    reimbursementArray: data.reimbursementArray
  }
  const response = await CommonPost('/api/Employee/UpdateEmployee', null, updateModel);
  return response;
}

async function DeleteEmployeeBiometricItem(employeeBiometricID) {
  const response = await CommonGet('/api/Employee/DeleteEmployeeBiometricItem', "employeeBiometricID=" + employeeBiometricID);
  return response.data;
}

async function DeleteSupplierBiometricItem(customerSupplimentaryBiometricID) {
  const response = await CommonGet('/api/Customer/DeleteSupplierBiometricItem', "customerSupplimentaryBiometricID=" + customerSupplimentaryBiometricID);
  return response.data;
}

async function getStandingFundsByCustomerID(customerID) {
  const response = await CommonGet('/api/Customer/getStandingFundsByCustomerID', "customerID=" + parseInt(customerID));
  return response.data;
}

async function getStandingOrdersByCustomerID(customerID) {
  const response = await CommonGet('/api/Customer/GetStandingOrdersByCustomerID', "customerID=" + parseInt(customerID));
  return response.data;
}

async function DeleteEmployeeStandingOrderItem(standingOrderID) {
  const response = await CommonGet('/api/Employee/DeleteEmployeeStandingOrderItem', "standingOrderID=" + parseInt(standingOrderID));
  return response.data;
}

async function DeleteEmployeeStandingFundItem(fundID) {
  const response = await CommonGet('/api/Employee/DeleteEmployeeStandingFund', "fundID=" + parseInt(fundID));
  return response.data;
}

async function DeleteEmployeeSupplimentary(employeeSupplimentaryID) {
  const response = await CommonGet('/api/Employee/DeleteEmployeeSupplimentary', "employeeSupplimentaryID=" + parseInt(employeeSupplimentaryID));
  return response.data;
}

async function getAllowanceTypesForDropDown(designationID, estateID) {
  const response = await CommonGet('/api/Employee/GetAllowancesTypeByDesignationAndEstateID', "designationID=" + parseInt(designationID) + "&estateID=" + parseInt(estateID));
  return response.data;
}

async function getAllowanceTypesArray(designationID, estateID) {
  const response = await CommonGet('/api/Employee/GetAllowancesTypeByDesignationAndEstateID', "designationID=" + parseInt(designationID) + "&estateID=" + parseInt(estateID));
  return response.data;
}



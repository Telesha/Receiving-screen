import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getCustomersByFactoryID,
  getGroupsForDropdown,
  getFactoryByGroupID,
  getRoutesForDropDown,
  getAllRoutesForDropDown,
  getBanksForDropdown,
  saveCustomer,
  getCustomerGeneralDetailsByCustomerID,
  getCustomerCropBooksByCustomerID,
  getCustomerBoimetricByCustomerID,
  getCustomerPaymentMethodsByCustomerID,
  getsupplierDetailsByCustomerID,
  updateCustomer,
  DeleteCropBookItem,
  DeleteBiometricItem,
  DeleteSupplierBiometricItem,
  getBranchesByBankID,
  getAllBranches,
  getFundsForDropdown,
  getFundAmountWithFundID,
  getStandingFundsByCustomerID,
  getStandingOrdersByCustomerID,
  DeleteStandingOrderItem,
  DeleteStandingFundItem,
  getBanksForTable,
  getBranchesByBankIDForTable,
  getSavingsByCustomerID,
  CheckTransactionDetailsByRegNumber
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
async function getCustomersByFactoryID(factoryID, registrationNumber) {
  let searchModel = {
    factoryID: parseInt(factoryID),
    registrationNumber: registrationNumber.length === 0 ? null : registrationNumber,
  }
  const response = await CommonPost('/api/Customer/GetCustomersByFactoryID', null, searchModel);
  return response.data;
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


async function saveCustomer(data) {
  let saveModel = {
    customerID: 0,
    groupID: parseInt(data.customerGeneralArray.groupID),
    factoryID: parseInt(data.customerGeneralArray.factoryID),
    customerCode: data.customerGeneralArray.customerCode,
    dob: data.customerGeneralArray.dob,
    firstName: data.customerGeneralArray.firstName,
    gender: parseInt(data.customerGeneralArray.gender),
    isActive: data.customerGeneralArray.isActive,
    home: data.customerGeneralArray.home,
    lastName: data.customerGeneralArray.lastName,
    middleName: data.customerGeneralArray.middleName,
    mobile: data.customerGeneralArray.mobile,
    nic: data.customerGeneralArray.nic,
    title: parseInt(data.customerGeneralArray.title),
    address: data.customerGeneralArray.address,
    addresstwo: data.customerGeneralArray.addresstwo,
    addressthree: data.customerGeneralArray.addressthree,
    cropBookModel: data.cropBookArray,
    biometricModel: data.customerBiometricArray,
    paymentMethodModel: data.paymentMethodArray,
    supplimentaryModel: data.supplimentaryArray,
    supplimentaryBiometric: data.supplimentaryBiometricArray,
    standingFunds: data.standingFundsArray,
    standingOrders: data.standingOrdersArray,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    modifiedBy: 0,
    modifiedDate: new Date().toISOString(),
    isActive: data.customerGeneralArray.isActive,
    joiningDate: data.customerGeneralArray.joiningDate,
    areaType: parseInt(data.customerGeneralArray.areaType),
    area: parseFloat(data.customerGeneralArray.area),
    savings: data.SavingsArray
  }
  const response = await CommonPost('/api/Customer/SaveCustomer', null, saveModel);
  return response;
}

async function getCustomerGeneralDetailsByCustomerID(customerID) {
  const response = await CommonGet('/api/Customer/GetCustomerGeneralDetailsByCustomerID', "customerID=" + parseInt(customerID));
  return response.data;
}

async function getCustomerCropBooksByCustomerID(customerID) {
  const response = await CommonGet('/api/Customer/GetCustomerCropBooksByCustomerID', "customerID=" + parseInt(customerID));
  return response.data;
}

async function getCustomerBoimetricByCustomerID(customerID) {
  const response = await CommonGet('/api/Customer/GetCustomerBoimetricByCustomerID', "customerID=" + parseInt(customerID));
  return response.data;

}

async function getCustomerPaymentMethodsByCustomerID(customerID) {
  const response = await CommonGet('/api/Customer/GetCustomerPaymentMethodsByCustomerID', "customerID=" + parseInt(customerID));
  return response.data;
}

async function getsupplierDetailsByCustomerID(customerID) {
  const response = await CommonGet('/api/Customer/GetsupplierDetailsByCustomerID', "customerID=" + parseInt(customerID));
  return response.data;
}

async function updateCustomer(data) {

  let updateModel = {
    customerID: parseInt(data.customerID),
    groupID: parseInt(data.customerGeneralArray.groupID),
    factoryID: parseInt(data.customerGeneralArray.factoryID),
    customerCode: data.customerGeneralArray.customerCode,
    dob: data.customerGeneralArray.dob,
    firstName: data.customerGeneralArray.firstName,
    gender: parseInt(data.customerGeneralArray.gender),
    home: data.customerGeneralArray.home,
    lastName: data.customerGeneralArray.lastName,
    middleName: data.customerGeneralArray.middleName,
    mobile: data.customerGeneralArray.mobile,
    nic: data.customerGeneralArray.nic,
    title: parseInt(data.customerGeneralArray.title),
    address: data.customerGeneralArray.address,
    addresstwo: data.customerGeneralArray.addresstwo,
    addressthree: data.customerGeneralArray.addressthree,
    cropBookModel: data.cropBookArray,
    biometricModel: data.customerBiometricArray,
    paymentMethodModel: data.paymentMethodArray,
    supplimentaryModel: data.supplimentaryArray,
    standingFunds: data.standingFundsArray,
    standingOrders: data.standingOrdersArray,
    supplimentaryBiometric: data.supplimentaryBiometricArray,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
    isActive: data.customerGeneralArray.isActive,
    joiningDate: data.customerGeneralArray.joiningDate,
    areaType: parseInt(data.customerGeneralArray.areaType),
    area: parseFloat(data.customerGeneralArray.area),
    savings: data.SavingsArray
  }
  const response = await CommonPost('/api/Customer/UpdateCustomer', null, updateModel);
  return response;
}

async function DeleteCropBookItem(customerAccountID, customerPaymentMethodID) {
  const response = await CommonGet('/api/Customer/DeleteCropBookItem', "customerAccountID=" + customerAccountID + "&customerPaymentMethodID=" + parseInt(customerPaymentMethodID) + "&modifiedBy=" + tokenDecoder.getUserIDFromToken());
  return response.data;
}

async function DeleteBiometricItem(customerBiometricID) {
  const response = await CommonGet('/api/Customer/DeleteBiometricItem', "customerBiometricID=" + customerBiometricID);
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

async function getSavingsByCustomerID(customerID) {
  const response = await CommonGet('/api/Customer/GetSavingsByCustomerID', "customerID=" + parseInt(customerID));
  return response.data;
}

async function DeleteStandingOrderItem(standingOrderID) {
  const response = await CommonGet('/api/Customer/DeleteStandingOrderItem', "standingOrderID=" + parseInt(standingOrderID));
  return response.data;
}

async function DeleteStandingFundItem(fundID) {
  const response = await CommonGet('/api/Customer/DeleteStandingFundItem', "fundID=" + parseInt(fundID));
  return response.data;
}
async function CheckTransactionDetailsByRegNumber(registrationNumber, customerAccountID) {
  const response = await CommonGet('/api/Customer/CheckTransactionDetailsByRegNumber', "registrationNumber=" + registrationNumber + "&customerAccountID=" + parseInt(customerAccountID));
  return response.data;
}



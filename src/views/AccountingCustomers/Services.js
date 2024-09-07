import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getGroupsForDropdown,
  getFactoryByGroupID,
  getBanksForDropdown,
  getBanksForTable,
  getBranchesByBankID,
  getBranchesByBankIDForTable,
  getAllBranches,
  getfactoryItemsByGroupIDANDFactoryID,
  getAllFactoryItems,
  saveAccountingCustomer,
  getCustomersByGroupIDAndFactoryID,
  getCustomerPaymentMethodsByFactoryItemCustomerID,
  updateFactoryItemCustomer,
  DeActivateCustomerPaymentMethod,
  getItemCustomersByCustomerID,
  getfactoryCustomerItemsByGroupIDANDFactoryID
};

async function getItemCustomersByCustomerID(customerID) {
  const response = await CommonGet('/api/AccountingCustomer/GetItemCustomersByCustomerID', 'customerID=' + customerID);
  return response.data;
}

async function DeActivateCustomerPaymentMethod(factoryItemCustomerPaymentID) {
  const response = await CommonGet('/api/AccountingCustomer/DeActivateCustomerPaymentMethod', "factoryItemCustomerPaymentID=" + factoryItemCustomerPaymentID);
  return response.data;
}

async function updateFactoryItemCustomer(data) {
  let updateModel = {
    customerID: data.customerID,
    groupID: data.groupID,
    factoryID: data.factoryID,
    isActive: data.isActive,
    customerName: data.customerName,
    taxNumber: data.taxNumber,
    address3: data.address3,
    address1: data.address1,
    address2: data.address2,
    zipCode: data.zipCode,
    country: parseInt(data.country),
    officePhoneNumber: data.officePhoneNumber,
    mobile: data.mobile,
    email: data.email,
    isCreditCustomer: data.isCreditCustomer,
    customerRegistrationModel: data.customerItemArray,
    customerPaymentModel: data.customerPaymentArray,
    nicBRNumber: data.nicBRNumber,
    createdBy: tokenDecoder.getUserIDFromToken(),
  }
  const response = await CommonPost('/api/AccountingCustomer/UpdateFactoryItemCustomer', null, updateModel);
  return response;
}

async function getCustomerPaymentMethodsByFactoryItemCustomerID(customerID) {
  const response = await CommonGet('/api/AccountingCustomer/GetCustomerPaymentMethodsByFactoryItemCustomerID', 'customerID=' + customerID);
  return response.data;
}

async function getCustomersByGroupIDAndFactoryID(groupID, factoryID) {

  const response = await CommonGet('/api/AccountingCustomer/GetCustomersByGroupIDAndFactoryID', 'groupID=' + groupID + '&factoryID=' + factoryID);
  return response.data;
}

async function saveAccountingCustomer(data) {
  let saveModel = {
    groupID: parseInt(data.groupID),
    factoryID: parseInt(data.factoryID),
    isActive: data.isActive,
    customerName: data.customerName,
    taxNumber: data.taxNumber,
    address3: data.address3,
    address1: data.address1,
    address2: data.address2,
    zipCode: data.zipCode,
    country: parseInt(data.country),
    officePhoneNumber: data.officePhoneNumber,
    mobile: data.mobile,
    email: data.email,
    isCreditCustomer: data.isCreditCustomer,
    nicBRNumber: data.nicBRNumber,
    customerRegistrationModel: data.customerItemArray,
    customerPaymentModel: data.customerPaymentArray,
    createdBy: tokenDecoder.getUserIDFromToken(),
  }
  const response = await CommonPost('/api/AccountingCustomer/saveAccountingCustomer', null, saveModel);
  return response;
}

async function getAllFactoryItems() {
  var factoryArray = [];
  const response = await CommonGet('/api/FactoryItemGrn/GetAllFactoryItems');
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryItemID"]] = item[1]["itemName"]
  }
  return factoryArray;
}

async function getfactoryItemsByGroupIDANDFactoryID(groupID, factoryID) {
  var factoryArray = [];

  const response = await CommonGet('/api/FactoryItemGrn/GetfactoryItemsByGroupIDANDFactoryID', 'groupID=' + groupID + '&factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryItemID"]] = item[1]["itemName"]
  }
  return factoryArray;
}

async function getAllBranches() {
  const response = await CommonGet('/api/Branch/GetAllBranches');
  return response.data;
}

async function getBranchesByBankIDForTable(bankID) {
  const response = await CommonGet('/api/Branch/GetBranchesByBankID', 'bankID=' + bankID);
  return response.data;

}

async function getBranchesByBankID(bankID) {
  var branchArray = [];
  const response = await CommonGet('/api/Branch/GetBranchesByBankID', 'bankID=' + bankID);
  for (let item of Object.entries(response.data)) {
    branchArray[item[1]["branchID"]] = item[1]["branchName"];
  }
  return branchArray;
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

async function getfactoryCustomerItemsByGroupIDANDFactoryID(groupID, factoryID) {

  const response = await CommonGet('/api/FactoryItemGrn/GetfactoryItemsByGroupIDANDFactoryID', 'groupID=' + groupID + '&factoryID=' + factoryID)

  return response.data;
}



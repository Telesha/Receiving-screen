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
  saveFactoryItemSupplier,
  getSuppliersByGroupIDAndFactoryID,
  getItemSupplierByFactoryItemSupplierID,
  getSupplierPaymentMethodsByFactoryItemSupplierID,
  updateFactoryItemSupplier,
  DeActivateSupplierFactoryItem,
  DeActivateSupplierPaymentMethod,
  getItemSuppliersBySupplierID,
  getfactorySupplierItemsByGroupIDANDFactoryID
};

async function getItemSuppliersBySupplierID(supplierID) {
  const response = await CommonGet('/api/FactoryItemSupplier/GetItemSuppliersBySupplierID', 'supplierID=' + supplierID);
  return response.data;
}

async function DeActivateSupplierPaymentMethod(factoryItemSupplierPaymentID) {
  const response = await CommonGet('/api/FactoryItemSupplier/DeActivateSupplierPaymentMethod', "factoryItemSupplierPaymentID=" + factoryItemSupplierPaymentID);
  return response.data;
}

async function DeActivateSupplierFactoryItem(factoryItemSupplierID) {
  const response = await CommonGet('/api/FactoryItemSupplier/DeActivateSupplierFactoryItem', "factoryItemSupplierID=" + factoryItemSupplierID);
  return response;
}

async function updateFactoryItemSupplier(data) {
  let updateModel = {
    supplierID: data.supplierID,
    groupID: data.groupID,
    factoryID: data.factoryID,
    isActive: data.isActive,
    supplierName: data.supplierName,
    taxNumber: data.taxNumber,
    address3: data.address3,
    address1: data.address1,
    address2: data.address2,
    zipCode: data.zipCode,
    country: parseInt(data.country),
    officePhoneNumber: data.officePhoneNumber,
    mobile: data.mobile,
    email: data.email,
    isCreditSupplier: data.isCreditSupplier,
    supplierRegistrationModel: data.supplierItemArray,
    paymentModel: data.paymentArray,
    nicBRNumber: data.nicBRNumber,
    createdBy: tokenDecoder.getUserIDFromToken(),
  }
  const response = await CommonPost('/api/FactoryItemSupplier/UpdateFactoryItemSupplier', null, updateModel);
  return response;
}

async function getSupplierPaymentMethodsByFactoryItemSupplierID(supplierID) {
  const response = await CommonGet('/api/FactoryItemSupplier/GetSupplierPaymentMethodsByFactoryItemSupplierID', 'supplierID=' + supplierID);
  return response.data;
}

async function getItemSupplierByFactoryItemSupplierID(supplierID) {
  const response = await CommonGet('/api/FactoryItemSupplier/GetItemSupplierByFactoryItemSupplierID', 'supplierID=' + supplierID);
  return response.data;
}

async function getSuppliersByGroupIDAndFactoryID(groupID, factoryID) {

  const response = await CommonGet('/api/FactoryItemSupplier/GetSuppliersByGroupIDAndFactoryID', 'groupID=' + groupID + '&factoryID=' + factoryID);
  return response.data;
}

async function saveFactoryItemSupplier(data) {
  let saveModel = {
    groupID: parseInt(data.groupID),
    factoryID: parseInt(data.factoryID),
    isActive: data.isActive,
    supplierName: data.supplierName,
    taxNumber: data.taxNumber,
    address3: data.address3,
    address1: data.address1,
    address2: data.address2,
    zipCode: data.zipCode,
    country: parseInt(data.country),
    officePhoneNumber: data.officePhoneNumber,
    mobile: data.mobile,
    email: data.email,
    isCreditSupplier: data.isCreditSupplier,
    nicBRNumber: data.nicBRNumber,
    supplierRegistrationModel: data.supplierItemArray,
    paymentModel: data.paymentArray,
    createdBy: tokenDecoder.getUserIDFromToken(),
  }
  const response = await CommonPost('/api/FactoryItemSupplier/SaveFactoryItemSupplier', null, saveModel);
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

async function getfactorySupplierItemsByGroupIDANDFactoryID(groupID, factoryID) {
 
  const response = await CommonGet('/api/FactoryItemGrn/GetfactoryItemsByGroupIDANDFactoryID', 'groupID=' + groupID + '&factoryID=' + factoryID)
  
  return response.data;
}



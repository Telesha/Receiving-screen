import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getGroupsForDropdown,
  getBanksForDropdown,
  getBanksForTable,
  getBranchesByBankID,
  getBranchesByBankIDForTable,
  getProductDetails,
  getAllFactories,
  getFactoryDetailsByFactoryID,
  getFactoryAccountsByFactoryID,
  getAllBranches,
  getCollectionTypeDetails,
  getFactoryProductDetailsByFactoryID,
  saveFactory,
  getGroupIDbyFactoryID,
  UpdateFactory,
  DeleteFactoryAccountItem,
  DeleteContactItem,
  getFactoriesByGroupID,
  getAllCollectionTypes
};

async function DeleteContactItem(contactID) {
  const response = await CommonGet('/api/Factory/DeleteContactItem', "contactID=" + contactID);
  return response.data;
}

async function DeleteFactoryAccountItem(factoryAccountID) {
  const response = await CommonGet('/api/Factory/DeleteFactoryAccountItem', "factoryAccountID=" + factoryAccountID);
  return response.data;
}

async function getGroupIDbyFactoryID(factoryID) {
  const response = await CommonGet('/api/Factory/GetGroupIDbyFactoryID', 'factoryID=' + factoryID);
  return response.data;
}

async function getAllFactories() {
  const response = await CommonGet('/api/Factory/GetAllFactories', null);
  return response.data;
}

async function getFactoryDetailsByFactoryID(factoryID) {
  const response = await CommonGet('/api/Factory/GetFactoryDetailsByFactoryID', 'factoryID=' + factoryID);
  return response.data;
}

async function getFactoryAccountsByFactoryID(factoryID) {
  const response = await CommonGet('/api/Factory/GetFactoryAccountsByFactoryID', 'factoryID=' + factoryID);
  return response.data;
}

async function getFactoryProductDetailsByFactoryID(factoryID) {
  const response = await CommonGet('/api/Factory/GetFactoryProductsByFactoryID', 'factoryID=' + factoryID);
  return response.data;

}

async function getBanksForTable() {
  const response = await CommonGet('/api/Bank/GetAllActiveBanks', null);
  return response.data;
}

async function getBanksForDropdown() {
  var bankArray = [];
  const response = await CommonGet('/api/Bank/GetAllActiveBanks', null);
  for (let item of Object.entries(response.data)) {
    bankArray[item[1]["bankID"]] = item[1]["bankName"];
  }
  return bankArray;
}

async function getBranchesByBankID(bankID) {
  var branchArray = [];
  const response = await CommonGet('/api/Branch/GetBranchesByBankID', 'bankID=' + bankID);
  for (let item of Object.entries(response.data)) {
    branchArray[item[1]["branchID"]] = item[1]["branchName"];
  }
  return branchArray;
}

async function getBranchesByBankIDForTable(bankID) {
  const response = await CommonGet('/api/Branch/GetBranchesByBankID', 'bankID=' + bankID);
  return response.data;

}

async function getProductDetails() {
  const response = await CommonGet('/api/Product/GetAllProducts', null);
  return response.data;
}

async function getAllBranches() {
  const response = await CommonGet('/api/Branch/GetAllBranches', null);
  return response.data;
}
async function getCollectionTypeDetails(productID) {
  const response = await CommonGet('/api/CollectionType/GetCollectionTypeDetailsByProductID', 'productID=' + productID);
  return response.data;
}
async function saveFactory(data) {

  let saveModel = {
    factoryID: 0,
    groupID: parseInt(data.groupID),
    factoryName: data.factoryName,
    factoryCode: data.factoryCode,
    taxNumber: data.taxNumber,
    brNumber: data.brNumber,
    managerName: data.managerName,
    operationEntityTypeID: parseInt(data.operationEntityTypeID),
    isActive: data.isActive,
    factoryContactDetails: data.contact,
    factoryAccountDetails: data.account,
    factoryProductDetails: data.product,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    modifiedBy: 0,
    modifiedDate: new Date().toISOString()
  }
  const response = await CommonPost('/api/FactorySave/SaveFactory', null, saveModel);
  return response;
}

async function UpdateFactory(data) {
  let updateModel = {
    factoryID: parseInt(data.factoryID),
    groupID: parseInt(data.groupID),
    factoryName: data.factoryName,
    factoryCode: data.factoryCode,
    taxNumber: data.taxNumber,
    brNumber: data.brNumber,
    managerName: data.managerName,
    operationEntityTypeID: parseInt(data.operationEntityTypeID),
    isActive: data.isActive,
    factoryContactDetails: data.contact,
    factoryAccountDetails: data.account,
    factoryProductDetails: data.product,
    createdBy: 0,
    createdDate: new Date().toISOString(),
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString()
  }
  const response = await CommonPost('/api/Factory/UpdateFactory', null, updateModel);
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

async function getFactoriesByGroupID(groupID) {
  const response = await CommonGet('/api/Factory/GetFactoriesByGroupID', 'groupID=' + parseInt(groupID))
  return response.data;
}

async function getAllCollectionTypes() {
  const response = await CommonGet('/api/CollectionType/GetAllCollectionTypes', null);
  return response.data;
}

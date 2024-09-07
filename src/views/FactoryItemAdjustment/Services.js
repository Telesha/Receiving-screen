import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  saveFactoryAdjustment,
  getFactoryAedjustmentDetails,
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getAdjustmentsByFactoryID,
  getavailableQuantity,
  getFactoryItemsByFactoryID,
  getAdjustmentsByFactoryItemID,
  getAvailableGrnBySupplier,
  GetSupplierByFactoryItem,
  getfactoryItemsByGroupIDFactoryIDItemCategoryID,
  getAllActiveItemCategory
};

async function getAvailableGrnBySupplier(supplierID, factoryItem) {
  var grnArray = [];

  const response = await CommonGet('/api/FactoryAdjustment/GetAvailableGrnBySupplier', 'supplierID=' + parseInt(supplierID) + '&factoryItem=' + parseInt(factoryItem))
  for (let item of Object.entries(response.data)) {
    grnArray[item[1]["factoryItemGRNID"]] = item[1]["grnNumber"]
  }
  return grnArray;
}

async function getAdjustmentsByFactoryItemID(factoryItemID) {
  const response = await CommonGet('/api/FactoryAdjustment/GetAdjustmentsByFactoryItemID', "factoryItemID=" + parseInt(factoryItemID));
  return response.data;
}

async function getFactoryItemsByFactoryID(factoryID) {
  var factoryItemArray = [];
  const response = await CommonGet('/api/FactoryAdjustment/GetFactoryItemsByFactoryID', "factoryID=" + parseInt(factoryID));
  if (response.data != null) {
    for (let item of Object.entries(response.data)) {
      factoryItemArray[item[1]["factoryItemID"]] = item[1]["itemName"]
    }
    return factoryItemArray;
  } else {
    return;
  }
}

async function getavailableQuantity(grnID) {
  const response = await CommonGet('/api/FactoryAdjustment/GetavailableQuantity', "factoryItemGRNID=" + parseInt(grnID));
  return response.data;
}

async function getAdjustmentsByFactoryID(factoryID) {
  const response = await CommonGet('/api/FactoryAdjustment/GetAdjustmentsByFactoryID', "factoryID=" + parseInt(factoryID));
  return response.data;
}

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
async function GetSupplierByFactoryItem(factoryItem) {
  var SupplierArray = [];
  const response = await CommonGet('/api/FactoryAdjustment/GetSupplierByFactoryItem', 'factoryItem=' + factoryItem)
  for (let item of Object.entries(response.data)) {
    SupplierArray[item[1]["id"]] = item[1]["name"]
  }
  return SupplierArray;
}

async function saveFactoryAdjustment(adjustment) {
  let saveModel = {
    factoryItemAdjustmentID: 0,
    groupID: parseInt(adjustment.groupID),
    factoryID: parseInt(adjustment.factoryID),
    factoryItem: parseInt(adjustment.factoryItem),
    quantity: parseFloat(adjustment.quantity),
    reason: parseInt(adjustment.reason),
    remark: adjustment.remark,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    grnID: parseInt(adjustment.grnID),
    supplierID: parseInt(adjustment.supplierID)

  }
  const response = await CommonPost('/api/FactoryAdjustment/SaveFactoryAdjustment', null, saveModel);
  return response;
}

async function getFactoryAedjustmentDetails(factoryItemAdjustmentID) {
  const response = await CommonGet('/api/FactoryAdjustment/GetFactoryAedjustmentDetails', "factoryItemAdjustmentID=" + parseInt(factoryItemAdjustmentID));
  return response.data;
}

async function getfactoryItemsByGroupIDFactoryIDItemCategoryID(groupID, factoryID, itemCategoryID) {
  var itemsArray = [];

  const response = await CommonGet('/api/FactoryItem/GetFactoryItemDetailsByGroupIDFactoryIDItemCategoryID', 'groupID=' + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + '&itemCategoryID=' + parseInt(itemCategoryID))
  for (let item of Object.entries(response.data)) {
    itemsArray[item[1]["factoryItemID"]] = item[1]["itemName"]
  }
  return itemsArray;
}

async function getAllActiveItemCategory() {
  const response = await CommonGet('/api/ItemCategory/GetAllActiveItemCategory', null);

  let factoryArray = []
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["itemCategoryID"]] = item[1]["categoryName"]
  }

  return factoryArray;
}
import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  GetAllFactoryItemGRN,
  saveFactoryGrn,
  getGRNDetailsByID,
  updateFactoryItem,
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getFactoryGRNByFactoryID,
  getfactoryItemsForDropDown,
  getFactoryByGroupID,
  getFactoryGRNByFactoryItemID,
  getItemsOfSupplier,
  GetSuppliersByGroupIDAndFactoryID,
  getfactoryItemsByGroupIDANDFactoryID,
  getAllActiveItemCategory,
  getfactoryItemsByGroupIDFactoryIDItemCategoryID,
  getfactoryItemsBySupplierIDItemCategoryID,
  getItemsOfSupplierDetails,
  getPurchaseOrderListing,
  getPurchaseOrderListByPurchaseOrderID,
  getSupplierByPurchaseOrderID,
  getItemCategoryBySupplierID,
  GetSuppliersByItemCategoryID
};

async function getFactoryGRNByFactoryItemID(factoryID, factoryItemID, itemCategoryID) {
  const response = await CommonGet('/api/FactoryItemGrn/GetFactoryGRNByFactoryItemIDandFactoryID', "factoryID=" + parseInt(factoryID) + '&factoryItemID=' + parseInt(factoryItemID) + '&itemCategoryID=' + parseInt(itemCategoryID));
  return response.data;
}

async function getfactoryItemsForDropDown() {
  var factoryItemArray = [];
  const response = await CommonGet('/api/FactoryItemGrn/GetAllFactoryItems', null)
  for (let item of Object.entries(response.data)) {

    factoryItemArray[item[1]["factoryItemID"]] = item[1]["itemName"]

  }
  return factoryItemArray;
}

async function getFactoryGRNByFactoryID(factoryID) {
  const response = await CommonGet('/api/FactoryItemGrn/GetFactoryGRNByFactoryID', "factoryID=" + parseInt(factoryID));
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

async function GetAllFactoryItemGRN() {
  const response = await CommonGet('/api/FactoryItemGrn/GetAllFactoryItemGRN', null);
  return response.data;
}


async function saveFactoryGrn(factoryGrn, grnList, dueDate, invoiceDate, receiveDate, factoryGRN, tempSuplierID) {
  let saveModel = {
    factoryItemGRNID: 0,
    groupID: parseInt(factoryGrn.groupID),
    factoryID: parseInt(factoryGrn.factoryID),
    factoryItem: parseFloat(factoryGrn.factoryItemSupplierID),
    invoiceNumber: factoryGrn.invoiceNumber,
    paymentTypeID: null,
    grnTypeID: parseInt(factoryGRN.grnType),
    purchaseOrderID: parseInt(factoryGRN.poNumber),
    supplierID: parseInt(tempSuplierID),
    isActive: factoryGrn.isActive,
    dueDate: dueDate,
    invoiceDate: invoiceDate,
    receiveDate: receiveDate,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    grnList: grnList
  }

  const response = await CommonPost('/api/FactoryItemGrn/SaveFactoryItemGRNV2', null, saveModel);
  return response;
}

async function updateFactoryItem(factoryItemGRNID, factoryGRN, grnlist, dueDate, invoiceDate, receiveDate) {
  let updateModel = {
    factoryItemGRNID: parseInt(factoryItemGRNID),
    groupID: parseInt(factoryGRN.groupID),
    factoryID: parseInt(factoryGRN.factoryID),
    invoiceNumber: factoryGRN.invoiceNumber,
    paymentTypeID: parseInt(factoryGRN.paymentTypeID),
    supplierID: parseInt(factoryGRN.supplierID),
    isActive: factoryGRN.isActive,
    dueDate: dueDate,
    invoiceDate: invoiceDate,
    receiveDate: receiveDate,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
    grnList: [grnlist]
  }
  const response = await CommonPost('/api/FactoryItemGrn/UpdateFactoryItemGRNV2', null, updateModel);
  return response;

}

async function getGRNDetailsByID(factoryItemGRNID) {
  const response = await CommonGet('/api/FactoryItemGrn/GetGRNDetailsByID', "factoryItemGRNID=" + parseInt(factoryItemGRNID));
  return response.data;
}

async function getFactoryByGroupID(groupID) {
  var factoryArray = [];

  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}

async function getItemsOfSupplier(supplierID) {
  var itemsArray = [];

  const response = await CommonGet('/api/FactoryItemGrn/GetItemsOfSupplier', 'supplierID=' + supplierID)
  for (let item of Object.entries(response.data)) {
    itemsArray[item[1]["factoryItemSupplierID"]] = item[1]["itemName"]
  }
  return itemsArray;
}

async function GetSuppliersByGroupIDAndFactoryID(groupID, factoryID) {
  var supplierArray = [];

  const response = await CommonGet('/api/FactoryItemGrn/GetSuppliersByGroupIDAndFactoryID',
    'groupID=' + groupID + '&factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      supplierArray[item[1]["supplierID"]] = item[1]["supplierName"] + [" - "] + item[1]["nicBRNumber"]
    }
  }
  return supplierArray;
}

async function GetSuppliersByItemCategoryID(groupID, factoryID, itemCategoryID) {
  var supplierArray = [];

  const response = await CommonGet('/api/FactoryItemGrn/GetSuppliersByItemCategoryID',
    'groupID=' + groupID + '&factoryID=' + factoryID + '&itemCategoryID=' + itemCategoryID)
  for (let item of Object.entries(response.data)) {
    supplierArray[item[1]["supplierID"]] = item[1]["supplierName"]
  }
  return supplierArray;
}

async function getfactoryItemsByGroupIDANDFactoryID(groupID, factoryID) {
  var itemsArray = [];

  const response = await CommonGet('/api/FactoryItemGrn/GetfactoryItemsByGroupIDANDFactoryID', 'groupID=' + groupID + "&factoryID=" + factoryID)
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

async function getItemCategoryBySupplierID(supplierID) {
  const response = await CommonGet('/api/ItemCategory/GetItemCategoryBySupplierID', 'supplierID=' + supplierID);

  let categoryArray = []
  for (let item of Object.entries(response.data)) {
    categoryArray[item[1]["itemCategoryID"]] = item[1]["categoryName"]
  }

  return categoryArray;
}

async function getfactoryItemsByGroupIDFactoryIDItemCategoryID(groupID, factoryID, itemCategoryID) {
  var itemsArray = [];

  const response = await CommonGet('/api/FactoryItem/GetFactoryItemDetailsByGroupIDFactoryIDItemCategoryID', 'groupID=' + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + '&itemCategoryID=' + parseInt(itemCategoryID))
  for (let item of Object.entries(response.data)) {
    itemsArray[item[1]["factoryItemID"]] = item[1]["itemName"]
  }
  return itemsArray;
}

async function getfactoryItemsBySupplierIDItemCategoryID(supplierID, itemCategoryID, factoryID) {
  var itemsArray = [];

  const response = await CommonGet('/api/FactoryItem/GetFactoryItemDetailsBySupplierIDItemCategoryID', 'supplierID=' + parseInt(supplierID) + '&itemCategoryID=' + parseInt(itemCategoryID) + '&factoryID=' + parseInt(factoryID))
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      itemsArray[item[1]["factoryItemID"]] = item[1]["itemName"]
    }
  }
  return itemsArray;
}

async function getItemsOfSupplierDetails(supplierID) {
  const response = await CommonGet('/api/FactoryItemGrn/GetItemsOfSupplier', 'supplierID=' + supplierID)
  return response.data;
}

async function getPurchaseOrderListing(factoryID) {
  const response = await CommonGet('/api/FactoryItemGrn/GetPurchaseOrderDetailsByFactoryID', 'factoryID=' + parseInt(factoryID))
  let data = response.data;
  let result = data.map((u) => ({ purchaseOrderNumber: u.purchaseOrderNumber, purchaseOrderID: u.purchaseOrderID }));
  return result;
}

async function getPurchaseOrderListByPurchaseOrderID(purchaseOrderID) {
  const response = await CommonGet('/api/FactoryItemGrn/GetPurchaseOrderListByPurchaseOrderID', 'purchaseOrderID=' + purchaseOrderID)
  return response.data;
}

async function getSupplierByPurchaseOrderID(purchaseOrderID) {
  const response = await CommonGet('/api/PurchaseOrder/GetSupplierByPurchaseOrderID', 'purchaseOrderID=' + purchaseOrderID)
  return response.data;
}

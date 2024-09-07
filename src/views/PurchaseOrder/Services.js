import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getGroupsForDropdown,
  getFactoryByGroupID,
  GetSuppliersByGroupIDAndFactoryID,
  getFactoryInfoByFactoryID,
  getSupplierInfoBySupplierID,
  getAllActiveItemCategory,
  getfactoryItemsBySupplierIDItemCategoryID,
  savePurchaseOrder,
  getPurchaseOrderByGroupIDFactoryID,
  getPurchaseOrderDetails,
  getAllPurchaseOrder
};
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
async function getFactoryInfoByFactoryID(factoryID) {
  const response = await CommonGet('/api/PurchaseOrder/GetFactoryInfoFactoryID', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function getSupplierInfoBySupplierID(supplierID) {
  const response = await CommonGet('/api/PurchaseOrder/GetSupplierInfoBySupplierID', "supplierID=" + parseInt(supplierID));
  return response.data;
}

async function getAllActiveItemCategory(suplierID) {
  const response = await CommonGet('/api/ItemCategory/GetItemCategoryBySupplierID', "supplierID=" + parseInt(suplierID));

  let categoryArray = [];
  for (let item of Object.entries(response.data)) {
    categoryArray[item[1]["itemCategoryID"]] = item[1]["categoryName"]
  }
  return categoryArray;
}
async function getfactoryItemsBySupplierIDItemCategoryID(supplierID, itemCategoryID, factoryID) {
  const response = await CommonGet('/api/FactoryItem/GetFactoryItemDetailsBySupplierIDItemCategoryID', 'supplierID=' + parseInt(supplierID) + '&itemCategoryID=' + parseInt(itemCategoryID) + '&factoryID=' + parseInt(factoryID))
  let itemsArray = [];
  for (let item of Object.entries(response.data)) {
    itemsArray[item[1]["factoryItemID"]] = item[1]["itemName"]
  }

  return itemsArray;
}
async function savePurchaseOrder(PurchaseDetails, factoryDetails, supplierDetails, orderList, totalNet, dueDate, poNumber) {
  let model = {
    purchaseOrderID: 0,
    groupID: parseInt(PurchaseDetails.groupID),
    factoryID: parseInt(PurchaseDetails.factoryID),
    purchaseOrderNumber: poNumber,
    factoryName: factoryDetails.factoryName,
    factoryAddress: factoryDetails.address1,
    FactoryContactNumber: factoryDetails.officePhone,
    supplierID: parseInt(PurchaseDetails.supplierID),
    supplierAddress: supplierDetails.address1,
    supplierContactNumber: supplierDetails.contactNumber,
    supplierEmailAddress: supplierDetails.email,
    factoryItem: parseFloat(PurchaseDetails.factoryItemSupplierID),
    isActive: true,
    dueDate: dueDate,
    purchaseItemsList: orderList,
    lineTotalPrice: parseFloat(totalNet),
    tax: parseFloat(PurchaseDetails.tax),
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/PurchaseOrder/SavePurchaseOrderItems', null, model);
  return response;
}

async function getPurchaseOrderByGroupIDFactoryID(factoryID, supplierID) {
  const response = await CommonGet('/api/PurchaseOrder/GetPurchaseOrderListing', "factoryID=" + parseInt(factoryID) + '&supplierID=' + parseInt(supplierID));
  return response.data;
}

async function getPurchaseOrderDetails(purchaseOrderID) {
  const response = await CommonGet('/api/PurchaseOrder/GetPurchaseOrderDetails', "purchaseOrderID=" + parseInt(purchaseOrderID));
  return response.data;
}

async function getAllPurchaseOrder(groupID, factoryID) {

  const response = await CommonGet('/api/PurchaseOrder/GetAllPurchaseOrder', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response;

}

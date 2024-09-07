import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  saveCollectionType,
  getCollectionTypeDetailsByID,
  updateCollectionType,
  getProductsForDropdown,
  getCollectionTypeDetailsByProductID
};

async function saveCollectionType(collectionType,userID) {

  let saveModel = {
    collectionTypeID: 0,
    collectionTypeName: collectionType.collectionTypeName,
    collectionTypeCode: collectionType.collectionTypeCode,
    productID: parseInt(collectionType.productID),
    isActive: collectionType.isActive,
    createdBy: userID,
    createdDate: new Date().toISOString()
  }
  const response = await CommonPost('/api/CollectionType/SaveCollectionType', null, saveModel);
  return response;
}

async function updateCollectionType(collectionType) {

  let updateModel = {
    collectionTypeID: parseInt(collectionType.collectionTypeID),
    collectionTypeName: collectionType.collectionTypeName,
    collectionTypeCode: collectionType.collectionTypeCode,
    isActive: collectionType.isActive,
    modifiedBy: collectionType.collectionTypeUserID,
    modifiedDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/CollectionType/UpdateCollectionType', null, updateModel);
  return response;
}

async function getCollectionTypeDetailsByID(collectionTypeID) {
  const response = await CommonGet('/api/CollectionType/getCollectionTypeDetailsByID', "collectionTypeID=" + parseInt(collectionTypeID));
  return response.data;
}

async function getProductsForDropdown() {
  let response = await CommonGet('/api/Product/GetAllProducts', null);
  let productArray = []
  for (let item of Object.entries(response.data)) {
          productArray[item[1]["productID"]] = item[1]["productName"]
  } 
  return productArray;
}

async function getCollectionTypeDetailsByProductID(productID) {
  const response = await CommonGet('/api/CollectionType/getCollectionTypeDetailsByProductID', "productID=" + parseInt(productID));
  return response.data;
}
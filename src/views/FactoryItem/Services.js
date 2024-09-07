import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  saveFactoryItem,
  getFactoryItemDetailsByID,
  updateFactoryItem,
  getAllGroups,
  getAllFactoriesByGroupID,
  getFactoryItemDetailsByGroupIDFactoryID,
  getAllActiveItemCategory,
  getfactoryItemsByGroupIDFactoryIDItemCategoryID,
  getAllActiveMeasuringUnits
};

async function saveFactoryItem(factoryItem, userID) {
  let saveModel = {
    factoryItemID: 0,
    itemName: factoryItem.itemName,
    itemCode: factoryItem.itemCode,
    description: factoryItem.description,
    groupID: parseInt(factoryItem.groupID),
    factoryID: parseInt(factoryItem.factoryID),
    measuringUnit: parseInt(factoryItem.measuringUnit),
    isActive: factoryItem.isActive,
    createdBy: parseInt(userID),
    createdDate: new Date().toISOString(),
    itemCategoryID: parseInt(factoryItem.itemCategoryID)
  }
  const response = await CommonPost('/api/FactoryItem/SaveFactoryItem', null, saveModel);
  return response;
}

async function updateFactoryItem(factoryItem) {
  factoryItem.createdBy = parseInt(tokenDecoder.getUserIDFromToken());
  factoryItem.createdDate = new Date().toISOString();
  factoryItem.factoryItemID = parseInt(factoryItem.factoryItemID);

  const response = await CommonPost('/api/FactoryItem/UpdateFactoryItem', null, factoryItem);
  return response;
}

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
}

async function getAllFactoriesByGroupID(groupID) {
  let response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', 'groupID=' + parseInt(groupID));
  let factoryArray = []
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}

async function getFactoryItemDetailsByGroupIDFactoryID(groupID, factoryID) {
  const response = await CommonGet('/api/FactoryItem/GetFactoryItemDetailsByGroupIDFactoryID', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}

async function getFactoryItemDetailsByID(factoryItemID) {
  const response = await CommonGet('/api/FactoryItem/GetFactoryItemDetailsByFactoryItemID', "factoryItemID=" + parseInt(factoryItemID));
  return response.data;
}

async function getAllActiveItemCategory() {
  const response = await CommonGet('/api/ItemCategory/GetAllActiveItemCategory', null);

  let factoryArray = []
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["itemCategoryID"]] = item[1]["categoryName"]
  }

  return factoryArray;
}

async function getAllActiveMeasuringUnits() {
  const response = await CommonGet('/api/MeasuringUnit/GetAllActiveMeasuringUnits', null);

  let measuringUnitArray = []
  for (let item of Object.entries(response.data)) {
    measuringUnitArray[item[1]["measuringUnitID"]] = item[1]["measuringUnitName"]
  }

  return measuringUnitArray;
}

async function getfactoryItemsByGroupIDFactoryIDItemCategoryID(groupID, factoryID, itemCategoryID) {
  const response = await CommonGet('/api/FactoryItem/GetFactoryItemDetailsByGroupIDFactoryIDItemCategoryID', 'groupID=' + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + '&itemCategoryID=' + parseInt(itemCategoryID))
  return response.data;
}

import { CommonGet, CommonPost } from '../../../helpers/HttpClient';
import tokenDecoder from '../../../utils/tokenDecoder';

export default {
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getFactoryByGroupID,
  getCollectionTypeByFactoryID,
  saveGreenLeafEntry,
  getGreenLeafEntryData,
  getAllEstates,
  getAllDivisions,
  getAllFields,
  GetGreenLeafEntryDetailsByID,
  UpdateGreenLeafEntry
};

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


async function getFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
};

async function getCollectionTypeByFactoryID(factoryID) {
  let response = await CommonGet('/api/CollectionType/GetCollectionTypeDetailsByFactoryID', "factoryID=" + parseInt(factoryID));
  let collectionTypeArray = [];
  for (let item of Object.entries(response.data)) {
    collectionTypeArray[item[1]["collectionTypeCode"]] = item[1]["collectionTypeName"];
  }
  return collectionTypeArray;
};

async function saveGreenLeafEntry(approveList) {
  let saveModel = {
        greenLeafEntryID: 0,
        groupID: parseInt(approveList.groupID),
        factoryID: parseInt(approveList.factoryID),
        estateID: parseInt(approveList.estateID),
        leafEntryDate: approveList.leafEntryDate,
        divisionID: parseInt(approveList.divisionID),
        fieldID: parseInt(approveList.fieldID),
        arrivalTypeID: parseInt(approveList.arrivalTypeID),
        collectionTypeID: parseInt(approveList.collectionTypeID),
        referenceNumber: (approveList.referenceNumber.toString()),
        fieldBagAmount: parseFloat(approveList.fieldBagAmount),
        fieldWeight: parseFloat(approveList.fieldWeight),
        factoryInTime: approveList.factoryInTime,
        helperID: parseInt(approveList.helperID),
        driverID: parseInt(approveList.driverID),
        vehicleNumber: approveList.vehicleNumber,
        leafTransporterID: parseInt(approveList.leafTransporterID),
        rainfallIn: parseFloat(approveList.rainfallIn),
        courseLeafAmount: parseFloat(approveList.courseLeafAmount),
        boiledLeaf: parseFloat(approveList.boiledLeaf),
        moisture: parseFloat(approveList.moisture),
        goodLeaf: parseFloat(approveList.goodLeaf),
        factoryGrossWeight: parseFloat(approveList.factoryGrossWeight),
        factoryBagAmount: parseFloat(approveList.factoryBagAmount),
        moistureAmount: parseFloat(approveList.moistureAmount),
        factoryTairWeight: parseFloat(approveList.factoryTairWeight),
        otherDeduction: parseFloat(approveList.otherDeduction),
        factoryNetWeight: parseFloat(approveList.factoryNetWeight),
        isActive: true,
        createdBy: tokenDecoder.getUserIDFromToken(),
        createdDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/GreenLeafEntry/SaveGreenLeafEntry', null, saveModel);
  return response;
}

async function UpdateGreenLeafEntry(greenLeafEntryModel) {
  greenLeafEntryModel.createdBy = parseInt(tokenDecoder.getUserIDFromToken());
  greenLeafEntryModel.createdDate = new Date().toISOString();
  greenLeafEntryModel.greenLeafEntryID = parseInt(greenLeafEntryModel.greenLeafEntryID);
  let response = await CommonPost('/api/GreenLeafEntry/UpdateGreenLeafEntry', null, greenLeafEntryModel);
  return response;
}

async function getGreenLeafEntryData(groupID, factoryID, date) {
  const response = await CommonGet('/api/GreenLeafEntry/GetGreenLeafEntryDetails', 'groupID=' + groupID + '&factoryID=' + factoryID  + '&date=' + date);
  return response;
}

async function GetGreenLeafEntryDetailsByID(greenLeafEntryID) {
  const response = await CommonGet('/api/GreenLeafEntry/GetGreenLeafEntryDetailsByID', 'greenLeafEntryID=' + greenLeafEntryID);
  return response.data;
}


async function getAllEstates() {
  let response = await CommonGet('/api/Estate/GetAllEstates');
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      estateArray[item[1]["estateID"]] = item[1]["estateName"];
    }
  }
  return estateArray;
};

async function getAllDivisions() {
  let response = await CommonGet('/api/Division/GetAllDivisions');
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
    }
  }
  return divisionArray;
};

async function getAllFields() {
  let response = await CommonGet('/api/Field/GetAllFields');
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
    }
  }
  return fieldArray;
};


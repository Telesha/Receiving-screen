import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  saveStockDetails,
  getAllGroups,
  getAllFactoriesByGroupID,
  GetGradeDetails,
  GetBatchNumbersByGroupIDFactoryID,
  GetStockDetailsByGroupIDFactoryIDManufactureID,
  GetStockDetailsByStockDetailsID,
  UpdateStockDetails
};


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

async function GetGradeDetails(manufactureNumber) {
  const response = await CommonGet('/api/Grade/GetGradeDetailsByBatchID', 'batchID=' + parseInt(manufactureNumber));
  let gradeArray = [];
  for (let item of Object.entries(response.data)) {
    gradeArray[item[1]["gradeID"]] = item[1]["gradeName"];
  }
  return gradeArray;
};

async function GetBatchNumbersByGroupIDFactoryID(groupID, factoryID) {
  const response = await CommonGet('/api/DispatchInvoice/GetBatchNumbersByGroupIDFactoryID', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID));
  let batchArray = [];
  for (let item of Object.entries(response.data)) {
    batchArray[item[1]["batchID"]] = item[1]["jobName"];
  }
  return batchArray;
}

async function saveStockDetails(userID, array) {
  let saveModel = {
    createdBy: parseInt(userID),
    stockList: array,
  }
  const response = await CommonPost('/api/Manufacturing/SaveStockDetails', null, saveModel);
  return response;
}

async function GetStockDetailsByGroupIDFactoryIDManufactureID(groupID, factoryID, manufactureNumberID) {
  const response = await CommonGet('/api/Manufacturing/GetStockDetailsByGroupIDFactoryIDManufactureID', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID) + '&manufactureNumberID=' + parseInt(manufactureNumberID));
  return response;
}

async function GetStockDetailsByStockDetailsID(stockDetailsID) {
  const response = await CommonGet('/api/Manufacturing/GetStockDetailsByStockDetailsID', 'stockDetailsID=' + parseInt(stockDetailsID));
  return response;
}

async function UpdateStockDetails(model) {
  const response = await CommonPost('/api/Manufacturing/UpdateStockDetails', null, model);
  return response;
}

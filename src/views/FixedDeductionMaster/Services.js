import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  saveDetails,
  getDeductionTypes,
  getFoodDeductionTypes,
  getUnionDeductionTypes,
  GetFixedDeductionDetail,
  GetDetailsByFixedDeductionMasterID,
  UpdateFixedDeduction
}

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
}

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function getDeductionTypes() {
  let response = await CommonGet('/api/FixedDeductionMaster/GetAllFixedDeductionTypes', null);
  let deductionTypesArray = [];
  for (let item of Object.entries(response.data)) {
    deductionTypesArray[item[1]["fixedDeductionTypeID"]] = item[1]["fixedDeductionTypeName"];
  }
  return deductionTypesArray;
};

async function getFoodDeductionTypes(fixedDeductionTypeID) {
  let response = await CommonGet('/api/FixedDeductionMaster/GetAllFoodDeductionTypes', "fixedDeductionTypeID=" + parseInt(fixedDeductionTypeID));
  let foodDeductionTypesArray = [];
  for (let item of Object.entries(response.data)) {
    foodDeductionTypesArray[item[1]["foodDeductionID"]] = item[1]["foodDeductionName"];
  }
  return foodDeductionTypesArray;
};

async function getUnionDeductionTypes(fixedDeductionTypeID) {
  let response = await CommonGet('/api/FixedDeductionMaster/GetAllUnionDeductionTypes', "fixedDeductionTypeID=" + parseInt(fixedDeductionTypeID));
  let unionDeductionTypesArray = [];
  for (let item of Object.entries(response.data)) {
    unionDeductionTypesArray[item[1]["unionID"]] = item[1]["unionName"];
  }
  return unionDeductionTypesArray;
};

async function saveDetails(data) {
  let saveModel = {
    groupID: parseInt(data.groupID),
    estateID: parseInt(data.estateID),
    fixedDeductionTypeID: parseInt(data.fixedDeductionTypeID),
    unionID: parseInt(data.unionID),
    foodDeductionID: parseInt(data.foodDeductionID),
    deductionRate: parseFloat(data.deductionRate),
    isActive: true,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/FixedDeductionMaster/SaveFixedDeductionMaster', null, saveModel);
  return response;
}

async function GetFixedDeductionDetail(model) {
  const response = await CommonPost('/api/FixedDeductionMaster/GetFixedDeductionDetail', null, model);
  return response;
};

async function GetDetailsByFixedDeductionMasterID(fixedDeductionMasterID) {
  let response = await CommonPost('/api/FixedDeductionMaster/GetDetailsByFixedDeductionMasterID', "fixedDeductionMasterID=" + parseInt(fixedDeductionMasterID))
  return response.data;
}

async function UpdateFixedDeduction(model) {
  const response = await CommonPost('/api/FixedDeductionMaster/UpdateFixedDeduction', null, model);
  return response;
}


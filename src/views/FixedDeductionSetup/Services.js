import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  saveDetails,
  getDeductionTypes,
  GetFixedDeductionDetail,
  GetDetailsByFixedDeductionMasterID,
  UpdateFixedDeduction,
  GetRegNoEmpNameByDivisionID,
  getFixedDeductionsByEstate,
  getFoodDeductionTypes,
  getUnionDeductionTypes
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

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getDeductionTypes() {
  let response = await CommonGet('/api/FixedDeductionSetup/GetDeductionTypesForDeductionSetup', null);
  return response.data;
};

async function saveDetails(dataList) {
  const response = await CommonPost('/api/FixedDeductionSetup/SaveFixedDeductionSetup', null, dataList);
  return response;
}

async function GetFixedDeductionDetail(model) {
  const response = await CommonPost('/api/FixedDeductionSetup/GetFixedDeductionSetupDetail', null, model);
  return response;
};

async function GetDetailsByFixedDeductionMasterID(fixedDeductionSetupID) {
  let response = await CommonPost('/api/FixedDeductionSetup/GetDetailsByFixedDeductionSetupID', "fixedDeductionSetupID=" + parseInt(fixedDeductionSetupID))
  return response.data;
}

async function UpdateFixedDeduction(model) {
  const response = await CommonPost('/api/FixedDeductionSetup/UpdateFixedSetupDeduction', null, model);
  return response;
}

async function GetRegNoEmpNameByDivisionID(model) {
  console.log("service", model)
  let response = await CommonPost('/api/FixedDeductionSetup/GetRegNoEmpNameByDivisionID', null, model);
  return response.data;
};

async function getFixedDeductionsByEstate(estateID) {
  let response = await CommonGet('/api/FixedDeductionSetup/GetFixedDeductionsByEstate', "estateID=" + parseInt(estateID));  
  const deductionTypeArray = []
  if (response.data != null || response.data != undefined ) {
    for (let item of Object.entries(response.data)) {
      deductionTypeArray[item[1]["fixedDeductionTypeID"]] = item[1]["fixedDeductionTypeName"]
    }
  }
  return deductionTypeArray;
};

async function getFoodDeductionTypes(estateID) {
  let response = await CommonGet('/api/FixedDeductionSetup/GetFoodDeductionTypes', "estateID=" + parseInt(estateID));
  let foodDeductionTypesArray = [];
  for (let item of Object.entries(response.data)) {
    foodDeductionTypesArray[item[1]["foodDeductionID"]] = item[1]["foodDeductionName"];
  }
  return foodDeductionTypesArray;
};

async function getUnionDeductionTypes(estateID) {
  let response = await CommonGet('/api/FixedDeductionSetup/GetUnionDeductionTypes', "estateID=" + parseInt(estateID));
  let unionDeductionTypesArray = [];
  for (let item of Object.entries(response.data)) {
    unionDeductionTypesArray[item[1]["unionID"]] = item[1]["unionName"];
  }
  return unionDeductionTypesArray;
};


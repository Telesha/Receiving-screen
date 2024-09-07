import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';
import moment from 'moment';

export default {
  getAllGroups,
  getAllFoodItems,
  getEstateDetailsByGroupID,
  GetDeductionRateByFoodDeductionName,
  getDivisionDetailsByEstateID,
  GetEmployeeByRegNo,
  saveDetails,
  getFieldDetailsByDivisionIDForDropdown,
  GetFoodRecoveryDetails,
  GetDetailsByConfigurationDetailID,
  getFieldDetailsByDivisionID,
  UpdateFoodRecovery,
  GetFoodRecoveryDetailsByFoodRecoveryID,
  ValidateFoodTypeByRegNo,
  DeleteFoodRecovery
}

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
}

async function getAllFoodItems() {
  let response = await CommonGet('/api/FoodRecovery/GetFoodItemNameByFoodDeductionCode', null);
  let foodArray = []
  for (let item of Object.entries(response.data)) {
    foodArray[item[1]["foodDeductionCode"]] = item[1]["foodDeductionName"]
  }
  return foodArray;
}

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function GetDeductionRateByFoodDeductionName(FoodDeductionCode, estateID) {
  let response = await CommonGet('/api/FoodRecovery/GetDeductionRateByFoodDeductionName', "FoodDeductionCode=" + parseInt(FoodDeductionCode) + "&estateID=" + parseInt(estateID));
  if (response.data != null) {
    const deductionRate = response.data.deductionRate;
    return deductionRate;
  }
};

async function GetEmployeeByRegNo(divisionID, registrationNumber) {
  try {
    const response = await CommonGet('/api/Employee/GetEmployeeNames', "registrationNumber=" + registrationNumber + "&divisionID=" + parseInt(divisionID));
    if (response.data != null) {
      const firstName = response.data.firstName;
      return firstName;
    }
  } catch (error) {
    throw error;
  }
}

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getFieldDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

//For multiple dropdown
async function getFieldDetailsByDivisionIDForDropdown(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  return response.data;
};

async function GetFoodRecoveryDetails(model) {
  const response = await CommonPost('/api/FoodRecovery/GetFoodRecoveryDetails', null, model);
  return response;

};

async function saveDetails(foodRecovery) {
  const response = await CommonPost('/api/FoodRecovery/SaveFoodRecovery', null, foodRecovery);
  return response;
};

async function DeleteFoodRecovery(model) {
  const response = await CommonPost('/api/FoodRecovery/DeleteFoodRecoveryDetails', null, model)
  return response;
}

async function GetDetailsByConfigurationDetailID(configurationDetailID) {
  let response = await CommonPost('/api/NormConfiguration/GetDetailsByConfigurationDetailID', "configurationDetailID=" + parseInt(configurationDetailID))
  return response.data;
}

async function UpdateFoodRecovery(food) {
  let updateModel = {
    foodRecoveryID: parseInt(food.foodRecoveryID),
    quantity: parseInt(food.quantity),
    amount: parseFloat(food.amount),
    isActive: food.isActive,
    modifiedDate: new Date().toISOString(),
    applicableDate: new Date(food.applicableDate).toISOString(),
    modifiedBy: parseInt(tokenDecoder.getUserIDFromToken())
  }
  const response = await CommonPost('/api/FoodRecovery/UpdateFoodRecovery', null, updateModel);
  return response;
}

async function GetFoodRecoveryDetailsByFoodRecoveryID(foodRecoveryID) {
  let response = await CommonPost('/api/FoodRecovery/GetFoodRecoveryDetailsByFoodRecoveryID', "foodRecoveryID=" + parseInt(foodRecoveryID))
  return response.data;
}

async function ValidateFoodTypeByRegNo(estateID, divisionID, foodDeductionCode, registrationNumber, date) {
  const response = await CommonPost('/api/FoodRecovery/ValidateFoodTypeByRegNo', "estateID=" + parseInt(estateID) + "&divisionID=" + parseInt(divisionID) + "&foodDeductionCode=" + foodDeductionCode + "&registrationNumber=" + registrationNumber + "&date=" + moment(date).format("YYYY-MM-DD"));
  return response;
};
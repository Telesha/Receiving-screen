import { CommonGet, CommonPost } from '../../helpers/HttpClient';
export default {
  GetAllGroups,
  GetEstateDetailsByGroupID,
  GetAllDeductionTypes,
  GetAllApplyConditionTypes,
  SaveStatoryDetails,
  GetStatutoryDetails,
  GetStatoryDetailsByID,
  UpdateStatoryDetails,
  GetEmployeeCategoriesData,
  GetEemployeeDesignationsData
};

async function GetAllGroups() {
  let response = await CommonGet('/api/Group/GetAllGroups');
  let groupArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"];
    }
  }
  return groupArray;
};

async function GetEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function GetAllDeductionTypes() {
  let response = await CommonGet('/api/Statutory/GetDeductionTypes');
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["deductionTypeID"]] = item[1]["deductionTypeName"]
  }
  return array;
}

async function GetAllApplyConditionTypes() {
  let response = await CommonGet('/api/Statutory/GetApplyConditions');
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["applyConditionID"]] = item[1]["applyConditionName"]
  }
  return array;
}

async function GetEmployeeCategoriesData() {
  var response = await CommonGet('/api/Employee/GetAllEmployeeCategory', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeCategoryID"]] = item[1]["employeeCategoryName"]
  }
  return array;
}

async function GetEemployeeDesignationsData(groupID, employeeCategoryID) {
  var array = [];
  var response = await CommonGet('/api/Statutory/GetDesignationByEmployeeCategoryID', 'groupID=' + groupID + '&employeeCategoryID=' + employeeCategoryID);
  for (let item of Object.entries(response.data)) {
    array[item[1]["designationID"]] = item[1]["designationName"];
  
    }
  return array;
}

async function SaveStatoryDetails(dataModel) { 
  const response = await CommonPost('/api/Statutory/SaveStatutoryDetails', null, dataModel);
  return response;
}

async function GetStatoryDetailsByID(statutoryID) {
  const response = await CommonGet('/api/Statutory/GetAllStatutoryDetailsByID', "statutoryID=" + parseInt(statutoryID));
  return response.data;
}

async function UpdateStatoryDetails(updateModel) {
  let response = await CommonPost('/api/Statutory/UpdateStatutoryDetails', null, updateModel);
  return response;
}

async function GetStatutoryDetails(groupID) {
  const response = await CommonGet('/api/Statutory/GetAllStatutoryDetails','groupID=' + groupID);
  return response.data;

}




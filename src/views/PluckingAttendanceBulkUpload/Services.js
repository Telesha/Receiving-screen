import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import moment from 'moment';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getDivisionDetailsByEstateID,
  getMusterChitDetailsByDateDivisionID,
  SavePluckingCheckrollAttendanceBulkUpload,
  getMusterchitDetailsByMusterchitID,
  GetEmployeeDetailsCheckrollAttendanceBulkUpload,
  GetNormValueByEstateIDAndCollectedDate,
  GetJobTypesForDropDown,
  GetEmployeeTypesData,
  getLentEstateNameByLentEstateID,
  getFieldDetailsByDivisionIDForDropdown,
  getGangDetailsByDivisionID,
  getOperatorsForDropdown,
  getAllFactory,
  getAllDivisionDetails,
  getMusterChitDetailsByDateDivisionIDUpdate,
  getAttendanceExecutionDate
};

async function getAllGroups() {
  let response = await CommonGet('/api/Group/GetAllGroups');
  let groupArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"];
    }
  }
  return groupArray;
};

async function getFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
};

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getMusterChitDetailsByDateDivisionID(mainDivisionID, date) {
  let response = await CommonGet('/api/MusterChit/GetMusterChitDetailsByDateAndDivisionID', "mainDivisionID=" + parseInt(mainDivisionID) + "&date=" + moment(date).format("YYYY-MM-DD"));
  let musterChitArray = [];
  for (let item of Object.entries(response.data)) {
    musterChitArray[item[1]["musterChitID"]] = item[1]["musterChitNumber"];
  }
  return musterChitArray;
};

async function getMusterChitDetailsByDateDivisionIDUpdate(mainDivisionID, collectedDate, isUpdate) {
  let response = await CommonGet('/api/MusterChit/GetMusterChitDetailsByDateDivisionID', "divisionID=" + parseInt(mainDivisionID) + "&collectedDate=" + moment(collectedDate).format("YYYY-MM-DD") + "&isUpdate=" + isUpdate);
  let musterChitArray = [];
  for (let item of Object.entries(response.data)) {
    musterChitArray[item[1]["musterChitID"]] = item[1]["musterChitNumber"];
  }
  return musterChitArray;
};

async function SavePluckingCheckrollAttendanceBulkUpload(data) {
  const response = await CommonPost('/api/CheckrollAttendanceBulkUpload/SavePluckingCheckrollAttendanceBulkUpload', null, data);
  return response;
}

async function getMusterchitDetailsByMusterchitID(musterChitID) {
  let response = await CommonGet('/api/MusterChit/GetMusterchitDetailsByMusterchitID', "musterChitID=" + parseInt(musterChitID));

  return response.data;
};

async function GetEmployeeDetailsCheckrollAttendanceBulkUpload(model) {
  const response = await CommonPost('/api/CheckrollAttendanceBulkUpload/GetEmployeeDetailsCheckrollAttendanceBulkUpload', null, model);
  return response.data;
}

async function GetNormValueByEstateIDAndCollectedDate(estateID, fieldID, collectedDate) {
  const response = await CommonGet('/api/CheckrollAttendanceBulkUpload/GetNormValueByEstateIDAndCollectedDate', "estateID=" + parseInt(estateID) + "&fieldID=" + parseInt(fieldID) + "&collectedDate=" + moment(collectedDate).format("YYYY-MM-DD"));
  return response;
}

async function GetJobTypesForDropDown() {
  let response = await CommonGet('/api/HarvestingJobType/GetAllHarvestingJobTypeDetails', null);
  let harvestingJobTypeArray = [];
  for (let item of Object.entries(response.data)) {
    harvestingJobTypeArray[item[1]["harvestingJobTypeID"]] = item[1]["harvestingJobTypeName"];
  }
  return harvestingJobTypeArray;
};

async function GetEmployeeTypesData() {
  var response = await CommonGet('/api/Employee/GetAllEmployeeType', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"]
  }
  return array;
}

async function getLentEstateNameByLentEstateID(lentEstateID) {
  let response = await CommonGet('/api/EmployeeSundryAttendance/GetLentEstateNameByLentEstateID', 'lentEstateID=' + lentEstateID);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["estateID"]] = item[1]["estateName"]
  }
  return array;
}

async function getFieldDetailsByDivisionIDForDropdown(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function getGangDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Gang/getGangDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let gangArray = [];
  for (let item of Object.entries(response.data)) {
    gangArray[item[1]["gangID"]] = item[1]["gangName"];
  }
  return gangArray;
};

async function getOperatorsForDropdown() {
  const response = await CommonGet('/api/Operator/GetAllOperators', null)
  let operatorArray = [];
  for (let item of Object.entries(response.data)) {
    operatorArray[item[1]["operatorID"]] = item[1]["operatorName"]
  }
  return operatorArray
}

async function getAllFactory() {
  let response = await CommonGet('/api/Factory/GetAllFactories');
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
    }
  }
  return factoryArray;
};

async function getAllDivisionDetails() {
  let response = await CommonGet('/api/Division/GetAllDivisions');
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
    }
  }
  return divisionArray;
};

async function getAttendanceExecutionDate(groupID, factoryID, divisionID) {
  let model = {
    groupID: parseInt(groupID),
    estateID: parseInt(factoryID),
    divisionID: parseInt(divisionID)
  }
  const response = await CommonPost('/api/DailyCheckroll/GetAttendanceExecutionDate', null, model);
  return response.data;
}
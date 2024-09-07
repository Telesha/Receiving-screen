import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import moment from 'moment';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getDivisionDetailsByEstateID,
  getRoutesForDropDown,
  getMusterChitDetailsByDateDivisionID,
  SaveSundryCheckrollAttendanceBulkUpload,
  getMusterchitDetailsByMusterchitID,
  GetEmployeeDetailsCheckrollAttendanceBulkUpload,
  getEstateDetailsByGroupID,
  getAllDivisions,
  getJobCategoryDetailsByEstateID,
  getJobCategoryByGroupIDEstateIDJobCategoryID,
  getFieldDetailsByDivisionID,
  getAllMusterChitDetailsByDivisionID,
  GetEmployeeTypesData,
  getOperatorsForDropdown,
  getAllDivisionDetails,
  getAllFactory,
  GetSundryJobTypesByJobCategoryID,
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
  let response = await CommonGet('/api/EmployeeSundryAttendance/GetAllMusterChitDetailsByDivisionID', "mainDivisionID=" + parseInt(mainDivisionID) + "&date=" + moment(date).format("YYYY-MM-DD"));
  let musterChitArray = [];
  for (let item of Object.entries(response.data)) {
    musterChitArray[item[1]["musterChitID"]] = item[1]["musterChitNumber"];
  }
  return musterChitArray;
};

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function SaveSundryCheckrollAttendanceBulkUpload(data) {
  const response = await CommonPost('/api/CheckrollAttendanceBulkUpload/SaveSundryCheckrollAttendanceBulkUpload', null, data);
  return response;
}

async function getMusterchitDetailsByMusterchitID(musterChitID) {
  let response = await CommonGet('/api/EmployeeSundryAttendance/GetSundryDetailsByMusterChitID', "musterChitID=" + parseInt(musterChitID));

  return response.data;
};

async function GetEmployeeDetailsCheckrollAttendanceBulkUpload(model) {
  const response = await CommonPost('/api/CheckrollAttendanceBulkUpload/GetEmployeeDetailsCheckrollAttendanceBulkUpload', null, model);
  return response.data;
}

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
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

async function getJobCategoryDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/JobCategory/GetJobCategoryDetailsByEstateID', "estateID=" + parseInt(estateID));
  let jobCategoryArray = [];
  for (let item of Object.entries(response.data)) {
    jobCategoryArray[item[1]["jobCategoryID"]] = item[1]["jobCategoryName"];
  }
  return jobCategoryArray;
};

async function getJobCategoryByGroupIDEstateIDJobCategoryID(groupID, estateID, jobCategoryID) {
  const response = await CommonGet('/api/Job/GetJobDetailsByGroupIDEstateIDJobCategoryID', 'groupID=' + parseInt(groupID) + "&estateID=" + parseInt(estateID) + '&jobCategoryID=' + parseInt(jobCategoryID))
  let jobArray = [];
  for (let item of Object.entries(response.data)) {
    jobArray[item[1]["jobID"]] = item[1]["jobName"];
  }
  return jobArray;
};

async function getFieldDetailsByDivisionID(divisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(divisionID));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};

async function getAllMusterChitDetailsByDivisionID(mainDivisionID, date) {
  const response = await CommonGet('/api/EmployeeSundryAttendance/GetAllMusterChitDetailsByDivisionID', "mainDivisionID=" + parseInt(mainDivisionID) + '&date=' + date)
  let musterChitArray = [];
  for (let item of Object.entries(response.data)) {
    musterChitArray[item[1]["musterChitID"]] = item[1]["musterChitNumber"]
  }
  return musterChitArray
}

async function GetEmployeeTypesData() {
  var response = await CommonGet('/api/Employee/GetAllEmployeeType', null);
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"]
  }
  return array;
}

async function getOperatorsForDropdown() {
  const response = await CommonGet('/api/Operator/GetAllOperators', null)
  let operatorArray = [];
  for (let item of Object.entries(response.data)) {
    operatorArray[item[1]["operatorID"]] = item[1]["operatorName"]
  }
  return operatorArray
}

async function GetSundryJobTypesByJobCategoryID(estateID) {
  let response = await CommonGet('/api/JobWiseAreaCovered/GetSundryJobTypesByJobCategory', "estateID=" + parseInt(estateID));
  let sectionTypeArray = []
  for (let item of Object.entries(response.data)) {
    sectionTypeArray[item[1]["jobTypeID"]] = item[1]["jobTypeName"]
  }
  return sectionTypeArray;
}

async function getAttendanceExecutionDate(groupID, factoryID, divisionID) {
  let model = {
    groupID: parseInt(groupID),
    estateID: parseInt(factoryID),
    divisionID: parseInt(divisionID)
  }
  const response = await CommonPost('/api/DailyCheckroll/GetAttendanceExecutionDate', null, model);
  return response.data;
}
import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getDivisionDetailsByEstateID,
  getRoutesForDropDown,
  SaveEmployeeBulkUpload,
  getAllRegistrationNumbers,
  getAllEPFESPSNumbers,
  getAllNIC,
  getDesignationsByEstateID
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

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function SaveEmployeeBulkUpload(data) {
  const response = await CommonPost('/api/Employee/SaveEmployeeBulkUpload', null, data);
  return response;
}

async function getAllRegistrationNumbers(groupID, estateID) {
  const response = await CommonGet('/api/Employee/GetAllRegistrationNumbers', 'groupID=' + groupID + '&estateID=' + estateID);
  return response.data;
}

async function getAllEPFESPSNumbers(groupID, estateID) {
  const response = await CommonGet('/api/Employee/GetAllEPFESPSNumbers', 'groupID=' + groupID + '&estateID=' + estateID);
  return response.data;
}

async function getAllNIC() {
  let response = await CommonGet('/api/Employee/GetAllNIC');
  return response.data;
};

async function getDesignationsByEstateID(factoryID) {
  let response = await CommonGet('/api/Designation/GetDesignationDataByFactoryID', 'factoryID=' + parseInt(factoryID));
  return response.data;
}
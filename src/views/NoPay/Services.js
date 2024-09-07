import { CommonGet, CommonPost } from '../../helpers/HttpClient';
export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  saveNoPayDetails,
  updateNoPayDetails,
  getNoPayDetails,
  getEmployeeDetails,
  getNoPayDetailsByNoPayID,
};

async function saveNoPayDetails(noPayDetails, userID) {

  const date = new Date(noPayDetails.selectedMonth);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  let saveModel = {
    groupID: parseInt(noPayDetails.groupID),
    factoryID: parseInt(noPayDetails.factoryID),
    registrationNumber: noPayDetails.registrationNumber,
    name: noPayDetails.employeeName,
    nicNumber: noPayDetails.nicNumber,
    noPayDays: parseInt(noPayDetails.noPayDays),
    description: noPayDetails.description,
    createdBy: userID,
    createdDate: new Date().toISOString(),
    isActive: true,
    noPayDate: year + "-" + month
  }
  const response = await CommonPost('/api/NoPay/SaveNoPayDetails', null, saveModel);
  return response;
}

async function updateNoPayDetails(noPayDetails, userID) {
  let updateModel = {
    noPayID: parseInt(noPayDetails.noPayID),
    groupID: parseInt(noPayDetails.groupID),
    factoryID: parseInt(noPayDetails.factoryID),
    registrationNumber: noPayDetails.registrationNumber,
    name: noPayDetails.employeeName,
    nicNumber: noPayDetails.nicNumber,
    noPayDays: parseInt(noPayDetails.noPayDays),
    description: noPayDetails.description,
    modifiedBy: userID,
    modifiedDate: new Date().toISOString(),
    isActive: true,
    noPayDate: noPayDetails.noPayMonth
  }
  const response = await CommonPost('/api/NoPay/UpdateNoPayDetails', null, updateModel);
  return response;
}

async function getAllGroups() {
  let response = await CommonGet('/api/Group/GetAllGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
}

async function getAllFactoriesByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID);
  let factoryArray = []
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}

async function getNoPayDetails(groupID, factoryID, registrationNo) {
  const regNo = registrationNo == '' ? '' : registrationNo
  const response = await CommonGet('/api/NoPay/GetNoPayDetails', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&registrationNo=" + regNo);
  return response;
}

async function getEmployeeDetails(groupID, factoryID, registrationNumber) {
  const response = await CommonGet('/api/NoPay/GetEmployeeDetailsByID', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&registrationNo=" + registrationNumber);
  return response;
}

async function getNoPayDetailsByNoPayID(noPayID) {
  const response = await CommonGet('/api/NoPay/GetNoPayDetailsByNoPayID', "noPayID=" + parseInt(noPayID));
  return response;
}
import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getRoutesForDropDown,
  saveGreenLeafReceiving,
  GetGreenLeafReceiving,
  GetGreenLeafReceivingDetailsByID,
  UpdateGreenLeafReceiving,
  getCurrentBalancePaymnetDetail,
  getEmployeesForDropdown,
  GetVehicleList
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

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function getEmployeesForDropdown(groupID, factoryID) {
  var employeeArray = [];
  const response = await CommonGet('/api/Manufacturing/GetEmployees', 'groupID=' + groupID + "&operationEntityID=" + factoryID)
  for (let item of Object.entries(response.data)) {
    employeeArray[item[1]["employeeID"]] = item[1]["fullName"]
  }
  return employeeArray;
}

async function GetVehicleList(groupID, factoryID) {
  const response = await CommonGet('/api/Vehicle/GetAllVehicles', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let vehicleArray = [];
  for (let item of Object.entries(response.data)) {
    vehicleArray[item[1]["vehicleID"]] = item[1]["vehicleNumber"];

  }
  return vehicleArray;
}

async function saveGreenLeafReceiving(greenLeaf) {
  let saveModel = {
    greenLeafReceivingID: 0,
    groupID: parseInt(greenLeaf.groupID),
    factoryID: parseInt(greenLeaf.factoryID),
    routeID: parseInt(greenLeaf.routeID),
    leafReceivedDate: greenLeaf.date,
    factoryInTime: greenLeaf.factoryInTime,
    officerID: parseInt(greenLeaf.officerID),
    helperID: parseInt(greenLeaf.helperID),
    temporyHelper: greenLeaf.temporyHelper,
    driverID: parseInt(greenLeaf.driverID),
    temporyDriver: greenLeaf.temporyDriver,
    vehicleNumber: parseInt(greenLeaf.vehicleNumber),
    temporyVehicleNumber: greenLeaf.temporyVehicleNo,
    leafTransporterID: greenLeaf.leafTransporterID,
    rainfallIn: parseFloat(greenLeaf.rainfallIn),
    courseLeafAmount: parseFloat(greenLeaf.courseLeafAmount),
    leafCondition: greenLeaf.leafCondition,
    boiledLeaf: parseFloat(greenLeaf.boiledLeaf),
    fieldGrossWeight: parseFloat(greenLeaf.fieldGrossWeight),
    fieldBagAmount: parseFloat(greenLeaf.fieldBagAmount),
    fieldWater: parseFloat(greenLeaf.fieldWater),
    fieldCouseLeaf: parseFloat(greenLeaf.fieldCouseLeaf),
    fieldNetWeight: parseFloat(greenLeaf.fieldNetWeight),
    factoryGrossWeight: parseFloat(greenLeaf.factoryGrossWeight),
    factoryBagAmount: parseFloat(greenLeaf.factoryBagAmount),
    factoryWaterAmount: parseFloat(greenLeaf.factoryWaterAmount),
    factoryCouseLeaf: parseFloat(greenLeaf.factoryCouseLeaf),
    factoryNetWeight: parseFloat(greenLeaf.factoryNetWeight),
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    comment: greenLeaf.comment,
    lossOrExcess: parseFloat(greenLeaf.lossOrExcess),
    isActive: true,
    isTemporyHelper: greenLeaf.isTemporyHelper,
    isTemporyDriver: greenLeaf.isTemporyDriver,
    isTemporyVehicleNumber: greenLeaf.isTemporyVehicleNo

  }
  const response = await CommonPost('/api/GreenLeafReceiving/SaveGreenLeafReceiving', null, saveModel);
  return response;
}

async function GetGreenLeafReceiving(groupID, factoryID, routeID, date) {
  const response = await CommonGet('/api/GreenLeafReceiving/GetGreenLeafReceiving', 'groupID=' + groupID + '&factoryID=' + factoryID + '&routeID=' + routeID + '&date=' + date.toISOString().split('T')[0]);
  return response;
}

async function GetGreenLeafReceivingDetailsByID(greenLeafReceivingID) {
  const response = await CommonGet('/api/GreenLeafReceiving/GetGreenLeafReceivingDetailsByID', 'greenLeafReceivingID=' + greenLeafReceivingID);
  return response.data;
}

async function UpdateGreenLeafReceiving(values) {
  let updateModel = {
    greenLeafReceivingID: parseInt(values.greenLeafReceivingID),
    groupID: parseInt(values.groupID),
    factoryID: parseInt(values.factoryID),
    routeID: parseInt(values.routeID),
    leafReceivedDate: values.date,
    factoryInTime: values.factoryInTime,
    officerID: parseInt(values.officerID),
    helperID: parseInt(values.helperID),
    temporyHelper: values.temporyHelper,
    driverID: parseInt(values.driverID),
    temporyDriver: values.temporyDriver,
    vehicleNumber: parseInt(values.vehicleNumber),
    temporyVehicleNumber: values.temporyVehicleNo,
    leafTransporterID: values.leafTransporterID,
    rainfallIn: parseFloat(values.rainfallIn),
    courseLeafAmount: parseFloat(values.courseLeafAmount),
    leafCondition: values.leafCondition,
    boiledLeaf: parseFloat(values.boiledLeaf),
    fieldGrossWeight: parseFloat(values.fieldGrossWeight),
    fieldBagAmount: parseFloat(values.fieldBagAmount),
    fieldWater: parseFloat(values.fieldWater),
    fieldCouseLeaf: parseFloat(values.fieldCouseLeaf),
    fieldNetWeight: parseFloat(values.fieldNetWeight),
    factoryGrossWeight: parseFloat(values.factoryGrossWeight),
    factoryBagAmount: parseFloat(values.factoryBagAmount),
    factoryWaterAmount: parseFloat(values.factoryWaterAmount),
    factoryCouseLeaf: parseFloat(values.factoryCouseLeaf),
    factoryNetWeight: parseFloat(values.factoryNetWeight),
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    comment: values.comment,
    lossOrExcess: parseFloat(values.lossOrExcess),
    isActive: true,
    isTemporyHelper: values.isTemporyHelper,
    isTemporyDriver: values.isTemporyDriver,
    isTemporyVehicleNumber: values.isTemporyVehicleNo

  }
  const response = await CommonPost('/api/GreenLeafReceiving/UpdateGreenLeafReceiving', null, updateModel);
  return response;
}

async function getCurrentBalancePaymnetDetail(groupID, factoryID) {
  let response = await CommonGet('/api/BalancePayment/CheckISBalancePaymentCompleted', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}

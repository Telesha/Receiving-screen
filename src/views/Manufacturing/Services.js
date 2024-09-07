import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getGroupsForDropdown,
  getFactoryByGroupID,
  saveManufacture,
  saveWithtredLeaf,
  saveRolling,
  saveFiering,
  getEmployeesForDropdown,
  getFuelTypesForDropdown,
  getJobTypesForDropdown,
  getToughTypesForDropdown,
  getRollerLinesForDropdown,
  GetManufactureNumberListToWitheringWeb,
  GetManufactureNumberListToRollingWeb,
  GetManufactureNumberListToFiringWeb,
  GetRollingsToRollingDropdownInRollingScreen,
  GetRollingSessionDetailsToFiringWeb,
  GetManufactureNumberListToGradingWeb,
  GetFiringDetailsToGradingWeb,
  GetGradingDetailsToGradingWeb,
  SaveGradingFromGradingWeb,
  GetBatchDetailsToManufactureScreen,
  GetBatchDetailsToJobCreationScreen,
  GetRollingSessionDetailsToRollingScreen,
  GetFiringDetailsToFiringScreen,
  GetGradingDetailsToGradingScreen,
  GetWitheringDetailsToWitheringScreen,
  SaveRefuseAmountFromFiringWeb,
  getEmployeesForDropdown1,
  getFuelTypesForName,
  SaveRefuseAmountFromGradingWeb,
  GetDhoolDetailsToFiringWeb,
  GetDhoolWeightToFiringScreenWeb

};

async function getGroupsForDropdown() {
  var groupArray = [];

  const response = await CommonGet('/api/Group/GetAllGroups', null)
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"]
    }
  }
  return groupArray;
}

async function getFactoryByGroupID(groupID) {
  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + parseInt(groupID))
  return response.data;
}

async function saveManufacture(manufacture, DhoolDetaislListModel, toughList) {
  let saveModel = {
    batchID: 0,
    groupID: parseInt(manufacture.groupID),
    factoryID: parseInt(manufacture.factoryID),
    jobName: manufacture.manufactureNumber,
    rollingLineID: parseInt(manufacture.rollerLineID),
    noOfDays: parseInt(manufacture.numberOfDays),
    greenLeafQuantity: parseFloat(manufacture.greenLeafAmount),
    createdGPS: null,
    narration: null,
    fromDateOfCrop: manufacture.fromDateOfCrop,
    toDateOfCrop: manufacture.toDateOfCrop,
    weatherCondition: parseInt(manufacture.weatherCondition),
    isDispatchCompleted: false,
    best: parseFloat(manufacture.best),
    belowBest: parseFloat(manufacture.belowBest),
    poor: parseFloat(manufacture.poor),
    manufacturedDateFrom: manufacture.fromDateOfManufacture,
    manufacturedDateTo: manufacture.toDateOfManufacture,
    fuelConsumeList: DhoolDetaislListModel,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    toughArray: toughList
  }
  const response = await CommonPost('/api/Manufacturing/SaveManufacture', null, saveModel);
  return response;
}

async function saveWithtredLeaf(DhoolDetaislList) {
  let model = {
    witheredLeafID: 0,
    bLManufaturingID: parseInt(DhoolDetaislList.manufactureNumber),
    startDate: DhoolDetaislList.startDate,
    endDate: DhoolDetaislList.endDate,
    witheredLeafAmount: DhoolDetaislList.witheredLeafAmount,
    //witheredLeafWeightBy: DhoolDetaislList.witheredLeafWeightBy,
    witheringCondition: DhoolDetaislList.witheringCondition,
    createdBy: tokenDecoder.getUserIDFromToken()
  }
  const response = await CommonPost('/api/Manufacturing/SaveWitheredLeaf', null, model);
  return response;
}

async function saveRolling(ArrayField) {
  let model = {
    RollingList: ArrayField
  }
  const response = await CommonPost('/api/Manufacturing/SaveRolling', null, model);
  return response;
}

async function saveFiering(ArrayField) {
  let model = {
    FiringList: ArrayField
  }
  const response = await CommonPost('/api/Manufacturing/SaveFiringWeb', null, model);
  return response;
}

async function getEmployeesForDropdown(groupID, factoryID) {
  var employeeArray = [];
  const response = await CommonGet('/api/Manufacturing/GetEmployees', 'groupID=' + groupID + "&operationEntityID=" + factoryID)
  for (let item of Object.entries(response.data)) {
    employeeArray[item[1]["employeeID"]] = item[1]["fullName"]
  }
  return employeeArray;
}


async function getEmployeesForDropdown1(groupID, factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetEmployees', 'groupID=' + groupID + "&operationEntityID=" + factoryID)
  return response.data;
}

async function getFuelTypesForDropdown(factoryID) {
  var fuelTypeArray = [];
  const response = await CommonGet('/api/Manufacturing/GetAllFuelTypesByFactoryID', "factoryID=" + parseInt(factoryID));
  for (let item of Object.entries(response.data)) {
    fuelTypeArray[item[1]["fuelTypeID"]] = item[1]["fuelName"]
  }
  return fuelTypeArray;
}

async function getFuelTypesForName(factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetAllFuelTypesByFactoryID', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function getJobTypesForDropdown() {
  var jobTypeArray = [];
  const response = await CommonGet('/api/Manufacturing/GetAllJobTypes', null)
  for (let item of Object.entries(response.data)) {
    jobTypeArray[item[1]["jobTypeID"]] = item[1]["jobTypeName"]
  }
  return jobTypeArray;
}

async function getToughTypesForDropdown(factoryID) {
  var toughArray = [];
  const response = await CommonGet('/api/Manufacturing/GetToughListByFactoryID', "factoryID=" + parseInt(factoryID))
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      toughArray[item[1]["toughID"]] = item[1]["toughName"]
    }
  }
  return toughArray;

}

async function getRollerLinesForDropdown(factoryID) {
  var rollerLineArray = [];
  const response = await CommonGet('/api/Manufacturing/GetRollingListByFactoryID', "factoryID=" + parseInt(factoryID))
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      rollerLineArray[item[1]["rollingID"]] = item[1]["rollingName"]
    }
  }
  return rollerLineArray;
}


async function GetManufactureNumberListToWitheringWeb(factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetManufactureNumberListToWitheringScreen', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function GetManufactureNumberListToRollingWeb(factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetManufactureNumberListToRollingScreen', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function GetManufactureNumberListToFiringWeb(factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetManufactureNumberListToFiringScreen', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function GetRollingsToRollingDropdownInRollingScreen(blManufaturingID, factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetRollingsToDropdownInRollingScreen', "factoryID=" + parseInt(factoryID) +
    "&batchID=" + parseInt(blManufaturingID));
  return response.data;
}


async function GetRollingSessionDetailsToFiringWeb(batchID) {
  const response = await CommonGet('/api/Manufacturing/GetRollingSessionDetailsToFiringScreen', "batchID=" + parseInt(batchID));
  return response.data;
}


async function GetDhoolDetailsToFiringWeb(batchID) {
  const response = await CommonGet('/api/Manufacturing/GetDhoolDetailsToFiringWeb', "batchID=" + parseInt(batchID));
  var dhoolArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      dhoolArray[item[1]["dhoolNameID"]] = item[1]["dhoolName"]
    }
  }
  return dhoolArray;
}

async function GetManufactureNumberListToGradingWeb(factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetManufactureNumberListToGradingScreen', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function GetFiringDetailsToGradingWeb(batchID) {
  const response = await CommonGet('/api/Manufacturing/GetFiringDetailsToGradingScreen', "batchID=" + parseInt(batchID));
  return response.data;
}

async function GetGradingDetailsToGradingWeb(factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetGradingDetailsToGradingScreen', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function GetDhoolWeightToFiringScreenWeb(batchID, dhoolNameID) {
  const response = await CommonGet('/api/Manufacturing/GetDhoolWeightToFiringScreenWeb', "batchID=" + parseInt(batchID) + "&dhoolNameID=" + parseInt(dhoolNameID));
  return response.data;
}

async function SaveGradingFromGradingWeb(ArrayField) {
  let model = {
    GradingList: ArrayField
  }
  const response = await CommonPost('/api/Manufacturing/SaveGradingFromGradingScreen', null, model);
  return response.data;
}

async function SaveRefuseAmountFromFiringWeb(model) {
  const response = await CommonPost('/api/Manufacturing/SaveRefuseAmountFromFiringScreen', null, model);
  return response.data;
}

async function SaveRefuseAmountFromGradingWeb(model) {
  const response = await CommonPost('/api/Manufacturing/SaveRefuseAmountFromGradingScreen', null, model);
  return response.data;
}

async function GetBatchDetailsToManufactureScreen(groupID, factoryID, date, statusID) {
  let model = {
    groupID: parseInt(groupID),
    factoryID: parseInt(factoryID),
    date: date.toISOString(),
    statusID: parseInt(statusID)
  }
  const response = await CommonPost('/api/Manufacturing/GetBatchDetailsToManufactureScreenWebView', null, model);
  return response.data;
}

async function GetBatchDetailsToJobCreationScreen(factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetBatchDetailsToJobCreationScreenWebView', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function GetWitheringDetailsToWitheringScreen(factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetWitheringDetailsToWitheringScreenWebView', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function GetRollingSessionDetailsToRollingScreen(factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetRollingSessionDetailsToRollingScreenWebView', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function GetFiringDetailsToFiringScreen(factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetFiringDetailsToFiringScreenWebView', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function GetGradingDetailsToGradingScreen(factoryID) {
  const response = await CommonGet('/api/Manufacturing/GetGradingDetailsToGradingScreenScreenWebView', "factoryID=" + parseInt(factoryID));
  return response.data;
}

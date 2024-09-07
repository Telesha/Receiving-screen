import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getFactoryByGroupID,
  GetBrokerList,
  GetGradeDetails,
  GetVehicleList,
  GetSellingMarkList,
  GetManufactureNumbers,
  saveDispatchInvoice,
  updateDispatchInvoice,
  GetDispatchInvoiceDetails,
  GetDispatchInvoiceDetailsByID,
  updateDispatchInvoice,
  GetSampleValueByGradeID,
  GetManufactureNumbersByGradeID,
  GetManufactureDateByManufactureNumber,
  DeleteDispatch,
  DeleteManufacureList,
  GetDispatchList,
  getFactoryCodeByFactoryID

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

async function GetBrokerList(groupID, factoryID) {
  const response = await CommonGet('/api/Broker/GetBrokerList', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let brokerArray = [];
  for (let item of Object.entries(response.data)) {
    brokerArray[item[1]["brokerID"]] = item[1]["brokerName"];

  }
  return brokerArray;
}


async function GetGradeDetails(groupID, factoryID) {
  const response = await CommonGet('/api/Grade/GetGradeDetails', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID));
  let gradeArray = [];
  for (let item of Object.entries(response.data)) {
    gradeArray[item[1]["gradeID"]] = item[1]["gradeName"];

  }
  return gradeArray;
};

async function GetVehicleList(groupID, factoryID) {
  const response = await CommonGet('/api/Vehicle/GetAllVehicles', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let vehicleArray = [];
  for (let item of Object.entries(response.data)) {
    vehicleArray[item[1]["vehicleID"]] = item[1]["vehicleNumber"];

  }
  return vehicleArray;
}

async function GetSellingMarkList(groupID, factoryID) {
  const response = await CommonGet('/api/SellingMark/GetAllSellingMarks', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let vehicleArray = [];
  for (let item of Object.entries(response.data)) {
    vehicleArray[item[1]["sellingMarkID"]] = item[1]["sellingMarkName"];

  }
  return vehicleArray;
}

async function GetManufactureNumbers(groupID, factoryID) {
  const response = await CommonGet('/api/DispatchInvoice/GetManufactureNumbers', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let manufactureNumberArray = [];
  for (let item of Object.entries(response.data)) {
    manufactureNumberArray[item[1]["blManufaturingID"]] = item[1]["batchNumber"];

  }
  return manufactureNumberArray;
}

async function GetDispatchInvoiceDetails(dispatchModel) {
  const response = await CommonPost('/api/DispatchInvoice/GetDispatchInvoiceDetails', null, dispatchModel);
  return response;
}

async function GetDispatchInvoiceDetailsByID(teaProductDispatchID) {
  const response = await CommonGet('/api/DispatchInvoice/GetDispatchInvoiceDetailsByID', 'teaProductDispatchID=' + teaProductDispatchID);
  return response.data;
}

async function GetDispatchList(teaProductDispatchID) {
  const response = await CommonGet('/api/DispatchInvoice/GetDispatchList', 'teaProductDispatchID=' + teaProductDispatchID);
  return response.data;
}

async function GetSampleValueByGradeID(teaGradeID) {
  const response = await CommonGet('/api/DispatchInvoice/GetSampleValueByGradeID', 'gradeID=' + teaGradeID);
  return response.data;
}

async function GetManufactureNumbersByGradeID(teaGradeID) {
  const response = await CommonGet('/api/DispatchInvoice/GetManufactureNumbersByGradeID', 'gradeID=' + teaGradeID);
  return response.data;
}

async function GetManufactureDateByManufactureNumber(manufactureNumber) {
  const response = await CommonGet('/api/DispatchInvoice/GetManufactureDateByManufactureNumber', 'manufactureNumber=' + manufactureNumber);
  return response.data;
}

async function DeleteDispatch(teaProductDispatchID) {
  let model = {
    teaProductDispatchID: teaProductDispatchID,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/DispatchInvoice/DeleteDispatch', null, model);
  return response.data;
}

async function DeleteManufacureList(teaProductDispatchDetailsID) {
  let model = {
    TeaProductDispatchDetailsID: teaProductDispatchDetailsID,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/DispatchInvoice/DeleteManufacureList', null, model);
  return response.data;
}


async function saveDispatchInvoice(values, dispatchList) {
  let saveModel = {
    groupID: parseInt(values.groupID),
    factoryID: parseInt(values.factoryID),
    dateOfDispatched: values.dateOfDispatched.toISOString(),
    sellingMarkID: parseInt(values.sellingMarkID),
    brokerID: parseInt(values.brokerID),
    manufactureYear: values.manufactureYear,
    dispatchList: dispatchList,
    vehicleID: parseInt(values.vehicleID),
    dispatchInvoiceApproval: parseInt(values.dispatchInvoiceApproval),
    dispatchYear: values.dispatchYear,
    isActive: true,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
  }

  const response = await CommonPost('/api/DispatchInvoice/SaveDispatchInvoice', null, saveModel);
  return response;
}

async function updateDispatchInvoice(dispatchInvoiceModel) {
  dispatchInvoiceModel.modifiedBy = parseInt(tokenDecoder.getUserIDFromToken());
  dispatchInvoiceModel.teaProductDispatchID = parseInt(dispatchInvoiceModel.teaProductDispatchID);
  let response = await CommonPost('/api/DispatchInvoice/UpdateDispatchInvoice', null, dispatchInvoiceModel);
  return response;
}

async function getFactoryCodeByFactoryID(factoryID) {
  const response = await CommonGet('/api/Factory/GetFactoryCodeByFactoryID', 'factoryID=' + factoryID);
  return response.data;
}




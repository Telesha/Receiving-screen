import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  GetAllGroups,
  GetFactoryByGroupID,
  GetAcknowladgementDetails,
  GetAllStatus,
  GetAcknowladgementDetailsByID,
  updateAcknowledgement,
  GetSellingMarkList,
  GetBrokerList,
  GetGradeDetails,
  GetManufactureDetailsByID
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

async function GetFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
};

async function GetAllStatus() {
  let response = await CommonGet('/api/Status/GetAllStatus');
  let statusArray = [];
  for (let item of Object.entries(response.data)) {
    statusArray[item[1]["statusID"]] = item[1]["statusName"];
  }
  return statusArray;
};

async function GetAcknowladgementDetails(groupID, factoryID, invoiceNo) {
  const response = await CommonGet('/api/Acknowledgement/GetAcknowladgementDetails', 'groupID=' + groupID + '&factoryID=' + factoryID + '&invoiceNo=' + invoiceNo);

  return response;
}

async function GetAcknowladgementDetailsByID(teaProductDispatchID) {
  const response = await CommonGet('/api/Acknowledgement/GetAcknowladgementDetailsByID', 'teaProductDispatchID=' + teaProductDispatchID);
  return response.data;
}

async function GetSellingMarkList(groupID, factoryID) {
  const response = await CommonGet('/api/SellingMark/GetAllSellingMarks', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let vehicleArray = [];
  for (let item of Object.entries(response.data)) {
    vehicleArray[item[1]["sellingMarkID"]] = item[1]["sellingMarkName"];

  }
  return vehicleArray;
}

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

async function updateAcknowledgement(values,) {
  let saveModel = {
    teaProductDispatchID: parseInt(values.teaProductDispatchID),
    groupID: parseInt(values.groupID),
    factoryID: parseInt(values.factoryID),
    dateofDispatched: values.dateOfDispatch,
    sellingMarkID: parseInt(values.sellingMarkID),
    brokerID: parseInt(values.brokerID),
    invoiceNo: values.invoiceNo,
    teaGradeID: parseInt(values.teaGradeID),
    noOfPackages: parseInt(values.noOfPackages),
    fullOrHalf: parseInt(values.fullOrHalf),
    typeOfPack: parseInt(values.typeOfPack),
    grossQuantity: parseFloat(values.grossQuantity),
    sampleQuantity: parseFloat(values.sampleQuantity),
    //netQuantity: parseFloat(values.netQuantity),
    manufactureDate: values.manufactureDate,
    manufactureNumber: values.manufactureNumber,
    manufactureYear: values.manufactureYear,
    status: parseInt(values.status),
    avarage: parseFloat(values.avarage),
    sellingDate: values.sellingDate,
    dateOfReceived: values.dateOfReceived,
    lotNumber: values.lotNumber,
    salesNumber: values.salesNumber,
    isActive: true,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  }
  const response = await CommonPost('/api/Acknowledgement/UpdateAcknowladgement', null, saveModel);
  return response;
}

async function GetManufactureDetailsByID(teaProductDispatchID) {
  const response = await CommonGet('/api/Acknowledgement/GetManufactureDetailsByID', 'teaProductDispatchID=' + teaProductDispatchID);
  return response.data;
}
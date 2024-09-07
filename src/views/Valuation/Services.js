import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getBrokerList,
  getSellingMarkList,
  getGradeDetails,
  getAllInvoiceNumbers,
  saveValuation,
  getValuationDetails,
  getValuationDetailsByID,
  updateValuation,
  getValuationDetailsByInvoiceNo
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

async function getBrokerList(groupID, factoryID) {
  const response = await CommonGet('/api/Broker/GetBrokerList', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let brokerArray = [];
  for (let item of Object.entries(response.data)) {
    brokerArray[item[1]["brokerID"]] = item[1]["brokerName"];

  }
  return brokerArray;
};

async function getSellingMarkList(groupID, factoryID) {
  const response = await CommonGet('/api/SellingMark/GetAllSellingMarks', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let vehicleArray = [];
  for (let item of Object.entries(response.data)) {
    vehicleArray[item[1]["sellingMarkID"]] = item[1]["sellingMarkName"];

  }
  return vehicleArray;
};

async function getGradeDetails(groupID, factoryID) {
  const response = await CommonGet('/api/Grade/GetGradeDetails', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID));
  let gradeArray = [];
  for (let item of Object.entries(response.data)) {
    gradeArray[item[1]["gradeID"]] = item[1]["gradeName"];

  }
  return gradeArray;
};

async function getAllInvoiceNumbers(groupID, factoryID) {
  const response = await CommonGet('/api/Valuation/GetCatalogueCompleteInvoiceNumbers', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID));
  return response.data;
};

async function saveValuation(values) {
  let saveModel = {
    valuationID: parseInt(values.valuationID),
    groupID: parseInt(values.groupID),
    factoryID: parseInt(values.factoryID),
    teaGradeID: parseInt(values.teaGradeID),
    teaProductDispatchID: parseInt(values.invoiceNo),
    brokerID: parseInt(values.brokerID),
    sellingMarkID: parseInt(values.sellingMarkID),
    sellingDate: values.sellingDate,
    //valuePerKg: parseFloat(values.valuePerKg),
    valuePerLot: values.valuePerLot,
    lotNumber: values.lotNumber,
    typeOfPack: parseInt(values.typeOfPack),
    noOfPackages: parseFloat(values.noOfPackages),
    //unitAmount: parseFloat(values.unitAmount),
    sampleAmount: parseFloat(values.sampleAmount),
    netAmount: values.netAmount,
    mValue: values.mValue,
    mValueAmount: values.mValueAmount,
    value: parseFloat(values.value),
    valueAmount: values.valueAmount,
    packWeight: parseFloat(values.packWeight),
    salesNumber: values.salesNumber,
    valuationTypeID: parseInt(values.valuationTypeID),
    valuationDate: values.valuationDate,
    dispatchDate: values.dispatchDate,
    catalogueDate: values.catalogueDate == "" ? null : values.catalogueDate,
    isActive: true,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString()
  }
  const response = await CommonPost('/api/Valuation/SaveValuation', null, saveModel);
  return response;
}

async function updateValuation(values) {
  let updateModel = {
    valuationID: parseInt(values.valuationID),
    groupID: parseInt(values.groupID),
    factoryID: parseInt(values.factoryID),
    teaGradeID: parseInt(values.teaGradeID),
    teaProductDispatchID: parseInt(values.invoiceNo),
    brokerID: parseInt(values.brokerID),
    sellingMarkID: parseInt(values.sellingMarkID),
    sellingDate: values.sellingDate,
    //valuePerKg: parseFloat(values.valuePerKg),
    valuePerLot: parseFloat(values.valuePerLot),
    lotNumber: values.lotNumber,
    typeOfPack: parseInt(values.typeOfPack),
    noOfPackages: parseFloat(values.noOfPackages),
    //unitAmount: parseFloat(values.unitAmount),
    sampleAmount: parseFloat(values.sampleAmount),
    netAmount: parseFloat(values.netAmount),
    mValue: parseFloat(values.mValue),
    mValueAmount: parseFloat(values.mValueAmount),
    value: parseFloat(values.value),
    valueAmount: parseFloat(values.valueAmount),
    packWeight: parseFloat(values.packWeight),
    salesNumber: values.salesNumber,
    valuationTypeID: parseInt(values.valuationTypeID),
    valuationDate: values.valuationDate,
    dispatchDate: values.dispatchDate,
    catalogueDate: values.catalogueDate,
    isActive: true,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
  }
  const response = await CommonPost('/api/Valuation/UpdateValuation', null, updateModel);
  return response;
}

async function getValuationDetails(groupID, factoryID, sellingDate) {
  let model = {
    groupID: parseInt(groupID),
    factoryID: parseInt(factoryID),
    sellingDate: sellingDate == null ? null : sellingDate.toISOString().split('T')[0],
  }
  const response = await CommonPost('/api/Valuation/GetValuationDetails', null, model);
  return response;
}

async function getValuationDetailsByID(valuationID) {
  const response = await CommonGet('/api/Valuation/GetValuationDetailsByID', 'valuationID=' + valuationID);
  return response.data;
}

async function getValuationDetailsByInvoiceNo(teaProductDispatchID) {
  const response = await CommonGet('/api/Valuation/GetValuationDetailsByInvoiceNo', 'teaProductDispatchID=' + teaProductDispatchID);
  return response.data;
}



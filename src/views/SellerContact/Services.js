import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getRoutesByFactoryID,
  getFactoriesByGroupID,
  getAllFactories,
  getSellingMarkList,
  getGradeDetails,
  getBrokerList,
  getAllBuyers,
  getAllStatus,
  getAllInvoiceNumbers,
  getSellerContractDetailsByInvoiceNo,
  saveSellerContract,
  getSellerContractDetails,
  getSellerContractDetailsByID,
  updateSellerContract,
  getValutionCompleteInvoiceNumbers
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


async function getAllFactories() {
  var factoryArray = [];
  const response = await CommonGet('/api/Factory/GetAllFactories', null);
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
}

async function getFactoriesByGroupID(groupID) {
  var factoryArray = [];
  const response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
}


async function getRoutesByFactoryID(factoryID) {
  const response = await CommonGet('/api/Route/GetRoutesByFactoryID', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function getSellingMarkList(groupID, factoryID) {
  const response = await CommonGet('/api/SellingMark/GetAllSellingMarks', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let vehicleArray = [];
  for (let item of Object.entries(response.data)) {
    vehicleArray[item[1]["sellingMarkID"]] = item[1]["sellingMarkName"];

  }
  return vehicleArray;
}

async function getGradeDetails(groupID, factoryID) {
  const response = await CommonGet('/api/Grade/GetGradeDetails', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID));
  let gradeArray = [];
  for (let item of Object.entries(response.data)) {
    gradeArray[item[1]["gradeID"]] = item[1]["gradeName"];

  }
  return gradeArray;
};

async function getBrokerList(groupID, factoryID) {
  const response = await CommonGet('/api/Broker/GetBrokerList', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let brokerArray = [];
  for (let item of Object.entries(response.data)) {
    brokerArray[item[1]["brokerID"]] = item[1]["brokerName"];

  }
  return brokerArray;
}

async function getAllBuyers(groupID, factoryID) {
  const response = await CommonGet('/api/BuyerRegistration/GetAllBuyers', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let buyerArray = [];
  for (let item of Object.entries(response.data)) {
    buyerArray[item[1]["buyerID"]] = item[1]["buyerName"];

  }
  return buyerArray;
}

async function getAllStatus() {
  let response = await CommonGet('/api/Status/GetStatusForSellerContract');
  let statusArray = [];
  for (let item of Object.entries(response.data)) {
    statusArray[item[1]["statusID"]] = item[1]["statusName"];
  }
  return statusArray;
};

async function getAllInvoiceNumbers(groupID, factoryID) {
  const response = await CommonGet('/api/Valuation/GetAllInvoiceNumbers', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID));
  return response.data;
};

async function getSellerContractDetailsByInvoiceNo(teaProductDispatchID) {
  const response = await CommonGet('/api/SellerContract/GetSellerContractDetailsByInvoiceNo', 'teaProductDispatchID=' + teaProductDispatchID);
  return response.data;
}

async function saveSellerContract(values) {
  const response = await CommonPost('/api/SellerContract/SaveSellerContract', null, values);
  return response;
}

async function updateSellerContract(values) {
  let updateModel = {
    sellerContractID: parseInt(values.sellerContractID),
    groupID: parseInt(values.groupID),
    factoryID: parseInt(values.factoryID),
    buyerID: parseInt(values.buyerID),
    statusID: parseInt(values.statusID),
    typeofSales: parseInt(values.typeofSales),
    salesRate: values.salesRate,
    statusID: parseInt(values.statusID),
    isActive: true,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString()
  }
  const response = await CommonPost('/api/SellerContract/UpdateSellerContract', null, updateModel);
  return response;
}

async function getSellerContractDetails(groupID, factoryID, dispatchYear) {
  const response = await CommonGet('/api/SellerContract/GetSellerContractDetails', 'groupID=' + groupID + '&factoryID=' + factoryID + '&dispatchYear=' + dispatchYear);
  return response;
}

async function getSellerContractDetailsByID(sellerContractID) {
  const response = await CommonGet('/api/SellerContract/GetSellerContractDetailsByID', 'sellerContractID=' + sellerContractID);
  return response.data;
}

async function getValutionCompleteInvoiceNumbers(groupID, factoryID) {
  const response = await CommonGet('/api/SellerContract/GetValutionCompleteInvoiceNumbers', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID));
  return response.data;
};


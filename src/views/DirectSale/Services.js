import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  getAllGradesByGroupIDFactoryID,
  getAllDirectSales,
  updateDirectSale,
  saveDirectSale,
  getDirectSaleDetailsByID
};

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
}

async function getAllFactoriesByGroupID(groupID) {
  let response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', 'groupID=' + parseInt(groupID));
  let factoryArray = []
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}

async function getAllGradesByGroupIDFactoryID(groupID, factoryID) {
  let response = await CommonGet('/api/Grade/GetAllGradesByGroupIDFactoryID', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let gradeArray = []
  for (let item of Object.entries(response.data)) {
    gradeArray[item[1]["gradeID"]] = item[1]["gradeName"]
  }
  return gradeArray;
}

async function getAllDirectSales(groupID, factoryID) {
  let response = await CommonGet('/api/DirectSale/GetAllDirectSales', 'groupID=' + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response;
}

async function getDirectSaleDetailsByID(directSaleID) {
  let response = await CommonGet('/api/DirectSale/GetDirectSaleDetailsByID', 'directSaleID=' + parseInt(directSaleID));
  return response;
}

async function updateDirectSale(route) {
  let updateModel = {
    directSalesID: parseInt(route.directSalesID),
    groupID: parseInt(route.groupID),
    factoryID: parseInt(route.factoryID),
    dateOfSelling: route.dateOfSelling,
    invoiceNumber: route.invoiceNumber,
    gradeID: route.gradeID,
    customerName: route.customerName,
    email: route.email,
    contactNumber: route.contactNumber,
    customerAddress: route.customerAddress,
    unitPrice: parseFloat(route.unitPrice),
    quantity: parseFloat(route.quantity),
    amount: parseFloat(route.amount),
    comment: route.comment,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
  };

  const response = await CommonPost('/api/DirectSale/UpdateDirectSale', null, updateModel);
  return response;
}

async function saveDirectSale(route) {
  let saveModel = {
    groupID: parseInt(route.groupID),
    factoryID: parseInt(route.factoryID),
    dateOfSelling: route.dateOfSelling,
    invoiceNumber: route.invoiceNumber,
    gradeID: parseInt(route.gradeID),
    customerName: route.customerName,
    email: route.email,
    contactNumber: route.contactNumber,
    customerAddress: route.customerAddress,
    unitPrice: parseFloat(route.unitPrice),
    quantity: parseFloat(route.quantity),
    amount: parseFloat(route.amount),
    comment: route.comment,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
  }

  const response = await CommonPost('/api/DirectSale/SaveDirectSale', null, saveModel);
  return response;
}




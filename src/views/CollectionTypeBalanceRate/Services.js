import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';
import moment from 'moment';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  getAllRoutesByFactoryID,
  getAllProductsByFactoryID,
  GetCollectionTypeBalanceRateDetails,
  getAllProducts,
  saveCollectionTypeBalanceRate,
  calculateMonthlyBalance,
  rejectCollectionTypeBalanceRate,
  approveCollectionTypeBalanceRate
};

async function calculateMonthlyBalance(collectionTypeBalanceRateModel) {
  let response = await CommonPost('/api/CollectionTypeBalanceRate/CalculateMonthlyBalanceWithBalanceRate', null, collectionTypeBalanceRateModel);
  return response;
}

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

async function getAllRoutesByFactoryID(factoryID) {
  let response = await CommonGet('/api/Route/GetRoutesByFactoryID', 'factoryID=' + parseInt(factoryID));
  let routeArray = []
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function getAllProductsByFactoryID(factoryID) {
  let response = await CommonGet('/api/Product/GetProductsByFactoryID', 'factoryID=' + parseInt(factoryID));
  let productArray = []
  for (let item of Object.entries(response.data)) {
    productArray[item[1]["productID"]] = item[1]["productName"]
  }
  return productArray;
}

async function getAllProducts(factoryID) {
  let response = await CommonGet('/api/Product/GetProductsByFactoryID', 'factoryID=' + parseInt(factoryID));
  let array = []
  for (let item of Object.entries(response.data)) {
    array[item[1]["productID"]] = item[1]["productName"]
  }
  return array;
}

async function GetCollectionTypeBalanceRateDetails(groupID, factoryID, productID, date) {

  var month = moment(date).format('MM');//date.getUTCMonth() + 1; //months from 1-12 
  var year = moment(date).format('YYYY'); //date.getUTCFullYear()

  const response = await CommonGet('/api/CollectionTypeBalanceRate/GetCollectionTypeBalanceRateDetails',
    "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&productID=" + parseInt(productID)
    + "&applicableMonth=" + month + "&applicableYear=" + year);
  return response.data;
}

async function saveCollectionTypeBalanceRate(data) {
  let model = {
    collectionTypeBalanceRates: data,
    createdBy: tokenDecoder.getUserIDFromToken(),
  }
  const response = await CommonPost('/api/CollectionTypeBalanceRate/SaveCollectionTypeBalanceRate', null, model);
  return response;
}

async function rejectCollectionTypeBalanceRate(data) {
  let model = {
    collectionTypeBalanceRates: data,
    createdBy: tokenDecoder.getUserIDFromToken(),
  }
  const response = await CommonPost('/api/CollectionTypeBalanceRate/RejectCollectionTypeBalanceRate', null, model);
  return response;
}

async function approveCollectionTypeBalanceRate(data) {
  let model = {
    collectionTypeBalanceRates: data,
    createdBy: tokenDecoder.getUserIDFromToken(),
  }
  const response = await CommonPost('/api/CollectionTypeBalanceRate/ApproveCollectionTypeBalanceRate', null, model);
  return response;
}


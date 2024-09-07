import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  getCustomerInfo,
  getCustomerCollectionInfo,
  getCustomerAccountInfo,
  getCustomerTransactionInfo
};

async function getCustomerInfo(searchData) {
  let response = await CommonPost('/api/CustomerProfile/GetCustomerInfo', null, searchData);
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

async function getCustomerCollectionInfo(searchData) {
  let response = await CommonPost('/api/CustomerProfile/GetCustomerLeafCollectionInfo', null, searchData);
  return response;
}
async function getCustomerAccountInfo(searchData) {
  let response = await CommonPost('/api/CustomerProfile/GetCustomerAccountsInfo', null, searchData);
  return response;
}
async function getCustomerTransactionInfo(searchData) {
  let response = await CommonPost('/api/CustomerProfile/GetCustomerTransactionInfo', null, searchData);
  return response;
}

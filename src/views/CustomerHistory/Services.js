import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  GetCustomerHistory
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

async function GetCustomerHistory(searchParamList, fromDate, toDate) {

  let searchModel = {
    groupID: parseInt(searchParamList.groupID),
    factoryID: parseInt(searchParamList.factoryID),
    registrationNumber: searchParamList.registrationNumber,
    transactionTypeID: parseInt(searchParamList.transactionTypeID),
    fromDate: fromDate,
    toDate: toDate
  }

  let response = await CommonPost('/api/CustomerHistory/GetCustomerHistoryDetails', null, searchModel);

  return response;
}


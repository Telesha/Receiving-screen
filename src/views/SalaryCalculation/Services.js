import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  ExecutePayPlanner,
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

async function ExecutePayPlanner(factoryID, date) {
  const response = await CommonGet('/api/PayPlanner/ExecutePayPlanner',
    "factoryId=" + parseInt(factoryID) + "&effectiveDate=" + date + '&createdBy=' + parseInt(tokenDecoder.getUserIDFromToken()));
  return response;
}
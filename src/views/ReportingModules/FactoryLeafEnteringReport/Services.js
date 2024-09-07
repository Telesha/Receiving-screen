import moment from 'moment';
import { CommonGet, CommonPost } from '../../../helpers/HttpClient';
import tokenDecoder from '../../../utils/tokenDecoder';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  getFactoryLeafTempData,
  getRoutesForDropDown,
};


async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet(
    '/api/Group/GetRouteByFactoryID',
    'factoryID=' + factoryID
  );
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]['routeID']] = item[1]['routeName'];
  }
  return routeArray;
}

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = [];
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]['groupID']] = item[1]['groupName'];
  }
  return groupArray;
}

async function getAllFactoriesByGroupID(groupID) {
  let response = await CommonGet(
    '/api/Factory/GetAllFactoriesByGroupID',
    'groupID=' + parseInt(groupID)
  );
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]['factoryID']] = item[1]['factoryName'];
  }
  return factoryArray;
}

async function getFactoryLeafTempData(filterModel) {
  const response = await CommonPost(
    '/api/FactoryLeafEnteringReport/GetFactoryLeafEnteringTempDetails',null,filterModel
  );
  return response;
}


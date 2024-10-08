import { CommonGet, CommonPost } from '../../../helpers/HttpClient';


export default {
  getAllGroups,
  getFactoryByGroupID,
  getRoutesForDropDown,
  getGroupAndFactoryDetailsForReport,
  GetAllBalancePaymentList
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

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function getGroupAndFactoryDetailsForReport(groupID, factoryID) {
  let response = await CommonGet('/api/BalancePaymentListReport/GetGroupAndFactoryDetailsForReport', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response;
}

async function GetAllBalancePaymentList(model) {
  let response = await CommonPost('/api/BalancePaymentListReport/GetAllBalancePaymentList', null, model);
  return response;
}

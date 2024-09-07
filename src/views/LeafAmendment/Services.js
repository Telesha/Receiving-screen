import moment from 'moment';
import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getAllFactoriesByGroupID,
  getLeafAmendmentDetails,
  getRoutesForDropDown,
  UpdateLeafAmendment,
  getCurrentBalancePaymnetDetail,
  DeleteLeafAmendment
};

async function UpdateLeafAmendment(dailyCropBalanceAmending) {
  dailyCropBalanceAmending.modifiedBy = tokenDecoder.getUserIDFromToken();
  const response = await CommonPost(
    '/api/DailyCropAmending/UpdateLeafAmendment',
    null,
    dailyCropBalanceAmending
  );
  return response;
}
async function DeleteLeafAmendment(deleteModel) {
  deleteModel.modifiedBy = tokenDecoder.getUserIDFromToken();
  const response = await CommonPost(
    '/api/DailyCropAmending/DeleteLeafAmendment',
    null,
    deleteModel
  );
  return response;
}
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

async function getLeafAmendmentDetails(
  groupID,
  factoryID,
  selectedDate,
  routeID,
  registrationNumber
) {
  let model = {
    groupID: parseInt(groupID),
    factoryID: parseInt(factoryID),
    selectedDate:
      selectedDate === undefined
        ? moment(new Date()).format()
        : moment(selectedDate).format(),
    routeID: parseInt(routeID) === 0 ? null : parseInt(routeID),
    registrationNumber: registrationNumber == '' ? null : registrationNumber
  };
  const response = await CommonPost(
    '/api/DailyCropAmending/GetDailyCropBalanceDetails',
    null,
    model
  );
  return response.data;
}

async function getCurrentBalancePaymnetDetail(groupID, factoryID) {
  let response = await CommonGet(
    '/api/BalancePayment/CheckISBalancePaymentCompleted',
    'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID)
  );
  return response.data;
}

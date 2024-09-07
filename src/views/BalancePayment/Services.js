import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getBalancePaymentData,
  saveBalancePaymentCurrentDetails,
  checkScheduleAlreadyStarted,
  getAllGroups,
  getFactoryByGroupID,
  checkBalanceRatesSet
};
async function checkBalanceRatesSet(applicableMonth,applicableYear,groupID,factoryID){
  const response = await CommonGet('/api/CollectionTypeBalanceRate/CheckBalanceRatesSet', "applicableMonth=" + applicableMonth + "&applicableYear=" + applicableYear+ "&groupID=" 
  +groupID+  "&factoryID=" + factoryID);
  return response.data;
}

async function checkScheduleAlreadyStarted(groupID,factoryID,currentMonth) {
  const response = await CommonGet('/api/BalancePayment/CheckScheduleAlreadyStarted', "groupID=" +groupID+  "&factoryID=" + factoryID);
  return response;
}

async function saveBalancePaymentCurrentDetails(data,groupID,factoryID) {
  let saveModel = {
    scheduleExecuteHisotryID: 0,
    applicableMonth: data.currentMonth,
    applicableYear: data.currentYear,
    isActive: true,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    executionStatusID: data.executionStatusID,
    groupID: parseInt(groupID),
    factoryID: parseInt(factoryID),
  }
  const response = await CommonPost('/api/BalancePayment/SaveBalancePaymentCurrentDetails', null, saveModel);
  return response;
}

async function getBalancePaymentData(groupID, factoryID) {
  const response = await CommonGet('/api/BalancePayment/GetBalancepaymentDetails', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}

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

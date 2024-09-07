import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {  
  getAllGroups,
  getFactoryByGroupID,
  updateCustomerRedisBalances,
  getCustomerBalancesForReconciliation
 
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

async function updateCustomerRedisBalances(groupID, factoryID) {
  let postModel = {
    "groupID": parseInt(groupID),
    "factoryID": parseInt(factoryID)
  };
  var response = await CommonPost('/api/CustomerBalanceReconciliation/UpdateCustomerRedisBalances', null, postModel);
  return response;
}

async function getCustomerBalancesForReconciliation(groupID, factoryID) {
  let response = await CommonGet('/api/CustomerBalanceReconciliation/GetCustomerBalancesForReconciliation', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response;
};



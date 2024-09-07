import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';


export default {
  getAllGroups,
  getFactoryByGroupID,
  getAccountFreezeDetails,
  getAccountFreezeDetailsbyAccountID,
  checkCurrentMonthalreadyFreeze,
  saveAccountFreeze,
  updateFreezeAccount,
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

async function getAccountFreezeDetails(value) {
  let searchModel = {
    groupID: parseInt(value.groupID),
    factoryID: parseInt(value.factoryID),
    applicableYear:value.date.split('/')[2]
  }
  const response = await CommonPost('/api/AccountFreeze/GetAccountFreezeDetails', null, searchModel);
  return response;
}

async function getAccountFreezeDetailsbyAccountID(ledgerAccountFreezID) {
  const response = await CommonGet('/api/AccountFreeze/GetAccountFreezeDetailsbyAccountID', "ledgerAccountFreezID=" + parseInt(ledgerAccountFreezID));
  return response;
}

async function checkCurrentMonthalreadyFreeze(datecheck) {
  let model={
    groupID:datecheck.groupID,
    factoryID:datecheck.factoryID,
    applicableYear:datecheck.date.split("-")[0],
    applicableMonth:datecheck.date.split("-")[1]
  }
  const response = await CommonPost('/api/AccountFreeze/CheckCurrentMonthalreadyFreeze', null, model)
  return response;
}

async function saveAccountFreeze(savemodel) {
  const response = await CommonPost('/api/AccountFreeze/SaveAccountFreezeDetails', null, savemodel);
  return response;
}

async function updateFreezeAccount(updateModel) {
  const response = await CommonPost('/api/AccountFreeze/UpdateAccountFreezeDetails', null, updateModel);
  return response;
}

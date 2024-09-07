import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getGroupsForDropdown,
  getFactoryByGroupID,
  getLedgerAccountDetailsByGroupIDFactoryID,
  getAccountDetailsByLedgerAccountID,
  ApproveLedgerAccount,
  RejectLedgerAccount,
  GetLedgerAccountDetailsByGroupIDFactoryIDStatusID
};

async function getGroupsForDropdown() {
  var groupArray = [];
  const response = await CommonGet('/api/Group/GetAllGroups', null)
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"]
    }
  }
  return groupArray;
}

async function getFactoryByGroupID(groupID) {
  var factoryArray = [];

  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}

async function getLedgerAccountDetailsByGroupIDFactoryID(groupID, factoryID) {
  const response = await CommonGet('/api/LedgerAccount/GetPendingLedgerAccountDetails', 'groupID=' + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}

async function getAccountDetailsByLedgerAccountID(ledgerAccountID) {
  const response = await CommonGet('/api/LedgerAccount/GetLedgerAccountDetailsByLedgerAccountID', 'ledgerAccountID=' + parseInt(ledgerAccountID));
  return response.data;
}
async function ApproveLedgerAccount(ledgerAccount) {
  let response = await CommonPost('/api/LedgerAccount/ApproveLedgerAccount', null, ledgerAccount);
  return response;
}

async function RejectLedgerAccount(ledgerAccount) {
  let response = await CommonPost('/api/LedgerAccount/RejectLedgerAccount', null, ledgerAccount);
  return response;
}

async function GetLedgerAccountDetailsByGroupIDFactoryIDStatusID(groupID, factoryID, statusID) {
  const response = await CommonGet('/api/LedgerAccount/GetLedgerAccountDetailsByGroupIDFactoryIDStatusID', 'groupID=' + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&statusID=" + parseInt(statusID));
  return response;
}


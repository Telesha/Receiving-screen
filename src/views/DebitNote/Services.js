import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getGroupsForDropdown,
  getFactoriesByGroupID,
  getCreditNoteDetails,
  GetAllTransactionAndPreviousCreditNoteDetails,
  GetCreditNoteDetailsForEditProcessByVoucherID,
  getLedgerAccountNamesForDatagrid,
  SendToApproveCreditNoteDetails,
  ApproveCreditNoteDetails,
  RejectCreditNoteDetails
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

async function getFactoriesByGroupID(groupID) {
  var factoryArray = [];
  const response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
}

async function getCreditNoteDetails(requestModel) {
  const response = await CommonPost('/api/DebitNote/GetDebitNoteDetailsList', null, requestModel);
  return response;
}

async function GetAllTransactionAndPreviousCreditNoteDetails(requestModel) {
  const response = await CommonPost('/api/DebitNote/GetAllTransactionAndPreviousDetails', null, requestModel);
  return response;
}

async function GetCreditNoteDetailsForEditProcessByVoucherID(requestModel) {
  const response = await CommonPost('/api/DebitNote/GetDebitNoteDetailsForEditProcessByVoucherID', null, requestModel);
  return response;
}

async function getLedgerAccountNamesForDatagrid(groupID, factoryID) {
  const response = await CommonGet('/api/LedgerAccount/GetLedgerAccountNamesForDropdown',
    "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));

  let data = response.data;
  let result = data.map((u) => ({ ledgerAccountName: u.ledgerAccountName, ledgerAccountID: u.ledgerAccountID }));

  return result;
}

async function SendToApproveCreditNoteDetails(requestModel) {
  const response = await CommonPost('/api/DebitNote/SendToApproveDebitNote', null, requestModel);
  return response;
}

async function ApproveCreditNoteDetails(requestModel) {
  const response = await CommonPost('/api/DebitNote/ApproveDebitNote', null, requestModel);
  return response;
}

async function RejectCreditNoteDetails(requestModel) {
  const response = await CommonPost('/api/DebitNote/RejectDebitNote', null, requestModel);
  return response;
}
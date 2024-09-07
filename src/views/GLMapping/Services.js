import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';
import _ from 'lodash';

export default {
  GetAllGroups,
  GetFactoryByGroupID,
  GetTransactionTypeDetails,
  GetGLMappingDetailsByGroupIDAndFactoryID,
  GetAccountNameDetailsByTransactionTypeID,
  GetApproedLedgerAccountNameAndIDForDropdown,
  UpdateGLMappingRequest,
  SaveNewGLMappingRequest,
  GetGLMappingAccountDetailsByTransactionTypeID,
  ApproveGLMappingRequest,
  RejectGLMappingRequest,
  SaveNewGLMappingMonthlyEnabledRequest,
  UpdateGLMappingMonthlyEnabledRequest,
  getAccountTypeNamesForDropdown,
  getParentHeadersByAccountTypeID,
  getChildHeadersByParentTypeID,
  getApprovedLedgerAoountNamesByFilter
}

async function GetAllGroups() {
  let response = await CommonGet('/api/Group/GetAllGroups');
  let groupArray = [];
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"];
    }
  }
  return groupArray;
};

async function GetFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
};

async function GetTransactionTypeDetails() {
  let response = await CommonGet('/api/ManualUploadTransaction/GetTransactionTypes', null);
  let tempArray = response.data;
  return tempArray;
};


async function GetGLMappingDetailsByGroupIDAndFactoryID(groupID, factoryID, transactionTypeID, entryType) {

  const response = await CommonGet("/api/GLMapping/GetAllGLMappingDetails", "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&transactionTypeID=" + parseInt(transactionTypeID) + "&entryType=" + parseInt(entryType));
  const tempArray = response.data;
  const filterdGLList = _.groupBy(tempArray, 'transactionTypeID');
  const accountDetailsList = Object.entries(filterdGLList)

  let finalArray = []
  let pendings = 0;
  let approves = 0;
  let rejects = 0;


  for (const accountObject of accountDetailsList) {
    let object = {
      id: parseInt(accountObject[0]),
      transactionType: "",
      statusID: 0,
      isActive: true
    }

    for (const iterator of accountObject[1]) {

      object.transactionType = iterator.transactionTypeName
      object.isActive = iterator.isActive
      object.statusID = iterator.statusID

      if (iterator.statusID === 1) { pendings++; }
      if (iterator.statusID === 2) { approves++; }
      if (iterator.statusID === 3) { rejects++; }

    }
    finalArray.push(object)
  }

  let returnObject = {
    glMappingDetails: finalArray,
    pendingCount: pendings,
    approveCount: approves,
    rejectCount: rejects
  }

  return returnObject
}

async function GetAccountNameDetailsByTransactionTypeID(transactionTypeID, groupID, factoryID) {
  const response = await CommonGet("/api/GLMapping/GetGLAccountDetailsByTransactionTypeID", "transactionTypeID=" + parseInt(transactionTypeID) + "&groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}

async function GetApproedLedgerAccountNameAndIDForDropdown(groupID, factoryID) {
  let AccountNameArray = [];
  const response = await CommonGet("/api/GLMapping/GetApprovedLedgerAoountNames", "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  const objectList = response.data;

  for (const object of objectList) {
    AccountNameArray.push(
      { accountName: object.ledgerAccountName, ledgerAccountID: object.ledgerAccountID, entryType: 0, glMappingID: 0 }
    )
  }

  return AccountNameArray;
}

async function SaveNewGLMappingRequest(glmappingObject) {
  const response = await CommonPost("/api/GLMapping/SaveNewGLMappingAccount", null, glmappingObject);
  return response
}

async function SaveNewGLMappingMonthlyEnabledRequest(glmappingObject) {
  const response = await CommonPost("/api/GLMapping/SaveNewGLMappingMonthlyEnabledAccount", null, glmappingObject);
  return response
}

async function UpdateGLMappingRequest(updateModel) {
  const response = await CommonPost("/api/GLMapping/UpdateGLMappingAccountDetails", null, updateModel);
  return response
}

async function UpdateGLMappingMonthlyEnabledRequest(updateModel) {
  const response = await CommonPost("/api/GLMapping/UpdateGLMappingMonthlyEnabledAccount", null, updateModel);
  return response
}

async function GetGLMappingAccountDetailsByTransactionTypeID(transactionTypeID, groupID, factoryID) {
  const response = await CommonGet("/api/GLMapping/GetAllGLMappingDetailsByTransactionTypeID", "transactionTypeID=" + parseInt(transactionTypeID) + "&groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  const object = response.data;
  const objectList = response.data;
  return object;

}

async function ApproveGLMappingRequest(requestModel) {
  const response = await CommonPost("/api/GLMapping/GLMappingApproveRequest", null, requestModel);
  return response
}
async function RejectGLMappingRequest(requestModel) {
  const response = await CommonPost("/api/GLMapping/GLMappingRejectRequest", null, requestModel);
  return response
}

async function getAccountTypeNamesForDropdown(groupID, factoryID) {
  const response = await CommonGet('/api/AccountType/GetAccountTypeNamesForDropdown',
    "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));

  return response;
}

async function getParentHeadersByAccountTypeID(accountTypeID) {
  const response = await CommonGet('/api/ParentHeader/GetParentHeadersByAccountTypeID',
    "accountTypeID=" + parseInt(accountTypeID));

  return response;
}

async function getChildHeadersByParentTypeID(parentHeaderID) {
  const response = await CommonGet('/api/ChildHeader/GetChildHeadersByParentTypeID',
    "parentHeaderID=" + parseInt(parentHeaderID));

  return response;
}

async function getApprovedLedgerAoountNamesByFilter(groupID, factoryID, ChildHeaderID) {
  let AccountNameArray = [];
  const response = await CommonGet("/api/GLMapping/GetApprovedLedgerAccountNamesByFilter", "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&ChildHeaderID=" + parseInt(ChildHeaderID));
  const objectList = response.data;
  for (const object of objectList) {
    AccountNameArray.push(
      { accountName: object.ledgerAccountName, ledgerAccountID: object.ledgerAccountID, entryType: 0, glMappingID: 0, ledgerAccountCode: object.ledgerAccountCode }
    )
  }

  return AccountNameArray;

}
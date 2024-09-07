import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getfactoriesForDropDown,
  getGroupsForDropdown,
  getFactoriesByGroupID,
  getAllFactories,
  getAccountTypeNamesForDropdown,
  getTransactionTypeNamesForDropdown,
  getReferenceNumber,
  saveGeneralJournal,
  getGeneralJournalDetails,
  getTransactionTypeList,
  getGeneralJournalDetailsByReferenceNumber,
  updateGeneralJournal,
  approveGeneralJournal,
  getLedgerAccountNamesForDropdown,
  getVoucherTypeList,
  getTransactionModeList,
  getLedgerAccountNamesForDatagrid,
  getFinancialYearStartDateByGroupIDFactoryID,
  getChequeNumber,
  ReJectLedgerTransaction,
  getTranLedgerListForDropdown,
  getSuppliersForDropDown,
  getPayVoucherCode,
  getSuppliersPaymentID,
  getLedgerAccountTRCode,
  getTranLedgerListForAutoDropdown,
  getSuppliersForDropDownAuto,
  getAccountDescriptions
};

async function getAccountDescriptions(accountID) {
  const response = await CommonGet('/api/AccountType/GetAccountDescriptions', "accountID=" + parseInt(accountID));
  return response.data;
}

async function getAllFactories() {
  var factoryArray = [];
  const response = await CommonGet('/api/Factory/GetAllFactories', null);
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
}

async function getFactoriesByGroupID(groupID) {
  var factoryArray = [];
  const response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
}

async function getfactoriesForDropDown(groupID) {
  var factoryArray = [];

  const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
  }
  return factoryArray;
}
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

async function getAccountTypeNamesForDropdown(groupID, factoryID) {
  const response = await CommonGet('/api/AccountType/GetAccountTypeNamesForDropdown',
    "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));

  let array = ["Select Account "]
  for (let item of Object.entries(response.data)) {
    array[item[1]["accountTypeID"]] = item[1]["accountTypeName"]
  }
  return array;
}

async function getTransactionTypeNamesForDropdown() {
  var transactionArray = [];
  const response = await CommonGet('/api/ManualUploadTransaction/GetTransactionTypes', null)
  for (let item of Object.entries(response.data)) {
    transactionArray[item[1]["transactionTypeID"]] = item[1]["transactionTypeName"]
  }
  return transactionArray;
}

async function getReferenceNumber(model) {
  const response = await CommonGet('/api/AuditTrialReport/GetModifiedVoucherCode', 'groupID=' + model.groupID + '&factoryID='
    + model.factoryID + '&voucherYear=' + model.date + '&voucherCode=' + model.voucherCode + '&ledgerAccountTRCode=' + model.ledgerAccountTRCode);
  return response;
}

async function saveGeneralJournal(generalJournal) {
  let saveModel = {
    ledgerTransactionID: 0,
    groupID: parseInt(generalJournal.groupID.toString()),
    factoryID: parseInt(generalJournal.factoryID.toString()),
    transactionTypeID: parseInt(generalJournal.transactionTypeID),
    referenceNumber: (generalJournal.referenceNumber.toString()),
    referenceNumberInter: "",
    chequeNumber: generalJournal.chequeNumber,
    voucherType: parseInt(generalJournal.voucherType),
    transactionMode: parseInt(generalJournal.transactionMode),
    voucherCode: generalJournal.referenceNumber.toString().substring(0, 2),
    recipientName: generalJournal.recipientName,
    isActive: true,
    journalData: generalJournal.journalData,
    date: generalJournal.date,
    dueDate: generalJournal.dueDate,
    createdBy: tokenDecoder.getUserIDFromToken(),
    preparedBy: tokenDecoder.getUserIDFromToken(),
    interEstateID: parseInt(generalJournal.interEstateID.toString()),
    createdDate: new Date().toISOString(),
    isInterEstate: generalJournal.isInterEstate,
    status: parseInt(generalJournal.status.toString()),
    supplierID: parseInt(generalJournal.supplierID),
    tranLedgerAccountID: parseInt(generalJournal.tranLedgerAccountID),
    modeoftransactionID: parseInt(generalJournal.modeoftransaction),
    modeoftransactionNumber: generalJournal.modeoftransactionNumber,
    payee: generalJournal.payee,
  }
  const response = await CommonPost('/api/GeneralJournal/SaveGeneralJournal', null, saveModel);
  return response;
}

async function getGeneralJournalDetails(groupID, factoryID, transactionTypeID, referenceNumber, date, statusID) {
  var newModel = {
    groupID: parseInt(groupID),
    factoryID: parseInt(factoryID),
    transactionTypeID: parseInt(transactionTypeID) == 0 ? null : parseInt(transactionTypeID),
    referenceNumber: referenceNumber.toString() == "" ? null : referenceNumber.toString(),
    date: date == null ? date : date.toISOString(),
    statusID: parseInt(statusID)
  }


  const response = await CommonPost('/api/GeneralJournal/GetGeneralJournalDetails', null, newModel);
  return response.data;

}

async function getTransactionTypeList() {
  const response = await CommonGet('/api/ManualUploadTransaction/GetTransactionTypes', null)
  return response.data;
}

async function getGeneralJournalDetailsByReferenceNumber(referenceNumber, groupID, factoryID) {
  const response = await CommonGet('/api/GeneralJournal/GetGeneralJournalDetailsByReferenceNumber', "referenceNumber=" + referenceNumber.toString() +
    "&groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response.data;
}

async function updateGeneralJournal(generalJournal) {
  let updateModel = {
    ledgerTransactionID: 0,
    groupID: generalJournal.groupID,
    factoryID: generalJournal.factoryID,
    transactionTypeID: parseInt(generalJournal.transactionTypeID),
    referenceNumber: (generalJournal.referenceNumber.toString()),
    voucherType: parseInt(generalJournal.voucherType),
    transactionMode: parseInt(generalJournal.transactionMode),
    recipientName: generalJournal.recipientName,
    chequeNumber: generalJournal.chequeNumber,
    isActive: true,
    journalData: generalJournal.journalData,
    date: generalJournal.date,
    dueDate: generalJournal.dueDate,
    updatedBy: tokenDecoder.getUserIDFromToken(),
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),
    voucherCode: generalJournal.voucherCode
  }
  const response = await CommonPost('/api/GeneralJournal/UpdateGeneralJournal', null, updateModel); return response;
}

async function approveGeneralJournal(generalJournal) {
  let updateModel = {
    ledgerTransactionID: 0,
    groupID: parseInt(generalJournal.groupID.toString()),
    factoryID: parseInt(generalJournal.factoryID.toString()),
    transactionTypeID: parseInt(generalJournal.transactionTypeID),
    referenceNumber: (generalJournal.referenceNumber.toString()),
    referenceNumberInter: (generalJournal.referenceNumberInter),
    chequeNumber: generalJournal.chequeNumber,
    voucherType: parseInt(generalJournal.voucherType),
    transactionMode: parseInt(generalJournal.transactionMode),
    voucherCode: generalJournal.voucherCode,
    recipientName: generalJournal.recipientName,
    isActive: true,
    journalData: generalJournal.journalData,
    date: generalJournal.date,
    dueDate: generalJournal.dueDate,
    createdBy: tokenDecoder.getUserIDFromToken(),
    preparedBy: tokenDecoder.getUserIDFromToken(),
    interEstateID: parseInt(generalJournal.interEstateID.toString()),
    createdDate: new Date().toISOString(),
    isInterEstate: generalJournal.isInterEstate,
    isMain: generalJournal.isMain
  }
  const response = await CommonPost('/api/GeneralJournal/ApproveGeneralJournal', null, updateModel);
  return response;
}

async function getLedgerAccountNamesForDropdown(groupID, factoryID) {
  const response = await CommonGet('/api/LedgerAccount/GetLedgerAccountNamesForDropdown',
    "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));

  let array = ["Select Account "]
  for (let item of Object.entries(response.data)) {
    array[item[1]["ledgerAccountID"]] = item[1]["ledgerAccountName"]
  }
  return array;
}

async function getVoucherTypeList() {
  const response = await CommonGet('/api/VoucherType/GetAllVoucherTypes', null)
  return response.data;
}

async function getTransactionModeList() {
  const response = await CommonGet('/api/TransactionMode/GetAllTransactionModes', null)
  return response.data;
}

async function getLedgerAccountNamesForDatagrid(groupID, factoryID) {
  const response = await CommonGet('/api/LedgerAccount/GetLedgerAccountNamesForDropdown',
    "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));

  let data = response.data;
  let result = data.map((u) => ({ ledgerAccountName: u.ledgerAccountName, ledgerAccountID: u.ledgerAccountID }));

  return result;
}

async function getFinancialYearStartDateByGroupIDFactoryID(groupID, factoryID) {
  const response = await CommonGet('/api/GeneralJournal/GetFinancialYearStartDateByGroupIDFactoryID',
    "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));

  return response.data;
}

async function getChequeNumber(ledgerAccountID) {
  const response = await CommonGet('/api/ChequeNumberSequence/GetChequeNumberByLedgerAccountID', "ledgerAccountID=" + parseInt(ledgerAccountID));

  return response;
}

async function ReJectLedgerTransaction(requestModel) {

  let rejectModel = {
    groupID: parseInt(requestModel.groupID.toString()),
    factoryID: parseInt(requestModel.factoryID.toString()),
    referenceNumber: requestModel.referenceNumber.toString(),
    rejectRemark: requestModel.rejectRemark.toString(),
    modifiedBy: tokenDecoder.getUserIDFromToken()
  }

  const response = await CommonPost('/api/GeneralJournal/RejectGeneralJournalTransactionByReferenceNumber', null, rejectModel);
  return response;
}

async function getLedgerAccountTRCode(factoryID) {
  const response = await CommonGet('/api/GeneralJournal/GetTranLedgerListForDropdown', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function getTranLedgerListForDropdown(factoryID) {
  var ledgerArray = [];
  const response = await CommonGet('/api/GeneralJournal/GetTranLedgerListForDropdown', "factoryID=" + parseInt(factoryID));
  for (let item of Object.entries(response.data)) {
    ledgerArray[item[1]["ledgerAccountID"]] = item[1]["ledgerAccountName"];
  }
  return ledgerArray;
}

async function getTranLedgerListForAutoDropdown(factoryID) {
  const response = await CommonGet('/api/GeneralJournal/GetTranLedgerListForDropdown', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function getSuppliersForDropDown(factoryID) {
  var supplierArray = [];

  const response = await CommonGet('/api/AccountingSuppliers/GetSuppliersForDropDown', "factoryID=" + parseInt(factoryID));
  for (let item of Object.entries(response.data)) {
    supplierArray[item[1]["supplierID"]] = { name: item[1]["supplierName"], code: item[1]["supplierCode"] }
  }
  return supplierArray;
}

async function getSuppliersForDropDownAuto(factoryID) {
  const response = await CommonGet('/api/AccountingSuppliers/GetSuppliersForDropDown', "factoryID=" + parseInt(factoryID));
  return response.data;
}

async function getPayVoucherCode() {
  const response = await CommonGet('/api/VoucherType/GetPayVoucherCode', null)
  return response.data;
}

async function getSuppliersPaymentID(factoryID) {
  const response = await CommonGet('/api/AccountingSuppliers/GetSuppliersForDropDown', "factoryID=" + parseInt(factoryID));
  return response.data;
}
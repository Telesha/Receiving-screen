import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';
import moment from 'moment';

export default {
  getPreviousMonthAdvanceIssueRecoverDetails,
  getCurrentMonthAdvanceIssueRecoverDetails,
  getCurrentMinMaxRateByApplicableMonthAndYear,
  IsPreviousMonthAdvanceIssueDisabled
};

async function getPreviousMonthAdvanceIssueRecoverDetails(approveDetails) {
  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    RegistrationNumber: approveDetails.regNumber,
  }
  const response = await CommonPost('/api/AdvanceIssueRecover/GetPreviousMonthAdvanceIssueRecoverDetails', null, newModel)
  return response.data;
}

async function getCurrentMonthAdvanceIssueRecoverDetails(approveDetails) {
  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    RegistrationNumber: approveDetails.regNumber,
  }
  const response = await CommonPost('/api/AdvanceIssueRecover/GetCurrentMonthAdvanceIssueRecoverDetails', null, newModel)
  return response.data;
}

async function getCurrentMinMaxRateByApplicableMonthAndYear(factoryID) {

  const response = await CommonGet('/api/AdvancePayment/GetCurrentMinMaxRateByApplicableMonthAndYear', 'factoryID=' + factoryID)
  return response.data;
}

async function IsPreviousMonthAdvanceIssueDisabled(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/IsPreviousMonthAdvanceIssueDisabled', null, newModel)
  return response.data;

}




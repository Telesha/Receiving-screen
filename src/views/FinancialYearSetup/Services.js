import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  GetGroupsForDropdown,
  GetFactoriesByGroupID,
  SaveFinancialYearConfigurationYear,
  FetchFinancialYearSetupDetailsForUpdate,
  GetPreviousFinancialYearDetails,
  EndFinancialYear
};


async function GetGroupsForDropdown() {
  var groupArray = [];
  const response = await CommonGet('/api/Group/GetAllGroups', null)
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] === true) {
      groupArray[item[1]["groupID"]] = item[1]["groupName"]
    }
  }
  return groupArray;
}

async function GetFactoriesByGroupID(groupID) {
  let factoryArray = [];

  const response = await CommonGet('/api/Factory/GetFactoriesByGroupID', 'groupID=' + parseInt(groupID))
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
}

async function SaveFinancialYearConfigurationYear(requestModel) {
  const response = await CommonPost('/api/FinancialYear/SaveFinancialYearDetails', null, requestModel)
  return response;
}

async function FetchFinancialYearSetupDetailsForUpdate(groupID, factoryID) {
  const response = await CommonGet('/api/FinancialYear/FetchFinancialYearSetupDetailsForUpdate', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID))
  return response.data
}

async function GetPreviousFinancialYearDetails(groupID, factoryID) {
  const response = await CommonGet('/api/FinancialYear/GetPreviousFinancialYearDetails', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID))
  return response.data
}

async function EndFinancialYear(requestModel) {
  const response = await CommonPost('/api/FinancialYear/EndFinancialYear', null, requestModel)
  return response;
}


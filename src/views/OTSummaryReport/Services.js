import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import moment from 'moment';
 
export default {
  getAllGroups,
  getFactoriesByGroupID,
  getDivisionDetailsByEstateID,
  GetOTSummaryReportDetails,
  getFieldDetailsByLentDivisionID
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
 
async function getFactoriesByGroupID(groupID) {
  var factoryArray = [];
  const response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  for (let item of Object.entries(response.data)) {
    if (item[1]["isActive"] == true) {
      factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
    }
  }
  return factoryArray;
}
 
async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};
 
async function getFieldDetailsByLentDivisionID(lentdivisionID) {
  let response = await CommonGet('/api/Field/getFieldDetailsByDivisionID', "divisionID=" + parseInt(lentdivisionID));
  let fieldArray = [];
  for (let item of Object.entries(response.data)) {
    fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
  }
  return fieldArray;
};
 
async function GetOTSummaryReportDetails(model) {
  const response = await CommonPost('/api/OTSummaryReport/GetOTSummaryReportDetails', null, model);
  return response;

  
}
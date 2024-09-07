import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  GetAllGroups,
  GetEstateDetailsByGroupID,
  GetEmployeeBasicSalaryDetailsDetails,
  GetEmployeeStatutoryDetails,
  GetEmployerStatutoryDetails,
  SaveEpfEtfCalculationDetails,
  GetEmployeeWorkedDayCount
};

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

async function GetEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function GetEmployeeBasicSalaryDetailsDetails(model) {
  const response = await CommonPost('/api/StatutoryCalculation/GetBasicSalaryDetails', null, model)
  return response.data;
}

async function GetEmployeeStatutoryDetails(model) {
  const response = await CommonPost('/api/StatutoryCalculation/GetEmployeeStatutoryDetails', null, model)
  return response.data;
}

async function GetEmployerStatutoryDetails(model) {
  const response = await CommonPost('/api/StatutoryCalculation/GetEmployerStatutoryDetails', null, model)
  return response.data;
}

async function GetEmployeeWorkedDayCount(model) {
  const response = await CommonPost('/api/StatutoryCalculation/GetEmployeeWorkedDayCount', null, model)
  return response.data;
}

async function SaveEpfEtfCalculationDetails(model) {
  const response = await CommonPost('/api/StatutoryCalculation/SaveEPFETFCalculationDetails', null, model)
  return response;
}

import { CommonGet, CommonPost } from '../../helpers/HttpClient';
export default {
  GetAllGroups,
  GetEstateDetailsByGroupID,
  GetEmployeeBasicSalaryDetailsDetails,
  GetEmployeeEpfEtfAmounts,
  GetOTAmountsDetails,
  GetEmployeeWorkedDayCount,
  GetEmployeeOTHoursCount,
  SaveEmployeeSalaryDetails
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

async function GetEmployeeBasicSalaryDetailsDetails(dataModel) {
  const response = await CommonPost('/api/SalaryCalculation/GetDetailsForEmployeeSalaryCalculation', null, dataModel);
  return response.data;
}

async function GetEmployeeEpfEtfAmounts(dataModel) {
  const response = await CommonPost('/api/SalaryCalculation/GetEmployeeEpfEtfAmounts', null, dataModel);
  return response.data;
}

async function GetOTAmountsDetails(estateID, groupID) {
  const response = await CommonGet('/api/SalaryCalculation/GetOTAmounts', 'estateID=' + estateID + '&groupID=' + groupID);
  return response.data;
}

async function GetEmployeeWorkedDayCount(model) {
  const response = await CommonPost('/api/SalaryCalculation/GetEmployeeWorkedDayCount', null, model)
  return response;
}

async function GetEmployeeOTHoursCount(model) {
  const response = await CommonPost('/api/SalaryCalculation/GetEmployeeOTHoursCount', null, model)
  return response;
}

async function SaveEmployeeSalaryDetails(model) {
  const response = await CommonPost('/api/SalaryCalculation/SaveEmployeeSalaryDetails', null, model)
  return response;
}

import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDesignationsByFactoryID,
  getDeductionTypes,
  getPayRollDeductionReportDetail
}

async function getAllGroups() {
  let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
  let groupArray = []
  for (let item of Object.entries(response.data)) {
    groupArray[item[1]["groupID"]] = item[1]["groupName"]
  }
  return groupArray;
}

async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function getDesignationsByFactoryID(factoryID) {
    let response = await CommonGet('/api/Employee/GetEmployeeDesignationByfactoryID', "factoryID=" + parseInt(factoryID));
    let designationArray = [];
    for (let item of Object.entries(response.data)) {
      designationArray[item[1]["designationID"]] = item[1]["designationName"];
    }
    return designationArray;
  };

async function getDeductionTypes() {
  let response = await CommonGet('/api/DeductionType/GetAllPayrollDeductionTypes', null);
  let deductionTypesArray = [];
  for (let item of Object.entries(response.data)) {
    deductionTypesArray[item[1]["deductionTypeID"]] = item[1]["deductionTypeName"];
  }
  return deductionTypesArray;
};

async function getPayRollDeductionReportDetail(model) {
  const response = await CommonPost('/api/PayrollDeductionReport/GetPayrollDeductionReportDetails', null, model);
  return response;
};


import { CommonGet, CommonPost } from '../../../helpers/HttpClient';


export default {
  getAllGroups,
  getFactoryByGroupID,
  GetAuditTrialReport,
  getVoucherCodesForDropdown
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

async function getFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
};


async function GetAuditTrialReport(model) {
  let response = await CommonPost('/api/AuditTrialReport/GetAuditTrialReport', null, model);
  return response;
}


async function getVoucherCodesForDropdown(groupID, factoryID) {

  const response = await CommonGet(
    '/api/AuditTrialReport/GetVoucherCodesForDropdown',
    'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID)
  );

  let array = [];
  for (let item of Object.entries(response.data)) {
    array[item[1]['voucherCodeID']] = item[1]['voucherCode'];
  }

  return array;

  
}

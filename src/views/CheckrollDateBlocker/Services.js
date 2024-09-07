import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getGroupsForDropdown,
  getEstatesByGroupID,
  getDivisionDetailsByEstateID,
  getCheckrollDateBlockerDetails,
  saveDateBlockCount,
  updateDateBlockCount
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

async function getEstatesByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
}

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getCheckrollDateBlockerDetails(data) {
  let response = await CommonPost('/api/CheckrollDateBlocker/GetCheckrollDateBlockerDetails', null, data)
  return response.data;

}
async function saveDateBlockCount(data) {
  let response = await CommonPost('/api/CheckrollDateBlocker/SaveDateBlockCount', null, data)
  return response;
}

async function updateDateBlockCount(data) {
  const response = await CommonPost('/api/CheckrollDateBlocker/UpdateDateBlockCount', null, data);
  return response;
}
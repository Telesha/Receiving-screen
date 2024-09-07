import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  saveGang,
  getGangDetailsByGangID,
  updateGang,
  getGangDetailsByGroupIDEstateIDDivisionID,
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID
};

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

async function getDivisionDetailsByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function saveGang(saveModel) {
  const response = await CommonPost('/api/Gang/SaveGang', null, saveModel);
  return response;
}

async function updateGang(gang) {
  const response = await CommonPost('/api/Gang/UpdateGang', null, gang);
  return response;
}

async function getGangDetailsByGangID(gangID) {
  const response = await CommonGet('/api/Gang/GetGangDetailsByGangID', "gangID=" + parseInt(gangID));
  return response.data;
}

async function getGangDetailsByGroupIDEstateIDDivisionID(groupID, estateID, divisionID) {
  const response = await CommonGet('/api/Gang/GetGangDetailsByGroupIDEstateIDDivisionID', 'groupID=' + parseInt(groupID) + "&estateID=" + parseInt(estateID) + '&divisionID=' + parseInt(divisionID))
  return response.data;
}







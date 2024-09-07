import { CommonGet, CommonPost } from '../../../helpers/HttpClient';


export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionByEstateID,
  getRoutesForDropDown,
  GetFieldWiseGreenLeafReportDetails,
  getAllFeilds
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

async function getAllFeilds(divisionID) {
  let response = await CommonGet('/api/Feild/GetFeildName', "divisionID=" + parseInt(divisionID));
  let feildArray = []
  for (let item of Object.entries(response.data)) {
    feildArray[item[1]["fieldCode"]] = item[1]["fieldName"]
  }
 
  return feildArray;
}


async function getEstateDetailsByGroupID(groupID) {
  let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
  let estateArray = [];
  for (let item of Object.entries(response.data)) {
    estateArray[item[1]["estateID"]] = item[1]["estateName"];
  }
  return estateArray;
};

async function getDivisionByEstateID(estateID) {
  let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
  let divisionArray = [];
  for (let item of Object.entries(response.data)) {
    divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
  }
  return divisionArray;
};

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function GetFieldWiseGreenLeafReportDetails(Model) {
  let response = await CommonPost('/api/Feild/GetFieldWiseGreenLeafReportDetails', null, Model);
  return response;
}

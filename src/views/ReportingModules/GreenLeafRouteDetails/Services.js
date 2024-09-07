import { CommonGet, CommonPost } from '../../../helpers/HttpClient';


export default {
  getAllGroups,
  getFactoryByGroupID,
  GetAllLeafTypes,
  GetGreenLeafRouteDetails
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

async function GetAllLeafTypes(factoryID) {
  let response = await CommonGet('/api/GreenLeafRouteDetails/GetAllLeafTypes', "factoryID=" + parseInt(factoryID));
  let leafArray = [];
  for (let item of Object.entries(response.data)) {
    leafArray[item[1]["collectionTypeID"]] = item[1]["collectionTypeName"];
  }
  return leafArray;
};

async function GetGreenLeafRouteDetails(greenLeafRouteDetailsInputModel) { 
  let response = await CommonPost('/api/GreenLeafRouteDetails/GetGreenLeafRouteDetails', null, greenLeafRouteDetailsInputModel);
  return response;
}
import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getEstateDetailsByGroupID,
  getDivisionDetailsByEstateID,
  getFactoryByGroupID,
  GetRouteSummaryDetails,
  getRoutesForDropDown,
  GetDailyCheckRollViewDetail
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
  
  async function getFactoryByGroupID(groupID) {
    let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
    let factoryArray = [];
    for (let item of Object.entries(response.data)) {
      factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
    }
    return factoryArray;
  };

  async function GetRouteSummaryDetails(routeSummaryInputModel) { 
    let response = await CommonPost('/api/RouteSummary/GetRouteSummaryDetails', null, routeSummaryInputModel);
    return response;
  }

  async function getRoutesForDropDown(factoryID) {
    var routeArray = [];
  
    const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
    for (let item of Object.entries(response.data)) {
      routeArray[item[1]["routeID"]] = item[1]["routeName"]
    }
    return routeArray;
  };

  async function GetDailyCheckRollViewDetail(dailyCheckrollViewModel) {
    let response = await CommonPost('/api/DailyCheckroll/GetDailyCheckRollViewDetail', null, dailyCheckrollViewModel);
    return response.data;
  }
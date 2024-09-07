import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getRoutesForDropDown,
  getAllActiveItemCategory,
  getfactoryItemsByGroupIDFactoryIDItemCategoryID,
  GetFactoryItemSummaryDetails
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

  async function getRoutesForDropDown(factoryID) {
    var routeArray = [];
  
    const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
    for (let item of Object.entries(response.data)) {
      routeArray[item[1]["routeID"]] = item[1]["routeName"]
    }
    return routeArray;
  };

  async function getAllActiveItemCategory() {
    const response = await CommonGet('/api/ItemCategory/GetAllActiveItemCategory', null);
    let factoryArray = []
    for (let item of Object.entries(response.data)) {
      factoryArray[item[1]["itemCategoryID"]] = item[1]["categoryName"]
    }
  
    return factoryArray;
  };

  async function getfactoryItemsByGroupIDFactoryIDItemCategoryID(groupID, factoryID, itemCategoryID) {
    var itemsArray = [];
    const response = await CommonGet('/api/FactoryItem/GetFactoryItemDetailsByGroupIDFactoryIDItemCategoryID', 'groupID=' + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + '&itemCategoryID=' + parseInt(itemCategoryID))
    for (let item of Object.entries(response.data)) {
      itemsArray[item[1]["factoryItemID"]] = item[1]["itemName"]
    }
    return itemsArray;
  };
  
  async function GetFactoryItemSummaryDetails(factoryItemSummaryInputModel) {
    let response = await CommonPost('/api/FactoryItemSummary/GetFactoryItemSummaryDetails', null, factoryItemSummaryInputModel);
    return response;
  }
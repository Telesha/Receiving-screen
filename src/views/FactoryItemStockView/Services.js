import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    getItemCategoryForDropDown,
    getItemByItemCategoryForDropDown,
    GetFactoryItemByItemCategoryIDFactoryItemID,
    GetFactoryItemByItemCategoryIDFactoryItemIDGRNWise,
    getfactoriesForDropDown,
    getGroupsForDropdown,
    UpdateFactoryItemGRN,
    GetAllItemsDetails

}

async function getItemCategoryForDropDown() {
    var ItemCategoryArray = [];
    const response = await CommonGet('/api/ItemCategory/GetAllActiveItemCategory', null);
    for (let item of Object.entries(response.data)) {
        ItemCategoryArray[item[1]["itemCategoryID"]] = item[1]["categoryName"]
    }
    return ItemCategoryArray;
}

async function getItemByItemCategoryForDropDown(groupID, factoryID, categoryID) {
    var ItemCategoryArray = [];
    const response = await CommonGet('/api/FactoryItem/GetFactoryItemByItemCategoryID', 'itemCategoryID=' + parseInt(categoryID) + '&' + 'groupID=' + parseInt(groupID) + '&' + 'factoryID=' + parseInt(factoryID));
    for (let item of Object.entries(response.data)) {
        ItemCategoryArray[item[1]["factoryItemID"]] = item[1]["itemName"]
    }
    return ItemCategoryArray;
}

async function GetFactoryItemByItemCategoryIDFactoryItemID(categoryID, factoryItemID, groupID, factoryID, itemCode) {
    const response = await CommonGet('/api/FactoryItem/GetFactoryItemByItemCategoryIDFactoryItemID', 'itemCategoryID=' + parseInt(categoryID) + '&' + 'factoryItemID=' + parseInt(factoryItemID) + '&' + 'groupID=' + parseInt(groupID) + '&' + 'factoryID=' + parseInt(factoryID) + '&' + 'itemCode=' + itemCode);
    return response;
}

async function GetFactoryItemByItemCategoryIDFactoryItemIDGRNWise(categoryID, factoryItemID, groupID, factoryID) {
    const response = await CommonGet('/api/FactoryItem/GetFactoryItemByItemCategoryIDFactoryItemIDGRNWise', 'itemCategoryID=' + parseInt(categoryID) + '&' + 'factoryItemID=' + parseInt(factoryItemID) + '&' + 'groupID=' + parseInt(groupID) + '&' + 'factoryID=' + parseInt(factoryID));
    return response;
}

async function getfactoriesForDropDown(groupID) {
    var factoryArray = [];
    const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
    for (let item of Object.entries(response.data)) {
        factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
    }
    return factoryArray;
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

async function UpdateFactoryItemGRN(updateModel) {
    const response = await CommonPost('/api/FactoryItem/UpdateFactoryItemGRN', null, updateModel)
    return response;
}

async function GetAllItemsDetails(groupID, factoryID) {
    const response = await CommonGet('/api/FactoryItem/GetAllItemsDetails', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID));
    return response;
}

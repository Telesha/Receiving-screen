import { CommonGet } from '../../helpers/HttpClient';

export default {
    getAllGroups,
    getAllFactoriesByGroupID,
    getItemCategoryForDropDown,
    getItemByItemCategoryForDropDown,
    GetSuppliersByGroupIDAndFactoryID
}


async function getAllGroups() {
    let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
    let groupArray = []
    for (let item of Object.entries(response.data)) {
        groupArray[item[1]["groupID"]] = item[1]["groupName"]
    }
    return groupArray;
}

async function getAllFactoriesByGroupID(groupID) {
    let response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', 'groupID=' + parseInt(groupID));
    let factoryArray = []
    for (let item of Object.entries(response.data)) {
        factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
    }
    return factoryArray;
}

async function getItemCategoryForDropDown() {
    const response = await CommonGet('/api/ItemCategory/GetAllActiveItemCategory', null);
    return response.data;
}

async function getItemByItemCategoryForDropDown(groupID, factoryID, categoryID) {
    const response = await CommonGet('/api/FactoryItem/GetFactoryItemByItemCategoryID', 'itemCategoryID=' + parseInt(categoryID) + '&' + 'groupID=' + parseInt(groupID) + '&' + 'factoryID=' + parseInt(factoryID));
    return response.data;
}

async function GetSuppliersByGroupIDAndFactoryID(groupID, factoryID) {
    const response = await CommonGet('/api/FactoryItemGrn/GetSuppliersByGroupIDAndFactoryID', 'groupID=' + groupID + '&factoryID=' + factoryID)
    return response.data;
}


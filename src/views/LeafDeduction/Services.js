import { CommonGet, CommonPost } from '../../helpers/HttpClient';
export default {
    getGroupsForDropdown,
    getfactoriesForDropDown,
    getRoutesForDropDown,
    GetAllSupplierDetailsForLeafDeduction,
    UpdateLeafDeductionPercentage
};

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

async function getfactoriesForDropDown(groupID) {
    var factoryArray = [];
    const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
    for (let item of Object.entries(response.data)) {
        factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
    }
    return factoryArray;
}

async function getRoutesForDropDown(factoryID) {
    var routeArray = [];

    const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
    for (let item of Object.entries(response.data)) {
        routeArray[item[1]["routeID"]] = item[1]["routeName"]
    }
    return routeArray;
}

async function GetAllSupplierDetailsForLeafDeduction(groupID, factoryID, routeID, accountTypeID) {
    var newModel = {
        groupID: parseInt(groupID),
        factoryID: parseInt(factoryID),
        routeID: parseInt(routeID),
        accountTypeID: parseInt(accountTypeID)
    }
    const response = await CommonPost('/api/LeafDeduction/GetAllSupplierDetailsForLeafDeduction', null, newModel);
    return response;
}

async function UpdateLeafDeductionPercentage(updateModel) {
    const response = await CommonPost('/api/LeafDeduction/UpdateLeafDeductionPercentage', null, updateModel)
    return response;
}
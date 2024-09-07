import { CommonGet, CommonGetAxios, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    getGroupsForDropdown,
    getAllFactories,
    getFactoriesByGroupID,
    getRoutesByFactoryID,
    GetChequePrintCustomerDetails,
    CustomerChequePrintProcess
};

async function getAllFactories() {
    var factoryArray = [];
    const response = await CommonGet('/api/Factory/GetAllFactories', null);
    for (let item of Object.entries(response.data)) {
        factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
    }
    return factoryArray;
}

async function getFactoriesByGroupID(groupID) {
    var factoryArray = [];
    const response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
    for (let item of Object.entries(response.data)) {
        factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
    }
    return factoryArray;
}

async function getRoutesByFactoryID(factoryID) {
    var routeArray = [];

    const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
    for (let item of Object.entries(response.data)) {
        routeArray[item[1]["routeID"]] = item[1]["routeName"]
    }
    return routeArray;
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

async function GetChequePrintCustomerDetails(requestModel) {
    let qString = "groupID=" + parseInt(requestModel.groupID) + "&factoryID=" + parseInt(requestModel.factoryID) + "&routeID=" + parseInt(requestModel.routeID) + "&applicableMonth=" + requestModel.applicableMonth + "&applicableYear=" + requestModel.applicableYear
    const response = await CommonGet('/api/CustomerChequePrint/GetCustomerListForChequePrint', qString)
    return response;
}

async function CustomerChequePrintProcess(requestModel) {
    const response = await CommonPost('/api/CustomerChequePrint/ProcessChequePrintCustomerDetails', null, requestModel)
    return response;
}
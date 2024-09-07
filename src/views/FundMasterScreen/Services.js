import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    getAllGroups,
    getFactoryByGroupID,
    getRouteByFactoryID,
    getCustomersByRouteID,
    getRegNoByCustomerID,
    getCollectionTypeByFactoryID,
    getFundMasterDataByFactoryId,
    saveFundMaster,
    updateFundMaster,
    getFundMaintenanceDetailsByID
}

async function saveFundMaster(data) {

    var fundObject = {
        groupID: parseInt(data.groupID),
        factoryID: parseInt(data.factoryID),
        fundCode: data.fundCode,
        fundName: data.fundName,
        deductionMethodID: parseInt(data.deductionMethodID),
        amount: parseFloat(data.amount),
        isActive: data.isActive,
        createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
        createdDate: new Date().toISOString(),
    }

    var response = await CommonPost('/api/FundMaster/SaveFundMaster', null, fundObject);
    return response;
}

async function updateFundMaster(data, fundMasterId) {

    var fundObject = {
        fundMasterID: parseInt(fundMasterId),
        groupID: parseInt(data.groupID),
        factoryID: parseInt(data.factoryID),
        fundName: data.fundName,
        fundCode: data.fundCode,
        deductionMethodID: parseInt(data.deductionMethodID),
        amount: parseFloat(data.amount),
        isActive: data.isActive,
        modifiedBy: parseInt(tokenDecoder.getUserIDFromToken()),
        modifiedDate: new Date().toISOString(),
    }

    var response = await CommonPost('/api/FundMaster/UpdateFundMaster', null, fundObject);
    return response;
}

async function getFundMasterDataByFactoryId(id) {
    var response = await CommonGet('/api/FundMaster/GetFundMasterData', "factoryID=" + parseInt(id));
    return response.data;
}

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

async function getRouteByFactoryID(factoryID) {
    let response = await CommonGet('/api/Route/GetRoutesByFactoryID', "factoryID=" + parseInt(factoryID));
    let routesArray = [];
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] === true) {
            routesArray[item[1]["routeID"]] = item[1]["routeName"];
        }
    }
    return routesArray;
};

async function getCustomersByRouteID(routeID) {
    let response = await CommonGet('/api/Customer/GetCustomersByRouteID', "routeID=" + parseInt(routeID));
    let customerArray = [];
    for (let item of Object.entries(response.data)) {
        customerArray[item[1]["customerID"]] = item[1]["firstName"];
    }
    return customerArray;
};

async function getRegNoByCustomerID(customerID) {
    let response = await CommonGet('/api/Customer/GetRegistrationNumbersByCustomerID', "customerID=" + parseInt(customerID));
    let regNoArray = [];
    for (let item of Object.entries(response.data)) {
        regNoArray[item[1]["registrationNumber"]] = item[1]["registrationNumber"];
    }
    return regNoArray;
};

async function getCollectionTypeByFactoryID(factoryID) {
    let response = await CommonGet('/api/CollectionType/GetCollectionTypeDetailsByFactoryID', "factoryID=" + parseInt(factoryID));
    let collectionTypeArray = [];
    for (let item of Object.entries(response.data)) {
        collectionTypeArray[item[1]["collectionTypeCode"]] = item[1]["collectionTypeName"];
    }
    return collectionTypeArray;
};

async function getFundMaintenanceDetailsByID(id) {
    var response = await CommonGet('/api/FundMaster/GetFundMaintenanceDetailsByID', "id=" + parseInt(id));
    return response.data;
}
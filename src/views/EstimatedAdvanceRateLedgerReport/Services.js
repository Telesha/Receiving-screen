import moment from 'moment';
import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    getAllGroups,
    getAllFactoriesByGroupID,
    getAllProductsByFactoryID,
    getAllProducts,
    GetEstimatedLedgerDetailsForReport
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

async function getAllProductsByFactoryID(factoryID) {
    let response = await CommonGet('/api/Product/GetProductsByFactoryID', 'factoryID=' + parseInt(factoryID));
    let productArray = []
    for (let item of Object.entries(response.data)) {
        productArray[item[1]["productID"]] = item[1]["productName"]
    }
    return productArray;
}

async function getAllProducts(factoryID) {
    let response = await CommonGet('/api/Product/GetProductsByFactoryID', 'factoryID=' + parseInt(factoryID));
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["productID"]] = item[1]["productName"]
    }
    return array;
}

async function GetEstimatedLedgerDetailsForReport(data) {
    let response = await CommonPost('/api/EstimatedLedgerReport/GetEstimatedLedgerReportDetails', null, data);
    return response.data;
}
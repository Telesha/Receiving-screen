import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
    getAllGroups,
    getAllFactoriesByGroupID,
    GetTeaSalesSummaryThisSale,
    GetTeaSalesSummaryLastSale,
    GetTeaSalesSummaryToDate,
    GetMainGradeDetailsThisSale,
    GetMainGradeDetailsLastSale,
    GetMainGradeDetailsToDate
};

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

async function GetTeaSalesSummaryThisSale(model) {
    let response = await CommonPost('/api/TeaSalesSummaryReport/GetTeaSalesSummaryThisSale', null, model);
    return response;
}

async function GetTeaSalesSummaryLastSale(model) {
    let response = await CommonPost('/api/TeaSalesSummaryReport/GetTeaSalesSummaryLastSale', null, model);
    return response.data;
}

async function GetTeaSalesSummaryToDate(model) {
    let response = await CommonPost('/api/TeaSalesSummaryReport/GetTeaSalesSummaryToDate', null, model);
    return response.data;
}

async function GetMainGradeDetailsThisSale(salesNumber) {
    let response = await CommonGet('/api/TeaSalesSummaryReport/GetMainGradeDetailsThisSale', "salesNumber=" + salesNumber);
    return response.data;
}

async function GetMainGradeDetailsLastSale(salesNumber) {
    let response = await CommonGet('/api/TeaSalesSummaryReport/GetMainGradeDetailsLastSale', "salesNumber=" + salesNumber);
    return response.data;
}

async function GetMainGradeDetailsToDate(salesNumber) {
    let response = await CommonGet('/api/TeaSalesSummaryReport/GetTeaSalesSummaryToDate', "salesNumber=" + salesNumber);
    return response.data;
}
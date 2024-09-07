import { CommonGet, CommonPost } from '../../../helpers/HttpClient';
export default {
    getAllGroups,
    getFactoryByGroupID,
    getBrokersStockSummaryData,
    GetBrokerList,
    GetSellingMarkList
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

async function GetBrokerList(groupID, factoryID) {
    const response = await CommonGet('/api/Broker/GetBrokerList', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
    let brokerArray = [];
    for (let item of Object.entries(response.data)) {
        brokerArray[item[1]["brokerID"]] = item[1]["brokerName"];
    }
    return brokerArray;
}

async function GetSellingMarkList(groupID, factoryID) {
    const response = await CommonGet('/api/SellingMark/GetAllSellingMarks', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
    let sellingMarkArray = [];
    for (let item of Object.entries(response.data)) {
        sellingMarkArray[item[1]["sellingMarkID"]] = item[1]["sellingMarkName"];
    }
    return sellingMarkArray;
}

async function getBrokersStockSummaryData(model) {
    let response = await CommonPost('/api/BrokersStockSummaryReport/GetBrokersStockSummaryDetails', null, model);
    return response;
}

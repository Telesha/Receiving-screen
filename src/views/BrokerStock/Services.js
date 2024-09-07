import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    GetBrokerList,
    getAllGroups,
    getFactoryByGroupID,
    GetSellingMarkList,
    GetGradeList,
    SaveBrokerStock,
    UpdateBrokerStock,
    getBrokerDetailsByID,
    GetTableData,
    GetInvoiceNumbersByBrokerIDDispatchdate,
    GetBrokerStockDetailsBybrokerStockID,
    GetInvoiceNumbersByBrokerID
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
    let response = await CommonGet('/api/SalesBroker/GetBrokerNamesByFactoryID', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
    let brokerArray = [];
    for (let item of Object.entries(response.data)) {
        brokerArray[item[1]["brokerID"]] = item[1]["brokerName"];
    }
    return brokerArray;
};

async function GetSellingMarkList(groupID, factoryID) {
    let response = await CommonGet('/api/SellingMark/GetAllSellingMarks', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
    let sellingMarkArray = [];
    for (let item of Object.entries(response.data)) {
        sellingMarkArray[item[1]["sellingMarkID"]] = item[1]["sellingMarkName"];
    }
    return sellingMarkArray;
};

async function GetGradeList(groupID, factoryID, gradeTypeID) {
    let response = await CommonGet('/api/Grade/GetAllGradesByGroupIDFactoryIDGradeTypeID', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID) + "&gradeTypeID=" + parseInt(gradeTypeID));
    let gradeArray = [];
    for (let item of Object.entries(response.data)) {
        gradeArray[item[1]["gradeID"]] = item[1]["gradeName"];
    }
    return gradeArray;
};

async function SaveBrokerStock(brokerStock) {
    brokerStock.createdBy = tokenDecoder.getUserIDFromToken();
    const response = await CommonPost('/api/SalesBroker/SaveBrokerStock', null, brokerStock);
    return response;
}

async function getBrokerDetailsByID(brokerID) {
    const response = await CommonGet('/api/Broker/GetBrokerDetailsByBrokerID', "brokerID=" + parseInt(brokerID));
    return response.data;
}

async function UpdateBrokerStock(broker) {
    broker.brokerID = parseInt(broker.brokerID);
    broker.modifiedBy = parseInt(tokenDecoder.getUserIDFromToken());
    const response = await CommonPost('/api/SalesBroker/UpdateBrokerDetails', null, broker);
    return response;
}

async function GetInvoiceNumbersByBrokerIDDispatchdate(model) {
    const response = await CommonPost('/api/SalesBroker/GetInvoiceNumbersByBrokerIDDispatchdate', null, model);
    let invoiceArray = [];
    for (let item of Object.entries(response.data)) {
        invoiceArray[item[1]["teaProductDispatchID"]] = item[1]["invoiceNo"];
    }
    return invoiceArray;
}

async function GetTableData(model) {
    const response = await CommonPost('/api/SalesBroker/GetSalesBrokerData', null, model);
    return response.data;
}

async function GetBrokerStockDetailsBybrokerStockID(BrokerStockID) {
    const response = await CommonGet('/api/SalesBroker/GetBrokerStockDetailsBybrokerStockID', "BrokerStockID=" + parseInt(BrokerStockID));
    return response.data;
}

async function GetInvoiceNumbersByBrokerID(model) {
    const response = await CommonPost('/api/SalesBroker/GetInvoiceNumbersByBrokerID', null, model);
    let invoiceArray = [];
    for (let item of Object.entries(response.data)) {
        invoiceArray[item[1]["teaProductDispatchID"]] = item[1]["invoiceNo"];
    }
    return invoiceArray;
}
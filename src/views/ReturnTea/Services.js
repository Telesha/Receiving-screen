import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    getAllGroups,
    getAllInvoiceNumbers,
    getFactoryByGroupID,
    getBuyerList,
    getBrokerList,
    getSalesDetailsByInvoiceNumber,
    saveReturnTea,
    updateReturnTea,
    getSellingMarkList,
    getReturnTeaDetails,
    getGradeDetails,
    getReturnedTeaDetailsByID,
    GetAllStatus
};

async function getAllGroups() {
    let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
    let groupArray = []
    for (let item of Object.entries(response.data)) {
        groupArray[item[1]["groupID"]] = item[1]["groupName"]
    }
    return groupArray;
}

async function getFactoryByGroupID(groupID) {
    let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
    let factoryArray = [];
    for (let item of Object.entries(response.data)) {
        factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
    }
    return factoryArray;
};


async function getAllInvoiceNumbers(groupID, factoryID) {
    const response = await CommonGet('/api/Valuation/GetAllInvoiceNumbers', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID));
    let invoiceArray = []
    for (let item of Object.entries(response.data)) {
        invoiceArray[item[1]["teaProductDispatchID"]] = item[1]["invoiceNo"]
    }
    return invoiceArray;
};

async function getBuyerList(groupID, factoryID) {
    const response = await CommonGet('/api/BuyerRegistration/GetAllBuyers', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
    let buyerArray = [];
    for (let item of Object.entries(response.data)) {
        buyerArray[item[1]["buyerID"]] = item[1]["buyerName"];
    }
    return buyerArray;
};

async function getBrokerList(groupID, factoryID) {
    const response = await CommonGet('/api/Broker/GetBrokerList', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
    let brokerArray = [];
    for (let item of Object.entries(response.data)) {
        brokerArray[item[1]["brokerID"]] = item[1]["brokerName"];
    }
    return brokerArray;
};

async function getSalesDetailsByInvoiceNumber(invoiceNo) {
    let response = await CommonGet('/api/ReturnTea/GetSalesDetailsByInvNo', "teaProductDispatchID=" + invoiceNo);
    return response.data
}

async function getSellingMarkList(groupID, factoryID) {
    const response = await CommonGet('/api/SellingMark/GetAllSellingMarks', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
    let vehicleArray = [];
    for (let item of Object.entries(response.data)) {
        vehicleArray[item[1]["sellingMarkID"]] = item[1]["sellingMarkName"];
    }
    return vehicleArray;
};

async function getGradeDetails(groupID, factoryID) {
    const response = await CommonGet('/api/Grade/GetGradeDetails', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID));
    let gradeArray = [];
    for (let item of Object.entries(response.data)) {
        gradeArray[item[1]["gradeID"]] = item[1]["gradeName"];
    }
    return gradeArray;
};

async function saveReturnTea(values) {
    let saveModel = {
        teaProductDispatchID: parseInt(values.teaProductDispatchID),
        groupID: parseInt(values.groupID),
        factoryID: parseInt(values.factoryID),
        returnDate: values.returnDate.toISOString(),
        invoiceNo: values.invoiceNo,
        dispatchYear: values.dispatchYear,
        returnFrom: parseInt(values.returnFromID),
        typeID: parseInt(values.typeID),
        returnTo: parseInt(values.returnToID),
        noOfPacks: parseInt(values.noOfPacks),
        packWeight: parseFloat(values.packWeight),
        netWeight: parseFloat(values.netWeight),
        brokerID: parseInt(values.brokerID),
        buyerID: values.buyerID == 0 ? null : values.buyerID,
        teaGradeID: parseInt(values.teaGradeID),
        sellingMarksID: parseInt(values.sellingMarksID),
        catalogueDate: values.catalogueDate == true ? null : values.catalogueDate,
        lotNumber: values.lotNumber,
        typeofSales: values.salesType == 0 ? null : parseInt(values.salesType),
        salesNumber: values.salesNumber,
        sellerContractID: values.sellerContractID == 0 ? null : parseInt(values.sellerContractID),
        price: values.price,
        returnedAmount: values.returnedAmount,
        soldDate: values.soldDate,
        createdBy: tokenDecoder.getUserIDFromToken(),
    }
    const response = await CommonPost('/api/ReturnTea/SaveReturnTeaDetails', null, saveModel);
    return response;
}

async function updateReturnTea(values) {
    let updateModel = {
        returnTeaID: values.returnTeaID,
        teaProductDispatchID: values.teaProductDispatchID,
        groupID: values.groupID,
        factoryID: values.factoryID,
        returnDate: values.returnDate,
        dispatchYear: values.dispatchYear,
        returnFrom: values.returnFromID,
        typeID: values.typeID,
        returnTo: values.returnToID,
        noOfPacks: values.noOfPacks,
        packWeight: values.packWeight,
        netWeight: values.netWeight,
        teaStatusID: values.teaStatusID,
        sellerContractID: values.sellerContractID,
        createdBy: tokenDecoder.getUserIDFromToken(),
    }
    const response = await CommonPost('/api/ReturnTea/UpdateReturnTeaDetails', null, updateModel);
    return response;
}

async function getReturnTeaDetails(model) {
    let response = await CommonPost('/api/ReturnTea/GetReturnTeaDetails', null, model);
    return response
}

async function getReturnedTeaDetailsByID(returnTeaID) {
    let response = await CommonGet('/api/ReturnTea/GetReturnTeaDetailsByReturnedTeaID', "returnedTeaID=" + returnTeaID);
    return response.data
}

async function GetAllStatus() {
    let response = await CommonGet('/api/Status/GetInvoiceStatusByPurposeCode');
    return response
};


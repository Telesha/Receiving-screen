import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    getAllGroups,
    getFactoryByGroupID,
    getLeafDeductionData,
    saveBalancePaymentCurrentDetails,
    checkScheduleAlreadyStarted,
    checkBalanceRatesSet
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
async function checkBalanceRatesSet(applicableMonth, applicableYear, groupID, factoryID) {
    const response = await CommonGet('/api/CollectionTypeBalanceRate/CheckBalanceRatesSet', "applicableMonth=" + applicableMonth + "&applicableYear=" + applicableYear + "&groupID="
        + groupID + "&factoryID=" + factoryID);
    return response;
}

async function checkScheduleAlreadyStarted(groupID, factoryID) {
    const response = await CommonGet('/api/LeafDeductionExecution/CheckSheduleStarted', "groupID=" + groupID + "&factoryID=" + factoryID);
    return response;
}

async function saveBalancePaymentCurrentDetails(data, groupID, factoryID) {
    let saveModel = {
        scheduleExecuteHisotryID: 0,
        applicableMonth: data.currentMonth,
        applicableYear: data.currentYear,
        isActive: true,
        createdBy: tokenDecoder.getUserIDFromToken(),
        createdDate: new Date().toISOString(),
        executionStatusID: data.executionStatusID,
        groupID: parseInt(groupID),
        factoryID: parseInt(factoryID),
    }
    const response = await CommonPost('/api/LeafDeductionExecution/SaveLeafDeductionData', null, saveModel);
    return response;
}

async function getLeafDeductionData(groupID, factoryID) {
    const response = await CommonGet('/api/LeafDeductionExecution/GetLeafDeductionData', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
    return response;
}



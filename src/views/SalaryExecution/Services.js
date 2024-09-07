import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    getAllGroups,
    getAllFactoriesByGroupID,
    SalaryExecution,
    executeCrossJob
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

async function SalaryExecution(model) {
    const response = await CommonPost('/api/PayRollExecution/PayRollExecution', null, model);
    return response;
}

async function executeCrossJob(model) {
    const response = await CommonPost('/api/SalaryExecutionCrossJob/GetAllExecutedSalaries', null, model);
    return response;
}

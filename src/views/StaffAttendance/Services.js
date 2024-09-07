import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    getAllGroups,
    getAllFactoriesByGroupID,
    getStaffEmployeeDetailsByRegNo,
    saveStaffEmployeeAttendances,
    getStaffEmployeeAttendanceDetailsByMonthEmployeeID,
    getEmployeeAttendanceDetailsByDate
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

async function getStaffEmployeeDetailsByRegNo(model) {
    const response = await CommonPost('/api/EmployeeAttendance/GetStaffEmployeeDetailsByRegNo', null, model)
    return response;
}

async function saveStaffEmployeeAttendances(saveModel) {
    const response = await CommonPost('/api/EmployeeAttendance/SaveStaffEmployeeAttendance', null, saveModel);
    return response;
}

async function getStaffEmployeeAttendanceDetailsByMonthEmployeeID(model) {
    const response = await CommonPost('/api/EmployeeAttendance/GetStaffEmployeeAttendanceDetailsByMonthEmployeeID', null, model)
    return response.data;
}
async function getEmployeeAttendanceDetailsByDate(model) {
    const response = await CommonPost('/api/EmployeeAttendance/GetStaffEmployeeAttendanceDetailsByDate', null, model)
    return response.data;
}

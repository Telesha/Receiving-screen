import { CommonGet, CommonPost } from '../../../../src/helpers/HttpClient';

export default {
    getAllGroups,
    getEstateDetailsByGroupID,
    GetEmpDesignationByEmpNo,
    SearchAttendanceMark,
    GetPayrollMonthlyExecution,
    getDesignationsForDropdownByEstateID
};

async function SearchAttendanceMark(model) {
    const response = await CommonPost('/api/PayrollMonthlyExecution/GetMonthlyExecution', null, model);
    return response;
}

async function GetEmpDesignationByEmpNo(empNo) {
    let response = await CommonGet('/api/EmployeeLeaveRequest/GetEmpDesignationByEmpNo', 'empNo=' + empNo);
    return response.data;
}

async function getAllGroups() {
    let response = await CommonGet('/api/Factory/GetAllActiveGroups', null);
    let groupArray = []
    for (let item of Object.entries(response.data)) {
        groupArray[item[1]["groupID"]] = item[1]["groupName"]
    }
    return groupArray;
}

async function getEstateDetailsByGroupID(groupID) {
    let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
    let estateArray = [];
    for (let item of Object.entries(response.data)) {
        estateArray[item[1]["estateID"]] = item[1]["estateName"];
    }
    return estateArray;
};

async function GetPayrollMonthlyExecution(payRollMonthlyExecutionID) {
    const response = await CommonGet('/api/PayrollMonthlyExecution/GetMonthlyExecutionByID', "payRollMonthlyExecutionID=" + parseInt(payRollMonthlyExecutionID))
    return response.data;
}

async function getDesignationsForDropdownByEstateID(estateID) {
    var designationArray = [];
    let response = await CommonGet('/api/Designation/GetEmployeeDesignationByEstateID', 'estateID=' + parseInt(estateID));
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] === true) {
            designationArray[item[1]["designationID"]] = item[1]["designation"]
        }
    }
    return designationArray;
}
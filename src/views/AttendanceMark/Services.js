import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    getAllGroups,
    getEstateDetailsByGroupID,
    GetEmpDesignationByEmpNo,
    SaveAttendanceMark,
    SearchAttendanceMark,
    DeleteAttendanceMark,
    UpdateAttendanceMark,
    GetDetailsByAttendanceMarkID,
    getEmployeesByEstateID,
    CheckEmpAttendanceCheckDatabase,
    UpdateAttendanceMarkSet,
    getDesignationsByFactoryID
};

async function DeleteAttendanceMark(model) {
    const response = await CommonPost('/api/AttendanceMark/DeleteAttendanceMark', null, model);
    return response;
}
async function SearchAttendanceMark(model) {
    const response = await CommonPost('/api/AttendanceMark/SearchAttendanceMark', null, model);
    return response;
}
async function UpdateAttendanceMark(model) {
    const response = await CommonPost('/api/AttendanceMark/UpdateAttendanceMark', null, model);
    return response;
}

async function GetEmpDesignationByEmpNo(empNo) {
    let response = await CommonGet('/api/EmployeeLeaveRequest/GetEmpDesignationByEmpNo', 'empNo=' + empNo);
    return response.data;
}

async function SaveAttendanceMark(model) {
    const response = await CommonPost('/api/AttendanceMark/SaveAttendanceMark', null, model);
    return response;
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

async function GetDetailsByAttendanceMarkID(attendancemarkID) {
    const response = await CommonGet('/api/AttendanceMark/GetDetailsByAttendanceMarkID', "attendanceMarkID=" + parseInt(attendancemarkID))
    return response.data;
}

async function getEmployeesByEstateID(estateID) {
    let response = await CommonGet('/api/AttendanceMark/GetEmployeesListByEstateID', 'estateID=' + estateID);
    return response.data;
}

async function CheckEmpAttendanceCheckDatabase(estateID, employeeNumber, month, year) {
    let model = {
        estateID: parseInt(estateID),
        regNo: employeeNumber,
        month: parseInt(month),
        year: parseInt(year),
    }
    const response = await CommonPost('/api/AttendanceMark/CheckEmpAttendanceCheckDatabase', null, model)
    return response.data;
}

async function UpdateAttendanceMarkSet(model) {
    const response = await CommonPost('/api/AttendanceMark/UpdateAttendanceMarkSet', null, model);
    return response;
}

async function getDesignationsByFactoryID(factoryID) {
    let response = await CommonGet('/api/Employee/GetEmployeeDesignationByfactoryID', "factoryID=" + parseInt(factoryID));
    let designationArray = [];
    for (let item of Object.entries(response.data)) {
        designationArray[item[1]["designationID"]] = item[1]["designationName"];
    }
    return designationArray;
};
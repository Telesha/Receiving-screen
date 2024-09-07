import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    getAllGroups,
    getEstateDetailsByGroupID,
    getDivisionDetailsByEstateID,
    GetLeaveRequestType,
    getDetailsByEmployeeLeaveRequestID,
    updateLeaveRequestDetails,
    GetEmpNameByEmpNo,
    saveLeaveFormDetails,
    getAllEmployeeLeaveDetailsForListing
};

async function GetEmpNameByEmpNo(empNo) {
    let response = await CommonGet('/api/EmployeeLeaveRequest/GetEmpNameByEmpNo', 'empNo=' + empNo);
    return response.data;
}

async function saveLeaveFormDetails(model) {
    const response = await CommonPost('/api/EmployeeLeaveRequest/SaveLeaveRequestDetails', null, model);
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


async function getDivisionDetailsByEstateID(estateID) {
    let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
    let divisionArray = [];
    for (let item of Object.entries(response.data)) {
        divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
    }
    return divisionArray;
};


async function GetLeaveRequestType() {
    let response = await CommonGet('/api/EmployeeLeaveRequest/GetAllEmployeeLeaveTypes', null);
    let leaveTypeArray = []
    for (let item of Object.entries(response.data)) {
        leaveTypeArray[item[1]["employeeLeaveTypeID"]] = item[1]["employeeLeaveTypeName"]
    }
    return leaveTypeArray;
}

async function getAllEmployeeLeaveDetailsForListing(model) {
    const response = await CommonPost('/api/EmployeeLeaveRequest/GetAllEmployeeLeaveDetailsForListing', null, model);
    return response;
};

async function getDetailsByEmployeeLeaveRequestID(employeeLeaveRequestID) {
    let response = await CommonPost('/api/EmployeeLeaveRequest/GetLeaveRequestDetailsByEmployeeLeaveRequestID', "employeeLeaveRequestID=" + parseInt(employeeLeaveRequestID))
    return response.data;

}

async function updateLeaveRequestDetails(model) {
    const response = await CommonPost('/api/EmployeeLeaveRequest/UpdateLeaveRequestDetails', null, model);
    return response;
}



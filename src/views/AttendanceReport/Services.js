import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    getAllGroups,
    getFactoriesByGroupID,
    getDesignationsForDropdown,
    getAttendanceReportDetails,
    getDesignationsByFactoryID
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

async function getFactoriesByGroupID(groupID) {
    var factoryArray = [];
    const response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] == true) {
            factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
        }
    }
    return factoryArray;
}

async function getDesignationsForDropdown() {
    var designationArray = [];
    const response = await CommonGet('/api/Designation/GetAllDesignations', null)

    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] === true) {
            designationArray[item[1]["designationID"]] = item[1]["designationName"]
        }
    }
    return designationArray;
}

async function getAttendanceReportDetails(model) {
    const response = await CommonPost('/api/AttendanceReport/GetAttendanceReportDetails', null, model);
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
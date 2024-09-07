import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    getGroupsForDropdown,
    getEstatesByGroupID,
    getDesignationsForDropdown,
    getAllAllowanceDetails,
    getAllowanceTypesForDropdown,
    saveAllowance,
    getDetailsByPayRollAllowanceID,
    UpdateAllowance,
    DeleteAllowance,
    getDesignationsForDropdownByEstateID,
    checkIfAllowanceExists
}

async function getGroupsForDropdown() {
    var groupArray = [];
    const response = await CommonGet('/api/Group/GetAllGroups', null)
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] === true) {
            groupArray[item[1]["groupID"]] = item[1]["groupName"]
        }
    }
    return groupArray;
}

async function getEstatesByGroupID(groupID) {
    let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
    let estateArray = [];
    for (let item of Object.entries(response.data)) {
        estateArray[item[1]["estateID"]] = item[1]["estateName"];
    }
    return estateArray;
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

async function getAllowanceTypesForDropdown() {
    var allowanceTypesArray = [];
    const response = await CommonGet('/api/AllowanceType/GetAllAllowanceTypes', null)
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] === true) {
            allowanceTypesArray[item[1]["allowancesTypeID"]] = item[1]["allowanceTypeName"]
        }
    }
    return allowanceTypesArray;
}

async function getAllAllowanceDetails(model) {
    const response = await CommonPost('/api/Allowance/GetDetailsOfAllowance', null, model);
    return response;
}


async function saveAllowance(ArrayField) {
    const response = await CommonPost('/api/Allowance/SaveAllowance', null, ArrayField);
    return response;
};

async function getDetailsByPayRollAllowanceID(payRollAllowanceID) {
    let response = await CommonGet('/api/Allowance/GetDetailsByPayRollAllowanceID', "payRollAllowanceID=" + parseInt(payRollAllowanceID))
    return response.data;
};

async function UpdateAllowance(payrollConfigSearch) {
    const response = await CommonPost('/api/Allowance/UpdateAllowance', null, payrollConfigSearch);
    return response;
}

async function DeleteAllowance(model) {
    const response = await CommonPost('/api/Allowance/DeleteAllowance', null, model)
    return response;
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

async function checkIfAllowanceExists(model) {
    const response = await CommonPost('/api/Allowance/CheckIfAllowanceExists', null, model);
    return response;
};
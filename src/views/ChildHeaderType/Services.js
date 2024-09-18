import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    getGroupsForDropdown,
    getEstatesByGroupID,
    getDesignationsForDropdown,
    getAllAllowanceDetails,
    getAllowanceTypesForDropdown,
    saveAllowance,
    getDetailsByPayRollAllowanceID,
    updateAllowance,
    deleteAllowance,
    getDesignationsForDropdownByEstateID,
    checkIfAllowanceExists,
    deletePayRollAdvance,
    saveDetails,
}

// Fetches active groups for a dropdown
async function getGroupsForDropdown() {
    const groupArray = [];
    const response = await CommonGet('/api/Group/GetAllGroups', null);
    
    for (let [key, value] of Object.entries(response.data)) {
        if (value.isActive) {
            groupArray[value.groupID] = value.groupName;
        }
    }
    return groupArray;
}

// Fetches estates by group ID
async function getEstatesByGroupID(groupID) {
    const response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', `groupID=${parseInt(groupID)}`);
    const estateArray = [];
    
    for (let [key, value] of Object.entries(response.data)) {
        estateArray[value.estateID] = value.estateName;
    }
    return estateArray;
}

// Fetches active designations for a dropdown
async function getDesignationsForDropdown() {
    const designationArray = [];
    const response = await CommonGet('/api/Designation/GetAllDesignations', null);
    
    for (let [key, value] of Object.entries(response.data)) {
        if (value.isActive) {
            designationArray[value.designationID] = value.designationName;
        }
    }
    return designationArray;
}

// Fetches allowance types for a dropdown
async function getAllowanceTypesForDropdown() {
    const allowanceTypesArray = [];
    const response = await CommonGet('/api/AllowanceType/GetAllAllowanceTypes', null);
    
    for (let [key, value] of Object.entries(response.data)) {
        if (value.isActive) {
            allowanceTypesArray[value.allowancesTypeID] = value.allowanceTypeName;
        }
    }
    return allowanceTypesArray;
}

// Fetches all allowance details based on the provided model
async function getAllAllowanceDetails(model) {
    const response = await CommonPost('/api/Allowance/GetDetailsOfAllowance', null, model);
    return response;
}

// Saves allowance details
async function saveAllowance(ArrayField) {
    const response = await CommonPost('/api/Allowance/SaveAllowance', null, ArrayField);
    return response;
}

// Fetches details by PayRollAllowanceID
async function getDetailsByPayRollAllowanceID(payRollAllowanceID) {
    const response = await CommonGet(`/api/Allowance/GetDetailsByPayRollAllowanceID`, `payRollAllowanceID=${parseInt(payRollAllowanceID)}`);
    return response.data;
}

// Updates allowance details
async function updateAllowance(childHeaderType) {
    const response = await CommonPost('/api/Allowance/UpdateAllowance', null, childHeaderType);
    return response;
}

// Deletes allowance details
async function deleteAllowance(model) {
    const response = await CommonPost('/api/Allowance/DeleteAllowance', null, model);
    return response;
}

// Fetches designations by EstateID for a dropdown
async function getDesignationsForDropdownByEstateID(estateID) {
    const designationArray = [];
    const response = await CommonGet(`/api/Designation/GetEmployeeDesignationByEstateID`, `estateID=${parseInt(estateID)}`);
    
    for (let [key, value] of Object.entries(response.data)) {
        if (value.isActive) {
            designationArray[value.designationID] = value.designation;
        }
    }
    return designationArray;
}

// Checks if an allowance exists
async function checkIfAllowanceExists(model) {
    const response = await CommonPost('/api/Allowance/CheckIfAllowanceExists', null, model);
    return response;
}

// Deletes PayRollAdvance
async function deletePayRollAdvance(model) {
    const response = await CommonPost('/api/childHeaderType/DeleteChildHeaderType', null, model);
    return response;
}

// Saves child header type details
async function saveDetails(childModel) {
    const saveModel = {
        groupID: parseInt(childModel.groupID),
        childHeaderTypeID: parseInt(childModel.childHeaderTypeID),
        childHeaderCode: childModel.childHeaderCode,
        childHeaderName: childModel.childHeaderName,
        isActive: true,
        createdBy: tokenDecoder.getUserIDFromToken(),
        createdDate: new Date().toISOString(),
        childHeaderID: 0,
    };
  
    const response = await CommonPost('/api/childHeaderType/saveDetails', null, saveModel);
    return response;
}

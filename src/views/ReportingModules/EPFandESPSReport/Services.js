import { CommonGet, CommonPost } from '../../../helpers/HttpClient';


export default {
    getAllGroups,
    getEstateDetailsByGroupID,
    getEmployeeDesignationByEstateID,
    getAllDeductionTypes,
    GetEPFandESPSDetails
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

async function getEstateDetailsByGroupID(groupID) {
    let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
    let estateArray = [];
    for (let item of Object.entries(response.data)) {
        estateArray[item[1]["estateID"]] = item[1]["estateName"];
    }
    return estateArray;
};

async function getEmployeeDesignationByEstateID(estateID) {
    let response = await CommonGet('/api/Designation/getEmployeeDesignationByEstateID', "estateID=" + parseInt(estateID));
    let designationArray = [];
    for (let item of Object.entries(response.data)) {
        designationArray[item[1]["designationID"]] = item[1]["designation"];
    }
    return designationArray;
};

async function getAllDeductionTypes() {
    let response = await CommonGet('/api/EPFandESPSReport/GetDeductionTypes');
    let deductionTypeArray = [];
    for (let item of Object.entries(response.data)) {
        deductionTypeArray[item[1]["deductionTypeID"]] = item[1]["deductionTypeName"];
    }
    return deductionTypeArray;
};

async function GetEPFandESPSDetails(model) {
    let response = await CommonPost('/api/EPFandESPSReport/GetDetailsForReport', null, model);
    return response;
}

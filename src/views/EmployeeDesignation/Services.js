import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    getfactoriesForDropDown,
    getGroupsForDropdown,
    getFactoriesByGroupID,
    getAllFactories,
    getDesignationDataByFactoryID,
    updateDesignationDetail,
    saveDesignationDetail,
    GetDesignationDetailsByDesignationID,
    GetEmployeeCategoriesData
};

async function getAllFactories() {
    var factoryArray = [];
    const response = await CommonGet('/api/Factory/GetAllFactories', null);
    for (let item of Object.entries(response.data)) {
        factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
    }
    return factoryArray;
}

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

async function getfactoriesForDropDown(groupID) {
    var factoryArray = [];
    const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] == true) {
            factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
        }
    }
    return factoryArray;
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

async function getDesignationDataByFactoryID(factoryID) {
    const response = await CommonGet('/api/Designation/GetDesignationDataByFactoryID', "factoryID=" + parseInt(factoryID));
    return response.data;
}

async function updateDesignationDetail(designation) {
    let updateModel = {
        designationID: parseInt(designation.designationID),
        factoryID: parseInt(designation.factoryID),
        groupID: parseInt(designation.groupID),
        employeeCategoryID: parseInt(designation.employeeCategoryID),
        designationCode: designation.designationCode,
        designationName: designation.designationName,
        basicSalary: designation.basicSalary,
        isActive: designation.isActive,
        createdBy: tokenDecoder.getUserIDFromToken()
    }
    const response = await CommonPost('/api/Designation/SaveDesignationDetails', null, updateModel);
    return response;
}

async function saveDesignationDetail(values) {
    let saveModel = {
        designationID: 0,
        factoryID: parseInt(values.factoryID),
        groupID: parseInt(values.groupID),
        employeeCategoryID: parseInt(values.employeeCategoryID),
        designationCode: values.designationCode,
        designationName: values.designationName,
        basicSalary: values.basicSalary,
        isActive: values.isActive,
        createdBy: tokenDecoder.getUserIDFromToken()
    }
    const response = await CommonPost('/api/Designation/SaveDesignationDetails', null, saveModel);
    return response;
}

async function GetDesignationDetailsByDesignationID(designationID) {
    const response = await CommonGet('/api/Designation/GetDesignationDetailsByDesignationID', "designationID=" + parseInt(designationID));
    return response.data;
}

async function GetEmployeeCategoriesData() {
    var response = await CommonGet('/api/Employee/GetAllEmployeeCategory', null);
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["employeeCategoryID"]] = item[1]["employeeCategoryName"]
    }
    return array;
}






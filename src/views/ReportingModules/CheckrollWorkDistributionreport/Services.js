import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
    getAllGroups,
    getEstateDetailsByGroupID,
    getDivisionByEstateID,
    getJobCategoryDetailsByEstateID,
    getJobCodeDetailsByJobCategoryID,
    getAllJobCodeDetailsByEstate,
    GetCheckrollWorkDistributionReportDetails
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
    let estateArray = [];
    let response = await CommonGet('/api/Estate/getEstateDetailsByGroupID', "groupID=" + parseInt(groupID));
    for (let item of Object.entries(response.data)) {
        estateArray[item[1]["estateID"]] = item[1]["estateName"];
    }
    return estateArray;
};

async function getDivisionByEstateID(estateID) {
    let response = await CommonGet('/api/Division/getDivisionDetailsByEstateID', "estateID=" + parseInt(estateID));
    let divisionArray = [];
    for (let item of Object.entries(response.data)) {
        divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
    }
    return divisionArray;
};

async function getJobCategoryDetailsByEstateID(estateID) {
    let response = await CommonGet('/api/JobCategory/GetJobCategoryDetailsByEstateID', "estateID=" + parseInt(estateID));
    let jobCategoryArray = [];
    for (let item of Object.entries(response.data)) {
        jobCategoryArray[item[1]["jobCategoryID"]] = item[1]["jobCategoryName"];
    }
    return jobCategoryArray;
};

async function getJobCodeDetailsByJobCategoryID(jobCategoryID) {
    let response = await CommonGet('/api/WorkDistributionSummaryReport/GetJobCodeDetailsByJobCategoryID', "jobCategoryID=" + parseInt(jobCategoryID));
    let jobCodeArray = [];
    for (let item of Object.entries(response.data)) {
        jobCodeArray[item[1]["jobID"]] = item[1]["jobCode"];
    }
    return jobCodeArray;
};

async function getAllJobCodeDetailsByEstate(estateID) {
    let response = await CommonGet('/api/WorkDistributionSummaryReport/GetAllJobCodeDetailsByEstate', "estateID=" + parseInt(estateID));
    let jobCodeArray = [];
    for (let item of Object.entries(response.data)) {
        jobCodeArray[item[1]["jobID"]] = item[1]["jobCode"];
    }
    return jobCodeArray;
};

async function GetCheckrollWorkDistributionReportDetails(model) {
    let response = await CommonPost('/api/CheckrollWorkDistributionReport/GetCheckrollWorkDistributionReportDetails', null, model);
    return response;
}
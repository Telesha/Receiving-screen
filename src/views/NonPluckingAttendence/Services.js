import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
    getGroupsForDropdown,
    getEstatesByGroupID,
    getDivisionDetailsByEstateID,
    getAllNonPluckingAttendeceDetails,
    getFieldDetailsByDivisionID,
    getJobCategoryDetailsByEstateID,
    getJobCategoryByGroupIDEstateIDJobCategoryID,
    getSundryAttendanceEmptypeDetail,
    GetSundryAttendanceEmployeeDetailsByEmpNo,
    saveEmployeeSundryAttendance,
    getNonPluckingAttendenceDetails,
    deleteNonPluckingAttendence,
    updateNonPuckingAttendenceDetails,
    getMusterChitDetailsByDivisionID,
    GetSundryDetailsByMusterChitID,
    DecreaseTheMusterChitEmployeeCount,
    IncreaseTheMusterChitEmployeeCount,
    GetMusterChitByMusterChitID,
    getAllMusterChitDetailsByDivisionID,
    EmployeeIsExists,
    ValidateTheJobs,
    GetEmployeeTypesData,
    getOperatorsForDropdown,
    CheckIsholidayValidationSundry,
    GetRegisterNoValidateByMainDivision,
    GetEmployeeNoForStaffEmployee,
    GetEmpNameByEmpNo,
    GetMusterChitCountByMusterID,
    getLentEstateNameByLentEstateID,
    ValidateTheGeneral,
    getAttendanceExecutionDate
};

async function getGroupsForDropdown() {
    var groupArray = [];
    const response = await CommonGet('/api/Group/GetAllGroupsFromCache', null)
    for (let item of Object.entries(response)) {
        if (item[1]["isActive"] === true) {
            groupArray[item[1]["groupID"]] = item[1]["groupName"]
        }
    }
    return groupArray;
}

async function getEstatesByGroupID(groupID) {
    let response = await CommonGet('/api/Estate/GetEstateDetailsByGroupIDFromCache', "groupID=" + parseInt(groupID));
    let estateArray = [];
    for (let item of Object.entries(response)) {
        estateArray[item[1]["estateID"]] = item[1]["estateName"];
    }
    return estateArray;
}

async function getDivisionDetailsByEstateID(estateID) {
    let response = await CommonGet('/api/Division/getDivisionDetailsByEstateIDFromCache', "estateID=" + parseInt(estateID));
    let divisionArray = [];
    for (let item of Object.entries(response)) {
        divisionArray[item[1]["divisionID"]] = item[1]["divisionName"];
    }
    return divisionArray;
};

async function getAllNonPluckingAttendeceDetails(data) {
    let response = await CommonPost('/api/EmployeeSundryAttendance/GetAllNonPluckingAttendenceDetails', null, data);
    return response;
}

async function getFieldDetailsByDivisionID(divisionID) {
    let response = await CommonGet('/api/Field/getFieldDetailsByDivisionIDFromCache', "divisionID=" + parseInt(divisionID));
    let fieldArray = [];
    for (let item of Object.entries(response)) {
        fieldArray[item[1]["fieldID"]] = item[1]["fieldName"];
    }
    return fieldArray;
};

async function getJobCategoryDetailsByEstateID(estateID) {
    let response = await CommonGet('/api/JobCategory/GetJobCategoryDetailsByEstateIDFromCache', "estateID=" + parseInt(estateID));
    let jobCategoryArray = [];
    for (let item of Object.entries(response)) {
        jobCategoryArray[item[1]["jobCategoryID"]] = item[1]["jobCategoryName"];
    }
    return jobCategoryArray;
};

async function getJobCategoryByGroupIDEstateIDJobCategoryID(groupID, estateID, jobCategoryID) {
    const response = await CommonGet('/api/Job/GetJobDetailsByGroupIDEstateIDJobCategoryID', 'groupID=' + parseInt(groupID) + "&estateID=" + parseInt(estateID) + '&jobCategoryID=' + parseInt(jobCategoryID))
    let jobArray = [];
    for (let item of Object.entries(response.data)) {
        jobArray[item[1]["jobID"]] = item[1]["jobName"];
    }
    return jobArray;
};

async function getSundryAttendanceEmptypeDetail(employeeNumber, mainDivisionID) {
    const response = await CommonGet('/api/DailyCheckroll/GetDailyCheckRollEmptypeDetail', "employeeNumber=" + employeeNumber + "&divisionID=" + mainDivisionID);
    return response.data;
};

async function GetSundryAttendanceEmployeeDetailsByEmpNo(estateID, empNo) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/GetSundryAttendanceEmployeeDetailsByEmpNo', 'estateID=' + parseInt(estateID) + '&empNo=' + empNo);
    return response;
};

async function saveEmployeeSundryAttendance(data) {
    const response = await CommonPost('/api/EmployeeSundryAttendance/SaveEmployeeSundryAttendance', null, data);
    return response;
};

async function getNonPluckingAttendenceDetails(dailySundryAttendanceDetailID) {
    const response = await CommonGet('/api/EmployeeSundryAttendance/GetNonPluckingAttendenceByAttendenceID', "dailySundryAttendanceDetailID=" + parseInt(dailySundryAttendanceDetailID));
    return response.data;
}

async function deleteNonPluckingAttendence(dailySundryAttendanceDetailID, employeeAttendanceID, modifiedBy) {
    const response = await CommonGet('/api/EmployeeSundryAttendance/DeleteNonPluckingAttendence/', "dailySundryAttendanceDetailID=" + parseInt(dailySundryAttendanceDetailID) + '&employeeAttendanceID=' + parseInt(employeeAttendanceID) + '&modifiedBy=' + parseInt(modifiedBy));
    return response;
}

async function updateNonPuckingAttendenceDetails(data) {
    const response = await CommonPost('/api/EmployeeSundryAttendance/UpdateNonPuckingAttendenceDetails/', null, data)
    return response
}

async function getMusterChitDetailsByDivisionID(mainDivisionID, date) {
    const response = await CommonGet('/api/EmployeeSundryAttendance/GetMusterChitDetailsByDivisionID', "mainDivisionID=" + parseInt(mainDivisionID) + '&date=' + date)
    let musterChitArray = [];
    for (let item of Object.entries(response.data)) {
        musterChitArray[item[1]["musterChitID"]] = item[1]["musterChitNumber"]
    }
    return musterChitArray
}
async function getAllMusterChitDetailsByDivisionID(mainDivisionID, date) {
    const response = await CommonGet('/api/EmployeeSundryAttendance/GetAllMusterChitDetailsByDivisionID', "mainDivisionID=" + parseInt(mainDivisionID) + '&date=' + date)
    let musterChitArray = [];
    for (let item of Object.entries(response.data)) {
        musterChitArray[item[1]["musterChitID"]] = item[1]["musterChitNumber"]
    }
    return musterChitArray
}

async function GetSundryDetailsByMusterChitID(musterChitID) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/GetSundryDetailsByMusterChitID', "musterChitID=" + parseInt(musterChitID))
    return response.data
}

async function DecreaseTheMusterChitEmployeeCount(musterChitID, attendenceID, modifiedBy) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/DecreseMusterChitEmployeeCount', "musterChitID=" + parseInt(musterChitID) + "&attendenceID=" + parseInt(attendenceID) + '&modifiedBy=' + parseInt(modifiedBy))
    return response;
}

async function IncreaseTheMusterChitEmployeeCount(musterChitID, attendenceID, modifiedBy) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/IncreaseMusterChitEmployeeCount', "musterChitID=" + parseInt(musterChitID) + "&attendenceID=" + parseInt(attendenceID) + '&modifiedBy=' + parseInt(modifiedBy))
    return response.data
}

async function GetMusterChitByMusterChitID(musterChitID) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/GetMusterChitByMusterChitID', "musterChitID=" + parseInt(musterChitID))
    return response.data
}
async function EmployeeIsExists(empNo, date) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/EmployeeIsExists', "empNo=" + empNo + '&date=' + date)
    return response
}

async function ValidateTheJobs(isHoliday, isCashJob, empNo, date, employeeID) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/ValidateTheJobs', "isHoliday=" + isHoliday + "&isCashJob=" + isCashJob + '&empNo=' + empNo + '&date=' + date + '&empID=' + parseInt(employeeID))
    return response;
}

async function GetEmployeeTypesData() {
    var response = await CommonGet('/api/Employee/GetAllEmployeeType', null);
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["employeeTypeID"]] = item[1]["employeeTypeName"]
    }
    return array;
}

async function getOperatorsForDropdown() {
    const response = await CommonGet('/api/Operator/GetAllOperators', null)
    let operatorArray = [];
    for (let item of Object.entries(response.data)) {
        operatorArray[item[1]["operatorID"]] = item[1]["operatorName"]
    }
    return operatorArray
}

async function CheckIsholidayValidationSundry(date, estateID) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/CheckIsholidayValidationSundry', "date=" + date + '&estateID=' + parseInt(estateID))
    return response.data
}

async function GetRegisterNoValidateByMainDivision(mainDivisionID, empNo, employeeID) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/GetRegisterNoValidateByMainDivision', 'mainDivisionID=' + mainDivisionID + '&empNo=' + empNo + '&empID=' + parseInt(employeeID));
    return response;
}

async function GetEmployeeNoForStaffEmployee(empNo, employeeID) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/GetEmployeeNoForStaffEmployee', 'empNo=' + empNo + '&empID=' + parseInt(employeeID));
    return response;
}

async function GetEmpNameByEmpNo(empNo, devisionID) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/GetEmpNameByEmpNo', 'empNo=' + empNo + '&divisionID=' + parseInt(devisionID));
    return response.data;
}

async function GetMusterChitCountByMusterID(musterChitID) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/GetMusterChitCountByMusterID', 'musterChitID=' + parseInt(musterChitID));
    return response.data;
}

async function getLentEstateNameByLentEstateID(lentEstateID) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/GetLentEstateNameByLentEstateID', 'lentEstateID=' + lentEstateID);
    let array = []
    for (let item of Object.entries(response.data)) {
        array[item[1]["estateID"]] = item[1]["estateName"]
    }
    return array;
}

async function ValidateTheGeneral(empNo, date) {
    let response = await CommonGet('/api/EmployeeSundryAttendance/GetValidateTheGeneral', 'empNo=' + empNo + '&date=' + date);
    return response.data;
}

async function getAttendanceExecutionDate(groupID, estateID, divisionID) {
    let model = {
        groupID: parseInt(groupID),
        estateID: parseInt(estateID),
        divisionID: parseInt(divisionID)
    }
    const response = await CommonPost('/api/DailyCheckroll/GetAttendanceExecutionDate', null, model);
    return response.data;
}
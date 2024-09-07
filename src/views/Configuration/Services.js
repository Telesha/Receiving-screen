import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    GetAllGroups,
    GetAllFactoriesByGroupID,
    GetConfigurationTypes,
    SaveConfigurationDetails,
    UpdateConfigurationDetails,
    GetConfigurationDetails,
    GetConfigurationDetailsForUpdate


};

async function GetAllGroups() {
    let response = await CommonGet('/api/Group/GetAllGroups');
    let groupArray = [];
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] === true) {
            groupArray[item[1]["groupID"]] = item[1]["groupName"];
        }
    }

    return groupArray;
};

async function GetAllFactoriesByGroupID(groupID) {
    let response = await CommonGet('/api/Factory/GetAllFactoriesByGroupID', 'groupID=' + parseInt(groupID));

    let factoryArray = []
    for (let item of Object.entries(response.data)) {
        factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
    }
    return factoryArray;
}

async function GetConfigurationTypes() {
    let response = await CommonGet('/api/ConfigurationType/GetAllConfigurationTypes', null);
    let configurationType = []
    for (let item of Object.entries(response.data)) {
        configurationType[item[1]["configurationTypeID"]] = item[1]["configurationTypeName"]
    }
    return configurationType;
}

async function GetConfigurationDetails(factoryID, configurationTypeID) {
    let response = await CommonGet('/api/ConfigurationType/GetConfigurationDetails', 'operationEntityID=' + parseInt(factoryID) + '&configurationTypeID=' + parseInt(configurationTypeID));
    return response.data;

}

async function GetConfigurationDetailsForUpdate(configurationDetailID) {
    let response = await CommonGet('/api/ConfigurationType/GetConfigurationDetailsForUpdate', 'configurationDetailID=' + parseInt(configurationDetailID));
    return response.data;
}

async function SaveConfigurationDetails(data) {
    let saveModel = {
        factoryID: data.factoryID,
        configurationTypeID: data.configurationTypeID,
        dayOT: data.dayOT,
        nightOT: data.nightOT,
        doubleOT: data.doubleOT,
        netKiloRate: data.netKiloRate,
        overKiloRate: data.overKiloRate,
        kiloValue: data.kiloValue,
        holidayPay: data.holidayPay,
        other: data.other,
        createdBy: parseInt(tokenDecoder.getUserIDFromToken())
    }
    const response = await CommonPost('/api/ConfigurationType/SaveConfigurationDetails', null, saveModel);
    return response;
}

async function UpdateConfigurationDetails(data) {
    let updateModel = {
        configurationDetailID: parseInt(data.configurationDetailID),
        dayOT: data.dayOT,
        nightOT: data.nightOT,
        doubleOT: data.doubleOT,
        netKiloRate: data.netKiloRate,
        overKiloRate: data.overKiloRate,
        kiloValue: data.kiloValue,
        holidayPay: data.holidayPay,
        other: data.other,
        modifiedBy: parseInt(tokenDecoder.getUserIDFromToken())
    }
    const response = await CommonPost('/api/ConfigurationType/UpdateConfigurationDetails', null, updateModel);
    return response;
}



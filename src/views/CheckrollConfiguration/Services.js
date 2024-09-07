import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
    getGroupsForDropdown,
    getEstatesByGroupID,
    saveCheckrollConfigurationDetails,
    getCheckrollDetailsByGroupIDAndEstateID,
    getAllCheckrollConfiguationDetails,
    updateCheckrollConfigurationDetails,
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

async function saveCheckrollConfigurationDetails(data) {
    let response = await CommonPost('/api/CheckRollConfiguration/SaveCheckrollConfigurationDetails', null, data);
    return response;
}

async function getCheckrollDetailsByGroupIDAndEstateID(groupID, estateID) {
    let response = await CommonGet('/api/CheckRollConfiguration/GetCheckrollDetailsByGroupIDAndEstateID', 'groupID=' + groupID + '&estateID=' + estateID);
    return response.data;
}

async function getAllCheckrollConfiguationDetails(checkrollConfigID) {
    const response = await CommonGet('/api/CheckRollConfiguration/GetAllCheckrollConfiguationDetails', 'checkrollConfigID=' + checkrollConfigID);
    return response.data;
}

async function updateCheckrollConfigurationDetails(data) {
    let response = await CommonPost('/api/CheckRollConfiguration/UpdateCheckrollConfigurationDetails', null, data);
    return response;
}
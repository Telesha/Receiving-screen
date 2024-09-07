import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  GetAllGroups,
  saveGroup,
  getGroupDetailsByID,
  updateGroup
};

async function GetAllGroups() {
  const response = await CommonGet('/api/Group/GetAllGroups', null);
  return response.data;
}

async function saveGroup(group) {

  let saveModel = {
    groupID: 0,
    groupName: group.groupName,
    groupCode: group.groupCode,
    isActive: group.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),

  }

  const response = await CommonPost('/api/Group/SaveGroup', null, saveModel);
  return response;
}
async function updateGroup(group) {


  let updateModel = {
    groupID: parseInt(group.groupID),
    groupName: group.groupName,
    groupCode: group.groupCode,
    isActive: group.isActive,
    modifiedBy: tokenDecoder.getUserIDFromToken(),
    modifiedDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/Group/UpdateGroup', null, updateModel);
  return response;
}

async function getGroupDetailsByID(groupID) {
  const response = await CommonGet('/api/Group/getGroupDetailsByID', "groupID=" + parseInt(groupID));
  return response.data;
}

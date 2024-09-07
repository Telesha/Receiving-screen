import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getFactoryByGroupID,
  SaveGrade,
  GetGradeDetails,
  GetGradeDetailsByID,
  UpdateGrade
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

async function getFactoryByGroupID(groupID) {
  let response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
  let factoryArray = [];
  for (let item of Object.entries(response.data)) {
    factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
  }
  return factoryArray;
};

async function SaveGrade(gradeModel) {
  let saveModel = {
    gradeID: 0,
    groupID: parseInt(gradeModel.groupID),
    factoryID: parseInt(gradeModel.factoryID),
    gradeCode: gradeModel.gradeCode,
    gradeName: gradeModel.gradeName,
    gradeCategoryID: parseInt(gradeModel.categoryID),
    gradeTypeID: parseInt(gradeModel.typeID),
    sampleAllowance: parseFloat(gradeModel.allowance),
    sampleAllowanceTwo: parseFloat(gradeModel.allowanceT),
    isActive: gradeModel.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString()

  }
  const response = await CommonPost('/api/Grade/SaveGrade', null, saveModel);
  return response;
};

async function GetGradeDetails(groupID, factoryID) {
  const response = await CommonGet('/api/Grade/GetGradeDetails', 'groupID=' + groupID + '&factoryID=' + factoryID);
  return response;
};

async function GetGradeDetailsByID(gradeID) {
  const response = await CommonGet('/api/Grade/GetGradeDetailsByID', 'gradeID=' + gradeID);
  return response.data;
}

async function UpdateGrade(gradeModel) {
  gradeModel.createdBy = parseInt(tokenDecoder.getUserIDFromToken());
  gradeModel.createdDate = new Date().toISOString();
  gradeModel.gradeID = parseInt(gradeModel.gradeID);
  let response = await CommonPost('/api/Grade/UpdateGrade', null, gradeModel);
  return response;
}
import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';


export default {
  getAllGroups,
  getFactoryByGroupID,
  saveSellingMark,
  GetSellingMarkDetails,
  GetSellingMarkDetailsBySellingMarkID,
  UpdateSellingMark
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

async function saveSellingMark(model, date) {
  let saveModel = {
    groupID: parseInt(model.groupID),
    factoryID: parseInt(model.factoryID),
    sellingMarkCode: model.sellingMarkCode,
    sellingMarkName: model.sellingMarkName,
    year: date.getFullYear().toString(),
    isActive: model.isActive,
    createdBy: tokenDecoder.getUserIDFromToken()
  }
  const response = await CommonPost('/api/SellingMark/SaveSellingMark', null, saveModel);
  return response;
}

async function GetSellingMarkDetails(model) {
  const response = await CommonPost('/api/SellingMark/GetSellingMarkDetails', null, model);
  return response;
}

async function GetSellingMarkDetailsBySellingMarkID(sellingMarkID) {
  const response = await CommonGet('/api/SellingMark/GetSellingMarkDetailsBySellingMarkID', "sellingMarkID=" + parseInt(sellingMarkID));
  return response.data;
}

async function UpdateSellingMark(model) {
  const response = await CommonPost('/api/SellingMark/UpdateSellingMark', null, model);
  return response;
}

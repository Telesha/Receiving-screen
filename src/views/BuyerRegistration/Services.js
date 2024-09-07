import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  getAllGroups,
  getFactoryByGroupID,
  SaveBuyerRegistration,
  GetBuyerRegistration,
  GetBuyerRegistrationDetailsByID,
  UpdateBuyerRegistration
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

async function SaveBuyerRegistration(buyerRegistrationModel) {
  let saveModel = {
    buyerID: 0,
    groupID: parseInt(buyerRegistrationModel.groupID),
    factoryID: parseInt(buyerRegistrationModel.factoryID),
    buyerCode: buyerRegistrationModel.buyerCode,
    buyerName: buyerRegistrationModel.buyerName,
    registrationNumber: buyerRegistrationModel.buyerReg === "" ? null : buyerRegistrationModel.buyerReg,
    joiningDate: buyerRegistrationModel.joiningDate == null ? null : buyerRegistrationModel.joiningDate.toISOString().split('T')[0],
    address: buyerRegistrationModel.address1,
    addressTwo: buyerRegistrationModel.address2,
    addressThree: buyerRegistrationModel.address3,
    contactNumber: buyerRegistrationModel.contactNo,
    emailAddress: buyerRegistrationModel.email,
    isActive: buyerRegistrationModel.isActive,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString()
  }
  const response = await CommonPost('/api/BuyerRegistration/SaveBuyerRegistration', null, saveModel);
  return response;
};

async function GetBuyerRegistration(groupID, factoryID) {
  const response = await CommonGet('/api/BuyerRegistration/GetBuyerRegistration', 'groupID=' + groupID + '&factoryID=' + factoryID);
  return response;
};

async function GetBuyerRegistrationDetailsByID(buyerID) {
  const response = await CommonGet('/api/BuyerRegistration/GetBuyerRegistrationDetailsByID', 'buyerID=' + buyerID);
  return response.data;
};

async function UpdateBuyerRegistration(buyerRegistrationModel) {
  buyerRegistrationModel.createdBy = parseInt(tokenDecoder.getUserIDFromToken());
  buyerRegistrationModel.createdDate = new Date().toISOString();
  buyerRegistrationModel.buyerID = parseInt(buyerRegistrationModel.buyerID);
  let response = await CommonPost('/api/BuyerRegistration/UpdateBuyerRegistration', null, buyerRegistrationModel);
  return response;
}


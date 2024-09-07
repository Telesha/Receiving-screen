import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';


export default {
  getAllGroups,
  getFactoryByGroupID,
  saveBroker,
  GetBrokerList,
  getBrokerDetailsByID,
  updateBroker
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

async function saveBroker(broker) {  
  let saveModel = {
    brokerID: 0,
    brokerName: broker.brokerName,
    brokerCode: broker.brokerCode,
    brokerReg: broker.brokerReg === "" ? "null" : broker.brokerReg,
    groupID: parseInt(broker.groupID),
    factoryID: parseInt(broker.factoryID),
    joinedDate: broker.joinedDate == null ? "null" : broker.joinedDate.toISOString().split('T')[0],
    address1: broker.address1,
    address2: broker.address2,
    address3: broker.address3,
    contactNo: broker.contactNo,
    email: broker.email,
    createdBy: tokenDecoder.getUserIDFromToken(),
    createdDate: new Date().toISOString(),
    isActive: broker.isActive,
  } 
  const response = await CommonPost('/api/Broker/SaveBroker', null, saveModel);
  
  return response;
}

async function GetBrokerList(groupID, factoryID) {
  const response = await CommonGet('/api/Broker/GetBrokerList', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  return response;
}

async function getBrokerDetailsByID(brokerID) {
  const response = await CommonGet('/api/Broker/GetBrokerDetailsByBrokerID', "brokerID=" + parseInt(brokerID));
  return response.data;
}

async function updateBroker(broker) {
  broker.brokerID = parseInt(broker.brokerID);

  const response = await CommonPost('/api/Broker/UpdateBroker', null, broker);
  return response;
}

import { CommonGet, CommonPost } from '../../../helpers/HttpClient';


export default {
  getAllGroups,
  getFactoryByGroupID,
  getSuppliersByGroupIDFactoryID,
  GetSupplierGrnItemDetails
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

async function getSuppliersByGroupIDFactoryID(groupID, factoryID) {
  let response = await CommonGet('/api/FactoryItemGrn/GetSuppliersByGroupIDAndFactoryID', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
  let supplierArray = [];
  for (let item of Object.entries(response.data)) {
    supplierArray[item[1]["supplierID"]] = item[1]["supplierName"];
  }
  return supplierArray;
}

async function GetSupplierGrnItemDetails(model) {
  let response = await CommonPost('/api/FactoryItemGrn/GetSupplierGrnItemDetails', null, model);
  return response;
}




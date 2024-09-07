import { CommonGet, CommonPost } from '../../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getRoutesForDropDown,
  GetSupplierMonthlyCrop,
  GetCustomerAccDetailsByRegNo
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

async function getRoutesForDropDown(factoryID) {
  var routeArray = [];

  const response = await CommonGet('/api/Group/GetRouteByFactoryID', 'factoryID=' + factoryID)
  for (let item of Object.entries(response.data)) {
    routeArray[item[1]["routeID"]] = item[1]["routeName"]
  }
  return routeArray;
}

async function GetSupplierMonthlyCrop(supplierCropDetailModel) {
  let response = await CommonPost('/api/SupplierMonthlyCrop/GetSupplierMonthlyCrop', null, supplierCropDetailModel);
  return response;
}

async function GetCustomerAccDetailsByRegNo(factoryID, groupID, registrationNumber) {
  const response = await CommonGet('/api/Customer/GetCustomerAccDetailsByRegNo', 'groupID=' + parseInt(groupID) + '&factoryID=' + parseInt(factoryID) + '&registrationNumber=' + registrationNumber);
  return response.data;
}

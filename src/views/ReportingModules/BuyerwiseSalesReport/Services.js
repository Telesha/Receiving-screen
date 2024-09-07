import { CommonGet, CommonPost } from '../../../helpers/HttpClient';


export default {
  getAllGroups,
  getFactoryByGroupID,
  getBuyerwiseSalesReport
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



async function getBuyerwiseSalesReport(model){
    let response = await CommonPost('/api/SalesReport/GetBuyerWiseSalesReport', null , model);
    return response;
}

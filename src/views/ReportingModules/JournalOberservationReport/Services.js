import { CommonGet, CommonPost } from '../../../helpers/HttpClient';


export default {
  getAllGroups,
  getFactoryByGroupID,
  GetJournalObservation,
  getVoucherCodeByDate
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


async function GetJournalObservation(model) {
  let response = await CommonPost('/api/JournalObservation/GetJournalObservation', null, model);
  return response;

}

async function getVoucherCodeByDate(voucherModel) {
  let response = await CommonPost('/api/JournalObservation/GetVoucherReferences', null, voucherModel);

  let voucherArray = [];
  for (let item of Object.entries(response.data)) {
    voucherArray[item[1]["voucherCode"]] = item[1]["voucherCode"];
  }
  return voucherArray;
}

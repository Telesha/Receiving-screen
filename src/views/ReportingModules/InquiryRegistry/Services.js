import { CommonGet, CommonPost } from '../../../helpers/HttpClient';
import moment from 'moment';

export default {
    getGroupsForDropdown,
    getFactoryByGroupID,
    GetLedgerAccountNamesandCodeForDropdown,
    getLedgerTrasactionDetails,
    findRelatedFinancialYearByDate
  };
  
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
  
  async function getFactoryByGroupID(groupID) {
    var factoryArray = [];
  
    const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
    for (let item of Object.entries(response.data)) {
      factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
    }
    return factoryArray;
  }

  async function GetLedgerAccountNamesandCodeForDropdown(groupID, factoryID) {
    var array = [];

    const response = await CommonGet('/api/InquiryRegistry/GetLedgerAccountNamesandCodeForDropdown',
      "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
    return response.data;
  } 

  async function getLedgerTrasactionDetails(inquiryRegistryModel) {
  
    let response = await CommonPost('/api/InquiryRegistry/GenerateLedgerAccountIquieryRegistry', null, inquiryRegistryModel);
    return response;
  }

  async function findRelatedFinancialYearByDate(groupID, factoryID, date) { 
    const response = await CommonGet('/api/FinancialYear/FindRelatedFinancialYearByDate',
      "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID)+ "&date=" + date);
    return response.data;
  }

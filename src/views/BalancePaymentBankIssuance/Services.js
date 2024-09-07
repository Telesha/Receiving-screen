import { CommonGet, CommonPost } from '../../helpers/HttpClient';

export default {
  getAllGroups,
  getFactoryByGroupID,
  getRoutesForDropDown,
  getBanksForDropdown,
  GetBankIssuanceDetails,
  ProceedBankIssuance,
  CheckISBalancePaymentCompleted
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

  async function getBanksForDropdown(factoryID) {
    var bankArray = [];
    const response = await CommonGet('/api/BankIssuance/GetBankByFactoryID', 'factoryID=' + factoryID);
    for (let item of Object.entries(response.data)) {
      bankArray[item[1]["bankID"]] = item[1]["bankName"];
    }
    return bankArray;
  }

  async function GetBankIssuanceDetails(bankIssuanceInputModel) { 
    let response = await CommonPost('/api/BankIssuance/GetBankIssuanceDetails', null, bankIssuanceInputModel);
    return response;
  }

  async function ProceedBankIssuance(bankIssuanceProceedModel) {
    let response = await CommonPost('/api/BankIssuance/ProceedBankIssuance', null, bankIssuanceProceedModel);
    return response;
  }

  async function CheckISBalancePaymentCompleted(groupID, factoryID) {
    const response = await CommonGet('/api/BalancePayment/CheckISBalancePaymentCompleted', "groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
    return response;
  }
import { CommonGet, CommonPost } from '../../../helpers/HttpClient'; 

export default { 

  getCustomerPreviousMonthPaymentFullDetails,
  getCustomerCurrentMonthPaymentFullDetails,
  getCurrentMinMaxRateByApplicableMonthAndYear
   
};
   
async function getCustomerPreviousMonthPaymentFullDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerPreviousMonthPaymentFullDetails', null, newModel)
  return response.data;
}

async function getCustomerCurrentMonthPaymentFullDetails(approveDetails) {

  let newModel = {
    groupID: parseInt(approveDetails.groupID),
    factoryID: parseInt(approveDetails.factoryID),
    nIC: approveDetails.nic == "" ? null : approveDetails.nic,
    RegistrationNumber: approveDetails.regNumber == "" ? null : approveDetails.regNumber
  }
  const response = await CommonPost('/api/AdvancePayment/GetCustomerCurrentMonthPaymentFullDetails', null, newModel)
  return response.data;
}

async function getCurrentMinMaxRateByApplicableMonthAndYear(factoryID) {
   
  const response = await CommonGet('/api/AdvancePayment/GetCurrentMinMaxRateByApplicableMonthAndYear', 'factoryID=' + factoryID)
  return response.data;
}

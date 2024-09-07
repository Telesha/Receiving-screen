import { CommonGet, CommonPost } from '../../../helpers/HttpClient';
import moment from 'moment';

export default {
  GetEmployeeSalaryAndAttendenceDetailsForCommonCard
};

async function GetEmployeeSalaryAndAttendenceDetailsForCommonCard(registrationNumber, date, divisionID) {
  const response = await CommonGet('/api/Employee/GetEmployeeSalaryAndAttendenceDetailsForCommonCard', "registrationNumber=" + registrationNumber + "&date=" + moment(date).format("YYYY-MM-DD") + "&divisionID=" + parseInt(divisionID))
  return response.data;
}


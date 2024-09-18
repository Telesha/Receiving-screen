import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
  MenuItem,
  Paper,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import {
  DatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import { useAlert } from 'react-alert';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  colorCancel: {
    backgroundColor: 'red'
  },
  colorRecord: {
    backgroundColor: 'green'
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: 'white',
  },
  stickyColumn: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    backgroundColor: 'white',
  },
}));

const screenCode = 'PAYMENTCHECKROLLSUMMARYREPORT2';

export default function PaymentCheckrollSummaryReport2(props) {
  const [title, setTitle] = useState('Payment Checkroll Summary Report 2');
  const classes = useStyles();
  const [payCheckRollReportDetail, setPayCheckRollReportDetail] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    year: new Date().getUTCFullYear().toString(),
    month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
  });
  const [estateList, setEstateList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [divisions, setDivision] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [payCheckRollReportData, setPayCheckRollReportData] = useState([]);
  const [groupedReportData, setGroupedReportData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [totalValues, setTotalValues] = useState([])
  const [fulltotalValues, setFullTotalValues] = useState({
        totalCashAdvance:0,
        totalLoan: 0,
        totalStamp: 0,
        totalTeaRecovery: 0,
        totalWelfare: 0,
        totalCrenchFund: 0,
        totalFuneralFund: 0,
        totalUnionRecovery: 0,
        totalElectricityRecovery: 0,
        totalPayCards: 0,
        totalCoopMembership: 0,
        totalCoopShopRecovery: 0,
        totalTempleRecovery: 0,
        totalInsuranceRecovery: 0,
        totalDhoby: 0,
        totalBaber: 0,
        totalWaterSchemeRecovery: 0,
        totalFoodStuffRecovery: 0,
        totalFine: 0,
        totalOtherRecovery: 0,
        totalToolsRecovery: 0,
        totalFestivalAdvanceRecovery: 0,
        totalOtherDeductions: 0,
        totalEPFAmount: 0
      })
  const [deductDetailsList, setDeductDetailsList] = useState([]);
  const navigate = useNavigate();
  const [isTableHide, setIsTableHide] = useState(false);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    divisionID: "0",
    estateID: "0",
    groupID: "0",
    year: '',
    month: ''
  });

  const componentRef = useRef();
  const alert = useAlert();
  const [alertCount, setAlertCount] = useState({
    count: 0
  });

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
    setAlertCount({
      count: 1
    });
  }, []);

  useEffect(() => {
    getEstatesForDropdoen();
    trackPromise(
      getEstatesForDropdoen(payCheckRollReportDetail.groupID)
    )
    setAlertCount({
      count: alertCount.count + 1
    });
  }, [payCheckRollReportDetail.groupID]);

  useEffect(() => {
    trackPromise(getDivisionByEstateID(payCheckRollReportDetail.estateID));
  }, [payCheckRollReportDetail.estateID]);

  useEffect(() => {
    trackPromise(getDivisionByEstateID());
  }, [payCheckRollReportDetail.divisionID]);

  useEffect(() => {
    setSelectedDate(new Date())
  }, [payCheckRollReportDetail.divisionID]);

  useEffect(() => {
    setIsTableHide(false);
  }, [payCheckRollReportDetail.divisionID, payCheckRollReportDetail.month, payCheckRollReportDetail.year]);

  useEffect(() => {
    if (groupedReportData.length != 0) {
      calculateTotalQty()
      calculateTotal()
    }
  }, [groupedReportData]);

  useEffect(() => {
    if (payCheckRollReportData.length != 0) {
      calculateTotal()
    }
  }, [payCheckRollReportData]);

  useEffect(() => {
    const currentDate = new Date();
    const previousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    setSelectedDate(previousMonth);
  }, []);

  useEffect(() => {
    setPayCheckRollReportData([...deductDetailsList]);
  }, [deductDetailsList]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPAYMENTCHECKROLLSUMMARYREPORT2'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setPayCheckRollReportDetail({
      ...payCheckRollReportDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setPayCheckRollReportDetail({
      ...payCheckRollReportDetail,
      [e.target.name]: value
    });
    setPayCheckRollReportData([]);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getEstatesForDropdoen() {
    const estates = await services.getEstateDetailsByGroupID(payCheckRollReportDetail.groupID);
    setEstateList(estates);
  }

  async function getDivisionByEstateID() {
    const divisions = await services.getDivisionByEstateID(payCheckRollReportDetail.estateID);
    setDivision(divisions);
  };

  async function GetDetails() {
    let model = {
      groupID: parseInt(payCheckRollReportDetail.groupID),
      estateID: parseInt(payCheckRollReportDetail.estateID),
      divisionID: parseInt(payCheckRollReportDetail.divisionID),
      year: payCheckRollReportDetail.year.toString(),
      month: payCheckRollReportDetail.month.toString(),
    };
    const customerData = await services.GetPaymentCheckrollSummaryReport2(model);
    getSelectedDropdownValuesForReport(model);

    if (customerData.statusCode == 'Success' && customerData.data.length != 0) {
      const groupedDeductDetails = {};

      customerData.data.forEach((x) => {
        x.details.forEach((y) => {
          const key = y.registrationNumber;
          if (!groupedDeductDetails[key]) {
            groupedDeductDetails[key] = {
              registrationNumber: y.registrationNumber,
              employeeName: y.employeeName,
              division: y.divisionName,
              cashAdvance: y.cashAdvance,
              loan: y.loan,
              epfAmount: y.epfAmount,
              stamp: 0,
              teaRecovery: 0,
              welfare: 0,
              crenchFund: 0,
              funeralFund: 0,
              unionRecovery: 0,
              electricityRecovery: 0,
              payCards: 0,
              coopMembership: 0,
              coopShopRecovery: 0,
              templeRecovery: 0,
              insuranceRecovery: 0,
              dhoby: 0,
              baber: 0,
              waterSchemeRecovery: 0,
              foodStuffRecovery: 0,
              fine: 0,
              otherRecovery: 0,
              toolsRecovery: 0,
              festivalAdvanceRecovery: 0,
              festivalSavings: 0,
              foodPack: 0,
              transport: 0,
              bankLoan: 0,
              saving: 0,
              otherDeductions: 0
            };
          }

          switch (y.deductionTypeID) {
            case 2:
              groupedDeductDetails[key].stamp += y.deductionAmount;
              break;
            case 3:
              groupedDeductDetails[key].welfare += y.deductionAmount;
              break;
            case 4:
              groupedDeductDetails[key].teaRecovery += y.deductionAmount;
              break;
            case 5:
              groupedDeductDetails[key].crenchFund += y.deductionAmount;
              break;
            case 6:
              groupedDeductDetails[key].funeralFund += y.deductionAmount;
              break;
            case 7:
              groupedDeductDetails[key].unionRecovery += y.deductionAmount;
              break;
            case 8:
              groupedDeductDetails[key].electricityRecovery += y.deductionAmount;
              break;
            case 9:
              groupedDeductDetails[key].payCards += y.deductionAmount;
              break;
            case 10:
              groupedDeductDetails[key].coopMembership += y.deductionAmount;
              break;
            case 11:
              groupedDeductDetails[key].coopShopRecovery += y.deductionAmount;
              break;
            case 12:
              groupedDeductDetails[key].templeRecovery += y.deductionAmount;
              break;
            case 13:
              groupedDeductDetails[key].insuranceRecovery += y.deductionAmount;
              break;
            case 14:
              groupedDeductDetails[key].dhoby += y.deductionAmount;
              break;
            case 15:
              groupedDeductDetails[key].baber += y.deductionAmount;
              break;
            case 16:
              groupedDeductDetails[key].waterSchemeRecovery += y.deductionAmount;
              break;
            case 17:
              groupedDeductDetails[key].foodStuffRecovery += y.deductionAmount;
              break;
            case 18:
              groupedDeductDetails[key].fine += y.deductionAmount;
              break;
            case 19:
              groupedDeductDetails[key].otherRecovery += y.deductionAmount;
              break;
            case 20:
              groupedDeductDetails[key].toolsRecovery += y.deductionAmount;
              break;
            case 21:
              groupedDeductDetails[key].festivalAdvanceRecovery += y.deductionAmount;
              break;
            case 22:
              groupedDeductDetails[key].festivalSavings += y.deductionAmount;
              break;
            case 23:
              groupedDeductDetails[key].foodPack += y.deductionAmount;
              break;
            case 24:
              groupedDeductDetails[key].transport += y.deductionAmount;
              break;
            case 26:
              groupedDeductDetails[key].bankLoan += y.deductionAmount;
              break;
            case 27:
              groupedDeductDetails[key].saving += y.deductionAmount;
              break;
            default:
              break;
          }
          groupedDeductDetails[key].otherDeductions = (parseFloat(groupedDeductDetails[key].festivalSavings) + parseFloat(groupedDeductDetails[key].foodPack) + parseFloat(groupedDeductDetails[key].transport) + parseFloat(groupedDeductDetails[key].bankLoan) + parseFloat(groupedDeductDetails[key].saving));
        });
      });

      const groupedDeductDetailsList = Object.values(groupedDeductDetails);
      const groupedData = groupedDeductDetailsList.reduce((acc, item) => {
        if (!acc[item.division]) {
          acc[item.division] = [];
        }
        acc[item.division].push(item);
        return acc;
      }, {});

      setGroupedReportData(groupedData)
      setDeductDetailsList(groupedDeductDetailsList);
      setPayCheckRollReportData(customerData.data);
      setIsTableHide(true);
    }
    else {
      alert.error('NO RECORDS TO DISPLAY');
    }
  }

  function calculateTotalQty() {
    let totalVal = []
    for (let item of Object.entries(groupedReportData)) {
      const totalCashAdvance = item[1].reduce((accumulator, current) => accumulator + current.cashAdvance, 0);
      const totalLoan = item[1].reduce((accumulator, current) => accumulator + current.loan, 0);
      const totalStamp = item[1].reduce((accumulator, current) => accumulator + (current.stamp), 0);
      const totalTeaRecovery = item[1].reduce((accumulator, current) => accumulator + (current.teaRecovery), 0);
      const totalWelfare = item[1].reduce((accumulator, current) => accumulator + (current.welfare), 0);
      const totalCrenchFund = item[1].reduce((accumulator, current) => accumulator + (current.crenchFund), 0);
      const totalFuneralFund = item[1].reduce((accumulator, current) => accumulator + (current.funeralFund), 0);
      const totalUnionRecovery = item[1].reduce((accumulator, current) => accumulator + (current.unionRecovery), 0);
      const totalElectricityRecovery = item[1].reduce((accumulator, current) => accumulator + (current.electricityRecovery), 0);
      const totalPayCards = item[1].reduce((accumulator, current) => accumulator + (current.payCards), 0);
      const totalCoopMembership = item[1].reduce((accumulator, current) => accumulator + (current.coopMembership), 0);
      const totalCoopShopRecovery = item[1].reduce((accumulator, current) => accumulator + (current.coopShopRecovery), 0);
      const totalTempleRecovery = item[1].reduce((accumulator, current) => accumulator + (current.templeRecovery), 0);
      const totalInsuranceRecovery = item[1].reduce((accumulator, current) => accumulator + (current.insuranceRecovery), 0);
      const totalDhoby = item[1].reduce((accumulator, current) => accumulator + (current.dhoby), 0);
      const totalBaber = item[1].reduce((accumulator, current) => accumulator + (current.baber), 0);
      const totalWaterSchemeRecovery = item[1].reduce((accumulator, current) => accumulator + (current.waterSchemeRecovery), 0);
      const totalFoodStuffRecovery = item[1].reduce((accumulator, current) => accumulator + (current.foodStuffRecovery), 0);
      const totalFine = item[1].reduce((accumulator, current) => accumulator + (current.fine), 0);
      const totalOtherRecovery = item[1].reduce((accumulator, current) => accumulator + (current.otherRecovery), 0);
      const totalToolsRecovery = item[1].reduce((accumulator, current) => accumulator + (current.toolsRecovery), 0);
      const totalFestivalAdvanceRecovery = item[1].reduce((accumulator, current) => accumulator + (current.festivalAdvanceRecovery), 0);
      const totalOtherDeductions = item[1].reduce((accumulator, current) => accumulator + (current.otherDeductions), 0);
      const totalEPFAmount = item[1].reduce((accumulator, current) => accumulator + current.epfAmount, 0);

      let model = {
        division: item[0],
        totalCashAdvance: totalCashAdvance,
        totalLoan: totalLoan,
        totalStamp: totalStamp,
        totalTeaRecovery: totalTeaRecovery,
        totalWelfare: totalWelfare,
        totalCrenchFund: totalCrenchFund,
        totalFuneralFund: totalFuneralFund,
        totalUnionRecovery: totalUnionRecovery,
        totalElectricityRecovery: totalElectricityRecovery,
        totalPayCards: totalPayCards,
        totalCoopMembership: totalCoopMembership,
        totalCoopShopRecovery: totalCoopShopRecovery,
        totalTempleRecovery: totalTempleRecovery,
        totalInsuranceRecovery: totalInsuranceRecovery,
        totalDhoby: totalDhoby,
        totalBaber: totalBaber,
        totalWaterSchemeRecovery: totalWaterSchemeRecovery,
        totalFoodStuffRecovery: totalFoodStuffRecovery,
        totalFine: totalFine,
        totalOtherRecovery: totalOtherRecovery,
        totalToolsRecovery: totalToolsRecovery,
        totalFestivalAdvanceRecovery: totalFestivalAdvanceRecovery,
        totalOtherDeductions: totalOtherDeductions,
        totalEPFAmount: totalEPFAmount
      }
      totalVal.push(model)
    }
    setTotalValues(totalVal)
  }

  function calculateTotal() {
    
      const totalCashAdvance = payCheckRollReportData.reduce((accumulator, current) => accumulator + current.cashAdvance, 0);
      const totalLoan = payCheckRollReportData.reduce((accumulator, current) => accumulator + current.loan, 0);
      const totalStamp = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.stamp), 0);
      const totalTeaRecovery = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.teaRecovery), 0);
      const totalWelfare = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.welfare), 0);
      const totalCrenchFund = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.crenchFund), 0);
      const totalFuneralFund = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.funeralFund), 0);
      const totalUnionRecovery = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.unionRecovery), 0);
      const totalElectricityRecovery = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.electricityRecovery), 0);
      const totalPayCards = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.payCards), 0);
      const totalCoopMembership = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.coopMembership), 0);
      const totalCoopShopRecovery = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.coopShopRecovery), 0);
      const totalTempleRecovery = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.templeRecovery), 0);
      const totalInsuranceRecovery = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.insuranceRecovery), 0);
      const totalDhoby = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.dhoby), 0);
      const totalBaber = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.baber), 0);
      const totalWaterSchemeRecovery = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.waterSchemeRecovery), 0);
      const totalFoodStuffRecovery = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.foodStuffRecovery), 0);
      const totalFine = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.fine), 0);
      const totalOtherRecovery = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.otherRecovery), 0);
      const totalToolsRecovery = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.toolsRecovery), 0);
      const totalFestivalAdvanceRecovery = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.festivalAdvanceRecovery), 0);
      const totalOtherDeductions = payCheckRollReportData.reduce((accumulator, current) => accumulator + (current.otherDeductions), 0);
      const totalEPFAmount = payCheckRollReportData.reduce((accumulator, current) => accumulator + current.epfAmount, 0);

      setFullTotalValues({
        ...fulltotalValues,
        totalCashAdvance: totalCashAdvance,
        totalLoan: totalLoan,
        totalStamp: totalStamp,
        totalTeaRecovery: totalTeaRecovery,
        totalWelfare: totalWelfare,
        totalCrenchFund: totalCrenchFund,
        totalFuneralFund: totalFuneralFund,
        totalUnionRecovery: totalUnionRecovery,
        totalElectricityRecovery: totalElectricityRecovery,
        totalPayCards: totalPayCards,
        totalCoopMembership: totalCoopMembership,
        totalCoopShopRecovery: totalCoopShopRecovery,
        totalTempleRecovery: totalTempleRecovery,
        totalInsuranceRecovery: totalInsuranceRecovery,
        totalDhoby: totalDhoby,
        totalBaber: totalBaber,
        totalWaterSchemeRecovery: totalWaterSchemeRecovery,
        totalFoodStuffRecovery: totalFoodStuffRecovery,
        totalFine: totalFine,
        totalOtherRecovery: totalOtherRecovery,
        totalToolsRecovery: totalToolsRecovery,
        totalFestivalAdvanceRecovery: totalFestivalAdvanceRecovery,
        totalOtherDeductions: totalOtherDeductions,
        totalEPFAmount: totalEPFAmount
      })
  }

  const groupedData = totalValues.reduce((acc, item) => {
    if (!acc[item.division]) {
      acc[item.division] = [];
    }
    acc[item.division].push(item);
    return acc;
  }, {});

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      Object.keys(array).map((division, catIndex) => (
        array[division].map((x, i) => {
          var vr = {
            'Employee No': x.registrationNumber,
            'Employee Name': x.employeeName,
            'Loan (Rs.)': x.loan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Stamp (Rs.)': x.stamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Tea Recovery (Rs.)': x.teaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Welfare (Rs.)': x.welfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Crech Fund (Rs.)': x.crenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Funeral Fund (Rs.)': x.funeralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Union Recovery (Rs.)': x.unionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Electricity Recovery (Rs.)': x.electricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Pay Cards (Rs.)': x.payCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Co op Membership (Rs.)': x.coopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Co op Shop Recovery (Rs.)': x.coopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Temple Recovery (Rs.)': x.templeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Insurance Recovery (Rs.)': x.insuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Dhoby (Rs.)': x.dhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Baber (Rs.)': x.baber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Water Scheme Recovery (Rs.)': x.waterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Fine (Rs.)': x.fine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Other Recovery (Rs.)': x.otherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Tools Recovery (Rs.)': x.toolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Festival Advance Recovery (Rs.)': x.festivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Other Deductions (Rs.)': x.otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'EPF (10%)': x.epfAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          }
          res.push(vr);
        }),
        groupedData[division].map((row, i) => {
          var vr = {
            'Employee No': 'Total',
            'Loan (Rs.)': row.totalLoan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Stamp (Rs.)': row.totalStamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Tea Recovery (Rs.)': row.totalTeaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Welfare (Rs.)': row.totalWelfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Crech Fund (Rs.)': row.totalCrenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Funeral Fund (Rs.)': row.totalFuneralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Union Recovery (Rs.)': row.totalUnionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Electricity Recovery (Rs.)': row.totalElectricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Pay Cards (Rs.)': row.totalPayCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Co op Membership (Rs.)': row.totalCoopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Co op Shop Recovery (Rs.)': row.totalCoopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Temple Recovery (Rs.)': row.totalTempleRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Insurance Recovery (Rs.)': row.totalInsuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Dhoby (Rs.)': row.totalDhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Baber (Rs.)': row.totalBaber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Water Scheme Recovery (Rs.)': row.totalWaterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Fine (Rs.)': row.totalFine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Other Recovery (Rs.)': row.totalOtherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Tools Recovery (Rs.)': row.totalToolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Festival Advance Recovery (Rs.)': row.totalFestivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'Other Deductions (Rs.)': row.totalOtherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'EPF (10%)': row.totalEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          };
          res.push(vr);
        })
      ))

      res.push({});
      var vr = {
        'Employee No': 'Group : ' + selectedSearchValues.groupID,
        'Employee Name': 'Estate : ' + selectedSearchValues.estateID,
        'Cash Advance (Rs.)': 'Division : ' + selectedSearchValues.divisionID,
        'Loan (Rs.)': 'Year & Month : ' + (payCheckRollReportDetail.year) + '/' + (payCheckRollReportDetail.month),
      };
      res.push(vr);
    }

    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(groupedReportData);
    var settings = {
      sheetName: 'Pay CheckRoll',
      fileName: 'Payment CheckRoll Summary Report 2 - ' + payCheckRollReportDetail.month + '/' + payCheckRollReportDetail.year,
      writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Payment CheckRoll Summary 2',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
  }

  function handleDateChange(date) {
    let monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    var month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); //months from 1-12
    var year = date.getUTCFullYear();
    let monthName = monthNames[month - 1];
    console.log(monthName)
    setSelectedSearchValues({
      ...selectedSearchValues,
      monthName: monthName
    });
    setPayCheckRollReportDetail({
      ...payCheckRollReportDetail,
      month: month.toString(),
      year: year.toString()
    });
    setSelectedDate(date);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      estateID: estateList[searchForm.estateID],
      groupID: GroupList[searchForm.groupID],
      divisionID: divisions[searchForm.divisionID] == 0 ? 'All' : divisions[searchForm.divisionID],
      year: searchForm.year,
      month: searchForm.month
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    );
  }

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: payCheckRollReportDetail.groupID,
              estateID: payCheckRollReportDetail.estateID,
              divisionID: payCheckRollReportDetail.divisionID
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group required')
                .min('1', 'Group required'),
              estateID: Yup.number()
                .required('Estate required')
                .min('1', 'Factory required'),
            })}
            enableReinitialize
          >
            {({ errors, handleBlur, handleSubmit, touched }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={payCheckRollReportDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                              }}
                              size="small"
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={payCheckRollReportDetail.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                              size="small"
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(estateList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="divisionID">
                              Division
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.divisionID && errors.divisionID)}
                              fullWidth
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              onChange={e => handleChange(e)}
                              value={payCheckRollReportDetail.divisionID}
                              variant="outlined"
                              id="divisionID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="inline"
                                openTo="month"
                                views={["year", "month"]}
                                label="Year and Month *"
                                helperText="Select applicable month"
                                value={selectedDate}
                                disableFuture={true}
                                onChange={date => handleDateChange(date)}
                                size="small"
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>

                        <Grid container justify="flex-end">
                          <Box pt={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type='submit'
                              onClick={() => trackPromise(GetDetails())}
                            >
                              Search
                            </Button>
                          </Box>
                        </Grid>
                        <br></br>
                        <br></br>
                        <br></br>
                        <Box minWidth={1050}>
                          {payCheckRollReportData.length > 0 && isTableHide ?
                            <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                              <Table className={classes.table} aria-label="sticky table" stickyHeader size="small" Table>
                                <TableHead style={{ position: "sticky", top: 0, zIndex: 1000, background: "white" }}>
                                  <TableRow style={{ border: "2px solid black" }}>
                                    <TableCell align="center" className={classes.sticky} rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Emp. No.</TableCell>
                                    <TableCell align="center" className={classes.sticky} rowSpan={2} style={{ left: 79, fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Employee Name</TableCell>
                                    <TableCell align="center" className={`${classes.stickyHeader}`} rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Loan (Rs.)</TableCell>
                                    <TableCell align="center" className={`${classes.stickyHeader}`} colSpan={20} style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Deductions</TableCell>
                                    <TableCell align="center" className={`${classes.stickyHeader}`} rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>EPF (10%)</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Stamp (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Tea Recovery (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Welfare (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Crech Fund (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Funeral Fund (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Union Recovery (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Electricity Recovery (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Pay Cards (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Co op Membership (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Co op Shop Recovery (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Temple Recovery (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Insurance Recovery (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Dhoby (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Baber (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Water Scheme Recovery (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Fine (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Other Recovery (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Tools Recovery (Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Festival Advance Recovery(Rs.)</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Other Deductions(Rs.)</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {Object.keys(groupedReportData).map((division, catIndex) => (
                                    <React.Fragment key={catIndex}>
                                      <TableRow>
                                        <TableCell colSpan={20} align="left" style={{ fontWeight: 'bold', border: "1px solid black" }}>
                                          {division}
                                        </TableCell>
                                      </TableRow>
                                      {groupedReportData[division].map((row, i) => {
                                        const labelId = `enhanced-table-checkbox-${catIndex}-${i}`;
                                        return (
                                          <TableRow style={{ border: "2px solid black" }} key={i}>
                                            <TableCell component="th" id={labelId} scope="row" className={`${classes.stickyColumn}`} align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" className={`${classes.stickyColumn}`} align="left" style={{ left: 79, border: "1px solid black" }}> {row.employeeName}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.loan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.stamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.teaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.welfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.crenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.funeralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.unionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.electricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.payCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.coopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.coopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.templeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.insuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.dhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.baber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.waterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.fine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.otherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.toolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.festivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.epfAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                          </TableRow>
                                        )
                                      })}
                                      {groupedData[division].map((row, i) => {
                                        return (
                                          <TableRow style={{ border: "2px solid black" }}>
                                            <TableCell className={`${classes.stickyColumn}`} colSpan={2} align={'center'} style={{ borderBottom: "none", border: "1px solid black", fontSize: '16px', color: "black" }} ><b><strong>Sub Total</strong></b></TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalLoan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalStamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalTeaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalWelfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalCrenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalFuneralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalUnionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalElectricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalPayCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalCoopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalCoopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalTempleRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalInsuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalDhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalBaber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalWaterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalFine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalOtherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalToolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalFestivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalOtherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                          </TableRow>
                                        )
                                      })}
                                    </React.Fragment>
                                  ))}
                                  {payCheckRollReportDetail.divisionID == 0 ? 
                                  <TableRow style={{ border: "2px solid black" }}>
                                    <TableCell className={`${classes.stickyColumn}`} colSpan={2} align={'center'} style={{ borderBottom: "none", border: "1px solid black", fontSize: '16px', color: "red" }} ><b><strong>Total</strong></b></TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalLoan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalStamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalTeaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalWelfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalCrenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalFuneralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalUnionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalElectricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalPayCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalCoopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalCoopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalTempleRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalInsuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalDhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalBaber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalWaterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalFine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalOtherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalToolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalFestivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalOtherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                  </TableRow>
                                  :null}
                                </TableBody>
                              </Table>
                            </TableContainer>
                            : null}
                        </Box>
                      </CardContent>

                      {payCheckRollReportData.length > 0 && isTableHide ? (
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          {payCheckRollReportDetail.divisionID != 0 ?
                            <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorRecord}
                              onClick={createFile}
                              size="small"
                            >
                              EXCEL
                            </Button>
                            : null}
                          <div>&nbsp;</div>

                          {<ReactToPrint
                            documentTitle={'Payment CheckRoll Summary Report 2'}
                            trigger={() => (
                              <Button
                                color="primary"
                                id="btnRecord"
                                type="submit"
                                variant="contained"
                                style={{ marginRight: '1rem' }}
                                className={classes.colorCancel}
                                size="small"
                              >
                                PDF
                              </Button>
                            )}
                            content={() => componentRef.current}
                          />}
                          {<div hidden={true}>
                            <CreatePDF
                              ref={componentRef}
                              selectedSearchValues={selectedSearchValues}
                              payCheckRollReportDetail={payCheckRollReportDetail}
                              payCheckRollReportData={groupedReportData}
                              totalValues={groupedData}
                              fulltotalValues={fulltotalValues}
                            />
                          </div>}
                        </Box>
                      ) : null}
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
}

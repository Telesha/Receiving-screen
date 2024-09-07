import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Button,
    makeStyles,
    Container,
    Divider,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    MenuItem,
    Paper,
    InputLabel, Table, TableBody, TableCell, TableContainer, TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import TableHead from '@material-ui/core/TableHead';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import { useAlert } from "react-alert";
import _ from 'lodash';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const useStyles = makeStyles((theme) => ({
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
        backgroundColor: "red",
    },
    colorRecordAndNew: {
        backgroundColor: "#FFBE00"
    },
    colorRecord: {
        backgroundColor: "green",
    },
    stickyHeader: {
        position: 'sticky',
        left: 0,
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

const screenCode = 'PAYMENTCHECKROLLSUMMARYREPORTREVAMP';

export default function PaymentCheckrollSummaryReport1() {
    const [title, setTitle] = useState("Payment Checkroll Summary Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState();
    const [divisions, setDivisions] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [reportDetails, setReportDetails] = useState([]);
    const [totalValues, setTotalValues] = useState({});
    const [paymentCheckrollSummaryInput, setPaymentCheckrollSummaryInput] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        estateID: 0,
        groupID: 0,
        divisionID: 0,
        year: '',
        month: ''
    })

    const navigate = useNavigate();
    const alert = useAlert();
    const componentRef = useRef();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [paymentCheckrollSummaryInput.groupID]);

    useEffect(() => {
        trackPromise(getDivisionDetailsByEstateID());
    }, [paymentCheckrollSummaryInput.estateID]);

    useEffect(() => {
        if (reportDetails.length != 0) {
            calculateTotalQty()
        }
    }, [reportDetails]);

    useEffect(() => {
        setDate()
    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPAYMENTCHECKROLLSUMMARYREPORTREVAMP');

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

        setPaymentCheckrollSummaryInput({
            ...paymentCheckrollSummaryInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(
            paymentCheckrollSummaryInput.groupID
        );
        setEstates(response);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(
            paymentCheckrollSummaryInput.estateID
        );
        setDivisions(response);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(paymentCheckrollSummaryInput.groupID),
            estateID: parseInt(paymentCheckrollSummaryInput.estateID),
            divisionID: parseInt(paymentCheckrollSummaryInput.divisionID),
            month: paymentCheckrollSummaryInput.month.toString(),
            year: paymentCheckrollSummaryInput.year.toString(),
        }
        getSelectedDropdownValuesForReport(model);

        const response = await services.getPaymentCheckrollSummaryDetails(model);
        if (response.statusCode == "Success" && response.data.wages != null) {
            response.data.wages.forEach(element => {
                element.balanceCFAmount = element.balance - element.paybleAmount
            });
            const groupedDeductDetails = {};

            response.data.deductions.forEach((x) => {
                x.details.forEach((y) => {
                    const key = y.registrationNumber;
                    if (!groupedDeductDetails[key]) {
                        groupedDeductDetails[key] = {
                            registrationNumber: y.registrationNumber,
                            employeeName: y.employeeName,
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

            //SOULUTION TO THE CUURENT PROBLEM
            const groupedWages = _.groupBy(response.data.wages, 'registrationNumber');

            const summedWages = _.mapValues(groupedWages, (wagesArray) => {
                return wagesArray.reduce((acc, wage) => {
                    acc.normalDays = wage.normalDays || 0;
                    acc.holiday = wage.holiday || 0;
                    acc.totalWages += wage.totalWages || 0;
                    acc.overKiloAmount += wage.overKiloAmount || 0;
                    acc.otAmount += wage.otAmount || 0;
                    acc.cashKiloAmount += wage.cashKiloAmount || 0;
                    acc.cashWorkDays += wage.cashWorkDays || 0;
                    acc.cashJobAmount += wage.cashJobAmount || 0;
                    acc.holidayAmount += wage.holidayAmount || 0;
                    acc.bfAmount += wage.bfAmount || 0;
                    acc.grossAmount += wage.grossAmount || 0;
                    acc.deductionAmount += wage.deductionAmount || 0;
                    acc.balance += wage.balance || 0;
                    acc.paybleAmount += wage.paybleAmount || 0;
                    acc.balanceCFAmount += wage.balanceCFAmount || 0;
                    acc.employerEPFAmount += wage.employerEPFAmount || 0;
                    acc.employerETFAmount += wage.employerETFAmount || 0;
                    acc.partPayment1 += wage.partPayment1 || 0;
                    acc.partPayment2 += wage.partPayment2 || 0;
                    acc.otherEarningAmount += wage.otherEarningAmount || 0;
                    acc.cashAdvance += wage.cashAdvance || 0;
                    acc.loan += wage.loan || 0;
                    acc.epfAmount += wage.epfAmount || 0;
                    acc.cashDayPluckingAmount += wage.cashDayPluckingAmount || 0;


                    acc.registrationNumber = wage.registrationNumber;
                    acc.employeeID = acc.employeeID || wage.employeeID;
                    acc.employeeName = acc.employeeName || wage.employeeName;
                    acc.deductionTypeID = acc.deductionTypeID || wage.deductionTypeID;
                    acc.deductionTypeCode = acc.deductionTypeCode || wage.deductionTypeCode;
                    acc.deductionTypeName = acc.deductionTypeName || wage.deductionTypeName;

                    return acc;
                }, {
                    ...wagesArray[0],
                    normalDays: 0, holiday: 0, totalWages: 0, overKiloAmount: 0, otAmount: 0,
                    cashKiloAmount: 0, cashWorkDays: 0, cashJobAmount: 0, holidayAmount: 0,
                    bfAmount: 0, grossAmount: 0, deductionAmount: 0, balance: 0,
                    paybleAmount: 0, balanceCFAmount: 0, employerEPFAmount: 0, employerETFAmount: 0,
                    partPayment1: 0, partPayment2: 0, otherEarningAmount: 0, cashAdvance: 0,
                    loan: 0, epfAmount: 0, cashDayPluckingAmount: 0
                });
            });

            const summedWagesArray = Object.values(summedWages);

            const joinedArray = _.merge(_.keyBy(groupedDeductDetailsList, 'registrationNumber'), _.keyBy(summedWagesArray, 'registrationNumber'));
            //var joinedArray = _.merge(_.keyBy(groupedDeductDetailsList, 'registrationNumber'), _.keyBy(response.data.wages, 'registrationNumber'));

            var joinedResult = [];
            var finalResult = [];

            Object.keys(joinedArray).forEach(x => joinedResult.push(joinedArray[x]));
            joinedResult.forEach(x => {
                finalResult.push(x);
            });

            setReportDetails(finalResult)
            createDataForExcel(finalResult);
            if (response.data.wages.length == 0 && response.data.deductions.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error(response.message);
        }
    }

    const calculateTotalDeductions = (data) => {
        return data.stamp + data.teaRecovery + data.welfare + data.crenchFund + data.funeralFund +
            data.unionRecovery + data.electricityRecovery + data.payCards + data.coopMembership +
            data.coopShopRecovery + data.templeRecovery + data.insuranceRecovery + data.dhoby + data.baber +
            data.waterSchemeRecovery + data.fine + data.otherRecovery + data.toolsRecovery +
            data.festivalAdvanceRecovery + data.otherDeductions + data.epfAmount;
    };

    const totalSumOfDeductions = reportDetails.reduce((total, data) => {
        return (total + calculateTotalDeductions(data));
    }, 0);

    function calculateTotalQty() {
        const totalNormalDays = reportDetails.reduce((accumulator, current) => accumulator + current.normalDays, 0);
        const totalHolidays = reportDetails.reduce((accumulator, current) => accumulator + current.holiday, 0);
        const totalWages = reportDetails.reduce((accumulator, current) => accumulator + current.totalWages, 0);
        const totalOverKiloAmount = reportDetails.reduce((accumulator, current) => accumulator + current.overKiloAmount, 0);
        const totalOtAmount = reportDetails.reduce((accumulator, current) => accumulator + current.otAmount, 0);
        const totalCashKiloAmount = reportDetails.reduce((accumulator, current) => accumulator + current.cashKiloAmount, 0);
        const totalDayCashPluckingAmount = reportDetails.reduce((accumulator, current) => accumulator + current.cashDayPluckingAmount, 0);
        const totalCashWorkDays = reportDetails.reduce((accumulator, current) => accumulator + current.cashWorkDays, 0);
        const totalCashJobAmount = reportDetails.reduce((accumulator, current) => accumulator + current.cashJobAmount, 0);
        const totalOtherEarningAmount = reportDetails.reduce((accumulator, current) => accumulator + current.otherEarningAmount, 0);
        const totalHolidayAmount = reportDetails.reduce((accumulator, current) => accumulator + current.holidayAmount, 0);
        const totalBFAmount = reportDetails.reduce((accumulator, current) => accumulator + current.bfAmount, 0);
        const totalGrossAmount = reportDetails.reduce((accumulator, current) => accumulator + current.grossAmount, 0);

        const totalStamp = reportDetails.reduce((accumulator, current) => accumulator + current.stamp, 0);
        const totalTeaRecovery = reportDetails.reduce((accumulator, current) => accumulator + current.teaRecovery, 0);
        const totalWelfare = reportDetails.reduce((accumulator, current) => accumulator + current.welfare, 0);
        const totalCrenchFund = reportDetails.reduce((accumulator, current) => accumulator + current.crenchFund, 0);
        const totalFuneralFund = reportDetails.reduce((accumulator, current) => accumulator + current.funeralFund, 0);
        const totalUnionRecovery = reportDetails.reduce((accumulator, current) => accumulator + current.unionRecovery, 0);
        const totalElectricityRecovery = reportDetails.reduce((accumulator, current) => accumulator + current.electricityRecovery, 0);
        const totalPayCards = reportDetails.reduce((accumulator, current) => accumulator + current.payCards, 0);
        const totalCoopMembership = reportDetails.reduce((accumulator, current) => accumulator + current.coopMembership, 0);
        const totalCoopShopRecovery = reportDetails.reduce((accumulator, current) => accumulator + current.coopShopRecovery, 0);
        const totalTempleRecovery = reportDetails.reduce((accumulator, current) => accumulator + current.templeRecovery, 0);
        const totalInsuranceRecovery = reportDetails.reduce((accumulator, current) => accumulator + current.insuranceRecovery, 0);
        const totalDhoby = reportDetails.reduce((accumulator, current) => accumulator + current.dhoby, 0);
        const totalBaber = reportDetails.reduce((accumulator, current) => accumulator + current.baber, 0);
        const totalWaterSchemeRecovery = reportDetails.reduce((accumulator, current) => accumulator + current.waterSchemeRecovery, 0);
        const totalFine = reportDetails.reduce((accumulator, current) => accumulator + current.fine, 0);
        const totalOtherRecovery = reportDetails.reduce((accumulator, current) => accumulator + current.otherRecovery, 0);
        const totalToolsRecovery = reportDetails.reduce((accumulator, current) => accumulator + current.toolsRecovery, 0);
        const totalFestivalAdvanceRecovery = reportDetails.reduce((accumulator, current) => accumulator + current.festivalAdvanceRecovery, 0);
        const totalOtherDeductions = reportDetails.reduce((accumulator, current) => accumulator + current.otherDeductions, 0);
        const totalEPF10Amount = reportDetails.reduce((accumulator, current) => accumulator + current.epfAmount, 0);

        const totalBalance = reportDetails.reduce((accumulator, current) => accumulator + current.balance, 0);
        const totalPaybleAmount = reportDetails.reduce((accumulator, current) => accumulator + current.paybleAmount, 0);
        const totalBalanceCFAmount = reportDetails.reduce((accumulator, current) => accumulator + current.balanceCFAmount, 0);
        const totalEPFAmount = reportDetails.reduce((accumulator, current) => accumulator + current.employerEPFAmount, 0);
        const totalETFAmount = reportDetails.reduce((accumulator, current) => accumulator + current.employerETFAmount, 0);
        const totalPartPayment1 = reportDetails.reduce((accumulator, current) => accumulator + current.partPayment1, 0);
        const totalPartPayment2 = reportDetails.reduce((accumulator, current) => accumulator + current.partPayment2, 0);

        setTotalValues({
            ...totalValues,
            totalNormalDays: totalNormalDays.toFixed(2),
            totalHolidays: totalHolidays.toFixed(2),
            totalWages: totalWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalOverKiloAmount: totalOverKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalOtAmount: totalOtAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalCashKiloAmount: totalCashKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalDayCashPluckingAmount: totalDayCashPluckingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalCashWorkDays: totalCashWorkDays.toFixed(2),
            totalCashJobAmount: totalCashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalOtherEarningAmount: totalOtherEarningAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

            totalHolidayAmount: totalHolidayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalBFAmount: totalBFAmount.toFixed(2),
            totalGrossAmount: totalGrossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

            totalStamp: totalStamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalTeaRecovery: totalTeaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalWelfare: totalWelfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalCrenchFund: totalCrenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalFuneralFund: totalFuneralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalUnionRecovery: totalUnionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalElectricityRecovery: totalElectricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalPayCards: totalPayCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalCoopMembership: totalCoopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalCoopShopRecovery: totalCoopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalTempleRecovery: totalTempleRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalInsuranceRecovery: totalInsuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalDhoby: totalDhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalBaber: totalBaber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalWaterSchemeRecovery: totalWaterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalFine: totalFine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalOtherRecovery: totalOtherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalToolsRecovery: totalToolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalFestivalAdvanceRecovery: totalFestivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalOtherDeductions: totalOtherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalEPF10Amount: totalEPF10Amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalBalance: totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalPaybleAmount: totalPaybleAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalBalanceCFAmount: totalBalanceCFAmount.toFixed(2),
            totalEPFAmount: totalEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalETFAmount: totalETFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalPartPayment1: totalPartPayment1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalPartPayment2: totalPartPayment2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        })
    };

    async function createDataForExcel(array) {
        var res = [];

        if (array != null) {
            array.map(x => {
                const totalDeductions = x.stamp + x.teaRecovery + x.welfare + x.crenchFund + x.funeralFund +
                    x.unionRecovery + x.electricityRecovery + x.payCards + x.coopMembership +
                    x.coopShopRecovery + x.templeRecovery + x.insuranceRecovery + x.dhoby + x.baber +
                    x.waterSchemeRecovery + x.fine + x.otherRecovery + x.toolsRecovery +
                    x.festivalAdvanceRecovery + x.otherDeductions + x.epfAmount;

                var vr = {
                    'Emp No': x.registrationNumber.toString().padStart(4, '0'),
                    'Name': x.employeeName,
                    'Normal Days': x.normalDays.toFixed(2),
                    'Sunday & Poyadays': x.holiday.toFixed(2),
                    'Total Wages for Mandays': x.totalWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Over KG Amount': x.overKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'OT Amount': x.otAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Cash Plucking': x.cashKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Cash Day Plucking Amount': x.cashDayPluckingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Sundry Cash Work Days': x.cashWorkDays.toFixed(2),
                    'Sundry Cash Work Amount': x.cashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Other Earning Amount': x.otherEarningAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Balance BF Amount': x.bfAmount.toFixed(2),
                    'Gross Amount': x.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

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
                    'Festival Advance Recovery(Rs.)': x.festivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Other Deductions(Rs.)': x.otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'EPF 10%': x.epfAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Total Deduction': totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Part Payment 1': x.partPayment1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Part Payment 2': x.partPayment2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Net Amount': x.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Balance CF Amount': x.balanceCFAmount.toFixed(2),
                    'Payble Amount': x.paybleAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'EPF Contribution Employer': x.employerEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'ETF Contribution Employer': x.employerETFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                }
                res.push(vr);
            });

            res.push({});
            var vr1 = {
                'Emp No': 'Total',
                'Normal Days': totalValues.totalNormalDays,
                'Sunday & Poyadays': totalValues.totalHolidays,
                'Total Wages for Mandays': totalValues.totalWages,
                'Over KG Amount': totalValues.totalOverKiloAmount,
                'OT Amount': totalValues.totalOtAmount,
                'Cash Plucking': totalValues.totalCashKiloAmount,
                'Cash Day Plucking Amount': totalValues.totalDayCashPluckingAmount,
                'Sundry Cash Work Days': totalValues.totalCashWorkDays,
                'Sundry Cash Work Amount': totalValues.totalCashJobAmount,
                'Other Earning Amount': totalValues.totalOtherEarningAmount,
                'Balance BF Amount': totalValues.totalBFAmount,
                'Gross Amount': totalValues.totalGrossAmount,

                'Stamp (Rs.)': totalValues.totalStamp,
                'Tea Recovery (Rs.)': totalValues.totalTeaRecovery,
                'Welfare (Rs.)': totalValues.totalWelfare,
                'Crech Fund (Rs.)': totalValues.totalCrenchFund,
                'Funeral Fund (Rs.)': totalValues.totalFuneralFund,
                'Union Recovery (Rs.)': totalValues.totalUnionRecovery,
                'Electricity Recovery (Rs.)': totalValues.totalElectricityRecovery,
                'Pay Cards (Rs.)': totalValues.totalPayCards,
                'Co op Membership (Rs.)': totalValues.totalCoopMembership,
                'Co op Shop Recovery (Rs.)': totalValues.totalCoopShopRecovery,
                'Temple Recovery (Rs.)': totalValues.totalTempleRecovery,
                'Insurance Recovery (Rs.)': totalValues.totalInsuranceRecovery,
                'Dhoby (Rs.)': totalValues.totalDhoby,
                'Baber (Rs.)': totalValues.totalBaber,
                'Water Scheme Recovery (Rs.)': totalValues.totalWaterSchemeRecovery,
                'Fine (Rs.)': totalValues.totalFine,
                'Other Recovery (Rs.)': totalValues.totalOtherRecovery,
                'Tools Recovery (Rs.)': totalValues.totalToolsRecovery,
                'Festival Advance Recovery(Rs.)': totalValues.totalFestivalAdvanceRecovery,
                'Other Deductions(Rs.)': totalValues.totalOtherDeductions,
                'EPF 10%': totalValues.totalEPF10Amount,
                'Total Deduction': totalSumOfDeductions,
                'Part Payment 1': totalValues.totalPartPayment1,
                'Part Payment 2': totalValues.totalPartPayment2,
                'Net Amount': totalValues.totalBalance,
                'Balance CF Amount': totalValues.totalBalanceCFAmount,
                'Payble Amount': totalValues.totalPaybleAmount,
                'EPF Contribution Employer': totalValues.totalEPFAmount,
                'ETF Contribution Employer': totalValues.totalETFAmount,
            };
            res.push(vr1);

            res.push({}, {});
            var vr = {
                'Emp No': "Group: " + selectedSearchValues.groupName,
                'Sunday & Poyadays': "Estate: " + selectedSearchValues.estateName,
                'Over KG Amount': "Date: " + (selectedSearchValues.year + '-' + selectedSearchValues.monthName),
            }
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(reportDetails);
        var settings = {
            sheetName: 'PaymentCheckroll Summary Report',
            fileName: 'PaymentCheckroll Summary Report' + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.estateName + ' - ' + selectedSearchValues.year + ' / ' + selectedSearchValues.monthName,
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'PaymentCheckroll Summary Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        )
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setPaymentCheckrollSummaryInput({
            ...paymentCheckrollSummaryInput,
            [e.target.name]: value
        });
    }

    function setDate() {
        let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var month = (paymentCheckrollSummaryInput.month);
        let monthName = monthNames[month - 1];

        setSelectedSearchValues({
            ...selectedSearchValues,
            monthName: monthName
        });
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
        var month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        var year = date.getUTCFullYear();
        let monthName = monthNames[month - 1];

        setSelectedSearchValues({
            ...selectedSearchValues,
            monthName: monthName
        });
        setPaymentCheckrollSummaryInput({
            ...paymentCheckrollSummaryInput,
            month: month.toString(),
            year: year.toString()
        });
        setSelectedDate(date);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            divisionName: divisions[searchForm.divisionID],
            month: searchForm.month,
            year: searchForm.year
        })
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: paymentCheckrollSummaryInput.groupID,
                            estateID: paymentCheckrollSummaryInput.estateID,
                            divisionID: paymentCheckrollSummaryInput.divisionID,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Select a Estate'),
                                divisionID: Yup.number().required('Division is required').min("1", 'Select a Division'),
                            })
                        }
                        onSubmit={() => trackPromise(GetDetails())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={3}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            size='small'
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={paymentCheckrollSummaryInput.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={3}>
                                                        <InputLabel shrink id="estateID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.estateID && errors.estateID)}
                                                            fullWidth
                                                            helperText={touched.estateID && errors.estateID}
                                                            name="estateID"
                                                            onBlur={handleBlur}
                                                            onChange={e => handleChange(e)}
                                                            value={paymentCheckrollSummaryInput.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            size="small"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estates)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={3}>
                                                        <InputLabel shrink id="divisionID">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            name="divisionID"
                                                            onChange={e => handleChange(e)}
                                                            value={paymentCheckrollSummaryInput.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <br></br>
                                                <Grid container spacing={3}>
                                                    <Grid item md={3} xs={3}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={['year', 'month']}
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

                                                <Box display="flex" flexDirection="row-reverse" p={2} >
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                                <br />
                                                <Box minWidth={1050}>
                                                    {reportDetails.length > 0 ?

                                                        <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                                            <Table className={classes.table} aria-label="sticky table" stickyHeader size="small" Table>
                                                                <TableHead style={{ position: "sticky", top: 0, zIndex: 1000, background: "white" }}>
                                                                    <TableRow>
                                                                        <TableCell className={classes.sticky} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Emp No</TableCell>
                                                                        <TableCell className={classes.sticky} rowSpan="2" align={'center'} style={{ left: 74, border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Name</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Normal Days</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Sunday & Poyadays</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Total Wages for Mandays</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} colSpan="7" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Earnings</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Balance BF Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Gross Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} colSpan="21" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Deductions (Rs.)</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Total Deduction</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Part Payment 1</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Part Payment 2</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Net Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Balance CF Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Payble Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>EPF Contribution Employer</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>ETF Contribution Employer</TableCell>

                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Over KG Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>OT Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Cash Plucking</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Cash Day Plucking Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Sundry Cash Work Days</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Sundry Cash Work Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Other Earning Amount</TableCell>

                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Stamp</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Tea Recovery </TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Welfare</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Crech Fund</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Funeral Fund</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Union Recovery</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Electricity Recovery</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Pay Cards</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Co op Membership</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Co op Shop Recovery</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Temple Recovery</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Insurance Recovery</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Dhoby</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Baber</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Water Scheme Recovery</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Fine</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Other Recovery</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Tools Recovery</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Festival Advance Recovery</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Other Deductions</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>EPF 10%</TableCell>

                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {reportDetails.map((data, index) => {
                                                                        const totalDeductions = data.stamp + data.teaRecovery + data.welfare + data.crenchFund + data.funeralFund +
                                                                            data.unionRecovery + data.electricityRecovery + data.payCards + data.coopMembership +
                                                                            data.coopShopRecovery + data.templeRecovery + data.insuranceRecovery + data.dhoby + data.baber +
                                                                            data.waterSchemeRecovery + data.fine + data.otherRecovery + data.toolsRecovery +
                                                                            data.festivalAdvanceRecovery + data.otherDeductions + data.epfAmount;

                                                                        return (
                                                                            <TableRow key={index}>
                                                                                <TableCell className={`${classes.stickyColumn}`} align={'center'} style={{ border: "1px solid black" }}>{data.registrationNumber.toString().padStart(4, '0')}</TableCell>
                                                                                <TableCell className={`${classes.stickyColumn}`} align={'left'} style={{ left: 74, border: "1px solid black" }}>{data.employeeName}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.normalDays.toFixed(2)}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.holiday.toFixed(2)}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.totalWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.overKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.otAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.cashKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.cashDayPluckingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.cashWorkDays.toFixed(2)}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.cashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.otherEarningAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.bfAmount.toFixed(2)}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>

                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.stamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.teaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.welfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.crenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.funeralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.unionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.electricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.payCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.coopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.coopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.templeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.insuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.dhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.baber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.waterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.fine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.otherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.toolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.festivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.epfAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.partPayment1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.partPayment2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.balanceCFAmount.toFixed(2)}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.paybleAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.employerEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.employerETFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>
                                                                <TableRow>
                                                                    <TableCell className={`${classes.stickyColumn}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} colSpan={2}><b>Total</b></TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalNormalDays}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalHolidays}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalWages}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOverKiloAmount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOtAmount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCashKiloAmount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalDayCashPluckingAmount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCashWorkDays}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCashJobAmount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOtherEarningAmount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalBFAmount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalGrossAmount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalStamp}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalTeaRecovery}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalWelfare}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCrenchFund}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalFuneralFund}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalUnionRecovery}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalElectricityRecovery}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalPayCards}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCoopMembership}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCoopShopRecovery}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalTempleRecovery}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalInsuranceRecovery}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalDhoby}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalBaber}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalWaterSchemeRecovery}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalFine}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOtherRecovery}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalToolsRecovery}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalFestivalAdvanceRecovery}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOtherDeductions}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalEPF10Amount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalSumOfDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalPartPayment1}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalPartPayment2}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalBalance}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalBalanceCFAmount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalPaybleAmount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalEPFAmount}</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalETFAmount}</TableCell>
                                                                </TableRow>
                                                            </Table>
                                                        </TableContainer>
                                                        : null}
                                                </Box>
                                            </CardContent>
                                            {reportDetails.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnRecord"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        className={classes.colorRecord}
                                                        onClick={createFile}
                                                    >
                                                        EXCEL
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <ReactToPrint
                                                        documentTitle={"Payment Checkroll Summary Report"}
                                                        trigger={() => <Button
                                                            color="primary"
                                                            id="btnCancel"
                                                            variant="contained"
                                                            style={{ marginRight: '1rem' }}
                                                            className={classes.colorCancel}
                                                        >
                                                            PDF
                                                        </Button>}
                                                        content={() => componentRef.current}
                                                    />
                                                    <div hidden={true}>
                                                        <CreatePDF ref={componentRef} paymentCheckrollDetails={reportDetails}
                                                            SearchData={selectedSearchValues} totalValues={totalValues} />
                                                    </div>
                                                </Box> : null}
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    )
}

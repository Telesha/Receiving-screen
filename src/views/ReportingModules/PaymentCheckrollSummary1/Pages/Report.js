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

const screenCode = 'PAYMENTCHECKROLLSUMMARYREPORT';

export default function PaymentCheckrollSummaryReport1(props) {
    const [title, setTitle] = useState("Payment Checkroll Summary Report 1")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState();
    const [divisions, setDivisions] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [paymentCheckrollDetails, setPaymentCheckrollDetails] = useState([]);
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
        if (paymentCheckrollDetails.length != 0) {
            calculateTotalQty()
        }
    }, [paymentCheckrollDetails]);

    useEffect(() => {
        setDate()
    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPAYMENTCHECKROLLSUMMARYREPORT');

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

    const groupedData = paymentCheckrollDetails.reduce((acc, item) => {
        if (!acc[item.divisionName]) {
            acc[item.divisionName] = [];
        }
        acc[item.divisionName].push(item);
        return acc;
    }, {});

    const totalsByDivision = {};

    Object.keys(groupedData).forEach(divisionName => {
        totalsByDivision[divisionName] = [{
            normalDays: 0, holiday: 0, totalWages: 0, overKiloAmount: 0, otAmount: 0, cashKiloAmount: 0,
            cashDayPluckingAmount: 0, cashWorkDays: 0, cashJobAmount: 0, otherEarningAmount: 0,
            holidayAmount: 0, bfAmount: 0, grossAmount: 0, deductionAmount: 0, balance: 0,
            paybleAmount: 0, balanceCFAmount: 0, employerEPFAmount: 0, employerETFAmount: 0,
            partPayment1: 0, partPayment2: 0
        }];

        groupedData[divisionName].forEach(item => {
            const totals = totalsByDivision[divisionName][0];
            totals.normalDays += Number(item.normalDays) || 0;
            totals.holiday += Number(item.holiday) || 0;
            totals.totalWages += Number(item.totalWages) || 0;
            totals.overKiloAmount += Number(item.overKiloAmount) || 0;
            totals.otAmount += Number(item.otAmount) || 0;
            totals.cashKiloAmount += Number(item.cashKiloAmount) || 0;
            totals.cashDayPluckingAmount += Number(item.cashDayPluckingAmount) || 0;
            totals.cashWorkDays += Number(item.cashWorkDays) || 0;
            totals.cashJobAmount += Number(item.cashJobAmount) || 0;
            totals.otherEarningAmount += Number(item.otherEarningAmount) || 0;
            totals.holidayAmount += Number(item.holidayAmount) || 0;
            totals.bfAmount += Number(item.bfAmount) || 0;
            totals.grossAmount += Number(item.grossAmount) || 0;
            totals.deductionAmount += Number(item.deductionAmount) || 0;
            totals.balance += Number(item.balance) || 0;
            totals.paybleAmount += Number(item.paybleAmount) || 0;
            totals.balanceCFAmount += Number(item.balanceCFAmount) || 0;
            totals.employerEPFAmount += Number(item.employerEPFAmount) || 0;
            totals.employerETFAmount += Number(item.employerETFAmount) || 0;
            totals.partPayment1 += Number(item.partPayment1) || 0;
            totals.partPayment2 += Number(item.partPayment2) || 0;
        });
    });

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
        if (response.statusCode == "Success" && response.data != null) {
            response.data.forEach(element => {
                element.balanceCFAmount = element.balance - element.paybleAmount
            });

            setPaymentCheckrollDetails(response.data);
            createDataForExcel(response.data);

            // const groupedDeductDetailsList = Object.values(groupedDeductDetails);
            const groupedWages = _.groupBy(response.data, 'registrationNumber');

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
            const joinedArray = _.merge(_.keyBy(response.data, 'registrationNumber'), _.keyBy(summedWagesArray, 'registrationNumber'));

            var joinedResult = [];
            var finalResult = [];

            Object.keys(joinedArray).forEach(x => joinedResult.push(joinedArray[x]));
            joinedResult.forEach(x => {
                finalResult.push(x);
            });

            setPaymentCheckrollDetails(finalResult);
            createDataForExcel(finalResult);
            if (response.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalNormalDays = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.normalDays, 0);
        const totalHolidays = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.holiday, 0);
        const totalWages = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.totalWages, 0);
        const totalOverKiloAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.overKiloAmount, 0);
        const totalOtAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.otAmount, 0);
        const totalCashKiloAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.cashKiloAmount, 0);
        const TotalCashDayPluckingAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.cashDayPluckingAmount, 0);
        const totalCashWorkDays = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.cashWorkDays, 0);
        const totalCashJobAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.cashJobAmount, 0);
        const totalOtherEarningAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.otherEarningAmount, 0);
        const totalHolidayAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.holidayAmount, 0);
        const totalBFAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.bfAmount, 0);
        const totalGrossAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.grossAmount, 0);
        const totalDeductionAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.deductionAmount, 0);
        const totalBalance = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.balance, 0);
        const totalPaybleAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.paybleAmount, 0);
        const totalBalanceCFAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.balanceCFAmount, 0);
        const totalEPFAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.employerEPFAmount, 0);
        const totalETFAmount = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.employerETFAmount, 0);
        const totalPartPayment1 = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.partPayment1, 0);
        const totalPartPayment2 = paymentCheckrollDetails.reduce((accumulator, current) => accumulator + current.partPayment2, 0);

        setTotalValues({
            ...totalValues,
            totalNormalDays: totalNormalDays.toFixed(2),
            totalHolidays: totalHolidays.toFixed(2),
            totalWages: totalWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalOverKiloAmount: totalOverKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalOtAmount: totalOtAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalCashKiloAmount: totalCashKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            TotalCashDayPluckingAmount: TotalCashDayPluckingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalCashWorkDays: totalCashWorkDays.toFixed(2),
            totalCashJobAmount: totalCashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalOtherEarningAmount: totalOtherEarningAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalHolidayAmount: totalHolidayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalBFAmount: totalBFAmount.toFixed(2),
            totalGrossAmount: totalGrossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalDeductionAmount: totalDeductionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
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
                var vr = {
                    'Emp No': x.registrationNumber.toString().padStart(4, '0'),
                    'Name': x.employeeName,
                    'Normal Days': x.normalDays.toFixed(2),
                    'Sunday & Poyadays': x.holiday.toFixed(2),
                    'Total Wages for Mandays': x.totalWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Over KG Amount': x.overKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'OT Amount': x.otAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Cash Kilo Amount': x.cashKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Cash Day Plucking Amount': x.cashKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Sundry Cash Work Days': x.cashWorkDays.toFixed(2),
                    'Sundry Cash Work Amount': x.cashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Other Earning Amount': x.otherEarningAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Holiday Pay Amount': x.holidayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Balance BF Amount': x.bfAmount.toFixed(2),
                    'Gross Amount': x.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Total Deduction Amount': x.deductionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Net Amount': x.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Balance CF Amount': x.balanceCFAmount.toFixed(2),
                    'EPF Contribution Employer': x.employerEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'ETF Contribution Employer': x.employerETFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Part Payment 1': x.partPayment1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Part Payment 2': x.partPayment2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Payble Amount': x.paybleAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    'Signature': '',
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
                'Cash Kilo Amount': totalValues.totalCashKiloAmount,
                'Cash Day Plucking Amount': totalValues.TotalCashDayPluckingAmount,
                'Sundry Cash Work Days': totalValues.totalCashWorkDays,
                'Sundry Cash Work Amount': totalValues.totalCashJobAmount,
                'Other Earning Amount': totalValues.totalOtherEarningAmount,
                'Holiday Pay Amount': totalValues.totalHolidayAmount,
                'Balance BF Amount': totalValues.totalBFAmount,
                'Gross Amount': totalValues.totalGrossAmount,
                'Total Deduction Amount': totalValues.totalDeductionAmount,
                'Net Amount': totalValues.totalBalance,
                'Balance CF Amount': totalValues.totalBalanceCFAmount,
                'EPF Contribution Employer': totalValues.totalEPFAmount,
                'ETF Contribution Employer': totalValues.totalETFAmount,
                'Part Payment 1': totalValues.totalPartPayment1,
                'Part Payment 2': totalValues.totalPartPayment2,
                'Payble Amount': totalValues.totalPaybleAmount,
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
        var file = await createDataForExcel(paymentCheckrollDetails);
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
        setPaymentCheckrollDetails([]);
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
        setPaymentCheckrollDetails([]);
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
                                                            Division
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
                                                    {paymentCheckrollDetails.length > 0 ?
                                                        <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                                            <Table className={classes.table} aria-label="sticky table" stickyHeader size="small" Table>
                                                                <TableHead style={{ position: "sticky", top: 0, zIndex: 1000, background: "white" }}>
                                                                    <TableRow>
                                                                        <TableCell className={classes.sticky} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Emp No</TableCell>
                                                                        <TableCell className={classes.sticky} align={'center'} style={{ left: 74, border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Name</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Normal Days</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Sunday & Poyadays</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Total Wages for Mandays</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Over KG Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>OT Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Cash Kilo Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Cash Day Plucking Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Sundry Cash Work Days</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Sundry Cash Work Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Other Earning Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Holiday Pay Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Balance BF Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Gross Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Total Deduction Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Net Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Balance CF Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>EPF Contribution Employer</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>ETF Contribution Employer</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Part Payment 1</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Part Payment 2</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Payble Amount</TableCell>
                                                                        <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>Signature</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {Object.keys(groupedData).map((divisionName, catIndex) => (
                                                                        <React.Fragment key={catIndex}>
                                                                            <TableRow>
                                                                                <TableCell colSpan={20} align="left" style={{ fontWeight: 'bold', border: "1px solid black", backgroundColor: '#FFF366' }}>
                                                                                    {divisionName}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                            {groupedData[divisionName].map((data, i) => {
                                                                                const labelId = `enhanced-table-checkbox-${catIndex}-${i}`;
                                                                                return (
                                                                                    <TableRow key={i}>
                                                                                        <TableCell className={`${classes.stickyColumn}`} align={'center'} style={{ border: "1px solid black" }}>{data.registrationNumber.toString().padStart(4, '0')}</TableCell>
                                                                                        <TableCell className={`${classes.stickyColumn}`} align={'left'} style={{ left: 74, border: "1px solid black" }}>{data.employeeName}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.normalDays.toFixed(2)}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.holiday.toFixed(2)}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.totalWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.overKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.otAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.cashKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.cashDayPluckingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.cashWorkDays.toFixed(2)}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.cashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.otherEarningAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.holidayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.bfAmount.toFixed(2)}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.deductionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.balanceCFAmount.toFixed(2)}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.employerEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.employerETFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.partPayment1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.partPayment2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.paybleAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}></TableCell>
                                                                                    </TableRow>
                                                                                )
                                                                            })}
                                                                            {totalsByDivision[divisionName].map((data, i) => {

                                                                                return (
                                                                                    <TableRow key={divisionName}>
                                                                                        <TableCell className={`${classes.stickyColumn}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }} colSpan={2}>{"Sub Total"}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.normalDays.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.holiday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.totalWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.overKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.otAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.cashKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.cashDayPluckingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.cashWorkDays.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.cashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.otherEarningAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.holidayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.bfAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.deductionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.balanceCFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.employerEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.employerETFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.partPayment1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.partPayment2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}>{data.paybleAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "black" }}></TableCell>
                                                                                    </TableRow>
                                                                                )
                                                                            })}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </TableBody>
                                                                {paymentCheckrollSummaryInput.divisionID == 0 ?
                                                                    <TableRow>
                                                                        <TableCell className={`${classes.stickyColumn}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} colSpan={2}><b>Total</b></TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalNormalDays}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalHolidays}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalWages}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOverKiloAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOtAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCashKiloAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.TotalCashDayPluckingAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCashWorkDays}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCashJobAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOtherEarningAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalHolidayAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalBFAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalGrossAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalDeductionAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalBalance}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalBalanceCFAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalEPFAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalETFAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalPartPayment1}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalPartPayment2}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalPaybleAmount}</TableCell>
                                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}></TableCell>
                                                                    </TableRow>
                                                                    : null}
                                                            </Table>

                                                        </TableContainer>
                                                        : null}
                                                </Box>
                                            </CardContent>
                                            {paymentCheckrollDetails.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    {paymentCheckrollSummaryInput.divisionID != 0 ?
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
                                                    <ReactToPrint
                                                        documentTitle={"Payment Checkroll Summary Report 1"}
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
                                                        <CreatePDF ref={componentRef} paymentCheckrollDetails={paymentCheckrollDetails}
                                                            SearchData={selectedSearchValues} totalValues={totalValues} totalsByDivision={totalsByDivision} />
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
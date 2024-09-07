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
    Paper
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
    MuiPickersUtilsProvider
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import CreatePDF from './CreatePDF';
import ReactToPrint from 'react-to-print';
import { useAlert } from 'react-alert';
import TableCell from '@material-ui/core/TableCell';
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
    }
}));

const screenCode = 'AMALGAMATIONREPORT';

export default function GreenLeafReport(props) {
    const [title, setTitle] = useState('Amalgamation Report');
    const classes = useStyles();
    const [amalgamationDetails, setAmalgamationDetails] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    });
    const [estateList, setEstateList] = useState([]);
    const [GroupList, setGroupList] = useState([]);
    const [divitionList, setDivision] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [amalgamationData, setAmalgamationData] = useState([]);
    const [totals, setTotals] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const navigate = useNavigate();

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
            getEstatesForDropdoen(amalgamationDetails.groupID)
        )
        setAlertCount({
            count: alertCount.count + 1
        });
    }, [amalgamationDetails.groupID]);

    useEffect(() => {
        trackPromise(getDivisionByEstateID(amalgamationDetails.estateID));
    }, [amalgamationDetails.estateID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'VIEWAMALGAMATIONREPORT'
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

        setAmalgamationDetails({
            ...amalgamationDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setAmalgamationDetails({
            ...amalgamationDetails,
            [e.target.name]: value
        });
        setAmalgamationData([]);
        setTotals([]);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstatesForDropdoen() {
        const estates = await services.getEstateDetailsByGroupID(amalgamationDetails.groupID);
        setEstateList(estates);
    }

    async function getDivisionByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(amalgamationDetails.estateID);
        setDivision(response);
    };

    async function GetDetails() {
        setAmalgamationData([]);
        setTotals([]);
        let model = {
            GroupID: parseInt(amalgamationDetails.groupID),
            EstateID: parseInt(amalgamationDetails.estateID),
            DivisionID: parseInt(amalgamationDetails.divisionID),
            year: amalgamationDetails.year.toString(),
            month: amalgamationDetails.month.toString(),
        };
        getSelectedDropdownValuesForReport(model);

        const response = await services.getAmalgamationDetails(model)
        if (response.statusCode == 'Success' && response.data != null) {

            var totalForEPF = response.data[0].normalTappingDaysAmount + response.data[0].normalSundryDaysAmount;

            var PIDays = response.data[0].normalSundryDays + response.data[0].normalTappingDays;

            var PIDaysAmount = response.data[0].normalTappingDaysAmount + response.data[0].normalSundryDaysAmount;

            var totalGrossWages = (response.data[0].overKilosAmount + PIDaysAmount + response.data[0].cashSundryAmount + response.data[0].cashDayPlucking
                + response.data[0].cashPluckingAmount + response.data[0].extraRate + response.data[0].overTime
                + response.data[0].bfCoins + response.data[0].otherEarnings);

            var EPF22 = response.data[0].epF10 + response.data[0].epF12;

            var totalDeductions = (response.data[0].epF10 + response.data[0].payCards + response.data[0].cashAdvance + response.data[0].festivalAdvance
                + response.data[0].coopMembership + response.data[0].unionCheck + response.data[0].bankRecoveries + response.data[0].templeRecoveries + response.data[0].insuranceRecoveries
                + response.data[0].tea + response.data[0].welfare + response.data[0].creheFund + response.data[0].funeralFund + response.data[0].dhoby + response.data[0].stamp
                + response.data[0].barber + response.data[0].waterSchemeRecoveries + response.data[0].foodStuffRecoveries + response.data[0].electricity + response.data[0].coopRecoveries
                + response.data[0].festivalSaving + response.data[0].fine + response.data[0].otherDeductions + response.data[0].transport + response.data[0].tools + response.data[0].foodPack
                + response.data[0].saving);

            var balancePay = totalGrossWages - totalDeductions;

            var balancePayDue = balancePay - response.data[0].unpaidCoins;

            setAmalgamationData(response.data[0])
            setTotals({ totalForEPF, PIDays, PIDaysAmount, totalGrossWages, EPF22, totalDeductions, balancePay, balancePayDue })

        } else {
            alert.error('NO RECORDS TO DISPLAY');
        }
    }

    async function createDataForExcel(array) {
        var result = [];
        if (array != null) {
            result.push({
                a: 'Normal Plucking Days', b: parseFloat(amalgamationData.normalTappingDays) + ' Days', d: parseFloat(amalgamationData.normalTappingDaysAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                h: 'EPF 10%', i: parseFloat(amalgamationData.epF10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            });
            result.push({
                a: 'Normal Sundry Days', b: parseFloat(amalgamationData.normalSundryDays).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Days', d: parseFloat(amalgamationData.normalSundryDaysAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                h: 'EPF 12%', i: parseFloat(amalgamationData.epF12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            });
            result.push({
                a: 'Holiday Pay', d: parseFloat(amalgamationData.holidayPayAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                h: 'EPF 22%', i: parseFloat(totals.EPF22).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            });
            result.push({ a: 'Total For EPF', d: parseFloat(totals.totalForEPF).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({});
            result.push({ a: 'Over Kilos', b: parseFloat(amalgamationData.overKilos).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Kg', d: parseFloat(amalgamationData.overKilosAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({
                a: 'PI', b: parseFloat(totals.PIDays) + ' Days', d: parseFloat(totals.PIDaysAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                h: 'Balance Pay', i: parseFloat(totals.balancePay).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            });
            result.push({
                a: 'Cash work - Sundry', b: parseFloat(amalgamationData.cashWorkSundryDays) + ' Days', d: parseFloat(amalgamationData.cashSundryAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                h: 'Unpaid Coins', i: parseFloat(amalgamationData.unpaidCoins).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            });
            result.push({
                a: 'Contract Plucking', b: parseFloat(amalgamationData.contractPluckingKilos).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), d: parseFloat(amalgamationData.contractPluckingAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                h: 'Balance Payment Due', i: parseFloat(totals.balancePayDue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            });
            result.push({
                a: 'Cash Day Plucking', b: parseFloat(amalgamationData.cashDayPluckingDays) + ' Days', d: parseFloat(amalgamationData.cashDayPlucking).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            });
            result.push({ a: 'Cash Plucking', b: parseFloat(amalgamationData.cashPluckingKilos).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Kg', d: parseFloat(amalgamationData.cashPluckingAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Extra Rate', d: parseFloat(amalgamationData.extraRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Over Time', d: parseFloat(amalgamationData.overTime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'BF Coins', d: parseFloat(amalgamationData.bfCoins).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Other Earnings', d: parseFloat(amalgamationData.otherEarnings).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Total Gross Wages', d: parseFloat(totals.totalGrossWages).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({});
            result.push({ a: 'Deductions' })
            result.push({ a: '10% EPF', d: parseFloat(amalgamationData.epF10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Pay Cards', d: parseFloat(amalgamationData.payCards).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Cash Advance', d: parseFloat(amalgamationData.cashAdvance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Festival Advance', d: parseFloat(amalgamationData.festivalAdvance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Festival Saving', d: parseFloat(amalgamationData.festivalSaving).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Co-op membership', d: parseFloat(amalgamationData.coopMembership).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Union Check', d: parseFloat(amalgamationData.unionCheck).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Bank Loan', d: parseFloat(amalgamationData.bankRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Temple Recoveries', d: parseFloat(amalgamationData.templeRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Insurance Recoveries', d: parseFloat(amalgamationData.insuranceRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Tea', d: parseFloat(amalgamationData.tea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Welfare', d: parseFloat(amalgamationData.welfare).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Crehe Fund', d: parseFloat(amalgamationData.creheFund).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Funeral Fund', d: parseFloat(amalgamationData.funeralFund).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })
            result.push({ a: 'Dhoby', d: parseFloat(amalgamationData.dhoby).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Barber', d: parseFloat(amalgamationData.barber).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Water Scheme Recoveries', d: parseFloat(amalgamationData.waterSchemeRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Food Stuff Recoveries', d: parseFloat(amalgamationData.foodStuffRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Food Pack', d: parseFloat(amalgamationData.foodPack).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Electricity', d: parseFloat(amalgamationData.electricity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Co-op Recoveries', d: parseFloat(amalgamationData.coopRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Stamp', d: parseFloat(amalgamationData.stamp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Saving', d: parseFloat(amalgamationData.saving).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Fine', d: parseFloat(amalgamationData.fine).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Other Deductions', d: parseFloat(amalgamationData.otherDeductions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Transport', d: parseFloat(amalgamationData.transport).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Tools', d: parseFloat(amalgamationData.tools).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({ a: 'Total Deductions', d: parseFloat(totals.totalDeductions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            result.push({})
            result.push({ a: 'Group : ' + selectedSearchValues.groupID, b: 'Estate : ' + selectedSearchValues.estateID, c: 'Division : ' + selectedSearchValues.divisionID })
            result.push({ a: 'Year : ' + selectedSearchValues.year, b: 'Month : ' + moment(selectedSearchValues.month).format('MMMM') })
        }
        return result;
    }

    async function createFile() {
        var file = await createDataForExcel(amalgamationData);
        var settings = {
            sheetName: 'Amalgamation Report',
            fileName: 'Amalgamation Report' + ' - ' + selectedSearchValues.year + '/' + selectedSearchValues.month,
            writeOptions: {}
        }

        let tempcsvHeaders = csvHeaders;
        tempcsvHeaders.push({ label: '', value: 'a' })
        tempcsvHeaders.push({ label: ' ', value: 'b' })
        tempcsvHeaders.push({ label: '   ', value: 'c' })
        tempcsvHeaders.push({ label: '    ', value: 'd' })
        tempcsvHeaders.push({ label: '     ', value: 'e' })
        tempcsvHeaders.push({ label: '      ', value: 'f' })
        tempcsvHeaders.push({ label: '       ', value: 'g' })
        tempcsvHeaders.push({ label: '        ', value: 'h' })
        tempcsvHeaders.push({ label: '         ', value: 'i' })

        let dataA = [
            {
                sheet: 'Amalgamation Report',
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
        setAmalgamationData([]);
        setTotals([]);
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
        var month = (new Date(date).getUTCMonth() + 1).toString().padStart(2, '0');//months from 1-12
        var year = date.getUTCFullYear();
        let monthName = monthNames[month - 1];
        setSelectedSearchValues({
            ...selectedSearchValues,
            month: monthName
        });
        setAmalgamationDetails({
            ...amalgamationDetails,
            month: month,
            year: year.toString()
        });
        setSelectedDate(date);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            estateID: estateList[searchForm.EstateID],
            groupID: GroupList[searchForm.GroupID],
            divisionID: searchForm.DivisionID == 0 ? 'All Divisions' : divitionList[searchForm.DivisionID],
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
                            groupID: amalgamationDetails.groupID,
                            estateID: amalgamationDetails.estateID,
                            divisionID: amalgamationDetails.divisionID
                        }}
                        validationSchema={Yup.object().shape({
                            groupID: Yup.number().required('Group required').min('1', 'Group required'),
                            estateID: Yup.number().required('Estate required').min('1', 'Factory required'),
                            //divisionID: Yup.number().required('Division is required').min('1', 'Division is required')
                        })}
                        onSubmit={() => trackPromise(GetDetails())}
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
                                                    <Grid item md={3} xs={8}>
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
                                                            value={amalgamationDetails.groupID}
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

                                                    <Grid item md={3} xs={8}>
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
                                                            value={amalgamationDetails.estateID}
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

                                                    <Grid item md={3} xs={12}>
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
                                                            value={amalgamationDetails.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divitionList)}
                                                        </TextField>
                                                    </Grid>

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

                                                <Grid item md={12} xs={12} container justify="flex-end">
                                                    <Box pt={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type='submit'
                                                        >
                                                            Search
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                                <br></br>
                                                <Box minWidth={1000} hidden={amalgamationData.length == 0}>
                                                    <Grid style={{ display: "flex" }}>
                                                        <Grid style={{ flex: 1 }}>
                                                            <TableContainer component={Paper} style={{ width: "800px" }}>
                                                                <Table className={classes.table} size="small">
                                                                    <TableBody>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Normal Plucking Days </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.normalTappingDays)} </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Days </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.normalTappingDaysAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Normal Sundry Days </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.normalSundryDays)} </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Days </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.normalSundryDaysAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Holiday Pay </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right">  </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "16px", width: "25%", borderBottom: "2px solid black" }} align="right"> {parseFloat(amalgamationData.holidayPayAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell colSpan={2} style={{ border: "0px", fontWeight: "bold", fontSize: "16px", width: "25%" }} align="left"> Total For EPF </TableCell>
                                                                            <TableCell colSpan={2} style={{ border: "0px", fontWeight: "bold", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(totals.totalForEPF).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <br></br>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Over Kilos </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.overKilos).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left">  Kg</TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.overKilosAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> PI </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(totals.PIDays)} </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Days </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(totals.PIDaysAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Cash work - Sundry </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right">  {parseFloat(amalgamationData.cashWorkSundryDays)} </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  Days </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.cashSundryAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Contract Plucking </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.contractPluckingKilos).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.contractPluckingAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Cash Day Plucking </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right">  {parseFloat(amalgamationData.cashDayPluckingDays)} </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  Days </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.cashDayPlucking).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Cash Plucking </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.cashPluckingKilos).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  Kg</TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.cashPluckingAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Extra Rate </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right">  </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.extraRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Over Time </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right">  </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.overTime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> BF Coins </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right">  </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(amalgamationData.bfCoins).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left"> Other Earnings </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "16px", width: "25%" }} align="right">  </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                                            <TableCell style={{ border: "0px", fontSize: "16px", width: "25%", borderBottom: "2px solid black" }} align="right"> {parseFloat(amalgamationData.otherEarnings).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell colSpan={2} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "25%" }} align="left"> Total Gross Wages </TableCell>
                                                                            <TableCell colSpan={2} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(totals.totalGrossWages).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell colSpan={4} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "18px", width: "25%" }} align="left"> <u>Deductions</u> </TableCell>
                                                                        </TableRow>
                                                                        {amalgamationData.epF10 != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> 10% EPF </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.epF10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.payCards != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Pay Cards </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.payCards).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.cashAdvance != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Cash Advance </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.cashAdvance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.festivalAdvance != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Festival Advance </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.festivalAdvance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.festivalSaving != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Festival Saving </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.festivalSaving).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.coopMembership != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Co-op membership </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.coopMembership).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.unionCheck != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Union Check </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.unionCheck).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.bankRecoveries != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Bank Loan </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.bankRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.templeRecoveries != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Temple Recoveries </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.templeRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.insuranceRecoveries != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Insurance Recoveries </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.insuranceRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.tea != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Tea </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.tea).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.welfare != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Welfare </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.welfare).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.creheFund != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Crehe Fund </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.creheFund).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.funeralFund != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Funeral Fund </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.funeralFund).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.dhoby != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Dhoby </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.dhoby).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.barber != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Barber </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.barber).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.waterSchemeRecoveries != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Water Scheme Recoveries </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.waterSchemeRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.foodStuffRecoveries != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Food Stuff Recoveries </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.foodStuffRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.foodPack != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Food Pack </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.foodPack).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.electricity != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Electricity </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.electricity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.coopRecoveries != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Co-op Recoveries </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.coopRecoveries).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.stamp != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Stamp </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.stamp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.saving != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Saving </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.saving).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.fine != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Fine </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.fine).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.otherDeductions != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Other Deductions </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.otherDeductions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        {amalgamationData.transport != 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> Transport </TableCell>
                                                                                <TableCell colSpan={2} style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="right"> {parseFloat(amalgamationData.transport).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                            </TableRow>
                                                                        ) : null}
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left"> {amalgamationData.tools != 0 ? "Tools" : ""} </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%" }} align="left">  </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "15px", width: "25%", borderBottom: "2px solid black" }} align="right"> {amalgamationData.tools != 0 ? (parseFloat(amalgamationData.tools).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : ""} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell colSpan={2} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "25%" }} align="left"> Total Deductions </TableCell>
                                                                            <TableCell colSpan={2} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "25%" }} align="right"> {parseFloat(totals.totalDeductions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        </Grid>
                                                        &nbsp;
                                                        <Grid style={{ border: "0px solid black", flex: 2, marginLeft: "0px", width: "200px" }}>
                                                            <Grid style={{ border: "2px solid black", marginLeft: "0px" }}>
                                                                <Table>
                                                                    <TableBody>
                                                                        <TableRow>
                                                                            <TableCell colSpan={2} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="center"> <u>EPF Contribution</u> </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="left"> EPF 10% </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(amalgamationData.epF10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="left"> EPF 12% </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(amalgamationData.epF12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="left"> EPF 22% </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(totals.EPF22).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell colSpan={2} style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="center"> <u>ETF Contribution</u> </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="left"> ETF 3% </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(amalgamationData.etF3).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                    </TableBody>
                                                                </Table>
                                                            </Grid>
                                                            <Grid style={{ border: "2px solid black", marginLeft: "0px", marginTop: "150px" }}>
                                                                <Table>
                                                                    <TableBody>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="left"> Balance Pay </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(totals.balancePay).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}  </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontSize: "16px", width: "50%" }} align="left"> Unpaid Coins </TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(amalgamationData.unpaidCoins).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="left"> Balance Payment Due</TableCell>
                                                                            <TableCell style={{ border: "0px solid black", fontWeight: "bold", fontSize: "16px", width: "50%" }} align="right"> {parseFloat(totals.balancePayDue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                                                        </TableRow>
                                                                    </TableBody>
                                                                </Table>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </CardContent>
                                            {amalgamationData.length != 0 ? (
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnRecord"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        className={classes.colorRecord}
                                                        onClick={createFile}
                                                        size="small"
                                                    >
                                                        EXCEL
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    {<ReactToPrint
                                                        documentTitle={'Amalgamation Report'}
                                                        trigger={() => (
                                                            <Button
                                                                color="primary"
                                                                id="btnRecord"
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
                                                            amalgamationDetails={amalgamationDetails}
                                                            amalgamationData={amalgamationData}
                                                            totals={totals}
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

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
    InputLabel,
    Paper,
    TableHead,
    TableRow,
    TableFooter
} from '@material-ui/core';
import CountUp from 'react-countup';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik, validateYupSchema } from 'formik';
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { useAlert } from "react-alert";
import _ from 'lodash';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import MaterialTable from "material-table";
import { CloudLightning } from 'react-feather';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableContainer from '@material-ui/core/TableContainer';
import { BorderLeft } from '@material-ui/icons';


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
    }
}));

const screenCode = 'DAILYWORKREPORT';

export default function DailyWorkReport(props) {
    const [title, setTitle] = useState("Daily Work Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [limit, setLimit] = useState(10);
    const [balancePay, setbalancePay] = useState();
    const [page, setPage] = useState(0);
    const [checkRollDeductionViewData, setCheckRollDeductionViewData] = useState({});
    const [factories, setFactories] = useState();
    const [divisions, setdivisions] = useState();
    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [stockBalanceDetails, setStockBalanceDetails] = useState([]);
    const [attendanceDetailsData, setAttendanceDetailsData] = useState([]);
    const [csvHeaders, setcsvHeaders] = useState([]);
    const [daysInMonth, setdaysInMonth] = useState([]);
    const [ItemCategoryList, setItemCategoryList] = useState();
    const [factoryItems, setFactoryItems] = useState();
    const [fromDate, handleFromDate] = useState(new Date());
    const [toDate, handleToDate] = useState(new Date());

    const [totalValues, setTotalValues] = useState({
        totalAmount: 0,
    });

    const [DailyWorkReportInput, setDailyWorkReportInput] = useState({
        groupID: '0',
        factoryID: '0',
        divisionID: '0',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10)
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const monthDaysForExcel = [
        "workedDate",
        "empNo",
        "belowNoarmD",
        "belowNoamKiloss",
        "belowNoarmD",
        "totalKilos",
        "overKilo",
        "sundryExtraRate",
        "doubleOT",
        "dayOT",
        "nightOT",
        "doubleOT",
        "cashSundryName",
        "cashSundryName",
        "cashPluking",
        "belowNoarmD",
    ];

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        factoryName: "",
        groupName: "",
        divisionname: "",
        startDate: "",
        endDate: ""
    });

    const [selectedGroups, setSelectedGroups] = useState([]); const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };

    const navigate = useNavigate();
    const [isTableHide, setIsTableHide] = useState(false);
    const alert = useAlert();
    const componentRef = useRef();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [DailyWorkReportInput.groupID]);

    useEffect(() => {
        trackPromise(getAllActiveItemCategory())
    }, []);

    useEffect(() => {
        trackPromise(getDivisionDetailsByEstateID())
    }, [DailyWorkReportInput.factoryID]);

    useEffect(() => {
        setIsTableHide(false)
    }, [DailyWorkReportInput.divisionID, DailyWorkReportInput.month, DailyWorkReportInput.year]);

    useEffect(() => {
        const currentDate = new Date();
        const previousMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            currentDate.getDate()
        );
        setSelectedDate(currentDate);
    }, []);


    useEffect(() => {
        setDailyWorkReportInput({
            ...DailyWorkReportInput,
            endDate: endDay
        })
    }, [DailyWorkReportInput.startDate])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYWORKREPORT');

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

        setDailyWorkReportInput({
            ...DailyWorkReportInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factories = await services.getFactoriesByGroupID(DailyWorkReportInput.groupID);
        setFactories(factories);
    }

    async function getAllActiveItemCategory() {
        const result = await services.getAllActiveItemCategory();
        setItemCategoryList(result);
    }

    async function getDivisionDetailsByEstateID() {
        const divisions = await services.getDivisionDetailsByEstateID(DailyWorkReportInput.factoryID);
        setdivisions(divisions);
    }

    async function GetDailyDetails() {
        trackPromise(GetDailyWorkReportDetails())
    }

    async function GetDailyWorkReportDetails() {
        var date = new Date();
        var month = date.getUTCMonth() + 1;
        var year = date.getUTCFullYear();
        let model = {
            groupID: parseInt(DailyWorkReportInput.groupID),
            factoryID: parseInt(DailyWorkReportInput.factoryID),
            divisionID: DailyWorkReportInput.divisionID == 0 ? null : parseInt(DailyWorkReportInput.divisionID),
            startDate: (DailyWorkReportInput.startDate),
            endDate: (DailyWorkReportInput.endDate),
        }
        getSelectedDropdownValuesForReport(model);


        const balancePay = await services.GetDailyWorkReportDetails(model);

        if (balancePay.statusCode == "Success" && balancePay.data != null) {

            balancePay.data.forEach(x => {

                if (x.totalKilos >= x.totalNoam) {
                    x.overKilos = x.totalKilos - x.totalNoam
                    x.belowNoamKiloss = 0

                }
                else if (x.totalKilos <= x.totalNoam) {
                    x.belowNormKilo = x.totalKilos
                    x.overKilo = 0
                }

                if (x.belowNormKilo > 0) {
                    x.belowNoarmD = 1
                }

            });

            setAttendanceDetailsData(balancePay.data);
            setIsTableHide(true);
            createDataForExcel(balancePay.data);

            if (balancePay.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error(balancePay.message);
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Worked Date': moment(x.date).format('YYYY-MM-DD'),
                    'Emp No': x.empNo,
                    'Below Noarm Days': x.belowNoarmD,
                    'Below Noarm Kilos': x.belowNormKilo,
                    'Total Noam': x.totalName,
                    'Total Kilos': x.totalKilos,
                    'Over Kilos': x.overKilo,
                    'Sundry Extra Rate': x.sundryName,
                    'cashSundryName': x.sundryExtraRate,
                    'day OT': x.dayOT,
                    'night OT': x.nightOT,
                    'double OT': x.doubleOT,
                    'cash Sundry Name': x.cashSundryName,
                    'Contract Plucking': x.ContractPlucking,
                    'Cash Plucking': x.cashPluking,
                    'PI Days': x.totalName
                }
                res.push(vr);
            });
        }
        return res;
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

    const specificMonth = DailyWorkReportInput.startDate ? new Date(DailyWorkReportInput.startDate) : new Date();
    const firstDay = specificMonth.toISOString().split('T')[0];
    const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
    const lastDay = lastDayOfMonth.toISOString().split('T')[0];
    const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];

    async function createDataForExcel(array) {
        var result = [];

        if (array != null) {

            array.forEach(x => {
                result.push({
                    workedDate: x.workedDate.split('T')[0],
                    empNo: x.empNo == 0 ? '-' : x.empNo,
                    belowNoarmD: x.belowNoarmD == 0 ? '-' : x.belowNoarmD,
                    belowNormKilo: x.belowNormKilo == 0 ? '-' : x.belowNormKilo,
                    totalName: x.totalName == 0 ? '-' : x.totalName,
                    totalKilos: x.totalKilos == 0 ? '-' : x.totalKilos,
                    overKilo: x.overKilo == 0 ? '-' : x.overKilo,
                    sundryName: x.sundryName == 0 ? '-' : x.sundryName,
                    sundryExtraRate: x.sundryExtraRate == '-',
                    dayOT: x.dayOT == 0 ? '-' : x.dayOT,
                    nightOT: x.nightOT == 0 ? '-' : x.nightOT,
                    doubleOT: x.doubleOT == 0 ? '-' : x.doubleOT,
                    cashSundryName: x.cashSundryName == null ? '-' : x.cashSundryName,
                    ContractPlucking: x.ContractPlucking === null ? '-' : x.ContractPlucking,
                    cashPluking: x.cashPluking == 0 ? '-' : x.cashPluking,
                    totalName: x.totalName == 0 ? '-' : x.totalName

                });
            }
            );
            result.push({
            })

            result.push({
                workedDate: 'Estate : ' + selectedSearchValues.factoryName,
                workedDate: 'Group : ' + selectedSearchValues.groupName
            });
            result.push({
                workedDate: 'Estate : ' + selectedSearchValues.factoryName,
            });

            result.push({
                workedDate: 'Division : ' + selectedSearchValues.divisionname
            });

            result.push({
                workedDate: 'Start Date : ' + selectedSearchValues.startDate
            });

            result.push({
                workedDate: 'End Date : ' + selectedSearchValues.endDate
            });
        }
        return result;
    }

    async function createFile() {
        var file = await createDataForExcel(attendanceDetailsData);
        var settings = {
            sheetName: 'Daily Work Report ',
            fileName: 'Daily Work Report ' + ' - ' + selectedSearchValues.startDate + '/' + selectedSearchValues.endDate,
            writeOptions: {}
        }

        let keys = monthDaysForExcel
        let tempcsvHeaders = csvHeaders;
        tempcsvHeaders.push({ label: 'Worked Date', value: 'workedDate' })
        tempcsvHeaders.push({ label: 'Emp ID', value: 'empNo' })
        tempcsvHeaders.push({ label: 'Below Noarm Days', value: 'belowNoarmD' })
        tempcsvHeaders.push({ label: 'Below Norm Kilo', value: 'belowNormKilo' })
        tempcsvHeaders.push({ label: 'Total Name', value: 'totalName' })
        tempcsvHeaders.push({ label: 'Total Kilos', value: 'totalKilos' })
        tempcsvHeaders.push({ label: 'Over Kilos', value: 'overKilo' })
        tempcsvHeaders.push({ label: 'Sundry Name', value: 'sundryName' })
        tempcsvHeaders.push({ label: 'Sundry Extra Rate', value: '-' })
        tempcsvHeaders.push({ label: 'OT AM', value: 'dayOT ' })
        tempcsvHeaders.push({ label: 'OT PM', value: 'nightOT' })
        tempcsvHeaders.push({ label: 'OT SUN', value: 'doubleOT' })
        tempcsvHeaders.push({ label: 'Cash Sundry Name', value: 'cashSundryName' })
        tempcsvHeaders.push({ label: 'Contract Plucking', value: '-' })
        tempcsvHeaders.push({ label: 'Cash Plucking', value: 'cashPluking' })
        tempcsvHeaders.push({ label: 'PI Days', value: 'totalName' })
        let dataA = [
            {
                sheet: 'Daily Work Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }
    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setDailyWorkReportInput({
            ...DailyWorkReportInput,
            [e.target.name]: value
        });
        setStockBalanceDetails([]);
        setAttendanceDetailsData([]);
    }

    function clearTable() {
        clearState();
    }

    function clearState() {
        setDailyWorkReportInput({
            ...DailyWorkReportInput,
            divisionID: 0,
            startDate: new Date().toISOString().substring(0, 10),
            endDate: new Date().toISOString().substring(0, 10)

        });
        setIsTableHide(true);
        setAttendanceDetailsData([]);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            factoryName: factories[searchForm.factoryID],
            divisionname: divisions[searchForm.divisionID],
            startDate: searchForm.startDate,
            endDate: searchForm.endDate
        })
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: DailyWorkReportInput.groupID,
                            factoryID: DailyWorkReportInput.factoryID,
                            divisionID: DailyWorkReportInput.divisionID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                divisionID: Yup.number().required('Division is required').min("1", 'Division is required'),
                            })
                        }
                        enableReinitialize
                    >
                        {({ errors, handleBlur, handleSubmit, touched }) => (
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
                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={DailyWorkReportInput.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="factoryID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={DailyWorkReportInput.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="divisionID">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField
                                                            select
                                                            fullWidth
                                                            error={Boolean(
                                                                touched.divisionID && errors.divisionID
                                                            )}
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            name="divisionID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={DailyWorkReportInput.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>

                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="startDate">
                                                            From Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="startDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={DailyWorkReportInput.startDate}
                                                            variant="outlined"
                                                            id="startDate"
                                                            size='small'
                                                            onKeyPress={(e) => {
                                                                if (e.key >= '0' && e.key <= '9') {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="endDate">
                                                            To Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="endDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={DailyWorkReportInput.endDate}
                                                            variant="outlined"
                                                            id="endDate"
                                                            size='small'
                                                            InputProps={{
                                                                inputProps: {
                                                                    min: firstDay,
                                                                    max: lastDay,
                                                                },
                                                            }}
                                                            onKeyPress={(e) => {
                                                                if (e.key >= '0' && e.key <= '9') {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        />
                                                    </Grid>

                                                    <br /><br />

                                                    <Grid container justify="flex-end">
                                                        <Box pr={2}>
                                                            <Button
                                                                color="primary"
                                                                variant="outlined"
                                                                type="submit"
                                                                onClick={clearTable}
                                                            >
                                                                Clear
                                                            </Button>
                                                        </Box>
                                                        <Box pr={2}>
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                type="submit"
                                                                onClick={() => trackPromise(GetDailyDetails())}
                                                            >
                                                                Search
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>

                                                <br /> <br /> <br />

                                                {attendanceDetailsData.length > 0 ?
                                                    <Box minWidth={1050}>
                                                        <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto', borderBottom: '2px solid black' }}>
                                                            <Table className={classes.table} size="small" aria-label="sticky table" Table stickyHeader >
                                                                <TableHead style={{ position: "sticky", top: 0, zIndex: 1000, background: "white" }}>
                                                                    <TableRow style={{ borderTop: "1px solid black" }}>
                                                                        <TableCell style={{ borderLeft: "2px solid black", borderRight: "0px", fontWeight: "bold", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> Worked Date</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", fontWeight: "bold", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> Emp No </TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", fontWeight: "0px", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> Below Norm Days</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> Below Norm Kilos</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> Total Name</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> Total Kilos</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> Over Kilos</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> Sundry Name</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> Sundry Extra Rate</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> OT AM</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> OT PM</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", borderRight: "2px solid black", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> OT SUN</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px solid black", borderRight: "0px", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> Cash Sundry name</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> Contract Plucking</TableCell>
                                                                        <TableCell style={{ borderLeft: "0px", borderRight: "2px solid black", fontWeight: "bold", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> Cash Plucking</TableCell>
                                                                        <TableCell style={{ border: "0px", borderRight: "2px solid black", fontWeight: "20px solid bold", width: "15%", borderTop: "2px solid black ", borderBottom: "2px solid black", fontWeight: "bold" }} align="center"> PI Days</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody style={{ borderBottom: "2px solid black" }}>
                                                                    {attendanceDetailsData.map((row, index) => {
                                                                        return (
                                                                            <TableRow key={index} style={{ borderBottom: "2px solid black" }}>
                                                                                <TableCell style={{ borderLeft: "2px solid black", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {moment(row.workedDate).format("DD/MM/YY")}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {row.empNo}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {row.belowNoarmD == null ? '-' : row.belowNoarmD}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {row.belowNormKilo == 0 ? '-' : row.belowNormKilo}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {row.totalName == 0 ? '-' : row.totalName}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {row.totalKilos == 0 ? '-' : row.totalKilos}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {row.overKilo == 0 ? '-' : row.overKilo}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {row.sundryName == 0 ? '-' : row.sundryName}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {'-'}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {row.dayOT == 0 ? '-' : row.dayOT}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {row.nightOT == 0 ? '-' : row.nightOT}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "2px solid black", }} align="left" component="th" scope="row">
                                                                                    {row.doubleOT == 0 ? '-' : row.doubleOT}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {row.cashSundryName == 0 ? '-' : row.cashSundryName}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                                                    {'-'}
                                                                                </TableCell>
                                                                                <TableCell style={{ borderLeft: "0px", borderRight: "2px solid black", }} align="left" component="th" scope="row">
                                                                                    {row.cashPluking == 5 ? row.totalKilos : '-'}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "0px", borderRight: "2px solid black", }} align="left" component="th" scope="row">
                                                                                    {row.totalName == 0 ? '-' : row.totalName}
                                                                                </TableCell>

                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </Box>

                                                    : null}
                                            </CardContent>
                                            {attendanceDetailsData.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
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
                                                    <div>&nbsp;</div>

                                                    {<ReactToPrint
                                                        documentTitle={'Daily Work Report'}
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
                                                    <style>
                                                        {`
                                                @page {
                                                size: A4 landscape; /* Set the size and orientation here */
                                                margin: 20mm; /* Adjust the margin as needed */
                                                }
                                                `}
                                                    </style>
                                                    {<div hidden={true}>
                                                        <CreatePDF
                                                            ref={componentRef}
                                                            selectedSearchValues={selectedSearchValues}
                                                            searchDate={DailyWorkReportInput}
                                                            attendanceDetailsData={attendanceDetailsData}
                                                            total={totalAmount}

                                                        />
                                                    </div>}
                                                </Box>
                                                : null}
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment >
    );


}
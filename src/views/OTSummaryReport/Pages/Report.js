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

const screenCode = 'OTSUMMARYREPORT';

export default function OTSummaryReport(props) {
    const [title, setTitle] = useState("OT Summary Report")
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

    const [OTSummaryReportInput, setStockBalanceReportInput] = useState({
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

    const monthDaysForExcel = ["registrationNumber", "firstName", "dayOT", "nightOT", "sundayOT", "totCol"];

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
    }, [OTSummaryReportInput.groupID]);

    useEffect(() => {
        trackPromise(getAllActiveItemCategory())
    }, []);


    useEffect(() => {
        trackPromise(getDivisionDetailsByEstateID())
    }, [OTSummaryReportInput.factoryID]);

    useEffect(() => {
        setIsTableHide(false)
    }, [OTSummaryReportInput.divisionID, OTSummaryReportInput.month, OTSummaryReportInput.year]);

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
        if (stockBalanceDetails.length != 0) {
            calculateTotalQty()
        }
    }, [stockBalanceDetails]);

    useEffect(() => {
        setStockBalanceReportInput({
            ...OTSummaryReportInput,
            endDate: endDay
        })
    }, [OTSummaryReportInput.startDate])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWOTSUMMARYREPORT');

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

        setStockBalanceReportInput({
            ...OTSummaryReportInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factories = await services.getFactoriesByGroupID(OTSummaryReportInput.groupID);
        setFactories(factories);
    }

    async function getAllActiveItemCategory() {
        const result = await services.getAllActiveItemCategory();
        setItemCategoryList(result);
    }

    async function getDivisionDetailsByEstateID() {
        const divisions = await services.getDivisionDetailsByEstateID(OTSummaryReportInput.factoryID);
        setdivisions(divisions);
    }

    async function GetDetails() {
        trackPromise(GetOTSummaryReportDetails())
    }

    async function GetOTSummaryReportDetails() {
        var date = new Date();
        var month = date.getUTCMonth() + 1;
        var year = date.getUTCFullYear();
        let model = {
            groupID: parseInt(OTSummaryReportInput.groupID),
            factoryID: parseInt(OTSummaryReportInput.factoryID),
            divisionID: parseInt(OTSummaryReportInput.divisionID),
            startDate: (OTSummaryReportInput.startDate),
            endDate: (OTSummaryReportInput.endDate),
        }
        getSelectedDropdownValuesForReport(model);


        const balancePay = await services.GetOTSummaryReportDetails(model);
        if (balancePay.statusCode == "Success" && balancePay.data != null) {
            balancePay.data.forEach(x => {
                let totdayOt = 0;
                let totNightOt = 0;
                let totSundayOt = 0;
                let tot = 0;

                totdayOt += (x.dayOT)
                x.totaldayOt = totdayOt;

                totNightOt += (x.nightOT)
                x.totalNightOt = totNightOt;

                totSundayOt += (x.sundayOT)
                x.totalSundayOt = totSundayOt;

                tot += (x.dayOT + x.nightOT + x.sundayOT)
                x.totCol = tot;
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

    function calculateTotalQty() {
        const totalAmount = stockBalanceDetails.reduce((accumulator, current) => accumulator + current.amount, 0);
        setTotalValues({
            ...totalValues,
            totalAmount: totalAmount
        })
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Date': moment(x.date).format('YYYY-MM-DD'),
                    'Employee Number': x.employeeName,
                    'Name': x.employeeNumber,
                    'Amount(Rs.)': x.amount
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

    const specificMonth = OTSummaryReportInput.startDate ? new Date(OTSummaryReportInput.startDate) : new Date();
    const firstDay = specificMonth.toISOString().split('T')[0];
    const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
    const lastDay = lastDayOfMonth.toISOString().split('T')[0];
    const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];

    async function createDataForExcel(array) {

        var result = [];
        var dayTotals = {};
        var totalAmountSum = 0;

        if (array != null) {

            array.forEach(x => {
                result.push({
                    registrationNumber: x.registrationNumber,
                    firstName: x.firstName,
                    dayOT: x.dayOT == 0 ? '-' : x.dayOT,
                    nightOT: x.nightOT == 0 ? '-' : x.nightOT,
                    sundayOT: x.sundayOT == 0 ? '-' : x.sundayOT,
                    totCol: x.totCol == 0 ? '-' : x.totCol
                });
            }
            );
            result.push(dayTotals);
            result.push({
                registrationNumber: 'Total :',
                dayOT: array.reduce((total, row) => (total + parseFloat(row.totaldayOt)), 0) == 0 ? '-' : array.reduce((total, row) => (total + parseFloat(row.totaldayOt)), 0),
                nightOT: array.reduce((total, row) => (total + parseFloat(row.totalNightOt)), 0) == 0 ? '-' : array.reduce((total, row) => (total + parseFloat(row.totalNightOt)), 0),
                sundayOT: array.reduce((total, row) => (total + parseFloat(row.totalSundayOt)), 0) == 0 ? '-' : array.reduce((total, row) => (total + parseFloat(row.totalSundayOt)), 0),
                totCol: array.reduce((total, row) => (total + parseFloat(row.totCol)), 0) == 0 ? '-' : array.reduce((total, row) => (total + parseFloat(row.totCol)), 0)
            });

            result.push({
                firstName: 'Estate : ' + selectedSearchValues.factoryName,
                registrationNumber: 'Group : ' + selectedSearchValues.groupName
            });

            result.push({
                registrationNumber: 'Division : ' + selectedSearchValues.divisionname
            });

            result.push({
                registrationNumber: 'Start Date : ' + selectedSearchValues.startDate
            });

            result.push({
                registrationNumber: 'End Date : ' + selectedSearchValues.endDate
            });
        }
        return result;
    }

    async function createFile() {
        var file = await createDataForExcel(attendanceDetailsData);
        var settings = {
            sheetName: 'Employee OT Summary ',
            fileName: 'Employee OT Summary ' + ' - ' + selectedSearchValues.startDate + '/' + selectedSearchValues.endDate,
            writeOptions: {}
        }

        let keys = monthDaysForExcel
        let tempcsvHeaders = csvHeaders;
        tempcsvHeaders.push({ label: 'Employee Number', value: 'registrationNumber' })
        tempcsvHeaders.push({ label: 'Employee Name', value: 'firstName' })
        tempcsvHeaders.push({ label: 'Day OT', value: 'dayOT' })
        tempcsvHeaders.push({ label: 'Night OT', value: 'nightOT' })
        tempcsvHeaders.push({ label: 'Sunday OT', value: 'sundayOT' })
        tempcsvHeaders.push({ label: 'Total', value: 'totCol' })
        let dataA = [
            {
                sheet: 'OT Summary  Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }
    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setStockBalanceReportInput({
            ...OTSummaryReportInput,
            [e.target.name]: value
        });
        setStockBalanceDetails([]);
        setAttendanceDetailsData([]);
    }

    function clearTable() {
        clearState();
    }

    function clearState() {
        setStockBalanceReportInput({
            ...OTSummaryReportInput,
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
            factoryName: factories[searchForm.factoryID],
            groupName: groups[searchForm.groupID],
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
                            groupID: OTSummaryReportInput.groupID,
                            factoryID: OTSummaryReportInput.factoryID,
                            divisionID: OTSummaryReportInput.divisionID
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
                                                            value={OTSummaryReportInput.groupID}
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
                                                            value={OTSummaryReportInput.factoryID}
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
                                                            value={OTSummaryReportInput.divisionID}
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
                                                            value={OTSummaryReportInput.startDate}
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
                                                            value={OTSummaryReportInput.endDate}
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
                                                                onClick={() => trackPromise(GetDetails())}
                                                            >
                                                                Search
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>

                                                <br /> <br /> <br />

                                                {attendanceDetailsData.length > 0 ?
                                                    <Box minWidth={1050}>
                                                        <TableContainer component={Paper}>
                                                            <Table className={classes.table} size="small" aria-label="simple table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="left"> Employee Number</TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="left"> Employee Name </TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="center"> Day OT</TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="center"> Night OT</TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="center"> Sunday OT</TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="center"> Total </TableCell>
                                                                    </TableRow>
                                                                </TableHead>

                                                                <TableBody>
                                                                    {attendanceDetailsData.map((row, index) => {
                                                                        return (
                                                                            <TableRow key={index}>
                                                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                                                    {row.registrationNumber}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                                                    {row.firstName}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black" }} align="center" component="th" scope="row">
                                                                                    {row.dayOT == 0 ? '-' : row.dayOT}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black" }} align="center" component="th" scope="row">
                                                                                    {row.nightOT == 0 ? '-' : row.nightOT}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black" }} align="center" component="th" scope="row">
                                                                                    {row.sundayOT == 0 ? '-' : row.sundayOT}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black" }} align="center" component="th" scope="row">
                                                                                    {row.totCol == 0 ? '-' : row.totCol}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>

                                                                <TableFooter>
                                                                    <TableRow>
                                                                        <TableCell className={`${classes.stickyColumn}`} colSpan={2} style={{ border: "2px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }}
                                                                            align="center">Total</TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", fontSize: "16px", color: "red", width: "15%" }} align="center">
                                                                            {attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totaldayOt)), 0) === 0 ? '-' : attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totaldayOt)), 0)}
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", fontSize: "16px", color: "red", width: "15%" }} align="center">
                                                                            {attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totalNightOt)), 0) === 0 ? '-' : attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totalNightOt)), 0)}
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", fontSize: "16px", color: "red", width: "15%" }} align="center">
                                                                            {attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totalSundayOt)), 0) === 0 ? '-' : attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totalSundayOt)), 0)}
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", fontSize: "16px", color: "red", width: "20%" }} align="center">
                                                                            {attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totCol)), 0) === 0 ? '-' : attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totCol)), 0)}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableFooter>
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
                                                        documentTitle={'OT Summary Report'}
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
                                                    </style>
                                                    {<div hidden={true}>
                                                        <CreatePDF
                                                            ref={componentRef}
                                                            selectedSearchValues={selectedSearchValues}
                                                            searchDate={OTSummaryReportInput}
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
        </Fragment>
    );


}
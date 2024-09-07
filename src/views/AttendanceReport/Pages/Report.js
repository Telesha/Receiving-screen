import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, Button, makeStyles, Container, Divider, CardContent, CardHeader, Grid, TextField, MenuItem, InputLabel, Paper } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from 'yup';
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { useAlert } from "react-alert";
import _ from 'lodash';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

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

const screenCode = 'PAYROLLATTENDANCEREPORT';

export default function AttendanceReport(props) {
    const [title] = useState("Attendance Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [designation, setDesignation] = useState([]);
    const [selectedDate, setSelectedDate] = useState();
    const [attendanceDetails, setAttendanceDetails] = useState([]); const [csvHeaders] = useState([]);
    const [stockBalanceReportInput, setStockBalanceReportInput] = useState({
        groupID: '0',
        factoryID: '0',
        designationID: '0',
        year: '',
        monthName: ''
    });

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        factoryName: "",
        groupName: "",
        designationName: "",
        designationID: "",
        year: '',
        monthName: ''
    })

    const navigate = useNavigate();
    const alert = useAlert();
    const componentRef = useRef();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [stockBalanceReportInput.groupID]);

    useEffect(() => {
        trackPromise(getDesignationsForDropdown())
    }, [stockBalanceReportInput.factoryID]);

    useEffect(() => {
        const currentDate = new Date();
        handleDateChange(currentDate);
    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPAYROLLATTENDANCEREPORT');

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
            ...stockBalanceReportInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken()),
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factories = await services.getFactoriesByGroupID(stockBalanceReportInput.groupID);
        setFactories(factories);
    }

    async function getDesignationsForDropdown() {
        const designation = await services.getDesignationsByFactoryID(stockBalanceReportInput.factoryID);
        setDesignation(designation);
    }

    async function GetDetails() {

        const applicableYear = selectedDate.getFullYear().toString();
        const applicableMonth = (selectedDate.getMonth() + 1).toString();

        let model = {
            groupID: parseInt(stockBalanceReportInput.groupID),
            factoryID: parseInt(stockBalanceReportInput.factoryID),
            designationID: parseInt(stockBalanceReportInput.designationID),
            applicableMonth: applicableMonth,
            applicableYear: applicableYear
        }
        const response = await services.getAttendanceReportDetails(model);
        getSelectedDropdownValuesForReport(model);
        if (response.statusCode == "Success" && response.data != null) {
            setAttendanceDetails(response.data);
            if (response.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error(response.message);
        }
    }

    async function createDataForExcel(array) {
        var res = [];

        if (array != null) {
            array.map(x => {
                var vr = {
                    'Employee Registration Number': x.regNo,
                    'Employee Name': x.name,
                    'Designation': x.designationName,
                    'Monthly Attendance': x.daysCount
                };
                res.push(vr);
            });
            res.push({});
            var pr = {
                'Employee Registration Number': 'Group: ' + selectedSearchValues.factoryName
            }
            res.push(pr);
            var pr1 = {
                'Employee Registration Number': 'Estate: ' + selectedSearchValues.groupName
            }
            res.push(pr1);
            var pr2 = {
                'Employee Registration Number': 'Designation: ' + selectedSearchValues.designationName
            }
            res.push(pr2);
            var pr3 = {
                'Employee Registration Number': 'Date: ' + selectedSearchValues.year + '/' + selectedSearchValues.monthName
            }
            res.push(pr3);
        }

        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(attendanceDetails);
        var settings = {
            sheetName: 'Attendance Details Report',
            fileName:
                'Attendance Details Report ' +
                selectedSearchValues.factoryName +
                ' - ' +
                selectedSearchValues.groupName +
                ' ATTENDANCE DETAILS FOR THE MONTH OF ' +
                selectedSearchValues.monthName +
                ' - ' +
                selectedSearchValues.year,
            writeOptions: {}
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Attendance Details Report',
                columns: tempcsvHeaders,
                content: file
            }
        ];

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
        var month = date.getUTCMonth() + 1;
        var year = date.getUTCFullYear();
        var currentmonth = moment().format('MM');
        let monthName = monthNames[month - 1];

        setSelectedSearchValues({
            ...selectedSearchValues,
            monthName: monthName
        });

        if (selectedDate != null) {
            var prevMonth = selectedDate.getUTCMonth() + 1;
            var prevyear = selectedDate.getUTCFullYear();

            if ((prevyear == year && prevMonth != month) || prevyear != year) {
                setSelectedDate(date);
            }
        } else {
            setSelectedDate(date);
        }
        setAttendanceDetails([]);
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
        setStockBalanceReportInput({
            ...stockBalanceReportInput,
            [e.target.name]: value
        });
        setAttendanceDetails([]);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            factoryName: factories[searchForm.factoryID],
            groupName: groups[searchForm.groupID],
            designationName: searchForm.designationID == '0' ? "All" : designation[searchForm.designationID],
            year: searchForm.applicableYear,
            monthName: searchForm.applicableMonth
        })
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: stockBalanceReportInput.groupID,
                            factoryID: stockBalanceReportInput.factoryID,
                            designationID: stockBalanceReportInput.designationID,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
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
                                                            value={stockBalanceReportInput.groupID}
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
                                                            value={stockBalanceReportInput.factoryID}
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
                                                        <InputLabel shrink id="designationID">
                                                            Designation *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.designationID && errors.designationID)}
                                                            fullWidth
                                                            helperText={touched.designationID && errors.designationID}
                                                            size='small'
                                                            name="designationID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={stockBalanceReportInput.designationID}
                                                            variant="outlined"
                                                            id="designationID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Designation--</MenuItem>
                                                            {generateDropDownMenu(designation)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
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
                                                <Box display="flex" flexDirection="row-reverse" p={2} >
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        size='small'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                                <br />
                                                <Box minWidth={1050}>
                                                    {attendanceDetails.length > 0 ?
                                                        <TableContainer component={Paper}>
                                                            <Table
                                                                className={classes.table}
                                                                size="small"
                                                                aria-label="simple table"
                                                            >
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", textAlign: "left", width: "15%" }} align="left">
                                                                            Registration Number
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", textAlign: "left", width: "15%" }} align="left">
                                                                            Employee Name
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", textAlign: "left", width: "15%" }} align="left">
                                                                            Designation
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", textAlign: "right", width: "15%" }} align="right">
                                                                            Monthly Attendance
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {attendanceDetails.map((row, index) => {
                                                                        return (
                                                                            <TableRow key={index}>
                                                                                <TableCell style={{ border: "2px solid black", textAlign: "left" }} align="left" component="th" scope="row">
                                                                                    {row.regNo}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black", textAlign: "left" }} align="left" component="th" scope="row">
                                                                                    {row.name}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black", textAlign: "left" }} align="left" component="th" scope="row">
                                                                                    {row.designationName}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black", textAlign: "right" }} align="left" component="th" scope="row">
                                                                                    {row.daysCount}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                        : null}
                                                </Box>
                                            </CardContent>
                                            {attendanceDetails.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnRecord"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        className={classes.colorRecord}
                                                        onClick={createFile}
                                                        size='small'
                                                    >
                                                        EXCEL
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <ReactToPrint
                                                        trigger={() => <Button
                                                            color="primary"
                                                            id="btnCancel"
                                                            variant="contained"
                                                            style={{ marginRight: '1rem' }}
                                                            className={classes.colorCancel}
                                                            size='small'
                                                        >
                                                            PDF
                                                        </Button>}
                                                        content={() => componentRef.current}
                                                    />
                                                    <div hidden={true}>
                                                        <CreatePDF
                                                            ref={componentRef}
                                                            attendanceDetails={attendanceDetails}
                                                            stockBalanceReportInput={stockBalanceReportInput}
                                                            selectedSearchValues={selectedSearchValues}
                                                            SearchData={selectedSearchValues} />
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
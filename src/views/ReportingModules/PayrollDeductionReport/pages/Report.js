import React, { useState, useEffect, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    makeStyles,
    Container,
    CardHeader,
    Button,
    CardContent,
    Divider,
    MenuItem,
    Grid,
    InputLabel,
    TextField,
    TableRow,
    TableCell,
    TableContainer,
    Table,
    TableBody,
    TableHead
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAlert } from 'react-alert';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import xlsx from 'json-as-xlsx';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
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

const screenCode = 'PAYROLLDEDUCTIONREPORT';

export default function PayrollDeductionReport() {
    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);
    const [title, setTitle] = useState("Payroll Deduction Report");
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [deductionTypes, setDeductionTypes] = useState([]);
    const [isTableHide, setIsTableHide] = useState(false);
    const [payRollDeductionViewData, setPayRollDeductionViewData] = useState({});
    const [payRollDeductionViewDetails, setPayRollDeductionViewDetails] = useState({
        groupID: 0,
        estateID: 0,
        designationID: 0,
        deductionType: 0,
        empNo: '',
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    });
    const [selectedSearchReportValues, setSelectedSearchReportValues] = useState({
        groupName: '',
        estateName: '',
        designation: '',
        deductionType: '',
        empNo: '',
        year: '',
        month: ''
    });

    const [selectedDate, setSelectedDate] = useState(new Date());
    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const [totalValues, setTotalValues] = useState({});
    const componentRef = useRef();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        if (payRollDeductionViewDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        }
    }, [payRollDeductionViewDetails.groupID]);

    useEffect(() => {
        if (payRollDeductionViewDetails.estateID > 0) {
            trackPromise(getDesignationsByFactoryID());
        }
    }, [payRollDeductionViewDetails.estateID]);

    useEffect(() => {
        getDeductionTypes();
    }, [payRollDeductionViewDetails.deductionType]);

    useEffect(() => {
        setIsTableHide(false);
    }, [payRollDeductionViewDetails.designationID, payRollDeductionViewDetails.deductionType, payRollDeductionViewDetails.month, payRollDeductionViewDetails.year]);

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
        setPayRollDeductionViewDetails({
            ...payRollDeductionViewDetails,
            deductionType: '0',
            empNo: '',
            selectedDate: new Date()
        })
    }, [payRollDeductionViewDetails.designationID]);

    function generateDropDownMenu(data) {
        let items = [];
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items;
    }

    function handleChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        setPayRollDeductionViewDetails({
            ...payRollDeductionViewDetails,
            [name]: value,
        });
    }

    function handleDateChange(date) {
        var month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        var year = date.getUTCFullYear();

        setPayRollDeductionViewDetails({
            ...payRollDeductionViewDetails,
            month: month.toString(),
            year: year.toString()
        });
        setSelectedDate(date);
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find((p) => p.permissionCode == 'VIEWPAYROLLDEDUCTIONREPORT');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find((p) => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find((p) => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        });

        setPayRollDeductionViewDetails({
            ...payRollDeductionViewDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken()),
        });
    }

    async function getData() {
        let model = {
            groupID: parseInt(payRollDeductionViewDetails.groupID),
            estateID: parseInt(payRollDeductionViewDetails.estateID),
            designationID: parseInt(payRollDeductionViewDetails.designationID),
            deductionType: parseInt(payRollDeductionViewDetails.deductionType),
            empNo: (payRollDeductionViewDetails.empNo),
            year: parseInt(payRollDeductionViewDetails.year),
            month: parseInt(payRollDeductionViewDetails.month),
        };
        getSelectedDropdownValuesForReport(model);
        let response = await services.getPayRollDeductionReportDetail(model);
        if (response.statusCode === 'Success' && response.data.length !== 0) {
            setPayRollDeductionViewData(response.data);
            setIsTableHide(true);
        } else {
            alert.error('No records to display');
        }

        let amountTotal = 0;
        response.data.forEach((x) => {
            amountTotal += x.amount
        })
        setTotalValues({
            amountTotal: amountTotal.toFixed(2)
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(payRollDeductionViewDetails.groupID);
        setEstates(response);
    }

    async function getDesignationsByFactoryID() {
        var response = await services.getDesignationsByFactoryID(payRollDeductionViewDetails.estateID);
        setDesignation(response);
    }

    async function getDeductionTypes() {
        var response = await services.getDeductionTypes();
        setDeductionTypes(response);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchReportValues({
            ...selectedSearchReportValues,
            groupName: groups[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            designation: designation[searchForm.designationID],
            deductionType: deductionTypes[searchForm.deductionType],
            month: searchForm.month,
            year: searchForm.year
        });

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

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Employee No': x.employeeNo,
                    'Emplpoyee Name': x.employeeName,
                    'Designation': x.designation,
                    'Deduction Type': x.deductionType,
                    'Date': x.date,
                    'Amount': ' '.repeat(10) + x.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                }
                res.push(vr);
            });
            res.push({});
            var vr = {
                'Employee No': 'Total Amount :',
                'Amount': totalValues.amountTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }
            res.push(vr);

            res.push({});
            var vr = {
                'Employee No': 'Group : ' + selectedSearchReportValues.groupName,
                'Emplpoyee Name': 'Estate : ' + selectedSearchReportValues.estateName,
            };
            res.push(vr);
            var vr = {
                'Employee No': 'Month : ' + selectedSearchReportValues.month,
                'Emplpoyee Name': 'Year : ' + selectedSearchReportValues.year,
            }
            res.push(vr);
        }
        return res;
    }

    async function createFile() {

        var file = await createDataForExcel(payRollDeductionViewData);
        var settings = {
            sheetName: 'Payroll Deduction Report',
            fileName: 'Payroll Deduction Report ' + selectedSearchReportValues.startDate + '/' + selectedSearchReportValues.endDate,
            writeOptions: {}
        }

        let keys = Object.keys(file[0])
        let tempcsvHeaders = [];
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })

        let dataA = [
            {
                sheet: 'Payroll Deduction Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    function clearFields() {
        setPayRollDeductionViewDetails({
            ...payRollDeductionViewDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken()),
            designationID: 0,
            deductionType: 0,
            empNo: '',
            month:0,
            year:0,
        });
        const currentDate = new Date();
        const previousMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
        );
        setSelectedDate(previousMonth);
        setPayRollDeductionViewData([]);
        setTotalValues({
            totalAmount: 0,
        });
        setIsTableHide(false);
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: payRollDeductionViewDetails.groupID,
                        estateID: payRollDeductionViewDetails.estateID,
                        designationID: payRollDeductionViewDetails.designationID,
                        deductionType: payRollDeductionViewDetails.deductionType,
                        empNo: payRollDeductionViewDetails.empNo,
                        month: payRollDeductionViewDetails.month,
                        year: payRollDeductionViewDetails.year,
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Group required').min('1', 'Group is required'),
                            estateID: Yup.number().required('Factory required').min('1', 'Factory is required'),
                        })
                    }
                    onSubmit={() => trackPromise(getData())}
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
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Group  *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        helperText={touched.groupID && errors.groupID}
                                                        fullWidth
                                                        name="groupID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={payRollDeductionViewDetails.groupID}
                                                        variant="outlined"
                                                        size="small"
                                                        onBlur={handleBlur}
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled,
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Group--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="estateID">
                                                        Estate *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.estateID && errors.estateID)}
                                                        fullWidth
                                                        helperText={touched.estateID && errors.estateID}
                                                        name="estateID"
                                                        placeholder='--Select Estate--'
                                                        onBlur={handleBlur}
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={payRollDeductionViewDetails.estateID}
                                                        variant="outlined"
                                                        id="estateID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value={0}>--Select Estate--</MenuItem>
                                                        {generateDropDownMenu(estates)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="designationID">
                                                        Designation
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.designationID && errors.designationID)}
                                                        helperText={touched.designationID && errors.designationID}
                                                        fullWidth
                                                        name="designationID"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={payRollDeductionViewDetails.designationID}
                                                        variant="outlined"
                                                    >
                                                        <MenuItem value="0">--Select Designation--</MenuItem>
                                                        {generateDropDownMenu(designation)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="deductionType">
                                                        Deduction Type
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.deductionType && errors.deductionType)}
                                                        helperText={touched.deductionType && errors.deductionType}
                                                        fullWidth
                                                        name="deductionType"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={payRollDeductionViewDetails.deductionType}
                                                        variant="outlined"
                                                    >
                                                        <MenuItem value="0">--Select Deduction Type--</MenuItem>
                                                        {generateDropDownMenu(deductionTypes)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="empNo">
                                                        Employee Number
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.empNo && errors.empNo)}
                                                        helperText={touched.empNo && errors.empNo}
                                                        fullWidth
                                                        name="empNo"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={payRollDeductionViewDetails.empNo}
                                                        variant="outlined"
                                                    />
                                                </Grid>
                                                <Grid item md={3} xs={12}>
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
                                                <Grid item md={12} xs={12}>
                                                    <Grid container justify="flex-end">
                                                        <Box pr={3}>
                                                            <Button
                                                                color="primary"
                                                                variant="outlined"
                                                                onClick={clearFields}
                                                            >
                                                                Clear
                                                            </Button>
                                                        </Box>
                                                        <Box pr={2}>
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                type="submit"
                                                            >
                                                                Search
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <br />
                                            <Box minWidth={1050}>
                                                {payRollDeductionViewData.length > 0 && isTableHide ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow style={{ border: "2px solid black" }}>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black" }}>Employee No</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black" }}>Employee Name</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black" }}>Designation</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black" }}>Deduction Type</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black" }}>Date</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black" }}>Amount (Rs.)</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {payRollDeductionViewData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow style={{ border: "2px solid black" }} key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.employeeNo}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.employeeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.designation}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.deductionType}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {new Date(row.date).toLocaleDateString()}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            <TableRow style={{ border: "2px solid black" }}>
                                                                <TableCell colSpan={5} align={'left'} style={{ borderBottom: "none", border: "2px solid black" }} ><b><strong>Total</strong></b></TableCell>
                                                                <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "2px solid black" }}>
                                                                    {totalValues && totalValues.amountTotal !== undefined
                                                                        ? `Rs. ${Number(totalValues.amountTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                                        : 'N/A'
                                                                    }
                                                                </TableCell>
                                                            </TableRow>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={payRollDeductionViewData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer>
                                                    : null}
                                            </Box>
                                        </CardContent>
                                        {payRollDeductionViewData.length > 0 && isTableHide ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    type="submit"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={createFile}
                                                    size='small'
                                                >
                                                    EXCEL
                                                </Button>
                                                <ReactToPrint
                                                    documentTitle={"Payroll Deduction Report"}
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
                                                    <CreatePDF ref={componentRef}
                                                        selectedSearchValues={selectedSearchReportValues} searchDate={payRollDeductionViewData} checkRollDeductionViewData={payRollDeductionViewData}
                                                        totalValues={totalValues} />
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
    )
}
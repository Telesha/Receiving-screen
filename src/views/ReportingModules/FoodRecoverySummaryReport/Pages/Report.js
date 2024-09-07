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
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
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

const screenCode = 'FOODRECOVERYSUMMARYREPORT';

export default function FoodRecoverySummaryReport(props) {
    const [title, setTitle] = useState("Food Recovery Summary Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);
    const [factories, setFactories] = useState();
    const [divisions, setdivisions] = useState();
    const [isShowTable, setIsShowTable] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [foodRecoveryDetailsData, setFoodRecoveryeDetailsData] = useState([]);
    const [csvHeaders, setcsvHeaders] = useState([]);
    const [ItemCategoryList, setItemCategoryList] = useState();

    const [totalValues, setTotalValues] = useState({
        totalAmount: 0,
    });

    const [FoodRecoverList, setFoodRecoverList] = useState({
        groupID: 0,
        factoryID: 0,
        divisionID: 0,
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    });

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const monthDaysForExcel = ["registrationNumber", "firstName", "foodItemName", "quantity", "amount"];

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        factoryName: "",
        groupName: "",
        divisionname: "",
        monthName: "",
        year: ""
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
    }, [FoodRecoverList.groupID]);

    useEffect(() => {
        trackPromise(getAllActiveItemCategory())
    }, []);


    useEffect(() => {
        trackPromise(getDivisionDetailsByEstateID())
    }, [FoodRecoverList.factoryID]);

    useEffect(() => {
        setIsTableHide(false)
    }, [FoodRecoverList.divisionID, FoodRecoverList.month, FoodRecoverList.year]);

    useEffect(() => {
        setFoodRecoverList({
            ...FoodRecoverList,
            year: new Date().getUTCFullYear().toString(),
            month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
        });
    }, [FoodRecoverList.divisionID]);

    useEffect(() => {
        if (foodRecoveryDetailsData.length != 0) {
            calculateTotalQty()
        }
    }, [foodRecoveryDetailsData]);

    useEffect(() => {
        setDate()
    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFOODRECOVERYSUMMARYREPORT');

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

        setFoodRecoverList({
            ...FoodRecoverList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factories = await services.getFactoriesByGroupID(FoodRecoverList.groupID);
        setFactories(factories);
    }

    async function getAllActiveItemCategory() {
        const result = await services.getAllActiveItemCategory();
        setItemCategoryList(result);
    }

    async function getDivisionDetailsByEstateID() {
        const divisions = await services.getDivisionDetailsByEstateID(FoodRecoverList.factoryID);
        setdivisions(divisions);
    }

    async function GetDetails() {
        trackPromise(GetSummaryReportDetails())
    }

    async function GetSummaryReportDetails() {
        var date = new Date();
        var month = date.getUTCMonth() + 1;
        var year = date.getUTCFullYear();
        let model = {
            groupID: parseInt(FoodRecoverList.groupID),
            factoryID: parseInt(FoodRecoverList.factoryID),
            divisionID: FoodRecoverList.divisionID == 0 ? null : parseInt(FoodRecoverList.divisionID),
            month: (new Date(selectedDate).getUTCMonth() + 1).toString().padStart(2, '0'),
            year: new Date(selectedDate).getUTCFullYear().toString()
        }
        getSelectedDropdownValuesForReport(model);

        const response = await services.GetSummaryReportDetails(model);

        if (response.statusCode == "Success") {
            setFoodRecoveryeDetailsData(response.data);
            setIsTableHide(true);
            createDataForExcel(response.data);

            response.data.forEach(x => {
                let total = 0;

            })
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

    function setDate() {
        let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var month = (FoodRecoverList.month);
        let monthName = monthNames[month - 1];

        setSelectedSearchValues({
            ...selectedSearchValues,
            monthName: monthName
        });
    }

    function calculateTotalQty() {
        const quantity = foodRecoveryDetailsData.reduce((accumulator, current) => accumulator + parseInt(current.quantity), 0);
        const amount = foodRecoveryDetailsData.reduce((accumulator, current) => accumulator + parseInt(current.amount), 0);

        setTotalValues({
            ...totalValues,
            quantity: quantity,
            amount: amount
        })
    }

    async function createDataForExcel(array) {

        var result = [];
        var dayTotals = {};

        if (array != null) {

            array.forEach(x => {
                result.push({
                    employeeNumber: x.employeeNumber,
                    employeeName: x.employeeName,
                    foodItemName: x.foodItemName == 0 ? '-' : x.foodItemName,
                    quantity: x.quantity == 0 ? '-' : x.quantity,
                    amount: x.amount == 0 ? '-' : x.amount,
                });
            }
            );
            result.push(dayTotals);
            result.push({
                employeeNumber: 'Total :',

                quantity: array.reduce((total, row) => (total + parseFloat(row.quantity)), 0) == 0 ? '-' : array.reduce((total, row) => (total + parseFloat(row.quantity)), 0),
                amount: array.reduce((total, row) => (total + parseFloat(row.amount)), 0) == 0 ? '-' : array.reduce((total, row) => (total + parseFloat(row.amount)), 0),

            });

            result.push({
                employeeName: 'Estate : ' + selectedSearchValues.factoryName,
                employeeNumber: 'Group : ' + selectedSearchValues.groupName
            });

            result.push({
                employeeNumber: 'Division : ' + selectedSearchValues.divisionname
            });

            result.push({
                employeeNumber: 'Month : ' + selectedSearchValues.monthName
            });

            result.push({
                employeeNumber: 'Year : ' + selectedSearchValues.year
            });
        }
        return result;
    }

    async function createFile() {
        var file = await createDataForExcel(foodRecoveryDetailsData);
        var settings = {
            sheetName: 'Food Recovery Summary Report ',
            fileName: 'Food Recovery Summary  ' + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName + ' - ' + selectedSearchValues.year + ' / ' + selectedSearchValues.monthName,
            writeOptions: {}
        }

        let keys = monthDaysForExcel
        let tempcsvHeaders = csvHeaders;
        tempcsvHeaders.push({ label: 'Employee Number', value: 'employeeNumber' })
        tempcsvHeaders.push({ label: 'Employee Name', value: 'employeeName' })
        tempcsvHeaders.push({ label: 'Food Item Name', value: 'foodItemName' })
        tempcsvHeaders.push({ label: 'Quantity', value: 'quantity' })
        tempcsvHeaders.push({ label: 'Amount', value: 'amount' })

        let dataA = [
            {
                sheet: 'Food Recovery Report ',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    function handleChange(e) {

        const target = e.target;
        const value = target.value
        setFoodRecoverList({
            ...FoodRecoverList,
            [e.target.name]: value,
            month: (selectedDate.getMonth() + 1).toString().padStart(2, '0'),
            year: selectedDate.getUTCFullYear().toString(),
        });
        setIsShowTable(false);
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
        let monthName = monthNames[month - 1];

        setSelectedSearchValues({
            ...selectedSearchValues,
            monthName: monthName
        });

        setFoodRecoverList({
            ...FoodRecoverList,
            month: month.toString().padStart(2, '0'),
            year: year.toString()
        });

        if (selectedDate != null) {

            var prevyear = selectedDate.getUTCMonth() + 1
            var prevMonth = selectedDate.getUTCFullYear();

            if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
                setSelectedDate(date)
            }
        } else {
            setSelectedDate(date)
        }
        setSelectedDate(date);
    }

    function clearTable() {
        clearState();
    }

    function clearState() {
        setFoodRecoverList({
            ...FoodRecoverList,
            divisionID: 0,
            month: new Date().toISOString().substring(0, 10),
            year: new Date().toISOString().substring(0, 10)

        });
        setIsTableHide(true);
        setFoodRecoveryeDetailsData([]);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            factoryName: factories[searchForm.factoryID],
            groupName: groups[searchForm.groupID],
            divisionname: divisions[searchForm.divisionID],
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
                            groupID: FoodRecoverList.groupID,
                            factoryID: FoodRecoverList.factoryID,
                            divisionID: FoodRecoverList.divisionID,
                            month: FoodRecoverList.month,
                            year: FoodRecoverList.year
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
                                                    <Grid item md={3} xs={12}>
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
                                                            value={FoodRecoverList.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
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
                                                            value={FoodRecoverList.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={3} xs={12}>
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
                                                            value={FoodRecoverList.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel style={{ fontSize: '0.700rem' }}>Month and Year *</InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                fullWidth
                                                                margin="normal"
                                                                id="date-picker-dialog"
                                                                format="MMMM yyyy"
                                                                views={['year', 'month']}
                                                                value={selectedDate}
                                                                onChange={date => handleDateChange(date)}
                                                                //disableFuture={true}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
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

                                                <br /> <br /> <br />

                                                {foodRecoveryDetailsData.length > 0 ?
                                                    <Box minWidth={1050}>
                                                        <TableContainer component={Paper}>
                                                            <Table className={classes.table} size="small" aria-label="simple table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="left"> Employee Number</TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="left"> Employee Name </TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="left"> Food Item</TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="left"> Quantity</TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="right"> Amount</TableCell>
                                                                    </TableRow>
                                                                </TableHead>

                                                                <TableBody>
                                                                    {foodRecoveryDetailsData.map((row, index) => {
                                                                        return (
                                                                            <TableRow key={index}>
                                                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                                                    {row.employeeNumber}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                                                    {row.employeeName}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                                                    {row.foodItemName}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                                                    {row.quantity}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black" }} align="right" component="th" scope="row">
                                                                                    {row.amount}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>

                                                                <TableFooter>
                                                                    <TableRow>
                                                                        <TableCell className={`${classes.stickyColumn}`} colSpan={3} style={{ border: "2px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }}
                                                                            align="left">Total</TableCell>

                                                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none", fontSize: "16px", border: "2px solid black", color: "red", width: "15px" }}>
                                                                            <b>{Number(totalValues.quantity)}</b>
                                                                        </TableCell>
                                                                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", fontSize: "16px", border: "2px solid black", color: "red", width: "15px" }}>

                                                                            <b>{Number(totalValues.amount).toLocaleString('en-US', {
                                                                                minimumFractionDigits: 2,
                                                                                maximumFractionDigits: 2
                                                                            })}</b>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableFooter>
                                                            </Table>
                                                        </TableContainer>
                                                    </Box>
                                                    : null}
                                            </CardContent>
                                            {foodRecoveryDetailsData.length > 0 ?
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
                                                            FoodRecoverList={FoodRecoverList}
                                                            foodRecoveryDetailsData={foodRecoveryDetailsData}
                                                            totalValues={totalValues}
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
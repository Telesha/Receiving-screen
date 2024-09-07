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
    Paper
} from '@material-ui/core';
import CountUp from 'react-countup';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from 'yup';
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik, validationSchema } from 'formik';
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { useAlert } from "react-alert";
import _ from 'lodash';
import { useFormik } from 'formik';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import MaterialTable from "material-table";
import { CloudLightning } from 'react-feather';
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

const screenCode = 'ADVANCEREPORT';

export default function AdvanceReport(props) {
    const [title, setTitle] = useState("Advance Report")
    const classes = useStyles();
    const today = new Date();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [divisions, setdivisions] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [stockBalanceDetails, setStockBalanceDetails] = useState([]); const [csvHeaders, SetCsvHeaders] = useState([]);
    const [ItemCategoryList, setItemCategoryList] = useState();
    const [factoryItems, setFactoryItems] = useState();
    const [totalValues, setTotalValues] = useState({
        totalAmount: 0,
    });


    const [stockBalanceReportInput, setStockBalanceReportInput] = useState({
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
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        factoryName: "",
        groupName: "",
        startDate: "",
        endDate: ""
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
        trackPromise(getAllActiveItemCategory())
    }, []);
    useEffect(() => {
        trackPromise(getDivisionDetailsByEstateID())
    }, [stockBalanceReportInput.factoryID]);

    useEffect(() => {
        if (stockBalanceDetails.length != 0) {
            calculateTotalQty()
        }
    }, [stockBalanceDetails]);

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
        setStockBalanceReportInput({
            ...stockBalanceReportInput,
            endDate: endDay
        })
    }, [stockBalanceReportInput.startDate])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWADVANCEREPORT');

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

    async function getAllActiveItemCategory() {
        const result = await services.getAllActiveItemCategory();
        setItemCategoryList(result);
    }

    async function getDivisionDetailsByEstateID() {
        const divisions = await services.getDivisionDetailsByEstateID(stockBalanceReportInput.factoryID);
        setdivisions(divisions);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(stockBalanceReportInput.groupID),
            factoryID: parseInt(stockBalanceReportInput.factoryID),
            divisionID: parseInt(stockBalanceReportInput.divisionID),
            startDate: (stockBalanceReportInput.startDate),
            endDate: (stockBalanceReportInput.endDate),
        }
        const response = await services.getAdvanceReportDetails(model);
        getSelectedDropdownValuesForReport(model);
        if (response.statusCode == "Success" && response.data != null) {
            setStockBalanceDetails(response.data);
            if (response.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error(response.message);
        }
    }

    function calculateTotalQty() {
        const totalAmount = stockBalanceDetails.reduce((accumulator, current) => accumulator + current.amount, 0);
        setTotalValues({
            ...totalValues,
            totalAmount: totalAmount
        })
    }

    const specificMonth = stockBalanceReportInput.startDate ? new Date(stockBalanceReportInput.startDate) : new Date();
    const firstDay = specificMonth.toISOString().split('T')[0];
    const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
    const lastDay = lastDayOfMonth.toISOString().split('T')[0];
    const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Employee Number': x.employeeNumber,
                    'Employee Name': x.employeeName,
                    'Amount': ' '.repeat(10) + x.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    '': '',
                    '': '',
                }
                res.push(vr);
            });
            res.push({});
            var pr = {
                'Employee Number': 'Start Date: ' + stockBalanceReportInput.startDate,
                'Employee Name': 'End Date : ' + stockBalanceReportInput.endDate
            }
            res.push(pr);
            var dataModel = {
                'Employee Number': 'Estate : ' + selectedSearchValues.factoryName,
                'Employee Name': 'Division : ' + selectedSearchValues.divisionName,
                'Amount': ' '.repeat(10) + 'Total Amount : Rs. ' + totalValues.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            };

            res.push(dataModel);
        }
        return res;
    }


    async function createFile() {
        var file = await createDataForExcel(stockBalanceDetails);
        var settings = {
            sheetName: 'Advance Report',
            fileName: 'Advance Report ' + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName,
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Advance Report',
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
        setStockBalanceReportInput({
            ...stockBalanceReportInput,
            [e.target.name]: value
        });
        setStockBalanceDetails([]);
    }
    function clearTable() {
        setStockBalanceDetails([]);
    }


    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            factoryName: factories[searchForm.factoryID],
            groupName: groups[searchForm.groupID],
            divisionName: divisions[searchForm.divisionID],
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
                            groupID: stockBalanceReportInput.groupID,
                            factoryID: stockBalanceReportInput.factoryID,
                            divisionID: stockBalanceReportInput.divisionID,
                            collectionTypeID: stockBalanceReportInput.collectionTypeID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                divisionID: Yup.number().required('Division is required').min("1", 'Division is required')
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
                                                        <InputLabel shrink id="divisionID">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            fullWidth
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            name="divisionID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={stockBalanceReportInput.divisionID}
                                                            size='small'
                                                            variant="outlined" >
                                                            <MenuItem value={"0"} >--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="startDate">
                                                            From Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="startDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={stockBalanceReportInput.startDate}
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
                                                            value={stockBalanceReportInput.endDate}
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
                                                    {stockBalanceDetails.length > 0 ?
                                                        <TableContainer component={Paper}>
                                                            <Table
                                                                className={classes.table}
                                                                size="small"
                                                                aria-label="simple table"
                                                            >
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", textAlign: "center", width: "15%" }} align="center">
                                                                            Employee Number
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", textAlign: "center", width: "15%" }} align="center">
                                                                            Employee Name
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", textAlign: "center", width: "15%" }} align="center">
                                                                            Amount (Rs.)
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {stockBalanceDetails.map((row, index) => {
                                                                        return (
                                                                            <TableRow key={index}>
                                                                                <TableCell style={{ border: "2px solid black", textAlign: "left" }} align="left" component="th" scope="row">
                                                                                    {row.employeeNumber}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black", textAlign: "left" }} align="left" component="th" scope="row">
                                                                                    {row.employeeName}
                                                                                </TableCell>

                                                                                <TableCell style={{ border: "2px solid black", textAlign: "right" }} align="right" component="th" scope="row">
                                                                                    <CountUp decimals={2} separator=',' end={row.amount} duration={0.1} />
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                    <TableRow >
                                                                        <TableCell colSpan={2} style={{ border: "2px solid black", fontWeight: "bold" }} align="left" component="th" scope="row">
                                                                            Total
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="right" component="th" scope="row">
                                                                            <CountUp decimals={2} separator=',' end={totalValues.totalAmount} duration={0.1} />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                        : null}
                                                </Box>
                                            </CardContent>
                                            {stockBalanceDetails.length > 0 ?
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
                                                            stockBalanceDetails={stockBalanceDetails}
                                                            stockBalanceReportInput={stockBalanceReportInput}
                                                            selectedSearchValues={selectedSearchValues}
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
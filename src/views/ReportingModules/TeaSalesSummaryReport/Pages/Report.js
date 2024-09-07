import React, { useState, useEffect, Fragment, useRef } from 'react'
import Page from 'src/components/Page';
import services from '../Services';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import PerfectScrollbar from 'react-perfect-scrollbar';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import {
    Box,
    Card,
    Table,
    Grid,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    InputLabel,
    TextField,
    MenuItem,
    makeStyles,
    Container,
    CardHeader,
    CardContent,
    Divider,
    TableContainer
} from '@material-ui/core';
import { trackPromise } from 'react-promise-tracker';
import { useAlert } from "react-alert";
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import xlsx from 'json-as-xlsx';
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { addDays } from 'date-fns';

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

const screenCode = 'TEASALESSUMMARYREPORT';
export default function TeaSalesSummaryReport() {

    const navigate = useNavigate();
    const classes = useStyles();
    const [title, setTitle] = useState("Tea Sales Summary Report");
    const [FormDetails, setFormDetails] = useState({
        groupID: '0',
        factoryID: '0',
        factoryItemID: '0',
        routeID: '0',
        brokerID: '0'
    })
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isBalanceRateChangeEnabled: false,
    });
    const [isTableView, setIsTableView] = useState(false);
    const [thisSale, setThisSale] = useState({});
    const [lastSale, setLastSale] = useState({});
    const [toDate, setToDate] = useState({});
    const [thisSaleM, setThisSaleM] = useState({});
    const [lastSaleM, setLastSaleM] = useState({});
    const [toDateM, setToDateM] = useState({});
    const [summaryData, setSummaryData] = useState([]);
    const [gradeData, setGradeData] = useState([]);
    const [startDateRange, setStartDateRange] = useState(new Date());
    const [endDateRange, setEndDateRange] = useState(new Date());
    const alert = useAlert();
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        factoryName: "0",
        startDate: '',
        endDate: ''
    })
    const [csvHeaders, SetCsvHeaders] = useState([])
    const componentRef = useRef();

    useEffect(() => {
        trackPromise(getPermissions());
        trackPromise(getGroupsForDropdown());
    }, []);

    useEffect(() => {
        if (FormDetails.groupID != 0) {
            getFactoriesForDropdown();
        }
    }, [FormDetails.groupID]);

    useEffect(() => {
        setSummaryData([]);
        setGradeData([]);
        setIsTableView(false);
    }, [startDateRange, endDateRange]);


    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWTEASALESSUMMARYREPORT');

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

        setFormDetails({
            ...FormDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getAllFactoriesByGroupID(FormDetails.groupID);
        setFactories(factories);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(FormDetails.groupID),
            factoryID: parseInt(FormDetails.factoryID),
            startDate: moment(startDateRange.toString()).format().split('T')[0],
            endDate: moment(endDateRange.toString()).format().split('T')[0],
            brokerID: FormDetails.brokerID == 0 ? null : parseInt(FormDetails.brokerID)
        }

        getSelectedDropdownValuesForReport(model);
        const res = await services.GetTeaSalesSummaryThisSale(model);

        if (res.statusCode == "Success" && res.data != null) {
            const lastSale = await services.GetTeaSalesSummaryLastSale(model);
            const toDate = await services.GetTeaSalesSummaryToDate(model);

            res.data.description = "This Sale";
            res.data.averageValuation = res.data.valuationVAmount / res.data.valuationQuantity;
            res.data.averageSales = res.data.salesSAmount / res.data.salesQuantity;

            lastSale.description = "Last Sale"
            lastSale.averageValuation = lastSale.valuationVAmount / lastSale.valuationQuantity;
            lastSale.averageSales = lastSale.salesSAmount / lastSale.salesQuantity;

            toDate.description = "To Date"
            toDate.averageValuation = toDate.valuationVAmount / toDate.valuationQuantity;
            toDate.averageSales = toDate.salesSAmount / toDate.salesQuantity;

            setThisSale(res.data);
            setLastSale(lastSale);
            setToDate(toDate);
            setSummaryData([
                ...summaryData,
                res.data, lastSale, toDate
            ])
            GetMainGradeDetails(res.data);
            setIsTableView(true);
        }
        else {
            alert.error("No records to display");
        }
    }

    async function GetMainGradeDetails(data) {
        if (data != undefined) {
            setIsTableView(true);
            const res = await services.GetMainGradeDetailsThisSale(data.salesNumber);
            const resLast = await services.GetMainGradeDetailsLastSale(data.salesNumber);
            const resToDate = await services.GetMainGradeDetailsToDate(data.salesNumber);

            res.description = "This Sale";
            resLast.description = "Last Sale";
            resToDate.description = "To Date";
            setThisSaleM(res);
            setLastSaleM(resLast);
            setToDateM(resToDate);
            setGradeData([
                ...gradeData,
                res, resLast, resToDate
            ])
        }
    }

    async function createDataForExcel(summaryData, gradeData) {
        var res = [];
        if (summaryData != null) {
            summaryData.map((x, index) => {
                var vr = {
                    'Description': x.description,
                    'Average Valuation(Rs)': x.averageValuation,
                    'Average Sales(Rs)': x.averageSales,
                    'Quantity Valuation': x.valuationQuantity,
                    'Quantity Sales': x.salesQuantity,
                    'Proceeds Valuation(Rs)': x.valuationVAmount,
                    'Proceeds Sales(Rs)': x.salesSAmount,
                };
                if (gradeData != null) {
                    var y = gradeData[index];
                    vr[''] = "";
                    vr['Description '] = y.description;
                    vr['Main Grade Quantity'] = y.salesQuantity;
                    vr['Main Grade %'] = ((y.salesQuantity / x.salesQuantity) * 100).toFixed(2);
                    vr['Off Grade Quantity'] = (x.salesQuantity - y.salesQuantity).toFixed(2);
                    vr['Off Grade %'] = (((x.salesQuantity - y.salesQuantity) / x.salesQuantity) * 100).toFixed(2);
                    vr['Total Quantity'] = x.salesQuantity
                }
                res.push(vr);
            });

            res.push({});

            var vr = {
                'Description': "Group: " + selectedSearchValues.groupName,
                'Average Valuation(Rs)': "Factory: " + selectedSearchValues.factoryName,
                'Average Sales(Rs)': "FromDate: " + selectedSearchValues.startDate,
                'Quantity Valuation': "ToDate: " + selectedSearchValues.endDate
            };
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(summaryData, gradeData);
        var settings = {
            sheetName: 'Tea Sales Summary Report',
            fileName: 'Tea Sales Summary Report' + ' ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName + '  ' + selectedSearchValues.startDate + ' - ' + selectedSearchValues.endDate,
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Tea Sales Summary Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        var startDate = moment(searchForm.startDate.toString()).format().split('T')[0]
        var endDate = moment(searchForm.endDate.toString()).format().split('T')[0]
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            factoryName: factories[searchForm.factoryID],
            startDate: [startDate],
            endDate: [endDate]
        })
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

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
            }
        }
        return items
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setFormDetails({
            ...FormDetails,
            [e.target.name]: value
        });
        setIsTableView(false);
        setSummaryData([]);
        setGradeData([])
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: FormDetails.groupID,
                            factoryID: FormDetails.factoryID,
                            startDate: startDateRange,
                            endDate: endDateRange,

                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                                startDate: Yup.date().required('Start date is required'),
                                endDate: Yup.date().required('Start date is required')
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
                                                            value={FormDetails.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            size='small'
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="factoryID">
                                                            Factory *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={FormDetails.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            size='small'
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="brokerID">
                                                            Broker Name
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.brokerID && errors.brokerID)}
                                                            fullWidth
                                                            helperText={touched.brokerID && errors.brokerID}
                                                            name="brokerID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={FormDetails.brokerID}
                                                            variant="outlined"
                                                            id="brokerID"
                                                            size='small'
                                                        >
                                                            <MenuItem value={'0'}>
                                                                --All Brokers--
                                                            </MenuItem>
                                                            <MenuItem value={'1'}>Mihinda Karunapala</MenuItem>
                                                            <MenuItem value={'2'}>Dulip Mendis</MenuItem>
                                                            <MenuItem value={'3'}>Asanka Priyamantha</MenuItem>
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="date">From Date * </InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                fullWidth
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                name='startDate'
                                                                id='startDate'
                                                                size='small'
                                                                value={startDateRange}

                                                                onChange={(e) => {
                                                                    setStartDateRange(e)
                                                                }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="date">To Date *</InputLabel>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                fullWidth
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                name='startDate'
                                                                size='small'
                                                                id='startDate'
                                                                value={endDateRange}
                                                                onChange={(e) => {
                                                                    setEndDateRange(e)
                                                                }}
                                                                minDate={startDateRange}
                                                                maxDate={addDays(startDateRange, 6)}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>

                                                <Box display="flex" justifyContent="flex-end" p={2}>
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
                                                    {isTableView == true ?
                                                        <TableContainer >
                                                            <Table aria-label="caption table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell rowSpan={2} align={'center'} style={{ border: "2px solid black" }}>Description</TableCell>
                                                                        <TableCell colspan={2} align={'center'} style={{ border: "2px solid black" }}>Average(Rs)</TableCell>
                                                                        <TableCell colspan={2} align={'center'} style={{ border: "2px solid black" }}>Quantity(Kg)</TableCell>
                                                                        <TableCell colspan={2} align={'center'} style={{ border: "2px solid black" }}>Proceeds(Rs)</TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell align={'center'} style={{ border: "2px solid black" }}>Valuation</TableCell>
                                                                        <TableCell align={'center'} style={{ border: "2px solid black" }}>Sales</TableCell>
                                                                        <TableCell align={'center'} style={{ border: "2px solid black" }}>Valuation</TableCell>
                                                                        <TableCell align={'center'} style={{ border: "2px solid black" }}>Sales</TableCell>
                                                                        <TableCell align={'center'} style={{ border: "2px solid black" }}>Valuation</TableCell>
                                                                        <TableCell align={'center'} style={{ border: "2px solid black" }}>Sales</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>

                                                                    <TableRow>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            This Sale
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {thisSale.averageValuation.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {thisSale.averageSales.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {thisSale.valuationQuantity.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {thisSale.salesQuantity.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {thisSale.valuationVAmount.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {thisSale.salesSAmount.toFixed(2)}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            Last Sale
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {lastSale.averageValuation.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {lastSale.averageSales.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {lastSale.valuationQuantity.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {lastSale.salesQuantity.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {lastSale.valuationVAmount.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {lastSale.salesSAmount.toFixed(2)}
                                                                        </TableCell>
                                                                    </TableRow>

                                                                    <TableRow>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            To Date
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {toDate.averageValuation.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {toDate.averageSales.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {toDate.valuationQuantity.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {toDate.salesQuantity.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {toDate.valuationVAmount.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {toDate.salesSAmount.toFixed(2)}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer> : null}
                                                </Box>
                                                <br />
                                                <Box minWidth={1050}>
                                                    {isTableView == true ?
                                                        <TableContainer >
                                                            <Table aria-label="caption table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell rowSpan={2} align={'center'} style={{ border: "2px solid black" }}>Description</TableCell>
                                                                        <TableCell colspan={2} align={'center'} style={{ border: "2px solid black" }}>Main Grade</TableCell>
                                                                        <TableCell colspan={2} align={'center'} style={{ border: "2px solid black" }}>Off Grade</TableCell>
                                                                        <TableCell align={'center'} style={{ border: "2px solid black" }}>Total</TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell align={'center'} style={{ border: "2px solid black" }}>Quantity(Kg)</TableCell>
                                                                        <TableCell align={'center'} style={{ border: "2px solid black" }}>%</TableCell>
                                                                        <TableCell align={'center'} style={{ border: "2px solid black" }}>Quantity(Kg)</TableCell>
                                                                        <TableCell align={'center'} style={{ border: "2px solid black" }}>%</TableCell>
                                                                        <TableCell align={'center'} style={{ border: "2px solid black" }}>Quantity(Kg)</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    <TableRow>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            This Sale
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {thisSaleM.salesQuantity?.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {(Number((thisSaleM.salesQuantity / thisSale.salesQuantity) * 100)).toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {(thisSale.salesQuantity - thisSaleM.salesQuantity).toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {(Number(((thisSale.salesQuantity - thisSaleM.salesQuantity) / thisSale.salesQuantity) * 100)).toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {(thisSale.salesQuantity).toFixed(2)}
                                                                        </TableCell>
                                                                    </TableRow>

                                                                    <TableRow>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            Last Sale
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {lastSaleM.salesQuantity?.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {(Number((lastSaleM.salesQuantity / lastSale.salesQuantity) * 100)).toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {(lastSale.salesQuantity - lastSaleM.salesQuantity).toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {(Number(((lastSale.salesQuantity - lastSaleM.salesQuantity) / lastSale.salesQuantity) * 100)).toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {lastSale.salesQuantity.toFixed(2)}
                                                                        </TableCell>
                                                                    </TableRow>

                                                                    <TableRow>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            To Date
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {toDateM.salesQuantity?.toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {(Number((toDateM.salesQuantity / toDate.salesQuantity) * 100)).toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {(toDate.salesQuantity - toDateM.salesQuantity).toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {(Number(((toDate.salesQuantity - toDateM.salesQuantity) / toDate.salesQuantity) * 100)).toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                                            {toDate.salesQuantity.toFixed(2)}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer> : null}
                                                </Box>
                                            </CardContent>
                                            {isTableView == true ?
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
                                                    <div>&nbsp;</div>
                                                    <ReactToPrint
                                                        documentTitle={"Crop Slab Report"}
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
                                                        <CreatePDF ref={componentRef} FormDetails={FormDetails}
                                                            TeaSummaryReportSearchData={selectedSearchValues} QuantityData={summaryData} GradeData={gradeData}
                                                        />
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

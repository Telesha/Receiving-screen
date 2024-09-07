import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Grid,
    Table,
    TableContainer,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    makeStyles,
    Container,
    Button,
    CardContent,
    Divider,
    InputLabel,
    CardHeader,
    MenuItem,
    TablePagination
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from 'react-alert';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import moment from 'moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import CountUp from 'react-countup';

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

const screenCode = 'SALESDETAILSREPORT';

export default function SalesDetailsReport(props) {
    const [title, setTitle] = useState('Sales Details Report');
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [FactoryList, setFactoryList] = useState([]);
    const [sellingMarks, setSellingMarks] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [totalAmounts, setTotalAmounts] = useState({
        totalNetQty: 0,
        totalValueAmount: 0,
        totalSaleAmmount: 0,
        ammountDiff: 0
    });
    const [buyerwiseSalesReportDetail, setBuyerwiseSalesReportDetail] = useState({
        groupID: 0,
        factoryID: 0,
        SellingMarkID: 0,
        brokerID: 0,
        typeOfDispatch: 0,
        typeOfSale: 0
    });
    const [reportData, setReportData] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const navigate = useNavigate();
    const alert = useAlert();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const componentRef = useRef();
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '',
        factoryName: '',
        startDate: '',
        endDate: '',
        sellingMark: 0,
        brokerID: 0,
        typeOfDispatch: '',
        typeOfSale: ''
    });
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };
    const [startDateRange, setStartDateRange] = useState(new Date());
    const [endDateRange, setEndDateRange] = useState(new Date());

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getGroupsForDropdown());
    }, []);

    useEffect(() => {
        if (buyerwiseSalesReportDetail.groupID > 0) {
            trackPromise(getFactoriesForDropdown());
        }
    }, [buyerwiseSalesReportDetail.groupID]);

    useEffect(() => {
        if (buyerwiseSalesReportDetail.factoryID > 0) {
            trackPromise(
                getSellingMarksForDropdown(),
                getBrokersForDropdown(),
            );
        }
    }, [buyerwiseSalesReportDetail.factoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'VIEWSALESDETAILSREPORT'
        );

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(
            p => p.permissionCode == 'GROUPDROPDOWN'
        );
        var isFactoryFilterEnabled = permissions.find(
            p => p.permissionCode == 'FACTORYDROPDOWN'
        );

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setBuyerwiseSalesReportDetail({
            ...buyerwiseSalesReportDetail,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(
            buyerwiseSalesReportDetail.groupID
        );
        setFactoryList(factories);
    }

    async function getSellingMarksForDropdown() {
        const sellingMarks = await services.GetSellingMarkList(buyerwiseSalesReportDetail.groupID, buyerwiseSalesReportDetail.factoryID);
        setSellingMarks(sellingMarks);
    }

    async function getBrokersForDropdown() {
        const brokers = await services.GetBrokerList(buyerwiseSalesReportDetail.groupID, buyerwiseSalesReportDetail.factoryID);
        setBrokers(brokers);
    }

    async function getSalesDetailsReportData() {
        let totalNetQty = 0;
        let totalValueAmount = 0;
        let totalSaleAmmount = 0;
        let ammountDiff = 0;

        let model = {
            groupID: parseInt(buyerwiseSalesReportDetail.groupID),
            factoryID: parseInt(buyerwiseSalesReportDetail.factoryID),
            startDate: moment(startDateRange.toString()).format().split('T')[0],
            endDate: moment(endDateRange.toString()).format().split('T')[0],
            SellingMarkID: parseInt(buyerwiseSalesReportDetail.SellingMarkID),
            brokerID: parseInt(buyerwiseSalesReportDetail.brokerID),
            typeOfDispatch: parseInt(buyerwiseSalesReportDetail.typeOfDispatch),
            typeOfSale: parseInt(buyerwiseSalesReportDetail.typeOfSale)
        };
        const result = await services.getSalesDetailsReportData(model);
        getSelectedDropdownValuesForReport(model);
        result.data.forEach(x => {
            x.sellingDate = x.sellingDate.split('T')[0]
        })
        setReportData(result.data);

        result.data.forEach(x => {
            totalNetQty = x.netWeight + totalNetQty;
            totalValueAmount = x.valueAmount + totalValueAmount;
            totalSaleAmmount = x.salesAmount + totalSaleAmmount;
            ammountDiff = x.amountDiff + ammountDiff;
        });
        setTotalAmounts({
            ...totalAmounts,
            totalNetQty: totalNetQty,
            totalValueAmount: totalValueAmount,
            totalSaleAmmount: totalSaleAmmount,
            ammountDiff: ammountDiff
        })

        createDataForExcel(result.data);
        if (result.data.length == 0) {
            alert.error('No Records To Display');
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Date': x.sellingDate,
                    'Lot No': x.lotNumber,
                    'Invoice No': x.invoiceNo,
                    'Grade': x.gradeName,
                    'Bag Wt(Kg)': x.packWeight,
                    'No of Bags': x.noOfPackages,
                    'Net Qty': x.netWeight,
                    'Value Rate': x.value.toFixed(2),
                    'Value Amount': x.valueAmount.toFixed(2),
                    'Sale Rate': x.salesRate.toFixed(2),
                    'Sale Amount': x.salesAmount.toFixed(2),
                    'Rate +/-': x.rateDiff.toFixed(2),
                    'Amount +/-': x.amountDiff.toFixed(2),
                };
                res.push(vr);
            });
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(reportData);
        var settings = {
            sheetName: 'Sales Details Report',
            fileName:
                'Sales Details Report ' +
                selectedSearchValues.groupName +
                ' - ' +
                selectedSearchValues.factoryName +
                ' - ' +
                selectedSearchValues.startDate +
                ' - ' +
                selectedSearchValues.endDate
        };

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Sales Details Report',
                columns: tempcsvHeaders,
                content: file
            }
        ];
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setBuyerwiseSalesReportDetail({
            ...buyerwiseSalesReportDetail,
            [e.target.name]: value
        });
        setReportData([]);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        var startDate = moment(searchForm.startDate.toString()).format().split('T')[0];
        var endDate = moment(searchForm.endDate.toString()).format().split('T')[0];
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            factoryName: FactoryList[searchForm.factoryID],
            voucherCodeID: searchForm.voucherCodeID,
            startDate: [startDate],
            endDate: [endDate],
            sellingMarkID: sellingMarks[searchForm.SellingMarkID],
            brokerID: brokers[searchForm.brokerID],
            typeOfDispatch: searchForm.typeOfDispatch,
            typeOfSale: searchForm.typeOfSale
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
                    <Card>
                        <Formik
                            initialValues={{
                                groupID: buyerwiseSalesReportDetail.groupID,
                                factoryID: buyerwiseSalesReportDetail.factoryID,
                                SellingMarkID: buyerwiseSalesReportDetail.SellingMarkID,
                                brokerID: buyerwiseSalesReportDetail.brokerID,
                                typeOfDispatch: buyerwiseSalesReportDetail.typeOfDispatch,
                                typeOfSale: buyerwiseSalesReportDetail.typeOfSale
                            }}
                            validationSchema={Yup.object().shape({
                                groupID: Yup.number()
                                    .required('Group is required')
                                    .min('1', 'Group is required'),
                                factoryID: Yup.number()
                                    .required('Factory is required')
                                    .min('1', 'Factory is required')
                            })}
                            onSubmit={() => trackPromise(getSalesDetailsReportData())}
                            enableReinitialize
                        >
                            {({ errors, handleBlur, handleSubmit, touched }) => (
                                <form onSubmit={handleSubmit}>
                                    <Box mt={0}>
                                        <CardHeader title={cardTitle(title)} />
                                        <Divider />
                                        <CardContent>
                                            <Grid container spacing={3}>
                                                <Grid item md={3} xs={12}>
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
                                                        value={buyerwiseSalesReportDetail.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'
                                                        disabled={!permissionList.isGroupFilterEnabled}
                                                    >
                                                        <MenuItem value="0">--Select Group--</MenuItem>
                                                        {generateDropDownMenu(GroupList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Factory *
                                                    </InputLabel>
                                                    <TextField
                                                        select
                                                        error={Boolean(
                                                            touched.factoryID && errors.factoryID
                                                        )}
                                                        fullWidth
                                                        size='small'
                                                        helperText={touched.factoryID && errors.factoryID}
                                                        name="factoryID"
                                                        onBlur={handleBlur}
                                                        onChange={e => handleChange(e)}
                                                        value={buyerwiseSalesReportDetail.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        disabled={!permissionList.isFactoryFilterEnabled}
                                                    >
                                                        <MenuItem value="0">--Select Factory--</MenuItem>
                                                        {generateDropDownMenu(FactoryList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="date">From Date </InputLabel>
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
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="date">To Date </InputLabel>
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
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                            autoOk
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={3}>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Selling Mark
                                                    </InputLabel>
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        name="SellingMarkID"
                                                        onBlur={handleBlur}
                                                        onChange={e => handleChange(e)}
                                                        value={buyerwiseSalesReportDetail.SellingMarkID}
                                                        variant="outlined"
                                                        id="SellingMarkID"
                                                        size='small'
                                                        disabled={!permissionList.isGroupFilterEnabled}
                                                    >
                                                        <MenuItem value="0">--Select Selling mark--</MenuItem>
                                                        {generateDropDownMenu(sellingMarks)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Broker Name
                                                    </InputLabel>
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        size='small'
                                                        name="brokerID"
                                                        onBlur={handleBlur}
                                                        onChange={e => handleChange(e)}
                                                        value={buyerwiseSalesReportDetail.brokerID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        disabled={!permissionList.isFactoryFilterEnabled}
                                                    >
                                                        <MenuItem value="0">--Select Broker Name--</MenuItem>
                                                        {generateDropDownMenu(brokers)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="typeOfDispatch">
                                                        Type of Dispatch
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="typeOfDispatch"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={buyerwiseSalesReportDetail.typeOfDispatch}
                                                        variant="outlined"
                                                    >
                                                        <MenuItem value={'0'}>
                                                            --Select Dispatch Type--
                                                        </MenuItem>
                                                        <MenuItem value={'1'}>Incomplete</MenuItem>
                                                        <MenuItem value={'2'}>Complete</MenuItem>
                                                        <MenuItem value={'3'}>Invoice</MenuItem>
                                                    </TextField>

                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="typeOfSale">
                                                        Type of Sale
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="typeOfSale"
                                                        size='small'
                                                        onChange={(e) => handleChange(e)}
                                                        value={buyerwiseSalesReportDetail.typeOfSale}
                                                        variant="outlined"
                                                    >
                                                        <MenuItem value={'0'}>
                                                            --Select Type Of Sale--
                                                        </MenuItem>
                                                        <MenuItem value={'1'}>Public Sale</MenuItem>
                                                        <MenuItem value={'2'}>Private Sale</MenuItem>
                                                        <MenuItem value={'3'}>Unsold</MenuItem>
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                            <Box display="flex" flexDirection="row-reverse" p={2}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                    size='small'
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Box>
                                </form>
                            )}
                        </Formik>
                        <PerfectScrollbar>
                            <Box>
                                {reportData.length > 0 ?
                                    <TableContainer style={{ width: '1250' }}>
                                        <Table aria-label="caption table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align={'left'}>Date</TableCell>
                                                    <TableCell align={'left'}>Lot No</TableCell>
                                                    <TableCell align={'left'}>Invoice No</TableCell>
                                                    <TableCell align={'left'}>Grade</TableCell>
                                                    <TableCell align={'left'}>Bag Wt(Kg)</TableCell>
                                                    <TableCell align={'left'}>No of Bags</TableCell>
                                                    <TableCell align={'left'}>Net Qty(Kg)</TableCell>
                                                    <TableCell align={'left'}>Value Rate(Rs.)</TableCell>
                                                    <TableCell align={'left'}>Value Amount(Rs.)</TableCell>
                                                    <TableCell align={'left'}>Sale Rate(Rs.)</TableCell>
                                                    <TableCell align={'left'}>Sale Amount(Rs.)</TableCell>
                                                    <TableCell align={'left'}>Rate +/-(Rs.)</TableCell>
                                                    <TableCell align={'left'}>Amount +/-(Rs.)</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {reportData.slice(page * limit, page * limit + limit).map((data, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell align={'left'} >
                                                            {data.sellingDate}
                                                        </TableCell>
                                                        <TableCell align={'left'}>
                                                            {data.lotNumber}
                                                        </TableCell>
                                                        <TableCell align={'left'}>
                                                            {data.invoiceNo}
                                                        </TableCell>
                                                        <TableCell align={'left'}>
                                                            {data.gradeName}
                                                        </TableCell>
                                                        <TableCell align={'left'} >
                                                            {data.packWeight}
                                                        </TableCell>
                                                        <TableCell align={'left'} >
                                                            {data.noOfPackages}
                                                        </TableCell>
                                                        <TableCell align={'left'}>
                                                            {data.netWeight}
                                                        </TableCell>
                                                        <TableCell align={'left'}>
                                                            <CountUp
                                                                end={data.value.toFixed(2)}
                                                                decimals={2}
                                                                separator=','
                                                                decimal="."
                                                                duration={0.1}
                                                            />
                                                        </TableCell>
                                                        <TableCell align={'left'}>
                                                            <CountUp
                                                                end={data.valueAmount.toFixed(2)}
                                                                decimals={2}
                                                                separator=','
                                                                decimal="."
                                                                duration={0.1}
                                                            />
                                                        </TableCell>
                                                        <TableCell align={'left'}>
                                                            <CountUp
                                                                end={data.salesRate.toFixed(2)}
                                                                decimals={2}
                                                                separator=','
                                                                decimal="."
                                                                duration={0.1}
                                                            />
                                                        </TableCell>
                                                        <TableCell align={'left'}>
                                                            <CountUp
                                                                end={data.salesAmount.toFixed(2)}
                                                                decimals={2}
                                                                separator=','
                                                                decimal="."
                                                                duration={0.1}
                                                            />
                                                        </TableCell>
                                                        <TableCell align={'left'}>
                                                            <CountUp
                                                                end={Math.abs(data.rateDiff).toFixed(2)}
                                                                decimals={2}
                                                                separator=","
                                                                decimal="."
                                                                duration={0.1}
                                                                formattingFn={(value) => {
                                                                    if (data.rateDiff < 0) {
                                                                        return `(${value})`;
                                                                    } else {
                                                                        return value;
                                                                    }
                                                                }}
                                                            />

                                                        </TableCell>
                                                        <TableCell align={'left'}>
                                                            <CountUp
                                                                end={Math.abs(data.amountDiff).toFixed(2)}
                                                                decimals={2}
                                                                separator=","
                                                                decimal="."
                                                                duration={0.1}
                                                                formattingFn={(value) => {
                                                                    if (data.amountDiff < 0) {
                                                                        return `(${value})`;
                                                                    } else {
                                                                        return value;
                                                                    }
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                            <TableRow style={{ background: '#C1E1C1' }}>
                                                <TableCell align={'left'} colSpan={6} style={{ fontWeight: 'bold' }}
                                                >Total</TableCell>
                                                <TableCell align={'left'} style={{ fontWeight: 'bold' }}>
                                                    <CountUp
                                                        end={totalAmounts.totalNetQty.toFixed(2)}
                                                        decimals={2}
                                                        separator=','
                                                        decimal="."
                                                        duration={0.1}
                                                    />
                                                </TableCell>
                                                <TableCell align={'left'} style={{ fontWeight: 'bold' }}>
                                                </TableCell>
                                                <TableCell align={'left'} colSpan={2} style={{ fontWeight: 'bold' }}>
                                                    <CountUp
                                                        end={totalAmounts.totalValueAmount.toFixed(2)}
                                                        decimals={2}
                                                        separator=','
                                                        decimal="."
                                                        duration={0.1}
                                                    />
                                                </TableCell>
                                                <TableCell align={'left'} style={{ fontWeight: 'bold' }}>
                                                    <CountUp
                                                        end={totalAmounts.totalSaleAmmount.toFixed(2)}
                                                        decimals={2}
                                                        separator=','
                                                        decimal="."
                                                        duration={0.1}
                                                    />
                                                </TableCell>
                                                <TableCell align={'left'} style={{ fontWeight: 'bold' }}>
                                                </TableCell>
                                                <TableCell align={'left'} colSpan={2} style={{ fontWeight: 'bold' }}>
                                                    <CountUp
                                                        end={totalAmounts.ammountDiff.toFixed(2)}
                                                        decimals={2}
                                                        separator=","
                                                        decimal="."
                                                        duration={0.1}
                                                        formattingFn={(value) => {
                                                            if (totalAmounts.ammountDiff < 0) {
                                                                return `(${value})`;
                                                            } else {
                                                                return value;
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align={'left'} style={{ fontWeight: 'bold' }}>
                                                </TableCell>
                                                <TableCell align={'left'} style={{ fontWeight: 'bold' }}>
                                                </TableCell>
                                            </TableRow>
                                        </Table>
                                    </TableContainer>
                                    : null}
                            </Box>
                            {reportData.length > 0 ?
                                <TablePagination
                                    component="div"
                                    count={reportData.length}
                                    onChangePage={handlePageChange}
                                    onChangeRowsPerPage={handleLimitChange}
                                    page={page}
                                    rowsPerPage={limit}
                                    rowsPerPageOptions={[5, 10, 25]}
                                />
                                : null}
                            {reportData.length > 0 ? (
                                <Box display="flex" justifyContent="flex-end" p={2}>
                                    <Button
                                        color="primary"
                                        id="btnRecord"
                                        type="submit"
                                        variant="contained"
                                        style={{ marginRight: '1rem' }}
                                        className={classes.colorRecord}
                                        onClick={() => createFile()}
                                        size='small'
                                    >
                                        EXCEL
                                    </Button>
                                    <ReactToPrint
                                        documentTitle={'Sales Details Report'}
                                        trigger={() => (
                                            <Button
                                                color="primary"
                                                id="btnRecord"
                                                type="submit"
                                                variant="contained"
                                                style={{ marginRight: '1rem' }}
                                                className={classes.colorCancel}
                                                size='small'
                                            >
                                                PDF
                                            </Button>
                                        )}
                                        content={() => componentRef.current}
                                    />
                                    <div hidden={true}>
                                        <CreatePDF
                                            ref={componentRef}
                                            reportData={reportData}
                                            searchData={selectedSearchValues}
                                            totalAmounts={totalAmounts}
                                        />
                                    </div>
                                </Box>
                            ) : null}
                        </PerfectScrollbar>
                    </Card>
                </Container>
            </Page>
        </Fragment >
    );
}

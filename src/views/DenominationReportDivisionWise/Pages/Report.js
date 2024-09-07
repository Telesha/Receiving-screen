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

const screenCode = 'DENOMINATIONREPORTDIVISIONWISE';

export default function DenominationReportDivisionWise() {
    const [title, setTitle] = useState("Denomination Report");
    const classes = useStyles();
    const alert = useAlert();
    const navigate = useNavigate();
    const componentRef = useRef();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [divisions, setdivisions] = useState();
    const [reportData, setReportData] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    })
    const [selectedDate, setSelectedDate] = useState(new Date());
    const cash = ['5000', '1000', '500', '100', '50', '20', '10'];
    const cashTitle = ['5000 LKR', '1000 LKR', '500 LKR', '100 LKR', '50 LKR', '20 LKR', '10 LKR'];
    const columnTitles = ['Estate Name', 'Amount (LKR)', ...cashTitle, 'LKR'];
    const [denominationCashList, setDenominationCashList] = useState([])
    const [remainingValueTotal, setRemainingValueTotal] = useState(0);
    const [coinTotal, setCoinTotal] = useState([]);
    const [prevTotalAmount, setPrevTotalAmount] = useState(0);
    const [estateName, setEsateName] = useState();
    const [selectedData, setSelectedData] = useState({
        GroupName: "",
        EstateName: "",
        DivisionName: "",
        Month: "",
        Year: ""
    });

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [reportData.groupID])

    useEffect(() => {
        trackPromise(getDivisionDetailsByEstateID());
        if (reportData.estateID > 0) {
            getEstateNameByEstateID();
        }
    }, [reportData.estateID])

    useEffect(() => {
        if (coinTotal.length > 0) {
            setCoinTotal([]);
        }
    }, [reportData.divisionID, reportData.year, reportData.month])


    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        )
    }

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDENOMINATIONREPORT');

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

        setReportData({
            ...reportData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken()),
        })
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setReportData({
            ...reportData,
            [e.target.name]: value
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
        // let monthName = monthNames[month - 1];

        setReportData({
            ...reportData,
            month: month.toString(),
            year: year.toString()
        });
        setSelectedDate(date);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factories = await services.getFactoriesByGroupID(reportData.groupID);
        setFactories(factories);
    }

    async function getDivisionDetailsByEstateID() {
        const divisions = await services.getDivisionDetailsByEstateID(reportData.estateID);
        setdivisions(divisions);
    }

    async function getEstateNameByEstateID() {
        const estateNameResult = await services.getEstateNameByEstateID(reportData.estateID);
        setEsateName(estateNameResult.estateName);
    }

    async function GetDenominationReportDetails() {
        let totalAmount = 0;
        const denominationData = await GetDenominationDetailList();
        if (denominationData.length > 0) {
            calculateCashCount(denominationData, cash);
            denominationData.forEach(x => {
                totalAmount = totalAmount + parseFloat(x.total)
            });
            setPrevTotalAmount(totalAmount);
        }
    }

    async function GetDenominationDetailList() {
        const model = {
            groupID: parseInt(reportData.groupID),
            estateID: parseInt(reportData.estateID),
            divisionID: parseInt(reportData.divisionID),
            month: reportData.month.toString(),
            year: reportData.year.toString(),
        }
        const response = await services.GetDenominationDetails(model);
        searchSelectedDataForReport(model)
        if (response.length > 0) {
            return response;
        } else {
            alert.error("No record to display")
        }
    }

    function calculateCashCount(denominationData, cash) {
        const coinNames = {
            5000: 'fiveThousand',
            1000: 'oneThousand',
            500: 'fiveHundred',
            100: 'oneHundred',
            50: 'fifty',
            20: 'twenty',
            10: 'ten',
        };

        const coinNameee = [];

        coinNameee['fiveThousand'] = 5000
        coinNameee['oneThousand'] = 1000
        coinNameee['fiveHundred'] = 500
        coinNameee['oneHundred'] = 100
        coinNameee['fifty'] = 50
        coinNameee['twenty'] = 20
        coinNameee['ten'] = 10

        const cashCountList = denominationData.map((denomination) => {
            let amount = denomination.total;
            let cashCount = [];
            let coinTotal = {};

            for (let index = 0; index < cash.length; index++) {
                let numberOfCoins = Math.trunc(amount / cash[index]);
                cashCount.push({
                    coinNumber: cash[index],
                    coinCount: numberOfCoins,
                });

                if (numberOfCoins === 0) {
                    continue;
                }
                let totDeduction = numberOfCoins * cash[index];
                amount -= totDeduction;

                if (coinTotal[coinNames[cash[index]]]) {
                    coinTotal[coinNames[cash[index]]] += numberOfCoins;
                } else {
                    coinTotal[coinNames[cash[index]]] = numberOfCoins;
                }
            }

            let remainingValue = amount.toFixed(2);

            return {
                divisionID: denomination.divisionID,
                estateName: denomination.estateName,
                amount: denomination.total,
                cashCount: cashCount,
                remainingValue: remainingValue,
                coinTotal: coinTotal,
            };

        });

        let coinTotal = {};
        for (let i = 0; i < cashCountList.length; i++) {
            let cashCountObj = cashCountList[i];
            let cashCountArr = cashCountObj.cashCount;
            for (let j = 0; j < cashCountArr.length; j++) {
                let coinNumber = cashCountArr[j].coinNumber;
                let coinCount = cashCountArr[j].coinCount;
                if (coinTotal[coinNames[coinNumber]]) {
                    coinTotal[coinNames[coinNumber]] += coinCount;
                } else {
                    coinTotal[coinNames[coinNumber]] = coinCount;
                }
            }
        }

        const coinTotalArray = Object.entries(coinTotal).map(([coinValue, coinCount]) => ({
            coinName: coinNameee[coinValue],
            coinCount: coinCount,
            totalCoinAmount: coinCount * coinNameee[coinValue]
        }));

        const totalRemainingValue = cashCountList.reduce((total, cashCountObj) => {
            return total + parseFloat(cashCountObj.remainingValue);
        }, 0).toFixed(2);

        setCoinTotal(coinTotalArray);
        setRemainingValueTotal(totalRemainingValue);
        setDenominationCashList(cashCountList);
    }

    function searchSelectedDataForReport(searchData) {
        setSelectedData({
            ...selectedData,
            GroupName: groups[searchData.groupID],
            EstateName: factories[searchData.estateID],
            DivisionName: divisions[searchData.divisionID],
            Month: searchData.month,
            Year: searchData.year
        })
    }

    function clearTable() {
        setReportData({
            ...reportData,
            divisionID: '0'
        })
        setCoinTotal([]);
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: reportData.groupID,
                            estateID: reportData.estateID,
                            divisionID: reportData.divisionID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                divisionID: Yup.number().required('Division is required').min("1", 'Division is required')
                            })
                        }
                        onSubmit={() => trackPromise(GetDenominationReportDetails())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)}
                                        />
                                        <PerfectScrollbar />
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
                                                        value={reportData.groupID}
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
                                                    <InputLabel shrink id="estateID">
                                                        Estate *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.estateID && errors.estateID)}
                                                        fullWidth
                                                        helperText={touched.estateID && errors.estateID}
                                                        name="estateID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={reportData.estateID}
                                                        variant="outlined"
                                                        id="estateID"
                                                        disabled={!permissionList.isGroupFilterEnabled}
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Group--</MenuItem>
                                                        {generateDropDownMenu(factories)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="divisionID">
                                                        Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.divisionID && errors.divisionID)}
                                                        fullWidth
                                                        helperText={touched.divisionID && errors.divisionID}
                                                        name="divisionID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={reportData.divisionID}
                                                        variant="outlined"
                                                        id="divisionID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Group--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
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
                                            </Grid>
                                            <br /><br />
                                            <Grid container justify="flex-end">
                                                <Box pr={2}>
                                                    <Button
                                                        color="primary"
                                                        variant="outlined"
                                                        type="submit"
                                                        size='small'
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
                                                        size='small'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </Grid>
                                            <br />
                                            {coinTotal.length > 0 ?
                                                <Box>
                                                    <TableContainer  >
                                                        <Table aria-label="caption table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    {columnTitles.map(title => (
                                                                        <TableCell key={title} align='center' style={{ border: '1px solid black' }}>{title}</TableCell>
                                                                    ))}
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody >
                                                                <TableCell align={'center'} style={{ border: '1px solid black' }}><b>{estateName}</b></TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ border: '1px solid black' }}>
                                                                    <b>{prevTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                                                                </TableCell>
                                                                {coinTotal.map((coin, index) => (
                                                                    <TableCell key={cash[index]} align='center' component="th" scope="row" style={{ border: '1px solid black' }}>
                                                                        <b>{coin.coinCount == 0 ? '-' : coin.coinCount}</b>
                                                                    </TableCell>
                                                                ))}
                                                                <TableCell align={'right'} component="th" scope="row" style={{ border: '1px solid black' }}>
                                                                    <b>{remainingValueTotal}</b>
                                                                </TableCell>
                                                            </TableBody>
                                                            <TableRow>
                                                                <TableCell align={'center'} style={{ border: '1px solid black', color: 'red' }}><b>Total</b></TableCell>
                                                                <TableCell align={'right'} component="th" scope="row" style={{ border: '1px solid black', color: 'red' }}>
                                                                    <b>{prevTotalAmount.toFixed(2)}</b>
                                                                </TableCell>
                                                                {coinTotal.map((coin, index) => (
                                                                    <TableCell key={cash[index]} align={coin.totalCoinAmount == 0 ? 'center' : 'right'} component="th" scope="row" style={{ border: '1px solid black', color: 'red' }}>
                                                                        <b>{coin.totalCoinAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) == 0 ? '-' : coin.totalCoinAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                                                                    </TableCell>
                                                                ))}
                                                                <TableCell align={'right'} component="th" scope="row" style={{ border: '1px solid black', color: 'red' }}>
                                                                    <b>{remainingValueTotal}</b>
                                                                </TableCell>
                                                            </TableRow>
                                                        </Table>
                                                    </TableContainer>
                                                </Box> : null}
                                            {coinTotal.length > 0 ?
                                                <Box display='flex' justifyContent='flex-end' p={2}>
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
                                                            selectedSearchValues={selectedData}
                                                            prevTotalAmount={prevTotalAmount}
                                                            coinTotal={coinTotal}
                                                            remainingValueTotal={remainingValueTotal}
                                                        />
                                                    </div>
                                                </Box> : null}
                                        </CardContent>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page >
        </Fragment >
    )

}
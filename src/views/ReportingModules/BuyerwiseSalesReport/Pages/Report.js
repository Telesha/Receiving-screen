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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik} from 'formik';
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

const screenCode = 'BUYERWISEGRADESALESREPORT';

export default function BuyerwiseGradeSalesReport(props) {
    const [title, setTitle] = useState('Buyer Wise Sales Report');
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [FactoryList, setFactoryList] = useState([]);
    const [totalAmounts, setTotalAmounts] = useState({
        qtyTotal: 0,
        totAmount: 0
    });
    const [buyerwiseSalesReportDetail, setBuyerwiseSalesReportDetail] = useState({
        groupID: 0,
        factoryID: 0
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
        endDate: ''
    });

    const [startDateRange, setStartDateRange] = useState(new Date());
    const [endDateRange, setEndDateRange] = useState(new Date());

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getGroupsForDropdown());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropdown());
    }, [buyerwiseSalesReportDetail.groupID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'VIEWBUYERWISEGRADESALESREPORT'
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

    async function getBuyerWiseSalesReportData() {

        let totalQty = 0;
        let totalAmount = 0;

        let model = {
            groupID: parseInt(buyerwiseSalesReportDetail.groupID),
            factoryID: parseInt(buyerwiseSalesReportDetail.factoryID),
            startDate: moment(startDateRange.toString())
                .format()
                .split('T')[0],
            endDate: moment(endDateRange.toString())
                .format()
                .split('T')[0]
        };
        const buyerSalesData = await services.getBuyerwiseSalesReport(model);
        getSelectedDropdownValuesForReport(model);

        if (
            buyerSalesData.statusCode == 'Success' &&
            buyerSalesData.data != null
        ) {
            setReportData(buyerSalesData.data);
            buyerSalesData.data.forEach(x => {

                totalQty = x.netWeight + totalQty;
                totalAmount = x.value + totalAmount;

            });
            setTotalAmounts({
                ...totalAmounts,
                qtyTotal: totalQty,
                totAmount: totalAmount
            })


            createDataForExcel(buyerSalesData.data);
            if (buyerSalesData.data.length == 0) {
                alert.error('No Records');
            }
        } else {
            alert.error('Error');
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Buyer Name': x.buyerName,
                    'Qty': x.netWeight,
                    'Amount': x.value,
                    'Average': (x.value / x.netWeight).toFixed(2),
                    'Buying %': ((x.netWeight / totalAmounts.qtyTotal).toFixed(4)) * 100,
                };
                res.push(vr);
            });
            var vr = {
                'Buyer Name': 'Total',
                'Qty': totalAmounts.qtyTotal,
                'Amount': totalAmounts.totAmount,
                'Average': '',
                'Buying %': '',
            };
            res.push(vr);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(reportData);
        var settings = {
            sheetName: 'Buyer Wise Sales Report',
            fileName:
                'Buyer Wise Sales Report ' +
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
                sheet: 'Buyer Wise Sales Report',
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
        var startDate = moment(searchForm.startDate.toString())
            .format()
            .split('T')[0];
        var endDate = moment(searchForm.endDate.toString())
            .format()
            .split('T')[0];
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            factoryName: FactoryList[searchForm.factoryID],
            voucherCodeID: searchForm.voucherCodeID,
            startDate: [startDate],
            endDate: [endDate]
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
                            groupID: buyerwiseSalesReportDetail.groupID,
                            factoryID: buyerwiseSalesReportDetail.factoryID
                        }}
                        validationSchema={Yup.object().shape({
                            groupID: Yup.number()
                                .required('Group is required')
                                .min('1', 'Group is required'),
                            factoryID: Yup.number()
                                .required('Factory is required')
                                .min('1', 'Factory is required')
                        })}
                        onSubmit={() => trackPromise(getBuyerWiseSalesReportData())}
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
                                                        <InputLabel shrink id="date">From Date *</InputLabel>
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
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
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
                                            <Box minWidth={1050}>
                                                {reportData.length > 0 ? (
                                                    <TableContainer>
                                                        <Table aria-label="caption table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align={'center'}>
                                                                        Buyer Name
                                                                    </TableCell>
                                                                    <TableCell align={'center'}>
                                                                        Qty
                                                                    </TableCell>
                                                                    <TableCell align={'center'}>
                                                                        Amount
                                                                    </TableCell>
                                                                    <TableCell align={'center'}>
                                                                        Average
                                                                    </TableCell>
                                                                    <TableCell align={'center'}>
                                                                        Buying %
                                                                    </TableCell>

                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {reportData.map((data, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell
                                                                            align={'center'}
                                                                            component="th"
                                                                            scope="row"
                                                                            style={{ borderBottom: 'none' }}
                                                                        >
                                                                            {data.buyerName}
                                                                        </TableCell>
                                                                        <TableCell
                                                                            align={'center'}
                                                                            component="th"
                                                                            scope="row"
                                                                            style={{ borderBottom: 'none' }}
                                                                        >
                                                                            {data.netWeight}
                                                                        </TableCell>

                                                                        <TableCell
                                                                            align={'center'}
                                                                            component="th"
                                                                            scope="row"
                                                                            style={{ borderBottom: 'none' }}
                                                                        >
                                                                            {data.value}
                                                                        </TableCell>
                                                                        <TableCell
                                                                            align={'center'}
                                                                            component="th"
                                                                            scope="row"
                                                                            style={{ borderBottom: 'none' }}
                                                                        >
                                                                            {(Number(data.value) / Number(data.netWeight)).toFixed(2)}
                                                                        </TableCell>
                                                                        <TableCell
                                                                            align={'center'}
                                                                            component="th"
                                                                            scope="row"
                                                                            style={{ borderBottom: 'none' }}
                                                                        >
                                                                            {((data.netWeight / totalAmounts.qtyTotal) * 100).toFixed(2) + '%'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            <TableRow style={{ background: '#ADD8E6' }}>
                                                                <TableCell
                                                                    align={'center'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ fontWeight: 'bold' }}
                                                                >
                                                                    Total
                                                                </TableCell>
                                                                <TableCell
                                                                    align={'center'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none' }}
                                                                >{totalAmounts.qtyTotal}</TableCell>
                                                                <TableCell
                                                                    align={'center'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none' }}
                                                                >{totalAmounts.totAmount}</TableCell>

                                                                <TableCell
                                                                    align={'center'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none' }}
                                                                >
                                                                </TableCell>
                                                                <TableCell
                                                                    align={'center'}
                                                                    component="th"
                                                                    scope="row"
                                                                    style={{ borderBottom: 'none' }}
                                                                >

                                                                </TableCell>


                                                            </TableRow>
                                                        </Table>
                                                    </TableContainer>
                                                ) : null}
                                            </Box>
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
                                                        documentTitle={'Buyer Wise Sales Report'}
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
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    );
}

import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button,
    CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Collapse
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { parseInt } from 'lodash';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import moment from 'moment';
import xlsx from 'json-as-xlsx';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    avatar: {
        marginRight: theme.spacing(2)
    }

}));

var screenCode = "ESTIMATEDADVANCERATELEDGERREPORT"
export default function EstimatedAdvaceRateLedgerReport() {
    const [title, setTitle] = useState(" Estimated Advance Rate Ledger Report ");
    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [groups, setGroups] = useState()
    const [factories, setFactories] = useState()
    const [products, setProducts] = useState()
    const [estimateData, setEstimateData] = useState({
        groupID: 0,
        factoryID: 0,
        productID: 0,
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10)
    })
    const [isUpdate, setIsUpdate] = useState(false);
    const [estimateList, setEstimateList] = useState([]);
    const [searchedData, setSearchedData] = useState();
    const [tableHeader, setTableHeader] = useState([]);
    const [LedgerCsvHeaders, SetledgerCsvHeaders] = useState([])

    useEffect(() => {
        getPermissions();
        trackPromise(
            getGroupsForDropdown()
        );
    }, [])

    useEffect(() => {
        getFactoriesForDropdown()
    }, [estimateData.groupID]);

    useEffect(() => {
        trackPromise(getProductsForDropdown());
    }, [estimateData.factoryID]);

    useEffect(() => {
        setEstimateData({
            ...estimateData,
            endDate: endDay
        })
    }, [estimateData.startDate])

    useEffect(() => {
        setEstimateList([]);
    }, [estimateData.startDate, estimateData.endDate, estimateData.productID])


    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEASIMATEDADVANCERATELEDGERREPORT');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        });

        setEstimateData({
            ...estimateData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getAllFactoriesByGroupID(estimateData.groupID);
        setFactories(factories);
    }

    async function getProductsForDropdown() {
        const products = await services.getAllProducts(estimateData.factoryID);
        setProducts(products);
    }

    async function GetDetails() {
        const model = {
            groupID: estimateData.groupID,
            factoryID: estimateData.factoryID,
            productID: estimateData.productID,
            startDate: moment(estimateData.startDate.toString()).format().split('T')[0],
            endDate: moment(estimateData.endDate.toString()).format().split('T')[0],
            month: estimateData.startDate.split('-')[1],
            year: estimateData.startDate.split('-')[0],
        }
        const reportData = await services.GetEstimatedLedgerDetailsForReport(model);

        var sortList = reportData.sort(function (a, b) {
            return parseInt(a.RegistrationNumber) - parseInt(b.RegistrationNumber);
        });

        if (reportData.length > 0) {
            let updatedList = await ReCalculateBalancePaymentAmount(sortList);
            setEstimateList(updatedList);
            setSearchedData(model);

            let header = Object.keys(updatedList[0]);
            setTableHeader(header);
        } else {
            alert.error("No record to display");
        }
    }

    async function ReCalculateBalancePaymentAmount(reportData) {
        reportData.forEach(element => {
            var tempModel = {
                "Balance Payment": element["Balance Payment"],
                "Balance Brought Forward": element["Balance Brought Forward"],
                "TR Addition Rate": element["ExPayRate"],
                "Transport Addition": element["Transport Addition"]
            };

            delete element["Balance Payment"];
            delete element["Balance Brought Forward"];
            delete element["Transport Rate"];

            element = Object.assign(element, tempModel)

            element["Balance Payment"] = 0;
            element["Balance Brought Forward"] = 0;

            let netAmount = {
                "Net Amount": 0,
            }
            element = Object.assign(element, netAmount);

            let balancePaymentAmount = (
                element["GrossPay"] === null || NaN ? 0 : element["GrossPay"]
                    + element["Addition"] === null || NaN ? 0 : element["Addition"]
                        + element["Balance Payment Forward"] === null || NaN ? 0 : element["Balance Payment Forward"]
            ) - (
                    element["Advance Payment"] === null || NaN ? 0 : element["Advance Payment"]
                        + element["Advance Payment Bank"] === null || NaN ? 0 : element["Advance Payment Bank"]
                            + element["Advance Payment Cheque"] === null || NaN ? 0 : element["Advance Payment Cheque"]
                                + element["Deduction"] === null || NaN ? 0 : element["Deduction"]
                                    + element["Factory Item"] === null || NaN ? 0 : element["Factory Item"]
                                        + element["Transport Rate"] === null || NaN ? 0 : element["Transport Rate"]
                                            + element["Balance Carry Forward"] === null || NaN ? 0 : element["Balance Carry Forward"]
                )

            let netAmountCol = (
                (element["GrossPay"] === null || NaN ? 0 : element["GrossPay"] == undefined ? 0 : element["GrossPay"])
                + (element["Addition"] === null || NaN ? 0 : element["Addition"] == undefined ? 0 : element["Addition"])
                + ((element["TotalCrop"] === null || NaN ? 0 : element["TotalCrop"] == undefined ? 0 : element["TotalCrop"]) * (element["ExPayRate"] === null || NaN ? 0 : element["GrossPay"] == undefined ? 0 : element["ExPayRate"]))
                - (element["Advance Payment"] === null || NaN ? 0 : element["Advance Payment"] == undefined ? 0 : element["Advance Payment"])
                - (element["Advance Payment Bank"] === null || NaN ? 0 : element["Advance Payment Bank"] == undefined ? 0 : element["Advance Payment Bank"])
                - (element["Advance Payment Cheque"] === null || NaN ? 0 : element["Advance Payment Cheque"] == undefined ? 0 : element["Advance Payment Cheque"])
                - (element["Deduction"] === null || NaN ? 0 : element["Deduction"] == undefined ? 0 : element["Deduction"])
                - (element["Stamp"] === null || NaN ? 0 : element["Stamp"] == undefined ? 0 : element["Stamp"])
                - (element["Factory Item"] === null || NaN ? 0 : element["Factory Item"] == undefined ? 0 : element["Factory Item"])
            )

            element["Balance Payment"] = balancePaymentAmount >= 0 ? balancePaymentAmount : 0
            element["Balance Brought Forward"] = balancePaymentAmount < 0 ? balancePaymentAmount : 0
            element["TR Addition Rate"] = element["ExPayRate"]
            element["Transport Addition"] = element["TotalCrop"] * element["ExPayRate"]
            element["Net Amount"] = netAmountCol >= 0 ? netAmountCol : 0

            delete element["Expay"];
        })
        return reportData
    }

    function createFile() {
        createBalancePaymentEstimatedLedgerxlx(estimateList);
    }

    function createBalancePaymentEstimatedLedgerxlx(estimateList) {
        const settings = {
            sheetName: 'Balance Payment Estimated Advance Rate Ledger ' + searchedData.startDate + ' - ' + searchedData.endDate,
            fileName: 'Balance Payment Estimated Advance Rate Ledger ' + searchedData.startDate + ' - ' + searchedData.endDate,
            writeOptions: {},
            extraLength: 3
        }

        let keys = Object.keys(estimateList[0])
        let tempcsvHeaders = LedgerCsvHeaders;
        keys.map((sitem, i) => {
            if ((sitem != "Balance Payment" && sitem != "Balance Brought Forward")) {
                if (sitem !== "ExPayRate") {
                    tempcsvHeaders.push({ label: sitem, value: sitem });
                }
            }
        })

        const total = [];
        estimateList.forEach(x => {
            for (var property in x) {
                if (property != "RouteName" && property != "RegistrationNumber" && property != "Name") {
                    total.push({ name: property, value: x[property] });
                }
            }
        });

        estimateList.forEach(x => {
            for (var property in x) {
                if (property != "RouteName" && property != "RegistrationNumber" && property != "Name") {
                    x[property] = x[property] == null ? '0.00' : x[property].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                }
            }
        });

        const res = Array.from(total.reduce(
            (m, { name, value }) => m.set(name, value != null ? parseFloat(m.get(name) || 0) + parseFloat(value) : parseFloat(m.get(name) || 0) + parseFloat(0)), new Map
        ), ([name, value]) => ({ name, value }));

        estimateList.push({});
        let newRes = [];
        newRes['RouteName'] = 'Total'
        res.forEach(x => {
            newRes[x.name] = x.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        })
        estimateList.push(newRes);
        estimateList.push({});

        let filterData = []
        estimateList.forEach(x => {
            for (var property in x) {
                filterData.push({ name: property, value: x[property] == null ? '0.00' : x[property].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })
            }
        })

        let groupFactory = {
            'RouteName': "Group: " + groups[estimateData.groupID],
            'RegistrationNumber': "Factory: " + factories[estimateData.factoryID]
        }
        estimateList.push(groupFactory);
        let fromDateToDate = {
            'RouteName': "From Date: " + moment(estimateData.startDate.toString()).format().split('T')[0],
            'RegistrationNumber': "To Date: " + moment(estimateData.endDate.toString()).format().split('T')[0]
        }
        estimateList.push(fromDateToDate);

        let mergedData = [
            {
                sheet: 'Balance Payment Ledger',
                columns: tempcsvHeaders,
                content: estimateList
            }
        ]
        xlsx(mergedData, settings);
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

    const specificMonth = new Date(estimateData.startDate);
    const firstDay = specificMonth.toISOString().split('T')[0];
    const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
    const lastDay = lastDayOfMonth.toISOString().split('T')[0];
    const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];

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
        setEstimateData({
            ...estimateData,
            [e.target.name]: value
        });
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: estimateData.groupID,
                            factoryID: estimateData.factoryID,
                            productID: estimateData.productID,
                        }}

                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                                productID: Yup.number().required('Product is required').min("1", 'Product is required'),
                            })
                        }
                        onSubmit={() => trackPromise(GetDetails())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched,
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
                                                    <Grid item xs={12} md={4}>
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
                                                            value={estimateData.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                                                            }}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
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
                                                            value={estimateData.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            InputProps={{
                                                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <InputLabel shrink id="productID">
                                                            Product *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.productID && errors.productID)}
                                                            fullWidth
                                                            helperText={touched.productID && errors.productID}
                                                            name="productID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={estimateData.productID}
                                                            variant="outlined"
                                                            id="productID"
                                                            InputProps={{
                                                                readOnly: isUpdate ? true : false
                                                            }}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Product--</MenuItem>
                                                            {generateDropDownMenu(products)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <InputLabel shrink id="startDate">
                                                            From Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="startDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={estimateData.startDate}
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
                                                    <Grid item xs={12} md={4}>
                                                        <InputLabel shrink id="endDate">
                                                            To Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="endDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={estimateData.endDate}
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

                                                <Box hidden={true}>
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} size="small" aria-label="simple table">
                                                            <TableHead>
                                                                {tableHeader.map((data, index) => (
                                                                    <TableCell>
                                                                        {data}
                                                                    </TableCell>
                                                                ))}
                                                            </TableHead>
                                                            <TableBody>
                                                                {estimateList.map((row, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                                            {/* {row} */}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Box>
                                            </CardContent>
                                            {estimateList.length > 0 ?
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
                                                        Estimated Advance Rate Ledger
                                                    </Button>
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


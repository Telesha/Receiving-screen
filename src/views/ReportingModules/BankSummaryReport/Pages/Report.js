import React, { useState, useEffect, useRef } from 'react';
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
    InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import { trackPromise } from 'react-promise-tracker';
import tokenService from '../../../../utils/tokenDecoder';
import { Formik } from 'formik';
import * as Yup from "yup";
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import MaterialTable from "material-table";
import xlsx from 'json-as-xlsx';
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";

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
    row: {
        marginTop: '1rem'
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

const screenCode = 'BANKSUMMARYREPORT';

export default function BankSummaryReport(props) {
    const [title, setTitle] = useState("Bank Summary Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [routes, setRoutes] = useState();
    const [branches, setBranches] = useState();
    const [bankList, setBankList] = useState([]);
    const [selectedDate, setSelectedDate] = useState();
    const [selectedDatePDF, setSelectedDatePDF] = useState();
    const [bankSummaryData, setBankSummaryData] = useState([]);
    const [bankSummaryList, setBankSummaryList] = useState({
        groupID: '0',
        factoryID: '0',
        routeID: '0',
        bankID: '0',
        branchID: '0',
        month: '',
        year: ''
    })

    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        factoryName: "0",
        routeName: "0",
        month: '',
        year: ''
    })

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const [csvHeaders, SetCsvHeaders] = useState([])
    const componentRef = useRef();
    const [totalAmounts, setTotalAmounts] = useState({
        totalAmount: 0,
    });
    const navigate = useNavigate();
    const alert = useAlert();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [bankSummaryList.groupID]);

    useEffect(() => {
        trackPromise(
            getRoutesByFactoryID()
        )
    }, [bankSummaryList.factoryID]);

    useEffect(() => {
        trackPromise(
            getBanksForDropdown());
    }, []);

    useEffect(() => {
        getBranchesForDropdown()
    }, [bankSummaryList.bankID]);

    useEffect(() => {
        if (bankSummaryList.factoryID > 0 && bankSummaryList.groupID > 0) {
            trackPromise(GetBalancePaymentYearMonthForDropDown());
        }
    }, [bankSummaryList.factoryID, bankSummaryList.groupID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWBANKSUMMARYREPORT');

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

        setBankSummaryList({
            ...bankSummaryList,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(bankSummaryList.groupID);
        setFactories(factory);
    }

    async function getRoutesByFactoryID() {
        const route = await services.getRoutesForDropDown(bankSummaryList.factoryID);
        setRoutes(route);
    }

    async function getBanksForDropdown() {
        const bank = await services.getBanksForDropdown();
        setBankList(bank);
    }

    async function getBranchesForDropdown() {
        const branch = await services.getBranchesByBankID(parseInt(bankSummaryList.bankID));
        setBranches(branch);
    }

    async function GetBalancePaymentYearMonthForDropDown() {
        var response = await services.GetBalancePaymentYearMonth(bankSummaryList.groupID, bankSummaryList.factoryID);

        const applicableYear = parseInt(response.applicableYear);
        const applicableMonth = parseInt(response.applicableMonth) - 1;

        const selectedDate = new Date(applicableYear, applicableMonth);

        setSelectedDate(selectedDate);
        setSelectedDatePDF(response);
    };

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
        var month = date.getUTCMonth() + 1;
        var year = date.getUTCFullYear();
        setBankSummaryList({
            ...bankSummaryList,
            month: month.toString(),
            year: year.toString()
        });

        if (selectedDate != null) {

            var prevMonth = selectedDate.getUTCMonth() + 1
            var prevyear = selectedDate.getUTCFullYear();

            if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
                setSelectedDate(date)

            }
        } else {
            setSelectedDate(date)
        }
    }

    async function GetDetails() {
        const applicableYear = selectedDate.getFullYear().toString();
        const applicableMonth = (selectedDate.getMonth() + 1).toString();

        let model = {
            groupID: parseInt(bankSummaryList.groupID),
            factoryID: parseInt(bankSummaryList.factoryID),
            routeID: parseInt(bankSummaryList.routeID),
            bankID: parseInt(bankSummaryList.bankID),
            branchID: parseInt(bankSummaryList.branchID),
            applicableMonth: applicableMonth,
            applicableYear: applicableYear
        }
        getSelectedDropdownValuesForReport(model);

        let total = 0;

        const customerData = await services.GetBankSummaryDetails(model);
        if (customerData.statusCode == "Success" && customerData.data != null) {
            customerData.data.forEach(x => {
                total = total + parseFloat(x.amount)
            });
            setTotalAmounts(total);
            setBankSummaryData(customerData.data);
            createDataForExcel(customerData.data);

            if (customerData.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error(customerData.message);
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Bank': x.bankName,
                    'Branch': x.branchName,
                    'Total': x.amount
                }
                res.push(vr);
            });
            var vr1 = {
                'Bank': 'Total',
                'Total': parseFloat(totalAmounts),
            };
            res.push(vr1);
            res.push({
            });
            res.push({
                Bank: 'Group: ' + selectedSearchValues.groupName,
                Branch: 'Factory: ' + selectedSearchValues.factoryName
            });
            res.push({
                Bank: 'Route: ' + selectedSearchValues.routeName,
                Branch: 'Year & Month: ' + selectedSearchValues.year + '' + selectedSearchValues.month,
            });
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(bankSummaryData);
        var settings = {
            sheetName: 'Bank Summary Report',
            fileName: 'Bank Summary Report',
            writeOptions: {}
        }

        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })

        let dataA = [
            {
                sheet: 'Bank Summary Report',
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
        setBankSummaryList({
            ...bankSummaryList,
            [e.target.name]: value
        });
    }

    function handleSearchDropdownChange(data, e) {
        if (data === undefined || data === null) {
            setBankSummaryList({
                ...bankSummaryList,
                bankID: '0'
            });
            return;
        } else {
            var nameV = "bankID";
            var valueV = data["bankID"];
            setBankSummaryList({
                ...bankSummaryList,
                bankID: valueV.toString()
            });
        }
    }

    function handleSearchDropdownBranch(data, e) {
        if (data === undefined || data === null) {
            setBankSummaryList({
                ...bankSummaryList,
                branchID: '0'
            });
            return;
        } else {
            var nameV = "branchID";
            var valueV = data["branchID"];
            setBankSummaryList({
                ...bankSummaryList,
                branchID: valueV.toString()
            });
        }
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            factoryName: factories[searchForm.factoryID],
            routeName: routes[searchForm.routeID],
            month: searchForm.month,
            year: searchForm.year,
        })
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: bankSummaryList.groupID,
                        factoryID: bankSummaryList.factoryID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Group required').min("1", 'Group required'),
                            factoryID: Yup.number().required('Factory required').min("1", 'Factory required')
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
                                                <Grid item md={3} xs={8}>
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
                                                        value={bankSummaryList.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Group--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={3} xs={8}>
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
                                                        value={bankSummaryList.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Factory--</MenuItem>
                                                        {generateDropDownMenu(factories)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="routeID">
                                                        Route
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="routeID"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={bankSummaryList.routeID}
                                                        variant="outlined"
                                                        id="routeID"
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Routes--</MenuItem>
                                                        {generateDropDownMenu(routes)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
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
                                                            onChange={(date) => handleDateChange(date)}
                                                            size='small'
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="bankID">
                                                        Bank
                                                    </InputLabel>
                                                    <Autocomplete

                                                        id="bankID"
                                                        options={bankList}
                                                        getOptionLabel={(option) => option.bankName.toString()}
                                                        onChange={(e, value) => handleSearchDropdownChange(value, e)}
                                                        defaultValue={null}
                                                        renderInput={(params) =>
                                                            <TextField {...params}
                                                                variant="outlined"
                                                                name="bankID"
                                                                error={Boolean(touched.bankID && errors.bankID)}
                                                                fullWidth
                                                                helperText={touched.bankID && errors.bankID}
                                                                value={bankSummaryList.bankID}
                                                                getOptionDisabled={true}
                                                            />
                                                        }
                                                        size='small'
                                                    />

                                                </Grid>
                                                <Grid item md={3} xs={8}>
                                                    <InputLabel shrink id="branchID">
                                                        Branch
                                                    </InputLabel>
                                                    <Autocomplete

                                                        id="branchID"
                                                        options={branches}
                                                        getOptionLabel={(option) => option.branchName.toString()}
                                                        onChange={(e, value) => handleSearchDropdownBranch(value, e)}
                                                        defaultValue={null}
                                                        renderInput={(params) =>
                                                            <TextField {...params}
                                                                variant="outlined"
                                                                name="branchID"
                                                                fullWidth
                                                                value={bankSummaryList.branchID}
                                                                getOptionDisabled={true}
                                                            />
                                                        }
                                                        size='small'
                                                    />

                                                </Grid>
                                            </Grid>
                                            <Box display="flex" flexDirection="row-reverse" p={2} >
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                            <br />
                                            <Box minWidth={1050}>
                                                {bankSummaryData.length > 0 ?
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Bank', field: 'bankName' },
                                                            { title: 'Branch', field: 'branchName' },
                                                            { title: 'Amount(Rs.)', field: 'amount', render: rowData => rowData.amount.toFixed(2) },
                                                        ]}
                                                        data={bankSummaryData}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 5
                                                        }}
                                                        actions={[

                                                        ]}
                                                    /> : null}
                                            </Box>
                                        </CardContent>

                                        {bankSummaryData.length > 0 ?
                                            <CardContent>
                                                <Box display="flex" justifyContent="flex-end" border={1} borderColor="#626964" >
                                                    <Grid container md={12} spacing={2} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                                        <Grid item md={2} xs={12}>
                                                            <InputLabel ><b>Total Amount</b></InputLabel>
                                                        </Grid>
                                                        <Grid item md={10} xs={12}>
                                                            <Grid container mt={2} spacing={2}>
                                                                <Grid item md={1} xs={12}><InputLabel><b>{":"}</b> </InputLabel>
                                                                </Grid>
                                                                <Grid item md={11} xs={12}><InputLabel >{"Rs. " + totalAmounts.toFixed(2)}</InputLabel>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </CardContent> : null}
                                        {bankSummaryData.length > 0 ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    type="submit"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={createFile}
                                                >
                                                    EXCEL
                                                </Button>
                                                <div>&nbsp;</div>
                                                <ReactToPrint
                                                    documentTitle={"Bank Summary Report"}
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
                                                    <CreatePDF ref={componentRef} BankSummaryList={bankSummaryList} TotalAmount={totalAmounts}
                                                        BankSummarySearchData={selectedSearchValues} BankSummaryData={bankSummaryData} selectedDatePDF={selectedDatePDF} />
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
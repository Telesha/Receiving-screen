import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAlert } from "react-alert";
import Page from 'src/components/Page';
import PerfectScrollbar from 'react-perfect-scrollbar';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import {
    Box,
    Card,
    makeStyles,
    Container,
    CardContent,
    Divider,
    Grid,
    InputLabel,
    TextField,
    MenuItem,
    CardHeader,
    Button,
} from '@material-ui/core';
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import MaterialTable from "material-table";
import { LoadingComponent } from 'src/utils/newLoader';
import tokenService from 'src/utils/tokenDecoder';
import authService from 'src/utils/permissionAuth';
import CustomerBalancePaymentCheque from './../../Common/Receipts/CustomerBalancePaymentCheque/CustomerBalancePaymentCheque';
import ReactToPrint from "react-to-print";

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
}));

var screenCode = "CUSTOMERCHEQUEPRINT"
export default function CustomerChequePrint() {

    const componentRef = useRef();
    const alert = useAlert();
    const navigate = useNavigate();
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [FactoryList, setFactoryList] = useState([]);
    const [RouteList, setRouteList] = useState([]);
    const [CheckPrintUserDetails, setCheckPrintUserDetails] = useState({
        groupID: 0,
        factoryID: 0,
        routeID: 0,
        applicableMonth: (new Date().getUTCMonth() + 1).toString(),
        applicableYear: new Date().getUTCFullYear().toString()
    })

    const [CustomerDetailsList, setCustomerDetailsList] = useState([]);
    const [SelectedCustomerDetailsList, setSelectedCustomerDetailsList] = useState([])
    const [SelectedDate, setSelectedDate] = useState(new Date());
    const [IsCheckProcessCompleted, setIsCheckProcessCompleted] = useState(false)
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: true,
        isFactoryFilterEnabled: true,
    });
    const [IsActionButtonsDisabled, setIsActionButtonsDisabled] = useState(false)

    useEffect(() => {
        trackPromise(getPermission())
        trackPromise(getGroupsForDropdown())
        trackPromise(getAllFactoryForDropdown())
    }, [])

    useEffect(() => {
        trackPromise(
            getAllFactoryByGroupIDForDropdown(CheckPrintUserDetails.groupID),
        )
    }, [CheckPrintUserDetails.groupID]);

    useEffect(() => {
        trackPromise(getRoutesByFactoryID(CheckPrintUserDetails.factoryID))
    }, [CheckPrintUserDetails.factoryID])

    useEffect(() => {
        if (CheckPrintUserDetails.groupID > 0 && CheckPrintUserDetails.factoryID > 0 && CheckPrintUserDetails.routeID > 0 && CheckPrintUserDetails.applicableMonth !== '0' && CheckPrintUserDetails.applicableYear !== '0') {
            trackPromise(GetChequePrintUserDetails())
        }
    }, [CheckPrintUserDetails.groupID, CheckPrintUserDetails.factoryID, CheckPrintUserDetails.routeID, CheckPrintUserDetails.applicableMonth, CheckPrintUserDetails.applicableYear])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode === 'VIEWCUSTOMERCHEQUEPRINT');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');


        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        });

        setCheckPrintUserDetails({
            ...CheckPrintUserDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function GetChequePrintUserDetails() {
        let requestModel = {
            groupID: parseInt(CheckPrintUserDetails.groupID),
            factoryID: parseInt(CheckPrintUserDetails.factoryID),
            routeID: parseInt(CheckPrintUserDetails.routeID),
            applicableMonth: CheckPrintUserDetails.applicableMonth,
            applicableYear: CheckPrintUserDetails.applicableYear
        }
        const result = await services.GetChequePrintCustomerDetails(requestModel)

        let userDetailsList = result.data
        if (result.statusCode === "Success") {
            if (userDetailsList.length === 0) {
                alert.error("No records to display");
                return;
            }
            setCustomerDetailsList(userDetailsList);
            trackPromise(CheckLedgerStatusInCustomerList(userDetailsList))
        } else {
            alert.error("Error occured in data loading..")
        }
    }

    async function CheckLedgerStatusInCustomerList(userDetailsList) {
        var result = userDetailsList.filter(obj => {
            return obj.isLedgerTransactionCompleted === false
        })

        if (result.length === 0) {
            setIsCheckProcessCompleted(true)
        } else {
            setIsCheckProcessCompleted(false)
        }
        return true
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroupList(groups);
    }

    async function getAllFactoryForDropdown() {
        const factoryList = await services.getAllFactories();
        setFactoryList(factoryList);
    }

    async function getAllFactoryByGroupIDForDropdown(groupID) {
        const factoryList = await services.getFactoriesByGroupID(groupID);
        setFactoryList(factoryList);
    }

    async function getRoutesByFactoryID(factoryID) {
        const routeList = await services.getRoutesByFactoryID(factoryID);
        setRouteList(routeList);
    }

    async function ProcessChequeList() {

        if (SelectedCustomerDetailsList.length <= 0) {
            alert.error("Please Select Customer Details to begin the process")
            return;
        }

        setIsActionButtonsDisabled(true)

        let requestModel = {
            groupID: parseInt(CheckPrintUserDetails.groupID),
            factoryID: parseInt(CheckPrintUserDetails.factoryID),
            modifiedBy: parseInt(tokenService.getUserIDFromToken()),
            chequePrintCustomerProcessModels: SelectedCustomerDetailsList,
            applicableMonth: CheckPrintUserDetails.applicableMonth,
            applicableYear: CheckPrintUserDetails.applicableYear
        }

        const result = await services.CustomerChequePrintProcess(requestModel);

        setSelectedCustomerDetailsList([]);
        setIsActionButtonsDisabled(false)

        if (result.statusCode === "Success") {
            alert.success(result.message)
            trackPromise(GetChequePrintUserDetails());
        } else {
            alert.error(result.message)
        }
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
        setCheckPrintUserDetails({
            ...CheckPrintUserDetails,
            [e.target.name]: value
        });
    }

    function handleDateChange(date) {
        var month = date.getUTCMonth() + 1; //months from 1-12
        var year = date.getUTCFullYear();
        setCheckPrintUserDetails({
            ...CheckPrintUserDetails,
            applicableMonth: month.toString(),
            applicableYear: year.toString()
        });
        setSelectedDate(date)
    }

    function handleRecordSelectionFromTable(rowData) {
        setSelectedCustomerDetailsList(rowData)
    }

    function ClearData() {
        setCheckPrintUserDetails({
            ...CheckPrintUserDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken()),
            routeID: 0,
            applicableMonth: (new Date().getUTCMonth() + 1).toString(),
            applicableYear: new Date().getUTCFullYear().toString()
        })
        setCustomerDetailsList([]);
        setSelectedCustomerDetailsList([]);
        setSelectedDate(new Date());
        setIsActionButtonsDisabled(false);
    }

    return (
        <Page className={classes.root} title={"Customer Cheque Print"}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Box mt={1}>
                    <PerfectScrollbar>
                        <Box mt={0}>
                            <Card>
                                <CardHeader
                                    title={cardTitle("Customer Cheque Print")}
                                />
                                <Divider />
                                <CardContent>
                                    <Grid container spacing={3}>
                                        <Grid item md={3} xs={12}>
                                            <InputLabel shrink id="groupID">
                                                Group *
                                            </InputLabel>
                                            <TextField select
                                                fullWidth
                                                name="groupID"
                                                onChange={(e) => handleChange(e)}
                                                value={CheckPrintUserDetails.groupID}
                                                variant="outlined"
                                                disabled={!permissionList.isGroupFilterEnabled}
                                                size = 'small'
                                            >
                                                <MenuItem value="0">--Select Group--</MenuItem>
                                                {generateDropDownMenu(GroupList)}
                                            </TextField>
                                        </Grid>
                                        <Grid item md={3} xs={12}>
                                            <InputLabel shrink id="factoryID">
                                                Factory *
                                            </InputLabel>
                                            <TextField select
                                                fullWidth
                                                name="factoryID"
                                                onChange={(e) => handleChange(e)}
                                                value={CheckPrintUserDetails.factoryID}
                                                variant="outlined"
                                                id="factoryID"
                                                disabled={!permissionList.isFactoryFilterEnabled}
                                                size = 'small'
                                            >
                                                <MenuItem value="0">--Select Factory--</MenuItem>
                                                {generateDropDownMenu(FactoryList)}
                                            </TextField>
                                        </Grid>
                                        <Grid item md={3} xs={12}>
                                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                <DatePicker
                                                    autoOk
                                                    fullWidth
                                                    variant="inline"
                                                    openTo="month"
                                                    views={["year", "month"]}
                                                    label="Year and Month *"
                                                    helperText="Select applicable month"
                                                    value={SelectedDate}
                                                    size = 'small'
                                                    disableFuture={false}
                                                    onChange={(date) => handleDateChange(date)}
                                                />
                                            </MuiPickersUtilsProvider>
                                        </Grid>
                                        <Grid item md={3} xs={12}>
                                            <InputLabel shrink id="routeID">
                                                Route *
                                            </InputLabel>
                                            <TextField select
                                                fullWidth
                                                name="routeID"
                                                onChange={(e) => handleChange(e)}
                                                value={CheckPrintUserDetails.routeID}
                                                variant="outlined"
                                                id="routeID"
                                                size = 'small'
                                            >
                                                <MenuItem value="0">--Select Routes--</MenuItem>
                                                {generateDropDownMenu(RouteList)}
                                            </TextField>
                                        </Grid>
                                    </Grid>
                                    {
                                        CustomerDetailsList.length > 0 ?
                                            <Grid container spacing={2}>
                                                <Grid item md={12} xs={12}>
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Route', field: 'routeName' },
                                                            { title: 'Reg No', field: 'registrationNumber' },
                                                            { title: 'Customer Name', field: 'customerName' },
                                                            { title: 'Amount (Rs)', field: 'amount' },
                                                            {
                                                                title: 'Ledger Status',
                                                                field: 'isLedgerTransactionCompleted',
                                                                lookup: {
                                                                    true: "Completed",
                                                                    false: "Not Completed"
                                                                }
                                                            },
                                                        ]}
                                                        data={CustomerDetailsList}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            selection: IsCheckProcessCompleted === false ? true : false,
                                                            selectionProps: rowData => ({
                                                                disabled: rowData.isLedgerTransactionCompleted === true,
                                                                color: 'primary'
                                                            }),
                                                            pageSize: 10
                                                        }}
                                                        onSelectionChange={(rows) => handleRecordSelectionFromTable(rows)}

                                                    />
                                                </Grid>
                                            </Grid> : null
                                    }
                                    <Grid container spacing={2}>
                                        <Grid item md={12} xs={12}>
                                            <Box display="flex" justifyContent="flex-end" >
                                                {
                                                    CustomerDetailsList.length > 0 ?
                                                        <>
                                                            {
                                                                IsCheckProcessCompleted === false ?
                                                                    <Button
                                                                        color="primary"
                                                                        id="btnChequePrint"
                                                                        variant="contained"
                                                                        style={{ marginRight: '0.5rem' }}
                                                                        onClick={() => (trackPromise(ProcessChequeList()))}
                                                                        disabled={SelectedCustomerDetailsList.length <= 0 || IsActionButtonsDisabled}
                                                                    >
                                                                        Process
                                                                    </Button> :
                                                                    <div>
                                                                        <ReactToPrint
                                                                            documentTitle={"Customer Cheques"}
                                                                            trigger={() =>
                                                                                <Button
                                                                                    color="primary"
                                                                                    type="submit"
                                                                                    variant="contained"
                                                                                    size="medium"
                                                                                    style={{ marginRight: '0.5rem' }}
                                                                                >
                                                                                    Cheque Print
                                                                                </Button>
                                                                            }
                                                                            content={() => componentRef.current}
                                                                            onAfterPrint={() => ClearData()}
                                                                        />
                                                                        <div hidden={true}>
                                                                            <CustomerBalancePaymentCheque ref={componentRef} data={CustomerDetailsList} />
                                                                        </div>
                                                                    </div>


                                                            }
                                                        </> : null
                                                }

                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Box>
                    </PerfectScrollbar>
                </Box>
            </Container>
        </Page>
    )
}

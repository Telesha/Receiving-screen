import React, { useState, useEffect, Fragment } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import MaterialTable from "material-table";
import tokenDecoder from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";
import { endOfMonth } from 'date-fns';

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



const screenCode = 'BALANCEPAYMENTBANKISSUANCE';

export default function BalancePaymentBankIssuance(props) {
    const [title, setTitle] = useState("Balance Payment Bank Issuance")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [routes, setRoutes] = useState();
    const [banks, setBanks] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bankIssuanceData, setBankIssuanceData] = useState([]);
    const [balancePaymentBankIssuance, setBalancePaymentBankIssuance] = useState({
        groupID: '0',
        factoryID: '0',
        routeID: '0',
        month: '',
        year: '',
    })

    const [bankIssuance, setBankIssuance] = useState({
        factoryID: '0',
        bankID: '0'
    })

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    const [maxDate, setMaxDate] = useState(new Date());
    const [isDisableButton, setIsDisableButton] = useState(false);
    const navigate = useNavigate();
    const alert = useAlert();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        setSelectedDate(null);
        trackPromise(getFactoriesForDropDown());
    }, [balancePaymentBankIssuance.groupID]);

    useEffect(() => {
        setSelectedDate(null);
        trackPromise(
            getRoutesByFactoryID()
        )
    }, [balancePaymentBankIssuance.factoryID]);

    useEffect(() => {
        trackPromise(
            getBanksForDropdown());
    }, [balancePaymentBankIssuance.factoryID]);

    useEffect(() => {
        setSelectedDate(null);
        trackPromise(
            checkISBalancePaymentCompleted()
        )
    }, [balancePaymentBankIssuance.groupID, balancePaymentBankIssuance.factoryID]);

    useEffect(() => {
        setSelectedDate(null);
    }, [balancePaymentBankIssuance.factoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWBALANCEPAYMENTBANKISSUANCE');



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

        setBalancePaymentBankIssuance({
            ...balancePaymentBankIssuance,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(balancePaymentBankIssuance.groupID);
        setFactories(factory);
    }

    async function getRoutesByFactoryID() {
        const route = await services.getRoutesForDropDown(balancePaymentBankIssuance.factoryID);
        setRoutes(route);
    }

    async function getBanksForDropdown() {
        const bank = await services.getBanksForDropdown(balancePaymentBankIssuance.factoryID);
        setBanks(bank);
    }

    async function Proceed() {
        let data = bankIssuanceData.map(a => ({ "customerBalancePaymentID": a.customerBalancePaymentID }))
        if (bankIssuance.bankID == 0) {
            alert.error("Please pick a bank");
        }
        else {
            let updateModel = {
                customerBalancePaymentIDModel: data,
                modifiedBy: tokenDecoder.getUserIDFromToken(),
                fromBankID: parseInt(bankIssuance.bankID)
            }
            const approveObject = await services.ProceedBankIssuance(updateModel);

            if (approveObject.statusCode == "Success") {
                alert.success("Successfully Proceed");
                setIsDisableButton(true);
                clearData();
            }
            else {
                alert.error("Error");
            }
        }
    }

    async function checkISBalancePaymentCompleted() {

        const response = await services.CheckISBalancePaymentCompleted(balancePaymentBankIssuance.groupID, balancePaymentBankIssuance.factoryID);
        const bDate = moment(response.data.lastBalancePaymentSchedule, moment.defaultFormat).toDate();
        var result = endOfMonth(bDate);

        setMaxDate(result);
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

    function handleDateChange(date) {
        var month = date.getUTCMonth() + 1; //months from 1-12
        var year = date.getUTCFullYear();
        var currentmonth = moment().format('MM');
        setBalancePaymentBankIssuance({
            ...balancePaymentBankIssuance,
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
        let model = {
            groupID: parseInt(balancePaymentBankIssuance.groupID),
            factoryID: parseInt(balancePaymentBankIssuance.factoryID),
            routeID: parseInt(balancePaymentBankIssuance.routeID),
            applicableMonth: balancePaymentBankIssuance.month,
            applicableYear: balancePaymentBankIssuance.year
        }
        const bankData = await services.GetBankIssuanceDetails(model);
        if (bankData.statusCode == "Success" && bankData.data != null) {

            setBankIssuanceData(bankData.data);
        }
        else {
            alert.error("Error");
        }
    }


    function clearData() {

        setBankIssuanceData([]);

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
        setBalancePaymentBankIssuance({
            ...balancePaymentBankIssuance,
            [e.target.name]: value
        });
    }

    function handleChange1(e) {
        const target = e.target;
        const value = target.value
        setBankIssuance({
            ...bankIssuance,
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
                            groupID: balancePaymentBankIssuance.groupID,
                            factoryID: balancePaymentBankIssuance.factoryID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                                factoryID: Yup.number().required('Factory required').min("1", 'Factory required')
                            })
                        }
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
                                                            value={balancePaymentBankIssuance.groupID}
                                                            size = 'small'
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}

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
                                                            value={balancePaymentBankIssuance.factoryID}
                                                            size = 'small'
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}

                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>


                                                    <Grid item md={3} xs={8}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                fullWidth
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year", "month"]}
                                                                label="Year and Month *"
                                                                helperText="Select applicable month"
                                                                value={selectedDate}
                                                                size = 'small'
                                                                maxDate={maxDate}
                                                                disableFuture={true}
                                                                onChange={(date) => handleDateChange(date)}
                                                            />
                                                        </MuiPickersUtilsProvider>
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
                                                            value={balancePaymentBankIssuance.routeID}
                                                            variant="outlined"
                                                            id="routeID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Routes--</MenuItem>
                                                            {generateDropDownMenu(routes)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid container justify="flex-end">
                                                        <Box pr={2}>
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                type="submit"
                                                                onClick={() => GetDetails()}
                                                                size = 'small'
                                                            >
                                                                Search
                                                            </Button>
                                                        </Box>
                                                    </Grid>

                                                </Grid>
                                                <br />
                                                <Box minWidth={1050}>
                                                    {bankIssuanceData.length > 0 ?
                                                        <MaterialTable
                                                            title="Multiple Actions Preview"
                                                            columns={[
                                                                { title: 'Route', field: 'routeName' },
                                                                { title: 'Reg Number', field: 'registrationNumber' },
                                                                { title: 'Supplier Name', field: 'name' },
                                                                { title: 'Bank', field: 'bankName' },
                                                                { title: 'Branch', field: 'branchName' },
                                                                { title: 'Account Number', field: 'accountNumber' },
                                                                { title: 'Amount(Rs.)', field: 'amount', render: rowData => rowData.amount.toFixed(2) },
                                                            ]}
                                                            data={bankIssuanceData}
                                                            options={{
                                                                exportButton: false,
                                                                showTitle: false,
                                                                headerStyle: { textAlign: "left", height: '1%' },
                                                                cellStyle: { textAlign: "left" },
                                                                columnResizable: false,
                                                                actionsColumnIndex: -1,
                                                                pageSize: 10
                                                            }}
                                                            actions={[

                                                            ]}
                                                        /> : null}
                                                </Box>
                                            </CardContent>

                                            {bankIssuanceData.length > 0 ?
                                                <Grid container spacing={0} >
                                                    <Grid item md={4} xs={12} style={{ marginLeft: '1rem' }}>
                                                        <InputLabel shrink id="bankID">
                                                            From Bank *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="bankID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange1(e)}
                                                            value={bankIssuance.bankID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value={0}>--Select Bank--</MenuItem>
                                                            {generateDropDownMenu(banks)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid> : null}

                                            {bankIssuanceData.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnRecord"
                                                        type="submit"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        className={classes.colorRecord}
                                                        onClick={Proceed}
                                                        disabled={isDisableButton}
                                                    >
                                                        Proceed
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
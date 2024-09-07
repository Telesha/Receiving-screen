import React, { useState, useEffect, useRef, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Grid,
    TableCell,
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
    TableFooter
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { useAlert } from "react-alert";
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import xlsx from 'json-as-xlsx';
import MaterialTable, { MTableBody } from "material-table";

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

const screenCode = 'LOANISSUEDDETAILSREPORT';

export default function LoanIssuedDetails(props) {
    const [title, setTitle] = useState("Loan Issued Details Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [routes, setRoutes] = useState();
    const [selectedDateFrom, setSelectedDateFrom] = useState(new Date());
    const [selectedDateTo, setSelectedDateTo] = useState(new Date());
    const [loanIssuedDetailsInput, setLoanIssuedDetailsInput] = useState({
        groupID: '0',
        factoryID: '0',
        routeID: '0',
        startyear: '',
        startmonth: '',
        endyear: '',
        endmonth: ''
    })

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [loanReportData, setLoanReportData] = useState([]);
    const navigate = useNavigate();
    const alert = useAlert();
    const [loanReportTotal, setLoanReportTotal] = useState({
        principalAmount: 0
    });
    const [csvHeaders, SetCsvHeaders] = useState([])
    const componentRef = useRef();
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        factoryName: "0",
        startmonth: '',
        endmonth: ''
    })

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [loanIssuedDetailsInput.groupID]);

    useEffect(() => {
        trackPromise(
            getRoutesByFactoryID()
        )
    }, [loanIssuedDetailsInput.factoryID]);


    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLOANISSUEDDETAILSREPORT');



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

        setLoanIssuedDetailsInput({
            ...loanIssuedDetailsInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(loanIssuedDetailsInput.groupID);
        setFactories(factory);
    }

    async function getRoutesByFactoryID() {
        const route = await services.getRoutesForDropDown(loanIssuedDetailsInput.factoryID);
        setRoutes(route);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(loanIssuedDetailsInput.groupID),
            factoryID: parseInt(loanIssuedDetailsInput.factoryID),
            routeID: parseInt(loanIssuedDetailsInput.routeID),
            fromApplicableYear: loanIssuedDetailsInput.startyear === "" ? moment(new Date()).format('YYYY') : loanIssuedDetailsInput.startyear,
            fromApplicableMonth: loanIssuedDetailsInput.startmonth === "" ? moment(new Date()).format('MM') : loanIssuedDetailsInput.startmonth,
            toApplicableYear: loanIssuedDetailsInput.endyear === "" ? moment(new Date()).format('YYYY') : loanIssuedDetailsInput.endyear,
            toApplicableMonth: loanIssuedDetailsInput.endmonth === "" ? moment(new Date()).format('MM') : loanIssuedDetailsInput.endmonth,
        }
        getSelectedDropdownValuesForReport(model);
        if (parseInt(model.fromApplicableYear) <= parseInt(model.toApplicableYear)) {
            const loanData = await services.GetLoanIssuedDetails(model);
            if (loanData.statusCode == "Success" && loanData.data != null) {
                setLoanReportData(loanData.data);
                calTotal(loanData.data);
                createDataForExcel(loanData.data);
                if (loanData.data.length == 0) {
                    alert.error("No records to display");
                }
            }
        }
        else if (parseInt(model.fromApplicableMonth) <= parseInt(model.toApplicableMonth)) {
            const loanData = await services.GetLoanIssuedDetails(model);
            if (loanData.statusCode == "Success" && loanData.data != null) {
                setLoanReportData(loanData.data);
                calTotal(loanData.data);
                createDataForExcel(loanData.data);
                if (loanData.data.length == 0) {
                    alert.error("No records to display");
                }
            }
            else {
                alert.error("No records to display");
            }
        }
        else {
            alert.error("Selected Months Are Incorrect");
        }
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Route Name': x.routeName,
                    'Month': moment(new Date(x.loanIssuedDate)).format('MMMM'),
                    'Registration Number': x.registrationNumber,
                    'Customer Name': x.name,
                    'Loan Issued Date': x.loanIssuedDate.split('T')[0],
                    'Principal Amount (Rs.)': x.principalAmount
                }
                res.push(vr);
            });
            var vr = {
                'Route Name': "Total",
                'Month': "",
                'Registration Number': "",
                'Customer Name': "",
                'Loan Issued Date': "",
                'Principal Amount (Rs.)': loanReportTotal.principalAmount
            }
            res.push(vr);
        }

        return res;
    }


    async function createFile() {
        var file = await createDataForExcel(loanReportData);
        var settings = {
            sheetName: 'Loan Issued Details Report',
            fileName: 'Loan Issued Details Report' + ' ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName + ' ' + (loanIssuedDetailsInput.startyear === "" ? moment(new Date()).format('YYYY') : loanIssuedDetailsInput.startyear)
                + '/' + (loanIssuedDetailsInput.startmonth === "" ? moment(new Date()).format('MMM') : selectedSearchValues.startmonth) + ' -' + (loanIssuedDetailsInput.endyear === "" ? moment(new Date()).format('YYYY') : loanIssuedDetailsInput.endyear)
                + '/' + (loanIssuedDetailsInput.endmonth === "" ? moment(new Date()).format('MMM') : selectedSearchValues.endmonth),
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Loan Issued Details Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    function calTotal(data) {
        let total = 0;
        data.forEach(element => {
            total += parseFloat(element.principalAmount);
        });
        setLoanReportTotal({
            ...loanReportTotal,
            principalAmount: total
        });
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            factoryName: factories[searchForm.factoryID]
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

    function handleDateChangeFrom(date) {
        let monthNamesFrom = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var month = date.getUTCMonth() + 1; //months from 1-12
        var year = date.getUTCFullYear();
        var currentmonth = moment().format('MM');
        let monthFrom = monthNamesFrom[month - 1];

        setSelectedSearchValues({
            ...selectedSearchValues,
            startmonth: monthFrom
        });

        setLoanIssuedDetailsInput({
            ...loanIssuedDetailsInput,
            startmonth: month.toString(),
            startyear: year.toString()
        });

        if (selectedDateFrom != null) {

            var prevMonth = selectedDateFrom.getUTCMonth() + 1
            var prevyear = selectedDateFrom.getUTCFullYear();

            if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
                setSelectedDateFrom(date)

            }
        } else {
            setSelectedDateFrom(date)
        }
        setLoanReportData([]);
    }

    function handleDateChangeTo(date) {
        let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var month = date.getUTCMonth() + 1; //months from 1-12
        var year = date.getUTCFullYear();
        var currentmonth = moment().format('MM');
        let monthName = monthNames[month - 1];

        setSelectedSearchValues({
            ...selectedSearchValues,
            endmonth: monthName
        });

        setLoanIssuedDetailsInput({
            ...loanIssuedDetailsInput,
            endmonth: month.toString(),
            endyear: year.toString()
        });

        if (selectedDateTo != null) {

            var prevMonth = selectedDateTo.getUTCMonth() + 1
            var prevyear = selectedDateTo.getUTCFullYear();

            if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
                setSelectedDateTo(date)
            }
        } else {
            setSelectedDateTo(date)
        }
        setLoanReportData([]);
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
        setLoanIssuedDetailsInput({
            ...loanIssuedDetailsInput,
            [e.target.name]: value
        });
        setLoanReportData([]);
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: loanIssuedDetailsInput.groupID,
                            factoryID: loanIssuedDetailsInput.factoryID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required')
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
                                                            value={loanIssuedDetailsInput.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                            size = 'small'
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
                                                            value={loanIssuedDetailsInput.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            size = 'small'
                                                        >
                                                            <MenuItem value="0">--Select Factory--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="routeID">
                                                            Route
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            name="routeID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={loanIssuedDetailsInput.routeID}
                                                            variant="outlined"
                                                            id="routeID"
                                                            size = 'small'
                                                        >
                                                            <MenuItem value="0">--Select Routes--</MenuItem>
                                                            {generateDropDownMenu(routes)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year", "month"]}
                                                                label="From Month *"
                                                                helperText="Select applicable month"
                                                                value={selectedDateFrom}
                                                                disableFuture={true}
                                                                onChange={(date) => handleDateChangeFrom(date)}
                                                                size = 'small'
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year", "month"]}
                                                                label="To Month *"
                                                                helperText="Select applicable month"
                                                                value={selectedDateTo}
                                                                disableFuture={true}
                                                                onChange={(date) => handleDateChangeTo(date)}
                                                                size = 'small'
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        onClick={() => trackPromise(GetDetails())}
                                                        size = 'small'
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                                <br />
                                                <Box minWidth={1050}>
                                                    {loanReportData.length > 0 ?
                                                        <MaterialTable
                                                            title="Multiple Actions Preview"
                                                            columns={[
                                                                { title: 'Route Name', field: 'routeName' },
                                                                { title: 'Month', field: 'loanIssuedDate', render: rowData => moment(new Date(rowData.loanIssuedDate)).format('MMMM') },
                                                                { title: 'Registration Number', field: 'registrationNumber' },
                                                                { title: 'Customer Name', field: 'name' },
                                                                { title: 'Loan Issued Date', field: 'loanIssuedDate', render: rowData => rowData.loanIssuedDate.split('T')[0] },
                                                                { title: 'Principal Amount (Rs.)', field: 'principalAmount', render: rowData => rowData.principalAmount.toFixed(2) }
                                                            ]}
                                                            data={loanReportData}
                                                            options={{
                                                                exportButton: false,
                                                                showTitle: false,
                                                                headerStyle: { textAlign: "left", height: '1%' },
                                                                cellStyle: { textAlign: "left" },
                                                                columnResizable: false,
                                                                actionsColumnIndex: -1,
                                                                pageSize: 10
                                                            }}
                                                            components={{
                                                                Body: (props) => (
                                                                    <>
                                                                        <MTableBody {...props} />
                                                                        <TableFooter>
                                                                            <TableRow>
                                                                                <TableCell style={{ fontSize: '15px' }}><b>Total</b></TableCell>
                                                                                <TableCell ></TableCell>
                                                                                <TableCell ></TableCell>
                                                                                <TableCell ></TableCell>
                                                                                <TableCell ></TableCell>
                                                                                <TableCell style={{ fontSize: '15px' }} > <b> {loanReportTotal.principalAmount.toFixed(2)} </b></TableCell>
                                                                            </TableRow>
                                                                        </TableFooter>
                                                                    </>
                                                                )
                                                            }}
                                                        /> : null}
                                                </Box>
                                            </CardContent>
                                            {loanReportData.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnRecord"
                                                        type="submit"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        className={classes.colorRecord}
                                                        onClick={createFile}
                                                        size = 'small'
                                                    >
                                                        EXCEL
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <ReactToPrint
                                                        documentTitle={"Loan Issued Details Report"}
                                                        trigger={() => <Button
                                                            color="primary"
                                                            id="btnCancel"
                                                            variant="contained"
                                                            style={{ marginRight: '1rem' }}
                                                            className={classes.colorCancel}
                                                            size = 'small'
                                                        >
                                                            PDF
                                                        </Button>}
                                                        content={() => componentRef.current}
                                                    />
                                                    <div hidden={true}>
                                                        <CreatePDF ref={componentRef} LoanIssuedDetailsInput={loanIssuedDetailsInput} LoanReportTotal={loanReportTotal}
                                                            LoanIssuedSearchData={selectedSearchValues} LoanReportData={loanReportData} />
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
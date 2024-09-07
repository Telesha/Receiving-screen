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
    Paper,
    InputLabel, Table, TableBody, TableCell, TableContainer, TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import TableHead from '@material-ui/core/TableHead';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import { useAlert } from "react-alert";
import _ from 'lodash';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

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
    },
    stickyHeader: {
        position: 'sticky',
        left: 0,
        zIndex: 1,
        backgroundColor: 'white',
    },
    stickyColumn: {
        position: 'sticky',
        left: 0,
        zIndex: 1,
        backgroundColor: 'white',
    },
}));

const screenCode = 'COINBALANCEREPORT';

export default function CoinBalanceReport(props) {
    const [title, setTitle] = useState("Coin Balance Report")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState();
    const [divisions, setDivisions] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [paymentCheckrollDetails, setPaymentCheckrollDetails] = useState([]);
    const [totalValues, setTotalValues] = useState({});
    const [paymentCheckrollSummaryInput, setPaymentCheckrollSummaryInput] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        estateID: 0,
        groupID: 0,
        divisionID: 0,
        year: '',
        month: ''
    })

    const navigate = useNavigate();
    const alert = useAlert();
    const componentRef = useRef();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [paymentCheckrollSummaryInput.groupID]);

    useEffect(() => {
        trackPromise(getDivisionDetailsByEstateID());
    }, [paymentCheckrollSummaryInput.estateID]);

    useEffect(() => {
        setDate()
    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCOINBALANCEREPORT');

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

        setPaymentCheckrollSummaryInput({
            ...paymentCheckrollSummaryInput,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(
            paymentCheckrollSummaryInput.groupID
        );
        setEstates(response);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(
            paymentCheckrollSummaryInput.estateID
        );
        setDivisions(response);
    }

    async function GetDetails() {
        let model = {
            groupID: parseInt(paymentCheckrollSummaryInput.groupID),
            estateID: parseInt(paymentCheckrollSummaryInput.estateID),
            divisionID: parseInt(paymentCheckrollSummaryInput.divisionID),
            month: paymentCheckrollSummaryInput.month.toString(),
            year: paymentCheckrollSummaryInput.year.toString(),
        }
        getSelectedDropdownValuesForReport(model);
        const response = await services.GetCoinBalanceReport(model);
        if (response.statusCode == "Success" && response.data != null) {
            response.data.forEach(element => {
                element.balanceCFAmount = element.balance - element.paybleAmount
            });
            setPaymentCheckrollDetails(response.data);
            if (response.data.length == 0) {
                alert.error("No records to display");
            }
        }
        else {
            alert.error(response.message);
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
        setPaymentCheckrollSummaryInput({
            ...paymentCheckrollSummaryInput,
            [e.target.name]: value
        });
        setPaymentCheckrollDetails([]);
    }

    function setDate() {
        let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var month = (paymentCheckrollSummaryInput.month);
        let monthName = monthNames[month - 1];

        setSelectedSearchValues({
            ...selectedSearchValues,
            monthName: monthName
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
        let monthName = monthNames[month - 1];

        setSelectedSearchValues({
            ...selectedSearchValues,
            monthName: monthName
        });
        setPaymentCheckrollSummaryInput({
            ...paymentCheckrollSummaryInput,
            month: month.toString(),
            year: year.toString()
        });
        setSelectedDate(date);
        setPaymentCheckrollDetails([]);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            divisionName: divisions[searchForm.divisionID],
            month: searchForm.month,
            year: searchForm.year
        })
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: paymentCheckrollSummaryInput.groupID,
                            estateID: paymentCheckrollSummaryInput.estateID,
                            divisionID: paymentCheckrollSummaryInput.divisionID,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Select a Estate'),
                                divisionID: Yup.number().required('Division is required').min("1", 'Select a Division'),
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

                                                    <Grid item md={4} xs={3}>
                                                        <InputLabel shrink id="estateID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.estateID && errors.estateID)}
                                                            fullWidth
                                                            helperText={touched.estateID && errors.estateID}
                                                            name="estateID"
                                                            onBlur={handleBlur}
                                                            onChange={e => handleChange(e)}
                                                            value={paymentCheckrollSummaryInput.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            size="small"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estates)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={3}>
                                                        <InputLabel shrink id="divisionID">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            name="divisionID"
                                                            onChange={e => handleChange(e)}
                                                            value={paymentCheckrollSummaryInput.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={3}>
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
                                                    {paymentCheckrollDetails.length > 0 ?
                                                        <TableContainer component={Paper}>
                                                            <Table className={classes.table} size="small" aria-label="simple table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="center"> EMP ID:</TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="center"> E.P.F. No: </TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="center"> Name</TableCell>
                                                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", width: "15%" }} align="right"> Rs.</TableCell>
                                                                    </TableRow>
                                                                </TableHead>

                                                                <TableBody>
                                                                    {paymentCheckrollDetails.map((row, index) => {
                                                                        return (
                                                                            <TableRow key={index}>
                                                                                <TableCell style={{ border: "2px solid black" }} align="center" component="th" scope="row">
                                                                                    {row.registrationNumber}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                                                    {row.epfNumber}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                                                    {row.employeeName}
                                                                                </TableCell>
                                                                                <TableCell style={{ border: "2px solid black" }} align="right" component="th" scope="row">
                                                                                    {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                                </TableCell>

                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                        : null}
                                                </Box>
                                            </CardContent>
                                            {paymentCheckrollDetails.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <div>&nbsp;</div>
                                                    <ReactToPrint
                                                        documentTitle={"Madeup Amount - Division Wise Report"}
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
                                                        <CreatePDF
                                                            ref={componentRef}
                                                            paymentCheckrollDetails={paymentCheckrollDetails}
                                                            selectedSearchValues={selectedSearchValues}
                                                            totalValues={totalValues} />
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
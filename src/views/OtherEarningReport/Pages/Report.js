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
    Paper,
    TableFooter
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from 'yup';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import {
    DatePicker,
    MuiPickersUtilsProvider,
    KeyboardDatePicker
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import { useAlert } from 'react-alert';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';

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


const screenCode = 'OTHEREARNINGREPORT';

export default function OTHEREARNINGREPORT(props) {
    const today = new Date();
    const [title, setTitle] = useState("Other Earning Report")
    const classes = useStyles();
    const [statutoryDetail, setStatutoryDetail] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        OtherEarningTypeID: 0,
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    });
    const [estateList, setEstateList] = useState([]);
    const [GroupList, setGroupList] = useState([]);
    const [OtherEarningTypesList, setOtherEarningTypesList] = useState([]);
    const [divitionList, setDivision] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [statutoryData, setStatutoryData] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const navigate = useNavigate();

    const monthDaysForExcel = ["employeeNumber", "employeeName", "otherEarningType", "amount"];

    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        divisionID: "0",
        estateID: "0",
        groupID: "0",
        OtherEarningTypeID: "0",
        year: '',
        month: ''
    });
    const componentRef = useRef();
    const [totalAmount, setTotalAmount] = useState(0);
    const alert = useAlert();
    const [alertCount, setAlertCount] = useState({
        count: 0
    });

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getGroupsForDropdown());
        trackPromise(getOtherEarningTypeForDropdown());
        setAlertCount({
            count: 1
        });
    }, []);

    useEffect(() => {
        getEstatesForDropdoen();
        trackPromise(
            getEstatesForDropdoen(statutoryDetail.groupID)
        )
        setAlertCount({
            count: alertCount.count + 1
        });
    }, [statutoryDetail.groupID]);


    useEffect(() => {
        trackPromise(getDivisionByEstateID(statutoryDetail.estateID));
    }, [statutoryDetail.estateID]);


    useEffect(() => {
        trackPromise(getOtherEarningTypeForDropdown(statutoryDetail.OtherEarningTypeID));
    }, [statutoryDetail.OtherEarningTypeID]);


    // useEffect(() => {
    //     const currentDate = new Date();
    //     const previousMonth = new Date(
    //         currentDate.getFullYear(),
    //         currentDate.getMonth(),
    //         currentDate.getDate()
    //     );
    //     setSelectedDate(previousMonth);
    // }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'VIEWOTHEREARNINGREPORT');


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

        setStatutoryDetail({
            ...statutoryDetail,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setStatutoryDetail({
            ...statutoryDetail,
            [e.target.name]: value
        });
        setStatutoryData([]);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstatesForDropdoen() {
        const estates = await services.getEstateDetailsByGroupID(statutoryDetail.groupID);
        setEstateList(estates);
    }

    async function getDivisionByEstateID() {
        var response = await services.getDivisionByEstateID(statutoryDetail.estateID);
        setDivision(response);
    };

    async function getOtherEarningTypeForDropdown() {
        const OtherEarningType = await services.GetAllOtherEaarningTypes(statutoryDetail.OtherEarningTypeID);
        setOtherEarningTypesList(OtherEarningType);
    }

    async function GetDetails() {
        setStatutoryData([]);
        let model = {
            GroupID: parseInt(statutoryDetail.groupID),
            EstateID: parseInt(statutoryDetail.estateID),
            DivisionID: parseInt(statutoryDetail.divisionID),
            OtherEarningTypeID: parseInt(statutoryDetail.OtherEarningTypeID),
            year: statutoryDetail.year.toString(),
            month: statutoryDetail.month.toString(),
        };
        getSelectedDropdownValuesForReport(model);

        const customerData = await services.GetOtherEarningDetails(model)
        if (customerData.statusCode == 'Success' && customerData.data != null) {
            setStatutoryData(customerData.data)
        } else {
            alert.error('NO RECORDS TO DISPLAY');
        }
    }


    async function createDataForExcel(array) {

        var result = [];
        var amount = 0;

        if (array != null) {

            array.forEach(x => {
                result.push({
                    registrationNumber: x.employeeNumber,
                    firstName: x.employeeName,
                    otherEarningType: x.otherEarningType,
                    amount: x.amount == 0 ? '-' : x.amount
                });
            }
            );

            result.push({
                registrationNumber: 'Total :',

                amount: array.reduce((total, row) => (total + parseFloat(row.amount)), 0) == 0 ? '-' : array.reduce((total, row) => (total + parseFloat(row.amount)), 0)
            });
            result.push({

            });

            result.push({
                registrationNumber: 'Group : ' + selectedSearchValues.groupID
            });
            result.push({
                registrationNumber: 'Estate : ' + selectedSearchValues.estateID,
            })
            result.push({
                registrationNumber: 'Division : ' + selectedSearchValues.divisionID
            });
            result.push({
                registrationNumber: 'Month : ' + selectedSearchValues.month
            });
            result.push({
                registrationNumber: 'Year : ' + selectedSearchValues.year
            });

        }
        return result;
    }
    async function createFile() {
        var file = await createDataForExcel(statutoryData);
        var settings = {
            sheetName: 'Other Earning Report ',
            fileName: 'Other Earning Report ' + ' - ' + selectedSearchValues.month + '/' + selectedSearchValues.year,
            writeOptions: {}
        }

        let keys = monthDaysForExcel
        let tempcsvHeaders = csvHeaders;
        tempcsvHeaders.push({ label: 'Employee Number', value: 'registrationNumber' })
        tempcsvHeaders.push({ label: 'Employee Name', value: 'firstName' })
        tempcsvHeaders.push({ label: 'Other Earning Type', value: 'otherEarningType' })
        tempcsvHeaders.push({ label: 'Amount', value: 'amount' })
        let dataA = [
            {
                sheet: 'Other Earning Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }
    const downloadTxtFile = () => {
        const columnOrder = ['EmployeeNumber', 'EmployeeName', 'OtherEarningType', 'Amount'];

        const columnWidths = {
            employeeNumber: 10,
            employeeName: 20,
            otherEarningType: 15,
            amount: 10,
        };

        const content = statutoryData
            .map(row =>
                columnOrder
                    .map(columnName => String(row[columnName]).padEnd(columnWidths[columnName]))
                    .join('')
            )
            .join('\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'Other Earning Report.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

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

    function clear() {
        if (permissionList.isFactoryFilterEnabled != true) {
            setStatutoryDetail({
                ...statutoryDetail,
                divisionID: 0,
                deductionTypeID: 0,
            })
        } else {
            setStatutoryDetail({
                ...statutoryDetail,
                divisionID: 0,
                OtherEarningTypeID: 0,
                groupID: 0,
                estateID: 0,
            })
        }
        setStatutoryData([]);
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
        var month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); //months from 1-12
        var year = date.getUTCFullYear();
        let monthName = monthNames[month - 1];
        setSelectedSearchValues({
            ...selectedSearchValues,
            monthName: monthName
        });
        setStatutoryDetail({
            ...statutoryDetail,
            month: month.toString(),
            year: year.toString()
        });

        setSelectedDate(date);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            estateID: estateList[searchForm.EstateID],
            groupID: GroupList[searchForm.GroupID],
            divisionID: divitionList[searchForm.DivisionID],
            OtherEarningTypeID: OtherEarningTypesList[searchForm.OtherEarningTypeID],
            year: searchForm.year,
            month: searchForm.month
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
                            groupID: statutoryDetail.groupID,
                            estateID: statutoryDetail.estateID,
                            divisionID: statutoryDetail.divisionID,
                            deductionTypeID: statutoryDetail.deductionTypeID
                        }}
                        validationSchema={Yup.object().shape({
                            groupID: Yup.number().required('Group required').min('1', 'Group required'),
                            estateID: Yup.number().required('Estate required').min('1', 'Factory required'),
                            divisionID: Yup.number().required('Division is required').min('1', 'Division is required'),
                        })}
                        onSubmit={() => trackPromise(GetDetails())}
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
                                                    <Grid item md={4} xs={8}>
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
                                                            value={statutoryDetail.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                                                            }}
                                                            // disabled={!permissionList.isGroupFilterEnabled}
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(GroupList)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="estateID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField
                                                            select
                                                            error={Boolean(touched.estateID && errors.estateID)}
                                                            fullWidth
                                                            helperText={touched.estateID && errors.estateID}
                                                            name="estateID"
                                                            onBlur={handleBlur}
                                                            onChange={e => handleChange(e)}
                                                            value={statutoryDetail.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            //disabled={!permissionList.isFactoryFilterEnabled}
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estateList)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="divisionID">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField
                                                            select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            fullWidth
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            name="divisionID"
                                                            onChange={e => handleChange(e)}
                                                            value={statutoryDetail.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divitionList)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="OtherEarningTypeID">
                                                            Other Earning Type
                                                        </InputLabel>
                                                        <TextField
                                                            select
                                                            error={Boolean(touched.OtherEarningTypeID && errors.OtherEarningTypeID)}
                                                            fullWidth
                                                            helperText={touched.OtherEarningTypeID && errors.OtherEarningTypeID}
                                                            name="OtherEarningTypeID"
                                                            onChange={e => handleChange(e)}
                                                            value={statutoryDetail.OtherEarningTypeID}
                                                            variant="outlined"
                                                            id="OtherEarningTypeID"
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Other Earning Type --</MenuItem>
                                                            {generateDropDownMenu(OtherEarningTypesList)}
                                                        </TextField>
                                                    </Grid>
                                                    <br></br>
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
                                                                onChange={date => handleDateChange(date)}
                                                                size="small"
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>

                                                <Grid item md={12} xs={12} container justify="flex-end">
                                                    <Box pt={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type='submit'
                                                        //onClick={() => trackPromise(GetDetails())}
                                                        >
                                                            Search
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                                <br></br>
                                                <br></br>
                                                <Box minWidth={1000} hidden={statutoryData.length == 0}>
                                                    <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                                        <Table
                                                            className={classes.table}
                                                            size="small"
                                                            aria-label="sticky table"
                                                            Table
                                                            stickyHeader
                                                        >
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> Employee Number </TableCell>
                                                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> Employee Name </TableCell>
                                                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> Other Earning Type </TableCell>
                                                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                                                                        {statutoryDetail.OtherEarningTypeID == 1 ? ' Amount (Rs.)' : statutoryDetail.OtherEarningTypeID == 2 ? 'Amount (Rs.)' : ''}
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {statutoryData.map((row, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                                                            {row.employeeNumber == '' ? '-' : row.employeeNumber}
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                                                            {row.employeeName}
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                                                            {row.otherEarningType}
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "1px solid black" }} align="right" component="th" scope="row">
                                                                            {(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            <TableFooter>
                                                                <TableRow>
                                                                    <TableCell colSpan={3} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="left">
                                                                        Total
                                                                    </TableCell>
                                                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="right">
                                                                        {statutoryData.reduce((total, row) => total + parseFloat(row.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableFooter>
                                                        </Table>
                                                    </TableContainer>
                                                </Box>
                                            </CardContent>

                                            {statutoryData.length > 0 ? (
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
                                                        EXCEL
                                                    </Button>
                                                    <div>&nbsp;</div>

                                                    {<ReactToPrint
                                                        documentTitle={'Loan Report'}
                                                        trigger={() => (
                                                            <Button
                                                                color="primary"
                                                                id="btnRecord"
                                                                type="submit"
                                                                variant="contained"
                                                                style={{ marginRight: '1rem' }}
                                                                className={classes.colorCancel}
                                                                size="small"
                                                            >
                                                                PDF
                                                            </Button>
                                                        )}
                                                        content={() => componentRef.current}
                                                    />}
                                                    {<div hidden={true}>
                                                        <CreatePDF
                                                            ref={componentRef}
                                                            selectedSearchValues={selectedSearchValues}
                                                            statutoryDetail={statutoryDetail}
                                                            statutoryData={statutoryData}
                                                        />
                                                    </div>}
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

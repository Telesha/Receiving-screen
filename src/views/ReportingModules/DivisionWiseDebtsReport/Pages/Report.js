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
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
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

const screenCode = 'DIVISIONWISEDEBTS';

export default function DivisionWiseDebtsReport(props) {
    const [title, setTitle] = useState("Division Wise Debts")
    const classes = useStyles();
    const [statutoryDetail, setStatutoryDetail] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    });
    const [estateList, setEstateList] = useState([]);
    const [GroupList, setGroupList] = useState([]);
    const [divitionList, setDivision] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [statutoryData, setStatutoryData] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const navigate = useNavigate();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        divisionID: "0",
        estateID: "0",
        groupID: "0",
        year: '',
        month: ''
    });
    const componentRef = useRef();
    const alert = useAlert();
    const [alertCount, setAlertCount] = useState({
        count: 0
    });

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getGroupsForDropdown());
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
        setStatutoryData([]);
    }, [statutoryDetail.month]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'VIEWDIVISIONWISEDEBTS');

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

    async function GetDetails() {
        setStatutoryData([]);
        let model = {
            GroupID: parseInt(statutoryDetail.groupID),
            EstateID: parseInt(statutoryDetail.estateID),
            DivisionID: parseInt(statutoryDetail.divisionID),
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

        if (array != null) {
            array.forEach(x => {
                result.push({
                    empNo: x.empNo,
                    firstName: x.employeeName,
                    paybleAmount: x.paybleAmount == 0 ? '-' : x.paybleAmount
                });
            }
            );

            result.push({
                empNo: 'Total :',

                paybleAmount: array.reduce((total, row) => (total + parseFloat(row.paybleAmount)), 0) == 0 ? '-' : array.reduce((total, row) => (total + parseFloat(row.paybleAmount)), 0)
            });
            result.push({

            });

            result.push({
                empNo: 'Group : ' + selectedSearchValues.groupID
            });
            result.push({
                empNo: 'Estate : ' + selectedSearchValues.estateID,
            })
            result.push({
                empNo: 'Division : ' + selectedSearchValues.divisionID
            });
            result.push({
                empNo: 'Month : ' + selectedSearchValues.month
            });
            result.push({
                empNo: 'Year : ' + selectedSearchValues.year
            });
        }
        return result;
    }
    async function createFile() {
        var file = await createDataForExcel(statutoryData);
        var settings = {
            sheetName: 'Division Wise Debts Report ',
            fileName: 'Division Wise Debts Report ' + ' - ' + selectedSearchValues.month + '/' + selectedSearchValues.year,
            writeOptions: {}
        }
        let tempcsvHeaders = csvHeaders;
        tempcsvHeaders.push({ label: 'EmpNo', value: 'empNo' })
        tempcsvHeaders.push({ label: 'Employee Name', value: 'firstName' })
        tempcsvHeaders.push({ label: 'PaybleAmount', value: 'paybleAmount' })
        let dataA = [
            {
                sheet: 'Division Wise Debts Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
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
                                                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left"> Employee Number </TableCell>
                                                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left"> Employee Name </TableCell>
                                                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="right">PaybleAmount </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {statutoryData.map((row, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                                                            {row.empNo == '' ? '-' : row.empNo}
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                                                            {row.employeeName}
                                                                        </TableCell>
                                                                        <TableCell style={{ border: "1px solid black" }} align="right" component="th" scope="row">
                                                                            {(row.paybleAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            <TableFooter>
                                                                <TableRow>
                                                                    <TableCell colSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="left">
                                                                        Total
                                                                    </TableCell>
                                                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="right">
                                                                        {statutoryData.reduce((total, row) => total + parseFloat(row.paybleAmount), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                                        documentTitle={'Division Wise Debts Report'}
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

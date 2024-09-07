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
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import { useAlert } from 'react-alert';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';

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
    },
    table: {
        minWidth: 1050,
        position: 'relative',
        overflowX: 'auto',
    },
    stickyHeader: {
        position: 'sticky',
        top: 0,
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

const screenCode = 'CASHDAYPLUCKINGREPORT';

export default function CashDayPluckingReport(props) {
    const [title, setTitle] = useState('Cash Day Plucking Report');
    const classes = useStyles();
    const [cashCustomerDetail, setcashCustomerDetail] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10)
    });
    const [estateList, setEstateList] = useState([]);
    const [GroupList, setGroupList] = useState([]);
    const [divitionList, setDivision] = useState();
    const [cashCustomerData, setCashCustomerData] = useState([]);
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
        startDate: "",
        endDate: ""
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
        setAlertCount({
            count: 1
        });
    }, []);

    useEffect(() => {
        getEstatesForDropdoen();
        trackPromise(
            getEstatesForDropdoen(cashCustomerDetail.groupID)
        )
        setAlertCount({
            count: alertCount.count + 1
        });
    }, [cashCustomerDetail.groupID]);

    useEffect(() => {
        trackPromise(getDivisionByEstateID(cashCustomerDetail.estateID));
    }, [cashCustomerDetail.estateID]);

    useEffect(() => {
        trackPromise(getDivisionByEstateID());
    }, [cashCustomerDetail.divisionID]);

    useEffect(() => {
        setcashCustomerDetail({
            ...cashCustomerDetail,
            endDate: endDay
        })
    }, [cashCustomerDetail.startDate])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'VIEWCASHDAYPLUCKINGREPORT'
        );

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

        setcashCustomerDetail({
            ...cashCustomerDetail,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setcashCustomerDetail({
            ...cashCustomerDetail,
            [e.target.name]: value
        });
        setCashCustomerData([]);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstatesForDropdoen() {
        const estates = await services.getEstateDetailsByGroupID(cashCustomerDetail.groupID);
        setEstateList(estates);
    }

    async function getDivisionByEstateID() {
        var response = await services.getDivisionByEstateID(cashCustomerDetail.estateID);
        setDivision(response);
    };

    async function GetDetails() {
        setCashCustomerData([]);
        let model = {
            GroupID: parseInt(cashCustomerDetail.groupID) !== 0 ? parseInt(cashCustomerDetail.groupID) : null,
            EstateID: parseInt(cashCustomerDetail.estateID) !== 0 ? parseInt(cashCustomerDetail.estateID) : null,
            DivisionID: parseInt(cashCustomerDetail.divisionID) !== 0 ? parseInt(cashCustomerDetail.divisionID) : null,
            startDate: (cashCustomerDetail.startDate),
            endDate: (cashCustomerDetail.endDate),
        };
        getSelectedDropdownValuesForReport(model);

        const customerData = await services.GetGreenLeafCashDayPlucking(model);

        if (customerData.statusCode == 'Success' && customerData.data != null) {
            customerData.data.forEach(x => {
                let total = 0;
                x.greenLeafCashDetailModels.forEach(y => {
                    total += y.manDays;
                    x.totalAmount = total;
                })
            });

            setCashCustomerData(customerData.data)

        } else {
            alert.error('NO RECORDS TO DISPLAY');
        }
    }

    const date = [];
    cashCustomerData.forEach(row => {
        row.greenLeafCashDetailModels.forEach(item => {
            if (!date.includes((item.date).split('T')[0])) {
                date.push((item.date).split('T')[0]);
            }
        });
    });

    const specificMonth = cashCustomerDetail.startDate ? new Date(cashCustomerDetail.startDate) : new Date();
    const firstDay = specificMonth.toISOString().split('T')[0];
    const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
    const lastDay = lastDayOfMonth.toISOString().split('T')[0];
    const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];

    async function createDataForExcel(array) {
        var result = [];
        var dayTotals = {};
        var totalAmountSum = 0;

        if (array != null) {
            dayTotals['registrationNumber'] = 'Total'
            array.forEach(x => {
                x.greenLeafCashDetailModels.forEach(y => {
                    const day = moment(y.date).format('DD');
                    var duplicateDate = result.find(y => y.registrationNumber === x.registrationNumber);
                    if (duplicateDate) {
                        duplicateDate[day] = y.manDays;
                        duplicateDate.name = x.name;
                        duplicateDate.registrationNumber = x.registrationNumber;
                        duplicateDate.totalAmount = x.totalAmount;
                    }
                    else {
                        result.push({
                            [day]: y.manDays,
                            name: x.name,
                            registrationNumber: x.registrationNumber,
                            totalAmount: x.totalAmount
                        });
                    }
                    dayTotals[day] = (dayTotals[day] || 0) + y.manDays;
                    totalAmountSum += y.manDays;
                    dayTotals['totalAmount'] = totalAmountSum;
                })
            });
            result.push(dayTotals);
            result.push({});
            result.push({
                name: 'Estate : ' + selectedSearchValues.estateID,
                registrationNumber: 'Group : ' + selectedSearchValues.groupID
            });

            result.push({
                registrationNumber: 'Division : ' + selectedSearchValues.divisionID,
                name: "JobType: " + (selectedSearchValues.jobTypeID == 5 ? "Plucking CashKilo" : selectedSearchValues.jobTypeID == 7 ? "MachinePlucking CashKilo" : "All Jobs")
            });

            result.push({
                registrationNumber: 'Start Date : ' + selectedSearchValues.startDate,
                name: 'End Date : ' + selectedSearchValues.endDate
            });
        }
        return result;
    }

    async function createFile() {
        var file = await createDataForExcel(cashCustomerData);
        var settings = {
            sheetName: 'Cash Kilo Report',
            fileName: 'Cash Kilo Report  ' + ' - ' + selectedSearchValues.divisionID + '-' + selectedSearchValues.startDate + '/' + selectedSearchValues.endDate,
            writeOptions: {}
        }

        let keys = date
        let tempcsvHeaders = csvHeaders;
        tempcsvHeaders.push({ label: 'Employee No', value: 'registrationNumber' })
        tempcsvHeaders.push({ label: 'Employee Name', value: 'name' })
        keys.forEach((sitem, i) => {
            tempcsvHeaders.push({ label: ' ' + moment(sitem).format('MMMM DD'), value: moment(sitem).format('DD') })
        })
        tempcsvHeaders.push({ label: 'Total', value: 'totalAmount' })
        let dataA = [
            {
                sheet: 'Cash Kilo Report',
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

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            estateID: estateList[searchForm.EstateID],
            groupID: GroupList[searchForm.GroupID],
            divisionID: divitionList[searchForm.DivisionID],
            startDate: searchForm.startDate,
            endDate: searchForm.endDate,
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
                            groupID: cashCustomerDetail.groupID,
                            estateID: cashCustomerDetail.estateID,
                            divisionID: cashCustomerDetail.divisionID,
                        }}
                        validationSchema={Yup.object().shape({
                            groupID: Yup.number()
                                .required('Group required')
                                .min('1', 'Group required'),
                            estateID: Yup.number()
                                .required('Estate required')
                                .min('1', 'Factory required'),
                            divisionID: Yup.number()
                                .required('Division is required')
                                .min('1', 'Division is required'),
                        })}
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
                                                <Grid container spacing={4}>
                                                    <Grid item md={4} xs={12}>
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
                                                            value={cashCustomerDetail.groupID}
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
                                                    <Grid item md={4} xs={12}>
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
                                                            value={cashCustomerDetail.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
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
                                                            value={cashCustomerDetail.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divitionList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="startDate">
                                                            From Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="startDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={cashCustomerDetail.startDate}
                                                            variant="outlined"
                                                            id="startDate"
                                                            size='small'
                                                            disableFuture={true}
                                                            onKeyPress={(e) => {
                                                                if (e.key >= '0' && e.key <= '9') {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="endDate">
                                                            To Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="endDate"
                                                            type='date'
                                                            onChange={(e) => handleChange(e)}
                                                            value={cashCustomerDetail.endDate}
                                                            variant="outlined"
                                                            id="endDate"
                                                            size='small'
                                                            disableFuture={true}
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
                                                    <Grid item md={12} xs={12}>
                                                        <Grid container justify="flex-end">
                                                            <Box pt={2}>
                                                                <Button
                                                                    color="primary"
                                                                    variant="contained"
                                                                    type='submit'
                                                                    onClick={() => trackPromise(GetDetails())}
                                                                >
                                                                    Search
                                                                </Button>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <br></br>
                                                <br></br>
                                                <Box minWidth={1050} hidden={cashCustomerData.length === 0}>
                                                    <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                                        <Table size="small" aria-label="sticky table" Table stickyHeader>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell className={`${classes.stickyHeader, classes.stickyColumn}`} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                                                        Employee NO
                                                                    </TableCell>
                                                                    <TableCell className={`${classes.stickyHeader, classes.stickyColumn}`} style={{ left: 113, border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                                                        Employee Name
                                                                    </TableCell>
                                                                    {date.sort((a, b) => new Date(a) - new Date(b)).map((row, index) => (
                                                                        <TableCell key={index} className={`${classes.stickyHeader, classes.stickyColumn}`} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                                                                            {moment(row).format('MMMM DD')}
                                                                        </TableCell>
                                                                    ))}
                                                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">Total </TableCell>
                                                                </TableRow>
                                                            </TableHead>

                                                            <TableBody>
                                                                {cashCustomerData.map((row, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell className={`${classes.stickyColumn}`} style={{ border: "1px solid black", fontSize: "15px" }} align="left" component="th" scope="row">
                                                                            {row.registrationNumber}
                                                                        </TableCell>
                                                                        <TableCell className={`${classes.stickyColumn}`} style={{ left: 113, border: "1px solid black", fontSize: "15px" }} align="left" component="th" scope="row">
                                                                            {row.name}
                                                                        </TableCell>
                                                                        {date.map((rows, index) => {
                                                                            var found = row.greenLeafCashDetailModels.find(x => ((x.date).split('T')[0]) == rows);
                                                                            return (
                                                                                <TableCell key={index} style={{ border: "1px solid black" }} align="center">
                                                                                    {found === undefined ? '-' : found.manDays}
                                                                                </TableCell>
                                                                            );
                                                                        })}
                                                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold" }} align="left" component="th" scope="row">
                                                                            {row.totalAmount}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            <TableFooter>
                                                                <TableRow>
                                                                    <TableCell className={`${classes.stickyColumn}`} colSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                                                                        Total
                                                                    </TableCell>
                                                                    {date.map((day, index) => {
                                                                        const dayTotal = cashCustomerData.reduce((total, row) => {
                                                                            const found = row.greenLeafCashDetailModels.find(x => ((x.date).split('T')[0]) == day);
                                                                            return total + (found ? parseFloat(found.manDays) : 0);
                                                                        }, 0);

                                                                        return (
                                                                            <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center" key={index}>
                                                                                {dayTotal !== 0 ? dayTotal : '-'}
                                                                            </TableCell>
                                                                        );
                                                                    })}
                                                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="left">
                                                                        {cashCustomerData.reduce((total, row) => total + parseFloat(row.totalAmount), 0)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableFooter>
                                                        </Table>
                                                    </TableContainer>
                                                </Box>
                                            </CardContent>
                                            {cashCustomerData.length > 0 ? (
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
                                                        documentTitle={'Cash Kilo Report'}
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
                                                    <style>
                                                    </style>
                                                    {<div hidden={true}>
                                                        <CreatePDF
                                                            ref={componentRef}
                                                            selectedSearchValues={selectedSearchValues}
                                                            searchDate={cashCustomerDetail}
                                                            cashCustomerData={cashCustomerData}
                                                            total={totalAmount}
                                                            monthDays={date}
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
    )
}



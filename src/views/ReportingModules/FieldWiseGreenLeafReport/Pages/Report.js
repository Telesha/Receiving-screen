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

const screenCode = 'FIELDWISEGREENLEAFREPORT';

export default function FieldWiseGreenLeafReport(props) {
    const [title, setTitle] = useState('Field wise Green Leaf Report');
    const classes = useStyles();
    const [fieldWiseGreenLeafReportDetail, setFieldWiseGreenLeafReportDetail] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        jobTypeID: 0,
        fieldCode: 0,
        fieldName: '',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10)
    });
    const [estateList, setEstateList] = useState([]);
    const [GroupList, setGroupList] = useState([]);
    const [divitionList, setDivision] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
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
        jobTypeID: 0,
        fieldName: "",
        fieldCode: "0",
        startDate: "",
        endDate: ""
    });

    const componentRef = useRef();
    const [totalAmount, setTotalAmount] = useState(0);
    const alert = useAlert();
    const [alertCount, setAlertCount] = useState({
        count: 0
    });
    const [feilds, setFeilds] = useState();
    const [jobTypes, SetJobTypes] = useState(['Plucking, Machine & Cash Day Plucking', 'Plucking', 'Machine', 'Cash Day Plucking']);

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
            getEstatesForDropdoen(fieldWiseGreenLeafReportDetail.groupID)
        )
        setAlertCount({
            count: alertCount.count + 1
        });
    }, [fieldWiseGreenLeafReportDetail.groupID]);

    useEffect(() => {
        trackPromise(getDivisionByEstateID(fieldWiseGreenLeafReportDetail.estateID));
    }, [fieldWiseGreenLeafReportDetail.estateID]);

    useEffect(() => {
        trackPromise(getFeildsForDropdown(fieldWiseGreenLeafReportDetail.divisionID));
    }, [fieldWiseGreenLeafReportDetail.divisionID]);

    useEffect(() => {
        const currentDate = new Date();
        const previousMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
        );
        setSelectedDate(previousMonth);
    }, []);

    useEffect(() => {
        setFieldWiseGreenLeafReportDetail({
            ...fieldWiseGreenLeafReportDetail,
            endDate: endDay
        })
    }, [fieldWiseGreenLeafReportDetail.startDate])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'VIEWFIELDWISEGREENLEAFREPORT'
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

        setFieldWiseGreenLeafReportDetail({
            ...fieldWiseGreenLeafReportDetail,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setFieldWiseGreenLeafReportDetail({
            ...fieldWiseGreenLeafReportDetail,
            [e.target.name]: value
        });
        setCashCustomerData([]);
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstatesForDropdoen() {
        const estates = await services.getEstateDetailsByGroupID(fieldWiseGreenLeafReportDetail.groupID);
        setEstateList(estates);
    }

    async function getDivisionByEstateID() {
        var response = await services.getDivisionByEstateID(fieldWiseGreenLeafReportDetail.estateID);
        setDivision(response);
    };

    async function getFeildsForDropdown() {
        const feilds = await services.getAllFeilds(fieldWiseGreenLeafReportDetail.divisionID);
        setFeilds(feilds);
    }
    async function GetDetails() {
        setCashCustomerData([]);
        let model = {
            GroupID: parseInt(fieldWiseGreenLeafReportDetail.groupID) !== 0 ? parseInt(fieldWiseGreenLeafReportDetail.groupID) : null,
            EstateID: parseInt(fieldWiseGreenLeafReportDetail.estateID) !== 0 ? parseInt(fieldWiseGreenLeafReportDetail.estateID) : null,
            DivisionID: parseInt(fieldWiseGreenLeafReportDetail.divisionID) !== 0 ? parseInt(fieldWiseGreenLeafReportDetail.divisionID) : null,
            jobTypeID: parseInt(fieldWiseGreenLeafReportDetail.jobTypeID),
            fieldCode: parseInt(fieldWiseGreenLeafReportDetail.fieldCode) !== 0 ? parseInt(fieldWiseGreenLeafReportDetail.fieldCode) : 0,
            startDate: (fieldWiseGreenLeafReportDetail.startDate),
            endDate: (fieldWiseGreenLeafReportDetail.endDate),


        };
        getSelectedDropdownValuesForReport(model);

        const customerData = await services.GetFieldWiseGreenLeafReportDetails(model);

        if (customerData.statusCode == 'Success' && customerData.data.length != 0) {
            customerData.data.forEach(x => {
                let total = 0;
                x.details.forEach(y => {
                    total += y.amount;
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
        row.details.forEach(item => {
            if (!date.includes(item.date)) {
                date.push(item.date);
            }
        });
    });

    const specificMonth = fieldWiseGreenLeafReportDetail.startDate ? new Date(fieldWiseGreenLeafReportDetail.startDate) : new Date();
    const firstDay = specificMonth.toISOString().split('T')[0];
    const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
    const lastDay = lastDayOfMonth.toISOString().split('T')[0];
    const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];

    async function createDataForExcel(array) {
        var result = [];
        var dayTotals = {};
        var totalAmountSum = 0;

        if (array != null) {
            dayTotals['fieldName'] = 'Total';

            array.forEach(x => {
                var row = {
                    fieldName: x.fieldName,
                    totalAmount: x.totalAmount
                };

                x.details.forEach(y => {
                    const day = moment(y.date).format('DD');
                    if (row[day]) {
                        row[day] += y.amount;
                    } else {
                        row[day] = y.amount;
                    }
                    dayTotals[day] = (dayTotals[day] || 0) + y.amount;
                    totalAmountSum += y.amount;
                });

                result.push(row);
            });

            dayTotals['totalAmount'] = totalAmountSum;
            result.push(dayTotals);

            result.push({});

            result.push({
                fieldName: 'Estate : ' + selectedSearchValues.estateID
            });
            result.push({
                fieldName: 'Group : ' + selectedSearchValues.groupID
            });
            result.push({
                fieldName: 'Division : ' + selectedSearchValues.divisionID
            });
            result.push({
                fieldName: "JobType: " + (selectedSearchValues.jobTypeID == 1 ? "Plucking" : selectedSearchValues.jobTypeID == 2 ? "MachinePlucking " : selectedSearchValues.jobTypeID == 3 ? "Cash Day Plucking " : "All Jobs")
            });
            result.push({
                fieldName: 'Start Date : ' + selectedSearchValues.startDate
            });
            result.push({
                fieldName: 'End Date : ' + selectedSearchValues.endDate
            });
        }

        return result;
    }


    async function createFile() {
        var file = await createDataForExcel(cashCustomerData);
        var settings = {
            sheetName: 'Field wise Green Leaf Report',
            fileName: 'Field wise Green Leaf Report ' + ' - ' + selectedSearchValues.startDate + '/' + selectedSearchValues.endDate,
            writeOptions: {}
        }

        let keys = date
        let tempcsvHeaders = csvHeaders;
        tempcsvHeaders.push({ label: 'Feild', value: 'fieldName' })
        keys.forEach((sitem, i) => {
            tempcsvHeaders.push({ label: '' + moment(sitem).format('MMMM DD'), value: moment(sitem).format('DD') })
        })
        tempcsvHeaders.push({ label: 'Total', value: 'totalAmount' })
        let dataA = [
            {
                sheet: 'Field wise Green Leaf Report',
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
            jobTypeID: searchForm.jobTypeID,
            feildName: divitionList[searchForm.feildName],
            startDate: searchForm.startDate,
            endDate: searchForm.endDate,
            jobTypeName: jobTypes[searchForm.jobTypeID]
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
                            groupID: fieldWiseGreenLeafReportDetail.groupID,
                            estateID: fieldWiseGreenLeafReportDetail.estateID,
                            divisionID: fieldWiseGreenLeafReportDetail.divisionID,
                            fieldCode: fieldWiseGreenLeafReportDetail.fieldCode,
                            jobTypeID: fieldWiseGreenLeafReportDetail.jobTypeID
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
                                                            value={fieldWiseGreenLeafReportDetail.groupID}
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
                                                            value={fieldWiseGreenLeafReportDetail.estateID}
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
                                                            value={fieldWiseGreenLeafReportDetail.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            size="small"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divitionList)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="jobTypeID">
                                                            Job Type
                                                        </InputLabel>
                                                        <TextField
                                                            select
                                                            error={Boolean(
                                                                touched.jobTypeID && errors.jobTypeID
                                                            )}
                                                            fullWidth
                                                            helperText={touched.jobTypeID && errors.jobTypeID}
                                                            name="jobTypeID"
                                                            onBlur={handleBlur}
                                                            size="small"
                                                            onChange={e => {
                                                                handleChange(e);
                                                            }}
                                                            value={fieldWiseGreenLeafReportDetail.jobTypeID || 0}
                                                            variant="outlined"
                                                            id="jobTypeID"
                                                        >
                                                            <MenuItem value={'0'}>All Jobs</MenuItem>
                                                            <MenuItem value={'1'}>Plucking</MenuItem>
                                                            <MenuItem value={'2'}>Machine Plucking </MenuItem>
                                                            <MenuItem value={'3'}>Cash Day Plucking </MenuItem>
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="fieldCode">
                                                            Feild
                                                        </InputLabel>
                                                        <TextField
                                                            select
                                                            fullWidth
                                                            error={Boolean(
                                                                touched.fieldCode && errors.fieldCode
                                                            )}
                                                            helperText={touched.fieldCode && errors.fieldCode}
                                                            name="fieldCode"
                                                            onChange={(e) => handleChange(e)}
                                                            value={fieldWiseGreenLeafReportDetail.fieldCode}
                                                            variant="outlined"
                                                            id="fieldCode"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Feild--</MenuItem>
                                                            {generateDropDownMenu(feilds)}
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
                                                            value={fieldWiseGreenLeafReportDetail.startDate}
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
                                                            value={fieldWiseGreenLeafReportDetail.endDate}
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
                                                <Box minWidth={1050}
                                                    hidden={cashCustomerData.length === 0}
                                                >
                                                    <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                                        <Table size="small" aria-label="sticky table" Table stickyHeader>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell className={`${classes.stickyHeader, classes.stickyColumn}`} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                                                        Feild
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
                                                                            {row.fieldName}
                                                                        </TableCell>
                                                                        {date.sort((a, b) => new Date(a) - new Date(b)).map((rows, index) => {
                                                                            var foundRecords = row.details.filter(x => x.date === rows);
                                                                            var totalAmount = foundRecords.reduce((total, record) => total + (record.amount || 0), 0);

                                                                            return (
                                                                                <TableCell key={index} style={{ border: "1px solid black" }} align="center">
                                                                                    {foundRecords.length === 0 ? '-' : totalAmount}
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
                                                                    <TableCell className={`${classes.stickyColumn}`} colSpan={1} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                                                                        Total
                                                                    </TableCell>
                                                                    {date.map((day, index) => {
                                                                        const dayTotal = cashCustomerData.reduce((total, row) => {
                                                                            const found = row.details.find(x => ((x.date).split('T')[0]) == day);
                                                                            return total + (found ? parseFloat(found.amount) : 0);
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
                                                        documentTitle={'Field wise Green Leaf Report'}
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
                                                        {`
                            @page {
                              size: A4 landscape; /* Set the size and orientation here */
                              margin: 20mm; /* Adjust the margin as needed */
                            }
                          `}
                                                    </style>
                                                    {<div hidden={true}>
                                                        <CreatePDF
                                                            ref={componentRef}
                                                            selectedSearchValues={selectedSearchValues}
                                                            searchDate={fieldWiseGreenLeafReportDetail}
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
    );
}
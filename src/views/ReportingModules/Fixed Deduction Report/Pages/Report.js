import React, { useState, useEffect, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    makeStyles,
    Container,
    CardHeader,
    Button,
    CardContent,
    Divider,
    MenuItem,
    Grid,
    InputLabel,
    TextField,
    TableRow,
    TableCell,
    TableContainer,
    Table,
    TableBody,
    TableHead
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAlert } from 'react-alert';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import xlsx from 'json-as-xlsx';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
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

const screenCode = 'FIXEDDEDUCTIONREPORT';

export default function FixedDeductionReport(props) {
    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);
    const [title, setTitle] = useState("Fixed Deduction Report");
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [deductionTypes, setDeductionTypes] = useState([]);
    const [isShowTable, setIsShowTable] = useState(false);
    const [isTableHide, setIsTableHide] = useState(false);
    const [fixedDeductionData, setFixedDeductionData] = useState({});
    const [fixedDeductionDetails, setFixedDeductionDetails] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        deductionType: 0,
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10)
    });
    const [selectedSearchReportValues, setSelectedSearchReportValues] = useState({
        groupName: '',
        estateName: '',
        divisionName: '',
        deductionType: '',
        startDate: "",
        endDate: ""
    });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };
    const [totalValues, setTotalValues] = useState({});
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const componentRef = useRef();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions(), getDeductionTypes());
    }, []);

    useEffect(() => {
        if (fixedDeductionDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        }
    }, [fixedDeductionDetails.groupID]);

    useEffect(() => {
        if (fixedDeductionDetails.estateID > 0) {
            trackPromise(getDivisionDetailsByEstateID());
        }
    }, [fixedDeductionDetails.estateID]);

    useEffect(() => {
        setIsTableHide(false);
    }, [fixedDeductionDetails.divisionID, fixedDeductionDetails.deductionType, fixedDeductionDetails.month, fixedDeductionDetails.year]);

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
        setFixedDeductionDetails({
            ...fixedDeductionDetails,
            deductionType: '0',
            selectedDate: new Date()
        })
    }, [fixedDeductionDetails.divisionID]);

    useEffect(() => {
        setFixedDeductionDetails({
            ...fixedDeductionDetails,
            selectedDate: new Date()
        })
    }, [fixedDeductionDetails.deductionType]);

    useEffect(() => {
        setFixedDeductionDetails({
            ...fixedDeductionDetails,
            endDate: endDay
        })
    }, [fixedDeductionDetails.startDate])

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find((p) => p.permissionCode == 'VIEWFIXEDDEDUCTIONREPORT');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find((p) => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find((p) => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        });

        setFixedDeductionDetails({
            ...fixedDeductionDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken()),
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getDeductionTypes() {
        var response = await services.getDeductionTypes();
        setDeductionTypes(response);
    }

    function generateDropDownMenu(data) {
        let items = [];
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items;
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setFixedDeductionDetails({
            ...fixedDeductionDetails,
            [e.target.name]: value,
        });
        setIsShowTable(false);
    }

    async function getData() {
        let model = {
            groupID: parseInt(fixedDeductionDetails.groupID),
            estateID: parseInt(fixedDeductionDetails.estateID),
            divisionID: parseInt(fixedDeductionDetails.divisionID),
            deductionType: parseInt(fixedDeductionDetails.deductionType),
            startDate: (fixedDeductionDetails.startDate),
            endDate: (fixedDeductionDetails.endDate),
        };
        getSelectedDropdownValuesForReport(model);
        let response = await services.GetFixedDeductionReportDetails(model);
        if (response.statusCode === 'Success' && response.data.length !== 0) {
            setFixedDeductionData(response.data);
            setIsTableHide(true);
        } else {
            alert.error('No records to display');
        }

        let amountTotal = 0;
        response.data.forEach((x) => {
            amountTotal += x.fixedDeductionAmount
        })
        setTotalValues({
            amountTotal: amountTotal.toFixed(2)
        })
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(fixedDeductionDetails.groupID);
        setEstates(response);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(fixedDeductionDetails.estateID);
        setDivisions(response);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchReportValues({
            ...selectedSearchReportValues,
            groupName: groups[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            divisionName: divisions[searchForm.divisionID],
            deductionType: deductionTypes[searchForm.deductionType],
            startDate: searchForm.startDate,
            endDate: searchForm.endDate
        });

    }

    const specificMonth = fixedDeductionDetails.startDate ? new Date(fixedDeductionDetails.startDate) : new Date();
    const firstDay = specificMonth.toISOString().split('T')[0];
    const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
    const lastDay = lastDayOfMonth.toISOString().split('T')[0];
    const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        )
    }

    async function createDataForExcel(array) {
        var res = [];
        if (array != null) {
            array.map(x => {
                var vr = {
                    'Employee No': x.registrationNumber,
                    'Emplpoyee Name': x.employeeName,
                    'Deduction Type': x.fixedDeductionTypeName == "Union" ? x.fixedDeductionTypeName + ' - ' + x.unionName : x.fixedDeductionTypeName,
                    'Amount': x.fixedDeductionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                }
                res.push(vr);
            });
            res.push({});
            var vr = {
                'Employee No': 'Total Amount :',
                'Amount': totalValues.amountTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }
            res.push(vr);

            res.push({});
            var vr = {
                'Employee No': 'Group : ' + selectedSearchReportValues.groupName,
                'Emplpoyee Name': 'Estate : ' + selectedSearchReportValues.estateName,
                'Deduction Type': 'Division : ' + selectedSearchReportValues.divisionName,
                'Amount': 'Deduction : ' + (selectedSearchReportValues.deductionType !== undefined ? selectedSearchReportValues.deductionType : 'All'),
            };
            res.push(vr);
            var vr = {
                'Employee No': 'Start Date : ' + selectedSearchReportValues.startDate,
                'Emplpoyee Name': 'End Date : ' + selectedSearchReportValues.endDate,
            }
            res.push(vr);
        }

        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(fixedDeductionData);
        var settings = {
            sheetName: 'Fixed Deduction Report',
            fileName: 'Fixed Deduction Report ' + selectedSearchReportValues.startDate + '/' + selectedSearchReportValues.endDate,
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Fixed Deduction Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    function clearFields() {
        setFixedDeductionDetails({
            ...fixedDeductionDetails,
            divisionID: 0,
            deductionType: 0
        });
        setFixedDeductionData([]);
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: fixedDeductionDetails.groupID,
                        estateID: fixedDeductionDetails.estateID,
                        divisionID: fixedDeductionDetails.divisionID,
                        deductionType: fixedDeductionDetails.deductionType
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Group required').min('1', 'Group is required'),
                            estateID: Yup.number().required('Factory required').min('1', 'Factory is required'),
                            divisionID: Yup.number().required('Division is required').min('1', 'Division is required')
                        })
                    }
                    onSubmit={() => trackPromise(getData())}
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
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Group *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        helperText={touched.groupID && errors.groupID}
                                                        fullWidth
                                                        name="groupID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={fixedDeductionDetails.groupID}
                                                        variant="outlined"
                                                        size="small"
                                                        onBlur={handleBlur}
                                                        InputProps={{
                                                            readOnly: !permissionList.isGroupFilterEnabled,
                                                        }}
                                                    >
                                                        <MenuItem value="0">--Select Group--</MenuItem>
                                                        {generateDropDownMenu(groups)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="estateID">
                                                        Estate *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.estateID && errors.estateID)}
                                                        fullWidth
                                                        helperText={touched.estateID && errors.estateID}
                                                        name="estateID"
                                                        placeholder='--Select Estate--'
                                                        onBlur={handleBlur}
                                                        size='small'
                                                        onChange={(e) => {
                                                            handleChange(e)
                                                        }}
                                                        value={fixedDeductionDetails.estateID}
                                                        variant="outlined"
                                                        id="estateID"
                                                        InputProps={{
                                                            readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                        }}
                                                    >
                                                        <MenuItem value={0}>--Select Estate--</MenuItem>
                                                        {generateDropDownMenu(estates)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="divisionID">
                                                        Division *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.divisionID && errors.divisionID)}
                                                        helperText={touched.divisionID && errors.divisionID}
                                                        fullWidth
                                                        name="divisionID"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={fixedDeductionDetails.divisionID}
                                                        variant="outlined"
                                                    >
                                                        <MenuItem value="0">--Select Division--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="deductionType">
                                                        Deduction Type
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.deductionType && errors.deductionType)}
                                                        helperText={touched.deductionType && errors.deductionType}
                                                        fullWidth
                                                        name="deductionType"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={fixedDeductionDetails.deductionType}
                                                        variant="outlined"
                                                    >
                                                        <MenuItem value="0">--Select Deduction Type--</MenuItem>
                                                        {generateDropDownMenu(deductionTypes)}
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
                                                        value={fixedDeductionDetails.startDate}
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
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="endDate">
                                                        To Date *
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        name="endDate"
                                                        type='date'
                                                        onChange={(e) => handleChange(e)}
                                                        value={fixedDeductionDetails.endDate}
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
                                                <Grid item md={12} xs={12}>
                                                    <Grid container justify="flex-end">
                                                        <Box pr={3}>
                                                            <Button
                                                                color="primary"
                                                                variant="outlined"
                                                                type="submit"
                                                                onClick={clearFields}
                                                            >
                                                                Clear
                                                            </Button>
                                                        </Box>
                                                        <Box pr={2}>
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                type="submit"
                                                            >
                                                                Search
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <br />
                                            <Box minWidth={1050}>
                                                {fixedDeductionData.length > 0 && isTableHide ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow style={{ border: "2px solid black" }}>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black" }}>Employee No</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black" }}>Name</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black" }}>Deduction Type</TableCell>
                                                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black" }}>Amount (Rs.)</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {fixedDeductionData.slice(page * limit, page * limit + limit).map((row, i) => (
                                                                    <TableRow style={{ border: "2px solid black" }} key={i}>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.registrationNumber}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.employeeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.fixedDeductionTypeName == "Union" ? row.fixedDeductionTypeName + ' - ' + row.unionName : row.fixedDeductionTypeName}</TableCell>
                                                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.fixedDeductionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            <TableRow style={{ border: "2px solid black" }}>
                                                                <TableCell colSpan={3} align={'left'} style={{ borderBottom: "none", border: "2px solid black" }} ><b><strong>Total</strong></b></TableCell>
                                                                <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "2px solid black" }}>
                                                                    {totalValues && totalValues.amountTotal !== undefined
                                                                        ? `Rs. ${Number(totalValues.amountTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                                        : 'N/A'
                                                                    }
                                                                </TableCell>
                                                            </TableRow>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={fixedDeductionData.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                    </TableContainer>
                                                    : null}
                                            </Box>
                                        </CardContent>
                                        {fixedDeductionData.length > 0 && isTableHide ?
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    id="btnRecord"
                                                    type="submit"
                                                    variant="contained"
                                                    style={{ marginRight: '1rem' }}
                                                    className={classes.colorRecord}
                                                    onClick={createFile}
                                                    size='small'
                                                >
                                                    EXCEL
                                                </Button>
                                                <ReactToPrint
                                                    documentTitle={"Fixed Deduction Report"}
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
                                                    <CreatePDF ref={componentRef}
                                                        selectedSearchValues={selectedSearchReportValues} fixedDeductionData={fixedDeductionData}
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
    )
}
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
import { createMuiTheme } from '@material-ui/core/styles';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import xlsx from 'json-as-xlsx';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';


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

const theme = createMuiTheme({
    overrides: {
        MuiTableCell: {
            root: {
                border: '2px solid black',
                borderBottom: '2px solid black',
            },
        },
        typography: {
            h2: {
                fontSize: '1.5rem',
            },
        },
        MuiTableRow: {
            root: {
                '&:nth-of-type(odd)': {
                    backgroundColor: 'white',
                },
                '&:last-child': {
                    '& .MuiTableCell-root': {
                        borderBottom: '2px solid black',
                    },
                },
            },
        },
        MuiTablePagination: {
            root: {
                border: 'none',
            },
        },
    },
});

const screenCode = 'UNIONDEDUCTIONREPORT';

export default function UnionDeductionReport(props) {
    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);
    const [title, setTitle] = useState("Union Deduction Report");
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [isShowTable, setIsShowTable] = useState(false);
    const [isTableHide, setIsTableHide] = useState(false);
    const [checkRollDeductionViewData, setCheckRollDeductionViewData] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [checkRollDeductionViewDetails, setCheckRollDeductionViewDetails] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    });
    const [selectedSearchReportValues, setSelectedSearchReportValues] = useState({
        groupName: '',
        estateName: '',
        divisionName: '',
        monthName: "",
        year: ""
    });
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [csvHeaders, SetCsvHeaders] = useState([]);
    const componentRef = useRef();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        if (checkRollDeductionViewDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        }
    }, [checkRollDeductionViewDetails.groupID]);

    useEffect(() => {
        if (checkRollDeductionViewDetails.estateID > 0) {
            trackPromise(getDivisionDetailsByEstateID());
        }
    }, [checkRollDeductionViewDetails.estateID]);

    useEffect(() => {
        setIsTableHide(false);
        setCheckRollDeductionViewData([])
    }, [checkRollDeductionViewDetails]);

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
        setCheckRollDeductionViewDetails({
            ...checkRollDeductionViewDetails,
            selectedDate: new Date()
        })
    }, [checkRollDeductionViewDetails.divisionID]);

    useEffect(() => {
        setDate()
    }, []);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find((p) => p.permissionCode == 'VIEWUNIONDEDUCTIONREPORT');

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

        setCheckRollDeductionViewDetails({
            ...checkRollDeductionViewDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken()),
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(checkRollDeductionViewDetails.groupID);
        setEstates(response);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(checkRollDeductionViewDetails.estateID);
        setDivisions(response);
    }

    async function getData() {
        let model = {
            groupID: parseInt(checkRollDeductionViewDetails.groupID),
            estateID: parseInt(checkRollDeductionViewDetails.estateID),
            divisionID: parseInt(checkRollDeductionViewDetails.divisionID),
            month: (checkRollDeductionViewDetails.month),
            year: (checkRollDeductionViewDetails.year),
        };
        getSelectedDropdownValuesForReport(model);
        let response = await services.getCheckRollDeductionReportDetail(model);
        if (response.statusCode === 'Success' && response.data.length !== 0) {
            let totalAmount = 0;
            response.data.forEach(x => {
                x.details.forEach(y => {
                    y.detailsx.forEach(z => {
                        totalAmount += parseFloat(z.amount)
                    })
                })
            });
            setCheckRollDeductionViewData(response.data);
            setTotalAmount(totalAmount);
            setIsTableHide(true);
        } else {
            alert.error('No records to display');
        }
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
        setCheckRollDeductionViewDetails({
            ...checkRollDeductionViewDetails,
            [e.target.name]: value,
        });
        setIsShowTable(false);
    }

    function setDate() {
        let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var month = (checkRollDeductionViewDetails.month);
        let monthName = monthNames[month - 1];

        setSelectedSearchReportValues({
            ...selectedSearchReportValues,
            monthName: monthName
        });
    }

    function handleDateChange(date) {
        var month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        var year = date.getUTCFullYear();

        setCheckRollDeductionViewDetails({
            ...checkRollDeductionViewDetails,
            month: month.toString(),
            year: year.toString()
        });
        setSelectedDate(date);
        setCheckRollDeductionViewData([]);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchReportValues({
            ...selectedSearchReportValues,
            groupName: groups[searchForm.groupID],
            estateName: estates[searchForm.estateID],
            divisionName: divisions[searchForm.divisionID],
            year: searchForm.year
        });
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

    async function createDataForExcel() {
        var res = [];
        checkRollDeductionViewData.forEach(group => {
            group.details.forEach(grp => {
                grp.detailsx.forEach(detail => {
                    var vr = {
                        'Division': (grp.detailsx.indexOf(detail) === 0) ? group.divisionName : '',
                        'Union': (grp.detailsx.indexOf(detail) === 0) ? grp.unionName : '',
                        'Month': detail.month,
                        'Total': parseFloat(detail.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    };
                    res.push(vr);
                });
            });
        });
        res.push({
            'Division': 'Total',
            'Union': '',
            'Month': '',
            'Total': totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        });
        res.push({
            'Division': "Group: " + selectedSearchReportValues.groupName,
            'Union': "Estate: " + selectedSearchReportValues.estateName,
            'Month': selectedSearchReportValues.divisionName == undefined ? "Division: All Divisions" : "Division: " + selectedSearchReportValues.divisionName,
            'Total': "Date: " + selectedSearchReportValues.monthName + '/' + selectedSearchReportValues.year
        });
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(checkRollDeductionViewData);
        var settings = {
            sheetName: 'Union Deduction Report',
            fileName: 'Union Deduction Report ' + selectedSearchReportValues.monthName + '/' + selectedSearchReportValues.year,
            writeOptions: {}
        }
        let keys = Object.keys(file[0])
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })
        let dataA = [
            {
                sheet: 'Union Deduction Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]
        xlsx(dataA, settings);
    }

    async function clearFields() {
        setCheckRollDeductionViewDetails({
            ...checkRollDeductionViewDetails,
            divisionID: 0,
            year: new Date().getUTCFullYear().toString(),
            month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
        });
        setSelectedDate(new Date())
        setCheckRollDeductionViewData([]);
        setIsTableHide(false);
    }

    return (
        <Page className={classes.root} title={title}>
            <LoadingComponent />
            <Container maxWidth={false}>
                <Formik
                    initialValues={{
                        groupID: checkRollDeductionViewDetails.groupID,
                        estateID: checkRollDeductionViewDetails.estateID,
                        divisionID: checkRollDeductionViewDetails.divisionID
                    }}
                    validationSchema={
                        Yup.object().shape({
                            groupID: Yup.number().required('Group required').min('1', 'Group is required'),
                            estateID: Yup.number().required('Factory required').min('1', 'Factory is required')
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
                                                        Group  *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        helperText={touched.groupID && errors.groupID}
                                                        fullWidth
                                                        name="groupID"
                                                        onChange={(e) => handleChange(e)}
                                                        value={checkRollDeductionViewDetails.groupID}
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
                                                        value={checkRollDeductionViewDetails.estateID}
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
                                                        Division
                                                    </InputLabel>
                                                    <TextField select
                                                        fullWidth
                                                        name="divisionID"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChange(e)}
                                                        value={checkRollDeductionViewDetails.divisionID}
                                                        variant="outlined"
                                                    >
                                                        <MenuItem value="0">--All Divisions--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <DatePicker
                                                            autoOk
                                                            variant="inline"
                                                            openTo="month"
                                                            views={["year", "month"]}
                                                            label="Year and Month *"
                                                            helperText="Select applicable month"
                                                            value={selectedDate}
                                                            onChange={(date) => handleDateChange(date)}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                                <Grid item md={12} xs={12}>
                                                    <Grid container justify="flex-end">
                                                        <Box pr={3}>
                                                            <Button
                                                                color="primary"
                                                                variant="outlined"
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
                                                {checkRollDeductionViewData.length > 0 && isTableHide ?
                                                    <TableContainer component={Paper}>
                                                        <Table className={classes.table} aria-label="simple table" size='small'>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}> Division </TableCell>
                                                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}> Union </TableCell>
                                                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}> Month </TableCell>
                                                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}> Total </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {checkRollDeductionViewData.map((group, i) => {
                                                                    return (
                                                                        <React.Fragment key={i}>
                                                                            {group.details.map((grp, j) => {
                                                                                return (
                                                                                    <React.Fragment key={`${i}-${j}`}>
                                                                                        {grp.detailsx.map((detail, k) => {
                                                                                            return (
                                                                                                <TableRow key={`${i}-${j}-${k}`}>
                                                                                                    {j === 0 && k === 0 && (
                                                                                                        <TableCell rowSpan={group.details.reduce((acc, val) => acc + val.detailsx.length, 0)} component="th" scope="row" align="left" style={{ border: "1px solid black", fontWeight: 'bolder' }}>{group.divisionName}</TableCell>
                                                                                                    )}
                                                                                                    {k === 0 && (
                                                                                                        <TableCell rowSpan={grp.detailsx.length} align="left" style={{ border: "1px solid black", fontWeight: 'bolder' }}>{grp.unionName}</TableCell>
                                                                                                    )}
                                                                                                    <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}>{detail.month}</TableCell>
                                                                                                    <TableCell align={'right'} style={{ border: "1px solid black" }}>{parseFloat(detail.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                                                </TableRow>
                                                                                            );
                                                                                        })}
                                                                                    </React.Fragment>
                                                                                );
                                                                            })}
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                                <TableRow>
                                                                    <TableCell colSpan={3} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>Total</TableCell>
                                                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                        <TablePagination
                                                            component="div"
                                                            count={checkRollDeductionViewData.length}
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
                                        {checkRollDeductionViewData.length > 0 && isTableHide ?
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
                                                    documentTitle={"Union Deduction Report"}
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
                                                        selectedSearchValues={selectedSearchReportValues} checkRollDeductionViewData={checkRollDeductionViewData}
                                                        totalAmount={totalAmount} />
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
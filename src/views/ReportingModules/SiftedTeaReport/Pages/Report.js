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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Service';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from 'react-alert';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    colorCancel: {
        backgroundColor: 'red'
    },
    colorRecord: {
        backgroundColor: 'green'
    }
}));

const screenCode = 'SIFTEDTEAREPORT';

export default function SiftedTeaReport() {
    const [title, setTitle] = useState('Sifted Tea Report');
    const agriGenERPEnum = new AgriGenERPEnum();
    const classes = useStyles();
    const [GroupList, setGroupList] = useState([]);
    const [FactoryList, setFactoryList] = useState([]);
    const [selectedDate, handleDateChange] = useState(new Date());
    const [siftedTea, setSiftedTea] = useState({
        groupID: 0,
        factoryID: 0,
    });
    const [monthlySum, setMonthlySum] = useState({});
    const [filteredDetails, setFilteredDetails] = useState([]);
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: '0',
        factoryName: '0',
        date: ''
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const navigate = useNavigate();
    const alert = useAlert();
    const componentRef = useRef();
    const [csvHeaders, SetCsvHeaders] = useState([]);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        trackPromise(getPermission());
        trackPromise(getGroupsForDropdown());
    }, []);

    useEffect(() => {
        if (siftedTea.groupID > 0) {
            trackPromise(getFactoriesForDropdown());
        }
    }, [siftedTea.groupID]);

    useEffect(() => {
        GetSiftedTeaDetails();
    }, []);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(
            p => p.permissionCode == 'SIFTEDTEAREPORT'
        );

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(
            p => p.permissionCode == 'GROUPDROPDOWN'
        );
        var isFactoryFilterEnabled = permissions.find(
            p => p.permissionCode == 'FACTORYDROPDOWN'
        );

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setSiftedTea({
            ...siftedTea,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getFactoryByGroupID(
            siftedTea.groupID
        );
        setFactoryList(factories);
    }

    async function GetSiftedTeaDetails() {
        const response = await services.GetSiftedTeaReportDetail(siftedTea.factoryID, selectedDate);
        if (response.statusCode == "Success" && response.data != null) {
            filterArray(response.data);
            if (response.data.length == 0) {
                alert.error('No records to display');
            }
        }
        let searchValues = {
            groupID: siftedTea.groupID,
            factoryID: siftedTea.factoryID,
            date: selectedDate.toISOString().split('T')[0]
        }
        getSelectedDropdownValuesForReport(searchValues);
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: GroupList[searchForm.groupID],
            factoryName: FactoryList[searchForm.factoryID],
            date: moment(searchForm.date).format('YYYY - MMMM')
        });
    }

    const filterArray = (data) => {
        const newArray = [];
        data.forEach((x) => {
            let pekoe = 0;
            let fbop = 0;
            let bopfF = 0;
            let bp = 0;
            let op = 0;
            let opa = 0;
            x.value.forEach((item) => {
                item.gradeTypeID === agriGenERPEnum.GradingTypeID.Pekoe
                    ? pekoe = item.totalGradingWeight
                    :
                    item.gradeTypeID === agriGenERPEnum.GradingTypeID.FBOP
                        ? fbop = item.totalGradingWeight
                        :
                        item.gradeTypeID === agriGenERPEnum.GradingTypeID.BOPF
                            ? bopfF = item.totalGradingWeight
                            :
                            item.gradeTypeID === agriGenERPEnum.GradingTypeID.BP
                                ? bp = item.totalGradingWeight
                                :
                                item.gradeTypeID === agriGenERPEnum.GradingTypeID.OP
                                    ? op = item.totalGradingWeight
                                    :
                                    item.gradeTypeID === agriGenERPEnum.GradingTypeID.OPA
                                        ? opa = item.totalGradingWeight
                                        : opa = "-";
            });
            newArray.push({
                ...newArray,
                Date: x.key,
                Pekoe: pekoe > 0 ? pekoe : '-',
                FBOP: fbop > 0 ? fbop : '-',
                BOPF: bopfF > 0 ? bopfF : '-',
                BP: bp > 0 ? bp : '-',
                OP: op > 0 ? op : '-',
                OPA: opa > 0 ? opa : '-',
                MainGradeTot: pekoe ? pekoe : 0 + fbop ? fbop : 0 + bopfF ? bopfF : 0,
                OffGradeTot: bp ? bp : 0 + op ? op : 0 + opa ? opa : 0
            });
        });
        setFilteredDetails(newArray);
        calculateMonthlySum(newArray);
    };

    const calculateMonthlySum = (newArray) => {
        let pekoe = 0;
        let fbop = 0;
        let bopfF = 0;
        let bp = 0;
        let op = 0;
        let opa = 0;

        newArray.forEach((x) => {
            x.Pekoe > 0 ? pekoe += x.Pekoe : pekoe += 0;
            x.FBOP > 0 ? fbop += x.FBOP : fbop += 0;
            x.BOPF > 0 ? bopfF += x.BOPF : bopfF += 0;
            x.BP > 0 ? bp += x.BP : bp += 0;
            x.OP > 0 ? op += x.OP : op += 0;
            x.OPA > 0 ? opa += x.OPA : opa += 0;
        })
        setMonthlySum({
            pekoeSum: pekoe > 0 ? pekoe : '-',
            fbopSum: fbop > 0 ? fbop : '-',
            bopffSum: bopfF > 0 ? bopfF : '-',
            bpSum: bp > 0 ? bp : '-',
            opSum: op > 0 ? op : '-',
            opaSum: opa > 0 ? opa : '-',
            mainGradeSum: (pekoe > 0 ? pekoe : 0) + (fbop > 0 ? fbop : 0) + (bopfF > 0 ? bopfF : 0),
            offGradeSum: (bp > 0 ? bp : 0) + (op > 0 ? op : 0) + (opa > 0 ? opa : 0)
        })
    }

    async function createDataForExcel(array) {
        var res = [];
        var searchData = {
            'Date': selectedSearchValues.groupName,
            'Pekoe': '   -   ',
            'FBOP': selectedSearchValues.factoryName,
            'BOPF': '   -   ',
            'BP': selectedSearchValues.date,
            'OP': '       ',
            'OPA': '       ',
        }

        var totals = {
            'Date': 'Total',
            'Pekoe': 0,
            'FBOP': 0,
            'BOPF': 0,
            'BP': 0,
            'OP': 0,
            'OPA': 0,
            'Main Grade Total': 0,
            'Off Grade Total': 0,
        };

        if (array != null) {
            array.map(data => {
                var excelData = {
                    'Date': data.Date,
                    'Pekoe': data.Pekoe,
                    'FBOP': data.FBOP,
                    'BOPF': data.BOPF,
                    'BP': data.BP,
                    'OP': data.OP,
                    'OPA': data.OPA,
                    'Main Grade Total': data.MainGradeTot,
                    'Off Grade Total': data.OffGradeTot,
                };
                data.Pekoe > 0 ? totals.Pekoe += data.Pekoe : totals.Pekoe += 0;
                data.FBOP > 0 ? totals.FBOP += data.FBOP : totals.FBOP += 0;
                data.BOPF > 0 ? totals.BOPF += data.BOPF : totals.BOPF += 0;
                data.BP > 0 ? totals.BP += data.BP : totals.BP += 0;
                data.OP > 0 ? totals.OP += data.OP : totals.OP += 0;
                data.OPA > 0 ? totals.OPA += data.OPA : totals.OPA += 0;
                data.MainGradeTot > 0 ? totals['Main Grade Total'] += data.MainGradeTot : totals['Main Grade Total'] += 0;
                data.OffGradeTot > 0 ? totals['Off Grade Total'] += data.OffGradeTot : totals['Off Grade Total'] += 0;

                res.push(excelData);
            });
            res.push({});
            res.push(totals);
            res.push({}, {});
            res.push(searchData);
        }
        return res;
    }

    async function createFile() {
        var file = await createDataForExcel(filteredDetails);
        var settings = {
            sheetName: 'Sifted Tea Report',
            fileName:
                'Sifted Tea Report' +
                ' - ' +
                selectedSearchValues.groupName +
                ' - ' +
                selectedSearchValues.factoryName,
            writeOptions: {}
        };

        let tempcsvHeaders = csvHeaders;
        let keys = Object.keys(file[0]);
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem });
        });

        let dataA = [
            {
                sheet: 'Sifted Tea Report',
                columns: tempcsvHeaders,
                content: file
            }
        ];
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value;
        setSiftedTea({
            ...siftedTea,
            [e.target.name]: value
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
                            groupID: siftedTea.groupID,
                            factoryID: siftedTea.factoryID
                        }}
                        validationSchema={Yup.object().shape({
                            groupID: Yup.number()
                                .required('Group is required')
                                .min('1', 'Group is required'),
                            factoryID: Yup.number()
                                .required('Factory is required')
                                .min('1', 'Factory is required')
                        })}
                        onSubmit={() => trackPromise(GetSiftedTeaDetails())}
                        enableReinitialize
                    >
                        {({ errors, handleBlur, handleSubmit, touched }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader title={cardTitle(title)} />
                                        <Divider />
                                        <CardContent>
                                            <Grid container spacing={3}>
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
                                                        value={siftedTea.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        disabled={!permissionList.isGroupFilterEnabled}
                                                        size='small'
                                                    >
                                                        <MenuItem value="0">--Select Group--</MenuItem>
                                                        {generateDropDownMenu(GroupList)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Factory *
                                                    </InputLabel>
                                                    <TextField
                                                        select
                                                        error={Boolean(
                                                            touched.factoryID && errors.factoryID
                                                        )}
                                                        fullWidth
                                                        size='small'
                                                        helperText={touched.factoryID && errors.factoryID}
                                                        name="factoryID"
                                                        onBlur={handleBlur}
                                                        onChange={e => handleChange(e)}
                                                        value={siftedTea.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        disabled={!permissionList.isFactoryFilterEnabled}
                                                    >
                                                        <MenuItem value="0">--Select Factory--</MenuItem>
                                                        {generateDropDownMenu(FactoryList)}
                                                    </TextField>
                                                </Grid>

                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink>Date *</InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <DatePicker
                                                            views={['year', 'month']}
                                                            variant="outlined"
                                                            maxDate={new Date()}
                                                            value={selectedDate}
                                                            onChange={(newValue) => {
                                                                handleDateChange(newValue);
                                                            }}
                                                            renderInput={(params) => <TextField {...params} helperText={null} />}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>

                                            </Grid>
                                            <Box display="flex" flexDirection="row-reverse" p={2}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                    size='small'
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                        </CardContent>
                                        <div>&nbsp;</div>
                                        <PerfectScrollbar>
                                            <Box minWidth={1000} marginLeft={1} marginRight={1}>
                                                <Divider />
                                                {filteredDetails.length > 0 ?
                                                    <><TableContainer>
                                                        <Table aria-label="caption table">
                                                            <TableHead >
                                                                <TableRow >
                                                                    <TableCell align='center' rowSpan={3} style={{ border: '1px solid #595959', width: '100px' }}>Date</TableCell>
                                                                    <TableCell align='center' colSpan={6} style={{ border: '1px solid #595959', width: '600px' }}>
                                                                        Grade
                                                                    </TableCell>
                                                                    <TableCell align='center' rowSpan={3} style={{ border: '1px solid #595959', backgroundColor: '#B3B3B3', width: '100px' }}>Main Grade Total (Kg)</TableCell>
                                                                    <TableCell align='center' rowSpan={3} style={{ border: '1px solid #595959', backgroundColor: '#E6E6E6', width: '100px' }}>Off Grade Total (Kg)</TableCell>
                                                                </TableRow>
                                                                <TableRow >
                                                                    <TableCell align='center' colSpan={3} style={{ border: '1px solid #595959', backgroundColor: '#B3B3B3', width: '300px' }}>Main Grade (Kg)</TableCell>
                                                                    <TableCell align='center' colSpan={3} style={{ border: '1px solid #595959', backgroundColor: '#E6E6E6', width: '300px' }}>Off Grade (Kg)</TableCell>
                                                                </TableRow>
                                                                <TableRow >
                                                                    <TableCell align='center' style={{ border: '1px solid #595959' }}>Pekoe</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959' }}>FBOP</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959' }}>BOPF</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959' }}>BP</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959' }}>OP</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959' }}>OPA</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {filteredDetails.slice(page * limit, page * limit + limit).map((data, index) => (
                                                                    <TableRow key={index} style={{ border: '1px solid #595959' }}>
                                                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{data.Date}</TableCell>
                                                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#B3B3B3', width: '100px' }}>{data.Pekoe}
                                                                        </TableCell>
                                                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#B3B3B3', width: '100px' }}>{data.FBOP}
                                                                        </TableCell>
                                                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#B3B3B3', width: '100px' }}>{data.BOPF}
                                                                        </TableCell>
                                                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#E6E6E6', width: '100px' }}>{data.BP}
                                                                        </TableCell>
                                                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#E6E6E6', width: '100px' }}>{data.OP}
                                                                        </TableCell>
                                                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#E6E6E6', width: '100px' }}>{data.OPA}
                                                                        </TableCell>
                                                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#B3B3B3', width: '100px' }}>{data.MainGradeTot ? data.MainGradeTot : '-'}
                                                                        </TableCell>
                                                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#E6E6E6', width: '100px' }}>{data.OffGradeTot ? data.OffGradeTot : '-'}
                                                                        </TableCell>
                                                                    </TableRow>

                                                                ))}
                                                                <TableRow style={{ border: '1px solid #595959', backgroundColor: '#7d7d7d' }}>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>Total (Kg)</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.pekoeSum}</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.fbopSum}</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.bopffSum}</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.bpSum}</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.opSum}</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.opaSum}</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.mainGradeSum}</TableCell>
                                                                    <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.offGradeSum}</TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                        <TablePagination
                                                            component="div"
                                                            count={filteredDetails.length}
                                                            onChangePage={handlePageChange}
                                                            onChangeRowsPerPage={handleLimitChange}
                                                            page={page}
                                                            rowsPerPage={limit}
                                                            rowsPerPageOptions={[5, 10, 25]}
                                                        />
                                                        <Divider />
                                                        <div>&nbsp;</div>
                                                    </>
                                                    : null}
                                            </Box>
                                            {filteredDetails.length > 0 ?
                                                <>
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
                                                            documentTitle={"Sifted Tea Report"}
                                                            trigger={() => <Button
                                                                color="primary"
                                                                id="btnRecord"
                                                                size='small'
                                                                type="submit"
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
                                                                siftedTeaDetails={filteredDetails} searchData={selectedSearchValues}
                                                                monthlySum={monthlySum}
                                                            />
                                                        </div>
                                                        <div>&nbsp;</div>
                                                    </Box></>
                                                : null}
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container >
            </Page >
        </Fragment >
    );
}


import React, { useState, useEffect, Fragment, useRef } from 'react';
import {
    Box,
    Card,
    makeStyles,
    Container,
    Divider,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    InputLabel,
    Chip,
    CardHeader,
    Button,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import MaterialTable from 'material-table';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF'
import xlsx from 'json-as-xlsx';

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
    succes: {
        backgroundColor: "#fce3b6",
        marginLeft: "15px",
        marginBottom: "5px"
    },
    table: {
        width: 650,
    },
    colorRecord: {
        backgroundColor: "green",
    },
    colorCancel: {
        backgroundColor: "red",
    },
}));

const screenCode = 'HOLIDAYPAYSUMMERY';

export default function HolidayPaySummery() {
    const [title, setTitle] = useState("Holiday Pay Summery");
    const classes = useStyles();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [groupList, setGroupList] = useState([]);
    const [estateList, setEstateList] = useState([]);
    const [divisionList, setDivisionList] = useState([]);
    const [holidayPaySearch, setHolidayPaySearch] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: '0',
        empNo: ''
    });
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupName: "0",
        estateName: "0",
        divisionName: '0',
        empNo: ''
    })
    const [holidayPayList, setHolidayPayList] = useState([])
    const [csvHeaders, SetCsvHeaders] = useState([])
    const navigate = useNavigate();
    const componentRef = useRef();

    useEffect(() => {
        trackPromise(
            getPermission(),
            getGroupsForDropDown()
        );
    }, [])

    useEffect(() => {
        trackPromise(getEstateDetailsByGroupID());
    }, [holidayPaySearch.groupID])

    useEffect(() => {
        if (holidayPaySearch.estateID > 0) {
            trackPromise(getDivisionDetailsByEstateID());
        }
    }, [holidayPaySearch.estateID])

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWHOLIDAYPAYSUMMERY');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
        });

        setHolidayPaySearch({
            ...holidayPaySearch,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        });
    }

    async function getGroupsForDropDown() {
        const groups = await services.getGroupsForDropdown();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        var estate = await services.getEstatesByGroupID(holidayPaySearch.groupID);
        setEstateList(estate);
    }

    async function getDivisionDetailsByEstateID() {
        var division = await services.getDivisionDetailsByEstateID(holidayPaySearch.estateID);
        setDivisionList(division);
    };

    async function getDetails() {
        const model = {
            groupID: parseInt(holidayPaySearch.groupID),
            estateID: parseInt(holidayPaySearch.estateID),
            divisionID: parseInt(holidayPaySearch.divisionID),
            empNo: holidayPaySearch.empNo,
        }

        getSelectedDropdownValuesForReport(model);

        var response = await services.getHolidayPaySummeryDetails(model);
        if (response.length != 0) {
            response.forEach(x => {
                let totalDays = 0;
                x.getHolidayPaySummeryModel.forEach(y => {
                    if (y.isFullDay == true) {
                        totalDays = totalDays + 1;
                    } else if (y.isHalfDay == true) {
                        totalDays = totalDays + 0.5;
                    } else if (y.isHoliday == true) {
                        totalDays = totalDays + 1;
                    }
                    x.totalDays = totalDays;
                })
                if (x.genderID == 1) {
                    if (x.totalDays >= 72 && x.totalDays <= 143) {
                        x.applicableDays = '04';
                    } else if (x.totalDays >= 144 && x.totalDays <= 215) {
                        x.applicableDays = '08';
                    } else if (x.totalDays >= 216 && x.totalDays <= 287) {
                        x.applicableDays = '12';
                    } else if (x.totalDays >= 288) {
                        x.applicableDays = '17';
                    } else {
                        x.applicableDays = '0';
                    }
                } else if (x.genderID == 2) {
                    if (x.totalDays >= 66 && x.totalDays <= 131) {
                        x.applicableDays = '04';
                    } else if (x.totalDays >= 132 && x.totalDays <= 197) {
                        x.applicableDays = '08';
                    } else if (x.totalDays >= 198 && x.totalDays <= 263) {
                        x.applicableDays = '12';
                    } else if (x.totalDays >= 264) {
                        x.applicableDays = '17';
                    } else {
                        x.applicableDays = '0';
                    }
                }
            });
            SaveHolidayPaySummeryDetails(response);
            setHolidayPayList(response);
        }
    }

    async function SaveHolidayPaySummeryDetails(detailsList) {
        let listResult = [];
        detailsList.forEach(x => {
            listResult.push({
                registrationNumber: x.registrationNumber,
                empName: x.empName,
                genderID: x.genderID,
                employeeID: x.employeeID,
                totalDays: parseFloat(x.totalDays),
                applicableDays: x.applicableDays,
                createdBy: parseInt(tokenDecoder.getUserIDFromToken())
            })
        })
        if (detailsList.length > 0) {
            const model = {
                groupID: parseInt(holidayPaySearch.groupID),
                estateID: parseInt(holidayPaySearch.estateID),
                divisionID: parseInt(holidayPaySearch.divisionID),
                empNo: holidayPaySearch.empNo,
                listResult: listResult
            }
            var response = await services.saveHolidayPaySummeryDetails(model);
        }
    }


    async function createFile() {
        var file = await createDataForExcel(holidayPayList)
        var settings = {
            sheetName: 'Holiday Pay Summery Report',
            fileName: 'Holiday Pay Summery Report ' + selectedSearchValues.groupName + '-' + selectedSearchValues.estateName + '-' + selectedSearchValues.divisionName + '-' + selectedSearchValues.empNo,
            writeOptions: {}
        }

        let keys = Object.keys(file[0]);
        let tempcsvHeaders = csvHeaders;
        keys.map((sitem, i) => {
            tempcsvHeaders.push({ label: sitem, value: sitem })
        })

        let dataA = [
            {
                sheet: 'Holiday Pay Summery Report',
                columns: tempcsvHeaders,
                content: file
            }
        ]

        xlsx(dataA, settings);

    }

    async function createDataForExcel(array) {
        var res = []
        if (array != null) {
            array.map(x => {
                var vr = {
                    EmpNo: x.registrationNumber,
                    EmpName: x.empName,
                    Gender: x.gender,
                    TotalAttendence: x.totalDays,
                    HolidayPayApplicable: x.applicableDays == null ? parseInt(0) : parseInt(x.applicableDays)
                }
                res.push(vr);
            });
        }
        res.push({})
        var vr = {
            EmpNo: "Group: " + selectedSearchValues.groupName,
            EmpName: "Estate: " + selectedSearchValues.estateName,
            Gender: "Division: " + selectedSearchValues.divisionName,
        }
        res.push(vr)
        return res;
    }

    function getSelectedDropdownValuesForReport(searchForm) {
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groupList[searchForm.groupID],
            estateName: estateList[searchForm.estateID],
            divisionName: divisionList[searchForm.divisionID],
            empNo: holidayPaySearch.empNo
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

    function handleChange(e) {
        const target = e.target;
        const value = target.value;

        setHolidayPaySearch({
            ...holidayPaySearch,
            [e.target.name]: value
        })
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

    function createData(men, women) {
        return { men, women };
    }

    const rows = [
        createData('72 days to 143 days – 04', '66 days to 131 days – 04'),
        createData('144 days to 215 days – 08', '132 days to 197 days – 08'),
        createData('216 days to 287 days – 12	', '198 days to 263 days – 12'),
        createData('288 days & above - 17', '264 days & above - 17'),
    ];

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik

                        initialValues={{
                            groupID: holidayPaySearch.groupID,
                            estateID: holidayPaySearch.estateID,
                            divisionID: holidayPaySearch.divisionID,
                            empNo: holidayPaySearch.empNo,

                        }}

                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                divisionID: Yup.number().required('Division is required').min("1", 'Division is required')
                            })
                        }
                        onSubmit={() => trackPromise(getDetails())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched
                        }) => (
                            <form onSubmit={handleSubmit} >
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={2}>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            size='small'
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={holidayPaySearch.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groupList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="estateID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.estateID && errors.estateID)}
                                                            fullWidth
                                                            helperText={touched.estateID && errors.estateID}
                                                            size='small'
                                                            name="estateID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={holidayPaySearch.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estateList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="divisionID">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            fullWidth
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            size='small'
                                                            name="divisionID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={holidayPaySearch.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisionList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <InputLabel shrink id="empNo">
                                                            Emp No
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.empNo && errors.empNo)}
                                                            fullWidth
                                                            helperText={touched.empNo && errors.empNo}
                                                            name="empNo"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={holidayPaySearch.empNo}
                                                            variant="outlined"
                                                            id="empNo"
                                                            type="text"
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <br />
                                                <Grid container justify="flex-end">
                                                    <Box pr={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                            size='small'
                                                        >
                                                            Calculate
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </CardContent>
                                            <br />
                                            {holidayPayList.length > 0 ?
                                                <Box>
                                                    <center>
                                                        <TableContainer component={Paper} className={classes.table}>
                                                            <Table size="small" aria-label="a dense table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align="center">Holiday Pay Slab - Men</TableCell>
                                                                        <TableCell align="Center">Holiday Pay Slab - Women</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {rows.map((row) => (
                                                                        <TableRow>
                                                                            <TableCell align='center' component="th" scope="row">{row.men} </TableCell>
                                                                            <TableCell align='center' component="th" scope="row">{row.women} </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </center>
                                                    <br />
                                                    <MaterialTable
                                                        title={"Holuday Pay Summery"}
                                                        columns={[
                                                            { title: 'Emp No', field: 'registrationNumber' },
                                                            { title: 'Emp Name.', field: 'empName' },
                                                            { title: 'Gender', field: 'gender' },
                                                            { title: 'Total Attendance', field: 'totalDays' },
                                                            { title: 'Holiday Pay Applicable', field: 'applicableDays' },
                                                        ]}
                                                        data={holidayPayList}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1
                                                        }}
                                                    />

                                                </Box> : null}
                                            <br />
                                            {holidayPayList.length > 0 ?
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        id="btnRecord"
                                                        type="submit"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem' }}
                                                        className={classes.colorRecord}
                                                        size='small'
                                                        onClick={createFile}
                                                    >
                                                        EXCEL
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <ReactToPrint
                                                        documentTitle={"Holiday Pay Summary Report"}
                                                        trigger={() => <Button
                                                            color="primary"
                                                            id="btnCancel"
                                                            variant="contained"
                                                            style={{ marginRight: '1rem' }}
                                                            className={classes.colorCancel}
                                                            size='small'
                                                        >
                                                            PDF
                                                        </Button>}
                                                        content={() => componentRef.current}
                                                    />
                                                    {<div hidden={true}>
                                                        <CreatePDF ref={componentRef}
                                                            holidayPaySummery={holidayPayList}
                                                            searchData={selectedSearchValues}
                                                        />
                                                    </div>}
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
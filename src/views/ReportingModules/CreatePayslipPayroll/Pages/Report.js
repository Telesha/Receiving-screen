import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Grid, Box, Card, MenuItem, Button,
    makeStyles, Container, CardHeader, Divider, CardContent, InputLabel, TextField
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import permissionService from "../../../../../src/utils/permissionAuth";
import { LoadingComponent } from '../../../../../src/utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import tokenService from '../../../../../src/utils/tokenDecoder';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker } from "@material-ui/pickers";
import MaterialTable from "material-table";
import VisibilityIcon from '@material-ui/icons/Visibility';

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
    table: {
        minWidth: 650,
    },
    paper: {
        backgroundColor: "#424242",
    },
}));
const screenCode = 'CREATEPAYSLIPPAYROLL';

export default function CreatePayslipPayroll(props) {
    const classes = useStyles();
    const alert = useAlert();
    const [employeeNumber, setEmployeeNumber] = useState("");
    const navigate = useNavigate();
    const [title, setTitle] = useState("Payslip");
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [designation, setDesignation] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [empName, setEmpName] = useState('');
    const [empDesignation, setEmpDesignation] = useState('');
    const [empDesignationID, setEmpDesignationID] = useState('');
    const [employeeID, setEmployeeID] = useState('');
    const [isShowTable, setIsShowTable] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);

    const [attenceFormData, setAttendanceFormData] = useState({
        groupID: 0,
        employeeID: 0,
        estateID: 0,
        employeeNumber: '',
        empName: '',
        empDesignation: '',
        empDesignationID: 0,
        daysCount: '',
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        if (attenceFormData.groupID != 0) {

            getFactoriesForDropdown()
        }
    }, [attenceFormData.groupID]);

    useEffect(() => {
        if (attenceFormData.groupID != 0) {
            getFactoriesForDropdown(attenceFormData.groupID)
        }
    }, [attenceFormData.estateID]);

    useEffect(() => {
        if (attenceFormData.estateID != 0) {
            getDesignationsForDropdown(attenceFormData.estateID)
        }
    }, [attenceFormData.estateID]);

    useEffect(() => {
        if (!isUpdate) {
            setAttendanceFormData({
                ...attenceFormData,
                empName: '',
                empDesignation: ''
            })
        }
    }, [attenceFormData.empNo]);

    async function getPermissions() {
        var permissions = await permissionService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPAYSLIPPAYROLL');

        if (isAuthorized === undefined) {
            navigate('/app/unauthorized');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,

        });
        setAttendanceFormData({
            ...attenceFormData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
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
        setAttendanceFormData({
            ...attenceFormData,
            month: month.toString(),
            year: year.toString()
        });
        setSelectedDate(date);
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

    let encrypted = "";

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        )
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropdown() {
        const factories = await services.getEstateDetailsByGroupID(attenceFormData.groupID);
        setFactories(factories);
    }

    async function getDesignationsForDropdown() {
        const designation = await services.getDesignationsForDropdownByEstateID(attenceFormData.estateID);
        setDesignation(designation);
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setAttendanceFormData({
            ...attenceFormData,
            [e.target.name]: value
        });
        setAttendanceData([])
    }

    function handleChangeEmpNo(e) {
        const target = e.target;
        const value = target.value
        setEmployeeNumber(value)
    }

    async function GetAttendanceMark() {
        let model = {
            estateID: parseInt(attenceFormData.estateID),
            registrationNumber: employeeNumber ? employeeNumber : "",
            designationID: attenceFormData.empDesignationID == "" ? 0 : parseInt(attenceFormData.empDesignationID),
            month: parseInt(attenceFormData.month),
            year: parseInt(attenceFormData.year)
        }
        let item = await services.SearchAttendanceMark(model);
        if (item.data.length !== 0 && item.statusCode === 'Success') {
            setAttendanceData(item.data);
            setIsShowTable(true);
        } else {
            setAttendanceData(item.data);
            alert.error("No Records To Display")
        }
    }
    const handleClickEdit = (payRollMonthlyExecutionID) => {
        encrypted = btoa(payRollMonthlyExecutionID.toString());
        let modelID = {
            groupID: parseInt(attenceFormData.groupID),
            estateID: parseInt(attenceFormData.estateID),
            regNo: employeeNumber ? employeeNumber : "",
            daysCount: parseInt(attenceFormData.daysCount),
            designationID: attenceFormData.empDesignationID == "" ? 0 : parseInt(attenceFormData.empDesignationID),
            month: (new Date(selectedDate).getUTCMonth() + 1).toString().padStart(2, '0'),
            year: new Date(selectedDate).getUTCFullYear().toString()
        };
        sessionStorage.setItem('attendanceMark-page-search-parameters-id', JSON.stringify(modelID));
        navigate('/app/createPayslipPayroll/viewCreatePayslipPayroll/' + encrypted);
    }

    function clearData() {
        setAttendanceFormData({
            ...attenceFormData,
            groupID: 0,
            estateID: 0,
            regNo: '',
            empName: '',
            empDesignation: '',
            empDesignationID: '',
            employeeID: '',
            daysCount: 0,
            month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0'),
            year: new Date().getUTCFullYear().toString()
        });
        setEmployeeNumber([])
        setEmpName([])
        setEmpDesignation([])
        setEmpDesignationID([])
        setEmployeeID([])
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: attenceFormData.groupID,
                            estateID: attenceFormData.estateID,
                            regNo: employeeNumber,
                            empDesignation: empDesignation,
                            empDesignationID: empDesignationID,
                            employeeID: employeeID,
                            month: attenceFormData.month,
                            year: attenceFormData.year,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                month: Yup.string().required('Month is required'),
                                empDesignationID: Yup.number(),
                            })
                        }
                        onSubmit={GetAttendanceMark}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched,
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)} />
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
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={attenceFormData.groupID}
                                                            variant="outlined"
                                                            size='small'
                                                            id="groupID"
                                                            disabled={isUpdate}
                                                            InputProps={{
                                                                readOnly: isUpdate
                                                            }}
                                                        >
                                                            <MenuItem value={'0'}>--Select Group--</MenuItem>
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
                                                            value={attenceFormData.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            disabled={isUpdate}
                                                            InputProps={{
                                                                readOnly: isUpdate
                                                            }}
                                                        >
                                                            <MenuItem value={0}>--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
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
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="empNo">
                                                            Employee No
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.empNo && errors.empNo)}
                                                            fullWidth
                                                            helperText={touched.empNo && errors.empNo}
                                                            name="empNo"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => handleChangeEmpNo(e)}
                                                            value={employeeNumber}
                                                            variant="outlined"
                                                            id="empNo"
                                                            disabled={isUpdate}
                                                            type="text"
                                                            inputProps={{
                                                                readOnly: isUpdate
                                                            }}
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="empDesignationID">
                                                            Designation
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.empDesignationID && errors.empDesignationID)}
                                                            fullWidth
                                                            helperText={touched.empDesignationID && errors.empDesignationID}
                                                            size='small'
                                                            name="empDesignationID"
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={attenceFormData.empDesignationID}
                                                            variant="outlined"
                                                            id="empDesignationID"
                                                        >
                                                            <MenuItem value="0">--Select Designation--</MenuItem>
                                                            {generateDropDownMenu(designation)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid container justify='flex-end' spacing={-3} >
                                                        {!isUpdate ?
                                                            <Box pr={2} style={{ marginTop: '-20px', marginBottom: '10px' }}>
                                                                <Button
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    type="reset"
                                                                    onClick={clearData}
                                                                    size='small'
                                                                >
                                                                    Clear
                                                                </Button>
                                                            </Box>
                                                            : null}
                                                        <Box pr={2} style={{ marginTop: '-20px', marginBottom: '10px' }}>
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                type="submit"
                                                                size='small'
                                                            >
                                                                Search
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                            <Box minWidth={1050}>
                                                {attendanceData.length > 0 && isShowTable ? (
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Reg Number', field: 'employeeNo' },
                                                            { title: 'Employee Name', field: 'employeeName' },
                                                            { title: 'Designation', field: 'designationName' },

                                                        ]}
                                                        data={attendanceData}
                                                        options={{
                                                            exportButton: false,
                                                            showTitle: false,
                                                            headerStyle: { textAlign: "left", height: '1%' },
                                                            cellStyle: { textAlign: "left" },
                                                            columnResizable: false,
                                                            actionsColumnIndex: -1,
                                                            pageSize: 10
                                                        }}
                                                        actions={[{
                                                            icon: VisibilityIcon,
                                                            tooltip: 'View',
                                                            onClick: (event, rowData) => handleClickEdit(rowData.payRollMonthlyExecutionID)
                                                        }]}
                                                    />
                                                ) : null}
                                            </Box>
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
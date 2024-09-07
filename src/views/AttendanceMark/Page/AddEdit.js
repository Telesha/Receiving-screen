import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel,
    CardHeader, MenuItem, TableCell,
    TableRow, TableContainer, TableBody, Table, TableHead
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import permissionService from "../../../utils/permissionAuth";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import tokenService from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker } from "@material-ui/pickers";
import PageHeader from 'src/views/Common/PageHeader';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { AlertDialogWithoutButton } from '../../Common/AlertDialogWithoutButton';

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

const screenCode = 'ATTENDANCEMARK';

export default function AttendanceMarkAddEdit() {
    const classes = useStyles();
    let decrypted = 0;
    const alert = useAlert();
    const [employeeNumber, setEmployeeNumber] = useState("");
    const navigate = useNavigate();
    const [title, setTitle] = useState("Attendance Mark");
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [empName, setEmpName] = useState('');
    const [empDesignationID, setEmpDesignationID] = useState('');
    const [employeeID, setEmployeeID] = useState('');
    const [ArrayField, setArrayField] = useState([]);
    const [updateArrayField, setupdateArrayField] = useState([]);
    const [saveArrayField, setSaveArrayField] = useState([]);
    const [employeeListArray, setEmployeeListArray] = useState([]);
    const [empDesignation, setEmpDesignation] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [dialog, setDialog] = useState(false);
    const [isDayCount, setIsDayCount] = useState(false);
    const [attenceFormData, setAttendanceFormData] = useState({
        groupID: 0,
        estateID: 0,
        employeeNumber: '',
        empName: '',
        empDesignation: '',
        empDesignationID: '',
        employeeID: '',
        daysCount: '',
        otHours: '',
        year: new Date().getUTCFullYear().toString(),
        month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    })


    const { attendanceMarkID } = useParams();
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
        decrypted = atob(attendanceMarkID.toString());
        if (parseInt(decrypted) > 0) {
            setIsUpdate(true);
            getDetailsByAttendanceMarkID(decrypted);
        }
    }, []);

    useEffect(() => {
        if (employeeNumber !== "" && !isUpdate) {
            FindEmployeeFromEmployeeArray()
        }
    }, [employeeNumber]);

    useEffect(() => {
        if (employeeNumber !== "" && !isUpdate) {
            setAttendanceFormData({
                ...attenceFormData,
                daysCount: '',
                otHours: ''
            })
            setIsDayCount(false)
        }
    }, [employeeNumber]);

    useEffect(() => {
        if (!isUpdate) {
            setAttendanceFormData({
                ...attenceFormData,
                empName: '',
                empDesignation: '',
                empDesignationID: '',
                employeeID: '',
            })
        }
    }, [attenceFormData.regNo]);

    useEffect(() => {
        if (attenceFormData.groupID !== 0 && attenceFormData.estateID !== 0) {
            trackPromise(getEmployeesByEstateID());
        }
    }, [attenceFormData.groupID, attenceFormData.estateID]);

    async function getPermissions() {
        var permissions = await permissionService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITATTENDANCE');

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

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
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

    function handleChangeEmpNo(e) {
        const target = e.target;
        const value = target.value
        setEmployeeNumber(value)
    }


    function handleClick() {

        if (isUpdate == false) {
            if (ArrayField.length != 0) {
                setDialog(true);
            } else {
                navigate('/app/attendanceMark/listing');
            }
        } else {
            navigate('/app/attendanceMark/listing');
        }
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={() => handleClick()}
                    />
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

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items
    }

    async function getEmployeesByEstateID() {
        const employees = await services.getEmployeesByEstateID(attenceFormData.estateID);
        setEmployeeListArray(employees);
    }

    async function getEmployeesDaysCount() {
        const existData = await services.CheckEmpAttendanceCheckDatabase(attenceFormData.estateID, employeeNumber, attenceFormData.month, attenceFormData.year);
        if (existData.length > 0) {
            if (existData[0].regNo === employeeNumber) {
                setAttendanceFormData({
                    ...attenceFormData,
                    daysCount: existData[0].daysCount,
                    otHours: existData[0].otHours
                })
                setIsDayCount(true)
            }
        }
    }

    async function confirmRequest() {
        navigate('/app/attendanceMark/listing');
    }

    async function cancelRequest() {
        setDialog(false);

    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setAttendanceFormData({
            ...attenceFormData,
            [e.target.name]: value
        });
    }

    function handleChangeForAmount(e) {
        const target = e.target;
        let value = target.value;

        value = value.replace(/[^0-9.]/g, '');
        const decimalParts = value.split('.');

        if (decimalParts.length > 2) {

            value = decimalParts.slice(0, 2).join('.');
        } else if (decimalParts.length === 2) {

            value = `${decimalParts[0]}.${decimalParts[1].slice(0, 2)}`;
        }

        setAttendanceFormData({
            ...attenceFormData,
            [target.name]: value
        });

    }

    async function getDetailsByAttendanceMarkID(attendanceMarkID) {
        setTitle("Edit Attendance Mark");
        const response = await services.GetDetailsByAttendanceMarkID(attendanceMarkID);
        setIsUpdate(true);
        setAttendanceFormData({
            ...attenceFormData,
            groupID: response.groupID,
            estateID: response.estateID,
            regNo: response.regNo,
            daysCount: response.daysCount,
            month: response.month,
            year: response.year,
            empName: response.employeeName,
            empDesignation: response.designationName,
            otHours: response.otHours
        });
        setEmpDesignation(response.designationName)
        setEmployeeNumber(response.regNo)
        setEmpName(response.employeeName)
    }

    function FindEmployeeFromEmployeeArray() {
        var employee = employeeListArray.find(x => x.regNo === employeeNumber);

        if (employee) {
            setAttendanceFormData({
                ...attenceFormData,
                empName: employee.employeeName,
                empDesignation: employee.designation,
                empDesignationID: employee.designationID,
                employeeID: employee.employeeID,
            })
            setEmpName(employee.employeeName);
            setEmpDesignation(employee.designation);
            setEmpDesignationID(employee.designationID);
            setEmployeeID(employee.employeeID);
            getEmployeesDaysCount();
        } else {
            setAttendanceFormData({
                ...attenceFormData,
                empName: "",
                empDesignation: "",
                empDesignationID: "",
                employeeID: ""
            })
            setEmpName("");
            setEmpDesignation("");
            setEmpDesignationID("");
            setEmployeeID("");
        }
    }

    async function AddAttendanceMark() {
        if (employeeNumber == null) {
            alert.error("Please enter employee number")
        }
        if (isUpdate == true) {
            const fomatedDaysCount = parseFloat(attenceFormData.daysCount);
            const fomatedOtHours = attenceFormData.otHours == '' ? 0 : parseFloat(attenceFormData.otHours);
            let model = {
                attendanceMarkID: parseInt(atob(attendanceMarkID).toString()),
                groupID: parseInt(attenceFormData.groupID),
                estateID: parseInt(attenceFormData.estateID),
                regNo: attenceFormData.regNo,
                month: parseInt(attenceFormData.month),
                year: parseInt(attenceFormData.year),
                daysCount: fomatedDaysCount,
                otHours: fomatedOtHours,
                createdBy: parseInt(tokenService.getUserIDFromToken())
            }
            let response = await services.UpdateAttendanceMark(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setArrayField([]);
                navigate('/app/attendanceMark/listing');
            } else {
                alert.error(response.message);
            }

        } else {
            const isMatch = ArrayField.some(x =>
                x.estateID === parseInt(attenceFormData.estateID) &&
                x.regNo === employeeNumber
            );

            if (isMatch) {
                alert.error("The record already exists!")
            } else {
                var array1 = [...ArrayField];
                array1.push({
                    groupID: parseInt(attenceFormData.groupID),
                    estateID: parseInt(attenceFormData.estateID),
                    regNo: employeeNumber,
                    empName: empName,
                    empDesignation: empDesignation,
                    designationID: parseInt(empDesignationID),
                    employeeID: parseInt(employeeID),
                    month: parseInt(attenceFormData.month),
                    year: parseInt(attenceFormData.year),
                    daysCount: parseFloat(attenceFormData.daysCount),
                    otHours: attenceFormData.otHours == '' ? 0 : parseFloat(attenceFormData.otHours),
                    createdBy: parseInt(tokenService.getUserIDFromToken())
                });
                setArrayField(array1);
                setAttendanceFormData({
                    ...attenceFormData,
                    employeeNumber: '',
                    daysCount: '',
                    otHours: '',
                });
                setEmployeeNumber([])
                setEmpName([])
                setEmpDesignation([])
                setEmpDesignationID([])
                setEmployeeID([])

                var checkExistindData = await services.CheckEmpAttendanceCheckDatabase(attenceFormData.estateID, employeeNumber, attenceFormData.month, attenceFormData.year);

                if (checkExistindData.length > 0) {
                    if (checkExistindData[0].regNo === employeeNumber) {
                        var updateDataArray = [...updateArrayField];
                        updateDataArray.push({
                            attendanceMarkID: checkExistindData[0].attendanceMarkId,
                            groupID: parseInt(attenceFormData.groupID),
                            estateID: parseInt(attenceFormData.estateID),
                            regNo: employeeNumber,
                            empName: empName,
                            empDesignation: empDesignation,
                            designationID: parseInt(empDesignationID),
                            employeeID: parseInt(employeeID),
                            month: parseInt(attenceFormData.month),
                            year: parseInt(attenceFormData.year),
                            daysCount: parseFloat(attenceFormData.daysCount),
                            otHours: attenceFormData.otHours == '' ? 0 : parseFloat(attenceFormData.otHours),
                            createdBy: parseInt(tokenService.getUserIDFromToken())
                        });
                        setupdateArrayField(updateDataArray);
                    }
                } else {
                    var saveDataArray = [...saveArrayField];
                    saveDataArray.push({
                        groupID: parseInt(attenceFormData.groupID),
                        estateID: parseInt(attenceFormData.estateID),
                        regNo: employeeNumber,
                        empName: empName,
                        empDesignation: empDesignation,
                        designationID: parseInt(empDesignationID),
                        employeeID: parseInt(employeeID),
                        month: parseInt(attenceFormData.month),
                        year: parseInt(attenceFormData.year),
                        daysCount: parseFloat(attenceFormData.daysCount),
                        otHours: attenceFormData.otHours == '' ? 0 : parseFloat(attenceFormData.otHours),
                        createdBy: parseInt(tokenService.getUserIDFromToken())
                    });
                    setSaveArrayField(saveDataArray);
                }
            }

        }
    }

    async function saveAttendanceMark() {
        if (updateArrayField.length > 0) {
            let responses = await services.UpdateAttendanceMarkSet(updateArrayField);
            if (responses.statusCode == "Success") {
                alert.success(responses.message);
                setupdateArrayField([]);
                navigate('/app/attendanceMark/listing');
            } else {
                alert.error(response.message);
            }
        }

        if (saveArrayField.length > 0) {
            var response = await services.SaveAttendanceMark(saveArrayField);
            if (response.statusCode == "Success") {
                alert.success(response.message)
                setArrayField([]);
                setSaveArrayField([]);
                navigate('/app/attendanceMark/listing');
            }
        } else {
            alert.error(response.message)
        }
    }

    function clearData() {
        setAttendanceFormData({
            ...attenceFormData,
            estateID: 0,
            regNo: '',
            empName: '',
            empDesignation: '',
            empDesignationID: '',
            employeeID: '',
            daysCount: 0,
            otHours: 0
        });
        setEmployeeNumber('')
        setEmpName([])
        setEmpDesignation([])
        setEmpDesignationID([])
        setEmployeeID([])
        setSelectedDate(new Date())
    }
    const showDeleteConfirmation = (index) => {
        setDeleteIndex(index);
        setShowDeleteDialog(true);
    };
    const deleteDetails = () => {
        if (deleteIndex !== null) {
            const dataDelete = [...ArrayField];
            const remove = deleteIndex;
            dataDelete.splice(remove, 1);
            setArrayField([...dataDelete]);
        }
        setShowDeleteDialog(false);
    };
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
                            empName: empName,
                            empDesignation: empDesignation,
                            empDesignationID: empDesignationID,
                            employeeID: employeeID,
                            month: attenceFormData.month,
                            year: attenceFormData.year,
                            daysCount: attenceFormData.daysCount,
                            otHours: attenceFormData.otHours
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                regNo: Yup.number().required('Employee No is required'),
                                empName: Yup.string().required('Employee Name is required'),
                                daysCount: Yup.number().max(30, "Value exceeds the 30 limit.").required('Days is required').min(1, 'Days is required'),
                            })
                        }
                        onSubmit={AddAttendanceMark}
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
                                                <Grid container spacing={4}>
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
                                                                disabled={isUpdate}
                                                                disableFuture={true}
                                                                onChange={date => handleDateChange(date)}
                                                                size="small"
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="regNo">
                                                            Employee No *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.regNo && errors.regNo)}
                                                            fullWidth
                                                            helperText={touched.regNo && errors.regNo}
                                                            name="regNo"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => handleChangeEmpNo(e)}
                                                            value={employeeNumber}
                                                            variant="outlined"
                                                            id="regNo"
                                                            disabled={isUpdate}
                                                            type="text"
                                                            inputProps={{
                                                                readOnly: isUpdate
                                                            }}
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="empName">
                                                            Employee Name
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.empName && errors.empName)}
                                                            fullWidth
                                                            helperText={touched.empName && errors.empName}
                                                            name="empName"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={empName}
                                                            variant="outlined"
                                                            id="empName"
                                                            disabled={isUpdate}
                                                            type="text"
                                                            inputProps={{
                                                                readOnly: true
                                                            }}
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="empDesignation">
                                                            Employee Designation
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.empDesignation && errors.empDesignation)}
                                                            fullWidth
                                                            helperText={touched.empDesignation && errors.empDesignation}
                                                            name="empDesignation"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => handleChange(e)}
                                                            value={empDesignation}
                                                            variant="outlined"
                                                            id="empDesignation"
                                                            disabled={isUpdate}
                                                            type="text"
                                                            inputProps={{
                                                                readOnly: true
                                                            }}
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="daysCount">
                                                            No of Days *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.daysCount && errors.daysCount)}
                                                            helperText={touched.daysCount && errors.daysCount}
                                                            fullWidth
                                                            size='small'
                                                            name="daysCount"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChangeForAmount(e)}
                                                            value={attenceFormData.daysCount}
                                                            variant="outlined"
                                                            id="daysCount"
                                                            multiline
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="otHours">
                                                            OT Hours
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.otHours && errors.otHours)}
                                                            helperText={touched.otHours && errors.otHours}
                                                            fullWidth
                                                            size='small'
                                                            name="otHours"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChangeForAmount(e)}
                                                            value={attenceFormData.otHours}
                                                            variant="outlined"
                                                            id="otHours"
                                                            multiline
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid container justify='flex-end' spacing={0}>
                                                        {isUpdate ? null :
                                                            <Box pr={2} style={{ marginTop: '-20px', marginBottom: '10px' }}>
                                                                <Button
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    type="reset"
                                                                    hidden={isUpdate}
                                                                    onClick={clearData}
                                                                    size='small'
                                                                >
                                                                    Clear
                                                                </Button>
                                                            </Box>}
                                                        <Box pr={2} style={{ marginTop: '-20px', marginBottom: '10px' }}>
                                                            <Button
                                                                color="primary"
                                                                //disabled={attenceFormData.empName == "" ? true : false}
                                                                variant="contained"
                                                                type="submit"
                                                                size='small'
                                                            >
                                                                {((isUpdate == true) || (isDayCount == true)) ? "Update" : "Add"}
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                                {ArrayField.length > 0 ? (
                                                    <Grid item xs={12}>
                                                        <TableContainer>
                                                            <Table className={classes.table} aria-label="caption table">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell align="center"><b>Employee Number</b></TableCell>
                                                                        <TableCell align="center"><b>Employee Name</b></TableCell>
                                                                        <TableCell align="center"><b>Days</b></TableCell>
                                                                        <TableCell align="center"><b>OT Hours</b></TableCell>
                                                                        <TableCell align="center"><b>Action</b></TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {ArrayField.map((row, index) => {
                                                                        return <TableRow key={index}>
                                                                            <TableCell align="center" >{row.regNo}
                                                                            </TableCell>
                                                                            <TableCell align="center" >{row.empName}
                                                                            </TableCell>
                                                                            <TableCell align="center" >{row.daysCount}
                                                                            </TableCell>
                                                                            <TableCell align="center" >{row.otHours}
                                                                            </TableCell>
                                                                            <TableCell align='center' scope="row" style={{ borderBottom: "none" }}>
                                                                                <DeleteIcon
                                                                                    style={{
                                                                                        color: "red",
                                                                                        marginBottom: "-1rem",
                                                                                        marginTop: "0rem",
                                                                                        cursor: "pointer"
                                                                                    }}
                                                                                    size="small"
                                                                                    onClick={() => showDeleteConfirmation(index)}
                                                                                >
                                                                                </DeleteIcon>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </Grid>
                                                )
                                                    : null}
                                                {(ArrayField.length > 0) ?
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button
                                                            color="primary"
                                                            type="button"
                                                            variant="contained"
                                                            size='small'
                                                            onClick={() => saveAttendanceMark()}
                                                        >
                                                            {isUpdate == true ? "Update" : "Save"}
                                                        </Button>
                                                    </Box>
                                                    : null}

                                            </CardContent>
                                            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth="sm" fullWidth>
                                                <DialogTitle style={{ fontSize: '2.5rem' }}>Confirmation</DialogTitle>
                                                <DialogContent style={{ fontSize: '1rem' }}>
                                                    Are you sure want to delete this record?
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={() => setShowDeleteDialog(false)} color="primary">
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={deleteDetails} color="primary">
                                                        Confirm
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                                {dialog ?
                                    <AlertDialogWithoutButton confirmData={confirmRequest} cancelData={cancelRequest}
                                        headerMessage={"Attendance Mark"}
                                        discription={"Added Attendance Mark will be not saved, Are you sure you want to leave?"} />
                                    : null
                                }
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    )
}
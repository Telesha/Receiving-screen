import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box,
    Card,
    Button,
    makeStyles,
    Container,
    Divider,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    MenuItem,
    InputLabel,
    FormControlLabel,
    Switch,
    Dialog,
    DialogTitle,
    Typography,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import CSVReader from 'react-csv-reader';
import { confirmAlert } from 'react-confirm-alert';
import MaterialTable from "material-table";
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import tokenDecoder from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { CSVLink } from 'react-csv';
import { AddEditTable } from './Popup';

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
    row: {
        marginTop: '1rem'
    }
}));

const screenCode = 'SUNDRYATTENDANCEBULKUPLOAD';
export default function SundryAttendanceBulkUpload(props) {
    const navigate = useNavigate();
    const [title, setTitle] = useState("Sundry Attendance Bulk Upload")
    const classes = useStyles();
    const alert = useAlert();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [divisions, setDivisions] = useState();
    const [musterChitList, setMusterChitList] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [employeeDetails, setEmployeeDetails] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [isHoliday, setIsHoliday] = useState(false);
    const [IsUploadingFinished, setIsUploadingFinished] = useState(false)
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [attendenceRowData, setAttendenceRowData] = useState([])
    const [isEdit, setIsEdit] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const [dialogbox, setDialogbox] = useState(false);
    const [SundryJobType, setSundryJobType] = useState([]);
    const [attendanceBulkUpload, setAttendanceBulkUpload] = useState({
        groupID: '0',
        factoryID: '0',
        mainDivisionID: '0',
        date: new Date().toISOString().substring(0, 10),
        musterChitID: '0',
        isHoliday: false,
        jobTypeID: '0'
    })
    const [FormDetails, setFormDetails] = useState({
        divisionID: '0',
        jobTypeID: '0',
        employeeTypeID: '0',
        employeeNumber: null,
        workTypeID: '0',
        fieldID: '0',
        gangID: '0',
        sessionID: '0',
        amount: 0,
        days: '0',
        norm: 0,
        minNoam: 0,
        isActive: false,
        isHoliday: false,
        musterChitID: '0',
        operatorID: '0',
        empName: "",
        lentEstateID: '0',
        jobCategoryID: '0',
        musterChitEmployeeCount: ''
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const handleClose = () => {
        setOpen(false);
    };
    const [open, setOpen] = React.useState(true);
    const papaparseOptions = {
        header: true,
        dynamicTyping: false,
        quoteChar: '"',
        skipEmptyLines: true,
        parseNumbers: true,
        transformHeader: header => header.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '')
    };
    const currentDate = new Date();
    const maxDate = currentDate.toISOString().split('T')[0];
    const [minDate, setMinDate] = useState(new Date(currentDate));
    const minDateString = minDate.toISOString().split('T')[0];

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        if (parseInt(attendanceBulkUpload.groupID) > 0) {
            trackPromise(getFactoriesForDropDown());
        };
    }, [attendanceBulkUpload.groupID]);

    useEffect(() => {
        if (parseInt(attendanceBulkUpload.factoryID) > 0) {
            trackPromise(getDivisionsForDropDown());
        };
        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            mainDivisionID: '0',
            musterChitID: '0'
        })
        setFormDetails({
            ...FormDetails,
            musterChitEmployeeCount: ''
        })
        if (attendanceBulkUpload.factoryID != 0) {
            GetSundryJobTypesByJobCategoryID();
        }
    }, [attendanceBulkUpload.factoryID]);

    useEffect(() => {
        if (parseInt(attendanceBulkUpload.mainDivisionID) > 0) {
            trackPromise(getMusterChitDetailsByDateDivisionID());
        };
        setFormDetails({
            ...FormDetails,
            musterChitID: '0',
            musterChitEmployeeCount: ''
        })
    }, [attendanceBulkUpload.mainDivisionID, attendanceBulkUpload.date]);

    useEffect(() => {
        if (parseInt(attendanceBulkUpload.mainDivisionID) > 0) {
            trackPromise(GetEmployeeDetailsCheckrollAttendanceBulkUpload());
        };
    }, [attendanceBulkUpload.mainDivisionID]);

    useEffect(() => {
        if (attendanceBulkUpload.mainDivisionID > 0) {
            trackPromise(
                getAttendanceExecutionDate());
        };
    }, [attendanceBulkUpload.mainDivisionID]);

    useEffect(() => {
        if (parseInt(attendanceBulkUpload.musterChitID) > 0) {
            trackPromise(getMusterchitDetailsByMusterchitID());
        }
        setFormDetails({
            ...FormDetails,
            musterChitEmployeeCount: ''
        })
    }, [attendanceBulkUpload.musterChitID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSUNDRYATTENDANCEBULKUPLOAD');

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

        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }
    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(attendanceBulkUpload.groupID);
        setFactories(factory);
    }

    async function getDivisionsForDropDown() {
        const divisions = await services.getDivisionDetailsByEstateID(attendanceBulkUpload.factoryID);
        setDivisions(divisions);
    }

    async function GetSundryJobTypesByJobCategoryID() {
        var response = await services.GetSundryJobTypesByJobCategoryID(attendanceBulkUpload.factoryID);
        setSundryJobType(response);
    };

    async function getMusterChitDetailsByDateDivisionID() {
        var response = await services.getMusterChitDetailsByDateDivisionID(attendanceBulkUpload.mainDivisionID, attendanceBulkUpload.date);
        setMusterChitList(response);
    };

    async function GetEmployeeDetailsCheckrollAttendanceBulkUpload() {
        let model = {
            groupID: parseInt(attendanceBulkUpload.groupID),
            estateID: parseInt(attendanceBulkUpload.factoryID),
            divisionID: parseInt(attendanceBulkUpload.mainDivisionID)
        }
        const item = await services.GetEmployeeDetailsCheckrollAttendanceBulkUpload(model);
        if (item.length !== 0) {
            setEmployeeDetails(item);
        }
    }

    async function getMusterchitDetailsByMusterchitID() {
        var response = await services.getMusterchitDetailsByMusterchitID(parseInt(attendanceBulkUpload.musterChitID));

        setFormDetails({
            ...FormDetails,
            fieldID: response.lentFieldID == 0 && response.lentEstateID == 0 ? response.fieldID.toString() : response.lentFieldID.toString(),
            jobCategoryID: response.jobCategoryID.toString(),
            workTypeID: response.lentDivisionID || response.lentFieldID || response.lentEstateID ? 2 : 1,
            jobTypeID: response.sundryJobTypeID.toString(),
            divisionID: response.lentDivisionID == 0 && response.lentEstateID == 0 ? response.divisionID.toString() : response.lentDivisionID.toString(),
            lentEstateID: response.lentEstateID,
            musterChitEmployeeCount: response.updatedEmployeeCount
        });
        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            jobTypeID: response.sundryJobTypeID
        })
    };

    const handleForce = (data, fileInfo) => {
        if (attendanceData.length > 0) {
            confirmAlert({
                title: 'Confirmation Message',
                message: 'Are you sure to browse a new file without uploading existing file.',
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => confirmUpload(data, fileInfo)
                    },
                    {
                        label: 'No',
                        onClick: () => handleClose()
                    }
                ],
                closeOnEscape: true,
                closeOnClickOutside: true,
            });
        }
        else {
            confirmUpload(data, fileInfo);
        }
    }

    function confirmUpload(data, fileInfo) {
        setIsUploadingFinished(false);
        setAttendanceData(data);
    }

    function updateConfirmation() {
        alert.success("Attendance Update Successfully");
    }

    async function getAttendanceExecutionDate() {
        const result = await services.getAttendanceExecutionDate(
            attendanceBulkUpload.groupID,
            attendanceBulkUpload.factoryID,
            attendanceBulkUpload.mainDivisionID
        );

        const newMinDate = new Date(currentDate);
        newMinDate.setDate(currentDate.getDate() - (result.dayCount));
        setMinDate(newMinDate);
    }

    async function saveEmployeeAttendance() {

        if (attendanceData.length <= FormDetails.musterChitEmployeeCount) {
            var successList = attendanceData.filter(x => (x.empNo === '') || (x.dayType === '') || (x.dayOtHours === '') || (x.nightOtHours === '') || (x.doubleOtHours === '') || (x.isCashJob === ''))
            if (successList.length === 0) {
                var wrongRecords = attendanceData.filter(x =>
                    !(["full", "half"].includes(x.dayType.toLowerCase()) && ["yes", "no"].includes(x.isCashJob.toLowerCase()))
                );
                if (wrongRecords.length === 0) {
                    let datarest = await Promise.all(attendanceData.map(async data => {

                        const empData = employeeDetails.find((x) => x.registrationNumber == data.empNo)
                        var attendanceID = data.dayType.toLowerCase() == "full" ? parseInt(1) : parseInt(2)
                        var manDaysCount = 0
                        if (attendanceBulkUpload.isHoliday === true && !(data.isCashJob.toLowerCase() == "yes")) {
                            if (parseInt(attendanceID) === 1) {
                                manDaysCount = 1.5
                            } else if (parseInt(attendanceID) === 2) {
                                manDaysCount = 0.75
                            } else {
                                manDaysCount = 0
                            }
                        } else {
                            if (parseInt(attendanceID) === 1) {
                                manDaysCount = 1
                            }
                            else if (parseInt(attendanceID) === 2) {
                                manDaysCount = 0.5
                            } else {
                                manDaysCount = 0
                            }
                        }

                        let dataobj = {
                            empNo: data.empNo,
                            groupID: parseInt(attendanceBulkUpload.groupID),
                            estateID: parseInt(attendanceBulkUpload.factoryID),
                            mainDivisionID: parseInt(attendanceBulkUpload.mainDivisionID),
                            divisionID: parseInt(FormDetails.divisionID),
                            date: (attendanceBulkUpload.date),
                            musterChitID: parseInt(attendanceBulkUpload.musterChitID),
                            empName: empData == null ? "" : empData.employeeName,
                            employeeTypeID: empData == null ? 0 : empData.employeeTypeID,
                            fieldID: parseInt(FormDetails.fieldID),
                            divisionID: parseInt(FormDetails.divisionID),
                            jobID: parseInt(FormDetails.jobTypeID),
                            workType: parseInt(FormDetails.workTypeID),
                            lentEstateID: parseInt(FormDetails.lentEstateID),
                            isTaskComplete: true,
                            attendenceID: data.dayType.toLowerCase() == "full" ? parseInt(1) : parseInt(2),
                            dayOtHours: data.dayOtHours == null ? parseFloat(0) : parseFloat(data.dayOtHours),
                            nightOtHours: data.nightOtHours == null ? parseFloat(0) : parseFloat(data.nightOtHours),
                            doubleOtHours: data.doubleOtHours == null ? parseFloat(0) : parseFloat(data.doubleOtHours),
                            isCashJob: data.isCashJob.toLowerCase() == "yes" ? true : false,
                            operatorID: parseInt(0),
                            createdBy: tokenDecoder.getUserIDFromToken(),
                            isHoliday: data.isCashJob.toLowerCase() == "yes" ? false : attendanceBulkUpload.isHoliday,
                            manDays: parseInt(FormDetails.jobTypeID) === 5 ? parseInt(0) : parseFloat(manDaysCount),
                            jobCategoryID: parseInt(FormDetails.jobCategoryID),
                            employeeID: empData == null ? 0 : empData.employeeID
                        }
                        return dataobj;
                    }))
                    setTableData(datarest);
                } else {
                    alert.error("Incorrect Data Found");
                }
            } else {
                alert.error("Some Fields Are Empty In The Bulk File");
            }

        } else {
            alert.error("Muster Chit Employee Count Exceeded");
        }
    }

    async function ProduceEmployeeAttendance() {
        const response = await services.SaveSundryCheckrollAttendanceBulkUpload(tableData);
        if (response.statusCode == "Success") {
            if (response.data.length > 0) {
                setTableData(response.data)
                alert.error("Few Records With Errors Are Not Saved")
                setIsUploadingFinished(true);
                setIsFailed(true)
                clearScreen();
            }
            else {
                alert.success(response.message);
                clearData();
                clearScreen();
            }
        }
        else {
            setTableData(response.data);
            alert.error(response.message);
            clearScreen();
        }
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

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        )
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        if (target.name === "groupID") {
            setAttendanceBulkUpload({
                ...attendanceBulkUpload,
                [e.target.name]: value,
                factoryID: 0
            });
        } else {
            setAttendanceBulkUpload({
                ...attendanceBulkUpload,
                [e.target.name]: value
            });
        }
        clearScreen();
    }

    function handleDateChange(value) {
        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            date: value
        });
    }

    function clearScreen() {
        setAttendanceData([]);
        document.querySelector('.csv-input').value = '';
    }

    function clearData() {
        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            mainDivisionID: '0',
            date: new Date().toISOString().substring(0, 10),
            musterChitID: '0',
            isHoliday: false
        });
        setIsHoliday(false)
        setIsUploadingFinished(false);
        setAttendanceData([]);
        setTableData([]);
        setIsFailed(false);
    }

    async function handleClickEdit(rowData) {
        setAttendenceRowData(rowData);
        setDeleteConfirmationOpen(true);
    }

    async function EditEmployeeDetails(rowData) {
        setAttendenceRowData(rowData)
        setDialogbox(true)
    }

    function isHolidayhandleChange(e) {
        const target = e.target
        const value = target.name === 'isHoliday' ? target.checked : target.value
        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            [e.target.name]: value
        })
        setIsHoliday(value)
    }

    async function handleClickDeleteConfirm() {
        setDeleteConfirmationOpen(false);
        const updatedTableData = tableData.filter(item => item !== attendenceRowData);
        setTableData(updatedTableData)
    }

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false)
    }

    function closeDialogbox() {
        setDialogbox(false)
        setIsEdit(false)
    }

    const csvHeaders = [
        { label: "empNo", key: "empNo" },
        { label: "dayType", key: "dayType" },
        { label: "dayOtHours", key: "dayOtHours" },
        { label: "nightOtHours", key: "nightOtHours" },
        { label: "doubleOtHours", key: "doubleOtHours" },
        { label: "isCashJob", key: "isCashJob" }
    ];

    const csvData = [
        {
            empNo: "", dayType: "", dayOtHours: "", nightOtHours: "", doubleOtHours: "", isCashJob: ""
        },
    ];

    const csvData2 = [
        {
            empNo: "1000", dayType: "full", dayOtHours: "0", nightOtHours: "0", doubleOtHours: "0", isCashJob: "no"
        },
        {
            empNo: "1001", dayType: "half", dayOtHours: "0", nightOtHours: "0", doubleOtHours: "0", isCashJob: "yes"
        },
    ];

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: attendanceBulkUpload.groupID,
                            factoryID: attendanceBulkUpload.factoryID,
                            mainDivisionID: attendanceBulkUpload.mainDivisionID,
                            date: attendanceBulkUpload.date,
                            musterChitID: attendanceBulkUpload.musterChitID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                mainDivisionID: Yup.number().required('Division is required').min("1", 'Division is required'),
                                date: Yup.date().required('Date is required').typeError('Invalid date'),
                                musterChitID: Yup.number().required('Muster Chit is required').min("1", 'Muster Chit is required'),
                            })
                        }
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
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={attendanceBulkUpload.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                            size='small'

                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="factoryID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={attendanceBulkUpload.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="mainDivisionID">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.mainDivisionID && errors.mainDivisionID)}
                                                            fullWidth
                                                            helperText={touched.mainDivisionID && errors.mainDivisionID}
                                                            name="mainDivisionID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={attendanceBulkUpload.mainDivisionID}
                                                            variant="outlined"
                                                            id="mainDivisionID"
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="date">
                                                            Date *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.date && errors.date)}
                                                            helperText={touched.date && errors.date}
                                                            fullWidth
                                                            size="small"
                                                            name="date"
                                                            type="date"
                                                            onChange={(e) => handleChange(e)}
                                                            value={attendanceBulkUpload.date}
                                                            variant="outlined"
                                                            id="date"
                                                            inputProps={{
                                                                max: maxDate,
                                                                min: minDateString
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="musterChitID">
                                                            Muster Chit No *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.musterChitID && errors.musterChitID)}
                                                            fullWidth
                                                            helperText={touched.musterChitID && errors.musterChitID}
                                                            name="musterChitID"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={attendanceBulkUpload.musterChitID}
                                                            variant="outlined"
                                                            id="musterChitID"
                                                        >
                                                            <MenuItem value={0}>--Select Muster Chit--</MenuItem>
                                                            {generateDropDownMenu(musterChitList)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="jobTypeID">
                                                            Job Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.jobTypeID && errors.jobTypeID)}
                                                            fullWidth
                                                            helperText={touched.jobTypeID && errors.jobTypeID}
                                                            name="jobTypeID"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={attendanceBulkUpload.jobTypeID}
                                                            variant="outlined"
                                                            id="jobTypeID"
                                                            InputProps={{ readOnly: true }}
                                                        >
                                                            <MenuItem value={'0'} >--Select Job Type--</MenuItem>
                                                            {generateDropDownMenu(SundryJobType)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="musterChitEmployeeCount">
                                                            Remaining Muster Chit Emp Count
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.musterChitEmployeeCount && errors.musterChitEmployeeCount)}
                                                            fullWidth
                                                            helperText={touched.musterChitEmployeeCount && errors.musterChitEmployeeCount}
                                                            name="musterChitEmployeeCount"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            value={FormDetails.musterChitEmployeeCount}
                                                            variant="outlined"
                                                            id="musterChitEmployeeCount"
                                                            type="text"
                                                            inputProps={{
                                                                readOnly: true
                                                            }}
                                                            disabled={true}
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink>
                                                            Select File *
                                                        </InputLabel>
                                                        <CSVReader
                                                            inputStyle={{ width: '100%', height: '56px' }}
                                                            cssClass="react-csv-input"
                                                            onFileLoaded={handleForce}
                                                            parserOptions={papaparseOptions}
                                                            inputId="react-csv-reader-input"
                                                            size='small'
                                                            disabled={
                                                                tableData.length !== 0 || attendanceBulkUpload.factoryID == '0' || attendanceBulkUpload.mainDivisionID == '0' || attendanceBulkUpload.musterChitID == '0'
                                                            }
                                                        />
                                                        {attendanceBulkUpload.factoryID == 0 && attendanceBulkUpload.mainDivisionID == 0 && (
                                                            <div style={{
                                                                color: "#f44336", marginLeft: "14px", marginRight: '14px', marginTop: "4px", fontSize: "0.75rem",
                                                                fontFamily: "Roboto"
                                                            }}>
                                                                Please select a Group, Estate & Division to enable file upload
                                                            </div>
                                                        )}
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <FormControlLabel
                                                            style={{ marginTop: '5%' }}
                                                            control={
                                                                <Switch
                                                                    checked={attendanceBulkUpload.isHoliday}
                                                                    onChange={(e) => isHolidayhandleChange(e)}
                                                                    name="isHoliday"
                                                                    disabled={
                                                                        tableData.length !== 0
                                                                    }
                                                                />
                                                            }
                                                            label="Is Holiday"
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Grid direction={{ xs: 'column', sm: 'row' }} style={{ marginTop: '10px' }}>
                                                    <Button variant="contained" color='primary' component="span" style={{ marginRight: '20px', backgroundColor: '#f5bf2c' }}>
                                                        <CSVLink
                                                            data={csvData}
                                                            headers={csvHeaders}
                                                            style={{ color: 'white', backgroundColor: '#f5bf2c' }}
                                                            filename={"Sundry Attendance Template.csv"}
                                                        >
                                                            Template
                                                        </CSVLink>
                                                    </Button>
                                                    <Button variant="contained" color='primary' component="span" style={{ backgroundColor: '#00ab55' }}>
                                                        <CSVLink
                                                            data={csvData2}
                                                            headers={csvHeaders}
                                                            style={{ color: 'white', backgroundColor: '#00ab55' }}
                                                            filename={"Sundry Attendance Sample Template.csv"}
                                                        >
                                                            Sample Data
                                                        </CSVLink>
                                                    </Button>
                                                </Grid>
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="reset"
                                                        variant="outlined"
                                                        onClick={() => clearData()}
                                                        size='small'
                                                    >
                                                        Clear
                                                    </Button>
                                                    <Button
                                                        style={{ marginLeft: '1%' }}
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        onClick={() => (trackPromise(saveEmployeeAttendance()))}
                                                        disabled={attendanceData.length == 0 || tableData.length !== 0}
                                                    >
                                                        Upload
                                                    </Button>
                                                </Box>
                                                <br />

                                                {attendanceData.length > 0 && IsUploadingFinished === true ?//if there are failed records display title
                                                    <CardHeader style={{ marginLeft: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                        title="Failed Records"
                                                    /> : null}
                                                {!isFailed ?
                                                    <Box minWidth={1050}>
                                                        {tableData.length > 0 ?
                                                            <MaterialTable
                                                                title="Multiple Actions Preview"
                                                                columns={[
                                                                    { title: 'Emp No', field: 'empNo' },
                                                                    { title: 'Emp Name', field: 'empName' },
                                                                    {
                                                                        title: 'Work Type', field: 'workType', lookup: {
                                                                            1: "Division labour",
                                                                            2: "Lent labor"
                                                                        }
                                                                    },
                                                                    { title: 'Attendance', field: 'manDays' },
                                                                    { title: 'Cash Job', field: 'isCashJob', render: rowData => rowData.isCashJob ? 'Yes' : 'No' },
                                                                ]}
                                                                data={tableData}
                                                                options={{
                                                                    exportButton: false,
                                                                    showTitle: false,
                                                                    headerStyle: { textAlign: "left", height: '1%' },
                                                                    cellStyle: { textAlign: "left" },
                                                                    columnResizable: false,
                                                                    actionsColumnIndex: -1,
                                                                    pageSize: 5
                                                                }}
                                                                actions={[
                                                                    {
                                                                        icon: 'edit',
                                                                        tooltip: 'Edit Attendance',
                                                                        onClick: (event, rowData) => EditEmployeeDetails(rowData)
                                                                    },
                                                                    {
                                                                        icon: 'delete',
                                                                        tooltip: 'Remove Attendance',
                                                                        onClick: (event, rowData) => { handleClickEdit(rowData) }
                                                                    }
                                                                ]}
                                                            /> : null}
                                                    </Box> :
                                                    <Box minWidth={1050}>
                                                        {tableData.length > 0 ?
                                                            <MaterialTable
                                                                title="Multiple Actions Preview"
                                                                columns={[
                                                                    { title: 'Emp No', field: 'empNo' },
                                                                    { title: 'Emp Name', field: 'empName' },
                                                                    {
                                                                        title: 'Work Type', field: 'workType', lookup: {
                                                                            1: "Division labour",
                                                                            2: "Lent labor"
                                                                        }
                                                                    },
                                                                    { title: 'Attendance', field: 'manDays' },
                                                                    { title: 'Cash Job', field: 'isCashJob', render: rowData => rowData.isCashJob ? 'Yes' : 'No' },
                                                                    { title: 'Reason', field: 'errorMessage' },
                                                                ]}
                                                                data={tableData}
                                                                options={{
                                                                    exportButton: false,
                                                                    showTitle: false,
                                                                    headerStyle: { textAlign: "left", height: '1%' },
                                                                    cellStyle: (rowData, dataIndex) => {
                                                                        if (isFailed) {
                                                                            return { backgroundColor: '#f7b7b2', textAlign: "left" };
                                                                        }
                                                                        return {};
                                                                    },
                                                                    columnResizable: false,
                                                                    actionsColumnIndex: -1,
                                                                    pageSize: 5
                                                                }}
                                                            /> : null}
                                                    </Box>}
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    {tableData.length > 0 && isFailed == false ?
                                                        <Button
                                                            style={{ marginLeft: '1%' }}
                                                            color="primary"
                                                            type="submit"
                                                            variant="contained"
                                                            onClick={() => (trackPromise(ProduceEmployeeAttendance()))}
                                                        >
                                                            Save
                                                        </Button> : tableData.length > 0 && isFailed == true ?
                                                            <Button
                                                                color="primary"
                                                                type="reset"
                                                                variant="outlined"
                                                                style={{ marginLeft: '1%' }}
                                                                onClick={() => (clearData())}
                                                            >
                                                                Clear
                                                            </Button> : null}
                                                </Box>
                                            </CardContent>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                    <Dialog
                        open={deleteConfirmationOpen}
                        onClose={handleCancelDelete}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle id="alert-dialog-slide-title">
                            <Typography
                                color="textSecondary"
                                gutterBottom
                                variant="h3">
                                <Box textAlign="center">
                                    Delete Confirmation
                                </Box>
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-slide-description">
                                <Typography variant="h4">Are you sure you want to delete this attendance ?</Typography>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <br />
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClickDeleteConfirm} color="primary" autoFocus>
                                Delete
                            </Button>
                            <Button onClick={handleCancelDelete} color="primary">
                                Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <div>
                        {dialogbox ?
                            <AddEditTable
                                dialogbox={dialogbox}
                                setDialogbox={setDialogbox}
                                isEdit={isEdit}
                                setIsEdit={setIsEdit}
                                closeDialogbox={closeDialogbox}
                                attendenceRowData={attendenceRowData}
                                tableData={tableData}
                                setTableData={setTableData}
                                updateConfirmation={updateConfirmation}
                                isHoliday={isHoliday}
                            />
                            : null
                        }
                    </div>
                </Container>
            </Page>
        </Fragment>
    )

}

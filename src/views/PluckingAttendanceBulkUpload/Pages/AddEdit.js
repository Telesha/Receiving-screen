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
    Switch,
    FormControlLabel,
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
import { Popup } from './Popup';

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

const screenCode = 'PLUCKINGATTENDANCEBULKUPLOAD';
export default function PluckingAttendanceBulkUpload(props) {
    const [title, setTitle] = useState("Plucking Attendance Bulk Upload")
    const classes = useStyles();
    const alert = useAlert();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [divisions, setDivisions] = useState();
    const [JobTypes, setJobTypes] = useState([]);
    const [musterChitList, setMusterChitList] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [fieldsForDropdown, setFieldsForDropDown] = useState([]);
    const [gridData, setGridData] = useState([]);
    const [employeeDetails, setEmployeeDetails] = useState([]);
    const [normDetails, setNormDetails] = useState([]);
    const [IsUploadingFinished, setIsUploadingFinished] = useState(false)
    const [isFailed, setIsFailed] = useState(false);
    const [attendenceRowData, setAttendenceRowData] = useState([])
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [initialMusterChitJobType, setInitialMusterChitJobType] = useState(0);
    const [dialogbox, setDialogbox] = useState(false);
    const [editDataSet, setEditDataSet] = useState();
    const [attendanceBulkUpload, setAttendanceBulkUpload] = useState({
        groupID: '0',
        factoryID: '0',
        mainDivisionID: '0',
        date: new Date().toISOString().substring(0, 10),
        musterChitID: '0',
        jobTypeID: '0'
    })

    const [FormDetails, setFormDetails] = useState({
        groupID: '0',
        estateID: '0',
        mainDivisionID: '0',
        divisionID: '0',
        collectedDate: new Date().toISOString().substring(0, 10),
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
        musterChitEmployeeCount: ''
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const currentDate = new Date();
    const maxDate = currentDate.toISOString().split('T')[0];
    const [minDate, setMinDate] = useState(new Date(currentDate));
    const minDateString = minDate.toISOString().split('T')[0];
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
    const navigate = useNavigate();

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), getJobTypesForDropDown());
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
            musterChitID: '0',
            jobTypeID: '0'
        })

        setFormDetails({
            ...FormDetails,
            musterChitEmployeeCount: ''
        })
    }, [attendanceBulkUpload.factoryID]);

    useEffect(() => {
        if (parseInt(attendanceBulkUpload.mainDivisionID) > 0) {
            trackPromise(getMusterChitDetailsByDateDivisionID());
        };

        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            musterChitID: '0',
            jobTypeID: '0'
        })

        setFormDetails({
            ...FormDetails,
            musterChitID: '0',
            jobTypeID: '0',
            musterChitEmployeeCount: ''
        })

    }, [attendanceBulkUpload.mainDivisionID, attendanceBulkUpload.date]);

    useEffect(() => {
        if (parseInt(attendanceBulkUpload.mainDivisionID) > 0) {
            trackPromise(GetEmployeeDetailsCheckrollAttendanceBulkUpload());
            getFieldDetailsByDivisionIDForDropdown();
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

    useEffect(() => {
        if (parseInt(attendanceBulkUpload.factoryID) > 0) {
            trackPromise(GetNormValueByEstateIDAndCollectedDate());
        };

    }, [attendanceBulkUpload.factoryID, FormDetails.fieldID, attendanceBulkUpload.date]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWPLUCKINGATTENDANCEBULKUPLOAD');

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

    async function getJobTypesForDropDown() {
        var response = await services.GetJobTypesForDropDown();
        setJobTypes(response);
    };

    async function getMusterChitDetailsByDateDivisionID() {
        var response = await services.getMusterChitDetailsByDateDivisionID(attendanceBulkUpload.mainDivisionID, attendanceBulkUpload.date);
        setMusterChitList(response);
    };

    async function getFieldDetailsByDivisionIDForDropdown() {
        var response = await services.getFieldDetailsByDivisionIDForDropdown(attendanceBulkUpload.mainDivisionID);
        setFieldsForDropDown(response);
    };

    async function GetNormValueByEstateIDAndCollectedDate() {
        var response = await services.GetNormValueByEstateIDAndCollectedDate(attendanceBulkUpload.factoryID, FormDetails.fieldID, attendanceBulkUpload.date);
        setNormDetails(response.data);
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
            divisionID: response.fieldID === 0 ? response.lentDivisionID : response.lentFieldID === 0 ? response.divisionID : 0,
            jobTypeID: response.pluckingJobTypeID,
            fieldID: response.fieldID === 0 ? response.lentFieldID : response.lentFieldID === 0 ? response.fieldID : 0,
            workTypeID: response.fieldID === 0 ? '2' : response.lentFieldID === 0 ? '1' : 0,
            lentEstateID: response.lentEstateID,
            musterChitEmployeeCount: response.updatedEmployeeCount
        });
        setInitialMusterChitJobType(response.pluckingJobTypeID)
        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            jobTypeID: response.pluckingJobTypeID
        })
    };

    function checkDayType(amount, minNorm, norm) {
        let day = 0;
        let daysValue = 0;
        if (parseFloat(amount) >= minNorm && parseFloat(amount) <= norm) {
            daysValue = "1"
        }
        else if (parseFloat(amount) >= norm) {
            if (parseFloat(amount) == 0 && norm == 0) {
                daysValue = "0"
                day = 0
            } else {
                daysValue = "1"
            }
        } else if (parseFloat(amount) >= norm / 2 && parseFloat(amount) < norm) {
            daysValue = "2"
        } else if (parseFloat(amount) == 0 && norm == 0) {
            daysValue = "0"
            day = 0
        } else if (parseFloat(amount) < (norm / 2)) {
            daysValue = "3"
            day = 0
        } else {
            if (amount == '' || amount == 0) {
                daysValue = "0"
                day = 0
            } else {
                daysValue = "2"
            }
        }

        return [day, daysValue]
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

    function calOverKilo(daysValue, norm, amount) {
        let day = 0;
        let overKilo = 0;
        if (FormDetails.isHoliday === true) {
            if (daysValue == '1' && (parseFloat(norm) < parseFloat(amount))) {
                overKilo = parseFloat(amount) - parseFloat(norm);
                day = 1.5
            }
            else if (daysValue == '2' && (parseFloat(norm) / 2 < parseFloat(amount))) {
                overKilo = (parseFloat(amount) - (parseFloat(norm) / 2));
                day = 0.75
            } else if (daysValue == '3' && (parseFloat(norm) / 2 > parseFloat(amount))) {
                overKilo = 0
                day = 0
            }
            else {
                if (daysValue == '1') {
                    overKilo = 0
                    day = 1.5
                } else if (daysValue == '2') {
                    overKilo = 0
                    day = 0.75
                }
                else {
                    overKilo = 0
                    day = 0
                }
            }
        } else {
            if (daysValue == '1' && (parseFloat(norm) < parseFloat(amount))) {
                overKilo = parseFloat(amount) - parseFloat(norm);
                day = 1
            }
            else if (daysValue == '2' && (parseFloat(norm) / 2 < parseFloat(amount))) {
                overKilo = (parseFloat(amount) - (parseFloat(norm) / 2));
                day = 0.5
            } else if (daysValue == '3' && (parseFloat(norm) / 2 > parseFloat(amount))) {
                overKilo = 0
                day = 0
            }
            else {
                if (daysValue == '1') {
                    overKilo = 0
                    day = 1
                } else if (daysValue == '2') {
                    overKilo = 0
                    day = 0.5
                }
                else {
                    overKilo = 0
                    day = 0
                }
            }
        }
        return [day, overKilo]
    }

    function getJobID(norm, amount) {
        let jobType = 0;
        if (initialMusterChitJobType == 3) {
            jobType = (amount < norm / 2) ? 5 : parseInt(FormDetails.jobTypeID)
        }
        else if (initialMusterChitJobType == 6) {
            jobType = (amount < norm / 2) ? 7 : parseInt(FormDetails.jobTypeID)
        }
        else if (initialMusterChitJobType == 8) {
            jobType = (amount < norm / 2) ? 5 : parseInt(FormDetails.jobTypeID)
        }
        else {
            jobType = parseInt(FormDetails.jobTypeID)
        }
        return [jobType];
    }


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

    async function saveEmployeeAttendance() {

        if (attendanceData.length <= FormDetails.musterChitEmployeeCount) {
            var successList = attendanceData.filter(x => (x.amount === '') || (x.empRegistrationNumber === ''))
            if (successList.length === 0) {
                let datarest = await Promise.all(attendanceData.map(async data => {

                    //Get employee data
                    const empData = employeeDetails.find((x) => x.registrationNumber == data.empRegistrationNumber)
                    if (empData == null) {
                        alert.error("Employee Register Number is wrong");
                    }
                    else {
                        //Get employee wise norm data
                        const newnormData = normDetails.filter((x) => x.jobTypeID == initialMusterChitJobType);
                        const normData = newnormData.find((x) => x.genderID == empData.genderID)
                        if (normData == null && (initialMusterChitJobType == 3 || initialMusterChitJobType == 6)) {
                            alert.error("Norm is not configured");
                        }
                        else {
                            let normValue = normData == null ? 0 : parseFloat(normData.normValue)
                            let minNormValue = normData == null ? 0 : parseFloat(normData.minNormValue)
                            //Check day type
                            const dayType = checkDayType(data.amount, minNormValue, normValue)
                            let days = dayType[0]
                            const daysValue = dayType[1]

                            //cal over kilo
                            const calOverKiloX = calOverKilo(daysValue, normValue, data.amount)
                            days = calOverKiloX[0]
                            const overKilo = calOverKiloX[1]

                            const job = getJobID(normValue, data.amount)
                            let jobID = job[0];
                            let dataobj = {
                                groupID: parseInt(attendanceBulkUpload.groupID),
                                estateID: parseInt(attendanceBulkUpload.factoryID),
                                divisionID: parseInt(FormDetails.divisionID),
                                collectedDate: (attendanceBulkUpload.date),
                                employeeTypeID: empData == null ? 0 : parseInt(empData.employeeTypeID),
                                jobTypeID: jobID,
                                workTypeID: parseInt(FormDetails.workTypeID),
                                employeeNumber: data.empRegistrationNumber,
                                amount: data.amount === '' ? parseFloat(0) : parseFloat(data.amount),
                                sessionID: 0,
                                fieldID: parseInt(FormDetails.fieldID),
                                gangID: 0,
                                dayType: normData == null ? 3 : parseFloat(daysValue),
                                dayOT: parseInt(FormDetails.jobTypeID) == 5 || parseInt(FormDetails.jobTypeID) == 7 ? parseInt(0) : parseInt(overKilo),
                                nightOT: 0,
                                createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
                                noam: normData == null ? 0 : parseFloat(normData.normValue),
                                minNorm: normData == null ? 0 : parseFloat(normData.minNormValue),
                                isActive: true,
                                isHoliday: parseFloat(daysValue) === 3 ? false : FormDetails.isHoliday,
                                musterChitID: parseInt(attendanceBulkUpload.musterChitID),
                                mainDivisionID: parseInt(attendanceBulkUpload.mainDivisionID),
                                operatorID: 0,
                                employeeName: empData == null ? "" : empData.employeeName,
                                manDays: parseInt(FormDetails.jobTypeID) == 3 ? parseFloat(days) : parseInt(FormDetails.jobTypeID) == 6 ? parseFloat(days) : parseInt(FormDetails.jobTypeID) == 8 ? parseFloat(days) : parseInt(0),
                                employeeID: empData == null ? 0 : empData.employeeID
                            }
                            return dataobj;
                        }
                    }
                }))
                var finalList = datarest.filter(x => x !== undefined)
                setGridData(finalList)
            } else {
                alert.error("Some Fields Are Empty In The Bulk File");
            }
        } else {
            alert.error("Muster Chit Employee Count Exceeded");
        }
    }

    async function saveEmployeeBulk() {
        const response = await services.SavePluckingCheckrollAttendanceBulkUpload(gridData);
        if (response.statusCode == "Success") {
            if (response.data.length > 0) {
                setGridData(response.data)
                alert.error("Few Records With Errors Are Not Saved")
                setIsUploadingFinished(true);
                setIsFailed(true)
                clearData();
                clearScreen();
                setAttendanceBulkUpload({
                    ...attendanceBulkUpload,
                    jobTypeID: 0
                })

            }
            else {
                alert.success(response.message);
                clearData();
                clearScreen();
                setAttendanceBulkUpload({
                    ...attendanceBulkUpload,
                    jobTypeID: 0
                })
            }
        }
        else {
            setGridData(response.data);
            alert.error(response.message);
            clearData();
            clearScreen();
            setAttendanceBulkUpload({
                ...attendanceBulkUpload,
                jobTypeID: 0
            })
        }
    }

    function updateConfirmation() {
        alert.success("Attendance Update Successfully");
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
    function isHolidayhandleChange(e) {
        const target = e.target
        const value = target.name === 'isHoliday' ? target.checked : target.value
        setFormDetails({
            ...FormDetails,
            [e.target.name]: value
        })
    }

    function clearScreen() {
        setAttendanceData([]);
        document.querySelector('.csv-input').value = '';
    }

    function clearData() {
        setIsUploadingFinished(false);
        setAttendanceData([]);
        setAttendanceBulkUpload({
            ...attendanceBulkUpload,
            mainDivisionID: '0',
            date: new Date().toISOString().substring(0, 10),
            musterChitID: '0',
        });
        setFormDetails({
            ...FormDetails,
            isHoliday: false,
            musterChitEmployeeCount: ''
        });
        setGridData([])
        setIsFailed(false);
    }

    async function handleClickDelete(rowData) {
        setAttendenceRowData(rowData);
        setDeleteConfirmationOpen(true);
    }

    async function handleClickEdit(rowData) {
        setAttendenceRowData(rowData)
        setDialogbox(true)
    }

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false)
    }

    async function handleClickDeleteConfirm() {
        setDeleteConfirmationOpen(false);
        const updatedGridData = gridData.filter(item => item !== attendenceRowData);
        setGridData(updatedGridData)
    }

    function openDialogbox(rowData) {
        setDialogbox(true)
        setEditDataSet(rowData)
    }

    function closeDialogbox() {
        setDialogbox(false)
    }

    const csvHeaders = [
        { label: "empRegistrationNumber", key: "empRegistrationNumber" },
        { label: "amount", key: "amount" }
    ];

    const csvData = [
        {
            empRegistrationNumber: "", amount: ""
        },
    ];

    const csvData2 = [
        {
            empRegistrationNumber: "1001", amount: "40"
        },
        {
            empRegistrationNumber: "1002", amount: "20"
        },
        {
            empRegistrationNumber: "1003", amount: "5"
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
                                                            inputProps={
                                                                { readOnly: gridData.length > 0 }
                                                            }

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
                                                            inputProps={
                                                                { readOnly: gridData.length > 0 }
                                                            }
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
                                                            inputProps={
                                                                { readOnly: gridData.length > 0 }
                                                            }
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
                                                            disabled={(gridData.length > 0) ? true : false}
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
                                                            inputProps={
                                                                { readOnly: gridData.length > 0 }
                                                            }
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
                                                            {generateDropDownMenu(JobTypes)}
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
                                                            disabled={
                                                                attendanceBulkUpload.factoryID != 0 && attendanceBulkUpload.mainDivisionID != 0 && attendanceBulkUpload.musterChitID != 0 && gridData.length == 0 ? false : true
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
                                                            style={{ marginTop: '25px' }}
                                                            control={
                                                                <Switch
                                                                    checked={FormDetails.isHoliday}
                                                                    onChange={(e) => isHolidayhandleChange(e)}
                                                                    name="isHoliday"
                                                                    disabled={(gridData.length > 0) || FormDetails.jobTypeID === 8 ? true : false}
                                                                />
                                                            }
                                                            label="Is Holiday"
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Grid direction={{ xs: 'column', sm: 'row' }} style={{ marginTop: '10px' }}>
                                                    <Button variant="contained" color='secondary' component="span" style={{ marginRight: '20px', backgroundColor: '#f5bf2c' }}>
                                                        <CSVLink
                                                            data={csvData}
                                                            headers={csvHeaders}
                                                            style={{ color: 'white', backgroundColor: '#f5bf2c' }}
                                                            filename={"Plucking Attendance Template.csv"}
                                                        >
                                                            Template
                                                        </CSVLink>
                                                    </Button>
                                                    <Button variant="contained" color='secondary' component="span" style={{ backgroundColor: '#00ab55' }}>
                                                        <CSVLink
                                                            data={csvData2}
                                                            headers={csvHeaders}
                                                            style={{ color: 'white', backgroundColor: '#00ab55' }}
                                                            filename={"Plucking Attendance Sample Template.csv"}
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
                                                        disabled={attendanceData.length == 0 || gridData.length !== 0}
                                                    >
                                                        Upload
                                                    </Button>
                                                </Box>
                                                <br />
                                                {attendanceData.length > 0 && IsUploadingFinished === true ?
                                                    <CardHeader style={{ marginLeft: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                                        title="Failed Records"
                                                    /> : null}
                                                {!isFailed ?
                                                    <Box minWidth={1050}>
                                                        {gridData.length > 0 ?
                                                            <MaterialTable
                                                                title="Multiple Actions Preview"
                                                                columns={[
                                                                    { title: 'Emp No', field: 'employeeNumber' },
                                                                    { title: 'Emp Name', field: 'employeeName' },
                                                                    {
                                                                        title: 'Job Type', field: 'jobTypeID'
                                                                        , render: rowData => JobTypes[rowData.jobTypeID]
                                                                    },
                                                                    {
                                                                        title: 'Field', field: 'fieldID'
                                                                        , render: rowData => fieldsForDropdown[rowData.fieldID]
                                                                    },
                                                                    { title: 'Amount (Kg) ', field: 'amount' },
                                                                    {
                                                                        title: 'Overkilo ', field: 'dayOT', render: rowData => rowData.dayOT === 0 ? '-' : rowData.dayOT
                                                                    },
                                                                    { title: 'Mandays ', field: 'manDays', render: rowData => rowData.manDays === 0 ? '-' : rowData.manDays },
                                                                ]}
                                                                data={gridData}
                                                                options={{
                                                                    exportButton: false,
                                                                    showTitle: false,
                                                                    headerStyle: { textAlign: "center", height: '1%' },
                                                                    cellStyle: { textAlign: "center" },
                                                                    columnResizable: false,
                                                                    actionsColumnIndex: -1
                                                                }}
                                                                actions={[
                                                                    {
                                                                        icon: 'edit',
                                                                        tooltip: 'Edit Attendance',
                                                                        onClick: (event, rowData) => handleClickEdit(rowData)
                                                                    },
                                                                    {
                                                                        icon: 'delete',
                                                                        tooltip: 'Remove record',
                                                                        onClick: (event, rowData) => { handleClickDelete(rowData) }
                                                                    },
                                                                ]}
                                                            />
                                                            : null}
                                                    </Box> :
                                                    <Box minWidth={1050}>
                                                        {gridData.length > 0 ?
                                                            <MaterialTable
                                                                title="Multiple Actions Preview"
                                                                columns={[
                                                                    { title: 'Emp No', field: 'employeeNumber' },
                                                                    { title: 'Emp Name', field: 'employeeName' },
                                                                    {
                                                                        title: 'Job Type', field: 'jobTypeID'
                                                                        , render: rowData => JobTypes[rowData.jobTypeID]
                                                                    },
                                                                    {
                                                                        title: 'Field', field: 'fieldID'
                                                                        , render: rowData => fieldsForDropdown[rowData.fieldID]
                                                                    },
                                                                    { title: 'Amount (Kg) ', field: 'amount' },
                                                                    {
                                                                        title: 'Overkilo ', field: 'dayOT', render: rowData => rowData.dayOT === 0 ? '-' : rowData.dayOT
                                                                    },
                                                                    { title: 'Mandays ', field: 'manDays', render: rowData => rowData.manDays === 0 ? '-' : rowData.manDays },
                                                                    { title: 'Reason', field: 'errorMessage' },
                                                                ]}
                                                                data={gridData}
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
                                                    {gridData.length > 0 && isFailed == false ?
                                                        <Button
                                                            style={{ marginLeft: '1%' }}
                                                            color="primary"
                                                            type="submit"
                                                            variant="contained"
                                                            onClick={() => (trackPromise(saveEmployeeBulk()))}
                                                        >
                                                            Save
                                                        </Button> : gridData.length > 0 && isFailed == true ?
                                                            <Button
                                                                color="primary"
                                                                type="reset"
                                                                variant="outlined"
                                                                style={{ marginLeft: '1%' }}
                                                                onClick={() => (clearData())}
                                                            >
                                                                Clear
                                                            </Button>
                                                            : null}
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
                </Container>
            </Page>
            {dialogbox ?
                <Popup
                    dialogbox={dialogbox}
                    setDialogbox={setDialogbox}
                    editDataSet={editDataSet}
                    closeDialogbox={closeDialogbox}
                    gridData={gridData}
                    setGridData={setGridData}
                    attendenceRowData={attendenceRowData}
                    updateConfirmation={updateConfirmation}
                    lentEstateID={FormDetails.lentEstateID}
                    employeeDetails={employeeDetails}
                    normDetails={normDetails}
                    initialMusterChitJobType={initialMusterChitJobType}
                    isHolidayValue={FormDetails.isHoliday}
                />
                : null
            }
        </Fragment>
    )

}

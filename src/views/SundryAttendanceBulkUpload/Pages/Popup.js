import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Grid, TextField, Button,
    CardContent, Divider, InputLabel, MenuItem,
    FormControlLabel, Slide, Dialog,
    DialogTitle, Typography, DialogContent, DialogContentText,
    Switch, Container
} from '@material-ui/core';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import moment from 'moment';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const screenCode = 'SUNDRYATTENDANCEBULKUPLOAD';

export const AddEditTable = ({ dialogbox, setDialogbox, isEdit, setIsEdit, closeDialogbox,
    tableData, attendenceRowData, setTableData, updateConfirmation, isHoliday }) => {
    const alert = useAlert();
    const handleClose = () => {
        setDialogbox(false);
        setIsEdit(false)
    };
    const navigate = useNavigate();
    const [GroupList, setGroupList] = useState([]);
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [jobCategories, setJobCategories] = useState([]);
    const [jobList, setJobList] = useState([]);
    const [fields, setFields] = useState([]);
    const [musterChit, SetMusterChit] = useState([])
    const [lentEstateName, setLentEstateName] = useState()
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [operators, setOperators] = useState([]);
    const [dailyCropDetail, setDailyCropDetail] = useState({
        groupID: 0,
        estateID: 0,
        mainDivisionID: 0,
        date: new Date().toISOString().substring(0, 10),
        employeeTypeID: '0',
        jobCategoryID: '0',
        jobID: '0',
        attendenceID: '0',
        empNo: null,
        workType: '0',
        fieldID: '0',
        dayOtHours: '0',
        nightOtHours: '0',
        doubleOtHours: '0',
        isTaskComplete: true,
        isHoliday: false,
        musterChitID: '0',
        divisionID: 0,
        isCashJob: false,
        operatorID: '0',
        empName: '',
        musterChitCount: 0,
        lentEstateID: '0',
        employeeNumber: '',
        empName: '',
        employeeTypeCheck: '0',
        manDays: 0
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    useEffect(() => {
        getPermission();
        getGroupsForDropdown();
        getEmployeeTypesForDropdown();
        getOperatorsForDropdown();
        getEstateDetailsByGroupID();
        getDivisionsForDropdown();
    }, [tableData]);

    useEffect(() => {
        setDailyCropDetail({
            ...dailyCropDetail,
            mainDivisionID: parseInt(attendenceRowData.mainDivisionID),
            date: (attendenceRowData.date),
            musterChitID: parseInt(attendenceRowData.musterChitID),
            workType: parseInt(attendenceRowData.workType),
            lentEstateID: attendenceRowData.lentEstateID,
            divisionID: parseInt(attendenceRowData.divisionID),
            fieldID: attendenceRowData.fieldID,
            jobCategoryID: attendenceRowData.jobCategoryID,
            jobID: attendenceRowData.jobID,
            employeeNumber: attendenceRowData.empNo,
            empName: attendenceRowData.empName,
            employeeTypeCheck: attendenceRowData.employeeTypeID,
            operatorID: attendenceRowData.operatorID,
            isHoliday: attendenceRowData.isHoliday,
            isCashJob: attendenceRowData.isCashJob,
            attendenceID: attendenceRowData.attendenceID,
            dayOtHours: attendenceRowData.dayOtHours,
            nightOtHours: attendenceRowData.nightOtHours,
            doubleOtHours: attendenceRowData.doubleOtHours,
            manDays: attendenceRowData.manDays
        })
    }, [dailyCropDetail.groupID]);

    useEffect(() => {
        if (dailyCropDetail.estateID !== 0) {
            getJobCategoryDetailsByEstateID();
        }
    }, [dailyCropDetail.estateID]);

    useEffect(() => {
        if (dailyCropDetail.jobCategoryID !== 0) {
            getJobCategoryByGroupIDEstateIDJobCategoryID();
        }
    }, [dailyCropDetail.jobCategoryID]);

    useEffect(() => {
        if (dailyCropDetail.divisionID > 0) {
            getFieldDetailsByDivisionID()
        }
    }, [dailyCropDetail.divisionID]);

    useEffect(() => {
        if (dailyCropDetail.mainDivisionID > 0) {
            getMusterChipForDropDown()
        }
    }, [dailyCropDetail.mainDivisionID, dailyCropDetail.date])

    useEffect(() => {
        DecideAttendanceType()
    }, [dailyCropDetail.isCashJob, dailyCropDetail.attendenceID]);

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

        setDailyCropDetail({
            ...dailyCropDetail,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getAllFactory();
        setEstates(response);
    };

    async function getDivisionsForDropdown() {
        var response = await services.getAllDivisionDetails();
        setDivisions(response);
    };

    async function getJobCategoryDetailsByEstateID() {
        var response = await services.getJobCategoryDetailsByEstateID(dailyCropDetail.estateID);
        setJobCategories(response);
    };

    async function getJobCategoryByGroupIDEstateIDJobCategoryID() {
        const response = await services.getJobCategoryByGroupIDEstateIDJobCategoryID(dailyCropDetail.groupID, dailyCropDetail.estateID, dailyCropDetail.jobCategoryID);
        setJobList(response);
    };

    async function getFieldDetailsByDivisionID() {
        var response = await services.getFieldDetailsByDivisionID(dailyCropDetail.divisionID);
        setFields(response);
    };

    async function getMusterChipForDropDown() {
        var responseAll = await services.getAllMusterChitDetailsByDivisionID(dailyCropDetail.mainDivisionID, moment(dailyCropDetail.date).format("YYYY-MM-DD"));
        if (responseAll.length > 0) {
            SetMusterChit(responseAll)
        }
    }

    async function getEmployeeTypesForDropdown() {
        const result = await services.GetEmployeeTypesData();
        setEmployeeTypes(result);
    }

    async function getOperatorsForDropdown() {
        const result = await services.getOperatorsForDropdown();
        setOperators(result);
    }

    function handleChangeOne(e) {
        const target = e.target;
        const value = target.value
        setDailyCropDetail({
            ...dailyCropDetail,
            [e.target.name]: value
        });
    }

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
            }
        }
        return items
    }

    async function saveNonPluckingAttendance(values) {
        const updatedTableData = tableData.map((rowData, index) => {
            if (index === attendenceRowData.tableData.id) {
                return {
                    ...rowData,
                    attendenceID: values.attendenceID,
                    dayOtHours: values.dayOtHours,
                    doubleOtHours: values.doubleOtHours,
                    nightOtHours: values.nightOtHours,
                    isCashJob: values.isCashJob,
                    operatorID: values.operatorID,
                    manDays: values.manDays
                };
            } else {
                return rowData;
            }
        });

        setTableData(updatedTableData);
        setDialogbox(false);

        updateConfirmation()
    }

    function handleDateChange(value) {
        setDailyCropDetail({
            ...dailyCropDetail,
            date: value
        });
    }

    function isCashJobhandleChange(e) {
        const target = e.target
        const value = target.name === 'isCashJob' ? target.checked : target.value
        setDailyCropDetail({
            ...dailyCropDetail,
            [e.target.name]: value
        })
    }

    function DecideAttendanceType() {
        if (dailyCropDetail.isCashJob) {
            if (parseInt(dailyCropDetail.attendenceID) == 1) {
                setDailyCropDetail({
                    ...dailyCropDetail,
                    manDays: 1,
                    isHoliday: false
                });
            } else {
                setDailyCropDetail({
                    ...dailyCropDetail,
                    manDays: 0.5,
                    isHoliday: false
                });
            }
        }
        else {
            if (isHoliday && dailyCropDetail.isCashJob == false) {
                if (parseInt(dailyCropDetail.attendenceID) == 1) {
                    setDailyCropDetail({
                        ...dailyCropDetail,
                        manDays: 1.5,
                        isHoliday: true
                    });
                }
                else {
                    setDailyCropDetail({
                        ...dailyCropDetail,
                        manDays: 0.75,
                        isHoliday: true
                    });
                }
            }
            else if ((parseInt(dailyCropDetail.attendenceID) == 1) && dailyCropDetail.isHoliday == true) {
                setDailyCropDetail({
                    ...dailyCropDetail,
                    manDays: 1.5
                });
            } else if ((parseInt(dailyCropDetail.attendenceID) == 2) && dailyCropDetail.isHoliday == true) {
                setDailyCropDetail({
                    ...dailyCropDetail,
                    manDays: 0.75
                });
            } else if (parseInt(dailyCropDetail.attendenceID) == 1) {
                setDailyCropDetail({
                    ...dailyCropDetail,
                    manDays: 1,
                    isHoliday: false
                });
            } else {
                setDailyCropDetail({
                    ...dailyCropDetail,
                    manDays: 0.5,
                    isHoliday: false
                });
            }
        }
    }

    return (
        <div>
            <Dialog
                fullWidth={true}
                maxWidth="lg"
                open={dialogbox}
                onBackdropClick="false"
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle id="alert-dialog-slide-title">
                    <Typography
                        color="textSecondary"
                        gutterBottom
                        variant="h3"
                    >
                        <Box textAlign="left" >
                            Update Sundry Attendance
                        </Box>
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        <Container>
                            <Formik
                                initialValues={{
                                    groupID: dailyCropDetail.groupID,
                                    estateID: dailyCropDetail.estateID,
                                    divisionID: dailyCropDetail.divisionID,
                                    mainDivisionID: dailyCropDetail.mainDivisionID,
                                    date: dailyCropDetail.date,
                                    employeeTypeID: dailyCropDetail.employeeTypeID,
                                    jobCategoryID: dailyCropDetail.jobCategoryID,
                                    jobID: dailyCropDetail.jobID,
                                    workType: dailyCropDetail.workType,
                                    fieldID: dailyCropDetail.fieldID,
                                    attendenceID: dailyCropDetail.attendenceID,
                                    dayOtHours: dailyCropDetail.dayOtHours,
                                    nightOtHours: dailyCropDetail.nightOtHours,
                                    doubleOtHours: dailyCropDetail.doubleOtHours,
                                    empNo: dailyCropDetail.employeeNumber,
                                    isHoliday: dailyCropDetail.isHoliday,
                                    musterChitID: dailyCropDetail.musterChitID,
                                    isCashJob: dailyCropDetail.isCashJob,
                                    operatorID: dailyCropDetail.operatorID,
                                    empName: dailyCropDetail.empName,
                                    lentEstateID: dailyCropDetail.lentEstateID,
                                    manDays: dailyCropDetail.manDays
                                }}
                                validationSchema={
                                    Yup.object().shape({
                                        attendenceID: Yup.number().required('Attendance is required').min(1, 'Attendance is required'),
                                        dayOtHours: Yup.number()
                                            .test('is-decimal', 'Please enter a positive number with exactly one decimal place', value => (value === undefined || /^\d+(\.\d{1})?$/.test(value)))
                                            .test('max-hours', 'Normal OT should be less than or equal to 24', value => value === undefined || value <= 24),
                                        nightOtHours: Yup.number()
                                            .test('is-decimal', 'Please enter a positive number with exactly one decimal place', value => (value === undefined || /^\d+(\.\d{1})?$/.test(value)))
                                            .test('max-hours', 'Night OT should be less than or equal to 24', value => value === undefined || value <= 24),
                                        doubleOtHours: Yup.number()
                                            .test('is-decimal', 'Please enter a positive number with exactly one decimal place', value => (value === undefined || /^\d+(\.\d{1})?$/.test(value)))
                                            .test('max-hours', 'Sunday OT should be less than or equal to 24', value => value === undefined || value <= 24),
                                    })
                                }
                                onSubmit={(values) => saveNonPluckingAttendance(values)}
                                enableReinitialize
                            >
                                {({
                                    errors,
                                    handleBlur,
                                    handleChange,
                                    handleSubmit,
                                    isSubmitting,
                                    touched,
                                    values,
                                    props
                                }) => (
                                    <form onSubmit={handleSubmit}>
                                        <Box mt={0}>
                                            <PerfectScrollbar>
                                                <Divider />
                                                <CardContent>
                                                    <Grid container spacing={3} style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="groupID">
                                                                Group *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.groupID && errors.groupID)}
                                                                fullWidth
                                                                helperText={touched.groupID && errors.groupID}
                                                                name="groupID"
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChangeOne(e)}
                                                                value={dailyCropDetail.groupID}
                                                                variant="outlined"
                                                                size='small'
                                                                id="groupID"
                                                                inputProps={{
                                                                    readOnly: !permissionList.isGroupFilterEnabled
                                                                }}
                                                                disabled={true}
                                                            >
                                                                <MenuItem value="0">--Select Group--</MenuItem>
                                                                {generateDropDownMenu(GroupList)}
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
                                                                name="estateID"
                                                                onBlur={handleBlur}
                                                                onChange={(e) => handleChangeOne(e)}
                                                                value={dailyCropDetail.estateID}
                                                                variant="outlined"
                                                                size='small'
                                                                id="estateID"
                                                                inputProps={{
                                                                    readOnly: !permissionList.isFactoryFilterEnabled
                                                                }}
                                                                disabled={true}
                                                            >
                                                                <MenuItem value="0">--Select Estate--</MenuItem>
                                                                {generateDropDownMenu(estates)}
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="mainDivisionID">
                                                                Division *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.mainDivisionID && errors.mainDivisionID)}
                                                                fullWidth
                                                                helperText={touched.mainDivisionID && errors.mainDivisionID}
                                                                name="mainDivisionID"
                                                                size='small'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => {
                                                                    handleChangeOne(e);
                                                                }}
                                                                value={dailyCropDetail.mainDivisionID}
                                                                variant="outlined"
                                                                id="mainDivisionID"
                                                                disabled={true}
                                                            >
                                                                <MenuItem value={0}>--Select Division--</MenuItem>
                                                                {generateDropDownMenu(divisions)}
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="date">
                                                                Date *
                                                            </InputLabel>
                                                            <TextField
                                                                error={Boolean(touched.date && errors.date)}
                                                                helperText={touched.date && errors.date}
                                                                fullWidth
                                                                size='small'
                                                                name="date"
                                                                type="date"
                                                                onChange={(e) => handleChangeOne(e)}
                                                                value={dailyCropDetail.date}
                                                                variant="outlined"
                                                                id="date"
                                                                inputProps={{
                                                                    max: new Date().toISOString().split('T')[0]
                                                                }}
                                                                disabled={true}
                                                            />
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="musterChitID">
                                                                Muster Chit *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.musterChitID && errors.musterChitID)}
                                                                fullWidth
                                                                helperText={touched.musterChitID && errors.musterChitID}
                                                                name="musterChitID"
                                                                size='small'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => {
                                                                    handleChangeOne(e);
                                                                }}
                                                                value={dailyCropDetail.musterChitID}
                                                                variant="outlined"
                                                                id="musterChitID"
                                                                disabled={true}
                                                            >
                                                                <MenuItem value={0}>--Select Muster Chit --</MenuItem>
                                                                {generateDropDownMenu(musterChit)}
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="workType">
                                                                Labour Type *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.workType && errors.workType)}
                                                                fullWidth
                                                                helperText={touched.workType && errors.workType}
                                                                name="workType"
                                                                onBlur={handleBlur}
                                                                size='small'
                                                                value={dailyCropDetail.workType}
                                                                variant="outlined"
                                                                id="workType"
                                                                onChange={(e) => handleChangeOne(e)}
                                                                inputProps={{
                                                                    readOnly: true
                                                                }}
                                                                disabled={true}
                                                            >
                                                                <MenuItem value={'0'} >--Select Labour Type--</MenuItem>
                                                                <MenuItem value={'1'} >Division Labour</MenuItem>
                                                                <MenuItem value={'2'} >Lent Labour</MenuItem>
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="lentEstateID">
                                                                Lent Estate *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.lentEstateID && errors.lentEstateID)}
                                                                fullWidth
                                                                helperText={touched.lentEstateID && errors.lentEstateID}
                                                                name="lentEstateID"
                                                                size='small'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => {
                                                                    handleChangeOne(e);
                                                                }}
                                                                value={dailyCropDetail.lentEstateID}
                                                                variant="outlined"
                                                                id="lentEstateID"
                                                                inputProps={{
                                                                    readOnly: true
                                                                }}
                                                                disabled={true}
                                                            >
                                                                <MenuItem value={0}>--Select Division--</MenuItem>
                                                                {generateDropDownMenu(lentEstateName)}
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
                                                                name="divisionID"
                                                                size='small'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => {
                                                                    handleChangeOne(e);
                                                                }}
                                                                value={dailyCropDetail.divisionID}
                                                                variant="outlined"
                                                                id="divisionID"
                                                                disabled={true}
                                                                inputProps={{
                                                                    readOnly: true
                                                                }}
                                                            >
                                                                <MenuItem value={0}>--Select Division--</MenuItem>
                                                                {generateDropDownMenu(divisions)}
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="fieldID">
                                                                Field *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.fieldID && errors.fieldID)}
                                                                fullWidth
                                                                helperText={touched.fieldID && errors.fieldID}
                                                                name="fieldID"
                                                                onBlur={handleBlur}
                                                                size='small'
                                                                onChange={(e) => {
                                                                    handleChangeOne(e)
                                                                }}
                                                                value={dailyCropDetail.fieldID}
                                                                variant="outlined"
                                                                id="fieldID"
                                                                inputProps={{
                                                                    readOnly: true
                                                                }}
                                                                disabled={true}
                                                            >
                                                                <MenuItem value='0'>--Select Field--</MenuItem>
                                                                {generateDropDownMenu(fields)}
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="jobCategoryID">
                                                                Job Category *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.jobCategoryID && errors.jobCategoryID)}
                                                                fullWidth
                                                                helperText={touched.jobCategoryID && errors.jobCategoryID}
                                                                name="jobCategoryID"
                                                                onBlur={handleBlur}
                                                                size='small'
                                                                onChange={(e) => handleChangeOne(e)}
                                                                value={dailyCropDetail.jobCategoryID}
                                                                variant="outlined"
                                                                id="jobCategoryID"
                                                                inputProps={{
                                                                    readOnly: true
                                                                }}
                                                                disabled={true}
                                                            >
                                                                <MenuItem value={'0'}>--Select Job Category--</MenuItem>
                                                                {generateDropDownMenu(jobCategories)}
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="jobID">
                                                                Job *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.jobID && errors.jobID)}
                                                                fullWidth
                                                                helperText={touched.jobID && errors.jobID}
                                                                name="jobID"
                                                                onBlur={handleBlur}
                                                                size='small'
                                                                onChange={(e) => handleChangeOne(e)}
                                                                value={dailyCropDetail.jobID}
                                                                variant="outlined"
                                                                id="jobID"
                                                                inputProps={{
                                                                    readOnly: true
                                                                }}
                                                                disabled={true}
                                                            >
                                                                <MenuItem value={'0'} disabled={true}>--Select Job--</MenuItem>
                                                                {generateDropDownMenu(jobList)}
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="empNo">
                                                                Emp No *
                                                            </InputLabel>
                                                            <TextField
                                                                error={Boolean(touched.empNo && errors.empNo)}
                                                                fullWidth
                                                                helperText={touched.empNo && errors.empNo}
                                                                name="empNo"
                                                                onBlur={handleBlur}
                                                                size='small'
                                                                onChange={(e) => handleChangeOne(e)}
                                                                value={dailyCropDetail.employeeNumber}
                                                                variant="outlined"
                                                                id="empNo"
                                                                type="text"
                                                                disabled={true}
                                                            >
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="empName">
                                                                Emp Name *
                                                            </InputLabel>
                                                            <TextField
                                                                error={Boolean(touched.empName && errors.empName)}
                                                                fullWidth
                                                                helperText={touched.empName && errors.empName}
                                                                name="empName"
                                                                onBlur={handleBlur}
                                                                size='small'
                                                                onChange={(e) => handleChangeOne(e)}
                                                                value={dailyCropDetail.empName}
                                                                variant="outlined"
                                                                id="empName"
                                                                type="text"
                                                                inputProps={{
                                                                    readOnly: true
                                                                }}
                                                                disabled={true}
                                                            >
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="employeeTypeID">
                                                                Employee Type *
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.employeeTypeID && errors.employeeTypeID)}
                                                                fullWidth
                                                                helperText={touched.employeeTypeID && errors.employeeTypeID}
                                                                name="employeeTypeID"
                                                                onBlur={handleBlur}
                                                                value={dailyCropDetail.employeeTypeCheck}
                                                                variant="outlined"
                                                                size='small'
                                                                id="employeeTypeID"
                                                                onChange={(e) => handleChangeOne(e)}
                                                                inputProps={{
                                                                    readOnly: true
                                                                }}
                                                                disabled={true}
                                                            >
                                                                <MenuItem value={'0'}>--Select Employee Type--</MenuItem>
                                                                {generateDropDownMenu(employeeTypes)}
                                                            </TextField>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="operatorID">
                                                                Operator
                                                            </InputLabel>
                                                            <TextField select
                                                                error={Boolean(touched.operatorID && errors.operatorID)}
                                                                fullWidth
                                                                helperText={touched.operatorID && errors.operatorID}
                                                                name="operatorID"
                                                                onBlur={handleBlur}
                                                                value={dailyCropDetail.operatorID}
                                                                variant="outlined"
                                                                size='small'
                                                                id="operatorID"
                                                                onChange={(e) => handleChangeOne(e)}
                                                                disabled={true}
                                                            >
                                                                <MenuItem value={'0'}>--Select Operator--</MenuItem>
                                                                {generateDropDownMenu(operators)}
                                                            </TextField>
                                                        </Grid>
                                                    </Grid>
                                                    <Grid container spacing={3}>
                                                        <Grid item md={3} xs={12}>
                                                            <FormControlLabel
                                                                style={{ marginTop: '25px' }}
                                                                control={
                                                                    <Switch
                                                                        checked={dailyCropDetail.isHoliday}
                                                                        name="isHoliday"
                                                                        disabled={true}
                                                                    />
                                                                }
                                                                label="Is Holiday"
                                                            />
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <FormControlLabel
                                                                style={{ marginTop: '25px' }}
                                                                control={
                                                                    <Switch
                                                                        checked={dailyCropDetail.isCashJob}
                                                                        onChange={(e) => isCashJobhandleChange(e)}
                                                                        name="isCashJob"
                                                                    />
                                                                }
                                                                label="Is CashJob"
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                                <>
                                                    <Divider />
                                                    <CardContent>
                                                        <Grid container spacing={3} style={{ marginTop: '5px', marginBottom: '5px' }}>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="attendenceID">
                                                                    Attendance *
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.attendenceID && errors.attendenceID)}
                                                                    fullWidth
                                                                    helperText={touched.attendenceID && errors.attendenceID}
                                                                    name="attendenceID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChangeOne(e)}
                                                                    size='small'
                                                                    value={dailyCropDetail.attendenceID}
                                                                    variant="outlined"
                                                                    id="attendenceID"
                                                                >
                                                                    <MenuItem value="0">--Attendance--</MenuItem>
                                                                    <MenuItem value="1">Full Day</MenuItem>
                                                                    <MenuItem value="2">Half Day</MenuItem>
                                                                </TextField>
                                                            </Grid>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="dayOtHours">
                                                                    Normal OT
                                                                </InputLabel>
                                                                <TextField
                                                                    error={Boolean(touched.dayOtHours && errors.dayOtHours)}
                                                                    fullWidth
                                                                    helperText={touched.dayOtHours && errors.dayOtHours}
                                                                    name="dayOtHours"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChangeOne(e)}
                                                                    size='small'
                                                                    value={dailyCropDetail.dayOtHours}
                                                                    disabled={dailyCropDetail.isHoliday}
                                                                    variant="outlined"
                                                                    id="dayOtHours"
                                                                    type="text"
                                                                >
                                                                </TextField>
                                                            </Grid>

                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="nightOtHours">
                                                                    Night OT Hours
                                                                </InputLabel>
                                                                <TextField
                                                                    error={Boolean(touched.nightOtHours && errors.nightOtHours)}
                                                                    fullWidth
                                                                    helperText={touched.nightOtHours && errors.nightOtHours}
                                                                    name="nightOtHours"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChangeOne(e)}
                                                                    size='small'
                                                                    value={dailyCropDetail.nightOtHours}
                                                                    disabled={dailyCropDetail.isHoliday}
                                                                    variant="outlined"
                                                                    id="nightOtHours"
                                                                    type="text"
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="doubleOtHours">
                                                                    Sunday OT
                                                                </InputLabel>
                                                                <TextField
                                                                    error={Boolean(touched.doubleOtHours && errors.doubleOtHours)}
                                                                    fullWidth
                                                                    helperText={touched.doubleOtHours && errors.doubleOtHours}
                                                                    name="doubleOtHours"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChangeOne(e)}
                                                                    size='small'
                                                                    value={dailyCropDetail.doubleOtHours}
                                                                    disabled={dailyCropDetail.isCashJob}
                                                                    variant="outlined"
                                                                    id="doubleOtHours"
                                                                    type="text"
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                        </Grid>
                                                    </CardContent>
                                                </>
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="button"
                                                        variant="outlined"
                                                        onClick={() => { closeDialogbox(); handleClose(); }}
                                                    >
                                                        Close
                                                    </Button>
                                                    &nbsp;
                                                    &nbsp;
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        {"Update"}
                                                    </Button>
                                                </Box>
                                            </PerfectScrollbar>
                                        </Box>
                                    </form>
                                )}
                            </Formik>
                        </Container>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </div>
    );
}

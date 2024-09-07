import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
    FormControlLabel, Switch, Dialog, DialogTitle, Typography, DialogContent, DialogContentText, DialogActions, Chip, SvgIcon
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useNavigate, useParams } from 'react-router-dom';
import { useAlert } from "react-alert";
import MaterialTable from "material-table";
import tokenDecoder from '../../../utils/tokenDecoder';
import moment from 'moment';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

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
    colorCancel: {
        backgroundColor: "red",
    },
    colorRecord: {
        backgroundColor: "green",
    },

}));

const screenCode = 'ATTENDENCENONPLUCKING';

export default function SundryAttendancesAddingEditing() {
    const [title, setTitle] = useState("Attendance - Sundry");
    const classes = useStyles();
    const [dailyCropDetail, setDailyCropDetail] = useState({
        groupID: 0,
        estateID: 0,
        mainDivisionID: 0,
        date: new Date().toISOString().substring(0, 10),
        employeeTypeID: '0',
        jobCategoryID: '0',
        jobID: '0',
        attendenceID: '1',
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
        employeeAttendanceID: 0
    });
    const [IsAddButtonDisable, setIsAddButtonDisable] = useState(false);
    const [GroupList, setGroupList] = useState([]);
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [jobCategories, setJobCategories] = useState([]);
    const [jobList, setJobList] = useState([]);
    const [fields, setFields] = useState([]);
    const [musterChit, SetMusterChit] = useState([])
    const [operators, setOperators] = useState([]);
    const [employeeNumber, setEmployeeNumber] = useState(null)
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [attendenceData, setAttendenceData] = useState([]);
    const [employeeTypeCheck, setEmployeeTypeCheck] = useState(0);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [dailySundryAttendanceID, setDailySundryAttendanceDetailID] = useState(0);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [enterBtnConfirm, setEnterBtnConfirm] = useState(false)
    const [isSunday, setIsSunday] = useState(false);
    const [attendenceRowData, setAttendenceRowData] = useState([])
    const [empName, setEmpName] = useState('');
    const [employeeID, setEmployeeID] = useState('')
    const [musterCount, SetMusterCount] = useState(0)
    const [increaseCount, setIncreaseCount] = useState(0)
    const [attendenceCount, setAttendenceCount] = useState(0)
    const [manDays, setManDays] = useState(0)
    const [lentEstateName, setLentEstateName] = useState()
    const navigate = useNavigate();
    const alert = useAlert();
    const { dailySundryAttendanceDetailID } = useParams();
    const empNoRef = useRef(null)
    const normalOTRef = useRef(null)
    const nightOTRef = useRef(null)
    const sundayOTRef = useRef(null)
    const enterBtnRef = useRef(null)
    const currentDate = new Date();
    const maxDate = currentDate.toISOString().split('T')[0];
    const [minDate, setMinDate] = useState(new Date(currentDate));
    const minDateString = minDate.toISOString().split('T')[0];
    let decrypted = 0;

    useEffect(() => {
        decrypted = atob(dailySundryAttendanceDetailID.toString());
        if (decrypted != 0) {
            setDailySundryAttendanceDetailID(decrypted)
            trackPromise(getNonPluckingAttendenceDetails(decrypted));
        }
        trackPromise(getPermission());
        trackPromise(getGroupsForDropdown());
        trackPromise(getEmployeeTypesForDropdown());
        trackPromise(getOperatorsForDropdown());
    }, []);

    useEffect(() => {
        if (dailyCropDetail.groupID != 0) {
            trackPromise(
                getEstateDetailsByGroupID());
        };
    }, [dailyCropDetail.groupID]);

    useEffect(() => {
        if (dailyCropDetail.estateID != 0) {
            trackPromise(
                getDivisionsForDropdown()
            )
        }
    }, [dailyCropDetail.estateID]);

    useEffect(() => {
        if (dailyCropDetail.divisionID != 0) {
            trackPromise(
                getFieldDetailsByDivisionID()
            )
        }
    }, [dailyCropDetail.divisionID]);

    useEffect(() => {
        if (employeeNumber > 0) {
            trackPromise(
                getEmployeeypeByEmpNo(),
                GetEmpNameByEmpNo()
            )
            setEmpName('')
            setEmployeeID('')
            setEmployeeTypeCheck(0)
        }
    }, [employeeNumber]);

    useEffect(() => {
        if (dailyCropDetail.estateID !== 0) {
            getJobCategoryDetailsByEstateID();
        }
    }, [dailyCropDetail.estateID]);

    useEffect(() => {
        if (dailyCropDetail.mainDivisionID > 0) {
            trackPromise(
                getAttendanceExecutionDate());
        };
    }, [dailyCropDetail.mainDivisionID]);

    useEffect(() => {
        if (dailyCropDetail.jobCategoryID !== 0) {
            getJobCategoryByGroupIDEstateIDJobCategoryID();
        }
    }, [dailyCropDetail.jobCategoryID]);

    useEffect(() => {
        if (!isUpdate) {
            setDailyCropDetail((prevent) => ({
                ...prevent,
                musterChitID: '0',
                divisionID: 0,
                workType: '0',
                fieldID: '0',
                jobID: '0',
                jobCategoryID: '0',
                employeeTypeID: '0',
                lentEstateID: '0'
            }))
            SetMusterChit([]);
        }
        if (dailyCropDetail.mainDivisionID > 0) {
            getMusterChipForDropDown()
        }
    }, [dailyCropDetail.mainDivisionID, dailyCropDetail.date])

    useEffect(() => {
        if (dailyCropDetail.musterChitID != 0) {
            GetSundryDetailsByMusterChitID();
        }
    }, [dailyCropDetail.musterChitID])

    useEffect(() => {
        if (dailyCropDetail.musterChitID != 0) {
            GetMusterChitCountByMusterID();
        }
    }, [dailyCropDetail.musterChitID, employeeNumber, increaseCount])

    useEffect(() => {
        if (!isUpdate) {
            setEmployeeNumber('')
            setEmployeeTypeCheck(0)
        }
    }, [dailyCropDetail.musterChitID])

    useEffect(() => {
        if (!isUpdate) {
            setDailyCropDetail((prevent) => ({
                ...prevent,
                musterChitID: '0',
                divisionID: 0,
                workType: '0',
                fieldID: '0',
                jobID: '0',
                jobCategoryID: '0',
                employeeTypeID: '0',
                lentEstateID: '0'
            }))
            CheckSundays();
        }
    }, [dailyCropDetail.date])

    useEffect(() => {
        if (!isUpdate && dailyCropDetail.estateID != 0) {
            CheckIsholidayValidationSundry();
        }
    }, [dailyCropDetail.date, dailyCropDetail.estateID])

    useEffect(() => {
        if (!isUpdate) {
            setDailyCropDetail((prevent) => ({
                ...prevent,
                attendenceID: '1',
                dayOtHours: '0',
                nightOtHours: '0',
                doubleOtHours: '0',
            }))
        }
    }, [dailyCropDetail.isHoliday])

    useEffect(() => {
        if (dailyCropDetail.lentEstateID > 0) {
            getLentEstateNameByLentEstateID();
        }
    }, [dailyCropDetail.lentEstateID])

    useEffect(() => {
        if (!isUpdate) {
            setDailyCropDetail((prevent) => ({
                ...prevent,
                workType: '0',
                lentEstateID: '0',
                jobCategoryID: '0',
                jobID: '0'
            }));

        }
    }, [dailyCropDetail.musterChitID]);

    useEffect(() => {
        if (dailyCropDetail.isHoliday === true && isUpdate != true) {
            setDailyCropDetail((prevent) => ({
                ...prevent,
                isCashJob: false
            }))
        }
    }, [dailyCropDetail.isHoliday])

    useEffect(() => {
        if (dailyCropDetail.isCashJob === true && isUpdate != true) {
            setDailyCropDetail((prevent) => ({
                ...prevent,
                isHoliday: false
            }))
        }
    }, [dailyCropDetail.isCashJob])

    useEffect(() => {
        if (isUpdate) {
            updateManDaySetting();
        }
    }, [dailyCropDetail.attendenceID, isUpdate])

    useEffect(() => {
        if (isUpdate) {
            isEditable();
        }
    }, [minDate]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITATTENDENCENONPLUCKING');

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

        setDailyCropDetail((prevent) => ({
            ...prevent,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        }))
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroupList(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstatesByGroupID(dailyCropDetail.groupID);
        setEstates(response);
    };

    async function getDivisionsForDropdown() {
        var response = await services.getDivisionDetailsByEstateID(dailyCropDetail.estateID);
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

    async function getEmployeeTypesForDropdown() {
        const result = await services.GetEmployeeTypesData();
        setEmployeeTypes(result);
    }

    async function getOperatorsForDropdown() {
        const result = await services.getOperatorsForDropdown();
        setOperators(result);
    }

    async function getLentEstateNameByLentEstateID() {
        const result = await services.getLentEstateNameByLentEstateID(dailyCropDetail.lentEstateID)
        setLentEstateName(result);
    }

    async function getMusterChipForDropDown() {
        if (isUpdate) {
            var responseAll = await services.getAllMusterChitDetailsByDivisionID(dailyCropDetail.mainDivisionID, moment(dailyCropDetail.date).format("YYYY-MM-DD"));
            if (responseAll.length > 0) {
                SetMusterChit(responseAll)
            }
        } else {
            var response = await services.getMusterChitDetailsByDivisionID(dailyCropDetail.mainDivisionID, moment(dailyCropDetail.date).format("YYYY-MM-DD"));
            if (response.length > 0) {
                SetMusterChit(response)
            }
        }
    }

    async function getEmployeeypeByEmpNo() {
        var responseEmpType = await services.getSundryAttendanceEmptypeDetail(employeeNumber, dailyCropDetail.mainDivisionID);
        if (responseEmpType) {
            setDailyCropDetail((prevent) => ({
                ...prevent,
                employeeTypeID: responseEmpType.employeeTypeID
            }))
        }
        setEmployeeTypeCheck(responseEmpType.employeeTypeID);
    }

    async function GetEmpNameByEmpNo() {
        var response = await services.GetEmpNameByEmpNo(employeeNumber, dailyCropDetail.mainDivisionID)
        if (response) {
            setDailyCropDetail((prevent) => ({
                ...prevent,
                empName: response.employeeName
            }))
            setEmpName(response.employeeName);
            setEmployeeID(response.employeeID);
        }
    }

    function timeout(delay) {
        return new Promise(res => setTimeout(res, delay));
    }

    async function getNonPluckingAttendenceDetails(dailySundryAttendanceDetailID) {
        await timeout(1000);
        let response = await services.getNonPluckingAttendenceDetails(dailySundryAttendanceDetailID);
        setIsUpdate(true)
        setDailyCropDetail((prevent) => ({
            ...prevent,
            groupID: response.groupID,
            estateID: response.estateID,
            divisionID: response.divisionID,
            date: response.attendedDate.split('T')[0],
            employeeTypeID: response.employeeTypeID.toString(),
            jobCategoryID: response.jobCategoryID.toString(),
            jobID: response.jobID.toString(),
            attendenceID: response.dayType.toString(),
            empNo: response.registrationNumber,
            workType: response.workTypeID.toString(),
            fieldID: response.fieldID.toString(),
            dayOtHours: response.dayOT.toString(),
            nightOtHours: response.nightOT.toString(),
            doubleOtHours: response.doubleOT.toString(),
            isTaskComplete: true,
            isHoliday: response.isHoliday,
            musterChitID: response.musterChitID.toString(),
            mainDivisionID: response.mainDivisionID.toString(),
            isCashJob: response.isCashJob,
            operatorID: response.operatorID,
            employeeAttendanceID: response.employeeAttendanceID
        }))
        setEmployeeNumber(response.registrationNumber)
        setTitle("Edit Attendance - Sundry")
    }

    async function CheckIsholidayValidationSundry() {
        let response = await services.CheckIsholidayValidationSundry(moment(dailyCropDetail.date).format("YYYY-MM-DD"), dailyCropDetail.estateID);
    }

    function CheckSundays() {
        const today = new Date(dailyCropDetail.date);
        const dayOfWeek = today.getDay();
        setIsSunday(dayOfWeek === 0);
        if (!isUpdate) {
            setDailyCropDetail((prevent) => ({
                ...prevent,
                isHoliday: dayOfWeek === 0
            }))
        }
    }

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items;
    }

    async function getAttendanceExecutionDate() {
        const result = await services.getAttendanceExecutionDate(
            dailyCropDetail.groupID,
            dailyCropDetail.estateID,
            dailyCropDetail.mainDivisionID
        );

        const newMinDate = new Date(currentDate);
        newMinDate.setDate(currentDate.getDate() - (result.dayCount));
        setMinDate(newMinDate);
    }

    async function SaveEmployeeSundry() {
        if (isUpdate) {
            let updateModel = {
                dailySundryAttendanceDetailID: parseInt(dailySundryAttendanceID),
                attendenceID: dailyCropDetail.attendenceID,
                dayOtHours: dailyCropDetail.dayOtHours,
                nightOtHours: dailyCropDetail.nightOtHours,
                doubleOtHours: dailyCropDetail.doubleOtHours,
                operatorID: parseInt(dailyCropDetail.operatorID),
                isHoliday: dailyCropDetail.isHoliday,
                manDays: parseFloat(manDays),
                employeeAttendanceID: parseFloat(dailyCropDetail.employeeAttendanceID),
                modifiedBY: tokenDecoder.getUserIDFromToken()
            }
            const response = await services.updateNonPuckingAttendenceDetails(updateModel)
            if (response.statusCode == 'Success') {
                alert.success(response.message)
                navigate('/app/attendenceSundry/listing')
            } else {
                alert.error(response.message)
            }
        } else {
            var response = await services.saveEmployeeSundryAttendance(attendenceData);
            if (response.statusCode == "Success") {
                alert.success("Non Plucking Attendance Added Successfully");
                setAttendenceData([]);
            }
            else {
                alert.error(response.message);
            }
        }
    }

    async function GetSundryDetailsByMusterChitID() {
        var response = await services.GetSundryDetailsByMusterChitID(dailyCropDetail.musterChitID);
        setDailyCropDetail((prevent) => ({
            ...prevent,
            fieldID: response.lentFieldID == 0 && response.lentEstateID == 0 ? response.fieldID.toString() : response.lentFieldID.toString(),
            jobCategoryID: response.jobCategoryID.toString(),
            workType: response.lentDivisionID || response.lentFieldID || response.lentEstateID ? 2 : 1,
            jobID: response.sundryJobTypeID.toString(),
            divisionID: response.lentDivisionID == 0 && response.lentEstateID == 0 ? response.divisionID.toString() : response.lentDivisionID.toString(),
            lentEstateID: response.lentEstateID
        }))
    }

    async function GetMusterChitCountByMusterID() {
        var response = await services.GetMusterChitCountByMusterID(dailyCropDetail.musterChitID);
        SetMusterCount(response.updatedMusterChitCount);
    }

    async function handleCancel() {
        setAttendenceData([]);
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.name === 'isTaskComplete' ? target.checked : target.value
        setDailyCropDetail({
            ...dailyCropDetail,
            [e.target.name]: value
        });
    }

    function handleChange1(e) {
        const target = e.target;
        const value = target.value
        setEmployeeNumber(value)
    }

    const handleKeyDownChange = (event, nextInputref) => {
        if (employeeNumber !== null && empName !== '') {
            if (event.key === 'Enter') {
                event.preventDefault();
                nextInputref.current.focus();
            }
        }

    }

    const handleKeyDownChange1 = (event, nextInputref) => {
        if (employeeNumber !== null || employeeNumber !== '') {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (!isUpdate) {
                    setEnterBtnConfirm(true);
                }
                else {
                    SaveEmployeeSundry();
                }
                nextInputref.current.focus();
            }
        }
    }

    const handleKeyDownChange2 = async (event, nextInputref) => {
        if (employeeNumber !== null || employeeNumber !== '') {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (!isUpdate) {
                    if ((dailyCropDetail.dayOtHours >= 0 && dailyCropDetail.dayOtHours <= 24) && (dailyCropDetail.nightOtHours >= 0 && dailyCropDetail.nightOtHours <= 24) && (dailyCropDetail.doubleOtHours >= 0 && dailyCropDetail.doubleOtHours <= 24)) {
                        await addDetailsForTheGrid();

                        setEmployeeNumber('')
                        setEmpName('')
                        setEmployeeTypeCheck(0)
                        setDailyCropDetail((prevent) => ({
                            ...prevent,
                            attendenceID: '1',
                            isHoliday: dailyCropDetail.isHoliday,
                            dayOtHours: '0',
                            nightOtHours: '0',
                            doubleOtHours: '0',
                            isCashJob: false,
                        }))
                        setEnterBtnConfirm(false);
                    } else {
                        setEnterBtnConfirm(false);
                        alert.error("OT Hours do not exceed the 24 hrs")
                    }
                } else {
                    if ((dailyCropDetail.dayOtHours >= 0 && dailyCropDetail.dayOtHours <= 24) && (dailyCropDetail.nightOtHours >= 0 && dailyCropDetail.nightOtHours <= 24) && (dailyCropDetail.doubleOtHours >= 0 && dailyCropDetail.doubleOtHours <= 24)) {
                        await SaveEmployeeSundry();
                    } else {
                        setEnterBtnConfirm(false);
                        alert.error("OT Hours do not exceed the 24 hrs")
                    }

                }
                nextInputref.current.focus();
            }
        }
    }

    const handleKeyDownChange3 = (event, nextInputref) => {
        if (employeeNumber !== null || employeeNumber !== '') {
            if (event.key === 'Enter') {
                event.preventDefault();
                setEnterBtnConfirm(false);
                nextInputref.current.focus();
            }
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }

    function isHolidayhandleChange(e) {
        const target = e.target
        const value = target.name === 'isHoliday' ? target.checked : target.value
        setDailyCropDetail((prevent) => ({
            ...prevent,
            [e.target.name]: value
        }))
    }

    function isCashJobhandleChange(e) {
        const target = e.target
        const value = target.name === 'isCashJob' ? target.checked : target.value
        setDailyCropDetail((prevent) => ({
            ...prevent,
            [e.target.name]: value
        }))
    }

    async function handleClickEdit(rowData) {
        setAttendenceRowData(rowData);
        setDeleteConfirmationOpen(true);
        setIncreaseCount(0)
    }

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false)
    }

    async function updateManDaySetting() {
        if (dailyCropDetail.isHoliday == true) {
            if (parseInt(dailyCropDetail.attendenceID) == 1) {
                setManDays(1.5)
            } else if (parseInt(dailyCropDetail.attendenceID) == 2) {
                setManDays(0.75)
            } else {
                setManDays(0)
            }
        } else {
            if (parseInt(dailyCropDetail.attendenceID) == 1) {
                setManDays(1)
            }
            else if (parseInt(dailyCropDetail.attendenceID) == 2) {
                setManDays(0.5)
            } else {
                setManDays(0)
            }
        }
    }

    async function handleClickDeleteConfirm() {

        if (attendenceRowData.musterChitID != 0) {
            var response = await services.IncreaseTheMusterChitEmployeeCount(attendenceRowData.musterChitID, attendenceRowData.attendenceID, tokenDecoder.getUserIDFromToken());
            if (response == 1) {
                setAttendenceData(attendenceData.filter(item => item.tableData.id !== attendenceRowData.tableData.id));
                setIncreaseCount(response)

                var manDays = attendenceCount;
                manDays -= attendenceRowData.manDays;
                setAttendenceCount(manDays);
            }

        } setDeleteConfirmationOpen(false);
        if (attendenceData.length == 1) {
            setDailyCropDetail((prevent) => ({
                ...prevent,
                attendenceID: '0',
            }))
        }
    }

    function handleClick() {
        if (attendenceData.length == 0) {
            navigate('/app/attendenceSundry/listing')
        } else {
            setConfirmationOpen(true)
        }
    }

    const handleNo = () => {
        setConfirmationOpen(false);
    }

    const handleYes = () => {
        SaveEmployeeSundry();
        setConfirmationOpen(false);
        navigate('/app/attendenceSundry/listing')
    }

    const handleEnterNo = () => {
        setEnterBtnConfirm(false);
    }

    const handleEnterYes = () => {
        if (isUpdate) {
            if ((dailyCropDetail.dayOtHours >= 0 && dailyCropDetail.dayOtHours <= 24) && (dailyCropDetail.nightOtHours >= 0 && dailyCropDetail.nightOtHours <= 24) && (dailyCropDetail.doubleOtHours >= 0 && dailyCropDetail.doubleOtHours <= 24)) {
                SaveEmployeeSundry();
            } else {
                alert.error("OT Hours do not exceed the 24 hrs")
                setEnterBtnConfirm(false);
            }
        } else {
            if ((dailyCropDetail.dayOtHours >= 0 && dailyCropDetail.dayOtHours <= 24) && (dailyCropDetail.nightOtHours >= 0 && dailyCropDetail.nightOtHours <= 24) && (dailyCropDetail.doubleOtHours >= 0 && dailyCropDetail.doubleOtHours <= 24)) {
                addDetailsForTheGrid();
            } else {
                alert.error("OT Hours do not exceed the 24 hrs")
                setEnterBtnConfirm(false);
            }
        }
    }

    async function clearFieldData(dataModel) {
        setEmployeeNumber('')
        setEmployeeID('')
        setEmpName('')
        setEmployeeTypeCheck(0)
        setDailyCropDetail((prevent) => ({
            ...prevent,
            attendenceID: '1',
            isHoliday: dataModel.isHoliday,
            dayOtHours: '0',
            nightOtHours: '0',
            doubleOtHours: '0',
            isCashJob: false,
        }))
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <Box
                        display="flex"
                        justifyContent="flex-end"
                    >
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={() => handleClick()}
                            size='small'
                        >
                            <SvgIcon
                                fontSize="medium"
                                color="action"
                            >
                                <ArrowBackIcon style={{ color: "white" }} />
                            </SvgIcon>
                        </Button>
                    </Box>

                </Grid>
            </Grid>
        )
    }

    async function addDetails() {
        setEnterBtnConfirm(true);
    }

    async function addDetailsForTheGrid() {
        var response = await services.GetSundryAttendanceEmployeeDetailsByEmpNo(dailyCropDetail.estateID, employeeNumber);
        if (response.statusCode == "Error") {
            alert.error(response.message);
        }
        else {
            var isRegNoValidate = await services.GetRegisterNoValidateByMainDivision(dailyCropDetail.mainDivisionID, employeeNumber, employeeID);
            if (isRegNoValidate.data > 0) {
                var validateStaffEmployee = await services.GetEmployeeNoForStaffEmployee(employeeNumber, employeeID);
                if (validateStaffEmployee.data == 0) {
                    var manDaysCount = 0
                    if (dailyCropDetail.isHoliday === true) {
                        if (parseInt(dailyCropDetail.attendenceID) === 1) {
                            manDaysCount = 1.5
                        } else if (parseInt(dailyCropDetail.attendenceID) === 2) {
                            manDaysCount = 0.75
                        } else {
                            manDaysCount = 0
                        }
                    } else {
                        if (parseInt(dailyCropDetail.attendenceID) === 1) {
                            manDaysCount = 1
                        }
                        else if (parseInt(dailyCropDetail.attendenceID) === 2) {
                            manDaysCount = 0.5
                        } else {
                            manDaysCount = 0
                        }
                    }
                    let dataModel = {
                        empNo: employeeNumber,
                        workType: parseInt(dailyCropDetail.workType),
                        attendenceID: parseInt(dailyCropDetail.attendenceID) === 0 ? parseInt(1) : parseInt(dailyCropDetail.attendenceID),
                        isTaskComplete: dailyCropDetail.isTaskComplete,
                        fieldID: parseInt(dailyCropDetail.fieldID),
                        groupID: parseInt(dailyCropDetail.groupID),
                        estateID: parseInt(dailyCropDetail.estateID),
                        mainDivisionID: parseInt(dailyCropDetail.mainDivisionID),
                        divisionID: parseInt(dailyCropDetail.divisionID),
                        date: dailyCropDetail.date,
                        employeeTypeID: parseInt(employeeTypeCheck),
                        jobCategoryID: parseInt(dailyCropDetail.jobCategoryID),
                        jobID: parseInt(dailyCropDetail.jobID),
                        dayOtHours: parseFloat(dailyCropDetail.dayOtHours),
                        nightOtHours: parseFloat(dailyCropDetail.nightOtHours),
                        doubleOtHours: parseFloat(dailyCropDetail.doubleOtHours),
                        musterChitID: parseInt(dailyCropDetail.musterChitID),
                        isHoliday: dailyCropDetail.isHoliday,
                        createdBy: tokenDecoder.getUserIDFromToken(),
                        isCashJob: dailyCropDetail.isCashJob,
                        operatorID: parseInt(dailyCropDetail.operatorID),
                        empName: empName,
                        lentEstateID: parseInt(dailyCropDetail.lentEstateID),
                        manDays: parseFloat(manDaysCount) === 0 ? parseFloat(1) : parseFloat(manDaysCount)
                    };

                    var gridValid = attendenceData.find(p => p.isHoliday === dataModel.isHoliday && p.isCashJob === dataModel.isCashJob && p.empNo === dataModel.empNo && p.date === dataModel.date)
                        || attendenceData.find(p => p.isHoliday === !dataModel.isHoliday && p.isCashJob === dataModel.isCashJob && p.empNo === dataModel.empNo && p.date === dataModel.date)
                    if (gridValid) {
                        alert.error("Attendance is Already Exists")
                        setEmployeeNumber('')
                        setEmpName('')
                        setEnterBtnConfirm(false);
                    }
                    else {
                        var validateTheGeneral = await services.ValidateTheGeneral(dataModel.empNo, moment(dataModel.date).format("YYYY-MM-DD"))
                        if (validateTheGeneral > 0) {
                            var validateTheJobs = await services.ValidateTheJobs(dataModel.isHoliday, dataModel.isCashJob, dataModel.empNo, moment(dataModel.date).format("YYYY-MM-DD"), employeeID);
                            if (validateTheJobs.data > 0) {
                                if (dataModel.musterChitID != 0) {
                                    var response = await services.EmployeeIsExists(dataModel.empNo, moment(dataModel.date).format("YYYY-MM-DD"));
                                    if (dataModel.musterChitID != 0) {
                                        var response = await services.DecreaseTheMusterChitEmployeeCount(dataModel.musterChitID, dataModel.attendenceID, tokenDecoder.getUserIDFromToken());
                                        if (response.data == 1) {

                                            setAttendenceData(attendenceData => [...attendenceData, dataModel]);

                                            var manDays = attendenceCount;

                                            manDays += dataModel.manDays
                                            setAttendenceCount(manDays);

                                            trackPromise(clearFieldData(dataModel))
                                            setEnterBtnConfirm(false);

                                        } else {
                                            alert.error(response.message)
                                        }
                                    } else {
                                        alert.error(response.message);
                                    }
                                }
                            }
                            else {
                                setEnterBtnConfirm(false)
                                alert.error(validateTheJobs.message)
                            }
                        } else {
                            if (dataModel.isCashJob == true) {
                                var validateTheJobs = await services.ValidateTheJobs(dataModel.isHoliday, dataModel.isCashJob, dataModel.empNo, moment(dataModel.date).format("YYYY-MM-DD"), employeeID);
                                if (validateTheJobs.data > 0) {
                                    if (dataModel.musterChitID != 0) {
                                        var response = await services.EmployeeIsExists(dataModel.empNo, moment(dataModel.date).format("YYYY-MM-DD"));
                                        if (response.data > 0) {
                                            var response = await services.DecreaseTheMusterChitEmployeeCount(dataModel.musterChitID, dataModel.attendenceID, tokenDecoder.getUserIDFromToken());
                                            if (response.data == 1) {

                                                setAttendenceData(attendenceData => [...attendenceData, dataModel]);

                                                var manDays = attendenceCount;
                                                if (dataModel.attendenceID == 1 && !isSunday) {
                                                    manDays = manDays + 1;
                                                    setAttendenceCount(manDays);
                                                } else if (dataModel.attendenceID == 2 && !isSunday) {
                                                    manDays = manDays + 0.5;
                                                    setAttendenceCount(manDays);
                                                } else {
                                                    manDays = manDays + 1.5;
                                                    setAttendenceCount(manDays);
                                                }

                                                trackPromise(clearFieldData(dataModel))

                                            } else {
                                                alert.error(response.message)
                                            }
                                        } else {
                                            alert.error(response.message);
                                        }
                                    }
                                }
                                else {
                                    setEnterBtnConfirm(false)
                                    alert.error(validateTheJobs.message)
                                }
                            } else {
                                alert.error("Please Place a Cash Attendance")
                            }
                        }
                    }
                } else {
                    alert.error(validateStaffEmployee.message);
                }
            } else {
                alert.error(isRegNoValidate.message)
            }
        }
    }

    function allClearData() {
        setDailyCropDetail((prevent) => ({
            ...prevent,
            mainDivisionID: 0,
            date: new Date().toISOString().substring(0, 10),
            employeeTypeID: '0',
            jobCategoryID: '0',
            jobID: '0',
            attendenceID: '1',
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
            lentEstateID: '0'
        }));
        setEmployeeNumber('')
        setEmpName('')

    }

    function isEditable() {
        if (isUpdate) {
            if (dailyCropDetail.date >= minDateString && dailyCropDetail.date <= maxDate) {
                setIsEdit(true);
            } else {
                setIsEdit(false);
            }
        }
    };

    return (
        <Fragment>
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
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
                            empNo: employeeNumber,
                            isHoliday: dailyCropDetail.isHoliday,
                            musterChitID: dailyCropDetail.musterChitID,
                            isCashJob: dailyCropDetail.isCashJob,
                            operatorID: dailyCropDetail.operatorID,
                            empName: dailyCropDetail.empName,
                            lentEstateID: dailyCropDetail.lentEstateID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                date: Yup.date().required('Date is required'),
                                jobCategoryID: Yup.number().required('Job Category is required').min("1", 'Job Category is required'),
                                jobID: Yup.number().required('Job is required').min("1", 'Job is required'),
                                workType: Yup.number().required('Labour Type required').min("1", 'Labour Type is required'),
                                attendenceID: Yup.number().when([], {
                                    is: () => dailyCropDetail.isHoliday == false,
                                    then: Yup.number().required('Attendence is required').min("1", 'Attendence is required'),
                                    otherwise: null
                                }),
                                mainDivisionID: Yup.number().required('Division is required').min("1", 'Division is required'),
                                dayOtHours: Yup.number().test('is-decimal', 'Please enter a positive number with exactly one decimal places', value => (value === undefined || (value + '').match(/^\d+(\.\d{1})?$/)))
                                    .test('max-hours', 'Normal OT should be less than or equal to 24', value => value === undefined || value <= 24),
                                nightOtHours: Yup.number().test('is-decimal', 'Please enter a positive number with exactly one decimal places', value => (value === undefined || (value + '').match(/^\d+(\.\d{1})?$/)))
                                    .test('max-hours', 'Night OT should be less than or equal to 24', value => value === undefined || value <= 24),
                                doubleOtHours: Yup.number().test('is-decimal', 'Please enter a positive number with exactly one decimal places', value => (value === undefined || (value + '').match(/^\d+(\.\d{1})?$/)))
                                    .test('max-hours', 'Sunday OT should be less than or equal to 24', value => value === undefined || value <= 24),


                                empNo: Yup.string().required('Emp No is required').typeError('Emp No is required'),
                                musterChitID: Yup.number().required('Muster Chit No is required').min("1", 'Muster Chit No is required'),
                            })
                        }
                        onSubmit={() => trackPromise(addDetails())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched
                        }) => (
                            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle(title)}
                                        />
                                        <Divider />
                                        <PerfectScrollbar>
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
                                                            onChange={(e) => handleChange(e)}
                                                            value={dailyCropDetail.groupID}
                                                            variant="outlined"
                                                            size='small'
                                                            id="groupID"
                                                            inputProps={{
                                                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled
                                                            }}
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
                                                            onChange={(e) => handleChange(e)}
                                                            value={dailyCropDetail.estateID}
                                                            variant="outlined"
                                                            size='small'
                                                            id="estateID"
                                                            inputProps={{
                                                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled
                                                            }}
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
                                                                handleChange(e);
                                                            }}
                                                            value={dailyCropDetail.mainDivisionID}
                                                            variant="outlined"
                                                            id="mainDivisionID"
                                                            inputProps={{
                                                                readOnly: isUpdate
                                                            }}
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
                                                            size="small"
                                                            name="date"
                                                            type="date"
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                            }}
                                                            value={dailyCropDetail.date}
                                                            variant="outlined"
                                                            id="date"
                                                            inputProps={{
                                                                max: maxDate,
                                                                min: minDateString,
                                                                readOnly: isUpdate || attendenceData.length > 0
                                                            }}
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
                                                                handleChange(e);
                                                            }}
                                                            value={dailyCropDetail.musterChitID}
                                                            variant="outlined"
                                                            id="musterChitID"
                                                            inputProps={{
                                                                readOnly: isUpdate || attendenceData.length > 0
                                                            }}
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
                                                            onChange={(e) => handleChange(e)}
                                                            inputProps={{
                                                                readOnly: true
                                                            }}
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
                                                                handleChange(e);
                                                            }}
                                                            value={dailyCropDetail.lentEstateID}
                                                            variant="outlined"
                                                            id="lentEstateID"
                                                            disabled={dailyCropDetail.lentEstateID > 0 ? false : true}
                                                            inputProps={{
                                                                readOnly: true
                                                            }}
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
                                                                handleChange(e);
                                                            }}
                                                            value={dailyCropDetail.divisionID}
                                                            variant="outlined"
                                                            id="divisionID"
                                                            disabled={dailyCropDetail.lentEstateID > 0 ? true : false}
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
                                                                handleChange(e)
                                                            }}
                                                            value={dailyCropDetail.fieldID}
                                                            disabled={dailyCropDetail.lentEstateID > 0 ? true : false}
                                                            variant="outlined"
                                                            id="fieldID"
                                                            inputProps={{
                                                                readOnly: true
                                                            }}
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
                                                            onChange={(e) => handleChange(e)}
                                                            value={dailyCropDetail.jobCategoryID}
                                                            variant="outlined"
                                                            id="jobCategoryID"
                                                            inputProps={{
                                                                readOnly: true
                                                            }}
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
                                                            onChange={(e) => handleChange(e)}
                                                            value={dailyCropDetail.jobID}
                                                            variant="outlined"
                                                            id="jobID"
                                                            inputProps={{
                                                                readOnly: true
                                                            }}
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
                                                            onChange={(e) => handleChange1(e)}
                                                            value={employeeNumber}
                                                            variant="outlined"
                                                            id="empNo"
                                                            type="text"
                                                            inputProps={{
                                                                readOnly: isUpdate
                                                            }}
                                                            inputRef={empNoRef}
                                                            onKeyDown={(e) => handleKeyDownChange1(e, empNoRef)}
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
                                                            onChange={(e) => handleChange(e)}
                                                            value={empName}
                                                            variant="outlined"
                                                            id="empName"
                                                            type="text"
                                                            inputProps={{
                                                                readOnly: true
                                                            }}
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
                                                            value={employeeTypeCheck}
                                                            variant="outlined"
                                                            size='small'
                                                            id="employeeTypeID"
                                                            onChange={(e) => handleChange(e)}
                                                            inputProps={{
                                                                readOnly: true
                                                            }}
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
                                                            onChange={(e) => handleChange(e)}
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
                                                                    onChange={(e) => isHolidayhandleChange(e)}
                                                                    name="isHoliday"
                                                                    disabled={isUpdate}
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
                                                                    disabled={isUpdate}
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
                                                                onChange={(e) => handleChange(e)}
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
                                                                onChange={(e) => handleChange(e)}
                                                                size='small'
                                                                value={dailyCropDetail.dayOtHours}
                                                                disabled={dailyCropDetail.isHoliday}
                                                                variant="outlined"
                                                                id="dayOtHours"
                                                                type="text"
                                                                inputRef={normalOTRef}
                                                                onKeyDown={(e) => handleKeyDownChange(e, nightOTRef)}
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
                                                                onChange={(e) => handleChange(e)}
                                                                size='small'
                                                                value={dailyCropDetail.nightOtHours}
                                                                disabled={dailyCropDetail.isHoliday}
                                                                variant="outlined"
                                                                id="nightOtHours"
                                                                type="text"
                                                                inputRef={nightOTRef}
                                                                onKeyDown={isSunday ? (e) => handleKeyDownChange(e, sundayOTRef) : (e) => handleKeyDownChange1(e, empNoRef)}
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
                                                                onChange={(e) => handleChange(e)}
                                                                size='small'
                                                                value={dailyCropDetail.doubleOtHours}
                                                                disabled={dailyCropDetail.isCashJob}
                                                                variant="outlined"
                                                                id="doubleOtHours"
                                                                type="text"
                                                                inputRef={sundayOTRef}
                                                                onKeyDown={(e) => handleKeyDownChange1(e, empNoRef)}
                                                            >
                                                            </TextField>
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                            </>
                                            {isUpdate ? null :
                                                <Box display="flex" justifyContent="flex-end" p={2} style={{ marginRight: '20px', marginBottom: '20px' }}>
                                                    <Button
                                                        color="primary"
                                                        type="reset"
                                                        variant="outlined"
                                                        onClick={() => allClearData()}
                                                        disabled={isUpdate ? true : false}
                                                        size='small'
                                                    >
                                                        Clear
                                                    </Button>
                                                    <div>&nbsp;</div>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                        disabled={IsAddButtonDisable}
                                                        size='small'
                                                    >
                                                        Add
                                                    </Button>
                                                </Box>
                                            }
                                            {attendenceData.length > 0 ?
                                                <Box sx={{ display: 'flex', marginLeft: '5px' }}>
                                                    &nbsp;
                                                    <Chip size="small" label={`Muster Chit Employee Count : ${musterCount}`} style={{ color: 'black', backgroundColor: '#82A0D8', fontWeight: 'bold' }} />
                                                    &nbsp;
                                                    <Chip size="small" label={`Attendance Man Days : ${attendenceCount}`} style={{ color: 'black', fontWeight: 'bold', backgroundColor: '#B0D9B1' }} />
                                                </Box> : null}
                                            <br />
                                            <Box >
                                                {isUpdate ? null :
                                                    <>
                                                        {attendenceData.length > 0 ?
                                                            <MaterialTable
                                                                title="Multiple Actions Preview"
                                                                columns={[
                                                                    { title: 'Emp No', field: 'empNo' },
                                                                    { title: 'Emp Name ', field: 'empName' },
                                                                    {
                                                                        title: 'Work Type', field: 'workType', lookup: {
                                                                            1: "Division labour",
                                                                            2: "Lent labor"
                                                                        }
                                                                    },
                                                                    { title: 'Attendance', field: 'manDays' },
                                                                    { title: 'Cash Job ', field: 'isCashJob', render: rowData => rowData.isCashJob == true ? 'Yes' : 'No' },
                                                                ]}
                                                                data={attendenceData}
                                                                options={{
                                                                    exportButton: false,
                                                                    showTitle: false,
                                                                    headerStyle: { textAlign: "left", height: '1%' },
                                                                    cellStyle: { textAlign: "left" },
                                                                    columnResizable: false,
                                                                    actionsColumnIndex: -1
                                                                }}
                                                                actions={[
                                                                    {
                                                                        icon: 'delete',
                                                                        tooltip: 'Remove record',
                                                                        onClick: (event, rowData) => { handleClickEdit(rowData) }
                                                                    },
                                                                ]}
                                                            /> : null}
                                                    </>
                                                }
                                                {(isUpdate && attendenceData.length == 0) ?
                                                    <>
                                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                                            {attendenceData.length > 0 ? null :
                                                                <>
                                                                    <Button
                                                                        color="primary"
                                                                        variant="outlined"
                                                                        type="button"
                                                                        onClick={() => trackPromise(handleCancel())}
                                                                        size='small'
                                                                        disabled={isUpdate}
                                                                    >
                                                                        Clear
                                                                    </Button>
                                                                    <div>&nbsp;</div>
                                                                </>
                                                            }
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                type="button"
                                                                disabled={!isEdit}
                                                                onClick={() => trackPromise(SaveEmployeeSundry())}
                                                                size='small'
                                                            >
                                                                Update
                                                            </Button>
                                                        </Box>
                                                    </>
                                                    :
                                                    <>
                                                        {attendenceData.length > 0 ?
                                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                                {attendenceData.length > 0 ? null :
                                                                    <>
                                                                        <Button
                                                                            color="primary"
                                                                            variant="outlined"
                                                                            type="button"
                                                                            onClick={() => trackPromise(handleCancel())}
                                                                            size='small'
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <div>&nbsp;</div>
                                                                    </>
                                                                }
                                                                <Button
                                                                    color="primary"
                                                                    variant="contained"
                                                                    type="button"
                                                                    onClick={() => trackPromise(SaveEmployeeSundry())}
                                                                    size='small'
                                                                >
                                                                    Upload
                                                                </Button>
                                                            </Box>
                                                            : null}
                                                    </>
                                                }
                                            </Box>
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
                                                        <Typography variant="h4">Are you sure you want to delete this record ?</Typography>
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

                                            <Dialog
                                                open={confirmationOpen}
                                                onClose={handleNo}
                                                aria-labelledby="alert-dialog-slide-title"
                                                aria-describedby="alert-dialog-slide-description"
                                            >
                                                <DialogTitle id="alert-dialog-slide-title">
                                                    <Typography
                                                        color="textSecondary"
                                                        gutterBottom
                                                        variant="h3">
                                                        <Box textAlign="center">
                                                            Confirmation
                                                        </Box>
                                                    </Typography>
                                                </DialogTitle>
                                                <DialogContent>
                                                    <DialogContentText id="alert-dialog-slide-description">
                                                        <Typography variant="h5">Are you sure do you want to save the data and go back?</Typography>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        <br />
                                                    </DialogContentText>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={handleYes} color="primary" autoFocus>
                                                        Yes
                                                    </Button>
                                                    <Button onClick={handleNo} color="primary">
                                                        No
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>

                                            <Dialog
                                                open={enterBtnConfirm}
                                                onClose={handleEnterNo}
                                                aria-labelledby="alert-dialog-slide-title"
                                                aria-describedby="alert-dialog-slide-description"
                                            >
                                                <DialogTitle id="alert-dialog-slide-title">
                                                    <Typography
                                                        color="textSecondary"
                                                        gutterBottom
                                                        variant="h3">
                                                        <Box textAlign="center">
                                                            Adding Confirmation
                                                        </Box>
                                                    </Typography>
                                                </DialogTitle>
                                                <DialogContent>
                                                    <DialogContentText id="alert-dialog-slide-description">
                                                        <Typography variant="h5">{isUpdate ? "Are you sure you want to update this record?" : "Are you sure you want to add this record?"}</Typography>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        <br />
                                                    </DialogContentText>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={handleEnterYes} color="primary" autoFocus inputRef={enterBtnRef} onKeyDown={(e) => handleKeyDownChange2(e, empNoRef)}>
                                                        Yes
                                                    </Button>
                                                    <Button onClick={handleEnterNo} color="primary" inputRef={enterBtnRef} onKeyDown={(e) => handleKeyDownChange3(e, empNoRef)}>
                                                        No
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page >
        </Fragment >
    )
}

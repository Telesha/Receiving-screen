import React, { useState, useEffect, Fragment } from 'react';
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
    InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import { useAlert } from "react-alert";
import PageHeader from 'src/views/Common/PageHeader';
import moment from 'moment';

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
    colorSelect: {
        backgroundColor: "#D2042D",
    },
    colorRecordAndNew: {
        backgroundColor: "#FFBE00"
    },
    colorRecord: {
        backgroundColor: "green",
    },
    colorReject: {
        backgroundColor: "red",
    },
    colorApprove: {
        backgroundColor: "green",
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
}));

const screenCode = 'LEAVEREQUEST';

export default function LeaveRequestAddEdit(props) {
    let decrypted = 0
    const alert = useAlert();
    const [title, setTitle] = useState("Add Leave Mark")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [leaveTypes, setLeaveTypes] = useState();
    const [isUpdate, setIsUpdate] = useState(false);
    const [divisions, setDivisions] = useState();
    const [employeeNumber, setEmployeeNumber] = useState(null);
    const [isHideField, setIsHideField] = useState(true);
    const [empName, setEmpName] = useState('');
    const [leaveFormData, setLeaveFormData] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        empNo: '',
        empName: '',
        leaveTypeID: 0,
        fromDate: new Date().toISOString().substring(0, 10),
        toDate: new Date().toISOString().substring(0, 10),
        noOfDays: 0,
        reason: '',
    })
    const { employeeLeaveRequestID } = useParams();

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isLeaveRequestApproveReject: false
    });

    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/app/leaverequest/listing');
    }

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission(), GetLeaveRequestType());
    }, []);

    useEffect(() => {
        if (leaveFormData.groupID != 0) {
            trackPromise(getFactoriesForDropdown());
        }
    }, [leaveFormData.groupID]);

    useEffect(() => {
        trackPromise(
            getDivisionDetailsByEstateID(leaveFormData.estateID)
        )
    }, [leaveFormData.estateID]);

    useEffect(() => {
        handleDateDifference();
    }, [leaveFormData.toDate]);

    useEffect(() => {
        handleDateDifference();
    }, [leaveFormData.fromDate]);

    useEffect(() => {
        if (employeeNumber > 0) {
            trackPromise(
                GetEmpNameByEmpNo()
            )
            setEmpName([])
        }
    }, [employeeNumber]);

    useEffect(() => {
        decrypted = atob(employeeLeaveRequestID.toString());
        if (parseInt(decrypted) > 0) {
            setIsUpdate(true);
            trackPromise(getDetailsByEmployeeLeaveRequestID(decrypted));
        }
    }, []);

    useEffect(() => {
        if (!isUpdate) {
            setLeaveFormData({
                ...leaveFormData,
                empName: ''
            })
        }
    }, [leaveFormData.empNo]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITLEAVEREQUEST');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        var isLeaveRequestApproveReject = permissions.find(p => p.permissionCode === 'VIEWLEAVEREQUESTAPPROVEREJECT');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isLeaveRequestApproveReject: isLeaveRequestApproveReject !== undefined
        });

        setLeaveFormData({
            ...leaveFormData,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClick}
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
        const factories = await services.getEstateDetailsByGroupID(leaveFormData.groupID);
        setFactories(factories);
    }

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(leaveFormData.estateID);
        setDivisions(response);
    };

    async function GetLeaveRequestType() {
        var response = await services.GetLeaveRequestType();
        setLeaveTypes(response);
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

    function handleDateDifference() {
        const oneDay = 24 * 60 * 60 * 1000;
        const startTimestamp = new Date(leaveFormData.fromDate).getTime();
        const endTimestamp = new Date(leaveFormData.toDate).getTime();

        const diffInDays = Math.round(Math.abs(((startTimestamp - endTimestamp) / oneDay)) + 1);

        setLeaveFormData({
            ...leaveFormData,
            noOfDays: diffInDays
        })
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setLeaveFormData({
            ...leaveFormData,
            [e.target.name]: value
        });
    }

    function handleChangeEmpNo(e) {
        const target = e.target;
        const value = target.value
        setEmployeeNumber(value)
    }

    async function saveDetails() {
        if (isUpdate) {
            let model = {
                employeeLeaveRequestID: atob(employeeLeaveRequestID.toString()),
                fromDate: leaveFormData.fromDate,
                toDate: leaveFormData.toDate,
                noOfDays: leaveFormData.noOfDays,
                reason: leaveFormData.reason,
                modifiedBy: parseInt(tokenService.getUserIDFromToken()),
            }
            setIsUpdate(true)
            let response = await services.updateLeaveRequestDetails(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                clearData();
                navigate('/app/leaverequest/listing');
            }
            else {
                alert.error(response.message);
            }
        }
        else {
            let model = {
                groupID: parseInt(leaveFormData.groupID),
                estateID: parseInt(leaveFormData.estateID),
                divisionID: parseInt(leaveFormData.divisionID),
                empNo: employeeNumber,
                empName: empName,
                leaveTypeID: parseInt(leaveFormData.leaveTypeID),
                fromDate: leaveFormData.fromDate,
                toDate: leaveFormData.toDate,
                noOfDays: leaveFormData.noOfDays,
                reason: leaveFormData.reason,
                createdBy: parseInt(tokenService.getUserIDFromToken()),
            }
            const response = await services.saveLeaveFormDetails(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                clearData();
                navigate('/app/leaverequest/listing');
            }
            else {
                alert.error(response.message);
            }
        }
    }

    async function GetEmpNameByEmpNo() {
        var response = await services.GetEmpNameByEmpNo(employeeNumber)
        if (response) {
            setLeaveFormData({
                ...leaveFormData,
                empName: response.employeeName
            })
            setEmpName(response.employeeName);
        }
    }

    function calculateMaxDate() {
        const maxDate = new Date(leaveFormData.fromDate);
        maxDate.setDate(maxDate.getDate() + 83);
        return maxDate.toISOString().split('T')[0];
    }

    async function getDetailsByEmployeeLeaveRequestID(employeeLeaveRequestID) {
        const leaveRequest = await services.getDetailsByEmployeeLeaveRequestID(employeeLeaveRequestID);
        setIsUpdate(true);
        setLeaveFormData({
            ...leaveFormData,
            groupID: leaveRequest.groupID,
            estateID: leaveRequest.estateID,
            divisionID: leaveRequest.divisionID,
            empNo: leaveRequest.empNo,
            empName: leaveRequest.empName,
            leaveTypeID: leaveRequest.leaveTypeID,
            fromDate: moment(leaveRequest.fromDate).format('YYYY-MM-DD'),
            toDate: moment(leaveRequest.toDate).format('YYYY-MM-DD'),
            noOfDays: leaveRequest.noOfDays,
            reason: leaveRequest.reason,
            modifiedBy: parseInt(tokenDecoder.getUserIDFromToken()),
            modifiedDate: new Date().toISOString()
        })
        setTitle("Edit Leave Mark");
    }

    function clearData() {
        setLeaveFormData({
            ...leaveFormData,
            divisionID: 0,
            leaveTypeID: 0,
            fromDate: new Date().toISOString().substring(0, 10),
            toDate: new Date().toISOString().substring(0, 10),
            noOfDays: '0',
            reason: '',

        });
        setEmployeeNumber([])
        setEmpName([])
        setIsHideField(true)
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: leaveFormData.groupID,
                            estateID: leaveFormData.estateID,
                            divisionID: leaveFormData.divisionID,
                            empNo: employeeNumber,
                            empName: empName,
                            leaveTypeID: leaveFormData.leaveTypeID,
                            fromDate: leaveFormData.fromDate,
                            toDate: leaveFormData.toDate,
                            noOfDays: leaveFormData.noOfDays,
                            reason: leaveFormData.reason,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                divisionID: Yup.number().required('Division is required').min("1", 'Division is required'),
                                leaveTypeID: Yup.number().required('Leave Type is required').min("1", 'Leave Type is required'),
                                empNo: Yup.string().nullable().when([], {
                                    is: () => isUpdate != true,
                                    then: Yup.string().required('Emp No is required').min(1, 'Emp No is required'),
                                    otherwise: Yup.string().notRequired(),
                                }),
                            })
                        }
                        onSubmit={saveDetails}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            touched,
                            values
                        }) => {
                            return (
                                <form onSubmit={handleSubmit}>
                                    <Box mt={0}>
                                        <Card>
                                            <CardHeader
                                                title={cardTitle(title)} />
                                            <PerfectScrollbar>
                                                <Divider />
                                                <CardContent>
                                                    <Card style={{ padding: 30, marginTop: 20, marginBottom: 20 }}>
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
                                                                    value={leaveFormData.groupID}
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
                                                                    value={leaveFormData.estateID}
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
                                                                    value={leaveFormData.divisionID}
                                                                    variant="outlined"
                                                                    id="divisionID"
                                                                    disabled={isUpdate}
                                                                    InputProps={{
                                                                        readOnly: isUpdate
                                                                    }}
                                                                >
                                                                    <MenuItem value={0}>--Select Division--</MenuItem>
                                                                    {generateDropDownMenu(divisions)}
                                                                </TextField>
                                                            </Grid>
                                                            {!isUpdate ?
                                                                <Grid item md={4} xs={12}>
                                                                    <InputLabel shrink id="empNo">
                                                                        Employee No *
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
                                                                :
                                                                <Grid item md={4} xs={12}>
                                                                    <InputLabel shrink id="empNo">
                                                                        Employee No *
                                                                    </InputLabel>
                                                                    <TextField
                                                                        error={Boolean(touched.empNo && errors.empNo)}
                                                                        fullWidth
                                                                        helperText={touched.empNo && errors.empNo}
                                                                        name="empNo"
                                                                        onBlur={handleBlur}
                                                                        size='small'
                                                                        onChange={(e) => handleChangeEmpNo(e)}
                                                                        value={leaveFormData.empNo}
                                                                        variant="outlined"
                                                                        id="empNo"
                                                                        disabled={isUpdate}
                                                                        type="text"
                                                                        inputProps={{
                                                                            readOnly: isUpdate
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>}
                                                            {!isUpdate ?
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
                                                                :
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
                                                                        value={leaveFormData.empName}
                                                                        variant="outlined"
                                                                        id="empName"
                                                                        disabled={isUpdate}
                                                                        type="text"
                                                                        inputProps={{
                                                                            readOnly: true
                                                                        }}
                                                                    >
                                                                    </TextField>
                                                                </Grid>}
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="leaveTypeID">
                                                                    Leave Type *
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.leaveTypeID && errors.leaveTypeID)}
                                                                    fullWidth
                                                                    helperText={touched.leaveTypeID && errors.leaveTypeID}
                                                                    size='small'
                                                                    name="leaveTypeID"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={leaveFormData.leaveTypeID}
                                                                    disabled={isUpdate}
                                                                    variant="outlined"
                                                                    id="leaveTypeID"
                                                                    InputProps={{
                                                                        readOnly: isUpdate
                                                                    }}
                                                                >
                                                                    <MenuItem value="0">--Select Leave Type--</MenuItem>
                                                                    {generateDropDownMenu(leaveTypes)}
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="fromDate">
                                                                    From Date
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    name="fromDate"
                                                                    type='date'
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={leaveFormData.fromDate}
                                                                    variant="outlined"
                                                                    id="fromDate"
                                                                    size='small'
                                                                />
                                                            </Grid>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="toDate">
                                                                    To Date
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    name="toDate"
                                                                    type='date'
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={leaveFormData.toDate}
                                                                    variant="outlined"
                                                                    id="toDate"
                                                                    size='small'
                                                                    inputProps={{
                                                                        min: leaveFormData.fromDate,
                                                                        max: parseInt(leaveFormData.leaveTypeID) === parseInt("6") ? calculateMaxDate() : null,
                                                                    }}
                                                                />
                                                            </Grid>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="noOfDays">
                                                                    No Of Days *
                                                                </InputLabel>
                                                                <TextField
                                                                    error={Boolean(touched.noOfDays && errors.noOfDays)}
                                                                    fullWidth
                                                                    helperText={touched.noOfDays && errors.noOfDays}
                                                                    size='small'
                                                                    name="noOfDays"
                                                                    type='number'
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={leaveFormData.noOfDays}
                                                                    disabled
                                                                    variant="outlined"
                                                                    id="noOfDays"
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item md={8} xs={12}>
                                                                <InputLabel shrink id="reason">
                                                                    Reason
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    size='small'
                                                                    name="reason"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => handleChange(e)}
                                                                    value={leaveFormData.reason}
                                                                    variant="outlined"
                                                                    id="reason"
                                                                    multiline
                                                                    rows={3}
                                                                >
                                                                </TextField>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid container justify="flex-end" spacing={3}>
                                                            {!isUpdate ?
                                                                <Box pr={2} style={{ marginTop: '20px' }}>
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
                                                            <Box pr={2} style={{ marginTop: '20px' }}>
                                                                <Button
                                                                    color="primary"
                                                                    variant="contained"
                                                                    type="submit"
                                                                    size='small'
                                                                >
                                                                    {isUpdate == true ? "Update" : "Save"}
                                                                </Button>
                                                            </Box>
                                                        </Grid>
                                                    </Card>
                                                </CardContent>
                                            </PerfectScrollbar>
                                        </Card>
                                    </Box>
                                </form>
                            );
                        }}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    )
}




















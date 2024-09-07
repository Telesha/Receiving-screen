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
    InputLabel,
    Checkbox
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import { useAlert } from "react-alert";
import PageHeader from 'src/views/Common/PageHeader';
import MaterialTable from "material-table";
import moment from 'moment';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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
    colorRecordAndNew: {
        backgroundColor: "#FFBE00"
    },
    colorRecord: {
        backgroundColor: "green",
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
}));

const screenCode = 'EMPLOYEELEAVEFORM';

export default function EmployeeLeaveFormListing() {
    const [open, setOpen] = useState(false);
    const [openApprove, setOpenApprove] = useState(false);
    const [title, setTitle] = useState("Employee Leave Requests")
    const classes = useStyles();
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();
    const [division, setDivision] = useState();
    const [leaveFormData, setLeaveFormData] = useState({
        groupID: 0,
        factoryID: 0,
        divisionID: 0,
        regNo: ''
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isLeaveRequestApproveReject: false
    });
    const [leaveRequestData, setLeaveRequestData] = useState([]);
    const [found, setFound] = useState([]);
    let encryptedID = "";
    const navigate = useNavigate();

    const handleClick = () => {
        encryptedID = btoa('0');
        navigate('/app/employeeLeaveForm/addEdit/' + encryptedID);
    }

    const handleOpenDialog = () => {
        setOpen(true);
    };

    const handleOpenDialogApprove = () => {
        setOpenApprove(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleCloseDialogApprove = () => {
        setOpenApprove(false);
    };

    const handleReject = async () => {

        let rejectarray = [];
        selectedRows.forEach(x => {
            x.details.forEach(y => {
                if (y.employeeLeaveRequestStatusID == 1) {
                    rejectarray.push({
                        employeeLeaveRequestID: y.employeeLeaveRequestID,
                        registrationNumber: x.registrationNumber,
                        employeeID: x.employeeID,
                        noOfDays: y.noOfDays,
                        leaveTypeID: y.leaveTypeID,
                        isPayment: x.isPayment,
                        fromDate: y.fromDate,
                        toDate: y.toDate,
                        ModifiedBy: parseInt(tokenService.getUserIDFromToken()),
                        leaveRefNo: x.leaveRefNo
                    })
                }
            })
        })

        const response = await services.SaveRejectedLeaveRequest(rejectarray);
        if (response.statusCode === "Success") {
            setOpen(false);
            alert.success(response.message);
            setSelectedRows([]);
            trackPromise(getAllLeaveRequestDetailsByGroupFactory());
        }
    }

    const EditLeaveFormData = (leaveRefNo) => {
        encryptedID = btoa(leaveRefNo.toString());
        let filtermodel = {
            groupID: parseInt(leaveFormData.groupID),
            factoryID: parseInt(leaveFormData.factoryID),
            divisionID: parseInt(leaveFormData.divisionID),
            registrationNumber: leaveFormData.regNo
        }
        sessionStorage.setItem('leavelisting_page_filters', JSON.stringify(filtermodel));
        navigate('/app/employeeLeaveForm/addEdit/' + encryptedID);
    }

    const alert = useAlert();
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        sessionStorage.removeItem('leavelisting_page_filters');
    }, []);

    useEffect(() => {
        trackPromise(getFactoriesForDropDown());
    }, [leaveFormData.groupID]);

    useEffect(() => {
        trackPromise(getCostCenterDetailsByGardenID());
    }, [leaveFormData.factoryID]);

    useEffect(() => {
        setLeaveRequestData([]);
    }, [leaveFormData.groupID]);

    useEffect(() => {
        setLeaveRequestData([]);
    }, [leaveFormData.factoryID]);

    useEffect(() => {
        setLeaveRequestData([]);
    }, [leaveFormData.divisionID]);

    useEffect(() => {
        setLeaveRequestData([]);
    }, [leaveFormData.regNo]);

    async function getPermission() {
        const checkhistory = JSON.parse(sessionStorage.getItem('leavelisting_page_filters'));
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEELEAVEFORM');

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

        if (checkhistory == null) {
            setLeaveFormData((leaveFormData) => ({
                ...leaveFormData,
                groupID: parseInt(tokenService.getGroupIDFromToken()),
                factoryID: parseInt(tokenService.getFactoryIDFromToken())
            }))
        }
        else {
            let model = {
                groupID: parseInt(checkhistory.groupID),
                factoryID: parseInt(checkhistory.factoryID),
                registrationNumber: checkhistory.registrationNumber
            }
            setLeaveFormData((leaveFormData) => ({
                ...leaveFormData,
                groupID: parseInt(checkhistory.groupID),
                factoryID: parseInt(checkhistory.factoryID),
                regNo: checkhistory.registrationNumber
            }))
            trackPromise(getPreviousLeave(model));
        }
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(leaveFormData.groupID);
        setFactories(factory);
    }

    async function getCostCenterDetailsByGardenID() {
        var response = await services.getDivisionDetailsByEstateID(leaveFormData.factoryID);
        var generated = generateDropDownMenu(response)
        if (generated.length > 0) {
            setLeaveFormData((leaveFormData) => ({
                ...leaveFormData,
                divisionID: generated[0].props.value,
            }));
        }
        setDivision(response);
    };

    async function getAllLeaveRequestDetailsByGroupFactory() {
        let model = {
            groupID: parseInt(leaveFormData.groupID),
            factoryID: parseInt(leaveFormData.factoryID),
            divisionID: parseInt(leaveFormData.divisionID),
            registrationNumber: leaveFormData.regNo
        }
        const verify = await services.getAllLeaveRequestDetailsByGroupFactory(model);
        setLeaveRequestData([]);
        if (verify.data.length > 0) {
            const found = verify.data.filter(x => x.pending != 0)
            setFound(found)
            setLeaveRequestData(verify.data);
        }
        else {
            alert.error("No Records to Display");
        }
    }

    async function getPreviousLeave(params) {
        const verify = await services.getAllLeaveRequestDetailsByGroupFactory(params);
        setLeaveRequestData([]);
        if (verify.data.length > 0) {
            setLeaveRequestData(verify.data);
            const found = verify.data.filter(x => x.pending != 0)
            setFound(found)
        }
        else {
            alert.error("No Records to Display");
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
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleClick}
                        isEdit={true}
                        toolTiptitle={"Add Leave Form"}
                    />
                </Grid>
            </Grid>
        )
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setLeaveFormData({
            ...leaveFormData,
            [e.target.name]: value
        });
    }

    async function handleApproveClick() {
        let array = [];
        selectedRows.forEach(x => {
            x.details.forEach(y => {
                if (y.employeeLeaveRequestStatusID == 1) {
                    array.push({
                        employeeLeaveRequestID: y.employeeLeaveRequestID,
                        registrationNumber: x.registrationNumber,
                        employeeID: x.employeeID,
                        noOfDays: y.noOfDays,
                        leaveTypeID: y.leaveTypeID,
                        isPayment: x.isPayment,
                        fromDate: y.fromDate,
                        toDate: y.toDate,
                        ModifiedBy: parseInt(tokenService.getUserIDFromToken()),
                        leaveRefNo: x.leaveRefNo
                    })
                }
            })
        })
        let model = {
            approve: array
        }
        const response = await services.SaveApprovedLeaveRequest(model);
        if (response.statusCode == "Success") {
            setOpenApprove(false);
            alert.success(response.message);
            setSelectedRows([]);
            getAllLeaveRequestDetailsByGroupFactory();
        }
    }

    function handleClickAll(e) {
        let uploadDataCopy = [...selectedRows];
        if (e.target.checked) {
            leaveRequestData.forEach(x => {
                if (x.pending != 0) {
                    const isEnable = uploadDataCopy.filter((p) => p.leaveRefNo == x.leaveRefNo);
                    if (isEnable.length === 0) {
                        uploadDataCopy.push(x);
                    }
                }
            });
            setSelectedRows(uploadDataCopy);
        }
        else {
            setSelectedRows([]);
        }
    }

    const [checkAll, setCheckAll] = useState(false);
    const selectAll = () => {
        setCheckAll(!checkAll);
    };

    function handleClickOne(data) {
        let uploadDataCopy = [...selectedRows];
        const isEnable = uploadDataCopy.filter((p) => p.leaveRefNo == data.leaveRefNo);
        if (isEnable.length === 0) {
            uploadDataCopy.push(data)
        } else {
            var index = uploadDataCopy.indexOf(isEnable[0]);
            uploadDataCopy.splice(index, 1);
        }
        setSelectedRows(uploadDataCopy);
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: leaveFormData.groupID,
                            factoryID: leaveFormData.factoryID,
                            divisionID: leaveFormData.divisionID,
                            regNo: leaveFormData.regNo,
                            fromdate: leaveFormData.fromDate,
                            toDate: leaveFormData.toDate
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                                divisionID: Yup.number().required('Cost Center is required').min("1", 'Cost Center is required')
                            })
                        }
                        onSubmit={() => trackPromise(getAllLeaveRequestDetailsByGroupFactory())}
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
                                            <CardContent style={{ marginBottom: "2rem" }}>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group   *
                                                        </InputLabel>
                                                        <TextField select
                                                            fullWidth
                                                            size='small'
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={leaveFormData.groupID}
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
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
                                                            fullWidth
                                                            size='small'
                                                            name="factoryID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={leaveFormData.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="regNo">
                                                            Registration Number
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.regNo && errors.regNo)}
                                                            fullWidth
                                                            helperText={touched.regNo && errors.regNo}
                                                            size='small'
                                                            name="regNo"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={leaveFormData.regNo}
                                                            variant="outlined"
                                                            id="regNo"
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        type="submit"
                                                        style={{ marginLeft: 10 }}
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                            {leaveRequestData.length > 0 ?
                                                <Box minWidth={1000}>
                                                    <MaterialTable
                                                        title="Multiple Actions Preview"
                                                        columns={[
                                                            { title: 'Employee Name', field: 'employeeName' },
                                                            { title: 'Registration No', field: 'registrationNumber' },
                                                            { title: 'Leave Type', field: 'employeeLeaveTypeName' },
                                                            { title: 'F.Date', field: 'fromDate', render: rowData => moment(rowData.fromDate).format('YYYY-MM-DD') },
                                                            { title: 'T.Date', field: 'toDate', render: rowData => moment(rowData.toDate).format('YYYY-MM-DD') },
                                                            { title: 'Applied', field: 'noOfDays', render: rowData => rowData.pending + rowData.approved + rowData.rejected },
                                                            { title: 'Pending', field: 'pending' },
                                                            { title: 'Approved', field: 'approved' },
                                                            { title: 'Rejected', field: 'rejected' },
                                                            {
                                                                title: (
                                                                    <label>
                                                                        {found.length > 0 ? "Select" : "Select"}
                                                                        {found.length > 0 ? (
                                                                            <Checkbox
                                                                                color="primary"
                                                                                onClick={(e) => handleClickAll(e)}
                                                                                onChange={selectAll}
                                                                                checked={(leaveRequestData.length != 0) && (selectedRows.length == leaveRequestData.filter(x => x.pending != 0).length)}
                                                                            ></Checkbox>
                                                                        ) : (
                                                                            null
                                                                        )}
                                                                    </label>
                                                                ),
                                                                render: rowData => {
                                                                    return (
                                                                        <Checkbox
                                                                            color="primary"
                                                                            onClick={() => handleClickOne(rowData)}
                                                                            disabled={rowData.pending == 0 ? true : false}
                                                                            checked={!(selectedRows.find((x) => x.leaveRefNo == rowData.leaveRefNo) == undefined)}
                                                                        ></Checkbox>
                                                                    );
                                                                },
                                                            }
                                                        ]}
                                                        data={leaveRequestData}
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
                                                                icon: 'edit',
                                                                tooltip: 'Edit Employee',
                                                                onClick: (event, leaveRequestData) => EditLeaveFormData(leaveRequestData.leaveRefNo)
                                                            }
                                                        ]}
                                                    />
                                                </Box>
                                                : null}
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                {(leaveFormData.employeeRequestStatusID == 0 || leaveFormData.employeeRequestStatusID == 1) ?
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        type="submit"
                                                        style={{ marginLeft: 10 }}
                                                    >
                                                        {"Send To Approve"}
                                                    </Button>
                                                    : null}
                                                {permissionList.isLeaveRequestApproveReject && selectedRows.length > 0 && leaveRequestData.length > 0 ?
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        style={{ marginLeft: 10 }}
                                                        className={classes.colorApprove}
                                                        onClick={() => handleOpenDialogApprove()}
                                                    >
                                                        Approve
                                                    </Button>
                                                    : null}
                                                {permissionList.isLeaveRequestApproveReject && selectedRows.length > 0 && leaveRequestData.length > 0 ?
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        style={{ marginRight: '1rem', marginLeft: 10 }}
                                                        className={classes.colorReject}
                                                        onClick={() => handleOpenDialog()}
                                                    >
                                                        Reject
                                                    </Button>
                                                    : null}
                                                <Dialog open={openApprove}
                                                    onClose={handleCloseDialogApprove}
                                                    maxWidth="sm" fullWidth>
                                                    <DialogTitle>Confirm Approve</DialogTitle>
                                                    <DialogContent>
                                                        <DialogContentText style={{ fontSize: '18px' }}>
                                                            Are you sure you want to Approve this request?
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button
                                                            onClick={() => trackPromise(handleApproveClick())}
                                                            color="primary" autoFocus>
                                                            Yes
                                                        </Button>
                                                        <Button
                                                            onClick={handleCloseDialogApprove}
                                                            color="primary">
                                                            No
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
                                                <Dialog open={open}
                                                    onClose={handleCloseDialog}
                                                    maxWidth="sm" fullWidth>
                                                    <DialogTitle>Confirm Reject</DialogTitle>
                                                    <DialogContent>
                                                        <DialogContentText style={{ fontSize: '18px' }}>
                                                            Are you sure you want to Reject this request?
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button
                                                            onClick={() => trackPromise(handleReject())}
                                                            color="primary" autoFocus>
                                                            Yes
                                                        </Button>
                                                        <Button
                                                            onClick={handleCloseDialog}
                                                            color="primary">
                                                            No
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
                                            </Box>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment >
    )
}
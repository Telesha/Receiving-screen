import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Checkbox, Chip } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { confirmAlert } from 'react-confirm-alert';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    avatar: {
        marginRight: theme.spacing(2)
    }
}));

const screenCode = 'CASHADVANCEISSUE';

export default function CashAdvanceIssue(props) {

    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [isEditable, setIsEditable] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [uploadData, setUploadData] = useState([]);
    const [cashAdvanceIssueViewData, setCashAdvanceIssueViewData] = useState([]);
    const [cashAdvanceIssueDetails, setCashAdvanceIssueDetails] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        empNo: '',
        year: new Date().getUTCFullYear().toString(),
        month: ((new Date().getUTCMonth()) + 1).toString().padStart(2, '0'),
    });
    const [selectedSearchValues, setSelectedSearchValues] = useState({
        groupID: '0',
        estateID: '0',
        divisionID: 0,
        empNo: '',
        year: '',
        month: '',
        monthName: ''

    });

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
        isCashAdvanceRequestApproveEnabled: false,
    });

    useEffect(() => {
        trackPromise(getPermissions(), getGroupsForDropdown());
    }, []);

    useEffect(() => {
        setCashAdvanceIssueViewData([]);
        if (cashAdvanceIssueDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
        setCashAdvanceIssueDetails({
            ...cashAdvanceIssueDetails,
            divisionID: 0,
            empNo: '',
        });
    }, [cashAdvanceIssueDetails.groupID]);

    useEffect(() => {
        setCashAdvanceIssueViewData([]);
        if (cashAdvanceIssueDetails.estateID > 0) {
            trackPromise(
                getDivisionDetailsByEstateID());
        };
        setCashAdvanceIssueDetails({
            ...cashAdvanceIssueDetails,
            divisionID: 0,
            empNo: '',
        });
    }, [cashAdvanceIssueDetails.estateID]);

    useEffect(() => {
        setCashAdvanceIssueViewData([]);
        setCashAdvanceIssueDetails({
            ...cashAdvanceIssueDetails,
            empNo: '',
        });
    }, [cashAdvanceIssueDetails.divisionID])

    useEffect(() => {
        setCashAdvanceIssueViewData([]);
    }, [cashAdvanceIssueDetails.empNo]);

    useEffect(() => {
        setCashAdvanceIssueViewData([]);
    }, [selectedDate]);

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCASHADVANCEISSUE');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
        var isCashAdvanceRequestApproveEnabled = permissions.find(p => p.permissionCode == 'APPROVECASHADVANCEREQUEST');
        if (isCashAdvanceRequestApproveEnabled != undefined) {
            setIsEditable(true);
        }
        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
            isCashAdvanceRequestApproveEnabled: isCashAdvanceRequestApproveEnabled !== undefined,
        });
        setCashAdvanceIssueDetails({
            ...cashAdvanceIssueDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken()),
        });

    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(cashAdvanceIssueDetails.groupID);
        setEstates(response);
    };

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(cashAdvanceIssueDetails.estateID);
        setDivisions(response);
    };

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
        const value = target.value
        setCashAdvanceIssueDetails({
            ...cashAdvanceIssueDetails,
            [e.target.name]: value
        });
        setCashAdvanceIssueViewData([]);
    }

    function handleDateChange(date) {

        let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); //months from 1-12
        var year = date.getUTCFullYear();
        var currentmonth = moment().format('MM');
        let monthName = monthNames[month - 1];

        setCashAdvanceIssueDetails({
            ...cashAdvanceIssueDetails,
            month: month.toString(),
            year: year.toString()
        });

        setSelectedSearchValues({
            ...selectedSearchValues,
            monthName: monthName
        }); 

        if (selectedDate != null) {

            var prevMonth = selectedDate.getUTCMonth() + 1
            var prevyear = selectedDate.getUTCFullYear();

            if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
                setSelectedDate(date)
            }
        } else {
            setSelectedDate(date)
        }
    }

    function clearFields() {
        setCashAdvanceIssueDetails({
            ...cashAdvanceIssueDetails,
            divisionID: 0,
            empNo: '',
            month: '',
            year: ''
        });
        setSelectedDate(new Date());
        setCashAdvanceIssueViewData([]);
    }

    async function getData() {
        let model = {
            groupID: parseInt(cashAdvanceIssueDetails.groupID),
            estateID: parseInt(cashAdvanceIssueDetails.estateID),
            divisionID: parseInt(cashAdvanceIssueDetails.divisionID),
            empNo: cashAdvanceIssueDetails.empNo,
            month: cashAdvanceIssueDetails.month,
            year: cashAdvanceIssueDetails.year,
            date: selectedDate
        }
        let response = await services.GetCashAdvanceIssueViewData(model);
        if (response.statusCode == "Success" && response.data.length != 0) {
            setCashAdvanceIssueViewData(response.data);
        }
        else {
            alert.error("NO RECORDS TO DISPLAY!")
            clearFields();
        }
    }

    const [checkAll, setCheckAll] = useState(false);

    const selectAll = () => {
        setCheckAll(!checkAll);
    };

    function handleClickAll(e) {
        let uploadDataCopy = [...uploadData];
        if (e.target.checked) {
            cashAdvanceIssueViewData.forEach(x => {
                if (x.statusID == 1) {
                    const isEnable = uploadDataCopy.filter((p) => p.cashAdvanceRequestID == x.cashAdvanceRequestID);
                    if (isEnable.length === 0) {
                        uploadDataCopy.push(x);
                    }
                }
            });
            setUploadData(uploadDataCopy);
        }
        else {
            setUploadData([]);
        }
    }

    function handleClickOne(data) {
        let uploadDataCopy = [...uploadData];
        const isEnable = uploadDataCopy.filter((p) => p.cashAdvanceRequestID == data.cashAdvanceRequestID);
        if (isEnable.length === 0) {
            uploadDataCopy.push(data)
        } else {
            var index = uploadDataCopy.indexOf(isEnable[0]);
            uploadDataCopy.splice(index, 1);
        }
        setUploadData(uploadDataCopy);
    }

    async function handleApproveClick() {
        let array = [];
        uploadData.forEach(x => {
            array.push({
                cashAdvanceRequestID: x.cashAdvanceRequestID,
                amount: x.amount,
                ModifiedBy: parseInt(tokenService.getUserIDFromToken())
            })
        })
        const response = await services.ApproveCashAdvanceRequest(array);
        if (response.statusCode == "Success") {
            setCashAdvanceIssueViewData([])
            setUploadData([]) 
            alert.success(response.message);
        }
        else {
            setCashAdvanceIssueViewData([])
            setUploadData([]) 
            alert.error("Cash Advance Request Unsuccessful");
        }
    }

    const handleClose = () => {
    };

    async function ConfirmApprove() {


        confirmAlert({
            title: 'Confirm Approval',
            message: 'Are you sure you want to approve these requests?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => trackPromise(handleApproveClick())
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

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
            </Grid>
        )
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page
                className={classes.root}
                title="Cash Advance Issue"
            >
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: cashAdvanceIssueDetails.groupID,
                            estateID: cashAdvanceIssueDetails.estateID,
                            divisionID: cashAdvanceIssueDetails.divisionID
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Factory required').min("1", 'Factory is required'),
                            })
                        }
                        onSubmit={() => trackPromise(getData())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            touched,
                            values,
                            props
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader
                                            title={cardTitle("Cash Advance Issue")}
                                        />
                                        <PerfectScrollbar>
                                            <Divider />
                                            <CardContent style={{ marginBottom: "2rem" }}>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            helperText={touched.groupID && errors.groupID}
                                                            fullWidth
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={cashAdvanceIssueDetails.groupID}
                                                            variant="outlined"
                                                            size="small"
                                                            onBlur={handleBlur}
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
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
                                                            value={cashAdvanceIssueDetails.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                                            }}
                                                        >
                                                            <MenuItem value={0}>--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estates)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="divisionID">
                                                            Division
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            fullWidth
                                                            name="divisionID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={cashAdvanceIssueDetails.divisionID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
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
                                                            value={cashAdvanceIssueDetails.empNo}
                                                            variant="outlined"
                                                            id="empNo"
                                                            type="text"
                                                        >
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <DatePicker
                                                                autoOk
                                                                variant="inline"
                                                                openTo="month"
                                                                views={["year", "month"]}
                                                                label="Year and Month *"
                                                                helperText="Select appicable month"
                                                                value={selectedDate}
                                                                disableFuture={true}
                                                                onChange={(date) => handleDateChange(date)}
                                                                size='small'
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                </Grid>
                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        type="submit"
                                                        variant="contained"
                                                    >
                                                        Search
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                            {cashAdvanceIssueViewData.length > 0 ?
                                                <Box minWidth={1000}>
                                                    {isEditable ?
                                                        <MaterialTable
                                                            columns={[
                                                                { title: 'Employee No', field: 'registrationNumber', editable: 'never' },
                                                                { title: 'Employee Name', field: 'employeeName', editable: 'never' },
                                                                { title: 'Advance Amount', field: 'amount', type: 'numeric',
                                                                validate: rowData => (rowData.amount >= 0 && rowData.amount <= 5000),
                                                                render: rowData => rowData.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) , 
                                                                cellStyle: { color: '##032341', paddingRight: '100px'}, 
                                                                headerStyle: {textAlign: 'right', paddingRight: '100px'},
                                                                editable: 'always'},
                                                                { title: 'Status', field: 'statusID', editable: 'never',
                                                                    render: rowData => {
                                                                        let label, color;
                                                                        switch (rowData.statusID) {
                                                                            case 1:
                                                                                label = 'Pending';
                                                                                color = 'default';
                                                                                break;
                                                                            case 2:
                                                                                label = 'Approved';
                                                                                color = 'success';
                                                                                break;
                                                                            default:
                                                                                label = 'Rejected';
                                                                                color = 'error';
                                                                                break;
                                                                        }
                                                                        return <Chip variant="outlined" label={label} color={color} />;
                                                                    }
                                                                },
                                                                {
                                                                    title: (
                                                                        <label>
                                                                            {cashAdvanceIssueViewData.length > 0 ? "Select All" : "Select"}
                                                                            <Checkbox
                                                                                color="primary"
                                                                                onClick={(e) => handleClickAll(e)}
                                                                                onChange={selectAll}
                                                                                checked={cashAdvanceIssueViewData.length != 0 && uploadData.length == cashAdvanceIssueViewData.filter((x, index) => index < 100 && x.statusID != 0).length}
                                                                            ></Checkbox>
                                                                        </label>
                                                                    ),
                                                                    editable: 'never',
                                                                    sorting: false,
                                                                    field: "selected",
                                                                    cellStyle: { textAlign: 'right'}, 
                                                                    headerStyle: {textAlign: 'right'},
                                                                    render: (data) => {
                                                                        if (data.statusID != 1) {
                                                                            return (
                                                                                <Checkbox
                                                                                    defaultChecked
                                                                                    indeterminate
                                                                                    disabled
                                                                                />
                                                                            );
                                                                        } else {
                                                                            return (
                                                                                <Checkbox
                                                                                    color="primary"
                                                                                    align="right"
                                                                                    onClick={() => handleClickOne(data)}
                                                                                    disabled={data.statusID != 1 ? true : false}
                                                                                    checked={!(uploadData.find((x) => x.cashAdvanceRequestID == data.cashAdvanceRequestID) == undefined)}
                                                                                ></Checkbox>
                                                                            );
                                                                        }
                                                                    }
                                                                },
                                                            ]}
                                                            data={cashAdvanceIssueViewData}
                                                            editable={{
                                                                onRowUpdate: (newData, oldData) =>
                                                                    new Promise((resolve, reject) => {
                                                                        setTimeout(() => {
                                                                            const dataUpdate = [...cashAdvanceIssueViewData];
                                                                            const index = oldData.tableData.id;
                                                                            dataUpdate[index] = newData;
                                                                            setCashAdvanceIssueViewData([...dataUpdate]);

                                                                            const dataUpdate2 = [...uploadData];
                                                                            const index2 = oldData.tableData.id;
                                                                            dataUpdate2[index2] = newData;
                                                                            setUploadData([...dataUpdate2]);
                                                                            resolve();
                                                                        }, 1000)
                                                                    })
                                                            }}
                                                            options={{
                                                                exportButton: false,
                                                                showTitle: false,
                                                                headerStyle: { textAlign: "left", height: '1%' },
                                                                cellStyle: { textAlign: "left" },
                                                                columnResizable: false,
                                                                actionsColumnIndex: 4
                                                            }} /> :
                                                        <MaterialTable
                                                            columns={[
                                                                { title: 'Employee No', field: 'registrationNumber', editable: 'never',width:'25%', },
                                                                { title: 'Employee Name', field: 'employeeName', editable: 'never',width:'25%', },
                                                                { title: 'Advance Amount', field: 'amount' , type: 'numeric', 
                                                                render: rowData => rowData.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) , 
                                                                cellStyle: { color: '##032341', paddingRight: '100px'}, 
                                                                headerStyle: {textAlign: 'right', paddingRight: '100px'}, 
                                                                editable: 'never',width:'25%'},
                                                                { title: 'Status',field: 'statusID',editable: 'never',width:'25%',
                                                                    render: rowData => {
                                                                        let label, color;
                                                                        switch (rowData.statusID) {
                                                                            case 1:
                                                                                label = 'Pending';
                                                                                color = 'default';
                                                                                break;
                                                                            case 2:
                                                                                label = 'Approved';
                                                                                color = 'success';
                                                                                break;
                                                                            default:
                                                                                label = 'Rejected';
                                                                                color = 'error';
                                                                                break;
                                                                        }
                                                                        return <Chip variant="outlined" label={label} color={color} />;
                                                                    }
                                                                }
                                                            ]}
                                                            data={cashAdvanceIssueViewData}
                                                            options={{
                                                                exportButton: false,
                                                                showTitle: false,
                                                                headerStyle: { textAlign: "left", height: '1%' },
                                                                cellStyle: { textAlign: "left" },
                                                                columnResizable: false
                                                            }}
                                                        />}
                                                </Box>
                                                : null}
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                {cashAdvanceIssueViewData.length > 0 && uploadData.length > 0 && isEditable ?
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        style={{ marginLeft: 10 }}
                                                        className={classes.colorApprove}
                                                        onClick={() => ConfirmApprove()}
                                                    >
                                                        Approve
                                                    </Button>
                                                    : null}
                                            </Box>

                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page >
        </Fragment>
    )
}
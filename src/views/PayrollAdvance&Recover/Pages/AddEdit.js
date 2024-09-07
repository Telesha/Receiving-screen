import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Typography, DialogContentText, Divider, MenuItem, Grid, InputLabel, TextField, TableCell, TableRow, TableContainer, TableBody, Table, TableHead } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import DeleteIcon from '@material-ui/icons/Delete';
import tokenDecoder from '../../../utils/tokenDecoder';
import { useParams } from 'react-router-dom';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
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
    table: {
        minWidth: 550,
    },
}));

const screenCode = "PAYROLLADVANCE"

export default function PayrollAdvanceAddEdit(props) {

    const classes = useStyles();
    const navigate = useNavigate();
    const alert = useAlert();
    const [title, setTitle] = useState("Add Payroll Advance ")
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [ArrayField, setArrayField] = useState([]);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [employeeNumber, setEmployeeNumber] = useState("");
    const [backConfirmation, setBackConfirmation] = useState(false);
    const [employeeListArray, setEmployeeListArray] = useState([]);
    const [employeeID, setEmployeeID] = useState(0);
    const [payRollDetails, setpayRollDetails] = useState({
        groupID: 0,
        estateID: 0,
        date: new Date().toISOString().substring(0, 10),
        employeeNumber: '',
        empName: '',
        amount: '',
        description: ''
    });
    const { advanceIssueID } = useParams();
    let decrypted = 0
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const empNoRef = useRef(null);
    const amountRef = useRef(null);
    const descriptionRef = useRef(null);
    const addButtonRef = useRef(null);

    useEffect(() => {
        decrypted = atob(advanceIssueID.toString());
        if (parseInt(decrypted) > 0) {
            setIsUpdate(true);
            getDetailsByPayrollAdvanceID(decrypted);
        }
    }, []);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        if (payRollDetails.groupID !== 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [payRollDetails.groupID]);

    useEffect(() => {
        if (payRollDetails.estateID !== 0) {
            trackPromise(getEmployeesByEstateID());
        };
    }, [payRollDetails.groupID, payRollDetails.estateID]);

    useEffect(() => {
        if (!isUpdate) {
            setpayRollDetails({
                ...payRollDetails,
                empName: '',
                amount: '',
                description: ''
            })
        }
    }, [payRollDetails.empNo])


    useEffect(() => {
        if (employeeNumber !== "" && !isUpdate) {
            FindEmployeeFromEmployeeArray()
        }
    }, [employeeNumber]);

    const handleClick = () => {

        navigate('/app/payrolladvance/listing');
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWADVANCEPAYROLL');

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

        setpayRollDetails({
            ...payRollDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(payRollDetails.groupID);
        setEstates(response);
    };

    async function FindEmployeeFromEmployeeArray() {
        var employee = employeeListArray.find(x => x.regNo === employeeNumber);
        if (employee !== undefined) {
            setEmployeeID(employee.employeeID);

            setpayRollDetails({
                ...payRollDetails,
                empName: employee.employeeName
            })
        }
    };

    function clearData() {
        setpayRollDetails({
            ...payRollDetails,
            estateID: 0,
            date: new Date().toISOString().substring(0, 10),
            empNo: '',
            empName: '',
            amount: '',
            description: ''
        });
        setEmployeeNumber([])
    }

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getEmployeesByEstateID() {
        const employees = await services.getEmployeesByEstateID(payRollDetails.estateID);
        setEmployeeListArray(employees);
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
        const value = target.value
        setpayRollDetails({
            ...payRollDetails,
            [e.target.name]: value
        });
    }

    function handleChangeempNo(e) {
        const target = e.target;
        const value = target.value
        setEmployeeNumber(value)
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

        setpayRollDetails({
            ...payRollDetails,
            [target.name]: value
        });

    }

    const handleKeyDown = (event, nextInputRef) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            nextInputRef.current.focus();
        }
    }

    const handleKeyDownButton = (event) => {
        if (event.key === 'Enter') {
            saveDetails()
        }
    }

    async function InactivDetails(row, index) {
        {
            const dataDelete = [...ArrayField];
            const remove = index;
            dataDelete.splice(remove, 1);
            setArrayField([...dataDelete]);
        }
    };

    async function saveDetails() {
        if (isUpdate == true) {
            let model = {
                advanceIssueID: parseInt(atob(advanceIssueID).toString()),
                description: payRollDetails.description,
                amount: parseFloat(payRollDetails.amount),
            }
            let response = await services.UpdatePayrollAdvance(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setArrayField([]);
                navigate('/app/payrolladvance/listing');
            } else {
                alert.error(response.message);
            }

        } else {
            let model = {
                groupID: parseInt(payRollDetails.groupID),
                empNo: employeeNumber,
                createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
                employeeID: parseInt(employeeID),
                empName: payRollDetails.empName,
                amount: parseFloat(payRollDetails.amount),
                description: payRollDetails.description,
                estateID: payRollDetails.estateID,
                date: moment(payRollDetails.createdDate).format('YYYY-MM-DD'),
            }

            let response = await services.saveDetails(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(false);
                setArrayField([]);
                navigate('/app/payrolladvance/listing');
                setIsDisableButton(true);
            }
            else {
                alert.error(response.message);
            }
        }
    }

    async function getDetailsByPayrollAdvanceID(advanceIssueID) {
        const payRoll = await services.GetDetailsByPayRollAdvanceID(advanceIssueID);
        setIsUpdate(true);
        setpayRollDetails({
            ...payRollDetails,
            groupID: parseInt(payRoll.groupID),
            estateID: parseInt(payRoll.estateID),
            date: moment(payRoll.createdDate).format('YYYY-MM-DD'),
            employeeNumber: payRoll.regNo,
            empName: payRoll.employeeName,
            amount: parseFloat(payRoll.amount).toFixed(2),
            description: payRoll.description,
            modifiedBy: parseInt(tokenDecoder.getUserIDFromToken()),
            advanceIssueID: parseInt(payRoll.advanceIssueID),
            modifiedDate: new Date().toISOString()
        })
        setEmployeeNumber(payRoll.regNo)
        setTitle("Edit Payroll Advance");
    }

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                <Grid item md={2} xs={12}>
                    <PageHeader
                        onClick={handleConfirmBackOne}
                    />
                </Grid>
            </Grid>
        )
    }

    function handleConfirmBack() {
        setBackConfirmation(false)
    }

    function handleConfirmBackOpen() {
        setBackConfirmation(true)
    }

    function handleConfirmBackOne() {
        if (ArrayField.length != 0) {
            handleConfirmBackOpen()
        }
        else {
            handleClick()
        }
    }

    const handleConfirmBackTwo = () => {
        // saveDetails();
        setBackConfirmation(false);
        navigate('/app/payrolladvance/listing');
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page
                className={classes.root}
                title={title}
            >
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: payRollDetails.groupID,
                            estateID: payRollDetails.estateID,
                            date: payRollDetails.date,
                            empName: payRollDetails.empName,
                            empNo: employeeNumber,
                            amount: payRollDetails.amount,
                            description: payRollDetails.description
                        }}

                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                                empNo: Yup.string().required('Emp No is required'),
                            })
                        }
                        onSubmit={() => trackPromise(saveDetails())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
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
                                                            Group  *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            helperText={touched.groupID && errors.groupID}
                                                            fullWidth
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={payRollDetails.groupID}
                                                            variant="outlined"
                                                            disabled={isUpdate}
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
                                                            disabled={isUpdate}
                                                            size='small'
                                                            onChange={(e) => {
                                                                handleChange(e)
                                                            }}
                                                            value={payRollDetails.estateID}
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
                                                        <InputLabel shrink id="date">
                                                            Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="date"
                                                            type="date"
                                                            value={payRollDetails.date}
                                                            variant="outlined"
                                                            id="date"
                                                            size="small"
                                                            onChange={(e) => handleChange(e)}
                                                            inputProps={{
                                                                min: new Date().toISOString().split('T')[0],
                                                                max: new Date().toISOString().split('T')[0],
                                                            }}
                                                            required
                                                            disabled={isUpdate}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
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
                                                            onChange={(e) => handleChangeempNo(e)}
                                                            value={employeeNumber}
                                                            variant="outlined"
                                                            id="empNo"
                                                            inputRef={empNoRef}
                                                            onKeyDown={(e) => handleKeyDown(e, amountRef)}
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
                                                            value={payRollDetails.empName}
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
                                                        <InputLabel shrink id="amount">
                                                            Amount *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.amount && errors.amount)}
                                                            helperText={touched.amount && errors.amount}
                                                            fullWidth
                                                            size='small'
                                                            name="amount"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChangeForAmount(e)}
                                                            value={payRollDetails.amount}
                                                            variant="outlined"
                                                            inputRef={amountRef}
                                                            onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="description">
                                                            Description
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.description && errors.description)}
                                                            helperText={touched.description && errors.description}
                                                            fullWidth
                                                            size='small'
                                                            name="description"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={payRollDetails.description}
                                                            variant="outlined"
                                                            inputRef={descriptionRef}
                                                        // onKeyDown={(e) => handleKeyDown(e, addButtonRef)}
                                                        />
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
                                                            size='small'
                                                            type="submit"
                                                            inputRef={addButtonRef}
                                                            onKeyDown={(e) => handleKeyDownButton(e)}
                                                            disabled={payRollDetails.empName == "" ? true : false}
                                                        >
                                                            {isUpdate == true ? "Update" : "Save"}
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </CardContent>
                                            {ArrayField.length > 0 ? (
                                                <Grid item xs={12}>
                                                    <TableContainer>
                                                        <Table className={classes.table} aria-label="caption table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center"><b>Date</b></TableCell>
                                                                    <TableCell align="center"><b>Employee No</b></TableCell>
                                                                    <TableCell align="right"><b>Amount (Rs.)</b></TableCell>
                                                                    <TableCell align="center"><b>Description</b></TableCell>
                                                                    <TableCell align="center"><b>Action</b></TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {ArrayField.map((row, index) => {
                                                                    return <TableRow key={index}>
                                                                        <TableCell align="center" >{row.date}
                                                                        </TableCell>
                                                                        <TableCell align="center" >{row.empNo}
                                                                        </TableCell>
                                                                        <TableCell align="right" >{row.amount}
                                                                        </TableCell>
                                                                        <TableCell align="center" >{row.description == "" ? '-' : row.description}
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
                                                                                onClick={() => InactivDetails(row, index)}
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
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
                <Dialog open={backConfirmation}>
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
                        <Button onClick={handleConfirmBackTwo} color="primary">
                            Yes
                        </Button>
                        <Button
                            onClick={handleConfirmBack} color="primary" autoFocus>
                            No
                        </Button>
                    </DialogActions>
                </Dialog>
            </Page >
        </Fragment>
    )
}
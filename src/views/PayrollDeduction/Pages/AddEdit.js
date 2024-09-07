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

const screenCode = "PAYROLLDEDUCTION"

export default function PayrollAddEdit(props) {
    const classes = useStyles();
    const navigate = useNavigate();
    let decrypted = 0
    const alert = useAlert();
    const [title, setTitle] = useState("Add Payroll Deduction")
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [deductionTypes, setDeductionTypes] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [ArrayField, setArrayField] = useState([]);
    const [arrayNewWareField, setArrayNewWareField] = useState([]);
    const [minDate, setMinDate] = useState([]);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [backConfirmation, setBackConfirmation] = useState(false);
    const [empName, setEmpName] = useState('');
    const [registrationNumberError, setRegistrationNumberError] = useState("");
    const [payrollDetails, setPayrollDetails] = useState({
        groupID: 0,
        estateID: 0,
        designationID:0,
        date: new Date().toISOString().substring(0, 10),
        regNo: '',
        empName: '',
        deductionType: 0,
        amount: '',
        description: '',
        payRollDeductionID:0,
        payRollDeductionTypeID:0,
    });

    const { payrollDeductionID } = useParams();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const empNoRef = useRef(null);
    const amountRef = useRef(null);
    const descriptionRef = useRef(null);
    const addButtonRef = useRef(null);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        if (payrollDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [payrollDetails.groupID]);

    useEffect(() => {
        if (payrollDetails.estateID > 0) {
            trackPromise(
                getDesignationsByFactoryID());
        };
    }, [payrollDetails.estateID]);

    useEffect(() => {
        if (payrollDetails.regNo != "") {
            (
                getEmployeeNumberByEmployeeName());
        }
    }, [payrollDetails.regNo,payrollDetails.estateID]);


    useEffect(() => {
        trackPromise(
            getDeductionTypes());
        if (!isUpdate) {
            setPayrollDetails({
                ...payrollDetails,
                deductionType: 0
            })
        }
    }, []);

    useEffect(() => {
        if (!isUpdate) {
            const startDate = new Date(payrollDetails.date);
            const firstDayOfPreviousMonth = new Date(startDate.getFullYear(), startDate.getMonth());
            const minDate = firstDayOfPreviousMonth.toISOString().split('T')[0];
            setMinDate(minDate);
        }
    }, [payrollDetails.date]);

    useEffect(() => {
        decrypted = atob(payrollDeductionID.toString());
        if (parseInt(decrypted) > 0) {
            setIsUpdate(true);
            getDetailsByPayrollDeductionID(decrypted);
        }
    }, []);

    useEffect(() => {
        if (!isUpdate) {
            const startDate = new Date(payrollDetails.date);
            const firstDayOfPreviousMonth = new Date(startDate.getFullYear(), startDate.getMonth());
            firstDayOfPreviousMonth.setDate(1);
            const minDate = firstDayOfPreviousMonth.toISOString().split('T')[0];
            setMinDate(minDate);
        }
    }, [payrollDetails.date]);

    const handleClick = () => {
        navigate('/app/payrollDeduction/listing');
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITPAYROLLDEDUCTION');

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

        setPayrollDetails({
            ...payrollDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(payrollDetails.groupID);
        setEstates(response);
    };

    async function getDesignationsByFactoryID() {
        var response = await services.getDesignationsByFactoryID(payrollDetails.estateID);
        setDesignation(response);
    };

    async function getEmployeeNumberByEmployeeName() {
        var response = await services.getEmployeeNumberByEmployeeName(payrollDetails.regNo,payrollDetails.estateID);
        if (response != null) {
            setEmpName(response.firstName);
        }
        else {
            setEmpName("");
        }
    };

    async function getDeductionTypes() {
        var response = await services.GetAllPayrollDeductionTypes();
        setDeductionTypes(response);
    };

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
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
        setPayrollDetails({
            ...payrollDetails,
            [e.target.name]: value
        });
    }

    function handleChangeForRegNumber(e) {
        const target = e.target;
        let value = target.value;

        if (/^[0-9]*$/.test(value)) {
            setRegistrationNumberError("");

            setPayrollDetails({
                ...payrollDetails,
                [target.name]: value
            });
        } else {
            setRegistrationNumberError("Invalid input. Please enter a valid Registration number.");
        }
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

        setPayrollDetails({
            ...payrollDetails,
            [target.name]: value
        });
    }

    const handleKeyDown = (event, nextInputRef) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            nextInputRef.current.focus();
        }
    }

    const handleKeyDown1 = (nextInputRef) => {
        nextInputRef.current.focus();
    }

    async function InactivDetails(row, index) {
        {
            const dataDelete = [...ArrayField];
            const remove = index;
            dataDelete.splice(remove, 1);
            setArrayField([...dataDelete]);
        }
    };

    async function handleClickAdd() {
        
        const isMatch = ArrayField.some(x =>
            x.regNo === payrollDetails.regNo && x.deductionType === parseInt(payrollDetails.deductionType)
        );
        if (isMatch) {
            alert.error("The record already exists!")
        } else {
                var array1 = [...ArrayField];
                var array2 = [...arrayNewWareField];

                array1.push({
                    groupID: parseInt(payrollDetails.groupID),
                    estateID: parseInt(payrollDetails.estateID),
                    designationID:parseInt(payrollDetails.designationID),
                    date: payrollDetails.date,
                    regNo: payrollDetails.regNo,
                    employeeName: empName,
                    deductionTypeName: deductionTypes[payrollDetails.deductionType],
                    amount: parseFloat(payrollDetails.amount).toFixed(2),
                    description: payrollDetails.description,
                    createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
                    payRollDeductionID: payrollDetails.payRollDeductionID,
                    payRollDeductionTypeID:parseInt(payrollDetails.deductionType),
                });

                setArrayField(array1);

                array2.push({
                    groupID: payrollDetails.groupID,
                    estateID: payrollDetails.estateID,
                    designationID: payrollDetails.designationID,
                    date: payrollDetails.date,
                    regNo: payrollDetails.regNo,
                    deductionType: payrollDetails.deductionType,
                    amount: payrollDetails.amount,
                    description: payrollDetails.description,
                    payRollDeductionID: payrollDetails.payRollDeductionID,
                    payRollDeductionTypeID:parseInt(payrollDetails.deductionType),
                });

                setArrayNewWareField('arr', array2);

                let dataModel = {
                    date: payrollDetails.date,
                    regNo: payrollDetails.regNo,
                    deductionType: payrollDetails.deductionType,
                    amount: parseFloat(payrollDetails.amount).toFixed(2),
                    description: payrollDetails.description
                }

                setPayrollDetails({
                    ...payrollDetails,
                    regNo: '',
                    description: '',
                    amount: ''
                })
                setEmpName('')
                handleKeyDown1(empNoRef)
        }
    }

    async function saveDetails(data) {
        setIsDisableButton(true);
        if (isUpdate == true) {
            setIsUpdate(true);
            let response = await services.UpdatePayRollDeduction(payrollDetails);
            
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setArrayField([]);
                navigate('/app/payrollDeduction/listing');
            }

            else {
                alert.error(response.message);
            }

        } else {
            setIsDisableButton(true);  
            let response = await services.saveDetails(ArrayField);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setArrayField([]);
                navigate('/app/payrollDeduction/listing');
                setIsDisableButton(true);
            }
            else {
                alert.error(response.message);
            }
        }
    }

    async function getDetailsByPayrollDeductionID(payrollDeductionID) {
        const payroll = await services.GetDetailsByPayRollDeductionID(payrollDeductionID);

        setIsUpdate(true);
        setPayrollDetails({
            ...payrollDetails,
            groupID: payroll.groupID,
            estateID: payroll.estateID,
            designationID: payroll.designationID,
            date: moment(payroll.createdDate).format('YYYY-MM-DD'),
            regNo: payroll.registrationNumber,
            empName: payroll.empName,
            deductionType: payroll.deductionType,
            amount: parseFloat(payroll.amount).toFixed(2),
            description: payroll.description,
            modifiedBy: parseInt(tokenDecoder.getUserIDFromToken()),
            payRollDeductionID: payroll.payRollDeductionID,
            modifiedDate: new Date().toISOString(),
            payRollDeductionTypeID:payrollDetails.payRollDeductionTypeID,
        })
        setTitle("Edit Payroll Deduction");
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
        saveDetails();
        setBackConfirmation(false);
        navigate('/app/payrollDeduction/listing');
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
                            groupID: payrollDetails.groupID,
                            estateID: payrollDetails.estateID,
                            date: payrollDetails.date,
                            empName: payrollDetails.empName,
                            regNo: payrollDetails.regNo,
                            deductionType: payrollDetails.deductionType,
                            amount: payrollDetails.amount,
                            description: payrollDetails.description
                        }}
                        validationSchema={
                            Yup.object().shape({
                                regNo: Yup.string().required('Employee number is required').min('1', 'Employee number is required'),
                                deductionType: Yup.number().required('Deduction type is required').min('1', 'Deduction type is required'),
                                amount: Yup.number().typeError('Amount must be a number').required('Amount is required')
                                    .test('notOnlyZero', 'Amount must not be only 0', value => value !== 0),
                            })
                        }
                        validateOnChange={false}
                        validateOnBlur={false}
                        onSubmit={handleClickAdd}
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
                                                            value={payrollDetails.groupID}
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
                                                            value={payrollDetails.estateID}
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
                                                            value={payrollDetails.date}
                                                            variant="outlined"
                                                            id="date"
                                                            size="small"
                                                            onChange={(e) => handleChange(e)}
                                                            required
                                                            disabled={isUpdate}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="deductionType">
                                                            Deduction Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.deductionType && errors.deductionType)}
                                                            helperText={touched.deductionType && errors.deductionType}
                                                            fullWidth
                                                            name="deductionType"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={payrollDetails.deductionType}
                                                            variant="outlined"
                                                            disabled={isUpdate}
                                                        >
                                                            <MenuItem value="0">--Select Deduction Type--</MenuItem>
                                                            {generateDropDownMenu(deductionTypes)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="regNo">
                                                            Employee Number *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.regNo && errors.regNo) || Boolean(registrationNumberError)}
                                                            helperText={touched.regNo && errors.regNo ? errors.regNo : registrationNumberError}
                                                            fullWidth
                                                            disabled={isUpdate}
                                                            size='small'
                                                            name="regNo"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChangeForRegNumber(e)}
                                                            value={payrollDetails.regNo}
                                                            variant="outlined"
                                                            inputRef={empNoRef}
                                                            type="text"
                                                            inputProps={{
                                                                readOnly: isUpdate
                                                            }}
                                                            onKeyDown={(e) => handleKeyDown(e, amountRef)}
                                                        />
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
                                                </Grid>

                                                <Grid container spacing={3}>

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
                                                            value={payrollDetails.amount}
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
                                                            value={payrollDetails.description}
                                                            variant="outlined"
                                                            inputRef={descriptionRef}
                                                            onKeyDown={(e) => handleKeyDown(e, addButtonRef)}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                {isUpdate != true ?
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            type="submit"
                                                            disabled={isDisableButton}
                                                            size='small'
                                                            ref={addButtonRef}
                                                        >
                                                            Add
                                                        </Button>
                                                    </Box>
                                                    : null}

                                            </CardContent>
                                            {ArrayField.length > 0 ? (
                                                <Grid item xs={12}>

                                                    <TableContainer>
                                                        <Table className={classes.table} aria-label="caption table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="center"><b>Date</b></TableCell>
                                                                    <TableCell align="center"><b>Employee No</b></TableCell>
                                                                    <TableCell align="center"><b>Employee Name</b></TableCell>
                                                                    <TableCell align="center"><b>Deduction Type</b></TableCell>
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
                                                                        <TableCell align="center" >{row.regNo}
                                                                        </TableCell>
                                                                        <TableCell align="center" >{row.employeeName}
                                                                        </TableCell>
                                                                        <TableCell align="center" >{row.deductionTypeName}
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
                                            {(isUpdate == false) && (ArrayField.length > 0) ?

                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        size='small'
                                                        disabled={isDisableButton}
                                                        onClick={saveDetails}
                                                    >
                                                        {isUpdate == true ? "Update" : "Save"}
                                                    </Button>
                                                </Box>
                                                : null}

                                            {isUpdate == true ?

                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    <Button
                                                        color="primary"
                                                        variant="contained"
                                                        size='small'
                                                        disabled={isDisableButton}
                                                        onClick={saveDetails}
                                                    >
                                                        {isUpdate == true ? "Update" : "Save"}
                                                    </Button>
                                                </Box>
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
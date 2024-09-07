import React, { useState, useEffect, Fragment } from 'react';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Collapse, MenuItem,
    Tooltip, Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Typography
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { useAlert } from "react-alert";
import DeleteIcon from '@material-ui/icons/Delete';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CancelIcon from '@material-ui/icons/Cancel';

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100%',
    },
    avatar: {
        marginRight: theme.spacing(2)
    },
    root1: {
        height: 180,
    },
    container: {
        display: 'flex',
    },
    paper: {
        margin: theme.spacing(1),
        display: 'inline-block',
        backgroundColor: 'white',
        width: 1000
    },
    svg: {
        width: 'fullWidth',
        height: 100,
    },
    polygon: {
        fill: theme.palette.common.white,
        stroke: theme.palette.divider,
        strokeWidth: 1,
    },
    table: {
        minWidth: 150,
    },
    cardContent: {
        border: `2px solid #e8eaf6`
    }
}));

export function EmployeeReimbursement({ setIsMainButtonEnable, designationID, estateID, category, basicSalary,
    setBasicSalary, designationName, setDesignationName, setAllowancesTypeList, allowancesTypeList
}) {
    const classes = useStyles();
    const [payment, setPayment] = useState({
        paymentTypeID: '0',
        bankID: '0',
        branchID: '0',
        accountNumber: '',
        accountHolderName: ''
    });

    const [allowanceAdd, setAllowanceAdd] = useState({
        allowanceTypeID: '0',
        allowanceTypeName: '',
        amount: ''
    });
    const [allowanceType, setAllowanceType] = useState([]);
    const [allowanceTypeArray, setAllowanceTypeArray] = useState([]);
    const [isAllowanceEdit, setIsAllowanceEdit] = useState(false);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [isAddListButtonEnable, setIsAddListButtonEnable] = useState(false)
    const [attendenceRowData, setAttendenceRowData] = useState(0)
    const alert = useAlert();
    const isEnableFields = category === 1 ? false : true;

    useEffect(() => {
        if (designationID !== 0 && estateID !== 0 && allowancesTypeList.length === 0 && basicSalary == "") {
            trackPromise(getEmployeeBasicSalaryByDesignationID());
        }
        if (designationID !== 0 && estateID !== 0) {
            trackPromise(getAllowanceTypesArray())
        }

        setIsMainButtonEnable(true)
    }, [])

    useEffect(() => {
        getAllowanceTypesForDropDown()
    }, [allowancesTypeList]);

    useEffect(() => {
        if (allowanceAdd.allowanceTypeID !== '0') {
            var allowanceTypeFind = allowanceTypeArray.find(x => x.allowancesTypeID === parseInt(allowanceAdd.allowanceTypeID)).allowanceTypeName
            setAllowanceAdd({
                ...allowanceAdd,
                allowanceTypeName: allowanceTypeFind.toString()
            });
        }

    }, [allowanceAdd.allowanceTypeID]);

    async function getEmployeeBasicSalaryByDesignationID() {
        
        const response = await services.getEmployeeBasicSalaryByDesignationID(designationID, estateID);
        setBasicSalary(response.basicSalary)
        setDesignationName(response.designationName)
        setAllowancesTypeList(response.employeeWiseAllowanceTypeModels)
    }

    async function getAllowanceTypesForDropDown() {
        const response = await services.getAllowanceTypesForDropDown(designationID, estateID);

        const allowanceTypeIDsSet = new Set(allowancesTypeList.map(item => item.allowancesTypeID));
        const uniqueToResponse = response.filter(responseItem =>
            !allowanceTypeIDsSet.has(responseItem.allowancesTypeID)
        );
        var allowaneTypeArray = [];
        for (let item of Object.entries(uniqueToResponse)) {
            allowaneTypeArray[item[1]["allowancesTypeID"]] = item[1]["allowanceTypeName"];
        }
        setAllowanceType(allowaneTypeArray)
    }

    async function getAllowanceTypesArray() {
        const response = await services.getAllowanceTypesArray(designationID, estateID);
        setAllowanceTypeArray(response)
    }

    function DeleteItem() {
        setDeleteConfirmationOpen(false)
        var element = allowancesTypeList[attendenceRowData];
        if (element > 0) {
            alert.error('Error occured in item delete');
        }
        else {
            alert.success('Allowances Deleted Successfully');
            const newAllowancesTypeList = allowancesTypeList.filter((_, i) => i !== attendenceRowData);
            getAllowanceTypesForDropDown()
            setAllowancesTypeList(newAllowancesTypeList);
            setIsAllowanceEdit(false)
        }
    }

    function handleChangeBasicSalary(e) {
        const target = e.target;
        const value = target.value;
        setBasicSalary(value);
    }

    function changeText(e, index) {
        const target = e.target;
        const value = target.value
        const newArr = [...allowancesTypeList];
        const valueTwo = value == "" ? null : parseFloat(value)

        newArr[index] = { ...newArr[index], amount: parseFloat(valueTwo) };
        setAllowancesTypeList(newArr)
    }

    function HandleAllowancesAdd() {
        getAllowanceTypesForDropDown()
        setIsAddListButtonEnable(true)
        setIsAllowanceEdit(true)
    }

    function HandleAllowancesRemove() {
        getAllowanceTypesForDropDown()
        setIsAllowanceEdit(false)
    }

    function HandleAllowancesArrayAdd() {
        let allowances = {
            allowanceTypeName: allowanceAdd.allowanceTypeName,
            allowancesTypeID: parseInt(allowanceAdd.allowanceTypeID),
            amount: parseFloat(allowanceAdd.amount),
            designationID: designationID,
            designationWiseAllowanceTypeID: 0
        };
        setAllowancesTypeList(allowancesTypeList => [...allowancesTypeList, allowances]);
        setAllowanceAdd({
            ...allowanceAdd,
            allowanceTypeID: '0',
            amount: ''
        })
        getAllowanceTypesForDropDown()
        setIsAllowanceEdit(false)
        setIsAddListButtonEnable(false)

    }

    function handleChangeForm(e) {
        const target = e.target;
        const value = target.value;

        setAllowanceAdd({
            ...allowanceAdd,
            [e.target.name]: value
        });
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

    function HandleAllowancesArrayAddNew() {
        if (basicSalary == "") {
            alert.error('Please add the basic Salary');
        }
        alert.success('Reimbursement Details Successfully');
    }
    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false)
    }

    async function handleClickEdit(rowData) {
        setAttendenceRowData(rowData);
        setDeleteConfirmationOpen(true);
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title="Employee Reimbursement Add Edit">
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            paymentTypeID: payment.paymentTypeID,
                            bankID: payment.bankID,
                            branchID: payment.branchID,
                            accountNumber: payment.accountNumber,
                            accountHolderName: payment.accountHolderName
                        }}
                        validationSchema={
                            Yup.object().shape({
                                // paymentTypeID: Yup.number().max(255).required('Payment type is required').min("1", 'Select a payment type'),
                                // bankID: Yup.number().when("paymentTypeID",
                                //     {
                                //         is: val => val === 1,
                                //         then: Yup.number().min('1', 'Select a bank'),
                                //     }),
                                // branchID: Yup.number().when("bankID",
                                //     {
                                //         is: val => val > 0,
                                //         then: Yup.number().min('1', 'Select a branch'),
                                //     }),
                                // accountNumber: Yup.string().when("branchID",
                                //     {
                                //         is: val => val > 0,
                                //         then: Yup.string().required('Please enter account number').matches(/^[0-9\b]+$/, 'Only allow numbers'),
                                //     }),
                                // accountHolderName: Yup.string().when("branchID",
                                //     {
                                //         is: val => val > 0,
                                //         then: Yup.string().max(75, "Account holder name must be at most 75 characters")
                                //             .required('Please enter account holder name').matches(/^[aA-zZ\s\.]+$/, "Only alphabets are allowed for this field"),
                                //     }),
                            })
                        }
                        // onSubmit={(event) => trackPromise(savePaymentMethods(event))}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            touched,
                            values,
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={3}>
                                    <Card className={classes.cardContent}>
                                        <Divider />
                                        <CardContent>
                                            <CardHeader
                                                title="Basic Salary"

                                            />
                                            <Divider />
                                            <Grid container spacing={3} style={{ marginLeft: "0.5%", marginTop: "0.5%" }}>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="designationName">
                                                        Designation
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        name="designationName"
                                                        onBlur={handleBlur}
                                                        value={designationName}
                                                        variant="outlined"
                                                        disabled={(true)}
                                                    />
                                                </Grid>
                                                <Grid item md={4} xs={12}>
                                                    <InputLabel shrink id="basicSalary">
                                                        Basic Salary *
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        name="basicSalary"
                                                        onBlur={handleBlur}
                                                        onChange={(e) => handleChangeBasicSalary(e)}
                                                        value={basicSalary}
                                                        variant="outlined"
                                                        disabled={isEnableFields}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>

                                        <CardContent>
                                            <CardHeader
                                                title="Allowances"
                                            />
                                            <Divider />
                                            {(allowancesTypeList.length !== 0) && isEnableFields ?
                                                <Grid item md={12} xs={12}>
                                                    <Grid className={classes.container}>
                                                        <Collapse in={true}>
                                                            <Paper elevation={0} className={classes.paper}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={12}>
                                                                        <TableContainer >
                                                                            <Table className={classes.table} aria-label="caption table">
                                                                                <TableHead>
                                                                                    <TableRow>
                                                                                        <TableCell >Allowance</TableCell>
                                                                                        <TableCell >Amount</TableCell>
                                                                                        <TableCell >Actions</TableCell>
                                                                                    </TableRow>
                                                                                </TableHead>
                                                                                <TableBody>
                                                                                    {allowancesTypeList.map((rowData, index) => (
                                                                                        <TableRow key={index}>
                                                                                            <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                                {rowData.allowanceTypeName}
                                                                                            </TableCell>
                                                                                            <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                                <Grid item md={3} xs={12}>
                                                                                                    <TextField
                                                                                                        size="small"
                                                                                                        id="outlined-size-small"
                                                                                                        name="proposedPrice"
                                                                                                        defaultValue={0}
                                                                                                        onKeyDown={(evt) =>
                                                                                                            (evt.key === "-") && evt.preventDefault()
                                                                                                        }
                                                                                                        InputProps={{
                                                                                                            inputProps: {
                                                                                                                step: 0.01,
                                                                                                                type: 'number',
                                                                                                                style: {
                                                                                                                    textAlign: 'right',
                                                                                                                },
                                                                                                            },
                                                                                                        }}
                                                                                                        onWheel={event => event.target.blur()}
                                                                                                        onChange={(e) => changeText(e, index)}
                                                                                                        value={rowData.amount}
                                                                                                    />
                                                                                                </Grid>
                                                                                            </TableCell>
                                                                                            <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                                                                <DeleteIcon
                                                                                                    style={{
                                                                                                        color: "red",
                                                                                                        marginBottom: "-1rem",
                                                                                                        marginTop: "0rem",
                                                                                                        cursor: "pointer"
                                                                                                    }}
                                                                                                    size="small"
                                                                                                    onClick={() => handleClickEdit(index)}
                                                                                                >
                                                                                                </DeleteIcon>
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    ))}
                                                                                </TableBody>
                                                                            </Table>
                                                                        </TableContainer>
                                                                    </Grid>

                                                                </Grid>
                                                            </Paper>
                                                        </Collapse>
                                                    </Grid>
                                                </Grid> : null}
                                            <Box display="flex" justifyContent="flex-start" p={2}>
                                                <Tooltip title="Add Allowance">
                                                    <AddCircleIcon
                                                        style={{ color: 'green' }}
                                                        disabled={isAddListButtonEnable}
                                                        onClick={() => HandleAllowancesAdd()}>
                                                    </AddCircleIcon>
                                                </Tooltip>
                                                <Tooltip title="Hide">
                                                    <CancelIcon
                                                        style={{ color: 'red' }}
                                                        disabled={isAddListButtonEnable}
                                                        onClick={() => HandleAllowancesRemove()}>
                                                    </CancelIcon>
                                                </Tooltip>
                                            </Box>
                                        </CardContent>
                                        {(isAllowanceEdit) ?
                                            <CardContent>
                                                <CardHeader
                                                    title="Add Allowances"
                                                />
                                                <Divider />
                                                <Grid container spacing={3} style={{ marginLeft: "0.5%", marginTop: "0.5%" }}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="allowanceTypeID">
                                                            Allowance Type
                                                        </InputLabel>
                                                        <TextField select fullWidth
                                                            // error={Boolean(touched.designationID && errors.designationID)}
                                                            // helperText={touched.designationID && errors.designationID}
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            id="allowanceTypeID"
                                                            name="allowanceTypeID"
                                                            value={allowanceAdd.allowanceTypeID}
                                                            type="text"
                                                            variant="outlined"
                                                            onChange={(e) => handleChangeForm(e)}
                                                        >
                                                            <MenuItem value="0">--Select AllowanceType--</MenuItem>
                                                            {generateDropDownMenu(allowanceType)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="amount">
                                                            Amount *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            id="amount"
                                                            name="amount"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChangeForm(e)}
                                                            value={allowanceAdd.amount}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12} style={{ marginTop: '1.7%' }}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            onClick={() => HandleAllowancesArrayAdd()}
                                                        >
                                                            {"+"}
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            </CardContent> : null}
                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                            <Button
                                                color="primary"
                                                type="submit"
                                                variant="contained"
                                                onClick={() => HandleAllowancesArrayAddNew()}
                                            >
                                                Add
                                            </Button>
                                        </Box>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
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
                            <Typography variant="h4">Are you sure want to delete this record ?</Typography>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <br />
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={DeleteItem} color="primary" autoFocus>
                            Delete
                        </Button>
                        <Button onClick={handleCancelDelete} color="primary">
                            Cancel
                        </Button>

                    </DialogActions>
                </Dialog>
            </Page>
        </Fragment>
    );
};

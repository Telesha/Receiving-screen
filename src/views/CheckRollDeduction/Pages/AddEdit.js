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

const screenCode = "CHECKROLLDEDUCTION"

export default function CheckRollAddEdit(props) {

    const classes = useStyles();
    const navigate = useNavigate();
    let decrypted = 0
    const alert = useAlert();
    const [title, setTitle] = useState("Add Checkroll Deduction")
    const [groups, setGroups] = useState();
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [deductionTypes, setDeductionTypes] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isDivisionDisable, setIsDivisionDisable] = useState(false);
    const [ArrayField, setArrayField] = useState([]);
    const [arrayNewWareField, setArrayNewWareField] = useState([]);
    const [minDate, setMinDate] = useState([]);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [backConfirmation, setBackConfirmation] = useState(false);
    const [empName, setEmpName] = useState('');
    const [registrationNumberError, setRegistrationNumberError] = useState("");
    const [checkRollDetails, setCheckRollDetails] = useState({
        groupID: 0,
        estateID: 0,
        division: 0,
        date: new Date().toISOString().substring(0, 10),
        regNo: '',
        empName: '',
        deductionType: 0,
        amount: '',
        description: ''
    });

    const { checkRollDeductionID } = useParams();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const empNoRef = useRef(null);
    const amountRef = useRef(null);
    const descriptionRef = useRef(null);
    const addButtonRef = useRef(null);
    const currentDate = new Date();
    const maxDate = currentDate.toISOString().split('T')[0];
    const [minimumDate, setMinimumDate] = useState(new Date(currentDate));
    const minDateString = minimumDate.toISOString().split('T')[0];

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions());
    }, []);

    useEffect(() => {
        if (checkRollDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [checkRollDetails.groupID]);

    useEffect(() => {
        if (checkRollDetails.estateID > 0) {
            trackPromise(
                getDivisionDetailsByEstateID());
        };
    }, [checkRollDetails.estateID]);

    useEffect(() => {
        if (checkRollDetails.regNo != "" && checkRollDetails.division > 0) {
            (
                getEmployeeByRegNo());
        }
    }, [checkRollDetails.regNo, checkRollDetails.division]);

    useEffect(() => {
        getDeductionTypes();
        if (!isUpdate) {
            setCheckRollDetails({
                ...checkRollDetails,
                deductionType: 0
            })
        }

    }, [checkRollDetails.division]);

    useEffect(() => {
        if (checkRollDetails.division > 0) {
            trackPromise(
                getAttendanceExecutionDate());
        };
    }, [checkRollDetails.division]);

    useEffect(() => {
        if (!isUpdate) {
            const startDate = new Date(checkRollDetails.date);
            const firstDayOfPreviousMonth = new Date(startDate.getFullYear(), startDate.getMonth());
            const minDate = firstDayOfPreviousMonth.toISOString().split('T')[0];
            setMinDate(minDate);
        }
    }, [checkRollDetails.date]);

    useEffect(() => {
        decrypted = atob(checkRollDeductionID.toString());
        if (parseInt(decrypted) > 0) {
            setIsUpdate(true);
            getDetailsByCheckRollDeductionID(decrypted);
        }
    }, []);

    useEffect(() => {
        if (ArrayField.length > 0) {
            setIsDivisionDisable(true);
        } else {
            setIsDivisionDisable(false);
        };
    }, [ArrayField]);

    useEffect(() => {
        if (!isUpdate) {
            const startDate = new Date(checkRollDetails.date);
            const firstDayOfPreviousMonth = new Date(startDate.getFullYear(), startDate.getMonth());
            firstDayOfPreviousMonth.setDate(1);
            const minDate = firstDayOfPreviousMonth.toISOString().split('T')[0];
            setMinDate(minDate);
        }
    }, [checkRollDetails.date]);

    useEffect(() => {
        if (!isUpdate) {
            setCheckRollDetails({
                ...checkRollDetails,
                empName: '',
                regNo: '',
                amount: '',
                description: ''
            })
            setEmpName('')
        }

    }, [checkRollDetails.deductionType])

    useEffect(() => {
        if (!isUpdate) {
            setCheckRollDetails({
                ...checkRollDetails,
                empName: '',
                amount: '',
                description: ''
            })
        }
    }, [checkRollDetails.regNo])

    useEffect(() => {
        if (isUpdate) {
            isEditable();
        }
    }, [minimumDate]);

    const handleClick = () => {

        navigate('/app/checkRollDeduction/listing');
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITCHECKROLLDEDUCTION');

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

        setCheckRollDetails({
            ...checkRollDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(checkRollDetails.groupID);
        setEstates(response);
    };

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(checkRollDetails.estateID);
        setDivisions(response);
    };

    async function getEmployeeByRegNo() {
        var response = await services.GetEmployeeByRegNo(checkRollDetails.regNo, checkRollDetails.division);
        if (response != null) {
            setEmpName(response.employeeName);
        }
        else {
            setEmpName("");
        }
    };

    async function getDeductionTypes() {
        var response = await services.getDeductionTypes();
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

    async function getAttendanceExecutionDate() {
        const result = await services.getAttendanceExecutionDate(
            checkRollDetails.groupID,
            checkRollDetails.estateID,
            checkRollDetails.division
        );

        const newMinDate = new Date(currentDate);
        newMinDate.setDate(currentDate.getDate() - (result.dayCount));
        setMinimumDate(newMinDate);
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setCheckRollDetails({
            ...checkRollDetails,
            [e.target.name]: value
        });
    }

    function handleChangeForRegNumber(e) {
        const target = e.target;
        let value = target.value;

        if (/^[0-9]*$/.test(value)) {
            setRegistrationNumberError("");

            setCheckRollDetails({
                ...checkRollDetails,
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

        setCheckRollDetails({
            ...checkRollDetails,
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
            x.division === parseInt(checkRollDetails.division) &&
            x.regNo === checkRollDetails.regNo &&
            x.deductionType === parseInt(checkRollDetails.deductionType)
        );

        if (isMatch) {
            alert.error("The record already exists!")
        } else {
            let response = await services.validateRegNo(checkRollDetails.division, checkRollDetails.regNo, checkRollDetails.deductionType, checkRollDetails.date, checkRollDetails.estateID);

            if (response.statusCode == "Success") {
                var array1 = [...ArrayField];
                var array2 = [...arrayNewWareField];

                array1.push({
                    groupID: parseInt(checkRollDetails.groupID),
                    estateID: parseInt(checkRollDetails.estateID),
                    division: parseInt(checkRollDetails.division),
                    date: checkRollDetails.date,
                    regNo: checkRollDetails.regNo,
                    employeeName: empName,
                    deductionType: parseInt(checkRollDetails.deductionType),
                    deductionTypeName: deductionTypes[checkRollDetails.deductionType],
                    amount: parseFloat(checkRollDetails.amount).toFixed(2),
                    description: checkRollDetails.description,
                    createdBy: parseInt(tokenDecoder.getUserIDFromToken())
                });

                setArrayField(array1);

                array2.push({
                    groupID: checkRollDetails.groupID,
                    estateID: checkRollDetails.estateID,
                    division: checkRollDetails.division,
                    date: checkRollDetails.date,
                    regNo: checkRollDetails.regNo,
                    deductionType: checkRollDetails.deductionType,
                    amount: checkRollDetails.amount,
                    description: checkRollDetails.description
                });

                setArrayNewWareField('arr', array2);

                let dataModel = {
                    date: checkRollDetails.date,
                    regNo: checkRollDetails.regNo,
                    deductionType: checkRollDetails.deductionType,
                    amount: parseFloat(checkRollDetails.amount).toFixed(2),
                    description: checkRollDetails.description
                }

                setCheckRollDetails({
                    ...checkRollDetails,
                    regNo: '',
                    description: '',
                    amount: ''
                })
                setEmpName('')
                handleKeyDown1(empNoRef)
            }
            else {
                alert.error(response.message);
            }
        }
    }

    async function saveDetails(data) {
        setIsDisableButton(true);
        if (isUpdate == true) {
            setIsUpdate(true);
            let response = await services.UpdateCheckRollDeduction(checkRollDetails);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setArrayField([]);
                navigate('/app/checkRollDeduction/listing');
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
                navigate('/app/checkRollDeduction/listing');
                setIsDisableButton(true);
            }
            else {
                alert.error(response.message);
            }
        }
    }

    async function getDetailsByCheckRollDeductionID(checkRollDeductionID) {
        const checkRoll = await services.GetDetailsByCheckRollDeductionID(checkRollDeductionID);

        setIsUpdate(true);
        setCheckRollDetails({
            ...checkRollDetails,
            groupID: checkRoll.groupID,
            estateID: checkRoll.estateID,
            division: checkRoll.division,
            date: moment(checkRoll.createdDate).format('YYYY-MM-DD'),
            regNo: checkRoll.registrationNumber,
            empName: checkRoll.empName,
            deductionType: checkRoll.deductionType,
            amount: parseFloat(checkRoll.amount).toFixed(2),
            description: checkRoll.description,
            modifiedBy: parseInt(tokenDecoder.getUserIDFromToken()),
            checkRollDeductionID: checkRoll.checkRollDeductionID,
            modifiedDate: new Date().toISOString()
        })
        setTitle("Edit Checkroll Deduction");
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
        navigate('/app/checkRollDeduction/listing');
    }

    function isEditable() {
        if (isUpdate) {
            if (checkRollDetails.date >= minDateString && checkRollDetails.date <= maxDate) {
                setIsEdit(true);
            } else {
                setIsEdit(false);
            }
        }
    };

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
                            groupID: checkRollDetails.groupID,
                            estateID: checkRollDetails.estateID,
                            division: checkRollDetails.division,
                            date: checkRollDetails.date,
                            empName: checkRollDetails.empName,
                            regNo: checkRollDetails.regNo,
                            deductionType: checkRollDetails.deductionType,
                            amount: checkRollDetails.amount,
                            description: checkRollDetails.description
                        }}
                        validationSchema={
                            Yup.object().shape({
                                division: Yup.number().required('Division is required').min('1', 'Division is required'),
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
                                                            value={checkRollDetails.groupID}
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
                                                            value={checkRollDetails.estateID}
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
                                                        <InputLabel shrink id="division">
                                                            Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.division && errors.division)}
                                                            helperText={touched.division && errors.division}
                                                            fullWidth
                                                            name="division"
                                                            disabled={isDivisionDisable || isUpdate}
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={checkRollDetails.division}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="date">
                                                            Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="date"
                                                            type="date"
                                                            value={checkRollDetails.date}
                                                            variant="outlined"
                                                            id="date"
                                                            size="small"
                                                            onChange={(e) => handleChange(e)}
                                                            required
                                                            disabled={isUpdate}
                                                            inputProps={{
                                                                max: maxDate,
                                                                min: minDateString
                                                            }}
                                                        />
                                                    </Grid>

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
                                                            value={checkRollDetails.deductionType}
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
                                                            value={checkRollDetails.regNo}
                                                            variant="outlined"
                                                            inputRef={empNoRef}
                                                            type="text"
                                                            inputProps={{
                                                                readOnly: isUpdate
                                                            }}
                                                            onKeyDown={(e) => handleKeyDown(e, amountRef)}
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <Grid container spacing={3}>
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
                                                            value={checkRollDetails.amount}
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
                                                            value={checkRollDetails.description}
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
                                                        //disabled={isSubmitting && isDisableButton}
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
                                                        //disabled={isSubmitting & isDisableButton}
                                                        disabled={!isEdit || isDisableButton}
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
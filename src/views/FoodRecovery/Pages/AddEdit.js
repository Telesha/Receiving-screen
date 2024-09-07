import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, DialogContentText, CardContent, Typography, Divider, MenuItem, Grid, InputLabel, TextField, TableCell, TableRow, TableContainer, TableBody, Table, TableHead } from '@material-ui/core';
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
import { useParams } from 'react-router-dom';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { isUndefined } from 'lodash';

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

const screenCode = "FOODRECOVERY"

export default function FoodRecoveryAddEdit() {

    const classes = useStyles();
    const navigate = useNavigate();

    const alert = useAlert();
    const [title, setTitle] = useState("Add Food Recovery")
    const [groups, setGroups] = useState();
    const [foodItems, setFoodItems] = useState();
    const [foodDeductionRates, setFoodDeductionRates] = useState();
    const [estates, setEstates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [ArrayField, setArrayField] = useState([]);
    const [arrayNewWareField, setArrayNewWareField] = useState([]);
    const [firstName, setFirstName] = useState('');
    const [totalAmount, setTotalAmount] = useState("");
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [backConfirmation, setBackConfirmation] = useState(false);
    const [minDate, setMinDate] = useState([]);
    const [foodRecoveryDetails, setFoodRecoveryDetails] = useState({
        groupID: 0,
        estateID: 0,
        divisionID: 0,
        registrationNumber: '',
        firstName: '',
        FoodDeductionCode: '0',
        deductionRate: '',
        quantity: '',
        foodDeductionName: '',
        isActive: true,
        applicableDate: new Date().toISOString().substring(0, 10)
    });
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });

    const empNoRef = useRef(null);
    const qtyRef = useRef(null);
    const addButtonRef = useRef(null);

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermissions(), getFoodItemsForDropdown());
    }, []);

    useEffect(() => {
        if (!isUpdate) {
            setFoodRecoveryDetails({
                ...foodRecoveryDetails,
                estateID: 0
            })
        };
        if (foodRecoveryDetails.groupID > 0) {
            trackPromise(getEstateDetailsByGroupID());
        };
    }, [foodRecoveryDetails.groupID]);

    useEffect(() => {
        if (!isUpdate) {
            setFoodRecoveryDetails({
                ...foodRecoveryDetails,
                divisionID: 0,
                registrationNumber: '',
                quantity: ''
            });
            setFirstName('');
        };
        if (foodRecoveryDetails.estateID > 0) {
            getDivisionDetailsByEstateID();
        };
    }, [foodRecoveryDetails.estateID]);

    useEffect(() => {
        if (!isUpdate) {
            setFoodRecoveryDetails({
                ...foodRecoveryDetails,
                FoodDeductionCode: '0'
            })
        };
    }, [foodRecoveryDetails.divisionID]);

    useEffect(() => {
        if (!isUpdate) {
            setFoodRecoveryDetails({
                ...foodRecoveryDetails,
                deductionRate: '',
            })
            setFirstName('');
            setFoodDeductionRates('');
        };
    }, [foodRecoveryDetails.FoodDeductionCode]);

    useEffect(() => {
        setFirstName('')
        if (foodRecoveryDetails.FoodDeductionCode > 0) {
            GetDeductionRateByFoodDeductionName();
        };
    }, [foodRecoveryDetails.FoodDeductionCode]);

    useEffect(() => {
        setFirstName('')
        if (foodRecoveryDetails.registrationNumber != '') {
            getEmployeeByRegNo();
        }
    }, [foodRecoveryDetails.registrationNumber]);

    useEffect(() => {
        if (foodDeductionRates > 0 && !isUpdate) {
            setFoodRecoveryDetails({
                ...foodRecoveryDetails,
                registrationNumber: '',
                quantity: '0',
                firstName: '',
            });
            setFirstName('');
            setArrayField([]);
        }
    }, [foodDeductionRates]);

    useEffect(() => {
        if (foodRecoveryDetails.quantity !== '') {
            totalAmountCalculation()
        }

    }, [foodRecoveryDetails.quantity]);

    const { foodRecoveryID } = useParams();
    let decrypted = 0;

    useEffect(() => {
        decrypted = atob(foodRecoveryID.toString());
        if (decrypted != 0) {
            trackPromise(
                GetFoodRecoveryDetailsByFoodRecoveryID(decrypted)
            )
        }
    }, []);

    useEffect(() => {
        if (!isUpdate) {
            const startDate = new Date(foodRecoveryDetails.applicableDate);
            const firstDayOfPreviousMonth = new Date(startDate.getFullYear(), startDate.getMonth());
            firstDayOfPreviousMonth.setDate(1);
            const minDate = firstDayOfPreviousMonth.toISOString().split('T')[0];
            setMinDate(minDate);
        }
    }, [foodRecoveryDetails.applicableDate]);

    useEffect(() => {
        if (foodRecoveryDetails.FoodDeductionCode != 0) {
            totalAmountCalculation();
        } else {
            setTotalAmount("");
        }
    }, [foodDeductionRates]);

    const handleClick = () => {
        navigate('/app/FoodRecovery/listing');
    }

    async function getPermissions() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITFOODRECOVERY');

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

        setFoodRecoveryDetails({
            ...foodRecoveryDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            estateID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstateDetailsByGroupID(foodRecoveryDetails.groupID);
        setEstates(response);
    };

    async function getDivisionDetailsByEstateID() {
        var response = await services.getDivisionDetailsByEstateID(foodRecoveryDetails.estateID);
        setDivisions(response);
    };

    async function getEmployeeByRegNo() {
        var response = await services.GetEmployeeByRegNo(foodRecoveryDetails.divisionID, foodRecoveryDetails.registrationNumber);
        setFirstName(response);
    };

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFoodItemsForDropdown() {
        const foodItems = await services.getAllFoodItems();
        setFoodItems(foodItems);
    }

    async function GetDeductionRateByFoodDeductionName() {
        var response = await services.GetDeductionRateByFoodDeductionName(foodRecoveryDetails.FoodDeductionCode, foodRecoveryDetails.estateID);
        if (response) {
            setFoodRecoveryDetails({
                ...foodRecoveryDetails,
                deductionRate: response
            })
            setFoodDeductionRates(response);
        }
    };

    async function GetFoodRecoveryDetailsByFoodRecoveryID(FoodRecoveryID) {
        const foodRecoveryDetails = await services.GetFoodRecoveryDetailsByFoodRecoveryID(FoodRecoveryID);
        setFoodRecoveryDetails({
            ...foodRecoveryDetails,
            groupID: foodRecoveryDetails.groupID,
            estateID: foodRecoveryDetails.estateID,
            divisionID: foodRecoveryDetails.divisionID,
            registrationNumber: foodRecoveryDetails.registrationNumber,
            firstName: foodRecoveryDetails.firstName,
            FoodDeductionCode: foodRecoveryDetails.foodDeductionCode,
            deductionRate: foodRecoveryDetails.deductionRate,
            quantity: foodRecoveryDetails.quantity,
            amount: foodRecoveryDetails.amount,
            applicableDate: foodRecoveryDetails.applicableDate.split('T')[0]
        })
        setTotalAmount(foodRecoveryDetails.amount)
        setFoodDeductionRates(foodRecoveryDetails.deductionRate)
        setTitle("Edit Food Recovery");
        setIsUpdate(true);
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
        setFoodRecoveryDetails({
            ...foodRecoveryDetails,
            [e.target.name]: value
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

    function handleChangeForRegNumber(e) {
        const target = e.target;
        let value = target.value;

        if (/^[0-9]*$/.test(value)) {
            setFoodRecoveryDetails({
                ...foodRecoveryDetails,
                [target.name]: value
            });
        }
    }

    function clearTable() {
        setArrayNewWareField([]);
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

        setFoodRecoveryDetails({
            ...foodRecoveryDetails,
            [target.name]: value
        });
    }

    function totalAmountCalculation() {
        let totalValue = 0;
        if (foodDeductionRates == undefined && foodRecoveryDetails.quantity == '0') {
            totalValue = 0 * foodRecoveryDetails.quantity
            setTotalAmount(totalValue.toFixed(2));
        } else {
            totalValue = foodDeductionRates * foodRecoveryDetails.quantity;
            setTotalAmount(totalValue.toFixed(2))
        }

    }

    async function InactivDetails(index) {
        {
            const dataDelete = [...ArrayField];
            const remove = index;
            dataDelete.splice(remove, 1);
            setArrayField([...dataDelete]);
        }
    };

    async function handleClickAdd() {
        const isMatch = ArrayField.some(x =>
            x.divisionID === parseInt(foodRecoveryDetails.divisionID) &&
            x.registrationNumber === foodRecoveryDetails.registrationNumber &&
            x.foodDeductionCode === foodRecoveryDetails.FoodDeductionCode
        );
        if (isMatch) {
            alert.error("The record already exists!")
        } else {
            let response = await services.ValidateFoodTypeByRegNo(foodRecoveryDetails.estateID, foodRecoveryDetails.divisionID, foodRecoveryDetails.FoodDeductionCode, foodRecoveryDetails.registrationNumber, foodRecoveryDetails.applicableDate);
            if (response.statusCode == "Success") {
                var array1 = [...ArrayField];
                var array2 = [...arrayNewWareField];

                array1.push({
                    groupID: parseInt(foodRecoveryDetails.groupID),
                    estateID: parseInt(foodRecoveryDetails.estateID),
                    divisionID: parseInt(foodRecoveryDetails.divisionID),
                    registrationNumber: foodRecoveryDetails.registrationNumber,
                    firstName: firstName,
                    foodDeductionName: foodItems[foodRecoveryDetails.FoodDeductionCode],
                    deductionRate: parseFloat(foodDeductionRates),
                    quantity: parseInt(foodRecoveryDetails.quantity),
                    amount: parseFloat(totalAmount),
                    applicableDate: new Date(foodRecoveryDetails.applicableDate).toISOString(),
                    foodDeductionCode: (foodRecoveryDetails.FoodDeductionCode).toString(),
                    createdBy: parseInt(tokenService.getUserIDFromToken())
                });
                setArrayField(array1);

                array2.push({
                    groupID: foodRecoveryDetails.groupID,
                    estateID: foodRecoveryDetails.estateID,
                    divisionID: foodRecoveryDetails.divisionID,
                    registrationNumber: foodRecoveryDetails.registrationNumber,
                    firstName: foodRecoveryDetails.firstName,
                    FoodDeductionCode: foodRecoveryDetails.FoodDeductionCode,
                    deductionRate: foodRecoveryDetails.deductionRate,
                    quantity: foodRecoveryDetails.quantity,
                    amount: foodRecoveryDetails.amount,
                    applicableDate: foodRecoveryDetails.applicableDate
                });

                setArrayNewWareField(array2);
                setFoodRecoveryDetails({
                    ...foodRecoveryDetails,
                    registrationNumber: '',
                    quantity: '',
                })
                setFirstName('');
                setTotalAmount([]);
                handleKeyDown1(empNoRef)
            }
            else {
                alert.error(response.message);
            }
        }
    }

    async function saveDetails() {
        if (isUpdate == true) {
            let model = {
                foodRecoveryID: atob(foodRecoveryID.toString()),
                groupID: foodRecoveryDetails.groupID,
                estateID: foodRecoveryDetails.estateID,
                divisionID: foodRecoveryDetails.divisionID,
                registrationNumber: foodRecoveryDetails.registrationNumber,
                firstName: foodRecoveryDetails.firstName,
                FoodDeductionCode: foodRecoveryDetails.FoodDeductionCode,
                deductionRate: foodRecoveryDetails.deductionRate,
                quantity: parseInt(foodRecoveryDetails.quantity),
                amount: parseFloat(totalAmount),
                applicableDate: foodRecoveryDetails.applicableDate,
                createdBy: parseInt(tokenService.getUserIDFromToken())
            }
            setIsUpdate(true);
            let response = await services.UpdateFoodRecovery(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(true);
                navigate('/app/FoodRecovery/listing');
            }
            else {
                setFoodRecoveryDetails({
                    ...foodRecoveryDetails,
                    isActive: true
                });
                alert.error(response.message);
            }
        }

        else {
            let response = await services.saveDetails(ArrayField);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setArrayField([]);
                clearFields();
                setFoodDeductionRates('');
                setIsUpdate(false);
            }
            else {
                alert.error(response.message);
            }
        }
    }

    function clearFields() {
        setFoodRecoveryDetails({
            ...foodRecoveryDetails,
            FoodDeductionCode: '0',
            deductionRate: '',
            quantity: '',
            registrationNumber: '',
            firstName: '',
            applicableDate: new Date().toISOString().substring(0, 10)
        });
        setFoodDeductionRates('');
        setTotalAmount('');
        setArrayField([]);
    }

    async function InactivDetails(rowData, index) {

        if (isUpdate == true) {
            const response = await services.SetInactivDetailsByID(rowData.FoodRecoveryID);
            if ((response.statusCode == "Success")) {
                alert.success('Field Details InActive successfully');
                clearTable();
                GetFoodRecoveryDetailsByFoodRecoveryID(foodRecoveryDetails.FoodRecoveryID);

            } else {
                alert.error('Error occured in InActive');
            }
        }
        else {
            const dataDelete = [...ArrayField];
            const remove = index;
            dataDelete.splice(remove, 1);
            setArrayField([...dataDelete]);
        }
    };

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

    function handleConfirmBackTwo() {
        saveDetails();
        setBackConfirmation(false);
        navigate('/app/FoodRecovery/listing');
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
                            groupID: foodRecoveryDetails.groupID,
                            estateID: foodRecoveryDetails.estateID,
                            divisionID: foodRecoveryDetails.divisionID,
                            registrationNumber: foodRecoveryDetails.registrationNumber,
                            firstName: foodRecoveryDetails.firstName,
                            FoodDeductionCode: foodRecoveryDetails.FoodDeductionCode,
                            deductionRate: foodRecoveryDetails.deductionRate,
                            quantity: foodRecoveryDetails.quantity,
                            amount: foodRecoveryDetails.amount
                        }}
                        validationSchema={
                            Yup.object().shape({
                                divisionID: Yup.number().required('Division is required').min('1', 'Division is required'),
                                FoodDeductionCode: Yup.number().required('Food Deduction is required').min('1', 'Food Deduction is required'),
                                registrationNumber: Yup.string().required('Employee number is required').min('1', 'Employee number is required'),
                                quantity: Yup.string().required('Quantity  is required').matches(/^[1-9][0-9]*(\.[0-9]+)?$/, 'Quantity must be greater than 0').matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals').min('1', 'Deduction Rate is required'),
                                deductionRate: Yup.string().required('Per kg rate is not defined').min('1', 'Per kg rate is not defined'),
                            })
                        }
                        validateOnChange={false}
                        validateOnBlur={false}
                        onSubmit={() => trackPromise(handleClickAdd())}
                        enableReinitialize
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched,
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
                                                            value={foodRecoveryDetails.groupID}
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
                                                            value={foodRecoveryDetails.estateID}
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
                                                            Division *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.divisionID && errors.divisionID)}
                                                            helperText={touched.divisionID && errors.divisionID}
                                                            fullWidth
                                                            name="divisionID"
                                                            disabled={isUpdate}
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={foodRecoveryDetails.divisionID}
                                                            variant="outlined"
                                                        >
                                                            <MenuItem value="0">--Select Division--</MenuItem>
                                                            {generateDropDownMenu(divisions)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="applicableDate">
                                                            Date *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            name="applicableDate"
                                                            type='date'
                                                            disabled={isUpdate}
                                                            onChange={(e) => handleChange(e)}
                                                            value={foodRecoveryDetails.applicableDate}
                                                            variant="outlined"
                                                            id="applicableDate"
                                                            size='small'
                                                            inputProps={{ min: minDate, max: new Date().toISOString().split('T')[0] }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="FoodDeductionCode">
                                                            Food Item *
                                                        </InputLabel>
                                                        <TextField
                                                            select
                                                            error={Boolean(touched.FoodDeductionCode && errors.FoodDeductionCode)}
                                                            helperText={touched.FoodDeductionCode && errors.FoodDeductionCode}
                                                            fullWidth
                                                            name="FoodDeductionCode"
                                                            onChange={(e) => handleChange(e)}
                                                            value={foodRecoveryDetails.FoodDeductionCode}
                                                            variant="outlined"
                                                            disabled={isUpdate}
                                                            size="small"
                                                            onBlur={handleBlur}

                                                        >
                                                            <MenuItem value="0">--Select Food Item--</MenuItem>
                                                            {generateDropDownMenu(foodItems)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="deductionRate">
                                                            Per kg rate *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            error={Boolean(touched.deductionRate && errors.deductionRate)}
                                                            helperText={touched.deductionRate && errors.deductionRate}
                                                            size="small"
                                                            id="deductionRate"
                                                            name="deductionRate"
                                                            value={foodDeductionRates}
                                                            type="text"
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                            onChange={handleChange}
                                                        />
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="registrationNumber">
                                                            Employee No*
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                                                            fullWidth
                                                            helperText={touched.registrationNumber && errors.registrationNumber}
                                                            name="registrationNumber"
                                                            onBlur={handleBlur}
                                                            size='small'
                                                            onChange={(e) => {
                                                                handleChangeForRegNumber(e);
                                                            }}
                                                            disabled={isUpdate}
                                                            value={foodRecoveryDetails.registrationNumber}
                                                            variant="outlined"
                                                            id="registrationNumber"
                                                            inputRef={empNoRef}
                                                            onKeyDown={(e) => handleKeyDown(e, qtyRef)}
                                                        >
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="firstName">
                                                            Employee Name *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            id="firstName"
                                                            name="firstName"
                                                            value={firstName}
                                                            type="text"
                                                            disabled={isUpdate}
                                                            variant="outlined"
                                                            onChange={handleChange}
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        />
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="quantity">
                                                            Quantity *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.quantity && errors.quantity)}
                                                            helperText={touched.quantity && errors.quantity}
                                                            fullWidth
                                                            size="small"
                                                            name="quantity"
                                                            onBlur={handleBlur}
                                                            onChange={handleChange}
                                                            value={foodRecoveryDetails.quantity}
                                                            variant="outlined"
                                                            inputRef={qtyRef}
                                                            onKeyDown={(e) => handleKeyDown(e, addButtonRef)}
                                                        />
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="amount">
                                                            Total Amount *
                                                        </InputLabel>
                                                        <TextField
                                                            fullWidth
                                                            size='small'
                                                            name="amount"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChangeForAmount(e)}
                                                            value={totalAmount}
                                                            variant="outlined"
                                                            InputProps={{
                                                                readOnly: true
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>

                                                {isUpdate != true ?
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button
                                                            color="primary"
                                                            variant="contained"
                                                            disabled={isDisableButton}
                                                            size='small'
                                                            type='submit'
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
                                                                    <TableCell align="center"><b>Employee Number</b></TableCell>
                                                                    <TableCell align="center"><b>Employee Name</b></TableCell>
                                                                    <TableCell align="center"><b>Food Item Name</b></TableCell>
                                                                    <TableCell align="center"><b>Quantity</b></TableCell>
                                                                    <TableCell align="right"><b> Total Amount (Rs.)</b></TableCell>
                                                                    <TableCell align="center"><b>Action</b></TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {ArrayField.map((row, index) => {
                                                                    return <TableRow key={index}>

                                                                        <TableCell align="center" >{row.registrationNumber}
                                                                        </TableCell>
                                                                        <TableCell align="center" >{row.firstName}
                                                                        </TableCell>
                                                                        <TableCell align="center" >{row.foodDeductionName}
                                                                        </TableCell>
                                                                        <TableCell align="right" >{row.quantity}
                                                                        </TableCell>
                                                                        <TableCell align="right" >{row.amount}
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
                                            ) : null}
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                    {(ArrayField.length > 0) ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                                color="primary"
                                variant="contained"
                                size='small'
                                onClick={saveDetails}
                            >
                                Save
                            </Button>
                        </Box>
                        : null}

                    {isUpdate == true ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                                color="primary"
                                variant="contained"
                                size='small'
                                onClick={() => saveDetails()}
                            >
                                Update
                            </Button>
                        </Box>
                        : null}
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
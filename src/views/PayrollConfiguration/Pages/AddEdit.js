import React, { useState, useEffect, Fragment, useRef } from 'react';
import {
    Box,
    Card,
    makeStyles,
    Container,
    Divider,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    InputLabel,
    CardHeader,
    Button,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";
import PageHeader from 'src/views/Common/PageHeader';
import DeleteIcon from '@material-ui/icons/Delete';
import { Formik } from 'formik';
import * as Yup from "yup";
import { AlertDialogWithoutButton } from '../../Common/AlertDialogWithoutButton';

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
    succes: {
        backgroundColor: "#fce3b6",
        marginLeft: "15px",
        marginBottom: "5px"
    }
}));

const screenCode = 'PAYROLLCONFIGURATION';

export default function PayrollConfigurationAddEdit() {
    const [title, setTitle] = useState("Payroll Configuration");
    const classes = useStyles();
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false,
    });
    const [groups, setGroups] = useState([]);
    const [estate, setEstate] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [allowanceType, setAllowanceType] = useState([]);
    const qtyRef = useRef(null);
    const addButtonRef = useRef(null);
    const [isDisableButton, setIsDisableButton] = useState(false);
    const [isSetDesignation, setIsSetDesignation] = useState(false);
    const [amountValue, setAmountValue] = useState(0);
    const [ArrayField, setArrayField] = useState([]);
    const [payrollConfigSearch, setPayrollConfigSearch] = useState({
        groupID: '0',
        estateID: '0',
        designationID: '0',
        allowanceTypeID: '0',
        amount: '',
        designationName: '0'

    })
    const [isUpdate, setIsUpdate] = useState(false);
    const { payrollConfigID } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();
    const [dialog, setDialog] = useState(false);
    const handleKeyDown = (event, nextInputRef) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            nextInputRef.current.focus();
        }
    }

    let decrypted = 0;

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        getEstateDetailsByGroupID();
    }, [payrollConfigSearch.groupID]);

    useEffect(() => {
        decrypted = atob(payrollConfigID.toString());
        if (parseInt(decrypted) > 0) {
            setIsUpdate(true);
            getDetailsByPayRollAllowanceID(decrypted);
        }
    }, []);

    useEffect(() => {
        if (payrollConfigSearch.estateID !== 0) {
            getDesignationsForDropdown()
            getAllowanceTypesForDropdown()
        }
    }, [payrollConfigSearch.estateID]);

    useEffect(() => {
        setPayrollConfigSearch({
            ...payrollConfigSearch,
            designationID: '0',
            allowanceTypeID: '0',
            amount: '',
            allowanceTypeName: '',
            designationName: '0'

        })
    }, [payrollConfigSearch.estateID]);

    useEffect(() => {
        setPayrollConfigSearch({
            ...payrollConfigSearch,
            allowanceTypeID: '0',
            amount: '',
            allowanceTypeName: ''
        })

    }, [payrollConfigSearch.designationID]);

    useEffect(() => {
        setPayrollConfigSearch({
            ...payrollConfigSearch,
            amount: ''
        })
    }, [payrollConfigSearch.allowanceTypeID]);

    useEffect(() => {
        if (isUpdate) {
            setPayrollConfigSearch({
                ...payrollConfigSearch,
                amount: amountValue,
            })
        }
    }, [amountValue]);

    useEffect(() => {
        if (ArrayField.length > 0) {
            setIsSetDesignation(true);
        } else {
            setIsSetDesignation(false);
        }
    }, [ArrayField]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITVIEWPAYROLLCONFIGURATION');

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

        setPayrollConfigSearch({
            ...payrollConfigSearch,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
        });
        getGroupsForDropdown()
    }

    async function getGroupsForDropdown() {
        const groups = await services.getGroupsForDropdown();
        setGroups(groups);
    }

    async function getEstateDetailsByGroupID() {
        var response = await services.getEstatesByGroupID(payrollConfigSearch.groupID);
        setEstate(response);
    }

    async function getDesignationsForDropdown() {
        const designation = await services.getDesignationsForDropdownByEstateID(payrollConfigSearch.estateID);
        setDesignation(designation);
    }

    async function getAllowanceTypesForDropdown() {
        const allowanceType = await services.getAllowanceTypesForDropdown(payrollConfigSearch.allowanceTypeID);
        setAllowanceType(allowanceType);
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value;

        setPayrollConfigSearch({
            ...payrollConfigSearch,
            [e.target.name]: value
        })
    }

    function handleChange2(e) {
        const { name, value } = e.target;
        if (isUpdate) {
            const isValidInput = value === '' || /^\d*(\.\d{0,2})?$/.test(value);
            const isBackspacePressed = e.nativeEvent.inputType === 'deleteContentBackward';

            if (isValidInput || isBackspacePressed) {
                setPayrollConfigSearch(prevState => ({
                    ...prevState,
                    [name]: value
                }));
            } else {
                e.preventDefault();
                alert.error("Please enter a valid amount");
            }
        } else {
            const isValidInput = value === '' || /^\d+(\.\d{0,2})?$/.test(value);

            if (isValidInput) {
                setPayrollConfigSearch(prevState => ({
                    ...prevState,
                    [name]: value
                }));
            } else {
                e.preventDefault();
                alert.error("Please enter a valid amount");
            }
        }
    }

    function handleClick() {
        navigate('/app/payrollConfiguration/listing/')
    }


    function handleClick() {

        if (isUpdate == false) {
            if (ArrayField.length != 0) {
                setDialog(true);
            } else {
                navigate('/app/payrollConfiguration/listing/');
            }
        } else {
            navigate('/app/payrollConfiguration/listing/');
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

    async function InactivDetails(row, index) {
        {
            const dataDelete = [...ArrayField];
            const remove = index;
            dataDelete.splice(remove, 1);
            setArrayField([...dataDelete]);
        }
    };

    async function AddFieldData() {
        const isMatch = ArrayField.some(x =>
            x.estateID === parseInt(payrollConfigSearch.estateID) &&
            x.designationID === parseInt(payrollConfigSearch.designationID) &&
            x.allowanceTypeID === parseInt(payrollConfigSearch.allowanceTypeID)
        );
        if (isMatch) {
            alert.error("The record already exists!")
        } else {


            let model = {

                groupID: payrollConfigSearch.groupID,
                estateID: payrollConfigSearch.estateID,
                designationID: payrollConfigSearch.designationID,
                allowanceTypeID: payrollConfigSearch.allowanceTypeID,
            }
            let response = await services.checkIfAllowanceExists(model);
            if (response.statusCode == "Success") {

                setIsSetDesignation(true);
                var array1 = [...ArrayField];
                array1.push({
                    groupID: parseInt(payrollConfigSearch.groupID),
                    estateID: parseInt(payrollConfigSearch.estateID),
                    designationID: parseInt(payrollConfigSearch.designationID),
                    designationName: designation[payrollConfigSearch.designationID],
                    allowanceTypeID: parseInt(payrollConfigSearch.allowanceTypeID),
                    allowanceTypeName: allowanceType[payrollConfigSearch.allowanceTypeID],
                    amount: parseFloat(payrollConfigSearch.amount).toFixed(2),
                    createdBy: parseInt(tokenService.getUserIDFromToken())
                });
                setArrayField(array1);
                setPayrollConfigSearch({
                    ...payrollConfigSearch,
                    amount: '',
                    allowanceTypeID: '0',
                });
            }
            else {
                alert.error(response.message);
            }
        }
    }

    async function saveAllowance(data) {
        if (isUpdate == true) {
            if (payrollConfigSearch.amount.toString().trim() === '') {
                alert.error("Please enter a valid amount");
                return;
            }
            const formattedAmount = parseFloat(payrollConfigSearch.amount).toFixed(2);
            setIsUpdate(true);
            setIsDisableButton(true);
            let model = {
                designationWiseAllowanceTypeID: parseInt(atob(payrollConfigID.toString())),
                groupID: payrollConfigSearch.groupID,
                estateID: payrollConfigSearch.estateID,
                designationID: payrollConfigSearch.designationID,
                allowanceTypeID: payrollConfigSearch.allowanceTypeID,
                amount: parseFloat(formattedAmount),
                createdBy: parseInt(tokenService.getUserIDFromToken())
            }
            let response = await services.UpdateAllowance(model);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setArrayField([]);
                navigate('/app/payrollConfiguration/listing/');
            }
            else {

                alert.error(response.message);
            }
        } else {
            let response = await services.saveAllowance(ArrayField);
            if (response.statusCode == "Success") {
                alert.success(response.message);
                setIsDisableButton(false);
                setArrayField([]);
                navigate('/app/payrollConfiguration/listing/');
                setIsDisableButton(true);
            }
            else {
                alert.error(response.message);
            }
        }
    }

    async function confirmRequest() {
        navigate('/app/payrollConfiguration/listing/');
    }

    async function cancelRequest() {
        setDialog(false);
    }

    async function getDetailsByPayRollAllowanceID(payRollAllowanceID) {
        setTitle("Edit Allowance")
        const payrollConfigSearch = await services.getDetailsByPayRollAllowanceID(payRollAllowanceID);
        setIsUpdate(true);
        setPayrollConfigSearch({
            ...payrollConfigSearch,
            groupID: payrollConfigSearch.groupID,
            estateID: payrollConfigSearch.estateID,
            designationName: payrollConfigSearch.designationID,
            allowanceTypeID: payrollConfigSearch.allowanceTypeID,
            amount: payrollConfigSearch.amount,
            designationWiseAllowanceTypeID: payrollConfigSearch.designationWiseAllowanceTypeID
        });
        setAmountValue(payrollConfigSearch.amount)
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

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: payrollConfigSearch.groupID,
                            estateID: payrollConfigSearch.estateID,
                            designationID: payrollConfigSearch.designationID,
                            allowanceTypeID: payrollConfigSearch.allowanceTypeID,
                            amount: payrollConfigSearch.amount,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                                estateID: Yup.number().required('Estate required').min("1", 'Estate required'),
                                designationID: Yup.number().required('Designation required').min("1", 'Designation required'),
                                allowanceTypeID: Yup.number().required('Allowance Type required').min("1", 'Allowance Type required'),
                                amount: Yup.string()
                                    .max(30, 'Amount should be at most 30 characters')
                                    .required('Amount required')
                                    .matches(/^\d+(\.\d{1,2})?$/, {
                                        message: 'Please enter a valid amount with up to two decimal places',
                                        excludeEmptyString: true,
                                    })
                                    .test('not-negative', 'Amount cannot be negative', value => {
                                        const parsedValue = parseFloat(value);
                                        return parsedValue >= 0;
                                    })
                                    .test('no-symbols', 'Symbols are not allowed', value => {
                                        return /^[0-9.]+$/.test(value);
                                    }),
                            })
                        }
                        validateOnChange={false}
                        validateOnBlur={false}
                        onSubmit={() => AddFieldData()}
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
                                            <CardContent>
                                                <Grid container spacing={2}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            size='small'
                                                            name="groupID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={payrollConfigSearch.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isGroupFilterEnabled || isUpdate || isSetDesignation,
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
                                                            size='small'
                                                            name="estateID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={payrollConfigSearch.estateID}
                                                            variant="outlined"
                                                            id="estateID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled || isUpdate || isSetDesignation,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(estate)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="designationID">
                                                            Designation *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.designationID && errors.designationID)}
                                                            fullWidth
                                                            helperText={touched.designationID && errors.designationID}
                                                            size='small'
                                                            name="designationID"
                                                            onChange={(e) => handleChange(e)}
                                                            value={payrollConfigSearch.designationID}
                                                            variant="outlined"
                                                            id="designationID"
                                                            InputProps={{
                                                                readOnly: !permissionList.isFactoryFilterEnabled || isUpdate || isSetDesignation,
                                                            }}
                                                        >
                                                            <MenuItem value="0">--Select Designation--</MenuItem>
                                                            {generateDropDownMenu(designation)}
                                                        </TextField>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={2}>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="allowanceTypeID">
                                                            Allowance Type *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.allowanceTypeID && errors.allowanceTypeID)}
                                                            fullWidth
                                                            helperText={touched.allowanceTypeID && errors.allowanceTypeID}
                                                            name="allowanceTypeID"
                                                            size='small'
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={payrollConfigSearch.allowanceTypeID}
                                                            variant="outlined"
                                                            id="allowanceTypeID"
                                                            InputProps={{
                                                                readOnly: isUpdate
                                                            }}
                                                        >
                                                            <MenuItem value={0}>--Select Other Earning Type--</MenuItem>
                                                            {generateDropDownMenu(allowanceType)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="amount">
                                                            Amount *
                                                        </InputLabel>
                                                        <TextField
                                                            error={Boolean(touched.amount && errors.amount)}
                                                            fullWidth
                                                            helperText={touched.amount && errors.amount}
                                                            name="amount"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange2(e)}
                                                            value={payrollConfigSearch.amount}
                                                            size='small'
                                                            variant="outlined"
                                                            inputRef={qtyRef}
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
                                                                    <TableCell align="center"><b>Designation</b></TableCell>
                                                                    <TableCell align="center"><b>Allowance Type</b></TableCell>
                                                                    <TableCell align="right"><b>Amount (Rs.)</b></TableCell>
                                                                    <TableCell align="center"><b>Action</b></TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {ArrayField.map((row, index) => {
                                                                    return <TableRow key={index}>
                                                                        <TableCell align="center" >{row.designationName}
                                                                        </TableCell>
                                                                        <TableCell align="center" >{row.allowanceTypeName}
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
                                            )
                                                : null}
                                            <Divider />
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                                {dialog ?
                                    <AlertDialogWithoutButton confirmData={confirmRequest} cancelData={cancelRequest}
                                        headerMessage={"Payroll Configuration"}
                                        discription={"Added Payroll Details will be not saved, Are you sure you want to leave?"} />
                                    : null
                                }
                            </form>
                        )}
                    </Formik>
                    {(isUpdate == false) && (ArrayField.length > 0) ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                                color="primary"
                                type="button"
                                variant="contained"
                                size='small'
                                onClick={() => saveAllowance()}
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
                                type="button"
                                size='small'
                                onClick={() => saveAllowance()}
                            >
                                {isUpdate == true ? "Update" : "Save"}
                            </Button>
                        </Box>
                        : null}
                </Container>
            </Page>
        </Fragment >
    )
}
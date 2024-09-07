import React, { useState, useEffect, Fragment } from 'react';
import {
    Box, Card, Button, makeStyles, Container, Divider, CardContent,
    CardHeader, Grid, TextField, MenuItem, InputLabel
} from '@material-ui/core';
import {
    startOfMonth, endOfMonth, addMonths
} from 'date-fns';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import DateRangeSelectorComponent from '../Utils/DateRangeSelector';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import Popover from '@material-ui/core/Popover';
import EventIcon from '@material-ui/icons/Event';
import tokenDecoder from 'src/utils/tokenDecoder';
import moment from 'moment';
import { UserStatisticsComponent } from '../../UserStatistics/UserStatisticsExportComponent';
import { LoanInitiating } from '../Components/LoanInitiatingApproveRejectComponent';
import authService from '../../../utils/permissionAuth'
import tokenService from '../../../utils/tokenDecoder';
import _ from 'lodash';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    row: {
        marginTop: '1rem'
    }
}));

const screenCode = 'LOANEARLYTSETTLEMENT';
export default function EmployeeLoanEarlySettlement(props) {
    let decryptedEmployeeLoanID = 0;
    const [IsNewRequestPerforming, setIsNewRequestPerforming] = useState(true)
    const { employeeLoanID } = useParams();
    const [GroupList, setGroupList] = useState();
    const [FactoryList, setFactoryList] = useState();
    const [divisions, setDivisions] = useState();
    const [IsSearchPerformed, setIsSearchPerformed] = useState(false)
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [LoanTypes, setLoanTypes] = useState([]);
    const [IsDefaultExpand, setIsDefaultExpand] = useState(true);
    const [IsViewOnly, setIsViewOnly] = useState(true);
    const [earlySettlementDetails, setEarlySettlementDetails] = useState({
        fineInterests: '',
        earlySettlementFine: '',
        earlySettlementTotalAmount: '',
        voucherNumber: ''
    });
    const [DateRange, setDateRange] = useState({
        startDate: startOfMonth(addMonths(new Date(), -5)),
        endDate: endOfMonth(addMonths(new Date(), -0))
    });
    const [FormDetails, setFormDetails] = useState({
        groupID: tokenDecoder.getGroupIDFromToken(),
        factoryID: tokenDecoder.getFactoryIDFromToken(),
        divisionID: 0,
        employeeNIC: "",
        registrationNumber: "",
        searchDate: new Date()
    });
    const [userBasicDetails, setUserBasicDetails] = useState({
        FactoryID: parseInt(FormDetails.factoryID),
        GroupID: parseInt(FormDetails.groupID),
        divisionID: 0,
        NIC: null,
        registrationNumber: '',
        searchDate: new Date(),
    })
    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: true,
        isFactoryFilterEnabled: true,
    });
    const [LoanDetails, setLoanDetails] = useState({
        annualRate: "",
        employeeLoanID: "",
        customerNIC: "",
        factoryID: "",
        groupID: "",
        loanType: 0,
        numberOfInstalments: "",
        principalAmount: "",
        purpose: "",
        registrationNumber: "",
        statusID: "",
        disbursementType: 0,
        remarks: "",
        capitalOutstanding: "",
        numberOfCompletedInstalments: "",
        isNonPerforming: "",
    });
    const [LoanTransactionDetails, setLoanTransactionDetails] = useState([]);
    const [LoanArrearsDetails, setLoanArrearsDetails] = useState([])
    const alert = useAlert();
    const classes = useStyles();
    const navigate = useNavigate();
    const handleClick = () => {
        IsNewRequestPerforming === true ?
            navigate('/app/dashboard') :
            navigate('/app/employeeLoan/listing')
    };
    const loadFactory = (event) => {
        trackPromise(getFactoryByGroupID(event.target.value));
    };
    const loadDivision = (event) => {
        trackPromise(getDivisionsForDropDown(event.target.value));
    };
    const handleClickPop = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [open1, setOpen1] = React.useState(false);

    const handleClickOpen = () => {
        setOpen1(true);
    };

    const handleClose1 = () => {
        setOpen1(false);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    useEffect(() => {
        trackPromise(getPermission())
        trackPromise(getAllGroups());
        trackPromise(GetLoanTypes());
        if (IsNewRequestPerforming === true) {
            trackPromise(getFactoryByGroupID(tokenDecoder.getGroupIDFromToken()));
        }
    }, [])

    useEffect(() => {
        setIsSearchPerformed(false)
    }, [FormDetails.groupID, FormDetails.factoryID, FormDetails.divisionID, FormDetails.employeeNIC, FormDetails.registrationNumber, FormDetails.searchDate])

    useEffect(() => {
        if (FormDetails.factoryID > 0) {
            trackPromise(
                getDivisionsForDropDown(FormDetails.factoryID),
            )
        }
    }, [FormDetails.factoryID]);

    useEffect(() => {
        let decrypter = atob(employeeLoanID.toString());
        let splitIds = decrypter.split("-");
        decryptedEmployeeLoanID = splitIds[0];

        if (splitIds.length === 1) {
            setIsViewOnly(true)
        } else {
            setIsViewOnly(false);
        }

        if (decryptedEmployeeLoanID != 0) {
            setIsNewRequestPerforming(false);
            setIsSearchPerformed(false);
            trackPromise(LoadLoanDetailsByLoanID());
            setIsDefaultExpand(false);
        }
    }, []);

    useEffect(() => {
        CalculateEarlySettlementFine()
    }, [earlySettlementDetails.fineInterests])

    async function LoadLoanDetailsByLoanID() {
        await GetEmployeeLoanApprovalDetails(decryptedEmployeeLoanID);
    }

    async function GetEmployeeLoanTransactionDetails(loanID) {
        const response = await services.GetEmployeeLoanTransactionDetails(loanID);
        response.length > 0 ? setLoanTransactionDetails(response) : setLoanTransactionDetails(null)
    }

    async function GetEmployeeLoanArrearsDetails(loanID) {
        const response = await services.GetEmployeeLoanArrearsDetails(loanID);
        response.length > 0 ? setLoanArrearsDetails(response) : setLoanArrearsDetails(null)
    }

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode === 'VIEWLOANEARLYTSETTLEMENT');

        if (isAuthorized === undefined) {
            navigate('/404');
        }

        var isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setFormDetails({
            ...FormDetails,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
    }

    async function GetEmployeeLoanApprovalDetails(employeeLoanID) {
        const response = await services.GetEmployeeLoanApprovalDetails(employeeLoanID);
        setLoanDetails(response)
        setFormDetails({
            ...FormDetails,
            registrationNumber: response.registrationNumber,
            employeeNIC: response.employeeNIC,
            divisionID: response.divisionID,
            factoryID: response.factoryID,
            groupID: response.groupID,
        })

        let userDetailsObject = {
            groupID: parseInt(response.groupID),
            factoryID: parseInt(response.factoryID),
            divisionID: parseInt(response.divisionID),
            employeeNIC: response.employeeNIC.toString(),
            registrationNumber: response.registrationNumber.toString(),
            searchDate: FormDetails.searchDate === null ? null : moment(FormDetails.searchDate).format(),
        };

        if (response.statusID === 4) {
            trackPromise(GetEmployeeLoanTransactionDetails(decryptedEmployeeLoanID));
            trackPromise(GetEmployeeLoanArrearsDetails(decryptedEmployeeLoanID));
        }

        trackPromise(getFactoryByGroupID(parseInt(response.groupID)));
        SearchUserDetails(userDetailsObject)
    }

    function handleChange1(e) {
        const target = e.target;
        const value = target.value
        setFormDetails({
            ...FormDetails,
            [e.target.name]: value
        });
    }

    function handleChange2(e) {
        const target = e.target;
        const value = target.value
        setEarlySettlementDetails({
            ...earlySettlementDetails,
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

    function cardTitle(titleName) {
        return (
            <Grid container spacing={1}>
                <Grid item md={10} xs={12}>
                    {titleName}
                </Grid>
                {
                    IsNewRequestPerforming === false ?
                        <Grid item md={2} xs={12}>
                            <PageHeader
                                onClick={handleClick}
                            />
                        </Grid>
                        : null
                }
            </Grid>
        )
    }

    async function GetUserDetails() {

        let userDetailsObject = {
            groupID: FormDetails.groupID === null | 0 ? null : parseInt(FormDetails.groupID),
            factoryID: FormDetails.factoryID === null | 0 ? null : parseInt(FormDetails.factoryID),
            customerNIC: FormDetails.customerNIC === "" ? null : FormDetails.customerNIC.toString(),
            customerRegistrationNumber: FormDetails.customerRegistrationNumber === "" ? null : FormDetails.customerRegistrationNumber.toString(),
            startDate: DateRange.startDate === null ? null : moment(DateRange.startDate).format(),
            endDate: DateRange.endDate === null ? null : moment(DateRange.endDate).format()
        };

        await SearchUserDetails(userDetailsObject)
    }

    async function SearchUserDetails(userDetailsObject) {
        if (userDetailsObject.registrationNumber === null) {
            alert.error("Please Provide Registration Number");
        } else {

            trackPromise(GetUserGeneralDetails(userDetailsObject).then((value) => {
                if (value.status === true && value.isActive === true) {
                    setIsSearchPerformed(true);

                    setUserBasicDetails({
                        ...userBasicDetails,
                        GroupID: userDetailsObject.groupID,
                        FactoryID: userDetailsObject.factoryID,
                        divisionID: userDetailsObject.divisionID,
                        registrationNumber: userDetailsObject.registrationNumber,
                        NIC: userDetailsObject.employeeNIC,
                        searchDate: userDetailsObject.searchDate
                    });
                } else {
                    setIsSearchPerformed(false)
                    value.isActive === false ? alert.error("This customer is Inactive") :
                        alert.error("Please provide correct user details")
                }
            }));
        }
    }

    async function getAllGroups() {
        var response = await services.GetAllGroups();
        setGroupList(response);
    };

    async function getFactoryByGroupID(groupID) {
        var response = await services.GetFactoryByGroupID(groupID);
        setFactoryList(response);
    };

    async function getDivisionsForDropDown(factoryID) {
        const divisions = await services.getDivisionDetailsByEstateID(factoryID);
        setDivisions(divisions);
    }

    async function GetUserGeneralDetails(customerDetails) {
        let resObject = {
            status: '',
            isActive: true
        }
        const result = await services.GetEmployeeBiometricDetails(customerDetails);
        if (result.statusCode === "Error") {
            resObject.status = false;
            resObject.isActive = true;

            return resObject;
        } else {
            resObject.status = true;
            resObject.isActive = result.data.isActive;

            return resObject;
        }
    }

    async function GetLoanTypes() {
        const response = await services.GetLoanTypeDetails();
        setLoanTypes(response);
    }

    async function CalculateEarlySettlementFine() {

        if (earlySettlementDetails.fineInterests !== "") {
            let noOfInstalments = /^[0-9]*\.?[0-9]*$/;
            if (!noOfInstalments.test(earlySettlementDetails.fineInterests.toString())) {
                alert.error("Invalid Fine Interests")
                return;
            }
            let value = LoanDetails.capitalOutstanding * (earlySettlementDetails.fineInterests / 100);
            setEarlySettlementDetails({
                ...earlySettlementDetails,
                earlySettlementFine: parseFloat(value).toFixed(2),
                earlySettlementTotalAmount: parseFloat(LoanDetails.capitalOutstanding + value).toFixed(2)
            });
        }
        else {
            setEarlySettlementDetails({
                ...earlySettlementDetails,
                earlySettlementFine: parseFloat(0).toFixed(2),
                earlySettlementTotalAmount: parseFloat(0).toFixed(2)
            });
        }
    }

    async function SaveSettlementFine() {
        if (earlySettlementDetails.voucherNumber == "") {
            alert.error("Please Enter the Voucher Number")
            return;
        }
        let model = {
            employeeLoanID: LoanDetails.employeeLoanID,
            earlyStettleVoucherNumber: earlySettlementDetails.voucherNumber,
            earlyStettleFineInterest: parseInt(earlySettlementDetails.fineInterests),
            modifiedBy: tokenDecoder.getUserIDFromToken(),
        }
        const resposnse = await services.SaveEmployeeLoanSettlementRequest(model);
        if (resposnse.statusCode == "Success") {
            alert.success(resposnse.message);
            handleClose1();
            setTimeout(() => {
                navigate('/app/employeeLoan/listing')
            }, 1000)
        }
        else {
            alert.error(resposnse.message);
        }
    }

    function handleDateChange(date) {
        setFormDetails({
            ...FormDetails,
            searchDate: date
        });
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={"Loan Early Settlement"}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: FormDetails.groupID,
                            factoryID: FormDetails.factoryID,
                            //customerNIC: FormDetails.customerNIC,
                            divisionID: FormDetails.divisionID,
                            registrationNumber: FormDetails.registrationNumber
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                                factoryID: Yup.number().min(1, "Please Select a Estate").required('Estate is required'),
                                divisionID: Yup.number().min(1, "Please Select a Division").required('Division is required'),
                                // customerNIC: Yup.string().matches(/^(\d{9}[vVxX]|\d{12})$/s, 'Entered NIC not valid'),
                                registrationNumber: Yup.string().matches(/^[0-9\b]+$/, 'Only allow numbers')
                            })
                        }
                        enableReinitialize
                        onSubmit={GetUserDetails}>
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader title={cardTitle("Employee Loan Early Settlement")} />
                                        <Divider />
                                        <CardContent>
                                            <Grid container className={classes.row} spacing={1}>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="groupID">
                                                        Group *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.groupID && errors.groupID)}
                                                        fullWidth
                                                        helperText={touched.groupID && errors.groupID}
                                                        name="groupID"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange1(e)
                                                            loadFactory(e)
                                                        }}
                                                        value={FormDetails.groupID}
                                                        variant="outlined"
                                                        id="groupID"
                                                        disabled={!permissionList.isGroupFilterEnabled}
                                                        InputProps={{ readOnly: true }}>
                                                        <MenuItem value={'0'} disabled={true}>--Select Group--</MenuItem>
                                                        {generateDropDownMenu(GroupList)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="factoryID">
                                                        Estate *
                                                    </InputLabel>
                                                    <TextField select
                                                        error={Boolean(touched.factoryID && errors.factoryID)}
                                                        fullWidth
                                                        helperText={touched.factoryID && errors.factoryID}
                                                        name="factoryID"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange1(e)
                                                            loadDivision(e)
                                                        }}
                                                        value={FormDetails.factoryID}
                                                        variant="outlined"
                                                        id="factoryID"
                                                        disabled={!permissionList.isFactoryFilterEnabled}
                                                        InputProps={{ readOnly: true }}>
                                                        <MenuItem value={'0'} disabled={true}>--Select Estate--</MenuItem>
                                                        {generateDropDownMenu(FactoryList)}
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
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        id="divisionID"
                                                        name="divisionID"
                                                        value={FormDetails.divisionID}
                                                        type="text"
                                                        variant="outlined"
                                                        onChange={(e) => handleChange1(e)}
                                                        InputProps={{ readOnly: true }}
                                                    >
                                                        <MenuItem value='0'>--Select Division--</MenuItem>
                                                        {generateDropDownMenu(divisions)}
                                                    </TextField>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="searchDate">
                                                        Date *
                                                    </InputLabel>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            error={Boolean(touched.searchDate && errors.searchDate)}
                                                            helperText={touched.searchDate && errors.searchDate}
                                                            autoOk
                                                            fullWidth
                                                            variant="inline"
                                                            format="dd/MM/yyyy"
                                                            margin="dense"
                                                            id="searchDate"
                                                            name="searchDate"
                                                            value={FormDetails.searchDate}
                                                            onChange={(e) => handleDateChange(e, "searchDate")}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                            disabled={true}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                                <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="registrationNumber">
                                                    Employee No *
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                                                        fullWidth
                                                        helperText={touched.registrationNumber && errors.registrationNumber}
                                                        name="registrationNumber"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => { handleChange1(e) }}
                                                        value={FormDetails.registrationNumber}
                                                        variant="outlined"
                                                        id="registrationNumber"
                                                        InputProps={{ readOnly: true }} />
                                                </Grid>
                                                {/* <Grid item md={3} xs={12}>
                                                    <InputLabel shrink id="customerNIC">
                                                        NIC Number
                                                    </InputLabel>
                                                    <TextField
                                                        error={Boolean(touched.customerNIC && errors.customerNIC)}
                                                        fullWidth
                                                        helperText={touched.customerNIC && errors.customerNIC}
                                                        name="customerNIC"
                                                        size='small'
                                                        onBlur={handleBlur}
                                                        onChange={(e) => { handleChange1(e) }}
                                                        value={FormDetails.customerNIC}
                                                        variant="outlined"
                                                        id="customerNIC"
                                                        InputProps={{ readOnly: true }} />
                                                </Grid> */}
                                            </Grid>
                                            {/* <Grid container className={classes.row} spacing={3}>
                                                <Grid item md={3} xs={12}>
                                                    <Button
                                                        aria-describedby={id}
                                                        variant="contained"
                                                        fullWidth
                                                        color="primary"
                                                        onClick={handleClickPop}
                                                        size="large"
                                                        endIcon={<EventIcon />}
                                                        disabled={!IsNewRequestPerforming}
                                                    >
                                                        {DateRange.startDate.toLocaleDateString() + " - " + DateRange.endDate.toLocaleDateString()}
                                                    </Button>
                                                    <Popover
                                                        id={id}
                                                        open={open}
                                                        anchorEl={anchorEl}
                                                        onClose={handleClose}
                                                        anchorOrigin={{
                                                            vertical: 'center',
                                                            horizontal: 'left',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'left',
                                                        }}
                                                    >
                                                        <DateRangeSelectorComponent setDateRange={setDateRange} handleClose={handleClose} />
                                                    </Popover>
                                                </Grid>
                                            </Grid> */}
                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    variant="contained"
                                                    size="small"
                                                    disabled={!IsNewRequestPerforming}
                                                >
                                                    Search
                                                </Button>
                                            </Box>
                                            {/* <Grid container spacing={2}>
                                                <Grid item md={12} xs={12}>
                                                    {IsSearchPerformed === true ?
                                                        <UserStatisticsComponent
                                                            UserDetails={userBasicDetails}
                                                        /> : null}
                                                </Grid>
                                            </Grid> */}
                                            <Grid container spacing={2}>
                                                <Grid item md={12} xs={12}>
                                                    {IsSearchPerformed === true ?
                                                        <LoanInitiating
                                                            permissionList={permissionList}
                                                            userBasicDetails={userBasicDetails}
                                                            IsNewRequestPerforming={IsNewRequestPerforming}
                                                            LoanTypes={LoanTypes}
                                                            FullLoanDetails={LoanDetails}
                                                            decryptedCustomerLoanID={decryptedEmployeeLoanID}
                                                            IsDefaultExpand={IsDefaultExpand}
                                                            IsViewOnly={IsViewOnly}
                                                            LoanTransactionDetails={LoanTransactionDetails}
                                                            LoanArrearsDetails={LoanArrearsDetails}
                                                        /> : null}
                                                </Grid>
                                            </Grid>
                                            <Card style={{ marginTop: "20px" }}>
                                                <CardHeader title={"Early Stettlement Details"} />
                                                <CardContent>
                                                    <Grid container className={classes.row} spacing={1}>
                                                        <Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="annualInterestsRate">
                                                                Capital Outstanding
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="annualInterestsRate"
                                                                size='small'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => { handleChange2(e) }}
                                                                value={LoanDetails.capitalOutstanding}
                                                                variant="outlined"
                                                                id="annualInterestsRate"
                                                                InputProps={{ readOnly: true }}
                                                            />
                                                        </Grid><Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="fineInterests">
                                                                Fine Interests (%) *
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="fineInterests"
                                                                size='small'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => { handleChange2(e) }}
                                                                value={earlySettlementDetails.fineInterests}
                                                                variant="outlined"
                                                                id="fineInterests"
                                                            />
                                                        </Grid><Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="earlySettlementFine">
                                                                Early Settlement Fine
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="earlySettlementFine"
                                                                size='small'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => { handleChange2(e) }}
                                                                value={earlySettlementDetails.earlySettlementFine}
                                                                variant="outlined"
                                                                id="earlySettlementFine"
                                                                InputProps={{ readOnly: true }}
                                                            />
                                                        </Grid><Grid item md={3} xs={12}>
                                                            <InputLabel shrink id="earlySettlementTotalAmount">
                                                                Total Amount
                                                            </InputLabel>
                                                            <TextField
                                                                fullWidth
                                                                name="earlySettlementTotalAmount"
                                                                size='small'
                                                                onBlur={handleBlur}
                                                                onChange={(e) => { handleChange2(e) }}
                                                                value={earlySettlementDetails.earlySettlementTotalAmount}
                                                                variant="outlined"
                                                                id="earlySettlementTotalAmount"
                                                                InputProps={{ readOnly: true }}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                                        <Button
                                                            color="primary"
                                                            type="button"
                                                            variant="contained"
                                                            size="medium"
                                                            onClick={handleClickOpen}
                                                            disabled={earlySettlementDetails.earlySettlementTotalAmount == "0.00" ? true : false}
                                                        >
                                                            Settle
                                                        </Button>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </CardContent>
                                    </Card>
                                    <Dialog open={open1} onClose={handleClose1}>
                                        <DialogTitle>Loan Settle confirmation</DialogTitle>
                                        <DialogContent>
                                            <InputLabel shrink id="voucherNumber">
                                                Voucher Number *
                                            </InputLabel>
                                            <TextField
                                                fullWidth
                                                name="voucherNumber"
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange2(e) }}
                                                value={earlySettlementDetails.voucherNumber}
                                                variant="outlined"
                                                id="voucherNumber"
                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleClose1}>Cancel</Button>
                                            <Button onClick={SaveSettlementFine}>Confirm</Button>
                                        </DialogActions>
                                    </Dialog>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    )
}
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
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { BasicCalculations } from '../Components/BasicCalculationsComponent';
import { LoanDistributionSchedule } from '../Components/LoanDistributionScheduleComponent';
import { DatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import _ from 'lodash';
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
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

const screenCode = 'LOANRESHEDULEMENT';
export default function EmployeeLoanReshedulement(props) {
    let decryptedEmployeeLoanID = 0;
    const [EncryptedLoanID, setEncryptedLoanID] = useState();
    const [IsNewRequestPerforming, setIsNewRequestPerforming] = useState(true)
    const { employeeLoanID } = useParams();
    const [GroupList, setGroupList] = useState();
    const [FactoryList, setFactoryList] = useState();
    const [divisions, setDivisions] = useState();
    const [IsSearchPerformed, setIsSearchPerformed] = useState(false)
    const [IsSearchPerformed1, setIsSearchPerformed1] = useState(false)
    const [IsCorrectUser, setIsCorrectUser] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [LoanTypes, setLoanTypes] = useState([]);
    const [IsDefaultExpand, setIsDefaultExpand] = useState(true);
    const [IsViewOnly, setIsViewOnly] = useState(true);
    const [radioValue, setRadioValue] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const agriGenERPEnum = new AgriGenERPEnum();
    const [isSubmitButtonDissable, setIsSubmitButtonDissable] = useState(false);
    const [UserBiometricDetailss, setUserBiometricDetails] = useState({
        customerBiometricData: 'ss',
        customerID: '',
        firstName: '',
        lastName: '',
        nic: '',
        registrationNumber: '',
        secondName: '',
    });
    const [resheduleDetails, setResheduleDetails] = useState({
        disbursementType: '0',
        annualInterestsRate: '',
        noOfMonths: '',
        noOfMonth: '',
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
    const [BaseCalculations, setBaseCalculations] = useState({
        MonthlyPrincipalAndRate: 0,
        NumberOfInstalments: 0,
        TotalPayment: 0,
        OriginalLoanAmount: 0
    });
    const [DurationScheduleDataSet, setDurationScheduleDataSet] = useState([]);
    const [LoanKeyValues, setLoanKeyValues] = useState({
        PrincipalAmount: 0,
        AnnualInterestsRate: 0,
        MonthlyInterestRate: 0,
        EMI: 0,
        NumberOfInstalments: 0,
    })
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
    const handleChangeRadio = (event) => {
        setRadioValue(event.target.value);
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
        setIsCorrectUser(false);
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
            setIsCorrectUser(false);
            trackPromise(LoadLoanDetailsByLoanID());
            setEncryptedLoanID(decryptedEmployeeLoanID);
            setIsDefaultExpand(false);
        }
    }, []);

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
        var isAuthorized = permissions.find(p => p.permissionCode === 'VIEWLOANRESHEDULEMENT');

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
        setResheduleDetails({
            ...resheduleDetails,
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
            divisionID: FormDetails.divisionID === null | 0 ? null : parseInt(FormDetails.divisionID),
            employeeNIC: FormDetails.employeeNIC === "" ? null : FormDetails.employeeNIC.toString(),
            registrationNumber: FormDetails.registrationNumber === "" ? null : FormDetails.registrationNumber.toString(),
            searchDate: FormDetails.searchDate === null ? null : moment(FormDetails.searchDate).format()
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
                    setIsCorrectUser(true);
                } else {
                    setIsSearchPerformed(false)
                    setIsCorrectUser(false);
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
            setIsCorrectUser(false);

            resObject.status = false;
            resObject.isActive = true;

            return resObject;
        } else {
            setUserBiometricDetails(result.data);
            resObject.status = true;
            resObject.isActive = result.data.isActive;

            return resObject;
        }
    }

    async function GetLoanTypes() {
        const response = await services.GetLoanTypeDetails();
        setLoanTypes(response);
    }

    function CalculateLoanFullDetails() {
        let noOfInstalments = /^[0-9]+$/;
        let annualInterestsRateValidator = /^[0-9]{1,3}([.][0-9]{1,2})?$/

        if (resheduleDetails.noOfMonths === "" || resheduleDetails.annualInterestsRate === "" || resheduleDetails.disbursementType === 0) {
            alert.error("Please provide loan details before calculating the loan")
            return;
        }

        if (!noOfInstalments.test(resheduleDetails.noOfMonths.toString()) || resheduleDetails.noOfMonths <= 0) {
            alert.error("Invalid number of months")
            return;
        }

        if (!annualInterestsRateValidator.test(resheduleDetails.annualInterestsRate.toString()) || resheduleDetails.annualInterestsRate < 0) {
            alert.error("Invalid annual interests rate")
            return;
        }

        let obj = {
            loanAmount: LoanDetails.capitalOutstanding,
            annualInterestsRate: resheduleDetails.annualInterestsRate,
            noOfInstalments: resheduleDetails.noOfMonths
        }
        resheduleDetails.disbursementType === 1 ?
            EqualMonthlyInstalmentLoanCalculator(obj) :
            ReducingBalanceLoanCalculator(obj)

    }

    function EqualMonthlyInstalmentLoanCalculator(obj) {
        let LoanDistributionArray = []
        let P = obj.loanAmount;                               // P = Original Loan Amount
        let R = (obj.annualInterestsRate / (12 * 100));       // R = Monthly Interest Rate
        let AR = obj.annualInterestsRate                      // AR = Annual Interest Rate
        let N = (obj.noOfInstalments)                    // Number Of Instalments ' 1Year = 12 Installments'
        let EMI = 0

        if (AR != 0) {
            EMI = (P * R * Math.pow((1 + R), N)) / (Math.pow((1 + R), N) - 1);  // equated monthly installment (EMI) = (P x R x (1+R) ^ N) / ((1+R) ^ N - 1)

            setBaseCalculations({
                ...BaseCalculations,
                MonthlyPrincipalAndRate: EMI,
                NumberOfInstalments: N,
                OriginalLoanAmount: P,
                TotalPayment: EMI * N
            })

            setLoanKeyValues({
                ...LoanKeyValues,
                PrincipalAmount: P,
                AnnualInterestsRate: AR,
                MonthlyInterestRate: parseFloat(R.toFixed(5)),
                EMI: parseFloat(EMI.toFixed(5)),
                NumberOfInstalments: N,
            })
        } else {
            EMI = P / N

            setBaseCalculations({
                ...BaseCalculations,
                MonthlyPrincipalAndRate: EMI,
                NumberOfInstalments: N,
                OriginalLoanAmount: P,
                TotalPayment: EMI * N
            })

            setLoanKeyValues({
                ...LoanKeyValues,
                PrincipalAmount: P,
                AnnualInterestsRate: AR,
                MonthlyInterestRate: parseFloat(R.toFixed(5)),
                EMI: parseFloat(EMI.toFixed(5)),
                NumberOfInstalments: N,
            })
        }

        let PaymentAmount = EMI;
        let RemainingAmount = obj.loanAmount
        let date = _.cloneDeep(selectedDate);
        date.setMonth(date.getMonth() - 1)

        for (let index = 0; index < N; index++) {

            let InterestPaid = (AR / (12 * 100)) * RemainingAmount;
            let PrincipalPaid = PaymentAmount - InterestPaid
            RemainingAmount = RemainingAmount - PrincipalPaid
            date.setMonth(date.getMonth() + 1)
            let month = moment(date).format("MMMM-YYYY")

            let obj = {
                Month_Year: month,
                PaymentAmount: PaymentAmount.toFixed(2),
                IntrestPaid: InterestPaid.toFixed(2),
                PrincipalPaid: PrincipalPaid.toFixed(2),
                MortgaeBalance: RemainingAmount.toFixed(2) === '-0.00' ? '0.00' : RemainingAmount.toFixed(2)
            }
            LoanDistributionArray.push(obj)
        }
        setDurationScheduleDataSet(LoanDistributionArray)
        setIsSearchPerformed1(true)
    }

    function ReducingBalanceLoanCalculator(obj) {
        let TotalLoanPaymentAmount = 0
        let LoanDistributionArray = []
        let P = obj.loanAmount;                               // P = Original Loan Amount
        let R = (obj.annualInterestsRate / 100) / 12;       // R = Monthly Interest Rate
        let AR = obj.annualInterestsRate                      // AR = Annual Interest Rate
        let N = (obj.noOfInstalments)                    // Number Of Instalments ' 1Year = 12 Installments'

        let EMI = P / N

        let PaymentAmount = EMI;
        let RemainingAmount = obj.loanAmount;
        let date = _.cloneDeep(selectedDate);
        date.setMonth(date.getMonth() - 1)

        for (let index = 0; index < N; index++) {

            let ReducingAmount = RemainingAmount
            let xValue = (ReducingAmount * (AR / 100)) / 12;
            let PrincipalPaid = EMI + xValue;
            TotalLoanPaymentAmount += PrincipalPaid;
            let Outstanding = RemainingAmount - PaymentAmount

            date.setMonth(date.getMonth() + 1)
            let month = moment(date).format("MMMM-YYYY")

            let obj = {
                Month_Year: month,
                PaymentAmount: PrincipalPaid.toFixed(2),
                IntrestPaid: xValue.toFixed(2),
                PrincipalPaid: PaymentAmount.toFixed(2),
                MortgaeBalance: Outstanding.toFixed(2) === '-0.00' ? '0.00' : Outstanding.toFixed(2)
            }
            LoanDistributionArray.push(obj);

            ReducingAmount -= EMI;
            RemainingAmount = ReducingAmount;
        }

        setBaseCalculations({
            ...BaseCalculations,
            MonthlyPrincipalAndRate: 0,
            NumberOfInstalments: N,
            OriginalLoanAmount: P,
            TotalPayment: TotalLoanPaymentAmount
        })

        setLoanKeyValues({
            ...LoanKeyValues,
            PrincipalAmount: P,
            AnnualInterestsRate: AR,
            MonthlyInterestRate: parseFloat(R.toFixed(5)),
            EMI: 0,
            NumberOfInstalments: N,
        })

        setDurationScheduleDataSet(LoanDistributionArray)
        setIsSearchPerformed1(true)
    }

    async function SubmitLoanRequest() {

        setIsSubmitButtonDissable(true)

        let object = {
            employeeLoanID: LoanDetails.employeeLoanID,
            registrationNumber: userBasicDetails.registrationNumber.toString(),
            groupID: parseInt(userBasicDetails.GroupID.toString()),
            factoryID: parseInt(userBasicDetails.FactoryID.toString()),
            divisionID: parseInt(userBasicDetails.divisionID.toString()),
            employeeNIC: userBasicDetails.NIC,
            principalAmount: parseFloat(LoanKeyValues.PrincipalAmount.toString()),
            capitalOutstanding: parseFloat(LoanKeyValues.PrincipalAmount.toString()),
            annualRate: parseFloat(LoanKeyValues.AnnualInterestsRate.toString()),
            monthlyRateInDecimal: parseFloat(LoanKeyValues.MonthlyInterestRate.toString()),
            equatedMonthlyInstalment: parseFloat(LoanKeyValues.EMI.toString()),
            numberOfInstalments: parseInt(LoanKeyValues.NumberOfInstalments.toString()),
            loanType: parseInt(LoanDetails.loanType.toString()),
            purpose: LoanDetails.purpose,
            createdBy: tokenDecoder.getUserIDFromToken(),
            statusID: parseInt(agriGenERPEnum.LoanRequestStatus.Resheduled.toString()),
            DisbursementType: parseInt(LoanDetails.disbursementType.toString())
        }
        const resposnse = await services.SaveEmployeeLoanReshedulementRequest(object);
        if (resposnse.statusCode == "Success") {
            alert.success(resposnse.message);
            setTimeout(() => {
                setIsSearchPerformed1(false);
                navigate('/app/employeeLoan/listing')
            }, 1000)
        }
        else {
            alert.error(resposnse.message);
            setIsSubmitButtonDissable(false)
        }
    }

    function handleDateChange(date) {
        setSelectedDate(date)
        setFormDetails({
            ...FormDetails,
            searchDate: date
        });
    }

    async function SubmitHoldLoanRequest() {
        let noOfInstalments = /^[0-9]+$/;
        if (!noOfInstalments.test(resheduleDetails.noOfMonth.toString()) || resheduleDetails.noOfMonth <= 0) {
            alert.error("Invalid number of months")
            return;
        }
        let object = {
            employeeLoanID: LoanDetails.employeeLoanID,
            numberOfInstalments: parseInt(resheduleDetails.noOfMonth.toString()),
            modifiedBy: tokenDecoder.getUserIDFromToken(),
            statusID: parseInt(agriGenERPEnum.LoanRequestStatus.Hold.toString())
        }
        const resposnse = await services.SaveEmployeeLoanHoldRequest(object);
        if (resposnse.statusCode == "Success") {
            alert.success(resposnse.message);
            setTimeout(() => {
                setIsSearchPerformed1(false);
                navigate('/app/employeeLoan/listing')
            }, 1000)
        }
        else {
            alert.error(resposnse.message);
        }
    }

    return (
        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={"Loan Reshedulement"}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: FormDetails.groupID,
                            factoryID: FormDetails.factoryID,
                            divisionID: FormDetails.divisionID,
                            //employeeNIC: FormDetails.employeeNIC,
                            registrationNumber: FormDetails.registrationNumber
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                                factoryID: Yup.number().min(1, "Please Select a Estate").required('Estate is required'),
                                divisionID: Yup.number().min(1, "Please Select a Division").required('Division is required'),
                                // employeeNIC: Yup.string().matches(/^(\d{9}[vVxX]|\d{12})$/s, 'Entered NIC not valid'),
                                registrationNumber: Yup.string().matches(/^[0-9\b]+$/, 'Only allow numbers')
                            })
                        }
                        enableReinitialize
                        onSubmit={GetUserDetails}>
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            touched,
                            values,
                            isSubmitting
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <CardHeader title={cardTitle("Employee Loan Reshedulement")} />
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
                                            <Grid container spacing={2}>
                                                <Grid item md={12} xs={12}>
                                                    <RadioGroup
                                                        row
                                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                                        name="row-radio-buttons-group"
                                                        onChange={handleChangeRadio}
                                                    >
                                                        <FormControlLabel value="1" control={<Radio />} label="Hold" />
                                                        <FormControlLabel value="2" control={<Radio />} label="Resheduling" />
                                                    </RadioGroup>
                                                </Grid>
                                            </Grid>
                                            {radioValue === "2" ?
                                                <Card style={{ marginTop: "20px" }}>
                                                    <CardContent>
                                                        <Grid container className={classes.row} spacing={1}>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="capitalOutstanding">
                                                                    Capital Outstanding
                                                                </InputLabel>
                                                                <TextField
                                                                    error={Boolean(touched.capitalOutstanding && errors.capitalOutstanding)}
                                                                    fullWidth
                                                                    helperText={touched.capitalOutstanding && errors.capitalOutstanding}
                                                                    name="capitalOutstanding"
                                                                    size='small'
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => { handleChange1(e) }}
                                                                    value={LoanDetails.capitalOutstanding}
                                                                    variant="outlined"
                                                                    id="capitalOutstanding"
                                                                    InputProps={{ readOnly: true }}
                                                                />
                                                            </Grid>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="remainingInstalments">
                                                                    Remaining Instalments
                                                                </InputLabel>
                                                                <TextField
                                                                    error={Boolean(touched.remainingInstalments && errors.remainingInstalments)}
                                                                    fullWidth
                                                                    helperText={touched.remainingInstalments && errors.remainingInstalments}
                                                                    name="remainingInstalments"
                                                                    size='small'
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => { handleChange1(e) }}
                                                                    value={LoanDetails.numberOfInstalments - LoanDetails.numberOfCompletedInstalments}
                                                                    variant="outlined"
                                                                    id="remainingInstalments"
                                                                    InputProps={{ readOnly: true }} />
                                                            </Grid>
                                                            <Grid item md={4} xs={12}>
                                                                <InputLabel shrink id="disbursementType">
                                                                    Loan Disbursement Type
                                                                </InputLabel>
                                                                <TextField select
                                                                    error={Boolean(touched.disbursementType && errors.disbursementType)}
                                                                    fullWidth
                                                                    helperText={touched.disbursementType && errors.disbursementType}
                                                                    name="disbursementType"
                                                                    size='small'
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => { handleChange1(e) }}
                                                                    value={LoanDetails.disbursementType}
                                                                    variant="outlined"
                                                                    id="disbursementType"
                                                                    InputProps={{ readOnly: true }}>
                                                                    <MenuItem value={1} key={1} >Equated Monthly Instalment</MenuItem>
                                                                    <MenuItem value={2} key={2} >Residual Balance</MenuItem>
                                                                </TextField>
                                                            </Grid>
                                                        </Grid>
                                                        <Card style={{ marginTop: "20px" }}>
                                                            <CardHeader title={"Propose Installment Details"} />
                                                            <CardContent>
                                                                <Grid container className={classes.row} spacing={1}>
                                                                    <Grid item md={3} xs={12}>
                                                                        <InputLabel shrink id="disbursementType">
                                                                            Loan Disbursement Type *
                                                                        </InputLabel>
                                                                        <TextField select
                                                                            fullWidth
                                                                            name="disbursementType"
                                                                            size='small'
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => { handleChange2(e) }}
                                                                            value={resheduleDetails.disbursementType}
                                                                            variant="outlined"
                                                                            id="disbursementType"
                                                                        >
                                                                            <MenuItem value={0} key={1} >--Select Disbursement Type--</MenuItem>
                                                                            <MenuItem value={1}>Equated Monthly Instalment</MenuItem>
                                                                            <MenuItem value={2}>Residual Balance</MenuItem>
                                                                        </TextField>
                                                                    </Grid>
                                                                    <Grid item md={3} xs={12}>
                                                                        <InputLabel shrink id="annualInterestsRate">
                                                                            Annual Interests Rate *
                                                                        </InputLabel>
                                                                        <TextField
                                                                            fullWidth
                                                                            name="annualInterestsRate"
                                                                            size='small'
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => { handleChange2(e) }}
                                                                            value={resheduleDetails.annualInterestsRate}
                                                                            variant="outlined"
                                                                            id="annualInterestsRate"
                                                                        />
                                                                    </Grid>
                                                                    <Grid item md={3} xs={12}>
                                                                        <InputLabel shrink id="noOfMonths">
                                                                            No Of Instalments *
                                                                        </InputLabel>
                                                                        <TextField
                                                                            fullWidth
                                                                            name="noOfMonths"
                                                                            size='small'
                                                                            onBlur={handleBlur}
                                                                            onChange={(e) => { handleChange2(e) }}
                                                                            value={resheduleDetails.noOfMonths}
                                                                            variant="outlined"
                                                                            id="noOfMonths"
                                                                        />
                                                                    </Grid>
                                                                    <Grid item md={3} xs={12}>
                                                                        <InputLabel shrink id="noOfMonths">
                                                                            Start Month *
                                                                        </InputLabel>
                                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                                            <DatePicker
                                                                                fullWidth
                                                                                autoOk
                                                                                inputVariant="outlined"
                                                                                openTo="month"
                                                                                size='small'
                                                                                views={["year", "month"]}
                                                                                minDate={new Date()}
                                                                                value={selectedDate}
                                                                                onChange={(date) => handleDateChange(date)}
                                                                            />
                                                                        </MuiPickersUtilsProvider>
                                                                    </Grid>
                                                                </Grid>
                                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                                    <Button
                                                                        color="primary"
                                                                        type="button"
                                                                        variant="contained"
                                                                        size="small"
                                                                        onClick={CalculateLoanFullDetails}
                                                                    >
                                                                        Re Calculate
                                                                    </Button>
                                                                </Box>
                                                                <Grid container spacing={2} className={classes.row}>
                                                                    <Grid item md={12} xs={12} hidden={IsSearchPerformed1 != true}>
                                                                        <BasicCalculations
                                                                            BaseCalculations={BaseCalculations}
                                                                        />
                                                                    </Grid>
                                                                </Grid>

                                                                <Grid container spacing={2} className={classes.row}>
                                                                    <Grid item md={12} xs={12} hidden={IsSearchPerformed1 != true}>
                                                                        <LoanDistributionSchedule
                                                                            DurationScheduleDataSet={DurationScheduleDataSet}
                                                                            IsDefaultExpand={true}
                                                                        />
                                                                    </Grid>
                                                                </Grid>
                                                            </CardContent>
                                                        </Card>
                                                        {!IsSearchPerformed1 != true ?
                                                            <Box display="flex" justifyContent="flex-end" p={2}>
                                                                <Button
                                                                    color="primary"
                                                                    type="button"
                                                                    variant="contained"
                                                                    size="medium"
                                                                    onClick={SubmitLoanRequest}
                                                                    disabled={isSubmitButtonDissable || DurationScheduleDataSet.length === 0}
                                                                >
                                                                    Reshedule
                                                                </Button>
                                                            </Box> : null}
                                                    </CardContent>
                                                </Card> : null}
                                            {radioValue === "1" ?
                                                <Card style={{ marginTop: "20px" }}>
                                                    <CardContent>
                                                        <Grid container className={classes.row} spacing={1}>
                                                            <Grid item md={3} xs={12}>
                                                                <InputLabel shrink id="noOfMonth">
                                                                    No Of Months
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    name="noOfMonth"
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => { handleChange2(e) }}
                                                                    value={resheduleDetails.noOfMonth}
                                                                    variant="outlined"
                                                                    id="noOfMonth"
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                                            <Button
                                                                color="primary"
                                                                type="button"
                                                                variant="contained"
                                                                size="medium"
                                                                onClick={SubmitHoldLoanRequest}
                                                            >
                                                                Hold
                                                            </Button>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                                : null
                                            }
                                        </CardContent>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
            </Page>
        </Fragment>
    )
}
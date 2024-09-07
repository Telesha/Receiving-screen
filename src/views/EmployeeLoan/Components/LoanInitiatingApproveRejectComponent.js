import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Button,
    makeStyles,
    CardContent,
    CardHeader,
    Switch,
    Grid,
    TextField,
    MenuItem,
    InputLabel
} from '@material-ui/core';
import { Formik } from 'formik';
import * as Yup from "yup";
import moment from 'moment';
import { BasicCalculations } from './BasicCalculationsComponent';
import { LoanDistributionSchedule } from './LoanDistributionScheduleComponent';
import tokenDecoder from 'src/utils/tokenDecoder';
import Services from '../Services';
import { useAlert } from "react-alert";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import { BasicCalculationsIssuedView } from './BasicCalculationIssuedViewComponent';
import { LoanDetailView } from './LoanDetailViewComponent';
import { LoanArrearsDistribution } from './LoanArrearsDistributionComponent';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    row: {
        marginTop: '0.5rem'
    },
    btnApprove: {
        backgroundColor: "green",
        marginLeft: "1rem",
    },
    btnSendToApprove: {
    },
    btnReject: {
        backgroundColor: "red",
        marginLeft: "1rem",
    },
    btnCalculate: {
        marginLeft: "1rem",
    }
}));

export const LoanInitiating = ({
    permissionList,
    userBasicDetails,
    IsNewRequestPerforming,
    LoanTypes,
    FullLoanDetails,
    IsDefaultExpand,
    IsViewOnly,
    LoanTransactionDetails,
    LoanArrearsDetails
}) => {
    const [IsButtonDisabled, setIsButtonDisabled] = useState(false);
    const classes = useStyles();
    const alert = useAlert();
    const navigate = useNavigate();
    const [DisableUserFields, setDisableUserFields] = useState(true);
    const [IsSearchPerformed, setIsSearchPerformed] = useState(false)
    const [Remarks, setRemarks] = useState(FullLoanDetails.remarks === "" ? null : (FullLoanDetails.remarks == null ? FullLoanDetails.remarks : (FullLoanDetails.remarks.split('-')[1] == " null" ? FullLoanDetails.remarks.split(':-')[0] : FullLoanDetails.remarks)));
    const [NewRemark, setNewRemark] = useState(null);
    const [IsOneMonthGraceEnabled, setIsOneMonthGraceEnabled] = useState(false);
    const [CurrentLoanArrearsAmount, setCurrentLoanArrearsAmount] = useState(0)
    const [LoanDetails, setLoanDetails] = useState({
        loanAmount: 0,
        loanType: 0,
        annualInterestsRate: 0,
        noOfInstalments: 0,
        disbursementType: FullLoanDetails.disbursementType
    });
    const [PersonalDetails, setPersonalDetails] = useState({
        customerRegistrationNumber: '',
        customerNicNumber: '',
        purpose: ''
    })
    const [BaseCalculations, setBaseCalculations] = useState({
        MonthlyPrincipalAndRate: 0,
        NumberOfInstalments: 0,
        TotalPayment: 0,
        OriginalLoanAmount: 0,
        NumberOfHoldMonths: 0
    });
    const [DurationScheduleDataSet, setDurationScheduleDataSet] = useState([])

    const [LoanKeyValues, setLoanKeyValues] = useState({
        PrincipalAmount: 0,
        AnnualInterestsRate: 0,
        MonthlyInterestRate: 0,
        EMI: 0,
        NumberOfInstalments: 0,
    })
    const [PersonalFieldValidator, setPersonalFieldValidator] = useState({
        disableRegistrationField: false,
        disableNicField: false
    });

    useEffect(() => {
        if (LoanArrearsDetails !== null && LoanArrearsDetails.length > 0) {
            for (const element of LoanArrearsDetails) {
                if (element.isCurrent === true) {
                    setCurrentLoanArrearsAmount(element.arrearsAmount)
                }
            }
        }
    }, [LoanArrearsDetails])

    useEffect(() => {
        if (userBasicDetails.CustomerRegistrationNumber !== null) {
            setPersonalDetails({
                ...PersonalDetails,
                customerRegistrationNumber: userBasicDetails.CustomerRegistrationNumber
            });

            setPersonalFieldValidator({
                ...PersonalFieldValidator,
                disableRegistrationField: true
            });
        }

        if (userBasicDetails.NIC !== null) {
            setPersonalDetails({
                ...PersonalDetails,
                customerNicNumber: userBasicDetails.NIC
            });

            setPersonalFieldValidator({
                ...PersonalFieldValidator,
                disableNicField: true
            });
        }
    }, [userBasicDetails]);

    useEffect(() => {
        let object = {
            loanAmount: FullLoanDetails.principalAmount,
            loanType: FullLoanDetails.loanType,
            annualInterestsRate: FullLoanDetails.annualRate,
            noOfInstalments: FullLoanDetails.numberOfInstalments,
            numberOfHoldMonths: FullLoanDetails.numberOfHoldMonths
        }
        LoanDetails.disbursementType === 1 ?
            EqualMonthlyInstalmentLoanCalculator(object) :
            ReducingBalanceLoanCalculator(object)

    }, []);

    useEffect(() => {
        if (FullLoanDetails !== null) {
            setPersonalDetails({
                ...PersonalDetails,
                customerRegistrationNumber: FullLoanDetails.registrationNumber,
                customerNicNumber: FullLoanDetails.customerNIC,
                purpose: FullLoanDetails.purpose
            });
            setLoanDetails({
                ...LoanDetails,
                loanAmount: FullLoanDetails.principalAmount,
                loanType: FullLoanDetails.loanType,
                annualInterestsRate: FullLoanDetails.annualRate,
                noOfInstalments: FullLoanDetails.numberOfInstalments,
            });
        }
    }, []);

    function EqualMonthlyInstalmentLoanCalculator(obj) {
        let LoanDistributionArray = []
        let P = obj.loanAmount;                               // P = Original Loan Amount
        let R = (obj.annualInterestsRate / (12 * 100));       // R = Monthly Interest Rate
        let AR = obj.annualInterestsRate                  // AR = Annual Interest Rate
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
        let date = new Date();

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
        setIsSearchPerformed(true)
    }

    function ReducingBalanceLoanCalculator(obj) {
        let TotalLoanPaymentAmount = 0
        let LoanDistributionArray = []
        let P = obj.loanAmount;                               // P = Original Loan Amount
        let R = (obj.annualInterestsRate / 100) / 12;       // R = Monthly Interest Rate
        let AR = obj.annualInterestsRate                      // AR = Annual Interest Rate
        let N = (obj.noOfInstalments)                    // Number Of Instalments ' 1Year = 12 Installments'
        let H = (obj.numberOfHoldMonths)                 // H = Number of hold months

        let EMI = P / N

        let PaymentAmount = EMI;
        let RemainingAmount = obj.loanAmount
        let date = new Date();

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
            TotalPayment: TotalLoanPaymentAmount,
            NumberOfHoldMonths: H
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
        setIsSearchPerformed(true)
    }

    function handleChange1(e) {
        const target = e.target;
        const value = target.value

        setLoanDetails({
            ...LoanDetails,
            [e.target.name]: value
        });

        setPersonalDetails({
            ...PersonalDetails,
            [e.target.name]: value
        });
    }

    function handleRemarksField(e) {
        const target = e.target;
        const value = target.value;
        var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        if (!format.test(value)) {
            setRemarks(value)
        }
    }

    function handleNewRemarksField(e) {
        const target = e.target;
        const value = target.value;
        var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        if (!format.test(value)) {
            setNewRemark(value)
        }
    }

    function handleChageGraceMonthSwitch(e) {
        const target = e.target;
        const value = target.value;
        setIsOneMonthGraceEnabled(!IsOneMonthGraceEnabled);
    }

    function generateDropDownMenu(dataList) {
        let items = []
        if (dataList != null) {
            for (const object of dataList) {
                items.push(<MenuItem key={object.key} value={object.key}>{object.name}</MenuItem>);
            }
        }
        return items
    }

    async function ApproveLoanRequest() {
        setIsButtonDisabled(true);
        let approveObject = {
            employeeLoanID: FullLoanDetails.employeeLoanID,
            modifiedBy: tokenDecoder.getUserIDFromToken(),
            remarks: Remarks === "" ? null : ("Approve :- " + Remarks),
            result: -1
        }
        const resposnse = await Services.ApproveEmployeeLoanRequest(approveObject);
        if (resposnse.statusCode == "Success") {
            alert.success(resposnse.message);
            setTimeout(() => { navigate('/app/employeeLoan/listing'); }, 1000)
        }
        else {
            setIsButtonDisabled(false);
            alert.error(resposnse.message);
        }
    }

    async function RejectLoanRequest() {
        setIsButtonDisabled(true);
        if (Remarks === "" || Remarks == null) {
            alert.error("Remarks should provide");
            setIsButtonDisabled(false);
            return;
        }

        let rejectObject = {
            employeeLoanID: FullLoanDetails.employeeLoanID,
            modifiedBy: tokenDecoder.getUserIDFromToken(),
            remarks: Remarks === "" ? null : ("Reject :- " + Remarks),
            result: 0
        }

        const resposnse = await Services.RejectEmployeeLoanRequest(rejectObject);
        if (resposnse.statusCode == "Success") {
            alert.success(resposnse.message);
            setTimeout(() => { navigate('/app/employeeLoan/listing'); }, 1000)
        }
        else {
            setIsButtonDisabled(false);
            alert.error(resposnse.message);
        }
    }

    async function IssueLoan() {
        setIsButtonDisabled(true);
        let issueObject = {
            employeeLoanID: FullLoanDetails.employeeLoanID,
            modifiedBy: tokenDecoder.getUserIDFromToken(),
            remarks: (Remarks === null ? "" : Remarks) + "\n" + (NewRemark === null ? "Issue" : ("Issue :- " + NewRemark)),
            oneMonthGracePeriod: IsOneMonthGraceEnabled,
            result: -1
        }

        const resposnse = await Services.IssueEmployeeLoanRequests(issueObject);
        if (resposnse.statusCode == "Success") {
            alert.success(resposnse.message);
            setTimeout(() => { navigate('/app/employeeLoan/listing'); }, 1000)
        }
        else {
            setIsButtonDisabled(false);
            alert.error(resposnse.message);
        }
    }

    async function handleIssueLoan() {
        trackPromise(IssueLoan());
    }

    async function handleRejectLoanRequest() {
        trackPromise(RejectLoanRequest());
    }

    async function handleApproveLoanRequest() {
        trackPromise(ApproveLoanRequest());
    }

    return (
        <Formik
            initialValues={{
                loanAmount: LoanDetails.loanAmount,
                loanType: LoanDetails.loanType,
                annualInterestsRate: LoanDetails.annualInterestsRate,
                noOfInstalments: LoanDetails.noOfInstalments,
                customerRegistrationNumber: PersonalDetails.customerRegistrationNumber,
                customerNicNumber: PersonalDetails.customerNicNumber,
                purpose: PersonalDetails.purpose,
                disbursementType: LoanDetails.disbursementType
            }}
            validationSchema={
                Yup.object().shape({
                    loanAmount: Yup.string().matches(/^[0-9]+([.][0-9]{1,2})?$/, 'Please enter valid loan amount').test('amount', "Please provide valid loan amount", val => val > 0).required('Loan amount is required'),
                    annualInterestsRate: Yup.string().matches(/^[0-9]{1,3}([.][0-9]{1,2})?$/, 'Please enter valid interest rate').test('amount', "Please provide valid interest rate", val => val > 0).required('Interest rate is required'),
                    noOfInstalments: Yup.string().matches(/^[0-9]+$/, 'Please enter valid number of months').test('amount', "Please enter valid number of months", val => val > 0).required('Number of months is required'),
                    customerNicNumber: Yup.string().matches(/^(\d{9}[vVxX]|\d{12})$/, 'Entered NIC not valid').required("NIC is required"),
                    customerRegistrationNumber: Yup.string().required("Registration number is required"),
                    purpose: Yup.string().matches(/^[a-z A-Z]+$/, "Please enter valid purpose").required("Purpose is required"),
                    loanType: Yup.number().min(1, "Please select a loan type").required('Loan type is required'),
                    disbursementType: Yup.number().min(1, "Please select a disbursement type").required('Disbursement type is required')
                })
            }
            enableReinitialize
        >
            {({
                errors,
                handleBlur,
                handleSubmit,
                touched,
                values,
                isSubmitting
            }) => (
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item md={6} xs={12}>
                            <Card style={{ maxHeight: '33rem', minHeight: '33rem' }}>
                                <CardHeader
                                    title={"Loan Details"}
                                />
                                <CardContent>
                                    <InputLabel shrink id="loanAmount">
                                        Loan Amount *
                                    </InputLabel>
                                    <TextField
                                        error={Boolean(touched.loanAmount && errors.loanAmount)}
                                        fullWidth
                                        helperText={touched.loanAmount && errors.loanAmount}
                                        name="loanAmount"
                                        size='small'
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={LoanDetails.loanAmount}
                                        variant="outlined"
                                        id="loanAmount"
                                        disabled={DisableUserFields}
                                    />

                                    <InputLabel shrink id="loanType">
                                        Loan Type *
                                    </InputLabel>

                                    <TextField select
                                        error={Boolean(touched.loanType && errors.loanType)}
                                        fullWidth
                                        helperText={touched.loanType && errors.loanType}
                                        name="loanType"
                                        size='small'
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={LoanDetails.loanType}
                                        variant="outlined"
                                        id="loanType"
                                        disabled={DisableUserFields}
                                    >
                                        <MenuItem value={'0'} disabled={true}>
                                            --Select Loan Type--
                                        </MenuItem>
                                        {generateDropDownMenu(LoanTypes)}
                                    </TextField>

                                    <InputLabel shrink id="annualInterestsRate">
                                        Annual Interests Rate *
                                    </InputLabel>
                                    <TextField
                                        error={Boolean(touched.annualInterestsRate && errors.annualInterestsRate)}
                                        fullWidth
                                        helperText={touched.annualInterestsRate && errors.annualInterestsRate}
                                        name="annualInterestsRate"
                                        size='small'
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={LoanDetails.annualInterestsRate}
                                        variant="outlined"
                                        id="annualInterestsRate"
                                        disabled={DisableUserFields}
                                    />
                                    <InputLabel shrink id="loanType">
                                        Disbursement Type *
                                    </InputLabel>

                                    <TextField select
                                        error={Boolean(touched.disbursementType && errors.disbursementType)}
                                        fullWidth
                                        helperText={touched.disbursementType && errors.disbursementType}
                                        name="disbursementType"
                                        size='small'
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={LoanDetails.disbursementType}
                                        variant="outlined"
                                        id="disbursementType"
                                        disabled={DisableUserFields}
                                    >
                                        <MenuItem value={0} key={0} disabled={true}>
                                            --Select Disbursement Type--
                                        </MenuItem>
                                        <MenuItem value={1} key={1} >Equated Monthly Instalment</MenuItem>
                                        <MenuItem value={2} key={2} >Residual Balance</MenuItem>
                                    </TextField>
                                    <InputLabel shrink id="noOfInstalments">
                                        Number of Months *
                                    </InputLabel>
                                    <TextField
                                        error={Boolean(touched.noOfInstalments && errors.noOfInstalments)}
                                        fullWidth
                                        helperText={touched.noOfInstalments && errors.noOfInstalments}
                                        name="noOfInstalments"
                                        size='small'
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={LoanDetails.noOfInstalments}
                                        variant="outlined"
                                        id="noOfInstalments"
                                        disabled={DisableUserFields}
                                    />
                                    <InputLabel shrink id="purpose">
                                        Purpose *
                                    </InputLabel>
                                    <TextField
                                        error={Boolean(touched.purpose && errors.purpose)}
                                        fullWidth
                                        helperText={touched.purpose && errors.purpose}
                                        name="purpose"
                                        size='small'
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={PersonalDetails.purpose}
                                        variant="outlined"
                                        id="purpose"
                                        disabled={DisableUserFields}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <Card style={{ maxHeight: '33rem', minHeight: '33rem' }}>
                                <CardHeader
                                    title={"Personal Details"}
                                />
                                <CardContent>
                                    <InputLabel shrink id="customerRegistrationNumber">
                                    Employee No *
                                    </InputLabel>
                                    <TextField
                                        error={Boolean(touched.customerRegistrationNumber && errors.customerRegistrationNumber)}
                                        fullWidth
                                        helperText={touched.customerRegistrationNumber && errors.customerRegistrationNumber}
                                        name="customerRegistrationNumber"
                                        size='small'
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={PersonalDetails.customerRegistrationNumber}
                                        variant="outlined"
                                        id="customerRegistrationNumber"
                                        disabled={DisableUserFields || PersonalFieldValidator.disableRegistrationField}
                                    />
                                    <InputLabel shrink id="customerNicNumber">
                                        NIC *
                                    </InputLabel>
                                    <TextField
                                        error={Boolean(touched.customerNicNumber && errors.customerNicNumber)}
                                        fullWidth
                                        helperText={touched.customerNicNumber && errors.customerNicNumber}
                                        name="customerNicNumber"
                                        size='small'
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={PersonalDetails.customerNicNumber}
                                        variant="outlined"
                                        id="customerNicNumber"
                                        disabled={DisableUserFields || PersonalFieldValidator.disableNicField}
                                    />

                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    {
                        IsSearchPerformed === true ?
                            <Card style={{ marginTop: '1rem' }}>
                                <CardContent>
                                    <Grid container spacing={2} className={classes.row}>
                                        <Grid item md={12} xs={12}>
                                            {
                                                IsViewOnly === true && FullLoanDetails.statusID === 4 ?
                                                    <BasicCalculationsIssuedView
                                                        BaseCalculationsIssuedView={FullLoanDetails}
                                                        CurrentLoanArrearsAmount={CurrentLoanArrearsAmount}
                                                    />
                                                    :
                                                    <BasicCalculations
                                                        BaseCalculations={BaseCalculations}
                                                    />
                                            }
                                        </Grid>
                                    </Grid>
                                    {
                                        IsViewOnly === true && FullLoanDetails.statusID === 4 || FullLoanDetails.statusID === 6 ?
                                            <>
                                                <Grid container spacing={2} className={classes.row}>
                                                    <Grid item md={12} xs={12}>
                                                        <LoanDetailView
                                                            LoanTransactionDetails={LoanTransactionDetails}
                                                            IsDefaultExpand={IsDefaultExpand}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={2} className={classes.row}>
                                                    <Grid item md={12} xs={12}>
                                                        <LoanArrearsDistribution
                                                            LoanArrearsDetails={LoanArrearsDetails}
                                                            IsDefaultExpand={IsDefaultExpand}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </>
                                            : null
                                    }
                                    {
                                        (FullLoanDetails.statusID !== 4) && (FullLoanDetails.statusID !== 6) ?
                                            <Grid container spacing={2} className={classes.row}>
                                                <Grid item md={12} xs={12}>
                                                    <LoanDistributionSchedule
                                                        DurationScheduleDataSet={DurationScheduleDataSet}
                                                        IsDefaultExpand={IsDefaultExpand}
                                                    />
                                                </Grid>
                                            </Grid> :
                                            null
                                    }
                                    {
                                        IsViewOnly === false ?

                                            <div>
                                                {
                                                    (IsNewRequestPerforming === false && FullLoanDetails.statusID === 1 && permissionList.isApproveRejectEnabled === true) ||
                                                        (permissionList.isLoanIssueEnabled === true && FullLoanDetails.statusID === 2 && Remarks !== null) ?
                                                        <Grid container spacing={2}>
                                                            <Grid item md={6} xs={12}>
                                                                <InputLabel shrink id="Remarks">
                                                                    {
                                                                        (permissionList.isLoanIssueEnabled === true && FullLoanDetails.statusID === 2) ?
                                                                            "Previous Remarks *"
                                                                            : "Remarks *"
                                                                    }
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    name="remarks"
                                                                    onChange={(e) => {
                                                                        handleRemarksField(e)
                                                                    }}
                                                                    value={Remarks}
                                                                    variant="outlined"
                                                                    id="remarks"
                                                                    disabled={FullLoanDetails.statusID === 2}
                                                                    hidden={Remarks === ""}
                                                                />
                                                            </Grid>
                                                        </Grid> : null
                                                }

                                                {
                                                    permissionList.isLoanIssueEnabled === true && FullLoanDetails.statusID === 2 ?
                                                        <Grid container spacing={2}>
                                                            <Grid item md={6} xs={12}>
                                                                <InputLabel shrink id="newRemarks">
                                                                    New Remark
                                                                </InputLabel>
                                                                <TextField
                                                                    fullWidth
                                                                    name="newRemarks"
                                                                    onChange={(e) => {
                                                                        handleNewRemarksField(e)
                                                                    }}
                                                                    value={NewRemark}
                                                                    variant="outlined"
                                                                    id="newRemarks"
                                                                />
                                                            </Grid>
                                                            {
                                                                FullLoanDetails.disbursementType === 2 ?
                                                                    <Grid item md={6} xs={12}>
                                                                        <InputLabel shrink id="enableInstalments">
                                                                            Enable Fisrt Month Grace Period
                                                                        </InputLabel>
                                                                        <Switch
                                                                            value={IsOneMonthGraceEnabled}
                                                                            onChange={(e) => handleChageGraceMonthSwitch(e)}
                                                                            name="enableInstalments"
                                                                        />
                                                                    </Grid> : null
                                                            }

                                                        </Grid> : null
                                                }

                                                <Box display="flex" justifyContent="flex-end" p={2}>
                                                    {
                                                        FullLoanDetails.statusID === 1 && permissionList.isApproveRejectEnabled === true ?
                                                            <>
                                                                <Button
                                                                    color="secondary"
                                                                    variant="contained"
                                                                    className={classes.btnReject}
                                                                    disabled={!permissionList.isApproveRejectEnabled || FullLoanDetails.statusID === 2 || FullLoanDetails.statusID === 3 || IsButtonDisabled}
                                                                    onClick={handleRejectLoanRequest}
                                                                >
                                                                    Reject
                                                                </Button>

                                                                <Button
                                                                    color="primary"
                                                                    variant="contained"
                                                                    className={classes.btnApprove}
                                                                    disabled={!permissionList.isApproveRejectEnabled || FullLoanDetails.statusID === 2 || FullLoanDetails.statusID === 3 || IsButtonDisabled}
                                                                    onClick={handleApproveLoanRequest}
                                                                >
                                                                    Approve
                                                                </Button>
                                                            </>
                                                            : null
                                                    }
                                                    {
                                                        permissionList.isLoanIssueEnabled === true && FullLoanDetails.statusID === 2 ?
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                className={classes.btnSendToApprove}
                                                                disabled={!permissionList.isLoanIssueEnabled || IsButtonDisabled}
                                                                onClick={handleIssueLoan}
                                                            >
                                                                Issue
                                                            </Button>
                                                            : null
                                                    }
                                                </Box>
                                            </div>
                                            :
                                            <Grid container spacing={2}>
                                                <Grid item md={6} xs={12}>
                                                    <InputLabel shrink id="remarksView">
                                                        Remarks
                                                    </InputLabel>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={4}
                                                        value={Remarks}
                                                        variant="outlined"
                                                        id="remarksView"
                                                        disabled={true}
                                                        hidden={Remarks === ""}
                                                    />
                                                </Grid>
                                            </Grid>
                                    }
                                </CardContent>
                            </Card> :
                            null
                    }
                </form>
            )}
        </Formik>
    )
}
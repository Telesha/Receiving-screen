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

const useStyles = makeStyles((theme) => ({
    row: {
        marginTop: '0.5rem'
    },
    btnCalculate: {
        marginLeft: "1rem",
    }
}));

export const LoanInitiating = ({
    permissionList,
    userBasicDetails,
    LoanTypes,
    clearFormFieldsParent,
    RelatedCustomerRegNumbers,
    SelectedCustomerRegistrationNumber,
    UserBiometricDetails
}) => {

    var element = document.getElementById("calculationDetails");
    const [IsButtonDisabled, setIsButtonDisabled] = useState(false);
    const classes = useStyles();
    const alert = useAlert();
    const navigate = useNavigate();
    const [IsSearchPerformed, setIsSearchPerformed] = useState(false)
    const [LoanDetails, setLoanDetails] = useState({
        loanAmount: "",
        loanType: 0,
        annualInterestsRate: "",
        noOfInstalments: "",
        disbursementType: 1
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
        OriginalLoanAmount: 0
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
    const [SelectedCustomerRegNumber, setSelectedCustomerRegNumber] = useState(0);
    useEffect(() => {
        if (SelectedCustomerRegistrationNumber > 0) {
            setSelectedCustomerRegNumber(SelectedCustomerRegistrationNumber);
        }
    }, [SelectedCustomerRegistrationNumber])

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
        if (UserBiometricDetails.nic !== null || UserBiometricDetails.nic !== '')
            setPersonalDetails({
                ...PersonalDetails,
                customerNicNumber: UserBiometricDetails.nic
            });
    }, [UserBiometricDetails])

    useEffect(() => {
        LoanTypes.forEach(element => {
            if (element.key === LoanDetails.loanType) {
                setLoanDetails({
                    ...LoanDetails,
                    annualInterestsRate: parseFloat(element.price)
                })
            }
        });

    }, [LoanDetails.loanType]);

    useEffect(() => {
        if (LoanDetails.loanType == 5) {
            setLoanDetails({
                ...LoanDetails,
                disbursementType: 1,
                annualInterestsRate: parseFloat(0)
            })
        }
    }, [LoanDetails.loanType])

    function ValidateSubmitForm() {
        let noOfInstalmentsValidator = /^[0-9]+$/;
        let annualInterestsRateValidator = /^[0-9]{1,3}([.][0-9]{1,2})?$/;
        let loanAmountValidator = /^[0-9]+([.][0-9]{1,2})?$/;
        let purposeValidator = /^[a-z A-Z]+$/;
        let customerRegistrationNumberValidator = /^[0-9]+$/;
        let customerNicNumberValidator = /^(\d{9}[vVxX]|\d{12})$/;

        if (
            LoanDetails.loanType === 0 ||
            !annualInterestsRateValidator.test(LoanDetails.annualInterestsRate.toString()) ||
            LoanDetails.disbursementType === 0 ||
            !loanAmountValidator.test(LoanDetails.loanAmount.toString()) ||
            !noOfInstalmentsValidator.test(LoanDetails.noOfInstalments.toString()) ||
            !purposeValidator.test(PersonalDetails.purpose.toString()) ||
            !customerRegistrationNumberValidator.test(SelectedCustomerRegNumber.toString()) ||
            !customerNicNumberValidator.test(PersonalDetails.customerNicNumber.toString()) ||
            LoanDetails.annualInterestsRate < 0
        ) {
            alert.error("Required fields are mandatory")
            return;
        }
    }

    async function SubmitLoanRequest() {

        if (parseInt(SelectedCustomerRegNumber.toString()) === 0) {
            alert.error("Please select customer reg.No");
            return;
        }

        setIsButtonDisabled(true);
        let object = {
            employeeLoanID: 0,
            registrationNumber: SelectedCustomerRegNumber.toString(),
            groupID: parseInt(userBasicDetails.GroupID.toString()),
            factoryID: parseInt(userBasicDetails.FactoryID.toString()),
            divisionID: parseInt(userBasicDetails.divisionID.toString()),
            employeeNIC: PersonalDetails.customerNicNumber,
            principalAmount: parseFloat(LoanKeyValues.PrincipalAmount.toString()),
            capitalOutstanding: parseFloat(LoanKeyValues.PrincipalAmount.toString()),
            annualRate: parseFloat(LoanKeyValues.AnnualInterestsRate.toString()),
            monthlyRateInDecimal: parseFloat(LoanKeyValues.MonthlyInterestRate.toString()),
            equatedMonthlyInstalment: parseFloat(LoanKeyValues.EMI.toString()),
            numberOfInstalments: parseInt(LoanKeyValues.NumberOfInstalments.toString()),
            loanType: parseInt(LoanDetails.loanType.toString()),
            purpose: PersonalDetails.purpose,
            createdBy: tokenDecoder.getUserIDFromToken(),
            statusID: 0,
            DisbursementType: parseInt(LoanDetails.disbursementType.toString())
        }
        const resposnse = await Services.SaveEmployeeLoanRequest(object);
        if (resposnse.statusCode == "Success") {
            alert.success(resposnse.message);
            setTimeout(() => {
                setIsSearchPerformed(false);
                clearFormFieldsParent();
            }, 1000)
        }
        else {
            setIsButtonDisabled(false);
            alert.error(resposnse.message);
        }
    }

    function CalculateLoanFullDetails() {
        let noOfInstalments = /^[0-9]+$/;
        let annualInterestsRateValidator = /^[0-9]{1,3}([.][0-9]{1,2})?$/
        let loanAmount = /^[0-9]+([.][0-9]{1,2})?$/

        if (LoanDetails.noOfInstalments === "" || LoanDetails.noOfInstalments === "" || LoanDetails.loanAmount === "" || LoanDetails.annualInterestsRate === "" || LoanDetails.disbursementType === 0 || LoanDetails.loanType === 0) {
            alert.error("Please provide loan details before calculating the loan")
            return;
        }

        if (!noOfInstalments.test(LoanDetails.noOfInstalments.toString()) || LoanDetails.noOfInstalments <= 0) {
            alert.error("Invalid number of months")
            return;
        }

        if (!annualInterestsRateValidator.test(LoanDetails.annualInterestsRate.toString()) || LoanDetails.annualInterestsRate < 0) {
            alert.error("Invalid annual interests rate")
            return;
        }

        if (!loanAmount.test(LoanDetails.loanAmount.toString())) {
            alert.error("Invalid loan amount")
            return;
        }

        let obj = {
            loanAmount: LoanDetails.loanAmount,
            annualInterestsRate: LoanDetails.annualInterestsRate,
            noOfInstalments: LoanDetails.noOfInstalments
        }
        LoanDetails.disbursementType === 1 ?
            EqualMonthlyInstalmentLoanCalculator(obj) :
            ReducingBalanceLoanCalculator(obj)

        setTimeout(() => { element.scrollIntoView({ behavior: 'smooth' }); }, 100)
    }

    function ClearLoanDetailsFields() {
        setLoanDetails({
            ...LoanDetails,
            loanAmount: "",
            loanType: 0,
            annualInterestsRate: "",
            noOfInstalments: "",
            disbursementType: 1,
        });

        setPersonalDetails({
            ...PersonalDetails,
            purpose: ""
        })

        setIsSearchPerformed(false);
    }

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
                PaymentAmount: PaymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                IntrestPaid: InterestPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                PrincipalPaid: PrincipalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                MortgaeBalance: RemainingAmount.toFixed(2) === '-0.00' ? '0.00' : RemainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

    function generateDropDownMenu(dataList) {
        let items = []
        if (dataList != null) {
            for (const object of dataList) {
                items.push(<MenuItem key={object.key} value={object.key}>{object.name}</MenuItem>);
            }
        }
        return items
    }

    async function handleSubmitLoanRequest() {
        trackPromise(SubmitLoanRequest());
    }


    function generateDropDownMenuRegNumber(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={parseInt(value["registrationNumber"])}>{value["registrationNumber"]}</MenuItem>);
            }
        }
        return items
    }
    return (
        <Formik
            initialValues={{
                loanAmount: LoanDetails.loanAmount,
                loanType: LoanDetails.loanType,
                annualInterestsRate: LoanDetails.annualInterestsRate,
                noOfInstalments: LoanDetails.noOfInstalments,
                customerRegistrationNumber: SelectedCustomerRegistrationNumber,
                customerNicNumber: PersonalDetails.customerNicNumber,
                purpose: PersonalDetails.purpose,
                disbursementType: LoanDetails.disbursementType
            }}
            validationSchema={
                Yup.object().shape({
                    loanAmount: Yup.string().matches(/^[0-9]+([.][0-9]{1,2})?$/, 'Please enter valid loan amount').test('amount', "Please provide valid loan amount", val => val > 0).required('Loan amount is required'),
                    annualInterestsRate: Yup.string().matches(/^[0-9]{1,3}([.][0-9]{1,2})?$/, 'Please enter valid interest rate').test('amount', "Please provide valid interest rate", val => val >= 0).required('Interest rate is required'),
                    noOfInstalments: Yup.string().matches(/^[0-9]+$/, 'Please enter valid number of months').test('amount', "Please enter valid number of months", val => val > 0).required('Number of months is required'),
                    customerNicNumber: Yup.string().matches(/^(\d{9}[vVxX]|\d{12})$/, 'Entered NIC not valid').required("NIC is required"),
                    purpose: Yup.string().matches(/^[a-z A-Z]+$/, "Please enter valid purpose").required("Purpose is required"),
                    loanType: Yup.number().min(1, "Please select a loan type").required('Loan type is required'),
                    disbursementType: Yup.number().min(1, "Please select a disbursement type").required('Disbursement type is required')
                })
            }
            enableReinitialize
            onSubmit={handleSubmitLoanRequest}
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
                            <Card style={{ maxHeight: '36rem', minHeight: '36rem' }}>
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
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={LoanDetails.loanAmount}
                                        variant="outlined"
                                        id="loanAmount"
                                    />

                                    <InputLabel shrink id="loanType">
                                        Loan Type *
                                    </InputLabel>

                                    <TextField select
                                        error={Boolean(touched.loanType && errors.loanType)}
                                        fullWidth
                                        helperText={touched.loanType && errors.loanType}
                                        name="loanType"
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={LoanDetails.loanType}
                                        variant="outlined"
                                        id="loanType"
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
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={LoanDetails.annualInterestsRate}
                                        variant="outlined"
                                        id="annualInterestsRate"
                                        disabled={true}
                                    />
                                    <InputLabel shrink id="loanType">
                                        Disbursement Type *
                                    </InputLabel>

                                    <TextField select
                                        error={Boolean(touched.disbursementType && errors.disbursementType)}
                                        fullWidth
                                        helperText={touched.disbursementType && errors.disbursementType}
                                        name="disbursementType"
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={LoanDetails.disbursementType}
                                        variant="outlined"
                                        id="disbursementType"
                                        disabled={true}
                                    >
                                        <MenuItem value={0} key={0} disabled={true}>
                                            --Select Disbursement Type--
                                        </MenuItem>
                                        <MenuItem value={1} key={1} >Equated Monthly Installment</MenuItem>
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
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={LoanDetails.noOfInstalments}
                                        variant="outlined"
                                        id="noOfInstalments"
                                    />
                                    <InputLabel shrink id="purpose">
                                        Purpose *
                                    </InputLabel>
                                    <TextField
                                        error={Boolean(touched.purpose && errors.purpose)}
                                        fullWidth
                                        helperText={touched.purpose && errors.purpose}
                                        name="purpose"
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={PersonalDetails.purpose}
                                        variant="outlined"
                                        id="purpose"
                                    />
                                </CardContent>
                                <Box display="flex" justifyContent="flex-end" p={2}>

                                    <Button
                                        color="primary"
                                        variant="contained"
                                        size="small"
                                        onClick={ClearLoanDetailsFields}
                                    >
                                        Clear
                                    </Button>

                                    <Button
                                        className={classes.btnCalculate}
                                        color="primary"
                                        variant="contained"
                                        size="small"
                                        onClick={CalculateLoanFullDetails}
                                    >
                                        Calculate
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <Card style={{ maxHeight: '36rem', minHeight: '36rem' }}>
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
                                        variant="outlined"
                                        id="customerRegistrationNumber"
                                        value={SelectedCustomerRegNumber}
                                        onChange={(e) => {
                                            setSelectedCustomerRegNumber(parseInt(e.target.value.toString()))
                                        }}
                                        InputProps={{
                                            readOnly: true
                                        }}
                                    />
                                    <InputLabel shrink id="customerNicNumber">
                                        NIC *
                                    </InputLabel>
                                    <TextField
                                        error={Boolean(touched.customerNicNumber && errors.customerNicNumber)}
                                        fullWidth
                                        helperText={touched.customerNicNumber && errors.customerNicNumber}
                                        name="customerNicNumber"
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange1(e)
                                        }}
                                        value={PersonalDetails.customerNicNumber}
                                        variant="outlined"
                                        id="customerNicNumber"
                                        InputProps={{
                                            readOnly: true
                                        }}
                                    />

                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Card id="calculationDetails" style={{ marginTop: '1rem' }}>
                        {
                            IsSearchPerformed === true ?
                                <CardContent>
                                    <Grid container spacing={2} className={classes.row}>
                                        <Grid item md={12} xs={12}>
                                            <BasicCalculations
                                                BaseCalculations={BaseCalculations}
                                            />
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={2} className={classes.row}>
                                        <Grid item md={12} xs={12}>
                                            <LoanDistributionSchedule
                                                DurationScheduleDataSet={DurationScheduleDataSet}
                                                IsDefaultExpand={true}
                                            />
                                        </Grid>
                                    </Grid>
                                    <div>
                                        <Box display="flex" justifyContent="flex-end" p={2}>
                                            <Button
                                                type="submit"
                                                color="primary"
                                                variant="contained"
                                                disabled={!permissionList.isSendToApproveEnabled || IsButtonDisabled}
                                                onClick={ValidateSubmitForm}
                                            >
                                                Send To Approve
                                            </Button>
                                        </Box>
                                    </div>
                                </CardContent>
                                :
                                null
                        }
                    </Card>
                </form>
            )}
        </Formik>
    )
}
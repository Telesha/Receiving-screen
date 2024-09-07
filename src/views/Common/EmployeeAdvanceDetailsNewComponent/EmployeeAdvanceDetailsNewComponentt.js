import React, { useEffect, useState } from 'react'
import {
    Box,
    Card,
    makeStyles,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableContainer,
    TableRow,
    Grid,
    TextField,
    InputLabel,
    Typography,

} from '@material-ui/core';
import CountUp from 'react-countup';
import { useAlert } from "react-alert";
import Paper from '@material-ui/core/Paper';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { LeftCardComponent } from './Components/LeftCard';
import { RightCardComponent } from './Components/RightCard';
import paymentServices from './Services';
import { trackPromise } from 'react-promise-tracker';
import Services from '../../Common/EmployeeAdvanceDetailsNewComponent/Services';

const useStyles = makeStyles((theme) => ({
    cardContent: {
        padding: 0
    },
    tableContainer: {
        maxHeight: 160
    },
}));

export const EmployeeAdvanceDetailsNewComponent = ({
    registrationNumber, date, divisionID
}) => {
    const classes = useStyles();
    const alert = useAlert();
console.log("divisionID",divisionID)
    const [totalgross, setTotalgross] = useState(0);
    const [balanceCarriedForward, setBalanceCarriedForward] = useState(0);
    const [deductionAmount, setDeductionAmount] = useState(0);
    const [loanAmount, setLoanAmount] = useState(0);
    const [advance, setAdvance] = useState(0);
    const [balance, setBalance] = useState(0);
    const [balanceBroughtForward, setBalanceBroughtForward] = useState(0);
    const [totalEarning, setTotalEarning] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [otHours, setOtHours] = useState(0);
    const [mandays, setMandays] = useState(0);
    const [total, setTotal] = useState(0);
    const [over, setOver] = useState(0);

    const [totalgrossOne, setTotalgrossOne] = useState(0);
    const [balanceCarriedForwardOne, setBalanceCarriedForwardOne] = useState(0);
    const [deductionAmountOne, setDeductionAmountOne] = useState(0);
    const [loanAmountOne, setLoanAmountOne] = useState(0);
    const [advanceOne, setAdvanceOne] = useState(0);
    const [balanceOne, setBalanceOne] = useState(0);
    const [balanceBroughtForwardOne, setBalanceBroughtForwardOne] = useState(0);
    const [totalEarningOne, setTotalEarningOne] = useState(0);
    const [paidAmountOne, setPaidAmountOne] = useState(0);
    const [otHoursOne, setOtHoursOne] = useState(0);
    const [mandaysOne, setMandaysOne] = useState(0);
    const [totalOne, setTotalOne] = useState(0);
    const [overOne, setOverOne] = useState(0);

    useEffect(() => {
        if (registrationNumber != null || registrationNumber != "" || registrationNumber != undefined) {
            trackPromise(GetEmployeeSalaryAndAttendenceDetailsForCommonCard(registrationNumber, date, divisionID));
        }
    }, [registrationNumber]);

    async function GetEmployeeSalaryAndAttendenceDetailsForCommonCard(regNumber, date, divisionID) {
         const result = await Services.GetEmployeeSalaryAndAttendenceDetailsForCommonCard(regNumber, date, divisionID);
        console.log('result', result)
        if (result.previous != null) {
            var newres = result.previous;
            const roundedNumber = Math.floor(newres.paidAmount / 10) * 10;

            setMandays(newres.manDays);
            setTotal(newres.totalKgAmount);
            setOver(newres.totalOverKgAmount);
            setTotalgross(newres.totalEarning);
            setBalanceCarriedForward(0);
            setDeductionAmount(newres.deductionAmount);
            setLoanAmount(newres.deductionLoan);
            setAdvance(newres.advanceAmount);
            setPaidAmount(roundedNumber);
            setBalanceBroughtForward(newres.paidAmount - roundedNumber);
            setTotalEarning(newres.totalEarning)
            setOtHours(newres.otHours)
            setBalance(newres.paidAmount)
        }
        if (result.current != null) {
            var newres = result.current;
            var newresOne = result.previous;
            var balanceCarriedForward = 0;
            const roundedNumber = Math.floor(newresOne == null ? 0 / 10 : newresOne.paidAmount / 10) * 10;
            balanceCarriedForward = newresOne == null ? 0 : newresOne.paidAmount - roundedNumber

            setMandaysOne(newres.manDays);
            setTotalOne(newres.totalKgAmount);
            setOverOne(newres.totalOverKgAmount);
            setTotalgrossOne(newres.totalEarning);
            setBalanceCarriedForwardOne(balanceCarriedForward);
            setDeductionAmountOne(newres.deductionAmount);
            setLoanAmountOne(newres.deductionLoan);
            setAdvanceOne(newres.advanceAmount);
            setPaidAmountOne(newres.paidAmount);
            setBalanceBroughtForwardOne(0);
            setTotalEarningOne(newres.totalEarning + balanceCarriedForward)
            setOtHoursOne(newres.otHours)
            setBalanceOne(newres.paidAmount + balanceCarriedForward)
        }
    }

    return (
        <>
            {
                <>
                    <Grid container spacing={3}>
                        <Grid item md={6} xs={12}>
                            <LeftCardComponent
                                date={date}
                                mandays={mandays}
                                total={total}
                                over={over}
                                totalgross={totalgross}
                                balanceCarriedForward={balanceCarriedForward}
                                deductionAmount={deductionAmount}
                                loanAmount={loanAmount}
                                advance={advance}
                                paidAmount={paidAmount}
                                otHours={otHours}
                                balanceBroughtForward={balanceBroughtForward}
                                totalEarning={totalEarning}
                            />
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <RightCardComponent
                                date={date}
                                mandays={mandaysOne}
                                total={totalOne}
                                over={overOne}
                                totalgross={totalgrossOne}
                                balanceCarriedForward={balanceCarriedForwardOne}
                                deductionAmount={deductionAmountOne}
                                loanAmount={loanAmountOne}
                                advance={advanceOne}
                                otHours={otHoursOne}
                                balance={balanceOne}
                                totalEarning={totalEarningOne}
                            />
                        </Grid>
                    </Grid>
                </>
            }
        </>
    )

}
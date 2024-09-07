import React, { useState, useEffect, Fragment, useRef } from 'react';
import {
    Box,
    Card,
    Grid,
    makeStyles,
    Container,
    CardContent,
    CardHeader,
    Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from 'src/views/Common/PageHeader';
import { LoadingComponent } from '../../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import Typography from '@material-ui/core/Typography';

import ReactToPrint from 'react-to-print';
import CreatePDFSingle from './CreatePDFSingle';

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
    colorCancel: {
        backgroundColor: "red",
    },
}));

export default function CreatePayslipViewPayroll(props) {
    const [title, setTitle] = useState();
    const classes = useStyles();
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/createPayslipPayroll/listing');
    }
    const componentRef = useRef();
    const [balancePay, setBalancePay] = useState(0);
    const [overTime, setOverTime] = useState(0);
    const [netPay, setNetPay] = useState(0);
    const [totalEPF, setTotalEPF] = useState(0);
    const [totalDeductions, setTotalDeductions] = useState(0);

    const { payRollMonthlyExecutionID } = useParams();
    const [paySlipData, setPaySlipData] = useState({
        estateName: "",
        groupName: "",
        employeeName: "",
        employeeNo: "",
        epfNo: "",
        designationName: "",
        basicSalary: 0,
        month: 0,
        year: 0,
        otAmount: 0,
        otHours: 0,
        additionAmount: 0,
        deductionAmount: 0,
        cashAdvance: 0,
        bf: 0,
        cf: 0,
        nopayAmount: 0,
        employeeEPFAmount: 0,
    });
    const [grossEarnings, setGrossEarnings] = useState(0);
    let decrypted = 0;

    useEffect(() => {

        decrypted = atob(payRollMonthlyExecutionID.toString());
        if (decrypted != 0) {
            trackPromise(GetPaySlipDetailsByID(decrypted));
        }
    }, []);

    async function GetPaySlipDetailsByID(payRollMonthlyExecutionID) {
        const paySlipData = await services.GetPayrollMonthlyExecution(payRollMonthlyExecutionID);
        setPaySlipData({
            ...paySlipData,
            estateName: paySlipData.estateName,
            groupName: paySlipData.groupName,
            employeeName: paySlipData.employeeName,
            employeeNo: paySlipData.employeeNo,
            epfNo: paySlipData.epfNo,
            designationName: paySlipData.designationName,
            basicSalary: paySlipData.basicSalary,
            month: paySlipData.month,
            year: paySlipData.year,
            otAmount: parseFloat(paySlipData.otAmount),
            otHours: parseFloat(paySlipData.otHours),
            additionAmount: parseFloat(paySlipData.additionAmount),
            deductionAmount: parseFloat(paySlipData.deductionAmount),
            cashAdvance: parseFloat(paySlipData.cashAdvance),
            bf: parseFloat(paySlipData.bf),
            cf: parseFloat(paySlipData.cf),
            nopayAmount: parseFloat(paySlipData.nopayAmount),
            employeeEPFAmount: parseFloat(paySlipData.employeeEPFAmount),


        });

        setPaySlipData(paySlipData);

        let ot = paySlipData.otAmount * paySlipData.otHours;
        let grossEarning = paySlipData.basicSalary + ot + paySlipData.additionAmount + paySlipData.bf;
        let totalDeduction = parseFloat(paySlipData.cashAdvance) + parseFloat(paySlipData.employeeEPFAmount);
        setGrossEarnings(grossEarning);
        setOverTime(ot);
        setTotalDeductions(totalDeduction);
        setNetPay(grossEarning - totalDeduction);
        setTotalEPF(paySlipData.basicSalary - paySlipData.nopayAmount);
        setBalancePay(grossEarning - totalDeduction - paySlipData.cf);
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
                    <div align="center">
                        <Card style={{ borderStyle: "double" }} title='PaySlip'>
                            <CardHeader title={cardTitle(title)} />
                            <CardContent style={{ justifyContent: "center" }} >
                                <Box width={800}>
                                    <center><h3>Payslip</h3></center>
                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                    <Grid container spacing={1}>
                                        {/* Header */}
                                        <Grid item md={3} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Estate Name:</Typography>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Group Name:</Typography> */}
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Name:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Employee No:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">E.P.F.No:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Designation</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Month / Year</Typography>
                                        </Grid>
                                        <Grid item md={3} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography> */}
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={5} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipData.estateName}</Typography>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipData.groupName}</Typography> */}
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipData.employeeName}</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipData.employeeNo}</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipData.epfNo == "" ? "-" : paySlipData.epfNo}</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipData.designationName}</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipData.month} / {paySlipData.year}</Typography>
                                        </Grid>
                                    </Grid>
                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                    <Grid container spacing={1}>
                                        {/* 1st Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Basic Salary </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.basicSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                        {/* 2nd Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Annual Increment </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.additionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>
                                        {/* 3rd Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">No Pay </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipData.length != 0 ? (paySlipData.nopayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography>
                                        </Grid>
                                    </Grid>
                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                    <Grid container spacing={1}>
                                        {/* Total Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left"><b>Total For EPF </b></Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h4' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipData.length != 0 ? (paySlipData.employeeEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography> */}
                                        </Grid>
                                    </Grid>
                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                    <Grid container spacing={1}>
                                        {/* 1st Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Overtime </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData != 0 ? (overTime.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                        {/* 2nd Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Unpaid Coins </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.bf.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                        {/* 3rd Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Other Payments </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.additionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                    </Grid>
                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                    <Grid container spacing={1}>
                                        {/* Total Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left"><b>Gross Earnings </b></Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipData.length != 0 ? (grossEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography>
                                        </Grid>
                                    </Grid>
                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                    <Grid container spacing={1}>
                                        {/* Second 3rd Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Stamp </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.monthlyAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>
                                        {/* Second 8th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">ESPS 10% </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.deductionDetails[0].foodStuffRecoveries.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>
                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">EPF 10% </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.employeeEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Medical 5% </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipData.length != 0 ? (paySlipData.balancePay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography> */}
                                        </Grid>
                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Food Stuff </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.epfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>
                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Festival Advance </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.etfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>
                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Bank </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.etfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>
                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Union </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.etfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>
                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Welfare Society </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.etfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>
                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">CDF Loan </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.etfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>
                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Croll Loss </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.etfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>
                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">CEB </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.etfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>{/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Singer </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.etfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>
                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">CESHCS </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.etfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography> */}
                                        </Grid>
                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Cash Advance </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipData.length != 0 ? (paySlipData.cashAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                    </Grid>
                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                    <Grid container spacing={1}>
                                        {/* Total Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left"><b>Deduction </b></Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipData.length != 0 ? (totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography>
                                        </Grid>
                                    </Grid>
                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                    <Grid container spacing={1}>
                                        {/* Total Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left"><b>Balance Pay</b></Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipData.length != 0 ? (netPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography>
                                        </Grid>
                                    </Grid>
                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                    <Grid container spacing={1}>
                                        {/* Total Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left"><b>Made Up Coins </b></Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipData.length != 0 ? (paySlipData.cf.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography>
                                        </Grid>
                                    </Grid>
                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                    <Grid container spacing={1}>
                                        {/* Total Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left"><b>Balance Pay </b></Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipData.length != 0 ? (balancePay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography>
                                        </Grid>
                                    </Grid>
                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                    <Grid container spacing={1}>
                                        {/* Total Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left"><b>Medical Balance </b></Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h4' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            {/* <Typography variant='h4' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipData.length != 0 ? (paySlipData.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography> */}
                                        </Grid>
                                    </Grid>
                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                </Box>
                            </CardContent>
                            <div>
                                <Box
                                    display="flex"
                                    justifyContent="flex-end"
                                    p={2}
                                >
                                    <ReactToPrint
                                        documentTitle={"Employee Payslip"}
                                        trigger={() => (
                                            <Button
                                                color="primary"
                                                id="btnRecord"
                                                type="submit"
                                                variant="contained"
                                                className={classes.colorCancel}
                                                size="small"
                                            >
                                                PDF
                                            </Button>
                                        )}
                                        content={() => componentRef.current}
                                    />
                                    <div hidden={true}>
                                        {paySlipData.length != 0 ? (
                                            <CreatePDFSingle
                                                ref={componentRef}
                                                paySlipData={paySlipData}
                                                totalDeductions={totalDeductions}
                                                totalEPF={totalEPF}
                                                netPay={netPay}
                                                grossEarnings={grossEarnings}
                                                balancePay={balancePay}
                                                overTime={overTime}
                                            />
                                        ) : null}
                                    </div>
                                    <div>&nbsp;</div>
                                </Box>
                            </div>
                        </Card>
                    </div>
                </Container>
            </Page>
        </Fragment >
    );
};

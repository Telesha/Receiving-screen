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
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PageHeader from 'src/views/Common/PageHeader';
import { LoadingComponent } from '../../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import Typography from '@material-ui/core/Typography';

import ReactToPrint from 'react-to-print';
import CreatePDFSingle from './CreatePDFSingle';
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
    colorCancel: {
        backgroundColor: "red",
    },
}));

export default function CreatePayslipView() {
    const [title, setTitle] = useState();
    const classes = useStyles();
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/app/createPayslip/listing');


    }

    const componentRef = useRef();

    const [paySlipDetails, setPaySlipDetails] = useState([]);
    const [totalDeductions, setTotalDeductions] = useState(0);
    const [totalEarningEPF, setTotalEarningEPF] = useState(0);
    const [PI, setPI] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [balancePay, setBalancePay] = useState(0);
    const { employeeId, month, year } = useParams();
    let decrypted = 0;
    let decryptedMonth = "";
    let decryptedYear = "";

    useEffect(() => {
        decrypted = atob(employeeId.toString());
        decryptedMonth = atob(month.toString());
        decryptedYear = atob(year.toString());
        if (decrypted != 0) {
            trackPromise(GetPaySlipDetailsByID(decrypted, decryptedMonth, decryptedYear));
        }
    }, []);

    async function GetPaySlipDetailsByID(employeeId, month, year) {
        const paySlipData = await services.GetPaySlipDetailsByID(employeeId, month, year);

        let totalDeductions = ((paySlipData[0].epf) + (paySlipData[0].deductionDetails[0].festivalAdvance) + (paySlipData[0].deductionDetails[0].unionDeductions) + (paySlipData[0].deductionDetails[0].religiousActivities) +
            (paySlipData[0].deductionDetails[0].cooperative) + (paySlipData[0].deductionDetails[0].funeralFund) + (paySlipData[0].deductionDetails[0].welfare) + (paySlipData[0].deductionDetails[0].dhoby) +
            (paySlipData[0].deductionDetails[0].barber) + (paySlipData[0].deductionDetails[0].bankRecoveries) + (paySlipData[0].deductionDetails[0].insuranceRecoveries) + (paySlipData[0].deductionDetails[0].penalty) + (paySlipData[0].deductionDetails[0].previousDebts) +
            (paySlipData[0].deductionDetails[0].paySheet) + (paySlipData[0].deductionDetails[0].otherDeductions) + (paySlipData[0].deductionDetails[0].waterSchemeRecoveries) + (paySlipData[0].deductionDetails[0].electricity) + (paySlipData[0].deductionDetails[0].tools) +
            (paySlipData[0].deductionDetails[0].creheFund) + (paySlipData[0].deductionDetails[0].recoveries) + (paySlipData[0].deductionDetails[0].tea) + (paySlipData[0].deductionDetails[0].debtsRecoveredAnother)
        );

        let totalEarningEPF = ((paySlipData[0].earnings) + (paySlipData[0].holidayPay));

        let PI = ((paySlipData[0].earnings) + (paySlipData[0].holidayPay));

        let totalEarnings = ((paySlipData[0].earnings) + (paySlipData[0].holidayPay) + (paySlipData[0].extraRate) + (paySlipData[0].overKillos) + (paySlipData[0].otPay) + (paySlipData[0].productivityIncentive) + (paySlipData[0].cashPlucking) + (paySlipData[0].sundryCashJobAmount) + (paySlipData[0].others) +
            (paySlipData[0].advanceInsensitives) + (paySlipData[0].previousUnpaidWages) + (paySlipData[0].deductionDetails[0].cashDayPluckingAmount));

        let balancePay = (totalEarnings - totalDeductions - (paySlipData[0].madeUpAmount));

        setPaySlipDetails(paySlipData[0]);
        setTotalDeductions(totalDeductions);
        setTotalEarningEPF(totalEarningEPF);
        setPI(PI);
        setTotalEarnings(totalEarnings);
        setBalancePay(balancePay);
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
                        <Card style={{ borderStyle: "double" }} title='Employee PaySlip'>
                            <CardHeader title={cardTitle(title)} />
                            <CardContent style={{ justifyContent: "center" }} >
                                <Box width={800}>

                                    <center><h3>Payslip</h3></center>

                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>
                                    <Grid container spacing={1}>
                                        {/* Header */}
                                        <Grid item md={3} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Division:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Estate Name:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Group Name:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Name:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Employee No:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">E.P.F.No:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Month & Year</Typography>
                                        </Grid>
                                        <Grid item md={3} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={5} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipDetails.divisionName}</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipDetails.factoryName}</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipDetails.groupName}</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipDetails.employeeName}</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipDetails.employeeCode}</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{paySlipDetails.epfNo ? paySlipDetails.epfNo : '-'}</Typography>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">{moment(paySlipDetails.month).format('MMMM')} / {paySlipDetails.year}</Typography>
                                        </Grid>
                                    </Grid>

                                    <div><br /><hr /><br /></div>

                                    <Grid container spacing={1}>
                                        {/* Header 2 */}
                                        <Grid item md={8} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">No. of Days Worked / வேலை செய்த நாட்கள்</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].daysWorked.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                    </Grid>
                                    <Grid container spacing={1}>
                                        {/* Header 2 */}
                                        <Grid item md={8} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Daily Wages / தினசரி ஊதியம்</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography style={{ marginLeft: "4rem" }} align="right"> {paySlipDetails.length != 0 ? (paySlipDetails.dailyWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                    </Grid>

                                    <div><br /><hr /></div>
                                    <div><hr /><br /></div>

                                    <Grid container spacing={1}>
                                        {/* 1st Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Earnings / வருவாய்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* 2nd Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Holiday Pay / விடுமுறை ஊதியம்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.holidayPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* 3rd Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left"><b>Total Earning for EPF / ஊழியர் சேம நிதியத்திற்கான மொத்த வருவாய் (EPF)</b></Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipDetails.length != 0 ? (totalEarningEPF.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography>
                                        </Grid>

                                        {/* 4th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Extra Rate / கூடுதல் விகிதம்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.extraRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>



                                        {/* 5th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Over Killos-Green Leaf/Latex /கிலோஸ்-கிரீன் இலை/லேடெக்ஸ் மீது </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">{paySlipDetails.length != 0 ? (paySlipDetails.overKillos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                        {/* 5.1th  Row */}

                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontSize: '12px' }} align="left">Over Killos /ஓவர் கிலோஸ் </Typography>
                                        </Grid>

                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginRight: "2rem", fontSize: '12px' }} align="left">{paySlipDetails.length != 0 ? (paySlipDetails.overKilo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* 6th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Over Time Pay / கூடுதல் நேர ஊதியம்</Typography>

                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.otPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                        {/* {6th 1 Row} */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontSize: '12px' }} align="left">Day Over Time / நாளுக்கு நாள் </Typography>

                                        </Grid>

                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginRight: "2rem", fontSize: '12px' }} align="left">{paySlipDetails.length != 0 ? (paySlipDetails.dayOTHrs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* {6th 2 row} */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontSize: '12px' }} align="left">Night Over Time / நேரத்துக்கு மேல் இரவு </Typography>

                                        </Grid>

                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginRight: "2rem", fontSize: '12px' }} align="left">{paySlipDetails.length != 0 ? (paySlipDetails.nightOTHrs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* {6th 3 row } */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontSize: '12px' }} align="left">Double Over Time / காலப்போக்கில் இரட்டிப்பு</Typography>

                                        </Grid>

                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginRight: "2rem", fontSize: '12px' }} align="left">{paySlipDetails.length != 0 ? (paySlipDetails.doubleOTHrs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* 7th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Productivity Incentive / உற்பத்தி ஊக்குவிப்பு</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.productivityIncentive.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* 8th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Cash Day Plucking / கொழுந்து பறிப்பதுக்கான நாள் ஊதியும்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].cashDayPluckingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontSize: '12px' }} align="left">Worked Days / வேலை செய்த நாட்கள்</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginRight: "2rem", fontSize: '12px' }} align="left">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].cashdayPluckingWorkingDays.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* 8.1th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Cash Plucking/Tapping / கொழுந்து பறிப்பதுக்கான ஊதியும்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.cashPlucking.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* 8.2th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Sundry CashJob Amount / சில்லரை கைக்காசு வேலைக்கான தொகை</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.sundryCashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem", fontSize: '12px' }} align="left"> Worked Days / வேலை செய்த நாட்கள்</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginRight: "2rem", fontSize: '12px' }} align="left">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].sundryCashJobWorkingDays.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* 9th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Other Earning / மற்றவைகள்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.others.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* 10th Row */}
                                        {/* <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">PI / PI</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (PI.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid> */}

                                        {/* 11th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Advance Insensitives / முன்கூட்டிய ஊக்கம்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.advanceInsensitives.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* 12th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Previous Unpaid Wages / முன்பு கொடுக்கப்படாத ஊதியம்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.previousUnpaidWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                    </Grid>

                                    <div><br /><hr /><br /></div>

                                    <Grid container spacing={1}>
                                        {/* Total Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left"><b>Total Earnings / மொத்த வருவாய்</b></Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipDetails.length != 0 ? (totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography>
                                        </Grid>
                                    </Grid>

                                    <div><br /><hr /><br /></div>

                                    <Grid container spacing={1}>
                                        {/* Second 1st Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">E.P.F / ஊழியர் சேமலாப நிதி</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.epf.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 2nd Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Festival Advance / பண்டிகை முற்பணம் (தீபாவளி/கிரிஸதும்ஸ)</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].festivalAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 4th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Union Subscription / யூனியன் சந்தா</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].unionDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 5th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Religious Activities / மத நடவடிக்கைகள்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].religiousActivities.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 6th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Co-operative / கூட்டுறவு</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].cooperative.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 7th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Funeral Fund / மரண கொடுப்பனவு</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].funeralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 9th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Wellfare / நலன்புரி கொடுப்பனவு</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].welfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 10th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Dhoby / வண்ணான்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].dhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 11th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Barber / முடி திருத்துபவர்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].barber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 12th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Bank Recoveries / வங்கி அறவீடுகள்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].bankRecoveries.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 13th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Insurance Premium / காப்பீட்டு திட்டம்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].insuranceRecoveries.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 14th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Penalty / தண்ட பணம் </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].penalty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 15th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Previous Debts / முந்தைய கடன்கள்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].previousDebts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 16th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Pay Sheet / ஊதிய தாள்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].paySheet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 17th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Others / மற்றவைகள்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 18th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Water Scheme Recover / குடிநீர் திட்ட அறவீடுகள்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].waterSchemeRecoveries.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 19th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Electricity / மின்சார அறவீடுகள்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].electricity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 20th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Loss of Tools / கருவிகளின் இழப்பு</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].tools.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 21st Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Crech Fund / சிறுவர் அபிவிருத்தி நிலைய நிதி</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].creheFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 22nd Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Recoveries / அறவீடுகள்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].recoveries.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 23rd Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Tea / தேயிலை தூள்</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].tea.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 24th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Debts Recovered for Another / மற்றொருவருடைய கடன் திரும்பப் பெறப்பட்டது</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].debtsRecoveredAnother.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                    </Grid>

                                    <div><br /><hr /><br /></div>

                                    <Grid container spacing={1}>
                                        {/* Total Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left"><b>Total Deductions / மொத்த அறவீடுகள்</b></Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipDetails.length != 0 ? (totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography>
                                        </Grid>
                                    </Grid>

                                    <div><br /><hr /><br /></div>

                                    <Grid container spacing={1}>
                                        {/* Second 3rd Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Part Payment 1 / பகுதி கட்டணம் 1</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.monthlyAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Second 8th Row */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Part Payment 2 / பகுதி கட்டணம் 2</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left"></Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.deductionDetails[0].foodStuffRecoveries.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">Made up Amount / சேர்க்கபட்ட தொகை </Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.madeUpAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left"><b>Balance Pay / இறுதி தொகை </b></Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right"><b>{paySlipDetails.length != 0 ? (paySlipDetails.balancePay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</b></Typography>
                                        </Grid>

                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">EPF Contribution / EPF பங்களிப்பு</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.epfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>

                                        {/* Remaining */}
                                        <Grid item md={7} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">ETF Contribution / ETF பங்களிப்பு</Typography>
                                        </Grid>
                                        <Grid item md={1} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="left">:</Typography>
                                        </Grid>
                                        <Grid item md={2} xs={3}>
                                            <Typography variant='h5' style={{ marginLeft: "4rem" }} align="right">{paySlipDetails.length != 0 ? (paySlipDetails.etfContribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 0.00}</Typography>
                                        </Grid>
                                    </Grid>

                                    <div><br /><hr /></div>
                                    <div><hr /></div>

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
                                        {paySlipDetails.length != 0 ? (
                                            <CreatePDFSingle
                                                ref={componentRef}
                                                paySlipDetails={paySlipDetails}
                                                totalDeductions={totalDeductions}
                                                totalEarningEPF={totalEarningEPF}
                                                PI={PI}
                                                totalEarnings={totalEarnings}
                                                balancePay={balancePay}
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

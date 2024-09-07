import React, { useEffect } from 'react'
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
    Divider,

} from '@material-ui/core';
import CountUp from 'react-countup';
import { useAlert } from "react-alert";
import Paper from '@material-ui/core/Paper';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    startOfMonth,
    addMonths,
} from 'date-fns';


const useStyles = makeStyles((theme) => ({
    leftBalanceCard: {
        boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)',
        height: '30rem'
    },
    rightBalanceCard: {
        boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)',
    },
    cardContent: {
        padding: 0
    },
    tableContainer: {
        maxHeight: 160
    },
}));

export const LeftCardComponent = ({
    mandays,
    total,
    over,
    totalgross,
    balanceCarriedForward,
    deductionAmount,
    loanAmount,
    advance,
    paidAmount,
    otHours,
    balanceBroughtForward,
    totalEarning,
    date
}) => {
    const classes = useStyles();
    const castDate = new Date(date)
    let startDate = startOfMonth(addMonths(castDate, -1))
    const previousMonth = ("0" + (startDate.getMonth() + 1)).slice(-2) + " | " + startDate.toLocaleString('default', { month: 'long' });

    return (
        <Card className={classes.leftBalanceCard} >
            <CardContent className={classes.cardContent}>
                <Grid container spacing={3}>
                    <Grid item md={6} xs={12}>
                        <InputLabel style={{ paddingLeft: '0.5 rem', marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>{previousMonth}</InputLabel>
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={12} xs={12}>
                        <TableContainer component={Paper} className={classes.tableContainer}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow >
                                        <TableCell>
                                            MAN-DAYS
                                        </TableCell>
                                        <TableCell>
                                            Total (Kg)
                                        </TableCell>
                                        <TableCell>
                                            Over (Kg)
                                        </TableCell>
                                        <TableCell>
                                            OT (hours)
                                        </TableCell>
                                        <TableCell>
                                            TOTAL GROSS (Rs)
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow TableRow >
                                        <TableCell>
                                            {mandays}
                                        </TableCell>
                                        <TableCell>
                                            {total}
                                        </TableCell>
                                        <TableCell>
                                            {over}
                                        </TableCell>
                                        <TableCell>
                                            {otHours}
                                        </TableCell>
                                        <TableCell>
                                            <CountUp decimals={2} separator=',' end={totalgross} duration={1} />
                                        </TableCell>
                                        <TableCell>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
                <Grid container spacing={3} style={{ maxHeight: '20rem', overflowX: 'hidden' }}>
                    <Grid item md={12} xs={12}>
                        <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                                <Typography variant="h5" align='left' style={{ paddingLeft: "1rem" }}>Balance Carried Forward</Typography>
                            </Grid>
                            <Grid item md={3} xs={12}>
                                <Typography variant="h5" align='right'>
                                    <CountUp decimals={2} separator=',' end={balanceCarriedForward} duration={1} />
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                                <Typography variant="h5" align='left' style={{ paddingLeft: "1rem" }}>Total Earning</Typography>
                            </Grid>
                            <Grid item md={3} xs={12}>
                                <Typography variant="h5" align='right'>
                                    <CountUp decimals={2} separator=',' end={totalEarning} duration={1} />
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                                <Typography variant="h5" align='left' style={{ paddingLeft: "1rem" }}>Deduction Amount</Typography>
                            </Grid>
                            <Grid item md={3} xs={12}>
                                <Typography variant="h5" align='right'>
                                    <CountUp decimals={2} separator=',' end={deductionAmount} duration={1} />
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                                <Typography variant="h5" align='left' style={{ paddingLeft: "1rem" }}>Loan Amount</Typography>
                            </Grid>
                            <Grid item md={5} xs={12}>
                                <Typography variant="h5" align='right'>
                                    <CountUp decimals={2} separator=',' end={loanAmount} duration={1} />
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                                <Typography variant="h5" align='left' style={{ paddingLeft: "1rem" }}>Advance</Typography>
                            </Grid>
                            <Grid item md={5} xs={12}>
                                <Typography variant="h5" align='right'>
                                    <CountUp decimals={2} separator=',' end={advance} duration={1} />
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                                <Typography variant="h5" align='left' style={{ paddingLeft: "1rem" }}>Paid Amount</Typography>
                            </Grid>
                            <Grid item md={5} xs={12}>
                                <Typography variant="h5" align='right'>
                                    <CountUp decimals={2} separator=',' end={paidAmount} duration={1} />
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                                <Typography variant="h5" align='left' style={{ paddingLeft: "1rem" }}>Balance Brought Forward</Typography>
                            </Grid>
                            <Grid item md={5} xs={12}>
                                <Typography variant="h5" align='right'>
                                    <CountUp decimals={2} separator=',' end={balanceBroughtForward} duration={1} />
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card >
    )
}
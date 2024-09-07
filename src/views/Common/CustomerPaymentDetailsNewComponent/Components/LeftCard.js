import React from 'react'
import {
   
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
    
    InputLabel,
    Typography,
   

} from '@material-ui/core';
import CountUp from 'react-countup';

import Paper from '@material-ui/core/Paper';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

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
    cropDetails,
    customerBalancePaymentAmount,
    previouseAvailableBalance,
    isBalancePaymetDone,
    PreviousMonthBalanceBroughtForwardAmount,
    PreviousMonthBalanceCarriedForwardAmount,
    settingCollectionType,
    SettingsRate,
    SettingBalanceRate,
    settingGrossPay,
    previousMonthDeductionList
}) => {

    const classes = useStyles();
    let startDate = startOfMonth(addMonths(new Date(), -1))
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
                        {(cropDetails.length > 0) ?
                            <TableContainer component={Paper} className={classes.tableContainer}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow >
                                            <TableCell >
                                            </TableCell>
                                            <TableCell>
                                                Total Crop
                                            </TableCell>
                                            {
                                                isBalancePaymetDone === false ?
                                                    <TableCell>
                                                        Advance Rate
                                                    </TableCell> :
                                                    <TableCell>
                                                        Balance Rate
                                                    </TableCell>
                                            }
                                            <TableCell>
                                                Gross Pay(RS)
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cropDetails.map((data, index) => (
                                            <TableRow TableRow >
                                                <TableCell>
                                                    {settingCollectionType(data)}
                                                </TableCell>
                                                <TableCell>
                                                    {data.totalCrop.toFixed(2)}
                                                </TableCell>
                                                {
                                                    isBalancePaymetDone === false ?
                                                        <TableCell>
                                                            {SettingsRate(data, index)}
                                                        </TableCell> :
                                                        <TableCell>
                                                            {SettingBalanceRate(data, index)}
                                                        </TableCell>
                                                }
                                                <TableCell>
                                                    <Typography variant="h5" align='right'>
                                                        <CountUp decimals={2} separator=',' end={settingGrossPay(data)} duration={1} />
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            : null}
                    </Grid>
                </Grid>

                <Grid container spacing={3} style={{ maxHeight: '10rem', overflowX: 'hidden' }}>
                    <Grid item md={12} xs={12}>

                        <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                                <Typography variant="h5" align='left' style={{ paddingLeft: "1rem" }}>Balance Carried Forward</Typography>
                            </Grid>
                            <Grid item md={3} xs={12}>
                                <Typography variant="h5" align='right'>
                                    <CountUp decimals={2} separator=',' end={PreviousMonthBalanceCarriedForwardAmount == null ? 0 : PreviousMonthBalanceCarriedForwardAmount} duration={1} />
                                </Typography>
                            </Grid>
                        </Grid>


                        {
                            previousMonthDeductionList.map((data, index) => (
                                <>
                                    <Grid container spacing={3}>
                                        <Grid item md={6} xs={12}>
                                            <Typography variant="h5" align='left' style={{ paddingLeft: "1rem" }}>{data.transactionTypeName}</Typography>
                                        </Grid>
                                        {
                                            data.entryType === 2 ?
                                                <Grid item md={3} xs={12}>
                                                    <Typography variant="h5" align='right'>
                                                        <CountUp decimals={2} separator=',' end={data.totalAmount} duration={1} />
                                                    </Typography>
                                                </Grid> :
                                                <>
                                                    <Grid item md={3} xs={12} ></Grid>
                                                    <Grid item md={3} xs={12}>
                                                        <Typography variant="h5" align='right' style={{ paddingRight: "1rem" }}>
                                                            <CountUp decimals={2} separator=',' end={data.totalAmount} duration={1} />
                                                        </Typography>
                                                    </Grid>
                                                </>
                                        }
                                    </Grid>
                                </>
                            ))
                        }

                        <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                                <Typography variant="h5" align='left' style={{ paddingLeft: "1rem" }}>Balance Payment</Typography>
                            </Grid>
                            {isBalancePaymetDone ?
                                <Grid item md={2} xs={6}  >
                                    <p style={{ backgroundColor: '#81c784', borderRadius: '5px', color: 'white', textAlign: 'center', marginTop: '5px', marginBottom: '5px', width: '10', height: '2' }}>< CheckCircleIcon fontSize='small' /></p>
                                </Grid>
                                :
                                <Grid item md={2} xs={6}  >
                                </Grid>
                            }
                            <Grid item md={3} xs={12}>
                                {
                                    customerBalancePaymentAmount == -1 ?
                                        <Typography variant="h5" align='right'>NA</Typography>
                                        :
                                        <Typography variant="h5" align='right'>
                                            <CountUp decimals={2} separator=',' end={parseFloat(customerBalancePaymentAmount).toFixed(2)} duration={1} />
                                        </Typography>
                                }
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item md={9} xs={12}>
                                <Typography variant="h5" align='left' style={{ paddingLeft: "1rem" }}>Balance Brought Forward</Typography>
                            </Grid>
                            <Grid item md={3} xs={12}>
                                {
                                    PreviousMonthBalanceBroughtForwardAmount == -1 ?
                                        <Typography variant="h5" align='right'>NA</Typography>
                                        :
                                        <Typography variant="h5" align='right'>
                                            <CountUp decimals={2} separator=',' end={parseFloat(PreviousMonthBalanceBroughtForwardAmount).toFixed(2)} duration={1} />
                                        </Typography>
                                }
                            </Grid>
                        </Grid>



                    </Grid>
                </Grid>
                <Grid container spacing={3} >
                    <Grid item md={6} xs={12}>
                        <Typography variant="h5" align='left' style={{ marginTop: "1.5rem", paddingLeft: "1rem", marginBottom: '1rem' }}>Balance</Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Typography variant="h5" align='right' style={{ marginTop: "1.5rem" }}>
                            <CountUp decimals={2} separator=',' end={customerBalancePaymentAmount == -1 || customerBalancePaymentAmount == "NA" ? previouseAvailableBalance : 0} duration={1} />
                        </Typography>
                    </Grid>
                </Grid>

            </CardContent>
        </Card >

    )
}
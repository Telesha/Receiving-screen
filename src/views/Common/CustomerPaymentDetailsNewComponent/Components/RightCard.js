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

import {
    startOfMonth,
} from 'date-fns';

const useStyles = makeStyles((theme) => ({
    leftBalanceCard: {
        boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)',
    },
    rightBalanceCard: {
        boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)',
        height: '30rem'
    },
    cardContent: {
        padding: 0
    },
    tableContainer: {
        maxHeight: 160
    },
}));

export const RightCardComponent = ({
    currentCropDetails,
    currentAvailableBalance,
    BalanceCarriedForwardAmount,
    settingCollectionType,
    SettingsCurrentRate,
    settingCurrentGrossPay,
    currentMonthDeductionList
}) => {

    const classes = useStyles();
    let startDate = startOfMonth(new Date())
    const currentMonth = ("0" + (startDate.getMonth() + 1)).slice(-2) + " | " + startDate.toLocaleString('default', { month: 'long' });

    return (

        <Card className={classes.rightBalanceCard}>
            <CardContent className={classes.cardContent}>


                <Grid container spacing={3}>
                    <Grid item md={6} xs={12}>
                        <InputLabel style={{ marginLeft: '0.5 rem', marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>{currentMonth}</InputLabel>
                    </Grid>
                </Grid>


                <Grid container spacing={3}>
                    <Grid item md={12} xs={12}>
                        {(currentCropDetails.length > 0) ?
                            <TableContainer component={Paper} className={classes.tableContainer}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow >
                                            <TableCell>
                                            </TableCell>
                                            <TableCell>
                                                Total Crop
                                            </TableCell>
                                            <TableCell>
                                                Advance Rate
                                            </TableCell>
                                            <TableCell>
                                                Gross Pay(RS)
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentCropDetails.map((data) => (
                                            <TableRow>
                                                <TableCell>
                                                    {settingCollectionType(data)}
                                                </TableCell>
                                                <TableCell>
                                                    {data.totalCrop.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    {SettingsCurrentRate(data)}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="h5" align='right'>
                                                        <CountUp decimals={2} separator=',' end={settingCurrentGrossPay(data)} duration={1} />
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer> : null
                        }
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
                                    <CountUp decimals={2} separator=',' end={BalanceCarriedForwardAmount == null ? 0 : BalanceCarriedForwardAmount} duration={1} />
                                </Typography>
                            </Grid>
                        </Grid>


                        {
                            currentMonthDeductionList.map((data, index) => (
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
                                                    <Grid item md={3} xs={12} />
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
                    </Grid>
                </Grid>

                <Grid container spacing={3} >
                    <Grid item md={6} xs={12}>
                        <Typography variant="h5" align='left' style={{ marginTop: "1.5rem", paddingLeft: "1rem", marginBottom: '1rem' }}>Balance</Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Typography variant="h5" align='right' style={{ marginTop: "1.5rem" }}>
                            <CountUp decimals={2} separator=',' end={currentAvailableBalance} duration={1} />
                        </Typography>
                    </Grid>
                </Grid>


            </CardContent>
        </Card >
    )
}
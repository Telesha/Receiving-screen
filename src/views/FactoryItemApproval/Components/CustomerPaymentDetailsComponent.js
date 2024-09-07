import React, { useEffect } from 'react'
import {
    Box,
    Card,
    makeStyles,
    CardContent,
    Table,
    TableBody,
    TableContainer,
    TableCell,
    TableHead,
    TableRow,
    Grid,
    TextField,
    InputLabel,
    Typography
} from '@material-ui/core';
import CountUp from 'react-countup';
import { useAlert } from "react-alert";
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
    leftBalanceCard: {
        marginTop: '0.7rem',
        marginLeft: '0.7rem',
        marginRight: '0.5rem',
        marginBottom: '0.7rem',
        padding: '0',
        boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)',
        maxHeight: '30rem'
    },
    rightBalanceCard: {
        marginTop: '0.7rem',
        marginRight: '0.7rem',
        marginLeft: '0.5rem',
        marginBottom: '0.7rem',
        boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)',
        maxHeight: '30rem'
    },
    cardContent: {
        padding: 0
    },
    tableContainer: {
        maxHeight: 155
    },
    tableCell: {
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        opacity: 1
    },
    tableHeader: {
        zIndex: 1,
        position: 'relative'
    }
}));

export const CustomerPaymentDetailsComponent = ({
    cropDetails,
    advanceTotal,
    factoryItemTotal,
    loanTotal,
    transportTotal,
    customerBalancePaymentAmount,
    previouseAvailableBalance,
    currentCropDetails,
    currentAdvanceTotal,
    currentFactoryItemTotal,
    currentLoanTotal,
    currentTransportTotal,
    currentAvailableBalance,
    isBalancePaymetDone,
    setCropDetails,
    setCurrentCropDetails,
    permissionList,
    TotalBalance,
    RunningBalance
}) => {

    const classes = useStyles();
    const alert = useAlert();

    function settingCollectionType(data) {
        return data.collectionTypeName;
    }

    function changeReadOnly() {
        if (permissionList.isFactoryItemChangeEnabled || permissionList.isAdvanceRateChangeEnabled) {
            return false;
        }
        else if (!permissionList.isFactoryItemChangeEnabled && !permissionList.isAdvanceRateChangeEnabled) {
            return true;
        }
        else {
            return true;
        }
    }

    function amountChange() {
        if (permissionList.isMonthlyBalanceChangeEnabled || permissionList.isFactoryItemChangeEnabled) {
            return false;
        }
        else if (!permissionList.isMonthlyBalanceChangeEnabled && !permissionList.isFactoryItemChangeEnabled) {
            return true;
        }
        else {
            return true;
        }
    }

    function settingGrossPay(data) {
        if (isBalancePaymetDone) {
            return isNaN(parseFloat(data.totalCrop) * parseFloat(data.rate)) ? 0 : parseFloat(data.totalCrop) * parseFloat(data.rate);
        } else {
            return isNaN(parseFloat(data.totalCrop) * parseFloat(data.minRate)) ? 0 : parseFloat(data.totalCrop) * parseFloat(data.minRate);
        }
    }

    function settingCurrentGrossPay(data) {
        return isNaN(parseFloat(data.totalCrop) * parseFloat(data.minRate)) ? 0 : parseFloat(data.totalCrop) * parseFloat(data.minRate);
    }

    function handleChangeRates(collectionTypeID, rateType, e) {
        const target = e.target;
        const value = target.value
        const newArr = [...cropDetails];
        var idx = newArr.findIndex(x => x.collectionTypeID == parseInt(collectionTypeID));
        if (rateType === 'minRate') {
            if (newArr[idx].maxRate < value) {
                alert.error("Entered advance rate is greater than max rate");
            }
            else {
                newArr[idx] = { ...newArr[idx], minRate: value };
            }
        }
        else if (rateType === 'maxRate') {
            newArr[idx] = { ...newArr[idx], maxRate: value };
        }
        else if (rateType === 'rate') {
            newArr[idx] = { ...newArr[idx], rate: value };
        }
        setCropDetails(newArr);
    }

    function handleChangeRates1(collectionTypeID, rateType, e) {
        const target = e.target;
        const value = target.value
        const newArr = [...currentCropDetails];
        var idx = newArr.findIndex(x => x.collectionTypeID == parseInt(collectionTypeID));

        if (rateType === 'minRate') {
            if (newArr[idx].maxRate < value) {
                alert.error("Entered advance rate is greater than max rate");
            }
            else {
                newArr[idx] = { ...newArr[idx], minRate: value };
            }
        } else if (rateType === 'maxRate') {
            newArr[idx] = { ...newArr[idx], maxRate: value };
        }
        setCurrentCropDetails(newArr);
    }

    function SettingBalanceRate(data) {
        return (
            <TextField
                name="rate"
                onChange={(e) => handleChangeRates(data.collectionTypeID, "rate", e)}
                value={data.rate}
                variant="outlined"
                id="rate"
                size="small"
                style={{ width: 60, }}
                InputProps={{ readOnly: true }}
            >
            </TextField>);
    }
    function SettingsCurrentRate(data) {
        return (
            <TextField
                name="minRate"
                onChange={(e) => handleChangeRates1(data.collectionTypeID, "minRate", e)}
                value={data.minRate}
                variant="outlined"
                id="minRate"
                size="small"
                style={{ width: 60, }}
                InputProps={{ readOnly: changeReadOnly }}
            >
            </TextField>
        );
    }
    function SettingsRate(data) {
        return (
            <TextField
                name="minRate"
                onChange={(e) => handleChangeRates(data.collectionTypeID, "minRate", e)}
                value={data.minRate}
                variant="outlined"
                id="minRate"
                size="small"
                InputProps={{ readOnly: changeReadOnly }}
                style={{ width: 60, }}
            >
            </TextField>
        );
    }

    return (
        <>
            <Grid container spacing={3}>
                <Grid container>
                    <Grid item md={6} xs={12}>
                        <Card className={classes.leftBalanceCard}>
                            <CardContent className={classes.cardContent}>
                                <Box  >
                                    {(cropDetails.length > 0) ?
                                        <TableContainer component={Paper} className={classes.tableContainer}>
                                            <Table size="small">
                                                <TableHead className={classes.tableHeader}>
                                                    <TableRow>
                                                        <TableCell className={classes.tableCell}>
                                                        </TableCell>
                                                        <TableCell className={classes.tableCell}>
                                                            Total Crop
                                                        </TableCell>
                                                        {
                                                            isBalancePaymetDone === false ?
                                                                <TableCell className={classes.tableCell}>
                                                                    Advance Rate
                                                            </TableCell> :
                                                                <TableCell className={classes.tableCell}>
                                                                    Balance Rate
                                                            </TableCell>
                                                        }

                                                        <TableCell className={classes.tableCell}>
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
                                                                {data.totalCrop}
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
                                                                <CountUp decimals={2} separator=',' end={settingGrossPay(data)} duration={3} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        : null}

                                    <Grid container md={12} xs={12}>
                                        <Grid item md={5} xs={6} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                            <Typography variant="h5" >Advance</Typography>
                                        </Grid>
                                        <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <Typography variant="h5" >
                                                <CountUp decimals={2} separator=',' end={advanceTotal == null ? 0 : advanceTotal} duration={3} />
                                            </Typography>
                                        </Grid>

                                        <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                            <Typography variant="h5" >Factory Items</Typography>
                                        </Grid>
                                        <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <Typography variant="h5" >
                                                <CountUp decimals={2} separator=',' end={factoryItemTotal == null ? 0 : factoryItemTotal} duration={3} />
                                            </Typography>
                                        </Grid>

                                        <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                            <Typography variant="h5" >Loan</Typography>
                                        </Grid>
                                        <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <Typography variant="h5" >
                                                <CountUp decimals={2} separator=',' end={loanTotal == null ? 0 : loanTotal} duration={3} />
                                            </Typography>
                                        </Grid>

                                        <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                            <Typography variant="h5" >Transport</Typography>
                                        </Grid>
                                        <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <Typography variant="h5" >
                                                <CountUp decimals={2} separator=',' end={transportTotal == null ? 0 : transportTotal} duration={3} />
                                            </Typography>
                                        </Grid>

                                        <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                            <Typography variant="h5" >Balance Payment</Typography>
                                        </Grid>
                                        <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <Typography variant="h5" >{customerBalancePaymentAmount == -1 ? "NA" : customerBalancePaymentAmount}</Typography>
                                        </Grid>

                                        <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem', marginBottom: '1rem' }}>
                                            <Typography variant="h5" >Balance</Typography>
                                        </Grid>
                                        <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <Typography variant="h5" >
                                                <CountUp decimals={2} separator=',' end={customerBalancePaymentAmount == -1 ? previouseAvailableBalance : 0} duration={3} />
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <Card className={classes.rightBalanceCard}>
                            <CardContent className={classes.cardContent}>
                                <Box >
                                    {(cropDetails.length > 0) ?
                                        <TableContainer component={Paper} className={classes.tableContainer}>
                                            <Table size="small">
                                                <TableHead className={classes.tableHeader}>
                                                    <TableRow >
                                                        <TableCell className={classes.tableCell}>
                                                        </TableCell>
                                                        <TableCell className={classes.tableCell}>
                                                            Total Crop
                                                        </TableCell>
                                                        <TableCell className={classes.tableCell}>
                                                            Advance Rate
                                                        </TableCell>
                                                        <TableCell className={classes.tableCell}>
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
                                                                {data.totalCrop}
                                                            </TableCell>
                                                            <TableCell>
                                                                {SettingsCurrentRate(data)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <CountUp decimals={2} separator=',' end={settingCurrentGrossPay(data)} duration={3} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                        : null
                                    }
                                    <Grid container md={12} xs={12}>
                                        <Grid item md={5} xs={6} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                            <Typography variant="h5" >Advance</Typography>
                                        </Grid>
                                        <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <Typography variant="h5" >
                                                <CountUp decimals={2} separator=',' end={currentAdvanceTotal == null ? 0 : currentAdvanceTotal} duration={3} />
                                            </Typography>
                                        </Grid>

                                        <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                            <Typography variant="h5" >Factory Items</Typography>
                                        </Grid>
                                        <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <Typography variant="h5" >
                                                <CountUp decimals={2} separator=',' end={currentFactoryItemTotal == null ? 0 : currentFactoryItemTotal} duration={3} />
                                            </Typography>
                                        </Grid>

                                        <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                            <Typography variant="h5" >Loan</Typography>
                                        </Grid>
                                        <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <Typography variant="h5" >
                                                <CountUp decimals={2} separator=',' end={currentLoanTotal == null ? 0 : currentLoanTotal} duration={3} />
                                            </Typography>
                                        </Grid>
                                        <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                                            <Typography variant="h5" >Transport</Typography>
                                        </Grid>
                                        <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <Typography variant="h5" >
                                                <CountUp decimals={2} separator=',' end={currentTransportTotal == null ? 0 : currentTransportTotal} duration={3} />
                                            </Typography>
                                        </Grid>

                                        <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem', marginBottom: '1rem' }}>
                                            <Typography variant="h5" >Balance</Typography>
                                        </Grid>
                                        <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <Typography variant="h5" >
                                                <CountUp decimals={2} separator=',' end={currentAvailableBalance} duration={3} />
                                            </Typography>
                                        </Grid>
                                        <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem', marginBottom: '1rem' }}>
                                            <InputLabel shrink id="availableBalance"></InputLabel>
                                        </Grid>
                                        <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                                            <TextField
                                                fullWidth
                                                name="availableBalance"
                                                variant="standard"
                                                size="small"
                                                InputProps={{ disableUnderline: true }}
                                                style={{ marginBottom: '0.rem' }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid >
            <Grid container spacing={3}>
                <Grid item md={3} xs={12}>
                    <InputLabel style={{ marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}> Total Balance</InputLabel>
                </Grid>
                <Grid item md={3} xs={12}>
                    <InputLabel style={{ marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                        <CountUp decimals={2} separator=',' end={TotalBalance} duration={2} />
                    </InputLabel>
                </Grid>
                <Grid item md={3} xs={12}>
                    <InputLabel style={{ marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>Available Balance</InputLabel>
                </Grid>
                <Grid item md={3} xs={12}>
                    <InputLabel style={{ marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
                        <CountUp decimals={2} separator=',' end={RunningBalance} duration={2} />
                    </InputLabel>
                </Grid>
            </Grid></>
    );
}
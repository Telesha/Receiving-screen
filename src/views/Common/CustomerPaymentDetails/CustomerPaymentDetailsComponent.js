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

} from '@material-ui/core';
import CountUp from 'react-countup';
import { useAlert } from "react-alert";
import Paper from '@material-ui/core/Paper';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const useStyles = makeStyles((theme) => ({
  leftBalanceCard: {
    marginTop: '0.7rem',
    marginLeft: '0.7rem',
    marginRight: '0.5rem',
    marginBottom: '0.7rem',
    padding: '0',
    boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)',
    maxHeight: '35rem'
  },
  rightBalanceCard: {
    marginTop: '0.7rem',
    marginRight: '0.7rem',
    marginLeft: '0.5rem',
    marginBottom: '0.7rem',
    boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)',
    maxHeight: '32rem'
  },
  cardContent: {
    padding: 0
  },
  tableContainer: {
    maxHeight: 160
  },
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
  RunningBalance,
  previousMonthLoanInterestDebit,
  previousMonthLoanPrincipalDebit,
  monthLoanInterestDebit,
  monthLoanPrincipalDebit,
  monthLoanArrearsFine,
  monthLoanArrearsInterest,
  previouseMonthLoanArrearsFine,
  previouseMonthLoanArrearsInterest,
  PreviousMonthBalanceBroughtForwardAmount,
  PreviousMonthBalanceCarriedForwardAmount,
  BalanceCarriedForwardAmount,
  BalanceBroughtForwardAmount
}) => {

  const classes = useStyles();
  const alert = useAlert();
  const current = new Date();
  current.setMonth(current.getMonth());

  const previous = new Date();
  previous.setMonth(previous.getMonth() - 1);

  const previousMonth = ("0" + (previous.getMonth() + 1)).slice(-2) + " | " + previous.toLocaleString('default', { month: 'long' });
  const currentMonth = ("0" + (current.getMonth() + 1)).slice(-2) + " | " + current.toLocaleString('default', { month: 'long' });

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
            <Card className={classes.leftBalanceCard} >
              <CardContent className={classes.cardContent}>
                <Box  >
                  <InputLabel style={{ paddingLeft: '0.5 rem', marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>{previousMonth}</InputLabel>
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
                                <CountUp decimals={2} separator=',' end={settingGrossPay(data)} duration={1} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    : null}

                  <Grid container md={12} xs={12}>
                    <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                      <Typography variant="h5" >Balance Carried Forward</Typography>
                    </Grid>
                    <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                      <Typography variant="h5" >
                        <CountUp decimals={2} separator=',' end={PreviousMonthBalanceCarriedForwardAmount == null ? 0 : PreviousMonthBalanceCarriedForwardAmount} duration={1} />
                      </Typography>
                    </Grid>
                    <Grid item md={5} xs={6} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                      <Typography variant="h5" >Advance</Typography>
                    </Grid>
                    <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                      <Typography variant="h5" >
                        <CountUp decimals={2} separator=',' end={advanceTotal == null ? 0 : advanceTotal} duration={1} />
                      </Typography>
                    </Grid>

                    <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                      <Typography variant="h5" >Factory Items</Typography>
                    </Grid>
                    <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                      <Typography variant="h5" >
                        <CountUp decimals={2} separator=',' end={factoryItemTotal == null ? 0 : factoryItemTotal} duration={1} />
                      </Typography>
                    </Grid>
                    {previousMonthLoanInterestDebit != 0 ?
                      <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                        <Typography variant="h5" >Loan Interest Debit</Typography>
                      </Grid> : null}
                    {previousMonthLoanInterestDebit != 0 ?
                      <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                        <Typography variant="h5" >
                          <CountUp decimals={2} separator=',' end={previousMonthLoanInterestDebit == null ? 0 : previousMonthLoanInterestDebit} duration={1} />
                        </Typography>
                      </Grid> : null}
                    {previousMonthLoanPrincipalDebit != 0 ?
                      <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                        <Typography variant="h5" >Loan Principal Debit</Typography>
                      </Grid> : null}
                    {previousMonthLoanPrincipalDebit != 0 ?
                      <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                        <Typography variant="h5" >
                          <CountUp decimals={2} separator=',' end={previousMonthLoanPrincipalDebit == null ? 0 : previousMonthLoanPrincipalDebit} duration={1} />
                        </Typography>
                      </Grid> : null}
                    {previouseMonthLoanArrearsFine !== 0 ?
                      <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                        <Typography variant="h5" >Loan Arrears Fine</Typography>
                      </Grid> : null}
                    {previouseMonthLoanArrearsFine !== 0 ?
                      <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                        <Typography variant="h5" >
                          <CountUp decimals={2} separator=',' end={previouseMonthLoanArrearsFine == null ? 0 : previouseMonthLoanArrearsFine} duration={1} />
                        </Typography>
                      </Grid> : null}
                    {previouseMonthLoanArrearsInterest !== 0 ?
                      <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                        <Typography variant="h5" >Loan Arrears Interest</Typography>
                      </Grid> : null}
                    {previouseMonthLoanArrearsInterest !== 0 ?
                      <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                        <Typography variant="h5" >
                          <CountUp decimals={2} separator=',' end={previouseMonthLoanArrearsInterest == null ? 0 : previouseMonthLoanArrearsInterest} duration={1} />
                        </Typography>
                      </Grid> : null}

                    <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                      <Typography variant="h5" >Transport</Typography>
                    </Grid>
                    <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                      <Typography variant="h5" >
                        <CountUp decimals={2} separator=',' end={transportTotal == null ? 0 : transportTotal} duration={1} />
                      </Typography>
                    </Grid>

                    <Grid item md={3} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                      <Typography variant="h5" >Balance Payment</Typography>
                    </Grid>
                    {isBalancePaymetDone ?
                      <Grid item md={2} xs={6}  >

                        <p style={{ backgroundColor: '#81c784', borderRadius: '5px', color: 'white', textAlign: 'center', marginTop: '5px', marginBottom: '5px', width: '10' }}>< CheckCircleIcon /></p>
                      </Grid>
                      :
                      <Grid item md={2} xs={6}  >
                      </Grid>
                    }
                    <Grid item md={3} xs={6} style={{ marginTop: '0.5rem' }}>
                      <Typography variant="h5" >{customerBalancePaymentAmount == -1 ? "NA" : parseFloat(customerBalancePaymentAmount).toFixed(2)}</Typography>
                    </Grid>
                    {/* {isBalancePaymetDone ?
                      <Grid item md={2} xs={6}  >

                        <p style={{ backgroundColor: '#81c784', borderRadius: '5px', color: 'white', textAlign: 'center', marginTop: '5px', marginBottom: '5px', width: '10' }}>< CheckCircleIcon /></p>
                      </Grid>
                      : null} */}

                    <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                      <Typography variant="h5" >Balance Brought Forward</Typography>
                    </Grid>
                    <Grid item md={4} xs={6} style={{ marginTop: '0.5rem' }}>
                    </Grid>
                    <Grid item md={2} xs={6} style={{ marginTop: '0.5rem' }} >
                      <Typography variant="h5" >{PreviousMonthBalanceBroughtForwardAmount == -1 ? "NA" : parseFloat(PreviousMonthBalanceBroughtForwardAmount).toFixed(2)}</Typography>
                    </Grid>

                    <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem', marginBottom: '1rem' }}>
                      <Typography variant="h5" >Balance</Typography>
                    </Grid>
                    <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                      <Typography variant="h5" >
                        <CountUp decimals={2} separator=',' end={customerBalancePaymentAmount == -1 || customerBalancePaymentAmount == "NA" ? previouseAvailableBalance : 0} duration={1} />
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
                <InputLabel style={{ paddingLeft: '0.5 rem', marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>{currentMonth}</InputLabel>
                <Box >
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
                                <CountUp decimals={2} separator=',' end={settingCurrentGrossPay(data)} duration={1} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer> : null
                  }
                  <Grid container md={12} xs={12}>
                    <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                      <Typography variant="h5" >Balance Carried Forward</Typography>
                    </Grid>
                    <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                      <Typography variant="h5" >
                        <CountUp decimals={2} separator=',' end={BalanceCarriedForwardAmount == null ? 0 : BalanceCarriedForwardAmount} duration={1} />
                      </Typography>
                    </Grid>

                    <Grid item md={5} xs={6} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                      <Typography variant="h5" >Advance</Typography>
                    </Grid>
                    <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                      <Typography variant="h5" >
                        <CountUp decimals={2} separator=',' end={currentAdvanceTotal == null ? 0 : currentAdvanceTotal} duration={1} />
                      </Typography>
                    </Grid>

                    <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                      <Typography variant="h5" >Factory Items</Typography>
                    </Grid>
                    <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                      <Typography variant="h5" >
                        <CountUp decimals={2} separator=',' end={currentFactoryItemTotal == null ? 0 : currentFactoryItemTotal} duration={1} />
                      </Typography>
                    </Grid>
                    {monthLoanInterestDebit !== 0 ?
                      <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                        <Typography variant="h5" > Loan Interest Debit</Typography>
                      </Grid> : null}
                    {monthLoanInterestDebit !== 0 ?
                      <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                        <Typography variant="h5" >
                          <CountUp decimals={2} separator=',' end={monthLoanInterestDebit == null ? 0 : monthLoanInterestDebit} duration={1} />
                        </Typography>
                      </Grid> : null}
                    {monthLoanPrincipalDebit !== 0 ?
                      <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                        <Typography variant="h5" >Loan Principal Debit</Typography>
                      </Grid> : null}
                    {monthLoanPrincipalDebit !== 0 ?
                      <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                        <Typography variant="h5" >
                          <CountUp decimals={2} separator=',' end={monthLoanPrincipalDebit == null ? 0 : monthLoanPrincipalDebit} duration={1} />
                        </Typography>
                      </Grid> : null}
                    {monthLoanArrearsFine !== 0 ?
                      <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                        <Typography variant="h5" >Loan Arrears Fine</Typography>
                      </Grid> : null}
                    {monthLoanArrearsFine !== 0 ?
                      <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                        <Typography variant="h5" >
                          <CountUp decimals={2} separator=',' end={monthLoanArrearsFine == null ? 0 : monthLoanArrearsFine} duration={1} />
                        </Typography>
                      </Grid> : null}
                    {monthLoanArrearsInterest !== 0 ?
                      <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                        <Typography variant="h5" >Loan Arrears Interest</Typography>
                      </Grid> : null}
                    {monthLoanArrearsInterest !== 0 ?
                      <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                        <Typography variant="h5" >
                          <CountUp decimals={2} separator=',' end={monthLoanArrearsInterest == null ? 0 : monthLoanArrearsInterest} duration={1} />
                        </Typography>
                      </Grid> : null}
                    <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}>
                      <Typography variant="h5" >Transport</Typography>
                    </Grid>
                    <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                      <Typography variant="h5" >
                        <CountUp decimals={2} separator=',' end={currentTransportTotal == null ? 0 : currentTransportTotal} duration={1} />
                      </Typography>
                    </Grid>
                    <Grid item md={5} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem', marginBottom: '1rem' }}>
                      <Typography variant="h5" >Balance</Typography>
                    </Grid>
                    <Grid item md={6} xs={12} style={{ marginTop: '0.5rem' }}>
                      <Typography variant="h5" >
                        <CountUp decimals={2} separator=',' end={currentAvailableBalance} duration={1} />
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
            <CountUp decimals={2} separator=',' end={TotalBalance} duration={1} />
          </InputLabel>
        </Grid>
        <Grid item md={3} xs={12}>
          <InputLabel style={{ marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>Available Balance</InputLabel>
        </Grid>
        <Grid item md={3} xs={12}>
          <InputLabel style={{ marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
            <CountUp decimals={2} separator=',' end={RunningBalance} duration={1} />
          </InputLabel>
        </Grid>
      </Grid></>
  );
}

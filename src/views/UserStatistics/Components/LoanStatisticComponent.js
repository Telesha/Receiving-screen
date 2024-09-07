import React, { useState } from 'react'
import {
    Box,
    Card,
    makeStyles,
    CardContent,
    Grid
} from '@material-ui/core';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import { AdvancedTadkenComponent } from './AdvancedTadkenComponent';
import { UserDetailsComponent } from './UserDetailsComponent';
import { CustomerOverallViewComponent } from './CustomerOverallVIewComponent';
import { TotalLeafCountComponent } from './TotalLeafCountComponent';
import { LeafSupplyComponent } from './LeafSupplyComponent';
import { AverageMonthlyIncomeComponent } from './AverageMonthlyIncomeComponent';
import services from '../../Services'
import { trackPromise } from 'react-promise-tracker';
import {
    addDays,
    startOfWeek,
    endOfWeek,
    addWeeks,
    startOfMonth,
    endOfMonth,
    addMonths,
    addYearsDateRangePicker,
    startOfYear,
    endOfYear,
    addYears
} from 'date-fns';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
    grid_first_row: {
        maxHeight: '10rem'
    },
    grid_second_row: {
        maxHeight: '30rem'
    },
    grid_third_row: {
        maxHeight: '30rem'
    }
}));

export const LoanStatisticComponent = ({ UserDetails }) => {

    const classes = useStyles();
    const [AdvancedTakenData, setAdvancedTakenData] = useState();
    const [TotalLeafCountComponentData, setTotalLeafCountComponentData] = useState();
    const [AverageMonthlyIncomeComponetData, setAverageMonthlyIncomeComponetData] = useState();
    const [UserBiometricDetails, setUserBiometricDetails] = useState({
        customerBiometricData: 'ss',
        customerID: 12,
        firstName: 'Silva',
        lastName: 'De',
        nic: '874578845V',
        registrationNumber: '7548741',
        secondName: 'Priya',
    });
    const [CustomerOverAllViewComponentData, setCustomerOverAllViewComponentData] = useState();
    const [TotalLeaftChartComponentData, setTotalLeaftChartComponentData] = useState();

    async function LoadLoanStatistics(e, expanded) {
        if (expanded) {
            let userDetailsObject = {
                groupID: UserDetails.GroupID,
                factoryID: UserDetails.GroupID,
                customerNIC: null,
                customerRegistrationNumber: UserDetails.customerRegistrationNumber,
                startDate: startOfMonth(addMonths(new Date(), -6)).toISOString(),
                endDate: endOfMonth(addMonths(new Date(), -1)).toISOString(),
            };
            trackPromise(GetCustomerOverallDetailsByUser(userDetailsObject));
            trackPromise(GetUserGeneralDetails(userDetailsObject));
            trackPromise(GetAdvancedTakenDetailsByUser(userDetailsObject));
            trackPromise(GetCustomerMonthlyIncomeDetailsByUser(userDetailsObject));
            trackPromise(GetCustomerLeafCountDetailsByUser(userDetailsObject));
        }
    }

    async function GetUserGeneralDetails(customerDetails) {
        const result = await services.GetCustomerBiomatricDetails(customerDetails);
        setUserBiometricDetails(result);
    }

    async function GetAdvancedTakenDetailsByUser(customerDetails) {
        const response = await services.GetAdvancedTakenDetails(customerDetails);
        setAdvancedTakenData(response.totalAdvancedPaymentAmount);
    }

    async function GetCustomerOverallDetailsByUser(customerDetails) {
        const result = await services.GetCustomerOverallDetails(customerDetails)
        setCustomerOverAllViewComponentData(result);
    }

    async function GetCustomerLeafCountDetailsByUser(customerDetails) {
        const result = await services.GetCustomerLeafCountDetails(customerDetails)
        setTotalLeafCountComponentData(result.totalLeafCount);
        setTotalLeaftChartComponentData(result.leafData);
    }

    async function GetCustomerMonthlyIncomeDetailsByUser(customerDetails) {
        const result = await services.GetCustomerMonthlyIncomeDetails(customerDetails)
        setAverageMonthlyIncomeComponetData(result.totalIncome)
    }

    return (
        <Accordion onChange={(e, expanded) => {
            LoadLoanStatistics(e, expanded)
        }}>
            <AccordionSummary
                expandIcon={
                    <ArrowDropDownCircleIcon
                        color="primary"
                        fontSize="large"
                    />
                }
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography className={classes.heading}>View Loan Statistics </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <div style={{ width: '100%' }}>
                    <Grid container spacing={3} >
                        <Grid item md={12} xs={12}>
                            {
                                UserBiometricDetails.customerID > 0 ?
                                    <UserDetailsComponent
                                        CustomerDetails={UserBiometricDetails}
                                    /> : null
                            }

                        </Grid>
                    </Grid>
                    <br />
                    <Grid container spacing={3}>
                        <Grid item md={12} xs={12}>
                            <CustomerOverallViewComponent data={CustomerOverAllViewComponentData} />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3} className={classes.grid_second_row}>
                        <Grid item md={4} xs={12}>
                            {
                                TotalLeafCountComponentData > 0 ?
                                    <Card>
                                        <CardContent>
                                            <TotalLeafCountComponent data={TotalLeafCountComponentData} /><br />
                                            <LeafSupplyComponent data={TotalLeaftChartComponentData} />
                                        </CardContent>
                                    </Card> : null
                            }
                        </Grid>
                        <Grid item md={8} xs={12}>
                            <Grid container spacing={3} className={classes.grid_second_row}>
                                <Grid item md={6} xs={12}>
                                    {
                                        AverageMonthlyIncomeComponetData > 0 ?
                                            <Card >
                                                <CardContent>
                                                    <AverageMonthlyIncomeComponent data={AverageMonthlyIncomeComponetData} />
                                                </CardContent>
                                            </Card> :
                                            null
                                    }
                                </Grid>
                                <Grid item md={6} xs={12}>
                                    {
                                        AdvancedTakenData > 0 ?
                                            <Card>
                                                <CardContent>
                                                    <AdvancedTadkenComponent data={AdvancedTakenData} />
                                                </CardContent>
                                            </Card> :
                                            null
                                    }
                                </Grid>
                            </Grid>

                            <Grid container spacing={3} className={classes.grid_second_row}>
                                <Grid item md={12} xs={12}>
                                    {/* <RemainingLoanComponent /> */}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </div >
            </AccordionDetails>
        </Accordion>
    )
}
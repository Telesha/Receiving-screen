import React from 'react';
import {
    Box,
    Card,
    makeStyles,
    CardContent,
    Grid,
    Typography
} from '@material-ui/core';
import { UserDetailsComponent } from './../../Components/UserDetailsComponent';
import { AverageMonthlyIncomeComponent } from './../../Components/AverageMonthlyIncomeComponent';
import { LeafSupplyComponent } from './../../Components/LeafSupplyComponent';
import { TotalLeafCountComponent } from './../../Components/TotalLeafCountComponent';
import { CustomerOverallViewComponent } from './../../Components/CustomerOverallVIewComponent';
import { AdvancedTadkenComponent } from './../../Components/AdvancedTadkenComponent';
import StarsIcon from '@material-ui/icons/Stars';
import { CoveredAreaComponent } from './../../Components/CoveredAreaComponent';
import { LeafCollectedDaysNumber } from './../../Components/NumberOfLeafCollectedDaysComponent';
import { CustomerLeafBarChartComponent } from './../../Components/CustomerLeafBarChartComponent';
import PastCropDetailsComponent from '../../Components/PastCropDetailsComponent';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: 'white',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    grid_first_row: {
        maxHeight: '10rem'
    },
    grid_second_row: {
        maxHeight: '40rem'
    },
    grid_third_row: {
        maxHeight: '30rem'
    }
}));

export const Overview = ({
    AdvancedTakenComponentData,
    TotalLeafCountComponentData,
    AverageMonthlyIncomeComponetData,
    UserBiometricDetails,
    CustomerOverallViewComponentData,
    TotalLeafChartComponentData,
    IsDefaultAccount,
    CoveredArea,
    NumberOfLeafCollectedDays,
    TotalLeafBarChartComponentData,
    PastCropDetailsComponentData,
    SelectedMonth,
    setSelectedMonth
}) => {
    const classes = useStyles();
    return (
        <>
            <Box>
                <Grid container spacing={3} >
                    <Grid item md={11} xs={12}>
                        {
                            UserBiometricDetails.customerID > 0 ?
                                <UserDetailsComponent
                                    CustomerDetails={UserBiometricDetails}
                                /> : null
                        }

                    </Grid>
                    {
                        IsDefaultAccount === true ?
                            <Grid item md={1} xs={12}>
                                <Box display="flex" justifyContent="flex-end" p={2}>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="h6"
                                    >
                                        Default Account
                                    </Typography>
                                    <StarsIcon style={{ color: '#fff01f' }} fontSize="large" />
                                </Box>
                            </Grid> : null
                    }
                </Grid>
                <br />
                {/* past crop details in kg s table */}
                <Grid container spacing={3}>
                    <Grid item md={12} xs={12}>
                        <PastCropDetailsComponent 
                        data={PastCropDetailsComponentData}
                        SelectedMonth={SelectedMonth}
                        setSelectedMonth={setSelectedMonth}
                         />     
                    </Grid>
                </Grid>
                
                {
                    CustomerOverallViewComponentData !== null ?
                        <Grid container spacing={3}>
                            <Grid item md={12} xs={12}>
                                <CustomerOverallViewComponent data={CustomerOverallViewComponentData} />
                            </Grid>
                        </Grid> : null
                }

                <Grid container spacing={3} className={classes.grid_second_row}>
                    <Grid item md={8} xs={12}>
                        {
                            TotalLeafCountComponentData > 0 ?
                                <Card>
                                    <CardContent>
                                        <TotalLeafCountComponent data={TotalLeafCountComponentData} /><br />
                                        <LeafSupplyComponent data={TotalLeafChartComponentData} />
                                    </CardContent>
                                </Card> : null
                        }
                    </Grid>
                    <Grid item md={4} xs={12}>
                        <Grid container spacing={3} className={classes.grid_second_row}>
                            <Grid item md={12} xs={12}>
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
                            <Grid item md={12} xs={12}>
                                {
                                    AdvancedTakenComponentData > 0 ?
                                        <Card>
                                            <CardContent>
                                                <AdvancedTadkenComponent data={AdvancedTakenComponentData} />
                                            </CardContent>
                                        </Card> :
                                        null
                                }
                            </Grid>
                            <Grid item md={12} xs={12}>
                                {
                                    NumberOfLeafCollectedDays > 0 ?
                                        <Card>
                                            <CardContent>
                                                <LeafCollectedDaysNumber LeafCollectedDays={NumberOfLeafCollectedDays} />
                                            </CardContent>
                                        </Card> :
                                        null
                                }
                            </Grid>
                            <Grid item md={12} xs={12}>
                                {
                                    CoveredArea.area !== 0 && CoveredArea.areaType !== 0 ?
                                        <Card>
                                            <CardContent>
                                                <CoveredAreaComponent CoveredArea={CoveredArea} />
                                            </CardContent>
                                        </Card> :
                                        null
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {
                    TotalLeafBarChartComponentData !== null ?
                        <Grid container spacing={3}>
                            <Grid item md={12} xs={12}>
                                <CustomerLeafBarChartComponent data={TotalLeafBarChartComponentData} />
                            </Grid>
                        </Grid> : null
                }

            </Box >
        </>
    )
}
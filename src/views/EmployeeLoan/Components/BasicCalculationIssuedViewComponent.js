import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    Typography,
    Box
} from '@material-ui/core';
import CountUp from 'react-countup';
import WarningIcon from '@material-ui/icons/Warning';
export const BasicCalculationsIssuedView = ({ BaseCalculationsIssuedView, CurrentLoanArrearsAmount }) => {
    return (
        <Card>
            <CardHeader
                title={
                    <>
                        Basic Information
                        {
                            BaseCalculationsIssuedView.isNonPerforming === true ?
                                <Box display="flex" justifyContent="flex-end" p={0}>
                                    <WarningIcon style={{ color: 'red' }} fontSize="large" />
                                    <Typography
                                        color="error"
                                        gutterBottom
                                        variant="h4"
                                    >
                                        Non-performing
                                    </Typography>
                                </Box> : null
                        }
                    </>
                }
            />
            <CardContent>

                <Grid container spacing={2}>
                    <Grid item >
                        <Card>
                            <CardHeader
                                title={<Typography
                                    color="textSecondary"
                                    variant="h5"
                                    align='center'
                                >
                                    Number of Installments
                                </Typography>}
                            />
                            <CardContent>
                                <Typography
                                    color="textPrimary"
                                    variant="h3"
                                    align='center'
                                >
                                    <CountUp end={BaseCalculationsIssuedView.numberOfInstalments} duration={1} />
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item >
                        <Card>
                            <CardHeader
                                title={<Typography
                                    color="textSecondary"
                                    variant="h5"
                                    align='center'
                                >
                                    Completed Installments
                                </Typography>}
                            />
                            <CardContent>
                                <Typography
                                    color="textPrimary"
                                    variant="h3"
                                    align='center'
                                >
                                    <CountUp end={BaseCalculationsIssuedView.numberOfCompletedInstalments} duration={1} />
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item >
                        <Card>
                            <CardHeader
                                title={<Typography
                                    color="textSecondary"
                                    variant="h5"
                                    align='center'
                                >
                                    Original Loan Amount
                                </Typography>}
                            />
                            <CardContent>
                                <Typography
                                    color="textPrimary"
                                    variant="h3"
                                    align='center'
                                >
                                    {"Rs "}<CountUp separator=',' decimals={2} end={BaseCalculationsIssuedView.principalAmount} duration={1} />
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item >
                        <Card>
                            <CardHeader
                                title={<Typography
                                    color="textSecondary"
                                    variant="h5"
                                    align='center'
                                >
                                    Capital Outstanding
                                </Typography>}
                            />
                            <CardContent>
                                <Typography
                                    color="textPrimary"
                                    variant="h3"
                                    align='center'
                                >
                                    {"Rs "}<CountUp separator=',' decimals={2} end={BaseCalculationsIssuedView.capitalOutstanding} duration={1} />
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    {
                        CurrentLoanArrearsAmount > 0 ?

                            <Grid item >
                                <Card>
                                    <CardHeader
                                        title={<Typography
                                            color="textSecondary"
                                            variant="h5"
                                            align='center'
                                        >
                                            Current Arrears
                                        </Typography>}
                                    />
                                    <CardContent>
                                        <Typography
                                            color="textPrimary"
                                            variant="h3"
                                            align='center'
                                        >
                                            {"Rs "}<CountUp separator=',' decimals={2} end={CurrentLoanArrearsAmount} duration={1} />
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid> : null
                    }
                </Grid>
            </CardContent>
        </Card>

    )
}

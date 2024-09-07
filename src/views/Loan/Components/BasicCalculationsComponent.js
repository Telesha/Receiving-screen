import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography
} from '@material-ui/core';
import CountUp from 'react-countup';

export const BasicCalculations = ({ BaseCalculations }) => { 
  return (
    <Card>
      <CardHeader
        title={"Basic Information"}
      />
      <CardContent>
        <Grid container spacing={2}>
          {
            BaseCalculations.MonthlyPrincipalAndRate > 0 ?
              <Grid item md={3} xs={12}>
                <Card>
                  <CardHeader
                    title={<Typography
                      color="textSecondary"
                      variant="h5"
                      align='center'
                    >
                      Monthly Instalment
                    </Typography>}
                  />
                  <CardContent>
                    <Typography
                      color={BaseCalculations.NumberOfHoldMonths > 0 ? "textSecondary" : "textPrimary"}
                      variant="h3"
                      align='center'
                    >
                      {"Rs "}<CountUp separator=',' decimals={2} end={BaseCalculations.MonthlyPrincipalAndRate} duration={1} />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid> : null
          }
          <Grid item md={3} xs={12}>
            <Card>
              <CardHeader
                title={<Typography
                  color="textSecondary"
                  variant="h5"
                  align='center'
                >
                  Number of Instalments
                </Typography>}
              />
              <CardContent>
                <Typography
                  color={BaseCalculations.NumberOfHoldMonths > 0 ? "textSecondary" : "textPrimary"}
                  variant="h3"
                  align='center'
                >
                  <CountUp end={BaseCalculations.NumberOfInstalments} duration={1} />
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item md={3} xs={12}>
            <Card>
              <CardHeader
                title={<Typography
                  color="textSecondary"
                  variant="h5"
                  align='center'
                >
                  Total Payments
                </Typography>}
              />
              <CardContent>
                <Typography
                  color={BaseCalculations.NumberOfHoldMonths > 0 ? "textSecondary" : "textPrimary"}
                  variant="h3"
                  align='center'
                >
                  {"Rs "}<CountUp separator=',' decimals={2} end={BaseCalculations.TotalPayment} duration={1} />
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item md={3} xs={12}>
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
                  color={BaseCalculations.NumberOfHoldMonths > 0 ? "textSecondary" : "textPrimary"}
                  variant="h3"
                  align='center'
                >
                  {"Rs "}<CountUp separator=',' decimals={2} end={BaseCalculations.OriginalLoanAmount} duration={1} />
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        < Grid container spacing={2}>
          {BaseCalculations.NumberOfHoldMonths > 0 ?
            < Grid item md={3} xs={12}>
              <Card>
                <CardHeader
                  title={<Typography
                    color="textSecondary"
                    variant="h5"
                    align='center'
                  >
                    Number of Hold months
                  </Typography>}
                />
                <CardContent>
                  <Typography
                    color="textPrimary"
                    variant="h3"
                    align='center'
                  >
                    <CountUp end={BaseCalculations.NumberOfHoldMonths} duration={1} />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            : null}
        </Grid>
      </CardContent>
    </Card >

  )
}

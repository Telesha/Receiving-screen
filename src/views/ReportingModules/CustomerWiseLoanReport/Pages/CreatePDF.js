import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import {
  CardContent,
  Grid,
  Typography
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
  render() {

    const loanDataReportDetails = this.props.loanDataReportDetails;

    return (
      <div>
        <div>
          <CardContent>
            <Typography variant="h4" align="center">Customer Wise Loan Report</Typography>
            <div>&nbsp;</div>
            <Grid container spacing={3}>

              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Loan Number: </b> {loanDataReportDetails.loanNumber}
                </Typography>
              </Grid>

              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Start Date: </b> {loanDataReportDetails.startDate.split('T')[0]}
                </Typography>
              </Grid>

              <Grid item md={4} xs={9}>
                <Typography>
                  <b>End Date: </b> {loanDataReportDetails.endDate.split('T')[0]}
                </Typography>
              </Grid>
            </Grid>
            <br />

            <Grid container spacing={3}>
              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Loan Amount: </b> {loanDataReportDetails.loanAmount}
                </Typography>
              </Grid>

              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Remaining Balance: </b> {loanDataReportDetails.remainingBalance}
                </Typography>
              </Grid>
            </Grid>
            <br />

            <Grid container spacing={3}>
              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Installments: </b> {loanDataReportDetails.installments}
                </Typography>
              </Grid>

              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Remaining Installments: </b> {loanDataReportDetails.remainingInstallments}
                </Typography>
              </Grid>
            </Grid>
            <br />

            <Grid container spacing={3}>
              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Interest Rate: </b> {loanDataReportDetails.interestRate}
                </Typography>
              </Grid>

              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Interest Amount: </b> {loanDataReportDetails.interestAmount}
                </Typography>
              </Grid>

              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Remaining Interest: </b>
                </Typography>
              </Grid>
            </Grid>
            <br />

            <Grid container spacing={3}>
              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Np: </b> {loanDataReportDetails.np}
                </Typography>
              </Grid>

              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Arrears: </b> {loanDataReportDetails.arrears}
                </Typography>
              </Grid>

              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Arrears Amount: </b> {loanDataReportDetails.arrearsAmount}
                </Typography>
              </Grid>
            </Grid>
            <br />

            <Grid container spacing={3}>
              <Grid item md={4} xs={9}>
                <Typography>
                  <b>Status: </b> {loanDataReportDetails.status}
                </Typography>
              </Grid>
            </Grid>
          </CardContent> 

        </div>
        <div>&nbsp;</div>
        <h3><center>***** End of List *****</center></h3>
      </div>
    );

  }

}
import React from "react";
import {
  Box, Card, Grid, TextField, Container, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

export default class ComponentToPrint extends React.Component {


  render() {

    const BalanceSheetReportDetails = this.props.BalanceSheetReportDetails;
    const TotalCurrentAssestsAmount = this.props.TotalCurrentAssestsAmount;
    const TotalLongTermAssetsAmount = this.props.TotalLongTermAssetsAmount;
    const TotalAssetsAmount = this.props.TotalAssetsAmount;
    const TotalCurrentLiabilities = this.props.TotalCurrentLiabilities;
    const TotalLongTermLiabilities = this.props.TotalLongTermLiabilities;
    const TotalLiabilityAmount = this.props.TotalLiabilityAmount;
    const TotalOwnersEquity = this.props.TotalOwnersEquity;
    const TotalLiabilitiesAndOwnersQuity = this.props.TotalLiabilitiesAndOwnersQuity;


    function TotalSectionAmountCounter(assetsDetailsList, sectionCode) {
      const result = assetsDetailsList.reduce((totalAmount, item) => totalAmount + item.actualAmount, 0);

      return result;

    }

    return (
      <>
      <div>
                            <Grid Grid container spacing={1}>
                              <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
                              <Grid Grid container spacing={1}>
                                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left"></Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography align="right">12/02/2021</Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography align="right">12/02/2022</Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography align="right">(+ / -)</Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography align="right">(+ / -)</Typography></Grid>
                              </Grid>
                              <Grid Grid container spacing={1}>
                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left"></Typography></Grid>
                                <Grid item md={3} xs={12} ><Typography align="right"></Typography></Grid>
                              </Grid>
                            </Grid>

                            <Grid container spacing={1}>
                              <Grid item md={12} xs={12}>
                                <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Assests</Typography>
                                <Grid Grid container spacing={1}>
                                  <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
                                  <Grid Grid container spacing={1}>
                                    <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Total Current Assests</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  </Grid>
                                  <Grid Grid container spacing={1}>
                                <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">long Term Assests</Typography>

                                <Grid Grid container spacing={1}>
                                  <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Ledger</Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400</Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                </Grid>
                                <Grid Grid container spacing={1}>
                                  <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Assests Ledger1</Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400</Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                </Grid>
                              </Grid>
                              <Grid Grid container spacing={1}>
                              <Grid item md={6} xs={5} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Total Long Term Assests </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  </Grid>
                                  <Grid Grid container spacing={1}>
                              <Grid item md={6} xs={5} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Total Assests </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                            <br />

                            <Grid item md={12} xs={12}>
                              <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Liabilities</Typography>
                              <br />
                              <Grid Grid container spacing={1}>
                                <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">Current Liabilities</Typography>

                                <Grid Grid container spacing={1}>
                                  <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger income2</Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400</Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                </Grid>
                                <Grid Grid container spacing={1}>
                              <Grid item md={6} xs={5} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Total Current Liabilities</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  </Grid>
                              </Grid>
                              <Grid Grid container spacing={1}>
                                <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">Long-Term Liabilities</Typography>
                                <Grid Grid container spacing={1}>
                                  <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Finance Ledger</Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400</Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                            <br />

                            <Grid item md={12} xs={12}>
                              <Grid Grid container spacing={1}>
                                <Grid item md={6} xs={1} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Total Long-Term Liabilities</Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400</Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400 </Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400 </Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400 </Typography></Grid>
                              </Grid>
                            </Grid>
                            <Grid item md={12} xs={12}>
                              <Grid Grid container spacing={1}>
                                <Grid item md={6} xs={1} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Total Liabilities</Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400</Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400 </Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400 </Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400 </Typography></Grid>
                              </Grid>
                            </Grid>

                            <Grid container spacing={1}>
                              <Grid item md={12} xs={12}>
                                <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Owner's Equity</Typography>
                                <Grid Grid container spacing={1}>
                                  
                                  <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">Owner's Equity</Typography>
                                  <Grid Grid container spacing={1}>
                                    <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Owners Equity</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400</Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                    <Grid item md={1} xs={1} ><Typography align="right">400 </Typography></Grid>
                                  </Grid>
                                  <Grid Grid container spacing={1}>
                                <Grid item md={6} xs={1} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Total Owner's Equity</Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400</Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400 </Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400 </Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400 </Typography></Grid>
                              </Grid>
                              <Grid Grid container spacing={1}>
                                <Grid item md={6} xs={1} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Total Liabilities and Owner's Equity</Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400</Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400 </Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400 </Typography></Grid>
                                <Grid item md={1} xs={1} ><Typography  align="right">400 </Typography></Grid>
                              </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </div>
        {/* <div>

          <Grid container spacing={3}>
            <Grid item xs={12} ><Typography variant='h4' align="center">Assets</Typography></Grid>


            <Grid container spacing={1}><Grid item xs={7} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Current Assets</Typography></Grid></Grid>
            {
              BalanceSheetReportDetails.currentAssetsList.map((obj) => {
                return (
                  <Grid container spacing={1}>
                    <Grid item xs={7}  ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                    <Grid item xs={5}  ><Typography style={{ marginRight: "20rem" }} align="right">{obj.actualAmount.toFixed(2)}</Typography></Grid>
                  </Grid>
                )
              })
            }

            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Current Assests</Typography></Grid>
              <Grid item xs={5}  ><Typography variant='h5' style={{ marginRight: "20rem" }} align="right">{TotalSectionAmountCounter(BalanceSheetReportDetails.currentAssetsList, "CURRETASSETS").toFixed(2)}</Typography></Grid>
            </Grid>




            <Grid container spacing={1} style={{ marginTop: "1rem" }}><Grid item xs={7} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Long-term Assets</Typography></Grid></Grid>
            {
              BalanceSheetReportDetails.longTermAssetsList.map((obj) => {
                return (
                  <Grid container spacing={1}>
                    <Grid item xs={7}  ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                    <Grid item xs={5}  ><Typography style={{ marginRight: "20rem" }} align="right">{obj.actualAmount.toFixed(2)}</Typography></Grid>
                  </Grid>
                )
              })
            }
            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Long-term Assests</Typography></Grid>
              <Grid item xs={5}  ><Typography variant='h5' style={{ marginRight: "20rem" }} align="right">{TotalSectionAmountCounter(BalanceSheetReportDetails.longTermAssetsList, "LONGTERMASSETS").toFixed(2)}</Typography></Grid>
            </Grid>

            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Assests</Typography></Grid>
              <Grid item xs={5}  ><Typography variant='h5' style={{ marginRight: "20rem", borderTop: "3px black solid", borderBottom: "5px black double" }} align="right">{TotalAssetsAmount.toFixed(2)}</Typography></Grid>
            </Grid>

          </Grid>



          <Grid container spacing={3} style={{ marginTop: "1.5rem" }}>
            <Grid item xs={12} ><Typography variant='h4' align="center">Liabilities</Typography></Grid>


            <Grid container spacing={1}><Grid item xs={7} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Current Liabilities</Typography></Grid></Grid>
            {
              BalanceSheetReportDetails.currentLiabilitiesList.map((obj) => {
                return (
                  <Grid container spacing={1}>
                    <Grid item xs={7}  ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                    <Grid item xs={5}  ><Typography style={{ marginRight: "20rem" }} align="right">{obj.actualAmount.toFixed(2)}</Typography></Grid>
                  </Grid>
                )
              })
            }
            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Current Liabilities</Typography></Grid>
              <Grid item xs={5}  ><Typography variant='h5' style={{ marginRight: "20rem" }} align="right">{TotalSectionAmountCounter(BalanceSheetReportDetails.currentLiabilitiesList, "CURRETLIABILITIES").toFixed(2)}</Typography></Grid>
            </Grid>


            <Grid container spacing={1} style={{ marginTop: "1rem" }}><Grid item xs={7} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Long-term Liabilities</Typography></Grid></Grid>
            {
              BalanceSheetReportDetails.longTermLiabilityList.map((obj) => {
                return (
                  <Grid container spacing={1}>
                    <Grid item xs={7}  ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                    <Grid item xs={5}  ><Typography style={{ marginRight: "20rem" }} align="right">{obj.actualAmount.toFixed(2)}</Typography></Grid>
                  </Grid>
                )
              })
            }
            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Long-term Liabilities</Typography></Grid>
              <Grid item xs={5}  ><Typography variant='h5' style={{ marginRight: "20rem" }} align="right">{TotalSectionAmountCounter(BalanceSheetReportDetails.longTermLiabilityList, "LONGTERMLIABILITIES").toFixed(2)}</Typography></Grid>


            </Grid>
            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Liabilities</Typography></Grid>
              <Grid item xs={5}  ><Typography variant='h5' style={{ marginRight: "20rem", borderTop: "3px black solid" }} align="right">{TotalLiabilityAmount.toFixed(2)}</Typography></Grid>
            </Grid>
          </Grid>


          <Grid container spacing={3} style={{ marginTop: "1.5rem" }}>
            <Grid item xs={12} ><Typography variant='h4' align="center">Owner's Equity</Typography></Grid>

            <Grid container spacing={1}><Grid item xs={7} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Owner's Equity</Typography></Grid></Grid>
            {
              BalanceSheetReportDetails.ownersEquityList.map((obj) => {
                return (
                  <Grid container spacing={1}>
                    <Grid item xs={7}  ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                    <Grid item xs={5}  ><Typography style={{ marginRight: "20rem" }} align="right">{obj.actualAmount.toFixed(2)}</Typography></Grid>
                  </Grid>
                )
              })
            }
            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Owner's Equity</Typography></Grid>
              <Grid item xs={5}  ><Typography variant='h5' style={{ marginRight: "20rem" }} align="right">{TotalSectionAmountCounter(BalanceSheetReportDetails.ownersEquityList, "OWNERSEQUITY").toFixed(2)}</Typography></Grid>
            </Grid>
            <Grid container spacing={1} style={{ marginTop: "1.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Liabilities and Owner's Equity</Typography></Grid>
              <Grid item xs={5}  ><Typography variant='h5' style={{ marginRight: "20rem", borderTop: "3px solid black", borderBottom: "5px black double" }} align="right">{TotalLiabilitiesAndOwnersQuity.toFixed(2)}</Typography></Grid>
            </Grid>
          </Grid>
        </div> */}
      </>
    )
  }

}

import React from "react";
import {
  Grid
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import CountUp from 'react-countup';
export default class ComponentToPrint extends React.Component {

  render() {

    const BalanceSheetReportDetails = this.props.BalanceSheetReportDetails;
    const TotalAssetsAmount = this.props.TotalAssetsAmount;
    const TotalLiabilityAmount = this.props.TotalLiabilityAmount;
    const TotalLiabilitiesAndOwnersQuity = this.props.TotalLiabilitiesAndOwnersQuity;
    const BalanceSheetSearched = this.props.BalanceSheetSearched;
    const ProfitOrLoss = this.props.ProfitOrLoss;


    function TotalSectionAmountCounter(assetsDetailsList, sectionCode) {
      const result = assetsDetailsList.reduce((totalAmount, item) => totalAmount + item.actualAmount, 0);

      return result;

    }

    return (
      <>
        <div>
          <br/>
          <br/>
          <Grid>

            <h3 style={{ textAlign: 'center' }}>
              <span> {'Balance Sheet of ' + BalanceSheetSearched.factoryName} </span>
            </h3>
            <h5 style={{ textAlign: 'center' }}>
              <span> {' To ' + BalanceSheetSearched.selectedDate.toISOString().split('T')[0]}  </span>
            </h5>
            <br />
            <br />
          </Grid>


          <Grid container spacing={3}>
            <Grid item xs={12} ><Typography variant='h4' align="center">Assets</Typography></Grid>


            <Grid container spacing={1}><Grid item xs={7} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Current Assets</Typography></Grid></Grid>
            {
              BalanceSheetReportDetails.currentAssetsList.map((obj) => {
                return (
                  <Grid container spacing={1}>
                    <Grid item xs={7}  ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                    <Grid item xs={5}  >
                      <Typography style={{ marginRight: "15rem" ,textAlign:"right" }}>
                        <CountUp
                          end={obj.actualAmount}
                          decimals={2}
                          separator=','
                          decimal="."
                          duration={0.1}
                        />  
                      </Typography></Grid>
                  </Grid>
                )
              })
            }

            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Current Assests</Typography></Grid>
              <Grid item xs={5} >
                <Typography variant='h5' style={{ marginRight: "15rem" ,textAlign:"right" }}>
                  <CountUp 
                    end={TotalSectionAmountCounter(BalanceSheetReportDetails.currentAssetsList, "CURRETASSETS")}
                    decimals={2}
                    separator=','
                    duration={0.1}
                    decimal="."
                  />
                </Typography></Grid>
            </Grid>




            <Grid container spacing={1} style={{ marginTop: "1rem" }}><Grid item xs={7} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Long-term Assets</Typography></Grid></Grid>
            {
              BalanceSheetReportDetails.longTermAssetsList.map((obj) => {
                return (
                  <Grid container spacing={1}>
                    <Grid item xs={7}  ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                    <Grid item xs={5}  >
                      <Typography style={{ marginRight: "15rem" ,textAlign:"right" }}>      
                        <CountUp 
                          end={obj.actualAmount}
                          decimals={2}
                          separator=','
                          duration={0.1}
                          decimal="."
                        />
                      </Typography></Grid>
                  </Grid>
                )
              })
            }
            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Long-term Assests</Typography></Grid>
              <Grid item xs={5}  >
                <Typography variant='h5' style={{ marginRight: "15rem" ,textAlign:"right" }}>    
                  <CountUp 
                    end={TotalSectionAmountCounter(BalanceSheetReportDetails.longTermAssetsList, "LONGTERMASSETS")}
                    decimals={2}
                    separator=','
                    duration={0.1}
                    decimal="."
                  />
                </Typography></Grid>
              </Grid>

            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Assests</Typography></Grid>
              <Grid item xs={5}  >
                <Typography variant='h5' style={{ marginRight: "15rem", borderTop: "3px black solid", borderBottom: "5px black double" ,textAlign:"right"}} >     
                  <CountUp 
                    end={TotalAssetsAmount}
                    decimals={2}
                    separator=','
                    duration={0.1}
                    decimal="."
                  />
                </Typography></Grid>
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
                    <Grid item xs={5}  >
                      <Typography style={{ marginRight: "15rem" ,textAlign:"right" }}>   
                        <CountUp 
                          end={obj.actualAmount}
                          decimals={2}
                          separator=','
                          duration={0.1}
                          decimal="."
                        />
                      </Typography></Grid>
                  </Grid>
                )
              })
            }
            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Current Liabilities</Typography></Grid>
              <Grid item xs={5}  >
                <Typography variant='h5' style={{ marginRight: "15rem" ,textAlign:"right" }}>
                  <CountUp 
                    end={TotalSectionAmountCounter(BalanceSheetReportDetails.currentLiabilitiesList, "CURRETLIABILITIES")}
                    decimals={2}
                    separator=','
                    duration={0.1}
                    decimal="."
                  />         
                </Typography></Grid>
            </Grid>


            <Grid container spacing={1} style={{ marginTop: "1rem" }}><Grid item xs={7} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Long-term Liabilities</Typography></Grid></Grid>
            {
              BalanceSheetReportDetails.longTermLiabilityList.map((obj) => {
                return (
                  <Grid container spacing={1}>
                    <Grid item xs={7}  ><Typography style={{ marginLeft: "20rem" }} align="left">{obj.ledgerAccountName}</Typography></Grid>
                    <Grid item xs={5}  >
                      <Typography style={{ marginRight: "15rem" ,textAlign:"right" }}>    
                        <CountUp 
                          end={obj.actualAmount}
                          decimals={2}
                          separator=','
                          duration={0.1}
                          decimal="."
                        />   
                      </Typography></Grid>
                  </Grid>
                )
              })
            }
            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Long-term Liabilities</Typography></Grid>
              <Grid item xs={5}  >
                <Typography variant='h5' style={{ marginRight: "15rem" ,textAlign:"right" }}>
                  <CountUp 
                    end={TotalSectionAmountCounter(BalanceSheetReportDetails.longTermLiabilityList, "LONGTERMLIABILITIES")}
                    separator=','
                    duration={0.1}
                    decimal="."
                    decimals={2}
                  />   
                </Typography></Grid>
            </Grid>
            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Liabilities</Typography></Grid>
              <Grid item xs={5}  >
                <Typography variant='h5' style={{ marginRight: "15rem", borderTop: "3px black solid" ,textAlign:"right"}} >
                  <CountUp 
                    end={TotalLiabilityAmount}
                    separator=','
                    duration={0.1}
                    decimal="."
                    decimals={2}
                  />  
                </Typography></Grid>
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
                    <Grid item xs={5}  >
                      <Typography style={{ marginRight: "15rem" ,textAlign:"right" }} >            
                        <CountUp 
                          end={obj.actualAmount}
                          separator=','
                          duration={0.1}
                          decimal="."
                          decimals={2}
                        />  
                      </Typography></Grid>
                  </Grid>
                )
              })
            }
            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item md={7} xs={12} ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Accumulated Profit/Loss</Typography></Grid>
                <Grid item md={5} xs={12} ><Typography style={{ marginRight: "15rem" ,textAlign:"right" }}>
                  <CountUp
                    end={ProfitOrLoss}
                    decimals ={2}
                    decimal = '.'
                    separator=','
                    duration={0.1}    
                  />
                                    
                  </Typography></Grid>
            </Grid>
            <Grid container spacing={1} style={{ marginTop: "0.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Owner's Equity</Typography></Grid>
              <Grid item xs={5}  >
                <Typography variant='h5' style={{ marginRight: "15rem" ,textAlign:"right" }}>      
                  <CountUp 
                    end={TotalSectionAmountCounter(BalanceSheetReportDetails.ownersEquityList, "OWNERSEQUITY") + ProfitOrLoss}
                    separator=','
                    duration={0.1}
                    decimal="."
                    decimals={2}
                  />   
                </Typography></Grid>
            </Grid>
            <Grid container spacing={1} style={{ marginTop: "1.5rem" }}>
              <Grid item xs={7}  ><Typography variant='h5' style={{ marginLeft: "15rem" }} align="left">Total Liabilities and Owner's Equity</Typography></Grid>
              <Grid item xs={5}  >
                <Typography variant='h5' style={{ marginRight: "15rem", borderTop: "3px solid black", borderBottom: "5px black double" ,textAlign:"right" }} >
                  <CountUp 
                    end={TotalLiabilitiesAndOwnersQuity + ProfitOrLoss}
                    separator=','
                    duration={0.1}
                    decimal="."
                    decimals={2}
                  />  
                </Typography></Grid>
            </Grid>
          </Grid>
        </div>
      </>
    )
  }

}

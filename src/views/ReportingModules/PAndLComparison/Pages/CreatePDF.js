import React from "react";
import {
  Box, Card, Grid, TextField, Container, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

export default class ComponentToPrint extends React.Component {
  render() {
    return (
      <div>
        <Grid Grid container spacing={1}>
          <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
          <Grid Grid container spacing={1}>
            <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left"></Typography></Grid>
            <Grid item md={1} xs={1} ><Typography align="right">08/02/2021</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography align="right">08/02/2022</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography align="right">(+ / -)</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography align="right">%(+ / -)</Typography></Grid>
          </Grid>
          <Grid Grid container spacing={1}>
            <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left"></Typography></Grid>
            <Grid item md={3} xs={12} ><Typography align="right"></Typography></Grid>
          </Grid>
        </Grid>

        <Grid container spacing={1}>
          <Grid item md={12} xs={12}>
            <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Revenue</Typography>
            <Grid Grid container spacing={1}>
              <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">20,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">32,000 </Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 12,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 23.09</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">31,500</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">75,987 </Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 44,487</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 25.65</Typography></Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <br />

        <Grid item md={12} xs={12}>
          <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Cost of Revenue</Typography>
          <br />
          <Grid Grid container spacing={1}>
            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">Direct salary cost of software developers</Typography>

            <Grid Grid container spacing={1}>
              <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">15,987</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">54,900</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">(+) 38,913</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">(+) 32.54</Typography></Grid>
            </Grid>
            <Grid Grid container spacing={1}>
              <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">12,852</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">44,860</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">(+) 32,010</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">(+) 58.25</Typography></Grid>
            </Grid>
          </Grid>
          <Grid Grid container spacing={1}>
            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">Direct Other cost</Typography>

            <Grid Grid container spacing={1}>
              <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">13,400</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">15,500</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">(+) 1,900</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">(+) 23.65</Typography></Grid>
            </Grid>
            <Grid Grid container spacing={1}>
              <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">15,800</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">32,250</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">(+) 16,750</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">(+) 58.32</Typography></Grid>
            </Grid>
            <Grid Grid container spacing={1}>
              <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">56,000</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">85,100</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">(+) 29,100</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">(+) 29.12</Typography></Grid>
            </Grid>
            <Grid Grid container spacing={1}>
              <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income2</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">45,000</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">75,000</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">(+) 30,000</Typography></Grid>
              <Grid item md={1} xs={1} ><Typography align="right">(+) 30.00</Typography></Grid>
            </Grid>
          </Grid>
        </Grid>
        <br />

        <Grid item md={12} xs={12}>
          <Grid Grid container spacing={1}>
            <Grid item md={6} xs={1} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Gross Profit</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">210,539</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">415,507 </Typography></Grid>
            <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">186,256</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right"></Typography></Grid>
          </Grid>
        </Grid>

        <Grid container spacing={1}>
          <Grid item md={12} xs={12}>
            <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Other Income</Typography>
            <Grid Grid container spacing={1}>
              <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">17,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">58,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 41,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 52.00</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">34,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">45,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 11,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 12.32</Typography></Grid>
              </Grid>

              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger3</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">52,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">35,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 17,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 19.00</Typography></Grid>
              </Grid>

              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Ledger</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">95,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">58,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 37,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 54.00</Typography></Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <br />

        <Grid container spacing={1}>
          <Grid item md={12} xs={12}>
            <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Selling and Marketing Expenses</Typography>
            <br />
            <Grid Grid container spacing={1}>
              <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">76,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">87,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 11,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 12.00</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">98,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">76,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 22,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 22.00</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">79,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">87,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 8,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 8.00</Typography></Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <br />

        <Grid container spacing={1}>
          <Grid item md={12} xs={12}>
            <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Administration Expenses</Typography>
            <br />
            <Grid Grid container spacing={1}>
              <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">58,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">87,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 29,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 29.00</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">98,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">84,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 14,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 14.00</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">87,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">89,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">31,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 31.10</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Ledger</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">76,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">54,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 2000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 20.00</Typography></Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <br />

        <Grid container spacing={1}>
          <Grid item md={12} xs={12}>
            <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Other Expenses</Typography>
            <Grid Grid container spacing={1}>
              <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">87,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">54,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 32,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 32.00</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">83,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">32,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 51,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 51.00</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">25,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">57,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 32,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 32.25</Typography></Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <br />

        <Grid item md={12} xs={12}>
          <Grid Grid container spacing={1}>
            <Grid item md={6} xs={1} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Loss from operating activities (E B T I)</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">1,103,000</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">970,100 </Typography></Grid>
            <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">109, 000</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right"></Typography></Grid>
          </Grid>
        </Grid>
        <br />

        <Grid container spacing={1}>
          <Grid item md={12} xs={12}>
            <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Finance Expenses</Typography>
            <Grid Grid container spacing={1}>
              <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">58,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">89,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 31,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 32.00</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">32,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">13,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 19,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 20.00</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Income Ledger 1</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">23,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">13,450</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 9650</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 9.65</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Ledger</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">54,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">15,500</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 38,600</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 38.60</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Assets Ledger 1</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">12,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">45,780 </Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 33,680</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 33.68</Typography></Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <br />

        <Grid container spacing={1}>
          <Grid item md={12} xs={12}>
            <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Income Tax Expenses</Typography>
            <Grid Grid container spacing={1}>
              <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left"></Typography>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">58,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">95,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 37,100</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(+) 38.00</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">Ledger Income</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">98,000</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">32,540</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 65,550</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 66.00</Typography></Grid>
              </Grid>
              <Grid Grid container spacing={1}>
                <Grid item md={6} xs={5} ><Typography style={{ marginLeft: "15rem" }} align="left">BOC Fixed Asset Ledger2</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">85,700</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">65,890</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 19,810</Typography></Grid>
                <Grid item md={1} xs={1} ><Typography align="right">(-) 20.12</Typography></Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item md={12} xs={12}>
          <Grid Grid container spacing={1}>
            <Grid item md={6} xs={1} ><Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Net Profit for the period</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">421,100</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">370,360</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right">100,000</Typography></Grid>
            <Grid item md={1} xs={1} ><Typography style={{ backgroundColor: "#b3e5fc" }} align="right"></Typography></Grid>
          </Grid>
        </Grid>
        <br />
      </div>
    )
  }

}
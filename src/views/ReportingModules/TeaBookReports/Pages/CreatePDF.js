import React from "react";
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
    const searchData = this.props.searchData;
    const searchDate = this.props.searchDate;
    const reportData = this.props.reportData;
    const total = this.props.total;
    return (
      <div>
        <h2><center><u>Tea Book Report</u></center></h2>
        <div>&nbsp;</div>
        <h2><center>{searchData.groupName} - {searchData.factoryName}</center></h2>
        <div>&nbsp;</div>
        <h3><center> Tea Book for the Month of {searchData.monthName} - {searchDate.year}</center></h3>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Date</TableCell>
                    <TableCell colSpan={4} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Green Leaf </TableCell>
                    <TableCell colSpan={4} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Made Leaf </TableCell>
                    <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Withered Leaf</TableCell>
                    <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Fired Tea</TableCell>
                    <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Drier Blow Out</TableCell>
                    <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Refuse Tea</TableCell>
                    <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Rainfall</TableCell>
                    <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Good Leaf</TableCell>
                    <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Gross Out Turn</TableCell>
                    <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Net Out Turn</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Estate</TableCell>
                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Inter Estate</TableCell>
                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Bought Leaf</TableCell>
                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Grand Total</TableCell>
                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Estate Made Tea(Kg)</TableCell>
                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Inter Estate Made Tea(Kg)</TableCell>
                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Boughtleaf Made Tea(Kg)</TableCell>
                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Total(Kg)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {reportData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {data.date}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {data.estateGreenLeaf}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.interStateGreenLeaf).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.boughtLeaftGreenLeaf).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.grandTotalGreenLeaf).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.estateMadeTea).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.interStateMadeTea).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.boughtLeafMadeTea).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.grandTotalMadeTea).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.witheredLeaf).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.firedTea).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.drierBlowOut).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.refuseTea).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.rainfall).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.goodLeaf).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.grossOutTurn).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.netOutTurn).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
                <TableRow>
                  <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totalestate)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totalinterEstate)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totalboughtLeaf)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totalglgrandTotal)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totalestateMadeTea)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totalinterEstateMadeTea)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totalboughtleafMadeTea)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totalmtgrandTotal)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totalwitheredLeaf)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totalfiredTea)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totaldrierBlowOut)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totalrefuseTea)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                    <b>{(parseFloat(total.totalrainfall)).toFixed(2)} </b>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                  </TableCell>
                </TableRow>
              </Table>
          </Box>
        </div>
        <div>&nbsp;</div>
        <h4><center>*******End of List*******</center></h4>
      </div>
    );

  }

}

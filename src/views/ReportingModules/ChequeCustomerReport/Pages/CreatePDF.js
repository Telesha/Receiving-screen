import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
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
    const chequeCustomerData = this.props.chequeCustomerData;
    const total = this.props.total;
    const selectedDatePDF = this.props.selectedDatePDF;

    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u>Cheque Customer Details Report</u></center></h2>
          <div>&nbsp;</div>
          <h3><center>{searchData.factoryName}</center></h3>
          <div>&nbsp;</div>
          <h4><center>BOUGHT LEAF DIRECT CHEQUE PAYMENT FOR THE MONTH OF {selectedDatePDF.applicableMonth} - {selectedDatePDF.applicableYear}</center></h4>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer style={{ marginLeft: '5rem' }} >
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'left'}>Route Name</TableCell>
                      <TableCell align={'left'}>Reg No</TableCell>
                      <TableCell align={'left'}>Customer Name</TableCell>
                      <TableCell align={'left'}>Amount (Rs)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chequeCustomerData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.routeName}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.registrationNumber}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.name}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableRow>
                    <TableCell align={'left'}><b>Total</b></TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {total} </b>
                    </TableCell>
                  </TableRow>
                </Table>
              </TableContainer>
            </Box>
          </div>
          <div>&nbsp;</div>
          <h4><center>*******End of List*******</center></h4>
        </div></div>
    );

  }

}

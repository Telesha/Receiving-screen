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
import moment from 'moment';


export default class ComponentToPrint extends React.Component {

  render() {
    const searchData = this.props.searchData;
    const searchDate = this.props.searchDate;
    const reportData = this.props.reportData;
    const total = this.props.total;
    return (
      <div>
        <h2><center><u>Accounts Payable with Aging Report</u></center></h2>
        <div>&nbsp;</div>
        <h2><center>{searchData.groupName} - {searchData.factoryName}</center></h2>
        <div>&nbsp;</div>
        <div>
        <Box minWidth={1050}>
          <TableContainer style={{ marginLeft: '5px' }}>
            <Table aria-label="caption table">
              <TableHead>
                <TableRow>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>INVOICE DATE</TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>INVOICE </TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>SUPPLIER NAME </TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>INVOICE AMOUNT</TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>PAYMENTS MADE</TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>AMOUNT</TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>DUE DATE</TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>DAYS ABOVE DUE DATE</TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>REMARKS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {moment(data.invoiceDate).format('MM/DD/YYYY')}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {data.invoice}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {data.supplierName}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.invoiceAmount).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.paymentsMade).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {(data.amount).toFixed(2)}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {moment(data.dueDate).format('MM/DD/YYYY')}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {data.daysAboveDueDate}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                      {data.remarks == null ? '-' : data.remarks}
                    </TableCell>
                  </TableRow>

                ))}
              </TableBody>
              <TableRow>
                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                <b>Total</b>
                </TableCell>
                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                </TableCell>
                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}>
                </TableCell>
                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}>
                  <b>{(parseFloat(total.totalinvoiceAmount)).toFixed(2)} </b>
                </TableCell>
                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                  <b>{(parseFloat(total.totalpaymentsMade)).toFixed(2)} </b>
                </TableCell>
                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                  <b>{(parseFloat(total.totalamount)).toFixed(2)} </b>
                </TableCell>
                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                </TableCell>
                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                </TableCell>
                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                </TableCell>
              </TableRow>
            </Table>
          </TableContainer>
        </Box>
        </div>
        <div>&nbsp;</div>
        <h4><center>*******End of List*******</center></h4>
      </div>
    );

  }

}

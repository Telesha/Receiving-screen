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
    const cashCustomerData = this.props.cashCustomerData;
    const total = this.props.total;
    const selectedDatePDF = this.props.selectedDatePDF;

    return (
      <div>
        <h2><center><u>Cash Customer Details Report</u></center></h2>
        <div>&nbsp;</div>
        <h2><center>{searchData.groupName} - {searchData.factoryName}</center></h2>
        <div>&nbsp;</div>
        <h3><center> Bought Leaf Cash Payment for the Month of {selectedDatePDF.applicableMonth} - {selectedDatePDF.applicableYear}</center></h3>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer >
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'center'}>Route Name</TableCell>
                    <TableCell align={'center'}>Registration Number</TableCell>
                    <TableCell align={'center'}>Customer Name</TableCell>
                    <TableCell align={'center'}>Amount(Rs)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cashCustomerData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.routeName}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.registrationNumber}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.name}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableRow>
                  <TableCell align={'center'}><b>Total</b></TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                  </TableCell>
                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    <b> {total} </b>
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

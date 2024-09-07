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
  Paper,
  TableFooter
} from '@material-ui/core';
import moment from 'moment';




export default class ComponentToPrint extends React.Component {

  render() {
    const selectedSearchValues = this.props.selectedSearchValues;
    const statutoryDetail = this.props.statutoryDetail;
    const statutoryData = this.props.statutoryData;
    const months = this.props.months;
    const date = this.props.date

    return (
      <div>
        <h2><left><u>EPF/ETF Return Report</u></left></h2>
        <div>&nbsp;</div>
        <h4><left>Group - {selectedSearchValues.groupID} </left></h4>
        <div>&nbsp;</div>
        <h4><left>Estate - {selectedSearchValues.estateID}</left></h4>
        <div>&nbsp;</div>
        <h4><left>Months - {months.startMonth} To {months.endMonth}</left></h4>
        <div>&nbsp;</div>
        <br></br>
        <div>

          <Table size="small" aria-label="sticky table" Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> EPF NO </TableCell>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> Employee Name </TableCell>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> NIC NO </TableCell>
                {date.map((row, index) => (
                  <TableCell key={index} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                    {moment(row).format('MM / YYYY')}
                  </TableCell>
                ))}
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                  {statutoryDetail.deductionTypeID == 1 ? 'EPF Total (Rs.)' : statutoryDetail.deductionTypeID == 2 ? 'ETF Total (Rs.)' : ''}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statutoryData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                    {row.epfNumber == '' ? '-' : row.epfNumber}
                  </TableCell>
                  <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                    {row.empName}
                  </TableCell>
                  <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                    {row.nicNumber}
                  </TableCell>
                  {date.map((rows, index) => {
                    var found = row.statutoryDetailModels.find(x => x.effectiveDate == rows);
                    return (
                      <TableCell key={index} style={{ border: "1px solid black" }} align="center">
                        {found === undefined ? '-' : (found.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    );
                  })}
                  <TableCell style={{ border: "1px solid black", fontWeight: "bold" }} align="center" component="th" scope="row">
                    {row.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="left">
                  Total
                </TableCell>
                {date.map((day, index) => {
                  const dayTotal = statutoryData.reduce((total, row) => {
                    const found = row.statutoryDetailModels.find(x => x.effectiveDate === day);
                    return total + (found ? parseFloat(found.amount) : 0);
                  }, 0);
                  return (
                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center" key={index}>
                      {dayTotal !== 0 ? dayTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                    </TableCell>
                  );
                })}
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                  {statutoryData.reduce((total, row) => total + parseFloat(row.totalAmount), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

        </div>
        <div>&nbsp;</div>
        {/* <h4><center>*******End of List*******</center></h4> */}
      </div>
    );

  }

}

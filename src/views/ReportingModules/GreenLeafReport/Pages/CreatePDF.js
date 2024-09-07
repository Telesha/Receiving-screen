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
    const searchDate = this.props.searchDate;
    const cashCustomerData = this.props.cashCustomerData;
    const total = this.props.total;
    const monthDays = this.props.monthDays;

    return (
      <div>
        <h2><left><u>Cash Kilo Report</u></left></h2>
        <div>&nbsp;</div>
        <h4><left>Group - {selectedSearchValues.groupID} </left></h4>
        <div></div>
        <h4><left>Estate - {selectedSearchValues.estateID}</left></h4>
        <div></div>
        <h4><left>Division - {selectedSearchValues.divisionID}</left></h4>
        <div></div>
        <h4><left>jobTypes - {selectedSearchValues.jobTypeID == 5 ? "Plucking CashKilo" : selectedSearchValues.jobTypeID == 7 ? "MachinePlucking CashKilo" : "All Jobs"}</left></h4>
        <div></div>
        <div>
        </div>
        <div></div>
        <h4><left>From Date - {selectedSearchValues.startDate} &nbsp; To Date - {searchDate.endDate}</left></h4>
        <div>&nbsp;</div>
        <br></br>
        <div>

          <Table size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                  Employee NO
                </TableCell>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                  Employee Name
                </TableCell>
                {monthDays.map((row, index) => {
                  return (
                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                      {moment(row).format('MMMM DD')}
                    </TableCell>
                  );
                })}
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cashCustomerData.map((row, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                      {row.registrationNumber}
                    </TableCell>
                    <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                      {row.name}
                    </TableCell>
                    {monthDays.map((rows, index) => {
                      var found = row.greenLeafCashDetailModels.find(x => ((x.date).split('T')[0]) == rows)
                      return (
                        <TableCell style={{ border: "1px solid black" }} align="center">
                          {found == undefined ? '-' : found.amount}
                        </TableCell>
                      );
                    }
                    )}
                    <TableCell style={{ border: "1px solid black", fontWeight: "bold" }} align="left" component="th" scope="row">
                      {row.totalAmount}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                  Total
                </TableCell>
                {monthDays.map((day, index) => {
                  const dayTotal = cashCustomerData.reduce((total, row) => {
                    const found = row.greenLeafCashDetailModels.find(x => ((x.date).split('T')[0]) === day);
                    return total + (found ? parseFloat(found.amount) : 0);
                  }, 0);

                  return (
                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center" key={index}>
                      {dayTotal !== 0 ? dayTotal : '-'}
                    </TableCell>
                  );
                })}
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="left">
                  {cashCustomerData.reduce((total, row) => total + parseFloat(row.totalAmount), 0)}
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

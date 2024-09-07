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
    const monthDays = this.props.monthDays

    return (
      <div>
        <h2><left><u>Green Leaf & Over kilo Report</u></left></h2>
        <div>&nbsp;</div>
        <h4><left>Group - {selectedSearchValues.groupID} </left></h4>
        <div>&nbsp;</div>
        <h4><left>Estate - {selectedSearchValues.estateID}</left></h4>
        <div>&nbsp;</div>
        <h4><left>Division - {selectedSearchValues.divisionID}</left></h4>
        <div>&nbsp;</div>
        <h4><left>jobTypes - {selectedSearchValues.jobTypeID == 3 ? "Plucking - General" : selectedSearchValues.jobTypeID == 6 ? "MachinePlucking - General " : selectedSearchValues.jobTypeID == 8 ? "Cash Day Plucking - General " : "All Jobs"}</left></h4>
        <div>&nbsp;</div>
        <h4><left>Date - ({selectedSearchValues.startDate}) - ({selectedSearchValues.endDate})</left></h4>
        <div>&nbsp;</div>
        <br></br>
        <div>

          <Table
            size="small"
            aria-label="sticky table"
            Table
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left"> Employee NO </TableCell>
                <TableCell rowSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left"> Employee Name </TableCell>
                {monthDays.sort((a, b) => new Date(a) - new Date(b)).map((row, index) => {
                  return (
                    <React.Fragment key={index}>
                      <TableCell colSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> {moment(row).format('MMMM DD')} </TableCell>
                    </React.Fragment>
                  );
                })}
                <TableCell colSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> Total </TableCell>
              </TableRow>
              <TableRow>
                {monthDays.sort((a, b) => new Date(a) - new Date(b)).map((row, index) => {
                  return (
                    <React.Fragment key={index}>
                      <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> Total(Kg) </TableCell>
                      <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> Over(Kg) </TableCell>
                    </React.Fragment>
                  );
                })}
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> Total(Kg) </TableCell>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> Over(Kg) </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cashCustomerData.map((row, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell style={{ border: "1px solid black", fontSize: "15px" }} align="left" component="th" scope="row"> {row.registrationNumber} </TableCell>
                    <TableCell style={{ border: "1px solid black", fontSize: "15px" }} align="left" component="th" scope="row"> {row.name} </TableCell>
                    {monthDays.map((rows, dayIndex) => {
                      var found = row.greenLeafAndOverkgModels.find(x => ((x.date).split('T')[0]) == rows)
                      return (
                        <React.Fragment key={dayIndex}>
                          <TableCell style={{ border: "1px solid black", fontSize: "16px" }} align="center"> {found == undefined ? '-' : found.amount} </TableCell>
                          <TableCell style={{ border: "1px solid black", fontSize: "16px" }} align="center"> {found == undefined || found.overKilo == 0 ? '-' : found.overKilo} </TableCell>
                        </React.Fragment>
                      );
                    })}
                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "15px" }} align="center" component="th" scope="row"> {row.totalAmount} </TableCell>
                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "15px" }} align="center" component="th" scope="row"> {row.totalOverKilo == 0 ? '-' : row.totalOverKilo} </TableCell>
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
                    const found = row.greenLeafAndOverkgModels.find(x => ((x.date).split('T')[0]) === day);
                    return total + (found ? parseFloat(found.amount) : 0);
                  }, 0);

                  const dayOverTotal = cashCustomerData.reduce((total, row) => {
                    const found = row.greenLeafAndOverkgModels.find(x => ((x.date).split('T')[0]) === day);
                    return total + (found ? parseFloat(found.overKilo) : 0);
                  }, 0);

                  return (
                    <React.Fragment key={index}>
                      <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "15px", color: "red" }} align="center"> {dayTotal !== 0 ? dayTotal : '-'} </TableCell>
                      <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "15px", color: "red" }} align="center"> {dayOverTotal !== 0 ? dayOverTotal : '-'} </TableCell>
                    </React.Fragment>
                  );
                })}
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center"> {cashCustomerData.reduce((total, row) => total + parseFloat(row.totalAmount), 0)} </TableCell>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center"> {cashCustomerData.reduce((total, row) => total + parseFloat(row.totalOverKilo), 0)} </TableCell>
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

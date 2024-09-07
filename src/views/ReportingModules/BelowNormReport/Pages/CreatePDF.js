import React from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
  TableFooter
} from '@material-ui/core';
import moment from 'moment';

export default class ComponentToPrint extends React.Component {

  render() {
    const selectedSearchValues = this.props.selectedSearchValues;
    const searchDate = this.props.searchDate;
    const belowNormData = this.props.belowNormData;
    const date = this.props.date;
    const total = this.props.total;
    return (
      <div>
        <h2><left><u>Below Norm Report</u></left></h2>
        <div>&nbsp;</div>
        <h4><left>Group - {selectedSearchValues.groupID} </left></h4>
        <div>&nbsp;</div>
        <h4><left>Estate - {selectedSearchValues.estateID}</left></h4>
        <div>&nbsp;</div>
        <h4><left>JobType - {(selectedSearchValues.jobTypeID == 3 ? "Plucking" : selectedSearchValues.jobTypeID == 6 ? "Machine Plucking" : selectedSearchValues.jobTypeID == 8 ? "Cash Day Plucking " : "All Jobs")}</left></h4>
        <div>&nbsp;</div>
        <h4><left>Date - {selectedSearchValues.startDate} - {searchDate.endDate}</left></h4>
        <div>&nbsp;</div>
        <br></br>
        <div>

          <Table size="small" aria-label="sticky table" Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">Employee NO</TableCell>
                <TableCell style={{ left: 113, border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">Employee Name</TableCell>
                {date.sort((a, b) => new Date(a) - new Date(b)).map((row, index) => (
                  <TableCell key={index} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                    {moment(row).format('MMMM DD')}
                  </TableCell>
                ))}
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">Total </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {belowNormData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                    {row.registrationNumber}
                  </TableCell>
                  <TableCell style={{ left: 113, border: "1px solid black" }} align="left" component="th" scope="row">
                    {row.name}
                  </TableCell>
                  {date.sort((a, b) => new Date(a) - new Date(b)).map((rows, index) => {
                    var found = row.greenLeafCashDetailModels.find(x => ((x.date).split('T')[0]) == rows);
                    return (
                      <TableCell key={index} style={{ border: "1px solid black" }} align="center">
                        {found === undefined ? '-' : found.amount}
                      </TableCell>
                    );
                  })}
                  <TableCell style={{ border: "1px solid black", fontWeight: "bold" }} align="left" component="th" scope="row">
                    {row.totalAmount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                  Total
                </TableCell>
                {date.sort((a, b) => new Date(a) - new Date(b)).map((day, index) => {
                  const dayTotal = belowNormData.reduce((total, row) => {
                    const found = row.greenLeafCashDetailModels.find(x =>((x.date).split('T')[0]) === day);
                    return total + (found ? parseFloat(found.amount) : 0);
                  }, 0);
                  return (
                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center" key={index}>
                      {dayTotal !== 0 ? dayTotal : '-'}
                    </TableCell>
                  );
                })}
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="left">
                  {belowNormData.reduce((total, row) => total + parseFloat(row.totalAmount), 0)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

        </div>
        <div>&nbsp;</div>
      </div>
    );

  }

}

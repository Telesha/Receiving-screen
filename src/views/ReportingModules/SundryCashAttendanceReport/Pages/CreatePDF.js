import React from "react";
import {
  Box,
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
    const attendanceDetailsData = this.props.attendanceDetailsData;
    const selectedSearchValues = this.props.selectedSearchValues;
    const monthDays = this.props.monthDays;
    return (
      <div>
        <div style={{ padding: '10px', marginBottom: "15rem" }}>
          <h2><left><u>Sundry Cash Attendance Report</u></left></h2>
          <div>&nbsp;</div>
          <h4><left>Group: {selectedSearchValues.groupName} <br></br> Estate:{selectedSearchValues.estateName}</left></h4>
          <h4><left>Division: {selectedSearchValues.divisionName}</left></h4>
          <h4><left>Date: {selectedSearchValues.startDate} - {selectedSearchValues.endDate}</left></h4>
          <div>&nbsp;</div>
          <br></br>

          <div>
            <Table size="small" aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ border: "1px solid black" }} align="left">
                    Employee Number
                  </TableCell>
                  <TableCell style={{ border: "1px solid black" }} align="left">
                    Employee Name
                  </TableCell>
                  {monthDays.sort((a, b) => new Date(a) - new Date(b)).map((row, index) => {
                    return (
                      <TableCell style={{ border: "1px solid black" }} align="center">
                        {moment(row).format('MMMM DD')}
                      </TableCell>
                    );
                  })}
                  <TableCell style={{ border: "1px solid black" }} align="left">
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceDetailsData.map((row, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                        {row.empNo}
                      </TableCell>
                      <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                        {row.empName}
                      </TableCell>
                      {monthDays.sort((a, b) => new Date(a) - new Date(b)).map((rows, index) => {
                        var found = row.sundryCashAttendanceOutputModel.find(x => x.date == rows)
                        return (
                          <TableCell style={{ border: "1px solid black", backgroundColor: found === undefined ? '#ffcccc' : 'inherit', }}
                            align="center"
                          >
                            {found == undefined ? 'AB' : found.dayType}
                          </TableCell>
                        );
                      }
                      )}
                      <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                        {row.totCol}
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
                  {monthDays.sort((a, b) => new Date(a) - new Date(b)).map((day, index) => {
                    const dayTotal = attendanceDetailsData.reduce((total, row) => {
                      const found = row.sundryCashAttendanceOutputModel.find(x => x.date === day);
                      return total + (found ? parseFloat(found.dayType) : 0);
                    }, 0);

                    return (
                      <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center" key={index}>
                        {dayTotal !== 0 ? dayTotal : '-'}
                      </TableCell>
                    );
                  })}
                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="left">
                    {attendanceDetailsData.reduce((total, row) => total + parseFloat(row.totCol), 0)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>

          </div>
          <div>&nbsp;</div>
          {/* <h3><center>***** End of List *****</center></h3> */}
        </div>
      </div>
    );

  }

}
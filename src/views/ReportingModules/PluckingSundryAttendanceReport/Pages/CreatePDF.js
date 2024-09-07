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
    const attendanceDetailsData = this.props.attendanceDetailsData;
    const selectedSearchValues = this.props.selectedSearchValues;
    const monthDays = this.props.monthDays;
    return (
      <div>
        <div style={{ padding: '10px', marginBottom: "15rem" }}>
          <center>
            <h2><left><u>Plucking & Sundry Attendance Report</u></left></h2>
            <div>&nbsp;</div>
            <h4><left>Group:{selectedSearchValues.groupName} <br></br> Estate:{selectedSearchValues.estateName}</left></h4>
            <h4><left>Division:{selectedSearchValues.divisionName} <br></br> Job Type:{selectedSearchValues.jobTypeID == 2? "Plucking" : selectedSearchValues.jobTypeID == 3 ? "Sundry" : "All Jobs"}<br></br> {selectedSearchValues.jobTypeID === 2 && (<h4>Plucking Job Type:{selectedSearchValues.pluckingJobTypeID == 3? "Plucking - General" : selectedSearchValues.pluckingJobTypeID == 6? "Machine Plucking - General" : "All PluckingJobs"}</h4>)}</left></h4>
            <h4><left>{selectedSearchValues.startDate} - {selectedSearchValues.endDate}</left></h4>
            selectedSearchValues.jobTypeID == 5 ? "Plucking CashKilo" : selectedSearchValues.jobTypeID == 7 ? "MachinePlucking CashKilo" : selectedSearchValues.jobTypeID == 8 ? "Cash Day Plucking CashKilo" : "All Jobs"
            <br></br>
            <div>&nbsp;</div>
          </center>
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
                         var found = row.pluckingSundryAttendanceOutputModel.filter(x => ((x.date).split('T')[0]) == ((rows).split('T')[0]));
                         var totalAmount = found.reduce((total, record) => total + (record.dayType ), 0)
                         return (
                           <TableCell
                             style={{ border: "1px solid black", backgroundColor: found.length === 0 ? '#ffcccc' : 'inherit', }}
                             align="center" >
                             {found.length === 0 ? 'AB' : totalAmount}
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
                  {monthDays.map((day, index) => {
                    const dayTotal = attendanceDetailsData.reduce((total, row) => {
                      const found = row.pluckingSundryAttendanceOutputModel.filter(x => ((x.date).split('T')[0]) == ((day).split('T')[0]));
                      const daySum = found.reduce((sum, entry) => sum + parseFloat(entry.dayType), 0);
                      return total + daySum;
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
          <h3><center>***** End of List *****</center></h3>
        </div>
      </div>
    );
  }
}
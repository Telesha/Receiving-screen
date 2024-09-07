import React from "react";
import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableFooter
} from '@material-ui/core';
import moment from 'moment';

export default class ComponentToPrint extends React.Component {
  render() {
    const jobDistributionData = this.props.jobDistributionData;
    const selectedSearchValues = this.props.selectedSearchValues;
    const date = this.props.monthDays;
    return (
      <div>
        <div style={{ padding: '10px', marginBottom: "15rem" }}>
          <h2><left><u>Employee-Wise Job Distribution Report</u></left></h2>
          <div>&nbsp;</div>
          <h4><left>Group:{selectedSearchValues.groupName} <br></br> Estate:{selectedSearchValues.estateName}</left></h4>
          <h4><left>Division:{selectedSearchValues.divisionName} <br></br> Job Type:{selectedSearchValues.jobTypeID == 2? "Plucking" : selectedSearchValues.jobTypeID == 3 ? "Sundry" : "All Jobs"}<br></br> {selectedSearchValues.jobTypeID === 2 && (<h4>Plucking Job Type:{selectedSearchValues.pluckingJobTypeID == 3? "Plucking - General" : selectedSearchValues.pluckingJobTypeID == 5? "Plucking - CashKilo" : selectedSearchValues.pluckingJobTypeID == 6? "Machine Plucking - General" : selectedSearchValues.pluckingJobTypeID == 7? "Machine Plucking - CashKilo" : "All PluckingJobs"}</h4>)}</left></h4>
          <h4><left>{selectedSearchValues.startDate} - {selectedSearchValues.endDate}</left></h4>
          <div>&nbsp;</div>
          <br></br>
          <div>

            <Table size="small" aria-label="sticky table" Table stickyHeader>
              <TableRow>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                  Employee Number
                </TableCell>
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                  Employee Name
                </TableCell>
                {date.sort((a, b) => new Date(a) - new Date(b)).map((row, index) => {
                  return (
                    <React.Fragment key={index}>
                      <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center" colSpan={2}>
                        {moment(row).format('MMMM DD')}
                      </TableCell>
                    </React.Fragment>
                  );
                })}
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                  Total
                </TableCell>
              </TableRow>

              <TableBody>
                {jobDistributionData.map((row, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                        {row.empNo.padStart(4, '0')}
                      </TableCell>
                      <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                        {row.empName}
                      </TableCell>
                      {date.sort((a, b) => new Date(a) - new Date(b)).map((rows, Dindex) => {
                        var found = row.empJobDistributionOutputModel.find(x =>((x.date).split('T')[0]) == rows);
                        return (
                          <React.Fragment key={Dindex}>
                            <TableCell style={{ border: "1px solid black" }} align="center" >
                              {found == undefined ? '-' : found.jobCode}
                            </TableCell>
                            <TableCell style={{ border: "1px solid black" }} align="center" >
                              {found == undefined ? '-' : found.dayType == 0 ? '-' : found.dayType}
                            </TableCell>
                          </React.Fragment>
                        );
                      })}
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
                  {date.sort((a, b) => new Date(a) - new Date(b)).map((day, index) => {
                    const dayTotal = jobDistributionData.reduce((total, row) => {
                      const found = row.empJobDistributionOutputModel.find(x => ((x.date).split('T')[0]) === day);
                      return total + (found ? parseFloat(found.dayType) : 0);
                    }, 0);

                    return (
                      <React.Fragment key={index}>
                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center" colSpan={2}>
                          {dayTotal !== 0 ? dayTotal : '-'}
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="left">
                    {jobDistributionData.reduce((total, row) => total + parseFloat(row.totCol), 0)}
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
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
    const lentLabourData = this.props.lentLabourData;
    const selectedSearchValues = this.props.selectedSearchValues;
    const date = this.props.monthDays;
    return (
      <div>
        <div style={{ padding: '10px', marginBottom: "15rem" }}>
          <h2><left><u>Lent Labour Report</u></left></h2>
          <div>&nbsp;</div>
          <h4><left>Group:{selectedSearchValues.groupName} <br></br> Estate:{selectedSearchValues.estateName}</left></h4>
          <h4><left>Division:{selectedSearchValues.divisionName} <br></br> </left></h4>
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
                      <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center" colSpan={3}>
                        {moment(row).format('MMMM DD')}
                      </TableCell>
                    </React.Fragment>
                  );
                })}
                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="right">
                  Total
                </TableCell>
              </TableRow>

              <TableBody>
                {lentLabourData.map((row, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                        {row.empNo.padStart(4, '0')}
                      </TableCell>
                      <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                        {row.empName}
                      </TableCell>
                      {date.sort((a, b) => new Date(a) - new Date(b)).map((rows, Dindex) => {
                        var found = row.lentLabourReportOutputModel.find(x => x.date == rows)
                        return (
                          <React.Fragment key={Dindex}>
                            <TableCell style={{ border: "1px solid black" }} align="center" >
                              {found == undefined ? '-' : found.estateName == 0 ? '-' : found.estateName}
                            </TableCell>
                            <TableCell style={{ border: "1px solid black" }} align="center" >
                              {found == undefined ? '-' : found.divisionName}
                            </TableCell>
                            <TableCell style={{ border: "1px solid black" }} align="right" >
                              {found == undefined ? '-' : found.manDays == 0 ? '-' : found.manDays}
                            </TableCell>
                          </React.Fragment>
                        );
                      })}
                      <TableCell style={{ border: "1px solid black" }} align="right" component="th" scope="row">
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
                    const dayTotal = lentLabourData.reduce((total, row) => {
                      const found = row.lentLabourReportOutputModel.find(x => x.date === day);
                      return total + (found ? parseFloat(found.manDays) : 0);
                    }, 0);

                    return (
                      <React.Fragment key={index}>
                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="right" colSpan={3}>
                          {dayTotal !== 0 ? dayTotal : '-'}
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="right">
                    {lentLabourData.reduce((total, row) => total + parseFloat(row.totCol), 0)}
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
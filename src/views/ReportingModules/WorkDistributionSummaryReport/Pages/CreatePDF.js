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

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
    '@media print': {
      '@page': {
        size: 'landscape',
      },
    },
  },
}));


export default class ComponentToPrint extends React.Component {

  render() {
    const selectedSearchValues = this.props.selectedSearchValues;
    const searchDate = this.props.searchDate;
    const cashCustomerData = this.props.cashCustomerData;
    const total = this.props.total;
    const monthDays = this.props.monthDays;
    const jobTypes = this.props.jobTypes;
    const workDistributionData = this.props.workDistributionData;

    return (
      <div>
        <div>
          <h2><left><u>Work Distribution Summary Report</u></left></h2>
          <div>&nbsp;</div>
          <h4><left>Group - {selectedSearchValues.groupID} </left></h4>
          <div>&nbsp;</div>
          <h4><left>Estate - {selectedSearchValues.estateID}</left></h4>
          <div>&nbsp;</div>
          <h4><left>Division - {selectedSearchValues.divisionID == null ? 'All Divisions' : selectedSearchValues.divisionID}</left></h4>
          <div>&nbsp;</div>
          <h4><left>Date - ({selectedSearchValues.startDate}) / ({selectedSearchValues.endDate})</left></h4>
          <div>&nbsp;</div>
          <h4><left>Job Category - {selectedSearchValues.jobCategoryID == undefined ? 'All Job Categories' : selectedSearchValues.jobCategoryID}</left></h4>
          <div>&nbsp;</div>
          <h4><left>Job Code -  {selectedSearchValues.jobCode == null ? 'All Job Codes' : selectedSearchValues.jobCode}</left></h4>
          <div>&nbsp;</div>
          <br></br>
          <div>

            {selectedSearchValues.divisionID == null ?
              <Table size="small" aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={jobTypes.length + 2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                      Work Distribution Summary
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell rowSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                      Division
                    </TableCell>
                    <TableCell colSpan={jobTypes.length} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                      Job Code
                    </TableCell>
                    <TableCell rowSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="right">
                      Total Mandays
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {jobTypes.map((jobCode, index) => (
                      <TableCell key={index} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                        {jobCode}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workDistributionData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell colSpan={1} style={{ border: "1px solid black" }} align="left">
                        {row.divisionName}
                      </TableCell>
                      {jobTypes.map((jobCode, jobIndex) => {
                        const found = row.workDistributionSummaryReportModels.find(x => x.jobCode === jobCode);
                        return (
                          <TableCell key={jobIndex} style={{ border: "1px solid black" }} align="center">
                            {found ? found.totalAttendancePerJobCode : '-'}
                          </TableCell>
                        );
                      })}

                      <TableCell style={{ border: "1px solid black", fontWeight: "bold" }} align="right">
                        {
                          (() => {
                            const uniqueJobcodes = new Set();
                            const uniqueItems = row.workDistributionSummaryReportModels.filter(item => {
                              if (!uniqueJobcodes.has(item.jobCode)) {
                                uniqueJobcodes.add(item.jobCode);
                                return true;
                              }
                              return false;
                            });
                            return uniqueItems.reduce((accumulator, currentItem) => {
                              return accumulator + currentItem.totalAttendancePerJobCode;
                            }, 0);
                          })()
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={1} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                      Total
                    </TableCell>
                    {jobTypes.map((jobCode, index) => {
                      const jobCodeTotal = workDistributionData.reduce((total, row) => {
                        const found = row.workDistributionSummaryReportModels.find(x => x.jobCode === jobCode);
                        return total + (found ? parseFloat(found.totalAttendancePerJobCode) : 0);
                      }, 0);

                      return (
                        <TableCell key={index} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center">
                          {jobCodeTotal !== 0 ? jobCodeTotal : '-'}
                        </TableCell>
                      );
                    })}
                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="right">
                      {
                        (() => {
                          let total = 0;
                          workDistributionData.forEach(row => {
                            const found = row.workDistributionSummaryReportModels.reduce((accumulator, currentItem) => {
                              return accumulator + currentItem.attendance;
                            }, 0);
                            total += found;
                          });
                          return total;
                        })()
                      }
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>

              :

              <Table size="small" aria-label="simple table">
                <TableRow>
                  <TableCell rowSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                    Job Code
                  </TableCell>
                  {monthDays.map((row, index) => (
                    <TableCell key={index} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                      Day {moment(row).format('DD')}
                    </TableCell>
                  ))}
                  <TableCell rowSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                    Total
                  </TableCell>
                </TableRow>
                <TableBody>

                  {jobTypes.map((jobCode, index) => (
                    <React.Fragment key={index}>
                      <TableRow key={index}>
                        <TableCell style={{ border: "1px solid black" }} align="left">
                          {jobCode}
                        </TableCell>
                        {monthDays.map((day, rowIndex) => {
                          var found = workDistributionData[0].workDistributionSummaryReportModels.find(x => x.date == day && x.jobCode == jobCode);
                          return (
                            <TableCell key={rowIndex} style={{ border: "1px solid black" }} align="center">
                              {found == undefined ? '-' : found.attendance}
                            </TableCell>
                          );
                        })}
                        <TableCell style={{ border: "1px solid black" }} align="right">
                          {
                            (() => {
                              let total = 0;
                              let filteredJobCodes = workDistributionData[0].workDistributionSummaryReportModels.filter(x => x.jobCode == jobCode);
                              return filteredJobCodes.reduce((total, row) => total + (parseFloat(row.attendance) || 0), 0) || '-';

                            })()
                          }
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={1} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                      Total
                    </TableCell>
                    {monthDays.map((day, index) => {
                      const dayTotal = workDistributionData.reduce((total, row) => {
                        const found = row.workDistributionSummaryReportModels.find(x => x.date === day);
                        return total + (found ? parseFloat(found.attendance) || 0 : 0);
                      }, 0);
                      return (
                        <TableCell key={`total_${day}`} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center">
                          {dayTotal !== 0 ? dayTotal : '-'}
                        </TableCell>
                      );
                    })}
                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="right">
                      {
                        (() => {
                          if (workDistributionData.length > 0) {
                            return workDistributionData[0].workDistributionSummaryReportModels.reduce((total, row) => total + (parseFloat(row.attendance) || 0), 0) || '-';
                          }
                        })()
                      }
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            }
          </div>
          <div>&nbsp;</div>
          <h4><center>*******End of List*******</center></h4>
        </div>
      </div>
    );
  }
}

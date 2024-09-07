import React from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {

  render() {
    const selectedSearchValues = this.props.selectedSearchValues;
    const loanReportDetail = this.props.loanReportDetail;
    const loanReportData = this.props.loanReportData;
    const totalValues = this.props.totalValues;

    return (
      <div>
        <h2><left><u>Loan Report</u></left></h2>
        <div>&nbsp;</div>
        <h4><left>Group - {selectedSearchValues.groupID} </left></h4>
        <div>&nbsp;</div>
        <h4><left>Estate - {selectedSearchValues.estateID}</left></h4>
        <div>&nbsp;</div>
        <h4><left>Division - {selectedSearchValues.divisionID}</left></h4>
        <div>&nbsp;</div>
        <h4><left>Date - ({selectedSearchValues.startDate}) / ({selectedSearchValues.endDate})</left></h4>
        <div>&nbsp;</div>
        <br></br>
        <div>

          <Table size="small" aria-label="simple table">
            <TableHead>
              <TableRow style={{ border: "2px solid black" }}>
                <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Emp. No.</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Employee Name</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Loan Type</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>No of Installment Months</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Interest Rate (%)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Loan Amount (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Payable Amount with Interest (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Monthly Premimum (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Paid Amount (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Balance Amount (Rs.)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loanReportData.map((row, i) => (
                <TableRow style={{ border: "2px solid black" }} key={i}>
                  <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.registrationNumber}</TableCell>
                  <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.employeeName}</TableCell>
                  <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.name}</TableCell>
                  <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}> {row.numberOfInstalments}</TableCell>
                  <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}> {row.annualRate}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.principalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.equatedMonthlyInstalment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.deductionLoan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableRow style={{ border: "2px solid black" }}>
              <TableCell colSpan={5} align={'center'} style={{ borderBottom: "none", border: "2px solid black", fontSize: '16px' }} ><b><strong>Total</strong></b></TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "2px solid black" }}>{totalValues.totalprincipalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "2px solid black" }}>{totalValues.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "2px solid black" }}>{totalValues.totalequatedMonthlyInstalment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "2px solid black" }}>{totalValues.totaldeductionLoan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "2px solid black" }}>{totalValues.totalpaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
            </TableRow>
          </Table>

        </div>
        <div>&nbsp;</div>
        <h4><center>*******End of List*******</center></h4>
      </div>
    );

  }

}

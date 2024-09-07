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
    const payCheckRollReportData = this.props.payCheckRollReportData;
    const totalValues = this.props.totalValues;

    return (
      <div>
        <h2><left><u>Payment CheckRoll Summary Report 2</u></left></h2>
        <div>&nbsp;</div>
        <h4><left>Group - {selectedSearchValues.groupID} </left></h4>
        <div>&nbsp;</div>
        <h4><left>Estate - {selectedSearchValues.estateID}</left></h4>
        <div>&nbsp;</div>
        <h4><left>Division - {selectedSearchValues.divisionID}</left></h4>
        <div>&nbsp;</div>
        <h4><left>Date - ({selectedSearchValues.month}) - ({selectedSearchValues.year})</left></h4>
        <div>&nbsp;</div>
        <br></br>
        <div>

          <Table size="small" aria-label="simple table">
            <TableHead>
              <TableRow style={{ border: "2px solid black" }}>
                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Emp. No.</TableCell>
                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Employee Name</TableCell>
                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Loan (Rs.)</TableCell>
                <TableCell align="center" colSpan={20} style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Deductions</TableCell>
                <TableCell align="center" rowSpan={2} style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>EPF (10%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Stamp (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Tea Recovery (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Welfare (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Crech Fund (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Funeral Fund (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Union Recovery (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Electricity Recovery (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Pay Cards (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Co op Membership (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Co op Shop Recovery (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Temple Recovery (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Insurance Recovery (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Dhoby (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Baber (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px' }}>Water Scheme Recovery (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Fine (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Other Recovery (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Tools Recovery (Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Festival Advance Recovery(Rs.)</TableCell>
                <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', padding: '0' }}>Other Deductions(Rs.)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payCheckRollReportData.map((row, i) => (
                <TableRow style={{ border: "2px solid black" }} key={i}>
                  <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding: '0' }}> {row.registrationNumber}</TableCell>
                  <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black", padding: '0' }}> {row.employeeName}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.loan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.stamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.teaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.welfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.crenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.funeralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.unionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.electricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.payCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.coopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.coopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.templeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.insuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.dhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.baber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.waterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.fine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.otherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.toolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.festivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black", padding: '0' }}> {row.epfAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableRow style={{ border: "2px solid black" }}>
              <TableCell colSpan={2} align={'center'} style={{ borderBottom: "none", border: "1px solid black", fontSize: '16px', color: "red", padding: '0' }} ><b><strong>Total</strong></b></TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalLoan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalStamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalTeaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalWelfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalCrenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalFuneralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalUnionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalElectricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalPayCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalCoopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalCoopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalTempleRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalInsuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalDhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalBaber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalWaterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalFine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalOtherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalToolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalFestivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalOtherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red", padding: '0' }}>{totalValues.totalEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
            </TableRow>
          </Table>
        </div>
        <div>&nbsp;</div>
      </div>
    );

  }

}

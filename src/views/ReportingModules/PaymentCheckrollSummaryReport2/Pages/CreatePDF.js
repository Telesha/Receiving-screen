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
    const fulltotalValues = this.props.fulltotalValues;
    console.log("selectedSearchValues", selectedSearchValues)

    return (
      <div>
        <div>
          <h2 style={{ textAlign: 'left', textDecoration: 'underline' }}>Payment CheckRoll Summary Report 2</h2>
          <div>&nbsp;</div>
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '500px'}}>
            <h4 style={{ textAlign: 'left' }}>Group - {selectedSearchValues.groupID}</h4>
            <h4 style={{ textAlign: 'left' }}>Year - {selectedSearchValues.year}</h4>
          </div>
          <div>&nbsp;</div>
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '660px' }}>
            <h4 style={{ textAlign: 'left' }}>
              Division - {selectedSearchValues.divisionID === undefined ? 'All' : selectedSearchValues.divisionID}
            </h4>
            <h4 style={{ textAlign: 'left' }}>Month - {selectedSearchValues.monthName}</h4>
          </div>
          <div>&nbsp;</div>
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '670px' }}>
          <h4 style={{ textAlign: 'left' }}>Estate - {selectedSearchValues.estateID}</h4>
          </div>
        </div>
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
              {Object.keys(payCheckRollReportData).map((division, catIndex) => (
                <React.Fragment key={catIndex}>
                  <TableRow>
                    <TableCell colSpan={20} align="left" style={{ fontWeight: 'bold', border: "1px solid black" }}>
                      {division}
                    </TableCell>
                  </TableRow>
                  {payCheckRollReportData[division].map((row, i) => {
                    const labelId = `enhanced-table-checkbox-${catIndex}-${i}`;
                    return (
                      <TableRow style={{ border: "2px solid black" }} key={i}>
                        <TableCell component="th" id={labelId} scope="row" align="left" style={{ border: "1px solid black" }}> {row.registrationNumber}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="left" style={{ left: 79, border: "1px solid black" }}> {row.employeeName}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.loan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.stamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.teaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.welfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.crenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.funeralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.unionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.electricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.payCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.coopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.coopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.templeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.insuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.dhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.baber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.waterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.fine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.otherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.toolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.festivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="right" style={{ border: "1px solid black" }}> {row.epfAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    )
                  })}
                  {totalValues[division].map((row, i) => {
                    return (
                      <TableRow style={{ border: "2px solid black" }}>
                        <TableCell colSpan={2} align={'center'} style={{ borderBottom: "none", border: "1px solid black", fontSize: '16px', color: "black" }} ><b><strong>Sub Total</strong></b></TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalLoan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalStamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalTeaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalWelfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalCrenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalFuneralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalUnionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalElectricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalPayCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalCoopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalCoopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalTempleRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalInsuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalDhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalBaber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalWaterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalFine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalOtherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalToolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalFestivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalOtherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "black" }}>{row.totalEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    )
                  })}
                </React.Fragment>
              ))}
              {selectedSearchValues.divisionID == undefined ?
                <TableRow style={{ border: "2px solid black" }}>
                  <TableCell colSpan={2} align={'center'} style={{ borderBottom: "none", border: "1px solid black", fontSize: '16px', color: "red" }} ><b><strong>Total</strong></b></TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalLoan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalStamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalTeaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalWelfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalCrenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalFuneralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalUnionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalElectricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalPayCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalCoopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalCoopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalTempleRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalInsuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalDhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalBaber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalWaterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalFine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalOtherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalToolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalFestivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalOtherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "1px solid black", color: "red" }}>{fulltotalValues.totalEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
                : null}
            </TableBody>
          </Table>
        </div>
        <div>&nbsp;</div>
      </div>
    );
  }
}

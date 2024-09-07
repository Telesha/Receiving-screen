import React from "react";
import {
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {


  render() {
    const reportData = this.props.reportData;

    return (
      <>
        <div>
          <div style={{ width: '1100px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
            <br />
            <h2><center><u>Debtors Ageing Report</u></center></h2>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <TableContainer style={{ marginLeft: '5rem' }} >
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'left'}>Ledger Account</TableCell>
                    <TableCell align={'right'}>Voucher Number</TableCell>
                    <TableCell align={'right'}>Date</TableCell>
                    <TableCell align={'right'}>Total Due</TableCell>
                    <TableCell align={'right'}>0 - 30</TableCell>
                    <TableCell align={'right'}>31 - 60</TableCell>
                    <TableCell align={'right'}>61 - 90</TableCell>
                    <TableCell align={'right'}>90+</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {row.ledgerAccountName}
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {row.referenceNumber}
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {row.date}
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {row.amount == null ? "" : parseFloat(row.amount).toFixed(2)}
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {row.total1 == null ? "" : parseFloat(row.total1).toFixed(2)}
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {row.total2 == null ? "" : parseFloat(row.total2).toFixed(2)}
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {row.total3 == null ? "" : parseFloat(row.total3).toFixed(2)}
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {row.total4 == null ? "" : parseFloat(row.total4).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </>
    )
  }

}

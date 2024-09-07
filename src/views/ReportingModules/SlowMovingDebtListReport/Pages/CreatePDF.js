import React from "react";
import {
  Box, Card, Grid, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
    const slowMovingDebtListDetails = this.props.slowMovingDebtListDetails;
    const searchData = this.props.searchData;
    const allColumnNames = this.props.columnNames

    return (
      <div>
        <h3><center><u>Slow Moving Debt List Report</u></center></h3>
        <div>&nbsp;</div>
        <h4><center>{searchData.groupName} - {searchData.factoryName}</center></h4>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer style={{ marginLeft: '5px' }}>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'left'}>{"Route"}</TableCell>
                    <TableCell align={'left'}>{"Registration Number"}</TableCell>
                    <TableCell align={'left'}>{"Customer Name"}</TableCell>
                    <TableCell align={'left'}>{"Last 3 Month Income Avg (Rs)"}</TableCell>
                    <TableCell align={'left'}>{"Debt Amount (Rs)"}</TableCell>
                    <TableCell align={'left'}>{"Recovery Period"}</TableCell>
                    <TableCell align={'left'}>{"Loan Balance (Rs)"}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slowMovingDebtListDetails.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.routeName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.registrationNumber}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.customerName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.lastThreeMonthAverege.toFixed(2)}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.debtAmount.toFixed(2)}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.recoveryPeriod}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.loanBalance}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
      </div>
    );
  }
}

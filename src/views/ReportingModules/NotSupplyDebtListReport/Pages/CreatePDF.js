import React from "react";
import {
  Box, Card, Grid, Container, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
    const notSupplyDebtList = this.props.notSupplyDebtList;
    const searchData = this.props.searchData;


    return (
      <div>
        <h3><center><u>Not Supply Debt List Report</u></center></h3>
        <div>&nbsp;</div>
        <h4><center>{searchData.groupName} - {searchData.factoryName}</center></h4>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer style={{ marginLeft: '5px' }}>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'center'}>Route Name</TableCell>
                    <TableCell align={'center'}>Registration Number</TableCell>
                    <TableCell align={'center'}>Customer Name</TableCell>
                    <TableCell align={'center'}>Last 3 Months Crop Avg (Kg)</TableCell>
                    <TableCell align={'center'}>Todate Crop (Kg)</TableCell>
                    <TableCell align={'center'}>Debt Amount (Rs)</TableCell>
                    <TableCell align={'center'}>Loan Balance (Rs)</TableCell>
                    <TableCell align={'center'}>Last Supply Month</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notSupplyDebtList.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.routeName}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.registrationNumber}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.name}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.lastThreeMonthAvg.toFixed(2)}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.todateCrop}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.amount.toFixed(2)}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.loanBalance.toFixed(2)}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.lastSupplyMonth}
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

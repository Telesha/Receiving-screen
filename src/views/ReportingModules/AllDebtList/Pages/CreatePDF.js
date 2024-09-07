import React from "react";
import {
  Box, Card, Grid, Container, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
    const allDebtList = this.props.allDebtList;
    const searchData = this.props.searchData;
    const toDate = this.props.toDate;


    return (
      <div>
        <h3><center><u>All Debt List</u></center></h3>
        <div>&nbsp;</div>
        <h4><center>{searchData.groupName} - {searchData.factoryName}</center></h4>
        <div>&nbsp;</div>
        <h4><center>{toDate}</center></h4>
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
                    <TableCell align={'center'}>Last Month Crop (Kg)</TableCell>
                    <TableCell align={'center'}>This Month Crop (Kg)</TableCell>
                    <TableCell align={'center'}>Debt Amount (Rs)</TableCell>
                    <TableCell align={'center'}>Last Supply Month</TableCell>
                    <TableCell align={'center'}>Loan Balance (Rs)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allDebtList.map((data, index) => (
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
                        {data.lastMonthCrop}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.thisMonthCrop}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.amount}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.lastSupplyMonth}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
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

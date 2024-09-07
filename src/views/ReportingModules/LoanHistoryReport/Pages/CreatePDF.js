import React from "react";
import {
  Box, Card, Grid, Container, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
    const loanHistoryList = this.props.loanHistoryList;
    const searchData = this.props.searchData;


    return (
      <div>
        <h3><center><u>Loan History Report</u></center></h3>
        <div>&nbsp;</div>
        <h4><center>{searchData.groupName} - {searchData.factoryName}</center></h4>
        <h4><center>{searchData.startDate} - {searchData.endDate}</center></h4>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer style={{ marginLeft: '5px' }}>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'center'}>Route Name</TableCell>
                    <TableCell align={'center'}>Reg No</TableCell>
                    <TableCell align={'center'}>Name</TableCell>
                    <TableCell align={'center'}>Loan Amount (Rs)</TableCell>
                    <TableCell align={'center'}>Installments</TableCell>
                    <TableCell align={'center'}>Interest Rate</TableCell>
                    <TableCell align={'center'}>Start Date</TableCell>
                    <TableCell align={'center'}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loanHistoryList.map((data, index) => (
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
                        {data.principalAmount}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.numberOfInstalments}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.annualRate}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.loanIssuedDate.split('T')[0]}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.isPaymentCompleated == true?'Completed':'Ongoing'}
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

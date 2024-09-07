import React from "react";
import {
  Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Table
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
    const advanceIssueDetailList = this.props.advanceIssueDetailList;
    const advanceIssue = this.props.advanceIssue;
    const searchData = this.props.searchData;

    return (
      <div>
        <h3><center><u>ADVANCE ISSUE SIGNATURE SHEET</u></center></h3>
        <div>&nbsp;</div>
        <h4><center>Group: {searchData.groupName}</center></h4>
        <div>&nbsp;</div>
        <h4><center>Estate: {searchData.factoryName}</center></h4>
        <div>&nbsp;</div>
        <h4><center>Division: {searchData.divisionName}</center></h4>
        <div>&nbsp;</div>
        <h4><center>From Date: {advanceIssue.fromDate}</center></h4>
        <div>&nbsp;</div>
        <h4><center>To Date: {advanceIssue.toDate}</center></h4>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'left'} style={{ borderBottom: "none", border: '1px solid #595959', width: '10px' }}>Employee Number</TableCell>
                    <TableCell align={'left'} style={{ borderBottom: "none", border: '1px solid #595959', width: '25px' }}>Employee Name</TableCell>
                    <TableCell align={'left'} style={{ borderBottom: "none", border: '1px solid #595959', width: '10px' }}>Advance Amount (Rs.)</TableCell>
                    <TableCell align={'left'} style={{ borderBottom: "none", border: '1px solid #595959', width: '25px' }}>Signature</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {advanceIssueDetailList.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none", border: '1px solid #595959' }}>
                        {data.registrationNumber}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none", border: '1px solid #595959' }}>
                        {data.firstName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none", border: '1px solid #595959' }}>
                        {data.advanceAmount}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none", border: '1px solid #595959' }}>
                        {"........................................"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
        <div>&nbsp;</div>
      </div>
    );
  }
}

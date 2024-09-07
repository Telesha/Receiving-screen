import React from "react";
import {
  Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Table
} from '@material-ui/core';
export default class ComponentToPrint extends React.Component {

  render() {
    const advancePaymentData = this.props.advancedPaymentList;
    const advancedPaymentList = this.props.searchData;

    return (
      <div>
        <h2 style={{ textAlign: 'center' }}><u>Advanced Payment Details</u></h2>
        <div>&nbsp;</div>
        <h4 style={{ textAlign: 'center' }}>Group - {advancedPaymentList.groupName} </h4>
        <div>&nbsp;</div>
        <h4 style={{ textAlign: 'center' }}>Factory - {advancedPaymentList.factoryName}</h4>
        <div>&nbsp;</div>
        <h4 style={{ textAlign: 'center' }}>From Date ({advancedPaymentList.startDate}) To Date ({advancedPaymentList.endDate})</h4>
        <div>&nbsp;</div>
        <div></div>
        <Box minWidth={1050}>
          <TableContainer style={{ marginLeft: '5px' }}>
            <Table aria-label="caption table">
              <TableHead>
                <TableRow>
                  <TableCell align={'left'}>Date</TableCell>
                  <TableCell align={'left'}>Route Name</TableCell>
                  <TableCell align={'left'}>Register Number</TableCell>
                  <TableCell align={'left'}>Source</TableCell>
                  <TableCell align={'left'}>Status</TableCell>
                  <TableCell align={'left'}>Requested Amount(Rs)</TableCell>
                  <TableCell align={'left'}>Approved Amount(Rs)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {advancePaymentData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.effectiveDate.split('T')[0]}
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.routeName}
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.registrationNumber}
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.advanceRequestType == 1 ? "Mobile Advance" : data.advanceRequestType == 2 ? "Over Advance" : "Direct Advance"}
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.statusID == 1 ? "Pending" : data.statusID == 2 ? "Issue" : data.statusID == 3 ? "Reject" : data.statusID == 4 ? "Send_To_Deliver" : data.statusID == 5 ? "Autherized" : "Delivered"}
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.amount}
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.approvedAmount}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell align="left" style={{ fontWeight: 'bold' }} colSpan={6}>Total </TableCell>
                  <TableCell align="left" style={{ fontWeight: 'bold' }}>
                    {advancePaymentData.reduce((total, data) => total + data.approvedAmount, 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>
    );
  }
}

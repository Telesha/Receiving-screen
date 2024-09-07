import React from "react";
import {
  Box,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table
} from '@material-ui/core';
import tokenService from '../../../../utils/tokenDecoder';
import { format } from 'date-fns';

export default class ComponentToPrint extends React.Component {

  render() {
    const searchData = this.props.searchData;
    const searchDate = this.props.searchDate;
    const balancePaymentListData = this.props.balancePaymentListData;

    const currentDate = new Date();
    var createdBy = tokenService.getUserNameFromToken();

    const groupedData = balancePaymentListData.reduce((acc, data) => {
      if (!acc[data.routeName]) {
        acc[data.routeName] = [];
      }
      acc[data.routeName].push(data);
      return acc;
    }, {});

    const containerStyle = {
      display: 'flex',
      justifyContent: 'space-between',
    };

    const leftAlignStyle = {
      textAlign: 'left',
    };

    const rightAlignStyle = {
      textAlign: 'right',
    };

    return (
      <div>
        <h2><center><u>Balance Payment List Report</u></center></h2>
        <div>&nbsp;</div>
        <h2><center>{searchData.groupName} - {searchData.factoryName}</center></h2>
        <div>&nbsp;</div>
        <h3><center> Bought Leaf Balance Payment List the Month of {searchData.monthName} - {searchDate.year}</center></h3>
        <div>&nbsp;</div>
        <div style={containerStyle}>
          <h4 style={leftAlignStyle}>&nbsp;&nbsp;&nbsp;&nbsp;Created Date: {format(currentDate, 'dd/MM/yyyy HH:mm')}</h4>
          <h4 style={rightAlignStyle}>Created By: {createdBy}&nbsp;&nbsp;&nbsp;&nbsp;</h4>
        </div>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050} ml={2} mr={10} width="70%">
            <TableContainer style={{ padding: '0 20px', width: "100%", margin: "auto" }}>
              <div>
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'center'} style={{ border: "0.5px solid grey" }}>Registration Number</TableCell>
                      <TableCell align={'center'} style={{ border: "0.5px solid grey" }}>Supplier Name</TableCell>
                      <TableCell align={'center'} style={{ border: "0.5px solid grey" }}>Amount(Rs)</TableCell>
                      <TableCell align={'center'} style={{ border: "0.5px solid grey" }}>Signature</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(groupedData).map((routeName, index) => (
                      <React.Fragment key={index}>
                        <TableRow style={{ pageBreakBefore: "always" }}>
                          <TableCell align={'left'} colSpan={4} style={{ border: "0.5px solid grey" }}>
                            <strong>{routeName}</strong>
                          </TableCell>
                        </TableRow>
                        {groupedData[routeName].map((data, index) => (
                          <TableRow key={index}>
                            <TableCell align={'center'} component="th" scope="row" style={{ border: "0.5px solid grey" }}>
                              {data.registrationNumber}
                            </TableCell>
                            <TableCell align={'left'} component="th" scope="row" style={{ border: "0.5px solid grey", textAlign: "left" }}>
                              {data.firstName}
                            </TableCell>
                            <TableCell align={'right'} component="th" scope="row" style={{ border: "0.5px solid grey" }}>
                              {data.amount.toFixed(2)}
                            </TableCell>
                            <TableCell align={'center'} component="th" scope="row" style={{ border: "0.5px solid grey" }}>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TableContainer>
          </Box>
        </div>
        <div>&nbsp;</div>
        <h4><center>*******End of List*******</center></h4>
      </div>
    );

  }

}

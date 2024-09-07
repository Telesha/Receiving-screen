import React from "react";
import {
  Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Table
} from '@material-ui/core';
import moment from 'moment';
export default class ComponentToPrint extends React.Component {

  render() {
    const cashCountList = this.props.cashCountList;
    const coinTotal = this.props.coinTotal;
    const remainingValueTotal = this.props.remainingValueTotal;
    const selectedSearchValues = this.props.selectedSearchValues;
    const searchDate = this.props.searchDate;
    const prevTotalAmount = this.props.prevTotalAmount;
    const coinNames = this.props.coinNames;
    const columnTitles = this.props.columnTitles;

    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u>Denomination Report</u></center></h2>
          <div>&nbsp;</div>
          <h3><center>{selectedSearchValues.groupName} - {selectedSearchValues.factoryName} - {selectedSearchValues.routeName}</center></h3>
          <h3><center>({(searchDate.year === '' ? moment(new Date()).format('YYYY') : searchDate.year) - 1}/{(searchDate.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName)}-{searchDate.year === '' ? moment(new Date()).format('YYYY') : searchDate.year}/{(searchDate.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName)})</center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer style={{ marginLeft: '2rem' }} >
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      {columnTitles.map(title => (
                        <TableCell key={title} align='left'>{title}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cashCountList.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.registrationNumber}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.supplierName}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.amount.toFixed(2)}
                        </TableCell>
                        {data.cashCount.map((coin, index) => (
                          <TableCell key={coinNames[index]} align='left' component="th" scope="row" style={{ borderBottom: "none" }}>
                            {coin.coinCount}
                          </TableCell>
                        ))}
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.remainingValue}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableRow>
                    <TableCell align={'left'}><b>Total</b></TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b>{prevTotalAmount.toFixed(2)}</b>
                    </TableCell>
                    {coinTotal.map((coin, index) => (
                      <TableCell key={coinNames[index]} align='left' component="th" scope="row" style={{ borderBottom: "none" }}>
                        <b>{coin.coinCount}</b>
                      </TableCell>
                    ))}
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b>{remainingValueTotal}</b>
                    </TableCell>
                  </TableRow>
                </Table>
              </TableContainer>
            </Box>
          </div>
        </div></div>
    );
  }
}

import React from 'react';
import {
  Box,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
  render() {
    const valuationData = this.props.valuationData;
    const searchData = this.props.searchData;
    const netAmountTotal = this.props.netAmountTotal;

    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u>Valuation Report</u></center></h2>
          <div>&nbsp;</div>
          <h3><center>{searchData.groupName} - {searchData.factoryName}</center></h3>
          <div>&nbsp;</div>
          <h3><center>{searchData.startDate} - {searchData.endDate}</center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer style={{ marginLeft: '5px' }}>
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'center'}>Grade</TableCell>
                      <TableCell align={'center'}>Net Total Quantity (KG)</TableCell>
                      <TableCell align={'center'}>Received Value Per 1KG</TableCell>
                      <TableCell align={'center'}>Qty %</TableCell>

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {valuationData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.gradeName}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {(parseFloat(data.netAmount)).toFixed(2)}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {(parseFloat(data.valuePerKg)).toFixed(2)}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {(data.totalPercentage).toFixed(2)+ '%'}
                        </TableCell>
                      </TableRow>

                    ))}
                  </TableBody>
                  <TableRow>
                    <TableCell align={'center'}><b>Grand Total</b></TableCell>
                    <TableCell align={'center'} component="th" scope="row">
                      <b>{(parseFloat(netAmountTotal.netAmount)).toFixed(2)} </b>
                    </TableCell>

                  </TableRow>
                </Table>
              </TableContainer>
            </Box>
          </div>
          <div>
          </div>
        </div>
      </div>
    );
  }
}

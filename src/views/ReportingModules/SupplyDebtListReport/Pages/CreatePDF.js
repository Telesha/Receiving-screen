import React from "react";
import {
  Box, Card, Grid, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';
import moment from 'moment';

export default class ComponentToPrint extends React.Component {

  render() {
    const SupplyDebtInput = this.props.SupplyDebtInput;
    const SupplyDebtDetails = this.props.SupplyDebtDetails;
    const SearchData = this.props.SearchData;

    return (
      <div>
        <h3><center><u>Supply Debt List Report</u></center></h3>
        <div>&nbsp;</div>
        <h4><center>{SearchData.groupName} - {SearchData.factoryName}</center></h4>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer style={{ marginLeft: '5px' }}>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'left'}>Route Name</TableCell>
                    <TableCell align={'left'}>Registration Number</TableCell>
                    <TableCell align={'left'}>Customer Name</TableCell>
                    <TableCell align={'left'}>Last Month Crop (KG)</TableCell>
                    <TableCell align={'left'}>Todate Crop (KG)</TableCell>
                    <TableCell align={'left'}>Last Month Debt (Rs.)</TableCell>
                    <TableCell align={'left'}>Loan Balance (Rs.)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {SupplyDebtDetails.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.routeName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.registrationNumber}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.name}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.lastMonthCropWeight}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.thisTotal}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.debtAmount.toFixed(2)}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.loanTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
        <div>&nbsp;</div>
                <h3><center>***** End of List *****</center></h3>
      </div>
    );
  }
}

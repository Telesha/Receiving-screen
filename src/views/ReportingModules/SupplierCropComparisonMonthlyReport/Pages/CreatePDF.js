import React from "react";
import {
  Box, Card, Grid, TextField, Container, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';
import moment from 'moment';
export default class ComponentToPrint extends React.Component {

  render() {
    const supplierCropData = this.props.supplierCropData;
    const prevTotalAmount = this.props.prevTotalAmount;
    const curTotalAmount = this.props.curTotalAmount;
    const selectedSearchValues = this.props.selectedSearchValues;
    const searchDate = this.props.searchDate;

    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u>Supplier Crop Comparison Monthly Report</u></center></h2>
          <div>&nbsp;</div>
          <h3><center>{selectedSearchValues.groupName} - {selectedSearchValues.factoryName} - {selectedSearchValues.routeName}</center></h3>
          <h3><center>({(searchDate.year === '' ? moment(new Date()).format('YYYY') : searchDate.year) - 1}/{(searchDate.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName)}-{searchDate.year === '' ? moment(new Date()).format('YYYY') : searchDate.year}/{(searchDate.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName)})</center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer style={{ marginLeft: '5rem' }} >
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'left'}>Reg No</TableCell>
                      <TableCell align={'left'}>Customer Name</TableCell>
                      <TableCell align={'left'}>Crop(Kg)-{(searchDate.year === '' ? moment(new Date()).format('YYYY') : searchDate.year) - 1}/{(searchDate.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName)}</TableCell>
                      <TableCell align={'left'}>Crop(Kg)-{(searchDate.year === '' ? moment(new Date()).format('YYYY') : searchDate.year)}/{(searchDate.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName)}</TableCell>
                      <TableCell align={'left'}>Variance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supplierCropData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.registrationNumber}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.name}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.prevYearWeight}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.currentYearWeight}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {(data.currentYearWeight) - (data.prevYearWeight)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableRow>
                    <TableCell align={'left'}><b>Total</b></TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b>{prevTotalAmount}</b>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b>{curTotalAmount}</b>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {curTotalAmount - prevTotalAmount} </b>
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

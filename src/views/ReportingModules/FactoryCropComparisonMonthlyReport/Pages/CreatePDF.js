import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import {
  Box, Card, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';
import moment from 'moment';

export default class ComponentToPrint extends React.Component {

  render() {
    const searchData = this.props.searchData;
    const searchDate = this.props.searchDate;
    const factoryCropData = this.props.factoryCropData;
    const prevTotalSupp = this.props.prevTotalSupp;
    const curTotalSupp = this.props.curTotalSupp;
    const prevTotalCrop = this.props.prevTotalCrop;
    const curTotalCrop = this.props.curTotalCrop;


    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u>Factory Crop Comparison Monthly Report</u></center></h2>
          <div>&nbsp;</div>
          <h3><center>{searchData.groupName} {(searchDate.year === '' ? moment(new Date()).format('YYYY') : searchDate.year) - 1}/{searchDate.month === '' ? moment(new Date()).format('MMM') : searchData.monthName} - {searchDate.year === '' ? moment(new Date()).format('YYYY') : searchDate.year}/{searchDate.month === '' ? moment(new Date()).format('MMM') : searchData.monthName}</center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer style={{ marginLeft: '0rem' }} >
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'center'}></TableCell>
                      <TableCell align={'center'}>{(searchDate.year === '' ? moment(new Date()).format('YYYY') : searchDate.year) - 1}/{searchDate.month === '' ? moment(new Date()).format('MMM') : searchData.monthName}</TableCell>
                      <TableCell align={'center'}></TableCell>
                      <TableCell align={'center'}>{searchDate.year === '' ? moment(new Date()).format('YYYY') : searchDate.year}/{searchDate.month === '' ? moment(new Date()).format('MMM') : searchData.monthName}</TableCell>
                      <TableCell align={'center'}></TableCell>
                      <TableCell align={'center'}>Supplier Variance</TableCell>
                      <TableCell align={'center'}>Crop Varience</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align={'left'}>Factory</TableCell>
                      <TableCell align={'left'}>Active Suppliers</TableCell>
                      <TableCell align={'left'}>Crop (Kg)</TableCell>
                      <TableCell align={'left'}>Active Suppliers</TableCell>
                      <TableCell align={'left'}>Crop (Kg)</TableCell>
                      <TableCell align={'left'}></TableCell>
                      <TableCell align={'left'}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {factoryCropData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.factoryName}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.prevYearSupplierCount}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.prevYearWeight}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.currentYearSupplierCount}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.currentYearWeight}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {(data.currentYearSupplierCount - data.prevYearSupplierCount)}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.currentYearWeight - data.prevYearWeight}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableRow>
                    <TableCell align={'left'}><b>Total</b></TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b>{prevTotalSupp}</b>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b>{prevTotalCrop}</b>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {curTotalSupp} </b>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {curTotalCrop} </b>
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


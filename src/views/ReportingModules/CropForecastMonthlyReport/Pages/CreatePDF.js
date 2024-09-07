import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import {
  Box, Card, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';
import moment from 'moment';

export default class ComponentToPrint extends React.Component {

  render() {
    const monthlyCropData = this.props.monthlyCropData;
    const monthlyCropDetail = this.props.monthlyCropDetail;
    const searchData = this.props.searchData;
    const totalCrop = this.props.totalCrop;
    const totalCustomer = this.props.totalCustomer;

    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u>Crop Forecast Monthly Report</u></center></h2>
          <div>&nbsp;</div>
          <h3><center>{monthlyCropDetail.month === '' ? moment(new Date()).format('MMMM') : searchData.monthName} - {monthlyCropDetail.year === "" ? (moment(new Date()).format('YYYY') - 1) : monthlyCropDetail.year - 1}</center></h3>
          <div>&nbsp;</div>
          <h3><center>{searchData.groupName} - {searchData.factoryName}</center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer >
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'center'}>Year</TableCell>
                      <TableCell align={'center'}>Route Name</TableCell>
                      <TableCell align={'center'}>Crop Amount (KG)</TableCell>
                      <TableCell align={'center'}>Customer Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthlyCropData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {monthlyCropDetail.year === "" ? (moment(new Date()).format('YYYY') - 1) : monthlyCropDetail.year - 1}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.routeName}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.cropWeight}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.customerCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableRow>
                    <TableCell align={'center'}><b>Total</b></TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {totalCrop} </b></TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {totalCustomer} </b>
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

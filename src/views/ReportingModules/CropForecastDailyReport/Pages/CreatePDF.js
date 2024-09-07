import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import {
  Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Table,
  TableFooter
} from '@material-ui/core';
import moment from 'moment';
import {addDays} from 'date-fns';

export default class ComponentToPrint extends React.Component {

  render() {
    const dailyCropData = this.props.dailyCropData;
    const total = this.props.total;
    const searchData = this.props.searchData;
    const dailyCropDetail = this.props.dailyCropDetail;
    const earlyTotalAmount = this.props.earlyTotalAmount;
    const earlyCustomerCount = this.props.earlyCustomerCount;
    const beforeEarlyTotalAmount = this.props.beforeEarlyTotalAmount;
    const beforeEarlyCustomerCount = this.props.beforeEarlyCustomerCount;

    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u>Crop Forecast Daily Report</u></center></h2>
          <div>&nbsp;</div>
          <h3><center>{searchData.groupName} -  {searchData.factoryName} </center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer >
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'center'}></TableCell>
                      <TableCell align={'center'}></TableCell>
                      <TableCell align={'center'}>Early Round</TableCell>
                      <TableCell align={'center'}></TableCell>
                      <TableCell align={'center'}></TableCell>
                      <TableCell align={'center'}>Before Early Round</TableCell>
                      <TableCell align={'center'}></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align={'center'}>Route Name</TableCell>
                      <TableCell align={'center'}>Date</TableCell>
                      <TableCell align={'center'}>Crop Amount (KG)</TableCell>
                      <TableCell align={'center'}>Customer Count</TableCell>
                      <TableCell align={'center'}>Date</TableCell>
                      <TableCell align={'center'}>Crop Amount (KG)</TableCell>
                      <TableCell align={'center'}>Customer Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dailyCropData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.routeName}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {moment(addDays(new Date(dailyCropDetail.date), -(dailyCropDetail.roundValue))).format().split('T')[0]}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.earlyRoundWeight}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.earlyRoundCount}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {moment(addDays(new Date(dailyCropDetail.date), -(dailyCropDetail.roundValue * 2))).format().split('T')[0]}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.beforeEarlyRoundWeight}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.beforeEarlyRoundCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableRow>
                    <TableCell align={'center'}><b>Total</b></TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {earlyTotalAmount} </b></TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {earlyCustomerCount} </b></TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {beforeEarlyTotalAmount} </b>
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {beforeEarlyCustomerCount} </b>
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

import React from "react";
import {
  Box, Card, Grid, TextField, Container, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
    const cropPrecentageData = this.props.cropPrecentageData;
    const total = this.props.total;
    const totForPer = this.props.totForPer;
    const searchData = this.props.searchData;

    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u>Route Crop Percentage Report</u></center></h2>
          <div>&nbsp;</div>
          <h3><center>{searchData.groupName} - {searchData.factoryName}</center></h3>
          <div>&nbsp;</div>
          <h3><center>{searchData.startDate} - {searchData.endDate}</center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer style={{ marginLeft: '5rem' }} >
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'left'}>Route Name</TableCell>
                      <TableCell align={'left'}>Route Code</TableCell>
                      <TableCell align={'left'}>Dealer Qty (KG)</TableCell>
                      <TableCell align={'left'}>Dealer Per(%)</TableCell>
                      <TableCell align={'left'}>Small Qty (KG)</TableCell>
                      <TableCell align={'left'}>Small Per(%)</TableCell>
                      <TableCell align={'left'}>Estates Qty (KG)</TableCell>
                      <TableCell align={'left'}>Estates Per(%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cropPrecentageData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.routeName}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.routeCode}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.dealerQty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.dealerspercentage.toFixed(2) + '%'}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.supplierQty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.smallpercentage.toFixed(2) + '%'}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.estateQty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.estatepercentage.toFixed(2) + '%'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableRow>
                    <TableCell align={'left'}><b>Percentage</b></TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {total.dealersTotal + '%'} </b>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {total.supplierTotal + '%'} </b>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {total.estateTotal + '%'} </b>
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

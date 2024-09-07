import React from "react";
import {
  Box, TableBody, TableCell, TableHead, TableRow, Table,
} from '@material-ui/core';
export default class ComponentToPrint extends React.Component {

  render() {
    const dispatchSalesData = this.props.dispatchSalesData;
    const searchData = this.props.searchData;

    return (
      <div >
        <br />
        <h3><center><u>Deduction Summary Report</u></center></h3>
        <div className="row pl-2 pb-4 pt-4">
          <div>&nbsp;</div>
          <h3><center> Group: {searchData.groupName} Factoy:  {searchData.factoryName} Broker: {searchData.brokerName} </center></h3>
          <h3><center>  From Date:  {searchData.fromdate} To Date: {searchData.todate}</center></h3>
          <div>&nbsp;</div>
        </div>
        <div>
          <Box minWidth={1050}>
            <Table aria-label="caption table">
              <TableHead>
                <TableRow>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Invoice No</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Dispatch Date</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Selling Mark</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Grade</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Bag Weight</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>No of Bags</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Gross Weight</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Sample Allowa</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Net Weight</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Vehicle No</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Invoice Status</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Lot No</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Sale No</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Sale Date</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Valuation Price</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Sold Price</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Broker</TableCell>
                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Buyer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dispatchSalesData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.invoiceNo}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.dateofDispatched}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.sellingMarkID}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.gradeName}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.packWeight}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.numberOfBags}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.grossQuantity}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.sampleQuantity}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.netQuantity}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.vehicleID}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.statusID}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.lotNumber}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.salesNumber}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.sellingDate}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.value}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.salesRate}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.brokerID}
                    </TableCell>
                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      {data.buyerName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </div>
      </div>
    );
  }
}

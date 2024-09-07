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
    const tableItems = this.props.tableItems;
    const PurchaseDetails = this.props.PurchaseDetails;
    const totalNet = this.props.totalNet;
    const factoryDetails = this.props.factoryDetails;
    const supplierDetails = this.props.supplierDetails;

    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u><b>Purchase Order List</b></u></center></h2>
          <div>&nbsp;</div>
          <h3><center>Factory Name - {factoryDetails.factoryName}</center></h3>
          <div>&nbsp;</div>
          <h3><center>Supplier Name - {supplierDetails.supplierName}</center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer style={{ marginLeft: '5px' }}>
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'center'}>Item Category</TableCell>
                      <TableCell align={'center'}>Item Name</TableCell>
                      <TableCell align={'center'}>Description</TableCell>
                      <TableCell align={'center'}>Unit Price (Rs)</TableCell>
                      <TableCell align={'center'}>No of Units</TableCell>
                      <TableCell align={'center'}>Discount (Rs)</TableCell>
                      <TableCell align={'center'}>Amount (Rs)</TableCell>
                      <TableCell align={'center'}>Remark</TableCell>

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableItems.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.itemCategory}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.itemName}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.description}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {(parseFloat(data.unitPrice)).toFixed(2)}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.quantity}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {(parseFloat(data.totalDiscount)).toFixed(2)}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {((data.unitPrice * data.quantity)-data.totalDiscount).toFixed(2)}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.remarks}
                        </TableCell>
                        
                      </TableRow>

                    ))}
                  </TableBody>
                  <br /><br /><br />
                  <TableRow>
                    <TableCell /><TableCell /><TableCell /><TableCell /><TableCell /><TableCell />
                    <TableCell align={'right'}><b>Total Net (Rs) :</b></TableCell>
                    <TableCell align={'right'} component="th" scope="row">
                      <b>{(parseFloat(totalNet)).toFixed(2)} </b>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell /><TableCell /><TableCell /><TableCell /><TableCell /><TableCell />
                    <TableCell align={'right'}><b>TAX (Rs) :</b></TableCell>
                    <TableCell align={'right'} component="th" scope="row">
                      <b>{(parseFloat(PurchaseDetails.tax)).toFixed(2)} </b>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell /><TableCell /><TableCell /><TableCell /><TableCell /><TableCell />
                    <TableCell align={'right'}><b>Total (Rs) :</b></TableCell>
                    <TableCell align={'right'} component="th" scope="row">
                      <b>{((totalNet) + parseInt(PurchaseDetails.tax)).toFixed(2)}</b>
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

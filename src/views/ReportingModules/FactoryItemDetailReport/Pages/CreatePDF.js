import React from "react";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export default class ComponentToPrint extends React.Component {
  render() {
    const factoryItemList = this.props.factoryItemList;
    const searchData = this.props.searchData;
    return (
      <div>
        <style>
          {`
        @page {
            size: A4 portrait;
            margin-top: 0.75in;
            margin-bottom: 0.75in;
            margin-right: 0.5in;
            margin-left: 0.5in;
        }
    `}
        </style>
        <h3><u>Factory Item Details Report</u></h3>
        <br />
        <div className="row pl-2 pb-4 pt-4">
          <div className="col"><left><b>Group: </b> {searchData.groupName} </left></div>
          <div className="col"><left><b>Factory : </b> {searchData.factoryName}</left></div>
          <div className="col"><left><b>Date : </b> {searchData.startDate} - {searchData.endDate}</left></div>
        </div>
        <br />
        <TableContainer component={Paper}>
          <Table aria-label="simple table" size='small'>
            <TableHead>
              <TableRow>
                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Route Name</TableCell>
                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Date</TableCell>
                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Reg No</TableCell>
                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Supplier Name</TableCell>
                <TableCell align="left" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Category</TableCell>
                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Item</TableCell>
                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Quantity</TableCell>
                <TableCell align="right" style={{ fontSize: '10px', fontWeight: 'bold', border: '1px solid black', padding: '3px' }}>Total Price (Rs)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {factoryItemList.map((data, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {data.routeName}</TableCell>
                  <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {data.date.split('T')[0]}</TableCell>
                  <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {data.registrationNumber}</TableCell>
                  <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '8px' }}> {data.name}</TableCell>
                  <TableCell component="th" scope="row" align="left" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {data.categoryName}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {data.itemName}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {data.approvedQuantity}</TableCell>
                  <TableCell component="th" scope="row" align="right" style={{ fontSize: '10px', border: "1px solid black", padding: '4px' }}> {data.totalPrice.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
}



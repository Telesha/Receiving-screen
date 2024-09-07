import React from "react";
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
    const clientDetailListData = this.props.clientDetailListData;
    const selectedSearchValues = this.props.selectedSearchValues;


    return (
      <div>
        <br/>
        <h2><center><u>Supplier Registration Details Report</u></center></h2>
        <div>&nbsp;</div>
        <h2><center>{selectedSearchValues.groupName} - {selectedSearchValues.factoryName}</center></h2>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'left'}>Route Name</TableCell>
                    <TableCell align={'center'}>Reg No</TableCell>
                    <TableCell align={'left'}>Name</TableCell>
                    <TableCell align={'left'}>NIC</TableCell>
                    <TableCell align={'center'}>Contact No</TableCell>
                    <TableCell align={'left'}>Address</TableCell>
                    
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientDetailListData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.routeName}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.registrationNumber}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.name}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.nic}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.mobile}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.address}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
        <div>&nbsp;</div>
        <h4><center>*******End of List*******</center></h4>
      </div>
    );

  }

}

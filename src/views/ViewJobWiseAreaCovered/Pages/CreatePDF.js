import React from "react";
import {
  Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Table
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {

  render() {
    const routeSummaryData = this.props.routeSummaryData;
    const searchData = this.props.searchData;


    return (
      <div>
        <div style={{ width: '1500px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
        <h3><center><u>Job Wise Area Covered View Report</u></center></h3>
        <div>&nbsp;</div>
        <h4><center>{searchData.groupName} - {searchData.estateName} - {searchData.divisionName}</center></h4>
        <h4><center>{searchData.year} - {searchData.monthName}</center></h4>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer style={{ marginLeft: '5px' }}>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'left'}>Job Type</TableCell>
                    <TableCell align={'left'}>Feild Name</TableCell>
                    <TableCell align={'center'}>Area Covered</TableCell>
                    <TableCell align={'center'}>Remaining Areas</TableCell>
                    <TableCell align={'center'}>Leaf</TableCell>
                    <TableCell align={'center'}>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {routeSummaryData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.jobTypeID == 1 ? 'Sundry' : 'Pluking'}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.fieldName}              
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.areaCoverd}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.remainArea}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.leafTypeID == 1 ? 'Green Leaf' : '------'}
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
        </div>
      </div>
    );
  }
}

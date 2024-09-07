import React from "react";
import {
  Box,TableBody, TableCell, TableContainer, TableHead, TableRow, Table
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
     const FactoryLeafTempData = this.props.FactoryLeafTempData;
     const SelectedSearchValues = this.props.SelectedSearchValues;

    return (
      <div>
        <h3><center><u>Factory Leaf Entering Temp Report</u></center></h3>
        <div>&nbsp;</div>
        <h4><center>{SelectedSearchValues.groupName} - {SelectedSearchValues.factoryName}</center></h4>
        <div>&nbsp;</div>
        <h4><center>{SelectedSearchValues.date}</center></h4>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer style={{ marginLeft: '5px' }}>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'left'}>Customer Name</TableCell>
                    <TableCell align={'left'}>Reg. No</TableCell>
                    <TableCell align={'left'}>Collection</TableCell>
                    <TableCell align={'left'}>Units</TableCell>
                    <TableCell align={'left'}>Total Weight</TableCell>
                    <TableCell align={'left'}>Bag Deduction</TableCell>
                    <TableCell align={'left'}>Water Deduction</TableCell>
                    <TableCell align={'left'}>Course Leaf</TableCell>
                    <TableCell align={'left'}>Other Deduction</TableCell>
                    <TableCell align={'left'}>Total Deduction</TableCell>
                    <TableCell align={'left'}>Net Weight</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {FactoryLeafTempData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.firstName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.registrationNumber}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.collectionTypeName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.numberOfUnit}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.totalWeight}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.bagDeduction}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.waterDeduction}
                      </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.courseLeafe}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.otherDeduction}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.totalDeduction}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.netWeight}
                      </TableCell>                  
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
        <div>&nbsp;</div>
                <h3><center>***** End of List *****</center></h3>
      </div>
    );
  }
}

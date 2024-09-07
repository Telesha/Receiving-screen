import React from "react";
import {
  Box, Card, Grid, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
    const FactoryItemSumReportData = this.props.FactoryItemSumReportData;
    const SelectedSearchValues = this.props.SelectedSearchValues;


    return (
      <div>
        <h3><center><u>Factory Item Summary Report</u></center></h3>
        <div>&nbsp;</div>
        <h4><center>{SelectedSearchValues.groupName} - {SelectedSearchValues.factoryName}</center></h4>
        <div>&nbsp;</div>
        <h4><center>{SelectedSearchValues.startDate} - {SelectedSearchValues.endDate}</center></h4>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer style={{ marginLeft: '5px' }}>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'left'}>Route Name</TableCell>
                    <TableCell align={'left'}>Item Category</TableCell>
                    <TableCell align={'left'}>Factory Item</TableCell>
                    <TableCell align={'left'}>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {FactoryItemSumReportData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.routeName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.categoryName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.itemName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.quantity}
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

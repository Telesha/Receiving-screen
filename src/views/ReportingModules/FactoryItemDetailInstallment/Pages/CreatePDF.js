import React from "react";
import {
  Box, Card, Grid, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
    const factoryItemList = this.props.factoryItemList;
    const searchData = this.props.searchData;
    const allColumnNames = this.props.columnNames

    return (
      <div>
        <h3><center><u>Factory Item Details Installments Report</u></center></h3>
        <div>&nbsp;</div>
        <h4><center>{searchData.groupName} - {searchData.factoryName}</center></h4>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer style={{ marginLeft: '5px' }}>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    {
                      allColumnNames.map((object) => {
                        return (
                          <TableCell align={'left'}>{object.title}</TableCell>
                        )
                      })
                    }
                  </TableRow>
                </TableHead>
                <TableBody>
                  {factoryItemList.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.routeName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.date.split('T')[0]}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.registrationNumber}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.name}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.categoryName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.itemName}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.approvedQuantity}
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {
                          data[allColumnNames[7]["field"]] === undefined || data[allColumnNames[7]["field"]] === "" ?
                            "" :
                            data[allColumnNames[7]["field"]].toFixed(2)
                        }
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {
                          data[allColumnNames[8]["field"]] === undefined || data[allColumnNames[8]["field"]] === "" ?
                            "" :
                            data[allColumnNames[8]["field"]].toFixed(2)
                        }
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {
                          data[allColumnNames[9]["field"]] === undefined || data[allColumnNames[9]["field"]] === "" ?
                            "" :
                            data[allColumnNames[9]["field"]].toFixed(2)
                        }
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                        {data.totalPrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
      </div>
    );
  }
}

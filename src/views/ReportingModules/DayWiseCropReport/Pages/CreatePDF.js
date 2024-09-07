import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import {
  Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Table,
  TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

  render() {
    const dayWiseCropSupplyDetails = this.props.dayWiseCropSupplyDetails;
    const total = this.props.total;
    const searchData = this.props.searchData;
    const dayWiseCropSupplyInput = this.props.dayWiseCropSupplyInput;

    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u>Day Wise Crop Report</u></center></h2>
          <div>&nbsp;</div>
          <h3><center>{searchData.groupName} -  {searchData.factoryName}  {dayWiseCropSupplyInput.date}</center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer style={{ marginLeft: '5rem' }} >
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'left'}>Date</TableCell>
                      <TableCell align={'left'}>Route Name</TableCell>
                      <TableCell align={'left'}>Reg No</TableCell>
                      <TableCell align={'left'}>Supplier Name</TableCell>
                      <TableCell align={'left'}>Leaf Type</TableCell>
                      <TableCell align={'left'}>Net Amount (KG)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dayWiseCropSupplyDetails.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.cropCollectedDate}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.routeName}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.registrationNumber}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.name}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.collectionTypeName}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.netWeight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableRow>
                    <TableCell align={'left'}><b>Total</b></TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                    </TableCell>
                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                      <b> {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
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

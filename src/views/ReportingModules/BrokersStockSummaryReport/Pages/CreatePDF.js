import React from "react";
import {
    Box, TableBody, TableCell, TableContainer, TableRow, Table
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {

    render() {
        const searchData = this.props.searchData;
        const reportData = this.props.reportData;

        return (
          <div>
            <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
                <br></br>
                <h3><center><u>Brokers Stock Summary Report</u></center></h3>
                <div>&nbsp;</div>
                <h4><center>{searchData.groupName} - {searchData.factoryName}</center></h4>
                <h4><center>{searchData.startDate} - {searchData.endDate}</center></h4>
                <h4><center>Selling Mark - {searchData.sellingMark === undefined ? "All" : searchData.sellingMark}</center></h4>
                <h4><center>Broker Name - {searchData.brokerName === undefined ? "All" : searchData.brokerName} </center></h4>
                <div>&nbsp;</div>
                <div>
                    <hr />
                    <Box minWidth={1050}>
                      <TableContainer style={{ marginLeft: '5px', backgroundColor: '#ffffe0' }}>
                            <Table aria-label="caption table">
                                    <TableBody>
                                      <TableRow>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none", fontWeight: 'bold' }}>
                                          Description
                                        </TableCell>
                                        <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none", fontWeight: 'bold' }}>
                                          Value
                                        </TableCell>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          Opening Stock (Kg)
                                        </TableCell>
                                        <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {reportData.openingBalance}
                                        </TableCell>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                      </TableRow>

                                      <TableRow>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          Dispatch Quantity (Kg)
                                        </TableCell>
                                        <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {reportData.dispachQuantity}
                                        </TableCell>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                      </TableRow>

                                      <TableRow>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          Catalogue Quantity (Kg)
                                        </TableCell>
                                        <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {reportData.catalogueQuantity}
                                        </TableCell>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                      </TableRow>

                                      <TableRow>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          Pending Stock (Kg)
                                        </TableCell>
                                        <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                         {reportData.pendingStock}
                                        </TableCell>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                       </TableRow>

                                      <TableRow>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          Unsold Quantity (Kg)
                                        </TableCell>
                                        <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {reportData.unsoldQuantity}
                                        </TableCell>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                      </TableRow>

                                      <TableRow>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          Withdrawn Quantity (Kg)
                                        </TableCell>
                                        <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {reportData.withdrawnQuantity}
                                        </TableCell>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                       </TableRow>

                                      <TableRow>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          Return Quantity (Kg)
                                        </TableCell>
                                        <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {reportData.returnQuantity}
                                        </TableCell>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                      </TableRow>

                                      <TableRow>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          Denature Quantity (Kg)
                                        </TableCell>
                                        <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {reportData.denatureQuantity}
                                        </TableCell>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                       </TableRow>

                                      <TableRow>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none", fontWeight: 'bold' }}>
                                          Net Balance Stock (Kg)
                                        </TableCell>
                                        <TableCell align={'right'} width={"50px"} component="th" scope="row" style={{ borderBottom: "none", fontWeight: 'bold' }}>
                                          {reportData.netBalanceStock}
                                        </TableCell>
                                        <TableCell align={'left'} width={"150px"} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                      </TableRow> 
                      
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <hr />
              </div>
            </div>
            </div>
        );
    }
}

import React from "react";
import {
  Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Table
} from '@material-ui/core';
export default class ComponentToPrint extends React.Component {

  render() {
    const reportData = this.props.reportData;
    const searchData = this.props.searchData;
    const grandTotalData = this.props.grandTotalData;

    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u>Dispatch Details Report</u></center></h2>
          <h3><center>{searchData.groupName} - {searchData.factoryName} </center></h3>
          <h3><center>From:{searchData.startDate}</center></h3>
          <h3><center>To:{searchData.endDate}</center></h3>
          {searchData.sellingMarkName != null ? <>
            <h3><center>Selling Mark:{searchData.sellingMarkName}</center></h3>
          </> : null}
          {searchData.brokerName != null ? <>
            <h3><center>Broker Name:{searchData.brokerName}</center></h3>
          </> : null}
          
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer>
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'center'}>
                        Date
                      </TableCell>
                      <TableCell align={'center'}>
                        Invoice No
                      </TableCell>
                      <TableCell align={'center'}>
                        Selling Mark
                      </TableCell>
                      <TableCell align={'center'}>
                        Grade
                      </TableCell>
                      <TableCell align={'center'}>
                        Bag Weight(Kg)
                      </TableCell>
                      <TableCell align={'center'}>
                        No Of Bags
                      </TableCell>
                      <TableCell align={'center'}>
                        Gross Qty(Kg)
                      </TableCell>
                      <TableCell align={'center'}>
                        Sample Allowance
                      </TableCell>
                      <TableCell align={'center'}>
                        Nett Qty(Kg)
                      </TableCell>
                      <TableCell align={'center'}>
                        Vehicle
                      </TableCell>

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData != null || reportData.length != 0
                      ? reportData.map(item => (
                        <>
                          <TableRow
                            style={{ backgroundColor: '#ffffe0' }}>
                            <TableCell align={'center'}>{item.date}</TableCell>
                            <TableCell align={'center'} style={{ fontWeight: 'bold' }}>{item.invoiceNo}</TableCell>
                            <TableCell align={'center'}>{item.sellingMark}</TableCell>
                            <TableCell
                              align={'center'}
                            >
                              {item.grade}
                            </TableCell>
                            <TableCell align={'center'}>{item.bagWeight}</TableCell>
                            <TableCell align={'center'}>{item.noOfBags}</TableCell>
                            <TableCell align={'center'}>{item.grossQty}</TableCell>
                            <TableCell align={'center'}>{item.sampleAllowance}</TableCell>
                            <TableCell align={'center'}>{item.nettQty}</TableCell>
                            <TableCell align={'center'}>{item.vehicle}</TableCell>

                          </TableRow>
                        </>
                      ))
                      : null}
                  </TableBody>
                  {grandTotalData != null || grandTotalData.length != 0 ?
                    <>
                      <TableRow style={{ background: '#ADD8E6' }}>
                        <TableCell
                          align={'center'}
                          component="th"
                          scope="row"
                          style={{ fontWeight: 'bold' }}
                        >Grand Total
                        </TableCell>
                        <TableCell
                          align={'center'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >
                        </TableCell>
                        <TableCell
                          align={'center'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >
                        </TableCell>
                        <TableCell
                          align={'center'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >
                        </TableCell>
                        <TableCell
                          align={'center'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >{grandTotalData.bagWeightTotal}
                        </TableCell>
                        <TableCell
                          align={'center'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >{grandTotalData.noOfBagTotal}
                        </TableCell>
                        <TableCell
                          align={'center'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >{grandTotalData.grossQtyTotal}
                        </TableCell>
                        <TableCell
                          align={'center'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >{grandTotalData.saTotal}
                        </TableCell>
                        <TableCell
                          align={'center'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >{grandTotalData.nettQtyTotal}
                        </TableCell>
                        <TableCell
                          align={'center'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >
                        </TableCell>
                      </TableRow>
                    </>
                    : null}
                </Table>
              </TableContainer>
            </Box>
          </div>
        </div></div>
    );
  }
}

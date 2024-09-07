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
          <h2><center><u>Buyer Wise Sales Details Report</u></center></h2>
          <h3><center>{searchData.groupName} - {searchData.factoryName} </center></h3>
          <h3><center>From:{searchData.startDate}</center></h3>
          <h3><center>To:{searchData.endDate}</center></h3>
          <h3><center>Selling Mark:{searchData.sellingMarkName}</center></h3>
          <h3><center>Broker Name:{searchData.brokerName}</center></h3>

          <h3><center>Type Of Sale: {searchData.typeOfSale == 1 ? "All" : null}</center></h3>
          <h3><center>Type Of Grade: {searchData.typeOfGrade == 1 ? "All" : null}</center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer>
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'center'}>
                        Selling Mark
                      </TableCell>
                      <TableCell align={'center'}>
                        Buyer Name
                      </TableCell>
                      <TableCell align={'center'}>
                        Broker Name
                      </TableCell>
                      <TableCell align={'center'}>
                        Grade
                      </TableCell>
                      <TableCell align={'center'}>
                        Qty (Kg)
                      </TableCell>
                      <TableCell align={'center'}>
                        Qty (%)
                      </TableCell>
                      <TableCell align={'center'}>
                        Average (Rs)
                      </TableCell>

                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData != null || reportData.length != 0
                      ? reportData.map(item => (
                        <>
                          <TableRow
                            style={{ backgroundColor: '#ffffe0' }}
                          >
                            <TableCell align={'center'}>{item.sellingMarkName}</TableCell>
                            <TableCell align={'center'}>{item.buyerName}</TableCell>
                            <TableCell align={'center'}>{item.brokerName}</TableCell>
                            <TableCell align={'center'} style={{ fontWeight: 'bold' }}>{item.gradeName}</TableCell>
                            <TableCell align={'center'}>{item.qtyAmount}</TableCell>
                            <TableCell
                              align={'center'}
                            >
                              {item.qtyPercentage}
                            </TableCell>
                            <TableCell align={'center'}>{item.average}</TableCell>
                          </TableRow>
                        </>
                      ))
                      : null}
                  </TableBody>

                  {grandTotalData != null || grandTotalData.length != 0
                    ?
                    <>
                      <TableRow style={{ background: '#ADD8E6' }}>
                        <TableCell
                          align={'center'}
                          component="th"
                          scope="row"
                          style={{ fontWeight: 'bold' }}
                        >Total
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
                        >{grandTotalData.qtyAmountTotal}
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
                        >{grandTotalData.averageTotal}
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

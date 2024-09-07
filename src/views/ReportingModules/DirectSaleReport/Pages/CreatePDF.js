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
          <h2><center><u>Direct Sale Report</u></center></h2>
          <h3><center>{searchData.groupName} - {searchData.factoryName} </center></h3>
          <h3><center>From:{searchData.startDate}</center></h3>
          <h3><center>To:{searchData.endDate}</center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer>
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'left'}>
                        Date
                      </TableCell>
                      <TableCell align={'left'}>
                        Invoice No
                      </TableCell>
                      <TableCell align={'left'}>
                        Customer Name
                      </TableCell>
                      <TableCell align={'left'}>
                        Grade
                      </TableCell>
                      <TableCell align={'left'}>
                        Unit Price
                      </TableCell>
                      <TableCell align={'left'}>
                        Quantity
                      </TableCell>
                      <TableCell align={'left'}>
                        Amount
                      </TableCell>
                      {/* <TableCell align={'left'}>
                        Average
                      </TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData != null || reportData.length != 0
                      ? reportData.map(item => (
                        <>
                          <TableRow
                            style={{ backgroundColor: '#ffffe0' }}
                          >
                            <TableCell align={'left'}>{item.dateOfSelling}</TableCell>
                            <TableCell align={'left'} style={{ fontWeight: 'bold' }}>{item.invoiceNumber}</TableCell>
                            <TableCell align={'left'}>{item.customerName}</TableCell>
                            <TableCell
                              align={'left'}
                            >
                              {item.gradeName}
                            </TableCell>
                            <TableCell align={'left'}>{item.unitPrice}</TableCell>
                            <TableCell align={'left'}>{item.quantity}</TableCell>
                            <TableCell align={'left'}>{item.amount}</TableCell>
                            {/* <TableCell align={'left'}>{item.average}</TableCell> */}
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
                          align={'left'}
                          component="th"
                          scope="row"
                          style={{ fontWeight: 'bold' }}
                        >Total
                        </TableCell>
                        <TableCell
                          align={'left'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >
                        </TableCell>
                        <TableCell
                          align={'left'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        ></TableCell>
                        <TableCell
                          align={'left'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        ></TableCell>
                        <TableCell
                          align={'left'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        ></TableCell>
                        <TableCell
                          align={'left'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >{grandTotalData.quantityTotal.toFixed(2)}
                        </TableCell>
                        <TableCell
                          align={'left'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >{grandTotalData.amountTotal.toFixed(2)}
                        </TableCell>
                        {/* <TableCell
                          align={'left'}
                          component="th"
                          scope="row"
                          style={{ borderBottom: 'none' }}
                        >
                        </TableCell> */}
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

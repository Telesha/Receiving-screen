import React from 'react';
import {
  Box, TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
} from '@material-ui/core';
import CountUp from 'react-countup';

export default class ComponentToPrint extends React.Component {
  render() {
    const auditReportData = this.props.auditReportData;
    const searchData = this.props.searchData;
    const groupedData = this.props.groupedData;
    return (
      <div>
        <div
          style={{
            width: '1093px',
            height: '1059px',
            padding: '20px',
            marginBottom: '14rem'
          }}
        >
          <br />
          <h2 style={{marginBottom:'15px'}}>
            <center>
              <u>Audit Report</u>
            </center>
          </h2>
          <h3>
            <center>
              {' '}
              Estate Name: {searchData.factoryName}
              Date:{' '}{searchData.startDate} - {searchData.endDate}
              {searchData.accountType != undefined ?
                ' Account Type: ' : null}
              {searchData.accountType != undefined ?
                searchData.accountType : null}
            </center>
          </h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer >
                <Table aria-label="caption table">
                  <TableHead></TableHead>
                  <TableBody>
                    {auditReportData.map((data, index) => (
                      <TableContainer key={index}>
                        <Table aria-label="caption table">
                          <TableRow
                            style={{
                              backgroundColor: '#B0C4DE',
                              fontWeight: 'bold'
                            }}
                          >
                            <TableCell align={'center'}>
                              Account Name: {data.ledgerAccountName}
                            </TableCell>
                            <TableCell align={'center'}>
                              Account Code: {data.ledgerAccountCode}
                            </TableCell>
                            <TableCell align={'center'}>
                              Opening Balance: {data.totalDebit}
                            </TableCell>
                          </TableRow>
                        </Table>
                        <Table>
                          <TableRow>
                            <TableCell align={'center'}>Voucher</TableCell>
                            <TableCell align={'center'}>Date</TableCell>
                            <TableCell align={'center'}>Description</TableCell>

                            <TableCell align={'center'}>
                              Cheque Number
                            </TableCell>
                            <TableCell align={'right'}>Debit Amount</TableCell>
                            <TableCell align={'right'}>
                              Credit Amount
                            </TableCell>
                          </TableRow>
                          {data.auditReportList.map((data1, index) => (
                            <TableRow key={index}>
                              <TableCell
                                align={'center'}
                                component="th"
                                scope="row"
                                style={{ borderBottom: 'none' }}
                              >
                                {data1.voucherCodeRefNumber}
                              </TableCell>
                              <TableCell
                                align={'center'}
                                component="th"
                                scope="row"
                                style={{ borderBottom: 'none' }}
                              >
                                {data1.date.split('T')[0]}
                              </TableCell>
                              <TableCell
                                align={'center'}
                                component="th"
                                scope="row"
                                style={{ borderBottom: 'none' }}
                              >
                                {data1.description}
                              </TableCell>
                              <TableCell
                                align={'center'}
                                component="th"
                                scope="row"
                                style={{ borderBottom: 'none' }}
                              >
                                {data1.chequeNumber}
                              </TableCell>
                              <TableCell
                                align={'right'}
                                component="th"
                                scope="row"
                                style={{ borderBottom: 'none' }}
                              >
                                <CountUp
                                  end={data1.debit}
                                  separator=","
                                  decimals={2}
                                  decimal="."
                                  duration={0.1}
                                />
                              </TableCell>
                              <TableCell align={'right'}>
                                <CountUp
                                  end={data1.credit}
                                  separator=","
                                  decimals={2}
                                  decimal="."
                                  duration={0.1}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow bgcolor="#FFFFE0">
                            <TableCell align={'center'}>
                              <b>Total</b>
                            </TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'right'}>
                              <CountUp
                                end={Number(
                                  data.auditReportList.debit == undefined
                                    ? '0'
                                    : data.auditReportList.debit
                                )}
                                separator=","
                                decimals={2}
                                decimal="."
                                duration={0.1}
                              />
                            </TableCell>
                            <TableCell align={'right'}>
                              <CountUp
                                end={Number(
                                  data.auditReportList.credit == undefined
                                    ? '0'
                                    : data.auditReportList.credit
                                )}
                                separator=","
                                decimals={2}
                                decimal="."
                                duration={0.1}
                              />
                            </TableCell>
                            <TableCell align={'left'}></TableCell>
                          </TableRow>
                          <TableRow bgcolor="#D3D3D3">
                            <TableCell align={'center'}>
                              <b>Closing Balance</b>
                            </TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'right'}>
                              <CountUp
                                end={Number(
                                  data.totalCredit == undefined
                                    ? '0'
                                    : data.totalCredit
                                )}
                                separator=","
                                decimals={2}
                                decimal="."
                                duration={0.1}
                              />
                            </TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'left'}></TableCell>
                          </TableRow>
                          <br></br>
                          <br></br>
                        </Table>
                      </TableContainer>
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

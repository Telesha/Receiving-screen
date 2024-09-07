import React from 'react';
import {
  Box,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  TableFooter
} from '@material-ui/core';
import moment from 'moment';
import CountUp from 'react-countup';

export default class ComponentToPrint extends React.Component {
  render() {
    const totalAmount = this.props.totalAmount;
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
          <h2>
            <center>
              <u>Journal Observation Report</u>
            </center>
          </h2>
          <h3>
            <center>
              {searchData.groupName} - {searchData.factoryName}{' '}
              {searchData.startDate} - {searchData.endDate}
            </center>
          </h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer>
                <Table aria-label="caption table">
                  <TableHead style={{ backgroundColor: '#B0C4DE' }}>
                    <TableCell align={'center'}>Voucher Code</TableCell>
                    <TableCell align={'center'}>Date</TableCell>
                    <TableCell align={'center'}>Transaction Mode</TableCell>
                    <TableCell align={'center'}>Cheque / Fund Transfer Number</TableCell>
                    <TableCell align={'center'}>Ledger Account Code</TableCell>
                    <TableCell align={'center'}>Ledger Account Name</TableCell>
                    <TableCell align={'center'}>Description</TableCell>
                    <TableCell align={'right'}>Debit</TableCell>
                    <TableCell align={'right'}>Credit</TableCell>
                  </TableHead>
                  {/* {data.reportList.map((data1, index) => ( */}
                  <TableBody>
                    {groupedData != null || groupedData.length != 0
                      ? groupedData.map(item => (
                        <>
                          {item.reportList.map((data1, index) => (
                            <TableRow>
                              {index == 0 ? (
                                <>
                                  <TableCell
                                    align={'center'}
                                    rowSpan={item.reportList.length}
                                  >
                                    {item.referenceNumber}
                                  </TableCell>
                                  <TableCell
                                    align={'center'}
                                    rowSpan={item.reportList.length}
                                  >
                                    {
                                      moment(item.createdDate.toString())
                                        .format()
                                        .split('T')[0]
                                    }
                                  </TableCell>
                                  <TableCell
                                    align={'center'}
                                    rowSpan={
                                      item.reportList.length
                                    }
                                  >
                                    {item.transactionModeID === 1 ? "Cheque"
                                      : item.transactionModeID === 2 ? "Fund Transfer"
                                        : item.transactionModeID === 3 ? "Cash"
                                          : "-"}
                                  </TableCell>
                                  <TableCell
                                    align={'center'}
                                    rowSpan={item.reportList.length}
                                  >
                                    {item.chequeNumber}
                                  </TableCell>
                                </>
                              ) : null}

                              <TableCell align={'center'}>
                                {data1.ledgerAccountCode}
                              </TableCell>
                              <TableCell align={'center'}>
                                {data1.ledgerAccountName}
                              </TableCell>
                              <TableCell align={'center'}>
                                {data1.description}
                              </TableCell>
                              <TableCell align={'right'}>
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
                          <TableRow style={{ backgroundColor: '#ffffe0' }}>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell
                              align={'right'}
                              style={{ fontWeight: 'bold' }}
                            >
                              Total
                            </TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell align={'center'}></TableCell>
                            <TableCell
                              align={'right'}
                              style={{ fontWeight: 'bold' }}
                            >
                              <CountUp
                                end={Number(
                                  item.reportList.debit == undefined
                                    ? '0'
                                    : item.reportList.debit
                                )}
                                separator=","
                                decimals={2}
                                decimal="."
                                duration={0.1}
                              />
                            </TableCell>
                            <TableCell
                              align={'right'}
                              style={{ fontWeight: 'bold' }}
                            >
                              <CountUp
                                end={Number(
                                  item.reportList.credit == undefined
                                    ? '0'
                                    : item.reportList.credit
                                )}
                                separator=","
                                decimals={2}
                                decimal="."
                                duration={0.1}
                              />
                            </TableCell>
                          </TableRow>
                        </>
                      ))
                      : null}
                  </TableBody>

                  <TableFooter bgcolor="#F5F5F5">
                    <TableCell align={'center'}>
                      <b>Final Total</b>
                    </TableCell>
                    <TableCell align={'center'}></TableCell>
                    <TableCell align={'center'}></TableCell>
                    <TableCell align={'center'}></TableCell>
                    <TableCell align={'center'}></TableCell>
                    <TableCell align={'center'}></TableCell>
                    <TableCell align={'right'}>
                      <b>
                        <CountUp
                          end={totalAmount.debitTotal}
                          separator=","
                          decimals={2}
                          decimal="."
                          duration={0.1}
                        />
                      </b>
                    </TableCell>

                    <TableCell align={'right'}>
                      <b>
                        <CountUp
                          end={totalAmount.creditTotal}
                          separator=","
                          decimals={2}
                          decimal="."
                          duration={0.1}
                        />
                      </b>
                    </TableCell>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Box>
          </div>
        </div>
      </div>
    );
  }
}

import React from 'react';
import {
  Box,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table
} from '@material-ui/core';
import CountUp from 'react-countup';

export default class ComponentToPrint extends React.Component {
  CalBalance(openingBalance, debit, credit) {
    let balance = 0;

    if (openingBalance.totalDebit - openingBalance.totalCredit >= 0) {
      balance =
        openingBalance.totalDebit - openingBalance.totalCredit + debit - credit;
    } else {
      balance =
        openingBalance.totalCredit - openingBalance.totalDebit + credit - debit;
    }
    return balance;
  }
  render() {
    const TransactionDetails = this.props.TransactionDetails;
    const PdfExcelGeneralDetails = this.props.PdfExcelGeneralDetails;
    const openingBalance = this.props.openingBalance;

    let currentBalance = this.CalBalance(openingBalance, 0, 0);
    return (
      <div>
        <h3>
          <center>
            <u>Ledger Account Reviewing Report</u>
          </center>
        </h3>
        <div>&nbsp;</div>
        <h2>
          <center>
            <u>
              Group: {PdfExcelGeneralDetails.groupName} - Estate:{' '}
              {PdfExcelGeneralDetails.factoryName}
            </u>
          </center>
        </h2>
        <div>&nbsp;</div>
        <h2>
          <center>
            <u>
              From {PdfExcelGeneralDetails.fromDate} To{' '}
              {PdfExcelGeneralDetails.endDate}
            </u>
          </center>
        </h2>
        <div>&nbsp;</div>
        <div>
          <Box minWidth={1050}>
            <TableContainer>
              <Table aria-label="caption table">
                <TableHead>
                  <TableRow>
                    <TableCell align={'center'}>Receipt No</TableCell>
                    <TableCell align={'center'}>Date</TableCell>
                    <TableCell align={'center'}>Description</TableCell>
                    <TableCell align={'center'}>Cheque No</TableCell>
                    <TableCell align={'right'}>Debit(Rs.)</TableCell>
                    <TableCell align={'right'}>Credit(Rs.)</TableCell>
                    <TableCell align={'right'}>Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TransactionDetails.map((data, index) => {
                    currentBalance = this.CalBalance(
                      openingBalance,
                      data.debit,
                      data.credit
                    );
                    return (
                      <TableRow key={index}>
                        <TableCell align={'center'}>
                          {data.referenceNumber}
                        </TableCell>
                        <TableCell align={'center'}>
                          {data.date.split('T')[0]}
                        </TableCell>
                        <TableCell align={'center'}>
                          {data.description ? data.description : '-'}
                        </TableCell>
                        <TableCell align={'center'}>
                          {data.modeoftransactionNumber
                            ? data.modeoftransactionNumber
                            : '-'}
                        </TableCell>
                        <TableCell align={'right'}>
                          <CountUp
                            end={data.debit}
                            separator=","
                            decimals={2}
                            decimal="."
                            duration={0.1}
                          />
                        </TableCell>
                        <TableCell align={'right'}>
                          <CountUp
                            end={data.credit}
                            separator=","
                            decimals={2}
                            decimal="."
                            duration={0.1}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <CountUp
                            end={currentBalance}
                            separator=","
                            decimals={2}
                            decimal="."
                            duration={0.1}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
        <div>&nbsp;</div>
        <h3>
          <center>***** End of List *****</center>
        </h3>
      </div>
    );
  }
}

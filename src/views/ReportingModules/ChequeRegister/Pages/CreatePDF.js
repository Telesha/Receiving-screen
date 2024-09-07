import React from 'react';
import {
  Box,
  Card,
  Grid,
  TextField,
  Container,
  CardContent,
  Divider,
  CardHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  TableFooter
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
  render() {
    const chequeRegisterData = this.props.chequeRegisterData;
    const total = this.props.total;
    const totForPer = this.props.totForPer;
    const searchData = this.props.searchData;

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
              <u>Cheque Register Report</u>
            </center>
          </h2>
          <h3>
            <center>
              {' '}
              Estate Name: {searchData.factoryID} Date: {searchData.startDate}{' '}
              - {searchData.endDate} Account Type: {searchData.ledgerAccountID}
            </center>
          </h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer style={{ marginLeft: '5rem' }}>
                <Table aria-label="caption table">
                  <TableHead>
                    <TableCell align={'center'}>Cheque Number</TableCell>
                    <TableCell align={'center'}>Voucher Code</TableCell>
                    <TableCell align={'center'}>Date</TableCell>
                    <TableCell align={'center'}>Amount</TableCell>
                  </TableHead>
                  <TableBody>
                    {chequeRegisterData.map((data, index) => (
                      <>
                        {data.voucherCode != null ? (
                          <TableRow key={index}>
                            <TableCell
                              align={'center'}
                              component="th"
                              scope="row"
                              style={{ borderBottom: 'none' }}
                            >
                              {data.chequeNumber}
                            </TableCell>
                            <TableCell
                              align={'center'}
                              component="th"
                              scope="row"
                              style={{ borderBottom: 'none' }}
                            >
                              {data.voucherCode}
                            </TableCell>
                            <TableCell
                              align={'center'}
                              component="th"
                              scope="row"
                              style={{ borderBottom: 'none' }}
                            >
                              {data.date.split('T')[0]}
                            </TableCell>
                            <TableCell
                              align={'center'}
                              component="th"
                              scope="row"
                              style={{ borderBottom: 'none' }}
                            >
                              {data.credit}
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow bgcolor="#FF7F7F" key={index}>
                            <TableCell
                              align={'center'}
                              component="th"
                              scope="row"
                              style={{ borderBottom: 'none' }}
                            >
                              {data.chequeNumber}
                            </TableCell>
                            <TableCell
                              align={'center'}
                              component="th"
                              scope="row"
                              style={{ borderBottom: 'none' }}
                            ></TableCell>
                            <TableCell
                              align={'center'}
                              component="th"
                              scope="row"
                              style={{ borderBottom: 'none' }}
                            ></TableCell>
                            <TableCell
                              align={'center'}
                              component="th"
                              scope="row"
                              style={{ borderBottom: 'none' }}
                            ></TableCell>
                          </TableRow>
                        )}
                      </>
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

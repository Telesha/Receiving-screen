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
  TableFooter,
  makeStyles
} from '@material-ui/core';
import moment from 'moment';
import Paper from '@material-ui/core/Paper';
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  colorCancel: {
    backgroundColor: 'red'
  },
  colorRecord: {
    backgroundColor: 'green'
  },
  bold: {
    fontWeight: 600
  }
}));

export default class ComponentToPrint extends React.Component {
  render() {

    const reportData = this.props.ReportData;
    const cashFlowReportDetails = this.props.CashFlowReportDetails;
    const total = this.props.total;
    
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
              <u>Cash Flow Report</u>
            </center>
          </h2>
          <h3>
            <center></center>
          </h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead style={{ backgroundColor: '#C1E5FF' }}>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell align="center" size="small">
                        Amount
                      </TableCell>
                      <TableCell align="center" size="small"></TableCell>
                      <TableCell align="center" size="small"></TableCell>
                      <TableCell align="center" size="small"></TableCell>
                      <TableCell align="center" size="small"></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell align="center" size="small">
                        /Rs
                      </TableCell>
                      <TableCell align="center" size="small"></TableCell>
                      <TableCell align="center" size="small"></TableCell>
                      <TableCell align="center" size="small"></TableCell>
                      <TableCell align="center" size="small"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.map(row => (
                      <>
                        <TableRow
                          key={row.cashFlowParentSectionID}
                          style={{ backgroundColor: '#D4F7C4' }}
                        >
                          <TableCell
                            component="th"
                            scope="row"
                            style={{ fontWeight: 'bold' }}
                          >
                            {row.cashFlowParentSectionName}
                          </TableCell>
                          <TableCell align="center" size="small"></TableCell>
                          <TableCell align="center" size="small"></TableCell>
                          <TableCell align="center" size="small"></TableCell>
                          <TableCell align="center" size="small"></TableCell>
                          <TableCell align="center" size="small"></TableCell>
                        </TableRow>
                        {row.childList.map(item => (
                          <>
                            <TableRow key={item.cashFlowChildSectionID}>
                              <TableCell
                                component="th"
                                scope="row"
                                style={{ fontWeight: 'bold' }}
                              >
                                <SubdirectoryArrowRightIcon />
                                {item.cashFlowChildSectionName}
                              </TableCell>
                              <TableCell
                                align="center"
                                size="small"
                              ></TableCell>
                              <TableCell
                                align="center"
                                size="small"
                              ></TableCell>
                              <TableCell
                                align="center"
                                size="small"
                              ></TableCell>
                              <TableCell
                                align="center"
                                size="small"
                              ></TableCell>
                              <TableCell
                                align="center"
                                size="small"
                              ></TableCell>
                            </TableRow>
                            {item.ledgerAccountList.map(item => (
                              <TableRow key={item.ledgerAccountID}>
                                <TableCell component="th" scope="row">
                                  &emsp;&emsp;&emsp;
                                  {item.ledgerAccountName}
                                </TableCell>
                                <TableCell align="center" size="small">
                                  {item.balance}
                                </TableCell>
                                <TableCell align="center" size="small">
                                </TableCell>
                                <TableCell
                                  align="center"
                                  size="small"
                                ></TableCell>
                                <TableCell
                                  align="center"
                                  size="small"
                                ></TableCell>
                                <TableCell
                                  align="center"
                                  size="small"
                                ></TableCell>
                              </TableRow>
                            ))}
                          </>
                        ))}
                        <TableRow>
                          <TableCell
                            component="th"
                            scope="row"
                            style={{ fontWeight: 'bold' }}
                          >
                            Total Amount
                          </TableCell>
                          <TableCell
                            align="center"
                            size="small"
                            style={{ fontWeight: 'bold' }}
                          >
                            {total}
                          </TableCell>
                          <TableCell
                            align="center"
                            size="small"
                          >

                          </TableCell>
                          <TableCell
                            align="center"
                            size="small"
                          ></TableCell>
                          <TableCell
                            align="center"
                            size="small"
                          ></TableCell>
                          <TableCell
                            align="center"
                            size="small"
                          ></TableCell>
                        </TableRow>
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

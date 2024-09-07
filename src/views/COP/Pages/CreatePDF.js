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
    const COPReportDetails = this.props.COPReportDetails;
    const classes = this.props.UseStyles;
    const searchData = this.props.searchData;

    return (
      <div>
        <div
          style={{
            width: '1090px',
            height: '1059px',
            padding: '20px',
            marginBottom: '14rem'
          }}
        >
          <br />
          <h2><center><u>COP Report</u></center></h2>
          <h3><center>{searchData.groupName} - {searchData.factoryName}  {searchData.startDate} - {searchData.endDate}</center></h3>
          <div>&nbsp;</div>
          <div>
            <Grid display="flex" flexDirection="row-reverse" container xs={12}>
              <Grid display="flex" flexDirection="row-reverse" item xs spacing={0}>
                <TableContainer component={Paper}>
                  <Table aria-label="spanning table">
                    <TableHead style={{ backgroundColor: "#C1E5FF" }}>
                      <TableRow>
                        <TableCell style={{ fontSize: '18px', backgroundColor: '#FFFFFF' }} align="center" size="small" colSpan={3}>
                          From To
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="center" size="small" colSpan={3}>
                          Made Tea Quantity (Kg): {COPReportDetails.madeTeaToFrom}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell component="th" scope="row" size="small" ></TableCell>
                        <TableCell align="right" size="small" >Amount(Rs)</TableCell>
                        <TableCell align="right" size="small" >COP/Rs</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        reportData.copReportToFrom.map((row) => (
                          <>
                            <TableRow
                              style={{
                                backgroundColor: "#D4F7C4"
                              }}
                            >
                              <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>
                                {row.copParentSectionName}
                              </TableCell>
                              <TableCell align="right" />
                              <TableCell align="right" />
                            </TableRow>
                            {
                              row.childList.map(item => (
                                <>
                                  <TableRow key={item.copChildSectionID}>
                                    <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>
                                      <SubdirectoryArrowRightIcon />
                                      {item.copChildSectionName}
                                    </TableCell>
                                    <TableCell align="right" />
                                    <TableCell align="right" />
                                  </TableRow>

                                  {
                                    item.ledgerAccountList.map(item => (
                                      <TableRow key={item.ledgerAccountID}>
                                        <TableCell component="th" scope="row">
                                          {item.ledgerAccountName}
                                        </TableCell>
                                        <TableCell align="right">{item.balance.toFixed(2)}</TableCell>
                                        <TableCell align="right">
                                          {
                                            item.balance > 0 ? (
                                              <>
                                                {(
                                                  COPReportDetails.madeTeaToFrom /
                                                  item.balance
                                                ).toFixed(2)}
                                              </>
                                            ) : null
                                          }
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  }
                                </>
                              ))
                            }
                          </>
                        ))
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>


              {
                COPReportDetails.isCheckedThisMonth == true ? (
                  reportData.copReportThisMonth != 0 ? (
                    <Grid item xs spacing={0}>
                      <TableContainer component={Paper}>
                        <Table aria-label="spanning table">
                          <TableHead style={{ backgroundColor: "#C1E5FF" }}>
                            <TableRow>
                              <TableCell style={{ fontSize: '18px', backgroundColor: '#FFFFFF' }} size="small" align="center" colSpan={3}>
                                This Month
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell align="center" size="small" colSpan={3}>
                                Made Tea Quantity (Kg): {COPReportDetails.madeTeaThisMonth}
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell component="th" scope="row" size="small" ></TableCell>
                              <TableCell align="right" size="small" > Amount(Rs)</TableCell>
                              <TableCell align="right" size="small" >COP/Rs</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {
                              reportData.copReportThisMonth.map((row) => (
                                <>
                                  <TableRow
                                    key={row.copParentSectionID}
                                    style={{
                                      backgroundColor: "#D4F7C4"
                                    }}
                                  >
                                    <TableCell component="th" scope="row" >
                                      <span style={{ color: "transparent", visibility: "hidden" }} >
                                        {row.copParentSectionName}
                                      </span>
                                    </TableCell>
                                    <TableCell align="right" />
                                    <TableCell align="right" />
                                  </TableRow>
                                  {
                                    row.childList.map(item => (
                                      <>
                                        <TableRow key={item.copChildSectionID}>
                                          <TableCell component="th" scope="row">
                                            <span style={{ color: "transparent", visibility: "hidden" }} >
                                              <SubdirectoryArrowRightIcon />
                                              {item.copChildSectionName}
                                            </span>
                                          </TableCell>
                                          <TableCell align="right" />
                                          <TableCell align="right" />
                                        </TableRow>

                                        {
                                          item.ledgerAccountList.map(item => (
                                            <TableRow key={item.ledgerAccountID}>
                                              <TableCell component="th" scope="row">
                                                {item.ledgerAccountName}
                                              </TableCell>
                                              <TableCell align="right">{item.balance.toFixed(2)}</TableCell>
                                              <TableCell align="right">
                                                {
                                                  item.balance > 0 ? (
                                                    <>
                                                      {(
                                                        COPReportDetails.madeTeaToFrom /
                                                        item.balance
                                                      ).toFixed(2)}
                                                    </>
                                                  ) : null
                                                }
                                              </TableCell>
                                            </TableRow>
                                          ))
                                        }
                                      </>
                                    ))
                                  }
                                </>
                              ))
                            }
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  ) : null
                )
                  : null
              }

              {
                COPReportDetails.isCheckPreviousMonth == true ? (
                  reportData.copReportPreviousMonth != 0 ? (
                    <Grid item xs spacing={0}>
                      <TableContainer component={Paper}>
                        <Table aria-label="spanning table">
                          <TableHead style={{ backgroundColor: "#C1E5FF" }}>
                            <TableRow>
                              <TableCell style={{ fontSize: '18px', backgroundColor: '#FFFFFF' }} size="small" align="center" colSpan={3}>
                                Previous Month
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell align="center" size="small" colSpan={3}>
                                Made Tea Quantity (Kg): {COPReportDetails.madeTeaPreviousMonth}
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell component="th" scope="row" size="small" ></TableCell>
                              <TableCell align="right" size="small" >Amount(Rs)</TableCell>
                              <TableCell align="right" size="small" >COP/Rs</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {
                              reportData.copReportPreviousMonth.map((row) => (
                                <>
                                  <TableRow
                                    key={row.copParentSectionID}
                                    style={{
                                      backgroundColor: "#D4F7C4"
                                    }}
                                  >
                                    <TableCell component="th" scope="row" >
                                      <span style={{ color: "transparent", visibility: "hidden" }} >
                                        {row.copParentSectionName}
                                      </span>
                                    </TableCell>
                                    <TableCell align="right" />
                                    <TableCell align="right" />
                                  </TableRow>
                                  {
                                    row.childList.map(item => (
                                      <>
                                        <TableRow key={item.copChildSectionID}>
                                          <TableCell component="th" scope="row">
                                            <span style={{ color: "transparent", visibility: "hidden" }} >
                                              <SubdirectoryArrowRightIcon />
                                              {item.copChildSectionName}
                                            </span>
                                          </TableCell>
                                          <TableCell align="right" />
                                          <TableCell align="right" />
                                        </TableRow>

                                        {
                                          item.ledgerAccountList.map(item => (
                                            <TableRow key={item.ledgerAccountID}>
                                              <TableCell component="th" scope="row">
                                                {item.ledgerAccountName}
                                              </TableCell>
                                              <TableCell align="right">{item.balance.toFixed(2)}</TableCell>
                                              <TableCell align="right">
                                                {item.balance > 0 ? (
                                                  <>
                                                    {(
                                                      COPReportDetails.madeTeaPreviousMonth /
                                                      item.balance
                                                    ).toFixed(2)}
                                                  </>
                                                ) : null}
                                              </TableCell>
                                            </TableRow>
                                          ))
                                        }
                                      </>
                                    ))
                                  }
                                </>
                              ))
                            }
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  ) : null
                )
                  : null
              }
              {
                COPReportDetails.isCheckedFinacialYearToDate == true ? (
                  reportData.copReportFinancialYearToMonth != 0 ? (
                    <Grid item xs spacing={0}>
                      <TableContainer component={Paper}>
                        <Table aria-label="spanning table">
                          <TableHead style={{ backgroundColor: "#C1E5FF" }}>
                            <TableRow>
                              <TableCell style={{ fontSize: '18px', backgroundColor: '#FFFFFF' }} size="small" align="center" colSpan={3}>
                                Year to Date
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell align="center" size="small" colSpan={3}>
                                Made Tea Quantity (Kg): {COPReportDetails.madeTeaFinancialYearToMonth}
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell component="th" size="small" scope="row"></TableCell>
                              <TableCell align="right" size="small" >Amount(Rs)</TableCell>
                              <TableCell align="right" size="small" >COP/Rs</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {
                              reportData.copReportFinancialYearToMonth.map((row) => (
                                <>
                                  <TableRow
                                    key={row.copParentSectionID}
                                    style={{
                                      backgroundColor: "#D4F7C4"
                                    }}
                                  >
                                    <TableCell component="th" scope="row" >
                                      <span style={{ color: "transparent", visibility: "hidden" }} >
                                        {row.copParentSectionName}
                                      </span>
                                    </TableCell>
                                    <TableCell align="right" />
                                    <TableCell align="right" />
                                  </TableRow>
                                  {
                                    row.childList.map(item => (
                                      <>
                                        <TableRow key={item.copChildSectionID}>
                                          <TableCell component="th" scope="row">
                                            <span style={{ color: "transparent", visibility: "hidden" }} >
                                              <SubdirectoryArrowRightIcon />
                                              {item.copChildSectionName}
                                            </span>
                                          </TableCell>
                                          <TableCell align="right" />
                                          <TableCell align="right" />
                                        </TableRow>

                                        {
                                          item.ledgerAccountList.map(item => (
                                            <TableRow key={item.ledgerAccountID}>
                                              <TableCell component="th" scope="row">
                                                {item.ledgerAccountName}
                                              </TableCell>
                                              <TableCell align="right">{item.balance.toFixed(2)}</TableCell>
                                              <TableCell align="right">
                                                {item.balance > 0 ? (
                                                  <>
                                                    {(
                                                      COPReportDetails.madeTeaFinancialYearToMonth /
                                                      item.balance
                                                    ).toFixed(2)}
                                                  </>
                                                ) : null}
                                              </TableCell>
                                            </TableRow>
                                          ))
                                        }
                                      </>
                                    ))
                                  }
                                </>
                              ))
                            }
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  ) : null
                )
                  : null
              }
            </Grid>
          </div>
        </div>
      </div>
    );
  }
}

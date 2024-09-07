import React from "react";
import {
  Box, Card, Grid, TextField, Container, CardContent, Divider, CardHeader,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import CountUp from "react-countup";

export default class ComponentToPrint extends React.Component {

  render() {
    const TrialBalanceDetailList = this.props.trialBalanceDetails;
    const PdfExcelGeneralDetails = this.props.PdfExcelGeneralDetails;

    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u>Trial Balance Report</u></center></h2>
          <div>&nbsp;</div>
          <h2><center><u>Group: {PdfExcelGeneralDetails.groupName} - Estate: {PdfExcelGeneralDetails.factoryName}</u></center></h2>
          <div>&nbsp;</div>
          <h2><center><u>From {PdfExcelGeneralDetails.fromDate} To {PdfExcelGeneralDetails.endDate}</u></center></h2>
          <div>&nbsp;</div>
          <div>
            <Box maxwidth={1050}>
              <TableContainer >
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow style={{ borderTop: "1px black solid", borderLeft: "1px black solid", borderRight: "1px black solid" }}>
                      <TableCell align={'left'}>Account Number</TableCell>
                      <TableCell align={'left'}>Account Name</TableCell>
                      <TableCell align={'right'}>Year To Date Debit (LKR)</TableCell>
                      <TableCell align={'right'}>Year To Date Credit (LKR)</TableCell>
                      <TableCell align={'right'} style={{ backgroundColor: "#F4F6F8" }} >Transaction Debit (LKR)</TableCell>
                      <TableCell align={'right'} style={{ backgroundColor: "#F4F6F8" }} >Transaction Credit (LKR)</TableCell>
                      <TableCell align={'right'}>Closing Debit (LKR)</TableCell>
                      <TableCell align={'right'}>Closing Credit (LKR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {TrialBalanceDetailList.map((data, index) => (
                      <TableRow key={index} style={{ border: "1px black solid" }}>
                        <TableCell align={'left'} component="th" scope="row">
                          {data.accountNumber}
                        </TableCell>
                        <TableCell align={'left'} component="th" scope="row" >
                          {data.accountName}
                        </TableCell>
                        <TableCell align={'right'} component="th" scope="row" >
                          <CountUp
                            end = {data.openDebit.toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />
                        </TableCell>
                        <TableCell align={'right'} component="th" scope="row" >
                        <CountUp
                            end = {data.openCredit.toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />
                        </TableCell>
                        <TableCell align={'right'} style={{ backgroundColor: "#F4F6F8" }} component="th" scope="row" >
                        <CountUp
                            end = {data.transDebit.toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />
                        </TableCell>
                        <TableCell align={'right'} style={{ backgroundColor: "#F4F6F8" }} component="th" scope="row" >
                        <CountUp
                            end = {data.transCredit.toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />
                        </TableCell>
                        <TableCell align={'right'} component="th" scope="row" >
                        <CountUp
                            end = {data.closingDebit.toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />  
                        </TableCell>
                        <TableCell align={'right'} component="th" scope="row" >
                        <CountUp
                            end = {data.closingCredit.toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow style={{ border: "1px black solid" }}>
                      <TableCell align={'left'} component="th" scope="row" >
                        <Typography style={{ fontWeight: 600 }}>
                          Total (LKR)
                        </Typography>
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" >
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" >
                        <Typography style={{ fontWeight: 600 }}>
                        <CountUp
                            end = {TrialBalanceDetailList.reduce((totalOpenDebit, item) => totalOpenDebit + item.openDebit, 0).toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          /> 
                        </Typography>
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" >
                        <Typography style={{ fontWeight: 600 }}>
                        <CountUp
                            end = {TrialBalanceDetailList.reduce((totalOpenCredit, item) => totalOpenCredit + item.openCredit, 0).toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />
                        </Typography>
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" style={{ backgroundColor: "#F4F6F8" }} >
                        <Typography style={{ fontWeight: 600 }}>
                        <CountUp
                            end =  {TrialBalanceDetailList.reduce((totalTransDebit, item) => totalTransDebit + item.transDebit, 0).toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />
                        </Typography>
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" style={{ backgroundColor: "#F4F6F8" }} >
                        <Typography style={{ fontWeight: 600 }}>
                        <CountUp
                            end = {TrialBalanceDetailList.reduce((totalTransCredit, item) => totalTransCredit + item.transCredit, 0).toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />                         
                        </Typography>
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" >
                        <Typography style={{ fontWeight: 600 }}>
                        <CountUp
                            end = {TrialBalanceDetailList.reduce((totalClosingDebit, item) => totalClosingDebit + item.closingDebit, 0).toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />
                        </Typography>
                      </TableCell>
                      <TableCell align={'right'} component="th" scope="row" >
                        <Typography style={{ fontWeight: 600 }}>
                        <CountUp
                            end = {TrialBalanceDetailList.reduce((totalClosingCredit, item) => totalClosingCredit + item.closingCredit, 0).toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          /> 
                        </Typography>
                      </TableCell>
                    </TableRow>

                    <TableRow style={{ border: "1px black solid" }}>
                      <TableCell align={'left'} component="th" scope="row" >
                        <Typography style={{ fontWeight: 600 }}>
                          Unbalance (LKR)
                        </Typography>
                      </TableCell>
                      <TableCell align={'left'} component="th" scope="row" >
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" colSpan={2}>
                        <Typography style={{ fontWeight: 600 }}>
                        <CountUp
                            end = {(TrialBalanceDetailList.reduce((totalOpenDebit, item) => totalOpenDebit + item.openDebit, 0) - (TrialBalanceDetailList.reduce((totalOpenCredit, item) => totalOpenCredit + item.openCredit, 0))).toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />            
                        </Typography>
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" colSpan={2} style={{ backgroundColor: "#F4F6F8" }} >
                        <Typography style={{ fontWeight: 600 }}>
                        <CountUp
                            end = {(TrialBalanceDetailList.reduce((totalTransDebit, item) => totalTransDebit + item.transDebit, 0) - (TrialBalanceDetailList.reduce((totalTransCredit, item) => totalTransCredit + item.transCredit, 0))).toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />  
                        </Typography>
                      </TableCell>
                      <TableCell align={'center'} component="th" scope="row" colSpan={2}>
                        <Typography style={{ fontWeight: 600 }}>
                        <CountUp
                            end = {(TrialBalanceDetailList.reduce((totalClosingDebit, item) => totalClosingDebit + item.closingDebit, 0) - (TrialBalanceDetailList.reduce((totalClosingCredit, item) => totalClosingCredit + item.closingCredit, 0))).toFixed(2)}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />   
                        </Typography>
                      </TableCell>
                    </TableRow>
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

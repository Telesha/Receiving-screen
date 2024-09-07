import React from "react";
import {
  Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Table, 
} from '@material-ui/core';
import CountUp from "react-countup";


export default class ComponentToPrint extends React.Component {

  render() {
    const auditTrialData = this.props.auditTrialData;
    const totalAmount = this.props.totalAmount;
    const searchData = this.props.searchData;


    return (
      <div>
        <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
          <br />
          <h2><center><u>Audit Trial Report</u></center></h2>
          <h3><center>{searchData.groupName} - {searchData.factoryName}  {searchData.startDate} - {searchData.endDate}</center></h3>
          <div>&nbsp;</div>
          <div>
            <Box minWidth={1050}>
              <TableContainer>
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={'center'}>Account Code</TableCell>
                      <TableCell align={'center'}>Account Name</TableCell>
                      <TableCell align={'right'}>Debit</TableCell>
                      <TableCell align={'right'}>Credit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditTrialData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.accountCode}
                        </TableCell>
                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          {data.accountName}
                        </TableCell>
                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          <CountUp
                            end = {data.debit}
                            decimals = {2}
                            decimal = '.'
                            separator= ","
                            duration={0.1}
                          />
                        </TableCell>
                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                          <CountUp
                            end = {data.credit}
                            decimals = {2}
                            decimal = "."
                            separator=","
                            duration={0.1}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow style={{ background: '#ADD8E6' }}>
                      <TableCell
                        align={'right'}
                        component="th"
                        scope="row"
                        style={{ fontWeight: 'bold' }}
                      >
                        Total
                      </TableCell>
                      <TableCell
                        align={'right'}
                        component="th"
                        scope="row"
                        style={{ borderBottom: 'none' }}
                      ></TableCell>
                      <TableCell
                        align={'right'}
                        component="th"
                        scope="row"
                        style={{ borderBottom: 'none' }}
                      >
                        <CountUp style={{fontWeight: 'bold'}}
                          end = {totalAmount.debitTotal}
                          decimals = {2}
                          decimal = "."
                          separator=","
                          duration={0.1}
                        />    
                      </TableCell>
                      <TableCell
                        align={'right'}
                        component="th"
                        scope="row"
                        style={{ borderBottom: 'none' }}
                      >
                        <CountUp style={{fontWeight:'bold'}}
                          end = {totalAmount.creditTotal}
                          decimals = {2}
                          decimal = '.'
                          separator=","
                          duration={0.1}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </div>
        </div></div>
    );

  }

}

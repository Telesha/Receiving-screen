import React from "react";
import {
    Box, TableBody, TableContainer,Table,TableHead, TableRow, TableCell
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    

    render() {
        const routeSummaryData = this.props.routeSummaryData;
        const searchedData = this.props.searchedData;

        function getjobTypeusingjobID(type){
            if(type == 1){
              return "Cash";
            }else if(type == 2){
              return "Kilo";
            }else if(type == 3){
              return "General";
            }else{
              return "RSM";
            }
          }

        return(
            <div>
                <div style={{ width:'1080px', height: '1059px', padding: '20px', marginBottom: '14rem'}}>
                    <h3><center><u>Employee Wages</u></center></h3>
                    <div>&nbsp;</div>
                    <h4><center>{searchedData.groupName} -{searchedData.estateName} - {searchedData.divisionName}</center></h4>
                    <h4><center>{searchedData.year} - {searchedData.monthName}</center></h4>
                    <div>&nbsp;</div>
                    <div>
                        <Box minWidth={1050}>
                            <TableContainer style={{marginLeft: '5px'}}>
                                <Table aria-aria-label="caption table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Employee Number</TableCell>
                                            <TableCell>Employee Name</TableCell>
                                            <TableCell>Employee Type</TableCell>
                                            <TableCell>Job Type</TableCell>
                                            <TableCell>Disbersment Type</TableCell>
                                            <TableCell>Total Earnings</TableCell>
                                            <TableCell>Deductions</TableCell>
                                            <TableCell>Net Pay</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {routeSummaryData.map((data,index) => (
                                            <TableRow key ={index}>
                                                <TableCell align="left" component='th' scope="row" style={{borderBottom: 'none'}}>
                                                    {data.employeeNumber}
                                                </TableCell>
                                                <TableCell align="left" component='th' scope="row" style={{borderBottom: 'none'}}>
                                                    {data.employeeName}
                                                </TableCell>
                                                <TableCell align="left" component='th' scope="row" style={{borderBottom: 'none'}}>
                                                    {data.employeeType == 1 ? 'Register' : 'Unregister'}
                                                </TableCell>
                                                <TableCell align="left" component='th' scope="row" style={{borderBottom: 'none'}}>
                                                    {getjobTypeusingjobID(data.jobType)}
                                                </TableCell>
                                                <TableCell align="left" component='th' scope="row" style={{borderBottom: 'none'}}>
                                                    {data.workType == 1 ? 'Division Labour' : 'Lent Labour'}
                                                </TableCell>
                                                <TableCell align="left" component='th' scope="row" style={{borderBottom: 'none'}}>
                                                    {data.totalEarning}
                                                </TableCell>
                                                <TableCell align="left" component='th' scope="row" style={{borderBottom: 'none'}}>
                                                    {data.deduction}
                                                </TableCell>
                                                <TableCell align="left" component='th' scope="row" style={{borderBottom: 'none'}}>
                                                    {data.netPay}
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </div>
                </div>
            </div>
        )
    }
}
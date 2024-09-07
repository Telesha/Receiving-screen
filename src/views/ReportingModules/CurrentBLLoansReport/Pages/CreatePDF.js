import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {

        const LoanInputData = this.props.LoanInputData;
        const BLLoanDetails = this.props.BLLoanDetails;
        const LoanReportSearchData = this.props.LoanReportSearchData;

        return (
            <div>

                <h2><center><u>Current BL Loans Report</u></center></h2>
                <div>&nbsp;</div>
                <h3><center>{LoanReportSearchData.groupName} - {LoanReportSearchData.factoryName}</center></h3>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={1050}>

                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Route Code</TableCell>
                                        <TableCell align={'center'}>Route Name</TableCell>
                                        <TableCell align={'center'}>Registration Number</TableCell>
                                        <TableCell align={'center'}>Name</TableCell>
                                        <TableCell align={'center'}>Loan Issued Date</TableCell>
                                        <TableCell align={'center'}>Principal Amount (Rs.)</TableCell>
                                        <TableCell align={'center'}>Installments</TableCell>
                                        <TableCell align={'center'}>Remaining Installments</TableCell>
                                        <TableCell align={'center'}>Capital Outstanding (Rs.)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {BLLoanDetails.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeCode}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.registrationNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.name}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.loanIssuedDate.split('T')[0]}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.principalAmount.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.numberOfInstalments}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.remainingInstalments}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.capitalOutstanding.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </div>
                <div>&nbsp;</div>
                <h3><center>***** End of List *****</center></h3>
            </div>
        );

    }

}
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
        const LoanWiseDetails = this.props.LoanWiseDetails;
        const LoanReportSearchData = this.props.LoanReportSearchData;

        return (
            <div>

                <h2><center><u>Loan Wise Crop Report</u></center></h2>
                <div>&nbsp;</div>
                <h3><center>{LoanReportSearchData.groupName} - {LoanReportSearchData.factoryName}</center></h3>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={1050}>

                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Route Name</TableCell>
                                        <TableCell align={'center'}>Registration Number</TableCell>
                                        <TableCell align={'center'}>Customer Name</TableCell>
                                        <TableCell align={'center'}>Loan Issued Date</TableCell>
                                        <TableCell align={'center'}>Principal Amount (Rs.)</TableCell>
                                        <TableCell align={'center'}>No of Installments</TableCell>
                                        <TableCell align={'center'}>Interest Rate (%)</TableCell>
                                        <TableCell align={'center'}>Before 3 Months Crop Average</TableCell>
                                        <TableCell align={'center'}>After 3 Months Crop Average</TableCell>
                                        <TableCell align={'center'}>Last Month Crop (KG)</TableCell>
                                        <TableCell align={'center'}>Last Month Debt (Rs.)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {LoanWiseDetails.map((data, index) => (
                                        <TableRow key={index}>
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
                                                {data.annualRate}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.beforeThreeMonthCrop.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.afterThreeMonthCrop.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.lastMonthCrop}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.lastMonthDebt}
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
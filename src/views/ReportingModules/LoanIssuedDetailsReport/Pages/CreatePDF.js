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
import moment from 'moment';

export default class ComponentToPrint extends React.Component {
    render() {

        const LoanIssuedDetailsInput = this.props.LoanIssuedDetailsInput;
        const LoanReportTotal = this.props.LoanReportTotal;
        const LoanReportData = this.props.LoanReportData;
        const LoanIssuedSearchData = this.props.LoanIssuedSearchData;

        return (
            <div>

                <h2><center><u>Loan Issued Details Report</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{LoanIssuedSearchData.groupName} - {LoanIssuedSearchData.factoryName}</center></h2>
                <div>&nbsp;</div>
                <h3><center>{LoanIssuedDetailsInput.startyear === "" ? moment(new Date()).format('YYYY') : LoanIssuedDetailsInput.startyear} / {LoanIssuedDetailsInput.startmonth === "" ? moment(new Date()).format('MMM') : LoanIssuedSearchData.startmonth} -
                    {LoanIssuedDetailsInput.endyear === "" ? moment(new Date()).format('YYYY') : LoanIssuedDetailsInput.endyear} / {LoanIssuedDetailsInput.endmonth === "" ? moment(new Date()).format('MMM') : LoanIssuedSearchData.endmonth}</center></h3>

                <div>
                    <Box minWidth={1050}>

                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Route Name</TableCell>
                                        <TableCell align={'center'}>Month</TableCell>
                                        <TableCell align={'center'}>Registration Number</TableCell>
                                        <TableCell align={'center'}>Customer Name</TableCell>
                                        <TableCell align={'center'}>Loan Issued Date</TableCell>
                                        <TableCell align={'center'}>Principal Amount (Rs.)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {LoanReportData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {moment(new Date(data.loanIssuedDate)).format('MMMM')}
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'center'}><b>Total</b></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LoanReportTotal.principalAmount.toFixed(2)} </b>
                                    </TableCell>
                                </TableRow>
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
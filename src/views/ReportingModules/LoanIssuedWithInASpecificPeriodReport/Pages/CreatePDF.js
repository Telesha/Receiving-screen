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
        const LoanIssuedSearchData = this.props.LoanIssuedSearchData;
        const LoanReportTotal = this.props.LoanReportTotal;
        const LoanReportData = this.props.LoanReportData;

        return (
            <div>

                <h2><center><u>Loan Issued Within a Specific Period Report</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{LoanIssuedSearchData.groupName} - {LoanIssuedSearchData.factoryName}</center></h2>
                <div>&nbsp;</div>
                <h3><center>{LoanIssuedDetailsInput.startyear === "" ? moment(new Date()).format('YYYY') : LoanIssuedDetailsInput.startyear} / {LoanIssuedDetailsInput.startmonth === "" ? moment(new Date()).format('MMMM') : LoanIssuedSearchData.startmonth} 
                -{LoanIssuedDetailsInput.endyear  === "" ? moment(new Date()).format('YYYY') : LoanIssuedDetailsInput.endyear}/{LoanIssuedDetailsInput.endmonth === "" ? moment(new Date()).format('MMMM') : LoanIssuedSearchData.endmonth}</center></h3>

                <div>
                    <Box minWidth={1050}>

                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Month</TableCell>
                                        <TableCell align={'center'}>Route Name</TableCell>
                                        <TableCell align={'center'}>Loan Count</TableCell>
                                        <TableCell align={'center'}>Loan Amount (Rs.)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {LoanReportData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {moment(new Date(data.issuedMonth)).format('MMMM')}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.loanCount}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.loanAmount.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'center'}><b>Total</b></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LoanReportTotal.loanAmount.toFixed(2)} </b>
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
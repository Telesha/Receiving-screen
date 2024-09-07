import React from "react";
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
        const BankSummarySearchData = this.props.BankSummarySearchData;
        const BankSummaryData = this.props.BankSummaryData;
        const TotalAmount = this.props.TotalAmount;
        const selectedDatePDF = this.props.selectedDatePDF;

        return (
            <div>
                <h3><center>{BankSummarySearchData.factoryName}</center></h3>
                <h3><center>{BankSummarySearchData.routeName}</center></h3>
                <h3><center>Balance Payment For the Month of  {selectedDatePDF.applicableMonth} - {selectedDatePDF.applicableYear}</center></h3>
                <h3><center><u>Bank Summary</u></center></h3>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'left'} style={{ borderBottom: "1px solid black" }}>Bank</TableCell>
                                        <TableCell align={'center'} style={{ borderBottom: "1px solid black" }}>Branch</TableCell>
                                        <TableCell align={'right'} style={{ borderBottom: "1px solid black" }}>Amount(RS)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {BankSummaryData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.bankName}-{data.branchName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.branchName}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.amount.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'left'} style={{ borderBottom: "1px solid black" }}><b>Total</b></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "1px solid black" }}>
                                    </TableCell>
                                    <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "1px solid black" }}>
                                        <b> {TotalAmount} </b>
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
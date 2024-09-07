import React from "react";
import tokenService from '../../../utils/tokenDecoder';
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table
} from '@material-ui/core';
import CountUp from 'react-countup';

export default class ComponentToPrint extends React.Component {
    render() {
        const stockBalanceDetails = this.props.stockBalanceDetails;
        const stockBalanceReportInput = this.props.stockBalanceReportInput;
        const SearchData = this.props.SearchData;
        const totalValues = this.props.totalValues;

        return (
            <div>
                <h2><left><u>Advance Report</u></left></h2>
                <div>&nbsp;</div>
                <h4><left>Group :{SearchData.groupName}</left></h4>

                <h4><left>Estate :{SearchData.factoryName}</left></h4>
                <h4><left>Division :{SearchData.divisionName}</left></h4>
                <h4><left>Date - ({stockBalanceReportInput.startDate}) / ({stockBalanceReportInput.endDate})</left></h4>
                <div>&nbsp;</div>
                <br></br>
                <div>
                    <Box minWidth={650}>
                        <TableContainer>
                            <Table
                                size="small"
                                aria-label="simple table"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ border: "2px solid black", width: "15%" }} align="left">
                                            Employee Number
                                        </TableCell>
                                        <TableCell style={{ border: "2px solid black", width: "15%" }} align="left">
                                            Employee Name
                                        </TableCell>
                                        <TableCell style={{ border: "2px solid black", width: "15%" }} align="right">
                                            Amount(Rs.)
                                        </TableCell>
                                        <TableCell style={{ border: "2px solid black", width: "15%" }} align="left">
                                            Signature
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stockBalanceDetails.map((row, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                    {row.employeeNumber}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                    {row.employeeName}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="right" component="th" scope="row">
                                                    <CountUp decimals={2} separator=',' end={row.amount} duration={1} />
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                    {"........................................"}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    <TableRow >
                                        <TableCell colSpan={2} style={{ border: "2px solid black", fontWeight: "bold" }} align="center" component="th" scope="row" >
                                            Total
                                        </TableCell>
                                        <TableCell style={{ border: "2px solid black" }} align="right" component="th" scope="row">
                                            <CountUp decimals={2} separator=',' end={totalValues.totalAmount} duration={1} />
                                        </TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="left" component="th" scope="row" >
                                        </TableCell>
                                    </TableRow>
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
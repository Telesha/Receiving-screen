import React from "react";
import {
    Box, Card, Grid, Container, CardContent, Divider, CardHeader,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {

    render() {
        const selectedSearchValues = this.props.selectedSearchValues;
        const paymentCheckrollDetails = this.props.paymentCheckrollDetails;
        const totalValues = this.props.totalValues;

        return (
            <div>
                <h3 style={{ textAlign: 'left' }}><u>Madeup Amount - Division Wise Report</u></h3>
                <div>&nbsp;</div>
                <h4 style={{ textAlign: 'left' }}>Estate-{selectedSearchValues.estateName}</h4>
                <div>&nbsp;</div>
                <h4 style={{ textAlign: 'left' }}>Division-{selectedSearchValues.divisionName}</h4>
                <div>&nbsp;</div>
                <h4 style={{ textAlign: 'left' }}>Month-{selectedSearchValues.monthName} &nbsp; Year-{selectedSearchValues.year}</h4>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={950}>
                        <TableContainer>
                            <Table size="small" aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="center"> EMP ID:</TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="center"> E.P.F. No:</TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="center"> Name</TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="right"> Rs.</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {paymentCheckrollDetails.map((row, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell style={{ border: "2px solid black" }} align="center" component="th" scope="row">
                                                    {row.registrationNumber}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                    {row.epfNumber}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                    {row.employeeName}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="right" component="th" scope="row">
                                                    {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </TableCell>

                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </div>
            </div>
        );
    }
}

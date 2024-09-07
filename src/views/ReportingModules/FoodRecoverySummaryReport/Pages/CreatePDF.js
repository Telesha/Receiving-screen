import React from "react";
import {
    Box, Card, Grid, Container, CardContent, Divider, CardHeader,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {

    render() {
        const selectedSearchValues = this.props.selectedSearchValues;
        const FoodRecoverList = this.props.FoodRecoverList;
        const foodRecoveryDetailsData = this.props.foodRecoveryDetailsData;
        const totalValues = this.props.totalValues;

        return (
            <div>
                <h3 style={{ textAlign: 'left' }}><u>Food Recovery Summary Report</u></h3>
                <h4 style={{ textAlign: 'left' }}>Group- {selectedSearchValues.groupName} </h4>
                <h4 style={{ textAlign: 'left' }}>Estate-{selectedSearchValues.factoryName}</h4>
                <h4 style={{ textAlign: 'left' }}>Division-{selectedSearchValues.divisionname}</h4>
                <h4 style={{ textAlign: 'left' }}>Month-{selectedSearchValues.monthName} &nbsp; Year-{selectedSearchValues.year}</h4>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={950}>
                        <TableContainer>
                            <Table size="small" aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="left"> Employee Number</TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="left"> Employee Name </TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="left"> Food Item</TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="left"> Quantity</TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="right"> Amount (Rs.)</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {foodRecoveryDetailsData.map((row, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                    {row.employeeNumber}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                    {row.employeeName}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                    {row.foodItemName}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="left" component="th" scope="row">
                                                    {row.quantity}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="right" component="th" scope="row">
                                                    {row.amount}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>

                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={3} style={{ border: "2px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }}
                                            align="left">Total</TableCell>

                                        <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black", color: "red", fontSize: "16px" }}>
                                            <b>{Number(totalValues.quantity)}</b>
                                        </TableCell>
                                        <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", border: "2px solid black", color: "red", fontSize: "16px" }}>

                                            <b>{Number(totalValues.amount).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}</b>
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    </Box>
                </div>
            </div>
        );
    }
}

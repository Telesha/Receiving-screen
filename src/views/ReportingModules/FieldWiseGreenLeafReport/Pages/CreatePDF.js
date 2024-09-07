import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table,
    Paper,
    TableFooter
} from '@material-ui/core';
import moment from 'moment';




export default class ComponentToPrint extends React.Component {

    render() {
        const selectedSearchValues = this.props.selectedSearchValues;
        const searchDate = this.props.searchDate;
        const cashCustomerData = this.props.cashCustomerData;
        const total = this.props.total;
        const monthDays = this.props.monthDays

        return (
            <div>
                <center>
                    <h2><left><u>Field wise Green Leaf Report</u></left></h2>
                    <div>&nbsp;</div>
                    <h4><left>Group - {selectedSearchValues.groupID} </left></h4>
                    <div>&nbsp;</div>
                    <h4><left>Estate - {selectedSearchValues.estateID}</left></h4>
                    <div>&nbsp;</div>
                    <h4><left>JobType - {selectedSearchValues.jobTypeName}</left></h4>
                    <div>&nbsp;</div>
                    <h4><left>Date - {selectedSearchValues.startDate} - {searchDate.endDate}</left></h4>
                    <div>&nbsp;</div>
                </center>
                <br></br>
                <div>

                    <Table size="small" aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Feild
                                </TableCell>

                                {monthDays.sort((a, b) => new Date(a) - new Date(b)).map((row, index) => {
                                    return (
                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                                            {moment(row).format('MMMM DD')}
                                        </TableCell>
                                    );
                                })}
                                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Total
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cashCustomerData.sort((a, b) => new Date(a) - new Date(b)).map((row, index) => {
                                return (
                                    <TableRow key={index}>

                                        <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                            {row.fieldName}
                                        </TableCell>
                                        {monthDays.map((rows, index) => {

                                            var foundRecords = row.details.filter(x => x.date === rows);
                                            var totalAmount = foundRecords.reduce((total, record) => total + (record.amount || 0), 0);

                                            return (
                                                <TableCell key={index} style={{ border: "1px solid black" }} align="center">
                                                    {foundRecords.length === 0 ? '-' : totalAmount}
                                                </TableCell>
                                            );
                                        })}


                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold" }} align="left" component="th" scope="row">
                                            {row.totalAmount}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={1} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                                    Total
                                </TableCell>
                                {monthDays.map((day, index) => {
                                    const dayTotal = cashCustomerData.reduce((total, row) => {
                                        const found = row.details.find(x => x.date === day);
                                        return total + (found ? parseFloat(found.amount) : 0);
                                    }, 0);

                                    return (
                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center" key={index}>
                                            {dayTotal !== 0 ? dayTotal : '-'}
                                        </TableCell>
                                    );
                                })}
                                <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="left">
                                    {cashCustomerData.reduce((total, row) => total + parseFloat(row.totalAmount), 0)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>

                </div>
                <div>&nbsp;</div>
                <h4><center>*******End of List*******</center></h4>
            </div>
        );

    }

}

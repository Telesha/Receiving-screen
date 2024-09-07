import React from "react";
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table,
    TableFooter
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const selectedSearchValues = this.props.selectedSearchValues;
        const statutoryData = this.props.statutoryData;
        const monthName = new Date(0, selectedSearchValues.month - 1).toLocaleString('en-US', { month: 'long' });

        return (
            <div>
                <h2 style={{ textAlign: 'left' }}><u>Division Wise Debts Report</u></h2>
                <div>&nbsp;</div>
                <h4 style={{ textAlign: 'left' }}>Group - {selectedSearchValues.groupID} </h4>
                <div>&nbsp;</div>
                <h4 style={{ textAlign: 'left' }}>Estate - {selectedSearchValues.estateID}</h4>
                <div>&nbsp;</div>
                <h4 style={{ textAlign: 'left' }}>Division - {selectedSearchValues.divisionID}</h4>
                <div>&nbsp;</div>
                <h4 style={{ textAlign: 'left' }}>Year & Month - ({monthName}) - ({selectedSearchValues.year})</h4>
                <div>&nbsp;</div>
                <br></br>
                <div>
                    <Box minWidth={850}>
                        <TableContainer>
                            <Table
                                size="small"
                                aria-label="sticky table"
                                Table
                                stickyHeader
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left"> EmpNo </TableCell>
                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left"> Employee Name </TableCell>
                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="right">PaybleAmount </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {statutoryData.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                                {row.empNo == '' ? '-' : row.empNo}
                                            </TableCell>
                                            <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                                {row.employeeName}
                                            </TableCell>
                                            <TableCell style={{ border: "1px solid black" }} align="right" component="th" scope="row">
                                                {(row.paybleAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="left">
                                            Total
                                        </TableCell>
                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="right">
                                            {statutoryData.reduce((total, row) => total + parseFloat(row.paybleAmount), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
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
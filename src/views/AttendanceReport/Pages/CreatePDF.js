import React from "react";
import {Box,TableBody,TableCell,TableContainer,TableHead,TableRow,Table} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const attendanceDetails = this.props.attendanceDetails;
        const selectedSearchValues = this.props.selectedSearchValues;
        const SearchData = this.props.SearchData;
        return (
            <div>
                <h2><left><u>Payroll Attendance Report</u></left></h2>
                <div>&nbsp;</div>
                <h4><left>Group :{SearchData.groupName}</left></h4>
                <h4><left>Estate :{SearchData.factoryName}</left></h4>
                <h4><left>Designation :{SearchData.designationName}</left></h4>
                <h4><left>Date - {selectedSearchValues.year} / {selectedSearchValues.monthName}</left></h4>
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
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", textAlign: "left", width: "15%" }} align="center">
                                            Employee Registration Number
                                        </TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", textAlign: "left", width: "15%" }} align="center">
                                            Employee Name
                                        </TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", textAlign: "left", width: "15%" }} align="center">
                                            Designation
                                        </TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", textAlign: "right", width: "15%" }} align="center">
                                            Monthly Attendance
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendanceDetails.map((row, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell style={{ border: "2px solid black", textAlign: "left" }} align="left" component="th" scope="row">
                                                    {row.regNo}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black", textAlign: "left" }} align="left" component="th" scope="row">
                                                    {row.name}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black", textAlign: "left" }} align="left" component="th" scope="row">
                                                    {row.designationName}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black", textAlign: "right" }} align="left" component="th" scope="row">
                                                    {row.daysCount}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
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
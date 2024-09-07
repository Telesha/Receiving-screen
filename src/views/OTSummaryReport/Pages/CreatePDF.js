import React from "react";
import tokenService from '../../../utils/tokenDecoder';
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
import CountUp from 'react-countup';

export default class ComponentToPrint extends React.Component {
    render() {
        const attendanceDetailsData = this.props.attendanceDetailsData;
        const selectedSearchValues = this.props.selectedSearchValues;
        const SearchData = this.props.SearchData;
        const totalValues = this.props.totalValues;
        return (
            <div>
                <h2><left><u>Employee OT Summary</u></left></h2>
                <div>&nbsp;</div>
                <h4><left>Group - {selectedSearchValues.groupName} </left></h4>
                <div>&nbsp;</div>
                <h4><left>Estate - {selectedSearchValues.factoryName}</left></h4>
                <div>&nbsp;</div>
                <h4><left>Division - {selectedSearchValues.divisionname}</left></h4>
                <div>&nbsp;</div>
                <h4><left>Date - ({selectedSearchValues.startDate}) - ({selectedSearchValues.endDate})</left></h4>
                <div>&nbsp;</div>
                <br></br>
                <div>
                    <Box minWidth={850}>
                        <TableContainer>
                            <Table
                                size="small"
                                aria-label="simple table"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="left"> Employee Number</TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="left"> Employee Name </TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="center"> Day OT</TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="center"> Night OT</TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="center"> Sunday OT</TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold" }} align="center"> Total </TableCell>
                                    </TableRow>
                                </TableHead>


                                <TableBody>
                                    {attendanceDetailsData.map((row, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell style={{ border: "2px solid black" }} align="center" component="th" scope="row">
                                                    {row.registrationNumber}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="center" component="th" scope="row">
                                                    {row.firstName}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="center" component="th" scope="row">
                                                    {row.dayOT == 0 ? '-' : row.dayOT}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="center" component="th" scope="row">
                                                    {row.nightOT == 0 ? '-' : row.nightOT}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="center" component="th" scope="row">
                                                    {row.sundayOT == 0 ? '-' : row.sundayOT}
                                                </TableCell>
                                                <TableCell style={{ border: "2px solid black" }} align="center" component="th" scope="row">
                                                    {row.totCol == 0 ? '-' : row.totCol}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={2} style={{ border: "2px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }}
                                            align="center">Total</TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                                            {attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totaldayOt)), 0) === 0 ? '-' : attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totaldayOt)), 0)}
                                        </TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                                            {attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totalNightOt)), 0) === 0 ? '-' : attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totalNightOt)), 0)}
                                        </TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                                            {attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totalSundayOt)), 0) === 0 ? '-' : attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totalSundayOt)), 0)}
                                        </TableCell>
                                        <TableCell style={{ border: "2px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                                            {attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totCol)), 0) === 0 ? '-' : attendanceDetailsData.reduce((total, row) => (total + parseFloat(row.totCol)), 0)}
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
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
        const attendanceDetailsData = this.props.attendanceDetailsData;
        const selectedSearchValues = this.props.selectedSearchValues;
        const SearchData = this.props.SearchData;
        const totalValues = this.props.totalValues;
        return (
            <div>
                <h2 style={{ textAlign: 'left' }}><u>Daily Work Report</u></h2>
                <div>&nbsp;</div>
                <h4 style={{ textAlign: 'left' }}>Group - {selectedSearchValues.groupName} </h4>
                <div>&nbsp;</div>
                <h4 style={{ textAlign: 'left' }}>Estate - {selectedSearchValues.factoryName}</h4>
                <div>&nbsp;</div>
                <h4 style={{ textAlign: 'left' }}>Division - {selectedSearchValues.divisionname}</h4>
                <div>&nbsp;</div>
                <h4 style={{ textAlign: 'left' }}>From Date - ({selectedSearchValues.startDate}) To Date ({selectedSearchValues.endDate})</h4>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={300}>
                        <TableContainer>
                            <Table
                                size="small"
                                aria-label="simple table"
                            >
                                <TableHead style={{ borderBottom: "2px solid black" }}>
                                    <TableRow style={{ borderBottom: "1px solid black", borderTop: "1px solid black" }}>
                                        <TableCell style={{ borderLeft: "2px solid black", borderRight: "0px", fontWeight: "bold", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> Worked Date</TableCell>
                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", fontWeight: "bold", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> Emp No</TableCell>
                                        <TableCell style={{ borderLeft: "0px", fontWeight: "0px", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> Below Norm Days</TableCell>
                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> Below Norm Kilos</TableCell>
                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> Total Name</TableCell>
                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> Total Kilos</TableCell>
                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> Over Kilos</TableCell>
                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> Sundry Name</TableCell>
                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> Sundry Extra Rate</TableCell>
                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> OT AM</TableCell>
                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> OT PM</TableCell>
                                        <TableCell style={{ borderLeft: "0px", borderRight: "2px solid black", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> OT SUN</TableCell>
                                        <TableCell style={{ borderLeft: "2px solid black", borderRight: "0px", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> Cash Sundry name</TableCell>
                                        <TableCell style={{ borderLeft: "0px", borderRight: "0px", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> Contract Plucking</TableCell>
                                        <TableCell style={{ borderLeft: "0px", borderRight: "2px solid black", fontWeight: "bold", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> Cash Plucking</TableCell>
                                        <TableCell style={{ border: "0px", borderRight: "2px solid black", fontWeight: "bold", width: "15%", fontWeight: "bold", width: "15%", borderTop: "2px solid black " }} align="center"> PI Days</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody style={{ borderBottom: "2px solid black" }}>
                                    {attendanceDetailsData.map((row, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell style={{ borderLeft: "2px solid black", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {row.workedDate.split('T')[0]}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {row.empNo}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {row.belowNoarmD == null ? '-' : row.belowNoarmD}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {row.belowNormKilo == 0 ? '-' : row.belowNormKilo}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {row.totalName == 0 ? '-' : row.totalName}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {row.totalKilos == 0 ? '-' : row.totalKilos}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {row.overKilo == 0 ? '-' : row.overKilo}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {row.sundryName == 0 ? '-' : row.sundryName}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {'-'}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {row.dayOT == 0 ? '-' : row.dayOT}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {row.nightOT == 0 ? '-' : row.nightOT}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "2px solid black", }} align="left" component="th" scope="row">
                                                    {row.doubleOT == 0 ? '-' : row.doubleOT}
                                                </TableCell>

                                                <TableCell style={{ borderLeft: "2px solid black", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {row.cashSundryName == 0 ? '-' : row.cashSundryName}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "0px", }} align="left" component="th" scope="row">
                                                    {'-'}
                                                </TableCell>
                                                <TableCell style={{ borderLeft: "0px", borderRight: "2px solid black", }} align="left" component="th" scope="row">
                                                    {row.cashPluking == 5 ? row.totalKilos : '-'}
                                                </TableCell>

                                                <TableCell style={{ border: "0px", borderRight: "2px solid black", }} align="left" component="th" scope="row">
                                                    {row.totalName == 0 ? '-' : row.totalName}
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
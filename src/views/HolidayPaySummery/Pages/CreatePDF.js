import React from "react";
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table,
    Grid
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {

        const holidayPaySummery = this.props.holidayPaySummery;
        const searchData = this.props.searchData;

        return (
            <div >
                <h3><center><u>Holiday Pay Summary</u></center></h3>
                <div>&nbsp;</div>
                <h4><center>{searchData.estateName} - {searchData.divisionName} - {searchData.groupName} {searchData.empNo == "" ? null : "Reg no: " + searchData.empNo}</center></h4>
                <div>&nbsp;</div>
                <div>
                    <Box /* minWidth={1050} */ >
                        <TableContainer>
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Emp No</TableCell>
                                        <TableCell align={'center'}>Emp Name</TableCell>
                                        <TableCell align={'center'}>Gender</TableCell>
                                        <TableCell align={'center'}>Total Attendence</TableCell>
                                        <TableCell align={'center'}>Holiday Pay Applicable</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {holidayPaySummery.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.registrationNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.empName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.gender}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.totalDays}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.applicableDays}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </div>
                <div>&nbsp;</div>
                <h3><center>***** End of List *****</center></h3>
            </div>
        )
    }
}
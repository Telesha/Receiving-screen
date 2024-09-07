import React from "react";
import { Box, TableBody, TableCell, TableRow, Table, TableContainer, TableHead, } from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const workDistributionData = this.props.workDistributionData;
        const SearchData = this.props.SearchData;
        const totalValues = this.props.totalValues;

        function getTotDays(data) {
            const totalDays = data.normalDays + data.sundayAndPoyaDays + data.cashDays
            return totalDays;
        }

        function getTotOThrs(data) {
            const totalOThrs = data.normalOT + data.nightOT + data.sundayPoyaOT
            return totalOThrs;
        }

        return (
            <div>
                <style>
                    {`@page {size: A4 landscape;}`}
                </style>
                <h2><left><u>Checkroll Work Distribution Report </u></left></h2>
                <div>&nbsp;</div>
                <h4><left>{SearchData.groupName}</left></h4>
                <h4><left>{SearchData.estateName}</left></h4>
                <h4><left>{SearchData.divisionName}</left></h4>
                <h4><left>{SearchData.jobCategory}</left></h4>
                <h4><left>{SearchData.jobCode}</left></h4>
                <h4><left>{SearchData.startDate}/{SearchData.endDate}</left></h4>
                <div>&nbsp;</div>
                <br></br>
                <div>
                    <Box minWidth={1050}>
                        {workDistributionData.length > 0 ?
                            <TableContainer >
                                <Table aria-lable="sticky table" stickyHeader size='small' Table>
                                    <TableHead style={{ position: "sticky", top: 0, zIndex: 1000, background: "white" }}>
                                        <TableRow>
                                            <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Job Code</TableCell>
                                            <TableCell rowSpan="2" align={'center'} style={{ left: 74, border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Description</TableCell>
                                            <TableCell colSpan="4" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>NAMES</TableCell>
                                            <TableCell colSpan="4" align={'center'} style={{ left: 74, border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Over Time</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Normal Days</TableCell>
                                            <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Sunday & Poyadays</TableCell>
                                            <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Cash</TableCell>
                                            <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Total</TableCell>

                                            <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Normal OT</TableCell>
                                            <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Night OT</TableCell>
                                            <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Sunday Poya</TableCell>
                                            <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {workDistributionData.map((data, index) => (
                                            <TableRow key={index}>
                                                <TableCell align={'center'} style={{ border: "1px solid black" }}>{data.jobCode.toString().padStart(4, '0')}</TableCell>
                                                <TableCell align={'left'} style={{ left: 74, border: "1px solid black" }}>{data.jobName}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.normalDays.toFixed(2)}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.sundayAndPoyaDays.toFixed(2)}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.cashDays.toFixed(2)}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{getTotDays(data).toFixed(2)}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.normalOT.toFixed(2)}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.nightOT.toFixed(2)}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.sundayPoyaOT.toFixed(2)}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{getTotOThrs(data).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                        }
                                    </TableBody>
                                    <TableRow>
                                        <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} colSpan={2}><b>Total</b></TableCell>
                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalNormalDays}</TableCell>
                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalSundayAndPoyaDays}</TableCell>
                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCashDays}</TableCell>
                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalNames}</TableCell>
                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalNormalOT}</TableCell>
                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalNightOT}</TableCell>
                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalSundayPoyaOT}</TableCell>
                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOT}</TableCell>
                                    </TableRow>
                                </Table>
                            </TableContainer>
                            : null}
                    </Box>
                </div>
                <div>&nbsp;</div>
            </div>
        );
    }
}
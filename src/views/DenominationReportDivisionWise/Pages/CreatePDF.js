import React from "react";
import tokenService from '../../../utils/tokenDecoder';
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Table,
    Divider
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {

    render() {
        const selectedSearchValues = this.props.selectedSearchValues;
        const prevTotalAmount = this.props.prevTotalAmount;
        const coinTotal = this.props.coinTotal;
        const remainingValueTotal = this.props.remainingValueTotal;
        const date = new Date();
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();

        let monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];

        return (
            <div style={{ height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', }}>
                    <p>{formattedDate}</p>
                    <div>&nbsp;</div>
                    <p>{formattedTime}</p>
                </div>
                <h2><center>Cash Denomination Report</center></h2>
                <div>&nbsp;</div>
                <h2>{selectedSearchValues.GroupName}</h2>
                <h3>Estate: {selectedSearchValues.EstateName}</h3>
                <h3>Division: {selectedSearchValues.DivisionName}</h3>
                <h3>Month and Year:&nbsp;{monthNames[selectedSearchValues.Month - 1]} / {selectedSearchValues.Year}</h3>&nbsp;
                <br /><br />
                <div>
                    <TableContainer>
                        <Table /* sx={{ minWidth: 650 }} */ size="small" aria-label="a dense table">
                            <TableBody>
                                {coinTotal.map((row, index) => {
                                    return (
                                        <>
                                            {row.coinCount > 0 ?
                                                <TableRow key={index}>
                                                    <TableCell align="Left" style={{ fontSize: '20px', borderBottom: "none" }}>Number of {row.coinName} LKR</TableCell>
                                                    <TableCell align="center" style={{ fontSize: '20px', borderBottom: "none" }}>{row.coinName} x {row.coinCount == 0 ? '0.0' : row.coinCount}</TableCell>
                                                    <TableCell align="right" style={{ fontSize: '20px', borderBottom: "none" }}>{row.totalCoinAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                </TableRow> : null}
                                        </>
                                    )
                                })}
                                {remainingValueTotal > 0 ?
                                    <TableRow>
                                        <TableCell align="left" style={{ fontSize: '20px', borderBottom: "none" }}>Remaining Coins</TableCell>
                                        <TableCell align="right" style={{ fontSize: '20px', borderBottom: "none" }}></TableCell>
                                        <TableCell align="right" style={{ fontSize: '20px', borderBottom: "2px solid black" }}>{remainingValueTotal}</TableCell>
                                    </TableRow>
                                    :
                                    <TableRow>
                                        <TableCell align="left" style={{ fontSize: '20px', borderBottom: "none" }}></TableCell>
                                        <TableCell align="right" style={{ fontSize: '20px', borderBottom: "none" }}></TableCell>
                                        <TableCell align="right" style={{ fontSize: '20px', borderBottom: "2px solid black" }}></TableCell>
                                    </TableRow>}
                                <br />
                                <TableRow>
                                    <TableCell align="right" style={{ fontSize: '20px', borderBottom: "none", fontWeight: "bold" }}>Total net salary amount for the above month Rs.</TableCell>
                                    <TableCell style={{ borderBottom: "none" }}></TableCell>
                                    <TableCell align="right" style={{ fontSize: '20px', borderBottom: "2px solid black", borderBottomStyle: 'double', fontWeight: "bold" }}>{prevTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                <div style={{ bottom: '0', left: '0', position: 'absolute' }}>
                    <center>_____________________
                        <h2>Manager Estate</h2>
                    </center>
                </div>
            </div >
        )
    }
}
import React from 'react';
import {
    Box,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Table
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {
    render() {
        const checkRollDeductionViewData = this.props.checkRollDeductionViewData;
        const selectedSearchValues = this.props.selectedSearchValues;
        const totalAmount = this.props.totalAmount;
        return (
            <div>
                <h2><left><u>Union Deduction Report</u></left></h2>
                <div>&nbsp;</div>
                <h4><left>Group - {selectedSearchValues.groupName} </left></h4>
                <div>&nbsp;</div>
                <h4><left>Estate - {selectedSearchValues.estateName}</left></h4>
                <div>&nbsp;</div>
                <h4><left>Division - {selectedSearchValues.divisionName == undefined ? 'All Divisions' : selectedSearchValues.divisionName}</left></h4>
                <div>&nbsp;</div>
                <h4><left>Date - {selectedSearchValues.monthName} {selectedSearchValues.year}</left></h4>
                <div>&nbsp;</div>
                <br></br>
                <div>

                    <Table size="small" aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}> Division </TableCell>
                                <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}> Union </TableCell>
                                <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}> Month </TableCell>
                                <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}> Total </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {checkRollDeductionViewData.map((group, i) => {
                                return (
                                    <React.Fragment key={i}>
                                        {group.details.map((grp, j) => {
                                            return (
                                                <React.Fragment key={`${i}-${j}`}>
                                                    {grp.detailsx.map((detail, k) => {
                                                        return (
                                                            <TableRow key={`${i}-${j}-${k}`}>
                                                                {j === 0 && k === 0 && (
                                                                    <TableCell rowSpan={group.details.reduce((acc, val) => acc + val.detailsx.length, 0)} component="th" scope="row" align="left" style={{ border: "1px solid black", fontWeight: 'bolder' }}>{group.divisionName}</TableCell>
                                                                )}
                                                                {k === 0 && (
                                                                    <TableCell rowSpan={grp.detailsx.length} align="left" style={{ border: "1px solid black", fontWeight: 'bolder' }}>{grp.unionName}</TableCell>
                                                                )}
                                                                <TableCell component="th" scope="row" align="left" style={{ border: "1px solid black" }}>{detail.month}</TableCell>
                                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{parseFloat(detail.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                            <TableRow>
                                <TableCell colSpan={3} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>Total</TableCell>
                                <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                <div>&nbsp;</div>
            </div>
        );
    }
}

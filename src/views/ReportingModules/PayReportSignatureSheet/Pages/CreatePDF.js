import React from "react";
import {
    Box,
    TableBody,
    TableCell,
    TableRow,
    Table,
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const BalancePaymentDetails = this.props.BalancePaymentDetails;
        const SearchData = this.props.SearchData;
        return (
    <div style={{backgroundColor:'white'}}>
                <style>
                    {`
                @page {
                    size: A4 landscape;
                }
                `}
                </style>
                <h2><left><u>Balance Pay Report</u></left></h2>
                <div>&nbsp;</div>
                <h4><left>{SearchData.groupName} - {SearchData.estateName} ({SearchData.month} - {SearchData.year})</left></h4>
                <div>&nbsp;</div>
                <br></br>
                <div>
                    <Box minWidth={1050}>
                        {BalancePaymentDetails.length > 0 ?

                            <Table aria-label="sticky table" size="small">
                                {/* <TableHead> */}
                                <TableRow>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }}>NO</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px" }}>Employee Number</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px" }}>Employee Name</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px" }}>Payble Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px" }}>Signature</TableCell>

                                    
                                </TableRow>
                                {/* </TableHead> */}
                                <TableBody>
                                    {BalancePaymentDetails.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} style={{ border: "1px solid black" }}>{index + 1}</TableCell>
                                            <TableCell align={'center'} style={{ border: "1px solid black" }}>{data.registrationNumber}</TableCell>
                                            <TableCell align={'center'} style={{ border: "1px solid black" }}>{data.employeeName}</TableCell>
                                            <TableCell align={'center'} style={{ border: "1px solid black" }}>{data.paymentAmount}</TableCell>
                                            <TableCell align={'center'} style={{ border: "1px solid black" }}></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>                            
                            </Table>
                            : null}
                    </Box>
                </div>
                <div>&nbsp;</div>
            </div>
        );
    }
}

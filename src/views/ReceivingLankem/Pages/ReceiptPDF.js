import React from "react";
import {
    Box,
    TableBody,
    TableCell,
    TableRow,
    Table,
    Grid,
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const generalJournal = this.props.generalJournal;
        const receiptBankData = this.props.receiptBankData;
        const customers = this.props.customers;
        const journalData = this.props.journalData;
        const totalValues = this.props.totalValues;


        var customerID;
        var customerName;
        var bankName;
        var branchName;
        var paymentTypeID;

        if (Array.isArray(customers)) {
            customerID = generalJournal.customerID;

            if (customerID >= 0 && customerID < customers.length) {
                customerName = customers[customerID] || "Unknown Customer";
            }
        }


        if (Array.isArray(receiptBankData)) {
            const matchingReceipt = receiptBankData.find(data => data.customerID === customerID);
            if (matchingReceipt) {
                bankName = matchingReceipt.bankName;
                branchName = matchingReceipt.branchName;
                paymentTypeID = matchingReceipt.paymentTypeID;
            }
        }

        const selectedDate = this.props.selectedDate;
        const formattedDate = new Date(selectedDate).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const amount = journalData.length > 0 ? journalData[0].credit : 0.00;

        const numberToWords = (num) => {
            const ones = [
                "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"
            ];
            const teens = [
                "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
            ];
            const tens = [
                "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
            ];
            const thousands = ["", "Thousand", "Million", "Billion"];

            if (num === 0) return "Zero";

            const chunkToWords = (chunk) => {
                const chunkWords = [];

                if (chunk >= 100) {
                    chunkWords.push(ones[Math.floor(chunk / 100)]);
                    chunkWords.push("Hundred");
                    chunk %= 100;
                }

                if (chunk >= 20) {
                    chunkWords.push(tens[Math.floor(chunk / 10)]);
                    chunk %= 10;
                } else if (chunk >= 10) {
                    chunkWords.push(teens[chunk - 10]);
                    chunk = 0;
                }

                if (chunk > 0) {
                    chunkWords.push(ones[chunk]);
                }

                return chunkWords;
            };

            const words = [];
            let chunkCount = 0;

            while (num > 0) {
                const chunk = num % 1000;
                if (chunk > 0) {
                    const chunkWords = chunkToWords(chunk);
                    if (chunkCount > 0) {
                        chunkWords.push(thousands[chunkCount]);
                    }
                    words.unshift(...chunkWords);
                }
                num = Math.floor(num / 1000);
                chunkCount++;
            }

            return words.join(" ");
        };

        const totalAmount = totalValues.totalAmount;

        const formatAmountInWords = (totalAmount) => {
            const [integerPart, decimalPart] = totalAmount.toFixed(2).split('.');

            const integerInWords = numberToWords(parseInt(integerPart, 10));
            const decimalInWords = numberToWords(parseInt(decimalPart, 10));

            return `${integerInWords} Rupees and ${decimalInWords} Cents`;
        };

        const formatAmount = (amount) => {
            const [integerPart, decimalPart] = amount.toFixed(2).split('.');
            const formattedIntegerPart = parseInt(integerPart, 10).toLocaleString();
            return `${formattedIntegerPart}.${decimalPart}`;
        };

        const amountInWords = formatAmountInWords(totalAmount);
        const { integerPart, decimalPart } = formatAmount(amount);

        const formattedAmount = formatAmount(amount);

        const getPaymentMethods = (paymentTypeID) => {
            switch (paymentTypeID) {
                case 1:
                    return (
                        <>
                            <span style={{ textDecoration: 'line-through' }}>Cheque</span> / <span style={{ textDecoration: 'line-through' }}>Cash</span> / <span>Online transfer</span>
                        </>
                    );
                case 2:
                    return (
                        <>
                            <span>Cheque</span> / <span style={{ textDecoration: 'line-through' }}>Cash</span> / <span style={{ textDecoration: 'line-through' }}>Online transfer</span>
                        </>
                    );
                case 3:
                    return (
                        <>
                            <span style={{ textDecoration: 'line-through' }}>Cheque</span> / <span>Cash</span> / <span style={{ textDecoration: 'line-through' }}>Online transfer</span>
                        </>
                    );
                default:
                    return (
                        <>
                            <span>Cheque</span> / <span>Cash</span> / <span>Online transfer</span>
                        </>
                    );
            }
        };
        return (
            <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
                <Box minWidth={1050}>
                    <Grid style={{ display: "flex" }}>
                        <Grid style={{ flex: 1 }}>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="right"> </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "40px", width: "50%", padding: "0", textAlign: "center", fontWeight: "bold" }} align="right"> Receipt </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="right"> </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <Table size="small" >
                                <TableBody>
                                    <TableCell style={{ border: "1px ", fontSize: "20px", width: "20%" }} align="right"> </TableCell>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "20px", fontWeight: "bold" }} align="left"> Receipt No&nbsp;&nbsp; - &nbsp;&nbsp;{generalJournal.referenceNumber} </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "20px", fontWeight: "bold" }} align="left"> Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;{formattedDate} </TableCell>
                                    </TableRow>
                                </TableBody>
                                <div style={{ marginBottom: "50px" }}></div>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} style={{ border: "1px ", fontSize: "20px" }} align="left">   Received from <b>{customerName}</b> the sum of <b>rupees {amountInWords}</b> by {getPaymentMethods(paymentTypeID)}.</TableCell>
                                    </TableRow>
                                    <div style={{ marginBottom: "50px" }}></div>
                                </TableBody>
                                <div style={{ marginBottom: "20px" }}></div>
                                <TableBody>
                                    <TableCell style={{ border: "1px ", fontSize: "20px", width: "20%" }} align="right"> </TableCell>
                                    <TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", fontWeight: "bold" }} align="left"> Bank&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;{bankName}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", fontWeight: "bold" }} align="left"> Branch&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;{branchName}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", fontWeight: "bold" }} align="left"> Cheque No&nbsp;&nbsp; - &nbsp;&nbsp;</TableCell>
                                    </TableRow>
                                    <div style={{ marginBottom: "40px" }}></div>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "25px", fontWeight: "bold" }} align="left"> Received Amount&nbsp;&nbsp; - &nbsp;&nbsp;Rs. {totalValues.totalAmount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })} </TableCell>
                                    </TableRow>
                                </TableBody>
                                <div style={{ marginBottom: "200px" }}></div>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "30px", fontWeight: "bold" }} align="left">
                                            ………………………………………..
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "30px", fontWeight: "bold" }} align="left">
                                            Authorized by
                                        </TableCell>
                                    </TableRow>
                                    <TableRow></TableRow>
                                    <TableRow >
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "25px", fontWeight: "bold" }} align="left">
                                            Finance Manager
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Grid>
                    </Grid>
                </Box>
            </div>
        );
    }
}
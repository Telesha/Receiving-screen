import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
    Box,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    Table,
    Grid,
    TableFooter,
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const generalJournal = this.props.generalJournal;
        const journalData = this.props.journalData;

        const suppliers = this.props.suppliers;
        const printDate = this.props.printDate;
        const totalValues = this.props.totalValues;
        const supplierNamePDF = this.props.supplierNamePDF;
        var supplierID;
        var supplierName;

        if (Array.isArray(suppliers)) {
            supplierID = generalJournal.supplierID;

            if (supplierID >= 0 && supplierID < suppliers.length) {
                supplierName = suppliers[supplierID] || "Unknown Customer";
            }
        }

        const suppliersPaymentID = this.props.suppliersPaymentID;
        const selectedDate = this.props.selectedDate;
        const formattedDate = new Date(selectedDate).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const description = journalData.length > 0 ? journalData[0].description : 'No description available';
        const amount = journalData.length > 0 ? journalData[0].debit : 0;
        const numberToWords = (num) => {
            const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
            const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
            const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
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
            return {
                integerPart: parseInt(integerPart, 10).toLocaleString(),
                decimalPart
            };
        };


        const formattedAmount = formatAmount(totalAmount);


        const amountInWords = formatAmountInWords(totalAmount);

        const { integerPart, decimalPart } = formatAmount(amount);
        const { integerPart: totalIntegerPart, decimalPart: totalDecimalPart } = formatAmount(totalValues.totalAmount);

        return (
            // <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
            <div style={{ backgroundColor: 'white', minHeight: '100vh', border: '1px solid black', padding: '16px' }}>
                <Box minWidth={1050}>
                    <Grid style={{ display: "flex" }}>
                        <Grid style={{ flex: 1 }}>
                            <Table size="small" >
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="center"> <h1>{generalJournal.groupName}</h1></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="center"> <h2>{generalJournal.estateName}</h2></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ padding: "0", textAlign: "center", border: "none" }} align="center">
                                            <div style={{ border: "1px solid black", display: "inline-block", fontSize: "20px", backgroundColor: "white", color: "black", padding: "4px 8px" }}>
                                                PAYMENT VOUCHER
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="right"> </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="right"> </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="left"></TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", width: "25%" }} align="left"> <b>Voucher No : </b> {generalJournal.referenceNumber} </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="left">  </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="right"> </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="left"></TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", width: "25%" }} align="left"> <b>Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :</b> {formattedDate} </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="left">  </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="right"> </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="left"></TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", width: "25%" }} align="left"><b> Cheque / FT : </b> {generalJournal.modeoftransactionID == 3 ? 'Cash' : generalJournal.modeoftransactionNumber > 0 ? generalJournal.modeoftransactionNumber : '-'} </TableCell>
                                    </TableRow>
                                </TableBody>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "20px" }} align="left"> <b>Pay to :</b> {supplierNamePDF}</TableCell>
                                    </TableRow>
                                    <div style={{ marginBottom: "50px" }}></div>
                                </TableBody>
                                <TableCell colSpan={4} style={{ border: "0px", padding: "0" }}>
                                    <Table style={{ borderBottom: "0px", width: "100%", maxWidth: "272mm" }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Account No
                                                </TableCell>
                                                <TableCell align="left" colSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Ledger & Narration
                                                </TableCell>
                                                <TableCell align="right" colSpan={2} style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    Amount (LKR)
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {journalData.map((x, index) => {
                                                const { integerPart, decimalPart } = formatAmount(x.debit);
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>{x.ledgerAccountCode}</TableCell>
                                                        <TableCell colSpan={2} align="left" style={{ border: "1px solid black" }}>
                                                            <div>
                                                                <div style={{ fontWeight: "bold" }}>{x.ledgerAccountName}</div>
                                                                <div>{x.description == '' ? 'No description available' : x.description}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>{integerPart}</TableCell>
                                                        <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>{decimalPart}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell style={{ border: "1px ", fontSize: "20px" }} align="left"> <b>Amount in words : </b></TableCell>
                                                <TableCell style={{ border: "1px ", fontSize: "20px" }} align="left"> {amountInWords} only.</TableCell>
                                                <TableCell align="left" style={{ border: "1px solid black", fontWeight: "bold" }}>
                                                    Total
                                                </TableCell>
                                                <TableCell align="right" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    {totalIntegerPart}
                                                </TableCell>
                                                <TableCell align="left" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                                    {totalDecimalPart}
                                                </TableCell>
                                            </TableRow>
                                            <div>&nbsp;</div>
                                        </TableBody>
                                    </Table>
                                </TableCell>
                                <div style={{ marginBottom: "50px" }}></div>
                                <TableBody>
                                    {/* <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "20px" }} align="left"> <b>Amount in words - </b>{amountInWords} only.</TableCell>
                                    </TableRow> */}
                                    <div>&nbsp;</div>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "20px" }} align="left"> <b>Payee : </b>{supplierNamePDF} </TableCell>
                                    </TableRow>
                                </TableBody>
                                <div style={{ marginBottom: "30%" }}></div>
                                <TableBody>
                                    <TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Prepared by: </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Checked by: </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Approved by: </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Received by: </TableCell>
                                    </TableRow>
                                    <div style={{ marginBottom: "125px" }}></div>
                                    <TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> .......................................</TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> .......................................</TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> .......................................</TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> .......................................</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Signature & Date </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Signature & Date </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Signature & Date</TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Signature & Date</TableCell>
                                    </TableRow>
                                </TableBody>
                                <div style={{ marginBottom: "20%" }}></div>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "20px" }}> --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="center"> <u>RECEIPT</u></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={2} style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="left"> Received from <b>{generalJournal.groupName}</b> the sum of </TableCell>
                                        <TableCell
                                            colSpan={2}
                                            style={{ border: "1px", fontSize: "20px", width: "25%", fontWeight: "bold" }}
                                            align="left"
                                        >
                                            {totalValues.totalAmount.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </TableCell>                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="left"> {amountInWords.toUpperCase()} ONLY. </TableCell>
                                    </TableRow>
                                    <div style={{ marginBottom: "20px" }}></div>
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="left"> By Cash/Cheque No ....................................... of .......................................</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={3} style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="left">National ID No / Date ............................................................</TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "20px", width: "25%" }} align="left"> Recipient</TableCell>
                                    </TableRow>
                                </TableBody>

                                <div style={{ marginBottom: "25px" }}></div>
                                <TableFooter>
                                    {/*<TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Prepared by: </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Checked by: </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Approved by: </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Received by: </TableCell>
                                    </TableRow>
                                    <div style={{ marginBottom: "125px" }}></div>
                                    <TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> .......................................</TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> .......................................</TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> .......................................</TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> .......................................</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Signature & Date </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Signature & Date </TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Signature & Date</TableCell>
                                        <TableCell style={{ border: "1px ", fontSize: "15px", fontWeight: "bold" }} align="center"> Signature & Date</TableCell>
                                    </TableRow>*/}
                                    <TableRow>
                                        <TableCell colSpan={2} align="left" style={{ border: "1px" }}>User :  {generalJournal.preparedBy}</TableCell>
                                        <TableCell colSpan={2} align="right" style={{ border: "1px" }}>Date : {printDate}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </Grid>
                    </Grid>
                </Box>
            </div>
        );
    }
}
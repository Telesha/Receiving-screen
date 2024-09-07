import React from "react";
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table
} from '@material-ui/core';
export default class ComponentToPrint extends React.Component {
    render() {
        const accountsReceivableDetails = this.props.accountsReceivableDetails;
        const SearchData = this.props.SearchData;
        const accountsReceivableWithAgingInput = this.props.accountsReceivableWithAgingInput;
        return (
            <div>
                <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
                <h2><center><u>Accounts Receivable Report</u></center></h2>
                <div>&nbsp;</div>
                <h3><center>{SearchData.groupName} - {SearchData.factoryName} ({SearchData.startDate} - {SearchData.endDate})</center></h3>
                <div>&nbsp;</div>
                
                <div>
                    <Box minWidth={1050}>
                        <TableContainer style={{ marginLeft: '0rem' }} >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Customer Name</TableCell>
                                        <TableCell align={'center'}>Invoice No</TableCell>
                                        <TableCell align={'center'}>Invoice Date</TableCell>
                                        <TableCell align={'center'}>Invoice Amount</TableCell>
                                        <TableCell align={'center'}>Payment Terms</TableCell>
                                        <TableCell align={'center'}>Amount Received</TableCell>
                                        <TableCell align={'center'}>Date Received</TableCell>
                                        <TableCell align={'center'}>Due Date</TableCell>
                                        <TableCell align={'center'}>Amount Outstanding</TableCell>
                                        <TableCell align={'center'}>Days Past</TableCell>
                                        <TableCell align={'center'}>Remarks</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {accountsReceivableDetails.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                 {data.customerName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.invoiceNo}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                 {data.invoiceDate.split('T')[0]}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.invoiceAmount.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.paymentTerms}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.amountReceived.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.dateReceived.split('T')[0]}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.dueDate.split('T')[0]}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.amountOutstanding.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.daysPast}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.remarks}
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
            </div>
        );

    }

}
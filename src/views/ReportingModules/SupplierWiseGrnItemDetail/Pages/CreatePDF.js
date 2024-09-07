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
import moment from 'moment';
export default class ComponentToPrint extends React.Component {
    render() {
        const supplierWiseGrnItemDetails = this.props.supplierWiseGrnItemDetails;
        const SearchData = this.props.SearchData;
        const supplierGrnDetail = this.props.supplierGrnDetail;
        const fromDate = this.props.fromDate;
        const toDate = this.props.toDate;
        
        return (
            <div>
                <h2><center><u>Supplier Wise GRN Item Detail Report</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{SearchData.groupName} - {SearchData.factoryName}</center></h2>
                <div>&nbsp;</div>
                <h2><center>{moment(fromDate).format('').split('T')[0]} - { moment(toDate).format('').split('T')[0]}</center></h2>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Supplier Name</TableCell>
                                        <TableCell align={'center'}>Item catogory</TableCell>
                                        <TableCell align={'center'}>Item</TableCell>
                                        <TableCell align={'center'}>PO number</TableCell>
                                        <TableCell align={'center'}>Invoice number</TableCell>
                                        <TableCell align={'center'}>Invoice date</TableCell>
                                        <TableCell align={'center'}>Item receive date</TableCell>
                                        <TableCell align={'center'}>Quantity</TableCell>
                                        <TableCell align={'center'}>Unit price</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {supplierWiseGrnItemDetails.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                 {data.supplierName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.itemCatogory}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                 {data.item}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.purchaseOrderNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.invoiceNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.invoiceDate}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.itemReceivedDate}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.quantity}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.unitPrice}
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
        );

    }

}
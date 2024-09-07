import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
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
        const StockBalanceDetails = this.props.StockBalanceDetails;
        const SearchData = this.props.SearchData;
        const StockBalanceReportInput = this.props.StockBalanceReportInput;
        return (
            <div>
                <h2><center><u>Available GRN Report</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{SearchData.groupName} - {SearchData.factoryName}</center></h2>
                <div>&nbsp;</div>
                <h2><center>{StockBalanceReportInput.date}</center></h2>
                <div>
                    <Box minWidth={1500}>
                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Item Category</TableCell>
                                        <TableCell align={'center'}>Factory Item</TableCell>
                                        <TableCell align={'center'}>GRN Number</TableCell>
                                        <TableCell align={'center'}>Supplier</TableCell>
                                        <TableCell align={'center'}>Quantity</TableCell>
                                        <TableCell align={'center'}>Unit Price (LKR)</TableCell>
                                        <TableCell align={'center'}>Total Price (LKR)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {StockBalanceDetails.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.categoryName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.itemName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.grnNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.supplierName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.quantity}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.unitPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {(data.quantity * data.unitPrice).toFixed(2)}
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
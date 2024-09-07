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
        const StockBalanceDetails = this.props.StockBalanceDetails;
        const SearchData = this.props.SearchData;
        const StockBalanceReportInput = this.props.StockBalanceReportInput;
        return (
            <div>
                <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
                <h2><center><u>Stock View Report</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{SearchData.groupName} - {SearchData.factoryName}</center></h2>
                <div>&nbsp;</div>
                <h2><center>{StockBalanceReportInput.date}</center></h2>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer style={{ marginLeft: '0rem' }} >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Item Category</TableCell>
                                        <TableCell align={'center'}>Item Code</TableCell>
                                        <TableCell align={'center'}>Item</TableCell>
                                        <TableCell align={'center'}>Available Quantity</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {StockBalanceDetails.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                 {data.categoryName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.itemCode}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                 {data.itemName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.availableQuantity}
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
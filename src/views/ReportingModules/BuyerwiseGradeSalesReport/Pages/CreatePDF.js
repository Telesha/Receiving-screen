import React from "react";
import {
    Box, Card, Grid, TextField, Container, CardContent, Divider, CardHeader,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

    render() {
        const reportData = this.props.reportData;
        const totalAmount = this.props.totalAmount;
        const searchData = this.props.searchData;
        const grandTotal = this.props.grandTotal;


        return (
            <div>
                <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
                    <br />
                    <h2><center><u>Buyer Wise Grade Sales Report</u></center></h2>
                    <h3><center>{searchData.groupName} - {searchData.factoryName}  {searchData.startDate} - {searchData.endDate}</center></h3>
                    <div>&nbsp;</div>
                    <div>
                        <Box minWidth={1050}>
                            <TableContainer>
                                <Table aria-label="caption table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align={'center'}>
                                                Buyer Name
                                            </TableCell>
                                            <TableCell align={'center'}>
                                                Grade Name
                                            </TableCell>
                                            <TableCell align={'center'}>
                                                Qty
                                            </TableCell>
                                            <TableCell align={'center'}>
                                                Amount
                                            </TableCell>
                                            {/* <TableCell align={'center'}>
                                                Average
                                            </TableCell> */}
                                            <TableCell align={'center'}>
                                                Buying %
                                            </TableCell>

                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reportData != null || reportData.length != 0
                                            ? reportData.map(item => (
                                                <>
                                                    {item.buyerWiseGradeSalesList.map((data1, index) => (
                                                        <TableRow>
                                                            {index == 0 ? (
                                                                <>
                                                                    <TableCell
                                                                        align={'center'}
                                                                        rowSpan={item.buyerWiseGradeSalesList.length}
                                                                    >
                                                                        {item.buyerName}
                                                                    </TableCell>
                                                                </>
                                                            ) : null}

                                                            <TableCell align={'center'}>
                                                                {data1.gradeName}
                                                            </TableCell>
                                                            <TableCell align={'center'}>
                                                                {data1.netWeight}
                                                            </TableCell>
                                                            <TableCell align={'center'}>
                                                                {data1.value}
                                                            </TableCell>
                                                            {/* <TableCell align={'center'}>
                                                                {(Number(data1.netWeight) / Number(data1.value)).toFixed(2)}
                                                            </TableCell> */}
                                                            <TableCell align={'center'}>

                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow
                                                        style={{ backgroundColor: '#ffffe0' }}
                                                    >
                                                        <TableCell align={'center'}></TableCell>
                                                        <TableCell align={'center'} style={{ fontWeight: 'bold' }}>Totals</TableCell>
                                                        <TableCell align={'center'}>{item.buyerWiseGradeSalesList.netWeight}</TableCell>
                                                        <TableCell
                                                            align={'center'}
                                                        >
                                                            {item.buyerWiseGradeSalesList.value}
                                                        </TableCell>
                                                        <TableCell align={'center'}></TableCell>
                                                        <TableCell align={'center'}></TableCell>

                                                    </TableRow>
                                                </>
                                            ))
                                            : null}
                                    </TableBody>
                                    <TableRow style={{ background: '#ADD8E6' }}>
                                        <TableCell
                                            align={'center'}
                                            component="th"
                                            scope="row"
                                            style={{ fontWeight: 'bold' }}
                                        >
                                            Grand Total
                                        </TableCell>
                                        <TableCell
                                            align={'center'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none' }}
                                        ></TableCell>
                                        <TableCell
                                            align={'center'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none' }}
                                        >{grandTotal.qtyTotal}</TableCell>

                                        <TableCell
                                            align={'center'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none' }}
                                        >
                                            {grandTotal.valueTotal}
                                        </TableCell>
                                        <TableCell
                                            align={'center'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none' }}
                                        >
                                        </TableCell>
                                        <TableCell
                                            align={'center'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none' }}
                                        >
                                        </TableCell>
                                    </TableRow>
                                </Table>
                            </TableContainer>
                        </Box>
                    </div>
                </div></div>
        );

    }

}

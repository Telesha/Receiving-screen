import React from "react";
import {
    Box, Card, Grid, TextField, Container, CardContent, Divider, CardHeader,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

    render() {
        const reportData = this.props.reportData;
        const searchData = this.props.searchData;
        const totalAmounts = this.props.totalAmounts;


        return (
            <div>
                <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
                    <br />
                    <h2><center><u>Buyer Wise Sales Report</u></center></h2>
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
                                                Qty
                                            </TableCell>
                                            <TableCell align={'center'}>
                                                Amount
                                            </TableCell>
                                            <TableCell align={'center'}>
                                                Average
                                            </TableCell>
                                            <TableCell align={'center'}>
                                                Buying %
                                            </TableCell>

                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reportData.map((data, index) => (
                                            <TableRow key={index}>
                                                <TableCell
                                                    align={'center'}
                                                    component="th"
                                                    scope="row"
                                                    style={{ borderBottom: 'none' }}
                                                >
                                                    {data.buyerName}
                                                </TableCell>
                                                <TableCell
                                                    align={'center'}
                                                    component="th"
                                                    scope="row"
                                                    style={{ borderBottom: 'none' }}
                                                >
                                                    {data.netWeight}
                                                </TableCell>

                                                <TableCell
                                                    align={'center'}
                                                    component="th"
                                                    scope="row"
                                                    style={{ borderBottom: 'none' }}
                                                >
                                                    {data.value}
                                                </TableCell>
                                                <TableCell
                                                    align={'center'}
                                                    component="th"
                                                    scope="row"
                                                    style={{ borderBottom: 'none' }}
                                                >
                                                    {(Number(data.value) / Number(data.netWeight)).toFixed(2)}
                                                </TableCell>
                                                <TableCell
                                                    align={'center'}
                                                    component="th"
                                                    scope="row"
                                                    style={{ borderBottom: 'none' }}
                                                >
                                                    {((data.netWeight / totalAmounts.qtyTotal) * 100).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableRow style={{ background: '#ADD8E6' }}>
                                        <TableCell
                                            align={'center'}
                                            component="th"
                                            scope="row"
                                            style={{ fontWeight: 'bold' }}
                                        >
                                            Total
                                        </TableCell>
                                        <TableCell
                                            align={'center'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none' }}
                                        >{totalAmounts.qtyTotal}</TableCell>
                                        <TableCell
                                            align={'center'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none' }}
                                        >{totalAmounts.totAmount}</TableCell>

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

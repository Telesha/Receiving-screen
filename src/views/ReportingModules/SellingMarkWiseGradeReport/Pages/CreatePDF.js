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
                    <h2><center><u>Selling Mark Wise Grade Report</u></center></h2>
                    <h3><center>{searchData.groupName} - {searchData.factoryName}  {searchData.startDate} - {searchData.endDate}</center></h3>
                    <div>&nbsp;</div>
                    <div>
                        <Box minWidth={1050}>
                            <TableContainer>
                                <Table aria-label="caption table">
                                    <TableHead>
                                        <TableRow>

                                            <TableCell align={'center'}>
                                                Selling Mark
                                            </TableCell>
                                            <TableCell align={'center'}>
                                                Grade Name
                                            </TableCell>
                                            <TableCell align={'center'}>
                                                Net Qty
                                            </TableCell>
                                            <TableCell align={'center'}>
                                                Received Amount Per Lot
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reportData != null || reportData.length != 0
                                            ? reportData.map(item => (
                                                <>
                                                    {item.sellingMarkWiseGradeReportList.map((data1, index) => (
                                                        <TableRow>
                                                            {index == 0 ? (
                                                                <>
                                                                    <TableCell
                                                                        align={'center'}
                                                                        rowSpan={item.sellingMarkWiseGradeReportList.length}
                                                                    >
                                                                        {item.sellingMarkName}
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
                                                                {data1.valuePerLot}
                                                            </TableCell>

                                                        </TableRow>
                                                    ))}
                                                    <TableRow
                                                        style={{ backgroundColor: '#ffffe0' }}
                                                    >
                                                        <TableCell align={'center'}></TableCell>
                                                        <TableCell align={'center'} style={{ fontWeight: 'bold' }}>Totals</TableCell>
                                                        <TableCell align={'center'}>{item.sellingMarkWiseGradeReportList.netWeight}</TableCell>
                                                        <TableCell
                                                            align={'center'}
                                                            style={{ fontWeight: 'bold' }}
                                                        >
                                                            {item.sellingMarkWiseGradeReportList.valuePerLot}
                                                        </TableCell>


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
                                    </TableRow>
                                </Table>
                            </TableContainer>
                        </Box>
                    </div>
                </div></div>
        );

    }

}

import React from "react";
import {
    Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Table
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

    render() {
        const gradeWiseSummaryDetails = this.props.gradeWiseSummaryDetails;
        const searchData = this.props.searchData;
        const grandTotal = this.props.grandTotal;
        const mainGradeTotal = this.props.mainGradeTotal;
        const offGradeTotal = this.props.offGradeTotal;
        return (
            <div>
                <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
                    <br />
                    <h2><center><u>Grade Wise Summary Report</u></center></h2>
                    <h3><center>{searchData.groupName} - {searchData.factoryName} - {searchData.startDate} - {searchData.endDate}</center></h3>
                    <div>&nbsp;</div>
                    <div>
                        <Box minWidth={1050}>
                            <TableContainer >
                                <Table aria-label="caption table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align={'left'}>Grade</TableCell>
                                            <TableCell align={'right'}>Net Qty (Kg)</TableCell>
                                            <TableCell align={'right'}>Proceeds (Rs)</TableCell>
                                            <TableCell align={'right'}>Quantity %</TableCell>
                                            <TableCell align={'right'}>Average (Rs)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {gradeWiseSummaryDetails.map((data, index) => (
                                            <TableRow key={index}
                                            >
                                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    {data.grade}
                                                </TableCell>
                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    {data.netQuantity}
                                                </TableCell>
                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    {data.proceeds}
                                                </TableCell>
                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    {data.quantity.toFixed(2)}
                                                </TableCell>
                                                <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    {data.average.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableRow style={{ background: '#ADD8E6' }}>
                                        <TableCell
                                            align={'left'}
                                            component="th"
                                            scope="row"
                                            style={{ fontWeight: 'bold' }}
                                        >
                                            Total
                                        </TableCell>
                                        <TableCell
                                            align={'right'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                        >
                                        {grandTotal.quantityTotal}
                                        </TableCell>
                                        <TableCell
                                            align={'right'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                        >
                                        {grandTotal.proceedsTotal}
                                        </TableCell>
                                        <TableCell
                                            align={'center'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none' }}
                                        >
                                        </TableCell>
                                        <TableCell
                                            align={'right'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none' }}
                                        >
                                        </TableCell>
                                    </TableRow>

                                    <TableRow style={{ background: '#ADD8E6' }}>
                                        <TableCell
                                            align={'left'}
                                            component="th"
                                            scope="row"
                                            style={{ fontWeight: 'bold' }}
                                        >
                                            Main Grade
                                        </TableCell>
                                        <TableCell
                                            align={'right'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                        >{mainGradeTotal.maintotalQuantity}
                                        </TableCell>
                                        <TableCell
                                            align={'right'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none', fontWeight: 'bold' }}

                                        >{mainGradeTotal.maintotalProceeds}
                                        </TableCell>

                                        <TableCell
                                            align={'right'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                        >
                                          {mainGradeTotal.mainGradeQtyPercentage.toFixed(2)}
                                        </TableCell>
                                        <TableCell
                                            align={'right'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                        >
                                        {mainGradeTotal.mainGradeAvgPercentage.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow style={{ background: '#ADD8E6' }}>
                                        <TableCell
                                            align={'left'}
                                            component="th"
                                            scope="row"
                                            style={{ fontWeight: 'bold' }}
                                        >
                                            Off Grade
                                        </TableCell>
                                        <TableCell
                                            align={'right'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                        >{offGradeTotal.offtotalQuantity}
                                        </TableCell>
                                        <TableCell
                                            align={'right'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none', fontWeight: 'bold' }}

                                        >{offGradeTotal.offtotalProceeds}
                                        </TableCell>

                                        <TableCell
                                            align={'right'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                        >
                                        {offGradeTotal.offGradeQtyPercentage.toFixed(2)}
                                        </TableCell>
                                        <TableCell
                                            align={'right'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none', fontWeight: 'bold' }}
                                        >
                                        {offGradeTotal.offGradeAvgPercentage.toFixed(2)}
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

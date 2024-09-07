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

        const QuantityData = this.props.QuantityData;
        const GradeData = this.props.GradeData;
        const TeaSummaryReportSearchData = this.props.TeaSummaryReportSearchData;

        return (
            <div>
                <div>&nbsp;</div>
                <h2><center><u>Tea Sales Summary Report</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{TeaSummaryReportSearchData.groupName} - {TeaSummaryReportSearchData.factoryName}</center></h2>
                <div>&nbsp;</div>
                <h3><center>{TeaSummaryReportSearchData.startDate} - {TeaSummaryReportSearchData.endDate} </center></h3>
                <div>
                    <Box minWidth={1050}>
                        {QuantityData.length > 0 ?
                            <TableContainer >
                                <Table aria-label="caption table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell rowSpan={2} align={'center'} style={{ border: "2px solid black" }}>Description</TableCell>
                                            <TableCell colspan={2} align={'center'} style={{ border: "2px solid black" }}>Average(Rs)</TableCell>
                                            <TableCell colspan={2} align={'center'} style={{ border: "2px solid black" }}>Quantity</TableCell>
                                            <TableCell colspan={2} align={'center'} style={{ border: "2px solid black" }}>Proceeds(Rs)</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell align={'center'} style={{ border: "2px solid black" }}>Valuation</TableCell>
                                            <TableCell align={'center'} style={{ border: "2px solid black" }}>Sales</TableCell>
                                            <TableCell align={'center'} style={{ border: "2px solid black" }}>Valuation</TableCell>
                                            <TableCell align={'center'} style={{ border: "2px solid black" }}>Sales</TableCell>
                                            <TableCell align={'center'} style={{ border: "2px solid black" }}>Valuation</TableCell>
                                            <TableCell align={'center'} style={{ border: "2px solid black" }}>Sales</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {QuantityData.map((data, index) => (
                                            <TableRow key={index}>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {data.description}
                                                </TableCell>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {data.averageValuation?.toFixed(2)}
                                                </TableCell>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {data.averageSales?.toFixed(2)}
                                                </TableCell>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {data.valuationQuantity?.toFixed(2)}
                                                </TableCell>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {data.salesQuantity?.toFixed(2)}
                                                </TableCell>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {data.valuationVAmount?.toFixed(2)}
                                                </TableCell>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {data.salesSAmount?.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer> : null}
                    </Box>
                    <br />
                    <Box minWidth={1050}>
                        {GradeData.length > 0 ?
                            <TableContainer >
                                <Table aria-label="caption table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell rowSpan={2} align={'center'} style={{ border: "2px solid black" }}>Description</TableCell>
                                            <TableCell colspan={2} align={'center'} style={{ border: "2px solid black" }}>Main Grade</TableCell>
                                            <TableCell colspan={2} align={'center'} style={{ border: "2px solid black" }}>Off Grade</TableCell>
                                            <TableCell align={'center'} style={{ border: "2px solid black" }}>Total</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell align={'center'} style={{ border: "2px solid black" }}>Quantity(Kg)</TableCell>
                                            <TableCell align={'center'} style={{ border: "2px solid black" }}>%</TableCell>
                                            <TableCell align={'center'} style={{ border: "2px solid black" }}>Quantity(Kg)</TableCell>
                                            <TableCell align={'center'} style={{ border: "2px solid black" }}>%</TableCell>
                                            <TableCell align={'center'} style={{ border: "2px solid black" }}>Quantity(Kg)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {GradeData.map((data, index) => (
                                            <TableRow key={index}>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {data.description}
                                                </TableCell>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {data.salesQuantity?.toFixed(2)}
                                                </TableCell>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {((data.salesQuantity / QuantityData[index].salesQuantity) * 100)?.toFixed(2)}
                                                </TableCell>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {((QuantityData[index].salesQuantity) - (data.salesQuantity))?.toFixed(2)}
                                                </TableCell>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {((((QuantityData[index].salesQuantity) - (data.salesQuantity)) / (QuantityData[index].salesQuantity)) * 100)?.toFixed(2)}
                                                </TableCell>
                                                <TableCell align={'center'} component="th" scope="row" style={{ border: "2px solid black" }}>
                                                    {QuantityData[index].salesQuantity?.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer> : null}
                    </Box>
                </div>
                <div>&nbsp;</div>
                <h3><center>***** End of List *****</center></h3>
            </div>
        );

    }

}
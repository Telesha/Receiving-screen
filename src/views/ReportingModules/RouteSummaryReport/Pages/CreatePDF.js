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

        const routeSummaryData = this.props.routeSummaryData;
        const routeSummaryTotal = this.props.routeSummaryTotal;
        const searchData = this.props.searchData;

        return (
            <div>

                <h2><center><u>Route Summary</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{searchData.factoryName} - {searchData.groupName}</center></h2>
                <div>&nbsp;</div>
                <h3><center>{searchData.date} </center></h3>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Route</TableCell>
                                        <TableCell align={'center'}>Route Code</TableCell>
                                        <TableCell align={'center'}>Registred</TableCell>
                                        <TableCell align={'center'}>Dealers</TableCell>
                                        <TableCell align={'center'}>Small</TableCell>
                                        <TableCell align={'center'}>Estates</TableCell>
                                        <TableCell align={'center'}>Active Last Month</TableCell>
                                        <TableCell align={'center'}>Target</TableCell>
                                        <TableCell align={'center'}>Last Month</TableCell>
                                        <TableCell align={'center'}>Last 3 Month Avg</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {routeSummaryData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeCode}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.registered}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.dealer}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.supplier}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.estate}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.customerCountForLastMonth}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {parseInt(data.targetCrop).toLocaleString('en-US')}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.cropAmountForLastMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.lastThreeMonthAvg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'center'}><b>Total</b></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {routeSummaryTotal.registered} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {routeSummaryTotal.dealer} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {routeSummaryTotal.supplier} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {routeSummaryTotal.estate} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {routeSummaryTotal.customerCountForLastMonth} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {routeSummaryTotal.targetCrop.toLocaleString('en-US')} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {routeSummaryTotal.cropAmountForLastMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {routeSummaryTotal.lastThreeMonthAvg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                </TableRow>
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
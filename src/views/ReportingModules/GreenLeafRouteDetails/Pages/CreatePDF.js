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

        const LeafRouteDetails = this.props.LeafRouteDetails;
        const LeafweightTotal = this.props.LeafweightTotal;
        const SearchData = this.props.SearchData;
        const GreenLeafInput = this.props.GreenLeafInput;
        const AllTotal = this.props.AllTotal;

        return (
            <div>

                <h2><center><u>Monthly Crop Summary Report - Route Wise</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{SearchData.groupName} - {SearchData.factoryName}</center></h2>
                <div>&nbsp;</div>
                <h2><center>{GreenLeafInput.year}</center></h2>
                <h3><center>{SearchData.leafName == undefined ? "All Leaf Types" : SearchData.leafName}</center></h3>
                <div>
                    <Box minWidth={1100}>
                        <TableContainer >
                            <Table aria-label="caption table" style={{ tableLayout: 'fixed', width: '100%' }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Route</TableCell>
                                        <TableCell align={'center'}>Jan</TableCell>
                                        <TableCell align={'center'}>Feb</TableCell>
                                        <TableCell align={'center'}>Mar</TableCell>
                                        <TableCell align={'center'}>Apr</TableCell>
                                        <TableCell align={'center'}>May</TableCell>
                                        <TableCell align={'center'}>Jun</TableCell>
                                        <TableCell align={'center'}>Jul</TableCell>
                                        <TableCell align={'center'}>Aug</TableCell>
                                        <TableCell align={'center'}>Sep</TableCell>
                                        <TableCell align={'center'}>Oct</TableCell>
                                        <TableCell align={'center'}>Nov</TableCell>
                                        <TableCell align={'center'}>Dec</TableCell>
                                        <TableCell align={'center'}>Total (KG)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {LeafRouteDetails.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.january.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.february.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.march.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.april.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.may.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.june.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.july.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.august.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.september.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.october.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.november.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.december.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                <b>{(data.january + data.february + data.march + data.april + data.may + data.june +
                                                    data.july + data.august + data.september + data.october + data.november + data.december).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'center'}><b>Total</b></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.january.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.february.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.march.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.april.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.may.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.june.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.july.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.august.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.september.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.october.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.november.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {LeafweightTotal.december.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {AllTotal} </b>
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
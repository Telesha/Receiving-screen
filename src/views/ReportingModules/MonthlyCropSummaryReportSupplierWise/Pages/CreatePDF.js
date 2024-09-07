import React from "react";
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table,
    Grid
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {

        const supplierReportData = this.props.supplierReportData;
        const searchData = this.props.searchData;
        const LeafweightTotal = this.props.LeafweightTotal;
        const AllTotal = this.props.AllTotal;

        function calclateTotalWeight(data) {
            let totalWeight = (data.january + data.february + data.march + data.april + data.may + data.june + data.july +
                data.august + data.september + data.october + data.november + data.december);
            totalWeight = totalWeight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return totalWeight;
        }

        return (
            <div>
                <br />
                <h2><center><u>Monthly Crop Summary Report - Supplier Wise</u></center></h2>
                <br />
                <Grid container spacing={2} justifyContent="center" >
                    <Grid item xs={3}>
                    </Grid>
                    <Grid item xs={4}>
                        <h4 >Group Name - {searchData.groupName}</h4>
                        <h4 >Route - {searchData.route === 0 ? 'All' : searchData.route}</h4>
                        <h4 >Year - {searchData.year}</h4>
                    </Grid>
                    <Grid item xs={5}>
                        <h4>Factory Name - {searchData.factoryName}</h4>
                        <h4>Leaf Type - {searchData.leafType === 0 ? 'All' : searchData.leafType}</h4>
                    </Grid>
                </Grid>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={1100}>
                        <TableContainer>
                            <Table aria-label="caption table" style={{ tableLayout: 'fixed', width: '100%' }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Reg No.</TableCell>
                                        <TableCell align={'center'} >Supplier</TableCell>
                                        <TableCell align={'center'} >January</TableCell>
                                        <TableCell align={'center'} >February</TableCell>
                                        <TableCell align={'center'} >March</TableCell>
                                        <TableCell align={'center'} >April</TableCell>
                                        <TableCell align={'center'} >May</TableCell>
                                        <TableCell align={'center'} >June</TableCell>
                                        <TableCell align={'center'} >July</TableCell>
                                        <TableCell align={'center'} >August</TableCell>
                                        <TableCell align={'center'} >September</TableCell>
                                        <TableCell align={'center'} >October</TableCell>
                                        <TableCell align={'center'} >November</TableCell>
                                        <TableCell align={'center'} >December</TableCell>
                                        <TableCell align={'center'} >Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {supplierReportData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.registrationNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.supplierName}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.january.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.february.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.march.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.april.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.may.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.june.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.july.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.august.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.september.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.october.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.november.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.december.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell align={'right'} component="th" scope="row" style={{ borderBottom: "none", fontWeight: 'bold' }}>
                                                {calclateTotalWeight(data)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell colSpan={2} align={'left'}><b>Total</b></TableCell>
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
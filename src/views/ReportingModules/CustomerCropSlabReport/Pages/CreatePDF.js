import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table,
    Grid,
    Typography
} from '@material-ui/core';
export default class ComponentToPrint extends React.Component {
    render() {
        const SlabReportSearchData = this.props.SlabReportSearchData;
        const CropSlabData = this.props.CropSlabData;
        const TotalAmount = this.props.TotalAmount;

        return (
            <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
                <br />
                <h2><center><u>Customer Crop Slab Report</u></center></h2>
                <div>&nbsp;</div>
                <h3><center>{SlabReportSearchData.groupName} - {SlabReportSearchData.factoryName}</center></h3>
                <h3><center> ( {SlabReportSearchData.startDate} - {SlabReportSearchData.endDate} )</center></h3>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'left'}>Route</TableCell>
                                        <TableCell align={'left'}>Registration Number</TableCell>
                                        <TableCell align={'left'}>Supplier Name</TableCell>
                                        <TableCell align={'left'}>Crop(KG)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {CropSlabData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeName}
                                            </TableCell>
                                            <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.registrationNumber}
                                            </TableCell>
                                            <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.name}
                                            </TableCell>
                                            <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.cropNetWeight}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'left'}><b>Total</b></TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {TotalAmount.cropNetWeight} </b>
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
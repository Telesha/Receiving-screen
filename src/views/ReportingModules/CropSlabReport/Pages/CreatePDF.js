import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
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

        const CropSlabData = this.props.CropSlabData;
        const TotalAmount = this.props.TotalAmount;
        const SlabReportSearchData = this.props.SlabReportSearchData;

        return (
            <div>

                <h2><center><u>Crop Slab Report</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{SlabReportSearchData.groupName} - {SlabReportSearchData.factoryName}</center></h2>
                <div>&nbsp;</div>
                <h3><center>{SlabReportSearchData.startDate} - {SlabReportSearchData.endDate} </center></h3>
                <div>
                    <Box minWidth={1050}>

                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Route</TableCell>
                                        <TableCell align={'center'}>Route Code</TableCell>
                                        <TableCell align={'center'}>Crop (KG)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {CropSlabData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeCode}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.cropNetWeight}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'center'}><b>Total</b></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
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
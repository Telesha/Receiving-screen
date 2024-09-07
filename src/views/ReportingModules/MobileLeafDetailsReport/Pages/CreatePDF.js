import React from "react";
import {
    Box,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@material-ui/core";
export default class ComponentToPrint extends React.Component {
    render() {
        const leafDetails = this.props.leafDetails;
        const selectedSearchValues = this.props.selectedSearchValues;

        return (
            <div style={{ padding: '10px 0px' }}>
                <h2><center><u>Mobile Leaf Detail Report</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{selectedSearchValues.factoryName} - {selectedSearchValues.groupName}</center></h2>
                <div>&nbsp;</div>
                <h2><center>{selectedSearchValues.date}</center></h2>
                <div>&nbsp;</div>
                <Divider />

                <div>
                    <Box minWidth={1050}>
                        <TableContainer>
                            <Table aria-lable="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'} style={{ fontSize: '18px' }}>Registration No.</TableCell>
                                        <TableCell align={'center'} style={{ fontSize: '18px' }}>Supplier Name</TableCell>
                                        <TableCell align={'center'} style={{ fontSize: '18px' }}>Route Name</TableCell>
                                        <TableCell align={'center'} style={{ fontSize: '18px' }}>Collection Type</TableCell>
                                        <TableCell align={'center'} style={{ fontSize: '18px' }}>Amount(kg)</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {leafDetails.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.registrationNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.supplierName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.collectionTypeName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.netAmount.toFixed(1)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>

                            </Table>
                        </TableContainer>
                    </Box>
                </div>
                <Divider />
                <div>&nbsp;</div>
                <h3><center>***** End of List *****</center></h3>
            </div>
        )
    }

}

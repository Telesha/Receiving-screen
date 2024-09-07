import React from "react";
import {
    Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Table, TableFooter
} from '@material-ui/core';


export default class ComponentToPrint extends React.Component {

    render() {
        const dispatchList = this.props.dispatchList;
        const searchData = this.props.searchData;
        const names = this.props.names;

        const p = this.props.approve != undefined ? this.props.approve : null

        return (
            <div>
                <div style={{ width: '1093px', height: '1059px', padding: '20px', marginBottom: "14rem" }}>
                    <br />
                    <h2><center><u>{searchData.sellingMarks}</u></center></h2>
                    <h2><center><u>Dispatch Invoice</u></center></h2>
                    <div>&nbsp;</div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginLeft: '5rem' }}>Name of the Estate:  {searchData.factoryID}</h3>
                            <h3 style={{ marginLeft: '5rem' }}>Selling Marks:  {searchData.sellingMarks}</h3>
                            <h3 style={{ marginLeft: '5rem' }}>Broker:  {searchData.broker}</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3> Dispatch Date:  {searchData.dispatchDate}</h3>
                            <h3> Factory Code:  {searchData.factoryCode}</h3>
                        </div>
                    </div>
                    <div>&nbsp;</div>
                    <div>
                        <Box minWidth={1050}>
                            <TableContainer style={{ marginLeft: '5rem' }} >
                                <Table aria-label="caption table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align='center' style={{ border: '1px solid grey', width: '100px', fontweight: 'bold' }}>Invoice No</TableCell>
                                            <TableCell align='center' style={{ border: '1px solid grey', width: '100px', fontweight: 'bold' }}>Grade</TableCell>
                                            <TableCell align='center' style={{ border: '1px solid grey', width: '100px', fontweight: 'bold' }}>Vehicle No</TableCell>
                                            <TableCell align='center' style={{ border: '1px solid grey', width: '100px', fontweight: 'bold' }}>TOP</TableCell>
                                            <TableCell align='center' style={{ border: '1px solid grey', width: '100px', fontweight: 'bold' }}>NOP</TableCell>
                                            <TableCell align='center' style={{ border: '1px solid grey', width: '100px', fontweight: 'bold' }}>PW (KG)</TableCell>
                                            <TableCell align='center' style={{ border: '1px solid grey', width: '100px', fontweight: 'bold' }}>GW (KG)</TableCell>
                                            <TableCell align='center' style={{ border: '1px solid grey', width: '100px', fontweight: 'bold' }}>SA (KG)</TableCell>
                                            <TableCell align='center' style={{ border: '1px solid grey', width: '100px', fontweight: 'bold' }}>Net Qty (KG)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {p == null ? (
                                            dispatchList.map((rowData, index) => (
                                                <TableRow key={index}>
                                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                        {rowData.invoiceNo}
                                                    </TableCell>
                                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                        {names.teaGradeID}
                                                    </TableCell>
                                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                        {names.vehicleID}
                                                    </TableCell>
                                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                        {rowData.typeOfPack ==
                                                            1 ? "CHEST"
                                                            : 2 ? "DJ-MWPS"
                                                                : 3 ? "MWPS"
                                                                    : 4 ? "PS"
                                                                        : "SPBS"}
                                                    </TableCell>
                                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                        {rowData.noOfPackages}
                                                    </TableCell>
                                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                        {rowData.packWeight}
                                                    </TableCell>
                                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                        {rowData.grossQuantity}
                                                    </TableCell>
                                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                        {rowData.sampleQuantity}
                                                    </TableCell>
                                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                        {rowData.netQuantity}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) :
                                            <TableRow>
                                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                    {dispatchList.invoiceNo}
                                                </TableCell>
                                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                    {dispatchList.teaGradeID}
                                                </TableCell>
                                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                    {searchData.vehicleID}
                                                </TableCell>
                                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                    {dispatchList.typeOfPack}
                                                </TableCell>
                                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                    {dispatchList.noOfPackages}
                                                </TableCell>
                                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                    {dispatchList.packWeight}
                                                </TableCell>
                                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                    {dispatchList.grossQuantity}
                                                </TableCell>
                                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                    {dispatchList.sampleQuantity}
                                                </TableCell>
                                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none", border: '1px solid grey', width: '100px' }}>
                                                    {dispatchList.netQuantity}
                                                </TableCell>
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </div>
                </div ></div >
        );
    }
}

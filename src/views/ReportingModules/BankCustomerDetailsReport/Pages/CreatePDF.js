import React from "react";
import tokenService from '../../../../utils/tokenDecoder';
import MaterialTable from "material-table";
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
        const BankCustomerSearchData = this.props.BankCustomerSearchData;
        const BankCustomerList = this.props.BankCustomerList;
        const BankCustomerData = this.props.BankCustomerData;
        const TotalAmount = this.props.TotalAmount;
        const selectedDatePDF = this.props.selectedDatePDF;

        return (
            <div>
                <h2><center><u>Bank Customer Details Report</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{BankCustomerSearchData.factoryName}</center></h2>
                <div>&nbsp;</div>
                <h3><center>BOUGHT LEAF BALANCE PAYMENT FOR THE MONTH OF {selectedDatePDF.applicableMonth} - {selectedDatePDF.applicableYear}</center></h3>


                <div>&nbsp;</div>
                <div>&nbsp;</div>
                <div style={{ marginLeft: '3rem' }}>
                    <h3>Bank Name :{BankCustomerData[0].bankName}</h3>
                </div>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer >
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'}>Route</TableCell>
                                        <TableCell align={'center'}>Branch</TableCell>
                                        <TableCell align={'center'}>RegNo</TableCell>
                                        <TableCell align={'center'}>Name</TableCell>
                                        <TableCell align={'center'}>Account Number</TableCell>
                                        <TableCell align={'center'}>Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {BankCustomerData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.routeName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.branchName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.registrationNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.name}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.accountNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'center'}><b>Total</b></TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>

                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>

                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>

                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>

                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <b> {TotalAmount} </b>
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
import React from 'react'
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table,
    Divider
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {

    render() {
        const BankCustomerSearchData = this.props.BankCustomerSearchData;
        const BankCustomerList = this.props.BankCustomerList;
        const BankCustomerData = this.props.BankCustomerData;
        const TotalAmount = this.props.TotalAmount;


        return (
            <div style={{ padding: '5px' }}>
                <h2><center><u>{BankCustomerData[0].bankName}</u></center></h2>
                <div>&nbsp;</div>
                <h2><center>{BankCustomerSearchData.factoryName} | {BankCustomerSearchData.monthName}-{BankCustomerList.year}</center></h2>
                <div>&nbsp;</div>
                <h3><center>Bought Leaf Balance Payment Bank Customer List.</center></h3>
                <div>&nbsp;</div>
                <Divider />
                <div>
                    <Box minWidth={1050}>
                        <TableContainer>
                            <Table aria-label="caption table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={'center'} style={{ fontSize: '18px' }}> Branch</TableCell>
                                        <TableCell align={'center'} style={{ fontSize: '18px' }}>Account Number</TableCell>
                                        <TableCell align={'center'} style={{ fontSize: '18px' }}>Name</TableCell>
                                        <TableCell align={'center'} style={{ fontSize: '18px' }}>Amount</TableCell>
                                        <TableCell align={'center'} style={{ fontSize: '18px' }}>Remark</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {BankCustomerData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.branchName}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.accountNumber}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.name}
                                            </TableCell>
                                            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {data.amount.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </div >
                <div>&nbsp;</div>
                <div>&nbsp;</div>
                <h3><center>***** End of List *****</center></h3>
            </div >
        );
    } d
}

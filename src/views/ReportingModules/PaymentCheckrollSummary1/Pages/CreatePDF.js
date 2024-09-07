import React from "react";
import {
    Box,
    TableBody,
    TableCell,
    TableRow,
    Table,
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const paymentCheckrollDetails = this.props.paymentCheckrollDetails;
        const SearchData = this.props.SearchData;
        const totalValues = this.props.totalValues;
        return (
            <div>
                <style>
                    {`
                @page {
                    size: A4 landscape;
                }
                `}
                </style>
                <h2><left><u>Payment Checkroll Summary Report 1</u></left></h2>
                <div>&nbsp;</div>
                <h4><left>{SearchData.groupName} - {SearchData.estateName} ({SearchData.month} - {SearchData.year})</left></h4>
                <div>&nbsp;</div>
                <br></br>
                <div>
                    <Box minWidth={1050}>
                        {paymentCheckrollDetails.length > 0 ?
                            <Table aria-label="sticky table" size="small">
                                <TableRow>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Emp No</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Name</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Normal Days</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Sunday & Poyadays</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Total Wages for Mandays</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Over KG Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>OT Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Cash Kilo Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Cash Day Plucking Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Sundry Cash Work Days</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Sundry Cash Work Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Other Earning Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Holiday Pay Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Balance BF Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Gross Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Total Deduction Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Net Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Balance CF Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>EPF Contribution Employer</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>ETF Contribution Employeer</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Part Payment 1</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Part Payment 2</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Payble Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", padding: '0' }}>Signature</TableCell>
                                </TableRow>
                                <TableBody>
                                    {paymentCheckrollDetails.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell align={'center'} style={{ border: "1px solid black", padding: '0' }}>{data.registrationNumber.toString().padStart(4, '0')}</TableCell>
                                            <TableCell align={'left'} style={{ border: "1px solid black", padding: '0' }}>{data.employeeName}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.normalDays.toFixed(2)}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.holiday.toFixed(2)}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.totalWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.overKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.otAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.cashKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.cashDayPluckingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.cashWorkDays.toFixed(2)}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.cashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.otherEarningAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.holidayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.bfAmount.toFixed(2)}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.deductionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.balanceCFAmount.toFixed(2)}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.employerEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.employerETFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.partPayment1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.partPayment2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}>{data.paybleAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            <TableCell align={'right'} style={{ border: "1px solid black", padding: '0' }}></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }} colSpan={2}><b>Total</b></TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalNormalDays}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalHolidays}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalWages}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalOverKiloAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalOtAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalCashKiloAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.TotalCashDayPluckingAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalCashWorkDays}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalCashJobAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalOtherEarningAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalHolidayAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalBFAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalGrossAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalDeductionAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalBalance}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalBalanceCFAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalEPFAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalETFAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalPartPayment1}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalPartPayment2}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}>{totalValues.totalPaybleAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red", padding: '0' }}></TableCell>
                                </TableRow>
                            </Table>
                            : null}
                    </Box>
                </div>
                <div>&nbsp;</div>
            </div>
        );
    }
}
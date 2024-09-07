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
                <h2><left><u>Payment Checkroll Summary Report</u></left></h2>
                <div>&nbsp;</div>
                <h4><left>{SearchData.groupName} - {SearchData.estateName} ({SearchData.month} - {SearchData.year})</left></h4>
                <div>&nbsp;</div>
                <br></br>
                <div>
                    <Box minWidth={1050}>
                        {paymentCheckrollDetails.length > 0 ?
                            <Table aria-label="sticky table" size="small">
                                <TableRow>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Emp No</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ left: 74, border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Name</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Normal Days</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Sunday & Poyadays</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Total Wages for Mandays</TableCell>
                                    <TableCell colSpan="7" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Earnings</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Balance BF Amount</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Gross Amount</TableCell>
                                    <TableCell colSpan="22" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Deductions (Rs.)</TableCell>
                                    <TableCell colSpan="22" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Total Deduction</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Part Payment 1</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Part Payment 2</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Net Amount</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Balance CF Amount</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Payble Amount</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>EPF Contribution Employer</TableCell>
                                    <TableCell rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>ETF Contribution Employer</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Over KG Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>OT Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Cash Kilo Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Cash Day Plucking Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Sundry Cash Work Days</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Sundry Cash Work Amount</TableCell>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Other Earning Amount</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Stamp</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Tea Recovery</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Welfare</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Crech Fund</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Funeral Fund</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Union Recovery</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Electricity Recovery</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Pay Cards</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Co op Membership</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Co op Shop Recovery</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Temple Recovery</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Insurance Recovery</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Dhoby</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Baber</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Water Scheme Recovery</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Fine</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Other Recovery</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Tools Recovery</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Festival Advance Recovery</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>Other Deductions</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black", fontSize: '16px', backgroundColor: "#C8BFBF" }}>EPF 10%</TableCell>
                                </TableRow>
                                <TableBody>
                                    {paymentCheckrollDetails.map((data, index) => {
                                        const totalDeductions = data.stamp + data.teaRecovery + data.welfare + data.crenchFund + data.funeralFund +
                                            data.unionRecovery + data.electricityRecovery + data.payCards + data.coopMembership +
                                            data.coopShopRecovery + data.templeRecovery + data.insuranceRecovery + data.dhoby + data.baber +
                                            data.waterSchemeRecovery + data.fine + data.otherRecovery + data.toolsRecovery +
                                            data.festivalAdvanceRecovery + data.otherDeductions + data.epfAmount;

                                        return (
                                            <TableRow key={index}>
                                                <TableCell align={'center'} style={{ border: "1px solid black" }}>{data.registrationNumber.toString().padStart(4, '0')}</TableCell>
                                                <TableCell align={'left'} style={{ left: 74, border: "1px solid black" }}>{data.employeeName}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.normalDays.toFixed(2)}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.holiday.toFixed(2)}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.totalWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.overKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.otAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.cashKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.cashDayPluckingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.cashWorkDays.toFixed(2)}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.cashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.otherEarningAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.bfAmount.toFixed(2)}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>

                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.stamp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.teaRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.welfare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.crenchFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.funeralFund.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.unionRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.electricityRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.payCards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.coopMembership.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.coopShopRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.templeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.insuranceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.dhoby.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.baber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.waterSchemeRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.fine.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.otherRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.toolsRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.festivalAdvanceRecovery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell component="th" scope="row" align="right" style={{ border: "1px solid black" }}> {data.epfAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.partPayment1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.partPayment2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.balanceCFAmount.toFixed(2)}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.paybleAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.employerEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.employerETFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                                <TableRow>
                                    <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} colSpan={2}><b>Total</b></TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalNormalDays}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalHolidays}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalWages}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOverKiloAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOtAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCashKiloAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalDayCashPluckingAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCashWorkDays}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCashJobAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOtherEarningAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalBFAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalGrossAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalStamp}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalTeaRecovery}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalWelfare}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCrenchFund}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalFuneralFund}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalUnionRecovery}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalElectricityRecovery}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalPayCards}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCoopMembership}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCoopShopRecovery}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalTempleRecovery}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalInsuranceRecovery}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalDhoby}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalBaber}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalWaterSchemeRecovery}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalFine}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOtherRecovery}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalToolsRecovery}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalFestivalAdvanceRecovery}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOtherDeductions}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalEPF10Amount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalPartPayment1}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalPartPayment2}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalBalance}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalBalanceCFAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalPaybleAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalEPFAmount}</TableCell>
                                    <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalETFAmount}</TableCell>
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
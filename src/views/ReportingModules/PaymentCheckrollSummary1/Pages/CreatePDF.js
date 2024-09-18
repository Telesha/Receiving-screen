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
        const totalsByDivision = this.props.totalsByDivision;

        const groupedData = paymentCheckrollDetails.reduce((acc, item) => {
            if (!acc[item.divisionName]) {
                acc[item.divisionName] = [];
            }
            acc[item.divisionName].push(item);
            return acc;
        }, {});

        return (
            <div>
                <style>
                    {`
                @page {
                    size: A4 landscape;
                }
                `}
                </style>
                <div>
                    <h2 style={{ textAlign: 'left', textDecoration: 'underline' }}>Payment CheckRoll Summary Report 1</h2>
                    <div>&nbsp;</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '500px' }}>
                        <h4 style={{ textAlign: 'left' }}>Group - {SearchData.groupName}</h4>
                        <h4 style={{ textAlign: 'left' }}>Year - {SearchData.year}</h4>
                    </div>
                    <div>&nbsp;</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '660px' }}>
                        <h4 style={{ textAlign: 'left' }}>
                            Division - {SearchData.divisionName === undefined ? 'All' : SearchData.divisionName}
                        </h4>
                        <h4 style={{ textAlign: 'left' }}>Month - {SearchData.month}</h4>
                    </div>
                    <div>&nbsp;</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '670px' }}>
                        <h4 style={{ textAlign: 'left' }}>Estate - {SearchData.estateName}</h4>
                    </div>
                </div>
                <br></br>
                <div>
                </div>
                <br></br>
                <div></div>
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
                                    {Object.keys(groupedData).map((divisionName, catIndex) => (
                                        <React.Fragment key={catIndex}>
                                            <TableRow>
                                                <TableCell colSpan={20} align="left" style={{ fontWeight: 'bold', border: "1px solid black", backgroundColor: '#FFF366' }}>
                                                    {divisionName}
                                                </TableCell>
                                            </TableRow>
                                            {groupedData[divisionName].map((data, i) => {
                                                const labelId = `enhanced-table-checkbox-${catIndex}-${i}`;
                                                return (
                                                    <TableRow key={i}>
                                                        <TableCell align={'center'} style={{ border: "1px solid black" }}>{data.registrationNumber.toString().padStart(4, '0')}</TableCell>
                                                        <TableCell align={'left'} style={{ left: 74, border: "1px solid black" }}>{data.employeeName}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.normalDays.toFixed(2)}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.holiday.toFixed(2)}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.totalWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.overKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.otAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.cashKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.cashDayPluckingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.cashWorkDays.toFixed(2)}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.cashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.otherEarningAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.holidayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.bfAmount.toFixed(2)}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.deductionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.balanceCFAmount.toFixed(2)}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.employerEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.employerETFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.partPayment1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.partPayment2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}>{data.paybleAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} id={labelId} style={{ border: "1px solid black" }}></TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                            {totalsByDivision[divisionName].map((data, i) => {
                                                return (
                                                    <TableRow key={divisionName}>
                                                        <TableCell align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} colSpan={2}>{"Total"}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.normalDays.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.holiday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.totalWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.overKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.otAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.cashKiloAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.cashDayPluckingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.cashWorkDays.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.cashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.otherEarningAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.holidayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.bfAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.deductionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.balanceCFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.employerEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.employerETFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.partPayment1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.partPayment2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{data.paybleAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                        <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}></TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                                {SearchData.divisionName === undefined ?
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
                                    : null}
                            </Table>
                            : null}
                    </Box>
                </div>
                <div>&nbsp;</div>
            </div>
        );
    }
}
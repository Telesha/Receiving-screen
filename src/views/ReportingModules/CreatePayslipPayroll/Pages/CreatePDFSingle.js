import React from "react";

export default class ComponentToPrint extends React.Component {

    render() {
        const d = this.props.paySlipData;
        const totalDeductions = this.props.totalDeductions;
        const totalEPF = this.props.totalEPF;
        const grossEarnings = this.props.grossEarnings;
        const netPay = this.props.netPay;
        const balancePay = this.props.balancePay;
        const overTime = this.props.overTime;

        let createdDate = new Date().toString().split('GMT')[0]

        return (
            <div className="record-container" style={{ position: 'relative', backgroundColor: 'white', width: '100%' }}>
                <br /><hr />
                <div style={{ textAlign: 'center' }}>

                    <table style={{ borderCollapse: 'collapse' }}>
                        <tr>
                            <td style={{ textAlign: "left", fontSize: "15px" }} colSpan="5" width="75%" > <b>Estate Name :</b> {(d.estateName)} </td>
                            <td style={{ textAlign: "left", fontSize: "15px" }} colSpan="5" width="75%" > <b>Name :</b> {d.employeeName} </td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "left", fontSize: "15px" }} colSpan="5" width="75%" > <b>Group Name :</b> {d.groupName} </td>
                            <td style={{ textAlign: "left", fontSize: "15px" }} colSpan="5" width="25%" > <b>Employee No :</b> {d.employeeNo} </td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "left", fontSize: "15px" }} colSpan="5" width="25%" > <b>Month / Year :</b>{d.month}/ {d.year} </td>
                            <td style={{ textAlign: "left", fontSize: "15px" }} colSpan="5" width="75%" > <b>E.P.F.No :</b> {d.epfNo ? d.epfNo : '-'} </td>
                        </tr>
                    </table>
                    <br />
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <br /><hr />
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Basic Salary :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}>{d.basicSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Annual Increment :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}>{d.holidayPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>No Pay :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}>{d.nopayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}><b>Total For EPF :</b></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}><b>{d.employeeEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></td> */}
                            </tr>

                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Overtime :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}>{overTime.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>

                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Unpaid Coins :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}>{d.bf.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>

                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Other Payments :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}>{d.additionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}><b>Gross Earnings :</b></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}><b>{grossEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></td>                            </tr>

                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Stamp :</td>
                                {/* <td style={{ marginLeft: "4rem", fontSize: '10px', lineHeight: '0' }} align="left">{d.nightOTHrs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>ESPS 10% :</td>
                                {/* <td style={{ marginLeft: "4rem", fontSize: '10px', lineHeight: '0' }} align="left">{d.doubleOTHrs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>

                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>EPF 10% :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}>{d.employeeEPFAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Medical 5% :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.cashPlucking.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Food Stuff :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.sundryCashJobAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Festival Advance :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.others.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>

                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Bank :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.advanceInsensitives.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Union :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.previousUnpaidWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Welfare Society :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", borderBottom: '1px solid black', borderTop: '1px solid black', lineHeight: '0' }}><b>{totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></td> */}
                            </tr>
                            {/* Deductions */}
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>CDF Loan :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.epf.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Croll Loss :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].festivalAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>CEB :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].unionDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Singer :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].religiousActivities.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>CESHCS :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].cooperative.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Cash Advance :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}>{d.cashAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}><b>Deduction :</b></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}><b>{totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}><b>Balance Pay :</b></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}><b>{netPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Made Up Coins :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}>{d.cf.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}><b>Balance Pay :</b></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}><b>{balancePay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '15px', lineHeight: '0' }}>Medical Balance :</td>
                                <td style={{ padding: '8px', fontSize: '15px', textAlign: "right", lineHeight: '0' }}></td>
                                {/* <td style={{ padding: '8px', fontSize: '12px', textAlign: "right", lineHeight: '0' }}>{d.deductionDetails[0].insuranceRecoveries.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td> */}
                            </tr>
                        </tbody>
                    </table>
                </div>
                <br /><hr />
                <div style={{ fontSize: "10px" }}><b>{createdDate} &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; ...The solution is provided by Agrithmics (PVT) LTD...</b></div>
            </div>
        );
    }
}

import React, { Component } from 'react'
import {
    Grid,
    Typography,

} from '@material-ui/core';
import CountUp from 'react-countup';
import { ToWords } from 'to-words';

export default class AdvancePaymentReceiptPrintComponent extends Component {
    render() {
        const AdvancePaymentReciptDetails = this.props.data;
        const printTime = new Date().getHours() + ':' + new Date().getMinutes("D2") + ':' + new Date().getSeconds();
        let TotalAdvaceAmount = AdvancePaymentReciptDetails.previousMonthAmount + AdvancePaymentReciptDetails.currentMonthAmount
        const toWords = new ToWords({
            localeCode: 'en-IN',
            converterOptions: {
                currency: true,
                ignoreDecimal: false,
                ignoreZeroCurrency: false,
                doNotAddOnly: false,
            }
        });
        let words = toWords.convert(TotalAdvaceAmount);
        let PaymentAggreementText = 'I do hereby certify that I have received sum of ' + words + ' due to me as details above from Management of ' + AdvancePaymentReciptDetails.factoryName

        return (
            <div style={{ width: '793px', height: '559px', border: 'black 2px solid', padding: '20px' }}>
                <Grid container md={12} xs={12}>
                    <Grid item md={6} xs={6} >
                        <Typography variant="h5" align='left'>
                            Advance Payment Receipt
                        </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} >
                        <Grid container md={12} xs={12}>
                            <Grid item md={6} xs={6} >
                                <Typography variant="h5" align='right'>Date: </Typography>
                            </Grid>
                            <Grid item md={6} xs={6} ><Typography variant="h5" align='left'>{AdvancePaymentReciptDetails.receiptDate}</Typography></Grid>
                        </Grid>
                        <Grid container md={12} xs={12}>
                            <Grid item md={6} xs={6} ><Typography variant="h5" align='right'>Voucher Number: </Typography></Grid>
                            <Grid item md={6} xs={6} >.................................</Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '1rem' }}>
                    <Grid item md={12} xs={12} ><Typography variant="h4" align='center'>{AdvancePaymentReciptDetails.factoryName}</Typography></Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '1rem' }}>
                    <Grid item md={4} xs={4} ><Typography variant="h5" align='left'>Name and Address of Payee :</Typography></Grid>
                    <Grid item md={8} xs={8} >
                        <Grid container md={12} xs={12}>
                            <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>{AdvancePaymentReciptDetails.payeeName}</Typography></Grid>
                        </Grid>
                        {AdvancePaymentReciptDetails.payeeAddress !== '' ?
                            <Grid container md={12} xs={12}>
                                <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>{AdvancePaymentReciptDetails.payeeAddress}</Typography></Grid>
                            </Grid> : null
                        }
                        {
                            AdvancePaymentReciptDetails.payeeAddressTwo !== '' ?
                                <Grid container md={12} xs={12}>
                                    <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>{AdvancePaymentReciptDetails.payeeAddressTwo}</Typography></Grid>
                                </Grid> : null
                        }
                        {
                            AdvancePaymentReciptDetails.payeeAddressThree !== '' ?
                                <Grid container md={12} xs={12}>
                                    <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>{AdvancePaymentReciptDetails.payeeAddressThree}</Typography></Grid>
                                </Grid> : null
                        }
                    </Grid>
                </Grid>


                <Grid container md={12} xs={12} style={{ marginTop: '0.5rem' }} >
                    <Grid item md={4} xs={4} ><Typography variant="h5" align='left'>Description :</Typography></Grid>
                    <Grid item md={8} xs={8} >
                        <Grid container md={12} xs={12}>
                            {
                                AdvancePaymentReciptDetails.isOverAdvance ?
                                    <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>{"B/L Over Advance For " + AdvancePaymentReciptDetails.previousMonthName + " / " + AdvancePaymentReciptDetails.currentMonthName}</Typography></Grid>
                                    :
                                    <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>{"B/L Advance For " + AdvancePaymentReciptDetails.previousMonthName + " / " + AdvancePaymentReciptDetails.currentMonthName}</Typography></Grid>
                            }
                        </Grid>
                    </Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '1rem', marginBottom: '1rem' }} >
                    <Grid item md={12} xs={12}>
                        <table style={{ width: '60%', borderCollapse: "initial", margin: '0 auto' }} border={1} >
                            <tr>
                                <th>Month</th>
                                <th>Amount (LKR)</th>
                            </tr>

                            {
                                AdvancePaymentReciptDetails.previousMonthAmount > 0 ?
                                    <tr>
                                        <td><Typography variant="h5" align='left'>{AdvancePaymentReciptDetails.previousMonthName}</Typography></td>
                                        <td><Typography variant="h5" align='right'>
                                            <CountUp
                                                end={AdvancePaymentReciptDetails.previousMonthAmount}
                                                decimals={2}
                                                decimal="."
                                                duration={1}
                                            />
                                        </Typography>
                                        </td>
                                    </tr> : null
                            }

                            {
                                AdvancePaymentReciptDetails.currentMonthAmount > 0 ?
                                    <tr>
                                        <td><Typography variant="h5" align='left'>{AdvancePaymentReciptDetails.currentMonthName}</Typography></td>
                                        <td><Typography variant="h5" align='right'>
                                            <CountUp
                                                end={AdvancePaymentReciptDetails.currentMonthAmount}
                                                decimals={2}
                                                decimal="."
                                                duration={1}
                                            />
                                        </Typography>
                                        </td>
                                    </tr> : null
                            }

                            <tr>
                                <td><Typography variant="h5" align='left'>Total</Typography></td>
                                <td><Typography variant="h5" align='right'>
                                    <CountUp
                                        end={TotalAdvaceAmount}
                                        decimals={2}
                                        decimal="."
                                        duration={1}
                                    />
                                </Typography>
                                </td>
                            </tr>
                        </table>
                    </Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '1rem' }}>
                    <Grid item md={6} xs={6}>
                        <Grid container md={12} xs={12}> <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>.................................</Typography></Grid></Grid>
                        <Grid container md={12} xs={12}> <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>Prepared By</Typography></Grid></Grid>
                    </Grid>
                    <Grid item md={6} xs={6} >
                        <Grid container md={12} xs={12}> <Grid item md={12} xs={12} ><Typography variant="h5" align='right'>.................................</Typography></Grid></Grid>
                        <Grid container md={12} xs={12}> <Grid item md={12} xs={12} ><Typography variant="h5" align='right'>Approved By</Typography></Grid></Grid>
                    </Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '2rem' }}>
                    <Grid item md={12} xs={12} ><Typography variant="h5" align='center'>{AdvancePaymentReciptDetails.payeeName + " " + PaymentAggreementText}</Typography></Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '2rem' }}>
                    <Grid item md={6} xs={6} alignItems="center" >
                        <Grid container md={12} xs={12}>
                            <Grid item md={6} xs={6} >
                                <Typography variant="h5" align='right'>Paid by Cash/Cheque No:</Typography>
                            </Grid>
                            <Grid item md={6} xs={6} ><Typography variant="h5" align='left'>.............................</Typography></Grid>
                        </Grid>
                        <Grid container md={12} xs={12}>
                            <Grid item md={6} xs={6} ><Typography variant="h5" align='right'>Print Time: </Typography></Grid>
                            <Grid item md={6} xs={6} ><Typography variant="h5" align='left'>{printTime}</Typography></Grid>
                        </Grid>
                    </Grid>
                    <Grid item md={6} xs={6} alignItems="center" >
                        <Grid container md={12} xs={12}> <Grid item md={12} xs={12} ><Typography variant="h5" align='center'>.........................................</Typography></Grid></Grid>
                        <Grid container md={12} xs={12}> <Grid item md={12} xs={12} ><Typography variant="h5" align='center'>Signature of Receipient</Typography></Grid></Grid>
                    </Grid>
                </Grid>
            </div>
        )
    }
}
//Evergreen - Wathuravila

import React, { Component } from 'react'
import {
    Grid,
    Typography,

} from '@material-ui/core';
import CountUp from 'react-countup';
import { ToWords } from 'to-words';

export default class CustomerBalancePayment_03_05 extends Component {
    render() {
        const BalancePaymentReciptDetails = this.props.data;
        let totalCropAmount = 0;
        let totalCropPayment = 0
        let totalDeduction = 0;
        return (
            <div style={{ width: '793px', height: '559px', border: 'black 2px solid', padding: '20px' }}>
                <Grid container md={12} xs={12}>
                    <Grid item md={6} xs={6} >
                        <Typography variant="h6" align='left'>
                            Customer Balance Payment Receipt
                        </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} >
                        <Grid container md={12} xs={12}>
                            <Grid item md={6} xs={6} >
                                <Typography variant="h6" align='right'>Date: </Typography>
                            </Grid>
                            <Grid item md={6} xs={6} ><Typography variant="h6" align='left'>{BalancePaymentReciptDetails.receiptDate}</Typography></Grid>
                        </Grid>
                        <Grid container md={12} xs={12}>
                            <Grid item md={6} xs={6} ><Typography variant="h6" align='right'>Voucher Number: </Typography></Grid>
                            <Grid item md={6} xs={6} >.................................</Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '0.5rem' }}>
                    <Grid item md={12} xs={12} ><Typography variant="h5" align='center'>{BalancePaymentReciptDetails.factoryName}</Typography></Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '0.5rem' }}>
                    <Grid item md={4} xs={4} ><Typography variant="h6" align='left'>Name and Address of Payee :</Typography></Grid>
                    <Grid item md={8} xs={8} >
                        <Grid container md={12} xs={12}>
                            <Grid item md={12} xs={12} ><Typography variant="h6" align='left'>{BalancePaymentReciptDetails.payeeName}</Typography></Grid>
                        </Grid>
                        {BalancePaymentReciptDetails.payeeAddress !== '' ?
                            <Grid container md={12} xs={12}>
                                <Grid item md={12} xs={12} ><Typography variant="h6" align='left'>{BalancePaymentReciptDetails.payeeAddress}</Typography></Grid>
                            </Grid> : null
                        }
                        {
                            BalancePaymentReciptDetails.payeeAddressTwo !== '' ?
                                <Grid container md={12} xs={12}>
                                    <Grid item md={12} xs={12} ><Typography variant="h6" align='left'>{BalancePaymentReciptDetails.payeeAddressTwo}</Typography></Grid>
                                </Grid> : null
                        }
                        {
                            BalancePaymentReciptDetails.payeeAddressThree !== '' ?
                                <Grid container md={12} xs={12}>
                                    <Grid item md={12} xs={12} ><Typography variant="h6" align='left'>{BalancePaymentReciptDetails.payeeAddressThree}</Typography></Grid>
                                </Grid> : null
                        }
                    </Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '0.5rem' }}>
                    <Grid item md={8} xs={8} >
                        {
                            BalancePaymentReciptDetails.customerCropDetails.map((object) => {
                                {
                                    totalCropAmount = totalCropAmount + object.cropWeight;
                                    totalCropPayment = totalCropPayment + (object.cropWeight * object.cropRate);
                                }
                                return (
                                    <>
                                        <Grid container md={12} xs={12} spacing={0}>
                                            <Grid item md={4} xs={4}><Typography variant="h6" align='left'>{object.collectionTypeName}</Typography></Grid>
                                            <Grid item md={2} xs={2}><Typography variant="h6" align='right'>{object.cropWeight + " Kg"}</Typography></Grid>
                                            <Grid item md={2} xs={2}>
                                                <Typography variant="h6" align='right'>
                                                    <CountUp
                                                        end={object.cropRate}
                                                        decimals={2}
                                                        decimal="."
                                                        duration={1}
                                                    />
                                                </Typography>
                                            </Grid>
                                            <Grid item md={2} xs={2} >
                                                <Typography variant="h6" align='right'>
                                                    <CountUp
                                                        end={object.cropWeight * object.cropRate}
                                                        decimals={2}
                                                        decimal="."
                                                        duration={1}
                                                    />
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </>
                                )
                            })
                        }
                        <Grid container md={12} xs={12} spacing={0}>
                            <Grid item md={4} xs={4}><Typography variant="h6" align='left'>Total</Typography></Grid>
                            <Grid item md={2} xs={2}><Typography variant="h6" align='right'>{totalCropAmount + " Kg"}</Typography></Grid>
                            <Grid item md={2} xs={2}></Grid>
                            <Grid item md={2} xs={2}>
                                <Typography variant="h6" align='right'>
                                    <CountUp
                                        end={totalCropPayment}
                                        decimals={2}
                                        decimal="."
                                        duration={1}
                                    />
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container md={12} xs={12} style={{ marginTop: '0.5rem' }}>
                            <Grid item md={6} xs={6}><Typography variant="h6" align='left'>Total Deduction</Typography></Grid>
                        </Grid>
                        {
                            BalancePaymentReciptDetails.customerDeductionDetails.map((object) => {
                                { totalDeduction = totalDeduction + (object.customerTransactionAmount) }
                                return (
                                    <Grid container md={12} xs={12}>
                                        <Grid item md={5} xs={5}><Typography variant="h6" align='left'>{object.transactionTypeName}</Typography></Grid>
                                        <Grid item md={3} xs={3}>
                                            <Typography variant="h6" align='right'>
                                                <CountUp
                                                    end={object.customerTransactionAmount}
                                                    decimals={2}
                                                    decimal="."
                                                    duration={1}
                                                />
                                            </Typography>
                                        </Grid>
                                        <Grid item md={3} xs={3}></Grid>

                                    </Grid>)
                            })
                        }

                        <Grid container md={12} xs={12}>
                            <Grid item md={5} xs={5}><Typography variant="h6" align='left'>Total Deduction</Typography></Grid>
                            <Grid item md={3} xs={3}>
                                <Typography variant="h6" align='right'>
                                    <CountUp
                                        end={totalDeduction}
                                        decimals={2}
                                        decimal="."
                                        duration={1}
                                    />
                                </Typography>
                            </Grid>
                            <Grid item md={3} xs={3}></Grid>
                        </Grid>

                        {
                            BalancePaymentReciptDetails.customerCreditDetails.map((object) => {
                                { totalDeduction = totalDeduction + (object.customerTransactionAmount) }
                                return (
                                    <Grid container md={12} xs={12}>
                                        <Grid item md={8} xs={8}><Typography variant="h6" align='left'>{object.transactionTypeName}</Typography></Grid>
                                        <Grid item md={2} xs={2}>
                                            <Typography variant="h6" align='right'>
                                                <CountUp
                                                    end={object.customerTransactionAmount}
                                                    decimals={2}
                                                    decimal="."
                                                    duration={1}
                                                />
                                            </Typography>
                                        </Grid>
                                        <Grid item md={3} xs={3}></Grid>

                                    </Grid>)
                            })
                        }
                        {
                            BalancePaymentReciptDetails.customerBalancePayment.map((object) => {
                                return (
                                    <Grid container md={12} xs={12}>
                                        <Grid item md={8} xs={8}><Typography variant="h6" align='left'>{object.transactionTypeName}</Typography></Grid>
                                        <Grid item md={2} xs={2}>
                                            <Typography variant="h6" align='right'>
                                                <CountUp
                                                    end={object.customerTransactionAmount}
                                                    decimals={2}
                                                    decimal="."
                                                    duration={1}
                                                />
                                            </Typography>
                                        </Grid>
                                        <Grid item md={3} xs={3}></Grid>

                                    </Grid>)
                            })
                        }

                    </Grid>
                    <Grid item md={4} xs={4} >
                        <Grid container mt={12} spacing={0}>
                            <Grid item md={12} xs={12} >
                                <Grid container mt={12} spacing={0}>
                                    <Grid item md={6} xs={6}><Typography variant="h6" align='center'>Date</Typography></Grid>
                                    <Grid item md={6} xs={6}><Typography variant="h6" align='center'>Amount</Typography></Grid>
                                </Grid>
                                {
                                    BalancePaymentReciptDetails.customerAdvancedPaymentDetails.map((object) => (
                                        <Grid container mt={2} spacing={0}>
                                            <Grid item md={6} xs={6}><Typography variant="h6" align='right'>{object.createdDate.substr(0, 10)} </Typography></Grid>
                                            <Grid item md={6} xs={6}><Typography variant="h6" align='right'>{object.amount.toFixed(2)}</Typography></Grid>
                                        </Grid>
                                    ))
                                }
                            </Grid>
                        </Grid>

                        <Grid container mt={12} spacing={0}>
                            <Grid item md={12} xs={12} >
                                <Grid container mt={12} spacing={0}>
                                    <Grid item md={3} xs={3}><Typography variant="h6" align='center'>Date</Typography></Grid>
                                    <Grid item md={5} xs={5}><Typography variant="h6" align='center'>Name</Typography></Grid>
                                    <Grid item md={4} xs={4}><Typography variant="h6" align='center'>Amount</Typography></Grid>
                                </Grid>
                                {
                                    BalancePaymentReciptDetails.customerFactoryItemDetails.map((object) => {
                                        let temp = object.createdDate.split('T')[0]
                                        let newDate = new Date(temp)
                                        let month = newDate.getMonth();
                                        let date = newDate.getDate()
                                        let convertedDate = ++month + "/" + date

                                        return (<Grid container mt={12} spacing={0}>
                                            <Grid item md={3} xs={3}><Typography variant="h6" align='center'>{convertedDate}</Typography></Grid>
                                            <Grid item md={5} xs={5}><Typography variant="h6" align='center'>{(object.itemName)}</Typography></Grid>
                                            <Grid item md={4} xs={4}><Typography variant="h6" align='right'>{object.totalPrice.toFixed(2)}</Typography></Grid>
                                        </Grid>)
                                    })
                                }
                            </Grid>
                        </Grid>

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

            </div >
        )
    }
}
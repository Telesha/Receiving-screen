import React, { Component } from 'react'
import {
    Grid,
    Typography,

} from '@material-ui/core';
import CountUp from 'react-countup';
import { ToWords } from 'to-words';

export default class FactoryItemIndividualCustomerReceipt extends Component {
    render() {

        const FactoryItemReciptDetails = this.props.data;
        const printTime = new Date().getHours() + ':' + new Date().getMinutes("D2") + ':' + new Date().getSeconds();
        let totalAmount = 0;

        return (
            <div style={{ width: '793px', height: '559px', border: 'black 2px solid', padding: '20px' }}>
                <Grid container md={12} xs={12}>
                    <Grid item md={6} xs={6} >
                        <Typography variant="h5" align='left'>
                            Factory Item Receipt
                        </Typography>
                    </Grid>
                    <Grid item md={6} xs={6} >
                        <Grid container md={12} xs={12}>
                            <Grid item md={6} xs={6} >
                                <Typography variant="h5" align='right'>Date: </Typography>
                            </Grid>
                            <Grid item md={6} xs={6} ><Typography variant="h5" align='left'>{FactoryItemReciptDetails[0].receiptDate}</Typography></Grid>
                        </Grid>
                        <Grid container md={12} xs={12}>
                            <Grid item md={6} xs={6} ><Typography variant="h5" align='right'>Voucher Number: </Typography></Grid>
                            <Grid item md={6} xs={6} >.................................</Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '1rem' }}>
                    <Grid item md={12} xs={12} ><Typography variant="h4" align='center'>{FactoryItemReciptDetails[0].factoryName}</Typography></Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '1rem' }}>
                    <Grid item md={4} xs={4} ><Typography variant="h5" align='left'>Name and Address of Payee :</Typography></Grid>
                    <Grid item md={8} xs={8} >
                        <Grid container md={12} xs={12}>
                            <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>{FactoryItemReciptDetails[0].payeeName}</Typography></Grid>
                        </Grid>
                        {
                            FactoryItemReciptDetails[0].payeeAddress !== '' ?
                                <Grid container md={12} xs={12}>
                                    <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>{FactoryItemReciptDetails[0].payeeAddress}</Typography></Grid>
                                </Grid> : null
                        }
                        {
                            FactoryItemReciptDetails[0].payeeAddressTwo !== '' ?
                                <Grid container md={12} xs={12}>
                                    <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>{FactoryItemReciptDetails[0].payeeAddressTwo}</Typography></Grid>
                                </Grid> : null
                        }
                        {
                            FactoryItemReciptDetails[0].payeeAddressThree !== '' ?
                                <Grid container md={12} xs={12}>
                                    <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>{FactoryItemReciptDetails[0].payeeAddressThree}</Typography></Grid>
                                </Grid> : null
                        }
                    </Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '0.5rem' }}>
                    <Grid item md={12} xs={12} ><Typography variant="h5" align='right'>{"No of Installments: " + FactoryItemReciptDetails[0].noOfInstalments}</Typography></Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '0.5rem' }} >
                    <Grid item md={4} xs={4} ><Typography variant="h5" align='left'>Description :</Typography></Grid>
                    <Grid item md={8} xs={8} >
                        <Grid container md={12} xs={12}>
                            <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>{"B/L Factory Item For " + FactoryItemReciptDetails[0].applicableMonth}</Typography></Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid container md={12} xs={12} style={{ marginTop: '2rem', marginBottom: '1rem' }} >
                    <Grid item md={12} xs={12}>
                        <table style={{ width: '70%', borderCollapse: "initial", margin: '0 auto' }} border={1} >
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Amount (LKR)</th>
                            </tr>
                            {
                                FactoryItemReciptDetails.map((object) => {

                                    totalAmount += (object.itemAmount)

                                    return (<tr>
                                        <td>
                                            <Typography variant="h5" align='left'>
                                                {object.itemName}
                                            </Typography>
                                        </td>
                                        <td>
                                            <Typography variant="h5" align='right'>
                                                <CountUp
                                                    end={object.itemQuantity}
                                                    decimals={1}
                                                    decimal="."
                                                    duration={1}
                                                />
                                            </Typography>
                                        </td>
                                        <td>
                                            <Typography variant="h5" align='right'>
                                                <CountUp
                                                    end={object.itemAmount}
                                                    decimals={2}
                                                    decimal="."
                                                    duration={1}
                                                />
                                            </Typography>
                                        </td>
                                    </tr>)
                                })
                            }

                            <tr>
                                <td><Typography variant="h5" align='left'>Total</Typography></td>
                                <td />
                                <td><Typography variant="h5" align='right'>
                                    <CountUp
                                        end={totalAmount}
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

                <Grid container md={12} xs={12} style={{ marginTop: '2rem' }}>
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
                    <Grid item md={6} xs={6}>
                        <Grid container md={12} xs={12}>
                            <Grid item md={12} xs={12} ><Typography variant="h5" align='left'>{"Print Time: " + printTime}</Typography></Grid>
                        </Grid>
                    </Grid>
                    <Grid item md={6} xs={6} >
                        <Grid container md={12} xs={12}> <Grid item md={12} xs={12} ><Typography variant="h5" align='right'>.........................................</Typography></Grid></Grid>
                        <Grid container md={12} xs={12}> <Grid item md={12} xs={12} ><Typography variant="h5" align='right'>Signature of Receipient</Typography></Grid></Grid>
                    </Grid>
                </Grid>

            </div>
        )
    }
}
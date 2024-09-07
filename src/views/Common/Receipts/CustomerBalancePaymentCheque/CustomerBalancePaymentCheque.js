import React, { Component } from 'react'
import {
    Grid,
    Typography,

} from '@material-ui/core';
import CountUp from 'react-countup';
import { ToWords } from 'to-words';

export default class CustomerBalancePaymentCheque extends Component {
    render() {
        const printDate = new Date().toISOString().split('T', 1).toString();
        const usingSplit = printDate.split('');
        const BalancePaymentChequeUserDetailsList = this.props.data;
        const toWords = new ToWords({
            localeCode: 'en-IN',
            converterOptions: {
                currency: true,
                ignoreDecimal: false,
                ignoreZeroCurrency: false,
                doNotAddOnly: false,
            }
        });

        let chequeList = []

        function designCheqTemplate() {
            BalancePaymentChequeUserDetailsList.forEach((object) => {
                chequeList.push(
                    <div style={{ width: '793px', height: '345.6px', border: 'gray 1px dashed', padding: '20px', marginBottom: "14rem" }}>
                        <Grid container md={12} xs={12}>
                            <Grid item md={12} xs={12} >
                                <Typography variant="h5" align='right'>
                                    {
                                        usingSplit[8] + " " + usingSplit[9] + " " + usingSplit[5] + " " + usingSplit[6] + " " + usingSplit[0] + " " + usingSplit[1] + " " + usingSplit[2] + " " + usingSplit[3]
                                    }
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container md={12} xs={12} style={{ marginTop: "3rem" }}>
                            <Grid item md={12} xs={12} >
                                <Typography variant="h5" align='left'>
                                    {
                                        "** " + object.customerName + " **"
                                    }
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container md={12} xs={12} style={{ marginLeft: "2rem", marginTop: "2.5rem" }}>
                            <Grid item md={12} xs={12} >
                                <Typography variant="h5" align='left'>
                                    {
                                        "** " + toWords.convert(object.amount) + " **"
                                    }
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container md={12} xs={12}>
                            <Grid item md={12} xs={12} >
                                {
                                    <Typography variant="h5" align='right'>
                                        {"** "}
                                        <CountUp
                                            end={object.amount}
                                            decimals={2}
                                            decimal="."
                                            duration={1}
                                        />
                                        {" **"}
                                    </Typography>
                                }
                            </Grid>
                        </Grid>
                    </div>
                )
            })
            return chequeList;
        }

        return (
            <div style={{ width: '793px', height: "auto" }}>
                {
                    designCheqTemplate()
                }
            </div>

        )
    }
}

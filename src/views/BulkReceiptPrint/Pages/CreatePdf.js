import React from "react";
import tokenService from '../../../utils/tokenDecoder';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  TableFooter
} from '@material-ui/core';
import Chip from '@material-ui/core/Chip';

export default class ComponentToPrint extends React.Component {

  render() {
    const data = this.props.data;
    const creditDetailsList = this.props.creditDetailsList;
    const debitDetailsList = this.props.debitDetailsList;
    const BalancePaymant = this.props.BalancePaymant;
    const BalanceBoardForward = this.props.BalanceBoardForward;
    const DueAmountCF = this.props.DueAmountCF;
    let totalCropAmount = 0;
    let totalCropPayment = 0;
    let totalDeduction = 0;

    let BalancePaymentList = []

    function designTemplate() {
      data.forEach((object) => {
        BalancePaymentList.push(
          <div style={{ border: 'gray 5px dashed', padding: '20px' }}>
            <Container maxWidth={false}>
              <Box mt={1}>
                <Box mt={0}>
                  <Card style={{ marginLeft: '10px' }}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item md={12} xs={12}>
                          <Card>
                            <CardContent>
                              <Grid container spacing={2}>
                                <Grid item md={2} xs={2}>
                                  <TextField
                                    fullWidth
                                    disabled={true}
                                    label="Customer Account : "
                                    value={object.customerBasicDetailsModel.registrationNumber}
                                    InputProps={{
                                      readOnly: true,
                                      disableUnderline: true
                                    }}
                                  />
                                </Grid>
                                <Grid item md={3} xs={3}>
                                  <TextField
                                    fullWidth
                                    disabled={true}
                                    label="Customer Name : "
                                    value={object.customerBasicDetailsModel.customerName}
                                    InputProps={{
                                      readOnly: true,
                                      disableUnderline: true
                                    }}
                                  />
                                </Grid>

                                <Grid item md={2} xs={2}>
                                  <TextField
                                    fullWidth
                                    disabled={true}
                                    label="Applicable Month"
                                    value={object.customerBasicDetailsModel.applicableMonth}
                                    InputProps={{
                                      readOnly: true,
                                      disableUnderline: true
                                    }}
                                  />
                                </Grid>

                                <Grid item md={2} xs={2}>
                                  <TextField
                                    fullWidth
                                    disabled={true}
                                    label="Applicable Year"
                                    value={object.customerBasicDetailsModel.applicableYear}
                                    InputProps={{
                                      readOnly: true,
                                      disableUnderline: true
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>

                      <Grid container spacing={3}>
                        <Grid item md={7} xs={7}>
                          <Card style={{ boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)' }}
                          >
                            <CardHeader
                              title={"Earnings"}
                            />
                            <Divider />
                            {
                              object.customerCropDetailsModels.length > 0 ?
                                <CardContent>
                                  <Grid container mt={2} spacing={2}>
                                    <Grid item md={5} xs={5}><InputLabel>Weight</InputLabel></Grid>
                                    <Grid item md={3} xs={3}><InputLabel>Balance Rate</InputLabel></Grid>
                                  </Grid>
                                  {
                                    object.customerCropDetailsModels.map((object) => {
                                      {
                                        totalCropAmount = totalCropAmount + object.cropWeight;
                                        totalCropPayment = totalCropPayment + (object.cropWeight * object.cropRate);
                                      }
                                      return (
                                        <Grid container mt={2} spacing={2}>

                                          <Grid item md={3} xs={3}><InputLabel>{object.collectionTypeName}</InputLabel></Grid>
                                          <Grid item md={2} xs={2}><InputLabel>{object.cropWeight + " Kg"}</InputLabel></Grid>
                                          <Grid item md={2} xs={2}>
                                            <Grid container mt={2} spacing={2}>
                                              <Grid item md={3} xs={3}><InputLabel>
                                                {"Rs "} </InputLabel></Grid>
                                              <Grid item md={9} xs={9}><InputLabel>
                                                {object.cropRate.toFixed(2)}
                                              </InputLabel></Grid>
                                            </Grid>
                                          </Grid>
                                          <Grid item md={2} xs={2} />

                                          <Grid item md={2} xs={2}>
                                            <Grid container mt={2} spacing={2}>
                                              <Grid item md={3} xs={3}><InputLabel>
                                                {"Rs "} </InputLabel></Grid>
                                              <Grid item md={9} xs={9}><InputLabel>
                                                {(object.cropWeight * object.cropRate).toFixed(2)}
                                              </InputLabel></Grid>
                                            </Grid>
                                          </Grid>
                                        </Grid>
                                      )
                                    })
                                  }
                                  <br />
                                  <Divider />
                                  <br />

                                  <Grid container mt={2} spacing={2}>
                                    <Grid item md={3} xs={3}><InputLabel>Total Leaf</InputLabel></Grid>
                                    <Grid item md={2} xs={2}><InputLabel>{totalCropAmount + " Kg"}</InputLabel></Grid>
                                    <Grid item md={4} xs={4}></Grid>
                                    <Grid item md={2} xs={2}>
                                      <Grid container mt={2} spacing={2}>
                                        <Grid item md={3} xs={3}><InputLabel>
                                          {"Rs "} </InputLabel></Grid>
                                        <Grid item md={9} xs={9}><InputLabel>
                                          {totalCropPayment.toFixed(2)}
                                        </InputLabel></Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </CardContent>
                                :
                                <CardContent>
                                  <InputLabel>No Crop Details</InputLabel>
                                </CardContent>
                            }

                            {
                              object.DueAmountCF > 0 ?
                                <CardHeader
                                  title={"Other"}
                                /> : null}
                            {object.DueAmountCF > 0 ?
                              <CardContent>
                                <Divider />
                                <br />
                                <Grid container mt={2} spacing={2}>
                                  <Grid item md={3} xs={3}><InputLabel>Balance Brought Forward</InputLabel></Grid>
                                  <Grid item md={1} xs={1}><InputLabel></InputLabel></Grid>
                                  <Grid item md={5} xs={5}>
                                    <Chip
                                      size="small"
                                      label='BBF'
                                      color="secondary"
                                    />
                                  </Grid>
                                  <Grid item md={3} xs={3}>
                                    <Grid container mt={2} spacing={2}>
                                      <Grid item md={2} xs={2}><InputLabel>
                                        {"Rs "} </InputLabel></Grid>
                                      <Grid item md={10} xs={10}><InputLabel>
                                        {data.DueAmountCF.toFixed(2)}
                                      </InputLabel></Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </CardContent> : null
                            }

                            <CardContent>
                            </CardContent>

                          </Card>
                          <br />
                          <Grid container mt={2} spacing={2}>
                            <Grid item md={12} xs={12}>
                              <Card style={{ boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)' }}
                              >
                                <CardHeader
                                  title={"Deductions"}
                                />
                                <Divider />
                                {
                                  object.customerDeductionDetails.length > 0 ?
                                    <CardContent>
                                      {
                                        object.customerDeductionDetails.BalanceBoardForward > 0 ?
                                          <div>
                                            <Grid container mt={2} spacing={2}>

                                              <Grid item md={4} xs={4}>
                                                <InputLabel>
                                                  Balance Carried Forward
                                            </InputLabel>
                                              </Grid>

                                              <Grid item md={2} xs={2}>
                                                <Chip
                                                  size="small"
                                                  label='BCF'
                                                  color="secondary"
                                                />
                                              </Grid>


                                              <Grid item md={2} xs={2}></Grid>
                                            </Grid>
                                          </div>
                                          : null
                                      }

                                      {
                                        object.customerDeductionDetails.map((object) => {
                                          { totalDeduction = totalDeduction + (object.customerTransactionAmount) }
                                          return (
                                            <Grid container mt={2} spacing={2}>

                                              <Grid item md={4} xs={4}>
                                                <InputLabel>
                                                  {object.transactionTypeName}
                                                </InputLabel>
                                              </Grid>

                                              <Grid item md={2} xs={2}>
                                                <Chip
                                                  size="small"
                                                  label={object.transactionTypeCode}
                                                  color="secondary"
                                                />
                                              </Grid>

                                              <Grid item md={2} xs={2}>
                                                <Grid container mt={2} spacing={2}>
                                                  <Grid item md={3} xs={3}><InputLabel>
                                                    {"Rs "} </InputLabel></Grid>
                                                  <Grid item md={9} xs={9}><InputLabel>
                                                    {object.customerTransactionAmount.toFixed(2)}
                                                  </InputLabel></Grid>
                                                </Grid>
                                              </Grid>

                                              <Grid item md={2} xs={2}></Grid>
                                            </Grid>
                                          )
                                        })
                                      }
                                      <br />
                                      <br />
                                    <br />

                                      {
                                        creditDetailsList.map((object) => {
                                          { totalDeduction = totalDeduction + (object.customerTransactionAmount) }
                                          return (
                                            <Grid container mt={2} spacing={2}>

                                              <Grid item md={4} xs={4}>
                                                <InputLabel>
                                                  {object.transactionTypeName}
                                                </InputLabel>
                                              </Grid>

                                              <Grid item md={2} xs={2}>
                                                <Chip
                                                  size="small"
                                                  label={object.transactionTypeCode}
                                                  color="secondary"
                                                />
                                              </Grid>
                                              <Grid item md={3} xs={3}></Grid>
                                              <Grid item md={2} xs={2}>
                                                <Grid container mt={2} spacing={2}>
                                                  <Grid item md={3} xs={3}><InputLabel>
                                                    {"Rs "} </InputLabel></Grid>
                                                  <Grid item md={9} xs={9}><InputLabel>
                                                    {object.customerTransactionAmount.toFixed(2)}
                                                  </InputLabel></Grid>
                                                </Grid>
                                              </Grid>
                                            </Grid>
                                          )
                                        })
                                      }
                                      <br />
                                      <Grid container mt={9} spacing={2}>
                                        <Grid item md={6} xs={6}>
                                          <InputLabel> 
                                          <b>Balance Payment</b></InputLabel>
                                        </Grid>
                                        <Grid item md={3} xs={3}>
                                          <Grid container mt={2} spacing={2}>
                                            <Grid item md={3} xs={3}><InputLabel>
                                              <b>{"Rs"}</b> </InputLabel></Grid>
                                            <Grid item md={9} xs={9}><InputLabel>
                                              <b>{BalancePaymant}</b>
                                            </InputLabel></Grid>
                                          </Grid>
                                        </Grid>
                                      </Grid>

                                    </CardContent>
                                    :
                                    <CardContent>
                                      <InputLabel>No Expenses</InputLabel>
                                    </CardContent>
                                }
                              </Card>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item md={5} xs={5}>
                          <Card style={{ boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)' }}
                          >
                            <CardHeader
                              title={"Advanced Details"}
                            />
                            <Divider />
                            {
                              object.customerBalancePaymentDetailsModelSingleCall.length > 0 ?
                                <CardContent>
                                  <Grid container mt={2} spacing={2}>
                                    <Grid item md={6} xs={6}><InputLabel>Date</InputLabel></Grid>
                                    <Grid item md={6} xs={6}><InputLabel>Amount</InputLabel></Grid>
                                  </Grid>
                                  {
                                    object.customerBalancePaymentDetailsModelSingleCall.map((object) => (
                                      <Grid container mt={2} spacing={2}>
                                        <Grid item md={6} xs={6}><InputLabel>{object.createdDate.substr(0, 10)} </InputLabel></Grid>
                                        <Grid item md={6} xs={6}><InputLabel>{"Rs "}{object.amount.toFixed(2)}</InputLabel></Grid>
                                      </Grid>
                                    ))
                                  }
                                </CardContent>
                                :
                                <CardContent>
                                  <InputLabel>No Advanced Payment Details</InputLabel>
                                </CardContent>
                            }
                          </Card>
                          <br />
                          <Grid item md={12} xs={12}>
                            <Card style={{ boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)' }}
                            >
                              <CardHeader
                                title={"Factory Items"}
                              />
                              <Divider />
                              {object.customerFactoryItemDetailModel.length > 0 ?
                                <CardContent>
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>
                                          Date
                                    </TableCell>
                                        <TableCell>
                                          Item
                                    </TableCell>
                                        <TableCell>
                                          Quantity
                                    </TableCell>
                                        <TableCell>
                                          Amount
                                    </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {object.customerFactoryItemDetailModel.map((data) => (
                                        <TableRow>
                                          <TableCell>
                                            {data.createdDate.split("T")[0]}
                                          </TableCell>
                                          <TableCell>
                                            {data.itemName}
                                          </TableCell>
                                          <TableCell>
                                            {data.approvedQuantity}
                                          </TableCell>
                                          <TableCell>
                                            {data.totalPrice}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </CardContent>
                                :
                                <CardContent>
                                  <InputLabel>No Factory Items</InputLabel>
                                </CardContent>
                              }
                            </Card>
                            <br />
                            <Grid item md={12} xs={12}>
                              <Card style={{ boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)' }}
                              >
                                <CardHeader
                                  title={"Loan"}
                                />
                                <Divider />
                                {object.customerLoanDetailModel.length > 0 ?
                                  <CardContent>
                                    <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>
                                            Purpose
                                      </TableCell>
                                          <TableCell>
                                            Principal Amount(Rs)
                                      </TableCell>
                                          <TableCell>
                                            Installment Amount(Rs)
                                      </TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {object.customerLoanDetailModel.map((data) => (
                                          <TableRow>
                                            <TableCell>
                                              {data.purpose}
                                            </TableCell>
                                            <TableCell>
                                              {data.principalAmount.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                              {data.installmentAmount.toFixed(2)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </CardContent>
                                  :
                                  <CardContent>
                                    <InputLabel>No Loan Details</InputLabel>
                                  </CardContent>
                                }
                              </Card>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Container>
          </div>
        )
      })
      return BalancePaymentList;
    }

    return (
      <div>
        {
          designTemplate()
        }
      </div>

    )
  }

}


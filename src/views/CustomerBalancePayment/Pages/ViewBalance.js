import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAlert } from "react-alert";
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import PerfectScrollbar from 'react-perfect-scrollbar';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import Chip from '@material-ui/core/Chip';
import {
  Box,
  Card,
  makeStyles,
  Container,
  CardContent,
  Divider,
  Grid,
  Button,
  MenuItem,
  InputLabel,
  TextField,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper
} from '@material-ui/core';
import { LoadingComponent } from 'src/utils/newLoader';
import tokenDecoder from 'src/utils/tokenDecoder';
import ReactToPrint from "react-to-print";
import CustomerBalancePayment_03_05 from './../../Common/Receipts/CustomerBalancePayment/CustomerBalancePayment_03_05';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  floatingButton: {
    backgroundColor: '#e57373',
    minWidth: '100', marginRight: theme.spacing(5),
    disabled: true
  },
  inputLabel: {
    textAlign: 'left'
  },
  rupeesLablel: {
    textAlign: 'left'
  },
  advancedPaymant: {
    textAlign: 'center'
  },
  advancedPaymantTitle: {
    textAlign: 'center',
    fontWeight: 'bold'
  },
  earningsTitle: {
    textAlign: 'right',
    fontWeight: 'bold'
  },
  balancePaymentHR: {
    minWidth: '100%'
  },
  prioratizeTexts: {
    fontSize: '1.3rem'
  },
  cardShadow: {
    boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.33)',
  },
  tableContainer: {
    maxHeight: 160
  },
}));

export default function ViewBalance() {

  const { customerBalancePaymentID } = useParams();
  const alert = useAlert();
  const componentRef = useRef();
  const navigate = useNavigate();
  const classes = useStyles();
  const handleClick = () => {
    navigate('/app/customerBalancePayment/listing');
  }

  const [CustomerAdvancedPaymentDetails, setCustomerAdvancedPaymentDetails] = useState([]);
  const [BalanceBoardForward, setBalanceBoardForward] = useState(0);
  const [DueAmountCF, setDueAmountCF] = useState(0);
  const [BalancePaymant, setBalancePaymant] = useState(0);
  const [CustomerCropDetails, setCustomerCropDetails] = useState([]);

  const [CustomerDeductionDetails, setCustomerDeductionDetails] = useState([{
    createdDate: '',
    customerBalancePaymentAmount: 0,
    customerBalancePaymentID: 0,
    customerID: 0,
    customerTransactionAmount: 0,
    entryType: 0,
    factoryID: 0,
    groupID: 0,
    paymentStatus: 0,
    routeID: 0,
    transactionTypeCode: '',
    transactionTypeID: 0,
    transactionTypeName: ''
  }]);

  const [CustomerCreditList, setCustomerCreditList] = useState([])
  const [CustomerBalancePaymentID, setCustomerBalancePaymentID] = useState(0)
  const [customerBalancePayment, setCustomerBalancePayment] = useState({
    registrationNumber: '',
    customerName: '',
    applicableMonth: '',
    applicableYear: '',
    groupID: 0,
    factoryID: 0,
    isReceiptPrint: false
  });
  const [PaymodeID, setPaymodeID] = useState('0')
  const [CustomerBalancePaymentCutOffAmount, setCustomerBalancePaymentCutOffAmount] = useState(0);

  //Payment Receipt changes
  const previous = new Date();
  previous.setMonth(previous.getMonth() - 1);
  const current = new Date();
  current.setMonth(current.getMonth());
  const [IsPrintButtonDisabled, setIsPrintButtonDisabled] = useState(true);
  const [BalancePaymentPaymentReciptDetails, setBalancePaymentPaymentReciptDetails] = useState({
    receiptDate: new Date().toISOString().split('T', 1),
    factoryName: 'Wathuravila Tea Factory',
    payeeName: '',
    payeeAddress: '',
    payeeAddressTwo: '',
    payeeAddressThree: '',
    previousMonthName: '',
    currentMonthName: '',
    previousMonthAmount: 0,
    currentMonthAmount: 0,
    isOverAdvance: false,
    customerCropDetails: [],
    customerAdvancedPaymentDetails: [],
    customerCreditDetails: [],
    customerDeductionDetails: [],
    customerBalanceBroughtForward: null,
    customerBalancePayment: [],
    customerFactoryItemDetails: []
  })
  const [CustomerBalanacePaymentReciptTemplateName, setCustomerBalanacePaymentReciptTemplateName] = useState('not_configured_yet')
  //Payment Receipt changes
  const [customerFactoryItem, setCustomerFactoryItem] = useState([]);
  const [customerLoanDetails, setCustomerLoanDetails] = useState([]);

  let decryptedCustomerID = 0;
  let totalCropAmount = 0;
  let totalCropPayment = 0;
  let totalDeduction = 0;

  useEffect(() => {
    decryptedCustomerID = atob(customerBalancePaymentID.toString());
    if (decryptedCustomerID != 0) {
      setCustomerBalancePaymentID(decryptedCustomerID)
      trackPromise(
        getCustomerBalancePaymentDetails(decryptedCustomerID)
      )
    }
  }, []);

  useEffect(() => {
    if (customerBalancePayment.groupID !== 0 && customerBalancePayment.factoryID !== 0) {
      trackPromise(GetCustodmerBalancePaymentTemplateName())
    }
  }, [customerBalancePayment.groupID, customerBalancePayment.factoryID])

  useEffect(() => {
    BalancePaymant >= CustomerBalancePaymentCutOffAmount ? setPaymodeID('2') : setPaymodeID('1')
  }, [BalancePaymant, CustomerBalancePaymentCutOffAmount])

  async function GetCustodmerBalancePaymentTemplateName() {
    let response = await services.GetCustomerBalancePayementTemeplateName(customerBalancePayment.groupID, customerBalancePayment.factoryID)
    setCustomerBalanacePaymentReciptTemplateName(response.data.returnTemplateModelName)
  }

  async function getCustomerBalancePaymentDetails(customerBalancePaymentID) {

    let response = await services.getCustomerBalancePaymentDetailsByPaymantID(customerBalancePaymentID);
    if (response.statusCode == "Success") {
      let Data = response;

      setCustomerBalancePaymentCutOffAmount(Data.customerBalancePaymentCutoffAmount);

      if (Data.customerBasicDetailsModel.length !== 0) {
        setCustomerBalancePayment(Data.customerBasicDetailsModel);
      }

      if (Data.customerBalancePaymentDetailsModelSingleCall.length !== 0) {
        setCustomerAdvancedPaymentDetails(Data.customerBalancePaymentDetailsModelSingleCall);
      }

      if (Data.customerCropDetailsModels.length !== 0) {
        setCustomerCropDetails(Data.customerCropDetailsModels);
      }

      if (Data.customerFactoryItemDetailModel.length !== 0) {
        setCustomerFactoryItem(Data.customerFactoryItemDetailModel);
      }

      if (Data.customerLoanDetailModel.length !== 0) {
        setCustomerLoanDetails(Data.customerLoanDetailModel);
      }

      // if (Data.customerDeductionDetails.length !== 0) {
      //   await extractTransactionTypeDetails(Data.customerDeductionDetails);
      // }

      if (Data.debitDetailsList.length !== 0) {
        await extractTransactionTypeDetails(Data.debitDetailsList);
      }

      Data.creditDetailsList.length !== 0 ? setCustomerCreditList(Data.creditDetailsList) : setCustomerCreditList([])

      setBalancePaymentPaymentReciptDetails({
        ...BalancePaymentPaymentReciptDetails,
        customerAdvancedPaymentDetails: Data.customerBalancePaymentDetailsModelSingleCall,
        customerCropDetails: Data.customerCropDetailsModels,
        payeeName: Data.customerBasicDetailsModel.customerName,
        payeeAddress: Data.customerBasicDetailsModel.address,
        payeeAddressTwo: Data.customerBasicDetailsModel.addressTwo,
        payeeAddressThree: Data.customerBasicDetailsModel.addressThree,
        customerCreditDetails: Data.creditDetailsList,
        customerDeductionDetails: Data.debitDetailsList.filter((obj) => obj.transactionTypeCode !== "BBF" && obj.transactionTypeCode !== "BP" && obj.transactionTypeCode !== "BCF"),
        customerBalanceBroughtForward: Data.debitDetailsList.map((obj) => { return (obj.transactionTypeCode === "BBF") }),
        customerBalancePayment: Data.debitDetailsList.filter((obj) => obj.transactionTypeCode === "BP"),
        customerFactoryItemDetails: Data.customerFactoryItemDetailModel
      })

    }
    else {
      alert.error(response.message);
      return 0;
    }

  }

  async function extractTransactionTypeDetails(customerDeductionDetails) {
    let deductionList = [];

    customerDeductionDetails.map((object) => {
      if (object.transactionTypeCode === "BBF") {
        setBalanceBoardForward(object.customerTransactionAmount);
      } else if (object.transactionTypeCode === "BP") {
        setBalancePaymant(object.customerTransactionAmount);
      } else if (object.transactionTypeCode === "BCF") {
        setDueAmountCF(object.customerTransactionAmount);
      } else {
        deductionList.push(object)
      }
    });

    setCustomerDeductionDetails(deductionList);
    return deductionList
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader
            onClick={handleClick}
          />
        </Grid>
      </Grid>
    )
  }

  async function IssueCustomerBalancepayment() {
    let saveModel = {
      CustomerCropDetails: CustomerCropDetails,
      CustomerAdvancedPaymentDetails: CustomerAdvancedPaymentDetails,
      Deductions: CustomerDeductionDetails,
      CustomerFactoryItem: customerFactoryItem,
      CustomerBalancePayment: customerBalancePayment,
      CustomerLoanDetails: customerLoanDetails,
      BalancePaymant: BalancePaymant
    }

    let resuestModel = {
      GroupID: parseInt(customerBalancePayment.groupID),
      FactoryID: parseInt(customerBalancePayment.factoryID),
      CustomerBalancePaymentID: parseInt(CustomerBalancePaymentID),
      ApplicableMonth: customerBalancePayment.applicableMonth,
      ApplicableYear: customerBalancePayment.applicableYear,
      ModifiedBy: tokenDecoder.getUserIDFromToken(),
      BalancePaymentAmount: BalancePaymant,
      PayMode: parseInt(PaymodeID)
    }

    let response = await services.IssueCustomerBalancePayment(resuestModel);

    if (response.statusCode == "Success") {
      setIsPrintButtonDisabled(false)
      alert.success(response.message);
    } else {
      alert.error(response.message);
      setIsPrintButtonDisabled(true)
    }
  }

  function handleChange(e) {
    setPaymodeID(e.target.value)
  }

  function GetBalancePaymentReceiptTemplate() {
    if (CustomerBalanacePaymentReciptTemplateName === "CustomerBalancePayment_03_05") {
      return (<CustomerBalancePayment_03_05 ref={componentRef} data={BalancePaymentPaymentReciptDetails} />);
    } else {
      return (<h1>Payment Template Is Not Loaded, Please contact Admin</h1>);
    }
  }

  return (
    <Page className={classes.root} title={"Customer Balance Payment Cash/Cheque Issue"}>
      <LoadingComponent />
      <Container maxWidth={false}>
        <Box mt={1}>
          <PerfectScrollbar>
            <Box mt={0}>
              <Card>
                <CardHeader
                  title={cardTitle("Customer Balance Payment Cash/Cheque Issue")}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item md={12} xs={12}>
                      <Card>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item md={2} xs={12}>
                              <TextField
                                fullWidth
                                disabled={true}
                                label="Customer Account : "
                                value={customerBalancePayment.registrationNumber}
                                InputProps={{
                                  readOnly: true,
                                  disableUnderline: true
                                }}
                              />
                            </Grid>

                            <Grid item md={3} xs={12}>
                              <TextField
                                fullWidth
                                disabled={true}
                                label="Customer Name : "
                                value={customerBalancePayment.customerName}
                                InputProps={{
                                  readOnly: true,
                                  disableUnderline: true
                                }}
                              />
                            </Grid>

                            <Grid item md={2} xs={12}>
                              <TextField
                                fullWidth
                                disabled={true}
                                label="Applicable Month"
                                value={customerBalancePayment.applicableMonth}
                                InputProps={{
                                  readOnly: true,
                                  disableUnderline: true
                                }}
                              />
                            </Grid>

                            <Grid item md={2} xs={12}>
                              <TextField
                                fullWidth
                                disabled={true}
                                label="Applicable Year"
                                value={customerBalancePayment.applicableYear}
                                InputProps={{
                                  readOnly: true,
                                  disableUnderline: true
                                }}
                              />
                            </Grid>

                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="payModeID">
                                Pay Mode
                              </InputLabel>
                              <TextField select
                                fullWidth
                                size='small'
                                name="payModeID"
                                onChange={(e) => handleChange(e)}
                                value={PaymodeID}
                                variant="outlined"
                                id="payModeID"
                              >
                                <MenuItem value="0">--Select Paymode--</MenuItem>
                                <MenuItem value="1">Cash</MenuItem>
                                <MenuItem value="2">Cheque</MenuItem>
                              </TextField>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid item md={7} xs={12}>
                      <Card className={classes.cardShadow}>
                        <CardHeader
                          title={"Earnings"}
                        />
                        <Divider />
                        {
                          CustomerCropDetails.length > 0 ?
                            <CardContent>
                              <Grid container mt={2} spacing={2}>
                                <Grid item md={4} xs={12}><InputLabel className={classes.earningsTitle}>Weight</InputLabel></Grid>
                                <Grid item md={3} xs={12}><InputLabel className={classes.earningsTitle}>Balance Rate</InputLabel></Grid>
                              </Grid>
                              {
                                CustomerCropDetails.map((object) => {
                                  {
                                    totalCropAmount = totalCropAmount + object.cropWeight;
                                    totalCropPayment = totalCropPayment + (object.cropWeight * object.cropRate);
                                  }
                                  return (
                                    <Grid container mt={2} spacing={2}>

                                      <Grid item md={3} xs={12}><InputLabel>{object.collectionTypeName}</InputLabel></Grid>
                                      <Grid item md={2} xs={12}><InputLabel>{object.cropWeight + " Kg"}</InputLabel></Grid>
                                      <Grid item md={2} xs={12}>
                                        <Grid container mt={2} spacing={2}>
                                          <Grid item md={3} xs={12}><InputLabel className={classes.rupeesLablel}>
                                            {"Rs "} </InputLabel></Grid>
                                          <Grid item md={9} xs={12}><InputLabel className={classes.inputLabel}>
                                            {object.cropRate.toFixed(2)}
                                          </InputLabel></Grid>
                                        </Grid>
                                      </Grid>
                                      <Grid item md={2} xs={12} />

                                      <Grid item md={2} xs={12}>
                                        <Grid container mt={2} spacing={2}>
                                          <Grid item md={3} xs={12}><InputLabel className={classes.rupeesLablel}>
                                            {"Rs "} </InputLabel></Grid>
                                          <Grid item md={9} xs={12}><InputLabel className={classes.inputLabel}>
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
                                <Grid item md={3} xs={12}><InputLabel>Total Leaf</InputLabel></Grid>
                                <Grid item md={2} xs={12}><InputLabel>{totalCropAmount + " Kg"}</InputLabel></Grid>
                                <Grid item md={4} xs={12}></Grid>
                                <Grid item md={2} xs={12}>
                                  <Grid container mt={2} spacing={2}>
                                    <Grid item md={3} xs={12}><InputLabel className={classes.rupeesLablel}>
                                      {"Rs "} </InputLabel></Grid>
                                    <Grid item md={9} xs={12}><InputLabel className={classes.inputLabel}>
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
                          DueAmountCF > 0 ?
                            <CardHeader
                              title={"Other"}
                            /> : null}
                        {DueAmountCF > 0 ?
                          <CardContent>
                            <Divider />
                            <br />
                            <Grid container mt={2} spacing={2}>
                              <Grid item md={3} xs={12}><InputLabel>Balance Brought Forward</InputLabel></Grid>
                              <Grid item md={1} xs={12}><InputLabel></InputLabel></Grid>
                              <Grid item md={5} xs={12}>
                                <Chip
                                  className={classes.floatingButton}
                                  size="small"
                                  label='BBF'
                                  color="secondary"
                                />
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <Grid container mt={2} spacing={2}>
                                  <Grid item md={2} xs={12}><InputLabel className={classes.rupeesLablel}>
                                    {"Rs "} </InputLabel></Grid>
                                  <Grid item md={10} xs={12}><InputLabel className={classes.inputLabel}>
                                    {DueAmountCF.toFixed(2)}
                                  </InputLabel></Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </CardContent> : null
                        }

                        <CardContent>

                          {/* <Grid container mt={9} spacing={2}>
                            <Grid item md={9} xs={12}>
                              <InputLabel></InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <Grid container mt={3} spacing={2}>
                                <hr className={classes.balancePaymentHR} />
                                <Grid item md={2} xs={12}><InputLabel className={classes.rupeesLablel}>
                                  {"Rs"} </InputLabel></Grid>
                                <Grid item md={9} xs={12}><InputLabel className={classes.inputLabel}>
                                  {(totalCropPayment + DueAmountCF).toFixed(2)}
                                </InputLabel></Grid>
                              </Grid>
                            </Grid>
                          </Grid><br /> */}
                        </CardContent>

                      </Card>
                      <br />
                      <Grid container mt={2} spacing={2}>
                        <Grid item md={12} xs={12}>
                          <Card className={classes.cardShadow}>
                            <CardHeader
                              title={"Deductions"}
                            />
                            <Divider />
                            {
                              CustomerDeductionDetails.length > 0 ?
                                <CardContent>
                                  {
                                    BalanceBoardForward > 0 ?
                                      <div>
                                        <Grid container mt={2} spacing={2}>

                                          <Grid item md={4} xs={12}>
                                            <InputLabel>
                                              Balance Carried Forward
                                            </InputLabel>
                                          </Grid>

                                          <Grid item md={2} xs={12}>
                                            <Chip
                                              className={classes.floatingButton}
                                              size="small"
                                              label='BCF'
                                              color="secondary"
                                            />
                                          </Grid>

                                          <Grid item md={2} xs={12}>
                                            <Grid container mt={2} spacing={2}>
                                              <Grid item md={3} xs={12}><InputLabel className={classes.rupeesLablel}>
                                                {"Rs "} </InputLabel></Grid>
                                              <Grid item md={9} xs={12}><InputLabel className={classes.inputLabel}>
                                                {BalanceBoardForward.toFixed(2)}
                                              </InputLabel></Grid>
                                            </Grid>
                                          </Grid>

                                          <Grid item md={2} xs={12}></Grid>
                                        </Grid>
                                      </div>
                                      : null
                                  }

                                  {
                                    CustomerDeductionDetails.map((object) => {
                                      { totalDeduction = totalDeduction + (object.customerTransactionAmount) }
                                      return (
                                        <Grid container mt={2} spacing={2}>

                                          <Grid item md={4} xs={12}>
                                            <InputLabel>
                                              {object.transactionTypeName}
                                            </InputLabel>
                                          </Grid>

                                          <Grid item md={2} xs={12}>
                                            <Chip
                                              className={classes.floatingButton}
                                              size="small"
                                              label={object.transactionTypeCode}
                                              color="secondary"
                                            />
                                          </Grid>

                                          <Grid item md={2} xs={12}>
                                            <Grid container mt={2} spacing={2}>
                                              <Grid item md={3} xs={12}><InputLabel className={classes.rupeesLablel}>
                                                {"Rs "} </InputLabel></Grid>
                                              <Grid item md={9} xs={12}><InputLabel className={classes.inputLabel}>
                                                {object.customerTransactionAmount.toFixed(2)}
                                              </InputLabel></Grid>
                                            </Grid>
                                          </Grid>

                                          <Grid item md={2} xs={12}></Grid>
                                        </Grid>
                                      )
                                    })
                                  }
                                  <br />
                                  <br />
                                  <Grid container mt={10} spacing={2}>
                                    <Grid item md={6} xs={12}>
                                      <InputLabel>Total Deductions</InputLabel>
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                      <Grid container mt={2} spacing={2}>
                                        <hr className={classes.balancePaymentHR} />
                                        <Grid item md={2} xs={12}><InputLabel className={classes.rupeesLablel}>
                                          {"Rs"} </InputLabel></Grid>
                                        <Grid item md={8} xs={12}><InputLabel className={classes.inputLabel}>
                                          {(totalDeduction + BalanceBoardForward).toFixed(2)}
                                        </InputLabel></Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid><br />

                                  {
                                    CustomerCreditList.map((object) => {
                                      { totalDeduction = totalDeduction + (object.customerTransactionAmount) }
                                      return (
                                        <Grid container mt={2} spacing={2}>

                                          <Grid item md={4} xs={12}>
                                            <InputLabel>
                                              {object.transactionTypeName}
                                            </InputLabel>
                                          </Grid>

                                          <Grid item md={2} xs={12}>
                                            <Chip
                                              className={classes.floatingButton}
                                              size="small"
                                              label={object.transactionTypeCode}
                                              color="secondary"
                                            />
                                          </Grid>
                                          <Grid item md={3} xs={12}></Grid>
                                          <Grid item md={2} xs={12}>
                                            <Grid container mt={2} spacing={2}>
                                              <Grid item md={3} xs={12}><InputLabel className={classes.rupeesLablel}>
                                                {"Rs "} </InputLabel></Grid>
                                              <Grid item md={9} xs={12}><InputLabel className={classes.inputLabel}>
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
                                    <Grid item md={6} xs={12}>
                                      <InputLabel className={classes.prioratizeTexts}><b>Balance Payment</b></InputLabel>
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                      <Grid container mt={2} spacing={2}>
                                        <Grid item md={3} xs={12}><InputLabel className={classes.rupeesLablel}>
                                          <b>{"Rs"}</b> </InputLabel></Grid>
                                        <Grid item md={9} xs={12}><InputLabel className={classes.inputLabel}>
                                          <b>{BalancePaymant.toFixed(2)}</b>
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

                    <Grid item md={5} xs={12}>
                      <Card className={classes.cardShadow}>
                        <CardHeader
                          title={"Advanced Details"}
                        />
                        <Divider />
                        {
                          CustomerAdvancedPaymentDetails.length > 0 ?
                            <CardContent>
                              <Grid container mt={2} spacing={2}>
                                <Grid item md={6} xs={12}><InputLabel className={classes.advancedPaymantTitle}>Date</InputLabel></Grid>
                                <Grid item md={6} xs={12}><InputLabel className={classes.advancedPaymantTitle}>Amount</InputLabel></Grid>
                              </Grid>
                              {
                                CustomerAdvancedPaymentDetails.map((object) => (
                                  <Grid container mt={2} spacing={2}>
                                    <Grid item md={6} xs={12}><InputLabel className={classes.advancedPaymant}>{object.createdDate.substr(0, 10)} </InputLabel></Grid>
                                    <Grid item md={6} xs={12}><InputLabel className={classes.advancedPaymant}>{"Rs "}{object.amount.toFixed(2)}</InputLabel></Grid>
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
                        <Card className={classes.cardShadow}>
                          <CardHeader
                            title={"Factory Items"}
                          />
                          <Divider />
                          {customerFactoryItem.length > 0 ?
                            <CardContent>
                              <TableContainer component={Paper} className={classes.tableContainer}>
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
                                        Amount(Rs)
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {customerFactoryItem.map((data) => (
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
                                          {data.totalPrice.toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </CardContent>
                            :
                            <CardContent>
                              <InputLabel>No Factory Items</InputLabel>
                            </CardContent>
                          }
                        </Card>
                        <br />
                        <Grid item md={12} xs={12}>
                          <Card className={classes.cardShadow}>
                            <CardHeader
                              title={"Loan"}
                            />
                            <Divider />
                            {customerLoanDetails.length > 0 ?
                              <CardContent>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>
                                        Purpose
                                      </TableCell>
                                      <TableCell>
                                        Principal Amount (Rs)
                                      </TableCell>
                                      <TableCell>
                                        Installment Amount (Rs)
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {customerLoanDetails.map((data) => (
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
                  <Box display="flex" flexDirection="row-reverse" p={2} >
                    {

                      IsPrintButtonDisabled ?
                        <>
                          {
                            BalancePaymant > 0 ?
                              <Button
                                color="primary"
                                variant="contained"
                                onClick={() => (trackPromise(IssueCustomerBalancepayment()))}
                              >
                                Issue
                              </Button>
                              : null
                          }
                        </> :
                        customerBalancePayment.isReceiptPrint === false ?
                          <div>
                            <ReactToPrint
                              documentTitle={"Customer Balance Payment Receipt"}
                              trigger={() =>
                                <Button
                                  color="primary"
                                  type="submit"
                                  variant="contained"
                                  size="medium"
                                  style={{ marginRight: '0.5rem' }}
                                >
                                  Print Receipt
                                </Button>
                              }
                              content={() => componentRef.current}
                            // onAfterPrint={() => ClearData()}
                            />
                            <div hidden={true}>
                              {
                                GetBalancePaymentReceiptTemplate()
                              }
                            </div>
                          </div> :

                          <div>
                            <ReactToPrint
                              documentTitle={"Customer Balance Payment Receipt- RePrint"}
                              trigger={() =>
                                <Button
                                  color="primary"
                                  type="submit"
                                  variant="contained"
                                  size="medium"
                                  style={{ marginRight: '0.5rem' }}
                                >
                                  Re-Print Receipt
                                </Button>
                              }
                              content={() => componentRef.current}
                            // onAfterPrint={() => ClearData()}
                            />
                            <div hidden={true}>
                              {
                                GetBalancePaymentReceiptTemplate()
                              }
                            </div>
                          </div>

                    }
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </PerfectScrollbar>
        </Box>

      </Container>
    </Page >
  )
}

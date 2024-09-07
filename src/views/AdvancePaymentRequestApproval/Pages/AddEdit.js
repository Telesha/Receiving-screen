import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  colorReject: {
    backgroundColor: "red",
  },
  colorApprove: {
    backgroundColor: "green",
  },
  inputText: {
    textAlign: 'center',
  }
}));

export default function AdvancePaymentApprovalAddEdit(props) {
  const [title, setTitle] = useState("FactoryItem Request Approval")
  const [isUpdate, setIsUpdate] = useState(false);
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [inPending, setInPending] = useState(false);
  const [totalPrice, setTotalPrice] = useState();
  const [approval, setApproval] = useState({

    factoryID: '0',
    itemCode: '',
    itemName: '',
    customerName: '',
    requestedAmount: '',
    createdDate: '',
    approvedQuantity: '',
    reason: '',
    isActive: true,
    balance: '',
    registrationNumber: '',
    unitPrice: ''
  });

  const navigate = useNavigate();
  const handleClick = () => {

    navigate('/app/advancePaymentApproval/listing');

  }
  const ApprovalEnum = Object.freeze({ "Pending": 1, "Approve": 2, "Reject": 3, })
  const alert = useAlert();
  const { advancePaymentRequestID } = useParams();
  const [customerList, setCustomerList] = useState();
  let decrypted = 0;

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    decrypted = atob(advancePaymentRequestID.toString());
    if (decrypted != 0) {
      trackPromise(
        getApproveDetails(decrypted),
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown()
    );
  }, []);
  useEffect(() => {
    setTotalPriceBox();

  }, [approval.approvedQuantity]);

  function setTotalPriceBox() {
    approval.approvedQuantity == null || approval.approvedQuantity == "" ? setTotalPrice(0) :
      setTotalPrice((parseFloat(approval.unitPrice) * parseFloat(approval.approvedQuantity)).toFixed(2))

  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown();
    setFactories(factory);
  }

  async function getApproveDetails(advancePaymentRequestID) {
    let response = await services.getApprovedDetailsByID(advancePaymentRequestID);
    let data = response[0];
    let response1 = await services.getCustomerAccountBalance(data.customerID, data.customerAccountID);
    let data1 = response1.balance;

    let newModel = {
      itemCode: data.itemCode,
      itemName: data.itemName,
      customerName: data.customerName,
      requestedAmount: data.requestedAmount,
      createdDate: data.createdDate.split('T')[0],
      reason: data.reason,
      approvedQuantity: data.approvedQuantity,
      balance: data1,
      registrationNumber: data.registrationNumber,
      unitPrice: data.unitPrice,
    }
    setTitle("Advance Payment Request Approval");
    setApproval(newModel);
    setIsUpdate(true);
    data.statusID == ApprovalEnum.Pending ? setInPending(true) : setInPending(false);

  }
  async function getPermissions() {
  }

  async function ApproveAdvancePayment(values) {
    let response = await services.getApprovedDetailsByID(atob(advancePaymentRequestID.toString()));
    let data = response[0];
    let approveModel = {
      advancePaymentRequestID: atob(advancePaymentRequestID.toString()),
      requestedAmount: values.requestedAmount,
      customerID: data.customerID,
      customerAccountID: data.customerAccountID,
    }

    if (values.balance == 0 || values.balance == null || values.balance == undefined) {
      alert.error("Insufficient fund in account");
    }
    else if (values.requestedAmount > values.balance) {
      alert.error("Insufficient fund in account")
    }
    else {
      let response = await services.ApproveAdvancePayment(approveModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/advancePaymentApproval/listing');
      }
      else {
        alert.error(response.message);
      }
    }

  }

  async function RejectClick(data) {

    let rejectModel = {
      advancePaymentRequestID: atob(advancePaymentRequestID.toString()),
    }
    let response = await services.RejectAdvancePayment(rejectModel);

    if (response.statusCode == "Success") {
      alert.success(response.message);
      navigate('/app/advancePaymentApproval/listing');
    }
    else {
      alert.error(response.message);
    }

  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>

          <PageHeader
            onClick={handleClick}
          />
          <Formik
            initialValues={{

              customerName: approval.customerName,
              requestedAmount: approval.requestedAmount,
              createdDate: approval.createdDate,
              isActive: approval.isActive,
              balance: approval.balance,
              registrationNumber: approval.registrationNumber,

            }}
            validationSchema={
              Yup.object().shape({
                customerName: Yup.string().required('RouteLocation required'),
                requestedAmount: Yup.number().required('TransportRate required'),
                createdDate: Yup.string().required('TargetCrop required'),
                registrationNumber: Yup.string().required('Registration number required')
              })
            }
            onSubmit={ApproveAdvancePayment}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values,
              props
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={3}>
                  <Card>
                    <CardHeader
                      title={title}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <CardHeader style={{ marginLeft: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                          title="Customer Account Details"
                        />
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="customerName">
                              Customer Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.customerName && errors.customerName)}
                              fullWidth
                              helperText={touched.customerName && errors.customerName}
                              name="customerName"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.customerName}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                                disableUnderline: isUpdate ? true : false,
                                textAlign: 'center',
                                alignContent: 'center',
                              }}
                              style={{ marginTop: '1rem' }}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Registration Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                              fullWidth
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              name="registrationNumber"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.registrationNumber}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                                disableUnderline: isUpdate ? true : false,
                                textAlign: 'center',
                                alignContent: 'center',
                              }}
                              style={{ marginTop: '1rem' }}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="balance">
                              Customer Account Balance *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.balance && errors.balance)}
                              fullWidth
                              helperText={touched.balance && errors.balance}
                              name="balance"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.balance}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                                disableUnderline: true,
                                textAlign: 'center',
                                alignContent: 'center',
                              }}
                              style={{ marginLeft: "3rem", marginTop: '1rem' }}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="createdDate">
                              Requested Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.createdDate && errors.createdDate)}
                              fullWidth
                              helperText={touched.createdDate && errors.createdDate}
                              name="createdDate"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.createdDate}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                                disableUnderline: isUpdate ? true : false,
                              }}
                              style={{ marginTop: '1rem' }}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="requestedAmount">
                              Request Amount *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.requestedAmount && errors.requestedAmount)}
                              fullWidth
                              helperText={touched.requestedAmount && errors.requestedAmount}
                              name="requestedAmount"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.requestedAmount}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                                disableUnderline: isUpdate ? true : false,
                              }}
                              style={{ marginTop: '1rem' }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        {inPending === true ?
                          <Button
                            color="secondary"
                            variant="contained"
                            style={{
                              marginRight: "1rem",
                            }}
                            className={classes.colorReject}
                            onClick={() => RejectClick(values)}
                          >
                            Reject
                          </Button>
                          : null}
                        {inPending === true ?
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            className={classes.colorApprove}
                            onClick={() => ApproveAdvancePayment(values)}
                          >
                            Approve
                          </Button>
                          : null}
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
};

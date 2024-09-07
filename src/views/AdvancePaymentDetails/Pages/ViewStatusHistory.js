
import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  Divider,
  CardContent,
  CardHeader,
  Grid,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import PageHeader from 'src/views/Common/PageHeader';
import ReactToPrint from 'react-to-print';
import CreateInvoicePDF from './CreateInvoicePDF';
import moment from 'moment';

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
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecordAndNew: {
    backgroundColor: "#FFBE00"
  },
  colorRecord: {
    backgroundColor: "green",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
}));

const screenCode = 'ADVANCEDPAYMENTDETAILS';

export default function ViewAdvancePaymentStatusHistory(props) {
  const [title, setTitle] = useState("View Advance Payment Details")
  const classes = useStyles();
  const componentRef = useRef();
  const [factoryEnteringInput, setFactoryEnteringInput] = useState([])
  const [advancePaymentData, setAdvancePaymentData] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState([]);
  const [otherData, setOtherData] = useState([]);
  const [leafData, setLeafrData] = useState([]);
  const [id, setID] = useState([]);
  const [customerName, setCustomerName] = useState([]);
  const [approvedAmount, setApprovedAmount] = useState([]);
  const [reqAmount, setReqAmount] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  var year = advancePaymentData.length != 0 ? new Date((advancePaymentData[0].issuingDate)).getUTCFullYear().toString() : '';
  var month = advancePaymentData.length != 0 ? moment(advancePaymentData[0].issuingDate).format('MM') : '';
  const { advancePaymentRequestID, groupID, factoryID } = useParams();
  let decrypted = 0;
  let decryptedGroupID = 0;
  let decryptedFactoryID = 0;
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/advancePaymentDetails/listing')
  }

  useEffect(() => {
    trackPromise(getPermission())

  }, []);

  useEffect(() => {
    decrypted = atob(advancePaymentRequestID.toString());
    decryptedGroupID = atob(groupID.toString());
    decryptedFactoryID = atob(factoryID.toString());
    if (decrypted != 0) {
      trackPromise(
        GetAdvancePaymentStatusHistory(decrypted),
      )
      setFactoryEnteringInput({
        ...factoryEnteringInput,
        groupID: parseInt(decryptedGroupID),
        factoryID: parseInt(decryptedFactoryID)
      })
    }
  }, []);

  useEffect(() => {
    if (factoryEnteringInput.groupID != 0 && factoryEnteringInput.factoryID != 0 && factoryEnteringInput.length != 0) {
      getGroupAndFactoryDetailsForReport();
    }
  }, [factoryEnteringInput.groupID, factoryEnteringInput.factoryID]);

  useEffect(() => {
    if (advancePaymentData.length != 0 && factoryEnteringInput.groupID != 0 && factoryEnteringInput.factoryID != 0) {
      getLeafDetails();
    }
  }, [isDone]);


  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADVANCEPAYMENTDETAILS');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

  }

  async function GetAdvancePaymentStatusHistory(advancePaymentRequestID) {
    const response = await services.GetAdvancePaymentStatusHistory(advancePaymentRequestID);
    setID(advancePaymentRequestID);
    setCustomerName(response.data[0].customerName);
    setReqAmount(response.data[0].requestedAmount.toFixed(2));
    setApprovedAmount(response.data[0].approvedAmount.toFixed(2));

    setTitle("View Advance Payment Details");
    setAdvancePaymentData(response.data);
    setIsDone(true);
  }

  async function getGroupAndFactoryDetailsForReport() {
    const response = await services.getGroupAndFactoryDetailsForReport(factoryEnteringInput.groupID, factoryEnteringInput.factoryID);
    setSelectedSearchValues(response.data[0])
  }

  async function getLeafDetails() {
    let requestModel = {
      groupID: parseInt(factoryEnteringInput.groupID),
      factoryID: parseInt(factoryEnteringInput.factoryID),
      registrationNumber: (advancePaymentData[0].registrationNumber).toString(),
      year: year.toString(),
      month: month.toString()
    }
    const advanceOther = await services.GetLeafDetails(requestModel);
    var advanceOtherData = advanceOther.data[0]
    if (advanceOther.statusCode == "Success" && advanceOtherData != null) {
      const totalPerDayAmount = advanceOtherData.leafDetails.reduce((acc, leaf) => acc + leaf.perDayAmount, 0);
      advanceOtherData.totalPerDayAmount = totalPerDayAmount
      setLeafrData(advanceOtherData.leafDetails);
      setOtherData(advanceOtherData)
    }
    setIsDone(false);
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

  function statusTypes(data) {
    if (data == 1) {
      return 'Pending';
    }
    else if (data == 2) {
      return 'Issue';
    }
    else if (data == 3) {
      return 'Reject';
    }
    else if (data == 4) {
      return 'Send_To_Deliver';
    }
    else if (data == 5) {
      return 'Autherized';
    }
    else if (data == 6) {
      return 'Delivered';
    }
    else {
      return null;
    }
  }


  function advanceRequestTypes(data) {
    if (data == 1) {
      return 'Mobile Advance';
    }
    else if (data == 2) {
      return 'Over Advance';
    }
    else if (data == 3) {
      return 'Direct Advance';
    }
    else {
      return null;
    }
  }
  function createdDate(data) {
    return data;
  }
  function userName(data) {
    return data;
  }


  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
          >
            {({ errors, handleBlur, handleSubmit, touched, values }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle(title)}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>

                        <Card style={{ padding: 30, marginTop: 20 }}>
                          <Grid container md={12} spacing={2} style={{ justifyContent: 'start' }}>
                            <Grid item md={3} xs={12}>
                              <InputLabel><b>Advance Payment Requeste ID</b></InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel > {": " + id} </InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel><b>Requested Amount</b></InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel > {": " + reqAmount} </InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel><b>Customer Name</b></InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel > {": " + customerName} </InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel><b>Approved Amount </b></InputLabel>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel > {": " + approvedAmount} </InputLabel>
                            </Grid>
                          </Grid>
                        </Card>
                        <br></br>
                        <br></br>

                        <Divider />
                        <br></br>
                        {(advancePaymentData.length > 0) ?
                          <TableContainer >
                            <Table className={classes.table} aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Advance Request Type</TableCell>
                                  <TableCell>Date</TableCell>
                                  <TableCell>Authorized User</TableCell>

                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {advancePaymentData.map((rowData, index) => (
                                  <TableRow key={index}>
                                    <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {statusTypes(rowData.statusID)}
                                    </TableCell>
                                    <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {advanceRequestTypes(rowData.advanceRequestType)}
                                    </TableCell>
                                    <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {createdDate(rowData.issuingDate.split('T')[0])}
                                    </TableCell>
                                    <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {userName(rowData.userName)}
                                    </TableCell>

                                  </TableRow>
                                ))}

                              </TableBody>
                            </Table>
                          </TableContainer>
                          : null}
                        <br />
                      </CardContent>
                      {advancePaymentData.length > 0 ? (
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <ReactToPrint
                            documentTitle={'Advance Payement Invoice'}
                            trigger={() => (
                              <Button
                                color="primary"
                                id="btnRecord"
                                variant="contained"
                                className={classes.colorCancel}
                                size="small"
                              >
                                PDF
                              </Button>
                            )}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreateInvoicePDF
                              ref={componentRef}
                              searchData={selectedSearchValues}
                              otherData={otherData}
                              leafData={leafData}
                              advancePaymentData={advancePaymentData}
                            />
                          </div>
                        </Box>
                      ) : null}
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  )
}

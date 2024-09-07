import React, { useState, useEffect, createContext, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  InputLabel,
  TextField,
  CardHeader,
  IconButton
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import { Formik } from 'formik';
import * as Yup from "yup";
import tokenService from '../../../utils/tokenDecoder';
import authService from '../../../utils/permissionAuth';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import { AlertDialog } from './../../../views/Common/AlertDialog';
import { LoadingComponent } from '../../../utils/newLoader';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
}));

const screenCode = 'OVERADVANCEPAYMENTREQUEST';
export default function AdvancePaymentRequestListing() {
  const classes = useStyles();
  const [advancePaymentRequestData, setAdvancePaymentRequestData] = useState([]);
  const [title, setTitle] = useState("Over Advance");
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [routes, setRoutes] = useState();
  const [customers, setCustomers] = useState();
  const [isViewTable, setIsViewTable] = useState(true);
  const [EnableConfirmMessage, setEnableConfirmMessage] = useState(false);
  const [advancePaymentRequestID, setAdvancePaymentRequestID] = useState();
  const [message, setMessage] = useState("Over Advance Confirmation");
  const [requestedAmount, setRequestedAmount] = useState();
  const [registrationNumber, setRegistrationNumber] = useState();
  const [approvedAmount, setApprovedAmount] = useState();
  const alert = useAlert();
  const [approveList, setApproveList] = useState({
    groupID: '0',
    factoryID: '0',
    routeID: '0',
    registrationNumber: '',
    date: null
  })
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/advancePaymentRequest/addedit/' + encrypted);
  }
  const handleClickEdit = (advancePaymentRequestID) => {
    encrypted = btoa(advancePaymentRequestID.toString());
    navigate('/app/advancePaymentRequest/addedit/' + encrypted);
  }
  const handleClickIssue = (rowData) => {
    setAdvancePaymentRequestID(rowData.advancePaymentRequestID);
    setRequestedAmount(rowData.requestedAmount);
    setRegistrationNumber(rowData.registrationNumber);
    setEnableConfirmMessage(true);
    setApprovedAmount(rowData.approvedAmount);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isIssueEnabled: false
  });

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getfactoriesForDropDown());
  }, [approveList.groupID]);

  useEffect(() => {
    trackPromise(getRoutesForDropDown())
  }, [approveList.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWOVERADVANCEPAYMENTREQUEST');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    var isIssueEnabled = permissions.find(p => p.permissionCode == 'OVERADVANCEPAYMENTREQUESTISSUEENABLE');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isIssueEnabled: isIssueEnabled !== undefined
    });

    setApproveList({
      ...approveList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });

  }

  async function getRoutesForDropDown() {
    const routeList = await services.getRoutesForDropDown(approveList.factoryID);
    setRoutes(routeList);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(approveList.groupID);
    setFactories(factory);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  function clearData() {
    setApproveList({
      ...approveList,
      routeID: '0',
      registrationNumber: '',
      date: null
    });
    setAdvancePaymentRequestData([]);
    setIsViewTable(true);
  }

  async function handleSearch() {
    const advanceList = await services.getOverAdvanceDetailsByRouteIDCustomerIDdate(approveList.registrationNumber, approveList.routeID, approveList.factoryID, approveList.date);
    if (advanceList.length > 0) {
      setAdvancePaymentRequestData(advanceList);
      setIsViewTable(false);
    }
    else {
      alert.error("No record to display");
      setIsViewTable(true);
    }

  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setApproveList({
      ...approveList,
      [e.target.name]: value
    });
    setAdvancePaymentRequestData([]);
  }

  function handleDateChange(value) {
    setApproveList({
      ...approveList,
      date: value
    });
    setAdvancePaymentRequestData([]);
  }

  async function issueAdvancePayment(requestID) {

    let approveModel = {
      advancePaymentRequestID: requestID.toString()
    }
    let response = await services.ApproveAdvancePayment(approveModel);

    if (response.statusCode == "Success") {

      alert.success("Successfully Issued");

      // //Print Function
      // let printModel = {
      //   invoiceReceiptContent: JSON.stringify(approveModel),
      //   isInvoiceReceiptPrint: true,
      //   invoiceReceiptType: 0,
      //   createdBy: 1
      // }

      // let printResponse = await services.savePrintReceipt(printModel);

      // if (printResponse.statusCode == "Success") {
      //   alert.success("Successfully sent to print");
      // }
      // else {
      //   alert.error("Print Error");
      // }

      const advanceList = await services.getOverAdvanceDetailsByRouteIDCustomerIDdate(approveList.registrationNumber, approveList.routeID, approveList.factoryID, approveList.date);
      setAdvancePaymentRequestData(advanceList);
      setIsViewTable(false);

    }
    else {
      alert.error("Error when issuing");
    }
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
            isEdit={true}
            toolTiptitle={"Add Over Advance"}
          />
        </Grid>
      </Grid>
    )
  }

  function confirmData(y) {
    if (y) {
      trackPromise(issueAdvancePayment(advancePaymentRequestID))
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Over Advance">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: approveList.groupID,
              factoryID: approveList.factoryID,
              date: approveList.date,
              registrationNumber: approveList.registrationNumber
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Select a Group'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Select a Factory'),
                registrationNumber: Yup.string().matches(/^(?! )[a-zA-Z0-9]{0,15}$/, 'Please enter valid registration number'),
                date: Yup.date().typeError('Invalid date').nullable()
              })
            }
            onSubmit={() => trackPromise(handleSearch())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle(title)}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent style={{ marginBottom: "2rem" }}>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group  *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              size="small"
                              onChange={(e) => handleChange(e)}
                              value={approveList.groupID}
                              variant="outlined"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              size="small"
                              onChange={(e) => handleChange(e)}
                              value={approveList.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="routeID">
                              Route
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="routeID"
                              size="small"
                              onChange={(e) => handleChange(e)}
                              value={approveList.routeID}
                              variant="outlined"
                              id="routeID"
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routes)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Customer Reg No
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                              fullWidth
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              name="registrationNumber"
                              size="small"
                              onChange={(e) => handleChange(e)}
                              value={approveList.registrationNumber}
                              variant="outlined"
                              id="registrationNumber"
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date">
                              Date
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.date && errors.date)}
                                helperText={touched.date && errors.date}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="date"
                                name="date"
                                value={approveList.date}
                                onChange={(e) => handleDateChange(e)}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Search
                          </Button>
                          <div>&nbsp;</div>
                          <Button
                            color="primary"
                            type="reset"
                            variant="outlined"
                            onClick={() => clearData()}
                          >
                            Clear
                          </Button>
                        </Box>
                        <Grid item hidden={isViewTable} md={12} xs={12}>
                          {advancePaymentRequestData.length > 0 ?
                            <MaterialTable
                              title="Multiple Actions Preview"
                              columns={[
                                { title: 'Registration Number', field: 'registrationNumber' },
                                { title: 'Customer Name', field: 'firstName' },
                                { title: 'Requested Amount', field: 'requestedAmount' },
                                { title: 'Approved Amount', field: 'approvedAmount' },
                                {
                                  title: 'Status', field: 'statusID',
                                  lookup: {
                                    1: 'Pending',
                                    2: 'Issue',
                                    3: 'Reject',
                                    4: 'Send To Deliver',
                                    5: 'Authorized',
                                    6: 'Delivered'
                                  },
                                },
                                {
                                  title: "Edit",
                                  render: (rowData) => {
                                    const button = (
                                      <IconButton onClick={() => { handleClickEdit(rowData.advancePaymentRequestID); }} >
                                        <EditIcon />
                                      </IconButton>

                                    );
                                    return rowData.statusID != 3 ? button : null
                                  }
                                },

                                {
                                  title: "Issue",
                                  hidden: !permissionList.isIssueEnabled,
                                  render: (rowData) => {
                                    const issueButton = (
                                      <IconButton onClick={() => { handleClickIssue(rowData); }} >
                                        <CheckIcon />
                                      </IconButton>

                                    );
                                    return rowData.statusID == 5 ? issueButton : null
                                  }
                                }
                              ]}
                              data={advancePaymentRequestData}
                              options={{
                                exportButton: false,
                                showTitle: false,
                                headerStyle: { textAlign: "left", height: '1%' },
                                cellStyle: { textAlign: "left" },
                                columnResizable: false,
                                actionsColumnIndex: -1
                              }}
                            /> : null}
                        </Grid>
                      </CardContent>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
        <div hidden={true}>
          <Grid item>
            <AlertDialog confirmData={confirmData} headerMessage={message} viewPopup={EnableConfirmMessage}
              discription={"Are you sure want to issue " + approvedAmount + " of amount for " + registrationNumber + " registration number ?"}
              setViewPopup={setEnableConfirmMessage} />
          </Grid>
        </div>
      </Page>
    </Fragment>
  );
};


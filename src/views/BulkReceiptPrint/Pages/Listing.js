import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent,
  Divider, InputLabel, CardHeader, MenuItem, Table, Checkbox
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import MaterialTable from "material-table";
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { endOfMonth } from 'date-fns';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePdf';

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
  colorRecord: {
    backgroundColor: "green",
  },

}));

const screenCode = 'BULKRECEIPTPRINT';

export default function BulkReceiptPrint(props) {
  const [title, setTitle] = useState("Bulk Receipt Print - Bank & Cheque");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routes, setRoutes] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customerDetail, setCustomerDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    year: '',
    month: '',
    payMode: 0

  });
  const [customerData, setCustomerData] = useState([]);
  const [customerDetailsPrint, setCustomerDetailsPrint] = useState([]);
  const [creditDetailsList, setCreditDetailsList] = useState([]);
  const [debitDetailsList, setDebitDetailsList] = useState([]);
  const [BalanceBoardForward, setBalanceBoardForward] = useState(0);
  const [DueAmountCF, setDueAmountCF] = useState(0);
  const [BalancePaymant, setBalancePaymant] = useState(0);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const [maxDate, setMaxDate] = useState(new Date());
  const componentRef = useRef();

  useEffect(() => {
    setSelectedDate(null);
    trackPromise(
      getPermission()
    );
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    setSelectedDate(null);
    getFactoriesForDropdown();
  }, [customerDetail.groupID]);

  useEffect(() => {
    setSelectedDate(null);
    trackPromise(
      getRoutesByFactoryID()
    )
  }, [customerDetail.factoryID]);

  useEffect(() => {
    checkISBalancePaymentCompleted();
  }, [customerDetail.groupID, customerDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWBULKRECEIPTPRINT');



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

    setCustomerDetail({
      ...customerDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(customerDetail.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(customerDetail.factoryID);
    setRoutes(routeList);
  }

  async function checkISBalancePaymentCompleted() {

    const response = await services.checkISBalancePaymentCompleted(customerDetail.groupID, customerDetail.factoryID);
    const bDate = moment(response.data.lastBalancePaymentSchedule, moment.defaultFormat).toDate();
    var result = endOfMonth(bDate);
    setMaxDate(result);
  }

  async function getCustomerDetails() {
    let model = {
      groupID: parseInt(customerDetail.groupID),
      factoryID: parseInt(customerDetail.factoryID),
      routeID: parseInt(customerDetail.routeID),
      applicableMonth: customerDetail.month,
      applicableYear: customerDetail.year,
      paymentTypeID: parseInt(customerDetail.payMode)
    }
    
    const response = await services.getCustomerDetailsForBulkPrint(model);
    if (response.statusCode == "Success" && response.data != null) {
      setCustomerData(response.data);
      if (response.data.length == 0) {
        alert.error("No records to display");
      }
      trackPromise(GetDetails(response.data));
    }
    else {
      alert.error("Error");
    }
  }
  async function GetDetails(data) {
    let creditDetailsList = [];
    let debitDetailsList = [];

    let customerBId = data.map(a => ({ "customerBalancePaymentID": a.customerBalancePaymentID }))
    let model = {
      customerBalancePaymentIDModel: customerBId,
    }
    const customerDetails = await services.getCustomerBalancePaymentDetailsByPaymantID(model);
    setCustomerDetailsPrint(customerDetails);
    
    customerDetails.customerDeductionDetails.forEach(element => {
      element.entryType === 1 ?
        creditDetailsList.push(element) :
        debitDetailsList.push(element)
    });
    setCreditDetailsList(creditDetailsList);
    setDebitDetailsList(debitDetailsList);
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setCustomerDetail({
      ...customerDetail,
      [e.target.name]: value
    });
    setCustomerData([]);
  }

  function handleDateChange(date) {

    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    var currentmonth = moment().format('MM');

    setCustomerDetail({
      ...customerDetail,
      month: month.toString(),
      year: year.toString()
    });

    if (selectedDate != null) {

      var prevMonth = selectedDate.getUTCMonth() + 1
      var prevyear = selectedDate.getUTCFullYear();

      if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
        setSelectedDate(date)

      }
    } else {
      setSelectedDate(date)
    }
  }


  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: customerDetail.groupID,
              factoryID: customerDetail.factoryID,
              payMode: customerDetail.payMode,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                payMode: Yup.number().required('Pay mode is required').min("1", 'Pay mode is required'),
              })
            }
            onSubmit={() => getCustomerDetails()}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle(title)}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="groupID">
                              Group *
                              </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={customerDetail.groupID}
                              variant="outlined"
                              
                              size='small'
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                                </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={customerDetail.factoryID}
                              size='small'
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="inline"
                                openTo="month"
                                views={["year", "month"]}
                                label="Year and Month *"
                                helperText="Select applicable month"
                                size='small'
                                value={selectedDate}
                                maxDate={maxDate}
                                disableFuture={true}
                                onChange={(date) => handleDateChange(date)}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="routeID">
                              Route
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="routeID"
                              onChange={(e) => handleChange(e)}
                              value={customerDetail.routeID}
                              variant="outlined"
                              id="routeID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routes)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="payMode">
                              Pay Mode *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.payMode && errors.payMode)}
                              fullWidth
                              helperText={touched.payMode && errors.payMode}
                              name="payMode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={customerDetail.payMode}
                              variant="outlined"
                              id="payMode"
                            >
                              <MenuItem value={'0'} disabled={true}>
                                --Select PayMode--
                                                            </MenuItem>
                              <MenuItem value={'1'}>Bank</MenuItem>
                              <MenuItem value={'2'}>Cheque</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            size='small'
                          >
                            Search
                              </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {customerData.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Route Name', field: 'routeName' },
                              { title: 'Reg No', field: 'registrationNumber' },
                              { title: 'Supplier Name', field: 'customerName' },
                              { title: 'Amount (Rs)', field: 'amount' },
                            ]}
                            data={customerData}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 10
                            }}

                            actions={[

                            ]}
                          /> : null}
                      </Box>
                      {customerData.length > 0 ?
                      <Box display="flex" justifyContent="flex-end" p={2}>
                          <ReactToPrint
                            documentTitle={"Receipt"}
                            trigger={() =>
                              <Button
                                color="primary"
                                type="submit"
                                variant="contained"
                                size="small"
                                style={{ marginRight: '0.5rem' }}
                               
                              >
                                Print
                                                                                </Button>
                            }
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF ref={componentRef} data={customerDetailsPrint} debitDetailsList={debitDetailsList} BalancePaymant={BalancePaymant}
                              creditDetailsList={creditDetailsList} BalanceBoardForward={BalanceBoardForward} DueAmountCF={DueAmountCF}
                            />
                          </div>
                        </Box> : null}
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
}

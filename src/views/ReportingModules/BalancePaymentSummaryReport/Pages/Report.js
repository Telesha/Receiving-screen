import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import Typography from '@material-ui/core/Typography';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import Chip from '@material-ui/core/Chip';
import { red, blue } from '@material-ui/core/colors';
import MaterialTable, { MTableBody, MTableHeader } from "material-table";
import xlsx from 'json-as-xlsx';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  cardroot: {
    minWidth: 275,
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
  card: {
    flexGrow: 10,
    backgroundColor: "#ffffff",
    paddingInlineStart: '10px',
    borderRadius: '10px',
  },
  avatar: {
    backgroundColor: red[500],
  },
  blue: {
    backgroundColor: blue[500],
  },
  succes: {
    backgroundColor: "#e8f5e9"
  },
  failed: {
    backgroundColor: "#fce4ec"
  },
  mainButtons: {
    marginRight: '0.5rem'
  },
  bold: {
    fontWeight: 600
  }
}));

const screenCode = 'BALANCEPAYMENTSUMMARYREPORT';

export default function BalancePaymentSummaryReport() {
  const [title, setTitle] = useState("Balance Payment Summary");
  const classes = useStyles();
  const today = new Date();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [balance, setBalance] = useState();
  const [selectedDate, setSelectedDate] = useState();
  const [selectedDatePDF, setSelectedDatePDF] = useState();
  const [balancePayment, setBalancePayment] = useState({
    balancePaymentSummaries: [],
    noOfActiveAccounts: 0
  });
  const [collectionTypeRate, setCollectionTypeRate] = useState({
    groupID: 0,
    factoryID: 0,
    year: '',
    month: ''
  });
  const [allPayments, setAllPayments] = useState([]);
  const navigate = useNavigate();
  const alert = useAlert();

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isBalanceRateChangeEnabled: false,
  });
  const [LedgerCsvHeaders, SetledgerCsvHeaders] = useState([])
  const [RouteWiseCsvHeaders, SetrouteWiseCsvHeaders] = useState([])

  useEffect(() => {
    setSelectedDate();
    getPermissions();
    trackPromise(
      getGroupsForDropdown()
    );

  }, []);

  useEffect(() => {
    setSelectedDate();
    getFactoriesForDropdown();
  }, [collectionTypeRate.groupID]);

  useEffect(() => {
    setSelectedDate();
  }, [collectionTypeRate.factoryID]);

  useEffect(() => {
    if (collectionTypeRate.factoryID > 0 && collectionTypeRate.groupID > 0) {
      trackPromise(GetBalancePaymentYearMonthForDropDown());
    }
  }, [collectionTypeRate.factoryID, collectionTypeRate.groupID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWBALANCEPAYMENTSUMMARYREPORT');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isBalanceRateChangeEnabled = permissions.find(p => p.permissionCode === 'BALANCERATEPERMISSION');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isBalanceRateChangeEnabled: isBalanceRateChangeEnabled !== undefined
    });

    setCollectionTypeRate({
      ...collectionTypeRate,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(collectionTypeRate.groupID);
    setFactories(factories);
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
      }
    }
    return items
  }

  async function generateSummaryReport() {
    trackPromise(GetSummary())
  }

  async function GetBalancePaymentYearMonthForDropDown() {
    var response = await services.GetBalancePaymentYearMonth(collectionTypeRate.groupID, collectionTypeRate.factoryID);

    const applicableYear = parseInt(response.applicableYear);
    const applicableMonth = parseInt(response.applicableMonth) - 1;

    const selectedDate = new Date(applicableYear, applicableMonth);

    setSelectedDate(selectedDate);
    setSelectedDatePDF(response);
  };

  async function GetSummary() {
    const applicableYear = selectedDate.getFullYear().toString();
    const applicableMonth = (selectedDate.getMonth() + 1).toString();

    let model = {
      groupID: parseInt(collectionTypeRate.groupID),
      factoryID: parseInt(collectionTypeRate.factoryID),
      applicableMonth: applicableMonth,
      applicableYear: applicableYear
    }
    const balancePay = await services.GetBalancePaymentSummary(model);

    if (balancePay.statusCode == "Success" && balancePay.data != null) {
      setBalancePayment(balancePay.data);
      setBalance(true)
    }
    else {
      alert.error("Error");
      setBalance(false)
    }
  }

  async function downloadBalancePaymentLedger() {
    trackPromise(GetBalancePaymentLedger())
  }

  async function GetBalancePaymentLedger() {
    const applicableYear = selectedDate.getFullYear().toString();
    const applicableMonth = (selectedDate.getMonth() + 1).toString();
    let model = {
      groupID: parseInt(collectionTypeRate.groupID),
      factoryID: parseInt(collectionTypeRate.factoryID),
      applicableMonth: applicableMonth,
      applicableYear: applicableYear
    }

    const balancePay = await services.GetBalancePaymentDetailedData(model);

    if (balancePay.statusCode == "Success" && balancePay.data != null) {

      createBalancePaymentLedgerxlx(balancePay.data);
      alert.success("Success");

    }
    else {
      alert.error("Error");
    }
  }

  async function GetAllPaymentDetailedData() {
    const applicableYear = selectedDate.getFullYear().toString();
    const applicableMonth = (selectedDate.getMonth() + 1).toString();
    let model = {
      groupID: parseInt(collectionTypeRate.groupID),
      factoryID: parseInt(collectionTypeRate.factoryID),
      applicableMonth: applicableMonth,
      applicableYear: applicableYear
    }

    const balancePay = await services.GetAllPaymentDetailedData(model);
    setAllPayments(balancePay.data);

    if (balancePay.statusCode == "Success" && balancePay.data != null) {
      createAllPaymentDetailsxlx(balancePay.data);
      alert.success("Success");

    }
    else {
      alert.error("Error");
    }
  }

  async function GetBalancePaymentEstimatedLedger() {
    const applicableYear = selectedDate.getFullYear().toString();
    const applicableMonth = (selectedDate.getMonth() + 1).toString();
    let model = {
      groupID: parseInt(collectionTypeRate.groupID),
      factoryID: parseInt(collectionTypeRate.factoryID),
      applicableMonth: applicableMonth,
      applicableYear: applicableYear
    }

    const balancePay = await services.GetBalancePaymentEstimatedLedger(model);

    if (balancePay.statusCode == "Success" && balancePay.data != null) {
      let updatedList = await ReCalculateBalancePaymentAmount(balancePay.data)
      createBalancePaymentEstimatedLedgerxlx(updatedList);
      alert.success("Success");
    }
    else {
      alert.error("Error");
    }
  }


  async function ReCalculateBalancePaymentAmount(balancepaymentDataList) {
    balancepaymentDataList.forEach(element => {


      var tempModel = {
        "Balance Payment": element["Balance Payment"],
        "Balance Brought Forward": element["Balance Brought Forward"]
      };

      delete element["Balance Payment"];
      delete element["Balance Brought Forward"];

      element = Object.assign(element, tempModel)

      element["Balance Payment"] = 0;
      element["Balance Brought Forward"] = 0;

      let balancePaymentAmount = (
        element["GrossPay"] === null || NaN ? 0 : element["GrossPay"]
          + element["Addition"] === null || NaN ? 0 : element["Addition"]
            + element["Balance Payment Forward"] === null || NaN ? 0 : element["Balance Payment Forward"]
      ) - (
          element["Advance Payment"] === null || NaN ? 0 : element["Advance Payment"]
            + element["Advance Payment Bank"] === null || NaN ? 0 : element["Advance Payment Bank"]
              + element["Advance Payment Cheque"] === null || NaN ? 0 : element["Advance Payment Cheque"]
                + element["Deduction"] === null || NaN ? 0 : element["Deduction"]
                  + element["Factory Item"] === null || NaN ? 0 : element["Factory Item"]
                    + element["Transport Rate"] === null || NaN ? 0 : element["Transport Rate"]
                      + element["Balance Carry Forward"] === null || NaN ? 0 : element["Balance Carry Forward"]
        )

      element["Balance Payment"] = balancePaymentAmount >= 0 ? balancePaymentAmount : 0
      element["Balance Brought Forward"] = balancePaymentAmount < 0 ? balancePaymentAmount : 0
    });
    return balancepaymentDataList
  }

  async function downloadRoutewiseBalancepayment() {
    trackPromise(GetRoutewiseBalancepayment())
  }

  async function GetRoutewiseBalancepayment() {
    const applicableYear = selectedDate.getFullYear().toString();
    const applicableMonth = (selectedDate.getMonth() + 1).toString();
    let model = {
      groupID: parseInt(collectionTypeRate.groupID),
      factoryID: parseInt(collectionTypeRate.factoryID),
      applicableMonth: applicableMonth,
      applicableYear: applicableYear
    }

    const balancePay = await services.GetRoutewiseBalancepayment(model);
    if (balancePay.statusCode == "Success" && balancePay.data != null) {
      createRouteuWiseBalancePaymentxlx(balancePay.data);
      alert.success("Success");

    }
    else {
      alert.error("Error");
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setCollectionTypeRate({
      ...collectionTypeRate,
      [e.target.name]: value
    });

  }

  const defaultDate = new Date();
  defaultDate.setMonth(defaultDate.getMonth() - 1);

  const thisYearPrevMonth = new Date();
  thisYearPrevMonth.setMonth(thisYearPrevMonth.getMonth() - 1);
  thisYearPrevMonth.setFullYear(thisYearPrevMonth.getFullYear());

  function handleDateChange(date) {
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();

    setCollectionTypeRate({
      ...collectionTypeRate,
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
  };

  if (!selectedDate) {
    setSelectedDate(thisYearPrevMonth);
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

  function createAllPaymentDetailsxlx(data) {
    var settings = {
      sheetName: 'All Balance Payment Details',
      fileName: 'All Balance Payment Details',
      writeOptions: {}
    }

    let keys = Object.keys(data[0])
    let tempcsvHeaders = LedgerCsvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let total = [];
    data.forEach(x => {
      for (var property in x) {
        if (property != "RouteName" && property != "RegistrationNumber" && property != "Name") {
          total.push({ name: property, value: x[property] })
        }
      }
    })

    data.forEach(x => {
      for (var property in x) {
        if (property != "RouteName" && property != "RegistrationNumber" && property != "Name") {
          x[property] = x[property] == null ? '0.00' : x[property].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
      }
    })

    const res = Array.from(total.reduce(
      (m, { name, value }) => m.set(name, value != null ? parseFloat(m.get(name) || 0) + parseFloat(value) : parseFloat(m.get(name) || 0) + parseFloat(0)), new Map
    ), ([name, value]) => ({ name, value }));

    data.push({});
    let newRes = [];
    newRes['RouteName'] = 'Total'
    res.forEach(x => {
      newRes[x.name] = x.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
    data.push(newRes)

    data.push({});

    let gr = [];
    let fr = [];
    let mr = [];
    gr['RouteName'] = 'Group: ' + groups[collectionTypeRate.groupID]
    data.push(gr);
    fr['RouteName'] = 'Factory: ' + factories[collectionTypeRate.factoryID]
    data.push(fr);
    mr['RouteName'] = 'Month: ' + selectedDatePDF.applicableMonth + ' , ' + 'Year: ' + selectedDatePDF.applicableYear
    data.push(mr);

    let mergedData = [
      {
        sheet: 'All Balance Payment Details',
        columns: tempcsvHeaders,
        content: data
      }
    ]

    xlsx(mergedData, settings);
  }

  function createBalancePaymentLedgerxlx(data) {
    var settings = {
      sheetName: 'Balance Payment Ledger',
      fileName: 'Balance Payment Ledger',
      writeOptions: {}
    }

    let keys = Object.keys(data[0])
    let tempcsvHeaders = LedgerCsvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let total = [];
    data.forEach(x => {
      for (var property in x) {
        if (property != "RouteName" && property != "RegistrationNumber" && property != "Name") {
          total.push({ name: property, value: x[property] })
        }
      }
    })

    data.forEach(x => {
      for (var property in x) {
        if (property != "RouteName" && property != "RegistrationNumber" && property != "Name") {
          x[property] = x[property] == null ? '0.00' : x[property].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
      }
    })

    const res = Array.from(total.reduce(
      (m, { name, value }) => m.set(name, value != null ? parseFloat(m.get(name) || 0) + parseFloat(value) : parseFloat(m.get(name) || 0) + parseFloat(0)), new Map
    ), ([name, value]) => ({ name, value }));

    data.push({});
    let newRes = [];
    newRes['RouteName'] = 'Total'
    res.forEach(x => {
      newRes[x.name] = x.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
    data.push(newRes)

    data.push({});

    let gr = [];
    let fr = [];
    let mr = [];
    gr['RouteName'] = 'Group: ' + groups[collectionTypeRate.groupID]
    data.push(gr);
    fr['RouteName'] = 'Factory: ' + factories[collectionTypeRate.factoryID]
    data.push(fr);
    mr['RouteName'] = 'Month: ' + selectedDatePDF.applicableMonth + ' , ' + 'Year: ' + selectedDatePDF.applicableYear
    data.push(mr);

    let mergedData = [
      {
        sheet: 'Balance Payment Ledger',
        columns: tempcsvHeaders,
        content: data
      }
    ]

    xlsx(mergedData, settings);
  }

  function createBalancePaymentEstimatedLedgerxlx(data) {
    var settings = {
      sheetName: 'Balance Payment Estimated Ledger',
      fileName: 'Balance Payment Estimated Ledger',
      writeOptions: {}
    }

    let keys = Object.keys(data[0])
    let tempcsvHeaders = LedgerCsvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let total = [];
    data.forEach(x => {
      for (var property in x) {
        if (property != "RouteName" && property != "RegistrationNumber" && property != "Name") {
          total.push({ name: property, value: x[property] })
        }
      }
    })

    data.forEach(x => {
      for (var property in x) {
        if (property != "RouteName" && property != "RegistrationNumber" && property != "Name") {
          x[property] = x[property] == null ? '0.00' : x[property].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
      }
    })

    const res = Array.from(total.reduce(
      (m, { name, value }) => m.set(name, value != null ? parseFloat(m.get(name) || 0) + parseFloat(value) : parseFloat(m.get(name) || 0) + parseFloat(0)), new Map
    ), ([name, value]) => ({ name, value }));

    data.push({});

    let newRes = [];
    newRes['RouteName'] = 'Total'
    res.forEach(x => {
      newRes[x.name] = x.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
    data.push(newRes)

    data.push({});

    let gr = [];
    let fr = [];
    let mr = [];
    gr['RouteName'] = 'Group: ' + groups[collectionTypeRate.groupID]
    data.push(gr);
    fr['RouteName'] = 'Factory: ' + factories[collectionTypeRate.factoryID]
    data.push(fr);
    mr['RouteName'] = 'Month: ' + selectedDatePDF.applicableMonth + ' , ' + 'Year: ' + selectedDatePDF.applicableYear
    data.push(mr);

    let mergedData = [
      {
        sheet: 'Balance Payment Ledger',
        columns: tempcsvHeaders,
        content: data
      }
    ]

    xlsx(mergedData, settings);
  }

  function createRouteuWiseBalancePaymentxlx(data) {
    var settings = {
      sheetName: 'Route wise Balance Payment',
      fileName: 'Route wise Balance Payment',
      writeOptions: {}
    }

    let keys = Object.keys(data[0])
    let tempcsvHeaders = RouteWiseCsvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    var total = [];
    data.forEach(x => {
      for (var property in x) {
        if (property !== "RouteName") {
          total.push({ name: property, value: x[property] });
        }
      }
    });

    data.forEach(x => {
      for (var property in x) {
        if (property != "RouteName") {
          x[property] = x[property] == null ? '0.00' : x[property].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
      }
    })

    const res = Array.from(total.reduce(
      (m, { name, value }) => m.set(name, value != null ? parseFloat(m.get(name) || 0) + parseFloat(value) : parseFloat(m.get(name) || 0) + parseFloat(0)), new Map
    ), ([name, value]) => ({ name, value }));

    data.push({});
    let newRes = [];
    newRes['RouteName'] = 'Total'
    res.forEach(x => {
      newRes[x.name] = x.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
    data.push(newRes)

    data.push({});

    let gr = [];
    let fr = [];
    let mr = [];
    gr['RouteName'] = 'Group: ' + groups[collectionTypeRate.groupID]
    data.push(gr);
    fr['RouteName'] = 'Factory: ' + factories[collectionTypeRate.factoryID]
    data.push(fr);
    mr['RouteName'] = 'Month: ' + selectedDatePDF.applicableMonth + ' , ' + 'Year: ' + selectedDatePDF.applicableYear
    data.push(mr);

    let mergedData = [
      {
        sheet: 'Route wise Balance Payment',
        columns: tempcsvHeaders,
        content: data
      }
    ]

    xlsx(mergedData, settings);
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: collectionTypeRate.groupID,
              factoryID: collectionTypeRate.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
              })
            }
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
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={collectionTypeRate.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}

                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={collectionTypeRate.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}

                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="outlined"
                                openTo="month"
                                views={["year", "month"]}
                                label="Year and Month"
                                helperText="Select applicable month"
                                value={selectedDate}
                                disableFuture={true}
                                onChange={(date) => handleDateChange(date)}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>

                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            variant="contained"
                            type="button"
                            onClick={() => generateSummaryReport()}
                            className={classes.mainButtons}
                          >
                            View Summary
                          </Button>
                          <Button
                            color="primary"
                            variant="contained"
                            type="button"
                            onClick={() => downloadRoutewiseBalancepayment()}
                            className={classes.mainButtons}
                          >
                            Route wise Balance payment
                          </Button>

                          <Button
                            color="primary"
                            variant="contained"
                            type="button"
                            onClick={() => downloadBalancePaymentLedger()}
                            className={classes.mainButtons}
                          >
                            Balance Payment Details
                          </Button>

                          <Button
                            color="primary"
                            variant="contained"
                            type="button"
                            onClick={() => trackPromise(GetBalancePaymentEstimatedLedger())}
                            className={classes.mainButtons}
                          >
                            Balance Payment Estimation
                          </Button>

                          <Button
                            color="primary"
                            variant="contained"
                            type="button"
                            onClick={() => trackPromise(GetAllPaymentDetailedData())}
                            className={classes.mainButtons}
                          >
                            All Payment Details
                          </Button>
                        </Box>

                        <br />

                      </CardContent>
                      {balance ?
                        <Grid >
                          <Card className={classes.cardroot}>
                            <CardContent>
                              <Box>
                                <MaterialTable
                                  title="Multiple Actions Preview"
                                  columns={[
                                    { title: 'Transaction Type', field: 'transactionTypeName' },
                                    {
                                      title: 'Debit (LKR)', field: 'total',
                                      render: rowData => rowData.entryType == 2 ? rowData.total.toFixed(2) : "--"
                                    },  // hide if a credit entry
                                    {
                                      title: 'Credit (LKR)', field: 'total',
                                      render: rowData => rowData.entryType == 1 ? rowData.total.toFixed(2) : "--"
                                    },
                                  ]}
                                  data={balancePayment.balancePaymentSummaries}
                                  options={{
                                    exportButton: false,
                                    showTitle: false,
                                    headerStyle: { textAlign: "center", height: '1%' },
                                    cellStyle: { textAlign: "center" },
                                    columnResizable: false,
                                    actionsColumnIndex: -1,
                                    search: false,
                                    paging: false
                                  }}
                                  components={{
                                    Body: props => {
                                      return (
                                        <div>
                                          <MTableBody {...props} />
                                          <Box display="flex" justifyContent="flex-end" p={1}>
                                            <Grid container justify="center" item md={4} xs={12} >
                                              <Typography className={classes.bold}>
                                                Total
                                              </Typography>
                                            </Grid>
                                            <Grid container justify="center" item md={4} xs={12}>
                                              <Typography className={classes.bold}>
                                                {balancePayment.balancePaymentSummaries.filter(({ entryType }) => entryType === 2)
                                                  .reduce((totalDebit, item) => totalDebit + item.total, 0).toFixed(2)}
                                              </Typography>
                                            </Grid>
                                            <Grid container justify="center" item md={4} xs={12}>
                                              <Typography className={classes.bold}>
                                                {balancePayment.balancePaymentSummaries.filter(({ entryType }) => entryType === 1)
                                                  .reduce((totalCredit, item) => totalCredit + item.total, 0).toFixed(2)}
                                              </Typography>
                                            </Grid>
                                          </Box>
                                        </div>

                                      )
                                    }
                                    ,
                                    Header: props => (
                                      <div>
                                        <MTableHeader {...props} />
                                      </div>
                                    )
                                  }}
                                />
                                <br />
                                <Grid container align="center" justify="center" alignItems="center">
                                  <Grid item xs={4} spacing={2}>
                                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                                      <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 " }} alignContent="center"
                                        icon={<PeopleAltIcon />}
                                        label={"Number Of Active Accounts : " + balancePayment.noOfActiveAccounts}
                                        color="primary"
                                      />
                                    </Typography>
                                  </Grid>
                                </Grid>
                                <br />

                              </Box>
                              <br />

                            </CardContent>

                          </Card>

                        </Grid> :
                        null
                      }
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

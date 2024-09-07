import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  Table
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import MaterialTable from "material-table";
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import {
  endOfMonth,
} from 'date-fns';
import { useAlert } from 'react-alert';


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

const screenCode = 'CHEQUECUSTOMERREPORT';

export default function ChequeCustomerReport(props) {
  const today = new Date();
  const [balancePaymentYearMonth, setBalancePaymentYearMonth] = useState();
  const [title, setTitle] = useState("Cheque Customer Report");
  const classes = useStyles();
  const [chequeCustomerDetail, setChequeCustomerDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    year: '',
    month: ''
  });
  const [FactoryList, setFactoryList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [routes, setRoutes] = useState();
  const [selectedDate, setSelectedDate] = useState();
  const [selectedDatePDF, setSelectedDatePDF] = useState();
  const [chequeCustomerData, setChequeCustomerData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();

  const [csvHeaders, SetCsvHeaders] = useState([])
  const [csvData, setCsvData] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    factoryName: "0",
    monthName: '',
    year: '',
    monthName: ''

  })
  const componentRef = useRef();
  const [totalAmount, setTotalAmount] = useState(0);
  const [maxDate, setMaxDate] = useState(new Date());
  const [searchStarted, setSearchStarted] = useState(false);
  const alert = useAlert();


  useEffect(() => {
    trackPromise(
      getPermission()
    );
    trackPromise(
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    getFactoriesForDropdown();
  }, [chequeCustomerDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID()
    )
  }, [chequeCustomerDetail.factoryID]);

  useEffect(() => {
    trackPromise(
      checkISBalancePaymentCompleted()
    )
  }, [chequeCustomerDetail.groupID, chequeCustomerDetail.factoryID]);

  useEffect(() => {
    if (chequeCustomerDetail.factoryID > 0 && chequeCustomerDetail.groupID > 0) {
      trackPromise(GetBalancePaymentYearMonthForDropDown());
    }
  }, [chequeCustomerDetail.factoryID, chequeCustomerDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCHEQUECUSTOMERREPORT');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
    });

    setChequeCustomerDetail({
      ...chequeCustomerDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(chequeCustomerDetail.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(chequeCustomerDetail.factoryID);
    setRoutes(routeList);
  }

  async function checkISBalancePaymentCompleted() {

    const response = await services.CheckISBalancePaymentCompleted(chequeCustomerDetail.groupID, chequeCustomerDetail.factoryID);
    const bDate = moment(response.data.lastBalancePaymentSchedule, moment.defaultFormat).toDate();
    var result = endOfMonth(bDate);

    setMaxDate(result);
  }

  async function GetBalancePaymentYearMonthForDropDown() {
    var response = await services.GetBalancePaymentYearMonth(chequeCustomerDetail.groupID, chequeCustomerDetail.factoryID);
    const applicableYear = parseInt(response.applicableYear);
    const applicableMonth = parseInt(response.applicableMonth) - 1;

    const selectedDate = new Date(applicableYear, applicableMonth);

    setSelectedDate(selectedDate);
    setSelectedDatePDF(response);
  };

  async function GetDetails() {
    let total = 0;

    const applicableYear = selectedDate.getFullYear().toString();
    const applicableMonth = (selectedDate.getMonth() + 1).toString();

    let model = {
      groupID: parseInt(chequeCustomerDetail.groupID),
      factoryID: parseInt(chequeCustomerDetail.factoryID),
      routeID: parseInt(chequeCustomerDetail.routeID),
      applicableMonth: applicableMonth,
      applicableYear: applicableYear
    }

    getSelectedDropdownValuesForReport(model);

    const customerData = await services.GetChequeCustomerDetails(model);

    if (customerData.statusCode == "Success" && customerData.data != null) {
      setChequeCustomerData(customerData.data);
      customerData.data.forEach(x => {
        total = total + parseFloat(x.amount)
      });
      if (customerData.data.length == 0) {
        alert.error("NO RECORDS TO DISPLAY");
      } else {
        alert.success("Success");
      }
      setTotalAmount(total.toFixed(2));
      createDataForExcel(customerData.data);
    }
    else {
      alert.error("Error");
    }
  }

  async function createDataForExcel(array) {
    var res = [];

    if (array != null) {
      array.map(x => {
        var vr = {
          'Route Name': x.routeName,
          'Reg No': x.registrationNumber,
          'Customer Name': x.name,
          'Amount (Rs)': x.amount.toFixed(2),
        }
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(chequeCustomerData);
    var settings = {
      sheetName: 'Cheque Customer Details Report',
      fileName: 'Cheque Customer Details Report - ' + selectedSearchValues.factoryName + ' - BOUGHT LEAF CHEQUE PAYMENT FOR THE MONTH OF ' + selectedSearchValues.monthName + ' - ' + chequeCustomerDetail.year,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Cheque Customer Details Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
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
    setChequeCustomerDetail({
      ...chequeCustomerDetail,
      [e.target.name]: value
    });
    setChequeCustomerData([]);
  }

  function handleDateChange(date) {
    let monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOMBER", "NOVEMBER", "DECEMBER"];
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    var currentmonth = moment().format('MM');
    let monthName = monthNames[month - 1];
    setSelectedSearchValues({
      ...selectedSearchValues,
      monthName: monthName
    })
    setChequeCustomerDetail({
      ...chequeCustomerDetail,
      month: month.toString(),
      year: year.toString()
    });

    if (selectedDate != null) {

      var prevMonth = selectedDate.getUTCMonth() + 1
      var prevyear = selectedDate.getUTCFullYear();

      if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
        setSelectedDate(date)
        setSearchStarted(true)
      }
    } else {
      setSelectedDate(date)
      setSearchStarted(true)
    }
    setChequeCustomerData([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: FactoryList[searchForm.factoryID],
      month: searchForm.month,
      year: searchForm.year
    })
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
              groupID: chequeCustomerDetail.groupID,
              factoryID: chequeCustomerDetail.factoryID
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
                              value={chequeCustomerDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'
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
                              value={chequeCustomerDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="routeID">
                              Route
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="routeID"
                              onChange={(e) => handleChange(e)}
                              value={chequeCustomerDetail.routeID}
                              variant="outlined"
                              id="routeID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routes)}
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
                                value={selectedDate}
                                maxDate={maxDate}
                                onChange={(date) => handleDateChange(date)}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Grid container justify="flex-end">
                          <Box pt={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type='submit'
                              onClick={() => trackPromise(GetDetails())}
                            >
                              Search
                            </Button>
                          </Box>
                        </Grid>
                      </CardContent>
                      <Box minWidth={1050}>
                        {chequeCustomerData.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Route Name', field: 'routeName' },
                              { title: 'Reg No', field: 'registrationNumber' },
                              { title: 'Customer Name', field: 'name' },
                              { title: 'Amount (Rs)', field: 'amount', render: rowData => rowData.amount.toFixed(2) },
                            ]}
                            data={chequeCustomerData}
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
                      {chequeCustomerData.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={createFile}
                            size='small'
                          >
                            EXCEL
                          </Button>
                          <ReactToPrint
                            documentTitle={"Cheque Customer Details Report"}
                            trigger={() => <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                              size='small'
                            >
                              PDF
                            </Button>}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF ref={componentRef}
                              searchData={selectedSearchValues} searchDate={chequeCustomerDetail} chequeCustomerData={chequeCustomerData}
                              total={totalAmount} selectedDatePDF={selectedDatePDF}
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

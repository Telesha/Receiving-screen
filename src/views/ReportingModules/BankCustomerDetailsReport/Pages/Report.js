import React, { useState, useEffect, useRef, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Button,
  makeStyles,
  Container,
  Divider,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from 'yup';
import {
  DatePicker,
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import MaterialTable from 'material-table';
import xlsx from 'json-as-xlsx';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import { endOfMonth } from 'date-fns';
import { LoadingComponent } from '../../../../utils/newLoader';
import { useAlert } from 'react-alert';
import CreateBankWiseCustomerPDF from './CreateBankWiseCustomerPDF';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  row: {
    marginTop: '1rem'
  },
  colorCancel: {
    backgroundColor: 'red'
  },
  colorRecordAndNew: {
    backgroundColor: '#FFBE00'
  },
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = 'BANKCUSTOMERDETAILSREPORT';

export default function BankCustomerDetailsReport(props) {
  const [title, setTitle] = useState('Bank Customer Report');
  const alert = useAlert();
  const classes = useStyles();
  const today = new Date();
  const [balancePaymentYearMonth, setBalancePaymentYearMonth] = useState();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [routes, setRoutes] = useState();
  const [banks, setBanks] = useState();
  const [branches, setBranches] = useState();
  const [branchList, setBranchList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [selectedDate, setSelectedDate] = useState();
  const [selectedDatePDF, setSelectedDatePDF] = useState();
  const [bankCustomerData, setBankCustomerData] = useState([]);
  const [bankCustomerList, setBankCustomerList] = useState({
    groupID: '0',
    factoryID: '0',
    routeID: '0',
    bankID: '0',
    branchID: '0',
    year: '',
    month: ''
  });

  const [selectedSearchValues, setSelectedSearchValues] = useState({
    factoryName: '0',
    monthName: '',
    year: '',
    monthName: ''
  });

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const [maxDate, setMaxDate] = useState(new Date());
  const [month, setMonth] = useState(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Augest', 'Septemnber', 'Octomber', 'November', 'December'])
  const navigate = useNavigate();
  const csvHeaders = [];

  const [csvData, setCsvData] = useState([]);
  const componentRef = useRef();
  const componentRef1 = useRef();
  const [totalAmount, setTotalAmount] = useState();
  const [alertCount, setAlertCount] = useState({
    count: 0
  });

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    if (bankCustomerList.factoryID > 0 && bankCustomerList.groupID > 0) {
      trackPromise(GetBalancePaymentYearMonthForDropDown());
    }
  }, [bankCustomerList.factoryID, bankCustomerList.groupID]);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [bankCustomerList.groupID]);

  useEffect(() => {
    trackPromise(getRoutesByFactoryID());
  }, [bankCustomerList.factoryID]);

  useEffect(() => {
    trackPromise(getBanksForDropdown());
  }, []);

  useEffect(() => {
    getBranchesForDropdown();
  }, [bankCustomerList.bankID]);

  useEffect(() => {
    trackPromise(checkISBalancePaymentCompleted());
  }, [bankCustomerList.groupID, bankCustomerList.factoryID]);

  useEffect(() => {
    setAlertCount({
      count: alertCount.count + 1
    });
  }, [bankCustomerList.year]);

  useEffect(() => {
  }, [bankCustomerList.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWBANKCUSTOMERDETAILSREPORT'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setBankCustomerList({
      ...bankCustomerList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(
      bankCustomerList.groupID
    );
    setFactories(factory);
  }

  async function getRoutesByFactoryID() {
    const route = await services.getRoutesForDropDown(
      bankCustomerList.factoryID
    );
    setRoutes(route);
  }

  async function getBanksForDropdown() {
    const bank = await services.getBanksForDropdown();
    setBankList(bank);
  }

  async function getBranchesForDropdown() {
    const branch = await services.getBranchesByBankID(
      parseInt(bankCustomerList.bankID)
    );
    setBranches(branch);
  }

  async function GetBalancePaymentYearMonthForDropDown() {
    var response = await services.GetBalancePaymentYearMonth(bankCustomerList.groupID, bankCustomerList.factoryID);

    const applicableYear = parseInt(response.applicableYear);
    const applicableMonth = parseInt(response.applicableMonth) - 1;

    const selectedDate = new Date(applicableYear, applicableMonth);

    setSelectedDate(selectedDate);
    setSelectedDatePDF(response);
  };



  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
  }

  function handleDateChange(date) {
    let monthNames = [
      'JANUARY',
      'FEBRUARY',
      'MARCH',
      'APRIL',
      'MAY',
      'JUNE',
      'JULY',
      'AUGUST',
      'SEPTEMBER',
      'OCTOBER',
      'NOVEMBER',
      'DECEMBER'
    ];
    var month = date.getUTCMonth() + 1;
    var year = date.getUTCFullYear();
    var currentmonth = moment().format('MM');
    let monthName = monthNames[month - 1];
    setSelectedSearchValues({
      ...selectedSearchValues,
      monthName: monthName
    });
    setBankCustomerList({
      ...bankCustomerList,
      month: month.toString(),
      year: year.toString()
    });

    if (selectedDate != null) {
      var prevMonth = selectedDate.getUTCMonth() + 1;
      var prevyear = selectedDate.getUTCFullYear();

      if ((prevyear == year && prevMonth != month) || prevyear != year) {
        setSelectedDate(date);
      }
    } else {
      setSelectedDate(date);
    }
    setBankCustomerData([]);
  }

  async function GetDetails() {
    if (
      bankCustomerList.groupID > 0 &&
      bankCustomerList.factoryID > 0 &&
      selectedDate != null &&
      selectedDate !== ''
    ) {

      const applicableYear = selectedDate.getFullYear().toString();
      const applicableMonth = (selectedDate.getMonth() + 1).toString();

      let model = {
        groupID: parseInt(bankCustomerList.groupID),
        factoryID: parseInt(bankCustomerList.factoryID),
        routeID: parseInt(bankCustomerList.routeID),
        bankID: parseInt(bankCustomerList.bankID),
        branchID: parseInt(bankCustomerList.branchID),
        applicableMonth: applicableMonth,
        applicableYear: applicableYear
      };

      getSelectedDropdownValuesForReport(model);

      let total = 0;

      const customerData = await services.GetBankCustomerDetails(model);
      if (customerData.statusCode === 'Success' && customerData.data !== null) {
        setBankCustomerData(customerData.data);
        createDataForExcel(customerData.data);
        customerData.data.forEach((x) => {
          total = total + parseFloat(x.amount);
        });

        setTotalAmount(total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

        if (customerData.data.length === 0 && alertCount.count > 1) {
          alert.error('NO RECORDS TO DISPLAY');
        }
      }
    }
  }



  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          Route: x.routeName,
          Branch: x.branchName,
          RegNo: x.registrationNumber,
          Name: x.name,
          AccountNumber: x.accountNumber,
          Amount: x.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        };
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(bankCustomerData);
    var settings = {
      sheetName: 'Bank Customer Details Report',
      fileName:
        'Bank Customer Details Report ' +
        selectedSearchValues.factoryName +
        ' BOUGHT LEAF BANK PAYMENT FOR THE MONTH OF ' +
        selectedSearchValues.monthName +
        '-' +
        bankCustomerList.year +
        ' (' +
        bankCustomerData[0].bankName +
        ')',
      writeOptions: {}
    };

    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    file.push({});
    let total = {
      "Route": "Total",
      "Amount": totalAmount
    }
    file.push(total)
    file.push({});

    let filterData = {
      "Route": "Group: " + groups[bankCustomerList.groupID],
      "Branch": "Factory: " + factories[bankCustomerList.factoryID],
    }
    file.push(filterData);

    let filterDate = {
      "Route": "Month: " + month[(selectedDate.getMonth() + 1).toString() - 1],
      "Branch": "Year" + selectedDate.getFullYear().toString()
    }
    file.push(filterDate);

    let dataA = [
      {
        sheet: 'Bank Customer Details Report',
        columns: tempcsvHeaders,
        content: file
      }
    ];

    xlsx(dataA, settings);
  }

  async function checkISBalancePaymentCompleted() {
    const response = await services.CheckISBalancePaymentCompleted(
      bankCustomerList.groupID,
      bankCustomerList.factoryID
    );
    const bDate = moment(
      response.data.lastBalancePaymentSchedule,
      moment.defaultFormat
    ).toDate();
    var result = endOfMonth(bDate);

    setMaxDate(result);
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    );
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setBankCustomerList({
      ...bankCustomerList,
      [e.target.name]: value
    });
    setBankCustomerData([]);
  }

  function handleSearchDropdownChange(data, e) {
    if (data === undefined || data === null) {
      setBankCustomerList({
        ...bankCustomerList,
        bankID: '0'
      });
      return;
    } else {
      var nameV = 'bankID';
      var valueV = data['bankID'];
      setBankCustomerList({
        ...bankCustomerList,
        bankID: valueV.toString()
      });
    }
  }

  function handleSearchDropdownBranch(data, e) {
    if (data === undefined || data === null) {
      setBankCustomerList({
        ...bankCustomerList,
        branchID: '0'
      });
      return;
    } else {
      var nameV = 'branchID';
      var valueV = data['branchID'];
      setBankCustomerList({
        ...bankCustomerList,
        branchID: valueV.toString()
      });
    }
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: factories[searchForm.factoryID],
      month: searchForm.month,
      year: searchForm.year
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: bankCustomerList.groupID,
              factoryID: bankCustomerList.factoryID,
              bankID: bankCustomerList.bankID,
              selectedDate: selectedDate
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group required')
                .min('1', 'Group required'),
              factoryID: Yup.number()
                .required('Factory required')
                .min('1', 'Factory required'),
              selectedDate: Yup.string()
                .required('Select applicable month')
                .nullable()
            })}
            enableReinitialize
          >
            {({ errors, handleBlur, handleSubmit, touched }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={bankCustomerList.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size="small"
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.factoryID && errors.factoryID
                              )}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={bankCustomerList.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size="small"
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="routeID">
                              Route
                            </InputLabel>
                            <TextField
                              select
                              fullWidth
                              name="routeID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={bankCustomerList.routeID}
                              variant="outlined"
                              id="routeID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Routes--</MenuItem>
                              {generateDropDownMenu(routes)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                error={Boolean(
                                  touched.selectedDate && errors.selectedDate
                                )}
                                helperText={
                                  touched.selectedDate && errors.selectedDate
                                }
                                autoOk
                                fullWidth
                                id="selectedDate"
                                variant="inline"
                                openTo="month"
                                views={['year', 'month']}
                                label="Year and Month *"
                                value={selectedDate}
                                maxDate={maxDate}
                                disableFuture={true}
                                onChange={date => handleDateChange(date)}
                                size="small"
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="bankID">
                              Bank
                            </InputLabel>
                            <Autocomplete
                              id="bankID"
                              options={bankList}
                              getOptionLabel={option =>
                                option.bankName.toString()
                              }
                              onChange={(e, value) =>
                                handleSearchDropdownChange(value, e)
                              }
                              defaultValue={null}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  name="bankID"
                                  fullWidth
                                  value={bankCustomerList.bankID}
                                  getOptionDisabled={true}
                                  size="small"
                                />
                              )}
                            />
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="branchID">
                              Branch
                            </InputLabel>
                            <Autocomplete
                              id="branchID"
                              options={branches}
                              getOptionLabel={option =>
                                option.branchName.toString()
                              }
                              onChange={(e, value) =>
                                handleSearchDropdownBranch(value, e)
                              }
                              defaultValue={null}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  name="branchID"
                                  fullWidth
                                  value={bankCustomerList.branchID}
                                  getOptionDisabled={true}
                                  size="small"
                                />
                              )}
                            />
                          </Grid>
                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                onClick={() => trackPromise(GetDetails())}
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                        <br />

                        <Box minWidth={1050}>
                          {bankCustomerData.length > 0 ? (
                            <MaterialTable
                              title="Multiple Actions Preview"
                              columns={[
                                { title: 'Route', field: 'routeName' },
                                { title: 'Bank', field: 'bankName' },
                                { title: 'Branch', field: 'branchName' },
                                { title: 'RegNo', field: 'registrationNumber' },
                                { title: 'Name', field: 'name' },
                                {
                                  title: 'Account Number',
                                  field: 'accountNumber'
                                },
                                {
                                  title: 'Amount(Rs.)',
                                  field: 'amount',
                                  render: rowData => {
                                    const formattedValue = rowData.amount.toLocaleString(
                                      'en-US',
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                      }
                                    );
                                    return formattedValue;
                                  }
                                }
                              ]}
                              data={bankCustomerData}
                              options={{
                                exportButton: false,
                                showTitle: false,
                                headerStyle: {
                                  textAlign: 'left',
                                  height: '1%'
                                },
                                cellStyle: { textAlign: 'left' },
                                columnResizable: false,
                                actionsColumnIndex: -1,
                                pageSize: 10
                              }}
                              actions={[]}
                            />
                          ) : null}
                        </Box>
                      </CardContent>
                      {bankCustomerData.length > 0 ? (
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          {bankCustomerList.bankID != 0 ? (
                            <>
                              <ReactToPrint
                                documentTitle={'Bank Customer Detail List'}
                                trigger={() => (
                                  <Button
                                    color="primary"
                                    id="btnCancel"
                                    variant="contained"
                                    style={{ marginRight: '1rem' }}
                                    className={classes.colorCancel}
                                    size="small"
                                  >
                                    Bank list
                                  </Button>
                                )}
                                content={() => componentRef1.current}
                              />
                            </>
                          ) : null}
                          <div>&nbsp;</div>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={createFile}
                            size="small"
                          >
                            EXCEL
                          </Button>
                          <div>&nbsp;</div>
                          <ReactToPrint
                            documentTitle={'Bank Customer Details Report'}
                            trigger={() => (
                              <Button
                                color="primary"
                                id="btnCancel"
                                variant="contained"
                                style={{ marginRight: '1rem' }}
                                className={classes.colorCancel}
                                size="small"
                              >
                                PDF
                              </Button>
                            )}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF
                              ref={componentRef}
                              BankCustomerList={bankCustomerList}
                              TotalAmount={totalAmount}
                              BankCustomerSearchData={selectedSearchValues}
                              BankCustomerData={bankCustomerData}
                              selectedDatePDF={selectedDatePDF}
                            />

                            <CreateBankWiseCustomerPDF
                              ref={componentRef1}
                              BankCustomerList={bankCustomerList}
                              TotalAmount={totalAmount}
                              BankCustomerSearchData={selectedSearchValues}
                              BankCustomerData={bankCustomerData}
                              selectedDatePDF={selectedDatePDF}
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
  );
}

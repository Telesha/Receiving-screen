import React, { useState, useEffect, Fragment, useRef } from 'react';
import { useAlert } from "react-alert";
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';

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

const screenCode = 'DENOMINATIONREPORT';

export default function DenominationReport(props) {
  const [title, setTitle] = useState("Denomination Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routes, setRoutes] = useState();
  const [denominationdetails, setDenominationdetails] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    year: '',
    month: ''
  });
  const [denominationCropData, setDenominationCropData] = useState([]);
  const [prevTotalAmount, setPrevTotalAmount] = useState(0);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    monthName: '',
    factoryName: "0",
    routeName: "0",
    groupName: '0'
  })
  const [csvHeaders, SetCsvHeaders] = useState([])
  const [cashCountList, setCashCountList] = useState([]);
  const [coinTotal, setCoinTotal] = useState([]);
  const [remainingValueTotal, setRemainingValueTotal] = useState(0);
  const cash = ['5000', '1000', '500', '100', '50', '20', '10'];
  const columnTitles = ['Reg No', 'Supplier Name', 'Amount(Rs)', ...cash, 'Remaining(Rs)'];
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (denominationdetails.groupID != 0) {
      trackPromise(
        getFactoriesForDropdown());
    }
  }, [denominationdetails.groupID]);

  useEffect(() => {
    if (denominationdetails.factoryID != 0)
      trackPromise(
        getRoutesByFactoryID());
  }, [denominationdetails.factoryID]);

  useEffect(() => {
    setCashCountList([]);
  }, [denominationdetails.routeID]);

  useEffect(() => {
    setCashCountList([]);
  }, [denominationdetails.month]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDENOMINATIONREPORT');

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

    setDenominationdetails({
      ...denominationdetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(denominationdetails.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(denominationdetails.factoryID);
    setRoutes(routeList);
  }

  async function GetDenominationDetails() {
    let totalAmount = 0;

    const denominationData = await GetDenominationDetailsList();

    if (denominationData.statusCode == "Success" && denominationData.data != null) {
      setDenominationCropData(denominationData.data);
      calculateCashCount(denominationData.data, cash)
      denominationData.data.forEach(x => {
        totalAmount = totalAmount + parseFloat(x.amount);
      });
      setPrevTotalAmount(totalAmount);
      createDataForExcel(denominationData.data);

      if (denominationData.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error(denominationData.message);

    }
  }

  async function GetDenominationDetailsList() {
    let model = {
      groupID: parseInt(denominationdetails.groupID),
      factoryID: parseInt(denominationdetails.factoryID),
      routeID: parseInt(denominationdetails.routeID),
      applicableMonth: denominationdetails.month === '' ? moment(new Date()).format('MM') : denominationdetails.month,
      applicableYear: denominationdetails.year === "" ? moment(new Date()).format('YYYY') : denominationdetails.year
    };
    getSelectedDropdownValuesForReport(model);

    const denominationData = await services.GetDenominationReportDetails(model);
    return denominationData;
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
    setDenominationdetails({
      ...denominationdetails,
      [e.target.name]: value
    });
    setDenominationCropData([]);
  }

  function handleDateChange(date) {
    let monthNames = ["JAN", "FEB", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUG", "SEPT", "OCT", "NOV", "DEC"];
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    var currentmonth = moment().format('MM');
    let monthName = monthNames[month - 1];
    setSelectedSearchValues({
      ...selectedSearchValues,
      monthName: monthName
    })
    setDenominationdetails({
      ...denominationdetails,
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
    setDenominationCropData([]);
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Reg No': x && x.registrationNumber,
          'Supplier Name': x && x.supplierName,
          'Amount(Rs)': x && x.amount && x.amount.toFixed(2),
          'FiveThousands(5000)': x && x.cashCount && x.cashCount[0] && x.cashCount[0].coinCount,
          'Thousands(1000)': x && x.cashCount && x.cashCount[1] && x.cashCount[1].coinCount,
          'FiveHundreds(500)': x && x.cashCount && x.cashCount[2] && x.cashCount[2].coinCount,
          'Hundreds(100)': x && x.cashCount && x.cashCount[3] && x.cashCount[3].coinCount,
          'Fifties(50)': x && x.cashCount && x.cashCount[4] && x.cashCount[4].coinCount,
          'Twenties(20)': x && x.cashCount && x.cashCount[5] && x.cashCount[5].coinCount,
          'Tens(10)': x && x.cashCount && x.cashCount[6] && x.cashCount[6].coinCount,
          // 'Fives(5)': x && x.cashCount && x.cashCount[7] && x.cashCount[7].coinCount,
          // 'Twos(2)': x && x.cashCount && x.cashCount[8] && x.cashCount[8].coinCount,
          // 'Ones(1)': x && x.cashCount && x.cashCount[9] && x.cashCount[9].coinCount,
          'Remaining': x && x.remainingValue
        }
        res.push(vr);

      });
      res.push({});
      var vr = {
        'Reg No': "Total",
        'Supplier Name': "",
        'Amount(Rs)': prevTotalAmount.toFixed(2),
        'FiveThousands(5000)': coinTotal && coinTotal[0] && coinTotal[0].coinCount,
        'Thousands(1000)': coinTotal && coinTotal[1] && coinTotal[1].coinCount,
        'FiveHundreds(500)': coinTotal && coinTotal[2] && coinTotal[2].coinCount,
        'Hundreds(100)': coinTotal && coinTotal[3] && coinTotal[3].coinCount,
        'Fifties(50)': coinTotal && coinTotal[4] && coinTotal[4].coinCount,
        'Twenties(20)': coinTotal && coinTotal[5] && coinTotal[5].coinCount,
        'Tens(10)': coinTotal && coinTotal[6] && coinTotal[6].coinCount,
        // 'Fives(5)': coinTotal && coinTotal[7] && coinTotal[7].coinCount,
        // 'Twos(2)': coinTotal && coinTotal[8] && coinTotal[8].coinCount,
        // 'Ones(1)': coinTotal && coinTotal[9] && coinTotal[9].coinCount,
        'Remaining': remainingValueTotal
      }
      res.push(vr);

      res.push({});

      var vr = {
        'Reg No': 'Group :' + selectedSearchValues.groupName,
        'Supplier Name': 'Factory :' + selectedSearchValues.factoryName
      }
      res.push(vr);

      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      const monthYearString = `${month}/${year}`;
      var vr = {
        'Reg No': selectedSearchValues.routeName == 0 || undefined ? 'Route :' + 'All Routes' : 'Route :' + selectedSearchValues.routeName,
        'Supplier Name': 'Year and Month :' + monthYearString,
      }
      res.push(vr);
    }
    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(cashCountList);
    var settings = {
      sheetName: 'Denomination Report',
      fileName: 'Denomination Report ' + selectedSearchValues.factoryName + '-' + selectedSearchValues.routeName + '-'
        + ((denominationdetails.year === '' ? moment(new Date()).format('YYYY') : denominationdetails.year) - 1) + '/' + (denominationdetails.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName) + '-'
        + (denominationdetails.year === '' ? moment(new Date()).format('YYYY') : denominationdetails.year) + '/' + (denominationdetails.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName),
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Denomination Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]

    xlsx(dataA, settings);
  }
  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: FactoryList[searchForm.factoryID],
      routeName: routes[searchForm.routeID],
      year: searchForm.year,
      groupName: GroupList[searchForm.groupID]
    })
  }

  function calculateCashCount(registrationList, cash) {
    const coinNames = {
      5000: 'fiveThousand',
      1000: 'oneThousand',
      500: 'fiveHundred',
      100: 'oneHundred',
      50: 'fifty',
      20: 'twenty',
      10: 'ten',
      // 5: 'five',
      // 2: 'two',
      // 1: 'one'
    };

    const cashCountList = registrationList.map((registration) => {
      let amounbt = registration.amount;
      let cashCount = [];
      let coinTotal = {};

      for (let index = 0; index < cash.length; index++) {
        let numberOfCoins = Math.trunc(amounbt / cash[index]);
        cashCount.push({
          coinNumber: cash[index],
          coinCount: numberOfCoins,
        });

        if (numberOfCoins === 0) {
          continue;
        }

        let totDeduction = numberOfCoins * cash[index];
        amounbt -= totDeduction;

        if (coinTotal[coinNames[cash[index]]]) {
          coinTotal[coinNames[cash[index]]] += numberOfCoins;
        } else {
          coinTotal[coinNames[cash[index]]] = numberOfCoins;
        }
      }

      let remainingValue = amounbt.toFixed(2);

      return {
        supplierName: registration.firstName,
        amount: registration.amount,
        registrationNumber: registration.registrationNumber,
        cashCount: cashCount,
        remainingValue: remainingValue,
        coinTotal: coinTotal,
      };
    });

    let coinTotal = {};
    for (let i = 0; i < cashCountList.length; i++) {
      let cashCountObj = cashCountList[i];
      let cashCountArr = cashCountObj.cashCount;
      for (let j = 0; j < cashCountArr.length; j++) {
        let coinNumber = cashCountArr[j].coinNumber;
        let coinCount = cashCountArr[j].coinCount;
        if (coinTotal[coinNames[coinNumber]]) {
          coinTotal[coinNames[coinNumber]] += coinCount;
        } else {
          coinTotal[coinNames[coinNumber]] = coinCount;
        }
      }
    }
    const coinTotalArray = Object.entries(coinTotal).map(([coinValue, coinCount]) => ({
      coinName: coinNames[coinValue],
      coinCount: coinCount,
    }));
    const totalRemainingValue = cashCountList.reduce((total, cashCountObj) => {
      return total + parseFloat(cashCountObj.remainingValue);
    }, 0).toFixed(2);

    setRemainingValueTotal(totalRemainingValue);
    setCoinTotal(coinTotalArray);
    setCashCountList(cashCountList);
  };

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    )
  }

  async function GetDenominationSummaryReport() {
    const denominationData = await GetDenominationDetailsList();

    if (denominationData.statusCode == "Success" && denominationData.data != null) {
      if (denominationData.data.length == 0) {
        alert.error("No records to display");
        return;
      }
      const coinNames = [
        { coinValue: 5000, coinCount: 0 },
        { coinValue: 1000, coinCount: 0 },
        { coinValue: 500, coinCount: 0 },
        { coinValue: 100, coinCount: 0 },
        { coinValue: 50, coinCount: 0 },
        { coinValue: 20, coinCount: 0 },
        { coinValue: 10, coinCount: 0 },
        // { coinValue: 5, coinCount: 0 },
        // { coinValue: 2, coinCount: 0 },
        // { coinValue: 1, coinCount: 0 },
      ];

      denominationData.data.forEach(element => {
        let tempAmount = element.amount;
        coinNames.forEach(object => {
          const x = object.coinValue;
          if (tempAmount == 0) {
            return;
          }
          var count = Math.floor(tempAmount / x)
          object.coinCount += count
          tempAmount -= (count * x)
        })
      });
      CreateDenominationSummaryFile(coinNames)

    }
    else {
      alert.error(denominationData.message);
    }
  }


  async function CreateDenominationSummaryFile(summaryDataList) {

    var basicDetails = {
      factoryName: FactoryList[denominationdetails.factoryID],
      routeName: routes[denominationdetails.routeID],
      groupName: GroupList[denominationdetails.groupID]
    }
    var file = await CreateDataForDenominationSummaryExcel(summaryDataList, basicDetails);
    var settings = {
      sheetName: 'Denomination Summary Report',
      fileName: 'Denomination Summary Report ' + basicDetails.factoryName + '-' + basicDetails.routeName + '-'
        + ((denominationdetails.year === '' ? moment(new Date()).format('YYYY') : denominationdetails.year) - 1) + '/' + (denominationdetails.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName) + '-'
        + (denominationdetails.year === '' ? moment(new Date()).format('YYYY') : denominationdetails.year) + '/' + (denominationdetails.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName),
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Denomination Summary Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]

    xlsx(dataA, settings);
  }

  async function CreateDataForDenominationSummaryExcel(array, basicDetails) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Coin Value': x && x.coinValue,
          'Coin Count': x && x.coinCount
        }
        res.push(vr);

      });

      res.push({});

      var vr = {
        'Coin Value': 'Group :' + basicDetails.groupName,
        'Coin Count': 'Factory :' + basicDetails.factoryName
      }

      res.push(vr);

      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      const monthYearString = `${month}/${year}`;
      var vr = {
        'Coin Value': basicDetails.routeName == undefined ? 'Route :' + 'All Routes' : 'Route :' + basicDetails.routeName,
        'Coin Count': 'Year and Month :' + monthYearString,
      }
      res.push(vr);
    }
    return res;
  }

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: denominationdetails.groupID,
              factoryID: denominationdetails.factoryID,
              routeID: denominationdetails.routeID,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                // routeID: Yup.number().required('Route is required').min("1", 'Route is required')
              })
            }
            onSubmit={() => trackPromise(GetDenominationDetails())}
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
                          <Grid item md={3} xs={12}>
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
                              value={denominationdetails.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
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
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={denominationdetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              size='small'
                              disabled={!permissionList.isFactoryFilterEnabled}
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
                              error={Boolean(touched.routeID && errors.routeID)}
                              fullWidth
                              helperText={touched.routeID && errors.routeID}
                              name="routeID"
                              onChange={(e) => handleChange(e)}
                              value={denominationdetails.routeID}
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
                            style={{ marginRight: "5px" }}
                            onClick={() => trackPromise(GetDenominationSummaryReport())}
                          >
                            Download Denomination Summary
                          </Button>

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
                        {cashCountList.length > 0 ?
                          <TableContainer style={{ marginLeft: '2rem' }} >
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  {columnTitles.map(title => (
                                    <TableCell key={title} align='left'>{title}</TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {cashCountList.map((data, index) => (
                                  <TableRow key={index}>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.registrationNumber}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.supplierName}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.amount.toFixed(2)}
                                    </TableCell>
                                    {data.cashCount.map((coin, index) => (
                                      <TableCell key={cash[index]} align='left' component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {coin.coinCount}
                                      </TableCell>
                                    ))}
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.remainingValue}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableRow>
                                <TableCell align={'left'}><b>Total</b></TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b>{prevTotalAmount.toFixed(2)}</b>
                                </TableCell>
                                {coinTotal.map((coin, index) => (
                                  <TableCell key={cash[index]} align='left' component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b>{coin.coinCount}</b>
                                  </TableCell>
                                ))}
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b>{remainingValueTotal}</b>
                                </TableCell>
                              </TableRow>
                            </Table>
                          </TableContainer>
                          : null
                        }
                      </Box>
                      <br />
                      <Divider />
                      {denominationCropData.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            // type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={() => createFile()}
                            size='small'
                          >
                            EXCEL
                          </Button>
                          <ReactToPrint
                            documentTitle={"Denomination Report"}
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
                              cashCountList={cashCountList} coinTotal={coinTotal} remainingValueTotal={remainingValueTotal}
                              selectedSearchValues={selectedSearchValues} searchDate={denominationdetails} prevTotalAmount={prevTotalAmount}
                              coinNames={cash} columnTitles={columnTitles}
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

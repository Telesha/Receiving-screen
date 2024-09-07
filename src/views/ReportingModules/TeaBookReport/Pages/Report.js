import React, { useState, useEffect, Fragment, useRef } from 'react';
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
  MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import {
  DatePicker,
  MuiPickersUtilsProvider
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';

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
  colorCancel: {
    backgroundColor: 'red'
  },
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = 'TEABOOKREPORT';

export default function TeaBookReport(props) {
  const today = new Date();
  const previousMonth = new Date();
  previousMonth.setMonth(today.getMonth() - 1);
  const [title, setTitle] = useState('Tea Book Report');
  const classes = useStyles();
  const [cashCustomerDetail, setcashCustomerDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    year: today.getFullYear().toString(),
    month: today.getMonth().toString()
  });
  const [FactoryList, setFactoryList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(previousMonth);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const navigate = useNavigate();

  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    factoryName: '0',
    groupName: '0',
    year: '',
    monthName: ''
  });

  const contentRowNames = [
    { title: "Date", field: "date" },
    { title: "Rainfall", field: "rainfall" },
    { title: "Estate", field: "estate", render: rowData => rowData.estate.toFixed(2) },
    { title: "Inter Estate", field: "interEstate", render: rowData => rowData.interEstate.toFixed(2) },
    { title: "Bought Leaf", field: "boughtLeaf", render: rowData => rowData.boughtLeaf.toFixed(2) },
    { title: "Grand Total", field: "glgrandTotal", render: rowData => rowData.glgrandTotal.toFixed(2) },
    { title: "Withered Leaf", field: "witheredLeaf", render: rowData => rowData.witheredLeaf.toFixed(2) },
    { title: "Rolling", field: "rolling", render: rowData => rowData.rolling.toFixed(2) },
    { title: "Fired Tea", field: "firedTea", render: rowData => rowData.firedTea.toFixed(2) },
    { title: "Fired Tea Excess", field: "firedTeaExcess", render: rowData => rowData.firedTeaExcess.toFixed(2) },
    { title: "Estate Made Tea", field: "estateMadeTea", render: rowData => rowData.estateMadeTea.toFixed(2) },
    { title: "Inter Estate Made Tea", field: "interEstateMadeTea", render: rowData => rowData.interEstateMadeTea.toFixed(2) },
    { title: "Boughtleaf Made Tea", field: "boughtleafMadeTea", render: rowData => rowData.boughtleafMadeTea.toFixed(2) },
    { title: "Grand Total", field: "mtgrandTotal", render: rowData => rowData.mtgrandTotal.toFixed(2) },
    { title: "Gross Out Turn", field: "grossOutTurn", render: rowData => rowData.grossOutTurn.toFixed(2) },
    { title: "Blow Out", field: "blowOut", render: rowData => rowData.blowOut.toFixed(2) },
    { title: "Refuse Tea", field: "refuseTea", render: rowData => rowData.refuseTea.toFixed(2) },
    { title: "Refuse Tea Excess", field: "refuseTeaExcess", render: rowData => rowData.refuseTeaExcess.toFixed(2) },
  ]

  const componentRef = useRef();
  const [totalAmount, setTotalAmount] = useState([]);
  const [alertCount, setAlertCount] = useState({
    count: 0
  });
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
    setAlertCount({
      count: 1
    });
  }, []);

  useEffect(() => {
    if (cashCustomerDetail.groupID != 0) {
      getFactoriesForDropdown();
      setAlertCount({
        count: alertCount.count + 1
      });
    }
  }, [cashCustomerDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWTEABOOKREPORT'
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

    setcashCustomerDetail({
      ...cashCustomerDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setcashCustomerDetail({
      ...cashCustomerDetail,
      [e.target.name]: value
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(
      cashCustomerDetail.groupID
    );
    setFactoryList(factories);
  }

  async function GetDetails() {
    let total = {
      totalestate: 0,
      totalinterEstate: 0,
      totalboughtLeaf: 0,
      totalglgrandTotal: 0,
      totalwitheredLeaf: 0,
      totalrolling: 0,
      totalfiredTea: 0,
      totalfiredTeaExcess: 0,
      totalestateMadeTea: 0,
      totalinterEstateMadeTea: 0,
      totalboughtleafMadeTea: 0,
      totalmtgrandTotal: 0,
      totalgrossOutTurn: 0,
      totalblowOut: 0,
      totalrefuseTea: 0,
      totalrefuseTeaExcess: 0
    }
    let model = {
      groupID: parseInt(cashCustomerDetail.groupID),
      factoryID: parseInt(cashCustomerDetail.factoryID),
      applicableMonth: cashCustomerDetail.month,
      applicableYear: cashCustomerDetail.year
    };
    getSelectedDropdownValuesForReport(model);

    const teaBookData = await services.GetTeaBookDetails(model);
    setReportData(teaBookData);
    teaBookData.forEach(x => {
      total.totalestate = total.totalestate + parseFloat(x.estate);
      total.totalinterEstate = total.totalinterEstate + parseFloat(x.interEstate);
      total.totalboughtLeaf = total.totalboughtLeaf + parseFloat(x.boughtLeaf);
      total.totalglgrandTotal = total.totalglgrandTotal + parseFloat(x.glgrandTotal);
      total.totalwitheredLeaf = total.totalwitheredLeaf + parseFloat(x.witheredLeaf);
      total.totalrolling = total.totalrolling + parseFloat(x.rolling);
      total.totalfiredTea = total.totalfiredTea + parseFloat(x.firedTea);
      total.totalfiredTeaExcess = total.totalfiredTeaExcess + parseFloat(x.firedTeaExcess);
      total.totalestateMadeTea = total.totalestateMadeTea + parseFloat(x.estateMadeTea);
      total.totalinterEstateMadeTea = total.totalinterEstateMadeTea + parseFloat(x.interEstateMadeTea);
      total.totalboughtleafMadeTea = total.totalboughtleafMadeTea + parseFloat(x.boughtleafMadeTea);
      total.totalmtgrandTotal = total.totalmtgrandTotal + parseFloat(x.mtgrandTotal);
      total.totalgrossOutTurn = total.totalgrossOutTurn + parseFloat(x.grossOutTurn);
      total.totalblowOut = total.totalblowOut + parseFloat(x.blowOut);
      total.totalrefuseTea = total.totalrefuseTea + parseFloat(x.refuseTea);
      total.totalrefuseTeaExcess = total.totalrefuseTeaExcess + parseFloat(x.refuseTeaExcess);
    });
    setTotalAmount(total);
    createDataForExcel(teaBookData);
  }

  async function createDataForExcel(array) {
    var res = [];

    if (array != null) {
      array.map(x => {
        var vr = {
          'Date': x.date,
          'Rainfall': x.rainfall,
          'Estate': x.estate.toFixed(2),
          'Inter Estate': x.interEstate.toFixed(2),
          'Bought Leaf': x.boughtLeaf.toFixed(2),
          'Grand Total': x.glgrandTotal.toFixed(2),
          'Withered Leaf': x.witheredLeaf.toFixed(2),
          'Rolling': x.rolling.toFixed(2),
          'Fired Tea': x.firedTea.toFixed(2),
          'Fired Tea Excess': x.firedTeaExcess.toFixed(2),
          'Estate Made Tea': x.estateMadeTea.toFixed(2),
          'Inter Estate Made Tea': x.interEstateMadeTea.toFixed(2),
          'Boughtleaf Made Tea': x.boughtleafMadeTea.toFixed(2),
          'Grand Total': x.mtgrandTotal.toFixed(2),
          'Gross Out Turn': x.grossOutTurn.toFixed(2),
          'Drier Blow Out': x.blowOut.toFixed(2),
          'Refuse Tea': x.refuseTea.toFixed(2),
          'Refuse Tea Excess': x.refuseTeaExcess.toFixed(2)
        };
        res.push(vr);
      });

      res.push({});
      const formattedDate = selectedDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      var vr = {
        'Date': "Group: " + selectedSearchValues.groupName,
        'Rainfall': "Factory: " + selectedSearchValues.factoryName,
        'Estate': "Month: " + formattedDate
      }
      res.push(vr);
    }

    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(reportData);
    var settings = {
      sheetName: 'Tea Book Report',
      fileName:
        'Tea Book Report ' +
        selectedSearchValues.factoryName +
        ' - ' +
        selectedSearchValues.groupName +
        ' TEA BOOK REPORT FOR THE MONTH OF ' +
        selectedSearchValues.monthName +
        ' - ' +
        cashCustomerDetail.year,
      writeOptions: {}
    };

    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'Tea Book Report',
        columns: tempcsvHeaders,
        content: file
      }
    ];

    xlsx(dataA, settings);
  }

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
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    var currentmonth = moment().format('MM');
    let monthName = monthNames[month - 1];

    setSelectedSearchValues({
      ...selectedSearchValues,
      monthName: monthName
    });
    setcashCustomerDetail({
      ...cashCustomerDetail,
      month: month.toString(),
      year: year.toString()
    });

    if (selectedDate != null) {
      var prevMonth = selectedDate.getUTCMonth() + 1;
      var prevyear = selectedDate.getUTCFullYear();

      if ((prevyear == year && prevMonth != month) || prevyear != year) {
        setSelectedDate(date);
        //setSearchStarted(true)
      }
    } else {
      setSelectedDate(date);
      //setSearchStarted(true)
    }
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: FactoryList[searchForm.factoryID],
      groupName: GroupList[searchForm.groupID],
      month: searchForm.month,
      year: searchForm.year
    });
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

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: cashCustomerDetail.groupID,
              factoryID: cashCustomerDetail.factoryID
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group required')
                .min('1', 'Group required'),
              factoryID: Yup.number()
                .required('Factory required')
                .min('1', 'Factory required')
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
                          <Grid item md={4} xs={8}>
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
                              value={cashCustomerDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size="small"
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
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
                              value={cashCustomerDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size="small"
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="inline"
                                openTo="month"
                                views={["year", "month"]}
                                label="Year and Month *"
                                helperText="Select applicable month"
                                value={selectedDate}
                                disableFuture={true}
                                onChange={date => handleDateChange(date)}
                                size="small"
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
                      {reportData.length > 0 ? (
                        <Box minWidth={1050}>
                          <TableContainer style={{ marginLeft: '5px' }}>
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Date</TableCell>
                                  <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Rainfall</TableCell>
                                  <TableCell colSpan={4} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                    GreenLeaf(Kg)
                                  </TableCell>
                                  <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Withered Leaf(Kg)</TableCell>
                                  <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Rolling(Kg)</TableCell>
                                  <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Fired Tea(Kg)</TableCell>
                                  <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Fired Tea Excess(Kg)</TableCell>
                                  <TableCell colSpan={4} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                    Made Tea
                                  </TableCell>
                                  <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>
                                    Gross Out Turn(Kg)
                                  </TableCell>
                                  <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Drier Blow Out(Kg)</TableCell>
                                  <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Refuse Tea(Kg)</TableCell>
                                  <TableCell rowSpan={2} align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Refuse Tea Excess(Kg)</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Estate</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Inter Estate</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Bought Leaf</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Grand Total</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Estate Made Tea(Kg)</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Inter Estate Made Tea(Kg)</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Boughtleaf Made Tea(Kg)</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>Grand Total(Kg)</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {reportData.map((data, index) => (
                                  <TableRow key={index}>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {data.date}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {data.rainfall}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.estate).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.interEstate).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.boughtLeaf).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.glgrandTotal).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.witheredLeaf).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.rolling).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.firedTea).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.firedTeaExcess).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.estateMadeTea).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.interEstateMadeTea).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.boughtleafMadeTea).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.mtgrandTotal).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.grossOutTurn).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.blowOut).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.refuseTea).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.refuseTeaExcess).toFixed(2)}
                                    </TableCell>
                                  </TableRow>

                                ))}
                              </TableBody>
                              <TableRow>
                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}><b>Total</b></TableCell>
                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}></TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalestate)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalinterEstate)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalboughtLeaf)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalglgrandTotal)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalwitheredLeaf)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalrolling)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalfiredTea)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalfiredTeaExcess)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalestateMadeTea)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalinterEstateMadeTea)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalboughtleafMadeTea)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalmtgrandTotal)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalgrossOutTurn)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalblowOut)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalrefuseTea)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalrefuseTeaExcess)).toFixed(2)} </b>
                                </TableCell>
                              </TableRow>
                            </Table>
                          </TableContainer>
                        </Box>
                      ) : null};
                      {reportData.length > 0 ? (
                        <Box display="flex" justifyContent="flex-end" p={2}>
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
                            documentTitle={'Cash Customer Details Report'}
                            trigger={() => (
                              <Button
                                color="primary"
                                id="btnRecord"
                                type="submit"
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
                              searchData={selectedSearchValues}
                              searchDate={cashCustomerDetail}
                              reportData={reportData}
                              total={totalAmount}
                              contentRowNames={contentRowNames}
                            />
                          </div>
                        </Box>
                      ) : null};
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

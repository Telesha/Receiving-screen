import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
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

const screenCode = 'ROUTECROPCOMPARISONMONTHLYREPORT';

export default function RouteCropComparisonMonthlyReport(props) {
  const [title, setTitle] = useState("Route Crop Comparison Monthly Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routes, setRoutes] = useState();
  const [routeCropDetail, setRouteCropDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    year: '',
    month: ''
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [routeCropData, setRouteCropData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [csvHeaders, SetCsvHeaders] = useState([])
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "o",
    factoryName: "0",
    monthName: '',
    routeName: "0"
  })
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const [prevTotalSupp, setPrevTotalSupp] = useState(0);
  const [curTotalSupp, setCurTotalSupp] = useState(0);
  const [prevTotalCrop, setPrevTotalCrop] = useState(0);
  const [curTotalCrop, setCurTotalCrop] = useState(0);

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (routeCropDetail.groupID != 0) {
      trackPromise(
        getFactoriesForDropdown());
    }
  }, [routeCropDetail.groupID]);

  useEffect(() => {
    if (routeCropDetail.factoryID != 0) {
      trackPromise(
        getRoutesByFactoryID());
    }
  }, [routeCropDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWROUTECROPCOMPARISONREPORT');

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

    setRouteCropDetail({
      ...routeCropDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(routeCropDetail.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(routeCropDetail.factoryID);
    setRoutes(routeList);
  }

  async function GetRouteCropDetails() {
    let prevYearTotalSup = 0;
    let curYearTotalSup = 0;
    let prevYearTotalCrop = 0;
    let curYearTotalCrop = 0;
    let model = {
      groupID: parseInt(routeCropDetail.groupID),
      factoryID: parseInt(routeCropDetail.factoryID),
      routeID: parseInt(routeCropDetail.routeID),
      applicableMonth: routeCropDetail.month === '' ? moment(new Date()).format('MM') : routeCropDetail.month,
      applicableYear: routeCropDetail.year === "" ? moment(new Date()).format('YYYY') : routeCropDetail.year
    }
    getSelectedDropdownValuesForReport(model);

    const cropData = await services.GetRouteCropDetailsForComparison(model);

    if (cropData.statusCode == "Success" && cropData.data != null) {
      setRouteCropData(cropData.data);
      cropData.data.forEach(x => {
        prevYearTotalSup = prevYearTotalSup + parseInt(x.prevYearSupplierCount);
        curYearTotalSup = curYearTotalSup + parseInt(x.currentYearSupplierCount);
        prevYearTotalCrop = prevYearTotalCrop + parseInt(x.prevYearWeight);
        curYearTotalCrop = curYearTotalCrop + parseInt(x.currentYearWeight);
      });
      setPrevTotalSupp(prevYearTotalSup);
      setCurTotalSupp(curYearTotalSup);
      setPrevTotalCrop(prevYearTotalCrop);
      setCurTotalCrop(curYearTotalCrop);
      createDataForExcel(cropData.data);

      if (cropData.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error("Error");
    }
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      var year = routeCropDetail.year;
      array.map(x => {
        var vr = {
          'Route': x.routeName,
          'Active Supplier-PrevYear': x.prevYearSupplierCount,
          'Crop (Kg)-PrevYear': x.prevYearWeight,
          'Active Supplier-CurYear': x.currentYearSupplierCount,
          'Crop (Kg)-CurYear': x.currentYearWeight,
          'Supplier Variance': (x.currentYearSupplierCount - x.prevYearSupplierCount),
          'Crop Variance': (x.currentYearWeight - x.prevYearWeight),
        }
        res.push(vr);
      });
      var vr = {
        'Route': 'Total',
        'Active Supplier-PrevYear': prevTotalSupp,
        'Crop (Kg)-PrevYear': prevTotalCrop,
        'Active Supplier-CurYear': curTotalSupp,
        'Crop (Kg)-CurYear': curTotalCrop,
        'Supplier Variance': '',
        'Crop Variance': '',
      }
      res.push(vr);

      res.push({});

      const month = selectedDate.toLocaleString('default', { month: 'long' });
      const yearofMonth = selectedDate.getFullYear();
      const formattedDate = `${month}, ${yearofMonth}`;

      var vr = {
        'Route': 'Group: ' + selectedSearchValues.groupName,
        'Active Supplier-PrevYear': 'Factory: ' + selectedSearchValues.factoryName,
        'Crop (Kg)-PrevYear': selectedSearchValues.routeName == undefined ? 'Route :' + 'All Routes' : 'Route :' + selectedSearchValues.routeName,
        'Active Supplier-CurYear': "Month: " + formattedDate,
      }
      res.push(vr);
    }
    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(routeCropData);
    var settings = {
      sheetName: 'Route Crop Comparison Report',
      fileName: 'Route Crop Comparison Monthly Report ' + selectedSearchValues.factoryName + ' ' + ((routeCropDetail.year === '' ? moment(new Date()).format('YYYY') : routeCropDetail.year) - 1) + '/' + (routeCropDetail.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName) + '-'
        + (routeCropDetail.year === '' ? moment(new Date()).format('YYYY') : routeCropDetail.year) + '/' + (routeCropDetail.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName),
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Route Crop Comparison Report',
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
    setRouteCropDetail({
      ...routeCropDetail,
      [e.target.name]: value
    });
    setRouteCropData([]);
  }

  function handleDateChange(date) {
    let monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    var currentmonth = moment().format('MM');
    let monthName = monthNames[month - 1];
    setSelectedSearchValues({
      ...selectedSearchValues,
      monthName: monthName
    });
    setRouteCropDetail({
      ...routeCropDetail,
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
    setRouteCropData([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
      routeName: routes[searchForm.routeID],
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
              groupID: routeCropDetail.groupID,
              factoryID: routeCropDetail.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
              })
            }
            onSubmit={() => trackPromise(GetRouteCropDetails())}
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
                              value={routeCropDetail.groupID}
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
                              value={routeCropDetail.factoryID}
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
                              value={routeCropDetail.routeID}
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
                        {routeCropData.length > 0 ?
                          <TableContainer >
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align={'center'}></TableCell>
                                  <TableCell align={'center'}>{(routeCropDetail.year === '' ? moment(new Date()).format('YYYY') : routeCropDetail.year) - 1}/{(routeCropDetail.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName)}</TableCell>
                                  <TableCell align={'center'}></TableCell>
                                  <TableCell align={'center'}>{(routeCropDetail.year === '' ? moment(new Date()).format('YYYY') : routeCropDetail.year)}/{(routeCropDetail.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName)}</TableCell>
                                  <TableCell align={'center'}></TableCell>
                                  <TableCell align={'center'}>Supplier Variance</TableCell>
                                  <TableCell align={'center'}>Crop Varience</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell align={'center'}>Route</TableCell>
                                  <TableCell align={'center'}>Active Supplier</TableCell>
                                  <TableCell align={'center'}>Crop (Kg)</TableCell>
                                  <TableCell align={'center'}>Active Supplier</TableCell>
                                  <TableCell align={'center'}>Crop (Kg)</TableCell>
                                  <TableCell align={'center'}></TableCell>
                                  <TableCell align={'center'}></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {routeCropData.map((data, index) => (
                                  <TableRow key={index}>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.routeName}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.prevYearSupplierCount}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.prevYearWeight}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.currentYearSupplierCount}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.currentYearWeight}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(data.currentYearSupplierCount - data.prevYearSupplierCount)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.currentYearWeight - data.prevYearWeight}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableRow>
                                <TableCell align={'center'}><b>Total</b></TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b>{prevTotalSupp}</b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b>{prevTotalCrop}</b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {curTotalSupp} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {curTotalCrop} </b>
                                </TableCell>
                              </TableRow>
                            </Table>
                          </TableContainer> : null}
                      </Box>
                      {routeCropData.length > 0 ?
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
                            documentTitle={"Route Crop Comparison Monthly Report"}
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
                              routeCropData={routeCropData} prevTotalSupp={prevTotalSupp} curTotalSupp={curTotalSupp}
                              searchDate={routeCropDetail} prevTotalCrop={prevTotalCrop}
                              curTotalCrop={curTotalCrop} searchData={selectedSearchValues}
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

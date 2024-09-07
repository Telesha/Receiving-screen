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
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
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

const screenCode = 'SUPPLIERCROPCOMPARISONMONTHLYREPORT';

export default function SupplierCropComparisonMonthlyReport(props) {
  const [title, setTitle] = useState("Supplier Crop Comparison Monthly Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routes, setRoutes] = useState();
  const [supplierCropdetails, setSupplierCropdetails] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    year: '',
    month: '',
    registrationNumber: '',
  });
  const [supplierCropData, setSupplierCropData] = useState([]);
  const [prevTotalAmount, setPrevTotalAmount] = useState(0);
  const [curTotalAmount, setCurTotalAmount] = useState(0);
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
    trackPromise(
      getFactoriesForDropdown());
  }, [supplierCropdetails.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID());
  }, [supplierCropdetails.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSUPPLIERCROPCOMPARISONREPORT');

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

    setSupplierCropdetails({
      ...supplierCropdetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(supplierCropdetails.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(supplierCropdetails.factoryID);
    setRoutes(routeList);
  }

  async function GetCropDetails() {
    let lastYeartotal = 0;
    let currentYeartotal = 0;

    let model = {
      groupID: parseInt(supplierCropdetails.groupID),
      factoryID: parseInt(supplierCropdetails.factoryID),
      routeID: parseInt(supplierCropdetails.routeID),
      applicableMonth: supplierCropdetails.month === '' ? moment(new Date()).format('MM') : supplierCropdetails.month,
      applicableYear: supplierCropdetails.year === "" ? moment(new Date()).format('YYYY') : supplierCropdetails.year,
      registrationNumber: supplierCropdetails.registrationNumber
    }
    getSelectedDropdownValuesForReport(model);

    const cropData = await services.GetSupplierMonthlyCrop(model);

    if (cropData.statusCode == "Success" && cropData.data != null) {
      setSupplierCropData(cropData.data);
      cropData.data.forEach(x => {
        lastYeartotal = lastYeartotal + parseFloat(x.prevYearWeight);
        currentYeartotal = currentYeartotal + parseFloat(x.currentYearWeight);
      });
      setPrevTotalAmount(lastYeartotal);
      setCurTotalAmount(currentYeartotal);
      createDataForExcel(cropData.data);

      if (cropData.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error(cropData.message);

    }
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
    setSupplierCropdetails({
      ...supplierCropdetails,
      [e.target.name]: value
    });
    setSupplierCropData([]);
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
    setSupplierCropdetails({
      ...supplierCropdetails,
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
    setSupplierCropData([]);
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Reg No': x.registrationNumber,
          'Customer Name': x.name,
          ["Crop-PrevYear (" + ((supplierCropdetails.year === '' ? moment(new Date()).format('YYYY') : supplierCropdetails.year) - 1) + ' / ' + (supplierCropdetails.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName) + ")"]: x.prevYearWeight,
          ["Crop-CurrentYear (" + (supplierCropdetails.year === '' ? moment(new Date()).format('YYYY') : supplierCropdetails.year) + ' / ' + (supplierCropdetails.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName) + ")"]: x.currentYearWeight,
          'Variance': x.currentYearWeight - x.prevYearWeight,
        }
        res.push(vr);
      });
      var vr = {
        'Reg No': 'Total',
        'Customer Name': '',
        ["Crop-PrevYear (" + ((supplierCropdetails.year === '' ? moment(new Date()).format('YYYY') : supplierCropdetails.year) - 1) + ' / ' + (supplierCropdetails.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName) + ")"]: prevTotalAmount,
        ["Crop-CurrentYear (" + (supplierCropdetails.year === '' ? moment(new Date()).format('YYYY') : supplierCropdetails.year) + ' / ' + (supplierCropdetails.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName) + ")"]: curTotalAmount,
        'Variance': curTotalAmount - prevTotalAmount,
      }
      res.push(vr);

      res.push({});

      var vr = {
        'Reg No': 'Group :' + selectedSearchValues.groupName,
        'Customer Name': 'Factory :' + selectedSearchValues.factoryName
      }
      res.push(vr);

      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      const monthYearString = `${month}/${year}`;

      var vr = {
        'Reg No': 'Route :' + selectedSearchValues.routeName == undefined ? 'Route :' + 'All Routes' : 'Route :' + selectedSearchValues.routeName,
        'Customer Name': 'Year and Month :' + monthYearString,
      }
      res.push(vr);
    }
    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(supplierCropData);
    var settings = {
      sheetName: 'Supplier Crop Comparison Report',
      fileName: 'Supplier Crop Comparison Monthly Report ' + selectedSearchValues.factoryName + '-' + selectedSearchValues.routeName + '-'
        + ((supplierCropdetails.year === '' ? moment(new Date()).format('YYYY') : supplierCropdetails.year) - 1) + '/' + (supplierCropdetails.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName) + '-'
        + (supplierCropdetails.year === '' ? moment(new Date()).format('YYYY') : supplierCropdetails.year) + '/' + (supplierCropdetails.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName),
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Supplier Crop Comparison Report',
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
              groupID: supplierCropdetails.groupID,
              factoryID: supplierCropdetails.factoryID,
              routeID: supplierCropdetails.routeID,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                routeID: Yup.number().required('Route is required').min("1", 'Route is required'),
              })
            }
            onSubmit={() => trackPromise(GetCropDetails())}
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
                              value={supplierCropdetails.groupID}
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
                              value={supplierCropdetails.factoryID}
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
                              Route *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.routeID && errors.routeID)}
                              fullWidth
                              helperText={touched.routeID && errors.routeID}
                              name="routeID"
                              onChange={(e) => handleChange(e)}
                              value={supplierCropdetails.routeID}
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
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Registration Number
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="registrationNumber"
                              onChange={(e) => handleChange(e)}
                              value={supplierCropdetails.registrationNumber}
                              variant="outlined"
                              id="registrationNumber"
                              size='small'
                            >
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
                        {supplierCropData.length > 0 ?
                          <TableContainer style={{ marginLeft: '2rem' }} >
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align={'left'}>Reg No</TableCell>
                                  <TableCell align={'left'}>Customer Name</TableCell>
                                  <TableCell align={'left'}>Crop(Kg)-{(supplierCropdetails.year === '' ? moment(new Date()).format('YYYY') : supplierCropdetails.year) - 1}/{(supplierCropdetails.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName)}</TableCell>
                                  <TableCell align={'left'}>Crop(Kg)-{(supplierCropdetails.year === '' ? moment(new Date()).format('YYYY') : supplierCropdetails.year)}/{(supplierCropdetails.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName)}</TableCell>
                                  <TableCell align={'left'}>Variance</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {supplierCropData.map((data, index) => (
                                  <TableRow key={index}>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.registrationNumber}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.name}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.prevYearWeight}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.currentYearWeight}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(data.currentYearWeight) - (data.prevYearWeight)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableRow>
                                <TableCell align={'left'}><b>Total</b></TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b>{prevTotalAmount}</b>
                                </TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b>{curTotalAmount}</b>
                                </TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {curTotalAmount - prevTotalAmount} </b>
                                </TableCell>
                              </TableRow>
                            </Table>
                          </TableContainer>
                          : null}
                      </Box>
                      <br />
                      <Divider />
                      {supplierCropData.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={() => createFile()}
                            size='small'
                          >
                            EXCEL
                          </Button>
                          <ReactToPrint
                            documentTitle={"Supplier Crop Comparison Monthly Report"}
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
                              supplierCropData={supplierCropData} prevTotalAmount={prevTotalAmount} curTotalAmount={curTotalAmount}
                              selectedSearchValues={selectedSearchValues} searchDate={supplierCropdetails}
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

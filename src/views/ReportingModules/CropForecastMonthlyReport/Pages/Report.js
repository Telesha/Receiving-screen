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
import MaterialTable from "material-table";
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

const screenCode = 'CROPFORECASTMONTHLYREPORT';

export default function CropForecastMonthlyReport(props) {
  const [title, setTitle] = useState("Crop Forecast Monthly Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routes, setRoutes] = useState();
  const [monthlyCropDetail, setMonthlyCropDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    year: '',
    month: ''
  });
  const [monthlyCropData, setMonthlyCropData] = useState([]);
  const [totalCustomer, setTotalCustomer] = useState(0);
  const [totalCrop, setTotalCrop] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    monthName: ''
  })
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();

  useEffect(() => {
    trackPromise(
      getPermission()
    );
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [monthlyCropDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID()
    )
  }, [monthlyCropDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCROPFORECASTMONTHLYREPORT');

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

    setMonthlyCropDetail({
      ...monthlyCropDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(monthlyCropDetail.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(monthlyCropDetail.factoryID);
    setRoutes(routeList);
  }

  async function GetCropDetails() {
    let totalCustomer = 0;
    let totalCrop = 0;
    
    let model = {
      groupID: parseInt(monthlyCropDetail.groupID),
      factoryID: parseInt(monthlyCropDetail.factoryID),
      routeID: parseInt(monthlyCropDetail.routeID),
      applicableMonth: monthlyCropDetail.month === '' ? moment(new Date()).format('MM') : monthlyCropDetail.month,
      applicableYear: monthlyCropDetail.year === "" ? moment(new Date()).format('YYYY') : monthlyCropDetail.year
    }

    getSelectedDropdownValuesForReport(model);

    const cropData = await services.GetMonthlyCropForecastDetails(model);

    if (cropData.statusCode == "Success" && cropData.data != null) {
      setMonthlyCropData(cropData.data);
      cropData.data.forEach(x => {
        totalCustomer = totalCustomer + parseFloat(x.customerCount);
        totalCrop = totalCrop + parseInt(x.cropWeight);
      });
      setTotalCustomer(totalCustomer);
      setTotalCrop(totalCrop);
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
      array.map(x => {
        var vr = {
          'Year': monthlyCropDetail.year === "" ? (moment(new Date()).format('YYYY') - 1) : monthlyCropDetail.year - 1,
          'Route Name': x.routeName,
          'Crop Amount (KG)': x.cropWeight,
          'Customer Count': x.customerCount,
        }
        res.push(vr);
      });
      var vr = {
        'Year': 'Total',
        'Route Name': '',
        'Crop Amount (KG)': totalCrop,
        'Customer Count': totalCustomer,
      }
      res.push(vr);
    }

    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(monthlyCropData);
    var settings = {
      sheetName: 'Crop Forecast Monthly Report',
      fileName: 'Crop Forecast Monthly Report - ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName + ' ' + selectedSearchValues.monthName,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Crop Forecast Monthly Report',
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
    setMonthlyCropDetail({
      ...monthlyCropDetail,
      [e.target.name]: value
    });
    setMonthlyCropData([]);
  }

  function handleDateChange(date) {
    let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "Octomber", "November", "December"];
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    var currentmonth = moment().format('MM');
    let monthName = monthNames[month - 1];
    setSelectedSearchValues({
      ...selectedSearchValues,
      monthName: monthName
    });
    setMonthlyCropDetail({
      ...monthlyCropDetail,
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
    setMonthlyCropData([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
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
              groupID: monthlyCropDetail.groupID,
              factoryID: monthlyCropDetail.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
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
                              value={monthlyCropDetail.groupID}
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
                              value={monthlyCropDetail.factoryID}
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
                              value={monthlyCropDetail.routeID}
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
                                size='small'
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                size='small'
                              >
                                Search
                            </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box minWidth={1050}>
                        {monthlyCropData.length > 0 ?
                          <TableContainer >
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align={'center'}>Year</TableCell>
                                  <TableCell align={'center'}>Route Name</TableCell>
                                  <TableCell align={'center'}>Crop Amount (KG)</TableCell>
                                  <TableCell align={'center'}>Customer Count</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {monthlyCropData.map((data, index) => (
                                  <TableRow key={index}>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {monthlyCropDetail.year === "" ? (moment(new Date()).format('YYYY') -1): monthlyCropDetail.year-1}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.routeName}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.cropWeight}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.customerCount}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableRow>
                                <TableCell align={'center'}><b>Total</b></TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                 <b> {totalCrop}</b></TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {totalCustomer} </b>
                                </TableCell>
                              </TableRow>
                            </Table>
                          </TableContainer> : null}
                      </Box>
                      {monthlyCropData.length > 0 ?
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
                            documentTitle={"Crop Forecast Monthly Report"}
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
                              monthlyCropData={monthlyCropData} searchData={selectedSearchValues}
                              totalCrop={totalCrop} totalCustomer={totalCustomer} monthlyCropDetail={monthlyCropDetail}
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
  )
}

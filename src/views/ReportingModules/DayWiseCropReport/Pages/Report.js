import React, { useState, useEffect, Fragment, useRef} from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, TableCell,
  Table, TableHead, TableRow, TableBody, TableContainer, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import _ from 'lodash';
import CreatePDF from './CreatePDF';
import ReactToPrint from "react-to-print";
import { LoadingComponent } from 'src/utils/newLoader';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import TablePagination from '@material-ui/core/TablePagination';
import { KeyboardDatePicker } from "@material-ui/pickers";

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

// const [dailyCropData, setDayWiseCropData] = useState([]);

const screenCode = 'DAYWISECROPREPORT';

export default function DayWiseCropReport(props) {
  const [title, setTitle] = useState("Day Wise Crop Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(0);
  const [FactoryList, setFactoryList] = useState([]);
  const [routeList, setRouteList] = useState();
  const [dayWiseCropSupplyInput, setDayWiseCropSupplyInput] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    registrationNumber: ''
  });
  const [dayWiseCropSupplyDetails, setDayWiseCropSupplyDetails] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    routeName: "0",
    groupName: "0",
    factoryName: "0",
    startDate: '',
    endDate: '',
    registrationNumber: ''
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const componentRef = useRef();
  const [csvHeaders, SetCsvHeaders] = useState([])
  const [columnNames, setColumnNames] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [dayWiseCropSupplyInput.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID());
  }, [dayWiseCropSupplyInput.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAYWISECROPREPORT');

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

    setDayWiseCropSupplyInput({
      ...dayWiseCropSupplyInput,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(dayWiseCropSupplyInput.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routes = await services.getRoutesForDropDown(dayWiseCropSupplyInput.factoryID);
    setRouteList(routes);
  }

  async function createFile() {

    var file = await createDataForExcel(dayWiseCropSupplyDetails);
    var settings = {
      sheetName: 'Day Wise Crop Report',
      fileName: 'Day Wise Crop Report - ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName + ' ' + selectedSearchValues.startDate + ' ' + selectedSearchValues.endDate,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Day Wise Crop Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]

    xlsx(dataA, settings);
  }

  async function GetDetails() {
    let dayWiseCropDetailsModel = {
      groupID: parseInt(dayWiseCropSupplyInput.groupID),
      factoryID: parseInt(dayWiseCropSupplyInput.factoryID),
      routeID: parseInt(dayWiseCropSupplyInput.routeID),
      registrationNumber: dayWiseCropSupplyInput.registrationNumber,
      startDate: moment(startDate.toString()).format().split('T')[0],
      endDate: moment(endDate.toString()).format().split('T')[0],
    }


    getSelectedDropdownValuesForReport(dayWiseCropDetailsModel);

      const response = await services.GetDayWiseCropReportDetails(dayWiseCropDetailsModel);
      let total = 0 ;
      if (response.statusCode == "Success" && response.data != null) {
        setDayWiseCropSupplyDetails(response.data); 
        setColumnNames(response.data);
        createDataForExcel(response.data);
        response.data.forEach(x => {
           total = total + parseFloat(x.netWeight)
        });
        setTotalAmount(total);
        
        if (response.data.length == 0) {
          alert.error("No records to display");
        }
      }
      else {
        alert.error(response.message);
      }
  }

  async function createDataForExcel(array) {
    var res = [];

    if (array != null) {
      array.map(x => {
        var vr = {
          'Date': x.cropCollectedDate,
          'Route Name': x.routeName,
          'Reg No': x.registrationNumber,
          'Supplier Name': x.name,
          'Leaf Type': x.collectionTypeName,
          'Net Amount (KG)': x.netWeight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        }
        res.push(vr);
      });
      res.push({});
      var vr = {
        'Date': 'Total',
        'Net Amount (KG)': totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }
      res.push(vr);

      res.push({});
      var vr = {
        'Date': 'Group :' + selectedSearchValues.groupName,
        'Route Name': 'Factory :' + selectedSearchValues.factoryName,
        'Reg No': selectedSearchValues.routeName == undefined ? 'Route : All Routes' : 'Route : ' + selectedSearchValues.routeName,

      }
      res.push(vr);

      var vr = {
        'Date': selectedSearchValues.registrationNumber == "" ? 'Reg No : All Customers' : 'Reg No : ' + selectedSearchValues.registrationNumber,
        'Route Name': 'From Date :' + selectedSearchValues.startDate,
        'Reg No': 'To date :' + selectedSearchValues.endDate
      }
      res.push(vr);

    }
    return res;
  }


  async function createColumn(startDate, iterations) {
    let dayWiseCropSupplyDetailsArray = [];
    var loopDate = startDate;
    dayWiseCropSupplyDetailsArray.push("Route Name");
    dayWiseCropSupplyDetailsArray.push("Registration Number");
    dayWiseCropSupplyDetailsArray.push("Customer Name");
    dayWiseCropSupplyDetailsArray.push(startDate);
    [...Array(iterations)].map((_, i) => {

      loopDate = moment(loopDate, "YYYY-MM-DD").add(1, 'days').format('YYYY-MM-DD');
      dayWiseCropSupplyDetailsArray.push(loopDate);

    });
    dayWiseCropSupplyDetailsArray.push("Total");
    return dayWiseCropSupplyDetailsArray;
  }

  async function createData(data, columnNames) {
    var res = [];

    if (columnNames != null) {
      data.forEach(x => {
        var dataRow = []

        dataRow.push(x.routeName);
        dataRow.push(x.registrationNumber);
        dataRow.push(x.name);

        columnNames.forEach(item => {
          var object = _.find(x.groupList, o => moment(o.cropCollectedDate).format('YYYY-MM-DD') === item);
          var value = object ? object.cropWeight : 0;
          dataRow.push(value);
        });

        res.push(dataRow);
      });
    }

    return res;
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
    setDayWiseCropSupplyInput({
      ...dayWiseCropSupplyInput,
      [e.target.name]: value
    });
    setDayWiseCropSupplyDetails([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(searchForm.startDate.toString()).format().split('T')[0]
    var endDate = moment(searchForm.endDate.toString()).format().split('T')[0]
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
      startDate: [startDate],
      endDate: [endDate],
      registrationNumber: searchForm.registrationNumber,
      routeName: routeList[searchForm.routeID]
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
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: dayWiseCropSupplyInput.groupID,
              factoryID: dayWiseCropSupplyInput.factoryID,
              startDate: startDate,
              endDate: endDate
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                startDate: Yup.date().required('From Date is Required'),
                endDate: Yup.date().required('To Date is Required'),
              })
            }
            onSubmit={() => trackPromise(GetDetails())}
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
                    <CardHeader title={cardTitle(title)} />
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
                              value={dayWiseCropSupplyInput.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'
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
                              value={dayWiseCropSupplyInput.factoryID}
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
                              value={dayWiseCropSupplyInput.routeID}
                              variant="outlined"
                              id="routeID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routeList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Registration Number
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="registrationNumber"
                              onChange={(e) => handleChange(e)}
                              value={dayWiseCropSupplyInput.registrationNumber}
                              variant="outlined"
                              id="registrationNumber"
                              size='small'
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date" style={{ marginBottom: '-8px' }}>From Date *</InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name='startDate'
                                id='startDate'
                                value={startDate}
                                maxDate={new Date()}
                                onChange={(e) => {
                                  setStartDate(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date" style={{ marginBottom: '-8px' }}>To Date *</InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name='startDate'
                                id='startDate'
                                value={endDate}
                                onChange={(e) => {
                                  setEndDate(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                                maxDate={new Date()}
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
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
        <Box minWidth={1050}>
                        {dayWiseCropSupplyDetails.length > 0 ?
                          <TableContainer >
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align={'center'}>Date</TableCell>
                                  <TableCell align={'center'}>Route Name</TableCell>
                                  <TableCell align={'center'}>Reg No</TableCell>
                                  <TableCell align={'center'}>Supplier Name</TableCell>
                                  <TableCell align={'center'}>Leaf Type</TableCell>
                                  <TableCell align={'center'}>Net Amount</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {dayWiseCropSupplyDetails.slice(page * limit, page * limit + limit).map((data, index) => (
                                  <TableRow key={index}>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.cropCollectedDate.split("T")[0]}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.routeName}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.registrationNumber}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.name}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.collectionTypeName}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.netWeight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableRow>
                                <TableCell align={'center'}><b>Total</b></TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                </TableCell>
                              </TableRow>
                            </Table>
                            <TablePagination
                              component="div"
                              count={dayWiseCropSupplyDetails.length}
                              onChangePage={handlePageChange}
                              onChangeRowsPerPage={handleLimitChange}
                              page={page}
                              rowsPerPage={limit}
                              rowsPerPageOptions={[5, 10, 25]}
                            />

                      {dayWiseCropSupplyDetails.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={createFile}
                          >
                            EXCEL
                          </Button>

                          <ReactToPrint
                            documentTitle={"Daily Crop Report"}
                            trigger={() => <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}

                            >
                              PDF
                            </Button>}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF ref={componentRef}
                              dayWiseCropSupplyDetails={dayWiseCropSupplyDetails} searchData={selectedSearchValues}
                              total={totalAmount} dayWiseCropSupplyInput={dayWiseCropSupplyInput}
                            />
                          </div>
                        </Box> : null}
                          </TableContainer> : null}
                      </Box>
      </Page>
    </Fragment>
  );
}

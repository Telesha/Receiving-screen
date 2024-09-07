import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader,
  MenuItem
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
import { LoadingComponent } from 'src/utils/newLoader';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker } from "@material-ui/pickers";
import { Paper, TableFooter } from '@material-ui/core';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import ReactToPrint from 'react-to-print';
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
  stickyColumn: {
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: 1
  },
  tableContainer: {
    overflowX: 'auto',
    maxWidth: '100%'
  },
  table: {
    minWidth: 650
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: 1000
  },
  stickyFooter: {
    position: 'sticky',
    bottom: 0,
    left: 0,
    backgroundColor: 'white',
    zIndex: 1000
  },
  totalCell: {
    position: 'sticky',
    bottom: 0,
    left: 0,
    backgroundColor: 'white',
    zIndex: 1000
  },
  subCell: {
    position: 'sticky',
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 900
  }
}));

const screenCode = 'CROPSUPPLYMONTHLYREPORT';

export default function CropSupplyMonthlyReport(props) {
  const [title, setTitle] = useState("Crop Supply Monthly Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routeList, setRouteList] = useState();
  const [totalAmount, setTotalAmount] = useState(0);
  const [cropSupplyInput, setCropSupplyInput] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    registrationNumber: ''
  });
  const [cropSupplyDetails, setCropSupplyDetails] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    routeName: "0",
    registrationNumber: "0",
    startDate: ''

  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const componentRef = useRef();
  const navigate = useNavigate();
  const alert = useAlert();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const [columnNames, setColumnNames] = useState([]);
  const options = {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
  }, [cropSupplyInput.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID());
  }, [cropSupplyInput.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCROPSUPPLYMONTHLYREPORT');

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

    setCropSupplyInput({
      ...cropSupplyInput,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(cropSupplyInput.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routes = await services.getRoutesForDropDown(cropSupplyInput.factoryID);
    setRouteList(routes);
  }

  async function GetDetails() {
    var month = new Date(startDate).getUTCMonth() + 1;
    var year = new Date(startDate).getUTCFullYear();

    let model = {
      groupID: parseInt(cropSupplyInput.groupID),
      factoryID: parseInt(cropSupplyInput.factoryID),
      routeID: parseInt(cropSupplyInput.routeID),
      registrationNumber: cropSupplyInput.registrationNumber,
      applicableMonth: month.toString(),
      applicableYear: year.toString(),
    }

    getSelectedDropdownValuesForReport(model);

    var dateCount = getDifferenceInDays();
    if (dateCount > 60) {
      alert.error("Selected Date range Exceed 60 Days");
    }
    else {
      const response = await services.GetCropSupplyMonthlyReportDetails(model);
      if (response.statusCode == "Success" && response.data != null) {
        response.data.forEach(x => {
          let total = 0;
          x.groupList.forEach(y => {
            total += y.cropWeight;
            x.totalAmount = total;
          })
        });

        const dateStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        var cropDetails = await createColumn(dateStart, dateCount);
        createData(response.data, cropDetails);
        setColumnNames(cropDetails);
        setCropSupplyDetails(response.data);
        if (response.data.length == 0) {
          alert.error("No records to display");
        }
      }
      else {
        alert.error(response.message);
      }
    }
  }

  const date = [];
  cropSupplyDetails.forEach(row => {
    row.groupList.forEach(item => {
      if (!date.includes(item.cropCollectedDate)) {
        date.push(item.cropCollectedDate);
      }
    });
  });

  async function createColumn(startDate, iterations) {
    let cropSupplyDetailsArray = [];
    var loopDate = startDate;
    cropSupplyDetailsArray.push("Route Name");
    cropSupplyDetailsArray.push("Registration Number");
    cropSupplyDetailsArray.push("Customer Name");
    [...Array(iterations)].map((_, i) => {

      loopDate = moment(loopDate, "YYYY-MM-DD").add(1, 'days').format('YYYY-MM-DD');
      cropSupplyDetailsArray.push(loopDate);

    });
    cropSupplyDetailsArray.push("Total");
    return cropSupplyDetailsArray;
  }

  async function createFile() {
    var file = [];
    var totalColumn = {};
    var totalRow = {};

    for (const obj of cropSupplyDetails) {
      let tModel = {
        'Route Name': obj.routeName,
        'Registration Number': obj.registrationNumber,
        'Customer Name': obj.name
      };
      for (const crop of obj.groupList) {
        const dateKey = crop.cropCollectedDate.split("T")[0];
        const weight = Math.floor(parseFloat(crop.cropWeight));
        if (weight > 0) {
          tModel[dateKey] = weight;
          totalColumn[dateKey] = Math.floor(parseFloat(totalColumn[dateKey] || 0) + weight);
        }
      }
      file.push(tModel);
    }

    Object.keys(totalColumn).forEach(key => {
      totalRow[key] = 0;
      file.forEach(tModel => {
        if (tModel[key] !== undefined) {
          totalRow[key] += tModel[key];
        }
      });
    });

    Object.keys(totalRow).forEach(key => {
      totalColumn[key] = 0;
      file.forEach(tModel => {
        if (tModel[key] !== undefined) {
          totalColumn[key] += tModel[key];
        }
      });
    });

    file.forEach(row => {
      let total = 0;
      for (const key in row) {
        if (key !== 'Route Name' && key !== 'Registration Number' && key !== 'Customer Name') {
          total += Math.floor(parseFloat(row[key])) || 0;
        }
      }
      row['Total'] = total;
    });

    let totalSum = 0;
    file.forEach(row => {
      totalSum += row['Total'] || 0;
    });
    totalRow['Total'] = totalSum;

    file.push({
      'Route Name': 'Total',
      'Registration Number': '',
      'Customer Name': '',
      ...totalRow
    });

    file.push({});
    let filterData = {
      'Route Name': 'Group: ' + GroupList[cropSupplyInput.groupID],
      'Registration Number': 'Factory: ' + FactoryList[cropSupplyInput.factoryID]
    }
    file.push(filterData);

    let filterDate = {
      'Route Name': 'Applicable Month: ' + selectedSearchValues.startDate,
    }
    file.push(filterDate);

    var settings = {
      sheetName: ('Crop Supply Monthly Report').substring(0, 30),
      fileName: 'Crop Supply Monthly Report - ' + ' ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName + '  ' + selectedSearchValues.startDate,
      writeOptions: {}
    };

    let tempcsvHeaders = [];
    columnNames.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'Crop Supply Monthly Report',
        columns: tempcsvHeaders,
        content: file
      }
    ];

    xlsx(dataA, settings);
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

  function getDifferenceInDays() {
    const dateStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const dateEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    const diffInMs = Math.abs(new Date(dateEnd.toString()) - new Date(dateStart.toString()));
    return diffInMs / (1000 * 60 * 60 * 24);
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
    setCropSupplyInput({
      ...cropSupplyInput,
      [e.target.name]: value
    });
    setCropSupplyDetails([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
      routeName: searchForm.routeID === 0 ? "All Routes" : routeList[searchForm.routeID],
      registrationNumber: searchForm.registrationNumber === '' ? "All Registration Numbers" : [searchForm.registrationNumber],
      startDate: moment(startDate).format("YYYY-MMM"),
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
              groupID: cropSupplyInput.groupID,
              factoryID: cropSupplyInput.factoryID,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
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
                              value={cropSupplyInput.groupID}
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
                              value={cropSupplyInput.factoryID}
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
                              value={cropSupplyInput.routeID}
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
                              value={cropSupplyInput.registrationNumber}
                              variant="outlined"
                              id="registrationNumber"
                              size='small'
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>

                          <Grid item md={3} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="inline"
                                openTo="month"
                                views={["year", "month"]}
                                label="Year and Month"
                                helperText="Select applicable month *"
                                value={startDate}
                                onChange={(e) => {
                                  setStartDate(e)
                                }}
                                size='small'
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

                        <Box minWidth={1050} hidden={cropSupplyDetails.length === 0}>
                          <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                            <Table size="small" aria-label="sticky table" Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell className={classes.stickyHeader} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Route
                                  </TableCell>
                                  <TableCell className={classes.stickyHeader} style={{ left: 113, border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Reg.No
                                  </TableCell>
                                  <TableCell className={classes.stickyHeader} style={{ left: 210, border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Customer
                                  </TableCell>
                                  {date.sort((a, b) => new Date(a) - new Date(b)).map((row, index) => (
                                    <TableCell key={index} className={`${classes.stickyHeader, classes.stickyColumn}`} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                                      {moment(row).format('DD')}
                                    </TableCell>
                                  ))}
                                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">Total </TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {cropSupplyDetails.map((row, index) => (
                                  <TableRow key={index}>
                                    <TableCell className={classes.stickyColumn} style={{ border: "1px solid black", fontSize: "15px" }} align="left" component="th" scope="row">
                                      {row.routeName}
                                    </TableCell>
                                    <TableCell className={classes.stickyColumn} style={{ left: 113, border: "1px solid black", fontSize: "15px" }} align="left" component="th" scope="row">
                                      {row.registrationNumber}
                                    </TableCell>
                                    <TableCell className={classes.stickyColumn} style={{ left: 210, border: "1px solid black", fontSize: "15px" }} align="left" component="th" scope="row">
                                      {row.name}
                                    </TableCell>
                                    {date.sort((a, b) => new Date(a) - new Date(b)).map((rows, index) => {
                                      var found = row.groupList.find(x => x.cropCollectedDate == rows);
                                      return (
                                        <TableCell key={index} style={{ border: "1px solid black" }} align="center">
                                          {found === undefined ? '-' : (found.cropWeight).toLocaleString('en-US', options)}
                                        </TableCell>
                                      );
                                    })}
                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold" }} align="left" component="th" scope="row">
                                      {(row.totalAmount).toLocaleString('en-US', options)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableFooter>
                                <TableRow>
                                  <TableCell className={classes.totalCell} colSpan={3} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                                    Total
                                  </TableCell>
                                  {date.map((day, index) => {
                                    const dayTotal = cropSupplyDetails.reduce((total, row) => {
                                      const found = row.groupList.find(x => x.cropCollectedDate === day);
                                      return total + (found ? parseFloat(found.cropWeight) : 0);
                                    }, 0).toLocaleString('en-US', options);

                                    return (
                                      <TableCell className={classes.subCell} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center" key={index}>
                                        {dayTotal !== 0 ? dayTotal.toLocaleString('en-US', options) : '-'}
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell className={classes.subCell} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="left">
                                    {cropSupplyDetails.reduce((total, row) => total + parseFloat(row.totalAmount), 0).toLocaleString('en-US', options)}
                                  </TableCell>
                                </TableRow>
                              </TableFooter>
                            </Table>
                          </TableContainer>
                        </Box>
                      </CardContent>

                      {cropSupplyDetails.length > 0 ?
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

                          {<ReactToPrint
                            documentTitle={'Crop Supply Monthly Report'}
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
                          />}
                          <style>
                          </style>
                          {<div hidden={true}>
                            <CreatePDF
                              ref={componentRef}
                              selectedSearchValues={selectedSearchValues}
                              searchDate={cropSupplyInput}
                              cropSupplyDetails={cropSupplyDetails}
                              total={totalAmount}
                              monthDays={date}
                            />
                          </div>}

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

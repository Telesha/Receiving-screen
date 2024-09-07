import React, { useState, useEffect, Fragment } from 'react';
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

const screenCode = 'CROPSUPPLYPATTERNREPORT';

export default function CropSupplyPatternReport(props) {
  const [title, setTitle] = useState("Crop Supply Pattern Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routeList, setRouteList] = useState();
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
    startDate: '',
    endDate: ''
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
  const [columnNames, setColumnNames] = useState([]);

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
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCROPSUPPLYPATTERNREPORT');

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
    let model = {
      groupID: parseInt(cropSupplyInput.groupID),
      factoryID: parseInt(cropSupplyInput.factoryID),
      routeID: parseInt(cropSupplyInput.routeID),
      registrationNumber: cropSupplyInput.registrationNumber,
      startDate: moment(startDate.toString()).format().split('T')[0],
      endDate: moment(endDate.toString()).format().split('T')[0],
    }

    getSelectedDropdownValuesForReport(model);

    var dateCount = getDifferenceInDays();
    if (dateCount > 60) {
      alert.error("Selected Date range Exceed 60 Days");
    }
    else {
      const response = await services.GetCropSupplyPatternReportDetails(model);
      if (response.statusCode == "Success" && response.data != null) {
        var cropDetails = await createColumn(model.startDate, dateCount);
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

  async function createColumn(startDate, iterations) {
    let cropSupplyDetailsArray = [];
    var loopDate = startDate;
    cropSupplyDetailsArray.push("Route Name");
    cropSupplyDetailsArray.push("Registration Number");
    cropSupplyDetailsArray.push("Customer Name");
    cropSupplyDetailsArray.push(startDate);
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
        tModel[dateKey] = (parseFloat(crop.cropWeight));

        totalColumn[dateKey] = (parseFloat(totalColumn[dateKey] || 0) + (crop.cropWeight || 0));
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

    file.forEach(row => {
      let total = 0;
      for (const key in row) {
        if (key !== 'Route Name' && key !== 'Registration Number' && key !== 'Customer Name') {
          total += (parseFloat(row[key])) || 0;
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
      'Route Name': 'From Date: ' + moment(startDate.toString()).format().split('T')[0],
      'Registration Number': 'To Date: ' + moment(endDate.toString()).format().split('T')[0]
    }
    file.push(filterDate);

    var settings = {
      sheetName: ('Crop Supply Pattern Report').substring(0, 30),
      fileName: 'Crop Supply Pattern Report - ' + ' ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName + '  ' + selectedSearchValues.startDate + ' - ' + selectedSearchValues.endDate,
      writeOptions: {}
    };

    let tempcsvHeaders = [];
    columnNames.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'Crop Supply Pattern Report',
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
    var dateStart = moment(startDate.toString()).format('MM/DD/YYYY').split('T')[0]
    var dateEnd = moment(endDate.toString()).format('MM/DD/YYYY').split('T')[0]
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
    var startDate = moment(searchForm.startDate.toString()).format().split('T')[0]
    var endDate = moment(searchForm.endDate.toString()).format().split('T')[0]
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
      startDate: [startDate],
      endDate: [endDate]
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

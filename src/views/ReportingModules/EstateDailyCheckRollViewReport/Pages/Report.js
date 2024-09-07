import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Collapse, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import Chip from '@material-ui/core/Chip';
import ClearIcon from '@material-ui/icons/Clear';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import moment from 'moment';
import _, { result } from 'lodash';
import CheckIcon from '@material-ui/icons/Check';
import authService from '../../../../utils/permissionAuth';
import { useNavigate } from 'react-router-dom';
import tokenService from '../../../../utils/tokenDecoder';

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
  row: {
    marginTop: '1rem'
  },
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecordAndNew: {
    backgroundColor: "#FFBE00"
  },
  colorRecord: {
    backgroundColor: "green",
  }

}));

const screenCode = 'ROUTESUMMARYREPORT';

export default function DailyCheckRollReport(props) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Daily Check Roll View")
  const classes = useStyles();
  const [groups, setGroups] = useState([]);
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [factories, setFactories] = useState();
  const [routes, setRoutes] = useState();
  const [tableHide, setTableHide] = useState(true);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [routeSummaryDetails, setRouteSummaryDetails] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0',
    collectedDate: new Date()
  });
  const agriGenERPEnum = new AgriGenERPEnum();
  const [collectedDate, handleFromcollectedDate] = useState();
  const [routeSummaryData, setRouteSummaryData] = useState([]);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const componentRef = useRef();
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: '0',
    estateName: '0',
    divisionName: '0',
    collectedDate: ''
  });
  const [fullDayCount, setFullDayCount] = useState(0);
  const [halfDayCount, setHalfDayCount] = useState(0);

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermissions());
  }, []);

  useEffect(() => {
    trackPromise(getEstateDetailsByGroupID());
  }, [routeSummaryDetails.groupID]);

  useEffect(() => {
    if (routeSummaryDetails.estateID > 0) {
      trackPromise(getDivisionDetailsByEstateID());
    }
  }, [routeSummaryDetails.estateID]);

  useEffect(() => {
    if (routeSummaryDetails.groupID > 0) {
      trackPromise(getFactoriesForDropDown());
    }
  }, [routeSummaryDetails.groupID]);

  useEffect(() => {
    if (routeSummaryDetails.factoryID > 0) {
      trackPromise(
        getRoutesByFactoryID()
      )
    }
  }, [routeSummaryDetails.factoryID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWROUTESUMMARYREPORT');

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
    setRouteSummaryDetails({
      ...routeSummaryDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var estate = await services.getEstateDetailsByGroupID(routeSummaryDetails.groupID);
    setEstates(estate);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(routeSummaryDetails.estateID);
    setDivisions(response);
  }
  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(routeSummaryDetails.groupID);
    setFactories(factory);
  }

  async function getRoutesByFactoryID() {
    const route = await services.getRoutesForDropDown(routeSummaryDetails.factoryID);
    setRoutes(route);
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  async function GetDetail() {
    let model = {
      groupID: parseInt(routeSummaryDetails.groupID),
      estateID: parseInt(routeSummaryDetails.estateID),
      divisionID: parseInt(routeSummaryDetails.divisionID),
      collectedDate: moment(collectedDate).format('').split('T')[0]
    }

    const response = await services.GetDailyCheckRollViewDetail(model);
    let newRes = _.cloneDeep(response);
    var result = [];

    newRes.forEach(x => {
      var sessionName;
      if (x.sessionID === agriGenERPEnum.SessionNames.Morning) {
        sessionName = "Morning";
      } else if (x.sessionID === agriGenERPEnum.SessionNames.Noon) {
        sessionName = "Noon";
      } else if (x.sessionID === agriGenERPEnum.SessionNames.Evening) {
        sessionName = "Evening";
      } else if (x.sessionID === agriGenERPEnum.SessionNames.All) {
        sessionName = "All";
      }

      var duplicateDate = result.find(y => parseInt(y.employeeID) == parseInt(x.employeeID)
        && y.fieldName == x.fieldName && y.gangName == x.gangName
      );
      if (duplicateDate) {
        duplicateDate[sessionName] = x.amount
        duplicateDate.fullName = x.fullName;
        duplicateDate.employeeType = x.employeeType;
        duplicateDate.jobType = x.jobType;
        duplicateDate.workType = x.workType;
        duplicateDate.employeeID = x.employeeID;
        duplicateDate.total = duplicateDate.total + x.amount;
        duplicateDate.countFullDay == 1 ? setFullDayCount(fullDayCount + 1) : setHalfDayCount(halfDayCount + 1);
        duplicateDate.fieldName = x.fieldName;
        duplicateDate.gangName = x.gangName;
        duplicateDate.sessionID = x.sessionID;
        duplicateDate.collectedDate = x.collectedDate;
      }
      else {
        result.push({
          [sessionName]: x.amount,
          fullName: x.fullName,
          employeeType: x.employeeType,
          jobType: x.jobType,
          workType: x.workType,
          employeeID: x.employeeID,
          total: x.amount,
          countFullDay: x.dayType,
          fieldName: x.fieldName,
          gangName: x.gangName,
          sessionID: x.sessionID,
          dayOT: x.dayOT,
          collectedDate: x.collectedDate,
          netPay: x.amount * x.netKiloRate,
          overKiloPay: x.dayOT * x.overKiloRate,
          totalPay: x.amount * x.netKiloRate + x.dayOT * x.overKiloRate,
        });
      }
    });

    setRouteSummaryData(result);
    setTableHide(false);

    getSelectedDropdownValuesForReport(model);
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'EmployeeID': x.employeeID,
          'FullName': x.fullName,
          'EmployeeType': x.employeeType == agriGenERPEnum.EmployeeType.Register ? "Register" : "Unregister",
          'JobType': getjobTypeusingjobID(x.jobType),
          'WorkType': x.workType == agriGenERPEnum.EmployeeWorkTypeID.DivisionLabour ? "Division Labour" : "Lent Labour",
          'FieldName': x.fieldName,
          'GangName': x.gangName,
          'Amount': x.total,
          'DayOT': x.dayOT,
          'NetPay': x.netPay,
          'OverKiloPay': x.overKiloPay,
          'TotalPay': x.totalPay,
          'Morning Session': x.morning > 0 ? x.morning : "-------",
          'Noon Session': x.noon > 0 ? x.noon : "-------",
          'Evening Session': x.evening > 0 ? x.evening : "-------",
          'All Sessions': x.all > 0 ? x.all : "-------",
        }
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(routeSummaryData);
    var settings = {
      sheetName: 'Daily Check Roll View Report',
      fileName: 'Daily Check Roll View Report ' + routeSummaryDetails.groupID + ' - ' + routeSummaryDetails.estateID + '  ' + routeSummaryDetails.divisionID + ' - ' + routeSummaryDetails.collectedDate,
      writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Daily Check Roll View Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  async function Clear() {
    setTableHide(true);
    setRouteSummaryDetails([]);
  }

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setRouteSummaryDetails({
      ...routeSummaryDetails,
      [e.target.name]: value
    });
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var collectedDate = moment(searchForm.collectedDate.toString()).format().split('T')[0]
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: groups[searchForm.groupID],
      estateName: estates[searchForm.estateID],
      divisionName: divisions[searchForm.divisionID],
      collectedDate: [collectedDate]
    });
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

  function getjobTypeusingjobID(type) {
    if (type == agriGenERPEnum.GetjobTypeUsingJobID.Cash) {
      return "Cash";
    } else if (type == agriGenERPEnum.GetjobTypeUsingJobID.Kilo) {
      return "Kilo";
    } else if (type == agriGenERPEnum.GetjobTypeUsingJobID.General) {
      return "General";
    } else {
      return "RSM";
    }
  }

  function checkSessions(value) {
    if (value == null) {
      return <ClearIcon style={{ color: "red" }} />
    } else {
      return <CheckIcon style={{ color: "green" }} />
    }
  }


  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: routeSummaryDetails.groupID,
              estateID: routeSummaryDetails.estateID,
              divisionID: routeSummaryDetails.divisionID,
              collectedDate: routeSummaryDetails.collectedDate
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required')
              })
            }
            onSubmit={() => trackPromise(GetDetail())}
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
                        <Grid container spacing={4}>
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
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={routeSummaryDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={routeSummaryDetails.estateID}
                              variant="outlined"
                              id="estateID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.divisionID && errors.divisionID)}
                              fullWidth
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={routeSummaryDetails.divisionID}
                              variant="outlined"
                              id="divisionID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="collectedDate">
                              Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.collectedDate && errors.collectedDate)}
                                helperText={touched.collectedDate && errors.collectedDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="collectedDate"
                                id="collectedDate"
                                size='small'
                                value={collectedDate}
                                onChange={(e) => {
                                  handleFromcollectedDate(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="secondary"
                                variant="contained"
                                type="button"
                                onClick={() => trackPromise(Clear())}
                                size='small'
                              >
                                Cancel
                              </Button>
                              &nbsp;
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
                        <br /> <br /> <br />
                        <div hidden={tableHide}>
                          {(routeSummaryData.length > 0) ?
                            <Grid item xs={12}>
                              <TableContainer >
                                <Table className={classes.table} aria-label="caption table">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Emp No</TableCell>
                                      <TableCell>Emp Name</TableCell>
                                      <TableCell>Emp Type</TableCell>
                                      <TableCell>Job Type</TableCell>
                                      <TableCell>Work Type</TableCell>
                                      <TableCell>Feild Name</TableCell>
                                      <TableCell>Gang Name</TableCell>
                                      <TableCell>Amount(Kg)</TableCell>
                                      <TableCell>OT(Kg)</TableCell>
                                      <TableCell>Net Pay</TableCell>
                                      <TableCell>OT Pay</TableCell>
                                      <TableCell>Total Pay</TableCell>
                                      <TableCell>Morning Session</TableCell>
                                      <TableCell>Noon Session</TableCell>
                                      <TableCell>Evening Session</TableCell>

                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {routeSummaryData.map((rowData, index) => (
                                      <TableRow key={index}>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.employeeID)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.fullName)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.employeeType == agriGenERPEnum.EmployeeType.Register ? "Register" : "Unregister")}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {getjobTypeusingjobID(rowData.jobType)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.workType == agriGenERPEnum.EmployeeWorkTypeID.DivisionLabour ? "Division Labour" : "Lent Labour")}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.fieldName)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.gangName)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.total)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.dayOT)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.netPay)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.overKiloPay)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.totalPay)}
                                        </TableCell>
                                        {rowData.sessionID == agriGenERPEnum.SessionNames.All && rowData.total != null ?
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            <CheckIcon style={{ color: "green" }} />
                                          </TableCell>
                                          : <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {checkSessions(rowData["morning"])}
                                          </TableCell>
                                        }
                                        {rowData.sessionID == agriGenERPEnum.SessionNames.All && rowData.total != null ?
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            <CheckIcon style={{ color: "green" }} />
                                          </TableCell>
                                          : <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {checkSessions(rowData["noon"])}
                                          </TableCell>
                                        }
                                        {rowData.sessionID == agriGenERPEnum.SessionNames.All && rowData.total != null ?
                                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            <CheckIcon style={{ color: "green" }} />
                                          </TableCell>
                                          : <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {checkSessions(rowData["evening"])}
                                          </TableCell>
                                        }
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                            : null}
                        </div>

                      </CardContent>
                      <div hidden={tableHide}>

                        <Box display="flex" p={2} >
                          <Chip
                            label={"Full Day Count : " + fullDayCount}
                            clickable
                            color="primary"
                            variant="outlined"
                            size='small'
                          />
                          &nbsp;
                          <Chip
                            label={"Half Day Count :" + halfDayCount}
                            clickable
                            color="primary"
                            variant="outlined"
                            size='small'
                          />
                        </Box>

                        {routeSummaryData.length > 0 ?
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
                              documentTitle={"Daily Check Roll Details Report"}
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
                                routeSummaryData={routeSummaryData}
                                searchData={selectedSearchValues}
                              />
                            </div>

                            <div>&nbsp;</div>
                          </Box>
                          : null}

                      </div>
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

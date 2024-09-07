import React, { useState, useEffect, Fragment, useRef } from 'react';
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
  Paper,
  TextField,
  MenuItem,
  InputLabel,
  TableFooter
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik, validateYupSchema } from 'formik';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import tokenService from '../../../../utils/tokenDecoder';
import * as Yup from 'yup';
import { useAlert } from 'react-alert';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import xlsx from 'json-as-xlsx';
import CreatePDF from './CreatePDF';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

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
  }, table: {
    minWidth: 1050,
    position: 'relative',
    overflowX: 'auto',
  },
  stickyHeader: {
    position: 'sticky',
    left: 0,
    backgroundColor: 'white',
  },
  stickyColumn: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    backgroundColor: 'white',
  },
}));

const screenCode = 'SUNDRYCASHATTENDANCEREPORT';

export default function PluckingSundryAttendanceReport(props) {
  const [title, setTitle] = useState('Sundry Cash Attendance Report');
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState();
  const [divisions, setDivisions] = useState();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [isTableHide, setIsTableHide] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sundryCashAttendanceDetails, setSundryCashAttendanceDetails] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: 0,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date().toISOString().substring(0, 10)
  });
  const [attendanceDetailsData, setAttendanceDetailsData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    estateID: 0,
    groupID: 0,
    divisionID: 0,
    startDate: "",
    endDate: ""
  });
  const componentRef = useRef();
  const navigate = useNavigate();
  const alert = useAlert();

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getEstateDetailsByGroupID());
  }, [sundryCashAttendanceDetails.groupID]);

  useEffect(() => {
    trackPromise(getDivisionDetailsByEstateID());
  }, [sundryCashAttendanceDetails.estateID]);

  useEffect(() => {
    setSundryCashAttendanceDetails({
      ...sundryCashAttendanceDetails,
      endDate: endDay
    })
  }, [sundryCashAttendanceDetails.startDate])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWSUNDRYCASHATTENDANCEREPORT'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    trackPromise(getGroupsForDropdown());

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setSundryCashAttendanceDetails({
      ...sundryCashAttendanceDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(
      sundryCashAttendanceDetails.groupID
    );
    setEstates(response);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(
      sundryCashAttendanceDetails.estateID
    );
    setDivisions(response);
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

  async function getDetails() {
    let model = {
      groupID: parseInt(sundryCashAttendanceDetails.groupID),
      estateID: parseInt(sundryCashAttendanceDetails.estateID),
      divisionID: parseInt(sundryCashAttendanceDetails.divisionID),
      startDate: (sundryCashAttendanceDetails.startDate),
      endDate: (sundryCashAttendanceDetails.endDate),
    };
    getAttendanceDetailsForReport(model);
    const response = await services.getAttendanceDetailsForReport(model);
    if (response.data.length != 0) {
      //For cal number of days
      response.data.forEach(x => {
        let tot = 0;
        x.sundryCashAttendanceOutputModel.forEach(y => {
          tot = tot + (y.date ? 1 : 0)
          x.totDays = tot;
        })
      })
      //For cal half days, holidays
      response.data.forEach(x => {
        let tot = 0;
        x.sundryCashAttendanceOutputModel.forEach(y => {
          tot += y.dayType
          x.totCol = tot;
        })
      })
      setAttendanceDetailsData(response.data);
      setIsTableHide(false);

    } else {
      setIsTableHide(true);
      alert.error('No records to display');
    }
  }

  async function createDataForExcel(array) {
    var result = [];
    var dayTotals = {};
    var totalAmountSum = 0;

    if (array != null) {
      array.forEach(x => {
        x.sundryCashAttendanceOutputModel.forEach(y => {
          const day = moment(y.date).format('DD');
          dayTotals[day] = dayTotals[day] || 0;
        });
      });

      array.forEach(x => {
        var row = {
          empName: x.empName,
          empNo: x.empNo,
          totCol: x.totCol,
        };

        Object.keys(dayTotals).forEach(day => {
          const attendance = x.sundryCashAttendanceOutputModel.find(y => moment(y.date).format('DD') === day);
          if (attendance) {
            row[day] = attendance.dayType || 0;
            dayTotals[day] += attendance.dayType || 0;
            totalAmountSum += attendance.dayType || 0;
          } else {
            row[day] = 'AB';
          }
        });
        result.push(row);
      });

      result.push({});
      dayTotals['empNo'] = 'Total';
      dayTotals['totCol'] = totalAmountSum;
      result.push(dayTotals);
      result.push({});

      result.push({
        empNo: "Group: " + selectedSearchValues.groupName,
        empName: "Estate: " + selectedSearchValues.estateName
      });
      result.push({
        empNo: "Division: " + selectedSearchValues.divisionName,
        // empName: "JobType: " + (selectedSearchValues.jobTypeName == undefined && selectedSearchValues.jobTypeID == 3 ? 'JobType: Sundry' : 'JobType: Plucking')
      });
      result.push({
        empNo: "Start Date: " + selectedSearchValues.startDate,
        empName: "End Date: " + selectedSearchValues.endDate
      });
    }
    return result;
  }


  async function createFile() {
    var file = await createDataForExcel(attendanceDetailsData);
    var settings = {
      sheetName: 'Sundry Cash Attendance',
      fileName: 'Sundry Cash Attendance' + ' - ' + selectedSearchValues.startDate + ' / ' + selectedSearchValues.endDate,
      writeOptions: {}
    }

    let keys = date
    let tempcsvHeaders = csvHeaders;
    tempcsvHeaders.push({ label: 'Employee No', value: 'empNo' })
    tempcsvHeaders.push({ label: 'Employee Name', value: 'empName' })
    keys.forEach((sitem, i) => {
      tempcsvHeaders.push({ label: moment(sitem).format('MMMM DD'), value: moment(sitem).format('DD') })
    })
    tempcsvHeaders.push({ label: 'Total', value: 'totCol' })

    let dataA = [
      {
        sheet: 'Sundry Cash Attendance',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  async function ClearTable() {
    clearState();
  }

  function clearState() {
    if (permissionList.isFactoryFilterEnabled) {
      setSundryCashAttendanceDetails({
        ...sundryCashAttendanceDetails,
        divisionID: 0,
        estateID: 0,
        groupID: 0,
      });
    } else {
      setSundryCashAttendanceDetails({
        ...sundryCashAttendanceDetails,
        divisionID: 0,
      });
    }
    setIsTableHide(true);
    setAttendanceDetailsData([]);
  }

  function clearStateByDivision() {
    setSundryCashAttendanceDetails({
      ...sundryCashAttendanceDetails,
      //jobTypeID: 0,
    });
    setIsTableHide(true);
    setAttendanceDetailsData([]);
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
    setSundryCashAttendanceDetails({
      ...sundryCashAttendanceDetails,
      [e.target.name]: value
    });
  }

  function getAttendanceDetailsForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: groups[searchForm.groupID],
      estateName: estates[searchForm.estateID],
      divisionName: divisions[searchForm.divisionID],
      startDate: searchForm.startDate,
      endDate: searchForm.endDate
    });
  }

  const date = [];
  attendanceDetailsData.forEach(row => {
    row.sundryCashAttendanceOutputModel.forEach(item => {
      if (!date.includes(item.date)) {
        date.push(item.date);
      }
    });
  });

  const specificMonth = sundryCashAttendanceDetails.startDate ? new Date(sundryCashAttendanceDetails.startDate) : new Date();
  const firstDay = specificMonth.toISOString().split('T')[0];
  const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
  const lastDay = lastDayOfMonth.toISOString().split('T')[0];
  const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: sundryCashAttendanceDetails.groupID,
              estateID: sundryCashAttendanceDetails.estateID,
              divisionID: sundryCashAttendanceDetails.divisionID,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Select a Group'),
                estateID: Yup.number().required('Estate is required').min("1", 'Select a Estate'),
                divisionID: Yup.number().required('Division is required').min("1", 'Select a Division'),
              })
            }
            onSubmit={() => trackPromise(getDetails())}
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
                        <Grid container spacing={4}>
                          <Grid item md={4} xs={12}>
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
                              value={sundryCashAttendanceDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              size="small"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.estateID && errors.estateID
                              )}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={sundryCashAttendanceDetails.estateID}
                              variant="outlined"
                              id="estateID"
                              size="small"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Division *
                            </InputLabel>
                            <TextField
                              select
                              fullWidth
                              error={Boolean(
                                touched.divisionID && errors.divisionID
                              )}
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              onChange={e => handleChange(e)}
                              value={sundryCashAttendanceDetails.divisionID}
                              variant="outlined"
                              id="divisionID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="startDate">
                              From Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="startDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={sundryCashAttendanceDetails.startDate}
                              variant="outlined"
                              id="startDate"
                              size='small'
                              onKeyPress={(e) => {
                                if (e.key >= '0' && e.key <= '9') {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="endDate">
                              To Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="endDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={sundryCashAttendanceDetails.endDate}
                              variant="outlined"
                              id="endDate"
                              size='small'
                              InputProps={{
                                inputProps: {
                                  min: firstDay,
                                  max: lastDay,
                                },
                              }}
                              onKeyPress={(e) => {
                                if (e.key >= '0' && e.key <= '9') {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </Grid>

                          <br /> <br />

                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="outlined"
                                type="submit"
                                onClick={ClearTable}
                              >
                                Clear
                              </Button>
                            </Box>
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>

                        <br /> <br /><br />

                        <Box minWidth={1000} hidden={isTableHide}>
                          <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                            <Table
                              size="small"
                              aria-label="sticky table"
                              Table
                              stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Employee NO
                                  </TableCell>
                                  <TableCell style={{ left: 113, border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Employee Name
                                  </TableCell>
                                  {date.sort((a, b) => new Date(a) - new Date(b)).map((row, index) => {
                                    return (
                                      <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                                        {moment(row).format('MMMM DD')}
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">Total </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {attendanceDetailsData.map((row, index) => {
                                  return (
                                    <TableRow key={index}>
                                      <TableCell className={`${classes.stickyColumn}`} style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                        {row.empNo.padStart(4, '0')}
                                      </TableCell>
                                      <TableCell className={`${classes.stickyColumn}`} style={{ left: 113, border: "1px solid black" }} align="left" component="th" scope="row">
                                        {row.empName}
                                      </TableCell>
                                      {date.sort((a, b) => new Date(a) - new Date(b)).map((rows, index) => {
                                        var found = row.sundryCashAttendanceOutputModel.find(x => x.date == rows)
                                        return (
                                          <TableCell style={{ border: "1px solid black", backgroundColor: found === undefined ? '#ffcccc' : 'inherit', }} align="center" >
                                            {found == undefined ? 'AB' : found.dayType}
                                          </TableCell>
                                        );
                                      })}
                                      <TableCell style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                        {row.totCol}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>

                              <TableFooter>
                                <TableRow>
                                  <TableCell className={`${classes.stickyColumn}`} colSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                                    Total
                                  </TableCell>
                                  {date.sort((a, b) => new Date(a) - new Date(b)).map((day, index) => {
                                    const dayTotal = attendanceDetailsData.reduce((total, row) => {
                                      const found = row.sundryCashAttendanceOutputModel.find(x => x.date === day);
                                      return total + (found ? parseFloat(found.dayType) : 0);
                                    }, 0);

                                    return (
                                      <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center" key={index}>
                                        {dayTotal !== 0 ? dayTotal : '-'}
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="left">
                                    {attendanceDetailsData.reduce((total, row) => total + parseFloat(row.totCol), 0)}
                                  </TableCell>
                                </TableRow>
                              </TableFooter>

                            </Table>
                          </TableContainer>
                        </Box>
                      </CardContent>

                      <div hidden={isTableHide}>
                        {attendanceDetailsData.length > 0 ? (
                          <Box
                            display="flex"
                            justifyContent="flex-end"
                            p={2}
                            hidden={isTableHide}
                          >
                            <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorRecord}
                              onClick={() => createFile()}
                              size="small"
                            >
                              EXCEL
                            </Button>

                            <ReactToPrint
                              documentTitle={"Sundry Cash Attendance Report" + ' -' + selectedSearchValues.year + '-' + selectedSearchValues.month}
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
                            <style>
                              {`
                                @page {
                                size: A4 landscape; /* Set the size and orientation here */
                                margin: 20mm; /* Adjust the margin as needed */
                                }
                             `}
                            </style>
                            <div hidden={true}>
                              <CreatePDF ref={componentRef}
                                attendanceDetailsData={attendanceDetailsData}
                                selectedSearchValues={selectedSearchValues}
                                monthDays={date}
                              />
                            </div>

                            <div>&nbsp;</div>
                          </Box>
                        ) : null}
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
  );
}

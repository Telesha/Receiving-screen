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
import { Formik } from 'formik';
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
import Autocomplete from '@material-ui/lab/Autocomplete';

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
    zIndex: 1,
    backgroundColor: 'white',
  },
  stickyColumn: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    backgroundColor: 'white',
  },
}));

const screenCode = 'PLUCKINGSUNDRYATTENDANCEREPORT';

export default function PluckingSundryAttendanceReport() {
  const [title, setTitle] = useState('Plucking & Sundry Attendance Report');
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState();
  const [divisions, setDivisions] = useState();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [isTableHide, setIsTableHide] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [jobTypes, SetJobTypes] = useState(['Plucking & Sundry', 'Plucking', 'Sundry']);
  const [jobTypes1, SetJobTypes1] = useState(['Plucking Genaral & Machine Plucking Genaral', 'Plucking Genaral', 'Machine Plucking Genaral']);
  const [PluckingJobType, setPluckingJobType] = useState([]);
  const [pluckingSundryAttendanceDetails, setPluckingSundryAttendanceDetails] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    jobTypeID:0,
    pluckingJobTypeID:0,
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
    jobTypeID:0,
    pluckingJobTypeID:0,
    startDate: "",
    endDate: ""
  });
  const componentRef = useRef();
  const navigate = useNavigate();
  const alert = useAlert();

  useEffect(() => {
    trackPromise(getPermission());
  }, []);
  useEffect(() => {
    trackPromise(getEstateDetailsByGroupID());
  }, [pluckingSundryAttendanceDetails.groupID]);

  useEffect(() => {
    setAttendanceDetailsData([]);
  }, [pluckingSundryAttendanceDetails.estateID, pluckingSundryAttendanceDetails.jobTypeID, pluckingSundryAttendanceDetails.divisionID, pluckingSundryAttendanceDetails.month, pluckingSundryAttendanceDetails.year,pluckingSundryAttendanceDetails.pluckingJobTypeID]);

  useEffect(() => {
    setPluckingSundryAttendanceDetails({
      ...pluckingSundryAttendanceDetails,
      divisionID: '0',
      jobTypeID: '0',
      pluckingJobTypeID:'0',
      month: '',
      year: ''
    })
    setSelectedDate(new Date())
  }, [pluckingSundryAttendanceDetails.estateID]);

  useEffect(() => {
    setPluckingSundryAttendanceDetails({
      ...pluckingSundryAttendanceDetails,
      jobTypeID: '0',
      pluckingJobTypeID:'0',
      month: '',
      year: ''
    })
    setSelectedDate(new Date())
  }, [pluckingSundryAttendanceDetails.divisionID]);

  useEffect(() => {
    trackPromise(getDivisionDetailsByEstateID());
  }, [pluckingSundryAttendanceDetails.estateID]);

  useEffect(() => {
    setPluckingSundryAttendanceDetails({
      ...pluckingSundryAttendanceDetails,
      endDate: endDay
    })
  }, [pluckingSundryAttendanceDetails.startDate])

  useEffect(() => {
    if (pluckingSundryAttendanceDetails.jobTypeID === "3" || pluckingSundryAttendanceDetails.jobTypeID === "") {
        setPluckingJobType(0);
    } else {
        setPluckingJobType(2);
    }
}, [pluckingSundryAttendanceDetails.jobTypeID]);

  useEffect(() => {
    if ((pluckingSundryAttendanceDetails.jobTypeID =='2')) {
      trackPromise(GetPluckingJobTypesByJobTypeID());
    }
  }, [pluckingSundryAttendanceDetails.jobTypeID]);

  useEffect(() => {
    if (parseInt(pluckingSundryAttendanceDetails.jobTypeID) !== parseInt("2")) {
      setPluckingJobType(0);
      
    setPluckingSundryAttendanceDetails({
      ...pluckingSundryAttendanceDetails,
      pluckingJobTypeID : 0
    });
    }
  }, [pluckingSundryAttendanceDetails.jobTypeID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWPLUCKINGSUNDRYATTENDANCEREPORT'
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

    setPluckingSundryAttendanceDetails({
      ...pluckingSundryAttendanceDetails,
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
      pluckingSundryAttendanceDetails.groupID
    );
    setEstates(response);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(
      pluckingSundryAttendanceDetails.estateID
    );
    setDivisions(response);
  }

  async function GetPluckingJobTypesByJobTypeID() {
    var response = await services.GetPluckingJobTypesByJobTypeID();
    setPluckingJobType(response);
  };

 
  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }
  
 
  async function getDetails() {
    let model = {
      groupID: parseInt(pluckingSundryAttendanceDetails.groupID),
      estateID: parseInt(pluckingSundryAttendanceDetails.estateID),
      divisionID: parseInt(pluckingSundryAttendanceDetails.divisionID),
      jobTypeID: parseInt(pluckingSundryAttendanceDetails.jobTypeID),
      pluckingJobTypeID: parseInt(pluckingSundryAttendanceDetails.pluckingJobTypeID),
      startDate: (pluckingSundryAttendanceDetails.startDate),
      endDate: (pluckingSundryAttendanceDetails.endDate),
    };
    getAttendanceDetailsForReport(model);
    const response = await services.getAttendanceDetailsForReport(model);
    if (response.data.length != 0) {
      response.data.forEach(x => {
        let tot = 0;
        x.pluckingSundryAttendanceOutputModel.forEach(y => {
          tot = tot + (y.date ? 1 : 0)
          x.totDays = tot;
        })
      })
      response.data.forEach(x => {
        let tot = 0;
        x.pluckingSundryAttendanceOutputModel.forEach(y => {
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
        x.pluckingSundryAttendanceOutputModel.forEach(y => {
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
          const attendance = x.pluckingSundryAttendanceOutputModel.filter(y => moment(y.date).format('DD') === day);
          if (attendance.length > 0) {
            const dayTotal = attendance.reduce((sum, record) => sum + (parseFloat(record.dayType) || 0), 0);
            row[day] = dayTotal || 0;
            dayTotals[day] += dayTotal || 0;
            totalAmountSum += dayTotal || 0;
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
        empNo: "JobType: " + (selectedSearchValues.jobTypeID == 2? "Plucking" : selectedSearchValues.jobTypeID == 3 ? "Sundry" : "All Jobs"),
        empName: "Plucking Job Type: " + (selectedSearchValues.jobTypeID === 2) && (selectedSearchValues.pluckingJobTypeID == 3? "Plucking - General" : selectedSearchValues.pluckingJobTypeID == 6? "Machine Plucking - General" : ""),
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
      sheetName: 'Plucking & Sundry Attendance',
      fileName: 'Plucking & Sundry Attendance' + ' - ' + selectedSearchValues.startDate + ' - ' + selectedSearchValues.endDate,
      writeOptions: {}
    }

    let keys = date
    let tempcsvHeaders = csvHeaders;
    tempcsvHeaders.push({ label: 'Employee No', value: 'empNo' })
    tempcsvHeaders.push({ label: 'Employee Name', value: 'empName' })
    keys.forEach((sitem, i) => {
      tempcsvHeaders.push({ label: '' + moment(sitem).format('MMMM DD'), value: moment(sitem).format('DD') })
    })
    tempcsvHeaders.push({ label: 'Total', value: 'totCol' })

    let dataA = [
      {
        sheet: 'Plucking & Sundry Attendance',
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
    setPluckingSundryAttendanceDetails({
      ...pluckingSundryAttendanceDetails,
      divisionID: 0,
      jobTypeID: 0
      
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
    setPluckingSundryAttendanceDetails({
      ...pluckingSundryAttendanceDetails,
      [e.target.name]: value
    });
  }

  function getAttendanceDetailsForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: groups[searchForm.groupID],
      estateName: estates[searchForm.estateID],
      divisionName: divisions[searchForm.divisionID],
      jobTypeID: searchForm.jobTypeID,
      pluckingJobTypeID: searchForm.pluckingJobTypeID,
      startDate: searchForm.startDate,
      endDate: searchForm.endDate,
      jobTypeName: jobTypes[searchForm.jobTypeID],
      PluckingjobTypeName: jobTypes1[searchForm.pluckingJobTypeID]
    });
  }

  const date = [];
  attendanceDetailsData.forEach(row => {
    row.pluckingSundryAttendanceOutputModel.forEach(item => {
      if (!date.includes((item.date).split('T')[0])) {
        date.push((item.date).split('T')[0]);
      }
    });
  });

  const specificMonth = pluckingSundryAttendanceDetails.startDate ? new Date(pluckingSundryAttendanceDetails.startDate) : new Date();
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
              groupID: pluckingSundryAttendanceDetails.groupID,
              estateID: pluckingSundryAttendanceDetails.estateID,
              divisionID: pluckingSundryAttendanceDetails.divisionID,
              jobTypeID: pluckingSundryAttendanceDetails.jobTypeID,
              pluckingJobTypeID:pluckingSundryAttendanceDetails.pluckingJobTypeID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Select a Group'),
                estateID: Yup.number().required('Estate is required').min("1", 'Select a Estate'),
                divisionID: Yup.number().required('Division is required').min("1", 'Select a Division'),
              })
            }
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
                              value={pluckingSundryAttendanceDetails.groupID}
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
                              value={pluckingSundryAttendanceDetails.estateID}
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
                              value={pluckingSundryAttendanceDetails.divisionID}
                              variant="outlined"
                              id="divisionID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="jobTypeID">
                              Job Type
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.jobTypeID && errors.jobTypeID
                              )}
                              fullWidth
                              helperText={touched.jobTypeID && errors.jobTypeID}
                              name="jobTypeID"
                              onBlur={handleBlur}
                              size="small"
                              onChange={e => {
                                handleChange(e);
                              }}
                              value={pluckingSundryAttendanceDetails.jobTypeID}
                              variant="outlined"
                              id="jobTypeID"
                            >
                              <MenuItem value={'0'}>All Jobs</MenuItem>
                              <MenuItem value={'2'}>Plucking</MenuItem>
                              <MenuItem value={'3'}>Sundry</MenuItem> 
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12} hidden={pluckingSundryAttendanceDetails.jobTypeID === '3' || pluckingSundryAttendanceDetails.jobTypeID === '0'|| pluckingSundryAttendanceDetails.jobTypeID === ""}> 
                            <InputLabel shrink id="pluckingJobTypeID">
                              Plucking Job Type 
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.pluckingJobTypeID && errors.pluckingJobTypeID)}
                              fullWidth
                              helperText={touched.pluckingJobTypeID && errors.pluckingJobTypeID}
                              name="pluckingJobTypeID"
                               onChange={(e) => handleChange(e)}
                              value={pluckingSundryAttendanceDetails.pluckingJobTypeID }
                              variant="outlined"
                              id="pluckingJobTypeID"
                              size='small'
                              onBlur={handleBlur}
                              disabled={pluckingSundryAttendanceDetails.jobTypeID == 3 || 0 }
                            >   
                              <MenuItem value="0">All Plucking Jobs</MenuItem>
                              {generateDropDownMenu(PluckingJobType)}
                            </TextField>
                          </Grid>
                          
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="startDate">
                              From Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="startDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={pluckingSundryAttendanceDetails.startDate}
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
                              value={pluckingSundryAttendanceDetails.endDate}
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
                          <br />
                          <br />
                          <Grid item md={12} xs={12}>
                            <Grid container justify="flex-end">
                              <Box pr={3}>
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
                                  onClick={() => trackPromise(getDetails())}
                                >
                                  Search
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </Grid>
                        <br />
                        <br />
                        <br />
                        <Box minWidth={1050} hidden={attendanceDetailsData.length == 0}>
                          <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                            <Table
                              className={classes.table}
                              size="small"
                              aria-label="sticky table"
                              Table
                              stickyHeader>
                              <TableHead style={{ position: "sticky", top: 0, zIndex: 1000, background: "white" }}>
                                <TableRow>
                                  <TableCell className={classes.sticky} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Employee Number
                                  </TableCell>
                                  <TableCell className={classes.sticky} style={{ left: 113, border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Employee Name
                                  </TableCell>
                                  {date.sort((a, b) => new Date(a) - new Date(b)).map((row, index) => {
                                    return (
                                      <TableCell className={`${classes.stickyHeader}`} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                                        {moment(row).format('MMMM DD')}
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Total
                                  </TableCell>
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
                                      {date.map((rows, index) => {
                                        var found = row.pluckingSundryAttendanceOutputModel.filter(x => ((x.date).split('T')[0]) == ((rows).split('T')[0]));
                                        var totalAmount = found.reduce((total, record) => total + (record.dayType ), 0)
                                        return (
                                          <TableCell
                                            style={{ border: "1px solid black", backgroundColor: found.length === 0 ? '#ffcccc' : 'inherit', }}
                                            align="center" >
                                            {found.length === 0 ? 'AB' : totalAmount}
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
                                  {date.map((day, index) => {
                                    const dayTotal = attendanceDetailsData.reduce((total, row) => {
                                      const found = row.pluckingSundryAttendanceOutputModel.filter(x => ((x.date).split('T')[0]) == ((day).split('T')[0]));
                                      const daySum = found.reduce((sum, entry) => sum + parseFloat(entry.dayType), 0);
                                      return total + daySum;
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
                              documentTitle={"Plucking & Sundry Attendance Report"}
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
    </Fragment >
  );
}

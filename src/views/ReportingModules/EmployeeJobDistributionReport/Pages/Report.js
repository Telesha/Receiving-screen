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
import tokenService from '../../../../utils/tokenDecoder';
import * as Yup from 'yup';
import { useAlert } from 'react-alert';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import xlsx from 'json-as-xlsx';
import CreatePDF from './CreatePDF';
import TableHead from '@material-ui/core/TableHead';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
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

const screenCode = 'EMPJOBDISTRIBUTIONREPORT';

export default function EmployeeJobDistributionReport(props) {
  const [title, setTitle] = useState('Employee-Wise Job Distribution Report');
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState();
  const [divisions, setDivisions] = useState();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTableHide, setIsTableHide] = useState(true);
  const [jobTypes1, SetJobTypes1] = useState(['Plucking Genaral & Machine Plucking Genaral & Plucking Cash Kilo & Machine Plucking Cash Kilo', 'Plucking Genaral', 'Machine Plucking Genaral','Plucking Cash Kilo' ,'Machine Plucking Cash Kilo']);
  const [jobTypes, SetJobTypes] = useState(['Plucking & Sundry', 'Plucking', 'Sundry']);
  const [PluckingJobType, setPluckingJobType] = useState([]);

  const [employeeWiseJobDistributionDetails, setEmployeeWiseJobDistributionDetails] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    jobTypeID: 0,
    pluckingJobTypeID:0,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date().toISOString().substring(0, 10)
  });
  const [jobDistributionData, setJobDistributionData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    estateID: 0,
    groupID: 0,
    divisionID: 0,
    jobTypeID: 0,
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
  }, [employeeWiseJobDistributionDetails.groupID]);

  useEffect(() => {
    trackPromise(getDivisionDetailsByEstateID());
  }, [employeeWiseJobDistributionDetails.estateID]);

  useEffect(() => {
    setEmployeeWiseJobDistributionDetails({
      ...employeeWiseJobDistributionDetails,
      endDate: endDay
    })
  }, [employeeWiseJobDistributionDetails.startDate])
///
  useEffect(() => {
    setEmployeeWiseJobDistributionDetails({
      ...employeeWiseJobDistributionDetails,
      divisionID: '0',
      jobTypeID: '0',
      pluckingJobTypeID:'0',
      month: '',
      year: ''
    })
    setSelectedDate(new Date())
  }, [employeeWiseJobDistributionDetails.estateID]);

  useEffect(() => {
    setEmployeeWiseJobDistributionDetails({
      ...employeeWiseJobDistributionDetails,
      jobTypeID: '0',
      pluckingJobTypeID:'0',
      month: '',
      year: ''
    })
    setSelectedDate(new Date())
  }, [employeeWiseJobDistributionDetails.divisionID]);
///
  useEffect(() => {
    if (employeeWiseJobDistributionDetails.jobTypeID === "3" || employeeWiseJobDistributionDetails.jobTypeID === "") {
        setPluckingJobType(0);
    } else {
        setPluckingJobType(2);
    }
}, [employeeWiseJobDistributionDetails.jobTypeID]);

useEffect(() => {
  if (parseInt(employeeWiseJobDistributionDetails.jobTypeID) !== parseInt("2")) {
    setPluckingJobType(0);
    
    setEmployeeWiseJobDistributionDetails({
    ...employeeWiseJobDistributionDetails,
    pluckingJobTypeID : 0
  });
  }
}, [employeeWiseJobDistributionDetails.jobTypeID]);

useEffect(() => {
  if ((employeeWiseJobDistributionDetails.jobTypeID =='2')) {
    trackPromise(GetPluckingJobTypesByJobTypeID());
  }
}, [employeeWiseJobDistributionDetails.jobTypeID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWEMPJOBDISTRIBUTIONREPORT'
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

    setEmployeeWiseJobDistributionDetails({
      ...employeeWiseJobDistributionDetails,
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
      employeeWiseJobDistributionDetails.groupID
    );
    setEstates(response);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(
      employeeWiseJobDistributionDetails.estateID
    );
    setDivisions(response);
  }

  async function GetPluckingJobTypesByJobTypeID() {
    var response = await services.GetPluckingJobTypesByJobTypeID(employeeWiseJobDistributionDetails.jobTypeID);
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
      groupID: parseInt(employeeWiseJobDistributionDetails.groupID),
      estateID: parseInt(employeeWiseJobDistributionDetails.estateID),
      divisionID: parseInt(employeeWiseJobDistributionDetails.divisionID),
      jobTypeID: parseInt(employeeWiseJobDistributionDetails.jobTypeID),
      pluckingJobTypeID: parseInt(employeeWiseJobDistributionDetails.pluckingJobTypeID),
      startDate: (employeeWiseJobDistributionDetails.startDate),
      endDate: (employeeWiseJobDistributionDetails.endDate),
    };
    getAttendanceDetailsForReport(model);
    const response = await services.getAttendanceDetailsForReport(model);
    if (response.data.length != 0) {
      response.data.forEach(x => {
        let tot = 0;
        x.empJobDistributionOutputModel.forEach(y => {
          tot += y.dayType
          x.totCol = tot;
        })
      })

      setJobDistributionData(response.data);
      setIsTableHide(false);

    } else {
      setIsTableHide(true);
      alert.error('No records to display'); 
    }
  }

  async function createDataForExcel(array) {
    var result = [];
    var dayTotals = [];
    var totalAmountSum = 0;

    if (array != null) {
      dayTotals['empNo'] = 'Total'
      array.forEach(x => {
        x.empJobDistributionOutputModel.forEach(y => {
          const day = moment(y.date).format('DD').toString().padStart(2, '0');
          var duplicateDate = result.find(y => y.empNo === x.empNo);

          if (duplicateDate) {
            duplicateDate[day] = y.jobCode;
            duplicateDate['T_' + day] = y.dayType == 0 ? '-' : y.dayType;
            duplicateDate.empNo = x.empNo;
            duplicateDate.empName = x.empName;
            duplicateDate.totCol = x.totCol;
          }
          else {
            result.push({
              empNo: x.empNo,
              empName: x.empName,
              [day]: y.jobCode,
              ['T_' + day]: y.dayType == 0 ? '-' : y.dayType,
              totCol: x.totCol
            });
          }
          dayTotals['T_' + day] = (dayTotals['T_' + day] || 0) + y.dayType;
          totalAmountSum += y.dayType;
          dayTotals['totCol'] = totalAmountSum;
        })
      });
      result.push({});
      result.push(dayTotals);
      result.push({});
      var vr = {
        empNo: "Group: " + selectedSearchValues.groupName,
        empName: "Estate: " + selectedSearchValues.estateName
      }
      result.push(vr);

      var vr = {
        empNo: "Division: " + selectedSearchValues.divisionName,
        empNo: "JobType: " + (selectedSearchValues.jobTypeID == 2? "Plucking" : selectedSearchValues.jobTypeID == 3 ? "Sundry" : "All Jobs"),
        empName: "Plucking JobType: " + (selectedSearchValues.jobTypeID === 2) && (selectedSearchValues.pluckingJobTypeID == 3? "Plucking - General" : selectedSearchValues.pluckingJobTypeID == 5? "Plucking - CashKilo" : selectedSearchValues.pluckingJobTypeID == 6? "Machine Plucking - General" : selectedSearchValues.pluckingJobTypeID == 7 ? "Machine Plucking - CashKilo" : "")
      } 
      result.push(vr);

      var vr = {
        empNo: "Start Date: " + selectedSearchValues.startDate,
        empName: "End Date: " + selectedSearchValues.endDate
      } 
      result.push(vr);
    }
    return result;
  }

  async function createFile() {
    var file = await createDataForExcel(jobDistributionData);
    var settings = {
      sheetName: 'Employee-Wise Job Distribution',
      fileName: 'Employee-Wise Job Distribution' + ' - ' + selectedSearchValues.startDate + ' / ' + selectedSearchValues.endDate,
      writeOptions: {}
    }

    let keys = date
    let tempcsvHeaders = csvHeaders;
    tempcsvHeaders.push({ label: 'Employee No', value: 'empNo' })
    tempcsvHeaders.push({ label: 'Employee Name', value: 'empName' })
    keys.forEach((sitem, i) => {
      tempcsvHeaders.push({ label: 'Job ' + moment(sitem).format('DD'), value: moment(sitem).format('DD') })
      tempcsvHeaders.push({ label: 'Day ' + moment(sitem).format('DD'), value: 'T_' + moment(sitem).format('DD') })
    })
    tempcsvHeaders.push({ label: 'Total', value: 'totCol' })

    let dataA = [
      {
        sheet: 'Employee-Wise Job Distribution',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  const date = [];
  jobDistributionData.forEach(row => {
    row.empJobDistributionOutputModel.forEach(item => {
      if (!date.includes((item.date).split('T')[0])) {
        date.push((item.date).split('T')[0]);
      }
    });
  });

  const specificMonth = employeeWiseJobDistributionDetails.startDate ? new Date(employeeWiseJobDistributionDetails.startDate) : new Date();
  const firstDay = specificMonth.toISOString().split('T')[0];
  const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
  const lastDay = lastDayOfMonth.toISOString().split('T')[0];
  const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];

  async function ClearTable() {
    clearState();
  }

  function clearState() {
    setEmployeeWiseJobDistributionDetails({
      ...employeeWiseJobDistributionDetails,
      divisionID: 0,
      jobTypeID: 0,
    });
    setIsTableHide(true);
    setJobDistributionData([]);
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
    setEmployeeWiseJobDistributionDetails({
      ...employeeWiseJobDistributionDetails,
      [e.target.name]: value
    });
    setIsTableHide(true);
    setJobDistributionData([]);
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
      jobTypeName: jobTypes[searchForm.jobTypeID - 1],
      jobTypeName: jobTypes1[searchForm.pluckingJobTypeID]
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: employeeWiseJobDistributionDetails.groupID,
              estateID: employeeWiseJobDistributionDetails.estateID,
              divisionID: employeeWiseJobDistributionDetails.divisionID,
              jobTypeID: employeeWiseJobDistributionDetails.jobTypeID,
              pluckingJobTypeID:employeeWiseJobDistributionDetails.pluckingJobTypeID,
              startDate: employeeWiseJobDistributionDetails.startDate,
              endDate: employeeWiseJobDistributionDetails.endDate
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
                              value={employeeWiseJobDistributionDetails.groupID}
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
                              value={employeeWiseJobDistributionDetails.estateID}
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
                              value={employeeWiseJobDistributionDetails.divisionID}
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
                              value={employeeWiseJobDistributionDetails.jobTypeID}
                              variant="outlined"
                              id="jobTypeID"
                            >
                              {/* <MenuItem value={'0'}>
                                --Select Job Type--
                              </MenuItem> */}
                              <MenuItem value={'0'}>All</MenuItem>
                              <MenuItem value={'2'}>Plucking</MenuItem>
                              <MenuItem value={'3'}>Sundry</MenuItem>
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12} hidden={employeeWiseJobDistributionDetails.jobTypeID === '3' || employeeWiseJobDistributionDetails.jobTypeID === '0'}> 
                            <InputLabel shrink id="pluckingJobTypeID">
                              Plucking Job Type 
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.pluckingJobTypeID && errors.pluckingJobTypeID)}
                              fullWidth
                              helperText={touched.pluckingJobTypeID && errors.pluckingJobTypeID}
                              name="pluckingJobTypeID"
                               onChange={(e) => handleChange(e)}
                              value={employeeWiseJobDistributionDetails.pluckingJobTypeID }
                              variant="outlined"
                              id="pluckingJobTypeID"
                              size='small'
                              onBlur={handleBlur}
                              disabled={employeeWiseJobDistributionDetails.jobTypeID == 3 || 0}
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
                              error={Boolean(touched.startDate && errors.startDate)}
                              helperText={touched.startDate && errors.startDate}
                              name="startDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={employeeWiseJobDistributionDetails.startDate}
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
                              error={Boolean(touched.endDate && errors.endDate)}
                              helperText={touched.endDate && errors.endDate}
                              name="endDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={employeeWiseJobDistributionDetails.endDate}
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
                        <Box minWidth={1050} hidden={isTableHide}>
                          <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                            <Table size="small" aria-label="sticky table" Table stickyHeader>

                              <TableHead>
                                <TableRow>
                                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Employee NO
                                  </TableCell>
                                  <TableCell style={{ left: 112, border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Employee Name
                                  </TableCell>
                                  {date.sort((a, b) => new Date(a) - new Date(b)).map((row, index) => {
                                    return (
                                      <React.Fragment key={index}>
                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center" colSpan={2}>
                                          {moment(row).format('MMMM DD')}
                                        </TableCell>
                                      </React.Fragment>
                                    );
                                  })}
                                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">Total </TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {jobDistributionData.map((row, index) => {
                                  return (
                                    <TableRow key={index}>
                                      <TableCell className={`${classes.stickyColumn}`} style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                        {row.empNo.padStart(4, '0')}
                                      </TableCell>
                                      <TableCell className={`${classes.stickyColumn}`} style={{ left: 112, border: "1px solid black" }} align="left" component="th" scope="row">
                                        {row.empName}
                                      </TableCell>
                                      {date.sort((a, b) => new Date(a) - new Date(b)).map((rows, Dindex) => {
                                        var found = row.empJobDistributionOutputModel.find(x => ((x.date).split('T')[0]) == rows)
                                        return (
                                          <React.Fragment key={Dindex}>
                                            <TableCell style={{ border: "1px solid black" }} align="center" >
                                              {found == undefined ? '-' : found.jobCode}
                                            </TableCell>
                                            <TableCell style={{ border: "1px solid black" }} align="center" >
                                              {found == undefined ? '-' : found.dayType == 0 ? '-' : found.dayType}
                                            </TableCell>
                                          </React.Fragment>
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
                                    const dayTotal = jobDistributionData.reduce((total, row) => {
                                      const found = row.empJobDistributionOutputModel.find(x => ((x.date).split('T')[0]) === day);
                                      return total + (found ? parseFloat(found.dayType) : 0);
                                    }, 0);

                                    return (
                                      <React.Fragment key={index}>
                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center" colSpan={2}>
                                          {dayTotal !== 0 ? dayTotal : '-'}
                                        </TableCell>
                                      </React.Fragment>
                                    );
                                  })}
                                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="left">
                                    {jobDistributionData.reduce((total, row) => total + parseFloat(row.totCol), 0)}
                                  </TableCell>

                                </TableRow>
                              </TableFooter>

                            </Table>
                          </TableContainer>
                        </Box>
                      </CardContent>

                      <div hidden={isTableHide}>
                        {jobDistributionData.length > 0 ? (
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
                              documentTitle={"Employee-Wise Job Distribution Report"}
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
                                jobDistributionData={jobDistributionData}
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

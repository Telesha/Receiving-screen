import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
  MenuItem,
  Paper,
  TableFooter
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import { useAlert } from 'react-alert';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';

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
  colorCancel: {
    backgroundColor: 'red'
  },
  colorRecord: {
    backgroundColor: 'green'
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
  }
}));

const screenCode = 'WORKDISTRIBUTIONSUMMARYREPORT';

export default function WorkDistributionSummaryReport(props) {
  const today = new Date();
  const [title, setTitle] = useState('Work Distribution Summary Report');
  const classes = useStyles();
  const [workDistributionDetail, setWorkDistributionDetail] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date().toISOString().substring(0, 10),
    jobCategoryID: 0,
    jobCode: "0"
  });
  const [estateList, setEstateList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [divitionList, setDivision] = useState();
  const [jobCategories, setJobCategories] = useState([]);
  const [jobCodes, setJobCodes] = useState([]);
  const [workDistributionData, setWorkDistributionData] = useState([]);
  const [isTableHide, setIsTableHide] = useState(true);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const navigate = useNavigate();

  const [selectedSearchValues, setSelectedSearchValues] = useState({
    divisionID: "0",
    estateID: "0",
    groupID: "0",
    startDate: "",
    endDate: "",
    jobCategoryID: '',
    jobCode: "0"
  });
  const componentRef = useRef();
  const [totalAmount, setTotalAmount] = useState(0);
  const alert = useAlert();
  const [alertCount, setAlertCount] = useState({
    count: 0
  });

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
    setAlertCount({
      count: 1
    });
  }, []);

  useEffect(() => {
    getEstatesForDropdown();
    trackPromise(
      getEstatesForDropdown(workDistributionDetail.groupID)
    )
    setAlertCount({
      count: alertCount.count + 1
    });
  }, [workDistributionDetail.groupID]);

  useEffect(() => {
    trackPromise(getDivisionByEstateID(workDistributionDetail.estateID));
  }, [workDistributionDetail.estateID]);

  useEffect(() => {
    getJobCategoryDetailsByEstateID();
  }, [workDistributionDetail.estateID]);

  useEffect(() => {
    trackPromise(getDivisionByEstateID());
  }, [workDistributionDetail.divisionID]);

  useEffect(() => {
    const currentDate = new Date();
  }, []);

  useEffect(() => {
    getJobCodeDetailsByJobCategoryID();
  }, [workDistributionDetail.jobCategoryID]);

  useEffect(() => {
    setDate()
  }, []);

  useEffect(() => {
    setWorkDistributionDetail({
      ...workDistributionDetail,
      jobCategoryID: 0,
      jobCode: "0",
      year: new Date().getUTCFullYear().toString(),
      month: (today.getUTCMonth() + 1).toString().padStart(2, '0')
    })
  }, [workDistributionDetail.divisionID]);

  useEffect(() => {
    setWorkDistributionDetail({
      ...workDistributionDetail,
      jobCode: "0",
      year: new Date().getUTCFullYear().toString(),
      month: (today.getUTCMonth() + 1).toString().padStart(2, '0'),
    })
  }, [workDistributionDetail.jobCategoryID]);


  useEffect(() => {
    setWorkDistributionDetail({
      ...workDistributionDetail,
      year: new Date().getUTCFullYear().toString(),
      month: (today.getUTCMonth() + 1).toString().padStart(2, '0'),
    })
  }, [workDistributionDetail.jobCode]);

  useEffect(() => {
    setWorkDistributionDetail({
      ...workDistributionDetail,
      endDate: endDay
    })
  }, [workDistributionDetail.startDate])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWWORKDISTRIBUTIONSUMMARYREPORT'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setWorkDistributionDetail({
      ...workDistributionDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setWorkDistributionDetail({
      ...workDistributionDetail,
      [e.target.name]: value
    });
    setWorkDistributionData([]);
    setIsTableHide(true);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getEstatesForDropdown() {
    const estates = await services.getEstateDetailsByGroupID(workDistributionDetail.groupID);
    setEstateList(estates);
  }

  async function getDivisionByEstateID() {
    var response = await services.getDivisionByEstateID(workDistributionDetail.estateID);
    setDivision(response);
  };
  async function getJobCategoryDetailsByEstateID() {
    var response = await services.getJobCategoryDetailsByEstateID(workDistributionDetail.estateID);
    setJobCategories(response);
  };

  async function getJobCodeDetailsByJobCategoryID() {
    var response = await services.getJobCodeDetailsByJobCategoryID(workDistributionDetail.jobCategoryID);
    setJobCodes(response);
  };

  async function GetDetails() {
    let model = {
      GroupID: parseInt(workDistributionDetail.groupID) !== 0 ? parseInt(workDistributionDetail.groupID) : null,
      EstateID: parseInt(workDistributionDetail.estateID) !== 0 ? parseInt(workDistributionDetail.estateID) : null,
      DivisionID: parseInt(workDistributionDetail.divisionID) !== 0 ? parseInt(workDistributionDetail.divisionID) : null,
      jobCategoryID: parseInt(workDistributionDetail.jobCategoryID) !== 0 ? parseInt(workDistributionDetail.jobCategoryID) : null,
      jobCode: workDistributionDetail.jobCode !== "0" ? workDistributionDetail.jobCode : null,
      startDate: (workDistributionDetail.startDate),
      endDate: (workDistributionDetail.endDate)
    };
    getSelectedDropdownValuesForReport(model);

    const workDistributionSummaryData = await services.GetWorkDistributionSummaryReportDetails(model);

    if (workDistributionSummaryData.statusCode == 'Success' && workDistributionSummaryData.data != null) {
      setWorkDistributionData(workDistributionSummaryData.data)
      setIsTableHide(false);


    } else {
      alert.error('NO RECORDS TO DISPLAY!!');
      clearFields();
    }
  }

  const date = [];
  workDistributionData.forEach(row => {
    row.workDistributionSummaryReportModels.forEach(item => {
      if (!date.includes(item.date)) {
        date.push(item.date);
      }
    });
  });

  const specificMonth = workDistributionDetail.startDate ? new Date(workDistributionDetail.startDate) : new Date();
  const firstDay = specificMonth.toISOString().split('T')[0];
  const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
  const lastDay = lastDayOfMonth.toISOString().split('T')[0];
  const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];


  async function createDataForExcel(workDistributionData, jobTypes) {
    var result = [];
    var totalAttendanceSum = 0;

    if (workDistributionData != null) {
      workDistributionData.forEach((row) => {
        var rowData = {
          Division: row.divisionName,
        };
        var rowTotalAttendanceSum = 0;

        jobTypes.forEach((jobCode) => {
          const found = row.workDistributionSummaryReportModels.find((x) => x.jobCode === jobCode);
          rowData[jobCode] = found ? found.totalAttendancePerJobCode : '-';

          rowTotalAttendanceSum += found ? parseFloat(found.totalAttendancePerJobCode) : 0;
        });

        rowData['Total Mandays'] = rowTotalAttendanceSum;

        totalAttendanceSum += rowTotalAttendanceSum;
        result.push(rowData);
      });

      result.push({ Division: 'Total' });
      jobTypes.forEach((jobCode) => {
        const jobCodeTotal = workDistributionData.reduce((total, row) => {
          const found = row.workDistributionSummaryReportModels.find((x) => x.jobCode === jobCode);
          return total + (found ? parseFloat(found.totalAttendancePerJobCode) : 0);
        }, 0);

        result[result.length - 1][jobCode] = jobCodeTotal !== 0 ? jobCodeTotal : '-';
      });

      result[result.length - 1]['Total Mandays'] = totalAttendanceSum;
      result.push({});
      result.push({ 'Division': 'Group : ' + selectedSearchValues.groupID });
      result.push({ 'Division': 'Estate : ' + selectedSearchValues.estateID });
      result.push({ 'Division': 'Division : ' + (selectedSearchValues.divisionID !== undefined ? selectedSearchValues.divisionID : 'All Divisions') });
      result.push({ 'Division': 'Job Category : ' + (selectedSearchValues.jobCategoryID !== undefined ? selectedSearchValues.jobCategoryID : 'All Job Categories') });
      result.push({ 'Division': 'Job Code : ' + (selectedSearchValues.jobCode !== undefined ? selectedSearchValues.jobCode : 'All Job Codes') });
      result.push({ 'Division': 'Start Date : ' + selectedSearchValues.startDate });
      result.push({ 'Division': 'End Date : ' + selectedSearchValues.endDate });
    }

    return result;
  }

  async function createDataForExcel1(workDistributionData, jobTypes) {

    var result = [];
    var dayTotals = {};
    var totalAttendanceSum = 0;

    if (workDistributionData != null) {
      dayTotals['jobCode'] = 'Total';

      workDistributionData.forEach(row => {
        row.workDistributionSummaryReportModels.forEach(item => {

          const day = moment(item.date).format('DD');
          var duplicateDate = result.find(y => y.jobCode === item.jobCode);

          if (duplicateDate) {
            duplicateDate[day] = (item.attendance == undefined ? '-' : item.attendance);
            duplicateDate.totalAttendance = item.totalAttendancePerJobCode;
          } else {
            result.push({
              jobCode: item.jobCode,
              [day]: (item.attendance == undefined ? 'c' : item.attendance),
              totalAttendance: item.totalAttendancePerJobCode
            });
          }
          dayTotals[day] = (dayTotals[day] || 0) + parseFloat(item.attendance) || 0;
          totalAttendanceSum += parseFloat(item.attendance) || 0;
          dayTotals['totalAttendance'] = totalAttendanceSum;
        });
      });

      result.push(dayTotals);
      result.push({});

      result.push({});
      result.push({ 'jobCode': 'Group : ' + selectedSearchValues.groupID });
      result.push({ 'jobCode': 'Estate : ' + selectedSearchValues.estateID });
      result.push({ 'jobCode': 'Division : ' + (selectedSearchValues.divisionID !== undefined ? selectedSearchValues.divisionID : 'All Divisions') });
      result.push({ 'jobCode': 'Job Category : ' + (selectedSearchValues.jobCategoryID !== undefined ? selectedSearchValues.jobCategoryID : 'All Job Categories') });
      result.push({ 'jobCode': 'Job Code : ' + (selectedSearchValues.jobCode !== undefined ? selectedSearchValues.jobCode : 'All Job Codes') });
      result.push({ 'jobCode': 'Start Date : ' + selectedSearchValues.startDate });
      result.push({ 'jobCode': 'End Date : ' + selectedSearchValues.endDate });

    }

    return result;
  }

  async function createFile() {
    if (workDistributionDetail.divisionID === 0) {

      var file = await createDataForExcel(workDistributionData, jobTypes);
      var settings = {
        sheetName: 'Work Distribution Summary',
        fileName: 'Work Distribution Report - ' + selectedSearchValues.startDate + '/' + selectedSearchValues.endDate,
        writeOptions: {},
      };

      let tempcsvHeaders = [
        { label: 'Division', value: 'Division' },
        ...jobTypes.map((jobCode) => ({ label: jobCode, value: jobCode })),
        { label: 'Total Mandays', value: 'Total Mandays' },
      ];

      let dataA = [
        {
          sheet: 'Work Distribution Summary',
          columns: tempcsvHeaders,
          content: file,
        },
      ];
      xlsx(dataA, settings);
    } else {
      var file = await createDataForExcel1(workDistributionData);
      var settings = {
        sheetName: 'Work Distribution Report',
        fileName: 'Work Distribution Report - ' + selectedSearchValues.startDate + '/' + selectedSearchValues.endDate,
        writeOptions: {}
      }
      let keys = date;
      let tempcsvHeaders = [{ label: 'Job Code', value: 'jobCode' }];
      keys.forEach((sitem, i) => {
        tempcsvHeaders.push({ label: 'Day ' + moment(sitem).format('DD'), value: moment(sitem).format('DD') });
      });
      tempcsvHeaders.push({ label: 'Total', value: 'totalAttendance' });
      let dataA = [
        {
          sheet: 'Work Distribution Report',
          columns: tempcsvHeaders,
          content: file
        }
      ];
      xlsx(dataA, settings);
    }
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

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      estateID: estateList[searchForm.EstateID],
      groupID: GroupList[searchForm.GroupID],
      divisionID: divitionList[searchForm.DivisionID],
      startDate: searchForm.startDate,
      endDate: searchForm.endDate,
      jobCategoryID: jobCategories[searchForm.jobCategoryID],
      jobCode: jobCodes[searchForm.jobCode]
    });
  }

  function clearFields() {
    setIsTableHide(true);
    setWorkDistributionDetail({
      ...workDistributionDetail,
      divisionID: 0,
      jobCategoryID: 0,
      jobCode: '0',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date().toISOString().substring(0, 10)
    });
  }

  const jobTypes = [];
  workDistributionData.forEach(row => {
    row.workDistributionSummaryReportModels.forEach(item => {
      if (!jobTypes.includes(item.jobCode)) {
        jobTypes.push(item.jobCode);
      }
    });
  });

  function setDate() {
    let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var month = (workDistributionDetail.month);
    let monthName = monthNames[month - 1];

    setSelectedSearchValues({
      ...selectedSearchValues,
      monthName: monthName
    });
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

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: workDistributionDetail.groupID,
              factoryID: workDistributionDetail.factoryID,
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group required')
                .min('1', 'Group required'),
              estateID: Yup.number()
                .required('Estate required')
                .min('1', 'Estate required'),
            })}
            validateOnChange={false}
            validateOnBlur={false}
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
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
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
                              value={workDistributionDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                              }}
                              size="small"
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={workDistributionDetail.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                              size="small"
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(estateList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="divisionID">
                              Division
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.divisionID && errors.divisionID)}
                              fullWidth
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              onChange={e => handleChange(e)}
                              value={workDistributionDetail.divisionID}
                              variant="outlined"
                              id="divisionID"
                              size="small"
                            >
                              <MenuItem value="0">All Divisions</MenuItem>
                              {generateDropDownMenu(divitionList)}
                            </TextField>
                          </Grid>


                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="jobCategoryID">
                              Job Category
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="jobCategoryID"
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={workDistributionDetail.jobCategoryID}
                              variant="outlined"
                              id="jobCategoryID"
                            >
                              <MenuItem value={0}>--Select Job Category--</MenuItem>
                              {generateDropDownMenu(jobCategories)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="jobCode">
                              Job Code
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="jobCode"
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={workDistributionDetail.jobCode}
                              variant="outlined"
                              id="jobCode"
                            >
                              <MenuItem value="0">--Select Job Code--</MenuItem>
                              {generateDropDownMenu(jobCodes)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="startDate">
                              From Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="startDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={workDistributionDetail.startDate}
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
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="endDate">
                              To Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="endDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={workDistributionDetail.endDate}
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

                          <br /> <br /><br />

                          <Grid item md={12} xs={12}>
                            <Grid container justify="flex-end">
                              <Box pr={3}>
                                <Button
                                  color="primary"
                                  variant="outlined"
                                  type="submit"
                                  onClick={clearFields}
                                >
                                  Clear
                                </Button>
                              </Box>
                              <Box pr={2}>
                                <Button
                                  color="primary"
                                  variant="contained"
                                  type="submit"
                                  onClick={() => trackPromise(GetDetails())}
                                >
                                  Search
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </Grid>

                      </CardContent>


                      <Box minWidth={1050} hidden={isTableHide}>
                        {selectedSearchValues.divisionID == null ?
                          <Box minWidth={1050} style={{ padding: '0 16px' }}>
                            <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                              <Table className={classes.table} size="small" aria-label="sticky table" stickyHeader>
                                <TableHead>
                                  <TableRow>
                                    <TableCell colSpan={jobTypes.length + 2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                                      Work Distribution Summary
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell rowSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                      Division
                                    </TableCell>

                                    <TableCell colSpan={jobTypes.length} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                                      Job Code
                                    </TableCell>
                                    <TableCell rowSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="right">
                                      Total Mandays
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    {jobTypes.map((jobCode, index) => (
                                      <TableCell key={index} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                                        {jobCode}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {workDistributionData.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                      <TableCell colSpan={1} style={{ border: "1px solid black" }} align="left">
                                        {row.divisionName}
                                      </TableCell>
                                      {jobTypes.map((jobCode, jobIndex) => {
                                        const found = row.workDistributionSummaryReportModels.find(x => x.jobCode === jobCode);
                                        return (
                                          <TableCell key={jobIndex} style={{ border: "1px solid black" }} align="center">
                                            {found ? found.totalAttendancePerJobCode : '-'}
                                          </TableCell>
                                        );
                                      })}

                                      <TableCell style={{ border: "1px solid black", fontWeight: "bold" }} align="right">
                                        {
                                          (() => {
                                            const uniqueJobcodes = new Set();
                                            const uniqueItems = row.workDistributionSummaryReportModels.filter(item => {
                                              if (!uniqueJobcodes.has(item.jobCode)) {
                                                uniqueJobcodes.add(item.jobCode);
                                                return true;
                                              }
                                              return false;
                                            });
                                            return uniqueItems.reduce((accumulator, currentItem) => {
                                              return accumulator + currentItem.totalAttendancePerJobCode;
                                            }, 0);
                                          })()
                                        }
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                                <TableFooter>
                                  <TableRow>
                                    <TableCell colSpan={1} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                                      Total
                                    </TableCell>
                                    {jobTypes.map((jobCode, index) => {
                                      const jobCodeTotal = workDistributionData.reduce((total, row) => {
                                        const found = row.workDistributionSummaryReportModels.find(x => x.jobCode === jobCode);
                                        return total + (found ? parseFloat(found.totalAttendancePerJobCode) : 0);
                                      }, 0);

                                      return (
                                        <TableCell key={index} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center">
                                          {jobCodeTotal !== 0 ? jobCodeTotal : '-'}
                                        </TableCell>
                                      );
                                    })}
                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="right">
                                      {
                                        (() => {
                                          let total = 0;
                                          workDistributionData.forEach(row => {
                                            const found = row.workDistributionSummaryReportModels.reduce((accumulator, currentItem) => {
                                              return accumulator + currentItem.attendance;
                                            }, 0);
                                            total += found;
                                          });
                                          return total;
                                        })()
                                      }
                                    </TableCell>
                                  </TableRow>
                                </TableFooter>
                              </Table>
                            </TableContainer>
                          </Box>

                          :

                          <Box minWidth={1050} style={{ padding: '0 16px' }}>
                            <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                              <Table className={classes.table} size="small" aria-label="sticky table" stickyHeader>

                                <TableRow>
                                  <TableCell rowSpan={2} className={`${classes.stickyColumn}`} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Job Code
                                  </TableCell>
                                  {date.map((row, index) => (
                                    <TableCell key={index} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                                      Day {moment(row).format('DD')}
                                    </TableCell>
                                  ))}
                                  <TableCell rowSpan={2} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="left">
                                    Total
                                  </TableCell>
                                </TableRow>
                                <TableBody>

                                  {jobTypes.map((jobCode, index) => (
                                    <React.Fragment key={index}>
                                      <TableRow key={index}>
                                        <TableCell className={`${classes.stickyColumn}`} style={{ border: "1px solid black" }} align="left">
                                          {jobCode}
                                        </TableCell>
                                        {date.map((day, rowIndex) => {
                                          var found = workDistributionData[0].workDistributionSummaryReportModels.find(x => x.date == day && x.jobCode == jobCode);
                                          return (
                                            <TableCell key={rowIndex} style={{ border: "1px solid black" }} align="center">
                                              {found == undefined ? '-' : found.attendance}
                                            </TableCell>
                                          );
                                        })}
                                        <TableCell style={{ border: "1px solid black" }} align="right">

                                          {
                                            (() => {
                                              let total = 0;
                                              let filteredJobCodes = workDistributionData[0].workDistributionSummaryReportModels.filter(x => x.jobCode == jobCode);
                                              return filteredJobCodes.reduce((total, row) => total + (parseFloat(row.attendance) || 0), 0) || '-';

                                            })()
                                          }
                                        </TableCell>
                                      </TableRow>
                                    </React.Fragment>
                                  ))}
                                </TableBody>
                                <TableFooter>
                                  <TableRow>
                                    <TableCell colSpan={1} className={`${classes.stickyColumn}`} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="center">
                                      Total
                                    </TableCell>
                                    {date.map((day, index) => {
                                      const dayTotal = workDistributionData.reduce((total, row) => {
                                        let totalxx = 0
                                        row.workDistributionSummaryReportModels.forEach(item => {
                                          if (item.date === day) {
                                            totalxx += item.attendance
                                          } else {
                                            totalxx += 0
                                          }

                                        });
                                        return total + (row.workDistributionSummaryReportModels ? parseFloat(totalxx) : 0);
                                      }, 0);
                                      return (
                                        <TableCell key={`total_${day}`} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="center">
                                          {dayTotal !== 0 ? dayTotal : '-'}
                                        </TableCell>
                                      );
                                    })}
                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="right">
                                      {

                                        (() => {
                                          if (workDistributionData.length > 0) {
                                            return workDistributionData[0].workDistributionSummaryReportModels.reduce((total, row) => total + (parseFloat(row.attendance) || 0), 0) || '-';
                                          }
                                        })()
                                      }
                                    </TableCell>
                                  </TableRow>
                                </TableFooter>
                              </Table>
                            </TableContainer>
                          </Box>
                        }

                        {workDistributionData.length > 0 ? (
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorRecord}
                              onClick={createFile}
                              size="small"
                            >
                              EXCEL
                            </Button>
                            <div>&nbsp;</div>

                            {<ReactToPrint
                              documentTitle={'Work Distribution Summary Report'}
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
                            {<div hidden={true}>
                              <CreatePDF
                                ref={componentRef}
                                selectedSearchValues={selectedSearchValues}
                                searchDate={workDistributionDetail}
                                workDistributionData={workDistributionData}
                                total={totalAmount}
                                monthDays={date}
                                jobTypes={jobTypes}
                              />
                            </div>}
                            <style>
                              {`
                              @page {
                                size: A3 landscape; 
                                margin: 10mm; 
                              }
                            `}
                            </style>
                          </Box>
                        ) : null}
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container >
      </Page >
    </Fragment >
  );
}

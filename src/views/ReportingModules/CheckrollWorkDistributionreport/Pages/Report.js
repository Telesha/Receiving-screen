import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem, Paper } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
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

const screenCode = 'CHECKROLLWORKDISTRIBUTIONREPORT';

export default function CheckrollWorkDistributionReport() {
  const today = new Date();
  const [title, setTitle] = useState('Checkroll Work Distribution Report');
  const classes = useStyles();
  const [workDistributionDetail, setWorkDistributionDetail] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date().toISOString().substring(0, 10),
    jobCategoryID: 0,
    jobCode: 0
  });
  const [estateList, setEstateList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [divitionList, setDivision] = useState();
  const [jobCategories, setJobCategories] = useState([]);
  const [jobCodes, setJobCodes] = useState([]);
  const [workDistributionData, setWorkDistributionData] = useState([]);
  const [isTableHide, setIsTableHide] = useState(true);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [totalValues, setTotalValues] = useState({});
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const [selectedSearchValues, setSelectedSearchValues] = useState({
    divisionID: "0",
    estateID: "0",
    groupID: "0",
    startDate: "",
    endDate: "",
    jobCategoryID: '',
    jobCode: "0"
  });

  const navigate = useNavigate();
  const componentRef = useRef();
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
    getAllJobCodeDetailsByEstate();
  }, [workDistributionDetail.estateID]);

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
      jobCode: 0,
      year: new Date().getUTCFullYear().toString(),
      month: (today.getUTCMonth() + 1).toString().padStart(2, '0')
    })
  }, [workDistributionDetail.divisionID]);

  useEffect(() => {
    setWorkDistributionDetail({
      ...workDistributionDetail,
      jobCode: 0,
      year: new Date().getUTCFullYear().toString(),
      month: (today.getUTCMonth() + 1).toString().padStart(2, '0'),
    })
  }, [workDistributionDetail.jobCategoryID]);

  useEffect(() => {
    setWorkDistributionDetail({
      ...workDistributionDetail,
      endDate: endDay
    })
  }, [workDistributionDetail.startDate])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWCHECKROLLWORKDISTRIBUTIONREPORT'
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

  async function getAllJobCodeDetailsByEstate() {
    var response = await services.getAllJobCodeDetailsByEstate(workDistributionDetail.estateID);
    setJobCodes(response);
  };

  async function getJobCodeDetailsByJobCategoryID() {
    var response = await services.getJobCodeDetailsByJobCategoryID(workDistributionDetail.jobCategoryID);
    setJobCodes(response);
  };

  async function GetDetails() {
    let model = {
      GroupID: workDistributionDetail.groupID == "" ? 0 : parseInt(workDistributionDetail.groupID),
      EstateID: workDistributionDetail.estateID == "" ? 0 : parseInt(workDistributionDetail.estateID),
      DivisionID: workDistributionDetail.divisionID == "" ? 0 : parseInt(workDistributionDetail.divisionID),
      jobCategoryID: workDistributionDetail.jobCategoryID == "" ? 0 : parseInt(workDistributionDetail.jobCategoryID),
      jobCode: workDistributionDetail.jobCode == "" ? 0 : parseInt(workDistributionDetail.jobCode),
      startDate: (workDistributionDetail.startDate),
      endDate: (workDistributionDetail.endDate)
    }
    getSelectedDropdownValuesForReport(model);
    const response = await services.GetCheckrollWorkDistributionReportDetails(model);

    if (response.statusCode == "Error" && response.data != null) {
      alert.error("No records to display");
      clearFields();
    }
    else {
      setIsTableHide(false);
      setWorkDistributionData(response.data);

      const totalNormalDays = response.data.reduce((accumulator, current) => accumulator + current.normalDays, 0);
      const totalSundayAndPoyaDays = response.data.reduce((accumulator, current) => accumulator + current.sundayAndPoyaDays, 0);
      const totalCashDays = response.data.reduce((accumulator, current) => accumulator + current.cashDays, 0);
      const totalNames = totalNormalDays+totalSundayAndPoyaDays+totalCashDays
      const totalNormalOT = response.data.reduce((accumulator, current) => accumulator + current.normalOT, 0);
      const totalNightOT = response.data.reduce((accumulator, current) => accumulator + current.nightOT, 0);
      const totalSundayPoyaOT = response.data.reduce((accumulator, current) => accumulator + current.sundayPoyaOT, 0);
      const totalOT = totalNormalOT+totalNightOT+totalSundayPoyaOT
      
      setTotalValues({
        ...totalValues,
            totalNormalDays: totalNormalDays.toFixed(2),
            totalSundayAndPoyaDays: totalSundayAndPoyaDays.toFixed(2),
            totalCashDays: totalCashDays.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalNames: totalNames.toFixed(2),
            totalNormalOT: totalNormalOT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalNightOT: totalNightOT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalSundayPoyaOT: totalSundayPoyaOT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalOT: totalOT.toFixed(2),   
      });
      createDataForExcel(response.data);
    }
  }

  const specificMonth = workDistributionDetail.startDate ? new Date(workDistributionDetail.startDate) : new Date();
  const firstDay = specificMonth.toISOString().split('T')[0];
  const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
  const lastDay = lastDayOfMonth.toISOString().split('T')[0];
  const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];

  async function createDataForExcel(array) {
    var res = [];

    if (array != null) {
      array.map(x => {
        var vr = {
          'Job Code': x.jobCode.toString().padStart(4, '0'),
          'Description': x.jobName,
          'Normal Days': x.normalDays.toFixed(2),
          'Sunday & Poyadays': x.sundayAndPoyaDays.toFixed(2),
          'Cash': x.cashDays.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          'Total Names': getTotDays(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          'Normal OT': x.normalOT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          'Night OT': x.nightOT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          'Sunday Poya': x.sundayPoyaOT.toFixed(2),
          'Total Over Time': getTotOThrs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        }
        res.push(vr);
      });

      res.push({});

      var vrTot = {
        'Job Code': 'Total :',
        'Normal Days': totalValues.totalNormalDays,
        'Sunday & Poyadays': totalValues.totalSundayAndPoyaDays,
        'Cash': totalValues.totalCashDays,
        'Total Names': totalValues.totalNames,
        'Normal OT': totalValues.totalNormalOT,
        'Night OT': totalValues.totalNightOT,
        'Sunday Poya': totalValues.totalSundayPoyaOT,
        'Total Over Time': totalValues.totalOT,
      }
      res.push(vrTot);

      res.push({});
      res.push({}, {});
      var vr = {
        'Job Code': "Group: " + selectedSearchValues.groupName,
        'Description': "Estate: " + selectedSearchValues.estateName,
        'Normal Days': "Estate: " + selectedSearchValues.divisionName,
      }
      res.push(vr);
      var vr1 = {
        'Job Code': "JobCategory: " + selectedSearchValues.jobCategoryID,
        'Description': "JobCode: " + selectedSearchValues.jobCode,
        'Normal Days': "Date: " + (selectedSearchValues.startDate + '-' + selectedSearchValues.endDate)
      }
      res.push(vr1);
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(workDistributionData);
    var settings = {
      sheetName: 'WorkDistribution Report',
      fileName: 'Checkroll Work Distribution Report' + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.estateName + ' - ' + selectedSearchValues.divisionName,
      writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    let dataA = [
      {
        sheet: 'Work Distribution Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
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
      estateName: estateList[searchForm.EstateID],
      groupName: GroupList[searchForm.GroupID],
      divisionName: divitionList[searchForm.DivisionID],
      startDate: searchForm.startDate,
      endDate: searchForm.endDate,
      jobCategory: jobCategories[searchForm.jobCategoryID],
      jobCode: jobCodes[searchForm.jobCode]
    });
  }

  function getTotDays(data) {
    const totalDays = data.normalDays + data.sundayAndPoyaDays + data.cashDays
    return totalDays;
  }

  function getTotOThrs(data) {
    const totalOThrs = data.normalOT + data.nightOT + data.sundayPoyaOT
    return totalOThrs;
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
              groupID: Yup.number().required('Group required').min('1', 'Group required'),
              factoryID: Yup.number().required('Estate required').min('1', 'Estate required'),
            })} onSubmit={() => trackPromise(GetDetails())}
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
                              disabled={!permissionList.isFactoryFilterEnabled}
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
                        </Grid>
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
                        <br></br>
                        <Box minWidth={1050} hidden={isTableHide} >
                          {workDistributionData.length > 0 ?
                            <TableContainer component={Paper} style={{ maxHeight: '550px', overflow: 'auto' }}>
                              <Table className={classes.table} aria-lable="sticky table" stickyHeader size='small' Table>
                                <TableHead style={{ position: "sticky", top: 0, zIndex: 1000, background: "white" }}>
                                  <TableRow>
                                    <TableCell className={classes.sticky} rowSpan="2" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Job Code</TableCell>
                                    <TableCell className={classes.sticky} rowSpan="2" align={'center'} style={{ left: 74, border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Description</TableCell>
                                    <TableCell className={classes.sticky} colSpan="4" align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>NAMES</TableCell>
                                    <TableCell className={classes.sticky} colSpan="4" align={'center'} style={{ left: 74, border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Over Time(hrs)</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Normal Days</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Sunday & Poyadays</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Cash</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Total</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Normal OT</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Night OT</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Sunday Poya</TableCell>
                                    <TableCell className={`${classes.stickyHeader}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", backgroundColor: "#C8BFBF" }}>Total</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {workDistributionData.map((data, index) => (
                                    <TableRow key={index}>
                                      <TableCell className={`${classes.stickyColumn}`} align={'center'} style={{ border: "1px solid black" }}>{data.jobCode.toString().padStart(4, '0')}</TableCell>
                                      <TableCell className={`${classes.stickyColumn}`} align={'left'} style={{ left: 74, border: "1px solid black" }}>{data.jobName}</TableCell>
                                      <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.normalDays == 0 ? "-" : data.normalDays.toFixed(2)}</TableCell>
                                      <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.sundayAndPoyaDays == 0 ? "-" : data.sundayAndPoyaDays.toFixed(2)}</TableCell>
                                      <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.cashDays == 0 ? "-" : data.cashDays.toFixed(2)}</TableCell>
                                      <TableCell align={'right'} style={{ border: "1px solid black" }}>{getTotDays(data) == 0 ? "-" : getTotDays(data).toFixed(2)}</TableCell>
                                      <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.normalOT == 0 ? "-" : data.normalOT.toFixed(2)}</TableCell>
                                      <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.nightOT == 0 ? "-" : data.nightOT.toFixed(2)}</TableCell>
                                      <TableCell align={'right'} style={{ border: "1px solid black" }}>{data.sundayPoyaOT == 0 ? "-" : data.sundayPoyaOT.toFixed(2)}</TableCell>
                                      <TableCell align={'right'} style={{ border: "1px solid black" }}>{getTotOThrs(data) == 0 ? "-" : getTotOThrs(data).toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))
                                  }
                                </TableBody>
                                <TableRow>
                                  <TableCell className={`${classes.stickyColumn}`} align={'center'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} colSpan={2}><b>Total</b></TableCell>
                                  <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalNormalDays}</TableCell>
                                  <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalSundayAndPoyaDays}</TableCell>
                                  <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalCashDays}</TableCell>
                                  <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalNames}</TableCell>
                                  <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalNormalOT}</TableCell>
                                  <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalNightOT}</TableCell>
                                  <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalSundayPoyaOT}</TableCell>
                                  <TableCell align={'right'} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }}>{totalValues.totalOT}</TableCell>
                                </TableRow>
                              </Table>
                            </TableContainer>
                            : null}
                          <br></br>
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
                                  SearchData={selectedSearchValues}
                                  searchDate={workDistributionDetail}
                                  workDistributionData={workDistributionData}
                                  totalValues={totalValues}
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
                      </CardContent>
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

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
import CreatePDF from './CreatePDF';
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
  }
}));

const screenCode = 'EPFETFRETURNREPORT';

export default function GreenLeafReport(props) {
  const today = new Date();
  const [title, setTitle] = useState('EPF/ETF Return Report');
  const classes = useStyles();
  const [statutoryDetail, setStatutoryDetail] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    deductionTypeID: 0,
    startMonth: new Date().toISOString().substring(0, 10),
    endMonth: new Date().toISOString().substring(0, 10)
  });
  const [months, setMonths] = useState({
    startMonth: new Date().toISOString().substring(0, 7),
    endMonth: new Date().toISOString().substring(0, 7)
  });
  const [estateList, setEstateList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [divitionList, setDivision] = useState([]);
  const [deductionTypeList, setDeductionTypeList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statutoryData, setStatutoryData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const navigate = useNavigate();

  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    divisionID: "0",
    estateID: "0",
    groupID: "0",
    deductionTypeID: "0",
    startMonth: "",
    endMonth: ""
  });
  const componentRef = useRef();
  const alert = useAlert();
  const [alertCount, setAlertCount] = useState({
    count: 0
  });

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
    trackPromise(getDeductionTypesForDropdown());
    setAlertCount({
      count: 1
    });
  }, []);

  useEffect(() => {
    getEstatesForDropdoen();
    trackPromise(
      getEstatesForDropdoen(statutoryDetail.groupID)
    )
    setAlertCount({
      count: alertCount.count + 1
    });
  }, [statutoryDetail.groupID]);

  useEffect(() => {
    trackPromise(getDivisionByEstateID(statutoryDetail.estateID));
  }, [statutoryDetail.estateID]);

  useEffect(() => {
    setStatutoryDetail({
      ...statutoryDetail,
      deductionTypeID: 0,
      startMonth: new Date().toISOString().substring(0, 10),
      endMonth: new Date().toISOString().substring(0, 10)
    });
    setMonths({
      ...months,
      startMonth: new Date().toISOString().substring(0, 7),
      endMonth: new Date().toISOString().substring(0, 7)
    })
  }, [statutoryDetail.divisionID]);

  useEffect(() => {
    setStatutoryDetail({
      ...statutoryDetail,
      startMonth: new Date().toISOString().substring(0, 10),
      endMonth: new Date().toISOString().substring(0, 10)
    });
    setMonths({
      ...months,
      startMonth: new Date().toISOString().substring(0, 7),
      endMonth: new Date().toISOString().substring(0, 7)
    })
  }, [statutoryDetail.deductionTypeID]);

  useEffect(() => {
    const currentDate = new Date();
    const previousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    setSelectedDate(previousMonth);
  }, []);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWEPFETFRETURNREPORT'
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

    setStatutoryDetail({
      ...statutoryDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setStatutoryDetail({
      ...statutoryDetail,
      [e.target.name]: value
    });
    setStatutoryData([]);
  }

  const handleStartDateChange = (e) => {
    const selectedMonth = e.target.value;
    const fullDate = new Date(selectedMonth + "-01");
    setStatutoryDetail({
      ...statutoryDetail,
      [e.target.name]: new Date(fullDate).toISOString().substring(0, 10)
    });
    setMonths({
      ...months,
      [e.target.name]: selectedMonth
    });
    setStatutoryData([]);
  };

  const handleEndDateChange = (e) => {
    const selectedMonth = e.target.value;
    const fullDate = new Date(selectedMonth + "-01");
    fullDate.setMonth(fullDate.getMonth() + 1, 0);
    setStatutoryDetail({
      ...statutoryDetail,
      [e.target.name]: new Date(fullDate).toISOString().substring(0, 10)
    });
    setMonths({
      ...months,
      [e.target.name]: selectedMonth
    });
    setStatutoryData([]);
  };

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getEstatesForDropdoen() {
    const estates = await services.getEstateDetailsByGroupID(statutoryDetail.groupID);
    setEstateList(estates);
  }

  async function getDivisionByEstateID() {
    var response = await services.getDivisionByEstateID(statutoryDetail.estateID);
    setDivision(response);
  };

  async function getDeductionTypesForDropdown() {
    const deductionTypes = await services.getAllDeductionTypes();
    setDeductionTypeList(deductionTypes);
  }

  async function GetDetails() {
    setStatutoryData([]);
    let model = {
      GroupID: parseInt(statutoryDetail.groupID) !== 0 ? parseInt(statutoryDetail.groupID) : null,
      EstateID: parseInt(statutoryDetail.estateID) !== 0 ? parseInt(statutoryDetail.estateID) : null,
      DivisionID: parseInt(statutoryDetail.divisionID) !== 0 ? parseInt(statutoryDetail.divisionID) : null,
      DeductionTypeID: parseInt(statutoryDetail.deductionTypeID) !== 0 ? parseInt(statutoryDetail.deductionTypeID) : null,
      StartDate: (statutoryDetail.startMonth),
      EndDate: (statutoryDetail.endMonth),
    };
    getSelectedDropdownValuesForReport(model);

    const customerData = await services.GetEPFandETFReturnDeatails(model)
    if (customerData.statusCode == 'Success' && customerData.data != null) {
      customerData.data.forEach(x => {
        let total = 0;
        x.statutoryDetailModels.forEach(y => {
          total += y.amount;
          x.totalAmount = total;
        })
      });
      setStatutoryData(customerData.data)
    } else {
      alert.error('NO RECORDS TO DISPLAY');
    }
  }

  const date = [];
  statutoryData.forEach(row => {
    row.statutoryDetailModels.forEach(item => {
      if (!date.includes(item.effectiveDate)) {
        date.push(item.effectiveDate);
      }
    });
  });

  async function createDataForExcel(array) {
    var result = [];
    var dayTotals = {};
    var totalAmountSum = 0;

    if (array != null) {
      dayTotals['epfNo'] = 'Total'
      array.forEach(x => {
        x.statutoryDetailModels.forEach(y => {
          const day = moment(y.effectiveDate).format('MM');
          var duplicateDate = result.find(z => z.epfNo === x.epfNumber);
          if (duplicateDate) {
            duplicateDate[day] = (y.amount);
            duplicateDate.name = x.empName;
            duplicateDate.epfNo = x.epfNumber;
            duplicateDate.amount = x.totalAmount;
          }
          else {
            result.push({
              [day]: y.amount,
              name: x.empName,
              epfNo: x.epfNumber,
              amount: x.totalAmount
            });
          }
          var dailySum = (dayTotals[day] || 0) + y.amount;
          dayTotals[day] = dailySum;
          totalAmountSum += y.amount;
          dayTotals['amount'] = totalAmountSum;
        })
      });
      result.push(dayTotals);
      result.push({});
      result.push({
        name: 'Estate : ' + selectedSearchValues.estateID,
        epfNo: 'Group : ' + selectedSearchValues.groupID,
        nicNo: 'Division : ' + selectedSearchValues.divisionID
      });
      result.push({
        epfNo: 'Start Month : ' + months.startMonth,
        name: 'End Month : ' + months.endMonth
      });

    }
    return result;
  }

  async function createFile() {
    var file = await createDataForExcel(statutoryData);
    var settings = {
      sheetName: 'EPF/ETF Return Report',
      fileName: 'EPF/ETF Return Report' + ' - ' + months.startMonth + '/' + months.endMonth,
      writeOptions: {}
    }

    let tempcsvHeaders = csvHeaders;
    let keys = date;
    tempcsvHeaders.push({ label: 'EPF No', value: 'epfNo' })
    tempcsvHeaders.push({ label: 'Employee Name', value: 'name' })
    tempcsvHeaders.push({ label: 'NIC No', value: 'nicNo' })
    keys.forEach((sitem, i) => {
      tempcsvHeaders.push({ label: moment(sitem).format('MM / YYYY'), value: moment(sitem).format('MM') })
    })
    if (statutoryDetail.deductionTypeID == 1) {
      tempcsvHeaders.push({ label: 'EPF Amount (Rs.)', value: 'amount' })
    }
    else if (statutoryDetail.deductionTypeID == 2) {
      tempcsvHeaders.push({ label: 'ETF Amount (Rs.)', value: 'amount' })
    }

    let dataA = [
      {
        sheet: 'EPF&ETF Return Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
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
      deductionTypeID: deductionTypeList[searchForm.DeductionTypeID],
      startMonth: searchForm.startMonth,
      endMonth: searchForm.endMonth
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
              groupID: statutoryDetail.groupID,
              estateID: statutoryDetail.estateID,
              divisionID: statutoryDetail.divisionID,
              deductionTypeID: statutoryDetail.deductionTypeID
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number().required('Group required').min('1', 'Group required'),
              estateID: Yup.number().required('Estate required').min('1', 'Factory required'),
              divisionID: Yup.number().required('Division is required').min('1', 'Division is required'),
              deductionTypeID: Yup.number().required('Statutory type is required').min('1', 'Statutory type is required')
            })}
            // onSubmit={() => trackPromise(addDetails())}
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
                          <Grid item md={4} xs={8}>
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
                              value={statutoryDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                              }}
                              // disabled={!permissionList.isGroupFilterEnabled}
                              size="small"
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
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
                              value={statutoryDetail.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                              //disabled={!permissionList.isEstateFilterEnabled}
                              size="small"
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(estateList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Division *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.divisionID && errors.divisionID)}
                              fullWidth
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              onChange={e => handleChange(e)}
                              value={statutoryDetail.divisionID}
                              variant="outlined"
                              id="divisionID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              {generateDropDownMenu(divitionList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="deductionTypeID">
                              Statutory Type *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.deductionTypeID && errors.deductionTypeID)}
                              fullWidth
                              helperText={touched.deductionTypeID && errors.deductionTypeID}
                              name="deductionTypeID"
                              onChange={e => handleChange(e)}
                              value={statutoryDetail.deductionTypeID}
                              variant="outlined"
                              id="deductionTypeID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Statuory Type--</MenuItem>
                              {generateDropDownMenu(deductionTypeList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="startMonth">
                              From Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="startMonth"
                              type='month'
                              onChange={(e) => handleStartDateChange(e)}
                              value={months.startMonth}
                              variant="outlined"
                              id="startMonth"
                              size='small'
                            />
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="endMonth">
                              To Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="endMonth"
                              type='month'
                              onChange={(e) => handleEndDateChange(e)}
                              value={months.endMonth}
                              variant="outlined"
                              id="endMonth"
                              size='small'
                            />
                          </Grid>
                        </Grid>

                        <Grid item md={12} xs={12} container justify="flex-end">
                          <Box pt={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type='submit'
                              onClick={() => trackPromise(GetDetails())}
                            >
                              Search
                            </Button>
                          </Box>
                        </Grid>
                        <br></br>
                        <br></br>
                        <Box minWidth={1050} hidden={statutoryData.length == 0}>
                          <TableContainer component={Paper} style={{ maxHeight: '550px', overflowY: 'auto' }}>
                            <Table
                              className={classes.table}
                              size="small"
                              aria-label="sticky table"
                              Table
                              stickyHeader
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell className={classes.table} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> EPF NO </TableCell>
                                  <TableCell className={classes.table} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> Employee Name </TableCell>
                                  <TableCell className={classes.table} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center"> NIC NO </TableCell>
                                  {date.map((row, index) => (
                                    <TableCell key={index} className={`${classes.stickyHeader}`} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                                      {moment(row).format('MMMM YYYY')}
                                    </TableCell>
                                  ))}
                                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center">
                                    {statutoryDetail.deductionTypeID == 1 ? 'EPF Total (Rs.)' : statutoryDetail.deductionTypeID == 2 ? 'ETF Total (Rs.)' : ''}
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {statutoryData.map((row, index) => (
                                  <TableRow key={index}>
                                    <TableCell className={`${classes.stickyColumn}`} style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                      {row.epfNumber == '' ? '-' : row.epfNumber}
                                    </TableCell>
                                    <TableCell className={`${classes.stickyColumn}`} style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                      {row.empName}
                                    </TableCell>
                                    <TableCell className={`${classes.stickyColumn}`} style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                      {row.nicNumber}
                                    </TableCell>
                                    {date.map((rows, index) => {
                                      var found = row.statutoryDetailModels.find(x => x.effectiveDate == rows);
                                      return (
                                        <TableCell key={index} style={{ border: "1px solid black" }} align="right">
                                          {found === undefined ? '-' : (found.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                      );
                                    })}
                                    <TableCell style={{ border: "1px solid black", fontWeight: "bold" }} align="right" component="th" scope="row">
                                      {row.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableFooter>
                                <TableRow>
                                  <TableCell colSpan={3} className={`${classes.stickyColumn}`} style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="left">
                                    Total
                                  </TableCell>
                                  {date.map((day, index) => {
                                    const dayTotal = statutoryData.reduce((total, row) => {
                                      const found = row.statutoryDetailModels.find(x => x.effectiveDate === day);
                                      return total + (found ? parseFloat(found.amount) : 0);
                                    }, 0);
                                    return (
                                      <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="right" key={index}>
                                        {dayTotal !== 0 ? dayTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="right">
                                    {statutoryData.reduce((total, row) => total + parseFloat(row.totalAmount), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </TableCell>
                                </TableRow>
                              </TableFooter>
                            </Table>
                          </TableContainer>
                        </Box>
                      </CardContent>
                      {statutoryData.length > 0 ? (
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
                            documentTitle={'EPF/ETF Return Report'}
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
                            {`
                              @page {
                                size: A4 landscape; /* Set the size and orientation here */
                                margin: 20mm; /* Adjust the margin as needed */
                              }
                            `}
                          </style>
                          {<div hidden={true}>
                            <CreatePDF
                              ref={componentRef}
                              selectedSearchValues={selectedSearchValues}
                              statutoryDetail={statutoryDetail}
                              statutoryData={statutoryData}
                              months={months}
                              date={date}
                            />
                          </div>}
                        </Box>
                      ) : null}
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

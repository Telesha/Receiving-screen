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

const screenCode = 'LENTLABOURREPORT';

export default function LentLabourReport(props) {
  const [title, setTitle] = useState('Lent Labour Report');
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState();
  const [divisions, setDivisions] = useState();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [isTableHide, setIsTableHide] = useState(true);

  const [lentLabourDetails, setlentLabourDetails] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date().toISOString().substring(0, 10)
  });

  const [lentLabourData, setLentLabourData] = useState([]);
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
    trackPromise(getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getEstateDetailsByGroupID());
  }, [lentLabourDetails.groupID]);

  useEffect(() => {
    trackPromise(getDivisionDetailsByEstateID());
  }, [lentLabourDetails.estateID]);

  useEffect(() => {
    setlentLabourDetails({
      ...lentLabourDetails,
      endDate: endDay
    })
  }, [lentLabourDetails.startDate])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWLENTLABOURREPORT'
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

    setlentLabourDetails({
      ...lentLabourDetails,
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
      lentLabourDetails.groupID
    );
    setEstates(response);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(
      lentLabourDetails.estateID
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
      groupID: parseInt(lentLabourDetails.groupID),
      estateID: parseInt(lentLabourDetails.estateID),
      divisionID: parseInt(lentLabourDetails.divisionID),
      startDate: (lentLabourDetails.startDate),
      endDate: (lentLabourDetails.endDate),
    };
    getLentLabourDetailsForReport(model);
    const response = await services.getLentLabourDetailsForReport(model);
    if (response.data.length != 0) {

      response.data.forEach(x => {
        let tot = 0;
        x.lentLabourReportOutputModel.forEach(y => {
          tot += y.manDays
          x.totCol = tot;
        })

      })
      setLentLabourData(response.data);
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
        x.lentLabourReportOutputModel.forEach(y => {
          const day = moment(y.date).format('DD').toString().padStart(2, '0');
          var duplicateDate = result.find(y => y.empNo === x.empNo);

          if (duplicateDate) {
            duplicateDate['E_' + day] = y.estateName == 0 ? '-' : y.estateName;
            duplicateDate[day] = y.divisionName;
            duplicateDate['T_' + day] = y.manDays == 0 ? '-' : y.manDays;
            duplicateDate.empNo = x.empNo;
            duplicateDate.empName = x.empName;
            duplicateDate.totCol = x.totCol;
          }
          else {
            result.push({
              empNo: x.empNo,
              empName: x.empName,
              ['E_' + day]: y.estateName == 0 ? '-' : y.estateName,
              [day]: y.divisionName,
              ['T_' + day]: y.manDays == 0 ? '-' : y.manDays,
              totCol: x.totCol
            });
          }
          dayTotals['T_' + day] = (dayTotals['T_' + day] || 0) + y.manDays;
          totalAmountSum += y.manDays;
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
    var file = await createDataForExcel(lentLabourData);
    var settings = {
      sheetName: 'Lent Labour Report',
      fileName: 'Lent Labour Report' + ' - ' + selectedSearchValues.startDate + ' / ' + selectedSearchValues.endDate,
      writeOptions: {}
    }

    let keys = date
    let tempcsvHeaders = csvHeaders;
    tempcsvHeaders.push({ label: 'Employee No', value: 'empNo' })
    tempcsvHeaders.push({ label: 'Employee Name', value: 'empName' })
    keys.forEach((sitem, i) => {
      tempcsvHeaders.push({ label: 'Estate ' + moment(sitem).format('DD'), value: 'E_' + moment(sitem).format('DD') })
      tempcsvHeaders.push({ label: 'Day ' + moment(sitem).format('DD'), value: moment(sitem).format('DD') })
      tempcsvHeaders.push({ label: ' ManDays ' + moment(sitem).format('DD'), value: 'T_' + moment(sitem).format('DD') })
    })
    tempcsvHeaders.push({ label: 'Total', value: 'totCol' })

    let dataA = [
      {
        sheet: 'Lent Labour Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  const date = [];
  lentLabourData.forEach(row => {
    row.lentLabourReportOutputModel.forEach(item => {
      if (!date.includes(item.date)) {
        date.push(item.date);
      }
    });
  });

  const specificMonth = lentLabourDetails.startDate ? new Date(lentLabourDetails.startDate) : new Date();
  const firstDay = specificMonth.toISOString().split('T')[0];
  const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
  const lastDay = lastDayOfMonth.toISOString().split('T')[0];
  const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];

  async function ClearTable() {
    clearState();
  }

  function clearState() {
    setlentLabourDetails({
      ...lentLabourDetails,
      divisionID: 0,
    });
    setIsTableHide(true);
    setLentLabourData([]);
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
    setlentLabourDetails({
      ...lentLabourDetails,
      [e.target.name]: value
    });
    setIsTableHide(true);
    setLentLabourData([]);
  }

  function getLentLabourDetailsForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: groups[searchForm.groupID],
      estateName: estates[searchForm.estateID],
      divisionName: divisions[searchForm.divisionID],
      startDate: searchForm.startDate,
      endDate: searchForm.endDate,
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: lentLabourDetails.groupID,
              estateID: lentLabourDetails.estateID,
              divisionID: lentLabourDetails.divisionID,
              startDate: lentLabourDetails.startDate,
              endDate: lentLabourDetails.endDate
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
                              value={lentLabourDetails.groupID}
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
                              value={lentLabourDetails.estateID}
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
                              value={lentLabourDetails.divisionID}
                              variant="outlined"
                              id="divisionID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
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
                              value={lentLabourDetails.startDate}
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
                              value={lentLabourDetails.endDate}
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
                        <Box minWidth={1050} hidden={isTableHide}
                        >
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
                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="center" colSpan={3}>
                                          {moment(row).format('MMMM DD')}
                                        </TableCell>
                                      </React.Fragment>
                                    );
                                  })}
                                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px" }} align="right">Total </TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {lentLabourData.map((row, index) => {
                                  return (
                                    <TableRow key={index}>
                                      <TableCell className={`${classes.stickyColumn}`} style={{ border: "1px solid black" }} align="left" component="th" scope="row">
                                        {row.empNo.padStart(4, '0')}
                                      </TableCell>
                                      <TableCell className={`${classes.stickyColumn}`} style={{ left: 112, border: "1px solid black" }} align="left" component="th" scope="row">
                                        {row.empName}
                                      </TableCell>
                                      {date.sort((a, b) => new Date(a) - new Date(b)).map((rows, Dindex) => {
                                        var found = row.lentLabourReportOutputModel.find(x => x.date == rows)
                                        return (
                                          <React.Fragment key={Dindex}>
                                            <TableCell style={{ border: "1px solid black" }} align="center" >
                                              {found == undefined ? '-' : found.estateName == 0 ? '-' : found.estateName}
                                            </TableCell>
                                            <TableCell style={{ border: "1px solid black" }} align="center" >
                                              {found == undefined ? '-' : found.divisionName}
                                            </TableCell>
                                            <TableCell style={{ border: "1px solid black" }} align="right" >
                                              {found == undefined ? '-' : found.manDays == 0 ? '-' : found.manDays}
                                            </TableCell>
                                          </React.Fragment>
                                        );
                                      })}
                                      <TableCell style={{ border: "1px solid black" }} align="right" component="th" scope="row">
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
                                    const dayTotal = lentLabourData.reduce((total, row) => {
                                      const found = row.lentLabourReportOutputModel.find(x => x.date === day);
                                      return total + (found ? parseFloat(found.manDays) : 0);
                                    }, 0);

                                    return (
                                      <React.Fragment key={index}>
                                        <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "14px", color: "red" }} align="right" colSpan={3}>
                                          {dayTotal !== 0 ? dayTotal : '-'}
                                        </TableCell>
                                      </React.Fragment>
                                    );
                                  })}
                                  <TableCell style={{ border: "1px solid black", fontWeight: "bold", fontSize: "16px", color: "red" }} align="right">
                                    {lentLabourData.reduce((total, row) => total + parseFloat(row.totCol), 0)}
                                  </TableCell>

                                </TableRow>
                              </TableFooter>

                            </Table>
                          </TableContainer>
                        </Box>
                      </CardContent>

                      <div hidden={isTableHide}>
                        {lentLabourData.length > 0 ? (
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
                              documentTitle={"Lent Labour Report"}
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
                                lentLabourData={lentLabourData}
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

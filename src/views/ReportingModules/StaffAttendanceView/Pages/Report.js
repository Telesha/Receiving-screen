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
  TextField,
  MenuItem,
  InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik, validateYupSchema } from 'formik';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import tokenService from '../../../../utils/tokenDecoder';
import * as Yup from "yup";
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import moment from 'moment';
import ReactToPrint from "react-to-print";
import xlsx from 'json-as-xlsx';
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

const screenCode = 'STAFFATTENDANCEVIEW';

export default function StaffAttendanceView(props) {
  const [title, setTitle] = useState("Staff Attendances View")
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState();
  const [divisions, setDivisions] = useState();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [isTableHide, setIsTableHide] = useState(true);

  const [staffAttendanceDetails, setStaffAttendanceDetails] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0',
    attendanceDate: ''
  });
  const [staffAttendanceDetailsData, setStaffAttendanceDetailsData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false
  });
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    estateName: '0',
    groupName: '0',
    divisionName: '0',
    attendanceDate: ''
  })
  const componentRef = useRef();
  const navigate = useNavigate();
  const alert = useAlert();

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getEstateDetailsByGroupID());
  }, [staffAttendanceDetails.groupID]);

  useEffect(() => {
    trackPromise(getDivisionDetailsByEstateID());
  }, [staffAttendanceDetails.estateID]);


  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSTAFFATTENDANCEVIEW');



    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');


    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined
    });

    setStaffAttendanceDetails({
      ...staffAttendanceDetailsData,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken()),
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(staffAttendanceDetails.groupID);
    setEstates(response); 
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(staffAttendanceDetails.estateID);
    setDivisions(response);
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


  async function getDetails() {

    let model = {
      groupID: parseInt(staffAttendanceDetails.groupID),
      estateID: parseInt(staffAttendanceDetails.estateID),
      divisionID: parseInt(staffAttendanceDetails.divisionID),
      attendanceDate: moment(staffAttendanceDetails.attendanceDate).format('').split('T')[0]        
    }
    getSelectedDropdownValuesForReport(model);
    const response = await services.getStaffAttendanceDetails(model);
    if (response.length != 0) {
      setStaffAttendanceDetailsData(response);
      setIsTableHide(false);
    }
    else {
      setIsTableHide(true);
      alert.error("No records to display");
    }
  }


  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'EMP No': x.employeeID,
          'EMP Name': x.employeeName,
          'EMP Type': x.employeeTypeID == 1 ? "Register" : "Unregisterd",
          'Job Category': x.jobCategoryID == 1 ? 'Weeding' : "Fertilizing",
          'Job': x.jobTypeName == 1 ? 'Manual Weeding' : "Manual Fertilizing",
          'Work Type': x.workTypeID == 1 ? "Lent labor" : "Division labor",
          'Field': x.fieldName,
          'Attendance': x.IsFullDay == true ? "Full" : x.isHalfDay == true ? "Half" : x.isLeave == true ? "Half" : '-',
          'Is Task Complete': x.isTaskComlete == true ? "yes" : "No",
        }
        res.push(vr);
      });
    }
    return res;
  }


  async function createFile() {
    var file = await createDataForExcel(staffAttendanceDetailsData);
    var settings = {
      sheetName: 'Staff Attendance View Report',
      fileName: 'Staff Attendance View Report  ' + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.estateName + ' - ' + selectedSearchValues.divisionName + ' - ' + staffAttendanceDetailsData.date,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    let dataA = [
      {
        sheet: 'Staff Attendance View Report',
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
    setStaffAttendanceDetails({
      ...staffAttendanceDetails,
      groupID: '0',
      estateID: '0',
      divisionID: '0',
      attendanceDate: ''
    });
    setIsTableHide(true);
    setStaffAttendanceDetailsData([]);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setStaffAttendanceDetails({
      ...staffAttendanceDetails,
      [e.target.name]: value
    });
  }

  function handleFromcollectedDate(value) {
    setStaffAttendanceDetails({
      ...staffAttendanceDetails,
      attendanceDate: value
    });
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: groups[searchForm.groupID],
      estateName: estates[searchForm.estateID],
      divisionName: divisions[searchForm.divisionID],
      attendanceDate: searchForm.attendanceDate
    })
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: staffAttendanceDetails.groupID,
              estateID: staffAttendanceDetails.estateID,
              divisionID: staffAttendanceDetails.divisionID,
              attendanceDate: staffAttendanceDetails.attendanceDate
            }}
            validationSchema={
              Yup.object().shape({
                 groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                 estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                 divisionID: Yup.number().required('Division is required').min("1", 'Division is required')
              })
            }
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
                              onChange={(e) => handleChange(e)}
                              value={staffAttendanceDetails.groupID}
                              variant="outlined"
                              id="groupID"

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
                              onChange={(e) => handleChange(e)}
                              value={staffAttendanceDetails.estateID}
                              variant="outlined"
                              id="estateID"

                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Division
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="divisionID"
                              onChange={(e) => handleChange(e)}
                              value={staffAttendanceDetails.divisionID}
                              variant="outlined"
                              id="divisionID"
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>


                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="attendanceDate">
                              Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.attendanceDate && errors.attendanceDate)}
                                helperText={touched.attendanceDate && errors.attendanceDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="attendanceDate"
                                id="attendanceDate"
                                size='small'
                                maxDate={new Date()}
                                value={staffAttendanceDetails.attendanceDate}
                                onChange={(e) => {
                                  handleFromcollectedDate(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <br />
                          <br />
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
                                onClick={() => trackPromise(getDetails())}
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                        <br />
                        <br />
                        <br />
                        <Box minWidth={1050} hidden={isTableHide}>
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'EMP No', field: 'employeeID', 
                              cellStyle: {
                                textAlign: "left",
                                } 
                              },
                              { title: 'EMP Name', field: 'employeeName' },
                              { title: 'EMP Type', field: 'employeeTypeID',lookup: {
                                1: "Register",
                                2: "Unregister"
                              } },
                              { title: 'Job Category', field: 'jobCategoryID',lookup: {
                                1: "Weeding",
                                2: "Fertilizing"
                              } },
                              { title: 'Job', field: 'jobTypeName' },
                              { title: 'Work Type', field: 'workTypeID',lookup: {
                                1: "Lent labor",
                                2: "Division labor"
                              } },
                              { title: 'Field', field: 'fieldName' },
                              {
                                title: 'Attendance', field: 'attendance',
                                render: rowData => rowData.isFullDay == true ? "Full" : rowData.isHalfDay == true ? "Half" : rowData.isLeave == true ? "Half" : '-'
                              },
                              { title: 'Is Task Complete', field: 'isTaskComlete',
                              render: rowData => rowData.isTaskComlete == true ? "yes" : "No"
                              },
                            ]}
                            data={staffAttendanceDetailsData}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 5,
                              search: false
                            }}
                          />
                        </Box>
                      </CardContent>

                      <div hidden={isTableHide}>
                      {staffAttendanceDetailsData.length > 0 ? 
                        <Box display="flex" justifyContent="flex-end" p={2} hidden={isTableHide}>
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
                                documentTitle={"Staff Attendance View Report"}
                                trigger={() => <Button
                                  color="primary"
                                  id="btnRecord"
                                  type="submit"
                                  variant="contained"
                                  style={{ marginRight: '1rem' }}
                                  className={classes.colorCancel}
                                  size = 'small'
                                >
                                  PDF
                                </Button>}
                                content={() => componentRef.current}
                              />

                              <div hidden={true}>
                                <CreatePDF ref={componentRef}
                                  staffAttendancesViewDetails={staffAttendanceDetailsData} 
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
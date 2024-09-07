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
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import ReactToPrint from "react-to-print";
import xlsx from 'json-as-xlsx';
import CreatePDF from './CreatePDF';
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';


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

const screenCode = 'SUNDRYATTENDANCESVIEW';

export default function SundryAttendancesView(props) {
  const agriGenERPEnum = new AgriGenERPEnum();
  const [title, setTitle] = useState("Sundry Attendances View")
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [isHideField, setIsHideField] = useState(true);
  const [isTableHide, setIsTableHide] = useState(true);
  const [sundryAttendanceViewDetails, setSundryAttendanceViewDetails] = useState([]);
  const [sundryAttendanceSearchDetails, setSundryAttendanceSearchDetails] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    date: new Date(),
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    estateName: "0",
    groupName: "0",
    divisionName: "0",
  })

  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();

  useEffect(() => {
    getPermission();
  }, [])

  useEffect(() => {

    trackPromise(
      getPermission()
    );

    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    if (sundryAttendanceSearchDetails.groupID > 0) {
      trackPromise(
        getEstateDetailsByGroupID());
    }
  }, [sundryAttendanceSearchDetails.groupID]);

  useEffect(() => {
    if (sundryAttendanceSearchDetails.estateID > 0) {
      trackPromise(
        getDivisionDetailsByEstateID()
      )
    }
  }, [sundryAttendanceSearchDetails.estateID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSUNDRYATTENDANCESVIEW');

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

    setSundryAttendanceSearchDetails({
      ...sundryAttendanceSearchDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getSundryAttendanceDetails() {
    let model = {
      groupID: parseInt(sundryAttendanceSearchDetails.groupID),
      estateID: parseInt(sundryAttendanceSearchDetails.estateID),
      divisionID: parseInt(sundryAttendanceSearchDetails.divisionID),
      date: (sundryAttendanceSearchDetails.date)
    }
    getSelectedDropdownValuesForReport(model);


    const SundryAttendanceDetails = await services.GetSundryAttendanceDetails(model);
    if (SundryAttendanceDetails.length != 0) {
      setSundryAttendanceViewDetails(SundryAttendanceDetails);
      setIsHideField(false);
    }
    else {
      setIsHideField(true);
      alert.error("No records to display");
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(sundryAttendanceSearchDetails.groupID);
    setEstates(response);
  };

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(sundryAttendanceSearchDetails.estateID);
    setDivisions(response);
  };

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'EMP No': x.registrationNumber,
          'EMP Name': x.fullName,
          'EMP Type': x.employeeTypeID == agriGenERPEnum.EmployeeTypeID.Register ? "Register" : "Unregisterd",
          'Job Category': x.jobCategoryID == agriGenERPEnum.EmployeeJobCategoryID.Weeding ? 'Weeding' : "Fertilizing",
          'Job': x.jobID == agriGenERPEnum.EmployeeJobID.ManualWeeding ? 'Manual Weeding' : "Manual Fertilizing",
          'Work Type': x.workTypeID == agriGenERPEnum.EmployeeWorkTypeID.LentLabour ? "Lent labor" : "Division labor",
          'Field': x.fieldName,
          'Attendance': x.isFullDay == true ? "Full" : x.isHalfDay == true ? "Half" : x.isLeave == true ? "Half" : '-',
          'Is Task Complete': x.isTaskComlete == true ? "yes" : "No",
        }
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(sundryAttendanceViewDetails);
    var settings = {
      sheetName: 'Sundry Attendance View Report',
      fileName: 'Sundry Attendance View Report  ' + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.estateName + ' - ' + selectedSearchValues.divisionName + ' - ' + sundryAttendanceSearchDetails.date,
      writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    let dataA = [
      {
        sheet: 'Sundry Attendance View Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
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

  async function ClearTable() {
    clearState();
  }

  function clearState() {
    setSundryAttendanceSearchDetails({
      ...sundryAttendanceSearchDetails,
      date: null
    });
    setIsTableHide(true);
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
    setSundryAttendanceSearchDetails({
      ...sundryAttendanceSearchDetails,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setSundryAttendanceSearchDetails({
      ...sundryAttendanceSearchDetails,
      date: value
    });
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      estateName: estates[searchForm.estateID],
      groupName: groups[searchForm.groupID],
      divisionName: divisions[searchForm.divisionID] == undefined ? "All" : divisions[searchForm.divisionID]
    })
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: sundryAttendanceSearchDetails.groupID,
              factoryID: sundryAttendanceSearchDetails.factoryID,
              date: sundryAttendanceSearchDetails.date
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                date: Yup.date().required('Date is required').typeError('Invalid date'),
              })
            }
            onSubmit={() => trackPromise(getSundryAttendanceDetails())}
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
                              value={sundryAttendanceSearchDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select Group--</MenuItem>
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
                              value={sundryAttendanceSearchDetails.estateID}
                              variant="outlined"
                              id="estateID"
                              size='small'
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select Estate--</MenuItem>
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
                              value={sundryAttendanceSearchDetails.divisionID}
                              variant="outlined"
                              id="divisionID"
                              size='small'
                            >
                              <MenuItem value={0}>--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date">
                              Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.date && errors.date)}
                                helperText={touched.date && errors.date}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="date"
                                id="date"
                                value={sundryAttendanceSearchDetails.date}
                                onChange={(e) => {
                                  handleDateChange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
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
                                type="reset"
                                onClick={ClearTable}
                                size='small'
                              >
                                Clear
                              </Button>
                            </Box>
                            <Box pr={2}>
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
                        <br />
                        <br />
                        <br />
                        <Box minWidth={1050}>
                          {sundryAttendanceViewDetails.length > 0 ?
                            <MaterialTable
                              title="Multiple Actions Preview"
                              columns={[
                                { title: 'EMP No', field: 'registrationNumber' },
                                { title: 'EMP Name', field: 'fullName' },
                                {
                                  title: 'EMP Type', field: 'employeeTypeID', lookup: {
                                    1: "Register",
                                    2: "Unregister"
                                  }
                                },
                                {
                                  title: 'Job Category', field: 'jobCategoryID', lookup: {
                                    1: "Weeding",
                                    2: "Fertilizing"
                                  }
                                },
                                {
                                  title: 'Job', field: 'jobID', lookup: {
                                    1: "Manual Weeding",
                                    2: "Manul Fertilizing"
                                  }
                                },
                                {
                                  title: 'Work Type', field: 'workTypeID', lookup: {
                                    1: "Lent labor",
                                    2: "Division labor"
                                  }
                                },
                                { title: 'Field', field: 'fieldName' },
                                {
                                  title: 'Attendance', field: 'attendance',
                                  render: rowData => rowData.attendance == 1 ? "Full" : rowData.attendance == 2 ? "Half" : '-'
                                },
                                {
                                  title: 'Is Task Complete', field: 'isTaskComlete',
                                  render: rowData => rowData.isTaskComlete == true ? "yes" : "No"
                                },
                              ]}
                              data={sundryAttendanceViewDetails}
                              options={{
                                exportButton: false,
                                showTitle: false,
                                headerStyle: { textAlign: "center" },
                                cellStyle: { textAlign: "left" },
                                columnResizable: false,
                                actionsColumnIndex: -1,
                                pageSize: 5
                              }}
                            />
                            : null}
                        </Box>
                      </CardContent>
                      {sundryAttendanceViewDetails.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={createFile}
                          >
                            EXCEL
                          </Button>
                          <div>&nbsp;</div>
                          <ReactToPrint
                            documentTitle={"Stock View Report"}
                            trigger={() => <Button
                              color="primary"
                              id="btnCancel"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                            >
                              PDF
                            </Button>}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF ref={componentRef} sundryAttendanceViewDetails={sundryAttendanceViewDetails}
                              SearchData={selectedSearchValues}
                              sundryAttendanceSearchDetails={sundryAttendanceSearchDetails} />
                          </div>
                        </Box> : null}
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment >
  )
}
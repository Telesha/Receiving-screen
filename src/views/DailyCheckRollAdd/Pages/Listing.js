import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import moment from 'moment';
import tokenDecoder from '../../../utils/tokenDecoder';
import { Formik } from 'formik';
import * as Yup from "yup";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  }
}));

const screenCode = 'ATTENDANCEPLUCKING';
export default function DailyCheckRollListing() {
  const classes = useStyles();
  const alert = useAlert();
  const [attendanceData, setAttendanceData] = useState([]);
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [selectedAdvanceIssueID, setSelectedAdvanceIssueID] = useState(null);
  const [musterchitID, setMusterChitID] = useState(null);
  const [pluckingSearch, setPluckingSearch] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0',
    empNo: null,
    fromDate: new Date(),
    toDate: new Date(),
    maxDate: new Date()
  })

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/attendancePlucking/addedit/' + encrypted);
  }

  const handleClickEdit = (employeeAttendanceID) => {
    encrypted = btoa(employeeAttendanceID.toString());
    navigate('/app/attendancePlucking/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    trackPromise(
      getPermissions(),
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [pluckingSearch.groupID]);

  useEffect(() => {
    setAttendanceData([])
  }, [pluckingSearch.divisionID, pluckingSearch.empNo, pluckingSearch.fromDate, pluckingSearch.toDate]);

  useEffect(() => {
    if (parseInt(pluckingSearch.estateID) > 0) {
      trackPromise(
        getDivisionDetailsByEstateID(),
      );
    };
  }, [pluckingSearch.estateID]);

  useEffect(() => {
    setAttendanceData([]);
  }, [pluckingSearch.divisionID, pluckingSearch.fromDate, pluckingSearch.toDate]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWATTENDANCEPLUCKING');

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

    setPluckingSearch({
      ...pluckingSearch,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getAttendanceDetails() {
    let model = {
      groupID: parseInt(pluckingSearch.groupID),
      estateID: parseInt(pluckingSearch.estateID),
      divisionID: parseInt(pluckingSearch.divisionID),
      empNo: pluckingSearch.empNo,
      fromDate: pluckingSearch.fromDate,
      toDate: pluckingSearch.toDate
    }
    const item = await services.getAttendanceDetails(model);
    if (item.length !== 0) {
      setAttendanceData(item);
    } else {
      alert.error("No Records To Display")
    }

  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(pluckingSearch.groupID);
    setEstates(response);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(pluckingSearch.estateID);
    setDivisions(response);
  };

  async function handleClickDelete(employeeAttendanceID, musterchitID) {
    setSelectedAdvanceIssueID(employeeAttendanceID);
    setMusterChitID(musterchitID);
    setDeleteConfirmationOpen(true);
  }

  async function handleClickDeleteConfirm() {
    setDeleteConfirmationOpen(false);
    let model = {
      employeeAttendanceID: parseInt(selectedAdvanceIssueID),
      musterChitID: parseInt(musterchitID),
      createdBy: parseInt(tokenDecoder.getUserIDFromToken())
    }

    let response = await services.DeleteDailyCheckroll(model);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      setAttendanceData([])
      trackPromise(getAttendanceDetails())
    }
    else {
      alert.error(response.message);
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setPluckingSearch({
      ...pluckingSearch,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setPluckingSearch({
      ...pluckingSearch,
      fromDate: value
    });
  }

  function handleToDateChange(value) {
    setPluckingSearch({
      ...pluckingSearch,
      toDate: value
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader
            onClick={handleClick}
            isEdit={true}
            toolTiptitle={"Add Attendance Plucking"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Attendance - Plucking"
    >
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: pluckingSearch.groupID,
            estateID: pluckingSearch.estateID,
            divisionID: pluckingSearch.divisionID,
            empNo: pluckingSearch.empNo,
            fromDate: pluckingSearch.fromDate,
            toDate: pluckingSearch.toDate

          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
              estateID: Yup.number().min(1, "Please Select a Estate").required('Estate is required'),
              divisionID: Yup.number().min(1, "Please Select a Division").required('Division is required'),
              fromDate: Yup.date().required('From date is required').typeError('Invalid date'),
              toDate: Yup.date().required('To date is required').typeError('Invalid date')
            })
          }
          enableReinitialize
          onSubmit={() => trackPromise(getAttendanceDetails())}
        >
          {({
            errors,
            handleSubmit,
            touched
          }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={0}>
                <Card>
                  <CardHeader
                    title={cardTitle("Attendance Plucking")}
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent style={{ marginBottom: "2rem" }}>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group  *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            name="groupID"
                            onChange={(e) => handleChange(e)}
                            value={pluckingSearch.groupID}
                            variant="outlined"
                            size='small'
                            InputProps={{
                              readOnly: !permissionList.isGroupFilterEnabled,
                            }}
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="estateID">
                            Estate *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.estateID && errors.estateID)}
                            fullWidth
                            helperText={touched.estateID && errors.estateID}
                            name="estateID"
                            size='small'
                            onChange={(e) => {
                              handleChange(e)
                            }}
                            value={pluckingSearch.estateID}
                            variant="outlined"
                            id="estateID"
                            InputProps={{
                              readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                            }}
                          >
                            <MenuItem value={0}>--Select Estate--</MenuItem>
                            {generateDropDownMenu(estates)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="divisionID">
                            Division *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.divisionID && errors.divisionID)}
                            fullWidth
                            helperText={touched.divisionID && errors.divisionID}
                            name="divisionID"
                            size='small'
                            onChange={(e) => {
                              handleChange(e);
                            }}
                            value={pluckingSearch.divisionID}
                            variant="outlined"
                            id="divisionID"
                          >
                            <MenuItem value={0}>--Select Division--</MenuItem>
                            {generateDropDownMenu(divisions)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="empNo">
                            Employee No
                          </InputLabel>
                          <TextField
                            fullWidth
                            error={Boolean(touched.empNo && errors.empNo)}
                            helperText={touched.empNo && errors.empNo}
                            name="empNo"
                            size='small'
                            onChange={(e) => handleChange(e)}
                            value={pluckingSearch.empNo}
                            variant="outlined"
                            id="empNo"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="fromDate" style={{ marginBottom: '-8px' }}>
                            From Date *
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.fromDate && errors.fromDate)}
                              helperText={touched.fromDate && errors.fromDate}
                              autoOk
                              fullWidth
                              inputVariant="outlined"
                              format="MM/dd/yyyy"
                              margin="dense"
                              name="fromDate"
                              size='small'
                              id="fromDate"
                              value={pluckingSearch.fromDate}
                              maxDate={pluckingSearch.maxDate}
                              onChange={(e) => {
                                handleDateChange(e);
                              }}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="toDate" style={{ marginBottom: '-8px' }}>
                            To Date *
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.toDate && errors.toDate)}
                              helperText={touched.toDate && errors.toDate}
                              autoOk
                              fullWidth
                              inputVariant="outlined"
                              format="MM/dd/yyyy"
                              margin="dense"
                              name="toDate"
                              size='small'
                              id="toDate"
                              value={pluckingSearch.toDate}
                              maxDate={pluckingSearch.maxDate}
                              onChange={(e) => {
                                handleToDateChange(e);
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
                              color="primary"
                              variant="contained"
                              type="submit"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                }
                              }}
                            >
                              Search
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                    {attendanceData.length != 0 ?
                      <Box minWidth={1050}>
                        <MaterialTable
                          title="Multiple Actions Preview"
                          columns={[
                            { title: 'Date', field: 'attendanceDate', render: (rowData) => moment(rowData.attendanceDate).format('YYYY-MM-DD') },
                            { title: 'Employee No', field: 'employeeNumber' },
                            { title: 'Field', field: 'fieldName' },
                            { title: 'Plucking Type', field: 'jobTypeName' },
                            { title: 'Total(Kg)', field: 'amount', render: (rowData) => (rowData.amount).toFixed(2) },
                            { title: 'Over(Kg)', field: 'overKilo', render: (rowData) => rowData.jobTypeName === "Cash Kilo" ? '-' : (rowData.overKilo).toFixed(2) },
                            { title: 'Man Days', field: 'manDays', render: (rowData) => rowData.jobTypeName === "Cash Kilo" ? '-' : (rowData.manDays).toFixed(2) },
                          ]}
                          data={attendanceData}
                          options={{
                            exportButton: false,
                            showTitle: false,
                            headerStyle: { textAlign: "center", height: '1%' },
                            cellStyle: { textAlign: "center" },
                            columnResizable: false,
                            actionsColumnIndex: -1
                          }}
                          actions={[
                            {
                              icon: 'mode',
                              tooltip: 'Edit Attendance',
                              onClick: (event, rowData) => { handleClickEdit(rowData.employeeAttendanceID) }
                            },
                            {
                              icon: 'delete',
                              tooltip: 'Delete Attendance',
                              onClick: (event, rowData) => { handleClickDelete(rowData.employeeAttendanceID, rowData.musterChitID) }
                            },
                          ]}
                        />
                      </Box> : null}
                    <Dialog open={deleteConfirmationOpen} onClose={handleCancelDelete} maxWidth="sm" fullWidth>
                      <DialogTitle style={{ fontSize: '30px' }}>Confirmation</DialogTitle>
                      <DialogContent style={{ fontSize: '16px' }}>
                        <p>Are you sure you want to delete?</p>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleClickDeleteConfirm} color="primary">
                          Delete
                        </Button>
                        <Button onClick={handleCancelDelete} color="primary">
                          Cancel
                        </Button>

                      </DialogActions>
                    </Dialog>
                  </PerfectScrollbar>
                </Card>
              </Box>
            </form>
          )}
        </Formik>
      </Container>
    </Page>
  );
};

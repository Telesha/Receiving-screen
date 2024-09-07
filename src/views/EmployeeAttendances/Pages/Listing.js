import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";

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

const screenCode = 'EMPLOYEEATTENDANCES';
export default function EmployeeAttendancesListing() {
  const classes = useStyles();
  const [attendanceData, setAttendanceData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [isHideField, setIsHideField] = useState(true);
  const [employeeAttendances, setEmployeeAttendances] = useState({
    groupID: '0',
    factoryID: '0',
    date: ''
  })
  const alert = useAlert();
  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/employeeAttendances/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermissions());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown());
  }, [employeeAttendances.groupID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEEATTENDANCES');

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

    setEmployeeAttendances({
      ...employeeAttendances,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getEmployeeAttendanceDetails() {
    let model = {
      groupID: parseInt(employeeAttendances.groupID),
      factoryID: parseInt(employeeAttendances.factoryID),
      attendanceDate: employeeAttendances.date,
    }
    const AttendanceDetails = await services.GetEmployeeAttendanceDetailsByDate(model);
    if (AttendanceDetails.length != 0) {
      setAttendanceData(AttendanceDetails);
      setIsHideField(false);
    }
    else {
      alert.error("No record to display")
      setIsHideField(true);
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(employeeAttendances.groupID);
    setFactories(factories);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setEmployeeAttendances({
      ...employeeAttendances,
      [e.target.name]: value
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
            toolTiptitle={"Add Labour Attendances"}
          />
        </Grid>
      </Grid>
    )
  }
  function checkDayType(empDayType, isFullDay, isHalfDay, isLeave) {
    if (empDayType == 1 || isFullDay == 1) {
      return (<span>Full Day</span>);
    }
    else if (empDayType == 2 || isHalfDay == 1) {
      return (<span>HalfDay</span>)
    } else if (empDayType == 3 || isLeave == 1) {
      return (<span>Leave</span>);
    } else {
      return (<div style={{ backgroundColor: "#ffcdd2", padding: "10px", borderRadius: "5px" }}>
        <span>Data is Invalid</span>
      </div>)
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page
        className={classes.root}
        title="View Labour Attendances"
      >
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: employeeAttendances.groupID,
              factoryID: employeeAttendances.factoryID,
              date: employeeAttendances.date
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory is required'),
                date: Yup.date().required('Date is required')
              })
            }
            onSubmit={() => trackPromise(getEmployeeAttendanceDetails())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              isSubmitting,
              touched,
              values,
              props
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle("View Labour Attendances")}
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
                              helperText={touched.groupID && errors.groupID}
                              fullWidth
                              name="groupID"
                              onChange={(e) => handleChange(e)}
                              value={employeeAttendances.groupID}
                              variant="outlined"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory  *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              helperText={touched.factoryID && errors.factoryID}
                              fullWidth
                              name="factoryID"
                              onChange={(e) => handleChange(e)}
                              value={employeeAttendances.factoryID}
                              variant="outlined"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="date">
                              Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.date && errors.date)}
                              helperText={touched.date && errors.date}
                              fullWidth
                              id="date"
                              name="date"
                              type="date"
                              value={employeeAttendances.date}
                              onChange={(e) => handleChange(e)}
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                          </Grid>
                        </Grid>
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050} hidden={isHideField}>

                        <MaterialTable
                          title="Multiple Actions Preview"
                          columns={[
                            { title: 'Date', field: 'attendanceDate', render: rowData => rowData.attendanceDate.split('T')[0] },
                            { title: 'Emp Name', field: 'fullName' },
                            { title: 'Reg No', field: 'registrationNumber' },
                            { title: 'Shift', field: 'shift', render: rowData => rowData.shiftID == 1 ? "Day" : "Night" },
                            { title: 'Full /Half /Leave', field: 'dayType', render: rowData => (checkDayType(rowData.dayType, rowData.isFullDay, rowData.isHalfDay, rowData.isLeave)) },
                            { title: 'Day OT', field: 'dayOT', render: rowData => rowData.dayOT == 1 ? rowData.dayOT + ' hour' : rowData.dayOT + ' hours' },
                            { title: 'Night OT', field: 'nightOT', render: rowData => rowData.nightOT == 1 ? rowData.nightOT + ' hour' : rowData.nightOT + ' hours' },
                            { title: 'Double OT', field: 'doubleOT', render: rowData => rowData.doubleOT == 1 ? rowData.doubleOT + ' hour' : rowData.doubleOT + ' hours' }
                          ]}
                          data={attendanceData}
                          options={{
                            exportButton: false,
                            showTitle: false,
                            headerStyle: { textAlign: "left", height: '1%' },
                            cellStyle: { textAlign: "left" },
                            columnResizable: false,
                            actionsColumnIndex: -1,
                            pageSize: 10
                          }}
                        />
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page >
    </Fragment>
  );
};

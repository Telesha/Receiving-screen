import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, TextareaAutosize
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

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
const screenCode = 'SALARYADDITIONDEDUCTION';
export default function SalaryAdditionsDeductionsAddEdit(props) {
  const [title, setTitle] = useState("Add Salary Additions / Deductions")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isHideField, setIsHideField] = useState(true);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [isSearchButton, setIsSearchButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [salaryDetails, setsalaryDetails] = useState({
    groupID: '0',
    factoryID: '0',
    employeeID: '0',
    amount: "",
    reason: '0',
    transactionType: '0',
    shedule: '0',
    epfNo: '',
    regNo: ''
  });
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/salaryAdditionDeduction/listing');
  }
  const alert = useAlert();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [fromDate, handleFromDate] = useState(new Date());

  useEffect(() => {
    if (decrypted != 0) {
      trackPromise();
    }
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown())
  }, [salaryDetails.groupID]);

  useEffect(() => {
    trackPromise(getEmployeeDayWiseData())
  }, [salaryDetails.attendanceDate]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(salaryDetails.groupID);
    setFactories(factories);
  }
  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITSALARYADDITIONDEDUCTION');

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

    if (decrypted == 0) {
      setsalaryDetails({
        ...salaryDetails,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
  }
  async function getEmployeeDayWiseData() {
    let model = {
      startDate: salaryDetails.attendanceDate,
      employeeID: salaryDetails.employeeID
    }
    const result = await services.GetEmployeeDayWiseData(model);

    if (result != null) {
      if (decrypted == 0) {
        setsalaryDetails({
          ...salaryDetails,
          employeeAttendanceID: result.employeeAttendanceID,
          days: result.dayType,
          dayOT: result.dayOT,
          nightOT: result.nightOT,
        })
        setIsSearchButton(true);
        setIsUpdate(true);
      }
      else {
        setsalaryDetails({
          ...salaryDetails,
          employeeAttendanceID: result.employeeAttendanceID,
          days: result.dayType,
          dayOT: result.dayOT,
          nightOT: result.nightOT,
        });
        setIsUpdate(true);
        setIsDisableButton(false);
      }
    }
    else {
      if (decrypted == 0) {
        setIsUpdate(false);
        setsalaryDetails({
          ...salaryDetails,
          days: 1,
          dayOT: 0,
          nightOT: 0,
        });
        setIsSearchButton(false);
      }
      else {
        setsalaryDetails({
          ...salaryDetails,
          days: 1,
          dayOT: 0,
          nightOT: 0,
        });
        alert.error("EMPLOYEE NOT ATTEND");
        setIsDisableButton(true);
      }
    }
  }

  async function getEmployeDetails() {
    const response = await services.getEmployeeDetailsByFactoryIDRegistrationNumberEPFNumber(salaryDetails.factoryID, salaryDetails.regNo, salaryDetails.epfNo);
    if (response === null) {
      setIsHideField(true)
      alert.error("THIS IS INACTIVE EMPLOYEE REG NO");
    }
    else {
      setIsHideField(false)
      setsalaryDetails({
        ...salaryDetails,
        empName: response.fullName,
        nic: response.nicNumber,
        employeeID: response.employeeID
      })
    }
  }

  async function saveSalaryAdditionsDeductions() {
    let response = await services.saveSalaryAdditionsDeductions(salaryDetails, tokenService.getUserIDFromToken(), (fromDate.toISOString()).split('T')[0]);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      setIsDisableButton(true);
      navigate('/app/salaryAdditionDeduction/listing');
    }
    else {
      alert.error(response.message);
    }
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
      }
    }
    return items
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setsalaryDetails({
      ...salaryDetails,
      [e.target.name]: value
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setsalaryDetails({
      ...salaryDetails,
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
          />
        </Grid>
      </Grid>
    )
  }

  function clearFields() {
    setsalaryDetails({ ...salaryDetails, regNo: '', epfNo: '', transactionType: '0', reason: '0', shedule: '0', amount: '' });
    setIsHideField(true)
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <CardContent>
          <Card>
            <Container maxWidth={false}>
              <Formik
                initialValues={{
                  groupID: salaryDetails.groupID,
                  factoryID: salaryDetails.factoryID,
                  regNo: salaryDetails.regNo,
                  epfNo: salaryDetails.epfNo
                }}
                validationSchema={
                  Yup.object().shape({
                    groupID: Yup.number().required('Group required').min("1", 'Group required'),
                    factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                    regNo: Yup.string().required('Registration number is required')
                  })
                }
                onSubmit={() => trackPromise(getEmployeDetails())}
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
                                onChange={(e) => handleChange1(e)}
                                value={salaryDetails.groupID}
                                variant="outlined"
                                id="groupID"
                                InputProps={{
                                  readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                                }}
                                size="small"
                              >
                                <MenuItem value="0">--Select Group--</MenuItem>
                                {generateDropDownMenu(groups)}
                              </TextField>
                            </Grid>

                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="factoryID">
                                Factory *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.factoryID && errors.factoryID)}
                                fullWidth
                                helperText={touched.factoryID && errors.factoryID}
                                name="factoryID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={salaryDetails.factoryID}
                                variant="outlined"
                                id="factoryID"
                                InputProps={{
                                  readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                                }}
                                size="small"
                              >
                                <MenuItem value="0">--Select Factory--</MenuItem>
                                {generateDropDownMenu(factories)}
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="regNo">
                                Reg No *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.regNo && errors.regNo)}
                                fullWidth
                                helperText={touched.regNo && errors.regNo}
                                name="regNo"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={salaryDetails.regNo}
                                variant="outlined"
                                disabled={isDisableButton}
                                InputProps={{
                                  readOnly: isUpdate ? true : false
                                }}
                                size="small"
                              />
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="epfNo">
                                EPF No
                              </InputLabel>
                              <TextField
                                fullWidth
                                name="epfNo"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={salaryDetails.epfNo}
                                variant="outlined"
                                disabled={isDisableButton}
                                InputProps={{
                                  readOnly: isUpdate ? true : false
                                }}
                                size="small"
                              />
                            </Grid>
                          </Grid>
                          <br></br>
                          <Box display="flex" justifyContent="flex-end" p={2} >
                            <Button
                              color="primary"
                              type="reset"
                              variant="contained"
                              onClick={() => clearFields()}
                            >
                              Clear
                            </Button>
                            <div>&nbsp;</div>
                            <Button
                              color="primary"
                              disabled={isSubmitting || isSearchButton}
                              type="submit"
                              variant="contained"
                            >
                              Search
                            </Button>
                          </Box>
                          {isHideField == false ?
                            <Grid container spacing={3}>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="empName">
                                  Employee Name
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.empName && errors.empName)}
                                  fullWidth
                                  helperText={touched.empName && errors.empName}
                                  name="empName"
                                  onBlur={handleBlur}
                                  value={salaryDetails.empName}
                                  variant="outlined"
                                  disabled={isDisableButton}
                                  InputProps={{
                                    readOnly: true
                                  }}
                                  size='small'
                                />
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="nic">
                                  NIC
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.nic && errors.nic)}
                                  fullWidth
                                  helperText={touched.nic && errors.nic}
                                  name="nic"
                                  onBlur={handleBlur}
                                  value={salaryDetails.nic}
                                  variant="outlined"
                                  disabled={isDisableButton}
                                  InputProps={{
                                    readOnly: true
                                  }}
                                  size='small'
                                />
                              </Grid>
                            </Grid>
                            : null}

                        </CardContent>
                        <br></br>
                        <br></br>

                      </PerfectScrollbar>
                    </Box>
                  </form>
                )}
              </Formik>
            </Container>
            <Container maxWidth={false}>
              <Formik
                initialValues={{
                  date: salaryDetails.date,
                  transactionType: salaryDetails.transactionType,
                  reason: salaryDetails.reason,
                  shedule: salaryDetails.shedule,
                  amount: salaryDetails.amount
                }}
                validationSchema={
                  Yup.object().shape({
                    transactionType: Yup.number().required('Transaction Type is required').min("1", 'Transaction Type is required'),
                    shedule: Yup.number().required('Schedule is required').min("1", 'Schedule is required'),
                    amount: Yup.number().required('Amount is required').min("1", 'Amount is required'),
                  })
                }
                onSubmit={() => trackPromise(saveSalaryAdditionsDeductions())}
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
                      <PerfectScrollbar>
                        <CardContent hidden={isHideField}>
                          <Grid container spacing={3}>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="date">
                                Date *
                              </InputLabel>
                              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                  autoOk
                                  fullWidth
                                  variant="inline"
                                  format="dd/MM/yyyy"
                                  margin="dense"
                                  id="date"
                                  value={fromDate}
                                  maxDate={new Date()}
                                  onChange={(e) => {
                                    handleFromDate(e);
                                  }}
                                  KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                  }}
                                />
                              </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="transactionType">
                                Transaction Type *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.transactionType && errors.transactionType)}
                                fullWidth
                                helperText={touched.transactionType && errors.transactionType}
                                name="transactionType"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={salaryDetails.transactionType}
                                variant="outlined"
                                id="transactionType"
                                size="small"
                              >
                                <MenuItem value="0">--Select Transaction Type--</MenuItem>
                                <MenuItem value="1">Addition</MenuItem>
                                <MenuItem value="2">Deduction</MenuItem>
                              </TextField>
                            </Grid>
                            {values.transactionType == 1 ? <Grid item md={3} xs={12}>
                              <InputLabel shrink id="reason">
                                Reason *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.reason && errors.reason)}
                                fullWidth
                                helperText={touched.reason && errors.reason}
                                name="reason"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={salaryDetails.reason}
                                variant="outlined"
                                id="reason"
                                size="small"
                              >
                                <MenuItem value="0">--Select Reason--</MenuItem>
                                <MenuItem value="1">Bonous</MenuItem>
                                <MenuItem value="2">Other</MenuItem>
                              </TextField>
                            </Grid> : null}
                            {values.transactionType == 2 ? <Grid item md={3} xs={12}>
                              <InputLabel shrink id="reason">
                                Reason *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.reason && errors.reason)}
                                fullWidth
                                helperText={touched.reason && errors.reason}
                                name="reason"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={salaryDetails.reason}
                                variant="outlined"
                                id="reason"
                                size='small'
                              >
                                <MenuItem value="0">--Select Reason--</MenuItem>
                                <MenuItem value="1">Damage Company Property</MenuItem>
                                <MenuItem value="2">Other</MenuItem>
                              </TextField>
                            </Grid> : null}
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="shedule">
                                Schedule *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.shedule && errors.shedule)}
                                fullWidth
                                helperText={touched.shedule && errors.shedule}
                                name="shedule"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={salaryDetails.shedule}
                                variant="outlined"
                                id="shedule"
                                size='small'
                              >
                                <MenuItem value="0">--Select schedule--</MenuItem>
                                <MenuItem value="1">Daily</MenuItem>
                                <MenuItem value="2">Weekly</MenuItem>
                                <MenuItem value="1">Monthly</MenuItem>
                                <MenuItem value="2">Quarterly</MenuItem>
                                <MenuItem value="1">Yearly</MenuItem>
                                <MenuItem value="2">Onetime</MenuItem>
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="amount">
                                Amount (Rs) *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.amount && errors.amount)}
                                fullWidth
                                helperText={touched.amount && errors.amount}
                                name="amount"
                                type="number"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={salaryDetails.amount}
                                variant="outlined"
                                size="small"
                              />
                            </Grid>
                          </Grid>
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              color="primary"
                              disabled={isSubmitting || isDisableButton}
                              type="submit"
                              variant="contained"
                            >
                              {isUpdate == true ? "Update" : "Save"}
                            </Button>
                          </Box>
                        </CardContent>
                      </PerfectScrollbar>
                    </Box>
                  </form>
                )}
              </Formik>
            </Container>
          </Card>
        </CardContent>
      </Page>
    </Fragment>
  );
};

import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Page from 'src/components/Page';
import { useAlert } from "react-alert";
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
import Typography from '@material-ui/core/Typography';
import {
  Box,
  Card,
  makeStyles,
  Container,
  Divider,
  Button,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  CardHeader
} from '@material-ui/core';

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

const screenCode = 'EMPLOYEESALARYCALCULATION';
export default function EmployeeSalaryCalculation() {
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState();
  const [employeeBasicSalaryDetails, setEmployeeBasicSalaryDetails] = useState(0);
  const [employeeyEPFETFAmountDetails, setEmployeeyEPFETFAmountDetails] = useState(0);

  const [otAmountDetails, setotAmountDetails] = useState({});
  const [WorkedDayCount, setWorkedDayCount] = useState({});
  const [OTHoursCount, setOTHoursCount] = useState({});

  const [dayOTAmount, setdayOTAmount] = useState(0);
  const [nightOTAmount, setnightOTAmount] = useState(0);
  const [doubleAmount, setdoubleAmount] = useState(0);

  const [employeeBasicSalaryDetailsSearchList, setEmployeeBasicSalaryDetailsSearchList] = useState({
    groupID: '0',
    estateID: '0',
    registrationNumber: ''
  })

  const navigate = useNavigate();
  const alert = useAlert();

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    trackPromise(
      getPermissions(),
    );
  }, []);

  useEffect(() => {
    trackPromise(
      GetGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (employeeBasicSalaryDetailsSearchList.groupID > 0) {
      trackPromise(
        GetEstateDetailsByGroupID()
      );
    };
  }, [employeeBasicSalaryDetailsSearchList.groupID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEESALARYCALCULATION');

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

    setEmployeeBasicSalaryDetailsSearchList({
      ...employeeBasicSalaryDetailsSearchList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function GetGroupsForDropdown() {
    const groups = await services.GetAllGroups();
    setGroups(groups);
  }

  async function GetEstateDetailsByGroupID() {
    var estate = await services.GetEstateDetailsByGroupID(employeeBasicSalaryDetailsSearchList.groupID);
    setEstates(estate);
  }

  async function GetEmployeeBasicSalaryDetails() {
    let model = {
      groupID: parseInt(employeeBasicSalaryDetailsSearchList.groupID),
      estateID: parseInt(employeeBasicSalaryDetailsSearchList.estateID),
      registrationNumber: (employeeBasicSalaryDetailsSearchList.registrationNumber),
    }

    const response = await services.GetEmployeeBasicSalaryDetailsDetails(model);
    if (response === null) {
      alert.error("No records to Display");
    }
    else {
      setEmployeeBasicSalaryDetails(response);
      GetEmployeeEPFETFAmountsDetails();

      let results = await GetStatutoryDetails();
      let res = await GetEmployeeOTHoursCount();
      CalculateOtAmounts(results, res);
      GetEmployeeWorkedDayCountDetails();
    }
  }

  async function GetEmployeeWorkedDayCountDetails() {
    let model = {
      groupID: parseInt(employeeBasicSalaryDetailsSearchList.groupID),
      estateID: parseInt(employeeBasicSalaryDetailsSearchList.estateID),
      registrationNumber: (employeeBasicSalaryDetailsSearchList.registrationNumber),
    }

    const response = await services.GetEmployeeWorkedDayCount(model);
    setWorkedDayCount(response.data);
  }

  async function GetEmployeeOTHoursCount() {
    let model = {
      groupID: parseInt(employeeBasicSalaryDetailsSearchList.groupID),
      estateID: parseInt(employeeBasicSalaryDetailsSearchList.estateID),
      registrationNumber: (employeeBasicSalaryDetailsSearchList.registrationNumber),
    }

    const OTHoursCount = await services.GetEmployeeOTHoursCount(model);
    setOTHoursCount(OTHoursCount.data);

    return OTHoursCount.data;
  }

  async function GetEmployeeEPFETFAmountsDetails() {
    let model = {
      groupID: parseInt(employeeBasicSalaryDetailsSearchList.groupID),
      estateID: parseInt(employeeBasicSalaryDetailsSearchList.estateID),
      registrationNumber: (employeeBasicSalaryDetailsSearchList.registrationNumber),
    }

    const response = await services.GetEmployeeEpfEtfAmounts(model);
    if (response === null) {
      setEmployeeyEPFETFAmountDetails(0);
    }
    else {
      setEmployeeyEPFETFAmountDetails(response.employeeEPFAmount);
    }
  }

  function RefreshClearData() {
    setEmployeeBasicSalaryDetails(0);
    setEmployeeBasicSalaryDetailsSearchList({
      ...employeeBasicSalaryDetailsSearchList,
      groupID: '0',
      estateID: '0',
      registrationNumber: ''
    })
  }

  async function SaveEmployeeSalaryDetails() {
    let model = {
      groupID: parseInt(employeeBasicSalaryDetailsSearchList.groupID),
      estateID: parseInt(employeeBasicSalaryDetailsSearchList.estateID),
      empRegistrationNumber: (employeeBasicSalaryDetailsSearchList.registrationNumber),
      basicMonthlySalary: parseFloat(employeeBasicSalaryDetails.basicMonthlySalary),
      basicDailySalary: parseFloat(employeeBasicSalaryDetails.basicDailySalary),
      dayOTAmount: parseInt(dayOTAmount),
      nightOTAmount: parseInt(nightOTAmount),
      doubleOTAmount: parseInt(doubleAmount),
      otherAllowance: (employeeBasicSalaryDetails.otherAllowance),
      specialAllowance: (employeeBasicSalaryDetails.specialAllowance),
      employeeEPFAmount: (employeeyEPFETFAmountDetails),
      netSalary: netSalary,
      createdBy: parseInt(tokenDecoder.getUserIDFromToken())
    };

    let response = await services.SaveEmployeeSalaryDetails(model);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      RefreshClearData();
    }
    else {
      alert.error(response.message);
    }
  }

  async function GetStatutoryDetails() {
    var result = await services.GetOTAmountsDetails(employeeBasicSalaryDetailsSearchList.estateID, employeeBasicSalaryDetailsSearchList.groupID);
    setotAmountDetails(result);

    return result;
  }

  async function CalculateOtAmounts(results, res) {
    let dayOTAmounts = 0;
    let nightOTAmounts = 0;
    let doubleOTAmounts = 0;

    dayOTAmounts = parseFloat((results.dayOTAmount) * (res.dayOTCount)).toFixed(2)
    nightOTAmounts = parseFloat((results.nightOTAmount) * (res.nightOTCount)).toFixed(2)
    doubleOTAmounts = parseFloat((results.doubleOTAmount) * (res.doubleOTCount)).toFixed(2)

    setdayOTAmount(dayOTAmounts);
    setnightOTAmount(nightOTAmounts);
    setdoubleAmount(doubleOTAmounts);
  }

  const netSalary = (parseFloat(employeeBasicSalaryDetails.specialAllowance) +
    parseFloat(employeeBasicSalaryDetails.otherAllowance) + parseFloat(doubleAmount) + parseFloat(dayOTAmount) + parseFloat(nightOTAmount) +
    parseFloat(employeeBasicSalaryDetails.basicDailySalary) + parseFloat(employeeBasicSalaryDetails.basicMonthlySalary)) -
    parseFloat(employeeyEPFETFAmountDetails)

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
    setEmployeeBasicSalaryDetailsSearchList({
      ...employeeBasicSalaryDetailsSearchList,
      [e.target.name]: value
    });
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
  return (
    <Page
      className={classes.root}
      title="Items"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Employee Salary Calculation")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="groupID">
                      Group   *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      size='small'
                      name="groupID"
                      onChange={(e) => handleChange(e)}
                      value={employeeBasicSalaryDetailsSearchList.groupID}
                      variant="outlined"
                    >
                      <MenuItem value="0">--Select Group--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={8}>
                    <InputLabel shrink id="estateID">
                      Operation Entity *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="estateID"
                      onChange={(e) => handleChange(e)}
                      value={employeeBasicSalaryDetailsSearchList.estateID}
                      variant="outlined"
                      size='small'
                      id="estateID"
                    >
                      <MenuItem value="0">--Select Operation Entity--</MenuItem>
                      {generateDropDownMenu(estates)}
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={12}>
                    <InputLabel shrink id="registrationNumber">
                      Registration Number *
                    </InputLabel>
                    <TextField
                      fullWidth
                      name="registrationNumber"
                      onChange={(e) => handleChange(e)}
                      size='small'
                      value={employeeBasicSalaryDetailsSearchList.registrationNumber}
                      variant="outlined"
                      id="registrationNumber"
                      type="text"
                    >
                    </TextField>
                  </Grid>
                  <br />
                  <br />
                  <Grid container justify="flex-end">
                    <Box pr={2}>
                      <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        onClick={GetEmployeeBasicSalaryDetails}
                        size='small'
                      >
                        Calculate
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              {Object.keys(employeeBasicSalaryDetails).length > 0 ?
                <CardContent style={{ justifyContent: "center" }} >
                  <Grid style={{ justifyContent: "center", paddingLeft: 200 }}>
                    {employeeBasicSalaryDetails.basicMonthlySalary != 0 ?
                      <Grid container spacing={1}>
                        <Grid item md={7} xs={12}>
                          <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Basic Monthly Salary</Typography>
                          <Grid Grid container spacing={1}>
                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                            <Grid Grid container spacing={1}>
                              <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                              <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }}
                                align="right">{parseFloat(employeeBasicSalaryDetails.basicMonthlySalary).toFixed(2)}</Typography></Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                      :
                      <Grid container spacing={1}>
                        <Grid item md={7} xs={12}>
                          <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Basic Daily Salary</Typography>
                          <Grid Grid container spacing={1}>
                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                            <Grid Grid container spacing={1}>
                              <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                              <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }}
                                align="right">{parseFloat(employeeBasicSalaryDetails.basicDailySalary).toFixed(2)}</Typography></Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    }
                    <br />
                    <br></br>
                    {employeeBasicSalaryDetails.basicDailySalary > 0 ?
                      <>
                        <Grid container spacing={1}>
                          <Grid item md={7} xs={12}>
                            <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Over Time</Typography>
                            <Grid Grid container spacing={1}>
                              <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                              <Grid Grid container spacing={1}>
                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem" }} align="right"></Typography></Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                        <br></br>
                        <Grid container spacing={1}>
                          <Grid item md={7} xs={12}>
                            <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Day OT </Typography>
                            <Grid Grid container spacing={1}>
                              <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                              <Grid Grid container spacing={1}>
                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }}
                                  align="right">{dayOTAmount}</Typography></Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                        <br />
                        <Grid container spacing={1}>
                          <Grid item md={7} xs={12}>
                            <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Night OT </Typography>
                            <Grid Grid container spacing={1}>
                              <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                              <Grid Grid container spacing={1}>
                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }}
                                  align="right">{nightOTAmount}</Typography></Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                        <br />
                        <Grid container spacing={1}>
                          <Grid item md={7} xs={12}>
                            <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Double OT </Typography>
                            <Grid Grid container spacing={1}>
                              <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                              <Grid Grid container spacing={1}>
                                <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                                <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }}
                                  align="right">{doubleAmount}</Typography></Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                        <br />
                        <br />
                      </>
                      : null}
                    <Grid container spacing={1}>
                      <Grid item md={7} xs={12}>
                        <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Allowances</Typography>
                        <Grid Grid container spacing={1}>
                          <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                          <Grid Grid container spacing={1}>
                            <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                            <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem" }} align="right"></Typography></Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <br />
                    <Grid container spacing={1}>
                      <Grid item md={7} xs={12}>
                        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Other Allowances</Typography>
                        <Grid Grid container spacing={1}>
                          <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                          <Grid Grid container spacing={1}>
                            <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                            <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }}
                              align="right">{parseFloat(employeeBasicSalaryDetails.otherAllowance).toFixed(2)}</Typography></Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <br />
                    <Grid container spacing={1}>
                      <Grid item md={7} xs={12}>
                        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">Special Allowances</Typography>
                        <Grid Grid container spacing={1}>
                          <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                          <Grid Grid container spacing={1}>
                            <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                            <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }}
                              align="right">{parseFloat(employeeBasicSalaryDetails.specialAllowance).toFixed(2)}</Typography></Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <br></br>
                    <br></br>
                    <Grid container spacing={1}>
                      <Grid item md={7} xs={12}>
                        <Typography variant='h5' style={{ marginLeft: "4rem", fontWeight: "bold" }} align="left">Salary Deductions</Typography>
                        <Grid Grid container spacing={1}>
                          <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                          <Grid Grid container spacing={1}>
                            <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                            <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem" }} align="right"></Typography></Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <br></br>
                    <Grid container spacing={1}>
                      <Grid item md={7} xs={12}>
                        <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">EPF</Typography>
                        <Grid Grid container spacing={1}>
                          <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                          <Grid Grid container spacing={1}>
                            <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                            <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#e6ffe6" }}
                              align="right">{parseFloat(employeeyEPFETFAmountDetails).toFixed(2)}</Typography></Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <br></br>
                    <>
                      <Grid container spacing={1} >
                        <Grid item md={7} xs={12}>
                          <Typography variant='h5' style={{ marginLeft: "5rem" }} align="left">{ }</Typography>
                          <Grid Grid container spacing={1}>
                            <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                            <Grid Grid container spacing={1}>
                              <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                              <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", backgroundColor: "#ffcccb" }} align="right">{ }</Typography></Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                      <br></br>
                    </>
                    <div style={{ paddingRight: 200 }}>
                      <hr></hr>
                    </div>
                    <Grid style={{ marginTop: "1rem" }} container spacing={1}>
                      <Grid item md={7} xs={12}>
                        <Typography variant='h5' style={{ marginLeft: "2rem", fontWeight: 'bold', fontSize: '18px' }} align="left">Total Pay</Typography>
                        <Grid Grid container spacing={1}>
                          <Typography variant='h5' style={{ marginLeft: "10rem" }} align="left">{""}</Typography>
                          <Grid Grid container spacing={1}>
                            <Grid item md={9} xs={12} ><Typography style={{ marginLeft: "15rem" }} align="left">{""}</Typography></Grid>
                            <Grid item md={3} xs={12} ><Typography style={{ marginTop: "-1.2rem", fontWeight: "bold" }}
                              align="right">{parseFloat(netSalary).toFixed(2)}</Typography></Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <Grid container justify="flex-end">
                    <Box pr={2}>
                      <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        onClick={SaveEmployeeSalaryDetails}
                        size='small'
                      >
                        Save
                      </Button>
                    </Box>
                  </Grid>
                  <br></br>
                </CardContent>
                : null}
            </PerfectScrollbar>
          </Card>
        </Box>
      </Container>
    </Page >
  );
};

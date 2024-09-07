import React, { useState, useEffect, Fragment } from 'react';
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
import { useAlert } from "react-alert";
import _ from 'lodash';
import tokenDecoder from '../../../../utils/tokenDecoder';
import Typography from '@material-ui/core/Typography'


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

const screenCode = 'EPFETFCALCULATION';

export default function StatutoryCalculation(props) {

  const [title, setTitle] = useState("EPF/ETF Calculation")
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [isHideField, setIsHideField] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statutoryCalculationDetails, setStatutoryCalculationDetails] = useState([]);

  const [employeeStatutoryDetails, setEmployeeStatutoryDetails] = useState([]);
  const [employerStatutoryDetails, setEmployerStatutoryDetails] = useState([]);

  const [employeeEPFamountPercentage, setEmployeeEPFAmountPercentage] = useState([]);
  const [employeeEPFFixedAmount, setEmployeeEPFFixedAmount] = useState([]);

  const [employeeEpfAmount, setEmployeeEpfAmount] = useState('');

  const [employerEPFamountPercentage, setEmployerEPFAmountPercentage] = useState([]);
  const [employerEPFamountFixed, setEmployerEPFAmountFixed] = useState([]);

  const [employerETFamountPercentage, setEmployerETFAmountPercentage] = useState([]);

  const [employerETFamountFixed, setEmployerETFAmountFixed] = useState([]);

  const [employerEpfAmount, setEmployerEpfAmount] = useState('');
  const [employerEtfAmount, setEmployerEtfAmount] = useState('');

  const [basicMonthlySalary, setBasicMonthlySalary] = useState([]);
  const [labourDayCount, setLabourCount] = useState('');
  const [basicDailySalary, setBasicDailySalary] = useState([]);

  const [netSalary, setNetSalary] = useState([]);
  const [sum, setSum] = useState('');

  const [statutoryCalculationSearchDetails, setStatutoryCalculationSearchDetails] = useState({
    groupID: 0,
    estateID: 0,
    registrationNumber: '',
  })

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const navigate = useNavigate();
  const alert = useAlert();

  useEffect(() => {
    getPermission();
  }, [])

  useEffect(() => {
    if (statutoryCalculationSearchDetails.groupID != 0) {
      trackPromise(GetGroupsForDropdown())
    }
  }, [statutoryCalculationSearchDetails.groupID]);

  useEffect(() => {
    if (statutoryCalculationSearchDetails.groupID != 0) {
      trackPromise(GetEstateDetailsByGroupID());
    }
  }, [statutoryCalculationSearchDetails.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'EPFETFCALCULATION');

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

    setStatutoryCalculationSearchDetails({
      ...statutoryCalculationSearchDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function GetEmployeeSalaryDetails() {
    let model = {
      groupID: parseInt(statutoryCalculationSearchDetails.groupID),
      estateID: parseInt(statutoryCalculationSearchDetails.estateID),
      registrationNumber: (statutoryCalculationSearchDetails.registrationNumber),
    }

    const response = await services.GetEmployeeBasicSalaryDetailsDetails(model);
    if (response.length != 0) {
      setStatutoryCalculationDetails(response);
      setIsHideField(false);
      GetEmployeeStatutoryDetails();
      GetEmployerStatutoryDetails();

      let basicMonthlySalary = 0;
      let basicDailySalary = 0;

      response.forEach(x => {
        basicMonthlySalary = parseFloat(x.basicMonthlySalary).toFixed(2);
        basicDailySalary = parseFloat(x.basicDailySalary).toFixed(2);
      });
      setBasicMonthlySalary(basicMonthlySalary);
      setBasicDailySalary(basicDailySalary)
    }
    else {
      setIsHideField(true);
      alert.error("No records to Display");
    }
    //if (response[0].employeeCategoryID === 2 || response[0].employeeCategoryID === 3) {
    if (response[0] && (response[0].employeeCategoryID === 2 || response[0].employeeCategoryID === 3)) {

      let model = {
        groupID: parseInt(statutoryCalculationSearchDetails.groupID),
        estateID: parseInt(statutoryCalculationSearchDetails.estateID),
        registrationNumber: (statutoryCalculationSearchDetails.registrationNumber),
      }
      const response = await services.GetEmployeeWorkedDayCount(model);

      let labourdayCount = 0

      response.forEach(x => {
        labourdayCount = (x.dayCount);
      });
      setLabourCount(labourdayCount)
    }
  }

  const laborETF = parseFloat(((basicDailySalary * labourDayCount) * employerETFamountPercentage) / 100).toFixed(2)

  async function GetEmployeeStatutoryDetails() {
    let model = {
      groupID: parseInt(statutoryCalculationSearchDetails.groupID),
      estateID: parseInt(statutoryCalculationSearchDetails.estateID),
    }
    const response = await services.GetEmployeeStatutoryDetails(model);
    setEmployeeStatutoryDetails(response)

    if (response[0].fixedAmount > 0) {
      setEmployeeEPFFixedAmount(response[0].fixedAmount)
    } else {
      setEmployeeEPFAmountPercentage(response[0].percentageAmount)
    }
  }

  async function GetEmployerStatutoryDetails() {
    let model = {
      groupID: parseInt(statutoryCalculationSearchDetails.groupID),
      estateID: parseInt(statutoryCalculationSearchDetails.estateID),
    }
    const response = await services.GetEmployerStatutoryDetails(model);
    setEmployerStatutoryDetails(response)

    let epfAmountPercentage = 0.0;
    let epfAmountFixed = 0.0;
    let etfAmountPercentage = 0.0;
    let etfAmountFixed = 0.0;

    const epfDeductType = (response.filter(
      (element) => element.deductionTypeCode === 1)
    );

    epfDeductType.forEach(x => {
      epfAmountPercentage = parseFloat(x.percentageAmount);
      epfAmountFixed = parseFloat(x.fixedAmount)
    });

    const etfDeductType = (response.filter(
      (element) => element.deductionTypeCode === 2)
    );
    etfDeductType.forEach(x => {
      etfAmountPercentage = parseFloat(x.percentageAmount);
      etfAmountFixed = parseFloat(x.fixedAmount);
    });

    setEmployerEPFAmountPercentage(epfAmountPercentage);
    setEmployerEPFAmountFixed(epfAmountFixed);
    setEmployerETFAmountPercentage(etfAmountPercentage);
    setEmployerETFAmountFixed(etfAmountFixed);
  }

  async function GetGroupsForDropdown() {
    const groups = await services.GetAllGroups();
    setGroups(groups);
  }

  async function GetEstateDetailsByGroupID() {
    var response = await services.GetEstateDetailsByGroupID(statutoryCalculationSearchDetails.groupID);
    setEstates(response);
  };

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
  }

  async function ClearTable() {
    clearState();
  }

  function CalculateAmounts() {

    let employeeEpfAmount = 0;
    let employerEpfAmount = 0;
    let employerEtfAmount = 0;
    let netsal = 0;

    if (statutoryCalculationDetails[0].isEPFEnable === 1) {

      if (statutoryCalculationDetails[0].employeeCategoryID === 1) {
        if (employeeStatutoryDetails[0].applyTypeID === 2) {
          employeeEpfAmount = parseFloat((basicMonthlySalary * employeeEPFamountPercentage) / 100).toFixed(2)
          setEmployeeEpfAmount(employeeEpfAmount);
        } else
          employeeEpfAmount = employeeEPFFixedAmount
        setEmployeeEpfAmount(employeeEpfAmount);
      } else if (statutoryCalculationDetails[0].employeeCategoryID === 2 || statutoryCalculationDetails[0].employeeCategoryID === 3) {
        if (employeeStatutoryDetails[0].applyTypeID === 2) {
          employeeEpfAmount = parseFloat(((basicDailySalary * labourDayCount) * employeeEPFamountPercentage) / 100).toFixed(2)
          setEmployeeEpfAmount(employeeEpfAmount);
        }
      }

      (employerStatutoryDetails.filter(
        (element) => {
          if (statutoryCalculationDetails[0].employeeCategoryID === 1) {
            if (element.applyTypeID === 2) {
              employerEpfAmount = parseFloat((basicMonthlySalary * employerEPFamountPercentage) / 100).toFixed(2)
              setEmployerEpfAmount(employerEpfAmount);

              employerEtfAmount = parseFloat((basicMonthlySalary * employerETFamountPercentage) / 100).toFixed(2)
              setEmployerEtfAmount(employerEtfAmount);

            } else if (element.applyTypeID === 1) {
              employerEpfAmount = parseFloat(employerEPFamountFixed)
              setEmployerEpfAmount(employerEpfAmount);

              employerEtfAmount = parseFloat(employerETFamountFixed)
              setEmployerEtfAmount(employerEtfAmount)
            }
          } else if (statutoryCalculationDetails[0].employeeCategoryID === 2 || statutoryCalculationDetails[0].employeeCategoryID === 3) {
            if (element.applyTypeID === 2) {
              employerEpfAmount = parseFloat(((basicDailySalary * labourDayCount) * employerEPFamountPercentage) / 100).toFixed(2)
              setEmployerEpfAmount(employerEpfAmount);
            } else
              employerEpfAmount = parseFloat(employerEPFamountFixed)
            setEmployerEpfAmount(employerEpfAmount);

            employerEtfAmount = parseFloat(employerETFamountFixed)
            setEmployerEtfAmount(employerEtfAmount)
          }
        })
      );

      netsal = parseFloat((basicMonthlySalary - employeeEpfAmount)).toFixed(2)
      setNetSalary(netsal);

      if (basicMonthlySalary > 0) {
        const newSum = parseFloat(employeeEpfAmount) + parseFloat(employerEpfAmount) + parseFloat(employerEtfAmount);
        setSum(newSum);
      } else {
        const newSumDaily = parseFloat(employeeEpfAmount) + parseFloat(employerEpfAmount) + parseFloat(laborETF);
        setSum(newSumDaily);
      }
    } else {
      alert.error("Employee does not have an EPF");
    }
  };

  function clearState() {
    setStatutoryCalculationSearchDetails({
      ...statutoryCalculationSearchDetails,
      groupID: 0,
      estateID: 0,
      registrationNumber: '',
    });
  };

  const employerEtfDeductType = (employerStatutoryDetails.filter(
    (element) => element.deductionTypeID === 3)
  );

  const employerEpfDeductType = (employerStatutoryDetails.filter(
    (element) => element.deductionTypeID === 1)
  );

  function CalculateSalaryInfo() {
    CalculateAmounts();
  };

  async function SaveStatoryDetails() {
    let saveModel = {
      empRegistrationNumber: statutoryCalculationSearchDetails.registrationNumber,
      employeeEPFAmount: parseInt(employeeEpfAmount),
      employerEPFAmount: parseInt(employerEpfAmount),
      employerETFAmount: parseInt(employerEtfAmount),
      totalEPFETFAmount: sum,
      createdBy: parseInt(tokenDecoder.getUserIDFromToken())
    };

    let response = await services.SaveEpfEtfCalculationDetails(saveModel);
    if (response.statusCode == "Success") {
      alert.success(response.message);
    }
    else {
      alert.error(response.message);
    }
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

  const totalContribution = employeeEPFamountPercentage + employerEPFamountPercentage + employerETFamountPercentage

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setStatutoryCalculationSearchDetails({
      ...statutoryCalculationSearchDetails,
      [e.target.name]: value
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: statutoryCalculationSearchDetails.groupID,
              estateID: statutoryCalculationSearchDetails.estateID,
              registrationNumber: statutoryCalculationSearchDetails.registrationNumber,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
              })
            }
            onSubmit={() => trackPromise(GetEmployeeSalaryDetails())}
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
                              value={statutoryCalculationSearchDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
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
                              value={statutoryCalculationSearchDetails.estateID}
                              variant="outlined"
                              id="estateID"
                              size='small'
                            >
                              <MenuItem value={0}>--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Registration Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                              fullWidth
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              name="registrationNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={statutoryCalculationSearchDetails.registrationNumber}
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
                                onClick={GetEmployeeSalaryDetails}
                                size='small'
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                        <br />
                        <br />
                        <Divider />
                        <br />
                        {statutoryCalculationDetails.length > 0 ?
                          <Box display="flex" justifyContent="flex-end" pr={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type="click"
                              onClick={CalculateSalaryInfo}
                              size='small'
                            >
                              Calculate
                            </Button>
                          </Box>
                          : null}
                        <br />
                        <Grid container spacing={3}>
                          <Grid item xs={3}>
                          </Grid>
                          <Grid item xs={6}>
                            {netSalary.length > 0 ?
                              <  >
                                <Card style={{
                                  padding: 30, marginTop: 20, minHeight: 180, boxShadow: "0 8px 40px -12px rgba(0,0,0,0.3)", "&:hover": {
                                    boxShadow: "0 16px 70px -12.125px rgba(0,0,0,0.3)"
                                  }, margin: "auto", maxWidth: 500
                                }}>
                                  <Grid container rowSpacing={12}>
                                    <Grid xs={12}>
                                      <Typography variant="h5" component="h2">Employee Salary </Typography>
                                    </Grid>
                                    <Grid xs={12}>
                                      <Divider />
                                    </Grid>
                                    <br />
                                    {statutoryCalculationDetails.map(item => (
                                      <>
                                        {item.basicMonthlySalary > 0 ?
                                          <>
                                            <Grid xs={6}>
                                              <Typography variant="body2" component="h2"> Basic Monthly Salary </Typography>
                                            </Grid>
                                            <Grid xs={6}>
                                              <InputLabel > {": " + basicMonthlySalary} </InputLabel>
                                            </Grid>
                                          </> :
                                          <><Grid xs={6} >
                                            <Typography variant="body2" component="h2"> Basic Daily Salary </Typography>
                                          </Grid>
                                            <Grid xs={6}>
                                              <InputLabel  > {": " + basicDailySalary} </InputLabel>
                                            </Grid>
                                          </>}
                                      </>
                                    ))}
                                    <Grid xs={12}>
                                    </Grid>
                                    <br />
                                    <Grid xs={12}>
                                      <Typography variant="h5" component="h2">Employee Contribution </Typography>
                                    </Grid>
                                    <Grid xs={12}>
                                      <Divider />
                                    </Grid>
                                    <br />
                                    <Grid xs={6}>
                                      <Typography variant="body2" component="h2"> EPF ({employeeEPFamountPercentage}%)</Typography>
                                    </Grid>
                                    <Grid xs={6}>
                                      <InputLabel > {": " + employeeEpfAmount} </InputLabel>
                                    </Grid>
                                    <Grid xs={12}>
                                    </Grid>
                                    <br />
                                    <Grid xs={12}>
                                      <Typography variant="h5" component="h2">Employer Contribution </Typography>
                                    </Grid>
                                    <Grid xs={12}>
                                      <Divider />
                                    </Grid>
                                    <br />
                                    <Grid xs={6}>
                                      <Typography variant="body2" component="h2"> EPF ({employerEPFamountPercentage}%)</Typography>
                                    </Grid>
                                    <Grid xs={6}>
                                      <InputLabel > {": " + employerEpfAmount} </InputLabel>
                                    </Grid>
                                    {statutoryCalculationDetails.map(item => (
                                      <>
                                        {item.basicMonthlySalary > 0 ?
                                          <>
                                            <Grid xs={6}>
                                              <Typography variant="body2" component="h2"> ETF ({employerETFamountPercentage}%)</Typography>
                                            </Grid>
                                            <Grid xs={6}>
                                              <InputLabel > {": " + employerEtfAmount} </InputLabel>
                                            </Grid>
                                          </> : <>
                                            <Grid xs={6}>
                                              <Typography variant="body2" component="h2"> ETF ({employerETFamountPercentage}%)</Typography>
                                            </Grid>
                                            <Grid xs={6}>
                                              <InputLabel > {": " + laborETF} </InputLabel>
                                            </Grid>
                                          </>}
                                      </>
                                    ))}
                                    <Grid xs={12}>
                                    </Grid>
                                    <br />
                                    <Grid xs={12}>
                                      <Typography variant="h5" component="h2">Total Contribution </Typography>
                                    </Grid>
                                    <br />
                                    <Grid xs={12}>
                                      <Divider />
                                    </Grid>
                                    <br />
                                    <Grid xs={6}>
                                      <Typography variant="body2" component="h2">Total EPF + ETF ({totalContribution}%)</Typography>
                                    </Grid>
                                    <Grid xs={6}>
                                      <InputLabel > {": " + parseFloat(sum).toFixed(2)} </InputLabel>
                                    </Grid>
                                  </Grid>
                                </Card>
                                <br />
                                <Grid container justify="flex-end">
                                  <Box pr={2}>
                                    <Button
                                      color="primary"
                                      variant="contained"
                                      type="click"
                                      onClick={SaveStatoryDetails}
                                      size='small'
                                    >
                                      Save
                                    </Button>
                                  </Box>
                                </Grid>
                              </>
                              : null}
                          </Grid>
                        </Grid>
                      </CardContent>
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
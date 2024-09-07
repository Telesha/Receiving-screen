import React, { useState, useEffect, Fragment } from 'react';
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
  MenuItem,
  Divider,
  InputLabel,
  CardHeader,
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
  colorApprove: {
    backgroundColor: "green",
  },
  textCenter: {
    textAlign: 'center',
  },
  fontColors: {
    color: 'grey'
  }

}));

const screenCode = 'BALANCEPAYMENT';
export default function BalancePaymentAddEdit(props) {
  const [title, setTitle] = useState("Add Balance Payment");
  const [previMonth, setPreviMonth] = useState();
  const [isBalancePaymentStarted, setIsBalancePaymentStarted] = useState(false);
  const [isCurrentMonth, setIsCurrentMonth] = useState(false);
  const classes = useStyles();
  const BalancePayment = Object.freeze({ "Pending": 1, "Execution_Started": 2, "Complete": 3 })
  const [balancepayment, setBalancepayment] = useState({
    previouseYear: '0',
    previouseMonth: '',
    executionStatusID: '',
    currentYear: '',
    currentMonth: '',
  });

  const [filter, setFilter] = useState({
    groupID: 0,
    factoryID: 0,
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const [FactoryList, setFactoryList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/dashboard');
  }
  const alert = useAlert();
  const defaultProps = {
    border: 1,
    style: { width: '50rem', height: '10rem' },
  };
  const currentProps = {
    border: 3,
    style: { width: '50rem', height: '12rem' },
  };
  const newProps = {
    border: 1,
    style: { width: '50rem', height: '10rem' },
  };

  useEffect(() => {
    trackPromise(
      getPermissions(),
      getAllGroups(),
      checkScheduleAlreadyStarted(),
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown(),
    );
  }, [filter.groupID]);

  useEffect(() => {
    trackPromise(
      getBalancePaymentData(),
      checkScheduleAlreadyStarted()
    );
  }, [filter.factoryID]);

  async function checkScheduleAlreadyStarted() {

    const bStarted = await services.checkScheduleAlreadyStarted(filter.groupID, filter.factoryID);

    setPreviMonth(bStarted.applicableMonth);
    if (bStarted) {
      setIsBalancePaymentStarted(true);
    }
    else {
      setIsBalancePaymentStarted(false);
    }
  }

  async function getBalancePaymentData() {
    const listBalance = await services.getBalancePaymentData(filter.groupID, filter.factoryID);
    setBalancepayment(listBalance);
    if (parseInt(listBalance.currentMonth) == new Date().getMonth() + 1) {
      setIsCurrentMonth(true);
    }
    else {
      setIsCurrentMonth(false);
    }
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(filter.groupID);
    setFactoryList(factories);
  }

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWBALANCEPAYMENT');

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

    setFilter({
      ...filter,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function Start(data) {
    const preMonth = new Date().getUTCMonth().toString().padStart(2, '0');
    let rateSet = await services.checkBalanceRatesSet(data.currentMonth, data.currentYear, filter.groupID, filter.factoryID);
    if (rateSet > 0) {
      let response = await services.saveBalancePaymentCurrentDetails(data, filter.groupID, filter.factoryID);
      if (response.statusCode === "Success") {
        alert.success(response.message);
      }
      else {
        alert.error(response.message);
      }
    }
    else if (rateSet == -1) {
      alert.error("Please approve saved balance rates");
    }
    else {
      alert.error("Please set balance rates");
    }
  }

  async function getAllGroups() {
    var response = await services.getAllGroups();
    setGroupList(response);
  };

  function settingMonth(data) {
    if (data != null) {
      if (parseInt(data) < 12) {
        return (parseInt(data) + 1).toString().padStart(2, '0');
      }
      else {
        return "01";
      }
    }
  }
  function settingYear(data) {
    if (data != null) {
      if (parseInt(data) < 12) {
        return balancepayment.currentYear;
      }
      else {
        return (parseInt(balancepayment.currentYear) + 1).toString();
      }
    }
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setFilter({
      ...filter,
      [e.target.name]: value
    });
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
  }

  function changeIconName() {

    if (isCurrentMonth) {
      return "Start";
    }
    else if (isBalancePaymentStarted && !isCurrentMonth) {
      return "Pending";
    }
    else {
      return "Start";
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

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>

          <Formik
            initialValues={{
              groupID: filter.groupID,
              factoryID: filter.factoryID,
              previouseYear: balancepayment.previouseYear,
              previouseMonth: balancepayment.previouseMonth,
              executionStatusID: balancepayment.executionStatusID,
              currentYear: balancepayment.currentYear,
              currentMonth: balancepayment.currentMonth,
            }}
            validationSchema={
              Yup.object().shape({

              })
            }
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleChange,
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
                      title={cardTitle("Balance Payment")}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={6} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="groupID"
                              size='small'
                              onChange={(e) => handleChange1(e)}
                              value={filter.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="factoryID"
                              size='small'
                              onChange={(e) => handleChange1(e)}
                              value={filter.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled,
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <br />
                        {balancepayment.previouseMonth != "0" ?
                          <Grid container alignItems="center" justify="center">
                            <Box border={1} borderRadius={16} borderColor="grey" {...defaultProps}>
                              <Grid item md={9} xs={12}>
                                <CardHeader style={{ marginLeft: '15rem', alignItems: "center", justify: "center" }}
                                  titleTypographyProps={{ variant: 'h4' }}
                                  title="Previous Execution Schedule"
                                  className={classes.fontColors}
                                />
                              </Grid>
                              <Grid container spacing={3} alignItems="center" justify="center">
                                <Grid item md={3} xs={12}>
                                  <CardHeader style={{ marginLeft: '2rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                    title="Year"
                                    className={classes.fontColors}
                                  />
                                  <TextField
                                    error={Boolean(touched.previouseYear && errors.previouseYear)}
                                    fullWidth
                                    helperText={touched.previouseYear && errors.previouseYear}
                                    name="previouseYear"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={balancepayment.previouseYear}
                                    InputProps={{
                                      readOnly: true,
                                      style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '2rem', color: 'grey' },
                                      disableUnderline: true
                                    }}
                                    className={classes.fontColors}
                                  />
                                </Grid>

                                <Grid item md={3} xs={12}>
                                  <CardHeader style={{ marginLeft: '2rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                    title="Month"
                                    className={classes.fontColors}
                                  />
                                  <TextField
                                    error={Boolean(touched.previouseMonth && errors.previouseMonth)}
                                    fullWidth
                                    helperText={touched.previouseMonth && errors.previouseMonth}
                                    name="previouseMonth"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={balancepayment.previouseMonth}
                                    InputProps={{
                                      readOnly: true,
                                      style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '3rem', color: "grey" },
                                      disableUnderline: true
                                    }}
                                  />
                                </Grid>
                                <Grid item md={3} xs={12}>
                                  <CardHeader style={{ marginLeft: '2rem', marginTop: '0.7rem' }} titleTypographyProps={{ variant: 'h6' }}
                                    title=""
                                  />
                                  <TextField
                                    error={Boolean(touched.executionStatusID && errors.executionStatusID)}
                                    fullWidth
                                    helperText={touched.executionStatusID && errors.executionStatusID}
                                    name="executionStatusID"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={balancepayment.executionStatusID === BalancePayment.Complete ? "Completed" : "Not Complete"}
                                    InputProps={{
                                      readOnly: true,
                                      style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '2rem', color: 'grey' },
                                      disableUnderline: true
                                    }}
                                    className={classes.fontColors}
                                  />
                                </Grid>
                              </Grid>
                            </Box>
                          </Grid> : null}
                        <Grid container alignItems="center" justify="center">
                          <Box border={1} borderRadius={16} borderColor="green" {...currentProps} style={{ marginTop: "3rem", marginLeft: "5rem", marginRight: '5rem' }}>
                            <Grid item md={9} xs={12} >
                              <CardHeader style={{ marginLeft: '15rem' }} titleTypographyProps={{ variant: 'h1' }}
                                title="Current Execution Schedule"
                              />
                            </Grid>
                            <Grid container spacing={3} alignItems="center" justify="center">
                              <Grid item md={3} xs={12}>
                                <CardHeader style={{ marginLeft: '2rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                  title="Year"
                                />
                                <TextField
                                  error={Boolean(touched.currentYear && errors.currentYear)}
                                  fullWidth
                                  helperText={touched.currentYear && errors.currentYear}
                                  name="currentYear"
                                  onBlur={handleBlur}
                                  onChange={handleChange}
                                  value={balancepayment.currentYear}
                                  InputProps={{
                                    readOnly: true,
                                    style: { fontSize: 60, fontStyle: "initial", textAlign: "right", marginLeft: '0rem' },
                                    disableUnderline: true
                                  }}
                                />
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <CardHeader style={{ marginLeft: '6rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                  title="Month"
                                />
                                <TextField
                                  error={Boolean(touched.currentMonth && errors.currentMonth)}
                                  fullWidth
                                  helperText={touched.currentMonth && errors.currentMonth}
                                  name="currentMonth"
                                  onBlur={handleBlur}
                                  onChange={handleChange}
                                  value={balancepayment.currentMonth}
                                  InputProps={{
                                    readOnly: true,
                                    style: { fontSize: 60, fontStyle: "initial", textAlign: "right", marginLeft: '6rem' },
                                    disableUnderline: true
                                  }}
                                />
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <CardHeader style={{ marginLeft: '6rem', marginTop: '0.7rem' }} titleTypographyProps={{ variant: 'h6' }}
                                  title=""
                                />
                                <Button
                                  color="primary"
                                  disabled={isSubmitting || isCurrentMonth || isBalancePaymentStarted}
                                  type="submit"
                                  variant="contained"
                                  size="large"
                                  fullWidth="true"
                                  className={classes.colorApprove}
                                  onClick={() => Start(balancepayment)}
                                  style={{ marginLeft: '5rem' }}
                                >
                                  {changeIconName()}
                                </Button>
                              </Grid>
                            </Grid>
                          </Box>
                        </Grid>

                        <Grid container alignItems="center" justify="center">
                          <Box border={1} borderRadius={16} borderColor="grey" {...newProps} style={{ marginTop: "3rem", marginLeft: '12rem', marginRight: '12rem' }}>
                            <Grid item md={8} xs={12}>
                              <CardHeader style={{ marginLeft: '15rem', alignItems: "center", justify: "center" }}
                                titleTypographyProps={{ variant: 'h4' }}
                                title="Next Execution Schedule"
                                className={classes.fontColors}
                              />
                            </Grid>
                            <Grid container spacing={3} alignItems="center" justify="center">
                              <Grid item md={3} xs={12}>
                                <CardHeader style={{ marginLeft: '2rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                  title="Year"
                                  className={classes.fontColors}
                                />
                                <TextField
                                  error={Boolean(touched.nextYear && errors.nextYear)}
                                  fullWidth
                                  helperText={touched.nextYear && errors.nextYear}
                                  name="nextYear"
                                  onBlur={handleBlur}
                                  onChange={handleChange}
                                  value={settingYear(balancepayment.currentMonth)}
                                  InputProps={{
                                    readOnly: true,
                                    style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '2rem', color: 'grey' },
                                    disableUnderline: true
                                  }}
                                />
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <CardHeader style={{ marginLeft: '2rem', marginTop: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                                  title="Month"
                                  className={classes.fontColors}
                                />
                                <TextField
                                  error={Boolean(touched.nextMonth && errors.nextMonth)}
                                  fullWidth
                                  helperText={touched.nextMonth && errors.nextMonth}
                                  name="nextMonth"
                                  onBlur={handleBlur}
                                  onChange={handleChange}
                                  value={settingMonth(balancepayment.currentMonth)}
                                  InputProps={{
                                    readOnly: true,
                                    style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '3rem', color: 'grey' },
                                    disableUnderline: true
                                  }}
                                />
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <CardHeader style={{ marginTop: '0.7rem' }} titleTypographyProps={{ variant: 'h6' }}
                                  title=""
                                />
                                <TextField
                                  error={Boolean(touched.executionStatusID && errors.executionStatusID)}
                                  fullWidth
                                  helperText={touched.executionStatusID && errors.executionStatusID}
                                  name="executionStatusID"
                                  onBlur={handleBlur}
                                  onChange={handleChange}
                                  value={"Next Schedule"}
                                  InputProps={{
                                    readOnly: true,
                                    style: { fontSize: 25, fontStyle: "initial", textAlign: "right", marginLeft: '2rem', color: 'grey' },
                                    disableUnderline: true
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </Box>
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
    </Fragment>
  );
};

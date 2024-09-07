import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, makeStyles, Container, Divider, CardContent, Grid, TextField, Button, MenuItem, InputLabel, CardHeader,
  Typography, Accordion, AccordionSummary, Chip
} from '@material-ui/core';
import Page from 'src/components/Page';
import { useAlert } from "react-alert";
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import tokenService from '../../../utils/tokenDecoder';
import authService from '../../../utils/permissionAuth';
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import MaterialTable from "material-table";
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import moment from 'moment';

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
  colorReject: {
    backgroundColor: "red",
  },
  chip: {
    minWidth: "50%",
    backgroundColor: "green",
    marginTop: theme.spacing(1)
  },
}));

const screenCode = 'FINANCIALYEARSETUP';
export default function FinancialYearSetup() {
  const alert = useAlert();
  const classes = useStyles();
  const [GroupList, setGroupList] = useState();
  const [FormDetails, setFormDetails] = useState({
    groupID: '0',
    factoryID: '0',
    financialYearConfigurationID: 0,
    financialYearStartingMonth: 0,
  })
  const [FactoryList, setFactoryList] = useState([]);
  const navigate = useNavigate();
  const [SubmitButtonEnabled, setSubmitButtonEnabled] = useState(false)
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [prevFinancialYearList, setPrevFinancialYearList] = useState([]);
  const [IsDefaultExpand, SetIsDefaultExpand] = useState(false);
  const [AccordianTitle, setAccordianTitle] = useState(
    IsDefaultExpand === true ? "Previous financial years" : "Please Expand to View Previous financial years"
  )
  const [isUpdate, SetIsUpdate] = useState(false);
  const [isNew, SetIsNew] = useState(false);
  const [financialYearStartDate, SetFinancialYearStartDate] = useState(false);
  const [financialYearEndDate, SetFinancialYearEndDate] = useState(false);
  useEffect(() => {
    trackPromise(getGroupsForDropdown());
    trackPromise(getPermission());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesByGroupID()
    )
  }, [FormDetails.groupID]);

  useEffect(() => {
    ClearFields();
    if (FormDetails.groupID !== '0' && FormDetails.factoryID !== '0') {
      setFormDetails({
        ...FormDetails,
        financialYearConfigurationID: 0,
        financialYearStartingMonth: 0,
      })
      trackPromise(FetchFinancialYearSetupDetailsForUpdate());
      if (IsDefaultExpand) {
        trackPromise(GetPreviousFinancialYearDetails());
      }
    }
  }, [FormDetails.groupID, FormDetails.factoryID])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFINANCIALYEARSETUP');

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

    setFormDetails({
      ...FormDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getFactoriesByGroupID() {
    var result = await services.GetFactoriesByGroupID(FormDetails.groupID);
    setFactoryList(result);

  }

  async function getGroupsForDropdown() {
    const groups = await services.GetGroupsForDropdown();
    setGroupList(groups);
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
    setFormDetails({
      ...FormDetails,
      [e.target.name]: value
    });
  }

  function ClearFields() {
    SetFinancialYearStartDate(null);
    SetFinancialYearEndDate(null);
    setPrevFinancialYearList([]);
  }

  function ClearDateFields() {
    SetFinancialYearStartDate(null);
    SetFinancialYearEndDate(null);
  }

  async function GetPreviousFinancialYearDetails() {
    var result = await services.GetPreviousFinancialYearDetails(FormDetails.groupID, FormDetails.factoryID)
    if (result != null) {
      setPrevFinancialYearList(result)
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

  async function SaveFinancialYearDetails() {
    if (!moment(financialYearEndDate).isAfter(financialYearStartDate)) {
      alert.error("End date should be greater than Start date");
      return;
    }
    setSubmitButtonEnabled(true)
    let requestModel = {
      groupID: parseInt(FormDetails.groupID.toString()),
      factoryID: parseInt(FormDetails.factoryID.toString()),
      createdBy: tokenService.getUserIDFromToken(),
      financialYearConfigurationID: parseInt(FormDetails.financialYearConfigurationID.toString()),
      financialYearStartDate: financialYearStartDate,
      financialYearEndDate: financialYearEndDate
    }
    const response = await services.SaveFinancialYearConfigurationYear(requestModel);

    if (response.statusCode == "Success") {
      alert.success(response.message);
      trackPromise(FetchFinancialYearSetupDetailsForUpdate());
      setSubmitButtonEnabled(false)
      return;
    }
    else {
      alert.error(response.message);
      setSubmitButtonEnabled(false)
      return;
    }
  }

  async function EndFinancialYear() {
    let requestModel = {
      financialYearConfigurationID: parseInt(FormDetails.financialYearConfigurationID.toString()),
      createdBy: tokenService.getUserIDFromToken()
    }

    const response = await services.EndFinancialYear(requestModel);

    if (response.statusCode == "Success") {
      alert.success(response.message);
      trackPromise(FetchFinancialYearSetupDetailsForUpdate());
      setSubmitButtonEnabled(false)
      ClearDateFields()
      trackPromise(GetPreviousFinancialYearDetails());
      return;
    }
    else {
      alert.error(response.message);
      setSubmitButtonEnabled(false)
      return;
    }
  }

  async function FetchFinancialYearSetupDetailsForUpdate() {
    const response = await services.FetchFinancialYearSetupDetailsForUpdate(FormDetails.groupID, FormDetails.factoryID);

    if (response !== null) {
      setFormDetails({
        ...FormDetails,
        financialYearConfigurationID: parseInt(response.financialYearConfigurationID.toString()),
        financialYearStartingMonth: parseInt(response.financialYearStartMonth.toString())
      });
      SetFinancialYearStartDate(response.financialYearStartDate);
      SetFinancialYearEndDate(response.financialYearEndDate);
      SetIsUpdate(true)
      SetIsNew(false)
    } else {
      SetIsUpdate(false)
      SetIsNew(true)
    }
  }

  function toggleAccordian(expanded) {
    SetIsDefaultExpand(expanded);
    if (expanded) {
      setAccordianTitle("Previous financial years");
      trackPromise(GetPreviousFinancialYearDetails());
    } else {
      setAccordianTitle("Please Expand to View Previous financial years");
    }
  }

  return (
    <Fragment >
      <LoadingComponent />
      <Page className={classes.root} title={"Financial Year Setup"}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: FormDetails.groupID,
              factoryID: FormDetails.factoryID,
              financialYearStartDate: financialYearStartDate,
              financialYearEndDate: financialYearEndDate
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                factoryID: Yup.number().min(1, "Please Select a Estate").required('Estate is required')
              })
            }
            onSubmit={() => trackPromise(SaveFinancialYearDetails())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle("Financial Year Setup")}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value={'0'} disabled={true}>
                                --Select Group--
                              </MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled,
                              }}
                            >
                              <MenuItem value={0} disabled={true}>
                                --Select Estate--
                              </MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <br />
                        <Grid container spacing={3} border={1} borderRadius={16} >
                          <Grid item md={12} xs={12} >
                            <Box border={1} borderRadius={5} borderColor={'grey.500'} paddingLeft={2}
                              paddingRight={2} paddingBottom={5} >
                              <Grid container spacing={3}>
                                <Grid item md={3} xs={12}>
                                  <Typography variant="h6" component="h2">
                                    Current Financial Year
                                  </Typography>
                                </Grid>
                                <Grid item md={3} xs={12}>
                                  {isNew &&
                                    <Chip
                                      label="Please setup a new financial year"
                                      color="secondary"
                                      size="small"
                                      className={classes.chip}
                                    />
                                  }
                                </Grid>
                              </Grid>
                              <Grid container spacing={3}>
                                <Grid item md={4} xs={12}>
                                  <InputLabel shrink id="date">
                                    Start Date *
                                  </InputLabel>
                                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                      fullWidth
                                      variant="inline"
                                      format="dd/MM/yyyy"
                                      margin="dense"
                                      id="financialYearStartDate"
                                      name="financialYearStartDate"
                                      value={financialYearStartDate}
                                      onChange={(e) => {
                                        SetFinancialYearStartDate(e)
                                      }}
                                      KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                      }}
                                      InputProps={{
                                        readOnly: true,
                                      }}
                                      autoOk
                                    />
                                  </MuiPickersUtilsProvider>
                                </Grid>
                                <Grid item md={4} xs={12}>
                                  <InputLabel shrink id="date">
                                    End Date *
                                  </InputLabel>
                                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                      fullWidth
                                      variant="inline"
                                      format="dd/MM/yyyy"
                                      margin="dense"
                                      id="financialYearStartDate"
                                      name="financialYearStartDate"
                                      value={financialYearEndDate}
                                      onChange={(e) => {
                                        SetFinancialYearEndDate(e)
                                      }}
                                      KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                      }}
                                      InputProps={{
                                        readOnly: true,
                                      }}
                                      autoOk
                                    />
                                  </MuiPickersUtilsProvider>
                                </Grid>
                                <Grid item md={2} xs={12}>
                                  <Box display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    paddingTop={3}>
                                    <Button
                                      color="primary"
                                      type="submit"
                                      variant="contained"
                                      disabled={SubmitButtonEnabled}
                                      size='small'
                                    >
                                      {isUpdate ? "Update" : "Start"}
                                    </Button>
                                  </Box>
                                </Grid>
                                <Grid item md={2} xs={12}>
                                  <Box display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    paddingTop={3} >
                                    {isUpdate &&
                                      <Button
                                        color="primary"
                                        type="button"
                                        variant="contained"
                                        className={classes.colorReject}
                                        onClick={() => trackPromise(EndFinancialYear())}
                                        size='small'
                                      >
                                        End
                                      </Button>
                                    }
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Grid>
                        </Grid>
                        <br />
                        <Accordion
                          defaultExpanded={false}
                          onChange={(e, expanded) => {
                            toggleAccordian(expanded)
                          }}
                        >
                          <AccordionSummary
                            expandIcon={
                              <ArrowDropDownCircleIcon
                                color="primary"
                                fontSize="large"
                              />
                            }
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                          >
                            <div>
                              <Typography
                                color="textPrimary"
                                variant="h6"
                              >{AccordianTitle}</Typography>
                            </div>
                          </AccordionSummary>
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Start Date', render: rowData => new Date(rowData.financialYearStartDate).toLocaleDateString() },
                              { title: 'End Date', render: rowData => new Date(rowData.financialYearEndDate).toLocaleDateString() },
                            ]}
                            data={prevFinancialYearList}
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
                          {/* : null} */}
                        </Accordion>
                      </CardContent>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>)}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
};


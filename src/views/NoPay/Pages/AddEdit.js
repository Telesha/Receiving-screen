import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  Divider,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  CardHeader,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { Formik } from 'formik';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import DateRangeIcon from '@material-ui/icons/DateRange';
import InputAdornment from '@material-ui/core/InputAdornment';

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

const screenCode = "NOPAY";
export default function AddEditNoPay() {
  const classes = useStyles();
  const alert = useAlert();
  const [groups, setGroups] = useState();
  const [title, setTitle] = useState("Add No Pay");
  const [isUpdate, setIsUpdate] = useState(false);
  const [factories, setFactories] = useState();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [nopayDetails, setNopayDetails] = useState({
    groupID: '0',
    factoryID: '0',
    registrationNumber: '',
    employeeName: '',
    nicNumber: '',
    noPayDays: 0,
    description: ''
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });


  const { noPayID } = useParams();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app/noPay/listing');
  }

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (nopayDetails.groupID > 0) {
      trackPromise(
        getFactoriesForDropDown(),
      );
    }
  }, [nopayDetails.groupID]);

  useEffect(() => {
    const decryptedID = atob(noPayID.toString());
    if (decryptedID != 0) {
      trackPromise(getNoPayDetailsByNoPayID(decryptedID));
    }
  }, []);

  useEffect(() => {
    if (nopayDetails.groupID > 0 && nopayDetails.factoryID > 0 && nopayDetails.registrationNumber != "" && !isUpdate) {
      trackPromise(
        getEmployeeDetails(nopayDetails.groupID, nopayDetails.factoryID, nopayDetails.registrationNumber)
      )
    }
  }, [nopayDetails.groupID, nopayDetails.factoryID, nopayDetails.registrationNumber])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWNOPAY');

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

    setNopayDetails({
      ...nopayDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getAllFactoriesByGroupID(nopayDetails.groupID);
    setFactories(factory);
  }

  async function saveNoPayDetails(values) {
    if (isUpdate == true) {
      let updateModel = {
        noPayID: atob(noPayID.toString()),
        groupID: parseInt(values.groupID),
        factoryID: parseInt(values.factoryID),
        registrationNumber: values.registrationNumber,
        employeeName: values.employeeName,
        nicNumber: values.nicNumber,
        noPayDays: parseInt(values.noPayDays),
        description: values.description,
        noPayMonth: values.selectedMonth
      }
      let response = await services.updateNoPayDetails(updateModel, tokenService.getUserIDFromToken());
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/noPay/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {

      let response = await services.saveNoPayDetails(values, tokenService.getUserIDFromToken());
      if (response.statusCode == "Success") {
        alert.success(response.message);
        clearData();
      }
      else {
        alert.error(response.message);
      }
    }
  }

  async function getEmployeeDetails(groupID, factoryID, registrationNumber) {
    let result = await services.getEmployeeDetails(groupID, factoryID, registrationNumber);
    if (result.statusCode == "Success") {
      let employeeData = result.data;
      setNopayDetails({
        ...nopayDetails,
        employeeName: employeeData.employeeName,
        nicNumber: employeeData.nicNumber
      })
    }
    else {
      setNopayDetails({
        ...nopayDetails,
        employeeName: "",
        nicNumber: ""
      })
    }
  }

  async function getNoPayDetailsByNoPayID(noPayID) {
    let result = await services.getNoPayDetailsByNoPayID(noPayID);
    let data = result.data;
    setNopayDetails(data);
    setIsUpdate(true);
    setTitle("Edit No Pay Details")
    setSelectedMonth(data.noPayDate);
  }

  function clearData() {
    setNopayDetails({
      ...nopayDetails,
      registrationNumber: '',
      employeeName: '',
      nicNumber: '',
      noPayDays: 0,
      description: "",
      noPayMonth: ""
    })
    setSelectedMonth(new Date());
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
    setNopayDetails({
      ...nopayDetails,
      [e.target.name]: e.target.value
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
  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: nopayDetails.groupID,
              factoryID: nopayDetails.factoryID,
              registrationNumber: nopayDetails.registrationNumber,
              employeeName: nopayDetails.employeeName,
              nicNumber: nopayDetails.nicNumber,
              noPayDays: nopayDetails.noPayDays,
              description: nopayDetails.description,
              selectedMonth: selectedMonth
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                registrationNumber: Yup.string().required('Registration Number is required'),
                employeeName: Yup.string().required('Employee Name is required'),
                nicNumber: Yup.string().matches(/^(\d{9}[V]|\d{12})$/, 'Entered NIC not valid').required('NIC Number is required'),
                noPayDays: Yup.number().max(30, 'No pay days cannot be more than 30').required("No pay Day is required"),
                selectedMonth: Yup.date().required("Month is required")
              })
            }
            onSubmit={saveNoPayDetails}
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
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={nopayDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={nopayDetails.factoryID}
                              size='small'
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
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
                              value={nopayDetails.registrationNumber}
                              size='small'
                              variant="outlined"
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="employeeName">
                              Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.employeeName && errors.employeeName)}
                              fullWidth
                              helperText={touched.employeeName && errors.employeeName}
                              name="employeeName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={nopayDetails.employeeName}
                              size='small'
                              variant="outlined"
                              InputProps={{
                                readOnly: true
                              }}
                            />
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="nicNumber">
                              NIC *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.nicNumber && errors.nicNumber)}
                              fullWidth
                              helperText={touched.nicNumber && errors.nicNumber}
                              name="nicNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={nopayDetails.nicNumber}
                              size='small'
                              variant="outlined"
                              InputProps={{
                                readOnly: true
                              }}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="nicNumber">
                              Month *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                fullWidth
                                name='selectedMonth'
                                openTo="month"
                                views={["year", "month"]}
                                value={selectedMonth}
                                inputVariant="outlined"
                                onChange={date => setSelectedMonth(date)}
                                size="small"
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <DateRangeIcon />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="noPayDays">
                              No Pay Day
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.noPayDays && errors.noPayDays)}
                              fullWidth
                              helperText={touched.noPayDays && errors.noPayDays}
                              name="noPayDays"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={nopayDetails.noPayDays}
                              variant="outlined"
                              multiline={true}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="description">
                              Description
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.description && errors.description)}
                              fullWidth
                              helperText={touched.description && errors.description}
                              name="description"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={nopayDetails.description}
                              variant="outlined"
                              multiline={true}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          size='small'
                          variant="contained"
                        >
                          {isUpdate == true ? "Update" : "Save"}
                        </Button>
                      </Box>
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
}



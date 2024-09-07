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
import tokenDecoder from '../../../utils/tokenDecoder';
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

const screenCode = 'BROKERREGISTRATION';

export default function BrokerAddEdit(props) {
  const [title, setTitle] = useState("Broker Registration");
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [broker, setBroker] = useState({
    groupID: 0,
    factoryID: 0,
    brokerCode: '',
    brokerName: '',
    brokerReg: '',
    joinedDate: null,
    address1: '',
    address2: '',
    address3: '',
    contactNo: '',
    email: '',
    isActive: true,
  });
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const { brokerID } = useParams();
  let decrypted = 0;

  const navigate = useNavigate();
  const alert = useAlert();

  const handleClick = () => {
    navigate('/app/brokerRegistration/listing');
  }

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [broker.groupID]);

  useEffect(() => {
    decrypted = atob(brokerID.toString());
    if (decrypted != 0) {
      trackPromise(getBrokerDetails(decrypted));
    }
  }, []);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITBROKER');

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

    setBroker({
      ...broker,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(broker.groupID);
    setFactories(factories);
  }

  async function getBrokerDetails(brokerID) {
    let response = await services.getBrokerDetailsByID(brokerID);
    let data = {
      groupID: response.groupID,
      factoryID: response.factoryID,
      brokerID: response.brokerID,
      brokerCode: response.brokerCode,
      brokerName: response.brokerName,
      brokerReg: response.brokerReg,
      joinedDate: response.joinedDate === "0001-01-01T00:00:00" ? null : response.joinedDate.split('T')[0],
      address1: response.address1,
      address2: response.address2,
      address3: response.address3,
      contactNo: response.contactNo,
      email: response.email,
      isActive: response.isActive
    };

    setTitle("Edit Broker");
    setBroker(data);
    setIsUpdate(true);
  }

  async function saveBroker(values) {
    if (isUpdate == true) {
      let model = {
        groupID: parseInt(values.groupID),
        factoryID: parseInt(values.factoryID),
        brokerID: atob(brokerID.toString()),
        brokerCode: values.brokerCode,
        brokerName: values.brokerName,
        brokerReg: values.brokerReg === "" ? "null" : values.brokerReg,
        joinedDate: broker.joinedDate == null ? "null" : values.joinedDate,
        address1: values.address1,
        address2: values.address2,
        address3: values.address3,
        contactNo: values.contactNo,
        email: values.email,
        isActive: values.isActive,
        modifiedBy: parseInt(tokenDecoder.getUserIDFromToken()),
        modifiedDate: new Date().toISOString(),
      }

      let response = await services.updateBroker(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/brokerRegistration/listing');
      }
      else {
        setBroker({
          ...broker,
          isActive: isDisableButton
        })
        alert.error(response.message);
      }
    } else {
      let response = await services.saveBroker(values);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/brokerRegistration/listing');
      }
      else {
        alert.error(response.message);
      }
    }
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

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setBroker({
      ...broker,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setBroker({
      ...broker,
      joinedDate: value
    });
  }

  function clearFormFields() {
    setBroker({
      ...broker,
      brokerCode: '',
      brokerName: '',
      brokerReg: '',
      joinedDate: null,
      address1: '',
      address2: '',
      address3: '',
      contactNo: '',
      email: ''
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
              groupID: broker.groupID,
              factoryID: broker.factoryID,
              brokerCode: broker.brokerCode,
              brokerName: broker.brokerName,
              contactNo: broker.contactNo,
              brokerReg: broker.brokerReg,
              joinedDate: broker.joinedDate,
              address1: broker.address1,
              address2: broker.address2,
              address3: broker.address3,
              email: broker.email,
              isActive: broker.isActive
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                brokerCode: Yup.string().max(5, "Broker Code must be at most 5 characters").required('Broker Code is required').matches(/^[a-zA-Z0-9\s]+$/, 'Special Characters are not allowed'),
                brokerName: Yup.string().max(30).required('Broker Name is required').matches(/^[a-zA-Z\s]+$/, 'Only allow letters and spaces'),
                contactNo: Yup.string()
                  .matches(/^[0-9]+$/, 'Invalid contact number Only allow numbers')
                  .length(10, 'Contact number must be 10 digits long')
                  .required('Contact number is required'),
                email: Yup.string().email('Must be a valid email').max(255)
              })
            }
            onSubmit={(event) => trackPromise(saveBroker(event))}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              handleChange,
              isSubmitting,
              touched,
              values,
              props
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
                              onChange={(e) => handleChange1(e)}
                              value={broker.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
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
                              onChange={(e) => handleChange1(e)}
                              value={broker.factoryID}
                              variant="outlined"
                              id="factoryID"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="brokerCode">
                              Broker Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.brokerCode && errors.brokerCode)}
                              fullWidth
                              helperText={touched.brokerCode && errors.brokerCode}
                              name="brokerCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={broker.brokerCode}
                              variant="outlined"
                              size='small'
                              disabled={isUpdate}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="brokerName">
                              Broker Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.brokerName && errors.brokerName)}
                              fullWidth
                              helperText={touched.brokerName && errors.brokerName}
                              name="brokerName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={broker.brokerName}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="brokerReg">
                              Registration Number
                            </InputLabel>
                            <TextField
                              fullWidth
                              error={Boolean(touched.brokerReg && errors.brokerReg)}
                              helperText={touched.brokerReg && errors.brokerReg}
                              name="brokerReg"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={broker.brokerReg}
                              size='small'
                              onInput={(e) => {
                                e.target.value = (e.target.value).toString().slice(0, 20)
                              }}
                              variant="outlined" >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fromDate">
                              Joining Date
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.joinedDate && errors.joinedDate)}
                                helperText={touched.joinedDate && errors.joinedDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="joinedDate"
                                id="joinedDate"
                                value={broker.joinedDate}
                                maxDate={new Date()}
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
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="address1">
                              Address 1
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="address1"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={broker.address1}
                              size='small'
                              inputProps={{
                                maxLength: 100,
                              }}
                              variant="outlined" >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="address2">
                              Address 2
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="address2"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={broker.address2}
                              variant="outlined"
                              disabled={isDisableButton}
                              size='small'
                              multiline={true}
                              inputProps={{
                                maxLength: 100,
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="address3">
                              Address 3
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="address3"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={broker.address3}
                              size='small'
                              inputProps={{
                                maxLength: 100,
                              }}
                              variant="outlined" >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="contactNo">
                              Contact No *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.contactNo && errors.contactNo)}
                              fullWidth
                              helperText={touched.contactNo && errors.contactNo}
                              name="contactNo"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              size='small'
                              value={broker.contactNo}
                              variant="outlined" >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="email">
                              Email
                            </InputLabel>
                            <TextField
                              fullWidth
                              error={Boolean(touched.email && errors.email)}
                              helperText={touched.email && errors.email}
                              name="email"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              size='small'
                              value={broker.email}
                              variant="outlined" >
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="isActive">
                              Active
                            </InputLabel>
                            <Switch
                              checked={values.isActive}
                              onChange={handleChange}
                              name="isActive"
                              disabled={isDisableButton}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="reset"
                          variant="outlined"
                          onClick={clearFormFields}
                          size='small'
                        >
                          Cancel
                        </Button>
                        <div>&nbsp;</div>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          type="submit"
                          variant="contained"
                          size='small'
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
};

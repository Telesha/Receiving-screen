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

const screenCode = 'BUYERREGISTRATION';

export default function BuyerAddEdit(props) {
  const [title, setTitle] = useState("Buyer Registration");
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [buyer, setBuyer] = useState({
    groupID: 0,
    factoryID: 0,
    buyerCode: '',
    buyerName: '',
    buyerReg: '',
    joiningDate: null,
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

  let decrypted = 0;
  const navigate = useNavigate();
  const alert = useAlert();
  const { buyerID } = useParams();
  const handleClick = () => {
    navigate('/app/buyerRegistration/listing');
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
  }, [buyer.groupID]);

  useEffect(() => {
    decrypted = atob(buyerID.toString());
    if (decrypted != 0) {
      trackPromise(
        getBuyerRegistrationDetails(decrypted),
      )
    }

  }, []);


  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITBUYER');
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
    setBuyer({
      ...buyer,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(buyer.groupID);
    setFactories(factories);
  }

  async function getBuyerRegistrationDetails(buyerID) {
    let response = await services.GetBuyerRegistrationDetailsByID(buyerID);
    let data = {
      buyerID: response.buyerID,
      groupID: response.groupID,
      factoryID: response.factoryID,
      buyerCode: response.buyerCode,
      buyerName: response.buyerName,
      buyerReg: response.registrationNumber,
      joiningDate: response.joiningDate === null ? null : response.joiningDate.split('T')[0],
      address1: response.address,
      address2: response.addressTwo,
      address3: response.addressThree,
      contactNo: response.contactNumber,
      email: response.emailAddress,
      isActive: response.isActive
    };

    setTitle("Edit Buyer Registration");
    setBuyer(data);
    setIsUpdate(true);
  }

  async function saveBuyerRegistration(values) {
    if (isUpdate == true) {
      let model = {
        buyerID: atob(buyerID.toString()),
        groupID: values.groupID,
        factoryID: values.factoryID,
        buyerCode: values.buyerCode,
        buyerName: values.buyerName,
        registrationNumber: values.buyerReg === "" ? null : values.buyerReg,
        joiningDate: buyer.joiningDate == null ? null : values.joiningDate,
        address: values.address1,
        addressTwo: values.address2,
        addressThree: values.address3,
        contactNumber: values.contactNo,
        emailAddress: values.email,
        isActive: values.isActive,
        createdBy: tokenDecoder.getUserIDFromToken(),
        createdDate: new Date().toISOString()
      }
      let response = await services.UpdateBuyerRegistration(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/buyerRegistration/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.SaveBuyerRegistration(values);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/buyerRegistration/listing');
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

  function handleChangeDetails(e) {
    const target = e.target;
    const value = target.value
    setBuyer({
      ...buyer,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setBuyer({
      ...buyer,
      joiningDate: value
    });
  }


  function clearFormFields() {
    setBuyer({
      ...buyer,
      buyerCode: '',
      buyerName: '',
      buyerReg: '',
      joiningDate: null,
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
              groupID: buyer.groupID,
              factoryID: buyer.factoryID,
              buyerCode: buyer.buyerCode,
              buyerName: buyer.buyerName,
              buyerReg: buyer.buyerReg,
              joiningDate: buyer.joiningDate,
              address1: buyer.address1,
              address2: buyer.address2,
              address3: buyer.address3,
              contactNo: buyer.contactNo,
              email: buyer.email,
              isActive: buyer.isActive,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number()
                  .required('Group is required')
                  .min("1", 'Group is required'),
                factoryID: Yup.number()
                  .required('Factory is required')
                  .min("1", 'Factory is required'),
                buyerCode: Yup.string()
                  .max(5, "Buyer Code must be at most 5 characters")
                  .required('Buyer Code is required')
                  .matches(/[a-zA-Z0-9\^]+$/g, 'Special Characters are not allowed'),
                buyerName: Yup.string()
                  .max(30, "Buyer Name must be at most 30 characters")
                  .required('Buyer Name is required')
                  .matches(/^[a-zA-Z\\ \\]/g, 'Numbers & special characters are not allowed'),
                contactNo: Yup.string()
                  .matches(/^[0-9]+$/, 'Invalid contact number Only allow numbers')
                  .length(10, 'Contact number must be 10 digits long')
                  .required('Contact number is required'),
                email: Yup.string()
                  .email('Please enter valid email'),
              })
            }
            onSubmit={(event) => trackPromise(saveBuyerRegistration(event))}
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
                              onChange={(e) => handleChangeDetails(e)}
                              value={buyer.groupID}
                              variant="outlined"
                              size='small'
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
                              onChange={(e) => handleChangeDetails(e)}
                              value={buyer.factoryID}
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
                            <InputLabel shrink id="buyerCode">
                              Buyer Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.buyerCode && errors.buyerCode)}
                              fullWidth
                              helperText={touched.buyerCode && errors.buyerCode}
                              name="buyerCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeDetails(e)}
                              value={buyer.buyerCode}
                              size='small'
                              variant="outlined"
                              disabled={isUpdate}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="buyerName">
                              Buyer Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.buyerName && errors.buyerName)}
                              fullWidth
                              helperText={touched.buyerName && errors.buyerName}
                              name="buyerName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeDetails(e)}
                              value={buyer.buyerName}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="buyerReg">
                              Registration Number
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.buyerReg && errors.buyerReg)}
                              fullWidth
                              helperText={touched.buyerReg && errors.buyerReg}
                              name="buyerReg"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeDetails(e)}
                              value={buyer.buyerReg}
                              size='small'
                              variant="outlined"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fromDate">
                              Joining Date
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.joiningDate && errors.joiningDate)}
                                helperText={touched.joiningDate && errors.joiningDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="joiningDate"
                                id="joiningDate"
                                size='small'
                                maxDate={new Date()}
                                value={buyer.joiningDate}
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
                              error={Boolean(touched.address1 && errors.address1)}
                              fullWidth
                              helperText={touched.address1 && errors.address1}
                              name="address1"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeDetails(e)}
                              value={buyer.address1}
                              size='small'
                              variant="outlined" >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="address2">
                              Address 2
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.address2 && errors.address2)}
                              fullWidth
                              helperText={touched.address2 && errors.address2}
                              name="address2"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeDetails(e)}
                              value={buyer.address2}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="address3">
                              Address 3
                            </InputLabel>
                            <TextField
                              fullWidth
                              error={Boolean(touched.address3 && errors.address3)}
                              name="address3"
                              helperText={touched.address3 && errors.address3}
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeDetails(e)}
                              value={buyer.address3}
                              size='small'
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
                              onChange={(e) => handleChangeDetails(e)}
                              value={buyer.contactNo}
                              size='small'
                              variant="outlined" >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="email">
                              Email
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.email && errors.email)}
                              fullWidth
                              helperText={touched.email && errors.email}
                              name="email"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeDetails(e)}
                              value={buyer.email}
                              size='small'
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
                          onClick={() => clearFormFields()}
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


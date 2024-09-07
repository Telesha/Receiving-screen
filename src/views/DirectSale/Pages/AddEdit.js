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
  Divider,
  InputLabel,
  CardHeader,
  MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from 'react-alert';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

const useStyles = makeStyles(theme => ({
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

const screenCode = 'DIRECTSALE';
export default function DirectSaleAddEdit(props) {
  const [title, setTitle] = useState('Add Direct Sale');
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [grades, setGrades] = useState();
  const [directSale, setDirectSale] = useState({
    directSalesID: '',
    groupID: 0,
    factoryID: 0,
    dateOfSelling: null,
    invoiceNumber: '',
    gradeID: '',
    customerName: '',
    email: '',
    contactNumber: '',
    customerAddress: '',
    quantity: '',
    unitPrice: '',
    amount: '',
    comment: '',
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/directSale/listing');
  };
  const alert = useAlert();
  const { directSaleID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    decrypted = atob(directSaleID.toString());
    if (decrypted != '0') {
      trackPromise(
        getDirectSaleDetailsByID(decrypted)
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getPermissions(),
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown()
    );
  }, [directSale.groupID]);

  useEffect(() => {
    trackPromise(
      getAllGradesForDropdown()
    )
  }, [directSale.factoryID]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(directSale.groupID);
    setFactories(factories);
  }

  async function getAllGradesForDropdown() {
    const grades = await services.getAllGradesByGroupIDFactoryID(directSale.groupID, directSale.factoryID);
    setGrades(grades);
  }

  async function getDirectSaleDetailsByID(directSaleID) {
    let response = await services.getDirectSaleDetailsByID(directSaleID);
    setIsUpdate(true);
    let data = response.data[0];
    setDirectSale({
      ...directSale,
      directSalesID: data.directSalesID,
      groupID: data.groupID,
      factoryID: data.factoryID,
      dateOfSelling: data.dateOfSelling,
      invoiceNumber: data.invoiceNumber,
      gradeID: data.gradeID,
      customerName: data.customerName,
      email: data.email,
      contactNumber: data.contactNumber,
      customerAddress: data.customerAddress,
      unitPrice: data.unitPrice,
      quantity: data.quantity,
      amount: data.amount,
      comment: data.comment
    });
    setDirectSale(data);
  }

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'ADDEDITDIRECTSALE'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    if (decrypted == 0) {
      setDirectSale({
        ...directSale,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      });
    }
  }

  async function saveDirectSale(values) {
    if (isUpdate == true) {
      let updateModel = {
        directSalesID: atob(directSaleID.toString()),
        groupID: parseInt(values.groupID),
        factoryID: parseInt(values.factoryID),
        dateOfSelling: values.dateOfSelling,
        invoiceNumber: values.invoiceNumber,
        gradeID: parseInt(values.gradeID),
        customerName: values.customerName,
        email: values.email,
        contactNumber: values.contactNumber,
        customerAddress: values.customerAddress,
        unitPrice: parseFloat(values.unitPrice).toFixed(2),
        quantity: parseFloat(values.quantity).toFixed(2),
        amount: parseFloat(values.amount).toFixed(2),
        comment: values.comment
      };

      let response = await services.updateDirectSale(updateModel);
      if (response.statusCode == 'Success') {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/directSale/listing');
      } else {
        alert.error(response.message);
      }
    } else {

      let response = await services.saveDirectSale(values);
      if (response.statusCode == 'Success') {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/directSale/listing');
      } else {
        alert.error(response.message);
        navigate('/app/directSale/listing');
      }
    }
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value;
    setDirectSale({
      ...directSale,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setDirectSale({
      ...directSale,
      dateOfSelling: value
    });
  }


  function clearFormFields() {
    setDirectSale({
      ...directSale,
        directSalesID: '',
        dateOfSelling: '',
        invoiceNumber: '',
        gradeID: '',
        customerName: '',
        email: '',
        contactNumber: '',
        customerAddress: '',
        quantity: '',
        unitPrice: '',
        amount: '',
        comment: '',
        dateOfSelling: null
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader onClick={handleClick} />
        </Grid>
      </Grid>
    );
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: directSale.groupID,
              factoryID: directSale.factoryID,
              dateOfSelling: directSale.dateOfSelling,
              invoiceNumber: directSale.invoiceNumber,
              gradeID: directSale.gradeID,
              email: directSale.email,
              customerName: directSale.customerName,
              contactNumber: directSale.contactNumber,
              customerAddress: directSale.customerAddress,
              unitPrice: directSale.unitPrice,
              quantity: directSale.quantity,
              amount: directSale.amount,
              comment: directSale.comment
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number()
                  .required('Group required')
                  .min('1', 'Group required'),
                factoryID: Yup.number()
                  .required('Factory required')
                  .min('1', 'Factory required'),
                dateOfSelling: Yup.date()
                  .required('Date is required')
                  .max(new Date(), "Future dates are not allowed").typeError('Invalid date'),
                invoiceNumber: Yup.string()
                  .max(100)
                  .required('Invoice Number required'),
                gradeID: Yup.number()
                  .required('Grade is required')
                  .min('1', 'Grade is required'),
                customerName: Yup.string()
                  .max(150)
                  .required('Customer Name is required')
                  .matches(/^.{1,30}$/, 'Customer Name must be at most 30 characters')
                  .matches(/^[ A-Za-z]*$/, 'Numbers and special characters are not allowed'),
                email: Yup.string()
                  .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Email must be a valid email'),
                contactNumber: Yup.string()
                  .min(10, "Contact number must be 10 digits")
                  .required("Contact Number is required ")
                  .matches(/^(?!0+$)/, "Contact number must be a valid")
                  .matches(/^[0-9]*$/, "Contact Number should contain only numbers"),
                customerAddress: Yup.string()
                  .max(200)
                  .required('Customer Address is required')
                  .matches(/^.{1,100}$/, 'Customer Address must be at most 100 characters'),
                unitPrice: Yup.string()
                  .max(18)
                  .required('Unit Price is required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Unit Price should contain only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals'),
                quantity: Yup.string()
                  .max(50)
                  .required('Quantity is required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Quantity should contain only numbers'),
                amount: Yup.string()
                  .max(18)
                  .required('Amount is required')
                  .matches(/^[0-9]+([.][0-9]+)?$/, 'Amount should contain only numbers')
                  .matches(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/, 'Only allowed 2 decimals.')
              })}
            onSubmit={saveDirectSale}
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
                    <CardHeader title={cardTitle(title)} />

                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              size='small'
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={directSale.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.factoryID && errors.factoryID
                              )}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              size='small'
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={values.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="sellingDate">
                              Date of Selling *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.dateOfSelling && errors.dateOfSelling)}
                                helperText={touched.dateOfSelling && errors.dateOfSelling}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="dateOfSelling"
                                id="dateOfSelling"
                                value={values.dateOfSelling}
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
                            <InputLabel shrink id="invoiceNumber">
                              Invoice Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(
                                touched.invoiceNumber && errors.invoiceNumber
                              )}
                              fullWidth
                              helperText={touched.invoiceNumber && errors.invoiceNumber}
                              size='small'
                              name="invoiceNumber"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={values.invoiceNumber}
                              variant="outlined"
                              disabled={isDisableButton}
                              multiline={true}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="gradeID">
                              Grade *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.gradeID && errors.gradeID)}
                              fullWidth
                              helperText={touched.gradeID && errors.gradeID}
                              size='small'
                              name="gradeID"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={values.gradeID}
                              variant="outlined"
                              id="gradeID"
                            >
                              <MenuItem value="0">--Select Grade--</MenuItem>
                              {generateDropDownMenu(grades)}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="customerName">
                              Customer Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.customerName && errors.customerName)}
                              fullWidth
                              helperText={touched.customerName && errors.customerName}
                              size='small'
                              name="customerName"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={values.customerName}
                              variant="outlined"
                              disabled={isDisableButton}
                              multiline={true}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="email">
                              Email
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.email && errors.email)}
                              fullWidth
                              helperText={touched.email && errors.email}
                              size='small'
                              name="email"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={values.email}
                              variant="outlined"
                              disabled={isDisableButton}
                              multiline={true}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="contactNumber">
                              Contact Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(
                                touched.contactNumber && errors.contactNumber
                              )}
                              fullWidth
                              helperText={touched.contactNumber && errors.contactNumber}
                              size='small'
                              name="contactNumber"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={values.contactNumber}
                              variant="outlined"
                              disabled={isDisableButton}
                              multiline={true}
                            />
                          </Grid>
                          <Grid item md={25} xs={12}>
                            <InputLabel shrink id="customerAddress">
                              Customer Address *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.customerAddress && errors.customerAddress)}
                              fullWidth
                              helperText={touched.customerAddress && errors.customerAddress}
                              size='small'
                              name="customerAddress"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={values.customerAddress}
                              variant="outlined"
                              disabled={isDisableButton}
                              multiline={true}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="unitPrice">
                              Unit Price (RS) *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.unitPrice && errors.unitPrice)}
                              fullWidth
                              helperText={touched.unitPrice && errors.unitPrice}
                              size='small'
                              name="unitPrice"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={values.unitPrice}
                              variant="outlined"
                              disabled={isDisableButton}
                              multiline={true}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="quantity">
                              Quantity (KG) *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.quantity && errors.quantity)}
                              fullWidth
                              helperText={touched.quantity && errors.quantity}
                              size='small'
                              name="quantity"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={values.quantity}
                              variant="outlined"
                              disabled={isDisableButton}
                              multiline={true}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="amount">
                              Amount (RS) *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.amount && errors.amount)}
                              fullWidth
                              helperText={touched.amount && errors.amount}
                              size='small'
                              name="amount"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={values.amount}
                              variant="outlined"
                              disabled={isDisableButton}
                              multiline={true}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={25} xs={12}>
                            <InputLabel shrink id="comment">
                              Comment
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.comment && errors.comment)}
                              fullWidth
                              helperText={touched.comment && errors.comment}
                              size='small'
                              name="comment"
                              onBlur={handleBlur}
                              onChange={e => handleChange1(e)}
                              value={values.comment}
                              variant="outlined"
                              disabled={isDisableButton}
                              multiline={true}
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
                        >
                          Cancel
                        </Button>
                        <div>&nbsp;</div>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          type="submit"
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

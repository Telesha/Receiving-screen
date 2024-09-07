import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem, Switch } from '@material-ui/core';
import Page from 'src/components/Page';
import { Formik } from 'formik';
import * as Yup from "yup";
import { trackPromise } from 'react-promise-tracker';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../../utils/newLoader';

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

export function CustomerGeneral({ customerGeneralArray, setCustomerGeneralArray, isUpdate }) {
  const classes = useStyles();
  const [btnDisable, setBtnDisable] = useState(false);
  const alert = useAlert();
  const [customer, setCustomer] = useState({
    customerName: '',
    taxNumber: '',
    address3: '',
    address1: '',
    address2: '',
    zipCode: '',
    country: '0',
    officePhoneNumber: '',
    mobile: '',
    email: '',
    isCreditCustomer: true,
    nicBRNumber: ''
  });
  useEffect(() => {
    trackPromise(
      setGeneralValues(),
    )
  }, [customerGeneralArray]);

  async function setGeneralValues() {

    if (Object.keys(customerGeneralArray).length > 0) {
      setCustomer({
        ...customer,
        taxNumber: customerGeneralArray.taxNumber,
        firstName: customerGeneralArray.firstName,
        address1: customerGeneralArray.address1,
        address2: customerGeneralArray.address2,
        address3: customerGeneralArray.address3,
        zipCode: customerGeneralArray.zipCode,
        country: customerGeneralArray.country,
        officePhoneNumber: customerGeneralArray.officePhoneNumber,
        mobile: customerGeneralArray.mobile,
        email: customerGeneralArray.email,
        groupID: customerGeneralArray.groupID,
        factoryID: customerGeneralArray.factoryID,
        customerName: customerGeneralArray.customerName,
        isCreditCustomer: customerGeneralArray.isCreditCustomer,
        nicBRNumber: customerGeneralArray.nicBRNumber,
        isActive: customerGeneralArray.isActive,
      });
    }
  }

  async function saveCustomerGeneral(values) {
    let general = {
      taxNumber: values.taxNumber,
      firstName: values.firstName,
      address1: values.address1,
      address2: values.address2,
      address3: values.address3,
      zipCode: values.zipCode,
      country: values.country,
      officePhoneNumber: values.officePhoneNumber,
      mobile: values.mobile,
      email: values.email,
      groupID: customerGeneralArray.groupID,
      factoryID: customerGeneralArray.factoryID,
      customerName: values.customerName,
      isCreditCustomer: values.isCreditCustomer,
      nicBRNumber: values.nicBRNumber,
      isActive: customer.isActive
    }
    btnchecking();
    setCustomerGeneralArray(general);
    alert.success('Successfully added general details');
  }

  function btnchecking() {
    setBtnDisable(true);
  }

  function handleChangeForm(e) {
    const target = e.target;
    const value = target.name === 'isCreditCustomer' ? target.checked : target.value
    setCustomer({
      ...customer,
      [e.target.name]: value
    });
  }

  return (
    <Page className={classes.root} title="General Details Add Edit">
      <Container maxWidth={false}>
        <LoadingComponent />
        <Formik
          initialValues={{
            taxNumber: customer.taxNumber,
            address1: customer.address1,
            address2: customer.address2,
            address3: customer.address3,
            zipCode: customer.zipCode,
            nicBRNumber: customer.nicBRNumber,
            officePhoneNumber: customer.officePhoneNumber,
            mobile: customer.mobile,
            email: customer.email,
            customerName: customer.customerName,
            country: customer.country,
            isCreditCustomer: customer.isCreditCustomer
          }}
          validationSchema={
            Yup.object().shape({
              taxNumber: Yup.string().matches(/^[a-zA-Z0-9\-]+$/, 'Special characters are not allowed').nullable().max(14, 'Maximum 14 characters '),
              address1: Yup.string().max(255).required('Address 1 is required').max('100', 'Allow only 100 digits'),
              address2: Yup.string().max(255).nullable().max('100', 'Allow only 100 digits'),
              address3: Yup.string().max(255).nullable().max('100', 'Allow only 100 digits'),
              zipCode: Yup.string().max(5, 'Only allow 5 digits').matches(/^[0-9\b]+$/, 'Only allow numbers').min('5', 'Only allow 5 digits').nullable(),
              nicBRNumber: Yup.string().required('NIC/BR Number is Required').matches(/^[A-Z a-z 0-9_-]*$/, 'Special characters are not allowed').max('12', 'Maximum 12 characters allowed'),
              officePhoneNumber: Yup.string().matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/, 'Please enter valid phone number').
                min(10, "Enter number is too short").max(10, "Entered number is too long").nullable(),
              mobile: Yup.string().matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/, 'Please enter valid phone number').
                min(10, "Enter number is too short").max(10, "Entered number is too long").nullable(),
              email: Yup.string().email('Please enter a valid email').nullable(),
              customerName: Yup.string().required('Customer Name is required').max('100', 'Allow only 100 digits'),
            })
          }
          onSubmit={(values) => trackPromise(saveCustomerGeneral(values))}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
            touched,
            values
          }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={3}>
                <Card>
                  <CardHeader
                    title="General Details"
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="nicBRNumber">
                            Customer NIC/BR No *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.nicBRNumber && errors.nicBRNumber)}
                            fullWidth
                            helperText={touched.nicBRNumber && errors.nicBRNumber}
                            name="nicBRNumber"
                            onBlur={handleBlur}
                            onChange={handleChangeForm}
                            value={customer.nicBRNumber}
                            variant="outlined"
                            size='small'
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="customerName">
                            Customer Name *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.customerName && errors.customerName)}
                            fullWidth
                            helperText={touched.customerName && errors.customerName}
                            name="customerName"
                            onBlur={handleBlur}
                            onChange={handleChangeForm}
                            value={customer.customerName}
                            variant="outlined"
                            size='small'
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="taxNumber">
                            Tax Number
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.taxNumber && errors.taxNumber)}
                            helperText={touched.taxNumber && errors.taxNumber}
                            onBlur={handleBlur}
                            id="taxNumber"
                            name="taxNumber"
                            value={customer.taxNumber}
                            type="text"
                            variant="outlined"
                            size='small'
                            onChange={handleChangeForm}>
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="isCreditCustomer">
                            Is Credit Customer
                          </InputLabel>
                          <Switch
                            checked={customer.isCreditCustomer}
                            onChange={(e) => handleChangeForm(e)}
                            name="isCreditCustomer"
                            size='small'
                          />
                        </Grid>

                      </Grid>
                      <Divider style={{ marginTop: '1rem' }} />
                      <CardHeader style={{ marginLeft: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                        title="Contact Details"
                      />
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="address1">
                            Address 1 *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.address1 && errors.address1)}
                            fullWidth
                            helperText={touched.address1 && errors.address1}
                            name="address1"
                            onBlur={handleBlur}
                            onChange={handleChangeForm}
                            value={customer.address1}
                            variant="outlined"
                            size='small'
                          />
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
                            type="address2"
                            onBlur={handleBlur}
                            onChange={handleChangeForm}
                            value={customer.address2}
                            variant="outlined"
                            size='small'
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="address3">
                            Address 3
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.address3 && errors.address3)}
                            helperText={touched.address3 && errors.address3}
                            fullWidth
                            onBlur={handleBlur}
                            id="address3"
                            name="address3"
                            value={customer.address3}
                            type="text"
                            variant="outlined"
                            size='small'
                            onChange={handleChangeForm}>
                          </TextField>

                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="zipCode">
                            ZIP Code
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.zipCode && errors.zipCode)}
                            helperText={touched.zipCode && errors.zipCode}
                            onBlur={handleBlur}
                            fullWidth
                            id="zipCode"
                            name="zipCode"
                            value={customer.zipCode}
                            type="text"
                            variant="outlined"
                            size='small'
                            onChange={handleChangeForm}>
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="country">
                            Country
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.country && errors.country)}
                            fullWidth
                            helperText={touched.country && errors.country}
                            name="country"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={customer.country}
                            size='small'
                            variant="outlined" >
                            <MenuItem value="0">--Select Country--</MenuItem>
                            <MenuItem value="1">Sri Lanka</MenuItem>
                            <MenuItem value="2">Other</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="officePhoneNumber">
                            Office Phone Number
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.officePhoneNumber && errors.officePhoneNumber)}
                            fullWidth
                            helperText={touched.officePhoneNumber && errors.officePhoneNumber}
                            name="officePhoneNumber"
                            onBlur={handleBlur}
                            onChange={handleChangeForm}
                            value={customer.officePhoneNumber}
                            variant="outlined"
                            size='small'
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="mobile">
                            Mobile Number
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.mobile && errors.mobile)}
                            fullWidth
                            helperText={touched.mobile && errors.mobile}
                            name="mobile"
                            onBlur={handleBlur}
                            onChange={handleChangeForm}
                            value={customer.mobile}
                            variant="outlined"
                            size='small'
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
                            name="email"
                            onBlur={handleBlur}
                            onChange={handleChangeForm}
                            value={customer.email}
                            variant="outlined"
                            size='small'
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        disabled={btnDisable}
                        type="submit"
                        variant="contained"
                      >
                        Add
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
  );
};

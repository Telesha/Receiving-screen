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
} from '@material-ui/core';
import Page from 'src/components/Page';
import { Form, Formik, FormikProvider, useFormik } from 'formik';
import * as Yup from "yup";
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { useAlert } from "react-alert";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  },
  root1: {
    height: 180,
  },
  container: {
    display: 'flex',
  },
}));

export function ContactInformation({ oldData, setOldData ,checkAllTabFill}) {

  const classes = useStyles();
  const [contact, setContact] = useState({
    officePhone: '',
    faxNumber: '',
    officialEmail: '',
    billingEmail: '',
    zipCode: '',
    location: '',
    address1: '',
    address2: '',
    address3: ''
  });
  const alert = useAlert();

  useEffect(() => {
    trackPromise(
      setContactValues());
  }, []);

  async function setContactValues() {
    setContact({
      ...contact,
      officePhone: oldData.officePhone,
      officialEmail: oldData.officialEmail,
      faxNumber: oldData.faxNumber,
      billingEmail: oldData.billingEmail,
      zipCode: oldData.zipCode,
      location: oldData.location,
      address1: oldData.address1,
      address2: oldData.address2,
      address3: oldData.address3,
    })

    setValues({
      ...contact,
      officePhone: oldData.officePhone,
      officialEmail: oldData.officialEmail,
      faxNumber: oldData.faxNumber,
      billingEmail: oldData.billingEmail,
      zipCode: oldData.zipCode,
      location: oldData.location,
      address1: oldData.address1,
      address2: oldData.address2,
      address3: oldData.address3,
    })
  }

  async function saveContact(values) {
    setOldData(values);
    alert.success("Contact information Added Successfully");
    checkAllTabFill();
  }

  const generalSchema =
    Yup.object().shape({
      officialEmail: Yup.string().max(255).matches(/^(?!\s)/, 'Official email should not start with a space').required('Official email is required').email('Please enter a valid email'),
      billingEmail: Yup.string().max(255).matches(/^(?!\s)/, 'Billing email should not start with a space').email('Please enter a valid email').nullable(),
      officePhone: Yup.string().matches(/^(?!\s)/, 'Office number should not start with a space').matches(/^[0-9]{10,10}$/, 'Office phone number should contains 10 digits of numbers').required('Office phone number is required'),
      faxNumber: Yup.string().matches(/^(?!\s)/, 'Fax number should not start with a space').matches(/^[0-9]{11,11}$/, 'Fax number should contains 11 digits of numbers').nullable(),
      location: Yup.string().max(255, 'City must be at most 255 characters').matches(/^(?!\s)/, 'City should not start with a space').required('City is required').matches(/^(?!\s)/, 'Only alphabets and special characters are allowed'),
      address1: Yup.string().max(255, 'Address 1 must be at most 255 characters').matches(/^(?!\s)/, 'Address 01 should not start with a space').required('Address 1 is required').matches(/^[a-zA-Z0-9\d\s\,\.\/]+$/, 'Special characters are not allowed').matches(/^(?!\s)/, 'Only alphabets and special characters are allowed'),
      address2: Yup.string().max(255, 'Address 2 must be at most 255 characters').matches(/^(?!\s)/, 'Address 02 should not start with a space').required('Address 2 is required').matches(/^[a-zA-Z0-9\d\s\,\.\/]+$/, 'Special characters are not allowed').matches(/^(?!\s)/, 'Only alphabets and special characters are allowed'),
      address3: Yup.string().max(255, 'Address 3 must be at most 255 characters').nullable().matches(/^(?!\s)/, 'Address 03 should not start with a space').matches(/^[a-zA-Z0-9\d\s\,\.\/]+$/, 'Special characters are not allowed').matches(/^(?!\s)/, 'Only alphabets and special characters are allowed'),
      zipCode: Yup.string().max(10, 'Max 10 digits').matches(/^(?!\s)/, 'Zip code should not start with a space').matches(/^(?!\s)/, 'Only alphabets and special characters are allowed').nullable()
    });

  const formik = useFormik({
    initialValues: {
      officePhone: contact.officePhone,
      officialEmail: contact.officialEmail,
      billingEmail: contact.billingEmail,
      faxNumber: contact.faxNumber,
      location: contact.location,
      address1: contact.address1,
      address2: contact.address2,
      address3: contact.address3,
      zipCode: contact.zipCode
    },

    validationSchema: generalSchema,
    onSubmit: (values) => {
      (saveContact(values));
    }
  })

  const {
    errors,
    handleBlur,
    //handleChange,
    handleSubmit,
    isSubmitting,
    touched,
    values,
    getFieldProps,
    setValues
  } = formik;


  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setContact({
      ...contact,
      [e.target.name]: value
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Contact Information Add Edit">
        <Container maxWidth={false}>
          <FormikProvider value={formik}>
            <Form
              onSubmit={handleSubmit}
              noValidate
            >
              <Box mt={3}>
                <Card className={classes.cardContent}>
                  <CardHeader
                    title="Add Contact Information"
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent>
                      <CardHeader style={{ marginLeft: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                        title="Contact Details"
                      />
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="officePhone">
                            Office Phone Number *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.officePhone && errors.officePhone)}
                            fullWidth
                            helperText={touched.officePhone && errors.officePhone}
                            name="officePhone"
                            size='small'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={formik.values.officePhone}
                            {...getFieldProps('officePhone')}
                            variant="outlined"
                            onInput={(e) => {
                              e.target.value = e.target.value
                            }}
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="officialEmail">
                            Official Email *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.officialEmail && errors.officialEmail)}
                            fullWidth
                            helperText={touched.officialEmail && errors.officialEmail}
                            name="officialEmail"
                            size='small'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={formik.values.officialEmail}
                            {...getFieldProps('officialEmail')}
                            variant="outlined"
                            onInput={(e) => {
                              e.target.value = e.target.value
                            }}
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="faxNumber">
                            Fax Number
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.faxNumber && errors.faxNumber)}
                            fullWidth
                            helperText={touched.faxNumber && errors.faxNumber}
                            name="faxNumber"
                            size='small'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={formik.values.faxNumber}
                            {...getFieldProps('faxNumber')}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="billingEmail">
                            Billing Email
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.billingEmail && errors.billingEmail)}
                            fullWidth
                            helperText={touched.billingEmail && errors.billingEmail}
                            name="billingEmail"
                            size='small'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={formik.values.billingEmail}
                            {...getFieldProps('billingEmail')}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                      <CardHeader style={{ marginLeft: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                        title="Address Details"
                      />
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="location">
                            City *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.location && errors.location)}
                            fullWidth
                            helperText={touched.location && errors.location}
                            name="location"
                            size='small'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={formik.values.location}
                            {...getFieldProps('location')}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="address1">
                            Address 1 *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.address1 && errors.address1)}
                            fullWidth
                            helperText={touched.address1 && errors.address1}
                            name="address1"
                            size='small'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={formik.values.address1}
                            {...getFieldProps('address1')}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="address2">
                            Address 2 *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.address2 && errors.address2)}
                            fullWidth
                            helperText={touched.address2 && errors.address2}
                            name="address2"
                            size='small'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={formik.values.address2}
                            {...getFieldProps('address2')}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="address3">
                            Address 3
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.address3 && errors.address3)}
                            fullWidth
                            helperText={touched.address3 && errors.address3}
                            name="address3"
                            size='small'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={contact.address3}
                            {...getFieldProps('address3')}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="zipCode">
                            Zip Code
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.zipCode && errors.zipCode)}
                            fullWidth
                            helperText={touched.zipCode && errors.zipCode}
                            name="zipCode"
                            size='small'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={formik.values.zipCode}
                            {...getFieldProps('zipCode')}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        type="submit"
                        variant="contained"
                      >
                        Add
                      </Button>
                    </Box>
                  </PerfectScrollbar>
                </Card>
              </Box>
            </Form>
          </FormikProvider>
        </Container>

      </Page>
    </Fragment >
  );
};

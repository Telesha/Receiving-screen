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
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  },
}));

export function GeneralDetails({ generalDetailsArray, setGeneralDetailsArray, isUpdate }) {
  const classes = useStyles();
  const [factory, setFactory] = useState({
    factoryCode: '0',
    factoryName: "",
    brNumber: "",
    taxNumber: "",
    managerName: ""
  });

  const alert = useAlert();
  const [btnDisable, setBtnDisable] = useState(false);

  useEffect(() => {
    trackPromise(
      setGeneralValues());
  }, []);

  async function setGeneralValues() {
    setFactory({
      ...factory,
      factoryCode: generalDetailsArray.factoryCode,
      factoryName: generalDetailsArray.factoryName,
      managerName: generalDetailsArray.managerName,
      taxNumber: generalDetailsArray.taxNumber,
      brNumber: generalDetailsArray.brNumber
    });
  }

  async function saveGeneral(values) {
    if (factory.factoryCode == '0' || factory.factoryName == "" || factory.location == "" || factory.address == "") {
      alert.error("Fill all fields");
    } else {
      setGeneralDetailsArray(values);
      setBtnDisable(true);
      alert.success("Successfully added general details");
    }

  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="General Details Add Edit">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              factoryCode: factory.factoryCode,
              factoryName: factory.factoryName,
              managerName: factory.managerName,
              taxNumber: factory.taxNumber,
              brNumber: factory.brNumber
            }}
            validationSchema={
              Yup.object().shape({
                factoryCode: Yup.string().max(255).required('Estate code is required').matches(/^[0-9\b]+$/, 'Estate code must be a positive number')
                  .min(2, 'Estate code must be at least 2 characters').max(2, 'Estate Code must be at most 2 characters'),
                factoryName: Yup.string().max(255).required('Estate Name is required').max(50, 'Allow only 50 digits'),
                managerName: Yup.string().max(255).nullable().matches(/^[a-zA-Z0-9_ ]*$/, 'Special characters are not allowed').max(50, 'Allow only 50 digits'),
                taxNumber: Yup.string().max(14, 'Allow only 14 digits').nullable().matches(/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?/^[a-zA-Z0-9\d\s\/\-]+$/).nullable().min(5, 'Minimum 5 digits required'),
                brNumber: Yup.string().max(255).nullable()
              })
            }
            onSubmit={(saveGeneral)}
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

            }) => (
              <form onSubmit={handleSubmit} autoComplete="off">
                <Box mt={3}>
                  <Card className={classes.cardContent}>
                    <CardHeader
                      title="Add General Details"
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryCode">
                              Estate Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.factoryCode && errors.factoryCode)}
                              fullWidth
                              helperText={touched.factoryCode && errors.factoryCode}
                              name="factoryCode"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.factoryCode}
                              variant="outlined"
                              size='small'
                              onInput={(e) => {
                                e.target.value = e.target.value.slice(0, 2)
                              }}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryName">
                              Estate Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.factoryName && errors.factoryName)}
                              fullWidth
                              helperText={touched.factoryName && errors.factoryName}
                              name="factoryName"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.factoryName}
                              variant="outlined"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="brNumber">
                              BR Number
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.brNumber && errors.brNumber)}
                              fullWidth
                              helperText={touched.brNumber && errors.brNumber}
                              name="brNumber"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.brNumber}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="taxNumber">
                              Tax Number
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.taxNumber && errors.taxNumber)}
                              fullWidth
                              helperText={touched.taxNumber && errors.taxNumber}
                              name="taxNumber"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.taxNumber}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="managerName">
                              Estate Manager Name
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.managerName && errors.managerName)}
                              fullWidth
                              helperText={touched.managerName && errors.managerName}
                              name="managerName"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.managerName}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={3}>
                        <Button
                          color="primary"
                          disabled={btnDisable}
                          type="submit"
                          variant="contained"
                          size='small'
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
    </Fragment>
  );
};

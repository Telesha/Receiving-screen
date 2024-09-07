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
  FormControl,
} from '@material-ui/core';
import Page from 'src/components/Page';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  },
}));

export function GeneralDetails({ generalDetailsArray, setGeneralDetailsArray, isUpdate ,checkAllTabFill}) {
  const classes = useStyles();
  const [factory, setFactory] = useState({
    factoryCode: '',
    factoryName: "",
    brNumber: "",
    taxNumber: "",
    managerName: "",
    operationEntityTypeID: '0'
  });

  const alert = useAlert();
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
      brNumber: generalDetailsArray.brNumber,
      operationEntityTypeID: generalDetailsArray.length == 0 ? 0 : generalDetailsArray.operationEntityTypeID,
    });
  }

  async function saveGeneral(values) {
    
    if (factory.factoryCode == '0' || factory.factoryName == "" || factory.location == "" || factory.address == "" || factory.operationEntityTypeID == '') {
      alert.error("Fill all fields");
    } else {
      setGeneralDetailsArray(values);
      alert.success("General Details Added Successfully");
    }
    checkAllTabFill();
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setFactory({
      ...factory,
      [e.target.name]: value
    });
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
              brNumber: factory.brNumber,
              operationEntityTypeID: factory.operationEntityTypeID
            }}
            validationSchema={
              Yup.object().shape({
                factoryCode: Yup.string().max(255).required('Operation Entity code is required')
                  .matches(/^(?!\s)/, 'Operation entity code should not start with a space')
                  .matches(/^[^\s]/, 'Operation Entity code is required')
                  .matches(/^[0-9\b]+$/, 'Only allow numbers')
                  .min(2, 'Operation Entity Code must be 2 numbers')
                  .max(2, 'Operation Entity Code must be at most 2 characters'),
                factoryName: Yup.string().max(255).required('Operation Entity name is required').max(50, 'Allow only 50 digits').matches(/^(?!\s)/, 'Operation entity name should not start with a space'),
                managerName: Yup.string().max(255).nullable().matches(/^(?!\s)/, 'Manager name should not start with a space')
                  .matches(/^[a-zA-Z]+[a-zA-Z.\s]+$/, 'Only allow letters and special charactors').max(50, 'Allow only 50 digits'),
                taxNumber: Yup.string().max(14, 'Allow only 14 digits').nullable().matches(/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?/^[a-zA-Z0-9\d\s\/\-]+$/)
                  .matches(/^(?!\s)/, 'Only alphabets and special characters are allowed').nullable().min(5, 'Minimum 5 digits required'),
                brNumber: Yup.string().max(255).nullable().matches(/^(?!\s)/, 'BR number should not start with a space').matches(/^(?!\s)/, 'Only alphabets and special characters are allowed'),
                operationEntityTypeID: Yup.number().min(1, "Operation Entity Type is required").required('Operation Entity Type is required'),
              })
            }
            onSubmit={(saveGeneral)}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
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
                            <InputLabel shrink id="operationEntityTypeID">
                              Operation Entity Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.operationEntityTypeID && errors.operationEntityTypeID)}
                              fullWidth
                              helperText={touched.operationEntityTypeID && errors.operationEntityTypeID}
                              name="operationEntityTypeID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={factory.operationEntityTypeID}
                              variant="outlined"
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Operation Entity Type--</MenuItem>
                              <MenuItem value="1">Estate</MenuItem>
                              <MenuItem value="2">Factory</MenuItem>
                              <MenuItem value="3">Both</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryCode">
                              Operation Entity Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.factoryCode && errors.factoryCode)}
                              fullWidth
                              helperText={touched.factoryCode && errors.factoryCode}
                              name="factoryCode"
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={factory.factoryCode}
                              variant="outlined"
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
                              Operation Entity Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.factoryName && errors.factoryName)}
                              fullWidth
                              helperText={touched.factoryName && errors.factoryName}
                              name="factoryName"
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={factory.factoryName}
                              variant="outlined"

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
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={factory.brNumber}
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
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={factory.taxNumber}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="managerName">
                              Operation Entity Manager Name
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.managerName && errors.managerName)}
                              fullWidth
                              helperText={touched.managerName && errors.managerName}
                              name="managerName"
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={factory.managerName}
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={3}>
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
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
};

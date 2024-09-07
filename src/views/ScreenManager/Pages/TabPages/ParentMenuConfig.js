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
import services from 'src/views/ScreenManager/Services';
import tokenDecoder from 'src/utils/tokenDecoder';

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

export function ParentMenuConfig({ }) {
  const classes = useStyles();
  const alert = useAlert();

  const [ParentMenuFormData, setParentMenuFormData] = useState({
    parentMenuName: "",
    iconTagName: "",
    menuOrderNumber: 0
  })

  useEffect(() => {
  }, []);

  async function SaveParentMenuDetails() {
    let requestModel = {
      parentMenuName: ParentMenuFormData.parentMenuName,
      iconTag: ParentMenuFormData.iconTagName.toLocaleLowerCase(),
      menuOrderNo: ParentMenuFormData.menuOrderNumber,
      createdBy: parseInt(tokenDecoder.getUserIDFromToken())
    }
    let response = await services.SaveParentMenuDetails(requestModel)
    if (response.statusCode == "Success") {
      alert.success(response.message);
    }
    else {
      alert.error(response.message);
    }
  }


  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setParentMenuFormData({
      ...ParentMenuFormData,
      [e.target.name]: value
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page title="Parent Menu">
        <Container>
          <Formik
            initialValues={{
              // bankID: account.bankID,
              // branchID: account.branchID,
              // accountNumber: account.accountNumber,
              // accountName: account.accountName
            }}
            validationSchema={
              Yup.object().shape({
                bankID: Yup.number().min(1, "Bank is required").required('Bank is required')
              })
            }
            // onSubmit={saveUser}
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
              <form onSubmit={handleSubmit}>
                <Box mt={2}>
                  <Card>
                    <CardHeader
                      title="Parent Menu"
                    />

                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="parentMenuName">
                              Parent Menu Name
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="parentMenuName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={ParentMenuFormData.parentMenuName}
                              variant="outlined"
                              id="parentMenuName"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="iconTagName">
                              Icon Tag Name
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="iconTagName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={ParentMenuFormData.iconTagName}
                              variant="outlined"
                              id="iconTagName"
                              inputProps={{ style: { textTransform: "lowercase" } }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="menuOrderNumber">
                              Menu Order
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="menuOrderNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={ParentMenuFormData.menuOrderNumber}
                              variant="outlined"
                              id="menuOrderNumber"
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="reset"
                          variant="outlined"
                          onClick={() => trackPromise(SaveParentMenuDetails())}
                          size='small'
                        >
                          Save Parent Menu
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
    </Fragment >
  );
};

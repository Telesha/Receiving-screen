import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button,
  CardContent, Divider, InputLabel, Switch, CardHeader,
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

export default function ProductAddEdit(props) {
  const [title, setTitle] = useState("Add Product")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [product, setProduct] = useState({
    productCode: '',
    productName: '',
    productDescription: '',
    isActive: true,
  });

  const navigate = useNavigate();
  const handleClick = () => {

    navigate('/app/products/listing');

  }
  const alert = useAlert();
  const { productID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    decrypted = atob(productID.toString());
    if (decrypted != 0) {
      trackPromise(
        getProductDetails(decrypted)
      )
    }
  }, []);

  async function getProductDetails(productID) {
    let response = await services.getProductDetailsByID(productID);
    let data = response[0];
    setTitle("Update Product");
    setProduct(data);
    setIsUpdate(true);

  }
  async function getPermissions() {
  }


  async function saveProduct(values) {
    if (isUpdate == true) {

      let updateModel = {
        productID: atob(productID.toString()),
        productCode: values.productCode,
        productName: values.productName,
        productDescription: values.productDescription,
        isActive: values.isActive,
      }

      let response = await services.updateProduct(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/products/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveProduct(values);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/products/listing');
      }
      else {
        alert.error(response.message);
      }
    }
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
            isEdit={false}
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
              productCode: product.productCode,
              productName: product.productName,
              productDescription: product.productDescription,
              isActive: product.isActive,

            }}
            validationSchema={
              Yup.object().shape({
                productCode: Yup.string().max(5, 'Product code must be at most 5 characters').required('Product Code is required'),
                productName: Yup.string().max(255).required('Product Name is required'),
                productDescription: Yup.string().max(255).required('Product Description is required')
              })
            }
            onSubmit={saveProduct}
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
                            <InputLabel shrink id="productCode">
                              Product Code *
                              </InputLabel>
                            <TextField
                              error={Boolean(touched.productCode && errors.productCode)}
                              fullWidth
                              helperText={touched.productCode && errors.productCode}
                              name="productCode"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.productCode}
                              variant="outlined"
                              disabled={isDisableButton}
                              size = 'small'
                            />
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="productName">
                              Product Name *
                              </InputLabel>
                            <TextField
                              error={Boolean(touched.productName && errors.productName)}
                              fullWidth
                              helperText={touched.productName && errors.productName}
                              name="productName"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.productName}
                              variant="outlined"
                              disabled={isDisableButton}
                              size = 'small'
                            />
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="productDescription">
                              Product Description *
                              </InputLabel>
                            <TextField
                              error={Boolean(touched.productDescription && errors.productDescription)}
                              fullWidth
                              helperText={touched.productDescription && errors.productDescription}
                              name="productDescription"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.productDescription}
                              variant="outlined"
                              disabled={isDisableButton}
                              size = 'small'
                            />
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
                          disabled={isSubmitting || isDisableButton}
                          type="submit"
                          variant="contained"
                          size = 'small'
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

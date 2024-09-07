import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button,
  CardContent, Divider, InputLabel, Switch, CardHeader, Select, MenuItem
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
import tokenService from '../../../utils/tokenDecoder';

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

export default function CollectionTypeAddEdit(props) {
  const [title, setTitle] = useState("Add Collection Type")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [products, setProducts] = useState();
  const [userID,setUserID]= useState('');
  const [collectionType, setCollectionType] = useState({
    productID: '0',
    collectionTypeName: '',
    collectionTypeCode: '',
    isActive: true,
  });

  const navigate = useNavigate();
  const handleClick = () => {

    navigate('/app/collectionTypes/listing');
  }
  const alert = useAlert();
  const { collectionTypeID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    getPermissions();
    setUserID(tokenService.getUserIDFromToken());
  }, []);

  useEffect(() => {
    decrypted = atob(collectionTypeID.toString());
    if (decrypted != 0) {
      trackPromise(
        getCollectionTypeDetails(decrypted)
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getProductsForDropdown()
    );
  }, []);

  async function getProductsForDropdown() {
    const products = await services.getProductsForDropdown();
    setProducts(products);
  }

  async function getCollectionTypeDetails(collectionTypeID) {
    let response = await services.getCollectionTypeDetailsByID(collectionTypeID);
    let data = response[0];
    setTitle("Update Collection Type");
    setCollectionType(data);
    setIsUpdate(true);

  }
  async function getPermissions() {
  }

  async function saveCollectionType(values) {
    if (isUpdate == true) {

      let updateModel = {
        collectionTypeID: atob(collectionTypeID.toString()),
        collectionTypeCode: values.collectionTypeCode,
        collectionTypeName: values.collectionTypeName,
        isActive: values.isActive,
        collectionTypeUserID : userID,
      }

      let response = await services.updateCollectionType(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/collectionTypes/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveCollectionType(values,userID);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/collectionTypes/listing');
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
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
      }
    }
    return items
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
              productID: collectionType.productID,
              collectionTypeCode: collectionType.collectionTypeCode,
              collectionTypeName: collectionType.collectionTypeName,
              isActive: collectionType.isActive,

            }}
            validationSchema={
              Yup.object().shape({
                productID: Yup.number().required('Product is required').min("1", 'Product required'),
                collectionTypeName: Yup.string().max(30,'Collection type name should be at most 30 characters.').required('Collection type name is required'),
                collectionTypeCode: Yup.number().max(15000, 'Collection type code should be at most 5 digits.').required('Collection type code is required').typeError('Only numbers should allowed.'),
              })
            }
            onSubmit={saveCollectionType}
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
                            <InputLabel shrink id="productID">
                              Product *
                          </InputLabel>
                            <TextField select
                              error={Boolean(touched.productID && errors.productID)}
                              fullWidth
                              helperText={touched.productID && errors.productID}
                              size = 'small'
                              name="productID"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.productID}
                              variant="outlined"
                              id="productID"
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Product--</MenuItem>
                              {generateDropDownMenu(products)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="collectionTypeCode">
                              Collection Type Code *
                              </InputLabel>
                            <TextField
                              error={Boolean(touched.collectionTypeCode && errors.collectionTypeCode)}
                              fullWidth
                              helperText={touched.collectionTypeCode && errors.collectionTypeCode}
                              size = 'small'
                              name="collectionTypeCode"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.collectionTypeCode}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="collectionTypeName">
                              Collection Type Name *
                              </InputLabel>
                            <TextField
                              error={Boolean(touched.collectionTypeName && errors.collectionTypeName)}
                              fullWidth
                              helperText={touched.collectionTypeName && errors.collectionTypeName}
                              size = 'small'
                              name="collectionTypeName"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.collectionTypeName}
                              variant="outlined"
                              disabled={isDisableButton}
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

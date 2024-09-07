import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import MenuItem from '@material-ui/core/MenuItem';
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import DeleteIcon from '@material-ui/icons/Delete';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  container: {
    display: 'flex',
    width: "fullWidth"
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  },
}));

export function Productdetails({ productDetailsArray, setProductDetailsArray, setChecker, checker }) {
  const classes = useStyles();
  const [user, setUser] = useState({
    productID: '0',
    collectionTypeID: '0',
  });
  const alert = useAlert();
  const [products, setProducts] = useState('');//get all products
  const [collectionTypes, setCollectionTypes] = useState('');//get all collection categories
  const [productList, setProductList] = useState([]);
  const [productArray, setProductArray] = useState([]);
  const [CollectionTypeArray, setCollectionTypeArray] = useState([]);
  const handleOnchange = val => {
    setProducts(val)
  }
  const handleOnchangeCategory = val => {
    setCollectionTypes(val)
  }
  const [options, setOptions] = useState([]);
  const [options2, setOptions2] = useState([]);
  const productSelectOnChange = (event) => {
    getCollectionTypeDetailsByProductID(event);
  }

  useEffect(() => {
    trackPromise(
      getProductDetails());
  }, []);

  async function getCollectionTypeDetailsByProductID(productID) {
    const collectionType = await services.getCollectionTypeDetails(productID);
    var newCollectionTypeArray = options2;
    newCollectionTypeArray.splice(0, newCollectionTypeArray.length);
    for (var i = 0; i < collectionType.length; i++) {
      newCollectionTypeArray.push({ label: collectionType[i].collectionTypeName, value: collectionType[i].collectionTypeID + ":" + collectionType[i].productID })
    }
    setOptions2(newCollectionTypeArray);
  }

  async function getProductDetails() {
    const product = await services.getProductDetails();
    var newOptionArray = options;
    for (var i = 0; i < product.length; i++) {
      newOptionArray.push({ label: product[i].productName, value: product[i].productID })
    }
    setOptions(newOptionArray);
    setProductList(product);
    getAllCollectionTypeList();
  }

  async function getAllCollectionTypeList() {
    const collectionType = await services.getAllCollectionTypes();
    setCollectionTypeArray(collectionType);
  }

  async function saveProduct(values) {
    if (products.length == 0 || collectionTypes.length == 0) {
      alert.error('Please select before add');
      return
    }
    var splitCollectionCategoryArray = collectionTypes.split(",")
    var collectionTypedata = productDetailsArray;

    for (const collectionTypeObject of splitCollectionCategoryArray) {

      let itemArray = collectionTypeObject.split(":");
      let collectionTypeID = itemArray[0];
      let collectionTypeProductID = itemArray[1];
      let collectionTypeIsNotExsist = true;

      for (const exsistCollectionType of productDetailsArray) {
        if (parseInt(exsistCollectionType.collectionID) === parseInt(collectionTypeID) && exsistCollectionType.isActive === true) {
          collectionTypeIsNotExsist = false;
        }
      }
      if (collectionTypeIsNotExsist) {
        collectionTypedata.push({ productID: collectionTypeProductID, collectionID: collectionTypeID, isActive: true });
      }
    }
    alert.success("Successfully added product details");
    setProductDetailsArray(collectionTypedata);
    if (Object.keys(productDetailsArray.filter(x => x.isActive == true)).length > 0) {
      setChecker(true);
    }
    else {
      setChecker(false);
    }
  }

  function DeleteItem(index) {
    let array = []
    array = [...productDetailsArray];
    array[index].isActive = false;
    setProductDetailsArray(array);
    alert.success('Item removed successfully');

    if (Object.keys(productDetailsArray.filter(x => x.isActive == true)).length > 0) {
      setChecker(true);
    }
    else {
      setChecker(false);
    }
  }

  function settingProduct(data) {
    let product = options.filter(product => product.value == parseInt(data));
    var productName = product.map(pr => pr.label);
    return productName;
  }

  function settingCollectionType(collectionTypeID) {
    for (const s of CollectionTypeArray) {
      if ((parseInt(s.collectionTypeID)) === (parseInt(collectionTypeID))) {
        return s.collectionTypeName
      }
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Product Details Add Edit">
        <Container maxWidth={false}>

          <Formik
            initialValues={{
              productID: user.productID,
              collectionTypeID: user.collectionTypeID,
              lastName: user.lastName,
              password: user.password
            }}
            validationSchema={
              Yup.object().shape({
                productID: Yup.string().max(255).required('Product is required'),
                collectionTypeID: Yup.string().max(255).required('Collection Type is required'),
              })
            }
            onSubmit={saveProduct}
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
                    <Card className={classes.cardContent}>
                      <CardHeader
                        title="Add Product Details"
                      />

                      <PerfectScrollbar>
                        <Divider />
                        <CardContent>

                          <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                              <InputLabel shrink id="productID">
                                Product *
                              </InputLabel>
                              <MultiSelect
                                fullWidth
                                variant="outlined"
                                placeholder={"--Select Product--"}
                                closeOnSelect={true}
                                clearable={true}
                                size='small'
                                onChange={(e) => {
                                  handleOnchange(e)
                                  productSelectOnChange(e)
                                }}
                                options={options}
                                singleSelect
                                
                              >
                                <MenuItem value="0">--Select Product--</MenuItem>
                              </MultiSelect>
                            </Grid>
                            <Grid item md={6} xs={12} >
                              <InputLabel shrink id="collectionTypeID">
                                Collection Type *
                              </InputLabel>
                              <MultiSelect
                                variant="outlined"
                                placeholder={"--Select Collection Type--"}
                                closeOnSelect={true}
                                clearable={true}
                                onChange={handleOnchangeCategory}
                                options={options2}
                              >
                                <MenuItem value="0">--Select Collection Type--</MenuItem>
                              </MultiSelect>
                            </Grid>
                          </Grid>
                        </CardContent>
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            size='small'
                          >
                            Add
                         </Button>
                        </Box>
                        <Divider />

                        <CardContent>
                          {
                            productDetailsArray.length > 0 ?

                              <PerfectScrollbar>
                                <Box minWidth={1050}>
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell align={'center'} >Products</TableCell>
                                        <TableCell align={'center'} >Collection Types</TableCell>
                                        <TableCell align={'center'} >Actions</TableCell>
                                      </TableRow>
                                    </TableHead>

                                    <TableBody>
                                      {productDetailsArray.map((rowData, index) => {
                                        if (rowData.isActive === true) {
                                          return (
                                            <TableRow key={index}>
                                              <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {settingProduct(rowData.productID)}
                                              </TableCell>
                                              <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {settingCollectionType(rowData.collectionID)}
                                              </TableCell>
                                              <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                <Button onClick={() => DeleteItem(index)}>
                                                  <DeleteIcon
                                                    style={{
                                                      color: "red"
                                                    }}
                                                  >
                                                  </DeleteIcon>
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          )
                                        }
                                      })}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </PerfectScrollbar>
                              : null
                          }
                        </CardContent>
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

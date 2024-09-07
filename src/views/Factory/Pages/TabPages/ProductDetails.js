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
  TableCell, TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import DeleteIcon from '@material-ui/icons/Delete';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { AlertDialogWithoutButton } from 'src/views/Common/AlertDialogWithoutButton';

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

export function Productdetails({ productDetailsArray, setProductDetailsArray, setChecker, checkAllTabFill }) {
  const classes = useStyles();
  const [user, setUser] = useState({
    productID: '0',
    collectionTypeID: '0',
  });
  const alert = useAlert();
  const [products, setProducts] = useState('');
  const [collectionTypes, setCollectionTypes] = useState('');
  const [CollectionTypeArray, setCollectionTypeArray] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [tableIndex, setTableIndex] = useState([]);
  const handleOnchange = val => {
    setProducts(val)
  }
  const handleOnchangeCategory = val => {
    setCollectionTypes(val);
    if (val === '' || val === null)
      setIsCollectionEmpty(true);
    else
      setIsCollectionEmpty(false);
  }
  const [options, setOptions] = useState([]);
  const [optionTwo, SetOptionTwo] = useState([]);
  const [clear, setClear] = useState(true)
  const [isProductEmpty, setIsProductEmpty] = useState(false);
  const [isCollectionEmpty, setIsCollectionEmpty] = useState(false);
  const [collectionName, setCollectionName] = useState();
  const productSelectOnChange = (event) => {
    getCollectionTypeDetailsByProductID(event);
    if (event > 0)
      setIsProductEmpty(false);
    else
      setIsProductEmpty(true);
  }

  useEffect(() => {
    trackPromise(
      getProductDetails());
  }, []);

  async function getCollectionTypeDetailsByProductID(productID) {
    const collectionType = await services.getCollectionTypeDetails(productID);
    var newCollectionTypeArray = optionTwo;
    newCollectionTypeArray.splice(0, newCollectionTypeArray.length);
    for (var i = 0; i < collectionType.length; i++) {
      if (collectionType[i].isActive == true) {
        newCollectionTypeArray.push({ label: collectionType[i].collectionTypeName, value: collectionType[i].collectionTypeID + ":" + collectionType[i].productID })
      }
    }
    SetOptionTwo(newCollectionTypeArray);
  }

  async function getProductDetails() {
    const product = await services.getProductDetails();
    var newOptionArray = options;
    for (var i = 0; i < product.length; i++) {
      newOptionArray.push({ label: product[i].productName, value: product[i].productID })
    }
    setOptions(newOptionArray);
    getAllCollectionTypeList();
  }

  async function getAllCollectionTypeList() {
    const collectionType = await services.getAllCollectionTypes();
    setCollectionTypeArray(collectionType);
  }
  async function saveProduct() {
    if (products.length == 0 && collectionTypes.length == 0) {
      setIsProductEmpty(true);
      setIsCollectionEmpty(true);
      return;
    }
    else if (products.length == 0) {
      setIsProductEmpty(true);
      return;
    }
    else if (collectionTypes.length == 0) {
      setIsCollectionEmpty(true);
      return;
    }
    else {
      setIsProductEmpty(false);
      setIsCollectionEmpty(false);
    }
    var splitCollectionCategoryArray = collectionTypes.split(",")
    var collectionTypedata = productDetailsArray;
    let collectionTypeIsNotExsist = true;
    for (const collectionTypeObject of splitCollectionCategoryArray) {

      let itemArray = collectionTypeObject.split(":");
      let collectionTypeID = itemArray[0];
      let collectionTypeProductID = itemArray[1];
      for (const exsistCollectionType of productDetailsArray) {
        if (parseInt(exsistCollectionType.collectionID) === parseInt(collectionTypeID) && exsistCollectionType.isActive === true) {
          collectionTypeIsNotExsist = false;
          alert.error("COLLECTION TYPE ALREADY EXISTS");
          setClear(!clear);
        }
      }
      if (collectionTypeIsNotExsist) {
        collectionTypedata.push({ productID: collectionTypeProductID, collectionID: collectionTypeID, isActive: true });
      }
    }

    if (collectionTypedata.length >= 1 && collectionTypeIsNotExsist) {
      alert.success("Product details Added Successfully");
      setClear(!clear);
    }
    setProductDetailsArray(collectionTypedata);
    if (Object.keys(productDetailsArray.filter(x => x.isActive == true)).length > 0) {
      setChecker(true);

    }
    else {

      setChecker(false);
    }
    checkAllTabFill();
  }

  function DeleteItem(index, data) {
    setDialog(true);
    setTableIndex(index);
    var collection_ID = productDetailsArray[index].collectionID;
    var collect = CollectionTypeArray.find(p => p.collectionTypeID == collection_ID)
    setCollectionName(collect);
  }

  async function confirmRequest() {
    let array = []
    array = [...productDetailsArray];
    array[tableIndex].isActive = false;
    setProductDetailsArray(array);
    alert.success('Product Details Removed Successfully');
    setDialog(false)

    if (Object.keys(productDetailsArray.filter(x => x.isActive == true)).length > 0) {
      setChecker(true);
    }
    else {
      setChecker(false);
    }
    checkAllTabFill();
  }

  async function cancelRequest() {
    setDialog(false)
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
              handleSubmit,
              touched,
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
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="productID">
                              Product *
                            </InputLabel>
                            <MultiSelect
                              id="productID"
                              name="productID"
                              key={clear}
                              error={Boolean(touched.productID && errors.productID)}
                              fullWidth
                              helperText={touched.productID && errors.productID}
                              variant="outlined"
                              placeholder={"--Select Product--"}
                              closeOnSelect={true}
                              clearable={true}
                              onChange={(e) => {
                                handleOnchange(e)
                                productSelectOnChange(e)
                              }}
                              options={options}
                              singleSelect
                            >
                            </MultiSelect>
                            {isProductEmpty ? <InputLabel shrink id="productID" style={{
                              marginLeft: '14px', color: '#f44336', marginTop: '4px',
                              fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"], fontWeight: '400'
                            }}>
                              Product is required
                            </InputLabel> : null}
                          </Grid>
                          <Grid item md={4} xs={12} style={{ marginLeft: '25px' }}>
                            <InputLabel shrink id="collectionTypeID">
                              Collection Type *
                            </InputLabel>
                            <MultiSelect
                              id="collectionTypeID"
                              name='collectionTypeID'
                              key={clear}
                              error={Boolean(touched.collectionTypeID && errors.collectionTypeID)}
                              helperText={touched.collectionTypeID && errors.collectionTypeID}
                              variant="outlined"
                              placeholder={"--Select Collection Type--"}
                              closeOnSelect={true}
                              clearable={true}
                              onChange={handleOnchangeCategory}
                              options={optionTwo}
                            >
                            </MultiSelect>
                            {isCollectionEmpty ? <InputLabel shrink id="productID" style={{
                              marginLeft: '14px', color: '#f44336', marginTop: '4px',
                              fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"], fontWeight: '400'
                            }}>
                              Collection Type is required
                            </InputLabel> : null}

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
                      <Divider />
                      <CardContent>
                        {
                          productDetailsArray.length > 0 ?
                            < PerfectScrollbar >
                              <div minWidth={900}>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell align={'center'} >Product</TableCell>
                                      <TableCell align={'center'} >Collection Type</TableCell>
                                      <TableCell align={'center'} >Action</TableCell>
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
                                              <Button onClick={() => DeleteItem(index, rowData)}>
                                                <Tooltip
                                                  title="Delete Collection Type"
                                                  placement='right'
                                                  backgroundColor='white'>
                                                  <DeleteIcon
                                                    style={{
                                                      color: "red"
                                                    }}
                                                  >
                                                  </DeleteIcon>
                                                </Tooltip>
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        )
                                      }
                                    })}
                                    {dialog ?
                                      <AlertDialogWithoutButton confirmData={confirmRequest} cancelData={cancelRequest}
                                        headerMessage={"Product Details"}
                                        discription={"Are you sure you want to delete " + (collectionName.collectionTypeName)} />
                                      : null}
                                  </TableBody>
                                </Table>
                              </div>
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

      </Page >
    </Fragment >
  );
};

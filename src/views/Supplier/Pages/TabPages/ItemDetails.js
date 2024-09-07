import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, Table, TableBody, TableCell, TableHead, TableRow, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import { Formik } from 'formik';
import * as Yup from "yup";
import DeleteIcon from '@material-ui/icons/Delete';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import services from '../../Services';
import { useAlert } from "react-alert";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { AlertDialogWithoutButton } from '../../../Common/AlertDialogWithoutButton';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  container: {
    display: 'flex',
  },
}));

export function ItemDetails({ supplierItemArray, setSupplierItemArray, factoryID, groupID }) {

  const classes = useStyles();
  const [supplier, setSupplier] = useState('');
  const alert = useAlert();
  const [factoryItems, setFactoryItems] = useState();
  const [factoryItemList, setFactoryItemList] = useState([]);
  const [dialogbox, setDialogbox] = useState(false);
  const [tableIndex, setTableIndex] = useState([]);
  const [IsCleared, setIsCleared] = useState(false);
  useEffect(() => {
    trackPromise(getAllFactoryItems());
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoryItemsForDropDown(),
    )
  }, [groupID, factoryID]);

  async function getAllFactoryItems() {
    const factoryList = await services.getAllFactoryItems();
    setFactoryItemList(factoryList);
  }

  async function getfactoryItemsForDropDown() {
    const factoryItem = await services.getfactorySupplierItemsByGroupIDANDFactoryID(groupID, factoryID);
    setFactoryItems(factoryItem);
  }

  async function saveSupplierItems(values) {
    var exists = supplierItemArray.filter((x, i) => parseInt(x.supplierItem) === parseInt(supplier.supplierItem));

    if (exists.length > 0) {
      alert.error("Supplier item already exists");
    } else {
      supplierItemArray.push({
        supplierItem: parseInt(supplier.supplierItem),
        factoryID: parseInt(factoryID)
      });
      setSupplierItemArray(supplierItemArray);
      alert.success('Item added successfully');
      setIsCleared(!IsCleared)
    }

  }

  async function EditIcon(index) {
    setDialogbox(true);
    setTableIndex(index)

  }

  async function confirmData() {

    if (supplierItemArray[tableIndex].factoryItemSupplierID != undefined || supplierItemArray[tableIndex].factoryItemSupplierID != null) {
      const res = await services.DeActivateSupplierFactoryItem(supplierItemArray[tableIndex].factoryItemSupplierID);
      setDialogbox(false);
      if (res.statusCode === "Success") {
        alert.success(res.message);
        setSupplierItemArray(current => current.filter((img, i) => i != tableIndex));
      } 
      else {
        alert.error(res.message);
      }        
    }
    else {
      for (var i = 0; i < supplierItemArray.length; i++) {
        setSupplier({
          ...supplier,
          supplierItem: supplierItemArray[i].supplierItem,
        })
      }
      supplierItemArray.splice(tableIndex, 1);
      alert.success('Item removed successfully');
      setDialogbox(false);
    }

  }

  async function cancelData() {
    setDialogbox(false);
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
  }

  function settingSupplierItems(data, ind) {
    if (data == 0 || data == undefined) {
      return null;
    }
    else {
      let items = factoryItemList.filter((item, index) => index == parseInt(data.supplierItem));

      if (items == undefined || items.length == 0) {
        return null;
      } else {
        return (
          <TableRow key={ind}>
            <TableCell align={'center'} style={{ borderBottom: "none" }}>
              {items}
            </TableCell>
            <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
              <Button onClick={() => EditIcon(ind)}>
                <DeleteIcon
                  style={{
                    color: "red",
                    cursor: "pointer"
                  }}
                >
                </DeleteIcon>
              </Button>
            </TableCell>
          </TableRow>

        );
      }
    }
  }

  function handleSearchDropdownChange(data, e) {
    if (data != undefined || data != null) {
      setSupplier({
        ...supplier,
        supplierItem: data.factoryItemID
      });
      return;
    }

  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Item Details">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              supplierItem: supplier.supplierItem
            }}
            validationSchema={
              Yup.object().shape({
                supplierItem: Yup.number().required('Supplier item is required').min("1", 'Select a supplier item'),
              })
            }
            onSubmit={saveSupplierItems}
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
                      title="Item Details"
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="supplierItem">
                              Supplier Item *
                            </InputLabel>
                            <br></br>
                            <Autocomplete
                              key={IsCleared}
                              id="supplierItem"
                              options={factoryItems}
                              getOptionLabel={(option) => option.itemName}
                              onChange={(e, value) => handleSearchDropdownChange(value, e)}
                              defaultValue={null}
                              renderInput={(params) =>
                                <TextField {...params}
                                  error={Boolean(touched.supplierItem && errors.supplierItem)}
                                  fullWidth
                                  helperText={touched.supplierItem && errors.supplierItem}
                                  name="supplierItem"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange1(e)}
                                  value={supplier.supplierItem}
                                  variant="outlined"
                                  size='small'
                                  label = '--Select Supplier Items--'
                                />
                              }
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting}
                          type="submit"
                          variant="contained"
                        >
                          Add
                        </Button>
                      </Box>
                      <CardContent>
                        {(supplierItemArray.length > 0) ?
                          <PerfectScrollbar>
                            <Box minWidth={1050}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell align={'center'} >Supplier Item</TableCell>
                                    <TableCell align={'center'} >Action</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {supplierItemArray.map((rowData, index) => (
                                    settingSupplierItems(rowData, index)
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                            {dialogbox ?
                              <AlertDialogWithoutButton confirmData={confirmData} cancelData={cancelData}
                                IconTitle={"Delete"}
                                headerMessage={"Delete"}
                                discription={"Are you sure you want to delete?"} />
                              : null
                            }
                          </PerfectScrollbar>
                          : null}
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

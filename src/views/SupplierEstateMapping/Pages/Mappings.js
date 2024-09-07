import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Grid, makeStyles, Container, Button, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, FormGroup, FormControlLabel, Checkbox
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../utils/newLoader';
import { useAlert } from "react-alert";
import DeleteIcon from '@material-ui/icons/Delete';
import { AlertDialogWithoutButton } from '../../Common/AlertDialogWithoutButton';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
    marginTop: theme.spacing(3)
  },
  container: {
    display: 'flex',
  },
}));

export function Mappings({ groupID, supplierEstateMapping, setSupplierEstateMapping }) {
  const classes = useStyles();
  const [tableIndex, setTableIndex] = useState([]);
  const [dialogbox, setDialogbox] = useState(false);
  const alert = useAlert();
  const [suppliers, setSuppliers] = useState([])
  const [estates, setEstates] = useState([])
  async function GetAllSuppliersByGroupID() {
    const suppliers = await services.GetAllSuppliersByGroupID(groupID);
    setSuppliers(suppliers);
  }

  async function getFactoriesByGroupID() {
    const estates = await services.getFactoriesByGroupID(groupID);

    const newEstates = estates.map((estate) => ({
      estateID: estate.factoryID,
      estateName: estate.factoryName,
    }));


    setEstates(newEstates);
  }

  useEffect(() => {
    setSupplierEstateMapping([]);
    trackPromise(
      GetAllSuppliersByGroupID());
    trackPromise(
      getFactoriesByGroupID());

  }, [groupID]);


  function handleCheck(e, index, type, setFieldValue, values) {
    if (type === 'suppliers') {
      const updatedSuppliers = [...values.suppliers];
      updatedSuppliers[index].checked = e.target.checked;
      setFieldValue('suppliers', updatedSuppliers);
    } else if (type === 'estates') {
      const updatedEstates = [...values.estates];
      updatedEstates[index].checked = e.target.checked;
      setFieldValue('estates', updatedEstates);
    }
  }
  async function handleClickRemove(index) {
    setDialogbox(true);
    setTableIndex(index);
  }

  async function confirmData() {
    setDialogbox(false);
    const updatedSupplierEstateMapping = [...supplierEstateMapping];
    updatedSupplierEstateMapping.splice(tableIndex, 1);
    setSupplierEstateMapping(updatedSupplierEstateMapping);
  }

  async function cancelData() {
    setDialogbox(false);
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Supplier Estate Mapping Add Edit">
        <Container maxWidth={false}>
          <Formik
            enableReinitialize
            initialValues={{
              suppliers: suppliers ? suppliers.map(supplier => ({ ...supplier, checked: false })) : [],
              estates: estates ? estates.map(estate => ({ ...estate, checked: false })) : [],
            }}
            validationSchema={Yup.object().shape({
              suppliers: Yup.array()
                .of(
                  Yup.object().shape({
                    checked: Yup.boolean(),
                  })
                )
                .test('at-least-one-checked', 'At least one supplier must be selected', (suppliers) =>
                  suppliers.some(supplier => supplier.checked)
                ),
              estates: Yup.array()
                .of(
                  Yup.object().shape({
                    checked: Yup.boolean(),
                  })
                )
                .test('at-least-one-checked', 'At least one estate must be selected', (estates) =>
                  estates.some(estate => estate.checked)
                ),
            })}
            onSubmit={(values) => {
              const selectedSuppliers = values.suppliers.filter(supplier => supplier.checked);
              const selectedEstates = values.estates.filter(estate => estate.checked);
              const newSupplierEstateMapping = [];
              selectedSuppliers.forEach(supplier => {
                selectedEstates.forEach(estate => {
                  if (supplierEstateMapping.some(mapping => mapping.supplierID === supplier.supplierID && mapping.estateID === estate.estateID)) {
                    return;
                  }
                  newSupplierEstateMapping.push({
                    supplierID: supplier.supplierID,
                    supplierName: supplier.supplierName,
                    estateID: estate.estateID,
                    estateName: estate.estateName,
                  });
                });
              });
              setSupplierEstateMapping([...supplierEstateMapping, ...newSupplierEstateMapping]);
            }}
          >
            {({
              errors,
              handleSubmit,
              setFieldValue,
              touched,
              values,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={1}>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>
                      <InputLabel shrink id="suppliers">
                        Suppliers *
                      </InputLabel>
                      <Box sx={{ border: '1px solid black !important', borderRadius: '5px' }}>
                        <FormGroup>
                          {values.suppliers.map((supplier, index) => (
                            <FormControlLabel
                              key={supplier.supplierID}
                              control={
                                <Checkbox
                                  checked={supplier.checked}
                                  onChange={(e) =>
                                    handleCheck(e, index, 'suppliers', setFieldValue, values)
                                  }
                                  name={supplier.supplierName}
                                  color="primary"
                                />
                              }
                              label={supplier.supplierName}
                            />
                          ))}
                        </FormGroup>
                        {touched.suppliers && errors.suppliers ? (
                          <div style={{ color: 'red' }}>{errors.suppliers}</div>
                        ) : null}
                      </Box>
                    </Grid>

                    <Grid item md={4} xs={12}>
                      <InputLabel shrink id="estates">
                        Estates *
                      </InputLabel>
                      <Box sx={{ border: '1px solid black !important', borderRadius: '5px' }}>
                        <FormGroup>
                          {values.estates.map((estate, index) => (
                            <FormControlLabel
                              key={estate.estateID}
                              control={
                                <Checkbox
                                  checked={estate.checked}
                                  onChange={(e) =>
                                    handleCheck(e, index, 'estates', setFieldValue, values)
                                  }
                                  name={estate.estateName}
                                  color="primary"
                                />
                              }
                              label={estate.estateName}
                            />
                          ))}
                        </FormGroup>
                        {touched.estates && errors.estates ? (
                          <div style={{ color: 'red' }}>{errors.estates}</div>
                        ) : null}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                <Box display="flex" justifyContent="flex-end" p={2}>
                  <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                  >
                    Add
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
          {(supplierEstateMapping.length > 0) ?
            <PerfectScrollbar>
              <Box minWidth={1050}>
                <TableContainer >
                  <Table className={classes.table} aria-label="caption table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Supplier Name</TableCell>
                        <TableCell>Estate Name</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {supplierEstateMapping.map((rowData, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                            {rowData.supplierName}
                          </TableCell>
                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                            {rowData.estateName}
                          </TableCell>
                          <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                            <DeleteIcon
                              style={{
                                color: "red",
                                cursor: "pointer"
                              }}
                              fontSize="small"
                              onClick={() => handleClickRemove(index)}
                            >
                            </DeleteIcon>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
        </Container>
      </Page>
    </Fragment>
  );
};

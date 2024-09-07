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
import DeleteIcon from '@material-ui/icons/Delete';
import { LoadingComponent } from '../../../../utils/newLoader';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  root1: {
    height: 180,
  },
  container: {
    display: 'flex',
  },
  paper: {
    margin: theme.spacing(1),
    display: 'inline-block',
    backgroundColor: 'white',
    width: 1000
  },
  svg: {
    width: 'fullWidth',
    height: 100,
  },
  polygon: {
    fill: theme.palette.common.white,
    stroke: theme.palette.divider,
    strokeWidth: 1,
  },
  table: {
    minWidth: 150,
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  }
}));

export function EmployeeSupplimentary({ supplimentaryArray, setSupplimentaryArray, supplimentaryBiometricArray, setSupplimentaryBiometricArray
  , setIsMainButtonEnable }) {
  const classes = useStyles();
  const [supplimentary, setSupplimentary] = useState({
    paymentTypeID: '0',
    name: '',
    relationship: '',
    nic: '',

  });

  const alert = useAlert();

  async function saveSupplimentary(values) {
    var supplimentaryDetails = supplimentaryArray;
    supplimentaryDetails.push(
      {
        supplimentaryName: supplimentary.name,
        relationship: values.relationship,
        nic: supplimentary.nic,
        status: 1
      });
    setSupplimentaryArray(supplimentaryDetails);
    setSupplimentary({
      ...supplimentary, name: '', relationship: '', nic: ''
    });
    alert.success("Dependent details added.");
    setIsMainButtonEnable(true);
  }

  function handleChangeForm(e) {
    const target = e.target;
    const value = target.value
    setSupplimentary({
      ...supplimentary,
      [e.target.name]: value
    });
  }

  async function DeleteItem(index) {
    if (supplimentaryArray[index].employeeSupplimentaryID != undefined) {
      const res = await services.DeleteEmployeeSupplimentary(supplimentaryArray[index].employeeSupplimentaryID);
      setSupplimentaryArray(current => current.filter((img, i) => i != index));
      if (res > 0) {
        alert.success('DEPENDENT DETAILS DELETED SUCCESSFULLY');
      }
      else {
        alert.error('Error occured in item delete');
      }
    }
    else {
      for (var i = 0; i < supplimentaryArray.length; i++) {
        setSupplimentary({
          ...supplimentary,
          name: supplimentaryArray[i].name,
          nic: supplimentaryArray[i].nic,
          relationship: supplimentaryArray[i].relationship,
        })
      }
      supplimentaryArray.splice(index, 1);
      setSupplimentary({
        ...supplimentary, name: '', relationship: '', nic: ''
      });
      alert.success('DEPENDENT DETAILS DELETED SUCCESSFULLY');
    }
  }

  function settingNIC(data) {
    return data;
  }
  function settingName(data) {
    return data;
  }
  function settingRelationship(data) {
    return data;
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Employee Dependent Add Edit">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              paymentTypeID: supplimentary.paymentTypeID,
              name: supplimentary.name,
              relationship: supplimentary.relationship,
              nic: supplimentary.nic,
            }}
            validationSchema={
              Yup.object().shape({
                name: Yup.string().max(100, "Name must be at most 100 characters").required('Name is required').matches(/^[aA-zZ\s\.]+$/, "Only alphabets are allowed for this field"),
                nic: Yup.string().matches(/^(\d{9}[V]|\d{12})$/, 'Entered NIC not valid'),
              })
            }
            onSubmit={saveSupplimentary}
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
                <Box mt={3}>
                  <Card className={classes.cardContent}>
                    <CardHeader
                      title="Dependent Details"
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <br></br>
                      <CardContent>
                        <Grid container spacing={3}>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="name">
                              Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.name && errors.name)}
                              fullWidth
                              helperText={touched.name && errors.name}
                              size='small'
                              name="name"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForm(e)}
                              value={supplimentary.name}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="nic">
                              NIC
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.nic && errors.nic)}
                              fullWidth
                              helperText={touched.nic && errors.nic}
                              size='small'
                              name="nic"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForm(e)}
                              value={supplimentary.nic}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="relationship">
                              Relationship
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.relationship && errors.relationship)}
                              fullWidth
                              helperText={touched.relationship && errors.relationship}
                              size='small'
                              name="relationship"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForm(e)}
                              value={supplimentary.relationship}
                              variant="outlined"
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
                      <Divider />
                      <CardContent>
                        <Grid item md={4} xs={12}>
                          <Grid className={classes.container}>
                            <Collapse in={true}>
                              <Paper elevation={0} className={classes.paper}>
                                <Grid container spacing={2}>
                                  {(supplimentaryArray.length > 0) ?
                                    <Grid item xs={12}>
                                      <TableContainer >
                                        <Table className={classes.table} aria-label="caption table">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>Name</TableCell>
                                              <TableCell>NIC</TableCell>
                                              <TableCell>Relationship</TableCell>
                                              <TableCell>Remove</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {supplimentaryArray.map((rowData, index) => (
                                              <TableRow key={index}>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {settingName(rowData.supplimentaryName)}
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {settingNIC(rowData.nic)}
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {settingRelationship(rowData.relationship)}
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  <DeleteIcon
                                                    style={{
                                                      color: "red",
                                                      marginBottom: "-1rem",
                                                      marginTop: "0rem",
                                                      cursor: "pointer"
                                                    }}
                                                    size="small"
                                                    onClick={() => DeleteItem(index)}
                                                  >
                                                  </DeleteIcon>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    </Grid>
                                    : null}
                                </Grid>
                              </Paper>
                            </Collapse>
                          </Grid>
                        </Grid>
                      </CardContent>
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

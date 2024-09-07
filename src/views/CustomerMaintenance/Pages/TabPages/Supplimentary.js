import React, { useState, Fragment } from 'react';
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
import MenuItem from '@material-ui/core/MenuItem';
import DeleteIcon from '@material-ui/icons/Delete';
import { LoadingComponent } from '../../../../utils/newLoader';
import ImageUploader from "react-images-upload";
import ImageSearchIcon from '@material-ui/icons/ImageSearch';

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

export function CustomerSupplimentary({ supplimentaryArray, setSupplimentaryArray, supplimentaryBiometricArray, setSupplimentaryBiometricArray
  , setIsMainButtonEnable }) {
  const classes = useStyles();
  const [supplimentary, setSupplimentary] = useState({
    paymentTypeID: '0',
    name: '',
    pin: '',
    nic: '',

  });

  const [imagePreView, setImagePreView] = useState(true);
  const [pictures, setPictures] = useState();
  const alert = useAlert();

  async function saveSupplimentary(values) {
    var supplimentaryDetails = supplimentaryArray;
    var supplimenataryBiometricDetails = supplimentaryBiometricArray;
    supplimentaryDetails.push({ paymentTypeID: supplimentary.paymentTypeID, supplimentaryName: supplimentary.name, pin: values.pin, nic: supplimentary.nic, pictures: pictures });
    setSupplimentaryArray(supplimentaryDetails);
    supplimenataryBiometricDetails.push({ supplimentaryBiometricData: pictures });
    setSupplimentaryBiometricArray(supplimenataryBiometricDetails);
    setSupplimentary({
      ...supplimentary, paymentTypeID: '0', name: '', pin: '', nic: ''
    });
    setPictures(null);
    setImagePreView(false);
    setIsMainButtonEnable(true);
    alert.success("Dependent details added.");
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setSupplimentary({
      ...supplimentary,
      [e.target.name]: value
    });
  }

  async function DeleteItem(index) {
    if (supplimentaryBiometricArray[index].customerSupplimentaryBiometricID != undefined) {
      const res = await services.DeleteSupplierBiometricItem(supplimentaryBiometricArray[index].customerSupplimentaryBiometricID);
      setSupplimentaryBiometricArray(current => current.filter((img, i) => i != index));
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
          paymentTypeID: supplimentaryArray[i].paymentTypeID,
          name: supplimentaryArray[i].name,
          nic: supplimentaryArray[i].nic,
          pin: supplimentaryArray[i].pin,
        })

      }
      supplimentaryArray.splice(index, 1);
      setSupplimentary({
        ...supplimentary, paymentTypeID: '0', name: '', pin: '', nic: ''
      });
      setPictures(null);
      setImagePreView(false);
      alert.success('DEPENDENT DETAILS DELETED SUCCESSFULLY');
    }
  }

  function onDrop(picture, pictureDataURLs) {

    if (pictureDataURLs[0] !== undefined) {

      var convertedString = pictureDataURLs[0];
      var fields = convertedString.split(",");
      var name = fields[0];
      setPictures(...pictureDataURLs);
    }
  }

  function settingPicture(data) {
    if (data != null) {
      return <img src={data} width="100" height="150" />;
    }
    else {
      return (
        <ImageSearchIcon
          style={{
            color: "blue",
            marginBottom: "-1rem",
            marginTop: "0rem"
          }}
          size="small"
        />
      );
    }
  }
  function settingNIC(data) {
    return data;
  }
  function settingName(data) {
    return data;
  }
  function settingPaymentType(data) {
    if (data == 6) {
      return 'Balance';
    }
    else if (data == 2) {
      return 'Advance';
    }
    else {
      return 'FactoryItem';
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Supplimenatry Add Edit">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              paymentTypeID: supplimentary.paymentTypeID,
              name: supplimentary.name,
              pin: supplimentary.pin,
              nic: supplimentary.nic,

            }}
            validationSchema={
              Yup.object().shape({
                paymentTypeID: Yup.number().max(255).required('payment type is required').min("1", 'payment type is required'),
                name: Yup.string().max(100, "Name must be at most 100 characters").required('Name is required').matches(/^[aA-zZ\s\.]+$/, "Only alphabets are allowed for this field"),
                nic: Yup.string().required('NIC is required').matches(/^([0-9]{9}V|[0-9]{12})?$/, 'Entered NIC not valid'),
                pin: Yup.string().max(4, 'Allow only 4 digits').required('PIN is required'),
              })
            }
            onSubmit={saveSupplimentary}
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
              <form onSubmit={handleSubmit}>
                <Box mt={3}>
                  <Card className={classes.cardContent}>
                    <CardHeader
                      title="Dependent Details"
                    />

                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="paymentTypeID">
                              Transaction Type *
                            </InputLabel>
                            <TextField select fullWidth
                              error={Boolean(touched.paymentTypeID && errors.paymentTypeID)}
                              helperText={touched.paymentTypeID && errors.paymentTypeID}
                              size='small'
                              onBlur={handleBlur}
                              id="paymentTypeID"
                              name="paymentTypeID"
                              value={supplimentary.paymentTypeID}
                              type="text"
                              variant="outlined"
                              onChange={(e) => handleChange1(e)}>
                              <MenuItem value="0">--Select Transaction Type--</MenuItem>
                              <MenuItem value="6">Balance</MenuItem>
                              <MenuItem value="2">Advance</MenuItem>
                              <MenuItem value="3">Factory Item</MenuItem>
                            </TextField>
                          </Grid>
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
                              onChange={(e) => handleChange1(e)}
                              value={supplimentary.name}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="nic">
                              NIC *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.nic && errors.nic)}
                              fullWidth
                              helperText={touched.nic && errors.nic}
                              size='small'
                              name="nic"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={supplimentary.nic}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="pin">
                              PIN *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.pin && errors.pin)}
                              fullWidth
                              helperText={touched.pin && errors.pin}
                              size='small'
                              name="pin"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={supplimentary.pin}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <InputLabel shrink id="nic">
                              Image
                            </InputLabel>
                            <ImageUploader
                              withIcon={true}
                              singleImage={true}
                              withPreview={imagePreView}
                              buttonText="Choose images"
                              onChange={onDrop}
                              imgExtension={[".jpg", ".png", ".jpeg"]}
                              maxFileSize={5242880}
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
                                              <TableCell>Transaction Type</TableCell>
                                              <TableCell>Name</TableCell>
                                              <TableCell>NIC</TableCell>
                                              <TableCell>Image</TableCell>
                                              <TableCell>Remove</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {supplimentaryArray.map((rowData, index) => (
                                              <TableRow key={index}>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {settingPaymentType(rowData.paymentTypeID)}
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {settingName(rowData.supplimentaryName)}
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {settingNIC(rowData.nic)}
                                                </TableCell>
                                                <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {settingPicture(rowData.pictures)}
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

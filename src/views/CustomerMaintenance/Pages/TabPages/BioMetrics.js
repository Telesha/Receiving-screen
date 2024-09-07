import React, { useState, useEffect } from 'react';
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
  Switch,
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
import { trackPromise } from 'react-promise-tracker';
import ImageUploader from "react-images-upload";
import DeleteIcon from '@material-ui/icons/Delete';
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

export function CustomerBoimetric({ cusBiometricArray, setCusBiometricArray, setIsMainButtonEnable}) {
  const classes = useStyles();
  const [btnDisable, setBtnDisable] = useState(false);
  const [cusBio, setCusBio] = useState({
    isDefault: true,
  });
  const alert = useAlert();
  const [imagePreView, setImagePreView] = useState(true);
  const [pictures, setPictures] = useState();
  const [enablebtn, setEnablebtn] = useState(false);
  const Compress = require("compress.js");
  const compress = new Compress();

  useEffect(() => {
    trackPromise(
      setGeneralValues());
  }, []);

  useEffect(() => {
    trackPromise(
      setDefaultValues()
    );
  }, [cusBio.isDefault]);

  async function refreshValues() {
    setCusBiometricArray([...cusBiometricArray]);
  }

  async function setDefaultValues() {
    setCusBio({ ...cusBio, isDefault: cusBio.isDefault });
  }

  async function setGeneralValues() {
    setCusBio({
      ...cusBio,
      isDefault: cusBiometricArray.isDefault
    })
    if (cusBiometricArray.length > 0) {
      setEnablebtn(true);
    }
    else {
      setEnablebtn(false);
    }
  }

  async function saveBiometric(values) {
    var sampleBio = cusBiometricArray;
    if (pictures === null || pictures === undefined) {
      alert.error("Please select a photo.");
    } else if (sampleBio.length >= 2) {
      alert.error("Cannot select more than 2 photos.");
    } else {
      sampleBio.push({ customerBiometricData: pictures, isDefault: sampleBio.length > 0 ? false : cusBio.isDefault });
      setCusBiometricArray(sampleBio);
      setPictures(null);
      setImagePreView(false);
      setIsMainButtonEnable(true);
      alert.success("Biometric details added.");
    }
  }

  function onDrop(picture, pictureDataURLs) {
    if (pictureDataURLs[0] !== undefined) {
      setImagePreView(true);
      var convertedString = pictureDataURLs[0];
      var fields = convertedString.split(",");
      var name = fields[0];
      compress.compress(picture, {
        size: 4,
        quality: 0.25,
        maxWidth: 250,
        maxHeight: 250,
        resize: true,
      })
        .then((data) => {
          setPictures(name + "," + data[0].data);
      });
    }
  }
  
  function settingPicture(data) {
    if (data != null || data != undefined) {
      return <img src={data} width="120" height="150" />;
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

  async function DeleteItem(index) {
    if (cusBiometricArray[index].customerBiometricID != undefined) {
      const res = await services.DeleteBiometricItem(cusBiometricArray[index].customerBiometricID);
      setCusBiometricArray(current => current.filter((img, i) => i != index));
      if (res > 0) {
        alert.success('BIOMETRIC DETAILS DELETED SUCCESSFULLY');

      } else {
        alert.error('Error occured in item delete');
      }
    }
    else {
      for (var i = 0; i < cusBiometricArray.length; i++) {
        setCusBio({
          ...cusBio,
          isDefault: cusBiometricArray[i].isDefault
        })
      }
      cusBiometricArray.splice(index, 1);
      alert.success('BIOMETRIC DETAILS DELETED SUCCESSFULLY');
    }
  }

  function handleChangeDefaultButton(e, index, rowData) {
    const target = e.target
    const value = target.name === 'isDefault' ? target.checked : target.value;
    var copyCustomerBioArray = cusBiometricArray;
    cusBiometricArray.filter((x, i) => { i === index ? x.isDefault = value : x.isDefault = x.isDefault });

    cusBiometricArray.forEach((s, i) => {
      if (index !== i) {
        s.isDefault = false;
      }
      else {
        s.isDefault = true;
      }
    });
    setIsMainButtonEnable(true);
    setCusBiometricArray(copyCustomerBioArray);
    refreshValues();
  }

  return (
    <Page className={classes.root} title="General Details Add Edit">
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            isDefault: cusBiometricArray.isDefault
          }}
          validationSchema={
            Yup.object().shape({

            })
          }
          onSubmit={saveBiometric}
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
                <Card className={classes.cardContent}>
                  <CardHeader
                    title="Biometric Details"
                  />

                  <PerfectScrollbar>
                    <Divider />
                    <CardContent>
                      <Grid container alignItems="center" justify="center">
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
                    </CardContent>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        disabled={btnDisable || (pictures === null || pictures === undefined)?true: false}
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
                                {(cusBiometricArray.length > 0) ?
                                  <Grid item xs={12}>

                                    <TableContainer >
                                      <Table className={classes.table} aria-label="caption table">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Picture</TableCell>
                                            <TableCell>Remove</TableCell>
                                            <TableCell>Default</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {cusBiometricArray.map((rowData, index) => (
                                            <TableRow key={index}>
                                              <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                {settingPicture(rowData.customerBiometricData)}
                                              </TableCell>
                                              <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                <DeleteIcon
                                                  style={{
                                                    color: "red",
                                                    marginBottom: "-1rem",
                                                    marginTop: "0rem"
                                                  }}
                                                  size="small"
                                                  onClick={() => DeleteItem(index)}
                                                >
                                                </DeleteIcon>
                                              </TableCell>
                                              <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                                <Switch
                                                  checked={rowData.isDefault}
                                                  onChange={(e) => handleChangeDefaultButton(e, index, rowData)}
                                                  name="isDefault"
                                                />
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
  );
};

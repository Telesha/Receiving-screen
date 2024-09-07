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
  CardHeader,
  Tabs,
  Tab,
  AppBar,
  Switch,
  InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { TabPanel } from './tabPanel';
import { CustomerGeneral } from '../Pages/TabPages/General';
import { CustomerCropBook } from './TabPages/CropBooks';
import { CustomerBoimetric } from './TabPages/BioMetrics';
import { CustomerSupplimentary } from './TabPages/Supplimentary';
import { CustomerStandingOrdersFunds } from './TabPages/StandingOrdersFunds';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../utils/newLoader';
import { AlertDialogWithoutButton } from '../../Common/AlertDialogWithoutButton';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  root1: {
    flexGrow: 4
  },
}));

export default function CustomerAddEdit() {
  const [title, setTitle] = useState("Add Customer")
  const classes = useStyles();
  const [cusGeneralArray, setCusGeneralArray] = useState([]);
  const [cropBookArray, setCropBookArray] = useState([]);
  const [paymentMethodArray, setPaymentMethodArray] = useState([]);
  const [cusBiometricArray, setCusBiometricArray] = useState([]);
  const [supplimentaryArray, setSupplimentaryArray] = useState([]);
  const [supplimentaryBiometricArray, setSupplimentaryBiometricArray] = useState([]);
  const [standingOrdersArray, setStandingOrdersArray] = useState([]);
  const [standingFundsArray, setStandingFundsArray] = useState([]);
  const [onChangefactoryID, setFactoryID] = useState(0);
  const [isFormValid, setIsFormValid] = useState(0);
  const [isMainButtonEnable, setIsMainButtonEnable] = useState(false);
  const [customerIsActive, setCustomerIsActive] = useState(true);
  const [SavingsArray, setSavingsArray] = useState([]);
  const [dialog, setDialog] = useState(false);

  const navigate = useNavigate();

  const alert = useAlert();
  const [value, setValue] = React.useState(0);
  const [btnDisable, setBtnDisable] = useState(false);
  const { customerID } = useParams();
  const [isUpdate, setIsUpdate] = useState(false);
  let decryptedID = 0;
  const [initialCustomer, setInitialCustomer] = useState(true);

  useEffect(() => {
    decryptedID = atob(customerID.toString());
    if (decryptedID != 0) {
      trackPromise(getCustomerGeneralDetailsByCustomerID(decryptedID));
      trackPromise(getCustomerCropBooksByCustomerID(decryptedID));
      trackPromise(getCustomerBoimetricByCustomerID(decryptedID));
      trackPromise(getsupplierDetailsByCustomerID(decryptedID));
      trackPromise(getStandingFundsByCustomerID(decryptedID));
      trackPromise(getStandingOrdersByCustomerID(decryptedID));
      trackPromise(getSavingsByCustomerID(decryptedID));
    }
  }, []);

  useEffect(() => {
    if (isMainButtonEnable && cropBookArray.length > 0) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }

  }, [cropBookArray, isMainButtonEnable]);

  async function getStandingFundsByCustomerID(customerID) {
    let response = await services.getStandingFundsByCustomerID(customerID);
    setStandingFundsArray(response);
  }

  async function getStandingOrdersByCustomerID(customerID) {
    let response = await services.getStandingOrdersByCustomerID(customerID);
    setStandingOrdersArray(response);
  }

  async function getSavingsByCustomerID(customerID) {
    let response = await services.getSavingsByCustomerID(customerID);
    setSavingsArray(response);
  }

  async function getsupplierDetailsByCustomerID(customerID) {
    let responseSup = await services.getsupplierDetailsByCustomerID(customerID);
    for (var i = 0; i < responseSup.length; i++) {
      var newSupplimenatry = supplimentaryArray;
      var newSupplimenatryBio = supplimentaryBiometricArray;
      newSupplimenatry.push({
        paymentTypeID: responseSup[i].paymentTypeID.toString(), supplimentaryName: responseSup[i].supplimentaryName,
        nic: responseSup[i].nic, pictures: responseSup[i].supplimentaryBiometricData === null ? null : 'data:image/jpg;base64,' + responseSup[i].supplimentaryBiometricData, pin: responseSup[i].pin,
        customerSupplimentaryID: responseSup[i].customerSupplimentaryID
      });
      newSupplimenatryBio.push({ customerSupplimentaryBiometricID: responseSup[i].customerSupplimentaryBiometricID });
      setSupplimentaryArray(newSupplimenatry);
      setSupplimentaryBiometricArray(newSupplimenatryBio);
    }
  }

  async function getCustomerBoimetricByCustomerID(customerID) {
    let pictures = await services.getCustomerBoimetricByCustomerID(customerID);
    for (var i = 0; i < pictures.length; i++) {
      var newBioArray = cusBiometricArray;
      newBioArray.push({ customerBiometricData: pictures[i].customerBiometricData === null ? null : 'data:image/jpg;base64,' + pictures[i].customerBiometricData, customerBiometricID: pictures[i].customerBiometricID, isDefault: pictures[i].isDefault });
      setCusBiometricArray(newBioArray);
    }
  }

  async function getCustomerGeneralDetailsByCustomerID(customerID) {
    let response = await services.getCustomerGeneralDetailsByCustomerID(customerID);
    setTitle("Edit Customer Maintenance");
    let general = {
      customerCode: response[0].customerCode,
      title: response[0].title,
      firstName: response[0].firstName,
      middleName: response[0].middleName,
      lastName: response[0].lastName,
      gender: response[0].gender,
      dob: response[0].dob === null ? '' : response[0].dob.split('T')[0],
      nic: response[0].nic,
      address: response[0].address,
      addresstwo: response[0].addresstwo,
      addressthree: response[0].addressthree,
      mobile: response[0].mobile,
      home: response[0].home,
      groupID: response[0].groupID,
      factoryID: response[0].factoryID,
      routeID: response[0].routeID,
      customerID: response[0].customerID,
      joiningDate: response[0].joiningDate === null ? '' : response[0].joiningDate.split('T')[0],
      areaType: response[0].areaType === null ? '0' : response[0].areaType,
      area: response[0].area
    }

    var isActiveResult = response[0].isActive === null ? false : response[0].isActive;
    setCustomerIsActive(isActiveResult);

    setCusGeneralArray(general);
    setIsUpdate(true);
    setInitialCustomer(response[0].isActive)
    setValue(1);
    setValue(0);
  }
  async function getCustomerCropBooksByCustomerID(customerID) {
    let responseCrop = await services.getCustomerCropBooksByCustomerID(customerID);
    for (var i = 0; i < responseCrop.length; i++) {
      var newCropBookArray = cropBookArray;
      newCropBookArray.push(responseCrop[i]);
      setCropBookArray(newCropBookArray);
    }
  }

  function onIsActiveChange() {
    setCustomerIsActive(!customerIsActive);
    setIsMainButtonEnable(true);
  }

  async function saveCustomer() {
    if (cusGeneralArray.length <= 0 || cropBookArray.length <= 0) {
      alert.error('Please fill before save');
    } else {

      if (!isUpdate) {

        cusGeneralArray.isActive = customerIsActive;

        let saveModel = {
          customerGeneralArray: cusGeneralArray,
          cropBookArray: cropBookArray,
          paymentMethodArray: paymentMethodArray,
          customerBiometricArray: cusBiometricArray.length === 0 ? null : cusBiometricArray,
          supplimentaryArray: supplimentaryArray,
          supplimentaryBiometricArray: supplimentaryBiometricArray,
          standingFundsArray: standingFundsArray,
          standingOrdersArray: standingOrdersArray,
          SavingsArray: SavingsArray
        }

        let response = await services.saveCustomer(saveModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          setBtnDisable(true);
          navigate('/app/customers/listing');
        }
        else {
          alert.error(response.message);
        }
      } else {

        cusGeneralArray.isActive = customerIsActive;

        let updateModel = {
          customerID: atob(customerID.toString()),
          customerGeneralArray: cusGeneralArray,
          cropBookArray: cropBookArray,
          paymentMethodArray: paymentMethodArray,
          customerBiometricArray: cusBiometricArray,
          supplimentaryArray: supplimentaryArray,
          supplimentaryBiometricArray: supplimentaryBiometricArray,
          standingFundsArray: standingFundsArray,
          standingOrdersArray: standingOrdersArray,
          SavingsArray: SavingsArray
        }

        let response = await services.updateCustomer(updateModel);

        if (response.statusCode == "Success") {
          alert.success(response.message);
          setBtnDisable(true);
          navigate('/app/customers/listing');
        }
        else {
          setCustomerIsActive({
            ...customerIsActive,
            isActiveResult: initialCustomer
          })
          alert.error(response.message);
        }
      }
    }
  }
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  function handleClick() {

    if (isUpdate == false) {
      if (cusGeneralArray.length != 0) {
        setDialog(true);
      } else {
        navigate('/app/customers/listing');
      }
    } else {
      navigate('/app/customers/listing');
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
            onClick={() => handleClick()}
          />
        </Grid>
      </Grid>
    )
  }

  async function confirmRequest() {
    navigate('/app/customers/listing');
  }

  async function cancelRequest() {
    setDialog(false);

  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              isActive: customerIsActive,
            }}
            validationSchema={
              Yup.object().shape({
                isActive: Yup.boolean().required('Is default required'),
              })
            }
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              setFieldValue,
              touched,
              values
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
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid className={classes.root1} item xs={12}>
                            <AppBar position="static">
                              <Tabs value={value} onChange={handleTabChange} variant={'fullWidth'} classes={{ indicator: classes.indicator }}
                                aria-label="simple tabs example" style={{ backgroundColor: "white" }}>
                                <Tab label="General" {...a11yProps(0)} style={{ color: "black" }} />
                                <Tab label="Customer Accounts" {...a11yProps(1)} style={{ color: "black" }} />
                                <Tab label="Biometrics" {...a11yProps(2)} style={{ color: "black" }} />
                                <Tab label="Dependent" {...a11yProps(3)} style={{ color: "black" }} />
                                <Tab label="Saving & Funds" {...a11yProps(4)} style={{ color: "black" }} />
                              </Tabs>
                            </AppBar>
                            <TabPanel value={value} index={0} >
                              <CustomerGeneral cusGeneralArray={cusGeneralArray} setCusGeneralArray={setCusGeneralArray} setFactoryID={setFactoryID}
                                setIsMainButtonEnable={setIsMainButtonEnable} />
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                              <CustomerCropBook cropBookArray={cropBookArray} setCropBookArray={setCropBookArray} cusGeneralArray={cusGeneralArray}
                                standingOrdersArray={standingOrdersArray} setStandingOrdersArray={setStandingOrdersArray}
                                standingFundsArray={standingFundsArray} setStandingFundsArray={setStandingFundsArray}
                                setIsMainButtonEnable={setIsMainButtonEnable} />
                            </TabPanel>
                            <TabPanel value={value} index={2}>
                              <CustomerBoimetric cusBiometricArray={cusBiometricArray} setCusBiometricArray={setCusBiometricArray}
                                setIsMainButtonEnable={setIsMainButtonEnable} />
                            </TabPanel>
                            <TabPanel value={value} index={3}>
                              <CustomerSupplimentary supplimentaryArray={supplimentaryArray} setSupplimentaryArray={setSupplimentaryArray} supplimentaryBiometricArray={supplimentaryBiometricArray}
                                setSupplimentaryBiometricArray={setSupplimentaryBiometricArray} setIsMainButtonEnable={setIsMainButtonEnable} />
                            </TabPanel>
                            <TabPanel value={value} index={4}>
                              <CustomerStandingOrdersFunds standingOrdersArray={standingOrdersArray} setStandingOrdersArray={setStandingOrdersArray}
                                standingFundsArray={standingFundsArray} setStandingFundsArray={setStandingFundsArray} cropBookArray={cropBookArray} onChangefactoryID={onChangefactoryID}
                                setSavingsArray={setSavingsArray}
                                SavingsArray={SavingsArray}
                                setIsFormValid={setIsFormValid} setIsMainButtonEnable={setIsMainButtonEnable} />
                            </TabPanel>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Grid container spacing={0} >
                        <Grid item md={1} xs={12} style={{ marginLeft: '5rem' }}>
                          <InputLabel id="isActive">
                            Active
                          </InputLabel>
                          <Switch
                            error={Boolean(touched.isActive && errors.isActive)}
                            helperText={touched.isActive && errors.isActive}
                            checked={customerIsActive}
                            onBlur={handleBlur}
                            onChange={onIsActiveChange}
                            name="isActive"
                          />
                        </Grid>
                      </Grid>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={(isUpdate ? false : (btnDisable)) || !isFormValid}
                          type="submit"
                          variant="contained"
                          onClick={() => trackPromise(saveCustomer())}
                          style={{ marginTop: '-2rem', marginBottom: '2rem', marginRight: '3rem' }}
                        >
                          {isUpdate ? "Update" : "Save"}
                        </Button>
                      </Box>

                    </PerfectScrollbar>
                  </Card>
                </Box>
                {dialog ?
                  <AlertDialogWithoutButton confirmData={confirmRequest} cancelData={cancelRequest}
                    headerMessage={"Customer Maintenance"}
                    discription={"Added customer details will be not save, Are you sure you want to leave?"} />
                  : null
                }
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
};

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
  InputLabel,
  TextField,

} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { TabPanel } from './tabPanel';
import { EmployeeGeneral } from '../Pages/TabPages/General';
import { EmployeePayments } from './TabPages/PaymentMethods';
import { EmployeeBoimetric } from './TabPages/BioMetrics';
import { EmployeeReimbursement } from './TabPages/Reimbursement';
import { EmployeeSupplimentary } from './TabPages/Supplimentary';
import { EmployeeStandingOrdersFunds } from './TabPages/StandingOrdersFunds';
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

export default function EmployeeAddEdit() {
  const [title, setTitle] = useState("Add Employee")
  const classes = useStyles();
  const [empGeneralArray, setEmpGeneralArray] = useState([]);
  const [paymentMethodArray, setPaymentMethodArray] = useState([]);
  const [empBiometricArray, setempBiometricArray] = useState([]);
  const [supplimentaryArray, setSupplimentaryArray] = useState([]);
  const [standingOrdersArray, setStandingOrdersArray] = useState([]);
  const [standingFundsArray, setStandingFundsArray] = useState([]);
  const [onChangefactoryID, setFactoryID] = useState(0);
  const [designationID, setDesignationID] = useState(0);
  const [category, setCategory] = useState(0);
  const [estateID, setEstateID] = useState(0);
  const [isFormValid, setIsFormValid] = useState(0);
  const [isMainButtonEnable, setIsMainButtonEnable] = useState(false);
  const [employeeIsActive, setEmployeeIsActive] = useState(true);
  const navigate = useNavigate();
  const alert = useAlert();
  const [value, setValue] = React.useState(0);
  const [btnDisable, setBtnDisable] = useState(false);
  const { employeeID } = useParams();
  const [isUpdate, setIsUpdate] = useState(false);
  let decryptedID = 0;
  const [initialCustomer, setInitialCustomer] = useState(true);
  const [decryptedIDForUpdate, setDecryptedIDForUpdate] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [basicSalary, setBasicSalary] = useState('');
  const [employeeWiseBasicSalaryID, setEmployeeWiseBasicSalaryID] = useState(0);
  const [designationName, setDesignationName] = useState('');
  const [allowancesTypeList, setAllowancesTypeList] = useState([]);
  const [joiningDateForGrativity, setJoiningDateForGrativity] = useState('');
  const [isGrativityVisible, setIsGrativityVisible] = useState(false);
  const [grativityBalance, setGrativityBalance] = useState(0);

  useEffect(() => {
    if (isMainButtonEnable && paymentMethodArray.length > 0) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }

  }, [paymentMethodArray, isMainButtonEnable]);

  useEffect(() => {
    decryptedID = atob(employeeID.toString());
    if (decryptedID != 0) {
      trackPromise(getEmployeeGeneralDetailsByEmployeeID(decryptedID));
      trackPromise(getEmployeePaymentDetailsByEmployeeID(decryptedID));
      setDecryptedIDForUpdate(decryptedID);
      trackPromise(getEmployeeBioMetricsDetailsByEmployeeID(decryptedID));
    }
  }, []);

  useEffect(() => {
    getEmployeeReimbursementDetailsByEmployeeID(decryptedID)
  }, [designationID]);

  useEffect(() => {
    if (isUpdate) {
      grativityCalculator();
    }
  }, [employeeIsActive]);

  async function getEmployeeGeneralDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeGeneralDetailsByEmployeeID(employeeID);
    setTitle("Edit Employee Details");
    let general = {
      employeeCode: response[0].employeeCode,
      titleID: response[0].titleID,
      firstName: response[0].firstName,
      secondName: response[0].secondName,
      lastName: response[0].lastName,
      genderID: response[0].genderID,
      dob: response[0].dateOfBirth.split('T')[0],
      nICNumber: response[0].nicNumber,
      address: response[0].address1,
      addresstwo: response[0].address2,
      addressthree: response[0].address3,
      mobileNumber: response[0].mobileNumber,
      homeNumber: response[0].homeNumber,
      groupID: response[0].groupID,
      factoryID: response[0].operationEntityID,
      isEPFEnable: response[0].isEPFEnable,
      epfNumber: response[0].epfNumber,
      employeeID: response[0].employeeID,
      joiningDate: response[0].joiningDate === null ? '' : response[0].joiningDate.split('T')[0],
      areaType: response[0].areaType === null ? '0' : response[0].areaType,
      area: response[0].area,
      basicDailySalary: response[0].basicDailySalary,
      basicMonthlySalary: response[0].basicMonthlySalary,
      city: response[0].city,
      designationID: response[0].designationID,
      employeeCategoryID: response[0].employeeCategoryID,
      employeeSubCategoryID: response[0].employeeSubCategoryID,
      employeeTypeID: response[0].employeeTypeID,
      otherAllowance: response[0].otherAllowance,
      specialAllowance: response[0].specialAllowance,
      registrationNumber: response[0].registrationNumber,
      email: response[0].email,
      religion: response[0].religion,
      raise: response[0].raise,
      employeeDivisionID: response[0].employeeDivisionID,
      isBCardStatus: response[0].isBCardStatus,
      unionID: response[0].unionID,
      espsRate: response[0].espsRate
    }

    var isActiveResult = response[0].isActive === null ? false : response[0].isActive;
    setEmployeeIsActive(isActiveResult);
    setDesignationID(general.designationID)
    setCategory(general.employeeCategoryID)
    setEmpGeneralArray(general);
    setIsUpdate(true);
    setEstateID(general.factoryID)
    setInitialCustomer(response[0].isActive)
    setValue(1);
    setValue(0);
    setJoiningDateForGrativity(response[0].joiningDate.split('T')[0]);
  }

  async function getEmployeePaymentDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeePaymentDetailsByEmployeeID(employeeID);
    setPaymentMethodArray(response);
  }

  async function getEmployeeSupplimentaryDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeSupplimentaryDetailsByEmployeeID(employeeID);
    setSupplimentaryArray(response);
  }

  async function getEmployeeStandingOrderDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeStandingOrderDetailsByEmployeeID(employeeID);
    setStandingOrdersArray(response)
  }

  async function getEmployeeFundsDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeFundsDetailsByEmployeeID(employeeID);
    setStandingFundsArray(response)
  }

  async function getEmployeeReimbursementDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeReimbursementDetailsByEmployeeID(employeeID);
    setAllowancesTypeList(response.employeeWiseAllowanceTypeModels === null ? [] : response.employeeWiseAllowanceTypeModels);
    setBasicSalary(response.basicSalary == 0 ? '' : response.basicSalary)
    setEmployeeWiseBasicSalaryID(response.employeeWiseBasicSalaryID == null ? 0 : response.employeeWiseBasicSalaryID)
    setDesignationName(response.designationName == null ? '' : response.designationName)
  }

  async function getEmployeeBioMetricsDetailsByEmployeeID(employeeID) {
    let response = await services.getEmployeeBioMetricsDetailsByEmployeeID(employeeID);
    for (var i = 0; i < response.length; i++) {
      var newBioArray = empBiometricArray;
      newBioArray.push({
        employeeBiometricData: response[i].employeeBiometricData === null ? null : 'data:image/jpg;base64,' +
          response[i].employeeBiometricData,
        employeeBiometricID: response[i].employeeBiometricID,
        isDefault: response[i].isDefault
      });
      setempBiometricArray(newBioArray);
    }
  }

  function onIsActiveChange() {
    setEmployeeIsActive(!employeeIsActive);
    setIsMainButtonEnable(true);
  }

  async function grativityCalculator() {
    const response = await services.getEmployeeBasicSalaryByDesignationID(designationID, estateID);
    let basic = parseFloat(response.basicSalary);
    let joinedYear = new Date(joiningDateForGrativity).getFullYear();
    let timeYears = (new Date().getFullYear() - joinedYear);
    var grativity = 0;
    if (timeYears >= 5) {
      grativity = parseFloat((basic * (parseFloat(timeYears) / 2)).toFixed(2));
      setIsGrativityVisible(true);
    } else {
      grativity = 0;
      setIsGrativityVisible(false);
    }
    setGrativityBalance(grativity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }

  async function saveEmployee() {
    if (empGeneralArray.length <= 0 || paymentMethodArray.length <= 0) {
      alert.error('Please fill before save');
    }
    else {
      if (!isUpdate) {
        empGeneralArray.isActive = employeeIsActive;
        let reimbursementArrayModel = {
          basicSalary: basicSalary,
          designationID: designationID,
          allowancesTypeList: allowancesTypeList
        }

        let saveModel = {
          employeeGeneralArray: empGeneralArray,
          paymentMethodArray: paymentMethodArray,
          employeeBiometricArray: empBiometricArray.length === 0 ? null : empBiometricArray,
          supplimentaryArray: supplimentaryArray,
          standingFundsArray: standingFundsArray,
          standingOrdersArray: standingOrdersArray,
          reimbursementArray: reimbursementArrayModel
        }
        let response = await services.saveEmployee(saveModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          setBtnDisable(true);
          navigate('/app/EmployeeRegistration/listing');
        }
        else {
          alert.error(response.message);
        }
      } else {
        empGeneralArray.isActive = employeeIsActive;
        let reimbursementArrayUpdateModel = {
          basicSalary: basicSalary,
          designationID: designationID,
          employeeWiseBasicSalaryID: employeeWiseBasicSalaryID,
          allowancesTypeList: allowancesTypeList
        }
        let updateModel = {
          employeeID: atob(employeeID.toString()),
          employeeGeneralArray: empGeneralArray,
          paymentMethodArray: paymentMethodArray,
          employeeBiometricArray: empBiometricArray,
          supplimentaryArray: supplimentaryArray,
          standingFundsArray: standingFundsArray,
          standingOrdersArray: standingOrdersArray,
          reimbursementArray: basicSalary == "" ? null : reimbursementArrayUpdateModel
        }

        let response = await services.updateEmployee(updateModel);

        if (response.statusCode == "Success") {
          alert.success(response.message);
          setBtnDisable(true);
          navigate('/app/EmployeeRegistration/listing');
        }
        else {
          setEmployeeIsActive({
            ...employeeIsActive,
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
      if (empGeneralArray.length != 0) {
        setDialog(true);
      } else {
        navigate('/app/EmployeeRegistration/listing');
      }
    } else {
      navigate('/app/EmployeeRegistration/listing');
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

  function supplimentaryTabClick() {
    if (isUpdate) {
      trackPromise(getEmployeeSupplimentaryDetailsByEmployeeID(decryptedIDForUpdate));
    }
  }

  function EmployeeStandingOrdersFundsTabClick() {
    trackPromise(getEmployeeStandingOrderDetailsByEmployeeID(decryptedIDForUpdate));
    trackPromise(getEmployeeFundsDetailsByEmployeeID(decryptedIDForUpdate));
  }

  async function confirmRequest() {
    navigate('/app/EmployeeRegistration/listing');
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
              isActive: employeeIsActive,
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
              handleSubmit,
              touched,
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
                                <Tab label="Payment Methods" {...a11yProps(1)} style={{ color: "black" }} />
                                <Tab label="Reimbursement" {...a11yProps(2)} style={{ color: "black" }} disabled={category == 1 ? false : true} />
                                <Tab label="Biometrics" {...a11yProps(3)} style={{ color: "black" }} />
                                <Tab label="Dependent" {...a11yProps(4)} style={{ color: "black" }} onClick={() => supplimentaryTabClick()} />
                                <Tab label="Saving & Funds" {...a11yProps(5)} style={{ color: "black" }} onClick={() => EmployeeStandingOrdersFundsTabClick()} />
                              </Tabs>
                            </AppBar>
                            <TabPanel value={value} index={0} >
                              <EmployeeGeneral empGeneralArray={empGeneralArray} setEmpGeneralArray={setEmpGeneralArray} setFactoryID={setFactoryID}
                                setIsMainButtonEnable={setIsMainButtonEnable} setDesignationID={setDesignationID} setEstateID={setEstateID} setCategory={setCategory} />
                            </TabPanel>
                            <TabPanel value={value} index={1} >
                              <EmployeePayments paymentMethodArray={paymentMethodArray} setPaymentMethodArray={setPaymentMethodArray}
                                setIsMainButtonEnable={setIsMainButtonEnable} />
                            </TabPanel>
                            <TabPanel value={value} index={2} >
                              <EmployeeReimbursement setIsMainButtonEnable={setIsMainButtonEnable} designationID={designationID} estateID={estateID} category={category}
                                basicSalary={basicSalary} setBasicSalary={setBasicSalary} designationName={designationName} setDesignationName={setDesignationName}
                                setAllowancesTypeList={setAllowancesTypeList} allowancesTypeList={allowancesTypeList} />
                            </TabPanel>
                            <TabPanel value={value} index={3} >
                              <EmployeeBoimetric empBiometricArray={empBiometricArray} setempBiometricArray={setempBiometricArray}
                                setIsMainButtonEnable={setIsMainButtonEnable} />
                            </TabPanel>
                            <TabPanel value={value} index={4} >
                              <EmployeeSupplimentary supplimentaryArray={supplimentaryArray} setSupplimentaryArray={setSupplimentaryArray}
                                setIsMainButtonEnable={setIsMainButtonEnable} />
                            </TabPanel>
                            <TabPanel value={value} index={5} >
                              <EmployeeStandingOrdersFunds standingOrdersArray={standingOrdersArray} setStandingOrdersArray={setStandingOrdersArray}
                                standingFundsArray={standingFundsArray} setStandingFundsArray={setStandingFundsArray}
                                onChangefactoryID={onChangefactoryID} setIsMainButtonEnable={setIsMainButtonEnable} />
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
                            checked={employeeIsActive}
                            onBlur={handleBlur}
                            onChange={onIsActiveChange}
                            name="isActive"
                          />
                        </Grid>
                        {isGrativityVisible ?
                          <>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="raise">
                                Gratuity (Rs)
                              </InputLabel>
                              <TextField
                                fullWidth
                                size='small'
                                name="raise"
                                onBlur={handleBlur}
                                value={grativityBalance}
                                variant="outlined"
                              />
                            </Grid>
                          </> : null}
                        <Grid item md={4} xs={12}>
                        </Grid>
                      </Grid>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={(isUpdate ? false : (btnDisable)) || !isFormValid}
                          type="submit"
                          variant="contained"
                          onClick={() => trackPromise(saveEmployee())}
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
                    headerMessage={"Employee Registration"}
                    discription={"Added employee details will be not save, Are you sure you want to leave?"} />
                  : null
                }
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment >
  );
};

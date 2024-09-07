import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../../utils/newLoader';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  }
}));

const screenCode = "EMPLOYEEREGISTRATION";

export function EmployeeGeneral({ empGeneralArray, setEmpGeneralArray, setFactoryID, setIsMainButtonEnable, setDesignationID, setEstateID, setCategory }) {
  const classes = useStyles();
  const agriGenERPEnum = new AgriGenERPEnum();
  const [btnDisable, setBtnDisable] = useState(false);
  const [employee, setEmployee] = useState({
    groupID: '0',
    factoryID: '0',
    titleID: '0',
    genderID: '0',
    firstName: '',
    lastName: '',
    dob: null,
    address: '',
    addresstwo: '',
    addressthree: '',
    mobileNumber: '',
    homeNumber: '',
    joiningDate: null,
    areaType: '0',
    area: '',
    employeeTypeID: '0',
    employeeCategoryID: '0',
    employeeSubCategoryID: '0',
    employeeDivisionID: '0',
    designationID: '0',
    employeeCode: '',
    registrationNumber: '',
    isEPFEnable: '0',
    epfNumber: '',
    nICNumber: '',
    secondName: '',
    city: '',
    email: '',
    basicMonthlySalary: '',
    basicDailySalary: '',
    specialAllowance: '',
    otherAllowance: '',
    religion: '',
    raise: '',
    isBCardStatus: false,
    unionID: '0'
  });
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [divisions, setDivisions] = useState();
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [unionTypes, setUnionTypesTypes] = useState([]);
  const [employeeCategories, setEmployeeCategories] = useState([]);
  const [employeeSubCategories, setEmployeeSubCategories] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const alert = useAlert();

  useEffect(() => {
    trackPromise(
      getPermission()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropDown(),
    )
  }, [employee.groupID]);

  useEffect(() => {
    getUnionTypesForDropdown()
  }, []);

  useEffect(() => {
    if (employee.factoryID > 0) {
      trackPromise(
        getDivisionsForDropDown()
      )
    }
  }, [employee.factoryID]);

  useEffect(() => {
    if (employee.employeeCategoryID > 0) {
      getDesignationsForDropdown();
    }
  }, [employee.employeeCategoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITEMPLOYEEREGISTRATION');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
    });

    setEmployee({
      ...employee,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });

    setFactoryID(tokenService.getFactoryIDFromToken());
    trackPromise(getGroupsForDropdown());
    trackPromise(setGeneralValues());
    trackPromise(getEmployeeTypesForDropdown());
    trackPromise(getEmployeeCategoriesForDropdown());
    trackPromise(getEmployeeSubCategoriesForDropdown());
  }

  async function getFactoriesForDropDown() {
    const factoryList = await services.getFactoryByGroupID(employee.groupID);
    setFactories(factoryList);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getEmployeeTypesForDropdown() {
    const result = await services.GetEmployeeTypesData();
    setEmployeeTypes(result);
  }

  async function getUnionTypesForDropdown() {
    const result = await services.GetUnionTypesData();
    setUnionTypesTypes(result);
  }
  async function getEmployeeCategoriesForDropdown() {
    const employeeCategories = await services.GetEmployeeCategoriesData();
    setEmployeeCategories(employeeCategories);
  }
  async function getEmployeeSubCategoriesForDropdown() {
    const employeeSubCategories = await services.GetEmployeeSubCategoriesData();
    setEmployeeSubCategories(employeeSubCategories);
  }

  async function getDesignationsForDropdown() {
    const employeeDesignations = await services.GetEemployeeDesignationsData(employee.groupID, employee.employeeCategoryID);
    setDesignations(employeeDesignations);
  }

  async function getDivisionsForDropDown() {
    const divisions = await services.getDivisionDetailsByEstateID(employee.factoryID);
    setDivisions(divisions);
  }

  async function setGeneralValues() {
    if (Object.keys(empGeneralArray).length > 0) {
      setEmployee({
        ...employee,
        titleID: empGeneralArray.titleID,
        firstName: empGeneralArray.firstName,
        lastName: empGeneralArray.lastName == null ? "" : empGeneralArray.lastName,
        genderID: empGeneralArray.genderID,
        dob: empGeneralArray.dob,
        nic: empGeneralArray.nic,
        address: empGeneralArray.address == null ? "" : empGeneralArray.address,
        addresstwo: empGeneralArray.addresstwo == null ? "" : empGeneralArray.addresstwo,
        addressthree: empGeneralArray.addressthree == null ? "" : empGeneralArray.addressthree,
        groupID: empGeneralArray.groupID,
        factoryID: empGeneralArray.factoryID,
        joiningDate: empGeneralArray.joiningDate,
        areaType: empGeneralArray.areaType,
        area: empGeneralArray.area == null ? 0 : empGeneralArray.area,
        employeeTypeID: empGeneralArray.employeeTypeID,
        employeeCategoryID: empGeneralArray.employeeCategoryID,
        employeeSubCategoryID: empGeneralArray.employeeSubCategoryID,
        employeeDivisionID: empGeneralArray.employeeDivisionID,
        designationID: empGeneralArray.designationID,
        employeeCode: empGeneralArray.employeeCode,
        registrationNumber: empGeneralArray.registrationNumber,
        isEPFEnable: empGeneralArray.isEPFEnable,
        epfNumber: empGeneralArray.epfNumber,
        nICNumber: empGeneralArray.nICNumber,
        secondName: empGeneralArray.secondName,
        city: empGeneralArray.city,
        homeNumber: empGeneralArray.homeNumber,
        mobileNumber: empGeneralArray.mobileNumber,
        email: empGeneralArray.email,
        basicMonthlySalary: empGeneralArray.basicMonthlySalary,
        basicDailySalary: empGeneralArray.basicDailySalary,
        specialAllowance: empGeneralArray.specialAllowance,
        otherAllowance: empGeneralArray.otherAllowance,
        religion: empGeneralArray.religion,
        raise: empGeneralArray.raise,
        isBCardStatus: empGeneralArray.isBCardStatus,
        unionID: empGeneralArray.unionID
      });

      if (empGeneralArray.employeeID > 0) {
        setFactoryID(empGeneralArray.factoryID);
        setIsUpdate(true);
      }
      else {
        setIsUpdate(false);
      }
    }
  }

  async function saveEmployeeGeneral(values) {

    let general = {
      titleID: values.titleID,
      firstName: values.firstName,
      lastName: values.lastName,
      genderID: values.genderID,
      dob: values.dob,
      nic: values.nic,
      address: values.address,
      addresstwo: values.addresstwo,
      addressthree: values.addressthree,
      mobileNumber: values.mobileNumber,
      groupID: values.groupID,
      factoryID: values.factoryID,
      areaType: values.areaType,
      area: parseFloat(values.areaType) === 0 ? 0 : values.area,
      joiningDate: values.joiningDate,
      employeeTypeID: values.employeeTypeID,
      employeeCategoryID: values.employeeCategoryID,
      employeeSubCategoryID: values.employeeSubCategoryID,
      employeeDivisionID: values.employeeDivisionID,
      designationID: values.designationID,
      employeeCode: values.employeeCode,
      registrationNumber: values.registrationNumber,
      isEPFEnable: values.isEPFEnable,
      epfNumber: values.epfNumber,
      nICNumber: values.nICNumber,
      secondName: values.secondName,
      city: values.city,
      homeNumber: values.homeNumber,
      email: values.email,
      basicMonthlySalary: values.basicMonthlySalary,
      basicDailySalary: values.basicDailySalary,
      specialAllowance: values.specialAllowance,
      otherAllowance: values.otherAllowance,
      religion: values.religion,
      raise: values.raise,
      isBCardStatus: values.isBCardStatus,
      unionID: values.unionID
    }
    setCategory(general.employeeCategoryID)
    setDesignationID(general.designationID)
    setEstateID(general.factoryID)
    btnchecking();
    setEmpGeneralArray(general);
    setIsMainButtonEnable(true);
    alert.success("Employee general details added.");
  }
  function btnchecking() {
    setBtnDisable(false);
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  function handleChangeForm(e) {
    const target = e.target;
    const value = target.value

    if (e.target.name === "factoryID") {
      setFactoryID(value);
    }

    if (e.target.name === "designationID") {
      setEmployee({
        ...employee,
        [e.target.name]: value
      });
    }

    setEmployee({
      ...employee,
      [e.target.name]: value
    });
  }

  function isBCardStatushandleChange(e) {
    const target = e.target
    const value = target.name === 'isBCardStatus' ? target.checked : target.value
    setEmployee({
      ...employee,
      [e.target.name]: value
    })
  }

  function handleDateChange(value, field) {
    if (field == "joiningDate") {
      setEmployee({
        ...employee,
        joiningDate: value
      });
    }
    else if (field == "dob") {
      setEmployee({
        ...employee,
        dob: value
      });
    }
  }

  return (
    <Page className={classes.root} title="Employee General Details Add Edit">
      <Container maxWidth={false}>
        <LoadingComponent />
        <Formik
          initialValues={{
            titleID: employee.titleID,
            firstName: employee.firstName,
            lastName: employee.lastName,
            genderID: employee.genderID,
            dob: employee.dob,
            address: employee.address,
            addresstwo: employee.addresstwo,
            addressthree: employee.addressthree,
            groupID: employee.groupID,
            factoryID: employee.factoryID,
            joiningDate: employee.joiningDate,
            areaType: employee.areaType,
            area: employee.area,
            employeeTypeID: employee.employeeTypeID,
            employeeCategoryID: employee.employeeCategoryID,
            employeeSubCategoryID: employee.employeeSubCategoryID,
            employeeDivisionID: employee.employeeDivisionID,
            designationID: employee.designationID,
            employeeCode: employee.employeeCode,
            registrationNumber: employee.registrationNumber,
            isEPFEnable: employee.isEPFEnable,
            epfNumber: employee.epfNumber,
            nICNumber: employee.nICNumber,
            secondName: employee.secondName,
            city: employee.city,
            homeNumber: employee.homeNumber,
            mobileNumber: employee.mobileNumber,
            email: employee.email,
            basicMonthlySalary: employee.basicMonthlySalary,
            basicDailySalary: employee.basicDailySalary,
            specialAllowance: employee.specialAllowance,
            otherAllowance: employee.otherAllowance,
            religion: employee.religion,
            raise: employee.raise,
            isBCardStatus: employee.isBCardStatus,
            unionID: employee.unionID
          }}
          validationSchema={
            Yup.object().shape({
              firstName: Yup.string().max(50, "First name must be at most 50 characters").required('First name is required').matches(/^[a-zA-Z]+[a-zA-Z.]+[ (a-zA-Z)+]*$/, "Only alphabets are allowed for this field"),
              lastName: Yup.string().max(50, "Last name must be at most 50 characters").required('Last name is required').matches(/^[a-zA-Z]+[a-zA-Z.]+[ (a-zA-Z)+]*$/, "Only alphabets are allowed for this field"),
              dob: Yup.date().required('DOB is required').typeError('Date of birth is required'),
              joiningDate: Yup.date().required('Joining Date is required').typeError('Joining date is required'),
              mobileNumber: Yup.string().max(10, "Mobile number must be at most 10 characters").required('Mobile number is required').matches(/^[0-9\b]+$/, 'Only allow numbers').nullable(),
              groupID: Yup.number().required('Group required').min("1", 'Select a group'),
              factoryID: Yup.number().required('Factory required').min("1", 'Select a factory'),
              employeeTypeID: Yup.number().required('Employee Type is required').min("1", 'Select an employee type'),
              employeeCategoryID: Yup.number().required('Employee Category is required').min("1", 'Select an employee category'),
              employeeSubCategoryID: Yup.number().required('Employee Sub Category is required').min("1", 'Select an employee sub category'),
              designationID: Yup.number().required('Designation is required').min("1", 'Select a designation'),
              employeeCode: Yup.string().required('Employee code is required'),
              registrationNumber: Yup.string().matches(/^[0-9\b]+$/, 'Only allow numbers').required('Registration number is required'),
              isEPFEnable: Yup.number().required('EPF mode is required').min("1", 'Select an EPF mode'),
              epfNumber: Yup.string().when('isEPFEnable', {
                is: (isEPFEnable) => [1, 2].includes(isEPFEnable), 
                then: Yup.string().required('EPF Number is required')
              }),
              nICNumber: Yup.string().required('NIC number is required').matches(/^(?:\d{9}[VvXx]|\d{12})$/, 'Entered NIC not valid'),
              areaType: Yup.number().required('Area type required').min("0", 'Select area type'),
              mobileNumber: Yup.string().required('Mobile number is required').matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/, 'Please enter valid phone number').
                min(10, "Enter number is too short").max(10, "Entered number is too long").nullable(),
              homeNumber: Yup.string().matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/, 'Please enter valid phone number').
                min(10, "Enter number is too short").max(10, "Entered number is too long").nullable(),
              email: Yup.string().email('Please enter a valid email').nullable(),
              basicMonthlySalary: Yup.number().typeError('Please enter a valid amount').nullable(),
              basicDailySalary: Yup.number().typeError('Please enter a valid amount').nullable(),
              specialAllowance: Yup.number().typeError('Please enter a valid amount').nullable(),
              otherAllowance: Yup.number().typeError('Please enter a valid amount').nullable(),
              area: Yup.string().when('areaType', {
                is: (areaType) => areaType > 0,
                then: Yup.string().required('Area required').matches(/^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/, 'Enter valid area.').nullable()
              }),
              
            })
          }
          onSubmit={(values) => saveEmployeeGeneral(values)}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleSubmit,
            setFieldValue,
            touched
          }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={3}>
                <Card className={classes.cardContent}>
                  <CardHeader
                    title="General Details"
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent >
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            size='small'
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.groupID}
                            variant="outlined"
                            id="groupID"
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
                            }}
                          >
                            <MenuItem value='0'>--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryID">
                            Operation Entity *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.factoryID && errors.factoryID)}
                            fullWidth
                            helperText={touched.factoryID && errors.factoryID}
                            size='small'
                            name="factoryID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.factoryID}
                            variant="outlined"
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false,
                            }}
                          >
                            <MenuItem value='0'>--Select Operation Entity--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeTypeID">
                            Employee Type *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.employeeTypeID && errors.employeeTypeID)}
                            helperText={touched.employeeTypeID && errors.employeeTypeID}
                            size='small'
                            onBlur={handleBlur}
                            id="employeeTypeID"
                            name="employeeTypeID"
                            value={employee.employeeTypeID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Employee Type--</MenuItem>
                            {generateDropDownMenu(employeeTypes)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeCategoryID">
                            Employee Category *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.employeeCategoryID && errors.employeeCategoryID)}
                            helperText={touched.employeeCategoryID && errors.employeeCategoryID}
                            size='small'
                            onBlur={handleBlur}
                            id="employeeCategoryID"
                            name="employeeCategoryID"
                            value={employee.employeeCategoryID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Employee Category--</MenuItem>
                            {generateDropDownMenu(employeeCategories)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeSubCategoryID">
                            Employee Sub Category *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.employeeSubCategoryID && errors.employeeSubCategoryID)}
                            helperText={touched.employeeSubCategoryID && errors.employeeSubCategoryID}
                            size='small'
                            onBlur={handleBlur}
                            id="employeeSubCategoryID"
                            name="employeeSubCategoryID"
                            value={employee.employeeSubCategoryID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Employee Sub Category--</MenuItem>
                            {generateDropDownMenu(employeeSubCategories)}
                          </TextField>
                        </Grid>
                        {employee.employeeSubCategoryID == agriGenERPEnum.EmployeeSubCategory.Division ?
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="employeeDivisionD">
                              Employee Division *
                            </InputLabel>
                            <TextField select fullWidth
                              size='small'
                              onBlur={handleBlur}
                              id="employeeDivisionID"
                              name="employeeDivisionID"
                              value={employee.employeeDivisionID}
                              type="text"
                              variant="outlined"
                              onChange={(e) => handleChangeForm(e)}
                            >
                              <MenuItem value='0'>--Select Employee Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid> : null}
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="designationID">
                            Designation *
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.designationID && errors.designationID)}
                            helperText={touched.designationID && errors.designationID}
                            size='small'
                            onBlur={handleBlur}
                            id="designationID"
                            name="designationID"
                            value={employee.designationID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Designation--</MenuItem>
                            {generateDropDownMenu(designations)}
                          </TextField>
                        </Grid>
                      </Grid>
                      <br></br>
                      <Divider />
                      <br></br>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeCode">
                            Employee Code *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.employeeCode && errors.employeeCode)}
                            fullWidth
                            helperText={touched.employeeCode && errors.employeeCode}
                            size='small'
                            name="employeeCode"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.employeeCode}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="registrationNumber">
                            Registration Number *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                            fullWidth
                            helperText={touched.registrationNumber && errors.registrationNumber}
                            size='small'
                            name="registrationNumber"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.registrationNumber}
                            variant="outlined"
                            InputProps={{
                              readOnly: isUpdate
                            }}
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="isEPFEnable">
                            EPF/ESPS Mode*
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.isEPFEnable && errors.isEPFEnable)}
                            helperText={touched.isEPFEnable && errors.isEPFEnable}
                            size='small'
                            onBlur={handleBlur}
                            id="isEPFEnable"
                            name="isEPFEnable"
                            value={employee.isEPFEnable}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select EPF/ESPF Mode--</MenuItem>
                            <MenuItem value="1">EPF</MenuItem>
                            <MenuItem value="2">ESPS</MenuItem>
                            <MenuItem value="3">Non-EPF/ESPS</MenuItem>
                          </TextField>
                        </Grid>
                        {employee.isEPFEnable == 1 || employee.isEPFEnable ==2 ?
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="epfNumber">
                              EPF/ESPS Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.epfNumber && errors.epfNumber)}
                              fullWidth
                              helperText={touched.epfNumber && errors.epfNumber}
                              size='small'
                              name="epfNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForm(e)}
                              value={employee.epfNumber}
                              variant="outlined"
                            />
                          </Grid>
                          : null}
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="nICNumber">
                            NIC *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.nICNumber && errors.nICNumber)}
                            fullWidth
                            helperText={touched.nICNumber && errors.nICNumber}
                            size='small'
                            name="nICNumber"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.nICNumber}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="titleID">
                            Title
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.titleID && errors.titleID)}
                            helperText={touched.titleID && errors.titleID}
                            size='small'
                            onBlur={handleBlur}
                            id="titleID"
                            name="titleID"
                            value={employee.titleID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Title--</MenuItem>
                            <MenuItem value="1">Mr</MenuItem>
                            <MenuItem value="2">Mrs</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="firstName">
                            First Name *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.firstName && errors.firstName)}
                            fullWidth
                            helperText={touched.firstName && errors.firstName}
                            size='small'
                            name="firstName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.firstName}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="secondName">
                            Second Name
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.secondName && errors.secondName)}
                            fullWidth
                            helperText={touched.secondName && errors.secondName}
                            size='small'
                            name="secondName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.secondName}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="lastName">
                            Last Name *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.lastName && errors.lastName)}
                            fullWidth
                            helperText={touched.lastName && errors.lastName}
                            size='small'
                            name="lastName"
                            type="lastName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.lastName}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="genderID">
                            Gender
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.genderID && errors.genderID)}
                            helperText={touched.genderID && errors.genderID}
                            size='small'
                            onBlur={handleBlur}
                            id="genderID"
                            name="genderID"
                            value={
                              employee.genderID = employee.titleID
                            }
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}>
                            <MenuItem value="0">--Select Gender--</MenuItem>
                            <MenuItem value="1">Male</MenuItem>
                            <MenuItem value="2">Female</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="dob">
                            Date Of Birth *
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.dob && errors.dob)}
                              helperText={touched.dob && errors.dob}
                              autoOk
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              id="dob"
                              name="dob"
                              value={employee.dob}
                              maxDate={new Date()}
                              onChange={(e) => handleDateChange(e, "dob")}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                              InputProps={{ readOnly: true }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="joiningDate">
                            Joining Date *
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.joiningDate && errors.joiningDate)}
                              helperText={touched.joiningDate && errors.joiningDate}
                              autoOk
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              id="joiningDate"
                              name="joiningDate"
                              value={employee.joiningDate}
                              maxDate={new Date()}
                              onChange={(e) => handleDateChange(e, "joiningDate")}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}


                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="unionID">
                            Union
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.unionID && errors.unionID)}
                            helperText={touched.unionID && errors.unionID}
                            size='small'
                            onBlur={handleBlur}
                            id="unionID"
                            name="unionID"
                            value={employee.unionID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChangeForm(e)}
                          >
                            <MenuItem value="0">--Select Union Type--</MenuItem>
                            {generateDropDownMenu(unionTypes)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="isBCardStatus">
                            Is B Card Availabile
                          </InputLabel>
                          <Switch
                            error={Boolean(touched.isBCardStatus && errors.isBCardStatus)}
                            helperText={touched.isBCardStatus && errors.isBCardStatus}
                            checked={employee.isBCardStatus}
                            onBlur={handleBlur}
                            onChange={(e) => isBCardStatushandleChange(e)}
                            name="isBCardStatus"
                          />
                        </Grid>
                      </Grid>
                      <br></br>
                      <Divider />
                      <br></br>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="address">
                            Address 1
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.address && errors.address)}
                            fullWidth
                            helperText={touched.address && errors.address}
                            size='small'
                            name="address"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.address}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="addresstwo">
                            Address 2
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.addresstwo && errors.addresstwo)}
                            fullWidth
                            helperText={touched.addresstwo && errors.addresstwo}
                            size='small'
                            name="addresstwo"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.addresstwo}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="addressthree">
                            Address 3
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.addressthree && errors.addressthree)}
                            fullWidth
                            helperText={touched.addressthree && errors.addressthree}
                            size='small'
                            name="addressthree"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.addressthree}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="city">
                            City
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.city && errors.city)}
                            fullWidth
                            helperText={touched.city && errors.city}
                            size='small'
                            name="city"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.city}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="mobileNumber">
                            Mobile Number *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.mobileNumber && errors.mobileNumber)}
                            fullWidth
                            helperText={touched.mobileNumber && errors.mobileNumber}
                            size='small'
                            name="mobileNumber"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.mobileNumber}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="homeNumber">
                            Home Number
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.homeNumber && errors.homeNumber)}
                            fullWidth
                            helperText={touched.homeNumber && errors.homeNumber}
                            size='small'
                            name="homeNumber"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.homeNumber}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="email">
                            Email Address
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.email && errors.email)}
                            fullWidth
                            helperText={touched.email && errors.email}
                            size='small'
                            name="email"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.email}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                      <br></br>
                      <Divider />
                      <br></br>
                      {/* <Grid container spacing={3}>
                        {employee.employeeCategoryID == 1 ?
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="basicMonthlySalary">
                              Monthly Salary
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.basicMonthlySalary && errors.basicMonthlySalary)}
                              fullWidth
                              helperText={touched.basicMonthlySalary && errors.basicMonthlySalary}
                              size='small'
                              name="basicMonthlySalary"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForm(e)}
                              value={employee.basicMonthlySalary}
                              variant="outlined"
                            />
                          </Grid> : null}
                        {employee.employeeCategoryID == 2 || employee.employeeCategoryID == 3 ?
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="basicMonthlySalary">
                              Daily Salary
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.basicDailySalary && errors.basicDailySalary)}
                              fullWidth
                              helperText={touched.basicDailySalary && errors.basicDailySalary}
                              size='small'
                              name="basicDailySalary"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForm(e)}
                              value={employee.basicDailySalary}
                              variant="outlined"
                            />
                          </Grid> : null}
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="specialAllowance">
                            Special Allowance
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.specialAllowance && errors.specialAllowance)}
                            fullWidth
                            helperText={touched.specialAllowance && errors.specialAllowance}
                            size='small'
                            name="specialAllowance"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.specialAllowance}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="otherAllowance">
                            Other Allowance
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.otherAllowance && errors.otherAllowance)}
                            fullWidth
                            helperText={touched.otherAllowance && errors.otherAllowance}
                            size='small'
                            name="otherAllowance"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.otherAllowance}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid> */}
                      <br></br>
                      <Divider />
                      <br></br>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="areaType">
                            Area Type
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.areaType && errors.areaType)}
                            helperText={touched.areaType && errors.areaType}
                            size='small'
                            onBlur={handleBlur}
                            id="areaType"
                            name="areaType"
                            value={employee.areaType}
                            variant="outlined"
                            onChange={(e) => {
                              handleChangeForm(e)
                              if (parseInt(e.target.value) === 0) {
                                setFieldValue('area', '');
                              }
                              setFieldValue('areaType', e.target.value);
                            }}>
                            <MenuItem value="0">--Select Area Type--</MenuItem>
                            <MenuItem value="1">Perch</MenuItem>
                            <MenuItem value="2">Hectare</MenuItem>
                          </TextField>
                        </Grid>
                        {employee.areaType > 0 ? <Grid item md={4} xs={12}>
                          <InputLabel shrink id="area">
                            Area Size
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.area && errors.area)}
                            fullWidth
                            helperText={touched.area && errors.area}
                            size='small'
                            name="area"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.area}
                            variant="outlined"
                          />
                        </Grid> : null}
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="religion">
                            Religion
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.religion && errors.religion)}
                            fullWidth
                            helperText={touched.religion && errors.religion}
                            size='small'
                            name="religion"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.religion}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="raise">
                            Race
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.raise && errors.raise)}
                            fullWidth
                            helperText={touched.raise && errors.raise}
                            size='small'
                            name="raise"
                            onBlur={handleBlur}
                            onChange={(e) => handleChangeForm(e)}
                            value={employee.raise}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        disabled={btnDisable}
                        type="submit"
                        variant="contained"
                      >
                        Add
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
  );
};

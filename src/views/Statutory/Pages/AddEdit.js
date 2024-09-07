import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button,
  CardContent, Divider, InputLabel, CardHeader, MenuItem, Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import { parseInt } from 'lodash';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
import PageHeader from 'src/views/Common/PageHeader';
import { ClearAll } from '@material-ui/icons';
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  }

}));

var screenCode = "STATUTORY"
export default function Statutory(props) {
  const [title, setTitle] = useState(" Statutory Payments");
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [deductionType, setDeductionType] = useState();
  const [applyCondition, setApplyCondition] = useState();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState();
  const [employeeCategories, setEmployeeCategories] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employeeList, setEmployeeList] = useState({
    groupID: '0',
    factoryID: '0',
    divisionID: '0',
    employeeTypeID: '0',
    employeeCategoryID: '0',
    statusID: '2',
    designationID: '0',
    applyPartyID: '0',
    applyConditionID: '0'
  })


  const [statutorydetails, setStatutoryDetails] = useState({
    groupID: '0',
    deductionTypeID: '0',
    applyPartyID: '0',
    percentageAmount: '0',
    isActive: true,
    applyConditionID: '0',
    designationID: '0',
    employeeCategoryID: '0'
  });

  const handleClick = () => {
    navigate('/app/statutory/listing');
  }

  const navigate = useNavigate();
  const alert = useAlert();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const [IsAddButtonDisable, setIsAddButtonDisable] = useState(false);
  const { statutoryID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    getPermissions();
    trackPromise(
      GetDeductionTypes(),
      GetApplyConditionsTypes()
    );
  }, []);

  useEffect(() => {
    decrypted = atob(statutoryID.toString());
    if (decrypted != 0) {
      trackPromise(
        GetStatoryDetailsByID(decrypted)
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      GetGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (statutorydetails.groupID > 0) {
      trackPromise(
        GetEstateDetailsByGroupID()
      );
    };
  }, [statutorydetails.groupID]);

  useEffect(() => {
    if (isUpdate != true) {
      setStatutoryDetails({
        ...statutorydetails,
        applyPartyID: '0',
        percentageAmount: '0',
        applyConditionID: '1',
      })
    }
  }, [statutorydetails.deductionTypeID]);

  useEffect(() => {
    if (isUpdate != true) {
      setStatutoryDetails({
        ...statutorydetails,
        percentageAmount: '0',
        applyConditionID: '1',
      })
    }
  }, [statutorydetails.applyPartyID]);

  useEffect(() => {
    if (isUpdate != true) {
      setStatutoryDetails({
        ...statutorydetails,
        applyConditionID: '1',
      })
    }
  }, [statutorydetails.percentageAmount]);

  useEffect(() => {
    trackPromise(
      getEmployeeCategoriesForDropdown(),
    )
  }, [statutorydetails.employeeCategoryID]);

  useEffect(() => {
    if (statutorydetails.employeeCategoryID > 0) {
      getDesignationsForDropdown();
    }
  }, [statutorydetails.employeeCategoryID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'SAVESTATUTORYDETAILS');

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

    setStatutoryDetails({
      ...statutorydetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function GetGroupsForDropdown() {
    const groups = await services.GetAllGroups();
    setGroups(groups);
  }

  async function GetEstateDetailsByGroupID() {
    var estate = await services.GetEstateDetailsByGroupID(statutorydetails.groupID);
    setEstates(estate);
  }

  async function GetDeductionTypes() {
    const deductionTypes = await services.GetAllDeductionTypes();
    setDeductionType(deductionTypes);
  }

  async function GetApplyConditionsTypes() {
    const applyConditionTypes = await services.GetAllApplyConditionTypes();
    setApplyCondition(applyConditionTypes);
  }

  async function GetStatoryDetailsByID(statutoryID) {
    let response = await services.GetStatoryDetailsByID(statutoryID);


    let data = response[0];
    setTitle("Update Statutory Details");
    setIsUpdate(true);

    setStatutoryDetails({
      ...statutorydetails,
      groupID: data.groupID.toString(),
      employeeCategoryID: data.employeeCategoryID.toString(),
      designationID: data.designationID.toString(),
      deductionTypeID: data.deductionTypeID.toString(),
      applyPartyID: data.applyPartyID.toString(),
      percentageAmount: data.percentageAmount.toString(),
      applyConditionID: data.applyConditionID.toString(),
      isActive: data.isActive
    })

  }

  async function getEmployeeCategoriesForDropdown() {
    const employeeCategories = await services.GetEmployeeCategoriesData();
    setEmployeeCategories(employeeCategories);
  }

  async function getDesignationsForDropdown() {
    const designations = await services.GetEemployeeDesignationsData(statutorydetails.groupID, statutorydetails.employeeCategoryID);
    setDesignations(designations);
  }

  async function SaveStatoryDetails() {
    if (isUpdate == true) {
      let updateModel = {
        statutoryID: parseInt(atob(statutoryID.toString())),
        deductionTypeID: parseInt(statutorydetails.deductionTypeID),
        groupID: parseInt(statutorydetails.groupID),
        applyConditionID: parseInt(statutorydetails.applyConditionID),
        applyPartyID: parseInt(statutorydetails.applyPartyID),
        percentageAmount: parseFloat(statutorydetails.percentageAmount),
        isActive: statutorydetails.isActive,
        modifiedBy: parseInt(tokenDecoder.getUserIDFromToken()),
        employeeCategoryID: parseInt(statutorydetails.employeeCategoryID),
        designationID: parseInt(statutorydetails.designationID)
      }

      let response = await services.UpdateStatoryDetails(updateModel);

      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/statutory/listing');
      }
      else {
        setStatutoryDetails({
          ...statutorydetails
        });
        alert.error(response.message);
      }
    }
    else {
      if (statutorydetails.applyPartyID == 2 && statutorydetails.deductionTypeID == 2) {
        alert.error("ETF not applicable to Employee")
      } else {
        let saveModel = {
          deductionTypeID: parseInt(statutorydetails.deductionTypeID),
          groupID: parseInt(statutorydetails.groupID),
          applyConditionID: parseInt(statutorydetails.applyConditionID),
          applyPartyID: parseInt(statutorydetails.applyPartyID),
          percentageAmount: parseFloat(statutorydetails.percentageAmount),
          isActive: statutorydetails.isActive,
          createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
          employeeCategoryID: parseInt(statutorydetails.employeeCategoryID),
          designationID: parseInt(statutorydetails.designationID)
        };
        let response = await services.SaveStatoryDetails(saveModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          CleareValues();
          navigate('/app/statutory/listing');
        }
        else {
          alert.error(response.message);
        }
      }
    }
  }

  async function CleareValues() {
    setStatutoryDetails({
      ...statutorydetails,
      deductionTypeID: '0',
      applyPartyID: '0',
      applyConditionID: '1',
      percentageAmount: '0',
      isActive: true,
    })
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
      }
    }
    return items
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setStatutoryDetails({
      ...statutorydetails,
      [e.target.name]: value
    });
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.name === 'isActive' ? target.checked : target.value
    setStatutoryDetails({
      ...statutorydetails,
      [e.target.name]: value
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader
            onClick={handleClick}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              deductionTypeID: statutorydetails.deductionTypeID,
              applyPartyID: statutorydetails.applyPartyID,
              percentageAmount: statutorydetails.percentageAmount,
              applyConditionID: statutorydetails.applyConditionID,
              designationID: statutorydetails.designationID,
              employeeCategoryID: statutorydetails.employeeCategoryID
            }}
            validationSchema={
              Yup.object().shape({
                deductionTypeID: Yup.number().required(' Statutory Deduction Type required').min("1", 'Statutory Deduction Type  required'),
                applyPartyID: Yup.number().required('Apply Party required').min("1", 'Apply Party required'),
                percentageAmount: Yup.number().typeError('Amount must be a number')
                  .integer('Amount must be an integer')
                  .required('Amount is required')
                  .test('no-symbols', 'Cannot enter symbols, only numeric values are allowed', (value) => /^[0-9]+$/.test(String(value)))
                  .min(1, 'Amount Cannot be Zero'),
                designationID: Yup.number().required('Designation is required').min("1", 'Designation is required'),
                employeeCategoryID: Yup.number().required('Employee Category is required').min("1", 'Employee Category is required')
              })
            }
            onSubmit={() => trackPromise(SaveStatoryDetails())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched
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
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={statutorydetails.groupID}
                              variant="outlined"
                              size='small'
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="employeeCategoryID">
                              Employee Category *
                            </InputLabel>
                            <TextField select fullWidth
                              error={Boolean(touched.employeeCategoryID && errors.employeeCategoryID)}
                              helperText={touched.employeeCategoryID && errors.employeeCategoryID}
                              size='small'
                              id="employeeCategoryID"
                              name="employeeCategoryID"
                              value={statutorydetails.employeeCategoryID}
                              type="text"
                              variant="outlined"
                              onChange={(e) => handleChange(e)}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Employee Category--</MenuItem>
                              {generateDropDownMenu(employeeCategories)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
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
                              value={statutorydetails.designationID}
                              type="text"
                              variant="outlined"
                              onChange={(e) => handleChange(e)}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Designation--</MenuItem>

                              {generateDropDownMenu(designations)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="deductionTypeID">
                              Statutory Deduction Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.deductionTypeID && errors.deductionTypeID)}
                              fullWidth
                              helperText={touched.deductionTypeID && errors.deductionTypeID}
                              name="deductionTypeID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={statutorydetails.deductionTypeID}
                              variant="outlined"
                              id="deductionTypeID"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Statutory Deduction Type--</MenuItem>
                              {generateDropDownMenu(deductionType)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="applyPartyID">
                              Apply Party *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.applyPartyID && errors.applyPartyID)}
                              fullWidth
                              helperText={touched.applyPartyID && errors.applyPartyID}
                              name="applyPartyID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={statutorydetails.applyPartyID}
                              variant="outlined"
                              id="applyPartyID"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Apply Party--</MenuItem>
                              <MenuItem value="1">Employer</MenuItem>
                              <MenuItem value="2">Employee</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="percentageAmount">
                              Percentage Amount (%) *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.percentageAmount && errors.percentageAmount)}
                              fullWidth
                              helperText={touched.percentageAmount && errors.percentageAmount}
                              name="percentageAmount"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={statutorydetails.percentageAmount}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="applyConditionID">
                              Apply Condition *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.applyConditionID && errors.applyConditionID)}
                              fullWidth
                              helperText={touched.applyConditionID && errors.applyConditionID}
                              name="applyConditionID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={statutorydetails.applyConditionID}
                              variant="outlined"
                              id="applyConditionID"
                              size='small'
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            >
                              {generateDropDownMenu(applyCondition)}

                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="isActive">
                              Active
                            </InputLabel>
                            <Switch
                              checked={statutorydetails.isActive}
                              onChange={(e) => handleChange1(e)}
                              name="isActive"
                              disabled={isDisableButton}
                            />
                          </Grid>
                        </Grid>
                        <Grid container justify="flex-end">
                          <Box pr={2}>
                            <Button
                              color="primary"
                              variant="outlined"
                              type="reset"
                              onClick={CleareValues}
                              size='small'
                              disabled={isUpdate}
                            >
                              Clear
                            </Button>
                          </Box>
                          <Box pr={2}>
                            <Button
                              color="primary"
                              type="submit"
                              variant="contained"
                              size="small"
                              disabled={IsAddButtonDisable}
                            >
                              {isUpdate == true ? "Update" : "Save"}
                            </Button>
                          </Box>
                        </Grid>
                        <br />
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

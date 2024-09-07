import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, TextareaAutosize
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';

import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

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

const screenCode = 'FIELDREGISTRATION';
export default function FieldRegistrationAddEdit(props) {
  const [title, setTitle] = useState("Field Creation")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [sectionTypes, setSectionTypes] = useState([]);
  const [field, setField] = useState({
    fieldID: 0,
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    sectionTypeID: 0,
    fieldCode: '',
    fieldName: '',
    fieldLocation: '',
    area: 0,
    targetCrop: 0,
    sectionName: '',
    areaOfSection: 0,
    yearOfPlanting: 0,
    date: '',
    typesOfPlant: 0,
    clone: 0,
    seedling: 0,
    drainageLengths: 0,
    spaceBetweenPlants: 0,
    noOfTeaBushes: 0,
    plantingType: 0,
    noOfShadeTrees: 0,
    isActive: true,
  });

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app/fieldRegistration/listing');
  }
  const alert = useAlert();
  const { fieldID } = useParams();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    decrypted = atob(fieldID.toString());
    if (decrypted != 0) {
      trackPromise(getFieldDetails(decrypted));
    }
    trackPromise(getPermissions(), getGroupsForDropdown(), getSectionTypesForDropdown(),);
  }, []);

  useEffect(() => {
    if (field.groupID > 0) {
      trackPromise(getEstateDetailsByGroupID());
    }
  }, [field.groupID]);

  useEffect(() => {
    if (field.estateID > 0) {
      trackPromise(getDivisionDetailsByEstateID());
    }
  }, [field.estateID]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  };

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(field.groupID);
    setEstates(response);
  };

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(field.estateID);
    setDivisions(response);
  };

  async function getSectionTypesForDropdown() {
    const sectionTypes = await services.getAllSectionTypes();
    setSectionTypes(sectionTypes);
  }

  async function getFieldDetails(fieldID) {
    let response = await services.getFieldDetailsByID(fieldID);
    let data = response[0];

    setTitle("Edit Feild");
    setField(data);
    setIsUpdate(true);
    setField({
      ...data,
      date: data.yearsOfPlanting.concat("-", data.monthOfPlanting)
    });
  }

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITFIELDREGISTRATION');

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

    if (decrypted == 0) {
      setField({
        ...field,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        estateID: parseInt(tokenService.getFactoryIDFromToken()),
      })
    }
  }

  async function saveField(values) {

    if (isUpdate == true) {
      //let splitDate = field.date.toISOString().split('T')[0];
      let updateModel = {
        fieldID: atob(fieldID.toString()),
        fieldCode: values.fieldCode,
        fieldName: values.fieldName,
        fieldLocation: values.fieldLocation,
        area: parseFloat(values.area),
        targetCrop: parseFloat(values.targetCrop),
        sectionName: values.sectionName,
        areaOfSection: parseFloat(values.areaOfSection),
        // yearsOfPlanting: splitDate.split('-')[0],
        //monthOfPlanting: splitDate.split('-')[1],
        typesOfPlant: parseInt(values.typesOfPlant),
        clone: parseInt(values.clone),
        seedling: parseInt(values.seedling),
        drainageLengths: parseFloat(values.drainageLengths),
        spaceBetweenPlants: parseFloat(values.spaceBetweenPlants),
        noOfTeaBushes: parseInt(values.noOfTeaBushes),
        plantingType: parseInt(values.plantingType),
        noOfShadeTrees: parseInt(values.noOfShadeTrees),
        isActive: values.isActive,
        modifiedBy: parseInt(tokenService.getUserIDFromToken())
      }

      let response = await services.updateField(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/fieldRegistration/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let splitDate = field.date.toISOString().split('T')[0]
      let saveModel = {
        fieldID: 0,
        groupID: parseInt(values.groupID),
        estateID: parseInt(values.estateID),
        divisionID: parseInt(values.divisionID),
        sectionTypeID: parseInt(values.sectionTypeID),
        fieldCode: values.fieldCode,
        fieldName: values.fieldName,
        fieldLocation: values.fieldLocation,
        area: parseFloat(values.area),
        targetCrop: parseFloat(values.targetCrop),
        sectionName: values.sectionName,
        areaOfSection: parseFloat(values.areaOfSection),
        yearsOfPlanting: splitDate.split('-')[0],
        monthOfPlanting: splitDate.split('-')[1],
        typesOfPlant: parseInt(values.typesOfPlant),
        clone: parseInt(values.clone),
        seedling: parseInt(values.seedling),
        drainageLengths: parseFloat(values.drainageLengths),
        spaceBetweenPlants: parseFloat(values.spaceBetweenPlants),
        noOfTeaBushes: parseInt(values.noOfTeaBushes),
        plantingType: parseInt(values.plantingType),
        noOfShadeTrees: parseInt(values.noOfShadeTrees),
        isActive: values.isActive,
        createdBy: tokenService.getUserIDFromToken(),
      }

      let response = await services.saveField(saveModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/fieldRegistration/listing');
      }
      else {
        alert.error(response.message);
      }
    }
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

  function handleChange2(e) {
    const target = e.target;
    const value = target.value;
    if (field.typesOfPlant == 3) {
      setField({
        ...field,
        clone: value,
        seedling: 100 - value
      })
    }
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value;
    setField({
      ...field,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setField({
      ...field,
      date: value
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
              groupID: field.groupID,
              estateID: field.estateID,
              divisionID: field.divisionID,
              sectionTypeID: field.sectionTypeID,
              fieldCode: field.fieldCode,
              fieldName: field.fieldName,
              date: field.date,
              fieldLocation: field.fieldLocation,
              area: field.area,
              targetCrop: field.targetCrop,
              sectionName: field.sectionName,
              areaOfSection: field.areaOfSection,
              typesOfPlant: field.typesOfPlant,
              clone: field.clone,
              seedling: field.seedling,
              drainageLengths: field.drainageLengths,
              spaceBetweenPlants: field.spaceBetweenPlants,
              noOfTeaBushes: field.noOfTeaBushes,
              plantingType: field.plantingType,
              noOfShadeTrees: field.noOfShadeTrees,
              isActive: field.isActive,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                estateID: Yup.number().required('Estate required').min("1", 'Estate required'),
                divisionID: Yup.number().required('Division required').min("1", 'Division required'),
                sectionTypeID: Yup.number().required('Section Type required').min("1", 'Section Type required'),
                fieldCode: Yup.string().max(30).required('Field Code required'),
                fieldName: Yup.string().max(30).required('Field Name required'),
                fieldLocation: Yup.string().max(100),
                area: Yup.number().required('Area required'),
                targetCrop: Yup.number().required('TargetCrop required'),
                drainageLengths: Yup.number(),
                spaceBetweenPlants: Yup.number(),
                noOfTeaBushes: Yup.number(),
                plantingType: Yup.number().required('Planting Type required').min("1", 'Planting Type required'),
                noOfShadeTrees: Yup.number(),
                date: Yup.date().required('Date is required'),
              })
            }
            onSubmit={saveField}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              handleChange,
              isSubmitting,
              touched,
              values,
              props
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
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              size='small'
                              value={field.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => handleChange1(e)}
                              value={field.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.divisionID && errors.divisionID)}
                              fullWidth
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={field.divisionID}
                              variant="outlined"
                              id="divisionID"
                            >
                              <MenuItem value={0}>--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="sectionTypeID">
                              Section Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.sectionTypeID && errors.sectionTypeID)}
                              fullWidth
                              helperText={touched.sectionTypeID && errors.sectionTypeID}
                              name="sectionTypeID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={field.sectionTypeID}
                              variant="outlined"
                              id="sectionTypeID"
                              InputProps={{
                                readOnly: isUpdate
                              }}
                            >
                              <MenuItem value={0}>--Select Section Type--</MenuItem>
                              {generateDropDownMenu(sectionTypes)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="fieldCode">
                              Field code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fieldCode && errors.fieldCode)}
                              fullWidth
                              helperText={touched.fieldCode && errors.fieldCode}
                              name="fieldCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={field.fieldCode}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="fieldName">
                              Field Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fieldName && errors.fieldName)}
                              fullWidth
                              helperText={touched.fieldName && errors.fieldName}
                              name="fieldName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={field.fieldName}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="fieldLocation">
                              Field Location
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fieldLocation && errors.fieldLocation)}
                              fullWidth
                              helperText={touched.fieldLocation && errors.fieldLocation}
                              name="fieldLocation"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              size='small'
                              value={field.fieldLocation}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date">
                              Month & Year *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.date && errors.date)}
                                helperText={touched.date && errors.date}
                                autoOk
                                fullWidth
                                views={['year', 'month']}
                                variant="inline"
                                margin="dense"
                                name="date"
                                id="date"
                                value={field.date}
                                onChange={(e) => {
                                  handleDateChange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id='area'>
                              Area Of Field (Hectare)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name='area'
                              onBlur={handleBlur}
                              value={field.area}
                              onChange={(e) => handleChange1(e)}
                              variant="outlined"
                              size='small'
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id='targetCrop'>
                              Target of Crop (Kg)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name='targetCrop'
                              onBlur={handleBlur}
                              value={field.targetCrop}
                              onChange={(e) => handleChange1(e)}
                              variant="outlined"
                              size='small'
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="plantingType">
                              Planting type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.plantingType && errors.plantingType)}
                              fullWidth
                              helperText={touched.plantingType && errors.plantingType}
                              name="plantingType"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={field.plantingType}
                              size='small'
                              variant="outlined" >
                              <MenuItem value="0">--Select Planting type--</MenuItem>
                              <MenuItem value="1">New Plantation</MenuItem>
                              <MenuItem value="2">Uprooting</MenuItem>
                              <MenuItem value="3">Dead Bushes</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id='noOfShadeTrees'>
                              No. of shade trees
                            </InputLabel>
                            <TextField
                              fullWidth
                              name='noOfShadeTrees'
                              onBlur={handleBlur}
                              value={field.noOfShadeTrees}
                              onChange={(e) => handleChange1(e)}
                              variant="outlined"
                              size='small'
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id='drainageLengths'>
                              Drainage lengths (Feet)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name='drainageLengths'
                              onBlur={handleBlur}
                              value={field.drainageLengths}
                              onChange={(e) => handleChange1(e)}
                              variant="outlined"
                              size='small'
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id='spaceBetweenPlants'>
                              Space between plants (Feet)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name='spaceBetweenPlants'
                              onBlur={handleBlur}
                              value={field.spaceBetweenPlants}
                              onChange={(e) => handleChange1(e)}
                              variant="outlined"
                              size='small'
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id='noOfTeaBushes'>
                              No. of tea bushes
                            </InputLabel>
                            <TextField
                              fullWidth
                              name='noOfTeaBushes'
                              onBlur={handleBlur}
                              value={field.noOfTeaBushes}
                              onChange={(e) => handleChange1(e)}
                              variant="outlined"
                              size='small'
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="typesOfPlant">
                              Types of plant *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.typesOfPlant && errors.typesOfPlant)}
                              fullWidth
                              helperText={touched.typesOfPlant && errors.typesOfPlant}
                              name="typesOfPlant"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={field.typesOfPlant}
                              size='small'
                              variant="outlined" >
                              <MenuItem value="0">--Select Types of plant--</MenuItem>
                              <MenuItem value="1">Clone</MenuItem>
                              <MenuItem value="2">Seedling</MenuItem>
                              <MenuItem value="3">Both</MenuItem>
                            </TextField>
                          </Grid>
                          {field.typesOfPlant == 3 ?
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id='clone'>
                                Clone
                              </InputLabel>
                              <TextField
                                fullWidth
                                name='clone'
                                onBlur={handleBlur}
                                value={field.clone}
                                onChange={(e) => handleChange2(e)}
                                variant="outlined"
                                size='small'
                              />
                            </Grid>
                            : null}
                          {field.typesOfPlant == 3 ?
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id='seedling'>
                                Seedling
                              </InputLabel>
                              <TextField
                                fullWidth
                                name='seedling'
                                onBlur={handleBlur}
                                value={field.seedling}
                                onChange={(e) => handleChange2(e)}
                                variant="outlined"
                                size='small'
                                InputProps={{
                                  readOnly: field.typesOfPlant == 3 ? true : false
                                }}
                              />
                            </Grid>
                            : null}
                        </Grid>
                        <Grid container spacing={4}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="isActive">
                              Active
                            </InputLabel>
                            <Switch
                              checked={values.isActive}
                              onChange={handleChange}
                              name="isActive"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={9} xs={12} container justify="flex-end">
                            <Box display="flex" p={2}>
                              <Button
                                color="primary"
                                disabled={isSubmitting || isDisableButton}
                                type="submit"
                                size='small'
                                variant="contained"
                              >
                                {isUpdate == true ? "Update" : "Save"}
                              </Button>
                            </Box>
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

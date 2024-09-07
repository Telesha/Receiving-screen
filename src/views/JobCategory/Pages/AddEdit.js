import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';
import tokenService from '../../../utils/tokenDecoder';

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

const screenCode = 'JOBCATEGORY';
export default function JobCategoryAddEdit(props) {
  const [title, setTitle] = useState("Job Category Creation")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [estates, setEstates] = useState([]);
  const [estateList, setEstateList] = useState([]);
  const [jobCategory, setJobCategory] = useState({
    jobCategoryID: 0,
    groupID: 0,
    estateID: 0,
    estate: 0,
    jobCategoryCode: '',
    jobCategoryName: '',
    description: '',
    isActive: true,
  });

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app/jobCategory/listing');
  }
  const alert = useAlert();
  const { jobCategoryID } = useParams();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const [selectedOptions, setSelectedOptions] = useState([]);
  const getOptionLabel = option => `${option.label}`;
  const getOptionDisabled = option => option.value === "foo";
  const handleToggleOption = selectedOptions =>
    setSelectedOptions(selectedOptions);
  const handleClearOptions = () => setSelectedOptions([]);
  const handleSelectAll = isSelected => {
    if (isSelected) {
      setSelectedOptions(estates);
    } else {
      handleClearOptions();
    }
  };

  useEffect(() => {
    decrypted = atob(jobCategoryID.toString());
    if (decrypted != 0) {
      trackPromise(getJobCategoryDetailsJobCategoryID(decrypted));
    }
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    getEstateDetailsByGroupID();
    getEstateDetailsForUpdateByGroupID();
  }, [jobCategory.groupID]);

  useEffect(() => {
    findInitialEstate();
  }, [estates]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  };

  async function getEstateDetailsByGroupID() {
    let response = await services.getEstateDetailsByGroupID(jobCategory.groupID);
    var newOptionArray = [];
    for (var i = 0; i < response.length; i++) {
      newOptionArray.push({ label: response[i].estateName, value: response[i].estateID })
    }
    setEstates(newOptionArray);
  };

  async function getEstateDetailsForUpdateByGroupID() {
    const estate = await services.getEstateForUpdate(jobCategory.groupID);
    setEstateList(estate);
  };

  async function findInitialEstate() {
    let xx = [];
    let found = estates.find(x => x.value === parseInt(tokenService.getFactoryIDFromToken()))
    if (found != undefined) {
      xx.push({ label: found.label, value: found.value })
    }
    setSelectedOptions(xx)
  }

  async function getJobCategoryDetailsJobCategoryID(jobCategoryID) {
    let response = await services.getJobCategoryDetailsJobCategoryID(jobCategoryID);
    setTitle("Edit Job Category");
    setJobCategory({
      ...jobCategory,
      jobCategoryID: response.jobCategoryID,
      groupID: response.groupID,
      estate: response.estate,
      jobCategoryCode: response.jobCategoryCode,
      jobCategoryName: response.jobCategoryName,
      description: response.description,
      isActive: response.isActive
    });

    setIsUpdate(true);
  }

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITJOBCATEGORY');

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
      setJobCategory({
        ...jobCategory,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        estateID: parseInt(tokenService.getFactoryIDFromToken()),
      })
    }
  }

  async function saveJobCategory(values) {
    if (isUpdate == true) {
      let updateModel = {
        jobCategoryID: parseInt(atob(jobCategoryID.toString())),
        jobCategoryName: values.jobCategoryName,
        description: values.description,
        isActive: values.isActive,
        createdBy: parseInt(tokenService.getUserIDFromToken())
      }
      let response = await services.updateJobCategory(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/jobCategory/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let saveModel = {
        jobCategoryID: 0,
        groupID: parseInt(jobCategory.groupID),
        estateID: selectedOptions.map(x => (x.value).toString()),
        jobCategoryCode: jobCategory.jobCategoryCode,
        jobCategoryName: jobCategory.jobCategoryName,
        description: jobCategory.description,
        isActive: jobCategory.isActive,
        createdBy: tokenService.getUserIDFromToken(),
      }

      let response = await services.saveJobCategory(saveModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/jobCategory/listing');
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

  function handleChange1(e) {
    const target = e.target;
    const value = target.value;
    setJobCategory({
      ...jobCategory,
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
              groupID: jobCategory.groupID,
              estateID: selectedOptions,
              estate: jobCategory.estate,
              jobCategoryCode: jobCategory.jobCategoryCode,
              jobCategoryName: jobCategory.jobCategoryName,
              description: jobCategory.description,
              isActive: jobCategory.isActive,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                jobCategoryCode: Yup.string().max(30).required('Job Category Code required'),
                jobCategoryName: Yup.string().max(30).required('Job Category Name required'),
                estateID: Yup.array()
                  .when([], {
                    is: () => isUpdate != true,
                    then: Yup.array().required('Please select at least one estate').min(1, 'Please select at least one estate'),
                    otherwise: Yup.array(),
                  }),
              })
            }
            onSubmit={saveJobCategory}
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
                          <Grid item md={4} xs={12}>
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
                              value={jobCategory.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          {isUpdate == false ? (
                            <Grid item md={4} xs={12} >
                              <InputLabel shrink id="estateID">
                                Estate *
                              </InputLabel>
                              <CustomMultiSelect
                                items={estates}
                                id="estateID"
                                variant="outlined"
                                error={Boolean(touched.estateID && errors.estateID)}
                                helperText={touched.estateID && errors.estateID}
                                getOptionLabel={getOptionLabel}
                                getOptionDisabled={getOptionDisabled}
                                selectedValues={selectedOptions}
                                placeholder=""
                                selectAllLabel="Select all"
                                onToggleOption={handleToggleOption}
                                onClearOptions={handleClearOptions}
                                onSelectAll={handleSelectAll}
                                isDisabled={!permissionList.isFactoryFilterEnabled}
                              />
                            </Grid>
                          ) :
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="estate">
                                Estate *
                              </InputLabel>
                              <TextField select
                                fullWidth
                                name="estate"
                                size='small'
                                onChange={(e) => { handleChange1(e) }}
                                value={jobCategory.estate}
                                variant="outlined"
                                id="estate"
                                InputProps={{
                                  readOnly: isUpdate ? true : false
                                }}
                              >
                                <MenuItem value={0}>--Select Estate--</MenuItem>
                                {generateDropDownMenu(estateList)}
                              </TextField>
                            </Grid>}

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="jobCategoryCode">
                              Job Category code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.jobCategoryCode && errors.jobCategoryCode)}
                              fullWidth
                              helperText={touched.jobCategoryCode && errors.jobCategoryCode}
                              name="jobCategoryCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={jobCategory.jobCategoryCode}
                              size='small'
                              variant="outlined"
                              InputProps={{
                                readOnly: isUpdate
                              }}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="jobCategoryName">
                              Job Category Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.jobCategoryName && errors.jobCategoryName)}
                              fullWidth
                              helperText={touched.jobCategoryName && errors.jobCategoryName}
                              name="jobCategoryName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={jobCategory.jobCategoryName}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="description">
                              Description
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.description && errors.description)}
                              fullWidth
                              helperText={touched.description && errors.description}
                              name="description"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={jobCategory.description}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>

                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="isActive">
                              Active
                            </InputLabel>
                            <Switch
                              checked={values.isActive}
                              onChange={handleChange}
                              name="isActive"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
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

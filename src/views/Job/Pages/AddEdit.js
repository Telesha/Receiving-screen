import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, TextareaAutosize
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
import tokenService from '../../../utils/tokenDecoder';
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';

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

const screenCode = 'JOB';
export default function JobAddEdit(props) {
  const [title, setTitle] = useState("Job Creation")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [estates, setEstates] = useState([]);
  const [estateList, setEstateList] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);
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
  const [job, setJob] = useState({
    jobID: '0',
    groupID: 0,
    estateID: '0',
    estate: '0',
    jobCategoryID: '',
    jobCategoryCode: '0',
    jobCode: '',
    jobName: '',
    isActive: true,
  });

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app/job/listing');
  }
  const alert = useAlert();
  const { jobID } = useParams();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    decrypted = atob(jobID.toString());
    if (decrypted != 0) {
      trackPromise(getJobDetailsJobID(decrypted));
    }
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    getEstateDetailsByGroupID();
    getEstateDetailByGroupID()
  }, [job.groupID]);

  useEffect(() => {
    setJob({
      ...job,
      estate: selectedOptions.map(x => x.value).join(',')
    })
  }, [selectedOptions])

  useEffect(() => {
    if (isUpdate) {
      getJobCategoryDetailsByEstateID();
    } else {
      getJobCategoryDetailsByEstateIDs();
    }
  }, [job.estate]);

  useEffect(() => {
    findInitialEstate();
  }, [estates]);


  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  };

  async function getEstateDetailByGroupID() {
    const response = await services.getEstateDetailByGroupID(job.groupID);
    setEstateList(response);
  };

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(job.groupID);
    var newOptionArray = [];
    for (var i = 0; i < response.length; i++) {
      newOptionArray.push({ label: response[i].estateName, value: response[i].estateID })
    }
    setEstates(newOptionArray);
  }

  async function findInitialEstate() {
    let xx = [];
    let found = estates.find(x => x.value === parseInt(tokenService.getFactoryIDFromToken()))
    if (found != undefined) {
      xx.push({ label: found.label, value: found.value })
    }
    setSelectedOptions(xx)
  }

  async function getJobCategoryDetailsByEstateIDs() {
    var response = await services.getJobCategoryDetailsByEstateIDs(selectedOptions.map(x => x.value).join(','));
    setJobCategories(response);
  };

  async function getJobCategoryDetailsByEstateID() {
    var response = await services.getJobCategoryDetailsByEstateID(job.estateID);
    setJobCategories(response);
  };


  async function getJobDetailsJobID(jobID) {
    let response = await services.getJobDetailsJobID(jobID);
    setTitle("Edit Job");
    setJob({
      ...job,
      groupID: response.groupID,
      estateID: response.estateID,
      jobCategoryID: response.jobCategoryID,
      jobCode: response.jobCode,
      jobName: response.jobName,
      isActive: response.isActive,
    });
    setIsUpdate(true);
  }

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITJOB');

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
      setJob({
        ...job,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        estateID: parseInt(tokenService.getFactoryIDFromToken())
      })

    }
  }

  async function saveJob(values) {
    if (isUpdate == true) {
      let updateModel = {
        jobID: parseInt(atob(jobID.toString())),
        jobName: values.jobName,
        isActive: values.isActive,
        createdBy: parseInt(tokenService.getUserIDFromToken())
      }

      let response = await services.updateJob(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/job/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let saveModel = {
        jobID: 0,
        groupID: parseInt(job.groupID),
        estates: selectedOptions.map(x => (x.value).toString()),
        jobCategoryID: job.jobCategoryID,
        jobCode: job.jobCode,
        jobName: job.jobName,
        isActive: job.isActive,
        createdBy: tokenService.getUserIDFromToken(),
      }
      let response = await services.SaveJobs(saveModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/job/listing');
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
    setJob({
      ...job,
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
              groupID: job.groupID,
              estateID: job.estateID,
              estates: selectedOptions,
              jobCategoryID: job.jobCategoryID,
              jobCategoryCode: job.jobCategoryCode,
              jobCode: job.jobCode,
              jobName: job.jobName,
              isActive: job.isActive,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                estates: Yup.array()
                  .when([], {
                    is: () => isUpdate != true,
                    then: Yup.array().required('Please select at least one estate').min(1, 'Please select at least one estate'),
                    otherwise: Yup.array(),
                  }),
                jobCode: Yup.string().max(30).required('Job Code required'),
                jobCategoryID: Yup.string().max(30).required('Job Category required'),
                jobCategoryCode: Yup.string().required('Job Category  required'),
                jobName: Yup.string().max(30).required('Job Name required'),
              })
            }
            onSubmit={saveJob}
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
                              value={job.groupID}
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
                          {isUpdate ?

                            <Grid item md={4} xs={12}>
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
                                value={job.estateID}
                                variant="outlined"
                                id="estateID"
                                InputProps={{
                                  readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                                }}
                              >
                                <MenuItem value={0}>--Select Estate--</MenuItem>
                                {generateDropDownMenu(estateList)}
                              </TextField>
                            </Grid>
                            :

                            <Grid item md={4} xs={12} >
                              <InputLabel shrink id="estates">
                                Estate *
                              </InputLabel>
                              <CustomMultiSelect
                                items={estates}
                                id="estates"
                                variant="outlined"
                                error={Boolean(touched.estates && errors.estates)}
                                helperText={touched.estates && errors.estates}
                                getOptionLabel={getOptionLabel}
                                getOptionDisabled={getOptionDisabled}
                                selectedValues={selectedOptions}
                                placeholder=""
                                selectAllLabel="Select all"
                                onToggleOption={handleToggleOption}
                                onClearOptions={handleClearOptions}
                                onSelectAll={handleSelectAll}
                              />
                            </Grid>
                          }

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="jobCategoryID">
                              Job Category *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.jobCategoryID && errors.jobCategoryID)}
                              fullWidth
                              helperText={touched.jobCategoryID && errors.jobCategoryID}
                              name="jobCategoryID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={job.jobCategoryID}
                              variant="outlined"
                              id="jobCategoryID"
                              InputProps={{
                                readOnly: isUpdate
                              }}
                            >
                              <MenuItem value={0}>--Select Job Category--</MenuItem>
                              {generateDropDownMenu(jobCategories)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="jobCode">
                              Job code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.jobCode && errors.jobCode)}
                              fullWidth
                              helperText={touched.jobCode && errors.jobCode}
                              name="jobCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={job.jobCode}
                              size='small'
                              variant="outlined"
                              InputProps={{
                                readOnly: isUpdate
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="jobName">
                              Job Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.jobName && errors.jobName)}
                              fullWidth
                              helperText={touched.jobName && errors.jobName}
                              name="jobName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={job.jobName}
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
    </Fragment >
  );
};

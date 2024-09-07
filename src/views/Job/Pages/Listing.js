import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import { CustomMultiSelect } from 'src/utils/CustomMultiSelect';
import * as Yup from "yup";
import { Formik } from 'formik';

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
export default function JobListing() {
  const classes = useStyles();
  const alert = useAlert();
  const [jobData, setJobData] = useState([]);
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);
  const [isSessionStorage, setIsSessionStorage] = useState(null);
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
  const [jobList, setJobList] = useState({

    groupID: '0',
    estateID: '0',
    jobCategoryID: 0,
    estate: '0',
  })

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/job/addedit/' + encrypted);
  }

  const handleClickEdit = (jobID) => {
    encrypted = btoa(jobID.toString());
    let modelID = {
      groupID: parseInt(jobList.groupID),
      estates: selectedOptions,
      jobCategoryID: jobList.jobCategoryID,
      jobData: jobData,
    };
    sessionStorage.setItem(
      'job-listing-page-search-parameters-id',
      JSON.stringify(modelID)
    );
    navigate('/app/job/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    const IDdata = JSON.parse(
      sessionStorage.getItem('job-listing-page-search-parameters-id')
    );
    getPermissions(IDdata);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'job-listing-page-search-parameters-id'
    );
  }, []);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [jobList.groupID]);

  useEffect(() => {
    if (IDDataForDefaultLoad == null) {
      findInitialEstate();
    }
  }, [estates]);

  useEffect(() => {
    setJobList({
      ...jobList,
      estateID: '0',
      estate: selectedOptions.map(x => x.value).join(',')
    })
  }, [selectedOptions])

  useEffect(() => {
    if (jobList.estateID !== '') {
      getJobCategoryDetailsByEstateIDs();
    }
  }, [jobList.estate]);

  useEffect(() => {
    if (IDDataForDefaultLoad === null || isSessionStorage !== null) {
      setJobData([])
    }
  }, [jobList.estate]);


  useEffect(() => {
    if (IDDataForDefaultLoad === null || isSessionStorage !== null) {
      setJobData([])
    }
  }, [jobList.jobCategoryID]);

  async function getPermissions(IDdata) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWJOB');

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

    const isInitialLoad = IDdata === null;
    if (isInitialLoad) {
      setJobList({
        ...jobList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        estateID: parseInt(tokenService.getFactoryIDFromToken()),
      })
    }
    else {
      setJobList({
        ...jobList,
        groupID: parseInt(IDdata.groupID),
        estates: IDdata.estates,
        jobCategoryID: IDdata.jobCategoryID
      })
      setIsIDDataForDefaultLoad(IDdata)
      setSelectedOptions(IDdata.estates)
      setJobData(IDdata.jobData)
      setIsSessionStorage(IDdata)
    }
  }

  async function getJobCategoryByGroupIDEstateIDsJobCategoryID() {
    const JobItem = await services.getJobCategoryByGroupIDEstateIDsJobCategoryID(jobList.groupID, selectedOptions.map(x => x.value).join(','), jobList.jobCategoryID);
    if (JobItem.length !== 0) {
      setJobData(JobItem);
    } else {
      alert.error("No Records To Display");
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(jobList.groupID);
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


  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setJobList({
      ...jobList,
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
            isEdit={true}
            toolTiptitle={"Add Job"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Jobs"
    >
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: jobList.groupID,
            estateID: jobList.estateID,
            estates: selectedOptions,
            jobCategoryID: jobList.jobCategoryID,
            estate: jobList.estate
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Group required').min("1", 'Group is required'),
              estates: Yup.array().required('Please select at least one estate').min(1, 'Please select at least one estate'),
            })
          }
          onSubmit={() => trackPromise(getJobCategoryByGroupIDEstateIDsJobCategoryID())}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleSubmit,
            isSubmitting,
            touched,
            values,
            props
          }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={0}>
                <Card>
                  <CardHeader
                    title={cardTitle("Jobs")}
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent style={{ marginBottom: "2rem" }}>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group  *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="groupID"
                            onChange={(e) => handleChange(e)}
                            value={jobList.groupID}
                            variant="outlined"
                            size='small'
                            InputProps={{
                              readOnly: !permissionList.isGroupFilterEnabled,
                            }}
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>

                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="estates">
                            Estate *
                          </InputLabel>
                          <CustomMultiSelect
                            items={estates}
                            id="estates"
                            error={Boolean(touched.estates && errors.estates)}
                            helperText={touched.estates && errors.estates}
                            getOptionLabel={getOptionLabel}
                            getOptionDisabled={getOptionDisabled}
                            selectedValues={selectedOptions}
                            selectAllLabel="Select all"
                            onToggleOption={handleToggleOption}
                            onClearOptions={handleClearOptions}
                            onSelectAll={handleSelectAll}
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="jobCategoryID">
                            Job Category
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="jobCategoryID"
                            size='small'
                            onChange={(e) => {
                              handleChange(e)
                            }}
                            value={jobList.jobCategoryID}
                            variant="outlined"
                            id="jobCategoryID"
                          >
                            <MenuItem value={0}>--Select Job Category--</MenuItem>
                            {generateDropDownMenu(jobCategories)}
                          </TextField>
                        </Grid>
                        <Grid container justify="flex-end">
                          <Box pr={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type="submit"
                            // onClick={getJobCategoryByGroupIDEstateIDsJobCategoryID}
                            >
                              Search
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                    {jobData.length != 0 ?
                      <Box minWidth={1050}>
                        <MaterialTable
                          title="Multiple Actions Preview"
                          columns={[
                            { title: 'Estate', field: 'estateName' },
                            { title: 'Job Category', field: 'jobCategoryName' },
                            { title: 'Job Code', field: 'jobCode' },
                            { title: 'Job', field: 'jobName' },
                            { title: 'Status', field: 'isActive', render: rowData => rowData.isActive == true ? 'Active' : 'Inactive' },
                          ]}
                          data={jobData}
                          options={{
                            exportButton: false,
                            showTitle: false,
                            headerStyle: { textAlign: "left", height: '1%' },
                            cellStyle: { textAlign: "left" },
                            columnResizable: false,
                            actionsColumnIndex: -1
                          }}
                          actions={[
                            {
                              icon: 'mode',
                              tooltip: 'Edit Job',
                              onClick: (event, rowData) => { handleClickEdit(rowData.jobID) }
                            },
                          ]}
                        />
                      </Box> : null}
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

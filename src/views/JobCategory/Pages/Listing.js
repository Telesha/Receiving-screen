import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import { Formik } from 'formik';
import * as Yup from "yup";
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
export default function JobCategoryListing() {
  const classes = useStyles();
  const alert = useAlert();
  const [IDDataForDefaultLoad, setIsIDDataForDefaultLoad] = useState(null);
  const [jobData, setJobData] = useState([]);
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [jobList, setJobList] = useState({
    groupID: '0',
    estateID: '0'
  })

  const [page, setPage] = useState(0);

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/jobCategory/addedit/' + encrypted);
  }

  const handleClickEdit = (jobCategoryID, event) => {
    encrypted = btoa(jobCategoryID.toString());
    let modelID = {
      groupID: parseInt(jobList.groupID),
      estateID: jobList.estateID,
      selectedOptions: selectedOptions,
      jobData: jobData,
      page: page
    };
    sessionStorage.setItem(
      'division-listing-page-search-parameters-id',
      JSON.stringify(modelID)
    );
    navigate('/app/jobCategory/addedit/' + encrypted);
  }

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
    const IDdata = JSON.parse(
      sessionStorage.getItem('division-listing-page-search-parameters-id')
    );
    getPermissions(IDdata);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'division-listing-page-search-parameters-id'
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    if (IDDataForDefaultLoad != null) {
      getJobCategoryByGroupIDEstateIDJobCategoryID();
    }
  }, [IDDataForDefaultLoad]);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [jobList.groupID]);

  useEffect(() => {
    if (IDDataForDefaultLoad == null) {
      findInitialEstate();
    }
  }, [estates]);

  useEffect(() => {
    setJobData([]);
    setJobList({
      ...jobList,
      estateID: selectedOptions.map(x => x.value).join(',')
    })
  }, [selectedOptions]);

  async function getPermissions(IDdata) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWJOBCATEGORY');

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
    const isInitialLoad = IDdata === null
    if (isInitialLoad) {
      setJobList({
        ...jobList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        estateID: parseInt(tokenService.getFactoryIDFromToken())
      });
    }
    else {
      setJobList({
        ...jobList,
        groupID: IDdata.groupID
      });
      setSelectedOptions(IDdata.selectedOptions)
      setPage(IDdata.page)
      setIsIDDataForDefaultLoad(IDdata)
      //setJobData(IDdata.jobData)
    }
  }

  async function getJobCategoryByGroupIDEstateIDJobCategoryID() {
    const JobItem = await services.getJobCategoryByGroupIDEstateIDJobCategoryID(jobList.groupID, selectedOptions.map(x => x.value).join(','));
    if (JobItem.length !== 0) {
      setJobData(JobItem);
    } else {
      alert.error("No Records To Display")
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
            toolTiptitle={"Add Job Category"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Job Categories"
    >
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: jobList.groupID,
            estateID: selectedOptions
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Group required').min("1", 'Group required'),
              estateID: Yup.array().required('Please select at least one estate').min(1, 'Please select at least one estate')
            })
          }
          onSubmit={getJobCategoryByGroupIDEstateIDJobCategoryID}
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
                    title={cardTitle("Job Categories")}
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
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            onBlur={handleBlur}
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

                        <Grid item md={4} xs={12} >
                          <InputLabel shrink id="estateID">
                            Estate
                          </InputLabel>
                          <CustomMultiSelect
                            error={Boolean(touched.estateID && errors.estateID)}
                            fullWidth
                            helperText={touched.estateID && errors.estateID}
                            items={estates}
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

                        <Grid container justify="flex-end">
                          <Box pr={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type="submit"
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
                            { title: 'Job Category Code', field: 'jobCategoryCode' },
                            { title: 'Job Category', field: 'jobCategoryName' },
                            { title: 'Description', field: 'description' },
                            { title: 'Status', field: 'isActive', render: rowData => rowData.isActive == true ? 'Active' : 'Inactive' },
                          ]}
                          data={jobData}
                          options={{
                            exportButton: false,
                            showTitle: false,
                            headerStyle: { textAlign: "left", height: '1%' },
                            cellStyle: { textAlign: "left" },
                            columnResizable: false,
                            actionsColumnIndex: -1,
                            initialPage: page,
                          }}
                          actions={[
                            {
                              icon: 'mode',
                              tooltip: 'Edit Job',
                              onClick: (event, rowData) => { handleClickEdit(rowData.jobCategoryID, event) }
                            },
                          ]}
                          onChangePage={page => setPage(page)}
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

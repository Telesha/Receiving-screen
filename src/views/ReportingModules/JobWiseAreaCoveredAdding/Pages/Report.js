import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import DeleteIcon from '@material-ui/icons/Delete';
import CreateIcon from '@material-ui/icons/Create';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import tokenService from '../../../../utils/tokenDecoder'
import tokenDecoder from '../../../../utils/tokenDecoder';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem
} from '@material-ui/core';
import { AlertDialog } from './../../../Common/AlertDialog';
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';

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
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecord: {
    backgroundColor: "green",
  },

}));

const screenCode = 'JOBWISEAREACOVERDADDING';

export default function JobWiseAreaCoveredAdding() {
  const agriGenERPEnum = new AgriGenERPEnum();
  const [title, setTitle] = useState("Job Wise Area Covered Adding");
  const classes = useStyles();
  const [groups, setGroups] = useState([]);
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [fields, setFields] = useState([]);
  const [jobCategory, setJobCategory] = useState([]);
  const [PluckingJobType, setPluckingJobType] = useState([]);
  const [sundryJobType, setSundryJobType] = useState([]);
  const [jobWiseAreaCoveredListDetails, setJobWiseAreaCoveredListDetails] = useState([]);
  const [message, setMessage] = useState("Delete Confirmation");
  const [EnableConfirmMessage, setEnableConfirmMessage] = useState(false);
  const [jobWiseAreaCoverdID, setJobWiseAreaCoverdID] = useState();

  const [pageProps, setPageProps] = useState({
    editingID: 0,
    Edit: false,
    submitButtonName: "Add",
    pageheadername: "Job Wise Area Covered Adding "
  });
  const [jobWiseAreaCoveredDetails, setJobWiseAreaCoveredDetails] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    areaCoveredDate: new Date(),
    fieldID: 0,
    areaCoverd: 0,
    currentRound: 0.0,
    leaf: 0,
    quantity: 0,
    jobTypeID: 0,
    jobCategoryID: 0,
    numberOfEmoloyees: 0
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const [IsAddButtonDisable, setIsAddButtonDisable] = useState(false);

  useEffect(() => {
    GetJobCategory();
  }, []);

  useEffect(() => {

    trackPromise(
      getPermission()
    );

    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    if (jobWiseAreaCoveredDetails.groupID > 0) {
      trackPromise(
        getEstateDetailsByGroupID());
    }
  }, [jobWiseAreaCoveredDetails.groupID]);

  useEffect(() => {
    if (jobWiseAreaCoveredDetails.estateID > 0) {
      trackPromise(
        getDivisionDetailsByEstateID()
      )
    }
  }, [jobWiseAreaCoveredDetails.estateID]);

  useEffect(() => {
    if (jobWiseAreaCoveredDetails.estateID > 0) {
      trackPromise(getDivisionDetailsByEstateID());
    }
  }, [jobWiseAreaCoveredDetails.estateID]);

  useEffect(() => {
    if (jobWiseAreaCoveredDetails.divisionID > 0) {
      trackPromise(GetFieldDetailsByDivisionID());
    }
  }, [jobWiseAreaCoveredDetails.divisionID]);

  useEffect(() => {
    GetPluckingJobTypesByJobCategoryID();
    GetSundryJobTypesByJobCategoryID();
  }, []);


  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWJOBWISEAREACOVERDADDING');

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

    setJobWiseAreaCoveredDetails({
      ...jobWiseAreaCoveredDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.GetAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.GetEstateDetailsByGroupID(jobWiseAreaCoveredDetails.groupID);
    setEstates(response);
  };

  async function getDivisionDetailsByEstateID() {
    var response = await services.GetDivisionDetailsByEstateID(jobWiseAreaCoveredDetails.estateID);
    setDivisions(response);
  };

  async function GetFieldDetailsByDivisionID() {
    var response = await services.GetFieldDetailsByDivisionID(jobWiseAreaCoveredDetails.divisionID);
    setFields(response);
  };

  async function GetJobWiseAreaCovererdDetailsList(JobWiseAreaCoverdID) {
    var response = await services.GetJobWiseAreaCovererdDetails(JobWiseAreaCoverdID);
    setJobWiseAreaCoveredListDetails(response);
  };

  async function GetPluckingJobTypesByJobCategoryID() {
    var response = await services.GetPluckingJobTypesByJobCategoryID();
    setPluckingJobType(response);
  };

  async function GetSundryJobTypesByJobCategoryID() {
    var response = await services.GetSundryJobTypesByJobCategoryID();
    setSundryJobType(response);
  };

  function GetJobCategory() {
    const options = [
      { jobCategoryName: 'Sundry', jobCategoryID: 1 },
      { jobCategoryName: 'Pluking', jobCategoryID: 2 }
    ];
    let jobCategory = [];
    for (let item of Object.entries(options)) {
      jobCategory[item[1]["jobCategoryID"]] = item[1]["jobCategoryName"];
    }
    setJobCategory(jobCategory)
  }

  async function SaveJobWiseAreaCoverdDetails() {
    if (pageProps.Edit == true) {
      let updateModel = {
        jobWiseAreaCoverdID: parseInt(pageProps.editingID),
        areaCoverd: parseFloat(jobWiseAreaCoveredDetails.areaCoverd),
        areaCoveredDate: jobWiseAreaCoveredDetails.areaCoveredDate,
        modifiedBy: parseInt(tokenDecoder.getUserIDFromToken())

      };
      let response = await services.UpdateJobWiseAreaCoverdDetail(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        GetJobWiseAreaCovererdDetailsList(pageProps.editingID);
        ClearValues();
      }
      else {
        alert.error(response.message);
      }
    }
    else {
      let dataModel = {
        groupID: parseInt(jobWiseAreaCoveredDetails.groupID),
        estateID: parseInt(jobWiseAreaCoveredDetails.estateID),
        divisionID: parseInt(jobWiseAreaCoveredDetails.divisionID),
        areaCoverd: parseFloat(jobWiseAreaCoveredDetails.areaCoverd),
        jobTypeID: parseInt(jobWiseAreaCoveredDetails.jobTypeID),
        currentRound: parseFloat(jobWiseAreaCoveredDetails.currentRound),
        noOfEmployees: parseInt(jobWiseAreaCoveredDetails.numberOfEmoloyees),
        leafTypeID: parseFloat(jobWiseAreaCoveredDetails.leaf),
        quantity: parseFloat(jobWiseAreaCoveredDetails.quantity),
        fieldID: parseInt(jobWiseAreaCoveredDetails.fieldID),
        jobCategoryID: parseInt(jobWiseAreaCoveredDetails.jobCategoryID),
        createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
        areaCoveredDate: jobWiseAreaCoveredDetails.areaCoveredDate
      }
      let response = await services.SaveJobWiseAreaCoverdDetails(dataModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        GetJobWiseAreaCovererdDetailsList(response.data);

        ClearValues();
      }
      else {
        alert.error(response.message);
      }
    }
  }

  function ClearValues() {
    setJobWiseAreaCoveredDetails({
      groupID: 0,
      estateID: 0,
      divisionID: 0,
      areaCoveredDate: '',
      fieldID: 0,
      areaCoverd: 0,
      currentRound: 0.0,
      leaf: 0,
      quantity: 0,
      jobTypeID: 0,
      jobCategoryID: 0,
      numberOfEmoloyees: 0
    });
  }

  function EditCustomerDisbursmentTypeDetails(rowData, index) {
    let object = [...jobWiseAreaCoveredListDetails];
    setJobWiseAreaCoveredDetails({
      ...jobWiseAreaCoveredListDetails,
      groupID: (rowData.groupID),
      estateID: (rowData.estateID),
      divisionID: (rowData.divisionID),
      areaCoverd: parseFloat(rowData.areaCoverd),
      jobTypeID: (rowData.jobTypeID),
      currentRound: parseFloat(rowData.currentRound),
      numberOfEmoloyees: (rowData.noOfEmployees),
      leaf: (rowData.leafTypeID),
      quantity: parseFloat(rowData.quantity),
      fieldID: (rowData.fieldID),
      jobCategoryID: (rowData.jobCategoryID),
      areaCoveredDate: rowData.areaCoveredDate
    })
    object.splice(index, 1);
    setPageProps({
      ...pageProps,
      editingID: rowData.jobWiseAreaCoverdID,
      Edit: true,
      submitButtonName: "Update",
    })
    setJobWiseAreaCoveredListDetails(object)
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setJobWiseAreaCoveredDetails({
      ...jobWiseAreaCoveredDetails,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setJobWiseAreaCoveredDetails({
      ...jobWiseAreaCoveredDetails,
      areaCoveredDate: value
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    )
  }

  function confirmData(y) {
    if (y) {
      InActiveItem(jobWiseAreaCoverdID);
    }
  }

  async function handleConfirm(rowData) {
    setJobWiseAreaCoverdID(rowData.jobWiseAreaCoverdID);
    setEnableConfirmMessage(true);
  }

  async function InActiveItem(jobWiseAreaCoverdID) {
    const response = await services.InActiveJobWiseAreaCoverdDetails(parseInt(jobWiseAreaCoverdID));
    if ((response.statusCode == "Success")) {
      alert.success('Job Wise Area Covered Details InActive successfully');
      ClearValues();
      setJobWiseAreaCoveredListDetails([]);
    } else {
      alert.error('Error occured in InActive');
    }
  }

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: jobWiseAreaCoveredDetails.groupID,
              factoryID: jobWiseAreaCoveredDetails.factoryID,
              divisionID: jobWiseAreaCoveredDetails.divisionID,
              fieldID: jobWiseAreaCoveredDetails.fieldID,
              areaCoverd: jobWiseAreaCoveredDetails.areaCoverd,
              jobCategoryID: jobWiseAreaCoveredDetails.jobCategoryID,
              jobTypeID: jobWiseAreaCoveredDetails.jobTypeID,
              areaCoveredDate: jobWiseAreaCoveredDetails.areaCoveredDate,
              currentRound: jobWiseAreaCoveredDetails.currentRound,
              leafTypeID: jobWiseAreaCoveredDetails.leafTypeID,
              quantity: jobWiseAreaCoveredDetails.quantity,
              numberOfEmoloyees: jobWiseAreaCoveredDetails.numberOfEmoloyees

            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                divisionID: Yup.number().required('Division is required').min("1", 'Division is required'),
                jobCategoryID: Yup.number().required('Job Category is required').min("1", 'Job Category is required'),
                jobTypeID: Yup.number().required('Job TypeID is required').min("1", 'Job TypeID is required'),
                areaCoveredDate: Yup.string().required('Area CoveredDate is required').min("1", 'Area CoveredDate is required'),
              })
            }
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
                              value={jobWiseAreaCoveredDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              disabled={!permissionList.isGroupFilterEnabled}
                              InputProps={{
                                readOnly: pageProps.Edit
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={jobWiseAreaCoveredDetails.estateID}
                              variant="outlined"
                              size='small'
                              id="estateID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              InputProps={{
                                readOnly: pageProps.Edit
                              }}
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Division *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="divisionID"
                              onChange={(e) => handleChange(e)}
                              value={jobWiseAreaCoveredDetails.divisionID}
                              variant="outlined"
                              size='small'
                              id="divisionID"
                              InputProps={{
                                readOnly: pageProps.Edit
                              }}
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="fieldID">
                              Field
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.fieldID && errors.fieldID)}
                              fullWidth
                              helperText={touched.fieldID && errors.fieldID}
                              name="fieldID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={jobWiseAreaCoveredDetails.fieldID}
                              variant="outlined"
                              id="fieldID"
                              InputProps={{
                                readOnly: pageProps.Edit
                              }}
                            >
                              <MenuItem value={'0'}>--Select Field--</MenuItem>
                              {generateDropDownMenu(fields)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="areaCoveredDate">
                              Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.areaCoveredDate && errors.areaCoveredDate)}
                                helperText={touched.areaCoveredDate && errors.areaCoveredDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                size='small'
                                margin="dense"
                                name="areaCoveredDate"
                                id="areaCoveredDate"
                                value={jobWiseAreaCoveredDetails.areaCoveredDate}
                                onChange={(e) => {
                                  handleDateChange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change areaCoveredDate',
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="jobCategoryID">
                              Job Category *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="jobCategoryID"
                              onChange={(e) => handleChange(e)}
                              value={jobWiseAreaCoveredDetails.jobCategoryID}
                              variant="outlined"
                              id="jobCategoryID"
                              size='small'
                              InputProps={{
                                readOnly: pageProps.Edit
                              }}
                            >
                              <MenuItem value="0">--Select Job Category--</MenuItem>
                              {generateDropDownMenu(jobCategory)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="jobTypeID">
                              Job Type *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="jobTypeID"
                              onChange={(e) => handleChange(e)}
                              value={jobWiseAreaCoveredDetails.jobTypeID}
                              variant="outlined"
                              id="jobTypeID"
                              size='small'
                              InputProps={{
                                readOnly: pageProps.Edit
                              }}
                            >
                              <MenuItem value="0">--Select Job Type--</MenuItem>
                              {generateDropDownMenu(jobWiseAreaCoveredDetails.jobCategoryID == agriGenERPEnum.JobTypeID.Sundry ? sundryJobType : PluckingJobType)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="areaCoverd">
                              Area Covered(Hectares) *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="areaCoverd"
                              onChange={(e) => handleChange(e)}
                              value={jobWiseAreaCoveredDetails.areaCoverd}
                              variant="outlined"
                              size='small'
                              id="areaCoverd"
                              type="text"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="currentRound">
                              Current Round *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="currentRound"
                              onChange={(e) => handleChange(e)}
                              value={jobWiseAreaCoveredDetails.currentRound}
                              variant="outlined"
                              id="currentRound"
                              size='small'
                              type="text"
                              disabled={jobWiseAreaCoveredDetails.jobCategoryID == agriGenERPEnum.JobTypeID.Sundry}
                              InputProps={{
                                readOnly: pageProps.Edit
                              }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="leaf">
                              Leaf
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="leaf"
                              onChange={(e) => handleChange(e)}
                              value={jobWiseAreaCoveredDetails.leaf}
                              variant="outlined"
                              size='small'
                              id="leaf"
                              disabled={jobWiseAreaCoveredDetails.jobCategoryID == agriGenERPEnum.JobTypeID.Sundry}
                              InputProps={{
                                readOnly: pageProps.Edit
                              }}
                            >
                              <MenuItem value="0">--Select Leaf Type--</MenuItem>
                              <MenuItem value="1">Green Leaf</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="quantity">
                              Quantity
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="quantity"
                              onChange={(e) => handleChange(e)}
                              value={jobWiseAreaCoveredDetails.quantity}
                              variant="outlined"
                              size='small'
                              id="quantity1"
                              type="text"
                              disabled={jobWiseAreaCoveredDetails.jobCategoryID == agriGenERPEnum.JobTypeID.Sundry}
                              InputProps={{
                                readOnly: pageProps.Edit
                              }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="numberOfEmoloyees">
                              Sundry Count
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="numberOfEmoloyees"
                              onChange={(e) => handleChange(e)}
                              value={jobWiseAreaCoveredDetails.numberOfEmoloyees}
                              variant="outlined"
                              size='small'
                              id="numberOfEmoloyees"
                              type="text"
                              disabled={jobWiseAreaCoveredDetails.jobCategoryID == agriGenERPEnum.JobTypeID.Plucking}
                              InputProps={{
                                readOnly: pageProps.Edit
                              }}
                            >
                            </TextField>
                          </Grid>
                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="outlined"
                                type="reset"
                                onClick={ClearValues}
                                size='small'
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
                                onClick={SaveJobWiseAreaCoverdDetails}
                              >
                                {pageProps.submitButtonName}
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box minWidth={1050}>
                        {jobWiseAreaCoveredListDetails.length > 0 ?
                          <Grid item xs={12}>
                            <TableContainer >
                              <Table className={classes.table} aria-label="caption table">
                                <TableHead>
                                  <TableRow>
                                    <TableCell align="center" style={{ fontWeight: "bold" }}>Field</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold" }}>Job Category</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold" }}>Job Type</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold" }}>Area Covedred(Hectare)</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold" }}>Date</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold" }}>Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {jobWiseAreaCoveredListDetails.map((rowData, index) => (
                                    <TableRow key={index}>
                                      <TableCell component="th" align="center" scope="row" style={{ borderBottom: "none" }}>
                                        {(rowData.fieldName)}
                                      </TableCell>
                                      <TableCell component="th" align="center" scope="row" style={{ borderBottom: "none" }}>
                                        {(rowData.jobCategoryID == 1 ? "Sundry" : "Plucking")}
                                      </TableCell>
                                      <TableCell component="th" align="center" scope="row" style={{ borderBottom: "none" }}>
                                        {rowData.jobTypeName}
                                      </TableCell>
                                      <TableCell component="th" align="center" scope="row" style={{ borderBottom: "none" }}>
                                        {(rowData.areaCoverd)}
                                      </TableCell>
                                      <TableCell component="th" align="center" scope="row" style={{ borderBottom: "none" }}>
                                        {(rowData.areaCoveredDate).split('T')[0]}
                                      </TableCell>
                                      <TableCell component="th" align="center" scope="row" style={{ borderBottom: "none" }}>
                                        <DeleteIcon
                                          style={{
                                            color: "red",
                                            cursor: "pointer"
                                          }}
                                          size="small"
                                          onClick={() => handleConfirm(index, rowData)}>
                                        </DeleteIcon>
                                        <CreateIcon
                                          style={{
                                            cursor: "pointer",
                                            marginLeft: "1rem"
                                          }}
                                          size="small"
                                          onClick={() => EditCustomerDisbursmentTypeDetails(rowData, index)}
                                        />
                                      </TableCell >
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                          : null}
                      </Box>
                      <Grid container justify="flex-end">
                      </Grid>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
        <div hidden={true}>
          <Grid item>
            <AlertDialog confirmData={confirmData} headerMessage={message} viewPopup={EnableConfirmMessage}
              discription={"Are you sure want to Delete Job Wise Area Covered details ?"} setViewPopup={setEnableConfirmMessage} />
          </Grid>
        </div>
      </Page>
    </Fragment>
  )
}
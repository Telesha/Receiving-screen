import React, { useState, useEffect, Fragment } from 'react';
import { useAlert } from 'react-alert';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Button,
  CardContent,
  Divider,
  InputLabel,
  MenuItem,
  Chip
} from '@material-ui/core';
import services from '../../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingComponent } from '../../../../utils/newLoader';
import Typography from '@material-ui/core/Typography';
import lodash from 'lodash';
import DeleteIcon from '@material-ui/icons/Delete';
import { AlertDialog } from './../../../Common/AlertDialog';

const useStyles = makeStyles(theme => ({
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
    backgroundColor: 'red'
  },
  colorRecord: {
    backgroundColor: 'green'
  },
  bold: {
    fontWeight: 600
  }
}));

const screenCode = 'COPREPORT';

export default function COPSectionCreation(data) {
  const navigate = useNavigate();
  const alert = useAlert();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [COPDetails, setCOPDetails] = useState({
    groupID: 0,
    factoryID: 0,
    parentSectionID: 0,
    childSectionName: '',
    parentSectionName: '',
    description: ''
  });

  const [ParentSectionNameList, setParentSectionNameList] = useState();
  const [CreatedSectionNameList, setCreatedSectionNameList] = useState();
  const [parentSectionList, setParentSectionList] = useState([])
  const [childSectionNames, setChildSectionNames] = useState([])
  const [message, setMessage] = useState('  Are you sure you want to delete?');
  const [EnableConfirmMessage, setEnableConfirmMessage] = useState(false);
  const [SectionIdToRemove, setSectionIdToRemove] = useState(0);

  useEffect(() => {
    trackPromise(getPermission());
  }, []);

  useEffect(() => {
    if (data.data.factoryID != 0) {
      trackPromise(GetParentSectionDetails());
    }

  }, [data.data.factoryID]);

  // useEffect(() => {
  //   const DecryptedGroupID = atob(groupID.toString());
  //   const DecryptedFactoryID = atob(factoryID.toString());

  //   setCOPDetails({
  //     ...COPDetails,
  //     groupID: parseInt(DecryptedGroupID),
  //     factoryID: parseInt(DecryptedFactoryID)
  //   });
  // }, []);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWCOPREPORTCONFIGURATION'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });
  }

  async function GetParentSectionDetails() {
    const response = await services.GetParentSectionDetails(
      data.data.groupID, data.data.factoryID
    );
    setParentSectionList(response.data)
    var parentSectionList = [];
    for (let item of Object.entries(response.data)) {
      parentSectionList[item[1]['copParentSectionID']] =
        item[1]['copParentSectionName'];
    }
    setParentSectionNameList(parentSectionList);
  }

  async function SaveprofitAndLossSetupDetails() {
    let requestModel = {
      // groupID: (data),
      // factoryID: (factoryID),
      parentSectionID: parseInt(COPDetails.parentSectionID),
      childSectionName: COPDetails.childSectionName.toString(),
      createdBy: parseInt(tokenService.getUserIDFromToken())
    };

    var nameDuplicate = false;
    for (var index = 0; index < childSectionNames.length; index++) {
      if (childSectionNames[index].copChildSectionName === COPDetails.childSectionName.toString()) {
        alert.error("CHILD SECTION NAME ALREADY EXISTS");
        nameDuplicate = true;
        break;
      }
    }
    if (!nameDuplicate) {
      const response = await services.ChildSectionCreation(requestModel);
      if (response.statusCode == 'Success') {
        trackPromise(COPCreatedSectionDetails(COPDetails.parentSectionID));
        alert.success(response.message);
        ClearAllArrays();
      } else {
        alert.error(response.message);
      }
    }
  }

  async function SaveNewParentName() {

    if (data.data.groupID > 0 && data.data.factoryID > 0) {
      let model = {
        groupID: data.data.groupID,
        factoryID: data.data.factoryID,
        copParentSectionName: COPDetails.parentSectionName.toString(),
        description: COPDetails.description.toString(),
        createdBy: parseInt(tokenService.getUserIDFromToken())
      };

      var nameDuplicate = false;
      for (var index = 0; index < parentSectionList.length; index++) {
        if (parentSectionList[index].copParentSectionName === COPDetails.parentSectionName.toString()) {
          alert.error("PARENT SECTION NAME ALREADY EXISTS");
          nameDuplicate = true;
          break;
        }
      }

      if (!nameDuplicate) {
        const response = await services.SaveNewParentSection(model);
        if (response.statusCode == 'Success') {
          trackPromise(
            COPCreatedSectionDetails(COPDetails.parentSectionID),
            GetParentSectionDetails()
          );
          alert.success(response.message);
          ClearAllArrays();
        } else {
          alert.error(response.message);
        }
      }
    }

  }

  function ClearAllArrays() {
    setCOPDetails({
      ...COPDetails,
      childSectionName: '',
      parentSectionName: '',
      description: ''
    });
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setCOPDetails({
      ...COPDetails,
      [e.target.name]: value
    });
  }

  async function COPCreatedSectionDetails(parentsectionID) {
    const response = await services.GetChildSectionNames(data.data.groupID, data.data.factoryID, parentsectionID);
    setChildSectionNames(response.data)
    const respose = await services.COPCreatedSectionDetails(parentsectionID);

    if (respose.data !== null || respose.data.length > 0) {
      var result = lodash(respose.data)
        .groupBy(x => x.copParentSectionName)
        .map((value, key) => ({ copParentSectionName: key, dataList: value }))
        .value();
      setCreatedSectionNameList(result);
    } else {
      alert.error('Please configure  Section names');
    }
  }

  async function HandleDelete(e) {
    setSectionIdToRemove(parseInt(e.toString()));
    setEnableConfirmMessage(true);
  }

  function confirmData(y) {
    if (y) {
      trackPromise(InActiveCOPChildSections());
    }
  }

  async function InActiveCOPChildSections() {
    let resuestModel = {
      sectionID: parseInt(SectionIdToRemove.toString()),
      modifiedBy: parseInt(await tokenService.getUserIDFromToken().toString())
    };
    const response = await services.InActiveCOPChildSections(resuestModel);

    if (response.statusCode == 'Success') {
      alert.success(response.message);
      trackPromise(COPCreatedSectionDetails(COPDetails.parentSectionID));
      if (CreatedSectionNameList == null || CreatedSectionNameList === undefined) {
        ClearAllArrays();
      }
    } else {
      alert.error(response.message);
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Formik
        initialValues={{
          parentSectionName: COPDetails.parentSectionName
        }}
        validationSchema={
          Yup.object().shape({
            parentSectionName: Yup.string().required('Parent Section Name is required')
          })
        }
        onSubmit={() => trackPromise(SaveNewParentName())}
        enableReinitialize
      >
        {({ errors, handleBlur, handleSubmit, touched }) => (
          <form onSubmit={handleSubmit}>
            <Box mt={0}>
              <Card>
                <PerfectScrollbar>
                  <Divider />
                  <CardContent>

                    <br></br>
                    <InputLabel style={{ fontSize: '20px', fontWeight: 'bold' }} shrink id="parentSectionName">
                      Create New Parent Section
                    </InputLabel>
                    <br></br>
                    <Grid container spacing={3}>

                      <Grid item md={4} xs={12}>

                        <InputLabel shrink id="parentSectionName">
                          Parent Section *
                        </InputLabel>
                        <TextField
                          error={Boolean(
                            touched.parentSectionName &&
                            errors.parentSectionName
                          )}
                          fullWidth
                          helperText={
                            touched.parentSectionName &&
                            errors.parentSectionName
                          }
                          name="parentSectionName"
                          onBlur={handleBlur}
                          onChange={e => {
                            handleChange(e);
                          }}
                          value={COPDetails.parentSectionName}
                          variant="outlined"
                          id="parentSectionName"
                          size='small'
                        />
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <InputLabel shrink id="description">
                          Description
                        </InputLabel>
                        <TextField
                          error={Boolean(
                            touched.description &&
                            errors.description
                          )}
                          fullWidth
                          helperText={
                            touched.description &&
                            errors.description
                          }
                          name="description"
                          onBlur={handleBlur}
                          onChange={e => {
                            handleChange(e);
                          }}
                          value={COPDetails.description}
                          variant="outlined"
                          id="description"
                          size='small'
                        />
                      </Grid>
                    </Grid>
                    <Box display="flex" flexDirection="row-reverse" p={2}>
                      <Button
                        color="primary"
                        type="submit"
                        variant="contained"
                        size='small'
                      >
                        Create
                      </Button>
                    </Box>
                    <div hidden={true}>
                      <Grid item>
                        <AlertDialog
                          confirmData={confirmData}
                          headerMessage={message}
                          viewPopup={EnableConfirmMessage}
                          setViewPopup={setEnableConfirmMessage}
                        />
                      </Grid>
                    </div>
                  </CardContent>
                </PerfectScrollbar>
              </Card>
            </Box>
          </form>
        )}
      </Formik>
      <Formik
        initialValues={{
          parentSectionID: COPDetails.parentSectionID,
          childSectionName: COPDetails.childSectionName,
          groupID: COPDetails.groupID,
          factoryID: COPDetails.factoryID,
        }}
        validationSchema={
          Yup.object().shape({
            groupID: Yup.string().required('Group is required').min("1", 'Group is required'),
            factoryID: Yup.string().required('Factory is required').min("1", 'Factory is required'),
            parentSectionID: Yup.number().required('Parent Section Name is required').min("1", 'Parent Section Name is required'),
            childSectionName: Yup.string().required('Chlid Section Name is required')
          })
        }
        onSubmit={() => trackPromise(SaveprofitAndLossSetupDetails())}
        enableReinitialize
      >
        {({ errors, handleBlur, handleSubmit, touched }) => (
          <form onSubmit={handleSubmit}>
            <Box mt={0}>
              <Card>
                <PerfectScrollbar>
                  <Divider />
                  <CardContent>
                    <br></br>
                    <InputLabel style={{ fontSize: '20px', fontWeight: 'bold' }} shrink id="parentSectionName">
                      Create New Child Section
                    </InputLabel>
                    <br></br>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <InputLabel shrink id="parentSectionID">
                          Parent Section Name *
                        </InputLabel>
                        <TextField
                          select
                          error={Boolean(
                            touched.parentSectionID && errors.parentSectionID
                          )}
                          fullWidth
                          helperText={
                            touched.parentSectionID && errors.parentSectionID
                          }
                          name="parentSectionID"
                          onBlur={handleBlur}
                          onChange={e => {
                            handleChange(e);
                            trackPromise(
                              COPCreatedSectionDetails(e.target.value)
                            );
                          }}
                          value={COPDetails.parentSectionID}
                          variant="outlined"
                          id="parentSectionID"
                          size='small'
                        >
                          <MenuItem value="0">
                            --Select Parent Section Name--
                          </MenuItem>
                          {generateDropDownMenu(ParentSectionNameList)}
                        </TextField>
                      </Grid>
                      <Grid item md={4} xs={12}>
                        <InputLabel shrink id="childSectionName">
                          Child Section Name *
                        </InputLabel>
                        <TextField
                          error={Boolean(
                            touched.childSectionName &&
                            errors.childSectionName
                          )}
                          fullWidth
                          helperText={
                            touched.childSectionName &&
                            errors.childSectionName
                          }
                          name="childSectionName"
                          onBlur={handleBlur}
                          onChange={e => {
                            handleChange(e);
                          }}
                          value={COPDetails.childSectionName}
                          variant="outlined"
                          id="childSectionName"
                          size='small'
                        />
                      </Grid>
                    </Grid>
                    <Box display="flex" flexDirection="row-reverse" p={2}>
                      <Button
                        color="primary"
                        type="submit"
                        variant="contained"
                        size='small'
                      >
                        Create
                      </Button>
                    </Box>
                    <Divider />
                    <br></br>
                    <br></br>
                    <Box style={{ marginTop: '0.5rem', marginLeft: '20%' }}>
                      {(CreatedSectionNameList !== undefined)
                        ? CreatedSectionNameList.map(objNew => (

                          <Grid Grid container spacing={1}>
                            <Typography
                              variant="h5"
                              style={{ marginLeft: '10rem' }}
                              align="left"
                            >
                              <Chip label={objNew.copParentSectionName} />
                            </Typography>
                            {objNew.dataList !== undefined
                              ? objNew.dataList.map(object => (

                                <Grid
                                  Grid
                                  container
                                  spacing={1}
                                  style={{ marginTop: '0.1rem' }}
                                >
                                  {object.copChildSectionID != 0 ? (
                                    <Grid item md={9} xs={12}>
                                      <Typography
                                        style={{ marginLeft: '15rem' }}
                                        align="left"
                                      >
                                        <Chip
                                          label={object.copChildSectionName}
                                          key={object.copChildSectionID}
                                          variant="outlined"
                                          deleteIcon={
                                            <DeleteIcon
                                              style={{
                                                color: 'red',
                                                cursor: 'pointer'
                                              }}
                                            />
                                          }
                                          onDelete={() =>
                                            trackPromise(
                                              HandleDelete(
                                                object.copChildSectionID
                                              )
                                            )
                                          }
                                        />
                                      </Typography>
                                    </Grid>
                                  ) : null}
                                </Grid>
                              ))
                              : null}
                          </Grid>
                        ))
                        : null}
                    </Box>
                  </CardContent>
                </PerfectScrollbar>
              </Card>
            </Box>
          </form>
        )}
      </Formik>
    </Fragment>
  );
}

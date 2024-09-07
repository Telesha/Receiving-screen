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
import { AlertDialog } from '../../../Common/AlertDialog';

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

const screenCode = 'CASHFLOW';

export default function CashFlowSectionCreation(props) {
  const navigate = useNavigate();
  const alert = useAlert();
  const { groupID } = useParams();
  const { factoryID } = useParams();
  const classes = useStyles();
  const [title, setTitle] = useState('Cash Flow Setup');
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const handleClickNavigate = () => {
    navigate('/app/CashFlow/CashFlowReport');
  };
  const [CashFlowDetails, setCashFlowDetails] = useState({
    groupID: 0,
    factoryID: 0,
    parentSectionID: 0,
    childSectionName: '',
    parentSectionName: '',
    description: ''
  });

  const [ParentSectionNameList, setParentSectionNameList] = useState();
  const [ParentSectionNameList2, setParentSectionNameList2] = useState();
  const [CreatedSectionNameList, setCreatedSectionNameList] = useState();
  const [message, setMessage] = useState('Are you sure you want to delete?');
  const [EnableConfirmMessage, setEnableConfirmMessage] = useState(false);
  const [EnableConfirmMessage2, setEnableConfirmMessage2] = useState(false);
  const [SectionIdToRemove, setSectionIdToRemove] = useState(0);
  const [SectionIdToRemove2, setSectionIdToRemove2] = useState(0);
  const [parentSectionList, setParentSectionList] = useState([])
  const [childSectionNames, setChildSectionNames] = useState([])

  useEffect(() => {
    const DecryptedGroupID = atob(groupID.toString());
    const DecryptedFactoryID = atob(factoryID.toString());

    setCashFlowDetails({ ...CashFlowDetails, groupID: parseInt(DecryptedGroupID), factoryID: parseInt(DecryptedFactoryID) });

    trackPromise(getPermission());
    trackPromise(GetParentSectionDetails(parseInt(DecryptedGroupID), parseInt(DecryptedFactoryID)));
    trackPromise(GetParentSectionDetailsForTable());
  }, []);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWCONFIGURATIONCHASHFLOW'
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

  async function GetParentSectionDetailsForTable() {
    const respose = await services.GetParentSectionDetails(
      CashFlowDetails.groupID,
      CashFlowDetails.factoryID
    );
    setParentSectionNameList2(respose);
  }

  async function GetParentSectionDetails(groupid, factoryid) {
    var parentSectionList = [];
    const respose = await services.GetParentSectionDetails(groupid, factoryid);
    setParentSectionList(respose)
    for (let item of Object.entries(respose)) {
      parentSectionList[item[1]['cashFlowParentSectionID']] = item[1]['cashFlowParentSectionName'];
    }
    setParentSectionNameList(parentSectionList);
  }

  async function SaveprofitAndLossSetupDetails() {
    let requestModel = {
      groupID: parseInt(CashFlowDetails.groupID),
      factoryID: parseInt(CashFlowDetails.factoryID),
      parentSectionID: parseInt(CashFlowDetails.parentSectionID),
      childSectionName: CashFlowDetails.childSectionName.toString(),
      createdBy: parseInt(tokenService.getUserIDFromToken())
    };
    var nameDuplicate = false;
    for (var index = 0; index < childSectionNames.length; index++) {
      if (childSectionNames[index].cashFlowChildSectionName === CashFlowDetails.childSectionName.toString()) {
        alert.error("CHILD SECTION NAME ALREADY EXISTS");
        nameDuplicate = true;
        break;
      }
    }
    if (!nameDuplicate) {
      const response = await services.ChildSectionCreation(requestModel);
      if (response.statusCode == 'Success') {
        trackPromise(CashFlowCreatedSectionDetails(CashFlowDetails.parentSectionID));
        alert.success(response.message);
        ClearAllArrays();
      } else {
        alert.error(response.message);
      }
    }
  }

  async function SaveNewParentName() {
    let model = {
      cashFlowParentSectionName: CashFlowDetails.parentSectionName.toString(),
      description: CashFlowDetails.description.toString(),
      groupId: parseInt(CashFlowDetails.groupID),
      factoryId: parseInt(CashFlowDetails.factoryID),
      createdBy: parseInt(tokenService.getUserIDFromToken())
    };
    var nameDuplicate = false;
    for (var index = 0; index < parentSectionList.length; index++) {
      if (parentSectionList[index].cashFlowParentSectionName === CashFlowDetails.parentSectionName.toString()) {
        alert.error("PARENT SECTION NAME ALREADY EXISTS");
        nameDuplicate = true;
        break;
      }
    }
    if (!nameDuplicate) {
      const response = await services.SaveNewParentSection(model);
      if (response.statusCode == 'Success') {
        trackPromise(
          GetParentSectionDetails(parseInt(CashFlowDetails.groupID), parseInt(CashFlowDetails.factoryID))
        );
        alert.success(response.message);
        ClearAllArrays();
      } else {
        alert.error(response.message);
      }
    }
  }

  function ClearAllArrays() {
    setCashFlowDetails({
      ...CashFlowDetails,
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
    setCashFlowDetails({
      ...CashFlowDetails,
      [e.target.name]: value
    });
  }

  async function CashFlowCreatedSectionDetails(parentsectionID) {
    const response = await services.GetChildSectionNames(CashFlowDetails.groupID, CashFlowDetails.factoryID, parentsectionID);
    setChildSectionNames(response.data)
    if (parentsectionID != 0) {
      const respose = await services.CashFlowCreatedSectionDetails(parentsectionID);

      if (respose.data !== null || respose.data.length > 0) {
        var result = lodash(respose.data)
          .groupBy(x => x.cashFlowParentSectionName)
          .map((value, key) => ({ cashFlowParentSectionName: key, dataList: value }))
          .value();

        setCreatedSectionNameList(result);
      } else {
        alert.error('Please configure section names');
      }
    }
  }

  async function HandleDelete(e) {
    setSectionIdToRemove(parseInt(e.toString()));
    setEnableConfirmMessage(true);
  }

  function confirmData(y) {
    if (y) {
      trackPromise(InActiveCashFlowChildSections());
    }
  }

  async function InActiveCashFlowChildSections() {
    let resuestModel = {
      sectionID: parseInt(SectionIdToRemove.toString()),
      modifiedBy: parseInt(await tokenService.getUserIDFromToken().toString())
    };
    const response = await services.InActiveCashFlowChildSections(resuestModel);

    if (response.statusCode == 'Success') {
      alert.success(response.message);
      trackPromise(CashFlowCreatedSectionDetails(CashFlowDetails.parentSectionID));
    } else {
      alert.error(response.message);
    }
  }


  function confirmDataAlert(y) {
    if (y) {
      trackPromise(InActiveCashFlowParentSections());
    }
  }

  async function InActiveCashFlowParentSections() {
    let resuestModel = {
      sectionID: parseInt(SectionIdToRemove2.toString()),
      modifiedBy: parseInt(await tokenService.getUserIDFromToken().toString())
    };
    const response = await services.InActiveCashFlowParentSections(resuestModel);

    if (response.statusCode == 'Success') {
      alert.success(response.message);
      setCashFlowDetails({
        ...CashFlowDetails,
        parentSectionID: 0
      });
      trackPromise(GetParentSectionDetailsForTable(), GetParentSectionDetails());
    } else {
      alert.error(response.message);
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Formik
        initialValues={{
          parentSectionName: CashFlowDetails.parentSectionName
        }}
        validationSchema={Yup.object().shape({
          parentSectionName: Yup.string().required('Parent Section Name is required')
        })}
        onSubmit={() => trackPromise(SaveNewParentName())}
        enableReinitialize
      >
        {({ errors, handleBlur, handleSubmit, touched }) => (
          <form onSubmit={handleSubmit}>
            <Box mt={0}>
              <Card>
                <PerfectScrollbar>
                  <Divider />
                  <br></br>
                  <InputLabel style={{ fontSize: '20px', fontWeight: 'bold', marginLeft: '20px' }} shrink id="parentSectionName">
                    Parent and Child Section Creation
                  </InputLabel>
                  <br></br>
                  <CardContent>
                    <Card variant="outlined">
                      <br></br>
                      <Grid container spacing={3} style={{ marginLeft: '5px' }}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="parentSectionName">
                            Create new Parent Section *
                          </InputLabel>
                          <TextField
                            error={Boolean(
                              touched.parentSectionName &&
                              errors.parentSectionName
                            )}
                            fullWidth
                            size='small'
                            helperText={
                              touched.parentSectionName &&
                              errors.parentSectionName
                            }
                            name="parentSectionName"
                            onBlur={handleBlur}
                            onChange={e => {
                              handleChange(e);
                            }}
                            value={CashFlowDetails.parentSectionName}
                            variant="outlined"
                            id="parentSectionName"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="description">
                            Description
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
                            name="description"
                            size='small'
                            onBlur={handleBlur}
                            onChange={e => {
                              handleChange(e);
                            }}
                            value={CashFlowDetails.description}
                            variant="outlined"
                            id="description"
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
                    </Card>
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
                    <div hidden={true}>
                      <Grid item>
                        <AlertDialog
                          confirmData={confirmDataAlert}
                          headerMessage={message}
                          viewPopup={EnableConfirmMessage2}
                          setViewPopup={setEnableConfirmMessage2}
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
          parentSectionID: CashFlowDetails.parentSectionID,
          childSectionName: CashFlowDetails.childSectionName
        }}
        validationSchema={Yup.object().shape({
          parentSectionID: Yup.number().required('Parent Section Name is required').min('1', 'Parent Section Name is required'),
          childSectionName: Yup.string().required('Child Section Name is required')
        })}
        onSubmit={() => trackPromise(SaveprofitAndLossSetupDetails())}
        enableReinitialize
      >
        {({ errors, handleBlur, handleSubmit, touched }) => (
          <form onSubmit={handleSubmit}>
            <Box mt={0}>
              <Card>
                <PerfectScrollbar>
                  <CardContent>
                    <br></br>
                    <Card variant="outlined">
                      <br></br>
                      <Grid container spacing={3} style={{ marginLeft: '5px' }}>
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
                            size='small'
                            helperText={
                              touched.parentSectionID && errors.parentSectionID
                            }
                            name="parentSectionID"
                            onBlur={handleBlur}
                            onChange={e => {
                              handleChange(e);
                              trackPromise(
                                CashFlowCreatedSectionDetails(e.target.value)
                              );
                            }}
                            value={CashFlowDetails.parentSectionID}
                            variant="outlined"
                            id="parentSectionID"
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
                            size='small'
                            helperText={
                              touched.childSectionName &&
                              errors.childSectionName
                            }
                            name="childSectionName"
                            onBlur={handleBlur}
                            onChange={e => {
                              handleChange(e);
                            }}
                            value={CashFlowDetails.childSectionName}
                            variant="outlined"
                            id="childSectionName"
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
                    </Card>
                    <Box style={{ marginTop: '0.5rem', marginLeft: '20%' }}>
                      {CreatedSectionNameList !== undefined && CashFlowDetails.parentSectionID != 0
                        ? CreatedSectionNameList.map(objNew => (
                          <Grid Grid container spacing={1}>
                            <Typography
                              variant="h5"
                              style={{ marginLeft: '10rem' }}
                              align="left"
                            >
                              <Chip label={objNew.cashFlowParentSectionName} />
                            </Typography>
                            {objNew.dataList !== undefined
                              ? objNew.dataList.map(object => (
                                <Grid
                                  Grid
                                  container
                                  spacing={1}
                                  style={{ marginTop: '0.1rem' }}
                                >
                                  <Grid item md={9} xs={12}>
                                    <Typography
                                      style={{ marginLeft: '15rem' }}
                                      align="left"
                                    >
                                      <Chip
                                        label={object.cashFlowChildSectionName}
                                        key={object.cashFlowChildSectionID}
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
                                              object.cashFlowChildSectionID
                                            ))
                                        }
                                      />
                                    </Typography>
                                  </Grid>
                                </Grid>
                              ))
                              : null}
                          </Grid>
                        ))
                        : null}
                    </Box></CardContent>
                </PerfectScrollbar>
              </Card>
            </Box>
          </form>)
        }
      </Formik>
    </Fragment>
  );
}

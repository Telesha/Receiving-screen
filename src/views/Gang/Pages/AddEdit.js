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

const screenCode = 'GANGREGISTRATION';
export default function GangRegistrationAddEdit(props) {
  const [title, setTitle] = useState("Gang Creation")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [gang, setGang] = useState({
    gangID: 0,
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    gangCode: '',
    gangName: '',
    isActive: true,
  }); 

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/app/gangRegistration/listing');
  }
  const alert = useAlert();
  const { gangID } = useParams();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    decrypted = atob(gangID.toString());
    if (decrypted != 0) {
      trackPromise(getGangDetailsByGangID(decrypted));
    }
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [gang.groupID]);

  useEffect(() => {
    getDivisionDetailsByEstateID();
  }, [gang.estateID]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  };

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(gang.groupID);
    setEstates(response);
  };

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(gang.estateID);
    setDivisions(response);
  };


  async function getGangDetailsByGangID(gangID) {
    let response = await services.getGangDetailsByGangID(gangID);
      setTitle("Edit Gang");

    setGang({
      ...gang,
            groupID: response.groupID,
            estateID: response.estateID,
            divisionID: response.divisionID,
            gangCode: response.gangCode,
            gangName: response.gangName,
            isActive: response.isActive,
    });

    setIsUpdate(true);
  }
  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITGANGREGISTRATION');

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
      setGang({
        ...gang,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        estateID: parseInt(tokenService.getFactoryIDFromToken()),
      })
    }
  }

  async function saveGang(values) {
    if (isUpdate == true) {
      let updateModel = {
          gangID:parseInt(atob(gangID.toString())),
          gangCode: values.gangCode,
          gangName: values.gangName,
          groupID: parseInt(values.groupID),
          estateID: parseInt(values.estateID),
          divisionID: parseInt(values.divisionID),
          isActive: values.isActive,
          modifiedBy: parseInt(tokenService.getUserIDFromToken())
      }

      let response = await services.updateGang(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/gangRegistration/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let saveModel = {
        gangID: 0,
        groupID: parseInt(gang.groupID),
        estateID: parseInt(gang.estateID),
        divisionID: parseInt(gang.divisionID),
        gangCode: gang.gangCode,
        gangName: gang.gangName,
        isActive: gang.isActive,
        createdBy: tokenService.getUserIDFromToken(),
      }

      let response = await services.saveGang(saveModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/gangRegistration/listing');
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
    setGang({
      ...gang,
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
              groupID: gang.groupID,
              estateID: gang.estateID,
              divisionID: gang.divisionID,
              gangCode: gang.gangCode,
              gangName: gang.gangName,
              isActive: gang.isActive,
            }}
            validationSchema={
              Yup.object().shape({
                 groupID: Yup.number().required('Group required').min("1", 'Group required'),
                 estateID: Yup.number().required('Estate required').min("1", 'Estate required'),
                 divisionID: Yup.number().required('Division required').min("1", 'Division required'),
                 gangCode: Yup.string().max(30).required('Gang Code required'),
                 gangName: Yup.string().max(30).required('Gang Name required'),
              })
            }
            onSubmit={saveGang}
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
                              value={gang.groupID}
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
                              value={gang.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
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
                              value={gang.divisionID}
                              variant="outlined"
                              id="divisionID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="gangCode">
                            Gang code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.gangCode && errors.gangCode)}
                              fullWidth
                              helperText={touched.gangCode && errors.gangCode}
                              name="gangCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={gang.gangCode}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="gangName">
                            Gang Name *
                              </InputLabel>
                            <TextField
                              error={Boolean(touched.gangName && errors.gangName)}
                              fullWidth
                              helperText={touched.gangName && errors.gangName}
                              name="gangName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={gang.gangName}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
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
                              disabled={isDisableButton}
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

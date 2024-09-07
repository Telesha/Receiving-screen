import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button,
  CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import tokenDecoder from '../../../utils/tokenDecoder';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import permissionService from "../../../utils/permissionAuth";
import { AlertDialogWithoutButton } from '../../Common/AlertDialogWithoutButton';

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

const screenCode = 'ROLE';
export default function RoleAddEdit(props) {
  const [title, setTitle] = useState("Add Role")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [roleLevels, setRoleLevels] = useState()
  const [role, setRole] = useState({
    groupID: 0,
    factoryID: 0,
    roleLevelID: 0,
    roleName: '',
    isActive: true
  });

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/roles/listing');
  }
  const [dialogbox, setDialogbox] = useState(false);
  const alert = useAlert();

  const { roleID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    decrypted = atob(roleID.toString());
    if (decrypted != 0) {
      trackPromise(
        getRoleDetails(decrypted)
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    getFactoriesForDropdown()
  }, [role.groupID]);

  useEffect(() => {
    trackPromise(
      getRoleLevelsForDropdown()
    );
  }, []);

  async function getPermissions() {
    var permissions = await permissionService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITROLE');

    if (isAuthorized === undefined) {
      navigate('/app/unauthorized');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setRole({
      role,
      isActive: true,
      groupID: parseInt(tokenDecoder.getGroupIDFromToken()),
      factoryID: parseInt(tokenDecoder.getFactoryIDFromToken())
    })

    trackPromise(getGroupsForDropdown());
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(role.groupID);
    setFactories(factories);
  }

  async function getRoleLevelsForDropdown() {
    const response = tokenDecoder.getRoleLevelFromToken();
    const roleLevels = await services.getRoleLevelsByToken(response);
    setRoleLevels(roleLevels);
  }

  async function getRoleDetails(roleID) {
    let response = await services.getRoleDetailsByID(roleID);
    let data = response[0];
    setTitle("Update Role");
    setRole(data);
    setIsUpdate(true);
  }

  async function saveRole(values) {
    if (isUpdate == true) {

      let updateModel = {
        roleID: atob(roleID.toString()),
        groupID: parseInt(values.groupID),
        factoryID: parseInt(values.factoryID),
        roleLevelID: parseInt(values.roleLevelID),
        roleName: values.roleName,
        isActive: role.isActive,
      }

      let response = await services.updateRole(updateModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/roles/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveRole(values);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/roles/listing');
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
    const value = target.name === 'isActive' ? target.checked : target.value
    setRole({
      ...role,
      [e.target.name]: value
    });
  }

  async function triggerDialogBox(){
    if(role.isActive == true ){
      setDialogbox(true);
    }else{
      setDialogbox(false);
    } 
  }

  async function cancelData() {
    role.isActive = true;
    setDialogbox(false);
  } 

  async function confirmData() {
    role.isActive = true;
    setDialogbox(false);
    alert.error('Can not Inactivate. Users are still assigned to this role')
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

  const handleKeyDownChange = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: role.groupID,
              factoryID: role.factoryID,
              roleLevelID: role.roleLevelID,
              roleName: role.roleName,
              isActive: role.isActive,

            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                roleLevelID: Yup.number().required('Role Level is required').min("1", 'Role level is required'),
                roleName: Yup.string().max(255).required('Role Name is required')
              })
            }
            onSubmit={saveRole}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              isSubmitting,
              touched,
            }) => (
              <form onKeyDown={handleKeyDownChange} onSubmit={handleSubmit}>
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
                              size='small'
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={role.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate ? true : !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              size='small'
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={role.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate ? true : !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="roleLevelID">
                              Role level *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.roleLevelID && errors.roleLevelID)}
                              fullWidth
                              helperText={touched.roleLevelID && errors.roleLevelID}
                              size='small'
                              name="roleLevelID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={role.roleLevelID}
                              variant="outlined"
                              id="roleLevelID"
                            >
                              <MenuItem value="0">--Select Role Level--</MenuItem>
                              {generateDropDownMenu(roleLevels)}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="roleName">
                              Role Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.roleName && errors.roleName)}
                              fullWidth
                              helperText={touched.roleName && errors.roleName}
                              size='small'
                              name="roleName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={role.roleName}
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
                              checked={role.isActive}
                              onChange={(e) => handleChange1(e)}
                              name="isActive"
                              disabled={isDisableButton}
                              onClick={() => triggerDialogBox()}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          type="submit"
                          variant="contained"
                          size='small'
                        >
                          {isUpdate == true ? "Update" : "Save"}
                        </Button>
                      </Box>

                      {(dialogbox && role.noOfUsers > 0) ?
                        <AlertDialogWithoutButton confirmData={confirmData} cancelData={cancelData}
                          IconTitle={"Warning"}
                          headerMessage={"Are you sure you want to Inactivate ?"}
                          discription={"Some users are still assigned to this role"} />
                      : null }

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

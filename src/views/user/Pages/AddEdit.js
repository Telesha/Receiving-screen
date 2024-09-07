import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
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
  Switch,
  CardHeader,
  MenuItem,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';

import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { Icon } from '@iconify/react';

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

const screenCode = 'USER';
export default function UserAddEdit() {
  const [title, setTitle] = useState("Add User");
  const [isUpdate, setIsUpdate] = useState(false);
  const classes = useStyles();
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [roles, setRoles] = useState()
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState({
    groupID: 0,
    factoryID: 0,
    firstName: '',
    lastName: '',
    roleID: 0,
    userName: '',
    password: '',
    confirmPassword: '',
    isActive: true,
    isLock: false,
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/users/listing');
  }
  const alert = useAlert();
  const { userID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    trackPromise(getPermission())
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    getFactoriesForDropdown()
  }, [user.groupID]);

  useEffect(() => {
    trackPromise(
      getRolesForDropdown()
    );
  }, [user.factoryID]);

  useEffect(() => {
    decrypted = atob(userID.toString());
    if (decrypted != 0) {
      trackPromise(
        getUserDetails(decrypted)
      )
    }
  }, []);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITUSER');

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

    setUser({
      ...user,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getUserDetails(userID) {
    let response = await services.getUserDetailsByID(userID);
    let data = response[0];
    setIsUpdate(true);
    setTitle("Update User");
    setUser(data);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(user.groupID);
    setFactories(factories);
  }

  async function getRolesForDropdown() {
    const roles = await services.getRolesbyRoleLevel(user.factoryID);
    setRoles(roles);
  }

  async function saveUser(values) {
    if (!isUpdate) {
      let response = await services.saveUser(values);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/users/listing');
      }
      else {
        alert.error(response.message);
      }
    }
    else {
      let update = {
        groupID: values.groupID,
        factoryID: values.factoryID,
        userID: atob(userID.toString()),
        firstName: values.firstName,
        lastName: values.lastName,
        roleID: values.roleID,
        isActive: values.isActive,
        isLock: values.isLock,
      }
      let response = await services.updateUser(update);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/users/listing');
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
    const value = target.value
    setUser({
      ...user,
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
    <Page className={classes.root} title={title}>
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: user.groupID,
            factoryID: user.factoryID,
            firstName: user.firstName,
            lastName: user.lastName,
            roleID: user.roleID,
            userName: user.userName,
            password: user.password,
            confirmPassword: user.confirmPassword,
            isActive: user.isActive,
            isLock: user.isLock
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
              factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
              userName: Yup.string().max(255).required('Username is required'),
              firstName: Yup.string().max(255).required('First name is required'),
              lastName: Yup.string().max(255).required('Last name is required'),
              roleID: Yup.number().required('Role is required').min("1", 'Role is required'),
              password: (!isUpdate ? (Yup.string().max(8, 'Cannot exceed 8 characters').required('Password is requied').transform((v, o) => o === '' ? null : v).min(1, 'Password is required')) :
                Yup.string().notRequired().nullable()),
              confirmPassword: Yup.string().max(8, "Cannot exceed 8 characters").required('Confirm password required').when("password", {
                is: val => (val && val.length > 0 ? true : false),
                then: Yup.string().oneOf(
                  [Yup.ref("password")],
                  "Password and confirm password do not match"
                )
              })
            })
          }
          onSubmit={saveUser}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,

            touched,
            values
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
                            size='small'
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={user.groupID}
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
                            value={user.factoryID}
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
                      </Grid>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="firstName">
                            First Name *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.firstName && errors.firstName)}
                            fullWidth
                            helperText={touched.firstName && errors.firstName}
                            size='small'
                            name="firstName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={user.firstName}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="lastName">
                            Last Name *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.lastName && errors.lastName)}
                            fullWidth
                            helperText={touched.lastName && errors.lastName}
                            size='small'
                            name="lastName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={user.lastName}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="roleID">
                            Role *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.roleID && errors.roleID)}
                            fullWidth
                            helperText={touched.roleID && errors.roleID}
                            size='small'
                            name="roleID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={user.roleID}
                            variant="outlined"
                            id="roleID"
                          >
                            <MenuItem value="0">--Select Role--</MenuItem>
                            {generateDropDownMenu(roles)}
                          </TextField>
                        </Grid>
                      </Grid>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="userName">
                            User Name *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.userName && errors.userName)}
                            fullWidth
                            helperText={touched.userName && errors.userName}
                            size='small'
                            name="userName"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={user.userName}
                            InputProps={{
                              readOnly: isUpdate ? true : false,
                            }}
                            variant="outlined"
                          />
                        </Grid>

                        <Grid item md={4} xs={12} hidden={isUpdate}>
                          <InputLabel shrink id="password">
                            Password *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.password && errors.password)}
                            fullWidth
                            helperText={touched.password && errors.password}
                            size='small'
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={user.password}
                            variant="outlined"
                            autoComplete={false}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)}>
                                    <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>

                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="confirmPassword">
                            Confirm Password *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                            fullWidth
                            helperText={touched.confirmPassword && errors.confirmPassword}
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            size='small'
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={user.confirmPassword}
                            variant="outlined"
                            autoComplete={false}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton edge="end" onClick={() => setShowConfirmPassword((prev) => !prev)}>
                                    <Icon icon={showConfirmPassword ? eyeFill : eyeOffFill} />
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
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
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="isLock">
                            Locked
                          </InputLabel>
                          <Switch
                            checked={values.isLock}
                            onChange={handleChange}
                            name="isLock"
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

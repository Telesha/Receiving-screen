import React, { useState, useEffect } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import { Box, Card, InputLabel, Button, Grid, TextField, MenuItem } from '@material-ui/core';
import services from '../../Services';
import { useAlert } from "react-alert";
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from 'src/utils/permissionAuth';
import tokenService from 'src/utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';

const screenCode = 'CHARTOFACCOUNT';
export const ParentHeaderPopUp = ({ openParentHeader, HandleCreateParentHeader }) => {

  const [parentHeader, setParentHeader] = useState({
    accountTypeID: 0,
    parentHeaderName: '',
    parentHeaderCode: '',
    groupID: 0,
    factoryID: 0,
    parentHeaderOrder: 0

  });

  const [childHeader, setChildHeader] = useState({
    parentHeaderID: 0,
    childHeaderName: '',
    childHeaderCode: '',
    groupID: 0,
    factoryID: 0

  });

  const alert = useAlert();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: true,
    isFactoryFilterEnabled: true
  });
  const [accountTypeNames, setAccountTypeNames] = useState();
  const [parentHeaderNames, setParentHeaderNames] = useState();


  const navigate = useNavigate();

  useEffect(() => {
    if (openParentHeader) {
      getGroupsForDropdown();
      getPermission();
    }
  }, [openParentHeader]);

  useEffect(() => {
    if (openParentHeader) {
      getfactoriesForDropDown();
    }
  }, [parentHeader.groupID, openParentHeader]);

  useEffect(() => {
    if (openParentHeader) {
      getLatestParentHeaderCode(parentHeader.accountTypeID);
    }
  }, [parentHeader.accountTypeID, openParentHeader]);

  useEffect(() => {
    if (openParentHeader) {
      getParentHeaderNamesForDropdown();
    }
  }, [childHeader.factoryID, openParentHeader]);

  useEffect(() => {
    if (openParentHeader) {
      getAccountTypeNamesForDropdown();
    }
  }, [parentHeader.groupID, openParentHeader]);

  useEffect(() => {
    clearData();
  }, [openParentHeader]);

  function handleChange(e) {
    const target = e.target;
    const value = target.value

    setParentHeader({
      ...parentHeader,
      [e.target.name]: value
    });

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

  function clearData() {
    setParentHeader({
      ...parentHeader,
      accountTypeID: 0,
      parentHeaderName: '',
      parentHeaderCode: '',
      parentHeaderOrder: 0
    });
  }

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);

    var isAuthorized = permissions.find(p => p.permissionCode === 'VIEWCHARTOFACCOUNT');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode === 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode === 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setParentHeader({
      ...parentHeader,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(parentHeader.groupID);
    setFactories(factory);
  }

  async function getAccountTypeNamesForDropdown() {
    const accounts = await services.getAccountTypeNamesForDropdown(parentHeader.groupID, parentHeader.factoryID);
    setAccountTypeNames(accounts);
  }

  async function SaveParentHeader() {

    let parentModel = {
      parentHeaderCode: parentHeader.parentHeaderCode,
      parentHeaderName: parentHeader.parentHeaderName,
      parentHeaderOrder: parentHeader.parentHeaderOrder,
      accountTypeID: parentHeader.accountTypeID,
      groupID: parseInt(parentHeader.groupID),
      factoryID: parseInt(parentHeader.factoryID)

    }
    let response = await services.SaveParentHeader(parentModel);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      clearData();
      HandleCreateParentHeader();

    }
    else {
      alert.error(response.message);
    }
  }

  async function getLatestParentHeaderCode(accountTypeID) {
    if (accountTypeID != 0) {
      var result = await services.getLatestParentHeaderCode(accountTypeID);

      if (result === null) {
        var resultCode = await services.getAccountTypeCode(accountTypeID);
        var splitNum0 = resultCode.accountTypeCode.split("-")[0];
        setParentHeader({ ...parentHeader, parentHeaderCode: `${splitNum0}-01000000`, parentHeaderOrder: 1 });
      } else {
        var splitNum = result.parentHeaderCode.split("-")[1];
        var splitNum0 = result.parentHeaderCode.split("-")[0];
        const parentValue = splitNum.substring(0, 2);
        const accountValue = splitNum0;
        setParentHeader({ ...parentHeader, parentHeaderCode: `${accountValue}-${(parseInt(parentValue) + 1).toString().padStart(2, "0")}000000`, parentHeaderOrder: `${(parseInt(parentValue) + 1)}` });
      }
    } else {
      setParentHeader({ ...parentHeader, parentHeaderCode: "", parentHeaderName: "" });
    }
  }
  async function getParentHeaderNamesForDropdown() {
    const accounts = await services.getParentHeaderNamesForDropdown(childHeader.groupID, childHeader.factoryID);
    setParentHeaderNames(accounts);
  }

  return (
    <div>
      <Modal open={openParentHeader} onClose={HandleCreateParentHeader} center
        animationDuration={100}>
        <h2>Parent Header Creation</h2><br />

        <Card >

          <Formik
            initialValues={{
              parentHeaderName: parentHeader.parentHeaderName,
              parentHeaderCode: parentHeader.parentHeaderCode,
              accountTypeID: parentHeader.accountTypeID,
              groupID: parentHeader.groupID,
              factoryID: parentHeader.factoryID,

            }}
            validationSchema={
              Yup.object().shape({
                parentHeaderCode: Yup.string().max(11, 'Allow 11 digits only').trim().matches(/^[a-zA-Z-\d\s]+$/, 'Special Characters Not Allowed').required('Parent Header Code is required'),
                parentHeaderName: Yup.string().max(50, 'Allow 50 digits only').trim().matches(/^[a-zA-Z-/\d\s]+$/, 'Special Characters Not Allowed').required('Parent Header Name is required'),
                accountTypeID: Yup.number().required('Account Type Name is  required').min("1", 'Account Type Name is  required'),
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                // factoryID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
              })
            }
            onSubmit={SaveParentHeader}
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

                <Box width={700} height={500} borderRadius={16} border={1}>

                  <Grid container spacing={3} justify="center" >
                    <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: "1rem" }} justify="left">
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
                        value={parentHeader.groupID}
                        variant="outlined"
                        id="groupID"
                        size="small"
                        disabled={!permissionList.isGroupFilterEnabled}
                      >
                        <MenuItem value="0">--Select Group--</MenuItem>
                        {generateDropDownMenu(groups)}
                      </TextField>
                    </Grid>
                    {/* <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: "1rem" }}>
                      <InputLabel shrink id="factoryID">
                        Estate *
                      </InputLabel>
                      <TextField select
                        error={Boolean(touched.factoryID && errors.factoryID)}
                        fullWidth
                        helperText={touched.factoryID && errors.factoryID}
                        name="factoryID"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={parentHeader.factoryID}
                        variant="outlined"
                        id="factoryID"
                        size="small"
                        disabled={!permissionList.isFactoryFilterEnabled}
                      >
                        <MenuItem value="0">--Select Estate--</MenuItem>
                        {generateDropDownMenu(factories)}
                      </TextField>
                    </Grid> */}
                    <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: "1rem" }}>
                      <InputLabel shrink id="accountTypeID">
                        Account Type Name *
                      </InputLabel>

                      <TextField select
                        error={Boolean(touched.accountTypeID && errors.accountTypeID)}
                        helperText={touched.accountTypeID && errors.accountTypeID}
                        onBlur={handleBlur}
                        name="accountTypeID"
                        onChange={(e) => handleChange(e)}
                        value={parentHeader.accountTypeID}
                        variant="outlined"
                        id="accountTypeID"
                        size="small"
                        fullWidth
                      >
                        <MenuItem value="0">--Select Account Type Name--</MenuItem>
                        {generateDropDownMenu(accountTypeNames)}
                      </TextField>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3} justify="center" style={{ marginTop: '2rem' }}>
                    <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }}  >
                      <InputLabel shrink id="parentHeaderName">
                        Parent Header Name *
                      </InputLabel>

                      <TextField
                        error={Boolean(touched.parentHeaderName && errors.parentHeaderName)}
                        helperText={touched.parentHeaderName && errors.parentHeaderName}
                        onBlur={handleBlur}
                        name="parentHeaderName"
                        onChange={(e) => handleChange(e)}
                        value={parentHeader.parentHeaderName}
                        variant="outlined"
                        id="parentHeaderName"
                        size="small"
                      >
                      </TextField>
                    </Grid>

                    <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }} >
                      <InputLabel shrink id="parentHeaderCode">
                        Parent Header Code *
                      </InputLabel>

                      <TextField
                        error={Boolean(touched.parentHeaderCode && errors.parentHeaderCode)}
                        helperText={touched.parentHeaderCode && errors.parentHeaderCode}
                        onBlur={handleBlur}
                        name="parentHeaderCode"
                        onChange={(e) => handleChange(e)}
                        value={parentHeader.parentHeaderCode}
                        variant="outlined"
                        id="parentHeaderCode"
                        size="small"
                      >
                      </TextField>
                    </Grid>

                    {/* <Grid item md={4} xs={12} style={{ marginTop: "2rem", marginLeft: '1rem' }} >

                     
                    </Grid> */}
                  </Grid>

                  <Grid item md={10} xs={12} style={{ marginTop: '3rem' }} align="center">
                    <Box display="flex" justifyContent="flex-end" >
                      <Button
                        color="primary"
                        type="submit"
                        variant="contained"
                        size='small'
                      >
                        Save
                      </Button>
                    </Box>
                  </Grid>
                </Box>
              </form>
            )}
          </Formik>
        </Card>

      </Modal>
    </div>
  );
};

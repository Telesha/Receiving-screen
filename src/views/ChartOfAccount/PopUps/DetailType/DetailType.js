import React, { useState, useEffect } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import { Box, Card, Button, Grid, TextField, InputLabel, MenuItem } from '@material-ui/core';
import services from '../../Services';
import { useAlert } from "react-alert";
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from 'src/utils/permissionAuth';
import tokenService from 'src/utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';

const screenCode = 'CHARTOFACCOUNT';
export const DetailTypePopUp = ({ openDetailType, HandleCreateChildHeader }) => {

  const [childHeader, setChildHeader] = useState({
    parentHeaderID: 0,
    childHeaderName: '',
    childHeaderCode: '',
    groupID: 0,
    factoryID: 0,
    accountTypeID: 0,
    childHeaderTypeID: 0
  });

  const [parentHeaderNames, setParentHeaderNames] = useState();
  const alert = useAlert();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: true,
    isFactoryFilterEnabled: true
  });
  const [accountTypeNames, setAccountTypeNames] = useState();
  const [childHeders, setChildHeaders] = useState();
  const [childHederTypes, setChildHederTypes] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if (openDetailType) {
      getGroupsForDropdown();
      getPermission();
    }
  }, [openDetailType]);

  useEffect(() => {
    if (openDetailType) {
      getfactoriesForDropDown();
    }
  }, [childHeader.groupID, openDetailType]);

  useEffect(() => {
    if (openDetailType) {
      getParentHeaderNamesForDropdown();
    }
  }, [childHeader.factoryID, openDetailType]);

  useEffect(() => {
    if (openDetailType) {
      getLatestChildHeaderCode(childHeader.parentHeaderID);
    }
  }, [childHeader.parentHeaderID, openDetailType]);

  useEffect(() => {
    if (openDetailType) {
      getParentHeadersByAccountTypeID(childHeader.accountTypeID);
    }
  }, [childHeader.accountTypeID, openDetailType])

  useEffect(() => {
    if (openDetailType) {
      getAccountTypeNamesForDropdown();
    }
  }, [childHeader.factoryID, openDetailType]);


  useEffect(() => {
    if (openDetailType) {
      getChildHeaderTypes();
    }
  }, [childHeader.groupID, openDetailType]);


  useEffect(() => {
    clearData();
  }, [openDetailType]);

  function handleChange(e) {
    const target = e.target;
    const value = target.value

    setChildHeader({
      ...childHeader,
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
    setChildHeader({
      ...childHeader,
      parentHeaderID: 0,
      childHeaderName: '',
      childHeaderCode: '',
      accountTypeID: 0,
      childHeaderTypeID: 0
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

    setChildHeader({
      ...childHeader,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(childHeader.groupID);
    setFactories(factory);
  }

  async function getParentHeaderNamesForDropdown() {
    const accounts = await services.getParentHeaderNamesForDropdown(childHeader.groupID, childHeader.factoryID);
    setParentHeaderNames(accounts);
  }

  async function getParentHeadersByAccountTypeID(accountTypeID) {
    const response = await services.getParentHeadersByAccountTypeID(accountTypeID)
    setChildHeaders(response);
  }

  async function getAccountTypeNamesForDropdown() {
    const accounts = await services.getAccountTypeNamesForDropdown(childHeader.groupID, childHeader.factoryID);
    setAccountTypeNames(accounts);
  }

  async function getChildHeaderTypes() {
    const childHeaderType = await services.getChildHeaderTypes(childHeader.groupID);
    setChildHederTypes(childHeaderType);
  }

  async function SaveAccountType() {

    let childModel = {
      parentHeaderID: childHeader.parentHeaderID,
      childHeaderCode: childHeader.childHeaderCode,
      childHeaderName: childHeader.childHeaderName,
      groupID: parseInt(childHeader.groupID),
      factoryID: parseInt(childHeader.factoryID),
      childHeaderTypeID: parseInt(childHeader.childHeaderTypeID)
    }

    let response = await services.SaveChildHeader(childModel);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      HandleCreateChildHeader();
    }
    else {
      alert.error(response.message);
    }
    clearData();
  }

  async function getLatestChildHeaderCode(parentHeaderID) {
    if (parentHeaderID != 0) {
      var result = await services.getLatestChildHeaderCode(parentHeaderID);

      if (result === null) {
        var resultCode = await services.getParentHeaderCode(parentHeaderID);
        var splitNum = resultCode.parentHeaderCode.split("-")[1];
        var splitNum0 = resultCode.parentHeaderCode.split("-")[0];
        const childValue = splitNum.substring(2, 5);
        const childValueBase = splitNum.substring(0, 2);
        const accountValue = splitNum0;

        setChildHeader({ ...childHeader, childHeaderCode: `${accountValue}-${childValueBase}${(parseInt(childValue) + 1).toString().padStart(3, "0")}000`, });
      } else {
        var splitNum = result.childHeaderCode.split("-")[1];
        var splitNum0 = result.childHeaderCode.split("-")[0];
        const childValue = splitNum.substring(2, 5);
        const childValueBase = splitNum.substring(0, 2);
        const accountValue = splitNum0;
        setChildHeader({ ...childHeader, childHeaderCode: `${accountValue}-${childValueBase}${(parseInt(childValue) + 1).toString().padStart(3, "0")}000`, });
      }
    }
    else {
      setChildHeader({ ...childHeader, childHeaderCode: "", childHeaderName: "" });
    }
  }

  return (
    <div>
      <Modal open={openDetailType} onClose={HandleCreateChildHeader} center
        animationDuration={100}>
        <h2>Child Header Creation</h2><br />

        <Card>

          <Formik
            initialValues={{
              parentHeaderID: childHeader.parentHeaderID,
              childHeaderCode: childHeader.childHeaderCode,
              childHeaderName: childHeader.childHeaderName,
              groupID: childHeader.groupID,
              factoryID: childHeader.factoryID,
              accountTypeID: childHeader.accountTypeID,
              childHeaderTypeID: childHeader.childHeaderTypeID
            }}
            validationSchema={
              Yup.object().shape({
                childHeaderCode: Yup.string().max(255).trim().matches(/^[a-zA-Z-\d\s]+$/, 'Special Characters Not Allowed').required('Child Header Code is required'),
                childHeaderName: Yup.string().max(255, 'Allow only 255 digits').trim().matches(/^[a-zA-Z-/\d\s]+$/, 'Special Characters Not Allowed').required('Child Header Name is required'),
                parentHeaderID: Yup.number().required('Parent Header Name is required').min("1", 'Parent Header Name is required'),
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                accountTypeID: Yup.number().required('Account Type required').min("1", 'Account Type is required'),
              })
            }
            onSubmit={SaveAccountType}
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
                        value={childHeader.groupID}
                        variant="outlined"
                        id="groupID"
                        size="small"
                        disabled={!permissionList.isGroupFilterEnabled}
                      >
                        <MenuItem value="0">--Select Group--</MenuItem>
                        {generateDropDownMenu(groups)}
                      </TextField>
                    </Grid>
                    <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: "1rem" }}  >
                      <InputLabel shrink id="accountTypeID">
                        Account Type *
                      </InputLabel>
                      <TextField
                        select
                        error={Boolean(touched.accountTypeID && errors.accountTypeID)}
                        fullWidth
                        helperText={touched.accountTypeID && errors.accountTypeID}
                        name="accountTypeID"
                        onChange={(e) => handleChange(e)}
                        value={childHeader.accountTypeID}
                        variant="outlined"
                        id="accountTypeID"
                        size="small"
                        onBlur={handleBlur}

                      >
                        <MenuItem value="0">--Select Account Type--</MenuItem>
                        {generateDropDownMenu(accountTypeNames)}
                      </TextField>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3} justify="center" style={{ marginTop: '2rem' }}>
                    <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }} align="left" >
                      <InputLabel shrink id="parentHeaderID">
                        Parent Header Name *
                      </InputLabel>

                      <TextField select
                        error={Boolean(touched.parentHeaderID && errors.parentHeaderID)}
                        helperText={touched.parentHeaderID && errors.parentHeaderID}
                        onBlur={handleBlur}
                        name="parentHeaderID"
                        onChange={(e) => handleChange(e)}
                        value={childHeader.parentHeaderID}
                        variant="outlined"
                        id="parentHeaderID"
                        size="small"
                        fullWidth
                      >
                        <MenuItem value="0">--Select Parent Header Name--</MenuItem>
                        {generateDropDownMenu(childHeders)}
                      </TextField>
                    </Grid>

                    <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: "1rem" }}  >
                      <InputLabel shrink id="childHeaderTypeID">
                        Child Header Type
                      </InputLabel>
                      <TextField
                        select
                        fullWidth
                        name="childHeaderTypeID"
                        onChange={(e) => handleChange(e)}
                        value={childHeader.childHeaderTypeID}
                        variant="outlined"
                        id="childHeaderTypeID"
                        size="small"
                        onBlur={handleBlur}

                      >
                        <MenuItem value="0">--Select Child Header Type--</MenuItem>
                        {generateDropDownMenu(childHederTypes)}
                      </TextField>
                    </Grid>


                  </Grid>
                  <Grid container spacing={3} justify="center" style={{ marginTop: '2rem' }}>
                    <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }} >
                      <InputLabel shrink id="childHeaderName">
                        Child Header Name *
                      </InputLabel>

                      <TextField
                        error={Boolean(touched.childHeaderName && errors.childHeaderName)}
                        helperText={touched.childHeaderName && errors.childHeaderName}
                        onBlur={handleBlur}
                        name="childHeaderName"
                        onChange={(e) => handleChange(e)}
                        value={childHeader.childHeaderName}
                        variant="outlined"
                        id="childHeaderName"
                        size="small"
                      >
                      </TextField>
                    </Grid>
                    <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }} >
                      <InputLabel shrink id="childHeaderCode">
                        Child Header Code *
                      </InputLabel>

                      <TextField
                        error={Boolean(touched.childHeaderCode && errors.childHeaderCode)}
                        helperText={touched.childHeaderCode && errors.childHeaderCode}
                        onBlur={handleBlur}
                        name="childHeaderCode"
                        onChange={(e) => handleChange(e)}
                        value={childHeader.childHeaderCode}
                        variant="outlined"
                        id="childHeaderCode"
                        size="small"
                      >
                      </TextField>
                    </Grid>
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

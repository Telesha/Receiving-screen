import React, { useState, useEffect } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import { Box, Card, Button, Grid, TextField, MenuItem, FormControlLabel, RadioGroup, Radio, FormControl, FormLabel, InputLabel, Typography } from '@material-ui/core';
import services from '../../Services';
import { useAlert } from "react-alert";
import { Formik, } from 'formik';
import * as Yup from "yup";
import authService from 'src/utils/permissionAuth';
import tokenService from 'src/utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';

const screenCode = 'CHARTOFACCOUNT';
export const AccountTypePopUp = ({ open, HandleCreateAccountType }) => {
  const [accountType, setAccountType] = useState({
    accountTypeName: '',
    accountTypeCode: '',
    value: '',
    orderNo: 0,
    groupID: 0,
    factoryID: 0,
    accountTypeUniqueCode: 0
  });
  const [accountTypeNames, setAccountTypeNames] = useState();

  const [value, setValue] = React.useState('1');
  const [groups, setGroups] = useState();
  const [UniqueAccountTypeCode, setUniqueAccountTypeCode] = useState()
  const [factories, setFactories] = useState();
  const [parentHeader, setParentHeader] = useState({
    accountTypeID: 0,
    parentHeaderName: '',
    parentHeaderCode: '',
    groupID: 0,
    factoryID: 0,
    parentHeaderOrder: 0

  });

  const alert = useAlert();

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: true,
    isFactoryFilterEnabled: true
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      trackPromise(getPermission());
      trackPromise(getGroupsForDropdown());
      trackPromise(GetAccountTypeCodes());
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      trackPromise(getfactoriesForDropDown());
    }
  }, [accountType.groupID, open]);

  useEffect(() => {
    if (open) {
      trackPromise(getLatestAccountTypeCode());
    }
  }, [accountType.groupID, open]);

  useEffect(() => {
    if (open) {
      getAccountTypeNamesForDropdown();
    }
  }, [parentHeader.factoryID, open]);

  useEffect(() => {
    clearData();
  }, [open]);

  function handleChange(e) {
    const target = e.target;
    const value = target.value

    setAccountType({
      ...accountType,
      [e.target.name]: value
    });

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

  function clearData() {
    setAccountType({
      ...accountType, accountTypeName: '',
      accountTypeCode: '',
      value: '1',
      orderNo: 0,
      accountTypeUniqueCode: 0
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

    setAccountType({
      ...accountType,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function SaveAccountType() {

    let accountModel = {
      accountTypeName: accountType.accountTypeName,
      accountTypeCode: accountType.accountTypeCode,
      entryType: parseInt(value),
      orderNo: accountType.orderNo,
      groupID: parseInt(accountType.groupID),
      factoryID: parseInt(accountType.factoryID),
      accountTypeCodeID: parseInt(accountType.accountTypeUniqueCode)
    }

    let response = await services.saveAccountType(accountModel);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      clearData();
      HandleCreateAccountType();



    }
    else {
      alert.error(response.message);
    }
  }

  async function getLatestAccountTypeCode() {
    if (accountType.factoryID != 0) {
      var result = await services.getLatestAccountTypeCode(accountType.groupID, accountType.factoryID);

      if (result === null) {
        setAccountType({ ...accountType, accountTypeCode: '1-00000000', orderNo: 1 });
      } else {
        var splitNum = result.accountTypeCode.split("-")[0];
        setAccountType({ ...accountType, accountTypeCode: `${(parseInt(splitNum) + 1)}-00000000`, orderNo: `${(parseInt(splitNum) + 1)}` });
      }
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(accountType.groupID);
    setFactories(factory);
  }

  async function GetAccountTypeCodes() {
    const response = await services.GetUniqueAccountTypeCode()
    setUniqueAccountTypeCode(response);
  }

  async function getAccountTypeNamesForDropdown() {
    const accounts = await services.getAccountTypeNamesForDropdown(parentHeader.groupID, parentHeader.factoryID);
    setAccountTypeNames(accounts);
  }
  return (
    <div>
      <Modal open={open} onClose={HandleCreateAccountType} center
        animationDuration={100}>
        <h2>Account Type Creation</h2><br />

        <Card >
          <Formik
            initialValues={{
              accountTypeName: accountType.accountTypeName,
              accountTypeCode: accountType.accountTypeCode,
              groupID: accountType.groupID,
              factoryID: accountType.factoryID,
              accountTypeUniqueCode: accountType.accountTypeUniqueCode
            }}
            validationSchema={
              Yup.object().shape({
                accountTypeName: Yup.string().max(50, 'Allow 50 digits only')
                  .trim().matches(/^[a-zA-Z-/\d\s]+$/, 'Special Characters Not Allowed').required('Account Type Name is required'),
                accountTypeCode: Yup.string().max(11, 'Allow 11 digits only').trim().matches(/^[a-zA-Z-\d\s]+$/, 'Special Characters Not Allowed').required('Account Type Code is required'),
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                accountTypeUniqueCode: Yup.number().required('Account Type is required').min("1", 'Account Type is required'),
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
                <Box width={700} height={500} borderRadius={16} border={1} mt={0}>

                  <Grid container spacing={4} justify="center" >
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
                        value={accountType.groupID}
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
                        value={accountType.factoryID}
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
                      <InputLabel shrink id="accountTypeName">
                        Account Type Name *
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.accountTypeName && errors.accountTypeName)}
                        helperText={touched.accountTypeName && errors.accountTypeName}
                        name="accountTypeName"
                        onChange={(e) => handleChange(e)}
                        value={accountType.accountTypeName}
                        variant="outlined"
                        id="accountTypeName"
                        size="small"
                        onBlur={handleBlur}

                      >
                      </TextField>
                      {/* <InputLabel shrink id="factoryID">
                        Estate *
                      </InputLabel>
                      <TextField select
                        error={Boolean(touched.factoryID && errors.factoryID)}
                        fullWidth
                        helperText={touched.factoryID && errors.factoryID}
                        name="factoryID"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={accountType.factoryID}
                        variant="outlined"
                        id="factoryID"
                        size="small"
                        disabled={!permissionList.isFactoryFilterEnabled}
                      >
                        <MenuItem value="0">--Select Estate--</MenuItem>
                        {generateDropDownMenu(factories)}
                      </TextField> */}
                    </Grid>
                  </Grid>

                  <Grid container spacing={4} justify="center" style={{ marginTop: '2rem' }} >
                    <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: "1rem" }}  >
                      <InputLabel shrink id="accountTypeCode">
                        Account Type Code *
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.accountTypeCode && errors.accountTypeCode)}
                        helperText={touched.accountTypeCode && errors.accountTypeCode}
                        name="accountTypeCode"
                        onChange={(e) => handleChange(e)}
                        value={accountType.accountTypeCode}
                        variant="outlined"
                        id="accountTypeCode"
                        size="small"
                        onBlur={handleBlur}

                      >
                      </TextField>
                    </Grid>
                    <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem' }} >
                      <InputLabel shrink id="accountTypeUniqueCode">
                        Account Type *
                      </InputLabel>
                      <TextField
                        select
                        error={Boolean(touched.accountTypeUniqueCode && errors.accountTypeUniqueCode)}
                        fullWidth
                        helperText={touched.accountTypeUniqueCode && errors.accountTypeUniqueCode}
                        name="accountTypeUniqueCode"
                        onChange={(e) => handleChange(e)}
                        value={accountType.accountTypeUniqueCode}
                        variant="outlined"
                        id="accountTypeUniqueCode"
                        size="small"
                        onBlur={handleBlur}

                      >
                        <MenuItem value="0">--Select Account Type--</MenuItem>
                        {generateDropDownMenu(UniqueAccountTypeCode)}
                      </TextField>
                    </Grid>
                  </Grid>
                  {/* 
                  <Grid container spacing={4} justify="center" style={{ marginTop: '2rem' }} >
                    <Grid item md={4} xs={12} style={{ marginTop: "1rem", marginLeft: "1rem" }}  >

                    </Grid>
                  </Grid> */}

                  <Grid container spacing={4} style={{ marginTop: '2rem' }} >
                    {/* <Grid item md={2} xs={12}></Grid>
                    <Grid item md={4} xs={12} style={{ marginTop: '0.5rem', }} justify="left">
                      <FormControl component="fieldset" >
                        <FormLabel component="legend"></FormLabel>
                        <RadioGroup aria-label="entryType" name="entryType" value={value} onChange={handleChange1} row>
                          <FormControlLabel value="2" control={<Radio />} label="Debit" />
                          <FormControlLabel value="1" control={<Radio />} label="Credit" />
                        </RadioGroup>
                      </FormControl>
                    </Grid> */}

                    <Grid item md={10} xs={12} style={{ marginTop: '0.5rem' }} align="center">
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

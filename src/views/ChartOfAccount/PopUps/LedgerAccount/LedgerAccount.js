import React, { useState, useEffect } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import {
  Box,
  Card,
  InputLabel,
  Button,
  Grid,
  TextField,
  MenuItem,
  CardHeader,
  Switch
} from '@material-ui/core';
import services from '../../Services';
import { useAlert } from 'react-alert';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from 'src/utils/permissionAuth';
import tokenService from 'src/utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from '@material-ui/pickers';
import PerfectScrollbar from 'react-perfect-scrollbar';

const screenCode = 'CHARTOFACCOUNT';
export const LedgerAccountPopUp = ({ openLedgerAccount, HandleCreateAccount }) => {

  const [ledgerAccount, setLedgerAccount] = useState({
    groupID: 0,
    factoryID: 0,
    parentHeaderID: 0,
    childHeaderID: 0,
    ledgerAccountName: '',
    ledgerAccountCode: '',
    description: '',
    accountNumber: '',
    chequeNumber: '',
    balance: '',
    asOf: new Date(),
    maximumAmount: '',
    accountTypeID: 0,
    statusID: '',
    bankID: '0',
    branchID: '0',
    ifBank: false,
    balanceEntryTypeID: 0,
    ledgerAccountTypeID: 0
  });

  const alert = useAlert();
  const [groups, setGroups] = useState();
  const [accountTypeNames, setAccountTypeNames] = useState();
  const [parentHeaderNames, setParentHeaderNames] = useState();
  const [childHeaderNames, setChildHeaderNames] = useState();
  const [ledgerAccountTypes, setLedgerAccountTypes] = useState();
  const [factories, setFactories] = useState();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: true,
    isFactoryFilterEnabled: true
  });
  const [selectedDate, handleDateChange] = useState(new Date());
  const [branchList, setBranchList] = useState([]);
  const [bankList, setBankList] = useState();

  const navigate = useNavigate();
  const BankEnabledHandleChange = () => {
    setLedgerAccount({
      ...ledgerAccount,
      ifBank: !ledgerAccount.ifBank
    });
  };
  useEffect(() => {
    if (openLedgerAccount) {
      getGroupsForDropdown();
      getPermission();
      getBanksForDropdown();
    }
  }, [openLedgerAccount]);

  useEffect(() => {
    if (openLedgerAccount) {
      getfactoriesForDropDown();
    }
  }, [ledgerAccount.groupID, openLedgerAccount]);

  useEffect(() => {
    if (openLedgerAccount) {
      getAccountTypeNamesForDropdown();
    }
  }, [ledgerAccount.factoryID, openLedgerAccount]);

  useEffect(() => {
    if (openLedgerAccount) {
      getParentHeadersByAccountTypeID(ledgerAccount.accountTypeID);
    }
  }, [ledgerAccount.accountTypeID, openLedgerAccount]);

  useEffect(() => {
    if (openLedgerAccount) {
      getChildHeadersByParentTypeID(ledgerAccount.parentHeaderID);
    }
  }, [ledgerAccount.parentHeaderID, openLedgerAccount]);

  useEffect(() => {
    if (openLedgerAccount) {
      getLatestLedgerAccountCode(ledgerAccount.childHeaderID);
    }
  }, [ledgerAccount.childHeaderID, openLedgerAccount]);

  useEffect(() => {
    if (openLedgerAccount) {
      getBranchesForDropdown();
    }
  }, [ledgerAccount.bankID, openLedgerAccount]);

  useEffect(() => {
    if (openLedgerAccount) {
      getLedgerAccountTypes();
    }
  }, [ledgerAccount.groupID, openLedgerAccount]);

  useEffect(() => {
    clearData();
  }, [openLedgerAccount]);

  function handleChange(e) {
    const target = e.target;
    const value = target.value;

    setLedgerAccount({
      ...ledgerAccount,
      [e.target.name]: value
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

  function clearData() {
    setLedgerAccount({
      ...ledgerAccount,
      parentHeaderID: 0,
      childHeaderID: 0,
      ledgerAccountName: '',
      ledgerAccountCode: '',
      description: '',
      accountNumber: '',
      chequeNumber: '',
      balance: '',
      asOf: '',
      maximumAmount: '',
      accountTypeID: 0,
      bankID: 0,
      branchID: 0,
      ifBank: false,
      balanceEntryTypeID: 0,
      ledgerAccountTypeID: 0
    });

  }

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);

    var isAuthorized = permissions.find(
      p => p.permissionCode === 'VIEWCHARTOFACCOUNT'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode === 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode === 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setLedgerAccount({
      ...ledgerAccount,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(
      ledgerAccount.groupID
    );
    setFactories(factory);
  }

  async function getAccountTypeNamesForDropdown() {
    const accounts = await services.getAccountTypeNamesForDropdown(
      ledgerAccount.groupID,
      ledgerAccount.factoryID
    );
    setAccountTypeNames(accounts);
  }

  async function getAccountTypeNamesForDropdown() {
    const accounts = await services.getAccountTypeNamesForDropdown(
      ledgerAccount.groupID,
      ledgerAccount.factoryID
    );
    setAccountTypeNames(accounts);
  }

  async function getParentHeadersByAccountTypeID(id) {
    const parent = await services.getParentHeadersByAccountTypeID(id);
    setParentHeaderNames(parent);
  }

  async function getChildHeadersByParentTypeID(id) {
    const parent = await services.getChildHeadersByParentTypeID(id);
    setChildHeaderNames(parent);
  }

  async function getBanksForDropdown() {
    const bank = await services.getBanksForDropdown();
    setBankList(bank);
  }

  async function getBranchesForDropdown() {
    const branch = await services.getBranchesByBankID(
      parseInt(ledgerAccount.bankID)
    );
    setBranchList(branch);
  }

  async function getLedgerAccountTypes() {
    const ledgerAccountType = await services.getLedgerAccountTypes(ledgerAccount.groupID);
    setLedgerAccountTypes(ledgerAccountType);
  }

  async function saveLedgerAccount() {

    if (ledgerAccount.description === " " || ledgerAccount.description.match(/^\s+$/) !== null) {
      alert.error("description should not be empty spaces");
      return;
    }
    let ledgerModel = {
      groupID: parseInt(ledgerAccount.groupID),
      factoryID: parseInt(ledgerAccount.factoryID),
      parentHeaderID: parseInt(ledgerAccount.parentHeaderID),
      childHeaderID: parseInt(ledgerAccount.childHeaderID),
      ledgerAccountName: ledgerAccount.ledgerAccountName,
      ledgerAccountCode: ledgerAccount.ledgerAccountCode,
      description: ledgerAccount.description,
      accountNumber: ledgerAccount.accountNumber,
      chequeNumber: ledgerAccount.chequeNumber,
      balance: ledgerAccount.balance,
      asOf: selectedDate,
      maximumAmount: ledgerAccount.maximumAmount,
      accountTypeID: parseInt(ledgerAccount.accountTypeID),
      bankID: parseInt(ledgerAccount.bankID),
      branchID: parseInt(ledgerAccount.branchID),
      isBank: ledgerAccount.ifBank,
      balanceEntryTypeID: ledgerAccount.balanceEntryTypeID,
      ledgerAccountTypeID: parseInt(ledgerAccount.ledgerAccountTypeID)
    }

    let response = await services.saveLedgerAccount(ledgerModel);
    if (response.statusCode == 'Success') {
      alert.success(response.message);
      clearData();
      HandleCreateAccount();
    } else {
      alert.error(response.message);
      clearData();
    }
  }

  async function getLatestLedgerAccountCode(childHeaderID) {
    if (childHeaderID != 0) {
      var result = await services.getLatestLedgerAccountCode(childHeaderID);

      if (result === null) {
        var resultCode = await services.getChildHeaderCode(childHeaderID);
        var splitNum = resultCode.childHeaderCode.split('-')[1];
        var splitNum0 = resultCode.childHeaderCode.split('-')[0];
        const ledgerValue = splitNum.substring(5, 8);
        const childValue = splitNum.substring(2, 5);
        const childValueBase = splitNum.substring(0, 2);
        const accountValue = splitNum0;

        setLedgerAccount({
          ...ledgerAccount,
          ledgerAccountCode: `${accountValue}-${childValueBase}${childValue}${(
            parseInt(ledgerValue) + 1
          )
            .toString()
            .padStart(3, '0')}`
        });
      } else {
        var splitNum = result.ledgerAccountCode.split('-')[1];
        var splitNum0 = result.ledgerAccountCode.split('-')[0];
        const ledgerValue = splitNum.substring(5, 8);
        const childValue = splitNum.substring(2, 5);
        const childValueBase = splitNum.substring(0, 2);
        const accountValue = splitNum0;
        setLedgerAccount({
          ...ledgerAccount,
          ledgerAccountCode: `${accountValue}-${childValueBase}${childValue}${(
            parseInt(ledgerValue) + 1
          )
            .toString()
            .padStart(3, '0')}`
        });
      }
    } else {
      setLedgerAccount({
        ...ledgerAccount,
        ledgerAccountCode: '',
        ledgerAccountName: ''
      });
    }
  }

  return (
    <div>
      <Modal
        open={openLedgerAccount}
        onClose={HandleCreateAccount}
        center
        animationDuration={100}
      >
        <h2>Ledger Account Creation</h2><br />

        <Card>
          <Formik
            initialValues={{
              groupID: ledgerAccount.groupID,
              factoryID: ledgerAccount.factoryID,
              parentHeaderID: ledgerAccount.parentHeaderID,
              childHeaderID: ledgerAccount.childHeaderID,
              ledgerAccountName: ledgerAccount.ledgerAccountName,
              ledgerAccountCode: ledgerAccount.ledgerAccountCode,
              description: ledgerAccount.description,
              accountNumber: ledgerAccount.accountNumber,
              chequeNumber: ledgerAccount.chequeNumber,
              balance: ledgerAccount.balance,
              asOf: selectedDate,
              maximumAmount: ledgerAccount.maximumAmount,
              accountTypeID: ledgerAccount.accountTypeID,
              bankID: ledgerAccount.bankID,
              branchID: ledgerAccount.branchID,
              isBank: ledgerAccount.ifBank,
              balanceEntryTypeID: ledgerAccount.balanceEntryTypeID,
              ledgerAccountTypeID: ledgerAccount.ledgerAccountTypeID,
            }}
            validationSchema={Yup.object().shape({
              accountTypeID: Yup.number()
                .required('Account Type Name is required')
                .min('1', 'Account Type Name is required'),
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Estate is required')
                .min('1', 'Estate is required'),
              parentHeaderID: Yup.number()
                .required('Parent Header is required')
                .min('1', 'Parent Header is required'),
              childHeaderID: Yup.number()
                .required('Child Header is required')
                .min('1', 'Child Header is required'),
              ledgerAccountName: Yup.string().trim().matches(/^[a-zA-Z-/\d\s]+$/, 'Special Characters Not Allowed').required('Ledger Account Name is required'),
              ledgerAccountCode: Yup.string().trim().matches(/^[a-zA-Z-\d\s]+$/, 'Special Characters Not Allowed').required(
                'Ledger Account Code is required'
              ),
              description: Yup.string().max(250, 'Allow only 250 digits').trim().nullable(),
              chequeNumber: Yup.string().nullable(),
              balance: Yup.number().min("0", 'Invalid value'),
              maximumAmount: Yup.string().nullable(),
              bankID: Yup.number().when('isBank', {
                is: val => val === true,
                then: Yup.number().min('1', 'Select a bank')
              }),
              branchID: Yup.number().when('isBank', {
                is: val => val > 0,
                then: Yup.number().min('1', 'Select a branch')
              }),

              accountNumber: Yup.number().when('isBank', {
                is: true,
                then: Yup.number().required('Account number is required').min("1", 'Account number is required'),
              }
              ),
              balanceEntryTypeID: Yup.number().when('balance', {
                is: val => val > 0,
                then: Yup.number().min('1', 'Balance Entry Type required')
              }),
            })}
            onSubmit={saveLedgerAccount}
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
                <Box height={620} width={760} borderRadius={16} border={1}>
                  <PerfectScrollbar>
                    <Box >

                      <CardHeader title="Account Information " />

                      <Grid container spacing={1} style={{ marginTop: '1rem' }}>
                        <Grid item md={1} xs={12}> </Grid>
                        <Grid item md={5} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group *
                          </InputLabel>
                          <TextField
                            select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={e => handleChange(e)}
                            value={ledgerAccount.groupID}
                            variant="outlined"
                            id="groupID"
                            size="small"
                            disabled={!permissionList.isGroupFilterEnabled}
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>
                        <Grid item md={5} xs={12}  >
                          <InputLabel shrink id="factoryID">
                            Estate *
                          </InputLabel>
                          <TextField
                            select
                            error={Boolean(touched.factoryID && errors.factoryID)}
                            fullWidth
                            helperText={touched.factoryID && errors.factoryID}
                            name="factoryID"
                            onBlur={handleBlur}
                            onChange={e => handleChange(e)}
                            value={ledgerAccount.factoryID}
                            variant="outlined"
                            id="factoryID"
                            size="small"
                            disabled={!permissionList.isFactoryFilterEnabled}
                          >
                            <MenuItem value="0">--Select Estate--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                        <Grid item md={1} xs={12}> </Grid>
                      </Grid>

                      <Grid container spacing={1} style={{ marginTop: '1rem' }} >
                        <Grid item md={1} xs={12}> </Grid>
                        <Grid item md={5} xs={12}  >
                          <InputLabel shrink id="accountTypeID">
                            Account Type *
                          </InputLabel>

                          <TextField
                            select
                            error={Boolean(
                              touched.accountTypeID && errors.accountTypeID
                            )}
                            helperText={
                              touched.accountTypeID && errors.accountTypeID
                            }
                            onBlur={handleBlur}
                            name="accountTypeID"
                            onChange={e => handleChange(e)}
                            value={ledgerAccount.accountTypeID}
                            variant="outlined"
                            id="accountTypeID"
                            size="small"
                            fullWidth
                          >
                            <MenuItem value="0">
                              --Select Account Type --
                            </MenuItem>
                            {generateDropDownMenu(accountTypeNames)}
                          </TextField>
                        </Grid>

                        <Grid item md={5} xs={12}  >
                          <InputLabel shrink id="parentHeaderID">
                            Parent Header *
                          </InputLabel>

                          <TextField
                            select
                            error={Boolean(
                              touched.parentHeaderID && errors.parentHeaderID
                            )}
                            helperText={
                              touched.parentHeaderID && errors.parentHeaderID
                            }
                            onBlur={handleBlur}
                            name="parentHeaderID"
                            onChange={e => handleChange(e)}
                            value={ledgerAccount.parentHeaderID}
                            variant="outlined"
                            id="parentHeaderID"
                            size="small"
                            fullWidth
                          >
                            <MenuItem value="0">
                              --Select Parent Header--
                            </MenuItem>
                            {generateDropDownMenu(parentHeaderNames)}
                          </TextField>
                        </Grid>

                        <Grid item md={1} xs={12}> </Grid>
                      </Grid>

                      <Grid container spacing={1} style={{ marginTop: '1rem' }}>
                        <Grid item md={1} xs={12}> </Grid>

                        <Grid item md={5} xs={12}  >
                          <InputLabel shrink id="childHeaderID">
                            Child Header *
                          </InputLabel>

                          <TextField
                            select
                            error={Boolean(
                              touched.childHeaderID && errors.childHeaderID
                            )}
                            helperText={
                              touched.childHeaderID && errors.childHeaderID
                            }
                            onBlur={handleBlur}
                            name="childHeaderID"
                            onChange={e => handleChange(e)}
                            value={ledgerAccount.childHeaderID}
                            variant="outlined"
                            id="childHeaderID"
                            size="small"
                            fullWidth
                          >
                            <MenuItem value="0">--Select Child Header--</MenuItem>
                            {generateDropDownMenu(childHeaderNames)}
                          </TextField>
                        </Grid>
                        <Grid item md={5} xs={12}>
                          <InputLabel shrink id="ledgerAccountTypeID">
                            Ledger Account Type
                          </InputLabel>
                          <TextField
                            select
                            fullWidth
                            name="ledgerAccountTypeID"
                            onBlur={handleBlur}
                            onChange={e => handleChange(e)}
                            value={ledgerAccount.ledgerAccountTypeID}
                            variant="outlined"
                            id="ledgerAccountTypeID"
                            size="small"
                          >
                            <MenuItem value="0">--Select Ledger Account Type--</MenuItem>
                            {generateDropDownMenu(ledgerAccountTypes)}
                          </TextField>
                        </Grid>

                        <Grid item md={1} xs={12}> </Grid>
                      </Grid>

                      <Grid container spacing={1} style={{ marginTop: '1rem' }} >
                        <Grid item md={1} xs={12}> </Grid>
                        <Grid item md={5} xs={12}  >
                          <InputLabel shrink id="ledgerAccountName">
                            Ledger Account Name *
                          </InputLabel>

                          <TextField
                            error={Boolean(
                              touched.ledgerAccountName &&
                              errors.ledgerAccountName
                            )}
                            helperText={
                              touched.ledgerAccountName &&
                              errors.ledgerAccountName
                            }
                            onBlur={handleBlur}
                            name="ledgerAccountName"
                            onChange={e => handleChange(e)}
                            value={ledgerAccount.ledgerAccountName}
                            variant="outlined"
                            id="ledgerAccountName"
                            size="small"
                            fullWidth
                          ></TextField>
                        </Grid>
                        <Grid item md={5} xs={12}   >
                          <InputLabel shrink id="ledgerAccountCode">
                            Ledger Account Code *
                          </InputLabel>

                          <TextField
                            error={Boolean(
                              touched.ledgerAccountCode &&
                              errors.ledgerAccountCode
                            )}
                            helperText={
                              touched.ledgerAccountCode &&
                              errors.ledgerAccountCode
                            }
                            onBlur={handleBlur}
                            name="ledgerAccountCode"
                            onChange={e => handleChange(e)}
                            value={ledgerAccount.ledgerAccountCode}
                            variant="outlined"
                            id="ledgerAccountCode"
                            size="small"
                            fullWidth
                          ></TextField>
                        </Grid>


                      </Grid>
                      <Grid container spacing={1} style={{ marginTop: '1rem' }} >
                        <Grid item md={1} xs={12}> </Grid>
                        <Grid item md={5} xs={12}   >
                          <InputLabel shrink id="description">
                            Description
                          </InputLabel>

                          <TextField
                            error={Boolean(
                              touched.description && errors.description
                            )}
                            helperText={touched.description && errors.description}
                            onBlur={handleBlur}
                            name="description"
                            onChange={e => handleChange(e)}
                            value={ledgerAccount.description}
                            variant="outlined"
                            id="description"
                            size="small"
                            fullWidth
                          ></TextField>
                        </Grid>

                      </Grid>
                      <Grid container spacing={1} style={{ marginTop: '1rem' }}>
                        <Grid item md={1} xs={12}> </Grid>
                        <Grid item md={1} xs={12}  >
                          <InputLabel shrink id="ifBank">
                            if Bank
                          </InputLabel>
                          <Switch
                            checked={values.ifBank}
                            onChange={BankEnabledHandleChange}
                            name="ifBank"
                            value={ledgerAccount.ifBank}
                          />
                        </Grid>
                        {ledgerAccount.ifBank == true ? (
                          <Grid
                            item
                            md={3}
                            xs={12}
                            style={{ marginTop: '1rem', marginLeft: '0.5rem' }}
                          >
                            <InputLabel shrink id="bankID">
                              Bank *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.bankID && errors.bankID)}
                              fullWidth
                              helperText={touched.bankID && errors.bankID}
                              name="bankID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={ledgerAccount.bankID}
                              variant="outlined"
                              size="small"
                              disabled={ledgerAccount.ifBank ? false : true}
                            >
                              <MenuItem value="0">--Select Bank--</MenuItem>
                              {generateDropDownMenu(bankList)}
                            </TextField>
                          </Grid>
                        ) : (
                          false
                        )}
                        {ledgerAccount.ifBank == true ? (
                          <Grid
                            item
                            md={3}
                            xs={12}
                            style={{ marginTop: '1rem', marginLeft: '0.5rem' }}
                          >
                            <InputLabel shrink id="branchID">
                              Branch *
                            </InputLabel>
                            <TextField
                              select
                              fullWidth
                              error={Boolean(touched.branchID && errors.branchID)}
                              helperText={touched.branchID && errors.branchID}
                              onBlur={handleBlur}
                              id="branchID"
                              name="branchID"
                              value={ledgerAccount.branchID}
                              type="text"
                              variant="outlined"
                              size="small"
                              disabled={ledgerAccount.ifBank ? false : true}
                              onChange={e => handleChange(e)}
                            >
                              <MenuItem value="0">--Select Branch--</MenuItem>
                              {generateDropDownMenu(branchList)}
                            </TextField>
                          </Grid>
                        ) : (
                          false
                        )}
                        {ledgerAccount.ifBank == true ? (
                          <Grid item md={3} xs={12} style={{ marginTop: '1rem', marginLeft: '0.5rem' }} >
                            <InputLabel shrink id="accountNumber">
                              Account Number *
                            </InputLabel>

                            <TextField
                              error={Boolean(
                                touched.accountNumber && errors.accountNumber
                              )}
                              helperText={
                                touched.accountNumber && errors.accountNumber
                              }
                              onBlur={handleBlur}
                              name="accountNumber"
                              onChange={e => handleChange(e)}
                              value={ledgerAccount.accountNumber}
                              variant="outlined"
                              type='number'
                              id="accountNumber"
                              size="small"
                              fullWidth
                              disabled={ledgerAccount.ifBank ? false : true}
                            ></TextField>
                          </Grid>
                        ) : (
                          false
                        )}
                      </Grid>

                      <Grid container spacing={1} style={{ marginTop: '1rem' }} >
                        {/* <Grid item md={5} xs={12} style={{ marginTop: '1rem' }}>
                        <InputLabel shrink id="chequeNumber">
                          Cheque Number
                        </InputLabel>

                        <TextField
                          error={Boolean(
                            touched.chequeNumber && errors.chequeNumber
                          )}
                          helperText={
                            touched.chequeNumber && errors.chequeNumber
                          }
                          onBlur={handleBlur}
                          name="chequeNumber"
                          onChange={e => handleChange(e)}
                          value={ledgerAccount.chequeNumber}
                          variant="outlined"
                          id="chequeNumber"
                          size="small"
                          fullWidth
                        ></TextField>
                      </Grid> */}
                        <Grid item md={1} xs={12}> </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="balance">
                            Opening Balance
                          </InputLabel>

                          <TextField
                            error={Boolean(touched.balance && errors.balance)}
                            helperText={touched.balance && errors.balance}
                            onBlur={handleBlur}
                            name="balance"
                            type='number'
                            onChange={e => handleChange(e)}
                            value={ledgerAccount.balance}
                            variant="outlined"
                            id="balance"
                            size="small"
                            fullWidth
                          ></TextField>
                        </Grid>
                        <Grid item md={4} xs={12}   >
                          <InputLabel shrink id="groupID">
                            Balance Entry Type
                          </InputLabel>
                          <TextField
                            select
                            error={Boolean(touched.balanceEntryTypeID && errors.balanceEntryTypeID)}
                            fullWidth
                            helperText={touched.balanceEntryTypeID && errors.balanceEntryTypeID}
                            name="balanceEntryTypeID"
                            onBlur={handleBlur}
                            onChange={e => handleChange(e)}
                            value={ledgerAccount.balanceEntryTypeID}
                            disabled={ledgerAccount.balance > 0 ? false : true}
                            variant="outlined"
                            id="balanceEntryTypeID"
                            size="small"
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            <MenuItem value="1"> Debit </MenuItem>
                            <MenuItem value="2"> Credit </MenuItem>

                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="asOf">
                            as of
                          </InputLabel>

                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.asOf && errors.asOf)}
                              helperText={touched.asOf && errors.asOf}
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              id="asOf"
                              name="asOf"
                              value={selectedDate}
                              maxDate={new Date()}
                              onChange={e => {
                                handleDateChange(e);
                              }}
                              KeyboardButtonProps={{
                                'aria-label': 'change date'
                              }}
                              size="small"
                              autoOk
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={1} xs={12}> </Grid>
                      </Grid>
                      {/*<Grid container  spacing={1} style={{ marginTop: '1rem'}}>
                      <Grid item md={5} xs={12} style={{ marginTop: '1rem' }}>
                        <InputLabel shrink id="maximumAmount">
                          Maximum Amount
                        </InputLabel>

                        <TextField
                          error={Boolean(
                            touched.maximumAmount && errors.maximumAmount
                          )}
                          helperText={
                            touched.maximumAmount && errors.maximumAmount
                          }
                          onBlur={handleBlur}
                          name="maximumAmount"
                          onChange={e => handleChange(e)}
                          value={ledgerAccount.maximumAmount}
                          variant="outlined"
                          id="maximumAmount"
                          size="small"
                          fullWidth
                        ></TextField>
                        </Grid> 
                       
                    </Grid> */}
                    </Box>

                    {/* <Box borderRadius={16} border={1} style={{ marginLeft: '1rem', marginTop: '1rem', marginRight: '1rem', marginBottom: '1rem' }}>
                      <CardHeader
                        title="Default Double Entry Account Information "
                      />
                      <Grid container spacing={1} style={{ marginBottom: "1rem", }} justify="center">
                        <Grid item md={3} xs={12} style={{ marginTop: "1rem", marginLeft: '1rem', }} >

                          <InputLabel shrink id="maximumAmount">
                            Maximum Amount
                          </InputLabel>

                          <TextField
                            error={Boolean(touched.maximumAmount && errors.maximumAmount)}
                            helperText={touched.maximumAmount && errors.maximumAmount}
                            onBlur={handleBlur}
                            name="maximumAmount"
                            onChange={(e) => handleChange(e)}
                            value={ledgerAccount.maximumAmount}
                            variant="outlined"
                            id="maximumAmount"
                            size="small"
                          >
                          </TextField>
                        </Grid>
                      </Grid>
                    </Box> */}

                    <Grid item md={12} xs={12}
                      style={{
                        marginTop: '3rem',
                        marginBottom: '1rem',
                        marginRight: '1rem'
                      }}
                      align="right"
                    >
                      <Box display="flex" justifyContent="flex-end">
                        <Button color="primary" type="submit" variant="contained" size='small'>
                          Save
                        </Button>
                      </Box>
                    </Grid>
                  </PerfectScrollbar>
                </Box>

              </form>
            )}
          </Formik>
        </Card>
      </Modal>
    </div>
  );
};

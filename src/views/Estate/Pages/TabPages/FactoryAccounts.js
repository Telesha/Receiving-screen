import React, { useState, useEffect, Fragment } from 'react';
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
  Select,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import MenuItem from '@material-ui/core/MenuItem';
import DeleteIcon from '@material-ui/icons/Delete';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100%',
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  root1: {
    height: 180,
  },
  container: {
    display: 'flex',
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  },

}));

export function FactoryAccounts({ factoryAccountArray, setFactoryAccountArray, setChecker1, checker1 }) {
  const classes = useStyles();
  const [account, setAccount] = useState({
    bankID: '0',
    branchID: '0',
    accountNumber: '',
    accountName: ''
  });
  const [banks, setBanks] = useState();
  const [branches, setBranches] = useState();
  const [bankArray, setBankArray] = useState([]);
  const [branchArray, setBranchArray] = useState([]);
  const [accountNumArray, setAccountNumArray] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const alert = useAlert();

  useEffect(() => {
    trackPromise(
      getBanksForDropdown());
    trackPromise(branchService());

  }, []);

  useEffect(() => {
    getBranchesForDropdown()
  }, [account.bankID]);

  useEffect(() => {
    btnChecker();
  }, [factoryAccountArray]);

  async function getBanksForDropdown() {
    const bank = await services.getBanksForDropdown();
    setBanks(bank);
    setBankList(bank);
  }

  async function getBranchesForDropdown() {
    const branch = await services.getBranchesByBankID(parseInt(account.bankID));
    setBranches(branch);
  }

  async function saveUser(values) {

    if (account.bankID == '0' || account.branchID == '0' || values.accountNumber == "" || values.accountName == "") {
      alert.error("Fill all fields");
    } else {
      bankArray.push(account.bankID);
      branchArray.push(account.branchID);
      accountNumArray.push(values.accountNumber);

      var facDetails = factoryAccountArray;

      var check = factoryAccountArray.filter((i => parseInt(i.bankID) === parseInt(account.bankID) && parseInt(i.branchID) === parseInt(account.branchID) && i.accountNumber === values.accountNumber));

      if (check.length > 0) {
        alert.error("Entered values already exists");
      }
      else {
        facDetails.push({ bankID: account.bankID, branchID: account.branchID, accountNumber: values.accountNumber, accountName: values.accountName });
        setFactoryAccountArray(facDetails);
        alert.success("Successfully added account details");
      }
      setAccount({
        ...account, bankID: '0', branchID: '0', accountNumber: '', accountName: ''
      })
      clearAccountNumber(values);
      setChecker1(true);
    }
  }
  function clearAccountNumber(data) {
    data.accountNumber = "";
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

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setAccount({
      ...account,
      [e.target.name]: value
    });
  }

  async function DeleteItem(index) {
    if (factoryAccountArray[index].factoryAccountID != undefined) {
      const res = await services.DeleteFactoryAccountItem(factoryAccountArray[index].factoryAccountID);
      setFactoryAccountArray(current => current.filter((img, i) => i != index));
      if (res == 1) {
        alert.success('Account removed successfully');

      } else {
        alert.error('Error occured in item delete');
      }
    }
    else {
      for (var i = 0; i < factoryAccountArray.length; i++) {
        setAccount({
          ...account,
          bankID: factoryAccountArray[i].routeID,
          branchID: factoryAccountArray[i].accountTypeID,
          accountNumber: factoryAccountArray[i].registrationNumber,
        })
      }
      factoryAccountArray.splice(index, 1);
      alert.success('Account removed successfully');
    }
  }

  async function btnChecker() {
    if (factoryAccountArray.length > 0) {
      setChecker1(true);
    }
    else {
      setChecker1(false);
    }
  }

  async function branchService() {
    const branches = await services.getAllBranches();
    setBranchList(branches);
  }

  function settingBranches(data) {
    let branch = branchList.filter((branch => branch.branchID == data));
    var branchName = branch.map(branch => branch.branchName);
    return branchName;
  }

  function settingBanks(data) {
    let bank = bankList.filter((item, index) => index == data);
    return bank;
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Estate Accounts Add Edit">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              bankID: account.bankID,
              branchID: account.branchID,
              accountNumber: account.accountNumber,
              accountName: account.accountName
            }}
            validationSchema={
              Yup.object().shape({
                bankID: Yup.number().min(1, "Bank is required").required('Bank is required'),
                branchID: Yup.number().min("1", 'Branch is required').required('Branch is required'),
                accountNumber: Yup.string().max(30, 'Max 30 digits').matches(/^[0-9]+$/, 'Account number must contains only digits').required('Account Number is required'),
                accountName: Yup.string().max(150, 'Max 150 digits').matches(/^[A-Z a-z]+$/, 'Account Name must contains only texts').required('Account Name is required'),
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
              values,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={3}>
                  <Card className={classes.cardContent}>
                    <CardHeader
                      title="Add Estate Accounts"
                    />

                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="bankID">
                              Bank *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.bankID && errors.bankID)}
                              fullWidth
                              helperText={touched.bankID && errors.bankID}
                              name="bankID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={account.bankID}
                              size='small'
                              variant="outlined"
                            >
                              <MenuItem value={0}>--Select Bank--</MenuItem>
                              {generateDropDownMenu(banks)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="branchID">
                              Branch *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.branchID && errors.branchID)}
                              fullWidth
                              helperText={touched.branchID && errors.branchID}
                              name="branchID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={account.branchID}
                              size='small'
                              variant="outlined"
                            >
                              <MenuItem value={0}>--Select Branch--</MenuItem>
                              {generateDropDownMenu(branches)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="accountNumber">
                              Account Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.accountNumber && errors.accountNumber)}
                              fullWidth
                              helperText={touched.accountNumber && errors.accountNumber}
                              name="accountNumber"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.accountNumber}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="accountName">
                              Account Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.accountName && errors.accountName)}
                              fullWidth
                              helperText={touched.accountName && errors.accountName}
                              name="accountName"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.accountName}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>

                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting}
                          type="submit"
                          variant="contained"
                          size='small'
                        >
                          Add
                        </Button>
                      </Box>
                      <Divider />
                      <CardContent>
                        {(factoryAccountArray.length > 0) ?
                          <PerfectScrollbar>
                            <Box minWidth={1050}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell align={'center'} >Bank</TableCell>
                                    <TableCell align={'center'} >Branch</TableCell>
                                    <TableCell align={'center'} >Account Number</TableCell>
                                    <TableCell align={'center'} >Account Name</TableCell>
                                    <TableCell align={'center'} >Action</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {factoryAccountArray.map((rowData, index) => (
                                    <TableRow key={index}>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {settingBanks(rowData.bankID)}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {settingBranches(rowData.branchID)}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {rowData.accountNumber}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {rowData.accountName}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        <Button onClick={() => DeleteItem(index)}>
                                          <DeleteIcon
                                            style={{
                                              color: "red"
                                            }}
                                          >
                                          </DeleteIcon>
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </PerfectScrollbar>
                          : null}
                      </CardContent>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>

      </Page>
    </Fragment >
  );
};

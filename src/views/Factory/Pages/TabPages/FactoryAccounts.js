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
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import DeleteIcon from '@material-ui/icons/Delete';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { AlertDialogWithoutButton } from 'src/views/Common/AlertDialogWithoutButton';

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

export function FactoryAccounts({ factoryAccountArray, setFactoryAccountArray, setChecker1, checker1, checkAllTabFill }) {
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
  const [bankID, setBankID] = useState(null);
  const [branchID, setBranchID] = useState(null);
  const [dialog, setDialog] = useState(false);
  const [tableIndex, setTableIndex] = useState([]);
  const alert = useAlert();

  useEffect(() => {
    trackPromise(
      getBanksForDropdown());
    trackPromise(branchService());

  }, []);

  useEffect(() => {
    trackPromise(
      getBranchesForDropdown()
    );
  }, [account.bankID]);

  useEffect(() => {
    btnChecker();
  }, [factoryAccountArray]);

  async function getBanksForDropdown() {
    const bank = await services.getBanksForTable();
    setBanks(bank);
    const tableBank = await services.getBanksForDropdown();
    setBankList(tableBank);
  }

  async function getBranchesForDropdown() {
    const Branches = await services.getBranchesByBankIDForTable(account.bankID);
    setBranches(Branches);
  }

  async function saveUser(values) {
    setBankID(null);
    setBranchID(null);


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
        alert.success("Account Details Added Successfully");
      }
      setAccount({
        ...account, bankID: '0', branchID: '0', accountNumber: '', accountName: ''
      })
      clearAccountNumber(values);
      setChecker1(true);
    }
    checkAllTabFill();
  }
  function clearAccountNumber(data) {
    data.accountNumber = "";
  }

  async function DeleteItem(index) {
    setDialog(true)
    setTableIndex(index);

  }

  async function confirmRequest() {
    if (factoryAccountArray[tableIndex].factoryAccountID != undefined) {
      const res = await services.DeleteFactoryAccountItem(factoryAccountArray[tableIndex].factoryAccountID);
      setFactoryAccountArray(current => current.filter((img, i) => i != tableIndex));
      if (res == 1) {
        alert.success('Account removed successfully');
        setDialog(false);

      } else {
        alert.error('Error occured in item delete');
        setDialog(false);
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
      factoryAccountArray.splice(tableIndex, 1);
      alert.success('Account removed successfully');
      setDialog(false);
    }
    checkAllTabFill();

  }

  async function cancelRequest() {
    setDialog(false)
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

  function handleSearchDropdownChangeBank(data, e) {

    if (data === undefined || data === null) {
      setBankID(null);
      setAccount({
        ...account,
        bankID: '0'
      });
      return;
    } else {
      setBankID(data);
      var nameV = "bankID";
      var valueV = data["bankID"];

      setAccount({
        ...account,
        bankID: valueV.toString()
      });
    }

  }

  function handleSearchDropdownChange(data, e) {

    if (data === undefined || data === null) {
      setBranchID(null)
      setAccount({
        ...account,
        branchID: '0'
      });
      return;
    } else {
      setBranchID(data)
      var nameV = "branchID";
      var valueV = data["branchID"];

      setAccount({
        ...account,
        branchID: valueV.toString()
      });
    }

  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Factory Accounts Add Edit">
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
                accountNumber: Yup.string().max(30, 'Max 30 digits').matches(/^(?!\s)/, 'Account number should not start with a space').matches(/^[0-9]+$/, 'Account number must contains only digits').required('Account number is required'),
                accountName: Yup.string().max(150, 'Max 150 digits').matches(/^(?!\s)/, 'Account name should not start with a space').matches(/^[A-Za-z_._\s]+$/, 'Account name must contains only texts').matches(/^(?!\s)/, 'Only alphabets and special characters are allowed').required('Account Name is required'),
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
                      title="Add Factory Accounts"
                    />

                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="bankID">
                              Bank *
                            </InputLabel>
                            <Autocomplete
                              id="bankID"
                              options={banks}
                              getOptionLabel={(option) => option.bankName.toString()}
                              onChange={(e, value) => handleSearchDropdownChangeBank(value, e)}
                              defaultValue={null}
                              value={bankID ?? null}
                              renderInput={(params) =>
                                <TextField {...params}
                                  variant="outlined"
                                  name="bankID"
                                  fullWidth
                                  size='small'
                                  value={account.bankID}
                                  getOptionDisabled={true}
                                  helperText={touched.bankID && errors.bankID}
                                  onBlur={handleBlur}
                                  error={Boolean(touched.bankID && errors.bankID)}
                                />
                              }
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="branchID">
                              Branch *
                            </InputLabel>
                            <Autocomplete
                              id="branchID"
                              options={branches}
                              getOptionLabel={(option) => option.branchName.toString()}
                              onChange={(e, value) => handleSearchDropdownChange(value, e)}
                              defaultValue={null}
                              value={branchID ?? null}
                              renderInput={(params) =>
                                <TextField {...params}
                                  variant="outlined"
                                  name="branchID"
                                  fullWidth
                                  size='small'
                                  value={account.branchID}
                                  getOptionDisabled={true}
                                  error={Boolean(touched.branchID && errors.branchID)}
                                  helperText={touched.branchID && errors.branchID}
                                  onBlur={handleBlur}
                                />
                              }
                            />
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
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.accountNumber}
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
                              size='small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values.accountName}
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
                                          <Tooltip
                                            title="Delete Account"
                                            placement='right'
                                            backgroundColor='white'>
                                            <DeleteIcon
                                              style={{
                                                color: "red"
                                              }}
                                            >
                                            </DeleteIcon>
                                          </Tooltip>
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                            {dialog ?
                              <AlertDialogWithoutButton confirmData={confirmRequest} cancelData={cancelRequest}
                                headerMessage={"Operation Entity Accounts"}
                                discription={"Are you sure you want to delete operation entity account?"} />
                              : null}
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

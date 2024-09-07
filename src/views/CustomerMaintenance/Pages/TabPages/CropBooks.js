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
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
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
import { AlertDialogWithoutButton } from '../../../Common/AlertDialogWithoutButton';
import CreateIcon from '@material-ui/icons/Create';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { WarningDialogBox } from 'src/views/Common/WarningDialogBox';


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
  paper: {
    margin: theme.spacing(1),
    display: 'inline-block',
    backgroundColor: 'white',
    width: 1000
  },
  svg: {
    width: 'fullWidth',
    height: 100,
  },
  polygon: {
    fill: theme.palette.common.white,
    stroke: theme.palette.divider,
    strokeWidth: 1,
  },
  table: {
    minWidth: 150,
  },
  cardContent: {
    border: `2px solid #e8eaf6`
  }
}));

export function CustomerCropBook({ cropBookArray, setCropBookArray, cusGeneralArray,
  setStandingOrdersArray, setStandingFundsArray, standingOrdersArray, standingFundsArray, setIsMainButtonEnable }) {
  const classes = useStyles();
  const [cropBook, setCropBook] = useState({
    routeID: '0',
    accountTypeID: '0',
    registrationNumber: '',
    paymentTypeID: '0',
    bankID: '0',
    branchID: '0',
    accountNumber: '',
    accountHolderName: ''
  });
  const alert = useAlert();
  const [routes, setRoutes] = useState();
  const [routeArray, setRouteArray] = useState([]);
  const [acountTypeArray, setAcountTypeArray] = useState([]);
  const [registrationArray, setRegistrationArray] = useState([]);
  const [routeList, setRouteList] = useState([]);
  const [dialogbox, setDialogbox] = useState(false);
  const [dialogboxIsDefault, setDialogboxIsDefault] = useState(false);
  const [tempDeleteIndex, setTempDeleteIndex] = useState({});
  const [FormIsReadyToUpdate, setFormIsReadyToUpdate] = useState(false)
  const [banks, setBanks] = useState();
  const [branches, setBranches] = useState();
  const [branch, setBranch] = useState();
  const [branchList, setBranchList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [regNo, setRegNo] = useState();
  const [DeletedRegNo, setDeletedRegNo] = useState();
  const [editCustomerAccID, setEditCustomerAccID] = useState();
  const [isFormFeildDisabled, setIsFormFeildDisabled] = useState(false);

  useEffect(() => {
    trackPromise(getAllRoutesForDropDown());
    trackPromise(getBanksForDropdown())
    trackPromise(branchService())
  }, []);

  useEffect(() => {
    getBranchesForDropdown()
  }, [cropBook.bankID]);

  useEffect(() => {
    if (FormIsReadyToUpdate == false) {
      setCropBook({
        ...cropBook,
        accountNumber: '',
        accountHolderName: ''
      })
    }
  }, [cropBook.paymentTypeID])

  async function branchService() {
    const branches = await services.getAllBranches();
    setBranchList(branches);
  }

  async function getBranchesForDropdown() {
    const branch = await services.getBranchesByBankIDForTable(parseInt(cropBook.bankID));
    var branchArray = [];
    for (let item of Object.entries(branch)) {
      branchArray[item[1]["branchID"]] = item[1]["branchName"];
    }
    setBranches(branch);
    setBranch(branchArray);
  }
  async function getBanksForDropdown() {
    const bank = await services.getBanksForTable();
    setBanks(bank);
    const tableBank = await services.getBanksForDropdown();
    setBankList(tableBank);
  }

  function handleSearchDropdownChange(data, e) {
    if (data === undefined || data === null) {
      setCropBook({
        ...cropBook,
        branchID: '0'
      });
      return;
    } else {
      var nameV = "branchID";
      var valueV = data["branchID"];

      setCropBook({
        ...cropBook,
        branchID: valueV.toString()
      });
    }
  }

  function handleSearchDropdownChangeBank(data, e) {
    if (data === undefined || data === null) {
      setCropBook({
        ...cropBook,
        bankID: '0'
      });
      return;
    } else {
      var nameV = "bankID";
      var valueV = data["bankID"];

      setCropBook({
        ...cropBook,
        bankID: valueV.toString()
      });
    }

  }

  async function refreshWhenCropBookChange(cropBookResult) {

    let removedstandingOrders = standingOrdersArray.filter(o1 => !cropBookResult.some(o2 => o1.cropRegNo === o2.registrationNumber));
    let removedstandingFunds = standingFundsArray.filter(o1 => !cropBookResult.some(o2 => o1.cropRegNo === o2.registrationNumber));

    for (var i = 0; i < removedstandingOrders.length; i++) {
      if (removedstandingOrders[i].standingOrderID !== undefined) {
        await services.DeleteStandingOrderItem(removedstandingOrders[i].standingOrderID);
      }
    }

    for (var i = 0; i < removedstandingFunds.length; i++) {
      if (removedstandingFunds[i].fundID !== undefined) {
        await services.DeleteStandingFundItem(removedstandingFunds[i].fundID);
      }
    }

    let cropyOfStandingOrdersArray = standingOrdersArray.filter(o1 => cropBookResult.some(o2 => o1.cropRegNo === o2.registrationNumber));
    let cropyOfStandingFundsArray = standingFundsArray.filter(o1 => cropBookResult.some(o2 => o1.cropRegNo === o2.registrationNumber));

    setStandingOrdersArray(cropyOfStandingOrdersArray);
    setStandingFundsArray(cropyOfStandingFundsArray);
  }

  async function getAllRoutesForDropDown() {
    const route = await services.getRoutesForDropDown(cusGeneralArray.factoryID);
    setRoutes(route);
    setRouteList(route);
  }

  async function saveCrop(values) {
    if (FormIsReadyToUpdate) {
      const dataUpdate = [...cropBookArray];
      if (editCustomerAccID != undefined) {
        let selectedCropDetail = dataUpdate.find(x => x.customerAccountID === editCustomerAccID)
        let response = await services.CheckTransactionDetailsByRegNumber(selectedCropDetail.registrationNumber, editCustomerAccID)
        if (response.length != 0) {
          let transactionIndex = dataUpdate.map(x => x.customerAccountID).indexOf(editCustomerAccID);

          dataUpdate[transactionIndex] = {
            accountHolderName: values.paymentTypeID === "1" ? values.accountHolderName : "",
            accountNumber: values.paymentTypeID === "1" ? values.accountNumber : "",
            bankID: values.paymentTypeID === "1" ? parseInt(values.bankID.toString()) : 0,
            branchID: values.paymentTypeID === "1" ? parseInt(values.branchID.toString()) : 0,
            disbursmentType: parseInt(values.paymentTypeID.toString()),

            customerAccountID: selectedCropDetail.customerAccountID,
            customerID: selectedCropDetail.customerID,
            customerPaymentMethodID: selectedCropDetail.customerPaymentMethodID,
            accountTypeID: values.accountTypeID,
            isDefault: selectedCropDetail.isDefault,
            registrationNumber: values.registrationNumber,
            routeID: selectedCropDetail.routeID,
          }

          setCropBookArray(dataUpdate);
          setFormIsReadyToUpdate(false);
          setIsMainButtonEnable(true);
          alert.success("CROP BOOK UPDATED SUCCESSFULLY");
          setCropBook({
            routeID: '0',
            accountTypeID: '0',
            registrationNumber: '',
            paymentTypeID: '0',
            bankID: '0',
            branchID: '0',
            accountNumber: '',
            accountHolderName: ''
          })
        }
        else {
          let index = dataUpdate.map(x => x.customerAccountID).indexOf(editCustomerAccID)
          dataUpdate[index] = {
            accountHolderName: values.paymentTypeID === "1" ? values.accountHolderName : "",
            accountNumber: values.paymentTypeID === "1" ? values.accountNumber : "",
            bankID: values.paymentTypeID === "1" ? parseInt(values.bankID.toString()) : 0,
            branchID: values.paymentTypeID === "1" ? parseInt(values.branchID.toString()) : 0,
            disbursmentType: parseInt(values.paymentTypeID.toString()),

            customerAccountID: selectedCropDetail.customerAccountID,
            customerID: selectedCropDetail.customerID,
            customerPaymentMethodID: selectedCropDetail.customerPaymentMethodID,
            accountTypeID: values.accountTypeID,
            isDefault: selectedCropDetail.isDefault,
            registrationNumber: values.registrationNumber,
            routeID: selectedCropDetail.routeID,
          }
          setCropBookArray(dataUpdate);
          setFormIsReadyToUpdate(false);
          setIsMainButtonEnable(true);
          alert.success("CROP BOOK UPDATED SUCCESSFULLY");
          setCropBook({
            routeID: '0',
            accountTypeID: '0',
            registrationNumber: '',
            paymentTypeID: '0',
            bankID: '0',
            branchID: '0',
            accountNumber: '',
            accountHolderName: ''
          })
        }
      } else {
        const found = cropBookArray.find(x => x.registrationNumber === values.registrationNumber.trim())
        if (!found) {
          var newItem = {
            routeID: values.routeID.toString(),
            accountTypeID: values.accountTypeID,
            registrationNumber: values.registrationNumber.trim(),
            isDefault: cropBookArray.length === 0 ? true : false,
            disbursmentType: parseInt(values.paymentTypeID),
            bankID: values.paymentTypeID !== "1" ? 0 : parseInt(values.bankID),
            branchID: values.paymentTypeID !== "1" ? 0 : parseInt(values.branchID),
            accountNumber: values.paymentTypeID !== "1" ? '' : values.accountNumber,
            accountHolderName: values.paymentTypeID !== "1" ? '' : values.accountHolderName,
          }
          setCropBookArray([...cropBookArray, newItem])
          setIsMainButtonEnable(true);
          clearData(values);
        }
        else {
          alert.error('REGISTRATION NUMBER ' + (values.registrationNumber) + ' ALREADY EXIST');
        }
      }

    } else {
      var isDuplicate = cropBookArray.find(x => x.registrationNumber === values.registrationNumber.trim());
      if (isDuplicate) {
        alert.error('REGISTRATION NUMBER ' + (values.registrationNumber) + ' ALREADY EXIST');
      } else {
        routeArray.push(values.routeID.toString());
        acountTypeArray.push(values.accountTypeID);
        registrationArray.push(values.registrationNumber);

        var newItem = {
          routeID: values.routeID.toString(),
          accountTypeID: values.accountTypeID,
          registrationNumber: values.registrationNumber.trim(),
          isDefault: cropBookArray.length === 0 ? true : false,
          disbursmentType: parseInt(values.paymentTypeID),
          bankID: values.paymentTypeID !== "1" ? 0 : parseInt(values.bankID),
          branchID: values.paymentTypeID !== "1" ? 0 : parseInt(values.branchID),
          accountNumber: values.paymentTypeID !== "1" ? '' : values.accountNumber,
          accountHolderName: values.paymentTypeID !== "1" ? '' : values.accountHolderName,
        }
        setCropBookArray([...cropBookArray, newItem])
        setIsMainButtonEnable(true);
        clearData(values);
        alert.success("Crop book added.");
      }
    }
  }

  function clearData(data) {
    setCropBook({ ...cropBook, });
    data.accountTypeID = "0";
    data.registrationNumber = "";
    setCropBook({
      routeID: '0',
      accountTypeID: '0',
      registrationNumber: '',
      paymentTypeID: '0',
      bankID: '0',
      branchID: '0',
      accountNumber: '',
      accountHolderName: ''
    })
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
    setCropBook({
      ...cropBook,
      [target.name]: value
    });
  }

  async function confirmData(dialogResult) {
    setDialogbox(false);
    setDeletedRegNo(cropBookArray[tempDeleteIndex].registrationNumber)
    if (cropBookArray.length === 1 && cropBookArray[tempDeleteIndex].customerAccountID !== undefined) {
      alert.error('There should be atleast one account for customer.');
    }
    else if (dialogResult) {
      if (cropBookArray[tempDeleteIndex].registrationNumber !== undefined && cropBookArray[tempDeleteIndex].customerAccountID !== undefined) {
        const resul = await services.CheckTransactionDetailsByRegNumber(cropBookArray[tempDeleteIndex].registrationNumber, cropBookArray[tempDeleteIndex].customerAccountID);
        if (resul.length != 0) {
          alert.error('THIS IS ACTIVE CUSTOMER ACCOUNT. YOU CAN NOT DELETE THIS ACCOUNT');
          if (cropBookArray[tempDeleteIndex].isDefault == true && cropBookArray.length > 1) {
            setDialogboxIsDefault(false);
          }
        }
        else {
          setDialogboxIsDefault(true);
          if (cropBookArray[tempDeleteIndex].customerAccountID !== undefined && cropBookArray[tempDeleteIndex].customerPaymentMethodID !== undefined) {
            const res = await services.DeleteCropBookItem(cropBookArray[tempDeleteIndex].customerAccountID, cropBookArray[tempDeleteIndex].customerPaymentMethodID);
            var cropBookResult = cropBookArray.filter((img, i) => i !== tempDeleteIndex);
            cropBookResult.forEach(x => {
              if (cropBookResult.length === 1) {
                x.isDefault = true;
              }
            });
            if (cropBookResult.length != 0) {
              setRegNo(cropBookResult[0].registrationNumber);
            }
            setCropBookArray(cropBookResult);
            if (res === 1) {
              alert.success('Item deleted successfully');
              refreshWhenCropBookChange(cropBookResult);

            } else {
              alert.error('Error occured in item delete');
            }
          }
        }
      }
      else {
        var result = cropBookArray.filter((x, i) => i !== tempDeleteIndex);

        if (cropBookArray[tempDeleteIndex].isDefault === true && result.length != 0) {
          result[0].isDefault = true;
        }
        if (result.length != 0) {
          setRegNo(result[0].registrationNumber);
        }
        setCropBookArray(result);
        refreshWhenCropBookChange(result);
        ClearFieldData();
      }
    }
  }

  function cancelData() {
    setDialogbox(false);
  }

  function cancelDataWarning() {
    setDialogboxIsDefault(false);
  }

  function DeleteItem(index) {
    setTempDeleteIndex(index);
    setDialogbox(true);
  }

  async function EditCustomerDisbursmentTypeDetails(index) {
    let object = cropBookArray[index];
    let selectedCrop = [...cropBookArray];

    if (object.customerAccountID != undefined) {
      setEditCustomerAccID(object.customerAccountID);
      setCropBook({
        ...cropBook,
        paymentTypeID: object.disbursmentType.toString(),
        bankID: object.bankID,
        branchID: object.branchID,
        routeID: object.routeID,
        accountTypeID: object.accountTypeID,
        registrationNumber: object.registrationNumber,
        accountHolderName: object.accountHolderName,
        accountNumber: object.accountNumber
      });
      setFormIsReadyToUpdate(true)

      let selectedDetail = selectedCrop.find(x => x.customerAccountID === object.customerAccountID)
      let response = await services.CheckTransactionDetailsByRegNumber(selectedDetail.registrationNumber, object.customerAccountID);

      if (response.length == 0) {
        setIsFormFeildDisabled(false)
      } else {
        setIsFormFeildDisabled(true)
      }
    }
    else {
      setEditCustomerAccID(object.customerAccountID);
      setCropBook({
        ...cropBook,
        paymentTypeID: object.disbursmentType.toString(),
        bankID: object.bankID,
        branchID: object.branchID,
        routeID: object.routeID,
        accountTypeID: object.accountTypeID,
        registrationNumber: object.registrationNumber,
        accountHolderName: object.accountHolderName,
        accountNumber: object.accountNumber
      });
      setFormIsReadyToUpdate(true)
      setIsFormFeildDisabled(false)
      cropBookArray.splice(index, 1);
    }
  }

  function settingAccountType(data) {

    if (data == 1) {
      return 'Supplier';
    }
    else if (data == 2) {
      return 'Dealer';
    }
    else if (data == 3) {
      return 'Estate';
    }
    else {
      return null;
    }
  }

  function handleChangeSwitch(e, index, rowData) {
    const target = e.target
    const value = target.name === 'isDefault' ? target.checked : target.value;
    var copyCropBookArray = cropBookArray;

    copyCropBookArray.forEach((s, i) => {
      if (index !== i) {
        s.isDefault = false;
      }
      else {
        s.isDefault = true;
      }
    });

    setCropBookArray([...copyCropBookArray]);
    setIsMainButtonEnable(true);
  }

  function settingRoutes(data) {
    let route = routeList.filter((item, index) => index == data);
    return route;
  }

  function settingPaymentType(data) {

    if (data == 1) {
      return 'Account';
    }
    else if (data == 2) {
      return 'Cheque';
    }
    else {
      return 'Cash';
    }
  }

  function settingAccountHolderName(dataDisbersment, dataAccountHolderName) {
    if (dataDisbersment == 1 && dataAccountHolderName != '') {
      return dataAccountHolderName;
    }
    else {
      return '---';
    }
  }

  function settingBanks(data) {

    if (data == 0 || data == undefined) {
      return '---';
    }
    else {
      let bank = bankList.filter((item, index) => index == data);
      return bank;
    }
  }


  function settingBranches(data) {

    if (data == 0 || data == undefined) {
      return '---';
    } else {
      let branch = branchList.filter((branch => branch.branchID == parseInt(data)));
      var branchName = branch.map(branch => branch.branchName);
      return branchName;
    }
  }

  function settingAccountNumber(data) {

    if (data == undefined || data == null || data == "") {
      return '---';
    }
    else {
      return data;
    }
  }

  function ClearFieldData() {
    setCropBook({
      routeID: '0',
      accountTypeID: '0',
      registrationNumber: '',
      paymentTypeID: '0',
      bankID: '0',
      branchID: '0',
      accountNumber: '',
      accountHolderName: ''
    });
    setFormIsReadyToUpdate(false);
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Crop Books Add Edit">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              routeID: cropBook.routeID,
              accountTypeID: cropBook.accountTypeID,
              registrationNumber: cropBook.registrationNumber,
              paymentTypeID: cropBook.paymentTypeID,
              bankID: cropBook.bankID,
              branchID: cropBook.branchID,
              accountNumber: cropBook.accountNumber,
              accountHolderName: cropBook.accountHolderName
            }}
            validationSchema={
              Yup.object().shape({
                routeID: Yup.number().required('Route is required').min("1", 'Route is required'),
                accountTypeID: Yup.number().required('Account type is required').min("1", 'Account type is required'),
                // registrationNumber: Yup.string().max(255).required('Registration number is required')
                //   .matches(/^(?!0)[0-9]*([0-9]+)*$/, 'Please enter valid registration number')
                //   .matches(/^(?!0)[0-9]{0,10}$/, 'Please enter 10 numbers for Registration No'),
                registrationNumber: Yup.string().required('Registration number is required').matches(/^(?! )[a-zA-Z0-9]{0,15}$/, 'Please enter valid registration number'),
                paymentTypeID: Yup.number().max(255).required('Payment type is required').min("1", 'Payment type is required'),

                bankID: Yup.number().when("paymentTypeID",
                  {
                    is: val => val === 1,
                    then: Yup.number().min('1', 'Bank is required'),
                  }),
                branchID: Yup.number().when("bankID",
                  {
                    is: val => val > 0,
                    then: Yup.number().min('1', 'Branch is required'),
                  }),
                accountNumber: Yup.string().when("branchID",
                  {
                    is: val => val > 0,
                    then: Yup.string().required('Account number is required').matches(/^[0-9\b]+$/, 'Only allow numbers'),
                  }),
                accountHolderName: Yup.string().when("branchID",
                  {
                    is: val => val > 0,
                    then: Yup.string().max(75, "Account holder name must be at most 75 characters")
                      .required('Account holder name is required').matches(/^[aA-zZ\s\.]+$/, "Only alphabets are allowed for this field"),
                  }),
              })
            }
            onSubmit={saveCrop}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              isSubmitting,
              touched,
              values,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={3}>
                  <Card className={classes.cardContent}>
                    <CardHeader
                      title="Crop Books"
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="routeID">
                              Route *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.routeID && errors.routeID)}
                              fullWidth
                              helperText={touched.routeID && errors.routeID}
                              size='small'
                              name="routeID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={values.routeID}
                              variant="outlined"
                              disabled={FormIsReadyToUpdate}
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routes)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="accountTypeID">
                              Account Type *
                            </InputLabel>
                            <TextField select fullWidth
                              error={Boolean(touched.accountTypeID && errors.accountTypeID)}
                              helperText={touched.accountTypeID && errors.accountTypeID}
                              size='small'
                              onBlur={handleBlur}
                              id="accountTypeID"
                              name="accountTypeID"
                              value={values.accountTypeID}
                              type="text"
                              variant="outlined"
                              onChange={(e) => handleChange1(e)}
                              disabled={FormIsReadyToUpdate && isFormFeildDisabled}
                            >
                              <MenuItem value="0">--Select Account Type--</MenuItem>
                              <MenuItem value="1">Supplier</MenuItem>
                              <MenuItem value="2">Dealer</MenuItem>
                              <MenuItem value="3">Estate</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Registration Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                              fullWidth
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              size='small'
                              name="registrationNumber"
                              onBlur={handleBlur}
                              onChange={handleChange1}
                              value={cropBook.registrationNumber}
                              variant="outlined"
                              disabled={FormIsReadyToUpdate && isFormFeildDisabled}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="paymentTypeID">
                              Payment Type *
                            </InputLabel>
                            <TextField select fullWidth
                              error={Boolean(touched.paymentTypeID && errors.paymentTypeID)}
                              helperText={touched.paymentTypeID && errors.paymentTypeID}
                              size='small'
                              onBlur={handleBlur}
                              id="paymentTypeID"
                              name="paymentTypeID"
                              value={values.paymentTypeID}
                              type="text"
                              variant="outlined"
                              onChange={(e) => { handleChange1(e) }}>
                              <MenuItem value="0">--Select Payment Type--</MenuItem>
                              <MenuItem value="1">Account</MenuItem>
                              <MenuItem value="2">Cheque</MenuItem>
                              <MenuItem value="3">Cash</MenuItem>
                            </TextField>
                          </Grid>
                          {cropBook.paymentTypeID === "1" ?
                            <>
                              {FormIsReadyToUpdate == true ?
                                <Grid item md={4} xs={12}>
                                  <InputLabel shrink id="bankID">
                                    Bank *
                                  </InputLabel>
                                  <TextField select
                                    error={Boolean(touched.bankID && errors.bankID)}
                                    fullWidth
                                    helperText={touched.bankID && errors.bankID}
                                    size='small'
                                    name="bankID"
                                    onBlur={handleBlur}
                                    onChange={(e) => handleChange1(e)}
                                    value={values.bankID}
                                    variant="outlined"
                                  >
                                    {generateDropDownMenu(bankList)}
                                  </TextField>
                                </Grid> :
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
                                    renderInput={(params) =>
                                      <TextField {...params}
                                        variant="outlined"
                                        name="bankID"
                                        fullWidth
                                        size='small'
                                        // value={values.bankID}
                                        value={cropBook.bankID}
                                        getOptionDisabled={true}
                                        helperText={touched.bankID && errors.bankID}
                                        onBlur={handleBlur}
                                        error={Boolean(touched.bankID && errors.bankID)}
                                      />
                                    }
                                  />
                                </Grid>
                              }
                            </>
                            : null}
                          {cropBook.paymentTypeID === "1" ?
                            <>
                              {FormIsReadyToUpdate == true ?
                                <Grid item md={4} xs={12}>
                                  <InputLabel shrink id="branchID">
                                    Branch *
                                  </InputLabel>
                                  <TextField select
                                    error={Boolean(touched.branchID && errors.branchID)}
                                    fullWidth
                                    helperText={touched.branchID && errors.branchID}
                                    size='small'
                                    name="branchID"
                                    onBlur={handleBlur}
                                    onChange={(e) => handleChange1(e)}
                                    value={values.branchID}
                                    variant="outlined"
                                  >
                                    {generateDropDownMenu(branch)}
                                  </TextField>
                                </Grid> :
                                < Grid item md={4} xs={12}>
                                  <InputLabel shrink id="branchID">
                                    Branch *
                                  </InputLabel>
                                  <Autocomplete
                                    id="branchID"
                                    options={branches}
                                    getOptionLabel={(option) => option.branchName.toString()}
                                    onChange={(e, value) => handleSearchDropdownChange(value, e)}
                                    defaultValue={null}
                                    renderInput={(params) =>
                                      <TextField {...params}
                                        variant="outlined"
                                        name="branchID"
                                        fullWidth
                                        size='small'
                                        // value={values.branchID}
                                        value={cropBook.branchID}
                                        getOptionDisabled={true}
                                        error={Boolean(touched.branchID && errors.branchID)}
                                        helperText={touched.branchID && errors.branchID}
                                        onBlur={handleBlur}
                                      />
                                    }
                                  />
                                </Grid>
                              }
                            </>
                            : null}
                          {cropBook.paymentTypeID === "1" ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="accountHolderName">
                                Account Holder Name *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.accountHolderName && errors.accountHolderName)}
                                fullWidth
                                helperText={touched.accountHolderName && errors.accountHolderName}
                                size='small'
                                name="accountHolderName"
                                onBlur={handleBlur}
                                onChange={handleChange1}
                                value={cropBook.accountHolderName}
                                variant="outlined"
                                disabled={(cropBook.paymentTypeID != '1' ? true : false)}
                              />
                            </Grid>
                            : null}
                          {cropBook.paymentTypeID === "1" ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="accountNumber">
                                Account Number *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.accountNumber && errors.accountNumber)}
                                fullWidth
                                helperText={touched.accountNumber && errors.accountNumber}
                                size='small'
                                name="accountNumber"
                                onBlur={handleBlur}
                                onChange={handleChange1}
                                value={cropBook.accountNumber}
                                variant="outlined"
                                disabled={(cropBook.paymentTypeID != '1' ? true : false)}
                              />
                            </Grid>
                            : null}
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                        >
                          {FormIsReadyToUpdate ? "Accept Modifications" : "Add"}
                        </Button>
                        {
                          FormIsReadyToUpdate ?
                            <Button
                              color="primary"
                              type='button'
                              variant="outlined"
                              onClick={() => ClearFieldData()}
                              style={{ marginLeft: '1rem' }}
                            >
                              Clear
                            </Button> : null
                        }

                      </Box>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={2}>
                          {(cropBookArray.length > 0) ?
                            <Grid item xs={12}>
                              <TableContainer >
                                <Table className={classes.table} aria-label="caption table">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Route</TableCell>
                                      <TableCell>Account Type</TableCell>
                                      <TableCell>Reg Number</TableCell>
                                      <TableCell >Payment Type</TableCell>
                                      <TableCell>Account Holder's Name</TableCell>
                                      <TableCell >Bank</TableCell>
                                      <TableCell >Branch</TableCell>
                                      <TableCell >Account No</TableCell>
                                      <TableCell >Is Default</TableCell>
                                      <TableCell >Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {cropBookArray.map((rowData, index) => (
                                      <TableRow key={index}>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {settingRoutes(rowData.routeID)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {settingAccountType(rowData.accountTypeID)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {rowData.registrationNumber}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {settingPaymentType(rowData.disbursmentType)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {settingAccountHolderName(rowData.disbursmentType, rowData.accountHolderName)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {settingBanks(rowData.bankID)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {settingBranches(rowData.branchID)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {settingAccountNumber(rowData.accountNumber)}
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          <Switch
                                            checked={rowData.isDefault}
                                            onChange={(e) => handleChangeSwitch(e, index, rowData)}
                                            name="isDefault"
                                          />
                                        </TableCell>
                                        <TableCell component="th" scope="row" style={{ borderBottom: "none" }}>
                                          <Tooltip
                                            title="Delete Crop Book"
                                            placement='right'
                                            backgroundColor='white'>
                                            <DeleteIcon
                                              style={{
                                                color: "red",
                                                cursor: "pointer"
                                              }}
                                              size="small"
                                              onClick={() => DeleteItem(index)}
                                            >
                                            </DeleteIcon>
                                          </Tooltip>
                                          <Tooltip
                                            title="Edit Crop Book"
                                            placement='right'
                                            backgroundColor='white'>
                                            <CreateIcon
                                              style={{
                                                cursor: "pointer",
                                                marginLeft: "1rem"
                                              }}
                                              size="small"
                                              onClick={() => EditCustomerDisbursmentTypeDetails(index)}
                                            />
                                          </Tooltip>
                                        </TableCell >

                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                            : null}
                        </Grid>
                        {dialogbox ?
                          <AlertDialogWithoutButton confirmData={confirmData} cancelData={cancelData}
                            IconTitle={"Delete"}
                            headerMessage={"Are you sure you want to delete?"}
                            discription={"This operation will also remove relevent saving and funds."} />
                          : null
                        }
                        {dialogboxIsDefault ?
                          <WarningDialogBox cancelData={cancelDataWarning}
                            IconTitle={"isDefault"}
                            headerMessage={"Crop Books"}
                            discription={"When removing Reg No " + DeletedRegNo + ",Reg No " + regNo + "set as the default account. If you want you can change any other account as default."}
                          />
                          : null
                        }
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

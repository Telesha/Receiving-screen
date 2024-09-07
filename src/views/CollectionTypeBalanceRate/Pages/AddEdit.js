import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel,
  CardHeader, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, IconButton,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import Typography from '@material-ui/core/Typography';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import Chip from '@material-ui/core/Chip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import { red, blue } from '@material-ui/core/colors';
import CountUp from 'react-countup';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import moment from 'moment';
import ExpandMoreIcon from '@material-ui/icons/ArrowDropDown';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  cardroot: {
    minWidth: 275,
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  colorReject: {
    backgroundColor: "red",
  },
  colorApprove: {
    backgroundColor: "green",
  },
  card: {
    flexGrow: 10,
    backgroundColor: "#ffffff",
    paddingInlineStart: '10px',
    borderRadius: '10px',
  },
  avatar: {
    backgroundColor: red[500],
  },
  blue: {
    backgroundColor: blue[500],
  },
  succes: {
    backgroundColor: "#e8f5e9"
  },
  failed: {
    backgroundColor: "#fce4ec"
  },
  bold: {
    fontWeight: 600
  }
}));

const screenCode = 'BALANCERATE';

export default function BalanceRateAddEdit(props) {
  const [title, setTitle] = useState("Balance Rate");
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [products, setProducts] = useState();
  const [collectionTypeArray, setCollectionTypeArray] = useState([]);
  const [collectionTypeNameArray, setCollectionTypeNameArray] = useState([]);
  const [routeNameArray, setRouteNameArray] = useState([]);
  const [searchStarted, setSearchStarted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyFullBalance, setMonthlyFullBalance] = useState();
  const [boolBalance, setBoolBalance] = useState(true);
  const [isBalancePaymentCalculated, setIsBalancePaymentCalculated] = useState(false);
  const [boolCalculateBalance, setBoolCalculateBalance] = useState(true);
  const [balanceRateStatusID, setBalanceRateStatusID] = useState(0)
  const [isCurrentMonth, setIsCurrentMonth] = useState(false)
  const [isMaxEror, setIsMaxEror] = useState({});
  const [isMinEror, setIsMinEror] = useState({});
  const [isMaxEror2, setIsMaxEror2] = useState({});
  const [minErrorMsg, setMinErrorMsg] = useState({});
  const [maxErrorMsg, setMaxErrorMsg] = useState({});
  const [maxErrorMsg2, setMaxErrorMsg2] = useState({});
  const [isApproveRejectHide, setIsApproveRejectHide] = useState(false)
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isBalanceRateAddEdit: false,
    isBalanceRateApproveReject: false
  });
  const [collectionTypeRate, setCollectionTypeRate] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    productID: 0,
    collectionTypeID: 0,
    rate: '0',
  });
  const [balancePaymentInfo, setBalancePaymentInfo] = useState({
    debitInfo: [],
    creditInfo: [],
    customerCount: 0,
    balancePayment: 0,
    debitTotal: 0,
    creditTotal: '0',
    debtCustomerCount: 0,
    factoryItemList: []
  });
  const classes = useStyles();
  const navigate = useNavigate();
  const alert = useAlert();
  const [openRowIndex, setOpenRowIndex] = useState(null);
  const handleToggle = (index) => {
    setOpenRowIndex(openRowIndex === index ? null : index);
  };

  useEffect(() => {
    setSelectedDate(null);
    getPermissions();
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    setSelectedDate(null);
    if (collectionTypeRate.groupID > 0) {
      trackPromise(getFactoriesForDropdown());
    }
    setBoolBalance(true);
  }, [collectionTypeRate.groupID]);

  useEffect(() => {
    setSelectedDate(null);
    setBoolBalance(true);
    if (collectionTypeRate.factoryID) {
      trackPromise(getProductsForDropdown());
    }
  }, [collectionTypeRate.factoryID]);

  useEffect(() => {
    setSelectedDate(null);
    setBoolBalance(true);
  }, [collectionTypeRate.productID]);

  useEffect(() => {
    setBoolBalance(true);
    if (collectionTypeRate.groupID > 0 && collectionTypeRate.factoryID > 0 && collectionTypeRate.productID > 0 && selectedDate !== null) {
      trackPromise(GetCollectionTypeBalanceRateDetails());
    }
  }, [selectedDate]);

  useEffect(() => {
    trackPromise(
      settingCollectionTypeName(),
      settingRouteName()
    );
  }, [collectionTypeArray]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITBALANCERATE' || p.permissionCode == 'BALANCERATEPERMISSION');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isBalanceRateAddEdit = permissions.find(p => p.permissionCode === 'ADDEDITBALANCERATE');
    var isBalanceRateApproveReject = permissions.find(p => p.permissionCode === 'BALANCERATEPERMISSION');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isBalanceRateAddEdit: isBalanceRateAddEdit !== undefined,
      isBalanceRateApproveReject: isBalanceRateApproveReject !== undefined
    });

    setCollectionTypeRate({
      ...collectionTypeRate,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function settingCollectionTypeName() {
    var x = collectionTypeArray.map(item => item.collectionTypeName);
    var z = Array.from(new Set(x));
    setCollectionTypeNameArray(z);
  }

  async function settingRouteName() {
    var x = collectionTypeArray.map(item => item.routeName);
    var z = Array.from(new Set(x));
    setRouteNameArray(z);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(collectionTypeRate.groupID);
    setFactories(factories);
  }

  async function getProductsForDropdown() {
    const products = await services.getAllProducts(collectionTypeRate.factoryID);
    setProducts(products);
  }

  async function GetCollectionTypeBalanceRateDetails() {
    const collectionTypes = await services.GetCollectionTypeBalanceRateDetails(collectionTypeRate.groupID,
      collectionTypeRate.factoryID,
      collectionTypeRate.productID, moment(selectedDate).format('L'));
    if (collectionTypes == null || collectionTypes == undefined || collectionTypes == "") {
      setBoolCalculateBalance(true);

    } else {
      setBoolCalculateBalance(false);
      setIsBalancePaymentCalculated(collectionTypes.isBalancePaymentOccured);
      setCollectionTypeArray(collectionTypes.blanaceRates);
      setBalanceRateStatusID(collectionTypes.balancerateStatusId);
      if (collectionTypes.balancerateStatusId == 0 || collectionTypes.balancerateStatusId != 1) {
        setIsApproveRejectHide(true);
      } else {
        setIsApproveRejectHide(false);
      }
    }

    if (collectionTypes.balancerateStatusId !== 0) {
      trackPromise(calculateMonthlyBalance(collectionTypes.blanaceRates, collectionTypes.isBalancePaymentOccured));
    }
  }

  async function saveCollectionTypeBalanceRate() {
    for (const iterator of collectionTypeArray) {
      if (iterator.rate <= 0) {
        alert.error("Rate should greater than zero");
        return;
      }
    }

    setIsDisableButton(true);
    let response = await services.saveCollectionTypeBalanceRate(collectionTypeArray);

    if (response.statusCode == "Success") {
      alert.success(response.message);
      trackPromise(
        GetCollectionTypeBalanceRateDetails()
      );
      setIsDisableButton(false);
    }
    else {
      alert.error(response.message);
      setIsDisableButton(false);
    }
  }

  async function rejectCollectionTypeBalanceRates() {
    setIsDisableButton(true);
    let response = await services.rejectCollectionTypeBalanceRate(collectionTypeArray);

    if (response.statusCode == "Success") {
      alert.success(response.message);
      trackPromise(
        GetCollectionTypeBalanceRateDetails()
      );
      setIsDisableButton(false);
    }
    else {
      alert.error(response.message);
      setIsDisableButton(false);
    }
  }

  async function approveCollectionTypeBalanceRates() {
    setIsDisableButton(true);
    let response = await services.approveCollectionTypeBalanceRate(collectionTypeArray);

    if (response.statusCode == "Success") {
      alert.success(response.message);
      trackPromise(
        GetCollectionTypeBalanceRateDetails()
      );
      setIsDisableButton(false);
    }
    else {
      alert.error(response.message);
      setIsDisableButton(false);
    }
  }

  async function calculateMonthlyBalance(collectionTypes, isBalancePaymentOccured) {
    let formdata = {
      collectionTypeBalanceRates: collectionTypes === null || collectionTypes.length === 0 ? collectionTypeArray : collectionTypes,
      groupID: parseInt(collectionTypeRate.groupID),
      factoryID: parseInt(collectionTypeRate.factoryID),
      applicableDate: moment(selectedDate).format(),
      isBalancePaymentCalculated: isBalancePaymentOccured === null ? isBalancePaymentCalculated : isBalancePaymentOccured
    }
    let response = await services.calculateMonthlyBalance(formdata);

    isBalancePaymentOccured ? setMonthlyFullBalance(response.debitInfo.filter(x => x.transactionTypeID === 6).map(x => x.total))
      : setMonthlyFullBalance(response.balancePayment);

    setBalancePaymentInfo(response);
    response == null ? setBoolBalance(true) : setBoolBalance(false);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setCollectionTypeRate({
      ...collectionTypeRate,
      [e.target.name]: value
    });
    setCollectionTypeArray([]);
  }

  function handleRateChange(e, routeName, index, collectionTypeName) {
    const target = e.target;
    const value = target.value;

    const copycollectionTypeArray = [...collectionTypeArray];
    var idx = copycollectionTypeArray.findIndex(e => (e.routeName === routeName && e.collectionTypeName === collectionTypeName));
    copycollectionTypeArray[idx] = { ...copycollectionTypeArray[idx], rate: parseFloat(value) };
    if (collectionTypeName === "Super Leaf") {
      checkSuperLeaf(value, index, collectionTypeName)
      copycollectionTypeArray[idx] = { ...copycollectionTypeArray[idx], rate: parseFloat(value) };
    } else if (collectionTypeName === "Normal Leaf") {
      checkNormalLeaf(value, index, collectionTypeName)
      copycollectionTypeArray[idx] = { ...copycollectionTypeArray[idx], rate: parseFloat(value) };
    } else if (collectionTypeName === "Golden Leaf") {
      checkGoldenLeaf(value, index, collectionTypeName)
      copycollectionTypeArray[idx] = { ...copycollectionTypeArray[idx], rate: parseFloat(value) };
    }
    setCollectionTypeArray(copycollectionTypeArray);
  }

  function handleAllRateChange(e, index, collectionTypeName) {
    const target = e.target;
    const value = target.value;
    if (value < 0) {
      return 0;
    }
    else {
      const copycollectionTypeArray = [...collectionTypeArray];
      var idx = copycollectionTypeArray.findIndex(e => e.collectionTypeName === collectionTypeName);
      copycollectionTypeArray[idx] = { ...copycollectionTypeArray[idx], rate: parseFloat(value) };

      for (let index = 0; index < copycollectionTypeArray.length; index++) {
        if (copycollectionTypeArray[index].collectionTypeName == collectionTypeName) {
          copycollectionTypeArray[index] = { ...copycollectionTypeArray[index], rate: parseFloat(value) };
        }
      }

      if (collectionTypeName === "Super Leaf") {
        for (let index = 0; index < copycollectionTypeArray.length; index++) {
          if (copycollectionTypeArray[index].collectionTypeName == collectionTypeName) {
            copycollectionTypeArray[index] = { ...copycollectionTypeArray[index], rate: parseFloat(value) };
          }
        }
      } else if (collectionTypeName === "Normal Leaf") {
        for (let index = 0; index < copycollectionTypeArray.length; index++) {
          if (copycollectionTypeArray[index].collectionTypeName == collectionTypeName) {
            copycollectionTypeArray[index] = { ...copycollectionTypeArray[index], rate: parseFloat(value) };
          }
        }
        copycollectionTypeArray[idx] = { ...copycollectionTypeArray[idx], rate: parseFloat(value) };
      }
      else if (collectionTypeName === "Golden Leaf") {
        for (let index = 0; index < copycollectionTypeArray.length; index++) {
          if (copycollectionTypeArray[index].collectionTypeName == collectionTypeName) {
            copycollectionTypeArray[index] = { ...copycollectionTypeArray[index], rate: parseFloat(value) };
          }
        }
        copycollectionTypeArray[idx] = { ...copycollectionTypeArray[idx], rate: parseFloat(value) };
      }

      setCollectionTypeArray(copycollectionTypeArray);
    }
  }

  function checkSuperLeaf(value, id, collectionTypeName) {
    var pattern = /^[0-9]+([.][0-9]{0,2})?$/;

    var copyOfMinErrMsgs = minErrorMsg;
    var copyOfIsMinEror = isMinEror;

    copyOfIsMinEror[id] = id;
    setIsMinEror(copyOfIsMinEror);

    if (value < 0) {
      copyOfMinErrMsgs[id] = "Super leaf rate need to be a positive number.";
    } else if (value.length > 8) {
      copyOfMinErrMsgs[id] = "Super leaf rate length exceeded.";
    } else if (value.length === 0) {
      copyOfMinErrMsgs[id] = "Super leaf rate is required.";
    } else if (!pattern.test(value.toString())) {
      copyOfMinErrMsgs[id] = "Super leaf rate only allow numbers and numbers with atmost 2 decimal points.";
    } else {
      copyOfMinErrMsgs[id] = "";

      copyOfIsMinEror[id] = -1;
      copyOfIsMinEror["collectionType"] = collectionTypeName;
      setIsMinEror(copyOfIsMinEror);
    }

    setMinErrorMsg(copyOfMinErrMsgs);
  }

  function checkNormalLeaf(value, id, collectionTypeName) {

    var pattern = /^[0-9]+([.][0-9]{0,2})?$/;

    var copyOfMaxErrMsgs = maxErrorMsg;
    var copyOfIsMaxEror = isMaxEror;

    copyOfIsMaxEror[id] = id;
    setIsMaxEror(copyOfIsMaxEror);

    if (value < 0) {
      copyOfMaxErrMsgs[id] = "Normal leaf rate need to be a positive number.";
    } else if (value.length > 8) {
      copyOfMaxErrMsgs[id] = "Normal leaf rate length exceeded.";
    } else if (value.length === 0) {
      copyOfMaxErrMsgs[id] = "Normal leaf rate is required.";
    } else if (!pattern.test(value.toString())) {
      copyOfMaxErrMsgs[id] = "Normal leaf rate only allow numbers and numbers with atmost 2 decimal points.";
    } else {
      copyOfMaxErrMsgs[id] = "";
      copyOfIsMaxEror[id] = -1;
      copyOfIsMaxEror["collectionType"] = collectionTypeName;
      setIsMaxEror(copyOfIsMaxEror);
    }
    setMaxErrorMsg(copyOfMaxErrMsgs);
  }

  function checkGoldenLeaf(value, id, collectionTypeName) {
    var pattern = /^[0-9]+([.][0-9]{0,2})?$/;

    var copyOfMaxErrMsgs = maxErrorMsg2;
    var copyOfIsMaxEror = isMaxEror2;

    copyOfIsMaxEror[id] = id;
    setIsMaxEror2(copyOfIsMaxEror);

    if (value < 0) {
      copyOfMaxErrMsgs[id] = "Golden leaf rate need to be a positive number.";
    } else if (value.length > 8) {
      copyOfMaxErrMsgs[id] = "Golden leaf rate length exceeded.";
    } else if (value.length === 0) {
      copyOfMaxErrMsgs[id] = "Golden leaf rate is required.";
    } else if (!pattern.test(value.toString())) {
      copyOfMaxErrMsgs[id] = "Golden leaf rate only allow numbers and numbers with atmost 2 decimal points.";
    } else {
      copyOfMaxErrMsgs[id] = "";
      copyOfIsMaxEror[id] = -1;
      copyOfIsMaxEror["collectionType"] = collectionTypeName;
      setIsMaxEror2(copyOfIsMaxEror);
    }
    setMaxErrorMsg2(copyOfMaxErrMsgs);
  }

  function handleDateChange(date) {
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    var currentmonth = moment().format('MM');

    if (month == parseInt(currentmonth)) {
      setIsCurrentMonth(true);
    } else {
      setIsCurrentMonth(false);
    }

    if (selectedDate != null) {
      var prevMonth = selectedDate.getUTCMonth() + 1
      var prevyear = selectedDate.getUTCFullYear();

      if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
        setSelectedDate(date)
        setSearchStarted(true)
      }
    } else {
      setSelectedDate(date)
      setSearchStarted(true)
    }

  }

  function SettingValue(data, data1) {
    var x = collectionTypeArray.filter(x => x.routeName == data);
    var y = x.filter(x => x.collectionTypeName == data1);
    return y[0].rate;
  }

  function SettingValue1(data) {
    var x = collectionTypeArray.filter(x => x.collectionTypeName == data);
    return x.rate;
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    )
  }

  function renderCreditInfo() {
    var total = 0;
    let dataset = balancePaymentInfo.creditInfo === undefined ? null : (
      balancePaymentInfo.creditInfo.map((item) => {
        total = total + item.amount
        return (
          <ListItem button>
            <ListItemIcon>
              <BookmarksIcon />
            </ListItemIcon>
            <ListItemText primary={item.collectionTypeName} />
            <ListItemSecondaryAction>
              <Typography>
                <CountUp
                  end={item.amount}
                  decimals={2}
                  suffix=" LKR "
                  decimal="."
                />
              </Typography>
            </ListItemSecondaryAction>
          </ListItem>
        );
      }));

    return (
      <List component="nav" aria-label="main mailbox folders">
        {dataset}
        <Divider />
        <ListItem button>
          <ListItemIcon>
            <MonetizationOnIcon />
          </ListItemIcon>
          <ListItemText primary="Total" />
          <ListItemSecondaryAction>
            <Typography>
              <CountUp
                end={total}
                decimals={2}
                suffix=" LKR "
                decimal="."
              />
            </Typography>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    );
  }

  function renderDebitInfo() {
    var total = 0;
    let dataset = balancePaymentInfo.debitInfo === undefined ? null : (
      balancePaymentInfo.debitInfo.map((item) => {
        total = total + item.total
        return (
          <ListItem button>
            <ListItemIcon>
              <BookmarksIcon />
            </ListItemIcon>
            <ListItemText primary={item.transactionTypeName} />
            <ListItemSecondaryAction>
              <Typography>
                <CountUp
                  end={item.total}
                  decimals={2}
                  suffix=" LKR"
                  decimal="."
                />
              </Typography>
            </ListItemSecondaryAction>
          </ListItem>
        );
      }));

    return (
      <List component="nav" aria-label="main mailbox folders">
        {dataset}
        <Divider />
        <ListItem button>
          <ListItemIcon>
            <MonetizationOnIcon />
          </ListItemIcon>
          <ListItemText primary="Total" />
          <ListItemSecondaryAction>
            <Typography>
              <CountUp
                end={total}
                decimals={2}
                suffix=" LKR"
                decimal="."
              />
            </Typography>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    );
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: collectionTypeRate.groupID,
              factoryID: collectionTypeRate.factoryID,
              routeID: collectionTypeRate.routeID,
              productID: collectionTypeRate.productID,
              collectionTypeID: collectionTypeRate.collectionTypeID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                routeID: Yup.number().required('Route required').min("1", 'Route required'),
                productID: Yup.number().required('Product required').min("1", 'Product required'),
              })
            }
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              isSubmitting,
              touched,
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

                          <Grid item md={3} xs={8}>
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
                              value={collectionTypeRate.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                              }}
                              size='small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={collectionTypeRate.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                              size='small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="productID">
                              Product *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.productID && errors.productID)}
                              fullWidth
                              helperText={touched.productID && errors.productID}
                              name="productID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={collectionTypeRate.productID}
                              variant="outlined"
                              id="productID"
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                              size='small'
                            >
                              <MenuItem value="0">--Select Product--</MenuItem>
                              {generateDropDownMenu(products)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="inline"
                                openTo="month"
                                views={["year", "month"]}
                                label="Year and Month"
                                helperText="Select applicable month"
                                value={selectedDate}
                                onChange={(date) => handleDateChange(date)}
                                size='small'
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                        </Grid>
                        <br />
                        {(collectionTypeArray.length > 0) ?
                          <Grid item md={12} xs={12}>
                            <Grid className={classes.container}>
                              <Collapse in={true}>
                                <Paper elevation={0} className={classes.paper}>
                                  <Grid container spacing={3} >
                                    {isBalancePaymentCalculated ?
                                      <Grid item xs={2}>
                                        <Chip className={classes.succes} label="Balance Payment Completed" />
                                      </Grid> : null
                                    }

                                    {balanceRateStatusID === 3 ?
                                      <Grid item xs={2} >
                                        <Chip className={classes.failed} label="Rejected" />
                                      </Grid> : null
                                    }

                                    {balanceRateStatusID === 2 ?
                                      <Grid item xs={2} >
                                        <Chip className={classes.succes} label="Approved" />
                                      </Grid> : null
                                    }

                                    {balanceRateStatusID === 1 ?
                                      <Grid item xs={2} >
                                        <Chip className={classes.succes} label="Pending" />
                                      </Grid> : null
                                    }
                                  </Grid>
                                  <Grid container spacing={4}>
                                    <Grid item xs={12}>
                                      <TableContainer >
                                        <Table className={classes.table} aria-label="caption table">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell align={'center'}>Routes</TableCell>
                                              {collectionTypeNameArray.map((data, index) =>
                                              (
                                                <TableCell align={'right'}>
                                                  <Box display='flex' alignItems='center' justifyContent='center'>
                                                    <Box>{data + ' Rate'}</Box>
                                                    <Box ml={1}>
                                                      <TextField
                                                        error={Boolean(touched.rate && errors.rate)}
                                                        helperText={touched.rate && errors.rate}
                                                        name='allrate'
                                                        onBlur={handleBlur}
                                                        alignContent='center'
                                                        onChange={(e) => handleAllRateChange(e, index, data)}
                                                        value={SettingValue1(data)}
                                                        type='number'
                                                        variant='outlined'
                                                        size='small'
                                                        style={{ width: '100px' }}
                                                        inputProps={{ style: { textAlign: 'center' } }}
                                                        disabled={isDisableButton || isBalancePaymentCalculated}
                                                      />
                                                    </Box>
                                                  </Box>
                                                </TableCell>
                                              ))}
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {routeNameArray.map((data, index) => (
                                              <TableRow key={index}>
                                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                  {data}
                                                </TableCell>
                                                {collectionTypeNameArray.map((data1, index1) => (
                                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                                    <Grid alignContent={'center'}  >
                                                      <TextField
                                                        error={Boolean(touched.rate && errors.rate)}
                                                        helperText={touched.rate && errors.rate}
                                                        name="rate"
                                                        onBlur={handleBlur}
                                                        alignContent='center'
                                                        onChange={(e) => handleRateChange(e, data, index, data1)}
                                                        value={SettingValue(data, data1)}
                                                        type='number'
                                                        variant="outlined"
                                                        size='small'
                                                        inputProps={{ style: { textAlign: 'center' } }}
                                                        disabled={isDisableButton || isBalancePaymentCalculated}
                                                      />
                                                    </Grid>
                                                    {data1 === "Super Leaf" ? (parseInt(isMinEror[index]) === parseInt(index)) || (isMinEror["collectionType"] === data1) ?
                                                      <small style={{ color: 'red', wordWrap: 'break-word' }}>{minErrorMsg[index]}</small> : null
                                                      : data1 === "Normal Leaf" ? (parseInt(isMaxEror[index]) === parseInt(index)) || (isMaxEror["collectionType"] === data1) ?
                                                        <small style={{ color: 'red', wordWrap: 'break-word' }}>{maxErrorMsg[index]}</small> : null
                                                        : (parseInt(isMaxEror2[index]) === parseInt(index)) || (isMaxEror2["collectionType"] === data1) ?
                                                          <small style={{ color: 'red', wordWrap: 'break-word' }}>{maxErrorMsg2[index]}</small> : null}
                                                  </TableCell>
                                                ))}
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    </Grid>
                                  </Grid>
                                </Paper>
                              </Collapse>
                            </Grid>
                          </Grid>
                          :
                          <Box paddingTop="20px"
                            hidden={!searchStarted}  >
                            {"- No records found. -"}
                          </Box>
                        }
                      </CardContent>
                      {
                        isBalancePaymentCalculated === false ?
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              color="primary"
                              disabled={boolCalculateBalance}
                              type="button"
                              variant="contained"
                              onClick={() => trackPromise(calculateMonthlyBalance(null, null))}
                            >
                              {isBalancePaymentCalculated ? "View Balance Payment" : "Estimate Balance Payment"}
                            </Button>
                          </Box>
                          : null
                      }
                      {!boolBalance ?
                        <Grid >
                          <Card className={classes.cardroot}>
                            <CardContent>
                              <Box>
                                <br />
                                <Card>
                                  <CardContent>
                                    <Grid container spacing={2}>
                                      <Grid item md={3} xs={8} spacing={2}>
                                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                                          <Chip style={{ marginLeft: '1rem', backgroundColor: "#44a6c6 " }} alignContent="center"
                                            icon={<PeopleAltIcon />}
                                            label={"Number Of Active Accounts : " + balancePaymentInfo.customerCount}
                                            clickable
                                            color="primary"
                                          />
                                        </Typography>
                                      </Grid>
                                      <Grid item md={3} xs={8}>
                                        <Typography className={classes.title} color="textSecondary" gutterBottom style={{ marginLeft: '1rem' }}>
                                          <Chip style={{ backgroundColor: "#44a6c6" }}
                                            icon={<PeopleAltIcon />}
                                            label={"Number Of Debt Accounts : " + balancePaymentInfo.debtCustomerCount}
                                            clickable
                                            color="primary"
                                          />
                                        </Typography>
                                      </Grid>
                                      <Grid item md={3} xs={8}>
                                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                                          <Chip style={{ backgroundColor: "#44a6c6 " }}
                                            icon={<PeopleAltIcon />}
                                            label={"Number Of Inactive Accounts : " + balancePaymentInfo.inActiveCustomerAccount}
                                            clickable
                                            color="primary"
                                          />
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </CardContent>
                                </Card>
                                <br />
                                <Card>
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell style={{ fontSize: '18px' }}>Transaction Type</TableCell>
                                        <TableCell style={{ fontSize: '18px' }} align="center">Debit</TableCell>
                                        <TableCell style={{ fontSize: '18px' }} align="center">Credit</TableCell>
                                        <TableCell style={{ width: '50px' }}></TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {balancePaymentInfo.debitInfo.map((row, index) => (
                                        <React.Fragment key={index}>
                                          <TableRow>
                                            <TableCell style={{ fontSize: '16px' }}>{row.transactionTypeName}
                                            </TableCell>
                                            <TableCell style={{ fontSize: '16px' }} align="center">
                                              {row.entryType == 2 ? row.total.toFixed(2) : "--"}
                                            </TableCell>
                                            <TableCell style={{ fontSize: '16px' }} align="center">
                                              {row.entryType == 1 ? row.total.toFixed(2) : "--"}
                                            </TableCell>
                                            {row.transactionTypeName === "Factory Item" && (
                                              <TableCell style={{ width: '50px' }}>
                                                <IconButton onClick={() => handleToggle(index)}>
                                                  <ExpandMoreIcon />
                                                </IconButton>
                                              </TableCell>
                                            )}
                                          </TableRow>
                                          {row.transactionTypeName === "Factory Item" && (
                                            <TableRow>
                                              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                                <Collapse in={openRowIndex === index} timeout="auto" unmountOnExit>
                                                  <Table>
                                                    <TableRow style={{ backgroundColor: '#EBFFD9' }}>
                                                      <TableCell><b>Item Name</b></TableCell>
                                                      <TableCell><b>This Month Issued</b></TableCell>
                                                      <TableCell><b>Previous Month Issued</b></TableCell>
                                                    </TableRow>
                                                    {balancePaymentInfo.factoryItemList.map((rows, i) => (
                                                      <TableRow key={i} style={{ backgroundColor: i % 2 === 0 ? '#DFF3CD' : '#EBFFD9' }}>
                                                        <TableCell>{rows.itemName}</TableCell>
                                                        <TableCell>{rows.thisMonth != 0 ? rows.thisMonth.toFixed(2) : "--"}</TableCell>
                                                        <TableCell>{rows.previousMonth != 0 ? rows.previousMonth.toFixed(2) : "--"}</TableCell>
                                                      </TableRow>
                                                    ))}
                                                  </Table>
                                                </Collapse>
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </React.Fragment>
                                      ))}
                                      <TableRow>
                                        <TableCell>Total</TableCell>
                                        <TableCell>{balancePaymentInfo.debitInfo.filter(x => x.entryType === "2").reduce((totalDebit, item) => totalDebit + item.total, 0).toFixed(2)}</TableCell>
                                        <TableCell>{balancePaymentInfo.debitInfo.filter(x => x.entryType === "1").reduce((totalCredit, item) => totalCredit + item.total, 0).toFixed(2)}</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </Card>
                                <br />
                              </Box>
                              <br />
                              <Grid container spacing={3}>
                                <Grid item xs={3} > </Grid>
                                <Grid item xs={6} >
                                  <Card className={classes.card} border={2} borderColor="grey">
                                    <CardContent justifyContent="center" alignItems="center" >
                                      <Typography variant="h3" align="center">
                                        {isBalancePaymentCalculated ? "Monthly Balance Payment = " : "Estimated Balance Payment = "}
                                        <CountUp
                                          end={monthlyFullBalance == null || monthlyFullBalance == 0 || monthlyFullBalance == undefined ? 0 : monthlyFullBalance}
                                          decimals={2}
                                          suffix=" LKR"
                                          decimal="."
                                        />
                                      </Typography>

                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={3} > </Grid>
                              </Grid>
                              {
                                permissionList.isBalanceRateAddEdit ?
                                  <Box display="flex" justifyContent="flex-end" p={2}>
                                    <Button
                                      color="primary"
                                      disabled={isSubmitting || isDisableButton || boolBalance || isCurrentMonth || isBalancePaymentCalculated}
                                      type="button"
                                      variant="contained"
                                      onClick={() => saveCollectionTypeBalanceRate()}
                                    >
                                      {"Save"}
                                    </Button>
                                  </Box> : null
                              }
                            </CardContent>
                          </Card>
                        </Grid> :
                        null
                      }
                      {!boolBalance && !isApproveRejectHide ?
                        <Box display="flex" justifyContent="flex-end" p={3}>
                          {
                            permissionList.isBalanceRateApproveReject ?
                              <Box display="flex" justifyContent="flex-end" p={2}>
                                <Button
                                  color="secondary"
                                  variant="contained"
                                  style={{
                                    marginRight: "2rem",
                                  }}
                                  className={classes.colorReject}
                                  onClick={() => rejectCollectionTypeBalanceRates()}
                                  disabled={isSubmitting || isDisableButton || boolBalance || isBalancePaymentCalculated}
                                >
                                  Reject
                                </Button>
                                <Button
                                  color="primary"
                                  type="submit"
                                  variant="contained"
                                  className={classes.colorApprove}
                                  disabled={isSubmitting || isDisableButton || boolBalance || isBalancePaymentCalculated}
                                  onClick={() => approveCollectionTypeBalanceRates()}
                                >
                                  Approve
                                </Button>
                              </Box>
                              : null
                          }
                        </Box>
                        : null}
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

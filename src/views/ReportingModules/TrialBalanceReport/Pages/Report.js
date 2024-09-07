import React, { useState, useEffect, Fragment, useRef } from 'react';
import { useAlert } from 'react-alert';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent,
  Divider, InputLabel, CardHeader, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, IconButton, Tooltip
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingComponent } from '../../../../utils/newLoader';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import xlsx from 'json-as-xlsx';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import CountUp from 'react-countup';
import CurrencyCommaSeperation from 'src/views/Common/CurrencyCommaSeperation';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  colorCancel: {
    backgroundColor: 'red'
  },
  colorRecord: {
    backgroundColor: 'green'
  },
  bold: {
    fontWeight: 600
  }
}));

const screenCode = 'TRIALBALANCEREPORT';
export default function TrialBalanceReport(props) {
  const [CurrenctType, setCurrenctType] = useState('(LKR)');
  const {
    groupID,
    factoryID,
    startDate,
    endDate,
    IsGuestNavigation
  } = useParams();
  const alert = useAlert();
  const componentRef = useRef();
  const navigate = useNavigate();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const classes = useStyles();
  const [title, setTitle] = useState('Trial Balance Report');
  const [trialBalanceDetails, setTrialBalanceDetails] = useState({
    groupID:
      atob(IsGuestNavigation.toString()) === '1'
        ? parseInt(atob(groupID.toString()))
        : 0,
    factoryID:
      atob(IsGuestNavigation.toString()) === '1'
        ? parseInt(atob(factoryID.toString()))
        : 0,
    routeID: 0,
    year: '',
    month: '',
    registrationNumber: ''
  });
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [selectedDate, handleDateChange] = useState(new Date());
  const [TrialBalanceDetailList, setTrialBalanceDetailList] = useState([]);
  const [PdfExcelGeneralDetails, setPdfExcelGeneralDetails] = useState({
    groupName: '',
    factoryName: '',
    selectedDate: '',
    fromDate: '',
    endDate: ''
  });

  const [startDateRange, setStartDateRange] = useState(new Date());
  const [endDateRange, setEndDateRange] = useState(new Date());
  const [minEndDate, setMinEndDate] = useState();
  const [maxEndDate, setMaxEndDate] = useState();

  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(0);
  const handleLimitChange = event => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());

    const decrypedFactoryID = atob(factoryID.toString());
    const decrypedStartDate = atob(startDate.toString());
    const decrypedEndDate = atob(endDate.toString());
    const decrypedIsGuestNavigation = atob(IsGuestNavigation.toString());

    if (decrypedIsGuestNavigation === '1') {
      var decryptedStartDate = new Date(decrypedStartDate);
      var decryptedEndDate = new Date(decrypedEndDate);

      setStartDateRange(new Date(decryptedStartDate));
      setEndDateRange(new Date(decryptedEndDate));
      trackPromise(GetInitialTrialBalanceDetails(decryptedStartDate, decryptedEndDate));

      if (decrypedFactoryID != 0) {
        trackPromise(findRelatedFinancialYearByDate(decryptedStartDate));
      }
    } else {
      trackPromise(findRelatedFinancialYearByDate(new Date()));
    }
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown());
  }, [trialBalanceDetails.groupID]);

  useEffect(() => {
    if (FactoryList.length > 0 && atob(IsGuestNavigation.toString()) === '1') {
      trackPromise(GetTrialBalanceDetails());
    }
  }, [FactoryList]);

  useEffect(() => {
    setTrialBalanceDetailList([]);
  }, [startDateRange]);

  useEffect(() => {
    setTrialBalanceDetailList([]);
  }, [endDateRange]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWTRIALBALANCEREPORT'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setTrialBalanceDetails({
      ...trialBalanceDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(
      trialBalanceDetails.groupID
    );
    setFactoryList(factories);
  }

  async function GetInitialTrialBalanceDetails(startDate, endDate) {
    setTrialBalanceDetailList([]);
    let month = selectedDate.getMonth();
    let year = selectedDate.getFullYear();

    let requestModel = {
      groupID: parseInt(trialBalanceDetails.groupID),
      factoryID: parseInt(trialBalanceDetails.factoryID),
      applicableMonth: (++month).toString(),
      applicableYear: year.toString(),
      fromDate: (moment(startDate).format()).toString().split('T')[0],
      toDate: (moment(endDate).format()).toString().split('T')[0]
    }
    setPdfExcelGeneralDetails({
      groupName: (GroupList[requestModel.groupID].toString()),
      factoryName: (FactoryList[requestModel.factoryID]).toString(),
      selectedDate: (selectedDate.toLocaleString('en-us', { month: 'long' }) + " " + selectedDate.getDate() + ", " + selectedDate.getFullYear()).toString(),
      fromDate: (startDateRange.toLocaleString('en-us', { month: 'long' }) + " " + startDateRange.getDate() + ", " + startDateRange.getFullYear()).toString(),
      endDate: (endDateRange.toLocaleString('en-us', { month: 'long' }) + " " + endDateRange.getDate() + ", " + endDateRange.getFullYear()).toString(),
    })

    let response = await services.GetTrialBalanceDetails(requestModel);
    if (response.data === null || response.data.length <= 0) {
      setTrialBalanceDetailList([]);
      alert.error('No Records to display');
    } else {
      setTrialBalanceDetailList(response.data);
    }
  }

  async function GetTrialBalanceDetails() {
    setTrialBalanceDetailList([]);

    if (moment(endDateRange).diff(maxEndDate, 'days') > 0) {
      alert.error("End date should not be after financial year end date");
      return;
    }

    if (moment(minEndDate).diff(endDateRange, 'days') > 0) {
      alert.error("End date should not be befor financial year start date");
      return;
    }

    let month = selectedDate.getMonth();
    let year = selectedDate.getFullYear();

    let requestModel = {
      groupID: parseInt(trialBalanceDetails.groupID),
      factoryID: parseInt(trialBalanceDetails.factoryID),
      applicableMonth: (++month).toString(),
      applicableYear: year.toString(),
      fromDate: (moment(startDateRange).format()).toString().split('T')[0],
      toDate: (moment(endDateRange).format()).toString().split('T')[0]
    }
    setPdfExcelGeneralDetails({
      groupName: (GroupList[requestModel.groupID].toString()),
      factoryName: (FactoryList[requestModel.factoryID]).toString(),
      selectedDate: (selectedDate.toLocaleString('en-us', { month: 'long' }) + " " + selectedDate.getDate() + ", " + selectedDate.getFullYear()).toString(),
      fromDate: (startDateRange.toLocaleString('en-us', { month: 'long' }) + " " + startDateRange.getDate() + ", " + startDateRange.getFullYear()).toString(),
      endDate: (endDateRange.toLocaleString('en-us', { month: 'long' }) + " " + endDateRange.getDate() + ", " + endDateRange.getFullYear()).toString(),
    })

    let response = await services.GetTrialBalanceDetails(requestModel);
    if (response.data === null || response.data.length <= 0) {
      setTrialBalanceDetailList([]);
      alert.error('No Records to display');
    } else {
      setTrialBalanceDetailList(response.data);
    }
  }

  async function createFile() {
    var file = await createDataForExcel(TrialBalanceDetailList);
    var settings = {
      sheetName:
        'Trial Balance Report ' +
        PdfExcelGeneralDetails.groupName +
        ' ' +
        PdfExcelGeneralDetails.factoryName +
        ' ' +
        PdfExcelGeneralDetails.fromDate +
        '-' +
        PdfExcelGeneralDetails.endDate,
      fileName:
        'Trial Balance Report ' +
        PdfExcelGeneralDetails.groupName +
        ' ' +
        PdfExcelGeneralDetails.factoryName +
        ' ' +
        PdfExcelGeneralDetails.fromDate +
        '-' +
        PdfExcelGeneralDetails.endDate
    };

    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'Trial Balance Report',
        columns: tempcsvHeaders,
        content: file
      }
    ];
    xlsx(dataA, settings);
  }

  async function createDataForExcel(data) {
    if (data === null || data.length === 0) {
      return;
    }

    let creditTotal = 0;
    let debitTotal = 0;

    var returnDataArray = [];
    for (const item of data) {
      creditTotal = creditTotal + item.amountCredit;
      debitTotal = debitTotal + item.amountDebit;
    }

    let dataArray = data;

    if (dataArray != null) {
      dataArray.map(x => {
        var detailModel = {
          'Account Number': x.accountNumber,
          'Account Name': x.accountName,
          'Open Debit (LKR)':CurrencyCommaSeperation(x.openDebit),
          'Open Credit (LKR)': CurrencyCommaSeperation(x.openCredit),
          'Transaction Debit (LKR)': CurrencyCommaSeperation(x.transDebit),
          'Transaction Credit (LKR)': CurrencyCommaSeperation(x.transCredit),
          'Closing Debit (LKR)': CurrencyCommaSeperation(x.closingDebit),
          'Closing Credit (LKR)': CurrencyCommaSeperation(x.closingCredit)
        };
        returnDataArray.push(detailModel);
      });

      var detailModelTotal = {
        'Account Number': 'Total (LKR)',
        'Account Name': '',
        'Open Debit (LKR)':
          TrialBalanceDetailList.reduce(
            (totalOpenDebit, item) => totalOpenDebit + item.openDebit,
            0
          ).toFixed(2) - 0, // - 0 is used to align the content to the right
        'Open Credit (LKR)':
          TrialBalanceDetailList.reduce(
            (totalOpenCredit, item) => totalOpenCredit + item.openCredit,
            0
          ).toFixed(2) - 0,
        'Transaction Debit (LKR)':
          TrialBalanceDetailList.reduce(
            (totalTransDebit, item) => totalTransDebit + item.transDebit,
            0
          ).toFixed(2) - 0,
        'Transaction Credit (LKR)':
          TrialBalanceDetailList.reduce(
            (totalTransCredit, item) => totalTransCredit + item.transCredit,
            0
          ).toFixed(2) - 0,
        'Closing Debit (LKR)':
          TrialBalanceDetailList.reduce(
            (totalClosingDebit, item) => totalClosingDebit + item.closingDebit,
            0
          ).toFixed(2) - 0,
        'Closing Credit (LKR)':
          TrialBalanceDetailList.reduce(
            (totalClosingCredit, item) =>
              totalClosingCredit + item.closingCredit,
            0
          ).toFixed(2) - 0
      };
      returnDataArray.push(detailModelTotal);

      var unbalanceTotal = {
        'Account Number': 'Unbalance (LKR)',
        'Account Name': '',
        'Open Debit (LKR)': '',
        'Open Credit (LKR)':
          TrialBalanceDetailList.reduce(
            (totalOpenDebit, item) => totalOpenDebit + item.openDebit,
            0
          ).toFixed(2) -
          TrialBalanceDetailList.reduce(
            (totalOpenCredit, item) => totalOpenCredit + item.openCredit,
            0
          ).toFixed(2),
        'Transaction Debit (LKR)': '',
        'Transaction Credit (LKR)':
          TrialBalanceDetailList.reduce(
            (totalTransDebit, item) => totalTransDebit + item.transDebit,
            0
          ).toFixed(2) -
          TrialBalanceDetailList.reduce(
            (totalTransCredit, item) => totalTransCredit + item.transCredit,
            0
          ).toFixed(2),
        'Closing Debit (LKR)': '',
        'Closing Credit (LKR)':
          TrialBalanceDetailList.reduce(
            (totalClosingDebit, item) => totalClosingDebit + item.closingDebit,
            0
          ).toFixed(2) -
          TrialBalanceDetailList.reduce(
            (totalClosingCredit, item) =>
              totalClosingCredit + item.closingCredit,
            0
          ).toFixed(2)
      };
      returnDataArray.push(unbalanceTotal);
    }
    return returnDataArray;
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

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    );
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setTrialBalanceDetails({
      ...trialBalanceDetails,
      [e.target.name]: value
    });
  }

  async function findRelatedFinancialYearByDate(startDate) {
    const financialYear = await services.findRelatedFinancialYearByDate(trialBalanceDetails.groupID, trialBalanceDetails.factoryID, startDate.toLocaleDateString());
    setMinEndDate(startDate);
    setMaxEndDate(financialYear.financialYearEndDate);
  }

  function NavigateToInquiryRegistry(accountID) {
    const encryptedGroupID = btoa(trialBalanceDetails.groupID.toString())
    const encryptedFactoryID = btoa(trialBalanceDetails.factoryID.toString())
    const encryptedAccountID = btoa(accountID.toString())
    const encryptedStartDate = btoa(startDateRange.toString())
    const encryptedEndDate = btoa(endDateRange.toString())
    navigate(
      '/app/inquiryRegistryFromTrialBalance/' +
      encryptedGroupID +
      '/' +
      encryptedFactoryID +
      '/' +
      encryptedAccountID +
      '/' +
      encryptedStartDate +
      '/' +
      encryptedEndDate +
      '/' +
      btoa('1')
    );
  }

  async function startDateOnChange(e) {
    setStartDateRange(e)
    findRelatedFinancialYearByDate(e)
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: trialBalanceDetails.groupID,
              factoryID: trialBalanceDetails.factoryID
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Estate is required')
                .min('1', 'Estate is required')
            })}
            enableReinitialize
          >
            {({ errors, handleBlur, handleSubmit, touched }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={trialBalanceDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryID">
                               Estate *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.factoryID && errors.factoryID
                              )}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={trialBalanceDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date" style={{ marginBottom: '-8px' }}>From Date *</InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name='startDate'
                                id='startDate'
                                value={startDateRange}
                                onChange={(e) => {
                                  startDateOnChange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date" style={{ marginBottom: '-8px' }}>To Date *</InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name='startDate'
                                id='startDate'
                                value={endDateRange}
                                onChange={(e) => {
                                  setEndDateRange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                                maxDate={maxEndDate}
                                minDate={minEndDate}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            onClick={() =>
                              trackPromise(GetTrialBalanceDetails())
                            }
                            variant="contained"
                          >
                            Search
                          </Button>
                        </Box>
                        {TrialBalanceDetailList !== null &&
                          TrialBalanceDetailList.length > 0 ? (
                          <PerfectScrollbar>
                            <Box
                              minWidth={1050}
                              style={{ borderBottom: '1px solid black' }}
                            >
                              <h3 style={{ textAlign: 'center' }}>
                                <span> {'Trial Balance of ' + PdfExcelGeneralDetails.factoryName} </span>
                              </h3>
                              <h5 style={{ textAlign: 'center' }}>
                                <span> {' From ' + PdfExcelGeneralDetails.fromDate} </span> <span> {' To ' + PdfExcelGeneralDetails.endDate}  </span>
                              </h5>
                              <br />
                              <TableContainer>
                                <Table aria-label="caption table">
                                  <TableHead>
                                    <TableRow style={{ borderTop: "1px black solid", borderLeft: "1px black solid", borderRight: "1px black solid" }}>
                                      <TableCell align={'left'}>Account Code</TableCell>
                                      <TableCell align={'left'}>Account Name</TableCell>
                                      <TableCell align={'right'}>Year To Date Debit (LKR)</TableCell>
                                      <TableCell align={'right'}>Year To Date Credit (LKR)</TableCell>
                                      <TableCell align={'right'} style={{ backgroundColor: "#F4F6F8" }} >Transaction Debit (LKR)</TableCell>
                                      <TableCell align={'right'} style={{ backgroundColor: "#F4F6F8" }} >Transaction Credit (LKR)</TableCell>
                                      <TableCell align={'right'}>Closing Debit (LKR)</TableCell>
                                      <TableCell align={'right'}>Closing Credit (LKR)</TableCell>
                                      <TableCell align={'left'}>Action</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {TrialBalanceDetailList.slice(
                                      page * limit,
                                      page * limit + limit
                                    ).map((data, index) => (
                                      <TableRow
                                        key={index}
                                        style={{ border: '1px black solid' }}
                                      >
                                        <TableCell
                                          align={'left'}
                                          component="th"
                                          scope="row"
                                        >
                                          {data.accountNumber}
                                        </TableCell>
                                        <TableCell
                                          align={'left'}
                                          component="th"
                                          scope="row"
                                        >
                                          {data.accountName}
                                        </TableCell>
                                        <TableCell
                                          align={'right'}
                                          component="th"
                                          scope="row"
                                        >
                                          <CountUp
                                            end={data.openDebit.toFixed(2)}
                                            decimals={2}
                                            separator=','
                                            duration={0.1}
                                            decimal="."

                                          />
                                        </TableCell>
                                        <TableCell
                                          align={'right'}
                                          component="th"
                                          scope="row"
                                        >
                                          <CountUp
                                            end={data.openCredit.toFixed(2)}
                                            decimals={2}
                                            separator=','
                                            decimal="."
                                            duration={0.1}
                                          />
                                        </TableCell>
                                        <TableCell
                                          align={'right'}
                                          style={{ backgroundColor: '#F4F6F8' }}
                                          component="th"
                                          scope="row"
                                        >
                                          <CountUp
                                            end={data.transDebit.toFixed(2)}
                                            decimals={2}
                                            separator=','
                                            decimal="."
                                            duration={0.1}
                                          />
                                        </TableCell>
                                        <TableCell
                                          align={'right'}
                                          style={{ backgroundColor: '#F4F6F8' }}
                                          component="th"
                                          scope="row"
                                        >
                                          <CountUp
                                            end={data.transCredit.toFixed(2)}
                                            decimals={2}
                                            separator=','
                                            decimal="."
                                            duration={0.1}
                                          />
                                        </TableCell>
                                        <TableCell
                                          align={'right'}
                                          component="th"
                                          scope="row"
                                        >
                                          <CountUp
                                            end={data.closingDebit.toFixed(2)}
                                            decimals={2}
                                            separator=','
                                            decimal="."
                                            duration={0.1}
                                          />
                                        </TableCell>
                                        <TableCell
                                          align={'right'}
                                          component="th"
                                          scope="row"
                                        >
                                          <CountUp
                                            end={data.closingCredit.toFixed(2)}
                                            decimals={2}
                                            separator=','
                                            decimal="."
                                            duration={0.1}
                                          />

                                        </TableCell>
                                        <TableCell
                                          align={'center'}
                                          component="th"
                                          scope="row"
                                        >
                                          <Tooltip title="View Account Details">
                                            <IconButton
                                              size="small"
                                              onClick={() =>
                                                NavigateToInquiryRegistry(
                                                  data.ledgerAccountID,
                                                )
                                              }
                                            >
                                              <VisibilityIcon />
                                            </IconButton>
                                          </Tooltip>
                                        </TableCell>
                                      </TableRow>
                                    ))}

                                    <TableRow
                                      style={{ border: '1px black solid' }}
                                    >
                                      <TableCell
                                        align={'left'}
                                        component="th"
                                        scope="row"
                                      >
                                        <Typography className={classes.bold}>
                                          {'Total ' + CurrenctType}
                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        align={'left'}
                                        component="th"
                                        scope="row"
                                      ></TableCell>
                                      <TableCell
                                        align={'right'}
                                        component="th"
                                        scope="row"
                                      >
                                        <Typography className={classes.bold}>
                                          <CountUp
                                            end={TrialBalanceDetailList.reduce(
                                              (totalOpenDebit, item) =>
                                                totalOpenDebit + item.openDebit,
                                              0
                                            ).toFixed(2)}
                                            decimals={2}
                                            separator=","
                                            duration={0.1}
                                            decimal="."
                                          />
                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        align={'right'}
                                        component="th"
                                        scope="row"
                                      >
                                        <Typography className={classes.bold}>
                                          <CountUp
                                            end={TrialBalanceDetailList.reduce(
                                              (totalOpenCredit, item) =>
                                                totalOpenCredit + item.openCredit,
                                              0
                                            ).toFixed(2)}
                                            decimals={2}
                                            separator=","
                                            duration={0.1}
                                            decimal="."
                                          />

                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        align={'right'}
                                        component="th"
                                        scope="row"
                                        style={{ backgroundColor: '#F4F6F8' }}
                                      >
                                        <Typography className={classes.bold}>
                                          <CountUp
                                            end={TrialBalanceDetailList.reduce(
                                              (totalTransDebit, item) =>
                                                totalTransDebit + item.transDebit,
                                              0
                                            ).toFixed(2)}
                                            decimals={2}
                                            decimal="."
                                            separator=','
                                            duration={0.1}
                                          />
                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        align={'right'}
                                        component="th"
                                        scope="row"
                                        style={{ backgroundColor: '#F4F6F8' }}
                                      >
                                        <Typography className={classes.bold}>
                                          <CountUp
                                            end={TrialBalanceDetailList.reduce(
                                              (totalTransCredit, item) =>
                                                totalTransCredit +
                                                item.transCredit,
                                              0
                                            ).toFixed(2)}
                                            decimals={2}
                                            decimal="."
                                            separator=','
                                            duration={0.1}
                                          />
                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        align={'right'}
                                        component="th"
                                        scope="row"
                                      >
                                        <Typography className={classes.bold}>
                                          <CountUp
                                            end={TrialBalanceDetailList.reduce(
                                              (totalClosingDebit, item) =>
                                                totalClosingDebit +
                                                item.closingDebit,
                                              0
                                            ).toFixed(2)}
                                            decimals={2}
                                            decimal="."
                                            separator=','
                                            duration={0.1}
                                          />
                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        align={'right'}
                                        component="th"
                                        scope="row"
                                      >
                                        <Typography className={classes.bold}>
                                          <CountUp
                                            end={TrialBalanceDetailList.reduce(
                                              (totalClosingCredit, item) =>
                                                totalClosingCredit +
                                                item.closingCredit,
                                              0
                                            ).toFixed(2)}
                                            decimals={2}
                                            decimal="."
                                            separator=','
                                            duration={0.1}
                                          />
                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        align={'center'}
                                        component="th"
                                        scope="row"
                                      ></TableCell>
                                    </TableRow>

                                    <TableRow
                                      style={{ border: '1px black solid' }}
                                    >
                                      <TableCell
                                        align={'left'}
                                        component="th"
                                        scope="row"
                                      >
                                        <Typography className={classes.bold}>
                                          {'Unbalance ' + CurrenctType}
                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        align={'left'}
                                        component="th"
                                        scope="row"
                                      ></TableCell>
                                      <TableCell
                                        align={'center'}
                                        component="th"
                                        scope="row"
                                        colSpan={2}
                                      >
                                        <Typography className={classes.bold}>
                                          <CountUp
                                            end={(TrialBalanceDetailList.reduce(
                                              (totalOpenDebit, item) =>
                                                totalOpenDebit + item.openDebit,
                                              0
                                            ) -
                                              TrialBalanceDetailList.reduce(
                                                (totalOpenCredit, item) =>
                                                  totalOpenCredit +
                                                  item.openCredit,
                                                0
                                              )
                                            ).toFixed(2)}
                                            decimals={2}
                                            decimal="."
                                            separator=','
                                            duration={0.1}
                                          />
                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        align={'center'}
                                        component="th"
                                        scope="row"
                                        colSpan={2}
                                        style={{ backgroundColor: '#F4F6F8' }}
                                      >
                                        <Typography className={classes.bold}>
                                          <CountUp
                                            end={(TrialBalanceDetailList.reduce(
                                              (totalTransDebit, item) =>
                                                totalTransDebit +
                                                item.transDebit,
                                              0
                                            ) -
                                              TrialBalanceDetailList.reduce(
                                                (totalTransCredit, item) =>
                                                  totalTransCredit +
                                                  item.transCredit,
                                                0
                                              )
                                            ).toFixed(2)}
                                            decimals={2}
                                            decimal='.'
                                            separator=','
                                            duration={0.1}
                                          />
                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        align={'center'}
                                        component="th"
                                        scope="row"
                                        colSpan={2}
                                      >
                                        <Typography className={classes.bold}>
                                          <CountUp
                                            end={(TrialBalanceDetailList.reduce(
                                              (totalClosingDebit, item) =>
                                                totalClosingDebit +
                                                item.closingDebit,
                                              0
                                            ) -
                                              TrialBalanceDetailList.reduce(
                                                (totalClosingCredit, item) =>
                                                  totalClosingCredit +
                                                  item.closingCredit,
                                                0
                                              )
                                            ).toFixed(2)}
                                            decimals={2}
                                            decimal="."
                                            separator=','
                                            duration={0.1}
                                          />
                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        align={'center'}
                                        component="th"
                                        scope="row"
                                        colSpan={2}
                                      ></TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                            <TablePagination
                              component="div"
                              count={TrialBalanceDetailList.length}
                              onChangePage={handlePageChange}
                              onChangeRowsPerPage={handleLimitChange}
                              page={page}
                              rowsPerPage={limit}
                              rowsPerPageOptions={[5, 10, 25]}
                            />
                          </PerfectScrollbar>
                        ) : null}

                        {TrialBalanceDetailList.length > 0 ? (
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorRecord}
                              onClick={() => createFile()}
                            >
                              EXCEL
                            </Button>
                            <ReactToPrint
                              documentTitle={'Trial Balance Report'}
                              trigger={() => (
                                <Button
                                  color="primary"
                                  id="btnRecord"
                                  type="submit"
                                  variant="contained"
                                  style={{ marginRight: '1rem' }}
                                  className={classes.colorCancel}
                                >
                                  PDF
                                </Button>
                              )}
                              content={() => componentRef.current}
                            />
                            <div hidden={true}>
                              <CreatePDF
                                ref={componentRef}
                                trialBalanceDetails={TrialBalanceDetailList}
                                PdfExcelGeneralDetails={PdfExcelGeneralDetails}
                              />
                            </div>
                          </Box>
                        ) : null}
                      </CardContent>
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
}

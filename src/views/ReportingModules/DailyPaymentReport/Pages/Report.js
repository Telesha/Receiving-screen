import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Button, makeStyles, Container, Divider, CardContent, CardHeader, Grid, TextField,
  MenuItem, InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import MaterialTable from "material-table";
import { red, blue } from '@material-ui/core/colors';
import { useAlert } from "react-alert";
import { Formik } from 'formik';
import * as Yup from "yup";
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import xlsx from 'json-as-xlsx';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PageHeader from 'src/views/Common/PageHeader';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import Autocomplete from '@material-ui/lab/Autocomplete';
import CountUp from 'react-countup';
import CurrencyCommaSeperation from 'src/views/Common/CurrencyCommaSeperation';


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
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecordAndNew: {
    backgroundColor: "#FFBE00"
  },
  colorRecord: {
    backgroundColor: "green",
  }
}));

const screenCode = 'DAILYPAYMENTREPORT';

export default function DailyPaymentReport(props) {
  const { groupID, factoryID, accountID,startDate , endDate, IsGuestNavigation } = useParams();
  const [title, setTitle] = useState("Daily Payment Report")
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [ledgerAccounts, setLedgerAccounts] = useState();
  const [ dailyPayments, setdailyPayments] = useState({
    groupID: atob(IsGuestNavigation.toString()) === "2" ? parseInt(atob(groupID.toString())) : '0',
    factoryID: atob(IsGuestNavigation.toString()) === "2" ? parseInt(atob(factoryID.toString())) : '0',
    ledgerAccountID: atob(IsGuestNavigation.toString()) === "2" ? parseInt(atob(accountID.toString())) : '0',
    ledgerAccountCode: atob(IsGuestNavigation.toString()) === "2" ? parseInt(atob(accountID.toString())) : ' ',
    ledgerAccountName: atob(IsGuestNavigation.toString()) === "2" ? parseInt(atob(accountID.toString())) : '0',
  });
  const [transactionDetails, setTransactionDetails] = useState([]);
  const [transactionTotal, setTransactionTotal] = useState({
    credit: 0,
    debit: 0
  });
  const [openingBalance, SetOpeningBalance] = useState({
    totalDebit: 0,
    totalCredit: 0
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [startDateRange, setStartDateRange] = useState(new Date());
  const [endDateRange, setEndDateRange] = useState(new Date());
  const [minEndDate, setMinEndDate] = useState();
  const [maxEndDate, setMaxEndDate] = useState();
  const navigate = useNavigate();
  const alert = useAlert();
  const open = Boolean(anchorEl);
  const componentRef = useRef();
  const [csvHeaders, SetCsvHeaders] = useState([])
  const [IsBackButtonEnableForTrialBalace, setIsBackButtonEnableForTrialBalace] = useState(false)
  const [PdfExcelGeneralDetails, setPdfExcelGeneralDetails] = useState({
    groupName: '',
    factoryName: '',
    fromDate: '',
    endDate: '',
  });
  const [QuaryParamDetails, setQuaryParamDetails] = useState({
    groupID: "",
    factoryID: "",
    accountID: "",
    startDate: "",
    endDate: "",
    IsGuestNavigation: "0"
  });

  useEffect(() => {
    getPermissions();
    trackPromise(getGroupsForDropdown());
    const decrypedGroupID = atob(groupID.toString())
    const decrypedFactoryID = atob(factoryID.toString())
    const decrypedAccountID = atob(accountID.toString())
    const decrypedStartDate = atob(startDate.toString())
    const decrypedEndDate = atob(endDate.toString())
    const decrypedIsGuestNavigation = atob(IsGuestNavigation.toString())
    setQuaryParamDetails({
      groupID: decrypedGroupID,
      factoryID: decrypedFactoryID,
      accountID: decrypedAccountID,
      startDate: decrypedStartDate,
      endDate: decrypedEndDate,
      IsGuestNavigation: decrypedIsGuestNavigation
    })
    if (decrypedIsGuestNavigation === "2") {
      GenAccCode()
      var decryptedStartDate = new Date(decrypedStartDate);
      var decryptedEndDate = new Date(decrypedEndDate);
      setStartDateRange(new Date(decryptedStartDate));
      setEndDateRange(new Date(decryptedEndDate));
      setIsBackButtonEnableForTrialBalace(false)
      trackPromise(GetDetailsInitialLoad(decryptedStartDate, decryptedEndDate))
      if (decrypedFactoryID != "0") {
        trackPromise(findRelatedFinancialYearByDate(decryptedStartDate));
      }
    } else {
      trackPromise(findRelatedFinancialYearByDate(new Date()));
    }
  }, []);

  useEffect(() => {
    setTransactionDetails([]);
  }, [startDateRange]);

  useEffect(() => {
    setTransactionDetails([]);
  }, [endDateRange]);

  async function GenAccCode() {
    let result22 = await getAccountNamesForDropDown()
    if (result22 !== undefined) {
      let ledgerAccountCodeResult = result22.find(x => x.ledgerAccountID.toString() === atob(accountID.toString()).toString());
      setdailyPayments({
        ...dailyPayments,
        ledgerAccountCode: ledgerAccountCodeResult.ledgerAccountCode,
        ledgerAccountName: ledgerAccountCodeResult.ledgerAccountName
      });
    }
  }
  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [dailyPayments.groupID]);

  useEffect(() => {
    trackPromise(getAccountNamesForDropDown());
  }, [dailyPayments.groupID, dailyPayments.factoryID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYPAYMENTREPORT');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setdailyPayments({
      ...dailyPayments,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(dailyPayments.groupID);
    setFactories(factory);
  }

  async function getAccountNamesForDropDown() {
    const ledgerAccount = await services.GetLedgerAccountNamesandCodeForDropdown(dailyPayments.groupID, dailyPayments.factoryID);
    setLedgerAccounts(ledgerAccount);
    return ledgerAccount
  }

  async function GetDetailsInitialLoad(startDate, endDate) {
    let model = {
      groupID: parseInt(dailyPayments.groupID),
      factoryID: parseInt(dailyPayments.factoryID),
      startDate: startDate,
      endDate: endDate,
      ledgerAccountID: parseInt(dailyPayments.ledgerAccountID)
    }  
    const transaction = await services.getLedgerTrasactionDetails(model);
    if (transaction.statusCode == "Success" && transaction.data != null) {
      SetOpeningBalance({
        ...openingBalance,
        totalDebit: transaction.data.openingBalance.totalDebit.toFixed(2),
        totalCredit: transaction.data.openingBalance.totalCredit.toFixed(2)
      });
      setTransactionDetails(transaction.data.dailyPaymentReportDetails);
      calTotal(transaction.data.dailyPaymentReportDetails);
      createDataForExcel(transaction.data.dailyPaymentReportDetails);
    }
    else {
      alert.error("Please fill all the tabs");
    }
    setPdfExcelGeneralDetails({
      groupName: (groups[model.groupID].toString()),
      factoryName: (factories[model.factoryID]).toString(),
      ledgarAccName: (ledgerAccounts[model.ledgerAccountID]).toString(),
      fromDate: (startDateRange.toLocaleString('en-us', { month: 'long' }) + " " + startDateRange.getDate() + ", " + startDateRange.getFullYear()).toString(),
      endDate: (endDateRange.toLocaleString('en-us', { month: 'long' }) + " " + endDateRange.getDate() + ", " + endDateRange.getFullYear()).toString(),
    })
}

  async function GetDetails() {
    let model = {
      groupID: parseInt(dailyPayments.groupID),
      factoryID: parseInt(dailyPayments.factoryID),
      startDate: startDateRange,
      endDate: endDateRange,
      ledgerAccountID: parseInt(dailyPayments.ledgerAccountID)
    }
    const transaction = await services.getLedgerTrasactionDetails(model);
    if (transaction.statusCode == "Success" && transaction.data != null) {

      if (transaction.data.dailyPaymentReportDetails.length <= 0) {
        alert.error("NO RECORDS TO DISPLAY");
      }

      SetOpeningBalance({
        ...openingBalance,
        totalDebit: transaction.data.openingBalance.totalDebit.toFixed(2),
        totalCredit: transaction.data.openingBalance.totalCredit.toFixed(2)
      });
      setTransactionDetails(transaction.data.dailyPaymentReportDetails);
      calTotal(transaction.data.dailyPaymentReportDetails);
      createDataForExcel(transaction.data.dailyPaymentReportDetails);
    }
    else {
      alert.error("Please fill all the tabs");
    }
    setPdfExcelGeneralDetails({
        groupName: (groups[model.groupID].toString()),
        factoryName: (factories[model.factoryID]).toString(),
        fromDate: (startDateRange.toLocaleString('en-us', { month: 'long' }) + " " + startDateRange.getDate() + ", " + startDateRange.getFullYear()).toString(),
        endDate: (endDateRange.toLocaleString('en-us', { month: 'long' }) + " " + endDateRange.getDate() + ", " + endDateRange.getFullYear()).toString(),
      })
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          ReferenceNo: x.referenceNumber,
          Date: x.date,
          Description: x.description,
          ChequeNo: x.chequeNumber,
          RegNo: x.registrationNumber,
          Debit: CurrencyCommaSeperation(x.debit),
          Credit: CurrencyCommaSeperation(x.credit),
          LedgerAccountName: x.ledgerAccountName,
        }
        res.push(vr);

      });
      res.push({});
        var vr = {
          'ReferenceNo': 'Group : ' + PdfExcelGeneralDetails.groupName
        }
        res.push(vr);
        var vr = {
          'ReferenceNo': 'Factory : ' + PdfExcelGeneralDetails.factoryName
        }
        res.push(vr);
        var vr = {
          'ReferenceNo': 'From Date : ' + PdfExcelGeneralDetails.fromDate
        }
        res.push(vr);
        var vr = {
          'ReferenceNo': 'To Date : ' + PdfExcelGeneralDetails.endDate
        }
        res.push(vr);
        var vr = {
          'ReferenceNo': 'Ledger Account Name : ' + dailyPayments.ledgerAccountName.toString()
        }
        res.push(vr);
    }
    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(transactionDetails);
    
    var settings = {
      sheetName: 'Daily Payment Report',
      fileName: 'Daily Payment Report',
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Daily Payment Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]

    xlsx(dataA, settings);
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
  function calTotal(data) {
    let debitSum = 0;
    let creditSum = 0;
    data.forEach(element => {
      debitSum += parseFloat(element.debit);
      creditSum += parseFloat(element.credit)
    });
    setTransactionTotal({
      ...transactionTotal,
      debit: debitSum.toFixed(2),
      credit: creditSum.toFixed(2)
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setdailyPayments({
      ...dailyPayments,
      [e.target.name]: value
    });
  }

  function handleSearchDropdownChangeLedger(data, e) {
    if (data === undefined || data === null) {
      setdailyPayments({
        ...dailyPayments,
        ledgerAccountID: '0',
        ledgerAccountName: '' 
      });
      return;
    } else {
      var nameV = "ledgerAccountID";
      var valueV = data["ledgerAccountID"];
      var ledgerAccountNameV = data["ledgerAccountName"]; 
  
      setdailyPayments({
        ...dailyPayments,
        ledgerAccountID: valueV.toString(),
        ledgerAccountCode: data.ledgerAccountCode,
        ledgerAccountName: ledgerAccountNameV
      });
    }
  }

  async function findRelatedFinancialYearByDate(startDate) {
    const financialYear = await services.findRelatedFinancialYearByDate(dailyPayments.groupID, dailyPayments.factoryID, startDate.toLocaleDateString());

    setMinEndDate(startDate);
    setMaxEndDate(financialYear);
  }

  async function startDateOnChange(e) {
    setStartDateRange(e)
    findRelatedFinancialYearByDate(e)
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        {
          IsBackButtonEnableForTrialBalace ?
            <Grid item md={2} xs={12}>
              <PageHeader
                onClick={handleClick}
              />
            </Grid> : null
        }
      </Grid>
    )
  }

  const handleClick = () => {
    const encryptedGroupID = btoa(QuaryParamDetails.groupID.toString())
    const encryptedFactoryID = btoa(QuaryParamDetails.factoryID.toString())
    const encryptedStartDate = btoa(QuaryParamDetails.startDate.toString())
    const encryptedEndDate = btoa(QuaryParamDetails.endDate.toString())

    navigate('/app/trailBalanceReportReturn/' + encryptedGroupID + '/' + encryptedFactoryID + '/' + encryptedStartDate + '/' + encryptedEndDate + '/' + btoa("2"));
  }

  function NavigateToGenaralJournal(referenceNumber, voucherTypeID) {
    const encryptedGroupID = btoa(dailyPayments.groupID.toString())
    const encryptedFactoryID = btoa(dailyPayments.factoryID.toString())
    const encryptedAccountID = btoa(dailyPayments.ledgerAccountID.toString())
    const encryptedStartDate = btoa(startDateRange.toString())
    const encryptedEndDate = btoa(endDateRange.toString())
    const encryptedReferenceNumber = btoa(referenceNumber.toString());
    if (voucherTypeID == 1) {
      navigate('/app/Payment/view/' + encryptedGroupID + '/' + encryptedFactoryID + '/' + encryptedAccountID + '/' + encryptedStartDate + '/' + encryptedEndDate + '/' + btoa("2") + '/' + encryptedReferenceNumber);
    }
    else if (voucherTypeID == 2) {
      navigate('/app/Receiving/view/' + encryptedGroupID + '/' + encryptedFactoryID + '/' + encryptedAccountID + '/' + encryptedStartDate + '/' + encryptedEndDate + '/' + btoa("2") + '/' + encryptedReferenceNumber);
    }
    else {
      navigate('/app/generalJournal/view/' + encryptedGroupID + '/' + encryptedFactoryID + '/' + encryptedAccountID + '/' + encryptedStartDate + '/' + encryptedEndDate + '/' + btoa("2") + '/' + encryptedReferenceNumber);
    }
  }
  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: dailyPayments.groupID,
              factoryID: dailyPayments.factoryID,
              ledgerAccountID: dailyPayments.ledgerAccountID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                ledgerAccountID: Yup.number().required('Ledger account name is required').min("1", 'Ledger account name is required')
              })
            }
            enableReinitialize
            onSubmit={() => trackPromise(GetDetails())}
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
             
              touched
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
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={dailyPayments.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryID">
                                Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={dailyPayments.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
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
                                maxDate={new Date()}
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
                                name='endDate'
                                id='end Date'
                                value={endDateRange}
                                onChange={(e) => {
                                  setEndDateRange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                                minDate={startDateRange}
                                maxDate={new Date()}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="ledgerAccountID">
                              Ledger Account Name *
                            </InputLabel>
                            { atob(IsGuestNavigation).toString() === "2"? 
                                <TextField
                                  variant="outlined"
                                  name="ledgerAccountID"
                                  id="ledgerAccountID"
                                  fullWidth
                                  size='small'
                                  value={dailyPayments.ledgerAccountName}
                                  disabled={true}
                                />
                            :
                            <Autocomplete
                              id="ledgerAccountID"
                              options={ledgerAccounts}
                              getOptionLabel={(option) =>option.ledgerAccountName.toString()}
                              onChange={(e, value) => handleSearchDropdownChangeLedger(value, e)}
                              renderInput={(params) =>
                                <TextField {...params}
                                  variant="outlined"
                                  name="ledgerAccountID"
                                  fullWidth
                                  size='small'
                                  value={dailyPayments.ledgerAccountID}
                                  helperText={touched.ledgerAccountID && errors.ledgerAccountID}
                                  onBlur={handleBlur}
                                  error={Boolean(touched.ledgerAccountID && errors.ledgerAccountID)}
                                />
                              }
                            />}
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="ledgerAccountCode">
                              Account Code
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="ledgerAccountCode"
                              size='small'
                              value={dailyPayments.ledgerAccountCode}
                              variant="outlined"
                              id="ledgerAccountCode"
                              disabled={true}
                            >
                            </TextField>
                          </Grid>
                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                        <br />

                      </CardContent>          
                      {/* {transactionDetails.length > 0 ?
                        <CardContent>
                          <Box >
                            <Grid container md={12} spacing={2}  >
                              <Grid item md={3} xs={3}> </Grid>
                              
                              <Grid item md={4} xs={4}>
                                <InputLabel></InputLabel>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                              <Grid item md={1} xs={1}>
                                <InputLabel style={{ textAlign: "center" }}><b>Dr</b></InputLabel>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                              <Grid item md={1} xs={1}>
                                <InputLabel style={{ textAlign: "center" }}><b>Cr</b></InputLabel>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                            </Grid>
                            <Grid container md={12} spacing={2} >
                              <Grid item md={3} xs={3}> </Grid>
                              <Grid item md={4} xs={4}>

                                <InputLabel><b>Opening Balance as at {startDateRange.toLocaleDateString()} </b></InputLabel>
                              </Grid>
                              <Grid item md={1} xs={1}>  : </Grid>
                              <Grid style={{ textAlign: "center" }} item md={1} xs={1}>
                                <Typography variant='h6' >
                                  <CountUp decimals={2} separator=',' end={(openingBalance.totalDebit - openingBalance.totalCredit) >= 0 ? (openingBalance.totalDebit - openingBalance.totalCredit) : null} duration={0.1} className={classes.succes} />
                                </Typography>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                              <Grid style={{ textAlign: "center" }} item md={1} xs={1}>
                                <Typography variant='h6' >
                                  <CountUp decimals={2} separator=',' end={(openingBalance.totalCredit - openingBalance.totalDebit) >= 0 ? (openingBalance.totalCredit - openingBalance.totalDebit) : null} duration={0.1} className={classes.succes} />
                                </Typography>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                            </Grid>
                          </Box>
                        </CardContent> : null} */}
                      <Box minWidth={1050} padding='5px'>
                        {transactionDetails.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Reference No', field: 'referenceNumber' },
                              {
                                title: 'Date', field: 'date',
                                render: rowData => rowData.date.split('T')[0]
                              },
                              { title: 'Description', field: 'description' },
                              { title: 'Cheque No', field: 'chequeNumber' },
                              { title: 'Reg No', field: 'registrationNumber' },

                              {
                                title: 'Debit(Rs.)', field: 'debit', align: "right", headerAlign: 'right', render: (rowData) => <CountUp
                                  end={rowData.debit}
                                  separator=","
                                  decimals={2}
                                  decimal="."
                                  duration={0.1}
                                />
                              },
                              {
                                title: 'Credit(Rs.)', field: 'credit', align: "right", headerAlign: 'right',
                                render: (rowData) => <CountUp
                                  end={rowData.credit}
                                  separator=","
                                  decimals={2}
                                  decimal="."
                                  duration={0.1} />
                              },
                              { title: 'ledger Account ', field: 'ledgerAccountName' },
                            ]}
                            data={transactionDetails}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { height: '1%' },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 10,
                              pageSizeOptions: [10, 25, 50]
                            }}
                            actions={[
                              {
                                icon: VisibilityIcon,
                                tooltip: 'View Ledger Entries',
                                onClick: (event, transactionDetails) => NavigateToGenaralJournal(transactionDetails.referenceNumber, transactionDetails.voucherTypeID)

                              }
                            ]}
                          /> : null}
                      </Box>

                      {/* {transactionDetails.length > 0 ?
                        <CardContent>
                          <Box >
                            <Grid container md={12} spacing={2}  >
                              <Grid item md={3} xs={3}> </Grid>
                              <Grid item md={4} xs={4}>
                                <InputLabel></InputLabel>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                              <Grid item md={1} xs={1}>
                                <InputLabel style={{ textAlign: "center" }}><b>Dr</b></InputLabel>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                              <Grid item md={1} xs={1}>
                                <InputLabel style={{ textAlign: "center" }}><b>Cr</b></InputLabel>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                            </Grid>
                            <Grid container md={12} spacing={2}  >
                              <Grid item md={3} xs={3}> </Grid>
                              <Grid item md={4} xs={4}>
                                <InputLabel><b>Total (Rs) From {startDateRange.toLocaleDateString()} To {endDateRange.toLocaleDateString()} </b></InputLabel>
                              </Grid>
                              <Grid item md={1} xs={1}>  : </Grid>
                              <Grid style={{ textAlign: "right" }} item md={1} xs={1}>
                                <Typography variant='h6' >
                                  <CountUp decimals={2} separator=',' end={transactionTotal.debit} duration={0.1} className={classes.succes} />
                                </Typography>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                              <Grid style={{ textAlign: "right" }} item md={1} xs={1}>
                                <Typography variant='h6'>
                                  <CountUp decimals={2} separator=',' end={transactionTotal.credit} duration={0.1} className={classes.succes} />
                                </Typography>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                            </Grid>
                            <Grid container md={12} spacing={2} >
                              <Grid item md={3} xs={3}> </Grid>
                              <Grid item md={4} xs={4}>
                                <InputLabel><b>Net Change (Rs) From {startDateRange.toLocaleDateString()} To {endDateRange.toLocaleDateString()}  </b></InputLabel>
                              </Grid>
                              <Grid item md={1} xs={1}>  : </Grid>
                              <Grid style={{ textAlign: "right" }} item md={1} xs={1}>
                                <Typography variant='h6'>
                                  <CountUp decimals={2} separator=',' end={(transactionTotal.debit - transactionTotal.credit) >= 0 ? (transactionTotal.debit - transactionTotal.credit) : null} duration={0} className={classes.succes} />
                                </Typography>
                              </Grid>

                              <Grid item md={1} xs={1}>   </Grid>
                              <Grid style={{ textAlign: "right" }} item md={1} xs={1}>
                                <Typography variant='h6'>
                                  <CountUp decimals={2} separator=',' end={(transactionTotal.credit - transactionTotal.debit) >= 0 ? (transactionTotal.credit - transactionTotal.debit) : null} duration={0} className={classes.succes} />
                                </Typography>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                            </Grid>
                            <Grid p={3} container md={12} spacing={2} >
                              <Grid item md={3} xs={3}> </Grid>
                              <Grid item md={4} xs={4}>
                                <InputLabel><b>To Date Balance(Rs) as at {new Date().toISOString().split('T')[0]} </b></InputLabel>
                              </Grid>
                              <Grid item md={1} xs={1}>  : </Grid>
                              <Grid style={{ textAlign: "right" }} item md={1} xs={1}>
                                <Typography variant='h6'>
                                  <CountUp decimals={2} separator=',' end={((parseInt(openingBalance.totalDebit) + parseInt(transactionTotal.debit)) - (parseInt(openingBalance.totalCredit) + parseInt(transactionTotal.credit))) >= 0 ? ((parseInt(openingBalance.totalDebit) + parseInt(transactionTotal.debit)) - (parseInt(openingBalance.totalCredit) + parseInt(transactionTotal.credit))) : null} duration={0} className={classes.succes} />
                                </Typography>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                              <Grid style={{ textAlign: "right" }} item md={1} xs={1} >
                                <Typography variant='h6'>
                                  <CountUp decimals={2} separator=',' end={((parseInt(openingBalance.totalCredit) + parseInt(transactionTotal.credit)) - (parseInt(openingBalance.totalDebit) + parseInt(transactionTotal.debit))) >= 0 ? ((parseInt(openingBalance.totalCredit) + parseInt(transactionTotal.credit)) - (parseInt(openingBalance.totalDebit) + parseInt(transactionTotal.debit))) : null} duration={0} className={classes.succes} />
                                </Typography>
                              </Grid>
                              <Grid item md={1} xs={1}>   </Grid>
                            </Grid>
                          </Box>
                        </CardContent> : null} */}

                      {transactionDetails.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={createFile}
                          >
                            EXCEL
                          </Button>
                          <div>&nbsp;</div>
                          <ReactToPrint
                            documentTitle={"Daily Payment Report"}
                            trigger={() => <Button
                              color="primary"
                              id="btnCancel"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                            >
                              PDF
                            </Button>}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>PdfExcelGeneralDetails
                            <CreatePDF ref={componentRef} dailyPayments={dailyPayments}
                              PdfExcelGeneralDetails={PdfExcelGeneralDetails} TransactionDetails={transactionDetails} />
                          </div>
                        </Box> : null}
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  )
}


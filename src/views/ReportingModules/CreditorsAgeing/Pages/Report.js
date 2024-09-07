import React, { useState, useEffect, Fragment, useRef } from 'react';
import { useAlert } from "react-alert";
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, withStyles, TablePagination
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { LoadingComponent } from '../../../../utils/newLoader';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import xlsx from 'json-as-xlsx';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';
import { KeyboardDatePicker } from "@material-ui/pickers";
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import _ from 'lodash';

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
    backgroundColor: "red",
  },
  colorRecord: {
    backgroundColor: "green",
  },
  bold: {
    fontWeight: 600,
  }

}));

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const screenCode = 'CREDITORAGEING';

export default function CreditorsAgeing(props) {

  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const classes = useStyles();
  const [selectedDate, handleDateChange] = useState(new Date());
  const [groups, setGroups] = useState();
  const [reportData, setReportData] = useState([]);
  const [factories, setFactories] = useState();
  const [title, setTitle] = useState("Creditors Ageing Report");
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isBalanceSheetConfigurationEnabled: false,
  });
  const [DebtorsAgeingDetails, setDebtorsAgeingDetails] = useState({
    groupID: 0,
    factoryID: 0,
  });
  const [TotalCurrentAssestsAmount, setTotalCurrentAssestsAmount] = useState(0);
  const [TotalLongTermAssetsAmount, setTotalLongTermAssetsAmount] = useState(0);
  const [TotalAssetsAmount, setTotalAssetsAmount] = useState(0);

  const [TotalCurrentLiabilities, setTotalCurrentLiabilities] = useState(0);
  const [TotalLongTermLiabilities, setTotalLongTermLiabilities] = useState(0);
  const [TotalLiabilityAmount, setTotalLiabilityAmount] = useState(0);

  const [TotalOwnersEquity, setTotalOwnersEquity] = useState(0)
  const [TotalLiabilitiesAndOwnersQuity, setTotalLiabilitiesAndOwnersQuity] = useState(0)
  const [ProfitOrLoss, setProfitOrLoss] = useState(0)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const csvHeaders = [
    { label: "Ledger Account", value: "ledgerAccountName" },
    { label: "Voucher Number", value: "referenceNumber" },
    { label: "Date", value: "date" },
    { label: "Total Due", value: "amount" },
    { label: "0 - 30", value: "total1" },
    { label: "31 - 60", value: "total2" },
    { label: "61 - 90", value: "total3" },
    { label: "90+", value: "total4" }
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value);
  };

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    setTotalAssetsAmount(TotalCurrentAssestsAmount + TotalLongTermAssetsAmount)
  }, [TotalCurrentAssestsAmount, TotalLongTermAssetsAmount])

  useEffect(() => {
    setTotalLiabilityAmount(TotalCurrentLiabilities + TotalLongTermLiabilities)
  }, [TotalCurrentLiabilities, TotalLongTermLiabilities])

  useEffect(() => {
    setTotalLiabilitiesAndOwnersQuity(TotalOwnersEquity + TotalLiabilityAmount)
  }, [TotalOwnersEquity, TotalLiabilityAmount])

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [DebtorsAgeingDetails.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCREDITORAGEING');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isBalanceSheetConfigurationEnabled = permissions.find(p => p.permissionCode == 'ENABLECREDITORAGEINGCONFIGURATION');


    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isBalanceSheetConfigurationEnabled: isBalanceSheetConfigurationEnabled !== undefined,
    });

    setDebtorsAgeingDetails({
      ...DebtorsAgeingDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(DebtorsAgeingDetails.groupID);
    setFactories(factory);
  }

  async function GetCreditorsAgeingDetails() {

    if (DebtorsAgeingDetails.groupID === "0" || DebtorsAgeingDetails.factoryID === "0") {
      return;
    }

    const balanceSheetCongiDetails = await GetCreditorsAgeingSetupConfigurationDetails();

    var ledgerAccount = "";
    balanceSheetCongiDetails.data.ledgerAccountList.forEach(x => {
      ledgerAccount = ledgerAccount + x.ledgerAccountID + ","
    });
    let model = {
      groupID: parseInt(DebtorsAgeingDetails.groupID),
      factoryID: parseInt(DebtorsAgeingDetails.factoryID),
      selectedDate: selectedDate.toISOString().split('T')[0],
      ledgerAccountList: ledgerAccount
    };
    const result = await services.GetCreditorsAgeingDetails(model);

    var returnDataArray = [];

    result.forEach(x => {
      var detailModel = {
        ledgerAccountName: x.ledgerAccountName,
        date: '',
        coloumCount: '',
        amount: null,
      };
      returnDataArray.push(detailModel);
      let alltotal = 0;
      let total1 = 0;
      let total2 = 0;
      let total3 = 0;
      let total4 = 0;
      x.complexObj.forEach(y => {
        if (y.credit > 0) {
          var detailModel = {
            ledgerAccountName: '',
            date: y.date.split('T')[0],
            coloumCount: y.coloumCount,
            amount: y.credit,
            referenceNumber: y.referenceNumber,
            total1: y.coloumCount == 1 ? y.credit : null,
            total2: y.coloumCount == 2 ? y.credit : null,
            total3: y.coloumCount == 3 ? y.credit : null,
            total4: y.coloumCount == 4 ? y.credit : null
          };
          alltotal = alltotal + y.credit;
          if (y.coloumCount == 1) {
            total1 = total1 + y.credit;
          }
          else if (y.coloumCount == 2) {
            total2 = total2 + y.credit;
          }
          else if (y.coloumCount == 3) {
            total3 = total3 + y.credit;
          }
          else if (y.coloumCount == 4) {
            total4 = total4 + y.credit;
          }
          returnDataArray.push(detailModel);
        }
      })
      var detailModel2 = {
        ledgerAccountName: '',
        date: "Total",
        coloumCount: '',
        amount: alltotal,
        total1: total1,
        total2: total2,
        total3: total3,
        total4: total4
      };
      returnDataArray.push(detailModel2);
    });

    setReportData(returnDataArray)
  }

  async function GetCreditorsAgeingSetupConfigurationDetails() {
    const result = await services.GetCreditorsAgeingSectionSetupConfigurationDetails(parseInt(DebtorsAgeingDetails.groupID.toString()), parseInt(DebtorsAgeingDetails.factoryID.toString()));
    return result;
  }

  function NavigateToConfigurationPage() {
    navigate('/app/CreditorAgeing/CreditorAgeingSetupConfiguration/' + btoa(DebtorsAgeingDetails.groupID) + "/" + btoa(DebtorsAgeingDetails.factoryID));
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={11} xs={12}>
          {titleName}
        </Grid>
        {
          DebtorsAgeingDetails.groupID === "0" || DebtorsAgeingDetails.factoryID === "0" ?
            null :
            <>
              {
                permissionList.isBalanceSheetConfigurationEnabled === true ?
                  <Grid item md={1} xs={12}>
                    <Tooltip title="Creditor Ageing Configurations">
                      <IconButton
                        style={{ marginLeft: "3rem" }}
                        onClick={() => NavigateToConfigurationPage()}>
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid> : null
              }
            </>
        }
      </Grid>
    )
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setDebtorsAgeingDetails({
      ...DebtorsAgeingDetails,
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

  async function createFile() {

    var settings = {
      sheetName: 'Creditors Ageing Report',
      fileName: 'Creditors Ageing Report',
      writeOptions: {}
    }
    var copyOfExcelData = _.cloneDeep(reportData);
    copyOfExcelData.forEach(x => {
      x.amount = x.amount == null ? '' : parseFloat(x.amount).toFixed(2);
      x.total1 = x.total1 == null ? '' : parseFloat(x.total1).toFixed(2);
      x.total2 = x.total2 == null ? '' : parseFloat(x.total2).toFixed(2);
      x.total3 = x.total3 == null ? '' : parseFloat(x.total3).toFixed(2);
      x.total4 = x.total4 == null ? '' : parseFloat(x.total4).toFixed(2);
    });

    let dataA = [
      {
        sheet: 'Creditors Ageing Report',
        columns: csvHeaders,
        content: copyOfExcelData
      }
    ]

    xlsx(dataA, settings);
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: DebtorsAgeingDetails.groupID,
              factoryID: DebtorsAgeingDetails.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Estate is required').min("1", 'Estate is required')
              })
            }
            enableReinitialize
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
                          <Grid item md={4} xs={12}>
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
                              value={DebtorsAgeingDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'

                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
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
                              value={DebtorsAgeingDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size='small'

                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="applicableMonth">
                              Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                size='small'
                                //margin="dense"
                                id="date"
                                style={{ height: '100px' }}
                                value={selectedDate}
                                onChange={(e) => {
                                  handleDateChange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>

                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            onClick={() => trackPromise(GetCreditorsAgeingDetails())}
                            size='small'
                          >
                            Search
                          </Button>
                        </Box>
                        {reportData.length > 0 ?
                          <div className={classes.root}>
                            <Paper className={classes.paper}>
                              <TableContainer>
                                <Table stickyHeader aria-label="sticky table">
                                  <TableHead>
                                    <TableRow>
                                      <StyledTableCell>Ledger Account</StyledTableCell>
                                      <StyledTableCell align="right">Voucher Number</StyledTableCell>
                                      <StyledTableCell align="right">Date</StyledTableCell>
                                      <StyledTableCell align="right">Total Due</StyledTableCell>
                                      <StyledTableCell align="right">0 - 30</StyledTableCell>
                                      <StyledTableCell align="right">31 - 60</StyledTableCell>
                                      <StyledTableCell align="right">61 - 90</StyledTableCell>
                                      <StyledTableCell align="right">90+</StyledTableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {reportData.map((row) => (
                                      <StyledTableRow key={row.ledgerAccountID}>
                                        <StyledTableCell component="th" scope="row">
                                          {row.ledgerAccountName}
                                        </StyledTableCell>
                                        <StyledTableCell align="right">{row.referenceNumber}</StyledTableCell>
                                        <StyledTableCell align="right">{row.date}</StyledTableCell>
                                        <StyledTableCell align="right">{row.amount == null ? "" : parseFloat(row.amount).toFixed(2)}</StyledTableCell>
                                        <StyledTableCell align="right">{row.total1 == null ? "" : parseFloat(row.total1).toFixed(2)}</StyledTableCell>
                                        <StyledTableCell align="right">{row.total2 == null ? "" : parseFloat(row.total2).toFixed(2)}</StyledTableCell>
                                        <StyledTableCell align="right">{row.total3 == null ? "" : parseFloat(row.total3).toFixed(2)}</StyledTableCell>
                                        <StyledTableCell align="right">{row.total4 == null ? "" : parseFloat(row.total4).toFixed(2)}</StyledTableCell>
                                      </StyledTableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                              <TablePagination
                                component="div"
                                count={reportData.length}
                                onChangePage={handleChangePage}
                                onChangeRowsPerPage={handleChangeRowsPerPage}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                rowsPerPageOptions={[10, 25, 100]}
                              />
                            </Paper>
                          </div> : null}
                        {reportData.length > 0 ?
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorRecord}
                              onClick={createFile}
                              size='small'
                            >
                              EXCEL
                            </Button>
                            <ReactToPrint
                              documentTitle={"Creditors Ageing Report"}
                              trigger={() => <Button
                                color="primary"
                                id="btnRecord"
                                type="button"
                                variant="contained"
                                style={{ marginRight: '1rem' }}
                                className={classes.colorCancel}
                                size='small'
                              >
                                PDF
                              </Button>}
                              content={() => componentRef.current}
                            />
                            <div hidden={true}>
                              <CreatePDF ref={componentRef} reportData={reportData}
                              />
                            </div>
                          </Box> : null}
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
}

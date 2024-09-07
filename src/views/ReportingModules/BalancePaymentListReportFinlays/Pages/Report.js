import React, { useState, useEffect, Fragment, useRef } from 'react';
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
  MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import MaterialTable from 'material-table';
import {
  DatePicker,
  MuiPickersUtilsProvider
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import { useAlert } from 'react-alert';

const useStyles = makeStyles(theme => ({
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
  }
}));

const screenCode = 'BALANCEPAYMENTLISTREPORTFINLAYS';

export default function BalancePaymentListReportFinlays(props) {
  const title = 'Balance Payment List Report'
  const classes = useStyles();
  const [balancePaymentListDetail, setBalancePaymentListDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    year: new Date().getUTCFullYear().toString(),
    month: (new Date().getUTCMonth()).toString().padStart(2, '0'),
  });
  const [FactoryList, setFactoryList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [routes, setRoutes] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [balancePaymentListData, setBalancePaymentListData] = useState([]);//
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const today = new Date();
  const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  const navigate = useNavigate();

  const [selectedSearchValues, setSelectedSearchValues] = useState({
    factoryName: '0',
    groupName: '0',
    routeName: '0',
    year: '',
    monthName: ''
  });
  const componentRef = useRef();
  const totalAmount = 100;
  const alert = useAlert();
  const [alertCount, setAlertCount] = useState({
    count: 0
  });

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
    setAlertCount({
      count: 1
    });
  }, []);

  useEffect(() => {
    getFactoriesForDropdown();
    setAlertCount({
      count: alertCount.count + 1
    });
  }, [balancePaymentListDetail.groupID]);

  useEffect(() => {
    trackPromise(getRoutesByFactoryID());
  }, [balancePaymentListDetail.factoryID]);

  useEffect(() => {
    if (balancePaymentListDetail.groupID != 0 && balancePaymentListDetail.factoryID != 0) {
      getGroupAndFactoryDetailsForReport();
    }
  }, [balancePaymentListDetail.groupID, balancePaymentListDetail.factoryID]);

  useEffect(() => {
    clearData();
  }, [
    balancePaymentListDetail.groupID,
    balancePaymentListDetail.factoryID,
    balancePaymentListDetail.routeID,
    balancePaymentListDetail.month,
    balancePaymentListDetail.year
  ]);

  function clearData() {
    setBalancePaymentListData([]);
  }

  useEffect(() => {
    const currentDate = new Date();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
    setSelectedDate(previousMonth);
  }, []);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWBALANCEPAYMENTLISTREPORTFINLAYS'
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

    setBalancePaymentListDetail({
      ...balancePaymentListDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setBalancePaymentListDetail({
      ...balancePaymentListDetail,
      [e.target.name]: value
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(
      balancePaymentListDetail.groupID
    );
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(
      balancePaymentListDetail.factoryID
    );
    setRoutes(routeList);
  }

  async function BalancePaymentListReportDetails() {
    let requestModel = {
      groupID: parseInt(balancePaymentListDetail.groupID.toString()),
      factoryID: parseInt(balancePaymentListDetail.factoryID.toString()),
      routeID: parseInt(balancePaymentListDetail.routeID.toString()),
      year: balancePaymentListDetail.year.toString(),
      month: balancePaymentListDetail.month.toString()
    }

    getSelectedDropdownValuesForReport(requestModel);
    const balancePaymentListData = await services.GetAllBalancePaymentList(requestModel);
    if (balancePaymentListData.statusCode == "Success" && balancePaymentListData.data != null) {
      if (balancePaymentListData.data.length == 0) {
        alert.error("No records to display");
        return;
      }
      else {
        var leafSet = balancePaymentListData.data.filter(x => x.leafDetails.length !== 0)
        var xxxx = balancePaymentListData.data.filter(x => x.deductionDetails.length !== 0)
        leafSet.forEach(item => {
          const totalPerDayAmount = item.leafDetails.reduce((acc, leaf) => acc + leaf.perDayAmount, 0);
          const totalAdvance = item.advanceDetails.length === 0 ? 0 : item.advanceDetails.reduce((acc, leaf) => acc + leaf.perDayAmount, 0);
          const totalLoan = item.loanDetails.length === 0 ? 0 : item.loanDetails.reduce((acc, leaf) => acc + leaf.installmentAmount, 0);
          const totalAddition = item.deductionDetails
            .filter(leaf => leaf.transactionTypeCode === 'AD')
            .reduce((acc, leaf) => acc + leaf.customerTransactionAmount, 0);
          const totalDeduction = item.deductionDetails
            .filter(leaf => leaf.transactionTypeCode === 'DE')
            .reduce((acc, leaf) => acc + leaf.customerTransactionAmount, 0);
          const totalFactoryItem = item.deductionDetails
            .filter(leaf => leaf.transactionTypeCode === 'FCT')
            .reduce((acc, leaf) => acc + leaf.customerTransactionAmount, 0);
          const totalStamp = item.deductionDetails
            .filter(leaf => leaf.transactionTypeCode === 'STP')
            .reduce((acc, leaf) => acc + leaf.customerTransactionAmount, 0);
          const totalBalancePaymentDeducduction = item.deductionDetails
            .filter(leaf => leaf.transactionTypeCode === 'BPD')
            .reduce((acc, leaf) => acc + leaf.customerTransactionAmount, 0);
          const totalBalancePaymentForward = item.deductionDetails
            .filter(leaf => leaf.transactionTypeCode === 'BPF')
            .reduce((acc, leaf) => acc + leaf.customerTransactionAmount, 0);
          const totalBalanceCarryForward = item.deductionDetails
            .filter(leaf => leaf.transactionTypeCode === 'CF')
            .reduce((acc, leaf) => acc + leaf.customerTransactionAmount, 0);
          const totalSaving = item.deductionDetails
            .filter(leaf => leaf.transactionTypeCode === 'SV')
            .reduce((acc, leaf) => acc + leaf.customerTransactionAmount, 0);
          item.totalPerDayAmount = totalPerDayAmount;
          item.totalAdvanceAmount = totalAdvance;
          item.totalLoanAmount = totalLoan;
          item.totalAddition = totalAddition;
          item.totalDeduction = totalDeduction;
          item.totalFactoryItem = totalFactoryItem;
          item.totalStamp = totalStamp;
          item.totalBalancePaymentDeducduction = totalBalancePaymentDeducduction;
          item.totalBalancePaymentForward = totalBalancePaymentForward;
          item.totalBalanceCarryForward = totalBalanceCarryForward;
          item.totalSaving = totalSaving;
        });

        setBalancePaymentListData(leafSet)
      }

    }
    else {
      alert.error("No records to display");
    }
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

  function handleDateChange(date) {
    let monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    var month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    var year = date.getUTCFullYear();
    let monthName = monthNames[month - 1];

    setSelectedSearchValues({
      ...selectedSearchValues,
      monthName: monthName
    });
    setBalancePaymentListDetail({
      ...balancePaymentListDetail,
      month: month.toString(),
      year: year.toString()
    });

    setSelectedDate(date);
  }

  async function getGroupAndFactoryDetailsForReport() {
    const response = await services.getGroupAndFactoryDetailsForReport(balancePaymentListDetail.groupID, balancePaymentListDetail.factoryID);
    setSelectedSearchValues(response.data[0])
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      month: searchForm.month,
      year: searchForm.year
    });
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

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: balancePaymentListDetail.groupID,
              factoryID: balancePaymentListDetail.factoryID,
              routeID: balancePaymentListDetail.routeID,
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group required')
                .min('1', 'Group required'),
              factoryID: Yup.number()
                .required('Factory required')
                .min('1', 'Factory required')
            })}
            onSubmit={() => trackPromise(BalancePaymentListReportDetails())}
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
                          <Grid item md={3} xs={8}>
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
                              value={balancePaymentListDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size="small"
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.factoryID && errors.factoryID
                              )}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={balancePaymentListDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size="small"
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="routeID">
                              Route
                            </InputLabel>
                            <TextField
                              select
                              fullWidth
                              name="routeID"
                              onChange={e => handleChange(e)}
                              value={balancePaymentListDetail.routeID}
                              variant="outlined"
                              id="routeID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routes)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="inline"
                                openTo="month"
                                views={["year", "month"]}
                                label="Month *"
                                helperText="Select applicable month"
                                value={selectedDate}
                                maxDate={lastDayOfPreviousMonth}
                                disableFuture={true}
                                onChange={date => handleDateChange(date)}
                                size="small"
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {balancePaymentListData.length > 0 ? (
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Supplier Code', field: 'registrationNumber' },
                              { title: 'Supplier Name', field: 'firstName' }
                            ]}
                            data={balancePaymentListData}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: 'left', height: '1%' },
                              cellStyle: { textAlign: 'left' },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 10
                            }}
                            actions={[]}
                          />
                        ) : null}
                      </Box>
                      {balancePaymentListData.length > 0 ? (
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <ReactToPrint
                            documentTitle={'Balance Payement Invoice'}
                            trigger={() => (
                              <Button
                                color="primary"
                                id="btnRecord"
                                type="submit"
                                variant="contained"
                                className={classes.colorCancel}
                                size="small"
                              >
                                PDF
                              </Button>
                            )}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF
                              ref={componentRef}
                              searchData={selectedSearchValues}
                              searchDate={balancePaymentListDetail}
                              supplierData={balancePaymentListData}
                              total={totalAmount}
                            />
                          </div>
                        </Box>
                      ) : null}
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

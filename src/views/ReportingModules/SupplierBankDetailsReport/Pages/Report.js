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
import { useAlert } from 'react-alert';
import moment from 'moment';
import * as XLSX from 'xlsx';


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

const screenCode = 'SUPPLIERBANKDETAILSREPORT';

export default function SupplierBankDetailsReport(props) {
  const [title, setTitle] = useState('Supplier Bank Details Report');
  const classes = useStyles();
  const [balancePaymentListDetail, setBalancePaymentListDetail] = useState({
    groupID: 0,
    factoryID: 0,
    year: new Date().getUTCFullYear().toString(),
    month: (new Date().getUTCMonth()).toString().padStart(2, '0'),
  });
  const [FactoryList, setFactoryList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [routes, setRoutes] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [balancePaymentListData, setBalancePaymentListData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const navigate = useNavigate();
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    factoryName: '0',
    groupName: '0',
    year: '',
    monthName: ''
  });
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
    clearData();
  }, [
    balancePaymentListDetail.groupID,
    balancePaymentListDetail.factoryID,
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
      p => p.permissionCode == 'VIEWSUPPLIERBANKDETAILSREPORT'
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
      setBalancePaymentListData(balancePaymentListData.data)
    }
    else {
      alert.error("No records to display");
    }
  }

  async function createDataForExcel(array) {
    var res = [];

    if (array != null) {
      array.forEach(x => {
        var monthNumber = moment().month(balancePaymentListDetail.month).format("M");
        var monthAbbreviation = moment(monthNumber - 1, 'M').format("MMM").toUpperCase();
        var datePart = monthAbbreviation + balancePaymentListDetail.year.toString().substring(2, 4);
        var formattedBranchCode = x.branchCode.toString().padStart(3, '0');
        var row = [
          x.bankCode,
          formattedBranchCode,
          '000',
          x.accountNumber,
          x.accountHolderName,
          '23',
          '0',
          x.amount.toFixed(2) * 100,
          x.parti,
          'GLBALPMT' + datePart,
          moment(selectedDate).format("YYMMDD"),
          '000000',
          '',
          '',
          '',
          x.registrationNumber
        ];

        res.push(row);
      });
    }

    return res;
  }


  async function createFile() {
    var file = await createDataForExcel(balancePaymentListData);

    const ws = XLSX.utils.aoa_to_sheet(file);

    const columnWidths = [
      { wpx: 28.22 }, //4CH
      { wpx: 22.24 }, //3CH
      { wpx: 22.24 }, //3CH
      { wpx: 76.24 }, //12CH
      { wpx: 124.24 }, //20CH
      { wpx: 16.24 }, //2CH
      { wpx: 10.16 }, //1CH
      { wpx: 76.24 }, //12CH
      { wpx: 94.24 }, //15CH
      { wpx: 94.24 }, //15CH
      { wpx: 40.24 }, //6CH
      { wpx: 40.24 }, //6CH
      { wpx: 178.24 }, //29Ch
    ];

    ws['!cols'] = columnWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Supplier');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const fileName = "Supplier Bank Details Report-" + balancePaymentListDetail.month.toString() + "-" + balancePaymentListDetail.year.toString() + ".xlsx";
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: FactoryList[searchForm.factoryID],
      groupName: GroupList[searchForm.groupID],
      routeName: routes[searchForm.routeID],
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
              factoryID: balancePaymentListDetail.factoryID
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
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
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
                        <Grid item md={4} xs={12}>
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
                        <Grid item md={4} xs={12}>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DatePicker
                              autoOk
                              variant="inline"
                              openTo="month"
                              views={["year", "month"]}
                              label="Month *"
                              helperText="Select applicable month"
                              value={selectedDate}
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
                    <PerfectScrollbar>
                      <Box minWidth={1050}>
                        {balancePaymentListData.length > 0 ? (
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Registration Number', field: 'registrationNumber' },
                              { title: 'Acc Holder Name', field: 'accountHolderName' },
                              {
                                title: 'Account Number',
                                field: 'accountNumber'
                              },
                              {
                                title: 'Amount', field: 'amount',
                                render: rowData => rowData.amount.toFixed(2)
                              }
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
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={createFile}
                            size="small"
                          >
                            EXCEL
                          </Button>
                          <div>&nbsp;</div>
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

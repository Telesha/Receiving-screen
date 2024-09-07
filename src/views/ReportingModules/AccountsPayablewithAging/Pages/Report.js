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
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';

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

const screenCode = 'ACCOUNTPAYABLEWITHAGING';
export default function AccountsPayablewithAging(props) {
  const today = new Date();
  const previousMonth = new Date();
  previousMonth.setMonth(today.getMonth() - 1);
  const [title, setTitle] = useState('Accounts Payable With Aging Report');
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState(previousMonth);
  const [accountsPayablDetail, setaccountsPayablDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    startDate: '',
    endDate: ''
  });
  const [FactoryList, setFactoryList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const navigate = useNavigate();

  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    factoryName: '0',
    groupName: '0',
    startDate: '',
    endDate: ''
  });

  const componentRef = useRef();
  const [totalAmount, setTotalAmount] = useState([]);
  const [alertCount, setAlertCount] = useState({
    count: 0
  });
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
    setAlertCount({
      count: 1
    });
  }, []);

  useEffect(() => {
    if (accountsPayablDetail.groupID != 0) {
      getFactoriesForDropdown();
      setAlertCount({
        count: alertCount.count + 1
      });
    }
  }, [accountsPayablDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWACCOUNTPAYABLEWITHAGING'
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

    setaccountsPayablDetail({
      ...accountsPayablDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setaccountsPayablDetail({
      ...accountsPayablDetail,
      [e.target.name]: value
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(
      accountsPayablDetail.groupID
    );
    setFactoryList(factories);
  }

  async function GetDetails() {
    let total = {
      totalinvoiceAmount: 0,
      totalpaymentsMade: 0,
      totalamount: 0,
    }
    let model = {
      groupID: parseInt(accountsPayablDetail.groupID),
      factoryID: parseInt(accountsPayablDetail.factoryID),
      startDate: (moment(accountsPayablDetail.startDate).format()).toString().split('T')[0],
      endDate: (moment(accountsPayablDetail.endDate).format()).toString().split('T')[0]
    };
    getSelectedDropdownValuesForReport(model);

    const AccountsPayableData = await services.GetAccountsPayablewithAgingDetails(model);
    setReportData(AccountsPayableData);
    AccountsPayableData.forEach(x => {
      total.totalinvoiceAmount = total.totalinvoiceAmount + parseFloat(x.invoiceAmount);
      total.totalpaymentsMade = total.totalpaymentsMade + parseFloat(x.paymentsMade);
      total.totalamount = total.totalamount + parseFloat(x.amount);
    });
    setTotalAmount(total);
    createDataForExcel(AccountsPayableData);
  }

  async function createDataForExcel(array) {
    var res = [];

    var totals = {
      'INVOICE DATE': 'Total',
      'INVOICE AMOUNT': 0,
      'PAYMENTS MADE': 0,
      'AMOUNT': 0,
  };

    if (array != null) {
      array.map(x => {
        var vr = {
          'INVOICE DATE': x.invoiceDate,
          'INVOICE': x.invoice,
          'SUPPLIER NAME': x.supplierName,
          'INVOICE AMOUNT': x.invoiceAmount.toFixed(2),
          'PAYMENTS MADE': x.paymentsMade.toFixed(2),
          'AMOUNT': x.amount.toFixed(2),
          'DUE DATE': x.dueDate,
          'DAYS ABOVE DUE DATE': x.daysAboveDueDate,
          'REMARKS': x.remarks,
        };
        res.push(vr);
      });

      res.push({});
      var vr1 = {
        'INVOICE DATE': 'Total',
        'INVOICE AMOUNT': parseFloat((totalAmount.totalinvoiceAmount)).toFixed(2),
        'PAYMENTS MADE': parseFloat((totalAmount.totalpaymentsMade)).toFixed(2),
        'AMOUNT': parseFloat((totalAmount.totalamount)).toFixed(2),
      };
      res.push(vr1);
      res.push({}, {});
      var vr = {
        'INVOICE DATE': "Group: " + selectedSearchValues.groupName,
        'INVOICE': "Estate: " + selectedSearchValues.factoryName,
        'SUPPLIER NAME': "Start Date: " + moment(selectedSearchValues.startDate).format('MM/DD/YYYY'),
        'INVOICE AMOUNT': "End Date: " + moment(selectedSearchValues.endDate).format('MM/DD/YYYY')
      }
      res.push(vr);
    }

    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(reportData);
    var settings = {
      sheetName: 'Accounts Payable With Aging Report',
      fileName:
        'Accounts Payable With Aging Report ' +
        selectedSearchValues.factoryName +
        ' - ' +
        selectedSearchValues.groupName +
        ' Accounts Payable With Aging Report ' +
        selectedSearchValues.startDate +
        ' - ' +
        selectedSearchValues.endDate,
      writeOptions: {}
    };

    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'Accounts Payable Report',
        columns: tempcsvHeaders,
        content: file
      }
    ];

    xlsx(dataA, settings);
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

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: FactoryList[searchForm.factoryID],
      groupName: GroupList[searchForm.groupID],
      startDate: searchForm.startDate,
      endDate: searchForm.endDate
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
              groupID: accountsPayablDetail.groupID,
              factoryID: accountsPayablDetail.factoryID
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
                          <Grid item md={4} xs={8}>
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
                              value={accountsPayablDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size="small"
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
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
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={accountsPayablDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size="small"
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="startDate">
                              From Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(
                                touched.startDate && errors.startDate
                              )}
                              fullWidth
                              helperText={touched.startDate && errors.startDate}
                              name="startDate"
                              type="date"
                              onBlur={handleBlur}
                              size = 'small'
                              onChange={e => handleChange(e)}
                              value={accountsPayablDetail.startDate}
                              variant="outlined"
                              id="startDate"
                            ></TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="endDate">
                              To Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.endDate && errors.endDate)}
                              fullWidth
                              helperText={touched.endDate && errors.endDate}
                              name="endDate"
                              type="date"
                              onBlur={handleBlur}
                              size = 'small'
                              onChange={e => handleChange(e)}
                              value={accountsPayablDetail.endDate}
                              variant="outlined"
                              id="endDate"
                            ></TextField>
                          </Grid>
                        </Grid>
                        <Grid container justify="flex-end">
                          <Box pt={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type='submit'
                              onClick={() => trackPromise(GetDetails())}
                            >
                              Search
                            </Button>
                          </Box>
                        </Grid>
                      </CardContent>
                      {reportData.length > 0 ? (
                        <Box minWidth={1050}>
                          <TableContainer style={{ marginLeft: '5px' }}>
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>INVOICE DATE</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>INVOICE </TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>SUPPLIER NAME </TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>INVOICE AMOUNT</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>PAYMENTS MADE</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>AMOUNT</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>DUE DATE</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>DAYS ABOVE DUE DATE</TableCell>
                                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid black" }}>REMARKS</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {reportData.map((data, index) => (
                                  <TableRow key={index}>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {moment(data.invoiceDate).format('MM/DD/YYYY')}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {data.invoice}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {data.supplierName}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.invoiceAmount).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.paymentsMade).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {(data.amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {moment(data.dueDate).format('MM/DD/YYYY')}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {data.daysAboveDueDate}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                      {data.remarks == null ? '-' : data.remarks}
                                    </TableCell>
                                  </TableRow>

                                ))}
                              </TableBody>
                              <TableRow>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                <b>Total</b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                </TableCell>
                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}>
                                </TableCell>
                                <TableCell align={'center'} style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalinvoiceAmount)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalpaymentsMade)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                  <b>{(parseFloat(totalAmount.totalamount)).toFixed(2)} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", border: "1px solid black" }}>
                                </TableCell>
                              </TableRow>
                            </Table>
                          </TableContainer>
                        </Box>
                      ) : null};
                      {reportData.length > 0 ? (
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

                          <ReactToPrint
                            documentTitle={'Cash Customer Details Report'}
                            trigger={() => (
                              <Button
                                color="primary"
                                id="btnRecord"
                                type="submit"
                                variant="contained"
                                style={{ marginRight: '1rem' }}
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
                              searchDate={accountsPayablDetail}
                              reportData={reportData}
                              total={totalAmount}
                            />
                          </div>
                        </Box>
                      ) : null};
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

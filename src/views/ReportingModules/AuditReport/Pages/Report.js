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
  MenuItem,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  TablePagination
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from 'react-alert';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import moment from 'moment';
import _ from 'lodash';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import CountUp from 'react-countup';
import CurrencyCommaSeperation from 'src/views/Common/CurrencyCommaSeperation';

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

const screenCode = 'AUDITREPORT';

export default function AuditReport(props) {
  const [title, setTitle] = useState('Audit Report');
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [auditReportDetail, setAuditReportDetail] = useState({
    groupID: 0,
    factoryID: 0,
    accountTypeID: 0,
    parentHeaderID: 0,
    childHeaderID: 0
  });
  const [auditReportData, setAuditReportData] = useState([]);
  const [individualTotalAmount, setIndividualTotalAmount] = useState({
    individualDebitTotal: 0,
    individualCreditTotal: 0
  });

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const componentRef = useRef();
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupID: 0,
    factoryID: 0,
    accountTypeID: 0,
    parentHeaderID: 0,
    childHeaderID: 0,
    startDate: '',
    endDate: ''
  });
  const [accountTypeNames, setAccountTypeNames] = useState();
  const [parentHeaderNames, setParentHeaderNames] = useState();
  const [childHeaderNames, setChildHeaderNames] = useState();

  const [page, setPage] = useState(0);
  const [groupedData, setGroupedData] = useState([]);
  const [limit, setLimit] = useState(25);
  const handleLimitChange = event => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const [startDateRange, setStartDateRange] = useState(new Date());
  const [endDateRange, setEndDateRange] = useState(new Date());
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  useEffect(() => {
    getGroupsForDropdown();
    getPermission();
  }, []);

  useEffect(() => {
    getfactoriesForDropDown();
  }, [auditReportDetail.groupID]);

  useEffect(() => {
    getAccountTypeNamesForDropdown();
  }, [auditReportDetail.factoryID]);

  useEffect(() => {
    getParentHeadersByAccountTypeID(auditReportDetail.accountTypeID);
  }, [auditReportDetail.accountTypeID]);

  useEffect(() => {
    getChildHeadersByParentTypeID(auditReportDetail.parentHeaderID);
  }, [auditReportDetail.parentHeaderID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWAUDITREPORT'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode === 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode === 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setAuditReportDetail({
      ...auditReportDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroupList(groups);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(
      auditReportDetail.groupID
    );
    setFactoryList(factory);
  }

  async function getAccountTypeNamesForDropdown() {
    const accounts = await services.getAccountTypeNamesForDropdown(
      auditReportDetail.groupID,
      auditReportDetail.factoryID
    );
    setAccountTypeNames(accounts);
  }

  async function getParentHeadersByAccountTypeID(id) {
    const parent = await services.getParentHeadersByAccountTypeID(id);
    setParentHeaderNames(parent);
  }

  async function getChildHeadersByParentTypeID(id) {
    const parent = await services.getChildHeadersByParentTypeID(id);
    setChildHeaderNames(parent);
  }

  async function GetCropDetails() {
    let model = {
      groupID: parseInt(auditReportDetail.groupID),
      factoryID: parseInt(auditReportDetail.factoryID),
      accountTypeID: parseInt(auditReportDetail.accountTypeID),
      parentHeaderID: parseInt(auditReportDetail.parentHeaderID),
      childHeaderID: parseInt(auditReportDetail.childHeaderID),
      startDate: moment(startDateRange.toString())
        .format()
        .split('T')[0],
      endDate: moment(endDateRange.toString())
        .format()
        .split('T')[0]
    };

    const auditReportData = await services.GetAuditReport(model);
    getSelectedDropdownValuesForReport(model);

    setGroupedData(auditReportData.data);

    if (
      auditReportData.statusCode == 'Success' &&
      auditReportData.data != null
    ) {
      setAuditReportData(auditReportData.data);
      const auditData = auditReportData.data;

      auditData.forEach(x => {
        const dList = x.auditReportList;
        let individualDebitTotal = 0;
        let individualCreditTotal = 0;

        let openingBalanceCredit = 0;
        let openingBalanceDebit = 0;

        if (x.totalCredit > x.totalDebit) {

          x.totalDebit = x.totalCredit - x.totalDebit;
          openingBalanceCredit = x.totalDebit;
        } else {
          x.totalDebit = x.totalDebit - x.totalCredit;

          openingBalanceDebit = x.totalDebit;
        }

        dList.forEach(y => {
          individualCreditTotal = y.credit + individualCreditTotal;
          individualDebitTotal = y.debit + individualDebitTotal;
        });
        dList.debit = individualDebitTotal;
        dList.credit = individualCreditTotal;

        let totForClosingBalanceFromTransactionsDebit = 0;
        let totForClosingBalanceFromTransactionsCredit = 0;

        if (individualDebitTotal > individualCreditTotal) {
          totForClosingBalanceFromTransactionsDebit =
            individualDebitTotal - individualCreditTotal;
        } else {
          totForClosingBalanceFromTransactionsCredit =
            individualCreditTotal - individualDebitTotal;
        }

        const totForOpeningBalance = 0;

        if (
          openingBalanceCredit > openingBalanceDebit &&
          totForClosingBalanceFromTransactionsCredit >
          totForClosingBalanceFromTransactionsDebit
        ) {
          x.totalCredit =
            totForClosingBalanceFromTransactionsCredit + openingBalanceCredit;
        } else if (
          openingBalanceCredit < openingBalanceDebit &&
          totForClosingBalanceFromTransactionsCredit <
          totForClosingBalanceFromTransactionsDebit
        ) {
          x.totalCredit =
            totForClosingBalanceFromTransactionsDebit + openingBalanceDebit;
        } else if (
          openingBalanceCredit > openingBalanceDebit &&
          totForClosingBalanceFromTransactionsCredit <
          totForClosingBalanceFromTransactionsDebit
        ) {
          if (
            openingBalanceCredit > totForClosingBalanceFromTransactionsDebit
          ) {
            x.totalCredit =
              openingBalanceCredit - totForClosingBalanceFromTransactionsDebit;
          } else {
            x.totalCredit =
              totForClosingBalanceFromTransactionsDebit - openingBalanceCredit;
          }
        } else if (
          openingBalanceCredit < openingBalanceDebit &&
          totForClosingBalanceFromTransactionsCredit >
          totForClosingBalanceFromTransactionsDebit
        ) {
          if (
            openingBalanceDebit > totForClosingBalanceFromTransactionsCredit
          ) {
            x.totalCredit =
              openingBalanceDebit - totForClosingBalanceFromTransactionsCredit;
          } else {
            x.totalCredit =
              totForClosingBalanceFromTransactionsCredit - openingBalanceDebit;
          }
        }
      });

      if (auditReportData.data.length == 0) {
        alert.error('No Records');
      }
    } else {
      alert.error('Error');
    }
  }

  async function createDataForExcel(array) {
    var res = [];
    var ledgerAccountCode = "";
    if (array != null) {
      array.map(x => {
        x.auditReportList.map(y => {
          if (ledgerAccountCode === x.ledgerAccountCode) {


            var xr = {
              'Account Name': x.ledgerAccountName,
              'Account Code': x.ledgerAccountCode,
              'Opening Balance': x.totalDebit,
              'Voucher': y.voucherCodeRefNumber,
              'Date': y.date.split('T')[0],
              'Description': y.description,
              'Cheque Number': y.chequeNumber,
              'Debit Amount': y.debit,
              'Credit Amount': y.credit,
              Debit: CurrencyCommaSeperation(y.debit),
              Credit: CurrencyCommaSeperation(y.credit),
            };
          }
          else {
            var xr = {
              'Account Name': "",
              'Account Code': "",
              'Opening Balance': "",
              'Voucher': "",
              'Date': "",
              'Description': "",
              'Cheque Number': "",
              'Debit Amount': "",
              'Credit Amount': "",
              Credit: CurrencyCommaSeperation(individualTotalAmount.individualCreditTotal),
              Debit: CurrencyCommaSeperation(individualTotalAmount.individualDebitTotal),
            };
          }
          ledgerAccountCode = x.ledgerAccountCode;

          res.push(xr);
        })

      });
    }

    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(auditReportData);
    var settings = {
      sheetName: 'Audit Report',
      fileName:
        'Audit Report - ' +
        selectedSearchValues.accountTypeID +
        ' ' +
        selectedSearchValues.parentHeaderID +
        ' ' +
        selectedSearchValues.startDate +
        ' - ' +
        selectedSearchValues.endDate
    };

    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'AuditReport',
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
  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setAuditReportDetail({
      ...auditReportDetail,
      [e.target.name]: value
    });
    setAuditReportData([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(searchForm.startDate.toString())
      .format()
      .split('T')[0];
    var endDate = moment(searchForm.endDate.toString())
      .format()
      .split('T')[0];
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: FactoryList[searchForm.factoryID],
      groupName: GroupList[searchForm.groupID],
      accountType: accountTypeNames[searchForm.accountTypeID],
      startDate: [startDate],
      endDate: [endDate]
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
              groupID: auditReportDetail.groupID,
              factoryID: auditReportDetail.factoryID,
              accountTypeID: auditReportDetail.accountTypeID,
              parentHeaderID: auditReportDetail.parentHeaderID,
              childHeaderID: auditReportDetail.childHeaderID
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Estate is required')
                .min('1', 'Estate is required')
            })}
            onSubmit={() => trackPromise(GetCropDetails())}
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
                              size='small'
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={auditReportDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
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
                              value={auditReportDetail.factoryID}
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
                                  setStartDateRange(e)
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
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="accountTypeID">
                              Account Type Name
                            </InputLabel>

                            <TextField
                              select
                              error={Boolean(
                                touched.accountTypeID && errors.accountTypeID
                              )}
                              helperText={
                                touched.accountTypeID && errors.accountTypeID
                              }
                              onBlur={handleBlur}
                              name="accountTypeID"
                              size='small'
                              onChange={e => handleChange(e)}
                              value={auditReportDetail.accountTypeID}
                              variant="outlined"
                              id="accountTypeID"
                              fullWidth
                            >
                              <MenuItem value="0">
                                --Select Account Type Name--
                              </MenuItem>
                              {generateDropDownMenu(accountTypeNames)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="parentHeaderID">
                              Parent Header
                            </InputLabel>

                            <TextField
                              select
                              error={Boolean(
                                touched.parentHeaderID && errors.parentHeaderID
                              )}
                              helperText={
                                touched.parentHeaderID && errors.parentHeaderID
                              }
                              onBlur={handleBlur}
                              name="parentHeaderID"
                              size='small'
                              onChange={e => handleChange(e)}
                              value={auditReportDetail.parentHeaderID}
                              variant="outlined"
                              id="parentHeaderID"
                              fullWidth
                            >
                              <MenuItem value="0">
                                --Select Parent Header--
                              </MenuItem>
                              {generateDropDownMenu(parentHeaderNames)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="childHeaderID">
                              Child Header
                            </InputLabel>

                            <TextField
                              select
                              error={Boolean(
                                touched.childHeaderID && errors.childHeaderID
                              )}
                              helperText={
                                touched.childHeaderID && errors.childHeaderID
                              }
                              onBlur={handleBlur}
                              name="childHeaderID"
                              size='small'
                              onChange={e => handleChange(e)}
                              value={auditReportDetail.childHeaderID}
                              variant="outlined"
                              id="childHeaderID"
                              fullWidth
                            >
                              <MenuItem value="0">
                                --Select Child Header--
                              </MenuItem>
                              {generateDropDownMenu(childHeaderNames)}
                            </TextField>
                          </Grid>
                        </Grid>

                        <br></br>
                        <Box display="flex" flexDirection="row-reverse" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      {auditReportData.length > 0 ? (
                        <Card style={{ margin: '10px' }}>
                          <Box>
                            <TableContainer>
                              <Table aria-label="caption table">
                                <TableHead></TableHead>
                                <TableBody>
                                  {auditReportData.map((data, index) => (

                                    <TableContainer key={index}>
                                      <Table aria-label="caption table">
                                        <TableRow
                                          style={{
                                            backgroundColor: '#B0C4DE',
                                            fontWeight: 'bold'
                                          }}
                                        >
                                          <TableCell align={'center'}>
                                            Account Name: {data.ledgerAccountName}
                                          </TableCell>
                                          <TableCell align={'center'}>
                                            Account Code: {data.ledgerAccountCode}
                                          </TableCell>
                                          <TableCell align={'center'}>
                                            Opening Balance: {data.totalDebit}
                                          </TableCell>
                                        </TableRow>
                                      </Table>
                                      <Table>
                                        <TableRow>
                                          <TableCell align={'center'}>Voucher</TableCell>
                                          <TableCell align={'center'}>Date</TableCell>
                                          <TableCell align={'center'}>Description</TableCell>

                                          <TableCell align={'center'}>
                                            Cheque Number
                                          </TableCell>
                                          <TableCell align={'right'}>Debit Amount</TableCell>
                                          <TableCell align={'right'}>
                                            Credit Amount
                                          </TableCell>
                                        </TableRow>
                                        {data.auditReportList.map((data1, index) => (
                                          <TableRow key={index}>
                                            <TableCell

                                              align={'center'}
                                              component="th"
                                              scope="row"
                                              style={{ borderBottom: 'none' }}
                                            >
                                              {data1.voucherCodeRefNumber}
                                            </TableCell>
                                            <TableCell
                                              align={'center'}
                                              component="th"
                                              scope="row"
                                              style={{ borderBottom: 'none' }}
                                            >
                                              {data1.date.split('T')[0]}
                                            </TableCell>
                                            <TableCell
                                              align={'center'}
                                              component="th"
                                              scope="row"
                                              style={{ borderBottom: 'none' }}
                                            >
                                              {data1.description}
                                            </TableCell>
                                            <TableCell
                                              align={'center'}
                                              component="th"
                                              scope="row"
                                              style={{ borderBottom: 'none' }}
                                            >
                                              {data1.chequeNumber}
                                            </TableCell>
                                            <TableCell
                                              align={'right'}
                                              component="th"
                                              scope="row"
                                              style={{ borderBottom: 'none' }}
                                            >
                                              <CountUp
                                                end={data1.debit}
                                                separator=","
                                                decimals={2}
                                                decimal="."
                                                duration={0.1}
                                              />
                                            </TableCell>
                                            <TableCell align={'right'}>
                                              <CountUp
                                                end={data1.credit}
                                                separator=","
                                                decimals={2}
                                                decimal="."
                                                duration={0.1}
                                              />
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                        <TableRow bgcolor="#FFFFE0">
                                          <TableCell align={'center'}>
                                            <b>Total</b>
                                          </TableCell>
                                          <TableCell align={'center'}></TableCell>
                                          <TableCell align={'center'}></TableCell>
                                          <TableCell align={'center'}></TableCell>
                                          <TableCell align={'right'}>
                                            <CountUp
                                              end={Number(
                                                data.auditReportList.debit ==
                                                  undefined
                                                  ? '0'
                                                  : data.auditReportList.debit
                                              )}
                                              separator=","
                                              decimals={2}
                                              decimal="."
                                              duration={0.1}
                                            />
                                          </TableCell>
                                          <TableCell align={'right'}>
                                            <CountUp
                                              end={Number(
                                                data.auditReportList.credit ==
                                                  undefined
                                                  ? '0'
                                                  : data.auditReportList.credit
                                              )}
                                              separator=","
                                              decimals={2}
                                              decimal="."
                                              duration={0.1}
                                            />
                                          </TableCell>
                                          <TableCell align={'left'}></TableCell>
                                        </TableRow>

                                        <TableRow bgcolor="#D3D3D3">
                                          <TableCell align={'center'}>
                                            <b>Closing Balance</b>
                                          </TableCell>
                                          <TableCell align={'center'}></TableCell>
                                          <TableCell align={'center'}></TableCell>
                                          <TableCell align={'center'}></TableCell>
                                          <TableCell align={'right'}>
                                            <CountUp
                                              end={Number(
                                                data.totalCredit ==
                                                  undefined
                                                  ? '0'
                                                  : data.totalCredit
                                              )}
                                              separator=","
                                              decimals={2}
                                              decimal="."
                                              duration={0.1}
                                            />
                                          </TableCell>
                                          <TableCell align={'center'}>

                                          </TableCell>
                                          <TableCell align={'left'}>

                                          </TableCell>
                                        </TableRow>

                                        <br></br>
                                        <br></br>
                                      </Table>
                                    </TableContainer>
                                  ))}
                                </TableBody>
                              </Table>
                              <TablePagination
                                component="div"
                                count={groupedData.length}
                                onChangePage={handlePageChange}
                                onChangeRowsPerPage={handleLimitChange}
                                page={page}
                                rowsPerPage={limit}
                                rowsPerPageOptions={[25, 50, 100, 200]}
                              />
                            </TableContainer>
                          </Box>
                        </Card>) : null}
                      {auditReportData.length > 0 ? (
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
                            documentTitle={'Audit Report'}
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
                              auditReportData={auditReportData}
                              searchData={selectedSearchValues}
                              groupedData={groupedData}
                              individualTotalAmount={individualTotalAmount}
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

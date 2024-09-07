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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import moment from 'moment';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import CountUp from 'react-countup';

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

const screenCode = 'AUDITTRIALREPORT';

export default function AuditTrialReport(props) {
  const [title, setTitle] = useState('Audit Trial Report');
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [voucherCodes, setVoucherCodes] = useState([]);
  const [auditTrialReportDetail, setAuditTrialReportDetail] = useState({
    groupID: 0,
    factoryID: 0,
    voucherCodeID: 0
  });
  const [auditTrialData, setAuditTrialData] = useState([]);

  const [debitCredit, setDebitCredit] = useState({
    val: ''
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
    groupName: '',
    factoryName: '',
    voucherCodeID: '0',
    startDate: '',
    endDate: ''
  });
  const [totalAmount, setTotalAmount] = useState({
    debitTotal: 0,
    creditTotal: 0
  });

  const [startDateRange, setStartDateRange] = useState(new Date());
  const [endDateRange, setEndDateRange] = useState(new Date());

  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(0);
  const handleLimitChange = event => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown());
  }, [auditTrialReportDetail.groupID]);

  useEffect(() => {
    getVoucherCodesForDropdown();
  }, [auditTrialReportDetail.factoryID, auditTrialReportDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWAUDITTRIALREPORT'
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

    setAuditTrialReportDetail({
      ...auditTrialReportDetail,
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
      auditTrialReportDetail.groupID
    );
    setFactoryList(factories);
  }

  async function getVoucherCodesForDropdown() {
    const voucherCodes = await services.getVoucherCodesForDropdown(
      auditTrialReportDetail.groupID,
      auditTrialReportDetail.factoryID
    );
    setVoucherCodes(voucherCodes);
  }

  async function getAuditTrialReportDetails() {
    let debitTotal = 0;
    let creditTotal = 0;

    let model = {
      groupID: parseInt(auditTrialReportDetail.groupID),
      factoryID: parseInt(auditTrialReportDetail.factoryID),
      voucherCodeID: parseInt(auditTrialReportDetail.voucherCodeID),
      startDate: moment(startDateRange.toString())
        .format()
        .split('T')[0],
      endDate: moment(endDateRange.toString())
        .format()
        .split('T')[0]
    };
    const auditTrialReportData = await services.GetAuditTrialReport(model);

    getSelectedDropdownValuesForReport(model);

    if (
      auditTrialReportData.statusCode == 'Success' &&
      auditTrialReportData.data != null
    ) {
      setAuditTrialData(auditTrialReportData.data);

      const aData = auditTrialReportData.data;

      aData.forEach(x => {
        creditTotal = x.credit + creditTotal;
        debitTotal = x.debit + debitTotal;
      });

      setTotalAmount({
        ...totalAmount,
        debitTotal: debitTotal,
        creditTotal: creditTotal
      });

      createDataForExcel(auditTrialReportData.data);
      if (auditTrialReportData.data.length == 0) {
        alert.error('No Records');
      }
    } else {
      alert.error('Error');
    }
  }

  async function createDataForExcel(array) {
    var res = [];

    if (array != null) {
      array.map(x => {
        var vr = {
          'Account Name': x.accountName,
          'Account Code': x.accountCode,
          Debit: x.debit.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'),
          Credit: x.credit.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
        };

        res.push(vr);

      });
      var vr = {
        'Account Name': 'Total',
        'Account Code': '',
        Debit: totalAmount.debitTotal.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'),
        Credit: totalAmount.creditTotal.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
      };

      res.push(vr);
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(auditTrialData);
    var settings = {
      sheetName: 'Audit Trial Report',
      fileName:
        'Audit Trial Report - ' +
        selectedSearchValues.groupName +
        ' - ' +
        selectedSearchValues.factoryName +
        ' - ' +
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
        sheet: 'Audit Trial Report',
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
    setAuditTrialReportDetail({
      ...auditTrialReportDetail,
      [e.target.name]: value
    });
    setAuditTrialData([]);
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value;
    setDebitCredit({
      ...debitCredit,
      val: value
    });
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
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
      voucherCodeID: searchForm.voucherCodeID,
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
              voucherCodeID: auditTrialReportDetail.voucherCodeID,
              groupID: auditTrialReportDetail.groupID,
              factoryID: auditTrialReportDetail.factoryID
            }}
            validationSchema={Yup.object().shape({
              voucherCodeID: Yup.number()
                .required('Voucher Code Required')
                .min('1', 'Voucher Code is Required'),
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Estate is required')
                .min('1', 'Estate is required')
            })}
            onSubmit={() => trackPromise(getAuditTrialReportDetails())}
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
                              value={auditTrialReportDetail.groupID}
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
                              value={auditTrialReportDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="voucherCodeID">
                              Voucher Code *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.voucherCodeID && errors.voucherCodeID
                              )}
                              fullWidth
                              helperText={
                                touched.voucherCodeID && errors.voucherCodeID
                              }
                              name="voucherCodeID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={auditTrialReportDetail.voucherCodeID}
                              variant="outlined"
                              id="voucherCodeID"
                            >
                              <MenuItem value="0">
                                --Select Voucher Code--
                              </MenuItem>
                              {generateDropDownMenu(voucherCodes)}
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
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink>Filtered By</InputLabel>
                            <RadioGroup row
                              aria-labelledby="demo-controlled-radio-buttons-group"
                              name="controlled-radio-buttons-group"
                              onChange={handleChange1}
                            >
                              <FormControlLabel
                                value="1"
                                control={<Radio />}
                                label="Debit"
                              />
                              <FormControlLabel
                                value="0"
                                control={<Radio />}
                                label="Credit"
                              />
                            </RadioGroup>
                          </Grid>
                        </Grid>
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
                      {auditTrialData.length > 0 ? (
                        <PerfectScrollbar>
                          <Box minWidth={1050} style={{ border: '1px solid black' }}>
                            <TableContainer>
                              <Table aria-label="caption table">
                                <TableHead >
                                  <TableRow >
                                    <TableCell align={'center'}>
                                      Account Code
                                    </TableCell>
                                    <TableCell align={'center'}>
                                      Account Name
                                    </TableCell>
                                    {debitCredit.val == 1 ? (
                                      <TableCell align={'right'}>Debit</TableCell>
                                    ) : null}
                                    <>
                                      {debitCredit.val == 0 ? (
                                        <TableCell align={'right'}>
                                          Credit
                                        </TableCell>
                                      ) : null}
                                    </>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {auditTrialData.slice(
                                    page * limit,
                                    page * limit + limit
                                  ).map((data, index) => (
                                    <TableRow key={index}>
                                      <TableCell
                                        align={'center'}
                                        component="th"
                                        scope="row"
                                        style={{ borderBottom: 'none' }}
                                      >
                                        {data.accountCode}
                                      </TableCell>
                                      <TableCell
                                        align={'center'}
                                        component="th"
                                        scope="row"
                                        style={{ borderBottom: 'none' }}
                                      >
                                        {data.accountName}
                                      </TableCell>
                                      {debitCredit.val == 1 ? (
                                        <TableCell
                                          align={'right'}
                                          component="th"
                                          scope="row"
                                          style={{ borderBottom: 'none' }}
                                        >
                                          <CountUp
                                            end={data.debit}
                                            decimals={2}
                                            decimal="."
                                            separator=','
                                            duration={0.1}
                                          />
                                        </TableCell>
                                      ) : null}
                                      <>
                                        {debitCredit.val == 0 ? (
                                          <TableCell
                                            align={'right'}
                                            component="th"
                                            scope="row"
                                            style={{ borderBottom: 'none' }}
                                          >
                                            <CountUp
                                              end={data.credit}
                                              decimals={2}
                                              decimal="."
                                              separator=','
                                              duration={0.1}
                                            />
                                          </TableCell>
                                        ) : null}
                                      </>
                                    </TableRow>
                                  ))}
                                </TableBody>
                                <TableRow style={{ background: '#ADD8E6' }}>
                                  <TableCell
                                    align={'right'}
                                    component="th"
                                    scope="row"
                                    style={{ fontWeight: 'bold' }}
                                  >
                                    Total
                                  </TableCell>
                                  <TableCell
                                    align={'right'}
                                    component="th"
                                    scope="row"
                                    style={{ borderBottom: 'none' }}
                                  ></TableCell>
                                  {debitCredit.val == 1 ? (
                                    <TableCell
                                      align={'right'}
                                      component="th"
                                      scope="row"
                                      style={{ borderBottom: 'none' }}
                                    >
                                      <CountUp style={{ fontWeight: 'bold' }}
                                        end={totalAmount.debitTotal}
                                        decimals={2}
                                        decimal="."
                                        separator=','
                                        duration={0.1}
                                      />
                                    </TableCell>
                                  ) : null}
                                  <>
                                    {debitCredit.val == 0 ? (
                                      <TableCell
                                        align={'right'}
                                        component="th"
                                        scope="row"
                                        style={{ borderBottom: 'none' }}
                                      >
                                        <CountUp style={{ fontWeight: 'bold' }}
                                          end={totalAmount.creditTotal}
                                          decimals={2}
                                          decimal="."
                                          separator=','
                                          duration={0.1}
                                        />
                                      </TableCell>
                                    ) : null}
                                  </>
                                </TableRow>
                              </Table>
                            </TableContainer>
                          </Box>
                          <TablePagination
                            component="div"
                            count={auditTrialData.length}
                            onChangePage={handlePageChange}
                            onChangeRowsPerPage={handleLimitChange}
                            page={page}
                            rowsPerPage={limit}
                            rowsPerPageOptions={[25, 50, 100, 200]}
                          />
                        </PerfectScrollbar>
                      ) : null}
                      {auditTrialData.length > 0 ? (
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
                            documentTitle={'Audit Trial Report'}
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
                              auditTrialData={auditTrialData}
                              searchData={selectedSearchValues}
                              totalAmount={totalAmount}
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

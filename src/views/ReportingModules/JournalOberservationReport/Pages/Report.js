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
  TableFooter,
  TablePagination
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
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
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from '@material-ui/pickers';
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

const screenCode = 'JOURNALOBSERVATIONREPORT';

export default function JournalObservationReport(props) {
  const [title, setTitle] = useState('Journal Observation Report');
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [VoucherTypeList, setVoucherTypeList] = useState([]);
  const [journalObservationDetail, setJournalObservationDetail] = useState({
    groupID: 0,
    factoryID: 0,
    voucherCode: '',
    voucherType: '0'
  });
  const [journalObservationData, setJournalObservationData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(0);
  const componentRef = useRef();
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: '0',
    factoryName: '0',
    voucherCode: '',
    voucherType: '',
    startDate: '',
    endDate: ''
  });
  const [totalAmount, setTotalAmount] = useState({
    debitTotal: 0,
    creditTotal: 0
  });

  const [individualTotalAmount, setIndividualTotalAmount] = useState({
    individualDebitTotal: 0,
    individualCreditTotal: 0
  });

  const [groupedData, setGroupedData] = useState([]);

  const [startDateRange, setStartDateRange] = useState(new Date());
  const [endDateRange, setEndDateRange] = useState(new Date());

  const handleLimitChange = event => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown());
  }, [journalObservationDetail.groupID]);

  useEffect(() => {
    if (journalObservationDetail.groupID !== 0 && journalObservationDetail.factoryID !== 0) {
      getVoucherTypesForDropdown()
    }
  }, [startDateRange, endDateRange, journalObservationDetail.groupID, journalObservationDetail.factoryID])

  useEffect(() => {
    setGroupedData([])
    setJournalObservationData([])
    setTotalAmount({
      ...totalAmount,
      debitTotal: 0,
      creditTotal: 0
    });
  }, [startDateRange, endDateRange, journalObservationDetail.groupID, journalObservationDetail.factoryID])


  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWJOURNALOBSERVATIONREPORT'
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

    setJournalObservationDetail({
      ...journalObservationDetail,
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
      journalObservationDetail.groupID
    );
    setFactoryList(factories);
  }

  async function getVoucherTypesForDropdown() {
    setJournalObservationDetail({
      ...journalObservationDetail,
      voucherType: '0'
    });

    let voucherModel = {
      groupID: parseInt(journalObservationDetail.groupID),
      factoryID: parseInt(journalObservationDetail.factoryID),
      startDate: moment(startDateRange.toString()).format().split('T')[0],
      endDate: moment(endDateRange.toString()).format().split('T')[0]
    }

    const voucherTypes = await services.getVoucherCodeByDate(voucherModel);
    setVoucherTypeList(voucherTypes);
  }

  async function GetJournalObservationData() {
    let debitTotal = 0;
    let creditTotal = 0;

    let model = {
      groupID: parseInt(journalObservationDetail.groupID),
      factoryID: parseInt(journalObservationDetail.factoryID),
      voucherCode: journalObservationDetail.voucherCode,
      voucherType: journalObservationDetail.voucherType,
      startDate: moment(startDateRange.toString()).format().split('T')[0],
      endDate: moment(endDateRange.toString()).format().split('T')[0]
    };
    const journalData = await services.GetJournalObservation(model);
    getSelectedDropdownValuesForReport(model);

    setGroupedData(journalData.data);

    if (journalData.statusCode == 'Success' && journalData.data != null) {
      setJournalObservationData(journalData.data);

      const jData = journalData.data;

      jData.forEach(x => {
        x.reportList.forEach(y => {
          debitTotal = y.debit + debitTotal;
          creditTotal = y.credit + creditTotal;
        });
      });

      setTotalAmount({
        ...totalAmount,
        debitTotal: debitTotal,
        creditTotal: creditTotal
      });

      jData.forEach(x => {
        const dList = x.reportList;
        let individualDebitTotal = 0;
        let individualCreditTotal = 0;

        dList.forEach(y => {
          individualCreditTotal = y.credit + individualCreditTotal;
          individualDebitTotal = y.debit + individualDebitTotal;
        });

        dList.credit = individualCreditTotal;
        dList.debit = individualDebitTotal;

        setIndividualTotalAmount({
          ...individualTotalAmount,
          individualDebitTotal: individualDebitTotal,
          individualCreditTotal: individualCreditTotal
        });
      });

      if (journalData.data.length == 0) {
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
        x.reportList.map(y => {
          var xr = {
            'Voucher Number': x.referenceNumber,
            Date: moment(x.createdDate.toString())
              .format()
              .split('T')[0],
            'Transaction Mode': x.transactionModeID === 1 ? "Cheque" : x.transactionModeID === 2 ? "Fund Transfer" : x.transactionModeID === 3 ? "Cash" : "-",
            'Cheque / Fund Transfer Number': x.chequeNumber,
            'Ledger Account Code': y.ledgerAccountCode,
            'Ledger Account Name': y.ledgerAccountName,
            Description: y.description,
            Debit: CurrencyCommaSeperation(y.debit),
            Credit: CurrencyCommaSeperation(y.credit)
          };

          res.push(xr);
        });
      });

      var xr = {
        'Final Total': 'Final Total',
        Date: '',
        'Transaction Mode': '',
        'Cheque / Fund Transfer Number': '',
        'Account Code': '',
        'Ledger Account Name': '',
        Description: '',
        Debit: CurrencyCommaSeperation(totalAmount.debitTotal),
        Credit: CurrencyCommaSeperation(totalAmount.creditTotal)
      };
      res.push(xr);
    }

    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(journalObservationData);
    var settings = {
      sheetName: 'Journal Observation Report',
      fileName:
        'Journal Observation Report - ' +
        selectedSearchValues.groupName +
        ' ' +
        selectedSearchValues.factoryName +
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
        sheet: 'Journal Observation Report',
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
    setJournalObservationDetail({
      ...journalObservationDetail,
      [e.target.name]: value
    });
    setJournalObservationData([]);
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
      voucherCode: searchForm.voucherCode,
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
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: journalObservationDetail.groupID,
              factoryID: journalObservationDetail.factoryID,
              voucherCode: journalObservationDetail.voucherCode,
              voucherType: journalObservationDetail.voucherType
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Estate is required')
                .min('1', 'Estate is required')
            })}
            onSubmit={() => trackPromise(GetJournalObservationData())}
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
                              value={journalObservationDetail.groupID}
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
                              value={journalObservationDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size="small"
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date">
                              From Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="startDate"
                                id="startDate"
                                size="small"
                                value={startDateRange}
                                onChange={e => {
                                  setStartDateRange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date'
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date">
                              To Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="startDate"
                                id="startDate"
                                size="small"
                                value={endDateRange}
                                onChange={e => {
                                  setEndDateRange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date'
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          {/* <Grid item md={3} xs={8}>
                            <InputLabel shrink id="voucherCode">
                              Voucher Number
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="voucherCode"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={journalObservationDetail.voucherCode}
                              variant="outlined"
                              id="voucherCode"
                              size="small"
                            ></TextField>
                          </Grid> */}
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="voucherCode">
                              Voucher Code
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.voucherType && errors.voucherType
                              )}
                              fullWidth
                              helperText={touched.voucherType && errors.voucherType}
                              name="voucherType"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={journalObservationDetail.voucherType}
                              variant="outlined"
                              id="voucherType"
                              size="small"
                            >
                              <MenuItem value="0">--Select Voucher Code--</MenuItem>
                              {generateDropDownMenu(VoucherTypeList)}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Box display="flex" flexDirection="row-reverse" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            size="small"
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>

                      {journalObservationData.length > 0 ? (
                        <TableContainer>
                          <Table aria-label="caption table">
                            <TableHead style={{ backgroundColor: '#B0C4DE' }}>
                              <TableCell align={'center'}>
                                Voucher Number
                              </TableCell>
                              <TableCell align={'center'}>Date</TableCell>
                              <TableCell align={'center'}>Transaction Mode</TableCell>
                              <TableCell align={'center'}>
                                Cheque / Fund Transfer Number
                              </TableCell>
                              {/* <TableCell align={'center'}>
                                voucher Code
                              </TableCell> */}
                              <TableCell align={'center'}>
                                Ledger Account Code
                              </TableCell>
                              <TableCell align={'center'}>
                                Ledger Account Name
                              </TableCell>
                              <TableCell align={'center'}>
                                Description
                              </TableCell>
                              <TableCell align={'right'}>Debit</TableCell>
                              <TableCell align={'right'}>Credit </TableCell>
                            </TableHead>

                            <TableBody>
                              {groupedData != '' || groupedData.length != 0
                                ? groupedData
                                  .slice(page * limit, page * limit + limit)
                                  .map(item => (
                                    <>
                                      {item.reportList.map((data1, index) => (
                                        <TableRow>
                                          {index == 0 ? (
                                            <>
                                              <TableCell
                                                align={'center'}
                                                rowSpan={
                                                  item.reportList.length
                                                }
                                              >
                                                {item.referenceNumber}
                                              </TableCell>
                                              <TableCell
                                                align={'center'}
                                                rowSpan={
                                                  item.reportList.length
                                                }
                                              >
                                                {
                                                  moment(
                                                    item.createdDate.toString()
                                                  )
                                                    .format()
                                                    .split('T')[0]
                                                }
                                              </TableCell>
                                              <TableCell
                                                align={'center'}
                                                rowSpan={
                                                  item.reportList.length
                                                }
                                              >
                                                {item.transactionModeID === 1 ? "Cheque"
                                                  : item.transactionModeID === 2 ? "Fund Transfer"
                                                    : item.transactionModeID === 3 ? "Cash"
                                                      : "-"}
                                              </TableCell>
                                              <TableCell
                                                align={'center'}
                                                rowSpan={
                                                  item.reportList.length
                                                }
                                              >
                                                {item.chequeNumber == null ? '-' : item.chequeNumber}
                                              </TableCell>
                                              {/* <TableCell
                                                align={'center'}
                                                rowSpan={
                                                  item.reportList.length
                                                }
                                              >
                                                {item.voucherCode}
                                              </TableCell> */}
                                            </>
                                          ) : (
                                            ''
                                          )}

                                          <TableCell align={'center'}>
                                            {data1.ledgerAccountCode}
                                          </TableCell>
                                          <TableCell align={'center'}>
                                            {data1.ledgerAccountName}
                                          </TableCell>
                                          <TableCell align={'center'}>
                                            {data1.description}
                                          </TableCell>
                                          <TableCell align={'right'}>
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
                                      <TableRow
                                        style={{ backgroundColor: '#ffffe0' }}
                                      >
                                        <TableCell
                                          align={'center'}
                                        ></TableCell>
                                        <TableCell
                                          align={'center'}
                                        ></TableCell>
                                        <TableCell
                                          align={'center'}
                                        ></TableCell>
                                        <TableCell
                                          align={'center'}
                                        ></TableCell>
                                        <TableCell
                                          align={'right'}
                                          style={{ fontWeight: 'bold' }}
                                        >
                                          Total
                                        </TableCell>
                                        <TableCell
                                          align={'center'}
                                        ></TableCell>
                                        <TableCell
                                          align={'center'}
                                        ></TableCell>
                                        <TableCell
                                          align={'right'}
                                          style={{ fontWeight: 'bold' }}
                                        >
                                          <CountUp
                                            end={Number(
                                              item.reportList.debit ==
                                                undefined
                                                ? '0'
                                                : item.reportList.debit
                                            )}
                                            separator=","
                                            decimals={2}
                                            decimal="."
                                            duration={0.1}
                                          />
                                        </TableCell>
                                        <TableCell
                                          align={'right'}
                                          style={{ fontWeight: 'bold' }}
                                        >
                                          <CountUp
                                            end={Number(
                                              item.reportList.credit ==
                                                undefined
                                                ? '0'
                                                : item.reportList.credit
                                            )}
                                            separator=","
                                            decimals={2}
                                            decimal="."
                                            duration={0.1}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    </>
                                  ))
                                : null}
                            </TableBody>

                            <TableFooter bgcolor="#F5F5F5">
                              <TableCell
                                style={{ fontWeight: 'bold', fontSize: '14px' }}
                                align={'center'}
                              >
                                Final Total
                              </TableCell>
                              <TableCell align={'center'}></TableCell>
                              <TableCell align={'center'}></TableCell>
                              <TableCell align={'center'}></TableCell>
                              <TableCell align={'center'}></TableCell>
                              <TableCell align={'center'}></TableCell>
                              <TableCell align={'center'}></TableCell>
                              <TableCell
                                style={{ fontWeight: 'bold', fontSize: '14px' }}
                                align={'right'}
                              >
                                <CountUp
                                  end={totalAmount.debitTotal}
                                  separator=","
                                  decimals={2}
                                  decimal="."
                                  duration={0.1}
                                />
                              </TableCell>

                              <TableCell
                                style={{ fontWeight: 'bold', fontSize: '14px' }}
                                align={'right'}
                              >
                                <CountUp
                                  end={totalAmount.creditTotal}
                                  separator=","
                                  decimals={2}
                                  decimal="."
                                  duration={0.1}
                                />
                              </TableCell>
                            </TableFooter>
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
                      ) : null}

                      {journalObservationData.length > 0 ? (
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
                            documentTitle={'Journal Observation Report'}
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
                              journalObservationData={journalObservationData}
                              searchData={selectedSearchValues}
                              totalAmount={totalAmount}
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

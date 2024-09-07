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
  Paper,
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
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import { useAlert } from 'react-alert';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';

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

const screenCode = 'LOANREPORT';

export default function LoanReport(props) {
  const [title, setTitle] = useState('Loan Report');
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loanReportDetail, setLoanReportDetail] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    loantype: 0,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date().toISOString().substring(0, 10)
  });
  const [estateList, setEstateList] = useState([]);
  const [GroupList, setGroupList] = useState([]);
  const [divisions, setDivision] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loanReportData, setLoanReportData] = useState([]);
  const [LoanTypes, setLoanTypes] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [totalValues, setTotalValues] = useState({
    totalprincipalAmount: 0,
    totalAmount: 0,
    totalequatedMonthlyInstalment: 0,
    totaldeductionLoan: 0,
    totalpaidAmount: 0
  });

  const navigate = useNavigate();
  const [isTableHide, setIsTableHide] = useState(false);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    divisionID: "0",
    estateID: "0",
    groupID: "0",
    loantype: "0",
    startDate: "",
    endDate: ""
  });

  const componentRef = useRef();
  const alert = useAlert();
  const [alertCount, setAlertCount] = useState({
    count: 0
  });

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
    trackPromise(GetLoanTypes());
    setAlertCount({
      count: 1
    });
  }, []);

  useEffect(() => {
    getEstatesForDropdoen();
    trackPromise(
      getEstatesForDropdoen(loanReportDetail.groupID)
    )
    setAlertCount({
      count: alertCount.count + 1
    });
  }, [loanReportDetail.groupID]);

  useEffect(() => {
    trackPromise(getDivisionByEstateID(loanReportDetail.estateID));
  }, [loanReportDetail.estateID]);

  useEffect(() => {
    trackPromise(getDivisionByEstateID());
  }, [loanReportDetail.divisionID]);

  useEffect(() => {
    setIsTableHide(false);
  }, [loanReportDetail.divisionID, loanReportDetail.loantype, loanReportDetail.month, loanReportDetail.year]);

  useEffect(() => {
    setLoanReportDetail({
      ...loanReportDetail,
      loantype: '0',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date().toISOString().substring(0, 10),
    })
  }, [loanReportDetail.divisionID]);

  useEffect(() => {
    if (loanReportData.length != 0) {
      calculateTotalQty()
    }
  }, [loanReportData]);

  useEffect(() => {
    setLoanReportDetail({
      ...loanReportDetail,
      endDate: endDay
    })
  }, [loanReportDetail.startDate])

  useEffect(() => {
    const currentDate = new Date();
    const previousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    setSelectedDate(previousMonth);
  }, []);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLOANREPORT'
    );

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

    setLoanReportDetail({
      ...loanReportDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setLoanReportDetail({
      ...loanReportDetail,
      [e.target.name]: value
    });
    setLoanReportData([]);
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value;
    setLoanReportDetail({
      ...loanReportDetail,
      [e.target.name]: value
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getEstatesForDropdoen() {
    const estates = await services.getEstateDetailsByGroupID(loanReportDetail.groupID);
    setEstateList(estates);
  }

  async function getDivisionByEstateID() {
    const divisions = await services.getDivisionByEstateID(loanReportDetail.estateID);
    setDivision(divisions);
  };

  async function GetLoanTypes() {
    const response = await services.GetLoanTypeDetails();
    setLoanTypes(response);
  }

  async function GetDetails() {
    let model = {
      groupID: parseInt(loanReportDetail.groupID),
      estateID: parseInt(loanReportDetail.estateID),
      divisionID: loanReportDetail.divisionID == 0 ? null : parseInt(loanReportDetail.divisionID),
      loantype: loanReportDetail.loantype == 0 ? null : parseInt(loanReportDetail.loantype),
      startDate: (loanReportDetail.startDate),
      endDate: (loanReportDetail.endDate),
    };
    const customerData = await services.GetLoanDetails(model);
    getSelectedDropdownValuesForReport(model);

    if (customerData.statusCode == 'Success' && customerData.data.length != 0) {
      setLoanReportData(customerData.data);
      setIsTableHide(true);
    }
    else {
      alert.error('NO RECORDS TO DISPLAY');
    }
  }

  function calculateTotalQty() {
    const totalprincipalAmount = loanReportData.reduce((accumulator, current) => accumulator + current.principalAmount, 0);
    const totalAmount = loanReportData.reduce((accumulator, current) => accumulator + current.amount, 0);
    const totalequatedMonthlyInstalment = loanReportData.reduce((accumulator, current) => accumulator + current.equatedMonthlyInstalment, 0);
    const totaldeductionLoan = loanReportData.reduce((accumulator, current) => accumulator + current.deductionLoan, 0);
    const totalpaidAmount = loanReportData.reduce((accumulator, current) => accumulator + current.paidAmount, 0);

    setTotalValues({
      ...totalValues,
      totalprincipalAmount: totalprincipalAmount,
      totalAmount: totalAmount,
      totalequatedMonthlyInstalment: totalequatedMonthlyInstalment,
      totaldeductionLoan: totaldeductionLoan,
      totalpaidAmount: totalpaidAmount
    })
  }

  const specificMonth = loanReportDetail.startDate ? new Date(loanReportDetail.startDate) : new Date();
  const firstDay = specificMonth.toISOString().split('T')[0];
  const lastDayOfMonth = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1);
  const lastDay = lastDayOfMonth.toISOString().split('T')[0];
  const endDay = new Date(specificMonth.getFullYear(), specificMonth.getMonth() + 1).toISOString().split('T')[0];

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Employee No': x.registrationNumber,
          'Employee Name': x.employeeName,
          'Loan Type': x.name,
          'No of Installment Months': x.numberOfInstalments,
          'Interest Rate (%)': x.annualRate,
          'Loan Amount (Rs.)': x.principalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          'Payable Amount with Interest (Rs.)': x.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          'Monthly Premimum (Rs.)': x.equatedMonthlyInstalment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          'Paid Amount (Rs.)': x.deductionLoan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          'Balance Amount (Rs.)': x.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

        }
        res.push(vr);
      });
      res.push({});
      var vr = {
        'Employee No': 'Total',
        'Loan Amount (Rs.)': totalValues.totalprincipalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'Payable Amount with Interest (Rs.)': totalValues.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'Monthly Premimum (Rs.)': totalValues.totalequatedMonthlyInstalment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'Paid Amount (Rs.)': totalValues.totaldeductionLoan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'Balance Amount (Rs.)': totalValues.totalpaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      };
      res.push(vr);

      res.push({});
      var vr = {
        'Employee No': 'Group : ' + selectedSearchValues.groupID,
        'Employee Name': 'Estate : ' + selectedSearchValues.estateID,
        'Loan Type': 'Division : ' + selectedSearchValues.divisionID,
        'No of Installment Months': 'Loan Type : ' + (selectedSearchValues.loantype),
      };
      res.push(vr);

      var vr = {
        'Employee No': 'Start Date : ' + selectedSearchValues.startDate,
        'Loan Type': 'End Date : ' + selectedSearchValues.endDate,
      };
      res.push(vr);
    }

    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(loanReportData);
    var settings = {
      sheetName: 'Loan Report',
      fileName: 'Loan Report - ' + selectedSearchValues.startDate + '/' + selectedSearchValues.endDate,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Loan Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]
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


  function GenerateDropDownMenu(data) {
    let items = []

    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }

    return items
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      estateID: estateList[searchForm.estateID],
      groupID: GroupList[searchForm.groupID],
      divisionID: divisions[searchForm.divisionID],
      loantype: LoanTypes[searchForm.loantype],
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
              groupID: loanReportDetail.groupID,
              factoryID: loanReportDetail.factoryID,
              divisionID: loanReportDetail.divisionID,
              loantype: loanReportDetail.loantype
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group required')
                .min('1', 'Group required'),
              estaateID: Yup.number()
                .required('Estate required')
                .min('1', 'Factory required'),
              divisionID: Yup.number()
                .required('Division is required')
                .min('1', 'Division is required'),
              loantype: Yup.number()
                .required('Loan Type is required')
                .min('1', 'Loan Type is required')
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
                              value={loanReportDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                              }}
                              size="small"
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={loanReportDetail.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                              size="small"
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(estateList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="divisionID">
                              Division *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.divisionID && errors.divisionID)}
                              fullWidth
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              onChange={e => handleChange(e)}
                              value={loanReportDetail.divisionID}
                              variant="outlined"
                              id="divisionID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="loantype">
                              Loan Type *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.loantype && errors.loantype)}
                              fullWidth
                              helperText={touched.loantype && errors.loantype}
                              name="loantype"
                              onChange={e => handleChange1(e)}
                              value={loanReportDetail.loantype}
                              variant="outlined"
                              id="loantype"
                              size="small"
                            >
                              <MenuItem value="0">--Select LoanType--</MenuItem>
                              {GenerateDropDownMenu(LoanTypes)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="startDate">
                              From Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="startDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={loanReportDetail.startDate}
                              variant="outlined"
                              id="startDate"
                              size='small'
                              onKeyPress={(e) => {
                                if (e.key >= '0' && e.key <= '9') {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="endDate">
                              To Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="endDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={loanReportDetail.endDate}
                              variant="outlined"
                              id="endDate"
                              size='small'
                              InputProps={{
                                inputProps: {
                                  min: firstDay,
                                  max: lastDay,
                                },
                              }}
                              onKeyPress={(e) => {
                                if (e.key >= '0' && e.key <= '9') {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </Grid>

                          <Grid item md={12} xs={12}>
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
                          </Grid>
                        </Grid>

                        <br></br>
                        <br></br>
                        <br></br>
                        <Box minWidth={1050}>
                          {loanReportData.length > 0 && isTableHide ?
                            <TableContainer component={Paper}>
                              <Table className={classes.table} aria-label="simple table">
                                <TableHead>
                                  <TableRow style={{ border: "2px solid black" }}>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Emp. No.</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Employee Name</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Loan Type</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>No of Installment Months</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Interest Rate (%)</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Loan Amount (Rs.)</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Payable Amount with Interest (Rs.)</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Monthly Premimum (Rs.)</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Paid Amount (Rs.)</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Balance Amount (Rs.)</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {loanReportData.slice(page * limit, page * limit + limit).map((row, i) => (
                                    <TableRow style={{ border: "2px solid black" }} key={i}>
                                      <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.registrationNumber}</TableCell>
                                      <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.employeeName}</TableCell>
                                      <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.name}</TableCell>
                                      <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}> {row.numberOfInstalments}</TableCell>
                                      <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}> {row.annualRate}</TableCell>
                                      <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.principalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                      <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                      <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.equatedMonthlyInstalment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                      <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.deductionLoan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                      <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}> {row.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                                <TableRow style={{ border: "2px solid black" }}>
                                  <TableCell colSpan={5} align={'center'} style={{ borderBottom: "none", border: "2px solid black", fontSize: '16px' }} ><b><strong>Total</strong></b></TableCell>
                                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "2px solid black" }}>{totalValues.totalprincipalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "2px solid black" }}>{totalValues.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "2px solid black" }}>{totalValues.totalequatedMonthlyInstalment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </TableCell>
                                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "2px solid black" }}>{totalValues.totaldeductionLoan.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                  <TableCell align={'right'} style={{ fontWeight: "bold", borderBottom: "none", border: "2px solid black" }}>{totalValues.totalpaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                              </Table>
                              <TablePagination
                                component="div"
                                count={loanReportData.length}
                                onChangePage={handlePageChange}
                                onChangeRowsPerPage={handleLimitChange}
                                page={page}
                                rowsPerPage={limit}
                                rowsPerPageOptions={[5, 10, 25]}
                              />
                            </TableContainer>
                            : null}
                        </Box>
                      </CardContent>

                      {loanReportData.length > 0 && isTableHide ? (
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

                          {<ReactToPrint
                            documentTitle={'Loan Report'}
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
                          />}
                          {<div hidden={true}>
                            <CreatePDF
                              ref={componentRef}
                              selectedSearchValues={selectedSearchValues}
                              loanReportDetail={loanReportDetail}
                              loanReportData={loanReportData}
                              totalValues={totalValues}
                            />
                          </div>}
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

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
  TableRow
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
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";


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

const screenCode = 'BUYERWISESALEDETAILSREPORT';

export default function BuyerWiseSalesDetailsReport(props) {
  const [title, setTitle] = useState('Buyer Wise Sales Details Report');
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [grandTotal, setGrandTotal] = useState({
    qtyAmountTotal: 0,
    averageTotal: 0
  })
  const [reportSearchDetail, setReportSearchDetail] = useState({
    groupID: 0,
    factoryID: 0,
    sellingMarkID: 0,
    brokerID: 0,
    typeOfSale: 0,
    typeOfGrade: 0,
    buyerID: 0
  });

  const [buyers, setBuyers] = useState([]);

  const [brokers, setBrokers] = useState([]);

  const [sellingMarks, setSellingMarks] = useState([]);

  const [reportData, setReportData] = useState([]);

  const componentRef = useRef();

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: '',
    factoryName: '',
    startDate: '',
    endDate: '',
    sellingMarkName: '',
    brokerName: '',
    typeOfSale: 0,
    typeOfGrade: 0
  });
  const [startDateRange, setStartDateRange] = useState(new Date());
  const [endDateRange, setEndDateRange] = useState(new Date());

  const [grades, setGrades] = useState([]);

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (reportSearchDetail.groupID > 0) {
      trackPromise(getFactoriesForDropdown());
    }
  }, [reportSearchDetail.groupID]);

  useEffect(() => {
    if (reportSearchDetail.factoryID > 0) {
      trackPromise(getSellingMarksForDropdown());
      trackPromise(getBrokersForDropdown());
      trackPromise(getBuyersForDropdown());
      trackPromise(getGradesForDropdown());
    }
  }, [reportSearchDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWBUYERWISESALEDETAILSREPORT'
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

    setReportSearchDetail({
      ...reportSearchDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(reportSearchDetail.groupID);
    setFactoryList(factories);
  }

  async function getSellingMarksForDropdown() {
    const sellingMarks = await services.GetSellingMarkList(reportSearchDetail.groupID, reportSearchDetail.factoryID);
    setSellingMarks(sellingMarks);
  }

  async function getBuyersForDropdown() {
    const buyers = await services.getAllBuyers(reportSearchDetail.groupID, reportSearchDetail.factoryID);
    setBuyers(buyers);
  }

  async function getBrokersForDropdown() {
    const brokers = await services.GetBrokerList(reportSearchDetail.groupID, reportSearchDetail.factoryID);
    setBrokers(brokers);
  }

  async function getGradesForDropdown() {
    const grades = await services.GetGradeDetails(reportSearchDetail.groupID, reportSearchDetail.factoryID);
    setGrades(grades);
  }

  async function getBuyerWiseSalesDetailsReportData() {

    let model = {
      groupID: parseInt(reportSearchDetail.groupID),
      factoryID: parseInt(reportSearchDetail.factoryID),
      startDate: moment(startDateRange.toString())
        .format()
        .split('T')[0],
      endDate: moment(endDateRange.toString())
        .format()
        .split('T')[0],
      sellingMarkID: parseInt(reportSearchDetail.sellingMarkID),
      buyerID: parseInt(reportSearchDetail.buyerID),
      brokerID: parseInt(reportSearchDetail.brokerID),
      typeOfSale: parseInt(reportSearchDetail.typeOfSale),
      typeOfGrade: parseInt(reportSearchDetail.typeOfGrade)
    };

    const buyerWiseSalesDetailsData = await services.getBuyerWiseSalesDetailsReport(model);

    if (buyerWiseSalesDetailsData.statusCode == 'Success' && buyerWiseSalesDetailsData.data != null) {

      let finalQtyAmount = 0;
      let finalAverage = 0;

      buyerWiseSalesDetailsData.data.forEach(x => {
        finalQtyAmount += x.qtyAmount;
        finalAverage += x.average;
      });

      buyerWiseSalesDetailsData.data.forEach(x => {
        x.qtyPercentage = parseFloat(((x.qtyAmount / finalQtyAmount) * 100).toFixed(1));
      });

      setGrandTotal({
        ...grandTotal,
        qtyAmountTotal: finalQtyAmount,
        averageTotal: finalAverage
      });

      setReportData(buyerWiseSalesDetailsData.data);
      getSelectedDropdownValuesForReport(reportSearchDetail);

      createDataForExcel(buyerWiseSalesDetailsData.data);
      if (buyerWiseSalesDetailsData.data.length == 0) {
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
          'Selling Mark Name': x.sellingMarkName,
          'Buyer Name': x.buyerName,
          'Broker Name': x.brokerName,
          'Grade Name': x.gradeName,
          'Qty(Kg)': x.qtyAmount,
          'Qty(%)': x.qtyPercentage,
          // 'Average(Rs)': x.average
        };
        res.push(vr);
      });
      var vr = {
        'Selling Mark Name': 'Total',
        'Qty(Kg)': grandTotal.qtyAmountTotal,
        // 'Average(Rs)': grandTotal.averageTotal
      };
      res.push(vr);
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(reportData);
    var settings = {
      sheetName: 'Buyer Wise Sales Details Report',
      fileName:
        'Buyer Wise Sales Details Report ' +
        selectedSearchValues.groupName +
        ' - ' +
        selectedSearchValues.factoryName +
        ' - ' +
        selectedSearchValues.startDate +
        ' - ' +
        selectedSearchValues.endDate +
        ' - ' +
        selectedSearchValues.sellingMarkName +
        ' - ' +
        selectedSearchValues.brokerName
    };

    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'Buyer Wise Sales Details Report',
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
    setReportSearchDetail({
      ...reportSearchDetail,
      [e.target.name]: value
    });
    setReportData([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(startDateRange.toString())
      .format()
      .split('T')[0];
    var endDate = moment(endDateRange.toString())
      .format()
      .split('T')[0];
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[reportSearchDetail.groupID],
      factoryName: FactoryList[reportSearchDetail.factoryID],
      startDate: [startDate],
      endDate: [endDate],
      sellingMarkName: sellingMarks[reportSearchDetail.sellingMarkID],
      brokerName: brokers[reportSearchDetail.brokerID],
      typeOfSale: reportSearchDetail.typeOfSale,
      typeOfGrade: reportSearchDetail.typeOfGrade
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
              groupID: reportSearchDetail.groupID,
              factoryID: reportSearchDetail.factoryID,
              buyerID: reportSearchDetail.buyerID,
              startDate: startDateRange,
              endDate: endDateRange
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number().required('Group is required').min('1', 'Group is required'),
              factoryID: Yup.number().required('Factory is required').min('1', 'Factory is required'),
              buyerID: Yup.number().required('Buyer is required').min('1', 'Buyer is required'),
              startDate: Yup.date().required('Month & Year is required'),
              endDate: Yup.date().required('Month & Year is required'),
            })}
            onSubmit={() => trackPromise(getBuyerWiseSalesDetailsReportData())}
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
                        <Grid container spacing={4}>

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
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={reportSearchDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
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
                              value={reportSearchDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              size='small'
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date">From Date </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name='startDate'
                                id='startDate'
                                size='small'
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
                            <InputLabel shrink id="date">To Date </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name='endDate'
                                size='small'
                                id='endDate'
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

                        <Grid container spacing={4}>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="buyerID">
                              Buyer *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.buyerID && errors.buyerID)}
                              fullWidth
                              helperText={touched.buyerID && errors.buyerID}
                              name="buyerID"
                              onChange={(e) => handleChange(e)}
                              value={reportSearchDetail.buyerID}
                              size='small'
                              variant="outlined"
                              id="buyerID"
                            >
                              <MenuItem value="0">--Select Buyer--</MenuItem>
                              {generateDropDownMenu(buyers)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="brokerID">
                              Broker
                            </InputLabel>

                            <TextField select
                              fullWidth
                              error={Boolean(touched.brokerID && errors.brokerID)}
                              helperText={touched.brokerID && errors.brokerID}
                              name="brokerID"
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={reportSearchDetail.brokerID}
                              variant="outlined"
                              id="brokerID"
                              size='small'
                            >
                              <MenuItem value={'0'}>
                                --Select Broker--
                              </MenuItem>
                              {generateDropDownMenu(brokers)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="sellingMarkID">
                              Selling Mark
                            </InputLabel>

                            <TextField select
                              fullWidth
                              error={Boolean(touched.sellingMarkID && errors.sellingMarkID)}
                              helperText={touched.sellingMarkID && errors.sellingMarkID}
                              name="sellingMarkID"
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={reportSearchDetail.sellingMarkID}
                              variant="outlined"
                              id="sellingMarkID"
                            >
                              <MenuItem value={'0'}>
                                --Select Selling Mark--
                              </MenuItem>
                              {generateDropDownMenu(sellingMarks)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="typeOfGrade">
                              Types Of Grade
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.typeOfGrade && errors.typeOfGrade)}
                              fullWidth
                              helperText={touched.typeOfGrade && errors.typeOfGrade}
                              name="typeOfGrade"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={reportSearchDetail.typeOfGrade}
                              variant="outlined"
                              size='small'
                              id="typeOfGrade"
                            >
                              <MenuItem value="0">--Select Type Of Grade--</MenuItem>
                              {generateDropDownMenu(grades)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={4}>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="typeOfSale">
                              Types Of Sale
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.typeOfSale && errors.typeOfSale)}
                              fullWidth
                              helperText={touched.typeOfSale && errors.typeOfSale}
                              name="typeOfSale"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={reportSearchDetail.typeOfSale}
                              variant="outlined"
                              size='small'
                              id="typeOfSale"
                            >
                              <MenuItem value="0">--Select Type Of Sale--</MenuItem>
                              <MenuItem value="1">All</MenuItem>
                            </TextField>
                          </Grid>

                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2}>
                          <Button
                            color="primary"
                            type="submit"
                            size='small'
                            variant="contained"
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {reportData.length > 0 ? (
                          <TableContainer>
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align={'left'}>
                                    Selling Mark
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Buyer Name
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Broker Name
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Grade
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Qty (Kg)
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Qty (%)
                                  </TableCell>
                                  {/* <TableCell align={'left'}>
                                    Average (Rs)
                                  </TableCell> */}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {reportData.map((row) => (
                                  <TableRow
                                    key={row.sellingMarkName}
                                    sx={{ '&:last-child td, &:last-child th': { border: 1 } }}
                                  >
                                    <TableCell component="th" scope="row">
                                      {row.sellingMarkName}
                                    </TableCell>
                                    <TableCell align="left">
                                      {row.buyerName}
                                    </TableCell>
                                    <TableCell align="left">
                                      {row.brokerName}
                                    </TableCell>
                                    <TableCell align="left">
                                      {row.gradeName}
                                    </TableCell>
                                    <TableCell align="left">
                                      {row.qtyAmount}
                                    </TableCell>
                                    <TableCell align="left">
                                      {row.qtyPercentage + '%'}
                                    </TableCell>
                                    {/* <TableCell align="left">
                                      {row.average}
                                    </TableCell> */}
                                  </TableRow>
                                ))}
                              </TableBody>

                              <TableRow style={{ background: '#ADD8E6' }}>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ fontWeight: 'bold' }}
                                >Total
                                </TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >
                                </TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >
                                </TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >
                                </TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >{grandTotal.qtyAmountTotal}
                                </TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >
                                </TableCell>
                                {/* <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >{grandTotal.averageTotal}
                                </TableCell> */}

                              </TableRow>
                            </Table>
                          </TableContainer>
                        ) : null}
                      </Box>
                      {reportData.length > 0 ? (
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={() => createFile()}
                            size='small'
                          >
                            EXCEL
                          </Button>
                          <ReactToPrint
                            documentTitle={'Dispatch Details Report'}
                            trigger={() => (
                              <Button
                                color="primary"
                                id="btnRecord"
                                type="submit"
                                variant="contained"
                                style={{ marginRight: '1rem' }}
                                className={classes.colorCancel}
                                size='small'
                              >
                                PDF
                              </Button>
                            )}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF
                              ref={componentRef}
                              reportData={reportData}
                              searchData={selectedSearchValues}
                              grandTotalData={grandTotal}
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

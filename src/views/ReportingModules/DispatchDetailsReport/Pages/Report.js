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

const screenCode = 'DISPATCHDETAILSREPORT';

export default function DispatchDetailsReport(props) {
  const [title, setTitle] = useState('Dispatch Details Report');
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [grandTotal, setGrandTotal] = useState({
    bagWeightTotal: 0,
    noOfBagTotal: 0,
    saTotal: 0,
    grossQtyTotal: 0,
    nettQtyTotal: 0
  })
  const [dispatchReportDetail, setDispatchReportDetail] = useState({
    groupID: 0,
    factoryID: 0,
    sellingMarkID: 0,
    brokerID: 0,
    typeOfDispatch: 0
  });

  const [brokers, setBrokers] = useState([]);
  const [sellingMarks, setSellingMarks] = useState([]);
  const [vehicles, setVehicles] = useState([]);
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
    brokerName: ''
  });
  const [startDateRange, setStartDateRange] = useState(new Date());
  const [endDateRange, setEndDateRange] = useState(new Date());

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (dispatchReportDetail.groupID > 0) {
      trackPromise(getFactoriesForDropdown());
    }
  }, [dispatchReportDetail.groupID]);

  useEffect(() => {
    if (dispatchReportDetail.factoryID > 0) {
      trackPromise(
        getSellingMarksForDropdown(),
        getBrokersForDropdown(),
        getVehiclesForDropdown()
      );
    }
  }, [dispatchReportDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWDISPATCHDETAILSREPORT'
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

    setDispatchReportDetail({
      ...dispatchReportDetail,
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
      dispatchReportDetail.groupID
    );
    setFactoryList(factories);
  }

  async function getSellingMarksForDropdown() {
    const sellingMarks = await services.GetSellingMarkList(dispatchReportDetail.groupID, dispatchReportDetail.factoryID);
    setSellingMarks(sellingMarks);
  }

  async function getBrokersForDropdown() {
    const brokers = await services.GetBrokerList(dispatchReportDetail.groupID, dispatchReportDetail.factoryID);
    setBrokers(brokers);
  }

  async function getVehiclesForDropdown() {
    const vehicles = await services.GetVehicleList(dispatchReportDetail.groupID, dispatchReportDetail.factoryID);
    setVehicles(vehicles);
  }

  async function getDispatchDetailsReportData() {
    let model = {
      groupID: parseInt(dispatchReportDetail.groupID),
      factoryID: parseInt(dispatchReportDetail.factoryID),
      startDate: moment(startDateRange.toString())
        .format()
        .split('T')[0],
      endDate: moment(endDateRange.toString())
        .format()
        .split('T')[0],
      sellingMarkID: parseInt(dispatchReportDetail.sellingMarkID),
      brokerID: parseInt(dispatchReportDetail.brokerID),
      typeOfDispatch: parseInt(dispatchReportDetail.typeOfDispatch)
    };
    const dispatchDetailsData = await services.getDispatchDetailsReport(model);
    if (dispatchDetailsData.statusCode == 'Success' && dispatchDetailsData.data != null) {

      let finalBagWeight = 0;
      let finalNoOfBags = 0;
      let finalGrossQty = 0;
      let finalSA = 0;
      let finalNettQty = 0;

      dispatchDetailsData.data.forEach(x => {
        x.date = x.date.split('T')[0];
        finalBagWeight += x.bagWeight;
        finalNoOfBags += x.noOfBags;
        finalGrossQty += x.grossQty;
        finalSA += x.sampleAllowance;
        finalNettQty += x.nettQty;
      });

      setGrandTotal({
        ...grandTotal,
        bagWeightTotal: finalBagWeight,
        noOfBagTotal: finalNoOfBags,
        saTotal: finalSA,
        grossQtyTotal: finalGrossQty,
        nettQtyTotal: finalNettQty
      });

      setReportData(dispatchDetailsData.data);
      getSelectedDropdownValuesForReport(dispatchReportDetail);

      createDataForExcel(dispatchDetailsData.data);
      if (dispatchDetailsData.data.length == 0) {
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
          'Date': x.date,
          'InvoiceNo': x.invoiceNo,
          'SellingMark': x.sellingMark,
          'Grade': x.grade,
          'BagWeight(Kg)': x.bagWeight,
          'NoOfBags': x.noOfBags,
          'GrossQty(Kg)': x.grossQty,
          'Sample Allowance': x.sampleAllowance,
          'NettQty(Kg)': x.nettQty,
          'Vehicle': x.vehicle
        };
        res.push(vr);
      });
      var vr = {
        'Date': 'Gross Total',
        'BagWeight(Kg)': grandTotal.bagWeightTotal,
        'NoOfBags': grandTotal.noOfBagTotal,
        'GrossQty(Kg)': grandTotal.grossQtyTotal,
        'Sample Allowance': grandTotal.saTotal,
        'NettQty(Kg)': grandTotal.nettQtyTotal,
      };
      res.push(vr);
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(reportData);
    var settings = {
      sheetName: 'Dispatch Details Report',
      fileName:
        'Dispatch Details Report ' +
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
        sheet: 'Dispatch Report',
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
    setDispatchReportDetail({
      ...dispatchReportDetail,
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
      groupName: GroupList[dispatchReportDetail.groupID],
      factoryName: FactoryList[dispatchReportDetail.factoryID],
      startDate: [startDate],
      endDate: [endDate],
      sellingMarkName: sellingMarks[dispatchReportDetail.sellingMarkID],
      brokerName: brokers[dispatchReportDetail.brokerID]
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
              groupID: dispatchReportDetail.groupID,
              factoryID: dispatchReportDetail.factoryID
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Factory is required')
                .min('1', 'Factory is required')
            })}
            onSubmit={() => trackPromise(getDispatchDetailsReportData())}
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
                              value={dispatchReportDetail.groupID}
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
                              value={dispatchReportDetail.factoryID}
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
                            <InputLabel shrink id="date">From Date *</InputLabel>
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
                            <InputLabel shrink id="date">To Date *</InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name='startDate'
                                size='small'
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

                        <Grid container spacing={4}>

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
                              value={dispatchReportDetail.sellingMarkID}
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
                              value={dispatchReportDetail.brokerID}
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
                            <InputLabel shrink id="typeOfDispatch">
                              Types Of Dispatch 
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.typeOfDispatch && errors.typeOfDispatch)}
                              fullWidth
                              helperText={touched.typeOfDispatch && errors.typeOfDispatch}
                              name="typeOfDispatch"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={dispatchReportDetail.typeOfDispatch}
                              variant="outlined"
                              size='small'
                              id="typeOfDispatch"
                            >
                              <MenuItem value="0">--Select Type Of Dispatch--</MenuItem>
                              <MenuItem value="1">Incomplete</MenuItem>
                              <MenuItem value="2">Complete</MenuItem>
                              <MenuItem value="3">Invoice</MenuItem>
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
                                    Date
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Invoice No
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Selling Mark
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Grade
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Bag Weight(Kg)
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    No of Bags
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Gross Qty(Kg)
                                  </TableCell>
                                  <TableCell align={'left'}>
                                  Sample Allowance
                                </TableCell>
                                  <TableCell align={'left'}>
                                    Net Qty(Kg)
                                  </TableCell>
                                  <TableCell align={'left'}>
                                  Vehicle
                                </TableCell>
                              </TableRow>
                            </TableHead>
                          <TableBody>
                            {reportData.map((row) => (
                              <TableRow
                                key={row.date}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                              >
                                <TableCell component="th" scope="row">
                                  {row.date}
                                </TableCell>
                                <TableCell align="left">
                                  {row.invoiceNo}
                                </TableCell>
                                <TableCell align="left">
                                  {row.sellingMark}
                                </TableCell>
                                <TableCell align="left">
                                  {row.grade}
                                </TableCell>
                                <TableCell align="left">
                                  {row.bagWeight}
                                </TableCell>
                                <TableCell align="left">
                                  {row.noOfBags}
                                </TableCell>
                                <TableCell align="left">
                                  {row.grossQty}
                                </TableCell>
                                <TableCell align="left">
                                  {row.sampleAllowance}
                                </TableCell>
                                <TableCell align="left">
                                  {row.nettQty}
                                </TableCell>
                                <TableCell align="left">
                                  {row.vehicle}
                                </TableCell>
                              </TableRow>
                            ))}
                              </TableBody>

                              <TableRow style={{ background: '#ADD8E6' }}>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ fontWeight: 'bold' }}
                                >Grand Total</TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                ></TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                ></TableCell>

                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                ></TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >{grandTotal.bagWeightTotal}</TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >{grandTotal.noOfBagTotal}</TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >{grandTotal.grossQtyTotal}</TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >{grandTotal.saTotal}</TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >{grandTotal.nettQtyTotal}</TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                ></TableCell>
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

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
import { LoadingComponent } from '../../../../utils/newLoader';


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

const screenCode = 'DIRECTSALEREPORT';

export default function DirectSaleReport(props) {
  const [title, setTitle] = useState('Direct Sale Report');
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [grandTotal, setGrandTotal] = useState({
    quantityTotal: 0,
    amountTotal: 0
  })
  const [directSaleReportDetail, setDirectSaleReportDetail] = useState({
    groupID: 0,
    factoryID: 0
  });
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
    endDate: ''
  });
  const [startDateRange, setStartDateRange] = useState(new Date());
  const [endDateRange, setEndDateRange] = useState(new Date());

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (directSaleReportDetail.groupID > 0) {
      trackPromise(getFactoriesForDropdown());
    }
  }, [directSaleReportDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWDIRECTSALEREPORT'
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

    setDirectSaleReportDetail({
      ...directSaleReportDetail,
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
      directSaleReportDetail.groupID
    );
    setFactoryList(factories);
  }

  async function getDirectSaleDetailsReportData() {

    let model = {
      groupID: parseInt(directSaleReportDetail.groupID),
      factoryID: parseInt(directSaleReportDetail.factoryID),
      startDate: moment(startDateRange.toString())
        .format()
        .split('T')[0],
      endDate: moment(endDateRange.toString())
        .format()
        .split('T')[0]
    };

    const directSaleDetailsData = await services.getDirectSaleDetailsForReport(model);

    if (directSaleDetailsData.statusCode == 'Success' && directSaleDetailsData.data != null) {

      let totalQuantity = 0;
      let totalAmount = 0;

      directSaleDetailsData.data.forEach(x => {
        x.dateOfSelling = x.dateOfSelling.split('T')[0];
        totalQuantity += x.quantity;
        totalAmount += x.amount;
      });

      setGrandTotal({
        ...grandTotal,
        quantityTotal: totalQuantity,
        amountTotal: totalAmount
      });

      setReportData(directSaleDetailsData.data);
      getSelectedDropdownValuesForReport(directSaleReportDetail);

      if (directSaleDetailsData.data.length == 0) {
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
          'Date': x.dateOfSelling,
          'InvoiceNo': x.invoiceNumber,
          'Customer Name': x.customerName,
          'Grade': x.gradeName,
          'Unit Price': x.unitPrice,
          'Quantity': x.quantity.toFixed(2),
          'Amount': x.amount.toFixed(2),
          // 'Average': x.average
        };
        res.push(vr);
      });
      var vr = {
        'Date': 'Total',
        'Quantity': grandTotal.quantityTotal.toFixed(2),
        'Amount': grandTotal.amountTotal.toFixed(2)
      };
      res.push(vr);
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(reportData);
    var settings = {
      sheetName: 'Direct Sale Report',
      fileName:
        'Direct Sale Report ' +
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
        sheet: 'Direct Sale Report',
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
    setDirectSaleReportDetail({
      ...directSaleReportDetail,
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
      groupName: GroupList[directSaleReportDetail.groupID],
      factoryName: FactoryList[directSaleReportDetail.factoryID],
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
              groupID: directSaleReportDetail.groupID,
              factoryID: directSaleReportDetail.factoryID
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Factory is required')
                .min('1', 'Factory is required')
            })}
            onSubmit={() => trackPromise(getDirectSaleDetailsReportData())}
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
                              value={directSaleReportDetail.groupID}
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
                              value={directSaleReportDetail.factoryID}
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
                                    Customer Name
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Grade
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Unit Price
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Quantity
                                  </TableCell>
                                  <TableCell align={'left'}>
                                    Amount
                                  </TableCell>
                                  {/* <TableCell align={'left'}>
                                    Average
                                  </TableCell> */}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {reportData.map((row) => (
                                  <TableRow
                                    key={row.dateOfSelling}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                  >
                                    <TableCell component="th" scope="row">
                                      {row.dateOfSelling}
                                    </TableCell>
                                    <TableCell align="left">
                                      {row.invoiceNumber}
                                    </TableCell>
                                    <TableCell align="left">
                                      {row.customerName}
                                    </TableCell>
                                    <TableCell align="left">
                                      {row.gradeName}
                                    </TableCell>
                                    <TableCell align="left">
                                      {row.unitPrice}
                                    </TableCell>
                                    <TableCell align="left">
                                      {row.quantity}
                                    </TableCell>
                                    <TableCell align="left">
                                      {row.amount}
                                    </TableCell>
                                    {/* <TableCell align="left">
                                      {row.average.toFixed(1)}
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
                                >{grandTotal.bagWeightTotal}
                                </TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >{grandTotal.noOfBagTotal}
                                </TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >{grandTotal.quantityTotal}
                                </TableCell>
                                <TableCell
                                  align={'left'}
                                  component="th"
                                  scope="row"
                                  style={{ borderBottom: 'none' }}
                                >{grandTotal.amountTotal.toFixed(2)}
                                </TableCell>
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

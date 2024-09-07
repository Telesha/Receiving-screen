import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Button,
  makeStyles,
  Container,
  Divider,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import { useAlert } from 'react-alert';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';
import DateRangeSelectorComponent from '../../InquiryRegistry/Utils/DateRangeSelector';
import Popover from '@material-ui/core/Popover';
import EventIcon from '@material-ui/icons/Event';

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
  row: {
    marginTop: '1rem'
  },
  colorCancel: {
    backgroundColor: 'red'
  },
  colorRecordAndNew: {
    backgroundColor: '#FFBE00'
  },
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = 'VALUATIONREPORT';

export default function ValuationReport(props) {
  const [title, setTitle] = useState('Valuation Report');
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [valuationData, setValuationData] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [sellingMarks, setSellingMarks] = useState([]);
  const [valuationDetails, setValuationDetails] = useState({
    groupID: '0',
    factoryID: '0',
    sellingMark: '0',
    broker: '0',
    typeID: '0'
  });
  let encrypted = "";
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [netAmountTotal, setNetAmountTotal] = useState({
    netAmount: 0
  });
 
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClickPop = event => {
    setAnchorEl(event.currentTarget);
  };
  const [DateRange, setDateRange] = useState({
    startDate: startOfMonth(addMonths(new Date(), -5)),
    endDate: endOfMonth(addMonths(new Date(), -0))
  });
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const componentRef = useRef();
  const navigate = useNavigate();
  const alert = useAlert();

  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    startDate: '',
    endDate: ''
  });
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [valuationDetails.groupID]);

  useEffect(
    () => {
      trackPromise(
        getBrokersForDropdown(),
        getSellingMarksForDropdown()
      );
    },
    [valuationDetails.factoryID]
  );

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWVALUATIONREPORT'
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

    setValuationDetails({
      ...valuationDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }
  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(
      valuationDetails.groupID
    );
    setFactories(factory);
  }

  async function getBrokersForDropdown() {
    const brokers = await services.getBrokerList(
      valuationDetails.groupID,
      valuationDetails.factoryID
    );
    setBrokers(brokers);
  }

  async function getSellingMarksForDropdown() {
    const sellingMarks = await services.getSellingMarkList(
      valuationDetails.groupID,
      valuationDetails.factoryID
    );
    setSellingMarks(sellingMarks);
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

  async function GetDetails() {
    let model = {
      groupID: parseInt(valuationDetails.groupID),
      factoryID: parseInt(valuationDetails.factoryID),
      startDate: moment(DateRange.startDate.toString())
        .format()
        .split('T')[0],
      endDate: moment(DateRange.endDate.toString())
        .format()
        .split('T')[0],
      sellingMarkID: parseInt(valuationDetails.sellingMark),
      brokerID: parseInt(valuationDetails.broker),
      gradeTypeID: parseInt(valuationDetails.typeID)
    };

    const routeData = await services.getValuationReportDetails(model);

    getSelectedDropdownValuesForReport(model);


    if (routeData.statusCode == 'Success' && routeData.data != null) {
      const rdata = routeData.data;
      calTotal(routeData.data);

      let total = 0;
      rdata.forEach(x => {
        total += (x.netAmount);
      });

      rdata.forEach(x => {
        x.totalPercentage = ((x.netAmount / total) * 100)
      });

      setValuationData(rdata);
      if (routeData.data.length == 0) {
        alert.error("No records to display");
      }
    } else {
      alert.error('Error');
    }

  }

  async function calTotal(data) {
    let total = 0;
    data.forEach(element => {
      total += parseFloat(element.netAmount);
    });
    setNetAmountTotal({
      ...netAmountTotal,
      netAmount: total
    });
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Grade': x.gradeName,
          'Net Total Quantity (KG)': x.netAmount,
          'Received Value Per 1KG': x.valuePerKg,
          'Qty %': x.totalPercentage
        };
        res.push(vr);
      });
      var vr = {
        'Grade': "Grand Total",
        'Net Total Quantity (KG)': netAmountTotal.netAmount
      }
      res.push(vr);
    }

    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(valuationData);
    var settings = {
      sheetName: 'Valuation Report',
      fileName: 'Valuation' + ' ' + 'Report' + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName + ' - ' + selectedSearchValues.endDate + ' - ' + selectedSearchValues.endDate,
      writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    let dataA = [
      {
        sheet: 'Valuation',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(searchForm.startDate.toString()).format().split('T')[0]
    var endDate = moment(searchForm.endDate.toString()).format().split('T')[0]
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: factories[searchForm.factoryID],
      groupName: groups[searchForm.groupID],
      startDate: [startDate],
      endDate: [endDate]
    })
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setValuationDetails({
      ...valuationDetails,
      [e.target.name]: value
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: valuationDetails.groupID,
              factoryID: valuationDetails.factoryID,
              date: valuationDetails.date
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Factory is required')
                .min('1', 'Factory is required'),
              date: Yup.date().required('Date is required')
            })}
            onSubmit={() => trackPromise(GetDetails())}
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
                              value={valuationDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
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
                              size='small'
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={valuationDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink>Date *</InputLabel>
                            <Button
                              aria-describedby={id}
                              variant="contained"
                              fullWidth
                              size='medium'
                              color="primary"
                              onClick={handleClickPop}
                              endIcon={<EventIcon />}
                            >
                              {DateRange.startDate.toLocaleDateString() +
                                ' - ' +
                                DateRange.endDate.toLocaleDateString()}
                            </Button>
                            <Popover
                              id={id}
                              open={open}
                              anchorEl={anchorEl}
                              onClose={handleClose}
                              anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'left'
                              }}
                              transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left'
                              }}
                            >
                              <DateRangeSelectorComponent
                                setDateRange={setDateRange}
                                handleClose={handleClose}
                              />
                            </Popover>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="typeID">
                              Grade Type
                            </InputLabel>

                            <TextField select
                              error={Boolean(touched.typeID && errors.typeID)}
                              fullWidth
                              helperText={touched.typeID && errors.typeID}
                              name="typeID"
                              onChange={(e) => { handleChange(e) }}
                              value={valuationDetails.typeID}
                              variant="outlined"
                              size='small'
                              id="typeID"
                            >
                              <MenuItem value={'0'}>
                                --Select Grade Type--
                              </MenuItem>
                              <MenuItem value={'1'}>Small Leafy</MenuItem>
                              <MenuItem value={'2'}>Leafy</MenuItem>
                              <MenuItem value={'3'}>Off Grade</MenuItem>
                              <MenuItem value={'4'}>Primer</MenuItem>
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="sellingMark">
                              Selling Mark
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.sellingMark && errors.sellingMark
                              )}
                              fullWidth
                              helperText={
                                touched.sellingMark && errors.sellingMark
                              }
                              name="sellingMark"
                              size='small'
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={valuationDetails.sellingMark}
                              variant="outlined"
                              id="sellingMark"
                            >
                              <MenuItem value={'0'}>
                                ---Select Selling Mark---
                              </MenuItem>

                              {generateDropDownMenu(sellingMarks)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="broker">
                              Broker
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.broker && errors.broker)}
                              fullWidth
                              helperText={touched.broker && errors.broker}
                              name="broker"
                              size='small'
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={valuationDetails.broker}
                              variant="outlined"
                              id="broker"
                            >
                              <MenuItem value={'0'}>
                                ---Select Broker---
                              </MenuItem>
                              {generateDropDownMenu(brokers)}
                            </TextField>
                          </Grid>
                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                onClick={() => trackPromise(GetDetails())}
                                size='small'
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                        <br />
                        <Box minWidth={1050}>
                          {valuationData.length > 0 ?
                            <TableContainer >
                              <Table aria-label="caption table">
                                <TableHead>
                                  <TableRow>
                                    <TableCell align={'center'}>Grade</TableCell>
                                    <TableCell align={'center'}>Net Total Quantity (KG)</TableCell>
                                    <TableCell align={'center'}>Received Value Per 1KG</TableCell>
                                    <TableCell align={'center'}>Qty %</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {valuationData.map((data, index) => (
                                    <TableRow key={index}>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.gradeName}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {(parseFloat(data.netAmount)).toFixed(2)}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {(parseFloat(data.valuePerKg)).toFixed(2)}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {(data.totalPercentage).toFixed(2) + '%'}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                                <TableRow>
                                  <TableCell align={'center'}><b>Grand Total</b></TableCell>
                                  <TableCell align={'center'} component="th" scope="row">
                                    <b>{(parseFloat(netAmountTotal.netAmount)).toFixed(2)} </b>
                                  </TableCell>

                                </TableRow>
                              </Table>
                            </TableContainer> : null}
                        </Box>
                      </CardContent>

                      {valuationData.length > 0 ? (
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
                          <div>&nbsp;</div>
                          <ReactToPrint
                            documentTitle={'Valuation Report'}
                            trigger={() => (
                              <Button
                                color="primary"
                                id="btnCancel"
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
                              valuationData={valuationData}
                              searchData={selectedSearchValues}
                              netAmountTotal={netAmountTotal}
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

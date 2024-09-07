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
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table
} from '@material-ui/core';
import {
  startOfMonth,
  endOfMonth,
  addMonths,
} from 'date-fns';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import { useAlert } from "react-alert";
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';

const useStyles = makeStyles((theme) => ({
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
    backgroundColor: "red",
  },
  colorRecordAndNew: {
    backgroundColor: "#FFBE00"
  },
  colorRecord: {
    backgroundColor: "green",
  }



}));

const screenCode = 'ROUTESUMMARYREPORT';

export default function RouteSummaryReport(props) {
  const [title, setTitle] = useState("Route Summary Report")
  const classes = useStyles();
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(0);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [routeSummaryData, setRouteSummaryData] = useState([]);
  const [routeSummaryDetails, setRouteSummaryDetails] = useState({
    groupID: '0',
    factoryID: '0',
    date: new Date().toISOString().substring(0, 10)
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [csvHeaders, SetCsvHeaders] = useState([])
  const componentRef = useRef();
  const navigate = useNavigate();
  const alert = useAlert();
  const [routeSummaryTotal, setRouteSummaryTotal] = useState({
    registered: 0,
    dealer: 0,
    supplier: 0,
    estate: 0,
    customerCountForLastMonth: 0,
    targetCrop: 0,
    cropAmountForLastMonth: 0,
    lastThreeMonthAvg: 0
  });

  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    date: '',
  })

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };


  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [routeSummaryDetails.groupID]);



  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWROUTESUMMARYREPORT');



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

    setRouteSummaryDetails({
      ...routeSummaryDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }
  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(routeSummaryDetails.groupID);
    setFactories(factory);
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  async function GetDetails() {
    let model = {
      groupID: parseInt(routeSummaryDetails.groupID),
      factoryID: parseInt(routeSummaryDetails.factoryID),
      startDate: startOfMonth(addMonths(new Date(routeSummaryDetails.date), -1)),
      endDate: endOfMonth(addMonths(new Date(routeSummaryDetails.date), -1))
    }
    getSelectedDropdownValuesForReport(model);
    const routeData = await services.GetRouteSummaryDetails(model);
    if (routeData.statusCode == "Success" && routeData.data != null) {
      setRouteSummaryData(routeData.data);
      calTotal(routeData.data);
    }
    else {
      alert.error("Error");
    }
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          Route: x.routeName,
          RouteCode: x.routeCode,
          Registred: x.registered,
          Dealers: x.dealer,
          Small: x.supplier,
          Estates: x.estate,
          ActiveLastMonth: x.customerCountForLastMonth,
          Target: parseInt(x.targetCrop).toLocaleString('en-US'),
          LastMonth: x.cropAmountForLastMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          Last3MonthAvg: x.lastThreeMonthAvg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
        res.push(vr);
      });
      res.push({})

      var vr = {
        Route: "Total",
        RouteCode: "",
        Registred: routeSummaryTotal.registered,
        Dealers: routeSummaryTotal.dealer,
        Small: routeSummaryTotal.supplier,
        Estates: routeSummaryTotal.estate,
        ActiveLastMonth: routeSummaryTotal.customerCountForLastMonth,
        Target: routeSummaryTotal.targetCrop.toLocaleString('en-US'),
        LastMonth: routeSummaryTotal.cropAmountForLastMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        Last3MonthAvg: routeSummaryTotal.lastThreeMonthAvg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
      res.push(vr);

      res.push({});

      var vr = {
        Route: "Group :" + selectedSearchValues.groupName,
        RouteCode: "Factory :" + selectedSearchValues.factoryName,
        Registred: "Date :" + routeSummaryDetails.date
      }
      res.push(vr);
    }
    return res;
  }


  async function createFile() {

    var file = await createDataForExcel(routeSummaryData);
    var settings = {
      sheetName: 'Route Summary Report',
      fileName: 'Route Summary Report  ' + selectedSearchValues.factoryName + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.date,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Route Summary Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]

    xlsx(dataA, settings);
  }

  function calTotal(data) {
    let registeredSum = 0;
    let dealerSum = 0;
    let supplierSum = 0;
    let estateSum = 0;
    let customerCountForLastMonthSum = 0;
    let targetCropSum = 0;
    let cropAmountForLastMonthSum = 0;
    let last3MonthAvgSum = 0;
    data.forEach(element => {
      registeredSum += parseFloat(element.registered);
      dealerSum += parseFloat(element.dealer)
      supplierSum += parseFloat(element.supplier);
      estateSum += parseFloat(element.estate)
      customerCountForLastMonthSum += parseFloat(element.customerCountForLastMonth);
      targetCropSum += parseFloat(element.targetCrop)
      cropAmountForLastMonthSum += parseFloat(element.cropAmountForLastMonth);
      last3MonthAvgSum += parseFloat(element.lastThreeMonthAvg);
    });
    setRouteSummaryTotal({
      ...routeSummaryTotal,
      registered: registeredSum,
      dealer: dealerSum,
      supplier: supplierSum,
      estate: estateSum,
      customerCountForLastMonth: customerCountForLastMonthSum,
      targetCrop: targetCropSum,
      cropAmountForLastMonth: cropAmountForLastMonthSum,
      lastThreeMonthAvg: last3MonthAvgSum
    });

  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    )
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setRouteSummaryDetails({
      ...routeSummaryDetails,
      [e.target.name]: value
    });

    clearTable()
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = searchForm.startDate.toLocaleDateString()
    var endDate = searchForm.endDate.toLocaleDateString()
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: groups[searchForm.groupID],
      factoryName: factories[searchForm.factoryID],
      date: routeSummaryDetails.date
    })
  }

  function clearTable() {
    setRouteSummaryData([])
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: routeSummaryDetails.groupID,
              factoryID: routeSummaryDetails.factoryID,
              date: routeSummaryDetails.date
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                date: Yup.date().required('Date is required'),
              })
            }
            onSubmit={() => trackPromise(GetDetails())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched
            }) => (
              <form onSubmit={handleSubmit}>


                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle(title)}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              size='small'
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={routeSummaryDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}

                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              size='small'
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={routeSummaryDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}

                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="date">
                              Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.date && errors.date)}
                              helperText={touched.date && errors.date}
                              fullWidth
                              size='small'
                              name="date"
                              type="date"
                              onChange={(e) => handleChange(e)}
                              value={routeSummaryDetails.date}
                              variant="outlined"
                              id="date"
                            />
                          </Grid>

                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                        <br />

                        <Box minWidth={1050}>
                          {routeSummaryData.length > 0 ?
                            <TableContainer component={Paper} >
                              <Table aria-label="caption table">
                                <TableHead>
                                  <TableRow>
                                    <TableCell align={'center'}>Route</TableCell>
                                    <TableCell align={'center'}>Route Code</TableCell>
                                    <TableCell align={'center'}>Registred</TableCell>
                                    <TableCell align={'center'}>Dealers</TableCell>
                                    <TableCell align={'center'}>Small</TableCell>
                                    <TableCell align={'center'}>Estates</TableCell>
                                    <TableCell align={'center'}>Active Last Month</TableCell>
                                    <TableCell align={'center'}>Target</TableCell>
                                    <TableCell align={'center'}>Last Month</TableCell>
                                    <TableCell align={'center'}>Last 3 Month Avg</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {routeSummaryData.slice(page * limit, page * limit + limit).map((data, index) => (
                                    <TableRow key={index}>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.routeName}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.routeCode}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.registered}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.dealer}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.supplier}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.estate}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.customerCountForLastMonth}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {parseInt(data.targetCrop).toLocaleString('en-US')}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.cropAmountForLastMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.lastThreeMonthAvg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                                <TableRow>
                                  <TableCell align={'center'}><b>Total</b></TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {routeSummaryTotal.registered} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {routeSummaryTotal.dealer} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {routeSummaryTotal.supplier} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {routeSummaryTotal.estate} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {routeSummaryTotal.customerCountForLastMonth} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {routeSummaryTotal.targetCrop.toLocaleString('en-US')} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {routeSummaryTotal.cropAmountForLastMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {routeSummaryTotal.lastThreeMonthAvg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                </TableRow>
                              </Table>
                              <TablePagination
                                component="div"
                                count={routeSummaryData.length}
                                onChangePage={handlePageChange}
                                onChangeRowsPerPage={handleLimitChange}
                                page={page}
                                rowsPerPage={limit}
                                rowsPerPageOptions={[5, 10, 25]}
                              />
                            </TableContainer> : null}
                        </Box>
                      </CardContent>

                      {routeSummaryData.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={createFile}
                          >
                            EXCEL
                          </Button>
                          <div>&nbsp;</div>
                          <ReactToPrint
                            documentTitle={"Route Summary Report"}
                            trigger={() => <Button
                              color="primary"
                              id="btnCancel"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                            >
                              PDF
                            </Button>}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF ref={componentRef} routeSummaryData={routeSummaryData} routeSummaryTotal={routeSummaryTotal}
                              searchData={selectedSearchValues} />
                          </div>
                        </Box> : null}

                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  )

}

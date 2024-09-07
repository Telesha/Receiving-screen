import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import TablePagination from '@material-ui/core/TablePagination';
import { LoadingComponent } from '../../../../utils/newLoader';

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
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecord: {
    backgroundColor: "green",
  },

}));

const screenCode = 'DISPATCHANDSALESLEDGER';

export default function DispatchAndSalesLedgerReport(props) {
  const [title, setTitle] = useState("Dispatch & Sales Ledger Report");
  const classes = useStyles();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [dispatchSalesDetail, setDispatchSalesDetail] = useState({
    groupID: 0,
    factoryID: 0,
    brokerID: 0,
    fromDate: new Date().toISOString().substring(0, 10),
    toDate: new Date().toISOString().substring(0, 10)
  });
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [sellingMarks, setSellingMarks] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [dispatchSalesData, setDispatchSalesData] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    brokerName: "0",
    todate: "",
    fromdate: ""
  })
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    trackPromise(
      getPermission()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [dispatchSalesDetail.groupID]);

  useEffect(() => {
    if (dispatchSalesDetail.factoryID !== 0) {
      trackPromise(
        getBrokersForDropdown(),
        getSellingMarksForDropdown(),
        getVehiclesForDropdown()
      )
    }
  }, [dispatchSalesDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDISPATCHANDSALESLEDGER');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
    });

    setDispatchSalesDetail({
      ...dispatchSalesDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
    trackPromise(getGroupsForDropdown());
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(dispatchSalesDetail.groupID);
    setFactoryList(factories);
  }

  async function getBrokersForDropdown() {
    const brokers = await services.GetBrokerList(dispatchSalesDetail.groupID, dispatchSalesDetail.factoryID);
    setBrokers(brokers);
  }

  async function getSellingMarksForDropdown() {
    const sellingMarks = await services.GetSellingMarkList(dispatchSalesDetail.groupID, dispatchSalesDetail.factoryID);
    setSellingMarks(sellingMarks);
  }

  async function getVehiclesForDropdown() {
    const vehicles = await services.GetVehicleList(dispatchSalesDetail.groupID, dispatchSalesDetail.factoryID);
    setVehicles(vehicles);
  }

  async function GetDetails() {
    let model = {
      factoryID: dispatchSalesDetail.factoryID,
      brokerID: parseInt(dispatchSalesDetail.brokerID),
      fromDate: dispatchSalesDetail.fromDate,
      toDate: dispatchSalesDetail.toDate
    }
    const response = await services.GetDispatchAndSalesLedgerReportDetails(model);
    if (response.statusCode == 'Success' && response.data.length !== null) {
      response.data.forEach(x => {
        x.dateofDispatched = x.dateofDispatched.split('T')[0]
        x.sellingDate = x.sellingDate.split('T')[0]
        x.sellingMarkID = sellingMarks[x.sellingMarkID]
        x.brokerID = brokers[x.brokerID]
        x.vehicleID = vehicles[x.vehicleID]
      })
      setDispatchSalesData(response.data)
      if (response.data.length == 0) {
        alert.error('No records to display');
      }  
    }
    getSelectedDropdownValuesForReport(dispatchSalesDetail.groupID, dispatchSalesDetail.factoryID, dispatchSalesDetail.brokerID, dispatchSalesDetail.fromDate, dispatchSalesDetail.toDate)
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'InvoiceNo': x.invoiceNo,
          'Dispatch Date': x.dateofDispatched,
          'SellingMark': x.sellingMarkID,
          'Grade': x.gradeName,
          'PackWeight(Kg)': x.packWeight,
          'NoOfBags': x.numberOfBags,
          'GrossWeight(Kg)': x.grossQuantity,
          'SampleAllowance': x.sampleQuantity,
          'NetWeight(Kg)': x.netQuantity,
          'Vehicle No': x.vehicleID,
          'InvoiceStatus': x.statusID,
          'LotNo': x.lotNumber,
          'SaleNo': x.salesNumber,
          'SaleDate': x.sellingDate,
          'ValuationPrice': x.value,
          'SoldPrice': x.salesRate,
          'Broker': x.brokerID,
          'Buyer': x.buyerName,
        };
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(dispatchSalesData);

    var settings = {
      sheetName: 'Dispatch & Sales Ledger Report',
      fileName: 'Dispatch & Sales Ledger Report - ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName + ' ',
      writeOptions: {}
    }

    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'Dispatch & Sales Ledger Report',
        columns: csvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  function getSelectedDropdownValuesForReport(groupID, factoryID, brokerID, fromDate, toDate) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[groupID],
      factoryName: FactoryList[factoryID],
      brokerName: brokers[brokerID],
      fromdate: fromDate,
      todate: toDate
    })
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setDispatchSalesDetail({
      ...dispatchSalesDetail,
      [e.target.name]: value
    });
    setDispatchSalesData([]);
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

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: dispatchSalesDetail.groupID,
              factoryID: dispatchSalesDetail.factoryID,
              brokerID: dispatchSalesDetail.brokerID,
              fromDate: dispatchSalesDetail.fromDate,
              toDate: dispatchSalesDetail.toDate
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                brokerID: Yup.number(),
                fromDate: Yup.string().required('Select a date'),
                toDate: Yup.string().required('Select a date'),
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
                          <Grid item md={4} xs={12}>
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
                              value={dispatchSalesDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
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
                              value={dispatchSalesDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
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
                              value={dispatchSalesDetail.brokerID}
                              variant="outlined"
                              id="brokerID"
                              size='small'
                            >
                              <MenuItem value={"0"}>--All Broker--</MenuItem>
                              {generateDropDownMenu(brokers)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fromDate">
                              From Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fromDate && errors.fromDate)}
                              fullWidth
                              helperText={touched.fromDate && errors.fromDate}
                              size='small'
                              name="fromDate"
                              type="date"
                              onChange={(e) => handleChange(e)}
                              value={dispatchSalesDetail.fromDate}
                              variant="outlined"
                              id="fromDate"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="toDate">
                              To Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.toDate && errors.toDate)}
                              fullWidth
                              helperText={touched.toDate && errors.toDate}
                              size='small'
                              name="toDate"
                              type="date"
                              onChange={(e) => handleChange(e)}
                              value={dispatchSalesDetail.toDate}
                              variant="outlined"
                              id="toDate"
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
                      </CardContent>
                      <br>
                      </br>
                      <br>
                      </br>
                      <Divider />
                      <Box minWidth={1050}>
                        {dispatchSalesData.length > 0 ?
                          <TableContainer >
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Invoice No</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Dispatch Date</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Selling Mark</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Grade</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Pack Weight</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>No of Bags</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Gross Weight</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Sample Allowance</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Net Weight</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Vehicle No</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Invoice Status</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Lot No</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Sale No</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Sale Date</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Valuation Price</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Sold Price</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Broker</TableCell>
                                  <TableCell align={'center'} style={{ fontWeight: "bold" }}>Buyer</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {dispatchSalesData.slice(page * limit, page * limit + limit).map((data, index) => (
                                  <TableRow key={index}>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.invoiceNo}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.dateofDispatched}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.sellingMarkID}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.gradeName}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.packWeight}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.numberOfBags}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.grossQuantity}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.sampleQuantity}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.netQuantity}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.vehicleID}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.statusID}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.lotNumber}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.salesNumber}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.sellingDate}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.value}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.salesRate}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.brokerID}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.buyerName}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <TablePagination
                              component="div"
                              count={dispatchSalesData.length}
                              onChangePage={handlePageChange}
                              onChangeRowsPerPage={handleLimitChange}
                              page={page}
                              rowsPerPage={limit}
                              rowsPerPageOptions={[5, 10, 25]}
                            />
                          </TableContainer>
                          : null}
                      </Box>
                      {dispatchSalesData.length > 0 ?
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

                          <ReactToPrint
                            documentTitle={"Dispatch & Sales Ledger Report"}
                            trigger={() => <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                            >
                              PDF
                            </Button>}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF ref={componentRef}
                              dispatchSalesData={dispatchSalesData} searchData={selectedSearchValues}
                            />
                          </div>
                        </Box>
                        : null}
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

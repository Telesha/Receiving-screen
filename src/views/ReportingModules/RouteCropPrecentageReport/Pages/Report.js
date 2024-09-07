import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import moment from 'moment';

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

const screenCode = 'ROUTECROPPERCENTAGEREPORT';

export default function RouteCropPercentageReport(props) {
  const [title, setTitle] = useState("Route Crop Percentage Report");
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routeCropDetail, setRouteCropDetail] = useState({
    groupID: 0,
    factoryID: 0,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date().toISOString().substring(0, 10)
  });
  const [cropPrecentageData, setCropPrecentagerData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const [csvHeaders, SetCsvHeaders] = useState([])
  const componentRef = useRef();
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    startDate: '',
    endDate: ''
  })
  const [totalAmount, setTotalAmount] = useState({
    supplierTotal: 0,
    dealersTotal: 0,
    estateTotal: 0,
  });
  const [totalAmountForPer, setTotalAmountForPer] = useState(0);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClickPop = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  useEffect(() => {
    trackPromise(
      getPermission()
    );
    trackPromise(
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [routeCropDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWROUTECROPPERCENTAGEREPORT');

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

    setRouteCropDetail({
      ...routeCropDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(routeCropDetail.groupID);
    setFactoryList(factories);
  }

  async function GetCropDetails() {
    let supplierTotal = 0;
    let estateTotal = 0;
    let dealersTotal = 0;
    let totalForPer = 0;
    let model = {
      groupID: parseInt(routeCropDetail.groupID),
      factoryID: parseInt(routeCropDetail.factoryID),
      startDate: moment(routeCropDetail.startDate.toString()).format().split('T')[0],
      endDate: moment(routeCropDetail.endDate.toString()).format().split('T')[0],
    }

    const routeCropData = await services.GetRouteCropPercentage(model);

    getSelectedDropdownValuesForReport(model);

    if (routeCropData.statusCode == "Success" && routeCropData.data != null) {

      for (const item of routeCropData.data) {
        item.totalqty = item.supplierQty + item.estateQty + item.dealerQty
        item.smallpercentage = ((item.supplierQty / item.totalqty) * 100);
        item.dealerspercentage = ((item.dealerQty / item.totalqty) * 100);
        item.estatepercentage = ((item.estateQty / item.totalqty) * 100);
      }
      setCropPrecentagerData(routeCropData.data);
      totalRowCal(routeCropData.data)
      createDataForExcel(routeCropData.data);
      if (routeCropData.data.length == 0) {
        alert.error("NO RECORDS TO DISPLAY");
      }
    }
    else {
      alert.error("Error");
    }
  }

  async function totalRowCal(data) {
    let supplierTotal = 0;
    let estateTotal = 0;
    let dealersTotal = 0;
    let totalForPer = 0;
    let estatepercentage = 0;
    let supplierpercentage = 0;
    let dealerpercentage = 0;

    data.forEach(x => {
      supplierTotal = supplierTotal + x.supplierQty;
      estateTotal = estateTotal + x.estateQty;
      dealersTotal = dealersTotal + x.dealerQty;
      totalForPer = supplierTotal + estateTotal + dealersTotal
      estatepercentage = ((estateTotal / totalForPer) * 100);
      supplierpercentage = ((supplierTotal / totalForPer) * 100);
      dealerpercentage = ((dealersTotal / totalForPer) * 100);
    });
    setTotalAmount({
      ...totalAmount,
      supplierTotal: supplierpercentage.toFixed(2),
      estateTotal: estatepercentage.toFixed(2),
      dealersTotal: dealerpercentage.toFixed(2)
    });
  }

  async function createDataForExcel(array) {

    let supplierTotal = 0;
    let estateTotal = 0;
    let dealersTotal = 0;
    let totalForPer = 0;
    var res = [];
    for (const item of array) {
      item.totalqty = item.supplierQty + item.estateQty + item.dealerQty
      item.smallpercentage = ((item.supplierQty / item.totalqty) * 100);
      item.dealerspercentage = ((item.dealerQty / item.totalqty) * 100);
      item.estatepercentage = ((item.estateQty / item.totalqty) * 100);
    }

    totalForPer = supplierTotal + estateTotal + dealersTotal;
    if (array != null) {
      array.map(x => {
        var vr = {
          'Route Name': x.routeName,
          'Route Code': x.routeCode,
          'Dealers Qty': x.dealerQty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          'Dealers Per (%)': x.dealerspercentage.toFixed(2),
          'Small Qty': x.supplierQty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          'Small Per (%)': x.smallpercentage.toFixed(2),
          'Estates Qty': x.estateQty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          'Estates Per (%)': x.estatepercentage.toFixed(2),
        }
        res.push(vr);
      });
      var vr = {
        'Route Name': 'Percentage %',
        'Route Code': '',
        'Dealers Qty': '',
        'Dealers Per (%)': totalAmount.dealersTotal + '%',
        'Small Qty': '',
        'Small Per (%)': totalAmount.supplierTotal + '%',
        'Estates Qty': '',
        'Estates Per (%)': totalAmount.estateTotal + '%',
      }
      res.push(vr);
    }
    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(cropPrecentageData);
    var settings = {
      sheetName: 'Route Crop Percentage Report',
      fileName: 'Route Crop Percentage Report - ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName + ' '
        + selectedSearchValues.startDate + ' - ' + selectedSearchValues.endDate,
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Route Crop Percentage Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
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
    setRouteCropDetail({
      ...routeCropDetail,
      [e.target.name]: value
    });
    setCropPrecentagerData([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(searchForm.startDate.toString()).format().split('T')[0]
    var endDate = moment(searchForm.endDate.toString()).format().split('T')[0]
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: FactoryList[searchForm.factoryID],
      groupName: GroupList[searchForm.groupID],
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
    )
  }

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: routeCropDetail.groupID,
              factoryID: routeCropDetail.factoryID,
              startDate: routeCropDetail.startDate,
              endDate: routeCropDetail.endDate
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                startDate: Yup.string(),
                endDate: Yup.string(),
              })
            }
            onSubmit={() => trackPromise(GetCropDetails())}
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
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={routeCropDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={routeCropDetail.factoryID}
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
                            <InputLabel shrink id="startDate">
                              From Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="startDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={routeCropDetail.startDate}
                              variant="outlined"
                              id="startDate"
                              size='small'
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="endDate">
                              To Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="endDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={routeCropDetail.endDate}
                              variant="outlined"
                              id="endDate"
                              size='small'
                            />
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            size='small'
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {cropPrecentageData.length > 0 ?
                          <TableContainer >
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align={'center'}></TableCell>
                                  <TableCell align={'center'}></TableCell>
                                  <TableCell align={'center'} style={{ paddingLeft: '40px' }}>Dealers</TableCell>
                                  <TableCell align={'center'}></TableCell>
                                  <TableCell align={'center'} style={{ paddingLeft: '40px' }}>Small</TableCell>
                                  <TableCell align={'center'}></TableCell>
                                  <TableCell align={'center'} style={{ paddingLeft: '40px' }}>Estates</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell align={'center'}>Route</TableCell>
                                  <TableCell align={'center'}>Route Code</TableCell>
                                  <TableCell align={'left'}>Qty (KG)</TableCell>
                                  <TableCell align={'left'}>Per (%)</TableCell>
                                  <TableCell align={'left'}>Qty (KG)</TableCell>
                                  <TableCell align={'left'}>Per (%)</TableCell>
                                  <TableCell align={'left'}>Qty (KG)</TableCell>
                                  <TableCell align={'left'}>Per (%)</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {cropPrecentageData.map((data, index) => (
                                  <TableRow key={index}>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.routeName}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.routeCode}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.dealerQty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.dealerspercentage.toFixed(2) + '%'}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.supplierQty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.smallpercentage.toFixed(2) + '%'}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.estateQty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.estatepercentage.toFixed(2) + '%'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableRow>
                                <TableCell align={'center'}><b>Percentage %</b></TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {totalAmount.dealersTotal + '%'} </b>
                                </TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {totalAmount.supplierTotal + '%'} </b>
                                </TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {totalAmount.estateTotal + '%'} </b>
                                </TableCell>
                              </TableRow>
                            </Table>
                          </TableContainer> : null}
                      </Box>
                      {cropPrecentageData.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={createFile}
                            size='small'
                          >
                            EXCEL
                          </Button>
                          <ReactToPrint
                            documentTitle={"Route Crop Percentage Report"}
                            trigger={() => <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                              size='small'
                            >
                              PDF
                            </Button>}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF ref={componentRef}
                              cropPrecentageData={cropPrecentageData} searchData={selectedSearchValues}
                              total={totalAmount} totForPer={totalAmountForPer} data={cropPrecentageData}
                            />
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
  );
}

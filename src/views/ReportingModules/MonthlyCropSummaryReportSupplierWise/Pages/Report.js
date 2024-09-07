import React, { useState, Fragment, useRef } from 'react';
import {
  Box,
  Card,
  Grid,
  CardHeader,
  makeStyles,
  CardContent,
  InputLabel,
  TextField,
  MenuItem,
  Button,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination
} from '@material-ui/core';
import { LoadingComponent } from 'src/utils/newLoader';
import Page from 'src/components/Page';
import { Container } from '@material-ui/core';
import { Formik } from 'formik';
import PerfectScrollbar from 'react-perfect-scrollbar';
import * as Yup from "yup";
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { useEffect } from 'react';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../../utils/permissionAuth';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import tokenService from '../../../../utils/tokenDecoder';
import { useAlert } from 'react-alert';
import xlsx from 'json-as-xlsx';
import CreatePDF from './CreatePDF';
import ReactToPrint from "react-to-print";

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
  colorRecordAndNew: {
    backgroundColor: "#FFBE00"
  },
  colorRecord: {
    backgroundColor: "green",
  }
}));

const screenCode = "MONTHLYCROPSUMMARYREPORTSUPPLIERWISE";

export default function MonthlyCropSummaryReportSupplierWise(props) {

  const classes = useStyles();
  const [title, setTitle] = useState("Monthly Crop Summary Report - Supplier Wise");
  const [groupList, setGroupList] = useState([])
  const [operationEntityList, setOperationEntityList] = useState([])
  const [collectionPointList, setCollectionPointList] = useState([])
  const [leafTypeList, setLeafTypeList] = useState([])
  const [supplierReportData, setSupplierReportData] = useState([])
  const [csvHeaders, SetCsvHeaders] = useState([])
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [leafweightTotal, setLeafweightTotal] = useState({
    january: 0,
    february: 0,
    march: 0,
    april: 0,
    may: 0,
    june: 0,
    july: 0,
    august: 0,
    september: 0,
    october: 0,
    november: 0,
    december: 0
  });
  const [allTotal, setAllTotal] = useState(0);
  const [permissionList, setPermissionList] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    route: '',
    year: '',
    leafType: ''
  });
  const [approveList, setApproveList] = useState({
    groupID: '0',
    factoryID: '0',
    collectionPointID: '0',
    year: new Date().toISOString().split('-')[0],
    ProductID: '1',
    collectionTypeID: '0',
  })

  useEffect(() => {
    getPermissions();
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getOperationEntityForDropDown()
    );
  }, [approveList.groupID]);

  useEffect(() => {
    trackPromise(
      getLeafTypeForDropDown(),
      getCollectionPointForDropDown()
    );
    setApproveList({
      ...approveList,
      collectionPointID: 0,
      collectionTypeID: 0
    })
  }, [approveList.factoryID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWMONTHLYCROPSUMMARYREPORTSUPPLIERWISE');

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissionList({
      isGroupFilterEnabled: isGroupFilterEnabled != undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled != undefined
    })

    setApproveList({
      ...approveList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groupList = await services.getAllGroupsForDropDown();
    setGroupList(groupList);
  }

  async function getOperationEntityForDropDown() {
    const operationEntityList = await services.getOperationEntityForDropDown(approveList.groupID);
    setOperationEntityList(operationEntityList)
  }

  async function getCollectionPointForDropDown() {
    const collectionPointList = await services.getCollectionPointForDropDown(approveList.factoryID);
    setCollectionPointList(collectionPointList);
  }

  async function getLeafTypeForDropDown() {
    const leafTypeList = await services.getLeafTypeForDropDown(approveList.factoryID);
    setLeafTypeList(leafTypeList);
  }

  async function GetDetails() {
    let groupID = parseInt(approveList.groupID);
    let factoryID = parseInt(approveList.factoryID);
    let year = parseInt(approveList.year);
    let collectionTypeID = parseInt(approveList.collectionTypeID);
    let collectionPointID = parseInt(approveList.collectionPointID);

    const supplierReport = await services.getSupplierReportDetails(groupID, factoryID, year, collectionTypeID, collectionPointID);
    if (supplierReport.statusCode == 'Success' && supplierReport.data.length > 0) {
      setSupplierReportData(supplierReport.data)
      calTotal(supplierReport.data);
      getSelectedDropdownValuesForReport(groupID, factoryID, collectionPointID, year, collectionTypeID);
    }
    else {
      setSupplierReportData([]);
      alert.error("No record to display");
    }
  }

  function getSelectedDropdownValuesForReport(groupID, factoryID, route, year, leafType) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: operationEntityList[factoryID],
      groupName: groupList[groupID],
      route: route == 0 ? 0 : collectionPointList[route],
      year: year,
      leafType: leafType == 0 ? 0 : leafTypeList[leafType]
    })
  }

  function calTotal(data) {

    let januarySum = 0;
    let februarySum = 0;
    let marchSum = 0;
    let aprilSum = 0;
    let maySum = 0;
    let juneSum = 0;
    let julySum = 0;
    let augustSum = 0;
    let septemberSum = 0;
    let octoberSum = 0;
    let novemberSum = 0;
    let decemberSum = 0;
    let tot = 0;

    data.forEach(element => {
      januarySum += parseFloat(element.january);
      februarySum += parseFloat(element.february)
      marchSum += parseFloat(element.march);
      aprilSum += parseFloat(element.april)
      maySum += parseFloat(element.may);
      juneSum += parseFloat(element.june)
      julySum += parseFloat(element.july);
      augustSum += parseFloat(element.august);
      septemberSum += parseFloat(element.september);
      octoberSum += parseFloat(element.october)
      novemberSum += parseFloat(element.november);
      decemberSum += parseFloat(element.december);
    });

    setLeafweightTotal({
      ...leafweightTotal,
      january: januarySum,
      february: februarySum,
      march: marchSum,
      april: aprilSum,
      may: maySum,
      june: juneSum,
      july: julySum,
      august: augustSum,
      september: septemberSum,
      october: octoberSum,
      november: novemberSum,
      december: decemberSum
    });

    tot = (januarySum + februarySum + marchSum + aprilSum + maySum + juneSum + julySum + augustSum + septemberSum + octoberSum + novemberSum + decemberSum);
    setAllTotal(tot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items;
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
    setApproveList({
      ...approveList,
      [e.target.name]: value
    });
    setSupplierReportData([]);
  }

  function handleDateChange(date) {
    var year = date.getUTCFullYear();
    setApproveList({
      ...approveList,
      year: year.toString()
    })
    setSupplierReportData([]);
  }
  function calclateTotalWeight(data) {
    let totalWeight = (data.january + data.february + data.march + data.april + data.may + data.june + data.july +
      data.august + data.september + data.october + data.november + data.december);
    totalWeight = totalWeight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return totalWeight;
  }

  function calclateAllTotalWeight(leafweightTotal) {
    let allTotal = (leafweightTotal.january + leafweightTotal.february + leafweightTotal.march + leafweightTotal.april + leafweightTotal.may + leafweightTotal.june + leafweightTotal.july +
      leafweightTotal.august + leafweightTotal.september + leafweightTotal.october + leafweightTotal.november + leafweightTotal.december);
    allTotal = allTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return allTotal;
  }


  function clearData() {
    setApproveList({
      ...approveList,
      groupID: '0',
      factoryID: '0',
      collectionPointID: '0',
      year: Date(),
      ProductID: '0',
      collectionTypeID: '0',
    })
    setSupplierReportData([]);
  }

  async function createFile() {
    var file = await createDataForExcel(supplierReportData);
    var settings = {
      sheetName: 'Monthly Crop Summary Report - Supplier Wise',
      fileName: 'Monthly Crop Summary Report - Supplier Wise ' + ' ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName,
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

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          RegNo: x.registrationNumber,
          Supplier: x.supplierName,
          January: x.january.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          February: x.february.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          March: x.march.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          April: x.april.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          May: x.may.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          June: x.june.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          July: x.july.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          August: x.august.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          September: x.september.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          October: x.october.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          November: x.november.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          December: x.december.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          Total: (x.january + x.february + x.march + x.april + x.may + x.june + x.july + x.august
            + x.september + x.october + x.november + x.december).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        }
        res.push(vr);

      });
      res.push({});
      var vr = {
        'RegNo': "Total",
        'January': leafweightTotal.january.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'February': leafweightTotal.february.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'March': leafweightTotal.march.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'April': leafweightTotal.april.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'May': leafweightTotal.may.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'June': leafweightTotal.june.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'July': leafweightTotal.july.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'August': leafweightTotal.august.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'September': leafweightTotal.september.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'October': leafweightTotal.october.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'November': leafweightTotal.november.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'December': leafweightTotal.december.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'Total': allTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
      res.push(vr);
      res.push({});

      var vr = {
        'RegNo': "Group :" + selectedSearchValues.groupName,
        'Supplier': "Factory :" + selectedSearchValues.factoryName,
        'January': selectedSearchValues.leafType == 0 ? 'LeafType :' + 'All LeafTypes' : 'LeafType :' + selectedSearchValues.leafType
      }
      res.push(vr);

      var pr = {
        'RegNo': selectedSearchValues.route == 0 ? 'Route :' + 'All Route' : 'Route :' + selectedSearchValues.route,
        'Supplier': "Year :" + selectedSearchValues.year
      }
      res.push(pr);
    }
    return res;
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const handleLimitChange = event => {
    setRowsPerPage(event.target.value);
  };

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: approveList.groupID,
              factoryID: approveList.factoryID,
              year: approveList.year,
            }}
            validateSchema={
              Yup.object().shape({
                groupId: Yup.number().required('Group required').min('1', 'Group Required'),
                factoryID: Yup.number().required('Factory required').min('1', 'Factory Required')
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
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id='groupID'>
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => (handleChange(e))}
                              value={approveList.groupID}
                              size="small"
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id='factoryID'>
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              value={approveList.factoryID}
                              onChange={(e) => handleChange(e)}
                              variant="outlined"
                              id="factoryID"
                              size="small"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Operation Entity--</MenuItem>
                              {generateDropDownMenu(operationEntityList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id='collectionPointID'>
                              Route
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="collectionPointID"
                              onBlur={handleBlur}
                              value={approveList.collectionPointID}
                              onChange={(e) => (handleChange(e))}
                              variant="outlined"
                              id="collectionPointID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(collectionPointList)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={8}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="inline"
                                fullWidth
                                openTo="year"
                                views={["year"]}
                                label="Year"
                                helperText="Select applicable year"
                                value={approveList.year}
                                disableFuture={true}
                                size="small"
                                onChange={(date) => handleDateChange(date)}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id='collectionTypeID'>
                              Leaf Type
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="collectionTypeID"
                              onBlur={handleBlur}
                              value={approveList.collectionTypeID}
                              onChange={(e) => (handleChange(e))}
                              variant="outlined"
                              id="collectionTypeID"
                              size="small"
                            >
                              <MenuItem value="0">--Select Leaf Type--</MenuItem>
                              {generateDropDownMenu(leafTypeList)}
                            </TextField>
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
                          <div>&nbsp;</div>
                          <Button
                            color="primary"
                            type="reset"
                            variant="outlined"
                            onClick={() => clearData()}
                          >
                            Clear
                          </Button>
                        </Box>
                        <Box minWidth={800}>
                          {supplierReportData.length > 0 ?
                            <TableContainer >
                              <Table aria-label="caption table">
                                <TableHead>
                                  <TableRow>
                                    <TableCell align={'center'}>Reg.No</TableCell>
                                    <TableCell align={'center'}>Supplier</TableCell>
                                    <TableCell align={'center'}>January</TableCell>
                                    <TableCell align={'center'}>February</TableCell>
                                    <TableCell align={'center'}>March</TableCell>
                                    <TableCell align={'center'}>April</TableCell>
                                    <TableCell align={'center'}>May</TableCell>
                                    <TableCell align={'center'}>June</TableCell>
                                    <TableCell align={'center'}>July</TableCell>
                                    <TableCell align={'center'}>August</TableCell>
                                    <TableCell align={'center'}>September</TableCell>
                                    <TableCell align={'center'}>October</TableCell>
                                    <TableCell align={'center'}>November</TableCell>
                                    <TableCell align={'center'}>December</TableCell>
                                    <TableCell align={'center'}>Total</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {supplierReportData.length > 0 ?
                                    supplierReportData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                      .map((data, index) => (

                                        <TableRow key={index}>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.registrationNumber}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.supplierName}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.january.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.february.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.march.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.april.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.may.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.june.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.july.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.august.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.september.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.october.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.november.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                            {data.december.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </TableCell>
                                          <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none", fontWeight: 'bold' }}>
                                            {calclateTotalWeight(data)}
                                          </TableCell>
                                        </TableRow>
                                      )) : null}
                                </TableBody>
                                <TableRow>
                                  <TableCell colSpan={2} align={'left'}><b>Total</b></TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {leafweightTotal.january.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {leafweightTotal.february.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {leafweightTotal.march.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {leafweightTotal.april.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {leafweightTotal.may.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {leafweightTotal.june.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {leafweightTotal.july.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {leafweightTotal.august.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {leafweightTotal.september.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {leafweightTotal.october.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {leafweightTotal.november.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {leafweightTotal.december.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {calclateAllTotalWeight(leafweightTotal)} </b>
                                  </TableCell>
                                </TableRow>
                              </Table>
                              <TablePagination
                                component="div"
                                count={supplierReportData.length}
                                onChangePage={handlePageChange}
                                onChangeRowsPerPage={handleLimitChange}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                rowsPerPageOptions={[25, 50, 100]}
                              />
                            </TableContainer> : null}
                        </Box>
                        {supplierReportData.length > 0 ?
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
                              documentTitle={"Monthly Crop Summary Report - Supplier Wise"}
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
                            {<div hidden={true}>
                              <CreatePDF ref={componentRef} supplierReportData={supplierReportData} searchData={selectedSearchValues} LeafweightTotal={leafweightTotal} AllTotal={allTotal}
                              />
                            </div>}
                          </Box> : null}
                      </CardContent>
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
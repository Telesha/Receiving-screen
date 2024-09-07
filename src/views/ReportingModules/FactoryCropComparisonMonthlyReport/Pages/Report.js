import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
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
import { DatePicker, MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';

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

const screenCode = 'FACTORYCROPCOMPARISONMONTHLYREPORT';

export default function FactoryCropComparisonMonthlyReport(props) {
  const [title, setTitle] = useState("Factory Crop Comparison Monthly Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [factoryCropDetail, setFactoryCropDetail] = useState({
    groupID: 0,
    factoryID: 0,
    year: '',
    month: ''
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    monthName: ''
  })
  const [factoryCropData, setFactoryCropData] = useState([]);
  const [prevTotalSupp, setPrevTotalSupp] = useState(0);
  const [curTotalSupp, setCurTotalSupp] = useState(0);
  const [prevTotalCrop, setPrevTotalCrop] = useState(0);
  const [curTotalCrop, setCurTotalCrop] = useState(0);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [sortingOrder, setSortingOrder] = useState("ASC");
  const [searchedData, setSearchedData] = useState('');
  const [tableFilterData, setTableFilterData] = useState([]);

  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [factoryCropDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORYCROPCOMPARISONMONTHLYREPORT');

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

    setFactoryCropDetail({
      ...factoryCropDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(factoryCropDetail.groupID);
    setFactoryList(factories);
  }

  async function GetFactoryCropDetails() {
    let prevYearTotalSup = 0;
    let curYearTotalSup = 0;
    let prevYearTotalCrop = 0;
    let curYearTotalCrop = 0;
    let model = {
      groupID: parseInt(factoryCropDetail.groupID),
      factoryID: parseInt(factoryCropDetail.factoryID),
      applicableMonth: factoryCropDetail.month === '' ? moment(new Date()).format('MM') : factoryCropDetail.month,
      applicableYear: factoryCropDetail.year === "" ? moment(new Date()).format('YYYY') : factoryCropDetail.year
    }

    getSelectedDropdownValuesForReport(model);

    const cropData = await services.GetFactoryCropDetailsForComparison(model);

    if (cropData.statusCode == "Success" && cropData.data != null) {
      setFactoryCropData(cropData.data);
      cropData.data.forEach(x => {
        prevYearTotalSup = prevYearTotalSup + parseInt(x.prevYearSupplierCount);
        curYearTotalSup = curYearTotalSup + parseInt(x.currentYearSupplierCount);
        prevYearTotalCrop = prevYearTotalCrop + parseInt(x.prevYearWeight);
        curYearTotalCrop = curYearTotalCrop + parseInt(x.currentYearWeight);
      });
      setPrevTotalSupp(prevYearTotalSup);
      setCurTotalSupp(curYearTotalSup);
      setPrevTotalCrop(prevYearTotalCrop);
      setCurTotalCrop(curYearTotalCrop);
      createDataForExcel(cropData.data);

      if (cropData.data.length == 0) {
        alert.error("No records to display");
      }
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
          'Factory Name': x.factoryName,
          'Active Supplier-PrevYear': x.prevYearSupplierCount,
          'Crop (Kg)-PrevYear': x.prevYearWeight,
          'Active Supplier-CurYear': x.currentYearSupplierCount,
          'Crop (Kg)-CurYear': x.currentYearWeight,
          'Supplier Variance': (x.currentYearSupplierCount - x.prevYearSupplierCount),
          'Crop Variance': (x.currentYearWeight - x.prevYearWeight),
        }
        res.push(vr);
      });
      var vr = {
        'Factory Name': 'Total',
        'Active Supplier-PrevYear': prevTotalSupp,
        'Crop (Kg)-PrevYear': prevTotalCrop,
        'Active Supplier-CurYear': curTotalSupp,
        'Crop (Kg)-CurYear': curTotalCrop,
        'Supplier Variance': '',
        'Crop Variance': '',
      }
      res.push(vr);
    }
    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(factoryCropData);
    var settings = {
      sheetName: 'Factory Crop Comparison Report',
      fileName: 'Factory Crop Comparison Monthly Report ' + selectedSearchValues.groupName + ' ' + ((factoryCropDetail.year === '' ? moment(new Date()).format('YYYY') : factoryCropDetail.year) - 1) + '/' + (factoryCropDetail.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName) + '-'
        + (factoryCropDetail.year === '' ? moment(new Date()).format('YYYY') : factoryCropDetail.year) + '/' + (factoryCropDetail.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName),
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Factory Crop Comparison Report',
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
    setFactoryCropDetail({
      ...factoryCropDetail,
      [e.target.name]: value
    });
    setFactoryCropData([]);
  }

  function handleDateChange(date) {
    let monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    var currentmonth = moment().format('MM');
    let monthName = monthNames[month - 1];
    setSelectedSearchValues({
      ...selectedSearchValues,
      monthName: monthName
    });
    setFactoryCropDetail({
      ...factoryCropDetail,
      month: month.toString(),
      year: year.toString()
    });

    if (selectedDate != null) {

      var prevMonth = selectedDate.getUTCMonth() + 1
      var prevyear = selectedDate.getUTCFullYear();

      if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
        setSelectedDate(date)
      }
    } else {
      setSelectedDate(date)
    }
    setFactoryCropData([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      month: searchForm.month,
      year: searchForm.year
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

  function sorting(col) {
    if (sortingOrder === "ASC") {
      const sorted = [...factoryCropData].sort((a, b) =>
        a[col].toString().toLowerCase() > b[col].toString().toLowerCase() ? 1 : -1);
      setFactoryCropData(sorted);
      setSortingOrder("DESC")
    }
    if (sortingOrder === "DESC") {
      const sorted = [...factoryCropData].sort((a, b) =>
        a[col].toString().toLowerCase() < b[col].toString().toLowerCase() ? 1 : -1);
      setFactoryCropData(sorted);
      setSortingOrder("ASC")
    }
  }

  function filterData(e) {
    if (e.target.value != "") {
      setSearchedData(e.target.value);
      const filterTable = factoryCropData.filter(o => Object.keys(o).some(k =>
        String(o[k]).toLowerCase().includes(e.target.value.toLowerCase())
      ));
      setTableFilterData([...filterTable]);
    }
    else {
      setSearchedData(e.target.value);
      setTableFilterData([...factoryCropData]);
    }
  }

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: factoryCropDetail.groupID,
              factoryID: factoryCropDetail.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
              })
            }
            onSubmit={() => trackPromise(GetFactoryCropDetails())}
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
                          <Grid item md={5} xs={8}>
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
                              value={factoryCropDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>
                          <Grid item md={5} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="inline"
                                openTo="month"
                                views={["year", "month"]}
                                label="Year and Month *"
                                helperText="Select applicable month"
                                value={selectedDate}
                                size='small'
                                onChange={(date) => handleDateChange(date)}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {factoryCropData.length > 0 ?
                          <div>
                            <Box display="flex" flexDirection="row-reverse" p={2} >
                              <Grid item md={3} xs={12} >
                                <TextField
                                  fullWidth
                                  onChange={(e) => filterData(e)}
                                  variant="outlined"
                                  size="small"
                                  placeholder='Search...'
                                />
                              </Grid>
                            </Box>
                            <TableContainer >
                              <Table aria-label="caption table">
                                <TableHead>
                                  <TableRow>
                                    <TableCell align={'center'}></TableCell>
                                    <TableCell colSpan={2} align={'center'}>{(factoryCropDetail.year === '' ? moment(new Date()).format('YYYY') : factoryCropDetail.year) - 1} /{(factoryCropDetail.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName)}</TableCell>
                                    <TableCell colSpan={2} align={'center'}>{factoryCropDetail.year === '' ? moment(new Date()).format('YYYY') : factoryCropDetail.year}/{factoryCropDetail.month === '' ? moment(new Date()).format('MMM') : selectedSearchValues.monthName}</TableCell>
                                    <TableCell align={'center'}>Supplier Variance</TableCell>
                                    <TableCell align={'center'}>Crop Varience</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell align={'center'} onClick={() => sorting("factoryName")}><Button>Factory</Button></TableCell>
                                    <TableCell align={'center'} onClick={() => sorting("prevYearSupplierCount")}><Button>Active Suppliers</Button></TableCell>
                                    <TableCell align={'center'} onClick={() => sorting("prevYearWeight")}><Button>Crop (Kg)</Button></TableCell>
                                    <TableCell align={'center'} onClick={() => sorting("currentYearSupplierCount")}><Button>Active Suppliers</Button></TableCell>
                                    <TableCell align={'center'} onClick={() => sorting("currentYearWeight")}><Button>Crop (Kg)</Button></TableCell>
                                    <TableCell align={'left'}></TableCell>
                                    <TableCell align={'left'}></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {searchedData.length > 0 ? tableFilterData.map((data, index) => (
                                    <TableRow key={index}>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.factoryName}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.prevYearSupplierCount}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.prevYearWeight}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.currentYearSupplierCount}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.currentYearWeight}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {(data.currentYearSupplierCount - data.prevYearSupplierCount)}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {data.currentYearWeight - data.prevYearWeight}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                    :
                                    factoryCropData.map((data, index) => (
                                      <TableRow key={index}>
                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {data.factoryName}
                                        </TableCell>
                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {data.prevYearSupplierCount}
                                        </TableCell>
                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {data.prevYearWeight}
                                        </TableCell>
                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {data.currentYearSupplierCount}
                                        </TableCell>
                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {data.currentYearWeight}
                                        </TableCell>
                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(data.currentYearSupplierCount - data.prevYearSupplierCount)}
                                        </TableCell>
                                        <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {data.currentYearWeight - data.prevYearWeight}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                                <TableRow>
                                  <TableCell align={'center'}><b>Total</b></TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b>{prevTotalSupp}</b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b>{prevTotalCrop}</b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {curTotalSupp} </b>
                                  </TableCell>
                                  <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                    <b> {curTotalCrop} </b>
                                  </TableCell>
                                </TableRow>
                              </Table>
                            </TableContainer>
                          </div> : null}
                      </Box>
                      {factoryCropData.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={() => createFile()}
                          >
                            EXCEL
                          </Button>

                          <ReactToPrint
                            documentTitle={"Factory Crop Comparison Monthly Report"}
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
                              searchDate={factoryCropDetail} factoryCropData={factoryCropData} prevTotalSupp={prevTotalSupp}
                              curTotalSupp={curTotalSupp} prevTotalCrop={prevTotalCrop}
                              curTotalCrop={curTotalCrop} searchData={selectedSearchValues}
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

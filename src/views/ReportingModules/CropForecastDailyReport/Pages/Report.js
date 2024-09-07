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
import moment from 'moment';
import { startOfMonth, endOfMonth, addDays } from 'date-fns';
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

const screenCode = 'CROPFORECASTDAILYREPORT';

export default function CropForecastDailyReport(props) {
  const [title, setTitle] = useState("Crop Forecast Daily Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routes, setRoutes] = useState();
  const [dailyCropDetail, setDailyCropDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    date: '',
    roundValue: 7
  });
  const [dailyCropData, setDailyCropData] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [earlyTotalAmount, setEarlyTotalAmount] = useState(0);
  const [beforeEarlyTotalAmount, setBeforeEarlyTotalAmount] = useState(0);
  const [earlyCustomerCount, setEarlyCustomerCount] = useState(0);
  const [beforeEarlyCustomerCount, setBeforeEarlyCustomerCount] = useState(0);
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
  }, [dailyCropDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID());
  }, [dailyCropDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCROPFORECASTDAILYREPORT');

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

    setDailyCropDetail({
      ...dailyCropDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(dailyCropDetail.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(dailyCropDetail.factoryID);
    setRoutes(routeList);
  }

  async function GetCropDetails() {

    let earlyRoundWeightTotal = 0;
    let earlyCustomerTotal = 0;
    let beforeEarlyRoundWeightTotal = 0;
    let beforeEarlyCustomerTotal = 0;

    let model = {
      groupID: parseInt(dailyCropDetail.groupID),
      factoryID: parseInt(dailyCropDetail.factoryID),
      routeID: parseInt(dailyCropDetail.routeID),
      earlyDate: moment(addDays(new Date(dailyCropDetail.date), -(dailyCropDetail.roundValue))).format().split('T')[0],
      beforeEarlyDate: moment(addDays(new Date(dailyCropDetail.date), -(dailyCropDetail.roundValue * 2))).format().split('T')[0]
    }    

    const cropData = await services.GetDailyForecastDetails(model); 
    getSelectedDropdownValuesForReport(model);

    if (cropData.statusCode == "Success" && cropData.data != null) {
      setDailyCropData(cropData.data);

      cropData.data.forEach(x => {
        earlyRoundWeightTotal = earlyRoundWeightTotal + parseFloat(x.earlyRoundWeight)
        earlyCustomerTotal = earlyCustomerTotal + parseFloat(x.earlyRoundCount)
        beforeEarlyRoundWeightTotal = beforeEarlyRoundWeightTotal + parseFloat(x.beforeEarlyRoundWeight)
        beforeEarlyCustomerTotal = beforeEarlyCustomerTotal + parseFloat(x.beforeEarlyRoundCount)
      });
      setEarlyTotalAmount(earlyRoundWeightTotal);
      setBeforeEarlyTotalAmount(beforeEarlyRoundWeightTotal);
      setEarlyCustomerCount(earlyCustomerTotal);
      setBeforeEarlyCustomerCount(beforeEarlyCustomerTotal);
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
          'Route Name': x.routeName,
          'Early Round Date': moment(addDays(new Date(dailyCropDetail.date), -(dailyCropDetail.roundValue))).format().split('T')[0],
          'Early Round Crop Amount (KG)': x.earlyRoundWeight,
          'Early Round Customer Count': x.earlyRoundCount,
          'Before Early Round Date': moment(addDays(new Date(dailyCropDetail.date), -(dailyCropDetail.roundValue * 2))).format().split('T')[0],
          'Before Early Round Crop Amount (KG)': x.beforeEarlyRoundWeight,
          'Before Early Round Customer Count': x.beforeEarlyRoundCount,
        }
        res.push(vr);
      });
      var vr = {
        'Route Name': "Total",
        'Early Round Date': '',
        'Early Round Crop Amount (KG)': earlyTotalAmount,
        'Early Round Customer Count': earlyCustomerCount,
        'Before Early Round Date': '',
        'Before Early Round Crop Amount (KG)': beforeEarlyTotalAmount,
        'Before Early Round Customer Count': beforeEarlyCustomerCount,
      }
      res.push(vr);
    }

    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(dailyCropData);
    var settings = {
      sheetName: 'Crop Forecast Daily Report',
      fileName: 'Crop Forecast Daily Report - ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Crop Forecast Daily Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]

    xlsx(dataA, settings);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
    });
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
    setDailyCropDetail({
      ...dailyCropDetail,
      [e.target.name]: value
    });
    setDailyCropData([]);
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
              groupID: dailyCropDetail.groupID,
              factoryID: dailyCropDetail.factoryID,
              date: dailyCropDetail.date,
              roundValue: dailyCropDetail.roundValue
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                date: Yup.string().required('Select a date'),
                roundValue: Yup.number().typeError('Round value must be a number').test(
                  'is-decimal',
                  'Decimals are not allowed',
                  value => (value + "").match(/^[0-9]{0,15}\.*$/)).max(30000, 'Please enter valid round value')
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
                    <CardHeader
                      title={cardTitle(title)}
                    />
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
                              value={dailyCropDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'
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
                              value={dailyCropDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="routeID">
                              Route
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="routeID"
                              onChange={(e) => handleChange(e)}
                              value={dailyCropDetail.routeID}
                              variant="outlined"
                              id="routeID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routes)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="date">
                              Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.date && errors.date)}
                              helperText={touched.date && errors.date}
                              fullWidth
                              name="date"
                              type="date"
                              onChange={(e) => handleChange(e)}
                              value={dailyCropDetail.date}
                              variant="outlined"
                              id="date"
                              size='small'
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="roundValue">
                              Round Value
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.roundValue && errors.roundValue)}
                              fullWidth
                              helperText={touched.roundValue && errors.roundValue}
                              name="roundValue"
                              onChange={(e) => handleChange(e)}
                              value={dailyCropDetail.roundValue}
                              variant="outlined"
                              id="roundValue"
                              size='small'
                            >
                            </TextField>
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
                        {dailyCropData.length > 0 ?
                          <TableContainer >
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align={'center'}></TableCell>
                                  <TableCell align={'center'}></TableCell>
                                  <TableCell align={'center'}>Early Round</TableCell>
                                  <TableCell align={'center'}></TableCell>
                                  <TableCell align={'center'}></TableCell>
                                  <TableCell align={'center'}>Before Early Round</TableCell>
                                  <TableCell align={'center'}></TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell align={'center'}>Route Name</TableCell>
                                  <TableCell align={'center'}>Date</TableCell>
                                  <TableCell align={'center'}>Crop Amount (KG)</TableCell>
                                  <TableCell align={'center'}>Customer Count</TableCell>
                                  <TableCell align={'center'}>Date</TableCell>
                                  <TableCell align={'center'}>Crop Amount (KG)</TableCell>
                                  <TableCell align={'center'}>Customer Count</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {dailyCropData.map((data, index) => (
                                  <TableRow key={index}>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.routeName}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {moment(addDays(new Date(dailyCropDetail.date), -(dailyCropDetail.roundValue))).format().split('T')[0]}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.earlyRoundWeight}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.earlyRoundCount}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {moment(addDays(new Date(dailyCropDetail.date), -(dailyCropDetail.roundValue * 2))).format().split('T')[0]}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.beforeEarlyRoundWeight}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.beforeEarlyRoundCount}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableRow>
                                <TableCell align={'center'}><b>Total</b></TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {earlyTotalAmount} </b></TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {earlyCustomerCount} </b></TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {beforeEarlyTotalAmount} </b>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {beforeEarlyCustomerCount} </b>
                                </TableCell>
                              </TableRow>
                            </Table>
                          </TableContainer> : null}
                      </Box>
                      {dailyCropData.length > 0 ?
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
                            documentTitle={"Crop Forecast Daily Report"}
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
                              dailyCropData={dailyCropData} searchData={selectedSearchValues}
                              dailyCropDetail={dailyCropDetail} earlyTotalAmount={earlyTotalAmount} earlyCustomerCount={earlyCustomerCount}
                              beforeEarlyTotalAmount={beforeEarlyTotalAmount} beforeEarlyCustomerCount={beforeEarlyCustomerCount}
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

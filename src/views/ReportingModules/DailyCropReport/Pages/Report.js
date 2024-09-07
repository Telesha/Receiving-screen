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

const screenCode = 'DAILYCROPREPORT';

export default function DailyCropReport(props) {
  const [title, setTitle] = useState("Daily Crop Report");
  const classes = useStyles();
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(0);
  const [dailyCropDetail, setDailyCropDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    registrationNumber: '',
    date: new Date().toISOString().substring(0, 10)
  });
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routes, setRoutes] = useState();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [dailyCropData, setDailyCropData] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    routeName: "0",
  })
  const navigate = useNavigate();
  const alert = useAlert();
  const [csvHeaders, SetCsvHeaders] = useState([])
  const componentRef = useRef();
  const [totalAmount, setTotalAmount] = useState(0);

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
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [dailyCropDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID()
    )
  }, [dailyCropDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYCROPREPORT');

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

  async function GetDetails() {
    let total = 0;

    const cropData = await services.GetDailyCropDetails(dailyCropDetail.groupID, dailyCropDetail.factoryID, dailyCropDetail.routeID, dailyCropDetail.date, dailyCropDetail.registrationNumber);

    getSelectedDropdownValuesForReport(dailyCropDetail.groupID, dailyCropDetail.factoryID, dailyCropDetail.routeID);

    if (cropData.statusCode == "Success" && cropData.data != null) {
      setDailyCropData(cropData.data);
      cropData.data.forEach(x => {
        total = total + parseFloat(x.netWeight)
      });
      setTotalAmount(total);
      createDataForExcel(cropData.data);
      if (cropData.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error(cropData.message);
    }
  }

  async function createDataForExcel(array) {
    var res = [];

    if (array != null) {
      array.map(x => {
        var vr = {
          'Route Name': x.routeName,
          'Reg No': x.registrationNumber,
          'Supplier Name': x.name,
          'Leaf Type': x.collectionTypeName,
          'Net Amount (KG)': x.netWeight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        }
        res.push(vr);
      });
      res.push({});
      var vr = {
        'Route Name': 'Total',
        'Reg No': '',
        'Supplier Name': '',
        'Leaf Type': '',
        'Net Amount (KG)': totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }
      res.push(vr);

      res.push({});

      var vr = {
        'Route Name': 'Group :' + selectedSearchValues.groupName,
        'Reg No': 'Factory :' + selectedSearchValues.factoryName
      }
      res.push(vr);

      var vr = {
        'Route Name': selectedSearchValues.routeName == undefined ? 'Route :' + 'All Routes' : 'Route :' + selectedSearchValues.routeName,
        'Reg No': 'Date :' + dailyCropDetail.date
      }
      res.push(vr);
    }
    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(dailyCropData);
    var settings = {
      sheetName: 'Daily Crop Report',
      fileName: 'Daily Crop Report - ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName + ' ' + dailyCropDetail.date,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Daily Crop Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]

    xlsx(dataA, settings);
  }

  function getSelectedDropdownValuesForReport(groupID, factoryID, routeID) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[groupID],
      factoryName: FactoryList[factoryID],
      routeName: routes[routeID]
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
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: dailyCropDetail.groupID,
              factoryID: dailyCropDetail.factoryID,
              date: dailyCropDetail.date
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                date: Yup.string().required('Select a date'),
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
                          <Grid item md={3} xs={8}>
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
                              value={dailyCropDetail.groupID}
                              variant="outlined"
                              id="groupID"
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
                              size='small'
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={dailyCropDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
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
                              size='small'
                              name="routeID"
                              onChange={(e) => handleChange(e)}
                              value={dailyCropDetail.routeID}
                              variant="outlined"
                              id="routeID"
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routes)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Registration Number
                            </InputLabel>
                            <TextField
                              size='small'
                              fullWidth
                              name="registrationNumber"
                              onChange={(e) => handleChange(e)}
                              value={dailyCropDetail.registrationNumber}
                              variant="outlined"
                              id="registrationNumber"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="date">
                              Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.date && errors.date)}
                              fullWidth
                              helperText={touched.date && errors.date}
                              size='small'
                              name="date"
                              type="date"
                              onChange={(e) => handleChange(e)}
                              value={dailyCropDetail.date}
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
                      </CardContent>
                      <br>
                      </br>
                      <br>
                      </br>
                      <Divider />
                      <Box minWidth={1050}>
                        {dailyCropData.length > 0 ?
                          <TableContainer >
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align={'center'}>Route Name</TableCell>
                                  <TableCell align={'center'}>Reg No</TableCell>
                                  <TableCell align={'center'}>Supplier Name</TableCell>
                                  <TableCell align={'center'}>Leaf Type</TableCell>
                                  <TableCell align={'center'}>Net Amount (KG)</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {dailyCropData.slice(page * limit, page * limit + limit).map((data, index) => (
                                  <TableRow key={index}>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.routeName}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.registrationNumber}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.name}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.collectionTypeName}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.netWeight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableRow>
                                <TableCell align={'center'}><b>Total</b></TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                </TableCell>
                                <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                  <b> {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </b>
                                </TableCell>
                              </TableRow>
                            </Table>
                            <TablePagination
                              component="div"
                              count={dailyCropData.length}
                              onChangePage={handlePageChange}
                              onChangeRowsPerPage={handleLimitChange}
                              page={page}
                              rowsPerPage={limit}
                              rowsPerPageOptions={[5, 10, 25]}
                            />
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
                          >
                            EXCEL
                          </Button>

                          <ReactToPrint
                            documentTitle={"Daily Crop Report"}
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
                              dailyCropData={dailyCropData} searchData={selectedSearchValues}
                              total={totalAmount} dailyCropDetail={dailyCropDetail}
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
  )
}

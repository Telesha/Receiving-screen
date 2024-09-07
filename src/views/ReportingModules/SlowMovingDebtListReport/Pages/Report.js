import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader,
  MenuItem
} from '@material-ui/core';
import MaterialTable from "material-table";
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
import { LoadingComponent } from './../../../../utils/newLoader';

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

const screenCode = 'SLOWMOVINGDEBTLISTREPORT';

export default function SlowMovingDebtListReport(props) {
  const [title, setTitle] = useState("Slow Moving Debt List Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routeList, setRouteList] = useState();
  const [itemRequestDetail, setItemRequestDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    recoveryPeriod: ''
  });
  const [SlowMovingDebtListDetails, setSlowMovingDebtListDetails] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    startDate: '',
    endDate: ''
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const [csvHeaders, SetCsvHeaders] = useState([]);

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown()
    );
    setItemRequestDetail({
      ...itemRequestDetail,
      factoryID: 0,
      routeID: 0,
      recoveryPeriod: ''
    })
    setSlowMovingDebtListDetails([])
  }, [itemRequestDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID()
    );
    setItemRequestDetail({
      ...itemRequestDetail,
      routeID: 0,
      recoveryPeriod: ''
    })
    setSlowMovingDebtListDetails([])
  }, [itemRequestDetail.factoryID]);



  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSLOWMOVINGDEBTLISTREPORT');

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

    setItemRequestDetail({
      ...itemRequestDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(itemRequestDetail.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routes = await services.getRoutesForDropDown(itemRequestDetail.factoryID);
    setRouteList(routes);
  }



  async function GetSlowMovingDebtListReportDetails() {

    let requestModel = {
      groupID: parseInt(itemRequestDetail.groupID.toString()),
      factoryID: parseInt(itemRequestDetail.factoryID.toString()),
      routeID: parseInt(itemRequestDetail.routeID.toString()),
      recoveryPeriod: parseInt(itemRequestDetail.recoveryPeriod.toString())
    }

    getSelectedDropdownValuesForReport(requestModel);
    let result = await services.GetSlowMovingDebtListDetails(requestModel)

    if (result.statusCode == "Success" && result.data != null) {
      if (result.data.length == 0) {
        alert.error("No records to display");
        return;
      }
      setSlowMovingDebtListDetails(result.data)
    }
    else {
      alert.error("No records to display");
    }
  }


  async function createFile() {
    var file = await createDataForExcel(SlowMovingDebtListDetails);
    var settings = {
      sheetName: ('Slow Moving Debt List Report').substring(0, 30),
      fileName: ('Slow Moving Debt List Report ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName).substring(0, 30),
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataModel = [
      {
        sheet: ('Slow Moving Debt List Report').substring(0, 30),
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataModel, settings);
  }

  async function createDataForExcel(excelDataArray) {
    var finalExcelDataArray = [];
    if (excelDataArray != null) {
      excelDataArray.map(x => {
        let dataModel = {
          'Route': x.routeName,
          'Registration Number': x.registrationNumber,
          'Customer Name': x.customerName,
          'Last 3 Month Income Avg (Rs)': x.lastThreeMonthAverege.toFixed(2),
          'Debt Amount (Rs)': x.debtAmount.toFixed(2),
          'Recovery Period': x.recoveryPeriod,
          'Loan Balance (Rs)': x.loanBalance,
        }
        finalExcelDataArray.push(dataModel);
      });
    }
    return finalExcelDataArray;
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
    setItemRequestDetail({
      ...itemRequestDetail,
      [e.target.name]: value
    });
    setSlowMovingDebtListDetails([]);
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

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID]
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: itemRequestDetail.groupID,
              factoryID: itemRequestDetail.factoryID,
              routeID: itemRequestDetail.routeID,
              recoveryPeriod: itemRequestDetail.recoveryPeriod,

            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                recoveryPeriod: Yup.number().required('Recovery period is required').min("0", 'Recovery period is required')
              })
            }
            onSubmit={() => trackPromise(GetSlowMovingDebtListReportDetails())}
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
                              size='small'
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={itemRequestDetail.groupID}
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
                              value={itemRequestDetail.factoryID}
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
                              error={Boolean(touched.routeID && errors.routeID)}
                              helperText={touched.routeID && errors.routeID}
                              size='small'
                              name="routeID"
                              onChange={(e) => handleChange(e)}
                              value={itemRequestDetail.routeID}
                              variant="outlined"
                              id="routeID"
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routeList)}
                            </TextField>
                          </Grid>


                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="recoveryPeriod">
                              Recovery Period *
                            </InputLabel>
                            <TextField
                              fullWidth
                              error={Boolean(touched.recoveryPeriod && errors.recoveryPeriod)}
                              helperText={touched.recoveryPeriod && errors.recoveryPeriod}
                              size='small'
                              name="recoveryPeriod"
                              onChange={(e) => handleChange(e)}
                              value={itemRequestDetail.recoveryPeriod}
                              variant="outlined"
                              id="recoveryPeriod"
                            >
                            </TextField>
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
                        {SlowMovingDebtListDetails.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={
                              [
                                { title: "Route", field: 'routeName' },
                                { title: "Registration Number", field: 'registrationNumber' },
                                { title: "Customer Name", field: 'customerName' },
                                { title: "Last 3 Month Income Avg (Rs)", field: 'lastThreeMonthAverege', render: rowData => rowData.lastThreeMonthAverege.toFixed(2) },
                                { title: "Debt Amount (Rs)", field: 'debtAmount', render: rowData => rowData.debtAmount.toFixed(2) },
                                { title: "Recovery Period", field: 'recoveryPeriod' },
                                { title: "Loan Balance (Rs)", field: 'loanBalance' },
                              ]
                            }
                            data={SlowMovingDebtListDetails}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 5
                            }}
                          /> : null}
                      </Box>
                      {SlowMovingDebtListDetails.length > 0 ?
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
                            documentTitle={"Slow Moving Debt List Report"}
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
                              slowMovingDebtListDetails={SlowMovingDebtListDetails}
                              searchData={selectedSearchValues}
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


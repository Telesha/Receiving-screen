import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader,
  MenuItem
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
import MaterialTable from "material-table";
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

const screenCode = 'ALLDEBTLIST';

export default function AllDebtList(props) {
  const [title, setTitle] = useState("All Debt List");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routeList, setRouteList] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [debtRequestDetail, setDebtRequestDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0
  });
  const [allDebtList, setAllDebtList] = useState([]);
  const [toDate, setToDate] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [csvHeaders, SetCsvHeaders] = useState([])

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [debtRequestDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID());
  }, [debtRequestDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWALLDEBTLIST');

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

    setDebtRequestDetail({
      ...debtRequestDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(debtRequestDetail.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routes = await services.getRoutesForDropDown(debtRequestDetail.factoryID);
    setRouteList(routes);
  }

  async function GetAllDebtList() {

    const response = await services.GetAllDebtListForReport(debtRequestDetail.groupID, debtRequestDetail.factoryID, debtRequestDetail.routeID);

    getSelectedDropdownValuesForReport(debtRequestDetail.groupID, debtRequestDetail.factoryID);

    if (response.statusCode == "Success" && response.data != null) {
      setAllDebtList(response.data);
      createDataForExcel(response.data);

      if (response.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error("Error");

    }
    var date = selectedDate.toLocaleString('en-us',{month:'short', year:'numeric'})
    setToDate(date);
  }

  async function createDataForExcel(array) {
    var res = [];

    if (array != null) {
      array.map(x => {
        var vr = {
          'Route Name': x.routeName,
          'Registration Number': x.registrationNumber,
          'Customer Name': x.name,
          'Last Month Crop(Kg)': x.lastMonthCrop,
          'This Month Crop(Kg)': x.thisMonthCrop,
          'Debt Amount (Rs)': x.amount,
          'Last Supply Month': x.lastSupplyMonth,
          'Loan Balance (Rs)': x.loanBalance,
        }
        res.push(vr);
      });
    }

    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(allDebtList);
    var settings = {
      sheetName: 'All Debt List',
      fileName: 'All Debt List - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName + ' - ' + toDate,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'All Debt List',
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
    setDebtRequestDetail({
      ...debtRequestDetail,
      [e.target.name]: value
    });
    setAllDebtList([]);
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

  function getSelectedDropdownValuesForReport(groupID,factoryID) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[groupID],
      factoryName: FactoryList[factoryID],
    })
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: debtRequestDetail.groupID,
              factoryID: debtRequestDetail.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
              })
            }
            onSubmit={() => trackPromise(GetAllDebtList())}
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
                              value={debtRequestDetail.groupID}
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
                              value={debtRequestDetail.factoryID}
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
                              value={debtRequestDetail.routeID}
                              variant="outlined"
                              id="routeID"
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routeList)}
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
                        {allDebtList.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Route Name', field: 'routeName' },
                              { title: 'Registration Number', field: 'registrationNumber' },
                              { title: 'Customer Name', field: 'name' },
                              { title: 'Last Month Crop (Kg)', field: 'lastMonthCrop' },
                              { title: 'This Month Crop (kg)', field: 'thisMonthCrop' },
                              { title: 'Debt Amount (Rs)', field: 'amount' },
                              { title: 'Last Supply Month', field: 'lastSupplyMonth' },
                              { title: 'Loan Balance (Rs)', field: 'loanBalance' },
                            ]}
                            data={allDebtList}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 10
                            }}
                            actions={[

                            ]}
                          /> : null}
                      </Box>
                      {allDebtList.length > 0 ?
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
                            documentTitle={"All Debt List"}
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
                              allDebtList={allDebtList} searchData={selectedSearchValues}
                              toDate={toDate}
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

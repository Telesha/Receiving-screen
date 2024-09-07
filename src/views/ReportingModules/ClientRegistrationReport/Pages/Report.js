import React, { useState, useEffect, Fragment, useRef } from 'react';
import { useAlert } from "react-alert";
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import MaterialTable from "material-table";
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
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

const screenCode = 'CLIENTREGISTRATIONDETAILREPORT';

export default function ClientRegistrationDetailsReport(props) {
  const [title, setTitle] = useState("Supplier Registration Details Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routes, setRoutes] = useState();
  const [clientDetail, setClientDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    registrationNumber: '',
  });
  const [clientDetailList, setClientDetailList] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    routeName: "0"

  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [csvHeaders, SetCsvHeaders] = useState([])
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();

  const [firstLoad, setFirstLoad] = useState({
    load: 0
  })

  useEffect(() => {
    if (clientDetail.factoryID != null) {
      //GetClientDetailsFirst() for later use
    }
  }, [firstLoad.load]);

  useEffect(() => {
    trackPromise(
      getPermission()
    );
    trackPromise(
      getGroupsForDropdown()
    );
  }, []);

  useEffect(() => {
    getFactoriesForDropdown();
  }, [clientDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID()
    )
  }, [clientDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCLIENTREGISTRATIONREPORT');

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

    setClientDetail({
      ...clientDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })

    setFirstLoad({
      ...firstLoad,
      load: 1
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(clientDetail.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(clientDetail.factoryID);
    setRoutes(routeList);
  }

  async function GetClientDetails() {
    const response = await services.getClientRegistrationDetails(clientDetail.groupID, clientDetail.factoryID, clientDetail.routeID, clientDetail.registrationNumber);
    getSelectedDropdownValuesForReport(clientDetail.groupID, clientDetail.factoryID, clientDetail.routeID);
    if (response.statusCode == "Success" && response.data != null) {
      setClientDetailList(response.data);
      createDataForExcel(response.data);

      if (response.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error(response.message);
    }
  }

  async function GetClientDetailsFirst() {
    const response = await services.getClientRegistrationDetails(clientDetail.groupID, clientDetail.factoryID, clientDetail.routeID, clientDetail.registrationNumber);
    if (response.statusCode == "Success" && response.data != null) {
      setClientDetailList(response.data);
    }
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

  async function createDataForExcel(array) {
    var res = [];

    if (array != null) {
      array.map(x => {
        var vr = {
          'Route Name': x.routeName,
          'Reg No': x.registrationNumber,
          'Name': x.name,
          'NIC': x.nic,
          'Contact No': x.mobile,
          'Address': x.address,
          'Account Type': x.accountTypeID == 0 ? "" : x.accountTypeID == 1 ? "Supplier" : x.accountTypeID == 2 ? "Dealer" : "Estate",
          'Payment Type': x.paymentTypeID == 0 ? "" : x.paymentTypeID == 1 ? "Account" : x.paymentTypeID == 2 ? "Cheque" : "Cash",
          'Account Holder Name': x.accountHolderName,
          'Account No': x.accountNumber,
          'Bank': x.bankName,
          'Branch': x.branchName
        }
        res.push(vr);
      });

      res.push({});

      var vr = {
        'Route Name': "Group :" + selectedSearchValues.groupName,
        'Reg No': "Factory :" + selectedSearchValues.factoryName,
        'Name': selectedSearchValues.routeName == undefined ? 'Route :' + 'All Routes' : 'Route :' + selectedSearchValues.routeName
      }
      res.push(vr);

    }

    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(clientDetailList);
    var settings = {
      sheetName: 'Supplier Registration Report',
      fileName: 'Supplier Registration Report - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Supplier Registration Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]

    xlsx(dataA, settings);
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setClientDetail({
      ...clientDetail,
      [e.target.name]: value
    });
    setClientDetailList([]);
  }

  function getSelectedDropdownValuesForReport(groupID, factoryID, routeID) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[groupID],
      factoryName: FactoryList[factoryID],
      routeName: routes[routeID]
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
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: clientDetail.groupID,
              factoryID: clientDetail.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
              })
            }
            onSubmit={() => trackPromise(GetClientDetails())}
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
                          <Grid item md={3} xs={12}>
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
                              value={clientDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
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
                              value={clientDetail.factoryID}
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
                              value={clientDetail.routeID}
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
                              fullWidth
                              name="registrationNumber"
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={clientDetail.registrationNumber}
                              variant="outlined"
                              id="registrationNumber"
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
                        {clientDetailList.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Route Name', field: 'routeName' },
                              { title: 'Reg No', field: 'registrationNumber' },
                              { title: 'Name', field: 'name' },
                              { title: 'NIC', field: 'nic' },
                              { title: 'Contact No', field: 'mobile' },
                              { title: 'Address', field: 'address' },

                            ]}
                            data={clientDetailList}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 5,
                            }}
                            actions={[

                            ]}
                          /> : null}
                      </Box>
                      {clientDetailList.length > 0 ?
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
                            documentTitle={"Supplier Registration Details Report"}
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
                              clientDetailListData={clientDetailList} selectedSearchValues={selectedSearchValues}
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

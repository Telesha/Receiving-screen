import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  InputLabel,
  TextField,
  CardHeader,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import VisibilityIcon from '@material-ui/icons/Visibility';
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { Formik } from 'formik';
import * as Yup from "yup";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { LoadingComponent } from 'src/utils/newLoader';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
}));

const screenCode = 'FACTORYITEMREQUESTDETAILS';
export default function FactoryItemRequestListing() {
  const classes = useStyles();
  const [title, setTitle] = useState("Factory Item Request Details")
  const [factoryAdjustmentData, setFactoryAdjustmentData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [factoryItems, setFactoryItems] = useState();
  const [routes, setRoutes] = useState();
  const [fromDate, handleFromDate] = useState(new Date());
  const [toDate, handleToDate] = useState(new Date());
  const [requestList, setAdjustmentList] = useState({
    groupID: '0',
    factoryID: '0',
    factoryItemID: '0',
    routeID: '0',
    requestType: '0',
    statusID: '0'
  })

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/factoryItemRequestDetails/viewfactoryItemRequestDetails/' + encrypted);
  }
  const handleClickEdit = (factoryItemRequestID) => {
    encrypted = btoa(factoryItemRequestID.toString());
    navigate('/app/factoryItemRequestDetails/viewfactoryItemRequestDetails/' + encrypted);
  }
  const alert = useAlert();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
      getPermission());
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown()
    );
  }, [requestList.groupID]);

  useEffect(() => {
    trackPromise(
      getFactoryItemsByFactoryID(),
      getRoutesByFactoryID()
    )
  }, [requestList.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWFACTORYITEMREQUEST');

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

    setAdjustmentList({
      ...requestList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }
  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(requestList.factoryID);
    setRoutes(routeList);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(requestList.groupID);
    setFactories(factory);
  }

  async function getFactoryItemsByFactoryID() {
    const items = await services.getFactoryItemsByFactoryID(requestList.factoryID);
    setFactoryItems(items);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function GetDetails() {
    let model = {
      groupID: parseInt(requestList.groupID),
      factoryID: parseInt(requestList.factoryID),
      routeID: parseInt(requestList.routeID),
      factoryItemID: parseInt(requestList.factoryItemID),
      requestType: parseInt(requestList.requestType),
      statusID: parseInt(requestList.statusID),
      startDate: fromDate,
      endDate: toDate
    }
    const customerData = await services.GetViewFactoryItemRequestDetails(model);
    if (customerData.statusCode == "Success" && customerData.data != null) {
      setFactoryAdjustmentData(customerData.data);
      if (customerData.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error("Error");
    }
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setAdjustmentList({
      ...requestList,
      [e.target.name]: value
    });
    setFactoryAdjustmentData([]);
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
      <Page
        className={classes.root}
        title="Factory Item Request Details"
      >
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: requestList.groupID,
              factoryID: requestList.factoryID,
              fromDate: fromDate,
              toDate: toDate,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                fromDate: Yup.date().required('From date is required').typeError('Invalid date'),
                toDate: Yup.date().required('To date is required').typeError('Invalid date')
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
                      <CardContent style={{ marginBottom: "2rem" }}>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group  *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={requestList.groupID}
                              variant="outlined"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
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
                              name="factoryID"
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={requestList.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="fromDate" style={{ marginBottom: '-8px' }}>
                              From Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.fromDate && errors.fromDate)}
                                helperText={touched.fromDate && errors.fromDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="fromDate"
                                id="fromDate"
                                value={fromDate}
                                onChange={(e) => {
                                  handleFromDate(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="toDate" style={{ marginBottom: '-8px' }}>
                              To Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.toDate && errors.toDate)}
                                helperText={touched.toDate && errors.toDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="toDate"
                                id="toDate"
                                value={toDate}
                                onChange={(e) => {
                                  handleToDate(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="routeID">
                              Route
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="routeID"
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={requestList.routeID}
                              variant="outlined"
                              id="routeID"
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routes)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="factoryItemID">
                              Factory Item
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="factoryItemID"
                              size='small'
                              onChange={(e) => handleChange(e)}
                              value={requestList.factoryItemID}
                              variant="outlined"
                            >
                              <MenuItem value="0">--Select Factory Item--</MenuItem>
                              {generateDropDownMenu(factoryItems)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="requestType">
                              Source
                            </InputLabel>

                            <TextField select
                              fullWidth
                              name="requestType"
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={requestList.requestType}
                              variant="outlined"
                              id="requestType"
                            >
                              <MenuItem value={'0'}>
                                --Select Status--
                              </MenuItem>
                              <MenuItem value={'1'}>Mobile Request</MenuItem>
                              <MenuItem value={'2'}>Direct Request</MenuItem>
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="statusID">
                              Status
                            </InputLabel>

                            <TextField select
                              fullWidth
                              name="statusID"
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={requestList.statusID}
                              variant="outlined"
                              id="statusID"
                            >
                              <MenuItem value={'0'}>
                                --Select Status--
                              </MenuItem>
                              <MenuItem value={'1'}>Pending</MenuItem>
                              <MenuItem value={'2'}>Issue</MenuItem>
                              <MenuItem value={'3'}>Reject</MenuItem>
                              <MenuItem value={'4'}>Send To Deliver</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>
                        <br />
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
                      </CardContent>
                      <Box minWidth={1000} >
                        {factoryAdjustmentData.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              {
                                title: 'Created Date', field: 'effectiveDate',
                                render: rowData => rowData.effectiveDate.split('T')[0]
                              },
                              {
                                title: 'Issue Date', field: 'issuingDate',
                                render: rowData => rowData.issuingDate.split('T')[0]
                              },
                              { title: 'Route', field: 'routeName' },
                              { title: 'Reg Number', field: 'registrationNumber' },
                              { title: 'Factory Item', field: 'itemName' },
                              { title: 'Amount (Rs.)', field: 'totalPrice', render: rowData => rowData.totalPrice.toFixed(2) },
                              { title: 'No of Installements', field: 'noOfInstallments' },
                              {
                                title: 'Source', field: 'requestType', lookup: {
                                  1: 'Mobile Request',
                                  2: 'Direct Request'
                                }
                              },
                              {
                                title: 'Status', field: 'statusID', lookup: {
                                  1: 'Pending',
                                  2: 'Issue',
                                  3: 'Reject',
                                  4: 'Send To Deliver'
                                }
                              },
                            ]}
                            data={factoryAdjustmentData}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 5
                            }}
                            actions={[
                              {
                                icon: () => <VisibilityIcon />,
                                tooltip: 'View',
                                onClick: (event, factoryAdjustmentData) => handleClickEdit(factoryAdjustmentData.factoryItemRequestID)
                              }
                            ]}
                          /> : null}
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page >
    </Fragment>
  );
};
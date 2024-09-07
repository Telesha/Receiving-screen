import React, { useState, useEffect, Fragment } from 'react';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Grid, Box, Card, MenuItem, Button, makeStyles, Container, CardHeader, Divider, CardContent, InputLabel, TextField
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import permissionService from "../../../utils/permissionAuth";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import tokenService from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  }

}));

const screenCode = 'CUSTOMERHISTORY';

export default function CustomerHistoryListing() {
  const classes = useStyles();
  const [title, setTitle] = useState("Customer History")
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [fromDate, handleFromDate] = useState(new Date());
  const [toDate, handleToDate] = useState(new Date());
  const [searchParamList, setSearchParamList] = useState({
    groupID: 0,
    factoryID: 0,
    registrationNumber: '',
    transactionTypeID: 0,
    fromDate: '',
    toDate: ''
  })
  const [customerHistoryData, setCustomerHistoryData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const alert = useAlert();

  useEffect(() => {
    trackPromise(
      getPermissions()
    )
  }, []);

  useEffect(() => {
    if (searchParamList.groupID != 0) {
      trackPromise(
        getFactoriesForDropdown(searchParamList.groupID)
      );
    }
  }, [searchParamList.groupID])

  useEffect(() => {
    setSearchParamList({
      ...searchParamList,
      ['fromDate']: fromDate,
    });
  }, [fromDate]);

  useEffect(() => {
    setSearchParamList({
      ...searchParamList,
      ['toDate']: toDate,
    });
  }, [toDate]);

  async function getPermissions() {
    var permissions = await permissionService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'CUSTOMERHISTORYVIEW');

    if (isAuthorized === undefined) {
      navigate('/app/unauthorized');
    }

    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setSearchParamList({
      ...searchParamList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })

    getGroupsForDropdown();
  }

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    navigate('/app/dashboard');
  }

  const handleClickEdit = (productID) => {
    encrypted = btoa(productID.toString());
    navigate('/app/products/addedit/' + encrypted);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown(groupID) {
    const factories = await services.getAllFactoriesByGroupID(groupID);
    setFactories(factories);
  }

  async function GetCustomerHistory() {
    var result = await services.GetCustomerHistory(searchParamList, moment(fromDate).format(), moment(toDate).format());
    if (result.statusCode == "Success" && result.data != null) {
      setCustomerHistoryData(result.data);
    }
    else {
      alert.error('No records to display');
    }
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

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }
  function handleChangeEvnt(e) {
    const target = e.target;
    const value = target.value
    setSearchParamList({
      ...searchParamList,
      [e.target.name]: value
    });
    clearTable();
  }

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setSearchParamList({
      ...searchParamList,
      groupID: value,
      factoryID: 0,
      registrationNumber: '',
      transactionTypeID: 0
    });
    clearTable()
  }

  function handleFactoryChange(e) {
    const target = e.target;
    const value = target.value
    setSearchParamList({
      ...searchParamList,
      factoryID: value,
      registrationNumber: '',
      transactionTypeID: 0
    });
    clearTable();
  }

  function clearTable() {
    setCustomerHistoryData([]);
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: searchParamList.groupID,
              factoryID: searchParamList.factoryID,
              registrationNumber: searchParamList.registrationNumber,
              transactionTypeID: searchParamList.transactionTypeID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                factoryID: Yup.number().min(1, "Please Select a Factory").required('Factory is required'),
                //registrationNumber: Yup.number().required('Registration Number is required'),
                registrationNumber: Yup.string().required('Registration number is required').matches(/^(?! )[a-zA-Z0-9]{0,15}$/, 'Please enter valid registration number'),
              })
            }
            enableReinitialize
            onSubmit={() => trackPromise(GetCustomerHistory())}
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
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
                              onChange={(e) => {
                                handleGroupChange(e)
                              }}
                              value={searchParamList.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value={'0'} disabled={true}>
                                --Select Group--
                              </MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="groupID">
                              Factory *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              size='small'
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleFactoryChange(e)
                              }}
                              value={searchParamList.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled,
                              }}
                            >
                              <MenuItem value={'0'} disabled={true}>
                                --Select Factory--
                              </MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Registration Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                              fullWidth
                              size='small'
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              name="registrationNumber"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChangeEvnt(e)
                              }}
                              value={searchParamList.registrationNumber}
                              variant="outlined"
                              id="registrationNumber"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="transactionTypeID">
                              Transaction Type
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.transactionTypeID && errors.transactionTypeID)}
                              fullWidth
                              helperText={touched.transactionTypeID && errors.transactionTypeID}
                              size='small'
                              name="transactionTypeID"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChangeEvnt(e)
                              }}
                              value={searchParamList.transactionTypeID}
                              variant="outlined"
                              id="transactionTypeID"
                            >
                              <MenuItem value="0">All Transaction Types</MenuItem>
                              <MenuItem value="1">Leaf - LF</MenuItem>
                              <MenuItem value="2">Advance Payment - ADP</MenuItem>
                              <MenuItem value="36">Advance Payment Bank - ADB</MenuItem>
                              <MenuItem value="35">Advance Payment Cheque - ADQ</MenuItem>
                              <MenuItem value="3">Factory Item - FCT</MenuItem>
                              <MenuItem value="6">Balance Payment - BP</MenuItem>
                              <MenuItem value="7">Transport Rate - TR</MenuItem>
                              <MenuItem value="8">Balance Brought Forward - BBF</MenuItem>
                              <MenuItem value="9">Balance Carry Forward - BCF</MenuItem>
                              <MenuItem value="10">Loan- LN</MenuItem>
                              <MenuItem value="16">Expay- EXP</MenuItem>
                              <MenuItem value="22">Saving- SV</MenuItem>
                              <MenuItem value="23">Welfare- WF</MenuItem>
                              <MenuItem value="33">Addition - AD</MenuItem>
                              <MenuItem value="34">Deduction - DE</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fromDate">
                              From Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="fromDate"
                                value={fromDate}
                                maxDate={new Date()}
                                onChange={(e) => {
                                  handleFromDate(e);
                                  clearTable();
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="toDate">
                              To Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="toDate"
                                value={toDate}
                                maxDate={new Date()}
                                onChange={(e) => {
                                  handleToDate(e);
                                  clearTable();
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                size='small'
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                          <Grid item md={12} xs={12}>
                            {customerHistoryData.length > 0 ?
                              <MaterialTable
                                title="Multiple Actions Preview"
                                columns={[
                                  { title: 'Transaction Type', field: 'transactionTypeName' },
                                  { title: 'Code', field: 'transactionTypeCode' },
                                  {
                                    title: 'Created Date', field: 'createdDate',
                                    render: rowData => rowData.createdDate.split('T')[0]
                                  },
                                  {
                                    title: 'Effective Date', field: 'effectiveDate',
                                    render: rowData => rowData.effectiveDate.split('T')[0]
                                  },
                                  {
                                    title: 'Crop Weight (KG)', field: 'cropWeight',
                                    render: rowData => rowData.transactionTypeID == 1 ? rowData.cropWeight.toFixed(2) : "--"
                                  },
                                  {
                                    title: 'Crop Rate (RS)', field: 'cropRate',
                                    render: rowData => rowData.transactionTypeID == 1 ? rowData.cropRate.toFixed(2) : "--"
                                  },
                                  //{ title: 'Entry Type', field: 'entryType' },                                  
                                  {
                                    title: 'Debit (RS)', field: 'amount',
                                    render: rowData => rowData.entryType == 2 ? rowData.amount : "--"
                                  },  // hide if a credit entry
                                  {
                                    title: 'Credit (RS)', field: 'amount',
                                    render: rowData => rowData.entryType == 1 ? rowData.amount : "--"
                                  }, //hide if a debit entry
                                  // { //Disabled due to temporary request
                                  //   title: 'Account Balance (RS)', field: 'customerAccountBalance',
                                  //   render: rowData => rowData.customerAccountBalance == null ? "--" : rowData.customerAccountBalance
                                  // },
                                ]}
                                data={customerHistoryData}
                                options={{
                                  exportButton: false,

                                  showTitle: false,
                                  headerStyle: { textAlign: "left", height: '1%' },
                                  cellStyle: { textAlign: "left" },
                                  columnResizable: false,
                                  actionsColumnIndex: -1,
                                  pageSize: 10,
                                }}
                              />
                              : null}
                          </Grid>
                        </Grid>

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
  );
};


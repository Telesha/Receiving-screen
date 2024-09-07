import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  CardHeader,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  InputLabel,
  TextField,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from '@material-ui/pickers';
import MaterialTable from 'material-table';
import { useAlert } from 'react-alert';
import moment from 'moment';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Typography from '@material-ui/core/Typography';
//import { SignalCellularNull } from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  btnApprove: {
    backgroundColor: 'green'
  },
  button: {
    margin: theme.spacing(1),
    backgroundColor: '#FF0000'
  }
}));

const screenCode = 'LEAFAMENDMENT';
export default function LeafAmendmentListing(props) {
  const classes = useStyles();
  const [leafAmendmentData, setLeafAmendmentData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [leafAmendment, setLeafAmendment] = useState({
    groupID: '0',
    factoryID: '0',
    routeID: '0',
    registrationNumber: ''
  });

  const navigate = useNavigate();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [selectedDate, handleDateChange] = useState();
  const [routes, setRoutes] = useState();
  const alert = useAlert();
  const valueChecker = /^\d+(\.[1-9])?$/;
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = React.useState(
    false
  );
  const [dialogActionData, setDialogActionData] = useState(null);

  const [deletingRow, setDeletingRow] = React.useState(null);
  const columns = [
    {
      title: 'Customer Name',
      field: 'customerName',
      editable: 'never',
      cellStyle: {
        width: 200,
        maxWidth: 200,
        textAlign: 'left',
        marginLeft: '20rem'
      },
      headerStyle: {
        width: 200,
        maxWidth: 200,
        textAlign: 'left',
        marginLeft: '20rem'
      }
    },
    {
      title: 'Registration Number',
      field: 'registrationNumber',
      editable: 'never',
      cellStyle: {
        width: 200,
        maxWidth: 200,
        textAlign: 'left',
        marginLeft: '20rem'
      },
      headerStyle: {
        width: 200,
        maxWidth: 200,
        textAlign: 'left',
        marginLeft: '20rem'
      }
    },
    {
      title: 'Collection Type ',
      field: 'collectionTypeName',
      type: 'numeric',
      editable: 'never',
      cellStyle: {
        width: 200,
        maxWidth: 200,
        textAlign: 'center'
      },
      headerStyle: {
        width: 200,
        maxWidth: 200,
        textAlign: 'center'
      }
    },
    {
      title: 'Net Weight(KG)',
      field: 'netWeight',
      type: 'numeric',
      validate: rowData =>
        valueChecker.test(rowData.netWeight)
          ? true
          : 'Only allow positive numbers with one decimal',
      cellStyle: {
        width: 200,
        maxWidth: 200,
        textAlign: 'center'
      },
      headerStyle: {
        width: 200,
        maxWidth: 200,
        textAlign: 'center'
      }
    },
    {
      title: 'CropRate',
      field: 'cropRate',
      type: 'numeric',
      editable: 'never',
      textAlign: 'center',
      hidden: true
    },
    {
      title: 'OriginalWeight',
      field: 'originalWeight',
      type: 'numeric',
      editable: 'never',
      hidden: true
    },
    {
      title: 'CustomerAccountID',
      field: 'customerAccountID',
      type: 'numeric',
      editable: 'never',
      hidden: true
    },
    {
      title: 'CustomerID',
      field: 'customerID',
      type: 'numeric',
      editable: 'never',
      hidden: true
    }
  ];
  const [state, setState] = useState([]);

  const [finishStatus, setfinishStatus] = useState(false);

  const onBackButtonEvent = e => {
    e.preventDefault();
    if (!finishStatus) {
      if (window.confirm('Do you want to go back ?')) {
        setfinishStatus(true);
        navigate('/app/dashBoard');
      } else {
        window.history.pushState(null, null, window.location.pathname);
        setfinishStatus(false);
      }
    }
  };

  const [MinMonth, setMinMonth] = useState(new Date());
  const [balancePaymentData, setBalancePaymentData] = useState({
    lastBalancePaymentSchedule: '',
    firstTransactionDate: ''
  });

  useEffect(() => {
    trackPromise(getPermission(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown());
  }, [leafAmendment.groupID]);

  useEffect(() => {
    trackPromise(getRoutesForDropDown(), getIsBalancePaymetStatusChek());
  }, [leafAmendment.factoryID]);

  useEffect(() => {
    clearTable();
  }, [selectedDate]);

  useEffect(() => {
    clearTable();
  }, [leafAmendment.routeID]);

  useEffect(() => {
    clearTable();
  }, [leafAmendment.registrationNumber]);

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', onBackButtonEvent);
    return () => {
      window.removeEventListener('popstate', onBackButtonEvent);
    };
  }, []);

  const handleDeleteConfirmationClose = () => {
    setDeletingRow(null);
    setDeleteConfirmationOpen(false);
  };

  async function getRoutesForDropDown() {
    const routeList = await services.getRoutesForDropDown(
      leafAmendment.factoryID
    );
    setRoutes(routeList);
  }

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'ADDEDITLEAFAMENDMENT'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setLeafAmendment({
      ...leafAmendment,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getLeafAmendmentDetails() {
    var result = await services.getLeafAmendmentDetails(
      leafAmendment.groupID,
      leafAmendment.factoryID,
      selectedDate,
      leafAmendment.routeID,
      leafAmendment.registrationNumber
    );
    setLeafAmendmentData(result);
    setState(result);
  }

  async function getIsBalancePaymetStatusChek() {
    const result = await services.getCurrentBalancePaymnetDetail(
      leafAmendment.groupID,
      leafAmendment.factoryID
    );
    checkIsMonthValid(result);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(
      leafAmendment.groupID
    );
    setFactories(factories);
  }

  async function checkIsMonthValid(result) {
    var convertedDate = new Date();
    let tempMonth;
    if (result.lastBalancePaymentSchedule !== null) {
      tempMonth = result.lastBalancePaymentSchedule.split('/');
      convertedDate.setMonth(tempMonth[1]);
      if (convertedDate.getFullYear() != tempMonth[0]) {
        convertedDate.setFullYear(tempMonth[0]);
      }
      setMinMonth(
        moment(
          new Date(convertedDate.getFullYear(), convertedDate.getMonth(), 1)
        )
      );
    } else if (result.firstTransactionDate !== null) {
      tempMonth = result.firstTransactionDate.split('/');
      convertedDate.setMonth(--tempMonth[1]);
      setMinMonth(
        moment(
          new Date(convertedDate.getFullYear(), convertedDate.getMonth(), 1)
        )
      );
    } else {
      setMinMonth(
        moment(
          new Date(convertedDate.getFullYear(), convertedDate.getMonth(), 1)
        )
      );
    }
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setLeafAmendment({
      ...leafAmendment,
      [e.target.name]: value
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    );
  }

  async function UpdateLeafAmendment(UpdateData) {
    let response = await services.UpdateLeafAmendment(UpdateData);

    if (response.statusCode == 'Success') {
      alert.success(response.message);
      // setEditedValue(SignalCellularNull);
    } else {
      alert.error(response.message);
    }
  }
  async function DeleteLeafAmendment() {
    const response = await services.DeleteLeafAmendment(deletingRow);
    if (response.statusCode == 'Success') {
      alert.success(response.message);
      setDeletingRow(null);
    } else {
      alert.error(response.message);
    }
  }

  async function clearTable() {
    var result = await services.getLeafAmendmentDetails(
      leafAmendment.groupID,
      leafAmendment.factoryID,
      selectedDate,
      leafAmendment.routeID,
      leafAmendment.registrationNumber
    );
    setLeafAmendmentData(result);
    setState([]);
  }

  return (
    <Page className={classes.root} title="Leaf Amendment">
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader title={cardTitle('Leaf Amendment')} />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: '2rem' }}>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="groupID">
                      Group *
                    </InputLabel>
                    <TextField
                      select
                      fullWidth
                      name="groupID"
                      onChange={e => handleChange(e)}
                      value={leafAmendment.groupID}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled
                      }}
                    >
                      <MenuItem value="0">--Select Group--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Factory *
                    </InputLabel>
                    <TextField
                      select
                      fullWidth
                      name="factoryID"
                      onChange={e => handleChange(e)}
                      value={leafAmendment.factoryID}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled
                      }}
                    >
                      <MenuItem value="0">--Select Factory--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <InputLabel
                      shrink
                      id="applicableMonth"
                      style={{ marginBottom: '-8px' }}
                    >
                      Collected Date *
                    </InputLabel>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <KeyboardDatePicker
                        fullWidth
                        inputVariant="outlined"
                        format="dd/MM/yyyy"
                        margin="dense"
                        id="date-picker-inline"
                        value={selectedDate}
                        minDate={MinMonth}
                        maxDate={new Date()}
                        onChange={e => {
                          handleDateChange(e);
                        }}
                        KeyboardButtonProps={{
                          'aria-label': 'change date'
                        }}
                        size="small"
                        autoOk
                      />
                    </MuiPickersUtilsProvider>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="routeID">
                      Route
                    </InputLabel>
                    <TextField
                      select
                      fullWidth
                      name="routeID"
                      onChange={e => handleChange(e)}
                      value={leafAmendment.routeID}
                      variant="outlined"
                      size="small"
                    >
                      <MenuItem value="0">--Select Route--</MenuItem>
                      {generateDropDownMenu(routes)}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="registrationNumber">
                      Reg Number
                    </InputLabel>
                    <TextField
                      fullWidth
                      name="registrationNumber"
                      onChange={e => handleChange(e)}
                      value={leafAmendment.registrationNumber}
                      variant="outlined"
                      id="registrationNumber"
                      size="small"
                    ></TextField>
                  </Grid>
                </Grid>
                <Box display="flex" flexDirection="row-reverse" p={2}>
                  <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                    size="small"
                    onClick={() => trackPromise(getLeafAmendmentDetails())}
                  >
                    Search
                  </Button>
                </Box>
              </CardContent>
              <Box minWidth={1050}>
                <MaterialTable
                  title="Leaf Amendment"
                  fullWidth
                  columns={columns}
                  data={state}
                  options={{
                    showTitle: false,
                    actionsColumnIndex: -1,
                    exportButton: false
                  }}
                  editable={{
                    onRowUpdate: (newData, oldData) => {
                      return new Promise(resolve => {
                        const clonedData = [...state];
                        if (newData == '') {
                          clonedData[oldData.tableData.id] = oldData;
                          setState(clonedData);
                        } else {
                          clonedData[oldData.tableData.id] = newData;
                          setState(clonedData);
                        }
                        trackPromise(UpdateLeafAmendment(newData));
                        setTimeout(resolve, 600);
                      });
                    }
                  }}
                  actions={[
                    {
                      icon: 'delete',
                      onClick: (event, oldData) => {
                        setDeletingRow(oldData);
                        setDialogActionData(oldData);
                        setDeleteConfirmationOpen(true);
                      }
                    }
                  ]}
                />
              </Box>
              <Dialog
                open={deleteConfirmationOpen}
                onClose={handleDeleteConfirmationClose}
              >
                <DialogTitle id="alert-dialog-slide-title">
                  {' '}
                  <Typography color="textSecondary" gutterBottom variant="h3">
                    <Box textAlign="center">{'Leaf Amendment'}</Box>
                  </Typography>
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    {'Are you sure you want to delete Registration Number ' +
                      deletingRow?.registrationNumber +
                      ' Crop Weight ' +
                      deletingRow?.netWeight +
                      ' Kg ?'}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleDeleteConfirmationClose}
                    color="primary"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      DeleteLeafAmendment();
                      const data = [...state];
                      data.splice(data.indexOf(deletingRow), 1);
                      setState(data);
                      handleDeleteConfirmationClose();
                    }}
                    variant="contained"
                    color="secondary"
                    className={classes.button}
                    startIcon={<DeleteIcon />}
                  >
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </PerfectScrollbar>

            {/* {dialog ?
                  <AlertDialogWithoutButton confirmData={deleteConfirmationOpen} cancelData={handleDeleteConfirmationClose}
                    headerMessage={"Customer Maintenance"}
                    discription={"Added customer details will be not save, Are you sure you want to leave?"} />
                  : null
                }*/}
          </Card>
        </Box>
      </Container>
    </Page>
  );
}

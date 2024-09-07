import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Button } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import MaterialTable from 'material-table';
import { useAlert } from "react-alert";
import moment from 'moment';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Typography from '@material-ui/core/Typography';


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
  btnApprove: {
    backgroundColor: "green",
  },
}));

const screenCode = "LEAFAMENDMENT"
export default function LeafAmendmentListing(props) {
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [leafAmendment, setLeafAmendment] = useState({
    groupID: '0',
    factoryID: '0',
    routeID: '0',
    registrationNumber: ''
  })

  const navigate = useNavigate();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [selectedDate, handleDateChange] = useState(new Date());
  const [routes, setRoutes] = useState();
  const alert = useAlert();
  const valueChecker = /^\d+(\.[1-9])?$/;
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = React.useState(false);

  const [selectionRow, setselectionRow] = React.useState([]);
  const [data, setData] = useState([])
  const columns = [
      {
        title: 'Customer Name', field: 'customerName', editable: 'never', cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: "left",
          marginLeft: '20rem'
        }, headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: "left",
          marginLeft: '20rem'
        }
      },
      {
        title: 'Registration Number', field: 'registrationNumber', editable: 'never', cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: "left",
          marginLeft: '20rem'
        }, headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: "left",
          marginLeft: '20rem'
        }
      },
      {
        title: 'Collection Type', field: 'collectionTypeName', editable: 'never', cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: "left",
          marginLeft: '20rem'
        }, headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: "left",
          marginLeft: '20rem'
        }
      },
      {
        title: 'Net Weight(KG)', field: 'netWeight', type: 'numeric', validate: rowData => (valueChecker.test(rowData.netWeight) ? true : 'Only allow positive numbers with one decimal'),
        cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: "center"
        }, headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: "center"
        },
      }
    ]

  const [btnEnable, setBtnEnable] = useState(false);

  const [finishStatus, setfinishStatus] = useState(false);

  const onBackButtonEvent = (e) => {
    e.preventDefault();
    if (!finishStatus) {
      if (window.confirm("Do you want to go back ?")) {
        setfinishStatus(true)
        navigate("/app/dashBoard");
      } else {
        window.history.pushState(null, null, window.location.pathname);
        setfinishStatus(false)
      }
    }
  };

  useEffect(() => {
    trackPromise(getPermission(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown());
  }, [leafAmendment.groupID]);

  useEffect(() => {
    trackPromise(getRoutesForDropDown());
  }, [leafAmendment.factoryID]);

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', onBackButtonEvent);
    return () => {
      window.removeEventListener('popstate', onBackButtonEvent);
    };
  }, []);

  const handleDeleteConfirmationClose = () => {
    setselectionRow(null);
    setDeleteConfirmationOpen(false);
  };
  async function getRoutesForDropDown() {
    const routeList = await services.getRoutesForDropDown(leafAmendment.factoryID);
    setRoutes(routeList);
  }

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITLEAFAMENDMENT');

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

    setLeafAmendment({
      ...leafAmendment,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getLeafNotificationDetails() {
    setData([])
    let date = moment(selectedDate).format('YYYY-MM-DD')
    var result = await services.getLeafNotificationDetails(leafAmendment.routeID,date);
    if(result.statusCode == "Success"){
      if(result.data.length == 0){
        alert.error("No records to display");
        return;
      }else{
        setData(result.data)
      }
    }else{
      alert.error("Error in fetching data");
    }
  }


  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(leafAmendment.groupID);
    setFactories(factories);
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
    )
  }

  async function addToList(row){
    if(row?.length > 0){
      setBtnEnable(true);
    }else{
      setBtnEnable(false);
    }
    setselectionRow(row);
  }

  async function sendSMS() {
    var dataArray = []
    selectionRow.map((i) => {
      dataArray.push(i.factoryLeafEnteringTempID)
    })
    var obj = {
      factoryLeafEnteringTempIDs: dataArray
    }
    var result = await services.sendSMS(obj)
    if (result?.statusCode == "Success" && result.data) {
      alert.success('Successfully Notified Via SMS!')
    } else {
      alert.error('Error :' + result?.message)
    }
  };
  async function sendSMSModalPopup(){
    setDeleteConfirmationOpen(true);
  }
  return (
    <Page
      className={classes.root}
      title="Notifications"
    >
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
            <CardHeader
              title={cardTitle("Notifications")}
            />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: "2rem" }}>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="groupID">
                      Group  *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="groupID"
                      onChange={(e) => handleChange(e)}
                      value={leafAmendment.groupID}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled,
                      }}
                    >
                      <MenuItem value="0">--Select Group--</MenuItem>
                      {generateDropDownMenu(groups)}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="factoryID">
                      Factory  *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="factoryID"
                      onChange={(e) => handleChange(e)}
                      value={leafAmendment.factoryID}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled,
                      }}
                    >
                      <MenuItem value="0">--Select Factory--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="routeID">
                      Route *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      name="routeID"
                      onChange={(e) => handleChange(e)}
                      value={leafAmendment.routeID}
                      variant="outlined"
                      size="small"
                    >
                      <MenuItem value="0">--Select Route--</MenuItem>
                      {generateDropDownMenu(routes)}
                    </TextField>
                  </Grid>

                </Grid>
                <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="date-picker-inline" style={{ marginBottom: '-8px' }}>
                              Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                required
                                inputVariant="outlined"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="date-picker-inline"
                                value={selectedDate}
                                maxDate={new Date()}
                                onChange={(e) => {
                                  handleDateChange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                size="small"
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>

                <Box display="flex" flexDirection="row-reverse" p={2} >
                  <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                    size='small'
                    onClick={() => trackPromise(getLeafNotificationDetails())}
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
                  data={data}
                  options={{ showTitle: false, exportButton: false ,  selection: true }}
                  onSelectionChange={(rows) => addToList(rows)}
                />
              </Box>
              <Dialog open={deleteConfirmationOpen} onClose={handleDeleteConfirmationClose}>
              <DialogTitle id="alert-dialog-slide-title"> <Typography
          color="textSecondary"
          gutterBottom
          variant="h3"
        >
          <Box textAlign="center" >
            {"Product Collection Notification"}
          </Box>

        </Typography></DialogTitle>
                <DialogContent>
                <DialogContentText>
                  {"Are you sure you want to send notification SMS to selected customers ?"}
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleDeleteConfirmationClose} color="primary">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      sendSMS()
                      handleDeleteConfirmationClose();
                    }}
                    color="secondary"
                  >
                    Send
                  </Button>

       
                </DialogActions>
              </Dialog>

            </PerfectScrollbar>

            <Box display="flex" justifyContent="flex-end" p={2}>
              <Button
                color="primary"
                disabled={!btnEnable}
                type="submit"
                onClick={() => sendSMSModalPopup()}
                variant="contained"
                className={classes.btnApprove}
              >
                Send
              </Button>
            </Box>
          </Card>
        </Box>
      </Container>
    </Page>
  );
};

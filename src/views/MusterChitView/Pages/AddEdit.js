import React, { useState, useEffect, createContext, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Button,
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
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { LoadingComponent } from './../../../utils/newLoader';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { useAlert } from "react-alert";
import MaterialTable from "material-table";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
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

const screenCode = 'MUSTERCHIT';
export default function DirectSaleListing() {
  const classes = useStyles();
  const [title, setTitle] = useState("Muster Chit View");
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState();
  const [divisions, setDivisions] = useState();
  const [detailsTable, setDeatilsTable] = useState([]);
  const [openPlot, setOpenPlot] = useState(false);
  const [limit, setLimit] = useState(10);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [musterChitDetailList, setMusterChitDetailList] = useState([]);
  const [musterChitDetails, setMusterChitDetails] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0',
    date: new Date()
  });
  const navigate = useNavigate();
  let encrypted = '';
  const alert = useAlert();
  const [page, setPage] = useState(0);
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const handleClose = () => {
    setOpenPlot(false);
  };

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
      getPermissions(),
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getEstateDetailsByGroupID(musterChitDetails.groupID)
    )
  }, [musterChitDetails.groupID]);

  useEffect(() => {
    trackPromise(
      getDivisionDetailsByEstateID(musterChitDetails.estateID)
    )
  }, [musterChitDetails.estateID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWMUSTERCHIT'
    );

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

    setMusterChitDetails({
      ...musterChitDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID(groupID) {
    const estates = await services.getEstateDetailsByGroupID(musterChitDetails.groupID);
    setEstates(estates);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(musterChitDetails.estateID);
    setDivisions(response);
  };

  async function GetMusterChitDetails() {
    let searchmodel = {
      estateID: parseInt(musterChitDetails.estateID),
      divisionID: parseInt(musterChitDetails.divisionID),
      date: musterChitDetails.date.toISOString().split('T')[0],
    }
    const response = await services.getMusterChitDetails(searchmodel);
    if (response.data.length !== 0) {
      setMusterChitDetailList(response.data);
    }
    else {

      alert.error("No data found");
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
    setMusterChitDetails({
      ...musterChitDetails,
      [e.target.name]: value
    })
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setMusterChitDetails({
      ...musterChitDetails,
      [e.target.name]: value
    });
    setMusterChitDetailList([]);

  }

  function handleDateChange(e) {
    setMusterChitDetails({
      ...musterChitDetails,
      date: e
    });
  }
  const maxDate = new Date();

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    );
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: musterChitDetails.groupID,
              estateID: musterChitDetails.estateID,
              date: musterChitDetails.date,
              divisionID: musterChitDetails.divisionID,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                estateID: Yup.number().required('Estate is required').min("1", 'Factory is required'),
                divisionID: Yup.number().required('Division is required').min("1", 'Division is required'),
                date: Yup.date().required('Date is required').min("1", 'Date is required'),
              })
            }
            onSubmit={() => trackPromise(GetMusterChitDetails())}
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
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={musterChitDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={musterChitDetails.estateID}
                              variant="outlined"
                              size='small'
                              id="estateID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="divisionID">
                              Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.divisionID && errors.divisionID)}
                              fullWidth
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={musterChitDetails.divisionID}
                              variant="outlined"
                              id="divisionID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="date">
                              Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.date && errors.date)}
                                helperText={touched.date && errors.date}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="date"
                                id="date"
                                value={musterChitDetails.date}
                                onChange={(e) => handleDateChange(e)}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                                maxDate={maxDate}
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
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>

                      <Box minWidth={1050} marginLeft={2} marginRight={2}>
                        {musterChitDetailList.length > 0 ?
                          <TableContainer component={Paper}>
                            <Table className={classes.table} aria-label="simple table">
                              <TableHead>
                                <TableRow style={{ border: "2px solid black" }}>
                                  <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black" }}>Master Chit Number</TableCell>
                                  <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", width: "180px" }}>Division</TableCell>
                                  <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", width: "180px" }}>Field</TableCell>
                                  <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", width: "180px" }}>Lent Division</TableCell>
                                  <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", width: "180px" }}>Lent Field</TableCell>
                                  <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black" }}>Attendance Type</TableCell>
                                  <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", width: "150px" }}>Job Type</TableCell>
                                  <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", width: "80px" }}>Employee Count</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {musterChitDetailList.slice(page * limit, page * limit + limit).map((row, i) => (
                                  <TableRow style={{ border: "2px solid black" }} key={i}>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.musterChitNumber}</TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}>
                                      {row.divisionName !== null ? row.divisionName : '-'}
                                    </TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}>
                                      {row.fieldName !== null ? row.fieldName : '-'}
                                    </TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}>
                                      {row.lentdivisionName !== null ? row.lentdivisionName : '-'}
                                    </TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}>
                                      {row.lentfieldName !== null ? row.lentfieldName : '-'}
                                    </TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}>
                                      {row.jobTypeID === 1 ? 'Plucking' : 'Sundry'}
                                    </TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}>
                                      {row.jobTypeID === 1 ? row.pluckingJobName : row.sundryJobName}
                                    </TableCell>
                                    <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}> {row.employeeCount}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <TablePagination
                              component="div"
                              count={musterChitDetailList.length}
                              onChangePage={handlePageChange}
                              onChangeRowsPerPage={handleLimitChange}
                              page={page}
                              rowsPerPage={limit}
                              rowsPerPageOptions={[5, 10, 25]}
                            />
                          </TableContainer>
                          : null}
                      </Box>

                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>


        </Container>
        <Dialog fullWidth={true} maxWidth="lg" open={openPlot} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Muster Chit Detail View</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <Container>
                <MaterialTable
                  title="Multiple Actions Preview"
                  columns={[
                    { title: 'Division Name', field: 'divisionName' },
                    {
                      title: 'Type',
                      field: 'jobTypeID',
                      lookup: {
                        1: 'Plucking',
                        2: 'Sundry'
                      }
                    },
                    {
                      title: 'Field',
                      field: 'fieldName',
                      render: rowData => rowData.lentdivisionName != null ? '-' : rowData.fieldName
                    },
                    {
                      title: 'Lent Division',
                      field: 'lentdivisionName',
                      render: rowData => rowData.lentdivisionName == null ? '-' : rowData.lentdivisionName
                    },
                    {
                      title: 'Lent Division Field',
                      field: 'lentfieldName',
                      render: rowData => rowData.lentfieldName == null ? '-' : rowData.lentfieldName
                    },
                    {
                      title: 'Job Type',
                      render: rowData => rowData.jobTypeID == 1 ? rowData.pluckingJobName : rowData.sundryJobName
                    },
                    { title: 'Employee Count', field: 'employeeCount' },
                  ]}
                  data={detailsTable}
                  options={{
                    exportButton: false,
                    showTitle: false,
                    headerStyle: { textAlign: "left", height: '1%' },
                    cellStyle: { textAlign: "left" },
                    columnResizable: false,
                    actionsColumnIndex: -1,
                    pageSize: 5
                  }}

                />
              </Container>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              CLOSE
            </Button>
          </DialogActions>
        </Dialog>
      </Page>
    </Fragment>
  );
}

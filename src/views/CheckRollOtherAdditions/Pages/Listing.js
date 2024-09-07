import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import * as Yup from "yup";
import { Formik } from 'formik';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

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

const screenCode = 'OTHEREARNINGS';
export default function OtherEarnings() {
  const classes = useStyles();
  const alert = useAlert();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [otherEarningTypes, setOtherearningType] = useState([]);
  const [isShowTable, setIsShowTable] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [divisions, setDivisions] = useState([]);
  const [otherEarningData, setOtherEarningData] = useState([]);
  const [initialLoad, setInitialLoad] = useState(null);
  const [OtherEarningList, setOtherEarningList] = useState({
    groupID: 0,
    estateID: 0,
    divisionID: 0,
    otherEarningType: 0,
    year: new Date().getUTCFullYear().toString(),
    month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0'),
  })

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [selectedCheckRollOtherEarningID, setSelectedCheckRollOtherEarningID] = useState(0);
  const navigate = useNavigate();
  let encrypted = "";

  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/CheckrollOtherEarnings/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    const IDdata = JSON.parse(
      sessionStorage.getItem('otherEarning-page-search-parameters-id')
    );
    getPermissions(IDdata)
  }, []);

  useEffect(() => {
    sessionStorage.removeItem(
      'otherEarning-page-search-parameters-id'
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
      getOtherEarningType(),
    );
  }, []);

  useEffect(() => {
    if (OtherEarningList.groupID > 0) {
      trackPromise(getEstateDetailsByGroupID());
    };
  }, [OtherEarningList.groupID]);

  useEffect(() => {
    if (OtherEarningList.estateID > 0) {
      trackPromise(
        getDivisionDetailsByEstateID());
    };
  }, [OtherEarningList.estateID]);

  useEffect(() => {
    setOtherEarningList({
      ...OtherEarningList,
      year: new Date().getUTCFullYear().toString(),
      month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    });
  }, [OtherEarningList.divisionID]);

  useEffect(() => {
    setOtherEarningList({
      ...OtherEarningList,
      year: new Date().getUTCFullYear().toString(),
      month: (new Date().getUTCMonth() + 1).toString().padStart(2, '0')
    });
  }, [OtherEarningList.divisionID]);

  useEffect(() => {
    if (initialLoad != null) {
      trackPromise(getOtherEarningByGroupIDEstateIDDivisionIDMonth())
    }
  }, [initialLoad]);

  async function getPermissions(IDdata) {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWOTHEREARNING');

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

    const isDefaultLoad = IDdata === null;

    if (isDefaultLoad) {

      const groupID = parseInt(tokenService.getGroupIDFromToken());
      const estateID = parseInt(tokenService.getFactoryIDFromToken());

      setOtherEarningList({
        ...OtherEarningList,
        groupID,
        estateID,
      });

      setSelectedDate(new Date());
    } else {
      const groupID =IDdata.groupID;
      const estateID = IDdata.estateID;
      const divisionID = IDdata.divisionID;
      const otherEarningType = IDdata.otherEarningType;
      const month = (IDdata.month).toString().padStart(2, '0');
      const year = (IDdata.year).toString();

      setOtherEarningList({
        ...OtherEarningList,
        groupID,
        estateID,
        divisionID,
        otherEarningType,
        month,
        year,
      });

      setSelectedDate(new Date(`${year}-${month}-01`));
    }
    setInitialLoad(IDdata);
  }

  async function getOtherEarningByGroupIDEstateIDDivisionIDMonth() {
    let model = {
      groupID: parseInt(OtherEarningList.groupID),
      estateID: parseInt(OtherEarningList.estateID),
      divisionID: parseInt(OtherEarningList.divisionID),
      otherEarningType: parseInt(OtherEarningList.otherEarningType),
      month: (new Date(selectedDate).getUTCMonth() + 1).toString().padStart(2, '0'),
      year: new Date(selectedDate).getUTCFullYear().toString()
    };

    let item = await services.getAllOtherEarningDetails(model);
    if (item.data.length !== 0 && item.statusCode === 'Success') {
      setOtherEarningData(item.data);
      setIsShowTable(true);

    } else {
      setOtherEarningData(item.data);
      alert.error("No Records To Display")
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(OtherEarningList.estateID);
    setDivisions(response);
  };
  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(OtherEarningList.groupID);
    setEstates(response);
  }

  async function getOtherEarningType() {
    var response = await services.getOtherEarningType();
    setOtherearningType(response);
  };

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
    setOtherEarningList({
      ...OtherEarningList,
      [e.target.name]: value,
      month: (selectedDate.getMonth() + 1).toString().padStart(2, '0'),
      year: selectedDate.getUTCFullYear().toString(),
    });
    setOtherEarningData([]);
  }

  function handleDateChange(date, IDdata) {
    var month = date.getUTCMonth() + 1;
    var year = date.getUTCFullYear();

    setOtherEarningList({
      ...OtherEarningList,
      month: month.toString().padStart(2, '0'),
      year: year.toString()
    });

    if (selectedDate != null) {
      var prevyear = selectedDate.getUTCFullYear();
      var prevMonth = selectedDate.getUTCMonth() + 1;

      if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
        setSelectedDate(date);
      }
    } else {
      setSelectedDate(date);
    }
    setOtherEarningData([]);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(OtherEarningList.estateID);
    setDivisions(response);
  };

  const handleClickEdit = (otherEarningID) => {
    encrypted = btoa(otherEarningID);
    let modelID = {
      groupID: parseInt(OtherEarningList.groupID),
      estateID: parseInt(OtherEarningList.estateID),
      divisionID: parseInt(OtherEarningList.divisionID),
      otherEarningType: parseInt(OtherEarningList.otherEarningType),
      month: (new Date(selectedDate).getUTCMonth() + 1).toString().padStart(2, '0'),
      year: new Date(selectedDate).getUTCFullYear().toString()
    };
    sessionStorage.setItem('otherEarning-page-search-parameters-id', JSON.stringify(modelID));
    navigate('/app/CheckrollOtherEarnings/addEdit/' + encrypted);
  }

  async function handleClickDelete(otherEarningID) {
    setSelectedCheckRollOtherEarningID(otherEarningID);
    setDeleteConfirmationOpen(true);
  }

  const handleConfirmDelete = async (checkRollOtherEarningViewDetails) => {
    setDeleteConfirmationOpen(false);
    let model = {
      otherEarningID: selectedCheckRollOtherEarningID,
      modifiedBy: parseInt(tokenService.getUserIDFromToken())
    }
    const res = await services.DeleteOtherEarning(model);
    if (res.statusCode == "Success") {
      alert.success(res.message)
      trackPromise(getOtherEarningByGroupIDEstateIDDivisionIDMonth())
    }
    else {
      alert.error(res.message)
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
  };

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader
            onClick={handleClick}
            isEdit={true}
            toolTiptitle={"Add Other Earning"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Page
      className={classes.root}
      title="Other Earning"
    >
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: OtherEarningList.groupID,
            estateID: OtherEarningList.estateID,
            divisionID: OtherEarningList.divisionID,
            year: OtherEarningList.year,
            month: OtherEarningList.month
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
              estateID: Yup.number().min(1, "Please Select a Estate").required('Estate is required'),
              divisionID: Yup.number().required('Division is required').min("1", 'Division is required'),
            })
          }
          onSubmit={() => trackPromise(getOtherEarningByGroupIDEstateIDDivisionIDMonth())}
          enableReinitialize
        >
          {({ errors, handleBlur, handleSubmit, touched }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={0}>
                <Card>
                  <CardHeader
                    title={cardTitle("Other Earning")}
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
                            error={Boolean(touched.groupID && errors.groupID)}
                            helperText={touched.groupID && errors.groupID}
                            name="groupID"
                            onChange={(e) => handleChange(e)}
                            value={OtherEarningList.groupID}
                            variant="outlined"
                            size='small'
                            InputProps={{
                              readOnly: !permissionList.isGroupFilterEnabled,
                            }}
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>

                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="estateID">
                            Estate *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            error={Boolean(touched.estateID && errors.estateID)}
                            helperText={touched.estateID && errors.estateID}
                            name="estateID"
                            size='small'
                            onChange={(e) => {
                              handleChange(e)
                            }}
                            value={OtherEarningList.estateID}
                            variant="outlined"
                            id="estateID"
                            InputProps={{
                              readOnly: !permissionList.isFactoryFilterEnabled ? true : false
                            }}
                          >
                            <MenuItem value={0}>--Select Estate--</MenuItem>
                            {generateDropDownMenu(estates)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="divisionID">
                            Division *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            error={Boolean(touched.divisionID && errors.divisionID)}
                            helperText={touched.divisionID && errors.divisionID}
                            name="divisionID"
                            size='small'
                            onChange={(e) => {
                              handleChange(e)
                            }}
                            value={OtherEarningList.divisionID}
                            variant="outlined"
                            id="divisionID"
                          >
                            <MenuItem value={0}>--Select Division--</MenuItem>
                            {generateDropDownMenu(divisions)}
                          </TextField>
                        </Grid>

                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="otherEarningType">
                            Other Earning Type
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="otherEarningType"
                            size='small'
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={OtherEarningList.otherEarningType}
                            variant="outlined"
                            id="otherEarningType"
                          >
                            <MenuItem value={0}>--Select Other Earning Type--</MenuItem>
                            {generateDropDownMenu(otherEarningTypes)}
                          </TextField>
                        </Grid>

                        <Grid item md={4} xs={12}>
                          <InputLabel style={{ fontSize: '0.700rem' }}>Month and Year *</InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              fullWidth
                              margin="normal"
                              id="date-picker-dialog"
                              format="MMMM yyyy"
                              views={['year', 'month']}
                              value={selectedDate}
                              onChange={(date) => handleDateChange(date)}
                              disableFuture={true}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>

                        <Grid item md={12} xs={12}>
                          <Box style={{ display: 'flex', justifyContent: 'end', paddingTop: '2vh' }}>
                            <Button
                              size="small"
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

                    <Box minWidth={1050}>
                      {otherEarningData.length > 0 && isShowTable ? (
                        <MaterialTable
                          title="Multiple Actions Preview"
                          columns={[
                            { title: 'Employee Number', field: 'registarionNumber' },
                            { title: 'Employee Name', field: 'employeeName' },
                            { title: 'Other Earning Type', field: 'otherEarningTypeName' },
                            {
                              title: 'Amount (Rs.)',
                              field: 'amount',
                              render: rowData => rowData.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                              cellStyle: {
                                textAlign: 'right',
                                paddingRight: '200px',
                              },
                            }
                          ]}
                          data={otherEarningData}
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
                            {
                              icon: 'mode',
                              tooltip: 'Edit OtherEarning',
                              onClick: (event,rowData) => { handleClickEdit(rowData.otherEarningID) }
                            },
                            {
                              icon: 'delete',
                              tooltip: 'Delete',
                              onClick: (event, rowData) => handleClickDelete(rowData.otherEarningID)
                            }
                          ]}
                        />
                      ) : null}
                    </Box>

                    <Dialog open={deleteConfirmationOpen} onClose={handleCancelDelete}>
                      <DialogTitle>Delete Confirmation</DialogTitle>
                      <DialogContent>
                        <p>Are you sure you want to delete this record ?</p>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={handleConfirmDelete} color="primary">
                          Delete
                        </Button>
                        <Button
                          onClick={handleCancelDelete} color="primary">
                          Cancel
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </PerfectScrollbar>
                </Card>
              </Box>
            </form>
          )}
        </Formik>
      </Container>
    </Page>
  );
};

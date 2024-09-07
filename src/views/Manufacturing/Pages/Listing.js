import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import VisibilityIcon from '@material-ui/icons/Visibility';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

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
  row: {
    marginTop: '1rem'
  }
}));

const screenCode = 'MANUFACTURING';

export default function ManufacturingListing() {
  const [title, setTitle] = useState("Manufacturing");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [manufacturingDetail, setManufacturingDetail] = useState({
    groupID: 0,
    factoryID: 0,
    date: new Date(),
    statusID: "0"
  });
  const [manufactureList, setManufactureList] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const alert = useAlert();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/manufacturing/addEdit/' + encrypted)
  }

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [manufacturingDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWMANUFACTURING');
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
    setManufacturingDetail({
      ...manufacturingDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(manufacturingDetail.groupID);
    setFactoryList(factories);
  }

  async function GetManufacturingList() {
    const response = await services.GetBatchDetailsToManufactureScreen(
      manufacturingDetail.groupID,
      manufacturingDetail.factoryID,
      manufacturingDetail.date,
      parseInt(manufacturingDetail.statusID)
    );
    if (response.length > 0) {
      setManufactureList(response);
    }
    else {
      alert.error('No records to display');
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

  function generateFactoryDropDownMenu(data) {
    let items = []
    if (data != null) {
      FactoryList.forEach(x => {
        items.push(<MenuItem key={x.factoryID} value={x.factoryID}>{x.factoryName}</MenuItem>)
      });
    }
    return items
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setManufacturingDetail({
      ...manufacturingDetail,
      [e.target.name]: value
    });
    setManufactureList([]);
  }

  function handleDateChange(value) {
    setManufacturingDetail({
      ...manufacturingDetail,
      date: value
    });
    setManufactureList([]);
  }

  const handleClickEdit = () => {
    // encrypted = btoa(gradeID.toString());
    // navigate('/app/grade/addEdit/' + encrypted);
  }

  function clearFormFields() {
    setManufacturingDetail({
      ...manufacturingDetail,
      statusID: 0,
      date: new Date()
    });
    setManufactureList([]);
  }

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
            toolTiptitle={"Add Manufacturing"}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: manufacturingDetail.groupID,
              factoryID: manufacturingDetail.factoryID,
              date: manufacturingDetail.date,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                date: Yup.date().typeError('Invalid date').nullable()
              })
            }
            onSubmit={() => trackPromise(GetManufacturingList())}
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
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={manufacturingDetail.groupID}
                            variant="outlined"
                            id="groupID"
                            disabled={!permissionList.isGroupFilterEnabled}
                            size='small'
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
                            name="factoryID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={manufacturingDetail.factoryID}
                            variant="outlined"
                            id="factoryID"
                            disabled={!permissionList.isFactoryFilterEnabled}
                            size='small'
                          >
                            <MenuItem value="0">--Select Factory--</MenuItem>
                            {generateFactoryDropDownMenu(FactoryList)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={8}>
                          <InputLabel shrink id="date">
                            Manufacture From Date
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
                              id="date"
                              name="date"
                              value={manufacturingDetail.date}
                              onChange={(e) => handleDateChange(e)}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                              InputProps={{ readOnly: true }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="statusID">
                            Status
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="statusID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={manufacturingDetail.statusID}
                            variant="outlined"
                            id="statusID"
                            size='small'
                          >
                            <MenuItem value="0">--- Select Status ---</MenuItem>
                            <MenuItem value="1">New</MenuItem>
                            <MenuItem value="2">Withering Done</MenuItem>
                            <MenuItem value="3">Rolling Done</MenuItem>
                            <MenuItem value="4">Firing Done</MenuItem>
                            <MenuItem value="5">Completed</MenuItem>
                          </TextField>
                        </Grid>
                      </Grid>
                      <Box display="flex" justifyContent="flex-end" p={2} >
                        <Button
                          color="primary"
                          type="reset"
                          variant="outlined"
                          onClick={() => clearFormFields()}
                          size='small'
                        >
                          Clear
                        </Button>
                        <div>&nbsp;</div>
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
                    <PerfectScrollbar>
                      <Box minWidth={1050}>
                        <Card >
                          {manufactureList.length > 0 ?
                            <MaterialTable
                              title="Multiple Actions Preview"
                              columns={[
                                { title: 'Job Name', field: 'jobName' },
                                {
                                  title: 'Mf. Date (From)', field: 'manufacturedDateFrom',
                                  render: rowData => rowData.manufacturedDateFrom.split('T')[0] + ' ' + rowData.manufacturedDateFrom.split('T')[1]
                                },
                                {
                                  title: 'Mf. Date (To)', field: 'manufacturedDateTo',
                                  render: rowData => rowData.manufacturedDateTo.split('T')[0] + ' ' + rowData.manufacturedDateTo.split('T')[1]
                                },
                                {
                                  title: 'Status', field: 'statusID',
                                  render: rowData => {
                                    if (rowData.statusID == 1)
                                      return "New"
                                    else if (rowData.statusID == 2)
                                      return "Withering Done"
                                    else if (rowData.statusID == 3)
                                      return "Rolling Done"
                                    else if (rowData.statusID == 4)
                                      return "Firing Done"
                                    else return "Job Done"
                                  }
                                },
                                { title: 'Created By', field: 'empName' }
                              ]}
                              data={manufactureList}
                              options={{
                                exportButton: false,
                                showTitle: false,
                                headerStyle: { textAlign: "left", border: '0.5px solid #1c1c1c' },
                                cellStyle: { textAlign: "left", border: '0.5px solid #1c1c1c' },
                                columnResizable: false,
                                actionsColumnIndex: -1,
                                actionsCellStyle: {
                                  border: '0.5px solid #1c1c1c',
                                },
                                actionsHeaderStyle: {
                                  border: '0.5px solid #1c1c1c',
                                },
                                pageSize: 5,
                                search: false,
                              }}
                              actions={[{
                                icon: 'edit',
                                tooltip: 'Edit',
                                onClick: (event, rowData) => handleClickEdit()
                              }]}
                            />
                            : null}
                        </Card>
                      </Box>
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

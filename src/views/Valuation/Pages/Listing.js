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
import tokenService from '../../../utils/tokenDecoder'
import { LoadingComponent } from './../../../utils/newLoader';
import MaterialTable from "material-table";
import { useAlert } from 'react-alert';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import VisibilityIcon from '@material-ui/icons/Visibility';

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

const screenCode = 'VALUATION';

export default function ValuationListing() {
  const [title, setTitle] = useState("Valuation");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [valuationRequestDetail, setValuationRequestDetail] = useState({
    groupID: 0,
    factoryID: 0,
    sellingDate: null
  });
  const [buyerList, setBuyerList] = useState([]);
  const [valuationData, setValuationData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const alert = useAlert();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/valuation/addEdit/' + encrypted)
  }
  const handleClickEdit = (valuationID) => {
    encrypted = btoa(valuationID.toString());
    navigate('/app/valuation/addEdit/' + encrypted);
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
  }, [valuationRequestDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWVALUATION');

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

    setValuationRequestDetail({
      ...valuationRequestDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(valuationRequestDetail.groupID);
    setFactoryList(factories);
  }

  async function getValuationDetails() {
    const response = await services.getValuationDetails(valuationRequestDetail.groupID, valuationRequestDetail.factoryID, valuationRequestDetail.sellingDate);
    if (response.statusCode == "Success" && response.data != null) {
      setValuationData(response.data);
      if (response.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error(response.message);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setValuationRequestDetail({
      ...valuationRequestDetail,
      [e.target.name]: value
    });
    setBuyerList([]);
  }

  function handleDateChange(value) {
    setValuationRequestDetail({
      ...valuationRequestDetail,
      sellingDate: value
    });
    setValuationData([])
  }

  function clearFormFields() {
    setValuationRequestDetail({
      ...valuationRequestDetail,
      sellingDate: null
    });
    setValuationData([])
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
            toolTiptitle={"Add Valuation"}
          />
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
              groupID: valuationRequestDetail.groupID,
              factoryID: valuationRequestDetail.factoryID,
              sellingDate: valuationRequestDetail.sellingDate
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                sellingDate: Yup.date().typeError('Invalid date').nullable(),
              })
            }
            onSubmit={() => trackPromise(getValuationDetails())}
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
                              value={valuationRequestDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
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
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={valuationRequestDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              size='small'
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="sellingDate">
                              Selling Date
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.sellingDate && errors.sellingDate)}
                                helperText={touched.sellingDate && errors.sellingDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="sellingDate"
                                id="sellingDate"
                                value={valuationRequestDetail.sellingDate}
                                onChange={(e) => {
                                  handleDateChange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
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
                      <Box minWidth={1000}>
                        {valuationData.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Selling Date', field: 'sellingDate', render: rowData => rowData.sellingDate.split('T')[0] },
                              { title: 'Inv No', field: 'invoiceNo' },
                              { title: 'LOT Number', field: 'lotNumber' },
                              { title: 'Valuation Type', field: 'valuationTypeID', render: rowData => rowData.valuationTypeID == 1 ? 'Factory' : rowData.valuationTypeID == 2 ? 'Broker' : '' },
                              { title: 'Selling Mark', field: 'sellingMarkName' },
                              { title: 'Broker', field: 'brokerName' },
                              { title: 'Grade', field: 'gradeName' },
                              { title: 'Value Rate', field: 'valueRate', render: rowData => rowData.valueRate.toFixed(2) },
                              { title: 'Value Amount', field: 'valueAmount', render: rowData => rowData.valueAmount.toFixed(2) },
                            ]}
                            data={valuationData}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 10
                            }}
                            actions={[{
                              icon: VisibilityIcon,
                              tooltip: 'View',
                              onClick: (event, rowData) => handleClickEdit(rowData.valuationID)
                            }]}
                          />
                          : null}
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

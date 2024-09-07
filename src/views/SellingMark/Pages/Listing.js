import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, Container, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { LoadingComponent } from './../../../utils/newLoader';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker } from "@material-ui/pickers";
import { useFormik, Form, FormikProvider } from 'formik';
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
  },
  row: {
    marginTop: '1rem'
  }
}));

const screenCode = 'SELLINGMARK';

export default function SellingMarkListing() {
  const [title, setTitle] = useState("Selling Mark");
  const classes = useStyles();
  const alert = useAlert();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [sellingMarkList, setSellingMarkList] = useState([]);
  const [sellingMarkDetail, setSellingMarkDetail] = useState({
    groupID: 0,
    factoryID: 0,
    year: ""
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/sellingMark/addedit/' + encrypted)
  }

  const handleClickEdit = (sellingMarkID) => {
    encrypted = btoa(sellingMarkID.toString());
    navigate('/app/sellingMark/addedit/' + encrypted);
  }

  const SellingMarkSchema = Yup.object().shape({
    groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
    factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required')
  });

  const formik = useFormik({
    initialValues: {
      groupID: sellingMarkDetail.groupID,
      factoryID: sellingMarkDetail.factoryID,
      year: sellingMarkDetail.year
    },
    validationSchema: SellingMarkSchema,
    onSubmit: (values) => {
      GetSellingMarkDetails(values)
    },
  });

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (formik.values.groupID != 0) {
      trackPromise(
        getFactoriesForDropdown());
    }
  }, [formik.values.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSELLINGMARK');

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

    setValues({
      ...values,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  const { errors, setValues, touched, handleSubmit, values, handleBlur } = formik;

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(formik.values.groupID);
    setFactoryList(factories);
  }

  async function GetSellingMarkDetails() {
    let model = {
      groupID: parseInt(values.groupID),
      factoryID: parseInt(values.factoryID),
      year: selectedDate.getFullYear().toString()
    }
    const response = await services.GetSellingMarkDetails(model);

    if (response.statusCode == "Success" && response.data != null) {
      setSellingMarkList(response.data);
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

  function handleDateChange(date) {
    var year = date.getUTCFullYear();

    setSellingMarkDetail({
      ...sellingMarkDetail,
      year: year.toString()
    });
    if (selectedDate != null) {
      var prevyear = selectedDate.getUTCFullYear();

      if ((prevyear != year)) {
        setSelectedDate(date)
      }
    } else {
      setSelectedDate(date)
    }
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
            toolTiptitle={"Add Selling Mark"}
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
          <FormikProvider value={formik}>
            <Form autoComplete="off"
              disabled={!(formik.isValid && formik.dirty)}
              noValidate onSubmit={handleSubmit}
            >
              <Box mt={0}>
                <Card>
                  <CardHeader title={cardTitle(title)} />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.groupID && errors.groupID)}
                            fullWidth
                            helperText={touched.groupID && errors.groupID}
                            name="groupID"
                            onBlur={handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.groupID}
                            variant="outlined"
                            id="groupID"
                            size='small'
                            disabled={!permissionList.isGroupFilterEnabled}
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            {generateDropDownMenu(GroupList)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryID">
                            Factory *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.factoryID && errors.factoryID)}
                            fullWidth
                            helperText={touched.factoryID && errors.factoryID}
                            name="factoryID"
                            onBlur={handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.factoryID}
                            variant="outlined"
                            size='small'
                            id="factoryID"
                            disabled={!permissionList.isFactoryFilterEnabled}
                          >
                            <MenuItem value="0">--Select Factory--</MenuItem>
                            {generateDropDownMenu(FactoryList)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DatePicker
                              autoOk
                              variant="inline"
                              openTo="month"
                              views={["year"]}
                              label="Dispatch Year "
                              helperText="Select dispatch year"
                              value={selectedDate}
                              disableFuture={true}
                              onChange={(date) => handleDateChange(date)}
                              size='small'
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
                    <Box minWidth={1050}>
                      {sellingMarkList.length > 0 ?
                        <MaterialTable
                          title="Multiple Actions Preview"
                          columns={[
                            { title: 'Selling Mark Code', field: 'sellingMarkCode' },
                            { title: 'Selling Mark Name', field: 'sellingMarkName' },
                            {
                              title: 'Status', field: 'isActive',
                              render: rowData => rowData.isActive == true ? 'Active' : 'Inactive'
                            },
                          ]}
                          data={sellingMarkList}
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
                            icon: 'edit',
                            tooltip: 'Edit',
                            onClick: (event, rowData) => handleClickEdit(rowData.sellingMarkID)
                          }]}
                        /> : null}
                    </Box>
                  </PerfectScrollbar>
                </Card>
              </Box>
            </Form>
          </FormikProvider>
        </Container>
      </Page>
    </Fragment>
  );
}

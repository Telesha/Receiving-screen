import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, TextareaAutosize
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker } from "@material-ui/pickers";
import { useFormik, Form, FormikProvider } from 'formik';

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

const screenCode = 'SELLINGMARK';

export default function SellingMarkAddEdit(props) {
  const [title, setTitle] = useState("Add Selling Mark");
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [sellingMark, setSellingMark] = useState({
    groupID: 0,
    factoryID: 0,
    sellingMarkCode: '',
    sellingMarkName: '',
    year: '',
    isActive: true,
  });
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { sellingMarkID } = useParams();
  let decrypted = 0;

  const navigate = useNavigate();
  const alert = useAlert();

  const handleClick = () => {
    navigate('/app/sellingMark/listing');
  }

  const SellingMarkSchema = Yup.object().shape({
    groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
    factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
    sellingMarkCode: Yup.string().required('Selling Mark Code is required'),
    sellingMarkName: Yup.string().required('Selling Mark Name is required')
  });

  const formik = useFormik({
    initialValues: {
      groupID: sellingMark.groupID,
      factoryID: sellingMark.factoryID,
      sellingMarkCode: sellingMark.sellingMarkCode,
      sellingMarkName: sellingMark.sellingMarkName,
      isActive: sellingMark.isActive,
      year: sellingMark.year
    },
    validationSchema: SellingMarkSchema,
    onSubmit: (values) => {
      sellingMarkSave(values)
    },
  });

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (formik.values.groupID) {
      trackPromise(
        getFactoriesForDropdown());
    }
  }, [formik.values.groupID]);

  useEffect(() => {
    decrypted = atob(sellingMarkID.toString());
    if (decrypted != 0) {
      trackPromise(getSellingMarkDetails(decrypted));
    }
  }, []);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITSELLINGMARK');
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

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(formik.values.groupID);
    setFactories(factories);
  }

  async function getSellingMarkDetails(sellingMarkID) {
    let response = await services.GetSellingMarkDetailsBySellingMarkID(sellingMarkID);
    let data = {
      groupID: response.groupID,
      factoryID: response.factoryID,
      sellingMarkID: response.sellingMarkID,
      sellingMarkCode: response.sellingMarkCode,
      sellingMarkName: response.sellingMarkName,
      isActive: response.isActive
    };

   setTitle("Edit Selling Mark");
    setValues(data);
    setSelectedDate(new Date(response.dispatchYear))
    setIsUpdate(true);
  }
  const { errors, setValues, touched, handleSubmit, isSubmitting, values, handleBlur } = formik;

  async function sellingMarkSave(values) {
    if (isUpdate == true) {
      let model = {
        groupID: parseInt(values.groupID),
        factoryID: parseInt(values.factoryID),
        sellingMarkID: parseInt(atob(sellingMarkID.toString())),
        sellingMarkCode: values.sellingMarkCode,
        sellingMarkName: values.sellingMarkName,
        isActive: values.isActive,
        year: selectedDate.getFullYear().toString(),
        createdBy: parseInt(tokenDecoder.getUserIDFromToken())
      }

      let response = await services.UpdateSellingMark(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/sellingMark/listing');
      }
      else {
        setSellingMark({
          ...sellingMark,
          isActive: isDisableButton
        })
        alert.error(response.message);
      }
    } else {
      let response = await services.saveSellingMark(values, selectedDate);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/sellingMark/listing');
      }
      else {
        alert.error(response.message);
      }
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

    setSellingMark({
      ...sellingMark,
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

  function clearFormFields() {
    setSellingMark({
      ...sellingMark,
      sellingMarkCode: '',
      sellingMarkName: ''
    });
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
                  <CardHeader
                    title={cardTitle(title)}
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
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
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
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
                          <TextField select
                            error={Boolean(touched.factoryID && errors.factoryID)}
                            fullWidth
                            helperText={touched.factoryID && errors.factoryID}
                            name="factoryID"
                            onBlur={handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.factoryID}
                            variant="outlined"
                            id="factoryID"
                            size='small'
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                            }}
                          >
                            <MenuItem value="0">--Select Factory--</MenuItem>
                            {generateDropDownMenu(factories)}
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
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="sellingMarkCode">
                            Selling Mark Code *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.sellingMarkCode && errors.sellingMarkCode)}
                            fullWidth
                            helperText={touched.sellingMarkCode && errors.sellingMarkCode}
                            name="sellingMarkCode"
                            onBlur={handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.sellingMarkCode}
                            variant="outlined"
                            size='small'    
                            disabled={isUpdate}
                          />
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="sellingMarkName">
                            Selling Mark Name *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.sellingMarkName && errors.sellingMarkName)}
                            fullWidth
                            helperText={touched.sellingMarkName && errors.sellingMarkName}
                            name="sellingMarkName"
                            onBlur={handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.sellingMarkName}
                            size='small'
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="isActive">
                            Active
                          </InputLabel>
                          <Switch
                            checked={formik.values.isActive}
                            onChange={formik.handleChange}
                            name="isActive"
                            disabled={isDisableButton}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        type="reset"
                        variant="outlined"
                        onClick={clearFormFields}
                        size='small'
                      >
                        Cancel
                      </Button>
                      <div>&nbsp;</div>
                      <Button
                        color="primary"
                        disabled={isSubmitting || isDisableButton}
                        type="submit"
                        variant="contained"
                        size='small'
                      >
                        {isUpdate == true ? "Update" : "Save"}
                      </Button>
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
};

import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, Switch, CardHeader, MenuItem, TextareaAutosize
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';

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

const screenCode = 'FACTORYITEM';
export default function FactoryItemAddEdit(props) {
  const [title, setTitle] = useState("Item Creation")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState()
  const [factories, setFactories] = useState()
  const [factoryItem, setFactoryItem] = useState({
    groupID: 0,
    factoryID: 0,
    itemCode: '',
    itemName: '',
    measuringUnit: 0,
    description: '',
    isActive: true,
    itemCategoryID: 0
  });
  const [ItemCategoryList, setItemCategoryList] = useState();
  const [measuringUnitList, setMeasuringUnitList] = useState();
  const navigate = useNavigate();
  const handleClick = () => {

    navigate('/app/factoryItems/listing');

  }
  const alert = useAlert();
  const { factoryItemID } = useParams();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  useEffect(() => {
    decrypted = atob(factoryItemID.toString());
    if (decrypted != 0) {
      trackPromise(getFactoryItemDetails(decrypted));
    }
    trackPromise(getPermissions(), getGroupsForDropdown());
    trackPromise(getAllActiveItemCategory());
    trackPromise(getAllActiveMeasuringUnits())
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown())
  }, [factoryItem.groupID]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getAllActiveItemCategory() {
    const result = await services.getAllActiveItemCategory();
    setItemCategoryList(result);
  }

  async function getAllActiveMeasuringUnits() {
    const result = await services.getAllActiveMeasuringUnits();
    setMeasuringUnitList(result);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(factoryItem.groupID);
    setFactories(factories);
  }

  async function getFactoryItemDetails(factoryItemID) {
    let response = await services.getFactoryItemDetailsByID(factoryItemID);
    let data = response[0];
    setTitle("Edit Item");
    setFactoryItem(data);
    setIsUpdate(true);

  }
  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITFACTORYITEM');

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

    if (decrypted == 0) {
      setFactoryItem({
        ...factoryItem,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
  }

  async function saveFactoryItem(values) {
    if (isUpdate == true) {

      let updateModel = {
        groupID: parseInt(values.groupID),
        factoryID: parseInt(values.factoryID),
        factoryItemID: atob(factoryItemID.toString()),
        itemCode: values.itemCode,
        itemName: values.itemName,
        description: values.description,
        isActive: values.isActive,
        measuringUnit: parseInt(values.measuringUnit),
        itemCategoryID: parseInt(values.itemCategoryID)
      }

      let response = await services.updateFactoryItem(updateModel);
      if (response.statusCode === "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/factoryItems/listing');
      }
      else {
        alert.error(response.message);
        setFactoryItem({
          ...factoryItem,
          isActive: true
        });
      }
    } else {

      let response = await services.saveFactoryItem(values, tokenService.getUserIDFromToken());
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/factoryItems/listing');
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
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
      }
    }
    return items
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setFactoryItem({
      ...factoryItem,
      [e.target.name]: value
    });
  }

  function handleChangeSwitch() {
    setFactoryItem({
      ...factoryItem,
      isActive: !factoryItem.isActive
    })
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
          <Formik
            initialValues={{
              groupID: factoryItem.groupID,
              factoryID: factoryItem.factoryID,
              itemCode: factoryItem.itemCode,
              itemName: factoryItem.itemName,
              description: factoryItem.description,
              isActive: factoryItem.isActive,
              measuringUnit: factoryItem.measuringUnit,
              itemCategoryID: factoryItem.itemCategoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                itemCode: Yup.string().max(4, "Item Code must be lower than 4 characters").required('Item Code is required').matches(/^[0-9\b]+$/, 'Only allow numbers'),
                itemName: Yup.string().max(30, "Item Name must be at most 30 characters").required('Item Name is required'),
                description: Yup.string().max(100),
                measuringUnit: Yup.number().required('Measuring unit is required').min("1", 'Measuring unit is required'),
                itemCategoryID: Yup.number().required('Item Category is required').min("1", 'Item Category is required'),
              })
            }
            onSubmit={saveFactoryItem}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              handleChange,
              isSubmitting,
              touched,
              values,
              props
            }) => (
              <form onSubmit={handleSubmit}>
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
                              onChange={(e) => handleChange1(e)}
                              size='small'
                              value={factoryItem.groupID}
                              variant="outlined"
                              id="groupID"
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
                              onChange={(e) => handleChange1(e)}
                              value={factoryItem.factoryID}
                              size='small'
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="itemCode">
                              Item code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.itemCode && errors.itemCode)}
                              fullWidth
                              helperText={touched.itemCode && errors.itemCode}
                              name="itemCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={factoryItem.itemCode}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                            />
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="itemCategoryID">
                              Item Category *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.itemCategoryID && errors.itemCategoryID)}
                              fullWidth
                              helperText={touched.itemCategoryID && errors.itemCategoryID}
                              name="itemCategoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              size='small'
                              value={factoryItem.itemCategoryID}
                              variant="outlined" >
                              <MenuItem value={0} disabled={true}>--Select Item Category--</MenuItem>
                              {generateDropDownMenu(ItemCategoryList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="itemName">
                              Item Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.itemName && errors.itemName)}
                              fullWidth
                              helperText={touched.itemName && errors.itemName}
                              name="itemName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={factoryItem.itemName}
                              size='small'
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="measuringUnit">
                              Measuring Unit *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.measuringUnit && errors.measuringUnit)}
                              fullWidth
                              helperText={touched.measuringUnit && errors.measuringUnit}
                              name="measuringUnit"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={factoryItem.measuringUnit}
                              size='small'
                              variant="outlined" >
                              <MenuItem value="0">--Select Measuring Unit--</MenuItem>
                              {generateDropDownMenu(measuringUnitList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="description">
                              Description
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.description && errors.description)}
                              fullWidth
                              helperText={touched.description && errors.description}
                              name="description"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              size='small'
                              value={factoryItem.description}
                              variant="outlined"
                              disabled={isDisableButton}
                              multiline={true}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="isActive">
                              Active
                            </InputLabel>
                            <Switch
                              checked={factoryItem.isActive}
                              onChange={handleChangeSwitch}
                              name="isActive"
                              disabled={isDisableButton}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          type="submit"
                          size='small'
                          variant="contained"
                        >
                          {isUpdate == true ? "Update" : "Save"}
                        </Button>
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
};

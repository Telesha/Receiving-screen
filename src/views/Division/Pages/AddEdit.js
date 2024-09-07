import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  Switch,
  CardHeader,
  MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import NumberFormat from 'react-number-format';
import PropTypes from 'prop-types';
import DeleteIcon from '@material-ui/icons/Delete';

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
var screenCode = "DIVISION"

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      decimalScale={2}
      isNumericString

    />
  );
}
NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function DivisionAddEdit(props) {
  const [title, setTitle] = useState("Add Division")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [products, setProducts] = useState();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [ArrayField, setArrayField] = useState([]);
  const [arrayNewWareField, setArrayNewWareField] = useState([]);
  const [division, setDivision] = useState({
    groupID: '0',
    estateID: '0',
    transportRate: '0',
    targetCrop: '',
    productID: '0',
    isActive: true,
    divisionID: '0',
    divisionCode: '',
    divisionLocation: '',
    divisionName: '',
  });
  const [FieldData, setFieldData] = useState({
    fieldName: "",
    fieldCode: "",
    fieldLocation: "",
    area: "",
    numberOfTrees: "",
    targetCrop: ""
  })
  const [fieldDataList, setFieldDataList] = useState([])
  const [divisionIsActive, setdivisionIsActive] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();


  const handleClick = () => {
    navigate('/app/division/listing');
  }

  const handleChangeNumbersOnly = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    handleChange1({ target: { name: 'divisionCode', value: numericValue } });
  };

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const alert = useAlert();
  const { routeID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    getPermissions();
    getGroupsForDropdown();
    trackPromise(
      getEstateDetailsByGroupID()
    )
  }, []);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [division.groupID]);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown()
    );
  }, [division.groupID]);

  useEffect(() => {
    decrypted = atob(routeID.toString());
    if (decrypted != 0) {
      trackPromise(
        GetDivisionDetailsByDivisionIDForUpdate(decrypted),
        GetFieldDetailsByDivisionID(decrypted)
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getProductsForDropDown()
    );
  }, [division.estateID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDDIVISION');

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

    setDivision({
      ...division,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(division.groupID);
    setFactories(factory);
  }

  async function getProductsForDropDown() {
    const product = await services.getProductsByFactoryID(division.estateID);
    setProducts(product);
  }

  async function GetDivisionDetailsByDivisionIDForUpdate(divisionID) {
    let response = await services.GetDivisionDetailsByDivisionIDForUpdate(divisionID);
    let data = response[0];
    setTitle("Update Division");
    data.transportRate = data.transportRate.toFixed(2)
    setDivision(data);
    setIsUpdate(true);
    setdivisionIsActive(response[0]);

  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(division.groupID);
    setEstates(response);
  };

  async function GetFieldDetailsByDivisionID(divisionID) {
    var newarr = []
    const fields = await services.GetFieldDetailsByDivisionID(divisionID);
    fields.forEach(x => {

      newarr.push({
        area: x.area,
        fieldCode: x.fieldCode,
        fieldID: x.fieldID,
        fieldLocation: x.fieldLocation,
        fieldName: x.fieldName,
        isActive: x.isActive,
        numberofTrees: x.numberofTrees,
        targetCrop: x.targetCrop
      })
    });
    setArrayField(newarr)
  }

  async function saveDivision(values) {
    if (isUpdate == true) {
      let updateModel = {
        divisionCode: values.divisionCode,
        divisionName: values.divisionName,
        divisionLocation: values.divisionLocation,
        transportRate: values.transportRate,
        targetCrop: values.targetCrop,
        isActive: values.isActive,
        divisionID: atob(routeID.toString())

      }
      let response = await services.updatedivision(updateModel, fieldDataList);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/division/listing');
      }
      else {
        setDivision({
          ...division,
          isActive: divisionIsActive
        });
        alert.error(response.message);
      }
    }
    else {
      let response = await services.saveDivision(values, fieldDataList);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/division/listing');
      }
      else {
        alert.error(response.message);
      }
    }
  }

  function clearTable() {
    setArrayNewWareField([]);
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

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setDivision({
      ...division,
      [e.target.name]: value
    });
  }

  function handleChange2(e) {
    const target = e.target;
    const value = target.value
    setFieldData({
      ...FieldData,
      [e.target.name]: value
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

  async function InactiveFieldDetails(rowData, index) {

    if (isUpdate == true) {
      const response = await services.SetInactiveFieldDetailsByID(rowData.fieldID);
      if ((response.statusCode == "Success")) {
        alert.success('Field Details InActive successfully');
        clearTable();
        GetFieldDetailsByDivisionID(division.divisionID);

      } else {
        alert.error('Error occured in InActive');
      }
    }
    else {
      const dataDelete = [...ArrayField];
      const remove = index;
      dataDelete.splice(remove, 1);
      setArrayField([...dataDelete]);
    }
  };

  function AddFieldData() {

    var array1 = [...ArrayField];
    var array2 = [...arrayNewWareField];

    array1.push({
      area: FieldData.area, fieldCode: FieldData.fieldCode,
      fieldID: FieldData.fieldID, fieldLocation: FieldData.fieldLocation,
      fieldName: FieldData.fieldName, isActive: FieldData.isActive,
      numberofTrees: FieldData.numberOfTrees, targetCrop: FieldData.targetCrop
    });

    array2.push({
      area: FieldData.area, fieldCode: FieldData.fieldCode,
      fieldID: FieldData.fieldID, fieldLocation: FieldData.fieldLocation,
      fieldName: FieldData.fieldName, isActive: FieldData.isActive,
      numberofTrees: FieldData.numberOfTrees, targetCrop: FieldData.targetCrop
    });

    setArrayField(array1);
    setArrayNewWareField(array2);

    let dataModel = {
      fieldCode: FieldData.fieldCode,
      fieldName: FieldData.fieldName,
      fieldLocation: FieldData.fieldLocation,
      area: parseFloat(FieldData.area),
      numberOfTrees: parseInt(FieldData.numberOfTrees),
      targetCrop: parseFloat(FieldData.targetCrop)
    }

    setFieldDataList(fieldDataList => [...fieldDataList, dataModel]);
    setFieldData({
      fieldName: "",
      fieldCode: "",
      fieldLocation: "",
      area: "",
      numberOfTrees: "",
      targetCrop: ""
    })
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: division.groupID,
              estateID: division.estateID,
              divisionName: division.divisionName,
              divisionCode: division.divisionCode,
              divisionLocation: division.divisionLocation,
              transportRate: division.transportRate,
              targetCrop: division.targetCrop,
              productID: division.productID,
              isActive: division.isActive,

            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                estateID: Yup.number().required('Estate required').min("1", 'Estate required'),
                divisionName: Yup.string().max(255).matches(/^[a-zA-Z\d\s]+$/, 'Special Characters Not Allowed').required('Division Name required'),
                divisionCode: Yup.string().max(255).required('Division code is required').min(3, 'Division code must be 3 numbers'),
                divisionLocation: Yup.string().max(255).matches(/^[a-zA-Z\d\s\,\.\/]+$/, 'Special Characters and Numbers Not Allowed'),
                transportRate: Yup.string().required('Transport Rate is required').matches(/^\s*(?=.*[0-9])\d*(?:\.\d{1,2})?\s*$/, 'TransportRate Should Contain Only Numbers with 2 decimals'),
                targetCrop: Yup.string().required('Target Crop required').matches(/^[0-9]+([.][0-9]+)?$/, 'Target Crop Should Contain Only Numbers'),
                productID: Yup.number().required('Product required').min("1", 'Product required'),
              })
            }
            onSubmit={saveDivision}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
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
                              size='small'
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={values.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
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
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              size='small'
                              name="estateID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={division.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="productID">
                              Product *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.productID && errors.productID)}
                              fullWidth
                              helperText={touched.productID && errors.productID}
                              size='small'
                              name="productID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={division.productID}
                              variant="outlined"
                              id="productID"
                              disabled={isDisableButton}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Product--</MenuItem>
                              {generateDropDownMenu(products)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="divisionCode">
                              Division Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.divisionCode && errors.divisionCode)}
                              fullWidth
                              helperText={touched.divisionCode && errors.divisionCode}
                              size='small'
                              name="divisionCode"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeNumbersOnly(e)}
                              value={division.divisionCode.slice(0, 3)}
                              variant="outlined"
                              disabled={isDisableButton}
                              InputProps={{
                                readOnly: isUpdate ? true : false,
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="divisionName">
                              Division Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.divisionName && errors.divisionName)}
                              fullWidth
                              helperText={touched.divisionName && errors.divisionName}
                              size='small'
                              name="divisionName"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={division.divisionName}
                              variant="outlined"
                              disabled={isDisableButton}
                              inputProps={{ maxLength: 20 }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="divisionLocation">
                              Division Location
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.divisionLocation && errors.divisionLocation)}
                              fullWidth
                              helperText={touched.divisionLocation && errors.divisionLocation}
                              size='small'
                              name="divisionLocation"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={division.divisionLocation}
                              variant="outlined"
                              disabled={isDisableButton}
                              inputProps={{ maxLength: 30 }}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="targetCrop">
                              Monthly Target Crop(KG) *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.targetCrop && errors.targetCrop)}
                              fullWidth
                              helperText={touched.targetCrop && errors.targetCrop}
                              size='small'
                              name="targetCrop"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={division.targetCrop}
                              variant="outlined"
                              disabled={isDisableButton}
                            />
                          </Grid>
                          {isHidden ?
                            <>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="transportRate">
                                  Transport Rate(Rs.) *
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.transportRate && errors.transportRate)}
                                  fullWidth
                                  helperText={touched.transportRate && errors.transportRate}
                                  size='small'
                                  name="transportRate"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange1(e)}
                                  value={division.transportRate}
                                  variant="outlined"
                                  disabled={isDisableButton}
                                  inputProps={{ maxLength: 30 }}
                                />
                              </Grid>
                            </> : null
                          }

                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="isActive">
                              Active
                            </InputLabel>
                            <Switch
                              checked={values.isActive}
                              onChange={handleChange}
                              name="isActive"
                              disabled={isDisableButton}
                            />
                          </Grid>
                        </Grid>

                        {isHidden ?
                          <>
                            <Grid container spacing={3} >
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="fieldCode">
                                  Field Code
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  name="fieldCode"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange2(e)}
                                  size='small'
                                  value={FieldData.fieldCode}
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="fieldName">
                                  Field Name
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  name="fieldName"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange2(e)}
                                  size='small'
                                  value={FieldData.fieldName}
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="fieldLocation">
                                  Field Location
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  name="fieldLocation"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange2(e)}
                                  size='small'
                                  value={FieldData.fieldLocation}
                                  variant="outlined"
                                />
                              </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="area">
                                  Area (hectare / acre)
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  name="area"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange2(e)}
                                  size='small'
                                  value={FieldData.area}
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="numberOfTrees">
                                  Number of Trees
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  name="numberOfTrees"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange2(e)}
                                  size='small'
                                  value={FieldData.numberOfTrees}
                                  variant="outlined"
                                />
                              </Grid>
                              <Grid item md={4} xs={12}>
                                <InputLabel shrink id="monthlyTargetCropDiv">
                                  Target Crop(KG) *
                                </InputLabel>
                                <TextField
                                  fullWidth
                                  name="monthlyTargetCropDiv"
                                  onBlur={handleBlur}
                                  onChange={(e) => handleChange2(e)}
                                  value={FieldData.targetCrop}
                                  size='small'
                                  variant="outlined"
                                />
                              </Grid>
                            </Grid>
                            <Box display="flex" justifyContent="flex-end" p={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                onClick={() => AddFieldData()}
                                size='small'
                              >
                                Add
                              </Button>
                            </Box>

                            <Grid container spacing={2}>
                              {(ArrayField.length > 0) ?
                                <Grid item xs={12}>
                                  <TableContainer >
                                    <Table className={classes.table} aria-label="caption table">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell align='center'>Field Code</TableCell>
                                          <TableCell align='center' >Field Name</TableCell>
                                          <TableCell align='center'>Field Location</TableCell>
                                          <TableCell align='center'>Area</TableCell>
                                          <TableCell align='center'>Number of Trees</TableCell>
                                          <TableCell align='center'>Target Crop</TableCell>
                                          <TableCell align='center'>Actions</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {ArrayField.map((rowData, index) => (
                                          <TableRow key={index}>
                                            <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                              {(rowData.fieldCode)}
                                            </TableCell>
                                            <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                              {(rowData.fieldName)}
                                            </TableCell>
                                            <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                              {(rowData.fieldLocation)}
                                            </TableCell>
                                            <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                              {(rowData.area)}
                                            </TableCell>
                                            <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                              {(rowData.numberofTrees)}
                                            </TableCell>
                                            <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                              {(rowData.targetCrop)}
                                            </TableCell>
                                            <TableCell align='center' scope="row" style={{ borderBottom: "none" }}>
                                              <DeleteIcon
                                                style={{
                                                  color: "red",
                                                  marginBottom: "-1rem",
                                                  marginTop: "0rem",
                                                  cursor: "pointer"
                                                }}
                                                size="small"
                                                onClick={() => InactiveFieldDetails(rowData, index)}
                                              >
                                              </DeleteIcon>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Grid> : null}
                            </Grid>
                          </>
                          : null}

                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
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
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
};

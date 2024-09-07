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
  CardHeader,
  MenuItem,
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
import { func } from 'prop-types';
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
  },
  multilineColor: {
    color: '#8A2BE2',
    textAlign: "center"
  }

}));
var screenCode = "ITEMAMENDMENT"
export default function FactoryItemAdjustmentAddEdit(props) {
  const [title, setTitle] = useState("Add Item Amendment");
  const [isView, setIsView] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [suppliers, setSuppliers] = useState();
  const [availableQuantity, setAvailableQuantity] = useState();
  const [groups, setGroups] = useState();
  const [factoryItems, setFactoryItems] = useState();
  const [factoryItemGRNS, setFactoryItemGRNS] = useState();
  const [ItemCategoryList, setItemCategoryList] = useState();
  const [factoryAdjustment, setFactoryAdjustment] = useState({
    groupID: '0',
    factoryID: '0',
    itemCategoryID: '0',
    factoryItem: '0',
    supplierID: '0',
    quantity: '',
    reason: '0',
    remark: '',
    grnID: '0'
  });
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/factoryItemAdjustment/listing');
  }
  const alert = useAlert();
  const { factoryItemAdjustmentID } = useParams();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  useEffect(() => {
    trackPromise(
      getPermissions(),
      getGroupsForDropdown(),
      getAllActiveItemCategory()
    )
  }, []);

  useEffect(() => {
    decrypted = atob(factoryItemAdjustmentID.toString());
    if (decrypted != 0) {
      trackPromise(
        getFactoryAedjustmentDetails(decrypted),
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown()
    );
  }, [factoryAdjustment.groupID]);

  useEffect(() => {
    trackPromise(
      getAvailableGrnBySupplier()
    )
  }, [factoryAdjustment.supplierID]);

  useEffect(() => {
    trackPromise(
      getavailableQuantity(),
    )
  }, [factoryAdjustment.grnID]);

  useEffect(() => {
    trackPromise(
      getFactoryItemsByFactoryID()
    )
  }, [factoryAdjustment.factoryID]);

  useEffect(() => {
    trackPromise(
      getSuppliersForDropDown(),
      getAvailableGrnBySupplier()
    )
  }, [factoryAdjustment.factoryItem]);

  useEffect(() => {
    trackPromise(
      getSuppliersForDropDown(),
      getAvailableGrnBySupplier()
    )
  }, [factoryAdjustment.factoryItem]);

  useEffect(() => {
    trackPromise(
      getFactoryItemDetailsByGroupIDFactoryID()
    )
  }, [factoryAdjustment.itemCategoryID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITITEMAMENDMENT');
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

    setFactoryAdjustment({
      ...factoryAdjustment,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getAllActiveItemCategory() {
    const result = await services.getAllActiveItemCategory();
    setItemCategoryList(result);
  }

  async function getFactoryItemDetailsByGroupIDFactoryID() {
    const factoryItem = await services.getfactoryItemsByGroupIDFactoryIDItemCategoryID(factoryAdjustment.groupID, factoryAdjustment.factoryID, factoryAdjustment.itemCategoryID);
    setFactoryItems(factoryItem);
  }

  async function getAvailableGrnBySupplier() {
    const GRNS = await services.getAvailableGrnBySupplier(factoryAdjustment.supplierID, factoryAdjustment.factoryItem);
    setFactoryItemGRNS(GRNS);
  }

  async function getFactoryItemsByFactoryID() {
    const items = await services.getFactoryItemsByFactoryID(factoryAdjustment.factoryID);
    setFactoryItems(items);
  }

  async function getavailableQuantity() {
    const quantity = await services.getavailableQuantity(factoryAdjustment.grnID);
    setAvailableQuantity(quantity == null || quantity.availableQuantity == null ? 0 : quantity.availableQuantity);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(factoryAdjustment.groupID);
    setFactories(factory);
  }

  async function getSuppliersForDropDown() {
    const supplier = await services.GetSupplierByFactoryItem(factoryAdjustment.factoryItem);
    setSuppliers(supplier);
  }

  async function getFactoryAedjustmentDetails(factoryItemAdjustmentID) {
    let response = await services.getFactoryAedjustmentDetails(factoryItemAdjustmentID);
    let data = response[0];
    setTitle("View Item Amendment");
    setFactoryAdjustment(data);
    setIsView(true);
  }

  async function saveFactoryAdjustments(values) {
    if (factoryAdjustment.quantity > availableQuantity) {
      alert.error("Available quantity is less than entered quantity");
    }
    else {
      if (isView == true) {
        let updateModel = {
          factoryItemAdjustmentID: atob(factoryItemAdjustmentID.toString()),
          quantity: values.quantity,
          routeName: values.routeName,
          remark: values.remark,
          transportRate: values.transportRate,
          targetCrop: values.targetCrop,
          factoryID: values.factoryID,
          supplierID: values.supplierID
        }
        let response = await services.updateRoute(updateModel);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          setIsDisableButton(true);
          navigate('/app/factoryItemAdjustment/listing');
        }
        else {
          alert.error(response.message);
        }
      }

      else {
        let response = await services.saveFactoryAdjustment(values);

        if (response.statusCode == "Success") {
          alert.success(response.message);
          setIsDisableButton(true);
          navigate('/app/factoryItemAdjustment/listing');
        }
        else {
          alert.error(response.message);
        }
      }
    }

  }

  function clearData() {
    setFactoryAdjustment({
      ...factoryAdjustment,
      itemCategoryID: '0',
      factoryItem: '0',
      supplierID: '0',
      quantity: '',
      reason: '0',
      remark: '',
      grnID: '0'
    });
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setFactoryAdjustment({
      ...factoryAdjustment,
      [e.target.name]: value
    });
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
              factoryID: factoryAdjustment.factoryID,
              groupID: factoryAdjustment.groupID,
              factoryItem: factoryAdjustment.factoryItem,
              supplierID: factoryAdjustment.supplierID,
              remark: factoryAdjustment.remark,
              quantity: factoryAdjustment.quantity,
              reason: factoryAdjustment.reason,
              grnID: factoryAdjustment.grnID,
              itemCategoryID: factoryAdjustment.itemCategoryID
            }}
            validationSchema={
              Yup.object().shape({
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryItem: Yup.number().required('Factory item is required').min("1", 'Factory item is required'),
                supplierID: Yup.number().required('Supplier is required').min("1", 'Supplier is required'),
                quantity: Yup.string().required('Quantity is required').matches(/^[1-9\b]/, 'Minimum value is 1 & Only allow numbers'),
                remark: Yup.string(),
                reason: Yup.number().required('Reason is required').min("1", 'Reason is required'),
                grnID: Yup.number().required('GRN number is required').min("1", 'GRN number is required'),
                itemCategoryID: Yup.number().required('Item Category is required').min("1", 'Item Category is required')
              })
            }
            onSubmit={saveFactoryAdjustments}
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
                          <Grid item md={6} xs={12}>
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
                              value={factoryAdjustment.groupID}
                              size='small'
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled || isView ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={6} xs={12}>
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
                              value={factoryAdjustment.factoryID}
                              size='small'
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled || isView ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="itemCategoryID">
                              Item Category *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.itemCategoryID && errors.itemCategoryID)}
                              fullWidth
                              helperText={touched.itemCategoryID && errors.itemCategoryID}
                              name="itemCategoryID"
                              onChange={(e) => handleChange1(e)}
                              value={factoryAdjustment.itemCategoryID}
                              size='small'
                              variant="outlined"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            >
                              <MenuItem value={0} disabled={true}>--Select Item Category--</MenuItem>
                              {generateDropDownMenu(ItemCategoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryItem">
                              Item *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryItem && errors.factoryItem)}
                              fullWidth
                              helperText={touched.factoryItem && errors.factoryItem}
                              name="factoryItem"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={factoryAdjustment.factoryItem}
                              size='small'
                              variant="outlined"
                              id="factoryItem"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Item--</MenuItem>
                              {generateDropDownMenu(factoryItems)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="supplierID">
                              Supplier *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.supplierID && errors.supplierID)}
                              fullWidth
                              helperText={touched.supplierID && errors.supplierID}
                              name="supplierID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={factoryAdjustment.supplierID}
                              variant="outlined"
                              size='small'
                              id="supplierID"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Supplier--</MenuItem>
                              {generateDropDownMenu(suppliers)}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="grnID">
                              GRN Number *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.grnID && errors.grnID)}
                              fullWidth
                              helperText={touched.grnID && errors.grnID}
                              name="grnID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={factoryAdjustment.grnID}
                              variant="outlined"
                              size='small'
                              id="grnID"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Factory Item GRN--</MenuItem>
                              {generateDropDownMenu(factoryItemGRNS)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="quantity" style={{ marginLeft: "2rem" }}>
                              Available Quantity
                            </InputLabel>
                            <TextField
                              fullWidth
                              position="end"
                              name="quantity"
                              onChange={(e) => handleChange1(e)}
                              value={availableQuantity}
                              size='small'
                              id="standard-basic"
                              InputProps={{
                                readOnly: true,
                                style: { textAlign: 'center' },
                                className: classes.multilineColor
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="quantity">
                              Quantity *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.quantity && errors.quantity)}
                              fullWidth
                              helperText={touched.quantity && errors.quantity}
                              name="quantity"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              size='small'
                              value={factoryAdjustment.quantity}
                              variant="outlined"
                              
                              InputProps={{
                                readOnly: isView ? true : false,
                                className: classes.multilineColor,
                                style: { textAlign: 'center', alignItems: 'center', },
                              }}
                              inputStyle={{ textAlign: 'center' }}
                            />
                          </Grid>

                          <Grid item md={6} xs={12}>
                            <InputLabel shrink id="reason">
                              Reason *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.reason && errors.reason)}
                              fullWidth
                              helperText={touched.reason && errors.reason}
                              name="reason"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => handleChange1(e)}
                              value={factoryAdjustment.reason}
                              variant="outlined"
                              id="reason"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Reason--</MenuItem>
                              <MenuItem value="1">Expire</MenuItem>
                              <MenuItem value="2">Wastage</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <InputLabel shrink id="remark">
                              Remark
                            </InputLabel>
                            <TextField
                              multiline
                              error={Boolean(touched.remark && errors.remark)}
                              fullWidth
                              helperText={touched.remark && errors.remark}
                              name="remark"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              size='small'
                              value={factoryAdjustment.remark}
                              variant="outlined"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        {isView == false ?
                          <Button
                            color="primary"
                            type="reset"
                            variant="outlined"
                            onClick={() => clearData()}
                            size='small'
                          >
                            Clear
                          </Button> : null}
                        <div>&nbsp;</div>
                        {isView == false ?
                          <Button
                            color="primary"
                            disabled={isSubmitting || isDisableButton}
                            type="submit"
                            variant="contained"
                            size='small'
                          >
                            Save
                          </Button> : null}
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment >
  );
};

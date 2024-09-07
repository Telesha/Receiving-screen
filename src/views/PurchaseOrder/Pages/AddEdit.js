import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Button,
  makeStyles,
  Container,
  Divider,
  CardContent,
  CardHeader,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  InputLabel
} from '@material-ui/core';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { Form, Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import DeleteIcon from '@material-ui/icons/Delete';
import { LoadingComponent } from '../../../utils/newLoader';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';

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
  },
  colorCancel: {
    backgroundColor: "red",
  },

}));

const screenCode = 'PURCHASEORDER';

export default function PurchaseOrderAddEdit(props) {
  const [title, setTitle] = useState(" Add Purchase Order")
  const [isView, setIsView] = useState(false);
  const classes = useStyles();
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [PurchaseDetails, setPurchaseDetails] = useState({
    groupID: 0,
    factoryID: 0,
    supplierID: 0,
    tax: 0,

  });
  const [selectedDueDate, handleDueDateChange] = useState();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [tableItems, setTableItems] = useState([]);
  const date = new Date();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [factoryDetails, setFactoryDetails] = useState({
    factoryName: '',
    address1: '',
    officePhone: ''
  });
  const [supplierDetails, setSupplierDetails] = useState({
    supplierName: '',
    address1: '',
    contactNumber: '',
    email: '',
    officePhoneNumber: '',
  });
  const [itemCategoryNames, setItemCategoryNames] = useState();
  const [itemNames, setItemNames] = useState([]);
  const [orderList, setOrderList] = useState({
    itemCategoryID: 0,
    factoryItemID: 0,
    itemCode: 0,
    itemName: '',
    factoryItemSupplierID: 0,
    unitPrice: 0,
    quantity: 0,
    totalDiscount: 0,
    amount: 0,
    description: '',
    remarks: ''
  });
  const [totalNet, setTotalNet] = useState(0);
  const [poNumber, setPoNumber] = useState(0);
  const [isSave, setIsSave] = useState(false);
  const componentRef = useRef();

  const [itemDetails, setItemDetails] = useState({
    itemName: '',
    description: ''
  });
  let finalTot = 0;
  const { purchaseOrderID } = useParams();
  let decrypted = 0;

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/purchaseOrder/listing');
  }
  const alert = useAlert();

  useEffect(() => {
    getPermission();
    getGroupsForDropdown();
    generatePONumber();
  }, []);

  useEffect(() => {
    decrypted = atob(purchaseOrderID.toString());
    if (decrypted != 0) {
      trackPromise(
        getPurchaseOrderDetails(decrypted),
      )
    }
  }, []);
  useEffect(() => {
    if (PurchaseDetails.groupID != 0) {
      trackPromise(
        getFactoryByGroupID(PurchaseDetails.groupID)
      )
    }

  }, [PurchaseDetails.groupID]);

  useEffect(() => {
    trackPromise(
      getSuppliers()
    );
    trackPromise(
      getFactoryInfoByFactoryID()
    )
  }, [PurchaseDetails.groupID, PurchaseDetails.factoryID]);

  useEffect(() => {
    trackPromise(
      getSupplierInfoBySupplierID()
    )
  }, [PurchaseDetails.supplierID]);

  useEffect(() => {
    if (PurchaseDetails.supplierID > 0) {
      trackPromise(
        getItemCategoryNames(PurchaseDetails.supplierID)
      )
    }
  }, [PurchaseDetails.supplierID]);

  useEffect(() => {
    trackPromise(
      getItemNames()
    );
  }, [orderList.itemCategoryID, PurchaseDetails.supplierID, PurchaseDetails.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITPURCHASEORDER');

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

    setPurchaseDetails({
      ...PurchaseDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    var response = await services.getGroupsForDropdown();
    setGroupList(response);
  };

  async function getFactoryByGroupID(groupID) {
    var response = await services.getFactoryByGroupID(groupID);
    setFactoryList(response);
  };

  async function getSuppliers() {
    const suppliers = await services.GetSuppliersByGroupIDAndFactoryID(PurchaseDetails.groupID, PurchaseDetails.factoryID);
    setSuppliers(suppliers);
  }

  async function getFactoryInfoByFactoryID() {
    let response = await services.getFactoryInfoByFactoryID(PurchaseDetails.factoryID);
    let data = response;
    setFactoryDetails({
      ...factoryDetails,
      factoryName: data.factoryName,
      address1: data.address1,
      officePhone: data.officePhone
    });
  }

  async function getSupplierInfoBySupplierID() {
    let response = await services.getSupplierInfoBySupplierID(PurchaseDetails.supplierID);
    let data = response;
    setSupplierDetails({
      ...supplierDetails,
      supplierName: data.supplierName,
      address1: data.address1,
      contactNumber: data.contactNumber,
      email: data.email,
      officePhoneNumber: data.officePhoneNumber,
    });
  }

  async function getItemCategoryNames(suplierID) {
    const category = await services.getAllActiveItemCategory(suplierID);
    setItemCategoryNames(category);
  }

  async function getItemNames() {
    const response = await services.getfactoryItemsBySupplierIDItemCategoryID(PurchaseDetails.supplierID, orderList.itemCategoryID, PurchaseDetails.factoryID);
    setItemNames(response);
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

  async function getPurchaseOrderDetails(purchaseOrderID) {
    let response = await services.getPurchaseOrderDetails(purchaseOrderID);
    let data = response.purchaseGeneral[0];
    let data1 = response.purchaseItemsList;
    setTitle("View Purchase Order");
    setTotalNet(data.lineTotalPrice);
    setPurchaseDetails({
      ...PurchaseDetails,
      groupID: data.groupID,
      factoryID: data.factoryID,
      supplierID: data.supplierID,
      tax: data.tax
    });
    setPoNumber(data.purchaseOrderNumber);
    setSupplierDetails({
      ...supplierDetails,
      address1: data.supplierAddress,
      contactNumber: data.supplierContactNumber,
      email: data.supplierEmailAddress,
      officePhoneNumber: data.officePhoneNumber
    });
    setTableItems(data1)
    setIsView(true);

  }

  async function savePurchaseOrder(values) {
    var dueDate = selectedDueDate === undefined ? date.toISOString() : selectedDueDate.toISOString();
    let response = await services.savePurchaseOrder(values, factoryDetails, supplierDetails, tableItems, totalNet, dueDate, poNumber);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      setIsDisableButton(true);
      setIsSave(true);
      navigate('/app/purchaseOrder/listing');
    }
    else {
      alert.error(response.message);
    }
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setPurchaseDetails({
      ...PurchaseDetails,
      [e.target.name]: value
    });
  }

  function handleChangeOrderListitemCategory(e) {
    const target = e.target;
    const value = target.value

    setOrderList({
      ...orderList,
      itemCategoryID: value,
      factoryItemSupplierID: 0
    });
  }

  function handleChangeOrderList(e) {
    const target = e.target;
    const value = target.value

    setOrderList({
      ...orderList,
      [e.target.name]: value
    });
  }

  function handleDescription(e, object) {
    const target = e.target;
    const value = target.value
    let des = ''
    for (const object of itemNames) {
      if (value === object.factoryItemID) {
        des = object.description
        setItemDetails({
          ...itemDetails,
          itemName: object.itemName,
          description: object.description
        })
      }
    }
    setOrderList({
      ...orderList,
      factoryItemSupplierID: value,
      description: des
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

  function addItemToTable() {

    if (orderList.factoryItemSupplierID > 0) {
      var newItem = {
        supplierID: parseInt(PurchaseDetails.supplierID),
        id: tableItems.length + 1,
        itemCategoryID: parseInt(orderList.itemCategoryID),
        itemCategory: itemCategoryNames[orderList.itemCategoryID],
        factoryItemID: parseInt(orderList.factoryItemSupplierID),
        itemName: itemNames[orderList.factoryItemSupplierID],
        itemCode: parseInt(orderList.factoryItemSupplierID),
        factoryItem: parseInt(orderList.factoryItemSupplierID),
        description: orderList.description,
        unitPrice: parseFloat(orderList.unitPrice),
        quantity: parseFloat(orderList.quantity),
        totalDiscount: orderList.totalDiscount===''? 0: parseFloat(orderList.totalDiscount),
        tableUnitPrice: parseFloat(orderList.unitPrice).toFixed(2),
        tableDiscountPrice: parseFloat(orderList.totalDiscount).toFixed(2),
        remarks: orderList.remarks,
      };

      setTableItems([
        ...tableItems,
        newItem
      ]);

      setOrderList({
        ...orderList,
        itemCategoryID: 0,
        factoryItemID: 0,
        itemCode: 0,
        itemName: '',
        factoryItemSupplierID: 0,
        description: '',
        unitPrice: 0,
        quantity: 0,
        totalDiscount: 0,
        amount: 0,
        remarks: '',
      })
    }
  }
  async function generatePONumber() {
    let date = new Date();
    let year = date.getFullYear().toString();
    let month = date.getMonth() + 1;
    let dt = date.getDate();
    year = year.slice(2);
    var maxNumber = 100;
    var randomNumber = Math.floor((Math.random() * maxNumber) + 1);
    let poNumebr = 'PO' + dt + month + year + randomNumber
    setPoNumber(poNumebr);
  }

  function calAmount(data) {
    let price = 0;
    price = (data.unitPrice.toFixed(2) * data.quantity) - data.totalDiscount.toFixed(2);
    finalTot += price;
    setTotalNet(finalTot)
    return price.toFixed(2);
  }

  function DeleteItem(data) {
    var remainArray = tableItems.filter(x => x.id !== data.id);

    setTableItems(remainArray);
  }
  function clearData() {
    setPurchaseDetails({
      ...PurchaseDetails,
      supplierID: 0
    });
    setOrderList({
      ...orderList,
      itemCategoryID: 0,
      factoryItemID: 0,
      itemCode: 0,
      itemName: '',
      factoryItemSupplierID: 0,
      unitPrice: 0,
      quantity: 0,
      totalDiscount: 0,
      amount: 0,
      description: '',
      remarks: ''
    });
    setSupplierDetails(0);
    handleDueDateChange();
  }

  function clearDefaultValue(e){
    if(e.target.value==0){
      setOrderList({
        ...orderList,
        [e.target.name]:''
      })
    }
  }

  return (
    <Page className={classes.root} title={title}>
      <LoadingComponent />
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: PurchaseDetails.groupID,
            factoryID: PurchaseDetails.factoryID,
            supplierID: PurchaseDetails.supplierID,
            tax: PurchaseDetails.tax
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Group required').min("1", 'Group required'),
              factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
              supplierID: Yup.number().required('Item Supplier required').min("1", 'Item Supplier required'),
              tax: Yup.string().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Only allow numbers with at most two decimal places')
            })
          }
          onSubmit={savePurchaseOrder}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleSubmit,
            isSubmitting,
            touched,
            values,
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
                            onChange={(e) => handleChange1(e)}
                            value={values.groupID}
                            variant="outlined"
                            id="groupID"
                            InputProps={{
                              readOnly: !permissionList.isGroupFilterEnabled || isView ? true : false,
                            }}
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
                            onChange={(e) => handleChange1(e)}
                            value={PurchaseDetails.factoryID}
                            variant="outlined"
                            id="factoryID"
                            InputProps={{
                              readOnly: !permissionList.isFactoryFilterEnabled || isView ? true : false,
                            }}
                            size='small'
                          >
                            <MenuItem value="0">--Select Factory--</MenuItem>
                            {generateDropDownMenu(FactoryList)}
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="supplierID">
                            Item Supplier *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.supplierID && errors.supplierID)}
                            fullWidth
                            helperText={touched.supplierID && errors.supplierID}
                            name="supplierID"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange1(e)}
                            value={PurchaseDetails.supplierID}
                            variant="outlined"
                            id="supplierID"
                            InputProps={{
                              readOnly: isView || tableItems.length >= 1 ? true : false,
                            }}
                            size='small'
                          >
                            <MenuItem value="0">--Select Supplier--</MenuItem>
                            {generateDropDownMenu(suppliers)}
                          </TextField>
                        </Grid>
                        <Grid item md={2} xs={12}>
                          <InputLabel shrink>
                            Due date *
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              id="date-picker-inline"
                              value={selectedDueDate}
                              minDate={new Date()}
                              onChange={(e) => {
                                handleDueDateChange(e)
                              }}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                              size='small'
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                      </Grid>

                      <Grid container spacing={3}>
                        <Grid item md={6} xs={12} style={{ marginTop: '1rem' }}>
                          <InputLabel><b>Factory Information</b></InputLabel><br />
                          <Grid item md={8} xs={12}>
                            <InputLabel > {factoryDetails.factoryName} </InputLabel>
                          </Grid><br />
                          <Grid item md={6} xs={12}>
                            <InputLabel>{factoryDetails.address1}</InputLabel>
                          </Grid><br />
                          <Grid item md={6} xs={12}>
                            <InputLabel>{factoryDetails.officePhone}</InputLabel>
                          </Grid><br />
                          <Grid item md={6} xs={12} style={{ marginTop: '2rem' }}>
                            <InputLabel><b>PO Number : {poNumber}</b></InputLabel>
                          </Grid>
                        </Grid>
                        <Grid item md={6} xs={12} style={{ marginTop: '1rem' }}>
                          <InputLabel><b>Supplier Information</b></InputLabel>
                          <br />
                          <Grid item md={6} xs={12}>
                            <InputLabel>{supplierDetails.supplierName}</InputLabel>
                          </Grid><br />
                          <Grid item md={6} xs={12}>
                            <InputLabel>{supplierDetails.address1}</InputLabel>
                          </Grid><br />
                          <Grid item md={6} xs={12}>
                            <InputLabel>{supplierDetails.contactNumber}</InputLabel>
                          </Grid><br />
                          <Grid item md={6} xs={12}>
                            <InputLabel>{supplierDetails.officePhoneNumber}</InputLabel>
                          </Grid><br />
                          <Grid item md={6} xs={12}>
                            <InputLabel>{supplierDetails.email}</InputLabel>
                          </Grid>
                        </Grid>
                      </Grid><br />
                      <Formik
                        initialValues={{
                          itemCategoryID: orderList.itemCategoryID,
                          factoryItemSupplierID: orderList.factoryItemSupplierID,
                          description: orderList.description,
                          unitPrice: orderList.unitPrice,
                          quantity: orderList.quantity,
                          totalDiscount: orderList.totalDiscount,
                          remarks: orderList.remarks,
                        }}
                        validationSchema={
                          Yup.object().shape({
                            itemCategoryID: Yup.number().required('Item category is required').min("1", 'Item category is required'),
                            factoryItemSupplierID: Yup.number().required('Item is required').min("1", 'Item is required'),
                            unitPrice: Yup.string().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Only allow numbers with at most two decimal places').test('min', 'Unit price is required', val => val > 0).nullable(),
                            quantity: Yup.string().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Only allow numbers with at most two decimal places').test('min', 'No of Units is required', val => val > 0).nullable(),
                            totalDiscount: Yup.string().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Only allow numbers with at most two decimal places')
                          })
                        }
                        enableReinitialize
                        onSubmit={addItemToTable}
                      >
                        {({
                          errors,
                          handleBlur,
                          touched,
                          values,
                        }) => (
                          <Form>
                            {(isView || isSave) == false ?
                              <Card style={{ padding: 20, marginTop: 20, backgroundColor: "#f5f5f5" }}>
                                <Grid container spacing={3}>
                                  <Grid item md={3} xs={12}>
                                    <InputLabel shrink id="itemCategoryID">
                                      Item Category *


                                    </InputLabel>
                                    <TextField select
                                      error={Boolean(touched.itemCategoryID && errors.itemCategoryID)}
                                      fullWidth
                                      helperText={touched.itemCategoryID && errors.itemCategoryID}
                                      name="itemCategoryID"
                                      onChange={(e) => handleChangeOrderListitemCategory(e)}
                                      value={orderList.itemCategoryID}
                                      variant="outlined"
                                      InputProps={{
                                        readOnly: isView ? true : false || isSave ? true : false,
                                      }}
                                      size='small'
                                    >
                                      <MenuItem value={0} disabled={true}>--Select Item Category--</MenuItem>
                                      {generateDropDownMenu(itemCategoryNames)}
                                    </TextField>
                                  </Grid>
                                  <Grid item md={3} xs={12}>
                                    <InputLabel shrink id="factoryItemSupplierID">
                                      Item Name *
                                    </InputLabel>
                                    <TextField select
                                      error={Boolean(touched.factoryItemSupplierID && errors.factoryItemSupplierID)}
                                      fullWidth
                                      helperText={touched.factoryItemSupplierID && errors.factoryItemSupplierID}
                                      name="factoryItemSupplierID"
                                      onBlur={handleBlur}
                                      onChange={(e) => handleChangeOrderList(e)}
                                      value={orderList.factoryItemSupplierID}
                                      variant="outlined"
                                      InputProps={{
                                        readOnly: isView ? true : false,
                                      }}
                                      size='small'
                                    >
                                      <MenuItem value="0">--Select Item--</MenuItem>
                                      {generateDropDownMenu(itemNames)}
                                    </TextField>
                                  </Grid>
                                  <Grid item md={3} xs={12}>
                                    <InputLabel shrink id="description">
                                      Description
                                    </InputLabel>
                                    <TextField
                                      fullWidth
                                      name="description"
                                      onBlur={handleBlur}
                                      onChange={(e) => handleChangeOrderList(e)}
                                      value={orderList.description}
                                      variant="outlined"
                                      InputProps={{
                                        readOnly: isView ? true : false || isSave ? true : false,
                                      }}
                                      size='small'
                                    >
                                    </TextField>
                                  </Grid>
                                  <Grid item md={3} xs={12}>
                                    <InputLabel shrink id="unitPrice">
                                      Unit Price (Rs) *
                                    </InputLabel>
                                    <TextField
                                      error={Boolean(touched.unitPrice && errors.unitPrice)}
                                      fullWidth
                                      helperText={touched.unitPrice && errors.unitPrice}
                                      name="unitPrice"
                                      onBlur={handleBlur}
                                      onChange={(e) => handleChangeOrderList(e)}
                                      value={orderList.unitPrice}
                                      variant="outlined"
                                      InputProps={{
                                        readOnly: isView ? true : false || isSave ? true : false,
                                      }}
                                      size='small'
                                      onClick={(e) => clearDefaultValue(e)}
                                    >
                                    </TextField>
                                  </Grid></Grid>
                                <Grid container spacing={3}>
                                  <Grid item md={3} xs={12}>
                                    <InputLabel shrink id="quantity">
                                      No of Units *
                                    </InputLabel>
                                    <TextField
                                      error={Boolean(touched.quantity && errors.quantity)}
                                      fullWidth
                                      helperText={touched.quantity && errors.quantity}
                                      name="quantity"
                                      onBlur={handleBlur}
                                      onChange={(e) => handleChangeOrderList(e)}
                                      value={orderList.quantity}
                                      variant="outlined"
                                      InputProps={{
                                        readOnly: isView ? true : false || isSave ? true : false,
                                      }}
                                      size='small'
                                      onClick={(e) => clearDefaultValue(e)}
                                    />
                                  </Grid>
                                  <Grid item md={3} xs={12}>
                                    <InputLabel shrink id="totalDiscount">
                                      Discount (Rs)
                                    </InputLabel>
                                    <TextField
                                      error={Boolean(touched.totalDiscount && errors.totalDiscount)}
                                      fullWidth
                                      helperText={touched.totalDiscount && errors.totalDiscount}
                                      name="totalDiscount"
                                      onBlur={handleBlur}
                                      onChange={(e) => handleChangeOrderList(e)}
                                      value={orderList.totalDiscount}
                                      variant="outlined"
                                      InputProps={{
                                        readOnly: isView ? true : false || isSave ? true : false,
                                      }}
                                      size='small'
                                      onClick={(e) => clearDefaultValue(e)}
                                    />
                                  </Grid>
                                  <Grid item md={3} xs={12}>
                                    <InputLabel shrink id="remarks">
                                      Remark
                                    </InputLabel>
                                    <TextField
                                      fullWidth
                                      name="remarks"
                                      onBlur={handleBlur}
                                      onChange={(e) => handleChangeOrderList(e)}
                                      value={orderList.remarks}
                                      variant="outlined"
                                      InputProps={{
                                        readOnly: isView ? true : false || isSave ? true : false,
                                      }}
                                      size='small'
                                    />
                                  </Grid></Grid>
                                <Grid item md={12} xs={12} container direction="row"
                                  justify="flex-end" alignItems="center">
                                  {isView == false ?
                                    <Button
                                      color="primary"
                                      variant="outlined"
                                      type="reset"
                                      onClick={() => clearData()}
                                      disabled={isSubmitting || isDisableButton}
                                    >
                                      Clear
                                    </Button> : null}
                                  <div>&nbsp;</div>
                                  {isView == false ?
                                    <Button
                                      color="primary"
                                      type="submit"
                                      variant="contained"
                                      disabled={isSubmitting || isDisableButton}
                                    >
                                      Add
                                    </Button> : null}
                                </Grid>
                              </Card> : null}
                          </Form>)
                        }</Formik>
                    </CardContent>

                    <div>
                      {tableItems.length > 0 ?
                        <div>
                          <Box minWidth={1050}>
                            {tableItems.length > 0 ?
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>
                                      Item Category
                                    </TableCell>
                                    <TableCell>
                                      Item Name
                                    </TableCell>
                                    <TableCell>
                                      Description
                                    </TableCell>
                                    <TableCell>
                                      Unit Price (Rs)
                                    </TableCell>
                                    <TableCell>
                                      No of Units
                                    </TableCell>
                                    <TableCell>
                                      Discount (Rs)
                                    </TableCell>
                                    <TableCell>
                                      Amount (Rs)
                                    </TableCell>
                                    <TableCell>
                                      Remark
                                    </TableCell>
                                    {(isView || isSave) == false ?
                                      <TableCell>
                                        Remove
                                      </TableCell> : null}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {tableItems.slice(page * limit, page * limit + limit).map((data, i) => (
                                    <TableRow
                                      hover
                                      key={i}
                                    >
                                      <TableCell>
                                        <Box
                                          alignItems="center"
                                          display="flex"
                                        >
                                          <Typography
                                            color="textPrimary"
                                            variant="body1"
                                          >
                                            {data.itemCategory}
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        {data.itemName}
                                      </TableCell>
                                      <TableCell>
                                        {data.description}
                                      </TableCell>
                                      <TableCell>
                                        {data.unitPrice.toFixed(2)}
                                      </TableCell>
                                      <TableCell>
                                        {data.quantity}
                                      </TableCell>
                                      <TableCell>
                                        {data.totalDiscount.toFixed(2)}
                                      </TableCell>
                                      <TableCell>
                                        {calAmount(data)}
                                      </TableCell>
                                      <TableCell>
                                        {data.remarks}
                                      </TableCell>
                                      {(isView || isSave) == false ?
                                        <TableCell component="th" scope="row">
                                          <DeleteIcon
                                            style={{
                                              color: "red",
                                              cursor: "pointer"
                                            }}
                                            size="small"
                                            onClick={() => DeleteItem(data)}
                                          >
                                          </DeleteIcon>
                                        </TableCell> : null}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              : null}
                          </Box>
                          <TablePagination
                            component="div"
                            count={tableItems.length}
                            onChangePage={handlePageChange}
                            onChangeRowsPerPage={handleLimitChange}
                            page={page}
                            rowsPerPage={limit}
                            rowsPerPageOptions={[5, 10, 25]}
                          />
                        </div>
                        : null}
                    </div>

                    <CardContent>
                      <Box display="flex" justifyContent="flex-end" borderColor="#626964" >
                        <Grid container md={6} spacing={2} style={{ marginTop: '1rem' }}></Grid>
                        <Grid container md={6} spacing={2} style={{ marginTop: '1rem', marginBottom: '1rem' }}>

                          <Grid item md={6} xs={12}>
                            <InputLabel><b>Total Net (Rs) :</b></InputLabel>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <TextField
                              fullWidth
                              name="totalnet"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={totalNet.toFixed(2)}
                              variant="outlined"
                              size="small"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            />
                          </Grid>

                          <Grid item md={6} xs={12}>
                            <InputLabel ><b>TAX (Rs) :</b></InputLabel>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <TextField
                              error={Boolean(touched.tax && errors.tax)}
                              fullWidth
                              helperText={touched.tax && errors.tax}
                              name="tax"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={PurchaseDetails.tax}
                              variant="outlined"
                              size="small"
                              InputProps={{
                                readOnly: isView ? true : false || isSave ? true : false,
                              }}

                            />
                          </Grid>

                          <Grid item md={6} xs={12}>
                            <InputLabel ><b>Total (Rs) :</b></InputLabel>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel><b>{((totalNet) + parseInt(PurchaseDetails.tax)).toFixed(2)}</b></InputLabel>
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>

                    <Box display="flex" justifyContent="flex-end" p={2}>
                      {isView == false ?
                        <Button
                          color="primary"
                          type="reset"
                          variant="outlined"
                          onClick={() => handleClick()}
                        >
                          Email Purchase Order
                        </Button> : null}
                      <div>&nbsp;</div>

                      {isView == false ?
                        <ReactToPrint
                          documentTitle={'Purchase Order List'}
                          trigger={() => (
                          <Button
                            color="primary"
                            type="reset"
                            variant="outlined"
                            onClick={() => handleClick()}
                          >
                            View PDF
                          </Button>
                        )}
                        content={() => componentRef.current}
                      />
                      : null}

                      <div hidden={true}>
                        <CreatePDF
                          ref={componentRef}
                          tableItems={tableItems}
                          PurchaseDetails={PurchaseDetails}
                          totalNet={totalNet}
                          supplierDetails={supplierDetails}
                          factoryDetails={factoryDetails}
                        />
                      </div>

                      <div>&nbsp;</div>
                      {isView == false ?
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          variant="contained"
                          type="submit"
                          style={{ marginRight: '1rem' }}
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
  )
}

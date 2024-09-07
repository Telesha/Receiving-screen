import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  InputLabel,
  TextField,
  CardHeader,
  Button,
  Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import Autocomplete from '@material-ui/lab/Autocomplete';

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

const screenCode = "FACTORYITEMGRNADD"

export default function FactoryGRNAddAddEdit(props) {
  const [title, setTitle] = useState("Add Goods Receive Note")
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [purchaseOrder, setPurchaseOrder] = useState();
  const [groups, setGroups] = useState();
  const [factoryItems, setFactoryItems] = useState([]);
  const [tempSuplierID, setTempSuplierID] = useState(0);
  const [facItemDetails, setFacItemDetails] = useState([]);
  const [selectedInvoiceDate, handleInvoiceDateChange] = useState();
  const [selectedReceiveDate, handleReceiveDateChange] = useState();
  const [selectedDueDate, handleDueDateChange] = useState();
  const [suppliers, setSuppliers] = useState([]);
  const [tableItems, setTableItems] = useState([]);
  const date = new Date();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [ItemCategoryList, setItemCategoryList] = useState();
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [factoryGRN, setFactoryGRN] = useState({
    groupID: 0,
    factoryID: 0,
    invoiceNumber: '',
    grnType: 0,
    poNumber: 0,
    supplierID: 0,
    paymentTypeID: 0,
    locationID: 0,
    isActive: true,
  });
  const [grnlist, setGrnList] = useState({
    itemCategoryID: 0,
    grnNumber: '',
    factoryItemSupplierID: 0,
    quantity: 0,
    unitPrice: '',
    buyingPrice: 0
  })
  const [TempValu, setTempValu] = useState({
    purchaseOrderID: 0,
    purchaseOrderNumber: ""
  });
  const navigate = useNavigate();
  const handleClick = () => {

    navigate('/app/factoryGRNAdd/listing');

  }
  const alert = useAlert();
  const { factoryItemGRNAddID } = useParams();
  let decrypted = 0;

  useEffect(() => {
    decrypted = atob(factoryItemGRNAddID.toString());
    if (decrypted != 0) {
      trackPromise(
        getfactoryItemsForDropDown(),
        getItemDetails(decrypted)
      )
    }
    trackPromise(getPermission(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (decrypted == 0 && factoryGRN.supplierID != 0) {
      trackPromise(
        getItemCategoryBySupplierID(),
      )
    }
  }, [factoryGRN.supplierID])

  useEffect(() => {
    trackPromise(
      getFactoriesForDropDown(factoryGRN.groupID),
    )
    clearGrnDataWithFactory();
  }, [factoryGRN.groupID]);

  useEffect(() => {
    clearGrnDataWithoutFactory();
    if (decrypted == 0) {
      getPurchaseOrderListing();
    }

  }, [factoryGRN.factoryID]);

  useEffect(() => {
    setTableItems([]);
  }, [factoryGRN.grnType]);

  useEffect(() => {
    if (decrypted == 0) {
      trackPromise(
        getSuppliers()
      );
    }
  }, [factoryGRN.groupID, factoryGRN.factoryID]);

  useEffect(() => {
    trackPromise(
      getfactoryItemsForDropDown()
    )
  }, [factoryGRN.supplierID])

  useEffect(() => {
    if (decrypted == 0 && factoryGRN.poNumber > 0) {
      trackPromise(
        getPurchaseOrderList()
      );
      getSupplierByPurchaseOrderID();
    }
  }, [factoryGRN.poNumber])

  useEffect(() => {
    if (grnlist.itemCategoryID > 0 && factoryGRN.supplierID > 0) {
      trackPromise(
        getfactoryItemsForDropDownBySupplierIDItemCategoryID()
      )
    }
  }, [grnlist.itemCategoryID, factoryGRN.supplierID])

  useEffect(() => {
    clearList();
  }, [factoryGRN.grnType]);

  async function clearList() {
    clearGrnList();
    setFactoryGRN({
      ...factoryGRN,
      poNumber: -1
    });
  }

  async function clearGrnList() {
    setGrnList({
      ...grnlist,
      itemCategoryID: 0,
      factoryItemSupplierID: 0,
      quantity: 0,
      unitPrice: '',
      buyingPrice: 0
    });
  }

  async function clearGrnDataWithoutFactory() {
    setFactoryGRN({
      ...factoryGRN,
      invoiceNumber: '',
      supplierID: 0,
      paymentTypeID: 0,
      isActive: true,
    });
  }
  async function clearGrnDataWithFactory() {
    setFactoryGRN({
      ...factoryGRN,
      factoryID: 0,
      invoiceNumber: '',
      supplierID: 0,
      paymentTypeID: 0,
      isActive: true,
    });
  }

  async function getItemCategoryBySupplierID() {
    const result = await services.getItemCategoryBySupplierID(factoryGRN.supplierID);
    setItemCategoryList(result);
  }

  async function getfactoryItemsForDropDown() {

    const response = await services.getItemsOfSupplierDetails(factoryGRN.supplierID);
    var itemsArray = [];
    for (let item of Object.entries(response)) {
      itemsArray[item[1]["factoryItemSupplierID"]] = item[1]["itemName"]
    }
    setFacItemDetails(response);
  }
  async function getfactoryItemsForDropDownBySupplierIDItemCategoryID() {

    const factoryItem = await services.getfactoryItemsBySupplierIDItemCategoryID(factoryGRN.supplierID, grnlist.itemCategoryID, factoryGRN.factoryID);
    setFactoryItems(factoryItem);
  }

  async function getSuppliers() {
    const suppliers = await services.GetSuppliersByGroupIDAndFactoryID(factoryGRN.groupID, factoryGRN.factoryID);
    setSuppliers(suppliers);
  }

  async function GetSuppliersByItemCategoryID(groupID, factoryID, itemCategoryID) {
    const suppliers = await services.GetSuppliersByItemCategoryID(groupID, factoryID, itemCategoryID);
    setSuppliers(suppliers);

  }
  async function getPurchaseOrderList() {
    const purchaseOrderList = await services.getPurchaseOrderListByPurchaseOrderID(factoryGRN.poNumber);
    let data = [...purchaseOrderList]
    data.forEach(x => {
      x.grnNumber = createGrnNumberForPOList(x);
      x.itemName = x.factoryItemName;
      x.supplierName = x.supplierName;
      x.factoryItem = x.factoryItemID;
      x.quantity = x.quantity;
      //x.unitPrice = 0;
    });

    setTableItems(data);
  }
  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getFactoriesForDropDown(groupID) {
    const factory = await services.getfactoriesForDropDown(groupID);
    setFactories(factory);
  }

  async function getPurchaseOrderListing() {
    const list = await services.getPurchaseOrderListing(factoryGRN.factoryID);
    setPurchaseOrder(list);
  }

  async function getSupplierByPurchaseOrderID() {
    const list = await services.getSupplierByPurchaseOrderID(factoryGRN.poNumber);
    if (list != null) {

      setFactoryGRN({
        ...factoryGRN,
        // supplierID: list.supplierName,
        supplierID: list.supplierID,
      });
      setTempSuplierID(list.supplierID);
    }
    else {
      setFactoryGRN({
        ...factoryGRN,
        supplierID: 0,
      });
    }
  }

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITFACTORYITEMGRNADD');

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
      setFactoryGRN({
        ...factoryGRN,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      });
    }
  }

  async function getItemDetails(factoryItemGRNAddID) {

    let response = await services.getGRNDetailsByID(factoryItemGRNAddID);
    let data = response;
   
    const list = await services.getPurchaseOrderListing(data.factoryID);

    const result = list.find(e => e.purchaseOrderID === data.purchaseOrderID)
    setTempValu(result)

    setTitle("Edit Good Receive Note");
    setFactoryGRN({
      ...factoryGRN,
      groupID: data.groupID,
      factoryID: data.factoryID,
      grnType: data.grnTypeID,
      poNumber: data.poNumber,
      invoiceNumber: data.invoiceNumber,
      supplierID: data.supplierID,
      locationID: data.locationID,
      paymentTypeID: data.paymentTypeID,
      isActive: data.isActive
    });

    setGrnList({
      ...grnlist,
      itemCategoryID: data.itemCategoryID,
      grnNumber: data.grnNumber,
      quantity: data.quantity,
      factoryItemSupplierID: data.factoryItem,
      unitPrice: data.unitPrice,
      buyingPrice: data.buyingPrice,

    });
    setIsUpdate(true);
    await GetSuppliersByItemCategoryID(data.groupID, data.factoryID, data.itemCategoryID)
  }

  async function saveFactoryGrnAdd(values) {
    
    var dueDate = selectedDueDate === undefined ? date.toISOString() : selectedDueDate.toISOString();
    var invoiceDate = selectedInvoiceDate === undefined ? date.toISOString() : selectedInvoiceDate.toISOString();
    var receiveDate = selectedReceiveDate === undefined ? date.toISOString() : selectedInvoiceDate.toISOString();

    if (isUpdate == true) {

      var grnData = {
        grnNumber: grnlist.grnNumber,
        factoryItem: parseInt(grnlist.factoryItemSupplierID),
        quantity: parseFloat(grnlist.quantity),
        unitPrice: parseFloat(grnlist.unitPrice),
        buyingPrice: parseFloat(grnlist.buyingPrice)
      }

      let response = await services.updateFactoryItem(atob(factoryItemGRNAddID.toString()), factoryGRN, grnData
        , dueDate, invoiceDate, receiveDate);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(true);
        navigate('/app/factoryGRNAdd/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {

      if (factoryGRN.grnType == 2) {
        let count = 0;
        tableItems.forEach(x => {
          if (x.unitPrice == 0) {
            count++;
          }
        });
        if (count > 0) {
          alert.error("Please enter the selling price");
        }
        else {
          if (factoryGRN.poNumber != -1) {
            let response = await services.saveFactoryGrnAdd(values, tableItems, dueDate, invoiceDate, receiveDate, factoryGRN, tempSuplierID);
            if (response.statusCode == "Success") {
              alert.success(response.message);
              setIsDisableButton(true);
              navigate('/app/factoryGRNAdd/listing');
            }
            else {
              alert.error(response.message);
            }
          }
          else {
            alert.error("Please Select PO Number");
          }
        }

      }
      else {
        let response = await services.saveFactoryGrnAdd(values, tableItems, dueDate, invoiceDate, receiveDate, factoryGRN, tempSuplierID);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          setIsDisableButton(true);
          navigate('/app/factoryGRNAdd/listing');
        }
        else {
          alert.error(response.message);
        }
      }
    }
  }

  function handleSearchDropdownPONumber(data, e) {
    if (data === null) {
      setTempValu({
        purchaseOrderID: 0,
        purchaseOrderNumber: ""
      });
      return;
    }
    let list = [...purchaseOrder];
    setTempValu(data)
    const result = list.find(e => e.purchaseOrderNumber === data.purchaseOrderNumber)
    setFactoryGRN({
      ...factoryGRN,
      poNumber: result.purchaseOrderID
    });
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.name === 'isActive' ? target.checked : target.value

    setFactoryGRN({
      ...factoryGRN,
      [e.target.name]: value
    });
  }

  function handleChangeGrnListitemCategory(e) {
    const target = e.target;
    const value = target.value

    setGrnList({
      ...grnlist,
      itemCategoryID: value,
      factoryItemSupplierID: 0
    });
  }

  function changeDefaultValue(e) {
    if (e.target.value == 0) {
      setGrnList({
        ...grnlist,
        [e.target.name]: ''
      });
    }
  }

  function handleChangeGrnList(e) {
    const target = e.target;
    const value = target.value

    setGrnList({
      ...grnlist,
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

  function addItemToTable() {

    var supplierIdOfPreviousGrn = tableItems.find(x => x.supplierID === parseInt(factoryGRN.supplierID));
    if (!supplierIdOfPreviousGrn && tableItems.length !== 0) {
      alert.error("Cannot add diffrent suppliers for same grn");
      return;
    }

    if (grnlist.factoryItemSupplierID > 0) {
      var newItem = {
        supplierName: suppliers[grnlist.factoryItemSupplierID],
        supplierName: suppliers[factoryGRN.supplierID],
        supplierID: parseInt(factoryGRN.supplierID),
        id: tableItems.length + 1,
        grnNumber: createGrnNumber(),
        itemName: factoryItems[grnlist.factoryItemSupplierID],
        factoryItem: parseInt(grnlist.factoryItemSupplierID),
        quantity: parseFloat(grnlist.quantity),
        unitPrice: parseFloat(grnlist.unitPrice),
        buyingPrice: parseFloat(grnlist.buyingPrice),
        tableUnitPrice: parseFloat(grnlist.unitPrice).toFixed(2),
        tableBuyingPrice: parseFloat(grnlist.buyingPrice).toFixed(2),

      };

      setTableItems([
        ...tableItems,
        newItem

      ]);
      setGrnList({
        ...grnlist,
        itemCategoryID: 0,
        factoryItemSupplierID: 0,
        quantity: 0,
        unitPrice: '',
        buyingPrice: 0,
        supplierID: 0
      });
      setTempSuplierID(factoryGRN.supplierID);
      setFactoryGRN({
        ...factoryGRN,
        supplierID: 0
      });
    }
  }
  function handleclickSate() {
    setTempSuplierID(factoryGRN.supplierID);
  }

  function createGrnNumber() {
    var selectedFacItemCode = facItemDetails.find(x => parseInt(x.factoryItemSupplierID) === parseInt(grnlist.factoryItemSupplierID))

    var currentdate = new Date();
    var datetime = currentdate.getDate().toString().padStart(2, '0')
      + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      + currentdate.getFullYear().toString().padStart(4, '0')
      + currentdate.getHours().toString().padStart(2, '0')
      + currentdate.getMinutes().toString().padStart(2, '0')
      + currentdate.getSeconds().toString().padStart(2, '0');

    var incrementNo = (tableItems.length + 1).toString();
    var threeDigitIncrementNo = incrementNo.padStart(3, '0');
    var twoDigitItemNo = (selectedFacItemCode.itemCode).padStart(2, '0');

    return twoDigitItemNo + "_" + datetime + "_" + threeDigitIncrementNo;
  }

  function createGrnNumberForPOList(data) {

    var currentdate = new Date();
    var datetime = currentdate.getDate().toString().padStart(2, '0')
      + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      + currentdate.getFullYear().toString().padStart(4, '0')
      + currentdate.getHours().toString().padStart(2, '0')
      + currentdate.getMinutes().toString().padStart(2, '0')
      + currentdate.getSeconds().toString().padStart(2, '0');

    const min = 1;
    const max = 100;
    const rand = min + Math.random() * (max - min);

    var incrementNo = (parseInt(rand) + 1).toString();
    var threeDigitIncrementNo = incrementNo.padStart(3, '0');
    var twoDigitItemNo = (data.factoryItemCode).padStart(2, '0');

    return twoDigitItemNo + "_" + datetime + "_" + threeDigitIncrementNo;
  }

  function DeleteItem(data) {
    var remainArray = tableItems.filter(x => x.id !== data.id);

    remainArray.forEach(x => {
      if (x.id > data.id) {
        var value = x.grnNumber.split('_');
        var lastDigit = parseInt(value[2]) - 1;
        x.grnNumber = value[0] + "_" + value[1] + "_" + (lastDigit.toString()).padStart(3, '0')
      }
    })

    setTableItems(remainArray);
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: factoryGRN.groupID,
              factoryID: factoryGRN.factoryID,
              invoiceNumber: factoryGRN.invoiceNumber,
              locationID: factoryGRN.locationID,
              supplierID: factoryGRN.supplierID,
              paymentTypeID: factoryGRN.paymentTypeID,
              isActive: factoryGRN.isActive,
              grnType: factoryGRN.grnType,
              tableItemsAvailable: tableItems.length <= 0,
            }}
            validationSchema={
              Yup.object().shape({
                tableItemsAvailable: Yup.boolean(),
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                invoiceNumber: Yup.string().required('Invoice number is required').matches(/^[0-9a-zA-Z_@./#&+-]+$/, 'Only allow alphanumeric'),
                grnType: Yup.number().required('GRN Type is required').min("1", 'GRN Type is required'),
                locationID: Yup.number().required('Location required').min("1", 'Location required'),
                supplierID: Yup.number().when('tableItemsAvailable',{
                  is: true, 
                  then: Yup.number().required('Supplier is required').min("1", 'Supplier is required'),
                  otherwise: Yup.number(),
                })                
              })
            }
            onSubmit={saveFactoryGrnAdd}
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
                              value={factoryGRN.groupID}
                              variant="outlined"
                              size='small'
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled || isUpdate,
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
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
                              value={factoryGRN.factoryID}
                              size='small'
                              variant="outlined"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled || isUpdate,
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <InputLabel shrink>
                                Invoice date *
                              </InputLabel>
                              <KeyboardDatePicker
                                error={Boolean(touched.selectedInvoiceDate && errors.selectedInvoiceDate)}
                                helperText={touched.selectedInvoiceDate && errors.selectedInvoiceDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="selectedInvoiceDate"
                                id="date-picker-inline"
                                value={selectedInvoiceDate}
                                maxDate={new Date()}
                                size='small'
                                onChange={(e) => {
                                  handleInvoiceDateChange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{
                                  readOnly: true
                                }}
                                disabled={isUpdate ? true : false}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <InputLabel shrink>
                                Receive date *
                              </InputLabel>
                              <KeyboardDatePicker
                                error={Boolean(touched.selectedReceiveDate && errors.selectedReceiveDate)}
                                helperText={touched.selectedReceiveDate && errors.selectedReceiveDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                size='small'
                                name="selectedReceiveDate"
                                id="date-picker-inline"
                                value={selectedReceiveDate}
                                onChange={(e) => {
                                  handleReceiveDateChange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{
                                  readOnly: true
                                }}
                                disabled={isUpdate ? true : false}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink>
                              Payment due date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.selectedDueDate && errors.selectedDueDate)}
                                helperText={touched.selectedDueDate && errors.selectedDueDate}
                                autoOk
                                fullWidth
                                disablePast
                                variant="inline"
                                size='small'
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="selectedDueDate"
                                id="date-picker-inline"
                                value={selectedDueDate}
                                minDate={selectedInvoiceDate}
                                onChange={(e) => {
                                  handleDueDateChange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{
                                  readOnly: true
                                }}
                                disabled={isUpdate ? true : false}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="grnType">
                              GRN Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.grnType && errors.grnType)}
                              fullWidth
                              helperText={touched.grnType && errors.grnType}
                              name="grnType"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={factoryGRN.grnType}
                              size='small'
                              variant="outlined"
                              InputProps={{
                                readOnly: isUpdate,
                              }}
                            >
                              <MenuItem value="0">--Select GRN Type--</MenuItem>
                              <MenuItem value="1">Direct GRN</MenuItem>
                              <MenuItem value="2">Purchase Order</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="poNumber">
                              PO Number
                            </InputLabel>
                            <Autocomplete
                              options={purchaseOrder === undefined || purchaseOrder.length <= 0 ?
                                ([{
                                  purchaseOrderNumber: "", purchaseOrderID: 0
                                }])
                                : purchaseOrder}
                              size={"small"}
                              getOptionLabel={(option) => option.purchaseOrderNumber}
                              disabled={(factoryGRN.grnType == 2 && isUpdate) ? true : (factoryGRN.grnType != 2) ? true : false}
                              onChange={(e, value) => handleSearchDropdownPONumber(value, e)}
                              value={TempValu}
                              InputProps={{
                                readOnly: isUpdate,
                              }}
                              renderInput={(params) => (
                                <TextField {...params} fullWidth size='small' autoFocus variant="outlined" placeholder="--Select PO Number--" />
                              )}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="invoiceNumber">
                              Invoice Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.invoiceNumber && errors.invoiceNumber)}
                              fullWidth
                              helperText={touched.invoiceNumber && errors.invoiceNumber}
                              name="invoiceNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={factoryGRN.invoiceNumber}
                              variant="outlined"
                              disabled={isDisableButton}
                              size='small'
                              InputProps={{
                                readOnly: isUpdate,
                              }} />
                          </Grid>

                        </Grid>
                        <Grid container spacing={3}>
                          {factoryGRN.grnType == 1 ?
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="supplierID">
                                Supplier *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.supplierID && errors.supplierID)}
                                fullWidth
                                helperText={touched.supplierID && errors.supplierID}
                                name="supplierID"
                                size='small'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={factoryGRN.supplierID}
                                variant="outlined"
                                disabled={factoryGRN.grnType == 2 ? true : false}
                                InputProps={{
                                  readOnly: isUpdate,
                                }}
                              >
                                <MenuItem value="0">--Select Suppliers--</MenuItem>
                                {generateDropDownMenu(suppliers)}
                              </TextField>
                            </Grid>
                            : null}
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="locationID">
                                Location *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.locationID && errors.locationID)}
                                fullWidth
                                helperText={touched.locationID && errors.locationID}
                                name="locationID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={factoryGRN.locationID}
                                size='small'
                                variant="outlined"
                                InputProps={{
                                  readOnly: isUpdate,
                                }}
                              >
                                <MenuItem value="0">--Select Factory--</MenuItem>
                                {generateDropDownMenu(factories)}
                              </TextField>
                            </Grid>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="isActive">
                                Active
                              </InputLabel>
                              <Switch
                                checked={factoryGRN.isActive}
                                onChange={(e) => handleChange1(e)}
                                name="isActive"
                                id="isActive"
                              />
                            </Grid>
                        </Grid>
                        {factoryGRN.grnType == 1 || (factoryGRN.grnType == 2 && isUpdate == true) ?
                          <Formik
                            initialValues={{
                              itemCategoryID: grnlist.itemCategoryID,
                              factoryItemSupplierID: grnlist.factoryItemSupplierID,
                              quantity: grnlist.quantity,
                              unitPrice: grnlist.unitPrice,
                              buyingPrice: grnlist.buyingPrice
                            }}
                            validationSchema={
                              Yup.object().shape({
                                itemCategoryID: Yup.number().required('Item category is required').min("1", 'Item category is required'),
                                factoryItemSupplierID: Yup.number().required('Item is required').min("1", 'Item is required'),
                                quantity: Yup.string().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Only allow numbers with atmost two decimal places').test('min', 'Quantity can’t be zero', val => val > 0).nullable(),
                                unitPrice: Yup.string().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Only allow numbers with atmost two decimal places').test('min', 'Selling Price can’t be zero', val => val > 0).nullable(),
                                buyingPrice: Yup.string().matches(/^[0-9]*(\.[0-9]{0,2})?$/, 'Only allow numbers with atmost two decimal places').test('min', 'Buying Price can’t be zero', val => val > 0).nullable()
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
                                        size='small'
                                        onChange={(e) => handleChangeGrnListitemCategory(e)}
                                        value={grnlist.itemCategoryID}
                                        variant="outlined"
                                        InputProps={{
                                          readOnly: isUpdate,
                                        }}
                                        disabled={factoryGRN.grnType == 2 ? true : false}
                                      >
                                        <MenuItem value={0} disabled={true}>--Select Item Category--</MenuItem>
                                        {generateDropDownMenu(ItemCategoryList)}
                                      </TextField>
                                    </Grid>
                                  </Grid>
                                  <Grid container spacing={3}>
                                    {!isUpdate ? null : <Grid item md={3} xs={12}>
                                      <InputLabel shrink id="grnNumber">
                                        Grn Number
                                      </InputLabel>
                                      <TextField
                                        fullWidth
                                        name="grnNumber"
                                        size='small'
                                        value={grnlist.grnNumber}
                                        variant="outlined"
                                        disabled={true}
                                      />
                                    </Grid>}
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
                                        size='small'
                                        onChange={(e) => handleChangeGrnList(e)}
                                        value={grnlist.factoryItemSupplierID}
                                        variant="outlined"
                                        InputProps={{
                                          readOnly: isUpdate,
                                        }}
                                        disabled={factoryGRN.grnType == 2 ? true : false}
                                      >
                                        <MenuItem value="0">--Select Item--</MenuItem>
                                        {generateDropDownMenu(factoryItems)}
                                      </TextField>
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                      <InputLabel shrink id="quantity">
                                        Quantity *
                                      </InputLabel>
                                      <TextField
                                        error={Boolean(touched.quantity && errors.quantity)}
                                        fullWidth
                                        helperText={touched.quantity && errors.quantity}
                                        name="quantity"
                                        onBlur={handleBlur}
                                        size='small'
                                        onChange={(e) => handleChangeGrnList(e)}
                                        onClick={(e) => changeDefaultValue(e)}
                                        value={grnlist.quantity}
                                        variant="outlined"
                                        disabled={isDisableButton || factoryGRN.grnType == 2 || isUpdate ? true : false}
                                      />
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                      <InputLabel shrink id="buyingPrice">
                                        Buying Price(Rs) *
                                      </InputLabel>
                                      <TextField
                                        error={Boolean(touched.buyingPrice && errors.buyingPrice)}
                                        fullWidth
                                        helperText={touched.buyingPrice && errors.buyingPrice}
                                        name="buyingPrice"
                                        onBlur={handleBlur}
                                        size='small'
                                        onChange={(e) => handleChangeGrnList(e)}
                                        onClick={(e) => changeDefaultValue(e)}
                                        value={grnlist.buyingPrice}
                                        variant="outlined"
                                        disabled={isDisableButton || factoryGRN.grnType == 2 ? true : false}
                                      />
                                    </Grid>
                                    <Grid item md={3} xs={12}>
                                      <InputLabel shrink id="unitPrice">
                                        Selling Price(Rs) *
                                      </InputLabel>
                                      <TextField
                                        error={Boolean(touched.unitPrice && errors.unitPrice)}
                                        fullWidth
                                        helperText={touched.unitPrice && errors.unitPrice}
                                        name="unitPrice"
                                        onBlur={handleBlur}
                                        size='small'
                                        onChange={(e) => handleChangeGrnList(e)}
                                        onClick={(e) => changeDefaultValue(e)}
                                        value={grnlist.unitPrice}
                                        variant="outlined"
                                        disabled={isDisableButton || factoryGRN.grnType == 2 ? true : false}
                                      />
                                    </Grid>
                                    {isUpdate ? null :
                                      <Grid item md={12} xs={12}
                                        container
                                        direction="row"
                                        justify="flex-end"
                                        alignItems="center">
                                        <Button
                                          color="primary"
                                          type="submit"
                                          variant="contained"
                                          size='small'
                                          disabled={factoryGRN.grnType == 2 ? true : false}
                                          onClick={handleclickSate}
                                        >
                                          Add
                                        </Button>
                                      </Grid>
                                    }
                                  </Grid>
                                </Card>
                              </Form>)
                            }</Formik>
                          : null}
                      </CardContent>
                      {isUpdate ? null :
                        <div>
                          {tableItems.length > 0 ?
                            <div>
                              <Box minWidth={1050}>
                                <MaterialTable
                                  title="Multiple Actions Preview"
                                  columns={[
                                    { title: 'GRN Number', field: 'grnNumber', editable: 'never' },
                                    { title: 'Item Name', field: 'itemName', editable: 'never' },
                                    { title: 'Supplier Name', field: 'supplierName', editable: 'never' },
                                    { title: 'Item Quantity', field: 'quantity', editable: 'never' },
                                    { title: 'Buying Price', field: 'buyingPrice', editable: 'never' },
                                    { title: 'Selling Price', field: 'unitPrice' },
                                  ]}
                                  data={tableItems}
                                  options={{
                                    exportButton: false,
                                    showTitle: false,
                                    headerStyle: { textAlign: "left", height: '1%' },
                                    cellStyle: { textAlign: "left" },
                                    columnResizable: false,
                                    actionsColumnIndex: -1
                                  }}
                                  actions={[
                                    {
                                      icon: 'delete',
                                      tooltip: 'Delete GRN',
                                      onClick: (event, rowData) => {
                                        DeleteItem(rowData);
                                      },
                                      disabled: true
                                    }
                                  ]}
                                  cellEditable={{
                                    cellStyle: {},
                                    onCellEditApproved: (newValue, oldValue, rowData, columnDef) => {
                                      return new Promise((resolve, reject) => {
                                        const clonedData = [...tableItems]
                                        if (newValue == '') {
                                          clonedData[rowData.tableData.id][columnDef.field] = parseFloat(oldValue)
                                        }
                                        else {
                                          clonedData[rowData.tableData.id][columnDef.field] = parseFloat(newValue)
                                        }
                                        setTableItems(clonedData)
                                        setTimeout(resolve, 600);
                                      });
                                    }
                                  }}
                                />
                              </Box>
                            </div>
                            : null}
                        </div>
                      }
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

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
  MenuItem
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
import tokenService from '../../../utils/tokenDecoder'
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { DatePicker } from "@material-ui/pickers";
import tokenDecoder from '../../../utils/tokenDecoder';

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
var screenCode = "SELLERCONTRACT"


export default function SellerContactAddEdit(props) {

  const [title, setTitle] = useState("Add Seller Contract")
  const navigate = useNavigate();
  const alert = useAlert();
  const classes = useStyles();
  const [selectedDate, handleDateChange] = useState();
  const [selectedCatelogDate, handleSelectedCatelogDate] = useState(new Date());
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const { sellerContractID } = useParams();
  let decrypted = 0;
  const [groups, setGroups] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [sellingMarks, setSellingMarks] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [factories, setFactories] = useState([]);
  const [invoiceNumbers, setInvoiceNumbers] = useState([]);
  const [grades, setGrades] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [selectedDispatchDate, setSelectedDispatchDate] = useState(new Date());
  const [SellerContact, setSellerContact] = useState({
    groupID: 0,
    factoryID: 0,
    invoiceNo: 0,
    brokerID: "0",
    buyerID: 0,
    buyerName: "",
    valuePerKg: "",
    valuePerLot: "",
    dateOfSelling: "0",
    lotNumber: "",
    teaGradeID: 0,
    noOfPackages: "",
    typeOfPack: 0,
    sampleAmount: "",
    netAmount: "",
    packNetWeight: "",
    value: "",
    valueAmount: "",
    statusID: 0,
    sellingMarkID: 0,
    dispatchYear: "",
    salesRate: "",
    typeofSales: "0",
    catelogDate: "",
    salesNumber: "",
    grossAmount: "",
    soldLOT: "",
    invNum: ""

  })

  const handleClick = () => {
    navigate('/app/sellerContact/listing');
  }

  useEffect(() => {
    trackPromise(getPermissions());
    trackPromise(
      getGroupsForDropdown());
  }, [])

  useEffect(() => {
    if (SellerContact.groupID !== 0) {
      trackPromise(
        getFactoriesForDropdown());
    }
  }, [SellerContact.groupID])


  useEffect(() => {
    if (SellerContact.factoryID !== 0) {
      trackPromise(
        getSellingMarksForDropdown());
      trackPromise(
        getGradesForDropdown());
      trackPromise(
        getBrokersForDropdown());
      trackPromise(
        getBuyersForDropdown());
      trackPromise(
        getStatusForDropdown());
      trackPromise(
        getValutionCompleteInvoiceNumbers());
    }
  }, [SellerContact.factoryID]);

  useEffect(() => {
    decrypted = atob(sellerContractID);
    if (decrypted != 0) {
      trackPromise(
        getSellerContractDetailsByID(decrypted),
      )
    }

  }, []);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITSELLERCONTRACT');

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

    setSellerContact({
      ...SellerContact,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })

  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoriesByGroupID(SellerContact.groupID);
    setFactories(factories);
  }

  async function getSellingMarksForDropdown() {
    const sellingMarks = await services.getSellingMarkList(SellerContact.groupID, SellerContact.factoryID);
    setSellingMarks(sellingMarks);
  }

  async function getGradesForDropdown() {
    const grades = await services.getGradeDetails(SellerContact.groupID, SellerContact.factoryID);
    setGrades(grades);
  }

  async function getBrokersForDropdown() {
    const brokers = await services.getBrokerList(SellerContact.groupID, SellerContact.factoryID);
    setBrokers(brokers);
  }

  async function getBuyersForDropdown() {
    const buyers = await services.getAllBuyers(SellerContact.groupID, SellerContact.factoryID);
    setBuyers(buyers);
  }

  async function getStatusForDropdown() {
    const status = await services.getAllStatus();
    setStatusList(status);
  }

  async function getValutionCompleteInvoiceNumbers() {
    const invoiceNumbers = await services.getValutionCompleteInvoiceNumbers(SellerContact.groupID, SellerContact.factoryID);
    setInvoiceNumbers(invoiceNumbers);
  }
  async function getSellerContractDetailsByID(sellerContractID) {
    let response = await services.getSellerContractDetailsByID(sellerContractID);
    let data = {
      sellerContractID: response.sellerContractID,
      groupID: response.groupID,
      factoryID: response.factoryID,
      sellingDate: response.sellingDate.split('T')[0],
      sellingMarkID: response.sellingMarkID,
      brokerID: response.brokerID,
      buyerID: response.buyerID,
      buyerName: response.buyerName,
      statusID: response.statusID,
      teaGradeID: response.teaGradeID,
      valuePerKg: response.valuePerKg,
      valuePerLot: response.valuePerLot,
      typeOfPack: response.typeOfPack,
      lotNumber: response.lotNumber,
      sampleAmount: response.sampleAllowance,
      packNetWeight: response.packNetWeight,
      netAmount: response.netWeight,
      value: response.value,
      valueAmount: response.valueAmount,
      noOfPackages: response.noOfPackages,
      invoiceNo: response.teaProductDispatchID,
      salesRate: response.salesRate,
      typeofSales: response.typeofSales,
      salesNumber: response.salesNumber,
      grossAmount: response.grossAmount,
      soldLOT: response.soldLOT,
      invNum: response.invoiceNo
    };

    setTitle("Edit Seller Contract");
    setSellerContact(data);
    setSelectedDispatchDate(response.dispatchYear)
    setIsUpdate(true)
  }

  async function getSellerContractDetailsByInvoiceNo(teaProductDispatchID) {
    let response = await services.getSellerContractDetailsByInvoiceNo(teaProductDispatchID);

    let data = {
      groupID: response.groupID,
      factoryID: response.factoryID,
      sellingDate: response.sellingDate.split('T')[0],
      sellingMarkID: response.sellingMarkID,
      brokerID: response.brokerID,
      teaGradeID: response.teaGradeID,
      valuePerKg: response.valuePerKg,
      valuePerLot: response.valuePerLot,
      typeOfPack: response.typeOfPack,
      lotNumber: response.lotNumber,
      sampleAmount: response.sampleAmount.toFixed(2),
      packNetWeight: response.packNetWeight.toFixed(2),
      netAmount: response.netAmount.toFixed(2),
      value: response.value,
      valueAmount: response.valueAmount,
      noOfPackages: response.noOfPackages,
      invoiceNo: teaProductDispatchID.toString(),
      grossAmount: response.grossQuantity.toFixed(2),
      soldLOT: response.lotNumber,
      catelogDate: response.dateofDispatched.split('T')[0],
      salesNumber: response.salesNumber,
      typeofSales: "0",
      statusID: 0,
      buyerID: 0
    };

    setSellerContact(data);
    setSelectedDispatchDate(response.dateofDispatched)
    handleDateChange(response.sellingDate)

  }

  async function saveSellerContract() {
    let model = {
      sellerContractID: parseInt(atob(sellerContractID)),
      groupID: parseInt(SellerContact.groupID),
      factoryID: parseInt(SellerContact.factoryID),
      teaGradeID: parseInt(SellerContact.teaGradeID),
      invoiceNo: parseInt(SellerContact.invoiceNo),
      brokerID: parseInt(SellerContact.brokerID),
      buyerID: parseInt(SellerContact.buyerID),
      sellingMarkID: parseInt(SellerContact.sellingMarkID),
      sellingDate: SellerContact.sellingDate,
      valuePerKg: parseFloat(SellerContact.valuePerKg),
      valuePerLot: parseFloat(SellerContact.valuePerLot),
      lotNumber: SellerContact.lotNumber,
      typeOfPack: SellerContact.typeOfPack,
      noOfPackages: parseInt(SellerContact.noOfPackages),
      sampleAmount: parseFloat(SellerContact.sampleAmount),
      packNetWeight: parseFloat(SellerContact.packNetWeight),
      netAmount: parseFloat(SellerContact.netAmount),
      value: parseFloat(SellerContact.value),
      valueAmount: parseFloat(SellerContact.valueAmount),
      statusID: parseInt(SellerContact.statusID),
      grossAmount: parseFloat(SellerContact.grossAmount),
      salesNumber: SellerContact.salesNumber == null ? "" : SellerContact.salesNumber,
      dispatchYear: selectedDispatchDate,
      catelogDate: selectedCatelogDate.toLocaleDateString(),
      typeofSales: parseInt(SellerContact.typeofSales),
      salesRate: SellerContact.salesRate,
      soldLOT: parseInt(SellerContact.soldLOT),
      createdBy: tokenDecoder.getUserIDFromToken(),
      createdDate: new Date().toISOString(),
      isActive: true
    }

    if (isUpdate == true) {

      let response = await services.updateSellerContract(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/sellerContact/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveSellerContract(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/sellerContact/listing');
      }
      else {
        alert.error(response.message);
      }
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
          />
        </Grid>
      </Grid>
    )
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setSellerContact({
      ...SellerContact,
      [e.target.name]: value
    });
  }

  function handleSearchDropdownChange(data, e) {

    if (data === undefined || data === null) {
      setSellerContact({
        ...SellerContact,
        invoiceNo: 0
      });
      return;
    } else
      var valueV = data["teaProductDispatchID"];
    setSellerContact({
      ...SellerContact,
      invoiceNo: valueV.toString()
    });
    getSellerContractDetailsByInvoiceNo(valueV);

  }

  function handleDispatchDateChange(date) {
    var year = date.getUTCFullYear();

    setSellerContact({
      ...SellerContact,
      dispatchYear: year.toString()
    });
    if (selectedDispatchDate != null) {
      var prevyear = selectedDispatchDate.getUTCFullYear();

      if ((prevyear != year)) {
        setSelectedDispatchDate(date)
      }
    } else {
      setSelectedDispatchDate(date)
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

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: SellerContact.groupID,
              factoryID: SellerContact.factoryID,
              invoiceNo: SellerContact.invoiceNo,
              buyerID: SellerContact.buyerID,
              statusID: SellerContact.statusID,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                invoiceNo: Yup.string().required('Invoice No required'),
                buyerID: Yup.number().required('Buyer required').min("1", 'Buyer required'),
                statusID: Yup.number().required('Status required').min("1", 'Status required'),
              })
            }
            onSubmit={() => trackPromise(saveSellerContract())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
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
                              Group  *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onChange={(e) => handleChange(e)}
                              value={SellerContact.groupID}
                              variant="outlined"
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
                              onChange={(e) => handleChange(e)}
                              value={SellerContact.factoryID}
                              variant="outlined"
                              size='small'
                              id="factoryID"
                              InputProps={{
                                readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          {isUpdate ?
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="invNum">
                                Invoice No *
                              </InputLabel>
                              <TextField
                                fullWidth
                                name="invNum"
                                onChange={(e) => handleChange(e)}
                                disabled={true}
                                value={SellerContact.invNum}
                                variant="outlined"
                                size='small'
                                id="invNum"
                              >
                              </TextField>
                            </Grid> :
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="invoiceNo">
                                Invoice No *
                              </InputLabel>
                              <Autocomplete
                                id="invoiceNo"
                                options={invoiceNumbers}
                                getOptionLabel={(option) => option.invoiceNo.toString()}
                                onChange={(e, value) => handleSearchDropdownChange(value, e)}
                                defaultValue={null}
                                disabled={isUpdate}
                                renderInput={(params) =>
                                  <TextField {...params} placeholder="--Select Invoice No--"
                                    error={Boolean(touched.invoiceNo && errors.invoiceNo)}
                                    helperText={touched.invoiceNo && errors.invoiceNo}
                                    variant="outlined"
                                    size='small'
                                    name="invoiceNo"
                                    fullWidth
                                    value={SellerContact.invoiceNo}
                                    getOptionDisabled={true}
                                  />
                                }
                              />
                            </Grid>}
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                variant="inline"
                                openTo="month"
                                views={["year"]}
                                label="Dispatch Year "
                                helperText="Select dispatch year"
                                value={selectedDispatchDate}
                                disabled={true}
                                onChange={(date) => handleDispatchDateChange(date)}
                                size='small'
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={4} xs={12} >
                            <InputLabel shrink id="salesRate">
                              Sales Rate *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="salesRate"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={SellerContact.salesRate}
                              size='small'
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="typeofSales">
                              Type Of Sales *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="typeofSales"
                              onChange={(e) => handleChange(e)}
                              value={SellerContact.typeofSales}
                              variant="outlined"
                              id="typeofSales"
                              size='small'
                            >
                              <MenuItem value="0">--Select Type Of Sales--</MenuItem>
                              <MenuItem value="1">Public Sale</MenuItem>
                              <MenuItem value="2">Private Sale</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="sellingMarkID">
                              Selling Mark
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="sellingMarkID"
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              value={SellerContact.sellingMarkID}
                              variant="outlined"
                              size='small'
                              id="sellingMarkID"
                            >
                              <MenuItem value="0">--Select Selling Mark--</MenuItem>
                              {generateDropDownMenu(sellingMarks)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="brokerID">
                              Broker
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="brokerID"
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              value={SellerContact.brokerID}
                              variant="outlined"
                              id="brokerID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Broker--</MenuItem>
                              {generateDropDownMenu(brokers)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="buyerID">
                              Buyer *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.buyerID && errors.buyerID)}
                              fullWidth
                              helperText={touched.buyerID && errors.buyerID}
                              name="buyerID"
                              onChange={(e) => handleChange(e)}
                              value={SellerContact.buyerID}
                              size='small'
                              variant="outlined"
                              id="buyerID"
                            >
                              <MenuItem value="0">--Select Buyer--</MenuItem>
                              {generateDropDownMenu(buyers)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="teaGradeID">
                              Grade
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="teaGradeID"
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={SellerContact.teaGradeID}
                              disabled={true}
                              variant="outlined"
                              size='small'
                              id="teaGradeID"
                            >
                              <MenuItem value={'0'}>
                                --Select Grade--
                              </MenuItem>
                              {generateDropDownMenu(grades)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="applicableMonth">
                              Date Of Selling
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                disabled={true}
                                id="date-picker-inline"
                                value={selectedDate}
                                onChange={(e) => {
                                  handleDateChange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <br>
                        </br>
                        <br>
                        </br>

                        <Divider />
                        <br>
                        </br>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="valuePerKg">
                              Value Per KG in Rs
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="valuePerKg"
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              value={SellerContact.valuePerKg}
                              variant="outlined"
                              size='small'
                              id="valuePerKg"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="valuePerLot">
                              Value Per Lot in Rs
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="valuePerLot"
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              value={SellerContact.valuePerLot}
                              variant="outlined"
                              size='small'
                              id="valuePerLot"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="catelogDate">
                              Catelogue Date
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                disabled={true}
                                id="date-picker-inline"
                                value={selectedCatelogDate}
                                onChange={(e) => {
                                  handleSelectedCatelogDate(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="lotNumber">
                              Lot Number
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="lotNumber"
                              onChange={(e) => handleChange(e)}
                              value={SellerContact.lotNumber}
                              disabled={true}
                              variant="outlined"
                              size='small'
                              id="lotNumber"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="noOfPackages">
                              No Of Packages
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="noOfPackages"
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              value={SellerContact.noOfPackages}
                              variant="outlined"
                              size='small'
                              id="noOfPackages"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="salesNumber">
                              Sales Number
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="salesNumber"
                              onChange={(e) => handleChange(e)}
                              value={SellerContact.salesNumber}
                              disabled={true}
                              variant="outlined"
                              size='small'
                              id="salesNumber"
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="typeOfPack">
                              Type Of Pack
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="typeOfPack"
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              value={SellerContact.typeOfPack}
                              variant="outlined"
                              id="typeOfPack"
                              size='small'
                            >
                              <MenuItem value="0">--Select Type Of Pack--</MenuItem>
                              <MenuItem value="1">CHEST</MenuItem>
                              <MenuItem value="2">DJ_MWPS</MenuItem>
                              <MenuItem value="3">MWPS</MenuItem>
                              <MenuItem value="4">PS</MenuItem>
                              <MenuItem value="5">SPBS</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="sampleAmount">
                              Sample Allowance (KG)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="sampleAmount"
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              value={SellerContact.sampleAmount}
                              variant="outlined"
                              id="sampleAmount"
                              size='small'
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="value">
                              Value Rate
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="value"
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              value={SellerContact.value}
                              variant="outlined"
                              size='small'
                              id="value"
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                        <br>
                        </br>
                        <Divider />
                        <br>
                        </br>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="grossAmount">
                              Gross Weight (KG)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="grossAmount"
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              value={SellerContact.grossAmount}
                              variant="outlined"
                              id="grossAmount"
                              size='small'
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="netAmount">
                              Net Weight (KG)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="netAmount"
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              value={SellerContact.netAmount}
                              variant="outlined"
                              id="netAmount"
                              size='small'
                            >
                            </TextField>
                          </Grid>
                          {/* <Grid item md={4} xs={12}>
                            <InputLabel shrink id="packNetWeight">
                              Pack Net Weight (KG)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="packNetWeight"
                              onChange={(e) => handleChange(e)}
                              value={SellerContact.packNetWeight}
                              disabled={true}
                              variant="outlined"
                              size='small'
                              id="packNetWeight"
                            >
                            </TextField>
                          </Grid> */}
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="soldLOT">
                              Sold LOT
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="soldLOT"
                              onChange={(e) => handleChange(e)}
                              disabled={true}
                              value={SellerContact.soldLOT}
                              variant="outlined"
                              size='small'
                              id="soldLOT"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="statusID">
                              Status *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.statusID && errors.statusID)}
                              fullWidth
                              helperText={touched.statusID && errors.statusID}
                              name="statusID"
                              onChange={(e) => handleChange(e)}
                              value={SellerContact.statusID}
                              variant="outlined"
                              size='small'
                              id="statusID"
                            >
                              <MenuItem value="0">--Select Status--</MenuItem>
                              {generateDropDownMenu(statusList)}
                            </TextField>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
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

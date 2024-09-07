import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
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
import Autocomplete from '@material-ui/lab/Autocomplete';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

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

const screenCode = 'VALUATION';

export default function ValuationAddEdit(props) {
  const [title, setTitle] = useState("Add Valuation");
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [brokers, setBrokers] = useState([]);
  const [grades, setGrades] = useState();
  const [invoiceNumbers, setInvoiceNumbers] = useState([]);
  const [sellingMarks, setSellingMarks] = useState([]);
  const [valuation, setValuation] = useState({
    groupID: 0,
    factoryID: 0,
    invoiceNo: 0,
    invNo: '',
    brokerID: 0,
    sellingMarkID: 0,
    sellingDate: '',
    teaGradeID: 0,
    //valuePerKg: '',
    valuePerLot: '',
    lotNumber: '',
    typeOfPack: 0,
    noOfPackages: '',
    //unitAmount: '',
    sampleAmount: '',
    netAmount: '',
    mValue: '',
    mValueAmount: '',
    value: '',
    valueAmount: '',
    packWeight: '',
    salesNumber: '',
    valuationTypeID: '',
    valuationDate: '',
    dispatchDate: '',
    catalogueDate: '',
  });
  const [isUpdate, setIsUpdate] = useState(false);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const { valuationID } = useParams();
  let decrypted = 0;
  const navigate = useNavigate();
  const alert = useAlert();
  const handleClick = () => {
    navigate('/app/valuation/listing');
  }

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (valuation.groupID > 0) {
      trackPromise(
        getFactoriesForDropdown());
    }
  }, [valuation.groupID]);

  useEffect(() => {
    if (valuation.factoryID > 0) {
      trackPromise(
        getBrokersForDropdown());
      trackPromise(
        getSellingMarksForDropdown());
      trackPromise(
        getGradesForDropdown());
      trackPromise(
        getInvoiceNumbersForDropdown());
    }
  }, [valuation.factoryID]);

  useEffect(() => {
    decrypted = atob(valuationID);
    if (decrypted != 0) {
      trackPromise(
        getValuationDetailsByID(decrypted),
      )
    }

  }, []);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITVALUATION');
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

    setValuation({
      ...valuation,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(valuation.groupID);
    setFactories(factories);
  }

  async function getBrokersForDropdown() {
    const brokers = await services.getBrokerList(valuation.groupID, valuation.factoryID);
    setBrokers(brokers);
  }
  async function getSellingMarksForDropdown() {
    const sellingMarks = await services.getSellingMarkList(valuation.groupID, valuation.factoryID);
    setSellingMarks(sellingMarks);
  }

  async function getGradesForDropdown() {
    const grades = await services.getGradeDetails(valuation.groupID, valuation.factoryID);
    setGrades(grades);
  }

  async function getInvoiceNumbersForDropdown() {
    const invoiceNumbers = await services.getAllInvoiceNumbers(valuation.groupID, valuation.factoryID);
    setInvoiceNumbers(invoiceNumbers);
  }

  async function getValuationDetailsByInvoiceNo(teaProductDispatchID) {
    let response = await services.getValuationDetailsByInvoiceNo(teaProductDispatchID);

    let data = {
      groupID: response.groupID,
      factoryID: response.factoryID,
      sellingDate: response.sellingDate.split('T')[0],
      sellingMarkID: response.sellingMarkID,
      brokerID: response.brokerID,
      teaGradeID: response.teaGradeID,
      typeOfPack: response.typeOfPack,
      lotNumber: response.lotNumber,
      sampleAmount: response.sampleQuantity,
      netAmount: response.netQuantity,
      noOfPackages: response.noOfPackages,
      invoiceNo: teaProductDispatchID.toString(),
      dispatchDate: response.dateofDispatched.split('T')[0],
      salesNumber: response.salesNumber,
      packWeight: response.packWeight

    };
    setValuation({
      ...valuation,
      groupID: data.groupID,
      factoryID: data.factoryID,
      sellingDate: data.sellingDate.split('T')[0],
      sellingMarkID: data.sellingMarkID,
      brokerID: data.brokerID,
      teaGradeID: data.teaGradeID,
      typeOfPack: data.typeOfPack,
      lotNumber: data.lotNumber,
      sampleAmount: data.sampleAmount,
      netAmount: data.netAmount,
      noOfPackages: data.noOfPackages,
      invoiceNo: data.invoiceNo,
      dispatchDate: data.dispatchDate,
      salesNumber: response.salesNumber,
      packWeight: data.packWeight
    });
  }

  async function getValuationDetailsByID(valuationID) {
    let response = await services.getValuationDetailsByID(valuationID);

    setValuation({
      ...valuation,
      valuationID: response.valuationID,
      sampleAmount: response.sampleAmount,
      invoiceNo: response.teaProductDispatchID.toString(),
      groupID: response.groupID,
      factoryID: response.factoryID,
      sellingDate: response.sellingDate.split('T')[0],
      sellingMarkID: response.sellingMarkID,
      brokerID: response.brokerID,
      teaGradeID: response.teaGradeID,
      //valuePerKg: response.valuePerKg,
      valuePerLot: response.valuePerLot,
      typeOfPack: response.typeOfPack,
      //unitAmount: response.unitAmount,
      lotNumber: response.lotNumber,
      sampleAmount: response.sampleAmount,
      netAmount: response.netAmount,
      mValue: response.mValue,
      mValueAmount: response.mValueAmount,
      value: response.value,
      valueAmount: response.valueAmount,
      noOfPackages: response.noOfPackages,
      invNo: response.invoiceNo,
      packWeight: response.packWeight,
      salesNumber: response.salesNumber,
      valuationTypeID: response.valuationTypeID,
      valuationDate: response.valuationDate.split('T')[0],
      dispatchDate: response.dispatchDate.split('T')[0],
      catalogueDate: response.catalogueDate == "0001-01-01T00:00:00" ? null : response.catalogueDate.split('T')[0],
    });

    setIsUpdate(true);
    setTitle("Edit Valuation");
  }

  async function saveValuation() {
    let model = {
      valuationID: atob(valuationID),
      groupID: parseInt(valuation.groupID),
      factoryID: parseInt(valuation.factoryID),
      teaGradeID: parseInt(valuation.teaGradeID),
      invoiceNo: valuation.invoiceNo,
      brokerID: parseInt(valuation.brokerID),
      sellingMarkID: parseInt(valuation.sellingMarkID),
      sellingDate: valuation.sellingDate,
      //valuePerKg: parseFloat(valuation.valuePerKg),
      valuePerLot: valuation.valuePerLot != '' ? parseFloat(valuation.valuePerLot) : null,
      lotNumber: valuation.lotNumber,
      typeOfPack: valuation.typeOfPack,
      noOfPackages: parseFloat(valuation.noOfPackages),
      //unitAmount: parseFloat(valuation.unitAmount),
      sampleAmount: parseFloat(valuation.sampleAmount),
      netAmount: valuation.netAmount != '' ? parseFloat(valuation.netAmount) : null,
      mValue: valuation.mValue != '' ? parseFloat(valuation.mValue) : null,
      mValueAmount: valuation.mValue != '' ? parseFloat(valuation.netAmount * valuation.mValue) : null,
      value: parseFloat(valuation.value),
      valueAmount: valuation.value != '' ? parseFloat(valuation.netAmount * valuation.value) : null,
      packWeight: parseFloat(valuation.packWeight),
      salesNumber: valuation.salesNumber,
      valuationTypeID: parseInt(valuation.valuationTypeID),
      valuationDate: valuation.valuationDate,
      dispatchDate: valuation.dispatchDate,
      catalogueDate: valuation.catalogueDate != "0001-01-01T00:00:00" ? valuation.catalogueDate : valuation.catalogueDate == '' ? null : null,
      isActive: true
    }

    if (isUpdate == true) {

      let response = await services.updateValuation(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/valuation/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveValuation(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/valuation/listing');
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setValuation({
      ...valuation,
      [e.target.name]: value
    });
  }

  function handleSearchDropdownChange(data, e) {
    if (data === undefined || data === null) {
      setValuation({
        ...valuation,
        invoiceNo: 0
      });
      return;
    } else {
      var valueV = data["teaProductDispatchID"];
      setValuation({
        ...valuation,
        invoiceNo: valueV.toString()
      });
      getValuationDetailsByInvoiceNo(valueV)
    }

  }

  function clearFormFields() {
    setValuation({
      ...valuation,
      invoiceNo: 0,
      brokerID: 0,
      sellingMarkID: 0,
      sellingDate: '',
      valuationDate: '',
      dispatchDate: '',
      teaGradeID: 0,
      //valuePerKg: '',
      valuePerLot: '',
      lotNumber: '',
      typeOfPack: 0,
      noOfPackages: '',
      //unitAmount: '',
      sampleAmount: '',
      netAmount: '',
      mValue: '',
      mValueAmount: '',
      value: '',
      valueAmount: '',
      packWeight: '',
      salesNumber: '',
      valuationTypeID: '',
      valuationDate: '',
      dispatchDate: '',
      catalogueDate: '',
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
          <Formik
            initialValues={{
              groupID: valuation.groupID,
              factoryID: valuation.factoryID,
              invoiceNo: valuation.invoiceNo,
              brokerID: valuation.brokerID,
              sellingMarkID: valuation.sellingMarkID,
              sellingDate: valuation.sellingDate,
              teaGradeID: valuation.teaGradeID,
              //valuePerKg: valuation.valuePerKg,
              valuePerLot: valuation.valuePerLot,
              lotNumber: valuation.lotNumber,
              typeOfPack: valuation.typeOfPack,
              noOfPackages: valuation.noOfPackages,
              //unitAmount: valuation.unitAmount,
              sampleAmount: valuation.sampleAmount,
              netAmount: valuation.netAmount,
              mValue: valuation.mValue,
              mValueAmount: valuation.mValueAmount,
              value: valuation.value,
              valueAmount: valuation.valueAmount,
              packWeight: valuation.packWeight,
              salesNumber: valuation.salesNumber,
              valuationTypeID: valuation.valuationTypeID,
              valuationDate: valuation.valuationDate,
              dispatchDate: valuation.dispatchDate,
              catalogueDate: valuation.catalogueDate,

            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                invoiceNo: Yup.number().required('Invoice No is required').min("1", 'Invoice No is required'),
                brokerID: Yup.number().required('Broker Name is required').min("1", 'Broker Name is required'),
                sellingMarkID: Yup.number().required('Selling Mark is required').min("1", 'Selling Mark is required'),
                sellingDate: Yup.date().required('Selling Date is required').typeError("Date is required"),
                //valuePerKg: Yup.number().required('Value Per Kg is required').min("1", 'Value Per Kg is required'),
                valuePerLot: Yup.number().notRequired('Value per lot is required').min("1", 'Value per lot is required'),
                typeOfPack: Yup.number().required('Type of pack is required').min("1", 'Type of pack is required'),
                noOfPackages: Yup.number().required('No of packages is required').test('noOfPackages', "Please provide valid number", val => val > 0),
                //unitAmount: Yup.number().required('Unit amount is required').test('unitAmount', "Please provide valid unit amount", val => val > 0),
                sampleAmount: Yup.number().required('Sample amount is required').test('sampleAmount', "Please provide valid sample amount", val => val > 0),
                netAmount: valuation.netAmount != '' ? Yup.number().test('netAmount', "Please provide valid net amount", val => val > 0) : Yup.number().notRequired(),
                mValue: valuation.mValue != '' ? Yup.number().test('mValue', "Please provide valid min value", val => val > 0) : Yup.number().notRequired(),
                mValueAmount: valuation.mValueAmount != '' ? Yup.number().test('mValueAmount', "Please provide valid min value amount", val => val > 0) : Yup.number().notRequired(),
                value: Yup.number().required("Value is required").test('value', "Please provide valid sample amount", val => val > 0),
                packWeight: Yup.number().required('Pack weight is required').test('packWeight', "Please provide valid pack weight", val => val > 0),
                //salesNumber: Yup.number().integer("Sales Number cannot contain decimal values").required('Sales Number is required').test('salesNumber', "Please provide valid sales number", val => val > 0),
                valuationTypeID: Yup.number().required('Valuation Type is required').min("1", 'Valuation Type is required'),
                valuationDate: Yup.date().required('Valuation Date is required').typeError("Date is required"),
                dispatchDate: Yup.date().required('Dispatch Date is required').typeError("Date is required"),
                teaGradeID: Yup.number().required('Tea grade is required').min("1", 'Tea grade is required'),
                valueAmount: valuation.valueAmount != '' ? Yup.number().test('valueAmount', "Please provide valid value", val => val > 0) : Yup.number().notRequired('Value Amount is required')
              })
            }
            enableReinitialize
            onSubmit={() => trackPromise(saveValuation())}
          >
            {({
              errors,
              handleBlur,
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
                      <CardContent style={{ marginBottom: "1rem" }}>
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
                              onChange={(e) => handleChange(e)}
                              value={valuation.groupID}
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
                              onChange={(e) => handleChange(e)}
                              value={valuation.factoryID}
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

                          <Grid item md={4} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                error={Boolean(touched.factoryID && errors.factoryID)}
                                fullWidth
                                helperText={touched.factoryID && errors.factoryID}
                                autoOk
                                variant="inline"
                                openTo="month"
                                views={["year"]}
                                label=" Dispatch Year*"
                                size='small'
                                disableFuture={true}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>

                          <Grid item md={4} xs={12} hidden={isUpdate}>
                            <InputLabel shrink id="invoiceNo">
                              Invoice No *
                            </InputLabel>
                            <Autocomplete
                              id="invoiceNo"
                              options={invoiceNumbers}
                              getOptionLabel={(option) => option.invoiceNo.toString()}
                              onChange={(e, value) => handleSearchDropdownChange(value, e)}
                              defaultValue={null}
                              renderInput={(params) =>
                                <TextField {...params} placeholder="--Select Invoice No--"
                                  error={Boolean(touched.invoiceNo && errors.invoiceNo)}
                                  helperText={touched.invoiceNo && errors.invoiceNo}
                                  variant="outlined"
                                  name="invoiceNo"
                                  fullWidth
                                  size='small'
                                  value={valuation.invoiceNo}
                                  getOptionDisabled={true}
                                />
                              }
                            />
                          </Grid>
                          <Grid item md={4} xs={12} hidden={!isUpdate}>
                            <InputLabel shrink id="invNo">
                              Invoice No *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.invNo && errors.invNo)}
                              fullWidth
                              helperText={touched.invNo && errors.invNo}
                              name="invNo"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={valuation.invNo}
                              size='small'
                              InputProps={{
                                readOnly: true
                              }}
                              variant="outlined"
                            />
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="sellingDate">
                              Selling Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.sellingDate && errors.sellingDate)}
                              fullWidth
                              helperText={touched.sellingDate && errors.sellingDate}
                              name="sellingDate"
                              type="date"
                              onChange={(e) => handleChange(e)}
                              value={valuation.sellingDate}
                              variant="outlined"
                              size='small'
                              id="sellingDate"
                              InputProps={{
                                readOnly: true
                              }}
                            />
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="dispatchDate">
                              Dispatch Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.dispatchDate && errors.dispatchDate)}
                              fullWidth
                              helperText={touched.dispatchDate && errors.dispatchDate}
                              name="dispatchDate"
                              type="date"
                              onChange={(e) => handleChange(e)}
                              value={valuation.dispatchDate}
                              variant="outlined"
                              size='small'
                              id="dispatchDate"
                              InputProps={{
                                readOnly: true
                              }}
                            />
                          </Grid>
                        </Grid>

                        <Grid style={{ marginTop: "2rem" }}>
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="valuationTypeID">
                                Types of valuation *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.valuationTypeID && errors.valuationTypeID)}
                                fullWidth
                                helperText={touched.valuationTypeID && errors.valuationTypeID}
                                name="valuationTypeID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={valuation.valuationTypeID}
                                size='small'
                                variant="outlined"
                              >
                                <MenuItem value="0">--Select Valuation Type--</MenuItem>
                                <MenuItem value="1">Factory</MenuItem>
                                <MenuItem value="2">Broker</MenuItem>
                              </TextField>
                            </Grid>

                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="valuationDate">
                                Valuation Date *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.valuationDate && errors.valuationDate)}
                                fullWidth
                                helperText={touched.valuationDate && errors.valuationDate}
                                name="valuationDate"
                                type="date"
                                onChange={(e) => handleChange(e)}
                                value={valuation.valuationDate}
                                variant="outlined"
                                size='small'
                                id="valuationDate"
                              />
                            </Grid>

                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="brokerID">
                                Broker Name *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.brokerID && errors.brokerID)}
                                fullWidth
                                helperText={touched.brokerID && errors.brokerID}
                                name="brokerID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                size='small'
                                value={valuation.brokerID}
                                variant="outlined"
                                id="brokerID"
                                InputProps={{
                                  readOnly: true
                                }}
                              >
                                <MenuItem value={'0'}>--Select Broker--</MenuItem>
                                {generateDropDownMenu(brokers)}
                              </TextField>
                            </Grid>
                          </Grid>

                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="sellingMarkID">
                                Selling Mark *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.sellingMarkID && errors.sellingMarkID)}
                                fullWidth
                                helperText={touched.sellingMarkID && errors.sellingMarkID}
                                name="sellingMarkID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={valuation.sellingMarkID}
                                size='small'
                                variant="outlined"
                                InputProps={{
                                  readOnly: true
                                }}
                              >
                                <MenuItem value={'0'}>--Select Selling Mark--</MenuItem>
                                {generateDropDownMenu(sellingMarks)}
                              </TextField>
                            </Grid>

                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="teaGradeID">
                                Grade *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.teaGradeID && errors.teaGradeID)}
                                fullWidth
                                helperText={touched.teaGradeID && errors.teaGradeID}
                                name="teaGradeID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={valuation.teaGradeID}
                                size='small'
                                variant="outlined"
                                InputProps={{
                                  readOnly: true
                                }}
                              >
                                <MenuItem value="0">--Select Grade--</MenuItem>
                                {generateDropDownMenu(grades)}
                              </TextField>
                            </Grid>
                            {/* <Grid item md={4} xs={12}>
                              <InputLabel shrink id="valuePerKg">
                                Value per Kg in Rs *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.valuePerKg && errors.valuePerKg)}
                                fullWidth
                                helperText={touched.valuePerKg && errors.valuePerKg}
                                name="valuePerKg"
                                type='number'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                size='small'
                                value={valuation.valuePerKg}
                                variant="outlined"
                              />
                            </Grid> */}
                          </Grid>
                        </Grid>

                        <Grid style={{ marginTop: "2rem" }}>
                          <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="lotNumber">
                                Lot Number *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.lotNumber && errors.lotNumber)}
                                fullWidth
                                helperText={touched.lotNumber && errors.lotNumber}
                                name="lotNumber"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                size='small'
                                value={valuation.lotNumber}
                                variant="outlined"
                                InputProps={{
                                  readOnly: true
                                }} >
                              </TextField>
                            </Grid>

                            {/* <Grid item md={4} xs={12}>
                              <InputLabel shrink id="valuePerLot">
                                Value per Lot in Rs
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.valuePerLot && errors.valuePerLot)}
                                fullWidth
                                helperText={touched.valuePerLot && errors.valuePerLot}
                                name="valuePerLot"
                                type='number'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                size='small'
                                value={valuation.valuePerLot}
                                variant="outlined"
                              />
                            </Grid> */}
                            <Grid item md={4} xs={12}>
                              <InputLabel shrink id="typeOfPack">
                                Types Of Packs *
                              </InputLabel>
                              <TextField select
                                error={Boolean(touched.typeOfPack && errors.typeOfPack)}
                                fullWidth
                                helperText={touched.typeOfPack && errors.typeOfPack}
                                name="typeOfPack"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                size='small'
                                value={valuation.typeOfPack}
                                variant="outlined"
                                InputProps={{
                                  readOnly: true
                                }}
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
                              <InputLabel shrink id="noOfPackages">
                                No of Packages *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.noOfPackages && errors.noOfPackages)}
                                fullWidth
                                helperText={touched.noOfPackages && errors.noOfPackages}
                                name="noOfPackages"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={valuation.noOfPackages}
                                variant="outlined"
                                size='small'
                                multiline={true}
                                InputProps={{
                                  readOnly: true
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="packWeight">
                              Pack Weight *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.packWeight && errors.packWeight)}
                              fullWidth
                              helperText={touched.packWeight && errors.packWeight}
                              name="packWeight"
                              type='number'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={valuation.packWeight}
                              variant="outlined"
                              InputProps={{
                                readOnly: true
                              }}
                            />
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="salesNumber">
                              Sales Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.salesNumber && errors.salesNumber)}
                              fullWidth
                              helperText={touched.salesNumber && errors.salesNumber}
                              name="salesNumber"
                              // type='number'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              size='small'
                              value={valuation.salesNumber}
                              variant="outlined"
                              InputProps={{
                                readOnly: true
                              }}
                            />
                          </Grid>
                        </Grid>

                        <Grid style={{ marginTop: "2rem" }}>
                          <Grid container spacing={3}>
                            {/* <Grid item md={3} xs={12}>
                              <InputLabel shrink id="unitAmount">
                                Unit Amount (Kg) *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.unitAmount && errors.unitAmount)}
                                fullWidth
                                helperText={touched.unitAmount && errors.unitAmount}
                                name="unitAmount"
                                type='number'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={valuation.unitAmount}
                                size='small'
                                variant="outlined" >
                              </TextField>
                            </Grid> */}

                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="sampleAmount">
                                Sample Amount (Kg) *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.sampleAmount && errors.sampleAmount)}
                                fullWidth
                                helperText={touched.sampleAmount && errors.sampleAmount}
                                name="sampleAmount"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={valuation.sampleAmount}
                                size='small'
                                variant="outlined"
                                InputProps={{
                                  readOnly: true
                                }} >
                              </TextField>
                            </Grid>

                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="netAmount">
                                Net Amount (Kg)
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.netAmount && errors.netAmount)}
                                fullWidth
                                helperText={touched.netAmount && errors.netAmount}
                                name="netAmount"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={valuation.netAmount}
                                size='small'
                                variant="outlined"
                                InputProps={{
                                  readOnly: true
                                }}>
                              </TextField>
                            </Grid>

                            {/* <Grid item md={3} xs={12}>
                              <InputLabel shrink id="catalogueDate">
                                Catalogue Date
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.catalogueDate && errors.catalogueDate)}
                                fullWidth
                                helperText={touched.catalogueDate && errors.catalogueDate}
                                name="catalogueDate"
                                type="date"
                                onChange={(e) => handleChange(e)}
                                value={valuation.catalogueDate}
                                variant="outlined"
                                size='small'
                                id="catalogueDate"
                              />
                            </Grid> */}
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="mValue">
                                M: Value (Rs/Kg)
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.mValue && errors.mValue)}
                                fullWidth
                                helperText={touched.mValue && errors.mValue}
                                name="mValue"
                                type='number'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={valuation.mValue}
                                size='small'
                                variant="outlined" >
                              </TextField>
                            </Grid>

                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="mValueAmount">
                                M: Value Amount (Rs)
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.mValueAmount && errors.mValueAmount)}
                                fullWidth
                                helperText={touched.mValueAmount && errors.mValueAmount}
                                name="mValueAmount"
                                type='number'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                value={valuation.netAmount * valuation.mValue}
                                size='small'
                                variant="outlined"
                                InputProps={{
                                  readOnly: true
                                }}  >
                              </TextField>
                            </Grid>
                          </Grid>

                          <Grid container spacing={3}>
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="value">
                                Value (Rs/Kg) *
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.value && errors.value)}
                                fullWidth
                                helperText={touched.value && errors.value}
                                name="value"
                                type='number'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                size='small'
                                value={valuation.value}
                                variant="outlined" >
                              </TextField>
                            </Grid>

                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="valueAmount">
                                Value Amount (Rs)
                              </InputLabel>
                              <TextField
                                error={Boolean(touched.valueAmount && errors.valueAmount)}
                                fullWidth
                                helperText={touched.valueAmount && errors.valueAmount}
                                name="valueAmount"
                                type='number'
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e)}
                                size='small'
                                value={valuation.netAmount * valuation.value}
                                variant="outlined" >
                              </TextField>
                            </Grid>
                          </Grid>
                        </Grid>

                      </CardContent>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        {isUpdate ? null :
                          <Button
                            color="primary"
                            type="reset"
                            variant="outlined"
                            onClick={() => clearFormFields()}
                            size='small'
                          >
                            Cancel
                          </Button>}

                        <div>&nbsp;</div>

                        {isUpdate ? null :
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            size='small'
                          >
                            {isUpdate == true ? "Update" : "Save"}
                          </Button>}
                      </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container >
      </Page >
    </Fragment >
  );
};


import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Button, Card, makeStyles, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Typography, TableCell, TableHead, TableRow
} from '@material-ui/core';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import tokenService from '../../../../utils/tokenDecoder';
import tokenDecoder from 'src/utils/tokenDecoder';
import moment from 'moment';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import MaterialTable from "material-table";

export default function JobCreation({ groupData, factoryData }) {
  const [title, setTitle] = useState("Job Creation");
  const [GroupList, setGroupList] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [factoryList, setFactoryList] = useState([]);
  const [manufactureNumber, setManufactureNumber] = useState([]);
  const [manufacturingDetail, setManufacturingDetail] = useState({
    groupID: 0,
    factoryID: 0,
    manufactureNumber: "",
    greenLeafAmount: 0,
    fromDateOfCrop: new Date(),
    toDateOfCrop: new Date(),
    fromDateOfManufacture: new Date(),
    toDateOfManufacture: new Date(),
    fAmount: 0,
    rFAmount: 0,
    statusID: '',
    wAmount: 0,
    numberOfDays: 0,
    isActive: true,
    best: 0,
    belowBest: 0,
    poor: 0,
    weatherCondition: 0,
    fuelTypeID: 0,
    jobTypeID: 0,
    amount: '',
    toughID: [],
    rollerLineID: 0,
    fuelMeasuringUnitID: 0
  });
  const [manufactureId, setManufactureID] = useState();
  const [DhoolDetaislList, setDhoolDetaislList] = useState([]);
  const [successData, setSuccessData] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isHide, setIsHide] = useState(true);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [toughTypes, setToughTypes] = useState([]);
  const [rollingLines, setRollingLines] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedToughList, setSelectedToughList] = useState({ toughID: [] });
  const alert = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    trackPromise(
      getPermission(),
    );
  }, []);

  useEffect(() => {
    if (manufacturingDetail.groupID > 0) {
      trackPromise(
        getFactoriesForDropdown(),
        getJobTypesForDropdown()
      );
    }
  }, [manufacturingDetail.groupID]);

  useEffect(() => {
    if (manufacturingDetail.factoryID > 0) {
      trackPromise(
        generateBtachNumber()
      )
    }
  }, [factoryList, manufacturingDetail.factoryID]);

  useEffect(() => {
    if (manufacturingDetail.factoryID > 0) {
      getToughTypesForDropdowna();
      getRollerLinesForDropdown();
      getFuelTypesForDropdown();
    }
  }, [manufacturingDetail.factoryID])

  useEffect(() => {
    GetBatchDetailsToTable()
  }, []);

  async function getPermission() {
    setManufacturingDetail({
      ...manufacturingDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
    getGroupsForDropdown();
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(manufacturingDetail.groupID);
    setFactoryList(factories);
  }

  async function getFuelTypesForDropdown() {
    const fuelTypes = await services.getFuelTypesForDropdown(manufacturingDetail.factoryID);
    setFuelTypes(fuelTypes);
  }

  async function getJobTypesForDropdown() {
    const jobTypes = await services.getJobTypesForDropdown();
    setJobTypes(jobTypes);
  }

  async function getToughTypesForDropdowna() {
    const toughTypes = await services.getToughTypesForDropdown(manufacturingDetail.factoryID);
    setToughTypes(toughTypes);
  }

  async function getRollerLinesForDropdown() {
    const rollerLines = await services.getRollerLinesForDropdown(manufacturingDetail.factoryID);
    setRollingLines(rollerLines);
  }

  async function saveManufacture() {
    let toughList = [];
    selectedToughList.toughID.map((element) => toughList.push({
      tuoghID: parseInt(element),
      batchID: 0
    }));

    let DhoolDetaislListModel = {
      fuelTypeID: parseInt(manufacturingDetail.fuelTypeID),
      jobTypeID: parseInt(manufacturingDetail.jobTypeID),
      fuelMeasuringUnitID: parseInt(manufacturingDetail.fuelMeasuringUnitID),
      amount: parseFloat(manufacturingDetail.amount)
    }

    if (parseInt(manufacturingDetail.best) + parseInt(manufacturingDetail.belowBest) + parseInt(manufacturingDetail.poor) === 100) {
      let model = {
        groupID: parseInt(manufacturingDetail.groupID),
        factoryID: parseInt(manufacturingDetail.factoryID),
        manufactureNumber: manufacturingDetail.manufactureNumber,
        greenLeafAmount: manufacturingDetail.greenLeafAmount,
        numberOfDays: manufacturingDetail.numberOfDays,
        fromDateOfCrop: manufacturingDetail.fromDateOfCrop,
        toDateOfCrop: manufacturingDetail.toDateOfCrop,
        fromDateOfManufacture: manufacturingDetail.fromDateOfManufacture,
        toDateOfManufacture: manufacturingDetail.toDateOfManufacture,
        best: manufacturingDetail.best,
        belowBest: manufacturingDetail.belowBest,
        poor: manufacturingDetail.poor,
        weatherCondition: manufacturingDetail.weatherCondition,
        fuelConsumeList: DhoolDetaislListModel,
        isActive: true,
        createdBy: tokenDecoder.getUserIDFromToken(),
        createdDate: new Date().toISOString(),
        rollerLineID: manufacturingDetail.rollerLineID,
      }
      let response = await services.saveManufacture(model, DhoolDetaislListModel, toughList);

      if (response.statusCode == "Success") {
        alert.success(response.message);
        setManufactureID(response.data)
        setDhoolDetaislList([]);
        setSuccessData(response.data);
        setIsSaved(true);
        setIsHide(false);
        setManufacturingDetail([]);
        clearFormFields();
        setSelectedToughList({ toughID: [] });
        trackPromise(GetBatchDetailsToTable());
      }
      else {
        alert.error(response.message);
        setSuccessData(response.data);
      }
    }
    else {
      alert.error("Summation of Best, Below Best & Poor must be 100%")
    }
  }

  const handleFieldChange = event => {
    event.persist();
    setSelectedToughList(selectedToughList => ({
      ...selectedToughList,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value
    }));
  };

  async function generateBtachNumber() {
    if (isUpdate == false) {
      if (manufacturingDetail.factoryID !== 0) {
        const factoryName = factoryList.find(x => x.factoryID === manufacturingDetail.factoryID)
        const factoryCode = factoryList.find(x => x.factoryID === manufacturingDetail.factoryID)
        const concatCode = (factoryName.factoryName.toUpperCase().substring(0, 3)).concat(factoryCode.factoryCode)
        const concatManufactureNumber = concatCode.concat(moment().format("DDMMYYYYhhmmssms"))
        setManufactureNumber(concatManufactureNumber);
        setManufacturingDetail({
          ...manufacturingDetail,
          manufactureNumber: concatManufactureNumber
        });
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

  function generateFactoryDropDownMenu(data) {
    let items = []
    if (data != null) {
      factoryList.forEach(x => {
        items.push(<MenuItem key={x.factoryID} value={x.factoryID}>{x.factoryName}</MenuItem>)
      });
    }
    return items
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setManufacturingDetail({
      ...manufacturingDetail,
      [e.target.name]: value
    });
  }

  function handleDateChange(value, field) {
    setManufacturingDetail({
      ...manufacturingDetail,
      [field]: value
    });
  }

  async function clearFormFields() {
    setManufacturingDetail({
      ...manufacturingDetail,
      greenLeafAmount: '',
      fromDateOfCrop: new Date(),
      toDateOfCrop: new Date(),
      fromDateOfManufacture: new Date(),
      toDateOfManufacture: new Date(),
      fAmount: 0,
      rFAmount: 0,
      statusID: '',
      wAmount: 0,
      numberOfDays: '',
      isActive: true,
      best: 0,
      belowBest: 0,
      poor: 0,
      weatherCondition: 0,
      fuelTypeID: 0,
      jobTypeID: 0,
      amount: '',
      toughID: 0,
      rollerLineID: 0,
      fuelMeasuringUnitID: 0
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    )
  }

  async function GetBatchDetailsToTable() {
    const data = await services.GetBatchDetailsToJobCreationScreen(tokenService.getFactoryIDFromToken());
    setTableData(data);
  }

  const style = { backgroundColor: "#000000", width: "9px", height: "9px", marginTop: "5px" };
  const style1 = { backgroundColor: "#88e484", width: "10px", height: "10px", marginTop: "5px" };
  const style2 = { backgroundColor: "#f06292", width: "10px", height: "10px", marginTop: "5px" };
  const style3 = { backgroundColor: "#f48fb1", width: "10px", height: "10px", marginTop: "5px" };
  const style4 = { backgroundColor: "#f8bbd0", width: "10px", height: "10px", marginTop: "5px" };

  return (
    <>
      <Formik
        initialValues={{
          groupID: manufacturingDetail.groupID,
          factoryID: manufacturingDetail.factoryID,
          manufactureNumber: manufacturingDetail.manufactureNumber,
          greenLeafAmount: manufacturingDetail.greenLeafAmount,
          fromDateOfCrop: manufacturingDetail.fromDateOfCrop,
          toDateOfCrop: manufacturingDetail.toDateOfCrop,
          fromDateOfManufacture: manufacturingDetail.fromDateOfManufacture,
          toDateOfManufacture: manufacturingDetail.toDateOfManufacture,
          weatherCondition: manufacturingDetail.weatherCondition,
          fuelTypeID: manufacturingDetail.fuelTypeID,
          jobTypeID: manufacturingDetail.jobTypeID,
          amount: manufacturingDetail.amount,
          best: manufacturingDetail.best,
          belowBest: manufacturingDetail.belowBest,
          poor: manufacturingDetail.poor,
          numberOfDays: manufacturingDetail.numberOfDays,
          isActive: manufacturingDetail.isActive,
          toughID: manufacturingDetail.toughID,
          rollerLineID: manufacturingDetail.rollerLineID,
          fuelMeasuringUnitID: manufacturingDetail.fuelMeasuringUnitID
        }}
        validationSchema={
          Yup.object().shape({
            groupID: Yup.number().required('Group is required').min("1", 'Please Select a Group'),
            factoryID: Yup.number().required('Factory is required').min("1", 'Please Select a Factory'),
            fromDateOfCrop: Yup.date().required('From Date Of Crop is required').typeError('Invalid date'),
            toDateOfCrop: Yup.date().required('To Date Of Crop is required').typeError('Invalid date'),
            fromDateOfManufacture: Yup.date().required('From Date Of Manufacture is required').typeError('Invalid date'),
            toDateOfManufacture: Yup.date().required('To Date Of Manufacture is required').typeError('Invalid date'),
            greenLeafAmount: Yup.number().required('Green Leaf Quantity is required').min("1", 'Green Leaf Quantity should be grater than 0'),
            weatherCondition: Yup.number().required('Weather Condition is required').min("1", 'Please Select a Weather Condition'),
            best: Yup.number().required('Best percentage is required').min("1", 'Enter a positive percentage'),
            belowBest: Yup.number()
              .when('best', {
                is: bestValue => bestValue !== 100,
                then: Yup.number()
                  .required('Below Best percentage is required')
                  .min(1, 'Enter a positive percentage'),
                otherwise: Yup.number(),
              }),
            poor: Yup.number()
              .when('best', {
                is: bestValue => bestValue !== 100,
                then: Yup.number()
                  .required('Poor percentage is required')
                  .min("1", 'Enter a positive percentage'),
                otherwise: Yup.number(),
              }),
            fuelTypeID: Yup.number().required('Fuel Type is required').min("1", 'Please Select a Fuel Type'),
            jobTypeID: Yup.number().required('Job Type is required').min("1", 'Please Select a Job Type'),
            amount: Yup.number().required('Quantity is required').min("1", 'Quantity should be grater than 0'),
            numberOfDays: Yup.number().required('Number of days is required').min("1", 'Number of days should be grater than 0'),
            rollerLineID: Yup.number().required('Roller Line is required').min("1", 'Please Select a Roller Line'),
            fuelMeasuringUnitID: Yup.number().required('Measuring Unit is required').min("1", 'Please Select a Mesuaring Unit'),
          })
        }
        onSubmit={(event) => trackPromise(saveManufacture(event))}
        enableReinitialize
      >
        {({
          errors,
          handleBlur,
          handleSubmit,
          touched,
          isSubmitting
        }) => (
          <form onSubmit={handleSubmit}>
            <Box mt={0}>
              <Card>
                <CardHeader title={cardTitle(title)} />
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
                        value={manufacturingDetail.groupID}
                        variant="outlined"
                        id="groupID"
                        size='small'
                        InputProps={{
                          readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                        }}
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
                        value={manufacturingDetail.factoryID}
                        variant="outlined"
                        id="factoryID"
                        size='small'
                        InputProps={{
                          readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                        }}
                      >
                        <MenuItem value="0">--Select Factory--</MenuItem>
                        {generateFactoryDropDownMenu(factoryList)}
                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="manufactureNumber">
                        Manufacture Number *
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.manufactureNumber && errors.manufactureNumber)}
                        fullWidth
                        helperText={touched.manufactureNumber && errors.manufactureNumber}
                        name="manufactureNumber"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={manufacturingDetail.manufactureNumber}
                        variant="outlined"
                        size='small'
                        id="manufactureNumber"
                        InputProps={{
                          readOnly: true
                        }}
                      >
                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="greenLeafAmount">
                        Green Leaf Quantity (Kg) *
                      </InputLabel>
                      <TextField
                        type='number'
                        error={Boolean(touched.greenLeafAmount && errors.greenLeafAmount)}
                        fullWidth
                        helperText={touched.greenLeafAmount && errors.greenLeafAmount}
                        name="greenLeafAmount"
                        onBlur={handleBlur}
                        size='small'
                        onChange={(e) => handleChange(e)}
                        value={manufacturingDetail.greenLeafAmount}
                        variant="outlined"
                        id="greenLeafAmount"
                      >
                      </TextField>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="fromDateOfCrop">
                        From Date Of Crop *
                      </InputLabel>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          error={Boolean(touched.fromDateOfCrop && errors.fromDateOfCrop)}
                          helperText={touched.fromDateOfCrop && errors.fromDateOfCrop}
                          autoOk
                          fullWidth
                          variant="inline"
                          format="dd/MM/yyyy"
                          margin="dense"
                          id="fromDateOfCrop"
                          name="fromDateOfCrop"
                          size='small'
                          value={manufacturingDetail.fromDateOfCrop}
                          onChange={(e) => handleDateChange(e, "fromDateOfCrop")}
                          KeyboardButtonProps={{
                            'aria-label': 'change date',
                          }}
                          InputProps={{ readOnly: true }}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="toDateOfCrop">
                        To Date Of Crop *
                      </InputLabel>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          error={Boolean(touched.toDateOfCrop && errors.toDateOfCrop)}
                          helperText={touched.toDateOfCrop && errors.toDateOfCrop}
                          autoOk
                          fullWidth
                          variant="inline"
                          format="dd/MM/yyyy"
                          margin="dense"
                          id="toDateOfCrop"
                          size='small'
                          name="toDateOfCrop"
                          minDate={manufacturingDetail.fromDateOfCrop}
                          value={manufacturingDetail.toDateOfCrop}
                          onChange={(e) => handleDateChange(e, "toDateOfCrop")}
                          KeyboardButtonProps={{
                            'aria-label': 'change date',
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="fromDateOfManufacture">
                        From Date Of Manufacture *
                      </InputLabel>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          error={Boolean(touched.fromDateOfManufacture && errors.fromDateOfManufacture)}
                          helperText={touched.fromDateOfManufacture && errors.fromDateOfManufacture}
                          autoOk
                          fullWidth
                          variant="inline"
                          format="dd/MM/yyyy"
                          margin="dense"
                          id="fromDateOfManufacture"
                          size='small'
                          name="fromDateOfManufacture"
                          value={manufacturingDetail.fromDateOfManufacture}
                          onChange={(e) => handleDateChange(e, "fromDateOfManufacture")}
                          KeyboardButtonProps={{
                            'aria-label': 'change date',
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="toDateOfManufacture">
                        To Date Of Manufacture *
                      </InputLabel>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          error={Boolean(touched.toDateOfManufacture && errors.toDateOfManufacture)}
                          helperText={touched.toDateOfManufacture && errors.toDateOfManufacture}
                          autoOk
                          fullWidth
                          variant="inline"
                          format="dd/MM/yyyy"
                          margin="dense"
                          id="toDateOfManufacture"
                          size='small'
                          name="toDateOfManufacture"
                          minDate={manufacturingDetail.fromDateOfManufacture}
                          value={manufacturingDetail.toDateOfManufacture}
                          onChange={(e) => handleDateChange(e, "toDateOfManufacture")}
                          KeyboardButtonProps={{
                            'aria-label': 'change date',
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="numberOfDays">
                        Number Of Days *
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.numberOfDays && errors.numberOfDays)}
                        fullWidth
                        helperText={touched.numberOfDays && errors.numberOfDays}
                        name="numberOfDays"
                        type="number"
                        onBlur={handleBlur}
                        size='small'
                        onChange={(e) => handleChange(e)}
                        value={manufacturingDetail.numberOfDays}
                        variant="outlined"
                        id="numberOfDays"
                      >
                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="weatherCondition">
                        Weather Condition *
                      </InputLabel>
                      <TextField select
                        fullWidth
                        error={Boolean(touched.weatherCondition && errors.weatherCondition)}
                        helperText={touched.weatherCondition && errors.weatherCondition}
                        name="weatherCondition"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        size='small'
                        value={manufacturingDetail.weatherCondition}
                        variant="outlined"
                        id="weatherCondition"
                      >
                        <MenuItem value="0">--Select Weather Condition--</MenuItem>
                        <MenuItem value="1">Dry</MenuItem>
                        <MenuItem value="2">Rainy</MenuItem>
                        <MenuItem value="3">Heavy Rainy</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="toughID">
                        Tough *
                      </InputLabel>
                      <TextField
                        select
                        error={Boolean(touched.toughID && errors.toughID)}
                        fullWidth
                        helperText={touched.toughID && errors.toughID}
                        name="toughID"
                        onBlur={handleBlur}
                        variant="outlined"
                        id="toughID"
                        size='small'
                        SelectProps={{
                          multiple: true,
                          value: selectedToughList.toughID,
                          onChange: handleFieldChange
                        }}
                      >
                        <MenuItem value="0">--Select Tough--</MenuItem>
                        {generateDropDownMenu(toughTypes)}
                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="rollerLineID">
                        Rolling Line *
                      </InputLabel>
                      <TextField select
                        error={Boolean(touched.rollerLineID && errors.rollerLineID)}
                        fullWidth
                        helperText={touched.rollerLineID && errors.rollerLineID}
                        name="rollerLineID"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={manufacturingDetail.rollerLineID}
                        variant="outlined"
                        id="rollerLineID"
                        size='small'
                      >
                        <MenuItem value="0">--Select Rolling Line--</MenuItem>
                        {generateDropDownMenu(rollingLines)}
                      </TextField>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="best">
                        Best (%)
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.best && errors.best)}
                        fullWidth
                        helperText={touched.best && errors.best}
                        name="best"
                        onBlur={handleBlur}
                        size='small'
                        onChange={(e) => handleChange(e)}
                        value={manufacturingDetail.best}
                        variant="outlined"
                        id="best"
                        type='number'
                      >
                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="belowBest">
                        Below Best (%)
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.belowBest && errors.belowBest)}
                        fullWidth
                        helperText={touched.belowBest && errors.belowBest}
                        name="belowBest"
                        onBlur={handleBlur}
                        size='small'
                        onChange={(e) => handleChange(e)}
                        value={manufacturingDetail.belowBest}
                        variant="outlined"
                        id="belowBest"
                        type='number'
                      >
                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="poor">
                        Poor (%)
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.poor && errors.poor)}
                        fullWidth
                        helperText={touched.poor && errors.poor}
                        name="poor"
                        onBlur={handleBlur}
                        size='small'
                        onChange={(e) => handleChange(e)}
                        value={manufacturingDetail.poor}
                        variant="outlined"
                        id="poor"
                        type='number'
                      >
                      </TextField>
                    </Grid>
                  </Grid>
                  <br />
                  <Grid container spacing={3} style={{ marginTop: "1rem" }}>
                    <Grid item md={6} xs={8}>
                      <Typography variant="h6" gutterBottom>
                        Fuel Allocated
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="fuelTypeID">
                        Fuel Type *
                      </InputLabel>
                      <TextField select
                        fullWidth
                        error={Boolean(touched.fuelTypeID && errors.fuelTypeID)}
                        helperText={touched.fuelTypeID && errors.fuelTypeID}
                        name="fuelTypeID"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        size='small'
                        value={manufacturingDetail.fuelTypeID}
                        disabled={(manufacturingDetail.statusID == 2)}
                        variant="outlined"
                        id="fuelTypeID"
                      >
                        <MenuItem value="0">--Select Fuel Type--</MenuItem>
                        {generateDropDownMenu(fuelTypes)}
                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="jobTypeID">
                        Job Type *
                      </InputLabel>
                      <TextField select
                        fullWidth
                        error={Boolean(touched.jobTypeID && errors.jobTypeID)}
                        helperText={touched.jobTypeID && errors.jobTypeID}
                        name="jobTypeID"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        size='small'
                        value={manufacturingDetail.jobTypeID}
                        disabled={(manufacturingDetail.statusID == 2)}
                        variant="outlined"
                        id="jobTypeID"
                      >
                        <MenuItem value="0">--Select Job Type--</MenuItem>
                        {generateDropDownMenu(jobTypes)}
                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="amount">
                        Quantity *
                      </InputLabel>
                      <TextField
                        error={Boolean(touched.amount && errors.amount)}
                        fullWidth
                        helperText={touched.amount && errors.amount}
                        name="amount"
                        type='number'
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        size='small'
                        value={manufacturingDetail.amount}
                        disabled={(manufacturingDetail.statusID == 2)}
                        variant="outlined"
                        id="amount"
                      >
                      </TextField>
                    </Grid>
                    <Grid item md={3} xs={8}>
                      <InputLabel shrink id="fuelMeasuringUnitID">
                        Measuring Unit *
                      </InputLabel>
                      <TextField select
                        fullWidth
                        error={Boolean(touched.fuelMeasuringUnitID && errors.fuelMeasuringUnitID)}
                        helperText={touched.fuelMeasuringUnitID && errors.fuelMeasuringUnitID}
                        name="fuelMeasuringUnitID"
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        value={manufacturingDetail.fuelMeasuringUnitID}
                        variant="outlined"
                        id="fuelMeasuringUnitID"
                        size='small'
                      >
                        <MenuItem value="0">--Select Measuring Unit--</MenuItem>
                        <MenuItem value="1">Kg</MenuItem>
                        <MenuItem value="2">Pa</MenuItem>
                        <MenuItem value="3">L</MenuItem>
                        <MenuItem value="4">W</MenuItem>
                        <MenuItem value="5">Cubic Metre</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                  <Box display="flex" justifyContent="flex-end" p={2}>
                    <Button
                      color="primary"
                      variant="contained"
                      disabled={manufacturingDetail.statusID == 2}
                      type='submit'
                      size='small'
                    >
                      Create New Job
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </form >
        )
        }
      </Formik >
      {
        tableData.length > 0 ?
          <Box>
            < PerfectScrollbar >
              <Box display="flex" justifyContent="flex-start" p={5}>
                <div>
                  <Grid container>
                    <Grid style={style1}>
                    </Grid>
                    <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                      <b>
                        GLQ - Green Leaf Quantity (Kg)
                      </b>
                    </Grid>
                  </Grid>
                  <Grid style={{ marginTop: '10px' }} container>
                    <Grid style={style2}>
                    </Grid>
                    <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                      <b>
                        B - Best (%)
                      </b>
                    </Grid>
                  </Grid>
                  <Grid style={{ marginTop: '10px' }} container>
                    <Grid style={style3}>
                    </Grid>
                    <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                      <b>
                        BB - Below Best (%)
                      </b>
                    </Grid>
                  </Grid>
                </div>
                <div>
                  <Grid container style={{ marginLeft: '15px' }}>
                    <Grid style={style4}>
                    </Grid>
                    <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                      <b>
                        P - Poor (%)
                      </b>
                    </Grid>
                  </Grid>
                  <Grid style={{ marginTop: '10px', marginLeft: '15px' }} container>
                    <Grid style={style}>
                    </Grid>
                    <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                      <b>
                        MDF - Manufactured Date (From)
                      </b>
                    </Grid>
                  </Grid>
                  <Grid style={{ marginTop: '10px', marginLeft: '15px' }} container>
                    <Grid style={style}>
                    </Grid>
                    <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                      <b>
                        MDT - Manufactured Date (To)
                      </b>
                    </Grid>
                  </Grid>
                </div>
              </Box>
              <MaterialTable
                title="Multiple Actions Preview"
                columns={[
                  { title: 'Job Name', field: 'jobName' },
                  { title: 'Roling', field: 'rolingLineName' },
                  {
                    title: 'GLQ(Kg)', field: 'greenLeafQuantity'
                    , headerStyle: {
                      backgroundColor: "#88e484",
                      border: '2px solid #1c1c1c'
                    },
                    cellStyle: {
                      backgroundColor: "#c8ebcb",
                      border: '2px solid #1c1c1c'
                    }
                  },
                  {
                    title: 'MDF', field: 'fromDateOfCrop',
                    render: rowData => rowData.fromDateOfCrop.split('T')[0]
                  },
                  {
                    title: 'MDT', field: 'toDateOfCrop',
                    render: rowData => rowData.toDateOfCrop.split('T')[0]
                  },
                  {
                    title: 'Weather', field: 'weatherCondition',
                    render: rowData => {
                      if (rowData.weatherCondition == 1)
                        return "Dry"
                      else if (rowData.weatherCondition == 2)
                        return "Rainy"
                      else return "Heavy Rainy"
                    }
                  },
                  {
                    title: 'B(%)', field: 'best'
                    , headerStyle: {
                      backgroundColor: " #f06292",
                      border: '2px solid #1c1c1c'
                    },
                    cellStyle: {
                      backgroundColor: "#f06292",
                      border: '2px solid #1c1c1c'
                    }
                  },
                  {
                    title: 'BB(%)', field: 'belowBest',
                    headerStyle: {
                      backgroundColor: "#dac84d",
                      border: '2px solid #1c1c1c'
                    },
                    cellStyle: {
                      backgroundColor: "#f48fb1",
                      border: '2px solid #1c1c1c'
                    }
                  },
                  {
                    title: 'P(%)', field: 'poor',
                    headerStyle: {
                      backgroundColor: "#ddd954",
                      border: '2px solid #1c1c1c'
                    },
                    cellStyle: {
                      backgroundColor: "#f8bbd0",
                      border: '2px solid #1c1c1c'
                    }
                  }
                ]}
                data={tableData}
                components={{
                  Header: props => {
                    return (
                      <TableHead>
                        <TableRow>
                          <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Job Name</TableCell>
                          <TableCell align="center" width={250} style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Roling</TableCell>
                          <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>GLQ(Kg)</TableCell>
                          <TableCell align="center" width={250} style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>MDF</TableCell>
                          <TableCell align="center" width={250} style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>MDT</TableCell>
                          <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Weather</TableCell>
                          <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>B(%)</TableCell>
                          <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>BB(%)</TableCell>
                          <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>P(%)</TableCell>
                        </TableRow>
                      </TableHead>
                    );
                  },
                }}
                options={{
                  exportButton: false,
                  showTitle: false,
                  headerStyle: { textAlign: "left", border: '2px solid #1c1c1c' },
                  cellStyle: { textAlign: "left", border: '2px solid #1c1c1c' },
                  columnResizable: false,
                  actionsColumnIndex: -1,
                  search: false,
                  pageSize: 3
                }}
              />
            </PerfectScrollbar >
          </Box >
          : null
      }
    </>
  )
}

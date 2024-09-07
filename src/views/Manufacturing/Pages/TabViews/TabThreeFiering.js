import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import { AlertDialogWithoutButton } from '../../../Common/AlertDialogWithoutButton';
import MaterialTable from "material-table";
import tokenService from '../../../../utils/tokenDecoder';
import DeleteIcon from '@material-ui/icons/Delete';
import moment from 'moment';

export default function Fiering({ groupData, factoryData }) {
  const [ShoolDetails, setShoolDetails] = useState({
    firingID: 0,
    manufactureNumber: 0,
    startDateTime: new Date(),
    endDateTime: new Date(),
    temperature: 0,
    fireWeight: 0,
    dhoolWeight: 0,
    isBigbulk: 0,
    temperatureUnitID: 0,
    fuelTypeID: 0,
    fuelMeasuringUnitID: 0,
    fuelAmount: 0,
    firedDhoolWeightBy: 0,
    dhoolName: "0"
  });

  const [manufactureNumberList, setManufactureNumberList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [successData, setSuccessData] = useState([]);
  const [employeesForName, setEmployeesForName] = useState([]);
  const [fuelTypesForName, setFuelTypesForName] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [dhoolList, setDhoolList] = useState([]);
  const [selectedDhoolName, setSelectedDhoolName] = useState("");
  const [selectedDhoolWeight, setSelectedDhoolWeight] = useState(0);
  const [rollingSessionIDDetails, setRollingSessionIDDetails] = useState("");
  const [completeDialogbox, setCompleteDialogbox] = useState(false);
  const [tableData, setTableData] = useState([]);
  const alert = useAlert();
  const [ArrayField, setArrayField] = useState([]);
  const [arrayNewWareField, setArrayNewWareField] = useState([]);
  const [fieldDataList, setFieldDataList] = useState([]);
  const [manufactureList, setManufactureList] = useState([]);
  const [fieldData, setFieldData] = useState({
    firingID: 0,
    manufactureNumber: 0,
    startDateTime: "",
    endDateTime: "",
    temperature: 0,
    fireWeight: 0,
    dhoolWeight: 0,
    isBigbulk: 0,
    temperatureUnitID: 0,
    fuelTypeID: 0,
    fuelMeasuringUnitID: 0,
    fuelAmount: 0,
    firedDhoolWeightBy: 0,
    dhoolName: 0
  });

  const [DrierList, setDrierList] = useState({
    manufactureNum: 0,
    drierAmount: 0,
    refuseAmount: 0
  });

  useEffect(() => {
    if (factoryData > 0) {
      getEmployeesForDropdown();
      getFuelTypesForDropdown();
      getEmployeesForForName();
      getFuelTypesForName();
    }
  }, [factoryData]);

  useEffect(() => {
    if (ShoolDetails.manufactureNumber !== 0) (
      getrollingSessionDetails());
  }, [ShoolDetails.manufactureNumber]);

  useEffect(() => {
    if (ShoolDetails.manufactureNumber !== 0) (
      getrollingSessionIDDetails());
  }, [ShoolDetails.dhoolName]);

  useEffect(() => {
    if (ShoolDetails.manufactureNumber !== 0 && ShoolDetails.dhoolName !== '0') (
      getDhoolWeightDetails());
  }, [ShoolDetails.manufactureNumber, ShoolDetails.dhoolName]);

  useEffect(() => {
    getManufactureNumberForDropdown();
  }, [factoryData])

  useEffect(() => {
    GetFiringDetailsToTable();
  }, []);

  async function getEmployeesForDropdown() {
    const employees = await services.getEmployeesForDropdown(groupData, factoryData);
    setEmployees(employees);
  }

  async function getEmployeesForForName() {
    const employees = await services.getEmployeesForDropdown1(groupData, factoryData);
    setEmployeesForName(employees);
  }

  async function getFuelTypesForDropdown() {
    const fuelTypes = await services.getFuelTypesForDropdown(factoryData);
    setFuelTypes(fuelTypes);
  }

  async function getFuelTypesForName() {
    const fuelTypes = await services.getFuelTypesForName(factoryData);
    setFuelTypesForName(fuelTypes);
  }

  // async function getrollingSessionDetails() {
  //   const rollingSessionDetails = await services.GetRollingSessionDetailsToFiringWeb(ShoolDetails.manufactureNumber);
  //   const sortedSessions = rollingSessionDetails.sort(
  //     (a, b) => b.rollingSessionsID - a.rollingSessionsID
  //   );

  //   const updatedSessions = sortedSessions.map((session, index) => {
  //     if (index === 0) {
  //       return { ...session, dhoolName: 'BigBulk' };
  //     } else {
  //       return { ...session, dhoolName: `Dhool${index}` };
  //     }
  //   });
  //   setDhoolList(updatedSessions);
  // }

  async function getrollingSessionIDDetails() {
    const rollingSessionDetails = await services.GetRollingSessionDetailsToFiringWeb(ShoolDetails.manufactureNumber);
    var requiredDhool = rollingSessionDetails.find(x => x.dhoolNameID === parseInt(ShoolDetails.dhoolName))
    setRollingSessionIDDetails(requiredDhool.rollingSessionsID)
  }

  async function getrollingSessionDetails() {
    const dhool = await services.GetDhoolDetailsToFiringWeb(ShoolDetails.manufactureNumber);
    setDhoolList(dhool)
  }

  async function getDhoolWeightDetails() {
    const dhool = await services.GetDhoolWeightToFiringScreenWeb(ShoolDetails.manufactureNumber, ShoolDetails.dhoolName);
    setShoolDetails({
      ...ShoolDetails,
      dhoolWeight: dhool === null ? 0 : dhool.dhoolWeight
    })
  }

  // const handleChangeDhool = (e) => {
  //   const { name, value } = e.target;
  //   if (name === 'dhoolName') {
  //     const selectedDhool = dhoolList.find((item) => item.dhoolName === value);
  //     setSelectedDhoolName(value);
  //     setSelectedDhoolWeight(selectedDhool ? selectedDhool.dhoolWeight : 0);
  //     setRollingSessionIDDetails(selectedDhool ? selectedDhool.rollingSessionsID : 0);
  //   }
  // };

  async function InactiveFieldDetails(rowData, index) {
    const dataDelete = [...ArrayField];
    const remove = index;
    dataDelete.splice(remove, 1);
    setArrayField([...dataDelete]);
  };

  function AddFieldData() {
    const res = ArrayField.find(x => x.manufactureNumber == ShoolDetails.manufactureNumber && x.dhoolName == ShoolDetails.dhoolName)
    if (!res) {
      var array1 = [...ArrayField];
      var array2 = [...arrayNewWareField];
      // var user = employeesForName.find(x => x.employeeID == ShoolDetails.firedDhoolWeightBy).fullName;
      var fuel = fuelTypesForName.find(x => x.fuelTypeID == ShoolDetails.fuelTypeID).fuelName;
      array1.push({
        // firedDhoolWeightByName: user,
        firingID: ShoolDetails.firingID,
        manufactureNumber: ShoolDetails.manufactureNumber,
        startDateTime: ShoolDetails.startDateTime,
        endDateTime: ShoolDetails.endDateTime,
        temperature: ShoolDetails.temperature,
        fireWeight: ShoolDetails.fireWeight,
        dhoolWeight: ShoolDetails.dhoolWeight,
        isBigbulk: ShoolDetails.isBigbulk,
        temperatureUnitID: ShoolDetails.temperatureUnitID,
        fuelTypeID: ShoolDetails.fuelTypeID,
        fuelTypeName: fuel,
        fuelMeasuringUnitID: ShoolDetails.fuelMeasuringUnitID,
        fuelAmount: ShoolDetails.fuelAmount,
        firedDhoolWeightBy: ShoolDetails.firedDhoolWeightBy,
        dhoolName: ShoolDetails.dhoolName,
        rollingSessionID: parseInt(rollingSessionIDDetails)
      });

      array2.push({
        // firedDhoolWeightByName: user,
        firingID: ShoolDetails.firingID,
        manufactureNumber: ShoolDetails.manufactureNumber,
        startDateTime: ShoolDetails.startDateTime,
        endDateTime: ShoolDetails.endDateTime,
        temperature: ShoolDetails.temperature,
        fireWeight: ShoolDetails.fireWeight,
        dhoolWeight: ShoolDetails.dhoolWeight,
        isBigbulk: ShoolDetails.isBigbulk,
        temperatureUnitID: ShoolDetails.temperatureUnitID,
        fuelTypeID: ShoolDetails.fuelTypeID,
        fuelTypeName: fuel,
        fuelMeasuringUnitID: ShoolDetails.fuelMeasuringUnitID,
        fuelAmount: ShoolDetails.fuelAmount,
        firedDhoolWeightBy: ShoolDetails.firedDhoolWeightBy,
        dhoolName: ShoolDetails.dhoolName,
        rollingSessionID: parseInt(rollingSessionIDDetails)
      });

      setArrayField(array1);
      setArrayNewWareField(array2);

      let dataModel = {
        // firedDhoolWeightByName: user,
        firingID: ShoolDetails.firingID,
        manufactureNumber: ShoolDetails.manufactureNumber,
        startDateTime: ShoolDetails.startDateTime,
        endDateTime: ShoolDetails.endDateTime,
        temperature: ShoolDetails.temperature,
        fireWeight: ShoolDetails.fireWeight,
        dhoolWeight: ShoolDetails.dhoolWeight,
        isBigbulk: ShoolDetails.isBigbulk,
        temperatureUnitID: ShoolDetails.temperatureUnitID,
        fuelTypeID: ShoolDetails.fuelTypeID,
        fuelTypeName: fuel,
        fuelMeasuringUnitID: ShoolDetails.fuelMeasuringUnitID,
        fuelAmount: ShoolDetails.fuelAmount,
        firedDhoolWeightBy: ShoolDetails.firedDhoolWeightBy,
        dhoolName: ShoolDetails.dhoolName,
        rollingSessionID: parseInt(rollingSessionIDDetails)
      }

      setFieldDataList(fieldDataList => [...fieldDataList, dataModel]);
      setFieldData({
        firingID: 0,
        manufactureNumber: 0,
        startDateTime: new Date(),
        endDateTime: new Date(),
        temperature: 0,
        fireWeight: 0,
        dhoolWeight: 0,
        isBigbulk: 0,
        temperatureUnitID: 0,
        fuelTypeID: 0,
        fuelMeasuringUnitID: 0,
        fuelAmount: 0,
        firedDhoolWeightBy: 0,
        dhoolName: ""
      });
      clearFormFields();
    }
    else {
      alert.error("Firing Dhool already inserted");
    }
  }

  async function AddDrierData() {
    if (DrierList.manufactureNum < 0) {
      alert.error("Manufacture Number cannot be empty")
    } else {
      let model = {
        manufactureNum: parseInt(DrierList.manufactureNum),
        drierAmount: parseInt(DrierList.drierAmount),
        refuseAmount: parseInt(DrierList.refuseAmount),
        modifiedBy: parseInt(tokenService.getUserIDFromToken())
      }
      const response = await services.SaveRefuseAmountFromFiringWeb(model);
      if (response > 0) {
        alert.success('Drier and Refuse Amounts saved successfully!');
        setDrierList([]);
      }
    }
  }

  async function saveFiering() {
    ArrayField.forEach(x => {
      x.firingID = 0;
      x.batchID = parseInt(x.manufactureNumber);
      x.firingStartTime = x.startDateTime;
      x.firingEndTime = x.endDateTime;
      x.temperature = parseInt(x.temperature);
      x.fireWeight = parseFloat(x.fireWeight);
      x.dhoolWeight = parseFloat(x.dhoolWeight);
      x.isBigbulk = false;
      x.temperatureUnitID = parseInt(x.temperatureUnitID);
      x.fuelTypeID = parseInt(x.fuelTypeID);
      x.fuelMeasuringUnitID = parseInt(x.fuelMeasuringUnitID);
      x.fuelAmount = parseFloat(x.fuelAmount);
      // x.firedDhoolWeightBy = parseInt(x.firedDhoolWeightBy);
      x.dhoolName = x.dhoolName == 1 ? 'Dhool 1' : x.dhoolName == 2 ? 'Dhool 2' : x.dhoolName == 3 ? 'Big Bulk' : "";
      x.createdBy = parseInt(tokenService.getUserIDFromToken());
      x.rollingSessionID = parseInt(x.rollingSessionID)
      delete x.manufactureNumber
      delete x.endDateTime
      delete x.startDateTime
    });
    let response = await services.saveFiering(ArrayField);

    if (response.statusCode === 'Success') {
      alert.success('Firing Saved & Job Updated successfully');
      clearFormFields();
      setArrayField([]);
      GetFiringDetailsToTable();
    } else {
      alert.error('Firing saving Failed!');
      setSuccessData(response.data);
    }
  }

  async function getManufactureNumberForDropdown() {
    const manufactureList = await services.GetManufactureNumberListToFiringWeb(factoryData);
    setManufactureList(manufactureList);
    let manufactureNumberArray = [];
    if (manufactureList.length > 0) {
      for (let item of Object.entries(manufactureList)) {
        if (item[1]["isActive"] === true) {
          manufactureNumberArray[item[1]["batchID"]] = item[1]["jobName"]
        }
      }
    }
    setManufactureNumberList(manufactureNumberArray);
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setShoolDetails({
      ...ShoolDetails,
      [e.target.name]: value
    });
    setDrierList({
      ...DrierList,
      [e.target.name]: value
    })
  }

  function handleChangeDrierList(e) {
    const target = e.target;
    const value = target.value

    setDrierList({
      ...DrierList,
      [e.target.name]: value
    })
  }

  async function clearFormFields() {
    setShoolDetails({
      ...ShoolDetails,
      firingID: 0,
      manufactureNumber: 0,
      startDateTime: new Date(),
      endDateTime: new Date(),
      temperature: 0,
      fireWeight: 0,
      dhoolWeight: 0,
      isBigbulk: 0,
      temperatureUnitID: 0,
      fuelTypeID: 0,
      fuelMeasuringUnitID: 0,
      fuelAmount: 0,
      firedDhoolWeightBy: 0,
      dhoolName: 0
    });
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

  async function confirmCompletion() {
    if (completeDialogbox === true) {
      saveFiering();
      setArrayField([]);
      setShoolDetails([]);
    }
    setCompleteDialogbox(false);
  }

  async function cancelCompletion() {
    setCompleteDialogbox(false);
    alert.error('Job Update Cancelled');
  }

  async function completeFiring() {
    setCompleteDialogbox(true);
  }

  async function GetFiringDetailsToTable() {
    const data = await services.GetFiringDetailsToFiringScreen(tokenService.getFactoryIDFromToken());
    setTableData(data);
  }

  const getTemperatureUnit = (temperatureUnitID) => {
    if (temperatureUnitID === 1)
      return '`C';
    else if (temperatureUnitID === 2)
      return 'K';
    else if (temperatureUnitID === 3)
      return 'F';
    else
      return '';
  };

  const getFuelMeasuringUnit = (fuelMeasuringUnitID) => {
    if (fuelMeasuringUnitID === 1)
      return 'Kg';
    else if (fuelMeasuringUnitID === 2)
      return 'Pa';
    else if (fuelMeasuringUnitID === 3)
      return 'L';
    else if (fuelMeasuringUnitID === 4)
      return 'W';
    else
      return '';
  };
  const style = { backgroundColor: "#000000", width: "9px", height: "9px", marginTop: "5px" };
  const style1 = { backgroundColor: "#88e484", width: "10px", height: "10px", marginTop: "5px" };
  const style2 = { backgroundColor: "#ff8a65", width: "10px", height: "10px", marginTop: "5px" };

  return (
    <>
      <Formik
        initialValues={{
          manufactureNumber: ShoolDetails.manufactureNumber,
          startDateTime: ShoolDetails.startDateTime,
          endDateTime: ShoolDetails.endDateTime,
          temperature: ShoolDetails.temperature,
          fireWeight: ShoolDetails.fireWeight,
          dhoolWeight: ShoolDetails.dhoolWeight,
          isBigbulk: ShoolDetails.isBigbulk,
          temperatureUnitID: ShoolDetails.temperatureUnitID,
          fuelTypeID: ShoolDetails.fuelTypeID,
          fuelMeasuringUnitID: ShoolDetails.fuelMeasuringUnitID,
          fuelAmount: ShoolDetails.fuelAmount,
          firedDhoolWeightBy: ShoolDetails.firedDhoolWeightBy,
          dhoolName: ShoolDetails.dhoolName,
          drierAmount: DrierList.drierAmount,
          manufactureNum: DrierList.manufactureNum,
          refuseAmount: DrierList.refuseAmount
        }}
        validationSchema={
          Yup.object().shape({
            manufactureNumber: Yup.number().required('Manufacture Number is required').min("1", 'Manufacture Number is required'),
            temperature: Yup.number().required('Temperature is required').min("1", 'Temperature is required'),
            fireWeight: Yup.number().required('Fire Weight is required').min("1", 'Fire Weight is required').max(ShoolDetails.dhoolWeight),
            dhoolWeight: Yup.number().required('Dhool Weight is required').min("1", 'Dhool Weight is required'),
            isBigbulk: Yup.number().required('IsBigbulk is required').min("1", 'Is Bigbulk is required'),
            temperatureUnitID: Yup.number().required('Temperature Unit is required').min("1", 'Temperature Unit is required'),
            startDateTime: Yup.string().required('Start Date is required').typeError('Invalid date'),
            endDateTime: Yup.string().required('End Date is required').typeError('Invalid date'),
            // firedDhoolWeightBy: Yup.number().required('Fired Dhool Weight By is required').min("1", 'Fired Dhool Weight By is required'),
            fuelTypeID: Yup.number().required('Fuel Type is required').min("1", 'Fuel Type is required'),
            fuelMeasuringUnitID: Yup.number().required('Fuel Measuring Unit  is required').min("1", 'Fuel Measuring Unit is required'),
            fuelAmount: Yup.number().required('Fuel Amount is required').min("1", 'Fuel Amount is required'),
            dhoolName: Yup.string().required('Dhool Name is required').min("", 'Dhool Name is required'),
          })
        }
        enableReinitialize
      >
        {({
          errors,
          handleBlur,
          handleSubmit,
          touched
        }) => (
          <form onSubmit={handleSubmit}>
            <Box mt={0} paddingBottom={'20px'}>
              <Card>
                <CardHeader title={"Firing"} />
                <PerfectScrollbar>
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="manufactureNumber">
                          Manufacture Number *
                        </InputLabel>
                        <TextField select
                          fullWidth
                          error={Boolean(touched.manufactureNumber && errors.manufactureNumber)}
                          helperText={touched.manufactureNumber && errors.manufactureNumber}
                          name="manufactureNumber"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.manufactureNumber}
                          variant="outlined"
                          id="manufactureNumber"
                          size='small'
                        >
                          <MenuItem value="0">--Select Manufacture Number--</MenuItem>
                          {generateDropDownMenu(manufactureNumberList)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="dhoolName">
                          Dhool Name *
                        </InputLabel>
                        <TextField
                          select
                          fullWidth
                          error={Boolean(touched.dhoolName && errors.dhoolName)}
                          helperText={touched.dhoolName && errors.dhoolName}
                          name="dhoolName"
                          onBlur={handleBlur}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          value={ShoolDetails.dhoolName}
                          variant="outlined"
                          id="dhoolName"
                          size="small"
                        >
                          <MenuItem value="0">--Select Dhool Name--</MenuItem>
                          {generateDropDownMenu(dhoolList)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="dhoolWeight">
                          Dhool Weight *
                        </InputLabel>
                        <TextField
                          fullWidth
                          name="dhoolWeight"
                          variant="outlined"
                          id="dhoolWeight"
                          size="small"
                          value={ShoolDetails.dhoolWeight}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="startDateTime">
                          Start Date & Time *
                        </InputLabel>
                        <TextField
                          fullWidth
                          error={Boolean(touched.startDateTime && errors.startDateTime)}
                          helperText={touched.startDateTime && errors.startDateTime}
                          name="startDateTime"
                          type="datetime-local"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.startDateTime}
                          variant="outlined"
                          id="startDateTime"
                          size='small'
                        >
                        </TextField>
                      </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="endDateTime">
                          End Date & Time *
                        </InputLabel>
                        <TextField
                          fullWidth
                          error={Boolean(touched.endDateTime && errors.endDateTime)}
                          helperText={touched.endDateTime && errors.endDateTime}
                          type="datetime-local"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          name="endDateTime"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.endDateTime}
                          variant="outlined"
                          id="endDateTime"
                          size='small'
                          minDate={ShoolDetails.startDateTime}
                        >
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="fireWeight">
                          Fire Weight *
                        </InputLabel>
                        <TextField
                          error={Boolean(touched.fireWeight && errors.fireWeight)}
                          fullWidth
                          helperText={touched.fireWeight && errors.fireWeight}
                          name="fireWeight"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.fireWeight}
                          variant="outlined"
                          id="fireWeight"
                          size='small'
                          max={ShoolDetails.dhoolWeight}
                        >
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="temperature">
                          Temperature *
                        </InputLabel>
                        <TextField
                          error={Boolean(touched.temperature && errors.temperature)}
                          fullWidth
                          helperText={touched.fireWeight && errors.temperature}
                          name="temperature"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.temperature}
                          variant="outlined"
                          id="temperature"
                          size='small'
                        >
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="temperatureUnitID">
                          Temperature Unit *
                        </InputLabel>
                        <TextField
                          select
                          error={Boolean(touched.temperatureUnitID && errors.temperatureUnitID)}
                          fullWidth
                          helperText={touched.temperatureUnitID && errors.temperatureUnitID}
                          name="temperatureUnitID"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.temperatureUnitID}
                          variant="outlined"
                          id="temperatureUnitID"
                          size='small'
                        >
                          <MenuItem value="0">--Select Temperature Unit--</MenuItem>
                          <MenuItem value="1">C</MenuItem>
                          <MenuItem value="2">K</MenuItem>
                          <MenuItem value="3">F</MenuItem>
                        </TextField>
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
                          value={ShoolDetails.fuelTypeID}
                          variant="outlined"
                          id="fuelTypeID"
                          size='small'
                        >
                          <MenuItem value="0">--Select Fuel Types--</MenuItem>
                          {generateDropDownMenu(fuelTypes)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="fuelAmount">
                          Fuel Quantity *
                        </InputLabel>
                        <TextField
                          error={Boolean(touched.fuelAmount && errors.fuelAmount)}
                          fullWidth
                          helperText={touched.fuelAmount && errors.fuelAmount}
                          name="fuelAmount"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.fuelAmount}
                          variant="outlined"
                          id="fuelAmount"
                          size='small'
                        >
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="fuelMeasuringUnitID">
                          Fuel Measuring Unit *
                        </InputLabel>
                        <TextField select
                          fullWidth
                          error={Boolean(touched.fuelMeasuringUnitID && errors.fuelMeasuringUnitID)}
                          helperText={touched.fuelMeasuringUnitID && errors.fuelMeasuringUnitID}
                          name="fuelMeasuringUnitID"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.fuelMeasuringUnitID}
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
                      {/* <Grid item md={3} xs={8}>
                        <InputLabel shrink id="firedDhoolWeightBy">
                          Fired Dhool Weight By *
                        </InputLabel>
                        <TextField
                          select
                          error={Boolean(touched.firedDhoolWeightBy && errors.firedDhoolWeightBy)}
                          fullWidth
                          helperText={touched.firedDhoolWeightBy && errors.firedDhoolWeightBy}
                          name="firedDhoolWeightBy"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.firedDhoolWeightBy}
                          variant="outlined"
                          id="firedDhoolWeightBy"
                          size='small'
                        >
                          <MenuItem value="0">--Select Employee Number--</MenuItem>
                          {generateDropDownMenu(employees)}
                        </TextField>
                      </Grid> */}
                    </Grid>
                    <br />
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={() => AddFieldData()}
                        type='submit'
                        size='small'
                      >
                        Add
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      {(ArrayField.length > 0) ?
                        <Grid item xs={12}>
                          <TableContainer >
                            <Table
                              aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align='center'>Job Name</TableCell>
                                  <TableCell align='center'>Firing Start Time</TableCell>
                                  <TableCell align='center'>Firing End Time</TableCell>
                                  <TableCell align='center'>Dhool Name</TableCell>
                                  <TableCell align='center'>Dhool Weight</TableCell>
                                  <TableCell align='center'>Fire Weight</TableCell>
                                  <TableCell align='center'>Temperature</TableCell>
                                  <TableCell align='center'>Fuel Type</TableCell>
                                  <TableCell align='center'>Fuel Qty</TableCell>
                                  <TableCell align='center'>Unit</TableCell>
                                  {/* <TableCell align='center'>Fired By</TableCell> */}
                                  <TableCell align='center'>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {ArrayField.map((rowData, index) => (
                                  <TableRow key={index}>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {manufactureList.find(item => parseInt(item.batchID) === parseInt(rowData.manufactureNumber))?.jobName}
                                    </TableCell>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {rowData.startDateTime == undefined ? '-' : (rowData.startDateTime).split('T')[0]}
                                    </TableCell>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {rowData.endDateTime == undefined ? '-' : (rowData.endDateTime).split('T')[0]}
                                    </TableCell>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(rowData.dhoolName == 1 ? 'Dhool 1' : rowData.dhoolName == 2 ? 'Dhool 2' : rowData.dhoolName == 3 ? 'Big Bulk' : "")}
                                    </TableCell>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(rowData.dhoolWeight)}
                                    </TableCell>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(rowData.fireWeight)}
                                    </TableCell>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(rowData.temperature)}
                                    </TableCell>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(rowData.fuelTypeName)}
                                    </TableCell>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(rowData.fuelAmount)}
                                    </TableCell>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(rowData.fuelMeasuringUnitID == 1 ? 'Kg' :
                                        rowData.fuelMeasuringUnitID == 2 ? 'Pa' :
                                          rowData.fuelMeasuringUnitID == 3 ? 'L' :
                                            rowData.fuelMeasuringUnitID == 4 ? 'W' :
                                              rowData.fuelMeasuringUnitID == 5 ? 'Cubic Metre' : "")}
                                    </TableCell>
                                    {/* <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(rowData.firedDhoolWeightByName)}
                                    </TableCell> */}
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
                        </Grid>
                        : null}
                      {(ArrayField.length > 0) ?
                        <Box display="flex" justifyContent="right" p={2} align="right" float="right">
                          <Button
                            color="success"
                            type="submit"
                            variant="contained"
                            size="small"
                            onClick={(event) => trackPromise(completeFiring(event))}
                            style={{ backgroundColor: "#8bc34a", color: 'white' }}
                          >
                            Save Firing
                          </Button>
                        </Box>
                        : null}
                      {completeDialogbox ?
                        <AlertDialogWithoutButton confirmData={confirmCompletion} cancelData={cancelCompletion}
                          IconTitle={"Warning"}
                          headerMessage={"Are you sure you want to Complete Firing?"}
                          discription={"This will update Job has completed Firing"} />
                        : null
                      }
                    </Grid>
                  </CardContent>
                  <br />
                </PerfectScrollbar>
              </Card>
            </Box>
            <Card >
              <CardHeader title={"Drier and Refuse detail"} />
              <PerfectScrollbar>
                <Divider />
                <CardContent>
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="manufactureNum">
                          Manufacture Number *
                        </InputLabel>
                        <TextField select
                          fullWidth
                          error={Boolean(touched.manufactureNum && errors.manufactureNum)}
                          helperText={touched.manufactureNum && errors.manufactureNum}
                          name="manufactureNum"
                          onBlur={handleBlur}
                          onChange={(e) => handleChangeDrierList(e)}
                          value={DrierList.manufactureNum}
                          variant="outlined"
                          id="manufactureNum"
                          size='small'
                        >
                          <MenuItem value="0">--Select Manufacture Number--</MenuItem>
                          {generateDropDownMenu(manufactureNumberList)}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="drierAmount">
                          Drier Amount *
                        </InputLabel>
                        <TextField
                          error={Boolean(touched.drierAmount && errors.drierAmount)}
                          fullWidth
                          helperText={touched.drierAmount && errors.drierAmount}
                          name="drierAmount"
                          onBlur={handleBlur}
                          onChange={(e) => handleChangeDrierList(e)}
                          value={DrierList.drierAmount}
                          variant="outlined"
                          id="drierAmount"
                          size='small'

                        >
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="refuseAmount">
                          Refuse Amount *
                        </InputLabel>
                        <TextField
                          error={Boolean(touched.refuseAmount && errors.refuseAmount)}
                          fullWidth
                          helperText={touched.refuseAmount && errors.refuseAmount}
                          name="refuseAmount"
                          onBlur={handleBlur}
                          onChange={(e) => handleChangeDrierList(e)}
                          value={DrierList.refuseAmount}
                          variant="outlined"
                          id="refuseAmount"
                          size='small'
                        >
                        </TextField>
                      </Grid>
                    </Grid>
                    <br />
                    <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={() => AddDrierData()}
                        size='small'
                      >
                        Add Drier
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </PerfectScrollbar>
            </Card>
          </form>
        )}
      </Formik >
      {tableData.length > 0 ?
        <Box  >
          <PerfectScrollbar>
            <Box display="flex" justifyContent="flex-start" p={5}>
              <div>
                <Grid container>
                  <Grid style={style1}>
                  </Grid>
                  <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                    <b>
                      DW(Kg) - Dhool Weight (Kg)
                    </b>
                  </Grid>
                </Grid>
                <Grid style={{ marginTop: '10px' }} container>
                  <Grid style={style2}>
                  </Grid>
                  <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                    <b>
                      FW(Kg) - Fire Weight (Kg)
                    </b>
                  </Grid>
                </Grid>
              </div>
              <div>
                <Grid container style={{ marginLeft: '15px' }}>
                  <Grid style={style}>
                  </Grid>
                  <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                    <b>
                      FST - Firing Start Time
                    </b>
                  </Grid>
                </Grid>
                <Grid style={{ marginTop: '10px', marginLeft: '15px' }} container>
                  <Grid style={style}>
                  </Grid>
                  <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                    <b>
                      FET - Firing End Time
                    </b>
                  </Grid>
                </Grid>
              </div>
            </Box>
            <MaterialTable
              title="Multiple Actions Preview"
              columns={[
                { title: 'Job Name', field: 'jobName' },
                {
                  title: 'FST', field: 'firingStartTime',
                  render: rowData => moment(rowData.firingStartTime).format("YYYY-MM-DD hh:mm:ss")
                },
                {
                  title: 'FET', field: 'firingEndTime',
                  render: rowData => moment(rowData.firingEndTime).format("YYYY-MM-DD hh:mm:ss")
                },
                { title: 'Dhool', field: 'dhoolName' },
                {
                  title: 'DW(Kg)', field: 'dhoolWeight'
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
                  title: 'FW(Kg)', field: 'fireWeight'
                  , headerStyle: {
                    backgroundColor: "#d6dc5d",
                    border: '2px solid #1c1c1c'
                  },
                  cellStyle: {
                    backgroundColor: "#ff8a65",
                    border: '2px solid #1c1c1c'
                  }
                },
                {
                  title: 'Temperature', field: 'temperature',
                  render: rowData => `${rowData.temperature}${getTemperatureUnit(rowData.temperatureUnitID)}`
                },
                { title: 'Fuel', field: 'fuelName' },
                {
                  title: 'Qty', field: 'fuelAmount',
                  render: rowData => `${rowData.fuelAmount}${getFuelMeasuringUnit(rowData.fuelMeasuringUnitID)}`
                },
                // { title: 'Done By', field: 'empName' }
              ]}
              data={tableData}
              components={{
                Header: props => {
                  return (
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Job Name</TableCell>
                        <TableCell align="center" width={250} style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>FST</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>FET</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Dhool</TableCell>
                        <TableCell align="center" width={250} style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>DW(Kg)</TableCell>
                        <TableCell align="center" width={250} style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>FW(Kg)</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Temperature</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Fuel</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Qty</TableCell>
                        {/* <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Done By</TableCell> */}
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
          </PerfectScrollbar>
        </Box >
        : null
      }
    </>
  )
}

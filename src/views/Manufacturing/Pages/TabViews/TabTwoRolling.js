import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import MaterialTable from "material-table";
import { AlertDialogWithoutButton } from '../../../Common/AlertDialogWithoutButton';
import tokenService from '../../../../utils/tokenDecoder';
import DeleteIcon from '@material-ui/icons/Delete';
import moment from 'moment';

export default function Rolling({ groupData, factoryData }) {
  const [completeDialogbox, setCompleteDialogbox] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [successData, setSuccessData] = useState([]);
  const [manufactureNumberList, setManufactureNumberList] = useState([]);
  const [rollingLineList, setRollingLineList] = useState([]);
  const [selectedDhoolWeight, setSelectedDhoolWeight] = useState(0);
  const [ShoolDetails, setShoolDetails] = useState({
    rollingWeightBy: "0",
    rollingStartTime: "",
    rollingEndDate: "",
    rollingPeriod: 0,
    isBigBulk: 0,
    restWeight: 0,
    manufactureNumber: "0",
    rollingID: "0",
    dhoolWeight: 0,
    dhoolName: "0",
    rollingLineID: "",
    doolNameID: "0"
  });
  const [rollerLineDetails, setRollerLineDetails] = useState({});
  const alert = useAlert();
  const [employees, setEmployees] = useState([]);
  const [employees1, setEmployees1] = useState([]);
  const [manufactureListWithDhool, setManufactureListWithDhool] = useState([]);
  const [rollerList, setRollerList] = useState([]);
  const [restWeightValue, setRestWeightValue] = useState(0);
  const [ArrayField, setArrayField] = useState([]);
  const [arrayNewWareField, setArrayNewWareField] = useState([]);
  const [fieldDataList, setFieldDataList] = useState([]);
  const [fieldData, setFieldData] = useState({
    rollingWeightBy: 0,
    rollingStartTime: new Date(),
    rollingEndDate: new Date(),
    rollingPeriod: 0,
    isBigBulk: 0,
    restWeight: 0,
    manufactureNumber: "0",
    rollingID: 0,
    dhoolWeight: 0,
    dhoolName: "0",
    rollingLineID: 0
  });

  useEffect(() => {
    trackPromise(
      getEmployeesForDropdown());
    getEmployeesForDropdown1();
  }, [groupData, factoryData]);

  useEffect(() => {
    getManufactureNumberForDropdown();
  }, []);

  useEffect(() => {
    getRollerListForDropdown();
  }, [ShoolDetails.manufactureNumber, factoryData]);

  useEffect(() => {
    GetRollingSessionDetailsToTable()
  }, []);

  async function getEmployeesForDropdown() {
    const employees = await services.getEmployeesForDropdown(groupData, factoryData);
    setEmployees(employees);
  }

  async function getEmployeesForDropdown1() {
    const employees1 = await services.getEmployeesForDropdown1(groupData, factoryData);
    setEmployees1(employees1);
  }

  async function confirmCompletion() {
    if (completeDialogbox === true) {
      saveRolling();
    }
    setFieldData([]);
    setShoolDetails([]);
    clearFormFields();
    setRestWeightValue(0);
    setSelectedDhoolWeight(0);
    setRollerLineDetails({
      iDOfRollingLine: 0,
      nameOfRolingLine: 0
    })
    setCompleteDialogbox(false);
  }

  async function cancelCompletion() {
    setCompleteDialogbox(false);
    alert.error('Job Update Cancelled');
  }

  async function completeRolling() {
    setCompleteDialogbox(true);
  }

  async function getRollerListForDropdown() {
    const rollerList = await services.GetRollingsToRollingDropdownInRollingScreen(ShoolDetails.manufactureNumber, factoryData);
    setRollerList(rollerList);
    let rollerListArray = [];
    if (rollerList.length > 0) {

      for (let item of Object.entries(rollerList)) {
        if (item[1]["isActive"] === true) {
          rollerListArray[item[1]["rollingLineID"]] = item[1]["rolingLineName"]
        }
      }
    }
    if (rollerList.length > 0) {
      setRollerLineDetails({
        iDOfRollingLine: rollerList[0].idRollingLineID,
        nameOfRolingLine: rollerList[0].rolingLine
      })
      setRollingLineList(rollerListArray);
    }
  }

  async function saveRolling() {
    ArrayField.forEach(x => {
      //x.rollingWeightBy = x.rollingWeightBy
      x.startTime = x.rollingStartTime;
      x.endTime = x.rollingEndDate;
      x.isBigBulk = false
      x.noOfDays = parseInt(x.rollingPeriod)
      x.restWeight = parseFloat(x.restWeight)
      x.batchID = parseInt(x.manufactureNumber)
      x.rollID = parseInt(x.rollingID)
      x.dhoolWeight = parseFloat(x.dhoolWeight)
      x.rollingLineID = parseInt(x.rollingLineID)
      x.createdBy = parseInt(tokenService.getUserIDFromToken())
      x.doolNameID = parseInt(x.doolNameID)
      delete x.rollingStartTime
      delete x.rollingEndDate
      delete x.rollingPeriod
      delete x.manufactureNumber
      delete x.rollingID
      delete x.dhoolName
    });
    let response = await services.saveRolling(ArrayField);
    if (response.statusCode === 'Success') {

      alert.success('Rollings Saved & Job Updated successfully');
      clearFormFields();
      setArrayField([]);
      trackPromise(GetRollingSessionDetailsToTable());
    } else {
      alert.error('Rolling saving Failed!');
      setSuccessData(response.data);
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setShoolDetails({
      ...ShoolDetails,
      [e.target.name]: value
    });
  }

  async function clearFormFields() {
    setShoolDetails({
      ...ShoolDetails,
      rollingWeightBy: 0,
      rollingStartTime: new Date(),
      rollingEndDate: new Date(),
      rollingPeriod: 0,
      isBigBulk: 0,
      restWeight: 0,
      manufactureNumber: "0",
      rollingID: 0,
      dhoolWeight: 0,
      dhoolName: "0",
      doolNameID: '0',
      rollingLineID: 0,

    });
    setRestWeightValue(0);
    setSelectedDhoolWeight(0);
    setRollerLineDetails({});
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

  async function getManufactureNumberForDropdown() {
    const manufactureList = await services.GetManufactureNumberListToRollingWeb(factoryData);
    let manufactureNumberArray = [];
    if (manufactureList.length > 0) {
      for (let item of Object.entries(manufactureList)) {
        if (item[1]["isActive"] === true) {
          manufactureNumberArray[item[1]["batchID"]] = item[1]["jobName"]
        }
      }
    }
    setManufactureNumberList(manufactureNumberArray);
    setManufactureListWithDhool(manufactureList);
  }

  async function GetRollingSessionDetailsToTable() {
    const data = await services.GetRollingSessionDetailsToRollingScreen(tokenService.getFactoryIDFromToken());
    setTableData(data);
  }

  const handleChangeManuNum = (e) => {
    const { name, value } = e.target;
    const selectedDhool = manufactureListWithDhool.find((item) => item.batchID === parseInt(value));
    setSelectedDhoolWeight(selectedDhool ? selectedDhool.greenLeafQuantity : 0);
  };

  const handleChangeRestWeight = (e) => {
    let newVal;
    const { name, value } = e.target;
    const newArray = ArrayField.filter(x => x.manufactureNumber == ShoolDetails.manufactureNumber)
    const newValue = newArray.reduce((acc, obj) => obj.restWeight, 0);
    if (newValue > 0) {
      newVal = newValue - value;
    } else {
      newVal = selectedDhoolWeight - newValue - value;
    }
    setRestWeightValue(newVal);
  }

  async function InactiveFieldDetails(rowData, index) {
    const dataDelete = [...ArrayField];
    const remove = index;
    dataDelete.splice(remove, 1);
    setArrayField([...dataDelete]);
  };

  function AddFieldData() {
    const res = ArrayField.find(x => x.manufactureNumber == ShoolDetails.manufactureNumber && x.rollingID == ShoolDetails.rollingID)
    if (!res) {
      var array1 = [...ArrayField];
      var array2 = [...arrayNewWareField];
      // var user = employees1.find(x => x.employeeID == ShoolDetails.rollingWeightBy).fullName
      array1.push({
        // rollingByName: user,
        // rollingWeightBy: ShoolDetails.rollingWeightBy,
        rollingStartTime: ShoolDetails.rollingStartTime,
        rollingEndDate: ShoolDetails.rollingEndDate,
        isBigBulk: ShoolDetails.isBigBulk,
        rollingPeriod: ShoolDetails.rollingPeriod,
        restWeight: restWeightValue,
        manufactureNumber: ShoolDetails.manufactureNumber,
        rollingID: ShoolDetails.rollingID,
        dhoolWeight: ShoolDetails.dhoolWeight,
        dhoolName: ShoolDetails.dhoolName,
        rollingLineID: rollerLineDetails.iDOfRollingLine,
        doolNameID: ShoolDetails.doolNameID,
        dhoolName: ShoolDetails.doolNameID == 1 ? 'Dhool 1' : ShoolDetails.doolNameID == 2 ? 'Dhool 2' : ShoolDetails.doolNameID == 3 ? 'Big Bulk' : ''
      });

      array2.push({
        // rollingByName: user,
        // rollingWeightBy: ShoolDetails.rollingWeightBy,
        rollingStartTime: ShoolDetails.rollingStartTime,
        rollingEndDate: ShoolDetails.rollingEndDate,
        isBigBulk: ShoolDetails.isBigBulk,
        rollingPeriod: ShoolDetails.rollingPeriod,
        restWeight: restWeightValue,
        manufactureNumber: ShoolDetails.manufactureNumber,
        rollingID: ShoolDetails.rollingID,
        dhoolWeight: ShoolDetails.dhoolWeight,
        dhoolName: ShoolDetails.dhoolName,
        rollingLineID: rollerLineDetails.iDOfRollingLine,
        doolNameID: ShoolDetails.doolNameID,
        dhoolName: ShoolDetails.doolNameID == 1 ? 'Dhool 1' : ShoolDetails.doolNameID == 2 ? 'Dhool 2' : ShoolDetails.doolNameID == 3 ? 'Big Bulk' : ''
      });

      setArrayField(array1);
      setArrayNewWareField(array2);

      let dataModel = {
        // rollingByName: user,
        // rollingWeightBy: ShoolDetails.rollingWeightBy,
        rollingStartTime: ShoolDetails.rollingStartTime,
        rollingEndDate: ShoolDetails.rollingEndDate,
        isBigBulk: ShoolDetails.isBigBulk,
        rollingPeriod: ShoolDetails.rollingPeriod,
        restWeight: restWeightValue,
        manufactureNumber: ShoolDetails.manufactureNumber,
        rollingID: ShoolDetails.rollingID,
        dhoolWeight: ShoolDetails.dhoolWeight,
        dhoolName: ShoolDetails.dhoolName,
        rollingLineID: rollerLineDetails.iDOfRollingLine,
        doolNameID: ShoolDetails.doolNameID,
        dhoolName: ShoolDetails.doolNameID == 1 ? 'Dhool 1' : ShoolDetails.doolNameID == 2 ? 'Dhool 2' : ShoolDetails.doolNameID == 3 ? 'Big Bulk' : ''
      }

      setFieldDataList(fieldDataList => [...fieldDataList, dataModel]);
      setFieldData({
        rollingWeightBy: 0,
        rollingStartTime: new Date(),
        rollingEndDate: new Date(),
        rollingPeriod: 0,
        isBigBulk: 0,
        restWeight: 0,
        manufactureNumber: "0",
        rollingID: 0,
        dhoolWeight: 0,
        dhoolName: "0",
        rollingLineID: 0,
        doolNameID: "0"
      });
      // clearFormFields();
      setRestWeightValue(0);
      //setSelectedDhoolWeight(0);
      // setRollerLineDetails({
      //   iDOfRollingLine: 0,
      //   nameOfRolingLine: 0
      // })
    }
    else {
      alert.error("Rolling weight already inserted");
    }
  }

  const style1 = { backgroundColor: "#88e484", width: "10px", height: "10px", marginTop: "5px" };
  const style2 = { backgroundColor: "#ffccbc", width: "10px", height: "10px", marginTop: "5px" };

  return (
    <Formik
      initialValues={{
        rollingStartTime: ShoolDetails.rollingStartTime,
        rollingEndDate: ShoolDetails.rollingEndDate,
        rollingPeriod: ShoolDetails.rollingPeriod,
        rollingWeightBy: ShoolDetails.rollingWeightBy,
        manufactureNumber: ShoolDetails.manufactureNumber,
        restWeight: ShoolDetails.restWeight,
        dhoolWeight: ShoolDetails.dhoolWeight,
        rollingID: ShoolDetails.rollingID,
        isBigBulk: ShoolDetails.isBigBulk,
        dhoolName: ShoolDetails.dhoolName,
        rollingLineID: ShoolDetails.rollingLineID,
        doolNameID: ShoolDetails.doolNameID
      }}
      validationSchema={
        Yup.object().shape({
          rollingStartTime: Yup.string().required('Rolling Start Date is required'),
          rollingEndDate: Yup.string().required('Rolling End Date is required'),
          rollingPeriod: Yup.number().required('Rolling Period is required').min("1", 'Rolling Period is required'),
          // rollingWeightBy: Yup.number().required('Rolling Weight By is required').min("1", 'Rolling Weight By is required'),
          dhoolWeight: Yup.number().required('Dhool Weight is required').min(0.1, 'Dhool Weight is required'),
          manufactureNumber: Yup.number().required('Manufacture Number is required').min("1", 'Manufacture Number is required'),
          rollingID: Yup.number().required('Rolling is required').min("1", 'Rolling is required'),
          dhoolName: Yup.string().required('Dhool Name is required').min("1", 'Dhool Name is required'),
          isBigBulk: Yup.number().required('IsBigBulk is required').min("1", 'IsBigBulk is required'),
          doolNameID: Yup.number().required('Dhool Name is required').min("1", 'Dhool Name is required'),
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
          <Box mt={0}>
            <Card>
              <CardHeader title={"Rolling"} />
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
                      onChange={(e) => {
                        handleChange(e);
                        handleChangeManuNum(e);
                      }}
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
                    <InputLabel shrink id="witheredLeafAmount">
                      Withered Leaf(KG) *
                    </InputLabel>
                    <TextField
                      fullWidth
                      name="witheredLeafAmount"
                      variant="outlined"
                      id="witheredLeafAmount"
                      size="small"
                      value={selectedDhoolWeight}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item md={3} xs={8}>
                    <InputLabel shrink id="rollingLineID">
                      Rolling Line
                    </InputLabel>
                    <TextField
                      fullWidth
                      name="rollingLineID"
                      onBlur={handleBlur}
                      onChange={(e) => handleChange(e)}
                      value={rollerLineDetails.nameOfRolingLine}
                      variant="outlined"
                      id="rollingLineID"
                      size='small'
                      InputProps={{
                        readOnly: true
                      }}
                    >
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={8}>
                    <InputLabel shrink id="rollingID">
                      Rollers *
                    </InputLabel>
                    <TextField
                      select
                      error={Boolean(touched.rollingID && errors.rollingID)}
                      fullWidth
                      helperText={touched.rollingID && errors.rollingID}
                      name="rollingID"
                      onBlur={handleBlur}
                      onChange={(e) => handleChange(e)}
                      value={ShoolDetails.rollingID}
                      variant="outlined"
                      id="rollingID"
                      size='small'
                    >
                      <MenuItem value="0">--Select Rolling--</MenuItem>
                      {generateDropDownMenu(rollingLineList)}
                    </TextField>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item md={3} xs={8}>
                    <InputLabel shrink id="doolNameID">
                      Dhool Name *
                    </InputLabel>
                    <TextField
                      select
                      error={Boolean(touched.doolNameID && errors.doolNameID)}
                      fullWidth
                      helperText={touched.doolNameID && errors.doolNameID}
                      name="doolNameID"
                      onBlur={handleBlur}
                      onChange={(e) => handleChange(e)}
                      value={ShoolDetails.doolNameID}
                      variant="outlined"
                      id="doolNameID"
                      size='small'
                    >
                      <MenuItem value="0">--Select Dhool Name--</MenuItem>
                      <MenuItem value="1">Dhool 1</MenuItem>
                      <MenuItem value="2">Dhool 2</MenuItem>
                      <MenuItem value="3">Big Bulk</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={8}>
                    <InputLabel shrink id="dhoolWeight">
                      Dhool Weight (KG)*
                    </InputLabel>
                    <TextField
                      error={Boolean(touched.dhoolWeight && errors.dhoolWeight)}
                      fullWidth
                      helperText={touched.dhoolWeight && errors.dhoolWeight}
                      name="dhoolWeight"
                      type='number'
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        handleChangeRestWeight(e);
                      }}
                      size='small'
                      value={ShoolDetails.dhoolWeight}
                      variant="outlined"
                      id="dhoolWeight"
                    >
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={8}>
                    <InputLabel shrink id="restWeight">
                      Rest Weight (KG)*
                    </InputLabel>
                    <TextField
                      fullWidth
                      name="restWeight"
                      type='number'
                      onBlur={handleBlur}
                      onChange={(e) => handleChange(e)}
                      size='small'
                      value={restWeightValue}
                      variant="outlined"
                      id="restWeight"
                    >
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={8}>
                    <InputLabel shrink id="rollingStartTime">
                      Start Date & Time *
                    </InputLabel>
                    <TextField
                      fullWidth
                      error={Boolean(touched.rollingStartTime && errors.rollingStartTime)}
                      helperText={touched.rollingStartTime && errors.rollingStartTime}
                      name="rollingStartTime"
                      type="datetime-local"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onBlur={handleBlur}
                      onChange={(e) => handleChange(e)}
                      value={ShoolDetails.rollingStartTime}
                      variant="outlined"
                      id="rollingStartTime"
                      size='small'
                    >
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={8}>
                    <InputLabel shrink id="rollingEndDate">
                      End Date & Time *
                    </InputLabel>
                    <TextField
                      fullWidth
                      error={Boolean(touched.rollingEndDate && errors.rollingEndDate)}
                      helperText={touched.rollingEndDate && errors.rollingEndDate}
                      type="datetime-local"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      name="rollingEndDate"
                      onBlur={handleBlur}
                      onChange={(e) => handleChange(e)}
                      value={ShoolDetails.rollingEndDate}
                      variant="outlined"
                      id="rollingEndDate"
                      size='small'
                    >
                    </TextField>
                  </Grid>
                  {/* <Grid item md={3} xs={8}>
                    <InputLabel shrink id="rollingWeightBy">
                      Rolling Weigh By *
                    </InputLabel>
                    <TextField select
                      fullWidth
                      error={Boolean(touched.rollingWeightBy && errors.rollingWeightBy)}
                      helperText={touched.rollingWeightBy && errors.rollingWeightBy}
                      name="rollingWeightBy"
                      onBlur={handleBlur}
                      onChange={(e) => handleChange(e)}
                      value={ShoolDetails.rollingWeightBy}
                      variant="outlined"
                      id="rollingWeightBy"
                      size='small'
                    >
                      <MenuItem value="0">--Select Rolling Weigh By--</MenuItem>
                      {generateDropDownMenu(employees)}
                    </TextField>
                  </Grid> */}
                </Grid>
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
                              <TableCell align='center'>Rolling Start Time</TableCell>
                              <TableCell align='center'>Rolling End Time</TableCell>
                              <TableCell align='center'>Dhool Name</TableCell>
                              <TableCell align='center'>Dhool Weight</TableCell>
                              <TableCell align='center'>Rest Weight</TableCell>
                              {/* <TableCell align='center'>Rolling Weight By</TableCell> */}
                              <TableCell align='center'>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {ArrayField.map((rowData, index) => (
                              <TableRow key={index}>
                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                  {manufactureListWithDhool.find(item => parseInt(item.batchID) === parseInt(rowData.manufactureNumber))?.jobName}
                                </TableCell>
                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                  {rowData.rollingStartTime == undefined ? '-' : (rowData.rollingStartTime).split('T')[0]}
                                </TableCell>
                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                  {rowData.rollingEndDate == undefined ? '-' : (rowData.rollingEndDate).split('T')[0]}
                                </TableCell>
                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                  {(rowData.dhoolName)}
                                </TableCell>
                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                  {(rowData.dhoolWeight)}
                                </TableCell>
                                <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                  {(rowData.restWeight)}
                                </TableCell>
                                {/* <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                  {(rowData.rollingByName)}
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
                    </Grid> : null}
                  {(ArrayField.length > 0) ?
                    <Box display="flex" justifyContent="right" p={2} align="right" float="right">
                      <Button
                        color="success"
                        type="submit"
                        variant="contained"
                        size="small"
                        onClick={(event) => trackPromise(completeRolling(event))}
                        style={{ backgroundColor: "#8bc34a", color: 'white' }}
                      >
                        Save Rolling
                      </Button>
                    </Box>
                    : null}
                  {completeDialogbox ?
                    <AlertDialogWithoutButton confirmData={confirmCompletion} cancelData={cancelCompletion}
                      IconTitle={"Warning"}
                      headerMessage={"Are you sure you want to Save Rolling?"}
                      discription={"This will update Job has Save Rolling"} />
                    : null
                  }
                </Grid>
                <Grid>
                  {tableData.length > 0 ?
                    <>
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
                                RW - Rest Weight (Kg)
                              </b>
                            </Grid>
                          </Grid>
                        </div>
                      </Box>
                      <PerfectScrollbar>
                        <Box minWidth={1050} mt={5}>
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              {
                                title: 'Job Name', field: 'jobName'
                              },
                              { title: 'Roling Line', field: 'rolingLineName' },
                              { title: 'Roll', field: 'rollName' },
                              {
                                title: 'Rolling Start Date & Time', field: 'startTime',
                                render: (field) => (
                                  moment(field.startTime).format('YYYY-MM-DD HH:mm:ss')
                                ),
                              },
                              {
                                title: 'GLQ(Kg)', field: 'dhoolWeight'
                                , headerStyle: {
                                  border: '2px solid #1c1c1c'
                                },
                                cellStyle: {
                                  backgroundColor: "#c8ebcb",
                                  border: '2px solid #1c1c1c'
                                }
                              },
                              {
                                title: 'RW(Kg)', field: 'restWeight'
                                , headerStyle: {
                                  border: '2px solid #1c1c1c'
                                },
                                cellStyle: {
                                  backgroundColor: "#ffccbc",
                                  border: '2px solid #1c1c1c'
                                }
                              },
                              // { title: 'Done By', field: 'empName' }
                            ]}
                            data={tableData}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", border: '2px solid #1c1c1c' },
                              cellStyle: { textAlign: "left", border: '2px solid #1c1c1c' },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              search: false
                            }}
                          />
                        </Box>
                      </PerfectScrollbar>
                    </>
                    : null}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </form>
      )}
    </Formik >
  )
}

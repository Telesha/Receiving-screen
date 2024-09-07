import React, { useState, useEffect, } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, makeStyles, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import { AlertDialogWithoutButton } from '../../../Common/AlertDialogWithoutButton';
import { AgriGenERPEnum } from '../../../Common/AgriGenERPEnum/AgriGenERPEnum';
import tokenDecoder from '../../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import tokenService from '../../../../utils/tokenDecoder';
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
  },
  row: {
    marginTop: '1rem'
  }
}));

export default function Grading({ groupData, factoryData }) {

  const agriGenERPEnum = new AgriGenERPEnum()
  const [employees, setEmployees] = useState([]);
  const [GradingDetails, setGradingDetails] = useState({
    firingID: 0,
    manufactureNumber: 0,
    dhoolName: "0",
    dhoolWeight: 0,
    gradingAmount: 0,
    gradeCategoryID: 0,
    gradeID: 0,
    gradeBy: 0
  });
  const [offGradeList, setOffGradeList] = useState([]);
  const [mainGradeList, setMainGradeList] = useState([]);
  const [allGradesList, setAllGradesList] = useState([]);
  const [completeDialogbox, setCompleteDialogbox] = useState(false);
  const [manufactureNumberList, setManufactureNumberList] = useState([]);
  const [elementfiringID, setElementfiringID] = useState("");
  const [selectedDhoolName, setSelectedDhoolName] = useState("");
  const [selectedDhoolWeight, setSelectedDhoolWeight] = useState(0);
  const [selectedFiringWeight, setSelectedFiringWeight] = useState(0);
  const [firngList, setFiringList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [ArrayField, setArrayField] = useState([]);
  const [arrayNewWareField, setArrayNewWareField] = useState([]);
  const [employeesForName, setEmployeesForName] = useState([]);
  const [fieldDataList, setFieldDataList] = useState([]);
  const [fieldData, setFieldData] = useState({
    firingID: 0,
    manufactureNumber: 0,
    dhoolName: "0",
    dhoolWeight: 0,
    gradingAmount: 0,
    gradeCategoryID: 0,
    gradeID: 0,
    gradeBy: 0
  });

  const [DrierList, setDrierList] = useState({
    manufactureNum: 0,
    refuseAmount: 0
  });
  const [manufactureList, setManufactureList] = useState([]);
  const alert = useAlert();

  useEffect(() => {
    trackPromise(
      getEmployeesForDropdown(),
      getEmployeesForForName()
    );
  }, [groupData, factoryData]);

  useEffect(() => {
    GetGradingDetailsToGradingDropdown();
  }, [factoryData]);

  useEffect(() => {
    getManufactureNumberForDropdown();
  }, [factoryData])

  useEffect(() => {
    if (GradingDetails.manufactureNumber > 0) {
      GetFiringDetailsToGrading()
    }
  }, [GradingDetails.manufactureNumber])

  useEffect(() => {
    GetGradingDetailsToTable();
  }, []);

  async function getManufactureNumberForDropdown() {
    const manufactureList = await services.GetManufactureNumberListToGradingWeb(factoryData);
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

  async function GetFiringDetailsToGrading() {
    const grades = await services.GetFiringDetailsToGradingWeb(GradingDetails.manufactureNumber);
    setFiringList(grades);
  }

  async function getEmployeesForDropdown() {
    const employees = await services.getEmployeesForDropdown(groupData, factoryData);
    setEmployees(employees);
  }

  async function getEmployeesForForName() {
    const employees = await services.getEmployeesForDropdown1(groupData, factoryData);
    setEmployeesForName(employees);
  }

  async function GetGradingDetailsToGradingDropdown() {
    const gradeData = await services.GetGradingDetailsToGradingWeb(factoryData);
    let MainGradeArray = [];
    let OffGradeArray = [];
    gradeData.forEach(x => {
      if (x.gradeCategoryID == agriGenERPEnum.Gradecategories.MainGrade) {
        MainGradeArray.push(x);
      } else {
        OffGradeArray.push(x);
      }
    });
    setMainGradeList(MainGradeArray);
    setOffGradeList(OffGradeArray);
    setAllGradesList(gradeData);
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setGradingDetails({
      ...GradingDetails,
      [e.target.name]: value
    });
  }

  function handleChangeGrade(e) {
    const target = e.target;
    const value = target.value
    setGradingDetails({
      ...GradingDetails,
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
    return items;
  }

  const handleChangeDhool = (e) => {
    const { name, value } = e.target;
    if (name === 'dhoolName') {
      const selectedDhool = firngList.find((item) => item.dhoolName === value);
      setSelectedDhoolName(value);
      setSelectedDhoolWeight(selectedDhool ? selectedDhool.dhoolWeight : 0);
      setSelectedFiringWeight(selectedDhool ? selectedDhool.fireWeight : 0);
      setElementfiringID(selectedDhool ? selectedDhool.firingID : 0)
    }
  };

  async function clearFormFields() {
    setGradingDetails({
      ...GradingDetails,
      firingID: 0,
      manufactureNumber: 0,
      dhoolName: 0,
      dhoolWeight: 0,
      gradingAmount: 0,
      gradeCategoryID: 0,
      gradeID: 0,
      gradeBy: 0
    });
  }

  async function confirmCompletion() {
    if (completeDialogbox === true) {
      saveGrading();
    }
    else {
      alert.error('Job  Not Updated!');
    }
    setCompleteDialogbox(false);
  }

  async function cancelCompletion() {
    setCompleteDialogbox(false);
    alert.error('Job Update Cancelled');
  }

  async function completeGrading() {
    setCompleteDialogbox(true);
  }

  async function AddDrierData() {
    if (DrierList.manufactureNum <= 0) {
      alert.error("Manufacture Number cannot be empty")
    } else {
      let model = {
        manufactureNum: parseInt(DrierList.manufactureNum),
        refuseAmount: parseInt(DrierList.refuseAmount),
        modifiedBy: parseInt(tokenService.getUserIDFromToken())
      }
      const response = await services.SaveRefuseAmountFromGradingWeb(model);
      if (response > 0) {
        alert.success('Refuse Amounts saved successfully!');
        setDrierList([]);
      }
    }
  }

  async function saveGrading() {
    ArrayField.forEach(x => {
      x.weightGradingID = 0
      x.manufactureNumber = parseInt(x.manufactureNumber);
      x.firingID = parseInt(x.firingID);
      x.gradingWeight = parseFloat(x.gradingWeight);
      x.grade = parseInt(x.grade);
      x.restWeight = parseFloat(x.restWeight);
      x.dhoolName = x.dhool;
      x.gradeCategoryID = parseInt(x.gradeCategoryID);
      // x.gradeBy = parseInt(x.gradeBy);
      x.createdBy = tokenDecoder.getUserIDFromToken();
    });
    let response = await services.SaveGradingFromGradingWeb(ArrayField);
    if (response > 0) {
      alert.success('Gradings Saved & Job Updated successfully');
      clearFormFields();
      setArrayField([]);
      GetGradingDetailsToTable();
    } else {
      alert.error('Grading saving Failed!');
    }
  }

  async function InactiveFieldDetails(rowData, index) {
    const dataDelete = [...ArrayField];
    const remove = index;
    dataDelete.splice(remove, 1);
    setArrayField([...dataDelete]);
  };

  function AddFieldData() {
    const res = ArrayField.find(x => x.manufactureNumber == GradingDetails.manufactureNumber && x.firingID == GradingDetails.firingID)
    if (!res) {
      var array1 = [...ArrayField];
      var array2 = [...arrayNewWareField];
      //var user = employeesForName.find(x => x.employeeID == GradingDetails.gradeBy).fullName;
      var grade = allGradesList.find(x => x.gradeID === GradingDetails.gradeID).gradeName
      array1.push({
        manufactureNumber: GradingDetails.manufactureNumber,
        firingID: elementfiringID,
        gradingWeight: parseFloat(GradingDetails.gradingAmount),
        grade: GradingDetails.gradeID,
        restWeight: parseFloat(selectedFiringWeight - GradingDetails.gradingAmount),
        dhool: GradingDetails.dhoolName,
        gradeCategoryID: parseInt(GradingDetails.gradeCategoryID),
        gradeBy: parseInt(GradingDetails.gradeBy),
        //gradeByName: user
        gradeName: grade
      });

      array2.push({
        manufactureNumber: GradingDetails.manufactureNumber,
        firingID: elementfiringID,
        gradingWeight: parseFloat(GradingDetails.gradingAmount),
        grade: GradingDetails.gradeID,
        restWeight: parseFloat(selectedFiringWeight - GradingDetails.gradingAmount),
        dhool: GradingDetails.dhoolName,
        gradeCategoryID: parseInt(GradingDetails.gradeCategoryID),
        gradeBy: parseInt(GradingDetails.gradeBy),
        //gradeByName: user
        gradeName: grade
      });

      setArrayField(array1);
      setArrayNewWareField(array2);

      let dataModel = {
        manufactureNumber: GradingDetails.manufactureNumber,
        firingID: elementfiringID,
        gradingWeight: parseFloat(GradingDetails.gradingAmount),
        grade: GradingDetails.gradeID,
        restWeight: parseFloat(selectedFiringWeight - GradingDetails.gradingAmount),
        dhool: GradingDetails.dhoolName,
        gradeCategoryID: parseInt(GradingDetails.gradeCategoryID),
        gradeBy: parseInt(GradingDetails.gradeBy),
        //sgradeByName: user
        gradeName: grade
      }

      setFieldDataList(fieldDataList => [...fieldDataList, dataModel]);
      setFieldData({
        firingID: 0,
        manufactureNumber: 0,
        dhoolName: "0",
        dhoolWeight: 0,
        gradingAmount: 0,
        gradeCategoryID: 0,
        gradeID: 0,
        gradeBy: 0
      });
      clearFormFields();
    }
    else {
      alert.error("Rolling weight already inserted");
    }
  }

  async function GetGradingDetailsToTable() {
    const data = await services.GetGradingDetailsToGradingScreen(tokenService.getFactoryIDFromToken());
    setTableData(data);
  }

  function handleChangeDrierList(e) {
    const target = e.target;
    const value = target.value

    setDrierList({
      ...DrierList,
      [e.target.name]: value
    })
  }

  const style = { backgroundColor: "#000000", width: "9px", height: "9px", marginTop: "5px" };
  const style1 = { backgroundColor: "#88e484", width: "10px", height: "10px", marginTop: "5px" };
  const style2 = { backgroundColor: "#d6dc5d", width: "10px", height: "10px", marginTop: "5px" };

  return (
    <>
      <Formik
        initialValues={{
          manufactureNumber: GradingDetails.manufactureNumber,
          dhoolName: GradingDetails.dhoolName,
          dhoolWeight: GradingDetails.dhoolWeight,
          gradingAmount: GradingDetails.gradingAmount,
          gradeCategoryID: GradingDetails.gradeCategoryID,
          gradeID: GradingDetails.gradeID,
          gradeBy: GradingDetails.gradeBy
        }}
        validationSchema={
          Yup.object().shape({
            manufactureNumber: Yup.number().required('Manufacture Number is required').min("1", 'Manufacture Number is required'),
            dhoolName: Yup.string().required('Dhool Name is required').min(1, 'Dhool Name is required'),
            dhoolWeight: Yup.number().required('Dhool Weight is required').min("1", 'Dhool Weight is required'),
            gradingAmount: Yup.number().required('Grading Amount is required').min("1", 'Grading Amount is required').max(selectedFiringWeight),
            gradeCategoryID: Yup.number().required('Grade Category is required').min("1", 'Grade Category is required'),
            gradeID: Yup.number().required('Grade is required').min("1", 'Grade is required'),
            // gradeBy: Yup.number().required('Grade By is required').min("1", 'Grade By is required')
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
                <CardHeader title={"Grading"} />
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
                          value={GradingDetails.manufactureNumber}
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
                            handleChangeDhool(e);
                            handleChange(e);
                          }}
                          value={GradingDetails.dhoolName}
                          variant="outlined"
                          id="dhoolName"
                          size="small"
                        >
                          <MenuItem value="0">--Select Dhool Name--</MenuItem>
                          {firngList.map((item) => (
                            <MenuItem key={item.firingID} value={item.dhoolName}>
                              {item.dhoolName}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="dhoolWeight">
                          Dhool Weight (KG)
                        </InputLabel>
                        <TextField
                          fullWidth
                          name="dhoolWeight"
                          variant="outlined"
                          id="dhoolWeight"
                          size="small"
                          value={selectedDhoolWeight}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="dhoolWeight">
                          Firing Weight (KG)
                        </InputLabel>
                        <TextField
                          fullWidth
                          name="dhoolWeight"
                          variant="outlined"
                          id="dhoolWeight"
                          size="small"
                          value={selectedFiringWeight}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="gradeCategoryID">
                          Grade Category *
                        </InputLabel>
                        <TextField select
                          fullWidth
                          error={Boolean(touched.gradeCategoryID && errors.gradeCategoryID)}
                          helperText={touched.gradeCategoryID && errors.gradeCategoryID}
                          name="gradeCategoryID"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={GradingDetails.gradeCategoryID}
                          size='small'
                          variant="outlined"
                          id="gradeCategoryID"
                        >
                          <MenuItem value="0">--Select Grade Category--</MenuItem>
                          <MenuItem value="1">Main Grade</MenuItem>
                          <MenuItem value="2">Off Grade</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item md={3} xs={12}>
                        <InputLabel shrink id="gradeID">
                          Grade *
                        </InputLabel>
                        <TextField
                          select
                          fullWidth
                          error={Boolean(touched.gradeID && errors.gradeID)}
                          helperText={touched.gradeID && errors.gradeID}
                          name="gradeID"
                          onChange={(e) => handleChangeGrade(e)}
                          value={GradingDetails.gradeID}
                          variant="outlined"
                          size='small'
                          id="gradeID"
                        >
                          <MenuItem value="0">--Select Grade--</MenuItem>
                          {GradingDetails.gradeCategoryID == 1 ?
                            mainGradeList.map((item) =>
                              <MenuItem key={item.gradeID} value={item.gradeID}>
                                {item.gradeName}
                              </MenuItem>
                            ) :
                            offGradeList.map((item) =>
                              <MenuItem key={item.gradeID} value={item.gradeID}>
                                {item.gradeName}
                              </MenuItem>
                            )}
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="gradingAmount">
                          Grading Amount (KG) *
                        </InputLabel>
                        <TextField
                          error={Boolean(touched.gradingAmount && errors.gradingAmount)}
                          fullWidth
                          helperText={touched.gradingAmount && errors.gradingAmount}
                          name="gradingAmount"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={GradingDetails.gradingAmount}
                          size='small'
                          variant="outlined"
                          max={selectedFiringWeight}
                          id="gradingAmount"
                        >
                        </TextField>
                      </Grid>
                      {/* <Grid item md={3} xs={8}>
                        <InputLabel shrink id="gradeBy">
                          Grade By *
                        </InputLabel>
                        <TextField select
                          fullWidth
                          error={Boolean(touched.gradeBy && errors.gradeBy)}
                          helperText={touched.gradeBy && errors.gradeBy}
                          name="gradeBy"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={GradingDetails.gradeBy}
                          size='small'
                          variant="outlined"
                          id="gradeBy"
                        >
                          <MenuItem value="0">--Select Grading By--</MenuItem>
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
                                  <TableCell align='center'>Dhool Name</TableCell>
                                  <TableCell align='center'>Grading Amount</TableCell>
                                  <TableCell align='center'>Grade Category</TableCell>
                                  <TableCell align='center'>Grade</TableCell>
                                  {/* <TableCell align='center'>Grade By</TableCell> */}
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
                                      {rowData.dhool}
                                    </TableCell>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(rowData.gradingWeight)}
                                    </TableCell>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(rowData.gradeCategoryID === 1 ? "Main" : "Off")}
                                    </TableCell>
                                    <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(rowData.gradeName)}
                                    </TableCell>
                                    {/* <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {(rowData.gradeByName)}
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
                            onClick={(event) => trackPromise(completeGrading(event))}
                            style={{ backgroundColor: "#8bc34a", color: 'white' }}
                          >
                            Complete Grading
                          </Button>
                        </Box>
                        : null}
                      {completeDialogbox ?
                        <AlertDialogWithoutButton confirmData={confirmCompletion} cancelData={cancelCompletion}
                          IconTitle={"Warning"}
                          headerMessage={"Are you sure you want to Complete Grading?"}
                          discription={"This will update Job has completed Grading"} />
                        : null
                      }
                      <br />
                      {tableData.length > 0 ?
                        <Box  >
                          <Card >
                            <CardHeader title={"Refuse details"} />
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
                                      Add Refuse
                                    </Button>
                                  </Box>
                                </Box>
                              </CardContent>
                            </PerfectScrollbar>
                          </Card>
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
                                      GW(Kg) - Grading Weight (Kg)
                                    </b>
                                  </Grid>
                                </Grid>
                              </div>
                              <div>
                                <Grid style={{ marginLeft: '15px' }} container>
                                  <Grid style={style}>
                                  </Grid>
                                  <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                                    <b>
                                      RW(Kg) - Rest Weight (Kg)
                                    </b>
                                  </Grid>
                                </Grid>
                                <Grid style={{ marginTop: '10px', marginLeft: '15px' }} container>
                                  <Grid style={style}>
                                  </Grid>
                                  <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                                    <b>
                                      GC - Grade Category
                                    </b>
                                  </Grid>
                                </Grid>
                              </div>
                            </Box>
                            <MaterialTable
                              title="Multiple Actions Preview"
                              columns={[
                                { title: 'Job Name', field: 'jobName' },
                                { title: 'Dhool', field: 'dhoolName' },
                                {
                                  title: 'FW(Kg)', field: 'fireWeight'
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
                                  title: 'GW(Kg)', field: 'gradingWeight'
                                  , headerStyle: {
                                    backgroundColor: "#d6dc5d",
                                    border: '2px solid #1c1c1c'
                                  },
                                  cellStyle: {
                                    backgroundColor: "#e7eb9e",
                                    border: '2px solid #1c1c1c'
                                  }
                                },
                                {
                                  title: 'GC', field: 'gradeCategoryID',
                                  render: rowData => {
                                    if (rowData.gradeCategoryID == 1)
                                      return "Main Grade"
                                    else return "Off Grade"
                                  }
                                },
                                {
                                  title: 'Grade', field: 'gradeName'
                                  , headerStyle: {
                                    backgroundColor: "#ec6c6a",
                                    border: '2px solid #1c1c1c'
                                  },
                                  cellStyle: {
                                    backgroundColor: "#90caf9",
                                    border: '2px solid #1c1c1c'
                                  }
                                },
                                { title: 'RW(Kg)', field: 'restWeight' },
                                // { title: 'Done By', field: 'empName' }
                              ]}
                              data={tableData}
                              components={{
                                Header: props => {
                                  return (
                                    <TableHead>
                                      <TableRow>
                                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Job Name</TableCell>
                                        <TableCell align="center" width={250} style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Dhool</TableCell>
                                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>FW(Kg)</TableCell>
                                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>GW(Kg)</TableCell>
                                        <TableCell align="center" width={250} style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>GC</TableCell>
                                        <TableCell align="center" width={250} style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Grade</TableCell>
                                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>RW(Kg)</TableCell>
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
                    </Grid>
                  </CardContent>
                </PerfectScrollbar>
              </Card>
            </Box>
          </form>
        )}
      </Formik >
    </>
  )
}

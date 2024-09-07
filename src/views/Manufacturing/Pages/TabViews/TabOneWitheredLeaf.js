import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Button, Card, CardHeader, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, TableCell, TableHead, TableRow } from '@material-ui/core';
import services from '../../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import moment from 'moment';
import MaterialTable from "material-table";
import tokenService from '../../../../utils/tokenDecoder';

export default function WitheredLeaf({
  groupData, factoryData
}) {

  const [ShoolDetails, setShoolDetails] = useState({
    startDate: "",
    endDate: "",
    //witheredLeafAmount: '',
    witheredLeafWeightBy: 0,
    witheringCondition: 0,
    manufactureNumber: 0,
    witheredLeafAmount: 0
  });
  const [employees, setEmployees] = useState([]);
  const [manufactureNumberList, setManufactureNumberList] = useState([]);
  const [selectedDhoolWeight, setSelectedDhoolWeight] = useState(0);
  const [successData, setSuccessData] = useState([]);
  const alert = useAlert();
  const [tableData, setTableData] = useState([]);
  const [manufactureListWithDhool, setManufactureListWithDhool] = useState([]);

  useEffect(() => {
    trackPromise(
      getEmployeesForDropdown());
    getManufactureNumberForDropdown();
  }, [groupData, factoryData]);

  useEffect(() => {
    GetWitheringDetailsToTable();
  }, []);

  async function getManufactureNumberForDropdown() {
    const manufactureList = await services.GetManufactureNumberListToWitheringWeb(factoryData);

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

  const handleChangeManuNum = (e) => {
    const { name, value } = e.target;
    const selectedDhool = manufactureListWithDhool.find((item) => item.batchID === parseInt(value));
    setSelectedDhoolWeight(selectedDhool ? selectedDhool.greenLeafQuantity : 0);
  };

  async function getEmployeesForDropdown() {
    const employees = await services.getEmployeesForDropdown(groupData, factoryData);
    setEmployees(employees);
  }
  async function saveWitheredLeaf() {
    let dhoolModel = {
      manufactureNumber: ShoolDetails.manufactureNumber,
      startDate: moment(ShoolDetails.startDate).format("YYYY-MM-DDTHH:mm:ss.SSS"),
      endDate: moment(ShoolDetails.endDate).format("YYYY-MM-DDTHH:mm:ss.SSS"),
      //witheredLeafAmount: parseFloat(selectedDhoolWeight),
      witheredLeafWeightBy: parseInt(ShoolDetails.witheredLeafWeightBy),
      witheringCondition: parseInt(ShoolDetails.witheringCondition),
      witheredLeafAmount: parseInt(ShoolDetails.witheredLeafAmount)
    };

    let response = await services.saveWithtredLeaf(dhoolModel);
    if (response.statusCode == "Success") {
      alert.success("Withering Saved Successfully!");
      clearFormFields();
      setSuccessData(response.data);
      GetWitheringDetailsToTable();
    }
    else {
      alert.error(response.message);
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
      startDate: new Date(),
      endDate: new Date(),
      witheredLeafAmount: 0,
      witheredLeafWeightBy: 0,
      witheringCondition: 0,
      manufactureNumber: 0,
      witheredLeafAmount: 0
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

  async function GetWitheringDetailsToTable() {
    const data = await services.GetWitheringDetailsToWitheringScreen(tokenService.getFactoryIDFromToken());
    setTableData(data);
  }

  const style1 = { backgroundColor: "#88e484", width: "10px", height: "10px", marginTop: "5px" };
  const style2 = { backgroundColor: "#b2dfdb", width: "10px", height: "10px", marginTop: "5px" };

  return (
    <>
      <Formik
        initialValues={{
          startDate: ShoolDetails.startDate,
          endDate: ShoolDetails.endDate,
          witheredLeafWeightBy: ShoolDetails.witheredLeafWeightBy,
          witheringCondition: ShoolDetails.witheringCondition,
          manufactureNumber: ShoolDetails.manufactureNumber,
          witheredLeafAmount: ShoolDetails.witheredLeafAmount
        }}
        validationSchema={
          Yup.object().shape({
            startDate: Yup.string().required('Start Date is required').typeError('Invalid date'),
            endDate: Yup.string().required('End Date is required').typeError('Invalid date'),
            manufactureNumber: Yup.number().required('Manufacture Number is required').min("1", 'Manufacture Number is required'),
            //witheredLeafWeightBy: Yup.number().required('Withered Leaf Weight By is required').min("1", 'Withered Leaf Weight By is required'),
            witheringCondition: Yup.number().required('Withering Condition is required').min("1", 'Withering Condition is required'),
            witheredLeafAmount: Yup.number().required('Withered Leaf is required').min("1", 'Withered Leaf is required')
          })
        }
        enableReinitialize
        onSubmit={(event) => trackPromise(saveWitheredLeaf(event))}
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
                <CardHeader title={"Withered Leaf"} />
                <PerfectScrollbar>
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="manufactureNumber">
                          Manufacture Number *
                        </InputLabel>
                        <TextField select
                          error={Boolean(touched.manufactureNumber && errors.manufactureNumber)}
                          fullWidth
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
                        <InputLabel shrink id="startDate">
                          Start Date & Time *
                        </InputLabel>
                        <TextField
                          fullWidth
                          name="startDate"
                          type="datetime-local"
                          error={Boolean(touched.startDate && errors.startDate)}
                          helperText={touched.startDate && errors.startDate}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.startDate}
                          variant="outlined"
                          id="startDate"
                          size='small'
                        >
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="endDate">
                          End Date & Time *
                        </InputLabel>
                        <TextField
                          fullWidth
                          type="datetime-local"
                          error={Boolean(touched.endDate && errors.endDate)}
                          helperText={touched.endDate && errors.endDate}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          name="endDate"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.endDate}
                          min={ShoolDetails.startDate}
                          variant="outlined"
                          id="endDate"
                          size='small'
                        >
                        </TextField>
                      </Grid>
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="witheredLeafAmount">
                          Withered Leaf(KG)
                        </InputLabel>
                        <TextField
                          fullWidth
                          name="witheredLeafAmount"
                          variant="outlined"
                          id="witheredLeafAmount"
                          size="small"
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.witheredLeafAmount}
                        // InputProps={{
                        //   readOnly: true,
                        // }}
                        />
                      </Grid>
                      {/* <Grid item md={3} xs={8}>
                        <InputLabel shrink id="witheredLeafWeightBy">
                          Withered Leaf Weight By *
                        </InputLabel>
                        <TextField select
                          fullWidth
                          name="witheredLeafWeightBy"
                          error={Boolean(touched.witheredLeafWeightBy && errors.witheredLeafWeightBy)}
                          helperText={touched.witheredLeafWeightBy && errors.witheredLeafWeightBy}
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.witheredLeafWeightBy}
                          variant="outlined"
                          id="witheredLeafWeightBy"
                          size='small'
                        >
                          <MenuItem value="0">--Select Weight By--</MenuItem>
                          {generateDropDownMenu(employees)}
                        </TextField>
                      </Grid> */}
                      <Grid item md={3} xs={8}>
                        <InputLabel shrink id="witheringCondition">
                          Withering Condition *
                        </InputLabel>
                        <TextField select
                          fullWidth
                          error={Boolean(touched.witheringCondition && errors.witheringCondition)}
                          helperText={touched.witheringCondition && errors.witheringCondition}
                          name="witheringCondition"
                          onBlur={handleBlur}
                          onChange={(e) => handleChange(e)}
                          value={ShoolDetails.witheringCondition}
                          // disabled={disableFields}
                          variant="outlined"
                          id="witheringCondition"
                          size='small'
                        >
                          <MenuItem value="0">--Select Withering Condition--</MenuItem>
                          <MenuItem value="1">Soft</MenuItem>
                          <MenuItem value="2">Medium</MenuItem>
                          <MenuItem value="3">Hard</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                    <Box display="flex" flexDirection="row-reverse" p={2} >
                      <Button
                        color="primary"
                        variant="contained"
                        type='submit'
                        size='small'
                      >
                        Save Withering
                      </Button>
                    </Box>
                  </CardContent>
                </PerfectScrollbar>
              </Card>
            </Box>
          </form>
        )}
      </Formik>
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
                      GLQ - Green Leaf Quantity (Kg)
                    </b>
                  </Grid>
                </Grid>
                <Grid style={{ marginTop: '10px' }} container>
                  <Grid style={style2}>
                  </Grid>
                  <Grid style={{ marginLeft: '15px', marginRight: '10px' }}>
                    <b>
                      WLQ - Withered Leaf Quantity (Kg)
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
                  title: 'WLQ(Kg)', field: 'witheredLeafAmount'
                  , headerStyle: {
                    backgroundColor: "#b2dfdb",
                    border: '2px solid #1c1c1c'
                  },
                  cellStyle: {
                    backgroundColor: "#b2dfdb",
                    border: '2px solid #1c1c1c'
                  }
                },
                {
                  title: 'Withering Condition', field: 'witheringCondition',
                  render: rowData => {
                    if (rowData.witheringCondition == 1)
                      return "Soft"
                    else if (rowData.witheringCondition == 2)
                      return "Medium"
                    else return "Hard"
                  }
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
                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>GLQ(Kg)</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>WLQ(Kg)</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold", border: '2px solid #1c1c1c' }}>Withering Condition</TableCell>
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

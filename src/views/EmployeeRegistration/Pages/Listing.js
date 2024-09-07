import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  Divider,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  InputLabel,
  CardHeader,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { Formik } from 'formik';
import { useAlert } from 'react-alert';
import moment from 'moment';
import xlsx from 'json-as-xlsx';

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
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = "EMPLOYEEREGISTRATION";

export default function EmployeeListing() {
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [divisions, setDivisions] = useState();
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [isTableHide, setIsTableHide] = useState(false);
  const [employeeCategories, setEmployeeCategories] = useState([]);
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [employeeList, setEmployeeList] = useState({
    groupID: '0',
    factoryID: '0',
    divisionID: '0',
    employeeTypeID: '0',
    employeeCategoryID: '0',
    statusID: '2'
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    factoryName: "0",
    groupName: "0",
    divisionName: "0",
    employeeTypeName: "0",
    employeeCategorieName: "0",
    designationName: "0",
    StatusName: ''
  })

  const [employeeData, setEmployeeData] = useState([]);
  const navigate = useNavigate();
  let encryptedID = "";

  const handleClick = () => {
    encryptedID = btoa('0');
    navigate('/app/EmployeeRegistration/addedit/' + encryptedID);
  }

  const EditEmployeeDetails = (employeeID) => {
    encryptedID = btoa(employeeID.toString());
    navigate('/app/EmployeeRegistration/addedit/' + encryptedID);
  }
  const alert = useAlert();

  useEffect(() => {
    trackPromise(
      getPermission()
    );
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropDown(),
    )
  }, [employeeList.groupID]);

  useEffect(() => {
    if (employeeList.factoryID > 0) {
      trackPromise(
        getDivisionsForDropDown(employeeList.factoryID),
      )
    }
  }, [employeeList.factoryID]);

  useEffect(() => {
    trackPromise(
      getEmployeeCategoriesForDropdown(),
    )
  }, [employeeList.employeeCategoryID]);

  useEffect(() => {
    setIsTableHide(false);
  }, [employeeList.divisionID, employeeList.employeeTypeID, employeeList.employeeCategoryID, employeeList.statusID]);

  useEffect(() => {
    setEmployeeList({
      ...employeeList,
      employeeTypeID: '0',
      statusID: '2'
    })
  }, [employeeList.divisionID]);

  useEffect(() => {
    setEmployeeList({
      ...employeeList,
      statusID: '2'
    })
  }, [employeeList.employeeTypeID]);

  useEffect(() => {
    setIsTableHide(false)
  }, [employeeList.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWEMPLOYEEREGISTRATION');

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

    setEmployeeList({
      ...employeeList,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });

    trackPromise(getGroupsForDropdown())
    trackPromise(getEmployeeTypesForDropdown());
    trackPromise(getEmployeeCategoriesForDropdown());
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(employeeList.groupID);
    setFactories(factory);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getDivisionsForDropDown(factoryID) {
    const divisions = await services.getDivisionDetailsByEstateID(factoryID);
    setDivisions(divisions);
  }

  async function getEmployeeTypesForDropdown() {
    const result = await services.GetEmployeeTypesData();
    setEmployeeTypes(result);
  }

  async function getEmployeeCategoriesForDropdown() {
    const employeeCategories = await services.GetEmployeeCategoriesData();
    setEmployeeCategories(employeeCategories);
  }

  async function GetEmployeeDetailsByFactoryIDGroupID() {
    let model = {
      operationEntityID: parseInt(employeeList.factoryID),
      groupID: parseInt(employeeList.groupID),
      divisionID: parseInt(employeeList.divisionID),
      employeeTypeID: parseInt(employeeList.employeeTypeID),
      EmployeeCategoryID: parseInt(employeeList.employeeCategoryID),
      statusID: parseInt(employeeList.statusID)
    }
    getSelectedDropdownValuesForReport(model);

    const result = await services.getEmployeeDetailsByFactoryIDGroupID(model);
    if (result.data.length > 0 && result.statusCode == 'Success') {
      setEmployeeData(result.data);
      setIsTableHide(true);
    } else {
      alert.error("No records to display");
    }
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var dateOfBirthFormatted = moment(x.dateOfBirth).format('D/M/YYYY')
        var joiningDateFromatted = moment(x.joiningDate).format('DD/MM/YYYY')
        var vr = {
          'EmployeeType': x.employeeTypeName,
          'EmployeeCategory': x.employeeCategoryName,
          'RegistrationNumber': x.registrationNumber,
          'Title': x.genderID == 1 ? 'Mr' : 'Mrs',
          'FirstName': x.firstName,
          'Gender': x.genderID == 1 ? 'Male' : 'Female',
          'DateOfBirth': dateOfBirthFormatted,
          'JoiningDate': joiningDateFromatted,
          'EpfNo': x.epfNumber,
          'Nic': x.nicNumber,
          'MobileNumber': x.mobileNumber,
          'Designation': x.designationName,
          'Religion': x.religion,
          'EmployeeCode': x.employeeCode,
          'EmployeeSubCategory': x.employeeSubCategoryName,
          'Union': x.unionName,
          'isBCardStatus': x.isBCardStatus == 1 ? 'yes' : 'no',
          'Status': x.isActive == 1 ? 'Active' : 'Inactive'
        }
        res.push(vr);
      });

      res.push({});
      var vr = {
        'EmployeeType': "Group: " + selectedSearchValues.groupName,
        'RegistrationNumber': "Estate: " + selectedSearchValues.factoryName,
        'FirstName': "Division: " + selectedSearchValues.divisionName,
      }
      res.push(vr);

      var vr1 = {
        'EmployeeType': "EmployeeType: " + (selectedSearchValues.employeeTypeName == undefined ? 'All' : selectedSearchValues.employeeTypeName),
        'RegistrationNumber': "EmployeeCategory: " + (selectedSearchValues.employeeCategorieName == undefined ? 'All' : selectedSearchValues.employeeCategorieName),
        'FirstName': "Status: " + (selectedSearchValues.StatusName == 1 ? 'Active' : selectedSearchValues.StatusName == 0 ? 'Inactive' : 'All')
      }
      res.push(vr1);
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(employeeData);
    var settings = {
      sheetName: 'Employee Registration Report',
      fileName: 'Employee Registration Report',
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Employee Registration Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setEmployeeList({
      ...employeeList,
      [e.target.name]: value
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
            isEdit={true}
            toolTiptitle={"Add Employee"}
          />
        </Grid>
      </Grid>
    )
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: factories[searchForm.operationEntityID],
      groupName: groups[searchForm.groupID],
      divisionName: divisions[searchForm.divisionID],
      employeeTypeName: employeeTypes[searchForm.employeeTypeID],
      employeeCategorieName: employeeCategories[searchForm.EmployeeCategoryID],
      StatusName: employeeList.statusID
    })
  }

  return (
    <Page
      className={classes.root}
      title="Employee"
    >
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: employeeList.groupID,
            factoryID: employeeList.factoryID,
            divisionID: employeeList.divisionID,
            employeeTypeID: employeeList.employeeTypeID,
            statusID: employeeList.statusID,
          }}
          enableReinitialize
        >
          {({
            errors,
            handleSubmit,
            touched,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box mt={0}>
                <Card>
                  <CardHeader
                    title={cardTitle("Employee")}
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent style={{ marginBottom: "2rem" }}>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group   *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            name="groupID"
                            onChange={(e) => handleChange(e)}
                            value={employeeList.groupID}
                            variant="outlined"
                            InputProps={{
                              readOnly: !permissionList.isGroupFilterEnabled,
                            }}
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryID">
                            Estate *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            name="factoryID"
                            onChange={(e) => handleChange(e)}
                            value={employeeList.factoryID}
                            variant="outlined"
                            id="factoryID"
                            InputProps={{
                              readOnly: !permissionList.isFactoryFilterEnabled,
                            }}
                          >
                            <MenuItem value="0">--Select Factory--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="divisionID">
                            Division
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            id="divisionID"
                            name="divisionID"
                            value={employeeList.divisionID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChange(e)}
                          >
                            <MenuItem value='0'>--Select Division--</MenuItem>
                            {generateDropDownMenu(divisions)}
                          </TextField>
                        </Grid>
                      </Grid>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeTypeID">
                            Employee Type
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            id="employeeTypeID"
                            name="employeeTypeID"
                            value={employeeList.employeeTypeID}
                            variant="outlined"
                            onChange={(e) => handleChange(e)}
                          >
                            <MenuItem value="0">--Select Employee Type--</MenuItem>
                            {generateDropDownMenu(employeeTypes)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="employeeCategoryID">
                            Employee Category
                          </InputLabel>
                          <TextField select fullWidth
                            error={Boolean(touched.employeeCategoryID && errors.employeeCategoryID)}
                            helperText={touched.employeeCategoryID && errors.employeeCategoryID}
                            size='small'
                            id="employeeCategoryID"
                            name="employeeCategoryID"
                            value={employeeList.employeeCategoryID}
                            type="text"
                            variant="outlined"
                            onChange={(e) => handleChange(e)}
                          >
                            <MenuItem value="0">--Select Employee Category--</MenuItem>
                            {generateDropDownMenu(employeeCategories)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="statusID">
                            Status
                          </InputLabel>
                          <TextField select
                            fullWidth
                            name="statusID"
                            size='small'
                            onChange={(e) => {
                              handleChange(e)
                            }}
                            value={employeeList.statusID}
                            variant="outlined"
                            id="statusID"
                          >
                            <MenuItem value={'2'}>--Select Status--</MenuItem>
                            <MenuItem value={'1'}>Active</MenuItem>
                            <MenuItem value={'0'}>InActive</MenuItem>
                          </TextField>
                        </Grid>
                      </Grid>

                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"
                          onClick={() => trackPromise(GetEmployeeDetailsByFactoryIDGroupID())}
                        >
                          Search
                        </Button>
                      </Box>
                    </CardContent>
                    {isTableHide ?
                      <Box minWidth={1000}>
                        <MaterialTable
                          title="Multiple Actions Preview"
                          columns={[
                            { title: 'Employee Code', field: 'employeeCode' },
                            { title: 'Employee Name', field: 'employeeName' },
                            { title: ' Employee Number', field: 'registrationNumber' },
                            { title: 'Employee NIC', field: 'nicNumber' },
                            { title: 'Employee Type', field: 'employeeTypeName' },
                            { title: 'Designation', field: 'designationName' },
                            {
                              title: 'Status', field: 'isActive',
                              render: rowData => {
                                if (rowData.isActive) {
                                  return "Active"
                                } else {
                                  return "Inactive"
                                }
                              }
                            }
                          ]}
                          data={employeeData}
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
                              icon: 'edit',
                              tooltip: 'Edit Employee',
                              onClick: (event, employeeData) => EditEmployeeDetails(employeeData.employeeID)
                            }
                          ]}
                        />
                      </Box>
                      : null}

                    {isTableHide ?

                      <Box display="flex" justifyContent="flex-end" p={2}>

                        <Button
                          color="primary"
                          id="btnRecord"
                          type="submit"
                          variant="contained"
                          style={{ marginRight: '1rem' }}
                          className={classes.colorRecord}
                          onClick={() => createFile()}
                          size="small"
                        >
                          EXCEL
                        </Button>

                      </Box>

                      : null}
                  </PerfectScrollbar>
                </Card>
              </Box>
            </form>
          )}
        </Formik>
      </Container>
    </Page>
  );
};


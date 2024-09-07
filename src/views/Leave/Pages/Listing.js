import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, Button, CardContent, Divider, MenuItem, Grid, InputLabel, TextField } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";


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

const screenCode = 'LEAVE';
export default function LeaveListing() {
  const classes = useStyles();
  const [employeeLeaveDetailsData, setEmployeeLeaveDetailsData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [isHideField, setIsHideField] = useState(true);

  const [employeeLeaveDetails, setEmployeeLeaveDetails] = useState({
    groupID: '0',
    factoryID: '0',
    regNo: ''
  })

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/leave/addEdit/' + encrypted);
  }

  const handleClickEdit = (employeeLeaveDetailsID) => {
    encrypted = btoa(employeeLeaveDetailsID.toString());
    navigate('/app/leave/addEdit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const alert = useAlert();

  useEffect(() => {
    trackPromise(getPermissions(), getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (employeeLeaveDetails.groupID > 0) {
      trackPromise(getFactoriesForDropdown());
    }
  }, [employeeLeaveDetails.groupID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLEAVE');

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

    setEmployeeLeaveDetails({
      ...employeeLeaveDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(employeeLeaveDetails.groupID);
    setFactories(factories);
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

  async function getEmployeeLeaveDetails() {
    const EmployeeLeaveDetails = await services.GetEmployeeLeaveDetailsByGroupFactoryRegistrationNo(employeeLeaveDetails.groupID, employeeLeaveDetails.factoryID, employeeLeaveDetails.regNo);
    if (EmployeeLeaveDetails.statusCode == 'Success') {
      setEmployeeLeaveDetailsData(EmployeeLeaveDetails.data);
      setIsHideField(false);
    }
    else {
      setIsHideField(true);
      alert.error("No records to display");
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setEmployeeLeaveDetails({
      ...employeeLeaveDetails,
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
            toolTiptitle={"Add Leave Details"}
          />
        </Grid>
      </Grid>
    )
  }

  return (

    <Page
      className={classes.root}
      title="Leaves"
    >
      <LoadingComponent />
      <Container maxWidth={false}>

        <Formik
          initialValues={{
            groupID: employeeLeaveDetails.groupID,
            factoryID: employeeLeaveDetails.factoryID,
            regNo: employeeLeaveDetails.regNo,
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
              factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
              regNo: Yup.string().required('Registration Number is required'),
            })
          }
          onSubmit={() => trackPromise(getEmployeeLeaveDetails())}
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
                  <CardHeader
                    title={cardTitle("Leaves")}
                  />
                  <PerfectScrollbar>
                    <Divider />
                    <CardContent style={{ marginBottom: "2rem" }}>
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
                            onChange={(e) => handleChange(e)}
                            value={employeeLeaveDetails.groupID}
                            variant="outlined"
                            disabled={!permissionList.isGroupFilterEnabled}
                            size='small'
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
                            error={Boolean(touched.factoryID && errors.factoryID)}
                            fullWidth
                            helperText={touched.factoryID && errors.factoryID}
                            name="factoryID"
                            onChange={(e) => handleChange(e)}
                            value={employeeLeaveDetails.factoryID}
                            variant="outlined"
                            disabled={!permissionList.isFactoryFilterEnabled}
                            size='small'
                          >
                            <MenuItem value="0">--Select Estate--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="regNo">
                            Reg No *
                          </InputLabel>
                          <TextField
                            error={Boolean(touched.regNo && errors.regNo)}
                            fullWidth
                            helperText={touched.regNo && errors.regNo}
                            name="regNo"
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e)}
                            value={employeeLeaveDetails.regNo}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                      </Grid>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="submit"
                          variant="contained"

                        >
                          Search
                        </Button>
                      </Box>
                    </CardContent>
                    <Box minWidth={1050}
                      hidden={isHideField}
                    >

                      <MaterialTable
                        title="Employee Leave Details"
                        columns={[
                          { title: 'Employee Name', field: 'employeeName' },
                          { title: 'Leave type Name', field: 'employeeLeaveTypeName' },
                          { title: 'Total Leave Count', field: 'allocatedDays' },
                          { title: 'Remaining Leaves', field: 'remainingDays' }
                        ]}
                        data={employeeLeaveDetailsData}
                        options={{
                          exportButton: false,
                          showTitle: true,
                          headerStyle: { textAlign: "left", height: '1%' },
                          cellStyle: { textAlign: "left" },
                          columnResizable: false,
                          actionsColumnIndex: -1
                        }}
                        actions={[
                          {
                            icon: 'mode',
                            tooltip: 'Edit Leave Details',
                            onClick: (event, rowData) => { handleClickEdit(rowData.employeeLeaveDetailsID) }
                          },
                        ]}
                      />
                    </Box>
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

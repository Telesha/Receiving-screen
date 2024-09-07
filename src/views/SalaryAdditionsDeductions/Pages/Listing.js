import React, { useState, useEffect, createContext, Fragment } from 'react';
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
import {
  startOfMonth,
  endOfMonth,
  addMonths
} from 'date-fns';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";


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

const screenCode = 'SALARYADDITIONDEDUCTION';
export default function SalaryAdditionsDeductionsListing() {
  const classes = useStyles();
  const [salaryAditionsDeductionData, setSalaryAditionsDeductionDetailsData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [isHideField, setIsHideField] = useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [ItemCategoryList, setItemCategoryList] = useState();
  const [employeeSalaryAdditionsDeductions, setEmployeeSalaryAdditionsDeductions] = useState({
    groupID: '0',
    factoryID: '0',
    date: new Date()
  })

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/salaryAdditionDeduction/addedit/' + encrypted);
  }

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickPop = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const [DateRange, setDateRange] = useState({
    startDate: startOfMonth(addMonths(new Date(), -1)),
    endDate: endOfMonth(addMonths(new Date(), -0))
  });
  const [fromDate, handleFromDate] = useState(new Date());
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const alert = useAlert();

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermissions());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown());
  }, [employeeSalaryAdditionsDeductions.groupID]);

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSALARYADDITIONDEDUCTION');

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

    setEmployeeSalaryAdditionsDeductions({
      ...employeeSalaryAdditionsDeductions,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getEmployeeSalaryAditionsDeductionsDetails() {
    let model = {
      groupID: parseInt(employeeSalaryAdditionsDeductions.groupID),
      factoryID: parseInt(employeeSalaryAdditionsDeductions.factoryID),
      date: (employeeSalaryAdditionsDeductions.date).toISOString().split('T')[0]
    }
    const SalaryAditionsDeductionDetails = await services.GetEmployeeSalaryAditionsDeductionsDetailsByGroupFactoryDate(model);
    if (SalaryAditionsDeductionDetails.length != 0) {
      setSalaryAditionsDeductionDetailsData(SalaryAditionsDeductionDetails);
      setIsHideField(false);
    }
    else {
      setIsHideField(true);
      alert.error("No records to display");
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(employeeSalaryAdditionsDeductions.groupID);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setEmployeeSalaryAdditionsDeductions({
      ...employeeSalaryAdditionsDeductions,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setEmployeeSalaryAdditionsDeductions({
      ...employeeSalaryAdditionsDeductions,
      date: value
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
            toolTiptitle={"Add Salary Addition Deductions"}
          />
        </Grid>
      </Grid>
    )
  }

  return (

    <Page
      className={classes.root}
      title="Salary Additions / Deductions"
    >
      <LoadingComponent />
      <Container maxWidth={false}>

        <Formik
          initialValues={{
            groupID: employeeSalaryAdditionsDeductions.groupID,
            factoryID: employeeSalaryAdditionsDeductions.factoryID,
            date: employeeSalaryAdditionsDeductions.date
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
              factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
            })
          }
          onSubmit={() => trackPromise(getEmployeeSalaryAditionsDeductionsDetails())}
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
                    title={cardTitle("Salary Additions / Deductions")}
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
                            value={employeeSalaryAdditionsDeductions.groupID}
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
                            Factory *
                          </InputLabel>
                          <TextField select
                            error={Boolean(touched.factoryID && errors.factoryID)}
                            fullWidth
                            helperText={touched.factoryID && errors.factoryID}
                            name="factoryID"
                            onChange={(e) => handleChange(e)}
                            value={employeeSalaryAdditionsDeductions.factoryID}
                            variant="outlined"
                            disabled={!permissionList.isFactoryFilterEnabled}
                            size='small'
                          >
                            <MenuItem value="0">--Select Factory--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="date">
                            Date *
                          </InputLabel>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              error={Boolean(touched.date && errors.date)}
                              helperText={touched.date && errors.date}
                              autoOk
                              fullWidth
                              variant="inline"
                              format="dd/MM/yyyy"
                              margin="dense"
                              name="date"
                              id="date"
                              value={employeeSalaryAdditionsDeductions.date}
                              onChange={(e) => {
                                handleDateChange(e);
                              }}
                              KeyboardButtonProps={{
                                'aria-label': 'change date',
                              }}
                              InputProps={{ readOnly: true }}
                            />
                          </MuiPickersUtilsProvider>
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
                    <Box minWidth={1050} hidden={isHideField}>

                      <MaterialTable
                        title="Multiple Actions Preview"
                        columns={[
                          { title: 'Date', field: 'date', render: rowData => rowData.date.split('T')[0] },
                          { title: 'EMP Name', field: 'employeeName' },
                          { title: 'Reg No', field: 'registrationNumber' },
                          { title: 'Transaction Type', field: 'adjustmentType', lookup: {
                              1: 'Addition',
                              2: 'Deduction '
                          }},
                          { title: 'Amount', field: 'amount' },
                        ]}
                        data={salaryAditionsDeductionData}
                        options={{
                          exportButton: false,
                          showTitle: false,
                          headerStyle: { textAlign: "left", height: '1%' },
                          cellStyle: { textAlign: "left" },
                          columnResizable: false,
                          actionsColumnIndex: -1
                        }}
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

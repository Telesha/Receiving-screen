import React, { useState, useEffect,useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  makeStyles,
  Container,
  CardHeader,
  CardContent,
  Divider,
  MenuItem,
  Grid,
  InputLabel,
  TextField,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { Formik } from 'formik';
import * as Yup from "yup";
import MaterialTable from 'material-table';
import { useAlert } from 'react-alert';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  btnApprove: {
    backgroundColor: 'green'
  },
    colorRecord: {
    backgroundColor: "green",
  },
    colorCancel: {
    backgroundColor: "red",
  },
}));

const screenCode = 'FACTORYLEAFENTERINGREPORT';
export default function FactoryLeafEnteringReport(props) {
  const date = new Date();
  const classes = useStyles();
  const [factoryLeafTempData, setFactoryLeafTempData] = useState([]);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [leafAmendment, setLeafAmendment] = useState({
    groupID: '0',
    factoryID: '0',
    routeID: '0',
    date: date.toISOString().substring(0, 10)
  });
  const[selectedSearchValues,setSelectedSearchValues] = useState({
    groupName : '',
    factoryName : '',
    routeName : '',
    date : ''
  })
  const componentRef = useRef();
  const navigate = useNavigate();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [routes, setRoutes] = useState();
  const alert = useAlert();

const columns= [
      {
        title: 'Customer Name',
        field: 'firstName',
        editable: 'never',
        cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        },
        headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        }
      },
      {
        title: 'Reg No.',
        field: 'registrationNumber',
        editable: 'never',
        cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        },
        headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        }
      },
        {
        title: 'Collection',
        field: 'collectionTypeName',
        editable: 'never',
        cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        },
        headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        }
      },
      {
        title: 'Units',
        field: 'numberOfUnit',
        editable: 'never',
        cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        },
        headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        }
      },
      {
        title: 'Total Weight',
        field: 'totalWeight',
        editable: 'never',
        cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        },
        headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        }
      },
      {
        title: 'Bag Deduction',
        field: 'bagDeduction',
        editable: 'never',
        cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        },
        headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        }
      },
      {
        title: 'Water Deduction',
        field: 'waterDeduction',
        editable: 'never',
        cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        },
        headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        }
      },
      {
        title: 'Course Leaf',
        field: 'courseLeafe',
        editable: 'never',
        cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        },
        headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        }
      },
      {
        title: 'Other Deduction',
        field: 'otherDeduction',
        editable: 'never',
        cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        },
        headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        }
      },
      {
        title: 'Total Deduction',
        field: 'totalDeduction',
        editable: 'never',
        cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        },
        headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        }
      },
      {
        title: 'Net Weight',
        field: 'netWeight',
        editable: 'never',
        cellStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        },
        headerStyle: {
          width: 200,
          maxWidth: 200,
          textAlign: 'left',
          marginLeft: '20rem'
        }
      },
    ]
  const [data, setData] = useState([])
  const [finishStatus, setfinishStatus] = useState(false);

  const onBackButtonEvent = e => {
    e.preventDefault();
    if (!finishStatus) {
      if (window.confirm('Do you want to go back ?')) {
        setfinishStatus(true);
        navigate('/app/dashBoard');
      } else {
        window.history.pushState(null, null, window.location.pathname);
        setfinishStatus(false);
      }
    }
  };

  useEffect(() => {
    trackPromise(
      getPermission(), 
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown());
  }, [leafAmendment.groupID]);

  useEffect(() => {
    trackPromise(getRoutesForDropDown());
  }, [leafAmendment.factoryID]);

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', onBackButtonEvent);
    return () => {
      window.removeEventListener('popstate', onBackButtonEvent);
    };
  }, []);

  async function getRoutesForDropDown() {
    const routeList = await services.getRoutesForDropDown(
      leafAmendment.factoryID
    );
    setRoutes(routeList);
  }

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);

    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWFACTORYLEAFENTERINGREPORT'
    );
    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setLeafAmendment({
      ...leafAmendment,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getFactoryLeafEnteringTempDetails() {
    let model = {
      GroupID : parseInt(leafAmendment.groupID),
      FactoryID: parseInt(leafAmendment.factoryID),
      RouteID :parseInt(leafAmendment.routeID),
      Date : leafAmendment.date
    }
    getSelectedDropdownValuesForReport(model)
    setFactoryLeafTempData([])
    setData([]);
    let result = await services.getFactoryLeafTempData(model);
    if (result.statusCode == "Success" && result.data != null) {
            if (result.data.length == 0) {
                alert.error("No records to display");
                return;
            }
        setData(result.data);
        setFactoryLeafTempData(result.data);
        }
        else {
            alert.error("No records to display");
        }
  }

   function getSelectedDropdownValuesForReport(searchForm) { 
        setSelectedSearchValues({
            ...selectedSearchValues,
            groupName: groups[searchForm.GroupID],
            factoryName: factories[searchForm.FactoryID],
            routeName: routes[searchForm.RouteID],
            date: searchForm.Date
        })
    }
async function createDataForExcel(array) {
  var res = [];
  if (array != null) {
      array.map(x => {
          var vr = {
              'Customer Name': x.firstName,
              'Registration Number': x.registrationNumber,
              'Collection': x.collectionTypeName,
              'Units': x.numberOfUnit,
              'Total Weight': x.totalWeight,
              'Bag Deduction': x.bagDeduction,
              'Water Deduction': x.waterDeduction,
              'Course Leaf': x.courseLeafe,
              'Other Deduction': x.otherDeduction,
              'Total Deduction': x.totalDeduction,
              'Net Weight': x.netWeight,
          }
          res.push(vr);
      });
          res.push({})
          var vr ={
            'Customer Name':"Group :" + selectedSearchValues.groupName,
            'Registration Number': "Factory :" + selectedSearchValues.factoryName,
            'Collection' :  "Route :" + selectedSearchValues.routeName,
            'Units': "Date :" + selectedSearchValues.date
          }
          res.push(vr);
  }
  return res;
}
let csvHeaders = []
async function createFile() {
    var file = await createDataForExcel(factoryLeafTempData);
    var settings = {
        sheetName: 'Factory Leaf Entering Temp Report',
        fileName: 'Factory Leaf Entering Temp Report' + ' ' + selectedSearchValues.groupName + ' ' + selectedSearchValues.factoryName + '  ' + selectedSearchValues.date,
        writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
        tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    let dataA = [
        {
            sheet: 'Factory Leaf Temp Report',
            columns: tempcsvHeaders,
            content: file
        }
    ]
    xlsx(dataA, settings);
}
  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getAllFactoriesByGroupID(
      leafAmendment.groupID
    );
    setFactories(factories);
  }

  function generateDropDownMenu(data) {
    let items = [];
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        );
      }
    }
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setLeafAmendment({
      ...leafAmendment,
      [e.target.name]: value
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    );
  }

  return (
    <Page className={classes.root} title="Factory Leaf Entering Report">
      <Container maxWidth={false}>
        <Box mt={0}>
          <Card>
          <Formik
            initialValues={{
              groupID: leafAmendment.groupID,
              factoryID: leafAmendment.factoryID,
              routeID: leafAmendment.routeID,
              date: leafAmendment.date
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                routeID: Yup.number().required('Route is required').min("1", 'Route is required'),
                date: Yup.date().required('Date is required'),
              })
            }
            onSubmit={() => trackPromise(getFactoryLeafEnteringTempDetails())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched
            }) => (
            <form onSubmit={handleSubmit}>
            <CardHeader title={cardTitle('Factory Leaf Entering Report')} />
            <PerfectScrollbar>
              <Divider />
              <CardContent style={{ marginBottom: '2rem' }}>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="groupID">
                      Group *
                    </InputLabel>
                    <TextField
                      error={Boolean(touched.groupID && errors.groupID)}
                      helperText={touched.groupID && errors.groupID}
                      select
                      fullWidth
                      name="groupID"
                      onBlur={handleBlur}
                      onChange={e => handleChange(e)}
                      value={leafAmendment.groupID}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        readOnly: !permissionList.isGroupFilterEnabled
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
                    <TextField
                      error={Boolean(touched.factoryID && errors.factoryID)}
                      helperText={touched.factoryID && errors.factoryID}
                      select
                      fullWidth
                      onBlur={handleBlur}
                      name="factoryID"
                      onChange={e => handleChange(e)}
                      value={leafAmendment.factoryID}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        readOnly: !permissionList.isFactoryFilterEnabled
                      }}
                    >
                      <MenuItem value="0">--Select Factory--</MenuItem>
                      {generateDropDownMenu(factories)}
                    </TextField>
                  </Grid>

                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="routeID">
                      Route *
                    </InputLabel>
                    <TextField
                      error={Boolean(touched.routeID && errors.routeID)}
                      helperText={touched.routeID && errors.routeID}
                      select
                      fullWidth
                      onBlur={handleBlur}
                      name="routeID"
                      onChange={e => handleChange(e)}
                      value={leafAmendment.routeID}
                      variant="outlined"
                      size="small"
                    >
                      <MenuItem value="0">--Select Route--</MenuItem>
                      {generateDropDownMenu(routes)}
                    </TextField>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <InputLabel shrink id="date">
                      Date *
                    </InputLabel>
                    <TextField
                      error={Boolean(touched.date && errors.date)}
                      helperText={touched.date && errors.date}
                      fullWidth
                      onBlur={handleBlur}
                      size='small'
                      name="date"
                      type="date"
                      onChange={(e) => handleChange(e)}
                      value={leafAmendment.date}
                      variant="outlined"
                      id="date"
                    />
                  </Grid>
                </Grid>
                <Box display="flex" flexDirection="row-reverse" p={2}>
                  <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                    size="small"
                  >
                    Search
                  </Button>
                </Box>
              </CardContent>
              <Box minWidth={1050}>
                <MaterialTable
                  title="Factory Leaf Entering Temp"
                  fullWidth
                  columns={columns}
                  data={data}
                  options={{
                    showTitle: false,
                    exportButton: false,
                    selection: false
                  }}
                />
              </Box>
                {factoryLeafTempData.length > 0 ?
                  <Box display="flex" justifyContent="flex-end" p={2}>
                      <Button
                          color="primary"
                          id="btnRecord"
                          type="submit"
                          variant="contained"
                          style={{ marginRight: '1rem' }}
                          className={classes.colorRecord}
                          onClick={createFile}
                          size = 'small'
                      >
                          EXCEL
                      </Button>
                      <div>&nbsp;</div>
                      <ReactToPrint
                          documentTitle={"Factory Leaf Entering Temp Report"}
                          trigger={() => <Button
                              color="primary"
                              id="btnCancel"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                              size = 'small'
                          >
                              PDF
                          </Button>}
                          content={() => componentRef.current}
                      />
                      <div hidden={true}>
                          <CreatePDF ref={componentRef}
                          FactoryLeafTempData={factoryLeafTempData}
                          SelectedSearchValues={selectedSearchValues} />
                      </div>
                  </Box> : null}
            </PerfectScrollbar>
            </form>
            )}
            </Formik>
          </Card>
        </Box>
      </Container>
    </Page>
  );
}

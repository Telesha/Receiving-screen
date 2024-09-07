import React, { useState, useEffect, Fragment, useRef } from 'react';
import {
  Box, Card, makeStyles, Container, CardContent, Grid, TextField, MenuItem,
  InputLabel, CardHeader, Divider, Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import moment from 'moment';
import tokenService from '../../../utils/tokenDecoder';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import MaterialTable from "material-table";
import { LoadingComponent } from 'src/utils/newLoader';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';

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

const screenCode = 'JOBWISEAREACOVEREDVIEW';

export default function JobWiseAreaCoveredView() {
  const [title, setTitle] = useState("Job Wise Area Covered View")
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState();
  const [divisions, setDivisions] = useState();
  var month = new Date().getMonth()+1;
  const [jobWiseAreaCovered, setJobWiseAreaCovered] = useState({
    groupID: '0',
    estateID: '0',
    divisionID: '0',
    year: new Date().getFullYear().toString(),
    month: month.toString(),
  });
  const [jobWiseAreaCoveredData, setJobWiseAreaCoveredData] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: '0',
    estateName: '0',
    divisionName: '0',
    year: '',
    month: '',
    monthName: ''
  });
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const componentRef = useRef();
  const [isTableHide, setIsTableHide] = useState(true);
  const [isButtonHide, setIsButtonHide] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
  });

  const navigate = useNavigate();
  const alert = useAlert();

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    if (jobWiseAreaCovered.groupID > 0) {
      trackPromise(
        getEstateDetailsByGroupID()
      );
    };
  }, [jobWiseAreaCovered.groupID]);

  useEffect(() => {
    if (jobWiseAreaCovered.estateID > 0) {
      trackPromise(
        getDivisionDetailsByEstateID()
      );
    };
  }, [jobWiseAreaCovered.estateID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWJOBWISEAREACOVERED');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
    });

    setJobWiseAreaCovered({
      ...jobWiseAreaCovered,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getEstateDetailsByGroupID() {
    var estate = await services.getEstateDetailsByGroupID(jobWiseAreaCovered.groupID);
    setEstates(estate);
  }

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(jobWiseAreaCovered.estateID);
    setDivisions(response);
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

  async function GetDetails() {

    let model = {
      groupID: parseInt(jobWiseAreaCovered.groupID),
      estateID: parseInt(jobWiseAreaCovered.estateID),
      divisionID: parseInt(jobWiseAreaCovered.divisionID),
      applicableMonth: jobWiseAreaCovered.month,
      applicableYear: jobWiseAreaCovered.year
    }
    const response = await services.GetJobWiseAreaCoveredView(model);

    getSelectedDropdownValuesForReport(model);


    setJobWiseAreaCoveredData(response);

    setIsTableHide(false);
    setIsButtonHide(false);
  }


  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Job Type': x.jobTypeID == 1 ? 'Sundry' : 'Plucking',
          'Sundry Count': x.sundryCount != 0 ? x.sundryCount : '----',
          'Area Covered Date': 'x.areaCoveredDate',
          'Feild Name': x.fieldName,
          'Area Covered': x.areaCoverd,
          'Remaining Area': x.remainArea,
          'Leaf': x.leafTypeID == 1 ? 'Green Leaf' : '-----',
          'Qty(Kg)': x.quantity,
        }
        res.push(vr);
      });
    }
    return res;
  }

  async function createFile() {

    var file = await createDataForExcel(jobWiseAreaCoveredData);
    var settings = {
      sheetName: 'Job Wise Area Covered View Report',
      fileName: 'Job Wise Area Covered View Report' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.estateName + '  ' + selectedSearchValues.divisionName + ' - ' + selectedSearchValues.month + ' - ' + selectedSearchValues.year,
      writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Job Wise Area Covered View',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  async function ClearTable() {
    clearState();
  }

  function clearState() {
    setJobWiseAreaCovered({
      ...jobWiseAreaCovered,
      groupID: 0,
      estateID: 0,
      divisionID: 0,
      year: '',
      month: ''
    });

    setIsTableHide(true);
    setIsButtonHide(true);
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setJobWiseAreaCovered({
      ...jobWiseAreaCovered,
      [e.target.name]: value
    });
  }

  function handleDateChange(date) {
    let monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    var month = date.getUTCMonth() + 1; //months from 1-12
    var year = date.getUTCFullYear();
    var currentmonth = moment().format('MM');
    let monthName = monthNames[month - 1];
    setSelectedSearchValues({
      ...selectedSearchValues,
      monthName: monthName
    })
    setJobWiseAreaCovered({
      ...jobWiseAreaCovered,
      month: month.toString(),
      year: year.toString()
    });

    if (selectedDate != null) {

      var prevMonth = selectedDate.getUTCMonth() + 1
      var prevyear = selectedDate.getUTCFullYear();

      if ((prevyear == year && prevMonth != month) || (prevyear != year)) {
        setSelectedDate(date)

      }
    } else {
      setSelectedDate(date)
    }
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: groups[searchForm.groupID],
      estateName: estates[searchForm.estateID],
      divisionName: divisions[searchForm.divisionID],
      month: searchForm.applicableMonth,
      year: searchForm.applicableYear
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

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: jobWiseAreaCovered.groupID,
              estateID: jobWiseAreaCovered.estateID,
              divisionID: jobWiseAreaCovered.divisionID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                estateID: Yup.number().required('Estate is required').min("1", 'Estate is required'),
                divisionID: Yup.number().required('Division is required').min("1", 'Division is required')
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
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
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
                              value={jobWiseAreaCovered.groupID}
                              variant="outlined"
                              size='small'
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={jobWiseAreaCovered.estateID}
                              variant="outlined"
                              size='small'
                              id="estateID"
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Division *
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="divisionID"
                              onChange={(e) => handleChange(e)}
                              value={jobWiseAreaCovered.divisionID}
                              variant="outlined"
                              size='small'
                              id="divisionID"
                            >
                              <MenuItem value="0">--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <DatePicker
                                autoOk
                                fullWidth
                                variant="inline"
                                openTo="month"
                                views={["year", "month"]}
                                label="Year and Month *"
                                helperText="Select applicable month"
                                value={selectedDate}
                                //maxDate={maxDate}
                                disableFuture={true}
                                onChange={(date) => handleDateChange(date)}
                                size='small'
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            size='small'
                            onClick={() => trackPromise(GetDetails())}
                          >
                            Search
                          </Button>
                          <div>&nbsp;</div>
                          <Button
                            color="primary"
                            type="reset"
                            size='small'
                            variant="outlined"
                            onClick={ClearTable}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </CardContent>

                      <Box minWidth={1050} hidden={isTableHide}>
                        <MaterialTable
                          title="Multiple Actions Preview"
                          columns={[
                            { title: 'Job Type', field: 'jobTypeID', render: rowData => rowData.jobTypeID == 1 ? 'Sundry' : 'Plucking' },
                            { title: 'Sundry Count', field: 'sundryCount', render: rowData => rowData.sundryCount > 0 ? rowData.sundryCount : '---' },
                            { title: 'Area Covered Date', field: 'areaCoveredDate', render: rowData => rowData.areaCoveredDate.split('T')[0] },
                            { title: 'Field Name', field: 'fieldName', },
                            { title: 'Area Covered(Hectare)', field: 'areaCoverd' },
                            { title: 'Remaining Area(Hectare)', field: 'remainArea' },
                            { title: 'Leaf Type', field: 'leafTypeID', render: rowData => rowData.leafTypeID == 1 ? 'Green Leaf' : '---' },
                            { title: 'Qty(Kg)', field: 'quantity' },
                          ]}
                          data={jobWiseAreaCoveredData}
                          options={{
                            exportButton: false,
                            showTitle: false,
                            headerStyle: { textAlign: "left", height: '1%' },
                            cellStyle: { textAlign: "left" },
                            columnResizable: false,
                            actionsColumnIndex: -1,
                            pageSize: 10
                          }}
                          actions={[
                          ]}
                        />
                      </Box>

                      <div hidden={isButtonHide}>
                        {jobWiseAreaCoveredData.length > 0 ?
                          <Box display="flex" justifyContent="flex-end" p={2} hidden={isTableHide}>
                            <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorRecord}
                              onClick={() => createFile()}
                              size='small'
                            >
                              EXCEL
                            </Button>

                            <ReactToPrint
                              documentTitle={"Job Wise Area Covered View Report"}
                              trigger={() => <Button
                                color="primary"
                                id="btnRecord"
                                type="submit"
                                variant="contained"
                                style={{ marginRight: '1rem' }}
                                className={classes.colorCancel}
                                size='small'
                              >
                                PDF
                              </Button>}
                              content={() => componentRef.current}
                            />

                            <div hidden={true}>
                              <CreatePDF ref={componentRef}
                                routeSummaryData={jobWiseAreaCoveredData}
                                searchData={selectedSearchValues}
                              />
                            </div>

                            <div>&nbsp;</div>
                          </Box>
                          : null}
                      </div>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>
  );
}

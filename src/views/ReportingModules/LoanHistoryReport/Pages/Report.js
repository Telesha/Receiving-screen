import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader,
  MenuItem
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import MaterialTable from "material-table";
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';
import DateRangeSelectorComponent from '../../InquiryRegistry/Utils/DateRangeSelector';
import Popover from '@material-ui/core/Popover';
import EventIcon from '@material-ui/icons/Event';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import moment from 'moment';

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
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecord: {
    backgroundColor: "green",
  },
}));

const screenCode = 'LOANHISTORYREPORT';

export default function LoanHistoryReport(props) {
  const [title, setTitle] = useState("Loan History Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [routeList, setRouteList] = useState();
  const [loanRequestDetail, setLoanRequestDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0
  });
  const [loanHistoryList, setLoanHistoryList] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    startDate: '',
    endDate: ''
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClickPop = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const [DateRange, setDateRange] = useState({
    startDate: startOfMonth(addMonths(new Date(), -5)),
    endDate: endOfMonth(addMonths(new Date(), -0))
  });
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const [csvHeaders, SetCsvHeaders] = useState([])

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [loanRequestDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID());
  }, [loanRequestDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWLOANHISTORYREPORT');

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

    setLoanRequestDetail({
      ...loanRequestDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(loanRequestDetail.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routes = await services.getRoutesForDropDown(loanRequestDetail.factoryID);
    setRouteList(routes);
  }

  async function GetLoanHistory() {
    let model = {
      groupID: parseInt(loanRequestDetail.groupID),
      factoryID: parseInt(loanRequestDetail.factoryID),
      routeID: parseInt(loanRequestDetail.routeID),
      startDate:moment(DateRange.startDate.toString()).format().split('T')[0],
      endDate: moment(DateRange.endDate.toString()).format().split('T')[0],
    }
    const response = await services.GetLoanHistoryForReport(model);

    getSelectedDropdownValuesForReport(model);

    if (response.statusCode == "Success" && response.data != null) {
      setLoanHistoryList(response.data);
      createDataForExcel(response.data);

      if (response.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error(response.message);

    }
  }

    async function createDataForExcel(array) {
      var res = [];
  
      if (array != null) {
        array.map(x => {
          var vr = {
            'Route Name': x.routeName,
            'Reg No': x.registrationNumber,
            'Name': x.name,
            'Loan Amount (Rs)': x.principalAmount,
            'Installments': x.numberOfInstalments,
            'Interest Rate': x.annualRate,
            'Start Date': x.loanIssuedDate.split('T')[0],
            'Status': x.isPaymentCompleated == true?'Completed':'Ongoing'
          }
          res.push(vr);
        });
      }
  
      return res;
    }
  
    async function createFile() {
  
      var file = await createDataForExcel(loanHistoryList);
      var settings = {
        sheetName: 'Loan History Report',
        fileName: 'Loan History Report - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName+ ' '
        + selectedSearchValues.startDate + ' - ' + selectedSearchValues.endDate,
        writeOptions: {}
      }
  
      let keys = Object.keys(file[0])
      let tempcsvHeaders = csvHeaders;
      keys.map((sitem, i) => {
        tempcsvHeaders.push({ label: sitem, value: sitem })
      })
  
      let dataA = [
        {
          sheet: 'Loan History Report',
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
    return items;
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setLoanRequestDetail({
      ...loanRequestDetail,
      [e.target.name]: value
    });
    setLoanHistoryList([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(searchForm.startDate.toString()).format().split('T')[0]
    var endDate = moment(searchForm.endDate.toString()).format().split('T')[0]
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
      startDate: [startDate],
      endDate: [endDate]
    })
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
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: loanRequestDetail.groupID,
              factoryID: loanRequestDetail.factoryID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
              })
            }
            onSubmit={() => trackPromise(GetLoanHistory())}
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
                              value={loanRequestDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size = 'small'
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
                              value={loanRequestDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size = 'small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="routeID">
                              Route
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="routeID"
                              onChange={(e) => handleChange(e)}
                              value={loanRequestDetail.routeID}
                              variant="outlined"
                              id="routeID"
                              size = 'small'
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routeList)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12} >
                            <InputLabel shrink>
                              Date *
                            </InputLabel>
                            <Button
                              aria-describedby={id}
                              variant="contained"
                              fullWidth
                              color="primary"
                              onClick={handleClickPop}
                              size="medium"
                              endIcon={<EventIcon />}
                            >
                              {DateRange.startDate.toLocaleDateString() + " - " + DateRange.endDate.toLocaleDateString()}
                            </Button>
                            <Popover
                              id={id}
                              open={open}
                              anchorEl={anchorEl}
                              onClose={handleClose}
                              anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'left',
                              }}
                              transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                              }}
                            >
                              <DateRangeSelectorComponent setDateRange={setDateRange} handleClose={handleClose} />
                            </Popover>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            size = 'small'
                          >
                            Search
                              </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {loanHistoryList.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Route Name', field: 'routeName' },
                              { title: 'Reg No', field: 'registrationNumber', defaultSort: "asc" },
                              { title: 'Name', field: 'name' },
                              { title: 'Loan Amount (Rs)', field: 'principalAmount' },
                              { title: 'Installments', field: 'numberOfInstalments' },
                              { title: 'Interest Rate', field: 'annualRate' },
                              { title: 'Start Date', field: 'loanIssuedDate', render: rowData => rowData.loanIssuedDate.split('T')[0]},
                              {
                                title: 'Status', field: 'isPaymentCompleated', lookup: {
                                  true: 'Completed',
                                  false: 'Ongoing',
                                }
                              },
                            ]}
                            data={loanHistoryList}
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
                          /> : null}
                      </Box>
                      {loanHistoryList.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                           <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={()=>createFile()}
                            size = 'small'
                          >
                            EXCEL
                                            </Button>
                          <ReactToPrint
                            documentTitle={"Loan History Report"}
                            trigger={() => <Button
                              color="primary"
                              id="btnRecord"
                              type="submit"
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
                              loanHistoryList={loanHistoryList} searchData={selectedSearchValues}
                            />
                          </div>
                        </Box> : null}
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

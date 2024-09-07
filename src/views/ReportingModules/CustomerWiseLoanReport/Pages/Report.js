import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Button,
  makeStyles,
  Container,
  Divider,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  InputLabel
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import * as Yup from "yup";
import { LoadingComponent } from 'src/utils/newLoader';
import { Formik } from 'formik';
import { useAlert } from "react-alert";
import _ from 'lodash';
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import MaterialTable from "material-table";
import Typography from '@material-ui/core/Typography';
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
  },
  colorCancel: {
    backgroundColor: "red",
  },
  colorRecordAndNew: {
    backgroundColor: "#FFBE00"
  },
  colorRecord: {
    backgroundColor: "green",
  }
}));

const screenCode = 'CUSTOMERWISELOANREPORT';

export default function GreenLeafRouteDetails(props) {
  const [title, setTitle] = useState("Customer Wise Loan Report")
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [customerLoanInput, setCustomerLoanInput] = useState({
    groupID: '0',
    factoryID: '0',
    registrationNumber: ''
  })
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const componentRef = useRef();
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    factoryName: "0",
    groupName: "0"
  })
  const [loanDataReport, setLoanDataReport] = useState([]);
  const [loanDataReportDetails, setLoanDataReportDetails] = useState([]);
  const [loanDataReportExcel, setLoanDataReportExcel] = useState([]);


  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [customerLoanInput.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCUSTOMERWISELOANREPORT');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setCustomerLoanInput({
      ...customerLoanInput,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function handleViewOnly(loanNumber) {
    let loanNumberID = loanNumber;
    const loanReport = await services.GetLoanDetailsByLoanNumber(loanNumberID);
    setLoanDataReportDetails(loanReport[0]);
    setLoanDataReportExcel(loanReport);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(customerLoanInput.groupID);
    setFactories(factory);
  }

  async function GetDetails() {
    let model = {
      groupID: parseInt(customerLoanInput.groupID),
      factoryID: parseInt(customerLoanInput.factoryID),
      registrationNumber: parseInt(customerLoanInput.registrationNumber)
    }
    getSelectedDropdownValuesForReport(model);

    const LoanData = await services.GetLoanDetailsByGroupIDFactoryIDRegistryNumber(customerLoanInput.groupID, customerLoanInput.factoryID, customerLoanInput.registrationNumber);

    if (LoanData.statusCode == "Success" && LoanData.data != null) {
      setLoanDataReport(LoanData.data);
      if (LoanData.data.length == 0) {
        alert.error("No records to display");
      }
    }
    else {
      alert.error(loanDataReport.message);
    }
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

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
      </Grid>
    )
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setCustomerLoanInput({
      ...customerLoanInput,
      [e.target.name]: value
    });
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: factories[searchForm.factoryID],
      groupName: groups[searchForm.groupID]
    })
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'Loan Number': x.loanNumber,
          'Start Date': x.startDate.split('T')[0],
          'End Date': x.endDate.split('T')[0],
          'Loan Amount': x.loanAmount,
          'Remaining Balance': x.remainingBalance,
          'Installments': x.installments,
          'Remaining Installments': x.remainingInstallments,
          'Interest Rate': x.interestRate,
          'Interest Amount': x.interestAmount,
          'Np': x.Np,
          'Arrears': x.arrears,
          'Arrears Amount': x.arrearsAmount,
          'Status': x.status
        }
        res.push(vr);
      });
    }

    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(loanDataReportExcel);
    var settings = {
      sheetName: 'Crop Slab Report',
      fileName: 'Customer wise loan report',
      writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    let dataA = [
      {
        sheet: 'Customer Crop Slab Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }


  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: customerLoanInput.groupID,
              factoryID: customerLoanInput.factoryID,
              registrationNumber: customerLoanInput.registrationNumber,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                registrationNumber: Yup.string().required('Registration number is required').matches(/[0-9]/, 'Only numbers are allowed')
              })
            }
            onSubmit={() => trackPromise(GetDetails())}
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
                      title={cardTitle(title)}
                    />
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
                              value={customerLoanInput.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'

                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
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
                              value={customerLoanInput.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size='small'

                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Registration Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                              fullWidth
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              name="registrationNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={customerLoanInput.registrationNumber}
                              variant="outlined"
                              id="registrationNumber"
                              size='small'
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                          >
                            Search
                          </Button>
                        </Box>
                        <br />

                      </CardContent>
                      <Box minWidth={1050}>
                        {loanDataReport.length > 0 ?
                          <MaterialTable
                            title="Multiple Actions Preview"
                            columns={[
                              { title: 'Loan Number', field: 'loanNumber' },
                              { title: 'Loan Date', field: 'loanDate', render: rowData => rowData.loanDate.split('T')[0] },
                              { title: 'Loan Amount', field: 'loanAmount' },
                              { title: 'Installments', field: 'installments' },
                              { title: 'Interest Rate', field: 'interestRate' },
                              {
                                title: 'NP', field: 'np', lookup: {
                                  true: 'Yes',
                                  false: 'No'
                                }
                              },
                              {
                                title: 'Arrears', field: 'arrears', lookup: {
                                  true: 'Yes',
                                  false: 'No'
                                }
                              },
                              {
                                title: 'Status', field: 'status', lookup: {
                                  true: 'Completed',
                                  false: 'Ongoing'
                                }
                              }
                            ]}
                            data={loanDataReport}
                            options={{
                              exportButton: false,
                              showTitle: false,
                              headerStyle: { textAlign: "left", height: '1%' },
                              cellStyle: { textAlign: "left" },
                              columnResizable: false,
                              actionsColumnIndex: -1,
                              pageSize: 10
                            }}
                            // actions={[
                            //   {
                            //     icon: 'visibilityIcon',
                            //     tooltip: 'View Loan',
                            //     onClick: (event, loanDataReport) => handleViewOnly(loanDataReport.loanNumber)
                            //   }
                            // ]}
                          /> : null}
                      </Box>

                      {loanDataReportDetails.length != 0 ?
                        <CardContent>
                          <Grid container spacing={3}>

                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Loan Number: </b> {loanDataReportDetails.loanNumber}
                              </Typography>
                            </Grid>

                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Start Date: </b> {loanDataReportDetails.startDate.split('T')[0]}
                              </Typography>
                            </Grid>

                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>End Date: </b> {loanDataReportDetails.endDate.split('T')[0]}
                              </Typography>
                            </Grid>
                          </Grid>
                          <br />

                          <Grid container spacing={3}>
                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Loan Amount: </b> {loanDataReportDetails.loanAmount}
                              </Typography>
                            </Grid>

                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Remaining Balance: </b> {loanDataReportDetails.remainingBalance}
                              </Typography>
                            </Grid>
                          </Grid>
                          <br />

                          <Grid container spacing={3}>
                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Installments: </b> {loanDataReportDetails.installments}
                              </Typography>
                            </Grid>

                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Remaining Installments: </b> {loanDataReportDetails.remainingInstallments}
                              </Typography>
                            </Grid>
                          </Grid>
                          <br />

                          <Grid container spacing={3}>
                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Interest Rate: </b> {loanDataReportDetails.interestRate}
                              </Typography>
                            </Grid>

                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Interest Amount: </b> {loanDataReportDetails.interestAmount}
                              </Typography>
                            </Grid>

                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Remaining Interest: </b>
                              </Typography>
                            </Grid>
                          </Grid>
                          <br />

                          <Grid container spacing={3}>
                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Np: </b> {loanDataReportDetails.np}
                              </Typography>
                            </Grid>

                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Arrears: </b> {loanDataReportDetails.arrears}
                              </Typography>
                            </Grid>

                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Arrears Amount: </b> {loanDataReportDetails.arrearsAmount}
                              </Typography>
                            </Grid>
                          </Grid>
                          <br />

                          <Grid container spacing={3}>
                            <Grid item md={4} xs={9}>
                              <Typography>
                                <b>Status: </b> {loanDataReportDetails.status}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent> : null}

                      {loanDataReportDetails.length != 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={createFile}
                          >
                            EXCEL
                          </Button>
                          <div>&nbsp;</div>
                          <ReactToPrint
                            documentTitle={"Customer wise loan report"}
                            trigger={() =>
                              <Button
                                color="primary"
                                id="btnCancel"
                                variant="contained"
                                style={{ marginRight: '1rem' }}
                                className={classes.colorCancel}
                              >
                                PDF
                              </Button>
                            }
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF ref={componentRef} loanDataReportDetails={loanDataReportDetails} />
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
    </Fragment >
  )
}
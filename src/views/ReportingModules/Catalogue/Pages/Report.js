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
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import MaterialTable from 'material-table';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import DateRangeSelectorComponent from '../../../UserStatistics/Utils/DateRangeSelector';
import EventIcon from '@material-ui/icons/Event';
import Popover from '@material-ui/core/Popover';
import { useAlert } from 'react-alert';

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
  row: {
    marginTop: '1rem'
  },
  colorCancel: {
    backgroundColor: 'red'
  },
  colorRecordAndNew: {
    backgroundColor: '#FFBE00'
  },
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = 'CATALOGUE';

export default function Catalogue(props) {
  const [title, setTitle] = useState('Catalogue');
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [catalogueData, setCatalogueData] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [sellingMarks, setSellingMarks] = useState([]);
  const [totalGrade, setTotalGrade] = useState([]);
  const [mainGrade, setMainGrade] = useState([]);
  const [offGrade, setOffGrade] = useState([]);
  const [grades, setGrades] = useState();
  const [catalogueDetails, setCatalogueDetails] = useState({
    groupID: '0',
    factoryID: '0',
    date: '',
    sellingMark: '0',
    broker: '0',
    grade: '0',
    invNo: '',
    lotNo: '',
    noOfPak: '',
    netQty: '',
    fh: 'Full',
    sampleQty: '',
    dateOfSale: ''
  });
  let encrypted = "";
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClickPop = event => {
    setAnchorEl(event.currentTarget);
  };
  const [DateRange, setDateRange] = useState({
    startDate: startOfMonth(addMonths(new Date(), -5)),
    endDate: endOfMonth(addMonths(new Date(), -0))
  });
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const componentRef = useRef();
  const navigate = useNavigate();
  const alert = useAlert();

  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    startDate: '',
    endDate: ''
  });
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [catalogueDetails.groupID]);

  useEffect(
    () => {
      trackPromise(
        getBrokersForDropdown(),
        getSellingMarksForDropdown(),
        getGradesForDropdown()
      );
    },
    [catalogueDetails.factoryID]
  );

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWCATALOGUE'
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

    setCatalogueDetails({
      ...catalogueDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }
  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(
      catalogueDetails.groupID
    );
    setFactories(factory);
  }

  async function getBrokersForDropdown() {
    const brokers = await services.getBrokerList(
      catalogueDetails.groupID,
      catalogueDetails.factoryID
    );
    setBrokers(brokers);
  }

  async function getGradesForDropdown() {
    const grades = await services.getGradeDetails(
      catalogueDetails.groupID,
      catalogueDetails.factoryID
    );
    setGrades(grades);
  }

  async function getSellingMarksForDropdown() {
    const sellingMarks = await services.getSellingMarkList(
      catalogueDetails.groupID,
      catalogueDetails.factoryID
    );
    setSellingMarks(sellingMarks);
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

  async function GetDetails() {
    let model = {
      groupID: parseInt(catalogueDetails.groupID),
      factoryID: parseInt(catalogueDetails.factoryID),
      startDate: moment(DateRange.startDate.toString())
        .format()
        .split('T')[0],
      endDate: moment(DateRange.endDate.toString())
        .format()
        .split('T')[0],
      sellingMarkID: parseInt(catalogueDetails.sellingMark),
      brokerID: parseInt(catalogueDetails.broker),
      gradeID: parseInt(catalogueDetails.grade)
    };

    const routeData = await services.getCatalogueDetails(model);
    
    getSelectedDropdownValuesForReport(model);


    if (routeData.statusCode == 'Success' && routeData.data != null) {
      const rdata = routeData.data;

      rdata.forEach(x => {
        x.sellingDate = x.sellingDate.split('T')[0];
        if (x.fullOrHalf == 1) {
          x.fullOrHalf = 'Full';
        } else {
          x.fullOrHalf = 'Half';
        }
      });

      setCatalogueData(rdata);
      if (routeData.data.length == 0) {
        alert.error("No records to display");
    }
    } else {
      alert.error('Error');
    }
  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          'InvoiceNo': x.invoiceNo,
          'Date': x.sellingDate,
          'SellingMarkName': x.sellingMarkName,
          'Grade': x.gradeName,
          'Broker': x.brokerName,
          'Gross Qty (KG)': x.grossQuantity,
          'Net Qty (KG)': x.netQuantity
        };
        res.push(vr);
      });
      var vr = {
        'InvoiceNo': "Main Grade Qty (KG)",
        'Date': mainGrade
      }
      res.push(vr);
      var vr = {
        'InvoiceNo': "Off Grade Qty (KG)",
        'Date': offGrade
      }
      res.push(vr);
      var vr = {
        'InvoiceNo': "Total Grade Qty (KG)",
        'Date': totalGrade
      }
      res.push(vr);
    }

    return res;
  }

  function totalMainGrade() {
    
    const mainGrade = catalogueData.filter(x => x.gradeCategoryID === 1).reduce((totalDebit, item) => totalDebit + item.netQuantity, 0).toFixed(2)
    setMainGrade(mainGrade)

    const offGrade = catalogueData.filter(x => x.gradeCategoryID === 2).reduce((totalDebit, item) => totalDebit + item.netQuantity, 0).toFixed(2)
    setOffGrade(offGrade)

    const totalGrade = (parseFloat(catalogueData.filter(x => x.gradeCategoryID === 1).reduce((totalDebit, item) => totalDebit + item.netQuantity, 0).toFixed(2)) +
                        parseFloat(catalogueData.filter(x => x.gradeCategoryID === 2).reduce((totalDebit, item) => totalDebit + item.netQuantity, 0).toFixed(2))).toFixed(2);
    setTotalGrade(totalGrade)
    return totalGrade;
  }

  async function createFile() {
    var file = await createDataForExcel(catalogueData);
    var settings = {
      sheetName: 'Catalogue',
      fileName: 'Catalogue' + ' ' + 'Report' + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName + ' - ' + selectedSearchValues.endDate + ' - ' + selectedSearchValues.endDate,
      writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    let dataA = [
      {
        sheet: 'Catalogue',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(searchForm.startDate.toString()).format().split('T')[0]
    var endDate = moment(searchForm.endDate.toString()).format().split('T')[0]
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: factories[searchForm.factoryID],
      groupName: groups[searchForm.groupID],
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
    );
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value;
    setCatalogueDetails({
      ...catalogueDetails,
      [e.target.name]: value
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: catalogueDetails.groupID,
              factoryID: catalogueDetails.factoryID,
              date: catalogueDetails.date
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Factory is required')
                .min('1', 'Factory is required'),
              date: Yup.date().required('Date is required')
            })}
            onSubmit={() => trackPromise(GetDetails())}
            enableReinitialize
          >
            {({ errors, handleBlur, handleSubmit, touched }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={catalogueDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.factoryID && errors.factoryID
                              )}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={catalogueDetails.factoryID}
                              variant="outlined"
                              size='small'
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink>Date *</InputLabel>
                            <Button
                              aria-describedby={id}
                              variant="contained"
                              fullWidth
                              color="primary"
                              size='small'
                              onClick={handleClickPop}
                              endIcon={<EventIcon />}
                            >
                              {DateRange.startDate.toLocaleDateString() +
                                ' - ' +
                                DateRange.endDate.toLocaleDateString()}
                            </Button>
                            <Popover
                              id={id}
                              open={open}
                              anchorEl={anchorEl}
                              onClose={handleClose}
                              anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'left'
                              }}
                              transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left'
                              }}
                            >
                              <DateRangeSelectorComponent
                                setDateRange={setDateRange}
                                handleClose={handleClose}
                              />
                            </Popover>
                          </Grid>

                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="sellingMark">
                              Selling Mark
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(
                                touched.sellingMark && errors.sellingMark
                              )}
                              fullWidth
                              helperText={
                                touched.sellingMark && errors.sellingMark
                              }
                              name="sellingMark"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={catalogueDetails.sellingMark}
                              variant="outlined"
                              id="sellingMark"
                              size='small'
                            >
                              <MenuItem value={'0'}>
                                ---Select Selling Mark---
                              </MenuItem>

                              {generateDropDownMenu(sellingMarks)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="grade">
                              Grade
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.grade && errors.grade)}
                              fullWidth
                              helperText={touched.grade && errors.grade}
                              name="grade"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={catalogueDetails.grade}
                              variant="outlined"
                              id="grade"
                              size='small'
                            >
                              <MenuItem value={'0'}>
                                ---Select Grade---
                              </MenuItem>

                              {generateDropDownMenu(grades)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="broker">
                              Broker
                            </InputLabel>
                            <TextField
                              select
                              error={Boolean(touched.broker && errors.broker)}
                              fullWidth
                              helperText={touched.broker && errors.broker}
                              name="broker"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={catalogueDetails.broker}
                              variant="outlined"
                              size='small'
                              id="broker"
                            >
                              <MenuItem value={'0'}>
                                ---Select Broker---
                              </MenuItem>
                              {generateDropDownMenu(brokers)}
                            </TextField>
                          </Grid>



                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                onClick={() => trackPromise(GetDetails())}
                                size='small'
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                        <br />

                        <Box minWidth={1050}>
                          {catalogueData.length > 0 ? (
                            <MaterialTable
                              title="Multiple Actions Preview"
                              columns={[

                                { title: 'Invoice No ', field: 'invoiceNo' },
                                { title: 'Date', field: 'sellingDate' },
                                {
                                  title: 'Selling Mark',
                                  field: 'sellingMarkName'
                                },
                                { title: 'Grade ', field: 'gradeName' },
                                { title: 'Broker ', field: 'brokerName' },
                                { title: 'Gross Qty (KG)', field: 'grossQuantity' },
                                {
                                  title: 'Net Qty (KG) ',
                                  field: 'netQuantity'
                                }
                              ]}
                              data={catalogueData}
                              options={{
                                exportButton: false,
                                showTitle: false,
                                headerStyle: {
                                  textAlign: 'left',
                                  height: '1%'
                                },
                                cellStyle: { textAlign: 'left' },
                                columnResizable: false,
                                actionsColumnIndex: -1
                              }}
                            />
                          ) : null}
                        </Box>
                      </CardContent>
                      <Box>
                        {catalogueData.length > 0 ? (
                          <CardContent>
                            <Grid container md={12} spacing={2} style={{ marginTop: '1rem', justifyContent: 'end' }}>

                              <Grid item md={2} xs={12}>
                                <InputLabel><b>Main Grade Qty (Kg)</b></InputLabel>
                              </Grid>
                              <Grid item md={2} xs={12}>
                                <InputLabel > {": " + catalogueData.filter(x => x.gradeCategoryID === 1)
                                  .reduce((totalDebit, item) => totalDebit + item.netQuantity, 0).toFixed(2)} </InputLabel>
                              </Grid>
                            </Grid>
                            <br />
                            <Grid container md={12} spacing={2} style={{ marginTop: '1rem', justifyContent: 'end' }}>

                              <Grid item md={2} xs={12}>
                                <InputLabel><b>Off Grade Qty (Kg)</b></InputLabel>
                              </Grid>
                              <Grid item md={2} xs={12}>
                                <InputLabel > {": " + catalogueData.filter(x => x.gradeCategoryID === 2)
                                  .reduce((totalDebit, item) => totalDebit + item.netQuantity, 0).toFixed(2)} </InputLabel>
                              </Grid>
                            </Grid>
                            <br />
                            <Grid container md={12} spacing={2} style={{ marginTop: '1rem', justifyContent: 'end' }}>

                              <Grid item md={2} xs={12}>
                                <InputLabel><b>Total Catalogue Qty (Kg)</b></InputLabel>
                              </Grid>
                              <Grid item md={2} xs={12}>
                                <InputLabel > {": " + totalMainGrade()} </InputLabel>
                              </Grid>
                            </Grid>
                            <br />
                          </CardContent>
                        ) : null}
                      </Box>

                      {catalogueData.length > 0 ? (
                        <Box display="flex" justifyContent="flex-end" p={2}>
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
                          <div>&nbsp;</div>
                          <ReactToPrint
                            documentTitle={'Caralogue'}
                            trigger={() => (
                              <Button
                                color="primary"
                                id="btnCancel"
                                variant="contained"
                                style={{ marginRight: '1rem' }}
                                className={classes.colorCancel}
                                size='small'
                              >
                                PDF
                              </Button>
                            )}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF
                              ref={componentRef}
                              totalGrade={totalGrade}
                              catalogueData={catalogueData}
                              searchData={selectedSearchValues}
                            />
                          </div>
                        </Box>
                      ) : null}
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

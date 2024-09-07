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
  InputLabel,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import { useAlert } from "react-alert";
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import data from 'src/views/customer/CustomerListView/data';
import { object } from 'prop-types';

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

const screenCode = 'MOBILELEAFDETAILSREPORT';

export default function MobileLeafDetailsReport(props) {
  const [title, setTitle] = useState("Mobile Leaf Details Report")
  const classes = useStyles();
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(0);
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [leafDetails, setLeafDetails] = useState([]);
  const [mobileLeafDetails, setMobileLeafDetails] = useState({
    groupID: '0',
    factoryID: '0',
    selectedDate: ''
  })
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: '0',
    factoryName: '0',
    date: '',
  })
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [csvHeaders, SetCsvHeaders] = useState([])
  const componentRef = useRef();

  const navigate = useNavigate();
  const alert = useAlert();
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [mobileLeafDetails.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWMOBILELEAFDETAILSREPORT');

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

    setMobileLeafDetails({
      ...mobileLeafDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(mobileLeafDetails.groupID);
    setFactories(factory);
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

  async function GetDetails() {
    let model = {
      groupID: parseInt(mobileLeafDetails.groupID),
      factoryID: parseInt(mobileLeafDetails.factoryID),
      selectedDate: moment(selectedDate.toString()).format().split('T')[0],
    }
    getSelectedDropDownValuesForReport(model);
    const response = await services.GetMobileLeafDetails(model)
    if (response.statusCode == 'Success' && response.data != null) {
      setLeafDetails(response.data);
      if (response.data.length == 0) {
        alert.error("No records to display");
      }
    } else {
      alert.error(response.message);
    }
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
    setMobileLeafDetails({
      ...mobileLeafDetails,
      [e.target.name]: value
    });

    clearTable()
  }

  function handleDateChange(value) {
    setMobileLeafDetails({
      ...mobileLeafDetails,
      date: value
    });
  }

  function getSelectedDropDownValuesForReport(searchDetails) {
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: groups[searchDetails.groupID],
      factoryName: factories[searchDetails.factoryID],
      date: searchDetails.selectedDate
    })
  }

  function clearTable() {

  }

  async function createFile() {
    var file = await createDatForExcel(leafDetails)
    var settings = {
      sheetName: 'Mobile Leaf Detail Report',
      fileName: 'Mobile Leaf Detail Report ' + ' - ' + selectedSearchValues.factoryName + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.date,
      writeOptions: {}
    }

    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem })
    })

    let dataA = [
      {
        sheet: 'Mobile Leaf Detail Report',
        columns: tempcsvHeaders,
        content: file
      }
    ]
    xlsx(dataA, settings)
  }

  async function createDatForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {
          RegistrationNo: x.registrationNumber,
          SupplierName: x.supplierName,
          RouteName: x.routeName,
          CollectionType: x.collectionTypeName,
          Amount: x.netAmount
        }
        res.push(vr);
      });
    }
    return res;
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: mobileLeafDetails.groupID,
              factoryID: mobileLeafDetails.factoryID,
              selectedDate: selectedDate
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                selectedDate: Yup.date().required('Date is required'),
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
                              size='small'
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={mobileLeafDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}

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
                              size='small'
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={mobileLeafDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}

                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="selectedDate">
                              Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.selectedDate && errors.selectedDate)}
                                helperText={touched.selectedDate && errors.selectedDate}
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="selectedDate"
                                id="selectedDate"
                                value={selectedDate}
                                maxDate={new Date()}
                                onChange={(e) => {
                                  setSelectedDate(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <Grid container justify="flex-end">
                            <Box pr={2}>
                              <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                size='small'
                              >
                                Search
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                        <br /><br />

                        <Box minWidth={1000}>
                          {leafDetails.length > 0 ?
                            <TableContainer component={Paper}>
                              <Table aria-label='caption table'>
                                <TableHead>
                                  <TableRow>
                                    <TableCell align={'center'}>Reg No</TableCell>
                                    <TableCell align={'center'}>Supplier Name</TableCell>
                                    <TableCell align={'center'}>Route Name</TableCell>
                                    <TableCell align={'center'}>Collection Type</TableCell>
                                    <TableCell align={'center'}>Amount(kg)</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {leafDetails.slice(page * limit, page * limit + limit).map((data, index) => (
                                    <TableRow key={index}>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>{data.registrationNumber}</TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>{data.supplierName}</TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>{data.routeName}</TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>{data.collectionTypeName}</TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>{data.netAmount.toFixed(1)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              <TablePagination
                                component="div"
                                count={leafDetails.length}
                                onChangePage={handlePageChange}
                                onChangeRowsPerPage={handleLimitChange}
                                page={page}
                                rowsPerPage={limit}
                                rowsPerPageOptions={[5, 10, 25]}
                              />
                            </TableContainer> : null
                          }
                        </Box>
                      </CardContent>

                      {leafDetails.length > 0 ?
                        <Box display='flex' justifyContent='flex-end' p={2}>
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
                            documentTitle={"Mobile Leaf Detail Report"}
                            trigger={() => <Button
                              color="primary"
                              id="btnCancel"
                              variant="contained"
                              style={{ marginRight: '1rem' }}
                              className={classes.colorCancel}
                            >
                              PDF
                            </Button>}
                            content={() => componentRef.current}
                          />
                          <div hidden={true}>
                            <CreatePDF
                              ref={componentRef}
                              leafDetails={leafDetails}
                              selectedSearchValues={selectedSearchValues}
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
  )

}

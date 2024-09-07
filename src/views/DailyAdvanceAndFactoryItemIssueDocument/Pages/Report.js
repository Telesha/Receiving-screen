import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,Paper,Chip,
  TablePagination
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { useNavigate} from 'react-router-dom';
import { useAlert } from "react-alert";
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import moment from 'moment';
import { LoadingComponent } from '../../../utils/newLoader';

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

const screenCode = 'DAILYADVANCEANDFACTORYITEMISSUEDOCUMENT';

export default function DailyAdvanceAndFactoryItemIssueDocument1(props) {
  const [title, setTitle] = useState("Daily Advance and factory item issue Document");
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [GroupList, setGroupList] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isTableHide, setIsTableHide] = useState(false);
  const [FactoryList, setFactoryList] = useState([]);
  const [routeList, setRouteList] = useState();
  const [itemRequestDetail, setItemRequestDetail] = useState({
    groupID: 0,
    factoryID: 0,
    routeID: 0,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date().toISOString().substring(0, 10)
  });
  
  const [factoryItemList, setFactoryItemList] = useState([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    routeName:"0",
    startDate: '',
    endDate: ''
  });

  const [routeSummaryTotal, setRouteSummaryTotal] = useState({
    approvedQuantity: 0,
    approvedAmount:0,

  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };


  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const [csvHeaders, SetCsvHeaders] = useState([]);

  useEffect(() => {
    trackPromise(
      getPermission()
    );
    trackPromise(
      getGroupsForDropdown(),
    );
  }, []);

  useEffect(() => {
    setIsTableHide(false);
  }, [itemRequestDetail.divisionID, itemRequestDetail.routeID, itemRequestDetail.month, itemRequestDetail.year]);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [itemRequestDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getRoutesByFactoryID());
  }, [itemRequestDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWDAILYADVANCEANDFACTORYITEMISSUEDOCUMENT');

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

    setItemRequestDetail({
      ...itemRequestDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(itemRequestDetail.groupID);
    setFactoryList(factories);
  }

  async function getRoutesByFactoryID() {
    const routes = await services.getRoutesForDropDown(itemRequestDetail.factoryID);
    setRouteList(routes);
  }

async function GetFactoryItemDetails() {
  let model = {
      groupID: parseInt(itemRequestDetail.groupID),
      factoryID: parseInt(itemRequestDetail.factoryID),
      routeID: parseInt(itemRequestDetail.routeID),
      startDate: moment(itemRequestDetail.startDate.toString()).format().split('T')[0],
      endDate: moment(itemRequestDetail.endDate.toString()).format().split('T')[0],
  };
  getSelectedDropdownValuesForReport(model);

  const itemData = await services.GetDailyAdvanceAndFactoryItemDetailsForReport(model);

  const processedData = itemData.data.map(data => ({
      ...data,
      approvedAmount: data.approvedAmount !== null || 'NAN' || 0.00 ? data.approvedAmount : '-',
      itemName: data.itemName !== null ? data.itemName : '-',
      measuringUnitName: data.measuringUnitName !== null ? data.measuringUnitName : '-',
  }));

  const filteredData = processedData.filter(data => data.itemName !== '-' || data.approvedAmount !== '-' || data.approvedQuantity !== '-');
  if (itemData.statusCode == "Success" && filteredData.length > 0) {
      const uniqueData = filteredData.reduce((acc, current) => {
          const x = acc.find(item => item.issuingDate === current.issuingDate && item.itemName === current.itemName && item.approvedAmount === current.approvedAmount&& item.approvedQuantity === current.approvedQuantity);
          if (!x) {
              return acc.concat([current]);
          } else {
              return acc;
          }
      }, []);
      uniqueData.sort((a, b) => new Date(b.issuingDate) - new Date(a.issuingDate));

      setFactoryItemList(uniqueData);
      calTotal(uniqueData);
      createDataForExcel(uniqueData);
      setIsTableHide(true);
  } else {
      if (filteredData.length == 0) {
          alert.error("No records to display");
      } else {
          alert.error(itemData.message);
      }
  }
}
  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
      array.map(x => {
        var vr = {         
          'Issue Date': x.issuingDate.split('T')[0],
          'Supplier Name': x.supplierName,
          'Reg No': x.registrationNumber,        
          'Advanced': x.approvedAmount,
          'Item': x.itemName,
          'Measuring Unit': x.measuringUnitName,
          'Quantity': x.approvedQuantity,
          'Siganture':"" ,
        }
        res.push(vr);
      });
      res.push({});
      var vr = {
        'Issue Date': 'Group : ' + selectedSearchValues.groupName,
        'Advanced': 'Estate : ' + selectedSearchValues.factoryName,
        'Item': 'Route : ' + selectedSearchValues.routeName,
      };
      res.push(vr);

      var vr = {
        'Measuring Unit': 'Start Date : ' + selectedSearchValues.startDate,
        'Siganture': 'End Date : ' + selectedSearchValues.endDate,
      };
      res.push(vr);

      var vr = {
        'Reg No': 'Supplier count : ' + uniqueRegistrationNumbers.size,
        'Advanced': 'Total amount : ' + totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        'Quantity': 'Total quantity: ' + routeSummaryTotal.approvedQuantity,
      };
      res.push(vr);
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(factoryItemList); 
    var fileName = 'Daily Advance and factory item issue Document ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName + '  ' + selectedSearchValues.startDate + ' - ' + selectedSearchValues.endDate;
    var sheetName = 'Daily Advance and factory item issue Document';
    if (sheetName.length > 31) {
      sheetName = sheetName.substring(0, 31);
    }
  
    var settings = {
      sheetName: sheetName,
      fileName: fileName,
      writeOptions: {}
    }
  
    let keys = Object.keys(file[0]);
    let tempcsvHeaders = [...csvHeaders]; 
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });
  
    let dataA = [
      {
        sheet: sheetName,
        columns: tempcsvHeaders,
        content: file
      }
    ];
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
    setItemRequestDetail({
      ...itemRequestDetail,
      [e.target.name]: value
    });
    setFactoryItemList([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(searchForm.startDate.toString()).format().split('T')[0]
    var endDate = moment(searchForm.endDate.toString()).format().split('T')[0]
    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
      routeName: routeList[searchForm.routeID],
      startDate: [startDate],
      endDate: [endDate]
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

  function calTotal(data) {
    let qtySum = 0;
    let amtsum = 0;
    data.forEach(element => {
      qtySum += (element.approvedQuantity);
      amtsum+=(element.approvedAmount)
    });
    setRouteSummaryTotal({
      ...routeSummaryTotal,
      approvedQuantity: qtySum,
      approvedAmount:amtsum
    });

  }

  const lastDay = new Date().toISOString().split('T')[0];

  const totalAmount = factoryItemList.reduce((sum, item) => {
      return sum + (item.approvedAmount ? parseFloat(item.approvedAmount) : 0);
    }, 0);

  const uniqueRegistrationNumbers = new Set(
    factoryItemList.map(item => item.registrationNumber)
   );

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: itemRequestDetail.groupID,
              factoryID: itemRequestDetail.factoryID,
              startDate: itemRequestDetail.startDate,
              endDate: itemRequestDetail.endDate
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                startDate: Yup.string(),
                endDate: Yup.string(),
              })
            }
            onSubmit={() => trackPromise(GetFactoryItemDetails())}
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
                              value={itemRequestDetail.groupID}
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
                              value={itemRequestDetail.factoryID}
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
                              value={itemRequestDetail.routeID}
                              variant="outlined"
                              id="routeID"
                              size = 'small'
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routeList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="startDate">
                              From Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="startDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              inputProps={{
                                max: lastDay
                              }}
                              value={itemRequestDetail.startDate}
                              variant="outlined"
                              id="startDate"
                              size='small'
                            />
                        </Grid>
                        <Grid item md={3} xs={12}>
                            <InputLabel shrink id="endDate">
                              To Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="endDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              inputProps={{
                                max: lastDay
                              }}
                              value={itemRequestDetail.endDate}
                              variant="outlined"
                              id="endDate"
                              size='small'                             
                            />
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

                      <Box minWidth={1050}>
                          {factoryItemList.length > 0 && isTableHide ?
                            <TableContainer component={Paper}>
                            <br />
                                <div style={{ width: '8px' }}>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    {(() => {
                                      
                                      return (
                                        <>
                                          <Chip
                                            label={"Supplier count: " + uniqueRegistrationNumbers.size}
                                            color="primary"
                                            variant="outlined"
                                          />
                                         <Chip label={"Total amount: " + totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} color="primary" variant="outlined" />
                                         <Chip
                                            label={"Total quantity: " + routeSummaryTotal.approvedQuantity}
                                            color="primary"
                                            variant="outlined"
                                          />
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                                <br />
                            
                              <Table className={classes.table} aria-label="simple table">
                                <TableHead>
                                  <TableRow style={{ border: "2px solid black" }}>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Issue Date</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Supplier Name</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Reg No</TableCell>
                                    <TableCell align="right" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Advance Amount</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Item Name</TableCell>
                                    <TableCell align="left" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Measuring Unit (L/KG)</TableCell>
                                    <TableCell align="center" style={{ fontWeight: "bold", border: "2px solid black", fontSize: '16px' }}>Quantity</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {factoryItemList
                                    .sort((a, b) => {
                                      if (a.issuingDate === b.issuingDate) {
                                        return a.registrationNumber.localeCompare(b.registrationNumber);
                                      }
                                      return new Date(a.issuingDate) - new Date(b.issuingDate);
                                    })
                                    .slice(page * limit, page * limit + limit)
                                    .map((row, i) => (
                                      <TableRow style={{ border: "2px solid black" }} key={i}>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}>{row.issuingDate.split('T')[0]}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}>{row.supplierName}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}>{row.registrationNumber}</TableCell>
                                        <TableCell component="th" scope="row" align="right" style={{ border: "2px solid black" }}>
                                          {row.approvedAmount !== null ? Number(row.approvedAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                        </TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}>{row.itemName}</TableCell>
                                        <TableCell component="th" scope="row" align="left" style={{ border: "2px solid black" }}>{row.measuringUnitName}</TableCell>
                                        <TableCell component="th" scope="row" align="center" style={{ border: "2px solid black" }}>{row.approvedQuantity !== null ? row.approvedQuantity : '-'}</TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>

                              <TablePagination
                                component="div"
                                count={factoryItemList.length}
                                onChangePage={handlePageChange}
                                onChangeRowsPerPage={handleLimitChange}
                                page={page}
                                rowsPerPage={limit}
                                rowsPerPageOptions={[5, 10, 25]}
                              />
                            </TableContainer>
                            : null}
                        </Box>
                    </CardContent>
                      {factoryItemList.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            type="submit"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={() => createFile()}
                            size = 'small'
                          >
                            EXCEL
                          </Button>
                          <ReactToPrint
                            documentTitle={"Daily Advance and factory item issue Document"}
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
                              factoryItemList={factoryItemList} searchData={selectedSearchValues} 
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


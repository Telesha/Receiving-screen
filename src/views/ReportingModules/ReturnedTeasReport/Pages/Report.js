import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader
  , Table, TableContainer, TableBody, TableCell, TableHead, TableRow, MenuItem, TablePagination,
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
import xlsx from 'json-as-xlsx';
import ReactToPrint from "react-to-print";
import CreatePDF from './CreatePDF';
import { LoadingComponent } from './../../../../utils/newLoader';
import CountUp from 'react-countup';

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

const screenCode = 'RETURNEDTEASREPORT';

export default function ReturnedTeasReport(props) {
  const [title, setTitle] = useState("Returned Teas Report");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [returnedTeasDetail, setReturnedTeasDetail] = useState({
    groupID: 0,
    factoryID: 0,
    fromDate: new Date().toISOString().substring(0, 10),
    toDate: new Date().toISOString().substring(0, 10)
  });
  const [returnedTeasList, setReturnedTeasList] = useState([]);
  const [total, setTotals] = useState({});
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupName: "0",
    factoryName: "0",
    fromdate: "",
    todate: ""
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    trackPromise(
      getPermission());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [returnedTeasDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWRETURNEDTEASREPORT');

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

    setReturnedTeasDetail({
      ...returnedTeasDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
    trackPromise(getGroupsForDropdown());
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(returnedTeasDetail.groupID);
    setFactoryList(factories);
  }

  async function GetNotSupplyDebtList() {
    let model = {
      groupID: parseInt(returnedTeasDetail.groupID),
      factoryID: parseInt(returnedTeasDetail.factoryID),
      fromDate: (returnedTeasDetail.fromDate),
      toDate: (returnedTeasDetail.toDate),
    }
    const response = await services.GetReturnedTeasList(model);
    if (response.statusCode == 'Success') {
      if (response.data.length == 0) {
        alert.error("No Records to display")
      }
      let bagTotal = 0;
      let grossWtTotal = 0;
      let netWtTotal = 0;
      let proceedsTotal = 0;
      response.data.forEach((x) => {
        x.returnDate = x.returnDate.split('T')[0]
        x.dateofDispatched = x.dateofDispatched.split('T')[0]
        x.soldDate == null ? x.soldDate = '-' : x.soldDate = x.soldDate.split('T')[0]
        x.proceeds = x.price * x.returnedNetWeight
        x.grossWeight = x.returnedNetWeight + x.sampleAllowance
        bagTotal += x.noOfPacks
        grossWtTotal += x.returnedNetWeight + x.sampleAllowance
        netWtTotal += x.returnedNetWeight
        proceedsTotal += x.price * x.returnedNetWeight
      }
      )
      setTotals({
        bagTotal: bagTotal,
        grossWtTotal: grossWtTotal.toFixed(2),
        netWtTotal: netWtTotal.toFixed(2),
        proceedsTotal: proceedsTotal.toFixed(2)
      })
      setReturnedTeasList(response.data)
      getSelectedDropdownValuesForReport(model);
      createDataForExcel(response.data)
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
          ReturnDate: x.returnDate,
          DispatchDate: x.dateofDispatched,
          ReturnFrom: x.returnFromID,
          ReturnTo: x.returnToID,
          InvoiceNo: x.invoiceNo,
          SellingMark: x.sellingMarkName,
          Grade: x.gradeName,
          BagWt: x.packWeight,
          Bags: x.noOfPacks,
          GrossWt: x.grossWeight,
          NetWt: x.returnedNetWeight,
          SoldDate: x.soldDate,
          SoldNo: x.salesNumber,
          LotNo: x.lotNumber,
          Price: x.price,
          Proceeds: x.proceeds,
          Broker: x.brokerName,
          Buyer: x.buyerName
        };
        res.push(vr);
      });
      res.push({});
      var totals = {
        'Bags': total.bagTotal,
        'GrossWt': total.grossWtTotal,
        'NetWt': total.netWtTotal,
        'Proceeds': total.proceedsTotal
      };
      res.push(totals);
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(returnedTeasList);

    var settings = {
      sheetName: 'Returned Teas Report',
      fileName: 'Returned Teas Report - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName,
      writeOptions: {}
    }
    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });
    let dataA = [
      {
        sheet: 'Returned Teas Report',
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
    setReturnedTeasDetail({
      ...returnedTeasDetail,
      [e.target.name]: value
    });
    setReturnedTeasList([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {

    setSelectedSearchValues({
      ...selectedSearchValues,
      groupName: GroupList[searchForm.groupID],
      factoryName: FactoryList[searchForm.factoryID],
      fromdate: searchForm.fromDate,
      todate: searchForm.toDate
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
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: returnedTeasDetail.groupID,
              factoryID: returnedTeasDetail.factoryID,
              fromDate: returnedTeasDetail.fromDate,
              toDate: returnedTeasDetail.toDate
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                fromDate: Yup.string(),
                toDate: Yup.string(),
              })
            }
            onSubmit={() => trackPromise(GetNotSupplyDebtList())}
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
                              value={returnedTeasDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'
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
                              value={returnedTeasDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="fromDate">
                              From Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="fromDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={returnedTeasDetail.fromDate}
                              variant="outlined"
                              id="fromDate"
                              size='small'
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="toDate">
                              To Date *
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="toDate"
                              type='date'
                              onChange={(e) => handleChange(e)}
                              value={returnedTeasDetail.toDate}
                              variant="outlined"
                              id="toDate"
                              size='small'
                            />
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            size='small'
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box>
                        {returnedTeasList.length > 0 ?
                          <TableContainer >
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align={'left'}>Return Date</TableCell>
                                  <TableCell align={'left'}>Dispatch Date</TableCell>
                                  <TableCell align={'left'}>Return From</TableCell>
                                  <TableCell align={'left'}>Return To</TableCell>
                                  <TableCell align={'left'}>Invoice No</TableCell>
                                  <TableCell align={'left'}>Selling Mark</TableCell>
                                  <TableCell align={'left'}>Grade</TableCell>
                                  <TableCell align={'left'}>Bag Wt(Kg)</TableCell>
                                  <TableCell align={'left'}>Bags</TableCell>
                                  <TableCell align={'left'}>Gross Wt(Kg)</TableCell>
                                  <TableCell align={'left'}>Net Wt(Kg)</TableCell>
                                  <TableCell align={'left'}>Sold Date</TableCell>
                                  <TableCell align={'left'}>Sold No</TableCell>
                                  <TableCell align={'left'}>Lot No</TableCell>
                                  <TableCell align={'left'}>Price (Rs)</TableCell>
                                  <TableCell align={'left'}>Proceeds (Rs)</TableCell>
                                  <TableCell align={'left'}>Broker</TableCell>
                                  <TableCell align={'left'}>Buyer</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {returnedTeasList.slice(page * limit, page * limit + limit).map((data, index) => (
                                  <TableRow key={index}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.returnDate}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.dateofDispatched}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.returnFromID}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.returnToID}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.invoiceNo}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.sellingMarkName}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.gradeName}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.packWeight}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.noOfPacks}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.grossWeight}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.returnedNetWeight}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.soldDate}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.salesNumber}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.lotNumber}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.price}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.proceeds}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.brokerName}
                                    </TableCell>
                                    <TableCell align={'left'} component="th" scope="row">
                                      {data.buyerName}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableRow style={{ background: '#AFE1AF' }}>
                                <TableCell align={'left'} colSpan={8} component="th" scope="row" style={{ borderBottom: 'none', fontWeight: 'bold' }} >
                                  Grand Total
                                </TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: 'none', fontWeight: 'bold' }}>
                                  {total.bagTotal}
                                </TableCell>
                                <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: 'none', fontWeight: 'bold' }}>
                                  <CountUp
                                    end={total.grossWtTotal}
                                    decimals={2}
                                    separator=','
                                    decimal="."
                                    duration={0.1}
                                  />
                                </TableCell>  <TableCell align={'left'} colSpan={5} component="th" scope="row" style={{ borderBottom: 'none', fontWeight: 'bold' }}>
                                  <CountUp
                                    end={total.netWtTotal}
                                    decimals={2}
                                    separator=','
                                    decimal="."
                                    duration={0.1}
                                  />
                                </TableCell>  <TableCell align={'left'} component="th" scope="row" style={{ borderBottom: 'none', fontWeight: 'bold' }}>
                                  <CountUp
                                    end={total.proceedsTotal}
                                    decimals={2}
                                    separator=','
                                    decimal="."
                                    duration={0.1}
                                  />
                                </TableCell><TableCell align={'left'} colSpan={2} component="th" scope="row" style={{ borderBottom: 'none', fontWeight: 'bold' }}>
                                </TableCell>
                              </TableRow>
                            </Table>
                          </TableContainer >
                          : null}
                      </Box>
                      {returnedTeasList.length > 0 ?
                        <TablePagination
                          component="div"
                          count={returnedTeasList.length}
                          onChangePage={handlePageChange}
                          onChangeRowsPerPage={handleLimitChange}
                          page={page}
                          rowsPerPage={limit}
                          rowsPerPageOptions={[5, 10, 25]}
                        />
                        : null}
                      {
                        returnedTeasList.length > 0 ?
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
                            <ReactToPrint
                              documentTitle={"Returned Teas Report"}
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
                                returnedTeasList={returnedTeasList} searchData={selectedSearchValues}
                                totals={total}
                              />
                            </div>
                          </Box> : null
                      }
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment >
  );
}

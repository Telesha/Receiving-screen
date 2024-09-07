import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
} from '@material-ui/core';
import MaterialTable from "material-table";
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik } from 'formik';
import * as Yup from "yup";
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "react-alert";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import ReactToPrint from "react-to-print";
import xlsx from 'json-as-xlsx';
import CreatePDF from './CreatePDF';
import { LoadingComponent } from 'src/utils/newLoader';

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

const screenCode = 'SUPPLIERWISEGRNITEMDETAIL';

export default function FactoryCropComparisonMonthlyReport(props) {
  const [title, setTitle] = useState("Supplier Wise GRN Item Detail Report");
  const classes = useStyles();
  const [groupList, setGroupList] = useState([]);
  const [factoryList, setFactoryList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [supplierGrnDetail, setSupplierGrnDetail] = useState({
    groupID: 0,
    factoryID: 0,
    supplierID: '0'
  });
  const [fromDate, handleFromDate] = useState(new Date());
  const [toDate, handleToDate] = useState(new Date());
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [supplierWiseGrnItemDetails, setSupplierWiseGrnItemDetails] = useState([]);
  const navigate = useNavigate();
  const alert = useAlert();
  const componentRef = useRef();
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    factoryName: "0",
    groupName: "0"
})

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [supplierGrnDetail.groupID]);

  useEffect(() => {
    trackPromise(
      getSupplierForDropdown());
  }, [supplierGrnDetail.factoryID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSUPPLIERWISEGRNITEMDETAIL');

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

    setSupplierGrnDetail({
      ...supplierGrnDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken()),
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(supplierGrnDetail.groupID);
    setFactoryList(factories);
  }

  async function getSupplierForDropdown() {
    const suppliers = await services.getSuppliersByGroupIDFactoryID(supplierGrnDetail.groupID, supplierGrnDetail.factoryID);
    setSupplierList(suppliers);
  }

  async function GetSupplierGrnItemDetails() {
    let model = {
      groupID: parseInt(supplierGrnDetail.groupID),
      factoryID: parseInt(supplierGrnDetail.factoryID),
      supplierID: parseInt(supplierGrnDetail.supplierID),
      toDate:  moment(toDate).format('').split('T')[0],
      fromDate: moment(fromDate).format('').split('T')[0]
     }


     getSelectedDropdownValuesForReport(model);

    if (toDate == null) {
      alert.error("To Date is required");
    } else if (fromDate == null) {
      alert.error("From Date is required");
    } else {
      if (fromDate > toDate) {
        alert.error("Selected months are incorrect");
      } else {
        const response = await services.GetSupplierGrnItemDetails(model)

        if (response.statusCode == "Success" && response.data != null) {
          setSupplierWiseGrnItemDetails(response.data);
          if (response.data.length == 0) {
            alert.error("No records to display");
          }
        }
        else {
          alert.error(response.message);
        }
      }
    }

  }

  async function createDataForExcel(array) {
    var res = [];
    if (array != null) {
        array.map(x => {
            var vr = {
                'Supplier Name': x.supplierName,
                'Item catogory': x.itemCatogory,
                'Item': x.item,
                'PO number': x.purchaseOrderNumber,
                'Invoice number': x.invoiceNumber,
                'Invoice date': x.invoiceDate.split('T')[0],
                'Item receive date': x.itemReceivedDate.split('T')[0],
                'Quantity': x.quantity,
                'Unit price': x.unitPrice,
            }
            res.push(vr);
        });
    }
    return res;
}

  async function createFile() {
    var file = await createDataForExcel(supplierWiseGrnItemDetails);
    var settings = {
        sheetName: 'Supplier Wise GRN Item Detail Report',
        fileName: 'Supplier Wise GRN Item Detail Report  ' + ' - ' + selectedSearchValues.groupName + ' - ' + selectedSearchValues.factoryName
        + ' - ' + moment(fromDate).format('').split('T')[0] + ' - ' + moment(toDate).format('').split('T')[0],
        writeOptions: {}
    }
    let keys = Object.keys(file[0])
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
        tempcsvHeaders.push({ label: sitem, value: sitem })
    })
    let dataA = [
        {
            sheet: 'Stock View Report',
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
    setSupplierGrnDetail({
      ...supplierGrnDetail,
      [e.target.name]: value
    });
    clearTable()
  }

  function clearTable() {
    setSupplierWiseGrnItemDetails([]);
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

  function getSelectedDropdownValuesForReport(searchForm) {
    setSelectedSearchValues({
        ...selectedSearchValues,
        factoryName: factoryList[searchForm.factoryID],
        groupName: groupList[searchForm.groupID]
    })
}

  return (
    <Fragment>
       <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: supplierGrnDetail.groupID,
              factoryID: supplierGrnDetail.factoryID,
              supplierID: supplierGrnDetail.supplierID
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required')
              })
            }
            onSubmit={() => trackPromise(GetSupplierGrnItemDetails())}
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
                          <Grid item md={4} xs={8}>
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
                              value={supplierGrnDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              disabled={!permissionList.isGroupFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groupList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
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
                              value={supplierGrnDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                              size='small'
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(factoryList)}
                            </TextField>
                          </Grid>

                          <Grid item md={4} xs={8}>
                            <InputLabel shrink id="supplierID">
                              Supplier
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="supplierID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={supplierGrnDetail.supplierID}
                              variant="outlined"
                              id="supplierID"
                              size='small'
                            >
                              <MenuItem value="0">--Select Supplier--</MenuItem>
                              {generateDropDownMenu(supplierList)}
                            </TextField>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fromDate">
                              From Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="fromDate"
                                value={fromDate}
                                maxDate={new Date()}
                                onChange={(e) => {
                                  handleFromDate(e);
                                  clearTable();
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                size='small'
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="toDate">
                              To Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                id="toDate"
                                value={toDate}
                                maxDate={new Date()}
                                onChange={(e) => {
                                  handleToDate(e);
                                  clearTable();
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
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
                          >
                            Search
                          </Button>
                        </Box>
                      </CardContent>
                      <Box minWidth={1050}>
                        {supplierWiseGrnItemDetails.length > 0 ?
                          <Grid item md={12} xs={12}>
                            <MaterialTable
                              title="Multiple Actions Preview"
                              columns={[
                                { title: 'Supplier Name', field: 'supplierName' },
                                { title: 'Item catogory', field: 'itemCatogory' },
                                { title: 'Item', field: 'item' },
                                { title: 'PO number', field: 'purchaseOrderNumber' },
                                { title: 'Invoice number', field: 'invoiceNumber' },
                                {
                                  title: 'Invoice date', render: rowData => {
                                    if (rowData.invoiceDate != null) return rowData.invoiceDate.split('T')[0]
                                  }
                                },
                                {
                                  title: 'Item receive date', render: rowData => {
                                    if (rowData.itemReceivedDate != null) return rowData.itemReceivedDate.split('T')[0]
                                  }
                                },
                                { title: 'Quantity', field: 'quantity' },
                                { title: 'Unit price', field: 'unitPrice' }
                              ]}
                              data={supplierWiseGrnItemDetails}
                              options={{
                                exportButton: false,

                                showTitle: false,
                                headerStyle: { textAlign: "left", height: '1%' },
                                cellStyle: { textAlign: "left" },
                                columnResizable: false,
                                actionsColumnIndex: -1,
                                pageSize: 10,
                              }}
                            />
                          </Grid> : null}
                      </Box>
                      {supplierWiseGrnItemDetails.length > 0 ?
                        <Box display="flex" justifyContent="flex-end" p={2}>
                          <Button
                            color="primary"
                            id="btnRecord"
                            variant="contained"
                            style={{ marginRight: '1rem' }}
                            className={classes.colorRecord}
                            onClick={createFile}
                          >
                            EXCEL
                          </Button>
                          <div>&nbsp;</div>
                          <ReactToPrint
                            documentTitle={"Supplier Wise GRN Item Detail Report"}
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
                            <CreatePDF ref={componentRef} supplierWiseGrnItemDetails={supplierWiseGrnItemDetails}
                              SearchData={selectedSearchValues} supplierGrnDetail={supplierGrnDetail} fromDate={fromDate} toDate={toDate} />
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

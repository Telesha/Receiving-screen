import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Button,
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
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  Tooltip,
  IconButton
} from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import { LoadingComponent } from './../../../utils/newLoader';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import EditIcon from '@material-ui/icons/Edit';

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
  }
}));

const screenCode = 'BROKERSTOCK';

export default function BrokerListing() {
  const [title, setTitle] = useState("Broker Stock");
  const classes = useStyles();
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [brokerRequestDetail, setBrokerRequestDetail] = useState({
    groupID: 0,
    factoryID: 0,
    dispatchDate: new Date(),
    brokerId: 0,
    sellingMarksID: 0,
    invoiceNumber: 0
  });
  const [brokerList, setBrokerList] = useState([]);
  const [sellingMarks, setSellingMarks] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState([]);
  const [brokers, setBrokers] = useState();
  const [tableData, setTableData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const navigate = useNavigate();
  let encrypted = "";
  const handleClick = () => {
    encrypted = btoa('0');
    navigate('/app/brokerStock/addEdit/' + encrypted);
  }

  const handleClickEdit = (brokerStockID) => {
    encrypted = btoa(brokerStockID.toString());
    navigate('/app/brokerStock/addEdit/' + encrypted);
  }

  useEffect(() => {
    trackPromise(
      getPermission());
    trackPromise(
      getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(
      getFactoriesForDropdown());
  }, [brokerRequestDetail.groupID]);

  useEffect(() => {
    if (brokerRequestDetail.factoryID != null) {
      GetSellingMarkForDropdown()
      GetBrokersForDropdown()
    }
  }, [brokerRequestDetail.factoryID]);

  useEffect(() => {
    if ((brokerRequestDetail.factoryID != null) &&
      (brokerRequestDetail.dispatchDate != null) &&
      (brokerRequestDetail.brokerId != null)) {
      GetInvoiceNumbersForDropdown()
    }
  }, [
    brokerRequestDetail.factoryID,
    brokerRequestDetail.dispatchDate,
    brokerRequestDetail.brokerId])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWBROKERSTOCK');

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

    setBrokerRequestDetail({
      ...brokerRequestDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroupList(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoryByGroupID(brokerRequestDetail.groupID);
    setFactoryList(factories);
  }

  async function GetBrokersForDropdown() {
    const brokers = await services.GetBrokerList(brokerRequestDetail.groupID, brokerRequestDetail.factoryID);
    setBrokers(brokers);
  }

  async function GetSellingMarkForDropdown() {
    const sellingMarks = await services.GetSellingMarkList(brokerRequestDetail.groupID, brokerRequestDetail.factoryID);
    setSellingMarks(sellingMarks);
  }

  async function GetInvoiceNumbersForDropdown() {
    let model = {
      groupID: parseInt(brokerRequestDetail.groupID),
      factoryID: parseInt(brokerRequestDetail.factoryID),
      dispatchDate: brokerRequestDetail.dispatchDate,
      brokerID: parseInt(brokerRequestDetail.brokerId)
    };
    const response = await services.GetInvoiceNumbersByBrokerIDDispatchdate(model);
    setInvoiceNumber(response);
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
    setBrokerRequestDetail({
      ...brokerRequestDetail,
      [e.target.name]: value
    });
    setBrokerList([]);
  }

  function handleDateChange(e) {
    setBrokerRequestDetail({
      ...brokerRequestDetail,
      dispatchDate: e
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
            toolTiptitle={"Add Broker Stock"}
          />
        </Grid>
      </Grid>
    )
  }

  async function getData() {
    let searchmodel = {
      groupID: parseInt(brokerRequestDetail.groupID),
      factoryID: parseInt(brokerRequestDetail.factoryID),
      dispatchDate: brokerRequestDetail.dispatchDate,
      brokerId: parseInt(brokerRequestDetail.brokerId),
      sellingMarksID: parseInt(brokerRequestDetail.sellingMarksID),
      invoiceNumber: parseInt(brokerRequestDetail.invoiceNumber)
    }
    const response = await services.GetTableData(searchmodel);
    if (response.length !== 0) {
      setTableData(response);
      setBrokerRequestDetail({
        ...brokerRequestDetail,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken()),
        dispatchDate: new Date(),
        brokerId: 0,
        sellingMarksID: 0,
        invoiceNumber: "0"
      })
    } else {
      setBrokerRequestDetail({
        ...brokerRequestDetail,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken()),
        dispatchDate: new Date(),
        brokerId: 0,
        sellingMarksID: 0,
        invoiceNumber: "0"
      })
      alert.error("No data found");
    }
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: brokerRequestDetail.groupID,
              factoryID: brokerRequestDetail.factoryID,
              dispatchDate: brokerRequestDetail.dispatchDate,
              brokerId: brokerRequestDetail.brokerId,
              sellingMarksID: brokerRequestDetail.sellingMarksID,
              invoiceNumber: brokerRequestDetail.invoiceNumber
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                brokerId: Yup.number().required('Broker is required').min("0", 'Broker is required'),
                dispatchDate: Yup.date().required('Date is required').min("1", 'Date is required'),
                invoiceNumber: Yup.number().required('Invoice Number is required').min("1", 'Invoice Number is required'),
              })
            }
            onSubmit={() => trackPromise(getData())}
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
                              value={brokerRequestDetail.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              disabled={!permissionList.isGroupFilterEnabled}
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
                              value={brokerRequestDetail.factoryID}
                              variant="outlined"
                              size='small'
                              id="factoryID"
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Factory--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="brokerId">
                              Broker Name *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.brokerId && errors.brokerId)}
                              fullWidth
                              helperText={touched.brokerId && errors.brokerId}
                              name="brokerId"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={brokerRequestDetail.brokerId}
                              variant="outlined"
                              id="brokerId"
                              size='small'
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Broker Name--</MenuItem>
                              {generateDropDownMenu(brokers)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="dispatchDate">
                              Dispatch Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.dispatchDate && errors.dispatchDate)}
                                helperText={touched.dispatchDate && errors.dispatchDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="dispatchDate"
                                id="dispatchDate"
                                value={brokerRequestDetail.dispatchDate}
                                onChange={(e) => handleDateChange(e)}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="invoiceNumber">
                              Invoice Number *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.invoiceNumber && errors.invoiceNumber)}
                              fullWidth
                              helperText={touched.invoiceNumber && errors.invoiceNumber}
                              name="invoiceNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={brokerRequestDetail.invoiceNumber}
                              variant="outlined"
                              id="invoiceNumber"
                              size='small'
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Invoice Number--</MenuItem>
                              {generateDropDownMenu(invoiceNumber)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="sellingMarksID">
                              Selling Marks
                            </InputLabel>
                            <TextField select
                              fullWidth
                              helperText={touched.sellingMarksID && errors.sellingMarksID}
                              name="sellingMarksID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={brokerRequestDetail.sellingMarksID}
                              variant="outlined"
                              id="sellingMarksID"
                              size='small'
                              disabled={!permissionList.isGroupFilterEnabled}
                            >
                              <MenuItem value="0">--Select Selling Marks--</MenuItem>
                              {generateDropDownMenu(sellingMarks)}
                            </TextField>
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
                      <Box minWidth={1050}>
                        {tableData.length > 0 ?
                          <TableContainer >
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align={'center'}>Invoice Number</TableCell>
                                  <TableCell align={'center'}>Dispatch Date</TableCell>
                                  <TableCell align={'center'}>Selling Mark</TableCell>
                                  <TableCell align={'center'}>Grade Category</TableCell>
                                  <TableCell align={'center'}>Grade</TableCell>
                                  <TableCell align={'center'}>PKGS</TableCell>
                                  <TableCell align={'center'}>Package Weight</TableCell>
                                  <TableCell align={'center'}>Gross Qty</TableCell>
                                  <TableCell align={'center'}>Stock Qty</TableCell>
                                  <TableCell align={'center'}>Invoice Qty</TableCell>
                                  <TableCell align={'center'}>Broker Qty</TableCell>
                                  <TableCell align={'center'}>Balance To Be Send</TableCell>
                                  <TableCell align={'center'}>Action</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tableData.map((data, brokerStockID) => (
                                  <TableRow key={brokerStockID}>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.invoiceNumber}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.dispatchDate.split('T')[0]}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.sellingMarkName}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.gradeCategoryID === 1 ? "Main Grade" : "Off Grade"}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.gradeName}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.pkgs}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.packageWeight.toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.grossQuantity.toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.stockQuantity.toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.invoiceQuantity.toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.brokerQuantity.toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      {data.balanceToBeSend.toFixed(2)}
                                    </TableCell>
                                    <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                      <IconButton
                                        onClick={() => handleClickEdit(data.brokerStockID)}>
                                        <EditIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          : null}
                      </Box>
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

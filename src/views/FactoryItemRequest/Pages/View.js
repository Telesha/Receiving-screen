import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';

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
}));

export default function FactoryItemRequestAddEdit(props) {
  const [title, setTitle] = useState("");
  const [isView, setIsView] = useState(false);
  const classes = useStyles();
  const [factories, setFactories] = useState();
  const [availableQuantity, setAvailableQuantity] = useState();
  const [groups, setGroups] = useState();
  const [routes, setRoutes] = useState();
  const [customers, setCustomers] = useState();
  const [customerList, setCustomerList] = useState();
  const [factoryItems, setFactoryItems] = useState();
  const [registrationNumbers, setRegistrationNumbers] = useState();
  const [unitPrice, setUnitPrice] = useState();
  const [factoryItemGRNS, setFactoryItemGRNS] = useState();
  const [factoryItemGrnList, setFactoryItemGrnList] = useState();
  const [totalPrice, setTotalPrice] = useState();
  const [factoryItemGrnArray, setFactoryItemGrnArray] = useState([]);
  const [fullArray, setFullArray] = useState([]);
  const [DisableUserFields, setDisableUserFields] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [factoryRequest, setFactoryRequest] = useState({
    groupID: '0',
    factoryID: '0',
    factoryItem: '0',
    quantity: 0,
    routeID: '0',
    customerID: '0',
    registrationNumber: '0',
    isActive: true,
    grnID: '0',
    grnListID: '0',
    grnQuantity: 0,
    createdDate: '',
    requestType: '0',
    totalPrice: '0',
    factoryItemID: '0',
    statusID: '0',
    noOfInstallments: '0',
    paymentEffectedMonth: '',
    approvedQuantity: '0',
    effectiveDate: ''
  });
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/factoryItemRequestDetails/listing');
  }
  const alert = useAlert();
  const { factoryItemRequestID } = useParams();
  let decrypted = 0;
  const ApprovalEnum = Object.freeze({ "Pending": 1, "Approve": 2, "Reject": 3, })


  useEffect(() => {
    getGroupsForDropdown();
  }, []);

  useEffect(() => {
    decrypted = atob(factoryItemRequestID.toString());
    if (decrypted != 0) {
      trackPromise(
        getFactoryrequestDetails(decrypted)
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getfactoriesForDropDown()
    );
  }, [factoryRequest.groupID]);

  useEffect(() => {
    trackPromise(
      getAvailableGrnByFactoryItem(),
      getGRNListByFactoryItem()
    )
  }, [factoryRequest.factoryItem]);

  useEffect(() => {
    trackPromise(
      getFactoryItemsByFactoryID(),
      getRoutesByFactoryID()
    )
  }, [factoryRequest.factoryID]);

  useEffect(() => {
    trackPromise(
      getRegistrationNumbersForDropDown()
    );
  }, [factoryRequest.customerID]);

  useEffect(() => {
  }, [factoryRequest.grnListID]);


  async function getGRNListByFactoryItem() {
    const GRNList = await services.getGRNListByFactoryItem(factoryRequest.factoryItem);
    setFactoryItemGrnList(GRNList);
    setFullArray(GRNList);
  }

  async function getAvailableGrnByFactoryItem() {
    const GRNS = await services.getAvailableGrnByFactoryItem(factoryRequest.factoryItem);
    setFactoryItemGRNS(GRNS);
  }

  async function getRegistrationNumbersForDropDown() {
    const registrationNList = await services.getRegistrationNumbersForDropDown(factoryRequest.customerID);
    setRegistrationNumbers(registrationNList);
  }

  async function getRoutesByFactoryID() {
    const routeList = await services.getRoutesForDropDown(factoryRequest.factoryID);
    setRoutes(routeList);
  }

  async function getFactoryItemsByFactoryID() {
    const items = await services.getFactoryItemsByFactoryID(factoryRequest.factoryID);
    setFactoryItems(items);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(factoryRequest.groupID);
    setFactories(factory);
  }

  async function getFactoryrequestDetails(factoryItemRequestID) {
    let response = await services.getFactoryrequestDetails(factoryItemRequestID);
    let data = response[0];
    let viewModel = {
      factoryItem: data.factoryItemID,
      quantity: data.requestedQuantity,
      groupID: data.groupID,
      factoryID: data.factoryID,
      routeID: data.routeID,
      customerID: data.customerID,
      isActive: data.isActive,
      registrationNumber: data.registrationNumber,
      firstName: data.firstName,
      grnID: data.grnID,
      createdDate: data.createdDate.split('T')[0],
      requestType: data.requestType,
      totalPrice: data.totalPrice.toFixed(2),
      factoryItemID: data.factoryItemID,
      statusID: data.statusID,
      noOfInstallments: data.noOfInstallments,
      paymentEffectedMonth: data.paymentEffectedMonth,
      approvedQuantity: data.approvedQuantity,
      effectiveDate: data.effectiveDate.split('T')[0]
    }
    setTitle("View Factory Item Request Details");
    setFactoryRequest(viewModel);
    await getRecordesforTable(data.noOfInstallments, data.paymentEffectedMonth, data.totalPrice);
    setIsView(true);

  }
  async function getRecordesforTable(noOfInstallments, paymentEffectedMonth, totalPrice) {
    let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var table = [];
    if (noOfInstallments > 0) {
      var month = parseInt(paymentEffectedMonth);
      for (var i = 0; i <= noOfInstallments - 1; i++) {
        var dataOBJ = {
          monthName: monthNames[month - 1],
          amount: totalPrice / noOfInstallments
        }
        table.push(dataOBJ);
        month++;
      }
    }
    setTableData(table);
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setFactoryRequest({
      ...factoryRequest,
      [e.target.name]: value
    });
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

  function generateDropDownRegistrationNums(data) {

    let items = [];
    if (data != null || data != undefined) {
      data.map((item) => {
        items.push(
          <MenuItem key={item.customerAccountID} value={item.registrationNumber}>
            {item.registrationNumber}
          </MenuItem >
        );
      });
    }
    return items;
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
          />
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
              factoryID: factoryRequest.factoryID,
              groupID: factoryRequest.groupID,
              factoryItem: factoryRequest.factoryItem,
              customerID: factoryRequest.customerID,
              quantity: factoryRequest.quantity,
              routeID: factoryRequest.routeID,
              isActive: factoryRequest.isActive,
              registrationNumber: factoryRequest.registrationNumber,
              grnID: factoryRequest.grnID,
              grnListID: factoryRequest.grnListID,
              createdDate: factoryRequest.createdDate,
              requestType: factoryRequest.requestType,
              totalPrice: factoryRequest.totalPrice,
              factoryItemID: factoryRequest.factoryItemID,
              statusID: factoryRequest.statusID,
              effectiveDate: factoryRequest.effectiveDate
            }}
            validationSchema={
              Yup.object().shape({
                factoryID: Yup.number().required('Factory required').min("1", 'Factory required'),
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                factoryItem: Yup.number().required('Factory item required').min("1", 'Factory item required'),
                quantity: Yup.string().required('Quantity required').matches(/^[0-9\b]/, 'Only allow numbers'),
                customerID: Yup.number().required('Customer required').min("1", 'Customer required'),
                routeID: Yup.number().required('Reason required').min("1", 'Reason required'),
                registrationNumber: Yup.number().required('Registration number required').min("1", 'Registration number required'),
                grnID: Yup.number().required('GRN number required').min("1", 'GRN number required'),
                grnListID: Yup.string().required('GRN number required'),
              })
            }
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values,
              props
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
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="effectiveDate">
                              Date
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="effectiveDate"
                              size='small'
                              onChange={(e) => handleChange1(e)}
                              value={factoryRequest.effectiveDate}
                              variant="outlined"
                              id="effectiveDate"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="routeID">
                              Route
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.routeID && errors.routeID)}
                              fullWidth
                              helperText={touched.routeID && errors.routeID}
                              name="routeID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={values.routeID}
                              variant="outlined"
                              id="routeID"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Route--</MenuItem>
                              {generateDropDownMenu(routes)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Registration Number
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                              fullWidth
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              name="registrationNumber"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={values.registrationNumber}
                              variant="outlined"
                              id="registrationNumber"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Registration Number--</MenuItem>
                              {generateDropDownRegistrationNums(registrationNumbers)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="factoryItem">
                              Factory Item
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryItem && errors.factoryItem)}
                              fullWidth
                              helperText={touched.factoryItem && errors.factoryItem}
                              name="factoryItem"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={values.factoryItem}
                              variant="outlined"
                              id="factoryItem"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            >
                              <MenuItem value="0">--Select Factory Item--</MenuItem>
                              {generateDropDownMenu(factoryItems)}
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="quantity">
                              Requested Quantity
                            </InputLabel>
                            <TextField
                              type="number"
                              error={Boolean(touched.quantity && errors.quantity)}
                              fullWidth
                              helperText={touched.quantity && errors.quantity}
                              name="quantity"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={values.quantity}
                              variant="outlined"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="quantity">
                              Approved Quantity
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="quantity"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={factoryRequest.approvedQuantity}
                              variant="outlined"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="quantity">
                              Amount(Rs.)
                            </InputLabel>
                            <TextField
                              fullWidth
                              name="quantity"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={values.totalPrice}
                              variant="outlined"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="requestType">
                              Source
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="requestType"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={values.requestType}
                              variant="outlined"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            >
                              <MenuItem value={'0'} disabled={true}>
                                --Select Status--
                              </MenuItem>
                              <MenuItem value={'1'}>Mobile Request</MenuItem>
                              <MenuItem value={'2'}>Direct Request</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="statusID">
                              Status
                            </InputLabel>
                            <TextField select
                              fullWidth
                              name="statusID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={values.statusID}
                              variant="outlined"
                              InputProps={{
                                readOnly: isView ? true : false,
                              }}
                            >
                              <MenuItem value={'0'} disabled={true}>
                                --Select Status--
                              </MenuItem>
                              <MenuItem value={'1'}>Pending</MenuItem>
                              <MenuItem value={'2'}>Issue</MenuItem>
                              <MenuItem value={'3'}>Reject</MenuItem>
                              <MenuItem value={'4'}>Send To Deliver</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>
                        <div>&nbsp;</div>
                        {tableData.length > 0 ?
                          <CardHeader style={{ marginLeft: '-1rem' }} titleTypographyProps={{ variant: 'h6' }}
                            title="Installments"
                          /> : null}
                        <CardContent>
                          {tableData.length > 0 ?
                            <Box minWidth={1050} border={2}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell align={'center'} >Month</TableCell>
                                    <TableCell align={'center'} >Amount(Rs.)</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {tableData.map((rowData, index) => (
                                    <TableRow key={index}>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {rowData.monthName}
                                      </TableCell>
                                      <TableCell align={'center'} component="th" scope="row" style={{ borderBottom: "none" }}>
                                        {rowData.amount.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box> : null}
                        </CardContent>
                      </CardContent>

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
};

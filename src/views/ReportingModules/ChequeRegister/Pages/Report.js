import React, { useState, useEffect, Fragment, useRef } from 'react';
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
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { Formik} from 'formik';
import * as Yup from 'yup';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import { useNavigate } from 'react-router-dom';
import { useAlert } from 'react-alert';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';
import xlsx from 'json-as-xlsx';
import ReactToPrint from 'react-to-print';
import CreatePDF from './CreatePDF';
import moment from 'moment';
import _ from 'lodash';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";


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
  colorCancel: {
    backgroundColor: 'red'
  },
  colorRecord: {
    backgroundColor: 'green'
  }
}));

const screenCode = 'CHEQUEREGISTERREPORT';

export default function ChequeRegisterReport(props) {
  const [title, setTitle] = useState('Cheque Register Report');
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [chequeRegisterDetail, setChequeRegisterDetail] = useState({
    groupID: 0,
    factoryID: 0,
    ledgerAccountID: 0,
    noOfCheques: 0,
    startCheque: 0,
    endCheque: 0
  });

  const [chequeRegisterData, setChequeRegisterData] = useState([]);
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const [csvHeaders, SetCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const componentRef = useRef();
  const [selectedSearchValues, setSelectedSearchValues] = useState({
    groupID: 0,
    factoryID: 0,
    ledgerAccountID: 0,
    noOfCheques: 0,
    startCheque: 0,
    endCheque: 0,
    startDate: '',
    endDate: '',
    groupName: '',
    factoryName: '',
    accountType: ''
  });
  const [accountTypeNames, setAccountTypeNames] = useState();
  const [parentHeaderNames, setParentHeaderNames] = useState();
  const [childHeaderNames, setChildHeaderNames] = useState();

  const [totalAmountForPer, setTotalAmountForPer] = useState(0);
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

  const [startDateRange, setStartDateRange] = useState(new Date());
  const [endDateRange, setEndDateRange] = useState(new Date());

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  useEffect(() => {
    getGroupsForDropdown();
    getPermission();
  }, []);

  useEffect(() => {
    getfactoriesForDropDown();
  }, [chequeRegisterDetail.groupID]);

  useEffect(() => {
    getBankDetailsForDropdown();
  }, [chequeRegisterDetail.factoryID, chequeRegisterDetail.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWCHEQUEREGISTERREPORT'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }

    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode === 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode === 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setChequeRegisterDetail({
      ...chequeRegisterDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroupList(groups);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(
      chequeRegisterDetail.groupID
    );
    setFactoryList(factory);
  }

  async function getBankDetailsForDropdown() {
    const banks = await services.getBankDetailsForDropdown(
      chequeRegisterDetail.groupID,
      chequeRegisterDetail.factoryID
    );
    setAccountTypeNames(banks);
  }

  async function GetCropDetails() {
    let model = {
      groupID: parseInt(chequeRegisterDetail.groupID),
      factoryID: parseInt(chequeRegisterDetail.factoryID),
      startNumber: parseInt(chequeRegisterDetail.startCheque),
      endNumber:
        parseInt(chequeRegisterDetail.startCheque) +
        parseInt(chequeRegisterDetail.noOfCheques),
      ledgerAccountID: parseInt(chequeRegisterDetail.ledgerAccountID),
      startDate: moment(startDateRange.toString())
        .format()
        .split('T')[0],
      endDate: moment(endDateRange.toString())
        .format()
        .split('T')[0]
    };

    const registerData = await services.getChequeRegisterReport(model);
    getSelectedDropdownValuesForReport(model);

    if (registerData.statusCode == 'Success' && registerData.data != null) {
      setChequeRegisterData(registerData.data);

      createDataForExcel(chequeRegisterData.data);
      if (registerData.data.length == 0) {
        alert.error('No Records');
      }
    } else {
      alert.error('Error');
    }
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value;

    setSelectedSearchValues({
      ...selectedSearchValues
    });

    setChequeRegisterDetail({
      ...chequeRegisterDetail,
      [e.target.name]: value
    });
    setChequeRegisterData([]);
  }

  function getSelectedDropdownValuesForReport(searchForm) {
    var startDate = moment(searchForm.startDate.toString())
      .format()
      .split('T')[0];
    var endDate = moment(searchForm.endDate.toString())
      .format()
      .split('T')[0];
    setSelectedSearchValues({
      ...selectedSearchValues,
      factoryName: FactoryList[searchForm.factoryID],
      groupName: GroupList[searchForm.groupID],
      accountType: accountTypeNames[searchForm.accountTypeID],
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
    );
  }

  async function createFile() {
    var file = await createDataForExcel(chequeRegisterData);
    var settings = {
      sheetName: 'Cheque Registry Report',
      fileName:
        'Cheque Registry Report - ' +
        selectedSearchValues.groupName +
        ' ' +
        selectedSearchValues.factoryName +
        ' ' +
        selectedSearchValues.startDate +
        ' - ' +
        selectedSearchValues.endDate
    };
  }

  async function createDataForExcel(array) {
    var res = [];

    if (array != null) {
      array.map(x => {
        var vr = {
          'Cheque Number': x.chequeNumber,
          'Voucher Code': x.voucherCode,
          'Date': x.date.split('T')[0],
          'Amount': x.credit
        };
        res.push(vr);
      });
      var vr = {
        'Cheque Number': selectedSearchValues.groupName,
        'Voucher Code': selectedSearchValues.factoryName,
        'Date': selectedSearchValues.accountType,
        'Amount': ""
      }
      res.push(vr);
    }
    return res;
  }

  async function createFile() {
    var file = await createDataForExcel(chequeRegisterData);
    var settings = {
      sheetName: 'Cheque Register Report',
      fileName:
        'Cheque Register Report -' +
        selectedSearchValues.startDate +
        ' - ' +
        selectedSearchValues.endDate
    };

    let keys = Object.keys(file[0]);
    let tempcsvHeaders = csvHeaders;
    keys.map((sitem, i) => {
      tempcsvHeaders.push({ label: sitem, value: sitem });
    });

    let dataA = [
      {
        sheet: 'Cheque Register Report',
        columns: tempcsvHeaders,
        content: file
      }
    ];
    xlsx(dataA, settings);
  }


  return (
    <Fragment>
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: chequeRegisterDetail.groupID,
              factoryID: chequeRegisterDetail.factoryID,
              ledgerAccountID: chequeRegisterDetail.ledgerAccountID,
              startCheque: chequeRegisterDetail.startCheque,
              noOfCheques: chequeRegisterDetail.noOfCheques
            }}
            validationSchema={Yup.object().shape({
              groupID: Yup.number()
                .required('Group is required')
                .min('1', 'Group is required'),
              factoryID: Yup.number()
                .required('Estate is required')
                .min('1', 'Estate is required'),
              ledgerAccountID: Yup.number()
                .required('Bank is required')
                .min('1', 'Bank is Required'),
              startCheque: Yup.number()
                .required('Start Number required')
                .min('1', 'Start Number required'),
              noOfCheques: Yup.number()
                .required('No. Of Cheques required')
                .min('1', 'No. Of Cheques required')
            })}
            onSubmit={() => trackPromise(GetCropDetails())}
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
                          <Grid item md={3} xs={8}>
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
                              value={chequeRegisterDetail.groupID}
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
                              Estate *
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
                              value={chequeRegisterDetail.factoryID}
                              variant="outlined"
                              id="factoryID"
                              size='small'
                              disabled={!permissionList.isFactoryFilterEnabled}
                            >
                              <MenuItem value="0">--Select Estate--</MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date">From Date *</InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name='startDate'
                                size='small'
                                id='startDate'
                                value={startDateRange}
                                onChange={(e) => {
                                  setStartDateRange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="date">To Date *</InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name='startDate'
                                size='small'
                                id='startDate'
                                value={endDateRange}
                                onChange={(e) => {
                                  setEndDateRange(e)
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="accountTypeID">
                              Bank Account *
                            </InputLabel>

                            <TextField
                              select
                              error={Boolean(
                                touched.ledgerAccountID &&
                                errors.ledgerAccountID
                              )}
                              helperText={
                                touched.ledgerAccountID &&
                                errors.ledgerAccountID
                              }
                              onBlur={handleBlur}
                              name="ledgerAccountID"
                              onChange={e => handleChange(e)}
                              value={chequeRegisterDetail.ledgerAccountID}
                              variant="outlined"
                              id="ledgerAccountID"
                              size='small'
                              fullWidth
                            >
                              <MenuItem value="0">
                                --Select Account Type Name--
                              </MenuItem>
                              {generateDropDownMenu(accountTypeNames)}
                            </TextField>
                          </Grid>
                        </Grid>


                        <br></br>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="voucherCode">
                              Number of Cheques *
                            </InputLabel>
                            <TextField
                              error={Boolean(
                                touched.noOfCheques && errors.noOfCheques
                              )}
                              fullWidth
                              helperText={
                                touched.noOfCheques && errors.noOfCheques
                              }
                              name="noOfCheques"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={chequeRegisterDetail.noOfCheques}
                              variant="outlined"
                              id="noOfCheques"
                              size='small'
                            ></TextField>
                          </Grid>
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="voucherCode">
                              Start Cheque Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(
                                touched.startCheque && errors.startCheque
                              )}
                              fullWidth
                              helperText={
                                touched.startCheque && errors.startCheque
                              }
                              name="startCheque"
                              onBlur={handleBlur}
                              onChange={e => handleChange(e)}
                              value={chequeRegisterDetail.startCheque}
                              variant="outlined"
                              id="startCheque"
                              size='small'
                            ></TextField>
                          </Grid>{' '}
                          <Grid item md={3} xs={8}>
                            <InputLabel shrink id="voucherCode">
                              End Cheque Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="endCheque"
                              onBlur={handleBlur}
                              size='small'
                              onChange={e => handleChange(e)}
                              value={
                                Number(chequeRegisterDetail.startCheque) +
                                Number(chequeRegisterDetail.noOfCheques)
                              }
                              variant="outlined"
                              id="endCheque"
                              disabled="true"
                            ></TextField>
                          </Grid>
                        </Grid>
                        <Box display="flex" flexDirection="row-reverse" p={2}>
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
                        {chequeRegisterData.length > 0 ? (
                          <TableContainer>
                            <Table aria-label="caption table">
                              <TableHead>
                                <TableCell align={'center'}>
                                  Cheque Number
                                </TableCell>
                                <TableCell align={'center'}>
                                  Voucher Code
                                </TableCell>
                                <TableCell align={'center'}>Date</TableCell>
                                <TableCell align={'center'}>Amount</TableCell>
                              </TableHead>
                              <TableBody>
                                {chequeRegisterData.map((data, index) => (
                                  <>
                                    {data.voucherCode != null ? (
                                      <TableRow key={index}>
                                        <TableCell
                                          align={'center'}
                                          component="th"
                                          scope="row"
                                          style={{ borderBottom: 'none' }}
                                        >
                                          {data.chequeNumber}
                                        </TableCell>
                                        <TableCell
                                          align={'center'}
                                          component="th"
                                          scope="row"
                                          style={{ borderBottom: 'none' }}
                                        >
                                          {data.voucherCode}
                                        </TableCell>
                                        <TableCell
                                          align={'center'}
                                          component="th"
                                          scope="row"
                                          style={{ borderBottom: 'none' }}
                                        >
                                          {data.date.split('T')[0]}
                                        </TableCell>
                                        <TableCell
                                          align={'center'}
                                          component="th"
                                          scope="row"
                                          style={{ borderBottom: 'none' }}
                                        >
                                          {data.credit}
                                        </TableCell>
                                      </TableRow>
                                    ) : (
                                      <TableRow style={{ background: '#ffcccb', borderBottom: '5pt solid #FFFFFF', borderTop: '5pt solid #FFFFFF' }} key={index}>

                                        <TableCell
                                          align={'center'}
                                          component="th"
                                          scope="row"

                                        >
                                          {data.chequeNumber}
                                        </TableCell>
                                        <TableCell
                                          align={'center'}
                                          component="th"
                                          scope="row"

                                        ></TableCell>
                                        <TableCell
                                          align={'center'}
                                          component="th"
                                          scope="row"

                                        ></TableCell>
                                        <TableCell
                                          align={'center'}
                                          component="th"
                                          scope="row"

                                        ></TableCell>

                                      </TableRow>
                                    )}
                                  </>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : null}
                      </Box>
                      {chequeRegisterData.length > 0 ? (
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
                            documentTitle={'Cheque Register Report'}
                            trigger={() => (
                              <Button
                                color="primary"
                                id="btnRecord"
                                type="submit"
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
                              chequeRegisterData={chequeRegisterData}
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

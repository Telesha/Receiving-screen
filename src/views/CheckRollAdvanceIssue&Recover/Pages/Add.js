import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Typography, Box, Card, makeStyles, Container, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, CardHeader, Button } from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { useAlert } from "react-alert";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import tokenDecoder from '../../../utils/tokenDecoder';
import { LoadingComponent } from '../../../utils/newLoader';
import { Formik } from 'formik';
import * as Yup from "yup";
import { EmployeeAdvanceDetailsNewComponent } from './../../Common/EmployeeAdvanceDetailsNewComponent/EmployeeAdvanceDetailsNewComponentt';
import { AgriGenERPEnum } from './../../Common/AgriGenERPEnum/AgriGenERPEnum';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PageHeader from 'src/views/Common/PageHeader';
import { useNavigate, useParams } from 'react-router-dom';
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
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
}));

const screenCode = 'CHECKROLLADVANCEADVANCEISSUERECOVER';

export default function CheckRollAdvanceissuerecoverAdd(props) {
  const agriGenERPEnum = new AgriGenERPEnum()
  const classes = useStyles();
  const [title, setTitle] = useState("Advance Add Screen");
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();
  const [division, setDivisions] = useState();
  const alert = useAlert();
  const [AdvanceTypeSelection, setAdvanceTypeSelection] = useState(agriGenERPEnum.TransactionType.Advance_Payment)
  const [radioValue1, setRadioValue1] = useState(false);
  const [name, setName] = useState();
  const [advanceDetails, setAdvanceDetails] = useState();
  const [IsLoad, setIsLoad] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isTableHide, setIsTableHide] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    routeName: ""
  });
  const [advanceIssue, setAdvanceIssue] = useState({
    groupID: '0',
    factoryID: '0',
    divisionID: '0',
    registrationNumber: '',
    advance: '',
    date: new Date().toISOString().substring(0, 10),
    previouseMonthAmount: 0,
    currentMonthAmount: 0
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAdvancePaymentChangeEnabled: false,
    isAdvanceRateChangeEnabled: false,
    isMonthlyBalanceChangeEnabled: false,
    isSendToOverAdvanceEnabled: false,
    isIssuePermissionEnabled: false,
    isIssuingDateEnabled: false,
    isViewTotalAmount: false,
    isViewAvailableAmount: false
  });

  const { advanceIssueID } = useParams();

  const navigate = useNavigate();
  let decrypted = 0
  const handleClick = () => {
    navigate('/app/checkrolladvanceissuerecover/listing');
  }

  useEffect(() => {
    decrypted = atob(advanceIssueID.toString());
    if (parseInt(decrypted) > 0) {
      trackPromise(getDetailsByAdvanceIssueID(decrypted));
    }
  }, []);

  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermission());
  }, []);

  useEffect(() => {
    decrypted = atob(advanceIssueID.toString());
    if (parseInt(decrypted) > 0) {
      if (advanceIssue.groupID != "0" && advanceIssue.factoryID != "0" && advanceIssue.divisionID != "0") {
        searcAdvanceDetails()
      }
    }
  }, [advanceIssue.groupID, advanceIssue.factoryID, advanceIssue.divisionID, advanceIssue.registrationNumber]);

  useEffect(() => {
    trackPromise(getfactoriesForDropDown());
  }, [advanceIssue.groupID]);

  useEffect(() => {
    trackPromise(getDivisionDetailsByEstateID());
  }, [advanceIssue.factoryID]);

  useEffect(() => {
    if (isUpdate != true) {
      setAdvanceIssue((prevent) => ({
        ...prevent,
        advance: ''
      }))
    }
    setIsTableHide(false);
    setRadioValue1(true);
  }, [advanceIssue.registrationNumber]);

  useEffect(() => {
    if (isUpdate != true) {
      setAdvanceIssue((prevent) => ({
        ...prevent,
        registrationNumber: ''
      }))
    }
  }, [advanceIssue.divisionID]);

  useEffect(() => {
    if (advanceIssue.registrationNumber !== null || advanceIssue.registrationNumber !== "" || advanceIssue.registrationNumber !== undefined) {
      trackPromise(GetEmployeeSalaryAndAttendenceDetails(advanceIssue.registrationNumber));
    }
  }, [advanceIssue.registrationNumber]);

  useEffect(() => {
    setIsTableHide(false);
  }, [advanceIssue.date])

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWCHECKROLLADVANCEADVANCEISSUERECOVERADD');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isAdvancePaymentChangeEnabled = permissions.find(p => p.permissionCode === 'ADVANCEPAYMENTPERMISSION');
    var isAdvanceRateChangeEnabled = permissions.find(p => p.permissionCode == "ADVANCERATECHANGEPERMISSION");
    var isMonthlyBalanceChangeEnabled = permissions.find(p => p.permissionCode == "MONTHLYBALANCECHANGINGPERMISSION");
    var isSendToOverAdvanceEnabled = permissions.find(p => p.permissionCode == "SENDTOOVERADVANCEPERMISSION");
    var isIssuePermissionEnabled = permissions.find(p => p.permissionCode == "ADVANCEISSUEPERMISSION");
    var isIssuingDateEnabled = permissions.find(p => p.permissionCode == "ISSUINGDATECHANGEPERMISSION");
    var isViewTotalAmount = permissions.find(p => p.permissionCode == "VIEWTOTALAMOUNT");
    var isViewAvailableAmount = permissions.find(p => p.permissionCode == "VIEWAVAILABLEAMOUNT");

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isAdvancePaymentChangeEnabled: isAdvancePaymentChangeEnabled !== undefined,
      isAdvanceRateChangeEnabled: isAdvanceRateChangeEnabled !== undefined,
      isMonthlyBalanceChangeEnabled: isMonthlyBalanceChangeEnabled !== undefined,
      isSendToOverAdvanceEnabled: isSendToOverAdvanceEnabled !== undefined,
      isIssuePermissionEnabled: isIssuePermissionEnabled !== undefined,
      isIssuingDateEnabled: isIssuingDateEnabled !== undefined,
      isViewTotalAmount: isViewTotalAmount !== undefined,
      isViewAvailableAmount: isViewAvailableAmount !== undefined
    });
    setAdvanceIssue({
      ...advanceIssue,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }


  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getfactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(advanceIssue.groupID);
    setFactories(factory);
  }

  async function getDivisionDetailsByEstateID() {
    const division = await services.getDivisionDetailsByEstateID(advanceIssue.factoryID);
    setDivisions(division);
  }

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  async function getDetailsByAdvanceIssueID(advanceIssueID) {
    await timeout(1500);
    const response = await services.getDetailsByAdvanceIssueID(advanceIssueID);
    setIsUpdate(true);
    setAdvanceIssue((prevent) => ({
      ...prevent,
      groupID: response.groupID,
      factoryID: response.estateID,
      divisionID: response.divisionID,
      registrationNumber: response.registrationNumber,
      date: response.advanceIssueDate,
      advance: response.advanceAmount
    }))
    setRadioValue1(true);
    setTitle("Advance Update Screen");
  }

  async function GetEmployeeSalaryAndAttendenceDetails() {
    const result = await services.GetEmployeeSalaryAndAttendenceDetailsForCommonCard(advanceIssue.registrationNumber, advanceIssue.date, advanceIssue.divisionID);
    setAdvanceDetails(result.current === null || result.current === undefined ? 0 : result.current);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setAdvanceIssue({
      ...advanceIssue,
      [e.target.name]: value
    });
  }

  function handleRadioChange(e) {

    if (radioValue1 === false) {
      setRadioValue1('active');
    }
    else {
      setRadioValue1(false);
    }
  }

  async function searcAdvanceDetails() {
    var validate = /^[0-9]\d*$/;
    let response = await services.GetEmpNamebyRegNo(advanceIssue.groupID, advanceIssue.factoryID, advanceIssue.divisionID, advanceIssue.registrationNumber);
    if (response.data == null && response.statusCode == "Error" && advanceIssue.divisionID != "0" && validate.test(advanceIssue.registrationNumber)) {
      alert.error("Employee Number Not Exist")
    }
    else {
      setName(response.data);
      if (advanceIssue.groupID == null || advanceIssue.groupID == "0" || advanceIssue.groupID == undefined) {
        alert.error('Please select a Group');
      }
      else if (advanceIssue.factoryID == null || advanceIssue.factoryID == "0" || advanceIssue.factoryID == undefined) {
        alert.error('Please select a Factory');
      }
      else if (advanceIssue.divisionID == null || advanceIssue.divisionID == "0" || advanceIssue.divisionID == undefined) {
      }
      else if (advanceIssue.registrationNumber == "") {
      }
      else if (!validate.test(advanceIssue.registrationNumber)) {
      }
      else {
        setIsLoad(true);
        setIsTableHide(true)
      }
    }
  }

  async function ClearData() {
    setAdvanceIssue((prevent) => ({
      ...prevent,
      registrationNumber: '',
      advance: '',
      divisionID: '0'
    }));
    setCustomerDetails({
      ...customerDetails, customerName: ''
    })
    setRadioValue1(false);
    setIsLoad(false);
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
            isEdit={false}
            toolTiptitle={"Add Over Advance"}
          />
        </Grid>
      </Grid>
    )
  }

  async function saveAdvanceAmount() {
    var validate = /^[+]?\d+([.]\d+)?$/;
    var validateA = /^(\d{1,5}|\d{0,5}\.\d{1,2})$/;
    if (advanceIssue.advance == 0) {
      alert.error('Advance Amount Required')
    }
    else if (!validate.test(advanceIssue.advance)) {
      alert.error('Only Positive Values');
      return;
    }
    else if (!validateA.test(advanceIssue.advance)) {
      alert.error('Only two decimal places');
      return;
    }
    else if (((advanceIssue.advance > advanceDetails.paidAmount) || advanceIssue.advance > advanceDetails)) {
      alert.error('Cannot make the advance payment');
    }
    else {
      if (isUpdate == true) {
        decrypted = atob(advanceIssueID.toString());
        setIsUpdate(true);
        let model = {
          groupID: parseInt(advanceIssue.groupID),
          factoryID: parseInt(advanceIssue.factoryID),
          advanceIssueID: parseInt(decrypted),
          registrationNumber: advanceIssue.registrationNumber,
          date: moment(advanceIssue.date).format('YYYY-MM-DD'),
          advance: advanceIssue.advance,
          modifiedBy: parseInt(tokenDecoder.getUserIDFromToken()),
          modifiedDate: new Date().toISOString(),
        }
        let response = await services.updateAdvanceAmount(model);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          navigate('/app/checkrolladvanceissuerecover/listing');
        } else {
          alert.error(response.message);
        }
      }
      else {
        let response = await services.saveAdvanceAmount(advanceIssue);
        if (response.statusCode == "Success") {
          alert.success(response.message);
          ClearData();
        }
        else {
          alert.error(response.message);
          ClearData();
        }
      }
    }
  }

  function handleDateChange(value) {
    setAdvanceIssue({
      ...advanceIssue,
      date: value
    });
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page
        className={classes.root}
        title={title}>
        <Container maxWidth={false}>

          <Formik
            initialValues={{
              groupID: advanceIssue.groupID,
              factoryID: advanceIssue.factoryID,
              divisionID: advanceIssue.divisionID,
              registrationNumber: advanceIssue.registrationNumber,
              advance: advanceIssue.advance,

            }}
            validationSchema={
              Yup.object().shape({
                advance: Yup.number().when([], {
                  is: () => radioValue1,
                  then: Yup.number().required('Advance Amount is required').min(1, 'Advance Amount is required'),
                  otherwise: Yup.number().notRequired(),
                }),
                groupID: Yup.number().required('Group is required').min('1', 'Group is required'),
                factoryID: Yup.number().required('Estate is required').min('1', 'Estate is required'),
                divisionID: Yup.number().required('Division is required').min('1', 'Division is required'),
                registrationNumber: Yup.string().required('Employee number is required').min('1', 'Employee number is required').matches(/^[0-9]\d*$/, 'Only numbers allowed'),
              })
            }
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader title={cardTitle(title)} />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={4}>
                          <Grid item md={2} xs={12}>
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
                              value={advanceIssue.groupID}
                              variant="outlined"
                              id="groupID"
                              size='small'
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={2} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              name="factoryID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={advanceIssue.factoryID}
                              variant="outlined"
                              size='small'
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value={0}>--Select Estate--</MenuItem>
                              {generateDropDownMenu(factories)}
                            </TextField>
                          </Grid>
                          <Grid item md={2} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.divisionID && errors.divisionID)}
                              fullWidth
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e);
                              }}
                              value={advanceIssue.divisionID}
                              disabled={isUpdate}
                              variant="outlined"
                              id="divisionID"
                            >
                              <MenuItem value={0}>--Select Division--</MenuItem>
                              {generateDropDownMenu(division)}
                            </TextField>
                          </Grid>
                          <Grid item md={2} xs={12}>
                            <InputLabel shrink id="date">
                              Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.date && errors.date)}
                                helperText={touched.date && errors.date}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="date"
                                id="date"
                                disabled={isUpdate}
                                size='small'
                                value={advanceIssue.date}
                                onChange={(e) => {
                                  handleDateChange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                                maxDate={new Date()}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item md={2} xs={12}>
                            <InputLabel shrink id="registrationNumber">
                              Employee Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.registrationNumber && errors.registrationNumber)}
                              fullWidth
                              helperText={touched.registrationNumber && errors.registrationNumber}
                              name="registrationNumber"
                              onChange={(e) => handleChange(e)}
                              value={advanceIssue.registrationNumber}
                              onBlur={handleBlur}
                              disabled={isUpdate}
                              variant="outlined"
                              size="small"
                            >
                            </TextField>
                          </Grid>
                          {!isUpdate ?

                            <Grid item md={2} xs={12}>
                              <Box display="flex" justifyContent="flex-end" p={2}>
                                <Button
                                  color="primary"
                                  type="submit"
                                  variant="contained"
                                  onClick={() => (searcAdvanceDetails())}
                                >
                                  Search
                                </Button>
                              </Box>
                            </Grid>
                            : null}
                        </Grid>
                        {(customerDetails.customerName != "" || advanceIssue.registrationNumber != "") && isTableHide ? (

                          <Grid container spacing={2}>
                            <Grid item md={5} xs={12}>
                              <Typography style={{ fontSize: '16px' }} align="left"><b>Employee Name: </b> {name.employeeName}</Typography>

                            </Grid>
                            <Grid container spacing={3}>
                              <Grid item md={12} xs={12}>
                                <Card>
                                  <CardContent>
                                    <EmployeeAdvanceDetailsNewComponent
                                      registrationNumber={advanceIssue.registrationNumber}
                                      date={advanceIssue.date}
                                      divisionID={advanceIssue.divisionID}
                                    />
                                  </CardContent>
                                </Card>
                              </Grid>
                            </Grid>
                          </Grid>
                        ) : null}
                        <br />
                        <br />
                        <Divider />
                        <br /><br />
                        {IsLoad == true && isTableHide ? (
                          <Grid container spacing={2} style={{ marginLeft: "15px", marginTop: "10px" }} >
                            <Grid item md={12} xs={12}>
                              <Grid container spacing={2} alignItems="center">
                                <RadioGroup row name="advanceType" value={AdvanceTypeSelection} onChange={handleRadioChange}>
                                  <FormControlLabel
                                    value={agriGenERPEnum.TransactionType.Advance_Payment}
                                    control={
                                      <Radio
                                        checked={radioValue1}
                                        color="primary" />
                                    }
                                    label="Cash"
                                  />
                                </RadioGroup>
                                <Grid item md={2} xs={4}>
                                  <TextField
                                    fullWidth
                                    name="advance"
                                    onChange={(e) => handleChange(e)}
                                    value={advanceIssue.advance}
                                    variant="outlined"
                                    id="advance"
                                    size="small"
                                    disabled={!radioValue1}
                                  >
                                  </TextField>
                                </Grid>
                                <Grid item md={2} xs={4}>
                                  <Box display="flex">
                                    <Button
                                      color="primary"
                                      type="submit"
                                      variant="contained"
                                      disabled={!radioValue1}
                                      onClick={() => (saveAdvanceAmount())}
                                    >
                                      {isUpdate == true ? "Update Advance" : "Make Advance"}
                                    </Button>
                                  </Box>
                                </Grid>
                              </Grid>

                            </Grid>
                          </Grid>

                        ) : null}
                      </CardContent>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container >
      </Page >
    </Fragment >
  );
};


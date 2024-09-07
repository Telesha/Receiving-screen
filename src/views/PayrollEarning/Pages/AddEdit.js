import React, { useState, useEffect, Fragment, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel,
  CardHeader, MenuItem, TableCell,
  DialogContentText, TableRow, Typography, TableContainer, TableBody, Table, TableHead
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  }
}));

const screenCode = 'PAYROLLEARNING';
export default function PayrollEarningAddEdit() {
  const [title, setTitle] = useState("Add Payroll Other Earning");
  const [isUpdate, setIsUpdate] = useState(false);
  const [backConfirmation, setBackConfirmation] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [isDateDisable, setIsDateDisable] = useState(false);
  const classes = useStyles();
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState([]);
  const [ArrayField, setArrayField] = useState([]);
  const [registrationNumberError, setRegistrationNumberError] = useState("");
  const [otherEarningTypes, setOtherearningType] = useState([]);
  const [amountValue, setAmountValue] = useState(0);
  const [months, setMonths] = useState({
    startMonth: new Date().toISOString().substring(0, 7)
  });
  const [empDetails, setEmpDetails] = useState({
    employeeName: '',
    employeeID: 0,
    designationName: '',
    designationID: 0
  });
  const [otherearning, setOtherearning] = useState({
    groupID: 0,
    estateID: 0,
    designationID: 0,
    payrollEarningID: 0,
    regNo: '',
    amount: '',
    empName: '',
    otherEarningType: '0',
    date: '',
  });

  const empNoRef = useRef(null);
  const qtyRef = useRef(null);
  const addButtonRef = useRef(null);
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/payrollEarning/listing');
  }
  const alert = useAlert();
  let decrypted = 0;

  const { otherEarningID } = useParams();
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  useEffect(() => {
    trackPromise(getGroupsForDropdown(), getPermissions());
  }, []);

  useEffect(() => {
    getEstateDetailsByGroupID();
  }, [otherearning.groupID]);

  useEffect(() => {
    decrypted = atob(otherEarningID.toString());
    if (parseInt(decrypted) > 0) {
      setIsUpdate(true);
      getDetailsByPayRollOtherEarningID(decrypted);
    }
  }, []);

  useEffect(() => {
    if (otherearning.estateID !== 0) {
      getAllPayrollEarningTypes()
    }
  }, [otherearning.estateID]);

  useEffect(() => {
    if (otherearning.regNo > 0) {
      getEmployeeNumberByEmployeeName();
    }
  }, [otherearning.regNo]);

  useEffect(() => {
    setOtherearning({
      ...otherearning,
      startMonth: new Date().toISOString().substring(0, 10),
      date: new Date().toISOString().substring(0, 10),
      otherEarningType: 0,
      regNo: '',
      amount: ''
    })
    setMonths({
      ...months,
      startMonth: new Date().toISOString().substring(0, 7)
    })
  }, [otherearning.designationID]);

  useEffect(() => {
    setOtherearning({
      ...otherearning,
      designationID: 0,
      date: new Date().toISOString().substring(0, 10),
      otherEarningType: 0,
      regNo: '',
      amount: ''
    })
    setEmpDetails({
      ...empDetails,
      employeeName: '',
      employeeID: 0,
      designationName: '',
      designationID: 0
    })
  }, [otherearning.estateID]);

  useEffect(() => {
    setOtherearning({
      ...otherearning,
      regNo: '',
      amount: ''
    })
    setEmpDetails({
      ...empDetails,
      employeeName: '',
      employeeID: 0,
      designationName: '',
      designationID: 0
    })
  }, [otherearning.otherEarningType]);

  useEffect(() => {
    setOtherearning({
      ...otherearning,
      amount: '',
    })
    setEmpDetails({
      ...empDetails,
      employeeName: '',
      employeeID: 0,
      designationName: '',
      designationID: 0
    })
  }, [otherearning.regNo]);

  useEffect(() => {
    if (isUpdate) {
      setOtherearning({
        ...otherearning,
        amount: amountValue,
      })
    }
  }, [amountValue]);

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  };

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(otherearning.groupID);
    setEstates(response);
  };

  async function getEmployeeNumberByEmployeeName() {
    var response = await services.getEmployeeNumberByEmployeeName(otherearning.regNo);

    if (response != null) {
      setEmpDetails({
        ...empDetails,
        employeeName: response.firstName,
        employeeID: response.employeeID,
        designationName: response.designationName,
        designationID: response.designationID
      })
      setRegistrationNumberError("")
    }
    else {
      setRegistrationNumberError("Employee Number Does not Exist")
    }
  };

  async function getAllPayrollEarningTypes() {
    var response = await services.getAllPayrollEarningTypes(otherearning.estateID);
    setOtherearningType(response);
  };

  async function getDetailsByPayRollOtherEarningID(payRollOtherEarningID) {
    setTitle("Edit Payroll Other Earning")
    const otherearning = await services.GetDetailsByPayRollOtherEarningID(payRollOtherEarningID);
    setIsUpdate(true);
    setOtherearning({
      ...otherearning,
      groupID: otherearning.groupID,
      estateID: otherearning.estateID,
      designationID: otherearning.designationID,
      payrollEarningID: otherearning.payrollEarningID,
      month: otherearning.month,
      year: otherearning.year,
      date: otherearning.date.split('T')[0],
      regNo: otherearning.regNo,
      amount: otherearning.amount,
      otherEarningType: otherearning.payrollEarningTypeID,
    });
    setAmountValue(otherearning.amount)
  }

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITPAYROLLEARNING');

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

    if (decrypted == 0) {
      setOtherearning({
        ...otherearning,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        estateID: parseInt(tokenService.getFactoryIDFromToken())
      })
    }
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>)
      }
    }
    return items
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value;
    setOtherearning({
      ...otherearning,
      [e.target.name]: value
    });
  }

  function handleChange2(e) {
    const { name, value } = e.target;
    if (isUpdate) {
      const isValidInput = value === '' || /^\d*(\.\d{0,2})?$/.test(value);
      const isBackspacePressed = e.nativeEvent.inputType === 'deleteContentBackward';

      if (isValidInput || isBackspacePressed) {
        setOtherearning(prevState => ({
          ...prevState,
          [name]: value
        }));
      } else {
        e.preventDefault();
        alert.error("Please enter a valid amount");
      }
    } else {
      const isValidInput = value === '' || /^\d+(\.\d{0,2})?$/.test(value);

      if (isValidInput) {
        setOtherearning(prevState => ({
          ...prevState,
          [name]: value
        }));
      } else {
        e.preventDefault();
        alert.error("Please enter a valid amount");
      }
    }
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

  const handleKeyDown = (event, nextInputRef) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      nextInputRef.current.focus();
    }
  }

  const handleKeyDown1 = (nextInputRef) => {
    nextInputRef.current.focus();
  }

  const handleKeyDown2 = () => {
    document.activeElement.blur();
  }

  function handleChangeForRegNumber(e) {
    const target = e.target;
    let value = target.value;

    if (/^[0-9]*$/.test(value)) {
      setRegistrationNumberError("");
      setOtherearning({
        ...otherearning,
        [target.name]: value
      });
    } else {
      setRegistrationNumberError("Invalid input. Please enter a valid Registration number.");
    }
  }

  async function InactivDetails(row, index) {
    {
      const dataDelete = [...ArrayField];
      const remove = index;
      dataDelete.splice(remove, 1);
      setArrayField([...dataDelete]);
    }
  };

  async function AddFieldData() {
    const isMatch = ArrayField.some(x =>
      x.designationID === empDetails.designationID &&
      x.regNo === otherearning.regNo &&
      x.payrollEarningTypeID === parseInt(otherearning.otherEarningType)
    );

    let model = {
      regNo: otherearning.regNo,
      designationID: empDetails.designationID,
      month: (otherearning.date).split('-')[1],
      year: (otherearning.date).split('-')[0],
      payrollEarningTypeID: parseInt(otherearning.otherEarningType),
    }

    let response = await services.CheckPayrollOtherEarning(model);

    if (isMatch) {
      alert.error("The record already exists!")
    } else if (response.statusCode == 'Success') {
      alert.error("This employee already has this earning type to this month!")
    } else {
      setIsDateDisable(true);
      var array1 = [...ArrayField];
      array1.push({
        groupID: parseInt(otherearning.groupID),
        estateID: parseInt(otherearning.estateID),
        designationID: empDetails.designationID,
        month: (otherearning.date).split('-')[1],
        year: (otherearning.date).split('-')[0],
        date: otherearning.date,
        regNo: otherearning.regNo,
        employeeID: empDetails.employeeID,
        payrollEarningTypeID: parseInt(otherearning.otherEarningType),
        payrollEarningTypeName: otherEarningTypes[otherearning.otherEarningType],
        amount: parseFloat(otherearning.amount).toFixed(2),
        empName: empDetails.employeeName,
        createdBy: parseInt(tokenService.getUserIDFromToken())
      });
      setArrayField(array1);
      setOtherearning({
        ...otherearning,
        regNo: '',
        empName: '',
        amount: '',
      });
      setEmpDetails({
        ...empDetails,
        employeeName: '',
        employeeID: 0,
        designationName: '',
        designationID: 0
      })
      handleKeyDown1(empNoRef)
    }
  }

  async function saveOtherEarning() {
    handleKeyDown2(empNoRef)
    if (isUpdate == true) {
      if (otherearning.amount.toString().trim() === '') {
        alert.error("Please enter a valid amount");
        return;
      }
      const formattedAmount = parseFloat(otherearning.amount).toFixed(2);

      setIsUpdate(true);
      setIsDisableButton(true);
      let model = {
        otherEarningID: parseInt(atob(otherEarningID.toString())),
        groupID: otherearning.groupID,
        estateID: otherearning.estateID,
        designationID: otherearning.designationID,
        payrollEarningID: otherearning.payrollEarningID,
        month: (otherearning.date).split('-')[1],
        year: (otherearning.date).split('-')[0],
        date: otherearning.date,
        regNo: otherearning.regNo,
        amount: parseFloat(formattedAmount),
        otherEarningType: parseInt(otherearning.otherEarningType),
        createdBy: parseInt(tokenService.getUserIDFromToken())
      }

      let response = await services.UpdateOtherEarning(model);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        setArrayField([]);
        navigate('/app/payrollEarning/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {

      let response = await services.saveOtherEarning(ArrayField);

      if (response.statusCode == "Success") {
        alert.success(response.message);
        setIsDisableButton(false);
        setArrayField([]);
        navigate('/app/payrollEarning/listing');
        setIsDisableButton(true);
      }
      else {
        alert.error(response.message);
      }
    }
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader
            onClick={handleConfirmBackOne}
          />
        </Grid>
      </Grid>
    )
  }

  function handleConfirmBack() {
    setBackConfirmation(false)
  }

  function handleConfirmBackOpen() {
    setBackConfirmation(true)
  }

  function handleConfirmBackOne() {
    if (ArrayField.length != 0) {
      handleConfirmBackOpen()
    }
    else {
      handleClick()
    }
  }

  function handleConfirmBackTwo() {
    saveOtherEarning();
    setBackConfirmation(false);
    navigate('/app/payrollEarning/listing');
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: otherearning.groupID,
              estateID: otherearning.estateID,
              designationID: otherearning.designationID,
              regNo: otherearning.regNo,
              amount: otherearning.amount,
              otherEarningType: otherearning.otherEarningType,
              date: otherearning.date,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group required').min("1", 'Group required'),
                estateID: Yup.number().required('Estate required').min("1", 'Estate required'),
                otherEarningType: Yup.number().required('Payroll Other Earning Type required').min("1", 'Payroll Other Earning Type required'),
                date: Yup.date().required('Date is Required'),
                regNo: Yup.string().max(30).required('Employee Number required'),
                amount: Yup.string()
                  .max(30, 'Amount should be at most 30 characters')
                  .required('Amount required')
                  .matches(/^\d+(\.\d{1,2})?$/, {
                    message: 'Please enter a valid amount with up to two decimal places',
                    excludeEmptyString: true,
                  })
                  .test('not-negative', 'Amount cannot be negative', value => {
                    const parsedValue = parseFloat(value);
                    return parsedValue >= 0;
                  })
                  .test('no-symbols', 'Symbols are not allowed', value => {
                    return /^[0-9.]+$/.test(value);
                  }),
              })
            }
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={() => AddFieldData()}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              handleChange,
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
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              size='small'
                              value={otherearning.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: isUpdate || isDateDisable
                              }}
                            >
                              <MenuItem value="0">--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => handleChange1(e)}
                              value={otherearning.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: isUpdate || isDateDisable
                              }}
                            >
                              <MenuItem value={0}>--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="otherEarningType">
                              Payroll Other Earning Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.otherEarningType && errors.otherEarningType)}
                              fullWidth
                              helperText={touched.otherEarningType && errors.otherEarningType}
                              name="otherEarningType"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => handleChange1(e)}
                              value={otherearning.otherEarningType}
                              variant="outlined"
                              id="otherEarningType"
                              InputProps={{
                                readOnly: isUpdate 
                              }}
                            >
                              <MenuItem value={0}>--Select Payroll Other Earning Type--</MenuItem>
                              {generateDropDownMenu(otherEarningTypes)}
                            </TextField>
                          </Grid>

                          {isUpdate ?
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="date">
                                Date *
                              </InputLabel>
                              <TextField
                                fullWidth
                                name="date"
                                onChange={(e) => handleChange1(e)}
                                value={otherearning.date}
                                variant="outlined"
                                id="date"
                                size='small'
                                disabled
                              />
                            </Grid>
                            :
                            <Grid item md={3} xs={12}>
                              <InputLabel shrink id="date">
                                Date *
                              </InputLabel>
                              <TextField
                                error={Boolean(
                                  touched.date && errors.date
                                )}
                                helperText={touched.date && errors.date}
                                fullWidth
                                name="date"
                                type='date'
                                onChange={(e) => handleChange1(e)}
                                value={otherearning.date}
                                variant="outlined"
                                id="date"
                                size='small'
                                inputProps={{
                                  max: new Date().toISOString().split('T')[0],
                                  readOnly: isDateDisable
                                }}
                              />
                            </Grid>
                          }
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="regNo">
                              Employee Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.regNo && errors.regNo) || Boolean(registrationNumberError)}
                              fullWidth
                              helperText={touched.regNo && errors.regNo ? errors.regNo : registrationNumberError}
                              name="regNo"
                              onBlur={handleBlur}
                              onChange={(e) => handleChangeForRegNumber(e)}
                              value={otherearning.regNo}
                              size='small'
                              variant="outlined"
                              InputProps={{
                                readOnly: isUpdate
                              }}
                              inputRef={empNoRef}
                              onKeyDown={(e) => handleKeyDown(e, qtyRef)}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="empName">
                              Emp Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.empName && errors.empName)}
                              fullWidth
                              helperText={touched.empName && errors.empName}
                              name="empName"
                              onBlur={handleBlur}
                              size='small'
                              placeholder='--Employee Name--'
                              onChange={(e) => handleChange(e)}
                              value={empDetails.employeeName}
                              variant="outlined"
                              id="empName"
                              type="text"
                              inputProps={{
                                readOnly: true
                              }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="designationID">
                              Designation *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.designationID && errors.designationID)}
                              fullWidth
                              helperText={touched.designationID && errors.designationID}
                              name="designationID"
                              onBlur={handleBlur}
                              size='small'
                              placeholder='--Designation--'
                              onChange={(e) => handleChange(e)}
                              value={empDetails.designationName}
                              variant="outlined"
                              id="designationID"
                              type="text"
                              inputProps={{
                                readOnly: true
                              }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="amount">
                              Amount *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.amount && errors.amount)}
                              fullWidth
                              helperText={touched.amount && errors.amount}
                              name="amount"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange2(e)}
                              value={otherearning.amount}
                              size='small'
                              variant="outlined"
                              inputRef={qtyRef}
                              onKeyDown={(e) => handleKeyDown(e, addButtonRef)}
                            />
                          </Grid>
                        </Grid>
                        {isUpdate != true ?
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              color="primary"
                              variant="contained"
                              type="submit"
                              disabled={isDisableButton}
                              size='small'
                              ref={addButtonRef}
                            >
                              Add
                            </Button>
                          </Box>
                          : null}
                      </CardContent>
                      {ArrayField.length > 0 ? (
                        <Grid item xs={12}>
                          <TableContainer>
                            <Table className={classes.table} aria-label="caption table">
                              <TableHead>
                                <TableRow>
                                  <TableCell align="center"><b>Employee Number</b></TableCell>
                                  <TableCell align="center"><b>Employee Name</b></TableCell>
                                  <TableCell align="center"><b>Payroll Other Earning Type</b></TableCell>
                                  <TableCell align="right"><b>Amount (Rs.)</b></TableCell>
                                  <TableCell align="center"><b>Action</b></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {ArrayField.map((row, index) => {
                                  return <TableRow key={index}>
                                    <TableCell align="center" >{row.regNo}
                                    </TableCell>
                                    <TableCell align="center" >{row.empName}
                                    </TableCell>
                                    <TableCell align="center" >{row.payrollEarningTypeName}
                                    </TableCell>
                                    <TableCell align="right" >{row.amount}
                                    </TableCell>
                                    <TableCell align='center' scope="row" style={{ borderBottom: "none" }}>
                                      <DeleteIcon
                                        style={{
                                          color: "red",
                                          marginBottom: "-1rem",
                                          marginTop: "0rem",
                                          cursor: "pointer"
                                        }}
                                        size="small"
                                        onClick={() => InactivDetails(row, index)}
                                      >
                                      </DeleteIcon>
                                    </TableCell>
                                  </TableRow>
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                      )
                        : null}
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
          {(isUpdate == false) && (ArrayField.length > 0) ?
            <Box display="flex" justifyContent="flex-end" p={2}>
              <Button
                color="primary"
                type="button"
                variant="contained"
                size='small'
                onClick={() => saveOtherEarning()}
              >
                {isUpdate == true ? "Update" : "Save"}
              </Button>
            </Box>
            : null}
          {isUpdate == true ?
            <Box display="flex" justifyContent="flex-end" p={2}>
              <Button
                color="primary"
                variant="contained"
                type="button"
                size='small'
                onClick={() => saveOtherEarning()}
              >
                {isUpdate == true ? "Update" : "Save"}
              </Button>
            </Box>
            : null}
        </Container>
        <Dialog open={backConfirmation}>
          <DialogTitle id="alert-dialog-slide-title">
            <Typography
              color="textSecondary"
              gutterBottom
              variant="h3">
              <Box textAlign="center">
                Confirmation
              </Box>
            </Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              <Typography variant="h5">Are you sure do you want to save the data and go back?</Typography>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <br />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmBackTwo} color="primary">
              Yes
            </Button>
            <Button
              onClick={handleConfirmBack} color="primary" autoFocus>
              No
            </Button>
          </DialogActions>
        </Dialog>
      </Page>
    </Fragment>
  );
};

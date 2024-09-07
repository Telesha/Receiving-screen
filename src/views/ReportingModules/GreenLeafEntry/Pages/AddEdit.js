import React, { useState, useEffect, Fragment, useRef } from 'react';
import {
  Box, Card, makeStyles, Container, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, CardHeader,
  Button
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import { useAlert } from "react-alert";
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../../../utils/permissionAuth';
import { LoadingComponent } from '../../../../utils/newLoader';
import tokenService from '../../../../utils/tokenDecoder';
import PageHeader from 'src/views/Common/PageHeader';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Formik } from 'formik';
import * as Yup from "yup";
import tokenDecoder from '../../../../utils/tokenDecoder';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  textcolor: {
    color: 'blue',
    textcolor: 'blue'
  },
  chip: {
    minWidth: "50%",
  },
  colorReject: {
    backgroundColor: "red",
  },
  colorApprove: {
    backgroundColor: "green",
  },
  colorAuthorize: {
    backgroundColor: "#FFBE00"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
}));
const screenCode = 'GREENLEAFENTRY';
export default function GreenLeafEntryAddEdit() {
  const classes = useStyles();
  const componentRef = useRef();
  const [title, setTitle] = useState("Estate Leaf Entry");
  const [groups, setGroups] = useState();
  const [estates, setEstates] = useState();
  const [divisions, setDivisions] = useState();
  const [fields, setFields] = useState();
  const [routes, setRoutes] = useState();
  const [factories, setFactories] = useState();
  const [LeafTypeList, setLeafTypeList] = useState([]);
  const alert = useAlert();
  const [isDisable, setIsDisable] = useState(false);
  const [isDisableButton, setIsDisableButton] = useState(false);
  const [reqAmount, setReqAmount] = useState();
  const ApprovalEnum = Object.freeze({ "Pending": 1, "Approve": 2, "Reject": 3, });
  const [inPending, setInPending] = useState(true);
  const [newlyCreated, setNewlyCreated] = useState(true);
  const [open, setOpen] = React.useState(true);
  const [isUpdate, setIsUpdate] = useState(false);
  const [approveList, setApproveList] = useState({
    groupID: '0',
    factoryID: '0',
    fieldID: '0',
    arrivalTypeID: '0',
    collectionTypeID: '0',
    routeID: '0',
    nic: '',
    date: null,
    regNumber: '',
    refNo: '',
    fieldWeight: '',
    factoryInTime: '',
    driverID: '',
    helperID: '',
    vehicleNumber: '',
    leafTransporterID: '',
    rainfallIn: '',
    courseLeafAmount: '',
    boiledLeaf: '',
    moisture: '',
    goodLeaf: '',
    factoryGrossWeight: '',
    factoryBagAmount: '',
    moistureAmount: '',
    factoryTairWeight: '',
    otherDeduction: '',
    factoryNetWeight: '',
    previouseMonthAmount: 0,
    currentMonthAmount: 0,
    estateID: '0',
    divisionID: '0',
    fieldBagAmount: '',
    isActive: true
  });

  const currentProps1 = {
    border: 1,
    style: { height: 'auto', marginLeft: '1rem', marginBottom: '1rem' }
  };

  const { greenLeafEntryID } = useParams();
  const navigate = useNavigate();
  let decrypted = 0;

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
    isAuthorizeChangeEnabled: false,
    isIssueChangeEnabled: false,
    isAdvanceRateChangeEnabled: false
  });

  const handleClick = () => {
    navigate('/app/greenLeafEntry/listing');
  }


  const [btnName, setBtnName] = useState("Cancel");

  useEffect(() => {
    decrypted = atob(greenLeafEntryID.toString());
    if (parseInt(decrypted) > 0) {
      setNewlyCreated(false);
      trackPromise(
        getApproveDetails(decrypted),
        setBtnName("Reject")
      )
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(),
      getPermission(),
      getEstatesForDropdown(),
      getDivisionsForDropdown(),
      getFieldsForDropdown()
    );
  }, []);

  useEffect(() => {
    trackPromise(getfactoriesForDropDown());
  }, [approveList.groupID]);

  useEffect(() => {
    trackPromise(getCollectionTypeByFactoryID(approveList.factoryID))
  }, [approveList.factoryID]);

  useEffect(() => {
    decrypted = atob(greenLeafEntryID.toString());
    if (decrypted != 0) {
      trackPromise(
        getGreenLeafDetails(decrypted),
      )
    }

  }, []);


  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITGREENLEAFENTRY');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');
    var isAuthorizeChangeEnabled = permissions.find(p => p.permissionCode === 'OVERADVANCEAUTHORIZE');
    var isIssueChangeEnabled = permissions.find(p => p.permissionCode == "OVERADVANCEISSUE");
    var isAdvanceRateChangeEnabled = permissions.find(p => p.permissionCode == "ADVANCERATECHANGEPERMISSION");

    setPermissions({
      ...permissionList,
      isAuthorizeChangeEnabled: isAuthorizeChangeEnabled !== undefined,
      isIssueChangeEnabled: isIssueChangeEnabled !== undefined,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
      isAdvanceRateChangeEnabled: isAdvanceRateChangeEnabled !== undefined,
    });

    if (atob(greenLeafEntryID.toString()) == 0) {
      setApproveList({
        ...approveList,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
        factoryID: parseInt(tokenService.getFactoryIDFromToken())
      });
    }
  }

  async function getApproveDetails(greenLeafEntryID) {
    let response = await services.getApprovedDetailsByID(greenLeafEntryID);
    let data = response[0];
    setApproveList({
      ...approveList,
      groupID: data.groupID,
      factoryID: data.factoryID,
      regNumber: data.registrationNumber,
      previouseMonthAmount: parseFloat(data.previouseMonthAmount),
      currentMonthAmount: parseFloat(data.currentMonthAmount)
    });
    setReqAmount(data.requestedAmount)
    setTitle("Estate Leaf Entry");


    data.statusID == ApprovalEnum.Pending ? setInPending(true) : setInPending(false);

  }


  async function getfactoriesForDropDown() {
    const factory = await services.getfactoriesForDropDown(approveList.groupID);
    setFactories(factory);
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getEstatesForDropdown() {
    const estates = await services.getAllEstates();
    setEstates(estates);
  }

  async function getDivisionsForDropdown() {
    const divisions = await services.getAllDivisions();
    setDivisions(divisions);
  }

  async function getFieldsForDropdown() {
    const fields = await services.getAllFields();
    setFields(fields);
  }

  async function getCollectionTypeByFactoryID(factoryID) {
    var response = await services.getCollectionTypeByFactoryID(factoryID);
    setLeafTypeList(response);
  };

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
    setApproveList({
      ...approveList,
      [e.target.name]: value
    });
  }


  function handleDateChange(value) {
    setApproveList({
      ...approveList,
      date: value
    });
  }

  async function getGreenLeafDetails(greenLeafEntryID) {
    let response = await services.GetGreenLeafEntryDetailsByID(greenLeafEntryID);
    let data = {
      greenLeafEntryID: (greenLeafEntryID),
      groupID: (response.groupID),
      factoryID: (response.factoryID),
      estateID: (response.estateID),
      leafEntryDate: response.date,
      divisionID: (response.divisionID),
      fieldID: (response.fieldID),
      arrivalTypeID: (response.arrivalTypeID),
      collectionTypeID: (response.collectionTypeID),
      referenceNumber: (response.refNo),
      fieldBagAmount: (response.fieldBagAmount),
      fieldWeight: (response.fieldWeight),
      factoryInTime: response.factoryInTime,
      helperID: (response.helperID),
      driverID: (response.driverID),
      vehicleNumber: response.vehicleNumber,
      leafTransporterID: (response.leafTransporterID),
      rainfallIn: (response.rainfallIn),
      courseLeafAmount: (response.courseLeafAmount),
      boiledLeaf: (response.boiledLeaf),
      moisture: (response.moisture),
      goodLeaf: (response.goodLeaf),
      factoryGrossWeight: (response.factoryGrossWeight),
      factoryBagAmount: (response.factoryBagAmount),
      moistureAmount: (response.moistureAmount),
      factoryTairWeight: (response.factoryTairWeight),
      otherDeduction: (response.otherDeduction),
      factoryNetWeight: (response.factoryNetWeight),
    };

    setTitle("Edit Green Leaf Entry");
    setApproveList(data);
    setIsUpdate(true);
  }

  async function saveGreenLeaf(approveList) {

    if (isUpdate === true) {
      let model = {
        greenLeafEntryID: atob(greenLeafEntryID.toString()),
        groupID: parseInt(approveList.groupID),
        factoryID: parseInt(approveList.factoryID),
        estateID: parseInt(approveList.estateID),
        leafEntryDate: approveList.leafEntryDate,
        divisionID: parseInt(approveList.divisionID),
        fieldID: parseInt(approveList.fieldID),
        arrivalTypeID: parseInt(approveList.arrivalTypeID),
        collectionTypeID: parseInt(approveList.collectionTypeID),
        referenceNumber: (approveList.referenceNumber.toString()),
        fieldBagAmount: parseFloat(approveList.fieldBagAmount),
        fieldWeight: parseFloat(approveList.fieldWeight),
        factoryInTime: approveList.factoryInTime,
        helperID: parseInt(approveList.helperID),
        driverID: parseInt(approveList.driverID),
        vehicleNumber: approveList.vehicleNumber,
        leafTransporterID: parseInt(approveList.leafTransporterID),
        rainfallIn: parseFloat(approveList.rainfallIn),
        courseLeafAmount: parseFloat(approveList.courseLeafAmount),
        boiledLeaf: parseFloat(approveList.boiledLeaf),
        moisture: parseFloat(approveList.moisture),
        goodLeaf: parseFloat(approveList.goodLeaf),
        factoryGrossWeight: parseFloat(approveList.factoryGrossWeight),
        factoryBagAmount: parseFloat(approveList.factoryBagAmount),
        moistureAmount: parseFloat(approveList.moistureAmount),
        factoryTairWeight: parseFloat(approveList.factoryTairWeight),
        otherDeduction: parseFloat(approveList.otherDeduction),
        factoryNetWeight: parseFloat(approveList.factoryNetWeight),
        isActive: true,
        createdBy: tokenDecoder.getUserIDFromToken(),
        createdDate: new Date().toISOString(),
      }
      let response = await services.UpdateGreenLeafEntry(model);

      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/greenLeafEntry/listing');
      }
      else {
        alert.error(response.message);
      }
    } else {
      let response = await services.saveGreenLeafEntry(approveList);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        navigate('/app/greenLeafEntry/listing');
      }
      else {
        alert.error(response.message);
      }
    }



  }

  function clearData() {
    setApproveList({
      ...approveList,
      date: null, officerID: '0', helperID: '0', driverID: '0', vehicleNumber: '', leafTransporterID: '0',
      time: (new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()).toString(),
      rainfallIn: 0, courseLeafAmount: 0, boiledLeaf: 0, goodLeaf: 0, fieldGrossWeight: 0, factoryGrossWeight: 0,
      fieldWeight: 0, fieldBagAmount: 0, factoryBagAmount: 0, factoryTairWeight: 0, otherDeduction: 0, fieldBagAmount: 0, fieldCouseLeaf: 0,
      moistureAmount: 0, fieldNetWeight: 0, factoryNetWeight: 0
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
            isEdit={false}
          />
        </Grid>
      </Grid>
    )
  }


  return (
    <Fragment>
      <LoadingComponent />
      <Page
        className={classes.root}
        title="Estate Leaf Entry"
      >
        <Container maxWidth={true}>
          <Formik
            initialValues={{
              groupID: (approveList.groupID),
              factoryID: (approveList.factoryID),
              estateID: (approveList.estateID),
              leafEntryDate: approveList.date,
              divisionID: (approveList.divisionID),
              fieldID: (approveList.fieldID),
              arrivalTypeID: (approveList.arrivalTypeID),
              collectionTypeID: (approveList.collectionTypeID),
              referenceNumber: (approveList.refNo),
              fieldBagAmount: (approveList.fieldBagAmount),
              fieldWeight: (approveList.fieldWeight),
              factoryInTime: approveList.factoryInTime,
              helperID: (approveList.helperID),
              driverID: (approveList.driverID),
              vehicleNumber: approveList.vehicleNumber,
              leafTransporterID: (approveList.leafTransporterID),
              rainfallIn: (approveList.rainfallIn),
              courseLeafAmount: (approveList.courseLeafAmount),
              boiledLeaf: (approveList.boiledLeaf),
              moisture: (approveList.moisture),
              goodLeaf: (approveList.goodLeaf),
              factoryGrossWeight: (approveList.factoryGrossWeight),
              factoryBagAmount: (approveList.factoryBagAmount),
              moistureAmount: (approveList.moistureAmount),
              factoryTairWeight: (approveList.factoryTairWeight),
              otherDeduction: (approveList.otherDeduction),
              factoryNetWeight: (approveList.factoryNetWeight),

            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min("1", 'Group is required'),
                factoryID: Yup.number().required('Factory is required').min("1", 'Factory is required'),
                estateID: Yup.number().required('EstateID is required').min("1", 'EstateID is required'),
                divisionID: Yup.number().required('DivisionID is required').min("1", 'DivisionID is required'),
                fieldID: Yup.number().required('FieldID is required').min("1", 'FieldID is required'),
                date: Yup.date().typeError('Invalid date'),
              })
            }
            onSubmit={(event) => trackPromise(saveGreenLeaf(event))}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              isSubmitting,
              touched,
              values,
              props,
              isValid
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle(title)}
                    />
                    <Divider />
                    <CardContent style={{ marginBottom: "2rem" }}>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="groupID">
                            Group  *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            name="groupID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.groupID}
                            variant="outlined"
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false
                            }}
                          >
                            <MenuItem value="0">--Select Group--</MenuItem>
                            {generateDropDownMenu(groups)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryID">
                            Receiving Factory *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            name="factoryID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.factoryID}
                            variant="outlined"
                            id="factoryID"
                            InputProps={{
                              readOnly: isUpdate || !permissionList.isFactoryFilterEnabled ? true : false
                            }}
                          >
                            <MenuItem value="0">--Select Factory--</MenuItem>
                            {generateDropDownMenu(factories)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="date">
                            Date
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
                              id="date"
                              name="date"
                              value={approveList.date}
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
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="estateID">
                            Sending Estate *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            name="estateID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.estateID}
                            variant="outlined"
                            id="estateID"
                            InputProps={{
                              readOnly: isUpdate ? true : false
                            }}
                          >
                            <MenuItem value="0">--Select Estate--</MenuItem>
                            {generateDropDownMenu(estates)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="divisionID">
                            Division *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            name="divisionID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.divisionID}
                            variant="outlined"
                            id="divisionID"
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isFactoryFilterEnabled }}
                          >
                            <MenuItem value="0">--Select Division--</MenuItem>
                            {generateDropDownMenu(divisions)}
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="fieldID">
                            Field *
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            name="fieldID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.fieldID}
                            variant="outlined"
                            id="fieldID"
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isFactoryFilterEnabled }}
                          >
                            <MenuItem value="0">--Select Field--</MenuItem>
                            {generateDropDownMenu(fields)}
                          </TextField>
                        </Grid>
                      </Grid>

                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12} >
                          <InputLabel shrink id="refNo">
                            Ref Number
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="refNo"
                            onChange={(e) => handleChange(e)}
                            value={approveList.refNo}
                            variant="outlined"
                            id="refNo"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="arrivalTypeID">
                            Arrival Type
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            name="arrivalTypeID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.arrivalTypeID}
                            variant="outlined"
                            id="arrivalTypeID"
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isFactoryFilterEnabled }}
                          >
                            <MenuItem value="0">--Select Arrival Type--</MenuItem>
                            <MenuItem value="1">Own Estate</MenuItem>
                            <MenuItem value="2">Insourced</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="collectionTypeID">
                            Collection Type
                          </InputLabel>
                          <TextField select
                            fullWidth
                            size='small'
                            name="collectionTypeID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.collectionTypeID}
                            variant="outlined"
                            id="collectionTypeID"
                            InputProps={{ readOnly: !newlyCreated || !permissionList.isFactoryFilterEnabled }}
                          >
                            <MenuItem value="0">--Select Collection Type--</MenuItem>
                            {generateDropDownMenu(LeafTypeList)}
                          </TextField>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardContent style={{ marginBottom: "2rem" }}>
                      <Grid container spacing={2}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="fieldWeight">
                            Field Weight(Kg)
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="fieldWeight"
                            onChange={(e) => handleChange(e)}
                            value={approveList.fieldWeight}
                            variant="outlined"
                            id="fieldWeight"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="fieldBagAmount">
                            Field Bag Count
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="fieldBagAmount"
                            onChange={(e) => handleChange(e)}
                            value={approveList.fieldBagAmount}
                            variant="outlined"
                            id="fieldBagAmount"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardContent style={{ marginBottom: "2rem" }}>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryInTime">
                            Factory In Time
                          </InputLabel>

                          <TextField
                            id="factoryInTime"
                            type="Time"
                            name="factoryInTime"
                            size='small'
                            className={classes.textField}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            inputProps={{
                              step: 300, // 5 min
                            }}
                            onChange={(e) => handleChange(e)}
                            value={approveList.factoryInTime}
                          />

                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="driverID">
                            Driver
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="driverID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.driverID}
                            variant="outlined"
                            id="driverID"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="helperID">
                            Helper
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="helperID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.helperID}
                            variant="outlined"
                            id="helperID"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                      </Grid>

                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="vehicleNumber">
                            Vehicle No
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="vehicleNumber"
                            onChange={(e) => handleChange(e)}
                            value={approveList.vehicleNumber}
                            variant="outlined"
                            id="vehicleNumber"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="leafTransporterID">
                            Transpoter
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="leafTransporterID"
                            onChange={(e) => handleChange(e)}
                            value={approveList.leafTransporterID}
                            variant="outlined"
                            id="leafTransporterID"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="rainfallIn">
                            Rainfall in mm
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="rainfallIn"
                            onChange={(e) => handleChange(e)}
                            value={approveList.rainfallIn}
                            variant="outlined"
                            id="rainfallIn"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                      </Grid>
                    </CardContent>

                    <CardContent style={{ marginBottom: "2rem" }}>
                      <Grid container spacing={3}>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="courseLeafAmount">
                            Cource Leaf (%)
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="courseLeafAmount"
                            onChange={(e) => handleChange(e)}
                            value={approveList.courseLeafAmount}
                            variant="outlined"
                            id="courseLeafAmount"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="boiledLeaf">
                            Boiled Leaf (%)
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="boiledLeaf"
                            onChange={(e) => handleChange(e)}
                            value={approveList.boiledLeaf}
                            variant="outlined"
                            id="boiledLeaf"
                            type="text"
                          >
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="moisture">
                            Moisture (%)
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="moisture"
                            onChange={(e) => handleChange(e)}
                            value={approveList.moisture}
                            variant="outlined"
                            id="moisture"
                            type="text"
                          >
                          </TextField>
                        </Grid>

                        <Grid item md={3} xs={12}>
                          <InputLabel shrink id="goodLeaf">
                            Good Leaf (%)
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="goodLeaf"
                            onChange={(e) => handleChange(e)}
                            value={approveList.goodLeaf}
                            variant="outlined"
                            id="goodLeaf"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                      </Grid>

                    </CardContent>
                    <CardContent style={{ marginBottom: "2rem" }}>
                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryGrossWeight">
                            Gross Weight(Kg)
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="factoryGrossWeight"
                            onChange={(e) => handleChange(e)}
                            value={approveList.factoryGrossWeight}
                            variant="outlined"
                            id="factoryGrossWeight"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryBagAmount">
                            Bag Count
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="factoryBagAmount"
                            onChange={(e) => handleChange(e)}
                            value={approveList.factoryBagAmount}
                            variant="outlined"
                            id="factoryBagAmount"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="moistureAmount">
                            Moisture (Kg)
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="moistureAmount"
                            onChange={(e) => handleChange(e)}
                            value={approveList.moistureAmount}
                            variant="outlined"
                            id="moistureAmount"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                      </Grid>

                      <Grid container spacing={3}>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryTairWeight">
                            Tair Weight (Kg)
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="factoryTairWeight"
                            onChange={(e) => handleChange(e)}
                            value={approveList.factoryTairWeight}
                            variant="outlined"
                            id="factoryTairWeight"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="otherDeduction">
                            Other Deduction (Kg)
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="otherDeduction"
                            onChange={(e) => handleChange(e)}
                            value={approveList.otherDeduction}
                            variant="outlined"
                            id="otherDeduction"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                        <Grid item md={4} xs={12}>
                          <InputLabel shrink id="factoryNetWeight">
                            Net Weight (Kg)
                          </InputLabel>
                          <TextField
                            fullWidth
                            size='small'
                            name="factoryNetWeight"
                            onChange={(e) => handleChange(e)}
                            value={approveList.factoryNetWeight}
                            variant="outlined"
                            id="factoryNetWeight"
                            type="text"
                          >
                          </TextField>
                        </Grid>
                      </Grid>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          type="reset"
                          variant="outlined"
                          onClick={() => clearData()}
                        >
                          Cancel
                        </Button>
                        <div>&nbsp;</div>
                        <Button
                          color="primary"
                          disabled={isSubmitting || isDisableButton}
                          variant="contained"
                          type="submit"
                          style={{ marginRight: '1rem' }}
                        >
                          {isUpdate == true ? "Update" : "Save"}
                        </Button>
                      </Box>
                      {/* {newlyCreated ?
                        <Box display="flex" justifyContent="flex-end" mt={2} >
                          <Button
                            color="primary"
                            type="submit"
                            variant="contained"
                            onClick={() => trackPromise(saveGreenLeaf(approveList))}
                        
                            Save
                          </Button>
                        </Box> : null} */}
                    </CardContent>


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


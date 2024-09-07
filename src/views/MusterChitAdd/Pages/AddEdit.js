import React, { useState, useEffect } from 'react';
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
  Switch,
  InputLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Table,
  TableBody,
  Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import tokenDecoder from '../../../utils/tokenDecoder';
import authService from '../../../utils/permissionAuth';
import { useNavigate } from 'react-router-dom';
import tokenService from '../../../utils/tokenDecoder';
import _ from 'lodash';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from "@material-ui/pickers";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { AgriGenERPEnum } from 'src/views/Common/AgriGenERPEnum/AgriGenERPEnum';
import DeleteIcon from '@material-ui/icons/Delete';
import { CloudLightning } from 'react-feather';

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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const screenCode = 'MUSTERCHITADDING';

export default function MusterChitAdd(props) {
  const agriGenERPEnum = new AgriGenERPEnum();
  const alert = useAlert();
  const classes = useStyles();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const [groups, setGroups] = useState([]);
  const [estates, setEstates] = useState([]);
  const [estatesCode, setEstatesCode] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [sectionTypes, setSectionTypes] = useState([]);
  const [lentdivisions, setLentDivisions] = useState([]);
  const [lentEstates, setLentEstates] = useState([]);
  const [fields, setFields] = useState([]);
  const [LentFields, setLentFields] = useState([]);
  const [radioValue1, setRadioValue1] = useState(false);
  const [radioValue2, setRadioValue2] = useState(false);
  const [radioValue3, setRadioValue3] = useState(false);
  const [musterChitID, setMusterChitID] = useState('0');
  const [PluckingJobType, setPluckingJobType] = useState([]);
  const [SundryJobType, setSundryJobType] = useState([]);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [musterChitDetails, setMusterChitDetails] = useState([]);
  const [IsSundryJobClear, setIsSundryJobClear] = useState(false);
  const [FormDetails, setFormDetails] = useState({
    groupID: 0,
    estateID: 0,
    sectionTypeID: 0,
    divisionID: 0,
    lentdivisionID: 0,
    musterChitNumber: "",
    lankemMusterChitNumber: "",
    collectedDate: new Date(),
    fieldID: 0,
    lentEstateID: 0,
    lentfieldID: 0,
    pluckingJobTypeID: 0,
    sundryJobTypeID: 0,
    estatesCode: 0,
    radioValue2: false,
    radioValue3: false,
    employeeCountID: ''
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });

  const [isDisableButton, setIsDisableButton] = useState(false);

  const today = new Date();
  const maxDate = today;
  const minDate = new Date();
  minDate.setDate(today.getDate() - 3);



  useEffect(() => {
    trackPromise(getAllGroups(), getPermissions(), getAllSectionTypes(), getFieldDetailsByDivisionIDSectionTypeID())
  }, [])

  useEffect(() => {
    getFieldDetailsByDivisionIDSectionTypeID()
  }, [FormDetails.sectionTypeID, FormDetails.divisionID])


  useEffect(() => {
    if (FormDetails.groupID > 0) {
      trackPromise(getEstateDetailsByGroupID());
    };
    setFormDetails({
      ...FormDetails,
      estateID: 0,
      sectionTypeID: 0,
      divisionID: 0,
      fieldID: 0,
      lentEstateID: 0,
      lentdivisionID: 0,
      lentfieldID: 0
    })
    setDivisions([]);
    setFields([]);
    setLentFields([]);
  }, [FormDetails.groupID]);

  useEffect(() => {
    generateMusterChitNumber(FormDetails.estateID);
  }, [FormDetails.estateID, estatesCode, musterChitDetails]);

  useEffect(() => {
    if (FormDetails.estateID > 0) {
      trackPromise(
        getDivisionDetailsByEstateID(),
      );
    };
    setFormDetails({
      ...FormDetails,
      sectionTypeID: 0,
      divisionID: 0,
      fieldID: 0,
      lentdivisionID: 0,
      lentfieldID: 0
    })
    setFields([]);
    setLentFields([]);
  }, [FormDetails.estateID]);

  useEffect(() => {
    if (FormDetails.divisionID > 0) {
      trackPromise(
        getFieldDetailsByDivisionIDSectionTypeID());
    };
    setFormDetails({
      ...FormDetails,
      fieldID: 0,
      lankemMusterChitNumber: ""
    })
  }, [FormDetails.divisionID]);

  useEffect(() => {
    setFormDetails({
      ...FormDetails,
      divisionID: 0,
    })
  }, [FormDetails.sectionTypeID]);

  useEffect(() => {
    setFormDetails({
      ...FormDetails,
      lankemMusterChitNumber: ""
    })
  }, [FormDetails.fieldID]);

  useEffect(() => {
    setFormDetails({
      ...FormDetails,
      collectedDate: new Date(),
      lentEstateID: 0,
      lentdivisionID: 0,
      lentfieldID: 0,
      employeeCountID: 0,
      employeeCount: 0,
    },
      setRadioValue1(false),
      setRadioValue2(false),
      setRadioValue3(false))
  }, [FormDetails.lankemMusterChitNumber]);

  useEffect(() => {
    if (FormDetails.lentdivisionID > 0) {
      trackPromise(
        getFieldDetailsByLentDivisionID());
    };
    setFormDetails({
      ...FormDetails,
      lentfieldID: 0
    })
  }, [FormDetails.lentdivisionID]);

  useEffect(() => {
    GetPluckingJobTypesByJobCategoryID();
    GetSundryJobTypesByJobCategoryID();
  }, []);

  async function getAllSectionTypes() {
    var response = await services.getAllSectionTypes();
    setSectionTypes(response);
  };

  async function getFieldDetailsByDivisionIDSectionTypeID() {
    var response = await services.getFieldDetailsByDivisionIDSectionTypeID(FormDetails.sectionTypeID, FormDetails.divisionID);
    setFields(response);
  };

  async function getFieldDetailsByLentDivisionID() {
    var response = await services.getFieldDetailsByLentDivisionID(FormDetails.lentdivisionID);
    setLentFields(response);
  };

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(FormDetails.estateID);
    setDivisions(response);
    setLentDivisions(response);
  };

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(FormDetails.groupID);
    let estateArray = [];
    for (let item of Object.entries(response.data)) {
      estateArray[item[1]["estateID"]] = item[1]["estateName"];
    }
    setEstates(estateArray);
    setLentEstates(estateArray);
    let estateCodeArray = [];
    for (let item of Object.entries(response.data)) {
      estateCodeArray[item[1]["estateID"]] = item[1]["estateCode"];
    }
    setEstatesCode(estateCodeArray)
  };

  async function getAllGroups() {
    var response = await services.getAllGroups();
    setGroups(response);
  };

  async function GetPluckingJobTypesByJobCategoryID() {
    var response = await services.GetPluckingJobTypesByJobCategoryID();
    setPluckingJobType(response);
  };

  async function GetSundryJobTypesByJobCategoryID() {
    var response = await services.GetSundryJobTypesByJobCategoryID();
    setSundryJobType(response);
  };

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWMUSTERCHITADDING');

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
    setFormDetails({
      ...FormDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function saveMusterChitDetails(fieldDataList) {
    let response = await services.saveMusterChitDetails(musterChitDetails);
    if (response.statusCode == "Success") {
      alert.success(response.message);
      setMusterChitDetails([]);
      await generateMusterChitNumber(FormDetails.estateID)
      allClearData();
    }
    else {

      alert.error(response.message);
    }
    setFormDetails({
      ...FormDetails,
      sectionTypeID: 0,
      divisionID: 0,
      fieldID: 0,
      lentdivisionID: 0,
      employeeCountID: '',
      lankemMusterChitNumber: ''
    })
    setFields([]);
    setRadioValue1(false);
    setRadioValue3(false);
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      [e.target.name]: value
    });
  }

  function handleDateChange(value) {
    setFormDetails({
      ...FormDetails,
      collectedDate: value
    });
  }

  function handleChange1(e) {
    if (radioValue1 === false) {
      setRadioValue1('active');
      setFormDetails({
        ...FormDetails,
        fieldID: 0
      })
    } else {
      setRadioValue1(false);
    }
  }

  function handleChange2(e) {
    setRadioValue2(true);
    setRadioValue3(false);
    setFormDetails({
      ...FormDetails,
      sundryJobTypeID: 0
    })
    setIsSundryJobClear(!IsSundryJobClear)
  }

  function handleChange3(e) {
    setRadioValue3(true);
    setRadioValue2(false);
    setFormDetails({
      ...FormDetails,
      pluckingJobTypeID: 0
    })
  }

  function handleSearchDropdownChangeFields(data, e) {
    if (data === undefined || data === null) {
      setFormDetails({
        ...FormDetails,
        sundryJobTypeID: '0'
      });
      return;
    } else {
      var valueV = data["jobTypeID"];

      setFormDetails({
        ...FormDetails,
        sundryJobTypeID: valueV
      });
    }
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

  function generateDropDownMenuForLent(data, selectedValue) {
    if (FormDetails.divisionID != 0) {
      let items = [];
      if (data != null) {
        for (const [key, value] of Object.entries(data)) {
          items.push(
            <MenuItem key={key} value={key} disabled={key === selectedValue}>
              {value}

            </MenuItem>

          );
        }
      }
      return items;
    }
  }

  function generateDropDownMenuForLentEstate(data, selectedValue) {
    selectedValue = selectedValue.toString()
    if (FormDetails.estateID != 0) {
      let items = [];
      if (data != null) {
        for (const [key, value] of Object.entries(data)) {
          items.push(
            <MenuItem key={key} value={key} disabled={key === selectedValue}>
              {value}
            </MenuItem>
          );
        }
      }
      return items;
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

  function ClearValues() {
    if (musterChitDetails.length >= 0) {
      setFormDetails({
        ...FormDetails,
        pluckingJobTypeID: 0,
        sundryJobTypeID: 0,
        collectedDate: new Date(),
        employeeCountID: '',
        lankemMusterChitNumber: ''
      });
      setRadioValue2(false);
      setRadioValue3(false);
      setIsSundryJobClear(!IsSundryJobClear)
    } else {
      setFormDetails({
        ...FormDetails,
        sectionTypeID: 0,
        divisionID: 0,
        fieldID: 0,
        lentdivisionID: 0,
        lentfieldID: 0,
        pluckingJobTypeID: 0,
        sundryJobTypeID: 0,
        collectedDate: new Date(),
        employeeCountID: '',
        lankemMusterChitNumber: ''
      });
      setRadioValue1(false);
      setRadioValue2(false);
      setRadioValue3(false);
      setIsSundryJobClear(!IsSundryJobClear)
    }
  }

  function allClearData() {
    if (musterChitDetails.length > 0) {
      setFormDetails({
        ...FormDetails,
        pluckingJobTypeID: 0,
        sundryJobTypeID: 0,
        collectedDate: new Date(),
        employeeCountID: '',
        lankemMusterChitNumber: ''
      });
      setRadioValue2(false);
      setRadioValue3(false);
    } else {
      setFormDetails({
        ...FormDetails,
        sectionTypeID: 0,
        divisionID: 0,
        fieldID: 0,
        lentEstateID: 0,
        lentdivisionID: 0,
        lentfieldID: 0,
        pluckingJobTypeID: 0,
        sundryJobTypeID: 0,
        collectedDate: new Date(),
        employeeCountID: '',
        lankemMusterChitNumber: ''
      });
      setRadioValue1(false);
      setRadioValue2(false);
      setRadioValue3(false);
    }
  }

  function generateMusterChitNumber(estateID) {
    if (FormDetails.estateID !== 0) {
      if (estatesCode.length !== 0) {
        const currentDate = new Date();
        const year = currentDate.getFullYear().toString().slice(-2);
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const date = currentDate.getDate().toString().padStart(2, '0');
        const hour = currentDate.getHours().toString().padStart(2, '0');
        const minutes = currentDate.getMinutes().toString().padStart(2, '0');
        const seconds = currentDate.getSeconds().toString().padStart(2, '0');
        const musterChitNumber = `M${estatesCode[estateID] == null ? estatesCode[estateID] == 0 : estatesCode[estateID]}${year}${month}${date}${hour}${minutes}${seconds}`;
        setMusterChitID(musterChitNumber)
      }
    }
  }

  function getSundryJobTypeName() {
    const selectedSundryJobType = SundryJobType.find((element) => element.jobTypeID === FormDetails.sundryJobTypeID);
    return selectedSundryJobType ? selectedSundryJobType.jobTypeName : '-';
  }

  async function AddFieldData() {
    if (radioValue2 == true || radioValue3 == true) {
      const isJobTypeAlreadyAdded = musterChitDetails.find(
        (item) => radioValue2 == true ?
          (parseInt(item.pluckingJobTypeID) === parseInt(FormDetails.pluckingJobTypeID)) :
          (parseInt(item.sundryJobTypeID) === parseInt(FormDetails.sundryJobTypeID))
      );

      if (isJobTypeAlreadyAdded) {
        alert.error('This job type has already been added.');
      } else {
        var array1 = [...musterChitDetails];
        array1.push({
          sectionTypeName: sectionTypes[FormDetails.sectionTypeID],
          divisionName: divisions[FormDetails.divisionID],
          fieldName: fields[FormDetails.fieldID],
          lentdivisionName: lentdivisions[FormDetails.lentdivisionID],
          lentEstateName: lentEstates[FormDetails.lentEstateID],
          lentfieldName: LentFields[FormDetails.lentfieldID],
          jobType: radioValue2 == true ? PluckingJobType[FormDetails.pluckingJobTypeID] : getSundryJobTypeName(),
          radioValueID: radioValue2 == true ? 1 : 2,
          employeeCount: parseInt(FormDetails.employeeCountID),
          radioValue2: radioValue2 == true ? 'Plucking' : 'Sundry',
          sectionTypeID: parseInt(FormDetails.sectionTypeID),
          divisionID: parseInt(FormDetails.divisionID),
          fieldID: parseInt(FormDetails.fieldID),
          lentEstateID: parseInt(FormDetails.lentEstateID),
          lentdivisionID: parseInt(FormDetails.lentdivisionID),
          lentfieldID: parseInt(FormDetails.lentfieldID),
          musterChitNumber: musterChitID,
          lankemMusterChitNumber: FormDetails.lankemMusterChitNumber,
          pluckingJobTypeID: parseInt(FormDetails.pluckingJobTypeID),
          sundryJobTypeID: parseInt(FormDetails.sundryJobTypeID),
          collectedDate: FormDetails.collectedDate.toISOString().split('T')[0],
          createdBy: parseInt(tokenDecoder.getUserIDFromToken())
        });
        setMusterChitDetails(array1);
        await generateMusterChitNumber(FormDetails.estateID)
        ClearValues();
      }
    } else {
      alert.error('Please select at least one job type');
    }
    setFormDetails({
      ...FormDetails,
      pluckingJobTypeID: 0,
      employeeCountID: '',
      lankemMusterChitNumber: ''
    })
  }

  const showDeleteConfirmation = (index) => {
    setDeleteIndex(index);
    setShowDeleteDialog(true);
  };

  const deleteDetails = (index) => {
    if (deleteIndex !== null) {
      const dataDelete = [...musterChitDetails];
      dataDelete.splice(deleteIndex, 1);
      setMusterChitDetails([...dataDelete]);
      if (dataDelete.length === 0) {
        setFormDetails({
          ...FormDetails,
          sectionTypeID: 0,
          divisionID: 0,
          fieldID: 0,
          lentdivisionID: 0,
          employeeCountID: '',
          lankemMusterChitNumber: ''
        })
        setFields([]);
        setRadioValue1(false);
      }
    }
    setShowDeleteDialog(false);

  };

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={"Muster Chit"}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: FormDetails.groupID,
              estateID: FormDetails.estateID,
              sectionTypeID: FormDetails.sectionTypeID,
              divisionID: FormDetails.divisionID,
              fieldID: FormDetails.fieldID,
              lentEstateID: FormDetails.lentEstateID,
              lentdivisionID: FormDetails.lentdivisionID,
              musterChitNumber: musterChitID,
              lankemMusterChitNumber: FormDetails.lankemMusterChitNumber,
              lentfieldID: FormDetails.lentfieldID,
              pluckingJobTypeID: FormDetails.pluckingJobTypeID,
              sundryJobTypeID: FormDetails.sundryJobTypeID,
              collectedDate: FormDetails.collectedDate,
              radioValue2: FormDetails.radioValue2,
              radioValue3: FormDetails.radioValue3,
              employeeCountID: FormDetails.employeeCountID,
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').min(1, 'Group is required'),
                estateID: Yup.number().required('Estate is required').min(1, 'Estate is required'),
                sectionTypeID: Yup.number().required('Section type is required').min(1, 'Section type is required'),
                divisionID: Yup.number().required('Division is required').min(1, 'Division is required'),
                fieldID: Yup.number().when([], {
                  is: () => !FormDetails.lentdivisionID && !FormDetails.lentEstateID,
                  then: Yup.number().required('Field is required').min(1, 'Field is required'),
                  otherwise: Yup.number().notRequired(),
                }),
                collectedDate: Yup.date().required('Date is required').min(1, 'Date is required'),
                employeeCountID: Yup.number().required('Emp Count is required').min(1, 'Emp Coun is required'),
                lankemMusterChitNumber: Yup.string().required('Muster Chit Number is required').min(1, 'Muster ChitNumber is required'),
                lentEstateID: Yup.number().when([], {
                  is: () => radioValue1 && FormDetails.lentEstateID,
                  then: Yup.number().required('Lent Estate is required').min(1, 'Lent Estate or Lent Division is required'),
                  otherwise: Yup.number().notRequired(),
                }),
                lentdivisionID: Yup.number().when([], {
                  is: () => radioValue1 && FormDetails.lentdivisionID,
                  then: Yup.number().required('Lent Division is required').min(1, 'Lent Estate or Lent Division is required'),
                  otherwise: Yup.number().notRequired(),
                }),
                lentfieldID: Yup.number().when([], {
                  is: () => radioValue1 && FormDetails.lentfieldID,
                  then: Yup.number().required('Lent Field is required').min(1, 'Lent Field is required'),
                  otherwise: Yup.number().notRequired(),
                }),

                pluckingJobTypeID: Yup.number().when([], {
                  is: () => radioValue2,
                  then: Yup.number().required('Plucking Job Type is required').min(1, ' Plucking Job Type is required'),
                  otherwise: Yup.number().notRequired(),
                }),

                sundryJobTypeID: Yup.number().when([], {
                  is: () => radioValue3,
                  then: Yup.number().required('Sundry Job Type is required').min(1, 'Sundry Job Type is required'),
                  otherwise: Yup.number().notRequired(),
                }),
              })
            }
            onSubmit={() => AddFieldData()}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              isSubmitting,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle("Muster Chit Add")}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item md={3} xs={3}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.groupID}
                              variant="outlined"
                              size='small'
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false || musterChitDetails.length > 0 ? true : false,
                              }}
                            >
                              <MenuItem value={'0'}>--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={3}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              placeholder='--Select Estate--'
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false || musterChitDetails.length > 0 ? true : false
                              }}
                            >
                              <MenuItem value={0}>--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={3}>
                            <InputLabel shrink id="sectionTypeID">
                              Section Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.sectionTypeID && errors.sectionTypeID)}
                              fullWidth
                              helperText={touched.sectionTypeID && errors.sectionTypeID}
                              name="sectionTypeID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e);
                              }}
                              value={FormDetails.sectionTypeID}
                              variant="outlined"
                              id="sectionTypeID"
                              disabled={FormDetails.lentdivisionID !== 0}
                              InputProps={{
                                readOnly: musterChitDetails.length > 0 ? true : false,
                              }}

                            >
                              <MenuItem value={0}>--Select Section Type--</MenuItem>
                              {generateDropDownMenu(sectionTypes)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={3}>
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
                              value={FormDetails.divisionID}
                              variant="outlined"
                              id="divisionID"
                              disabled={FormDetails.lentEstateID !== 0 || FormDetails.lentdivisionID !== 0}
                              InputProps={{
                                readOnly: musterChitDetails.length > 0 ? true : false,
                              }}

                            >
                              <MenuItem value={0}>--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={3}>
                            <InputLabel shrink id="fieldID">
                              Field *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.fieldID && errors.fieldID)}
                              fullWidth
                              helperText={touched.fieldID && errors.fieldID}
                              name="fieldID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.fieldID}
                              variant="outlined"
                              id="fieldID"
                              disabled={radioValue1}
                              InputProps={{
                                readOnly: musterChitDetails.length > 0 ? true : false,
                              }}
                            >
                              <MenuItem value='0'>--Select Field--</MenuItem>
                              {generateDropDownMenu(fields)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={3}>
                            <InputLabel shrink id="musterChitNumber">
                              Agrigen Reference Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.musterChitNumber && errors.musterChitNumber)}
                              fullWidth
                              helperText={touched.musterChitNumber && errors.musterChitNumber}
                              name="musterChitNumber"
                              onBlur={handleBlur}
                              onChange={(e) => handleChange(e)}
                              value={musterChitID}
                              variant="outlined"
                              size='small'
                              id="musterChitNumber"
                              InputProps={{
                                readOnly: true
                              }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={3}>
                            <InputLabel shrink id="lankemMusterChitNumber">
                              Muster Chit Number *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.lankemMusterChitNumber && errors.lankemMusterChitNumber)}
                              fullWidth
                              helperText={touched.lankemMusterChitNumber && errors.lankemMusterChitNumber}
                              name="lankemMusterChitNumber"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.lankemMusterChitNumber}
                              variant="outlined"
                              id="lankemMusterChitNumber"
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={3}>
                            <InputLabel shrink id="collectedDate">
                              Date *
                            </InputLabel>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                error={Boolean(touched.collectedDate && errors.collectedDate)}
                                helperText={touched.collectedDate && errors.collectedDate}
                                autoOk
                                fullWidth
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="dense"
                                name="collectedDate"
                                size="small"
                                id="collectedDate"
                                maxDate={maxDate}
                                minDate={minDate}
                                value={FormDetails.collectedDate}
                                onChange={(e) => {
                                  handleDateChange(e);
                                }}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputProps={{ readOnly: true }}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>


                          <Grid item md={3} xs={3} style={{ marginTop: '15px' }}>
                            <RadioGroup row
                              aria-labelledby="demo-controlled-radio-buttons-group"
                              name="controlled-radio-buttons-group"
                            >
                              <FormControlLabel
                                control={
                                  <Radio
                                    checked={radioValue1}
                                    onChange={handleChange1}
                                    disabled={(FormDetails.divisionID) == 0 ? true : false || FormDetails.fieldID > 0 ? true : false}
                                    style={{ pointerEvents: musterChitDetails.length > 0 ? 'none' : 'auto' }}
                                  />
                                }
                                label="Lent Labour"
                                labelPlacement="start"
                                style={{ fontSize: '1px', marginLeft: 0 }}
                              />
                            </RadioGroup>
                          </Grid>
                          <Grid item md={3} xs={3}>
                            <InputLabel shrink id="lentEstateID">
                              Lent Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.lentEstateID && errors.lentEstateID)}
                              fullWidth
                              helperText={touched.lentEstateID && errors.lentEstateID}
                              name="lentEstateID"
                              placeholder='--Select Estate--'
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.lentEstateID}
                              variant="outlined"
                              id="lentEstateID"
                              disabled={!radioValue1 || FormDetails.lentdivisionID !== 0}
                            >
                              <MenuItem value={0}>--Select Estate--</MenuItem>
                              {generateDropDownMenuForLentEstate(lentEstates, FormDetails.estateID)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={3}>
                            <InputLabel shrink id="lentdivisionID">
                              Lent Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.lentdivisionID && errors.lentdivisionID)}
                              fullWidth
                              helperText={touched.lentdivisionID && errors.lentdivisionID}
                              name="lentdivisionID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e);
                              }}
                              value={FormDetails.lentdivisionID}
                              variant="outlined"
                              id="lentdivisionID"
                              disabled={!radioValue1 || FormDetails.lentEstateID !== 0}
                              InputProps={{
                                readOnly: musterChitDetails.length > 0 ? true : false,
                              }}
                            >
                              <MenuItem value={0}>--Select Lent Division--</MenuItem>
                              {generateDropDownMenuForLent(lentdivisions, FormDetails.divisionID)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={3}>
                            <InputLabel shrink id="lentfieldID">
                              Lent Field *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.lentfieldID && errors.lentfieldID)}
                              fullWidth
                              helperText={touched.lentfieldID && errors.lentfieldID}
                              name="lentfieldID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e);
                              }}
                              value={FormDetails.lentfieldID}
                              variant="outlined"
                              id="lentfieldID"
                              disabled={(FormDetails.lentdivisionID === 0) ? true : false}
                              InputProps={{
                                readOnly: musterChitDetails.length > 0 ? true : false,
                              }}
                            >
                              <MenuItem value={0}>--Select Lent Field--</MenuItem>
                              {generateDropDownMenuForLent(LentFields)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={3} container>
                            <Grid item md={1} xs={3} style={{ marginTop: '15px', marginLeft: '2px' }}>
                              <RadioGroup row
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                              >
                                <FormControlLabel
                                  value="radioValue2"
                                  control={
                                    <Radio
                                      checked={radioValue2}
                                      onChange={handleChange2}
                                    />
                                  }
                                  label="Plucking"
                                  labelPlacement="start"
                                  style={{ fontSize: '5px', marginLeft: 0 }}
                                />
                              </RadioGroup>
                            </Grid>
                            <Grid item md={2} xs={3} style={{ marginTop: '15px', marginLeft: '110px' }}>
                              <RadioGroup row
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                              >
                                <FormControlLabel
                                  value="radioValue3"
                                  control={
                                    <Radio
                                      checked={radioValue3}
                                      onChange={handleChange3}
                                    />
                                  }
                                  label="Sundry"
                                  labelPlacement="start"
                                  style={{ fontSize: '12px', marginLeft: 0 }}
                                />
                              </RadioGroup>
                            </Grid>
                          </Grid>
                          <Grid item md={3} xs={3} hidden={!radioValue2}>
                            <InputLabel shrink id="pluckingJobTypeID">
                              {'\u00A0'}
                              Job Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.pluckingJobTypeID && errors.pluckingJobTypeID)}
                              fullWidth
                              helperText={touched.pluckingJobTypeID && errors.pluckingJobTypeID}
                              name="pluckingJobTypeID"
                              onChange={(e) => handleChange(e)}
                              value={radioValue2 ? FormDetails.pluckingJobTypeID : 0}
                              variant="outlined"
                              id="pluckingJobTypeID"
                              size='small'
                              onBlur={handleBlur}
                              disabled={!radioValue2}
                            >
                              <MenuItem value="0">--Select Plucking Job--</MenuItem>
                              {generateDropDownMenu(PluckingJobType)}
                            </TextField>
                          </Grid>

                          <Grid item md={3} xs={3} hidden={!radioValue3}>
                            <InputLabel shrink id="sundryJobTypeID">
                              {'\u00A0'}
                              Job Type *
                            </InputLabel>
                            <Autocomplete
                              key={IsSundryJobClear}
                              id="sundryJobTypeID"
                              options={SundryJobType}
                              getOptionLabel={(option) => option.jobTypeName != null ? option.jobTypeName.toString() : null}
                              onChange={(e, value) => handleSearchDropdownChangeFields(value, e)}
                              defaultValue={null}
                              disabled={radioValue3 === false}
                              renderInput={(params) =>
                                <TextField {...params}
                                  variant="outlined"
                                  name="sundryJobTypeID"
                                  fullWidth
                                  size='small'
                                  placeholder='--Select Sundry Job Type--'
                                  value={values.sundryJobTypeID}
                                  getOptionDisabled={true}
                                  helperText={touched.sundryJobTypeID && errors.sundryJobTypeID}
                                  onBlur={handleBlur}
                                  error={Boolean(touched.sundryJobTypeID && errors.sundryJobTypeID)}
                                >
                                  <MenuItem value={'0'} >--Select Sundry Job Type--</MenuItem>
                                </TextField>
                              }
                            />
                          </Grid>
                          <Grid item md={3} xs={3}>
                            <InputLabel shrink id="employeeCountID">
                              Employee Count *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.employeeCountID && errors.employeeCountID)}
                              fullWidth
                              helperText={touched.employeeCountID && errors.employeeCountID}
                              name="employeeCountID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.employeeCountID}
                              variant="outlined"
                              id="employeeCountID"
                            >
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container justify="flex-end" spacing={3}>
                          <Box pr={2} style={{ marginTop: '20px' }}>
                            <Button
                              color="primary"
                              variant="outlined"
                              type="reset"
                              onClick={allClearData}
                              size='small'
                            >
                              Clear
                            </Button>
                          </Box>
                          <Box pr={2} style={{ marginTop: '20px' }}>
                            <Button
                              color="primary"
                              variant="contained"
                              type="submit"
                              size='small'
                            >
                              Add
                            </Button>
                          </Box>
                        </Grid>
                        <br />
                        <br />
                        <Grid container spacing={2}>
                          {(musterChitDetails.length > 0) ?
                            <Grid item xs={12}>
                              <TableContainer >
                                <Table className={classes.table} aria-label="caption table">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell align="center" style={{ fontWeight: "bold" }}>Agrigen Reference Number</TableCell>
                                      <TableCell align="center" style={{ fontWeight: "bold" }}>Muster Chit Number</TableCell>
                                      <TableCell align="center" style={{ fontWeight: "bold" }}>Section type Name</TableCell>
                                      <TableCell align="center" style={{ fontWeight: "bold" }}>Division Name</TableCell>
                                      <TableCell align="center" style={{ fontWeight: "bold" }}>Type</TableCell>
                                      <TableCell align="center" style={{ fontWeight: "bold" }}>Field</TableCell>
                                      <TableCell align="center" style={{ fontWeight: "bold" }}>Lent Estate</TableCell>
                                      <TableCell align="center" style={{ fontWeight: "bold" }}>Lent Division</TableCell>
                                      <TableCell align="center" style={{ fontWeight: "bold" }}>Lent Field</TableCell>
                                      <TableCell align="center" style={{ fontWeight: "bold" }}>Job Type</TableCell>
                                      <TableCell align="center" style={{ fontWeight: "bold" }}>Employee Count</TableCell>
                                      <TableCell align="center" style={{ fontWeight: "bold" }}>Action</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {musterChitDetails.map((rowData, index) => (
                                      <TableRow key={index}>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.musterChitNumber)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.lankemMusterChitNumber)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.sectionTypeName)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.divisionName)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.radioValue2)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.fieldName !== undefined ? rowData.fieldName : '-')}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {rowData.lentEstateName !== undefined ? rowData.lentEstateName : '-'}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {rowData.lentdivisionName !== undefined ? rowData.lentdivisionName : '-'}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {rowData.lentfieldName !== undefined ? rowData.lentfieldName : '-'}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.jobType)}
                                        </TableCell>
                                        <TableCell align='center' component="th" scope="row" style={{ borderBottom: "none" }}>
                                          {(rowData.employeeCount)}
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
                                            onClick={() => showDeleteConfirmation(rowData, index)}
                                          >
                                          </DeleteIcon>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid> : null}
                        </Grid>
                        <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth="sm" fullWidth>
                          <DialogTitle style={{ fontSize: '2.5rem' }}>Confirmation</DialogTitle>
                          <DialogContent style={{ fontSize: '1rem' }}>
                            Are you sure want to delete this record?
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={() => setShowDeleteDialog(false)} color="primary">
                              Cancel
                            </Button>
                            <Button onClick={deleteDetails} color="primary">
                              Confirm
                            </Button>
                          </DialogActions>
                        </Dialog>
                        {(musterChitDetails.length > 0) ?
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            <Button
                              color="primary"
                              disabled={isSubmitting || isDisableButton}
                              type="button"
                              variant="contained"
                              size='small'
                              onClick={() => saveMusterChitDetails()}
                            >
                              {"Save"}
                            </Button>
                          </Box>
                          : null}
                      </CardContent>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>)


}

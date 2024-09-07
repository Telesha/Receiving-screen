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
  InputLabel,
  Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
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
  row: {
    marginTop: '1rem'
  }

}));

const screenCode = 'FUNDMAINTAINANCE';

export default function FundMasterAddEdit(props) {
  const [title, setTitle] = useState("Add Saving & Fund");
  const alert = useAlert();
  const classes = useStyles();
  const [FormDetails, setFormDetails] = useState({
    groupID: 0,
    factoryID: 0,
    fundCode: '',
    fundName: '',
    deductionMethodID: 0,
    amount: 0,
    isActive: true
  });
  const [GroupList, setGroupList] = useState([]);
  const [FactoryList, setFactoryList] = useState([]);
  const [fundMasterId, setFundMasterId] = useState(0);
  const [isUpdate, setIsUpdate] = useState(false);
  const [fieldDisable, setFieldDisable] = useState(false);
  const [buttonName, setButtonName] = useState("Add");
  const { fundMasterID } = useParams();
  const [count,setCount]= useState(0);

  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  let decryptedID = 0;

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/fundMaintenance/listing');
  };

  useEffect(() => {
    trackPromise(
      getPermission()
    );
    decryptedID = atob(fundMasterID.toString());
    if (decryptedID != 0) {
      trackPromise(
        getFundMaintenanceDetails(decryptedID)
      )
    }
  }, []);

  useEffect(() => {
    getFactoryByGroupID(FormDetails.groupID);
  }, [FormDetails.groupID]);

  useEffect(() => {
    clearAmounts();
    setCount(count+1);
  }, [FormDetails.deductionMethodID]);

  async function clearAmounts(){
    if(count>1&&atob(fundMasterID.toString())!==0)
    setFormDetails({...FormDetails,amount:0});
  }

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITFUNDMAINTAINANCE');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setFormDetails({
      ...FormDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    });
    getAllGroups();
  }

  async function getFundMaintenanceDetails(id) {
    var response = await services.getFundMaintenanceDetailsByID(id);
    setFormDetails(response);
    setTitle("Edit Fund");
    setButtonName("Update");
    setIsUpdate(true);
    setFundMasterId(id);
    setFieldDisable(true);
  }

  async function saveFundMasterDetails() {

    var response = {};

    if (isUpdate) {
      response = await services.updateFundMaster(FormDetails, fundMasterId);
    } else {
      response = await services.saveFundMaster(FormDetails);
    }

    if (response.statusCode == "Success") {
      setFundMasterId(0);
      setIsUpdate(false);
      setButtonName("Add");
      alert.success(response.message);
      navigate('/app/fundMaintenance/listing');
      clearFormFields();
    }
    else {
      alert.error(response.message);
    }

  };

  function clearFormFields() {
    setFormDetails({
      ...FormDetails,
      fundName: '',
      fundCode: '',
      deductionMethodID: 0,
      amount: 0
    });
    document.querySelector('.csv-input').value = '';
  }

  async function getAllGroups() {
    var response = await services.getAllGroups();
    setGroupList(response);
  };

  async function getFactoryByGroupID(groupID) {
    var response = await services.getFactoryByGroupID(groupID);
    setFactoryList(response);
  };

  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      groupID: value,
      factoryID: "0",
      fundCode: '',
      fundName: '',
      deductionMethodID: 0,
      amount: 0
    });
  }

  function handleFactoryChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      factoryID: value,
      fundName: '',
      fundCode: '',
      deductionMethodID: 0,
      amount: 0
    });
  }


  function handleChange(e) {
    const target = e.target;
    const value = target.value
  
    setFormDetails({
      ...FormDetails,
      [e.target.name]: value
    });

  }

  function handleChangeSwitch(e) {
    const target = e.target;
    const value = target.checked;
    setFormDetails({
      ...FormDetails,
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
    <Page className={classes.root} title={title}>
      <Container maxWidth={false}>
        <Formik
          initialValues={{
            groupID: FormDetails.groupID,
            factoryID: FormDetails.factoryID,
            fundName: FormDetails.fundName,
            deductionMethodID: FormDetails.deductionMethodID,
            amount: FormDetails.amount,
            isActive: FormDetails.isActive,
            fundCode: FormDetails.fundCode
          }}
          validationSchema={
            Yup.object().shape({
              groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
              factoryID: Yup.number().min(1, "Please Select a Factory").required('Factory is required'),
              fundName: Yup.string().max(255).required('Fund Name is required').matches(/^[a-zA-Z0-9\d\s]+$/, 'Special characters are not allowed'),
              deductionMethodID: Yup.number().min(1, "Please Select a Deduction Method").required('Deduction Method is required'),
              amount: Yup.string().required('Amount is required').matches(/^[0-9\b\.]+$/, 'Only allow numerical values')
                .when('deductionMethodID',
                  {
                    is: val => val === 1,
                    then: Yup.string()
                      .min(0, 'Amount should greater than 0')
                      .matches(/^(?:100(?:\.00?)?|\d?\d(?:\.\d\d?)?)$/, 'Should greater than 0 and less than 100 and allow only 2 decimal points'),

                    otherwise: Yup.string()
                      .test('amount', "Please provide valid amount", val => val > 0)
                      .matches(/^(\d{1,5}|\d{0,5}\.\d{1,2})$/, 'Should less than 5 digits and allow only 2 decimal points'),
                  }),
              fundCode: Yup.string().required('Fund code is required').matches(/^[0-9\b]+$/, 'Only allow numbers')
                .min(2, 'Fund code must be at least 2 characters').max(2, 'Fund Code must be at most 2 characters'),
            })
          }
          onSubmit={saveFundMasterDetails}
          enableReinitialize
        >
          {({
            errors,
            handleBlur,
            handleSubmit,
            touched,
            values
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
                          <Grid item md={6} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>

                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              disabled={fieldDisable}
                              size = 'small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleGroupChange(e)
                              }}
                              value={FormDetails.groupID}
                              variant="outlined"
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled,
                              }}
                            >
                              <MenuItem value={'0'} disabled={true}>
                                --Select Group--
                            </MenuItem>
                              {generateDropDownMenu(GroupList)}
                            </TextField>

                          </Grid>
                          <Grid item md={6} xs={12}>
                            <InputLabel shrink id="factoryID">
                              Factory *
                            </InputLabel>

                            <TextField select
                              error={Boolean(touched.factoryID && errors.factoryID)}
                              fullWidth
                              helperText={touched.factoryID && errors.factoryID}
                              disabled={fieldDisable}
                              name="factoryID"
                              onBlur={handleBlur}
                              size = 'small'
                              onChange={(e) => {
                                handleFactoryChange(e)
                              }}
                              value={FormDetails.factoryID}
                              variant="outlined"
                              id="factoryID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled,
                              }}
                            >
                              <MenuItem value={0} disabled={true}>
                                --Select Factory--
                            </MenuItem>
                              {generateDropDownMenu(FactoryList)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fundCode">
                              Saving & Fund Code *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fundCode && errors.fundCode)}
                              fullWidth
                              helperText={touched.fundCode && errors.fundCode}
                              disabled={fieldDisable}
                              name="fundCode"
                              id="fundCode"
                              size = 'small'
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={FormDetails.fundCode}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="fundName">
                              Saving & Fund Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.fundName && errors.fundName)}
                              fullWidth
                              helperText={touched.fundName && errors.fundName}
                              size = 'small'
                              name="fundName"
                              id="fundName"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={FormDetails.fundName}
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="deductionMethodID">
                              Deduction Method *
                            </InputLabel>

                            <TextField select
                              error={Boolean(touched.deductionMethodID && errors.deductionMethodID)}
                              fullWidth
                              helperText={touched.deductionMethodID && errors.deductionMethodID}
                              size = 'small'
                              name="deductionMethodID"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.deductionMethodID}
                              variant="outlined"
                              id="deductionMethodID"
                            >
                              <MenuItem value={0} disabled={true}>
                                --Select Deduction Method--
                            </MenuItem>
                              <MenuItem value={1}>
                                Percentage
                            </MenuItem>
                              <MenuItem value={2}>
                                Flat
                            </MenuItem>
                            <MenuItem value={3}>
                                Per Kilo Rate
                            </MenuItem>
                            </TextField>

                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="amount">
                            Amount(RS) / Percentage(%) *
                                                    </InputLabel>
                            <TextField
                              error={Boolean(touched.amount && errors.amount)}
                              fullWidth
                              helperText={touched.amount && errors.amount}
                              name="amount"
                              id="amount"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={FormDetails.amount}
                              variant="outlined"
                              size = 'small'
                            />
                          </Grid>
                          <Grid item md={4} xs={12}>
                            <InputLabel shrink id="isActive">
                              Active
                                                    </InputLabel>
                            <Switch
                              checked={FormDetails.isActive}
                              onChange={(e) => handleChangeSwitch(e)}
                              name="isActive"
                              id="isActive"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>                     
                            <Box display="flex" justifyContent="flex-end" p={2}>
                              <Button
                                color="primary"
                                type="submit"
                                variant="contained"
                                size = 'small'
                              >
                                {buttonName}
                              </Button>
                            </Box>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
        </Formik>
      </Container>
    </Page >)
}

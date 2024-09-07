import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  makeStyles,
  Container,
  Button,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
  FormControl,
  TextField,
  Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from "yup";
import PageHeader from 'src/views/Common/PageHeader';
import { useAlert } from "react-alert";
import MenuItem from '@material-ui/core/MenuItem';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { TabPanel } from './tabPanel';
import AppBar from '@material-ui/core/AppBar';
import { GeneralDetails } from './TabPages/GeneralDetails';
import { FactoryAccounts } from './TabPages/FactoryAccounts';
import { Productdetails } from './TabPages/ProductDetails';
import { ContactInformation } from './TabPages/ContactInformation';
import { trackPromise } from 'react-promise-tracker';
import { LoadingComponent } from '../../../utils/newLoader';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';

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
  root1: {
    flexGrow: 4
  },

}));

const screenCode = 'FACTORY';
export default function EstateAddEdit() {
  const classes = useStyles();
  const [oldData, setOldData] = useState([]);//use this for contact
  const [factoryAccountArray, setFactoryAccountArray] = useState([]);//use this for facory
  const [productDetailsArray, setProductDetailsArray] = useState([]);//use this for productDetails
  const [generalDetailsArray, setGeneralDetailsArray] = useState([]);//use this for general details
  const [factoryMain, setFactoryMain] = useState({
    groupID: 0,
    isActive: true
  });
  const [checker, setChecker] = useState(false);
  const [checker1, setChecker1] = useState(false);
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/factories/listing');
  }
  const alert = useAlert();
  const [groups, setGroups] = useState([]);
  const [value, setValue] = React.useState(0);
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };
  const [isDisable, setIsDisable] = useState(false);
  const { factoryID } = useParams();
  const [isUpdate, setIsUpdate] = useState(false);
  let decryptedID = 0;
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
  });
  const [factoryIsActive, setFactoryIsActive] = useState(true);

  useEffect(() => {
    decryptedID = atob(factoryID.toString());
    if (decryptedID != 0) {
      setIsUpdate(true);
      // trackPromise(getGroupIDbyFactoryID(decryptedID));
      trackPromise(getFactoryDetails(decryptedID));
      trackPromise(getFactoryAccountDetails(decryptedID));
      trackPromise(getFactoryProductDetails(decryptedID));
    }
  }, []);

  useEffect(() => {
    trackPromise(
      getGroupsForDropdown(), getPermission()
    );
  }, []);

  function onIsActiveChange() {
    setFactoryMain({
      ...factoryMain,
      isActive: !factoryMain.isActive
    });
  }

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITFACTORY');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
    });
    if (parseInt(atob(factoryID.toString())) === 0) {
      setFactoryMain({
        ...factoryMain,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
      })
    }
  }

  async function getGroupIDbyFactoryID(factoryID) {
    let response = await services.getGroupIDbyFactoryID(factoryID);
    setFactoryMain({ ...factoryMain, groupID: response.groupID });
    setIsDisable(false);
  }

  async function getFactoryProductDetails(factoryID) {
    let responseProduct = await services.getFactoryProductDetailsByFactoryID(factoryID);

    if (responseProduct != null || responseProduct != undefined) {
      for (var i = 0; i < responseProduct.length; i++) {
        var newProductDetailsArray = productDetailsArray;
        newProductDetailsArray.push(responseProduct[i]);
        setProductDetailsArray(newProductDetailsArray);
      }
    }
    else {
      alert.error('Error in loading...!');
    }

  }

  async function getFactoryAccountDetails(factoryID) {
    let responseAccount = await services.getFactoryAccountsByFactoryID(factoryID);

    if (responseAccount != null || responseAccount != undefined) {
      for (var i = 0; i < responseAccount.length; i++) {
        var newfactoryAccountArray = factoryAccountArray;
        newfactoryAccountArray.push(responseAccount[i]);
        setFactoryAccountArray(newfactoryAccountArray);
      }
    }
    else {
      alert.error('Error in loading...!');
    }

  }

  async function getFactoryDetails(factoryID) {
    let response = await services.getFactoryDetailsByFactoryID(factoryID);
    if (response != null || response != undefined) {
      setGeneralDetailsArray({
        ...generalDetailsArray,
        factoryCode: response[0].factoryCode,
        factoryName: response[0].factoryName,
        taxNumber: response[0].taxNumber,
        managerName: response[0].managerName,
        brNumber: response[0].brNumber
      });

      setOldData({
        ...oldData,
        officePhone: response[0].officePhone,
        officialEmail: response[0].officialEmail,
        faxNumber: response[0].faxNumber,
        billingEmail: response[0].billingEmail,
        zipCode: response[0].zipCode,
        location: response[0].location,
        address1: response[0].address1,
        address2: response[0].address2,
        address3: response[0].address3,
        contactID: response[0].contactID
      });
      setFactoryMain({
        ...factoryMain,
        groupID: response[0].groupID,
        isActive: response[0].isActive
      });
      setFactoryIsActive(response[0].isActive);

      setValue(1);
      setValue(0);
    }
    else {
      alert.error('Error in loading...!');
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function saveUser(values) {

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

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  function ChechBeforeSave() {
    if (oldData.length <= 0 || factoryAccountArray.length <= 0 || generalDetailsArray == null || productDetailsArray.length <= 0) {
      return true;
    }
    else {
      return false;
    }
  }
  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setFactoryMain({
      ...factoryMain,
      [e.target.name]: value
    });
  }

  async function SaveDetails() {

    if (oldData.length <= 0 || factoryAccountArray.length <= 0 || generalDetailsArray == null || (Object.keys(productDetailsArray.filter(x => x.isActive == true)).length <= 0)) {
      alert.error('Please fill all tabs');
    }
    else {
      if (!isUpdate) {
        let saveModel = {
          groupID: factoryMain.groupID,
          isActive: factoryMain.isActive,
          factoryCode: generalDetailsArray.factoryCode,
          factoryName: generalDetailsArray.factoryName,
          taxNumber: generalDetailsArray.taxNumber,
          brNumber: generalDetailsArray.brNumber,
          managerName: generalDetailsArray.managerName,
          contact: oldData,
          account: factoryAccountArray,
          product: productDetailsArray,
        }

        let response = await services.saveFactory(saveModel);

        if (response.statusCode == "Success") {
          alert.success(response.message);
          navigate('/app/factories/listing');
        }
        else {
          alert.error(response.message);
        }
      } else {

        let updateModel = {
          factoryID: atob(factoryID.toString()),
          groupID: factoryMain.groupID,
          isActive: factoryMain.isActive,
          factoryCode: generalDetailsArray.factoryCode,
          factoryName: generalDetailsArray.factoryName,
          taxNumber: generalDetailsArray.taxNumber,
          brNumber: generalDetailsArray.brNumber,
          managerName: generalDetailsArray.managerName,
          contact: oldData,
          account: factoryAccountArray,
          product: productDetailsArray,
        }

        let response = await services.UpdateFactory(updateModel);

        if (response.statusCode == "Success") {
          alert.success(response.message);
          navigate('/app/factories/listing');
        }
        else {
          setFactoryMain({
            ...factoryMain,
            isActive: factoryIsActive
          });
          alert.error(response.message);
        }
      }
    }
  }

  function handleChange1(e) {
    const target = e.target;
    const value = target.value
    setFactoryMain({
      ...factoryMain,
      [e.target.name]: value
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
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title="Factories Add Edit">
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: factoryMain.groupID,

            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().required('Group is required').positive('Please select a group'),
              })
            }
            onSubmit={saveUser}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle("Estate Registration")}
                    />

                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>

                        <Grid container spacing={3}>
                          <Grid item md={4} xs={12}>
                            <FormControl variant="outlined" fullWidth label="Group"
                              error={Boolean(touched.groupID && errors.groupID)}
                              helperText={touched.groupID && errors.groupID}>
                              <InputLabel shrink id="groupID">
                                Group *
                              </InputLabel><br />
                              <TextField select
                                error={Boolean(touched.groupID && errors.groupID)}
                                fullWidth
                                helperText={touched.groupID && errors.groupID}
                                size = 'small'
                                name="groupID"
                                onBlur={handleBlur}
                                onChange={(e) => handleChange1(e)}
                                value={factoryMain.groupID}
                                variant="outlined"
                                InputProps={{
                                  readOnly: isUpdate || !permissionList.isGroupFilterEnabled ? true : false,
                                }}
                              >
                                <MenuItem value="0">--Select Group--</MenuItem>
                                {generateDropDownMenu(groups)}
                              </TextField>
                            </FormControl>
                          </Grid>
                        </Grid>

                        <Grid container spacing={4}>
                          <Grid className={classes.root1} item xs={12}>
                            <AppBar position="static">
                              <Tabs value={value} onChange={handleTabChange} variant={'fullWidth'} classes={{ indicator: classes.indicator }}
                                aria-label="simple tabs example" style={{ backgroundColor: "White" }}>
                                <Tab label="General" {...a11yProps(0)} style={{ color: "black" }} />
                                <Tab label="Contact Information" {...a11yProps(1)} style={{ color: "black" }} />
                                <Tab label="Estate Accounts" {...a11yProps(2)} style={{ color: "black" }} />
                                <Tab label="Product Details" {...a11yProps(3)} style={{ color: "black" }} />
                              </Tabs>
                            </AppBar>
                            <TabPanel value={value} index={0}>
                              <GeneralDetails generalDetailsArray={generalDetailsArray} setGeneralDetailsArray={setGeneralDetailsArray} isUpdate={isUpdate} />
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                              <ContactInformation oldData={oldData} setOldData={setOldData} />
                            </TabPanel>
                            <TabPanel value={value} index={2}>
                              <FactoryAccounts factoryAccountArray={factoryAccountArray} setFactoryAccountArray={setFactoryAccountArray} setChecker1={setChecker1} checker1={checker1} />
                            </TabPanel>
                            <TabPanel value={value} index={3}>
                              <Productdetails productDetailsArray={productDetailsArray} setProductDetailsArray={setProductDetailsArray} setChecker={setChecker} checker={checker} />
                            </TabPanel>

                          </Grid>
                        </Grid>
                      </CardContent>
                      <Grid container spacing={0} >
                        <Grid item md={1} xs={12} style={{ marginLeft: '5rem' }}>
                          <InputLabel id="isActive">
                            Active
                          </InputLabel>
                          <Switch
                            error={Boolean(touched.isActive && errors.isActive)}
                            helperText={touched.isActive && errors.isActive}
                            checked={factoryMain.isActive}
                            onBlur={handleBlur}
                            onChange={onIsActiveChange}
                            name="isActive"
                          />
                        </Grid>
                      </Grid>
                      <Box display="flex" justifyContent="flex-end" p={2}>
                        <Button
                          color="primary"
                          disabled={isSubmitting || (isUpdate ? false : !checker) || ChechBeforeSave() || (isUpdate ? false : !checker1)}
                          type="submit"
                          variant="contained"
                          style={{ marginLeft: '1rem' }}
                          onClick={() => SaveDetails()}
                          size = 'small'
                        >
                          {isUpdate == true ? "Update" : "Save"}
                        </Button>
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
};


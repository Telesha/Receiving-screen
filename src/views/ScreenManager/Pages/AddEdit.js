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
import { ScreenConfig } from './TabPages/ScreenConfig';
import { MenuConfig } from './TabPages/MenuConfig';
import { PermissionConfig } from './TabPages/PermissionConfig';
import { ParentMenuConfig } from './TabPages/ParentMenuConfig';
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

const screenCode = 'SCREENMANAGER';
export default function ScreenManagerAddEdit() {
  const classes = useStyles();
  const [title, setTitle] = useState("Screen Manager")
  const [factoryMain, setFactoryMain] = useState({
    groupID: 0,
    isActive: true
  });
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/app/operationEntities/listing');
  }
  const alert = useAlert();
  const [Groups, setGroups] = useState([]);
  const [Factories, setFactories] = useState([]);
  const [value, setValue] = React.useState(0);
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };
  const { factoryID } = useParams();
  let decryptedID = 0;
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });
  const [FormData, setFormData] = useState({
    groupID: 0,
    factoryID: 0
  })

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropdown());
  }, [FormData.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWSCREENMANAGER');

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

    if (parseInt(atob(factoryID.toString())) === 0) {
      setFactoryMain({
        ...factoryMain,
        groupID: parseInt(tokenService.getGroupIDFromToken()),
      })
    }
  }

  async function getGroupsForDropdown() {
    const groups = await services.getGroupsForDropdown();
    setGroups(groups);
  }

  async function getFactoriesForDropdown() {
    const factories = await services.getFactoriesByGroupID(FormData.groupID);
    setFactories(factories);
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

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setFormData({
      ...FormData,
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
                factoryID: Yup.number().required('Group is required').positive('Please select a group'),
              })
            }
            // onSubmit={ }
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              isSubmitting,
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
                        <Grid container spacing={4}>
                          <Grid className={classes.root1} item xs={12}>
                            <AppBar position="static">
                              <Tabs value={value} onChange={handleTabChange} variant={'fullWidth'} classes={{ indicator: classes.indicator }}
                                aria-label="simple tabs example" style={{ backgroundColor: "White" }}>
                                <Tab label="Parent Menu" {...a11yProps(0)} style={{ color: "black" }} />
                                <Tab label="Menu" {...a11yProps(1)} style={{ color: "black" }} />
                                <Tab label="Screen" {...a11yProps(2)} style={{ color: "black" }} />
                                <Tab label="Permission" {...a11yProps(3)} style={{ color: "black" }} />
                              </Tabs>
                            </AppBar>
                            <TabPanel value={value} index={0}>
                              <ParentMenuConfig />
                            </TabPanel>
                            <TabPanel value={value} index={1}>
                              <MenuConfig />
                            </TabPanel>
                            <TabPanel value={value} index={2}>
                              <ScreenConfig />
                            </TabPanel>
                            <TabPanel value={value} index={3}>
                              <PermissionConfig />
                            </TabPanel>

                          </Grid>
                        </Grid>
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


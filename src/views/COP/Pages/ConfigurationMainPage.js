import React, { useState, useEffect, Fragment } from 'react';
import { useAlert } from 'react-alert';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Grid,
  TextField,
  makeStyles,
  Container,
  CardContent,
  Divider,
  InputLabel,
  CardHeader,
  MenuItem,
  AppBar,
  Tab
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { trackPromise } from 'react-promise-tracker';
import PageHeader from 'src/views/Common/PageHeader';
import authService from '../../../utils/permissionAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingComponent } from '../../../utils/newLoader';
import Paper from '@material-ui/core/Paper';
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import COPConfigurationSetup from './Tab Pages/COPConfigurations';
import COPConfigurationCreation from './Tab Pages/COPSectionCreation';
import tokenService from '../../../utils/tokenDecoder';

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
  },
  bold: {
    fontWeight: 600
  }
}));

const screenCode = 'COPREPORT';

export default function COPConfigurationMainPage(props) {
  const [value, setValue] = React.useState('1');
  const navigate = useNavigate();
  const alert = useAlert();
  const { groupID } = useParams();
  const { factoryID } = useParams();
  const classes = useStyles();
  const [title, setTitle] = useState('COP Configuration');
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const handleClickNavigate = () => {
    navigate('/app/COPReport/COPReport');
  };
  const [
    ConfigurationMainPageDetails,
    setConfigurationMainPageDetails
  ] = useState({
    groupID: 0,
    factoryID: 0,
    parentSectionName: '0',
    accountFilterType: '0',
    accountFilterText: ''
  });
  const [groups, setGroups] = useState();
  const [factories, setFactories] = useState();

  // useEffect(() => {
  //   const DecryptedGroupID = atob(groupID.toString());
  //   const DecryptedFactoryID = atob(factoryID.toString());

  //   setConfigurationMainPageDetails({
  //     ...ConfigurationMainPageDetails,
  //     groupID: DecryptedGroupID,
  //     factoryID: DecryptedFactoryID
  //   });
  // }, []);

  useEffect(() => {
    trackPromise(getPermission());
    trackPromise(getGroupsForDropdown());
  }, []);

  useEffect(() => {
    trackPromise(getFactoriesForDropDown());
  }, [ConfigurationMainPageDetails.groupID]);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(
      p => p.permissionCode == 'VIEWCOPREPORTCONFIGURATION'
    );

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(
      p => p.permissionCode == 'GROUPDROPDOWN'
    );
    var isFactoryFilterEnabled = permissions.find(
      p => p.permissionCode == 'FACTORYDROPDOWN'
    );

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
    });

    setConfigurationMainPageDetails({
      ...ConfigurationMainPageDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }


  function handleGroupChange(e) {
    const target = e.target;
    const value = target.value
    setConfigurationMainPageDetails({
      ...ConfigurationMainPageDetails,
      groupID: parseInt(value),
      factoryID: 0,
    });
  }

  function handleFactoryChange(e) {
    const target = e.target;
    const value = target.value
    setConfigurationMainPageDetails({
      ...ConfigurationMainPageDetails,
      factoryID: parseInt(value)
    });
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader onClick={handleClickNavigate} />
        </Grid>
      </Grid>
    );
  }

  const handleChangetab = (event, newValue) => {
    setValue(newValue);
  };

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

  async function getGroupsForDropdown() {
    const groups = await services.getAllGroups();
    setGroups(groups);
  }

  async function getFactoriesForDropDown() {
    const factory = await services.getFactoryByGroupID(
      ConfigurationMainPageDetails.groupID
    );
    setFactories(factory);
  }
  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={title}>
        <Container maxWidth={false}>
          <Box mt={0}>
            <Card>
              <CardHeader title={cardTitle(title)} />
              <PerfectScrollbar>
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>
                      <InputLabel shrink id="groupID">
                        Group *
                      </InputLabel>
                      <TextField
                        select
                        fullWidth
                        name="groupID"
                        onChange={e => handleGroupChange(e)}
                        value={ConfigurationMainPageDetails.groupID}
                        variant="outlined"
                        id="groupID"
                        size = 'small'
                        InputProps={{
                          readOnly: !permissionList.isGroupFilterEnabled,
                        }}
                      >
                        <MenuItem value="0">--Select Group--</MenuItem>
                        {generateDropDownMenu(groups)}
                      </TextField>
                    </Grid>

                    <Grid item md={4} xs={12}>
                      <InputLabel shrink id="factoryID">
                        Estate *
                      </InputLabel>
                      <TextField
                        select
                        fullWidth
                        name="factoryID"
                        onChange={e => handleFactoryChange(e)}
                        value={ConfigurationMainPageDetails.factoryID}
                        variant="outlined"
                        id="factoryID"
                        size = 'small'
                        InputProps={{
                          readOnly: !permissionList.isFactoryFilterEnabled,
                        }}
                      >
                        <MenuItem value="0">--Select Estate--</MenuItem>
                        {generateDropDownMenu(factories)}
                      </TextField>
                    </Grid>
                  </Grid>

                  <br />

                  <Box>
                    <Paper square>
                      <TabContext value={value}>
                      <Grid container spacing={3}>
                      <Grid className={classes.root1} item xs={12}>
                        <AppBar position="static">
                          <TabList
                          variant={'fullWidth'}
                            centered="false"
                            onChange={handleChangetab}
                            aria-label="simple tabs example"
                          >
                            <Tab
                              label="Configuration Section Mapping"
                              value="1"
                            />
                            <Tab label="Section Creation" value="2" />
                          </TabList>
                        </AppBar>
                        <TabPanel value="1">
                          <COPConfigurationSetup  data={ConfigurationMainPageDetails} />
                        </TabPanel>
                        <TabPanel value="2">
                          <COPConfigurationCreation data={ConfigurationMainPageDetails}/>
                        </TabPanel>
                        </Grid>
                        </Grid>
                      </TabContext>
                    </Paper>
                  </Box>
                </CardContent>
              </PerfectScrollbar>
            </Card>
          </Box>
        </Container>
      </Page>
    </Fragment>
  );
}

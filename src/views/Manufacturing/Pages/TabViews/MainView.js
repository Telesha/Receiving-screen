import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Box, Card, makeStyles, Container, CardHeader, CardContent, Divider, Grid } from '@material-ui/core';
import Page from 'src/components/Page';
import PageHeader from 'src/views/Common/PageHeader';
import { useNavigate } from 'react-router-dom';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../../utils/permissionAuth';
import tokenService from '../../../../utils/tokenDecoder';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import WitheredLeaf from '../TabViews/TabOneWitheredLeaf';
import Rolling from '../TabViews/TabTwoRolling';
import Fiering from '../TabViews/TabThreeFiering';
import JobCreation from './TabFourJobCreation';
import Grading from '../TabViews/TabFiveExsesLoss';
import { LoadingComponent } from '../../../../utils/newLoader';

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
const screenCode = 'MANUFACTURING';

export default function ManufacturingAddEditMain(props) {
  const [title, setTitle] = useState("Manufacturing");
  const classes = useStyles();

  const [manufacturingDetail, setManufacturingDetail] = useState({
    groupID: 0,
    factoryID: 0,
  });
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false,
  });

  const navigate = useNavigate();
  const [value, setValue] = React.useState("1");
  const handleChangetab = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    trackPromise(
      getPermission()
    );
  }, []);

  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITMANUFACTURING');
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
    setManufacturingDetail({
      ...manufacturingDetail,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  async function handleClick() {
    navigate('/app/manufacturing/listing')
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader
            onClick={() => handleClick()}
            isEdit={false}
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
          <form>
            <Box mt={0}>
              <Card>
                <CardHeader title={cardTitle(title)} />
                <PerfectScrollbar>
                  <Divider />
                  <CardContent>
                    <Box>
                      <Paper square>
                        <TabContext value={value}>
                          <AppBar position="static">
                            <TabList centered="true" onChange={handleChangetab} variant={'fullWidth'} aria-label="simple tabs example" style={{ backgroundColor: "white" }}>
                              <Tab label="Job creation" value="1" style={{ color: "black" }} />
                              <Tab label="Withered Leaf" value="2" style={{ color: "black" }} />
                              <Tab label="Rolling" value="3" style={{ color: "black" }} disabled={false} />
                              <Tab label="Firing" value="4" style={{ color: "black" }} disabled={false} />
                              <Tab label="Grading" value="5" style={{ color: "black" }} disabled={false} />
                            </TabList>
                          </AppBar>
                          <TabPanel value="1"><JobCreation
                            groupData={manufacturingDetail.groupID}
                            factoryData={manufacturingDetail.factoryID}
                          /></TabPanel>
                          <TabPanel value="2"><WitheredLeaf
                            groupData={manufacturingDetail.groupID} factoryData={manufacturingDetail.factoryID}
                            fromDateOfManufacture={manufacturingDetail.fromDateOfManufacture} />
                          </TabPanel>
                          <TabPanel value="3"><Rolling
                            groupData={manufacturingDetail.groupID} factoryData={manufacturingDetail.factoryID}
                          /></TabPanel>
                          <TabPanel value="4"><Fiering
                            groupData={manufacturingDetail.groupID} factoryData={manufacturingDetail.factoryID}
                          /></TabPanel>
                          <TabPanel value="5"><Grading
                            groupData={manufacturingDetail.groupID} factoryData={manufacturingDetail.factoryID}
                          /></TabPanel>
                        </TabContext>
                      </Paper>
                    </Box>
                  </CardContent>
                </PerfectScrollbar>
              </Card>
            </Box>
          </form>
        </Container>
      </Page>
    </Fragment>
  );
}

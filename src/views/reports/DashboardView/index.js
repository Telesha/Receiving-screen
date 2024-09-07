import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  makeStyles
} from '@material-ui/core';
import Page from 'src/components/Page';
import Budget from './TotalRegisterdCustomerCount';
import LatestOrders from './LatestFactoryItems';
import LatestProducts from './LatestLoans';
import Sales from './Last7DaysCropDetails';
import TasksProgress from './LastMonthTotalCropCount';
import TotalCustomers from './LastMonthActiveCustomerCount';
import TotalProfit from './ThisMonthTotalCrop';
import TrafficByDevice from './ThisMonthLeafDetails';
import authService from '../../../utils/permissionAuth';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const screenCode = 'SYSTEMDASHBOARD';
const Dashboard = () => {
  const classes = useStyles();

  const [permissionList, setPermissions] = useState({
    isViewDashboardImage: false,
    isViewDashboard: false
  });
  useEffect(() => {
    getPermission();
  }, []);


  async function getPermission() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isViewDashboardImage = permissions.find(
      p => p.permissionCode == 'VIEWDASHBOARDIAMGE'
    );
    if (isViewDashboardImage && isViewDashboardImage.permissionCode == 'VIEWDASHBOARDIAMGE') {
      setPermissions({
        ...permissionList,
        isViewDashboardImage: isViewDashboardImage !== undefined,
        isViewDashboard: false
      });
    } else {
      setPermissions({
        ...permissionList,
        isViewDashboardImage: false,
        isViewDashboard: true
      });
    }
    // if (isAuthorized === undefined) {
    //   navigate('/404');
    // }
  }
  return (
    <Page
      className={classes.root}
      title="Dashboard"
    >
      <Container maxWidth={false}>
        {permissionList.isViewDashboardImage ?
          <img src='https://img.freepik.com/free-vector/investor-with-laptop-monitoring-growth-dividends-trader-sitting-stack-money-investing-capital-analyzing-profit-graphs-vector-illustration-finance-stock-trading-investment_74855-8432.jpg?w=1060&t=st=1702741088~exp=1702741688~hmac=b2eed16ca492162691f6890864646da5143f4ea1a97bedc83eebef55f6ed792a.jpg' width="100%" height="580"
          //style={{ display: "block", margin: "auto" }}
          />
          : null}

        {permissionList.isViewDashboard == true ?
          <Grid
            container
            spacing={1}
          >

            <Grid
              item
              lg={3}
              sm={6}
              xl={3}
              xs={12}
            >
              <Budget />
            </Grid>
            <Grid
              item
              lg={3}
              sm={6}
              xl={3}
              xs={12}
            >
              <TotalCustomers />
            </Grid>
            <Grid
              item
              lg={3}
              sm={6}
              xl={3}
              xs={12}
            >
              <TasksProgress />
            </Grid>
            <Grid
              item
              lg={3}
              sm={6}
              xl={3}
              xs={12}
            >
              <TotalProfit />
            </Grid>
            <Grid
              item
              lg={8}
              md={12}
              xl={9}
              xs={12}
            >
              <Sales />
            </Grid>
            <Grid
              item
              lg={4}
              md={6}
              xl={3}
              xs={12}
            >
              <TrafficByDevice />
            </Grid>
            <Grid
              item
              lg={4}
              md={6}
              xl={3}
              xs={12}
            >
              <LatestProducts />
            </Grid>
            <Grid
              item
              lg={8}
              md={12}
              xl={9}
              xs={12}
            >
              <LatestOrders />
            </Grid>
          </Grid> : null}
      </Container>
    </Page>
  );
};

export default Dashboard;

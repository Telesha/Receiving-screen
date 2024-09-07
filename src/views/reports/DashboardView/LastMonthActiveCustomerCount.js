import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  colors,
  makeStyles
} from '@material-ui/core';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import {
  startOfMonth,
  endOfMonth,
  addMonths
} from 'date-fns';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import services from '../Services';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  avatar: {
    backgroundColor: colors.green[600],
    height: 56,
    width: 56
  },
  differenceIcon: {
    color: colors.green[900]
  },
  differenceValue: {
    color: colors.green[900],
    marginRight: theme.spacing(1)
  }
}));

const TotalCustomers = ({ className, ...rest }) => {
  const classes = useStyles();
  const [customerCount, setCustomerCount] = useState([]);

  useEffect(() => {
    trackPromise(GetDetails());
  }, []);


  async function GetDetails() {
    let model = {
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken()),
      startDate: startOfMonth(addMonths(new Date(), -1)),
      endDate: endOfMonth(addMonths(new Date(), -1))
    }
    const customerData = await services.GetActiveCustomerCountDetailsforDashboardTiles(model);
    setCustomerCount(customerData.data.activeCustomerCount);
  }

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardContent>
        <Grid
          container
          justify="space-between"
          spacing={3}
        >
          <Grid item md={12}>
            <Typography
              color="textSecondary"
              gutterBottom
              style={{ fontSize: '13px', fontWeight: '550' }}
              align="center"
            >
              LAST MONTH ACTIVE CUSTOMER ACCOUNTS
            </Typography>
            <Typography
              color="textPrimary"
              variant="h3"
              align="center"
              style={{ marginTop: '1rem' }}
            >
              {customerCount}
            </Typography>
          </Grid>
          <Grid
            container
            justify="center"
            spacing={3}
            item>
            <Avatar className={classes.avatar}>
              <AccountBoxIcon />
            </Avatar>
          </Grid>
        </Grid>
        {/* <Box
          mt={2}
          display="flex"
          alignItems="center"
        >
          <ArrowUpwardIcon className={classes.differenceIcon} />
          <Typography
            className={classes.differenceValue}
            variant="body2"
          >
            16%
          </Typography>
          <Typography
            color="textSecondary"
            variant="caption"
          >
            Since last month
          </Typography>
        </Box> */}
      </CardContent>
    </Card>
  );
};

TotalCustomers.propTypes = {
  className: PropTypes.string
};

export default TotalCustomers;

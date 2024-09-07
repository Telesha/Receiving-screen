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
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import tokenService from '../../../utils/tokenDecoder';
import { useAlert } from "react-alert";
import { trackPromise } from 'react-promise-tracker';
import services from '../Services';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  avatar: {
    backgroundColor: colors.red[600],
    height: 56,
    width: 56
  },
  differenceIcon: {
    color: colors.red[900]
  },
  differenceValue: {
    color: colors.red[900],
    marginRight: theme.spacing(1)
  }
}));

const Budget = ({ className, ...rest }) => {
  const classes = useStyles();
  const [customerCount, setCustomerCount] = useState([]);

  useEffect(() => {
    trackPromise(GetDetails());
  }, []);


  async function GetDetails() {
    var groupID = parseInt(tokenService.getGroupIDFromToken());
    var factoryID = parseInt(tokenService.getFactoryIDFromToken());

    const customerData = await services.GetCustomerCountDetailsforDashboardTiles(groupID, factoryID);
    setCustomerCount(customerData.customerCount);
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
              TOTAL REGISTERD CUSTOMERS
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
              <PeopleAltIcon />
            </Avatar>
          </Grid>
        </Grid>
        {/* <Box
          mt={2}
          display="flex"
          alignItems="center"
        >
          <ArrowDownwardIcon className={classes.differenceIcon} />
          <Typography
            className={classes.differenceValue}
            variant="body2"
          >
            12%
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

Budget.propTypes = {
  className: PropTypes.string
};

export default Budget;

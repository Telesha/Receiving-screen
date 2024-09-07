import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Avatar,
  Card,
  CardContent,
  Grid,
  Typography,
  makeStyles,
  colors
} from '@material-ui/core';
import EcoTwoToneIcon from '@material-ui/icons/EcoTwoTone';
import {
  startOfMonth,
  endOfMonth,
  addMonths
} from 'date-fns';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import services from '../Services';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%'
  },
  avatar: {
    backgroundColor: colors.indigo[600],
    height: 56,
    width: 56
  }
}));

const TotalProfit = ({ className, ...rest }) => {
  const classes = useStyles();
  const [totalCrop, setTotalCrop] = useState([]);

  useEffect(() => {
    trackPromise(GetDetails());
  }, []);


  async function GetDetails() {
    let model = {
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken()),
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    }
    const cropData = await services.GetThisMonthCropTotalforDashboardTiles(model);
    setTotalCrop(cropData.data.thisMonthTotalCrop.toFixed(2));
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
              THIS MONTH TOTAL CROPS
            </Typography>
            <Typography
              color="textPrimary"
              variant="h3"
              align='center'
              style={{ marginTop: '1rem' }}
            >
              {totalCrop} kg
            </Typography>
          </Grid>
          <Grid
            container
            justify="center"
            spacing={3}
            item>
            <Avatar className={classes.avatar}>
              <EcoTwoToneIcon />
            </Avatar>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

TotalProfit.propTypes = {
  className: PropTypes.string
};

export default TotalProfit;

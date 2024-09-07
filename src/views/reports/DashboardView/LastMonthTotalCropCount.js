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
import EcoIcon from '@material-ui/icons/Eco';
import {
  startOfMonth,
  endOfMonth,
  addMonths
} from 'date-fns';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import services from '../Services';
import moment from 'moment';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%'
  },
  avatar: {
    backgroundColor: colors.orange[600],
    height: 56,
    width: 56
  }
}));

const TasksProgress = ({ className, ...rest }) => {
  const classes = useStyles();
  const [totalCrop, setTotalCrop] = useState([]);

  useEffect(() => {
    trackPromise(GetDetails());
  }, []);


  async function GetDetails() {
    let model = {
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken()),
      startDate: moment(startOfMonth(addMonths(new Date(), -1))).format().toString().split('T')[0],
      endDate: moment(endOfMonth(addMonths(new Date(), -1))).format().toString().split('T')[0],
    }
    const cropData = await services.GetCropTotalforDashboardTiles(model);
    setTotalCrop(cropData.data.lastMonthTotalCrop.toFixed(2));
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
              LAST MONTH TOTAL CROPS
            </Typography>

            <Typography
              color="textPrimary"
              variant="h3"
              align="center"
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
              <EcoIcon />
            </Avatar>
          </Grid>
        </Grid>
        {/* <Box mt={3}>
          <LinearProgress
            value={75.5}
            variant="determinate"
          />
        </Box> */}
      </CardContent>
    </Card>
  );
};

TasksProgress.propTypes = {
  className: PropTypes.string
};

export default TasksProgress;

import React from 'react';
import {
  colors,
  Avatar,
  Typography,
  makeStyles,
  Grid
} from '@material-ui/core';
import CountUp from 'react-countup';
import EcoIcon from '@material-ui/icons/Eco';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  avatar: {
    backgroundColor: colors.green[600],
    height: 55,
    width: 55
  },
  differenceIcon: {
    color: colors.red[900]
  },
  differenceValue: {
    color: colors.red[900],
    marginRight: theme.spacing(1)
  }
}));

export const TotalLeafCountComponent = ({ data }) => {

  const classes = useStyles();

  return (
    <Grid
      container
      justify="space-between"
      spacing={3}
    >
      <Grid item>
        <Typography
          color="textSecondary"
          gutterBottom
          variant="h6"
        >
          TOTAL LEAF COUNT
                </Typography>
        <Typography
          color="textPrimary"
          variant="h3"
        >
          <CountUp separator=',' decimals={2} end={data} duration={1} />{" Kg"}
        </Typography>
      </Grid>
      <Grid item>
        <Avatar className={classes.avatar}>
          <EcoIcon />
        </Avatar>
      </Grid>
    </Grid>
  )
}

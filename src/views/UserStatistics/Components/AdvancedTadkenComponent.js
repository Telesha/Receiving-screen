import React from 'react';
import {
  Typography,
  colors,
  Avatar,
  makeStyles,
  Grid,
} from '@material-ui/core';
import CountUp from 'react-countup';
import MoneyIcon from '@material-ui/icons/Money';


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

export const AdvancedTadkenComponent = ({ data }) => {
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
          ADVANCED TAKEN
                        </Typography>
        <Typography
          color="textPrimary"
          variant="h3"
        >
          {"Rs "}<CountUp decimals={2} separator=',' end={data} duration={1} />
        </Typography>
      </Grid>
      <Grid item>
        <Avatar className={classes.avatar}>
          <MoneyIcon />
        </Avatar>
      </Grid>
    </Grid>
  )
}

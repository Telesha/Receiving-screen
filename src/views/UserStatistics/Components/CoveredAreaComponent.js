import React, { useState, useEffect } from 'react';
import {
  Typography,
  colors,
  Avatar,
  makeStyles,
  Grid,
} from '@material-ui/core';
import CountUp from 'react-countup';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';


const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  avatar: {
    backgroundColor: '#651fff',
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

export const CoveredAreaComponent = ({ CoveredArea }) => {
  const classes = useStyles();
  var AreaTypes = ["..", "perch ", "ha "]

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
          Covered Area
                </Typography>
        <Typography
          color="textPrimary"
          variant="h3"
        >
          {AreaTypes[CoveredArea.areaType]}<CountUp decimals={2} separator=',' end={CoveredArea.area} duration={1} />
        </Typography>
      </Grid>
      <Grid item>
        <Avatar className={classes.avatar}>
          <AspectRatioIcon />
        </Avatar>
      </Grid>
    </Grid>
  )
}

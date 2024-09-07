import React, { useState, useEffect } from 'react';
import {
    Typography,
    colors,
    Avatar,
    makeStyles,
    Grid,
} from '@material-ui/core';
import CountUp from 'react-countup';
import EcoIcon from '@material-ui/icons/Eco';

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
        color: colors.red[900]
    },
    differenceValue: {
        color: colors.red[900],
        marginRight: theme.spacing(1)
    }
}));

export const LeafCollectedDaysNumber = ({ LeafCollectedDays }) => {
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
                    Number of Leaf Collected Days
                </Typography>
                <Typography
                    color="textPrimary"
                    variant="h3"
                >
                    <CountUp end={LeafCollectedDays} duration={1} />
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

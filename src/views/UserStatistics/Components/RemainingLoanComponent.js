import React from 'react';
import {
    Card,
    makeStyles,
    CardContent
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    }
}));

export const RemainingLoanComponent = ({ data }) => {

    const classes = useStyles();

    return (
        <Card
            className={classes.root}
        >
            <CardContent>
                {/* <Line data={LineChartData} /> */}
            </CardContent>
        </Card>
    )
}
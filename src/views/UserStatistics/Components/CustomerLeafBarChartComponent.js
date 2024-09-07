import React from 'react';
import {
    Box,
    Card,
    makeStyles,
    CardContent,
} from '@material-ui/core';
import { Bar } from 'react-chartjs-2';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: 'white',
        minHeight: '20rem'
    }
}));

export const CustomerLeafBarChartComponent = ({ data }) => {

    const year = new Date().getFullYear();

    const classes = useStyles();
    return (
        <Card>
            <CardContent>
                <Box className={classes.root}>
                    <Bar
                        data={data}
                        options={{
                            maintainAspectRatio: false,
                            responsive: true,
                            scales: {
                                xAxes: [{
                                    maxBarThickness: 70,
                                    scaleLabel: {
                                        display: true,
                                        labelString: year,
                                        fontSize: 15
                                    },
                                    stacked: true,
                                }],
                                yAxes: [{
                                    ticks: {
                                        min: 0
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Weight (Kg)'
                                    },
                                    stacked: true,
                                }]
                            },
                            interaction: {
                                intersect: false,
                            },
                            title: {
                                display: true,
                                text: 'Customer Leaf count (Last Two Months)',
                                fontSize: 15
                            },
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    )
}
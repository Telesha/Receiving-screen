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

export const CustomerOverallViewComponent = ({ data }) => {

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
                                    barThickness: 70,
                                    maxBarThickness: 70,
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Month',
                                        fontSize: 15
                                    }
                                }],
                                yAxes: [{
                                    ticks: {
                                        min: 0,
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Amount (Rs.)'
                                    }
                                }]
                            },
                            title: {
                                display: true,
                                text: 'Customer Cash-Flow Chart',
                                fontSize: 15
                            }
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    )
}
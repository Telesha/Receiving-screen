import React from 'react';
import { Line } from "react-chartjs-2";

export const LeafSupplyComponent = ({ data }) => {
    return (
        <Line
            data={data}
            options={{
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Month',
                            fontSize: 15
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Amount (Kg)'
                        }
                    }]
                }
            }}
        />
    )
}
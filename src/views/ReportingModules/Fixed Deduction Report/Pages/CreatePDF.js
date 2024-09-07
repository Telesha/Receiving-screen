import React from 'react';
import {
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Table
} from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
export default class ComponentToPrint extends React.Component {
    render() {
        const fixedDeductionData = this.props.fixedDeductionData;
        const selectedSearchValues = this.props.selectedSearchValues;
        const totalValues = this.props.totalValues;
        let newDate = new Date().toLocaleString().split(' ');
        let date = newDate;
        const theme = createMuiTheme({
            overrides: {
                MuiTableCell: {
                    root: {
                        border: '2px solid black',
                        borderBottom: '2px solid black',
                    },
                },
                typography: {
                    h2: {
                        fontSize: '1.5rem',
                    },
                },
                MuiTablePagination: {
                    root: {
                        border: 'none',
                    },
                },
            },
        });

        return (
            <div>

                <h2>
                    <left>
                        <u>Fixed Deduction Report</u>
                    </left>
                </h2>
                <div>&nbsp;</div>
                <div className="row pb-4 pt-4">
                    <div className="col">
                        <h4>
                            <left>
                                Group - {''}
                                {selectedSearchValues.groupName}
                            </left>
                        </h4>
                    </div>
                    <div className="col">
                        <h4>
                            <left>
                                Estate - {''}
                                {selectedSearchValues.estateName}
                            </left>
                        </h4>
                    </div>
                    <div className="col">
                        <h4>
                            <left>
                                Division - {''}
                                {selectedSearchValues.divisionName}
                            </left>
                        </h4>
                    </div>
                    <div className="col">
                        <h4>
                            <left>
                                {selectedSearchValues.deductionType == undefined ? (
                                    <>
                                        Deduction Type - All
                                    </>
                                ) : (
                                    <>
                                        Deduction Type - {''}
                                        {selectedSearchValues.deductionType}
                                    </>
                                )}
                            </left>
                        </h4>
                    </div>

                    <div className="col">
                        <h4>
                            <left>
                                Date - ({selectedSearchValues.startDate}) / ({selectedSearchValues.endDate})
                            </left>
                        </h4>
                    </div>
                </div>

                <br></br>
                <div>
                    <MuiThemeProvider theme={theme}>
                        <Table aria-label="simple table" size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell align={'center'}>{'Employee No'}</TableCell>
                                    <TableCell align={'center'}>{'Name'}</TableCell>
                                    <TableCell align={'center'}>{'Deduction Type'}</TableCell>
                                    <TableCell align={'center'}>{'Amount (Rs.)'}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fixedDeductionData.map((data, index) => (
                                    <TableRow key={index}>
                                        <TableCell align={'left'}>{data.registrationNumber}</TableCell>
                                        <TableCell align={'left'}>{data.employeeName}</TableCell>
                                        <TableCell align={'left'}>{data.fixedDeductionTypeName == "Union" ? data.fixedDeductionTypeName + ' - ' + data.unionName : data.fixedDeductionTypeName}</TableCell>
                                        <TableCell align={'right'}> {data.fixedDeductionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    </TableRow>

                                ))}
                                <TableRow>
                                    <TableCell align={'left'} colSpan={3}><strong>Total</strong></TableCell>
                                    <TableCell align={'right'}>Rs. {totalValues.amountTotal}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <br></br>
                        <h3> {date}</h3>
                    </MuiThemeProvider>
                </div>
            </div>
        );
    }
}
import React from 'react';
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table,
    CardContent,
} from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

export default class ComponentToPrint extends React.Component {
    render() {
        const checkRollDeductionViewData = this.props.checkRollDeductionViewData;
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
                MuiTableRow: {
                    root: {
                        '&:nth-of-type(odd)': {
                            backgroundColor: 'white',
                        },
                        '&:last-child': {
                            '& .MuiTableCell-root': {
                                borderBottom: '2px solid black',
                            },
                        },
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
                        <u>Payroll Deduction Report</u>
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
                                Year - {selectedSearchValues.year}
                            </left>
                        </h4>
                    </div>
                    <div className="col">
                        <h4>
                            <left>
                                Month -{selectedSearchValues.month}
                            </left>
                        </h4>
                    </div>
                </div>
                <br></br>
                <div>
                    <MuiThemeProvider theme={theme}>
                        <CardContent style={{ marginBottom: '2rem' }}>
                            <Box minWidth={1050}>
                                <TableContainer style={{ margin: '0 auto', width: '80%' }}>
                                    <Table aria-label="caption table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align={'center'}>{'Employee No'}</TableCell>
                                                <TableCell align={'center'}>{'Name'}</TableCell>
                                                <TableCell align={'center'}>{'Designation'}</TableCell>
                                                <TableCell align={'center'}>{'Deduction Type'}</TableCell>
                                                <TableCell align={'center'}>{'Date'}</TableCell>
                                                <TableCell align={'center'}>{'Amount (Rs.)'}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {checkRollDeductionViewData.map((data, index) => (
                                                <TableRow key={index}>
                                                    <TableCell align={'left'}>{data.employeeNo}</TableCell>
                                                    <TableCell align={'left'}>{data.employeeName}</TableCell>
                                                    <TableCell align={'left'}>{data.designation}</TableCell>
                                                    <TableCell align={'left'}>{data.deductionType}</TableCell>
                                                    <TableCell align={'left'}>{new Date(data.date).toLocaleDateString()}</TableCell>
                                                    <TableCell align={'right'}> {data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell align={'left'} colSpan={5}><strong>Total</strong></TableCell>
                                                <TableCell align={'right'}>Rs. {totalValues.amountTotal}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    <br></br>
                                </TableContainer>
                                <h3> {date}</h3>
                            </Box>
                        </CardContent>
                    </MuiThemeProvider>
                </div>
            </div>
        );
    }
}

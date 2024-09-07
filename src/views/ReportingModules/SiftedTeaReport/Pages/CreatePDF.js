import React from "react";
import {
    Box,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Table
} from '@material-ui/core';

export default class ComponentToPrint extends React.Component {
    render() {
        const siftedTeaDetails = this.props.siftedTeaDetails;
        const searchData = this.props.searchData;
        const monthlySum = this.props.monthlySum;

        return (
            <div>
                <div>&nbsp;</div>
                <h3><center><u>Sifted Tea Details Report</u></center></h3>
                <div>&nbsp;</div>
                <h4><center>{searchData.groupName} - {searchData.factoryName}</center></h4>
                <h4><center>{searchData.date}</center></h4>
                <div>&nbsp;</div>
                <div>
                    <Box minWidth={1050}>
                        <TableContainer>
                            <Table aria-label="caption table">
                                <TableHead >
                                    <TableRow >
                                        <TableCell align='center' rowSpan={3} style={{ border: '1px solid #595959', width: '100px' }}>Date</TableCell>
                                        <TableCell align='center' colSpan={6} style={{ border: '1px solid #595959', width: '600px' }}>
                                            Grade
                                        </TableCell>
                                        <TableCell align='center' rowSpan={3} style={{ border: '1px solid #595959', backgroundColor: '#B3B3B3', width: '100px' }}>Main Grade Total (Kg)</TableCell>
                                        <TableCell align='center' rowSpan={3} style={{ border: '1px solid #595959', backgroundColor: '#E6E6E6', width: '100px' }}>Off Grade Total (Kg)</TableCell>
                                    </TableRow>
                                    <TableRow >
                                        <TableCell align='center' colSpan={3} style={{ border: '1px solid #595959', backgroundColor: '#B3B3B3', width: '300px' }}>Main Grade (Kg)</TableCell>
                                        <TableCell align='center' colSpan={3} style={{ border: '1px solid #595959', backgroundColor: '#E6E6E6', width: '300px' }}>Off Grade (Kg)</TableCell>
                                    </TableRow>
                                    <TableRow >
                                        <TableCell align='center' style={{ border: '1px solid #595959' }}>Pekoe</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959' }}>FBOP</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959' }}>BOPF</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959' }}>BP</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959' }}>OP</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959' }}>OPA</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {siftedTeaDetails.map((data, index) => (
                                        <TableRow key={index} style={{ border: '1px solid #595959' }}>
                                            <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{data.Date}</TableCell>
                                            <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#B3B3B3', width: '100px' }}>{data.Pekoe}
                                            </TableCell>
                                            <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#B3B3B3', width: '100px' }}>{data.FBOP}
                                            </TableCell>
                                            <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#B3B3B3', width: '100px' }}>{data.BOPF}
                                            </TableCell>
                                            <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#E6E6E6', width: '100px' }}>{data.BP}
                                            </TableCell>
                                            <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#E6E6E6', width: '100px' }}>{data.OP}
                                            </TableCell>
                                            <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#E6E6E6', width: '100px' }}>{data.OPA}
                                            </TableCell>
                                            <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#B3B3B3', width: '100px' }}>{data.MainGradeTot ? data.MainGradeTot : '-'}
                                            </TableCell>
                                            <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', backgroundColor: '#E6E6E6', width: '100px' }}>{data.OffGradeTot ? data.OffGradeTot : '-'}
                                            </TableCell>
                                        </TableRow>

                                    ))}
                                    <TableRow style={{ border: '1px solid #595959', backgroundColor: '#7d7d7d' }}>
                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>Total (Kg)</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.pekoeSum}</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.fbopSum}</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.bopffSum}</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.bpSum}</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.opSum}</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.opaSum}</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.mainGradeSum}</TableCell>
                                        <TableCell align='center' style={{ border: '1px solid #595959', fontWeight: 'bold', width: '100px' }}>{monthlySum.offGradeSum}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </div>
                <div>&nbsp;</div>
            </div>
        );

    }

}
import {
    Card,
    CardContent,
    Table,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Grid,
} from '@material-ui/core';
import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

export default function PastCropDetailsComponent({ 
    data,
    SelectedMonth,
    setSelectedMonth}) {
    const d = new Date();
    const monthArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const handleChangeRadio = (event) => {
        setSelectedMonth(event.target.value);
    };

    return (
        <div>
            <Card>
                <CardContent>
                    <Typography style={{ fontWeight: 'bold', color: 'gray', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                        Crop Supply History (Kg)
                    </Typography>
                    <TableContainer>
                        <Table aria-label="caption table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align={'center'}>Month</TableCell>
                                    {monthList.map((item, index) => {
                                        if (data) {
                                            if (d.getMonth() >= (index)) {
                                                return (
                                                    <TableCell align={'center'} key={index}>
                                                        {item}:{d.getFullYear()}
                                                    </TableCell>
                                                )
                                            } else {
                                                return (
                                                    <TableCell align={'center'} key={index}>
                                                        {item}:{d.getFullYear() - 1}
                                                    </TableCell>
                                                )
                                            }
                                        }
                                    })}
                                </TableRow>
                            </TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: 'bold', borderBottom: 'none' }} align={'center'}>Total(kg)</TableCell>
                                {monthArray.map((item, index) => {
                                    if (data) {
                                        var res = data.find(x => x.cropCollectedMonth == item)
                                        if (res) {
                                            return (
                                                <TableCell style={{ borderBottom: 'none' }} align={'center'} key={index}>
                                                    {res.totalCollectedCropWeight.toFixed(2)}
                                                </TableCell>
                                            )
                                        } else {
                                            return (
                                                <TableCell style={{ borderBottom: 'none' }} align={'center'} key={index}>
                                                    -
                                                </TableCell>
                                            )
                                        }
                                    }
                                })}
                            </TableRow>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
            <Grid item xs={12}>
                <Card align={'center'} style={{ marginTop: '1rem', minHeight: '3.5rem', maxHeight: '3.5rem', padding: 0 }}>
                    <CardContent align={'center'} style={{ padding: 0, paddingTop: '0.5rem'}}>
                        <FormControl>
                            <RadioGroup aria-label="month" name="monthList" value={SelectedMonth} onChange={handleChangeRadio}>
                                <Grid container spacing={3}>
                                    <Grid item>
                                        <FormControlLabel value="Last_12_months" control={<Radio />} label="Last 12 months" />
                                    </Grid>
                                    <Grid item>
                                        <FormControlLabel value="Last_6_months" control={<Radio />} label="Last 6 months" />
                                    </Grid>
                                    <Grid item>
                                        <FormControlLabel value="Last_3_Months" control={<Radio />} label="Last 3 Months" />
                                    </Grid>
                                    <Grid item>
                                        <FormControlLabel value="Previous_Month" control={<Radio />} label="Previous Month" />
                                    </Grid>
                                    <Grid item>
                                        <FormControlLabel value="Current_Month" control={<Radio />} label="Current Month" />
                                    </Grid>
                                </Grid>
                            </RadioGroup>
                        </FormControl>
                    </CardContent>
                </Card>
            </Grid>
        </div>
    )
}

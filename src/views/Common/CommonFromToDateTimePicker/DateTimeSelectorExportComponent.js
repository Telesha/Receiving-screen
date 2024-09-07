import React, { useState, useEffect } from 'react'
import { DateRangePicker } from "materialui-daterange-picker";
import Popover from '@material-ui/core/Popover';
import EventIcon from '@material-ui/icons/Event';
import DateTimePickerComponent from './DateTimePicker';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button, CardContent, Divider, InputLabel, CardHeader, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@material-ui/core';


export default function DateTimePickerExportComponent({ DateRange, setDateRange }) {

    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleClickPop = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <div>
            <InputLabel shrink>
                Date *
            </InputLabel>
            <Button
                aria-describedby={id}
                variant="contained"
                fullWidth
                color="primary"
                onClick={handleClickPop}
                size="large"
                endIcon={<EventIcon />}
            >
                {DateRange.startDate.toLocaleDateString() + " - " + DateRange.endDate.toLocaleDateString()}
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <DateTimePickerComponent setDateRange={setDateRange} handleClose={handleClose} />
            </Popover>
        </div>
    )
}
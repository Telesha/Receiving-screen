import React, { useState, useEffect } from 'react'
import {
    addDays,
    startOfWeek,
    endOfWeek,
    addWeeks,
    startOfMonth,
    endOfMonth,
    addMonths,
    addYearsDateRangePicker,
    startOfYear,
    endOfYear,
    addYears
} from 'date-fns';
import { DateRangePicker } from "materialui-daterange-picker";
import {
    TextField,
} from '@material-ui/core';

export default function DateRangeSelectorComponent({ setDateRange, handleClose }) {

    const [open, setOpen] = React.useState(true);
    const toggle = () => {
        handleClose();
    };

    useEffect(() => {
        setDateRange({
            startDate: startOfMonth(addMonths(new Date(), -5)),
            endDate: endOfMonth(addMonths(new Date(), 0)),
        })
    }, [])

    const getDefaultRanges = [
        {
            label: 'Today',
            startDate: new Date(),
            endDate: new Date(),
        },
        {
            label: 'Yesterday',
            startDate: addDays(new Date(), -1),
            endDate: addDays(new Date(), -1),
        },
        {
            label: 'This Week',
            startDate: startOfWeek(new Date()),
            endDate: endOfWeek(new Date()),
        },
        {
            label: 'Last Week',
            startDate: startOfWeek(addWeeks(new Date(), -1)),
            endDate: endOfWeek(addWeeks(new Date(), -1)),
        },
        {
            label: 'Last 7 Days',
            startDate: addWeeks(new Date(), -1),
            endDate: new Date(),
        },
        {
            label: 'This Month',
            startDate: startOfMonth(new Date()),
            endDate: endOfMonth(new Date()),
        },
        {
            label: 'Last Month',
            startDate: startOfMonth(addMonths(new Date(), -1)),
            endDate: endOfMonth(addMonths(new Date(), -1)),
        },
        {
            label: 'Last 6 Month',
            startDate: startOfMonth(addMonths(new Date(), -5)),
            endDate: endOfMonth(addMonths(new Date(), 0)),
        },
        {
            label: 'Last Year',
            startDate: startOfYear(addYears(new Date(), -1)),
            endDate: endOfYear(addYears(new Date(), -1)),
        },
    ];

    return (
        <DateRangePicker
            style={{ maxWidth: '3rem' }}
            open={open}
            toggle={toggle}
            onChange={(range) => {
                setDateRange(range)
            }}
            definedRanges={getDefaultRanges}
            renderInput={(props) => <TextField {...props} />}
            initialDateRange={getDefaultRanges[7]}
        />
    )
}
import React, { useState } from 'react';
import {
    Typography,
    Accordion,
    AccordionSummary
} from '@material-ui/core';
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import MaterialTable from "material-table";

export const LoanDistributionSchedule = ({ DurationScheduleDataSet, IsDefaultExpand }) => {

    const [AccordianTitle, setAccordianTitle] = useState(
        IsDefaultExpand === true ?
            "Full Loan Distribution Schedule" :
            "Please Expand to View Loan Distribution"
    )
    const [HideUserFields, setHideUserFields] = useState(false)

    function toggleUserFields(expanded) {
        setHideUserFields(!HideUserFields);
        if (expanded === false) {
            setAccordianTitle("Please Expand to View Loan Distribution")
        } else {
            setAccordianTitle("Full Loan Distribution Schedule")
        }
    };

    return (
        <Accordion
            defaultExpanded={IsDefaultExpand}
            onChange={(e, expanded) => {
                toggleUserFields(expanded)
            }}
        >
            <AccordionSummary
                expandIcon={
                    <ArrowDropDownCircleIcon
                        color="primary"
                        fontSize="large"
                    />
                }
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <div>
                    <Typography
                        color="textPrimary"
                        variant="h5"
                    >{AccordianTitle}</Typography>
                </div>
            </AccordionSummary>
            <MaterialTable
                title="Multiple Actions Preview"
                columns={[
                    { title: 'Month/Year', field: 'Month_Year' },
                    { title: 'Monthly Instalment', field: 'PaymentAmount' },
                    { title: 'Monthly Interest', field: 'IntrestPaid' },
                    { title: 'Monthly Principal', field: 'PrincipalPaid' },
                    { title: 'Capital Outstanding', field: 'MortgaeBalance' }
                ]}
                data={DurationScheduleDataSet}
                options={{
                    exportButton: false,
                    showTitle: false,
                    headerStyle: { textAlign: "left", height: '1%' },
                    cellStyle: { textAlign: "left" },
                    columnResizable: false,
                    actionsColumnIndex: -1,
                    paging: false,
                    minBodyHeight: '30rem',
                    maxBodyHeight: '30rem'
                }}
            />
        </Accordion>
    )
}
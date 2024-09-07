import React, { useState } from 'react';
import {
    Typography,
    Accordion,
    Grid,
    AccordionSummary
} from '@material-ui/core';
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import MaterialTable from "material-table";

export const LoanDetailView = ({ LoanTransactionDetails, IsDefaultExpand }) => {

    const [AccordianTitle, setAccordianTitle] = useState(
        IsDefaultExpand === true ?
            "Loan Deduction History" :
            "Please Expand to View Loan Deduction History"
    )
    const [HideUserFields, setHideUserFields] = useState(false)
    function toggleUserFields(expanded) {
        setHideUserFields(!HideUserFields);
        if (expanded === false) {
            setAccordianTitle("Please Expand to View Loan Deduction History")
        } else {
            setAccordianTitle("Loan Deduction History")
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




            {
                LoanTransactionDetails !== null && LoanTransactionDetails.length !== 0 ?
                    <Grid container spacing={3} >
                        <Grid item md={12} xs={12}>
                            <MaterialTable
                                title="Multiple Actions Preview"
                                columns={[
                                    {
                                        title: 'Created Date', field: 'createdDate',
                                        render: rowData => rowData.createdDate.split('T')[0]
                                    },
                                    {
                                        title: 'Effective Date', field: 'effectiveDate',
                                        render: rowData => rowData.effectiveDate.split('T')[0]
                                    },
                                    { title: 'Transaction Type', field: 'transactionTypeName' },
                                    { title: 'Debit Amount(Rs.)', field: 'amount' }
                                ]}
                                data={LoanTransactionDetails}
                                options={{
                                    exportButton: false,
                                    showTitle: false,
                                    headerStyle: { textAlign: "left", height: '1%' },
                                    cellStyle: { textAlign: "left" },
                                    columnResizable: false,
                                    actionsColumnIndex: -1,
                                    pageSize: 10,
                                    search: true
                                }}
                            />
                        </Grid>
                    </Grid> : < > <br /><Typography variant='h5'>No tranasaction details to show</Typography> </>
            }
        </Accordion>
    )
}
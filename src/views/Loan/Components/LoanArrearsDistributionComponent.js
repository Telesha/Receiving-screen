import React, { useState, useEffect } from 'react';
import {
    Typography,
    Accordion,
    Grid,
    AccordionSummary
} from '@material-ui/core';
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import MaterialTable from "material-table";

export const LoanArrearsDistribution = ({ LoanArrearsDetails, IsDefaultExpand }) => {

    const [IsCurrentLoan, setIsCurrentLoan] = useState({
        arrearsAmount: 0,
        arrearsFine: 0,
        arrearsInterest: 0,
        createdDate: "",
        customerLoanArrearsID: 0,
        isCurrent: true
    });
    let defaultLoanTitleString = "Please Expand to View Loan Arrears";
    const [AccordianTitle, setAccordianTitle] = useState(
        IsDefaultExpand === true ?
            "Loan Arrears View" :
            defaultLoanTitleString
    )
    const [HideUserFields, setHideUserFields] = useState(false)
    function toggleUserFields(expanded) {
        setHideUserFields(!HideUserFields);
        if (expanded === false) {
            setAccordianTitle(defaultLoanTitleString)
        } else {
            setAccordianTitle("Loan Arrears View")
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
                LoanArrearsDetails !== null && LoanArrearsDetails.length !== 0 ?
                    <Grid container spacing={3} >
                        <Grid item md={12} xs={12}>
                            <MaterialTable
                                title="Multiple Actions Preview"
                                columns={[
                                    {
                                        title: 'Created Date', field: 'createdDate',
                                        render: rowData => rowData.createdDate.split('T')[0]
                                    },
                                    { title: 'Arrears Amount', field: 'arrearsAmount' },
                                    { title: 'Arrears Fine', field: 'arrearsFine' },
                                    { title: 'Arrears Interest', field: 'arrearsInterest' }
                                ]}
                                data={LoanArrearsDetails}
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
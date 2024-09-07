import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    makeStyles,
    CardContent,
    Typography,
    InputLabel,
    TextField,
    MenuItem,
    Grid
} from '@material-ui/core';

import MaterialTable from "material-table";
import CountUp from 'react-countup';
import StarsIcon from '@material-ui/icons/Stars';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: 'white',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    grid_first_row: {
        maxHeight: '10rem'
    },
    grid_second_row: {
        maxHeight: '30rem'
    },
    grid_third_row: {
        maxHeight: '30rem'
    }
}));

export const DetailView = ({
    CustomerHistoryData,
    GetTransactionDetailsByType,
    IsDefaultAccount,
    SelectedTransactionType,
    setSelectedTransactionType,
    TransactionTypes
}) => {


    const classes = useStyles();

    function AdvancedParyemtRemarks(statusID) {
        let keyText = "";
        switch (statusID) {
            case 1:
                keyText = "Mobile Advance";
                break;
            case 2:
                keyText = "Over Advance";
                break;
            case 3:
                keyText = "Direct Advance";
                break;
            default:
                keyText = "-";
        }
        return (keyText)
    }

    function FactoryItemRemarks(statusID) {
        let keyText = "";
        switch (statusID) {
            case 1:
                keyText = "Mobile Request";
                break;
            case 2:
                keyText = "Direct Request";
                break;
            default:
                keyText = "-";
        }
        return (keyText)
    }

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const [key, value] of Object.entries(data)) {
                items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
            }
        }
        return items
    }

    return (
        <Box>
            <Grid container spacing={3} >
                <Grid item md={4} xs={12}>
                    <InputLabel shrink id="groupID">
                        Transaction Type
                    </InputLabel>

                    <TextField select
                        fullWidth
                        name="groupID"
                        variant="outlined"
                        id="groupID"
                        value={SelectedTransactionType}
                        onChange={(e) => {
                            setSelectedTransactionType(e.target.value)
                            GetTransactionDetailsByType(e.target.value)
                        }}
                    >
                        <MenuItem value="00" disabled={true}> --Select Transaction Type-- </MenuItem>
                        <MenuItem value="0">All Transactions</MenuItem>
                        {
                            generateDropDownMenu(TransactionTypes)
                        }
                    </TextField>
                </Grid>
            </Grid>
            {
                CustomerHistoryData !== null ?
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
                                    {
                                        title: 'Debit Amount(Rs.)', field: 'amount',
                                        render: rowData => rowData.entryType == 2 ? rowData.amount : "-"
                                    },
                                    {
                                        title: 'Credit Amount(Rs.)', field: 'amount',
                                        render: rowData => rowData.entryType == 1 ? rowData.amount : "-"
                                    },
                                    {
                                        title: 'Source',
                                        render: rowData => {
                                            if (rowData.transactionTypeID === 3) {
                                                return (FactoryItemRemarks(rowData.factoryItemStatusID));
                                            } else if (rowData.transactionTypeID === 2) {
                                                return (AdvancedParyemtRemarks(rowData.advancedPaymentStatusID));
                                            } else {
                                                return ("-")
                                            }
                                        }
                                    }
                                ]}
                                data={CustomerHistoryData}
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
                    </Grid> : <> <br /><Typography variant='h5'>No tranasaction details to show</Typography> </>
            }
        </Box>
    )
}
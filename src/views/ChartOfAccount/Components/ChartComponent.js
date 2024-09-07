import React, { useState, useEffect } from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import {
    Box, Grid,
    makeStyles,
} from '@material-ui/core';
import MaterialTable from 'material-table';
import IconButton from "@material-ui/core/IconButton";
import services from '../Services';
import { AlertDialog } from './../../../views/Common/AlertDialog';
import { trackPromise } from 'react-promise-tracker';
import { useAlert } from "react-alert";

const useStyles = makeStyles({
    root: {
        height: 264,
        flexGrow: 1,
        maxWidth: 400,
    },
});

export const ChartOfAccount = ({
    ChartOfAccountDetailsList, getDetails, isAuthorizedToDelete
}) => {
    const alert = useAlert();
    const classes = useStyles();
    const [message, setMessage] = useState("Delete Confirmation"

    );
    const [EnableConfirmMessage, setEnableConfirmMessage] = useState(false);
    const [DBID, setDBID] = useState();
    const [selectedAccountNameDel, setSelectedAccountNameDel] = useState(false);

    const columns = [
        { title: 'Account Code', field: 'accountNumber' },
        { title: 'Account Name', field: 'accountName' },
        { title: 'Account Type', field: 'accountType' },
        {
            title: 'Level',
            field: 'accountLevel',
            lookup: { 1: 'Level 1', 2: 'Level 2', 3: 'Level 3', 4: 'Level 4', },
        },
        // { title: 'Current Balance', field: 'accountCurrentBalance' }, need to clarify futher
        {
            title: 'Action',
            field: 'action',
            render: (rowData) =>
                <div>
                    {isAuthorizedToDelete && rowData.action > 0 && (
                        <IconButton
                            color="secondary"
                            onClick={(e) => handleDelete(rowData)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    )
                    }
                </div>
        }
    ];

    async function handleDelete(rowData) {
        setSelectedAccountNameDel(ChartOfAccountDetailsList.find(x => x.id === rowData.id).accountName)
        setDBID(rowData.id);
        setEnableConfirmMessage(true);
    }

    function confirmData(y) {
        if (y) {
            trackPromise(DeletAction(DBID))
        }
    }

    async function DeletAction(id) {
        var result = null;
        var idArray = id.split('-')
        if (idArray[1] == '1') {
            //account
            result = await services.UpdateAccountTypeStatusByAccountTypeID(idArray[0]);
        }
        else if (idArray[1] == '2') {
            //parent
            result = await services.UpdateParentHeaderStatusByParentHeaderID(idArray[0]);
        }
        else if (idArray[1] == '3') {
            //child
            result = await services.UpdateChildHeaderStatusByChildHeaderID(idArray[0]);
        }
        else {
            //ledger
            result = await services.UpdateLedgerAccountStatusByLedgerAccountID(idArray[0]);
        }
        if (result.statusCode == "Success") {
            getDetails();
            alert.success("Record Deleted Successfully");
        }
        else {
            alert.error("Error Cccurred During Record Deleting!!!");
        }

    }

    return (
        <Box>
            <MaterialTable
                title={false}
                data={ChartOfAccountDetailsList}
                columns={columns}
                parentChildData={(row, rows) => rows.find(a => a.id === row.parentId && a.accountType === row.accountType)}
                options={{
                    selection: false,
                    search: true,
                    rowStyle: rowData => ({
                        backgroundColor: (rowData.accountLevel === 1) ? '#FFF' : (rowData.accountLevel === 2) ? '#e1f5fe' : (rowData.accountLevel === 3) ? '#b3e5fc' : '#81d4fa'
                    }),
                }}
            />
            <div hidden={true}>
                <Grid item>
                    <AlertDialog confirmData={confirmData} headerMessage={message} viewPopup={EnableConfirmMessage}
                        discription={"Are you sure want to Delete " + selectedAccountNameDel} setViewPopup={setEnableConfirmMessage} />
                </Grid>
            </div>
        </Box>
    )
}
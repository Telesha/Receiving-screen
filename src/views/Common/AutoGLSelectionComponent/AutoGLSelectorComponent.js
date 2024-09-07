import React, { useState, useEffect } from 'react'
import Typography from '@material-ui/core/Typography';
import { Box, Card, makeStyles, Container, CardContent, Divider, MenuItem, Grid, InputLabel, TextField, CardHeader, Button, useIsFocusVisible, Chip } from '@material-ui/core';
import { PerfectScrollbar } from 'react-perfect-scrollbar';
import services from './Services';
import { AgriGenERPEnum } from './../AgriGenERPEnum/AgriGenERPEnum';
import { trackPromise } from 'react-promise-tracker';
import ImportantDevicesIcon from '@material-ui/icons/ImportantDevices';

export const AutoGLComponent = ({
    AutoGLRequestDetailsModel
    , SetSelectedAccountDetails }) => {
    const [CreditAccountList, setCreditAccountList] = useState([])
    const [DebitAccountList, setDebitAccountList] = useState([])
    const [SelectedAccountDetails, setSelectedAccountDetails] = useState({
        creditAccountID: 0,
        debitAccountID: 0,
    })
    const [LedgerAccountAllDetails, setLedgerAccountAllDetails] = useState({
        isMonthlyAccountsEnabledCredit: false,
        isMonthlyAccountsEnabledDebit: false,
        isGLSetup: false,
        debitAccountList: [],
        creditAccountList: []
    })

    useEffect(() => {
        trackPromise(GetLedgerAccountDetails(AutoGLRequestDetailsModel))
    }, [AutoGLRequestDetailsModel])

    useEffect(() => {
        SetSelectedAccountDetails({
            creditAccountID: SelectedAccountDetails.creditAccountID,
            debitAccountID: SelectedAccountDetails.debitAccountID,
            isMonthlyAccountsEnabledCredit: LedgerAccountAllDetails.isMonthlyAccountsEnabledCredit,
            isMonthlyAccountsEnabledDebit: LedgerAccountAllDetails.isMonthlyAccountsEnabledDebit,
            isGLSetup: LedgerAccountAllDetails.isGLSetup,
        })
    }, [SelectedAccountDetails])

    async function GetLedgerAccountDetails(autoGLRequestDetailsModel) {
        if ((autoGLRequestDetailsModel.groupID !== undefined && autoGLRequestDetailsModel.factoryID !== undefined && autoGLRequestDetailsModel.transactionTypeID !== undefined) &&
            (autoGLRequestDetailsModel.groupID !== '0' && autoGLRequestDetailsModel.factoryID !== '0' && autoGLRequestDetailsModel.transactionTypeID !== '0')
        ) {

            setLedgerAccountAllDetails({
                ...LedgerAccountAllDetails,
                isMonthlyAccountsEnabledCredit: false,
                isMonthlyAccountsEnabledDebit: false,
                isGLSetup: false,
                debitAccountList: [],
                creditAccountList: []
            })

            SetSelectedAccountDetails({
                creditAccountID: 0,
                debitAccountID: 0,
                isGLSetup: false,
                isMonthlyAccountsEnabledCredit: false,
                isMonthlyAccountsEnabledDebit: false
            })

            setSelectedAccountDetails({
                ...SelectedAccountDetails,
                creditAccountID: 0,
                debitAccountID: 0
            })

            let transactionTypeID = parseInt(autoGLRequestDetailsModel.transactionTypeID.toString())
            let groupID = parseInt(autoGLRequestDetailsModel.groupID.toString())
            let factoryID = parseInt(autoGLRequestDetailsModel.factoryID.toString())

            let response = await services.GetLedgerAccountDetailsByTransactionID(transactionTypeID, groupID, factoryID)

            if (response.data !== null) {
                setCreditAccountList(response.data.creditAccountList);
                setDebitAccountList(response.data.debitAccountList)
                setLedgerAccountAllDetails(response.data);
                setSelectedAccountDetails({
                    ...SelectedAccountDetails,
                    creditAccountID: response.data.creditAccountList.length === 1 ? response.data.creditAccountList[0].ledgerAccountID : 0,
                    debitAccountID: response.data.debitAccountList.length === 1 ? response.data.debitAccountList[0].ledgerAccountID : 0,
                })
                SetSelectedAccountDetails({
                    creditAccountID: response.data.creditAccountList.length === 1 ? response.data.creditAccountList[0].ledgerAccountID : 0,
                    debitAccountID: response.data.debitAccountList.length === 1 ? response.data.debitAccountList[0].ledgerAccountID : 0,
                    isGLSetup: response.data.isGLSetup,
                    isMonthlyAccountsEnabledCredit: response.data.isMonthlyAccountsEnabledCredit,
                    isMonthlyAccountsEnabledDebit: response.data.isMonthlyAccountsEnabledDebit
                })
            }
        }
    }

    function generateDropDownMenu(data) {
        let items = []
        if (data != null) {
            for (const iterator of data) {
                items.push(<MenuItem key={iterator.ledgerAccountID} value={iterator.ledgerAccountID}>{iterator.accountName}</MenuItem>);
            }
        }
        return items
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setSelectedAccountDetails({
            ...SelectedAccountDetails,
            [e.target.name]: value
        });
    }

    function DropdownDisable(accountList) {
        if (accountList === null) {
            return false;
        }
        if (accountList.length === 1) {
            return true;
        }
        return false;
    }

    return (
        <Grid container md={12} xs={12} style={{ padding: "15px" }} >
            <Grid item md={12} xs={12}>
                <Card hidden={LedgerAccountAllDetails.isGLSetup === false}>
                    <CardHeader
                        title={"Ledger Account Mapping"}
                    />
                    <Divider />
                    <CardContent >
                        <Grid container md={12} xs={12} spacing={1}>
                            <Grid item md={6} xs={12}>
                                <InputLabel shrink id="creditAccountID">
                                    Credit Account
                                </InputLabel>
                                {
                                    LedgerAccountAllDetails.isMonthlyAccountsEnabledCredit === true ?
                                        <>
                                            <Chip style={{ marginTop: "5px", marginLeft: "20%" }} variant="outlined" label="Monthly Credit Accounts Configured" color="secondary" icon={<ImportantDevicesIcon />} />
                                        </> :
                                        <TextField select
                                            fullWidth
                                            name="creditAccountID"
                                            onChange={(e) => handleChange(e)}
                                            value={SelectedAccountDetails.creditAccountID}
                                            variant="outlined"
                                            size="small"
                                            disabled={DropdownDisable(CreditAccountList)}
                                        >
                                            <MenuItem value="0">--Select Credit Account--</MenuItem>
                                            {generateDropDownMenu(CreditAccountList)}
                                        </TextField>
                                }
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <InputLabel shrink id="debitAccountID">
                                    Debit Account
                                </InputLabel>
                                {
                                    LedgerAccountAllDetails.isMonthlyAccountsEnabledDebit === true ?
                                        <>
                                            <Chip style={{ marginTop: "5px", marginLeft: "20%" }} variant="outlined" label="Monthly Debit Accounts Configured" color="secondary" icon={<ImportantDevicesIcon />} />
                                        </> :
                                        <TextField select
                                            fullWidth
                                            name="debitAccountID"
                                            onChange={(e) => handleChange(e)}
                                            value={SelectedAccountDetails.debitAccountID}
                                            variant="outlined"
                                            size="small"
                                            disabled={DropdownDisable(DebitAccountList)}
                                        >
                                            <MenuItem value="0">--Select Debit Account--</MenuItem>
                                            {generateDropDownMenu(DebitAccountList)}
                                        </TextField>
                                }
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}
import React, { useState, useEffect, Fragment } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    Box, Card, Grid, TextField, makeStyles, Container, Button,
    CardContent, MenuItem, Divider, InputLabel, CardHeader, Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, validateYupSchema } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import authService from '../../../utils/permissionAuth';
import tokenService from '../../../utils/tokenDecoder';
import MaterialTable from "material-table";
import { UpdateRealizedCheque } from '../PopUps/updateRealizedCheque';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    avatar: {
        marginRight: theme.spacing(2)
    },
    colorApprove: {
        backgroundColor: "green",
    },
    textCenter: {
        textAlign: 'center',
    },
    fontColors: {
        color: 'grey'
    }

}));

function cardTitle(titleName) {
    return (
        <Grid container spacing={1}>
            <Grid item md={10} xs={12}>
                {titleName}
            </Grid>
        </Grid>
    )
}

const screenCode = 'BANKRECONCILIATION';
export default function BankReconcilationViewUpdate(props) {

    const [title, setTitle] = useState("Bank Reconciliation");
    const classes = useStyles();
    const navigate = useNavigate();

    const alert = useAlert();

    const [filter, setFilter] = useState({
        groupID: 0,
        factoryID: 0,
        realized: false,
        isDue: false,
        bankLedgerAccountID: 0,
        fromDate: '',
        toDate: ''
    });

    const [permissionList, setPermissions] = useState({
        isGroupFilterEnabled: false,
        isFactoryFilterEnabled: false
    });
    const [groups, setGroups] = useState();
    const [factories, setFactories] = useState();   
    const [bankReconciliationData, setBankReconciliationData] = useState([]);
    const [accountTypeNames, setAccountTypeNames] = useState();
    const [openUpdateRealizedCheque, setOpenUpdateRealizedCheque] = useState(false);
    const [startDateRange, setStartDateRange] = useState(new Date());
    const [endDateRange, setEndDateRange] = useState(new Date());
    const [realizingChequeModalData, setRealizingChequeModalData] = useState({
        chequeNumber: 0,
        voucherCode: 0,
        referenceNumber: false,
        creditAmount: false,
        debitAmount: 0,
        date: '',
        dueDate: '',
        createdDate: ''
    });

    useEffect(() => {
        trackPromise(getGroupsForDropdown(), getPermission());
    }, []);

    useEffect(() => {
        if (filter.groupID > 0) {
            trackPromise(getFactoriesForDropDown());
        }
    }, [filter.groupID]);

    useEffect(() => {
        if (filter.factoryID > 0) {
            getBankDetailsForDropdown();
        }
    }, [filter.factoryID]);

    async function getPermission() {
        var permissions = await authService.getPermissionsByScreen(screenCode);
        var isAuthorized = permissions.find(p => p.permissionCode == 'VIEWBANKRECONCILIATION');

        if (isAuthorized === undefined) {
            navigate('/404');
        }
        var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
        var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

        setPermissions({
            ...permissionList,
            isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
            isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined
        });

        setFilter({
            ...filter,
            groupID: parseInt(tokenService.getGroupIDFromToken()),
            factoryID: parseInt(tokenService.getFactoryIDFromToken())
        })
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

    async function getGroupsForDropdown() {
        const groups = await services.getAllGroups();
        setGroups(groups);
    }

    async function getFactoriesForDropDown() {
        const factory = await services.getFactoryByGroupID(filter.groupID);
        setFactories(factory);
    }

    async function getBankDetailsForDropdown() {
        const banks = await services.getBankDetailsForDropdown(filter.groupID, filter.factoryID);
        setAccountTypeNames(banks);
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.value
        setFilter({
            ...filter,
            [e.target.name]: value
        });
    }

    const isDueEnabledHandleChange = () => {
        if (filter.realized == true) {
            setFilter({
                ...filter,
                isDue: !filter.isDue,
                realized: false
            });
        }
        else {
            setFilter({
                ...filter,
                isDue: !filter.isDue
            });
        }


    };

    const realizedEnabledHandleChange = () => {
        if (filter.isDue == true) {
            setFilter({
                ...filter,
                realized: !filter.realized,
                isDue: false
            });
        }
        else {
            setFilter({
                ...filter,
                realized: !filter.realized
            });
        }
    };

    async function GetDetails() {
        let model = {
            groupID: parseInt(filter.groupID),
            factoryID: parseInt(filter.factoryID),
            BankLedgerAccountID: parseInt(filter.bankLedgerAccountID),
            isDue: filter.isDue,
            realized: filter.realized,
            fromDate: startDateRange.toLocaleDateString(),
            toDate: endDateRange.toLocaleDateString()
        }
        const bankData = await services.GetBankReconciliationData(model);

        if (bankData.statusCode == "Success" && bankData.data != null) {

            setBankReconciliationData(bankData.data);
        }
        else {
            setBankReconciliationData([])
            alert.error(bankData.message);
        }
    }

    async function handleClickEdit(rowData) {

        let realizingChequeModalData = {
            chequeNumber: rowData.chequeNumber,
            voucherCode: rowData.voucherCode,
            referenceNumber: rowData.referenceNumber,
            creditAmount: rowData.credit,
            debitAmount: rowData.debit,
            date: rowData.date,
            dueDate: rowData.dueDate,
            ledgerTransactionID: rowData.ledgerTransactionID,
            createdDate: rowData.createdDate
        }
        setRealizingChequeModalData(realizingChequeModalData)
        setOpenUpdateRealizedCheque(!openUpdateRealizedCheque)
    }

    function onUpdateRealizedChequeClose() {
        setOpenUpdateRealizedCheque(!openUpdateRealizedCheque);
        GetDetails();
    }

    return (

        <Fragment>
            <LoadingComponent />
            <Page className={classes.root} title={title}>
                <Container maxWidth={false}>
                    <Formik
                        initialValues={{
                            groupID: filter.groupID,
                            factoryID: filter.factoryID,
                            bankLedgerAccountID: filter.bankLedgerAccountID,
                            isDue: filter.isDue,
                            realized: filter.realized,
                        }}
                        validationSchema={
                            Yup.object().shape({
                                groupID: Yup.number().required('Group is required').min('1', 'Group is required'),
                                factoryID: Yup.number().required('Estate is required').min('1', 'Estate is required'),
                                bankLedgerAccountID: Yup.number().required('Bank is required').min('1', 'Bank is Required'),
                            })
                        }
                        enableReinitialize
                        onSubmit={() => trackPromise(GetDetails())}
                    >
                        {({
                            errors,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            touched,
                            values,
                            props
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box mt={0}>
                                    <Card>
                                        <PerfectScrollbar>
                                            <CardHeader
                                                title={cardTitle(title)}
                                            />
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={3}>
                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="groupID">
                                                            Group *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.groupID && errors.groupID)}
                                                            fullWidth
                                                            helperText={touched.groupID && errors.groupID}
                                                            name="groupID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={filter.groupID}
                                                            variant="outlined"
                                                            id="groupID"
                                                            disabled={!permissionList.isGroupFilterEnabled}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Group--</MenuItem>
                                                            {generateDropDownMenu(groups)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="factoryID">
                                                            Estate *
                                                        </InputLabel>
                                                        <TextField select
                                                            error={Boolean(touched.factoryID && errors.factoryID)}
                                                            fullWidth
                                                            helperText={touched.factoryID && errors.factoryID}
                                                            name="factoryID"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => handleChange(e)}
                                                            value={filter.factoryID}
                                                            variant="outlined"
                                                            id="factoryID"
                                                            disabled={!permissionList.isFactoryFilterEnabled}
                                                            size='small'
                                                        >
                                                            <MenuItem value="0">--Select Estate--</MenuItem>
                                                            {generateDropDownMenu(factories)}
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item md={4} xs={8}>
                                                        <InputLabel shrink id="accountTypeID">
                                                            Bank Account *
                                                        </InputLabel>

                                                        <TextField
                                                            select
                                                            error={Boolean(
                                                                touched.bankLedgerAccountID &&
                                                                errors.bankLedgerAccountID
                                                            )}
                                                            helperText={
                                                                touched.bankLedgerAccountID &&
                                                                errors.bankLedgerAccountID
                                                            }
                                                            onBlur={handleBlur}
                                                            name="bankLedgerAccountID"
                                                            size='small'
                                                            onChange={e => handleChange(e)}
                                                            value={filter.bankLedgerAccountID}
                                                            variant="outlined"
                                                            id="bankLedgerAccountID"

                                                            fullWidth
                                                        >
                                                            <MenuItem value="0">
                                                                --Select Account Type Name--
                                                            </MenuItem>
                                                            {generateDropDownMenu(accountTypeNames)}
                                                        </TextField>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="date">From Date *</InputLabel>

                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                fullWidth
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                id="date-picker-inline"
                                                                value={startDateRange}
                                                                onChange={(e) => { setStartDateRange(e) }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>

                                                    <Grid item md={4} xs={12}>
                                                        <InputLabel shrink id="date">To Date *</InputLabel>

                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                fullWidth
                                                                variant="inline"
                                                                format="dd/MM/yyyy"
                                                                margin="dense"
                                                                id="date-picker-inline"
                                                                value={endDateRange}
                                                                onChange={(e) => { setEndDateRange(e) }}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                autoOk
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>

                                                    <Grid item md={2} xs={8}>
                                                        <InputLabel shrink id="groupID">
                                                            Is Due
                                                        </InputLabel>
                                                        <Switch
                                                            checked={filter.isDue}
                                                            onChange={isDueEnabledHandleChange}
                                                            name="isDue"
                                                            disabled={false}
                                                        />
                                                    </Grid>
                                                    <Grid item md={2} xs={8}>
                                                        <InputLabel shrink id="groupID">
                                                            Realized
                                                        </InputLabel>
                                                        <Switch
                                                            checked={filter.realized}
                                                            onChange={realizedEnabledHandleChange}
                                                            name="realized"
                                                            disabled={false}
                                                        />
                                                    </Grid>
                                                    <Grid container justify="flex-end">
                                                        <Box pr={2}>
                                                            <Button
                                                                color="primary"
                                                                variant="contained"
                                                                type="submit"
                                                                size='small'
                                                            >
                                                                Search
                                                            </Button>
                                                        </Box>
                                                    </Grid>

                                                </Grid>
                                                <br />
                                                <Box minWidth={1050}>
                                                    {bankReconciliationData.length > 0 ?
                                                        <MaterialTable
                                                            title="Bank reconciliation data"
                                                            columns={[
                                                                { title: 'Date', field: 'date', render: rowData => { if (rowData.date != null) return rowData.date.split('T')[0] } },
                                                                { title: 'Voucher Number', field: 'referenceNumber' },
                                                                { title: 'Description', field: 'description' },
                                                                { title: 'Checq No', field: 'chequeNumber' },
                                                                { title: 'Credit', field: 'credit' },
                                                                { title: 'Debit', field: 'debit' },
                                                                { title: 'Due Date', render: rowData => { if (rowData.dueDate != null) return rowData.dueDate.split('T')[0] } },
                                                                { title: 'Realized Date', render: rowData => { if (rowData.realizedDate != null) return rowData.realizedDate.split('T')[0] } }
                                                            ]}
                                                            data={bankReconciliationData}
                                                            options={{
                                                                exportButton: false,
                                                                showTitle: false,
                                                                headerStyle: { textAlign: "left", height: '1%' },
                                                                cellStyle: { textAlign: "left" },
                                                                columnResizable: false,
                                                                actionsColumnIndex: -1,
                                                                pageSize: 10
                                                            }}
                                                            actions={[
                                                                {
                                                                    icon: 'edit',
                                                                    tooltip: 'Edit',
                                                                    onClick: (event, rowData) => handleClickEdit(rowData)
                                                                }
                                                            ]}
                                                        /> : null}
                                                </Box>
                                            </CardContent>
                                        </PerfectScrollbar>
                                    </Card>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Container>
                <UpdateRealizedCheque open={openUpdateRealizedCheque} onUpdateRealizedChequeClose={onUpdateRealizedChequeClose} realizingChequeModalData={realizingChequeModalData} />
            </Page>
        </Fragment>
    );
}